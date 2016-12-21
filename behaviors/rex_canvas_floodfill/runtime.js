// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Canvas_floodfill = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Canvas_floodfill.prototype;
		
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
	        this.floodfill = new window["FloodFill"]();
	        	
        this.fillStyle = "";
        this.OX = 0;
        this.OY = 0;
        this.tolerance = 0;
        this.bbLeft = null;
        this.bbTop = null;
        this.bbRight = null;
        this.bbBottom = null;
        
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
	    this.floodfill["Stop"]();
	    
        var self = this;
        var on_complete = function (args)
        {

            self.current_task = null;		              
            self.runtime.trigger(cr.behaviors.Rex_Canvas_floodfill.prototype.cnds.OnFinished, self.inst);	      
        };

        // for official save/load
        this.current_task = true;
        // for official save/load
                
        var ctx = this.inst.ctx;
        var img_data = ctx["getImageData"](0,0, ctx["width"], ctx["height"])["data"];
        this.floodfill["Start"](img_data, on_complete);
	}; 		
    
    behinstProto.Cencel = function ()
	{
	    this.current_task = null;
	    this.floodfill["Stop"]();    
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
		return this.floodfill["IsProcessing"]();
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	Acts.prototype.SetFillColor = function (color)
	{	
	    this.fillStyle = color;
	};
	
	Acts.prototype.SetStartPoint = function (x, y)
	{	
	    this.OX = x;
        this.OY = y;
	};	
	
	Acts.prototype.SetTolerance = function (tolerance)
	{	
	    this.tolerance = tolerance;
	};   
	
	Acts.prototype.SetBoundingBox = function (left, top, right, bottom)
	{	
	    this.bbLeft = left;
        this.bbTop = top;
	    this.bbRight = right;
        this.bbBottom = bottom;        
	};    
	
	Acts.prototype.FillFlood = function ()
	{	
	    var ctx = this.inst.ctx;
        ctx["fillStyle"] = this.fillStyle;        
        ctx["fillFlood"](this.OX, this.OY, this.tolerance, this.bbLeft, this.bbTop, this.bbRight, this.bbBottom);
		this.inst.runtime.redraw = true;
        this.inst.update_tex = true;        
	};     
    
	Acts.prototype.Start = function ()
	{	
	    this.Start();         
	};
	
	Acts.prototype.Cencel = function ()
	{
	    this.Cencel();   
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());