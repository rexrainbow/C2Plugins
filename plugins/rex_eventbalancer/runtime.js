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
        this.is_running = false;
        this.elapsed_ticks = 0;
        this.trigger_mode_init = false;
        
        // looping
        this.is_looping = false;
        
	};

    var percentage2time = function (percentage)
    {
	    if (percentage < 0.01)
		    percentage = 0.01;
	    return (1/60)*1000*percentage;
    };
    
    instanceProto.tick = function()
    {         
        if (!this.is_running)
            return;

        this.elapsed_ticks += 1;            
        if (this.is_dynamic_mode)
            this._run_dynamic_mode()
        else
            this._run_static_mode()
            
    };
	
	instanceProto._run_dynamic_mode = function()
	{
        var is_timeout = false;
        var start_time = Date.now();
        while (!is_timeout)
        {
            this.runtime.trigger(cr.plugins_.Rex_EventBalancer.prototype.cnds.OnProcessing, this);
            if (!this.is_running)
                break;
            
            is_timeout = ((Date.now() - start_time) > this.processing_time);
        }
	};  
	
	instanceProto._run_static_mode = function()
	{
	    var i;
	    for (i=0; i<this.repeat_count; i++)
	    {
            this.runtime.trigger(cr.plugins_.Rex_EventBalancer.prototype.cnds.OnProcessing, this);
            if (!this.is_running)
                break;
	    }
	};    
	
    instanceProto.saveToJSON = function ()
	{    
		return { "dm": this.is_dynamic_mode,
                 "pt": this.processing_time,
                 "rc": this.repeat_count,
                 "isrun": this.is_running,
                 };
	};
	instanceProto.loadFromJSON = function (o)
	{	    
	    this.is_dynamic_mode = o["dm"];
        this.processing_time = o["pt"];
        this.repeat_count = o["rc"];
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

	Cnds.prototype.DynamicLoop = function()
	{    
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		var start_time = Date.now();
		this.is_looping = true;
		if (solModifierAfterCnds)
		{
            while ((Date.now() - start_time) <= this.processing_time)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
                current_event.retrigger();
                this.runtime.popSol(current_event.solModifiers);
                if (!this.is_looping)
                    break;
            }		    
	    }
	    else
	    {
            while ((Date.now() - start_time) <= this.processing_time)
            {
                current_event.retrigger();
                if (!this.is_looping)
                    break;
            } 
	    }

		return false;  
	}; 	
	   
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.Start = function()
	{
	    if (!this.trigger_mode_init)
	    {
            this.runtime.tickMe(this);
            this.trigger_mode_init = true;
        }
            
        this.is_running = true;    
	    this.elapsed_ticks = 0;
        this.runtime.trigger(cr.plugins_.Rex_EventBalancer.prototype.cnds.OnStart, this);
	}; 

	Acts.prototype.Stop = function()
	{
	    if (!this.is_running)
	        return;
        this.is_running = false;
        this.runtime.trigger(cr.plugins_.Rex_EventBalancer.prototype.cnds.OnStop, this);
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
		
	Acts.prototype.StopLoop = function()
	{
	    this.is_running = false;
	}; 	     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.ProcessingTime = function (ret)
	{  
        ret.set_float(this.processing_time);
	}; 
    
	Exps.prototype.ElapsedTicks = function (ret)
	{  
        ret.set_int(this.elapsed_ticks);
	}; 	
	
}());