// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_text_typing = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_text_typing.prototype;
		
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
        this.timeline = null;     
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{    
        this.typing_timer = null;
        this.typing_speed = 0; 
        this.content = "";        
	};

	behinstProto.onDestroy = function()
	{    
        this.typing_timer_remove();     
	};    
    
	behinstProto.typing_timer_remove = function ()
	{
        if (this.typing_timer != null)
            this.typing_timer.Remove();
    };  
	
	behinstProto.tick = function ()
	{
	};
	
	behinstProto.SetText = function (param)
	{
        cr.plugins_.Text.prototype.acts.SetText.apply(this.inst, [param]);
	};    
    
    behinstProto._get_timer = function ()
    {
        var timer = this.typing_timer;
        if  (timer == null)
        {
            if (this.type.timeline == null)
                alert("Text typing need a timeline object");
            timer = this.type.timeline.CreateTimer(this, this.text_typing_handler);
        }
        return timer;
    };
    
	behinstProto._start_typing = function (text, speed)
	{
        if (speed != 0)
        {
            this.typing_timer = this._get_timer();
            this.typing_speed = speed;
            this.typing_timer.SetCallbackArgs([1]);
            this.typing_timer.Start(0);
        }
        else
        {
            this.SetText(this.content);
            this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTypingCompleted, this.inst);
        }
    };
    
	behinstProto.text_typing_handler = function(text_index)
	{  
        this.SetText(this.content.slice(0, text_index));
        this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTextTyping, this.inst);       
        text_index += 1;        
        if (text_index <= this.content.length)
        {
            this.typing_timer.SetCallbackArgs([text_index]);
            this.typing_timer.Restart(this.typing_speed);
        }
        else
            this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTypingCompleted, this.inst);
	};  
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
 
    Cnds.prototype.OnTextTyping = function ()
	{
		return true;
	};  
 
    Cnds.prototype.OnTypingCompleted = function ()
	{
		return true;
	}; 
    
	Cnds.prototype.IsTextTyping = function ()
	{ 
        return this.typing_timer.IsActive();
	}; 
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
    Acts.prototype.SetupTimer = function (timeline_objs)
	{
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.type.timeline = timeline; 
        else
            alert ("Text-typing should connect to a timeline object");
	}; 

	Acts.prototype.TypeText = function(param, speed)
	{
        if (typeof param === "number")
            param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		
        this.content = param.toString();
        this._start_typing(this.content, speed);
	};

	Acts.prototype.SetTypingSpeed = function(speed)
	{
        this.typing_speed = speed;
        var timer = this.typing_timer;
        if (timer.IsActive())
        {
            timer.Restart(speed);
        }
	};
    
	Acts.prototype.StopTyping = function(is_show_all)
	{
        this.typing_timer_remove();   
        if (is_show_all)
        {
            this.SetText(this.content);
            this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTypingCompleted, this.inst);
        }
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
    Exps.prototype.TypingSpeed = function (ret)
	{
	    ret.set_float( this.typing_speed );
	};
}());