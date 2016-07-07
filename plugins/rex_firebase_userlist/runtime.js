/*

users/
    <user-id>/
        <list-name>/
            <user-id> : true
                
requests/
    <request-id>
        senderID - userID of sender
        receiverID - userID of receiver
        sender-list - list name of sender
        receiver-list - list name of receiver
        reply - result of request
        message - message of this request

*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_Userlist = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_Userlist.prototype;
		
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
	    this.rootpath = this.properties[0] + "/";   
        this.ownerID = "";
        
        this.userLists = {};
        this.exp_CurUserID = "";
        this.CurUserInfo = null;
	};
	
    // 2.x , 3.x    
	var isFirebase3x = function()
	{ 
        return (window["FirebaseV3x"] === true);
    };
    
    var isFullPath = function (p)
    {
        return (p.substring(0,8) === "https://");
    };
	
	instanceProto.get_ref = function(k)
	{
        if (k == null)
	        k = "";
	    var path;
	    if (isFullPath(k))
	        path = k;
	    else
	        path = this.rootpath + k + "/";
            
        // 2.x
        if (!isFirebase3x())
        {
            return new window["Firebase"](path);
        }  
        
        // 3.x
        else
        {
            var fnName = (isFullPath(path))? "refFromURL":"ref";
            return window["Firebase"]["database"]()[fnName](path);
        }
        
	};
    
    var get_key = function (obj)
    {       
        return (!isFirebase3x())?  obj["key"]() : obj["key"];
    };
    
    var get_refPath = function (obj)
    {       
        return (!isFirebase3x())?  obj["ref"]() : obj["ref"];
    };    
    
    var get_root = function (obj)
    {       
        return (!isFirebase3x())?  obj["root"]() : obj["root"];
    };
    
    var serverTimeStamp = function ()
    {       
        if (!isFirebase3x())
            return window["Firebase"]["ServerValue"]["TIMESTAMP"];
        else
            return window["Firebase"]["database"]["ServerValue"];
    };       

    var get_timestamp = function (obj)    
    {       
        return (!isFirebase3x())?  obj : obj["TIMESTAMP"];
    };    
    // 2.x , 3.x  
    
    var getUsersListKey = function (ownerID, listName, targetID)
    {
        var k = "";
        if (ownerID != null)
            k += "/" + ownerID;
        if (listName != null)
            k +=  "/" + listName;
        if (targetID != null)
            k +=  "/" + targetID;        

        return k;
    }
    
    var clean_table = function (o)
	{
        var k;
        for (k in o)
            delete o[k];
	};	
    
    instanceProto.addUser = function (pathA, valueA, pathB, valueB, onComplete)
	{
        var self=this;      
	    var handler = function(error) 
	    {
            if (onComplete)
                onComplete(error);
        };
        
        var data = {};
        
        data[ pathA ] = valueA;
        if (arguments.length >= 4)
            data[ pathB ] = valueB;
        var ref = this.get_ref("users");
        ref["update"](data, handler);
	};	    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds(); 

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetOwner = function (id)
	{
        this.ownerID = id;
        // clean current local user lists
        clean_table(this.userLists);
	};
	
    Acts.prototype.RequestAllLists = function ()
	{
        if (this.ownerID==="")
            return;            
                
        var user_ref = this.get_ref(this.ownerID);
        var self = this;
        var on_read = function (snapshot)
        {
            var l = snapshot["val"]();
            if (l === null)
                clean_table(self.userLists);
            else
                self.userLists = l;

            self.runtime.trigger(cr.plugins_.Rex_Firebase_Userlist.prototype.cnds.OnReceivingAllLists, self);
        };
        
        user_ref["once"]("value", on_read); 
	};
	
    Acts.prototype.AddUserIn2Sides = function (target_id, owner_list, target_list)
	{
        if (this.ownerID==="")
            return;
            
        var self=this;      
	    var onComplete = function(error) 
	    {
        };
        
        this.addUser(getUsersListKey(this.ownerID, owner_list, target_id), true,
                           getUsersListKey(target_id, target_list, this.ownerID), true,
                           onComplete);
	};	
	
    Acts.prototype.RemoveUserFrom2Sides = function  (target_id, owner_list, target_list)
	{
        if (this.ownerID==="")
            return;
        
        var self=this;      
	    var onComplete = function(error) 
	    {
        };
        
        this.addUser(getUsersListKey(this.ownerID, owner_list, target_id), null,
                           getUsersListKey(target_id, target_list, this.ownerID), null,
                           onComplete);
	};
		
    Acts.prototype.AddUser = function (target_id, owner_list)
	{
        if (this.ownerID==="")
            return;
            
        var self=this;      
	    var onComplete = function(error) 
	    {
        };
        
        this.addUser(getUsersListKey(this.ownerID, owner_list, target_id), true,
                           onComplete);                           
	};	
	
    Acts.prototype.RemoveUser = function (target_id, owner_list)
	{
        if (this.ownerID==="")
            return;

        var self=this;      
	    var onComplete = function(error) 
	    {
        };
        
        this.addUser(getUsersListKey(this.ownerID, owner_list, target_id), null,
                           onComplete);    
	};

    Acts.prototype.Request = function (target_id, owner_list, target_list, msg)
	{
        if (this.ownerID==="")
            return;
        
        var self=this;      
	    var handler = function(error) 
	    {
        };        
        var data = {
          "senderID": this.ownerID,
          "receiverID": target_id,
          "sender-list": owner_list,
          "receiver-list": target_list,
          "reply": -1,
          "message": msg,
          
        };
        var ref = this.get_ref("requests");
        ref["push"](data, handler);     
	};	
	
    Acts.prototype.RespondRequest = function (request_id, is_accept)
	{
        debugger
        if (this.ownerID==="")
            return;
      
        var request_ref = this.get_ref("requests")["child"](request_id);
        var self = this;
        var onComplete = function (error)
        {
            
        };
        
        var set_reply = function (is_accept)
        {
            var on_write_reply = function(current_value)
            {
                if (current_value === null)
                    return null; // skip
                else if (current_value === -1)
                    return is_accept;
                else
                    return;    // Abort the transaction
            }
            var on_write_reply_complete = function(error, committed, snapshot) 
            {
                onComplete(error);         
            };             
            var reply_reply = self.get_ref("requests")["child"](request_id)["child"]("reply");
            reply_reply["transaction"](on_write_reply, on_write_reply_complete);
        };
        
        
        var on_read = function (snapshot)
        {
            var data = snapshot["val"]();
            if (data == null)    // read nothing
                return;
            if (data["receiverID"] !== self.ownerID)
                return;
            if (data["reply"] !== -1)
                return;            
            
            if (is_accept === 1)
            {
                self.addUser(getUsersListKey(data["receiverID"], data["receiver-list"], data["senderID"]), true,
                                  getUsersListKey(data["senderID"], data["sender-list"], data["receiverID"]), true);
            }
            set_reply(is_accept);
        };
        request_ref["once"]("value", on_read);        
	};

    Acts.prototype.CancelRequest = function (request_id)
	{
        if (this.ownerID==="")
            return;
             
        var request_ref = this.get_ref("requests")["child"](request_id);
        var self = this;
        var onComplete = function (error)
        {
            
        };
        request_ref["set"](null, onComplete);       
	};

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.OwnerID = function (ret)
	{
		ret.set_string(this.userID);
	};
		
	Exps.prototype.CurUserID = function (ret)
	{
		ret.set_string(this.exp_CurUserID);
	}; 	
					 	
}());