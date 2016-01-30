// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_parse_QuickLogin = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_parse_QuickLogin.prototype;
		
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
	    jsfile_load("parse-1.3.2.min.js");
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
	    if (!window.RexC2IsParseInit)
	    {
	        window["Parse"]["initialize"](this.properties[0], this.properties[1]);
	        window.RexC2IsParseInit = true;
	    }
	    
        this.last_error = null;
        this.current_user = null;   // valid after login	    
	};
	
	instanceProto.OnLoginSuccessfully = function()
	{ 
	    this.runtime.trigger(cr.plugins_.Rex_parse_QuickLogin.prototype.cnds.OnLoginSuccessfully, this);
	};	
	
	instanceProto.OnLoginError = function()
	{ 
	    this.runtime.trigger(cr.plugins_.Rex_parse_QuickLogin.prototype.cnds.OnLoginError, this);
	};		
	
		  
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
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
     Acts.prototype.QuickLogin = function (username_, password_)
	{
	    var self = this;
	    
	    var OnLoginSuccessfully = function(user)
	    { 	      
	        self.current_user = user;  
	        self.runtime.trigger(cr.plugins_.Rex_parse_QuickLogin.prototype.cnds.OnLoginSuccessfully, self);
	    };	
	    
	    var OnLoginError = function(user, error)
	    {     
	        self.current_user = user;  
            self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_parse_QuickLogin.prototype.cnds.OnLoginError, self);
	    };	
		    
		// step 3
	    var login_again = function (username, password)
	    {	 
	        var handler = {"success": OnLoginSuccessfully,
                           "error": OnLoginError};
                           
            window["Parse"]["User"]["logIn"](username, password, handler);	   
        };
        
        // step 2
	    var try_signingUp = function (username, password)
	    {
	        var _on_success = function (user)
	        {
	            login_again(username, password);
	        };
	        
	        var handler = {"success": _on_success,
                           "error": OnLoginError};
	        var user = new window["Parse"]["User"]();
            user["set"]("username", username);
            user["set"]("password", password);
            user["signUp"](null, handler);
	    };        	
        
        // step 1
	    var try_login = function (username, password)
	    {	 
	        var _on_error = function (user, error) 
	        {
                try_signingUp(username, password);	            
	        };
	        
	        var handler = {"success": OnLoginSuccessfully,
                           "error": _on_error};                          
                           
            window["Parse"]["User"]["logIn"](username, password, handler);   
        };            
        
        try_login(username_, password_);         
	};		
		
    Acts.prototype.LoggingOut = function ()
	{
	    window["Parse"]["User"]["logOut"]();
	};		
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.ErrorCode = function (ret)
	{
	    var val = (!this.last_error)? "": this.last_error["code"];    
		ret.set_string(val);
	}; 
	
	Exps.prototype.ErrorMessage = function (ret)
	{
	    var val = (!this.last_error)? "": this.last_error["message"];    
		ret.set_string(val);
	}; 
	
	Exps.prototype.UserID = function (ret)
	{
	    var val = (!this.current_user)? "": this.current_user["id"];    
		ret.set_string(val);
	}; 	
	
	Exps.prototype.UserName = function (ret)
	{
	    var val = (!this.current_user)? "": this.current_user["get"]("username");    
		ret.set_string(val);
	}; 			
}());