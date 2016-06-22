// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

// 2.x: window["Firebase"]
// 3.x: window["firebase"]
window["Firebase"] = window["firebase"];
window["FirebaseV3x"] = true;
        
/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_FirebaseAPIV3 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_FirebaseAPIV3.prototype;
		
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

        var ref = window["Firebase"];
        
        var config = {
            "apiKey": this.properties[0],
            "authDomain": this.properties[1],
            "databaseURL": this.properties[2],
            "storageBucket": this.properties[3],
        };
        
        var appName = "";//this.properties[4];
        if (appName === "")
            this.app = ref["initializeApp"](config);
        else
            this.app = ref["initializeApp"](config, appName);
        
        ref["database"]["enableLogging"](this.properties[4] === 1);
	};
	
	instanceProto.onDestroy = function ()
	{		
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
}());