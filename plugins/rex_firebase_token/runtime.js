/*
<ID> - UserID

Push UserID into a list
*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_Token = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_Token.prototype;
		
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
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/";         
		this.token = new cr.plugins_.Rex_Firebase_Token.TokenKlass(this);
		
		var self = this;
        var on_tokenOwner_changed = function ()
        {
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Token.prototype.cnds.OnTokenOwnerChanged, self);
        };
        var on_get_token = function ()
        {
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Token.prototype.cnds.OnGetToken, self);
        };  
        var on_release_token = function ()
        {
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Token.prototype.cnds.OnReleaseToken, self);
        };          
        this.token.OnTokenOwnerChanged = on_tokenOwner_changed;
        this.token.OnGetToken = on_get_token;    
        this.token.OnReleaseToken = on_release_token;            
                
                
        if (window.SuspendMgr == null)   
        {
            window.SuspendMgr = new window.SuspendMgrKlass(this.runtime);            
        }
        window.SuspendMgr.push(this);
	};
	
	instanceProto.onDestroy = function ()
	{
        window.SuspendMgr.remove(this);
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
	
    instanceProto.JoinGroup = function (UserID)
	{	   	 
	    this.token.JoinGroup(UserID);   
	};
	
    instanceProto.LeaveGroup = function ()
	{
	    this.token.LeaveGroup();    
	};
	
	// for window.SuspendMgr
    instanceProto.OnSuspend = instanceProto.LeaveGroup;
    instanceProto.OnResume = instanceProto.JoinGroup;    
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnGetToken = function ()
	{
	    return true;
	};
    
	Cnds.prototype.OnTokenOwnerChanged = function ()
	{
	    return true;
	};
	
	Cnds.prototype.IsOwner = function ()
	{
	    return (this.token.IsInGroup() && this.token.IsOwner());
	}; 
	
	Cnds.prototype.OnReleaseToken = function ()
	{
	    return true;
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.SetDomainRef = function (domain_ref, sub_domain_ref)
	{
	    this.LeaveGroup();
		this.rootpath = domain_ref + "/" + sub_domain_ref + "/"; 
	};
	
    Acts.prototype.JoinGroup = function (UserID)
	{	   	    	    
	    this.JoinGroup(UserID);
	};
	
    Acts.prototype.LeaveGroup = function ()
	{
	    this.LeaveGroup();
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.OwnerID = function (ret)
	{
		ret.set_string(this.token.ownerID);
	};
}());

(function ()
{
    if (window.SuspendMgrKlass != null)
        return;
        
    var SuspendMgrKlass = function(runtime)
    {
        this.objects = [];
        this.addSuspendCallback(runtime);  
    };
    var SuspendMgrKlassProto = SuspendMgrKlass.prototype;
    
	SuspendMgrKlassProto.addSuspendCallback = function(runtime)
	{
        if (cr.plugins_.Rex_Waker)
            return;
            
        var self = this;
        var on_suspended = function (s)
        {   
            var i, cnt=self.objects.length, inst;
			if (s)
			{			    			    
			    // suspended
			    for (i=0; i<cnt; i++)
			    {			
			        inst = self.objects[i];     
			        if (inst.OnSuspend)
			            inst.OnSuspend();	    
			    }
			}
			else
			{
			    // resume
			    for (i=0; i<cnt; i++)
			    {			
			        inst = self.objects[i];     
			        if (inst.OnResume)
			            inst.OnResume();	    
			    }	  
			}
        }
		runtime.addSuspendCallback(on_suspended);      
	}; 
	    
	SuspendMgrKlassProto.push = function(inst)
	{
        this.objects.push(inst);
	}; 
	
	SuspendMgrKlassProto.remove = function(inst)
	{
	    cr.arrayFindRemove(this.objects, inst);
	};
	
	window.SuspendMgrKlass = SuspendMgrKlass;
}());

(function ()
{
    cr.plugins_.Rex_Firebase_Token.TokenKlass = function(plugin)
    {        
        // export
        this.OnTokenOwnerChanged = null;
        this.OnGetToken = null;
        this.OnReleaseToken = null;
        
        // export
        this.plugin = plugin;
		this.myID = "";
        this.ownerID = "";
        this.my_ref = null;
        this.on_owner_changed = null;
    };
    var TokenKlassProto = cr.plugins_.Rex_Firebase_Token.TokenKlass.prototype;
    
	TokenKlassProto.IsInGroup = function()
	{
	    return (this.my_ref != null);
	}; 
	
	TokenKlassProto.IsOwner = function()
	{
	    return (this.myID == this.ownerID);
	};
	
	TokenKlassProto.ListenOwner = function()
	{
	    if (this.on_owner_changed)
	        return;
	        
	    var candidates_ref = this.plugin.get_ref();
	    var self = this;
	    var on_owner_changed = function(snapshot)
	    {
	        self.ownerID = snapshot["val"]();
	        if (self.OnTokenOwnerChanged)
	            self.OnTokenOwnerChanged();	  
	                      	            
	        if (self.IsOwner() && self.OnGetToken)
	            self.OnGetToken();	 
	            
	        if (!self.IsOwner() && self.OnReleaseToken)
	            self.OnReleaseToken();	 	            
	                       
	    };	    
	    candidates_ref["limitToFirst"](1)["on"]("child_added", on_owner_changed);
	    this.on_owner_changed = on_owner_changed;
	};	
	
    TokenKlassProto.JoinGroup = function (UserID)
	{	   	    
	    if (this.IsInGroup())
	        this.LeaveGroup();
	    
	    if (UserID != null)
	        this.myID = UserID;
	    if (this.myID === "")
	        return;	  
	        
	    var self = this;
	    var on_complete = function (error)
	    {
	        if (error)
	            return;
	        
	        self.ListenOwner();
	    };      

	    var candidates_ref = this.plugin.get_ref();	    
        this.my_ref = candidates_ref["push"]();
        this.my_ref["onDisconnect"]()["remove"]();
        this.my_ref["set"](this.myID, on_complete);              
	};
	
    TokenKlassProto.LeaveGroup = function ()
	{
	    if (!this.IsInGroup())
	        return;
  
        var candidates_ref = this.plugin.get_ref();
	    candidates_ref["off"]("child_added", this.on_owner_changed);
	    this.my_ref["remove"]();
	    this.my_ref["onDisconnect"]()["cancel"]();        
	    this.my_ref = null;      
	    this.on_owner_changed = null;
	};
	    
}());

