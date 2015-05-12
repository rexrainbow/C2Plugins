/*
<rankID>
    ownerID - userID of owner
    targetID - userID of target object
    category - category of this tag
    tag - user tag
    ownerObject - object at user table indexed by ownerID (optional)
    targetObject - object at targe table indexed by targetID (optional)    
*/

// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Parse_tags = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Parse_tags.prototype;
		
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
	        this.tag_klass = window["Parse"].Object["extend"](this.properties[2]);
	    }	
	    
	    var page_lines = this.properties[3];
	    
	    if (!this.recycled)
	        this.tagbox = this.create_tagbox(page_lines);
	    else
	        this.tagbox.Reset();
	        
        if (!this.recycled)     
            this.filters = create_filters();
        else
            clean_filters( this.filters );	        
	    
	    this.exp_CurTagIndex = -1;
	    this.exp_CurTag = null;  	    	        

	    
	    // tag list    
	    this.tagsList = {};
	    this.exp_TLTotalTagsCount = 0;
	    this.exp_TLxx = null;	
	    this.exp_TLTagNameCount = 0;    
	};

	instanceProto.create_tagbox = function(page_lines)
	{ 
	    var tagbox = new window.ParseItemPageKlass(page_lines);
	    
	    var self = this;
	    var onReceived = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_Parse_tags.prototype.cnds.OnReceived, self);
	    }
	    tagbox.onReceived = onReceived;
	    
	    var onReceivedError = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_Parse_tags.prototype.cnds.OnReceivedError, self);
	    }
	    tagbox.onReceivedError = onReceivedError;
	    	    
	    var onGetIterItem = function(item, i)
	    {
            self.exp_CurTagIndex = i;
            self.exp_CurTag = item;
	    };	    	    
	    tagbox.onGetIterItem = onGetIterItem;
	    
	    return tagbox;
	};		
    
	var create_filters = function(filters)
	{ 
        var filters = {};   
        filters.owners = [];
        filters.targets = [];
        filters.userTags = [];
        filters.categoies = [];
        return filters;
	};   
	
	var clean_filters = function(filters)
	{ 
        if (filters.owners.length != 0)
            filters.owners = [];
            
        if (filters.targets.length != 0)            
            filters.targets = [];
            
        if (filters.userTags.length != 0)                
            filters.userTags = [];  
            
        if (filters.categoies.length != 0)                
            filters.categoies = [];     
	}; 		

	
    instanceProto.get_request_query = function (filters)
	{
        var query = new window["Parse"]["Query"](this.tag_klass);
                        
        var owners_cnt = filters.owners.length;
        if (owners_cnt == 1)
            query["equalTo"]("ownerID", filters.owners[0]);
        else if (owners_cnt > 1)
            query["containedIn"]("ownerID", filters.owners);        

        var targets_cnt = filters.targets.length;
        if (targets_cnt == 1)
            query["equalTo"]("targetID", filters.targets[0]);
        else if (targets_cnt > 1)
            query["containedIn"]("targetID", filters.targets);

        var userTags_cnt = filters.userTags.length;
        if (userTags_cnt == 1)
            query["equalTo"]("tag", filters.userTags[0]);
        else if (userTags_cnt > 1)
            query["containedIn"]("tag", filters.userTags);

        var categoies_cnt = filters.categoies.length;
        if (categoies_cnt == 1)
            query["equalTo"]("category", filters.categoies[0]);
        else if (categoies_cnt > 1)
            query["containedIn"]("category", filters.categoies);
            
        
        query["include"]("ownerObject");
        query["include"]("targetObject");
            
        clean_filters(filters); 
        return query;
	}; 
		
	instanceProto.get_base_query = function(ownerID, targetID, category, userTag)
	{ 
	    var query = new window["Parse"]["Query"](this.tag_klass);
	    
	    if (ownerID != null)
	        query["equalTo"]("ownerID", ownerID);
	    if (targetID != null)
	        query["equalTo"]("targetID", targetID);
	    if (category != null)
	        query["equalTo"]("category", category);
	    if (userTag != null)
	        query["equalTo"]("tag", userTag);	        
	        
	    return query;
	};
	
    instanceProto.paste_tag = function (ownerID, ownerKlass, targetID, targetKlass, userTag, category)
	{	
	    var self = this;
	    // step 3    
	    var OnPasteComplete = function(tag_obj)
	    { 	        
	        self.runtime.trigger(cr.plugins_.Rex_Parse_tags.prototype.cnds.OnPasteComplete, self);
	    };	
	    
	    var OnPasteError = function(tag_obj, error)
	    {
	        self.runtime.trigger(cr.plugins_.Rex_Parse_tags.prototype.cnds.OnPasteError, self);
	    };
	    	    
	    var save_tag = function(tag_obj)
	    {
	        tag_obj["set"]("ownerID", ownerID);
	        tag_obj["set"]("targetID", targetID);
	        tag_obj["set"]("category", category);
	        tag_obj["set"]("tag", userTag);
	        
	        if (ownerKlass !== "")
	        {
	            var t = window["Parse"].Object["extend"](ownerKlass);
	            var o = new t();
	            o["id"] = ownerID;
	            tag_obj["set"]("ownerObject", o);
	        }
	        if (targetKlass !== "")
	        {
	            var t = window["Parse"].Object["extend"](targetKlass);
	            var o = new t();
	            o["id"] = targetID;
	            tag_obj["set"]("targetObject", o);
	        }	        
	        var handler = {"success":OnPasteComplete, "error": OnPasteError};
	        tag_obj["save"](null, handler);	        
	    };
	    
	    // step 2
	    var on_success = function(tag_obj)
	    {	 
	        if (!tag_obj)
	        {	            	        
	            tag_obj = new self.tag_klass();	            	        
	            save_tag(tag_obj);
	        }
	        else
	        {
	            // tag had already existed
	        } 
	       
	    };	    
	    var on_error = function(error)
	    {
	        OnPasteError(null, error);
	    };
        
	    // step 1
		var handler = {"success":on_success, "error": on_error};		
	    this.get_base_query(ownerID, targetID, category, userTag)["first"](handler); 
	}; 	
		
    var clean_table = function (o)
    {
        for(var n in o)
            delete o[n];
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
	
 	Cnds.prototype.OnReceived = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnReceivedError = function ()
	{
	    return true;
	};
	Cnds.prototype.OnRemoveQueriedTagsComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnRemoveQueriedTagsError = function ()
	{
	    return true;
	};	
	
	Cnds.prototype.OnGetTagsCountComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnGetTagsCountError = function ()
	{
	    return true;
	};
		    
	Cnds.prototype.ForEachTag = function (start, end)
	{	    
	    return this.tagbox.ForEachItem(this.runtime, start, end);
	}; 
	
 	Cnds.prototype.OnGetTagsListComplete = function ()
	{
	    return true;
	};
	Cnds.prototype.OnGetTagsListError = function ()
	{
	    return true;
	};		

    var CountAscending = function(a, b)
    {                 
        if (a[1] > b[1])
            return 1;
        else if (a[1] == b[1])
            return 0;
        else  // ay < by
            return (-1);
    };
    var CountDescending = function(a, b)
    {                 
        if (a[1] < b[1])
            return 1;
        else if (a[1] == b[1])
            return 0;
        else  // ay < by
            return (-1);
    };
    var NameAscending = function(a, b)
    {                 
        if (a[0] > b[0])
            return 1;
        else if (a[0] == b[0])
            return 0;
        else
            return (-1);
    };
    var NameDescending = function(a, b)
    {                 
        if (a[0] < b[0])
            return 1;
        else if (a[0] == b[0])
            return 0;
        else
            return (-1);
    };        
    var SortFns = [CountAscending, CountDescending, NameAscending, NameDescending];
	Cnds.prototype.ForEachKindOfTagInTagsList = function (m)
	{	    
	    var l = [];
	    for (var n in this.tagsList)	    
	        l.push([n, this.tagsList[n]]);
	    
	    this.exp_TLTagNameCount = l.length;
	    l.sort(SortFns[m]);
	    
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i, cnt=l.length;
		for(i=0; i<cnt; i++)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_TLxx = l[i];
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
    		
		return false;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.PasteTag = function (ownerID, targetID, userTag, category)
	{	
	    this.paste_tag(ownerID, "", targetID, "", userTag, category);
	}; 
 
    Acts.prototype.PasteTagLinkToObject = function (ownerID, ownerKlass, targetID, targetKlass, userTag, category)
	{	
	    this.paste_tag(ownerID, ownerKlass, targetID, targetKlass, userTag, category);
	};     
    Acts.prototype.NewFilter = function ()
	{    
        clean_filters(this.filters);
	};
    
    Acts.prototype.RequestInRange = function (start, lines)
	{
	    var query = this.get_request_query(this.filters);
	    this.tagbox.RequestInRange(query, start, lines);
	};

    Acts.prototype.RequestTurnToPage = function (page_index)
	{
	    var query = this.get_request_query(this.filters);
	    this.tagbox.RequestTurnToPage(query, page_index);
	};	 
    
    Acts.prototype.RequestUpdateCurrentPage = function ()
	{
	    var query = this.get_request_query(this.filters);
	    this.tagbox.RequestUpdateCurrentPage(query);
	};    
    
    Acts.prototype.RequestTurnToNextPage = function ()
	{
	    var query = this.get_request_query(this.filters);	
	    this.tagbox.RequestTurnToNextPage(query);
	};     
    
    Acts.prototype.RequestTurnToPreviousPage = function ()
	{
	    var query = this.get_request_query(this.filters);
	    this.tagbox.RequestTurnToPreviousPage(query);
	};  

    Acts.prototype.AddAllOwners = function ()
	{
        this.filters.owners.length = 0;     
	};
    
    Acts.prototype.AddOwner = function (ownerID)
	{
        this.filters.owners.push(ownerID); 
	};    

    Acts.prototype.AddAllTargets = function ()
	{
        this.filters.targets.length = 0;     
	};
    
    Acts.prototype.AddTarget = function (targetID)
	{
        this.filters.targets.push(targetID); 
	};   
	
    Acts.prototype.AddAllUserTags = function ()
	{
        this.filters.userTags.length = 0;     
	};
    
    Acts.prototype.AddUserTag = function (userTag)
	{
        this.filters.userTags.push(userTag); 
	};    

    Acts.prototype.AddAllCategoies = function ()
	{
        this.filters.categoies.length = 0;     
	};
    
    Acts.prototype.AddCategory = function (category)
	{
        this.filters.categoies.push(category); 
	};	 
	
    Acts.prototype.RemoveQueriedTags = function ()
	{
	    var query = this.get_request_query(this.filters);
	    query["select"]("id");        
	    
	    var start = 0;
	    var lines = 1000;
	    var all_items = [];
	    
        var self = this;             

        // destroy        
	    var on_destroy_success = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnRemoveQueriedTagsComplete, self);
	    };	    
	    var on_destroy_error = function(message, error)
	    { 
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnRemoveQueriedTagsError, self);
	    };	    
	    var destroy_handler = {"success":on_destroy_success, "error": on_destroy_error};
        var delete_all = funtion ()
        {  
            window["Parse"]["Object"]["destroyAll"](all_items, destroy_handler);      
        };        
	    // destroy          
        
	    var on_success = function(items)
	    {
	        all_items.push.apply(all_items, items);
	        var is_last_page = (items.length < lines);   
	        	        
	        if (!is_last_page)  // try next page
	        {
	            start += lines;
	            query_page(start);
	        }
	        else  // finish
	        {
                delete_all();
	        }
	    };	    
	    var on_error = function(error)
	    {  
	        self.runtime.trigger(cr.plugins_.Rex_Parse_tags.prototype.cnds.OnRemoveQueriedTagsError, self); 
	    };
	     
	    var handler = {"success":on_success, "error": on_error};	    	    
	    var query_page = function (start_)
	    {
	        // get 1000 lines for each request until get null or get userID	       
            query["skip"](start_);
            query["limit"](lines);
            query["find"](handler);
        }
        
	    query_page(start);	
	};	
	
    Acts.prototype.GetTagsCount = function ()
	{
	    var query = this.get_request_query(this.filters); 
	    query["select"]("id");
	    
	    var self = this;
	    var on_query_success = function(count)
	    {
	        self.exp_LastTagsCount = count;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_tags.prototype.cnds.OnGetTagsCountComplete, self); 	        
	    };	    
	    var on_query_error = function(error)
	    {      
	        self.exp_LastTagsCount = -1;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_tags.prototype.cnds.OnGetTagsCountError, self); 
	    };
	    var query_handler = {"success":on_query_success, "error": on_query_error};    	     
	    query["count"](query_handler);
	};	
    
    Acts.prototype.RequestTagList = function ()
	{
	    var query = this.get_request_query(this.filters);
	    query["select"]("tag");        
	    
	    var start = 0;
	    var lines = 1000;
	    var all_items = [];
	    
        var self = this;             

        var get_tags = funtion ()
        {        
            clean_table(self.tagsList);                
            var tag, i, cnt=all_items.length;
            for(i=0; i<cnt; i++)
            {
                tag = all_items[i]["get"]("tag");
                if (!self.tagsList.hasOwnProperty(tag))
                    self.tagsList[tag] = 0;

                self.tagsList[tag] ++;
            }
            self.exp_TLTotalTagsCount = cnt;
        };        
        
	    var on_success = function(items)
	    {
	        all_items.push.apply(all_items, items);
	        var is_last_page = (items.length < lines);   
	        	        
	        if (!is_last_page)  // try next page
	        {
	            start += lines;
	            query_page(start);
	        }
	        else  // finish
	        {
                get_tags();  	   
                self.runtime.trigger(cr.plugins_.Rex_Parse_tags.prototype.cnds.OnGetTagsListComplete, self);
	        }
	    };	    
	    var on_error = function(error)
	    { 
	        clean_table(self.tagsList);   
	        self.runtime.trigger(cr.plugins_.Rex_Parse_tags.prototype.cnds.OnGetTagsListError, self);
	    };
	     
	    var handler = {"success":on_success, "error": on_error};	    	    
	    var query_page = function (start_)
	    {
	        // get 1000 lines for each request until get null or get userID	       
            query["skip"](start_);
            query["limit"](lines);
            query["find"](handler);
        }
        
	    query_page(start);	    
	    
	}; 	 		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.CurOwnerID = function (ret)
	{
	    var ownerID;
	    if (this.exp_CurTag)
	        ownerID = this.exp_CurTag["get"]("ownerID");
	        
	    if (!ownerID)
	        ownerID = "";
	    
		ret.set_string( ownerID );
	}; 	    
	Exps.prototype.CurTargetID = function (ret)
	{
	    var targetID;
	    if (this.exp_CurTag)
	        targetID = this.exp_CurTag["get"]("targetID");
	        
	    if (!targetID)
	        targetID = "";
	    
		ret.set_string( targetID );
	}; 	
	Exps.prototype.CurUserTag = function (ret)
	{
	    var userTag;
	    if (this.exp_CurTag)
	        userTag = this.exp_CurTag["get"]("tag");
	        
	    if (!userTag)
	        userTag = "";
	    
		ret.set_string( userTag );
	}; 	
	Exps.prototype.CurCategory = function (ret)
	{
	    var category;
	    if (this.exp_CurTag)
	        category = this.exp_CurTag["get"]("category");
	        
	    if (!userTag)
	        category = "";
	    
		ret.set_string( category );
	};	
	
	Exps.prototype.TLCurTagName = function (ret)
	{
	    var name;
	    if (this.exp_TLxxx)
	        name = this.exp_TLxxx[0];
	    else
	        name = "";
		ret.set_string(name);
	};
	Exps.prototype.TLCurTagsCount = function (ret)
	{
	    var count;
	    if (this.exp_TLxxx)
	        count = this.exp_TLxxx[1];
	    else
	        count = "";
		ret.set_int(count);
	};
	Exps.prototype.TLTagNameCount = function (ret)
	{
		ret.set_int(this.exp_TLTagNameCount);
	};			    
	Exps.prototype.TLTotalTagsCount = function (ret)
	{
		ret.set_int(this.exp_TLTotalTagsCount);
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
	     
	ItemPageKlassProto.request = function(query, start, lines)
	{
        if (start < 0)
            start = 0;
            
        var self = this;
        
	    var on_success = function(items)
	    {
	        self.items = items;
            self.start = start;
            self.page_index = Math.floor(start/self.page_lines);            
	        self.is_last_page = (items.length < lines);         
	        
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
	    
	    var handler = {"success":on_success, "error": on_error};
	    query["skip"](start);
        query["limit"](lines);	    
	    query["find"](handler);	    
	};	
	
    ItemPageKlassProto.load_all = function (query)
	{
	    var start = 0;
	    var lines = 1000;
	    
        var self = this;
        
	    var on_success = function(items)
	    {
	        self.items.push.apply(self.items, items);
	        var is_last_page = (items.length < lines);   
	        	        
	        if (!is_last_page)  // try next page
	        {
	            start += lines;
	            query_page(start);
	        }
	        else  // finish
	        {
	            self.start = 0;	            
	            self.is_last_page = true;
                if (self.onReceived)
                    self.onReceived();	            
	        }
	    };	    
	    var on_error = function(error)
	    { 
	        self.items.length = 0;
	        self.is_last_page = false;
	        	        
            if (self.onReceivedError)
                self.onReceivedError();	 	           
	    };
	     
	    var handler = {"success":on_success, "error": on_error};	    	    
	    var query_page = function (start_)
	    {
	        // get 1000 lines for each request until get null or get userID	       
            query["skip"](start_);
            query["limit"](lines);
            query["find"](handler);
        }

        this.items.length = 0;
	    query_page(start);
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
	    this.load_all(query);
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