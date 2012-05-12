// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Ninja2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Ninja2.prototype;
		
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
                this.touchwrap.HookMe(this);
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for Cursor behavior");
	}; 
    
    behtypeProto.OnTouchStart = function ()
    {
    };
    
    behtypeProto.OnTouchEnd = function ()
    {
    };
    
    // export     
	behtypeProto.GetLayerX = function(inst)
	{
        return this.touchwrap.GetX(inst.layer);
	};
    
	behtypeProto.GetLayerY = function(inst)
	{
        return this.touchwrap.GetY(inst.layer);
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
        this.activated = this.properties[0];
        this.is_over = false;
        this.inst.visible = 0;
	};

	behinstProto.tick = function ()
	{
        if (this.activated==1)
        {
            var inst = this.inst;
            inst.update_bbox();
	        var lx = this.type.GetLayerX(inst);
		    var ly = this.type.GetLayerY(inst);
            this.is_over = (lx != null)? 
                           inst.contains_pt(lx, ly):
                           false;
            if (inst.visible != this.is_over)
            {
                inst.visible = this.is_over;
                this.runtime.redraw = true;
            }
            
            // Trigger OnOver
            if (this.is_over)
            {
                this.runtime.trigger(cr.behaviors.Rex_Ninja2.prototype.cnds.OnOver, inst);            
            }
        }
	};
    
	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;   
    
	cnds.OnOver = function ()
	{
		return true;
	};
    
	cnds.IsOver = function ()
	{
		return (this.is_over);
	};    
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetActivated = function (s)
	{
		this.activated = s;
	};  
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

}());