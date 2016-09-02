/*
<itemID>
    sender - userID, or userData (Linked)
    receiver - userID, or userData (Linked)
    title - title (header) of message
    
    // optional fields
    content - content (body) of message, string or json object in string     
    category - category of message, like "system"
    status - status of message, like "unread"        

    //mark - array of some unique data, like userID
*/


// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Backendless_message = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Backendless_message.prototype;
		
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
        this.messageKlass = window.BackendlessGetKlass(this.properties[0]);     
        this.messageStorage = window["Backendless"]["Persistence"]["of"](this.messageKlass);
        	    
        var page_lines = this.properties[1];
	    this.order = (this.properties[2]==0)? "":" desc"; 

	    this.LinkSenderToTable = (this.properties[3] !== "");          
        if (this.LinkSenderToTable)
            this.senderKlass = window.BackendlessGetKlass(this.properties[3]);
        
	    this.LinkReceiverToTable = (this.properties[4] !== "");     
        if (this.LinkReceiverToTable)        
            this.receiverKlass = window.BackendlessGetKlass(this.properties[4]);
	    
	    if (!this.recycled)
        {
	        this.messagebox = this.create_messagebox(page_lines);
            this.filters = create_filters();            
        }
	    else
            this.onDestroy();
	       
        this.userID = "";                 
        this.exp_LoopIndex = -1;
        this.exp_LastSentMessageID = "";
	    this.exp_CurMessageIndex = -1;
	    this.exp_CurMessage = null;
	    this.exp_LastFetchedMessage = null;   
	    this.exp_LastRemovedMessageID = "";  
	    this.exp_LastMessagesCount = -1;
	    this.last_error = null;   
	};
    
	instanceProto.onDestroy = function ()
	{
	    this.messagebox.Reset();        
        clean_filters( this.filters );
        this.exp_LastFetchedMessage = null;  
	    this.last_error = null;           
	};      
	
	instanceProto.create_messagebox = function(page_lines)
	{ 
	    var messagebox = new window.BackendlessItemPageKlass(page_lines);
	    
        messagebox.storage = this.messageStorage;	    
	    var self = this;
	    var onReceived = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnReceived, self);
	    }
	    messagebox.onReceived = onReceived;
	    
	    var onReceivedError = function(error)
	    {	       
	        self.last_error = error; 
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnReceivedError, self);
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

	instanceProto.getSenderIDKey = function()
	{ 
        return (this.LinkSenderToTable)? "sender.objectId":"sender";
    };
	instanceProto.getReceiverIDKey = function()
	{ 
        return (this.LinkSenderToTable)? "receiver.objectId":"receiver";
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
	
    instanceProto.build_filter = function (filters, fields_type)
    {        
        filters.orders.length = 0;    
        filters.orders.push("created" + this.order);
        
        filters.fields.length = 0;
        filters.linkedObjs.length = 0;        
        if (fields_type == 0)
        {
            filters.fields.push("objectId");        
            filters.fields.push("created");  
            filters.fields.push("updated");  

            if (this.LinkSenderToTable)        
                filters.linkedObjs.push("sender");
            else
                filters.fields.push("sender");
            
            if (this.LinkReceiverToTable)
                filters.linkedObjs.push("receiver");
            else
                filters.fields.push("receiver");
            
            filters.fields.push("title");
            filters.fields.push("category");  
            filters.fields.push("status");             
        }
        
        return filters;
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

    instanceProto.CleanFilter = function (k)
	{      
        get_filter(this.filters.filters, k).length = 0;
	};
    
    instanceProto.AddValueInclude = function (k, v)
	{
        var cond = k + "=" + reverEval(v);
        get_filter(this.filters.filters, k).push(["OR", cond]);
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
    
    Acts.prototype.SetUserInfo = function (userID)
	{	    
        this.userID = userID;
	};    
    
    Acts.prototype.Send = function (receiverID, title, content, category, status)
	{
        var self = this;
        var OnSendComplete = function(messageObj)
	    { 	        
            self.exp_LastSentMessageID = messageObj["objectId"];
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnSendComplete, self);
	    };	
	    var OnSendError = function(error)
	    {
	        self.last_error = error;          
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnSendError, self);
	    };

        var messageObj = new this.messageKlass();
        
        if (this.LinkSenderToTable)
        {
            var sender = new this.senderKlass();   
            sender["objectId"] = this.userID; 
            messageObj["sender"] = sender;            
        }
        else
	        messageObj["sender"]= this.userID;
        
        if (this.LinkReceiverToTable)
        {
            var receiver = new this.receiverKlass();   
            receiver["objectId"] = receiverID;             
            messageObj["receiver"] = receiver;
        }
        else        
	        messageObj["receiver"] = receiverID;       
        
	    messageObj["title"] = title;
        
        if (content !== "")
	        messageObj["content"] = content;
        
        if (category !== "")
            messageObj["category"] = category;
        
        if (status !== "")
            messageObj["status"] = status;
        
        var handler = new window["Backendless"]["Async"]( OnSendComplete, OnSendError );	
        this.messageStorage["save"](messageObj, handler);
	};  
    
    Acts.prototype.SetStatus = function (messageID, status)
	{
        var self = this;
        
	    var on_success = function(message)
	    {
            self.exp_LastSentMessageID = messageObj["id"];
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnSetStatusComplete, self);
	    };	    
	    var on_error = function(message, error)
	    { 
	        self.last_error = error; 
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnSetStatusError, self);     
	    };
   
        var messageObj = new this.messageKlass();
	    messageObj["objectId"] = messageID;
        messageObj["status"] = status;
        
        var handler = new window["Backendless"]["Async"]( on_success, on_error );	
        this.messageStorage["save"](messageObj, handler);
	};
    
    Acts.prototype.AppendMark = function (messageID, mark)
	{
        var self = this;
        
	    var on_success = function(messageObj)
	    {
            self.exp_LastSentMessageID = messageObj["id"];
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnUpdateMarkComplete, self);
	    };	    
	    var on_error = function(messageObj, error)
	    { 
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnUpdateMarkError, self);     
	    };
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var messageObj = new this.messageKlass();
	    messageObj["set"]("id", messageID);
        messageObj["addUnique"]("mark", mark);
	    messageObj["save"](null, handler);	
	};
	
    Acts.prototype.RemoveMark = function (messageID, mark)
	{
        var self = this;
        
	    var on_success = function(messageObj)
	    {
            self.exp_LastSentMessageID = messageObj["id"];
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnUpdateMarkComplete, self);
	    };	    
	    var on_error = function(messageObj, error)
	    { 
	        self.last_error = error; 
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnUpdateMarkError, self);     
	    };
	    var handler = {"success":on_success, "error": on_error};
	    	    
        var messageObj = new this.messageKlass();
	    messageObj["set"]("id", messageID);
        messageObj["remove"]("mark", mark);
	    messageObj["save"](null, handler);	
	};
    
    Acts.prototype.SetStatusByIndex = function (messageID, status)
	{
        var itemID = this.Index2QueriedItemID(index, null);
        if (itemID === null)
            return;
        
        Acts.prototype.SetStatus.call(this, itemID);
	};    
	
    Acts.prototype.NewFilter = function ()
	{    
        this.filters = create_filters();
	};
    
    Acts.prototype.RequestInRange = function (start, lines, with_content)
	{    
        var filters = this.build_filter(this.filters, with_content);
	    var query = this.get_request_query(filters);
	    this.messagebox.RequestInRange(query, start, lines);
	};

    Acts.prototype.RequestTurnToPage = function (page_index, with_content)
	{
        var filters = this.build_filter(this.filters, with_content);
	    var query = this.get_request_query(filters);
	    this.messagebox.RequestTurnToPage(query, page_index);
	};	 
    
    Acts.prototype.RequestUpdateCurrentPage = function (with_content)
	{
        var filters = this.build_filter(this.filters, with_content);
	    var query = this.get_request_query(filters);
	    this.messagebox.RequestUpdateCurrentPage(query);
	};    
    
    Acts.prototype.RequestTurnToNextPage = function (with_content)
	{
        var filters = this.build_filter(this.filters, with_content);
	    var query = this.get_request_query(filters);
	    this.messagebox.RequestTurnToNextPage(query);
	};     
    
    Acts.prototype.RequestTurnToPreviousPage = function (with_content)
	{
        var filters = this.build_filter(this.filters, with_content);
	    var query = this.get_request_query(filters);
	    this.messagebox.RequestTurnToPreviousPage(query);
	};  
	
    Acts.prototype.LoadAllMessages = function (with_content)
	{
        var filters = this.build_filter(this.filters, with_content);
	    var query = this.get_request_query(filters);
	    this.messagebox.LoadAllItems(query);
	}; 

    Acts.prototype.AddAllSenders = function ()
	{
        this.CleanFilter(this.getSenderIDKey());    
	};
    
    Acts.prototype.AddSender = function (senderID)
	{     
        this.AddValueInclude(this.getSenderIDKey(), senderID);
	};    
    
    Acts.prototype.AddAllReceivers = function ()
	{
        this.CleanFilter(this.getReceiverIDKey());
	}; 
    
    Acts.prototype.AddReceiver = function (receiverID)
	{  
        this.AddValueInclude(this.getReceiverIDKey(), receiverID);
	};    
        
    Acts.prototype.AddAllTags = function ()
	{
        this.CleanFilter("category");    
	}; 
    
    Acts.prototype.AddTag = function (category)
	{
        this.AddValueInclude("category", category); 
	};   
	
    Acts.prototype.AddAllTimestamps = function ()
	{
        this.CleanFilter("updated");        
	}; 
    
    var TIMESTAMP_CONDITIONS = [
        ["<", "<="],           // before, excluded/included
        [">", ">="],     // after, excluded/included
    ];
    var TIMESTAMP_TYPE = ["createdAt", "updatedAt"];
    Acts.prototype.AddTimeConstraint = function (when_, timestamp, is_included, type_)
	{        
	    var cmp = TIMESTAMP_CONDITIONS[when_][is_included];
        timestamp = timestamp.toString();
        if (type === 0) // created
            cond = "created" + cmp + timestamp;
        else  // updated
            cond = window.BackendlessGetUpdatedCond(cmp, timestamp);
        
        get_filter(this.filters.filters, "updated").push(["AND", cond]);
	}; 	

    Acts.prototype.AddAllStatus = function ()
	{
        this.CleanFilter("status");  
	}; 
    
    Acts.prototype.AddStatus = function (status)
	{
        this.AddValueInclude("status", status);     
	};
	
    //var MARK_CONDITIONS = ["notEqualTo", "equalTo"];
    //Acts.prototype.SetMarkConstraint = function (mark, is_included)
	//{
	//    this.filters.marks.length = 0;
	//    
	//    var query_fn = MARK_CONDITIONS[is_included];
    //    this.filters.marks.push([query_fn, mark]);
	//}; 	
		    
    Acts.prototype.FetchByMessageID = function (messageID)
	{
        var self = this;
        
	    var on_success = function(message)
	    {
            window.BackendlessCleanRedundant(message);
	        self.exp_LastFetchedMessage = message;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnFetchOneComplete, self);
	    };	    
	    var on_error = function(error)
	    { 
	        self.last_error = error; 
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnFetchOneError, self);     
	    };
	    
	    var handler = new window["Backendless"]["Async"]( on_success, on_error );	    
        this.messageStorage["findById"](messageID, handler);
	}; 	
    
    Acts.prototype.FetchByIndex = function (index)
	{
        var itemID = this.Index2QueriedItemID(index, null);
        if (itemID === null)
            return;
        
        Acts.prototype.FetchByMessageID.call(this, itemID);
	};     
	
    Acts.prototype.RemoveByMessageID = function (messageID)
	{
        var self = this;
        
	    var on_success = function()
	    {            
	        self.exp_LastRemovedMessageID = messageID;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnRemoveComplete, self);
	    };	    
	    var on_error = function(error)
	    { 
	        self.last_error = error; 
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnRemoveError, self);  
	    };	    
	    var handler = new window["Backendless"]["Async"]( on_success, on_error );	            
	    var message = new this.messageKlass();
        message["objectId"] = messageID;
        this.messageStorage["remove"](message, handler);
	}; 	
	
    Acts.prototype.RemoveQueriedMessages = function ()
	{
        var filters = this.build_filter(this.filters);        
	    var query = this.get_request_query(filters); 
	    
        var self = this;
	    var on_success = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnRemoveQueriedItemsComplete, self);        
	    };	
	    var on_error = function(error)
	    {  
	        self.last_error = error; 
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnRemoveQueriedItemsError, self);
	    };	           
	    var handler = new window["Backendless"]["Async"]( on_success, on_error );	          
	    window.BackendlessRemoveAllItems(this.messageStorage, query, handler);     
	};
	
    Acts.prototype.RemoveByIndex = function (index)
	{
        var itemID = this.Index2QueriedItemID(index, null);
        if (itemID === null)
            return;
        
        Acts.prototype.RemoveByMessageID.call(this, itemID);
	}; 
    
    Acts.prototype.GetMessagesCount = function ()
	{
        var self=this;
        var filters = this.build_filter(this.filters);           
	    var query = this.get_request_query(filters);
        query["properties"] = ["objectId"];          
	    var on_success = function(result)
	    {
	        self.exp_LastMessagesCount = result["data"].length;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnGetMessagesCountComplete, self);  	            
	    };	     
	    var on_error = function(error)
	    {  
	        self.exp_LastMessagesCount = -1;
	        self.last_error = error; 
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_message.prototype.cnds.OnGetMessagesCountError, self); 
	    };	        
        var handler = new window["Backendless"]["Async"]( on_success, on_error );	      
	    window.BackendlessQuery(this.messageStorage, query, handler);
	};	

	
    Acts.prototype.InitialTable = function ()
	{        
        var messageObj = new this.messageKlass();
        messageObj["sender"] = (this.LinkSenderToTable)? new this.senderKlass():"";        
        messageObj["receiver"] = (this.LinkReceiverToTable)? new this.receiverKlass():"";        
        window.BackendlessInitTable(this.messageStorage, messageObj);
	}; 	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.MyUserID = function (ret)
	{
		ret.set_string(this.userID);
	};
	
	Exps.prototype.LastSentMessageID = function (ret)
	{
		ret.set_string(this.exp_LastSentMessageID);
	};    
    
	Exps.prototype.CurSenderID = function (ret)
	{        
		ret.set_string( window.BackendlessGetItemValue(this.exp_CurMessage, this.getSenderIDKey(), "") );
	};
   
	Exps.prototype.CurReceiverID = function (ret)
	{
        ret.set_string( window.BackendlessGetItemValue(this.exp_CurMessage, this.getReceiverIDKey(), "") );                
	}; 
	Exps.prototype.CurTitle = function (ret)
	{
        ret.set_string( window.BackendlessGetItemValue(this.exp_CurMessage, "title", "") );          
	};
	Exps.prototype.CurContent = function (ret)
	{
        ret.set_string( window.BackendlessGetItemValue(this.exp_CurMessage, "content", "") );          
	};
    
	Exps.prototype.CurMessageID = function (ret)
	{
        ret.set_string( window.BackendlessGetItemValue(this.exp_CurMessage, "id", "") );        
	};
    
	Exps.prototype.CurSentAt = function (ret)
	{
        ret.set_float( window.BackendlessGetItemValue(this.exp_CurMessage, "created", 0) );        
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
        ret.set_string( window.BackendlessGetItemValue(this.exp_CurMessage, "status", "") );          
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
    
	Exps.prototype.CurSenderData = function (ret, subKey, default_value)
	{
		ret.set_any( window.BackendlessGetSubItemValue(this.exp_CurMessage, "sender", subKey, default_value)  );                  
	};    
    
	Exps.prototype.CurReceiverrData = function (ret, subKey, default_value)
	{
		ret.set_any( window.BackendlessGetSubItemValue(this.exp_CurMessage, "receiver", subKey, default_value)  );                  
	};     
    
	Exps.prototype.Index2SenderID = function (ret, index)
	{
        ret.set_string( window.BackendlessGetItemValue(this.messagebox.GetItem(index), this.getSenderIDKey(), "") );          
	};
    
	Exps.prototype.Index2ReceiverID = function (ret, index)
	{
        ret.set_string( window.BackendlessGetItemValue(this.messagebox.GetItem(index), this.getReceiverIDKey(), "") );         
	}; 
	Exps.prototype.Index2Title = function (ret, index)
	{
        ret.set_string( window.BackendlessGetItemValue(this.messagebox.GetItem(index), "title", "") );        
	};
	Exps.prototype.Index2Content = function (ret, index)
	{
        ret.set_string( window.BackendlessGetItemValue(this.messagebox.GetItem(index), "content", "") );         
	};
    
	Exps.prototype.Index2MessageID = function (ret, index)
	{
        ret.set_string( window.BackendlessGetItemValue(this.messagebox.GetItem(index), "id", "") );          
	};
    
	Exps.prototype.Index2SentAt = function (ret, index)
	{
        ret.set_float( window.BackendlessGetItemValue(this.messagebox.GetItem(index), "created", 0) );             
	};
    
	Exps.prototype.Index2Status = function (ret, index)
	{
        ret.set_string( window.BackendlessGetItemValue(this.messagebox.GetItem(index), "status", "") );           
	};    
    
	Exps.prototype.Index2SenderData = function (ret, index, subKey, default_value)
	{
		ret.set_any( window.BackendlessGetSubItemValue(this.messagebox.GetItem(index), "sender", subKey, default_value)  );                  
	};    
    
	Exps.prototype.Index2ReceiverData = function (ret, index, subKey, default_value)
	{
		ret.set_any( window.BackendlessGetSubItemValue(this.messagebox.GetItem(index), "receiver", subKey, default_value)  );                  
	};         
    
	Exps.prototype.LastFetchedSenderID = function (ret)
	{
        ret.set_string( window.BackendlessGetItemValue(this.exp_LastFetchedMessage, this.getSenderIDKey(), "") );          
	};
    
	Exps.prototype.LastFetchedReceiverID = function (ret)
	{
        ret.set_string( window.BackendlessGetItemValue(this.exp_LastFetchedMessage, this.getReceiverIDKey(), "") );         
	}; 
	Exps.prototype.LastFetchedTitle = function (ret)
	{
        ret.set_string( window.BackendlessGetItemValue(this.exp_LastFetchedMessage, "title", "") );        
	};
	Exps.prototype.LastFetchedContent = function (ret)
	{
        ret.set_string( window.BackendlessGetItemValue(this.exp_LastFetchedMessage, "content", "") );         
	};
    
	Exps.prototype.LastFetchedMessageID = function (ret)
	{
        ret.set_string( window.BackendlessGetItemValue(this.exp_LastFetchedMessage, "id", "") );          
	};
    
	Exps.prototype.LastFetchedSentAt = function (ret)
	{
        ret.set_float( window.BackendlessGetItemValue(this.exp_LastFetchedMessage, "created", 0) );             
	};
    
	Exps.prototype.LastFetchedStatus = function (ret)
	{
        ret.set_string( window.BackendlessGetItemValue(this.exp_LastFetchedMessage, "status", "") );           
	};    
    
	Exps.prototype.LastFetchedSenderData = function (ret, subKey, default_value)
	{
		ret.set_any( window.BackendlessGetSubItemValue(this.exp_LastFetchedMessage, "sender", subKey, default_value)  );                  
	};    
    
	Exps.prototype.LastFetchedReceiverData = function (ret, subKey, default_value)
	{
		ret.set_any( window.BackendlessGetSubItemValue(this.exp_LastFetchedMessage, "receiver", subKey, default_value)  );                  
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