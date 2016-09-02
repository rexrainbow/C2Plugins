/*
<messageID>
    senderID - userID of sender
    senderName - name of sender
    receiverID - userID of receiver
    title - title (header) of message
    content - content (body) of message, string or json object in string 
    tag - category of message, like "system"
    status - status of message, like "unread"    
    mark - array of some unique data, like userID
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
	        this.message_klass = window["Parse"].Object["extend"](this.properties[0]);
	    }
	    
        var page_lines = this.properties[1];
	    this.order = (this.properties[2]==0)? "ascending":"descending"; 
        this.acl_write_mode = this.properties[3];
        this.acl_read_mode = this.properties[4];
	    this.sender_class = this.properties[5];
	    this.receiver_class = this.properties[6];        
	    
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
	    this.last_error = null;   
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
	    
	    var onReceivedError = function(error)
	    {	       
	        self.last_error = error; 
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
        filters.marks = [];        
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
            
        if (filters.marks.length != 0)                
            filters.marks = [];              
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
            
        var marks_cnt=filters.marks.length, cond;       
        for(var i=0; i<marks_cnt;i++)
        {
            cond = filters.marks[i];
            query[cond[0]]("mark", cond[1]);
        }
                    
            
        query[this.order]("createdAt");
        		
        if (fields_type == 0)
            query["select"]("senderID", "senderName", "receiverID", "title", "tag","status");      
		else if (fields_type == 1)
		    query["select"]("senderID", "senderName", "receiverID", "title", "tag","status","content");

        clean_filters(filters); 
        return query;
	}; 

    // wm: All users|Sender|Receiver|Sender and receiver|Owner
    // rm: All users|Sender|Receiver|Sender and receiver
	var get_ACL = function (wm, rm, senderID, receiverID)
	{
	    // wm: All users, rm: All users
	    if ((wm === 0) && (rm === 0))
	        return null;
	    
	    var acl = new window["Parse"]["ACL"]();
	    switch (wm)
	    {
	    case 0:
	        acl["setPublicWriteAccess"](true);
	    break;
	   
	    case 1: 
	        acl["setWriteAccess"](senderID, true); 
	    break;
	    
	    case 2:
	        acl["setWriteAccess"](receiverID, true); 
	    break;
	    
	    case 3: 
	        acl["setWriteAccess"](senderID, true);
	        acl["setWriteAccess"](receiverID, true);
	    break;
	    
	    case 4: 
	        var current_user = window["Parse"]["User"]["current"]();
	        acl["setWriteAccess"](current_user["id"], true); 
	    break;
	    }
	    
	    
	    switch (rm)
	    {
	    case 0:
	        acl["setPublicReadAccess"](true);
	    break;
	   
	    case 1: 
	        acl["setReadAccess"](senderID, true); 
	    break;
	    
	    case 2: 
	        acl["setReadAccess"](receiverID, true); 
	    break;
	    
	    case 3: 
	        acl["setReadAccess"](senderID, true);
	        acl["setReadAccess"](receiverID, true);
	    break;
	    }

        return acl;	    
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
	Cnds.prototype.OnUpdateMarkComplete = function ()
	{
	    return true;
	};
	Cnds.prototype.OnUpdateMarkError = function ()
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
	        self.last_error = error; 
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
        
        var acl = get_ACL(this.acl_write_mode, this.acl_read_mode, this.userID, receiverID);
        if (acl)
        {
            messageObj["setACL"](acl);
        }
        
	    if (this.sender_class !== "")
	    {
	        var t = window["Parse"].Object["extend"](this.sender_class);
	        var o = new t();
	        o["id"] = this.userID;
	        messageObj["set"]("senderObject", o);
	    }        
        
	    if (this.receiver_class !== "")
	    {
	        var t = window["Parse"].Object["extend"](this.receiver_class);
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
	        self.last_error = error; 
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnSetStatusError, self);     
	    };
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var messageObj = new this.message_klass();
	    messageObj["set"]("id", messageID);
        messageObj["set"]("status", status);
	    messageObj["save"](null, handler);	
	};
    
    Acts.prototype.AppendMark = function (messageID, mark)
	{
        var self = this;
        
	    var on_success = function(message_obj)
	    {
            self.exp_LastSentMessageID = message_obj["id"];
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnUpdateMarkComplete, self);
	    };	    
	    var on_error = function(message_obj, error)
	    { 
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnUpdateMarkError, self);     
	    };
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var messageObj = new this.message_klass();
	    messageObj["set"]("id", messageID);
        messageObj["addUnique"]("mark", mark);
	    messageObj["save"](null, handler);	
	};
	
    Acts.prototype.RemoveMark = function (messageID, mark)
	{
        var self = this;
        
	    var on_success = function(message_obj)
	    {
            self.exp_LastSentMessageID = message_obj["id"];
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnUpdateMarkComplete, self);
	    };	    
	    var on_error = function(message_obj, error)
	    { 
	        self.last_error = error; 
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnUpdateMarkError, self);     
	    };
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var messageObj = new this.message_klass();
	    messageObj["set"]("id", messageID);
        messageObj["remove"]("mark", mark);
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
	
    Acts.prototype.LoadAllMessages = function (with_content)
	{
	    var query = this.get_request_query(this.filters, with_content);
	    this.messagebox.LoadAllItems(query);
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
	
    var MARK_CONDITIONS = ["notEqualTo", "equalTo"];
    Acts.prototype.SetMarkConstraint = function (mark, is_included)
	{
	    this.filters.marks.length = 0;
	    
	    var query_fn = MARK_CONDITIONS[is_included];
        this.filters.marks.push([query_fn, mark]);
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
	        self.last_error = error; 
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
	        self.last_error = error; 
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnRemoveError, self);     
	    };	    
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var messageRemover = new this.message_klass();
	    messageRemover["set"]("id", messageID);
	    messageRemover["destroy"](handler);
	}; 	
	
    Acts.prototype.RemoveQueriedMessages = function ()
	{
	    var all_itemID_query = this.get_request_query(this.filters);

        var self = this; 
	    var on_destroy_success = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnRemoveQueriedItemsComplete, self);
	    };	    
	    var on_destroy_error = function(error)
	    { 
	        self.last_error = error; 
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnRemoveQueriedItemsError, self);
	    };	    
	    var on_destroy_handler = {"success":on_destroy_success, "error": on_destroy_error};
	    window.ParseRemoveAllItems(all_itemID_query, on_destroy_handler);	    
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
	        self.last_error = error; 
	        self.runtime.trigger(cr.plugins_.Rex_parse_message.prototype.cnds.OnGetMessagesCountError, self); 
	    };
	    var query_handler = {"success":on_query_success, "error": on_query_error};    	     
	    query["count"](query_handler);
	};	

	
    Acts.prototype.InitialTable = function ()
	{        
        var messageObj = new this.message_klass();
	    messageObj["set"]("senderID", "");
	    messageObj["set"]("receiverID", "");
	    messageObj["set"]("tag", "");
        messageObj["set"]("status", "");
        messageObj["set"]("mark", []);
        window.ParseInitTable(messageObj);
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
		ret.set_string( get_itemValue(this.exp_CurMessage, "senderID", "") );
	};
	Exps.prototype.CurSenderName = function (ret)
	{
		ret.set_string( get_itemValue(this.exp_CurMessage, "senderName", "") );        
	};    
	Exps.prototype.CurReceiverID = function (ret)
	{
        ret.set_string( get_itemValue(this.exp_CurMessage, "receiverID", "") );                
	}; 
	Exps.prototype.CurTitle = function (ret)
	{
        ret.set_string( get_itemValue(this.exp_CurMessage, "title", "") );          
	};
	Exps.prototype.CurContent = function (ret)
	{
        ret.set_string( get_itemValue(this.exp_CurMessage, "content", "") );          
	};
    
	Exps.prototype.CurMessageID = function (ret)
	{
        ret.set_string( get_itemValue(this.exp_CurMessage, "id", "") );        
	};
    
	Exps.prototype.CurSentAt = function (ret)
	{
        ret.set_float( get_itemValue(this.exp_CurMessage, "createdAt", 0) );        
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
        ret.set_string( get_itemValue(this.exp_CurMessage, "status", "") );          
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
        ret.set_string( get_itemValue(this.exp_LastFetchedMessage, "senderID", "") );          
	};
	Exps.prototype.LastFetchedSenderName = function (ret)
	{
        ret.set_string( get_itemValue(this.exp_LastFetchedMessage, "senderName", "") );            
	};    
	Exps.prototype.LastFetchedReceiverID = function (ret)
	{
        ret.set_string( get_itemValue(this.exp_LastFetchedMessage, "receiverID", "") );         
	}; 
	Exps.prototype.LastFetchedTitle = function (ret)
	{
        ret.set_string( get_itemValue(this.exp_LastFetchedMessage, "title", "") );        
	};
	Exps.prototype.LastFetchedContent = function (ret)
	{
        ret.set_string( get_itemValue(this.exp_LastFetchedMessage, "content", "") );         
	};
    
	Exps.prototype.LastFetchedMessageID = function (ret)
	{
        ret.set_string( get_itemValue(this.exp_LastFetchedMessage, "id", "") );          
	};
    
	Exps.prototype.LastFetchedSentAt = function (ret)
	{
        ret.set_float( get_itemValue(this.exp_LastFetchedMessage, "createdAt", 0) );             
	};
    
	Exps.prototype.LastFetchedStatus = function (ret)
	{
        ret.set_string( get_itemValue(this.exp_LastFetchedMessage, "status", "") );           
	};    
    
	Exps.prototype.LastRemovedMessageID = function (ret)
	{
		ret.set_string(this.exp_LastRemovedMessageID);
	};	
    
	Exps.prototype.LastMessagesCount = function (ret)
	{
		ret.set_int(this.exp_LastMessagesCount);
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