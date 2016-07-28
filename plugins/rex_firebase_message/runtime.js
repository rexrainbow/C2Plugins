/*
headers\
    <messageID>
        senderID - userID of sender
        senderName - name of sender
        receiverID - userID of receiver
        title - title (header) of message
        sentAt - timestamp         
bodies\   
    <messageID> - content (body) of message, string or json object in string 
    
*/


// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_message = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_message.prototype;
		
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

    var MESSAGE_STRING = 0;
    var MESSAGE_JSON = 1;
	instanceProto.onCreate = function()
	{ 
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/";
        this.message_type = this.properties[2];
        
        this.userID = "";
        this.userName = "";

        this.inBox = this.create_messageBox();
        this.newMsgRecv = this.create_newMessageReceived();
                
        this.exp_LastMessage = null;
        this.exp_CurMsg = null;
        this.exp_CurMsgIndex = -1;    
	};
	
	instanceProto.create_messageBox = function()
	{
	    var inBox = new window.FirebaseItemListKlass();
	    
	    inBox.updateMode = inBox.AUTOCHILDUPDATE;
	    inBox.keyItemID = "messageID";
	    
	    var self = this;	    
	    var on_update = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_Firebase_message.prototype.cnds.OnUpdate, self); 
	    };	    
        inBox.onItemAdd = on_update;
        inBox.onItemRemove = on_update;
        inBox.onItemChange = on_update;
        
	    var onGetIterItem = function(item, i)
	    {
	        self.exp_CurMsg = item;
	        self.exp_CurMsgIndex = i;
	    };
	    inBox.onGetIterItem = onGetIterItem; 
	           
        return inBox;
    };	
    
	instanceProto.create_newMessageReceived = function()
	{
	    var newMsgRecv = new window.FirebaseItemListKlass();
	    
	    newMsgRecv.updateMode = newMsgRecv.AUTOCHILDUPDATE;
	    newMsgRecv.keyItemID = "messageID";
        newMsgRecv.extra.startAt = "";

	    var self = this;	    
	    var on_add = function(item)
	    {	                
            if (item["messageID"] < newMsgRecv.extra.startAt)
                return;
	        self.exp_LastMessage = item;
	        self.runtime.trigger(cr.plugins_.Rex_Firebase_message.prototype.cnds.OnNewMessage, self); 
	    }; 
        newMsgRecv.onItemAdd = on_add;

        return newMsgRecv;
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
	
	instanceProto.get_inbox_ref = function(userID)
	{
        if (userID == null)
            userID = this.userID;
            
        var ref = this.get_ref();        
	    return ref["orderByChild"]("receiverID")["equalTo"](userID);
	};	
	
	instanceProto.get_sent_ref = function(userID)
	{
        if (userID == null)
            userID = this.userID;
            
        var ref = this.get_ref();
	    return ref["orderByChild"]("senderID")["equalTo"](userID);
	};			
	
    instanceProto.start_update = function ()
	{
	    var query = this.get_inbox_ref(this.userID);
	    this.inBox.StartUpdate(query);
	    
        this.newMsgRecv.extra.startAt = this.get_ref()["push"]()["key"]();
	    var query = this.get_inbox_ref(this.userID)["limitToLast"](1);
	    this.newMsgRecv.StartUpdate(query);	   
	};
 
    instanceProto.stop_update = function ()
	{ 
	    this.inBox.StopUpdate();
	    this.newMsgRecv.StopUpdate();
	};

    instanceProto.send = function (receiverID, title_, content_)
	{
        // prepare header      
	    var header = {
            "senderID": this.userID,
            "senderName": this.userName,
            "receiverID": receiverID,
            "title" : title_,
            "sentAt": window["Firebase"]["ServerValue"]["TIMESTAMP"]
	    };
        // send header
        var ref = this.get_ref("headers")["push"](header);                
        var messageID = ref["key"]();
        
        // prepare body
        if (this.messageType == MESSAGE_JSON)
            content_ = JSON.parse(content_); 
        this.get_ref("bodies")["child"](messageID)["set"](content_);      
	};   	
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnNewMessage = function ()
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
	    this.start_update();
	};
 
    Acts.prototype.StopUpdate = function ()
	{ 
	    this.stop_update();
	};

    Acts.prototype.Send = function (receiverID, title_, content_)
	{
	    this.send(receiverID, title_, content_);
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

	Exps.prototype.LastTitle = function (ret)
	{
        var title_ = null;
        if (this.exp_LastMessage != null)
            title_ = this.exp_LastMessage["title"];            
        if (title_ == null)
            title_ = "";  
        
		ret.set_string(title_);
	};

	Exps.prototype.LastContent = function (ret)
	{
        var content_ = null;
        if (this.exp_LastMessage != null)
            content_ = this.exp_LastMessage["content"];            
        if (content_ == null)
            content_ = "";  
        
		ret.set_string(content_);
	};	

	Exps.prototype.LastMessageID = function (ret)
	{
        var messageID = null;
        if (this.exp_LastMessage != null)
            messageID = this.exp_LastMessage["messageID"];            
        if (messageID == null)
            messageID = "";  
        
		ret.set_string(messageID);
	};
	
		
}());