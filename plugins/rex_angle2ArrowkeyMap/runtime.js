// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_angle2ArrowKeyMap = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_angle2ArrowKeyMap.prototype;
		
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

    var INVALIDKEY = 0;
    var RIGHTKEY = 0x1;
    var DOWNKEY = 0x2;
    var LEFTKEY = 0x4;
    var UPKEY = 0x8;
	instanceProto.onCreate = function()
	{
        this._directions = this.properties[0];
        this._sensitivity = this.properties[1]; 
        
        this.keyMap = [false, false, false, false];  //[RIGHTKEY,DOWNKEY,LEFTKEY,UPKEY]
        this._curkeyMap = [false, false, false, false];
        this.pre_key_id = INVALIDKEY;             
	};


	instanceProto.angle2keyID = function (angle)
	{
	    angle = (angle % 360);
	    if (angle <0)
	        angle += 360;
	        
        var key_id;
        switch (this._directions)
        {
        case 0:
            key_id = (angle <180)? DOWNKEY:UPKEY;
            break;
        case 1:
            key_id = ((angle >90) && (angle <=270))? LEFTKEY:RIGHTKEY;
            break;  
        case 2:
            key_id = ((angle>45) && (angle<=135))?  DOWNKEY:
                      ((angle>135) && (angle<=225))? LEFTKEY:
                      ((angle>225) && (angle<=315))? UPKEY:RIGHTKEY;
            break;
        case 3:
            key_id = ((angle>22.5) && (angle<=67.5))?   (DOWNKEY | RIGHTKEY):
                      ((angle>67.5) && (angle<=112.5))?  DOWNKEY:
                      ((angle>112.5) && (angle<=157.5))? (DOWNKEY | LEFTKEY):
                      ((angle>157.5) && (angle<=202.5))? LEFTKEY:
                      ((angle>202.5) && (angle<=247.5))? (LEFTKEY | UPKEY):
                      ((angle>247.5) && (angle<=292.5))? UPKEY:
                      ((angle>292.5) && (angle<=337.5))? (UPKEY | RIGHTKEY): RIGHTKEY;
            break;                
        }
        return key_id;
	}; 
    
	instanceProto.keyID2Angle = function (key_id)
	{    
        var angle = null;
        switch (key_id)
        {
        case RIGHTKEY:           angle = 0; break;
        case DOWNKEY:            angle = 90; break;
        case LEFTKEY:            angle = 180; break;
        case UPKEY:              angle = 270; break;        
        case RIGHTKEY | DOWNKEY: angle = 45; break;
        case RIGHTKEY | UPKEY:   angle = 315; break;
        case LEFTKEY | DOWNKEY:  angle = 135; break;
        case LEFTKEY | UPKEY:    angle = 225; break;     
        }
        return angle;
	};    

	instanceProto.angle_set = function (angle)
	{
        this._keydown(this.angle2keyID(angle));
	}; 
    
    var _keyid_list = [RIGHTKEY,DOWNKEY,LEFTKEY,UPKEY];       
    instanceProto._keydown = function(key_id)
    {
        if (this.pre_key_id == key_id)
            return;
            
        var i, cur_key_down, pre_key_down;
        for (i=0; i<4; i++)
        {
            this._curkeyMap[i] = ((_keyid_list[i] & key_id) != 0);      
        }   
        var pressed_any_key = false;
        for (i=0; i<4; i++)
        {
            pre_key_down = this.keyMap[i];
            cur_key_down = this._curkeyMap[i]; 
            
            if (pre_key_down && (!cur_key_down))
            {
                this.runtime.trigger(on_release_handlers[i], this);
            }
            else if ((!pre_key_down) && cur_key_down)
            {
                this.runtime.trigger(on_press_handlers[i], this);
                pressed_any_key = true;
            }
            this.keyMap[i] = cur_key_down;
        }         
        if (pressed_any_key)
            this.runtime.trigger(cr.plugins_.Rex_angle2ArrowKeyMap.prototype.cnds.OnAnyKey, this);
        
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
			"properties": [{"name": "Pressed key", "value": key_name},			               
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
    var on_press_handlers = [Cnds.OnRIGHTPressed,
                             Cnds.OnDOWNPressed,
                             Cnds.OnLEFTPressed,
                             Cnds.OnUPPressed     ];   
    var on_release_handlers = [Cnds.OnRIGHTReleased,
                               Cnds.OnDOWNReleased,
                               Cnds.OnLEFTReleased,
                               Cnds.OnUPReleased    ];
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.SetInput = function (angle, distance)
	{
        if (distance >= this._sensitivity)
            this.angle_set(angle);
        else
            this._keydown(INVALIDKEY);
	};
    
	Acts.prototype.Release = function ()
	{        
        this._keydown(INVALIDKEY);
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.ArrowkeyAngle = function (ret, angle_in)
	{
        var key_id = (angle_in != null)? this.angle2keyID(angle_in):this.pre_key_id;
        var angle = this.keyID2Angle(key_id);
		ret.set_float(angle);
	};
}());