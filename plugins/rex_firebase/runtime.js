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

	var EVENTTYPEMAP = ["value", "child_added", "child_changed", "child_removed","child_moved"];
	instanceProto.onCreate = function()
	{
        this.rootpath = this.properties[0] + "/"; 
        
        if (!this.recycled)
            window["Firebase"]["enableLogging"](this.properties[1] == 1);
        
		// push
		this.last_push_ref = "";
        // transaction
        this.onTransaction_cb = null;
        this.onTransaction_input = null;
        this.onTransaction_output = null;
        // transaction completed
        this.onTransaction_completed_cb = null;
        this.onTransaction_committed = false;
        this.onTransaction_committedValue = null;        
        // on complete
        this.onComplete_cb = null;
        this.onComplete_error = null;
        // reading
        if (!this.recycled)
            this.callbackMap = new window.FirebaseCallbackMapKlass();
        else
            this.callbackMap.Reset();
                              
        this.reading_cb = null;
        this.snapshot = null;
		this.prevChildName = null;
        
        /**BEGIN-PREVIEWONLY**/
        this.propsections = [];       
        /**END-PREVIEWONLY**/          
	};
	
	instanceProto.onDestroy = function ()
	{		
	     this.callbackMap.Remove();
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
	
    instanceProto.add_callback = function (query, type_, cbName)
	{
	    var eventType = EVENTTYPEMAP[type_];	
	    var self = this;   
        var reading_handler = function (snapshot, prevChildName)
        {
            self.reading_cb = cbName;   
            self.snapshot = snapshot;
			self.prevChildName = prevChildName;
            self.runtime.trigger(cr.plugins_.Rex_Firebase.prototype.cnds.OnReading, self); 
            self.reading_cb = null;            
        };

        this.callbackMap.Add(query, eventType, cbName, reading_handler);
	}; 	
	
    instanceProto.add_callback_once = function (refObj, type_, cb)
	{
	    var eventType = EVENTTYPEMAP[type_];	    

	    var self = this;   
        var reading_handler = function (snapshot, prevChildName)
        {
            self.reading_cb = cb;   
            self.snapshot = snapshot;
            self.prevChildName = prevChildName;
            self.runtime.trigger(cr.plugins_.Rex_Firebase.prototype.cnds.OnReading, self); 
            self.reading_cb = null; 
        };
	    refObj["once"](eventType, reading_handler);                         
	}; 		
	
	var get_data = function(in_data, default_value)
	{
	    var val;
	    if (in_data === null)
	    {
	        if (default_value === null)
	            val = 0;
	        else
	            val = default_value;
	    }
        else if (typeof(in_data) == "object")
        {
            val = JSON.stringify(in_data);
        }
        else
        {
            val = in_data;
        }	    
        return val;
	};    

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    this.propsections.length = 0;
        this.callbackMap.getDebuggerValues(this.propsections);        
        
		propsections.push({
			"title": this.type.name,
			"properties": this.propsections
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
	    return cr.equals_nocase(cb, this.onTransaction_cb);
	};    

	Cnds.prototype.OnReading = function (cb)
	{
	    return cr.equals_nocase(cb, this.reading_cb);
	};  

	Cnds.prototype.OnComplete = function (cb)
	{
	    return cr.equals_nocase(cb, this.onComplete_cb);
	}; 	

	Cnds.prototype.OnError = function (cb)
	{
	    return cr.equals_nocase(cb, this.onComplete_cb);
	};

	Cnds.prototype.LastDataIsNull = function ()
	{
        var data =(this.snapshot === null)? null: this.snapshot["val"]();
	    return (data === null);
	};
 
	Cnds.prototype.TransactionInIsNull = function ()
	{
        var data =(this.onTransaction_input === null)? null: this.onTransaction_input;
	    return (data === null);
	}; 

	Cnds.prototype.IsTransactionAborted = function ()
	{
	    return (!this.onTransaction_committed);
	};     
    
	Cnds.prototype.OnTransactionComplete = function (cb)
	{
	    return cr.equals_nocase(cb, this.onTransaction_completed_cb);
	}; 	

	Cnds.prototype.OnTransactionError = function (cb)
	{
	    return cr.equals_nocase(cb, this.onTransaction_completed_cb);
	};   
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
      
    Acts.prototype.SetDomainRef = function (ref)
	{
	    this.rootpath = ref + "/"; 
	}; 	
    
	var onComplete_get = function (self, onComplete_cb)
	{
	    if ((onComplete_cb === null) || (onComplete_cb === ""))
	        return;
	        
	    var handler = function(error) 
	    {
	        self.onComplete_cb = onComplete_cb;    
	        self.onComplete_error = error; 
	        var trig = (error)? cr.plugins_.Rex_Firebase.prototype.cnds.OnError:
	                            cr.plugins_.Rex_Firebase.prototype.cnds.OnComplete;
	        self.runtime.trigger(trig, self); 
	        self.onComplete_cb = null;
	        self.onComplete_error = null;   
        };
        return handler;
	};
      
    Acts.prototype.SetValue = function (k, v, onComplete_cb)
	{
	    var handler = onComplete_get(this, onComplete_cb);
	    this.get_ref(k)["set"](v, handler);
	}; 

    Acts.prototype.SetJSON = function (k, v, onComplete_cb)
	{
	    var handler = onComplete_get(this, onComplete_cb);	    
	    this.get_ref(k)["set"](JSON.parse(v), handler);
	}; 

    Acts.prototype.UpdateJSON = function (k, v, onComplete_cb)
	{
	    var handler = onComplete_get(this, onComplete_cb);	 	    
	    this.get_ref(k)["update"](JSON.parse(v), handler);
	}; 	

    Acts.prototype.PushValue = function (k, v, onComplete_cb)
	{
	    var handler = onComplete_get(this, onComplete_cb);
	    var ref = this.get_ref(k)["push"](v, handler);
		this.last_push_ref = k + "/" +  ref["key"]();
	}; 

    Acts.prototype.PushJSON = function (k, v, onComplete_cb)
	{
	    var handler = onComplete_get(this, onComplete_cb);	    
	    var ref = this.get_ref(k)["push"](JSON.parse(v), handler);
		this.last_push_ref = k + "/" + ref["key"]();
	};
	
    Acts.prototype.Transaction = function (k, onTransaction_cb, onComplete_cb)
	{ 
        var self = this;  

	    var _onComplete = function(error, committed, snapshot) 
	    {
	        self.onTransaction_completed_cb = onComplete_cb;    
	        self.onComplete_error = error; 
            self.onTransaction_committed = committed;
            self.onTransaction_committedValue = snapshot["val"]();
            
	        var trig = (error)? cr.plugins_.Rex_Firebase.prototype.cnds.OnTransactionError:
	                            cr.plugins_.Rex_Firebase.prototype.cnds.OnTransactionComplete;
	        self.runtime.trigger(trig, self); 
	        self.onTransaction_completed_cb = null;
	        self.onComplete_error = null;   
        };
        
        var _onTransaction = function(current_value)
        {
            self.onTransaction_cb = onTransaction_cb;	  
            self.onTransaction_input = current_value;
            self.onTransaction_output = null;
            self.runtime.trigger(cr.plugins_.Rex_Firebase.prototype.cnds.OnTransaction, self); 
            self.onTransaction_cb = null;
            
            if (self.onTransaction_output === null)
                return;
            else
                return self.onTransaction_output;
        };
	    this.get_ref(k)["transaction"](_onTransaction, _onComplete);
	};
	
    Acts.prototype.ReturnTransactionValue = function (v)
	{
	    this.onTransaction_output = v;
	}; 
	
    Acts.prototype.ReturnTransactionJSON = function (v)
	{
	    this.onTransaction_output = JSON.parse(v);
	}; 	
	
    Acts.prototype.Remove = function (k, onComplete_cb)
	{
	    var handler = onComplete_get(this, onComplete_cb);	    
	    this.get_ref(k)["remove"](handler);
	}; 	

    Acts.prototype.SetBooleanValue = function (k, b, onComplete_cb)
	{
	    var handler = onComplete_get(this, onComplete_cb);
	    this.get_ref(k)["set"]((b==1), handler);
	};	
	
    Acts.prototype.PushBooleanValue = function (k, b, onComplete_cb)
	{
	    var handler = onComplete_get(this, onComplete_cb);
	    var ref = this.get_ref(k)["push"]((b==1), handler);
		this.last_push_ref = k + "/" +  ref["key"]();
	}; 	

    Acts.prototype.SetServerTimestamp = function (k, onComplete_cb)
	{
	    var handler = onComplete_get(this, onComplete_cb);
	    this.get_ref(k)["set"](window["Firebase"]["ServerValue"]["TIMESTAMP"], handler);
	};	
	
    Acts.prototype.PushServerTimestamp = function (k, onComplete_cb)
	{
	    var handler = onComplete_get(this, onComplete_cb);
	    var ref = this.get_ref(k)["push"](window["Firebase"]["ServerValue"]["TIMESTAMP"], handler);
		this.last_push_ref = k + "/" +  ref["key"]();
	}; 		
    Acts.prototype.AddReadingCallback = function (k, type_, cbName)
	{
	    this.add_callback(this.get_ref(k), type_, cbName);                        
	}; 		
	
    Acts.prototype.RemoveReadingCallback = function (k, type_, cbName)
	{
        var absRef = (k != null)? this.get_ref(k)["toString"](): null;
        var eventType = (type_ != null)? EVENTTYPEMAP[type_]: null;
        this.callbackMap.Remove(absRef, eventType, cbName);
	};
	
    Acts.prototype.AddReadingCallbackOnce = function (k, type_, cbName)
	{
	    this.add_callback_once(this.get_ref(k), type_, cbName);                        
	}; 

    Acts.prototype.RemoveRefOnDisconnect = function (k)
	{
	    this.get_ref(k)["onDisconnect"]()["remove"]();
	}; 

    Acts.prototype.SetValueOnDisconnect = function (k, v)
	{
	    this.get_ref(k)["onDisconnect"]()["set"](v);
	};	

    Acts.prototype.UpdateJSONOnDisconnect = function (k, v)
	{
	    this.get_ref(k)["onDisconnect"]()["update"](JSON.parse(v));
	};	

    Acts.prototype.CancelOnDisconnect = function (k)
	{
	    this.get_ref(k)["onDisconnect"]()["cancel"]();
	};
	
	
    // query
    var get_query = function (queryObjs)
    {
	    if (queryObjs == null)
	        return;	        
        var query = queryObjs.instances[0];
        if (query == null)
            return;
            
        return query.GetQuery();
    };
    Acts.prototype.AddQueryCallback = function (queryObjs, type_, cbName)
	{
        var refObj = get_query(queryObjs);
        if (refObj == null)
            return;
            
        this.add_callback(refObj, type_, cbName);                        
	};	

    Acts.prototype.AddQueryCallbackOnce = function (queryObjs, type_, cbName)
	{
        var refObj = get_query(queryObjs);
        if (refObj == null)
            return;
            	    
	   this.add_callback_once(refObj, type_, cbName);   
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
	
	Exps.prototype.Domain = function (ret)
	{
		ret.set_string(this.rootpath);
	}; 
	
	Exps.prototype.TransactionIn = function (ret, default_value)
	{	
		ret.set_any(get_data(this.onTransaction_input, default_value));
	};
	
	Exps.prototype.LastData = function (ret, default_value)
	{	
        var data =(this.snapshot === null)? null: this.snapshot["val"]();
		ret.set_any(get_data(data, default_value));
	};
	
	Exps.prototype.LastKey = function (ret, default_value)
	{	
        var key =(this.snapshot === null)? null: this.snapshot["key"]();
		ret.set_any(get_data(key, default_value));
	};
	
	Exps.prototype.PrevChildName = function (ret, default_value)
	{	
		ret.set_any(get_data(this.prevChildName, default_value));
	};	

	Exps.prototype.TransactionResult = function (ret, default_value)
	{	
		ret.set_any(get_data(this.onTransaction_committedValue, default_value));
	};
	
	Exps.prototype.LastPushRef = function (ret)
	{
		ret.set_string(this.last_push_ref);
	};  
	
}());

(function ()
{
    if (window.FirebaseCallbackMapKlass != null)
        return;    
    
    var CallbackMapKlass = function ()
    {
        this.map = {};
    };
    
    var CallbackMapKlassProto = CallbackMapKlass.prototype;

	CallbackMapKlassProto.Reset = function(k)
	{
        for (var k in this.map)
            delete this.map[k];
	}; 
	    
	CallbackMapKlassProto.get_ref = function(k)
	{
        return new window["Firebase"](k);
	};    
	
	CallbackMapKlassProto.get_callback = function(absRef, eventType, cbName)
	{
        if (!this.IsExisted(absRef, eventType, cbName))
            return null;
    
        return this.map[absRef][eventType][cbName];
	};

    CallbackMapKlassProto.IsExisted = function (absRef, eventType, cbName)
    {
        if (!this.map.hasOwnProperty(absRef))
            return false;
        
        if (!eventType)  // don't check event type
            return true;
         
        var eventMap = this.map[absRef];
        if (!eventMap.hasOwnProperty(eventType))
            return false;
            
        if (!cbName)  // don't check callback name
            return true;
                                    
        var cbMap = eventMap[eventType];
        if (!cbMap.hasOwnProperty(cbName))
            return false;
        
        return true;     
    };
    
	CallbackMapKlassProto.Add = function(query, eventType, cbName, cb)
	{
	    var absRef = query["toString"]();
        if (this.IsExisted(absRef, eventType, cbName))
            return;
            	    
        if (!this.map.hasOwnProperty(absRef))
            this.map[absRef] = {};
        
        var eventMap = this.map[absRef];
        if (!eventMap.hasOwnProperty(eventType))
            eventMap[eventType] = {};

        var cbMap = eventMap[eventType];
        cbMap[cbName] = cb;
        
	    query["on"](eventType, cb);         
	};
       
	CallbackMapKlassProto.Remove = function(absRef, eventType, cbName)
	{
	    if ((absRef != null) && (typeof(absRef) == "object"))
	        absRef = absRef["toString"]();
	        
        if (absRef && eventType && cbName)
        {
            var cb = this.get_callback(absRef, eventType, cbName);
            if (cb == null)
                return;                
            this.get_ref(absRef)["off"](eventType, cb);  
            delete this.map[absRef][eventType][cbName];
        }
        else if (absRef && eventType && !cbName)
        {
            var eventMap = this.map[absRef];
            if (!eventMap)
                return;
            var cbMap = eventMap[eventType];
            if (!cbMap)
                return;
            this.get_ref(absRef)["off"](eventType); 
            delete this.map[absRef][eventType];
        }
        else if (absRef && !eventType && !cbName)
        {
            var eventMap = this.map[absRef];
            if (!eventMap)
                return;
            this.get_ref(absRef)["off"](); 
            delete this.map[absRef];
        }  
        else if (!absRef && !eventType && !cbName)
        {
            for (var r in this.map)
            {
                this.get_ref(r)["off"](); 
                delete this.map[r];
            } 
        }  
	}; 
	
	CallbackMapKlassProto.RemoveAllCB = function(absRef)
	{
	    if (absRef)
	    {
            var eventMap = this.map[absRef];
            for (var e in eventMap)
            {
                var cbMap = eventMap[e];
                for (var cbName in cbMap)
                {
                    this.get_ref(absRef)["off"](e, cbMap[cbName]);  
                }
            }
            
            delete this.map[absRef];
	    }
	    else if (!absRef)
	    {
            for (var r in this.map)
            {
                var eventMap = this.map[r];
                for (var e in eventMap)
                {
                    var cbMap = eventMap[e];
                    for (var cbName in cbMap)
                    {
                        this.get_ref(r)["off"](e, cbMap[cbName]);  
                    }
                }
                
                delete this.map[r];
            }
        } 	    
	};	
    
    CallbackMapKlassProto.getDebuggerValues = function (propsections)
    {
        var r, eventMap, e, cbMap, cn, display;
        for (r in this.map)
        {
            eventMap = this.map[r];
            for (e in eventMap)
            {
                cbMap = eventMap[e];
                for (cn in cbMap)
                {
                    display = cn+":"+e+"-"+r;
                    propsections.push({"name": display, "value": ""});
                }
            }
        }
    };
    
    CallbackMapKlassProto.GetRefMap = function ()
    {
        return this.map;
    };    
    
	window.FirebaseCallbackMapKlass = CallbackMapKlass;
}()); 