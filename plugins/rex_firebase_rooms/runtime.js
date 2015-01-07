// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_Rooms = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var input_text = "";
	var pluginProto = cr.plugins_.Rex_Firebase_Rooms.prototype;
		
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
                    
        this.myUser_info = {"id":"",
                            "name": ""};       
        this.myRoom_info = {"name": "",
                            "isModerator": false,
                            "persisted": false,
                           };        
         
        this.onDisconnectCancel_ref = [];
        this.is_loggin = false;      
        this._temp_room_info = {};
	};
	
	instanceProto.get_ref = function(k)
	{
	    if (k == null)
	        k = "";
	        
	    var path;
	    if (k.substring(4) == "http")
	        path = k;
	    else
	        path = this.rootpath + k + "/";
	        
        return new window["Firebase"](path);
	};
	
	instanceProto.get_userRoom_ref = function()
	{
	    var ref = this.get_ref("users")["child"](this.myUser_info["id"]);
	    ref = ref["child"]("room-name");
	    return ref;
	};
	instanceProto.get_userList_ref = function(room_name)
	{
	    var ref = this.get_ref("rooms")["child"](room_name);
	    ref = ref["child"]("users");
	    return ref;
	};			
	instanceProto.get_userInfo_ref = function(room_name)
	{
	    var ref = this.get_userList_ref(room_name);
	    ref = ref["child"]("users")["child"](this.myUser_info["id"]);
	    return ref;
	};		
	instanceProto.get_moderator_ref = function(room_name)
	{
	    var ref = this.get_userList_ref(room_name);
	    ref = ref["child"]("moderatorID");
	    return ref;
	};  	   
    // Login
    instanceProto.Login = function ()
	{     
        var ref = this.get_ref("users")["child"](this.myUser_info["id"]);

        var self = this;            
        var login = function(snapshot)
        {
            if (snapshot.val() != null)
            {
                // userID had existed
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnLoginError, self);
                return;
            }
                
            ref["onDisconnect"]()["remove"]();
            
            var user_info = {
                "id": self.my_userID,
                "name":self.my_userName,
                "room-name":"",
            };               
	        var on_complete = function(error) 
            {
                if (error === null) 
                {
                    self.is_loggin = true;
                    self.runtime.trigger(cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnLoginSuccessfully, self);                
                } 
                else 
                {
                    self.runtime.trigger(cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnLoginError, self);
                }
            
            }; 
                                         
            ref["set"](user_info, on_complete);            
        };
    
        ref["once"]("value", login);        
	};  

    instanceProto.LoggingOut = function ()
	{
        var ref = this.get_ref("users")["child"](this.myUser_info["id"]);
        var self = this;
	    var on_complete = function(error) 
        {
            self.is_loggin = false;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnLoggedOut, self);
        };      
        ref["remove"](on_complete);
	};	
    // Login

    // Room        
    var CREATE_JOIN = 0;
    var CREATE_PERSISTED = 1;
    instanceProto.create_room = function (action_type, room_name, room_type, max_peers)
	{            
        var metadata_ref = this.get_ref("room-metadata")["child"](room_name);    
        var self = this;
        // allocate a room, register metadata at room-metadata/<room-name>
        var on_allocate_room = function(current_value)
        {
            if (current_value === null)
            {
                if (action_type == CREATE_JOIN)  // Close when moderator left
                {
                    // remove room-metadata/<room-name>
                    metadata_ref["onDisconnect"]()["remove"]();
                }
                // allocate a new room
                var room_metadata = {
                    "createdAt": window["Firebase"]["ServerValue"]["TIMESTAMP"],
                    "createByUserName": self.my_userName,
                    "name": room_name,
                    "type": (room_type==0)? "private":"public",
                    "status": ""
                };
                return room_metadata;
            }
            else
                return;    // Abort the transaction.
        };
        // set user list
        var on_complete = function(error, committed, snapshot) 
        {
            if (error || !committed) 
            {
                // allocate failed
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnCreateRoomError, self);                
            }
            else 
            {
                if (action_type == CREATE_JOIN)  // Close when moderator left
                {
                    // remove rooms/<room-name>
                    var room_data = self.get_ref("rooms")["child"](room_name);
                    room_data["onDisconnect"]()["remove"]();
                }
             
                var room_user = { "maxPeers": max_peers,
                                  "presisted": (action_type===CREATE_PERSISTED)
                                  //"users": {},
                                  //"moderatorID": "" 
                                };
                                
                if (action_type==CREATE_JOIN)  // join
                {
                    room_user = self._joinRoomData_get(room_user, room_name);             
                }
                
	            var on_joinComplete = function(error) 
                {                      
                    self.runtime.trigger(cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnCreateRoomSuccessfully, self);
                    
                    if (action_type==CREATE_JOIN)  // join
                        self._on_joinComplete(error);
                };
                
                // allocate new room successful at rooms/<room-name>/users
                var userList_ref = self.get_userList_ref(room_name);
                userList_ref["set"](room_user, on_joinComplete);
            }
        };  
        metadata_ref["transaction"](on_allocate_room, on_complete);
	};  

    instanceProto.join_room = function (room_name)
	{
	    // get user list at rooms/<room-name>/users
        var userList_ref = this.get_userList_ref(room_name);
        var self = this;
        var test_count = 10;        
        var on_join_room = function(current_value)
        {
            if (current_value === null)
            {
                test_count -= 1;
                var ret_val = (test_count == 0)? null:current_value;
                return ret_val;
            }
            
            var max_peers = current_value["maxPeers"];
            if (max_peers !== 0)
            {
                if ( current_value.hasChild("users") && 
                     (current_value.child("users").numChildren() >= max_peers) )
                    // full
                    return null;
            }            
            
            return self._joinRoomData_get(current_value, room_name);            
        };
        var on_joinComplete = function(error, committed, snapshot) 
        {
            var error = (error || !committed)? true:null;
            self._on_joinComplete(error);
        };
        
        userList_ref["transaction"](on_join_room, on_joinComplete);
	}; 
	
	instanceProto._joinRoomData_get = function(current_value, room_name)
	{
	    if (current_value == null)	    
	        current_value = {};	    
	    
	    if (current_value["users"] == null)	    
	        current_value["users"] = {}; 	    
	    
	    if (current_value["users"][this.myUser_info["id"]] == null)
	    {
	        var user_info = {"id":this.myUser_info["id"], "name":this.myUser_info["name"]};
	        current_value["users"][this.myUser_info["id"]] = user_info;
	        var ref = this.get_userInfo_ref(room_name);
	        ref["onDisconnect"]()["remove"]();
	        this.onDisconnectCancel_ref.push(ref);
	    }
	    else
	    {
	        // error
	        return null;
	    }
	    
	    if (current_value["moderatorID"] == null)
        {	    	    
	        current_value["moderatorID"] = this.myUser_info["id"];
	        var ref = this.get_moderator_ref(room_name);
	        ref["onDisconnect"]()["remove"]();
	        this.onDisconnectCancel_ref.push(ref);	        
	    }
	    
	    this.myRoom_info["name"] = room_name;
	    this.myRoom_info["isModerator"] = (this.myUser_info["id"] === current_value["moderatorID"]);
	    this.myRoom_info["persisted"] = current_value["persisted"];
	    
	    return current_value; 
    };
    
    instanceProto._onDisconnect_cancel = function()
    {
        var i, cnt=this.onDisconnectCancel_ref.length;
        for(i=0; i<cnt; i++)
            this.onDisconnectCancel_ref[i]["cancel"]();
            
        this.onDisconnectCancel_ref.length = 0;
    }
    
	instanceProto._update_roomName = function(room_name) 
    {
        this.myRoom_info["name"] = room_name;    
        // update room-name at users/<user-id>/room-name
        var userInfo_roomName_ref = this.get_userRoom_ref(); 
        userInfo_roomName_ref.set(room_name);
    };

	instanceProto._on_joinComplete = function(error) 
    {
        if (error === null) 
        {
            this._update_roomName(this.myRoom_info["name"]);
            this.runtime.trigger(cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnJoinRoomSuccessfully, this);                
        } 
        else 
        {
            // join faild
            this.runtime.trigger(cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnJoinRoomError, this);
        }
    };  
    
	instanceProto.leave_room = function() 
    {  
        if (this.myRoom_info["isModerator"] && (!this.myRoom_info["persisted"]))
        {
            // moderator left a non-persisted room, remove this room
            var metadata_ref = this.get_ref("room-metadata")["child"](this.myRoom_info["name"]);
            metadata_ref["remove"]();
            var room_ref = self.get_ref("rooms")["child"](this.myRoom_info["name"]);
            room_ref["remove"]();    
        }
        else
        {
            var userInfo_ref = this.get_userInfo_ref(room_name);
            userInfo_ref["remove"]();    
        }
        this._update_roomName("");
        this._onDisconnect_cancel(); 
    };        
    // Room   

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
	Cnds.prototype.OnLoginSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnLoginError = function ()
	{
	    return true;
	}; 

	Cnds.prototype.OnLoggedOut = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnCreateRoomSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnCreateRoomError = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnJoinRoomSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnJoinRoomError = function ()
	{
	    return true;
	};		 	    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Login = function (userID, name)
	{
        if (this.is_loggin)
            this.LoggingOut();
            
        this.myUser_info["id"] = userID;
        this.myUser_info["name"] = name; 
        this.Login();        
	};
    
    Acts.prototype.LoggingOut = function ()
	{
        if (!this.is_loggin)
            return;
        
        this.LoggingOut();       
	};    
    
    Acts.prototype.CreateRoom = function (action_type, room_name, room_type, max_peers)
	{
        if (!this.is_loggin)
            return;    
        this.create_room(action_type, room_name, room_type, max_peers);
	}; 
    
    Acts.prototype.JoinRoom = function (room_name)
	{
        if (!this.is_loggin)
            return;    
        this.join_room(room_name);
	};   
     
    Acts.prototype.LeaveRoom = function ()
	{
        if ((!this.is_loggin) || (this.current_roomName==""))
            return; 	
            
        this.leave_room();    
	};          
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
				 	
}());