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
	};  
	behinstProto.onDestroy = function()
	{
	};    
    
	behinstProto.tick = function ()
	{
	};
	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.IsShown = function ()
	{
        var layer = this.runtime.getLayerByNumber(this.inst.layer.index);
		return (layer.visible && this.inst.visible);  
	};
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetVisible = function (s)
	{
        var visible = this.inst.visible
        if ( (visible && (s==1)) ||
             (!visible && (s==0))   )
            return;
		this.inst.visible = !visible;
        this.runtime.redraw = true;
	};    

	acts.SetMirrored = function (s)
	{
        var width = this.inst.width;
        if ( ((width >= 0) && (s==0)) ||
             ((width <  0) && (s==1))    )
            return;
            
		this.inst.width = -width;
        this.runtime.redraw = true;
	};

	acts.SetFlipped = function (s)
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
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;
    
}());