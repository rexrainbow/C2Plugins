// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_TouchDirection2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_TouchDirection2.prototype;
		
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
        this.GetSpeed = null;                
        this.behavior_index = null;
        
        this.touch_src = null;
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
                this.GetX = cr.plugins_.rex_TouchWrap.prototype.exps.XForID;
                this.GetY = cr.plugins_.rex_TouchWrap.prototype.exps.YForID;
                this.GetAbsoluteX = cr.plugins_.rex_TouchWrap.prototype.exps.AbsoluteXForID;
                this.GetAbsoluteY = cr.plugins_.rex_TouchWrap.prototype.exps.AbsoluteYForID;  
                this.GetSpeed = cr.plugins_.rex_TouchWrap.prototype.exps.SpeedAt;                
                this.touchwrap.HookMe(this);
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for Cursor behavior");
	};   
    
    behtypeProto.OnTouchStart = function (touch_src, touchX, touchY)
    {      
	    if (this.touch_src != null)
		    return;
			
        this.touch_src = touch_src;          
        if (this.behavior_index == null )
            this.behavior_index = this.objtype.getBehaviorIndexByName(this.name);
            
        var insts = this.objtype.instances;
        var inst, i, cnt = insts.length;

        for (i=0; i<cnt; i++ )
        {
            inst = insts[i].behavior_insts[this.behavior_index];            
            inst.on_moving_start();
        }      
    };
    
    behtypeProto.OnTouchEnd = function (touch_src)
    {       
        if (this.touch_src != touch_src)
            return;
                    
        if (this.behavior_index == null )
            this.behavior_index = this.objtype.getBehaviorIndexByName(this.name);
            
        var insts = this.objtype.instances;
        var inst, i, cnt = insts.length;

        for (i=0; i<cnt; i++ )
        {
            inst = insts[i].behavior_insts[this.behavior_index];            
            inst.on_moving_end();
        }  
        this.touch_src = null;               
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
		this.pre_x = 0;
		this.pre_y = 0;           
        this.is_on_drag = false;
        this._dir = null;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{   
        this.activated = (this.properties[0] == 1); 
        this.move_axis = this.properties[1]; 
        this.move_proportion = this.properties[2];
	};

	behinstProto.tick = function ()
	{        
        if ( (!this.activated) || (!this.is_on_drag) )
            return;
             
        // this.activated && this.is_on_drag                        
        var inst = this.inst;
        var cur_x = this.GetOffsetX();
        var cur_y = this.GetOffsetY();
        var dx = cur_x - this.pre_x;
        var dy = cur_y - this.pre_y;             
        if ( (dx!=0) || (dy!=0) )
        {               
            switch (this.move_axis)
            {
                case 1:    // Horizontal
                    inst.x += (this.move_proportion * dx);
                    break;
                case 2:    // Vertical
                    inst.y += (this.move_proportion * dy);
                    break;
                case 3:    // Horizontal or vertical
                    if (this._dir == null)
                        this._dir = (Math.abs(dx) >= Math.abs(dy))? 0:1;
                    if (this._dir == 0)
                        inst.x += (this.move_proportion * dx);
                    else if (this._dir == 1)
                        inst.y += (this.move_proportion * dy);
                    break;
                default:   // Both
                    inst.x += (this.move_proportion * dx);
                    inst.y += (this.move_proportion * dy);
                    break;
            }
            inst.set_bbox_changed();
            this.pre_x = cur_x;
            this.pre_y = cur_y;              
        }
	};  

	behinstProto.on_moving_start = function()
	{   
        this.is_on_drag = true;
        this._dir = null;
        this.pre_x = this.GetOffsetX();
        this.pre_y = this.GetOffsetY();
        this.runtime.trigger(cr.behaviors.Rex_TouchDirection2.prototype.cnds.OnDraggingStart, this.inst);
	};

	behinstProto.on_moving_end = function()
	{   
        this.is_on_drag = false;
        this.runtime.trigger(cr.behaviors.Rex_TouchDirection2.prototype.cnds.OnDraggingStop, this.inst);
	};
	  
	behinstProto.GetABSX = function ()
	{
        var touch_obj = this.type.touchwrap;
        this.type.GetAbsoluteX.call(touch_obj, touch_obj.fake_ret, this.type.touch_src);
        return touch_obj.fake_ret.value;
	};  

	behinstProto.GetABSY = function ()
	{
        var touch_obj = this.type.touchwrap;
        this.type.GetAbsoluteY.call(touch_obj, touch_obj.fake_ret, this.type.touch_src);
        return touch_obj.fake_ret.value;        
	};     
        
	behinstProto.GetX = function()
	{
        var touch_obj = this.type.touchwrap;
        this.type.GetX.call(touch_obj, 
                            touch_obj.fake_ret, this.type.touch_src, this.inst.layer.index);
        return touch_obj.fake_ret.value;          
	};
    
	behinstProto.GetY = function()
	{
        var touch_obj = this.type.touchwrap;
        this.type.GetY.call(touch_obj, 
                            touch_obj.fake_ret, this.type.touch_src, this.inst.layer.index);
        return touch_obj.fake_ret.value;         
	};   
    
	behinstProto.GetSpeed = function()
	{
        var touch_obj = this.type.touchwrap;
        this.type.GetSpeed.call(touch_obj, touch_obj.fake_ret, 0);
        return touch_obj.fake_ret.value;     
	};   	
	
	behinstProto.GetOffsetX = function()
	{
        var x = this.GetX();
        var layer = this.inst.layer;
        var scrollX = (layer.parallaxX != 0)? layer.layout.scrollX : 0;
        return x - scrollX;     
	};
    
	behinstProto.GetOffsetY = function()
	{
        var y = this.GetY();
        var layer = this.inst.layer;
        var scrollY = (layer.parallaxX != 0)? layer.layout.scrollY : 0;
        return y - scrollY;     
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
    
	Cnds.prototype.OnDraggingStart = function ()
	{
        return true;
	};
    
	Cnds.prototype.OnDraggingStop = function ()
	{
		return true;
	}; 

 	Cnds.prototype.OnDragging = function ()
	{   
        return true;
    }
    
 	Cnds.prototype.IsDragging = function ()
	{   
        return (this.is_on_drag);
    }    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
        if ( (!this.activated) && 
             this.is_on_drag &&
             (s==1)
           )
        {
            this._dir = null;
        this.pre_x = this.GetOffsetX();
        this.pre_y = this.GetOffsetY();
        }
		this.activated = (s==1);
	}; 

	Acts.prototype.SetProportion = function (s)
	{
		this.move_proportion = s;
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
		ret.set_int(this.activated);
	}; 
    
	Exps.prototype.Proportion = function (ret)
	{
		ret.set_float(this.move_proportion);
	}; 
    
	Exps.prototype.Speed = function (ret)
	{
		ret.set_float(this.GetSpeed());
	};     
}());