// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_LayerCtrl = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_LayerCtrl.prototype;
		
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
	    this._width_init = this.inst.width;
	    this._height_init = this.height;
 
	    this._init();    
	};

	behinstProto.tick = function ()
	{
	};  
	
	behinstProto._init = function()
	{
        var inst = this.inst;
	    this._width_save = inst.width;
	    this._height_save = inst.height;
	    this._angle_save = inst.angle;
	    this._opactiy_save = inst.opacity;
	    this._visible_save = inst.visible;
	};	

	behinstProto.tick2 = function()
	{
        var inst =this.inst;
        var layer = inst.layer;
	    if ((inst.width != this._width_save) || (inst.height != this._height_save))
	    {
	        var wscale = inst.width/this._width_init;
	        var hscale = inst.height/this._height_init;
	        var scale = Math.min(wscale, hscale);
            if (layer.scale != scale)
            {
                layer.scale = scale;
                this.runtime.redraw = true;	    
            }
	        this._width_save = inst.width;
	        this._height_save = inst.height;
	    }
	    
	    if (this._angle_save != inst.angle)
	    {
            if (layer.angle != inst.angle)
            {        
	            layer.angle = inst.angle;
	            this.runtime.redraw = true;
            }
	        this._angle_save = inst.angle;
	    }
	    
	    if (this._opactiy_save != inst.opacity)
	    {
	        var opacity_ = cr.clamp(inst.opacity, 0, 1);
            if (layer.opacity != opacity_)
            {
	            layer.opacity = opacity_;
	            this.runtime.redraw = true;
            }
	        this._opactiy_save = opacity_; 
	    }
	    
	    if (this._visible_save != inst.visible)
	    {
            if (layer.visible != inst.visible)
            {
	            layer.visible = inst.visible;
	             this.runtime.redraw = true;
            }
	        this._visible_save = inst.visible;	  
	    }	    
	};	
		
	behinstProto.loadFromJSON = function (o)
	{
        this._init();       
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());