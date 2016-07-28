// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Parse_Authentication = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Parse_Authentication.prototype;
		
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
	    this.login_counter_enable = (this.properties[0] === 1);        
	    if (this.properties[1] === 1)
	    {
	        window["Parse"]["User"]["enableRevocableSession"]();
	    }
        
	    this.exp_LoginCount = 0;
	    
        this.isFirstLogin = false;
        this.initial_data = {};     // add init data when sign up
        this.last_error = null;	 
        this.current_user = null;   // valid after login
        this.isLogin = false;
	};

	instanceProto.logging_out = function()
	{ 
        this.isLogin = false;    
	    window["Parse"]["User"]["logOut"]();
	    this.current_user = null;   // valid after login
    };

	instanceProto.do_invalid_session_token_handler = function(error, handler)
	{ 
	    var is_invalid_session_token = (error["code"] === window["Parse"]["Error"]["INVALID_SESSION_TOKEN"]);
	    if (is_invalid_session_token)
	    {	    
	        this.logging_out();
	        if (handler)
	            handler();
	        	        
	    }
	    return is_invalid_session_token;	    
    };    
	instanceProto.get_user_save = function(initial_data)
	{ 
	    var user = new window["Parse"]["User"]();
        for(var n in initial_data)
        {
            user["set"](n, initial_data[n]);
            delete initial_data[n];
        }
        return user;
    };       

    // update login count when login
	instanceProto.update_login_counter = function(user)
	{
	    if (!this.login_counter_enable)
	        return;
	        
	    this.exp_LoginCount = (user["get"]("loginCounter") || 0) + 1;
	    user["increment"]("loginCounter");
        user["save"](null);	    
    };        
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.UsernamePassword_OnCreateAccountSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.UsernamePassword_OnCreateAccountError = function ()
	{
	    return true;
	}; 

	Cnds.prototype.UsernamePassword_OnSendPasswordResultEmailSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.UsernamePassword_OnSendPasswordResultEmailError = function ()
	{
	    return true;
	}; 	
	
	Cnds.prototype.OnLoginSuccess = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnLoginError = function ()
	{
	    return true;
	};

	Cnds.prototype.IsLogin = function ()
	{
	    return (this.current_user !== null);
	};
    
	Cnds.prototype.IsFirstLogin = function ()
	{
	    return this.isFirstLogin;
	};
 	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.UsernamePassword_CreateAccount = function (n_, p_, e_)
	{
	    var self=this;     
        var sign_up = function(user)
        {
	        var on_success = function ()
	        {
	            self.runtime.trigger(cr.plugins_.Rex_Parse_Authentication.prototype.cnds.UsernamePassword_OnCreateAccountSuccessfully, self);  
	        };
	        
	        var on_error = function (user, error)
	        {
	            var is_invalid_session_token = self.do_invalid_session_token_handler(error, sign_up);
	            if (!is_invalid_session_token)
	            {
	                self.last_error = error;
                    self.runtime.trigger(cr.plugins_.Rex_Parse_Authentication.prototype.cnds.UsernamePassword_OnCreateAccountError, self);          
                }
	        };
	                
            var handler = {"success":on_success, "error":on_error}; 
            user["signUp"](null, handler);
        }

        this.initial_data["username"] = n_;
        this.initial_data["password"] = p_;
        if (e_ !== "")
        {
            this.initial_data["email"] = e_;
        }
        var user = this.get_user_save(this.initial_data);                
        sign_up(user);
	}; 
	
    Acts.prototype.UsernamePassword_Login = function (n_, p_)
	{
	    var self=this;
	    var login = function ()
	    {
	        var on_success = function (user)
	        {
                self.isLogin = true;
	            self.current_user = user;  
	            self.update_login_counter(user);      
	            self.runtime.trigger(cr.plugins_.Rex_Parse_Authentication.prototype.cnds.OnLoginSuccess, self);  
	        };
	        
	        var on_error = function (user, error)
	        {
	            var is_invalid_session_token = self.do_invalid_session_token_handler(error, login);
	            if (!is_invalid_session_token)
	            {	        
                    self.isLogin = false;             
	                self.current_user = user;
	                self.last_error = error;
                    self.runtime.trigger(cr.plugins_.Rex_Parse_Authentication.prototype.cnds.OnLoginError, self);          
                }
	        };
	    	        
	        var handler = {"success":on_success, "error":on_error};	 
            window["Parse"]["User"]["logIn"](n_, p_, handler);
        }
        
        login();
	}; 
	
    Acts.prototype.UsernamePassword_SendPasswordResultEmail = function (e_)
	{
	    var self=this;
	    var on_success = function ()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_Parse_Authentication.prototype.cnds.UsernamePassword_OnSendPasswordResultEmailSuccessfully, self);  
	    };
	    
	    var on_error = function (error)
	    {
	        self.last_error = error;
            self.runtime.trigger(cr.plugins_.Rex_Parse_Authentication.prototype.cnds.UsernamePassword_OnSendPasswordResultEmailError, self);          
	    };
	    
	    var handler = {"success":on_success, "error":on_error};	    
        window["Parse"]["User"]["requestPasswordReset"](e_, handler);
	};	
	
    Acts.prototype.LoggingOut = function ()
	{
	    this.logging_out();
	};	
	
    Acts.prototype.UsernamePassword_SignUpLogin = function (n_, p_)
	{    
        this.isFirstLogin = false;        
        var is_first_login = false;
        
	    var self = this;
	    
	    var OnLoginSuccess = function(user)
	    {
            self.isLogin = true;
            self.isFirstLogin = is_first_login;
	        self.current_user = user; 
	        self.update_login_counter(user);   	         
	        self.runtime.trigger(cr.plugins_.Rex_Parse_Authentication.prototype.cnds.OnLoginSuccess, self);
	    };	
	    
	    var OnLoginError = function(user, error)
	    {   
            self.isLogin = false;        
	        self.current_user = user;  
            self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_Authentication.prototype.cnds.OnLoginError, self);
	    };	
		    
		// step 3
	    var login_again = function (username, password)
	    {	 
            is_first_login = true;
	        var handler = {"success": OnLoginSuccess,
                           "error": OnLoginError};
                           
            window["Parse"]["User"]["logIn"](username, password, handler);	   
        };
        
        // step 2
	    var try_signingUp = function (username, password)
	    {
	        var on_success = function (user)
	        {
	            login_again(username, password);
	        };
	        
	        var on_error = function (user, error)
	        {
	            var is_invalid_session_token = self.do_invalid_session_token_handler(error, try_signingUp);
	            if (!is_invalid_session_token)
	            {	            
                    OnLoginError(user, error);      
                }
	        };
	        
	        var handler = {"success": on_success, "error": on_error};
            self.initial_data["username"] = n_;
            self.initial_data["password"] = p_;
            var user = self.get_user_save(self.initial_data);                         
            user["signUp"](null, handler);
	    };        	
        
        // step 1
	    var try_login = function (username, password)
	    {	 
	        var on_error = function (user, error) 
	        {
	            var is_invalid_session_token = self.do_invalid_session_token_handler(error, try_login);
	            if (!is_invalid_session_token)
	            {	            
	                try_signingUp(username, password);
                }
	        };
	        
	        var handler = {"success": OnLoginSuccess, "error": on_error};                                                     
            window["Parse"]["User"]["logIn"](username, password, handler);   
        };            
        
        try_login(n_, p_);          
	};	
    
    Acts.prototype.SetValue = function (key_, value_)
	{
        this.initial_data[key_] = value_;
	};
	
    Acts.prototype.SetBooleanValue = function (key_, is_true)
	{
        this.initial_data[key_] = (is_true === 1);    
	};    
		 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.ErrorCode = function (ret)
	{
        var val;
        if (this.last_error)
            val = this.last_error["code"];    
		ret.set_int(val || 0);
	}; 
	
	Exps.prototype.ErrorMessage = function (ret)
	{
        var val;
        if (this.last_error)
            val = this.last_error["message"];
		ret.set_string(val || "");
	}; 
	
	Exps.prototype.UserID = function (ret)
	{
        var val;
        if (this.current_user)
            val = this.current_user["id"];   
		ret.set_string(val || "");
	}; 	
	
	Exps.prototype.UserName = function (ret)
	{
        var val;
        if (this.current_user)
            val = this.current_user["get"]("username");    
		ret.set_string(val || "");
	}; 	
	
	Exps.prototype.Email = function (ret)
	{
        var val;
        if (this.current_user)
            val = this.current_user["get"]("email");    
		ret.set_string(val || "");
	}; 	
	
	Exps.prototype.LoginCount = function (ret)
	{
	    var count;
	    if (!this.login_counter_enable)
	        count = 0;
	    else if (!this.current_user)
	        count = 0;
	    else 
	        count = this.exp_LoginCount;
		ret.set_int(count || 0);
	}; 		
}());