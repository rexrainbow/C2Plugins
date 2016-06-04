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
                self.loginList.StartUpdate(query);
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


(function ()
{
    if (window.FirebaseItemListKlass != null)
        return;    
    
    var ItemListKlass = function ()
    {
        // -----------------------------------------------------------------------
        // export: overwrite these values
        this.updateMode = 1;                  // AUTOCHILDUPDATE
        this.keyItemID = "__itemID__";
        
        // custom snapshot2Item function
        this.snapshot2Item = null;
        
        // auto child update, to get one item
        this.onItemAdd = null;
        this.onItemRemove = null;
        this.onItemChange = null;
        
        // manual update or
        // auto all update, to get all items
        this.onItemsFetch = null;
        
        // used in ForEachItem
        this.onGetIterItem = null;  
        
        this.extra = {};
        // export: overwrite these values
        // -----------------------------------------------------------------------        
        
        // -----------------------------------------------------------------------        
        // internal
        this.query = null;
        this.items = [];
        this.itemID2Index = {}; 
                
        // saved callbacks
        this.add_child_handler = null;
        this.remove_child_handler = null;
        this.change_child_handler = null;
        this.items_fetch_handler = null;        
        // internal       
        // -----------------------------------------------------------------------        
    };
    
    var ItemListKlassProto = ItemListKlass.prototype;
    
    ItemListKlassProto.MANUALUPDATE = 0;
    ItemListKlassProto.AUTOCHILDUPDATE = 1;
    ItemListKlassProto.AUTOALLUPDATE = 2;    
    
    // --------------------------------------------------------------------------
    // export
    ItemListKlassProto.GetItems = function ()
    {
        return this.items;
    };
    
    ItemListKlassProto.GetItemIndexByID = function (itemID)
    {
        return this.itemID2Index[itemID];
    };     
    
    ItemListKlassProto.GetItemByID = function (itemID)
    {
        var i = this.GetItemIndexByID(itemID);
        if (i == null)
            return null;
            
        return this.items[i];
    };  
    
    ItemListKlassProto.Clean = function ()
    {
        this.items.length = 0;
        clean_table(this.itemID2Index); 
    };        
    
    ItemListKlassProto.StartUpdate = function (query)
    {
        this.StopUpdate();            
        this.Clean();        
  
        if (this.updateMode === this.MANUALUPDATE)
            this.manual_update(query);
        else if (this.updateMode === this.AUTOCHILDUPDATE)        
            this.auto_child_update_start(query);        
        else if (this.updateMode === this.AUTOALLUPDATE)   
            this.auto_all_update_start(query);    
    };
    
    ItemListKlassProto.StopUpdate = function ()
	{
        if (this.updateMode === this.AUTOCHILDUPDATE)        
            this.auto_child_update_stop();        
        else if (this.updateMode === this.AUTOALLUPDATE)   
            this.auto_all_update_stop();
	};	
	
	ItemListKlassProto.ForEachItem = function (runtime, start, end)
	{	     
	    if ((start == null) || (start < 0))
	        start = 0; 
	    if ((end == null) || (end > this.items.length - 1))
	        end = this.items.length - 1;
	    
        var current_frame = runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i;
		for(i=start; i<=end; i++)
		{
            if (solModifierAfterCnds)
            {
                runtime.pushCopySol(current_event.solModifiers);
            }
            
            if (this.onGetIterItem)
                this.onGetIterItem(this.items[i], i);
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        runtime.popSol(current_event.solModifiers);
		    }            
		}
     		
		return false;
	};    	    
	// export
    // --------------------------------------------------------------------------    
    
    // --------------------------------------------------------------------------
    // internal  
	var isFirebase3x = function()
	{ 
        return (window["FirebaseV3x"] === true);
    };
    var get_key = function (obj)
    {       
        return (!isFirebase3x())?  obj["key"]() : obj["key"];
    };    
    ItemListKlassProto.add_item = function(snapshot, prevName, force_push)
	{
	    var item;
	    if (this.snapshot2Item)
	        item = this.snapshot2Item(snapshot);
	    else
	    {
	        var k = get_key(snapshot);
	        item = snapshot["val"]();
	        item[this.keyItemID] = k;
	    }
        
        if (force_push === true)
        {
            this.items.push(item);
            return;
        }        
	        
	    if (prevName == null)
	    {
            this.items.unshift(item);
        }
        else
        {
            var i = this.itemID2Index[prevName];
            if (i == this.items.length-1)
                this.items.push(item);
            else
                this.items.splice(i+1, 0, item);
        }
        
        return item;
	};
	
	ItemListKlassProto.remove_item = function(snapshot)
	{
	    var k = get_key(snapshot);
	    var i = this.itemID2Index[k];	 
	    var item = this.items[i];
	    cr.arrayRemove(this.items, i);
	    return item;
	};	  

	ItemListKlassProto.update_itemID2Index = function()
	{
	    clean_table(this.itemID2Index);
	    var i,cnt = this.items.length;
	    for (i=0; i<cnt; i++)
	    {
	        this.itemID2Index[this.items[i][this.keyItemID]] = i;
	    }	
	};
    
    ItemListKlassProto.manual_update = function(query)
    {
        var self=this;
        var read_item = function(childSnapshot)
        {
            self.add_item(childSnapshot, null, true);
        };            
        var handler = function (snapshot)
        {           
            snapshot["forEach"](read_item);                
            self.update_itemID2Index();   
            if (self.onItemsFetch)
                self.onItemsFetch(self.items)
        };
      
        query["once"]("value", handler);    
    };
    
    ItemListKlassProto.auto_child_update_start = function(query)
    {
        var self = this;         
	    var add_child_handler = function (newSnapshot, prevName)
	    {
	        var item = self.add_item(newSnapshot, prevName);
	        self.update_itemID2Index();
	        if (self.onItemAdd)
	            self.onItemAdd(item);
	    };
	    var remove_child_handler = function (snapshot)
	    {
	        var item = self.remove_item(snapshot);
	        self.update_itemID2Index();
	        if (self.onItemRemove)
	            self.onItemRemove(item);
	    };      	        
	    var change_child_handler = function (snapshot, prevName)
	    {
	        var item = self.remove_item(snapshot);
	        self.update_itemID2Index();
	        self.add_item(snapshot, prevName);
	        self.update_itemID2Index();
	        if (self.onItemChange)
	            self.onItemChange(item); 
	    };
	    
	    this.query = query;
        this.add_child_handler = add_child_handler;
        this.remove_child_handler = remove_child_handler;
        this.change_child_handler = change_child_handler;
        
	    query["on"]("child_added", add_child_handler);
	    query["on"]("child_removed", remove_child_handler);
	    query["on"]("child_moved", change_child_handler);
	    query["on"]("child_changed", change_child_handler);  	        
    };
    
    ItemListKlassProto.auto_child_update_stop = function ()
	{
        if (!this.query)
            return;
        
        this.query["off"]("child_added", this.add_child_handler);
	    this.query["off"]("child_removed", this.remove_child_handler);
	    this.query["off"]("child_moved", this.change_child_handler);
	    this.query["off"]("child_changed", this.change_child_handler);
        this.add_child_handler = null;
        this.remove_child_handler = null;
        this.change_child_handler = null;	
        this.query = null;
	};	    

    ItemListKlassProto.auto_all_update_start = function(query)
    {
        var self=this;
        var read_item = function(childSnapshot)
        {
            self.add_item(childSnapshot, null, true);
        };            
        var items_fetch_handler = function (snapshot)
        {           
            self.Clean();
            snapshot["forEach"](read_item);                
            self.update_itemID2Index();   
            if (self.onItemsFetch)
                self.onItemsFetch(self.items)
        };
        
        this.query = query;
        this.items_fetch_handler = items_fetch_handler;
        
        query["on"]("value", items_fetch_handler);    
    };
    
    ItemListKlassProto.auto_all_update_stop = function ()
	{
        if (!this.query)
            return;
        
        this.query["off"]("value", this.items_fetch_handler);
        this.items_fetch_handler = null;
        this.query = null;
	};	      
    
	var clean_table = function (o)
	{
	    var k;
	    for (k in o)
	        delete o[k];
	};
    // internal 
    // --------------------------------------------------------------------------
	
	window.FirebaseItemListKlass = ItemListKlass;
}()); 