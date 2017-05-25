// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Interception = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Interception.prototype;
		
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
	    this.enable = (this.properties[0] === 1);
	    
        if (!this.recycled)
        {
            this.my_info = {};            
            this.target_info = {};
        }
        this.set_info(this.my_info, this.inst);
        this.set_info(this.target_info);  
        this.do_pretiction_flag = true;
        this.predictX = 0;
        this.predictY = 0;   
        
        if (!this.recycled)
        {
            this.output_force = {};
        }
        this.output_force["x"] = 0;
        this.output_force["y"] = 0;
        this.output_force["angle"] = 0;          
        this.update_force_flag = true;         
	};
	
	behinstProto.set_info = function(info, inst)
	{
	    if (!inst)  // clean
	    {
	        info["uid"] = -1;	
	        info["x"] = 0;
	        info["y"] = 0;
	        info["prex"] = 0;
	        info["prey"] = 0;	        
	    }
	    else if (inst.uid === info["uid"])
	        return;
	    else
	    {
            info["uid"] = inst.uid;
	        info["x"] = inst.x;
	        info["y"] = inst.y;	
	        info["prex"] = inst.x;
	        info["prey"] = inst.y;		        
        }             
	}; 
		    
	behinstProto.onDestroy = function()
	{
	};
    
	behinstProto.tick = function ()
	{
	    // keep tracking the velocity of mine and target
	    this.update_info(this.my_info);
	    this.update_info(this.target_info);	
	    this.do_pretiction_flag = true;
	    this.update_force_flag = true;       	    
	}; 
	
	behinstProto.update_info = function(info)
	{
	    if (info["uid"] === -1)
	        return;
	        
	    var inst;
	    if (info["uid"] === this.inst.uid)
	        inst = this.inst;
	    else
	        inst = this.runtime.getObjectByUID(info["uid"]);
	        
	    if (!inst)
	    {
	        this.set_info(info);
	        return;
	    }
	    	    
	    var dt = this.runtime.getDt(inst);
	    	    
	    
	    info["prex"] = info["x"];
	    info["prey"] = info["y"];
	    info["x"] = inst.x;
	    info["y"] = inst.y;
	    info["dt"] = dt;
	}; 

	behinstProto.predict_intersection = function()
	{
	    if(!this.do_pretiction_flag)
	        return;
	        
	    // no target
	    if (this.target_info["uid"] === (-1))
	    {
            this.predictX = 0;
            this.predictY = 0;
	    }
	    
	    // no prediction
	    else if (!this.enable)
	    {
            this.predictX = this.target_info["x"];
            this.predictY = this.target_info["y"];	 	        
	    }
	    
	    // target had not moved
	    else if ((this.target_info["x"] === this.target_info["prex"]) && (this.target_info["y"] === this.target_info["prey"]))
	    {
            this.predictX = this.target_info["x"];
            this.predictY = this.target_info["y"];	        
	    }
	    
	    // I had not moved
        else if ((this.my_info["x"] === this.my_info["prex"]) && (this.my_info["y"] === this.my_info["prey"]))
	    {
            this.predictX = this.target_info["x"];
            this.predictY = this.target_info["y"];	        
	    }
	    	    	    
	    else
	    {	
	        this.update_velocity(this.my_info);
	        this.update_velocity(this.target_info);	   
	        var vrx = (this.target_info["vx"] - this.my_info["vx"]);
	        var vry = (this.target_info["vy"] - this.my_info["vy"]);
	        
	        if ((vrx != 0) && (vry != 0))
	        {
	            var vr = cr.distanceTo(0, 0, vrx, vry);	    	    
	            var sr = cr.distanceTo(this.target_info["x"], this.target_info["y"], this.my_info["x"], this.my_info["y"]);
	            var tc = quickAbs(sr/vr);
	            var a = cr.angleTo(this.target_info["prex"], this.target_info["prey"], this.target_info["x"], this.target_info["y"]);
                this.predictX = this.target_info["x"] + (this.target_info["vx"] * tc);
                this.predictY = this.target_info["y"] + (this.target_info["vy"] * tc);
            }
            else  // target and mine is moving parallelly
            {
                this.predictX = this.target_info["x"];
                this.predictY = this.target_info["y"];  
            }
        }

        this.do_pretiction_flag = false;
	};
	
	behinstProto.update_force = function()
	{
	    if(!this.update_force_flag)
	        return;
	        
	    this.predict_intersection();
	        
	    if (this.target_info["uid"] === (-1))
	    {
            this.output_force["x"] = 0;
            this.output_force["y"] = 0;
            this.output_force["angle"] = 0; 
            return;
	    }
	    
	    if ((this.predictX === this.inst.x) && (this.predictY === this.inst.y))
	    {
            this.output_force["x"] = 0;
            this.output_force["y"] = 0;
            this.output_force["angle"] = 0;   
	    }
	    else
	    {
	        this.output_force["angle"] = cr.angleTo(this.inst.x, this.inst.y, this.predictX, this.predictY);
	        this.output_force["x"] = Math.cos(a);
	        this.output_force["y"] = Math.sin(a);
	    }
	    
        this.update_force_flag = false;
	};	
	
	behinstProto.update_velocity = function (info)
	{	    
	    var dt = this.my_info["dt"] || this.target_info["dt"];
	    
	    var spd; 
	    if ( dt === 0 )
	        spd = 0;
	    else if ((info["x"] === info["prex"]) && (info["y"] === info["prey"]))
	        spd = 0;
	    else	        
	    {
	        var m = cr.distanceTo(info["x"], info["y"], info["prex"], info["prey"]);	    
	        spd = m / dt;	    
	    }
	    	    
	    if (spd === 0)
	    {
	        info["vx"] = 0;
	        info["vy"] = 0;
	    }
	    else
	    {
	        var a = cr.angleTo(info["prex"], info["prey"], info["x"], info["y"]);
	        info["vx"] = Math.cos(a) * spd;
	        info["vy"] = Math.sin(a) * spd;
	    }
	};	
	    
	function quickAbs(x)
	{
		return x < 0 ? -x : x;
	}; 

    function clone(obj) 
	{
        if (null == obj || "object" != typeof obj) 
		    return obj;
        var result = obj.constructor();
        for (var attr in obj) 
		{
            if (obj.hasOwnProperty(attr)) 
			    result[attr] = obj[attr];
        }
        return result;
    };

	behinstProto.saveToJSON = function ()
	{
		return { "en": this.enable,
		         "mi": clone(this.my_info),
                 "ti": clone(this.target_info),
                 "dpredflg": this.do_pretiction_flag,
                 "predX": this.predictX,
                 "predY": this.predictY,         
                 "of": clone(this.output_force),
                 "updflg": this.update_force_flag,
               };
	};
	
	behinstProto.loadFromJSON = function (o)
	{  
		this.enable = o["en"];            
        this.my_info = o["mi"];    
        this.target_info = o["ti"];      
        this.do_pretiction_flag = o["dpredflg"];      
        this.predictX = o["predX"];      
        this.predictY = o["predY"];              
        this.output_force = o["of"];
        this.update_force_flag = o["updflg"];
	};	     

    /**BEGIN-PREVIEWONLY**/
    behinstProto.getDebuggerValues = function (propsections)
    {
        propsections.push({
            "title": this.type.name,
            "properties": [{"name": "Target UID", "value": this.target_info["uid"]},
                                {"name": "Predict X", "value": this.predictX},
                                {"name": "Predict Y", "value": this.predictY},]
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

	Cnds.prototype.HasForce = function ()
	{
        this.update_force();
		return (this.output_force["x"] != 0) && (this.output_force["y"] != 0);
	};  

	Cnds.prototype.IsLocking = function ()
	{
        return !!this.runtime.getObjectByUID(this.target_info["uid"]);
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.LockToInstance = function (objtype)
	{  
        if (!objtype)
            return;
        
        var inst = objtype.getFirstPicked();
        this.set_info(this.target_info, inst);
	};
	
	Acts.prototype.Unlock = function (objtype)
	{
        this.set_info(this.target_info);
	};	
    
	Acts.prototype.LockToInstanceUID = function (uid)
	{
        var inst = this.runtime.getObjectByUID(uid);
        this.set_info(this.target_info, inst);
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.PredictX = function (ret)
	{
        this.predict_intersection();
		ret.set_float(this.predictX);
	};	 
	
	Exps.prototype.PredictY = function (ret)
	{
        this.predict_intersection();
		ret.set_float(this.predictY);
	};
	
	Exps.prototype.ForceAngle = function (ret)
	{
        this.update_force();
		ret.set_float(this.output_force["angle"]);
	};	 
	
	Exps.prototype.ForceMagnitude = function (ret)
	{
        this.update_force();
        var m;
        if (this.target_info["uid"] === (-1))
            m = 0;
        else if ((this.predictX === this.inst.x) && (this.predictY === this.inst.y))
            m = 0
        else
            m = 1;
		ret.set_float(m);
	};		
	
	Exps.prototype.ForceDx = function (ret)
	{
        this.update_force();
		ret.set_float(this.output_force["x"]);
	};	 
	
	Exps.prototype.ForceDy = function (ret)
	{
        this.update_force();
		ret.set_float(this.output_force["y"]);
	};	
	
	Exps.prototype.TargetUID = function (ret)
	{
		ret.set_int(this.target_info["uid"]);
	};	    
    
}());