// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_mode7perspective = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_mode7perspective.prototype;
		
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
        this.LX = this.properties[0];
        this.LY = this.properties[1];  
        
        this.default_width = this.inst.width;
        this.default_height = this.inst.height;        
        
        this.ground_inst = null;
        this.ground_instUid = -1;		// for loading
	};

	behinstProto.tick = function ()
	{
	    this.position_update(this.ground_inst);	    
	};
	 
	behinstProto.position_update = function (ground_inst)
	{
	    if (!ground_inst)
	        return;

        var mode7Ground_behavior = this.get_mode7Ground_behavior_inst(ground_inst);
        var result = mode7Ground_behavior.LXY2PXY(this.LX, this.LY);
          
        var needUpdatingPosition = (typeof(result.x) === "number") && (typeof(result.y) === "number") &&
                                                    ((this.inst.x !== result.x) || (this.inst.y !== result.y)); 

        if (needUpdatingPosition)
        {
            this.inst.x = result.x;
            this.inst.y = result.y;
            this.inst.set_bbox_changed();
            this.runtime.redraw = true;	
        }        

        var new_width = this.default_width * result.scale;
        var new_height = this.default_height * result.scale;
		if (this.inst.width !== new_width || this.inst.height !== new_height)
		{
			this.inst.width = new_width;
			this.inst.height = new_height;
			this.inst.set_bbox_changed();	
			this.runtime.redraw = true;		
		} 
		
		// visible
		var visible = (result.pz >= 0);
		if (this.inst.visible !== visible)
		{
		    this.inst.visible = visible;
            this.runtime.redraw = true;		
        }
        
	};	 	
	
	behinstProto.get_mode7Ground_behavior_inst = function (ground_inst)
    {
        var has_mode7Ground_behavior = (cr.behaviors.Rex_mode7ground != null);
        assert2(has_mode7Ground_behavior, "[Mode7 perspective] Could not find mode 7 ground behavior");
        
        var behavior_inst;
        var i, cnt = ground_inst.behavior_insts.length;
        for(i=0; i<cnt; i++)
        {
            behavior_inst = ground_inst.behavior_insts[i];
            if (behavior_inst instanceof cr.behaviors.Rex_mode7ground.prototype.Instance)
                return behavior_inst;
        }
        
        assert2(behavior_inst, "[Mode7 perspective] Could not find mode 7 ground behavior");
        return null;
    };	

	behinstProto.saveToJSON = function ()
	{    
		return { "LX": this.LX,
		         "LY": this.LY,
                 "ground_uid": (this.ground_inst)? this.ground_inst.uid: (-1),
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{            
        this.LX = o["LX"];
        this.LY = o["LY"];
        this.ground_instUid = o["ground_uid"];
	};	
    
	behinstProto.afterLoad = function ()
	{
		// Look up the pinned object UID now getObjectByUID is available
		if (this.ground_instUid === -1)
			this.ground_inst = null;
		else
		{
			this.ground_inst = this.runtime.getObjectByUID(this.ground_instUid);
			assert2(this.ground_inst, "Failed to find ground object by UID");
		}
		
		this.ground_instUid = -1;
	};         
    
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{	  
		propsections.push({
			"title": this.type.name,
			"properties": [{"name": "LX", "value": this.LX},
			               {"name": "LY", "value": this.LY}]
		});
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

	Acts.prototype.SetGround = function (ground_objs)
	{
		if (!ground_objs)
			return;
  
        this.ground_inst = ground_objs.instances[0];
	}; 
	
	Acts.prototype.SetLX = function (lx)
	{	
        this.LX = lx;	    
	}; 		
	
	Acts.prototype.SetLY = function (ly)
	{	
        this.LY = ly;	    
	}; 					
	
	Acts.prototype.SetLXY = function (lx, ly)
	{	
        this.LX = lx;	    
        this.LY = ly;	    
	}; 	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
 	Exps.prototype.LX = function (ret)
	{
		ret.set_float( this.LX );
	};	
	
 	Exps.prototype.LY = function (ret)
	{
		ret.set_float( this.LY );
	};    
    
}());