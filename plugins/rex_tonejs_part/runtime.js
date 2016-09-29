// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_part = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_part.prototype;
		
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
        this.loopCnt = this.properties[0];

        this.part = null;
        this.eventObj = {};
        this.exp_TrigTime = 0;
        this.exp_TrigValue = "";
	};
    
	instanceProto.onDestroy = function ()
	{
        if (this.part)
        {
            this.part["dispose"]();
            this.part = null;
        }
	};   
    
	instanceProto.getPart = function (events)
	{
        // create a new part
        if (events != null)
            this.part = null;
        
        // return current part
        else if (this.part !== null)        
            return this.part;
        
        // create a new part with empty events
        else
            events = [];  

        var self=this;
        var callback = function(time, value)
        {
            self.exp_TrigTime = time;
            self.exp_TrigValue = value;            
            self.runtime.trigger(cr.plugins_.Rex_ToneJS_part.prototype.cnds.OnEvent, self); 
        };
        this.part = new window["Tone"]["Part"](callback, events);
        this.part["loop"] = (this.loopCnt === 0)? true : this.loopCnt;
        
        return this.part;
	};     

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnEvent = function ()
	{
        return true;  
	};	    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.Start = function (time)
	{
        this.getPart()["start"](time);      
	};      

	Acts.prototype.Stop = function (time)
	{
        this.getPart()["stop"](time);      
	};    
    
	Acts.prototype.Reload = function (events)
	{
        try
        {
            events = JSON.parse(events);
        }
        catch(e)
        {
            return;
        }
        this.getPart(events);      
	}; 
	Acts.prototype.RemoveAll = function ()
	{
        this.getPart()["removeAll"]();      
	}; 

	Acts.prototype.Remove = function (time)
	{
        this.getPart()["remove"](time);      
	};  
    
	Acts.prototype.PrepareEvent = function (name, value)
	{ 
        this.eventObj[name] = value;
	}; 
    
	Acts.prototype.Add = function (time)
	{
        this.getPart()["add"](time, this.eventObj);  
        this.eventObj = {};
	};    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.Progress = function (ret)
	{
		ret.set_float(this.getPart()["progress"]);
	};
    
	Exps.prototype.Time = function (ret)
	{
		ret.set_any(this.exp_TrigTime);
	};
    
	Exps.prototype.Value = function (ret, k, default_value)
	{
		ret.set_any(window.ToneJSGetItemValue( this.exp_TrigValue, k, default_value) );
	};    

	Exps.prototype.At = function (ret, time, k, default_value)
	{
        var event = this.getPart()["at"](time);
		ret.set_any( window.ToneJSGetItemValue( event, k, default_value) );
	};

    
}());