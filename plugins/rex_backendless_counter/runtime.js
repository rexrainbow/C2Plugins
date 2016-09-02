/*
- counter value
*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Backendless_Counter = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Backendless_Counter.prototype;
		
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
	    this.last_error = null;	    
        this.exp_CounterName = "";
        this.exp_CurrentValue = 0;
        this.exp_PreviousValue = 0;
        this.result_compareThenSet = false;
	};
	
	instanceProto.onDestroy = function ()
	{		
	};
		     
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	
	Cnds.prototype.OnIncrease = function (name)
	{
	    return (this.exp_CounterName === name);
	};
	
	Cnds.prototype.OnIncreaseError = function (name)
	{
	    return (this.exp_CounterName === name);
	};	
	
	Cnds.prototype.OnIncreaseAny = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnIncreaseAnyError = function ()
	{
	    return true;
	};	    
	
	Cnds.prototype.OnReset = function (name)
	{
	    return (this.exp_CounterName === name);
	};
	
	Cnds.prototype.OnResetError = function (name)
	{
	    return (this.exp_CounterName === name);
	};	
	
	Cnds.prototype.OnResetAny = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnResetAnyError = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnGetCurrent = function (name)
	{
	    return (this.exp_CounterName === name);
	};
	
	Cnds.prototype.OnGetCurrentError = function (name)
	{
	    return (this.exp_CounterName === name);
	};	
	
	Cnds.prototype.OnGetCurrentAny = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnGetCurrentAnyError = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnCompareThenSet = function (name)
	{
	    return (this.exp_CounterName === name);
	};
	
	Cnds.prototype.OnCompareThenSetError = function (name)
	{
	    return (this.exp_CounterName === name);
	};	
	
	Cnds.prototype.OnCompareThenSetAny = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnCompareThenSetAnyError = function ()
	{
	    return true;
	};    
	
	Cnds.prototype.CompareThenSet_IsValueSet = function ()
	{
	    return this.result_compareThenSet;
	};       
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Increase = function (name, addTo)
	{	  
        var self=this;
        var cnds = cr.plugins_.Rex_Backendless_Counter.prototype.cnds;
        var on_success = function(result)
        {
            self.exp_CounterName = name;
            self.exp_CurrentValue = result;
            self.exp_PreviousValue = result - addTo;
            self.runtime.trigger(cnds.OnIncrease, self);
            self.runtime.trigger(cnds.OnIncreaseAny, self);
        }
        var on_error = function(error)
        {
            self.exp_CounterName = name;
            self.last_error = error;
            self.runtime.trigger(cnds.OnIncreaseError, self);
            self.runtime.trigger(cnds.OnIncreaseAnyError, self);            
        }
        var handler = new window["Backendless"]["Async"]( on_success, on_error );    

        if (addTo === 1)
            window["Backendless"]["Counters"]["incrementAndGet"](name, handler);            
        else if (addTo === -1)
            window["Backendless"]["Counters"]["decrementAndGet"](name, handler); 
        else
            window["Backendless"]["Counters"]["addAndGet"](name, addTo, handler);
	};
 
    Acts.prototype.Reset = function (name)
	{	  
        var self=this;
        var cnds = cr.plugins_.Rex_Backendless_Counter.prototype.cnds;
        var on_success = function(result)
        {
            self.exp_CounterName = name;
            self.exp_CurrentValue = 0;
            self.runtime.trigger(cnds.OnReset, self);
            self.runtime.trigger(cnds.OnResetAny, self);
        }
        var on_error = function(error)
        {
            self.exp_CounterName = name;
            self.last_error = error;
            self.runtime.trigger(cnds.OnResetError, self);
            self.runtime.trigger(cnds.OnResetAnyError, self);            
        }
        var handler = new window["Backendless"]["Async"]( on_success, on_error ); 
        
        window["Backendless"]["Counters"]["reset"](name, handler);
	}; 
 
    Acts.prototype.GetCurrent = function (name)
	{	  
        var self=this;
        var cnds = cr.plugins_.Rex_Backendless_Counter.prototype.cnds;
        var on_success = function(result)
        {
            self.exp_CounterName = name;
            self.exp_CurrentValue = result;
            self.runtime.trigger(cnds.OnGetCurrent, self);
            self.runtime.trigger(cnds.OnGetCurrentAny, self);
        }
        var on_error = function(error)
        {
            self.exp_CounterName = name;
            self.last_error = error;
            self.runtime.trigger(cnds.OnGetCurrentError, self);
            self.runtime.trigger(cnds.OnGetCurrentAnyError, self);            
        }
        var handler = new window["Backendless"]["Async"]( on_success, on_error ); 
        
        window["Backendless"]["Counters"]["get"](name, handler);
	};  
 
    Acts.prototype.CompareThenSet = function (name, setTo, testPrevValue)
	{	  
        var self=this;
        var cnds = cr.plugins_.Rex_Backendless_Counter.prototype.cnds;
        var on_success = function(result)
        {
            self.exp_CounterName = name;
            self.result_compareThenSet = result;
            self.runtime.trigger(cnds.OnCompareThenSet, self);
            self.runtime.trigger(cnds.OnCompareThenSetAny, self);         
        }
        var on_error = function(error)
        {
            self.exp_CounterName = name;
            self.last_error = error;
            self.runtime.trigger(cnds.OnCompareThenSetError, self);
            self.runtime.trigger(cnds.OnCompareThenSetAnyError, self);            
        }
        var handler = new window["Backendless"]["Async"]( on_success, on_error ); 
        
        window["Backendless"]["Counters"]["compareAndSet"](name, testPrevValue, setTo, handler);
	}; 
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.CounterName = function (ret)
	{
		ret.set_string(this.exp_CounterName);
	}; 	
        
	Exps.prototype.CurrentValue = function (ret)
	{
		ret.set_float(this.exp_CurrentValue);
	}; 	
        
	Exps.prototype.PreviousValue = function (ret)
	{
		ret.set_float(this.exp_PreviousValue);
	};     
    
	Exps.prototype.ErrorCode = function (ret)
	{
	    var val = (!this.last_error)? "": this.last_error["code"];    
		ret.set_int(val);
	}; 
	
	Exps.prototype.ErrorMessage = function (ret)
	{
	    var val = (!this.last_error)? "": this.last_error["message"];    
		ret.set_string(val);
	};    
	
}());