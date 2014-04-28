// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_EventBalancer = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_EventBalancer.prototype;
		
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
	    this.is_dynamic_mode = (this.properties[0] == 0);
        this.processing_time = percentage2time(this.properties[1]);
        this.repeat_count = this.properties[2];
        this.cmd_stop = true;
        this.is_running = false;
        this.elapsed_ticks = 0;
	};

    var percentage2time = function (percentage)
    {
	    if (percentage < 0.01)
		    percentage = 0.01;
	    return (1/60)*1000*percentage;
    };
    
    instanceProto.tick = function()
    {         
        this.is_running = true;
        if (this.is_dynamic_mode)
            this._run_dynamic_mode()
        else
            this._run_static_mode()
            
        if (this.cmd_stop)
        {
            this.runtime.trigger(cr.plugins_.Rex_EventBalancer.prototype.cnds.OnStop, this);
        }
        this.elapsed_ticks += 1;
    }; 
    
    // close is_running
	instanceProto.tick2 = function ()
	{	    
	    this.is_running = false;
	    this.runtime.untick2Me(this);
	};    
	
	instanceProto._run_dynamic_mode = function()
	{
        var start_time = Date.now();
        while ((Date.now() - start_time) <= this.processing_time)
        {
            this.runtime.trigger(cr.plugins_.Rex_EventBalancer.prototype.cnds.OnProcessing, this);
            if (this.cmd_stop)
                break;
        }
	};  
	
	instanceProto._run_static_mode = function()
	{
	    var i;
	    for (i=0; i<this.repeat_count; i++)
	    {
            this.runtime.trigger(cr.plugins_.Rex_EventBalancer.prototype.cnds.OnProcessing, this);
            if (this.cmd_stop)	        
                break;
	    }
	};    
	
    instanceProto.saveToJSON = function ()
	{    
		return { "dm": this.is_dynamic_mode,
                 "pt": this.processing_time,
                 "rc": this.repeat_count,
                 "stop": this.cmd_stop,
                 "isrun": this.is_running,
                 };
	};
	instanceProto.loadFromJSON = function (o)
	{	    
	    this.is_dynamic_mode = o["dm"];
        this.processing_time = o["pt"];
        this.repeat_count = o["rc"];
        this.cmd_stop = o["stop"];
        this.is_running = o["isrun"];
        
        if (this.is_running)
            this.runtime.tickMe(this);
	};
		
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [{"name": "Is processing", "value": this.is_running, "readonly": true},
			               {"name": "Elapsed ticks", "value": this.elapsed_ticks, "readonly": true},  
			               ]
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

	Cnds.prototype.OnStart = function()
	{    
		return true;
	};

	Cnds.prototype.OnProcessing = function()
	{    
		return true;
	};    

	Cnds.prototype.OnStop = function()
	{    
		return true;
	};    

	Cnds.prototype.IsProcessing = function()
	{    
		return this.is_running;
	};    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.Start = function()
	{
	    this.elapsed_ticks = 0;
        this.cmd_stop = false;    
        this.runtime.tickMe(this);
        this.runtime.trigger(cr.plugins_.Rex_EventBalancer.prototype.cnds.OnStart, this);
	}; 

	Acts.prototype.Stop = function()
	{       
        this.runtime.untickMe(this);
        this.runtime.tick2Me(this);
        this.cmd_stop = true;
	}; 

	Acts.prototype.SetProcessingTime = function(percentage)
	{
        this.processing_time = percentage2time(percentage);
	};

	Acts.prototype.SetRepeatCount = function(repeat_count)
	{       
	    if (repeat_count < 1)
	        repeat_count = 1;	        
        this.repeat_count = repeat_count;
	};	
	     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.ProcressingTime = function (ret)
	{  
        ret.set_float(this.processing_time);
	}; 
    
	Exps.prototype.ElapsedTicks = function (ret)
	{  
        ret.set_int(this.elapsed_ticks);
	}; 	
	
}());