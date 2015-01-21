/*

room-metadata/
    <room-ID>        
        createdByUserID - The id of the user that created the room.
        type-state - The type of room, public or private. And the status of room, close or open.

        # display
        name - The display name of the room.
        createdByUserName - The name of the user that created the room.
        
        extra\
            
            
rooms/
    <room-ID>        
        metadata/
            state- close or open, or null if room is removed.
            maxPeers - The maximum number of peers that can join this room.
            name - The display name of the room.
            type - The type of room, public or private.
            createdByUserID - The id of the user that created the room.
            createdByUserName - The name of the user that created the room.
            
            # join permission
            permission - "anyone", "black-list", "white-list".
            black-list/
                <ID> - true
            white-list/
                <ID> - true
                
        users/
            <joinAt>
                ID - The id of the user.    
                # monitor ID == null for "user kicked-out"              
                name - The name of the user.           
        
        simple-message/
            message - current message
            senderID - sender ID of current mesage
            senderName - sender name of current message
            stamp - true or false, toggle after each message sent
            
        <"channel-"+channel_name> - custom channel        


user-metadata\
    <user-ID>
        name - The display name of the user.
        roomName - The display name of current joined room.
        roomID - The id of current joined room.
        
        
*/
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

    var ROOMOPEN = "open";
    var ROOMCLOSED = "closed";
    
	instanceProto.onCreate = function()
	{ 
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/"; 
	    this.messageType = this.properties[2];
	    this.triggeredRoomName = "";
	    this.triggeredRoomID = "";  
	    this.triggeredUserName = "";
	    this.triggeredUserID = "";          
	      
	    // room
        this.room = new cr.plugins_.Rex_Firebase_Rooms.RoomMgrKlass(this);	      
        // room list
        this.room_list = new cr.plugins_.Rex_Firebase_Rooms.RoomsListKlass(this);
        
        //window["Firebase"]["enableLogging"](true);
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
	
	instanceProto.get_roommetadata_ref = function(roomID)
	{
	    var ref = this.get_ref("room-metadata");
	    if (roomID != null)
	        ref = ref["child"](roomID);
	    return ref;
	};
	 	
	instanceProto.get_room_ref = function(roomID)
	{
	    return this.get_ref("rooms")["child"](roomID);
	};	  
	
	instanceProto.get_usersList_ref = function(roomID)
	{
	    return this.get_room_ref(roomID)["child"]("users");
	};

	instanceProto.get_message_ref = function(roomID)
	{
	    return this.get_room_ref(roomID)["child"]("simple-message");
	};    
	
	instanceProto.get_usermetadata_ref = function(userID)
	{
	    return this.get_ref("user-metadata")["child"](userID);
	};   
	instanceProto.get_room_typeState = function(state, type_)
	{
	    return state+"-"+type_;
	};  
    instanceProto.run_room_trigger = function(trig, roomName, roomID)
	{
	    this.triggeredRoomName = roomName;
	    this.triggeredRoomID = roomID;  
		this.runtime.trigger(trig, this);
	    this.triggeredRoomName = "";
	    this.triggeredRoomID = "";     
	};
    instanceProto.run_userlist_trigger = function(trig, userName, userID)
	{
	    this.triggeredUserName = userName;
	    this.triggeredUserID = userID;  
		this.runtime.trigger(trig, this);
	    this.triggeredUserName = "";
	    this.triggeredUserID = "";     
	};    
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnCreateRoom = function ()
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

	Cnds.prototype.OnLeftRoom = function ()
	{
	    return true;
	};	

	Cnds.prototype.OnKicked = function ()
	{
	    return true;
	};
	
	Cnds.prototype.IsInRoom = function ()
	{
	    return this.room.IsInRoom();
	};	
	Cnds.prototype.OnUpdateRoomsList = function ()
	{
	    return true;
	}; 	 
	
	Cnds.prototype.ForEachRoom = function (start, end)
	{	     
		return this.room_list.ForEachRoom(start, end);
	};  
	
	Cnds.prototype.OnUpdateUsersList = function ()
	{
	    return true;
	};	
	
	Cnds.prototype.ForEachUser = function (start, end)
	{	     
		return this.room.users_list.ForEachUser(start, end);
	};  	
	
	Cnds.prototype.OnUserJoin = function ()
	{
	    return true;
	};			 	
	
	Cnds.prototype.OnUserLeft = function ()
	{
	    return true;
	};		
	
	Cnds.prototype.OnReceivedMessage = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnReceivedPermissionLists = function ()
	{
	    return true;
	};	
	
	Cnds.prototype.IsLocked = function ()
	{
	    return this.room.is_locked;
	};	
	
		    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetUserInfo = function (userID, name)
	{
        if (userID == "")
        {
            console.error("rex_firebase_rooms: UserID should not be empty string.");
            return;
        }
        this.room.SetUser(userID, name);
	};

    Acts.prototype.CreateRoom = function (roomName, roomType, maxPeers, lifePeriod, doorState, joinPermission, roomID)
	{
	    // push a new room if roomID == ""
        this.room.TryCreateRoom(roomName, roomType, maxPeers, lifePeriod, doorState, joinPermission, roomID);
	}; 
	
    var DOORSTATES = [ROOMCLOSED, ROOMOPEN];
    Acts.prototype.SetDoorState = function (doorState_, permission)
	{
        this.room.SwitchDoor(DOORSTATES[doorState_], permission);
	};      
	
    Acts.prototype.JoinRoom = function (roomID, roomName)
	{
        if (roomID == "")
        {
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnJoinRoomError;
            self.plugin.run_userlist_trigger(trig, roomName, roomID);    
            return;
        }
        
        this.room.TryJoinRoom(roomID, roomName);
	};   
     
    Acts.prototype.LeaveRoom = function ()
	{
        this.room.LeaveRoom();
	};   
     
    Acts.prototype.RemoveRoom = function (roomID, permission)
	{    
        if (roomID == "")
            return;
            
        this.room.RemoveRoom(roomID, permission);
	};  	
	     
    Acts.prototype.CreateOrJoinRoom = function (roomName, roomType, maxPeers, lifePeriod, doorState, joinPermission, roomID)
	{
	    var self = this;
        // create room failed, try join it
        var on_complete = function (error)
        {
            if (!error)                       
                return;
            
            if (roomID == "")
                return;
                
            self.room.TryJoinRoom(roomID, roomName);
        };
        this.room.TryCreateRoom(roomName, roomType, maxPeers, lifePeriod, doorState, joinPermission, roomID,
                                on_complete);
	};
		
    Acts.prototype.UpdateOpenRoomsList = function (room_type)
	{
        this.room_list.UpdateOpenRoomsList(room_type);
	};
	
    Acts.prototype.StopUpdatingOpenRoomsList = function ()
	{
        this.room_list.StopUpdatingOpenRoomsList();
	};	
    
    Acts.prototype.BroadcastMessage = function (message)
	{
        this.room.BroadcastMessage(message);
	};   
	
    Acts.prototype.AddUserToWhiteList = function (userID, name)
	{
        if (userID == "")
            return;
        this.room.SetPermissionList("white-list", userID, name);
	};		
    Acts.prototype.RemoveUserFromWhiteList = function (userID)
	{
        if (userID == "")
            return;    
        this.room.SetPermissionList("white-list", userID, null);
	};

    Acts.prototype.AddUserToBlackList = function (userID, name)
	{
        if (userID == "")
            return;    
        this.room.SetPermissionList("black-list", userID, name);
	};		
    Acts.prototype.RemoveUserFromBlackList = function (userID)
	{
        if (userID == "")
            return;    
        this.room.SetPermissionList("black-list", userID, null);
	};

    Acts.prototype.RequestPermissionLists = function ()
	{
        this.room.RequestPermissionLists();
	};
	
    Acts.prototype.RequestUserMetadata = function (userID)
	{
        
	};   	    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.UserName = function (ret)
	{
		ret.set_string(this.room.userName);
	}; 
    
	Exps.prototype.UserID = function (ret)
	{
		ret.set_string(this.room.userID);
	}; 
	
	Exps.prototype.RoomName = function (ret)
	{
		ret.set_string(this.room.roomName);
	}; 
    
	Exps.prototype.RoomID = function (ret)
	{
		ret.set_string(this.room.roomID);
	};    
	
	Exps.prototype.TriggeredRoomName = function (ret)
	{
		ret.set_string(this.triggeredRoomName);
	}; 
    
	Exps.prototype.TriggeredRoomID = function (ret)
	{
		ret.set_string(this.triggeredRoomID);
	};               
    
	Exps.prototype.CurRoomName = function (ret)
	{
	    if (this.room_list.exp_CurRoom == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.room_list.exp_CurRoom["name"]);
	}; 
    
	Exps.prototype.CurRoomID = function (ret)
	{
	    if (this.room_list.exp_CurRoom == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.room_list.exp_CurRoom["roomID"]);
	}; 
    
	Exps.prototype.CurCreaterName = function (ret)
	{
	    if (this.room_list.exp_CurRoom == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.room_list.exp_CurRoom["createdByUserName"]);
	}; 
    
	Exps.prototype.CurCreaterID = function (ret)
	{
	    if (this.room_list.exp_CurRoom == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.room_list.exp_CurRoom["createdByUserID"]);
	};  
    
	Exps.prototype.CurUserName = function (ret)
	{
	    if (this.room.users_list.exp_CurUser == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.room.users_list.exp_CurUser["name"]);
	};
		
	Exps.prototype.CurUserID = function (ret)
	{
	    if (this.room.users_list.exp_CurUser == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.room.users_list.exp_CurUser["ID"]);
	};
	
	Exps.prototype.TriggeredUserName = function (ret)
	{
		ret.set_string(this.triggeredUserName);
	};
		
	Exps.prototype.TriggeredUserID = function (ret)
	{
		ret.set_string(this.triggeredUserID);
	}; 	 

	Exps.prototype.LastLeftUserName = function (ret)
	{
	    if (this.room.users_list.exp_LastLeftUser == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.room.users_list.exp_LastLeftUser["name"]);
	};
		
	Exps.prototype.LastLeftUserID = function (ret)
	{
	    if (this.room.users_list.exp_LastLeftUser == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.room.users_list.exp_LastLeftUser["ID"]);
	}; 

	Exps.prototype.LastSenderID = function (ret)
	{
	    if (this.room.simple_message.exp_LastMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.room.simple_message.exp_LastMessage["senderID"]);
	};  

	Exps.prototype.LastSenderName = function (ret)
	{
	    if (this.room.simple_message.exp_LastMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.room.simple_message.exp_LastMessage["senderName"]);
	}; 

	Exps.prototype.LastMessage = function (ret)
	{
	    if (this.room.simple_message.exp_LastMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.room.simple_message.exp_LastMessage["message"]);
	}; 

	Exps.prototype.WhiteListToJSON = function (ret)
	{	    
		ret.set_string(JSON.stringify(this.room.white_list));
	};   

	Exps.prototype.BlackListToJSON = function (ret)
	{
	    ret.set_string(JSON.stringify(this.room.black_list));
	};	

	Exps.prototype.ChannelRef = function (ret, name, roomID)
	{
        if (roomID == null)
            roomID = this.room.roomID;
        var channel_name = "channel-"+name;
        var ref = this.get_ref("rooms")["child"](roomID)["child"](channel_name);
	    ret.set_string(ref["toString"]());
	};	  
}());

(function ()
{
    var LIFE_TEMPORARY = 0;
    var LIFE_PERSISTED = 1;
    var ROOMOPEN = "open";
    var ROOMCLOSED = "closed";
    var JOINPERMINNSION = ["anyone", "black-list", "white-list"];

    var RoomMgrKlass = function (plugin)
    {
        this.plugin = plugin;        
	    this.remove_onLeft = false;	    
        this.is_locked = false;        
        
        this.userID = "";
        this.userName = "";        
        // key of room ref
        this.roomID = "";        
        this.roomName = "";
        this.roomType = "";
        this.maxPeers = 0;       
        this.is_creater = false;
        // key of user ref
        this.joinAt = "";  
        
        // monitor ref
        this.monitor_ref = []; 
             
        // users list             
        this.users_list = this.create_usersList();
        this.users_list_is_full = false;

        // simple message
        this.simple_message = this.create_simpleMessage();
        
        // user metadata
        this.user_metadata = new cr.plugins_.Rex_Firebase_Rooms.UserMetadataKlass(this);
        this.white_list = {};
        this.black_list = {};
    };
    
    var RoomMgrKlassProto = RoomMgrKlass.prototype;
	
    RoomMgrKlassProto.create_usersList = function ()
	{
        var self = this;
        var on_users_count_changed = function (users)
        {
            self.on_users_count_changed(users);
        }
        var users_list = new cr.plugins_.Rex_Firebase_Rooms.UsersListKlass(this);
        users_list.onUsersCountChanged = on_users_count_changed;
        return users_list;    
    };
    
    RoomMgrKlassProto.create_simpleMessage = function ()
	{
	    var simple_message = new window.FirebaseSimpleMessageKlass(this.plugin.messageType);
	    simple_message.exp_LastMessage = null;
	    	    
	    var self = this;
	    var on_received = function(d)
	    {
	        simple_message.exp_LastMessage = d;
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnReceivedMessage;
            self.plugin.runtime.trigger(trig, self.plugin); 
	    };	    
	    
	    simple_message.onReceived = on_received;
        return simple_message;   
    };
        
    // export
    RoomMgrKlassProto.SetUser = function (userID, name)
    {
        this.userID = userID;
        this.userName = name; 
        
        this.user_metadata.Init();          
    };
    
	RoomMgrKlassProto.IsInRoom = function()
	{
	    return (this.roomID != "");
	};  
	  
    RoomMgrKlassProto.TryCreateRoom = function (roomName, roomType, maxPeers, lifePeriod, doorState, joinPermission, roomID,
                                                on_complete)
	{
        if (this.IsInRoom())
            return;    
            
        // start of create room, lock
        if (this.is_locked)
            return;
        this.is_locked = true;            
        
        var self = this;
        var on_create_room_complete = function()
        {     
            self.is_locked = false;
            // end of create room
            
            self.roomID = roomID;
            self.roomName = roomName;
            self.roomType = roomType;  
            self.maxPeers = maxPeers; 
            
            
            if (maxPeers == 1)
            {
                self.users_list_is_full = true;
            }
            
            // set room to open if configured
            if (doorState == 1)
            {
                self.SwitchDoor(ROOMOPEN, 0);          
            }
            
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnCreateRoom;     
            self.plugin.run_room_trigger(trig, roomName, roomID); 
	        // create successful
			self.on_join_room(roomID, roomName, roomType, maxPeers);	
			
			if (on_complete)
			    on_complete();        	        
        };
        
        var on_create_room_error = function()
        {            
            // create failed            
            self.is_locked = false;
            // end of create room, unlock   

            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnCreateRoomError;     
            self.plugin.run_room_trigger(trig, roomName, roomID); 
            
			if (on_complete)
			    on_complete(true);                         
        };        
        
                                    
        if (roomID == "")
        {
            roomID = this.plugin.get_roommetadata_ref()["push"]()["key"]();
            this.create_room(roomName, roomType, maxPeers, lifePeriod, doorState, roomID, joinPermission,
                             on_create_room_complete);
        }
        else
        {
            var self=this;
            var on_write_userID = function(current_value)
            {
                if (current_value === null)  //this userID has not been occupied
                    return self.userID;
                else
                    return;    // Abort the transaction
            };
            var on_write_userID_complete = function(error, committed, snapshot) 
            {
                if (error || !committed) 
                {            
                    // create failed
                    on_create_room_error();		            
                }
                else 
                {
                    self.create_room(roomName, roomType, maxPeers, lifePeriod, doorState, roomID, joinPermission,
                                     on_create_room_complete);         
                }            
            };                            
            // try create room
            var ref = this.plugin.get_roommetadata_ref(roomID)["child"]("createdByUserID");
            ref["transaction"](on_write_userID, on_write_userID_complete);            
        }
	}; 	 
	 
    RoomMgrKlassProto.SwitchDoor = function (doorState, permission)
	{
        if (!this.IsInRoom())
            return; 
            	    
	    if (permission == 1)     // creater
	    {
            if (!this.is_creater)
                return;
        }

        if (doorState == ROOMOPEN)
        {
            // can not open full room
            if (this.users_list_is_full)
                return;
        }
        this.door_switch(ROOMOPEN);
	};	
	  
    RoomMgrKlassProto.TryJoinRoom = function (roomID, roomName, on_complete)
	{
        if (this.IsInRoom())
            return;  

        // start of join room, lock
        if (this.is_locked)
            return;
        this.is_locked = true;
            
        var self = this;
        var room_ref = this.plugin.get_room_ref(roomID);
        var metadata;  // metadata of this room
        
        
        var on_join_complete = function()
        {     
            self.is_locked = false;            
            
            // end of join room, unlock
		    self.on_join_room(roomID, metadata["name"], metadata["type"], metadata["maxPeers"]);  
            
			if (on_complete)
			    on_complete();  		    		              
        };
        var on_join_errror = function()
        {
            self.is_locked = false;            
            // end of join room, unlock            
            
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnJoinRoomError;     
            self.plugin.run_room_trigger(trig, roomName, roomID);   
            
			if (on_complete)
			    on_complete(true);                        
        };
        
        // step 2: join, then check user count
        var try_join = function (maxPeers)
        {
            var is_in_list = false;
            var read_user = function(childSnapshot)
            {
	            var userID = childSnapshot["val"]()["ID"];
	            is_in_list = (userID == self.userID);
	            if (is_in_list)
	                return true;
            };             
            var on_read_users = function (snapshot)
            {
                snapshot["forEach"](read_user); 
                if (is_in_list)
                {
                    on_join_complete();
                }   
                else
                {
                    self.remove_user_info(roomID);
                    on_join_errror();
                    return;
                }
            }
            var check_list = function()
            {
                // read user list to check if current user is existed
                var users_ref = room_ref["child"]("users")["limitToFirst"](maxPeers)["once"]("value", on_read_users);
            };
            self.push_user_info(room_ref, check_list);
        };
        // step 2: join, then check user count
          
        // step 1: check metadata
        var check_metadata = function ()
        {
	        var on_read_metadata = function (snapshot)
	        {     
	            metadata = snapshot["val"]();
	            // no room or room is not open, i.e. closed
	            if ((metadata == null) || (metadata["state"] != ROOMOPEN))            
                {
                    on_join_errror();  
                    return;
                }
                else
                {
                    if (metadata["permission"] == "black-list")
                    {
                        var black_list = metadata["black-list"];
                        if (black_list && (black_list.hasOwnProperty(self.userID)))
                        {
                            on_join_errror();      
                            return;
                        }
                            
                    }
                    else if (metadata["permission"] == "white-list")
                    {
                        var white_list = metadata["white-list"];
                        if (!white_list)
                        {
                            on_join_errror();      
                            return;
                        }                       
                        else if (!white_list.hasOwnProperty(self.userID))
                        {
                            on_join_errror();      
                            return;
                        }      
                    }
                    // else if (metadata["permission"] == "anyone")
                    
                    var maxPeers = metadata["maxPeers"];
                    if (maxPeers == 0)
                    {
                        // join room
                        self.push_user_info(room_ref, on_join_complete);
                    }
                    else
                    {
                        try_join(maxPeers);
                    }
                }
	        };	                
            room_ref["child"]("metadata")["once"]("value", on_read_metadata);
        };
        // step 1: check metadata
        
        check_metadata();
	}; 
	
    RoomMgrKlassProto.LeaveRoom = function ()
	{
        if (!this.IsInRoom())
            return; 	            
               
        this.monitor_off();
        this.remove_user_info(this.roomID);
        if (this.remove_onLeft)
        {
            // remove room
            this.remove_room();
            this.remove_onLeft = false;
        }

        this.is_creater = false;
        
        this.on_leave_room();
	};	
    
    RoomMgrKlassProto.BroadcastMessage = function (message)
    {
        if (!this.IsInRoom())
            return; 	
                    
        this.simple_message.Send(message, this.userID, this.userName);
    };	
    
    RoomMgrKlassProto.SetPermissionList = function (listName, userID, value_)
    {
        if (!this.IsInRoom())
            return; 	
        var room_ref = this.plugin.get_room_ref(this.roomID);
        var permission_lists_ref = room_ref["child"]("metadata")["child"](listName);
        permission_lists_ref["child"](userID)["set"](value_);
    };
    
    RoomMgrKlassProto.RequestPermissionLists = function ()
    {
        if (!this.IsInRoom())
            return; 	
        var metadata_ref = this.plugin.get_room_ref(this.roomID)["child"]("metadata");
        var whitelist_ref = metadata_ref["child"]("white-list");
        var blacklist_ref = metadata_ref["child"]("black-list");
        
        var self=this;        
	    // wait done
        var wait_events = 0;    
	    var isDone_handler = function()
	    {
	        wait_events -= 1;
	        if (wait_events == 0)
	        {	            
	            // all jobs done  
                var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnReceivedPermissionLists;     
		        self.plugin.runtime.trigger(trig, self.plugin);    	            
	        }
	    };
	    // wait done 
	    
	    var on_read_white_list = function (snapshot)
	    {
	        var list_ = snapshot["val"]();
	        if (list_ != null)
	            self.white_list = list_;
	        else
	            clean_table(self.white_list);
	            
	        isDone_handler();
	    };
	    var on_read_black_list = function (snapshot)
	    {
	        var list_ = snapshot["val"]();
	        if (list_ != null)
	            self.black_list = list_;
	        else
	            clean_table(self.black_list);
	            
	        isDone_handler();
	    };	    
	       
	    wait_events += 1;
	    whitelist_ref["once"]("value", on_read_white_list);
	    wait_events += 1;
	    blacklist_ref["once"]("value", on_read_black_list);	    
    };    
    // export
  
	RoomMgrKlassProto.push_user_info = function(room_ref, on_complete)
	{
        var user_ref = room_ref["child"]("users")["push"]();
        this.joinAt = user_ref["key"]();        
        user_ref["onDisconnect"]()["remove"]();
        var user_info = {
            "ID":this.userID,
            "name":this.userName
        };
        user_ref["set"](user_info, on_complete);
	};		
	
	// normal case
    RoomMgrKlassProto.remove_user_info = function (roomID, on_complete)
	{
	    if (roomID == null)
	        roomID = this.roomID;
	        
        var user_ref = this.plugin.get_room_ref(roomID)["child"]("users")["child"](this.joinAt);          
        user_ref["remove"](on_complete);
        user_ref["onDisconnect"]()["cancel"]();         
	};	
		 
    // left by kicked
	RoomMgrKlassProto.monitor_user_kicked = function ()
	{
	    var user_ref = this.plugin.get_room_ref(this.roomID)["child"]("users")["child"](this.joinAt); 
	    var id_ref = user_ref["child"]("ID");
	    var self = this;
	    var on_value_changed = function (snapshot)
	    {     
	        var ID = snapshot["val"]();
	        if (ID != null)
	            return;
           
            // user was not in the room, close all monitors
            self.monitor_off();	            
            // roomID had been cleaned (on_leave_room), does not need to run triggers again
            if (!self.IsInRoom())
                return; 
        
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnKicked;     
		    self.plugin.runtime.trigger(trig, self.plugin);	
            self.on_leave_room();	     		            
	    };
	    this.monitor_ref.push(id_ref["toString"]());
	    id_ref["on"]("value", on_value_changed);
	};
	
	RoomMgrKlassProto.monitor_off = function ()
	{
	    var i, cnt=this.monitor_ref.length;
	    for (i=0; i<cnt; i++)
	    {
	        this.plugin.get_ref(this.monitor_ref[i])["off"]();
	    }
	};	

    RoomMgrKlassProto.create_room = function (roomName, roomType, maxPeers, lifePeriod, doorState, roomID, joinPermission,
                                              on_complete)
	{  
	                            
        // step 2. fire join completed signal
        var self=this;        
	    // wait done
        var wait_events = 0;    
	    var isDone_handler = function()
	    {
	        wait_events -= 1;
	        if (wait_events == 0)
	        {	            
	            // all jobs done  
                if (on_complete)
                    on_complete();
	        }
	    };
	    // wait done            
        
        // generate a roomID     
        var metadata_ref = this.plugin.get_roommetadata_ref(roomID);        
        var room_ref = this.plugin.get_room_ref(roomID);
        // LIFE_TEMPORARY, remove room when creater is out
        if (lifePeriod == LIFE_TEMPORARY)
        {
            this.remove_onLeft = true;
            metadata_ref["onDisconnect"]()["remove"]();
            room_ref["onDisconnect"]()["remove"]();
        }
        
                
        // set room-metadata
        var metadata = {
            "createdByUserID": this.userID,
            "type-state": this.plugin.get_room_typeState(ROOMCLOSED, roomType),
            "name": roomName,
            "createdByUserName": this.userName,
            };
        wait_events += 1;
        metadata_ref["set"](metadata, isDone_handler);
                        
        // set room data      
        var roomdata = {            
            "metadata": {
                "state":ROOMCLOSED,
                "maxPeers": maxPeers,
                "name": roomName,
                "type": roomType,
                "createdByUserID": this.userID,
                "createdByUserName": this.userName,
                "permission": JOINPERMINNSION[joinPermission],                
                },
            };    
        if (joinPermission == 2) // "white-list"
        {
            // add creater to white-list
            roomdata["white-list"] = {};
            roomdata["white-list"][this.userID] = this.userName;
        }
        wait_events += 1;     
        room_ref["set"](roomdata, isDone_handler);
        wait_events += 1; 
        this.push_user_info(room_ref, isDone_handler);
        this.is_creater = true;
        // step 1. set info, then wait done
	}; 
	
    RoomMgrKlassProto.remove_room = function (roomID)
	{
	    if (roomID == null)
	        roomID = this.roomID;
	        
        var metadata_ref = this.plugin.get_roommetadata_ref(roomID);
        metadata_ref["remove"]();
        metadata_ref["onDisconnect"]()["cancel"]();
        var room_ref = this.plugin.get_room_ref(roomID);
        room_ref["remove"]();
        room_ref["onDisconnect"]()["cancel"]();
	};	    
	
	RoomMgrKlassProto.on_join_room = function (roomID, roomName, roomType, maxPeers)
	{  
        this.roomID = roomID;
        this.roomName = roomName;
        this.roomType = roomType;  
        this.maxPeers = maxPeers;
        	    	    
	    this.monitor_user_kicked();
	    
	    this.users_list.StartUpdate(roomID, maxPeers);
        this.users_list_is_full = false;
        this.simple_message.SetRef(this.plugin.get_message_ref(roomID));
        this.simple_message.StartUpdate();
        
        this.user_metadata.Update();  
        
        var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnJoinRoomSuccessfully;     
        this.plugin.run_room_trigger(trig, roomName, roomID);  
	};
	
    RoomMgrKlassProto.on_leave_room = function ()
	{
        var roomID = this.roomID;
        var roomName = this.roomName;
        this.roomID = "";
        this.roomName = "";	
        
        this.close_users_list();	
        this.simple_message.StopUpdate();
        this.simple_message.SetRef(null);
        // roomID had been cleaned
        
        // clean permission lists
        clean_table(this.white_list);
        clean_table(this.black_list);
        
        // clean user metadata
        this.user_metadata.Update();        
        
        var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnLeftRoom;     
        this.plugin.run_room_trigger(trig, roomName, roomID);          
	};
	
    RoomMgrKlassProto.door_switch = function (door_state, on_complete)
	{
        var self=this;        
	    // wait done
        var wait_events = 0;    
	    var isDone_handler = function()
	    {
	        wait_events -= 1;
	        if (wait_events == 0)
	        {	            
	            // all jobs done         
	            if (on_complete)
	                on_complete();
	        }
	    };
	    // wait done  
        
        var metadata_ref = this.plugin.get_roommetadata_ref(this.roomID); 
        wait_events += 1;       
        var type_state = this.plugin.get_room_typeState(door_state, this.roomType);
        metadata_ref["child"]("type-state")["set"](type_state, isDone_handler);
        var room_ref = this.plugin.get_room_ref(this.roomID);
        wait_events += 1;
        room_ref["child"]("metadata")["child"]("state")["set"](door_state, isDone_handler);
	};	
	
	
	RoomMgrKlassProto.close_users_list = function (users)
	{
	    this.users_list.StopUpdate();    
	    this.users_list.Clean();	
	};
    
	RoomMgrKlassProto.on_users_count_changed = function (users)
	{
	    var users_count = users.length;
	    if (users_count == 0)
	        return;
	        
	    if (users[0]["ID"] != this.userID)
	        return;
	        
	    if ((users_count < this.maxPeers) && this.users_list_is_full)
	    {
            this.door_switch(ROOMOPEN);
	    }
	    else if ((users_count == this.maxPeers) && !this.users_list_is_full)
	    {
	        this.door_switch(ROOMCLOSED);       
	    }
	    this.users_list_is_full = (users_count == this.maxPeers);
	};    
	
	cr.plugins_.Rex_Firebase_Rooms.RoomMgrKlass = RoomMgrKlass;
	
		  
	var clean_table = function (o)
	{
	    var k;
	    for (k in o)
	        delete o[k];
	};	
}());


(function ()
{
    var ROOMOPEN = "open";
    var ROOMCLOSED = "closed";
        
    var RoomsListKlass = function (plugin)
    {
        this.plugin = plugin;
        this.rooms_list = new window.FirebaseItemListKlass();        
        this.exp_CurRoom = null;
        
        this.rooms_list.keyItemID = "roomID";
    };
    
    var RoomsListKlassProto = RoomsListKlass.prototype;

    RoomsListKlassProto.UpdateOpenRoomsList = function (room_type)
	{
	    var self = this;
        var on_roomList_update = function ()
        {
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnUpdateRoomsList;
            self.plugin.runtime.trigger(trig, self.plugin); 
        };
	    
	    var metadata_ref = this.plugin.get_roommetadata_ref();
	    var query = metadata_ref["orderByChild"]("type-state");
	    if (room_type != "")
	        query = query["equalTo"](this.plugin.get_room_typeState(ROOMOPEN, room_type));
	    else
	        query = query["startAt"](ROOMOPEN)["endAt"](ROOMOPEN+"~");

        this.snapshot2Item = null;
        this.rooms_list.onItemAdd = on_roomList_update;
        this.rooms_list.onItemRemove = on_roomList_update;
        this.rooms_list.onItemChange = on_roomList_update;	        
	    this.rooms_list.StartUpdate(query);
	};
	
	RoomsListKlassProto.StopUpdatingOpenRoomsList = function()
	{
	    this.rooms_list.StopUpdate();
	};

	RoomsListKlassProto.ForEachRoom = function (start, end)
	{	     
	    var self = this;
	    var onGetIterItem = function(item)
	    {
	        self.exp_CurRoom = item;
	    };
	    this.rooms_list.onGetIterItem = onGetIterItem;
	    this.rooms_list.ForEachItem(this.plugin.runtime, start, end);
        this.exp_CurRoom = null;       		
		return false;
	};    
	
	cr.plugins_.Rex_Firebase_Rooms.RoomsListKlass = RoomsListKlass;
}());

(function ()
{
    var UsersListKlass = function (room)
    {
        // overwrite these values
        this.onUsersCountChanged = null;
        // overwrite these values 
          
        this.plugin = room.plugin;
        this.users_list = new window.FirebaseItemListKlass();        
        this.exp_CurUser = null;
        this.roomID = "";
        
        this.users_list.keyItemID = "joinAt";
    };
    
    var UsersListKlassProto = UsersListKlass.prototype;

    UsersListKlassProto.StartUpdate = function (roomID, limit)
	{
        this.StopUpdate();
        
        this.roomID = roomID;
	    var self = this;	    
        var on_usersList_update = function ()
        {
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnUpdateUsersList;
            self.plugin.runtime.trigger(trig, self.plugin);             
        };
	    var on_user_join = function (item)
	    {
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnUserJoin;
            self.plugin.run_userlist_trigger(trig, item["name"], item["ID"]);	        
            on_usersList_update();
            if (self.onUsersCountChanged)
                self.onUsersCountChanged(self.users_list.GetItems());
	    };        
	    var on_user_left = function (item)
	    {
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnUserLeft;
            self.plugin.run_userlist_trigger(trig, item["name"], item["ID"]);
            on_usersList_update();
            if (self.onUsersCountChanged)
                self.onUsersCountChanged(self.users_list.GetItems());
	    };     
	    	    
	    var query = this.plugin.get_usersList_ref(this.roomID);
	    if (limit != 0)
	        query = query["limitToFirst"](limit);

        this.snapshot2Item = null;
        this.users_list.onItemAdd = on_user_join;
        this.users_list.onItemRemove = on_user_left;
        this.users_list.onItemChange = on_usersList_update;	        
	    this.users_list.StartUpdate(query);	    
	};
	
	UsersListKlassProto.StopUpdate = function()
	{
	    this.users_list.StopUpdate();
        this.roomID = "";        
	};

	UsersListKlassProto.ForEachUser = function (start, end)
	{	     
	    var self = this;
	    var onGetIterItem = function(item)
	    {
	        self.exp_CurUser = item;
	    };
	    this.users_list.onGetIterItem = onGetIterItem;
	    this.users_list.ForEachItem(this.plugin.runtime, start, end);
        this.exp_CurUser = null;       		
		return false;
	};	   

	UsersListKlassProto.Clean = function ()
	{	     
	    this.users_list.Clean();
	};	
	
	cr.plugins_.Rex_Firebase_Rooms.UsersListKlass = UsersListKlass;
}());

(function ()
{
    var UserMetadataKlass = function (room)
    {
        this.room = room;
        this.plugin = room.plugin;
        this.ref = null;        
    };
    
    var UserMetadataKlassProto = UserMetadataKlass.prototype;

    UserMetadataKlassProto.Init = function ()
    {       
        if (this.ref)
            this.ref["onDisconnect"]()["cancel"]();
            
        this.ref = this.plugin.get_usermetadata_ref(this.room.userID);
        this.ref["onDisconnect"]()["remove"]();
        this.Update();
    };    

    UserMetadataKlassProto.Update = function ()
    {       
	    var metadata = {
	        "name": this.room.userName,
	        "roomID": this.room.roomID,
	        "roomName": this.room.roomName,	        
	    };
	    this.ref["set"](metadata);               
    };   
    
	cr.plugins_.Rex_Firebase_Rooms.UserMetadataKlass = UserMetadataKlass;
}());


(function ()
{
    if (window.FirebaseItemListKlass != null)
        return;    
    
    var ItemListKlass = function ()
    {
        // export: overwrite these values
        this.isAutoUpdate = true;
        this.keyItemID = "__itemID__";
        this.snapshot2Item = null;
        this.onItemAdd = null;
        this.onItemRemove = null;
        this.onItemChange = null;
        this.onItemsFetch = null;   // manual update, to get all items
        this.onGetIterItem = null;  // used in ForEachItem
        // export: overwrite these values
        
        this.query = null;
        this.items = [];
        this.itemID2Index = {}; 
        
        
        // saved callbacks
        this.add_child_handler = null;
        this.remove_child_handler = null;
        this.change_child_handler = null;
    };
    
    var ItemListKlassProto = ItemListKlass.prototype;    
    
    // export
    ItemListKlassProto.GetItems = function ()
    {
        return this.items;
    };
    
    ItemListKlassProto.GetItemIndexByID = function (itemID)
    {
        return this.itemID2Index[itemID];
    };     
    
    ItemListKlassProto.GetItemByID = function (itemID)
    {
        var i = this.GetItemIndexByID(itemID);
        if (i == null)
            return null;
            
        return this.items[i];
    };  
    
    ItemListKlassProto.Clean = function ()
    {
        this.items.length = 0;
        clean_table(this.itemID2Index); 
    };        
    
    ItemListKlassProto.StartUpdate = function (query)
    {
        this.StopUpdate();            
        this.Clean();        
        var self = this;        
        if (this.isAutoUpdate)
        {
	        var add_child_handler = function (newSnapshot, prevName)
	        {
	            var item = self.add_item(newSnapshot, prevName);
	            self.update_itemID2Index();
	            if (self.onItemAdd)
	                self.onItemAdd(item);
	        };
	        var remove_child_handler = function (snapshot)
	        {
	            var item = self.remove_item(snapshot);
	            self.update_itemID2Index();
	            if (self.onItemRemove)
	                self.onItemRemove(item);
	        };      	        
	        var change_child_handler = function (snapshot, prevName)
	        {
	            var item = self.remove_item(snapshot);
	            self.update_itemID2Index();
	            self.add_item(snapshot, prevName);
	            self.update_itemID2Index();
	            if (self.onItemChange)
	                self.onItemChange(item); 
	        };
	        
	        query["on"]("child_added", add_child_handler);
	        query["on"]("child_removed", remove_child_handler);
	        query["on"]("child_moved", change_child_handler);
	        query["on"]("child_changed", change_child_handler);  
	        
	        this.query = query;
            this.add_child_handler = add_child_handler;
            this.remove_child_handler = remove_child_handler;
            this.change_child_handler = change_child_handler;	        
        }
        else
        {
            var read_item = function(childSnapshot)
            {
	            self.add_item(childSnapshot, null, true);
            };            
            var handler = function (snapshot)
            {           
                snapshot["forEach"](read_item);                
                self.update_itemID2Index();   
                if (self.onItemsFetch)
                    self.onItemsFetch(self.items)
            };
        
			query["once"]("value", handler);
        }        
    };
    
    ItemListKlassProto.StopUpdate = function ()
	{
        if (this.query)
        {
            this.query["off"]("child_added", this.add_child_handler);
	        this.query["off"]("child_added", this.add_child_handler);
	        this.query["off"]("child_removed", this.remove_child_handler);
	        this.query["off"]("child_moved", this.change_child_handler);
	        this.query["off"]("child_changed", this.change_child_handler);
            this.add_child_handler = null;
            this.remove_child_handler = null;
            this.change_child_handler = null;	
            //this.query["off"]();
        }
        this.query = null;
	};	
	
	ItemListKlassProto.ForEachItem = function (runtime, start, end)
	{	     
	    if ((start == null) || (start < 0))
	        start = 0; 
	    if ((end == null) || (end > this.items.length - 1))
	        end = this.items.length - 1;
	    
        var current_frame = runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i;
		for(i=start; i<=end; i++)
		{
            if (solModifierAfterCnds)
            {
                runtime.pushCopySol(current_event.solModifiers);
            }
            
            if (this.onGetIterItem)
                this.onGetIterItem(this.items[i], i);
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        runtime.popSol(current_event.solModifiers);
		    }            
		}
     		
		return false;
	};    	    
	// export
    
    ItemListKlassProto.add_item = function(snapshot, prevName, force_push)
	{
	    var item;
	    if (this.snapshot2Item)
	        item = this.snapshot2Item(snapshot);
	    else
	    {
	        var k = snapshot["key"]();
	        var item = snapshot["val"]();
	        item[this.keyItemID] = k;
	    }
        
        if (force_push === true)
        {
            this.items.push(item);
            return;
        }        
	        
	    if (prevName == null)
	    {
            this.items.unshift(item);
        }
        else
        {
            var i = this.itemID2Index[prevName];
            if (i == this.items.length-1)
                this.items.push(item);
            else
                this.items.splice(i+1, 0, item);
        }
        
        return item;
	};
	
	ItemListKlassProto.remove_item = function(snapshot)
	{
	    var k = snapshot["key"]();
	    var i = this.itemID2Index[k];	 
	    var item = this.items[i];
	    cr.arrayRemove(this.items, i);
	    return item;
	};	  

	ItemListKlassProto.update_itemID2Index = function()
	{
	    clean_table(this.itemID2Index);
	    var i,cnt = this.items.length;
	    for (i=0; i<cnt; i++)
	    {
	        this.itemID2Index[this.items[i][this.keyItemID]] = i;
	    }	
	};
		  
	var clean_table = function (o)
	{
	    var k;
	    for (k in o)
	        delete o[k];
	};
	
	window.FirebaseItemListKlass = ItemListKlass;
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