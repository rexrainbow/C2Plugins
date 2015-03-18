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

    var OFFLMSG_DISCARD = 0;
    var OFFLMSG_PEND = 1;    
	instanceProto.onCreate = function()
	{ 
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/";
        
        this.userID = "";
        this.userName = "";
        this.lastReceiverID = "";
        
        var message_type = this.properties[2];
        this.offline_mode = this.properties[3];
        
        if (!this.recycled)
        {
	        var messageKlass = (this.offline_mode == OFFLMSG_DISCARD)? 
	                           window.FirebaseSimpleMessageKlass: window.FirebaseStackMessageKlass;        
            this.inBox = this.create_inBox(messageKlass, message_type);
            this.outPort = new messageKlass(message_type);
        }
        this.exp_LastMessage = null;        
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
	
	
    instanceProto.create_inBox = function (messageKlass, message_type)
	{    
	    var self = this;
	    var on_received = function(d)
	    {
	        self.exp_LastMessage = d;
            var trig = cr.plugins_.Rex_Firebase_SimpleMessage.prototype.cnds.OnReceivedMessage;
            self.runtime.trigger(trig, self); 
	    };

	    var simple_message = new messageKlass(message_type);
	    simple_message.onReceived = on_received;
        
        return simple_message;
    };
    
    instanceProto.send_message = function (receiverID, message)
	{  
	    if (this.lastReceiverID != receiverID)
	    {
            var ref = this.get_ref(receiverID);	        	    
	        this.outPort.SetRef(ref);
	    }
	    
	    if (message == null)
	    {
	        // clean message
	        this.outPort.Send();  
	    }
	    else
	    {
	        this.outPort.Send(message, this.userID, this.userName);    
	    }
	  
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

    Acts.prototype.SetDomainRef = function (domain_ref, sub_domain_ref)
	{
	    this.inBox.StopUpdate();
		this.rootpath = domain_ref + "/" + sub_domain_ref + "/";
	};
	    
    Acts.prototype.SetUserInfo = function (userID, userName)
	{	    
        this.userID = userID;
        this.userName = userName; 
	};    
    Acts.prototype.StartUpdate = function (receiverID)
	{	   
	    if (receiverID == "")
	        return;
	    
	    var ref = this.get_ref(receiverID);
	    this.inBox.StartUpdate(ref);   
	};
 
    Acts.prototype.StopUpdate = function ()
	{
	    this.inBox.StopUpdate();    
	};

    Acts.prototype.SendMessage = function (receiverID, message)
	{
	    if (receiverID == "")
	        return;
	        
	    if (this.offline_mode == OFFLMSG_DISCARD)
	    {
	        // clean message if receiver had changed
	        if ((this.lastReceiverID != "") && (this.lastReceiverID != receiverID))           
	            this.send_message(this.lastReceiverID, null);	        
	    }
	    	    
        this.send_message(receiverID, message);
        this.lastReceiverID = receiverID;        
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
    if (window.FirebaseStackMessageKlass != null)
        return;    
    
    var MESSAGE_STRING = 0;
    var MESSAGE_JSON = 1;
    var StackMessageKlass = function (messageType)
    {
        // export
        this.onReceived = null
        // export
                
        this.messageType = messageType;
        
        // internal
        this.ref = null;
        this.on_read = null;        
    };
    
    var StackMessageKlassProto = StackMessageKlass.prototype;    

    StackMessageKlassProto.SetRef = function (ref)
    {
        var is_reading = (this.on_read != null);
        this.StopUpdate();
        this.ref = ref;
        if (is_reading)
            this.StartUpdate();
    }; 
    
    StackMessageKlassProto.Send = function (message, senderID, senderName)
    {
        if (this.ref == null)
            return;
            
        
        // clean message
        if ((message == null) && (senderID == null) && (senderName == null))
        {
            // do nothing  
            return;
        }
        
        if (this.messageType == MESSAGE_JSON)
            message = JSON.parse(message); 
        
        var d = {
            "message": message,
            "senderID": senderID,
            "senderName": senderName,
        };     
        this.ref["push"](d);
    };    
    
    StackMessageKlassProto.StartUpdate = function (ref)
	{
        this.StopUpdate();
        if (ref != null)
            this.ref = ref; 
        
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
                
            // remove this child
            snapshot["ref"]()["remove"]();
        };

        this.ref["limitToFirst"](1)["on"]("child_added", on_update);        
        this.on_read = on_update;
    };

    StackMessageKlassProto.StopUpdate = function ()
	{
        if (this.on_read == null)
            return;

        this.ref["off"]("child_added", this.on_read);
        this.on_read = null; 
    };  
        	
	window.FirebaseStackMessageKlass = StackMessageKlass;
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
            
        
        // clean message
        if ((message == null) && (senderID == null) && (senderName == null))
        {
            this.ref["remove"]();       
            return;
        }
        
        if (this.messageType == MESSAGE_JSON)
            message = JSON.parse(message); 
        
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