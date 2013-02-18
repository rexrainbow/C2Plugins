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

	instanceProto.onCreate = function()
	{     
        this.update_with_game_time = (this.properties[0] == 1);
        
        // timeline  
        this.timeline = new cr.plugins_.Rex_TimeLine.TimeLine();
        this.runtime.tickMe(this);
        this.check_name = "TIMELINE";
        // push manual
        this.manual_push = false;
        this.manual_delta_time = 0;
        
        // timers    
        this.timers = {}; 
		this.exp_triggered_timer_name = "";
		
        // callback:
        
		// rex_function
        this.my_callback = null;        
        // rex_functionext or function
        this._official_fnobj = null;
        this._official_fnobj_state = 0;  // 0=unknow, 1=not avaiable, 2=rex_functionext, 3=function
	    this._call_fn = null;
	};
    
    instanceProto.tick = function()
    {
        if (this.update_with_game_time)
        {
            this.timeline.Dispatch(this.runtime.dt);
        }
        else if (this.manual_push)  // !this.update_with_game_time
        {
            this.timeline.Dispatch(this.manual_delta_time);
            this.manual_push = false;
        }
    };
    
    instanceProto._timer_handle = function(timer_struct)
    {
	    this.exp_triggered_timer_name = timer_struct.name;
        var name = timer_struct.command;
        var params = timer_struct.params;  
        var has_rex_function = (this.my_callback != null);
        if (has_rex_function)
            this.my_callback.CallFn(name, params);
        else    // run official function
        {
            var has_fnobj = this.RunCallback(name, params, true);            
            assert2(has_fnobj, "Timeline: Can not find callback oject.");
        }
    };
    
    // export: get new timer instance
    instanceProto.CreateTimer = function(thisArg, call_back_fn, args)
    {
        return (new cr.plugins_.Rex_TimeLine.Timer(this.timeline, thisArg, call_back_fn, args));
    };
    
    instanceProto._GetTimerStruct = function(timer_name)
    {	    
        if (this.timers[timer_name] == null)
        {
		    
            this.timers[timer_name] = {name:timer_name,
			                           timer:null, 
                                       command:""};
            if (this.my_callback != null)
			    this.timers[timer_name].params = {};
		    else
			    this.timers[timer_name].params = [];
        }
        return this.timers[timer_name];
    };    
    
    instanceProto._GetTimer = function(timer_name)
    {
	    var timer_struct = this.timers[timer_name];
        var timer = (timer_struct)? timer_struct.timer : null;
        return timer;
    };    

	instanceProto._setup_callback = function (raise_assert_when_not_fnobj_avaiable)
	{
        if (raise_assert_when_not_fnobj_avaiable)
            assert2(cr.plugins_.Rex_FnExt || cr.plugins_.Function, "Function extension or official function was not found.");

        var plugins = this.runtime.types;			
        var name, plugin;
		// try to get callback from function extension
		if (cr.plugins_.Rex_FnExt != null)
		{
            this._call_fn = cr.plugins_.Rex_FnExt.prototype.acts.CallFunction;
            for (name in plugins)
            {
                plugin = plugins[name];
                if (plugin.plugin.acts.CallFunction == this._call_fn)
                {
                    this._official_fnobj = plugin.instances[0];
				    this._official_fnobj_state = 2;
                    return;
                }                                          
            }
		}
        
        // try to get callback from official function
		if (cr.plugins_.Function != null)    
		{	
            this._call_fn = cr.plugins_.Function.prototype.acts.CallFunction;
            var name, plugin;
            for (name in plugins)
            {
                plugin = plugins[name];
                if (plugin.plugin.acts.CallFunction == this._call_fn)
                {
                    this._official_fnobj = plugin.instances[0];
				    this._official_fnobj_state = 3;
                    return;
                }                                          
            }
		}
        
        this._official_fnobj_state = 1;  // function object is not avaiable
	};   

    instanceProto.RunCallback = function(name, params, raise_assert_when_not_fnobj_avaiable)
    {
	    if (this._official_fnobj_state == 0)
	        this._setup_callback(raise_assert_when_not_fnobj_avaiable);
        
	    switch (this._official_fnobj_state)
		{
		case 2:  // rex_functionext
		    this._official_fnobj.CallFunction(name, params);
			break;
	    case 3:  // function
            this._call_fn.call(this._official_fnobj, name, params);
			break;
		}      

        return (this._official_fnobj_state != 1);  
    };	
	
    instanceProto.TimeGet = function()
    {
        return this.timeline.ABS_Time;  
    };	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.IsRunning = function (timer_name)
	{
        var timer = this._GetTimer(timer_name);
		return (timer)? timer.IsActive(): false;
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.PushTimeLine = function (delta_time)
	{
        // push manually
        this.manual_delta_time = delta_time;
        this.manual_push = true;        
	};   
    
    Acts.prototype.Setup = function (fn_objs)
	{
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.my_callback = callback;        

        else
            alert ("Timeline should connect to a function object");
	};      
    
    Acts.prototype.CreateTimer = function (timer_name, command)
	{
        var timer = this._GetTimer(timer_name);
        var timer_struct = this._GetTimerStruct(timer_name);
        timer_struct.command = command;
        if (timer)  // timer exist
            timer.Remove();
        else      // create new timer instance
            timer_struct.timer = this.CreateTimer(this, this._timer_handle,[timer_struct]);       
	}; 
    
    Acts.prototype.StartTimer = function (timer_name, delay_time)
	{
        var timer = this._GetTimer(timer_name);
        if (timer)
            timer.Start(delay_time);
	};

    Acts.prototype.StartTrgTimer = function (delay_time)
	{
	    var timer_name = this.exp_triggered_timer_name;
		var timer = this._GetTimer(timer_name);
        if (timer)
            timer.Start(delay_time);
	}; 
    
    Acts.prototype.PauseTimer = function (timer_name)
	{
        var timer = this._GetTimer(timer_name);
        if (timer)
            timer.Suspend();
	};   

    Acts.prototype.ResumeTimer = function (timer_name)
	{
        var timer = this._GetTimer(timer_name);
        if (timer)
            timer.Resume();
	};       
    
    Acts.prototype.StopTimer = function (timer_name)
	{
        var timer = this._GetTimer(timer_name);
        if (timer)
            timer.Remove();
	};
    
    Acts.prototype.CleanTimeLine = function ()
	{
        this.timeline.CleanAll();
	};
    
    Acts.prototype.DeleteTimer = function (timer_name)
	{
        var timer = this._GetTimer(timer_name);
        if (timer)
        {
            timer.Remove();
            delete this.timers[timer_name];
        }
	};  
    
    Acts.prototype.SetTimerParameter = function (timer_name, index, value)
	{
        this._GetTimerStruct(timer_name).params[index] = value;
	};    

    Acts.prototype.PauseTimeLine = function ()
	{     
	    this.update_with_game_time = false;
	};   

    Acts.prototype.ResumeTimeLine = function ()
	{     
	    this.update_with_game_time = true;
	};   	
    
    Acts.prototype.CreateTimer2 = function (timer_name, callback_name, callback_params)
	{
        var timer = this._GetTimer(timer_name);
        var timer_struct = this._GetTimerStruct(timer_name);
        timer_struct.command = callback_name;
        cr.shallowAssignArray(timer_struct.params, callback_params);
        if (timer)  // timer exist
            timer.Remove();
        else      // create new timer instance
            timer_struct.timer = this.CreateTimer(this, this._timer_handle, [timer_struct]);       
	};
    
    Acts.prototype.SetTimerParameters = function (timer_name, callback_params)
	{
	    var timer = this._GetTimer(timer_name);
		if (timer)
		{
		    var timer_struct = this._GetTimerStruct(timer_name);
			cr.shallowAssignArray(timer_struct.params, callback_params);
		}
	};	
   
    Acts.prototype.SetTrgTimerParameters = function (callback_params)
	{
	    var timer_name = this.exp_triggered_timer_name;
	    var timer = this._GetTimer(timer_name);
		if (timer)
		{
		    var timer_struct = this._GetTimerStruct(timer_name);
			cr.shallowAssignArray(timer_struct.params, callback_params);
		}
	};	
	
    Acts.prototype.DeleteTrgTimer = function ()
	{
	    var timer_name = this.exp_triggered_timer_name;
        var timer = this._GetTimer(timer_name);		
        if (timer)
        {
            timer.Remove();
            delete this.timers[timer_name];
        }		
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();   
    
	Exps.prototype.TimerRemainder = function (ret, timer_name)
	{
        var timer = this._GetTimer(timer_name);
        var t = (timer)? timer.RemainderTimeGet():0;     
	    ret.set_float(t);
	};
    
	Exps.prototype.TimerElapsed = function (ret, timer_name)
	{
        var timer = this._GetTimer(timer_name);
        var t = (timer)? timer.ElapsedTimeGet():0;     
	    ret.set_float(t);
	}; 

	Exps.prototype.TimerRemainderPercent = function (ret, timer_name)
	{
        var timer = this._GetTimer(timer_name);
        var t = (timer)? timer.RemainderTimePercentGet():0;     
	    ret.set_float(t);
	};
    
	Exps.prototype.TimerElapsedPercent = function (ret, timer_name)
	{
        var timer = this._GetTimer(timer_name);
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
}());


// class - TimeLine,Timer,_TimerHandler
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
        timer._remove();
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
            if (_timer_cnt==1)
                this._waiting_timer_queue.shift();
            else
                this._waiting_timer_queue.splice(0,_timer_cnt);
        }

        // do call back function with arg list
        while (this._process_timer_queue.length > 0)
        {
            this._process_timer_queue.sort(_TIMERQUEUE_SORT);
            this.triggered_timer = this._process_timer_queue.shift();
            this._timer_abs_time = this.triggered_timer.abs_time;
            //print "[TimeLine] Current Time=",this._timer_abs_time
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
            timer._suspend();
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
            timer._resume();
            this.RegistTimer(timer);
            is_success = true;
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
        var timer_lists = (activate_only)?
                          [this._waiting_timer_queue,this._process_timer_queue]:
                          [this._waiting_timer_queue,this._process_timer_queue,this._suspend_timer_queue];
        var i;
        var lists_length = timer_lists.length;
        var timer_queue, item_index;
        for(i=0;i<lists_length;i++)
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
    cr.plugins_.Rex_TimeLine.Timer = function(timeline, thisArgs, call_back_fn, args)
    {
        this.timeline = timeline;
        this.delay_time_save = 0; //delay_time
        this.delay_time = 0; //delay_time
        this._remainder_time = 0;
        this.abs_time = 0;      
        this._handler = new this._TimerHandler(thisArgs, call_back_fn, args);
        this._idle();
        this._abs_time_set(0); // delay_time
    };
    var TimerProto = cr.plugins_.Rex_TimeLine.Timer.prototype;
    
    // export functions
    TimerProto.Restart = function(delay_time)
    {
        if (delay_time != null)  // assign new delay time
        {
            this.delay_time_save = delay_time;
            this.delay_time = delay_time;
        }
        //this._handler.CleanIterator()
        this._abs_time_set(this.delay_time_save);
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

    TimerProto.ChangeRate = function(rate)
    {
        this.timeline.ChangeTimerRate(this, rate);
    };

    TimerProto.Remove = function()
    {
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

    TimerProto.ElapsedTimeGet = function()
    {
        return (this.delay_time_save - this.RemainderTimeGet());
    };  

    TimerProto.RemainderTimePercentGet = function()
    {
        return (this.delay_time_save==0)? 0:
               (this.RemainderTimeGet() / this.delay_time_save);
    };     

    TimerProto.ElapsedTimePercentGet = function()
    {
        return (this.delay_time_save==0)? 0:
               (this.ElapsedTimeGet() / this.delay_time_save);
    };       
            
    TimerProto.ExpiredTimeGet = function()
    {    
        return (this.timeline.ABS_Time - this.abs_time);
    };
    
    TimerProto.SetCallbackArgs = function(args)
    {    
        this._handler.args = args;   
    };    
    
    // export to timeline
    TimerProto.DoHandle = function()
    {
        this._idle();
        this._handler.DoHandle();
    };    
    
    // internal functions
    TimerProto._idle = function()
    {
        this._is_alive = false;
        this._is_active = false;
    };
    
    TimerProto._run = function()
    {
        this._is_alive = true;
        this._is_active = true;   
    };

    TimerProto._abs_time_set = function(delta_time)
    {
        this.abs_time = this.timeline.CurrentTimeGet() + delta_time;
    };
    
    TimerProto._suspend = function()
    {
        this._remainder_time = this.abs_time - this.timeline.CurrentTimeGet();
        this._is_active = false;
    };

    TimerProto._resume = function()
    {
        this._abs_time_set(this._remainder_time);
        this._is_active = true;
    };
        
    TimerProto._remove = function()
    {
        this._idle();
    };

    TimerProto._change_rate = function(rate)
    {
        if (this._is_active)
        {
            abs_time = this.timeline.CurrentTimeGet();
            remainder_time = this.abs_time - abs_time;
            this.abs_time = abs_time + (remainder_time*rate);
        }
        else
        {
            this._remainder_time *= rate;
        }
    };
    
    // _TimerHandler
    cr.plugins_.Rex_TimeLine._TimerHandler = function(thisArg, call_back_fn, args)
    {   
        this.thisArg = thisArg;
        this.call_back_fn = call_back_fn;
        this.args = args;
    };
    var _TimerHandlerProto = cr.plugins_.Rex_TimeLine._TimerHandler.prototype;
    TimerProto._TimerHandler = cr.plugins_.Rex_TimeLine._TimerHandler;    
    
    _TimerHandlerProto.DoHandle = function()
    {   
        this.call_back_fn.apply(this.thisArg, this.args);
    };
}());