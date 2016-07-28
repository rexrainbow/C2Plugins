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
		this.exp_EventName = "";
        this.exp_Tag = null;
	};   
	
	var isEmpty = function(o)
	{
		for (var k in o)		
		    return false;
		
		return true;
	};
    instanceProto.saveToJSON = function ()
	{    
		return { "evts": this.events,
                 "ename": this.exp_EventName,
                 "tag": this.exp_Tag,
                };
	};
	instanceProto.loadFromJSON = function (o)
	{	    
		this.events = o["evts"];	
        this.exp_EventName = o["ename"];
        this.exp_Tag = o["tag"];
	};
    
	instanceProto.eventExist = function (event_name, tag)
	{	    
        return (this.events[tag] != null) && (this.events[tag][event_name] != null);
	};    
    
	instanceProto.runTrigEvent = function (method, tag, event_name)
	{	    
        this.exp_EventName = event_name; 
        this.exp_Tag = tag;
        this.runtime.trigger(method, this); 
        this.exp_Tag = null;
	};    
    

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    var cur_event_list = [];
	    var tag, name, _evts;
	    for (tag in this.events)
	    {
	        _evts = this.events[tag];
	        for (name in _evts)
	        {
	            cur_event_list.push({"name": tag+"-"+name, "value": ""});
	        }
	    }
		propsections.push({
			"title": this.type.name,
			"properties": cur_event_list
		});
	};
	/**END-PREVIEWONLY**/
	
    //////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      

	Cnds.prototype.OnAllEventsFinished = function(tag)
	{    
		return (this.exp_Tag === tag);
	};

	Cnds.prototype.OnAnyEventFinished = function(tag)
	{    
		return (this.exp_Tag === tag);
	};

	Cnds.prototype.NoWaitEvent = function(tag)
	{
		var e=this.events[tag];
		if (e == null)
		    return true;
		var k;
		for (k in e)
		{
		    return false;
		}
		return true;
	};	

	Cnds.prototype.OnAnyEventStart = function()
	{    
		return true;
	};	

	Cnds.prototype.IsWaiting = function(event_name, tag)
	{
		return (this.events[tag] && this.events[tag][event_name]);
	};	    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.WaitEvent = function(event_name, tag)
	{       
	    if (!this.events.hasOwnProperty(tag))
		    this.events[tag] = {};
        
        if (this.events[tag].hasOwnProperty(event_name))
            return;
        
	    this.events[tag][event_name] = true;
        var cnds = cr.plugins_.Rex_WaitEvent.prototype.cnds;         
        this.runTrigEvent(cnds.OnAnyEventStart, tag, event_name);
	};  

	Acts.prototype.EventFinished = function(event_name, tag)
	{
	    if (!this.eventExist(event_name, tag))
		    return;

        var cnds = cr.plugins_.Rex_WaitEvent.prototype.cnds;
		this.exp_EventName = event_name; 
        
	    delete this.events[tag][event_name];       
        this.runTrigEvent(cnds.OnAnyEventFinished, tag, event_name);
        
		if (isEmpty(this.events[tag]))
		{
			delete this.events[tag];            
            this.runTrigEvent(cnds.OnAllEventsFinished, tag, event_name);
        }
	};  
	
	Acts.prototype.CancelEvents = function(tag)
	{       
	    if (!this.events.hasOwnProperty(tag))
		    return;
		
		delete this.events[tag];
	};  		
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.CurEventName = function(ret)
	{   
		ret.set_string(this.exp_EventName);         
	}; 
	
	Exps.prototype.CurTag = function(ret)
	{   
		ret.set_string(this.exp_Tag || "");         
	};     
    
}());