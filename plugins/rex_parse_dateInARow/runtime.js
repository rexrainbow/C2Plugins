/*
<itemID>
    ownerID - userID of owner    
    varName - variable name
    lastTimestamp - last timestamp
    count - count of continue row    
    prevCount - previous count of continue row    
*/

// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Parse_dateInARow = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Parse_dateInARow.prototype;
		
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
    
	instanceProto.get_base_query = function(ownerID, varName)
	{ 
	    var query = new window["Parse"]["Query"](this.item_klass);
	    
	    if (ownerID != null)
	        query["equalTo"]("ownerID", ownerID);
	    if (varName != null)
	        query["equalTo"]("varName", varName);
            
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
	
    var year_diff = function(t1, t0)
	{ 
        var date1=new Date(t1), date0=new Date(t0);
        return date1.getFullYear() - date0.getFullYear();
	}; 
    var month_diff = function(t1, t0)
	{ 
        var date1=new Date(t1), date0=new Date(t0);
        var y_diff = date1.getFullYear() - date0.getFullYear();
        var m_diff = date1.getMonth() - date0.getMonth();       
        return (y_diff * 12) + m_diff;
	};   
    var date_diff = function(t1, t0)
	{ 
	    var diff = alis_date(t1, 2) - alis_date(t0, 2);
	    return diff/(1000*60*60*24);
	};
    var hour_diff = function(t1, t0)
	{ 
	    var diff = alis_date(t1, 3) - alis_date(t0, 3);
	    return diff/(1000*60*60);
	};    
    var minute_diff = function(t1, t0)
	{ 
	    var diff = alis_date(t1, 4) - alis_date(t0, 4);
	    return diff/(1000*60);
	};     
	var time_diff = function(t1, t0, scale)
	{ 
        var inc;
        switch(scale)
        {
        case 0: inc = year_diff(t1, t0);  break;
        case 1: inc = month_diff(t1, t0);  break;
        case 2: inc = date_diff(t1, t0);  break;
        case 3: inc = hour_diff(t1, t0);  break;
        case 4: inc = minute_diff(t1, t0);  break;        
        }
        return Math.floor(inc);
	};
	    
    var fill_new_dateItem = function (item_obj, ownerID, varName, timestamp)
    {
        item_obj["set"]("ownerID", ownerID);
        item_obj["set"]("varName", varName);
        item_obj["set"]("count", 0);  
        item_obj["set"]("prevCount", 0);
        
        if (timestamp != null)
            item_obj["set"]("lastTimestamp", new Date(timestamp));  

        return item_obj;
    };  
    
    var update_dateItem = function (item_obj, curTimestamp, scale, preTimestamp)
    {
        if (preTimestamp == null)
            preTimestamp = item_obj["get"]("lastTimestamp").getTime();	 
             
        var inc = time_diff(curTimestamp, preTimestamp, scale);            
        item_obj["set"]("lastTimestamp", new Date(curTimestamp));
        item_obj["set"]("prevCount", item_obj["get"]("count"));  
        if (inc === 1) 
            item_obj["increment"]("count");
        else if (inc !== 0)
            item_obj["set"]("count", 0);
            
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
 
    Acts.prototype.Paste = function (ownerID, varName, timestamp, scale)
	{
	    var self = this;
	    // step 3    
	    var OnPasteComplete = function(item_obj)
	    {
            self.exp_pastedItem = item_obj;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_dateInARow.prototype.cnds.OnPasteComplete, self);
	    };	
	    
	    var OnPasteError = function(item_obj, error)
	    {
            self.exp_pastedItem = null;
            self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_dateInARow.prototype.cnds.OnPasteError, self);
	    };
        var update_handler = {"success":OnPasteComplete, "error":OnPasteError};
                
	    // step 2    
	    var on_read_success = function(item_obj)
	    {	 
	        // create new item
	        if (!item_obj)
	        {	            	  	                 
	            item_obj = new self.item_klass();	            	        
	            fill_new_dateItem(item_obj, ownerID, varName, timestamp); 
	        }	        
	        
	        // update current item
	        else
	        {            
	            update_dateItem(item_obj, timestamp, scale);
	        } 
	        
	        var update_handler = {"success":OnPasteComplete, "error":OnPasteError};
	        item_obj["save"](null, update_handler);
	        // done
	    };	    
	    var on_read_error = function(error)
	    {
	        OnPasteError(null, error);
	    };
        
	    // step 1
		var read_handler = {"success":on_read_success, "error": on_read_error};		
	    this.get_base_query(ownerID, varName)["first"](read_handler); 
	};
 
    Acts.prototype.PasteServerTimestamp = function (ownerID, varName, scale)
	{
        var preTimestamp, curTimestamp;
        	    
	    var self = this;  
	    var OnPasteComplete = function(item_obj)
	    {
            self.exp_pastedItem = item_obj;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_dateInARow.prototype.cnds.OnPasteComplete, self);
	    };	
	    
	    var OnPasteError = function(item_obj, error)
	    {
            self.exp_pastedItem = null;
            self.last_error = error;            
	        self.runtime.trigger(cr.plugins_.Rex_Parse_dateInARow.prototype.cnds.OnPasteError, self);
	    };
        var write_count_handler = {"success":OnPasteComplete, "error":OnPasteError};

        // step 3
	    var get_curTimestamp_complete = function(item_obj)
	    {
            curTimestamp = item_obj["updatedAt"].getTime();            	        
	        update_dateItem(item_obj, curTimestamp, scale, preTimestamp);
            item_obj["save"](null, write_count_handler);            
	    };	
        var get_curTimestamp_handler = {"success":get_curTimestamp_complete, "error":OnPasteError};
        
	    // step 2    
	    var on_read_success = function(item_obj)
	    {	 
	        // create new item
	        if (!item_obj)
	        {	            	        
	            item_obj = new self.item_klass();	            	        
                fill_new_dateItem(item_obj, ownerID, varName); 
                item_obj["save"](null, write_count_handler);
                
	        }
	        // done
	        
	        // update current item
	        else
	        {
                preTimestamp = item_obj["updatedAt"].getTime();
                item_obj["save"](null, get_curTimestamp_handler);
	        } 
	        // goto step 3
	       
	    };	    
	    var on_read_error = function(error)
	    {
	        OnPasteError(null, error);
	    };
        
	    // step 1
		var read_handler = {"success":on_read_success, "error": on_read_error};		
	    this.get_base_query(ownerID, varName)["first"](read_handler); 
	};
 
    Acts.prototype.InitialTable = function ()
	{        
	    var item_obj = new this.item_klass();	 
        item_obj["set"]("ownerID", "");
        item_obj["set"]("varName", "");
	    window.ParseInitTable(item_obj);
	}; 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.PastedContinuousCount = function (ret)
	{
		ret.set_int( get_itemValue(this.exp_pastedItem, "count", 0) );
	};

	Exps.prototype.PastedLastTimestamp = function (ret)
	{
        var t;
        if (this.exp_pastedItem)
        {
            var timestamp = this.exp_pastedItem["get"]("lastTimestamp") || this.exp_pastedItem["updatedAt"];            
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
    
	Exps.prototype.PastedPreviousContinuousCount = function (ret)
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