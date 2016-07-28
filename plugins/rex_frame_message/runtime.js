// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_FrameMessage = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_FrameMessage.prototype;
		
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

    var CMD_FNCALL = "Rex_FrameMessage.Call";
    var CMD_FNRTN = "Rex_FrameMessage.Return";
    var CMD_LOG = "Rex_FrameMessage.Log";
    
	instanceProto.onCreate = function()
	{
	    this.my_frame_name = this.properties[0];
	    this.exp_LastSender = "";
        this.fn_name = null;
        this.exp_params = null; 
		this.message_source = null;
		this.exp_ReturnValue = 0;
	    
	    var self=this;
	    var onMessage = function(e)
	    {	
	        var data = e["data"];
	        var type = data["type"];
	        if (type === CMD_FNCALL)
	        {
			    self.message_source = e["source"];
	            self.receive_call(data["sender"], data["receiver"], data["fnName"], data["params"]);
				self.message_source = null;
	        }
			else if (type === CMD_FNRTN)
			{
	            self.receive_return(data["sender"], data["fnName"], data["value"]);			    
			}
            else if (type === CMD_LOG)
            {
	            self.receive_log(data["sender"], data["value"]);			                    
            }    	           
	    };
	    window["addEventListener"]("message", onMessage, false);
	};
    
	instanceProto.onDestroy = function ()
	{
	};

	// Function call
	instanceProto.send_call = function (receiver_name, fn_name_, params_)
	{
	    var data = {"type":CMD_FNCALL,	               
	                "sender": this.my_frame_name,
	                "receiver": receiver_name,
	                "fnName": fn_name_,
	                "params": params_ 
	                };
	    
	    var wait_frames=[window["top"]];
	    var frames=[], i, cnt, f;
	    while (wait_frames.length > 0)
	    {
	        cr.shallowAssignArray(frames, wait_frames);
	        wait_frames.length = 0;
	        
	        cnt = frames.length;
	        for(i=0; i<cnt; i++)
	        {
	            f = frames[i];
	            frames[i]["postMessage"](data, "*");
	            
	            wait_frames.push.apply(wait_frames, f["frames"]);
	        }
	    }
	};	
	
    instanceProto.receive_call = function(sender, receiver, fnName, params)
    {
	    if ((receiver !== "") && (this.my_frame_name !== receiver))
	        return;
	                
        this.exp_LastSender = sender;
        this.fn_name = fnName;
        this.exp_params = params;    
             
        this.runtime.trigger(cr.plugins_.Rex_FrameMessage.prototype.cnds.OnFunction, this); 	
        
        this.exp_LastSender = "";        
        this.fn_name = null;
        this.exp_params = null;            
    };
	// Function call

    // Return value	
	instanceProto.send_return = function (receiver_win, value_)
	{
	    var data = {"type":CMD_FNRTN,	               
	                "sender": this.my_frame_name,	                
	                "fnName": this.fn_name,
	                "value": value_ 
	                };
	    
		receiver_win["postMessage"](data, "*");
	};
	
    instanceProto.receive_return = function(sender, fnName, value_)
    {
        this.exp_LastSender = sender;
        this.fn_name = fnName;
        this.exp_ReturnValue = value_;    
             
        this.runtime.trigger(cr.plugins_.Rex_FrameMessage.prototype.cnds.OnReturn, this); 	
        
        this.exp_LastSender = "";
        this.fn_name = null;
        this.exp_ReturnValue = 0;            
    };	
    // Return value	
    
    // console log of main frame
	instanceProto.send_log = function (receiver_win, type_, msg_)
	{
	    var data = {"type":CMD_LOG,	               
	                "sender": this.my_frame_name,
                    "value": [type_, msg_]
	                };
	    
		receiver_win["postMessage"](data, "*");
	};
	
    instanceProto.receive_log = function(sender, value)
    {
		if (typeof console === "undefined")
			return;
	    
        var type_ =  value[0], msg_ = value[1];
		if (type_ === 0 && console.log)
			console.log(msg_.toString());
		if (type_ === 1 && console.warn)
			console.warn(msg_.toString());
		if (type_ === 2 && console.error)
			console.error(msg_.toString());
        
    };	    
    // console log
	
	instanceProto.saveToJSON = function ()
	{
		return { "myName": this.my_frame_name,
		        };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.my_frame_name = o["myName"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnFunction = function (name_)
	{
		return cr.equals_nocase(this.fn_name, name_);
	};

	Cnds.prototype.OnReturn = function (name_)
	{
		return cr.equals_nocase(this.fn_name, name_);
	};  

	Cnds.prototype.IsTopFrame = function ()
	{
		return window["top"] === window;
	};  	
	  
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.SetReceivingFrameName = function (channel_name)
	{       
	    this.my_frame_name = channel_name;
	}; 

    Acts.prototype.CallFunction = function (receiver_name, fn_name_, params_)
	{       
	    this.send_call(receiver_name, fn_name_, params_);
	};     

    Acts.prototype.SetReturnValue = function (value_)
	{
	    if (!this.message_source)
		    return;
			
	    this.send_return(this.message_source, value_);
	};   

    Acts.prototype.ConsoleLog = function (type_, msg_)
	{       
	    this.send_log(window["top"], type_, msg_);
	};  
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.MyFrameName = function (ret)
	{
	    ret.set_string( this.my_frame_name );
	};

    Exps.prototype.LastSender = function (ret)
	{
	    ret.set_string( this.exp_LastSender );
	};		
	
    Exps.prototype.ParamCount = function (ret)
	{
	    var cnt=0;
	    if (this.exp_params)
	        cnt = this.exp_params.length;
	    ret.set_int( cnt );
	};
	
    Exps.prototype.Param = function (ret, idx)
	{
	    var val=0;
	    if (this.exp_params && (idx < this.exp_params.length))
	        val = this.exp_params[idx];
	    ret.set_any( val );
	};	

    Exps.prototype.ReturnValue = function (ret)
	{
	    ret.set_any( this.exp_ReturnValue );
	};	
    
}());