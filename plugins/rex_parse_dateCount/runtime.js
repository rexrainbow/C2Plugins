/*
<itemID>
    ownerID - userID of owner    
    varName - variable name
    monthTimestamp - timestamp of month    
    lastTimestamp - last timestamp
    count - count of date in a month
    prevCount - previous count of continue row     
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
        
        this.exp_pastedItem = null;
        this.exp_lastItem = null;
        this.last_error = null;	         
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
        item_obj["set"]("prevCount", 0);        
        
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
        item_obj["set"]("prevCount", item_obj["get"]("count"));        
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
            self.last_error = error;
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
	
    Acts.prototype.InitialTable = function ()
	{        
	    var item_obj = new this.item_klass();	 
        item_obj["set"]("ownerID", "");
        item_obj["set"]("varName", "");
        item_obj["set"]("monthTimestamp", new Date());
        window.ParseInitTable(item_obj);
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
    
	Exps.prototype.PastedPreviousDateCount = function (ret)
	{
		ret.set_int( get_itemValue(this.exp_pastedItem, "prevCount", 0) );
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