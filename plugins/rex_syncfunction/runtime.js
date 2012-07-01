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
        this.user_id = (this.sync_mode)? (-1):1;
        this.user_name = this.properties[1];
        this.param = {};        
	};
    
    instanceProto.run_callback = function(exe_mode, cmd, params)
	{
        if (params != null)
            this.callback.AddParams(params);
        if (exe_mode == 0)
            this.callback.ExecuteCommands(cmd);
        else
            this.callback.CallFn(cmd);
	};  
     
    instanceProto.on_message = function(user_id, data)
	{
        this.user_id = user_id;
        // format: [cmd, params]
        this.run_callback(data[0],data[1], data[2]);
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
	
    Cnds.prototype.IsNetworkMode = function()
	{
		return this.sync_mode;
	};  
    
    Cnds.prototype.IsMyCommand = function()
	{
		return (this.branch.get_my_user_id() == this.user_id);
	};   
    
	Cnds.prototype.AmIRoomModerator = function()
	{
		return (this.sync_mode)? this.branch.am_I_room_moderator():true;
	};     
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.Setup = function (network_objs, fn_objs)
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
    
	Acts.prototype.SetSyncMode = function (sync_mode)
	{
        this.sync_mode = (sync_mode==0);
	}; 
    
    Acts.prototype.SetParameter = function (index, value)
	{
        this.param[index] = value;
	};     
    
	Acts.prototype.ExecuteCommands = function (cmd_string)
	{
        if (this.sync_mode)
        {
            // format: [exe_mode, cmd, params]
            this.branch.send([0, cmd_string, this.param]);
        }
        else
            this.run_callback(0, cmd_string, this.param);
	};  

	Acts.prototype.CallFunction = function (cmd_string)
	{  
        if (this.sync_mode)
        {
            // format: [exe_mode, cmd, params]
            this.branch.send([1, cmd_string, this.param]);
        }
        else
            this.run_callback(1, cmd_string, this.param);
	};    
    
	Acts.prototype.CleanParameters = function ()
	{
        var key;
        for (key in this.param)
            delete this.param[key];
	};      
    
    Acts.prototype.SetUserName = function (name)
	{
        this.user_name = name;
	}; 
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.UsrID = function(ret)
	{
        var user_id = (this.sync_mode)? this.user_id:1;    
		ret.set_int(user_id);        
	};    
	Exps.prototype.UsrName = function(ret, user_id)
	{   
        var user_name = (this.sync_mode)?
                        this.branch.get_user_name(user_id):
                        this.user_name;
		ret.set_string(user_name);        
	};  
	Exps.prototype.UsrID2Name = function(ret, user_id)
	{   
        var user_name = (this.sync_mode)?
                        this.branch.get_user_name(user_id):
                        this.user_name;
		ret.set_string(user_name);          
	};      
	Exps.prototype.MyUserName = function(ret)
	{   
		ret.set_string(this.branch.get_my_user_name());         
	};
	Exps.prototype.MyUserID = function(ret)
	{   
		ret.set_int(this.branch.get_my_user_id());         
	};      
}());