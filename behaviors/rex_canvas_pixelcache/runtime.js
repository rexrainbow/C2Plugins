// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Canvas_PixelCahce = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Canvas_PixelCahce.prototype;
		
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
	    this.img_data = null;
		this.area_lx = 0;
		this.area_rx = 0;
		this.area_ty = 0;
		this.area_by = 0;    	
	};  
	
	behinstProto.tick = function ()
	{	
	};
	
	behinstProto.cache_area = function (x, y, w, h)
	{
	    if (x == null)
		{
		    x = 0; 
			y = 0; 
			w = this.inst.canvas.width; 
			h = this.inst.canvas.height;
	    }
			
        this.img_data = this.inst.ctx.getImageData(x, y, w, h);
		this.area_lx = x;
		this.area_ty = y;
		this.area_rx = x+w-1;
		this.area_by = y+h-1;
	};	

	behinstProto.point_get = function (x,y)
	{	
	    if (this.img_data == null)
		    this.cache_area();
        if ( (x < this.area_lx) || (x > this.area_rx) ||
		     (y < this.area_ty) || (y > this.area_by) )
			return -1;
	    
		x -= this.area_lx;
		y -= this.area_ty;
        return ((y*this.img_data.width) + x) * 4;
	};	
    behinstProto.get_color = function (i)
	{
		var data = this.img_data.data;
		var val = data[i];
		if (val == null)
		{
		    val = 0;
	    }
	    return val;
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	Acts.prototype.CacheArea = function (x, y, w, h)
	{	
        this.cache_area(x, y, w, h);
	};

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.rgbaAt = function (ret, x, y)
	{
	    var i = this.point_get(x, y);
		if (i == -1)
		{
		    ret.set_string("black");
			return;
		}
		
		var data = this.img_data.data;
		ret.set_string("rgba(" + data[i] + "," + data[i+1] + "," + data[i+2] + "," + data[i+3]/255 + ")");
	};

    Exps.prototype.redAt = function (ret, x, y)
	{
		var i = this.point_get(x, y);
		if (i == -1)
		{
		    ret.set_int(0);
			return;
		}
		
		ret.set_int(this.get_color(i));
	};
    Exps.prototype.greenAt = function (ret, x, y)
	{
		var i = this.point_get(x, y);
		if (i == -1)
		{
		    ret.set_int(0);
			return;
		}
		
		ret.set_int(this.get_color(i+1));
	};
   Exps.prototype.blueAt = function (ret, x, y)
	{
		var i = this.point_get(x, y);
		if (i == -1)
		{
		    ret.set_int(0);
			return;
		}
		
		ret.set_int(this.get_color(i+2));
	};
    Exps.prototype.alphaAt = function (ret, x, y)
	{
		var i = this.point_get(x, y);
		if (i == -1)
		{
		    ret.set_int(0);
			return;
		}
		
		ret.set_int(this.get_color(i+3)*100/255);
	};	
	
    Exps.prototype.LeftX = function (ret)
	{
		ret.set_int(this.area_lx);
	};	
    Exps.prototype.RightX = function (ret)
	{
		ret.set_int(this.area_rx);
	};
	Exps.prototype.TopY = function (ret)
	{
		ret.set_int(this.area_ty);
	};	
    Exps.prototype.BottomY = function (ret)
	{
		ret.set_int(this.area_by);
	};	
}());