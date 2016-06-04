/*
- counter value
*/
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
	    
	    this.exp_LastTransactionIn = null;
        this.exp_LastValue = this.init_value;
        this.exp_MyLastWroteValue = null;
        this.exp_MyLastAddedValue = 0;
        
        // custom add
        this.onCustomAdd_cb = "";
        
        
        this.query = null;
        this.read_value_handler = null;
	};
	
	instanceProto.onDestroy = function ()
	{		
	     this.stop_update(); 
	};
		
    instanceProto.set_init = function (init_value, upper_bound)
	{
	    this.init_value = init_value;
	    if ((upper_bound == "") || (upper_bound == '""'))
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
    	
    // 2.x , 3.x    
	var isFirebase3x = function()
	{ 
        return (window["FirebaseV3x"] === true);
    };
    
    var isFullPath = function (p)
    {
        return (p.substring(0,8) === "https://");
    };
	
	instanceProto.get_ref = function(k)
	{
        if (k == null)
	        k = "";
	    var path;
	    if (isFullPath(k))
	        path = k;
	    else
	        path = this.rootpath + k + "/";
            
        // 2.x
        if (!isFirebase3x())
        {
            return new window["Firebase"](path);
        }  
        
        // 3.x
        else
        {
            var fnName = (isFullPath(path))? "refFromURL":"ref";
            return window["Firebase"]["database"]()[fnName](path);
        }
        
	};
    
    var get_key = function (obj)
    {       
        return (!isFirebase3x())?  obj["key"]() : obj["key"];
    };
    
    var get_refPath = function (obj)
    {       
        return (!isFirebase3x())?  obj["ref"]() : obj["ref"];
    };    
    
    var get_root = function (obj)
    {       
        return (!isFirebase3x())?  obj["root"]() : obj["root"];
    };
    
    var serverTimeStamp = function ()
    {       
        if (!isFirebase3x())
            return window["Firebase"]["ServerValue"]["TIMESTAMP"];
        else
            return window["Firebase"]["database"]["ServerValue"];
    };       

    var get_timestamp = function (obj)    
    {       
        return (!isFirebase3x())?  obj : obj["TIMESTAMP"];
    };    
    // 2.x , 3.x  

	instanceProto.clamp_result = function(current_value, wrote_value)
	{    
	    // no upper bound
	    if (!this.has_bound())	     	            
	        return wrote_value;	        

	    // has upper bound
        // current value is equal to upper bound
	    else if (this.upper_bound == current_value)
	        return null;   // Abort the transaction
	            
	    else
	    {
	        if (this.upper_bound > this.init_value)
	        {
	            if (wrote_value <= this.upper_bound)
	                return wrote_value;
	            else if (wrote_value > this.upper_bound)
	                return this.upper_bound;
	            else
	                return null;   // Abort the transaction
	        }
	        else // (this.upper_bound < this.init_value)
	        {
	            if (wrote_value >= this.upper_bound)
	                return wrote_value;
	            else if (wrote_value < this.upper_bound)
	                return this.upper_bound;	        
	            else
	                return null;   // Abort the transaction            
	        }
	    }
    };
            
	instanceProto.on_transaction_complete = function(error, committed, snapshot) 
    {
        if (error)
        {
            this.runtime.trigger(cr.plugins_.Rex_Firebase_Counter.prototype.cnds.OnMyWritingError, this);            
        }
        else if (!committed)
        {
            this.runtime.trigger(cr.plugins_.Rex_Firebase_Counter.prototype.cnds.OnMyWritingAbort, this);
        }
        else
        {
            this.exp_MyLastWroteValue = snapshot["val"]();
            this.exp_MyLastAddedValue = this.exp_MyLastWroteValue - this.exp_LastTransactionIn;
            this.runtime.trigger(cr.plugins_.Rex_Firebase_Counter.prototype.cnds.OnMyWriting, this);
        }
    }; 
    
    instanceProto.start_update = function ()
	{	    
	    this.stop_update();
	    
	    var self = this;
	    var on_read = function (snapshot)
	    {
	        var counter_value = snapshot["val"]();
	        if (counter_value == null)
	            counter_value = self.init_value;
	            
	        self.exp_LastValue = counter_value;
	        self.runtime.trigger(cr.plugins_.Rex_Firebase_Counter.prototype.cnds.OnUpdate, self); 
	    };
	    
	    var query = this.get_ref();
	    query["on"]("value", on_read);
	    
	    this.query = query;
	    this.read_value_handler = on_read;	    
	};
 
    instanceProto.stop_update = function ()
	{
	    if (this.query)
	    {
	        this.query["off"]("value", this.read_value_handler);
	        this.read_value_handler = null;
	        //this.get_ref()["off"]();
	        this.query = null;
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
			
	Cnds.prototype.OnAddFn = function (cb)
	{
	    return cr.equals_nocase(cb, this.onCustomAdd_cb);
	};	
			
	Cnds.prototype.OnMyWritingError = function ()
	{
	    return true;
	};		
		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.SetDomainRef = function (domain_ref, sub_domain_ref)
	{
		this.rootpath = domain_ref + "/" + sub_domain_ref + "/";
	};
	
    Acts.prototype.StartUpdate = function ()
	{	    
	    this.start_update();   
	};
 
    Acts.prototype.StopUpdate = function ()
	{
	    this.stop_update();    
	};	 
 
    Acts.prototype.SetInit = function (init_value, upper_bound)
	{
	    this.set_init(init_value, upper_bound);
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
	        
	        self.exp_LastTransactionIn = current_value;                       
	        var added_value = get_value(value_, current_value);
	        var wrote_value = current_value + added_value;    
	        var result = self.clamp_result(current_value, wrote_value);	       
            if (result == null)
                return;          // Abort the transaction
            else
                return result;         
	    };
	    this.get_ref()["transaction"](on_add, on_complete);
	};
	
    Acts.prototype.ForceSet = function (value_)
	{
	    this.get_ref()["set"](value_);
	};		
    
    Acts.prototype.CustomAddByFn = function (cb)
	{
	    var self = this;        
        
	    var on_complete = function(error, committed, snapshot) 
	    {
	        self.on_transaction_complete(error, committed, snapshot) ;
        };
        
        var get_value = function (current_value)
        {
	        self.exp_LastTransactionIn = current_value;
            self.transactionOut = null;
            self.onCustomAdd_cb = cb;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Counter.prototype.cnds.OnAddFn, self);
            return self.transactionOut;
        };
        	    
	    var on_add = function (current_value)
	    {	        
	        if (current_value == null)
	            current_value = self.init_value;
	        
	        var added_value = get_value(current_value);
            if (added_value == null)
                return;   // Abort the transaction
                
	        var wrote_value = current_value + added_value;    
	        var result = self.clamp_result(current_value, wrote_value);	       
            if (result == null)
                return;          // Abort the transaction
            else
                return result;       
	    };
	    this.get_ref()["transaction"](on_add, on_complete);
	};  
	
    Acts.prototype.CustomAddAdd = function (value_)
	{
	    this.transactionOut = value_;        
	};
	
    Acts.prototype.CustomAddAbort = function ()
	{
	    this.transactionOut = null;        
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
		ret.set_float(this.exp_MyLastWroteValue || 0);
	}; 	
	
	Exps.prototype.LastAddedValue = function (ret)
	{
		ret.set_float(this.exp_MyLastAddedValue);
	}; 
	
	Exps.prototype.CustomAddIn = function (ret)
	{
		ret.set_float(this.exp_LastTransactionIn);
	}; 
	
}());