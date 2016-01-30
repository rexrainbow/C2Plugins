/*

<user-id>/
    lists/
        <list-name>/
            <member-user-id>
            
    invite/
        <inviter-id>
            inviter-id
            inviter-list
            my-list
            message

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
	var input_text = "";
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
	    this.rootpath = this.properties[0] + "/";   
        this.owner_userID = "";
        
        this.userLists = {};
        this.exp_CurUserID = "";
        this.CurUserInfo = null;
        this.inviter_lists = null;
        this.listener_refs = [];
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
	
	instanceProto.get_list_ref = function(userId, list_name)
	{	    
        return this.get_ref(userId + "/lists/" + list_name);
	};
    
	instanceProto.get_inviter_list_ref = function(userId)
	{	    
        return this.get_ref(userId)["child"]("invite");
	};    
    
	instanceProto.get_cancel_notify_ref = function(userId)
	{	    
        return this.get_ref(userId)["child"]("cancel");
	};   
    
    instanceProto.userList_addUser = function (owner_id, list_name, target_id)
	{
        var list_ref = this.get_list_ref(owner_id, list_name);
        list_ref["child"](target_id)["set"](true);   
	};

    instanceProto.userList_removeUser = function (owner_id, list_name, target_id)
	{
        var list_ref = this.get_list_ref(owner_id, list_name);
        list_ref["child"](target_id)["remove"]();     
	};   

    instanceProto.setup_owner_listener = function ()
	{
        this.setup_cancel_listener();
	}; 
    
    instanceProto.close_owner_listener = function ()
	{
        var i, cnt=this.listener_refs.length;
        for (i=0; i<cnt; i++)
            this.listener_refs[i]["off"]();
	};     
    
    instanceProto.setup_cancel_listener = function ()
	{
        var remove_notify_ref = this.get_cancel_notify_ref(this.owner_userID);
        var self = this;
        var on_cancel = function (snapshot)
        {
            var info = snapshot["val"]();
            if (info === null)
                return;
            
            var user_ref = self.get_list_ref(self.owner_userID, info["my-list"])["child"](info["cancel-id"]);
            user_ref["remove"]();
            remove_notify_ref["child"](info["cancel-id"])["remove"]();
        };
        remove_notify_ref["on"]("child_added", on_cancel);
        this.listener_refs.push(remove_notify_ref);
	};      
	
    var clean_table = function (o)
	{
        var k;
        for (k in o)
            delete o[k];
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds(); 

	Cnds.prototype.OnReceivingAllLists = function ()
	{
	    return true;
	};	

	Cnds.prototype.ForEachUserIDInList = function (list_name)
	{
	    if (!this.userLists.hasOwnProperty(list_name))
	        return false;

        var user_list = this.userLists[list_name];
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var k;
		for (k in user_list)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }

            this.exp_CurUserID = k;
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }   
		}
      
	    return false;
	};
	
	Cnds.prototype.UserIDInList = function (id, list_name)
	{
	    if (!this.userLists.hasOwnProperty(list_name))
	        return false;
	    
	    return this.userLists[list_name].hasOwnProperty(id);
	};	

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetOwner = function (id)
	{
        this.close_owner_listener();
        this.owner_userID = id;
        // clean current local user lists
        clean_table(this.userLists);
        
        this.setup_owner_listener();
	};
	
    Acts.prototype.RequestAllLists = function ()
	{
        if (this.owner_userID==="")
            return;            
                
        var user_ref = this.get_ref(this.owner_userID);
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
        if (this.owner_userID==="")
            return;
            
        this.userList_addUser(this.owner_userID, owner_list, target_id);
        this.userList_addUser(target_id, target_list, this.owner_userID);
	};	
	
    Acts.prototype.RemoveUserFrom2Sides = function  (target_id, owner_list, target_list)
	{
        if (this.owner_userID==="")
            return;

        this.userList_removeUser(this.owner_userID, owner_list, target_id);
        this.userList_removeUser(target_id, target_list, this.owner_userID);
	};
		
    Acts.prototype.AddUser = function (target_id, list_name)
	{
        if (this.owner_userID==="")
            return;
            
        this.userList_addUser(this.owner_userID, list_name, target_id);
	};	
	
    Acts.prototype.RemoveUser = function (target_id, list_name)
	{
        if (this.owner_userID==="")
            return;

        this.userList_removeUser(this.owner_userID, list_name, target_id); 
	};

    Acts.prototype.InviteUser = function (target_id, owner_list, target_list, msg)
	{
        if (this.owner_userID==="")
            return;
             
        var inviter_ref = this.get_inviter_list_ref(target_id)["child"](this.owner_userID);
        var invite_info = {"inviter-id":this.owner_userID,
                           "inviter-list":owner_list,
                           "my-list": target_list,
                           "message":msg,                           
                          };
        inviter_ref["set"](invite_info);        
	};	
	
    Acts.prototype.ResponseInvitation = function (inviter_id, is_accept)
	{
        if (this.owner_userID==="")
            return;
            
        var inviter_ref = this.get_inviter_list_ref(this.owner_userID)["child"](inviter_id);
        var self = this;
        var on_read = function (snapshot)
        {
            var invite_info = snapshot["val"]();
            if (invite_info === null)
                return;
            
            if (is_accept == 1)
            {
                self.userList_addUser(self.owner_userID, invite_info["my-list"], invite_info["inviter-id"]);
                self.userList_addUser(invite_info["inviter-id"], invite_info["inviter-list"], self.owner_userID);
            }
            inviter_ref["remove"]();
        };
        inviter_ref["once"]("value", on_read);        
	};

    Acts.prototype.CancelInvitation = function (target_id)
	{
        if (this.owner_userID==="")
            return;
             
        var inviter_ref = this.get_inviter_list_ref(target_id)["child"](this.owner_userID);
        inviter_ref["remove"]();        
	};

    Acts.prototype.RemoveMembership = function (target_id, owner_list, target_list)
	{
        if (this.owner_userID==="")
            return;
            
        this.userList_removeUser(this.owner_userID, owner_list, target_id);        
        var remove_notify_ref = this.get_cancel_notify_ref(target_id)["child"](this.owner_userID);
        var cancel_info = {"cancel-id":this.owner_userID,
                           "my-list": target_list                
                          };
        remove_notify_ref["set"](cancel_info);        
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.OwnerUserID = function (ret)
	{
		ret.set_string(this.owner_userID);
	};
		
	Exps.prototype.CurUserID = function (ret)
	{
		ret.set_string(this.exp_CurUserID);
	}; 	
					 	
}());