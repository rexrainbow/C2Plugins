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
        this.rootpath = this.properties[0]; 
        
        // ref cache
        this.ref_cache = {};
		// push
		this.last_push_ref = "";
        // transaction
        this.onTransaction_cb = "";
        this.onTransaction_input = null;
        this.onTransaction_output = null;
        // on complete
        this.onComplete_cb = "";
        this.onComplete_error = null;
        // reading
        this.reading_cb_map = {"value":{},
                               "child_added":{},
                               "child_changed":{},
                               "child_removed":{},
                               "child_moved":{}
                              };
                              
        this.reading_cb = "";
        this.snapshot = null;
		this.prevChildName = null;
	};
	
	instanceProto.get_ref = function(k)
	{
	    if (!this.ref_cache.hasOwnProperty(k))
	        this.ref_cache[k] = new window["Firebase"](this.rootpath + k);
	        
        return this.ref_cache[k];
	};
	
	instanceProto.get_query = function(k)
	{
        return new window["Firebase"](this.rootpath + k);
	};
	     
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
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
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
		this.last_push_ref = k + "/" +  ref.name();
	}; 

    Acts.prototype.PushJSON = function (k, v, onComplete_cb)
	{
	    var handler = onComplete_get(this, onComplete_cb);	    
	    var ref = this.get_ref(k)["push"](JSON.parse(v), handler);
		this.last_push_ref = k + "/" + ref.name();
	};
	
    Acts.prototype.Transaction = function (k, onTransaction_cb, onComplete_cb)
	{ 
        var self = this;  
        var _onTransaction = function(current_value)
        {
            self.onTransaction_cb = onTransaction_cb;	  
            self.onTransaction_input = current_value;
            self.onTransaction_output = null;
            self.runtime.trigger(cr.plugins_.Rex_Firebase.prototype.cnds.OnTransaction, self); 
            return self.onTransaction_output;
        };
        var _onComplete = onComplete_get(this, onComplete_cb);
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
    
    Acts.prototype.AddReadingCallback = function (k, type_, cb)
	{
	    var event_type = EVENTTYPEMAP[type_];	    
	    if (this.reading_cb_map[event_type].hasOwnProperty(cb))
	        return;
	        
	    var self = this;   
        var reading_handler = function (snapshot, prevChildName)
        {
            self.reading_cb = cb;   
            self.snapshot = snapshot;
			self.prevChildName = prevChildName;
            self.runtime.trigger(cr.plugins_.Rex_Firebase.prototype.cnds.OnReading, self); 
        };
        this.reading_cb_map[event_type][cb] = reading_handler;
	    this.get_query(k)["on"](event_type, reading_handler);                         
	}; 		
	
    Acts.prototype.RemoveReadingCallback = function (k, type_, cb)
	{
	    var event_type, reading_handler;	    
	    if (type_ !== null)
	    {
	        event_type = EVENTTYPEMAP[type_];
	    }
	    if ((type_ !== null) && (cb !== null))
	    {
	        event_type = EVENTTYPEMAP[type_];	
	        reading_handler = this.reading_cb_map[event_type][cb];
	        if (reading_handler == null)
	            return;
	    }

	    this.get_query(k)["off"](event_type, reading_handler);                         
	};
	
    Acts.prototype.AddReadingCallbackOnce = function (k, type_, cb)
	{
	    var event_type = EVENTTYPEMAP[type_];	    

	    var self = this;   
        var reading_handler = function (snapshot)
        {
            self.reading_cb = cb;   
            self.snapshot = snapshot;
            self.runtime.trigger(cr.plugins_.Rex_Firebase.prototype.cnds.OnReading, self); 
        };
	    this.get_query(k)["once"](event_type, reading_handler);                         
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
	    this.get_ref(k)["onDisconnect"]()["update"](v);
	};	
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
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
	
	Exps.prototype.TransactionIn = function (ret, default_value)
	{	
		ret.set_any(get_data(this.onTransaction_input, default_value));
	};
	
	Exps.prototype.LastData = function (ret, default_value)
	{	
		ret.set_any(get_data(this.snapshot["val"](), default_value));
	};
	
	Exps.prototype.LastKey = function (ret, default_value)
	{	
		ret.set_any(get_data(this.snapshot["name"](), default_value));
	};
	
	Exps.prototype.PrevChildName = function (ret, default_value)
	{	
		ret.set_any(get_data(this.prevChildName, default_value));
	};	
	
	
	Exps.prototype.LastPushRef = function (ret)
	{
		ret.set_string(this.last_push_ref);
	}; 
	
	Exps.prototype.TIMESTAMP = function (ret)
	{
		ret.set_int(this.fb["ServerValue"]["TIMESTAMP"]);
	}; 
	
}());