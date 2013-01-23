// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_TouchArea2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_TouchArea2.prototype;
		
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
        this.touchwrap = null;
	};
    
	behtypeProto.TouchWrapGet = function ()
	{
        if (this.touchwrap != null)
            return;
            
        var plugins = this.runtime.types;
        var name, obj;
        for (name in plugins)
        {
            obj = plugins[name].instances[0];
            if ((obj != null) && (obj.check_name == "TOUCHWRAP"))
            {
                this.touchwrap = obj;
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for TouchArea behavior");
	};  
    
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
        
        type.TouchWrapGet();                                 
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
	    this.is_touched = false;
	    this.cur_touchX = this.inst.x;
	    this.cur_touchY = this.inst.y;
	};	

	behinstProto.tick = function ()
	{  
	    var touch_obj = this.type.touchwrap;
        var touch_pts = touch_obj.touches;
		var cnt=touch_pts.length;
		
		var is_touched = false, inst=this.inst;
	   
	    if (touch_obj.IsInTouch())
	    {
		    var i, touch_pt, tx, ty;
		    for (i=0; i<cnt; i++)
		    {
		        inst.update_bbox();
		        touch_pt = touch_pts[i];
                tx = inst.layer.canvasToLayer(touch_pt.x, touch_pt.y, true);
		    	ty = inst.layer.canvasToLayer(touch_pt.x, touch_pt.y, false);   		    
		    	if (inst.contains_pt(tx,ty))
		    	{
		    	    this.cur_touchX = tx;
		    	    this.cur_touchY = ty;
		    	    is_touched = true;
		    	    break;
		    	}
		    }
	    }
					
		if ((!this.is_touched) && is_touched)
		    this.runtime.trigger(cr.behaviors.Rex_TouchArea2.prototype.cnds.OnTouchStart, inst);
		else if (this.is_touched && (!is_touched))
		    this.runtime.trigger(cr.behaviors.Rex_TouchArea2.prototype.cnds.OnTouchEnd, inst);
        this.is_touched = is_touched;			    
	}; 

	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();    

	Cnds.prototype.OnTouchStart = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnTouchEnd = function ()
	{
		return true;
	};
	
	Cnds.prototype.IsInTouch = function ()
	{
		return this.is_touched;
	};   
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.X = function (ret)
	{
		ret.set_float(this.cur_touchX);
	};
    
	Exps.prototype.Y = function (ret)
	{
		ret.set_float(this.cur_touchY);
	};    
}());