// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_Counter = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var input_text = "";
	var pluginProto = cr.plugins_.Rex_Firebase_Counter.prototype;
		
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
	    jsfile_load("firebase.js");
	};
	
	var jsfile_load = function(file_name)
	{
	    var scripts=document.getElementsByTagName("script");
	    var exist=false;
	    for(var i=0;i<scripts.length;i++)
	    {
	    	if(scripts[i].src.indexOf(file_name) != -1)
	    	{
	    		exist=true;
	    		break;
	    	}
	    }
	    if(!exist)
	    {
	    	var newScriptTag=document.createElement("script");
	    	newScriptTag.setAttribute("type","text/javascript");
	    	newScriptTag.setAttribute("src", file_name);
	    	document.getElementsByTagName("head")[0].appendChild(newScriptTag);
	    }
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
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/"; 	    
	    this.set_init(this.properties[2], this.properties[3]);
	    
	    this.last_transactionIn = null;
        this.exp_LastValue = this.init_value;
        this.exp_MyLastWroteValue = null;
        this.exp_MyLastAddedValue = 0;
	};
	
    instanceProto.set_init = function (init_value, upper_bound)
	{
	    this.init_value = init_value;
	    if (upper_bound == "")
	        upper_bound = null;
	    else if (typeof (upper_bound) == "string")
	            upper_bound = parseFloat(upper_bound);
	    
	    this.upper_bound = upper_bound;      
	    this.set_range(this.init_value, this.upper_bound);
	};		

	instanceProto.set_range = function(v0, v1)
	{
	    if ((v0 == null) || (v1 == null))
	    {
	        this.counter_max = null;
	        this.counter_min = null; 	        
	    }
	    else
	    {
	        this.counter_max = Math.max(v0, v1);
	        this.counter_min = Math.min(v0, v1); 
	    }
    };
    
    
	instanceProto.has_bound = function()
	{
	    return (this.upper_bound != null);
    };   
    	
	instanceProto.get_ref = function(k)
	{
	    if (k == null)
	        k = "";
	        
	    var path;
	    if (k.substring(0,8) == "https://")
	        path = k;
	    else
	        path = this.rootpath + k + "/";
	        
        return new window["Firebase"](path);
	};
	
	instanceProto.on_transaction_complete = function(error, committed, snapshot) 
    {
        if (error)
        {
        }
        else if (!committed)
        {
            this.runtime.trigger(cr.plugins_.Rex_Firebase_Counter.prototype.cnds.OnMyWritingAbort, this);
        }
        else
        {
            this.exp_MyLastWroteValue = snapshot["val"]();
            this.exp_MyLastAddedValue = this.exp_MyLastWroteValue - this.last_transactionIn;
            this.runtime.trigger(cr.plugins_.Rex_Firebase_Counter.prototype.cnds.OnMyWriting, this);
        }
    }; 		     
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	
	Cnds.prototype.OnUpdate = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnMyWriting = function ()
	{
	    return true;
	};	
	
	Cnds.prototype.CompareLastWroteValue = function (cmp, s)
	{
	    if (this.exp_MyLastWroteValue == null)
	        return false;
		return cr.do_cmp(this.exp_MyLastWroteValue, cmp, s);
	};	
	
	Cnds.prototype.CompareLastValue = function (cmp, s)
	{
		return cr.do_cmp(this.exp_LastValue, cmp, s);
	};
			
	Cnds.prototype.OnMyWritingAbort = function ()
	{
	    return true;
	};		
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.StartUpdate = function ()
	{	    
	    var self = this;
	    var on_read = function (snapshot)
	    {
	        var counter_value = snapshot["val"]();
	        if (counter_value == null)
	            counter_value = self.init_value;
	            
	        self.exp_LastValue = counter_value;
	        self.runtime.trigger(cr.plugins_.Rex_Firebase_Counter.prototype.cnds.OnUpdate, self); 
	    };
	    this.get_ref()["on"]("value", on_read);
	};
 
    Acts.prototype.StopUpdate = function ()
	{
	    this.get_ref()["off"]();
	};	 
 
    Acts.prototype.SetInit = function (init_value, upper_bound)
	{
	    this.set_init(init_value, upper_bound);
	};	 	
 
    Acts.prototype.SetUpperBound = function (upper_bound)
	{
	    this.init_value = value_;
	};		
    Acts.prototype.Add = function (value_)
	{
	    var is_numbe = typeof(value_) == "number";
	    var self = this;        
    
	    var get_value = function(value_, current_value)
	    {
	        if (is_numbe)
	            return value_;
	            
	        return (parseFloat(value_)/100 * current_value);	
        };   
    
	    var on_complete = function(error, committed, snapshot) 
	    {
	        self.on_transaction_complete(error, committed, snapshot) ;
        };
        	    
	    var on_add = function (current_value)
	    {	        
	        if (current_value == null)
	            current_value = self.init_value;
	        
	        self.last_transactionIn = current_value;
	        var added_value = get_value(value_, current_value);
	        var wrote_value = current_value + added_value;           	        
	        
	        // no upper bound
	        if (!self.has_bound())	     	            
	            return wrote_value;	        

	        // has upper bound
            // current value is equal to upper bound
	        else if (self.upper_bound == current_value)
	            return;   // Abort the transaction
	            
	        else
	        {
	            if (self.upper_bound > self.init_value)
	            {
	                if (wrote_value <= self.upper_bound)
	                    return wrote_value;
	                else if (wrote_value > self.upper_bound)
	                    return self.upper_bound;
	                else
	                    return;   // Abort the transaction
	            }
	            else // (self.upper_bound < self.init_value)
	            {
	                if (wrote_value >= self.upper_bound)
	                    return wrote_value;
	                else if (wrote_value < self.upper_bound)
	                    return self.upper_bound;	        
	                else
	                    return;   // Abort the transaction            
	            }
	        }	        
	    };
	    this.get_ref()["transaction"](on_add, on_complete);
	};
	
    Acts.prototype.ForceSet = function (value_)
	{
	    this.get_ref()["set"](value_);
	};		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.LastValue = function (ret)
	{
		ret.set_float(this.exp_LastValue);
	}; 	
	
	Exps.prototype.LastWroteValue = function (ret)
	{
		ret.set_float(this.exp_MyLastWroteValue | 0);
	}; 	
	
	Exps.prototype.LastAddedValue = function (ret)
	{
		ret.set_float(this.exp_MyLastAddedValue);
	}; 	
}());