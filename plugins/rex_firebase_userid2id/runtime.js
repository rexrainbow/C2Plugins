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
	var input_text = "";
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
	
	instanceProto.get_UserID_ref = function(UserID)
	{
        return this.get_ref("UserIDs")["child"](UserID);
	};	
	
	instanceProto.get_ID_ref = function(ID)
	{
        return this.get_ref("IDs")["child"](ID);
	};		
	
	instanceProto.try_getID = function(UserID, ID, on_retry)
	{
	    var ID_ref = this.get_ID_ref(ID);
	    var self = this;
        var on_write_ID = function(current_value)
        {
            if (current_value === null)  //this ID has not been occupied
                return UserID;
            else
                return;    // Abort the transaction
        };
        var on_getID_complete = function(error, committed, snapshot) 
        {
            if (error || !committed) 
            {
                if (on_retry)
                    on_retry();               
            }
            else 
            {
                var UserID_ref = self.get_UserID_ref(UserID);
                UserID_ref["set"](ID, on_setID_complete);
                self.exp_UserID = UserID;
                self.on_getID_successful(ID);         
            }            
        };
        var on_setID_complete = function(error)
        {
            if (error)
                log("[UserID2ID] Error: set correspond ID failed!");
        };
        ID_ref["transaction"](on_write_ID, on_getID_complete);
	};  

	instanceProto.generate_ID = function(digits)
	{
        var ID = Math.floor(Math.random()*Math.pow(10, digits)).toString();
        var i, zeroes = digits - ID.length;
		for (i=0; i<zeroes; i++)
			ID += "0";        
        return ID;
	};     
	
    instanceProto.on_getID_successful = function (ID_)
    {
        this.exp_ID = ID_;
        this.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestIDSuccessfully, this);
    }; 
    instanceProto.on_getID_failed = function ()
    { 
        this.exp_ID = "";
        this.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestIDFailed, this);
    }; 
    
    instanceProto.on_getUserID_successful = function (UserID_)
    {
        this.exp_UserID = UserID_;
        this.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestUserIDSuccessfully, this);
    }; 
    instanceProto.on_getUserID_failed = function ()
    { 
        this.exp_UserID = "";
        this.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestUserIDFailed, this);
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
        var UserID_ref = this.get_UserID_ref(UserID);   
        var on_read_UserID = function(snapshot)
        {
            var return_ID = snapshot["val"]();
            if (return_ID == null)
            {
                try_get_id();
            }
            else
            {
                // get ID
                self.exp_UserID = UserID;
                self.on_getID_successful(return_ID);
            }
        };
        var try_get_id = function()
        {
            if (retry_cnt == 0)
            {
                // failed
                self.exp_UserID = UserID;
                self.on_getID_failed();
            }
            else
            {
                retry_cnt -= 1;            
                var newID = self.generate_ID(digits);
                self.try_getID(UserID, newID, try_get_id);
            }
        };
                
        UserID_ref["once"]("value", on_read_UserID);
	};
	
    Acts.prototype.RequestGetUserID = function (ID)
	{
        if (ID === "")
            return;
             
        var self = this;             
        var ID_ref = this.get_ID_ref(ID);
        var on_read_ID = function(snapshot)
        {
            var return_UserID = snapshot["val"]();
            self.exp_ID = ID;     
            if (return_UserID == null)
                self.on_getUserID_failed();
            else
                self.on_getUserID_successful(return_UserID);
        };
                        
        ID_ref["once"]("value", on_read_ID);
	};	
	
    Acts.prototype.RequestTryGetID = function (UserID, ID)
	{
	    if ((UserID === "") || (ID === ""))
	        return;
	        
	    var GETCMD = (ID == null);
        var self = this;             
        var UserID_ref = this.get_UserID_ref(UserID);
        var on_read_UserID = function(snapshot)
        {
            var return_ID = snapshot["val"]();
            if (GETCMD)  // get existed ID
            {
                self.exp_UserID = UserID;
                if (return_ID == null)
                    self.on_getID_failed();
                else
                    self.on_getID_successful(return_ID); 
            }
            else
            {
                if (return_ID === null)  // try set new ID
                    self.try_getID(UserID, ID, on_getID_failed);
                else                     // ID is existed
                {
                    self.exp_UserID = UserID;
                    if (return_ID != ID)  
                        self.on_getID_failed();
                    else
                        self.on_getID_successful(ID); 
                }                        
            }        
        };
        var on_getID_failed = function ()
        {
            self.exp_UserID = UserID;
            self.on_getID_failed();
        };
                
        UserID_ref["once"]("value", on_read_UserID);
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