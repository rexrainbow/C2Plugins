/*
<itemID>
    ownerID - userID of owner    
    key - key name
    partNo - partitioned number, 0-based
    partValue - partitioned value
*/

// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Parse_string = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Parse_string.prototype;
		
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
	        this.item_klass = window["Parse"].Object["extend"](this.properties[0]);
	    }	        
        
        this.exp_LastSavedOwnerID = "";
        this.exp_LastSavedKey = "";
        this.exp_LastSavedValue = "";
        this.exp_LastLoadedOwnerID = "";
        this.exp_LastLoadedKey = "";
        this.exp_LastLoadedValue = "";  
        this.last_error = null;      
	};
    
	instanceProto.get_base_query = function(ownerID, key_)
	{ 
	    var query = new window["Parse"]["Query"](this.item_klass);
	    
	    if (ownerID != null)
	        query["equalTo"]("ownerID", ownerID);
	    if (key_ != null)
	        query["equalTo"]("key", key_);
            
	    return query;
	};	    
    
    var byteCount = function (s) { return encodeURI(s).split(/%..|./).length - 1; }
	
	var MAXSIZE = 1024*128;
	var RESULT = [];
    var _char2BytesArr = [];
	var get_part_values = function (value_)
	{
	    RESULT.length = 0;
	    var i, cnt=value_.length;        
        _char2BytesArr.length = cnt;  
        for (i=0; i<=cnt; i++)
        {
            _char2BytesArr[i] = byteCount(value_.charAt(i));
        }
        
	    var start=0, l=0;
	    for (i=0; i<=cnt; i++)
	    {
            l += _char2BytesArr[i];
            if (l > MAXSIZE)
            {
                RESULT.push(value_.substring(start, i));
                start = i;
                l = _char2BytesArr[i];
            }
	    }
        
        if (start != cnt)
            RESULT.push(value_.substring(start, cnt));
	    
        _char2BytesArr.length = 0;
	    return RESULT;
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
	
	Cnds.prototype.OnLoadComplete = function ()
	{
        return true;
	}; 
	Cnds.prototype.OnLoadError = function ()
	{
        return true;
	};     
	
	Cnds.prototype.OnRemoveComplete = function ()
	{
        return true;
	}; 
	Cnds.prototype.OnRemoveError = function ()
	{
        return true;
	};       
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.Save = function (ownerID, key_, value_)
	{    
	    var self = this;
	    
	    // step 2      
	    var OnSaveComplete = function()
	    {
            RESULT.length = 0;
	        self.exp_LastSavedOwnerID = ownerID;
	        self.exp_LastSavedKey = key_;
	        self.exp_LastSavedValue = value_;	        
	        self.runtime.trigger(cr.plugins_.Rex_Parse_string.prototype.cnds.OnSaveComplete, self);
	    };	
	    
	    var OnSaveError = function(item_obj, error)
	    {
            RESULT.length = 0;
	        self.exp_LastSavedOwnerID = ownerID;
	        self.exp_LastSavedKey = key_;
	        self.exp_LastSavedValue = value_;	
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_string.prototype.cnds.OnSaveError, self);
	    };
         
	    var do_saving = function()
	    {	 
	        var partValues = get_part_values(value_);
	        var i, cnt=partValues.length, item_objs=[];
	        for(i=0; i<cnt; i++)
	        {
	            var item_obj = new self.item_klass();	    
	            item_obj["set"]("ownerID", ownerID);
	            item_obj["set"]("key", key_);
	            item_obj["set"]("partNo", i);
	            item_obj["set"]("partValue", partValues[i]);
	            item_objs.push(item_obj);
	        }
	        var on_saveAll_handler = {"success":OnSaveComplete, "error": OnSaveError};		
	        window["Parse"]["Object"]["saveAll"](item_objs, on_saveAll_handler);
	        // done
	    };

        
	    // step 1
        var item_query = this.get_base_query(ownerID, key_);
	    var remove_handler = {"success":do_saving, "error": OnSaveError};		
	    window.ParseRemoveAllItems(item_query, remove_handler);
	};
 
    Acts.prototype.Load = function (ownerID, key_)
	{
	    var self = this;    
	        
	    var OnLoadComplete = function(value_)
	    {
	        self.exp_LastLoadedOwnerID = ownerID;
	        self.exp_LastLoadedKey = key_;
	        self.exp_LastLoadedValue = value_;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_string.prototype.cnds.OnLoadComplete, self);
	    };	
	    
	    var OnLoadError = function(item_obj, error)
	    {
	        self.exp_LastLoadedOwnerID = ownerID;
	        self.exp_LastLoadedKey = key_;
	        self.exp_LastLoadedValue = "";	  
	        self.last_error = error;      
	        self.runtime.trigger(cr.plugins_.Rex_Parse_string.prototype.cnds.OnLoadError, self);
	    };
	    	        
	    // step 2    	    	    
	    var on_read_all = function(item_objs)
	    {
	        var value_ = "";
	        var i, cnt= item_objs.length;
	        for(i=0; i<cnt; i++)
	            value_ += item_objs[i]["get"]("partValue");

	        OnLoadComplete(value_);
	    };	    
	    
	    // step 1
	    var item_query = this.get_base_query(ownerID, key_)["ascending"]("partNo")["select"]("partValue");
	    var on_read_handler = {"success":on_read_all, "error": OnLoadError};  
	    window.ParseQuery(item_query, on_read_handler);	        
	};  
    
    Acts.prototype.Remove = function (ownerID, key_)
	{    
	    var self = this;
	    
	    // step 2      
	    var on_complete = function()
	    {        
	        self.runtime.trigger(cr.plugins_.Rex_Parse_string.prototype.cnds.OnRemoveComplete, self);
	    };	
	    
	    var on_error = function(item_obj, error)
	    {	        
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_string.prototype.cnds.OnRemoveError, self);
	    };         
        
	    // step 1
        var item_query = this.get_base_query(ownerID, key_);
	    var remove_handler = {"success":on_complete, "error": on_error};		
	    window.ParseRemoveAllItems(item_query, remove_handler);
	};  

    Acts.prototype.InitialTable = function ()
	{        
	    var item_obj = new this.item_klass();	    
	    item_obj["set"]("ownerID", "");
	    item_obj["set"]("key", "");	    
        window.ParseInitTable(item_obj);
	};       
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.LastSavedOwnerID = function (ret)
	{
		ret.set_string( this.exp_LastSavedOwnerID );
	};
    
	Exps.prototype.LastSavedKey = function (ret)
	{
		ret.set_string( this.exp_LastSavedKey );
	};
    
	Exps.prototype.LastSavedValue = function (ret)
	{
		ret.set_string( this.exp_LastSavedValue );
	};	
    
	Exps.prototype.LastLoadedOwnerID = function (ret)
	{
		ret.set_string( this.exp_LastLoadedOwnerID );
	};
    
	Exps.prototype.LastLoadedKey = function (ret)
	{
		ret.set_string( this.exp_LastLoadedKey );
	};
    
	Exps.prototype.LastLoadedValue = function (ret)
	{
		ret.set_string( this.exp_LastLoadedValue );
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
		 	
}());