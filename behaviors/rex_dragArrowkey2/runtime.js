// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_DragArrowkey2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_DragArrowkey2.prototype;
		
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
        this.behavior_index = null;
        this._behavior_insts = [];
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
                this.touchwrap.HookMe(this);
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for Cursor behavior");
	};  
    
    behtypeProto.OnTouchStart = function (touch_src, touchX, touchY)
    {
        var sol = this.objtype.getCurrentSol(); 
        var select_all_save = sol.select_all;
        sol.select_all = true;
        var overlap_cnt = this.runtime.testAndSelectCanvasPointOverlap(this.objtype, touchX, touchY, false);
        if (overlap_cnt == 0)
        {
            // recover to select_all_save
            sol.select_all = select_all_save;        
            return false;
        }
        
        // overlap_cnt > 0
        // 0. find out index of behavior instance
        if (this.behavior_index == null )
            this.behavior_index = this.objtype.getBehaviorIndexByName(this.name);
            
            
        // 1. get all valid behavior instances            
        var ovl_insts = sol.getObjects();
        var i, cnt, inst, behavior_inst;          
        cnt = ovl_insts.length;           
        for (i=0; i<cnt; i++ )
        {
		    inst = ovl_insts[i];
            behavior_inst = inst.behavior_insts[this.behavior_index];
            if (behavior_inst.activated && (!behavior_inst.is_on_dragging))
            {
                behavior_inst.on_control_start(touch_src);  
                break;
            }
        }
        
        // recover to select_all_save
        sol.select_all = select_all_save;
    };
    
    behtypeProto.OnTouchEnd = function (touch_src)
    {
        if (this.behavior_index == null )
            return;
			
	    var sol = this.objtype.getCurrentSol();
        var select_all_save = sol.select_all;	
		sol.select_all = true;
		var insts = sol.getObjects();
        var i, cnt=insts.length, inst, behavior_inst;
        for (i=0; i<cnt; i++ )
        {
		    inst = insts[i];
            behavior_inst = inst.behavior_insts[this.behavior_index];
            if (behavior_inst.is_on_dragging && (behavior_inst.touch_src == touch_src))
            {
                behavior_inst.on_control_end();  
                break;
            }          
        }	
		sol.select_all = select_all_save;     
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
        this.activated = (this.properties[0]==1);  
        this._directions = this.properties[1]; 
        this._sensitivity = this.properties[2];
        this._angle_offset = (this.properties[3]==0)? 0:
                             (this.properties[3]==1)? 180:
                             (this.properties[3]==2)? 270:
                                                      90;

        this.is_on_dragging = false;         
        this.touch_src = null;
		this.pre_x = 0;
		this.pre_y = 0; 
        this.keyMap = [false, false, false, false];
        this.pre_key_id = 0;  
        
        this.press_handlers =   [cr.behaviors.Rex_DragArrowkey2.prototype.cnds.OnRIGHTPressed,
                                 cr.behaviors.Rex_DragArrowkey2.prototype.cnds.OnDOWNPressed,
                                 cr.behaviors.Rex_DragArrowkey2.prototype.cnds.OnLEFTPressed,
                                 cr.behaviors.Rex_DragArrowkey2.prototype.cnds.OnUPPressed     ];   
        this.release_handlers = [cr.behaviors.Rex_DragArrowkey2.prototype.cnds.OnRIGHTReleased,
                                 cr.behaviors.Rex_DragArrowkey2.prototype.cnds.OnDOWNReleased,
                                 cr.behaviors.Rex_DragArrowkey2.prototype.cnds.OnLEFTReleased,
                                 cr.behaviors.Rex_DragArrowkey2.prototype.cnds.OnUPReleased    ];             
	};
	
    var RIGHTKEY = 0x1;
    var DOWNKEY = 0x2;
    var LEFTKEY = 0x4;
    var UPKEY = 0x8;
	behinstProto.tick = function ()
	{  
        if ((this.type.touchwrap == null) || (!this.activated) || (!this.is_on_dragging)) 
            return;
        
        var cur_x = this.GetX();
        var cur_y = this.GetY();
        var dx = cur_x - this.pre_x;
        var dy = cur_y - this.pre_y;      
        
        if ( Math.sqrt(dx*dx + dy*dy) >= this._sensitivity )
        {
            var angle = cr.to_clamped_degrees(Math.atan2(dy,dx));
            angle -= this._angle_offset;
            switch (this._directions)
            {
            case 0:
                var key_id = (angle <180)? DOWNKEY:UPKEY;
                this._keydown(key_id);
                break;
            case 1:
                var key_id = ((angle >90) && (angle <=270))? LEFTKEY:RIGHTKEY;
                this._keydown(key_id);
                break;  
            case 2:
                var key_id = ((angle>45) && (angle<=135))?  DOWNKEY:
                             ((angle>135) && (angle<=225))? LEFTKEY:
                             ((angle>225) && (angle<=315))? UPKEY:RIGHTKEY;                          
                this._keydown(key_id);
                break;
            case 3:
                var key_id = ((angle>22.5) && (angle<=67.5))?   (DOWNKEY | RIGHTKEY):
                             ((angle>67.5) && (angle<=112.5))?  DOWNKEY:
                             ((angle>112.5) && (angle<=157.5))? (DOWNKEY | LEFTKEY):
                             ((angle>157.5) && (angle<=202.5))? LEFTKEY:
                             ((angle>202.5) && (angle<=247.5))? (LEFTKEY | UPKEY):
                             ((angle>247.5) && (angle<=292.5))? UPKEY:
                             ((angle>292.5) && (angle<=337.5))? (UPKEY | RIGHTKEY): RIGHTKEY;                          
                this._keydown(key_id);
                break;                
            }         
            this.pre_x = cur_x;
            this.pre_y = cur_y;                    
        }
	}; 
	
    var _keyid_list = [RIGHTKEY,DOWNKEY,LEFTKEY,UPKEY];       
    behinstProto._keydown = function(key_id)
    {
        if (this.pre_key_id == key_id)
            return;
            
        var i;
        for (i=0; i<4; i++)
        {
            var is_key_down = ((_keyid_list[i] & key_id) != 0);            
            if (this.keyMap[i] && (!is_key_down))
                this.runtime.trigger(this.release_handlers[i], this.inst);
        }
        var pressed_any_key = false;
        for (i=0; i<4; i++)
        {
            var is_key_down = ((_keyid_list[i] & key_id) != 0); 
            if ((!this.keyMap[i]) && is_key_down)
            {
                this.runtime.trigger(this.press_handlers[i], this.inst);
                pressed_any_key = true;
            }
            this.keyMap[i] = is_key_down;
        }         
        if (pressed_any_key)
            this.runtime.trigger(cr.behaviors.Rex_DragArrowkey2.prototype.cnds.OnAnyPressed, this.inst);
        
        this.pre_key_id = key_id;
    };
    
	behinstProto.on_control_start = function(touch_src)
	{
	    this.touch_src = touch_src;
	    this.is_on_dragging = true;  
		this.pre_x = this.GetX();
		this.pre_y = this.GetY();    	     
	};
	behinstProto.on_control_end = function()
	{
	    this.touch_src = null;
	    this.is_on_dragging = false;   
	};	
	behinstProto.GetX = function()
	{
        var touch_obj = this.type.touchwrap;
        this.type.GetX.call(touch_obj, 
                            touch_obj.fake_ret, this.touch_src, this.inst.layer.index);
        return touch_obj.fake_ret.value;          
	};
    
	behinstProto.GetY = function()
	{
        var touch_obj = this.type.touchwrap;
        this.type.GetY.call(touch_obj, 
                            touch_obj.fake_ret, this.touch_src, this.inst.layer.index);
        return touch_obj.fake_ret.value;         
	};  
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();    
   
	Cnds.prototype.IsUPDown = function()
	{
        return this.keyMap[3];
	};
	Cnds.prototype.IsDOWNDown = function()
	{
        return this.keyMap[1];    
	};	
	Cnds.prototype.IsLEFTDown = function()
	{
        return this.keyMap[2];
	};
	Cnds.prototype.IsRIGHTDown = function()
	{
        return this.keyMap[0];
	};    
    
	Cnds.prototype.OnUPPressed = function()
	{
        return true;
	};
	Cnds.prototype.OnDOWNPressed = function()
	{
        return true;    
	};    
	Cnds.prototype.OnLEFTPressed = function()
	{
        return true;    
	};
	Cnds.prototype.OnRIGHTPressed = function()
	{
        return true;    
	};      

	Cnds.prototype.OnAnyPressed = function()
	{
        return true;    
	};
	
	Cnds.prototype.OnUPReleased = function()
	{
        return true;
	};
	Cnds.prototype.OnDOWNReleased = function()
	{
        return true;    
	};  
	Cnds.prototype.OnLEFTReleased = function()
	{
        return true;    
	};
	Cnds.prototype.OnRIGHTReleased = function()
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

}());