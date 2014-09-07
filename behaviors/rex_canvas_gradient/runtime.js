// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_CanvasGradient = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_CanvasGradient.prototype;
		
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
        this.grad = null;
	    this.LT_x = null;
	    this.LT_y = null;
	    this.draw_width = null;
	    this.draw_height = null;	    
	};  
	
	behinstProto.tick = function ()
	{
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	Acts.prototype.DefineRadiusGradient = function (x0, y0, r0, x1, y1, r1)
	{
        this.grad = this.inst.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
        
        if (this.LT_x == null)
        {
            var c0_xmin=x0-r0, c0_xmax=x0+r0, c0_ymin=y0-r0, c0_ymax=y0+r0;
            var c1_xmin=x1-r1, c1_xmax=x1+r1, c1_ymin=y1-r1, c1_ymax=y1+r1;        
	        this.LT_x = Math.min(c0_xmin, c1_xmin);
	        this.LT_y = Math.min(c0_ymin, c1_ymin);	    
	        this.draw_width = Math.abs(Math.max(c0_xmax, c1_xmax) - this.LT_x);
	        this.draw_height = Math.abs(Math.max(c0_ymax, c1_ymax) - this.LT_y);
	    }
	};	
	
	Acts.prototype.DefineConcentricCircleGradient = function (x0, y0, r0, r1)
	{
        this.grad = this.inst.ctx.createRadialGradient(x0, y0, r0, x0, y0, r1);
           
        if (this.LT_x == null)
        {                       
	        this.LT_x = x0 - r1;
	        this.LT_y = y0 - r1;	    
	        this.draw_width = r1*2;
	        this.draw_height = r1*2;
	    }
	};
	Acts.prototype.DefineLineGradient = function (x0, y0, x1, y1)
	{
        this.grad = this.inst.ctx.createLinearGradient(x0, y0, x1, y1);
	    
        if (this.LT_x == null)
        {	    
	        this.LT_x = 0;
	        this.LT_y = 0;
	        this.draw_width = this.inst.canvas.width;
	        this.draw_height = this.inst.canvas.height;
	    }
	};
	Acts.prototype.DefineFilledAreaAtC = function (x, y, w, h)
	{
	    this.LT_x = x - (w/2);
	    this.LT_y = y - (h/2);
	    this.draw_width = w;
	    this.draw_height = h;       
	};    
	Acts.prototype.DefineFilledAreaAtLT = function (x, y, w, h)
	{
	    this.LT_x = x;
	    this.LT_y = y;
	    this.draw_width = w;
	    this.draw_height = h;       
	};	
	Acts.prototype.DefineColorStop = function (offset, color)
	{
	    if (!this.grad)
	        return;
	        
        try
        {
            this.grad.addColorStop(offset, color);
        }
        catch(e)
        {
        }
	};	
	

	Acts.prototype.DrawGradient = function ()
	{
	    if (!this.grad)
	        return;
	        	    
	    this.inst.ctx.fillStyle = this.grad;
		this.inst.ctx.fillRect(this.LT_x, this.LT_y, this.draw_width, this.draw_height);
		this.runtime.redraw = true;
        this.update_tex = true;
        this.grad = null;
	    this.LT_x = null;
	    this.LT_y = null;
	    this.draw_width = null;
	    this.draw_height = null;        
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());