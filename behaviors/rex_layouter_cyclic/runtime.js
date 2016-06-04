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
        this.shape =  this.properties[0];
        this.mode = this.properties[1];
	    this.start_angle = cr.to_clamped_radians(this.properties[2]);  // in radians
        var range_angle = this.properties[3];
        this.is_360_mode = (Math.abs(range_angle) == 360);        
	    this.range_angle = (this.is_360_mode)? 
                           (2*Math.PI): cr.to_clamped_radians(range_angle);  // in radians

	    this.delta_angle = cr.to_clamped_radians(this.properties[4]);  // in radians
        this.angle_offset = cr.to_clamped_radians(this.properties[5]); // in radians
        
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
	    var sprites = layouter.sprites;  
	    var i, cnt = sprites.length;

        if (this.mode == 0)  // average mode
        {
            if (cnt==1)
                this.delta_angle = 0;
            else
            {
                if (this.is_360_mode)
                    this.delta_angle = this.range_angle/cnt;     // in radians
                else
                    this.delta_angle = this.range_angle/(cnt-1);  // in radians
            }
        }
        else  // fix mode
            this.range_angle = this.delta_angle * (cnt-1);  // in radians

	    var params, angle_, x_, y_;
        var rW = this._get_radius_w();
        var rH = this._get_radius_h();
	    var start_angle = this.start_angle;  // in radians            
	    for (i=0;i<cnt;i++)
	    {
            angle_ = start_angle + (this.delta_angle*i);  // in radians
            x_ = OX + (rW*Math.cos(angle_));
            y_ = OY + (rH*Math.sin(angle_));
            
	        params = {
                x:x_,
	            y:y_,
                angle:angle_,  // in radians
                };
            params = this._rotate_params(params);
	        layouter.layout_inst(sprites[i], params);
	    }
	}; 	 	

	behinstProto._rotate_params = function (params)
	{      
        var layouter = this.inst;
        
        if (layouter.angle === 0)
            return params;

        var new_angle = cr.angleTo(layouter.x, layouter.y, params.x, params.y) + layouter.angle;
        var d = cr.distanceTo(layouter.x, layouter.y, params.x, params.y); 
        
        var new_x = layouter.x + (d * Math.cos(new_angle));
        var new_y = layouter.y + (d * Math.sin(new_angle));
        params.x = new_x;
        params.y = new_y;
        params.angle += layouter.angle;
        return params;        
	};      
    
    
	behinstProto._get_radius_w = function ()
	{
        var r;
        if (this.shape === 0)
            r = Math.min(this.inst.width, this.inst.height)/2;     
        else
            r = this.inst.width/2;
        
        return r;
	};      

	behinstProto._get_radius_h = function ()
	{
        var r;
        if (this.shape === 0)
            r = Math.min(this.inst.width, this.inst.height)/2;     
        else
            r = this.inst.height/2;
        
        return r;
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
        if (a > 360)
            a = 360;        
        this.is_360_mode = (Math.abs(a) == 360);        
	    this.range_angle = (this.is_360_mode)? 
                           (2*Math.PI): cr.to_clamped_radians(a);  // in radians
	};     
	Acts.prototype.SetDeltaAngle = function (a)
	{
        this.delta_angle = cr.to_clamped_radians(a);
	}; 
    
	Acts.prototype.AddToStartAngle = function (a)
	{
        a += cr.to_clamped_degrees(this.start_angle);
		this.start_angle = cr.to_clamped_radians(a);
	};		      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.StartAngle = function (ret)
	{
		ret.set_float(cr.to_clamped_degrees(this.start_angle));
	}; 	
}());