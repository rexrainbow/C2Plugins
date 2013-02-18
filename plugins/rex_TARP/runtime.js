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
	    this.recorder = new cr.plugins_.Rex_TARP.RecorderKlass(this);
	    this.player = new cr.plugins_.Rex_TARP.PlayerKlass(this); 
	};
    	
	instanceProto.onDestroy = function ()
	{
        this.player.Stop();
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
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
		{
		    this.recorder.Setup(timeline);
            this.player.Setup(timeline);       
	    }
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
}());

(function ()
{
    // recorder
    cr.plugins_.Rex_TARP.RecorderKlass = function(plugin)
    {
	    this.plugin = plugin;
        this.recorder_list = [];		
        this.dt_start = 0;	
        this.wallclock = new WallClockKlass();		
    };
    var RecorderKlassProto = cr.plugins_.Rex_TARP.RecorderKlass.prototype;
        
    RecorderKlassProto.Setup = function (timeline_obj)
    {
	    this.wallclock.Init(this.plugin, timeline_obj);
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
    
    // player
    cr.plugins_.Rex_TARP.PlayerKlass = function(plugin)
    {
        this.plugin = plugin;
        this.timeline = null; 		
        this.timer = null; 
        this.player_list = [];
        this.play_index = 0;
        this.offset = 0;
        this.current_cmd = null;
        this.wallclock = new WallClockKlass();			
    };
    var PlayerKlassProto = cr.plugins_.Rex_TARP.PlayerKlass.prototype;
    
    PlayerKlassProto.Setup = function (timeline_obj)
    {
        this.timeline = timeline_obj;
		this.wallclock.Init(this.plugin, timeline_obj);
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
                this.timer = this.timeline.CreateTimer(this, this._run);
            }
            this.timer.Start(this.current_cmd[0] + this.offset);
			this.wallclock.current_time_get();
        }
        else
        {
            this.plugin.runtime.trigger(cr.plugins_.Rex_TARP.prototype.cnds.OnEnd, this.plugin);
        }
	};
	PlayerKlassProto._run = function()
	{
        var name = this.current_cmd[1], params = this.current_cmd[2];
        var has_fnobj = this.timeline.RunCallback(name, params, true);
        assert2(has_fnobj, "Worksheet: Can not find callback oject.");
        this._start_cmd();        
	};	
	
	
	var WallClockKlass = function(plugin, timeline)
	{
	    this.plugin = null;
	    this.timeline = null;	
		
		this.sample_time = {tick:null, time:null};	
        this.start_time = 0;
        this.pause_sum = 0;
	};
	var WallClockKlassProto = WallClockKlass.prototype;
	
    WallClockKlassProto.Init = function (plugin, timeline)
    {
	    this.plugin = plugin;
	    this.timeline = timeline;
		
		this.sample_time.tick = null;
		this.sample_time.time = null;	
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
        if (cur_tick != this.sample_time.tick)
		{
		    this.sample_time.time = this.timeline.TimeGet();
			this.sample_time.tick = cur_tick;
		}
		return this.sample_time.time;
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
	    var t = this.sample_time.time;
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
}());        