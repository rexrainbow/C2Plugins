/*
<userID>
    <timerName>
        start - timestamp of start
        current - timestamp of current     
    
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
	    jsfile_load("firebase.js");
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
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/"; 
	    
	    this.exp_LastUserID = "";
	    this.exp_LastTimerName = "";
        this.exp_LastTimer = null;    
	};
	
	instanceProto.onDestroy = function ()
	{		
	};

	instanceProto.get_ref = function(k)
	{
	    if (k == null)
	        k = "";
	        
	    var path;
	    if (k.substring(0,8) == "https://")
	        path = k;
	    else
	        path = this.rootpath + k + "/";
	        
        return new window["Firebase"](path);
	};
    
    instanceProto.start_timer = function(ref, interval, handler)
    {
		var t = {"start": window["Firebase"]["ServerValue"]["TIMESTAMP"],
		         "current": window["Firebase"]["ServerValue"]["TIMESTAMP"],
                 "time-out": interval};
		ref["set"](t, handler);
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
            
        var t = this.exp_LastTimer["current"]-this.exp_LastTimer["start"];        
	    return (t/1000) > this.exp_LastTimer["time-out"];
	};		    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.SetDomainRef = function (domain_ref, sub_domain_ref)
	{
		this.rootpath = domain_ref + "/" + sub_domain_ref + "/";
	};
	
    Acts.prototype.StartTimer = function (userID, timer_name, interval)
	{  
	    var ref = this.get_ref()["child"](userID)["child"](timer_name);
	    
	    var self = this;
	    //2. read timer back	    
	    var on_read = function (snapshot)
	    {
	        self.exp_LastUserID = userID;
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
	
    Acts.prototype.GetTimer = function (userID, timer_name, interval)
	{
	    var ref = this.get_ref()["child"](userID)["child"](timer_name);

	    var self = this;
	    
	    //3. read timer back	    
	    var on_read = function (snapshot)
	    {
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timer_name;
	        
            self.exp_LastTimer = snapshot["val"]();
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
	            self.exp_LastUserID = userID;
	            self.exp_LastTimerName = timer_name;	            
	            self.runtime.trigger(cr.plugins_.Rex_Firebase_Timer.prototype.cnds.OnGetTimerError, self); 
	            return;	            
	        }
	        
	        read_timer();
        };        
        var update_timer = function()
        {
		    var t = {"current": window["Firebase"]["ServerValue"]["TIMESTAMP"]};
		    ref["update"](t, on_update);
        };        
        var start_timer = function()
        {
            self.start_timer(ref, interval, on_update);
        };
        //2. update timer 
        
        //1. check if timer is existed
	    var on_exist_check = function (snapshot)
	    {
	        if (snapshot["val"]())
	            update_timer();	   
	        else
	            start_timer();     
	    };
        ref["once"]("value", on_exist_check);
        //1. check if timer is existed
	};	
	
    Acts.prototype.RemoveTimer = function (userID, timer_name)
	{
	    var ref = this.get_ref()["child"](userID)["child"](timer_name);
	    
	    var self = this;
	    var onComplete = function(error) 
	    {
	        self.exp_LastUserID = userID;
	        self.exp_LastTimerName = timer_name;	        
	        var trig = (error)? cr.plugins_.Rex_Firebase_Timer.prototype.cnds.OnRemoveTimerError:
	                            cr.plugins_.Rex_Firebase_Timer.prototype.cnds.OnRemoveTimerComplete;
	        self.runtime.trigger(trig, self); 
        };

		ref["remove"](onComplete);
	};	
	
    Acts.prototype.StartTimerWhenDisconnect = function (userID, timer_name, interval)
	{
	    var ref = this.get_ref()["child"](userID)["child"](timer_name);
	    
	    var self = this;

        //2. set OnDisconnect	  
		var set_on_disconnect = function ()
		{
		    var t = {"start": window["Firebase"]["ServerValue"]["TIMESTAMP"],
		             "current": window["Firebase"]["ServerValue"]["TIMESTAMP"],
                     "time-out": interval};
		    ref["onDisconnect"]()["set"](t);
		};
		//2. set OnDisconnect
				
	    //1. read timer	    
	    var on_read = function (snapshot)
	    {
	        set_on_disconnect();
	    };	   
	    var read_timer = function()
	    {
	        ref["once"]("value", on_read);
	    };
	    read_timer();
        //1. read timer        
	};	

    Acts.prototype.DeleteTimerWhenDisconnect = function (userID, timer_name, interval)
	{
	    var ref = this.get_ref()["child"](userID)["child"](timer_name);
	    
	    var self = this;

        //2. set OnDisconnect	  
		var set_on_disconnect = function ()
		{
		    ref["onDisconnect"]()["remove"]();
		};
		//2. set OnDisconnect
				
	    //1. read timer	    
	    var on_read = function (snapshot)
	    {
	        set_on_disconnect();
	    };	   
	    var read_timer = function()
	    {
	        ref["once"]("value", on_read);
	    };
	    read_timer();
        //1. read timer        
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
            t = this.exp_LastTimer["start"];
        else
            t = 0;     
		ret.set_float(t);
	}; 	
	Exps.prototype.LastCurrentTimestamp = function (ret)
	{
        var t;
        if (this.exp_LastTimer)        
            t = this.exp_LastTimer["current"];
        else
            t = 0;       
		ret.set_float(t);
	}; 	    
	Exps.prototype.LastElapsedTime = function (ret)
	{
        var t;
        if (this.exp_LastTimer)        
            t = this.exp_LastTimer["current"]-this.exp_LastTimer["start"];
        else
            t = 0;     
		ret.set_float(t/1000);
	};
	Exps.prototype.LastTimeoutInterval = function (ret)
	{
        var t;
        if (this.exp_LastTimer)        
            t = this.exp_LastTimer["time-out"];
        else
            t = 0;    
		ret.set_float(t/1000);
	};
	Exps.prototype.LastRemainInterval = function (ret)
	{
        var t;
        if (this.exp_LastTimer)        
            t = this.exp_LastTimer["current"]-this.exp_LastTimer["start"] - this.exp_LastTimer["time-out"];
        else
            t = 0;
		ret.set_float(t/1000);
	};	
}());