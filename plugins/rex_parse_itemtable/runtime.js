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
	        this.itemTable_klass = window["Parse"].Object["extend"](this.properties[2]);
	        var page_lines = this.properties[3];	    
            this.itemTable = this.create_itemTable(page_lines);	
            this.filters = create_filters();    
            this.primary_keys = {};    
            this.saveAllQueue = {};
            this.saveAllQueue.prepare_items = [];
            this.saveAllQueue.primary_keys = [];
	    }
	    else
	    {
	        this.itemTable.Reset();
	        clean_filters( this.filters );
            clean_table(this.primary_keys);
            this.saveAllQueue.prepare_items.length = 0;
            this.saveAllQueue.primary_keys.length = 0;
	    }

        this.prepared_item = null;
        
        
        this.exp_LoopIndex = -1;
        this.exp_LastSaveItemID = "";
	    this.exp_CurItemIndex = -1;
	    this.exp_CurItem = null;   
	    this.exp_LastFetchedItem = null;
	    this.exp_LastRemovedItemID = "";
	    this.exp_LastItemsCount = -1;   
	};
	
	instanceProto.create_itemTable = function(page_lines)
	{ 
	    var itemTable = new window.ParseItemPageKlass(page_lines);
	    
	    var self = this;
	    var onReceived = function()
	    {	       
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnReceived, self);
	    }
	    itemTable.onReceived = onReceived;
	    
	    var onReceivedError = function()
	    {	       
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnReceivedError, self);
	    }
	    itemTable.onReceivedError = onReceivedError;	    
	    
	    var onGetIterItem = function(item, i)
	    {        
	        self.exp_CurItemIndex = i;
	        self.exp_CurItem = item;
	        self.exp_LoopIndex = i - itemTable.GetStartIndex()
	    };	    	    
	    itemTable.onGetIterItem = onGetIterItem;
	    
	    return itemTable;
	};	
	
	var create_filters = function()
	{ 
        var filters = {};   
        filters.filters = {};
        filters.orders = [];
        filters.fields = []; 
        filters.linkedObjs = [];
        return filters;
	};    
    
	var clean_filters = function(filters)
	{ 
        clean_table(filters.filters);
        filters.orders.length = 0;
        filters.fields.length = 0;
        filters.linkedObjs.length = 0;
	};    

	instanceProto.primaryKeys_to_query = function(primary_keys)
	{
        var query = new window["Parse"]["Query"](this.itemTable_klass);
        for (var k in primary_keys)
        {
            query["equalTo"](k, primary_keys[k]);
        }
        query["select"]("id");
        return query;	    
    };
	instanceProto.Save = function(prepared_item, itemID, primary_keys)
	{
        var self = this;                
        var OnSaveComplete = function(item)
	    { 	        
            self.exp_LastSaveItemID = item["id"];
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnSaveComplete, self);
	    };	
	    var OnSaveError = function(item, error)
	    {
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnSaveError, self);
	    };
 
        // step 2. write item    
        var on_write_handler = {"success":OnSaveComplete, "error": OnSaveError};        
        var write_item = function (item_, itemID_)
        {
            if (itemID_ !== "")
                item_["set"]("id", itemID_);

            item_["save"](null, on_write_handler);        
        }
        // step 2. write item                             
        

        // step 1. read items
	    var on_read_success = function(item_)
	    {	
	        var itemID = (item_ == null)? "":item_["id"];
	        write_item(prepared_item, itemID);
	    };	    
	    var on_read_handler = {"success":on_read_success, "error": OnSaveError};
	    var read_item = function (primary_keys_)
	    {	        
            var query = self.primaryKeys_to_query(primary_keys_);   
	        query["first"](on_read_handler);
	    };
	    // step 1. read items
	    
	    // step 1. read items
        if (primary_keys && has_key(primary_keys))
            read_item(primary_keys);        
            
        // step 2. write item 
        else                       
            write_item(prepared_item, itemID);
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
	            
	        case "include":
	            if (cnds.length == 1)
	                query["equalTo"](k, cnds[0]);
	            else
	                query["containedIn"](k, cnds);     
	        break;
	        
	        case "notInclude":
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

	        case "startsWidth":
	            query["startsWith"](k, cnds[0]);
	        break;  

	        case "exist":
	            query[cnds[0]](k);
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
            
        query["select"].apply(query, fields);
    };
    
	var add_linkedObjs = function(query, linkedObjs)
	{        
        if (linkedObjs.length == 0)
            return;
            
        for (var i=0, cnt=linkedObjs.length; i<cnt; i++)
        {
            query["include"]( linkedObjs[i] );
        }
    };	
	
	instanceProto.get_request_query = function(filters)
	{ 
	    var query = new window["Parse"]["Query"](this.itemTable_klass);
        add_conditions(query, filters.filters);
        add_orders(query, filters.orders);
        add_fields(query, filters.fields);
        add_linkedObjs(query, filters.linkedObjs);
        return query;	    
	};

    instanceProto.set_value = function (key_, value_, is_primary)
	{
	    if (this.prepared_item == null)
	        this.prepared_item = new this.itemTable_klass();
	        
		this.prepared_item["set"](key_, value_);
		
		if (is_primary)
            this.primary_keys[key_] = value_;
	};
	
    instanceProto.set_booleanValue = function (key_, is_true, is_primary)
	{
	    is_true = (is_true == 1);
	    if (this.prepared_item == null)
	        this.prepared_item = new this.itemTable_klass();
	        
		this.prepared_item["set"](key_, is_true); 
		
		if (is_primary)
            this.primary_keys[key_] = is_true;		       
	};	

 	instanceProto.get_itemValue = function (item, k, default_value)
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
    
    var clean_table = function (o)
	{
        for (var k in o)        
            delete o[k];        
	};
	
	var has_key = function (o)
	{
	    for (var k in o)
	        return true;
	    
	    return false;
	}
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
	
	Cnds.prototype.OnReceived = function ()
	{
	    return true;
	}; 

	Cnds.prototype.ForEachItem = function (start, end)
	{	    
	    return this.itemTable.ForEachItem(this.runtime, start, end);
	};  
	
	Cnds.prototype.OnReceivedError = function ()
	{
	    return true;
	}; 	
	
	Cnds.prototype.IsTheLastPage = function ()
	{
	    return this.itemTable.IsTheLastPage();
	}; 	
	
	Cnds.prototype.OnLoadByItemIDComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnLoadByItemIDError = function ()
	{
	    return true;
	};	
		
	Cnds.prototype.OnRemoveByItemIDComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnRemoveByItemIDError = function ()
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
	
	Cnds.prototype.OnGetItemsCountComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnGetItemsCountError = function ()
	{
	    return true;
	};	
	
	Cnds.prototype.OnSaveAllComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnSaveAllError = function ()
	{
	    return true;
	};		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	      
    Acts.prototype.SetValue = function (key_, value_, is_primaryKey)
	{
	    is_primaryKey = (is_primaryKey === 1);
	    this.set_value(key_, value_, is_primaryKey);
	};
	
    Acts.prototype.SetBooleanValue = function (key_, is_true, is_primaryKey)
	{
	    is_primaryKey = (is_primaryKey === 1);
	    this.set_booleanValue(key_, is_true, is_primaryKey);     
	};

    Acts.prototype.RemoveKey = function (key_)
	{
	    if (this.prepared_item == null)
	        this.prepared_item = new this.itemTable_klass();
	        
		this.prepared_item["unset"](key_);
	};  	
		
    Acts.prototype._save = function (itemID)
	{	 
	    this.Save(this.prepared_item, itemID);
        this.prepared_item = null; 
        clean_table(this.primary_keys); 
	};	
	
    Acts.prototype._push = function ()
	{	 
	    this.Save(this.prepared_item, "");
        this.prepared_item = null; 
        clean_table(this.primary_keys);       
	};
 	
    Acts.prototype._overwriteQueriedItems = function ()
	{	
	    this.filters.fields.length = 0;
		this.filters.fields.push("id");
	    var query = this.get_request_query(this.filters);
	    clean_filters(this.filters);
	          
        var self = this;
        var prepared_item = this.prepared_item;           // keep this.prepared_item at local

        // read
        // step 2. overwrite item
	    var on_query_success = function(item)
	    {	
		    if (item == null)
			    self.Save(prepared_item, "");
	        else
			    self.Save(prepared_item, item["id"]);                     
	    };	    
	    var on_query_error = function(error)
	    {      
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnSaveError, self);
	    };
	    var query_handler = {"success":on_query_success, "error": on_query_error};        
        // read
                
        // step 1. read items   
	    query["first"](query_handler);
        clean_table(this.primary_keys); 
        this.prepared_item = null;          
	};   
	
    Acts.prototype.IncValue = function (key_, value_)
	{
	    if (this.prepared_item == null)
	        this.prepared_item = new this.itemTable_klass();
	        
		this.prepared_item["increment"](key_, value_);
	}; 
    
    Acts.prototype.ArrayAddItem = function (key_, add_mode, value_)
	{
	    if (this.prepared_item == null)
	        this.prepared_item = new this.itemTable_klass();
	        
        var cmd = (add_mode === 0)? "add" : "addUnique";
		this.prepared_item[cmd](key_, value_);
	};  
    
    Acts.prototype.ArrayRemoveAllItems = function (key_)
	{
	    if (this.prepared_item == null)
	        this.prepared_item = new this.itemTable_klass();
	        
		this.prepared_item["remove"](key_);
	};   
    
    Acts.prototype._savePrimary = function ()
	{	   
	    this.Save(this.prepared_item, "", this.primary_keys);
        this.prepared_item = null; 
        clean_table(this.primary_keys);       
	};  
    
    Acts.prototype.RequestInRange = function (start, lines)
	{
	    var query = this.get_request_query(this.filters);
	    clean_filters(this.filters);	
	    this.itemTable.RequestInRange(query, start, lines);
	};

    Acts.prototype.RequestTurnToPage = function (page_index)
	{
	    var query = this.get_request_query(this.filters);
	    clean_filters(this.filters);	
	    this.itemTable.RequestTurnToPage(query, page_index);
	};	 
    
    Acts.prototype.RequestUpdateCurrentPage = function ()
	{
	    var query = this.get_request_query(this.filters);	
	    clean_filters(this.filters);
	    this.itemTable.RequestUpdateCurrentPage(query);
	};    
    
    Acts.prototype.RequestTurnToNextPage = function ()
	{
	    var query = this.get_request_query(this.filters);	
	    clean_filters(this.filters);
	    this.itemTable.RequestTurnToNextPage(query);
	};     
    
    Acts.prototype.RequestTurnToPreviousPage = function ()
	{
	    var query = this.get_request_query(this.filters);	
	    clean_filters(this.filters);
	    this.itemTable.RequestTurnToPreviousPage(query);
	};  
    
    Acts.prototype.LoadAllItems = function ()
	{
	    var query = this.get_request_query(this.filters);	
        clean_filters(this.filters);	    
	    this.itemTable.LoadAllItems(query);
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
	    var cnd = get_filter(this.filters.filters, k, "include");
	    cnd.push(v);
	};	

    Acts.prototype.AddToBlackList = function (k, v)
	{
	    var cnd = get_filter(this.filters.filters, k, "notInclude");
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
    var TIMESTAMP_TYPES = ["createdAt", "updatedAt"];
    Acts.prototype.AddTimeConstraint = function (when_, timestamp, is_included, type_)
	{
	    var cmp_name = TIMESTAMP_CONDITIONS[when_][is_included];
	    var k = TIMESTAMP_TYPES[type_];
	    var cnd = get_filter(this.filters.filters, k, "cmp");
	    cnd.push([cmp_name, v]);
	}; 	
    
    Acts.prototype.AddStringStartWidth = function (k, s)
	{
	    var cnd = get_filter(this.filters.filters, k, "startsWidth");
	    cnd.push(s);
	}; 	
    
    var EXIST_TYPES = ["doesNotExist", "exists"];
    Acts.prototype.AddExist = function (k, exist)
	{
	    var cnd = get_filter(this.filters.filters, k, "exist");
	    cnd.push(EXIST_TYPES[exist]);
	}; 	
    
    var ORDER_TYPES = ["descending", "ascending"];
    Acts.prototype.AddOrder = function (k, order_)
	{
        if (order_ == 0)
            k = "-" + k;

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
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnLoadByItemIDComplete, self);
	    };	    
	    var on_error = function(item, error)
	    { 
	        self.exp_LastFetchedItem = item;
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnLoadByItemIDError, self);     
	    };
	    
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var query = new window["Parse"]["Query"](this.itemTable_klass);        
        query["get"](itemID, handler);
	}; 	
	
    Acts.prototype.RemoveByItemID = function (itemID)
	{
        var self = this;
        
	    var on_success = function(message)
	    {
	        self.exp_LastRemovedItemID = itemID;
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnRemoveByItemIDComplete, self);
	    };	    
	    var on_error = function(message, error)
	    { 
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnRemoveByItemIDError, self);    
	    };	    
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var itemRemover = new this.itemTable_klass();
	    itemRemover["set"]("id", messageID);
	    itemRemover["destroy"](handler);
	}; 	
	
    Acts.prototype.RemoveQueriedItems = function ()
	{
	    this.filters.fields.length = 0;
		this.filters.fields.push("id");    
	    var all_itemID_query = this.get_request_query(this.filters); 
        clean_filters(this.filters);	    
	    
        var self = this;
	    var on_destroy_success = function()
	    {
            self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnRemoveQueriedItemsComplete, self);	        
	    };	
	    var on_error = function(error)
	    {  
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnRemoveQueriedItemsError, self); 
	    };	           
	    var on_destroy_handler = {"success":on_destroy_success, "error": on_error};
	    window.ParseRemoveAllItems(all_itemID_query, on_destroy_handler); 
	}; 	
	
    Acts.prototype.GetItemsCount = function ()
	{
	    var query = this.get_request_query(this.filters);
	    clean_filters(this.filters);	    
	    
	    var self = this;
	    var on_query_success = function(count)
	    {
	        self.exp_LastItemsCount = count;
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnGetItemsCountComplete, self); 	        
	    };	    
	    var on_query_error = function(error)
	    {      
	        self.exp_LastItemsCount = -1;
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnGetItemsCountError, self); 
	    };
	    var query_handler = {"success":on_query_success, "error": on_query_error};    	     
	    query["count"](query_handler);
	};	
	
    Acts.prototype.LoadRandomItems = function (pick_count_)
	{		            	    
        // query for get all itemID
        var fields_save = this.filters.fields;
	    this.filters.fields = ["id"];
	    var all_itemID_query = this.get_request_query(this.filters); 
	    this.filters.fields = fields_save;
	    
	    // save filters at local
	    var filters_save = this.filters;    
        this.filters = create_filters();        
	    
        var self = this;                  	
	    var on_error = function(error)
	    {  
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnReceivedError, self); 
	    };
	    	   
        var get_random_items = function (itemsIn, pick_count)
        {
	        var picked_items=[], total_cnt=itemsIn.length;
	        
	        // put picked items in picked_items        
	        if (total_cnt <= pick_count)
	        {
	            cr.shallowAssignArray(picked_items, itemsIn);
	        }
	        else if ((pick_count/total_cnt) < 0.5)
	        {
	            // random number picking
                var i, rv, try_pick;
                var rvList={};         // result of random numbers
                for (i=0; i<pick_count; i++)
                {
                    try_pick = true;
                    while (try_pick)
                    {
                        rv = Math.floor(Math.random() * total_cnt);
                        if (!rvList.hasOwnProperty(rv))
                        {
                            rvList[rv] = true;
                            try_pick = false;
                        }
                    }
                }

                for(i in rvList)
                    picked_items.push(itemsIn[i]);
	        }
	        else
	        {
	            // shuffle index array picking
	            cr.shallowAssignArray(picked_items, itemsIn);
	            _shuffle(picked_items);
	            picked_items.length = pick_count;
	        }
	        
	        return picked_items;
        };
	    var on_read_all = function(all_items)
	    {
	        // get random items
	        var picked_items = get_random_items(all_items, pick_count_)
	        
	        // query items by itemID
	        var i, cnt=picked_items.length, cnd;
	        for(i=0; i<cnt; i++)
	        {
	            cnd = get_filter(filters_save.filters, "objectId", "include");
	            cnd.push(picked_items[i]["id"]);
	        }
	        
	        var query = self.get_request_query(filters_save)
	        self.itemTable.LoadAllItems(query);	        
	    };	    
        
	    var on_read_handler = {"success":on_read_all, "error": on_error};  
	    window.ParseQuery(all_itemID_query, on_read_handler);
	};
	
	var _shuffle = function (arr, random_gen)
	{
        var i = arr.length, j, temp, random_value;
        if ( i == 0 ) return;
        while ( --i ) 
        {
		    random_value = (random_gen == null)?
			               Math.random(): random_gen.random();
            j = Math.floor( random_value * (i+1) );
            temp = arr[i]; 
            arr[i] = arr[j]; 
            arr[j] = temp;
        }
    };		
		    
    Acts.prototype.LinkToObject = function (key_, t_, oid_)
	{
	    if (this.prepared_item == null)
	        this.prepared_item = new this.itemTable_klass();
	        	    
        var t = window["Parse"].Object["extend"](t_);
	    var o = new t();
	    o["id"] = oid_;
	    this.prepared_item["set"](key_, o);
	};    
    
    var INCLUDE_TYPES = ["notInclude", "include"];
    Acts.prototype.AddValueInclude = function (k, include, v)
	{
	    var cnd = get_filter(this.filters.filters, k, INCLUDE_TYPES[include]);
	    cnd.push(v);
	};	
    
    Acts.prototype.AddGetLinkedObject = function (k)
	{
	    this.filters.linkedObjs.push(k);
	};	  
	
    Acts.prototype.AddItemIDInclude = function (v)
	{
	    var cnd = get_filter(this.filters.filters, "objectId", "include");
	    cnd.push(v);
	};	 
	
    Acts.prototype.SetItemID = function (itemID)
	{
	    if (itemID === "")
	        return;
	        
	    this.set_value("id", itemID);
	};	 
	
    Acts.prototype.Save = function ()
	{	 
	    this.Save(this.prepared_item, "", this.primary_keys);
        this.prepared_item = null; 
        clean_table(this.primary_keys); 
	};		
	
    Acts.prototype.AddToSaveAllQueue = function ()
	{
	    if (this.prepared_item == null)
	        return;
	    
        this.saveAllQueue.prepare_items.push(this.prepared_item);
	    this.prepared_item = null;
	    
	    if (has_key(this.primary_keys))
	    {
	        this.saveAllQueue.primary_keys.push(this.primary_keys);
	        this.primary_keys = {};
	    }
	    else
	    {
	        this.saveAllQueue.primary_keys.push(null);
	    }
	};	 
	
    Acts.prototype.SaveAll = function ()
	{
	    // prepare
	    var prepare_items = this.saveAllQueue.prepare_items;
	    var primary_keys = this.saveAllQueue.primary_keys;	    
        var i, cnt=prepare_items.length;         
	    if (cnt === 0)
	    {
	        this.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnSaveAllComplete, this);
	        return;
	    }	    	      
        this.saveAllQueue.prepare_items = [];
        this.saveAllQueue.primary_keys = [];
        // prepare
        
        // start
        var self = this;
        var OnSaveAllComplete = function(items)
	    { 	          
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnSaveAllComplete, self);
	    };	
	    var OnSaveAllError = function(items, error)
	    {
	        self.runtime.trigger(cr.plugins_.Rex_parse_ItemTable.prototype.cnds.OnSaveAllError, self);
	    };
	    
	    // step 2. write all items
	    var on_saveAll_handler = {"success":OnSaveAllComplete, "error": OnSaveAllError};  	    
	    var write_all = function(prepared_items_)
	    {      
            window["Parse"]["Object"]["saveAll"](prepared_items_, on_saveAll_handler);
        }
        // step 2. write all items
        
        // step 1. read item
        var ReadCounter = 0;
        var IsReadError = false;               
        var read_item = function (primary_keys_, prepared_item_)
        {
	        var on_read_success = function(item_)
	        {	
	            if (item_ !== null)
	                prepared_item_["id"] = item_["id"];
	            
                ReadCounter --;
                if (ReadCounter === 0)
                    write_all(prepare_items);
	        };	  
	        var on_read_eror = function(item_, error)
	        {	
	            if (!IsReadError)
	            {
                    OnSaveAllError();
                    IsReadError = true;
	            }    	                
	        };	 	          
	        var on_read_handler = {"success":on_read_success, "error": on_read_eror};
	                
            var query = self.primaryKeys_to_query(primary_keys_);
	        query["first"](on_read_handler);
	        ReadCounter ++;            
        };
        // step 1. read item    
	    

	    	   
	    // read items, or write all
	    var primary_keys, has_primary_key=false;	    
	    for (i=0; i<cnt; i++)
	    {
	        if (primary_keys[i])
	        {
	            read_item(primary_keys[i],
	                      prepare_items[i]);
	            has_primary_key = true;
	        }
	    }	    
	    if (!has_primary_key)
	        write_all(prepare_items);	  
	    // read items, or write all          
	};	
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

 	Exps.prototype.CurItemID = function (ret)
	{
		ret.set_string( this.get_itemValue(this.exp_CurItem, "id", "") );
	};
	
 	Exps.prototype.CurItemContent = function (ret, k, default_value)
	{
		ret.set_any( this.get_itemValue(this.exp_CurItem, k, default_value) );
	};
		
 	Exps.prototype.CurSentAt = function (ret)
	{
		ret.set_float( this.get_itemValue(this.exp_CurItem, "updatedAt", 0) );	
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
    
	Exps.prototype.ReceivedItemsCount = function (ret)
	{
		ret.set_int(this.itemTable.GetItems().length);
	};	
    
	Exps.prototype.CurStartIndex = function (ret)
	{
		ret.set_int(this.itemTable.GetStartIndex());
	};	
    
	Exps.prototype.LoopIndex = function (ret)
	{
		ret.set_int(this.exp_LoopIndex);
	};	
	
 	Exps.prototype.Index2ItemID = function (ret, index_)
	{
		ret.set_string( this.get_itemValue(this.itemTable.GetItem(index_), "id", "") );
	};		
 	Exps.prototype.Index2ItemContent = function (ret, index_, k, default_value)
	{
		ret.set_any( this.get_itemValue(this.itemTable.GetItem(index_), k, default_value) );				
	};	
 	Exps.prototype.Index2SentAt = function (ret)
	{	
		ret.set_float( this.get_itemValue(this.itemTable.GetItem(index_), "updatedAt", 0) );		        
	};
	        
	Exps.prototype.ItemsToJSON = function (ret)
	{	    
		ret.set_string( JSON.stringify(this.itemTable.GetItems()) );
	};    
    
 	Exps.prototype.LastSavedItemID = function (ret)
	{
		ret.set_string(this.exp_LastSaveItemID);
	};    
	
 	Exps.prototype.LastFetchedItemID = function (ret)
	{
		ret.set_string( this.get_itemValue(this.exp_LastFetchedItem, "id", "") );
	};
	
 	Exps.prototype.LastFetchedItemContent = function (ret, k, default_value)
	{
		ret.set_any( this.get_itemValue(this.exp_LastFetchedItem, k, default_value) );		
	};
		
 	Exps.prototype.LastFetchedSentAt = function (ret)
	{
		ret.set_float( this.get_itemValue(this.exp_LastFetchedItem, "updatedAt", 0) );			
	};
	   
	Exps.prototype.LastRemovedMessageID = function (ret)
	{
		ret.set_string(this.exp_LastRemovedItemID);
	};		
	    
	Exps.prototype.LastItemsCount = function (ret)
	{
		ret.set_int(this.exp_LastItemsCount);
	};	
}());

(function ()
{
    if (window.ParseQuery != null)
        return;  
        
   var request = function (query, handler, start, lines)
   {	   	          
	    if (start==null)
	        start = 0;
        
        var all_items = [];            
	    var is_onePage = (lines != null) && (lines <= 1000);
	    var linesInPage = (is_onePage)? lines:1000;
	                                       	    
        var self = this;       
	    var on_success = function(items)
	    {
	        all_items.push.apply(all_items, items);
	        var is_last_page = (items.length < linesInPage);   
	        	        
	        if ((!is_onePage) && (!is_last_page))  // try next page
	        {               
	            start += linesInPage;
	            query_page(start);
	        }
	        else  // finish
	        {
                handler["success"](all_items);            
	        }
	    };
	     
	    var read_page_handler = {"success":on_success, "error": handler["error"]};	 	    
	    var query_page = function (start_)
	    {
	        // get 1000 lines for each request until get null or get userID	       
            query["skip"](start_);
            query["limit"](linesInPage);
            query["find"](read_page_handler);
        };

	    query_page(start);
	}; 
	
	var remove_all_items = function (query, handler)
    {
	    var on_read_all = function(all_items)
	    {
	        if (all_items.length === 0)
	        {
	            handler["success"](all_items);
	            return;
	        }
	        window["Parse"]["Object"]["destroyAll"](all_items, handler); 
	    };	    
	    var on_read_handler = {"success":on_read_all, "error": handler["error"]};  
	    request(query, on_read_handler);
    };
    
    window.ParseQuery = request;
    window.ParseRemoveAllItems = remove_all_items;
}());

(function ()
{
    if (window.ParseItemPageKlass != null)
        return;    

    var ItemPageKlass = function (page_lines)
    {
        // export
        this.onReceived = null;
        this.onReceivedError = null;
        this.onGetIterItem = null;  // used in ForEachItem
        // export
	    this.items = [];
        this.start = 0;
        this.page_lines = page_lines;   
        this.page_index = 0;     
        this.is_last_page = false;
    };
    
    var ItemPageKlassProto = ItemPageKlass.prototype;  
     
	ItemPageKlassProto.Reset = function()
	{ 
	    this.items.length = 0;
        this.start = 0;     
	};	
	     
    ItemPageKlassProto.request = function (query, start, lines)
	{
	    if (start==null)
	        start = 0;
        this.items.length = 0; 

        var self = this;       
	    var on_success = function(items)
	    {
            self.items = items;
            self.start = start;
            self.page_index = Math.floor(start/self.page_lines); 

            var is_onePage = (lines != null) && (lines <= 1000);
            if (is_onePage)
                self.is_last_page = (items.length < lines);
            else
                self.is_last_page = true;
	            
            if (self.onReceived)
                self.onReceived();
	    };	    
	    var on_error = function(error)
	    { 
	        self.items.length = 0;
	        self.is_last_page = false;
	        	        
            if (self.onReceivedError)
                self.onReceivedError();	 	           
	    };
        var on_read_handler = {"success":on_success, "error":on_error};               
        window.ParseQuery(query, on_read_handler, start, lines);        
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
    
    ItemPageKlassProto.LoadAllItems = function (query)
	{
	    this.request(query);
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
		        runtime.popSol(current_event.solModifiers);
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

	ItemPageKlassProto.GetItems = function()
	{
	    return this.items;
	};	
	
	ItemPageKlassProto.IsTheLastPage = function()
	{
	    return this.is_last_page;
	};		
	
	ItemPageKlassProto.GetStartIndex = function()
	{
	    return this.start;
	};	
	
	ItemPageKlassProto.GetCurrentPageIndex = function ()
	{
	    return this.page_index;
	};	

	window.ParseItemPageKlass = ItemPageKlass;
}());       