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
	var input_text = "";
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
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/";         
		this.tokenCtrl = new cr.plugins_.Rex_Firebase_Token.TokenCtrlClass(this);
		this.tokenCtrl.Add(this);
                
        if (window.SuspendMgr == null)   
        {
            window.SuspendMgr = new window.SuspendMgrKlass(this.runtime);            
        }
        window.SuspendMgr.Add(this);
	};
	
	instanceProto.onDestroy = function ()
	{
	    this.tokenCtrl.Remove(this);
        window.SuspendMgr.Remove(this);
	};
	
	instanceProto.GetTokenCtrl = function ()
	{
	    return this.tokenCtrl;
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
	
	
    instanceProto.JoinGroup = function (UserID)
	{	   	 
	    this.tokenCtrl.JoinGroup(UserID);   
	};
	
    instanceProto.LeaveGroup = function ()
	{
	    this.tokenCtrl.LeaveGroup();    
	};
	
	// for window.SuspendMgr
    instanceProto.OnSuspend = instanceProto.LeaveGroup;
    instanceProto.OnResume = instanceProto.JoinGroup;   
    
    // for tokenCtl object
    instanceProto.OnTokenOwnerChanged = function ()
    {
        this.runtime.trigger(cr.plugins_.Rex_Firebase_Token.prototype.cnds.OnTokenOwnerChanged, this);
    };
    instanceProto.OnGetToken = function ()
    {
        this.runtime.trigger(cr.plugins_.Rex_Firebase_Token.prototype.cnds.OnGetToken, this);
    };  
    instanceProto.OnReleaseToken = function ()
    {
        this.runtime.trigger(cr.plugins_.Rex_Firebase_Token.prototype.cnds.OnReleaseToken, this);
    };     
	
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
	    return (this.tokenCtrl.IsInGroup() && this.tokenCtrl.IsOwner());
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
		ret.set_string(this.tokenCtrl.ownerID);
	};
}());

(function ()
{
    if (window.SuspendMgrKlass != null)
        return;
        
    var SuspendMgrKlass = function(runtime)
    {
        this.callbackObjs = [];
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
            var i, cnt=self.callbackObjs.length, inst;
			if (s)
			{			    			    
			    // suspended
			    for (i=0; i<cnt; i++)
			    {			
			        inst = self.callbackObjs[i];     
			        if (inst.OnSuspend)
			            inst.OnSuspend();	    
			    }
			}
			else
			{
			    // resume
			    for (i=0; i<cnt; i++)
			    {			
			        inst = self.callbackObjs[i];     
			        if (inst.OnResume)
			            inst.OnResume();	    
			    }	  
			}
        }
		runtime.addSuspendCallback(on_suspended);      
	}; 
	    
	SuspendMgrKlassProto.Add = function(inst)
	{
        this.callbackObjs.push(inst);
	}; 
	
	SuspendMgrKlassProto.Remove = function(inst)
	{
	    cr.arrayFindRemove(this.callbackObjs, inst);
	};
	
	window.SuspendMgrKlass = SuspendMgrKlass;
}());

(function ()
{
    cr.plugins_.Rex_Firebase_Token.TokenCtrlClass = function(plugin)
    {        
        this.callbackObjs = [];
        this.plugin = plugin;
		this.myID = "";
        this.ownerID = "";
        this.my_ref = null;
        this.on_owner_changed = null;
    };
    var TokenClassProto = cr.plugins_.Rex_Firebase_Token.TokenCtrlClass.prototype;
    
	TokenClassProto.IsInGroup = function()
	{
	    return (this.my_ref != null);
	}; 
	
	TokenClassProto.IsOwner = function()
	{
	    return (this.myID == this.ownerID);
	};
	
	TokenClassProto.ListenOwner = function()
	{
	    if (this.on_owner_changed)
	        return;
	        
	    var candidates_ref = this.plugin.get_ref();
	    var self = this;
	    var on_owner_changed = function(snapshot)
	    {
	        self.ownerID = snapshot["val"]();
	        
	        var i, cnt=self.callbackObjs.length, inst;
	        for (i=0; i<cnt; i++)
	        {
	            inst = self.callbackObjs[i];
	            if (inst.OnTokenOwnerChanged)
	                inst.OnTokenOwnerChanged();	  
	                          	            
	            if (self.IsOwner() && inst.OnGetToken)
	                inst.OnGetToken();	 
	                
	            if (!self.IsOwner() && inst.OnReleaseToken)
	                inst.OnReleaseToken();	
	        }
             
	    };	    
	    candidates_ref["limitToFirst"](1)["on"]("child_added", on_owner_changed);
	    this.on_owner_changed = on_owner_changed;
	};	
	
    TokenClassProto.JoinGroup = function (UserID)
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
	
    TokenClassProto.LeaveGroup = function ()
	{
	    if (!this.IsInGroup())
	        return;
  
        var candidates_ref = this.plugin.get_ref();
	    candidates_ref["off"]("child_added", this.on_owner_changed);
	    this.my_ref["onDisconnect"]()["cancel"]();
	    this.my_ref["remove"]();
	    this.my_ref = null;      
	    this.on_owner_changed = null;
	};
	    
	TokenClassProto.Add = function(inst)
	{
        this.callbackObjs.push(inst);
	}; 
	
	TokenClassProto.Remove = function(inst)
	{
	    cr.arrayFindRemove(this.callbackObjs, inst);
	};
		    
}());

