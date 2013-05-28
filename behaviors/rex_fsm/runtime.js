// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_FSM = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_FSM.prototype;
		
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
        this.activated = (this.properties[0] == 1);
		var previous_state = "Off";		
		var current_state = this.properties[1];		
        current_state = (current_state!="")? current_state:"Off";	           
        this.fsm = new cr.behaviors.Rex_FSM.FSMKlass(this, previous_state, current_state); 
        this.is_echo = false;
        this.is_my_call = false; 
        this.next_state = null;                                                   
	};  
    
	behinstProto.tick = function ()
	{
	};
	
    behinstProto.run_trigger = function(trigger)
    {
        this.is_echo = false;
		this.is_my_call = true;
        this.runtime.trigger(trigger, this.inst);
		this.is_my_call = false;
        return (this.is_echo);        
    };
	
    behinstProto.get_next_state = function()
    {
        this.next_state = null;
		this.run_trigger(cr.behaviors.Rex_FSM.prototype.cnds.OnLogic);
        return this.next_state;
    }; 

	behinstProto.saveToJSON = function ()
	{    
		return { "en": this.activated,
		         "fsm": this.fsm.saveToJSON()
		         };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
	    this.activated = o["en"];
	    this.fsm.loadFromJSON(o["fsm"]);
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnEnter = function (name)
	{
	    if (!this.is_my_call)
		    return false;
			
        this.is_echo = true;
		return (this.fsm.CurState == name);
	};

	Cnds.prototype.OnDefaultEnter = function ()
	{
	    if (!this.is_my_call)
		    return false;	
			
		return true;
	}; 	
	
	Cnds.prototype.OnExit = function (name)
	{
	    if (!this.is_my_call)
		    return false;	
			
        this.is_echo = true;
		return (this.fsm.PreState == name);
	};	
    
	Cnds.prototype.OnDefaultExit = function ()
	{
	    if (!this.is_my_call)
		    return false;	
			
		return true;
	}; 	    

	Cnds.prototype.OnTransfer = function (name_from, name_to)
	{
	    if (!this.is_my_call)
		    return false;	
			
        this.is_echo = true;
		return ((this.fsm.PreState == name_from) && (this.fsm.CurState == name_to));
	};	
	Cnds.prototype.OnStateChanged = function ()
	{
	    if (!this.is_my_call)
		    return false;
			
		return true;
	};     
	Cnds.prototype.OnLogic = function (name)
	{
	    if (!this.is_my_call)
		    return false;
			
        this.is_echo = true;
		return (this.fsm.CurState == name);
	}; 
	Cnds.prototype.IsCurState = function (name)
	{
		return (this.fsm.CurState == name);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s==1);
	};     

    Acts.prototype.Request = function ()
	{
        if (this.activated)
	        this.fsm.Request();
	};  
    
    Acts.prototype.GotoState = function (new_state)
	{
        if (this.activated)    
	        this.fsm.Request(new_state);
	};     

	Acts.prototype.NextStateSet = function (state)
	{
        this.next_state = state;
	};      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.CurState = function (ret)
	{
	    ret.set_string(this.fsm.CurState);
	};	
	
	Exps.prototype.PreState = function (ret)
	{
	    ret.set_string(this.fsm.PreState);
	};
}());

(function ()
{
    cr.behaviors.Rex_FSM.FSMKlass = function(plugin, previous_state, current_state)
    {
        this.plugin = plugin;
        this.PreState = previous_state;
        this.CurState = current_state;
    };
    var FSMKlassProto = cr.behaviors.Rex_FSM.FSMKlass.prototype;

    FSMKlassProto.Request = function(new_state)
    {
        if (new_state == null)
        {
            new_state = this.plugin.get_next_state();
            if (new_state == null)
                return;
        }
            
        // new_state != null: state transfer
        this.PreState = this.CurState;
        this.CurState = new_state;
                
        var pre_state = this.PreState;
        var cur_state = this.CurState;
        
        // trigger OnStateChanged first
		this.plugin.run_trigger(cr.behaviors.Rex_FSM.prototype.cnds.OnStateChanged);
                        
        // try to run transfer_action
        var is_echo = this.plugin.run_trigger(cr.behaviors.Rex_FSM.prototype.cnds.OnTransfer);
        if (is_echo)
            return;
         
        // no transfer_action found
        this._run_exit_action(pre_state);
        this._run_enter_action(cur_state);
    };

    FSMKlassProto._run_exit_action = function(pre_state)
    {
	    var is_echo = this.plugin.run_trigger(cr.behaviors.Rex_FSM.prototype.cnds.OnExit);
        // no exit handle event, try to trigger default exit event
		if (is_echo)
		    return;
	    this.plugin.run_trigger(cr.behaviors.Rex_FSM.prototype.cnds.OnDefaultExit);  
    };
    
    FSMKlassProto._run_enter_action = function(cur_state)
    {
	    var is_echo = this.plugin.run_trigger(cr.behaviors.Rex_FSM.prototype.cnds.OnEnter);
        // no enter handle event, try to trigger default enter event
		if (is_echo)
		    return;
	    this.plugin.run_trigger(cr.behaviors.Rex_FSM.prototype.cnds.OnDefaultEnter);    
    };  
	
	FSMKlassProto.saveToJSON = function ()
	{    
		return { "ps": this.PreState,
		         "cs": this.CurState
			   };
	};
	
	FSMKlassProto.loadFromJSON = function (o)
	{
	    this.PreState = o["ps"];
		this.CurState = o["cs"];
	};	
}());