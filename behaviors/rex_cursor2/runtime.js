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
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
        
        type.TouchWrapGet();        
		this.pre_x = this.GetCursorX();
		this.pre_y = this.GetCursorY();
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
            var cur_x = this.GetCursorX();
            var cur_y = this.GetCursorY();
            var is_moving = (this.pre_x != cur_x) ||
                            (this.pre_y != cur_y);            
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
                this.pre_y = cur_y;              
            }
        
            if ((!this.is_moving) && is_moving)
                this.runtime.trigger(cr.behaviors.Rex_Cursor2.prototype.cnds.OnMovingStart, inst);
            else if (this.is_moving && (!is_moving))
                this.runtime.trigger(cr.behaviors.Rex_Cursor2.prototype.cnds.OnMovingEnd, inst);
            
            this.is_moving = is_moving;            
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
  
	behinstProto.GetCursorX = function()
	{
        var touch_obj = this.type.touchwrap;
        var x = touch_obj.CursorX(this.inst.layer.index);
        if (x == null)
        {
            x = touch_obj.X(this.inst.layer.index);
        }
        return x;     
	};
    
	behinstProto.GetCursorY = function()
	{
        var touch_obj = this.type.touchwrap;
        var y = touch_obj.CursorY(this.inst.layer.index);
        if (y == null)
        {
            y = touch_obj.Y(this.inst.layer.index);
        }
        return y;   
	};   

	behinstProto.IsCursorExisted = function()
	{
        var touch_obj = this.type.touchwrap;
        return (touch_obj.IsInTouch() || (touch_obj.CursorAbsoluteX() !== null));
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
    
	Cnds.prototype.OnMovingStart = function ()
	{
		return true;
	};
    
	Cnds.prototype.IsMoving = function ()
	{
		return (this.is_moving);
	};    
    
	Cnds.prototype.OnMovingEnd = function ()
	{
		return true;
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
        ret.set_float( this.GetCursorX() );
	};
	
	Exps.prototype.Y = function (ret)
	{
	    ret.set_float( this.GetCursorY() );
	};
	
	Exps.prototype.AbsoluteX = function (ret)
	{
	    var touch_obj = this.type.touchwrap;
        var x = touch_obj.CursorAbsoluteX();
        if (x == null)
        {
            x = touch_obj.AbsoluteX();
        }
        
        ret.set_float( x );
	};
	
	Exps.prototype.AbsoluteY = function (ret)
	{
	    var touch_obj = this.type.touchwrap;
        var y = touch_obj.CursorAbsoluteY();
        if (y == null)
        {
            y = touch_obj.AbsoluteY();
        }
                
        ret.set_float( y );
	};
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int((this.activated)? 1:0);
	};     
}());