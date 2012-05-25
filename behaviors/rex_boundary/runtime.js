// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_boundary = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_boundary.prototype;
		
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

	var _sort_boundary = function(boundary)
	{   
	    if (boundary[1] < boundary[0])
	    {
	        var tmp = boundary[0]; boundary[0] = boundary[1]; boundary[1] = tmp;
	    }
	};    	
	behinstProto.onCreate = function()
	{    
        this.horizontal_enable = (this.properties[0]==1);
        this.horizontal_boundary = [this.properties[1], this.properties[2]];
        this.vertical_enable = (this.properties[3]==1);
        this.vertical_boundary = [this.properties[4], this.properties[5]];
        _sort_boundary(this.horizontal_boundary);
        _sort_boundary(this.vertical_boundary);
        this.horizontal_pin_instance = {inst:null, p0:null, p1:null};
        this.vertical_pin_instance = {inst:null, p0:null, p1:null};
        
		// Need to know if pinned object gets destroyed
		this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this);
										
		this.runtime.addDestroyCallback(this.myDestroyCallback);        
	};
	
	behinstProto.onInstanceDestroyed = function (inst)
	{
		// Pinned object being destroyed
		if (this.horizontal_pin_instance.inst == inst)
			this.horizontal_pin_instance.inst = null;
		if (this.vertical_pin_instance.inst == inst)
			this.vertical_pin_instance.inst = null;            
	};    
	
	behinstProto.onDestroy = function()
	{
		this.horizontal_pin_instance.inst = null;
        this.vertical_pin_instance.inst = null;
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	
	behinstProto.tick = function ()
	{
        this.horizontal_boundary_update();
        this.vertical_boundary_update();
	    var is_hit_boundary = false;
	    is_hit_boundary |= this.horizontal_boundary_check();
	    is_hit_boundary |= this.vertical_boundary_check();		
		if (is_hit_boundary)
        {                         
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitAnyBoundary, this.inst);            
		    this.inst.set_bbox_changed();             
        }
	};
    
	behinstProto.horizontal_boundary_update = function ()
	{
        var pin = this.horizontal_pin_instance;
        if (pin.inst == null)
            return;
        this.horizontal_boundary[0] = pin.inst.getImagePoint(pin.p0, true);
        this.horizontal_boundary[1] = pin.inst.getImagePoint(pin.p1, true);    
        _sort_boundary(this.horizontal_boundary);
	};
    
	behinstProto.vertical_boundary_update = function ()
	{
        var pin = this.vertical_pin_instance;
        if (pin.inst == null)
            return;
        this.vertical_boundary[0] = pin.inst.getImagePoint(pin.p0, false);
        this.vertical_boundary[1] = pin.inst.getImagePoint(pin.p1, false);    
        _sort_boundary(this.vertical_boundary);
	};
    
	behinstProto.horizontal_boundary_check = function ()
	{
	    if (!this.horizontal_enable)
		    return false;
		var curr_x = this.inst.x;
		if (this.inst.x < this.horizontal_boundary[0])
        {
		    this.inst.x = this.horizontal_boundary[0];
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitLeftBoundary, this.inst);
        }
        else if (this.inst.x > this.horizontal_boundary[1])
        {
		    this.inst.x = this.horizontal_boundary[1];
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitRightBoundary, this.inst);
        }
	    return (curr_x != this.inst.x);
	};
	
	behinstProto.vertical_boundary_check = function ()
	{
	    if (!this.vertical_enable)
		    return false;
	    var curr_y = this.inst.y;
		if (this.inst.y < this.vertical_boundary[0])
        {
		    this.inst.y = this.vertical_boundary[0];
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitTopBoundary, this.inst);
        }
        else if (this.inst.y > this.vertical_boundary[1])
        {
		    this.inst.y = this.vertical_boundary[1];
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitBottomBoundary, this.inst);
        }
	    return (curr_y != this.inst.y);			
	};
    
	behinstProto._horizontal_percent_get = function ()
	{
        this.horizontal_boundary_update();        
        var offset_inst = this.inst.x - this.horizontal_boundary[0];
        var offset_bound = this.horizontal_boundary[1] - this.horizontal_boundary[0];
        var pec = cr.clamp((offset_inst/offset_bound), 0, 1) ;
        return pec;
	};    
	behinstProto._vertical_percent_get = function ()
	{
        this.vertical_boundary_update(); 
        var offset_inst = this.inst.y - this.vertical_boundary[0];
        var offset_bound = this.vertical_boundary[1] - this.vertical_boundary[0];
        var pec = cr.clamp((offset_inst/offset_bound), 0, 1);
        return pec;
	};        
    
	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;
    
	cnds.OnHitAnyBoundary = function ()
	{
		return true;
	};
    
	cnds.OnHitLeftBoundary = function ()
	{
		return true;
	};
    
	cnds.OnHitRightBoundary = function ()
	{
		return true;
	};    
    
	cnds.OnHitTopBoundary = function ()
	{
		return true;
	};
    
	cnds.OnHitBottomBoundary = function ()
	{
		return true;
	};        
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.EnableHorizontal = function (s)
	{
		this.horizontal_enable = (s==1);
	};  

	acts.EnableVertical = function (s)
	{
		this.vertical_enable = (s==1);
	};

	acts.SetHorizontalBoundary = function (l, r)
	{
		this.horizontal_boundary[0] = l;
		this.horizontal_boundary[1] = r;
		_sort_boundary(this.horizontal_boundary);
        this.horizontal_pin_instance.inst = null;
	};

	acts.SetVerticalBoundary = function (u, d)
	{
		this.vertical_boundary[0] = l;
		this.vertical_boundary[1] = r;
		_sort_boundary(this.vertical_boundary);
        this.vertical_pin_instance.inst = null;        
	};

    var _get_instance = function (obj)
	{
		if (!obj)
			return null;
		return obj.getFirstPicked();
	};
	acts.SetHorizontalBoundaryToObject = function (obj, left_imgpt, right_imgpt)
	{
        var pin = this.horizontal_pin_instance;
		pin.inst = _get_instance(obj);	
        pin.p0 = left_imgpt;	
        pin.p1 = right_imgpt;	
	};   
    
	acts.SetVerticalBoundaryToObject = function (obj, top_imgpt, bottom_imgpt)
	{
        var pin = this.vertical_pin_instance;
		pin.inst = _get_instance(obj);	
        pin.p0 = top_imgpt;	
        pin.p1 = bottom_imgpt;	        
	};
 
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;
    
	exps.HorizontalEnable = function (ret)
	{
        ret.set_int( (this.horizontal_enable)? 1:0 );
	};

	exps.VerticalEnable = function (ret)
	{
        ret.set_int( (this.vertical_enable)? 1:0 );
	}; 
    
	exps.LeftBound = function (ret)
	{
        this.horizontal_boundary_update();   
        ret.set_float( this.horizontal_boundary[0] );
	};

	exps.RightBound = function (ret)
	{
        this.horizontal_boundary_update();    
        ret.set_float( this.horizontal_boundary[1] );
	};  

	exps.TopBound = function (ret)
	{
        this.vertical_boundary_update();     
        ret.set_float( this.vertical_boundary[0] );
	};

	exps.BottomBound = function (ret)
	{
        this.vertical_boundary_update();     
        ret.set_float( this.vertical_boundary[1] );
	};  
    
	exps.HorPercent = function (ret)
	{
        ret.set_float( this._horizontal_percent_get() );
	};

	exps.VerPercent = function (ret)
	{
        ret.set_float( this._vertical_percent_get() );
	};   
    
	exps.HorScale = function (ret, min_value, max_value)
	{
        var pec = this._horizontal_percent_get();
        if (max_value < min_value)
        {
            var tmp = max_value; max_value = min_value; min_value = tmp;
            pec = 1.0-pec;
        }
        var scaled = min_value + pec*(max_value-min_value);
        ret.set_float( scaled );
	};
    
	exps.VerScale = function (ret, min_value, max_value)
	{
        var pec = this._vertical_percent_get();
        if (max_value < min_value)
        {
            var tmp = max_value; max_value = min_value; min_value = tmp;
            pec = 1.0-pec;
        }
        var scaled = min_value + pec*(max_value-min_value);
        ret.set_float( scaled );
	};    
}());