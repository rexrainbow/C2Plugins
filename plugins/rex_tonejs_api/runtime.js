// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_api = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_api.prototype;
		
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
        var transport = window["Tone"]["Transport"];
        
        if (this.properties[0] === 1)
            transport["start"]();        
        
        transport["bpm"]["value"] =  this.properties[1]; 
	};
    
	instanceProto.onDestroy = function ()
	{
	};   

    var forEachInst = function(objType, callback)
    {
        if (!objType)
            return;
        
        var insts = objType.getCurrentSol().getObjects();
        var i,cnt=insts.length;
        for (i=0; i<cnt; i++)
            callback(insts[i]);        
    };
    
	var getEntry = function(keys, root)
	{
        var entry = root;
        var i,  cnt=keys.length, key;
        for (i=0; i< cnt; i++)
        {
            entry = entry[ keys[i] ];            
        }  
        
        return entry;
	};    
 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
     
	Acts.prototype.SetValue = function (objType, keys, value)
	{
        keys = keys.split(".");
        var lastKey = keys.pop(); 
        
        var self=this;
        var callback = function(inst)
        {
            var toneObj = inst.GetObject();
            if (!toneObj)
                return;
            
            var entry = getEntry(keys, toneObj);
            entry[lastKey] = value;            
        }
        
        forEachInst(objType, callback);
	};
     
	Acts.prototype.SetJSON = function (objType, keys, value)
	{
        keys = keys.split(".");
        var lastKey = keys.pop(); 
        
        var self=this;
        var callback = function(inst)
        {
            var toneObj = inst.GetObject();
            if (!toneObj)
                return;
            
            var entry = getEntry(keys, toneObj);
            entry[lastKey] = JSON.parse(value);
        }
        
        forEachInst(objType, callback);
	};    
     
	Acts.prototype.SetBoolean = function (objType, keys, value)
	{
        keys = keys.split(".");
        var lastKey = keys.pop(); 
        value = (value === 1);
        
        var self=this;
        var callback = function(inst)
        {
            var toneObj = inst.GetObject();
            if (!toneObj)
                return;
            
            var entry = getEntry(keys, toneObj);
            entry[lastKey] = value;
        }
        
        forEachInst(objType, callback);
	};     
    
	Acts.prototype.SetJSON = function (objType, params)
	{            
        var self=this;
        var callback = function(inst)
        {
            var toneObj = inst.GetObject();
            if (!toneObj)
                return;
            
            toneObj["set"](JSON.parse(params));
        }
        
        forEachInst(objType, callback);       
	};  
        
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Now = function (ret)
	{
		ret.set_float(window["Tone"]["now"]());
	};

	Exps.prototype.Property = function (ret, uid, keys)
	{
        var val = 0;
        var inst = this.runtime.getObjectByUID(uid);
        if (inst)
        {
            val = window.ToneJSGetItemValue(inst.GetObject(), keys, 0);
        }
		ret.set_any( val );
	};    
    
    
}());

(function ()
{
 	var getItemValue = function (item, k, default_value)
	{
        var v;
	    if (item == null)
            v = null;
        else if ( (k == null) || (k === "") )
            v = item;
        else if (k.indexOf(".") == -1)
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

        return din(v, default_value);
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
    window.ToneJSGetItemValue = getItemValue;    
}());