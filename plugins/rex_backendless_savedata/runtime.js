/*
<save-slots>  
    // primary-keys
    userID - userID    
    slotName - slot name
    
    // header keys
    ....
    
    // other properties
    ....
*/


// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Backendless_saveslot = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Backendless_saveslot.prototype;
		
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
        var self = this;
        var myInit = function()
        {
            self.myInit();
        };
        window.BackendlessAddInitCallback(myInit);
	};        
    
	instanceProto.myInit = function()
	{  
        this.saveSlotKlassName = this.properties[0];
        this.saveSlotKlass = window.BackendlessGetKlass(this.saveSlotKlassName); 
        this.saveSlotStorage = window["Backendless"]["Persistence"]["of"](this.saveSlotKlass);
        
        this.headerKeys = this.initHeaderKeys(this.properties[1]);
        this.cacheModeEnable = (this.properties[2] === 1);        

        this.ownerID = "";
        
        if (!this.recycled)        
		    this.saveSlot = {};		
		    
		this.load_headers = null;
		this.load_body = null;
	    this.cacheSlotObj = null;        
		
		this.exp_CurSlotName = "";
		
		if (!this.recycled)
		    this.exp_CurHeader = {};
        
        this.exp_CurKey = "";
        this.exp_CurValue = 0;        
		this.exp_LastSlotName = null;
        this.last_error = null;
	};
            
	instanceProto.onDestroy = function ()
	{
        this.headerKeys.length = 0;
		this.load_headers = null;
		this.load_body = null;
        
		clean_table( this.saveSlot );	        
        clean_table( this.exp_CurHeader );
        this.last_error = null;        
	};       
    
	instanceProto.initHeaderKeys = function (keysString)
	{ 
        var headerKeys = keysString.split(",");
        headerKeys.push("objectId");        
        headerKeys.push("userID");
        headerKeys.push("slotName");        
        headerKeys.push("created");
        headerKeys.push("updated");   

        return  headerKeys;      
	};	    
    
    var reverEval = function (value)
    {
        if (typeof(value) === "string")
            value = "'" + value + "'";
        
        return value;
    }    
    
	instanceProto.get_query = function (userID, slotName, headerKeys)
	{ 
        var conds = [];
        conds.push("userID=" + reverEval(userID));
        
        if (slotName != null)        
            conds.push("slotName=" + reverEval(slotName));

        var cond = conds.join(" AND ");
        var query = new window["Backendless"]["DataQuery"]();
        query["condition"] = cond;
        query["options"] = {
            "offset": 0,
        };
        
        if (slotName != null)
            query["options"]["pageSize"] = 1;
        
        if (headerKeys)
            query["properties"] = headerKeys;     
        
	    return query;  
	};	
    
    instanceProto.readSlotObjectId = function (slotName, handler)
	{
        var query = this.get_query(this.ownerID, slotName);        
        query["properties"] = ["objectId"];        
        window.BackendlessQuery(this.saveSlotStorage, query, handler);
	};
    
	instanceProto.updateHeader = function(slotName, slotObj)
	{
        var hasSlot = (this.load_headers && this.load_headers.hasOwnProperty(slotName));
        if (slotObj == null)  // remove
        {
            if (hasSlot)
                delete this.load_headers[slotName];
        }
        else    // update or add
        {
            var slot;
            if (hasSlot)
                slot = this.load_headers[slotName];
            else
                slot = {};
            
            var i,cnt=this.headerKeys.length, k;
            for(i=0; i<cnt;i++)
            {
                k = this.headerKeys[i];
                slot[k] = slotObj[ k ];
            }
            
            if (!hasSlot)
            {
                if (this.load_headers == null)
                    this.load_headers = {};
                
                this.load_headers[slotName] = slot;
            }
        }
	}; 
    
	instanceProto.getCacheObject = function(ownerID, slotName)
	{ 
        if (!this.cacheModeEnable)
            return null;
        
        if (this.load_headers && this.load_headers.hasOwnProperty(slotName))
            return this.load_headers[slotName];
	    if (this.cacheSlotObj == null)	
            return null;        
        if (ownerID != this.cacheSlotObj["userID"])
            return null;        
        if (slotName != this.cacheSlotObj["slotName"])
            return null;
        
        return this.cacheSlotObj;
	};   

    instanceProto.updateCacheData = function (slotName, saveSlot)
	{		    
        if (slotName === this.exp_LastSlotName)
        {
            if (this.load_body == null)
                this.load_body = {};
            for (var n in saveSlot)
            {
                setItemValue(n, saveSlot[n], this.load_body);
            }
        }
	}; 

	var clean_table = function (o)
	{
        if (o == null)
            o = {};
        else
        {
		    for (var k in o)
		        delete o[k];
        }
        
        return o;
	};	
	
	var is_empty = function (o)
	{
        if (o == null)
            return true;
        
		for (var k in o)
		    return false;
	    return true;
	};	
    
	var setItemValue = function(keys, value, root)
	{        
        if (typeof (keys) === "string")
            keys = keys.split(".");
        
        var lastKey = keys.pop(); 
        var entry = getEntry(keys, root);
        entry[lastKey] = value;
	};    

	var getEntry = function(keys, root)
	{
        var entry = root;
        if ((keys === "") || (keys.length === 0))
        {
            //entry = root;
        }
        else
        {
            if (typeof (keys) === "string")
                keys = keys.split(".");
            
            var i,  cnt=keys.length, key;
            for (i=0; i< cnt; i++)
            {
                key = keys[i];
                if ( (entry[key] == null) || (typeof(entry[key]) !== "object") )                
                    entry[key] = {};
                
                entry = entry[key];            
            }           
        }
        
        return entry;
	};      
    
    
	/**BEGIN-PREVIEWONLY**/
    // slightly modified neet simple function from Pumbaa80
    // http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript#answer-7220510
    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); // basic html escaping
        return json
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'red';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'blue';
                    } else {
                        cls = 'green';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'Sienna';
                } else if (/null/.test(match)) {
                    cls = 'gray';
                }
                return '<span style="color:' + cls + ';">' + match + '</span>';
            })
            .replace(/\t/g,"&nbsp;&nbsp;") // to keep indentation in html
            .replace(/\n/g,"<br/>");       // to keep line break in html
    };
    var color_JSON = function (o)
    {
        var val = syntaxHighlight(JSON.stringify(o));
        return "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+val+"</style>";
    };
    
	instanceProto.getDebuggerValues = function (propsections)
	{
        var prop = [];
        if (this.load_body)
        {
            for (var n in this.load_body)
            {
                prop.push({"name": n,  
                    "value": color_JSON(this.load_body[n]), 
                    "html": true,
                    "readonly":true});
            }
        }
        
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

	Cnds.prototype.OnSaveComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnSaveError = function ()
	{
	    return true;
	};

	Cnds.prototype.OnGetAllHeaders = function ()
	{
	    return true;
	};
	Cnds.prototype.ForEachHeader = function ()
	{
	    if (this.load_headers == null)
		    return false;
			
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		var k, o=this.exp_CurHeader;
		for(k in this.load_headers)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurSlotName = k;
            this.exp_CurHeader = this.load_headers[k];
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
		    
        this.exp_CurSlotName = "";			
        this.exp_CurHeader = o;       		
		return false;
	};

	Cnds.prototype.OnGetBodyComplete = function ()
	{
	    return true;
	};

	Cnds.prototype.OnGetBodyError = function ()
	{
	    return true;
	};	

	Cnds.prototype.IsEmpty = function ()
	{
	    if (this.load_headers == null)
	        return true;
	    	    
	    return is_empty(this.load_headers);
	};	

	Cnds.prototype.IsOccupied = function (slotName)
	{
	    if (this.load_headers == null)
	        return false;
	    	    
	    return this.load_headers.hasOwnProperty(slotName);
	};		
    
	Cnds.prototype.OnGetAllHeadersError = function ()
	{
	    return true;
	};
    

	Cnds.prototype.ForEachKeyInHeader = function (slotName)
	{
	    if (!this.load_headers || !this.load_headers[slotName])
		    return false;
			
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		var k, header = this.load_headers[slotName];
		for(k in header)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurKey = k;
            this.exp_CurValue = header[this.exp_CurKey];
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
 		
		return false;
	};
    
	Cnds.prototype.ForEachKeyInBody = function ()
	{
	    if (!this.load_body)
		    return false;
			
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		for(var k in  this.load_body)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurKey = k;
            this.exp_CurValue = this.load_body[this.exp_CurKey];
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
		         		
		return false;
	};        
    
	Cnds.prototype.OnCleanComplete = function ()
	{
	    return true;
	};

	Cnds.prototype.OnCleanError = function ()
	{
	    return true;
	};		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
    Acts.prototype.AddHeaderKey = function (k)
	{
        this.headerKeys.push(k)
	};
    
    Acts.prototype.SetOwner = function (userID)
	{
        this.ownerID = userID;
        this.exp_LastSlotName = null;
        this.load_headers = null;
        this.load_body = null;
	    this.cacheSlotObj = null;              
	};
	
    Acts.prototype.SetValue = function (k, v)
	{
		this.saveSlot[k] = v;
	};
	
    Acts.prototype.Save = function (slotName)
	{
        this.saveSlot["userID"] = this.ownerID;
        this.saveSlot["slotName"] = slotName;
	    var self = this;
        
        // final callback
	    var on_success = function(slotObj)
	    {
            self.exp_LastSlotName = slotName;
            window.BackendlessCleanRedundant(slotObj);
            self.updateHeader(slotName, slotObj);
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_saveslot.prototype.cnds.OnSaveComplete, self);
	    };
        
	    var on_error = function(error)
	    {
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_saveslot.prototype.cnds.OnSaveError, self);
	    };        
        // final callback        
        
        // step2. save slot
	    var save = function(slotObj)
	    {
            if (slotObj)
                self.cacheSlotObj = slotObj;
            
            self.updateCacheData(slotName, self.saveSlot);
            slotObj = window.BackendlessFillData(self.saveSlot, slotObj, self.saveSlotKlassName);             
            var handler = new window["Backendless"]["Async"]( on_success, on_error );
            self.saveSlotStorage["save"](slotObj, handler);
	    };
        var on_read = function(result)
        {
            save(result["data"][0]);
        }
        // step2. save slot
        
        // step1. get slot object
        var slotObj = this.getCacheObject(this.ownerID, slotName);
        var handler = new window["Backendless"]["Async"]( on_read, on_error );
        if (slotObj == null)
            this.readSlotObjectId(slotName, handler);	
        else
            save(slotObj);
	};

	
    Acts.prototype.SetBooleanValue = function (k, b)
	{
		this.saveSlot[k] = (b===1);
	};
		
    Acts.prototype.GetAllHeaders = function ()
	{
		var self = this;
        
        // final callback        
	    var on_success = function(result)
	    {	 
            var items = result["data"];
            self.load_headers = clean_table(self.load_headers);
            var i,cnt=items.length, slotObj;
            for(i=0; i<cnt; i++)
            {
                slotObj = items[i]; 
                window.BackendlessCleanRedundant(slotObj);
                self.load_headers[slotObj["slotName"]] = slotObj;
            }
            self.runtime.trigger(cr.plugins_.Rex_Backendless_saveslot.prototype.cnds.OnGetAllHeaders, self); 
	    };	    
	    var on_error = function(error)
	    {
            self.load_headers = null;
            self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_saveslot.prototype.cnds.OnGetAllHeadersError, self); 
	    };
        // final callback
        
        var handler = new window["Backendless"]["Async"]( on_success, on_error );
		var query = this.get_query(this.ownerID, null, this.headerKeys);
        window.BackendlessQuery(this.saveSlotStorage, query, handler);
	};
	
    Acts.prototype.GetSlotBody = function (slotName)
	{
		var self = this;
        // final callback        
	    var on_success = function(result)
	    {	
            self.load_body = result["data"][0];
            window.BackendlessCleanRedundant(self.load_body);
            if (self.load_body)
                self.cacheSlotObj = self.load_body;            
            self.runtime.trigger(cr.plugins_.Rex_Backendless_saveslot.prototype.cnds.OnGetBodyComplete, self); 
	    };	    
	    var on_error = function(error)
	    {
            self.load_body = null;
            self.last_error = error;
            self.cacheSlotObj = null;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_saveslot.prototype.cnds.OnGetBodyError, self); 
	    };
        // final callback        
                
        var handler = new window["Backendless"]["Async"]( on_success, on_error );
		var query = this.get_query(this.ownerID, slotName);
        window.BackendlessQuery(this.saveSlotStorage, query, handler);
	};
	
    Acts.prototype.CleanAll = function ()
	{
	    var self = this;
        
        // final callback           
	    var on_success = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_saveslot.prototype.cnds.OnCleanComplete, self);
	    };        
	    var on_error = function(error)
	    {
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_saveslot.prototype.cnds.OnCleanError, self);
	    };
        // final callback   

        var query = this.get_query(this.ownerID);   
        var handler = new window["Backendless"]["Async"]( on_success, on_error );       
        window.BackendlessRemoveAllItems(this.saveSlotStorage, query, handler);
        this.cacheSlotObj = null;   
        this.load_headers = clean_table(this.load_headers);
	};		
	
    Acts.prototype.CleanSlot = function (slotName)
	{
	    var self = this;
        
        // final callback       
	    var on_success = function()
	    {
            self.updateHeader(slotName, null);
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_saveslot.prototype.cnds.OnCleanComplete, self);
	    };
        
	    var on_error = function(error)
	    {
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_saveslot.prototype.cnds.OnCleanError, self);
	    };
        // final callback        

        // step2. clean slot
	    var clean = function(result)
	    {
            var slotObj = result["data"][0];
            if (!slotObj)
                return;
                
            var handler = new window["Backendless"]["Async"]( on_success, on_error );
            self.saveSlotStorage["remove"](slotObj, handler);
	    };
        // step2. clean slot
        
        // step1. get slot object
        var slotObj = this.getCacheObject(this.ownerID, slotName);
        var handler = new window["Backendless"]["Async"]( clean, on_error );
        if (slotObj == null)
            this.readSlotObjectId(slotName, handler);	        
        else
        {
            this.cacheSlotObj = null;
            clean([slotObj]);
        }
	};
	
    Acts.prototype.InitialTable = function ()
	{	
        var headerObj = new this.saveSlotKlass();
	    headerObj["userID"] = "";   
 	    headerObj["slotName"] = "";             
	    window.BackendlessInitTable(this.saveSlotStorage, headerObj);
	}; 		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.CurSlotName = function (ret)
	{
		ret.set_string(this.exp_CurSlotName);
	};
	
	Exps.prototype.CurHeaderValue = function (ret, key_, default_value)
	{
		ret.set_any(window.BackendlessGetItemValue(this.exp_CurHeader, key_, default_value));
	};	
	
	Exps.prototype.BodyValue = function (ret, key_, default_value)
	{	
		ret.set_any(window.BackendlessGetItemValue(this.load_body, key_, default_value));
	};

	Exps.prototype.HeaderValue = function (ret, slotName, key_, default_value)
	{	
        var value;
        if (this.load_headers)
        {
            if (slotName == null)
                value = this.load_headers;
            else
                value = this.load_headers[slotName];
            
            value = window.BackendlessGetItemValue(value, key_, default_value);
        }
        else
            value = default_value || 0;
		ret.set_any(value);
	};	
	
	Exps.prototype.KeyLastSaveTime = function (ret)
	{
		ret.set_string("updated");
	};		
	
	Exps.prototype.LastSlotName = function (ret)
	{
		ret.set_string(this.exp_LastSlotName || "");
	};			
    
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

	Exps.prototype.CurKey = function (ret)
	{
		ret.set_any(this.exp_CurKey);
	};		  
    
	Exps.prototype.CurValue = function (ret)
	{
		ret.set_any(this.exp_CurValue);
	};	
    
    Exps.prototype.HeadersAsItemList = function (ret)
	{
        var itemList = [];
        if (this.load_headers)
        {
            var n;
            for(n in this.load_headers)
            {
                itemList.push(this.load_headers[n]);
            }
        }
        
        var json_ = JSON.stringify(itemList);        
		ret.set_string(json_);
	};	     
    
}());