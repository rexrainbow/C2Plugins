// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Cursor2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Cursor2.prototype;
		
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
	behtypeProto.GetABSX = function ()
	{
        return this.touchwrap.GetAbsoluteX();
	};  

	behtypeProto.GetABSY = function ()
	{
        return this.touchwrap.GetAbsoluteY();
	};     
        
	behtypeProto.GetLayerX = function(inst)
	{
        return this.touchwrap.GetX(inst.layer);
	};
    
	behtypeProto.GetLayerY = function(inst)
	{
        return this.touchwrap.GetY(inst.layer);
	};  

	behtypeProto.IsCursorExisted = function()
	{
        return (this.touchwrap.UseMouseInput())?  true : this.touchwrap.IsInTouch();
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
		this.pre_x = type.GetABSX();
		this.pre_y = type.GetABSY(); 
        this.is_moving = false;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.activated = (this.properties[0] == 1);
        this.invisible = (this.properties[1]==1); 
        this.move_axis = this.properties[2];         
	};

	behinstProto.tick = function ()
	{
        if (this.activated) {
            var inst = this.inst;        
            var cursor_x = this.type.GetLayerX(inst);
            var cursor_y = this.type.GetLayerY(inst);
            switch (this.move_axis)
            {
                case 1:
                    inst.x = cursor_x;
                    break;
                case 2:
                    inst.y = cursor_y;
                    break;
                default:
                    inst.x = cursor_x;
                    inst.y = cursor_y;
                    break;
            }
            inst.set_bbox_changed();
            // Trigger OnMoving
            this.runtime.trigger(cr.behaviors.Rex_Cursor2.prototype.cnds.OnMoving, inst);
        }
        
        if (this.invisible)
        {
            var visible = this.type.IsCursorExisted();
            if (this.inst.visible != visible)
            {
                this.inst.visible = visible;
                this.runtime.redraw = true;
            }
        }
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();   
    
	Cnds.prototype.OnMoving = function ()
	{
		return true;
	};
    
	Cnds.prototype.IsMoving = function ()
	{
		return (this.is_moving);
	};    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s==1);
	};  
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.X = function (ret)
	{
        ret.set_float( this.type.GetLayerX(this.inst) );
	};
	
	Exps.prototype.Y = function (ret)
	{
	    ret.set_float( this.type.GetLayerY(this.inst) );
	};
	
	Exps.prototype.AbsoluteX = function (ret)
	{
        ret.set_float( this.type.GetABSX(this.inst) );
	};
	
	Exps.prototype.AbsoluteY = function (ret)
	{
        ret.set_float( this.type.GetABSY(this.inst) );
	};
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int((this.activated)? 1:0);
	};     
}());