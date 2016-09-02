// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_TARP = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_TARP.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{ 
        this.timeline = null;  
        this.timelineUid = -1;    // for loading          	    
	    this.recorder = new cr.plugins_.Rex_TARP.RecorderKlass(this);
	    this.player = new cr.plugins_.Rex_TARP.PlayerKlass(this); 
	};
    	
	instanceProto.onDestroy = function ()
	{
        this.player.Stop();
	};    
    instanceProto._timeline_get = function ()
    {
        if (this.timeline != null)
            return this.timeline;
    
        assert2(cr.plugins_.Rex_TimeLine, "TARP: Can not find timeline oject.");
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Rex_TimeLine.prototype.Instance)
            {
                this.timeline = inst;
                return this.timeline;
            }
        }
        assert2(this.timeline, "TARP: Can not find timeline oject.");
        return null;	
    };

	instanceProto.saveToJSON = function ()
	{    
		return { "tluid": (this.timeline != null)? this.timeline.uid: (-1),
		         "r": this.recorder.saveToJSON(),
                 "p": this.player.saveToJSON(),
                };
	};
    
	instanceProto.loadFromJSON = function (o)
	{    
	    this.timelineUid = o["tluid"];
	    this.recorder.loadFromJSON(o["r"]);
	    this.player.loadFromJSON(o["p"]);
	};
    
	instanceProto.afterLoad = function ()
	{
		if (this.timelineUid === -1)
			this.timeline = null;
		else
		{
			this.timeline = this.runtime.getObjectByUID(this.timelineUid);
			assert2(this.timeline, "TARP: Failed to find timeline object by UID");
		}	
		this.timelineUid = -1;
		
		this.recorder.afterLoad();
	    this.player.afterLoad();       
	}; 	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnEnd = function ()
	{
		return true;
	};  

	Cnds.prototype.IsPlaying = function ()
	{
	    var timer = this.player.timer;
		return ((timer)? timer.IsActive():false);
	};      

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
      
	// setup
    Acts.prototype.Setup = function (timeline_objs)
	{  
        var timeline = timeline_objs.getFirstPicked();
        if (timeline.check_name == "TIMELINE")
            this.timeline = timeline;        
        else
            alert ("TARP should connect to a timeline object");   
	}; 	
	
    // recorder
    Acts.prototype.RecorderStart = function ()
	{   
	    this.recorder.Start();
	};   
    Acts.prototype.RecordAction = function (offset, name, params)
	{   
	    this.recorder.Write(name, params, offset);
	};
    Acts.prototype.RecordPause = function ()
	{
	    this.recorder.Pause();  
	};	
    Acts.prototype.RecorderResume = function ()
	{
	    this.recorder.Resume();  	    
	};		
	
	// player	
    Acts.prototype.PlayerLoad = function (JSON_recorder_list)
	{   
	    this.player.JSON2List(JSON_recorder_list);
	};
    Acts.prototype.PlayStart = function (offset)
	{   
	    this.player.Start(offset);
	};   
    Acts.prototype.PlayerStop = function ()
	{  
	    this.player.Stop();	     
	};       
    Acts.prototype.PlayerPause = function ()
	{
	    this.player.Pause();	  	    
	};
    Acts.prototype.PlayerResume = function ()
	{
	    this.player.Resume();	 
	};	
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
    Exps.prototype.LatestRecordTime = function (ret)
	{
	    ret.set_float( this.recorder.LatestRecordTimeGet() );
	};	
	
    Exps.prototype.RecorderElapsedTime = function (ret)
	{
	    ret.set_float( this.recorder.ElapsedTimeGet() );
	};		
	
    Exps.prototype.LatestPlayTime = function (ret)
	{
	    ret.set_float( this.player.LatestPlayTimeGet() );
	};	
	
    Exps.prototype.PlayerElapsedTime = function (ret)
	{
	    ret.set_float( this.player.ElapsedTimeGet() );
	};			
	
    Exps.prototype.RecorderList = function (ret)
	{
	    ret.set_string( this.recorder.List2JSON() );
	};
    Exps.prototype.Offset = function (ret)
	{
	    ret.set_float( this.player.offset );
	};
	
	
    Exps.prototype.Export2Scenario = function (ret)
	{
	    var raw_list = this.recorder.recorder_list, raw_line;
	    var out_list=[], out_line;
	    var i, raw_cnt=raw_list.length;
	    var j, params, p_cnt;
	    for (i=0; i<raw_cnt; i++)
	    {
	        raw_line = raw_list[i];
	        out_line = [raw_line[0], raw_line[1]];
	        params = raw_line[2];
	        p_cnt = params.length;
	        for (j=0; j<p_cnt; j++)
	        {
	            out_line.push(params[j]);
	        }
	        out_list.push(out_line);
	    }
	    ret.set_string( JSON.stringify(out_list) );
	};		
}());

(function ()
{
    // recorder
    cr.plugins_.Rex_TARP.RecorderKlass = function(plugin)
    {
	    this.plugin = plugin;
        this.recorder_list = [];		
        this.dt_start = 0;	
        this.wallclock = new WallClockKlass(plugin);		
    };
    var RecorderKlassProto = cr.plugins_.Rex_TARP.RecorderKlass.prototype;
        
    RecorderKlassProto.Setup = function (timeline_obj)
    {
	    this.wallclock.Init(this.plugin);
    };   
    RecorderKlassProto.Start = function ()
    {
	    this.recorder_list.length = 0;
	    this.wallclock.Start();
        this.dt_start = this.wallclock.current_time_get();
    };
    RecorderKlassProto.Write = function (name_, params_, offset)
    {
        if (this.dt_pause != null)
            return;
            
        var cur_time = this.wallclock.current_time_get() + offset;
        var dt = cur_time - this.dt_start;
        var params = [];
        cr.shallowAssignArray(params, params_)
        this.recorder_list.push([dt, name_, params]);
        this.dt_start = cur_time;
    };
    RecorderKlassProto.Pause = function ()
    {
        this.wallclock.Pause();
    };      
    RecorderKlassProto.Resume = function ()
    {
        this.wallclock.Resume();
    }; 
    RecorderKlassProto.List2JSON = function ()
    {
        return JSON.stringify(this.recorder_list)
    };
    RecorderKlassProto.LatestRecordTimeGet = function ()
    {
	    return this.wallclock.SampleTimeGet();
    };	
    RecorderKlassProto.ElapsedTimeGet = function ()
    {
        return this.wallclock.ElapsedTimeGet();
    };	    
	RecorderKlassProto.saveToJSON = function ()
	{    
		return { "l": this.recorder_list,
                 "dts": this.dt_start,
                 "wc": this.wallclock.saveToJSON(),
                };
	};
	RecorderKlassProto.loadFromJSON = function (o)
	{    
        this.recorder_list = o["l"];
        this.dt_start = o["dts"];
        this.wallclock.loadFromJSON(o["wc"]);
	};
	RecorderKlassProto.afterLoad = function ()
	{
		this.wallclock.afterLoad();
	}; 
	
    // player
    cr.plugins_.Rex_TARP.PlayerKlass = function(plugin)
    {
        this.plugin = plugin;	
        this.timer = null; 
        this.player_list = [];
        this.play_index = 0;
        this.offset = 0;
        this.current_cmd = null;
        this.wallclock = new WallClockKlass(plugin);  		
    };
    var PlayerKlassProto = cr.plugins_.Rex_TARP.PlayerKlass.prototype;
    
    PlayerKlassProto.Setup = function (timeline_obj)
    {
		this.wallclock.Init(this.plugin);
    };    
    PlayerKlassProto.JSON2List = function (JSON_string)
    {
        this.player_list = JSON.parse(JSON_string);
    };    
    PlayerKlassProto.Start = function (offset)
    {
        this.offset = offset;   
        this.play_index = 0;   
		this.wallclock.Start();		
        this._start_cmd();
    };
    PlayerKlassProto.Stop = function ()
    {
        if (this.timer)
            this.timer.Remove();        
    };  
    PlayerKlassProto.Pause = function ()
    {
        if (this.timer)
            this.timer.Suspend();   

        this.wallclock.Pause();			
    };      
    PlayerKlassProto.Resume = function ()
    {
        if (this.timer)
            this.timer.Resume(); 

        this.wallclock.Resume();			
    }; 
    PlayerKlassProto.LatestPlayTimeGet = function ()
    {
	    return this.wallclock.SampleTimeGet();
    };	
    PlayerKlassProto.ElapsedTimeGet = function ()
    {
        return this.wallclock.ElapsedTimeGet();
    };	    
    
	PlayerKlassProto._start_cmd = function()
	{
        if (this.player_list.length > this.play_index)
        {
            this.current_cmd = this.player_list[this.play_index];
            this.play_index += 1;
            if (this.timer== null)
            {
                this.timer = this.plugin._timeline_get().CreateTimer(on_timeout);
                this.timer.plugin = this;
            }
            this.timer.Start(this.current_cmd[0] + this.offset);
			this.wallclock.current_time_get();
        }
        else
        {
            this.plugin.runtime.trigger(cr.plugins_.Rex_TARP.prototype.cnds.OnEnd, this.plugin);
        }
	};
	
    // handler of timeout for timers in this plugin, this=timer   
    var on_timeout = function ()
    {
        this.plugin.run();
    };
    
	PlayerKlassProto.run = function()
	{
        var name = this.current_cmd[1];
        var params = this.current_cmd[2];
        this.plugin._timeline_get().RunCallback(name, params, true);
        this._start_cmd();        
	};	
	PlayerKlassProto.saveToJSON = function ()
	{    
		return { "tim": (this.timer != null)? this.timer.saveToJSON() : null,
                 "l": this.player_list,
                 "i": this.play_index,
                 "off": this.offset,
                 "cmd": this.current_cmd,
                 "wc": this.wallclock.saveToJSON(),
                };
	};
	PlayerKlassProto.loadFromJSON = function (o)
	{
        this.timer_save = o["tim"]; 
        this.player_list = o["l"]; 
        this.play_index = o["i"]; 
        this.offset = o["off"]; 
        this.current_cmd = o["cmd"]; 
        this.wallclock.loadFromJSON(o["wc"]);
	};
	PlayerKlassProto.afterLoad = function ()
	{
        if (this.timer_save == null)
            this.timer = null;
        else
        {
            this.timer = this.plugin._timeline_get().LoadTimer(this.timer_save, on_timeout);
            this.timer.plugin = this;
        }     
        this.timers_save = null;
        
        this.wallclock.afterLoad();
	}; 
	
	var WallClockKlass = function(plugin)
	{
	    this.plugin = plugin;
		this.sample_time = {"tick":null, "time":null};	
        this.start_time = 0;
        this.pause_sum = 0;
	};
	var WallClockKlassProto = WallClockKlass.prototype;
	
    WallClockKlassProto.Init = function ()
    {        
		this.sample_time["tick"] = null;
		this.sample_time["time"] = null;	
        this.start_time = 0;
        this.pause_sum = 0;
    };	
    WallClockKlassProto.Start = function ()
    {
		this.start_time = this.current_time_get();
        this.dt_pause = null;
		this.pause_sum = 0;
    };
    WallClockKlassProto.current_time_get = function ()
    {
	    assert2(this.plugin, "TARP: remember to assign timeline object at start of layout");
        var cur_tick = this.plugin.runtime.tickcount;
        if (cur_tick != this.sample_time["tick"])
		{
		    this.sample_time["time"] = this.plugin._timeline_get().TimeGet();
			this.sample_time["tick"] = cur_tick;
		}
		return this.sample_time["time"];
    };	
	WallClockKlassProto.Pause = function ()
    {
        if (this.dt_pause != null)
            return;
            
        this.dt_pause = this.current_time_get();
    };      
    WallClockKlassProto.Resume = function ()
    {
        var dt = this.current_time_get() - this.dt_pause;
        this.dt_pause = null;
        this.pause_sum += dt;
    }; 
    WallClockKlassProto.SampleTimeGet = function ()
    {
	    var t = this.sample_time["time"];
		if (t == null)
		    t = 0.0;
	    else
		    t = t - this.start_time;
	    return t;
    };		
    WallClockKlassProto.ElapsedTimeGet = function ()
    {
        return this.current_time_get() - this.start_time - this.pause_sum;
    };		
	WallClockKlassProto.saveToJSON = function ()
	{    
		return { "samptim": this.sample_time,
                 "st": this.player_list,
                 "ps": this.pause_sum,
                };
	};
	WallClockKlassProto.loadFromJSON = function (o)
	{	    
		this.sample_time = o["samptim"];	
        this.start_time = o["st"];
        this.pause_sum = o["ps"];
	};
	WallClockKlassProto.afterLoad = function ()
	{
	}; 	
}());        