/*
<itemID>
    ownerID - userID of owner    
    varName - variable name
    monthTimestamp - timestamp of month    
    lastTimestamp - last timestamp
    count - count of date in a month
*/

// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Parse_dateCount = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Parse_dateCount.prototype;
		
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
	        this.item_klass = window["Parse"].Object["extend"](this.properties[2]);
	    }	        
        
        this.exp_pastedItem = null;
        this.exp_lastItem = null;
	};
    
	instanceProto.get_base_query = function(ownerID, varName, timestamp)
	{ 
	    var query = new window["Parse"]["Query"](this.item_klass);
	    
	    if (ownerID != null)
	        query["equalTo"]("ownerID", ownerID);
	    if (varName != null)
	        query["equalTo"]("varName", varName);
	    if (timestamp != null)
	        query["equalTo"]("monthTimestamp", timestamp);
            
	    return query;
	};	


	var alis_date = function (timestamp, scale)
	{
	    var dateObj = new Date(timestamp);
	    
	    var year = dateObj.getFullYear();
	    if (scale === 0)
	        return new Date(year, 1, 1, 0, 0, 0, 0).getTime();
	    
	    var month = dateObj.getMonth();
	    if (scale === 1)
	        return new Date(year, month, 1, 0, 0, 0, 0).getTime();
	        
	    var date = dateObj.getDate();
	    if (scale === 2)
	        return new Date(year, month, date, 0, 0, 0, 0).getTime();	        
	        
	    var hour = dateObj.getHours();
	    if (scale === 3)
	        return new Date(year, month, date, hour, 0, 0, 0).getTime();
	        
	    var minute = dateObj.getMinutes();
	    if (scale === 4)
	        return new Date(year, month, date, hour, minute, 0, 0).getTime();	        
	        	 	    
	};

    var day_diff = function(t1, t0)
	{ 
	    var diff = alis_date(t1, 2) - alis_date(t0, 2);
        return diff/(1000*60*60*24);
	};	
  
    var fill_new_dateItem = function (item_obj, ownerID, varName, month_timstamp, timestamp)
    {
        item_obj["set"]("ownerID", ownerID);
        item_obj["set"]("varName", varName);
        item_obj["set"]("monthTimestamp", new Date(month_timstamp));        
        item_obj["set"]("count", 1);
        
        if (timestamp != null)
            item_obj["set"]("lastTimestamp", new Date(timestamp));  

        return item_obj;
    };    
    
    var update_dateItem = function (item_obj, curTimestamp, preTimestamp)
    {
        if (preTimestamp == null)
            preTimestamp = item_obj["get"]("lastTimestamp").getTime();	 
             
        var inc = Math.floor(day_diff(curTimestamp, preTimestamp));            
        item_obj["set"]("lastTimestamp", new Date(curTimestamp));
        if (inc > 0) 
            item_obj["increment"]("count");
        else if (inc < 0)
            item_obj["set"]("count", 1);
            
        return item_obj;            
    };	

	var get_itemValue = function(item, key_, default_value)
	{ 
        var val;
        if (item != null)
        {
            if (key_ === "id")
                val = item[key_];
            else if ((key_ === "createdAt") || (key_ === "updatedAt"))
                val = item[key_].getTime();
            else
                val = item["get"](key_);
        }
        
        if (val == null)
            val = default_value;
        return val;
	}; 
          
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	
	Cnds.prototype.OnPasteComplete = function ()
	{
        return true;
	}; 
	Cnds.prototype.OnPasteError = function ()
	{
        return true;
	}; 
	
	Cnds.prototype.OnGetRecordComplete = function ()
	{
        return true;
	}; 
	Cnds.prototype.OnGetRecordError = function ()
	{
        return true;
	};     
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.Paste = function (ownerID, varName, timestamp)
	{        
        var month_timstamp = alis_date(timestamp, 1);
        	    
	    var self = this;
	    // step 3    
	    var OnPasteComplete = function(item_obj)
	    {
            self.exp_pastedItem = item_obj;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_dateCount.prototype.cnds.OnPasteComplete, self);
	    };	
	    
	    var OnPasteError = function(item_obj, error)
	    {
            self.exp_pastedItem = null;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_dateCount.prototype.cnds.OnPasteError, self);
	    };
        var update_handler = {"success":OnPasteComplete, "error":OnPasteError};
                
	    // step 2    
	    var on_read_success = function(item_obj)
	    {	 
	        // create new item
	        if (!item_obj)
	        {
	            item_obj = new self.item_klass();	            	        
	            fill_new_dateItem(item_obj, ownerID, varName, month_timstamp, timestamp); 
	        }	        
	        
	        // update current item
	        else
	        {            
	            update_dateItem(item_obj, timestamp);
	        } 
	        
	        item_obj["save"](null, update_handler);
	        // done
	    };	    
	    var on_read_error = function(error)
	    {
	        OnPasteError(null, error);
	    };

        
	    // step 1
		var read_handler = {"success":on_read_success, "error": on_read_error};		
	    this.get_base_query(ownerID, varName, new Date(month_timstamp))["first"](read_handler); 
	};
 
    Acts.prototype.GetRecord = function (ownerID, varName)
	{
	    var self = this;    
	    // step 2    
	    var on_read_success = function(item_obj)
	    {
            self.exp_lastItem = item_obj;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_dateCount.prototype.cnds.OnGetRecordComplete, self);            
	    };	    
	    var on_read_error = function(error)
	    {
            self.exp_lastItem = null;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_dateCount.prototype.cnds.OnGetRecordError, self);
	    };
        
	    // step 1
		var read_handler = {"success":on_read_success, "error": on_read_error};		
	    this.get_base_query(ownerID, varName)["first"](read_handler);       
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.PastedDateCount = function (ret)
	{
		ret.set_int( get_itemValue(this.exp_pastedItem, "count", 0) );
	};

	Exps.prototype.PastedLastTimestamp = function (ret)
	{
        var t;
        if (this.exp_pastedItem)
        {
            var timestamp = this.exp_pastedItem["get"]("lastTimestamp");            
            t = timestamp.getTime();
        }
        else
            t = 0;
		ret.set_float( t );
	};
    
	Exps.prototype.PastedOwnerID = function (ret)
	{
		ret.set_string( get_itemValue(this.exp_pastedItem, "ownerID", "") );
	};

	Exps.prototype.PastedRecordName = function (ret)
	{
		ret.set_string( get_itemValue(this.exp_pastedItem, "varName", "") );
	};
    
	Exps.prototype.LastContinuousCount = function (ret)
	{
		ret.set_int( get_itemValue(this.exp_lastItem, "count", 0) );
	};

	Exps.prototype.LastLastTimestamp = function (ret)
	{
        var t = get_itemValue(this.exp_lastItem, "lastTimestamp", null);
        t = (t)? t.getTime():0;
		ret.set_float( t );        
	};
    
	Exps.prototype.LastOwnerID = function (ret)
	{
		ret.set_string( get_itemValue(this.exp_lastItem, "ownerID", "") );
	};

	Exps.prototype.LastRecordName = function (ret)
	{
		ret.set_string( get_itemValue(this.exp_lastItem, "varName", "") );
	};    
    
    
}());