/*
<UserID>
    headers\
	    <slotName>
		    <key> - value

	bodies\
	    <slotName>
		    <key> - value
	
*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_SaveSlot = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_SaveSlot.prototype;
		
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
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/";        

        this.ownerID = "";

        this.error = null;             
		this.save_header = {};
		this.save_body = {};
		this.save_item = {};
		
		this.load_headers = null;
		this.load_body = null;
        this.exp_LastSlotName = null;
		
		this.exp_CurSlotName = "";		
		this.exp_CurHeader = {};
        this.exp_CurKey = "";
        this.exp_CurValue = 0;      
	};
	
	instanceProto.onDestroy = function ()
	{		    
		this.save_header = {};
		this.save_body = {};
		this.save_item = {};
        
		this.load_headers = null;
		this.load_body = null;        
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
	
	instanceProto.get_ref = function(k)
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
    
    var get_key = function (obj)
    {       
        return (!isFirebase3x())?  obj["key"]() : obj["key"];
    };
    
    var get_refPath = function (obj)
    {       
        return (!isFirebase3x())?  obj["ref"]() : obj["ref"];
    };    
    
    var get_root = function (obj)
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

    var get_timestamp = function (obj)    
    {       
        return (!isFirebase3x())?  obj : obj["TIMESTAMP"];
    };    
    // 2.x , 3.x 
	
	var is_empty = function (o)
	{
		for (var k in o)
        {
            if (o[k] !== null)
		        return false;
        }
	    return true;
	};


    var get_path = function (slot_name, is_body, key)
    {
        key = key.replace(re_ALLDOT, "/");
        var p = (is_body)? "bodies":"headers";
        p += "/" + slot_name + "/" + key;
        return p;
    };	
    
	instanceProto.updateCacheData = function (slot_name, save_header, save_body)
	{		    
        if (this.load_headers == null)
            this.load_headers = {};
        if (!this.load_headers.hasOwnProperty(slot_name))
            this.load_headers[slot_name] = {};
        
        var load_header = this.load_headers[slot_name];
        for(var n in save_header)
        {
            n = setItemValue(n, save_header[n], load_header);
        }
        
        if (slot_name === this.exp_LastSlotName)
        {
            if (this.load_body == null)
                this.load_body = {};
            for (var n in save_body)
            {
                setItemValue(n, save_body[n], this.load_body);
            }
        }
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
        var prop = [
            {"name": "OwnerID",  "value": this.ownerID, "readonly":true},
            {"name": "Slot name",  "value": this.exp_LastSlotName || "", "readonly":true}
        ];
        
        
        if (this.exp_LastSlotName && this.load_headers && 
            this.load_headers.hasOwnProperty(this.exp_LastSlotName))
        {
            var header = this.load_headers[this.exp_LastSlotName];
            for (var n in header)
            {
                prop.push({"name": "Header-" + n,  
                    "value": color_JSON(header[n]), 
                    "html": true,
                    "readonly":true});
            }
        }
        
        if (this.load_body)
        {
            for (var n in this.load_body)
            {
                prop.push({"name": "Body-" + n,  
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
	
	Cnds.prototype.OnSave = function ()
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
	Cnds.prototype.ForEachHeader = function (slot_name)
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

	Cnds.prototype.OnGetBody = function ()
	{
	    return true;
	};

	Cnds.prototype.OnGetUnusedBody = function ()
	{
	    return true;
	};	

	Cnds.prototype.AllSlotAreEmpty = function ()
	{
	    if (this.load_headers == null)
	        return true;
	    	    
	    return is_empty(this.load_headers);
	};	

	Cnds.prototype.IsOccupied = function (slot_name)
	{
	    if (this.load_headers == null)
	        return false;
	    	    
	    return this.load_headers.hasOwnProperty(slot_name);
	};		
    
	Cnds.prototype.ForEachKeyInHeader = function (slot_name)
	{
	    if (!this.load_headers || !this.load_headers[slot_name])
		    return false;
			
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		var k, header = this.load_headers[slot_name];
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
    
	Cnds.prototype.BodyIsInvalid = function ()
	{
	    return (this.load_body == null);
	};	
    
	Cnds.prototype.OnClean = function ()
	{
	    return true;
	};

	Cnds.prototype.OnCleanError = function ()
	{
	    return true;
	};		
    
	Cnds.prototype.OnGetAllHeadersError = function ()
	{
	    return true;
	};

	Cnds.prototype.OnGetBodyError = function ()
	{
	    return true;
	};	    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
    Acts.prototype.SetOwner = function (id)
	{
        this.ownerID = id;
        this.exp_LastSlotName = null;
        this.load_body = null;
        this.load_headers = null;
	};
	
    var re_ALLDOT = new RegExp(/\./, 'g');    
    Acts.prototype.SetValue = function (k, v, is_body)
	{
        var table = (is_body==1)? this.save_body:this.save_header;
        k = k.replace(re_ALLDOT, "/");
		table[k] = v;
	};
	
    Acts.prototype.Save = function (slot_name)
	{
		var self = this;				
	    var on_complete = function(error) 
	    {
            self.error = error;
			var trig = (!error)? cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnSave:
				                 cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnSaveError;
			self.runtime.trigger(trig, self); 					   
        };
		
        if (is_empty(this.save_header))
		    this.save_header["is-used"] = true;
			
        var k;
        for (k in this.save_header)
            this.save_item[ get_path(slot_name, false, k) ] = this.save_header[k];
            
        for (k in this.save_body)
            this.save_item[ get_path(slot_name, true, k) ] = this.save_body[k];            
	    
	    var ref = this.get_ref(this.ownerID);	
        ref["update"](this.save_item, on_complete);		
		
        this.updateCacheData(slot_name, this.save_header, this.save_body);
        this.save_header = {};
        this.save_body = {};
        this.save_item = {};
	};
    	
    Acts.prototype.SetBooleanValue = function (k, b, is_body)
	{
        var table = (is_body==1)? this.save_body:this.save_header;
		table[k] = (b==1);
	};
    
    Acts.prototype.SetJSON = function (k, v, is_body)
	{
        var table = (is_body==1)? this.save_body:this.save_header;
		table[k] = JSON.parse(v);
	};	
    	
    Acts.prototype.RemoveKey = function (k, is_body)
	{
        var table = (is_body==1)? this.save_body:this.save_header;
		table[k] = null;
	};	    
    	
    Acts.prototype.SetBooleanValue = function (k, b, is_body)
	{
        var table = (is_body==1)? this.save_body:this.save_header;
		table[k] = (b==1);
	};
	
    Acts.prototype.GetAllHeaders = function ()
	{
	    var ref = this.get_ref(this.ownerID)["child"]("headers");
		
		var self = this;
        var on_read = function (snapshot)
        {   
            self.error = null;
            self.load_headers = snapshot.val();
            self.runtime.trigger(cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnGetAllHeaders, self); 
        };
        var on_read_failure = function(error)
        {
            self.error = error;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnGetAllHeadersError, self);                         
        };        
			
		ref["once"]("value", on_read, on_read_failure);
	};
	
    Acts.prototype.GetSlotBody = function (slot_name)
	{
	    var ref = this.get_ref(this.ownerID)["child"]("bodies")["child"](slot_name);
		
		var self = this;
        var on_read = function (snapshot)
        {   
            self.exp_LastSlotName = slot_name;
            self.load_body = snapshot.val();
            self.error = null;            
			var trig = (self.load_body!=null)? cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnGetBody:
				                               cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnGetUnusedBody;
            self.runtime.trigger(trig, self); 
        };
        var on_read_failure = function(error)
        {
            self.error = error;
            self.exp_LastSlotName = slot_name;
            self.load_body = null;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnGetBodyError, self);               
        };              
			
		ref["once"]("value", on_read, on_read_failure);
	};

    Acts.prototype.CleanSlot = function (slot_name)
	{		
		var self = this;		
	    var on_complete = function(error) 
	    {
            self.error = error;
			var trig = (!error)? cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnClean:
				                 cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnCleanError;
			self.runtime.trigger(trig, self); 					   
        };
        
	    var ref = this.get_ref(this.ownerID);	
        var save_item = {};
        slot_name = (slot_name)? ("/"+slot_name) : "";
        save_item["headers" + slot_name] = null;
        save_item["bodies" + slot_name] = null;     
        ref["update"](save_item, on_complete);        
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.CurSlotName = function (ret)
	{
		ret.set_string(this.exp_CurSlotName);
	};
	
	Exps.prototype.CurHeaderValue = function (ret, key, default_value)
	{        
		ret.set_any( window.FirebaseGetValueByKeyPath(this.exp_CurHeader, key, default_value) );
	};	
	
	Exps.prototype.BodyValue = function (ret, key, default_value)
	{ 
		ret.set_any( window.FirebaseGetValueByKeyPath(this.load_body, key, default_value) );        
	};

	Exps.prototype.HeadersToJSON = function (ret)
	{
		ret.set_string(JSON.stringify(this.load_headers || {}));
	};	
	
	Exps.prototype.BodyToJSON = function (ret)
	{
		ret.set_string(JSON.stringify(this.load_body || {}));
	};	
	
	Exps.prototype.HeaderValue = function (ret, slot_name, key, default_value)
	{	
        var val = this.load_headers;
        if (slot_name)
            val = val[slot_name];
        
		ret.set_any( window.FirebaseGetValueByKeyPath(val, key, default_value) );  
	};		
    
	Exps.prototype.CurHeaderValue = function (ret, key, default_value)
	{
		ret.set_any( window.FirebaseGetValueByKeyPath(this.exp_CurHeader, key, default_value) );
	};	
    
	Exps.prototype.CurKey = function (ret)
	{
		ret.set_any(this.exp_CurKey);
	};		  
    
	Exps.prototype.CurValue = function (ret, subKey, default_value)
	{
		ret.set_any( window.FirebaseGetValueByKeyPath(this.exp_CurValue, subKey, default_value) );        
	};		
    
	Exps.prototype.LastSlotName = function (ret)
	{
		ret.set_any( this.exp_LastSlotName || "" );        
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