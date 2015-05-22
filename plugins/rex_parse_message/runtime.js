/*
<messageID>
    senderID - userID of sender
    senderName - name of sender
    receiverID - userID of receiver
    title - title (header) of message
    content - content (body) of message, string or json object in string 
    Category - category of message, like "system"
    Status - status of message, like "unread"
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

    var MESSAGE_STRING = 0;
    var MESSAGE_JSON = 1;
	instanceProto.onCreate = function()
	{ 
	    if (!window.RexC2IsParseInit)
	    {
	        window["Parse"]["initialize"](this.properties[0], this.properties[1]);
	        window.RexC2IsParseInit = true;
	    }
	    	    
	    if (!this.recycled)
	    {
	        this.message_klass = window["Parse"].Object["extend"](this.properties[2]);
	    }
	    
        var page_lines = this.properties[3];
	    this.order = (this.properties[4]==0)? "ascending":"descending"; 
	    this.acl_mode = this.properties[5];
	    this.sender_class = this.properties[6];
	    this.receiver_class = this.properties[7];        
	    
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
        
        this.exp_LoopIndex = -1;
        this.exp_LastSentMessageID = "";
	    this.exp_CurMessageIndex = -1;
	    this.exp_CurMessage = null;
	    this.exp_LastFetchedMessage = null;   
	    this.exp_LastRemovedMessageID = "";  
	    this.exp_LastMessagesCount = -1;   
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
	    
	    var onReceivedError = function()
	    {	       
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnReceivedError, self);
	    }
	    messagebox.onReceivedError = onReceivedError;		    
	    
	    var onGetIterItem = function(item, i)
	    {
            self.exp_CurMessageIndex = i;
            self.exp_CurMessage = item;
            self.exp_LoopIndex = i - messagebox.GetStartIndex();
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
        filters.status = [];
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
            
        if (filters.status.length != 0)                
            filters.status = [];             
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

        var status_cnt = filters.status.length;
        if (status_cnt == 1)
            query["equalTo"]("status", filters.status[0]);
        else if (status_cnt > 1)
            query["containedIn"]("status", filters.status);
            
        query[this.order]("createdAt");
        		
        if (fields_type == 0)
            query["select"]("senderID", "senderName", "receiverID", "title", "tag","status");      
		else if (fields_type == 1)
		    query["select"]("senderID", "senderName", "receiverID", "title", "tag","status","content");

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
	Cnds.prototype.OnReceivedError = function ()
	{
	    return true;
	};		
	Cnds.prototype.OnSetStatusComplete = function ()
	{
	    return true;
	};
	Cnds.prototype.OnSetStatusError = function ()
	{
	    return true;
	};	    
    
	Cnds.prototype.ForEachMessage = function (start, end)
	{	    
	    return this.messagebox.ForEachItem(this.runtime, start, end);
	};   
    
	Cnds.prototype.IsTheLastPage = function ()
	{	    
	    return this.messagebox.IsTheLastPage();
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
	
	Cnds.prototype.OnRemoveQueriedMessagesComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnRemoveQueriedMessagesError = function ()
	{
	    return true;
	};	
	
	Cnds.prototype.OnGetMessagesCountComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnGetMessagesCountError = function ()
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
    
    Acts.prototype.Send = function (receiverID, title_, content_, tag, status)
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
        
        var messageObj = new this.message_klass();
	    messageObj["set"]("senderID", this.userID);
	    messageObj["set"]("senderName", this.userName);
	    messageObj["set"]("receiverID", receiverID);
	    messageObj["set"]("title", title_);
	    messageObj["set"]("content", content_);
	    messageObj["set"]("tag", tag);
        messageObj["set"]("status", status);
	    
	    if (this.acl_mode === 1)  // private
	    {
	        var current_user = window["Parse"]["User"]["current"]();
	        if (current_user)
	        {
	            var acl = new window["Parse"]["ACL"](current_user);
	            acl["setPublicReadAccess"](true);
	            messageObj["setACL"](acl);
	        }	        
	    };
        
	    if (self.sender_class !== "")
	    {
	        var t = window["Parse"].Object["extend"](self.sender_class);
	        var o = new t();
	        o["id"] = self.userID;
	        messageObj["set"]("senderObject", o);
	    }        
        
	    if (self.receiver_class !== "")
	    {
	        var t = window["Parse"].Object["extend"](self.receiver_class);
	        var o = new t();
	        o["id"] = receiverID;
	        messageObj["set"]("receiverObject", o);
	    }
        
        messageObj["save"](null, handler);	
	};  
    
    Acts.prototype.SetStatus = function (messageID, status)
	{
        var self = this;
        
	    var on_success = function(message)
	    {
            self.exp_LastSentMessageID = message_obj["id"];
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnSetStatusComplete, self);
	    };	    
	    var on_error = function(message, error)
	    { 
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnSetStatusError, self);     
	    };
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var messageObj = new this.message_klass();
	    messageObj["set"]("id", messageID);
        messageObj["set"]("status", status);
	    messageObj["save"](null, handler);	
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

    Acts.prototype.AddAllStatus = function ()
	{
        this.filters.status.length = 0;   
	}; 
    
    Acts.prototype.AddStatus = function (status)
	{
        this.filters.status.push(status);      
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
	    var query = this.get_request_query(this.filters);
	    query["select"]("id");        
	    
	    var start = 0;
	    var lines = 1000;
	    var all_items = [];
	    
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
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnRemoveQueriedItemsError, self); 
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
	
    Acts.prototype.GetMessagesCount = function ()
	{
	    var query = this.get_request_query(this.filters); 
	    query["select"]("id");
	    
	    var self = this;
	    var on_query_success = function(count)
	    {
	        self.exp_LastMessagesCount = count;
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnGetMessagesCountComplete, self); 	        
	    };	    
	    var on_query_error = function(error)
	    {      
	        self.exp_LastMessagesCount = -1;
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnGetMessagesCountError, self); 
	    };
	    var query_handler = {"success":on_query_success, "error": on_query_error};    	     
	    query["count"](query_handler);
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
        var senderID;
        if (this.exp_CurMessage == null)
            senderID = "";
        else
            senderID = this.exp_CurMessage["get"]("senderID") || "";
		ret.set_string(senderID);
	};
	Exps.prototype.CurSenderName = function (ret)
	{
        var senderName;
        if (this.exp_CurMessage == null)
            senderName = "";
        else
            senderName = this.exp_CurMessage["get"]("senderName") || "";
		ret.set_string(senderName);  
	};    
	Exps.prototype.CurReceiverID = function (ret)
	{
        var receiverID;
        if (this.exp_CurMessage == null)
            receiverID = "";
        else
            receiverID = this.exp_CurMessage["get"]("receiverID") || "";
		ret.set_string(receiverID); 
	}; 
	Exps.prototype.CurTitle = function (ret)
	{
        var title;
        if (this.exp_CurMessage == null)
            title = "";
        else
            title = this.exp_CurMessage["get"]("title");
		ret.set_string(title);
	};
	Exps.prototype.CurContent = function (ret)
	{
        var content;
        if (this.exp_CurMessage == null)
            content = "";
        else
            content = this.exp_CurMessage["get"]("content") || "";
		ret.set_string(content);
	};
    
	Exps.prototype.CurMessageID = function (ret)
	{
        var id;
        if (this.exp_CurMessage == null)
            id = "";
        else
            id = this.exp_CurMessage["id"];
		ret.set_string(id);
	};
    
	Exps.prototype.CurSentAt = function (ret)
	{
        var createdAt;
        if (this.exp_CurMessage == null)
            createdAt = 0;
        else
            createdAt = this.exp_CurMessage["createdAt"].getTime() || 0;
		ret.set_float(createdAt);
	};
    
	Exps.prototype.CurMessageIndex = function (ret)
	{
		ret.set_int(this.exp_CurMessageIndex);
	};
    
	Exps.prototype.MessagesToJSON = function (ret)
	{	    
		ret.set_string( JSON.stringify(this.messagebox.GetItems()) );
	};
    
	Exps.prototype.CurStatus = function (ret)
	{	    
        var status;
        if (this.exp_CurMessage == null)
            status = "";
        else
            status = this.exp_CurMessage["get"]("status") || "";
		ret.set_string(status);
	};	
	
    
	Exps.prototype.CurMessageCount = function (ret)
	{
		ret.set_int(this.messagebox.GetItems().length);
	};
    
	Exps.prototype.CurStartIndex = function (ret)
	{
		ret.set_int(this.messagebox.GetStartIndex());
	};	
    
	Exps.prototype.LoopIndex = function (ret)
	{
		ret.set_int(this.exp_LoopIndex);
	};		
	    
	Exps.prototype.LastFetchedSenderID = function (ret)
	{
        var senderID;        
	    if (this.exp_LastFetchedMessage == null)
	        senderID = "";
        else
            senderID = this.exp_LastFetchedMessage["get"]("senderID") || "";	    
		ret.set_string(senderID);
	};
	Exps.prototype.LastFetchedSenderName = function (ret)
	{
        var senderName;        
	    if (this.exp_LastFetchedMessage == null)
	        senderName = "";
        else
            senderName = this.exp_LastFetchedMessage["get"]("senderName") || "";	    
		ret.set_string(senderName);
	};    
	Exps.prototype.LastFetchedReceiverID = function (ret)
	{
        var receiverID;        
	    if (this.exp_LastFetchedMessage == null)
	        receiverID = "";
        else
            receiverID = this.exp_LastFetchedMessage["get"]("receiverID") || "";	    
		ret.set_string(receiverID);    
	}; 
	Exps.prototype.LastFetchedTitle = function (ret)
	{
        var title;        
	    if (this.exp_LastFetchedMessage == null)
	        title = "";
        else
            title = this.exp_LastFetchedMessage["get"]("title") || "";	    
		ret.set_string(title); 
	};
	Exps.prototype.LastFetchedContent = function (ret)
	{
        var content;        
	    if (this.exp_LastFetchedMessage == null)
	        content = "";
        else
            content = this.exp_LastFetchedMessage["get"]("content") || "";	    
		ret.set_string(content);     
	};
    
	Exps.prototype.LastFetchedMessageID = function (ret)
	{
        var id;        
	    if (this.exp_LastFetchedMessage == null)
	        id = "";
        else
            id = this.exp_LastFetchedMessage["id"] || "";	    
		ret.set_string(id);
	};
    
	Exps.prototype.LastFetchedSentAt = function (ret)
	{
        var createdAt;        
	    if (this.exp_LastFetchedMessage == null)
	        createdAt = 0;
        else
            createdAt = this.exp_LastFetchedMessage["createdAt"].getTime() || 0;	    
		ret.set_string(createdAt); 
	};
    
	Exps.prototype.LastFetchedStatus = function (ret)
	{
        var status;        
	    if (this.exp_LastFetchedMessage == null)
	        status = "";
        else
            status = this.exp_LastFetchedMessage["get"]("status") || "";	    
		ret.set_string(status);     
	};    
    
	Exps.prototype.LastRemovedMessageID = function (ret)
	{
		ret.set_string(this.exp_LastRemovedMessageID);
	};	
    
	Exps.prototype.LastMessagesCount = function (ret)
	{
		ret.set_int(this.exp_LastMessagesCount);
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
	     
    ItemPageKlassProto.request = function (query, start, lines)
	{
	    if (start==null)
	        start = 0;
	    var is_onePage = (lines != null) && (lines <= 1000);
	    var linesInPage = (is_onePage)? lines:1000;
	                                       	    
        var self = this;       
	    var on_success = function(items)
	    {
	        self.items.push.apply(self.items, items);        
	        var is_last_page = (items.length < linesInPage);   

	        if ((!is_onePage) && (!is_last_page))  // try next page
	        {
	            start += linesInPage;
	            query_page(start);
	        }
	        else  // finish
	        {
                self.start = start;
                self.page_index = Math.floor(start/self.page_lines); 
                             
                self.is_last_page = is_last_page;
	            
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
            query["limit"](linesInPage);
            query["find"](handler);
        };

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