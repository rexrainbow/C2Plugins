// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_physics_torque = function(runtime)
{
	this.runtime = runtime;
    this.sources = {};
};

(function ()
{
    var worldScale = 0.02;
	var behaviorProto = cr.behaviors.Rex_physics_torque.prototype;
		
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
        this.sources = this.behavior.sources;         
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	var fake_ret = {value:0,
	                set_any: function(value){this.value=value;},
	                set_int: function(value){this.value=value;},	 
                    set_float: function(value){this.value=value;},	                          
	               };       
	behinstProto.onCreate = function()
	{     
        this.physics_behavior_inst = this._get_physics_behavior_inst();         
       
        this.activated = (this.properties[0] == 1);
        this.target_speed = this.properties[1]; 
		this.max_force = this.properties[2];
		
		var kp = this.properties[3];
		var ki = this.properties[4];
		var kd = this.properties[5];
		var reset_windup_err = this.properties[6];
		this.pid_ctrl = new cr.behaviors.Rex_physics_torque.PIControllerKlass(kp, ki, kd, reset_windup_err);
		this.current_applied_force = 0;
	};
	
	behinstProto.onDestroy = function()
	{
	}; 	

	behinstProto._get_physics_behavior_inst = function ()
    {
        var i = this.type.objtype.getBehaviorIndexByName("Physics");   
        if (i != (-1))
            return this.inst.behavior_insts[i];
        else
            alert("You should add a physics for gravitation behavior.");
    };
  
	behinstProto.tick = function ()
	{
	    var cur_speed = this._angular_velocity_get();
		var err = (this.target_speed - cur_speed)/Math.abs(this.target_speed);
		var out = this.pid_ctrl.procress(err);
		if (this.activated)
		{
		    this.current_applied_force = out * this.max_force;
		    this._apply_torque(this.current_applied_force);
		}
		else
		{
		    this.current_applied_force = 0;
		}
	};

	behinstProto._apply_torque = function (f)
	{
       cr.behaviors.Physics.prototype.acts.ApplyTorque.call(this.physics_behavior_inst, f);       
	};    
	
	behinstProto._angular_velocity_get = function ()
	{
       cr.behaviors.Physics.prototype.exps.AngularVelocity.call(this.physics_behavior_inst, fake_ret);
	   return fake_ret.value;
	};	

	behinstProto.saveToJSON = function ()
	{
		return { "en": this.activated,
		         "ts": this.target_speed,
		         "mf": this.max_force,
		         "pid": this.pid_ctrl.saveToJSON(),
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{                  
	    this.activated = o["en"];
	    this.target_speed = o["ts"];
	    this.max_force = o["mf"];
	    this.pid_ctrl.loadFromJSON(o["pid"]);
	};        
	
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Force", "value": this.current_applied_force},
				{"name": "PI-Kp", "value": this.pid_ctrl.kp},
				{"name": "PI-Ki", "value": this.pid_ctrl.ki},
				{"name": "PI-Kd", "value": this.pid_ctrl.kd},
				{"name": "Reset-windup", "value": this.pid_ctrl.is_reset_windup},
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		var a, s;
		
		switch (name) 
		{
		case "PI-Kp": 
		    this.pid_ctrl.kp = value; 
			break;
		case "PI-Ki":
		    this.pid_ctrl.ki = value;
			break;
		case "PI-Kd":
		    this.pid_ctrl.ki = value;
			break;			
		}
	};
	/**END-PREVIEWONLY**/	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s == 1);
	};  
	
	Acts.prototype.SetTargetSpeed = function (s)
	{	    
		this.target_speed = s;
	}; 

	Acts.prototype.SetMaxForce = function (f)
	{
	    if (f < 0)
		    f = 0;
		this.max_force = f;
	};
	
	Acts.prototype.SetKp = function (kp)
	{	    
		this.pid_ctrl.kp = kp; 
	}; 	 
	
	Acts.prototype.SetKp = function (ki)
	{	    
		this.pid_ctrl.ki = ki; 
	}; 
	
	Acts.prototype.SetKd = function (kd)
	{	    
		this.pid_ctrl.kd = kd; 
	}; 	
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.TargetSpeed = function (ret)
	{
		ret.set_float(this.target_speed);
	};
	
	Exps.prototype.MaxForce = function (ret)
	{
		ret.set_float(this.max_force);
	};	
	
	Exps.prototype.CurForce = function (ret)
	{
		ret.set_float(this.current_applied_force);
	};		
	
	Exps.prototype.Kp = function (ret)
	{
		ret.set_float(this.pid_ctrl.kp);
	};
	
	Exps.prototype.Ki = function (ret)
	{
		ret.set_float(this.pid_ctrl.ki);
	};	
	
	Exps.prototype.Kd = function (ret)
	{
		ret.set_float(this.pid_ctrl.kd);
	};		
	
}());

(function ()
{
    cr.behaviors.Rex_physics_torque.PIControllerKlass = function(kp, ki, kd, reset_windup_err)
    {       
	    this.kp = kp;
		this.ki = ki;
		this.kd = kd;
		this.err_acc = 0;
		this.err_pre = 0;
		this.reset_windup_err = reset_windup_err;
		this.is_reset_windup = false;
    };
    var PIControllerKlassProto = cr.behaviors.Rex_physics_torque.PIControllerKlass.prototype;
	
	PIControllerKlassProto.procress = function (err)
	{
	    this.is_reset_windup = (this.reset_windup_err > 0) &&
	                           (Math.abs(err) > this.reset_windup_err);
	    if (this.is_reset_windup)
	        this.err_acc = 0;
	    else
	        this.err_acc += err;
	    var derr = err - this.err_pre;
	    this.err_pre = err;
	    var out = (this.kp * err) + (this.ki * this.err_acc) + (this.kd * derr);
	    out = cr.clamp(out, -1 ,1);
        return out;
	};
	
	PIControllerKlassProto.saveToJSON = function ()
	{
		return { "kp": this.kp,
		         "ki": this.ki,
		         "kd": this.kd,
		         "ea": this.err_acc,
		         "ep": this.err_pre
                };
	};
	
	PIControllerKlassProto.loadFromJSON = function (o)
	{                  
	    this.kp = o["kp"];
	    this.ki = o["ki"];
	    this.kd = o["kd"];
	    this.err_acc = o["ea"];
	    this.err_pre = o["ep"];  
	}; 	
}());   