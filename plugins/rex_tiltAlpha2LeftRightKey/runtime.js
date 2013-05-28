// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_TiltAlpha2LeftRightKey = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_TiltAlpha2LeftRightKey.prototype;
		
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
        this._sensitivity = this.properties[0]; 
        this.runtime.tickMe(this);
     
        this.setup_stage = true;
        this.touchwrap = null;
        this.GetAlpha = null;
        this.degree_ZERO = 0;
        this.degree_diff = 0;   
        this.key_status = 0;  // 0=no key, 1=right key, 2=left key 
        this.pre_orientation = 0;             
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
                this.GetAlpha = cr.plugins_.rex_TouchWrap.prototype.exps.Alpha;
                this.touchwrap.HookMe(this);
                break;
            }
        }
	}; 
    
    instanceProto.tick = function()
    {
        this._setup();
        this._turn_key_detection();
    };
    
	var orientation_get = function()
	{
	    var ret = window["orientation"];
	    if (ret == null)
	        ret = 0;
	    return ret;
	};
    
	instanceProto._alpha_get = function ()
	{
        var touch_obj = this.touchwrap;
        this.GetAlpha.call(touch_obj, touch_obj.fake_ret);
        return touch_obj.fake_ret.value;  
	};    
    
	instanceProto._setup = function ()
	{
        if (!this.setup_stage)
            return;
        
        this.TouchWrapGet();  
        this.setup_stage = false;
        if (this.touchwrap == null)
            assert("Tilt to LeftRight: please put touchwrap object into project file.");
        else
            this.degree_ZERO = this._alpha_get();
	};
    
	instanceProto._diff_angle_get = function ()
	{
        var current_angle = this._alpha_get();
        var diff = current_angle - this.degree_ZERO;
        if (diff > 180)
            diff = -360 + diff;
        else if (diff < -180)
            diff = 360 + diff;
        return diff;
	};
    
	instanceProto._turn_key_detection = function ()
	{
        if (this.touchwrap == null)
            return;
            
        var orientation = orientation_get();
        if (this.pre_orientation != orientation)
        {
            this._degree_ZERO_set();
            this.pre_orientation = orientation;
        }
        this.degree_diff = this._diff_angle_get();
        var current_key_status;
        if (Math.abs(this.degree_diff) >= this._sensitivity)
            current_key_status = (this.degree_diff>0)? 2:1;  // left:right
        else  // no key
            current_key_status = 0;
        
        if (current_key_status == this.key_status)
            return;

        if (this.key_status == 1)  // release right key
            this.runtime.trigger(cr.plugins_.Rex_TiltAlpha2LeftRightKey.prototype.cnds.OnRIGHTReleased, this);        
        else if (this.key_status == 2)  // release left key
            this.runtime.trigger(cr.plugins_.Rex_TiltAlpha2LeftRightKey.prototype.cnds.OnLEFTReleased, this);   
        
        
        if (current_key_status == 1)  // press right key
            this.runtime.trigger(cr.plugins_.Rex_TiltAlpha2LeftRightKey.prototype.cnds.OnRIGHTPressed, this);  
        else if (current_key_status == 2)  // press left key
            this.runtime.trigger(cr.plugins_.Rex_TiltAlpha2LeftRightKey.prototype.cnds.OnLEFTPressed, this);            
        
        if (current_key_status != 0)
            this.runtime.trigger(cr.plugins_.Rex_TiltAlpha2LeftRightKey.prototype.cnds.OnAnyPressed, this);     
        
        this.key_status = current_key_status;
	}; 
	instanceProto.saveToJSON = function ()
	{    
		return { "s": this._sensitivity
                 };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this._sensitivity = o["s"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.IsLEFTDown = function()
	{
        return (this.key_status == 2);
	};
	Cnds.prototype.IsRIGHTDown = function()
	{
        return (this.key_status == 1);
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
	pluginProto.acts = new Acts();
	
    Acts.prototype.Calibration = function ()
	{	     
        this._setup();
        this.degree_ZERO = this._alpha_get();
	};
	
    Acts.prototype.SetSensitivity = function (a)
	{	     
        this._sensitivity = a; 
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.ZEROAngle = function (ret)
	{
		ret.set_float(this.degree_ZERO);
	};
    
	Exps.prototype.RotateAngle = function (ret)
	{
		ret.set_float(this.degree_diff);
	};
}());