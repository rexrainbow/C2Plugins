// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_BackendlessAPI = function(runtime)
{
	this.runtime = runtime;
};
cr.plugins_.Rex_BackendlessAPI.onInitCallbacks = [];

(function ()
{
	var pluginProto = cr.plugins_.Rex_BackendlessAPI.prototype;
		
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
        var protocol = window.location.protocol;
        var urlStart = 'http' + (/^https/.test(protocol)?'s':'') + "://";
        
        var serverURL;
        var ipAddress = this.properties[3];        
        if (ipAddress !== "")
        {
            serverURL = urlStart + ipAddress + "/api"; 
            window["Backendless"]["serverURL"] = serverURL;    
        }
        else
            serverURL = urlStart + "api.backendless.com";
        
        var apiID = this.properties[0];
        var apiKey = this.properties[1];
        var versionName = this.properties[2];
        window["Backendless"]["initApp"](apiID, apiKey, versionName);
        
        var filesStorageRoot = serverURL + "/" + apiID + "/" + versionName + "/files/";
        window.BackendlessFilesStorageRoot = function(dictPath, fileName)
        {
            var path = filesStorageRoot;
            if (dictPath)
                path += dictPath;
            if (fileName)
                path = path + "/" + fileName;
            return path;
        };
        
        this.runInitCallbacks();
	};
	
	instanceProto.onDestroy = function ()
	{		
	};
    
	instanceProto.runInitCallbacks = function()
	{    
        var onInitCallbacks = cr.plugins_.Rex_BackendlessAPI.onInitCallbacks;
        var i,cnt=onInitCallbacks.length;
        for (i=0; i<cnt;i++)
            onInitCallbacks[i]();
        
        delete cr.plugins_.Rex_BackendlessAPI.onInitCallbacks;
	};    
     
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
 
}()); 

(function ()
{
    var addInitCallback = function(callback)
    {
        var onInitCallbacks = cr.plugins_.Rex_BackendlessAPI.onInitCallbacks;
        if (onInitCallbacks)
            onInitCallbacks.push(callback);
        else
            callback();
    };
    window.BackendlessAddInitCallback = addInitCallback;
}());


(function ()
{
    var klasses = {};    
    var createKlass = function (name)
    {
        if (!klasses.hasOwnProperty(name))
        {
            var s = "(function "+ name + "() {this.___class="+ name + ";})";  
            klasses[name] = eval(s);
        }
        
        return klasses[name];
    };    
    
    window.BackendlessGetKlass = createKlass;
}()); 
      

(function ()
{
	var fillData = function(fillData, obj, name, noClean)
	{
        if (obj == null)
        {
            var klass = window.BackendlessGetKlass(name);
            obj = new klass(); 
        }
        
        for(var n in fillData)
        {
            obj[n] = fillData[n];
            if (!noClean)
                delete fillData[n];
        }
        return obj;
    };         
    window.BackendlessFillData = fillData;
}()); 
    
(function ()
{
    var ItemPageKlass = function (page_lines)
    {
        // export
        this.storage = null;        
        this.onReceived = null;
        this.onReceivedError = null;
        this.onGetIterItem = null;  // used in ForEachItem
        this.cleanRedundant = true;
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
	    if ((start==null) || (start < 0))
	        start = 0;
        this.items.length = 0; 

        var self = this;       
	    var on_success = function(result)
	    {
            var items = result["data"];
            self.items = items;
            self.start = start;
            self.page_index = Math.floor(start/self.page_lines); 

            var is_onePage = (lines != null) && (lines <= 1000);
            if (is_onePage)
                self.is_last_page = (items.length < lines);
            else
                self.is_last_page = true;
	            
            if (self.cleanRedundant)
            {
                var i,cnt=items.length;
                for (i=0; i<cnt; i++)
                    window.BackendlessCleanRedundant(items[i]);                
            }
            if (self.onReceived)
                self.onReceived();
	    };	    
	    var on_error = function(error)
	    { 
	        self.items.length = 0;
	        self.is_last_page = false;
	        	        
            if (self.onReceivedError)
                self.onReceivedError(error);	 	           
	    };
        
        var handler = new window["Backendless"]["Async"]( on_success, on_error );	                      
        window.BackendlessQuery(this.storage, query, handler, start, lines);        
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
            if (this.items[i][key] == value)
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

	window.BackendlessItemPageKlass = ItemPageKlass;
}());       

(function ()
{
    var FilePageKlass = function (page_lines)
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
    
    var FilePageKlassProto = FilePageKlass.prototype;  
     
	FilePageKlassProto.Reset = function()
	{ 
	    this.items.length = 0;
        this.start = 0;     
	};	
	     
    FilePageKlassProto.request = function (query, start, lines)
	{
	    if ((start==null) || (start < 0))
	        start = 0;
        this.items.length = 0; 

        var self = this;       
	    var on_success = function(result)
	    {
            var items = result["data"];
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
                self.onReceivedError(error);	 	           
	    };
        
        var handler = new window["Backendless"]["Async"]( on_success, on_error );	                      
        window.BackendlessFilesListQuery(query, handler, start, lines);        
	}; 	    

    FilePageKlassProto.RequestInRange = function (query, start, lines)
	{
	    this.request(query, start, lines);
	};

    FilePageKlassProto.RequestTurnToPage = function (query, page_index)
	{
	    var start = page_index*this.page_lines;
	    this.request(query, start, this.page_lines);
	};	 
    
    FilePageKlassProto.RequestUpdateCurrentPage = function (query)
	{
	    this.request(query, this.start, this.page_lines);
	};    
    
    FilePageKlassProto.RequestTurnToNextPage = function (query)
	{
        var start = this.start + this.page_lines;
	    this.request(query, start, this.page_lines);
	};     
    
    FilePageKlassProto.RequestTurnToPreviousPage = function (query)
	{
        var start = this.start - this.page_lines;
	    this.request(query, start, this.page_lines);
	};  
    
    FilePageKlassProto.LoadAllItems = function (query)
	{
	    this.request(query);
	}; 
    
	FilePageKlassProto.ForEachItem = function (runtime, start, end)
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

	FilePageKlassProto.FindFirst = function(key, value, start_index)
	{
	    if (start_index == null)
	        start_index = 0;
	        
        var i, cnt=this.items.length;
        for(i=start_index; i<cnt; i++)
        {
            if (this.items[i][key] == value)
                return i + this.start;
        }
	    return -1;
	};

	FilePageKlassProto.GetItem = function(i)
	{
	    return this.items[i - this.start];
	};	

	FilePageKlassProto.GetItems = function()
	{
	    return this.items;
	};	
	
	FilePageKlassProto.IsTheLastPage = function()
	{
	    return this.is_last_page;
	};		
	
	FilePageKlassProto.GetStartIndex = function()
	{
	    return this.start;
	};	
	
	FilePageKlassProto.GetCurrentPageIndex = function ()
	{
	    return this.page_index;
	};	

	window.BackendlessFilePageKlass = FilePageKlass;
}());       

(function ()
{
    var isAcceptedError = function(error)
    {
        var c = error["code"] ;        
        var accepted =  (c === 1009) ||    // Table with the name Leaderboard does not exist
                                  (c === 1017);       // Invalid where clause
                                  
        return accepted;
    };
    
    window.BackendlessIsAcceptedError = isAcceptedError;
}());  

(function ()
{   
   var request = function (storage, query, handler, start, lines)
   {	   	          
	    if (start==null)
	        start = 0;
        
        var all_items = [];            
	    var is_onePage = (lines != null) && (lines <= 100);
	    var linesInPage = (is_onePage)? lines:100;
	                                       	    
        var self = this;       
	    var on_success = function(result)
	    {
            var items = result["data"];
	        all_items.push.apply(all_items, items);
	        var is_last_page = (items.length < linesInPage);   
	        	        
	        if ((!is_onePage) && (!is_last_page))  // try next page
	        {               
	            start += linesInPage;
	            query_page(start);
	        }
	        else  // finish
	        {
                result["data"] = all_items;
                handler["success"](result);            
	        }
	    };
        
        var on_error = function(error)
        {
            if (window.BackendlessIsAcceptedError(error))
            {
                var result = {"data":[]};    // prepare a null itemObj
                on_success(result);
            }
            else
                handler["fault"](error);
        }
	     
        var read_page_handler = new window["Backendless"]["Async"]( on_success, on_error );	    
	    var query_page = function (start_)
	    {
	        // get 100 lines for each request until get null or get userID	            
            if (query["options"] == null)
                query["options"] = {};
            
            query["options"]["offset"] = start_;
            query["options"]["pageSize"] = linesInPage;
            storage["find"](query, read_page_handler);
        };

	    query_page(start);
	}; 

	var remove_all_items = function (storage, query, handler)
    {
	    var on_read_all = function(result)
	    {
            var items = result["data"];
	        if (items.length === 0)
	        {
	            handler["success"]();
	            return;
	        }
            
            var totalAccessCount = 0;
            var lastError = null;
            var onAllAccessCompleted = function(error)
            {
                if (error)
                    handler["fault"](error);
                else
                    handler["success"]();
            }
            var on_remove_success = function()
            {
                totalAccessCount --;
                if (totalAccessCount === 0)
                    onAllAccessCompleted(lastError);
            }
            var on_remove_error = function(error)
            {
                totalAccessCount --;                
                lastError = error;
                if (totalAccessCount === 0)
                    onAllAccessCompleted(lastError);
            }
            var delete_handler = new window["Backendless"]["Async"]( on_remove_success, on_remove_error );                       
            var i, cnt=items.length;
            for(i=0; i<cnt; i++)
            {
                totalAccessCount ++;
                storage["remove"](items[i], delete_handler);                
            }
	    };	    
        
        var read_handler = new window["Backendless"]["Async"]( on_read_all, handler["fault"] );	
        query["properties"] = ["objectId"];        
	    request(storage, query, read_handler);
    };   
    
    window.BackendlessQuery = request;
    window.BackendlessRemoveAllItems = remove_all_items;
}());


(function ()
{   
   var request = function (query, handler, start, lines)
   {	   	          
	    if (start==null)
	        start = 0;
        
        var all_items = [];            
	    var is_onePage = (lines != null) && (lines <= 100);
	    var linesInPage = (is_onePage)? lines:100;
	                                       	    
        var self = this;       
	    var on_success = function(result)
	    {
            var items = result["data"];
	        all_items.push.apply(all_items, items);
	        var is_last_page = (items.length < linesInPage);   
	        	        
	        if ((!is_onePage) && (!is_last_page))  // try next page
	        {               
	            start += linesInPage;
	            query_page(start);
	        }
	        else  // finish
	        {
                result["data"] = all_items;
                handler["success"](result);            
	        }
	    };
        
        var on_error = function(error)
        {
            if (window.BackendlessIsAcceptedError(error))
            {
                var result = {"data":[]};    // prepare a null itemObj
                on_success(result);
            }
            else
                handler["fault"](error);
        }
	     
        var read_page_handler = new window["Backendless"]["Async"]( on_success, on_error );	    
	    var query_page = function (start_)
	    {            
            window["Backendless"]["Files"]["listing"]( 
                query[0],                 // path
                query[1],                 // pattern
                query[2],                 // recursively (include sub-folder)
                linesInPage,             // pagesize
                start_,                     // offset
                read_page_handler  // async
                );
        };

	    query_page(start);
	}; 

    window.BackendlessFilesListQuery = request;
}());


(function ()
{
    var init_table = function (storage, item)
    { 
        var nullCallback = function(){};
	    var on_write_success = function(item)
	    {
            var handler = new window["Backendless"]["Async"]( nullCallback, nullCallback );	
            storage["remove"]( item, handler );
	    };	
	    
	    var on_write_error = function(item_obj, error)
	    {
	    };
        var handler = new window["Backendless"]["Async"]( on_write_success, on_write_error );	
        storage["save"](item, handler);
    };

    window.BackendlessInitTable = init_table;
}());


(function ()
{
 	var getItemValue = function (item, k, default_value, noClean)
	{
        var v;
	    if (item == null)
            v = null;
        else if ( (k == null) || (k === "") )
            v = item;
        else if (k === "updated")
            v = item["updated"] || item["created"];
        else if (k.indexOf(".") == -1)
            v = item[k];
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
                    
                v = v[kList[i]];
            }
        }
        
        if (!noClean)
            v = window.BackendlessCleanRedundant(v);
        
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
    window.BackendlessGetItemValue = getItemValue;
    
	var getSubItemValue = function (item, mainKey, subKey, default_value)
	{
        var key = mainKey;
        if (subKey != null)
            key = key + "." + subKey;
        
        var data = window.BackendlessGetItemValue(item, key, 0); 
		return data;
	};      
    
    window.BackendlessGetSubItemValue = getSubItemValue;
}());

(function ()
{
	var cleanRedundant = function (o)
	{
        if ((o==null) || (typeof(o) !== "object"))
            return o;
        
        if (o.hasOwnProperty("__meta"))
            delete o["__meta"];
        if (o.hasOwnProperty("__updated__meta"))
            delete o["__updated__meta"];
        
        
        return o;
	};	 
    window.BackendlessCleanRedundant = cleanRedundant;
}());

(function ()
{
	var getUpdatedCond = function(cmp, timestamp)
	{
        var s = cmp + timestamp.toString();
        return "(updated" + s + " OR (updated IS null AND created" + s + "))";
    };         
    window.BackendlessGetUpdatedCond = getUpdatedCond;
}()); 
    