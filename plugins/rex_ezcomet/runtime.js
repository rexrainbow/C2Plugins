// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

// load ez_comet.js
document.write('<script src="http://ezcomet.com/static/js/ez_comet.js"></script>');

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_EZComet = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_EZComet.prototype;
		
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

	var plugin_inst = null;
	instanceProto.onCreate = function()
	{        
	    this.sync_mode = (this.properties[0]==0);
        this._user_name = this.properties[1];
        this._api_key = this.properties[2];
        this._channel = this.properties[3];
        this.callback = null;
        this.param_send = {};
        this.fn_name = "";
        this.param_received = {};
        
        plugin_inst = this;
        _setup(this._user_name, this._channel);             
	};
	
	var _on_message = function(msg)
	{        
	    var params = JSON.parse(msg);
	    plugin_inst.run_callback.apply(plugin_inst, params);
	};	
	
	var _setup = function(user_name, channel)
	{        
        window["ez_comet"].subscribe({
            "user_name": user_name,
            "channel": channel,
            "callback": _on_message
        });    
	};	
	
	instanceProto._send = function(message)
	{	    
	    var _url = "http://api.ezcomet.com/write?qname="+
	               this._user_name+"-"+this._channel+"&api_key="+this._api_key+"&msg="+message;
	    jQuery.get(_url);
	};  
    
    instanceProto.run_callback = function(cmd, params)
	{	    
	    this.fn_name = cmd;
        this.param_received = params;
        this.runtime.trigger(cr.plugins_.Rex_EZComet.prototype.cnds.OnFunctionCalled, plugin_inst);
	};
	  
	instanceProto.clean_hash = function (hash_obj)
	{
        var key;
        for (key in hash_obj)
            delete hash_obj[key];
	};			
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds(); 
    
	Cnds.prototype.OnFunctionCalled = function (name)
	{
		return (this.fn_name == name);
	};	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
    Acts.prototype.SetParameter = function (index, value)
	{
        this.param_send[index] = value;
	};     
    
	Acts.prototype.CallFunction = function (cmd_string)
	{  
        if (this.sync_mode)
        {
            // format: [cmd, params]
            var message = [cmd_string, this.param_send];
            this._send(JSON.stringify(message));
        }
        else
            this.run_callback(cmd_string, this.param_send);
	}; 

	Acts.prototype.CleanParameters = function ()
	{
        var key;
        for (key in this.param_send)
            delete this.param_send[key];	    
	}; 	

	Acts.prototype.SetChannel = function(channel)
	{
	    this._channel = channel; 
	    _setup(this._user_name, this._channel);         
	};  	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
    Exps.prototype.Param = function (ret, index, default_value)
	{
        var value = this.param_received[index];
        if (value == null) 
            value = default_value;
	    ret.set_any(value);
	};
    
}());