// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Tilt2Angle = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Tilt2Angle.prototype;
		
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
        this.runtime.tickMe(this);
     
        this.setup_stage = true;
        this.touchwrap = null;
        this.GetBeta = null;
        this.GetGamma = null;        
        this.degree_ZEROUD = 0;
        this.degree_ZEROLR = 0;
        this.degree_diffUD = 0;
        this.degree_diffLR = 0;
        this.degree_tiltangle = 0;
        this.pre_orientation = 0;
        this.is_any_pressed = false;
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
                this.GetBeta = cr.plugins_.rex_TouchWrap.prototype.exps.Beta;
                this.GetGamma = cr.plugins_.rex_TouchWrap.prototype.exps.Gamma;                
                this.touchwrap.HookMe(this);
                break;
            }
        }
	}; 
    
    instanceProto.tick = function()
    {
        this._setup();
        this._tilt2angle();
    };
	
	var orientation_get = function()
	{
	    var ret = window["orientation"];
	    if (ret == null)
	        ret = 0;
	    return ret;
	};
    
	instanceProto._beta_get = function ()
	{
        var touch_obj = this.touchwrap;
        this.GetBeta.call(touch_obj, touch_obj.fake_ret);
        return touch_obj.fake_ret.value;  
	};  
    
	instanceProto._gamma_get = function ()
	{
        var touch_obj = this.touchwrap;
        this.GetGamma.call(touch_obj, touch_obj.fake_ret);
        return touch_obj.fake_ret.value;  
	};      
    
	instanceProto._setup = function ()
	{
        if (!this.setup_stage)
            return;
        
        this.TouchWrapGet();  
        this.setup_stage = false;
        if (this.touchwrap == null)
            assert("Tilt to Angle: please put touchwrap object into project file.");
        else        
            this._degree_ZERO_set();        
	};
	
	instanceProto._degree_ZERO_set = function (ZERO_UD, ZERO_LR)
	{
        var is_landspcape = (Math.abs(orientation_get()) == 90);  
        if (ZERO_UD == null)
        {
            ZERO_UD = (is_landspcape)?
                      this._gamma_get():this._beta_get();  
        }
        if (ZERO_LR == null)
        {
            ZERO_LR = (is_landspcape)?
                      this._beta_get():this._gamma_get();  
        }
        this.degree_ZEROUD = ZERO_UD;               
        this.degree_ZEROLR = ZERO_LR;  
	};	

    instanceProto._diffUD_get = function(orientation)
    {
        var diff;
        switch (orientation)
        {
        case 0:    // U:b+ , D:b-
            diff = -this._beta_get() + this.degree_ZEROUD;  
            break;
        case 90:   // U:g- , D:g+
            diff = this._gamma_get() - this.degree_ZEROUD;
            break;
        case 180:  // U:b- , D:b+
            diff = this._beta_get() - this.degree_ZEROUD;  
            break;
        case -90:  // U:g+ , D:g-
            diff = -this._gamma_get() + this.degree_ZEROUD;
            break;
        }
        return diff;
    };    
    instanceProto._diffLR_get = function(orientation)
    {
        var diff;
        switch (orientation)
        {
        case 0:    // L:g+ , R:g-
            diff = -this._gamma_get() + this.degree_ZEROLR;
            break;
        case 90:   // L:b+ , R:b-
            diff = -this._beta_get() + this.degree_ZEROLR;            
            break;
        case 180:  // L:g- , R:g+
            diff = this._gamma_get() - this.degree_ZEROLR;
            break;
        case -90:  // L:b- , R:b+
            diff = this._beta_get() - this.degree_ZEROLR;         
            break;
        }
        return diff;
    };   
	instanceProto._tilt2angle = function ()
	{
        if (this.touchwrap == null)
            return;
          
        var orientation = orientation_get();
        if (this.pre_orientation != orientation)
        {
            this._degree_ZERO_set();
            this.pre_orientation = orientation;
        }
        this.degree_diffUD = this._diffUD_get(orientation);
        this.degree_diffLR = this._diffLR_get(orientation);   
        this.degree_tiltangle = cr.to_degrees(cr.angleTo(0, 0, this.degree_diffLR, this.degree_diffUD));
	}; 
//////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    


	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
    Acts.prototype.Calibration = function (ZERO_UD, ZERO_LR)
	{	     
        if (ZERO_UD==1)      // 1 = get current angle
            ZERO_UD = null;
        if (ZERO_LR==1)     // 1 = get current angle
            ZERO_LR = null;
        this._setup();        
        this._degree_ZERO_set(ZERO_UD, ZERO_LR);
	};

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.ZEROUD = function (ret)
	{
		ret.set_float(this.degree_ZEROUD);
	};
	Exps.prototype.ZEROLR = function (ret)
	{
		ret.set_float(this.degree_ZEROLR);
	};   
	Exps.prototype.LengthX = function (ret)
	{
		ret.set_float(this.degree_diffUD);
	};
	Exps.prototype.LengthY = function (ret)
	{
		ret.set_float(this.degree_diffLR);
	};
	Exps.prototype.Angle = function (ret)
	{
		ret.set_float(this.degree_tiltangle);
	};    
	Exps.prototype.Length = function (ret)
	{
		ret.set_float(cr.distanceTo(0,0, this.degree_diffLR, this.degree_diffUD));
	};
}());