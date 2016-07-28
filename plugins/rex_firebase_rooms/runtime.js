/*
# body of room data. Each room has unique roomID.
rooms/
    <roomID>
        alive - true or null
                
        # users in this room.           
        users/
            <joinAt>
                ID - The id of the user.    
                # monitor ID == null for "user kicked-out"              
                name - The name of the user.           
        
        <"channel-"+channel_name> - custom channel        

        
# header of room, write by owner of room. Each room has unique roomID.
# read it while joining the room
room-metadata/
    <roomID>        
        name - The display name of the room.
        filter -  close/open + "|" + public/private/...

        # moderators of this room
        moderators/
            <userID> - userName 
        
        # join permission
        permission - "anyone", "black-list", "white-list".
        black-list/
            <ID> - true
        white-list/
            <ID> - true
        # ignore room if user can not join

        maxPeers - The maximum number of peers that can join this room.
        # limit the amount of users
            
        extra/       

        
# write by each user, user could join to many rooms.   
user-metadata\
    <joinAt>
        user/
            ID - The id of the user.
            name - The display name of the user.
        room/
            ID - The id of the room
            name - The display name of the room.
        
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
    var LIFE_TEMPORARY = 0;
    var LIFE_PERSISTED = 1;
    var JOINPERMINNSION = ["anyone", "black-list", "white-list"];    
    var DOORSTATES = [ROOMCLOSED, ROOMOPEN];    
    
	instanceProto.onCreate = function()
	{ 
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/"; 
	    //this.messageType = this.properties[2];
        this.LockedByAction = false;
	    this.triggeredRoomName = "";
	    this.triggeredRoomID = "";  
	    this.triggeredUserName = "";
	    this.triggeredUserID = "";          
	      
	    // room
        this.room = new RoomMgrKlass(this);	      
        // room list
        this.roomsList = new RoomsListKlass(this);
        // user list
        this.usersList = this.room.users_list;

        //window["Firebase"]["enableLogging"](true);
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
	 	
	instanceProto.get_room_ref = function(roomID)
	{
        var ref = this.get_ref("rooms");
        if (roomID)
            ref = ref["child"](roomID);
	    return ref;
	};	  
	
	instanceProto.get_roomUsers_ref = function(roomID)
	{
	    return this.get_room_ref(roomID)["child"]("users");
	};
    
	instanceProto.get_message_ref = function(roomID)
	{
	    return this.get_room_ref(roomID)["child"]("simple-message");
	};   
    
	instanceProto.get_roomAliveFlag_ref = function(roomID)
	{
	    return this.get_room_ref(roomID)["child"]("alive");
	};
    
	instanceProto.get_roommetadata_ref = function(roomID)
	{
	    var ref = this.get_ref("room-metadata");
	    if (roomID != null)
	        ref = ref["child"](roomID);
	    return ref;
	};
 
	
	instanceProto.get_usermetadata_ref = function(userID)
	{
	    return this.get_ref("user-metadata")["child"](userID);
	};   
	
    var getFilter = function(state, type_)
	{
        var val = state+"|"+type_;
	    return val;
	};  
    
    var parseFilter = function(filter)
    {        
        var arr = filter.split("|");
        var state = arr[0];
        var type = arr[1];
        return [state, type];
    }
    
    var get_roomState = function (filter)
    {
        return filter.split("|")[0];
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
	
	Cnds.prototype.OnJoinRoom = function ()
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
		return this.roomsList.ForEachRoom(start, end);
	};  
	
	Cnds.prototype.OnUpdateUsersList = function ()
	{
	    return true;
	};	
	
	Cnds.prototype.ForEachUser = function (start, end)
	{	     
		return this.usersList.ForEachUser(start, end);
	};  	
	
	Cnds.prototype.OnUserJoin = function ()
	{
	    return true;
	};			 	
	
	Cnds.prototype.OnUserLeft = function ()
	{
	    return true;
	};		
	
	Cnds.prototype.IsFirstUser = function ()
	{
	    return this.usersList.isFirstUser();
	};		
	
	Cnds.prototype.IsFull = function ()
	{
	    return this.usersList.isFull();
	};	    
	
	Cnds.prototype.OnBecomeFirstUser = function ()
	{
	    return true;
	};	    
        
    // cf_deprecated
	Cnds.prototype.OnReceivedMessage = function () { };
	
	Cnds.prototype.OnReceivedPermissionLists = function ()
	{
	    return true;
	};	
	
	Cnds.prototype.IsLocked = function ()
	{
	    return this.LockedByAction;
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

    Acts.prototype.CreateRoom = function (roomName, roomType, maxPeers, lifePeriod, doorState, joinPermission, roomID, createThenJoin)
	{
        this.LockedByAction = true;
        var self = this;
        var on_end = function ()
        {
            self.LockedByAction = false;
        }
        
	    // push a new room if roomID == ""
        doorState = DOORSTATES[doorState];
        createThenJoin = (createThenJoin === 1);
        if (createThenJoin)
        {

            var on_create = function (error)
            {           
                if ((roomID !== "") && error)
                {
                    self.room.TryJoinRoom(roomID, on_end);
                }
            };
            
            var on_left = function (error)
            {
                if (error)
                {
                    on_end();
                    return;               
                }
                
                self.room.TryCreateRoom(roomName, roomType, maxPeers, lifePeriod, doorState, joinPermission, roomID, createThenJoin, on_create);
            }
            
            if (this.room.IsInRoom())
            {
                this.room.LeaveRoom(on_left);
            }
            else
                this.room.TryCreateRoom(roomName, roomType, maxPeers, lifePeriod, doorState, joinPermission, roomID, createThenJoin, on_create);
            
        }
        else  // create room only
        {
            this.room.TryCreateRoom(roomName, roomType, maxPeers, lifePeriod, doorState, joinPermission, roomID, createThenJoin, on_end);
        }        
	}; 
	
    Acts.prototype.SwitchDoor = function (doorState)
	{
        doorState = DOORSTATES[doorState];        
        this.room.SwitchDoor(doorState);
	};      
	
    Acts.prototype.JoinRoom = function (roomID, leftThenJoin)
	{      
        this.LockedByAction = true;
        var self = this;
        var on_end = function ()
        {
            self.LockedByAction = false;
        };
        
        var try_join = function (error)
        {
            if (error || (roomID === ""))
            {
                on_end();
                self.run_room_trigger(cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnJoinRoomError, "", "");     
                return;
            }
            
            self.room.TryJoinRoom(roomID, on_end);
        }
         
        if (leftThenJoin===0)
            try_join();
        else
            this.room.LeaveRoom(try_join);
	};   
     
    Acts.prototype.LeaveRoom = function ()
	{
        this.LockedByAction = true;
        var self = this;
        var on_end = function ()
        {
            self.LockedByAction = false;
        };
        
        this.room.LeaveRoom(on_end);
	};   
     
    //Acts.prototype.RemoveRoom = function (roomID, permission)
	//{    
    //    if (roomID == "")
    //        return;
    //        
    //    this.room.RemoveRoom(roomID, permission);
	//};  	
	
    // af_deprecated
    Acts.prototype.CreateOrJoinRoom = function (roomName, roomType, maxPeers, lifePeriod, doorState, joinPermission, roomID) { };
		
    Acts.prototype.UpdateOpenRoomsList = function (roomType)
	{
        this.roomsList.UpdateOpenRoomsList(roomType);
	};
	
    Acts.prototype.StopUpdatingOpenRoomsList = function ()
	{
        this.roomsList.StopUpdatingOpenRoomsList();
	};	
    
    // af_deprecated
    Acts.prototype.BroadcastMessage = function (message) { };   
	
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
    
    Acts.prototype.JoinRandomRoom = function (leftThenJoin, retry)
	{
        var roomID = "";
        
        this.LockedByAction = true;
        var self = this;
        var on_end = function (failed)
        {
            self.LockedByAction = false;
            
            if (failed)
            {
                self.run_room_trigger(cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnJoinRoomError, "", "");     
            }
            else
            {
                var roomName = self.room.roomName;
                var roomID = self.room.roomID;
                self.run_room_trigger(cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnJoinRoom, roomName, roomID);                     
            }
        };          
        
        // step 3. join room success, or retry
        var on_join = function (error)
        {
            if (error)
                main();
            else
                on_end();
        };          
        // step 3. join room success, or retry        
        
        // step 2. try join room, left then join   
        var try_join = function (error)
        {
            if (error || (roomID === ""))
            {
                on_end(true);
                return;
            }
            
            self.room.TryJoinRoom(roomID, on_join, true);  // ignore trigger
        }
        // step 2. try join room, left then join            
        
        // step 1. try join a random room
        var main = function ()
        {
            if (retry < 0)
            {
                on_end(true);
                return;
            }
            
            retry -= 1;
            var rooms = self.roomsList.GetRooms();
            var idx = Math.floor( Math.random() * rooms.length );
            var room = rooms[idx];
            if (!room)
            {
                on_end(true);
                return;
            }             
            
            roomID = room["roomID"];
            
            if (leftThenJoin===0)
                try_join();
            else
                self.room.LeaveRoom(try_join);      
        }
        // step 1. try join a random room
        
        main();
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
        var room = this.roomsList.exp_CurRoom;
        var name = (room)? room["name"]:"";	    
		ret.set_string(name);
	}; 
    
	Exps.prototype.CurRoomID = function (ret)
	{
        var room = this.roomsList.exp_CurRoom;
        var ID = (room)? room["roomID"]:"";
		ret.set_string(ID);
	}; 
    
	Exps.prototype.CurCreaterName = function (ret)
	{
        var room = this.roomsList.exp_CurRoom;
        var name;
        if (room)
        {
            var user = room["moderators"];
            for(var ID in user)
            {
                name = user[ID];
                break;
            }                
        }
        if (name == null)
            name = "";        
		ret.set_string(name);
	}; 
    
	Exps.prototype.CurCreaterID = function (ret)
	{
        var room = this.roomsList.exp_CurRoom;
        var ID;
        if (room)
        {
            var user = room["moderators"];
            for(ID in user)
            {
                break;
            }                
        }
        if (ID == null)
            ID = "";
		ret.set_string(ID);
	};  

	Exps.prototype.RoomIndex2Name = function (ret, index)
	{
        var room = this.roomsList.GetRooms()[index];
        var name = (room)? room["name"]:"";	    
		ret.set_string(name);
	}; 

	Exps.prototype.RoomIndex2ID = function (ret, index)
	{
        var room = this.roomsList.GetRooms()[index];
        var ID = (room)? room["roomID"]:"";	    
		ret.set_string(ID);
	};    
    
	Exps.prototype.CurRoomID = function (ret)
	{
        var room = this.roomsList.exp_CurRoom;
        var ID = (room)? room["roomID"]:"";
		ret.set_string(ID);
	};     
    
	Exps.prototype.CurUserName = function (ret)
	{
        var user = this.usersList.exp_CurUser;
        var name = (user)? user["name"]:"";		    
		ret.set_string(name);
	};

    Exps.prototype.UserIndex2Name = function (ret, index)
	{
        var user = this.usersList.GetItems()[index];
        var name = (user)? user["name"]:"";		    
		ret.set_string(name);
	};		
    
	Exps.prototype.UserIndex2ID = function (ret, index)
	{
        var user = this.usersList.GetItems()[index];
        var ID = (user)? user["ID"]:"";		
		ret.set_string(ID);
	};

	Exps.prototype.CurUserID = function (ret)
	{
        var user = this.usersList.exp_CurUser;
        var ID = (user)? user["ID"]:"";		
		ret.set_string(ID);
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
        var user = this.usersList.exp_LastLeftUser;
        var name = (user)? user["name"]:"";		    
		ret.set_string(name);
	};
		
	Exps.prototype.LastLeftUserID = function (ret)
	{
        var user = this.usersList.exp_LastLeftUser;
        var ID = (user)? user["ID"]:"";		
		ret.set_string(ID);
	}; 

    // ef_deprecated
	Exps.prototype.LastSenderID = function (ret) { ret.set_string(""); };  
	Exps.prototype.LastSenderName = function (ret) { ret.set_string(""); };  
	Exps.prototype.LastMessage = function (ret) { ret.set_string(""); };  
    // ef_deprecated
    
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
        
        var path = this.rootpath + "/rooms/" + roomID +"/";
        if (name != null)
            path += "channel-"+name + "/";
	    ret.set_string(path);
	};	  

    // --------

    var RoomMgrKlass = function (plugin)
    {
        this.plugin = plugin;        
	    this.isRemoveRoomWhenLeft = false;        
        this.manualLeave = false;
        
        this.userID = "";
        this.userName = "";        
        // key of room ref
        this.roomID = "";        
        this.roomName = "";
        this.doorState = "closed";        
        this.roomType = "";
        this.maxPeers = 0;       
        this.is_creater = false;
        // key of user ref
        this.joinAt = "";  
        
        // monitor ref
        this.monitor_ref = []; 
             
        // users list             
        this.users_list = this.createUsersList();

        // user metadata
        //this.user_metadata = new UserMetadataKlass(this);
        //this.white_list = {};
        //this.black_list = {};
    };
    
    var RoomMgrKlassProto = RoomMgrKlass.prototype;
	
    RoomMgrKlassProto.createUsersList = function ()
	{
        var users_list = new UsersListKlass(this);
        return users_list;    
    };
    
    // export
    RoomMgrKlassProto.SetUser = function (userID, name)
    {
        this.userID = userID;
        this.userName = name; 
        
        //this.user_metadata.Init();          
    };
    
	RoomMgrKlassProto.IsInRoom = function()
	{
	    return (this.roomID != "");
	};  
	  
    RoomMgrKlassProto.TryCreateRoom = function (roomName, roomType, maxPeers, lifePeriod, doorState, joinPermission, roomID, createThenJoin,
                                                onComplete, ignoreTrigger)
	{
        // does not support 
        //if ((roomID !== "") && (lifePeriod === LIFE_TEMPORARY))
        //{
        //    return;
        //}
        
        if (this.IsInRoom())
        {
            if (onComplete)
                onComplete(true);
            
            return;
        }  

        var self = this;
        
        // on complete
        var on_create_room_complete = function(error, metadata)
        {     
            if (error)
            {
                on_create_room_error();
                return;
            }
            
            // end of create room
            
            if (createThenJoin)
            {
                self.roomID = roomID;
                self.roomName = roomName;
                self.roomType = roomType;  
                self.maxPeers = maxPeers; 
            }
            
            if (!ignoreTrigger)
            {
                var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnCreateRoom;     
                self.plugin.run_room_trigger(trig, roomName, roomID); 
            }
	        // create successful
			self.onJoinRoom(roomID, metadata, onComplete, ignoreTrigger);	
			
			if (onComplete)
			    onComplete();        	        
        };
        
        
        // on error
        var on_create_room_error = function()
        {      
            if (!ignoreTrigger)
            {        
                // create failed
                var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnCreateRoomError;     
                self.plugin.run_room_trigger(trig, roomName, roomID); 
            }
            
			if (onComplete)
			    onComplete(true);                         
        };        
        
        // try allocate a room        
        if (roomID == "")
        {
            roomID = get_key( this.plugin.get_room_ref()["push"]() );
            this.createRoom(roomName, roomType, maxPeers, lifePeriod, doorState, roomID, joinPermission, createThenJoin,
                             on_create_room_complete);
        }
        else  // roomID !== ""
        {
            var self=this;
            var on_write_userID = function(current_value)
            {
                if (current_value === null)
                    return true;
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
                    self.createRoom(roomName, roomType, maxPeers, lifePeriod, doorState, roomID, joinPermission, createThenJoin,
                                     on_create_room_complete);         
                }            
            };                            
            // try create room
            var ref = this.plugin.get_roomAliveFlag_ref(roomID);
            ref["transaction"](on_write_userID, on_write_userID_complete);             
        }       
	}; 	 
	 
    RoomMgrKlassProto.SwitchDoor = function (doorState)
	{
        if (!this.IsInRoom())
            return; 

        if (doorState === ROOMOPEN)
        {
            // can not open full room
            if (this.users_list.isFull())
                return;
        }
        this.SetDoorState(doorState);
	};	
    
    RoomMgrKlassProto.isRoomOpened = function (metadata)
    {
        if (metadata == null)
            return false;
        
        var state = get_roomState(metadata["filter"]);
        if (state === ROOMCLOSED)
            return false;
        
        var IamModerators = metadata["moderators"].hasOwnProperty(this.userID);
        if (IamModerators)
            return true;
        
        var permission = metadata["permission"];
        if (permission === "black-list")
        {
            var blackList = metadata["black-list"];
            if (blackList && blackList.hasOwnProperty(this.userID))
                return false;            
            else
                return true;
        }
        else if (permission === "white-list")
        {
            var whiteList = metadata["white-list"];
            if (whiteList && whiteList.hasOwnProperty(this.userID))
                return true;            
            else
                return true;        
        }
        else    // permission === "anyone"
            return true;
    }
	  
    RoomMgrKlassProto.TryJoinRoom = function (roomID, onComplete, ignoreTrigger)
	{
        if (this.IsInRoom())
        {
            if (onComplete)
                onComplete(true);
            
            return;
        }

        var self = this;
        var on_join_complete = function(metadata)
        {      		              
            self.onJoinRoom(roomID, metadata, onComplete, ignoreTrigger);   
        };
        var on_join_errror = function()
        {
            if (!ignoreTrigger)
            {
                var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnJoinRoomError;     
                self.plugin.run_room_trigger(trig, "", roomID);   
            }
            
			if (onComplete)
			    onComplete(true);                        
        };
        
        // step 3: check user count  
        var check_user_count = function (metadata)
        {            
            var on_read_usersList = function (snapshot)
            {
                var isInList = false;
                snapshot["forEach"](function (childSnapshot)
                {
                    var userID = childSnapshot["val"]()["ID"];
                    isInList = (userID === self.userID);
	                if (isInList)
	                    return true;                    
                }); 
                if (isInList)
                {
                    on_join_complete(metadata);
                }   
                else
                {
                    self.removeFromUserList(roomID, on_join_errror);
                }
            }
            var usersList_ref = this.plugin.get_roomUsers_ref(roomID);  
            usersList_ref["limitToFirst"](metadata["maxPeers"])["once"]("value", on_read_usersList);
        };
        // step 3: check user count            
        
        // step 2: add to user list
        var try_join = function (metadata)
        {
            var on_write_user = function (error)
            {
                if (error)
                {
                    on_join_errror();
                    return;
                }

                if (metadata["maxPeers"])
                    check_user_count(metadata);
                else
                    on_join_complete(metadata);                
            }
            
            var usersList_ref = self.plugin.get_roomUsers_ref(roomID);  
            var userData = self.addToUsersListBegin(usersList_ref);
            usersList_ref["update"](userData, on_write_user);
        };
        // step 2: add to user list
          
        // step 1: check room-metadata (room header)
        var check_door = function ()
        {
	        var on_read_roommetadata = function (snapshot)
	        {     
	            var metadata = snapshot["val"]();
                if (!self.isRoomOpened(metadata))                   
                {
                    on_join_errror();  
                    return;                    
                }
                try_join(metadata);                
	        };	     
            var roommetadata_ref = self.plugin.get_roommetadata_ref(roomID);            
            roommetadata_ref["once"]("value", on_read_roommetadata);
        };
        // step 1: check metadata
        
        check_door();
        this.pendCommand = "JOIN";        
	}; 
	
    RoomMgrKlassProto.LeaveRoom = function (onComplete, ignoreTrigger)
	{
        if (!this.IsInRoom())
        {
            if (onComplete)
                onComplete(true);
            
            return;
        }

        this.manualLeave = true;        
         var self=this;
         var on_left = function(error)
         {
             self.pendCommand = null;              
             if (!error)
             {
                 self.isRemoveRoomWhenLeft = false;
                 self.is_creater = false;       
             }

             if (onComplete)
                 onComplete(error);                 
        };

        if (this.isRemoveRoomWhenLeft)
        {
            // remove room, include user list
            this.removeRoom(this.roomID, on_left);
        }
        else
        {
            // remove from user list only
            this.removeFromUserList(this.roomID, on_left);
        }        
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
  
	RoomMgrKlassProto.addToUsersListBegin = function(usersList_ref)
	{
        var user_ref = usersList_ref["push"]();
        user_ref["onDisconnect"]()["remove"]();        
        this.joinAt = get_key( user_ref );
        var data = {};
        data[this.joinAt] = {
            "ID": this.userID,
            "name": this.userName,
        };
        return data;
    }
    
	RoomMgrKlassProto.push_user_info = function(room_ref, onComplete)
	{
        var user_ref = room_ref["child"]("users")["push"]();
        this.joinAt = user_ref["key"]();        
        user_ref["onDisconnect"]()["remove"]();
        var user_info = {
            "ID":this.userID,
            "name":this.userName
        };
        user_ref["set"](user_info, onComplete);
	};		
	
	// normal case
    RoomMgrKlassProto.removeFromUserList = function (roomID, onComplete)
	{
	    if (roomID == null)
	        roomID = this.roomID;
        
        var user_ref = this.plugin.get_roomUsers_ref(roomID)["child"](this.joinAt);          
        var on_remove = function (error)
        {
            if (!error)
            {
                user_ref["onDisconnect"]()["cancel"]();                
            }
            if (onComplete)
                onComplete(error);                
        }
        user_ref["remove"](on_remove);    
	};	

	RoomMgrKlassProto.monitorMyStateOn = function ()
	{
        // monitor_user_kicked
	    var id_ref = this.plugin.get_roomUsers_ref(this.roomID)["child"](this.joinAt)["child"]("ID");
	    var self = this;
	    var on_value_changed = function (snapshot)
	    {     
	        var ID = snapshot["val"]();
	        if (ID != null)
	            return;
          
            self.onLeftRoom();
	    };
	    this.monitor_ref.push(id_ref["toString"]());
	    id_ref["on"]("value", on_value_changed);
	};
	
	RoomMgrKlassProto.monitorMyStateOff = function ()
	{
	    var i, cnt=this.monitor_ref.length;
	    for (i=0; i<cnt; i++)
	    {
	        this.plugin.get_ref(this.monitor_ref[i])["off"]();
	    }
	};	

    RoomMgrKlassProto.createRoom = function (roomName, roomType, maxPeers, lifePeriod, doorState, roomID, joinPermission, createThenJoin,
                                              onComplete_)
	{  
        var metadata_ref = this.plugin.get_roommetadata_ref(roomID);          
        var room_ref = this.plugin.get_room_ref(roomID);
        // LIFE_TEMPORARY, remove room when creater is out
        this.isRemoveRoomWhenLeft = (lifePeriod === LIFE_TEMPORARY);        
        if (this.isRemoveRoomWhenLeft)
        {
            room_ref["onDisconnect"]()["remove"]();
            metadata_ref["onDisconnect"]()["remove"]();            
        }        
                
        // set room-metadata
        var metadata = {
            "name": roomName,  
            "filter": getFilter(doorState, roomType),
            "moderators":{},
            "permission": JOINPERMINNSION[joinPermission],
        };
        metadata["moderators"][this.userID] = this.userName;
        if (maxPeers > 0)
            metadata["maxPeers"] = maxPeers;
        
        // set room data      
        var roomdata = {
            "alive": true,
        };

        if (createThenJoin)
        {
            roomdata["users"] = {};
            var usersList_ref = this.plugin.get_roomUsers_ref(roomID);
            var userData = this.addToUsersListBegin(usersList_ref);
            for (var k in userData)
                roomdata["users"][k] = userData[k];
        }
        var data = {};
        data["room-metadata/"+roomID] = metadata;
        data["rooms/"+roomID] = roomdata;
        var root_ref = this.plugin.get_ref();
        
        var onComplete = function(error)
        {
            if (onComplete_)
                onComplete_(error, metadata);
        }        
        root_ref["update"](data, onComplete);
        this.is_creater = true;        

	}; 
	
    RoomMgrKlassProto.removeRoom = function (roomID, onComplete)
	{
        var self=this;
        var on_remove = function(error)
        {
            if (!error)
            {
                // cancel disconnect handler after remove room writting
                var metadata_ref = self.plugin.get_roommetadata_ref(roomID);
                metadata_ref["onDisconnect"]()["cancel"]();
                var room_ref = self.plugin.get_room_ref(roomID);
                room_ref["onDisconnect"]()["cancel"]();
                
                if (roomID === self.roomID)
                {
                    var user_ref = self.plugin.get_roomUsers_ref(roomID)["child"](self.joinAt); 
                    user_ref["onDisconnect"]()["cancel"]();
                    self.joinAt = "";
                }
            }
            if (onComplete)
                onComplete(error);
        };
        
        var data = {};
        data["room-metadata/"+ roomID] = null;        
        data["rooms/"+ roomID] = null;        
        var root_ref = this.plugin.get_ref();       
        root_ref["update"](data, on_remove);
	};	    
	
	RoomMgrKlassProto.onJoinRoom = function (roomID, metadata, onComplete, ignoreTrigger)
	{  
        var filterProps = parseFilter(metadata["filter"]);  // state,type        
        this.roomID = roomID;
        this.roomName = metadata["name"];
        this.roomType = filterProps[1];
        this.maxPeers = metadata["maxPeers"] || 0;
        	    	    
	    this.monitorMyStateOn();

	    // users list
        var self=this;        
        this.users_list.onInitialize = function ()
        {
            if (!ignoreTrigger)
            {
                var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnJoinRoom;     
                self.plugin.run_room_trigger(trig, self.roomName, roomID); 
            }
            
            // call onComplete while users list has initialized
            if (onComplete)
                onComplete();
            self.users_list.onInitialize = null;
        }
	    this.users_list.StartUpdate(roomID, this.maxPeers);
        //this.user_metadata.Update();  
        
	};
	
    RoomMgrKlassProto.onLeftRoom = function ()
	{
        var roomID = this.roomID;
        var roomName = this.roomName;
        this.roomID = "";
        this.roomName = "";	
        
        this.monitorMyStateOff();
	    this.users_list.StopUpdate();    
	    this.users_list.Clean();	
        // roomID had been cleaned
        
        // clean permission lists
        //clean_table(this.white_list);
        //clean_table(this.black_list);
        
        // clean user metadata
        //this.user_metadata.Update();        
        
        var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnLeftRoom;     
        this.plugin.run_room_trigger(trig, roomName, roomID);     

        if (!this.manualLeave)
        {
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnKicked;     
            this.plugin.run_room_trigger(trig, roomName, roomID);         
        }
        
        this.manualLeave = false;
	};
	
    RoomMgrKlassProto.SetDoorState = function (doorState, onComplete)
	{
        var data = {};
        var filter = getFilter(doorState, this.roomType);        
        data["room-metadata/"+this.roomID+"/filter"] = filter
        var root_ref = this.plugin.get_ref();
        root_ref["update"](data, onComplete);
	};
    
    RoomMgrKlassProto.onStateUpdated = function (state)
	{
        if (state["roomID"] !== this.roomID)
            return;
        
        log(state);
	};    

	var clean_table = function (o)
	{
	    var k;
	    for (k in o)
	        delete o[k];
	};	

    
    // --------
    var RoomsListKlass = function (plugin)
    {
        this.plugin = plugin;
        this.rooms_list = new window.FirebaseItemListKlass();        
        this.exp_CurRoom = null;
        
        this.rooms_list.keyItemID = "roomID";
    };
    
    var RoomsListKlassProto = RoomsListKlass.prototype;

    RoomsListKlassProto.UpdateOpenRoomsList = function (roomType)
	{
	    var self = this;
        var on_roomList_update = function (room)
        {
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnUpdateRoomsList;
            self.plugin.runtime.trigger(trig, self.plugin); 
            
            //self.plugin.room.onStateUpdated(room);
        };
	    
        this.rooms_list.onItemAdd = on_roomList_update;
        this.rooms_list.onItemRemove = on_roomList_update;
        this.rooms_list.onItemChange = on_roomList_update;
        
	    var query = this.GetQueryObj(roomType);        
	    this.rooms_list.StartUpdate(query);
	};
	
	RoomsListKlassProto.StopUpdatingOpenRoomsList = function()
	{
	    this.rooms_list.StopUpdate();
	};
    
    RoomsListKlassProto.GetQueryObj = function (roomType)
	{
	    var metadata_ref = this.plugin.get_roommetadata_ref();
	    var query = metadata_ref["orderByChild"]("filter");        
        if (roomType != "")
	        query = query["equalTo"](getFilter(ROOMOPEN, roomType));
	    else
            query = query["startAt"](ROOMOPEN)["endAt"](ROOMOPEN+"~"); 
        return query;
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
    
	RoomsListKlassProto.GetRooms = function()
	{
	    return this.rooms_list.GetItems();
	};  

    var UsersListKlass = function (room)
    {       
        // overwrite these values
        this.onInitialize = null;            
        //this.onUsersCountChanged = null;    
        // overwrite these values 
          
        this.plugin = room.plugin;
        this.users_list = new window.FirebaseItemListKlass();        
        this.exp_CurUser = null;
        this.room = room;
        this.roomID = "";
        this.limit = 0;  
        this.isFirstUserSave = false;        
        
        this.users_list.keyItemID = "joinAt";
    };
    
    var UsersListKlassProto = UsersListKlass.prototype;

    UsersListKlassProto.StartUpdate = function (roomID, limit)
	{
        if (limit == null)
            limit = 0;
        
        this.StopUpdate();
        
        this.roomID = roomID;        
        this.limit = limit;

	    var self = this;	    
        var on_usersList_update = function ()
        {
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnUpdateUsersList;
            self.plugin.runtime.trigger(trig, self.plugin);  

            var isFirstUser = self.isFirstUser();
            if (isFirstUser && !self.isFirstUserSave)
            {
                var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnBecomeFirstUser;
                self.plugin.runtime.trigger(trig, self.plugin);   
            }
            self.isFirstUserSave = isFirstUser;
        };
	    var on_user_join = function (item)
	    {
            if (item["ID"] === self.room.userID)
            {
                if (self.onInitialize)
                    self.onInitialize(self.users_list.GetItems());
            }            
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnUserJoin;
            self.plugin.run_userlist_trigger(trig, item["name"], item["ID"]);	        
            on_usersList_update();
            //if (self.onUsersCountChanged)
            //    self.onUsersCountChanged(self.users_list.GetItems());
	    };        
	    var on_user_left = function (item)
	    {
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnUserLeft;
            self.plugin.run_userlist_trigger(trig, item["name"], item["ID"]);
            on_usersList_update();
            //if (self.onUsersCountChanged)
            //    self.onUsersCountChanged(self.users_list.GetItems());
	    };     
	    	    
	    var query = this.plugin.get_roomUsers_ref(this.roomID);
	    if (limit > 0)
	        query = query["limitToFirst"](limit);

        this.users_list.onItemAdd = on_user_join;
        this.users_list.onItemRemove = on_user_left;
        this.users_list.onItemChange = on_usersList_update;	        
	    this.users_list.StartUpdate(query);	    
	};
	
	UsersListKlassProto.StopUpdate = function()
	{
	    this.users_list.StopUpdate();
        this.roomID = "";  
        this.limit = 0;        
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
    
    UsersListKlassProto.isFull = function ()
    {
        if (this.limit === 0)
            return false;
        
        return (this.users_list.GetItems().length >= this.limit);            
    };
    UsersListKlassProto.isFirstUser = function (userID)
    {
        if (userID == null)
            userID = this.room.userID;
        
         var user = this.users_list.GetItems()[0];
         if (!user)
             return false;
         
         return (user["ID"] === userID);
    };    
    

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
    
}());