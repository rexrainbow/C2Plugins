// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_CanvasAVGRGBA = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_CanvasAVGRGBA.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{  
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.set_process_mode(this.properties[0]);
        
        // multi-tick
	    this.processing_time = percentage2time(this.properties[1]);
		this.is_tick_running = false;                
	    this.img_data = null;
		this.curi = 0;
		this.endi = 0;	
        this.pixel_cnt = 0;             
        
        // webworker
        this.worker = null;  
        this.is_webworker_running = false;
		
	    this.avg_r = 0;
		this.avg_g = 0;
		this.avg_b = 0;
		this.avg_a = 0;
		this.lum = 0;
	};  
    
	behinstProto.set_process_mode = function (m)
	{
        this.process_mode = m;
        // webworker does not support, use multi-tick mode
        if ((this.process_mode == 2) && (typeof Worker === "undefined"))
            this.process_mode = 1;
	};
    	
	behinstProto.tick = function ()
	{
	    if (this.is_tick_running)		
            this.tick_process();
	};
    
	behinstProto.tick_process = function ()
	{
        var start_time = Date.now();
        while ((Date.now() - start_time) <= this.processing_time)
        {
            this.is_tick_running = this.processing();
            if (!this.is_tick_running)
			{
			    this.on_finished();
                break;
		    }
        }			
	};    

	behinstProto.on_start = function ()
	{
	    var canvas = this.inst.canvas;
        this.img_data = this.inst.ctx.getImageData(0,0, canvas.width, canvas.height).data;
	    this.avg_r = 0;
		this.avg_g = 0;
		this.avg_b = 0;
		this.avg_a = 0;
		
		this.curi = 0;
		this.endi = canvas.width*canvas.height*4;		
		this.is_tick_running = true;
	};	
	
	behinstProto.processing = function ()
	{
        if ( this.img_data[this.curi+3] != 0)
        {    
	        this.avg_r += this.img_data[this.curi];
		    this.avg_g += this.img_data[this.curi+1];
		    this.avg_b += this.img_data[this.curi+2];
		    this.avg_a += this.img_data[this.curi+3]*100/255;
            this.pixel_cnt ++;
        }
		
		this.curi += 4;
		return (this.curi < this.endi);
	};	
	
	behinstProto.on_finished = function ()
	{
        if (this.pixel_cnt > 0)
        {        	
		    this.avg_r /= this.pixel_cnt;
		    this.avg_g /= this.pixel_cnt;
		    this.avg_b /= this.pixel_cnt;
		    this.avg_a /= this.pixel_cnt;
        }
        
		this.lum = (0.3 * this.avg_r) + (0.59 * this.avg_g) + (0.11 * this.avg_b);
		this.avg_r = Math.floor(this.avg_r);
		this.avg_g = Math.floor(this.avg_g);
		this.avg_b = Math.floor(this.avg_b);
		this.avg_a = Math.floor(this.avg_a);	
		this.img_data = null;

		this.runtime.trigger(cr.behaviors.Rex_CanvasAVGRGBA.prototype.cnds.OnFinished, this.inst);		
	};

	var percentage2time = function (percentage)
    {
	    if (percentage < 0.01)
		    percentage = 0.01;
	    return (1/60)*1000*percentage;
    };
    
	behinstProto.one_tick_process = function ()
	{
	    this.on_start();
        while (this.is_tick_running)        
            this.is_tick_running = this.processing();
                
        this.on_finished();
	};
    
	behinstProto.start_webworker = function ()
	{
        this.is_webworker_running = true;
        if (!this.worker)
            this.worker = new Worker("avgRGB.js");
        
        var self = this;
        var on_complete = function (e)
        {
            self.is_webworker_running = true;
            var avg_rgba = e.data;
		    self.lum = (0.3 * avg_rgba[0]) + (0.59 * avg_rgba[1]) + (0.11 * avg_rgba[2]);
		    self.avg_r = Math.floor(avg_rgba[0]);
		    self.avg_g = Math.floor(avg_rgba[1]);
		    self.avg_b = Math.floor(avg_rgba[2]);
		    self.avg_a = Math.floor(avg_rgba[3]);
            self.runtime.trigger(cr.behaviors.Rex_CanvasAVGRGBA.prototype.cnds.OnFinished, self.inst);		            
        };
        this.worker.addEventListener("message", on_complete, false); 
        
        var canvas = this.inst.canvas;
        var img_data = this.inst.ctx.getImageData(0,0, canvas.width, canvas.height).data;
        this.worker.postMessage(["start", img_data]);        
	};
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	Cnds.prototype.OnFinished = function ()
	{
		return true;
	};
	
	Cnds.prototype.IsProcessing = function ()
	{
		return this.is_tick_running || this.is_webworker_running;
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	Acts.prototype.Start = function ()
	{	
        if (this.process_mode == 0)
            this.one_tick_process();
        else if (this.process_mode == 1)
	        this.on_start();		
        else if (this.process_mode == 2)
            this.start_webworker();           
	};
	
	Acts.prototype.Stop = function ()
	{
        if (this.is_tick_running)
	        this.is_tick_running = false;		
        else if (this.is_webworker_running)
        {
            this.worker.postMessage(["stop"]); 
            this.is_webworker_running = false;
        }
	};
	
	Acts.prototype.SetProcessingMode = function(m)
	{
        this.set_process_mode(m);
	};	
	Acts.prototype.SetProcessingTime = function(percentage)
	{
        this.processing_time = percentage2time(percentage);
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.R = function (ret)
	{
		ret.set_int(this.avg_r);
	};
	Exps.prototype.G = function (ret)
	{
		ret.set_int(this.avg_g);
	};	
	Exps.prototype.B = function (ret)
	{
		ret.set_int(this.avg_b);
	};	
	Exps.prototype.A = function (ret)
	{
		ret.set_int(this.avg_a);
	};	
	Exps.prototype.RGB = function (ret)
	{	
		ret.set_string("rgb("+this.avg_r+","+this.avg_g+","+this.avg_b+")");
	};	
	Exps.prototype.RGBA = function (ret)
	{	
		ret.set_string("rgba("+this.avg_r+","+this.avg_g+","+this.avg_b+","+this.avg_a+")");
	};	
	Exps.prototype.Lum = function (ret)
	{
		ret.set_float(this.lum);
	};		
	Exps.prototype.Progress = function (ret)
	{
        var p;
        if (this.process_mode == 0)
            p = 0;
        else if (this.process_mode == 1)
            p = this.curi/this.endi;
        else if (this.process_mode == 2)
            p = 0;
		ret.set_float(p);
	};			
}());