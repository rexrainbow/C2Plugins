// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.MyFSM = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.MyFSM.prototype;
		
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
        this.start_state = this.properties[1];
		this.previous_state = "Off";	
        this.current_state = "Off";	
        this.args = {};
        this.is_echo = false;	
        
        this._state_reset();        
	};
    
	behinstProto._state_reset = function ()
	{
        this._state_transition("Off");
        if (this.start_state != "Off")
        {
            this._state_transition(this.start_state);
        }
	};    
    
	behinstProto.tick = function ()
	{
	};
	
	behinstProto._state_transition = function (new_state)
	{
	    this.previous_state = this.current_state;
		this.current_state = new_state;
		this.is_echo = false;
		this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnTransfer, this);
		if (!this.is_echo)
		{
            this.is_echo = false;
		    this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnExit, this);
            if (!this.is_echo)
            {
                this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnDefaultExit, this);
            }
            this.is_echo = false;
			this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnEnter, this);
            if (!this.is_echo)
            {
                this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnDefaultEntert, this);
            }            
		}
	};

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;
    
	cnds.OnRequest = function (name)
	{
	    var is_my_call = (this.current_state == name);
        this.is_echo |= is_my_call;
		return is_my_call;
	};   
    
	cnds.OnDefaultRequest = function ()
	{
		return true;
	};   	
    
	cnds.OnEnter = function (name)
	{
		return (this.current_state == name);
	};

	cnds.OnDefaultEnter = function ()
	{
		return true;
	}; 	
	
	cnds.OnExit = function (name)
	{
		return (this.previous_state == name);
	};	
    
	cnds.OnDefaultExit = function ()
	{
		return true;
	}; 	    

	cnds.OnTransfer = function (name_from, name_to)
	{
	    var is_my_call = ((this.previous_state == name_from) && 
		                  (this.current_state == name_to));
        this.is_echo |= is_my_call;
		return is_my_call;
	};		
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;
 
 	acts.CleanArguments = function ()
	{
        this.args = {};
	};   
    
	acts.SetArgument = function (index, value)
	{
        this.args[index] = value;
	};  

    acts.Request = function ()
	{
		this.is_echo = false;
		this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnRequest, this);
        if (!this.is_echo)
        {
		    this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnDefaultRequest, this);        
        }
	};  
    
 	acts.Transit = function (new_state)
	{
        if (this.default_transitions != null)
        {
        }
        this._state_transition(new_state);
	};
    
  	acts.ForceTransit = function (new_state)
	{
        this._state_transition(new_state);
	};   
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	exps.CurState = function (ret)
	{
	    ret.set_string( this.current_state );
	};	
	
	exps.PreState = function (ret)
	{
	    ret.set_string( this.previous_state );
	};
}());