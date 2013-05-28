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
	    this.start_angle = this.properties[1];
	    this.range_angle = this.properties[2]; // in degree
	    this.delta_angle = this.properties[3]; // in degree
        
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
	    var OA = cr.to_clamped_degrees(layouter.angle);
	    var sprites = layouter.sprites;  
	    var i, cnt = sprites.length, params;
	    var a, r = Math.min(layouter.width, layouter.height)/2;        
	    var start_angle = cr.to_clamped_radians(OA + this.start_angle);  // in rad
	    var delta_angle;  // in rad
        if (this.mode == 0)  // average mode
        {
	        var range_angle = (Math.abs(this.range_angle) == 360)? 
                              (2*Math.PI): cr.to_radians(this.range_angle);  // in rad
            delta_angle = range_angle/cnt;  // in rad
            this.delta_angle = this.range_angle/cnt;  // in degree
        }
        else  // fix mode
        {
            delta_angle = cr.to_radians(this.delta_angle);  // in rad
            this.range_angle = this.delta_angle * cnt;  // in degree
        }
	    for (i=0;i<cnt;i++)
	    {
	        a = start_angle + (delta_angle*i);  // in rad
	        params = {x:OX + (r*Math.cos(a)),
	                  y:OY + (r*Math.sin(a)),
	                  angle:a};
	        layouter.layout_inst(sprites[i], params);
	    }
	}; 	 	
    
	behinstProto.saveToJSON = function ()
	{
		return { "m": this.mode, 
                 "sa": this.start_angle,
                 "ra": this.range_angle,
                 "da": this.delta_angle
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{            
        this.mode = o["m"];
	    this.start_angle = o["sa"];
	    this.range_angle = o["ra"]; // in degree
	    this.delta_angle = o["da"]; // in degree
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
		this.start_angle = a;
	};	
	
	Acts.prototype.SetRangeAngle = function (a)
	{
        this.range_angle = a;
	};     
	Acts.prototype.SetDeltaAngle = function (a)
	{
        this.delta_angle = a;
	}; 
	      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
}());