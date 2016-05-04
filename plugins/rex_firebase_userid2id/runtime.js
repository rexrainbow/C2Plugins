/*
<ID> - UserID

*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_UserID2ID = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_UserID2ID.prototype;
		
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
                
        this.exp_ID = "";
        this.exp_UserID = "";
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

	instanceProto.get_ID_ref = function(ID)
	{
        return this.get_ref()["child"](ID);
	};		
	
	instanceProto.try_getID = function(UserID, ID, on_failed)
	{
	    var ID_ref = this.get_ID_ref(ID);
	    var self = this;
 
        var on_write = function(current_value)
        {
            if (current_value === null)  //this ID has not been occupied
                return UserID;
            else
                return;    // Abort the transaction
        };
        var on_complete = function(error, committed, snapshot) 
        {
            if (error || !committed) 
            {
                if (on_failed)
                    on_failed();               
            }
            else
            {
                // done                
                self.on_getID_successful(UserID, ID);  
            };                    
        };
        ID_ref["transaction"](on_write, on_complete);
	};  

    instanceProto.on_getID_successful = function (UserID_, ID_)
    {
        this.exp_UserID = UserID_;
        this.exp_ID = ID_;
        this.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestIDSuccessfully, this);
    }; 
    instanceProto.on_getID_failed = function (UserID_)
    { 
        this.exp_UserID = UserID_;        
        this.exp_ID = "";
        this.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestIDFailed, this);
    }; 
    
    instanceProto.on_getUserID_successful = function (UserID_, ID_)
    {
        this.exp_UserID = UserID_;
        this.exp_ID = ID_;        
        this.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestUserIDSuccessfully, this);
    }; 
    instanceProto.on_getUserID_failed = function (ID_)
    { 
        this.exp_UserID = "";
        this.exp_ID = ID_;              
        this.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestUserIDFailed, this);
    }; 
    
	var generate_ID = function(digits)
	{
        var ID = Math.floor(Math.random()*Math.pow(10, digits)).toString();
        var i, zeroes = digits - ID.length;
		for (i=0; i<zeroes; i++)
			ID += "0";        
        return ID;
	};    
	
	var _get_key = function (obj_)
	{	    
	    if (typeof(obj_) !== "object")
	        return null;
	        
	    for (var k in obj_)
	        return k;
	};

	var _get_value = function (obj_)
	{	    
	    if (typeof(obj_) !== "object")
	        return null;
	        	    
	    for (var k in obj_)
	        return obj_[k];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnRequestIDSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnRequestIDFailed = function ()
	{
	    return true;
	}; 
	
	Cnds.prototype.OnRequestUserIDSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnRequestUserIDFailed = function ()
	{
	    return true;
	}; 	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
 
    Acts.prototype.RequestGetRandomID = function (UserID, digits, retry)
	{
        if (UserID === "")
            return;
            
        var self = this;            
        var retry_cnt = retry;          
        var try_get_id = function()
        {
            if (retry_cnt == 0)
            {
                // failed
                self.on_getID_failed(UserID);
            }
            else
            {
                retry_cnt -= 1;            
                var newID = generate_ID(digits);
                self.try_getID(UserID, newID, try_get_id);
            }
        };
        
        var on_read = function(snapshot)
        {
            var result = snapshot["val"]();    // { ID:UserID }
            if (result == null)
            {
                try_get_id();
            }
            else
            {
                // get ID
                var return_ID = _get_key(result);                
                self.on_getID_successful(UserID, return_ID);
            }
        };
        var query = this.get_ref()["orderByValue"]()["equalTo"](UserID)["limitToFirst"](1);
        query["once"]("value", on_read);
	};
	
    Acts.prototype.RequestGetUserID = function (ID)
	{
        if (ID === "")
            return;
             
        var self = this;             
        var on_read = function(snapshot)
        {
            var return_UserID = snapshot["val"]();
            if (return_UserID == null)
                self.on_getUserID_failed(ID);
            else
                self.on_getUserID_successful(return_UserID, ID);
        };
                        
        var ID_ref = this.get_ID_ref(ID);                        
        ID_ref["once"]("value", on_read);
	};	
	
    Acts.prototype.RequestTryGetID = function (UserID, ID)
	{
	    if ((UserID === "") || (ID === ""))
	        return;
	        
	    var GETCMD = (ID == null);
        var self = this;             
        var on_read = function(snapshot)
        {
            var result = snapshot["val"]();    // { ID:UserID }
            var return_ID = _get_key(result);
            if (GETCMD)  // get existed ID
            {
                if (return_ID == null)
                    self.on_getID_failed(UserID);
                else
                    self.on_getID_successful(UserID, return_ID); 
            }
            else
            {
                if (return_ID === null)  // try set new ID
                    self.try_getID(UserID, ID, on_getID_failed);
                else                     // ID is existed
                {
                    if (return_ID != ID)  
                        self.on_getID_failed(UserID);
                    else
                        self.on_getID_successful(UserID, ID); 
                }                        
            }        
        };
        var on_getID_failed = function ()
        {
            self.on_getID_failed(UserID);
        };
                
        var query = this.get_ref()["orderByValue"]()["equalTo"](UserID)["limitToFirst"](1);
        query["once"]("value", on_read);
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.ID = function (ret)
	{
		ret.set_string(this.exp_ID);
	};

	Exps.prototype.UserID = function (ret)
	{
		ret.set_string(this.exp_UserID);
	};	
	
}());
