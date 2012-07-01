// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Pokki = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Pokki.prototype;
		
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
	    this.is_hidden = false;
        var pokki = window["pokki"];               
        if (pokki != null)
        {
            var inst = this;
            pokki["addEventListener"]('popup_hidden',
                function()
                {
                    inst._on_hidden.apply(inst);
                }
            );
            pokki["addEventListener"]('popup_shown',
                function()
                {
                    inst._on_shown.apply(inst);
                }
            );            
        }
	};
	
	instanceProto._on_hidden = function()
	{
        this.runtime.trigger(cr.plugins_.Rex_Pokki.prototype.cnds.OnHidden, this);
        this.is_hidden = true;
	};
	instanceProto._on_shown = function()
	{
	    if (this.is_hidden)
            this.runtime.trigger(cr.plugins_.Rex_Pokki.prototype.cnds.OnShown, this);
        this.is_hidden = false;
	};	
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
	Cnds.prototype.OnHidden = function ()
	{
		return true;
	};

	Cnds.prototype.OnShown = function ()
	{
		return true;
	};     

	Cnds.prototype.HasPokki = function ()
	{
		return (window["pokki"] != null);
	};     
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.ClosePopup = function ()
	{
        var pokki = window["pokki"];   
        if (pokki != null)
            pokki["closePopup"]();
	};  

	Acts.prototype.OpenURLInDefaultBrowser = function (url)
	{
        var pokki = window["pokki"];   
        if (pokki != null)
            pokki["openURLInDefaultBrowser"](url);
	};  	
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());