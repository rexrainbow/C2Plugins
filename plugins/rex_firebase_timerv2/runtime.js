/*
<ownerID>
    timers\    (monitor children of this node)
        <timerName>
            start - timestamp of start
            time-out - interval of time-out
            
    current - timestamp of current (write then read)        
*/


// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_TimerV2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_TimerV2.prototype;
		
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
	    this.rootpath = this.properties[0] + "/"; 

        this.currentTimestamp = (new Date()).getTime();
        this.endTimes = {};    // [ endTimestamp, isTimeout]
        
	    this.exp_LastOwnerID = "";
	    this.exp_LastTimerName = "";
        this.exp_LastTimer = null;  
        this.exp_CurTimer = null;        
        this.exp_CurIndex = 0; 

        this.exp_MonitorOwnerID = "";
        this.exp_CurTimestamp = null; 
        this.nextUpdateTimestamp = null;
        
        this.timers = this.create_timers(true);
        
        this.runtime.tickMe(this);
	};
	
	instanceProto.onDestroy = function ()
	{		
	    this.timers.StopUpdate();    
	};
    
    instanceProto.tick = function()
    {
        if (!this.HasWaitingTimeout())
            return;
        
        if (this.exp_CurTimestamp >= this.nextUpdateTimestamp)        
            this.UpdateCurrentTimestamp();                
        else
            this.exp_CurTimestamp += this.runtime.getDt(this);
    };    

    // 2.x , 3.x    
	var isFirebase3x = function()
	{ 
        return (window["FirebaseV3x"] === true);
    };
    
    var isFullPath = function (p)
    {
        return (p.substring(0,8) === "https://");
    };
	
	instanceProto.get_ref = function(k)
	{
        if (k == null)
	        k = "";
	    var path;
	    if (isFullPath(k))
	        path = k;
	    else
	        path = this.rootpath + k + "/";
            
        // 2.x
        if (!isFirebase3x())
        {
            return new window["Firebase"](path);
        }  
        
        // 3.x
        else
        {
            var fnName = (isFullPath(path))? "refFromURL":"ref";
            return window["Firebase"]["database"]()[fnName](path);
        }
        
	};
    
    var get_key = function (obj)
    {       
        return (!isFirebase3x())?  obj["key"]() : obj["key"];
    };
    
    var get_root = function (obj)
    {       
        return (!isFirebase3x())?  obj["root"]() : obj["root"];
    };
    
    var serverTimeStamp = function ()
    {       
        if (!isFirebase3x())
            return window["Firebase"]["ServerValue"]["TIMESTAMP"];
        else
            return window["Firebase"]["database"]["ServerValue"];
    };    

    var get_timestamp = function (obj)    
    {       
        if (!obj)
            return null;
        
        return (!isFirebase3x())?  obj : obj["TIMESTAMP"];
    };
    // 2.x , 3.x  

	instanceProto.create_timers = function(isAutoUpdate)
	{
	    var timers = new window.FirebaseItemListKlass();
	    
	    timers.updateMode = (isAutoUpdate)? timers.AUTOCHILDUPDATE : timers.MANUALUPDATE;
	    timers.keyItemID = "timerName";
	    
	    var self = this;	  
        var onTimeoutChanged = function (timer)
        {
            if (self.exp_CurTimestamp === null)
                self.UpdateCurrentTimestamp();
            else
            {     
                var minEndTimestamp = self.GetMinEndTimestamp();
                if (minEndTimestamp < self.exp_CurTimestamp)
                    self.UpdateCurrentTimestamp();
                else 
                    self.nextUpdateTimestamp = self.GetNextUpdateTimestamp();
            }
        }
        timers.onItemAdd = function (item)
        {            
            var name = item["timerName"];
            self.endTimes[name] = [getEndTime(item), false];
            
            self.runtime.trigger(cr.plugins_.Rex_Firebase_TimerV2.prototype.cnds.OnUpdate, self);
            onTimeoutChanged();
        };
        timers.onItemRemove = function (item)
        {
            var name = item["timerName"];
            if (self.endTimes.hasOwnProperty(name))
                delete self.endTimes[name]
            
            self.runtime.trigger(cr.plugins_.Rex_Firebase_TimerV2.prototype.cnds.OnUpdate, self); 
            self.nextUpdateTimestamp = self.GetNextUpdateTimestamp();
        };
        timers.onItemChange = function (item)
        {
            var name = item["timerName"];
            self.endTimes[name][0] = getEndTime(item);   
            
            self.runtime.trigger(cr.plugins_.Rex_Firebase_TimerV2.prototype.cnds.OnUpdate, self); 
            onTimeoutChanged();
        };
        
	    timers.onGetIterItem = function(item, i)
	    {
	        self.exp_CurTimer = item;
	        self.exp_CurIndex = i;
	    };
	           
        return timers;
    };
    
	instanceProto.get_timer_ref = function(ownerID, timerName)
	{
        var ref = this.get_ref(ownerID)["child"]("timers");
        if (timerName)
            ref = ref["child"](timerName)
        
        return ref;
	};    
    
	instanceProto.runTimerTrigger = function(trig, ownerID, timerName)
	{
        this.exp_LastOwnerID = ownerID;
        this.exp_LastTimerName = timerName;
        this.runtime.trigger(trig, this);     
	};
    
    var newTimerDate = function (interval)
    {
        var t = {"start": serverTimeStamp(),
                    "time-out": interval};
        return t;
    };
    
    instanceProto.start_timer = function(ref, interval, handler)
    {
		ref["set"](newTimerDate(interval), handler);
    };   
        
	var getEndTime = function(timer)
	{
        return get_timestamp(timer["start"]) + timer["time-out"];
	};
    
    instanceProto.UpdateCurrentTimestamp = function()
    {
        var self=this;
        var onGetCurrentTimestamp = function (timestamp)
        {
            self.exp_CurTimestamp = timestamp;  // + serverTimeOffset
            self.TimeOutTest();
            self.nextUpdateTimestamp = self.GetNextUpdateTimestamp();
        }
        this.GetCurrentTimestamp( onGetCurrentTimestamp );        
    };
    
    instanceProto.GetCurrentTimestamp = function(callback)
    {
        var ref = this.get_ref(this.exp_MonitorOwnerID)["child"]("current");        
        
	    var self = this;        
        var onRead = function(snapshot)
        {
            var t = snapshot["val"]();
            if (t == null)
                return;
            
            callback( get_timestamp(t) );
        }
        
        // step 1. write server timestamp
	    var onWrite = function(error) 
	    {
            if (error)
                return;
            
            ref["once"]("value", onRead)
        };        

        ref["set"](serverTimeStamp(), onWrite);
        // step 1. write server timestamp        
    };
    
    instanceProto.TimeOutTest = function(curTimestamp)
    {
        if (curTimestamp == null)
            curTimestamp = this.exp_CurTimestamp;
        
        for (var n in this.endTimes)
        {
            if (curTimestamp >= this.endTimes[n][0])
            {
                if (!this.endTimes[n][1])
                {
                    // timeout
                    //var timer = this.timer.GetItemByID(n);
                    var trig = cr.plugins_.Rex_Firebase_TimerV2.prototype.cnds.OnTimeout
                    this.runTimerTrigger(trig, this.exp_MonitorOwnerID, n);
                    this.endTimes[n][1] = true;
                }
            }
        }
    };  
    
    instanceProto.GetNextUpdateTimestamp = function(curTimestamp, minEndTimestamp)
    {
        if (curTimestamp == null)
            curTimestamp = this.exp_CurTimestamp;
        if (minEndTimestamp == null)
            minEndTimestamp = this.GetMinEndTimestamp();
        
        var deltaTimestamp = minEndTimestamp - curTimestamp;
        return curTimestamp + Math.floor( (deltaTimestamp/2) );
    };     

    instanceProto.GetMinEndTimestamp = function()
    {
        var ts, endTime;
        for (var n in this.endTimes)
        {
            endTime = this.endTimes[n];
            if (endTime[1])  // is time-out
                continue;
            
            if ((ts == null) || (ts < endTime[0]))
                ts = endTime[0];
        }      
        return ts;
    };     

    instanceProto.HasWaitingTimeout = function()
    {
        for (var n in this.endTimes)
        {
            if (!this.endTimes[n][1])  // is time-out
                return true;
        }      
        return false;
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
    
	Cnds.prototype.OnUpdate = function ()
	{
	    return true;
	}; 	 
	Cnds.prototype.ForEachTimer = function (start, end)
	{	     
		return this.timers.ForEachItem(this.runtime, start, end);
	};  	   
	Cnds.prototype.OnTimeout = function ()
	{
	    return true;
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetDomainRef = function (sub_domain_ref)
	{
		this.rootpath = sub_domain_ref + "/";
	};
	
    Acts.prototype.StartTimer = function (ownerID, timerName, interval)
	{
	    var self = this;
	    var onComplete = function(error) 
	    {
            var cnds = cr.plugins_.Rex_Firebase_TimerV2.prototype.cnds;
            var trig = (!error)? cnds.OnStartTimerComplete:
                                         cnds.OnStartTimerError;
                                         
            self.runTimerTrigger(trig, ownerID, timerName);
        };
	    var ref = this.get_timer_ref(ownerID, timerName);
        this.start_timer(ref, interval, onComplete);    
	};
    
    Acts.prototype.StartUpdate = function (ownerID)
	{	   
	    if (ownerID == "")
	        return;
	    
        this.exp_MonitorOwnerID = ownerID;
	    var ref = this.get_timer_ref(ownerID);
	    this.timers.StartUpdate(ref);   
	};    
    
    Acts.prototype.StopUpdate = function ()
	{
        this.exp_MonitorOwnerID = "";
        this.exp_CurTimestamp = null; 
        this.minEndTimestamp = null;        
        this.nextUpdateTimestamp = null;
        
	    this.timers.StopUpdate();    
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.LastOwnerID = function (ret)
	{
		ret.set_string(this.exp_LastOwnerID);
	}; 	
	Exps.prototype.LastTimerName = function (ret)
	{
		ret.set_string(this.exp_LastTimerName);
	};	  

	Exps.prototype.CurTimestamp = function (ret)
	{
		ret.set_int(this.exp_CurTimestamp || 0);
	};	    
}());