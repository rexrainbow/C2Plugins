// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_master = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_master.prototype;
		
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
        var master = window["Tone"]["Master"];
        //master["volume"] = this.properties[0];        
        //master["mute"] = (this.properties[0] === 1);    
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
    
    // export
	instanceProto.GetObject = function ()
	{
        return window["Tone"]["Master"];
	};  
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.Plug = function (objType)
	{
        if (!objType)
            return;
        
        var insts = objType.getCurrentSol().getObjects();
        var i,cnt=insts.length, toneObj, myToneObj=this.GetObject();
        for (i=0; i<cnt; i++)
        {
            toneObj = insts[i].GetObject(); 
            toneObj["connect"]( myToneObj );         
        }
	};      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());