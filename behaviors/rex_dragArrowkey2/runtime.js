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
	
	function GetThisBehavior(inst)
	{
		var i, len;
		for (i = 0, len = inst.behavior_insts.length; i < len; i++)
		{
			if (inst.behavior_insts[i] instanceof behaviorProto.Instance)
				return inst.behavior_insts[i];
		}
		
		return null;
	};	
    
    var _touch_insts = [];    
	var _behavior_insts = [];    
    behtypeProto.OnTouchStart = function (touch_src, touchX, touchY)
    {
        _touch_insts.length = 0;
        _behavior_insts.length = 0;        
        var insts = this.objtype.instances, inst;
        var lx, ly;
        var i, cnt=insts.length;
        for (i=0; i<cnt; i++)
        {
            inst = insts[i];
            inst.update_bbox();
			
			// Transform point from canvas to instance's layer
			lx = inst.layer.canvasToLayer(touchX, touchY, true);
			ly = inst.layer.canvasToLayer(touchX, touchY, false);
            
            if (inst.contains_pt(lx, ly))
                _touch_insts.push(inst);
        }
        
        var touch_insts_cnt=_touch_insts.length
        if (touch_insts_cnt === 0)
        {
            _touch_insts.length = 0;
            return false;
        }
        
        // touch_insts_cnt > 0
        // 0. find out index of behavior instance

        // 1. get all valid behavior instances
        var i, cnt, binst;          
        cnt = insts.length;           
        for (i=0; i<cnt; i++ )
        {
		    inst = _touch_insts[i];
		    if (!inst)
		    {
		        continue;
		        // insts might be removed
		    }	
            binst = GetThisBehavior(inst);
            if (!binst)
                continue;
            if (binst.activated && (!binst.is_on_dragging))
            {
                _touch_insts.length = 0;
                _behavior_insts.length = 0;                
                binst.on_control_start(touch_src);  
                return true;  // get drag inst  
            }
        }

        //return true;  // get drag inst         
    };
    
    behtypeProto.OnTouchEnd = function (touch_src)
    {
	    var sol = this.objtype.getCurrentSol();
        var select_all_save = sol.select_all;	
		sol.select_all = true;
		var insts = sol.getObjects();
        var i, cnt=insts.length, inst, binst;
        for (i=0; i<cnt; i++ )
        {
            binst = GetThisBehavior(insts[i]);
            if (binst.is_on_dragging && (binst.touch_src == touch_src))
            {
                binst.on_control_end();  
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
	    this._reset_origin = (this.properties[3] == 1);         

        this.is_on_dragging = false;         
        this.touch_src = null;        
		this.origin_x = 0;
		this.origin_y = 0;
		this.curr_x = 0;
		this.curr_y = 0;		
        this.is_on_dragging = false;
        this.cmd_cancel = false;
        this.keyMap = [false, false, false, false];
        this.pre_key_id = 0;
        this.diff_x = 0;
        this.diff_y = 0;  
        
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
	    if (this.cmd_cancel)
	        this.cmd_cancel = false;
	        
        if ((!this.activated) || (!this.is_on_dragging)) 
            return;

		this.curr_x = this.get_touch_x();
		this.curr_y = this.get_touch_y();        
        var dx = this.curr_x - this.origin_x;
        var dy = this.curr_y - this.origin_y;
        this.diff_x = dx;
        this.diff_y = dy;
        var dist_o2c = Math.sqrt(dx*dx + dy*dy);
        
        if ( dist_o2c >= this._sensitivity )
        {
            var angle = cr.to_clamped_degrees(Math.atan2(dy,dx));
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
            
            if (this._reset_origin)
            {
                this.origin_x = this.curr_x;
                this.origin_y = this.curr_y;                    
            }
        }
        else
        {
            if (!this._reset_origin)
            {
                this._keydown(0);
            }
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
        if (this.cmd_cancel)
        {
            this.cmd_cancel = false;
            return;
        }
        this.is_on_dragging = true;
        this.touch_src = touch_src;    
        this.origin_x = this.get_touch_x();
        this.origin_y = this.get_touch_y(); 
        this.runtime.trigger(cr.behaviors.Rex_DragArrowkey2.prototype.cnds.OnDetectingStart, this.inst);		    	     
	};
	behinstProto.on_control_end = function()
	{
        this.touch_src = null; 
        this.is_on_dragging = false;
        this._keydown(0);
        this.runtime.trigger(cr.behaviors.Rex_DragArrowkey2.prototype.cnds.OnDetectingEnd, this.inst);
	};	
	behinstProto.get_touch_x = function()
	{
        var touch_obj = this.type.touchwrap;
        this.type.GetX.call(touch_obj, 
                            touch_obj.fake_ret, this.touch_src, this.inst.layer.index);
        return touch_obj.fake_ret.value;          
	};
    
	behinstProto.get_touch_y = function()
	{
        var touch_obj = this.type.touchwrap;
        this.type.GetY.call(touch_obj, 
                            touch_obj.fake_ret, this.touch_src, this.inst.layer.index);
        return touch_obj.fake_ret.value;         
	};  
    
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{	  
        var key_name = "";
        if (this.pre_key_id & RIGHTKEY)
            key_name += "Right ";
        if (this.pre_key_id & DOWNKEY)
            key_name += "Down ";     
        if (this.pre_key_id & LEFTKEY)
            key_name += "Left ";
        if (this.pre_key_id & UPKEY)
            key_name += "Up ";                
		propsections.push({
			"title": this.type.name,
			"properties": [{"name": "Origin (floor)", "value": "("+Math.floor(this.origin_x)+","+Math.floor(this.origin_y)+")"},	
			               {"name": "Current (floor)", "value": "("+Math.floor(this.curr_x)+","+Math.floor(this.curr_y)+")"},	
			               {"name": "Pressed key", "value": key_name},			               
                           ]
		});
	};
	/**END-PREVIEWONLY**/  
    
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
	Cnds.prototype.IsAnyDown = function()
	{
        return this.keyMap[3] | this.keyMap[2] | this.keyMap[1] | this.keyMap[0];
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
      
	Cnds.prototype.OnDetectingStart = function()
	{
        return true;    
	};     
	Cnds.prototype.OnDetectingEnd = function()
	{
        return true;    
	};

	Cnds.prototype.IsInDetecting = function()
	{
        return this.is_on_dragging;
	};		 
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetDragAble = function (s)
	{
		this.activated = (s==1);
	};
	  
	Acts.prototype.Cancel = function ()
	{
	    var is_on_dragging = this.is_on_dragging;
	    
	    this.touch_src = null;
	    this.is_on_dragging = false;
        this.cmd_cancel = true;
        
        if (is_on_dragging)
            this.runtime.trigger(cr.plugins_.Rex_ArrowKey.prototype.cnds.OnDetectingEnd, this);
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.OX = function (ret)
	{
		ret.set_float(this.origin_x);
	};
	Exps.prototype.OY = function (ret)
	{
		ret.set_float(this.origin_y);
	};
	    
	Exps.prototype.DistX = function (ret)
	{
		ret.set_float(this.diff_x);
	};
	Exps.prototype.DistY = function (ret)
	{
		ret.set_float(this.diff_y);
	};
	
	Exps.prototype.CurrX = function (ret)
	{
		ret.set_float(this.curr_x);
	};
	Exps.prototype.CurrY = function (ret)
	{
		ret.set_float(this.curr_y);
	};	
}());