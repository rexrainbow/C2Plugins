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
        this.isMyLoginCall = false;        
        this.isMyLogOutCall = false;         
        this.lastError = null;
        this.lastAuthData = null;  // only used in 2.x
        this.lastLoginResult = null; // only used in 3.x

        var self=this;
        var setupFn = function ()
        {
            self.setOnLogoutHandler();
        }         
        window.FirebaseAddAfterInitializeHandler(setupFn);


        window.FirebaseGetCurrentUserID = function()
        {
            return self.getCurrentUserID();
        };
	};
    
	var isFirebase3x = function()
	{ 
        return (window["FirebaseV3x"] === true);
    };

    // 2.x	
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
    
    // 3.x	
    var getAuthObj = function()
    {
        return window["Firebase"]["auth"]();
    };

	instanceProto.setOnLogoutHandler = function()
	{        
        var self = this;        
        var onAuthStateChanged = function (authData)
        {                      
            if (authData) 
            {
                // user authenticated with Firebase
                //console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
                
                var isMyLoginCall = self.isMyLoginCall && !self.isMyLogOutCall;               
                self.lastError = null;
                self.lastAuthData = authData;  
                
                if (!isMyLoginCall)
                    self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginByOther, self);
                else
                {
                    self.isMyLoginCall = false; 
                    self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginSuccessful, self);        
                }
                
            }
            else 
            {
                var isMyLogOutCall = self.isMyLogOutCall;
                self.isMyLogOutCall = false;                
                self.lastAuthData = null;   
                self.lastLoginResult = null;
                
                // user is logged out                
                if (!isMyLogOutCall)
                    self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoggedOutByOther, self);
                else
                    self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoggedOut, self);               
                
            }
        }; 
        
        // 2.x
        if (!isFirebase3x())
        {
            this.lastAuthData  = this.get_ref()["getAuth"]();
            this.get_ref()["onAuth"](onAuthStateChanged);
        }
        
        // 3.x
        else
        {
            getAuthObj()["onAuthStateChanged"](onAuthStateChanged);
        }        
	};    
    
    instanceProto.getCurrentUserID = function()
    {
        var uid;
        // 2.x
        if (!isFirebase3x())
            uid = (this.lastAuthData)? this.lastAuthData["uid"]:"";
        
        // 3.x
        else
            uid = getUserProperty3x("uid");

        return uid;        
    }    
    
	/**BEGIN-PREVIEWONLY**/
    var fake_ret = {
        value:0,
        set_any: function(value){this.value=value;},
        set_int: function(value){this.value=value;},
        set_float: function(value){this.value=value;}, 
        set_string: function(value) {this.value=value;},
    };
    
	instanceProto.getDebuggerValues = function (propsections)
	{        
        var provider;
        if (Cnds.prototype.IsAnonymous.call(this))
        {
            provider = "anonymous";
        }
        else
        {
            cr.plugins_.Rex_Firebase_Authentication.prototype.exps.Provider.call(this, fake_ret);
            var provider = fake_ret.value;    
        }
        
        cr.plugins_.Rex_Firebase_Authentication.prototype.exps.DisplayName.call(this, fake_ret);
        var displayname = fake_ret.value;
        
        cr.plugins_.Rex_Firebase_Authentication.prototype.exps.Email.call(this, fake_ret);
        var email = fake_ret.value;        
        
        cr.plugins_.Rex_Firebase_Authentication.prototype.exps.PhotoURL.call(this, fake_ret);
        var photoURL = fake_ret.value;        
        
        cr.plugins_.Rex_Firebase_Authentication.prototype.exps.AccessToken.call(this, fake_ret);
        var accessToken = fake_ret.value;  
        
        var self = this;
		propsections.push({
			"title": this.type.name,
			"properties": [         
                {"name":"UserID", "value":this.getCurrentUserID() ,"readonly":true},                  
                {"name":"Provider", "value":provider ,"readonly":true},                     
                {"name":"Display name", "value":displayname ,"readonly":true},
                {"name":"Email", "value":email ,"readonly":true},    
                {"name":"PhotoURL", "value":photoURL ,"readonly":true},                  
                {"name":"AccessToken", "value":accessToken ,"readonly":true},  
            ]
		});	
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/	 
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      

	Cnds.prototype.EmailPassword_OnCreateAccountSuccessful = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.EmailPassword_OnCreateAccountError = function ()
	{
	    return true;
	}; 
	
	Cnds.prototype.EmailPassword_OnChangingPasswordSuccessful = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.EmailPassword_OnChangingPasswordError = function ()
	{
	    return true;
	}; 	
	
	Cnds.prototype.EmailPassword_OnSendPasswordResetEmailSuccessful = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.EmailPassword_OnSendPasswordResetEmailError = function ()
	{
	    return true;
	}; 	
	
	Cnds.prototype.EmailPassword_OnDeleteUserSuccessful = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.EmailPassword_OnDeleteUserError = function ()
	{
	    return true;
	}; 	
	
	Cnds.prototype.EmailPassword_OnUpdatingProfileSuccessful = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.EmailPassword_OnUpdatingProfileError = function ()
	{
	    return true;
	}; 
	
	Cnds.prototype.EmailPassword_OnUpdatingEmailSuccessful = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.EmailPassword_OnUpdatingEmailError = function ()
	{
	    return true;
	}; 
	
	Cnds.prototype.EmailPassword_OnSendVerificationEmailSuccessful = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.EmailPassword_OnSendVerificationEmailError = function ()
	{
	    return true;
	}; 


	Cnds.prototype.IsAnonymous = function ()
	{
        var val;
        if (!isFirebase3x())
        {
            var user = this.lastAuthData;
            if (user)            
                val = (user["provider"] === "anonymous");            
            else
                val = false;
        }
        else
        {
            var user = getAuthObj()["currentUser"];
            val = user && user["isAnonymous"];
        }
        
        return val;
	};
    
	Cnds.prototype.OnLoginSuccessful = function ()
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

	Cnds.prototype.IsLogin = function ()
	{
        if (!isFirebase3x())
            return (this.lastAuthData != null);
        else
            return (getAuthObj()["currentUser"] != null);
	};	
    
	Cnds.prototype.OnLoginByOther = function ()
	{
	    return true;
	}; 	
    
	Cnds.prototype.OnLoggedOutByOther = function ()
	{
	    return true;
	}; 	 
    
	Cnds.prototype.OnLinkSuccessful = function ()
	{
	    return true;
	}; 	
    
	Cnds.prototype.OnLinkError = function ()
	{
	    return true;
	}; 

    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	   
    // 2.x
	var getHandler2x = function(self, successTrig, errorTrig)
	{
	    var handler = function(error, authData) 
        {
            self.lastError = error;
            self.lastAuthData = authData;
            if (error == null) 
            {
                // get auth data by expression:UserID, and expression:Provider
                self.runtime.trigger(successTrig, self);                
            } 
            else 
            {
                // get error message by expression:ErrorCode and expression:ErrorMessage
                self.runtime.trigger(errorTrig, self);
            }
        };
        return handler;
    };
    
	var getLoginHandler2x = function(self)
	{
	    var handler = function(error, authData) 
        {
            self.lastError = error;
            self.lastAuthData = authData;
            if (error == null) 
            {
                // self.isMyLoginCall = false;    // set it in onAuthStateChanged
                // get auth data by expression:UserID, and expression:Provider
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginSuccessful, self);                
            } 
            else 
            {
                self.isMyLoginCall = false;
                // get error message by expression:ErrorCode and expression:ErrorMessage
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginError, self);
            }
        };
        self.isMyLoginCall = true;
        return handler;
    };    
    
    // 3.x
    var addHandler = function (self, authObj, successTrig, errorTrig)
    {
        var onSuccess = function (result)
        {
            self.lastError = null;
            self.lastAuthData = result;
            if (successTrig)
                self.runtime.trigger(successTrig, self);
        };
        var onError = function (error)
        {
            self.lastError = error;
            self.lastAuthData = null;
            if (errorTrig)
                self.runtime.trigger(errorTrig, self);
        };        
        authObj["then"](onSuccess)["catch"](onError);
    };
    
    var addLoginHandler = function (self, authObj)
    {
        var onSuccess = function (result)
        {
            self.lastLoginResult = result;
        };
        var onError = function (error)
        {       
            self.isMyLoginCall = false;
            self.lastError = error;
            self.lastLoginResult = null;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLoginError, self);            
        };        
        self.isMyLoginCall = true;
        authObj["then"](onSuccess)["catch"](onError);
    }    
	
    Acts.prototype.EmailPassword_CreateAccount = function (e_, p_)
	{
        // 2.x
        if (!isFirebase3x())
        {
	        var reg_data = {"email":e_,  "password":p_ };
	        var handler = getHandler2x(this,
	                                     cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnCreateAccountSuccessful,
	                                     cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnCreateAccountError);
	        this.get_ref()["createUser"](reg_data, handler);
        }
        
        // 3.x
        else
        {
            var authObj = getAuthObj()["createUserWithEmailAndPassword"](e_, p_);
            addHandler(this, authObj, 
                              cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnCreateAccountSuccessful,
                              cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnCreateAccountError
                              );
        }
	}; 

    var PRESISTING_TYPE = ["default", "sessionOnly", "never"];
    Acts.prototype.EmailPassword_Login = function (e_, p_, r_)
	{
        // 2.x
        if (!isFirebase3x())
        {        
	        var reg_data = {"email":e_,  "password":p_ };
	        var handler = getLoginHandler2x(this);
            var d = {"remember":PRESISTING_TYPE[r_]};
	        this.get_ref()["authWithPassword"](reg_data, handler, d);
        }
        
        // 3.x
        else
        {
            var authObj = getAuthObj();
            addLoginHandler(this, authObj["signInWithEmailAndPassword"](e_, p_));            
        }            
	}; 	
	
    Acts.prototype.EmailPassword_ChangePassword = function (e_, old_p_, new_p_)
	{        
        // 2.x
        if (!isFirebase3x())
        {         
	        var reg_data = {"email":e_,  "oldPassword ":old_p_,  "newPassword":new_p_};
	        var handler = getHandler2x(this,
	                                     cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnChangingPasswordSuccessful,
	                                     cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnChangingPasswordError);
	        this.get_ref()["changePassword"](reg_data, handler);
        }
        
        // 3.x
        else
        {
            var authObj = getAuthObj()["currentUser"]["updatePassword"](new_p_);
            addHandler(this, authObj, 
                              cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnChangingPasswordSuccessful,
                              cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnChangingPasswordError
                              );    
        }    
	}; 
	
    Acts.prototype.EmailPassword_SendPasswordResetEmail = function (e_)
	{
        // 2.x
        if (!isFirebase3x())
        {   
	        var reg_data = {"email":e_};
	        var handler = getHandler2x(this,
	                                     cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnSendPasswordResetEmailSuccessful,
	                                     cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnSendPasswordResetEmailError);
	        this.get_ref()["resetPassword"](reg_data, handler);
        }
        
        // 3.x
        else
        {
            var authObj = getAuthObj()["sendPasswordResetEmail"](e_);
            addHandler(this, authObj, 
                              cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnSendPasswordResetEmailSuccessful,
                              cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnSendPasswordResetEmailError
                              );                             
        }         
	};		
	
    Acts.prototype.EmailPassword_DeleteUser = function (e_, p_)
	{	
        // 2.x
        if (!isFirebase3x())
        {           
	        var reg_data = {"email":e_,  "password":p_};
	        var handler = getHandler2x(this,
	                                     cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnDeleteUserSuccessful,
	                                     cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnDeleteUserError);
	        this.get_ref()["removeUser"](reg_data, handler);           
        }
        
        // 3.x
        else
        {
            var authObj = getAuthObj()["currentUser"]["delete"]();
            addHandler(this, authObj, 
                              cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnDeleteUserSuccessful,
                              cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnDeleteUserError
                              );      
        }            
	};		
    
    Acts.prototype.Anonymous_Login = function (r_)
	{
        // 2.x
        if (!isFirebase3x())
        {      
	        var handler = getLoginHandler2x(this);
            var d = {"remember":PRESISTING_TYPE[r_]};
	        this.get_ref()["authAnonymously"](handler, d);
        }
        
        // 3.x
        else
        {
            var authObj = getAuthObj();
            addLoginHandler(this, authObj["signInAnonymously"]());     
        }              
	};	
	
    Acts.prototype.AuthenticationToken_Login = function (t_, r_)
	{
        // 2.x
        if (!isFirebase3x())
        {         
	        var handler = getLoginHandler2x(this);
            var d = {"remember":PRESISTING_TYPE[r_]};
	        this.get_ref()["authWithCustomToken"](t_, handler, d);
        }
        
        // 3.x
        else
        {
            var authObj = getAuthObj();
            addLoginHandler(this, authObj["signInWithCustomToken"]());    
        }
	};		
    
	var PROVIDER_TYPE2x = ["facebook", "twitter", "github", "google"];
    // 3.x
    var capitalizeFirstLetter = function (s) 
    {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };   
    Acts.prototype.ProviderAuthentication_Login = function (provider, t_, r_, scope_)
	{
        // 2.x
        if (!isFirebase3x())
        {             
            if (typeof(provider) === "number") 
                provider = PROVIDER_TYPE2x[provider];
            
            var loginType = (t_ === 0)? "authWithOAuthPopup":"authWithOAuthRedirect";	    
	        var handler = getLoginHandler2x(this);
            var d = {"remember":PRESISTING_TYPE[r_],
                     "scope":scope_};
	        this.get_ref()[loginType](provider, handler, d);
        }
        
        // 3.x
        else
        {
            if (typeof(provider) === "number") 
                provider = PROVIDER_TYPE2x[provider];    
           
            provider = capitalizeFirstLetter( provider) + "AuthProvider";  
            var providerObj = new window["Firebase"]["auth"][provider]();
            if (scope_ !== "") 
                providerObj["addScope"](scope_);
            
            var authObj = getAuthObj();
            if (t_ === 0)    // signInWithPopup
            {
                addLoginHandler(this, authObj["signInWithPopup"](providerObj));
            }
            else    // signInWithRedirect
            {
                authObj["signInWithRedirect"](providerObj);
                addLoginHandler(this, authObj["getRedirectResult"]());
            }
        }
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
        
        // 2.x
        if (!isFirebase3x())
        {             
	        var handler = getLoginHandler2x(this);	
            var d = {"remember":PRESISTING_TYPE[r_],
                     "scope":scope_};                                     
            this.get_ref()["authWithOAuthToken"]("facebook", access_token, handler, d);	
        }
        
        // 3.x
        else
        {
            var credential = window["Firebase"]["auth"]["FacebookAuthProvider"]["credential"](access_token);
            var authObj = getAuthObj();
            addLoginHandler(this, authObj["signInWithCredential"](credential));                     
        }     
	};		
		
    Acts.prototype.LoggingOut = function ()
	{
        this.isMyLogOutCall = true;
        // 2.x
        if (!isFirebase3x())
        {        
	        this.get_ref()["unauth"]();
        }
        
        // 3.x
        else
        {
            var authObj = getAuthObj()["signOut"]();
        }      
	};
		
    Acts.prototype.GoOffline = function ()
	{
        // 2.x
        if (!isFirebase3x())
        {        
	        window["Firebase"]["goOffline"]();
        }
        
        // 3.x
        else
        {
            window["Firebase"]["database"]()["goOffline"]();
        }
	};
		
    Acts.prototype.GoOnline = function ()
	{
        // 2.x
        if (!isFirebase3x())
        {           
	        window["Firebase"]["goOnline"]();
            
        }
        
        // 3.x
        else
        {
            window["Firebase"]["database"]()["goOnline"]();
        }
	};	

    Acts.prototype.LinkToFB = function (access_token)
	{      
        // 2.x
        if (!isFirebase3x())
        {        
            alert("Does not support in firebase 2.x api");
	        return;    
        }
        
        var user = getAuthObj()["currentUser"];   
        if (user == null)
        {
            return;
        }
    
        if (access_token == "")
        {        
	        if (typeof (FB) == null) 
	            return;
	    
	        var auth_response = FB["getAuthResponse"]();
	        if (!auth_response)
	            return;
	    
	        access_token = auth_response["accessToken"];
        }
        
        // 3.x
        var credential = window["Firebase"]["auth"]["FacebookAuthProvider"]["credential"](access_token);
        var authObj = user["link"](credential);
        addHandler(this, authObj, 
                          cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLinkSuccessful,
                          cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLinkError
                          ); 
	};
    
    Acts.prototype.LinkToGoogle = function (id_token)
	{
        // 2.x
        if (!isFirebase3x())
        {        
            alert("Does not support in firebase 2.x api");
	        return;    
        }
        
        var user = getAuthObj()["currentUser"];   
        if (user == null)
        {
            return;
        }        
    
        // 3.x
        var credential = window["Firebase"]["auth"]["GoogleAuthProvider"]["credential"](id_token);
        var authObj = user["link"](credential);
        addHandler(this, authObj, 
                          cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLinkSuccessful,
                          cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLinkError
                          ); 
	};	
    
    Acts.prototype.LinkToEmailPassword = function (e_, p_)
	{
        // 2.x
        if (!isFirebase3x())
        {        
            alert("Does not support in firebase 2.x api");
	        return;    
        }
        
        var user = getAuthObj()["currentUser"];   
        if (user == null)
        {
            return;
        }        
             
        // 3.x
        var credential = window["Firebase"]["auth"]["EmailAuthProvider"]["credential"](e_, p_);
        var authObj = user["link"](credential);
        addHandler(this, authObj, 
                          cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLinkSuccessful,
                          cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.OnLinkError
                          ); 
	};	 
	
    Acts.prototype.UpdateProfile = function (displayName, photoURL)
	{
        // 2.x
        if (!isFirebase3x())
        {        
            alert("Does not support in firebase 2.x api");
	        return;    
        }
        
        // 3.x
        else
        {
            var self = this;
            var user = getAuthObj()["currentUser"]; 
            var data = {
                "displayName": displayName,
                "photoURL": photoURL,
            }
            var onSuccess = function ()
            {
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnUpdatingProfileSuccessful, self);
            };
            var onError = function ()
            {
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnUpdatingProfileError, self);
            };            
            user["updateProfile"](data)["then"](onSuccess)["catch"](onError);
        }
	}; 

    Acts.prototype.UpdateEmail = function (email)
	{
        // 2.x
        if (!isFirebase3x())
        {        
            alert("Does not support in firebase 2.x api");
	        return;    
        }
        
        // 3.x
        else
        {
            var self = this;
            var user = getAuthObj()["currentUser"]; 
            var onSuccess = function ()
            {
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnUpdatingEmailSuccessful, self);
            };
            var onError = function ()
            {
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnUpdatingEmailError, self);
            };            
            user["updateEmail"](email)["then"](onSuccess)["catch"](onError);
        }
	};

    Acts.prototype.SendEmailVerification = function (email)
	{
        // 2.x
        if (!isFirebase3x())
        {        
            alert("Does not support in firebase 2.x api");
	        return;    
        }
        
        // 3.x
        else
        {
            var self = this;
            var user = getAuthObj()["currentUser"]; 
            var onSuccess = function ()
            {
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnSendVerificationEmailSuccessful, self);
            };
            var onError = function ()
            {
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Authentication.prototype.cnds.EmailPassword_OnSendVerificationEmailError, self);
            };            
            user["sendEmailVerification"]()["then"](onSuccess)["catch"](onError);
        }
	};

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
    // 2.x
    var getProviderProperty = function (authData, p)
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
    
    // 3.x
    var getUserProperty3x = function(p)
    {
        var user = getAuthObj()["currentUser"]; 
        return (user)? user[p]:"";
    };
    var getProviderProperty3x = function (p, idx)
    {
		var user = getAuthObj()["currentUser"]; 
        if (!user)
            return "";
        
        if (idx == null) idx = 0;
        var providerData = user["providerData"][idx];
        var val = (providerData)? providerData[p]:"";
        return val;
    };    
    
    
	Exps.prototype.ErrorCode = function (ret)
	{
        // 2.x , 3.x
	    var val = (!this.lastError)? "": this.lastError["code"];    
		ret.set_string(val || "");
	}; 
	
	Exps.prototype.ErrorMessage = function (ret)
	{
        // 2.x , 3.x
	    var val = (!this.lastError)? "": this.lastError["message"];    
		ret.set_string(val || "");
	}; 	
    
	Exps.prototype.UserID = function (ret)
	{            
		ret.set_string(this.getCurrentUserID() || "");
	}; 	
	Exps.prototype.Provider = function (ret)
	{
        var pid;
        // 2.x
        if (!isFirebase3x())
        {
            pid = (!this.lastAuthData)? "": this.lastAuthData["provider"];	 
        }  
        
        // 3.x
        else
        {
            pid = getProviderProperty3x("providerId");
        }  
		ret.set_string(pid);
	}; 	

	Exps.prototype.DisplayName = function (ret)
	{
        var name;
        // 2.x
        if (!isFirebase3x())
        {
            name = getProviderProperty(this.lastAuthData, "displayName");
        }  
        
        // 3.x
        else
        {
            name = getUserProperty3x("displayName");
        }
		ret.set_string(name || "");
	};
	Exps.prototype.UserIDFromProvider = function (ret)
	{
        var uid;
        // 2.x
        if (!isFirebase3x())
        {
            uid = getProviderProperty(this.lastAuthData, "id");
        }  
        
        // 3.x
        else
        {
            uid = getProviderProperty3x("uid");
        }        
		ret.set_string(uid || "");
	};
	Exps.prototype.AccessToken = function (ret)
	{
        var token;
        // 2.x
        if (!isFirebase3x())
        {
            token = getProviderProperty(this.lastAuthData, "accessToken");
        }  
        
        // 3.x
        else
        {
            if (this.lastLoginResult && this.lastLoginResult["credential"])
                token = this.lastLoginResult["credential"]["accessToken"];
        }       
		ret.set_string(token || "");
	};	    
	Exps.prototype.CachedUserProfile = function (ret)
	{
        var profile;
        // 2.x
        if (!isFirebase3x())
        {
            profile = getProviderProperty(this.lastAuthData, "cachedUserProfile");
        }  
        
        // 3.x
        else
        {
            alert("CachedUserProfile had not implemented in firebase 3.x");
        }              
        // ??        
        ret.set_string( profile || "" );
	};
	Exps.prototype.Email = function (ret)
	{
        var email;
        // 2.x
        if ((!isFirebase3x()))
        {
            email = getProviderProperty(this.lastAuthData, "email");
        }  
        
        // 3.x
        else
        {
            email = getProviderProperty3x("email");
        }             
		ret.set_string(email || "");
	};		
	Exps.prototype.UserName = function (ret)
	{
        var name;
        // 2.x
        if (!isFirebase3x())
        {
            name = getProviderProperty(this.lastAuthData, "username");
        }  
        
        // 3.x
        else
        {
            name = getUserProperty3x("displayName");            
        }
        
		ret.set_string(name || "");
	};
	Exps.prototype.ErrorDetail = function (ret)
	{
        // 2.x , 3.x        
	    var val = (!this.lastError)? "": this.lastError["detail"];   
        if (val == null)
            val = "";        
		ret.set_string(val);
	}; 
	Exps.prototype.PhotoURL = function (ret)
	{
        var photoUrl;
        // 2.x
        if (!isFirebase3x())
        {
            photoUrl = "";
        }  
        
        // 3.x
        else
        {
            photoUrl = getProviderProperty3x("photoURL");
        }
		ret.set_string(photoUrl || "");
	};
}());