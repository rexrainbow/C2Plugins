/*
<messageID>
    senderID - userID of sender
    senderName - name of sender
    receiverID - userID of receiver
    title - title (header) of message
    content - content (body) of message, string or json object in string   
*/


// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_parse_message = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var input_text = "";
	var pluginProto = cr.plugins_.Rex_parse_message.prototype;
		
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

    var MESSAGE_STRING = 0;
    var MESSAGE_JSON = 1;
	instanceProto.onCreate = function()
	{ 
	    if (!this.recycled)
	    {
	        window["Parse"]["initialize"](this.properties[0], this.properties[1]);
	        this.message_klass = window["Parse"].Object["extend"](this.properties[2]);
	    }
	    
        var page_lines = this.properties[3];
	    this.order = (this.properties[4]==0)? "ascending":"descending";     
	    
	    if (!this.recycled)
	        this.messagebox = this.create_messagebox(page_lines);
	    else
	        this.messagebox.Reset();
	       
        this.userID = "";
        this.userName = "";   
        
        if (!this.recycled)     
            this.filters = create_filters();
        else
            clean_filters( this.filters );
        
        this.exp_LastSentMessageID = "";
	    this.exp_CurMessageIndex = -1;
	    this.exp_CurMessage = null;
	    this.exp_LastFetchedMessage = null;   
	    this.exp_LastRemovedMessageID = "";     
	};
	
	instanceProto.create_messagebox = function(page_lines)
	{ 
	    var messagebox = new window.ParseItemPageKlass(page_lines);
	    
	    var self = this;
	    var onReceived = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnReceived, self);
	    }
	    messagebox.onReceived = onReceived;
	    
	    var onGetIterItem = function(item, i)
	    {
            self.exp_CurMessageIndex = i;
            self.exp_CurMessage = item;
	    };	    	    
	    messagebox.onGetIterItem = onGetIterItem;
	    
	    return messagebox;
	};	
    
	var create_filters = function(filters)
	{ 
        var filters = {};   
        filters.senders = [];
        filters.receivers = [];
        filters.tags = [];
        filters.timestamps = [];
        return filters;
	};    
    
	var clean_filters = function(filters)
	{ 
        if (filters.senders.length != 0)
            filters.senders = [];
            
        if (filters.receivers.length != 0)            
            filters.receivers = [];
            
        if (filters.tags.length != 0)                
            filters.tags = [];  
            
        if (filters.timestamps.length != 0)                
            filters.timestamps = []; 
	}; 
	    
    instanceProto.CleanFilter = function (filters)
	{
        if (filters.senders.length != 0)
            filters.senders = [];
            
        if (filters.receivers.length != 0)            
            filters.receivers = [];
            
        if (filters.tags.length != 0)                
            filters.tags = [];  
            
        if (filters.timestamps.length != 0)                
            filters.timestamps = [];                    
	};    
    
    instanceProto.get_request_query = function (filters, fields_type)
	{
        var query = new window["Parse"]["Query"](this.message_klass);
        
        var senders_cnt = filters.senders.length;
        if (senders_cnt == 1)
            query["equalTo"]("senderID", filters.senders[0]);
        else if (senders_cnt > 1)
            query["containedIn"]("senderID", filters.senders);        

        var receivers_cnt = filters.receivers.length;
        if (receivers_cnt == 1)
            query["equalTo"]("receiverID", filters.receivers[0]);
        else if (receivers_cnt > 1)
            query["containedIn"]("receiverID", filters.receivers);

        var tags_cnt = filters.tags.length;
        if (tags_cnt == 1)
            query["equalTo"]("tag", filters.tags[0]);
        else if (tags_cnt > 1)
            query["containedIn"]("tag", filters.tags);

        var timestamps_cnt=filters.timestamps.length, cond;       
        for(var i=0; i<timestamps_cnt;i++)
        {
            cond = filters.timestamps[i];
            query[cond[0]](cond[1], new Date(cond[2]));
        }
        
        query[this.order]("createdAt");
        		
        if (fields_type == 0)
            query["select"]("senderID", "senderName", "receiverID", "title", "tag");      
		else if (fields_type == 1)
		    query["select"]("senderID", "senderName", "receiverID", "title", "tag", "content");
		else if (fields_type == 2)
            query["select"]("id");

        clean_filters(filters); 
        return query;
	}; 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnSendComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnSendError = function ()
	{
	    return true;
	}; 	 
	Cnds.prototype.OnReceived = function ()
	{
	    return true;
	};	
	Cnds.prototype.ForEachMessage = function (start, end)
	{	    
	    return this.messagebox.ForEachItem(this.runtime, start, end);
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
    
    Acts.prototype.SetUserInfo = function (userID, userName)
	{	    
        this.userID = userID;
        this.userName = userName; 
	};    
    
    Acts.prototype.Send = function (receiverID, title_, content_, tag)
	{
        var self = this;
        var OnSendComplete = function(message_obj)
	    { 	        
            self.exp_LastSentMessageID = message_obj["id"];
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnSendComplete, self);
	    };	
	    var OnSendError = function(message_obj, error)
	    {
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnSendError, self);
	    };
        var handler = {"success":OnSendComplete, "error": OnSendError};        
        
        var messageSender = new this.message_klass();
	    messageSender["set"]("senderID", this.userID);
	    messageSender["set"]("senderName", this.userName);
	    messageSender["set"]("receiverID", receiverID);
	    messageSender["set"]("title", title_);
	    messageSender["set"]("content", content_);
	    messageSender["set"]("tag", tag);
        messageSender["save"](null, handler);	
	};  

    Acts.prototype.NewFilter = function ()
	{    
        clean_filters(this.filters);
	};
    
    Acts.prototype.RequestInRange = function (start, lines, with_content)
	{
	    var query = this.get_request_query(this.filters, with_content);
	    this.messagebox.RequestInRange(query, start, lines);
	};

    Acts.prototype.RequestTurnToPage = function (page_index, with_content)
	{
	    var query = this.get_request_query(this.filters, with_content);
	    this.messagebox.RequestTurnToPage(query, page_index);
	};	 
    
    Acts.prototype.RequestUpdateCurrentPage = function (with_content)
	{
	    var query = this.get_request_query(this.filters, with_content);
	    this.messagebox.RequestUpdateCurrentPage(query);
	};    
    
    Acts.prototype.RequestTurnToNextPage = function (with_content)
	{
	    var query = this.get_request_query(this.filters, with_content);	
	    this.messagebox.RequestTurnToNextPage(query);
	};     
    
    Acts.prototype.RequestTurnToPreviousPage = function (with_content)
	{
	    var query = this.get_request_query(this.filters, with_content);
	    this.messagebox.RequestTurnToPreviousPage(query);
	};  

    Acts.prototype.AddAllSenders = function ()
	{
        this.filters.senders.length = 0;     
	};
    
    Acts.prototype.AddSender = function (senderID)
	{
        this.filters.senders.push(senderID); 
	};    
    
    Acts.prototype.AddAllReceivers = function ()
	{
        this.filters.receivers.length = 0; 
	}; 
    
    Acts.prototype.AddReceiver = function (receiverID)
	{
        this.filters.receivers.push(receiverID);
	};    
        
    Acts.prototype.AddAllTags = function ()
	{
        this.filters.tags.length = 0;   
	}; 
    
    Acts.prototype.AddTag = function (tag)
	{
        this.filters.tags.push(tag);      
	};   
	
    Acts.prototype.AddAllTimestamps = function ()
	{
        this.filters.timestamps.length = 0;  
	}; 
    
    var TIMESTAMP_CONDITIONS = [
        ["lessThan", "lessThanOrEqualTo"],           // before, excluded/included
        ["greaterThan", "greaterThanOrEqualTo"],     // after, excluded/included
    ];
    var TIMESTAMP_TYPE = ["createdAt", "updatedAt"];
    Acts.prototype.AddTimeConstraint = function (when_, timestamp, is_included, type_)
	{
	    var query_fn = TIMESTAMP_CONDITIONS[when_][is_included];
	    var compared_type = TIMESTAMP_TYPE[type_];
        this.filters.timestamps.push([query_fn, compared_type, timestamp]);
	}; 	
    
    Acts.prototype.FetchByMessageID = function (messageID)
	{
        var self = this;
        
	    var on_success = function(message)
	    {
	        self.exp_LastFetchedMessage = message;
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnFetchOneComplete, self);
	    };	    
	    var on_error = function(message, error)
	    { 
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnFetchOneError, self);     
	    };
	    
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var query = new window["Parse"]["Query"](this.message_klass);        
        query["get"](messageID, handler);
	}; 	
	
    Acts.prototype.RemoveByMessageID = function (messageID)
	{
        var self = this;
        
	    var on_success = function(message)
	    {
	        self.exp_LastRemovedMessageID = messageID;
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnRemoveComplete, self);
	    };	    
	    var on_error = function(message, error)
	    { 
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnRemoveError, self);     
	    };	    
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var messageRemover = new this.message_klass();
	    messageRemover["set"]("id", messageID);
	    messageRemover["destroy"](handler);
	}; 	
	
    Acts.prototype.RemoveQueriedMessages = function ()
	{
	    var query = this.get_request_query(this.filters, 2);
	    query["limit"](1000);
        
        var self = this;
        // destroy        
	    var on_destroy_success = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnRemoveQueriedItemsComplete, self);
	    };	    
	    var on_destroy_error = function(message, error)
	    { 
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnRemoveQueriedItemsError, self);
	    };	    
	    var destroy_handler = {"success":on_destroy_success, "error": on_destroy_error};
	    // destroy     
        
        // read
        // step 2. destroy each item
        var target_items = [];        
        var skip_cnt = 0;
	    var on_query_success = function(items)
	    {
            var cnt = items.length;
	        if (cnt == 0)
                window["Parse"]["Object"]["destroyAll"](target_items, destroy_handler);
	        else
            {
                target_items.push.apply(target_items, items);
                skip_cnt += cnt;
                query["skip"](skip_cnt);
                query["find"](query_handler);
            }
	    };	    
	    var on_query_error = function(error)
	    {      
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnRemoveQueriedItemsError, self); 
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
	
	Exps.prototype.MyUserID = function (ret)
	{
		ret.set_string(this.userID);
	};
	
	Exps.prototype.MyUserName = function (ret)
	{
		ret.set_string(this.userName);
	};    
	
	Exps.prototype.LastSentMessageID = function (ret)
	{
		ret.set_string(this.exp_LastSentMessageID);
	};    
    
	Exps.prototype.CurSenderID = function (ret)
	{
	    if (this.exp_CurMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.exp_CurMessage["get"]("senderID"));
	};
	Exps.prototype.CurSenderName = function (ret)
	{
	    if (this.exp_CurMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.exp_CurMessage["get"]("senderName"));
	};    
	Exps.prototype.CurReceiverID = function (ret)
	{
	    if (this.exp_CurMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.exp_CurMessage["get"]("receiverID"));
	}; 
	Exps.prototype.CurTitle = function (ret)
	{
	    if (this.exp_CurMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.exp_CurMessage["get"]("title"));
	};
	Exps.prototype.CurContent = function (ret)
	{
	    if (this.exp_CurMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
		ret.set_string(this.exp_CurMessage["get"]("content") || "");
	};
    
	Exps.prototype.CurMessageID = function (ret)
	{
	    if (this.exp_CurMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
		ret.set_string(this.exp_CurMessage["id"]);
	};
    
	Exps.prototype.CurSentAt = function (ret)
	{
	    if (this.exp_CurMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
		ret.set_float(this.exp_CurMessage["createdAt"].getTime());
	};
    
	Exps.prototype.CurMessageIndex = function (ret)
	{
		ret.set_int(this.exp_CurMessageIndex);
	};
    
	Exps.prototype.MessagesToJSON = function (ret)
	{	    
		ret.set_string( JSON.stringify(this.messagebox.items) );
	};
		
	Exps.prototype.LastFetchedSenderID = function (ret)
	{
	    if (this.exp_LastFetchedMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.exp_LastFetchedMessage["get"]("senderID"));
	};
	Exps.prototype.LastFetchedSenderName = function (ret)
	{
	    if (this.exp_LastFetchedMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.exp_LastFetchedMessage["get"]("senderName"));
	};    
	Exps.prototype.LastFetchedReceiverID = function (ret)
	{
	    if (this.exp_LastFetchedMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.exp_LastFetchedMessage["get"]("receiverID"));
	}; 
	Exps.prototype.LastFetchedTitle = function (ret)
	{
	    if (this.exp_LastFetchedMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.exp_LastFetchedMessage["get"]("title"));
	};
	Exps.prototype.LastFetchedContent = function (ret)
	{
	    if (this.exp_LastFetchedMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
		ret.set_string(this.exp_LastFetchedMessage["get"]("content") || "");
	};
    
	Exps.prototype.LastFetchedMessageID = function (ret)
	{
	    if (this.exp_LastFetchedMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
		ret.set_string(this.exp_LastFetchedMessage["id"]);
	};
    
	Exps.prototype.LastFetchedSentAt = function (ret)
	{
	    if (this.exp_LastFetchedMessage == null)
	    {
	        ret.set_string("");
	        return;
	    }
		ret.set_float(this.exp_LastFetchedMessage["createdAt"].getTime());
	};
    
	Exps.prototype.LastRemovedMessageID = function (ret)
	{
		ret.set_float(this.exp_LastRemovedMessageID);
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
	
	ItemPageKlassProto.GetCurrentPageIndex = function ()
	{
	    return this.page_index;
	};	

	window.ParseItemPageKlass = ItemPageKlass;
}());         