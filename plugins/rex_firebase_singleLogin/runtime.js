// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_SingleLogin = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_SingleLogin.prototype;
		
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
	    this.myUserID = null;
        this.myLoginID = null;
        this.loginList = null;
        this.kickMode = this.properties[2];
        this.tryLogin = false;
	    this.exp_CurLoginItem = null;	    	    
	    this.exp_CurLoginItemIdx = -1;	           
	};
    
	instanceProto.onDestroy = function ()
	{		
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
    
	
	instanceProto.create_loginList = function()
	{
	    var loginList = new window.FirebaseItemListKlass();
	    
	    loginList.updateMode = loginList.AUTOALLUPDATE;
        loginList.keyItemID = "loginID";
	    
	    var self = this;        
        var snapshot2Item = function (snapshot)
        {
            var item = {};            
	        item[loginList.keyItemID] = get_key(snapshot);
            item["timestamp"] = snapshot["val"]();
            return item;
        };
        loginList.snapshot2Item = snapshot2Item;        
        
	    var on_update = function()
	    {
	        var myIndex = loginList.GetItemIndexByID(self.myLoginID);  
            if (myIndex != null)    
            {            
                var loggingOut = false;
                if (self.kickMode === 1)   // Kick previous
                {
                    var lastIndex = loginList.GetItems().length - 1;
                    loggingOut = (myIndex !== lastIndex);               
                }
                else if (self.kickMode === 2)   // Kick current
                {
                     loggingOut = (myIndex !== 0);
                }
                
                if (self.tryLogin)
                {
                    self.tryLogin = false;
                    if (!loggingOut)
                        self.runtime.trigger(cr.plugins_.Rex_Firebase_SingleLogin.prototype.cnds.OnLoginSuccess, self); 	  
                }
                 	                             
                if (loggingOut)
                {
                    self.loggingOut();
                    self.runtime.trigger(cr.plugins_.Rex_Firebase_SingleLogin.prototype.cnds.OnKicked, self); 	  
                }
                
                self.runtime.trigger(cr.plugins_.Rex_Firebase_SingleLogin.prototype.cnds.OnLoginListChanged, self);                
            }
            else    // kicked from other machine
            {
                self.tryLogin = false;
                self.loggingOut();
                self.runtime.trigger(cr.plugins_.Rex_Firebase_SingleLogin.prototype.cnds.OnKicked, self); 
                self.runtime.trigger(cr.plugins_.Rex_Firebase_SingleLogin.prototype.cnds.OnLoginListChanged, self);                 
            }
	    };	    
	    loginList.onItemsFetch = on_update;
        
	    var onGetIterItem = function(item, i)
	    {
	        self.exp_CurLoginItem = item;
	        self.exp_CurLoginItemIdx = i;
	    };
	    loginList.onGetIterItem = onGetIterItem;         
        
        return loginList;
    };

    instanceProto.login = function (userID)
	{
        var userRef = this.get_ref(userID);
	    var loginRef = userRef["push"](); 

	    var self = this;	
	    var on_write = function (error)
	    {
            if (error)
            {
                loginRef["onDisconnect"]()["cancel"]();
	            self.myUserID = null;
                self.myLoginID = null;
                self.runtime.trigger(cr.plugins_.Rex_Firebase_SingleLogin.prototype.cnds.OnLoginError, self); 	                   
            }
		    else
            {
                self.tryLogin = true;
	            self.myUserID = userID;
                self.myLoginID = get_key(loginRef);
                if (self.loginList === null)
                    self.loginList = self.create_loginList();
                var query = userRef["orderByKey"]();
                
                setTimeout(function()
                {
                    self.loginList.StartUpdate(query);
                }, 0);
            }
	    };

        loginRef["onDisconnect"]()["remove"]();
        var ts = serverTimeStamp();
	    loginRef["set"](ts, on_write);
	};
    
    instanceProto.loggingOut = function ()
	{ 
	    if (this.myUserID === null)
	        return;
	        
        this.loginList.StopUpdate();
        this.loginList.Clean();
        
	    var loginRef = this.get_ref(this.myUserID)["child"](this.myLoginID);
	    loginRef["remove"]();
	    loginRef["onDisconnect"]()["cancel"]();
	};         
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	
	Cnds.prototype.OnLoginSuccess = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnLoginError = function ()
	{
	    return true;
	};	
    
	Cnds.prototype.OnKicked = function ()
	{
	    return true;
	};	
	
	Cnds.prototype.OnLoginListChanged = function ()
	{
	    return true;
	};	    
    
	Cnds.prototype.ForEachLogin = function ()
	{	     
        if (this.loginList === null)
            return false;
        
		return this.loginList.ForEachItem(this.runtime);
	};     
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.SetDomainRef = function (domain_ref, sub_domain_ref)
	{
		this.rootpath = domain_ref + "/" + sub_domain_ref + "/";
	};
	
    Acts.prototype.Login = function (userID)
	{
        this.login(userID);
	};
 
    Acts.prototype.LoggingOut = function ()
	{ 
	    this.loggingOut();
	};
	
    Acts.prototype.KickByIndex = function (index)
	{
        if (this.loginList === null)
            return false;
        
        var item = this.loginList.GetItems()[index];
        if (!item)
            return;
        
        var loginID = item[this.loginList.keyItemID];
	    var loginRef = this.get_ref(this.myUserID)["child"](loginID);
	    loginRef["remove"]();
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.LoginCount = function (ret)
	{
        var cnt = (this.loginList === null)? 0: this.loginList.GetItems().length;
		ret.set_int(cnt);
	};
    
	Exps.prototype.CurLoginIndex = function (ret)
	{
		ret.set_int(this.exp_CurLoginItemIdx);
	};
    
	Exps.prototype.CurLoginTimestamp = function (ret)
	{
	    var ts;	    
	    if (this.exp_CurLoginItem != null)
	        ts = get_timestamp(this.exp_CurLoginItem["timestamp"]);
	    else
	        ts = 0;
	        	    
		ret.set_int(ts);
	};	
    
    
}());