// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_jsshell = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_jsshell.prototype;
		
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
		// function call
		this.functionName = "";
		this.functionParams = [];
		this.returnValue = null;

        // callback
        this.callbackTag = "";   
        this.callbackParams = [];   // callbackParams
        var self=this;
        this.getCallback = function(callbackTag)
        {
            if (callbackTag == null)
                return null;
        
            var cb = function ()
            {
                self.callbackTag = callbackTag;            
                cr.shallowAssignArray(self.callbackParams, arguments);
                self.runtime.trigger(cr.plugins_.Rex_jsshell.prototype.cnds.OnCallback, self); 
            }
            return cb;
        };
	};
    
	instanceProto.onDestroy = function ()
	{
	};   

    instanceProto.LoadAPI = function(src, onload_, onerror_)
	{
	    var scripts=document.getElementsByTagName("script");
	    var exist=false;
	    for(var i=0;i<scripts.length;i++)
	    {
	    	if(scripts[i].src.indexOf(src) != -1)
	    	{
	    		exist=true;
	    		break;
	    	}
	    }
	    if(!exist)
	    {
	    	var newScriptTag=document.createElement("script");
            newScriptTag["type"] = "text/javascript";
            newScriptTag["src"] = src;
            
            // onLoad callback
            var self=this;        
            var onLoad = function()
            {
                self.isLoaded = true;
                if (onload_)
                    onload_();
            };
            var onError = function()
            {
                if (onerror_)
                    onerror_();
            };        
            newScriptTag["onload"] = onLoad;
            newScriptTag["onerror"] = onError;            
	    	document.getElementsByTagName("head")[0].appendChild(newScriptTag);
	    }
	};	

    var invokeFunction = function (functionName, params, isNewObject)
	{
		var names = functionName.split(".");
		var fnName = names.pop();
		var o = getValue(names, window);

        var retValue;
		if (isNewObject)
		{
			params.unshift(null);			
			retValue = new (Function.prototype.bind.apply(o[fnName], params));
		}
		else
		{
            retValue = o[fnName].apply(o, params);
		}
        return retValue;
	}; 	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnCallback = function (tag)
	{
		return cr.equals_nocase(tag, this.callbackTag);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.InvokeFunction = function (varName)
	{
		if (this.functionName === "")
		    return;
        		
		var params = this.functionParams;
		this.functionParams = [];	
		this.returnValue = invokeFunction(this.functionName, params);
		if (varName !== "")		
		{
			setValue(varName, this.returnValue, window);
		}
	}; 

    Acts.prototype.CreateInstance = function (instanceName)
	{
		if (instanceName === "")
		    return;
		if (this.functionName === "")
		    return;
               		
		var params = this.functionParams;
		this.functionParams = [];				
		var o = invokeFunction(this.functionName, params, true);
		setValue(instanceName, o, window);
	}; 	
    
    Acts.prototype.SetFunctionName = function (name)
	{
        this.functionName = name;      
	}; 

    Acts.prototype.AddValue = function (v)
	{
		this.functionParams.push(v);      
	};     

    Acts.prototype.AddJSON = function (v)
	{
		this.functionParams.push(JSON.parse(v));      
	};    

    Acts.prototype.AddBoolean = function (v)
	{
		this.functionParams.push(v === 1);      
	}; 

    Acts.prototype.AddCallback = function (callbackTag)
	{
		this.functionParams.push( this.getCallback(callbackTag) );      
	};

    Acts.prototype.AddNull = function ()
	{
		this.functionParams.push( null );      
	};

    Acts.prototype.LoadAPI = function (src, successTag, errorTag)
	{
		this.LoadAPI(src, this.getCallback(successTag), this.getCallback(errorTag));   
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Param = function (ret, index, keys, default_value)
	{             
        var val = this.callbackParams[index];   
		if (typeof(keys) === "number")
		{
		    keys = [keys];
		}
		ret.set_any( getItemValue(val, keys, default_value) );
	}; 

	Exps.prototype.ParamCount = function (ret)
	{
		ret.set_int( this.callbackParams.length );
	}; 

	Exps.prototype.ReturnValue = function (ret, keys, default_value)
	{        
		ret.set_any( getItemValue(this.returnValue, keys, default_value) );
	}; 

	Exps.prototype.Prop = function (ret, keys, default_value)
	{        
		ret.set_any( getItemValue(window, keys, default_value) );
	}; 
    
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------    
    // ------------------------------------------------------------------------   	

	var getValue = function(keys, root)
	{           
        if ((keys == null) || (keys === "") || (keys.length === 0))
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

        
	var getEntry = function(keys, root, defaultEntry)
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
                {
                    var newEntry;
                    if (i === cnt-1)
                    {
                        newEntry = defaultEntry || {};
                    }
                    else
                    {
                        newEntry = {};
                    }
                    
                    entry[key] = newEntry;
                }
                
                entry = entry[key];            
            }           
        }
        
        return entry;
	};  

	var setValue = function(keys, value, root)
	{        
        if ((keys === "") || (keys.length === 0))
        {
            if ((value !== null) && typeof(value) === "object")
            {
				root = value;
            }
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

 	var getItemValue = function (item, k, default_value)
	{
		return din(getValue(k, item), default_value);
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
}());