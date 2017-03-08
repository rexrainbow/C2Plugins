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
        this.runtime.trigger(cr.behaviors.Rex_SpriteExt.prototype.cnds.OnCreating, this.inst);     
	};  
	behinstProto.onDestroy = function()
	{
        this.runtime.trigger(cr.behaviors.Rex_SpriteExt.prototype.cnds.OnDestroying, this.inst);
	};    
    
	behinstProto.tick = function ()
	{
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

    // deprecated
	Cnds.prototype.IsShown = function ()
	{
        var layer = this.runtime.getLayerByNumber(this.inst.layer.index);
		return (layer.visible && this.inst.visible);  
	};

    // deprecated
	Cnds.prototype.OnCreating = function ()
	{
		return true;
	};
  
    // deprecated
	Cnds.prototype.OnDestroying = function ()
	{
		return true;
	};    

	Cnds.prototype.IsSolid = function ()
	{
		return !!this.inst.extra["solidEnabled"];  
	};

	Cnds.prototype.ContainsPt = function (x, y)
	{
		return this.inst.contains_pt(x, y);
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
	    if (s == 2)
	        s = (this.inst.width >= 0)? 0:1;
	    else
	        s = (s==1)? 0:1;
	    // s: 0=mirrored , 1=not mirrored
	    cr.plugins_.Sprite.prototype.acts.SetMirrored.call(this.inst, s);
	};

	Acts.prototype.SetFlipped = function (f)
	{
	    if (f == 2)
	        f = (this.inst.height >= 0)? 0:1;
	    else
	        f = (f==1)? 0:1;    
	    // f: 0=flipped , 1=not flipped
	    cr.plugins_.Sprite.prototype.acts.SetFlipped.call(this.inst, f);
	};
	
	Acts.prototype.SetSolid = function (e)
	{	    
	    if (e == 2)	    
	        this.inst.extra["solidEnabled"] = !this.inst.extra["solidEnabled"];	   
	    else
	        this.inst.extra["solidEnabled"] = (e === 1);
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.imageUrl = function (ret)
	{
		ret.set_string(this.inst.curFrame.getDataUri());
	};
	
	Exps.prototype.IsMirror = function (ret)
	{
		ret.set_int( (this.inst.width < 0)? 1:0 );
	};    
	
	Exps.prototype.IsFlipped = function (ret)
	{
		ret.set_int( (this.inst.height < 0)? 1:0 );
	};        
}());