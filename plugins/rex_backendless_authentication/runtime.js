// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Backendless_Authentication = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Backendless_Authentication.prototype;
		
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
        this.identity = this.properties[0];
        this.userData = {};  
        this.lastError = null;
	}; 
    
    var getCurrentUserProperty = function (prop, default_value)
    {
        var user = window["Backendless"]["UserService"]["getCurrentUser"]();
        return window.BackendlessGetItemValue(user, prop, default_value);
    };
    
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{       
        var prop = [
            {"name":"UserID", "value":getCurrentUserProperty("objectId", "") ,"readonly":true},                                      
            {"name":"Name", "value":getCurrentUserProperty("name", "") ,"readonly":true},
            {"name":"Email", "value":getCurrentUserProperty("email", "") ,"readonly":true},                        
        ];
        var user = window["Backendless"]["UserService"]["getCurrentUser"]();
        if (user)
        {
            for (var n in user)
            {
                if ( (n === "objectId") ||
                     (n === "name") ||
                     (n === "email") ||
                     (n === "__meta") )
                     continue;
                else if ( (n === "lastLogin") ||
                             (n === "created") ||
                             (n === "updated") )
                    prop.push({"name":n, "value":(new Date(user[n])).toLocaleString(),"readonly":true});
                else
                    prop.push({"name":n, "value":user[n] ,"readonly":true});
            }
        }
        
        var self = this;
		propsections.push({
			"title": this.type.name,
			"properties": prop
		});	
	};	
	/**END-PREVIEWONLY**/	     
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      

	Cnds.prototype.EmailPassword_OnCreateAccountSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.EmailPassword_OnCreateAccountError = function ()
	{
	    return true;
	}; 
	
	Cnds.prototype.EmailPassword_OnSendPasswordResultEmailSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.EmailPassword_OnSendPasswordResultEmailError = function ()
	{
	    return true;
	}; 	

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

	Cnds.prototype.OnLoggedOutError = function ()
	{
	    return true;
	}; 		
    
	Cnds.prototype.IsLogin = function ()
	{
        return ( window["Backendless"]["UserService"]["getCurrentUser"]() != null );
	};	

	Cnds.prototype.OnGetValidSession = function ()
	{
	    return true;
	}; 		

	Cnds.prototype.OnGetInvalidSession = function ()
	{
	    return true;
	};     
   
	Cnds.prototype.OnUpdateUserDataSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnUpdateUserDataError = function ()
	{
	    return true;
	}; 		    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	var getHandler = function(self, successTrig, errorTrig)
	{
        var on_success = function( )
        {
            self.lastError = null;  
            self.runtime.trigger(successTrig, self);     
        };
        var on_error = function( err )
        {
            self.lastError = err;
            self.runtime.trigger(errorTrig, self);
        };
        return new window["Backendless"]["Async"]( on_success, on_error );        
    };
    
	var getLoginHandler = function(self)
	{
        var on_success = function( user )
        {
            self.lastError = null;  
            self.runtime.trigger(cnds.OnLoginSuccessfully, self);     
        };
        var on_error = function( err )
        {
            self.lastError = err;
            self.runtime.trigger(cnds.OnLoginError, self);
        };
        return new window["Backendless"]["Async"]( on_success, on_error );        
    };    

    Acts.prototype.EmailPassword_CreateAccount = function (userID, p_)
	{
        this.userData[this.identity] = userID;
        this.userData["password"] = p_;        
        var user = new window["Backendless"]["User"]();
        user = window.BackendlessFillData(this.userData, user);
        var handler = getHandler(this, cnds.EmailPassword_OnCreateAccountSuccessfully, cnds.EmailPassword_OnCreateAccountError);
        window["Backendless"]["UserService"]["register"]( user, handler );
	}; 

    Acts.prototype.EmailPassword_Login = function (userID, p_, r_)
	{        
        var handler = getLoginHandler(this);
        window["Backendless"]["UserService"]["login"]( userID, p_, (r_===1), handler );      
	};
	
    Acts.prototype.EmailPassword_SendPasswordResultEmail = function (e_)
	{
        var handler = getHandler(this, cnds.EmailPassword_OnSendPasswordResultEmailSuccessfully, cnds.EmailPassword_OnSendPasswordResultEmailError);
        window["Backendless"]["UserService"]["restorePassword"]( e_, handler );             
	};

    Acts.prototype.Facebook_Login = function (scope_)
	{
        var fieldsMapping = {
            "email":"email",
            "name":"name",
            };
        var handler = getLoginHandler(this);
        window["Backendless"]["UserService"]["loginWithFacebook"](fieldsMapping, scope_, handler );          
	};

    Acts.prototype.FacebookSDK_Login = function (access_token, r_, scope_)
	{
        var fieldsMapping = {"email":"email","name":"name"};    
        var handler = getLoginHandler(this);
        window["Backendless"]["UserService"]["loginWithFacebookSdk"](fieldsMapping, handler); 
       
	};		

    Acts.prototype.Twitter_Login = function ()
	{
        var fieldsMapping = {"email":"email","name":"name"};  // TODO
        var handler = getLoginHandler(this);
        window["Backendless"]["UserService"]["loginWithTwitter"](fieldsMapping, p_, handler );              
	};
		
    Acts.prototype.LoggingOut = function ()
	{
        var handler = getHandler(this, cnds.OnLoggedOut, cnds.OnLoggedOutError);
        window["Backendless"]["UserService"]["logout"]( handler );
	};
		
    Acts.prototype.IsValidLogin = function ()
	{
        var handler = getHandler(this, cnds.OnGetValidSession, cnds.OnGetInvalidSession);
        window["Backendless"]["UserService"]["isValidLogin"]( handler );
	};    
    
    Acts.prototype.SetValue = function (key_, value_)
	{
        this.userData[key_] = value_;
	};
	
    Acts.prototype.SetBooleanValue = function (key_, is_true)
	{
        this.userData[key_] = (is_true === 1);    
	};       
	
    Acts.prototype.UpdateUserData = function ()
	{
        var user = window["Backendless"]["UserService"]["getCurrentUser"]();
        if (user == null)
        {
            this.runtime.trigger(cnds.OnUpdateUserDataError, this);     
            return;
        }
        
        user = window.BackendlessFillData(this.userData, user);        
        var handler = getHandler(this, cnds.OnUpdateUserDataSuccessfully, cnds.OnUpdateUserDataError);
        window["Backendless"]["UserService"]["update"]( user, handler );
	}; 		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	            
    var getErrorProp = function(err, prop)
    {
        if (err == null)
            return "";
        else if (typeof(err) === "object")
            return err[prop];
        else
            return err;
    }
	Exps.prototype.ErrorCode = function (ret)
	{
		ret.set_string( getErrorProp(this.lastError, "code") );
	}; 
	
	Exps.prototype.ErrorMessage = function (ret)
	{
		ret.set_string( getErrorProp(this.lastError, "message") );
	}; 	
    
	Exps.prototype.UserID = function (ret)
	{
		ret.set_string( getCurrentUserProperty("objectId", "") );
	}; 	
	//Exps.prototype.Provider = function (ret)
	//{
	//	ret.set_string( getCurrentUserProperty("socialAccount", "") );
	//}; 	

	Exps.prototype.Email = function (ret)
	{
		ret.set_string( getCurrentUserProperty("email", "") );
	};		
	Exps.prototype.UserName = function (ret)
	{
		ret.set_string( getCurrentUserProperty("name", "") );
	};

	//Exps.prototype.PhotoURL = function (ret)
	//{
	//	ret.set_string( getCurrentUserProperty("photoURL", "") );        
	//};
    
	Exps.prototype.UserData = function (ret, key, default_value)
	{
		ret.set_any( getCurrentUserProperty(key, default_value) );
	};

    
    var cnds = cr.plugins_.Rex_Backendless_Authentication.prototype.cnds;
}());