/*
senderID - userID of sender
senderName - name of sender
message - message, string or json object in string
stamp - true or false, toggled after each sent

# message would be cleaned if user had left
*/


// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_SimpleMessage = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var input_text = "";
	var pluginProto = cr.plugins_.Rex_Firebase_SimpleMessage.prototype;
		
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
	    jsfile_load("firebase.js");
	};
	
	var jsfile_load = function(file_name)
	{
	    var scripts=document.getElementsByTagName("script");
	    var exist=false;
	    for(var i=0;i<scripts.length;i++)
	    {
	    	if(scripts[i].src.indexOf(file_name) != -1)
	    	{
	    		exist=true;
	    		break;
	    	}
	    }
	    if(!exist)
	    {
	    	var newScriptTag=document.createElement("script");
	    	newScriptTag.setAttribute("type","text/javascript");
	    	newScriptTag.setAttribute("src", file_name);
	    	document.getElementsByTagName("head")[0].appendChild(newScriptTag);
	    }
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
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/";
        var init_start = (this.properties[3] == 1);
        
        this.userID = null;
        this.userName = null;
        
        var message_type = this.properties[2];
        this.simple_message = this.create_simpleMessage(message_type, this.get_ref());
        this.exp_LastMessage = null;
        
        if (init_start)
            this.simple_message.StartUpdate(); 
	};
	
	instanceProto.get_ref = function(k)
	{
	    if (k == null)
	        k = "";
	        
	    var path;
	    if (k.substring(0,8) == "https://")
	        path = k;
	    else
	        path = this.rootpath + k + "/";
	        
        return new window["Firebase"](path);
	};
	
	
    instanceProto.create_simpleMessage = function (message_type, ref)
	{    
	    var self = this;
	    var on_received = function(d)
	    {
	        self.exp_LastMessage = d;
            var trig = cr.plugins_.Rex_Firebase_SimpleMessage.prototype.cnds.OnReceivedMessage;
            self.runtime.trigger(trig, self); 
	    };
	    
	    var simple_message = new window.FirebaseSimpleMessageKlass(message_type);
	    simple_message.onReceived = on_received;
        simple_message.SetRef(ref);
        
        return simple_message;
    };
  
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnReceivedMessage = function ()
	{
	    return true;
	};
		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetUserInfo = function (userID, userName)
	{	    
        this.userID = userID;
        this.userName = userName; 
	};    
    Acts.prototype.StartUpdate = function ()
	{	    
	    this.simple_message.StartUpdate();   
	};
 
    Acts.prototype.StopUpdate = function ()
	{
	    this.simple_message.StopUpdate();    
	};

    Acts.prototype.BroadcastMessage = function (message)
	{
	    this.simple_message.Send(message, this.userID, this.userName);
	};       
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.LastSenderID = function (ret)
	{
        var senderID = null;
        if (this.exp_LastMessage != null)
            senderID = this.exp_LastMessage["senderID"];
        if (senderID == null)
            senderID = "";
	    
		ret.set_string(senderID);
	};  

	Exps.prototype.LastSenderName = function (ret)
	{
        var senderName = null;
        if (this.exp_LastMessage != null)
            senderName = this.exp_LastMessage["senderName"];
        if (senderName == null)
            senderName = "";            
            
		ret.set_string(senderName);
	}; 

	Exps.prototype.LastMessage = function (ret)
	{
        var message = null;
        if (this.exp_LastMessage != null)
            message = this.exp_LastMessage["message"];            
        if (message == null)
            message = "";  
        
		ret.set_string(message);
	}; 
	
}());

(function ()
{
    if (window.FirebaseSimpleMessageKlass != null)
        return;    
    
    var MESSAGE_STRING = 0;
    var MESSAGE_JSON = 1;
    var SimpleMessageKlass = function (messageType)
    {
        // export
        this.onReceived = null
        // export
                
        this.messageType = messageType;
        
        // internal
        this.skip_first = true;
        this.stamp = false;
        this.ref = null;
        this.on_read = null;        
    };
    
    var SimpleMessageKlassProto = SimpleMessageKlass.prototype;    

    SimpleMessageKlassProto.SetRef = function (ref)
    {
        var is_reading = (this.on_read != null);
        this.StopUpdate();
        this.ref = ref;
        if (is_reading)
            this.StartUpdate();
    }; 
    
    SimpleMessageKlassProto.Send = function (message, senderID, senderName)
    {
        if (this.ref == null)
            return;
        
        if (this.messageType == MESSAGE_JSON)
            message = JSON.parse(s); 
        
        var d = {
            "message": message,
            "senderID": senderID,
            "senderName": senderName,
            "stamp" : this.stamp,
        };
        this.skip_first = false;        
        this.ref["set"](d);        
        this.stamp = !this.stamp;
    };    
    
    SimpleMessageKlassProto.StartUpdate = function (ref)
	{
        this.StopUpdate();
        if (ref != null)
            this.ref = ref; 
        
        this.skip_first = true;      // skip previous message
        
        var self = this;
	    var on_update = function (snapshot)
	    {     
	        var d = snapshot["val"]();
            if (self.skip_first)
            {
                self.skip_first = false;
                return;
            }
            if (d == null)
                return;


            if (self.messageType == MESSAGE_JSON)
                d["message"] = JSON.stringify(d["message"]);
            
            if (self.onReceived)
                self.onReceived(d);
        };

        this.ref["on"]("value", on_update);        
        this.on_read = on_update;
        this.ref["onDisconnect"]()["remove"]();
    };

    SimpleMessageKlassProto.StopUpdate = function ()
	{
        if (this.on_read == null)
            return;

        this.ref["off"]("value", this.on_read);
        this.on_read = null;             
        
        this.ref["remove"]();
        this.ref["onDisconnect"]()["cancel"]();
    };  
        	
	window.FirebaseSimpleMessageKlass = SimpleMessageKlass;
}());     