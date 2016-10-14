/*

# filter to monitor opened rooms
room-filter/
    <roomID> 
        filter -  close/open + "|" + public/private/...    
        name - The display name of the room.


# header of room, write by owner of room. Each room has unique roomID.
# read it when joining the room
room-metadata/
    <roomID>        
        name - The display name of the room.
        
        # monitor filter to catch room open/close event        
        filter -  close/open + "|" + public/private/...

        # moderators of this room
        moderators/
            <userID> - userName 
        
        # join permission
        permission - null("anyone")/("black-list")/("white-list")
        black-list/
            <userID> - userName
        white-list/
            <userID> - userName
        # ignore room if user can not join

        maxPeers - The maximum number of peers that can join this room.
        # limit the amount of users
            
        extra/   
        
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
    var JOINPERMINNSION = [null /*"anyone"*/, "black-list", "white-list"];    
    var DOORSTATES = [ROOMCLOSED, ROOMOPEN];    
    var LEAVEDELAY = 10;
    
	instanceProto.onCreate = function()
	{ 
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/";         
	    //this.messageType = this.properties[2];
        this.LockedByAction = false;        
	    this.triggeredRoomName = "";
	    this.triggeredRoomID = "";  
	    this.triggeredUserName = "";
	    this.triggeredUserID = "";     
        this.exp_CurRoom = null;
        this.exp_CurUser = null;  
        this.exp_LoopIndex = 0;        
	      
	    // room
        this.room = new RoomMgrKlass(this);	      
        this.room.doorAutoControl = (this.properties[2] === 1);
        // room list
        this.roomsList = new RoomsListKlass(this);
        // user list
        this.usersList = this.room.usersList;

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
	
	instanceProto.get_roomUser_ref = function(roomID, joinAt)
	{
        var ref = this.get_room_ref(roomID)["child"]("users");
        if (joinAt != null)
            ref = ref["child"](joinAt);
	    return ref;
	};
    
	instanceProto.get_roomAliveFlag_ref = function(roomID)
	{
	    return this.get_room_ref(roomID)["child"]("alive");
	};
    
	instanceProto.get_roomfilter_ref = function(roomID)
	{
	    var ref = this.get_ref("room-filter");
	    if (roomID != null)
	        ref = ref["child"](roomID);
	    return ref;
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
        // trigger next tick
        var self=this;
        setTimeout(function()
        {
	        self.triggeredRoomName = roomName;
	        self.triggeredRoomID = roomID;  
		    self.runtime.trigger(trig, self);               
        }, 0);
	};
    instanceProto.run_userlist_trigger = function(trig, userName, userID)
	{
        // trigger next tick
        var self=this;
        setTimeout(function()
        {        
	        self.triggeredUserName = userName;
	        self.triggeredUserID = userID;  
		    self.runtime.trigger(trig, self);   
        }, 0);            
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

	Cnds.prototype.OnOpened = function ()
	{
	    return true;
	};		

	Cnds.prototype.OnClosed = function ()
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
	    return this.usersList.IsFull();
	};	    
	
	Cnds.prototype.OnBecomeFirstUser = function ()
	{
	    return true;
	};	    

	Cnds.prototype.ForEachUserInPermissionList = function (listType)
	{	     
        var listName = (listType === 1)? "black-list" : "white-list";
        var permissionList = (this.room.metadata)? this.room.metadata[listName] : null;
        if (permissionList == null)
            return false;
        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		var userID, user;
        this.exp_CurUser = {};
        this.exp_LoopIndex = -1;
		for(userID in permissionList)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurUser["ID"] = userID
            this.exp_CurUser["name"] = permissionList[userID];
            this.exp_LoopIndex ++;            
            current_event.retrigger();

            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}

        this.exp_CurUser = null;
		return false;
	};  	
	
	Cnds.prototype.IsLocked = function ()
	{
	    return this.LockedByAction;
	};	
	    
	Cnds.prototype.OnGetUsersList = function ()
	{
	    return true;
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

    Acts.prototype.CreateRoom = function (roomName, roomType, maxPeers, lifePeriod, doorState, roomID, createThenJoin)
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
                
                setTimeout(function()
                {
                    self.room.TryCreateRoom(roomName, roomType, maxPeers, lifePeriod, doorState, roomID, createThenJoin, on_create);
                }, LEAVEDELAY);
            }
            
            if (this.room.IsInRoom())
            {
                this.room.LeaveRoom(on_left);
            }
            else
                this.room.TryCreateRoom(roomName, roomType, maxPeers, lifePeriod, doorState, roomID, createThenJoin, on_create);
            
        }
        else  // create room only
        {
            this.room.TryCreateRoom(roomName, roomType, maxPeers, lifePeriod, doorState, roomID, createThenJoin, on_end);
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
            
            setTimeout(function()
            {
                self.room.TryJoinRoom(roomID, on_end);
            }, LEAVEDELAY);
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
	
    Acts.prototype.KickUser = function (userID)
	{
        this.room.KickUser(userID);
	};

    
    Acts.prototype.UpdateOpenRoomsList = function (roomType)
	{
        this.roomsList.UpdateOpenRoomsList(roomType);
	};
	
    Acts.prototype.StopUpdatingOpenRoomsList = function ()
	{
        this.roomsList.StopUpdatingOpenRoomsList();
	};	

    
    Acts.prototype.PermissionListAdd = function (userID, name, listType)
	{
        var listName = (listType === 1)? "black-list" : "white-list";
        this.room.SetPermissionList(listName, userID, name);
	};		
    Acts.prototype.PermissionListRemove = function (userID, listType)
	{
        var listName = (listType === 1)? "black-list" : "white-list";        
        this.room.SetPermissionList(listName, userID, null);
	};

    Acts.prototype.RequestMetadata = function ()
	{
        this.room.RequestMetadata();
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
            
            setTimeout(function()
            {            
                self.room.TryJoinRoom(roomID, on_join, true);  // ignore trigger
            }, LEAVEDELAY);
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
            roomID = (room)? room["roomID"]:"";
            
            if (leftThenJoin===0)
                try_join();
            else
                self.room.LeaveRoom(try_join);      
        }
        // step 1. try join a random room
        
        main();
	}; 

    Acts.prototype.GetUsersList = function (roomID)
	{
        var on_read = function (snapshot)
        {
            var val = snapshot["val"]();
        }

        var usersList_ref = this.get_roomUser_ref(roomID);  
        usersList_ref["once"]("value", on_read);
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

	Exps.prototype.MyUserName = Exps.prototype.UserName;    
	Exps.prototype.MyUserID = Exps.prototype.UserID;
    
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
        var room = this.exp_CurRoom;
        var name = (room)? room["name"]:"";	    
		ret.set_string(name);
	}; 
    
	Exps.prototype.CurRoomID = function (ret)
	{
        var room = this.exp_CurRoom;
        var ID = (room)? room["roomID"]:"";
		ret.set_string(ID);
	}; 
    
	Exps.prototype.CurCreatorName = function (ret)
	{
        var room = this.exp_CurRoom;
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
    
	Exps.prototype.CurCreatorID = function (ret)
	{
        var room = this.exp_CurRoom;
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

	Exps.prototype.Index2RoomName = function (ret, index)
	{
        var room = this.roomsList.GetRooms()[index];
        var name = (room)? room["name"]:"";	    
		ret.set_string(name);
	}; 

	Exps.prototype.Index2RoomID = function (ret, index)
	{
        var room = this.roomsList.GetRooms()[index];
        var ID = (room)? room["roomID"]:"";	    
		ret.set_string(ID);
	};    

	Exps.prototype.RoomsCount = function (ret, index)
	{    
		ret.set_int(this.roomsList.GetRooms().length);
	};     
    
	Exps.prototype.CurUserName = function (ret)
	{
        var user = this.exp_CurUser;
        var name = (user)? user["name"]:"";		    
		ret.set_string(name);
	};

	Exps.prototype.CurUserID = function (ret)
	{
        var user = this.exp_CurUser;        
        var ID = (user)? user["ID"]:"";		
		ret.set_string(ID);
	};
    
    Exps.prototype.Index2UserName = function (ret, index)
	{        
        var user = this.usersList.usersList.GetItems()[index];
        var name = (user)? user["name"]:"";		    
		ret.set_string(name);
	};		
    
	Exps.prototype.Index2UserID = function (ret, index)
	{
        var user = this.usersList.usersList.GetItems()[index];
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
		
	Exps.prototype.UsersCount = function (ret)
	{        
		ret.set_int(this.usersList.usersList.GetItems().length);
	};   
		
	Exps.prototype.CurRoomMaxPeers = function (ret)
	{        
        var room = this.exp_CurRoom;
        var maxPeers = (room)? (room["maxPeers"] || 0) : 0;
		ret.set_int(maxPeers);
	};  
    
    Exps.prototype.Index2RoomMaxPeers = function (ret, index)
	{        
        var room = this.roomsList.GetRooms()[index];
        var maxPeers = (room)? (room["maxPeers"] || 0) : 0;
		ret.set_int(maxPeers);
	};	    
    
	Exps.prototype.WhiteListToJSON = function (ret)
	{
        var permissionList;
        
        if (this.room.metadata)
            permissionList = this.room.metadata["white-list"];
        if (permissionList == null)
            permissionList = {}
        
		ret.set_string(JSON.stringify(permissionList));
	};   

	Exps.prototype.BlackListToJSON = function (ret)
	{
        var permissionList;
        
        if (this.room.metadata)
            permissionList = this.room.metadata["black-list"];
        if (permissionList == null)
            permissionList = {}
        
		ret.set_string(JSON.stringify(permissionList));
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

	Exps.prototype.LoopIndex = function (ret)
	{
	    ret.set_int(this.exp_LoopIndex);
	};       
    
    
    
    // --------

    var RoomMgrKlass = function (plugin)
    {
        this.plugin = plugin;
        this.doorAutoControl = true;
	    this.isRemoveRoomWhenLeft = false;        
        this.manualLeave = false;
        
        this.userID = "";
        this.userName = "";        
        // key of room ref
        this.roomID = "";        
        this.roomName = "";     
        this.roomType = "";
        this.maxPeers = 0;       
        this.metadata = null;
        
        // state
        this.doorState = null;           
        this.isFullSave = false;
        this.is_creater = false;
        // key of user ref
        this.joinAt = "";  

        // monitor ref
        this.monitor_ref = []; 
             
        // users list             
        this.usersList = new UsersListKlass(this);

        // user metadata
        //this.user_metadata = new UserMetadataKlass(this);
    };
    
    var RoomMgrKlassProto = RoomMgrKlass.prototype;

    // export
    RoomMgrKlassProto.SetUser = function (userID, name)
    {
        this.userID = userID;
        this.userName = name; 
        
        //this.user_metadata.Init();          
    };
    
	RoomMgrKlassProto.IsInRoom = function()
	{
	    return (this.roomID !== "");
	};  
	  
    RoomMgrKlassProto.TryCreateRoom = function (roomName, roomType, maxPeers, lifePeriod, doorState, roomID, createThenJoin,
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
            this.createRoom(roomName, roomType, maxPeers, lifePeriod, doorState, roomID, createThenJoin,
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
                    self.createRoom(roomName, roomType, maxPeers, lifePeriod, doorState, roomID, createThenJoin,
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
            var on_read = function (snapshot)
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
                    self.removeUsersList(roomID, on_join_errror);
                }
            }
            
            // read user list after exits this callback
            setTimeout(function()
            { 
                var usersList_ref = self.plugin.get_roomUser_ref(roomID);  
                usersList_ref["limitToFirst"](metadata["maxPeers"])["once"]("value", on_read);
            }, 0);
        };
        // step 3: check user count            
        
        // step 2: add to user list
        var try_join = function (metadata)
        {
            var on_write = function (error)
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
            
            self.addUsersList(roomID, on_write);
        };
        // step 2: add to user list
          
        // step 1: check room-metadata (room header)
        var check_door = function ()
        {
	        var on_read = function (snapshot)
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
            roommetadata_ref["once"]("value", on_read);
        };
        // step 1: check metadata
        
        check_door();
        this.pendCommand = "JOIN";        
	}; 
	
    RoomMgrKlassProto.KickUser = function (userID, onComplete)
	{    
        var user = this.usersList.GetUser(userID);
        if (user == null)
        {
            if (onComplete)
                onComplete(true);
            
            return;
        }
        
        var user_ref = this.plugin.get_roomUser_ref(this.roomID, user["joinAt"]);
        user_ref["remove"](onComplete);            
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
            this.removeUsersList(this.roomID, on_left);
        }        
	};	
    
    RoomMgrKlassProto.SetPermissionList = function (listName, userID, value)
    {
        if (!this.IsInRoom())
            return; 	
        
        var data = {};
        data["permission"] = listName;
        
        if (userID !== "")
            data[listName + "/" + userID] = value;        
        
        var metadata_ref = this.plugin.get_roommetadata_ref(this.roomID);
        metadata_ref["update"](data);
    };
    
    RoomMgrKlassProto.RequestMetadata = function ()
    {
        if (!this.IsInRoom())
            return; 	
        
        var self=this;
        var on_read = function (snapshot)
        {
            self.metadata = snapshot["val"]();
            
        }
        
        var metadata_ref = this.plugin.get_roommetadata_ref(this.roomID);
        metadata_ref["once"]("value", on_read);
    };    
    // export
  
	RoomMgrKlassProto.addUsersList = function(roomID, onComplete)
	{
        var usersList_ref = this.plugin.get_roomUser_ref(roomID);
        var user_ref = usersList_ref["push"]();
        user_ref["onDisconnect"]()["remove"]();        
        this.joinAt = get_key( user_ref );
        var userData = {
            "ID": this.userID,
            "name": this.userName,
        };

        // write to user list if onComplete
        if (onComplete)
            user_ref["set"](userData, onComplete);

        // prepare return data
        var data = {};
        data[this.joinAt] = userData;
        return data;
    };
    
	// normal case
    RoomMgrKlassProto.removeUsersList = function (roomID, onComplete)
	{
	    if (roomID == null)
	        roomID = this.roomID;
        
        var user_ref = this.plugin.get_roomUser_ref(roomID, this.joinAt);          
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
	    var self = this;        
        // monitor user kicked
	    var id_ref = this.plugin.get_roomUser_ref(this.roomID, this.joinAt)["child"]("ID");
	    var on_value_changed = function (snapshot)
	    {     
	        var ID = snapshot["val"]();
	        if (ID != null)
	            return;
          
            self.onLeftRoom();
	    };
	    this.monitor_ref.push(id_ref["toString"]());
	    id_ref["on"]("value", on_value_changed);
        
        // monitor filter (door state)
        var filter_ref = this.plugin.get_roommetadata_ref(this.roomID)["child"]("filter");
        var on_value_changed = function (snapshot)
        {
            var filter = snapshot["val"]();
            if (filter == null)
                return;
            
            var state = get_roomState(filter);            
            if (self.doorState !== state)
            {
                var cnds = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds;
                var trig = (state === ROOMOPEN)? cnds.OnOpened : cnds.OnClosed;
                self.plugin.run_room_trigger(trig, self.roomName, self.roomID); 
                self.doorState = state;                
            }
        }
	    this.monitor_ref.push(filter_ref["toString"]());
	    filter_ref["on"]("value", on_value_changed);        
	};
	
	RoomMgrKlassProto.monitorMyStateOff = function ()
	{
	    var i, cnt=this.monitor_ref.length;
	    for (i=0; i<cnt; i++)
	    {
	        this.plugin.get_ref(this.monitor_ref[i])["off"]();
	    }
	};	

    RoomMgrKlassProto.createRoom = function (roomName, roomType, maxPeers, lifePeriod, doorState, roomID, createThenJoin,
                                              onComplete_)
	{  
        var roomfilter_ref = this.plugin.get_roomfilter_ref(roomID);
        var metadata_ref = this.plugin.get_roommetadata_ref(roomID);          
        var room_ref = this.plugin.get_room_ref(roomID);
        
        // LIFE_TEMPORARY, remove room when creater is out
        this.isRemoveRoomWhenLeft = (lifePeriod === LIFE_TEMPORARY);        
        if (this.isRemoveRoomWhenLeft)
        {
            roomfilter_ref["onDisconnect"]()["remove"]();
            room_ref["onDisconnect"]()["remove"]();
            metadata_ref["onDisconnect"]()["remove"]();            
        }
        // LIFE_TEMPORARY, remove room when creater is out        
        
        var filter = getFilter(doorState, roomType);
        // set room-filter
        var roomfilter = {
            "filter": filter,
            "name": roomName,  
        }
                
        // set room-metadata
        var metadata = {
            "name": roomName,  
            "filter": filter,
            "moderators":{},
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
            var userData = this.addUsersList(roomID, false);
            for (var k in userData)
                roomdata["users"][k] = userData[k];
        }
        var data = {};
        data["room-filter/"+roomID] = roomfilter;
        data["room-metadata/"+roomID] = metadata;
        data["rooms/"+roomID] = roomdata;
        
        var onComplete = function(error)
        {
            if (onComplete_)
                onComplete_(error, metadata);
        }        
        var root_ref = this.plugin.get_ref();        
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
                var roomfilter_ref = self.plugin.get_roomfilter_ref(roomID);                
                var metadata_ref = self.plugin.get_roommetadata_ref(roomID);
                var room_ref = self.plugin.get_room_ref(roomID);
                roomfilter_ref["onDisconnect"]()["cancel"]();           
                metadata_ref["onDisconnect"]()["cancel"]();                
                room_ref["onDisconnect"]()["cancel"]();
                
                if (roomID === self.roomID)
                {
                    var user_ref = self.plugin.get_roomUser_ref(roomID, self.joinAt); 
                    user_ref["onDisconnect"]()["cancel"]();
                    self.joinAt = "";
                }
            }
            if (onComplete)
                onComplete(error);
        };
        
        var data = {};
        data["room-filter/"+roomID] = null;
        data["room-metadata/"+ roomID] = null;        
        data["rooms/"+ roomID] = null;        
        var root_ref = this.plugin.get_ref();       
        root_ref["update"](data, on_remove);
	};	    
	
	RoomMgrKlassProto.onJoinRoom = function (roomID, metadata, onComplete, ignoreTrigger)
	{  
        this.metadata = metadata;    
        var filterProps = parseFilter(metadata["filter"]);  // state,type        
        this.roomID = roomID;
        this.roomName = metadata["name"];
        this.roomType = filterProps[1];
        this.maxPeers = metadata["maxPeers"] || 0;
        this.doorState = null;
        	    	    
	    this.monitorMyStateOn();

	    // users list
        var self=this;
        this.usersList.onInitialize = function ()
        {
            if (!ignoreTrigger)
            {
                var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnJoinRoom;     
                self.plugin.run_room_trigger(trig, self.roomName, roomID); 
            }
            
            // call onComplete while users list has initialized
            if (onComplete)
                onComplete();
            self.usersList.onInitialize = null;
        }
	    this.usersList.StartUpdate(roomID, this.maxPeers);
        //this.user_metadata.Update();  
        
	};
	
    RoomMgrKlassProto.onLeftRoom = function ()
	{
        var roomID = this.roomID;
        var roomName = this.roomName;
        this.roomID = "";
        this.roomName = "";	
        this.doorState = null;
        this.isFullSave = false;
        
        this.monitorMyStateOff();
	    this.usersList.StopUpdate();    
	    this.usersList.Clean();	
        // roomID had been cleaned

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
        var filter = getFilter(doorState, this.roomType);       
        var data = {};
        data["room-filter/"+this.roomID+"/filter"] = filter;
        data["room-metadata/"+this.roomID+"/filter"] = filter;
        var root_ref = this.plugin.get_ref();        
        root_ref["update"](data, onComplete);        
	};
    
    
    RoomMgrKlassProto.onUsersListUpdated = function (usersList)
	{   
        // delay execute
        var self=this;    
        setTimeout(function ()
        {
            var nowIsFull = self.usersList.IsFull();
            if (self.doorAutoControl && self.usersList.isFirstUser())
            {
                if (self.isFullSave !== nowIsFull)
                {
                    var doorState = (nowIsFull)? ROOMCLOSED : ROOMOPEN;
                    self.SetDoorState( doorState );
                }
            }
            self.isFullSave = nowIsFull;
        }, 0);
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
        this.myRoom = plugin.room;
        this.rooms_list = new window.FirebaseItemListKlass();        
        
        this.rooms_list.keyItemID = "roomID";
    };
    
    var RoomsListKlassProto = RoomsListKlass.prototype;

    RoomsListKlassProto.UpdateOpenRoomsList = function (roomType)
	{
	    var self = this;
        var on_roomList_update = function (room)
        {
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnUpdateRoomsList;
            self.plugin.run_room_trigger(trig, room["name"], room["roomID"]);
        };
	    
        this.rooms_list.onItemAdd = on_roomList_update;
        this.rooms_list.onItemRemove = on_roomList_update;
        this.rooms_list.onItemChange = on_roomList_update;
        
        // prepare filter ref
	    var filter_ref = this.plugin.get_roomfilter_ref();
	    var query = filter_ref["orderByChild"]("filter");        
        if (roomType != "")
	        query = query["equalTo"](getFilter(ROOMOPEN, roomType));
	    else
            query = query["startAt"](ROOMOPEN)["endAt"](ROOMOPEN+"~"); 
            
	    this.rooms_list.StartUpdate(query);
	};
	
	RoomsListKlassProto.StopUpdatingOpenRoomsList = function()
	{
	    this.rooms_list.StopUpdate();
	};

	RoomsListKlassProto.ForEachRoom = function (start, end)
	{	     
	    var self = this;
	    var onGetIterItem = function(item, i)
	    {
	        self.plugin.exp_CurRoom = item;
            self.plugin.exp_LoopIndex = i;
	    };
	    this.rooms_list.onGetIterItem = onGetIterItem;
	    this.rooms_list.ForEachItem(this.plugin.runtime, start, end);
        this.plugin.exp_CurRoom = null;   
        this.plugin.exp_LoopIndex = 0;   		
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
        // overwrite these values 
          
        this.plugin = room.plugin;
        this.myRoom = room;
        this.usersList = new window.FirebaseItemListKlass();   
        this.userID2joinAt = {};        
        this.room = room;
        this.roomID = "";
        this.limit = 0;  
        this.isFirstUserSave = false;        
        
        this.usersList.keyItemID = "joinAt";
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
        var on_usersList_update = function (item)
        {
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnUpdateUsersList; 
            self.plugin.run_userlist_trigger(trig, item["name"], item["ID"]);	             

            var isFirstUser = self.isFirstUser();
            if (isFirstUser && !self.isFirstUserSave)
            {
                var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnBecomeFirstUser;
                self.plugin.run_userlist_trigger(trig, self.room.userName, self.room.userID);
            }
            self.isFirstUserSave = isFirstUser;
        };
	    var on_user_join = function (item)
	    {
            self.userID2joinAt[ item["ID"] ] = item["joinAt"];
            
            if (item["ID"] === self.room.userID)
            {
                if (self.onInitialize)
                    self.onInitialize(self.usersList.GetItems());
            }            
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnUserJoin;
            self.plugin.run_userlist_trigger(trig, item["name"], item["ID"]);	        
            on_usersList_update(item);
            self.myRoom.onUsersListUpdated(self.usersList.GetItems());
	    };        
	    var on_user_left = function (item)
	    {
            if (self.userID2joinAt.hasOwnProperty( item["ID"] ))
                delete self.userID2joinAt[ item["ID"] ];
            
            var trig = cr.plugins_.Rex_Firebase_Rooms.prototype.cnds.OnUserLeft;
            self.plugin.run_userlist_trigger(trig, item["name"], item["ID"]);
            on_usersList_update(item);
            self.myRoom.onUsersListUpdated(self.usersList.GetItems());
	    };     
	    	    
	    var query = this.plugin.get_roomUser_ref(this.roomID);
	    if (limit > 0)
	        query = query["limitToFirst"](limit);

        this.usersList.onItemAdd = on_user_join;
        this.usersList.onItemRemove = on_user_left;
        this.usersList.onItemChange = on_usersList_update;	        
	    this.usersList.StartUpdate(query);	    
	};
	
	UsersListKlassProto.StopUpdate = function()
	{
	    this.usersList.StopUpdate();
        this.roomID = "";  
        this.limit = 0;        
	};

	UsersListKlassProto.ForEachUser = function (start, end)
	{	     
	    var self = this;
	    var onGetIterItem = function(item, i)
	    {
	        self.plugin.exp_CurUser = item;
            self.plugin.exp_LoopIndex = i;
	    };
	    this.usersList.onGetIterItem = onGetIterItem;
	    this.usersList.ForEachItem(this.plugin.runtime, start, end);
        this.plugin.exp_CurUser = null;  
        this.plugin.exp_LoopIndex = 0;
		return false;
	};	   

	UsersListKlassProto.Clean = function ()
	{	     
	    this.usersList.Clean();
	};	
    
    UsersListKlassProto.IsFull = function ()
    {
        if (this.limit === 0)
            return false;
        
        return (this.usersList.GetItems().length >= this.limit);            
    };
    UsersListKlassProto.isFirstUser = function (userID)
    {
        if (userID == null)
            userID = this.room.userID;
        
         var user = this.usersList.GetItems()[0];
         if (!user)
             return false;
         
         return (user["ID"] === userID);
    };    
    UsersListKlassProto.GetUser = function (userID)
    {
        if (!this.userID2joinAt.hasOwnProperty(userID))
            return null;
        
        var joinAt = this.userID2joinAt[userID];
        return this.usersList.GetItemByID(joinAt);
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