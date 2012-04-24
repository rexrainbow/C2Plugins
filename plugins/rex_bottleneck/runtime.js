// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

// load socket.io.min.js
document.write('<script src="socket.io.min.js"></script>');

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Bottleneck = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Bottleneck.prototype;
		
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
        this.game_name = this.properties[1];    
        this.game_description = this.properties[2];
        this.ext_setting = this._get_ext_setting();         
        this.socket = new cr.plugins_.Rex_Bottleneck.SocketIOKlass(this);
        this._branch = this.CreateBranch(this, this.on_message);
        this.triggered_userID = 0;
        this.triggered_userName = "";
        this.current_data = "";    
        this.runtime.tickMe(this);        

        this.check_name = "NETWORK";               
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
        this.runtime.trigger(cr.plugins_.Rex_Bottleneck.prototype.cnds.OnData, this);
	};
    
    instanceProto._get_ext_setting = function()
    {    
        var vars = window.location.search.substring(1).split("&");
        var info ={};
        var i, cells, cnt=vars.length;
        for (i=0; i<cnt; i++)
        {
            cells = vars[i].split("=");
            info[cells[0]] = cells[1];
        }       
        return info;
    };  
    
    instanceProto._has_ext_setting = function ()
    {
		return ((this.ext_setting["room_id"] != null) &&
		        (this.ext_setting["user_name"] != null));        
    };	
    

    // export: get new socket branch instance
    instanceProto.CreateBranch = function(cb_this, cb_fn)
    {
        return (new cr.plugins_.Rex_Bottleneck.BranchKlass(this.socket, cb_this, cb_fn));
    };
    

	//////////////////////////////////////
	// Conditions    
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;

	cnds.OnConnect = function()
	{
        this._get_triggered_source();       
		return true;
	};
	cnds.OnDisconnect = function()
	{
		return true;
	};
	cnds.OnError = function()
	{
		return true;
	};
	cnds.OnData = function()
	{
		return true;
	};
	cnds.OnUserJoined = function()
	{
        this._get_triggered_source();    
		return true;
	};   
	cnds.OnUserLeft = function()
	{
        this._get_triggered_source();    
		return true;
	};       
    
	cnds.ForEachUsrID = function()
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
    
	cnds.AmIRoomModerator = function()
	{
		return this._branch.am_I_room_moderator();
	}; 

	cnds.OnStartOfLayout = function()
	{
		return true;
	}; 
    
	cnds.HasExternalSetting = function()
	{
	    return this._has_ext_setting();
	}; 	
	   
	//////////////////////////////////////
	// Actions    
	pluginProto.acts = {};
	var acts = pluginProto.acts;

	acts.SetChannel = function(host)
	{
        this.channel_url = host;
	};    
    
	acts.Connect = function(room_id, user_name, is_public)
	{
        this.socket.connect(this.channel_url,
                            this.game_name, room_id, user_name,
                            this.game_description, is_public);
	};
    
	acts.QucikConnect = function()
	{
	    if (this._has_ext_setting())
	    {
	        var room_id = this.ext_setting["room_id"];
	        var user_name = this.ext_setting["user_name"];
	        var is_public = false;
            this.socket.connect(this.channel_url,
                                this.game_name, room_id, user_name,
                                this.game_description, is_public);
        }
	};	
	
	acts.Disconnect = function()
	{
        this.socket["disconnect"]();
	};
	acts.Send = function(data)
	{
        this._branch.send(data);
	};
	acts.SetMaxMemberCount = function(count)
	{
        this.socket.set_room_user_max_cnt(count);
	};
	acts.KickMember = function(user_id)
	{
        this.socket.kick_user(user_id);
	};   
	acts.SetRoomStorage = function(key, data)
	{
        this._branch.set_room_storage_data(key, data);
	};   
	acts.GetRoomStorage = function(key)
	{
        this._branch.get_room_storage_data(key, this, this.on_room_storage);
	};      
	acts.EnterLayout = function()
	{        
	};  
	acts.SetRoomState = function(state)
	{     
        this.socket.set_room_state(state);    
	};    	
	//////////////////////////////////////
	// Expressions    
	pluginProto.exps = {};
	var exps = pluginProto.exps;

	exps.Data = function(ret)
	{
		ret.set_string(this.current_data);
	};
	exps.UsrID = function(ret)
	{
		ret.set_int(this.triggered_userID);        
	};    
	exps.UsrName = function(ret)
	{   
		ret.set_string(this.triggered_userName);        
	};     
	exps.IPAddr = function(ret)
	{
		ret.set_string(this.socket.host);        
	};
	exps.ExtUsrName = function(ret)
	{   
        var user_name = (this._has_ext_setting())? this.ext_setting["user_name"]:"";
		ret.set_string(user_name);   
	};  
	exps.ExtRoomID = function(ret)
	{   
        var room_id = (this._has_ext_setting())? this.ext_setting["room_id"]:"";
		ret.set_string(room_id);   
	};    
	exps.RoomData = function(ret, key, default_data)
	{   
        var data = this._branch.get_room_storage_data(key);
        if (data == null)
            data = default_data;
		ret.set_any(data);   
	};
	exps.UsrID2Name = function(ret, user_id)
	{   
		ret.set_string(this._branch.get_user_name(user_id));         
	};      
	exps.MyUserName = function(ret)
	{   
		ret.set_string(this._branch.get_my_user_name());         
	};
	exps.MyUserID = function(ret)
	{   
		ret.set_int(this._branch.get_my_user_id());         
	};  

}());

(function ()
{
    cr.plugins_.Rex_Bottleneck.SocketIOKlass = function(plugin)
    {
        this.plugin = plugin;
        this.socket = null;
        this.host = "";
        this.port = "";
        this.user_id = -1;    
        this.users_list = new cr.plugins_.Rex_Bottleneck.UsersList();
        this.room_storage_data = {};
        this.send_queue = [];
        this.received_quue = new cr.plugins_.Rex_Bottleneck.PKGQueue(this);
        this.trigger_user_info = [0,""];
        this.is_connection = false;

        this.branch_sn = 0;
        this.branchs = {};
    };
    var SocketIOKlassProto = cr.plugins_.Rex_Bottleneck.SocketIOKlass.prototype; 
    
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
                                          description, is_public)
    {  
       var login_info = {"src":document.location.href,
                         "room_name":room_name,   
                         "description": description,                              
                         "room_id":room_id,
                         "user_name":user_name,
                         "is_public":is_public};  
        
        this.is_connection = false;
        if(this.socket)
			this.socket["disconnect"]();
        
        this.user_name = user_name;
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
                    instance.room_storage_data = init_info["room_data"];
                    instance.is_connection = true;   
                    instance.trigger_user_info = [instance.user_id, instance.user_name];                    
                    // connect completed
                    runtime.trigger(cr.plugins_.Rex_Bottleneck.prototype.cnds.OnConnect, plugin);
            });
        });
        socket["on"]('disconnect', function () {
            instance.is_connection = false;
            instance.user_id = -1;      
            runtime.trigger(cr.plugins_.Rex_Bottleneck.prototype.cnds.OnDisconnect, plugin);
        });          
        socket["on"]('error', function () {
            instance.is_connection = false;
            instance.user_id = -1;      
            runtime.trigger(cr.plugins_.Rex_Bottleneck.prototype.cnds.OnError, plugin);
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
            runtime.trigger(cr.plugins_.Rex_Bottleneck.prototype.cnds.OnStartOfLayout, plugin);
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
            this.send_queue = [];
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
        this.plugin.runtime.trigger(cr.plugins_.Rex_Bottleneck.prototype.cnds.OnUserJoined, this.plugin);
	};    
	SocketIOKlassProto.on_user_left = function(trigger_user_info)
	{
        this.trigger_user_info = trigger_user_info;
        this.users_list.remove_user(trigger_user_info[0]);         
        this.plugin.runtime.trigger(cr.plugins_.Rex_Bottleneck.prototype.cnds.OnUserLeft, this.plugin);       
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
	SocketIOKlassProto.set_room_storage_data = function(key, data)
	{
		var socket = this.socket;
		if(socket)
        {
			socket["emit"]('room.storage.set', key, data);
        }
	};    
	SocketIOKlassProto.start_of_layout = function()
	{
		var socket = this.socket;
		if(socket)
			socket["emit"]('room.start_of_layout');
	};	
	SocketIOKlassProto.set_room_state = function(state)
	{
		var socket = this.socket;
		if(socket)
        {
			socket["emit"]('room.state.set', state);
        }
	};     
    
    // socket branch
    cr.plugins_.Rex_Bottleneck.BranchKlass = function(socket, cb_this, cb_fn)
    {
        this._branch_id = socket.branch_append(this);
        this.socket = socket;
        this.cb_on_message = {"this":cb_this, "fn":cb_fn};
    };
    var BranchKlassProto = cr.plugins_.Rex_Bottleneck.BranchKlass.prototype; 
    
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
    BranchKlassProto.set_room_storage_data = function(key, data)
	{
        this.socket.set_room_storage_data(key, data);
	};
    BranchKlassProto.get_room_storage_data = function(key)
	{
        return this.socket.room_storage_data[key];
	};    
    
    // package queue for sync
    cr.plugins_.Rex_Bottleneck.PKGQueue = function(thisArgs)
    {   
        this._queue = [];
        this.expire_pkg_id = null;
        this.thisArgs = thisArgs;
    };
    var PKGQueueProto = cr.plugins_.Rex_Bottleneck.PKGQueue.prototype;
        
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
    cr.plugins_.Rex_Bottleneck.UsersList = function()
    {   
        this.id_list = [];
        this.id2name = {};        
    };
    
    var UsersListProto = cr.plugins_.Rex_Bottleneck.UsersList.prototype;  
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
}());