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
	var input_text = "";
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

	instanceProto.onCreate = function()
	{ 
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/";        

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
	    var ref = this.get_ref(this.owner_userID);
        var header_ref = ref["child"]("headers")["child"](slot_name);
		var body_ref = ref["child"]("bodies")["child"](slot_name);
				
		var self = this;				
		var complete_cnt = 0;
		var error_cnt = 0;
	    var on_complete = function(error) 
	    {
		    complete_cnt += 1;   
		    if (error)
			    error_cnt += 1;   
				
		    if (complete_cnt == 2)
			{
			    var trig = (error_cnt==0)? cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnSaveComplete:
				                           cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnSaveError;
				self.runtime.trigger(trig, self); 					   
			}
        };
		
		// header could not be empty
		if (is_empty(this.save_header))
		    this.save_header["is-empty"] = true;
			
		header_ref["set"](this.save_header, on_complete);	
		body_ref["set"](this.save_body, on_complete);
		
		clean_table(this.save_header);	
		clean_table(this.save_body);	
	};
	
    Acts.prototype.GetAllHeaders = function ()
	{
	    var ref = this.get_ref(this.owner_userID)["child"]("headers");
		
		var self = this;
        var handler = function (snapshot)
        {   
            self.load_headers = snapshot.val();
            self.runtime.trigger(cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnGetAllHeaders, self); 
        };
			
		ref["once"]("value", handler);
	};
	
    Acts.prototype.GetSlotBody = function (slot_name)
	{
	    var ref = this.get_ref(this.owner_userID)["child"]("bodies")["child"](slot_name);
		
		var self = this;
        var handler = function (snapshot)
        {   
            self.load_body = snapshot.val();
			var trig = (self.load_body!=null)? cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnGetBodyComplete:
				                               cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnGetBodyError;
            self.runtime.trigger(trig, self); 
        };
			
		ref["once"]("value", handler);
	};
	
    Acts.prototype.CleanAll = function ()
	{
	    var ref = this.get_ref(this.owner_userID)["child"];
		
		var self = this;
        var on_complete = function (error)
        {   
			var trig = (!error)? cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnCleanComplete:
				                 cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnCleanError;
            self.runtime.trigger(trig, self); 
        };
			
		ref["remove"](on_complete);
	};		
	
    Acts.prototype.CleanSlot = function (slot_name)
	{
	    var ref = this.get_ref(this.owner_userID);
        var header_ref = ref["child"]("headers")["child"](slot_name);
		var body_ref = ref["child"]("bodies")["child"](slot_name);
		
		var self = this;		
		var complete_cnt = 0;
		var error_cnt = 0;
	    var on_complete = function(error) 
	    {
		    complete_cnt += 1;   
		    if (error)
			    error_cnt += 1;   
				
		    if (complete_cnt == 2)
			{
			    var trig = (error_cnt==0)? cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnCleanComplete:
				                           cr.plugins_.Rex_Firebase_SaveSlot.prototype.cnds.OnCleanError;
				self.runtime.trigger(trig, self); 					   
			}
        };
			
		header_ref["remove"](on_complete);
		body_ref["remove"](on_complete);
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
		ret.set_any(get_data(this.exp_CurHeader[key_], default_value));
	};	
	
	Exps.prototype.BodyValue = function (ret, key_, default_value)
	{	    
	    var value_ = (this.load_body==null)? null:this.load_body[key_];
		ret.set_any(get_data(value_, default_value));
	};

	Exps.prototype.HeadersToJSON = function (ret)
	{
		ret.set_string(JSON.stringify(this.load_headers));
	};	
	
	Exps.prototype.BodyToJSON = function (ret)
	{
		ret.set_string(JSON.stringify(this.load_body));
	};	
	
	Exps.prototype.HeaderValue = function (ret, slot_name, key_, default_value)
	{	
	    var value_ = this.load_body;
	    if (value_ != null)
	    {
	        value_ = value_[slot_name];
	        if (value_ != null)
	        {
	            value_ = value_[key_];
	        }
	    }
		ret.set_any(get_data(value_, default_value));
	};		
}());