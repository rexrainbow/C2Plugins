// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_TimeLine = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
    // TimerCacheKlass
    var TimerCacheKlass = function ()
    {
        this.lines = [];  
    };
    var TimerCacheKlassProto = TimerCacheKlass.prototype;   
         
	TimerCacheKlassProto.alloc = function(timeline, on_timeout)
	{
        var timer;
        if (this.lines.length > 0)
        {
            timer = this.lines.pop();
			timer.Reset();
        }
        else
        {
            timer = timeline.CreateTimer(on_timeout);
        }            
		return timer;
	};

	TimerCacheKlassProto.free = function(timer)
	{
        this.lines.push(timer);
	};
	// TimerCacheKlass	
	cr.plugins_.Rex_TimeLine.timer_cache = new TimerCacheKlass();
	    
	var pluginProto = cr.plugins_.Rex_TimeLine.prototype;
		
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

	var FNTYPE_UK = 0;          // unknow 
	var FNTYPE_NA = 1;	        // not avaiable
	var FNTYPE_REXFNEX = 2;     // rex_functionext
    var FNTYPE_REXFN2 = 3;      // rex_function2
	var FNTYPE_OFFICIALFN = 4;  // official function
	var FNTYPE_REXFN = 5;       // rex_function
	instanceProto.onCreate = function()
	{     
        this.update_manually       = (this.properties[0] == 0);
        this.update_with_game_time = (this.properties[0] == 1);
        this.update_with_real_time = (this.properties[0] == 2);
        
        if (this.update_with_real_time)
        {
            var timer = new Date();
            this.last_real_time = timer.getTime();
        }
        else
        {
            this.last_real_time = null;
        }
        
        this.my_timescale = -1.0;
        
        // timeline  
        this.timeline = new cr.plugins_.Rex_TimeLine.TimeLine();
        if (this.update_with_game_time || this.update_with_real_time)
            this.runtime.tickMe(this);
        this.check_name = "TIMELINE";
        
        // timers
        if (!this.recycled)
        {    
            this.timers = {};    
        }
        this.timer_cache = cr.plugins_.Rex_TimeLine.timer_cache;      
		this.exp_triggered_timer_name = "";
        this.timers_save = null;
		
        // callback:      
        // rex_functionext or function
        this._fnobj = null;
        this._fnobj_type = FNTYPE_UK;
	    this._act_call_fn = null;
		this._exp_call = null;
        
        /**BEGIN-PREVIEWONLY**/
        this.propsections = [];      
        /**END-PREVIEWONLY**/          
	};
    
	instanceProto.onDestroy = function()
	{
        this.timeline.CleanAll();
        var name;
        for (name in this.timers)
            this.destroy_local_timer(name);
	};  
	
    instanceProto.tick = function()
    {
        if (this.update_with_game_time)
        {
            var dt = this.runtime.getDt(this);
            this.timeline.Dispatch(dt);
        }
        else if (this.update_with_real_time)
        {
            var timer = new Date();
            var last_real_time = timer.getTime();      
            var dt = (last_real_time - this.last_real_time)/1000;
            this.timeline.Dispatch(dt);
            this.last_real_time = last_real_time;
        }
    };
    
    // export: get new timer instance
    instanceProto.CreateTimer = function(on_timeout)
    {
        var timer = new cr.plugins_.Rex_TimeLine.Timer(this.timeline);        
        timer.TimeoutHandlerSet(on_timeout);  // hang OnTimeout function
        return timer;
    };
	
    // load timer (for save/load system)
	instanceProto.LoadTimer = function (load_info, on_timeout)
	{
        var timer = this.CreateTimer(on_timeout); 
        timer.loadFromJSON(load_info);
        timer.afterLoad();
        return timer;
	}; 
       
    // ---- callback ----
	instanceProto.setup_callback = function (raise_assert_when_not_fnobj_avaiable, fn_type)
	{
        if (fn_type == null)
        {
            // seek all possible function object
            if (this.cache_RexFnExt())
                return;
            if (this.cache_RexFn2())
                return;
            if (this.cache_Fn())
                return;
            // cache nothing
            this._fnobj_type = FNTYPE_NA;  // function object is not avaiable            
            
            if (raise_assert_when_not_fnobj_avaiable)            
                assert2(has_func, "Function extension or official function, or rex_function2 was not found.");            

        }
        else
        {
		    this._fnobj_type = FNTYPE_UK;
            // seek function object
	        switch (fn_type)
		    {
		    case FNTYPE_REXFNEX:     // rex_functionext
		        this.cache_RexFnExt();
		    	break;
            case FNTYPE_REXFN2:      // rex_function2   
		        this.cache_RexFn2();
		    	break;                     
	        case FNTYPE_OFFICIALFN:  // official function
		        this.cache_Fn()
		    	break; 
		    }

        }
	}; 
	
	instanceProto.cache_RexFnExt = function()
	{
	    if (!cr.plugins_.Rex_FnExt)
	        return false;
	        
        var plugins = this.runtime.types;			
        var name, inst;
        
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Rex_FnExt.prototype.Instance)
            {
                this._fnobj = inst;
                this._act_call_fn = cr.plugins_.Rex_FnExt.prototype.acts.CallFunction;
		        this._exp_call = cr.plugins_.Rex_FnExt.prototype.exps.Call;
			    this._fnobj_type = FNTYPE_REXFNEX;
                return true;
            }                                          
        }  
        return false;
    };
    
	instanceProto.cache_RexFn2 = function()
	{
	    if (!cr.plugins_.Rex_Function2)
	        return false;
	        
        var plugins = this.runtime.types;			
        var name, inst;
        
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Rex_Function2.prototype.Instance)
            {
                this._fnobj = inst;
                this._act_call_fn = cr.plugins_.Rex_Function2.prototype.acts.CallFunction;
		        this._exp_call = cr.plugins_.Rex_Function2.prototype.exps.Call;
			    this._fnobj_type = FNTYPE_REXFN2;
                return true;
            }                                          
        }
        return false;
	};    
	
	instanceProto.cache_Fn = function()
	{
	    if (!cr.plugins_.Function)
	        return false;
	        
        var plugins = this.runtime.types;			
        var name, inst;
        
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Function.prototype.Instance)
            {
                this._fnobj = inst;
                this._act_call_fn = cr.plugins_.Function.prototype.acts.CallFunction;
                this._exp_call = cr.plugins_.Function.prototype.exps.Call;			
			    this._fnobj_type = FNTYPE_OFFICIALFN;
                return true;
            }                                          
        }
        return false;
	};  

    instanceProto.RunCallback = function(name, params, raise_assert_when_not_fnobj_avaiable)
    {
	    if (this._fnobj_type == FNTYPE_UK)
	        this.setup_callback(raise_assert_when_not_fnobj_avaiable);
        
	    switch (this._fnobj_type)
		{
		case FNTYPE_REXFNEX:     // rex_functionext
		    this._fnobj.CallFunction(name, params);
			break;
        case FNTYPE_REXFN2:      // rex_function2            
	    case FNTYPE_OFFICIALFN:  // official function
            this._act_call_fn.call(this._fnobj, name, params);
			break;	
		}      

        return (this._fnobj_type != FNTYPE_NA);  
    };	
	
    instanceProto.Call = function(params, raise_assert_when_not_fnobj_avaiable)
    {
	    // params = [ ret, name, param0, param1, ... ]
	    if (this._fnobj_type == FNTYPE_UK)
	        this.setup_callback(raise_assert_when_not_fnobj_avaiable);
        
	    switch (this._fnobj_type)
		{
		case FNTYPE_REXFNEX:     // rex_functionext
        case FNTYPE_REXFN2:      // rex_function2
		case FNTYPE_OFFICIALFN:  // official function 
		    this._exp_call.apply(this._fnobj, params);
			break;
		}      

        return (this._fnobj_type != FNTYPE_NA);  
    };		
    // ---- callback ----
    	
    instanceProto.TimeGet = function()
    {
        return this.timeline.ABS_Time;  
    };	

    // ---- local timer ----
    // get timer / free timer
	instanceProto.create_local_timer = function(timer_name)
	{
        var timer = this.timers[timer_name];
        if (timer != null)  // timer exist
        {
            timer.Remove();
        }
        else      // get timer from timer cache
        {
            timer = this.timer_cache.alloc(this, on_timeout);
            timer.plugin = this;
            this.timers[timer_name] = timer;
        }
        	    
        return timer;
	}; 
	
	instanceProto.destroy_local_timer = function(timer_name)
	{
        var timer = this.timers[timer_name];
        if (timer == null)
            return;
            
        timer.Remove();
        delete this.timers[timer_name];
        this.timer_cache.free(timer);
	}; 	 
	
	instanceProto.timer_cache_clean = function()
	{
        this.timer_cache.lines.length = 0;
	};    
    
    // handler of timeout for timers in this plugin, this=timer   
    var on_timeout = function ()
    {
        var plugin = this.plugin;
        plugin.exp_triggered_timer_name = this._cb.name;  
        var name = this._cb.command;
        var params = this._cb.params;  
        var has_fnobj = plugin.RunCallback(name, params, true);
        assert2(has_fnobj, "Timeline: Can not find callback oject.");
        
        if (this._repeat_count === 0)
            this.Start();
        else if (this._repeat_count > 1)
        {
            this._repeat_count -= 1;
            this.Start();
        }
    };
    
    instanceProto._get_timer_cb_params = function(timer_name)
    {
        var params = {name:timer_name,
                      command:""};
        if (this._fnobj_type == FNTYPE_REXFN)
		    params.params = {};
		else
		    params.params = [];
        return params;
    };   // fix me
    // ---- local timer ----
     
	instanceProto.saveToJSON = function ()
	{ 
        var name, timer, timers_save = {};        
        for (name in this.timers)
        {
            timer = this.timers[name];
            timers_save[name] = {"tim": timer.saveToJSON(),
                                "cmd": timer._cb.command,
                                "pams": timer._cb.params,
                                "rc": timer._repeat_count,
                                };
        }
		return { "ts": this.my_timescale,
                 "ug": this.update_with_game_time,
                 "tl": this.timeline.saveToJSON(),
                 "timers": timers_save,
                 "lrt": this.last_real_time,
                 "fnType": this._fnobj_type,                 
                 };
	};
    
	instanceProto.loadFromJSON = function (o)
	{
        this.my_timescale = o["ts"];
        this.timeline.loadFromJSON(o["tl"]);
        this.timers_save = o["timers"];
        this.last_real_time = o["lrt"];
        this._fnobj_type = o["fnType"];
        
        this.onDestroy();
        this.timer_cache_clean();
	};     

    
	instanceProto.afterLoad = function ()
	{
        var name, timer_info, timer;
        for (name in this.timers_save)
        {
            timer_info = this.timers_save[name];
            timer = this.LoadTimer(timer_info["tim"], on_timeout);
            timer.plugin = this;
            timer._cb = this._get_timer_cb_params(name);
            timer._cb.command = timer_info["cmd"];
            timer._cb.params = timer_info["pams"];
            timer._repeat_count = timer_info["rc"];
        }
        this.timers_save = null;
        
        this.setup_callback(false, this._fnobj_type);
	};

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    this.propsections.length = 0;
	    this.propsections.push({"name": "Timeline's time", "value": this.timeline.ABS_Time});
        
        var name, timer;
        for (name in this.timers)
        {
            timer = this.timers[name];
            this.propsections.push({"name": name, "value": timer._cb.command});
        }
        

		propsections.push({
			"title": this.type.name,
			"properties": this.propsections
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.IsRunning = function (timer_name)
	{
        var timer = this.timers[timer_name];
		return (timer)? timer.IsActive(): false;
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.PushTimeLine = function (delta_time)
	{
        if (!this.update_manually)
            return;
            
        // push manually
        this.timeline.Dispatch(delta_time);
	};   
    
    // deprecated
    Acts.prototype.Setup_deprecated = function () { };
    Acts.prototype.CreateTimer_deprecated = function () { }; 
	// deprecated
    
    Acts.prototype.StartTimer = function (timer_name, delay_time, repeat_count)
	{
        var timer = this.timers[timer_name];
        if (timer)
        {
            timer._repeat_count = repeat_count;
            timer.Start(delay_time);            
        }
	};

    Acts.prototype.StartTrgTimer = function (delay_time)
	{
	    var timer_name = this.exp_triggered_timer_name;
		var timer = this.timers[timer_name];
        if (timer)
            timer.Start(delay_time);
	}; 
    
    Acts.prototype.PauseTimer = function (timer_name)
	{
        var timer = this.timers[timer_name];
        if (timer)
            timer.Suspend();
	};   

    Acts.prototype.ResumeTimer = function (timer_name)
	{
        var timer = this.timers[timer_name];
        if (timer)
            timer.Resume();
	};       
    
    Acts.prototype.StopTimer = function (timer_name)
	{
        var timer = this.timers[timer_name];
        if (timer)
            timer.Remove();
	};
    
    Acts.prototype.CleanTimeLine = function ()
	{
        this.timeline.CleanAll();
	};
    
    Acts.prototype.DeleteTimer = function (timer_name)
	{
	    this.destroy_local_timer(timer_name);
	};  
    
    Acts.prototype.SetTimerParameter = function (timer_name, index, value)
	{
	    var timer = this.timers[timer_name];
	    if (timer)
	    {
	        timer._cb.params[index] = value;
	    }
	};    

    Acts.prototype.PauseTimeLine = function ()
	{
	    this.update_with_game_time = false;
	};   

    Acts.prototype.ResumeTimeLine = function ()
	{     
	    this.update_with_game_time = true;
	};   	
    
    Acts.prototype.CreateTimer = function (timer_name, callback_name, callback_params)
	{
        var timer = this.create_local_timer(timer_name);
        timer._cb = this._get_timer_cb_params(timer_name);
        timer._cb.command = callback_name;
        cr.shallowAssignArray(timer._cb.params, callback_params);     
	};
    
    Acts.prototype.SetTimerParameters = function (timer_name, callback_params)
	{
	    var timer = this.timers[timer_name];
		if (timer)
		{
		    cr.shallowAssignArray(timer._cb.params, callback_params);
		}
	};	
   
    Acts.prototype.SetTrgTimerParameters = function (callback_params)
	{	    	    
	    var timer_name = this.exp_triggered_timer_name;
	    var timer = this.timers[timer_name];
		if (timer)
		{
		    cr.shallowAssignArray(timer._cb.params, callback_params);
		}
	};	
	
    Acts.prototype.DeleteTrgTimer = function ()
	{
	    this.destroy_local_timer(this.exp_triggered_timer_name);		
	};	
	
    Acts.prototype.PushTimeLineTo = function (t)
	{
        if (!this.update_manually)
            return;
            
        // push manually
        var delta_time = t - this.timeline.ABS_Time;
        if (delta_time < 0)
            return;
            
        this.timeline.Dispatch(delta_time);
	}; 
	
    Acts.prototype.SetupCallback = function (callback_type)
	{	
        var plugins = this.runtime.types;
        var name, inst;
        if (callback_type === 0)
        {
            if(!cr.plugins_.Function)
                return;
                
            for (name in plugins)
            {
                inst = plugins[name].instances[0];
                if (inst instanceof cr.plugins_.Function.prototype.Instance)
                {
                    this._fnobj = inst;
                    this._act_call_fn = cr.plugins_.Function.prototype.acts.CallFunction;
                    this._exp_call = cr.plugins_.Function.prototype.exps.Call;			
				    this._fnobj_type = FNTYPE_OFFICIALFN;
                    return;
                }                                          
            }
        }
        else if (callback_type === 1)
        {
            if (!cr.plugins_.Rex_Function2)
                return;   
                
            for (name in plugins)
            {
                inst = plugins[name].instances[0];
                if (inst instanceof cr.plugins_.Rex_Function2.prototype.Instance)
                {
                    this._fnobj = inst;
                    this._act_call_fn = cr.plugins_.Rex_Function2.prototype.acts.CallFunction;
			        this._exp_call = cr.plugins_.Rex_Function2.prototype.exps.Call;
				    this._fnobj_type = FNTYPE_REXFN2;
                    return;
                }                                          
            }                
        }
	};	
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();   
    
	Exps.prototype.TimerRemainder = function (ret, timer_name)
	{
        var timer = this.timers[timer_name];
        var t = (timer)? timer.RemainderTimeGet():0;     
	    ret.set_float(t);
	};
    
	Exps.prototype.TimerElapsed = function (ret, timer_name)
	{
        var timer = this.timers[timer_name];
        var t = (timer)? timer.ElapsedTimeGet():0;     
	    ret.set_float(t);
	}; 

	Exps.prototype.TimerRemainderPercent = function (ret, timer_name)
	{
        var timer = this.timers[timer_name];
        var t = (timer)? timer.RemainderTimePercentGet():0;     
	    ret.set_float(t);
	};
    
	Exps.prototype.TimerElapsedPercent = function (ret, timer_name)
	{
        var timer = this.timers[timer_name];
        var t = (timer)? timer.ElapsedTimePercentGet():0;     
	    ret.set_float(t);
	};
    
	Exps.prototype.TimeLineTime = function (ret)
	{ 
	    ret.set_float(this.timeline.ABS_Time);
	};
    
	Exps.prototype.TriggeredTimerName = function (ret)
	{ 
	    ret.set_string(this.exp_triggered_timer_name);
	};   
    
	Exps.prototype.TimerDelayTime = function (ret)
	{ 
        var timer = this.timers[timer_name];
        var t = (timer)? timer.DelayTimeGet():0;     
	    ret.set_float(t);
	};	
	 
}());


// class - TimeLine,Timer //,_TimerHandler
(function ()
{
    cr.plugins_.Rex_TimeLine.TimeLine = function()
    {
        this.CleanAll();    
    };
    var TimeLineProto = cr.plugins_.Rex_TimeLine.TimeLine.prototype;
    
    var _TIMERQUEUE_SORT = function(timerA, timerB)
    {
        var ta = timerA.abs_time;
        var tb = timerB.abs_time;
        return (ta < tb) ? -1 : (ta > tb) ? 1 : 0;
    }
    
    TimeLineProto.CleanAll = function()
	{
        this.triggered_timer = null;     
        this.ABS_Time = 0;
        this._timer_abs_time = 0;
        this._waiting_timer_queue = [];
        this._process_timer_queue = [];
        this._suspend_timer_queue = [];
        
        this.activate_queue = [this._waiting_timer_queue, this._process_timer_queue];
        this.all_queues = [this._waiting_timer_queue, this._process_timer_queue, this._suspend_timer_queue];    
	}; 
    
	TimeLineProto.CurrentTimeGet = function()
	{
        return this._timer_abs_time;
	};    
    
	TimeLineProto.RegistTimer = function(timer)
	{
        this._add_timer_to_activate_lists(timer);
	};
    
    TimeLineProto.RemoveTimer = function(timer)
    {
        this._remove_timer_from_lists(timer, false);  //activate_only=False
        timer._idle();
    };

    TimeLineProto.Dispatch = function(delta_time)
    {
        this.ABS_Time += delta_time;

        // sort _waiting_timer_queue
        this._waiting_timer_queue.sort(_TIMERQUEUE_SORT);

        // get time-out timer
        var quene_length = this._waiting_timer_queue.length;
        var i, timer;
        var _timer_cnt = 0;
        for (i=0; i<quene_length; i++)
        {
            timer = this._waiting_timer_queue[i];
            if (this._is_timer_time_out(timer))
            {
                this._process_timer_queue.push(timer);
                _timer_cnt += 1;
            }
        }
        
        // remainder timers   
        if (_timer_cnt)
        {
            for(i=_timer_cnt; i<quene_length; i++)
            {
                this._waiting_timer_queue[i-_timer_cnt] = this._waiting_timer_queue[i];            
            }
            this._waiting_timer_queue.length -= _timer_cnt;
        }

        // do call back function with arg list
        while (this._process_timer_queue.length > 0)
        {
            this._process_timer_queue.sort(_TIMERQUEUE_SORT);
            this.triggered_timer = this._process_timer_queue.shift();
            this._timer_abs_time = this.triggered_timer.abs_time;
            //log("[TimeLine] Current Time="+this._timer_abs_time);
            this.triggered_timer.DoHandle();
        }    
        this._timer_abs_time = this.ABS_Time;   
        
    };    
 
    TimeLineProto.SuspendTimer = function(timer)
    {
        var is_success = this._remove_timer_from_lists(timer, true); //activate_only=True
        if (is_success)
        {
            this._suspend_timer_queue.push(timer);
            timer.__suspend__();
        }
        return is_success;
    };
    
    TimeLineProto.ResumeTimer = function(timer)
    {
        var is_success = false;
        var item_index = this._suspend_timer_queue.indexOf(timer);
        if (item_index != (-1))
        {
            cr.arrayRemove(this._suspend_timer_queue, item_index);
            timer.__resume__();
            this.RegistTimer(timer);
            is_success = true;
        }
        return is_success;
    }; 
    
    TimeLineProto.SetTimescale = function(timer, timescale)
    {
        timer._set_timescale(timescale);
        var is_success = this._remove_timer_from_lists(timer, true);  //activate_only=True
        if (is_success)
        {
            this.RegistTimer(timer);
        }
        return is_success;
    };      

    TimeLineProto.ChangeTimerRate = function(timer, rate)
    {
        timer._change_rate(rate);
        var is_success = this._remove_timer_from_lists(timer, true);  //activate_only=True
        if (is_success)
        {
            this.RegistTimer(timer);
        }
        return is_success;
    };
	
	TimeLineProto.saveToJSON = function ()
	{
		return { "at": this.ABS_Time };
	};
	
	TimeLineProto.loadFromJSON = function (o)
	{
		this.ABS_Time = o["at"];
	};    

    // internal function        
    TimeLineProto._is_timer_time_out = function(timer)
    {
        return (timer.abs_time <= this.ABS_Time);
    };

    TimeLineProto._add_timer_to_activate_lists = function(timer)
    {
        var queue = ( this._is_timer_time_out(timer) )? 
                    this._process_timer_queue : this._waiting_timer_queue;
        queue.push(timer);
    };
    
    TimeLineProto._remove_timer_from_lists = function(timer, activate_only)
    {
        var is_success = false;
        var timer_lists = (activate_only)? this.activate_queue : this.all_queues;
        var i;
        var lists_length = timer_lists.length;
        var timer_queue, item_index;
        for(i=0; i<lists_length; i++)
        {
            timer_queue = timer_lists[i];
            item_index = timer_queue.indexOf(timer);
            if (item_index!= (-1))
            {
                cr.arrayRemove(timer_queue, item_index);
                is_success = true;
                break;
            }
        } 
        return is_success;
    };    


    // Timer
    cr.plugins_.Rex_TimeLine.Timer = function(timeline)
    {
        this.timeline = timeline;
		this.Reset();
        this.extra = {};		
        // state: 
        // - idle: (!this._is_alive) && (!this._is_active)
        // - run: (this._is_alive) && (this._is_active)
        // - suspend: (this._is_alive) && (!this._is_active)
    };
    var TimerProto = cr.plugins_.Rex_TimeLine.Timer.prototype;
    
    TimerProto.Reset = function()
    {
        this.delay_time = 0; //delay_time
        this._remainder_time = 0;
        this.abs_time = 0;
        this.timescale = 1;
        this._idle();
        this._abs_timeout_set(0); // delay_time
    };
	
    // export functions
    TimerProto.Restart = function(delay_time)
    {
        if (delay_time != null)  // assign new delay time
        {
            this.delay_time = delay_time;
        }
        
        var t = this.delay_time * this.timescale;
        this._abs_timeout_set(t);
        if (this._is_alive)
        {
            if (!this._is_active)
            {
                this._remainder_time = this.abs_time;
                this.Resume(); // update timer in TimeLineMgr 
            }
        }
        else
        {
            this.timeline.RegistTimer(this);
            this._run();
        }
    };
    TimerProto.Start = TimerProto.Restart;
    
    TimerProto.Suspend = function()
    {
        this.timeline.SuspendTimer(this);
    };

    TimerProto.Resume = function()
    {
        this.timeline.ResumeTimer(this);
    };
    
    TimerProto.SetTimescale = function(timescale)
    {
        if (timescale == this.timescale)
            return;
            
        this.timeline.SetTimescale(this, timescale);
    };    

    TimerProto.ChangeRate = function(rate)
    {
        this.timeline.ChangeTimerRate(this, rate);
    };

    TimerProto.Remove = function()
    {
        if ((!this._is_alive) && (!this._is_active))
            this.timeline.RemoveTimer(this);
    };
    
    TimerProto.IsAlive = function()
    {
        return this._is_alive;
    };
        
    TimerProto.IsActive = function()
    {
        return (this._is_alive && this._is_active);    
    };
    
    TimerProto.RemainderTimeGet = function()
    {
        var remainder_time = 0;
        if (this.IsActive())       // -> run     
        {
            remainder_time = this.abs_time - this.timeline.CurrentTimeGet();
        }
        else if (this.IsAlive())   // (!this.IsActive() && this.IsAlive()) -> suspend
        {
            remainder_time = this._remainder_time;
        }
        return remainder_time;  
    };  
     
    TimerProto.RemainderTimeSet = function(_t)
    {
        if (!this.IsAlive())
            return;
             
        var remainder_time = cr.clamp(_t, 0, this.delay_time);
        this._remainder_time = remainder_time;
        this.abs_time = this.timeline.CurrentTimeGet() + remainder_time;         
    };
    TimerProto.ElapsedTimeGet = function()
    {
        return (this.delay_time - this.RemainderTimeGet());
    };  

    TimerProto.RemainderTimePercentGet = function()
    {
        return (this.delay_time == 0)? 0:
               (this.RemainderTimeGet() / this.delay_time);
    };     

    TimerProto.ElapsedTimePercentGet = function()
    {
        return (this.delay_time == 0)? 0:
               (this.ElapsedTimeGet() / this.delay_time);
    };       
            
    TimerProto.ExpiredTimeGet = function()
    {    
        return (this.timeline.ABS_Time - this.abs_time);
    };
            
    TimerProto.DelayTimeGet = function()
    {    
        return this.delay_time;
    }; 
    
    // hang this function
    //TimerProto.OnTimeout = function()
    //{            
    //};   
    
    TimerProto.TimeoutHandlerSet = function(handler)
    {            
        this.OnTimeout = handler;
    };           
    
    // export to timeline
    TimerProto.DoHandle = function()
    {
        this._idle();
        if (this.OnTimeout)
            this.OnTimeout();
    };    
	
    // export to save/load timer
	TimerProto.saveToJSON = function ()
	{
	    var remainder_time = this.RemainderTimeGet();
		return { "dt": this.delay_time,
                 "rt": remainder_time, 
                 "ts": this.timescale,                
                 "alive": this._is_alive,
                 "active": this._is_active,
                 "ex": this.extra
                 };
	};
    
	TimerProto.loadFromJSON = function (o)
	{
        this.delay_time = o["dt"];     
        this._is_alive = o["alive"];
        this._is_active = o["active"];       
        this.timescale = o.hasOwnProperty("ts")? o["ts"]:1;    // compaticable           
        this.extra = o["ex"];          
        this.RemainderTimeSet(o["rt"]);  // set remaind_time and abs_time    
        // this._handler will be set at timer created
        
        
	};     
	
	TimerProto.afterLoad = function ()
	{
        if (this.IsAlive())
        {
            this.timeline.RegistTimer(this);
            if (!this.IsActive())
            {
                this.timeline.SuspendTimer(this);
            }
        }
	};
    
    // internal functions
    TimerProto._idle = function()
    {
        this._is_alive = false;   // start, stop
        this._is_active = false;  // suspend, resume
    };
    
    TimerProto._run = function()
    {
        this._is_alive = true;
        this._is_active = true;   
    };

    TimerProto._abs_timeout_set = function(delta_time)
    {
        this.abs_time = this.timeline.CurrentTimeGet() + delta_time;
    };
    
    // do not call this directly
    TimerProto.__suspend__ = function()
    {
        this._remainder_time = this.abs_time - this.timeline.CurrentTimeGet();
        this._is_active = false;
    };

    // do not call this directly
    TimerProto.__resume__ = function()
    {
        this._abs_timeout_set(this._remainder_time);
        this._is_active = true;
    };
    
    TimerProto._set_timescale = function(timescale)
    {        
        if (timescale < 0)   // invalid
            return;
            
        var do_change_rate = false;
        if ((timescale == 0) && this._is_active) // suspend
        {
            this.Suspend();
        }
        else if ((timescale > 0) && (!this._is_active)) // resume
        {
            this.Resume();
            do_change_rate = true;
        }
        else if ((timescale > 0) && this._is_active) // this._is_active, normal
        {
            do_change_rate = true;
        }
        
        if (do_change_rate)
        {
            var rate = timescale/this.timescale;
            this._change_rate(rate);
            this.timescale = timescale;
        }
    };        
    
    TimerProto._change_rate = function(rate)
    {
        if (this._is_active)
        {
            var abs_time = this.timeline.CurrentTimeGet();
            var remainder_time = this.abs_time - abs_time;
            this.abs_time = abs_time + (remainder_time*rate);
        }
        else
        {
            this._remainder_time *= rate;
        }
    };
}());