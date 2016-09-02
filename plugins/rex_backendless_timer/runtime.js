/*
<timerID>
    userID - userID
    timerName - timer name
    timeOut - interval of timeOut
    stField - name of started time field, "created"| "updated"->"started"
    started - started time of this timer
    
    created - created time of this timer
    updated - current time of this timer
*/

// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Backendless_Timer = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Backendless_Timer.prototype;
		
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
        this.timerKlass = window.BackendlessGetKlass(this.properties[0]);     
        this.timerStorage = window["Backendless"]["Persistence"]["of"](this.timerKlass);

	       
	    if (!this.recycled)
        {        
	        this.cacheTimerObjs = {};
        }
        else
            this.onDestroy();
        
        this.userID = "";  
	    this.exp_LastUserID = "";        
	    this.exp_LastTimerName = "";
        this.exp_LastTimer = null;   
	    this.last_error = null;               
	};
    
	instanceProto.onDestroy = function ()
	{
		clean_table( this.cacheTimerObjs );
        this.exp_LastTimer = null;   
	    this.last_error = null;          
	};      

    var reverEval = function (value)
    {
        if (typeof(value) === "string")
            value = "'" + value + "'";
        
        return value;
    };  
    
    instanceProto.get_base_query = function(userID, timerName)
	{ 
        var conds = [];
        conds.push("userID=" + reverEval(userID));
        
        if (timerName != null)        
            conds.push("timerName=" + reverEval(timerName));

        var query = new window["Backendless"]["DataQuery"]();
        query["condition"] = conds.join(" AND ");
        query["options"] = {
            "pageSize": 1,
            "offset": 0,
        }
	    return query;
	};
    
    
    instanceProto.getTimer = function(userID, timerName, handler, includeCacheObj)
	{ 
        var timerObj;
        if (includeCacheObj)
            timerObj = this.getCacheObject(userID, timerName);
        if (timerObj == null)
        {
            var query = this.get_base_query(userID, timerName);
            window.BackendlessQuery(this.timerStorage, query, handler);        
        }
        else
        {
            var result = {"data": [timerObj]};
            handler["success"](result); 
        }
	};    
    
    instanceProto.startTimer = function (timerObj, userID, timerName, interval, handler)
	{
        if (timerObj)
        {
            // start at this row
            timerObj["stField"] = "updated";
        }
        else
        {
            // create a new row
            timerObj = new this.timerKlass();
            timerObj["userID"] = userID;
            timerObj["timerName"] = timerName;
            timerObj["timeOut"] = interval;
            timerObj["stField"] = "created";            
        }
        this.timerStorage["save"](timerObj, handler);
    };
    
	instanceProto.getStartTimestamp = function (timerObj)
	{
        if (timerObj == null)
            return 0;
        
        var stField = window.BackendlessGetItemValue(timerObj, "stField");
        var t = window.BackendlessGetItemValue(timerObj, stField);        
		return t;
	};	     
    
	instanceProto.getRemainInterval = function (timerObj)
	{
        var timeOut = window.BackendlessGetItemValue(timerObj, "timeOut", 0);        
        var t1 = window.BackendlessGetItemValue(timerObj, "updated", 0);
        var t0 = this.getStartTimestamp(timerObj);
        var t = timeOut - ((t1 - t0)/1000.0);
		return t;
	};	    

	instanceProto.getCacheObject = function(userID, timerName)
	{         
	    if ( !this.cacheTimerObjs.hasOwnProperty(timerName) )	
            return null;
        
        var timerObj = this.cacheTimerObjs[timerName];
        if (userID != timerObj["userID"])
            return null;        
        
        return timerObj;
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
            
        var t =this.getRemainInterval(this.exp_LastTimer);
	    return (t < 0);
	};	
	
	Cnds.prototype.IsValid = function ()
	{
        return (this.exp_LastTimer != null);
	};	        
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetUserInfo = function (userID)
	{	    
        this.userID = userID;
		clean_table( this.cacheTimerObjs );        
	};    
    
    Acts.prototype.StartTimer = function (timerName, interval)
	{
        var userID = this.userID;
        if (userID === "")
            return;
        
	    var self = this;      
	    // step 3            
	    var OnStartComplete = function(timerObj) 
	    {
            self.cacheTimerObjs[timerName] = timerObj;
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timerName; 
            self.exp_LastTimer = timerObj;               
            self.runtime.trigger(cr.plugins_.Rex_Backendless_Timer.prototype.cnds.OnStartTimerComplete, self); 
        };         
	    var OnStartError = function(error)
	    {
            if (self.cacheTimerObjs.hasOwnProperty(timerName))
                delete self.cacheTimerObjs[timerName];
            
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timerName;    
	        self.last_error = error;    	        
            self.runtime.trigger(cr.plugins_.Rex_Backendless_Timer.prototype.cnds.OnStartTimerError, self); 
	    };
        
        var tryStartTimer = function (result)
        {
            var timerObj = result["data"][0];
            var handler = new window["Backendless"]["Async"]( OnStartComplete, OnStartError );
            self.startTimer(timerObj, userID, timerName, interval, handler);
        };
        var on_read_handler = new window["Backendless"]["Async"]( tryStartTimer, OnStartError );
        this.getTimer(userID, timerName, on_read_handler, true );
	};
	
    Acts.prototype.GetTimer = function (timerName, interval)
	{
        var userID = this.userID;
        if (userID === "")
            return;
        
        var startIfNotExists = (interval != null);           
	    var self = this;
	    var OnGetComplete = function(timerObj) 
	    {
            self.cacheTimerObjs[timerName] = timerObj;            
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timerName;  
            self.exp_LastTimer = timerObj;            
            self.runtime.trigger(cr.plugins_.Rex_Backendless_Timer.prototype.cnds.OnGetTimerComplete, self); 
        };         
	            
	    var OnGetError = function(error)
	    {
            if (self.cacheTimerObjs.hasOwnProperty(timerName))
                delete self.cacheTimerObjs[timerName];
            
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timerName; 
            self.last_error = error;    	               	        
            self.runtime.trigger(cr.plugins_.Rex_Backendless_Timer.prototype.cnds.OnGetTimerError, self); 
	    };

	    // step 2      
        var tryUpdateTimer = function(result)
        {
            var handler = new window["Backendless"]["Async"]( OnGetComplete, OnGetError );            
            var timerObj = result["data"][0];
            if (timerObj)
            {
                var wroteItem = new self.timerKlass();
                wroteItem["objectId"] = timerObj["objectId"];
                if (timerObj["stField"] === "updated")
                {
                    wroteItem["stField"] = "started";
                    wroteItem["started"] = timerObj["updated"];
                }
                self.timerStorage["save"](wroteItem, handler);
            }
            else if (startIfNotExists)
                self.startTimer(timerObj, userID, timerName, interval, handler);
            else    // timerObj = null
                OnGetComplete(timerObj);            
        };            
        var on_read_handler = new window["Backendless"]["Async"]( tryUpdateTimer, OnGetError );
        this.getTimer(userID, timerName, on_read_handler );
	};	
	
    Acts.prototype.RemoveTimer = function (timerName)
	{
        var userID = this.userID;
        if (userID === "")
            return;
        
	    var self = this;
	    var OnRemoveComplete = function() 
	    {
            if (self.cacheTimerObjs.hasOwnProperty(timerName))
                delete self.cacheTimerObjs[timerName];
            
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timerName;        	        
            self.runtime.trigger(cr.plugins_.Rex_Backendless_Timer.prototype.cnds.OnRemoveTimerComplete, self); 
        };         
        
	    var OnRemoveError = function(error)
	    {
            if (self.cacheTimerObjs.hasOwnProperty(timerName))
                delete self.cacheTimerObjs[timerName];
            
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timerName;    
	        self.last_error = error;        	        
            self.runtime.trigger(cr.plugins_.Rex_Backendless_Timer.prototype.cnds.OnRemoveTimerError, self); 
	    };
        
        
	    // step 2        
        var tryRemoveTimer = function(result)
        {
            var timerObj = result["data"][0]
            if (timerObj == null)
            {
                OnRemoveComplete();
            }
            else
            {            
                var handler = new window["Backendless"]["Async"]( OnRemoveComplete, OnRemoveError );
                self.timerStorage["remove"](timerObj, handler);
            }
        }
        
        var on_read_handler = new window["Backendless"]["Async"]( tryRemoveTimer, OnRemoveError );
        this.getTimer(userID, timerName, on_read_handler, true ); 
	};	
	
    Acts.prototype.InitialTable = function ()
	{	        
        var timerObj = new this.timer_klass();
        messageObj["userID"] = "";
        messageObj["timerName"] = "";
        window.BackendlessInitTable(this.timerStorage, timerObj);
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
		ret.set_float( this.getStartTimestamp(this.exp_LastTimer) );
	}; 	
	Exps.prototype.LastCurrentTimestamp = function (ret)
	{
		ret.set_float(window.BackendlessGetItemValue(this.exp_LastTimer, "updated", 0));        
	}; 	    
	Exps.prototype.LastElapsedTime = function (ret)
	{
        var t1 = window.BackendlessGetItemValue(this.exp_LastTimer, "updated", 0);
        var t0 = this.getStartTimestamp(this.exp_LastTimer);
        var t = (t1 - t0)/1000.0;    
		ret.set_float(t);        
	};
	Exps.prototype.LastTimeoutInterval = function (ret)
	{
        var t = window.BackendlessGetItemValue(this.exp_LastTimer, "timeOut", 0);    
		ret.set_float(t);     
	};
	Exps.prototype.LastRemainInterval = function (ret)
	{
		ret.set_float(this.getRemainInterval(this.exp_LastTimer));
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