/*
- counter value
*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_Transaction = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_Transaction.prototype;
		
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
        this.rootpath = "";
        this.abort = false;
        this.valueIn = null; 
        this.valueWrite = null;        
        this.isCommitted = null;
        this.valueOut = null;
	};
	
	instanceProto.onDestroy = function ()
	{
        // TODO
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
    
	var setValue = function(keys, value, root)
	{        
        if ((keys === "") || (keys.length === 0))
        {
            if ((value !== null) && typeof(value) === "object")
               root = value;
        }
        else
        {            
            if (typeof (keys) === "string")
                keys = keys.split(".");
            
            var lastKey = keys.pop(); 
            var entry = getEntry(keys, root);
            entry[lastKey] = value;
        }
	};     
    
	var getEntry = function(keys, root)
	{
        var entry = root;
        if ((keys === "") || (keys.length === 0))
        {
            //entry = root;
        }
        else
        {
            if (typeof (keys) === "string")
                keys = keys.split(".");
            
            var i,  cnt=keys.length, key;
            for (i=0; i< cnt; i++)
            {
                key = keys[i];
                if ( (entry[key] == null) || (typeof(entry[key]) !== "object") )                
                    entry[key] = {};
                
                entry = entry[key];            
            }           
        }
        
        return entry;
	};    
    
	var getValue = function(keys, root)
	{           
        if (root == null)
            return;
        
        if ((!keys) || (keys === "") || (keys.length === 0))
        {
            return root;
        }
        else
        {
            if (typeof (keys) === "string")
                keys = keys.split(".");
            
            var i,  cnt=keys.length, key;
            var entry = root;
            for (i=0; i< cnt; i++)
            {
                key = keys[i];                
                if (entry.hasOwnProperty(key))
                    entry = entry[ key ];
                else
                    return;              
            }
            return entry;                    
        }
	};     
        
    var din = function (d, default_value)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (d == null)
        {
            if (default_value != null)
                o = default_value;
            else
                o = 0;
        }
        else if (typeof(d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
	    return o;
    };    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnTransaction = function (cb)
	{
	    return true;
	};    
    
	Cnds.prototype.ValueInIsNull = function ()
	{
	    return (this.valueIn === null);
	}; 

	Cnds.prototype.IsAborted = function ()
	{
	    return (!this.isCommitted);
	};     
    
	Cnds.prototype.OnComplete = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnError = function ()
	{
	    return true;
	};       
    
	Cnds.prototype.ValueOutIsNull = function ()
	{
	    return (this.valueOut === null);
	}; 	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.Transaction = function (k)
	{ 
        var initValue, skipFirst=true;
        var self = this;  
        var ref = this.get_ref(k);
	    var _onComplete = function(error, committed, snapshot) 
	    {
            self.isCommitted = committed;
            self.valueOut = snapshot["val"]();
            
	        var trig = (error)? cr.plugins_.Rex_Firebase_Transaction.prototype.cnds.OnError:
	                            cr.plugins_.Rex_Firebase_Transaction.prototype.cnds.OnComplete;
	        self.runtime.trigger(trig, self); 
        };
        
        var _onTransaction = function(current_value)
        {            
            if (skipFirst)
            {
                skipFirst = false;
                if ((current_value == null) && (initValue != null))
                    return current_value;
            }
            
            self.abort = true;    
            self.valueIn = current_value;            
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Transaction.prototype.cnds.OnTransaction, self); 
            
            if (self.abort)
                return current_value;
            else
                return self.valueWrite;
        };
        
        var run_transaction = function()
        {
            ref["transaction"](_onTransaction, _onComplete);
        }
        
        var read_initValue = function()
        {
            var on_read = function (snapshot)
            {
                initValue = snapshot["val"]();
                run_transaction();
            }
            ref["once"]("value", on_read);
        }
        
        read_initValue();
	}; 

    Acts.prototype.ReturnValue = function (v)
	{
        this.abort = false;            
	    this.valueWrite = v;
	}; 
	
    Acts.prototype.ReturnJSON = function (v)
	{
        this.abort = false;               
        if (typeof(v)==="number" || (v == ""))
            return;
	    this.valueWrite = JSON.parse(v);
	}; 	    
    
    Acts.prototype.ReturnNull = function ()
	{
        this.abort = false;               
	    this.valueWrite = null;
	};    
	
    Acts.prototype.ReturnBoolean = function (b)
	{
        this.abort = false;               
	    this.valueWrite = (b===1);
	};     
	
    Acts.prototype.ReturnKeyValue = function (k, v)
	{
        this.abort = false;
        if (typeof(this.valueWrite) !== "object")
            this.valueWrite = {};
        
        setValue(k, v, this.valueWrite);
	};     
	
    Acts.prototype.ReturnKeyBoolean = function (k, b)
	{
        this.abort = false;
        if (typeof(this.valueWrite) !== "object")
            this.valueWrite = {};
        
        setValue(k, (b===1), this.valueWrite);
	};     
    Acts.prototype.Abort = function ()
	{
        this.abort = true;
	    this.valueWrite = null;        
	};      
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.ValueIn = function (ret, key_, default_value)
	{	
        var val = getValue(key_, this.valueIn);
		ret.set_any(din(val, default_value));
	}; 
	
	Exps.prototype.ValueOut = function (ret, key_, default_value)
	{	
        var val = getValue(key_, this.valueOut);
		ret.set_any(din(val, default_value));        
	}; 
    
}());