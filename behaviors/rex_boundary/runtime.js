// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_boundary = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_boundary.prototype;
		
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

	var _sort_boundary = function(boundary)
	{   
	    if (boundary[1] < boundary[0])
	    {
	        var tmp = boundary[0]; boundary[0] = boundary[1]; boundary[1] = tmp;
	    }
	};    	
	behinstProto.onCreate = function()
	{    
        this.horizontal_enable = (this.properties[0]==1);
        this.horizontal_boundary = [this.properties[1], this.properties[2]];
        this.vertical_enable = (this.properties[3]==1);
        this.vertical_boundary = [this.properties[4], this.properties[5]];
        _sort_boundary(this.horizontal_boundary);
        _sort_boundary(this.vertical_boundary);
        this.horizontal_pin_instance = {"uid":(-1), "p0":null, "p1":null};
        this.vertical_pin_instance = {"uid":(-1), "p0":null, "p1":null};
	};

	behinstProto.tick = function ()
	{
        this.horizontal_boundary_update();
        this.vertical_boundary_update();
	    var is_hit_boundary = false;
	    is_hit_boundary |= this.horizontal_boundary_check();
	    is_hit_boundary |= this.vertical_boundary_check();		
		if (is_hit_boundary)
        {                         
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitAnyBoundary, this.inst);            
		    this.inst.set_bbox_changed();             
        }
	};
    
	behinstProto.horizontal_boundary_update = function ()
	{
        var pin = this.horizontal_pin_instance;
        var pin_inst = this.runtime.getObjectByUID(pin["uid"]);
        if (pin_inst == null)
            return;
        this.horizontal_boundary[0] = pin_inst.getImagePoint(pin["p0"], true);
        this.horizontal_boundary[1] = pin_inst.getImagePoint(pin["p1"], true);    
        _sort_boundary(this.horizontal_boundary);
	};
    
	behinstProto.vertical_boundary_update = function ()
	{
        var pin = this.vertical_pin_instance;
        var pin_inst = this.runtime.getObjectByUID(pin["uid"]);
        if (pin_inst == null)
            return;
        this.vertical_boundary[0] = pin_inst.getImagePoint(pin["p0"], false);
        this.vertical_boundary[1] = pin_inst.getImagePoint(pin["p1"], false);    
        _sort_boundary(this.vertical_boundary);
	};
    
	behinstProto.horizontal_boundary_check = function ()
	{
	    if (!this.horizontal_enable)
		    return false;
		var curr_x = this.inst.x;
		if (this.inst.x < this.horizontal_boundary[0])
        {
		    this.inst.x = this.horizontal_boundary[0];
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitLeftBoundary, this.inst);
        }
        else if (this.inst.x > this.horizontal_boundary[1])
        {
		    this.inst.x = this.horizontal_boundary[1];
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitRightBoundary, this.inst);
        }
	    return (curr_x != this.inst.x);
	};
	
	behinstProto.vertical_boundary_check = function ()
	{
	    if (!this.vertical_enable)
		    return false;
	    var curr_y = this.inst.y;
		if (this.inst.y < this.vertical_boundary[0])
        {
		    this.inst.y = this.vertical_boundary[0];
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitTopBoundary, this.inst);
        }
        else if (this.inst.y > this.vertical_boundary[1])
        {
		    this.inst.y = this.vertical_boundary[1];
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitBottomBoundary, this.inst);
        }
	    return (curr_y != this.inst.y);			
	};
    
	behinstProto._horizontal_percent_get = function ()
	{
        this.horizontal_boundary_update();        
        var offset_inst = this.inst.x - this.horizontal_boundary[0];
        var offset_bound = this.horizontal_boundary[1] - this.horizontal_boundary[0];
        var pec = cr.clamp((offset_inst/offset_bound), 0, 1) ;
        return pec;
	};    
	behinstProto._vertical_percent_get = function ()
	{
        this.vertical_boundary_update(); 
        var offset_inst = this.inst.y - this.vertical_boundary[0];
        var offset_bound = this.vertical_boundary[1] - this.vertical_boundary[0];
        var pec = cr.clamp((offset_inst/offset_bound), 0, 1);
        return pec;
	};        
	
	behinstProto.saveToJSON = function ()
	{
		return { "he": this.horizontal_enable,
		         "hb": this.horizontal_boundary,
                 "ve": this.vertical_enable,                 
                 "vb": this.vertical_boundary,
                 "hp": this.horizontal_pin_instance,
                 "vp": this.vertical_pin_instance
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.activated = o["he"];
		this.horizontal_boundary = o["hb"];
        this.vertical_enable = o["ve"];        
        this.vertical_boundary = o["vb"];
        this.horizontal_pin_instance = o["hp"];
        this.vertical_pin_instance = o["vp"];
	};

	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Horizontal", "value": this.horizontal_boundary[0] + "," + this.horizontal_boundary[1]},
				{"name": "Vertical", "value": this.vertical_boundary[0] + "," + this.vertical_boundary[1]},
			]
		});
	};
	/**END-PREVIEWONLY**/
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.OnHitAnyBoundary = function ()
	{
		return true;
	};
    
	Cnds.prototype.OnHitLeftBoundary = function ()
	{
		return true;
	};
    
	Cnds.prototype.OnHitRightBoundary = function ()
	{
		return true;
	};    
    
	Cnds.prototype.OnHitTopBoundary = function ()
	{
		return true;
	};
    
	Cnds.prototype.OnHitBottomBoundary = function ()
	{
		return true;
	};        
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.EnableHorizontal = function (s)
	{
		this.horizontal_enable = (s==1);
	};  

	Acts.prototype.EnableVertical = function (s)
	{
		this.vertical_enable = (s==1);
	};

	Acts.prototype.SetHorizontalBoundary = function (l, r)
	{
		this.horizontal_boundary[0] = l;
		this.horizontal_boundary[1] = r;
		_sort_boundary(this.horizontal_boundary);
        this.horizontal_pin_instance["uid"] = (-1);
	};

	Acts.prototype.SetVerticalBoundary = function (u, d)
	{
		this.vertical_boundary[0] = u;
		this.vertical_boundary[1] = d;
		_sort_boundary(this.vertical_boundary);
        this.vertical_pin_instance["uid"] = (-1);        
	};

    var _get_instance = function (obj)
	{
		if (!obj)
			return null;
		return obj.getFirstPicked();
	};
	Acts.prototype.SetHorizontalBoundaryToObject = function (obj, left_imgpt, right_imgpt)
	{
        var pin = this.horizontal_pin_instance;
		pin["uid"] = _get_instance(obj).uid;	
        pin["p0"] = left_imgpt;	
        pin["p1"] = right_imgpt;	
	};   
    
	Acts.prototype.SetVerticalBoundaryToObject = function (obj, top_imgpt, bottom_imgpt)
	{
        var pin = this.vertical_pin_instance;
		pin["uid"] = _get_instance(obj).uid;	
        pin["p0"] = top_imgpt;	
        pin["p1"] = bottom_imgpt;	        
	};
 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.HorizontalEnable = function (ret)
	{
        ret.set_int( (this.horizontal_enable)? 1:0 );
	};

	Exps.prototype.VerticalEnable = function (ret)
	{
        ret.set_int( (this.vertical_enable)? 1:0 );
	}; 
    
	Exps.prototype.LeftBound = function (ret)
	{
        this.horizontal_boundary_update();   
        ret.set_float( this.horizontal_boundary[0] );
	};

	Exps.prototype.RightBound = function (ret)
	{
        this.horizontal_boundary_update();    
        ret.set_float( this.horizontal_boundary[1] );
	};  

	Exps.prototype.TopBound = function (ret)
	{
        this.vertical_boundary_update();     
        ret.set_float( this.vertical_boundary[0] );
	};

	Exps.prototype.BottomBound = function (ret)
	{
        this.vertical_boundary_update();     
        ret.set_float( this.vertical_boundary[1] );
	};  
    
	Exps.prototype.HorPercent = function (ret)
	{
        ret.set_float( this._horizontal_percent_get() );
	};

	Exps.prototype.VerPercent = function (ret)
	{
        ret.set_float( this._vertical_percent_get() );
	};   
    
	Exps.prototype.HorScale = function (ret, min_value, max_value)
	{
        var pec = this._horizontal_percent_get();
        if (max_value < min_value)
        {
            var tmp = max_value; max_value = min_value; min_value = tmp;
            pec = 1.0-pec;
        }
        var scaled = min_value + pec*(max_value-min_value);
        ret.set_float( scaled );
	};
    
	Exps.prototype.VerScale = function (ret, min_value, max_value)
	{
        var pec = this._vertical_percent_get();
        if (max_value < min_value)
        {
            var tmp = max_value; max_value = min_value; min_value = tmp;
            pec = 1.0-pec;
        }
        var scaled = min_value + pec*(max_value-min_value);
        ret.set_float( scaled );
	};    
}());