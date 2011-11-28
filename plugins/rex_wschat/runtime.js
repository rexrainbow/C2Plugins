// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_WSChat = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_WSChat.prototype;
		
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
        this._sysMsg = "";
        this._userMsg = "";
        this._chatroom = new cr.plugins_.Rex_WSChat.ChatroomKlass(this.properties[1], this);
        if (this.properties[0] == 1)
            this._chatroom.Connect();
	};

	instanceProto.onReceived = function()
	{
        this.runtime.trigger(cr.plugins_.Rex_WSChat.prototype.cnds.OnUsrMsgReceived, this);
	};
    
	instanceProto._PostSysMsg = function(msg, is_error_msg)
	{
        this._sysMsg = msg;
        var trig_method = (is_error_msg)? 
                          cr.plugins_.Rex_WSChat.prototype.cnds.OnSysError:
                          cr.plugins_.Rex_WSChat.prototype.cnds.OnSysMsg;
        this.runtime.trigger(trig_method, this);
        this._sysMsg = "";
	};    
      
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;         
    
	cnds.OnSysMsg = function ()
	{
		return true;
	};	
    
	cnds.OnSysError = function ()
	{
		return true;
	};	
    
	cnds.OnUsrMsgReceived = function ()
	{
		return true;
	};
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
       
	acts.SendMsg = function (msg)
	{     
        this._chatroom.Send(msg);
	}; 
       
	acts.Connect = function ()
	{       
        this._chatroom.Connect();  
	};     
       
	acts.SetServerUrl = function (url)
	{       
        this._chatroom.server_url = url;
	};  
    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

    exps.SysMsg = function (ret)
	{
	    ret.set_string(this._sysMsg);
	};	

    exps.Msg = function (ret)
	{
	    ret.set_string(this._userMsg);
	};	 

    exps.URL = function (ret)
	{
	    ret.set_string( );
	};	 
    
}());

(function ()
{
    cr.plugins_.Rex_WSChat.ChatroomKlass = function(url, plugin)
    {
        this.server_url = url;    
        this.sid = "";
        this.session = "";
        this.username = "";
        this.currentRoom = "";
        this.plugin = plugin;         
    };
    
    var ChatroomKlassProto = cr.plugins_.Rex_WSChat.ChatroomKlass.prototype;
    
    ChatroomKlassProto.Connect = function()
    {
        this.sid = "6de3437bc0f0fa98248eb8834285e65b";
        this._setupServerSession();
    };
    
    ChatroomKlassProto.Send = function(message)
    {
    };
  
    ChatroomKlassProto.Receive = function()
    {
    };
    
    ChatroomKlassProto.Tick = function()
    {
    }; 

    ChatroomKlassProto.SysMsg = function(msg, is_error_msg)
    {        
        this.plugin._PostSysMsg(msg, is_error_msg);
    }; 
    
    ChatroomKlassProto._getSessionId = function() 
    {
        debugger;        
        var context_obj = { inst: this };
        var _url = this.server_url + "/sid";
        jQuery.ajax({
            context: context_obj,
            type: "POST",
            url: _url,
            success: function(data) 
            {
                debugger;
                this.inst.sid = data;
                //setupServerSession();
            },
            error: function(xhr) 
            {
                debugger;
                var message = "無法登入聊天室，請確定您已登入論壇。";             
            },
            dataType: 'text'
        });
    };  

    ChatroomKlassProto._setupServerSession = function() 
    {
        debugger;    
        var context_obj = { inst: this };
        var _url = this.server_url + "/client/session";
        jQuery.ajax({
            context: context_obj,
            type: "GET",
            url: _url,
            success: function(data) 
            {
                debugger;    
                this.inst.session = data;
                //setInterval(pollUpdate, pollInterval);
                //this.inst._userInit();
            },
            error: function(xhr) 
            {
                debugger;    
                var message = '登入聊天室失敗： ' + xhr.status;
            },
            dataType: 'text'
        });
    }; 
    
    /*
    ChatroomKlassProto._userInit = function() 
    {
        this._enter(
            function(data) 
            {
                this.username = data;

                var roomKey = "大廳";
                this._joinRoom(roomKey, function() {
                    var message = '成功加入聊天室「' + roomKey + '」';               

                    this.currentRoom = roomKey;
                });
            };
        );
    };*/
    
    ChatroomKlassProto._enter = function(success) 
    {
        var context_obj = { inst: this };
        jQuery.ajax({
            context: context_obj,
            contentType: 'application/json',
            type: 'POST',
            url: _appendSession(this.server_url + 'client/enter/' + this.sid),
            success: success,
            error: function(xhr, textStatus) 
            {
                var message = '登入聊天室失敗： ' + xhr.status;
                
            }
        });
    };
    
    ChatroomKlassProto._joinRoom = function(roomKey, success) 
    {
        var key = encodeURIComponent(roomKey);
        jQuery.ajax({
            type: 'POST',
            url: this._appendSession(this.server_url + 'room/join/' + key),
            success: success,
            error: function(xhr, textStatus) 
            {
                var message = '加入聊天室失敗： ' + xhr.status;
            }
        });
    };
    
    ChatroomKlassProto._appendSession = function(url) 
    {
        return this.server_url + ';jsessionid=' + this.session;
    }        
}());