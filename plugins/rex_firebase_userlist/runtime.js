// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_Userlist = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var input_text = "";
	var pluginProto = cr.plugins_.Rex_Firebase_Userlist.prototype;
		
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
        
        this.myUser_info = {"id":"",
                            "name": ""};
        // ref cache
        this.ref_cache = {};        
	};
	
	instanceProto.get_ref = function(k)
	{
	    if (!this.ref_cache.hasOwnProperty(k))
	        this.ref_cache[k] = new window["Firebase"](this.rootpath + k);
	        
        return this.ref_cache[k];
	};	
    
    // Login
    instanceProto.Login = function ()
	{     
        var presence_ref = this.get_ref("presence")["child"](this.myUser_info["id"]);

        var self = this;            
        var login = function(snapshot)
        {
            presence_ref["onDisconnect"]()["update"]({"staus":"Offline"});
            
            var update_info = {};
            if (snapshot.val() == null)
            {
                // add new user
                update_info["id"] = self.myUser_info["id"];                
                update_info["name"] = self.myUser_info["name"];
            }                
            update_info["staus"] = "Online";
              
	        var on_complete = function(error) 
            {
                if (error === null) 
                {
                    self.is_loggin = true;
                    self.runtime.trigger(cr.plugins_.Rex_Firebase_Userlist.prototype.cnds.OnLoginSuccessfully, self);                
                } 
                else 
                {
                    self.runtime.trigger(cr.plugins_.Rex_Firebase_Userlist.prototype.cnds.OnLoginError, self);
                }
            
            }; 
                                         
            presence_ref["update"](update_info, on_complete);            
        };
    
        presence_ref["once"]("value", login);        
	};  

    instanceProto.LoggingOut = function ()
	{
        var presence_ref = this.get_ref("presence")["child"](this.myUser_info["id"]);
        var self = this;
	    var on_complete = function(error) 
        {
            presence_ref["onDisconnect"]()["cancel"]();        
            self.is_loggin = false;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Userlist.prototype.cnds.OnLoggedOut, self);
        };      
        presence_ref["update"]["update"]({"staus":"Offline"}, on_complete);
	};	
    // Login    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds(); 
    
	Cnds.prototype.OnLoginSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnLoginError = function ()
	{
	    return true;
	}; 

	Cnds.prototype.OnLoggedOut = function ()
	{
	    return true;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Login = function (userID, name)
	{
        if (this.is_loggin)
            this.LoggingOut();
            
        this.myUser_info["id"] = userID;
        this.myUser_info["name"] = name; 
        this.Login();        
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
				 	
}());