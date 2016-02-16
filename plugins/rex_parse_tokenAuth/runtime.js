// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Parse_TokenAuth = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Parse_TokenAuth.prototype;
		
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
        this.initial_data = {};
        this.last_error = null;	 
        this.current_user = null;   // valid after login    
        this.valid_token = {type:null, token:null};
	    this.exp_LastToken = {type:"", token:""};
	};

	instanceProto.logging_out = function()
	{ 
	    window["Parse"]["User"]["logOut"]();
	    this.current_user = null;   // valid after login
    };

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
    
	Cnds.prototype.OnCreateAccountSuccess = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnCreateAccountError = function ()
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
    
	Cnds.prototype.OnBindSuccess = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnBindError = function ()
	{
	    return true;
	};		
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.CreateAccount = function (type, token)
	{
	    if (token == null)
	        token = null;
        this.exp_LastToken.type = type;
        this.exp_LastToken.token = (token === null)? "": token;    
        
	    var self=this;        
	    var on_success = function (params)
	    {
            self.exp_LastToken.type = params["token"]["type"];
            self.exp_LastToken.token = params["token"]["token"];        
	        self.runtime.trigger(cr.plugins_.Rex_Parse_TokenAuth.prototype.cnds.OnCreateAccountSuccess, self);  
	    };
	    
	    var on_error = function (error)
	    {
            self.last_error = error;
            self.runtime.trigger(cr.plugins_.Rex_Parse_TokenAuth.prototype.cnds.OnCreateAccountError, self);          
	    };
	    var handler = {"success":on_success, "error":on_error};
        var params = { "token": {"type": type, "token": token},
                       "data":  this.initial_data};
	    window["Parse"]["Cloud"]["run"]("C2RexTokenAuth_CreateAccount", params, handler);
        this.initial_data = {};	    
	};
    
    Acts.prototype.Login = function (type, token)
	{
        this.exp_LastToken.type = type;
        this.exp_LastToken.token = token;    
	    var self=this;
        
        var become_user = function(sessionToken)
        {
	        var on_success = function (user)
	        {
                self.current_user = user; 
                self.valid_token.type = type;
                self.valid_token.token = token; 
                self.update_login_counter(user);                    
	            self.runtime.trigger(cr.plugins_.Rex_Parse_TokenAuth.prototype.cnds.OnLoginSuccess, self);  
	        };
	    
	        var on_error = function (error)
	        {
                self.last_error = error;
                self.runtime.trigger(cr.plugins_.Rex_Parse_TokenAuth.prototype.cnds.OnLoginError, self);          
	        };
	        var handler = {"success":on_success, "error":on_error};        
            window["Parse"]["User"]["become"](sessionToken, handler);
        };
        var get_sessionToken = function (type, token)
        {
	        var on_success = function (params)
	        {
                become_user(params["sessionToken"]);  
	        };
	    
	        var on_error = function (error)
	        {
                self.last_error = error;
                self.runtime.trigger(cr.plugins_.Rex_Parse_TokenAuth.prototype.cnds.OnLoginError, self);          
	        };
	        var handler = {"success":on_success, "error":on_error};
            var params = { "token": {"type": type, "token": token} };
	        window["Parse"]["Cloud"]["run"]("C2RexTokenAuth_Login", params, handler);
        }
        get_sessionToken(type, token);
	}; 
	
    Acts.prototype.LoggingOut = function ()
	{
	    this.logging_out();
	};	

    Acts.prototype.Bind = function (type, token)
	{
	    if (this.current_user === null)
	    {
	        alert("No login account found.");
	        return;
	    }
	        
	    var self=this;
	    var on_success = function (params)
	    {
	        self.runtime.trigger(cr.plugins_.Rex_Parse_TokenAuth.prototype.cnds.OnBindSuccess, self);  
	    };
	    
	    var on_error = function (error)
	    {
            self.last_error = error;
            self.runtime.trigger(cr.plugins_.Rex_Parse_TokenAuth.prototype.cnds.OnBindError, self);          
	    };
	    	
	    var handler = {"success":on_success, "error":on_error};
        var params = {"target": {"type": type, "token": token},
                      "source": {"type": this.valid_token.type, "token": this.valid_token.token}};
	    window["Parse"]["Cloud"]["run"]("C2RexTokenAuth_BindToken", params, handler);
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
	    var val = (!this.last_error)? "": this.last_error["code"];    
		ret.set_int(val);
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
	
	Exps.prototype.Email = function (ret)
	{
	    var val = (!this.current_user)? "": this.current_user["get"]("email");    
		ret.set_string(val);
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
		ret.set_int(count);
	}; 	
    
	Exps.prototype.LastToken = function (ret)
	{
		ret.set_string(this.exp_LastToken.token);
	};
    
	Exps.prototype.LastTokenType = function (ret)
	{
		ret.set_string(this.exp_LastToken.type);
	};	
	
}());