// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_ShakeMod = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_ShakeMod.prototype;
		
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
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		this.enabled = (this.properties[0] !== 0);
		var mode = this.properties[1];
        this.effectMode = (mode === 0);
        this.behaviorMode = (mode === 1);
        this.duration = this.properties[2];
        this.magnitude = this.properties[3];
        this.magMode = this.properties[4];

        this.isShaking = false; 
        this.OX = null;
        this.OY = null;
        this.remaining = 0;
        
        this.is_my_call = false;        
	};

	behinstProto.tick = function ()
	{
        if (this.effectMode)          // Effect
        {
            this.BackToOrigin();
        }
        else if (this.behaviorMode)  // Behavior
        {
            this.BackToOrigin(true);
            this.Shake();
        }
	};
	
	behinstProto.tick2 = function ()
	{
        if (this.effectMode)
        {
            this.Shake();
        }
        else if (this.behaviorMode)
        {
            
        }
	};
    
	behinstProto.Shake = function ()
	{
        if ( (!this.enabled) || (!this.isShaking) ) 
            return;
        
		var dt = this.runtime.getDt(this.inst);
        if (dt == 0)
            return;
        
        // save origin to current position
        this.OX = this.inst.x;
        this.OY = this.inst.y;
		var isEnded = this.ShakePos(dt);   

        if (isEnded)        
        {
			this.OX = null;
			this.OY = null;			
            this.isShaking = false;
            this.is_my_call = true;
            this.runtime.trigger(cr.behaviors.Rex_ShakeMod.prototype.cnds.OnShackingEnd, this.inst); 
            this.is_my_call = false;
        }
	};    

	behinstProto.ShakePos = function (dt)
	{		
        var isEnded = (this.remaining <= dt);
        
        var offx, offy;
        if (isEnded)
        {
            offx = 0;
            offy = 0;                       
        }
        else
        {
            var mag = this.magnitude * Math.min(this.runtime.timescale, 1);
            if (this.magMode === 1)  // decay
            {
                mag *= this.remaining/this.duration;
            }
            var a = Math.random() * Math.PI * 2;
            offx = Math.cos(a) * mag;
            offy = Math.sin(a) * mag;
        }

        // add offset to origin
        var nx = this.OX + offx;
        var ny = this.OY + offy; 
        if ((nx !== this.inst.x) || (ny !== this.inst.y))
        {
		    this.inst.x = nx;
		    this.inst.y = ny;
		    this.inst.set_bbox_changed();
        }
        
        this.remaining -= dt;
        return isEnded;
	};    
    
	behinstProto.BackToOrigin = function (noUpdateBBox)
	{
        if ( (!this.enabled) || (!this.isShaking) ) 
            return;        
        
        if (this.OX === null)
            return;
        
        if ((this.OX === this.inst.x) && (this.OY === this.inst.y))
            return;
        
        // go back to origin point
        this.inst.x = this.OX;
        this.inst.y = this.OY;
        this.OX = null;
        this.OY = null;                
        
        if (!noUpdateBBox)
            this.inst.set_bbox_changed();   
	};    

	behinstProto.saveToJSON = function ()
	{
		return {
            "e": this.enable,
			"dur": this.duration,
			"mag": this.magnitude,
			"magMode": this.magMode,
            
            "isShake": this.isShaking,
            "ox": this.OX,
            "oy": this.OY,
            "rem": this.remaining,
		};
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.enable = o["e"];
        this.duration = o["dur"]
		this.magnitude = o["mag"];
        this.magMode = o["magMode"];
        
        this.isShaking = o["isShake"];
        this.OX = o["ox"];
        this.OY = o["oy"];
        this.remaining = o["rem"];
	};
	 

	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{        
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Shaking", "value": this.isShaking},
				{"name": "Duration", "value": this.duration},      
                {"name": "Magnitude", "value": this.magnitude},                
				{"name": "Rememder", "value": (this.remaining > 0)? this.remaining : 0},
				{"name": "Origin", "value": this.OX + " , " + this.OY},
				{"name": "Enabled", "value": this.enabled}
			]
		});
	};
	/**END-PREVIEWONLY**/

    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnShackingEnd = function ()
	{
		return (this.is_my_call);
	};
    
	Cnds.prototype.IsShaking = function ()
	{
		return (this.enabled && this.isShaking);
	};    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (e)
	{
		this.enabled = (e === 1);     
	};

	Acts.prototype.Start = function ()
	{
        this.isShaking = true;
        this.remaining = this.duration;  
	};
    
 	Acts.prototype.Stop = function ()
	{
        this.isShaking = false;
        this.remaining = 0;
	};   	    
    
	Acts.prototype.SetDuration = function (t)
	{
        if (this.isShaking)
        {
            this.remaining += (t - this.duration);
        }
        this.duration = t;
	}; 
    
	Acts.prototype.SetMagnitude = function (m)
	{
        this.magnitude = m;
	}; 
    
	Acts.prototype.SetMagnitudeMode = function (m)
	{
        this.magMode = m;
	};     
    //////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.OX = function (ret)
	{        
        var x = (this.OX !== null)? this.OX : this.inst.x;
		ret.set_float( x );
	}; 

	Exps.prototype.OY = function (ret)
	{        
        var y = (this.OY !== null)? this.OY : this.inst.y;
		ret.set_float( y );
	};     

	Exps.prototype.Duration = function (ret)
	{
		ret.set_float( this.duration );
	};    
 
	Exps.prototype.Remainder = function (ret)
	{        
        var t = (this.remaining > 0)? this.remaining : 0;
		ret.set_float( t );
	}; 
    
    
}());