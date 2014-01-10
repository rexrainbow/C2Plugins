// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Behavior class
cr.plugins_.Rex_FSM = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_FSM.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var behtypeProto = pluginProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Behavior instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;      
	};

	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
        this.activated = (this.properties[0] == 1);
		var previous_state = "Off";		
		var current_state = this.properties[1];		
        current_state = (current_state!="")? current_state:"Off";
        this.fsm = new cr.plugins_.Rex_FSM.FSMKlass(this, previous_state, current_state); 
        this.is_echo = false;
        this.next_state = null;
	};  
	
    instanceProto.run_trigger = function(trigger)
    {
        this.is_echo = false;
        this.runtime.trigger(trigger, this);
        return (this.is_echo);        
    };
	
    instanceProto.get_next_state = function()
    {
        this.next_state = null;
		this.run_trigger(cr.plugins_.Rex_FSM.prototype.cnds.OnLogic);
        return this.next_state;
    }; 

	instanceProto.saveToJSON = function ()
	{    
		return { "en": this.activated,
		         "fsm": this.fsm.saveToJSON()
		         };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.activated = o["en"];
	    this.fsm.loadFromJSON(o["fsm"]);
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{	  
		propsections.push({
			"title": this.type.name,
			"properties": [{"name": "Current", "value": this.fsm.CurState},
			               {"name": "Previous", "value": this.fsm.PreState}]
		});
	};
	/**END-PREVIEWONLY**/
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnEnter = function (name)
	{
        this.is_echo = true;
		return (this.fsm.CurState == name);
	};

	Cnds.prototype.OnDefaultEnter = function ()
	{
		return true;
	}; 	
	
	Cnds.prototype.OnExit = function (name)
	{
        this.is_echo = true;
		return (this.fsm.PreState == name);
	};	
    
	Cnds.prototype.OnDefaultExit = function ()
	{
		return true;
	}; 	    

	Cnds.prototype.OnTransfer = function (name_from, name_to)
	{
        this.is_echo = true;
		return ((this.fsm.PreState == name_from) && (this.fsm.CurState == name_to));
	};	
	Cnds.prototype.OnStateChanged = function ()
	{
		return true;
	};     
	Cnds.prototype.OnLogic = function (name)
	{
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
	pluginProto.acts = new Acts();
    
	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s==1);
	};     
	
    Acts.prototype.Request = function ()
	{
        if (!this.activated)
            return;

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
	pluginProto.exps = new Exps();

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
    cr.plugins_.Rex_FSM.FSMKlass = function(plugin, previous_state, current_state)
    {
        this.plugin = plugin;
        this.PreState = previous_state;
        this.CurState = current_state;
    };
    var FSMKlassProto = cr.plugins_.Rex_FSM.FSMKlass.prototype;
	
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
		this.plugin.run_trigger(cr.plugins_.Rex_FSM.prototype.cnds.OnStateChanged);
                        
        // try to run transfer_action
        var is_echo = this.plugin.run_trigger(cr.plugins_.Rex_FSM.prototype.cnds.OnTransfer);
        if (is_echo)
            return;
         
        // no transfer_action found
        this._run_exit_action(pre_state);
        this._run_enter_action(cur_state);
    };

    FSMKlassProto._run_exit_action = function(pre_state)
    {
	    var is_echo = this.plugin.run_trigger(cr.plugins_.Rex_FSM.prototype.cnds.OnExit);
        // no exit handle event, try to trigger default exit event
		if (is_echo)
		    return;
	    this.plugin.run_trigger(cr.plugins_.Rex_FSM.prototype.cnds.OnDefaultExit);  
    };
    
    FSMKlassProto._run_enter_action = function(cur_state)
    {
	    var is_echo = this.plugin.run_trigger(cr.plugins_.Rex_FSM.prototype.cnds.OnEnter);
        // no enter handle event, try to trigger default enter event
		if (is_echo)
		    return;
	    this.plugin.run_trigger(cr.plugins_.Rex_FSM.prototype.cnds.OnDefaultEnter);    
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