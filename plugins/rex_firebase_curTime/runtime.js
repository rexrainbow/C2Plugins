/*
- counter value
*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_CurTime = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_CurTime.prototype;
		
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
        this.updatingPeriod = this.properties[2];  // seconds
        this.lastTimestamp = null;
        this.remainPeriod = 0;
        this.timestamp_ref = null;
        this.curTimestamp = null;
        this.serverTimeOffset = 0;        
        this.lastPredictErr = 0;
        
        
        this.my_timescale = -1.0;                
        this.runtime.tickMe(this);
        
        var self=this;
        var setupFn = function()
        {
            self.serverTimeOffsetDetectingStart();
        };        
        window.FirebaseAddAfterInitializeHandler(setupFn);            
	};
	
	instanceProto.onDestroy = function ()
	{
	};
    
    instanceProto.tick = function()
    {
        if ((this.timestamp_ref === null) || (this.curTimestamp === null))
            return;

        var curTimestamp = (new Date()).getTime(); 
        var dt = curTimestamp - this.lastTimestamp;
        this.lastTimestamp = curTimestamp;
        
        this.curTimestamp += dt;

        var preRemain = this.remainPeriod;
        this.remainPeriod -= (dt/1000);      
        if ((preRemain > 0) && (this.remainPeriod <= 0))
            this.UpdatingTimestamp();           
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
    
    var get_refPath = function (obj)
    {       
        return (!isFirebase3x())?  obj["ref"]() : obj["ref"];
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
        return (!isFirebase3x())?  obj : obj["TIMESTAMP"];
    };    
    // 2.x , 3.x  
    
    // export
    instanceProto.UpdatingTimestamp = function (onComplete)
	{
        var self = this;
        var on_read = function (snapshot)
        {
            var ts = snapshot["val"]();
            if (ts != null)
            {
                var isFirstUpdating = (self.curTimestamp === null);
                ts =  get_timestamp(ts) + self.serverTimeOffset;
                if (self.curTimestamp !== null)
                    self.lastPredictErr = (ts - self.curTimestamp)/1000;
                                
                self.curTimestamp = ts;
                self.remainPeriod = self.updatingPeriod;
                self.lastTimestamp = (new Date()).getTime();
                                
                if (onComplete)
                    onComplete(self.curTimestamp);
                else if (isFirstUpdating)
                    self.runtime.trigger(cr.plugins_.Rex_Firebase_CurTime.prototype.cnds.OnStart, self); 
            }
            else  // run again
                setTimeout(function()
                {
                    self.UpdatingTimestamp();
                },0);
        };
        var on_write = function (error)
        {
            if(!error)            
                self.timestamp_ref["once"]("value", on_read);            
            else  // run again
                setTimeout(function()
                {
                    self.UpdatingTimestamp();
                },0);
        };
        this.timestamp_ref["set"](serverTimeStamp(), on_write);
	};    

    instanceProto.getCurTimestamp = function()
    {
        var ts;
        if (this.curTimestamp)
            ts = this.curTimestamp;
        else
            ts = (new Date()).getTime();
        return ts;
    };
    // export
        
	instanceProto.serverTimeOffsetDetectingStart = function ()
	{
        var self = this;
        var onValueChanged = function (snap)
        {
            self.serverTimeOffset = snap["val"]() || 0;
        };
        
        var p = get_root(this.get_ref()) + "/.info/serverTimeOffset"; 
        var ref = this.get_ref(p);
        ref.on("value", onValueChanged);
	};  
    
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
        var curDate;
        if (this.curTimestamp !== null)
            curDate = (new Date(this.curTimestamp)).toLocaleString();
        else
            curDate = " - ";

		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Current date", "value": curDate},
				{"name": "Last predicted error", "value": this.lastPredictErr},                
			]
		});
	};
	/**END-PREVIEWONLY**/    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.IsUpdating = function ()
	{
	    return (this.curTimestamp != null);
	}; 
    
	Cnds.prototype.OnStart = function ()
	{
	    return true;
	}; 
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
  
    Acts.prototype.SetDomainRef = function (domain_ref, sub_domain_ref)
	{
		this.rootpath = domain_ref + "/" + sub_domain_ref + "/"; 
	};
  
    Acts.prototype.Start = function (userID)
	{
        this.timestamp_ref = this.get_ref(userID);
        this.UpdatingTimestamp();
	};    
  
    Acts.prototype.Stop = function ()
	{
        this.timestamp_ref = null;    
        this.curTimestamp = null;        
	};        
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.Timestamp = function (ret)
	{
	    ret.set_int(Math.floor(this.getCurTimestamp()));
	};    
    
	Exps.prototype.LastPredictedError = function (ret)
	{
	    ret.set_float(this.lastPredictErr);
	};       
}());