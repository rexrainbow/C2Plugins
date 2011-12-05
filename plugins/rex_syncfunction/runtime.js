// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SyncFn = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SyncFn.prototype;
		
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
        this.sync_mode = (this.properties[0]==0);
        this.branch = null;
        this.callback = null;         
        this.usr_id = -1;
        this.param = {};        
	};
    
    instanceProto.run_callback = function(cmd, params)
	{
        if (params != null)
            this.callback.AddParams(params);
        this.callback.ExecuteCommands(cmd);
	};  
     
    instanceProto.on_message = function(usr_id, data)
	{
        this.usr_id = usr_id;
        // format: [cmd, params]
        this.run_callback(data[0],data[1]);
	};

	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

    acts.Setup = function (network_objs, fn_objs)
	{  
        var network = network_objs.instances[0];
        if (network.check_name == "NETWORK")
            this.branch = network.CreateBranch(this, this.on_message);
        else
            alert ("Sync-Function should connect to a network object");          
        
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.callback = callback;        
        else
            alert ("Sync-Function should connect to a function object");
	};  
    
	acts.SetSyncMode = function (sync_mode)
	{
        this.sync_mode = (sync_mode==0);
	}; 
    
    acts.SetParameter = function (index, value)
	{
        this.param[index] = value;
	};     
    
	acts.ExecuteCommands = function (cmd_string)
	{
        if (this.sync_mode)
        {
            // format: [cmd, params]
            this.branch.send([cmd_string, this.param]);
        }
        else
            this.run_callback(cmd_string, this.param);
	};     

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

}());