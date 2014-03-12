// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_audio_helper = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_audio_helper.prototype;
		
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
    
    var fake_ret = {
        value:0,
        set_any: function(value){this.value=value;},
        set_int: function(value){this.value=value;},
        set_float: function(value){this.value=value;}, 
        set_string: function(value) {this.value=value;},
    };
    
    // --------	
	function dbToLinear(x)
	{
		var v = dbToLinear_nocap(x);
		if (v < 0)
			v = 0;
		if (v > 1)
			v = 1;
		return v;
	};
	
	function linearToDb(x)
	{
		if (x < 0)
			x = 0;
		if (x > 1)
			x = 1;
		return linearToDb_nocap(x);
	};
	
	function dbToLinear_nocap(x)
	{
		return Math.pow(10, x / 20);
	};
	
	function linearToDb_nocap(x)
	{
		return (Math.log(x) / Math.log(10)) * 20;
	};
    
    var MAXDB = 0;    // map 0db to volume 1
    var MINDB = -60;  // map -60db to volume 0
    var LinearScaleToDb = function(x)
    {
        x = cr.clamp(x, 0, 1);
        var db = MINDB*(1-x);
        return db;
    };
    var DbToLinearScale = function(x)
    {
        var v = (MINDB-x)/MINDB;
        v = cr.clamp(v, 0, 1);
        return v;
    };
    
	instanceProto.onCreate = function()
	{
        this.audio = null;
        
	    this.my_timescale = -1.0;
	    this.runtime.tickMe(this);
	    this.tasksMgr = new cr.plugins_.Rex_audio_helper.TaskMgrKlass(this);
	};
    
    instanceProto._audio_get = function ()
    {
        if (this.audio != null)
            return this.audio;

        assert2(cr.plugins_.Audio, "Audio Helper: Can not find Audio oject.");
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Audio.prototype.Instance)
            {
                this.audio = inst;
                return this.audio;
            }
        }
        assert2(this.audio, "Audio Helper: Can not find Audio oject.");
        return null; 
    };

    instanceProto.tick = function()
    {
        this.tasksMgr.tick();
    }; 

    instanceProto.task_VolFade = function(task)
    {
        var dt = this.runtime.getDt(this);
        if (dt == 0)
            return true;
         
        var s = task.slope * dt;
        task.current += s;        
        var is_hit = (task.slope > 0)?  (task.current >= task.target) : (task.current <= task.target);
        
        if (is_hit)
        {
            if (task.destroy_on_hit)
                this.AudioStop(task.tag);
            else
                this.AudioSetVolumeDB(task.tag, task.target);
        }
        else
        {
            this.AudioSetVolumeDB(task.tag, task.current);
        }
        return (!is_hit);
    };

    instanceProto.FadeTaskSet = function (tag, start, end, time, destroy_on_hit, task_name, is_reuse)
	{
        var task, is_found=false;
        if (is_reuse == true)
        {
            var tasks = this.tasksMgr.tasks;
            var i, cnt=tasks.length;
            for (i=0; i<cnt; i++)
            {
                task = tasks[i];
                if ((task.tag == tag) && (task.name == task_name))
                {
                    is_found = true;
                    break;
                }
            }
        }
        if (!is_found)
        {
            task = this.tasksMgr.AddTask(this, this.task_VolFade);  
        }
            
        task.tag = tag;       
        task.target = end;      
        task.current = start;
        task.slope = (task.target - task.current)/time; 
        task.destroy_on_hit = destroy_on_hit;
        task.name = task_name;
	};
    // --------
    instanceProto.AudioSetVolumeDB = function (tag, vol)
	{
       var audio = this._audio_get();       
       cr.plugins_.Audio.prototype.acts.SetVolume.call(audio, tag, vol);
	};
    instanceProto.AudioGetVolumeDB = function (tag)
	{
	   var audio = this._audio_get();
       cr.plugins_.Audio.prototype.exps.Volume.call(audio, fake_ret, tag);
       return fake_ret.value;
	};    
    instanceProto.AudioStop = function (tag)
	{     
       var audio = this._audio_get();    
       cr.plugins_.Audio.prototype.acts.Stop.call(audio, tag);
	};  
	

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Play = function (file, looping, vol, tag, fadeIn_time)
	{     
       var audio = this._audio_get();       
       var voldb = LinearScaleToDb(vol);
       
       cr.plugins_.Audio.prototype.acts.Play.call(audio, file, looping, voldb, tag);
       
       if ((fadeIn_time > 0) && (voldb > MINDB))
       {
           this.FadeTaskSet(tag, MINDB, voldb, fadeIn_time, false, "play", false);
       }
	};
    
    Acts.prototype.Stop = function (tag, fadeOut_time)
	{  
	   var current_voldb = this.AudioGetVolumeDB(tag); 
       if ((fadeOut_time == 0) || (current_voldb <= MINDB))
       {
           this.AudioStop(tag);
       }
       else
       {
           this.FadeTaskSet(tag, current_voldb, MINDB, fadeOut_time, true, "stop", false);
       }
	};    
    
	Acts.prototype.SetVolume = function (tag, vol, fade_time)
	{
       var voldb = LinearScaleToDb(vol);
       var current_voldb = this.AudioGetVolumeDB(tag); 
       if ((fade_time > 0) && (voldb != current_voldb))
       {
           this.FadeTaskSet(tag, current_voldb, voldb, fade_time, false, "fade", true);       
       }
	};
    
    Acts.prototype.PlayByName = function (folder, filename, looping, vol, tag, fadeIn_time)
	{     
       var audio = this._audio_get();       
       var voldb = LinearScaleToDb(vol);
       
       cr.plugins_.Audio.prototype.acts.PlayByName.call(audio, folder, filename, looping, voldb, tag);
       
       if ((fadeIn_time > 0) && (voldb > MINDB))
       {
           this.FadeTaskSet(tag, MINDB, voldb, fadeIn_time, false, "play", false);                   
       }
	};    
    
    Acts.prototype.Preload = function (file_name)
	{     
       var audio = this._audio_get();
       cr.plugins_.Audio.prototype.acts.Preload.call(audio, file_name);
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());

(function ()
{
    cr.plugins_.Rex_audio_helper.TaskMgrKlass = function(plugin)
    {                        
        this.plugin = plugin;
        this.tasks = [];
        this.tasks_tmp = [];
    };
    var TaskMgrKlassProto = cr.plugins_.Rex_audio_helper.TaskMgrKlass.prototype;
    
	TaskMgrKlassProto.tick = function()
	{     
	    if (this.tasks.length == 0)
	        return;
	        
        cr.shallowAssignArray(this.tasks_tmp, this.tasks);  
        this.tasks.length = 0;
        var i,cnt=this.tasks_tmp.length;
        var task, is_continue;
        for (i=0; i<cnt; i++)
        {
            task = this.tasks_tmp[i];
            is_continue = task.DoHandle();
            if (is_continue)
                this.tasks.push(task);            
        } 
        this.tasks_tmp.length = 0;
    };   
       
    TaskMgrKlassProto.AddTask = function(thisArg, call_back_fn)
    {
        var task = new cr.plugins_.Rex_audio_helper.TaskKlass(thisArg, call_back_fn);
        this.tasks.push(task);
        return task;
    };
    
    cr.plugins_.Rex_audio_helper.TaskKlass = function(thisArg, call_back_fn)
    {                        
        this.__thisArg = thisArg;
        this.__call_back_fn = call_back_fn;
    };
    var TaskKlassProto = cr.plugins_.Rex_audio_helper.TaskKlass.prototype;
    
	TaskKlassProto.DoHandle = function()
	{  
	    var is_continue = this.__call_back_fn.call(this.__thisArg, this);
	    return is_continue;
    };   
}());   