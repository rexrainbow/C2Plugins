// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ArrowKey = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ArrowKey.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{  
	};
    
	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
        this._directions = this.properties[0]; 
        this._sensitivity = this.properties[1]; 
	    this._reset_origin = (this.properties[2] == 1); 
        var touched_layer = this.properties[3];
	            
        this.runtime.tickMe(this);

        // touch   
        this.touchwrap = null;
        this.GetX = null;
        this.GetY = null; 
        this.touch_src = null;    
        this.touched_layer = (isNaN(touched_layer))? touched_layer: parseInt(touched_layer);
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
        
        this.press_handlers =   [cr.plugins_.Rex_ArrowKey.prototype.cnds.OnRIGHTPressed,
                                 cr.plugins_.Rex_ArrowKey.prototype.cnds.OnDOWNPressed,
                                 cr.plugins_.Rex_ArrowKey.prototype.cnds.OnLEFTPressed,
                                 cr.plugins_.Rex_ArrowKey.prototype.cnds.OnUPPressed     ];   
        this.release_handlers = [cr.plugins_.Rex_ArrowKey.prototype.cnds.OnRIGHTReleased,
                                 cr.plugins_.Rex_ArrowKey.prototype.cnds.OnDOWNReleased,
                                 cr.plugins_.Rex_ArrowKey.prototype.cnds.OnLEFTReleased,
                                 cr.plugins_.Rex_ArrowKey.prototype.cnds.OnUPReleased    ];
	};

	instanceProto.TouchWrapGet = function ()
	{
        if (this.touchwrap != null)
            return this.touchwrap;
            
        assert2(cr.plugins_.rex_TouchWrap, "Dragging to ArrowKey: Can not find touchWrap oject.");
        var plugins = this.runtime.types
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.rex_TouchWrap.prototype.Instance)
            {
                this.touchwrap = inst;
                this.GetX = cr.plugins_.rex_TouchWrap.prototype.exps.XForID;
                this.GetY = cr.plugins_.rex_TouchWrap.prototype.exps.YForID;                
                this.touchwrap.HookMe(this);
                return this.touchwrap;
            }
        }
        assert2(this.touchwrap, "Dragging to ArrowKey: Can not find touchWrap oject.");
	};     
    
    instanceProto.OnTouchStart = function (touch_src, touchX, touchY)
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
        this.runtime.trigger(cr.plugins_.Rex_ArrowKey.prototype.cnds.OnDetectingStart, this);
    };
    
    instanceProto.OnTouchEnd = function (touch_src)
    {  
        if (touch_src != this.touch_src)
            return;
            
        this.touch_src = null; 
        this.is_on_dragging = false;
        this._keydown(0);
        this.runtime.trigger(cr.plugins_.Rex_ArrowKey.prototype.cnds.OnDetectingEnd, this);
    };
    
	instanceProto.get_touch_x = function ()
	{
	    if (this.touch_src === null)
	        return 0;
        
        var touch_obj = this.TouchWrapGet();
        this.GetX.call(touch_obj, 
            touch_obj.fake_ret, this.touch_src, this.touched_layer);
        return touch_obj.fake_ret.value;
	};  

	instanceProto.get_touch_y = function ()
	{
	    if (this.touch_src === null)
	        return 0;
        
        var touch_obj = this.TouchWrapGet();
        this.GetY.call(touch_obj, 
            touch_obj.fake_ret, this.touch_src, this.touched_layer);
        return touch_obj.fake_ret.value;   
	};
    
    var RIGHTKEY = 0x1;
    var DOWNKEY = 0x2;
    var LEFTKEY = 0x4;
    var UPKEY = 0x8;
	instanceProto.tick = function ()
	{
	    this.cmd_cancel = false;
	        
        var touch_obj = this.TouchWrapGet();
        if ((touch_obj == null) || (!this.is_on_dragging)) 
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
    instanceProto._keydown = function(key_id)
    {
        if (this.pre_key_id == key_id)
            return;
            
        var i;
        for (i=0; i<4; i++)
        {
            var is_key_down = ((_keyid_list[i] & key_id) != 0);            
            if (this.keyMap[i] && (!is_key_down))
                this.runtime.trigger(this.release_handlers[i], this);
        }
        var pressed_any_key = false;
        for (i=0; i<4; i++)
        {
            var is_key_down = ((_keyid_list[i] & key_id) != 0); 
            if ((!this.keyMap[i]) && is_key_down)
            {
                this.runtime.trigger(this.press_handlers[i], this);
                pressed_any_key = true;
            }
            this.keyMap[i] = is_key_down;
        }         
        if (pressed_any_key)
            this.runtime.trigger(cr.plugins_.Rex_ArrowKey.prototype.cnds.OnAnyKey, this);
        
        this.pre_key_id = key_id;
    };
    
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
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
	pluginProto.cnds = new Cnds();    

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
	pluginProto.acts = new Acts();
		
	Acts.prototype.Cancel = function ()
	{
	    var is_on_dragging = this.is_on_dragging;
	    
	    this.touch_src = null;
	    this.is_on_dragging = false;
        this.cmd_cancel = true;
        
        if (is_on_dragging)
            this.runtime.trigger(cr.plugins_.Rex_ArrowKey.prototype.cnds.OnDetectingEnd, this);
	};	
		
	Acts.prototype.SetTouchedLayer = function (layer)
	{
        if (!layer)
            return;
        
        this.touched_layer = layer.index;
	};	    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
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