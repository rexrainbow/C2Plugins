// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Flash = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Flash.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.activated = this.properties[0];
        this.is_run = this.properties[1];
        this.destroy_at_finish = this.properties[9];
        this.cur_cmd = null;
        this.is_my_call = false;
        
        var start = this.properties[2];
        var end = this.properties[3];       
        this.CmdQueue = new cr.behaviors.Rex_Flash.CmdQueue(this.properties[8]);
        this.CmdStart2End = new cr.behaviors.Rex_Flash.CmdGradChange(this.inst, 
                                                                    start, 
                                                                    end, 
                                                                    this.properties[4]);
        this.CmdEndHold = new cr.behaviors.Rex_Flash.CmdWait(this.inst, 
                                                            end, 
                                                            this.properties[5]);
        this.CmdEnd2Start = new cr.behaviors.Rex_Flash.CmdGradChange(this.inst, 
                                                                    end, 
                                                                    start, 
                                                                    this.properties[6]);
        this.CmdStartHold = new cr.behaviors.Rex_Flash.CmdWait(this.inst, 
                                                             start, 
                                                             this.properties[7]);    
        
        this.CmdQueue.Push(this.CmdStart2End);
        this.CmdQueue.Push(this.CmdEndHold);
        this.CmdQueue.Push(this.CmdEnd2Start);
        this.CmdQueue.Push(this.CmdStartHold);     

        this.inst.opacity = start;
	    this.runtime.redraw = true;
	};

	behinstProto.tick = function ()
	{
        if ( (this.activated==0) || (this.is_run==0) )
            return;
         
        var dt = this.runtime.getDt(this.inst);
        while(dt)
        {
            if (this.cur_cmd == null) // try to get new cmd
            {
                this.cur_cmd = this.CmdQueue.GetCmd();
                if (this.cur_cmd != null)
                {
                    // new command start                    
                    this.cur_cmd.Init();
                }
                else            
                {
                    // flash finish                    
                    this.is_run = false;
                    this.is_my_call = true;
                    this.runtime.trigger(cr.behaviors.Rex_Flash.prototype.cnds.OnFlashFinish, this.inst); 
                    this.is_my_call = false;
                    if (this.destroy_at_finish==1)
                    {
                        this.runtime.DestroyInstance(this.inst);
                    }
                    break;
                }
            }
            
            dt = this.cur_cmd.Tick(dt);
            this.runtime.redraw |= this.cur_cmd.redraw;
            if (this.cur_cmd.is_done)
            {                         
                this.cur_cmd = null;
            }
        } 
	};
    
	behinstProto.Start = function ()
	{
        this.cur_cmd = null;
        this.is_run = 1;
		this.CmdQueue.Reset();
	};  
    
	behinstProto.End = function ()
	{
        this.cur_cmd = null;
        this.is_run = 0;
	};     
    

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.OnFlashFinish = function ()
	{
		return (this.is_my_call);
	};
    
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetActivated = function (s)
	{
		this.activated = s;
	};  

	acts.Start = function ()
	{
        this.Start();
	};     
    
	acts.End = function ()
	{
        this.End();
	};  

	acts.SetParameters = function (s)
	{
		var params = s.split(",");
        
        var start = parseFloat(params[0]);
        var end = parseFloat(params[1]);
        this.CmdStart2End.SetStartEnd(start, end);
        this.CmdEndHold.SetHold(end);
        this.CmdEnd2Start.SetStartEnd(end, start);
        this.CmdStartHold.SetHold(start);
        this.CmdStart2End.SetDuration(parseFloat(params[2]));
        this.CmdEndHold.SetDuration(parseFloat(params[3]));
        this.CmdEnd2Start.SetDuration(parseFloat(params[4]));
        this.CmdStartHold.SetDuration(parseFloat(params[5]));  
        this.CmdQueue.SetRepeatCnt(parseFloat(params[6]));       
	};  
    
	acts.SetStartEndValue = function (start, end)
	{
        this.CmdStart2End.SetStartEnd(start, end);
        this.CmdEndHold.SetHold(end);
        this.CmdEnd2Start.SetStartEnd(end, start);
        this.CmdStartHold.SetHold(start);    
	};  
        
	acts.SetDuration = function (start2end, endHold, end2start, startHold)
	{
        this.CmdStart2End.SetDuration(start2end);
        this.CmdEndHold.SetDuration(endHold);
        this.CmdEnd2Start.SetDuration(end2start);
        this.CmdStartHold.SetDuration(startHold);  
	}; 
    
	acts.SetRepeatCount = function (repeat_count)
	{
        this.CmdQueue.SetRepeatCnt(repeat_count);    
	}; 
    
	acts.SetDestroy = function (s)
	{
        this.destroy_at_finish = s;    
	}; 
    
	acts.Flash = function (period, repeat_count)
	{

        var start = 1;
        var end = 0;
        var duration = period/4
        this.CmdStart2End.SetStartEnd(start, end);
        this.CmdEndHold.SetHold(end);
        this.CmdEnd2Start.SetStartEnd(end, start);
        this.CmdStartHold.SetHold(start);
        this.CmdStart2End.SetDuration(duration);
        this.CmdEndHold.SetDuration(duration);
        this.CmdEnd2Start.SetDuration(duration);
        this.CmdStartHold.SetDuration(duration);  
        this.CmdQueue.SetRepeatCnt(repeat_count);    
        
        this.destroy_at_finish = 0; 
        this.activated = 1;
        this.Start();        
	};     
    

	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;
    
	exps.Activated = function (ret)
	{
		ret.set_int(this.activated);
	};    
    
	exps.StartValue = function (ret)
	{
		ret.set_float(this.CmdStartHold.hold);
	};  
    
	exps.EndValue = function (ret)
	{
		ret.set_float(this.CmdEndHold.hold);
	};  
    
	exps.Start2End = function (ret)
	{
		ret.set_float(this.CmdStart2End.duration_save);
	};  
    
	exps.EndHold = function (ret)
	{
		ret.set_float(this.CmdEndHold.duration_save);
	};
    
	exps.End2Start = function (ret)
	{
		ret.set_float(this.CmdEnd2Start.duration_save);
	};  
    
	exps.StartHold = function (ret)
	{
		ret.set_float(this.CmdStartHold.duration_save);
	};    
    
	exps.Repeat = function (ret)
	{
		ret.set_int(this.CmdQueue.repeat_count_save);
	};   
    
	exps.IsDestroy = function (ret)
	{
		ret.set_int(this.destroy_at_finish);
	};   
    

       
}());


(function ()
{
    // command queue
    cr.behaviors.Rex_Flash.CmdQueue = function(repeat_count)
    {
        this.CleanAll();
        this.SetRepeatCnt(repeat_count);
    };
    var CmdQueueProto = cr.behaviors.Rex_Flash.CmdQueue.prototype;
    
    CmdQueueProto.CleanAll = function()
	{
        this.queue_index = 0;    
        this._queue = [];
	};
    
    CmdQueueProto.Reset = function()
	{        
        this.repeat_count = this.repeat_count_save;    
        this.queue_index = 0;
	};
    
    CmdQueueProto.Push = function(item)
    {
        this._queue.push(item);
    };
    
    CmdQueueProto.PushList = function(items)
    {
        var i;
        var item_len = items.length;
        for (i=0; i<item_len; i++)
        {
            this._queue.push(items[i]);
        }
    };  
    
    CmdQueueProto.GetCmd = function()
	{
        var cmd;
        cmd = this._queue[this.queue_index];
        var index = this.queue_index+1;
        if (index >= this._queue.length)
        {        
            var is_last_rpt_cnt = (this.repeat_count==1);
            this.queue_index = (!is_last_rpt_cnt)? 0:   // repeat
                                                  (-1); // finish
            if (!is_last_rpt_cnt)
                this.repeat_count -= 1;
        }
        else
            this.queue_index = index;

        return cmd;
	};
    
    CmdQueueProto.SetRepeatCnt = function(repeat_count)
    {
        this.repeat_count_save = repeat_count;
        this.repeat_count = repeat_count; 
    };

    
    
    var SetDuration = function(duration)
    {
        this.duration_save = duration;        
    };     
    
    // GradChange
    cr.behaviors.Rex_Flash.CmdGradChange = function(inst, start, target, duration)
    {
        this.inst = inst;
        this.start = start;
        this.target = target;
        this.duration_save = duration; 
        this.is_done = true;
        this.redraw = false;       
    };
    var CmdGradChangeProto = cr.behaviors.Rex_Flash.CmdGradChange.prototype;
    
    CmdGradChangeProto.Init = function()
    {
        this.current_opacity = this.start;
        this.delta = (this.target - this.start)/this.duration_save;
        this.remain_duration = this.duration_save;        
        this.is_done = false;
        this.is_pass = (this.duration_save == 0);        
    };    
    
    CmdGradChangeProto.Tick = function(dt)
    {
        if (this.is_pass)
        {
            this.redraw = false;
            this.is_done = true;
            return dt;
        }

        this.remain_duration -= dt;
        if (this.remain_duration <= 0)
        {
		    this.inst.opacity = this.target;     
            this.is_done = true;
        }
        else
        {
            this.current_opacity += (this.delta * dt);         
		    this.inst.opacity = this.current_opacity;              
        }  
        this.redraw = true;        
        
        
        return 0;        
    }; 
    
    CmdGradChangeProto.SetDuration = function(duration)
    {
        SetDuration.call(this, duration);        
    };  

    CmdGradChangeProto.SetStartEnd = function(start, target)
    {
        this.start = start;
        this.target = target;     
    };
    
    
    // wait
    cr.behaviors.Rex_Flash.CmdWait = function(inst, hold, duration)
    {
        this.inst = inst;    
        this.hold = hold;
        this.duration_save = duration;
        this.is_done = true;
        this.redraw = false;        
    };
    var CmdWaitProto = cr.behaviors.Rex_Flash.CmdWait.prototype;
    
    CmdWaitProto.Init = function()
    {
        this.remain_duration = this.duration_save;    
        this.is_done = false;
        this.is_pass = (this.duration_save == 0);
    };    
    
    CmdWaitProto.Tick = function(dt)
    {
        if (this.is_pass)
        {
            this.is_done = true;
            return dt;
        }
        
        if (this.inst.opacity != this.hold)
        {
            this.inst.opacity = this.hold;
            this.redraw = true;        
        }
        else
        {
            this.redraw = false;
        }
        
        this.remain_duration -= dt;
        if (this.remain_duration <= 0)
        {
            this.is_done = true;
        }  
        
        return 0;
    };  
    
    CmdWaitProto.SetHold = function(hold)
    {
        this.hold = hold;    
    };    
    
    CmdWaitProto.SetDuration = function(duration)
    {
        SetDuration.call(this, duration);        
    };      
    
    
}());
