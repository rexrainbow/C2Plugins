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
	    this.rootpath = this.properties[0] + "/"; 
                
        this.exp_ID = "";
        this.exp_UserID = "";
	};
	
	instanceProto.get_ref = function(k)
	{
        if (k == null)
            k = "";

        return new window["Firebase"](this.rootpath + k + "/");
	};
	
	instanceProto.try_getID = function(ID, userID, on_successful, on_failed)
	{
	    var ID_ref = this.get_ref()["child"](ID);
        var on_write_id = function(current_value)
        {
            if (current_value === null)  //this id has not been occupied
                return userID;
            else
                return;    // Abort the transaction
        };
        var on_complete = function(error, committed, snapshot) 
        {
            if (error || !committed) 
            {
                if(on_failed)
                    on_failed(ID);                
            }
            else 
            {
                ID_ref["setPriority"](userID);
                if(on_successful)
                    on_successful(ID);               
            }            
        };
        ID_ref["transaction"](on_write_id, on_complete);
	};  

	instanceProto.generate_id = function(digits)
	{
        var id = Math.floor(Math.random()*Math.pow(10, digits)).toString();
        var i, zeroes = digits - id.length;
		for (i=0; i<zeroes; i++)
			id += "0";        
        return id;
	};     
	
	var get_first_key = function(o)
	{
	    var k;
	    for (var k in o)
	        return k
	};
	
	var get_first_value = function(o)
	{
	    var k;
	    for (var k in o)
	        return o[k];
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
 
    Acts.prototype.RequestGetRandomID = function (userID, digits, retry)
	{
        if (userID === "")
            return;
            
        var self = this;            
        var retry_cnt = retry;    
        var ref = this.get_ref();
        var on_read = function(snapshot)
        {
            var ID2UserID = snapshot["val"]();
            if (ID2UserID === null)
            {
                try_get_id();
            }
            else
            {
                // get id
                on_result(get_first_key(ID2UserID));
            }
        };
        var try_get_id = function()
        {
            if (retry_cnt == 0)
            {
                // failed
                on_result();
            }
            else
            {
                retry_cnt -= 1;            
                var newid = self.generate_id(digits);
                self.try_getID(newid, userID, on_result, try_get_id);
            }
        };
        
        var on_result = function (ID)
        { 
            if (ID !== null)
            {
                self.exp_ID = ID;
                self.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestIDSuccessfully, self);
            }
            else
            {
                self.exp_ID = "";
                self.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestIDFailed, self);
            }
        };
        
        ref["equalTo"](userID)["once"]("value", on_read);
	};
	
    Acts.prototype.RequestGetUserID = function (ID)
	{
        if (ID === "")
            return;
             
        var self = this;             
        var ref = this.get_ref()["child"](ID);
        var on_read = function(snapshot)
        {
            var userID = snapshot["val"]();
            if (userID === null)
            {
                self.exp_UserID = "";
                self.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestUserIDFailed, self);
            }
            else
            {
                self.exp_UserID = userID;
                self.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestUserIDSuccessfully, self);
            }
        };
             
        ref["once"]("value", on_read);
	};	
	
    Acts.prototype.RequestTrySetID = function (userID, ID)
	{
        if ((userID === "") || (ID === ""))
            return;
             
        var self = this;             
        var ref = this.get_ref();
        var on_read = function(snapshot)
        {
            var ID2UserID = snapshot["val"]();
            if (ID2UserID === null)
            {
                self.try_getID(ID, userID, on_successful, on_failed);
            }
            else
            {
                if (get_first_key(ID2UserID) != ID)
                    on_failed();
                else
                    on_successful(ID);
                
            }           
        };
        var on_successful = function (newid)
        {
            self.exp_ID = newid;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestIDSuccessfully, self);
        };        
        var on_failed = function ()
        { 
            self.exp_ID = "";
            self.runtime.trigger(cr.plugins_.Rex_Firebase_UserID2ID.prototype.cnds.OnRequestIDFailed, self);
        };
        
        ref["equalTo"](userID)["once"]("value", on_read);
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