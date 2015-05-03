// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_Authentication = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_Authentication.prototype;
		
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
        this.rootpath = this.properties[0]; 
        
        this.last_error = null;
        this.last_authData = null;
                
        var self = this;
        var onAuth_handler = function (authData)
        {
            if (authData) 
            {
                // user authenticated with Firebase
                //console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
            }
            else 
            {
                // user is logged out
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoggedOut, self);
            }
        };
        this.get_ref()["onAuth"](onAuth_handler);
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
	
	instanceProto.get_query = function(k)
	{
        return new window["Firebase"](this.rootpath + k);
	};
	     
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
	
	Cnds.prototype.EmailPassword_OnChangingPasswordSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.EmailPassword_OnChangingPasswordError = function ()
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
	
	Cnds.prototype.EmailPassword_OnDeleteUserSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.EmailPassword_OnDeleteUserError = function ()
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
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	var on_handler_get = function(self, success_trig, error_trig)
	{
	    var handler = function(error, authData) 
        {
            self.last_error = error;
            self.last_authData = authData;
            if (error === null) 
            {
                // get auth data by expression:UserID, and expression:Provider
                self.runtime.trigger(success_trig, self);                
            } 
            else 
            {
                // get error message by expression:ErrorCode and expression:ErrorMessage
                self.runtime.trigger(error_trig, self);
            }
        };
        return handler;
    };
	
    Acts.prototype.EmailPassword_CreateAccount = function (e_, p_)
	{
	    var reg_data = {"email":e_,  "password":p_ };
	    var handler = on_handler_get(this,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnCreateAccountSuccessfully,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnCreateAccountError);
	    this.get_ref()["createUser"](reg_data, handler);
	}; 

    var PRESISTING_TYPE = ["default", "sessionOnly", "never"];
    Acts.prototype.EmailPassword_Login = function (e_, p_, r_)
	{
	    var reg_data = {"email":e_,  "password":p_ };
	    var handler = on_handler_get(this,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginSuccessfully,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginError);
        var d = {"remember":PRESISTING_TYPE[r_]};
	    this.get_ref()["authWithPassword"](reg_data, handler, d);
	}; 	
	
    Acts.prototype.EmailPassword_ChangePassword = function (e_, old_p_, new_p_)
	{
	    var reg_data = {"email":e_,  "oldPassword ":old_p_,  "newPassword":new_p_};
	    var handler = on_handler_get(this,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnChangingPasswordSuccessfully,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnChangingPasswordError);
	    this.get_ref()["changePassword"](reg_data, handler);
	}; 
	
    Acts.prototype.EmailPassword_SendPasswordResultEmail = function (e_)
	{
	    var reg_data = {"email":e_};
	    var handler = on_handler_get(this,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnSendPasswordResultEmailSuccessfully,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnSendPasswordResultEmailError);
	    this.get_ref()["resetPassword"](reg_data, handler);
	};		
	
    Acts.prototype.EmailPassword_DeleteUser = function (e_, p_)
	{
	    var reg_data = {"email":e_,  "password":p_};
	    var handler = on_handler_get(this,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnDeleteUserSuccessfully,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnDeleteUserError);
	    this.get_ref()["removeUser"](reg_data, handler);
	};	
	
    Acts.prototype.Anonymous_Login = function (r_)
	{
	    var handler = on_handler_get(this,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginSuccessfully,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginError);
        var d = {"remember":PRESISTING_TYPE[r_]};
	    this.get_ref()["authAnonymously"](handler, d);
	};	
	
	var PROVIDER_TYPE = ["facebook", "twitter", "github", "google"];
    Acts.prototype.ProviderAuthentication_Login = function (provider_, t_, r_, scope_)
	{
	    var login_fn_name = (t_ == 0)? "authWithOAuthPopup":"authWithOAuthRedirect";	    
	    var provider = PROVIDER_TYPE[provider_];
	    var handler = on_handler_get(this,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginSuccessfully,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginError);
        var d = {"remember":PRESISTING_TYPE[r_],
                 "scopr":scope_};
	    this.get_ref()[login_fn_name](provider, handler, d);
	};

    Acts.prototype.AuthWithOAuthToken_FB = function (access_token, r_, scope_)
	{
        if (access_token == "")
        {        
	        if (typeof (FB) == null) 
		        return;
		
		    var auth_response = FB["getAuthResponse"]();
		    if (!auth_response)
		        return;
			
	        access_token = auth_response["accessToken"];
        }
	    var handler = on_handler_get(this,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginSuccessfully,
	                                 cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginError);	
        var d = {"remember":PRESISTING_TYPE[r_],
                 "scopr":scope_};                                     
        this.get_ref()["authWithOAuthToken"]("facebook", access_token, handler, d);		
	};		
		
    Acts.prototype.LoggingOut = function ()
	{
	    this.get_ref()["unauth"]();
	};
		
    Acts.prototype.GoOffline = function ()
	{
	    window["Firebase"]["goOffline"]();
	};
		
    Acts.prototype.GoOnline = function ()
	{
	    window["Firebase"]["goOnline"]();
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
	    var val = (!this.last_authData)? "": this.last_authData["uid"];
		ret.set_string(val);
	}; 	
	Exps.prototype.Provider = function (ret)
	{
	    var val = (!this.last_authData)? "": this.last_authData["provider"];	    
		ret.set_string(val);
	}; 	

    var get_provider_property = function (authData, p)
    {
		if (authData == null)
		    return "";
	    
		var provide_type = authData["provider"];
		var provider_info = authData[provide_type];
		if (provider_info == null)
		    return "";
			
		var val = provider_info[p];
		if (val == null)
		    val = "";

        return val;
    };
	Exps.prototype.DisplayName = function (ret)
	{
		ret.set_string(get_provider_property(this.last_authData, "displayName"));
	};
	Exps.prototype.UserIDFromProvider = function (ret)
	{
		ret.set_string(get_provider_property(this.last_authData, "id"));
	};
	Exps.prototype.AccessToken = function (ret)
	{
		ret.set_string(get_provider_property(this.last_authData, "accessToken"));
	};	    
	Exps.prototype.CachedUserProfile = function (ret)
	{
        var val = get_provider_property(this.last_authData, "cachedUserProfile");
        ret.set_string( JSON.stringify(val) );
	};
	Exps.prototype.Email = function (ret)
	{
		ret.set_string(get_provider_property(this.last_authData, "email"));
	};		
	Exps.prototype.UserName = function (ret)
	{
		ret.set_string(get_provider_property(this.last_authData, "username"));
	};
	Exps.prototype.ErrorDetail = function (ret)
	{
	    var val = (!this.last_error)? "": this.last_error["detail"];   
        if (val == null)
            val = "";        
		ret.set_string(val);
	}; 
    
}());