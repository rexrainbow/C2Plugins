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
	    if (!this.recycled)
	        this.calc_avgrgb = new window["CalcAvgRGB"]();
	        	    
	    this.avg_r = 0;
		this.avg_g = 0;
		this.avg_b = 0;
		this.avg_a = 0;
		this.lum = 0;
		
        // for official save/load    
        this.current_task = null;
        // for official save/load
	};  

	behinstProto.onDestroy = function ()
	{
	    this.Cencel();
	}; 
	
	behinstProto.tick = function ()
	{
	};	 
	
    behinstProto.Start = function ()
	{
	    this.calc_avgrgb["Stop"]();
	    
        var self = this;
        var on_complete = function (args)
        {
		    self.lum = (0.3 * args[0]) + (0.59 * args[1]) + (0.11 * args[2]);
		    self.avg_r = Math.floor(args[0]);
		    self.avg_g = Math.floor(args[1]);
		    self.avg_b = Math.floor(args[2]);
		    self.avg_a = Math.floor(args[3]);  
            self.current_task = null;		              
            self.runtime.trigger(cr.behaviors.Rex_CanvasAVGRGBA.prototype.cnds.OnFinished, self.inst);	      
        };

        // for official save/load
        this.current_task = true;
        // for official save/load
                
        var ctx = this.inst.ctx;
        var img_data = ctx["getImageData"](0,0, ctx["canvas"]["width"], ctx["canvas"]["height"])["data"];
        this.calc_avgrgb["Start"](img_data, on_complete);
	}; 		
    
    behinstProto.Cencel = function ()
	{
	    this.current_task = null;
	    this.calc_avgrgb["Stop"]();    
	};		
	
	behinstProto.saveToJSON = function ()
	{
		return { "curTsk": this.current_task,
               };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.current_task = o["curTsk"];			
	};
	
	behinstProto.afterLoad = function ()
	{
		if (this.current_task !== null)
		{
		    this.Start.apply(this, this.current_task);
		}
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
		return this.calc_avgrgb["IsProcessing"]();
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	Acts.prototype.Start = function ()
	{	
	    this.Start();         
	};
	
	Acts.prototype.Cencel = function ()
	{
	    this.Cencel();   
	};
	
	// deprecated
	Acts.prototype.SetProcessingMode = function ()  { };		
	Acts.prototype.SetProcessingTime = function ()  { };	
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
		ret.set_float(0);
	};			
}());