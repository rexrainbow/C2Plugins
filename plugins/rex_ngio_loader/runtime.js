// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_NGIO_Loader = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_NGIO_Loader.prototype;
		
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
        this.host = this.properties[0];
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
        assert2(this.ngio, "NGIO.Loader: Can not find NGIO Authentication oject.");
        return null; 
	};    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
	Cnds.prototype.OnGetURLSuccess = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnGetURLError = function ()
	{
	    return true;
	};
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
    
    Acts.prototype.LoadNewgrounds = function (redirect)
	{
        var cnds = cr.plugins_.Rex_NGIO_Loader.prototype.cnds;
        var callback = getHandler(this, cnds.OnGetURLSuccess, cnds.OnGetURLError);
        var param = {
            "host": this.host,
            "redirect": (redirect === 1),
            };        
        this.GetNGIO()["callComponent"]("Loader.loadNewgrounds", param, callback);
	};       
    
    Acts.prototype.LoadMoreGames = function (redirect)
	{
        var cnds = cr.plugins_.Rex_NGIO_Loader.prototype.cnds;
        var callback = getHandler(this, cnds.OnGetURLSuccess, cnds.OnGetURLError);
        var param = {
            "host": this.host,
            "redirect": (redirect === 1),
            };        
        this.GetNGIO()["callComponent"]("Loader.loadMoreGames", param, callback);
	};        
    
    Acts.prototype.LoadAuthorUrl = function (redirect)
	{
        var cnds = cr.plugins_.Rex_NGIO_Loader.prototype.cnds;
        var callback = getHandler(this, cnds.OnGetURLSuccess, cnds.OnGetURLError);
        var param = {
            "host": this.host,
            "redirect": (redirect === 1),
            };        
        this.GetNGIO()["callComponent"]("Loader.loadAuthorUrl", param, callback);
	};
  
    Acts.prototype.LoadOfficialUrl = function (redirect)
	{
        var cnds = cr.plugins_.Rex_NGIO_Loader.prototype.cnds;
        var callback = getHandler(this, cnds.OnGetURLSuccess, cnds.OnGetURLError);
        var param = {
            "host": this.host,
            "redirect": (redirect === 1),
            };        
        this.GetNGIO()["callComponent"]("Loader.loadNewgrounds", param, callback);
	};     
  
    Acts.prototype.LoadReferral = function (redirect, referral_name)
	{
        var cnds = cr.plugins_.Rex_NGIO_Loader.prototype.cnds;
        var callback = getHandler(this, cnds.OnGetURLSuccess, cnds.OnGetURLError);
        var param = {
            "referral_name": referral_name,
            "host": this.host,
            "redirect": (redirect === 1),
            };        
        this.GetNGIO()["callComponent"]("Loader.loadReferral", param, callback);
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

	Exps.prototype.LastURL = function (ret)
	{
        var val;
        if (this.lastResult && this.lastResult["url"])
            val = this.lastResult["url"];
	    ret.set_string(val || "");
	};    
    
}());