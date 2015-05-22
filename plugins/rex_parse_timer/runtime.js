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
	        this.timer_klass = window["Parse"].Object["extend"](this.properties[2]);
	    }
        
        this.cache_mode = (this.properties[3] === 1);
        if (this.cache_mode)
            this.cache = new CacheKlass();
            
	    this.exp_LastUserID = "";
	    this.exp_LastTimerName = "";
        this.exp_LastTimer = null;          
	};

    instanceProto.get_base_query = function(userID, timerName)
	{ 
	    var query = new window["Parse"]["Query"](this.timer_klass);
	    query["equalTo"]("userID", userID);
	    if (timerName != null)
	        query["equalTo"]("timerName", timerName);
	    return query;
	};
    
    instanceProto.remove_timers = function (userID, timerName, destroy_handler)
	{
	    var query = this.get_base_query(userID, timerName);
	    query["limit"](1000);
        
        var self = this;    
        
        // read
        // 2. destroy each item
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
            destroy_handler["error"]();
	    };
	    var query_handler = {"success":on_query_success, "error": on_query_error};        
        // read
                
        // 1. read items           
	    query["find"](query_handler);
	};  

    instanceProto.start_timer = function(userID, timerName, interval, handler)
	{ 
        var timer_obj = new this.timer_klass();
	    timer_obj["set"]("userID", userID);
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
     
	CacheKlassProto.set_owner = function(userID)
	{        
        if (this.ownerID === userID)
            return;
        
        for (var n in this.timerIDs)
            delete this.timerIDs[n];
        this.ownerID = userID;
	};     
	CacheKlassProto.get = function(userID, timerName)
	{        
        if (this.ownerID !== userID)
        {
            this.set_owner(userID);
            return null;
        }
        
        return this.timerIDs[timerName];
	}; 

	CacheKlassProto.set = function(userID, timerName, timerObj)
	{          
        if (this.ownerID !== userID)        
            this.set_owner(userID);        
        
        this.timerIDs[timerName] = timerObj;
	};    

	CacheKlassProto.remove = function(userID, timerName)
	{             
        if (this.ownerID !== userID)
        {
            this.set_owner(userID);
            return null;
        }
        
        if (this.timerIDs.hasOwnProperty(timerName))
            delete this.timerIDs[timerName];
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
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.StartTimer = function (userID, timerName, interval)
	{
	    var self = this;
        
	    var on_error = function(error)
	    {
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timerName;        	        
            self.runtime.trigger(cr.plugins_.Rex_parse_Timer.prototype.cnds.OnStartTimerError, self); 
	    };
        
	    var on_start_timer = function(timer_obj) 
	    {
            if (self.cache_mode)
                self.cache.set(userID, timerName, timer_obj);
                
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timerName; 
            self.exp_LastTimer = timer_obj;               
            self.runtime.trigger(cr.plugins_.Rex_parse_Timer.prototype.cnds.OnStartTimerComplete, self); 
        };        	    		
        
        //2. start timer
        var start_timer = function()
        {
	        var handler = {"success":on_start_timer, "error": on_error};
	        self.start_timer(userID, timerName, interval, handler);	       
        };
        //2 start timer
         
	    //1. delete all matched timers
        var remove_handler = {"success":start_timer, "error": on_error};
	    this.remove_timers(userID, timer_name, remove_handler);
        //1. delete all matched timers
	             
	};
	
    Acts.prototype.GetTimer = function (userID, timerName, interval)
	{
	    var self = this;
	    var on_error = function(error)
	    {
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timerName;        	        
            self.runtime.trigger(cr.plugins_.Rex_parse_Timer.prototype.cnds.OnGetTimerError, self); 
	    };
        
	    var on_get_timer = function(timer_obj) 
	    {
            if (self.cache_mode)
                self.cache.set(userID, timerName, timer_obj);        
        
	        self.exp_LastUserID = userID;
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
            else
                self.start_timer(userID, timerName, interval, handler);	    
        };
        //2. update timer 
        
        //1. check if timer is existed
        var check_timer = function ()
        {
            var handler = {"success":update_timer, "error": on_error};             
	        var query = self.get_base_query(userID, timerName);       
	        query["first"](handler);        
        }
        //1. check if timer is existed
        
        //0. get timerObj if possible
        var timer_obj;
        if (this.cache_mode)
            timer_obj = this.cache.get(userID, timerName);
        
        if (!timer_obj)
            check_timer();
        else
            update_timer(timer_obj);
        //0. get timerObj if possible            
	};	
	
    Acts.prototype.RemoveTimer = function (userID, timerName)
	{
	    var self = this;
        
	    var on_error = function(error)
	    {
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timerName;        	        
            self.runtime.trigger(cr.plugins_.Rex_parse_Timer.prototype.cnds.OnRemoveTimerError, self); 
	    };
        
	    var on_delete = function() 
	    {
            if (self.cahce_mode)
                self.cache.remove(userID, timerName);
                
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timerName;        	        
            self.runtime.trigger(cr.plugins_.Rex_parse_Timer.prototype.cnds.OnRemoveTimerComplete, self); 
        }; 
        var remove_handler = {"success":on_delete, "error": on_error};
	    this.remove_timers(userID, timerName, remove_handler);        
	};	
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.LastUserID = function (ret)
	{
		ret.set_string(this.exp_LastUserID);
	}; 	
	Exps.prototype.LastTimerName = function (ret)
	{
		ret.set_string(this.exp_LastTimerName);
	};	
	Exps.prototype.LastStartTimestamp = function (ret)
	{
        var t;
        if (this.exp_LastTimer)        
            t = this.exp_LastTimer["createdAt"].getTime();
        else
            t = 0;     
		ret.set_float(t);
	}; 	
	Exps.prototype.LastCurrentTimestamp = function (ret)
	{
        var t;
        if (this.exp_LastTimer)        
            t = this.exp_LastTimer["updatedAt"].getTime();
        else
            t = 0;       
		ret.set_float(t);
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
        var t;
        if (this.exp_LastTimer)        
            t = this.exp_LastTimer["get"]("time-out");
        else
            t = 0;    
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
}());