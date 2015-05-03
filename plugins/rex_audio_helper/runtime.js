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
	    this.pauseTag2Db = {};
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

    // ---- task ----
    var PRIORITY_FADE = 0;
    var PRIORITY_PAUSE = 2;
    var PRIORITY_STOP = 10;
    instanceProto.FadeTaskSet = function (task, start, end, time_)
	{
        task.target = end;      
        task.current = start;
        task.slope = (end - start)/time_; 
        task.TickHandlerSet("TaskFade");
	};
    instanceProto["TaskFade"] = function(task)
    {
        var dt = this.runtime.getDt(this);
        if (dt == 0)
            return true;
         
        var s = task.slope * dt;
        task.current += s;        
        var is_hit = (task.slope > 0)?  (task.current >= task.target) : (task.current <= task.target);
        var value_ = (is_hit)? task.target : task.current;
        log(value_);
        this.AudioSetVolumeDB(task.tag, value_);
        return (!is_hit);
    };
    	
    instanceProto["TaskStop"] = function (task)
	{
        this.AudioStop(task.tag);        
	};	
    instanceProto["TaskPause"] = function (task)
	{
        this.AudioPause(task.tag, 0);        
	};
	
		
    // ---- audio helper ----
    instanceProto.AudioStart = function (file, looping, voldb, tag)
	{     
        var audio = this._audio_get();       
        cr.plugins_.Audio.prototype.acts.Play.call(audio, file, looping, voldb, tag);
	};     
    instanceProto.AudioStop = function (tag)
	{     
       var audio = this._audio_get();    
       cr.plugins_.Audio.prototype.acts.Stop.call(audio, tag);
	};    
    instanceProto.AudioPause = function (tag, state)
	{     
        var audio = this._audio_get();    
        cr.plugins_.Audio.prototype.acts.SetPaused.call(audio, tag, state);
	};  	 
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
    
	instanceProto.saveToJSON = function ()
	{
		return { "tm": this.tasksMgr.saveToJSON(),
		         "pdb": this.pauseTag2Db 
                };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.tasksMgr.loadFromJSON(o["tm"]);
        this.pauseTag2Db = o["pdb"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Play = function (file, looping, stop_vol, tag, fadeIn_time, start_vol)
	{          
       var voldb = LinearScaleToDb(stop_vol);       
       this.AudioStart(file, looping, voldb, tag);
       
       if ((fadeIn_time > 0) && (voldb > start_vol))
       {
           var task = this.tasksMgr.TaskGet(tag, PRIORITY_FADE);
           if (task != null)
           {
               this.FadeTaskSet(task, start_vol, voldb, fadeIn_time);
           }           
       }
	};
    
    Acts.prototype.Stop = function (tag, fadeOut_time, stop_vol)
	{  
	   var current_voldb = this.AudioGetVolumeDB(tag); 
       if ((fadeOut_time == 0) || (current_voldb <= stop_vol))
       {
           this.AudioStop(tag);
       }
       else
       {
           var task = this.tasksMgr.TaskGet(tag, PRIORITY_STOP);
           if (task != null)
           {
               this.FadeTaskSet(task, current_voldb, stop_vol, fadeOut_time);
               task.FinishefHandlerSet("TaskStop");
           }
       }
	};    
    
	Acts.prototype.SetVolume = function (tag, vol, fade_time)
	{
       var voldb = LinearScaleToDb(vol);
       var current_voldb = this.AudioGetVolumeDB(tag);
       if (voldb != current_voldb)
       {
           if (fade_time > 0)
           {
               var task = this.tasksMgr.TaskGet(tag, PRIORITY_FADE);
               if (task != null)
               {                              
                   this.FadeTaskSet(task, current_voldb, voldb, fade_time);             
               }
           }
           else
           {
               this.AudioSetVolumeDB(tag, voldb);
           }
       }       
	};
    
    Acts.prototype.PlayByName = function (folder, filename, looping, vol, tag, fadeIn_time)
	{     
       var audio = this._audio_get();       
       var voldb = LinearScaleToDb(vol);
       
       cr.plugins_.Audio.prototype.acts.PlayByName.call(audio, folder, filename, looping, voldb, tag);
       
       if ((fadeIn_time > 0) && (voldb > MINDB))
       {
           var task = this.tasksMgr.TaskGet(tag, PRIORITY_FADE);
           if (task == null)
           {                     
               this.FadeTaskSet(task, MINDB, voldb, fadeIn_time);                   
           }
       }
	};   
	 
    Acts.prototype.SetPaused = function (tag, state, fade_time)
	{     
        if (state == 0)  // pause
        {
            var current_voldb = this.AudioGetVolumeDB(tag); 
            if ((fade_time <= 0) || (current_voldb <= MINDB))
            {
                this.AudioPause(tag, 0);
            }
            else
            {
                this.pauseTag2Db[tag] = current_voldb;
                var task = this.tasksMgr.TaskGet(tag, PRIORITY_PAUSE);
                if (task != null)
                {               
                    this.FadeTaskSet(task, current_voldb, MINDB, fade_time);
                    task.FinishefHandlerSet("TaskPause");
                }
            }
        }
        else  // resume
        {
            this.AudioPause(tag, 1);
            
            var voldb = this.pauseTag2Db[tag];     
            if (voldb == null)
                return;
            delete this.pauseTag2Db[tag];
            if ((fade_time > 0) && (voldb > MINDB))
            {
                var task = this.tasksMgr.TaskGet(tag, PRIORITY_FADE);
                if (task == null)
                    return;                
                this.FadeTaskSet(task, MINDB, voldb, fade_time);                  
            }  
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
        this.taskCache = [];
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
            is_continue = task.OnTick();
            if (is_continue)
            {
                this.tasks.push(task);                
            }
            else  // task finished, recycle structure
            {
                task.OnFinished();
                this.taskCache.push(task);
            }
        } 
        this.tasks_tmp.length = 0;
    };
    
    TaskMgrKlassProto.TaskGet = function (tag, priority)
    {
        var task, is_found=false;
        var i, cnt=this.tasks.length;
        for (i=0; i<cnt; i++)
        {
            task = this.tasks[i];
            if (task.tag == tag)
            {
                is_found = true;
                break;
            }
        }
        if (!is_found)
        {
            task = this.NewTask(tag, priority); 
        }
        else if (task.priority <= priority)
        {
            task.Init(tag, priority);
        }
        else
        {
            task = null; // could not overwrite high priority task
        }
        return task;
    }; 
    
    TaskMgrKlassProto.NewTask = function (tag, priority)
    {
        var task;
        if (this.taskCache.length > 0)
        {
            task = this.taskCache.pop();
        }
        else
        {          
            task = new TaskKlass(this.plugin);
        }
        task.Init(tag, priority);        
        
        this.tasks.push(task); 
        return task;
    };    
    
	TaskMgrKlassProto.saveToJSON = function ()
	{
	    var task_save = [];
	    var i, cnt = this.tasks.length;
	    for (i=0; i<cnt; i++)
	    {
	        task_save.push(this.tasks[i].saveToJSON());
	    }
		return { "ts": task_save
                };
	};
	
	TaskMgrKlassProto.loadFromJSON = function (o)
	{
	    var task_save = o["ts"];
	    var i, cnt = task_save.length;
	    var task
	    for (i=0; i<cnt; i++)
	    {
	        task = new TaskKlass(this.plugin);
	        task.loadFromJSON(task_save[i]);
	        this.tasks.push(task);
	    }
	};    
           
    var TaskKlass = function(plugin)
    {        
        this.plugin = plugin;
        this.tag = "";
        this.priority = -1;
        this.__on_tick_handler = "";
        this.__on_finished_handler = "";        
    };
    var TaskKlassProto = TaskKlass.prototype;
    
	TaskKlassProto.Init = function (tag, priority)
	{  
        this.tag = tag;	    
        this.priority = priority;
        this.TickHandlerSet();
        this.FinishefHandlerSet();
    };
    
	TaskKlassProto.TickHandlerSet = function (fn_name)
	{  
	    if (fn_name == null)
	        fn_name = "";
        this.__on_tick_handler = fn_name;     
    };  
    
	TaskKlassProto.FinishefHandlerSet = function (fn_name)
	{  
	    if (fn_name == null)
	        fn_name = "";	    
	    this.__on_finished_handler = fn_name;     
    };      
        
	TaskKlassProto.OnTick = function()
	{
	    if (this.__on_tick_handler == "")
	        return false;
	        
	    var fn = this.plugin[this.__on_tick_handler];
	    var is_continue = fn.call(this.plugin, this);
	    return is_continue;
    }; 
    
	TaskKlassProto.OnFinished = function()
	{
	    if (this.__on_finished_handler == "")
	        return false;
	        
	    var fn = this.plugin[this.__on_finished_handler];
	    fn.call(this.plugin, this);	   
    };
    
	TaskKlassProto.saveToJSON = function ()
	{	    
		return { "t": this.tag,
		         "p": this.priority,
		         "thdlr": this.__on_tick_handler,
		         "fhdlr": this.__on_finished_handler,
		         
		         "fade_t": this.target,
		         "fade_c": this.current,
		         "fade_s": this.slope,
                };
	};
	
	TaskKlassProto.loadFromJSON = function (o)
	{
        this.tag = o["t"];
        this.priority = o["p"];
        this.__on_tick_handler = o["thdlr"];
        this.__on_finished_handler = o["fhdlr"];
        
        this.target = o["fade_t"];
        this.current = o["fade_c"];
        this.slope = o["fade_s"];
	};    
}());   