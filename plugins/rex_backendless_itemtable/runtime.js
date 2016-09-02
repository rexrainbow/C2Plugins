// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Backendless_ItemTable = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Backendless_ItemTable.prototype;
		
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
        var self = this;
        var myInit = function()
        {
            self.myInit();
        };
        window.BackendlessAddInitCallback(myInit);
	};
	instanceProto.myInit = function()
	{ 	       
        this.tableKlassName = this.properties[0];
        this.tableKlass = window.BackendlessGetKlass(this.tableKlassName); 
        this.tableStorage = window["Backendless"]["Persistence"]["of"](this.tableKlass);        
        
	    if (!this.recycled)
	    {
	        var page_lines = this.properties[1];	    
            this.itemTable = this.create_itemTable(page_lines);	
            this.filters = create_filters();  
            this.primary_key_candidates = {};  
            this.primary_key_saved = null;
            this.primaryKeys = {};    
            this.saveAllQueue = {};
            this.saveAllQueue.prepare_items = [];
            this.saveAllQueue.primaryKeys = [];
	    }
	    else
	    {	        
            this.onDestroy(); 
	    }	   
	    
	    this.get_primary_key_candidates( this.properties[2]);	 
        this.preparedItem = {};
        
        this.cleanMetaData = (this.properties[3] === 1);
        
        this.exp_LoopIndex = -1;
        this.exp_LastSaveItemID = "";
	    this.exp_CurItemIndex = -1;
	    this.exp_CurItem = null;   
        this.exp_LastFetchedItemID = "";
	    this.exp_LastFetchedItem = null;
	    this.exp_LastRemovedItemID = "";
	    this.exp_LastItemsCount = -1; 
	    this.last_error = null;	   
	};    
    
	instanceProto.onDestroy = function ()
	{
	    this.itemTable.Reset();
	    clean_filters( this.filters );
        clean_table(this.primary_key_candidates);     
        this.primary_key_saved = null;
        clean_table(this.primaryKeys);
        this.saveAllQueue.prepare_items.length = 0;
        this.saveAllQueue.primaryKeys.length = 0;
	};       
	
	instanceProto.create_itemTable = function(page_lines)
	{ 
	    var itemTable = new window.BackendlessItemPageKlass(page_lines);
	    
        itemTable.storage = this.tableStorage;  
	    var self = this;
	    var onReceived = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnReceived, self);
	    }
	    itemTable.onReceived = onReceived;
        itemTable.cleanMetaData = this.cleanMetaData;
	    
	    var onReceivedError = function(error)
	    {	       
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnReceivedError, self);
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

	instanceProto.get_primary_key_candidates = function(primaryKeysIn, primary_key_candidates)
	{ 
        if (primaryKeysIn === "")
            this.primary_key_saved = [];
        else
            this.primary_key_saved = primaryKeysIn.split(",");
        
       clean_table(this.primary_key_candidates);
            
	    var i,cnt=this.primary_key_saved.length;
	    for(i=0; i<cnt; i++)
	        this.primary_key_candidates[this.primary_key_saved[i]] = true;
	}; 
		
	var create_filters = function()
	{ 
        var filters = {};   
        filters.filters = {};    // {k:[ ["AND", cnd] ]}
        filters.cond = null;
        filters.orders = [];
        filters.fields = []; 
        filters.linkedObjs = [];        
        return filters;
	};    
    
	var clean_filters = function(filters)
	{ 
        clean_table(filters.filters);
        filters.cond = null;
        filters.orders.length = 0;
        filters.fields.length = 0;
        filters.linkedObjs.length = 0;
	};
    
	var copy_filters = function(filtersIn)
	{ 
        var filtersOut = {}; 
        filtersOut.filters = copy_object(filtersIn.filters);
        filtersOut.cond = copy_object(filtersIn.cond);
        filtersOut.orders = copy_object(filtersIn.orders);
        filtersOut.fields = copy_object(filtersIn.fields);
        filtersOut.linkedObjs = copy_object(filtersIn.linkedObjs);
        return filtersOut;
	};    
    
	var get_filter = function (filters, k)
	{
	    if (!filters.hasOwnProperty(k))
	        filters[k] = [];
        
	    return filters[k];
	}    

    var reverEval = function (value)
    {
        if (typeof(value) === "string")
            value = "'" + value + "'";
        
        return value;
    };  
    
	instanceProto.primaryKeys_to_query = function(primaryKeys)
	{
        var conds = [];        
        for (var k in primaryKeys)
            conds.push(k + "=" + reverEval(primaryKeys[k]));
        var cond = conds.join(" AND ");
        
        var query = new window["Backendless"]["DataQuery"]();
        query["condition"] = cond;
        query["options"] = {
            "pageSize": 1,
            "offset": 0,
        };        
        query["properties"] = ["objectId"];
        
        return query;	    
    };
    
	instanceProto.SaveRow = function(preparedItem, primaryKeys, handler_)
	{
        var self = this;                
        var OnSaveComplete = function(item)
	    { 	        
            self.exp_LastSaveItemID = item["objectId"];
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnSaveComplete, self);
            
            if (handler_)
                handler_["success"](item);
	    };	
	    var OnSaveError = function(error)
	    {
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnSaveError, self);
            
            if (handler_)
                handler_["fault"](error);            
	    };
 
        // step 2. write item 
        var on_write_handler = new window["Backendless"]["Async"]( OnSaveComplete, OnSaveError );	
        var write_item = function (data)
        {
            var itemObj = window.BackendlessFillData(data, null, self.tableKlassName);   
            var write_handler = new window["Backendless"]["Async"]( OnSaveComplete, OnSaveError );	
            self.tableStorage["save"](itemObj, write_handler);
        }
        // step 2. write item                             
        

        // step 1. read items
	    var read_item = function (primary_keys_)
	    {	        
	        var on_read_success = function(result)
	        {	
                var itemObj = result["data"][0];
                if (itemObj)
                    preparedItem["objectId"] = itemObj["objectId"];
	            write_item(preparedItem);
	        };	    
            var read_handler = new window["Backendless"]["Async"]( on_read_success, OnSaveError );
            var query = self.primaryKeys_to_query(primary_keys_);   
            window.BackendlessQuery(self.tableStorage, query, read_handler);            
	    };
	    // step 1. read items
	    
        
        // write to a specific row
        if (preparedItem["objectId"])
            write_item(preparedItem)
        
        // query then write
        else if (primaryKeys && has_key(primaryKeys))
            read_item(primaryKeys);        
            
        // push a new row
        else                       
            write_item(preparedItem);
	};
    
    var condAND = [];
    var condOR = [];
	var add_conditions = function(query, filters, cond)
	{ 
        if (cond != null)
            query["condition"] = cond;
        else
        {            
            var cndAND = [];       
            for (var k in filters)
            {
                var flt = filters[k];
                var i,cnt=flt.length, cnd;
                for (i=0; i<cnt; i++)
                {
                    cnd = flt[i];               
                    if (cnd[0] === "AND")
                    {
                        condAND.push(cnd[1]);
                    }
                    else // OR
                    {
                        condOR.push(cnd[1]);
                    }
                }
                if (condOR.length > 0)
                {
                    condAND.push("("+condOR.join(" OR ")+")");
                    condOR.length = 0;
                }
            }
            query["condition"] = condAND.join(" AND ");
            condAND.length = 0;
        }
	}; 

	var add_orders = function(query, orders)
	{
        if (orders.length == 0)
            return;
        
        if (query["options"] == null)
            query["options"] = {};
            
        query["options"]["sortBy"] = copy_object(orders);
    };
    
	var add_fields = function(query, fields)
	{
        if (fields.length == 0)
            return;

        query["properties"] = copy_object(fields);
    };
    
	var add_linkedObjs = function(query, linkedObjs)
	{        
        if (linkedObjs.length == 0)
            return;
            
        if (query["options"] == null)
            query["options"] = {};
        
        query["options"]["relations"] = copy_object(linkedObjs);
    };	
	
	instanceProto.get_request_query = function(filters)
	{ 
        var query = new window["Backendless"]["DataQuery"]();
        add_conditions(query, filters.filters, filters.cond);
        add_orders(query, filters.orders);
        add_fields(query, filters.fields);
        add_linkedObjs(query, filters.linkedObjs);
        return query;	    
	};

    instanceProto.set_value = function (k, v, is_primary)
	{
        // TODO: key with special command?        
        this.preparedItem[k] = v;
		if (is_primary || this.primary_key_candidates.hasOwnProperty(k))		   
            this.primaryKeys[k] = v;
	};
    
	instanceProto.Index2QueriedItemID = function (index, default_value)
	{    
	    var item = this.itemTable.GetItems()[index];
	    return window.BackendlessGetItemValue(item, "objectId", default_value);     
	};    

	var clean_table = function (o)
	{
        if (o == null)
            o = {};
        else
        {
		    for (var k in o)
		        delete o[k];
        }       
        return o;
	};	
    
    var copy_object = function (oIn)
    {
        var oOut;
        if (oIn == null)
            oOut = oIn;
        else if (oIn instanceof Array)
        {
            oOut = [];
            cr.shallowAssignArray(oOut, oIn);
        }        
        else if (typeof(oIn) === "object")
        {
            oOut = {};
            for (var k in oIn)
            {
                oOut[k] = oIn[k];
            }
        }
        else 
            oOut = oIn;
        
        return oOut;
    }
	
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
	      
    Acts.prototype.SetValue = function (k, v, is_primaryKey)
	{
	    is_primaryKey = (is_primaryKey === 1);
	    this.set_value(k, v, is_primaryKey);
	};
	
    Acts.prototype.SetBooleanValue = function (k, is_true, is_primaryKey)
	{
        is_true = (is_true === 1);
	    is_primaryKey = (is_primaryKey === 1);
	    this.set_value(k, is_true, is_primaryKey);     
	};
    
    Acts.prototype.RequestInRange = function (start, lines)
	{
	    var query = this.get_request_query(this.filters);
	    this.itemTable.RequestInRange(query, start, lines);
	};

    Acts.prototype.RequestTurnToPage = function (page_index)
	{
	    var query = this.get_request_query(this.filters);
	    this.itemTable.RequestTurnToPage(query, page_index);
	};	 
    
    Acts.prototype.RequestUpdateCurrentPage = function ()
	{
	    var query = this.get_request_query(this.filters);	
	    this.itemTable.RequestUpdateCurrentPage(query);
	};    
    
    Acts.prototype.RequestTurnToNextPage = function ()
	{
	    var query = this.get_request_query(this.filters);	
	    this.itemTable.RequestTurnToNextPage(query);
	};     
    
    Acts.prototype.RequestTurnToPreviousPage = function ()
	{
	    var query = this.get_request_query(this.filters);	
	    this.itemTable.RequestTurnToPreviousPage(query);
	};  
    
    Acts.prototype.LoadAllItems = function ()
	{
	    var query = this.get_request_query(this.filters);	    
	    this.itemTable.LoadAllItems(query);
	}; 
	
    Acts.prototype.NewFilter = function ()
	{    
        this.filters = create_filters();
	};	
    
    Acts.prototype.AddAllValue = function (k)
	{
        get_filter(this.filters.filters, k).length = 0;
	};     
	
    Acts.prototype.AddFilterCondition = function (cond)
	{    
        this.filters.cond = cond;
	};	    
    
    var COMPARE_TYPES = ["=", "!=", ">", "<", ">=", "<="];
    Acts.prototype.AddValueComparsion = function (k, cmp, v)
	{
        cmp = COMPARE_TYPES[cmp];
        var cond = k + cmp + reverEval(v);
        get_filter(this.filters.filters, k).push(["AND", cond]);
	}; 	
	
    var TIMESTAMP_CONDITIONS = [
        ["<", "<="],           // before, excluded/included
        [">", ">="],     // after, excluded/included
    ];
    Acts.prototype.AddTimeConstraint = function (when_, timestamp, is_included, type)
	{
	    var cmp = TIMESTAMP_CONDITIONS[when_][is_included];
        timestamp = timestamp.toString();
        if (type === 0) // created
            cond = "created" + cmp + timestamp;
        else  // updated
            cond = window.BackendlessGetUpdatedCond(cmp, timestamp);
        
        get_filter(this.filters.filters, "updated").push(["AND", cond]);
	}; 	
    
    Acts.prototype.AddStringPattern = function (k, v, cmp)
	{
        if (cmp === 0)
            v = v+"%";
        else if (cmp === 1)
            v = "%"+v;
        else
            v = "%"+v+"%";
        
        var cond = k + " LIKE " + reverEval(v);
        get_filter(this.filters.filters, k).push(["AND", cond]);
	}; 	
    
    var EXIST_TYPES = [" IS null", " IS NOT null"];
    Acts.prototype.AddExist = function (k, exist)
	{
        var cond = k + EXIST_TYPES[exist];
        get_filter(this.filters.filters, k).push(["AND", cond]);
	}; 	
	
    Acts.prototype.AddBooleanValueComparsion = function (k, v)
	{
        var cond = k + "=" + (v === 1).toString();
        get_filter(this.filters.filters, k).push(["AND", cond]);
        
	};	
    
    var ORDER_TYPES = ["descending", "ascending"];
    Acts.prototype.AddOrder = function (k, order_)
	{
        if (order_ === 0)
            k = k + " desc";
       
        this.filters.orders.push(k);
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
            if (self.cleanMetaData)
            {
                window.BackendlessCleanRedundant(item);
            }
            self.exp_LastFetchedItemID = itemID;
	        self.exp_LastFetchedItem = item;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnLoadByItemIDComplete, self);
	    };	    
	    var on_error = function(error)
	    { 
	        self.last_error = error;        
            self.exp_LastFetchedItemID = itemID;        
	        self.exp_LastFetchedItem = null;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnLoadByItemIDError, self);     
	    };
	    
	    var handler = new window["Backendless"]["Async"]( on_success, on_error );	    
        this.tableStorage["findById"](itemID, handler);
	}; 	
	
    Acts.prototype.RemoveByItemID = function (itemID)
	{
        var self = this;
        
	    var on_success = function()
	    {            
	        self.exp_LastRemovedItemID = itemID;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnRemoveByItemIDComplete, self);
	    };	    
	    var on_error = function(error)
	    { 
	        self.last_error = error;
	        self.exp_LastRemovedItemID = itemID;            
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnRemoveByItemIDError, self);    
	    };	    
	    var handler = new window["Backendless"]["Async"]( on_success, on_error );	            
	    var item = new this.tableKlass();
        item["objectId"] = itemID;
        this.tableStorage["remove"](item, handler);
	}; 	
	
    Acts.prototype.RemoveQueriedItems = function ()
	{
	    var query = this.get_request_query(this.filters); 
	    
        var self = this;
	    var on_success = function()
	    {
            self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnRemoveQueriedItemsComplete, self);	        
	    };	
	    var on_error = function(error)
	    {  
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnRemoveQueriedItemsError, self); 
	    };	           
	    var handler = new window["Backendless"]["Async"]( on_success, on_error );	          
	    window.BackendlessRemoveAllItems(this.tableStorage, query, handler); 
	}; 	
	
    Acts.prototype.RemoveByIndex = function (index)
	{
        var itemID = this.Index2QueriedItemID(index, null);
        if (itemID === null)
            return;
        
        Acts.prototype.RemoveByItemID.call(this, itemID);
	}; 
        
    Acts.prototype.GetItemsCount = function ()
	{
        var self=this;
        
	    var query = this.get_request_query(this.filters);
        query["properties"] = ["objectId"];          
	    var on_success = function(result)
	    {
	        self.exp_LastItemsCount = result["data"].length;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnGetItemsCountComplete, self); 	            
	    };	     
	    var on_error = function(error)
	    {  
	        self.exp_LastItemsCount = -1;
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnGetItemsCountError, self); 
	    };	        
        var handler = new window["Backendless"]["Async"]( on_success, on_error );	      
	    window.BackendlessQuery(this.tableStorage, query, handler);
	};	
	
    Acts.prototype.LoadRandomItems = function (pick_count)
	{
        // copy filters
        var self=this;
        var myFilters = copy_filters(this.filters);
	    var on_error = function(error)
	    {  
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnReceivedError, self); 
	    };
	    	   
        var get_random_items = function (itemsIn, pick_cnt)
        {
	        var picked_items=[], total_cnt=itemsIn.length;
	        
	        // put picked items in picked_items        
	        if (total_cnt <= pick_cnt)
	        {
	            cr.shallowAssignArray(picked_items, itemsIn);
	        }
	        else if ((pick_cnt/total_cnt) < 0.5)
	        {
	            // random number picking
                var i, rv, try_pick;
                var rvList={};         // result of random numbers
                for (i=0; i<pick_cnt; i++)
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
	            picked_items.length = pick_cnt;
	        }
	        
	        return picked_items;
        };
                
	    var on_read_success = function(result)
	    {
            var picked_items = get_random_items(result["data"], pick_count); 
            
	        // query items by itemID
            var objectIdFilter = get_filter(myFilters.filters, "objectId");
            objectIdFilter.length = 0;
	        var i, cnt=picked_items.length, objectId;
	        for(i=0; i<cnt; i++)
	        {
                objectId = picked_items[i]["objectId"];
                objectIdFilter.push([ "OR", "objectId="+ reverEval(objectId) ]);
	        }
	        
	        var query = self.get_request_query(myFilters);
	        self.itemTable.LoadAllItems(query);	            
	    };	      
        var readID_query = this.get_request_query(myFilters);
        readID_query["properties"] = ["objectId"];          
        var on_read_handler = new window["Backendless"]["Async"]( on_read_success, on_error );	      
	    window.BackendlessQuery(this.tableStorage, readID_query, on_read_handler);
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
		    
    Acts.prototype.LinkToObject = function (k, tableName, objectId, tableType)
	{
        var tableKlass = window.BackendlessGetKlass(tableName);   
        var item = new tableKlass();
        item["objectId"] = objectId;
        this.preparedItem[k] = item;
	};    
		    
    Acts.prototype.LinkToCurrentUser = function (k)
	{
        this.preparedItem[k] = window["Backendless"]["UserService"]["getCurrentUser"]();
	};       
        
    var INCLUDE_TYPES = ["!=", "="];
    Acts.prototype.AddValueInclude = function (k, cmp, v)
	{
        cmp = INCLUDE_TYPES[cmp];
        var cond = k + cmp + reverEval(v);
        get_filter(this.filters.filters, k).push(["OR", cond]);
	};	
    
    Acts.prototype.AddGetLinkedObject = function (k)
	{
	    this.filters.linkedObjs.push(k);
	};	  
	
    Acts.prototype.AddItemIDInclude = function (v)
	{
        Acts.prototype.AddValueInclude.call(this, "objectId", 1, v);
	};	 
	
    Acts.prototype.SetItemID = function (itemID)
	{
	    this.set_value("objectId", itemID);
	};	 
	
    Acts.prototype.Save = function ()
	{	 
	    this.SaveRow(this.preparedItem, this.primaryKeys);
        this.preparedItem = {};
	};		
	
    Acts.prototype.SetItemIDByIndex = function (index)
	{
	    var itemID = this.Index2QueriedItemID(index, null);        
        if (itemID === null)
            return;
        
        Acts.prototype.SetItemID.call(this, itemID);
	};	 
    
    Acts.prototype.AddToSaveAllQueue = function ()
	{
	    if (this.preparedItem == null)
	        return;
	    
        this.saveAllQueue.prepare_items.push(this.preparedItem);
	    this.preparedItem = {};
	    
	    if (has_key(this.primaryKeys))
	    {
	        this.saveAllQueue.primaryKeys.push(this.primaryKeys);
	        this.primaryKeys = {};
	    }
	    else
	    {
	        this.saveAllQueue.primaryKeys.push(null);
	    }
	};	 
	
    Acts.prototype.SaveAll = function ()
	{
	    if (this.saveAllQueue.prepare_items.length === 0)
	    {
	        this.runtime.trigger(cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds.OnSaveAllComplete, this);
	        return;
	    }
        
	    // prepare        
	    var prepare_items = this.saveAllQueue.prepare_items;
	    var primaryKeys = this.saveAllQueue.primaryKeys;
        this.saveAllQueue.prepare_items = [];
        this.saveAllQueue.primaryKeys = [];
        // prepare
        
        // start
        var self = this;
        var OnSaveAllComplete = function(error)
	    {
            self.last_error = error;            
            var cnds = cr.plugins_.Rex_Backendless_ItemTable.prototype.cnds;
            var trig = (error == null)? cnds.OnSaveAllComplete : cnds.OnSaveAllError;
	        self.runtime.trigger(trig, self);
	    };	
        
        // save items one by one
        var saveCount = 0;
        var lastError = null;        
	    var on_saveOne_success = function(item)
	    {	
            saveCount --;
            if (saveCount === 0)
                OnSaveAllComplete(lastError);
	    };	  
	    var on_saveOne_error = function(error)
	    {
            lastError = error;
            saveCount --;
            if (saveCount === 0)
                OnSaveAllComplete(lastError);   	                
	    };	 	          
        var handler = new window["Backendless"]["Async"]( on_saveOne_success, on_saveOne_error );
        
        var i, cnt=prepare_items.length;    
	    for (i=0; i<cnt; i++)
	    {
            saveCount ++;
            this.SaveRow(prepare_items[i], primaryKeys[i], handler);
	    }   
        // save items one by one        
	};	
	
    Acts.prototype.SetPrimaryKeys = function (keys)
	{
	    this.get_primary_key_candidates(keys);
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

 	Exps.prototype.CurItemID = function (ret)
	{
		ret.set_string( window.BackendlessGetItemValue(this.exp_CurItem, "objectId", "") );
	};
	
 	Exps.prototype.CurItemContent = function (ret, k, default_value)
	{
		ret.set_any( window.BackendlessGetItemValue(this.exp_CurItem, k, default_value) );
	};
		
 	Exps.prototype.CurSavedTime = function (ret)
	{
		ret.set_float( window.BackendlessGetItemValue(this.exp_CurItem, "updated", 0) );
	};
    
	Exps.prototype.CurItemIndex = function (ret)
	{
		ret.set_int(this.exp_CurItemIndex);
	};	
	
 	Exps.prototype.PreparedItemContent = function (ret, k, default_value)
	{
		ret.set_any( window.BackendlessGetItemValue(this.save_item, k, default_value) );
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
	
 	Exps.prototype.Index2ItemID = function (ret, index)
	{
		ret.set_string( window.BackendlessGetItemValue(this.itemTable.GetItem(index), "objectId", "") );
	};		
 	Exps.prototype.Index2ItemContent = function (ret, index, k, default_value)
	{
		ret.set_any( window.BackendlessGetItemValue(this.itemTable.GetItem(index), k, default_value) );
	};	
 	Exps.prototype.Index2SavedTime = function (ret, index)
	{	
		ret.set_float( window.BackendlessGetItemValue(this.itemTable.GetItem(index), "updated", 0) );      
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
		ret.set_string(this.exp_LastFetchedItemID);
	};
	
 	Exps.prototype.LastFetchedItemContent = function (ret, k, default_value)
	{       
		ret.set_any( window.BackendlessGetItemValue(this.exp_LastFetchedItem, k, default_value) );        
	};
		
 	Exps.prototype.LastFetchedSavedTime = function (ret)
	{
		ret.set_float( window.BackendlessGetItemValue(this.exp_LastFetchedItem, "updated", 0) );
	};
	   
	Exps.prototype.LastRemovedItemID = function (ret)
	{
		ret.set_string(this.exp_LastRemovedItemID);
	};		
	    
	Exps.prototype.LastItemsCount = function (ret)
	{
		ret.set_int(this.exp_LastItemsCount);
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
    
	Exps.prototype.At = function (ret)
	{
        var val;
        if ((this.primary_key_saved.length+2) <= arguments.length)
        {            
            var items=this.itemTable.GetItems();
            var i,icnt=items.length, item, pickedItem;   
            var j,jcnt=this.primary_key_saved.length;   
            var default_value = arguments[jcnt+2];
            var k, v, isFound, vItem;     
            for (i=0; i<icnt; i++)
            {
                item = items[i];            
                isFound = true;
                for(j=0; j<jcnt; j++)
                {
                    k = this.primary_key_saved[j];
                    v = arguments[j+1];
                    vItem = window.BackendlessGetItemValue(item, k);
                    if (vItem !== v)
                    {
                        isFound = false;
                        break;
                    }
                }
                
                if (isFound)
                {
                    pickedItem = item;
                    break;
                }
            }
            
            if (pickedItem)
            {
                k = arguments[jcnt+1];
                val = window.BackendlessGetItemValue(pickedItem, k, default_value);
            }
            else            
                val = default_value;
        }
        
        if (val == null)
            val = 0;
        
        ret.set_any(val);
	};     
		
}());