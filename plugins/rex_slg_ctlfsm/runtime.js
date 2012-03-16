// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGCTLFSM = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SLGCTLFSM.prototype;
		
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
        this._available_source = "";
        this.exp_Source = "";
        this._available_command = "";
        this.exp_Command = "";
        this._available_target = "";
        this.exp_Target = "";
        this._pre_state = "";
        this._cur_state = "Off";
        this._request_handler = {"Off":this._request_Off,
                                 "Idle":this._request_Idle,
                                 "GetSource":this._request_GetSource,
                                 "GetCommand":this._request_GetCommand,
                                 "GetTarget":this._request_GetTarget,
                                 "AcceptCommand":this._request_AcceptCommand,
                                 "RunCommand":this._request_RunCommand       };  
        this._enterTrigs = {"Idle":cr.plugins_.Rex_SLGCTLFSM.prototype.cnds.OnEnterIdle,
                            "GetSource":cr.plugins_.Rex_SLGCTLFSM.prototype.cnds.OnEnterGetSource,
                            "GetCommand":cr.plugins_.Rex_SLGCTLFSM.prototype.cnds.OnEnterGetCommand,
                            "GetTarget":cr.plugins_.Rex_SLGCTLFSM.prototype.cnds.OnEnterGetTarget,
                            "AcceptCommand":cr.plugins_.Rex_SLGCTLFSM.prototype.cnds.OnEnterAcceptCommand,
                            "RunCommand":cr.plugins_.Rex_SLGCTLFSM.prototype.cnds.OnEnterRunCommand       };   
        this._exitTrigs =  {"Idle":cr.plugins_.Rex_SLGCTLFSM.prototype.cnds.OnExitIdle,
                            "GetSource":cr.plugins_.Rex_SLGCTLFSM.prototype.cnds.OnExitGetSource,
                            "GetCommand":cr.plugins_.Rex_SLGCTLFSM.prototype.cnds.OnExitGetCommand,
                            "GetTarget":cr.plugins_.Rex_SLGCTLFSM.prototype.cnds.OnExitGetTarget,
                            "AcceptCommand":cr.plugins_.Rex_SLGCTLFSM.prototype.cnds.OnExitAcceptCommand,
                            "RunCommand":cr.plugins_.Rex_SLGCTLFSM.prototype.cnds.OnExitRunCommand       };   

        this._request();  // "Off" -> "Idle"                    
	};
   	
	instanceProto._request = function(cmd)
	{
        return this._request_handler[this._cur_state](cmd);
	};
	instanceProto._request_Off = function(cmd)
	{
        return "Idle";
	};    
	instanceProto._request_Idle = function(cmd)
	{
        if (cmd == "GetAvailableSource")
        {
            if (this._has_instances(this._available_source))   
                return "GetSource";
            //else
            // TODO
                
        }
	};
	instanceProto._request_GetSource = function(cmd)
	{
        if (cmd == "GetSource")
           return "GetCommand";
        else if (cmd == "Cancel")
           return "Idle";        
	}; 
	instanceProto._request_GetCommand = function(cmd)
	{
        if (cmd == "GetCommand")
           return "GetTarget";
        else if (cmd == "Cancel")
           return "Idle";             
	};
	instanceProto._request_GetTarget = function(cmd)
	{
        if (cmd == "GetTarget")
           return "AcceptCommand";
        else if (cmd == "Cancel")
           return "Idle"; 
	};  
	instanceProto._request_AcceptCommand = function(cmd)
	{
        if (cmd == "AcceptCommand")
           return "RunCommand";
        else if (cmd == "Cancel")
           return "Idle"; 
	};
	instanceProto._request_RunCommand = function(cmd)
	{
        if (cmd == "FinishExecution")    
            return "Idle"; 
	};     
	instanceProto._on_state_transfer = function(new_state)
	{     
        if (new_state == null)
            return;
        var old_state = this._cur_state;
        this._pre_state = this._cur_state;
        this._cur_state = new_state;
        var trig;
        trig = this._exitTrigs[old_state];
        if (trig != null)
            this.runtime.trigger(this._exitTrigs[old_state],this);
        trig = this._enterTrigs[new_state];
        if (trig != null)            
            this.runtime.trigger(this._enterTrigs[new_state],this);
	};
	instanceProto._has_instances = function(group_name)
	{
        return (this.group.GetGroup(group_name).length > 0);
	};
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	    
	cnds.OnEnterIdle = function (name)  { return true; };    
	cnds.OnExitIdle = function (name)  { return true; };  	
	cnds.OnEnterGetSource = function (name)  { return true; };    
	cnds.OnExitGetSource = function (name)  { return true; };
	cnds.OnEnterGetCommand = function (name)  { return true; };    
	cnds.OnExitGetCommand = function (name)  { return true; };	
	cnds.OnEnterGetTarget = function (name)  { return true; };    
	cnds.OnExitGetTarget = function (name)  { return true; };  	
	cnds.OnEnterAcceptCommand = function (name)  { return true; };    
	cnds.OnExitAcceptCommand = function (name)  { return true; };
	cnds.OnEnterRunCommand = function (name)  { return true; };    
	cnds.OnExitRunCommand = function (name)  { return true; };		
	 
	 
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
    acts.Setup = function (group_objs)
	{
        var group = group_objs.instances[0];
        if (group.check_name == "INSTGROUP")
            this.group = group;        
        else
            alert ("SLG CTLFSM should connect to a instance group object");            
	};     
    acts.GetAvailableSourceGroup = function (group_name)
    {        
        this._available_source = group_name;
        this._on_state_transfer(this._request("GetAvailableSource"));    
	};
    acts.GetSourceGroup = function (group_name)
    {        
        this.exp_Source = group_name;  
        this._on_state_transfer(this._request("GetSource"));
	};  
    acts.GetAvailableCommands = function (command)
    {
        this._available_command = command;
	};
    acts.GetCommand = function (command)
    {        
        this.exp_Command = command;
        this._on_state_transfer(this._request("GetCommand"));
	}; 
    acts.GetAvailableTargetGroup = function (group_name)
    {
        this._available_target = group_name;
	};
    acts.GetTargetGroup = function (group_name)
    {
        this.exp_Target = group_name;
        this._on_state_transfer(this._request("GetTarget"));
	}; 
    acts.AcceptCommand = function ()
    {        
        this._on_state_transfer(this._request("AcceptCommand"));
	};
    acts.FinishExecution = function ()
    {        
        this._on_state_transfer(this._request("FinishExecution"));
	};    
    acts.Cancel = function ()
    {        
        this._on_state_transfer(this._request("Cancel"));
	};     
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
    
	exps.NewState = function (ret)
	{   
	    ret.set_string(this._cur_state);
	};  
	exps.CurState = function (ret)
	{   
	    ret.set_string(this._pre_state);
	};    
	exps.Source = function (ret)
	{   
	    ret.set_string(this.exp_Source);
	};
	exps.Command = function (ret)
	{   
	    ret.set_string(this.exp_Command);
	};   
	exps.Target = function (ret)
	{   
	    ret.set_string(this.exp_Target);
	};      
}());