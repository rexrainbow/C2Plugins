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
        this.GetX = null;
        this.GetY = null;        
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
                this.touchwrap.HookMe(this);
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for Ninja2 behavior");
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
        this.activated = (this.properties[0] == 1);
        this.is_over = false;
        this.inst.visible = 0;
	};

	behinstProto.tick = function ()
	{
        if (this.activated)
        {
            var inst = this.inst;
            inst.update_bbox();
	        var lx = this.GetX();
		    var ly = this.GetY();
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
    
	Cnds.prototype.OnOver = function ()
	{
		return true;
	};
    
	Cnds.prototype.IsOver = function ()
	{
		return (this.is_over);
	};    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s == 1);
	};  
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());