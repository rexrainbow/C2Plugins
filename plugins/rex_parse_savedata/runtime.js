// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_parse_saveslot = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_parse_saveslot.prototype;
		
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
	    if (!this.recycled)
	    {
		    this.header_klass = window["Parse"].Object["extend"](this.properties[0]);
		    this.body_klass = window["Parse"].Object["extend"](this.properties[1]);
		}
        
        this.acl_write_mode = this.properties[2];
        this.acl_read_mode = this.properties[3];
		
        this.owner_userID = "";
        
        if (!this.recycled)
        {
		    this.save_header = {};
		    this.save_body = {};
		}
		else
		{
		    clean_table( this.save_header );
		    clean_table( this.save_body );		    
		}
		    
		this.load_headers = null;
		this.load_body = null;
		
		this.exp_CurSlotName = "";
		
		if (!this.recycled)
		    this.exp_CurHeader = {};
		else
		    clean_table( this.exp_CurHeader );
        
        this.exp_CurKey = "";
        this.exp_CurValue = 0;        
		    
        this.last_error = null;
	};
    
	instanceProto.get_query = function (klass_obj, userID, slot_name)
	{ 
        var query = new window["Parse"]["Query"](klass_obj);
        query["equalTo"]("userID", userID);
        if (slot_name != null)
            query["equalTo"]("slotName", slot_name);
        return query;       
	};	
    
    instanceProto.read_slot = function (slot_name, on_success, on_error)
	{
        var read_type = (slot_name != null)? "first":"find";
	    var self = this;
        var read_body = function(header_obj)
        {
	        var on_read_body_success = function(obj)
	        {
                on_success(header_obj, obj);
	        };    
            var handler = {"success":on_read_body_success, "error": on_error};    
            var query = self.get_query(self.body_klass, self.owner_userID, slot_name);
            query["select"]("id");
            query[ read_type ](handler);        
        };
        
        var read_header = function()
        {
	        var on_read_header_success = function(obj)
	        {	 
	            if (!obj)
	                on_success(null, null);
	            else
                    read_body(obj);
	        };    
            var handler = {"success":on_read_header_success, "error": on_error};    
            var query = self.get_query(self.header_klass, self.owner_userID, slot_name);
            query["select"]("id");
            query[ read_type ](handler);
        };
        
		read_header();			
	};
    
    var get_itemValue = function (item, k, default_value)
	{
        var v;
	    if (item == null)
            v = null;
        else
        {
            if (k == null)
                v = item;
            else if (k === "id")
                v = item["id"];    
            else if ((k === "createdAt") || (k === "updatedAt"))
                v = item[k].getTime();
            else if (k.indexOf(".") == -1)
                v = item["get"](k);
            else
            {
                var kList = k.split(".");
                v = item;
                var i,cnt=kList.length;
                for(i=0; i<cnt; i++)
                {
                    if (typeof(v) !== "object")
                    {
                        v = null;
                        break;
                    }
                        
                    v = v["get"](kList[i]);
                }
            }
        }
        return din(v, default_value);
	};	

    var din = function (d, default_value)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (d == null)
        {
            if (default_value != null)
                o = default_value;
            else
                o = 0;
        }
        else if (typeof(d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
	    return o;
    };    
    
	var get_ACL = function (wm, rm)
	{
	    if ((wm === 0) && (rm === 0))
	        return null;	    
	    var current_user = window["Parse"]["User"]["current"]();
	    if (!current_user)
	        return null;
  	        
	    var acl = new window["Parse"]["ACL"](current_user);

        if (wm === 0)
            acl["setPublicWriteAccess"](true);
            
        if (rm === 0)
            acl["setPublicReadAccess"](true); 	
            
        return acl;	    
	};		
    
	var clean_table = function (o)
	{
		for (var k in o)
		    delete o[k];
	};	
	
	var is_empty = function (o)
	{
		for (var k in o)
		    return false;
	    return true;
	};	
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

	Cnds.prototype.IsOccupied = function (slot_name)
	{
	    if (this.load_headers == null)
	        return false;
	    	    
	    return this.load_headers.hasOwnProperty(slot_name);
	};		
    
	Cnds.prototype.OnGetAllHeadersError = function ()
	{
	    return true;
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
	
    Acts.prototype.SetOwner = function (id)
	{
        this.owner_userID = id;
	};
	
    Acts.prototype.SetValue = function (key_, value_, is_body)
	{
        var table = (is_body==1)? this.save_body:this.save_header;
		table[key_] = value_;
	};
	
    Acts.prototype.Save = function (slot_name)
	{
        this.save_header["userID"] = this.owner_userID;
        this.save_header["slotName"] = slot_name;
        this.save_body["userID"] = this.owner_userID;
        this.save_body["slotName"] = slot_name;        
        
	    var self = this;
        
	    var on_error = function(error)
	    {
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnSaveError, self);
	    };
        
	    // wait done
        var wait_events = 0; 	
	    var isDone_handler = function()
	    {
	        wait_events -= 1;
	        if (wait_events == 0)
	            self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnSaveComplete, self);
	    };
	    // wait done

        // save header and body
	    var save_slot = function(header_obj, body_obj)
	    {
            if (header_obj == null)
                header_obj = new self.header_klass();
            if (body_obj == null)
                body_obj = new self.body_klass();
            
            var acl = get_ACL(self.acl_write_mode, self.acl_read_mode);
            if (acl)
            {
                header_obj["setACL"](acl);
                body_obj["setACL"](acl);
            }
                
            var handler = {"success":isDone_handler, "error": on_error};
			wait_events += 1;
	        header_obj["save"](self.save_header, handler);
			wait_events += 1;
            body_obj["save"](self.save_body, handler);	

		    clean_table(self.save_header);	
		    clean_table(self.save_body);
	    };
        // save header and body
        
		this.read_slot(slot_name, save_slot, on_error);			
	};

	
    Acts.prototype.SetBooleanValue = function (key_, b, is_body)
	{
        var table = (is_body==1)? this.save_body:this.save_header;
		table[key_] = (b===1);
	};
		
    Acts.prototype.GetAllHeaders = function ()
	{
		var self = this;
	    var on_success = function(items)
	    {	 
            self.load_headers = {};
            var i,cnt=items.length, slot;
            for(i=0; i<cnt; i++)
            {
                slot = items[i];                
                self.load_headers[slot["get"]("slotName")] = slot;
            }
            self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnGetAllHeaders, self); 
	    };	    
	    var on_error = function(error)
	    {
            self.load_headers = null;
            self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnGetAllHeadersError, self); 
	    };
        
        var handler = {"success":on_success, "error": on_error};    
		var query = this.get_query(this.header_klass, this.owner_userID);
        query["find"](handler);
	};
	
    Acts.prototype.GetSlotBody = function (slot_name)
	{
		var self = this;
	    var on_success = function(item)
	    {	
            self.load_body = item;
            self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnGetBodyComplete, self); 
	    };	    
	    var on_error = function(error)
	    {
            self.load_body = null;
            self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnGetBodyError, self); 
	    };
        
        var handler = {"success":on_success, "error": on_error};    
		var query = this.get_query(this.body_klass, this.owner_userID, slot_name);
        query["first"](handler);
	};
	
    Acts.prototype.CleanAll = function ()
	{
	    var self = this;
        
	    var on_error = function(error)
	    {
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnCleanError, self);
	    };
        
	    // wait done
        var wait_events = 0; 
	    var isDone_handler = function()
	    {
	        wait_events -= 1;
	        if (wait_events == 0)
	            self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnCleanComplete, self);
	    };
	    // wait done

        // save header and body
	    var clean_slots = function(header_objs, body_objs)
	    {
            if (!header_objs)
                return;
                
            var handler = {"success":isDone_handler, "error": on_error};
            var i,cnt=header_objs.length;
            for (i=0; i<cnt; i++)
            {
			    wait_events += 1;
	            header_objs[i]["destroy"](handler);
			    wait_events += 1;
                body_objs[i]["destroy"](handler);	        
            }
	    };
        // save header and body
        
		this.read_slot(null, clean_slots, on_error);	
	};		
	
    Acts.prototype.CleanSlot = function (slot_name)
	{
	    var self = this;
        
	    var on_error = function(error)
	    {
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnCleanError, self);
	    };
        
	    // wait done
        var wait_events = 0; 		
	    var isDone_handler = function()
	    {
	        wait_events -= 1;
	        if (wait_events == 0)
	            self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnCleanComplete, self);
	    };
	    // wait done

        // save header and body
	    var clean_slot = function(header_obj, body_obj)
	    {
            if (!header_obj)
                return;
                
            var handler = {"success":isDone_handler, "error": on_error};
            wait_events += 1;
	        header_obj["destroy"](handler);
			wait_events += 1;
            body_obj["destroy"](handler);	
	    };
        // save header and body
        
		this.read_slot(slot_name, clean_slot, on_error);	
	};
	
    Acts.prototype.InitialTable = function ()
	{	
	    var header_obj = new this.header_klass();
        header_obj["set"]("userID", "");
        header_obj["set"]("slotName", "");
        window.ParseInitTable(header_obj);

	    var body_obj = new self.body_klass();        
        body_obj["set"]("userID", "");
        body_obj["set"]("slotName", "");
        window.ParseInitTable(body_obj);
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
		ret.set_any(get_itemValue(this.exp_CurHeader, key_, default_value));        
	};	
	
	Exps.prototype.BodyValue = function (ret, key_, default_value)
	{	
		ret.set_any(get_itemValue(this.load_body, key_, default_value));           
	};

	Exps.prototype.HeadersToJSON = function (ret)
	{
        var value_ = (this.load_headers==null)? {}:this.load_headers;
		ret.set_string(JSON.stringify(value_));
	};	
	
	Exps.prototype.BodyToJSON = function (ret)
	{
        var value_ = (this.load_body==null)? {}:this.load_body;
		ret.set_string(JSON.stringify(value_));
	};	
	
	Exps.prototype.HeaderValue = function (ret, slot_name, key_, default_value)
	{	
        var value;
        if (this.load_headers)
            value = get_itemValue(this.load_headers[slot_name], key_, default_value);
        else
            value = default_value || 0;
        
		ret.set_any(value);    
	};	
	
	Exps.prototype.KeyLastSaveTime = function (ret)
	{
		ret.set_string("updatedAt");
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
    
}());