// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_MPwrap = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_MPwrap.prototype;
		
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

    var isSupported = false;    
	instanceProto.onCreate = function()
	{
        this.multiplayer = null;
        this.MP_IsHost = null;
        //this.MP_HostBroadcastMessage = null;        
        this.MP_SendPeerMessage = null;
        this.MP_IsConnected = null;
                
        this.msg_router = new cr.plugins_.Rex_MPwrap.MsgRouterKlass();
        
        // initial at tick()
        this.runtime.tickMe(this);        
	};
        
    instanceProto.tick = function()
    {         
        this._multiplayer_get();    // connect to mpwrap
        this.runtime.untickMe(this);
    };
        
    instanceProto._multiplayer_get = function ()
    {
        if (this.multiplayer != null)
            return this.multiplayer;

        assert2(cr.plugins_.Multiplayer, "MPwrap: Can not find multiplayer oject.");
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Multiplayer.prototype.Instance)
            {
                this.multiplayer = inst;
                this._override(inst.mp);
                this.MP_IsHost = cr.plugins_.Multiplayer.prototype.cnds.IsHost;                
                //this.MP_HostBroadcastMessage = cr.plugins_.Multiplayer.prototype.acts.HostBroadcastMessage;
                this.MP_SendPeerMessage = cr.plugins_.Multiplayer.prototype.acts.SendPeerMessage;
                this.MP_IsConnected = cr.plugins_.Multiplayer.prototype.cnds.SignallingIsConnected;  
                
                isSupported = window["C2Multiplayer_IsSupported"]();
                this.msg_router.mp = inst.mp;
                return this.multiplayer;
            }
        }
        assert2(this.multiplayer, "MPwrap: Can not find multiplayer oject.");
        return null; 
    };
    
    instanceProto._override = function (mp)
    {
        var onpeermessage = mp["onpeermessage"];
        var msg_router = this.msg_router;
        mp["onpeermessage"] = function (peer, o)
        {           
            var is_break = msg_router.route(peer, o);
            if (!is_break)
            {
                onpeermessage.call(mp, peer, o);
            }
        };
    };

    instanceProto.MsgHandlerAdd = function (tag, thisArg, call_back_fn)
    {
        this.msg_router.add_handler(tag, thisArg, call_back_fn);
    };    
    instanceProto.MsgHandlerRemove = function (tag)
    {
        this.msg_router.remove_handler(tag);
    };        

    instanceProto.IsHost = function ()
    {
        var multiplayer_obj = this._multiplayer_get();
        return this.MP_IsHost.call(multiplayer_obj);
    }; 
    instanceProto.IsConnected = function ()
    {
        var multiplayer_obj = this._multiplayer_get();
        return this.MP_IsConnected.call(multiplayer_obj);
    };     

    instanceProto.GetMyAlias = function ()
    {
        var mp = this._multiplayer_get().mp;
        return mp["getMyAlias"]();
    };     

	function modeToDCType(mode_)
	{
		switch (mode_) {
		case 0:		// reliable ordered
			return "o";
		case 1:		// reliable unordered
			return "r";
		case 2:		// unreliable
			return "u";
		default:
			return "o";
		}
	};
    
    // set no_skip_from_id to yes to broadcast to all peers
    instanceProto.HostBroadcastMessage = function (from_id_, tag_, message_, mode_, no_skip_from_id)
    {
		if (!isSupported)
			return;
            
        var mp = this._multiplayer_get().mp;
        
        if (mode_ == null)
            mode_ = 0;
		
        var skip;
        if (no_skip_from_id != true)
		    skip = mp["getPeerById"](from_id_);
        else
            skip = null;
		
		var o = {
			"c": "m",			// command: message
			"t": tag_,			// tag
			"f": (from_id_ || mp["getHostID"]()),
			"m": message_		// content
		};
		
		mp["hostBroadcast"](modeToDCType(mode_), JSON.stringify(o), skip);
    };     
    
    instanceProto.SendMessage = function (peerid_, tag_, message_, mode_)
    {
        if (mode_ == null)
            mode_ = 0;
        
        var multiplayer_obj = this._multiplayer_get();
        this.MP_SendPeerMessage.call(multiplayer_obj, peerid_, tag_, message_, mode_);
    };
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());

(function ()
{
    cr.plugins_.Rex_MPwrap.MsgRouterKlass = function()
    {
        this.mp = null;
        this.tag2handler = {};
    };
    
    var MsgRouterKlassProto = cr.plugins_.Rex_MPwrap.MsgRouterKlass.prototype;
    
    MsgRouterKlassProto.add_handler = function (tag, thisArg, call_back_fn)
    {
        if (!this.tag2handler.hasOwnProperty(tag))
            this.tag2handler[tag] = new cr.plugins_.Rex_MPwrap._MsgHandlerKlass(thisArg, call_back_fn);
    };
    
    MsgRouterKlassProto.remove_handler = function (tag)
    {
        if (this.tag2handler.hasOwnProperty(tag))
            delete this.tag2handler[tag];
    };    
    
    MsgRouterKlassProto.route = function (peer, o)
    {
        var tag = o["t"];
        var has_handler = this.tag2handler.hasOwnProperty(tag);
        if (!has_handler)
            return false;
                    
        // allow "f" field to override sender             
        var fromId = (o["f"])?  o["f"] : peer["id"]; 
        var fromAlias = this.mp["getAliasFromId"](fromId);
        var content = o["m"];            
        this.tag2handler[tag].DoHandle(fromId, fromAlias, content);
        return true;
    };
    
    // _MsgHandler
    cr.plugins_.Rex_MPwrap._MsgHandlerKlass = function(thisArg, call_back_fn)
    {   
        this.thisArg = thisArg;
        this.call_back_fn = call_back_fn;
    };
    var _MsgHandlerKlassProto = cr.plugins_.Rex_MPwrap._MsgHandlerKlass.prototype;

    _MsgHandlerKlassProto.DoHandle = function(fromId, fromAlias, content)
    {   
        this.call_back_fn.call(this.thisArg, fromId, fromAlias, content);
    };    
}());
