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
	    this.is_debug_mode = this.properties[0];   
        this.activated = this.properties[1];
		this.previous_state = "Off";	
		
		// initial state		
		var start_state = this.properties[2];		
        this.current_state = (start_state!="")? start_state:"Off";	
				
		// initial varaibles
		var init_vars = this.properties[3];
        this.vars = (init_vars!="")? 
		            jQuery.parseJSON(init_vars):
		            {};	
					
        // default state
		var default_transitions = this.properties[4];
		this.default_transitions = (default_transitions!="")? 
		                           jQuery.parseJSON(default_transitions):
		                           null;

        this.function_name = ""; 
        this.fn_obj_list = {};           
        this.is_echo = false;	
	};  
    
	behinstProto.tick = function ()
	{
	};

	behinstProto.Request = function ()
	{
	    if (this.activated==0)
		{
		    return;
		}
		
		this.is_echo = false;
		this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnRequest, this.inst);
        if (!this.is_echo)
        {
		    this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnDefaultRequest, this.inst);        
        }    
	};
    
	behinstProto.Transit = function (new_state)
	{
	    if (this.activated==0)
		{
		    return;
		}
		
        if (this.default_transitions != null)
        {
		    // check if new_state is a valid target transition state
		    var valid_transition_states = this.default_transitions[this.current_state];
			if (valid_transition_states != null)
			{
                var is_find = false;	
				var len=valid_transition_states.length
                var i;				
			    for (i=0; i<len; i++)
				{
				    if (valid_transition_states[i] == new_state)
					{
					    is_find = true;
						break;
					}
				}
				// new_state is not a valid target transition state, leave
				if (!is_find)
				{
                    if (this.is_debug_mode) 
                    {
                        alert ("Can not transit from '" + this.current_state + 
						       "' to '" + new_state + "'");
                    }
				    return;
				}
			}
        }
        this._state_transition(new_state);    
	};  

    behinstProto.ForceTransit = function (new_state)
	{
	    if (this.activated==0)
		{
		    return;
		}
		
        this._state_transition(new_state);    
	};
	
	behinstProto.CallFn = function(name)
	{
        this.function_name = name; 
        this.is_echo = false;
	    this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnFunctionCalled, this);
        if ((!this.is_echo) && this.is_debug_mode) 
        {
            alert ("Can not find function '" + name + "'");
        }
	};
    
	behinstProto.CreateJS = function(name, code_string)
	{
        this.fn_obj_list[name] = eval("("+code_string+")");
	};  

 	behinstProto.CallJS = function(name)
	{
	    var fn_obj = this.fn_obj_list[name];
        if (fn_obj == null) 
        {            
            if (this.is_debug_mode) 
            {
                alert ("Can not find JS function object '" + name + "'");
            }
        }
		else
		{
            fn_obj(this);
	    }
	};      

    behinstProto._state_transition = function (new_state)
	{
	    this.previous_state = this.current_state;
		this.current_state = new_state;
		this.is_echo = false;
		this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnTransfer, this.inst);
		if (!this.is_echo)
		{
            this.is_echo = false;
		    this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnExit, this.inst);
            if (!this.is_echo)
            {
                this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnDefaultExit, this.inst);
            }
            this.is_echo = false;
			this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnEnter, this.inst);
            if (!this.is_echo)
            {
                this.runtime.trigger(cr.behaviors.MyFSM.prototype.cnds.OnDefaultEnter, this.inst);
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
    
	cnds.OnFunctionCalled = function (name)
	{
        var is_my_call = (this.function_name == name);
        this.is_echo |= is_my_call;
		return is_my_call;
	};	    
    
	cnds.CompareVariable = function (index, cmp, s)
	{
		return cr.do_cmp(this.vars[index], cmp, s);
	};
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;
 
 	acts.CleanVariables = function ()
	{
        this.vars = {};
	};   
    
	acts.SetVariable = function (index, value)
	{
        this.vars[index] = value;
	};  

    acts.Request = function ()
	{
	    this.Request();
	};  
    
 	acts.Transit = function (new_state)
	{
	    this.Transit(new_state);
	};
    
  	acts.ForceTransit = function (new_state)
	{
	    this.ForceTransit(new_state);
	};

    acts.CallFunction = function (name)
	{
        this.CallFn(name);
	}; 
    
	acts.CreateJSFunctionObject = function (name, code_string)
	{
        this.CreateJS(name, code_string);
	};
	
	acts.CallJSFunctionObject = function (name)
	{
	    this.CallJS(name);
	};    
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	exps.CurState = function (ret)
	{
	    ret.set_string(this.current_state);
	};	
	
	exps.PreState = function (ret)
	{
	    ret.set_string(this.previous_state);
	};
	
    exps.Var = function (ret, index)
	{
        var value = this.vars[index];
        if (value == null) 
        {
            value = 0;
            if (this.is_debug_mode) 
            {
                alert ("Can not find variable '" + index + "'");
            }
        }
	    ret.set_any(value);
	};	
}());