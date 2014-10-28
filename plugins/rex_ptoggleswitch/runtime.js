// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_pToggleSwitch = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_pToggleSwitch.prototype;
		
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
        this.value = (this.properties[0]==1);
	};
	instanceProto.set_value = function (v)
	{	    
        if (v === this.value)
            return;
            
        this.value = v;                
        var trig_method = (this.value)?
                          cr.plugins_.Rex_pToggleSwitch.prototype.cnds.OnTurnOn:
                          cr.plugins_.Rex_pToggleSwitch.prototype.cnds.OnTurnOff;
        this.runtime.trigger(trig_method, this); 
	}; 	          
	
	instanceProto.saveToJSON = function ()
	{
		return { "v": this.value };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.value = o["v"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnTurnOn = function ()
	{
		return true;
	};

	Cnds.prototype.OnTurnOff = function ()
	{
		return true;
	};    

	Cnds.prototype.IsTurnOn = function ()
	{
		return (this.value);
	};    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.ToogleValue = function ()
	{
		this.set_value(!this.value);
	};  

	Acts.prototype.SetValue = function (s)
	{
		this.set_value((s==1));
	};    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.Value = function (ret)
	{        
		ret.set_int((this.value)? 1:0);
	};  
    
}());