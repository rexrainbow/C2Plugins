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
		this.objectName = "";
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

    Acts.prototype.Invoke = function ()
	{
		if (this.functionName === "")
		    return;
        
		var o;
		if (this.objectName !== "")
			o = getItemByKey(window, this.objectName);				
		else
			o = window;

        var f = getItemByKey(o, this.functionName);
        this.returnValue = f.apply(o, this.functionParams);
		this.functionParams = [];
	}; 
    
	Acts.prototype.SetObjectName = function (name)
	{
        this.objectName = name;      
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

    
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------    
    // ------------------------------------------------------------------------   	
    var getItemByKey = function (item, k)
	{
        var v;
	    if (item == null)
            v = null;
        else if ( (k == null) || (k === "") )
            v = item;
        else if ((typeof(k) === "number") || (k.indexOf(".") == -1))
            v = item[k];
        else
        {
            var kList = k.split(".");
            v = item;
            var i,cnt=kList.length;
            for(i=0; i<cnt; i++)
            {
                if (typeof(v) !== "object")
                {
                    v = null;
                    break;
                }
                    
                v = v[kList[i]];
            }
        }
		return v;
	}
 	var getItemValue = function (item, k, default_value)
	{
        return din( getItemByKey(item, k), default_value);
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