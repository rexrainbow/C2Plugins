// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase.prototype;
		
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

	var EVENTTYPEMAP = ["value", "child_added", "child_changed", "child_removed","child_moved"];
        
	instanceProto.onCreate = function()
	{
        this.rootpath = this.properties[0] + "/"; 

		// push
		this.lastPushRef = "";
		// transaction
		this.onTransaction = {};
        this.onTransaction.cb = null;
        this.onTransaction.input = null;
        this.onTransaction.output = null;
        // transaction completed
        this.onTransaction.completedCB = null;
        this.onTransaction.committedValue = null;        
        // on complete
        this.onCompleteCb = null;
        this.error = null;
        // reading
        if (!this.recycled)
            this.callbackMap = new window.FirebaseCallbackMapKlass();
        else
            this.callbackMap.Reset();
                              
        this.onReadCb = null;
        this.snapshot = null;
		this.prevChildName = null;
        this.exp_LastGeneratedKey = "";   
        this.exp_ServerTimeOffset = 0;        
        this.isConnected = false;
        
        
        var self=this;
        var setupFn = function ()
        {
            if (self.properties[1] === 1)
                self.connectionDetectingStart();
            
            if (self.properties[2] === 1)
                self.serverTimeOffsetDetectingStart();
        }
        window.FirebaseAddAfterInitializeHandler(setupFn);        
	};
	
	instanceProto.onDestroy = function ()
	{		
	     this.callbackMap.Remove();
	};
    
    // 2.x , 3.x    
	var isFirebase3x = function()
	{ 
        return (window["FirebaseV3x"] === true);
    };
    
    var isFullPath = function (p)
    {
        return (p.substring(0,8) === "https://");
    };
	
	instanceProto.getRef = function(k)
	{
        if (k == null)
	        k = "";
	    var path;
	    if (isFullPath(k))
	        path = k;
	    else
	        path = this.rootpath + k + "/";
            
        // 2.x
        if (!isFirebase3x())
        {
            return new window["Firebase"](path);
        }  
        
        // 3.x
        else
        {
            var fnName = (isFullPath(path))? "refFromURL":"ref";
            return window["Firebase"]["database"]()[fnName](path);
        }
        
	};
    
    var getKey = function (obj)
    {       
        return (!isFirebase3x())?  obj["key"]() : obj["key"];
    };
    
    var getRefPath = function (obj)
    {       
        return (!isFirebase3x())?  obj["ref"]() : obj["ref"];
    };    
    
    var getRoot = function (obj)
    {       
        return (!isFirebase3x())?  obj["root"]() : obj["root"];
    };
    
    var serverTimeStamp = function ()
    {       
        if (!isFirebase3x())
            return window["Firebase"]["ServerValue"]["TIMESTAMP"];
        else
            return window["Firebase"]["database"]["ServerValue"];
    };       

    var getTimestamp = function (obj)    
    {       
        return (!isFirebase3x())?  obj : obj["TIMESTAMP"];
    };    
    // 2.x , 3.x  
    
    instanceProto.addCallback = function (query, type_, cbName)
	{
	    var eventType = EVENTTYPEMAP[type_];	
	    var self = this;   
        var reading_handler = function (snapshot, prevChildName)
        {
            self.onReadCb = cbName;   
            self.snapshot = snapshot;
			self.prevChildName = prevChildName;
            self.runtime.trigger(cr.plugins_.Rex_Firebase.prototype.cnds.OnReading, self); 
            self.onReadCb = null;            
        };

        this.callbackMap.Add(query, eventType, cbName, reading_handler);
	}; 	
	
    instanceProto.addCallbackOnce = function (refObj, type_, cb)
	{
	    var eventType = EVENTTYPEMAP[type_];	    

	    var self = this;   
        var reading_handler = function (snapshot, prevChildName)
        {
            self.onReadCb = cb;   
            self.snapshot = snapshot;
            self.prevChildName = prevChildName;
            self.runtime.trigger(cr.plugins_.Rex_Firebase.prototype.cnds.OnReading, self); 
            self.onReadCb = null; 
        };
	    refObj["once"](eventType, reading_handler);                         
	};   
    
	instanceProto.connectionDetectingStart = function ()
	{
        var self = this;
        var onValueChanged = function (snap)
        {
            var trig;                   
            var isConnected = !!snap["val"]();
            if ( isConnected )            
                trig = cr.plugins_.Rex_Firebase.prototype.cnds.OnConnected;        
            else if (self.isConnected && !isConnected)   // disconnected after connected
                trig = cr.plugins_.Rex_Firebase.prototype.cnds.OnDisconnected;
            
            self.isConnected = isConnected;
            
            self.runtime.trigger(trig, self); 
        };
        
        var p = getRoot(this.getRef()) + "/.info/connected"; 
        var ref = this.getRef(p);
        ref.on("value", onValueChanged);
	};    
    
	instanceProto.serverTimeOffsetDetectingStart = function ()
	{
        var self = this;
        var onValueChanged = function (snap)
        {
            self.exp_ServerTimeOffset = snap["val"]() || 0;
        };
        
        var p = getRoot(this.getRef()) + "/.info/serverTimeOffset"; 
        var ref = this.getRef(p);
        ref.on("value", onValueChanged);
	};    
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    var prop = [];
        this.callbackMap.getDebuggerValues(prop);        
        
		propsections.push({
			"title": this.type.name,
			"properties": prop
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

	Cnds.prototype.OnTransaction = function (cb)
	{
	    return cr.equals_nocase(cb, this.onTransaction.cb);
	};    

	Cnds.prototype.OnReading = function (cb)
	{
	    return cr.equals_nocase(cb, this.onReadCb);
	};  

	Cnds.prototype.OnComplete = function (cb)
	{
	    return cr.equals_nocase(cb, this.onCompleteCb);
	}; 	

	Cnds.prototype.OnError = function (cb)
	{
	    return cr.equals_nocase(cb, this.onCompleteCb);
	};

	Cnds.prototype.LastDataIsNull = function ()
	{
        var data =(this.snapshot === null)? null: this.snapshot["val"]();
	    return (data === null);
	};
 
	Cnds.prototype.TransactionInIsNull = function ()
	{
        var data =(this.onTransaction.input === null)? null: this.onTransaction.input;
	    return (data === null);
	}; 

    // cf_deprecated
	Cnds.prototype.IsTransactionAborted = function () { return false; };     
    // cf_deprecated    
    
	Cnds.prototype.OnTransactionComplete = function (cb)
	{
	    return cr.equals_nocase(cb, this.onTransaction.completedCB);
	}; 	

	Cnds.prototype.OnTransactionError = function (cb)
	{
	    return cr.equals_nocase(cb, this.onTransaction.completedCB);
	};   

	Cnds.prototype.OnTransactionAbort = function (cb)
	{
	    return cr.equals_nocase(cb, this.onTransaction.completedCB);
	};     
    
	Cnds.prototype.OnConnected = function ()
	{
	    return true;
	};    

	Cnds.prototype.OnDisconnected = function ()
	{
	    return true;
	};      

	Cnds.prototype.IsConnected = function ()
	{
	    return this.isConnected;
	};     
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
      
    Acts.prototype.SetDomainRef = function (ref)
	{
	    this.rootpath = ref + "/"; 
	}; 	
    
	var getOnCompleteHandler = function (self, onCompleteCb)
	{
	    if ((onCompleteCb === null) || (onCompleteCb === ""))
	        return;
	        
	    var handler = function(error) 
	    {
	        self.onCompleteCb = onCompleteCb;    
	        self.error = error; 
	        var trig = (error)? cr.plugins_.Rex_Firebase.prototype.cnds.OnError:
	                            cr.plugins_.Rex_Firebase.prototype.cnds.OnComplete;
	        self.runtime.trigger(trig, self); 
	        self.onCompleteCb = null;
        };
        return handler;
	};
      
    Acts.prototype.SetValue = function (k, v, onCompleteCb)
	{
	    var handler = getOnCompleteHandler(this, onCompleteCb);
	    this.getRef(k)["set"](v, handler);
	}; 

    Acts.prototype.SetJSON = function (k, v, onCompleteCb)
	{
	    var handler = getOnCompleteHandler(this, onCompleteCb);	    
	    this.getRef(k)["set"](JSON.parse(v), handler);
	}; 

    Acts.prototype.UpdateJSON = function (k, v, onCompleteCb)
	{
	    var handler = getOnCompleteHandler(this, onCompleteCb);	 	    
	    this.getRef(k)["update"](JSON.parse(v), handler);
	}; 	

    Acts.prototype.PushValue = function (k, v, onCompleteCb)
	{
	    var handler = getOnCompleteHandler(this, onCompleteCb);
	    var ref = this.getRef(k)["push"](v, handler);
		this.lastPushRef = k + "/" +  getKey(ref);
	}; 

    Acts.prototype.PushJSON = function (k, v, onCompleteCb)
	{
	    var handler = getOnCompleteHandler(this, onCompleteCb);	    
	    var ref = this.getRef(k)["push"](JSON.parse(v), handler);
		this.lastPushRef = k + "/" + getKey(ref);
	};
	
    Acts.prototype.Transaction = function (k, onTransactionCb, onCompleteCb)
	{ 
        var self = this;  

	    var _onComplete = function(error, committed, snapshot) 
	    {
	        self.onTransaction.completedCB = onCompleteCb;    
	        self.error = error; 
            self.onTransaction.committedValue = snapshot["val"]();
            
            var cnds = cr.plugins_.Rex_Firebase.prototype.cnds;            
	        var trig = (error)? cnds.OnTransactionError:
                           (!committed)? cnds.OnTransactionAbort:
	                           cnds.OnTransactionComplete;
                               
	        self.runtime.trigger(trig, self); 
	        self.onTransaction.completedCB = null;
        };
        
        var _onTransaction = function(current_value)
        {
            self.onTransaction.cb = onTransactionCb;	  
            self.onTransaction.input = current_value;
            self.onTransaction.output = null;
            self.runtime.trigger(cr.plugins_.Rex_Firebase.prototype.cnds.OnTransaction, self); 
            self.onTransaction.cb = null;
            
            if (self.onTransaction.output === null)
                return;
            else
                return self.onTransaction.output;
        };
	    this.getRef(k)["transaction"](_onTransaction, _onComplete);
	};
	
    Acts.prototype.ReturnTransactionValue = function (v)
	{
	    this.onTransaction.output = v;
	}; 
	
    Acts.prototype.ReturnTransactionJSON = function (v)
	{
	    this.onTransaction.output = JSON.parse(v);
	}; 	
	
    Acts.prototype.Remove = function (k, onCompleteCb)
	{
	    var handler = getOnCompleteHandler(this, onCompleteCb);	    
	    this.getRef(k)["remove"](handler);
	}; 	

    Acts.prototype.SetBooleanValue = function (k, b, onCompleteCb)
	{
	    var handler = getOnCompleteHandler(this, onCompleteCb);
	    this.getRef(k)["set"]((b===1), handler);
	};	
	
    Acts.prototype.PushBooleanValue = function (k, b, onCompleteCb)
	{
	    var handler = getOnCompleteHandler(this, onCompleteCb);
	    var ref = this.getRef(k)["push"]((b===1), handler);
		this.lastPushRef = k + "/" +  getKey(ref);
	}; 	

    Acts.prototype.SetServerTimestamp = function (k, onCompleteCb)
	{
	    var handler = getOnCompleteHandler(this, onCompleteCb);
	    this.getRef(k)["set"](serverTimeStamp(), handler);
	};	
	
    Acts.prototype.PushServerTimestamp = function (k, onCompleteCb)
	{
	    var handler = getOnCompleteHandler(this, onCompleteCb);
	    var ref = this.getRef(k)["push"](serverTimeStamp(), handler);
		this.lastPushRef = k + "/" +  getKey(ref);
	}; 		
    Acts.prototype.AddReadingCallback = function (k, type_, cbName)
	{
	    this.addCallback(this.getRef(k), type_, cbName);                        
	}; 		
	
    Acts.prototype.RemoveReadingCallback = function (k, type_, cbName)
	{
        var absRef = (k != null)? this.getRef(k)["toString"](): null;
        var eventType = (type_ != null)? EVENTTYPEMAP[type_]: null;
        this.callbackMap.Remove(absRef, eventType, cbName);
	};
	
    Acts.prototype.AddReadingCallbackOnce = function (k, type_, cbName)
	{
	    this.addCallbackOnce(this.getRef(k), type_, cbName);                        
	}; 

    Acts.prototype.RemoveRefOnDisconnect = function (k)
	{
	    this.getRef(k)["onDisconnect"]()["remove"]();
	}; 

    Acts.prototype.SetValueOnDisconnect = function (k, v)
	{
	    this.getRef(k)["onDisconnect"]()["set"](v);
	};	

    Acts.prototype.UpdateJSONOnDisconnect = function (k, v)
	{
	    this.getRef(k)["onDisconnect"]()["update"](JSON.parse(v));
	};	

    Acts.prototype.CancelOnDisconnect = function (k)
	{
	    this.getRef(k)["onDisconnect"]()["cancel"]();
	};
	
	
    // query
    var get_query = function (queryObjs)
    {
	    if (queryObjs == null)
	        return null;	        
        var query = queryObjs.getFirstPicked();
        if (query == null)
            return null;
            
        return query.GetQuery();
    };
    Acts.prototype.AddQueryCallback = function (queryObjs, type_, cbName)
	{
        var refObj = get_query(queryObjs);
        if (refObj == null)
            return;
            
        this.addCallback(refObj, type_, cbName);                        
	};	

    Acts.prototype.AddQueryCallbackOnce = function (queryObjs, type_, cbName)
	{
        var refObj = get_query(queryObjs);
        if (refObj == null)
            return;
            	    
	   this.addCallbackOnce(refObj, type_, cbName);   
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
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.Domain = function (ret)
	{
		ret.set_string(this.rootpath);
	}; 
	
	Exps.prototype.TransactionIn = function (ret, default_value)
	{	
		ret.set_any(window.FirebaseGetValueByKeyPath(this.onTransaction.input, null, default_value));    
	};
	
	Exps.prototype.LastData = function (ret, default_value)
	{	
        var data =(this.snapshot === null)? null: this.snapshot["val"]();
		ret.set_any(window.FirebaseGetValueByKeyPath(data, null, default_value));        
	};
	
	Exps.prototype.LastKey = function (ret, default_value)
	{	
        var key =(this.snapshot === null)? null: getKey(this.snapshot);
		ret.set_any(window.FirebaseGetValueByKeyPath(key, null, default_value));               
	};
	
	Exps.prototype.PrevChildName = function (ret, default_value)
	{	
		ret.set_any(window.FirebaseGetValueByKeyPath(this.prevChildName, null, default_value));
	};	

	Exps.prototype.TransactionResult = function (ret, default_value)
	{	
		ret.set_any(window.FirebaseGetValueByKeyPath(this.onTransaction.committedValue, null, default_value));        
	};
	
	Exps.prototype.LastPushRef = function (ret)
	{
		ret.set_string(this.lastPushRef);
	};  
    
  	Exps.prototype.GenerateKey = function (ret)
	{
	    var ref = this.getRef()["push"]();
        this.exp_LastGeneratedKey = getKey(ref);
		ret.set_string(this.exp_LastGeneratedKey);
	};	
    
	Exps.prototype.LastGeneratedKey = function (ret)
	{
	    ret.set_string(this.exp_LastGeneratedKey);
	};
    
	Exps.prototype.ServerTimeOffset = function (ret)
	{
	    ret.set_int(this.exp_ServerTimeOffset);
	};	
    
	Exps.prototype.EstimatedTime = function (ret)
	{
	    ret.set_int(new Date().getTime() + this.exp_ServerTimeOffset);
	};    

	Exps.prototype.LastErrorCode = function (ret)
	{
        var code;
	    if (this.error)
            code = this.error["code"];
		ret.set_string(code || "");
	}; 
	
	Exps.prototype.LastErrorMessage = function (ret)
	{
        var s;
	    if (this.error)
            s = this.error["serverResponse"];
		ret.set_string(s || "");
	};	  
	
}());