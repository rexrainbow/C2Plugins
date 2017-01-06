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
        this.error = null;        
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
                    on_failed(error);               
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
        this.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestIDSuccessful, this);
    }; 
    instanceProto.on_getID_failed = function (UserID_)
    { 
        this.exp_UserID = UserID_;        
        this.exp_ID = "";
        this.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestIDError, this);
    }; 
    
    instanceProto.on_getUserID_successful = function (UserID_, ID_)
    {
        this.exp_UserID = UserID_;
        this.exp_ID = ID_;        
        this.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestUserIDSuccessful, this);
    }; 
    instanceProto.on_getUserID_failed = function (ID_)
    { 
        this.exp_UserID = "";
        this.exp_ID = ID_;              
        this.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestUserIDError, this);
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

        return null;        
	};

	var _get_value = function (obj_)
	{	    
	    if (typeof(obj_) !== "object")
	        return null;
	        	    
	    for (var k in obj_)
	        return obj_[k];
        
        return null;
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnRequestIDSuccessful = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnRequestIDError = function ()
	{
	    return true;
	}; 
	
	Cnds.prototype.OnRequestUserIDSuccessful = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnRequestUserIDError = function ()
	{
	    return true;
	}; 
	
	Cnds.prototype.OnRemoveUserIDSuccessful = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnRemoveUserIDError = function ()
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
                self.error = null;
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
        
        var on_read_failure = function(error)
        {
            self.error = error;
            self.on_getID_failed(UserID);
        };
        var query = this.get_ref()["orderByValue"]()["equalTo"](UserID)["limitToFirst"](1);
        query["once"]("value", on_read, on_read_failure);
	};
	
    Acts.prototype.RequestGetUserID = function (ID)
	{
        if (ID === "")
            return;
             
        var self = this;             
        var on_read = function(snapshot)
        {
            var return_UserID = snapshot["val"]();
            self.error = null;            
            if (return_UserID == null)
                self.on_getUserID_failed(ID);
            else
                self.on_getUserID_successful(return_UserID, ID);
        };
        var on_read_failure = function(error)
        {
            self.error = error;
            self.on_getUserID_failed(ID);
        };
        
        var ID_ref = this.get_ID_ref(ID);                        
        ID_ref["once"]("value", on_read, on_read_failure);
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
            self.error = null;            
            if (GETCMD)  // get existed ID
            {
                if (return_ID == null)
                    self.on_getID_failed(UserID);
                else
                    self.on_getID_successful(UserID, return_ID); 
            }
            else
            {
                if (return_ID == null)  // try set new ID
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
        
        var on_read_failure = function(error)
        {
            self.error = error;
            self.on_getID_failed(UserID);
        };        
                
        var query = this.get_ref()["orderByValue"]()["equalTo"](UserID)["limitToFirst"](1);
        query["once"]("value", on_read, on_read_failure);
	};	

    Acts.prototype.RemoveUserID = function (UserID)
	{               
	    if (UserID === "")
	        return;
	        
        var self = this;    
        
	    var onComplete = function(error) 
	    {
            self.exp_UserID = UserID;
            self.error = error;   
            if (error)
                self.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRemoveUserIDError, self); 
            else
                self.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRemoveUserIDSuccessful, self);  
        };
        var on_read = function(snapshot)
        {
            var result = snapshot["val"]();    // { ID:UserID }
            var return_ID = _get_key(result);
            if (return_ID == null)
            {
                onComplete();
            }
            else
            {
                var ref = self.get_ID_ref(return_ID);
                ref["set"](null, onComplete);
            }      
        };
        var on_read_failure = function(error)
        {
            onComplete(error);
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
	
	Exps.prototype.LastErrorCode = function (ret)
	{
        var code;
	    if (this.error)
            code = this.error["code"];
		ret.set_string(code || "");
	}; 
	
	Exps.prototype.LastErrorMessage = function (ret)
	{
        var s;
	    if (this.error)
            s = this.error["serverResponse"];
		ret.set_string(s || "");
	};	      
}());
