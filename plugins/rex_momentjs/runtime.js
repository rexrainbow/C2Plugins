// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_MomenJS = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_MomenJS.prototype;
		
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
        this.moment = null;
	};
	instanceProto.getMoment = function(clone)
	{
        var m;
        if (this.moment === null)
            m = this.moment = window["moment"]();
        else if (clone)
            m = this.moment["clone"]();
        else
            m = this.moment;

        return m;
	};        
    instanceProto.saveToJSON = function ()
	{    
		return { "m": (this.moment === null)? null: this.moment["toString"](),
                };
	};
	instanceProto.loadFromJSON = function (o)
	{	    
        this.moment = null;
        if ( o["m"] !== null)
            this.moment = window["moment"]( o["m"] );
	};
    
    var momentOutput = function(m, f)
    {
        var val;
        if (f == null)
            val = m["valueOf"](); 
        else if (f.toLowerCase() === "iso")
            val = m["toISOString"]();
        else
            val = m["format"](f);    

        return val;        
    }
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	
	Cnds.prototype.DateStringIsValid = function (d, f, rm)
	{
	    return window["moment"](d, f, (rm===1) )["isValid"]();
	};    
	
	Cnds.prototype.IsLeapYear = function ()
	{
	    return this.getMoment()["isLeapYear"]();
	}; 	  
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.SetToCurrentDate = function ()
	{
	    this.moment = window["moment"]();
	};	
	Acts.prototype.SetFromUnixTimestamp = function (d)
	{
	    this.moment = window["moment"](d);
	};	
	Acts.prototype.SetFromString = function (d, f)
	{
	    this.moment = (f === "")? window["moment"](d) : window["moment"](d, f);
	};	    
	Acts.prototype.Clone = function (momentType)
	{
        var inst = momentType.getFirstPicked();
        var m = (inst != null)? inst.moment : null;
        if (!window["moment"]["isMoment"](m))
            return;
        
	    this.moment = window["moment"](inst.moment);
	};    
    var TYPE2STRING = ["years", "quarters", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
    
	Acts.prototype.SetComponent = function (amount, type_)
	{
	    this.getMoment()["set"](TYPE2STRING[type_], amount);
	};    
    
	Acts.prototype.Add = function (amount, type_)
	{
		if (typeof(type_) === "number")
		    type_ = TYPE2STRING[type_];
	    
	    this.getMoment()["add"](amount, type_);
	};	  
    
	Acts.prototype.SetLocale = function (locale)
	{
        this.getMoment()["locale"](locale);
	};	      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.Year = function (ret)
	{
        var y = this.getMoment()["year"]();
		ret.set_int(y);
	};
	
	Exps.prototype.Month = function (ret)
	{
        var m = this.getMoment()["month"]();
		ret.set_int(m);
	};
	
	Exps.prototype.Date = function (ret)
	{
        var d = this.getMoment()["date"]();
		ret.set_int(d);
	};	
	
	Exps.prototype.Day = function (ret)
	{
        var d = this.getMoment()["day"]();
		ret.set_int(d);
	};	
	
	Exps.prototype.Hours = function (ret)
	{
        var h = this.getMoment()["hour"]();
		ret.set_int(h);
	};	

	Exps.prototype.Minutes = function (ret)
	{
        var h = this.getMoment()["minute"]();
		ret.set_int(h);
	};	
	
	Exps.prototype.Seconds = function (ret)
	{
        var s = this.getMoment()["second"]();
		ret.set_int(s);
	};	

	Exps.prototype.Milliseconds = function (ret)
	{
        var ms = this.getMoment()["millisecond"]();
		ret.set_int(ms);
	};	
    
    Exps.prototype.UnixTimestamp = function (ret)
	{
        var ts = this.getMoment()["valueOf"]();
		ret.set_int(ts);
	};
 
    Exps.prototype.Format = function (ret, f)
	{
        if (f == null)
            f = "";
        var m = this.getMoment();
        ret.set_string(momentOutput(m, f));
	};
 
    Exps.prototype.ISO = function (ret)
	{
        var m = this.getMoment();
        ret.set_string(momentOutput(m, "iso"));
	};    
    
    Exps.prototype.DaysInMonth = function (ret)
	{
        var d = this.getMoment()["daysInMonth"]();
		ret.set_int(d);
	};       
    
    Exps.prototype.ElapsedYears = function (ret, prev, isFloat)
	{
        prev = window["moment"](prev);
        isFloat = (isFloat === 1);
        var d = -prev.diff(this.getMoment(), "years", isFloat);        
		ret.set_float(d);
	}; 
    Exps.prototype.ElapsedMonths = function (ret, prev, isFloat)
	{
        prev = window["moment"](prev);
        isFloat = (isFloat === 1);        
        var d = -prev.diff(this.getMoment(), "months", isFloat);             
		ret.set_float(d);
	};
    Exps.prototype.ElapsedDays = function (ret, prev, isFloat)
	{
        prev = window["moment"](prev);
        isFloat = (isFloat === 1);        
        var d = -prev.diff(this.getMoment(), "days", isFloat);             
		ret.set_float(d);
	};      
    Exps.prototype.ElapsedHours = function (ret, prev, isFloat)
	{
        prev = window["moment"](prev);
        isFloat = (isFloat === 1);        
        var d = -prev.diff(this.getMoment(), "hours", isFloat);             
		ret.set_float(d);
	}; 
    Exps.prototype.ElapsedMinutes = function (ret, prev, isFloat)
	{
        prev = window["moment"](prev);
        isFloat = (isFloat === 1);        
        var d = -prev.diff(this.getMoment(), "minutes", isFloat);             
		ret.set_float(d);
	}; 
    Exps.prototype.ElapsedSeconds = function (ret, prev, isFloat)
	{
        prev = window["moment"](prev);
        isFloat = (isFloat === 1);        
        var d = -prev.diff(this.getMoment(), "seconds", isFloat);           
		ret.set_float(d);
	};     
    Exps.prototype.ElapsedMilliseconds = function (ret, prev)
	{
        prev = window["moment"](prev);
        var d = -prev.diff(this.getMoment(), "milliseconds");           
		ret.set_float(d);
	};     
    
    Exps.prototype.StartOfYear = function (ret, f)
	{
        var m = this.getMoment(true)["startOf"]("year");
		ret.set_any(momentOutput(m, f));
	}; 
    Exps.prototype.StartOfMonth = function (ret, f)
	{
        var m = this.getMoment(true)["startOf"]("month");
		ret.set_any(momentOutput(m, f));
	};     
    Exps.prototype.StartOfQuarter = function (ret, f)
	{
        var m = this.getMoment(true)["startOf"]("quarter");
		ret.set_any(momentOutput(m, f));
	};         
    Exps.prototype.StartOfWeek = function (ret, f)
	{
        var m = this.getMoment(true)["startOf"]("week");
		ret.set_any(momentOutput(m, f));
	};      
    Exps.prototype.StartOfDate = function (ret, f)
	{
        var m = this.getMoment(true)["startOf"]("date");
		ret.set_any(momentOutput(m, f));
	};  
    Exps.prototype.StartOfHour = function (ret, f)
	{
        var m = this.getMoment(true)["startOf"]("hour");
		ret.set_any(momentOutput(m, f));
	};  
    Exps.prototype.StartOfMinute = function (ret, f)
	{
        var m = this.getMoment(true)["startOf"]("minute");
		ret.set_any(momentOutput(m, f));
	};  
    Exps.prototype.StartOfSecond = function (ret, f)
	{
        var m = this.getMoment(true)["startOf"]("second");
		ret.set_any(momentOutput(m, f));
	};  
    Exps.prototype.StartOfISOWeek = function (ret, f)
	{
        var m = this.getMoment(true)["startOf"]("isoWeek");
		ret.set_any(momentOutput(m, f));
	};  
    
    
    Exps.prototype.EndOfYear = function (ret, f)
	{
        var m = this.getMoment(true)["endOf"]("year");
		ret.set_any(momentOutput(m, f));
	}; 
    Exps.prototype.EndOfMonth = function (ret, f)
	{
        var m = this.getMoment(true)["endOf"]("month");
		ret.set_any(momentOutput(m, f));
	};      
    Exps.prototype.EndOfQuarter = function (ret, f)
	{
        var m = this.getMoment(true)["endOf"]("quarter");
		ret.set_any(momentOutput(m, f));
	}; 
    Exps.prototype.EndOfWeek = function (ret, f)
	{
        var m = this.getMoment(true)["endOf"]("week");
		ret.set_any(momentOutput(m, f));
	}; 
    Exps.prototype.EndOfDate = function (ret, f)
	{
        var m = this.getMoment(true)["endOf"]("date");
		ret.set_any(momentOutput(m, f));
	}; 
    Exps.prototype.EndOfHour = function (ret, f)
	{
        var m = this.getMoment(true)["endOf"]("hour");
		ret.set_any(momentOutput(m, f));
	};
    Exps.prototype.EndOfMinute = function (ret, f)
	{
        var m = this.getMoment(true)["endOf"]("minute");
		ret.set_any(momentOutput(m, f));
	};    
    Exps.prototype.EndOfSecond = function (ret, f)
	{
        var m = this.getMoment(true)["endOf"]("second");
		ret.set_any(momentOutput(m, f));
	};     
    Exps.prototype.EndOfISOWeek = function (ret, f)
	{
        var m = this.getMoment(true)["endOf"]("isoWeek");
		ret.set_any(momentOutput(m, f));
	}; 
    
    
    Exps.prototype.Locale = function (ret)
	{
        var l = this.getMoment()["locale"]()
		ret.set_string(l);
	};     
}());