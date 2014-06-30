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
	    this.one_tick_mode = (this.properties[0] === 0);
	    this.processing_time = percentage2time(this.properties[1]);
		this.is_running = false;
	    this.img_data = null;
		this.curi = 0;
		this.endi = 0;		
		
	    this.avg_r = 0;
		this.avg_g = 0;
		this.avg_b = 0;
		this.avg_a = 0;
		this.lum = 0;
	};  
	
	behinstProto.tick = function ()
	{
	    if (!this.is_running)
            return;
				
        var start_time = Date.now();
        while ((Date.now() - start_time) <= this.processing_time)
        {
            this.is_running = this.processing();
            if (!this.is_running)
			{
			    this.on_finished();
                break;
		    }
        }			
	};

	behinstProto.on_start = function ()
	{
	    var canvas = this.inst.canvas;
        this.img_data = this.inst.ctx.getImageData(0,0, canvas.width, canvas.height);
	    this.avg_r = 0;
		this.avg_g = 0;
		this.avg_b = 0;
		this.avg_a = 0;
		
		this.curi = 0;
		this.endi = canvas.width*canvas.height*4;		
		this.is_running = true;
	};	
	
	behinstProto.processing = function ()
	{
	    this.avg_r += this.img_data.data[this.curi];
		this.avg_g += this.img_data.data[this.curi+1];
		this.avg_b += this.img_data.data[this.curi+2];
		this.avg_a += this.img_data.data[this.curi+3]*100/255;
		
		this.curi += 4;
		return (this.curi < this.endi);
	};	
	
	behinstProto.on_finished = function ()
	{
    	var tp = this.endi/4;
		this.avg_r /= tp;
		this.avg_g /= tp;
		this.avg_b /= tp;
		this.avg_a /= tp;
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
        while (this.is_running)        
            this.is_running = this.processing();
                
        this.on_finished();
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
		return this.is_running;
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	Acts.prototype.Start = function ()
	{	
        if (this.one_tick_mode)
            this.one_tick_process();
        else
	        this.on_start();		
	};
	
	Acts.prototype.Stop = function ()
	{	
	    this.is_running = false;		
	};
	
	Acts.prototype.SetProcessingMode = function(m)
	{
        this.one_tick_mode = (m === 0);
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
		ret.set_float(this.curi/this.endi);
	};			
}());