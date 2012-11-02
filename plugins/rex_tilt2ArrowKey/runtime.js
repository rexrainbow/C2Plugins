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
        this.degree_ZEROUD = 0;
        this.degree_ZEROLR = 0;
        this.degree_diffUD = 0;
        this.degree_diffLR = 0;
        this.keyUD = 0; // 0=no key, 1=up key, 2=down key 
        this.keyLR = 0; // 0=no key, 1=left key, 2=right key 
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
	}
	
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
                      this.touchwrap.GetGamma():this.touchwrap.GetBeta();  
        }
        if (ZERO_LR == null)
        {
            ZERO_LR = (is_landspcape)?
                      this.touchwrap.GetBeta():this.touchwrap.GetGamma();  
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
            diff = -this.touchwrap.GetBeta() + this.degree_ZEROUD;  
            break;
        case 90:   // U:g- , D:g+
            diff = this.touchwrap.GetGamma() - this.degree_ZEROUD;
            break;
        case 180:  // U:b- , D:b+
            diff = this.touchwrap.GetBeta() - this.degree_ZEROUD;  
            break;
        case -90:  // U:g+ , D:g-
            diff = -this.touchwrap.GetGamma() + this.degree_ZEROUD;
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
            diff = -this.touchwrap.GetGamma() + this.degree_ZEROLR;
            break;
        case 90:   // L:b+ , R:b-
            diff = -this.touchwrap.GetBeta() + this.degree_ZEROLR;            
            break;
        case 180:  // L:g- , R:g+
            diff = this.touchwrap.GetGamma() - this.degree_ZEROLR;
            break;
        case -90:  // L:b- , R:b+
            diff = this.touchwrap.GetBeta() - this.degree_ZEROLR;         
            break;
        }
        return diff;
    };   
	instanceProto._tilt2arrowkey = function ()
	{
        if (this.touchwrap == null)
            return;
          
        var orientation = orientation_get();
        var dir = this._directions; //0=UD, 1=LR, 2=4dir, 3=8dir
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
        if (current_keyUD != this.keyUD)
        {
            if (this.keyUD == 1)  // release up key
                this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnUPKeyReleased, this);        
            else if (this.keyUD == 2)  // release bottom key
                this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnDOWNKeyReleased, this);   
            if (current_keyUD == 1)  // press up key
                this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnUPKey, this);        
            else if (current_keyUD == 2)  // press bottom key
                this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnDOWNKey, this); 
            this.keyUD = current_keyUD;
        }  
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
        if (current_keyLR != this.keyLR)
        {
            if (this.keyLR == 1)  // release left key
                this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnLEFTKeyReleased, this);        
            else if (this.keyLR == 2)  // release right key
                this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnRIGHTKeyReleased, this);   
            if (current_keyLR == 1)  // press left key
                this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnLEFTKey, this);        
            else if (current_keyLR == 2)  // press right key
                this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnRIGHTKey, this); 
            this.keyLR = current_keyLR;
        }  
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
    
	Cnds.prototype.OnUPKey = function()
	{
        return true;
	};
	Cnds.prototype.OnDOWNKey = function()
	{
        return true;    
	};    
	Cnds.prototype.OnLEFTKey = function()
	{
        return true;    
	};
	Cnds.prototype.OnRIGHTKey = function()
	{
        return true;    
	};      
	
	Cnds.prototype.OnAnyKey = function()
	{
        return true;    
	};
	
	Cnds.prototype.OnUPKeyReleased = function()
	{
        return true;
	};
	Cnds.prototype.OnDOWNKeyReleased = function()
	{
        return true;    
	};  
	Cnds.prototype.OnLEFTKeyReleased = function()
	{
        return true;    
	};
	Cnds.prototype.OnRIGHTKeyReleased = function()
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