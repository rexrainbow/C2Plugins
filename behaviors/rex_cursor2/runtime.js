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
		this.pre_x = this.GetX();
		this.pre_y = this.GetY();
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
        if (this.activated) 
        {
            var inst = this.inst;        
            var cur_x = this.GetX();
            var cur_y = this.GetY();
            var is_moving = (this.pre_x != cur_x) ||
                            (this.pre_x != cur_y);
            if ( is_moving )
            {
                switch (this.move_axis)
                {
                case 1:
                    inst.x = cur_x;
                    break;
                case 2:
                    inst.y = cur_y;
                    break;
                default:
                    inst.x = cur_x;
                    inst.y = cur_y;
                    break;
                }
                inst.set_bbox_changed();
                this.pre_x = cur_x;
                this.pre_x = cur_y;
                // Trigger OnMoving
                this.runtime.trigger(cr.behaviors.Rex_Cursor2.prototype.cnds.OnMoving, inst);
            }
        }
        
        if (this.invisible)
        {
            var visible = this.IsCursorExisted();
            if (this.inst.visible != visible)
            {
                this.inst.visible = visible;
                this.runtime.redraw = true;
            }
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

	behinstProto.IsCursorExisted = function()
	{
        var touch_obj = this.type.touchwrap;
        return (touch_obj.UseMouseInput())?  true : touch_obj.IsInTouch();
	};   
	
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.activated };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.activated = o["en"];
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
        ret.set_float( this.GetX() );
	};
	
	Exps.prototype.Y = function (ret)
	{
	    ret.set_float( this.GetY() );
	};
	
	Exps.prototype.AbsoluteX = function (ret)
	{
        ret.set_float( this.GetABSX() );
	};
	
	Exps.prototype.AbsoluteY = function (ret)
	{
        ret.set_float( this.GetABSY() );
	};
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int((this.activated)? 1:0);
	};     
}());