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

        if (start != this.inst.opacity )
        {
            this.inst.opacity = start;
	        this.runtime.redraw = true;
        }
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
    
	behinstProto.saveToJSON = function ()
	{ 
		return { "en": this.activated,
		         "ir": this.is_run,
                 "daf": this.destroy_at_finish,
                 "cq": this.CmdQueue.saveToJSON(),
                 "cci": (this.cur_cmd!=null)? this.CmdQueue.cur_cmd_queuq_index:null,
                };
	};
    
	behinstProto.loadFromJSON = function (o)
	{    
        this.activated = o["en"];
        this.is_run = o["ir"];   
        this.destroy_at_finish = o["daf"];
        this.CmdQueue.loadFromJSON(o["cq"]);
        var cur_cmd_queuq_index = o["cci"];
        if (cur_cmd_queuq_index != null)
            this.cur_cmd = this.CmdQueue.GetCmd(cur_cmd_queuq_index);        
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnFlashFinish = function ()
	{
		return (this.is_my_call);
	};
    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = s;
	};  

	Acts.prototype.Start = function ()
	{
        this.Start();
	};     
    
	Acts.prototype.End = function ()
	{
        this.End();
	};  

	Acts.prototype.SetParameters = function (s)
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
    
	Acts.prototype.SetStartEndValue = function (start, end)
	{
        this.CmdStart2End.SetStartEnd(start, end);
        this.CmdEndHold.SetHold(end);
        this.CmdEnd2Start.SetStartEnd(end, start);
        this.CmdStartHold.SetHold(start);    
	};  
        
	Acts.prototype.SetDuration = function (start2end, endHold, end2start, startHold)
	{
        this.CmdStart2End.SetDuration(start2end);
        this.CmdEndHold.SetDuration(endHold);
        this.CmdEnd2Start.SetDuration(end2start);
        this.CmdStartHold.SetDuration(startHold);  
	}; 
    
	Acts.prototype.SetRepeatCount = function (repeat_count)
	{
        this.CmdQueue.SetRepeatCnt(repeat_count);    
	}; 
    
	Acts.prototype.SetDestroy = function (s)
	{
        this.destroy_at_finish = s;    
	}; 
    
	Acts.prototype.Flash = function (period, repeat_count)
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
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int(this.activated);
	};    
    
	Exps.prototype.StartValue = function (ret)
	{
		ret.set_float(this.CmdStartHold.hold);
	};  
    
	Exps.prototype.EndValue = function (ret)
	{
		ret.set_float(this.CmdEndHold.hold);
	};  
    
	Exps.prototype.Start2End = function (ret)
	{
		ret.set_float(this.CmdStart2End.duration_save);
	};  
    
	Exps.prototype.EndHold = function (ret)
	{
		ret.set_float(this.CmdEndHold.duration_save);
	};
    
	Exps.prototype.End2Start = function (ret)
	{
		ret.set_float(this.CmdEnd2Start.duration_save);
	};  
    
	Exps.prototype.StartHold = function (ret)
	{
		ret.set_float(this.CmdStartHold.duration_save);
	};    
    
	Exps.prototype.Repeat = function (ret)
	{
		ret.set_int(this.CmdQueue.repeat_count_save);
	};   
    
	Exps.prototype.IsDestroy = function (ret)
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
        this.cur_cmd_queuq_index = -1;
        this._queue = [];
	};
    
    CmdQueueProto.Reset = function()
	{        
        this.repeat_count = this.repeat_count_save;    
        this.queue_index = 0;
        this.cur_cmd_queuq_index = -1;
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
    
    CmdQueueProto.GetCmd = function(index)
	{
        if (index != null)
            return this._queue[index];
            
        var cmd;
        this.cur_cmd_queuq_index = this.queue_index;
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
	
	CmdQueueProto.saveToJSON = function ()
	{ 
	    var i, cnt=this._queue.length, queue_save=[];
	    for (i=0; i<cnt; i++)
	        queue_save.push(this._queue[i].saveToJSON());
	        
		return { "i": this.queue_index,
                 "cci": this.cur_cmd_queuq_index,
		         "q": queue_save,
                 "rptsv": this.repeat_count_save,
                 "rpt": this.repeat_count
                };
	};
    
	CmdQueueProto.loadFromJSON = function (o)
	{    
        this.queue_index = o["i"];
        this.cur_cmd_queuq_index = o["cci"];
        	    
	    var i, cnt=this._queue.length, queue_save=o["q"];
	    for (i=0; i<cnt; i++)
	        this._queue[i].loadFromJSON(queue_save[i])
	        
        this.repeat_count_save = o["rptsv"];
        this.repeat_count = o["rpt"];   
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
        this.duration_save = duration;       
    };  

    CmdGradChangeProto.SetStartEnd = function(start, target)
    {
        this.start = start;
        this.target = target;     
    };
	
	CmdGradChangeProto.saveToJSON = function ()
	{ 
		return { "start": this.start,
		         "target": this.target,
                 "durs": this.duration_save,
                 "done": this.is_done,
                 "co" : this.current_opacity,
                 "d" : this.delta,
                 "rm" : this.remain_duration,                 
                 "pass": this.is_pass,                 
                };
	};
    
	CmdGradChangeProto.loadFromJSON = function (o)
	{    
        this.start = o["start"];
        this.target = o["target"]; 
        this.duration_save = o["durs"];
        this.is_done = o["done"];  
        this.current_opacity = o["co"];
        this.delta = o["d"];
        this.remain_duration = o["rm"];
        this.is_pass = o["pass"]; 
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
        this.duration_save = duration;     
    };      
	
	CmdWaitProto.saveToJSON = function ()
	{ 
		return { "hold": this.hold,
                 "durs": this.duration_save,
                 "done": this.is_done,
                 "rm" : this.remain_duration,                 
                 "pass": this.is_pass,                 
                };
	};
    
	CmdWaitProto.loadFromJSON = function (o)
	{    
        this.hold = o["hold"];
        this.duration_save = o["durs"];
        this.is_done = o["done"];  
        this.remain_duration = o["rm"];
        this.is_pass = o["pass"]; 
	};	
}());
