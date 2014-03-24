// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_MPchat = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_MPchat.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
        
        this.id = 0;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};
    
	typeProto.id_get = function()
	{
        var id = this.id;
        this.id += 1;
        return id;
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
        this.msgbuffer = new cr.plugins_.Rex_MPchat.MsgBufKlass(this, this.properties[1]); 
        this.is_reorder = (this.properties[1] == 1);       
        this.tag = this.properties[0]+this.type.id_get().toString();        
        this.mpwrap = null;

        this.sender_alias = "";
        this.msg_raw = "";
        this.decorate_params = null;
        this.msg_result = "";
        
        // initial at tick()
        this.runtime.tickMe(this);
	};
    
    instanceProto.tick = function()
    {         
        this._mpwrap_get();
        this.runtime.untickMe(this);
    }; 
    
    instanceProto._mpwrap_get = function ()
    {
        if (this.mpwrap != null)
            return this.mpwrap;

        assert2(cr.plugins_.Rex_MPwrap, "MPchat: Can not find MPwrap oject.");
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Rex_MPwrap.prototype.Instance)
            {
                this.mpwrap = inst;
                inst.MsgHandlerAdd(this.tag, this, this.MsgHandler);
                return this.mpwrap;
            }
        }
        assert2(this.mpwrap, "MPchat: Can not find MPwrap oject.");
        return null; 
    };
    
    instanceProto.PushMsg = function (msg, params_)
	{   
        var mpwrap_obj = this._mpwrap_get();    
        this.sender_alias = mpwrap_obj.GetMyAlias();
        
        var content = [msg, params_];
        msg = this.decorate_message(msg, params_);
        if (mpwrap_obj.IsHost())  // host
        {
            this.msgbuffer.push(msg);
            mpwrap_obj.HostBroadcastMessage(null, this.tag, content);
        }
        else  // peer
        {
            this.msgbuffer.push(msg, this.is_reorder);
            mpwrap_obj.SendMessage(null, this.tag, content);
        }
        
        this.sender_alias = "";
	};     
    
	instanceProto.MsgHandler = function(fromId, fromAlias, content)
	{      
        this.sender_alias = fromAlias;    
        
        var msg = content[0];
        var params = content[1];
        msg = this.decorate_message(msg, params);
        var mpwrap_obj = this._mpwrap_get();
        if (mpwrap_obj.IsHost())  // host receive message from peer
        {
            this.msgbuffer.push(msg);
            mpwrap_obj.HostBroadcastMessage(fromId, this.tag, content, 0, this.is_reorder);
        }
        else  // peer receive message from host
        {        
            this.msgbuffer.push(msg);
        }  

        this.sender_alias = "";        
	};    
    
    instanceProto.decorate_message = function(msg_in, params)
    {         
        this.msg_raw = msg_in;
        this.decorate_params = params;
        this.msg_result = msg_in;
        this.runtime.trigger(cr.plugins_.Rex_MPchat.prototype.cnds.OnDecorateMessage, this);
        return this.msg_result;
    }; 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnContentUpdate = function ()
	{
		return true;
	};

	Cnds.prototype.OnDecorateMessage = function ()
	{
		return true;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.PushMsg = function (msg, params_)
	{
        this.PushMsg(msg, params_);
	};  

    Acts.prototype.PushLog = function (msg)
	{
        this.msgbuffer.push(msg);
	};   

    Acts.prototype.SetDecoratedResult = function (msg)
	{
        this.msg_result = msg;
	};  

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.Content = function (ret)
	{
	    ret.set_string( this.msgbuffer.get_content() );
	};

    Exps.prototype.RawMessage = function (ret)
	{
	    ret.set_string( this.msg_raw );
	};   

    Exps.prototype.SenderAlias = function (ret)
	{
	    ret.set_string( this.sender_alias );
	}; 

    Exps.prototype.LastMsg = function (ret)
	{
	    ret.set_string( this.msgbuffer.last_message );
	}; 
	
    Exps.prototype.ExtraData = function (ret, param_index_, default_value)
	{
        var v = this.decorate_params[param_index_];
        if (v == null)
        {
            if (default_value != null)
                v  = default_value;
            else
                v = 0;
        }
	    ret.set_any(v);
	}; 
    
}());


(function ()
{
    cr.plugins_.Rex_MPchat.MsgBufKlass = function(plugin, max_len)
    {
        this.plugin = plugin;
        this.main_buf = [];
        this.tmp_buf = [];
        this.max_len = max_len;
        this.content = null;
		this.last_message = "";
    };
    
    var MsgBufKlassProto = cr.plugins_.Rex_MPchat.MsgBufKlass.prototype;
    
    MsgBufKlassProto.push = function (msg, is_temp)
    {
        if (is_temp)
        {
            this.tmp_buf.push(msg);
        }
        else
        {
            this.main_buf.push(msg);
            this.tmp_buf.length = 0;
        }
		this.last_message = msg;
        
        this.fit_len();
        this.content = null;
        this.plugin.runtime.trigger(cr.plugins_.Rex_MPchat.prototype.cnds.OnContentUpdate, this.plugin);
    };
    
    MsgBufKlassProto.fit_len = function ()
    {
        if (this.max_len == 0)
            return;

	    var main_len = this.main_buf.length;
		var tmp_len = this.tmp_buf.length;
        var total_len = main_len + tmp_len;
		if (total_len <= this.max_len)
		    return;
			
	    // total_len > this.max_len
	    if (main_len > this.max_len)
        {
            if (main_len == (this.max_len+1))
			{
			    this.main_buf.shift();
			}
			else
		    {
			    this.main_buf = this.main_buf.slice(main_len - this.max_len);
			}
        }
        else // if (main_len <= this.max_len)
        {
            var remain_len = this.max_len - main_len;
            this.main_buf.length = 0;
			this.tmp_buf = this.tmp_buf.slice(tmp_len - remain_len);
        }                       
    };
    
    MsgBufKlassProto.get_content = function ()
    {
        if (this.content == null)
            this.content = this.main_buf.join("\n") + this.tmp_buf.join("\n");
        return this.content;
    };    
}());