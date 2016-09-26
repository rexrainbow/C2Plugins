// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_merge = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_merge.prototype;
		
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
        this.merge = new window["Tone"]["Merge"]();
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
    
    // export
	instanceProto.GetObject = function ()
	{
        return this.merge;
	};  
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.Plug = function (objType, isLeftChannel)
	{
        if (!objType)
            return;
        
        isLeftChannel = (isLeftChannel === 1);
        var insts = objType.getCurrentSol().getObjects();
        var i,cnt=insts.length, toneObj, myToneObj=this.GetObject();        
        myToneObj = (isLeftChannel === 1)? myToneObj["left"] : myToneObj["right"];
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