// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_dateInARow = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_dateInARow.prototype;
		
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
        this.dateVars = {};  // [lastTimestamp, count, previousCount]
	};
    
    var year_diff = function(t1, t0)
	{ 
        var date1=new Date(t1), date0=new Date(t0);
        return date1.getFullYear() - date0.getFullYear();
	}; 
    var month_diff = function(t1, t0)
	{ 
        var date1=new Date(t1), date0=new Date(t0);
        var y_diff = date1.getFullYear() - date0.getFullYear();
        var m_diff = date1.getMonth() - date0.getMonth();       
        return (y_diff * 12) + m_diff;
	};   
    var day_diff = function(t1, t0)
	{ 
        var date1=new Date(t1), date0=new Date(t0);
        var y1=date1.getFullYear(), y0=date0.getFullYear();
        var m1=date1.getMonth(), m0=date0.getMonth();
        var d1=date1.getDate(), d0=date0.getDate();
        var alis_t1 = new Date(y1, m1, d1, 0, 0, 0, 0);
        var alis_t0 = new Date(y0, m0, d0, 0, 0, 0, 0);
        var alis_diff = alis_t1 - alis_t0;
        return alis_diff/(1000*60*60*24);
	};
    var hour_diff = function(t1, t0)
	{ 
        var date1=new Date(t1), date0=new Date(t0);
        var y1=date1.getFullYear(), y0=date0.getFullYear();
        var m1=date1.getMonth(), m0=date0.getMonth();
        var d1=date1.getDate(), d0=date0.getDate();
        var h1=date1.getHours(), h0=date0.getHours();
        var alis_t1 = new Date(y1, m1, d1, h1, 0, 0, 0);
        var alis_t0 = new Date(y0, m0, d0, h0, 0, 0, 0);
        var alis_diff = alis_t1 - alis_t0;
        return alis_diff/(1000*60*60);
	};    
    var minute_diff = function(t1, t0)
	{ 
        var date1=new Date(t1), date0=new Date(t0);
        var y1=date1.getFullYear(), y0=date0.getFullYear();
        var mo1=date1.getMonth(), mo0=date0.getMonth();
        var d1=date1.getDate(), d0=date0.getDate();
        var h1=date1.getHours(), h0=date0.getHours();
        var m1=date1.getMinutes(), m0=date0.getMinutes();        
        var alis_t1 = new Date(y1, mo1, d1, h1, m1, 0, 0);
        var alis_t0 = new Date(y0, mo0, d0, h0, m0, 0, 0);
        var alis_diff = alis_t1 - alis_t0;
        return alis_diff/(1000*60);
	};     
	instanceProto.date_diff = function(t1, t0, scale)
	{ 
        var inc;
        switch(scale)
        {
        case 0: inc = year_diff(t1, t0);  break;
        case 1: inc = month_diff(t1, t0);  break;
        case 2: inc = day_diff(t1, t0);  break;
        case 3: inc = hour_diff(t1, t0);  break;
        case 4: inc = minute_diff(t1, t0);  break;        
        }
        return Math.floor(inc);
	};

	instanceProto.saveToJSON = function ()
	{       	 
		return { "vars": this.dateVars
                 };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.dateVars = o["vars"];
	};

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    var prop = [];
        var dateVar, val;
        for (var n in this.dateVars)
        {
            dateVar = this.dateVars[n];
            val = new Date(dateVar[0]).toLocaleString() + " >> " + dateVar[1];
	        prop.push({"name": n, "value": val});
        }
		propsections.push({
			"title": this.type.name,
			"properties": prop
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/      
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	 
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.Paste = function (varName, timestamp, scale)
	{
        var dateVar = this.dateVars[varName];
	    if (!dateVar)
	    {
	        dateVar = [];
            dateVar.push(timestamp);  // lastTimestamp
            dateVar.push(0);          // count
            dateVar.push(0);          // previous count
            this.dateVars[varName] = dateVar;  
	    }
	    else
	    {
            var lastTimestamp = dateVar[0];
            var inc = this.date_diff(timestamp, lastTimestamp, scale);    
            dateVar[0] = timestamp;            
            dateVar[2] = dateVar[1];   // update previous count
            if (inc === 1) 
                dateVar[1] += 1;
            else if (inc !== 0)
                dateVar[1] = 0;
	    }        
	};
    
    Acts.prototype.Remove = function (varName)
	{
        if (this.dateVars.hasOwnProperty(varName))
            delete this.dateVars[varName];
	}; 
    Acts.prototype.RemoveAll = function ()
	{
        for (var n in this.dateVars)
            delete this.dateVars[n];        
	};
    
	Acts.prototype.JSONLoad = function (json_)
	{
		var o;
		
		try {
			o = JSON.parse(json_);
		}
		catch(e) { return; }
		
		this.loadFromJSON(o);		
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.ContinuousCount = function (ret, varName)
	{
	    var dateVar = this.dateVars[varName];   
	    var count = (dateVar)? dateVar[1]:0;
		ret.set_int(count);
	};

	Exps.prototype.LastTimestamp = function (ret, varName)
	{
	    var dateVar = this.dateVars[varName];   
	    var timestamp = (dateVar)? dateVar[0]:0;
		ret.set_float(timestamp);
	};

	Exps.prototype.PreviousContinuousCount = function (ret, varName)
	{
	    var dateVar = this.dateVars[varName];   
	    var count = (dateVar)? dateVar[2]:0;
		ret.set_int(count);
	};    
	Exps.prototype.AsJSON = function (ret)
	{
		ret.set_string(JSON.stringify(this.saveToJSON()));
	};    
}());