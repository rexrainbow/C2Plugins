// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_NGIO_Authentication = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_NGIO_Authentication.prototype;
		
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
        this.ngio = new window["Newgrounds"]["io"]["core"](this.properties[0], this.properties[1]);
        this.ngio["debug"] = (this.properties[2] === 1);
        
        this.isLogin = false;
        
        this.LoginPooling();       
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
    
    instanceProto.onLoggedIn = function ()
    {
        this.isLogin = true;
        this.runtime.trigger(cr.plugins_.Rex_NGIO_Authentication.prototype.cnds.OnLoginSuccess, this);
    };
    instanceProto.onLoggedOut = function ()
    {
        this.isLogin = false;        
        this.ngio["getSessionLoader"]()["closePassport"]();
        this.runtime.trigger(cr.plugins_.Rex_NGIO_Authentication.prototype.cnds.OnLoggedOut, this);
    }
        
	instanceProto.LoginPooling = function ()
	{
        var self=this;
        var onGetSession = function(session)
        {
            var isLogin = session && !session["expired"] && session["user"];
            
            if (!self.isLogin && isLogin)
                self.onLoggedIn();
            else if (self.isLogin && !isLogin)
                self.onLoggedOut();
                
            self.isLogin = isLogin;
            
            // pooling next 3 seconds
            setTimeout(function() {
				self.LoginPooling();
			}, 3000);
        }
		this.ngio["getSessionLoader"]()["getValidSession"](onGetSession);  
	};  
    
    // export
	instanceProto.GetNGIO = function ()
	{
        return this.ngio;
	};    
    

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
        cr.plugins_.Rex_NGIO_Authentication.prototype.exps.UserName.call(this, fake_ret);
        var userName = fake_ret.value;
        
        cr.plugins_.Rex_NGIO_Authentication.prototype.exps.UserID.call(this, fake_ret);
        var userID = fake_ret.value;        
        
        var self = this;
		propsections.push({
			"title": this.type.name,
			"properties": [
                {"name":"User name", "value":userName ,"readonly":true},                                      
                {"name":"User ID", "value":userID ,"readonly":true},                    
            ]
		});	
	};	
	/**END-PREVIEWONLY**/	     
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnLoginSuccess = function () { return true; };
	Cnds.prototype.OnLoginError = function () { return true; }; 
	Cnds.prototype.OnLoginCancel = function () { return true; }; 
    
	Cnds.prototype.IsLogin = function () 
    { 
        return this.isLogin; 
    };     
    
	Cnds.prototype.OnLoggedOut = function () { return true; };

    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.Login = function ()
	{
        var self=this;
        var onLoggedIn = function ()
        {
            self.onLoggedIn();
        };
        var onLoginFailed = function ()
        {
            self.runtime.trigger(cr.plugins_.Rex_NGIO_Authentication.prototype.cnds.OnLoginError, self);
        };
        var onLoginCancelled = function ()
        {
            self.runtime.trigger(cr.plugins_.Rex_NGIO_Authentication.prototype.cnds.OnLoginCancel, self);            
        };      
        
        var onGetSession = function ()
        {
            self.ngio["requestLogin"](onLoggedIn, onLoginFailed, onLoginCancelled);
        };
        
        this.ngio["getSessionLoader"]()["getValidSession"](onGetSession); 
	};
    
    Acts.prototype.LoggingOut = function ()
	{
        var self=this;
        var onLoggedOut = function ()
        {
            self.onLoggedOut();
        }
        var onGetSession = function ()
        {
            self.ngio["logOut"](onLoggedOut);
        };
        
        this.ngio["getSessionLoader"]()["getValidSession"](onGetSession);     
	};    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.UserName = function (ret)
	{
        var user = this.ngio["user"];
        var val = (user)? user["name"] : "";
	    ret.set_string(val || "");
	};    
	Exps.prototype.UserID = function (ret)
	{
        var user = this.ngio["user"];
        var val = (user)? user["id"] : "";
	    ret.set_int(val || 0);
	};    
    
	Exps.prototype.UserIconURL = function (ret, sizeIdx)
	{
        if (typeof(sizeIdx) === "string")
            sizeIdx = sizeIdx.toLowerCase();
        
        switch (sizeIdx)
        {
        case 0:
        case "s":
        case "small":
            sizeIdx = "small";
            break;
            
        case 1:
        case "m":
        case "medium":
            sizeIdx = "medium";
            break;     

        case 2:
        case "l":
        case "large":
            sizeIdx = "large";
            break; 

        default:
            sizeIdx = "large";
            break;         
        }

        var user = this.ngio["user"];
        var val = (user)? user["icons"][sizeIdx] : "";
	    ret.set_string(val || "");
	};      
    
}());