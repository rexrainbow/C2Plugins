// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_parse_ItemTable = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var input_text = "";
	var pluginProto = cr.plugins_.Rex_parse_ItemTable.prototype;
		
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
	    jsfile_load("parse-1.3.2.min.js");
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
	    window["Parse"]["initialize"](this.properties[0], this.properties[1]);
	    this.itemtable_klass = window["Parse"].Object["extend"](this.properties[2]);
	    var page_lines = this.properties[3];	    
        this.itemtable = this.create_itemtable(page_lines);
        
        this.save_item = {};     
        this.filters = {};   
        this.filters.filters = {};
        this.filters.orders = [];
        this.filters.fields = [];
        
        this.exp_LastSentItemID = null;
	    this.exp_CurItemIndex = -1;
	    this.exp_CurItem = null;   
	    this.exp_LastFetchedItem = null;
	    this.exp_LastRemovedItemID = "";
	};
	
	instanceProto.create_itemtable = function(page_lines)
	{ 
	    var itemtable = new window.ParseItemPageKlass(page_lines);
	    
	    var self = this;
	    var onReceived = function()
	    {	       
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnReceived, self);
	    }
	    itemtable.onReceived = onReceived;
	    
	    var onGetIterItem = function(item, i)
	    {
	        self.exp_CurItemIndex = i;
	        self.exp_CurItem = item;
	    };	    	    
	    itemtable.onGetIterItem = onGetIterItem;
	    
	    return itemtable;
	};	
    
	var clean_filters = function(filters)
	{ 
        clean_table(filters.filters);
        filters.orders.length = 0
        filters.fields.length = 0
	};    

	instanceProto.Save = function(save_item, itemID, tag)
	{
        var self = this;
        var OnSaveComplete = function(item)
	    { 	        
            self.exp_LastSentItemID = item["id"];
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnSaveComplete, self);
	    };	
	    var OnSaveError = function(item, error)
	    {
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnSaveError, self);
	    };
        var handler = {"success":OnSaveComplete, "error": OnSaveError};
        	    
        var itemSender = new this.itemtable_klass();
        if (itemID != "")
            itemSender["set"]("id", itemID);
                    
        var k, v;
        for (k in save_item)
        {
            v = save_item[k];
            if (v == null)
                itemSender["unset"](k);
            else
                itemSender["set"](k, v);
                
            delete save_item[k];
        }
        itemSender["save"](null, handler);
	};
    
	var add_conditions = function(query, filters)
	{ 
	    var k, cnd_type, cnds;
	    for (k in filters)
	    {
	        cnd_type = filters[k][0];
	        cnds = filters[k][1];
	        switch (cnd_type)
	        {
	            
	        case "white-list":
	            if (cnds.length == 1)
	                query["equalTo"](k, cnds[0]);
	            else
	                query["containedIn"](k, cnds);     
	        break;
	        
	        case "black-list":
	            if (cnds.length == 1)
	                query["notEqualTo"](k, cnds[0]);
	            else
	                query["notContainedIn"](k, cnds);     
	        break;
	        
	        case "cmp":
	            var i, cnt = cnds.length;
	            for(i=0; i<cnt; i++)
	            {
	                query[cnds[i][0]](k, cnds[i][1]);
	            }
	        break;	        	        
	        }
	    }
	}; 

	var add_orders = function(query, orders)
	{
        if (orders.length == 0)
            return;
        
        query["ascending"]( orders.join(",") );
    };
    
	var add_fields = function(query, fields)
	{
        if (fields.length == 0)
            return;
            
        query["select"].apply(query, fields)
    };
		
	instanceProto.get_request_query = function(filters)
	{ 
	    var query = new window["Parse"]["Query"](this.itemtable_klass);
        add_conditions(query, filters.filters);
        add_orders(query, filters.orders);
        add_fields(query, filters.fields);
        clean_filters(filters);
        return query;	    
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
    
    var clean_table = function (o)
	{
        for (var k in o)        
            delete o[k];        
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnSaveComplete = function (tag_)
	{
	    return cr.equals_nocase(tag_, this.trig_tag);
	}; 
	Cnds.prototype.OnSaveError = function (tag_)
	{
	    return cr.equals_nocase(tag_, this.trig_tag);
	};
	
	Cnds.prototype.OnRemoveComplete = function (tag_)
	{
	    return cr.equals_nocase(tag_, this.trig_tag);
	}; 
	Cnds.prototype.OnRemoveError = function (tag_)
	{
	    return cr.equals_nocase(tag_, this.trig_tag);
	};	
	
	Cnds.prototype.OnReceived = function ()
	{
	    return true;
	}; 

	Cnds.prototype.ForEachItem = function (start, end)
	{	    
	    return this.itemtable.ForEachItem(this.runtime, start, end);
	};  
	
	Cnds.prototype.OnFetchOneComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnFetchOneError = function ()
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
	
	Cnds.prototype.OnRemoveQueriedItemsComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnRemoveQueriedItemsError = function ()
	{
	    return true;
	};		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	      
    Acts.prototype.SetValue = function (key_, value_)
	{
		this.save_item[key_] = value_;
	};
	
    Acts.prototype.SetBooleanValue = function (key_, is_true)
	{
		this.save_item[key_] = (is_true == 1);
	};

    Acts.prototype.RemoveKey = function (key_)
	{
		this.save_item[key_] = null;
	};  	
		
    Acts.prototype.Save = function (itemID, tag_)
	{	 
	    this.Save(this.save_item, itemID, tag_);
	};	
	
    Acts.prototype.Push = function (tag_)
	{	 
	    this.Save(this.save_item, "", tag_);
	};
 	
    Acts.prototype.OverwriteQueriedItems = function (tag_)
	{	
	    this.filters.fields.length = 0;
		this.filters.fields.push("id");
	    var query = this.get_request_query(this.filters);      
        var self = this;

        // read
        // step 2. overwrite item
	    var on_query_success = function(item)
	    {	
		    if (item == null)
			    self.Save(self.save_item, "", tag_);
	        else
			    self.Save(self.save_item, item["id"], tag_);
	    };	    
	    var on_query_error = function(error)
	    {      
	        self.Save(self.save_item, "", tag_);
	    };
	    var query_handler = {"success":on_query_success, "error": on_query_error};        
        // read
                
        // step 1. read items   
	    query["first"](query_handler);
	};   
    Acts.prototype.RequestInRange = function (start, lines)
	{
	    var query = this.get_request_query(this.filters);	
	    this.itemtable.RequestInRange(query, start, lines);
	};

    Acts.prototype.RequestTurnToPage = function (page_index)
	{
	    var query = this.get_request_query(this.filters);	
	    this.itemtable.RequestTurnToPage(query, page_index);
	};	 
    
    Acts.prototype.RequestUpdateCurrentPage = function ()
	{
	    var query = this.get_request_query(this.filters);	
	    this.itemtable.RequestUpdateCurrentPage(query);
	};    
    
    Acts.prototype.RequestTurnToNextPage = function ()
	{
	    var query = this.get_request_query(this.filters);	
	    this.itemtable.RequestTurnToNextPage(query);
	};     
    
    Acts.prototype.RequestTurnToPreviousPage = function ()
	{
	    var query = this.get_request_query(this.filters);	
	    this.itemtable.RequestTurnToPreviousPage(query);
	};  

    Acts.prototype.NewFilter = function ()
	{    
        clean_filters(this.filters);
	};	

    Acts.prototype.AddAllValue = function (k)
	{
	    if (this.filters.hasOwnProperty(k))
	        delete this.filters[k];
	};
	
	var get_filter = function (filters, k, type_)
	{
	    if (!filters.hasOwnProperty(k))
	        filters[k] = [type_, []];
	    else if (filters[k][0] != type_)
	    {
	        filters[k][0] = type_;
	        filters[k][1].length = 0;
	    }	    
	    return filters[k][1];
	}

    Acts.prototype.AddToWhiteList = function (k, v)
	{
	    var cnd = get_filter(this.filters.filters, k, "white-list");
	    cnd.push(v);
	};	

    Acts.prototype.AddToBlackList = function (k, v)
	{
	    var cnd = get_filter(this.filters.filters, k, "black-list");
	    cnd.push(v);
	};    

    var COMPARE_TYPES = ["equalTo", "notEqualTo", "greaterThan", "lessThan", "greaterThanOrEqualTo", "lessThanOrEqualTo"];
    Acts.prototype.AddValueComparsion = function (k, cmp, v)
	{
	    var cnd = get_filter(this.filters.filters, k, "cmp");
	    cnd.push([COMPARE_TYPES[cmp], v]);
	}; 	
	
    var TIMESTAMP_CONDITIONS = [
        ["lessThan", "lessThanOrEqualTo"],           // before, excluded/included
        ["greaterThan", "greaterThanOrEqualTo"],     // after, excluded/included
    ];
    var TIMESTAMP_TYPEs = ["createdAt", "updatedAt"];
    Acts.prototype.AddTimeConstraint = function (when_, timestamp, is_included, type_)
	{
	    var cmp_name = TIMESTAMP_CONDITIONS[when_][is_included];
	    var k = TIMESTAMP_TYPEs[type_];
	    var cnd = get_filter(this.filters.filters, k, "cmp");
	    cnd.push([cmp_name, v]);
	}; 	
	
    var ORDER_TYPES = ["descending", "ascending"];
    Acts.prototype.AddOrder = function (order_, k)
	{
        if (order_ == 0)
            k = "-" & k;

        this.filters.orders.push(k);
	}; 	
	
    Acts.prototype.AddAllFields = function ()
	{
	    this.filters.fields.length = 0;
	}; 	
	
    Acts.prototype.AddAField = function (k)
	{
	    this.filters.fields.push(k);
	}; 	    
	
    Acts.prototype.FetchByItemID = function (itemID)
	{
        var self = this;
        
	    var on_success = function(item)
	    {
	        self.exp_LastFetchedItem = item;
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnFetchOneComplete, self);
	    };	    
	    var on_error = function(item, error)
	    { 
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnFetchOneError, self);     
	    };
	    
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var query = new window["Parse"]["Query"](this.itemtable_klass);        
        query["get"](itemID, handler);
	}; 	
	
    Acts.prototype.RemoveByItemID = function (itemID)
	{
        var self = this;
        
	    var on_success = function(message)
	    {
	        self.exp_LastRemovedItemID = itemID;
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnRemoveComplete, self);
	    };	    
	    var on_error = function(message, error)
	    { 
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnRemoveError, self);     
	    };	    
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var itemRemover = new this.itemtable_klass();
	    itemRemover["set"]("id", messageID);
	    itemRemover["destroy"](handler);
	}; 	
	
    Acts.prototype.RemoveQueriedItems = function ()
	{
	    var query = this.get_request_query(this.filters);  
	    var remove_error_flg = false;

	    // wait done
        var wait_events = 0;    
	    var isDone_handler = function()
	    {
	        wait_events -= 1;
	        if (wait_events == 0)
	        {	            
	            // all jobs done 
	            // step 4. do read items again
	            query["find"](query_handler);
	        }
	    };
	    // wait done
	    	    
        var self = this;
        // destroy        
	    var on_destroy_success = function(message)
	    {
	        self.exp_LastRemovedItemID = message["id"];
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnRemoveComplete, self);
	        isDone_handler();
	    };	    
	    var on_destroy_error = function(message, error)
	    { 
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnRemoveError, self);  
	           
	        if (!remove_error_flg)
	        {
	            self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnRemoveQueriedItemsError, self);     
	            remove_error_flg = true;
	        }
	    };	    
	    var destroy_handler = {"success":on_destroy_success, "error": on_destroy_error};
	    // destroy     
        
        // read
        // step 2. destroy each item
	    var on_query_success = function(items)
	    {	
	        var i, cnt=items.length;
	        if (cnt == 0)
	        {
	            // all items had been removed
	            // step 4. no item returned, done
	            self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnRemoveQueriedItemsComplete, self);
	        }
	        else
	        {
	            for(i=0; i<cnt; i++)
	            {
	                wait_events += 1;
	                items[i]["destroy"](destroy_handler);
	            }
	            
	            // continue to find
	            query["find"](query_handler);
	        }
	    };	    
	    var on_query_error = function(error)
	    {      
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnRemoveQueriedItemsError, self); 
	    };
	    var query_handler = {"success":on_query_success, "error": on_query_error};        
        // read
                
        // step 1. read items   
	    query["find"](query_handler);
	}; 	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

 	Exps.prototype.CurItemID = function (ret)
	{
	    if (this.exp_CurItem == null)
	    {
	        ret.set_string("");
	        return;
	    }
		ret.set_string(this.exp_CurItem["id"]);
	};
	
 	Exps.prototype.CurItemContent = function (ret, k, default_value)
	{
	    if (this.exp_CurItem == null)
	    {
	        ret.set_any(0);
	        return;
	    }
	    
	    var v = (k == null)? this.exp_CurItem["toJSON"]():
	                         this.exp_CurItem["get"](k);

		ret.set_any( din(v, default_value) );
	};
		
 	Exps.prototype.CurSentAt = function (ret)
	{
	    if (this.exp_CurItem == null)
	    {
	        ret.set_float(0);
	        return;
	    }
		ret.set_float(this.exp_CurItem["createdAt"].getTime());
	};
    
	Exps.prototype.CurItemIndex = function (ret)
	{
		ret.set_int(this.exp_CurItemIndex);
	};	
	
 	Exps.prototype.PreparedItemContent = function (ret, k, default_value)
	{
	    var v = (k == null)? this.save_item:
	                         this.save_item[k];

		ret.set_any( din(v, default_value) );
	};	
	
 	Exps.prototype.Index2ItemContent = function (ret, index_, k, default_value)
	{
	    var item = this.itemtable.GetItem(index_);
	    if (item == null)
	    {
	        ret.set_any(0);
	        return;
	    }
	    
	    var v = (k == null)? item["toJSON"]():
	                         item["get"](k);

		ret.set_any( din(v, default_value) );
	};	
	
 	Exps.prototype.LastFetchedItemID = function (ret)
	{
	    if (this.exp_LastFetchedItem == null)
	    {
	        ret.set_string("");
	        return;
	    }
		ret.set_string(this.exp_LastFetchedItem["id"]);
	};
	
 	Exps.prototype.LastFetchedItemContent = function (ret, k, default_value)
	{
	    if (this.exp_LastFetchedItem == null)
	    {
	        ret.set_any(0);
	        return;
	    }
	    
	    var v = (k == null)? this.exp_LastFetchedItem["toJSON"]():
	                         this.exp_LastFetchedItem["get"](k);

		ret.set_any( din(v, default_value) );
	};
		
 	Exps.prototype.LastFetchedSentAt = function (ret)
	{
	    if (this.exp_LastFetchedItem == null)
	    {
	        ret.set_float(0);
	        return;
	    }
		ret.set_float(this.exp_LastFetchedItem["createdAt"].getTime());
	};
}());

(function ()
{
    if (window.ParseItemPageKlass != null)
        return;    

    var ItemPageKlass = function (page_lines)
    {
        // export
        this.onReceived = null;
        this.onGetIterItem = null;  // used in ForEachItem
        // export
	    this.items = [];
        this.start = 0;
        this.page_lines = page_lines;   
        this.page_index = 0;     
    };
    
    var ItemPageKlassProto = ItemPageKlass.prototype;  
     
	ItemPageKlassProto.request = function(query, start, lines)
	{
        if (start < 0)
            start = 0;
            
        var self = this;
        
	    var on_success = function(items)
	    {
	        if ((items != null) && (items.length > 0))
            {
	            self.items = items;
                self.start = start;
                self.page_index = Math.floor(start/self.page_lines);
            }
            if (self.onReceived)
                self.onReceived();
	    };	    
	    var on_error = function(error)
	    {
	        self.items.length = 0;        
	    };
	    
	    var handler = {"success":on_success, "error": on_error};
	    query["skip"](start);
        query["limit"](lines);	    
	    query["find"](handler);	    
	};	    

    ItemPageKlassProto.RequestInRange = function (query, start, lines)
	{
	    this.request(query, start, lines);
	};

    ItemPageKlassProto.RequestTurnToPage = function (query, page_index)
	{
	    var start = page_index*this.page_lines;
	    this.request(query, start, this.page_lines);
	};	 
    
    ItemPageKlassProto.RequestUpdateCurrentPage = function (query)
	{
	    this.request(query, this.start, this.page_lines);
	};    
    
    ItemPageKlassProto.RequestTurnToNextPage = function (query)
	{
        var start = this.start + this.page_lines;
	    this.request(query, start, this.page_lines);
	};     
    
    ItemPageKlassProto.RequestTurnToPreviousPage = function (query)
	{
        var start = this.start - this.page_lines;
	    this.request(query, start, this.page_lines);
	};  

	ItemPageKlassProto.ForEachItem = function (runtime, start, end)
	{
        var items_end = this.start + this.items.length - 1;       
	    if (start == null)
	        start = this.start; 
	    else
	        start = cr.clamp(start, this.start, items_end);
	        
	    if (end == null) 
	        end = items_end;
        else     
            end = cr.clamp(end, start, items_end);
        	    	     
        var current_frame = runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i;
		for(i=start; i<=end; i++)
		{
            if (solModifierAfterCnds)
            {
                runtime.pushCopySol(current_event.solModifiers);
            }
            
            if (this.onGetIterItem)
                this.onGetIterItem(this.GetItem(i), i);
                
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
    		
		return false;
	}; 

	ItemPageKlassProto.FindFirst = function(key, value, start_index)
	{
	    if (start_index == null)
	        start_index = 0;
	        
        var i, cnt=this.items.length;
        for(i=start_index; i<cnt; i++)
        {
            if (this.items[i]["get"](key) == value)
                return i + this.start;
        }
	    return -1;
	};
			
	ItemPageKlassProto.GetItem = function(i)
	{
	    return this.items[i - this.start];
	};

	ItemPageKlassProto.Clean = function()
	{ 
	    this.items.length = 0;
        this.start = 0;     
	};
	
	ItemPageKlassProto.GetCurrentPageIndex = function ()
	{
	    return this.page_index;
	};	

	window.ParseItemPageKlass = ItemPageKlass;
}());        