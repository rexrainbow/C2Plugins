// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Date = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Date.prototype;
		
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
	    this.timers = {};
        /*
        {
            "state":1=run, 0=paused
            "start": timstamp, updated when resumed
            "acc": delta-time, updated when paused
        }
        */
	};

    var startTimer = function(timer, curTimestamp)
    {        
        if (!timer)
            timer = {};
        
        if (!curTimestamp)
            curTimestamp = (new Date()).getTime();
        
        timer["state"] = 1;        
        timer["start"] = curTimestamp;
        timer["acc"] = 0; 
        return timer;
    };
    var getElapsedTime = function(timer)
    {
        if (!timer)
            return 0;
        
        var deltaTime = timer["acc"];
        if (timer["state"] === 1)
        {
            var curTime = (new Date()).getTime();
            deltaTime += (curTime - timer["start"]);
        }
        return deltaTime;
    };
    var pauseTimer = function(timer)
    {
        if ((!timer) || (timer["state"] === 0))
            return;

        timer["state"] = 0;
        
        var curTime = (new Date()).getTime();
        timer["acc"] += (curTime - timer["start"]);
    };
    var resumeTimer = function(timer)
    {
        if ((!timer) || (timer["state"] === 1))
            return;

        timer["state"] = 1;
        timer["start"] = (new Date()).getTime();        
    };    
        
	var getDate = function (timestamp)
	{
		return (timestamp != null)? new Date(timestamp): new Date();
	};

    instanceProto.saveToJSON = function ()
	{    
		return { "tims": this.timers,
                };
	};
	instanceProto.loadFromJSON = function (o)
	{	    
		this.timers = o["tims"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.StartTimer = function (name)
	{
        this.timers[name] = startTimer(this.timers[name]);
	};	
    
	Acts.prototype.PauseTimer = function (name)
	{
        pauseTimer(this.timers[name]);
	};	
    
	Acts.prototype.ResumeTimer = function (name)
	{
        resumeTimer(this.timers[name]);
	};	    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.Year = function (ret, timestamp)
	{
		ret.set_int(getDate(timestamp).getFullYear());
	};
	
	Exps.prototype.Month = function (ret, timestamp)
	{
	    ret.set_int(getDate(timestamp).getMonth()+1);
	};
	
	Exps.prototype.Date = function (ret, timestamp)
	{
	    ret.set_int(getDate(timestamp).getDate());
	};	
	
	Exps.prototype.Day = function (ret, timestamp)
	{
	    ret.set_int(getDate(timestamp).getDay());
	};	
	
	Exps.prototype.Hours = function (ret, timestamp)
	{
	    ret.set_int(getDate(timestamp).getHours());
	};	

	Exps.prototype.Minutes = function (ret, timestamp)
	{
	    ret.set_int(getDate(timestamp).getMinutes());
	};	
	
	Exps.prototype.Seconds = function (ret, timestamp)
	{
	    ret.set_int(getDate(timestamp).getSeconds());
	};	

	Exps.prototype.Milliseconds = function (ret, timestamp)
	{
	    ret.set_int(getDate(timestamp).getMilliseconds());
	};	
	
	Exps.prototype.Timer = function (ret, name)
	{
		ret.set_float(getElapsedTime(this.timers[name])/1000);
	};	

	Exps.prototype.CurTicks = function (ret)
	{
	    var today = new Date();
        ret.set_int(today.getTime());
	};	

	Exps.prototype.UnixTimestamp = function (ret, year, month, day, hours, minutes, seconds, milliseconds)
	{
        var d;
        if (year == null)
        {
            d = new Date();
        }
        else
        {
            month = month || 1;
            day = day || 1;
            hours = hours || 0;
            minutes = minutes || 0;
            seconds = seconds || 0;
            milliseconds = milliseconds || 0;
            d = new Date(year, month-1, day, hours, minutes, seconds, milliseconds); 
        }
        ret.set_float(d.getTime());
	};

	Exps.prototype.Date2UnixTimestamp = function (ret, year, month, day, hours, minutes, seconds, milliseconds)
	{        
        year = year || 2000;
        month = month || 1;
        day = day || 1;
        hours = hours || 0;
        minutes = minutes || 0;
        seconds = seconds || 0;
        milliseconds = milliseconds || 0;
        var timestamp = new Date(year, month-1, day, hours, minutes, seconds, milliseconds); // build Date object
        ret.set_float(timestamp.getTime());
	};
	
    Exps.prototype.LocalExpression = function (ret, timestamp, locales)
	{
	    ret.set_string( getDate(timestamp).toLocaleString(locales) );
	};	
}());