// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_SpriteExt = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_SpriteExt.prototype;
		
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
	    this._has_SysExtPlg = (cr.plugins_.Rex_SysExt != null);
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime; 
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
	    if (this.type._has_SysExtPlg)
	        cr.plugins_.Rex_SysExt.push_inst(this.inst);	      
        this.runtime.trigger(cr.behaviors.Rex_SpriteExt.prototype.cnds.OnCreating, this.inst);     
	};  
	behinstProto.onDestroy = function()
	{	    	    
        this.runtime.trigger(cr.behaviors.Rex_SpriteExt.prototype.cnds.OnDestroying, this.inst);            
	    if (this.type._has_SysExtPlg)
	        cr.plugins_.Rex_SysExt.remove_inst(this.inst);	        
	};    
    
	behinstProto.tick = function ()
	{
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.IsShown = function ()
	{
        var layer = this.runtime.getLayerByNumber(this.inst.layer.index);
		return (layer.visible && this.inst.visible);  
	};

	Cnds.prototype.OnCreating = function ()
	{
		return true;
	};

	Cnds.prototype.OnDestroying = function ()
	{
		return true;
	};    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetVisible = function (s)
	{
        var visible = this.inst.visible
        if ( (visible && (s==1)) ||
             (!visible && (s==0))   )
            return;
		this.inst.visible = !visible;
        this.runtime.redraw = true;
	};    

	Acts.prototype.SetMirrored = function (s)
	{
        var width = this.inst.width;
        if ( ((width >= 0) && (s==0)) ||
             ((width <  0) && (s==1))    )
            return;
            
		this.inst.width = -width;
        this.runtime.redraw = true;
	};

	Acts.prototype.SetFlipped = function (s)
	{
        var height = this.inst.height;
        if ( ((height >= 0) && (s==0)) ||
             ((height <  0) && (s==1))    )
            return;
            
		this.inst.height = -height;
        this.runtime.redraw = true;
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
}());