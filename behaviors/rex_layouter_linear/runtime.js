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
	
	var OFFSET_RIGHT = 0;
	var OFFSET_BOTTOM = 1;
	var OFFSET_LEFT = 2;
	var OFFSET_TOP = 3;
    var _offset_p = {x:0, y:0};
	var _offset_get = function (inst, direction)
	{	    
        inst.update_bbox();
        var quad = inst.bquad;  
        var px, py;        
	    switch (direction)
	    {
	    case OFFSET_RIGHT:
            px = (quad.trx + quad.brx)/2;
            py = (quad.try_ + quad.bry)/2;
	        break;
	    case OFFSET_BOTTOM:	  
            px = (quad.blx + quad.brx)/2;   
            py = (quad.bly + quad.bry)/2;     
	        break;	   
	    case OFFSET_LEFT:
            px = (quad.tlx + quad.blx)/2;
            py = (quad.tly + quad.bly)/2;
	        break;
	    case OFFSET_TOP:
            px = (quad.tlx + quad.trx)/2; 
            py = (quad.tly + quad.try_)/2;        
	        break;	             
	    }
        _offset_p.x = inst.x - px;
        _offset_p.y = inst.y - py;
	    return _offset_p;
	}; 	

	behinstProto._get_start_end_points = function (insts)
	{     
        var layouter =  this.inst;   
	    layouter.update_bbox();
	    var quad = layouter.bquad;
	    var inst_cnt = insts.length;
        var _offset_p;
        switch (this.direction)
        {
        case 0:  // Left to right
            this._points.start.x = (quad.tlx + quad.blx)/2;
            this._points.start.y = (quad.tly + quad.bly)/2;          
            this._points.end.x = (quad.trx + quad.brx)/2;
            this._points.end.y = (quad.try_ + quad.bry)/2;
            if (inst_cnt >= 1)
            {
                _offset_p = _offset_get(insts[0], OFFSET_LEFT);
                this._points.start.x += _offset_p.x;
                this._points.start.y += _offset_p.y;
            }
            if (inst_cnt >= 2)
            {
                _offset_p = _offset_get(insts[inst_cnt-1], OFFSET_RIGHT);
                this._points.end.x += _offset_p.x;
                this._points.end.y += _offset_p.y;
            }
            break;
        case 1:  // Right to left
            this._points.start.x = (quad.trx + quad.brx)/2;
            this._points.start.y = (quad.try_ + quad.bry)/2;
            this._points.end.x = (quad.tlx + quad.blx)/2;
            this._points.end.y = (quad.tly + quad.bly)/2;
            if (inst_cnt >= 1)
            {
                _offset_p = _offset_get(insts[0], OFFSET_RIGHT);
                this._points.start.x += _offset_p.x;
                this._points.start.y += _offset_p.y;
            }
            if (inst_cnt >= 2)
            {
                _offset_p = _offset_get(insts[inst_cnt-1], OFFSET_LEFT);
                this._points.end.x += _offset_p.x;
                this._points.end.y += _offset_p.y;
            }            
            break;   
        case 2:  // Top to bottom
            this._points.start.x = (quad.tlx + quad.trx)/2;    
            this._points.start.y = (quad.tly + quad.try_)/2;         
            this._points.end.x = (quad.blx + quad.brx)/2; 
            this._points.end.y = (quad.bly + quad.bry)/2;
            if (inst_cnt >= 1)
            {
                _offset_p = _offset_get(insts[0], OFFSET_TOP);
                this._points.start.x += _offset_p.x;
                this._points.start.y += _offset_p.y;
            }
            if (inst_cnt >= 2)
            {
                _offset_p = _offset_get(insts[inst_cnt-1], OFFSET_BOTTOM);
                this._points.end.x += _offset_p.x;
                this._points.end.y += _offset_p.y;
            }             
            break;
        case 3:  // Bottom to top
            this._points.start.x = (quad.blx + quad.brx)/2;   
            this._points.start.y = (quad.bly + quad.bry)/2;     
            this._points.end.x = (quad.tlx + quad.trx)/2;      
            this._points.end.y = (quad.tly + quad.try_)/2; 
            if (inst_cnt >= 1)
            {
                _offset_p = _offset_get(insts[0], OFFSET_BOTTOM);
                this._points.start.x += _offset_p.x;
                this._points.start.y += _offset_p.y;
            }
            if (inst_cnt >= 2)
            {
                _offset_p = _offset_get(insts[inst_cnt-1], OFFSET_TOP);
                this._points.end.x += _offset_p.x;
                this._points.end.y += _offset_p.y;
            }
            break;            
        }
        return this._points;
	};  
    
 	behinstProto._on_update = function ()
	{             
        this.mode_handler[this.mode].apply(this);
    };
    
    // rotate angle of instances
    var angle_saved = [];
    var _rotate_all = function (insts, a)
    {
        angle_saved.length = 0;
        var cnt = insts.length, i, inst;
        for (i=0; i<cnt; i++)  
        {      
            inst = insts[i];
            angle_saved.push[inst.angle];
            inst.angle = a;
            inst.set_bbox_changed();
        }
    };
    var _rotate_recover = function (insts)
    {
        var cnt = insts.length, i, inst;
        for (i=0; i<cnt; i++)  
        {      
            inst = insts[i];
            inst.angle = angle_saved[i];
            inst.set_bbox_changed();
        }
        angle_saved.length = 0;
    };    

	behinstProto._update_avarage_mode = function ()
	{    
	    var layouter =  this.inst;
	    var sprites = layouter.sprites;
	    var cnt = sprites.length;
	    if (cnt == 0)
	        return;
	        
	    var a = layouter.angle; 
	    _rotate_all(sprites, a);
        var points = this._get_start_end_points(sprites);        
        var i, params;
        var seg = (cnt==1)? 1: (cnt-1);
        var dx = (points.end.x - points.start.x)/seg;
        var dy = (points.end.y - points.start.y)/seg;
        this.delta_distance = Math.sqrt((dx*dx) + (dy*dy));
        var start_x = points.start.x;
        var start_y = points.start.y;
        var inst_angle = cr.to_degrees(a);
        _rotate_recover(sprites);
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
	    var layouter =  this.inst;
	    var sprites = layouter.sprites;
	    var cnt = sprites.length;
	    if (cnt == 0)
	        return;
	        
	    _rotate_all(sprites, layouter.angle);	        
        var points = this._get_start_end_points(sprites);
        var layouter =  this.inst;   
        var a = Math.atan2(points.end.y - points.start.y,
                           points.end.x - points.start.x);
        var cos_a = Math.cos(a), sin_a = Math.sin(a);        
        var i, params;
        var dx = this.delta_distance * cos_a;
        var dy = this.delta_distance * sin_a; 
        
        // re-calc start point
        var total_distance = this.delta_distance * (cnt-1);
        switch (this.alignment)
        {
        case 0:
            break;
        case 1:  // alignment center
            total_distance /= 2;
            var center_x = (points.start.x + points.end.x)/2;
            var center_y = (points.start.y + points.end.y)/2;
            this._points.start.x = center_x - (total_distance * cos_a);
            this._points.start.y = center_y - (total_distance * sin_a);
            break;
        case 2:  // alignment end
            this._points.start.x = points.end.x - (total_distance * cos_a);
            this._points.start.y = points.end.y - (total_distance * sin_a);        
            break;            
        }
        
        var start_x = points.start.x;
        var start_y = points.start.y;
        a = layouter.angle;
        var inst_angle = cr.to_degrees(a);
        _rotate_recover(sprites);        
	    for (i=0;i<cnt;i++)
	    {
	        params = {x:start_x + (dx*i),
	                  y:start_y + (dy*i),
	                  angle:a};	          
	        layouter.layout_inst(sprites[i], params);
	    }        
	};
    
	behinstProto.saveToJSON = function ()
	{
		return { "m": this.mode, 
                 "dir": this.direction,
                 "ali": this.alignment,
                 "dd": this.delta_distance
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{            
        this.mode = o["m"];        
        this.direction = o["dir"];
        this.alignment = o["ali"];
        this.delta_distance = o["dd"];
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
    
	Acts.prototype.SetDirection = function (m)
	{
		this.direction = m;		
	};	
    
	Acts.prototype.SetAlignment = function (m)
	{
		this.alignment = m;		
	};	
    
	Acts.prototype.SetDeltaDist = function (dist)
	{
		this.delta_distance = dist;		
	};		
		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
}());