// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGRoundFSM = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SLGRoundFSM.prototype;
		
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
        this.activated = (this.properties[0]==1);
        this.exp_AvailableSource = "";
        this.exp_Source = "";
        this.exp_AvailableCommand = "";
        this.exp_Command = "";
        this.exp_AvailableTarget = "";
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
        this._enterTrigs = {"Idle":cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnEnterIdle,
                            "GetSource":cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnEnterGetSource,
                            "GetCommand":cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnEnterGetCommand,
                            "GetTarget":cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnEnterGetTarget,
                            "AcceptCommand":cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnEnterAcceptCommand,
                            "RunCommand":cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnEnterRunCommand       };   
        this._exitTrigs =  {"Idle":cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnExitIdle,
                            "GetSource":cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnExitGetSource,
                            "GetCommand":cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnExitGetCommand,
                            "GetTarget":cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnExitGetTarget,
                            "AcceptCommand":cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnExitAcceptCommand,
                            "RunCommand":cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnExitRunCommand       };   
        this._state2int =  {"Idle":0,
                            "GetSource":1,
                            "GetCommand":2,
                            "GetTarget":3,
                            "AcceptCommand":4,
                            "RunCommand":5 };
                            
        if (this.activated)
            this._request();  // "Off" -> "Idle"                    
	};
   	
	instanceProto._request = function(cmd)
	{
        var new_state = this._request_handler[this._cur_state](cmd);
        this._on_state_transfer(new_state);
	};
	instanceProto._request_Off = function(cmd)
	{
        return "Idle";
	};    
	instanceProto._request_Idle = function(cmd)
	{
        if (cmd == "Start")
            return "GetSource";
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
           return "GetSource";             
	};
	instanceProto._request_GetTarget = function(cmd)
	{
        if (cmd == "GetTarget")
           return "AcceptCommand";
        else if (cmd == "Cancel")
           return "GetSource"; 
	};  
	instanceProto._request_AcceptCommand = function(cmd)
	{
        if (cmd == "AcceptCommand")
           return "RunCommand";
        else if (cmd == "Cancel")
           return "GetSource"; 
	};
	instanceProto._request_RunCommand = function(cmd)
	{
        if (cmd == "Finish")    
            return "Idle"; 
	};     
	instanceProto._on_state_transfer = function(new_state)
	{     
        if (new_state == null)
            return;
        var old_state = this._cur_state;
        this._pre_state = this._cur_state;
        this._cur_state = new_state;
        
        this.runtime.trigger(cr.plugins_.Rex_SLGRoundFSM.prototype.cnds.OnStateChanging,this); 
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
    
    var _state_list = ["Idle","GetSource","GetCommand","GetTarget","AcceptCommand","RunCommand"];    
	cnds.IsState = function (state_index)  
    {       
        return (this._cur_state == _state_list[state_index]);
    };   	    
	cnds.OnEnterIdle = function ()  { return true; };    
	cnds.OnExitIdle = function ()  { return true; };  	
	cnds.OnEnterGetSource = function ()  { return true; };    
	cnds.OnExitGetSource = function ()  { return true; };
	cnds.OnEnterGetCommand = function ()  { return true; };    
	cnds.OnExitGetCommand = function ()  { return true; };	
	cnds.OnEnterGetTarget = function ()  { return true; };    
	cnds.OnExitGetTarget = function ()  { return true; };  	
	cnds.OnEnterAcceptCommand = function ()  { return true; };    
	cnds.OnExitAcceptCommand = function ()  { return true; };
	cnds.OnEnterRunCommand = function ()  { return true; };    
	cnds.OnExitRunCommand = function ()  { return true; };		
	cnds.OnStateChanging = function ()  { return true; };		 
	 
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
	acts.SetActivated = function (s)
	{
		this.activated = (s==1);
        if (this.activated && (this._cur_state == "Off"))
            this._request();  // "Off" -> "Idle"  
	};
    acts.Start = function ()
    {
        if (!this.activated)
            return;
        this._request("Start");
	};      
    acts.GetAvailableSourceGroup = function (group_name)
    {        
        if (!this.activated)
            return;    
        this.exp_AvailableSource = group_name;
        this._request("GetAvailableSource");    
	};
    acts.GetSourceGroup = function (group_name)
    {       
        if (!this.activated)
            return;     
        this.exp_Source = group_name;  
        this._request("GetSource");
	};  
    acts.GetAvailableCommands = function (command)
    {
        if (!this.activated)
            return;    
        this.exp_AvailableCommand = command;
	};
    acts.GetCommand = function (command)
    {        
        if (!this.activated)
            return;    
        this.exp_Command = command;
        this._request("GetCommand");
	}; 
    acts.GetAvailableTargetGroup = function (group_name)
    {
        if (!this.activated)
            return;    
        this.exp_AvailableTarget = group_name;
	};
    acts.GetTargetGroup = function (group_name)
    {
        if (!this.activated)
            return;    
        this.exp_Target = group_name;
        this._request("GetTarget");
	}; 
    acts.AcceptCommand = function ()
    {      
        if (!this.activated)
            return;    
        this._request("AcceptCommand");
	};
    acts.Finish = function ()
    {      
        if (!this.activated)
            return;    
        this._request("Finish");
	};    
    acts.Cancel = function ()
    {     
        if (!this.activated)
            return;    
        this._request("Cancel");
	};     
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
    
	exps.CurState = function (ret)
	{   
	    ret.set_string(this._cur_state);
	};  
	exps.PreState = function (ret)
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
 	exps.AvailableSource = function (ret)
	{   
	    ret.set_string(this.exp_AvailableSource);
	};
	exps.AvailableCommand = function (ret)
	{   
	    ret.set_string(this.exp_AvailableCommand);
	};   
	exps.AvailableTarget = function (ret)
	{   
	    ret.set_string(this.exp_AvailableTarget);
	};    
}());