// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Slowdown = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Slowdown.prototype;
		
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
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;                    
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{   
        this.activated = (this.properties[0]==1);  
        this.dec = this.properties[1]; 
        this.is_moving = false;
		// slow down
		this.cur_speed = 0;			
		this.cur_angle = 0;			
		// trigger
		this.is_my_call = false;
	};

	behinstProto.tick = function ()
	{  
	    if ((!this.activated) || (!this.is_moving))
		    return;

	    var dt = this.runtime.getDt(this.inst);
		if (dt == 0)
		    return;
		
		this.cur_speed -= (this.dec* dt);
		if (this.cur_speed <= 0)  // slow down to zero
            this.stop();			
		else    // move inst
		{
		    var distance = this.cur_speed * dt;
			this.inst.x += (distance * Math.cos(this.cur_angle));
            this.inst.y += (distance * Math.sin(this.cur_angle));
			this.inst.set_bbox_changed();
		}
	};	
	behinstProto.start = function(speed, angle)
	{   
        this.is_moving = true;		
		this.cur_speed = speed;			
		this.cur_angle = cr.to_clamped_radians(angle);	
	};	
	behinstProto.stop = function()
	{   
        this.is_moving = false;		
        this.cur_speed = 0;	        
        this.is_my_call = true;
        this.runtime.trigger(cr.behaviors.Rex_Slowdown.prototype.cnds.OnStop, this.inst); 
        this.is_my_call = false;
	};	
	
    behinstProto.saveToJSON = function ()
	{  
		return { "en": this.activated,
		         "dec": this.dec,
                 "is_m": this.is_moving,
                 "spd" : this.cur_speed,
                 "a" : this.cur_angle
               };
	};
	
	behinstProto.loadFromJSON = function (o)
	{  
        this.activated = o["en"];  
        this.dec = o["dec"];  
        this.is_moving = o["is_m"];  
		this.cur_speed = o["spd"];  			
		this.cur_angle = o["a"];  	       
	};	
	
    /**BEGIN-PREVIEWONLY**/
    behinstProto.getDebuggerValues = function (propsections)
    {
        propsections.push({
            "title": this.type.name,
            "properties": [
                {"name": "Current speed", "value": this.cur_speed},
                {"name": "Deceleration", "value": this.dec},
            ]
        });
    };
          
    behinstProto.onDebugValueEdited = function (header, name, value)
    {
    };
    /**END-PREVIEWONLY**/		
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();    
    
	Cnds.prototype.OnStop = function ()
	{
        return this.is_my_call;
	};
    
	Cnds.prototype.IsMoving = function ()
	{
		return (this.activated && this.is_moving);
	};
		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s==1);
	};  
	Acts.prototype.Start = function (speed, angle)
	{
	    this.start(speed, angle);
	}; 	
	Acts.prototype.SetDeceleration = function (a)
	{
		this.dec = a;
	};
    	
	Acts.prototype.Stop = function ()
	{	
        this.stop();
	};      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int((this.activated)? 1:0);
	};    
    
	Exps.prototype.Speed = function (ret)
	{
		ret.set_float(this.cur_speed);
	};

 	Exps.prototype.Dec = function (ret)
	{
		ret.set_float(this.dec);
	}; 

 	Exps.prototype.MovingAngle = function (ret)
	{
		ret.set_float(cr.to_clamped_degrees(this.cur_angle));
	};   	
}());