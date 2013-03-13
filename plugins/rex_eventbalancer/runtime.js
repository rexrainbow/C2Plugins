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
        this.procressing_time = (1/60)*1000*this.properties[1];
        this.repeat_count = this.properties[2];
        this.cmd_stop = true;
        this.is_running = false;
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
        while ((Date.now() - start_time) <= this.procressing_time)
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

	Acts.prototype.SetProcressingTime = function(procressing_time)
	{       
        this.procressing_time = cr.clamp(procressing_time, 0.01, 1);
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
        ret.set_any(this.procressing_time);
	}; 
}());