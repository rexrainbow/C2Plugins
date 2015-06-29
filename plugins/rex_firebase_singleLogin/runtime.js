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
	    this.myUserID = null;
	};
	
	instanceProto.onDestroy = function ()
	{		
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
  	     
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	
	Cnds.prototype.OnSingleLoginSuccess = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnSingleLoginError = function ()
	{
	    return true;
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
	    var ref = this.get_ref(userID);
	    	     
	    var self = this;
        var on_write = function(current_value)
        {
            if (current_value === null)  //this userID has not been occupied
                return true;
            else
                return;    // Abort the transaction
        };
        var on_complete = function(error, committed, snapshot) 
        {
            if (error || !committed) 
            {
                self.myUserID = null;
                self.runtime.trigger(cr.plugins_.Rex_Firebase_SingleLogin.prototype.cnds.OnSingleLoginError, self);            
            }
            else   
            {
                ref["onDisconnect"]()["remove"]();
                self.myUserID = userID;
                self.runtime.trigger(cr.plugins_.Rex_Firebase_SingleLogin.prototype.cnds.OnSingleLoginSuccess, self);                
            }
        };
        	    
	    ref["transaction"](on_write, on_complete);
	};
 
    Acts.prototype.LoggingOut = function ()
	{ 
	    if (this.myUserID === null)
	        return;
	        
	    var ref = this.get_ref(this.myUserID);
	    ref["remove"]();
	    ref["onDisconnect"]()["cancel"]();
	};

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
}());