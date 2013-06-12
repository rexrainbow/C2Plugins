// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_layouter_cyclic = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_layouter_cyclic.prototype;
		
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
	    this.check_name = "LAYOUTER";
        this.mode = this.properties[0];
	    this.start_angle = cr.to_clamped_radians(this.properties[1]);  // in radians
        var range_angle = this.properties[2];
	    this.range_angle = (Math.abs(range_angle) == 360)? 
                           (2*Math.PI): cr.to_clamped_radians(range_angle);  // in radians
	    this.delta_angle = cr.to_clamped_radians(this.properties[3]);  // in radians
        this.angle_offset = cr.to_clamped_radians(this.properties[4]); // in radians
        
        // implement handlers
        this.on_add_insts = this._on_update;
        this.on_remove_insts = this._on_update;        
	};

	behinstProto.tick = function ()
	{
	};  

	behinstProto._on_update = function ()
	{
	    var layouter = this.inst;
	    var OX = layouter.get_centerX(layouter); 
	    var OY = layouter.get_centerY(layouter); 
	    var OA = layouter.angle;
	    var sprites = layouter.sprites;  
	    var i, cnt = sprites.length, params;
	    var a, r = Math.min(layouter.width, layouter.height)/2;        
	    var start_angle = OA + this.start_angle;  // in radians
        if (this.mode == 0)  // average mode
            this.delta_angle = (cnt==1)? 0 : this.range_angle/(cnt-1);  // in radians
        else  // fix mode
            this.range_angle = this.delta_angle * (cnt-1);  // in radians

	    for (i=0;i<cnt;i++)
	    {
	        a = start_angle + (this.delta_angle*i);  // in radians
	        params = {x:OX + (r*Math.cos(a)),
	                  y:OY + (r*Math.sin(a)),
	                  angle:a + this.angle_offset};
	        layouter.layout_inst(sprites[i], params);
	    }
	}; 	 	
    
	behinstProto.saveToJSON = function ()
	{
		return { "m": this.mode, 
                 "sa": this.start_angle,
                 "ra": this.range_angle,
                 "da": this.delta_angle,
                 "aoff": this.angle_offset,
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{            
        this.mode = o["m"];
	    this.start_angle = o["sa"];
	    this.range_angle = o["ra"]; // in degree
	    this.delta_angle = o["da"]; // in degree
        this.angle_offset = o["aoff"]; // in degree
	};       
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.SetMode = function (m)
	{
		this.mode = m;		
	}; 
    
	Acts.prototype.SetStartAngle = function (a)
	{
		this.start_angle = cr.to_clamped_radians(a);
	};	
	
	Acts.prototype.SetRangeAngle = function (a)
	{
        this.range_angle = cr.to_clamped_radians(a);
	};     
	Acts.prototype.SetDeltaAngle = function (a)
	{
        this.delta_angle = cr.to_clamped_radians(a);
	}; 
	      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
}());