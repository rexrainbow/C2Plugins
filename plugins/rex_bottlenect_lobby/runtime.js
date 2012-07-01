// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

// load socket.io.min.js
document.write('<script src="socket.io.min.js"></script>');

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Bottleneck_Lobby = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Bottleneck_Lobby.prototype;
		
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

	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
        this.channel_url = this.properties[0];
        this.game_name = "Chat"; //this.properties[1];        
        this.socket = new cr.plugins_.Rex_Bottleneck_Lobby.SocketIOKlass(this);
        this._branch = this.CreateBranch(this, this.on_message);
        this.gamerooms_list = new cr.plugins_.Rex_Bottleneck_Lobby.AvaiableRoomList();
		this.hot_game_rank = [];
        this.triggered_userID = 0;
        this.triggered_userName = "";
        this.current_data = "";    
        this.runtime.tickMe(this);        

        //this.check_name = "NETWORK";  
        this._exp_RoomName = "";
        this._exp_RoomID = "";   
        this._exp_RoomDescription = "";
        this._exp_RoomURL = "";   
		
        this._exp_HotGameName = "";	
        this._exp_HotGameCnt = 0;			
        this._exp_HotGameURL = "";   		
	};
    
    instanceProto.tick = function()
    {
        this.socket.tick();
    };    
    
    instanceProto._get_triggered_source = function(user_id)
    {
        if (user_id == null)
        {
            this.triggered_userID = this.socket.get_triggered_user_id();
            this.triggered_userName = this.socket.get_triggered_user_name();  
        }
        else
        {
            this.triggered_userID = user_id;
            this.triggered_userName = this._branch.get_user_name(user_id);
        }
    };       
    instanceProto.on_message = function(user_id, msg)
	{
        this._get_triggered_source(user_id);
        this.current_data = msg;
        this.runtime.trigger(cr.plugins_.Rex_Bottleneck_Lobby.prototype.cnds.OnData, this);
	};
    

    // export: get new socket branch instance
    instanceProto.CreateBranch = function(cb_this, cb_fn)
    {
        return (new cr.plugins_.Rex_Bottleneck_Lobby.BranchKlass(this.socket, cb_this, cb_fn));
    };
    

	//////////////////////////////////////
	// Conditions    
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnConnect = function()
	{
        this._get_triggered_source();    
		return true;
	};
	Cnds.prototype.OnDisconnect = function()
	{
		return true;
	};
	Cnds.prototype.OnError = function()
	{
		return true;
	};
	Cnds.prototype.OnData = function()
	{
		return true;
	};
	Cnds.prototype.OnUserJoined = function()
	{
        this._get_triggered_source();  
		return true;
	};   
	Cnds.prototype.OnUserLeft = function()
	{
        this._get_triggered_source();  
		return true;
	};       
    
	Cnds.prototype.ForEachUsrID = function()
	{ 
        var current_event = this.runtime.getCurrentEventStack().current_event;
		
		var user_id_save = this.triggered_userID;
        var user_name_save = this.triggered_userName;
        
        var userID_list = this._branch.get_userID_list();
        var id_cnt = userID_list.length;
        var i;
		for (i=0; i<id_cnt; i++ )
	    {
            this.triggered_userID = userID_list[i];
            this.triggered_userName = this._branch.get_user_name(this.triggered_userID);
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

		this.triggered_userID = user_id_save;
		this.triggered_userName = user_name_save;
		return false;        
	};  
    
	Cnds.prototype.AmIRoomModerator = function()
	{
		return this._branch.am_I_room_moderator();
	}; 
    
	Cnds.prototype.OnStartOfLayout = function()
	{
		return true;
	};   
    
	Cnds.prototype.OnGameroomAvaiable = function()
	{
		return true;
	};  	
    
	Cnds.prototype.OnGameroomUnavaiable = function()
	{
		return true;
	}; 
	
	Cnds.prototype.ForEachGameroom = function()
	{
        var current_event = this.runtime.getCurrentEventStack().current_event;

        var rooms = this.gamerooms_list.get_list();
        var room_cnt = rooms.length;
        var i, room_info;
		for (i=0; i<room_cnt; i++ )
	    {
	        room_info = rooms[i];
	        this._exp_RoomName = room_info["room_name"];
	        this._exp_RoomID = room_info["room_id"];    
	        this._exp_RoomDescription = room_info["room_description"];
	        this._exp_RoomURL = room_info["src"];
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

		return false;        
	}; 	
	
	Cnds.prototype.OnHotGameUpdated = function()
	{
		return true;  
	}; 	
		
	Cnds.prototype.ForEachHotGame = function()
	{
        var current_event = this.runtime.getCurrentEventStack().current_event;

        var rank_cnt = this.hot_game_rank.length;
        var i, item;
		for (i=0; i<rank_cnt; i++ )
	    {
	        item = this.hot_game_rank[i];  // [name, cnt, url]
	        this._exp_HotGameName = item[0];
			this._exp_HotGameCnt = item[1];
	        this._exp_HotGameURL = item[2];
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

		return false;  
	}; 
	//////////////////////////////////////
	// Actions    
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.SetChannel = function(host)
	{
        this.channel_url = host;
	};    
    
	Acts.prototype.Connect = function(room_id, user_name, is_public)
	{
        this.socket.connect(this.channel_url,
                            this.game_name, room_id, user_name,
                            is_public);
	};
	Acts.prototype.Disconnect = function()
	{
        this.socket["disconnect"]();
	};
	Acts.prototype.Send = function(data)
	{
        this._branch.send(data);
	};
	Acts.prototype.SetMaxMemberCount = function(count)
	{
        this.socket.set_room_user_max_cnt(count);
	};
	Acts.prototype.KickMember = function(user_id)
	{
        this.socket.kick_user(user_id);
	};  
	Acts.prototype.EnterLayout = function()
	{        
	};    
	Acts.prototype.JoinGame = function(game_url, room_id, user_name, is_new_window)
	{        
	    var uri = game_url+"?"+"room_id="+encodeURI(room_id)+"&"+"user_name="+encodeURI(user_name);
        if (is_new_window == 0)
	        window.location = uri;
        else
            window.open(uri);
	};    	 	
	//////////////////////////////////////
	// Expressions    
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Data = function(ret)
	{
		ret.set_string(this.current_data);
	};
	Exps.prototype.UsrID = function(ret)
	{
		ret.set_int(this.triggered_userID);        
	};    
	Exps.prototype.UsrName = function(ret)
	{   
		ret.set_string(this.triggered_userName);        
	};     
	Exps.prototype.IPAddr = function(ret)
	{
		ret.set_string(this.socket.host);        
	};  
	Exps.prototype.RoomName = function(ret)
	{
		ret.set_string(this._exp_RoomName);        
	};   
	Exps.prototype.RoomID = function(ret)
	{
		ret.set_string(this._exp_RoomID);        
	}; 	
	Exps.prototype.RoomDescription = function(ret)
	{
		ret.set_string(this._exp_RoomDescription);        
	};   
	Exps.prototype.RoomURL = function(ret)
	{
		ret.set_string(this._exp_RoomURL);        
	}; 	
	Exps.prototype.UsrID2Name = function(ret, user_id)
	{   
		ret.set_string(this._branch.get_user_name(user_id));         
	};     
	Exps.prototype.MyUserName = function(ret)
	{   
		ret.set_string(this._branch.get_my_user_name());         
	};
	Exps.prototype.MyUserID = function(ret)
	{   
		ret.set_int(this._branch.get_my_user_id());         
	}; 
	Exps.prototype.HotGameName = function(ret)
	{
		ret.set_string(this._exp_HotGameName);        
	}; 
	Exps.prototype.HotGameCnt = function(ret)
	{
		ret.set_int(this._exp_HotGameCnt);        
	};	
	Exps.prototype.HotGameURL = function(ret)
	{
		ret.set_string(this._exp_HotGameURL);        
	}; 	
	
}());	

(function ()
{
    cr.plugins_.Rex_Bottleneck_Lobby.SocketIOKlass = function(plugin)
    {
        this.plugin = plugin;
        this.socket = null;
        this.host = "";
        this.port = "";
        this.user_id = -1;    
        this.users_list = new cr.plugins_.Rex_Bottleneck_Lobby.UsersList();
        this.send_queue = [];
        this.received_quue = new cr.plugins_.Rex_Bottleneck_Lobby.PKGQueue(this);
        this.trigger_user_info = [0,""];
        this.is_connection = false;

        this.branch_sn = 0;
        this.branchs = {};
    };
    var SocketIOKlassProto = cr.plugins_.Rex_Bottleneck_Lobby.SocketIOKlass.prototype; 
    
    SocketIOKlassProto.branch_append = function(branch)
    {
        var branch_id = this.branch_sn;
        this.branchs[branch_id] = branch;
        this.branch_sn += 1;
        return branch_id;
    };

    var comma_split = function(msg)
    {
        var comma_index = msg.indexOf(',');
        return [parseInt(msg.slice(0,comma_index)),
                msg.slice(comma_index+1)];    
    };    
    SocketIOKlassProto.connect = function(host, 
                                          room_name, room_id, user_name,
                                          is_public)
    {    
        var login_info = {"room_name":room_name,
                          "room_id":room_id,
                          "user_name":user_name,
                          "is_public":is_public,
						  };

        this.is_connection = false;
        if(this.socket)
			this.socket["disconnect"]();
        
        this.user_name = login_info["user_name"];
        this.host = host;                  
        var socket = window["io"]["connect"](host, { 
                                             "transports":['xhr-polling'] 
                                             });
        
		var instance = this;
		var plugin = this.plugin;
		var runtime = plugin.runtime;
        socket["on"]('connect', function () {
            socket["emit"]('user.initialize', login_info,
                function (init_info) {                     				
                    instance.received_quue.set_sn(init_info["pkg_id"]);
                    instance.user_id = init_info["user_id"];
                    instance.users_list.set_users_list(init_info["user_info_list"]);
                    instance.is_connection = true; 
                    plugin.gamerooms_list.set_list(init_info["avaiable_gamerooms"]);
                    instance.trigger_user_info = [instance.user_id, instance.user_name];	
                    // connect completed
                    runtime.trigger(cr.plugins_.Rex_Bottleneck_Lobby.prototype.cnds.OnConnect, plugin);				
            });
        });
        socket["on"]('disconnect', function () {
            instance.is_connection = false; 
            instance.user_id = -1;   
            runtime.trigger(cr.plugins_.Rex_Bottleneck_Lobby.prototype.cnds.OnDisconnect, plugin);
        });          
        socket["on"]('error', function () {
            instance.is_connection = false;
            instance.user_id = -1;              
            runtime.trigger(cr.plugins_.Rex_Bottleneck_Lobby.prototype.cnds.OnError, plugin);
        });  

        // add other events
        socket["on"]('message', function (msg) { 
            instance.received_quue.ExeCmd(msg[0], instance.received, [msg[1]]);
        }); 
        // custom event
        socket["on"]('user.joined', function (args) {
            instance.received_quue.ExeCmd(args[0], instance.on_user_joined, [args[1]]);
        });          
        socket["on"]('user.left', function (args) {
            instance.received_quue.ExeCmd(args[0], instance.on_user_left, [args[1]]);
        });         
        socket["on"]('start_of_layout', function () {
            runtime.trigger(cr.plugins_.Rex_Bottleneck_Lobby.prototype.cnds.OnStartOfLayout, plugin);
        });
        socket["on"]('gameroom.avaiable', function (args) {
            plugin.gamerooms_list.add(args);
            runtime.trigger(cr.plugins_.Rex_Bottleneck_Lobby.prototype.cnds.OnGameroomAvaiable, plugin);
        });
        socket["on"]('gameroom.unavaiable', function (args) {
            plugin.gamerooms_list.remove(args);
            runtime.trigger(cr.plugins_.Rex_Bottleneck_Lobby.prototype.cnds.OnGameroomUnavaiable, plugin);
        });            
		socket["on"]('game.hotrank', function (args) {
		    plugin.hot_game_rank = args;
            runtime.trigger(cr.plugins_.Rex_Bottleneck_Lobby.prototype.cnds.OnHotGameUpdated, plugin);	
        }); 
		
        this.socket = socket;      
    };
    
	SocketIOKlassProto.send = function(branch_id, data)
	{
        this.send_queue.push([branch_id, data]);
	};
    
	SocketIOKlassProto.tick = function()     // execute this each tick
	{
		if (this.socket && (this.send_queue.length > 0))
        {
            // format: [user_id, [[branch_id, data], [branch_id, data], ...]]
            this.socket["json"]["send"]([this.user_id, this.send_queue]);
            this.send_queue = [];  // do not use length=0
        }
	};
	SocketIOKlassProto.disconnect = function()
	{
		if(this.socket)
			this.socket["disconnect"]();
	};
	SocketIOKlassProto.received = function(data)
	{
        // format: [user_id, [[branch_id, data], [branch_id, data], ...]]
        var user_id = data[0];
        data = data[1];
        var i, item, cb;
        var data_len = data.length;
        for (i=0; i<data_len; i++)
        {
            item = data[i];
            cb = this.branchs[item[0]];
            if (cb)
                cb.on_message(user_id, item[1]);
        }
	};
	SocketIOKlassProto.on_user_joined = function(trigger_user_info)
	{
        this.trigger_user_info = trigger_user_info;	    
        this.users_list.append_user(trigger_user_info[0], trigger_user_info[1]);
        this.plugin.runtime.trigger(cr.plugins_.Rex_Bottleneck_Lobby.prototype.cnds.OnUserJoined, this.plugin);
	};    
	SocketIOKlassProto.on_user_left = function(trigger_user_info)
	{
        this.trigger_user_info = trigger_user_info;
        this.users_list.remove_user(trigger_user_info[0]);          
        this.plugin.runtime.trigger(cr.plugins_.Rex_Bottleneck_Lobby.prototype.cnds.OnUserLeft, this.plugin);      
	}; 
	SocketIOKlassProto.get_triggered_user_id = function()
	{
        return this.trigger_user_info[0];
	};  
	SocketIOKlassProto.get_triggered_user_name = function()
	{
        return this.trigger_user_info[1];
	};	   
    
    // custom event
	SocketIOKlassProto.set_room_user_max_cnt = function(user_max_cnt)
	{
		var socket = this.socket;
		if(socket)
			socket["emit"]('room.set_MAXUSERCNT', user_max_cnt);
	};  
	SocketIOKlassProto.kick_user = function(user_id)
	{
		var socket = this.socket;
		if(socket)
        {
            if (typeof user_id == "string")
                user_id = this.users_list.get_id(user_id);
			socket["emit"]('room.kick_user', user_id);
        }
	};      
	SocketIOKlassProto.start_of_layout = function()
	{
		var socket = this.socket;
		if(socket)
			socket["emit"]('room.start_of_layout');
	};	 
    
    // socket branch
    cr.plugins_.Rex_Bottleneck_Lobby.BranchKlass = function(socket, cb_this, cb_fn)
    {
        this._branch_id = socket.branch_append(this);
        this.socket = socket;
        this.cb_on_message = {"this":cb_this, "fn":cb_fn};
    };
    var BranchKlassProto = cr.plugins_.Rex_Bottleneck_Lobby.BranchKlass.prototype; 
    
    BranchKlassProto.send = function(data)
	{
		this.socket.send(this._branch_id, data);
	};
    BranchKlassProto.on_message = function(user_id, msg)
	{
        var cb = this.cb_on_message;
		cb["fn"].call(cb["this"], user_id, msg);
	};
    BranchKlassProto.get_my_user_name = function()
	{
        return (this.socket.is_connection)? this.socket.user_name:"";
	};
    BranchKlassProto.get_my_user_id = function()
	{
        return (this.socket.is_connection)? this.socket.user_id:(-1);
	}; 
    BranchKlassProto.get_user_name = function(user_id)
	{
        return this.socket.users_list.get_name(user_id);
	};
    BranchKlassProto.get_userID_list = function()
	{
        return this.socket.users_list.id_list;
	}; 
    BranchKlassProto.get_my_user_id = function()
	{
        return this.socket.user_id;
	}; 
    BranchKlassProto.am_I_room_moderator = function()
	{
        return (this.get_my_user_id() == (this.get_userID_list()[0]));
	}; 
    
    // package queue for sync
    cr.plugins_.Rex_Bottleneck_Lobby.PKGQueue = function(thisArgs)
    {   
        this._queue = [];
        this.expire_pkg_id = null;
        this.thisArgs = thisArgs;
    };
    var PKGQueueProto = cr.plugins_.Rex_Bottleneck_Lobby.PKGQueue.prototype;
        
    var _PKGQUEUE_SORT = function(instA, instB)
    {
        var ta = instA[0];
        var tb = instB[0];
        return (ta < tb) ? -1 : (ta > tb) ? 1 : 0;
    };
    PKGQueueProto.ExeCmd = function(pkg_id, cb_fn, cb_args)
    {
        //console.log('%d, %d',pkg_id,this.expire_pkg_id);
        if ( (this._queue.length==0) &&
             (this.expire_pkg_id == pkg_id) )
        {
            this._exe_cmd(pkg_id, cb_fn, cb_args);
        }
        else
        {
            this._queue.push([pkg_id, cb_fn, cb_args]);
            this._queue.sort(_PKGQUEUE_SORT);
            var i, item;
            var queue_len = this._queue.length;
            var has_motified = false;
            for (i=0; i<queue_len; i++)
            {
                item = this._queue[i];
                if (item[0] < this.expire_pkg_id)      // overdue
                {
                    has_motified = true;
                    continue; 
                }
                else if (item[0] == this.expire_pkg_id) // expire
                {
                    has_motified = true;
                    this._exe_cmd(item[0], item[1], item[2]);
                }
                else                              // out-of-order
                    break;
            }
            
            if (has_motified)
            {
                i++;
                if (i==1)
                    this._queue.shift();
                else if (i==this._queue.length)
                    this._queue = [];
                else
                    this._queue.splice(0,i);
            }          
        }     
    };    
    PKGQueueProto._exe_cmd = function(pkg_id, cb_fn, cb_args)
    {
        cb_fn.apply(this.thisArgs, cb_args);
        this.expire_pkg_id ++ ;
    };
    PKGQueueProto.set_sn = function(value)
    {
        this.expire_pkg_id = value + 1;
    };    
    
    
    // users list
    cr.plugins_.Rex_Bottleneck_Lobby.UsersList = function()
    {   
        this.id_list = [];
        this.id2name = {};        
    };
    
    var UsersListProto = cr.plugins_.Rex_Bottleneck_Lobby.UsersList.prototype;  
    UsersListProto.cleanAll = function()
    { 
        this.id_list.length = 0;
        var key;
        for (key in this.id2name)
            delete this.id2name[key];
    };
    
    UsersListProto.set_users_list = function(users_list)
    { 
        this.cleanAll();    
        var i, item, id, name;
        var list_len = users_list.length;
        for (i=0;i<list_len;i++)
        {
            item = users_list[i];
            this.append_user(item[0], item[1])
        }
    };
    UsersListProto.get_users_list = function()
    { 
        return this.id_list;
    };    
    UsersListProto.get_name = function(id)
    { 
        return this.id2name[id];
    };
    UsersListProto.append_user = function(id, name)
    { 
        this.remove_user(id);
        this.id_list.push(id);
        this.id2name[id] = name;
    };
    UsersListProto.remove_user = function(id)
    { 
        var index = this.id_list.indexOf(id);
        if (index != (-1) )
        {
            if (index == 0)
                this.id_list.shift();
            else
                this.id_list.splice(index, 1);
            delete this.id2name[id];
        }
    };    
    UsersListProto.get_id = function(name)
    {
        var id;
        var id2name = this.id2name;
        for (id in id2name)
        {
            if (name == id2name[id])
                return parseInt(id);                
        }
        return -1;
    };
    
    // users list
    cr.plugins_.Rex_Bottleneck_Lobby.AvaiableRoomList = function()
    {   
        this.rooms = [];    
    };
    
    var AvaiableRoomListProto = cr.plugins_.Rex_Bottleneck_Lobby.AvaiableRoomList.prototype;  
    AvaiableRoomListProto.get_list = function()
    { 
        return this.rooms;
    };    
    AvaiableRoomListProto.set_list = function(rooms_list)
    { 
        this.rooms = rooms_list;
    };
    AvaiableRoomListProto.add = function(room_info)
    { 
        this.rooms.push(room_info);
    };  
    AvaiableRoomListProto.remove = function(room_info)
    { 
        var room_name = room_info[0];
        var room_id = room_info[1];
        var i, room_info, room_cnt = this.rooms.length;
        var find_index = null;
        for (i=0; i<room_cnt; i++)
        {
            room_info = this.rooms[i];
            if ((room_info["room_name"] == room_name) && 
                (room_info["room_id"] == room_id))
            {
                find_index = i;
                break;
            }
        }
        if (find_index != null)
        {
            if (find_index == 0)
                this._users.shift();
            else
                this._users.splice(find_index, 1);            
        }
    }; 
}());