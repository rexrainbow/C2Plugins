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
	    jsfile_load("parse-1.4.2.min.js");
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
	    if (!window.RexC2IsParseInit)
	    {
	        window["Parse"]["initialize"](this.properties[0], this.properties[1]);
	        window.RexC2IsParseInit = true;
	    }
	    	    
	    if (!this.recycled)
	    {
		    this.header_klass = window["Parse"].Object["extend"](this.properties[2]);
		    this.body_klass = window["Parse"].Object["extend"](this.properties[3]);
		}
		
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
	        self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnSaveError, self);
	    };
        
	    // wait done
        var wait_events = 0; 
        var onJobDone_handler = null;		
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
	        self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnCleanError, self);
	    };
        
	    // wait done
        var wait_events = 0; 
        var onJobDone_handler = null;		
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
	        self.runtime.trigger(cr.plugins_.Rex_parse_saveslot.prototype.cnds.OnCleanError, self);
	    };
        
	    // wait done
        var wait_events = 0; 
        var onJobDone_handler = null;		
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
        var value_;
        if (key_ === "id")
	        value_ = this.exp_CurHeader["id"];
	    else if ((key_ === "updatedAt") || (key_ === "createdAt"))
	        value_ = this.exp_CurHeader[key_]["getTime"]();
	    else
	        value_ = this.exp_CurHeader["get"](key_);    
		ret.set_any(get_data(value_, default_value));
	};	
	
	Exps.prototype.BodyValue = function (ret, key_, default_value)
	{	
	    var value_;
	    if (this.load_body !=null)
	    {
	        if (key_ === "id")
	            value_ = this.load_body["id"];
	        else if ((key_ === "updatedAt") || (key_ === "createdAt"))
	            value_ = this.load_body[key_]["getTime"]();
	        else
	            value_ = this.load_body["get"](key_);
	    }
		ret.set_any(get_data(value_, default_value));
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
	    var value_ = this.load_headers;
	    if (value_ != null)
	    {
	        value_ = value_[slot_name];
	        if (value_ != null)
	        {
	            if (key_ === "id")
	                value_ = value_["id"];
	            else if ((key_ === "updatedAt") || (key_ === "createdAt"))
	                value_ = value_[key_]["getTime"]();
	            else
	                value_ = value_["get"](key_);               
	        }
	    }
		ret.set_any(get_data(value_, default_value));
	};	
	
	Exps.prototype.KeyLastSaveTime = function (ret)
	{
		ret.set_string("updatedAt");
	};		
}());