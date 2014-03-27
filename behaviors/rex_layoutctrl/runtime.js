// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_LayoutCtrl = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_LayoutCtrl.prototype;
		
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
	};	

	behinstProto.tick2 = function()
	{
        var inst =this.inst;
        var layout = this.runtime.running_layout;
	    if ((inst.width != this._width_save) || (inst.height != this._height_save))
	    {
	        var wscale = inst.width/this._width_init;
	        var hscale = inst.height/this._height_init;
	        var scale = Math.min(wscale, hscale);
            if (layout.scale != scale)
            {
                layout.scale = scale;        
                layout.boundScrolling();                
                this.runtime.redraw = true;	    
            }
	        this._width_save = inst.width;
	        this._height_save = inst.height;
	    }
	    
	    if (this._angle_save != inst.angle)
	    {
            if (layout.angle != inst.angle)
            {
	            layout.angle = inst.angle;
	            this.runtime.redraw = true;
            }
	        this._angle_save = inst.angle;
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