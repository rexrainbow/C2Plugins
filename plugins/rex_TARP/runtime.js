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
	    this.recorder = new cr.plugins_.Rex_TARP.RecorderKlass();
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
      
    // recorder
    Acts.prototype.RecorderStart = function ()
	{   
	    this.recorder.Start();
	};   
    Acts.prototype.RecordAction = function (name, params)
	{   
	    this.recorder.Write(name, params);
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
    Acts.prototype.PlayerSetup = function (timeline_objs)
	{  
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.player.Setup(timeline);       
        else
            alert ("TARP should connect to a timeline object");
	}; 	
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
    cr.plugins_.Rex_TARP.RecorderKlass = function()
    {
        this.recorder_list = [];
        this.start_time = 0;
        this.pause_time = null;      
    };
    var RecorderKlassProto = cr.plugins_.Rex_TARP.RecorderKlass.prototype;
    
    RecorderKlassProto.Start = function ()
    {
        this.start_time = Date.now();
        this.recorder_list.length = 0;
        this.pause_time = null;
    };
    RecorderKlassProto.Write = function (name_, params_)
    {
        if (this.pause_time != null)
            return;
            
        var cur_time = Date.now();
        var dt = cur_time - this.start_time;
        var params = [];
        cr.shallowAssignArray(params, params_)
        this.recorder_list.push([dt, name_, params]);
        this.start_time = cur_time;
    };
    RecorderKlassProto.Pause = function ()
    {
        if (this.pause_time != null)
            return;
            
        this.pause_time = Date.now();
    };      
    RecorderKlassProto.Resume = function ()
    {
        var dt = Date.now() - this.pause_time;
        this.start_time += dt;
        this.pause_time = null;
    }; 
    RecorderKlassProto.List2JSON = function ()
    {
        return JSON.stringify(this.recorder_list)
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
        this.pre_abs_time = 0;
    };
    var PlayerKlassProto = cr.plugins_.Rex_TARP.PlayerKlass.prototype;
    
    PlayerKlassProto.Setup = function (timeline_obj)
    {
        this.timeline = timeline_obj;
    };    
    PlayerKlassProto.JSON2List = function (JSON_string)
    {
        this.player_list = JSON.parse(JSON_string);
    };    
    PlayerKlassProto.Start = function (offset)
    {
        this.offset = offset;   
        this.play_index = 0;     
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
    };      
    PlayerKlassProto.Resume = function ()
    {
        if (this.timer)
            this.timer.Resume();        
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
            this.timer.Start((this.current_cmd[0]/1000.0) + this.offset);
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
}());        