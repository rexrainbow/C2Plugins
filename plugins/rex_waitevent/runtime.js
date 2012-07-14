// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_WaitEvent = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_WaitEvent.prototype;
		
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
	    this.events = {};
		this._current_finished_event_name = "";
	};   
	
	var is_hash_empty = function(hash_obj)
	{
	    var k;
		var is_empty = true;
		for (k in hash_obj)
		{
		    is_empty = false;
			break;
		}
		return is_empty;
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      

	Cnds.prototype.OnAllEventsFinished = function()
	{    
		return true;
	};

	Cnds.prototype.OnAnyEventFinished = function()
	{    
		return true;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.WaitEvent = function(event_name, tag)
	{       
	    if (this.events[tag] == null)
		    this.events[tag] = {};
	    this.events[tag][event_name] = true;
	};  

	Acts.prototype.EventFinished = function(event_name, tag)
	{       
	    if ((this.events[tag] == null) || (this.events[tag][event_name] == null))
		    return;
	    delete this.events[tag][event_name];
		this._current_finished_event_name = event_name;
		this.runtime.trigger(cr.plugins_.Rex_WaitEvent.prototype.cnds.OnAnyEventFinished, this); 
		if (is_hash_empty(this.events[tag]))
		{
		    this.runtime.trigger(cr.plugins_.Rex_WaitEvent.prototype.cnds.OnAllEventsFinished, this); 
			delete this.events[tag];
        }
	};  	
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.CurEventName = function(ret)
	{   
		ret.set_string(this._current_finished_event_name);         
	}; 
}());