// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Waker = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Waker.prototype;
		
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
	    var fps = this.properties[0];
	    var enable = (this.properties[1] == 1);	    
	    
	    this.waker = new cr.plugins_.Rex_Waker.WakerKlass(this.runtime);
	    this.waker.SetFrameRate(fps);	    
	    this.waker.SetEnable(enable);
	};
    
	instanceProto.onDestroy = function ()
	{
	};  
    
	instanceProto.saveToJSON = function ()
	{
		return { "waker": this.waker.saveToJSON(),
		         };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.waker.loadFromJSON(o["waker"]);
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
	Cnds.prototype.IsAwake = function ()
	{
	    return this.waker.IsAwake;
	};		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.SetEnable = function (e)
	{
	    this.waker.SetEnable(e==1);
	};    
    Acts.prototype.SetFrameRate = function (fps)
	{
        if (fps < 0)
            fps = 0;
        else if (fps > 1000)
            fps = 1000;
	    this.waker.SetFrameRate(fps);
	};     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());


(function ()
{           
    var WakerKlass = function (runtime)
    {   
        this.runtime = runtime;
        if (typeof Worker !== "undefined") 
	        this.worker = new Worker("waker.js"); 
        else
            return;

	    	       
	    this.IsAwake = false;
        this.enable = true;	    
        this.nowTime = 0;
	    this.SetFrameRate(60);     

        var self = this;
        var on_received = function (e)
        {
            if (e.data === "tick")
            {
                self.onWaking();
            }	        
        };
        this.worker.addEventListener("message", on_received, false);                    
        
        var on_suspend = function(s)
        {
            self.on_suspend(s);
        };
        this.runtime.addSuspendCallback(on_suspend);
    };
            
    var WakerKlassProto = WakerKlass.prototype; 
    
	WakerKlassProto.onWaking = function ()
	{
	    if (!this.enable)
	        return;
	    if (!this.runtime.isSuspended)
	        return;

        this.nowTime += this.period;
	    this.runtime.tick(true, this.nowTime);
	}; 	   
	
	WakerKlassProto.on_suspend = function (s)
	{
	    // Suspending and is currently host: use a web worker to keep the game alive
	    if (s)
	    {
	    	this.Start();
	    }
	    // Resuming and is currently host: stop using web worker to keep running, will revert to rAF
	    else
	    {
	    	this.Stop();
	    }
	}; 	 	  
      
	WakerKlassProto.SetEnable = function (enable)
	{
        if (this.IsAwake && this.enable)
            this.Stop();
            
	    this.enable = enable;
	};    
	
	WakerKlassProto.SetFrameRate = function (fps)
	{
        if (!this.worker)
            return;
            
	    this.period = Math.floor((1/fps)*1000);
	    this.worker.postMessage(["setTimerPeriod", this.period]);
	}; 
	
	WakerKlassProto.Start = function ()
	{
        if (!this.worker)
            return;
            
	    if (!this.enable)
	        return;
            
        if (this.period <= 0)
            return;
	    
        this.nowTime = cr.performance_now();
	    this.IsAwake = true;        
	    this.worker.postMessage(["startTimer"]);
	}; 	
	
	WakerKlassProto.Stop = function ()
	{
        if (!this.worker)
            return;

	    this.worker.postMessage(["stopTimer"]);
	    this.IsAwake = false;
	}; 		    

	WakerKlassProto.saveToJSON = function ()
	{
		return { "en": this.enable,
                 "period": this.period };
	};
	
	WakerKlassProto.loadFromJSON = function (o)
	{
		this.enable = o["en"];
		this.period = o["period"];
	};
	        	
	cr.plugins_.Rex_Waker.WakerKlass = WakerKlass;
}());       