var _ = require('underscore');
var Buffer = require('buffer').Buffer;
var restrictedAcl = new Parse.ACL();
restrictedAcl.setPublicReadAccess(false);
restrictedAcl.setPublicWriteAccess(false);  


var C2RexTokenAuth_TokenStorage = Parse.Object.extend("MasterTokenStorage");
var get_random_string = function (cnt)
{
    var s = new Buffer(cnt);
    _.times(cnt, function(i) {
        s.set(i, _.random(0, 255));
    });
    s = s.toString('base64');
    return s;
};
Parse.Cloud.define("C2RexTokenAuth_CreateAccount", function(request, response) {
    Parse.Cloud.useMasterKey();
    var type=request.params.token.type;
    var token=request.params.token.token;
    var data=request.params.data;

    var onError = function (error)
    {
        response.error(error);
    };

    // step3. create account
    var create_account = function (type, token)
    {
        var user = new Parse.User();
        
        
        for (var k in data)
            user.set(k, data[k]);
        
        // Generate a random username and password.
        user.set("username", get_random_string(24));
        user.set("password", get_random_string(24));

        var on_success = function (user)
        {
            var ts = new C2RexTokenAuth_TokenStorage();
            ts.set(type, token);
            ts.set('user', user);
                      
            ts.setACL(restrictedAcl);
            ts.save(null);
           
            var params = {"token": {"type": type, "token": token} };
            response.success(params);
        };
        var on_error = function (error)
        {
            if (error.code === Parse.Error.USERNAME_TAKEN)
            {
                create_account(type, token);
            }
            else
            {
                onError(error);
            }
        };   
        var handler = {"success":on_success, "error":on_error};
        user.signUp(null, handler);
    }
    // step3. create account
    
    
    // step2. test if token had existed
    var test_token = function (type, token, is_random_token)
    {
        var on_success = function(item)
        {
            //token is not existed, create one
            if (!item)
            {                
                create_account(type, token);
            }
            
            // token is existed, and is random token mode 
            else if (is_random_token)
            {
                get_token(type, null);
            }
            
            // token is existed
            else
            {                
                response.error("Token had been used for signed-up already.");
            }
        };
   
        var handler = {"success":on_success, "error":onError};	
        var query = new Parse.Query(C2RexTokenAuth_TokenStorage);
        query.equalTo(type, token);
        query.select("id");
        query.first(handler);
    };

    // step2. test if token had existed
    
    // step1. generate token if token is null
    var get_token = function(type, token)
    {
        var is_random_token = (token === null);
        if (is_random_token)
            token = get_random_string(24);
        
        test_token(type, token, is_random_token);       
    }
    // step1. generate token if token is null
    
    get_token(type, token);
    
});

Parse.Cloud.define("C2RexTokenAuth_Login", function(request, response) {
    Parse.Cloud.useMasterKey();
    var type=request.params.token.type;
    var token=request.params.token.token;

    var onError = function (error)
    {
        response.error(error);
    };
    
    // step 3. login with username, password
    var login = function (username, password)
    {
	    var on_success = function (user)
	    {
            var params = {"token": {"type": type, "token": token},
                          "sessionToken": user.getSessionToken()  
                         };
            response.success(params);
	    };

        var handler = {"success":on_success, "error":onError};       
        Parse.User.logIn(username, password, handler)
    };
    // step 3. login with username, password 
    
    // step2. get username and (reset) password
    var get_account = function (user)
    {
        // Generate a random username and password.
        var username = user.getUsername();        
        var password = get_random_string(24);
		user.setPassword(password);
        
        var on_success = function ()
        {
            login(username, password);
        };
      
        var handler = {"success":on_success, "error":onError};    
        user.save(null, handler);   
    }
    // step2. get username and (reset) password
    
    
    // step1. find user by token
    var get_user = function (type, token)
    {
        var on_success = function(item)
        {
            if (item)
            {
                get_account(item.get('user'));
            }
            else
            {
                response.error("user is not found.");
            }
        };
    
        var handler = {"success":on_success, "error":onError};    
        var query = new Parse.Query(C2RexTokenAuth_TokenStorage);
        query.equalTo(type, token);
        query.include('user');
        query.select('user');
        query.first(handler);    
    };
    get_user(type, token);
    // step1. find user by token
});

Parse.Cloud.define("C2RexTokenAuth_BindToken", function(request, response) {
    Parse.Cloud.useMasterKey();
    var target = request.params.target;
    var source = request.params.source;

    var onError = function (error)
    {
        response.error(error);
    };
        
    // step3. get username and (reset) password
    var bind_token = function (item, token)
    {
        var on_success = function ()
        {
            response.success(request.params);
        };
  
        var handler = {"success":on_success, "error":onError};    
        
        if (item.get(token.type) != null)
        {
            // error: already bind
            response.error("Token had been binded.");
        }
        else
        {     
            item.set(token.type, token.token);  
            item.save(null, handler);   
        }
    }
    // step3. get username and (reset) password    
    
    // common token query
    var get_token_row = function (token, handler)
    {
        var query = new Parse.Query(C2RexTokenAuth_TokenStorage);
        query.equalTo(token.type, token.token);
        query.first(handler);    
    };
    // common token query
    
    // step2. find source token row
    var get_source_token_row = function ()
    {
        var on_success = function(item)
        {
            // source token found, bind target token
            if (item)
            {                
                bind_token(item, target);
            }
            else
            {
                response.error("User is not found.");
            }
        };
   
        var handler = {"success":on_success, "error":onError};    
        get_token_row(source, handler);    
    };
    // step2. find source token row
    
    // step1. find target token row
    var get_target_token_row = function ()
    {
        var on_success = function(item)
        {
            // target token is not found, get source token then bind
            if (!item)
            {               
                get_source_token_row();
            }
            else
            {
                if (item.get(source.type) === source.token)
                {
                    response.error("Token had been binded by current user.");
                }
                else
                {
                    response.error("Token had been binded by other user.");
                }
            }
        };
    
        var handler = {"success":on_success, "error":onError};    
        get_token_row(target, handler);  
    };
    get_target_token_row();
    // step1. find target token row
});