// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Tilt2ArrowKey = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Tilt2ArrowKey.prototype;
		
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
        this.touchwrap = null;
        this.GetBeta = null;
        this.GetGamma = null;        
        this.degree_ZEROUD = 0;
        this.degree_ZEROLR = 0;
        this.degree_diffUD = 0;
        this.degree_diffLR = 0;
        this.keyUD = 0; // 0=no key, 1=up key, 2=down key 
        this.keyLR = 0; // 0=no key, 1=left key, 2=right key 
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
        this._tilt2arrowkey();
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
            assert("Tilt to Arrowkey: please put touchwrap object into project file.");
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
	instanceProto._tilt2arrowkey = function ()
	{
        if (this.touchwrap == null)
            return;
          
        var orientation = orientation_get();
        if (this.pre_orientation != orientation)
        {
            this._degree_ZERO_set();
            this.pre_orientation = orientation;
        }
        var dir = this._directions; //0=UD, 1=LR, 2=4dir, 3=8dir
        this.is_any_pressed = false;
        // key UD
        if ((dir==0) || (dir==2) || (dir==3))
            this._update_keyUD(orientation);
            
        // key LR
        if ((dir==1) || (dir==3) || ((dir==2) && (this.keyUD==0)))
            this._update_keyLR(orientation);
	}; 

	instanceProto._update_keyUD = function (orientation)
	{
        this.degree_diffUD = this._diffUD_get(orientation);
        var current_keyUD;
        if (Math.abs(this.degree_diffUD) >= this._sensitivity)
            current_keyUD = (this.degree_diffUD>0)? 1:2; // 1=up, 2=bottom
        else  // no key
            current_keyUD = 0;
        
        if (current_keyUD == this.keyUD)
            return;
            
        // release
        if (this.keyUD == 1)  // release up key
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnUPReleased, this);        
        else if (this.keyUD == 2)  // release bottom key
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnDOWNReleased, this);
               
        // press    
        if (current_keyUD == 1)  // press up key
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnUPPressed, this);       
        else if (current_keyUD == 2)  // press bottom key
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnDOWNPressed, this); 
        if (current_keyUD != 0)
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnAnyPressed, this);  
            
        this.keyUD = current_keyUD;
	};	
	instanceProto._update_keyLR = function (orientation)
	{
        // key LR
        this.degree_diffLR = this._diffLR_get(orientation);        
        var current_keyLR;
        if (Math.abs(this.degree_diffLR) >= this._sensitivity)
            current_keyLR = (this.degree_diffLR>0)? 1:2; // 1=left, 2=right
        else  // no key
            current_keyLR = 0;  
            
        if (current_keyLR == this.keyLR)
            return;
        
        // release
        if (this.keyLR == 1)  // release left key
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnLEFTReleased, this);        
        else if (this.keyLR == 2)  // release right key
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnRIGHTReleased, this);   
        
        // pressed
        if (current_keyLR == 1)  // press left key                
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnLEFTPressed, this);        
        else if (current_keyLR == 2)  // press right key              
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnRIGHTPressed, this); 
        if (current_keyLR != 0)
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnAnyPressed, this);   
             
        this.keyLR = current_keyLR; 
	};	
	
	instanceProto.saveToJSON = function ()
	{
		return { "s": this._sensitivity };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this._sensitivity = o["s"];
	};
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.IsUPDown = function()
	{
        return (this.keyUD == 1);
	};
	Cnds.prototype.IsDOWNDown = function()
	{
        return (this.keyUD == 2);
	};	
	Cnds.prototype.IsLEFTDown = function()
	{
        return (this.keyLR == 1);
	};
	Cnds.prototype.IsRIGHTDown = function()
	{
        return (this.keyLR == 2)
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
	    var ret;
	    if (!this.is_any_pressed)
	    {
	        this.is_any_pressed = true;
	        ret = true;
	    }
	    else
	        ret = false;
        return ret;    
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
	pluginProto.acts = new Acts();
	
    Acts.prototype.Calibration = function (ZERO_UD, ZERO_LR)
	{	     
        if (ZERO_UD==1)
            ZERO_UD = null;
        if (ZERO_LR==1)
            ZERO_LR = null;
        this._setup();        
        this._degree_ZERO_set(ZERO_UD, ZERO_LR);
	};
	
    Acts.prototype.SetSensitivity = function (a)
	{	     
        this._sensitivity = a; 
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
	Exps.prototype.RotateUD = function (ret)
	{
		ret.set_float(this.degree_diffUD);
	};
	Exps.prototype.RotateLR = function (ret)
	{
		ret.set_float(this.degree_diffLR);
	};
	Exps.prototype.SensitivityAngle = function (ret)
	{
		ret.set_float(this._sensitivity);
	};	
}());