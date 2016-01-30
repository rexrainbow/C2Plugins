// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_TimeAway = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_TimeAway.prototype;
		
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
        this._webstorage_obj = null;
        this._save_fn = null;
        this._load_fn = null;
        this._remove_fn = null;
	    this.fake_ret = {value:0,
	                     set_any: function(value){this.value=value;},
	                     set_int: function(value){this.value=value;},	 
                         set_float: function(value){this.value=value;},	 
                         set_string: function(value){this.value=value;},	    
	                    };  

			
        this.exp_ElapsedDays = (-1);
	};
	
	instanceProto.webstorage_get = function ()
	{   	 
        if (this._webstorage_obj != null)
            return this._webstorage_obj;      
            
	    assert2(cr.plugins_.WebStorage, "Time away: Please put the webstorage plugin into project.");
        var plugins = this.runtime.types;
        this._save_fn = cr.plugins_.WebStorage.prototype.acts.StoreLocal;
        this._load_fn = cr.plugins_.WebStorage.prototype.exps.LocalValue;
        this._remove_fn = cr.plugins_.WebStorage.prototype.acts.RemoveLocal;
        var name, plugin;
        for (name in plugins)
        {
            plugin = plugins[name];
            if (plugin.plugin.acts.StoreLocal == this._save_fn)
            {
                this._webstorage_obj = plugin.instances[0];
                break;
            }                                          
        }
        
        return this._webstorage_obj;
	};
    
    instanceProto.load_value = function (key)
    {
        var webstorage_obj = this.webstorage_get();
        this._load_fn.call(webstorage_obj, this.fake_ret, key);
        return parseInt(this.fake_ret.value);
    };
    
    instanceProto.save_value = function (key, value)
    {
        var webstorage_obj = this.webstorage_get();
        this._save_fn.call(webstorage_obj, key, value);
    };
    
    instanceProto.remove_value = function (key)
    {
        var webstorage_obj = this.webstorage_get();
        this._remove_fn.call(webstorage_obj, key);
    };
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.StartTimer = function (key)
	{
        var today = new Date();
        var nowtime = today.getTime();
        this.save_value(key, nowtime);        
	};	

	Acts.prototype.RemoveTimer = function (key)
	{
        this.remove_value(key);        
	};		
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.ElapsedTime = function (ret, key)
	{
        var save_time = this.load_value(key);
        var today = new Date();
        var nowtime = today.getTime();
        var delta = (isNaN(save_time))? 0 : (nowtime - save_time);
        ret.set_float(delta/1000);
	};
	
}());