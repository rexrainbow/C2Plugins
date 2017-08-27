// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_NGIO_Gateway = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_NGIO_Gateway.prototype;
		
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
        this.ngio = null;
        this.lastResult = null;
	};
    
	instanceProto.onDestroy = function ()
	{
	};

    instanceProto.GetNGIO = function ()
	{
        if (this.ngio != null)
            return this.ngio;
            
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            
            if (cr.plugins_.Rex_NGIO_Authentication && (inst instanceof cr.plugins_.Rex_NGIO_Authentication.prototype.Instance))
            {
                this.ngio = inst.GetNGIO();
                return this.ngio;
            }            
        }
        assert2(this.ngio, "NGIO.Gateway: Can not find NGIO Authentication oject.");
        return null; 
	};    
      
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnGetDateTimeSuccess= function () { return true; };     
	Cnds.prototype.OnGetDateTimeError= function () { return true; };     
	Cnds.prototype.OnGetVersionSuccess= function () { return true; };     
	Cnds.prototype.OnGetVersionError= function () { return true; };     
	Cnds.prototype.OnPingSuccess = function () { return true; };     
	Cnds.prototype.OnPingError = function () { return true; };     

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    var getHandler = function (self, successTrig, errorTrig, callback)
    {      
        var handler =  function(result) 
        {
            if (callback)
                callback(result);
            
            self.lastResult = result;    
            var trig = (result["success"])? successTrig:errorTrig;
            self.runtime.trigger(trig, self);
        };
        return handler;
    };
    
    Acts.prototype.GetDatetime = function ()
	{
        var cnds = cr.plugins_.Rex_NGIO_Gateway.prototype.cnds;
        var callback = getHandler(this, cnds.OnGetDateTimeSuccess, cnds.OnGetDateTimeError);
        this.GetNGIO()["callComponent"]("Gateway.getDatetime", {}, callback);
	};  
    Acts.prototype.GetVersion = function ()
	{
        var cnds = cr.plugins_.Rex_NGIO_Gateway.prototype.cnds;
        var callback = getHandler(this, cnds.OnGetVersionSuccess, cnds.OnGetVersionError);
        this.GetNGIO()["callComponent"]("Gateway.getVersion", {}, callback);
	}; 
    Acts.prototype.Ping = function ()
	{
        var cnds = cr.plugins_.Rex_NGIO_Gateway.prototype.cnds;
        var callback = getHandler(this, cnds.OnPingSuccess, cnds.OnPingError);
        this.GetNGIO()["callComponent"]("Gateway.ping", {}, callback);
	};     
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.ErrorMessage = function (ret)
	{
        var val;
        if (this.lastResult && this.lastResult["error"])
            val = this.lastResult["error"]["message"];
	    ret.set_string(val || "");
	};    
    
	Exps.prototype.Datetime = function (ret)
	{
        var val;
        if (this.lastResult)
            val = this.lastResult["datetime"];
	    ret.set_string(val || "");
	};
	Exps.prototype.Version = function (ret)
	{
        var val;
        if (this.lastResult)
            val = this.lastResult["version"];
	    ret.set_string(val || "");
	};    
	Exps.prototype.Pong = function (ret)
	{
        var val;
        if (this.lastResult)
            val = this.lastResult["pong"];
	    ret.set_string(val || "");
	};  

}());