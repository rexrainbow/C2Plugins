/*
<ownerID>
    <timerName>
        start - timestamp of start
        current - timestamp of current     
        time-out - interval of time-out
*/


// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_Timer = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_Timer.prototype;
		
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
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/"; 
	    
	    this.exp_LastOwnerID = "";
	    this.exp_LastTimerName = "";
        this.exp_LastTimer = null;    
	};
	
	instanceProto.onDestroy = function ()
	{		
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
    
    var newTimerDate = function (interval)
    {
        var t = {"start": serverTimeStamp(),
		             "current": serverTimeStamp(),
                    "time-out": interval};
        return t;
    }
    instanceProto.start_timer = function(ref, interval, handler)
    {
		ref["set"](newTimerDate(interval), handler);
    };   

    var get_deltaTime = function (timer)    
    {
        var t;
        if (timer)
            t = get_timestamp(timer["current"]) - get_timestamp(timer["start"]);
        else
            t = 0;
        
        return t;
    }
 		     
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
            
        var t = get_deltaTime(this.exp_LastTimer);
	    return (t/1000) > this.exp_LastTimer["time-out"];
	};	
	
	Cnds.prototype.IsValid = function ()
	{
        return (this.exp_LastTimer != null);
	};	    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.SetDomainRef = function (domain_ref, sub_domain_ref)
	{
		this.rootpath = domain_ref + "/" + sub_domain_ref + "/";
	};
	
    Acts.prototype.StartTimer = function (ownerID, timer_name, interval)
	{  
	    var ref = this.get_ref()["child"](ownerID)["child"](timer_name);
	    
	    var self = this;
	    //2. read timer back	    
	    var on_read = function (snapshot)
	    {
	        self.exp_LastOwnerID = ownerID;
	        self.exp_LastTimerName = timer_name;
	        
            self.exp_LastTimer = snapshot["val"]();
	        self.runtime.trigger(cr.plugins_.Rex_Firebase_Timer.prototype.cnds.OnStartTimerComplete, self); 
	    };	   
	    var read_timer = function()
	    {
	        ref["once"]("value", on_read);
	    };
        //2. read timer back	
        
        //1. start timer
	    var onComplete = function(error) 
	    {
            if (error)
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Timer.prototype.cnds.OnStartTimerError, self); 
            else
                read_timer();	        
        };
        	    		
        this.start_timer(ref, interval, onComplete);
        //1. start timer        
	};
	
    Acts.prototype.GetTimer = function (ownerID, timer_name, interval)
	{
        var startIfNotExists = (interval != null);
        var isNewTimer = false;
	    var ref = this.get_ref()["child"](ownerID)["child"](timer_name);
	    var self = this;
	    
	    //3. read timer back	    
	    var on_read = function (snapshot)
	    {
	        self.exp_LastOwnerID = ownerID;
	        self.exp_LastTimerName = timer_name;
	        
            self.exp_LastTimer = snapshot["val"]();
            
            if (isNewTimer)
	            self.runtime.trigger(cr.plugins_.Rex_Firebase_Timer.prototype.cnds.OnStartTimerComplete, self);
            
	        self.runtime.trigger(cr.plugins_.Rex_Firebase_Timer.prototype.cnds.OnGetTimerComplete, self); 
	    };	   
	    var read_timer = function()
	    {
	        ref["once"]("value", on_read);
	    };
        //3. read timer back	    	    
	    
        //2. update timer / start timer	    
	    var on_update = function(error) 
	    {
	        if (error)
	        {
	            self.exp_LastOwnerID = ownerID;
	            self.exp_LastTimerName = timer_name;	            
	            self.runtime.trigger(cr.plugins_.Rex_Firebase_Timer.prototype.cnds.OnGetTimerError, self); 
	            return;	            
	        }
	        
	        read_timer();
        };        
        var update_timer = function()
        {
		    var t = {"current": serverTimeStamp()};
		    ref["update"](t, on_update);
        };        
        var start_timer = function()
        {
            isNewTimer = true;
            self.start_timer(ref, interval, on_update);
        };
        //2. update timer 
        
        //1. check if timer is existed
	    var on_exist_check = function (snapshot)
	    {
	        if (snapshot["val"]())
	            update_timer();	   
	        else if (startIfNotExists)
	            start_timer();     
            else
                on_read(snapshot);
	    };
        ref["once"]("value", on_exist_check);
        //1. check if timer is existed
	};	
	
    Acts.prototype.RemoveTimer = function (ownerID, timer_name)
	{
	    var ref = this.get_ref()["child"](ownerID)["child"](timer_name);
	    
	    var self = this;
	    var onComplete = function(error) 
	    {
	        self.exp_LastOwnerID = ownerID;
	        self.exp_LastTimerName = timer_name;	        
	        var trig = (error)? cr.plugins_.Rex_Firebase_Timer.prototype.cnds.OnRemoveTimerError:
	                            cr.plugins_.Rex_Firebase_Timer.prototype.cnds.OnRemoveTimerComplete;
	        self.runtime.trigger(trig, self); 
        };

		ref["remove"](onComplete)
	};	
	
    Acts.prototype.StartTimerWhenDisconnect = function (ownerID, timer_name, interval)
	{
	    var ref = this.get_ref()["child"](ownerID)["child"](timer_name);	    
        ref["onDisconnect"]()["set"](newTimerDate(interval));
	};	

    Acts.prototype.DeleteTimerWhenDisconnect = function (ownerID, timer_name, interval)
	{
	    var ref = this.get_ref()["child"](ownerID)["child"](timer_name);
        ref["onDisconnect"]()["remove"]();
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
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
        var t;
        if (this.exp_LastTimer)        
            t = get_timestamp(this.exp_LastTimer["start"]);
 
		ret.set_float(t || 0);
	}; 	
	Exps.prototype.LastCurrentTimestamp = function (ret)
	{
        var t;
        if (this.exp_LastTimer)        
            t = get_timestamp(this.exp_LastTimer["current"]);

		ret.set_float(t || 0);
	}; 	    
	Exps.prototype.LastElapsedTime = function (ret)
	{
        var t;
        if (this.exp_LastTimer)        
            t = get_deltaTime(this.exp_LastTimer)/1000;
    
		ret.set_float(t || 0);
	};
	Exps.prototype.LastTimeoutInterval = function (ret)
	{
        var t;
        if (this.exp_LastTimer)        
            t = this.exp_LastTimer["time-out"];
  
		ret.set_float(t || 0);
	};
	Exps.prototype.LastRemainInterval = function (ret)
	{ 
        var t;
        if (this.exp_LastTimer)        
            t = this.exp_LastTimer["time-out"] - get_deltaTime(this.exp_LastTimer)/1000;

		ret.set_float(t || 0);
	};	
	
	Exps.prototype.LastOwnerID = function (ret)
	{
		ret.set_string(this.exp_LastOwnerID);
	}; 		
}());