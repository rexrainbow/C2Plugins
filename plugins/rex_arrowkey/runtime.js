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
        this.runtime.tickMe(this);
     
        this.setup_stage = true;
        // touch   
        this.touchwrap = null;
		this.pre_x = 0;
		this.pre_y = 0;           
        this.is_on_moving = false;  
        this.keyMap = [false, false, false, false];
        
        this.press_handlers =   [cr.plugins_.Rex_ArrowKey.prototype.cnds.OnRIGHTKey,
                                 cr.plugins_.Rex_ArrowKey.prototype.cnds.OnDOWNKey,
                                 cr.plugins_.Rex_ArrowKey.prototype.cnds.OnLEFTKey,
                                 cr.plugins_.Rex_ArrowKey.prototype.cnds.OnUPKey            ];   
        this.release_handlers = [cr.plugins_.Rex_ArrowKey.prototype.cnds.OnRIGHTKeyReleased,
                                 cr.plugins_.Rex_ArrowKey.prototype.cnds.OnDOWNKeyReleased,
                                 cr.plugins_.Rex_ArrowKey.prototype.cnds.OnLEFTKeyReleased,
                                 cr.plugins_.Rex_ArrowKey.prototype.cnds.OnUPKeyReleased    ];
	};

	instanceProto.TouchWrapGet = function ()
	{  
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
	}; 
    
    instanceProto.OnTouchStart = function ()
    {
        this.is_on_moving = true;
        this.pre_x = this.get_touch_x();
        this.pre_y = this.get_touch_y(); 
    };
    
    instanceProto.OnTouchEnd = function ()
    {
        this.is_on_moving = false;
        var i;
        for (i=0; i<4; i++)
        {
            if (this.keyMap[i])
            {
                this.runtime.trigger(this.release_handlers[i], this);
                this.keyMap[i] = false;
            }
        }
    };
    
	instanceProto.get_touch_x = function ()
	{
        return this.touchwrap.GetAbsoluteX();
	};  

	instanceProto.get_touch_y = function ()
	{
        return this.touchwrap.GetAbsoluteY();
	};
    
    instanceProto.tick = function()
    {
        this._setup();
        this._touch_arrow();
    };

	instanceProto._setup = function ()
	{
        if (!this.setup_stage)
            return;
        
        this.TouchWrapGet();  
        this.setup_stage = false;
        if (this.touchwrap == null)
            assert("Arrow key object need at least one input signal.");
	};
    
    var RIGHTKEY = 0x1;
    var DOWNKEY = 0x2;
    var LEFTKEY = 0x4;
    var UPKEY = 0x8;
	instanceProto._touch_arrow = function ()
	{
        if ((this.touchwrap == null) || (!this.is_on_moving))
            return;
        
        var cur_x = this.get_touch_x();
        var cur_y = this.get_touch_y();
        var dx = cur_x - this.pre_x;
        var dy = cur_y - this.pre_y;
        if ( Math.sqrt(dx*dx + dy*dy) >= this._sensitivity )
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
            this.pre_x = cur_x;
            this.pre_y = cur_y;                    
        }
	}; 
    
    var _keyid_list = [RIGHTKEY,DOWNKEY,LEFTKEY,UPKEY];       
    instanceProto._keydown = function(key_id)
    {
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
    };
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    

	cnds.IsUPDown = function()
	{
        return this.keyMap[3];
	};
	cnds.IsDOWNDown = function()
	{
        return this.keyMap[1];    
	};	
	cnds.IsLEFTDown = function()
	{
        return this.keyMap[2];
	};
	cnds.IsRIGHTDown = function()
	{
        return this.keyMap[0];
	};    
    
	cnds.OnUPKey = function()
	{
        return true;
	};
	cnds.OnDOWNKey = function()
	{
        return true;    
	};    
	cnds.OnLEFTKey = function()
	{
        return true;    
	};
	cnds.OnRIGHTKey = function()
	{
        return true;    
	};      
	
	cnds.OnAnyKey = function()
	{
        return true;    
	};
	
	cnds.OnUPKeyReleased = function()
	{
        return true;
	};
	cnds.OnDOWNKeyReleased = function()
	{
        return true;    
	};  
	cnds.OnLEFTKeyReleased = function()
	{
        return true;    
	};
	cnds.OnRIGHTKeyReleased = function()
	{
        return true;    
	};   
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

}());