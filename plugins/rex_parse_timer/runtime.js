/*
<itemID>
    ownerID - userID of timer owner    
    timerName - timer name
    time-out - interval of time-out
*/

// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_parse_Timer = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_parse_Timer.prototype;
		
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
	        this.timer_klass = window["Parse"].Object["extend"](this.properties[0]);
	    }
        
        this.cache_mode = (this.properties[1] === 1);
        if (this.cache_mode)
            this.cache = new CacheKlass();
            
	    this.exp_LastOwnerID = "";
	    this.exp_LastTimerName = "";
        this.exp_LastTimer = null;   
	    this.last_error = null;               
	};

    instanceProto.get_base_query = function(ownerID, timerName)
	{ 
	    var query = new window["Parse"]["Query"](this.timer_klass);
	    query["equalTo"]("ownerID", ownerID);
	    if (timerName != null)
	        query["equalTo"]("timerName", timerName);
	    return query;
	};
	
    instanceProto.start_timer = function(ownerID, timerName, interval, handler)
	{ 
        var timer_obj = new this.timer_klass();
	    timer_obj["set"]("ownerID", ownerID);
	    timer_obj["set"]("timerName", timerName);
	    timer_obj["set"]("time-out", interval);
	    timer_obj["save"](null, handler);	
	}; 

    var CacheKlass = function()
    {
        this.ownerID = null;    
        this.timerIDs = {};
    }
    var CacheKlassProto = CacheKlass.prototype;  
     
	CacheKlassProto.set_owner = function(ownerID)
	{        
        if (this.ownerID === ownerID)
            return;
        
        for (var n in this.timerIDs)
            delete this.timerIDs[n];
        this.ownerID = ownerID;
	};     
	CacheKlassProto.get = function(ownerID, timerName)
	{        
        if (this.ownerID !== ownerID)
        {
            this.set_owner(ownerID);
            return null;
        }
        
        return this.timerIDs[timerName];
	}; 

	CacheKlassProto.set = function(ownerID, timerName, timerObj)
	{          
        if (this.ownerID !== ownerID)        
            this.set_owner(ownerID);        
        
        this.timerIDs[timerName] = timerObj;
	};    

	CacheKlassProto.remove = function(ownerID, timerName)
	{             
        if (this.ownerID !== ownerID)
        {
            this.set_owner(ownerID);
            return null;
        }
        
        if (this.timerIDs.hasOwnProperty(timerName))
            delete this.timerIDs[timerName];
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
    
	Cnds.prototype.OnStartTimerComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnStartTimerError = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnGetTimerComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnGetTimerError = function ()
	{
	    return true;
	};	
	Cnds.prototype.OnRemoveTimerComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnRemoveTimerError = function ()
	{
	    return true;
	};	
    
	Cnds.prototype.IsTimeOut = function ()
	{
        if (!this.exp_LastTimer)
            return false;
            
        var t = this.exp_LastTimer["updatedAt"]-this.exp_LastTimer["createdAt"];        
	    return (t/1000) > this.exp_LastTimer["get"]("time-out");
	};	
	
	Cnds.prototype.IsValid = function ()
	{
        return (this.exp_LastTimer != null);
	};	        
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.StartTimer = function (ownerID, timerName, interval)
	{
	    var self = this;
        
	    var on_error = function(error)
	    {
	        self.exp_LastOwnerID = ownerID;
	        self.exp_LastTimerName = timerName;    
	        self.last_error = error;    	        
            self.runtime.trigger(cr.plugins_.Rex_parse_Timer.prototype.cnds.OnStartTimerError, self); 
	    };
        
	    var on_start_timer = function(timer_obj) 
	    {
            if (self.cache_mode)
                self.cache.set(ownerID, timerName, timer_obj);
                
	        self.exp_LastOwnerID = ownerID;
	        self.exp_LastTimerName = timerName; 
            self.exp_LastTimer = timer_obj;               
            self.runtime.trigger(cr.plugins_.Rex_parse_Timer.prototype.cnds.OnStartTimerComplete, self); 
        };        	    		
        
        //2. start timer
        var start_timer = function()
        {
	        var handler = {"success":on_start_timer, "error": on_error};
	        self.start_timer(ownerID, timerName, interval, handler);	       
        };
        //2 start timer
         
	    //1. delete all matched timers
        var remove_handler = {"success":start_timer, "error": on_error};
        var item_query = this.get_base_query(ownerID, timerName);
        window.ParseRemoveAllItems(item_query, remove_handler);
        //1. delete all matched timers
	             
	};
	
    Acts.prototype.GetTimer = function (ownerID, timerName, interval)
	{
        var startIfNotExists = (interval != null);           
	    var self = this;
	    var on_error = function(error)
	    {
	        self.exp_LastOwnerID = ownerID;
	        self.exp_LastTimerName = timerName; 
            self.last_error = error;    	               	        
            self.runtime.trigger(cr.plugins_.Rex_parse_Timer.prototype.cnds.OnGetTimerError, self); 
	    };
        
	    var on_get_timer = function(timer_obj) 
	    {
            if (self.cache_mode)
                self.cache.set(ownerID, timerName, timer_obj);        
        
	        self.exp_LastOwnerID = ownerID;
	        self.exp_LastTimerName = timerName;  
            self.exp_LastTimer = timer_obj;            
            self.runtime.trigger(cr.plugins_.Rex_parse_Timer.prototype.cnds.OnGetTimerComplete, self); 
        };         
	    
        //2. update timer / start timer	     
        var update_timer = function(timer_obj)
        {
            var handler = {"success":on_get_timer, "error": on_error};
            if (timer_obj)
	            timer_obj["save"](null, handler);
            else if (startIfNotExists)
                self.start_timer(ownerID, timerName, interval, handler);	    
            else
                on_get_timer(timer_obj);
        };
        //2. update timer 
        
        //1. check if timer is existed
        var check_timer = function ()
        {
            var handler = {"success":update_timer, "error": on_error};             
	        var query = self.get_base_query(ownerID, timerName);       
	        query["first"](handler);        
        }
        //1. check if timer is existed
        
        //0. get timerObj if possible
        var timer_obj;
        if (this.cache_mode)
            timer_obj = this.cache.get(ownerID, timerName);
        
        if (!timer_obj)
            check_timer();
        else
            update_timer(timer_obj);
        //0. get timerObj if possible            
	};	
	
    Acts.prototype.RemoveTimer = function (ownerID, timerName)
	{
	    var self = this;
        
	    var on_error = function(error)
	    {
	        self.exp_LastOwnerID = ownerID;
	        self.exp_LastTimerName = timerName;    
	        self.last_error = error;        	        
            self.runtime.trigger(cr.plugins_.Rex_parse_Timer.prototype.cnds.OnRemoveTimerError, self); 
	    };
        
	    var on_delete = function() 
	    {
            if (self.cahce_mode)
                self.cache.remove(ownerID, timerName);
                
	        self.exp_LastOwnerID = ownerID;
	        self.exp_LastTimerName = timerName;        	        
            self.runtime.trigger(cr.plugins_.Rex_parse_Timer.prototype.cnds.OnRemoveTimerComplete, self); 
        }; 
        var remove_handler = {"success":on_delete, "error": on_error};
        var item_query = this.get_base_query(ownerID, timerName);
        window.ParseRemoveAllItems(item_query, remove_handler);       
	};	
	
    Acts.prototype.InitialTable = function ()
	{	
        var timer_obj = new this.timer_klass();
	    timer_obj["set"]("ownerID", "");
	    timer_obj["set"]("timerName", "");
        window.ParseInitTable(timer_obj);
	}; 	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	//deprecated
	Exps.prototype.LastUserID = function (ret)
	{
		ret.set_string(this.exp_LastOwnerID);
	}; 	
	Exps.prototype.LastTimerName = function (ret)
	{
		ret.set_string(this.exp_LastTimerName);
	};	
	Exps.prototype.LastStartTimestamp = function (ret)
	{    
		ret.set_float(get_itemValue(this.exp_LastTimer, "createdAt", 0));
	}; 	
	Exps.prototype.LastCurrentTimestamp = function (ret)
	{
		ret.set_float(get_itemValue(this.exp_LastTimer, "updatedAt", 0));        
	}; 	    
	Exps.prototype.LastElapsedTime = function (ret)
	{
        var t;
        if (this.exp_LastTimer)        
            t = this.exp_LastTimer["updatedAt"].getTime() - this.exp_LastTimer["createdAt"].getTime();
        else
            t = 0;     
		ret.set_float(t/1000);        
	};
	Exps.prototype.LastTimeoutInterval = function (ret)
	{
        var t = get_itemValue(this.exp_LastTimer, "time-out", 0);    
		ret.set_float(t/1000);     
	};
	Exps.prototype.LastRemainInterval = function (ret)
	{
        var t;
        if (this.exp_LastTimer)        
            t = this.exp_LastTimer["updatedAt"].getTime() - this.exp_LastTimer["createdAt"].getTime() - this.exp_LastTimer["get"]("time-out");
        else
            t = 0;
		ret.set_float(t/1000);
	};	
	
	Exps.prototype.LastOwnerID = function (ret)
	{
		ret.set_string(this.exp_LastOwnerID);
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