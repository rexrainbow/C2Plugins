// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_layouter_linear = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_layouter_linear.prototype;
		
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
        this.direction = this.properties[1];
        this.alignment = this.properties[2];
        this.delta_distance = this.properties[3];        
        this._points = {start:{x:0,y:0},end:{x:0,y:0}};
        
        // implement handlers
        this.on_add_insts = this._on_update;
        this.on_remove_insts = this._on_update; 
        this.mode_handler = [this._update_avarage_mode,
                             this._update_fix_mode];
	};

	behinstProto.tick = function ()
	{
	}; 

	behinstProto._get_start_end_points = function ()
	{     
        var layouter =  this.inst;   
	    layouter.update_bbox();
	    var quad = layouter.bquad;       
        switch (this.direction)
        {
        case 0:  // Left to right
            this._points.start.x = (quad.tlx + quad.blx)/2;
            this._points.start.y = (quad.tly + quad.bly)/2;          
            this._points.end.x = (quad.trx + quad.brx)/2;
            this._points.end.y = (quad.try_ + quad.bry)/2;
            break;
        case 1:  // Right to left
            this._points.start.x = (quad.trx + quad.brx)/2;
            this._points.start.y = (quad.try_ + quad.bry)/2;
            this._points.end.x = (quad.tlx + quad.blx)/2;
            this._points.end.y = (quad.tly + quad.bly)/2;      
            break;   
        case 2:  // Top to bottom
            this._points.start.x = (quad.tlx + quad.trx)/2;    
            this._points.start.y = (quad.tly + quad.try_)/2;         
            this._points.end.x = (quad.blx + quad.brx)/2; 
            this._points.end.y = (quad.bly + quad.bry)/2;    
            break;
        case 3:  // Bottom to top
            this._points.start.x = (quad.blx + quad.brx)/2;   
            this._points.start.y = (quad.bly + quad.bry)/2;     
            this._points.end.x = (quad.tlx + quad.trx)/2;      
            this._points.end.y = (quad.tly + quad.try_)/2;           
            break;            
        }
        console.log(this._points);
	};  
    
 	behinstProto._on_update = function ()
	{             
        this.mode_handler[this.mode].apply(this);
    };

	behinstProto._update_avarage_mode = function ()
	{    
        this._get_start_end_points();
        var layouter =  this.inst;   
        var a = layouter.angle;
        var sprites = layouter.sprites;
        var i, cnt = sprites.length, params;
        var seg = (cnt==1)? 1: (cnt-1);
        var dx = (this._points.end.x - this._points.start.x)/seg;
        var dy = (this._points.end.y - this._points.start.y)/seg;
        var start_x = this._points.start.x;
        var start_y = this._points.start.y;
        var inst_angle = cr.to_degrees(a);
	    for (i=0;i<cnt;i++)
	    {
	        params = {x:start_x + (dx*i),
	                  y:start_y + (dy*i),
	                  angle:inst_angle};
	        layouter.layout_inst(sprites[i], params);
	    }        
	};
    
	behinstProto._update_fix_mode = function ()
	{    
        this._get_start_end_points();
        var layouter =  this.inst;   
        var a = layouter.angle;
        var cos_a = Math.cos(a), sin_a = Math.sin(a);
        var sprites = layouter.sprites;
        var i, cnt = sprites.length, params;
        var dx = this.delta_distance * cos_a;
        var dy = this.delta_distance * sin_a; 
        
        // re-calc start point
        if (this.alignment != 0)
        {
            var total_distance = this.delta_distance * (cnt-1);
            if (this.alignment == 1) // alignment center
            {
                total_distance /= 2;
                var center_x = (this._points.start.x + this._points.end.x)/2;
                var center_y = (this._points.start.y + this._points.end.y)/2;
                this._points.start.x = center_x - (total_distance*cos_a);
                this._points.start.y = center_y - (total_distance*sin_a);
            }
            else // alignment end
            {
                this._points.start.x = this._points.end.x - (total_distance * cos_a);
                this._points.start.y = this._points.end.y - (total_distance * sin_a);
            }            
        }
        
        var start_x = this._points.start.x;
        var start_y = this._points.start.y;
        var inst_angle = cr.to_degrees(a);       
	    for (i=0;i<cnt;i++)
	    {
	        params = {x:start_x + (dx*i),
	                  y:start_y + (dy*i),
	                  angle:a};
	        layouter.layout_inst(sprites[i], params);
	    }        
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
}());