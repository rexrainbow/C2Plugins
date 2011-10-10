// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.MyTimeLine = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.MyTimeLine.prototype;
		
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
        this.update_with_game_time = this.properties[0];
        
        // timeline  
        this.timeline = new cr.plugins_.MyTimeLine.TimeLine();
        this.runtime.tickMe(this);
        // push manual
        this.manual_push = false;
        this.manual_current_time = 0;
        
        // timers
        this.callback = null;        
        this.timers = {}; 
        
	};
    
    instanceProto.tick = function()
    {
        if (this.update_with_game_time==1)
        {
            this.timeline.Dispatch(this.runtime.kahanTime.sum);
        }
        else if (this.manual_push)  // this.update_with_game_time==0
        {
            this.timeline.Dispatch(this.manual_current_time);
        }
    };
    
    instanceProto._timer_handle = function(name, args)
    {
        this.callback.CallFn(name, args);    
    };
    
    // export: get new timer instance
    instanceProto.CreateTimer = function(thisArg, call_back_fn, args)
    {
        return (new cr.plugins_.MyTimeLine.Timer(this.timeline, thisArg, call_back_fn, args));
    };
    
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;

	cnds.IsRunning = function ()
	{
        var is_running = false;
        var timer = this.timers[timer_name].timer;
        if (timer)
        {
            is_running = timer.IsActive();
        }       
		return is_running;
	};
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

    acts.PushTimeLine = function (delta_time)
	{
        // push manually
        this.manual_push = true;
        this.manual_current_time += delta_time;
	};   
    
    acts.Setup = function (fn_objs)
	{
        this.callback = fn_objs.instances[0];
	};      
    
    acts.CreateTimer = function (timer_name, fn_name, fn_args)
	{
        var timer = this.timers[timer_name];
        var cb_args = [fn_name, fn_args];
        if (timer)  // timer exist
        {
            timer.Remove();
            timer.SetCallbackArgs(cb_args);
        }
        else      // create new timer instance
        {
            this.timers[timer_name] = this.CreateTimer(this, this._timer_handle, cb_args);
        }      
	}; 
    
    acts.StartTimer = function (timer_name, delay_time)
	{
        var timer = this.timers[timer_name];
        if (timer)
        {
            timer.Start(delay_time);
        }
	};

    acts.StartTrgTimer = function (delay_time)
	{
        var timer = this.timeline.triggered_timer;
        if (timer)
        {
            timer.Start(delay_time);
        }
	}; 
    
    acts.PauseTimer = function (timer_name)
	{
        var timer = this.timers[timer_name];
        if (timer)
        {
            timer.Suspend();
        }
	};   

    acts.ResumeTimer = function (timer_name)
	{
        var timer = this.timers[timer_name];
        if (timer)
        {
            timer.Resume();
        }
	};       
    
    acts.StopTimer = function (timer_name)
	{
        var timer = this.timers[timer_name];
        if (timer)
        {
            timer.Remove();
        }
	};    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;   
    
	exps.TimerRemainder = function (ret, timer_name)
	{
        var timer = (timer_name==null)? 
                    this.timeline.triggered_timer:
                    this.timers[timer_name];
        var val = (timer)? timer.RemainderTimeGet():0;     
	    ret.set_float(val);
	};
    
	exps.TimerElapsed = function (ret, timer_name)
	{
        var timer = (timer_name==null)? 
                    this.timeline.triggered_timer:
                    this.timers[timer_name];
        var val = (timer)? timer.ElapsedTimeGet():0;     
	    ret.set_float(val);
	};    
}());


// class - TimeLine,Timer,_TimerHandler
(function ()
{
    cr.plugins_.MyTimeLine.TimeLine = function()
    {
        this.CleanAll();    
    };
    var TimeLineProto = cr.plugins_.MyTimeLine.TimeLine.prototype;
    
    var _TIMERQUEUE_SORT = function(timerA, timerB)
    {
        return (timerA._abs_time > timerB._abs_time);
    }
    
    TimeLineProto.CleanAll = function()
	{
        this.triggered_timer = null;     
        this._abs_time = 0;
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

    TimeLineProto.Dispatch = function(current_time)
    {
        this._abs_time = current_time;
        this._timer_abs_time = current_time;

        // sort _waiting_timer_queue
        this._waiting_timer_queue.sort(_TIMERQUEUE_SORT);

        // get time-out timer
        this._process_timer_queue = [];
        var i;
        var quene_length = this._waiting_timer_queue.length;
        var timer;
        for (i=0; i<quene_length; i++)
        {
            timer = this._waiting_timer_queue[i];
            if (this._is_timer_time_out(timer))
            {
                this._process_timer_queue.push(timer);
            }
        }
        
        // remainder timers
        quene_length = this._process_timer_queue.length;
        if (quene_length)
        {
            if (quene_length==1)
                this._waiting_timer_queue.shift();
            else
                this._waiting_timer_queue.splice(0,quene_length);
        }

        // do call back function with arg list
        while (this._process_timer_queue.length > 0)
        {
            this._process_timer_queue.sort(_TIMERQUEUE_SORT);
            this.triggered_timer = this._process_timer_queue.shift();
            this._timer_abs_time = timer._abs_time;
            //print "[TimeLine] Current Time=",this._timer_abs_time
            this.triggered_timer.DoHandle();
        }        
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
        return (timer._abs_time < this._abs_time);
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
    cr.plugins_.MyTimeLine.Timer = function(timeline, thisArgs, call_back_fn, args)
    {
        this.timeline = timeline;
        this.delay_time_save = 0; //delay_time
        this.delay_time = 0; //delay_time
        this._remainder_time = 0;
        this._abs_time = 0;      
        this._handler = new this._TimerHandler(thisArgs, call_back_fn, args);
        this._idle();
        this._abs_time_set(0); // delay_time
    };
    var TimerProto = cr.plugins_.MyTimeLine.Timer.prototype;
    
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
                this._remainder_time = this._abs_time;
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
            remainder_time = this._abs_time - this.timeline.CurrentTimeGet();
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
            
    TimerProto.DeltaErrorTickGet = function()
    {    
        return (this.timeline._abs_time - this._abs_time);   
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
        this._abs_time = this.timeline.CurrentTimeGet() + delta_time;
    };
    
    TimerProto._suspend = function()
    {
        this._remainder_time = this._abs_time - this.timeline.CurrentTimeGet();
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
            remainder_time = this._abs_time - abs_time;
            this._abs_time = abs_time + (remainder_time*rate);
        }
        else
        {
            this._remainder_time *= rate;
        }
    };
    
    // _TimerHandler
    cr.plugins_.MyTimeLine._TimerHandler = function(thisArg, call_back_fn, args)
    {   
        this.thisArg = thisArg;
        this.call_back_fn = call_back_fn;
        this.args = args;
    };
    var _TimerHandlerProto = cr.plugins_.MyTimeLine._TimerHandler.prototype;
    TimerProto._TimerHandler = cr.plugins_.MyTimeLine._TimerHandler;    
    
    _TimerHandlerProto.DoHandle = function()
    {   
        this.call_back_fn.apply(this.thisArg, this.args);
    };
}());