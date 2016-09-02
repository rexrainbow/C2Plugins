// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_mode7ground = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_mode7ground.prototype;
		
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
	    this.plug_proto = (cr.plugins_.Sprite)?   cr.plugins_.Sprite:
	                      (cr.plugins_.c2canvas)? cr.plugins_.c2canvas:
	                                              null;	    
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
	    this.effect_name = this.properties[0];	    
        this.pos_x = null;
        this.pos_y = null; 
        this.ang = null;	    
        this.horizon = this.properties[1];
        this.fov = this.properties[2];
        this.scale_x = this.properties[3];
        this.scale_y = this.properties[4]; 
        var single_image = this.properties[5];
        
        this.set_param_fn = this.type.plug_proto.prototype.acts.SetEffectParam;
        
        this.camera_inst = null;    
        this.camera_instUid = -1;		// for loading
               
        this.set_effect_param(3, this.horizon);  //horizon
        this.set_effect_param(4, this.fov);      //fov
        this.set_effect_param(5, this.scale_x);  //scale_x
        this.set_effect_param(6, this.scale_y);  //scale_y
        this.set_effect_param(7, single_image);  //single_image        
	};

	behinstProto.tick = function ()
	{	    
	};
	
	behinstProto.tick2 = function ()
	{
	    this.camera_update(this.camera_inst);	    
	};  
	behinstProto.camera_update = function (camera_inst)
	{
	    if (!camera_inst)
	        return;
	        
        if (camera_inst.x !== this.pos_x)
        {
	        this.set_effect_param(0, camera_inst.x);  //pos_x
	        this.pos_x = camera_inst.x;
	    }
	    
	    if (camera_inst.y !== this.pos_y)
	    {
	        this.set_effect_param(1, camera_inst.y);  //pos_y
	        this.pos_y = camera_inst.y;
	    }
	    
	    if (camera_inst.angle !== this.ang)
	    {
	        this.set_effect_param(2, cr.to_clamped_degrees(camera_inst.angle));  //ang          
	        this.ang = camera_inst.angle;
	    }
	};	
	behinstProto.set_effect_param = function (index, value)
	{
        this.set_param_fn.call(
            this.inst,                         // this_
            this.effect_name,                  // name
            index,                             // param index
            value                              // value
        );
	};  	
    
    var RESULT = {};
	behinstProto.LXY2PXY = function (lx, ly)
	{
        this.inst.update_bbox();
        var bbox = this.inst.bbox;	
        
        var xx = (lx/(this.inst.width * this.scale_x)) - this.pos_y;
        var yy = (ly/(this.inst.width * this.scale_y)) + this.pos_x;           
        
        var cos_ang = Math.cos(-this.ang), sin_ang = Math.sin(-this.ang);
        var sx = (xx * cos_ang) - (yy * sin_ang);
        var sy = (xx * sin_ang) + (yy * cos_ang);
        
        var px = (this.fov * sx) / (1- sy);
        var pz = px / sx;
        //var py = px - fov;
        
        var vx = px + 0.5;
        var vy = pz + 0.5 + this.horizon;
        
        RESULT.scale = Math.abs(pz) * 8;
        RESULT.x = (vx * this.inst.width) + bbox.left;
        RESULT.y = (vy * this.inst.height) + bbox.top;
        RESULT.pz = pz;
                     
        return RESULT; 
	};	    
    
	behinstProto.saveToJSON = function ()
	{    
		return { "pos_x": this.pos_x,
		         "pos_y": this.pos_y,
		         "ang": this.ang,
		         "horizon": this.horizon,
                 "fov": this.fov,
                 "scale_x": this.scale_x,
                 "scale_y": this.scale_y,
                 "camera_uid": (this.camera_inst)? this.camera_inst.uid:(-1)
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{            
        this.pos_x = o["pos_x"];
        this.pos_y = o["pos_y"];
        this.ang = o["ang"];	    
        this.horizon = o["horizon"];
        this.fov = o["fov"];
        this.scale_x = o["scale_x"];
        this.scale_y = o["scale_y"];
        
        this.camera_instUid = o["camera_uid"];
	};

	behinstProto.afterLoad = function ()
	{
		// Look up the pinned object UID now getObjectByUID is available
		if (this.camera_instUid === -1)
			this.camera_inst = null;
		else
		{
			this.camera_inst = this.runtime.getObjectByUID(this.camera_instUid);
			assert2(this.camera_inst, "Failed to find camera object by UID");
		}
		
		this.camera_instUid = -1;
	};    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetCamera = function (camera_objs)
	{
		if (!camera_objs)
			return;
  
        this.camera_inst = camera_objs.instances[0];
        this.camera_update(this.camera_inst);
	}; 
	
	Acts.prototype.SetHorizon = function (horizon)
	{
		if (this.horizon === horizon)
		    return;
		    
		this.horizon = horizon;
        this.set_effect_param(3, this.horizon);  //horizon		
	}; 
	
	Acts.prototype.SetFOV = function (fov)
	{
		if (this.fov === fov)
		    return;
		    
		this.fov = fov;
        this.set_effect_param(4, this.fov);  //fov		
	}; 	
	
	Acts.prototype.SetScaleX = function (scale_x)
	{
		if (this.scale_x === scale_x)
		    return;
		    
		this.scale_x = scale_x;
        this.set_effect_param(5, this.scale_x);  //scale_x		
	}; 		
	
	Acts.prototype.SetScaleY = function (scale_y)
	{
		if (this.scale_y === scale_y)
		    return;
		    
		this.scale_y = scale_y;
        this.set_effect_param(6, this.scale_y);  //scale_y		
	}; 			
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
}());