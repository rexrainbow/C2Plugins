// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_SinButton2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_SinButton2.prototype;
		
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
        this.GetX = null;
        this.GetY = null;
        this.GetAbsoluteX = null;
        this.GetAbsoluteY = null;
        this.behavior_index = null;             
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
                this.GetX = cr.plugins_.rex_TouchWrap.prototype.exps.X;
                this.GetY = cr.plugins_.rex_TouchWrap.prototype.exps.Y;
                this.GetAbsoluteX = cr.plugins_.rex_TouchWrap.prototype.exps.AbsoluteX;
                this.GetAbsoluteY = cr.plugins_.rex_TouchWrap.prototype.exps.AbsoluteY;                 
                this.touchwrap.HookMe(this);
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for Cursor behavior");
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
		this.active = (this.properties[0] === 1);
        this.is_over = false;
        this.pre_is_over = this.is_over;
        
        var movement = this.properties[1];
        var period = this.properties[2] + (Math.random() * this.properties[3]);
        var period_offset = ( ((this.properties[4] / period) * 2 * Math.PI) + 
                              (((Math.random() * this.properties[5]) / period) * 2 * Math.PI) );
        var magnitude = this.properties[6] + (Math.random() * this.properties[7]);
        this.sin_obj = new cr.behaviors.Rex_SinButton2.SineKlass(this.inst, movement, 
                                                                period, period_offset,
                                                                magnitude);
                                                                
	};

	behinstProto.tick = function ()
	{
        if (this.active)
        {
            var inst = this.inst;
            inst.update_bbox();
	        var lx = this.GetX();
		    var ly = this.GetY();
            this.is_over = (lx != null)? 
                           inst.contains_pt(lx, ly):
                           false;
            
            if (this.is_over)
            {
                this.sin_obj.tick(this.runtime.getDt(inst));
                this.runtime.redraw = true;
            }
            else if (this.pre_is_over)  // back to init
            {
                this.sin_obj.reset();
            }
            
            // Trigger OnOver
            if (this.is_over)
            {
                this.runtime.trigger(cr.behaviors.Rex_SinButton2.prototype.cnds.OnOver, inst);            
            }
            
            this.pre_is_over = this.is_over;
        }
	};
  
	behinstProto.GetABSX = function ()
	{
	    var touch_obj = this.type.touchwrap;
        this.type.GetAbsoluteX.call(touch_obj, touch_obj.fake_ret);
        return touch_obj.fake_ret.value;
	};  

	behinstProto.GetABSY = function ()
	{
        var touch_obj = this.type.touchwrap;
        this.type.GetAbsoluteY.call(touch_obj, touch_obj.fake_ret);
        return touch_obj.fake_ret.value;        
	};     
        
	behinstProto.GetX = function()
	{
        var touch_obj = this.type.touchwrap;
        this.type.GetX.call(touch_obj, touch_obj.fake_ret, this.inst.layer.index);
        return touch_obj.fake_ret.value;          
	};
    
	behinstProto.GetY = function()
	{
        var touch_obj = this.type.touchwrap;
        this.type.GetY.call(touch_obj, touch_obj.fake_ret, this.inst.layer.index);
        return touch_obj.fake_ret.value;         
	};  
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();   
    
	Cnds.prototype.OnOver = function ()
	{
		return true;
	};
    
	Cnds.prototype.IsOver = function ()
	{
		return (this.is_over);
	};  
	
	Cnds.prototype.IsActive = function ()
	{
		return this.active;
	};
    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActive = function (a)
	{
		this.active = (a === 1);
	};
	
	Acts.prototype.SetPeriod = function (x)
	{
		this.sin_obj.period = x;
	};
	
	Acts.prototype.SetMagnitude = function (x)
	{
		if (this.movement === 5)	// angle
			x= cr.to_radians(x);
            
		this.sin_obj.mag = x;
	};

    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.CyclePosition = function (ret)
	{
		ret.set_float(this.sin_obj.i / (2 * Math.PI));
	};
	
	Exps.prototype.Period = function (ret)
	{
		ret.set_float(this.sin_obj.period);
	};
	
	Exps.prototype.Magnitude = function (ret)
	{
		if (this.movement === 5)	// angle
			ret.set_float(cr.to_degrees(this.sin_obj.mag));
		else
			ret.set_float(this.sin_obj.mag);
	};
	
}());

(function ()
{
    // for injecting javascript
    cr.behaviors.Rex_SinButton2.SineKlass = function(inst, movement, 
                                                    period, period_offset,
                                                    magnitude)
    {
		if (period === 0)
			period = 0.01; 

		var initialValue = 0;
		var ratio = 0;
		
		switch (movement) {
		case 0:		// horizontal
			initialValue = inst.x;
			break;
		case 1:		// vertical
			initialValue = inst.y;
			break;
		case 2:		// size
			initialValue = inst.width;
			ratio = inst.height / inst.width;
			break;
		case 3:		// width
			initialValue = inst.width;
			break;
		case 4:		// height
			initialValue = inst.height;
			break;
		case 5:		// angle
			initialValue = inst.angle;
			magnitude = cr.to_radians(magnitude);		// convert magnitude from degrees to radians
			break;
		default:
			assert2(false, "Invalid sin movement type");
		}
		
        this.inst = inst;     
        this.movement = movement;
        this.period = period;
        this.i = period_offset;    
        this.mag = magnitude;        
        this.initialValue = initialValue;
        this.ratio = ratio;
		this.lastKnownValue = initialValue;

    };
    var SineKlassProto = cr.behaviors.Rex_SinButton2.SineKlass.prototype;
    
    SineKlassProto.tick = function (dt)
    {
		if (dt === 0)
			return;
		
		this.i += (dt / this.period) * 2 * Math.PI;
		this.i = this.i % (2 * Math.PI);
		
		switch (this.movement) {
		case 0:		// horizontal
			if (this.inst.x !== this.lastKnownValue)
				this.initialValue += this.inst.x - this.lastKnownValue;
				
			this.inst.x = this.initialValue + Math.sin(this.i) * this.mag;
			this.lastKnownValue = this.inst.x;
			break;
		case 1:		// vertical
			if (this.inst.y !== this.lastKnownValue)
				this.initialValue += this.inst.y - this.lastKnownValue;
				
			this.inst.y = this.initialValue + Math.sin(this.i) * this.mag;
			this.lastKnownValue = this.inst.y;
			break;
		case 2:		// size
			this.inst.width = this.initialValue + Math.sin(this.i) * this.mag;
			this.inst.height = this.inst.width * this.ratio;
			break;
		case 3:		// width
			this.inst.width = this.initialValue + Math.sin(this.i) * this.mag;
			break;
		case 4:		// height
			this.inst.height = this.initialValue + Math.sin(this.i) * this.mag;
			break;
		case 5:		// angle
			if (this.inst.angle !== this.lastKnownValue)
				this.initialValue = cr.clamp_angle(this.initialValue + (this.inst.angle - this.lastKnownValue));
				
			this.inst.angle = cr.clamp_angle(this.initialValue + Math.sin(this.i) * this.mag);
			this.lastKnownValue = this.inst.angle;
			break;
		}
		
		this.inst.set_bbox_changed();
    };
    
    SineKlassProto.reset = function ()
    {
		switch (this.movement) {
		case 0:		// horizontal
			if (this.inst.x !== this.lastKnownValue)
				this.initialValue += this.inst.x - this.lastKnownValue;
				
			this.inst.x = this.initialValue;
			this.lastKnownValue = this.inst.x;
			break;
		case 1:		// vertical
			if (this.inst.y !== this.lastKnownValue)
				this.initialValue += this.inst.y - this.lastKnownValue;
				
			this.inst.y = this.initialValue;
			this.lastKnownValue = this.inst.y;
			break;
		case 2:		// size
			this.inst.width = this.initialValue;
			this.inst.height = this.inst.width * this.ratio;
			break;
		case 3:		// width
			this.inst.width = this.initialValue;
			break;
		case 4:		// height
			this.inst.height = this.initialValue;
			break;
		case 5:		// angle
			if (this.inst.angle !== this.lastKnownValue)
				this.initialValue = cr.clamp_angle(this.initialValue);
				
			this.inst.angle = cr.clamp_angle(this.initialValue);
			this.lastKnownValue = this.inst.angle;
			break;
		}
		
		this.inst.set_bbox_changed(); 
    }
}());