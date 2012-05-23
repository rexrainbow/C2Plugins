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

	var _sort_fn = function(a,b)
	{   
	    return (a>b)? 1:
               (a<b)? (-1):0;    
	};    	
	behinstProto.onCreate = function()
	{    
        this.horizontal_enable = (this.properties[0]==1);
        this.horizontal_boundary = [this.properties[1], this.properties[2]];
        this.vertical_enable = (this.properties[3]==1);
        this.vertical_boundary = [this.properties[4], this.properties[5]];	
		this.horizontal_boundary.sort(_sort_fn);
		this.vertical_boundary.sort(_sort_fn);		
	};
	
	behinstProto.tick = function ()
	{
	    var has_updated = false;
	    has_updated |= this.horizontal_boundary_check();
	    has_updated |= this.vertical_boundary_check();		
		if (has_updated)
		    this.inst.set_bbox_changed();  
	};
	
	behinstProto.horizontal_boundary_check = function ()
	{
	    if (!this.horizontal_enable)
		    return false;
		var curr_x = this.inst.x;
		if (this.inst.x < this.horizontal_boundary[0])
		    this.inst.x = this.horizontal_boundary[0];
        else if (this.inst.x > this.horizontal_boundary[1])
		    this.inst.x = this.horizontal_boundary[1];
	    return (curr_x != this.inst.x);
	};
	
	behinstProto.vertical_boundary_check = function ()
	{
	    if (!this.vertical_enable)
		    return false;
	    var curr_y = this.inst.y;
		if (this.inst.y < this.vertical_boundary[0])
		    this.inst.y = this.vertical_boundary[0];
        else if (this.inst.y > this.vertical_boundary[1])
		    this.inst.y = this.vertical_boundary[1];
	    return (curr_y != this.inst.y);			
	};
	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.EnableHorizontal = function (s)
	{
		this.horizontal_enable = (s==1);
	};  

	acts.EnableVertical = function (s)
	{
		this.vertical_enable = (s==1);
	};

	acts.SetHorizontalBoundary = function (l, r)
	{
		this.horizontal_boundary[0] = l;
		this.horizontal_boundary[1] = r;
		this.horizontal_boundary.sort(_sort_fn);
	};

	acts.SetVerticalBoundary = function (u, d)
	{
		this.vertical_boundary[0] = l;
		this.vertical_boundary[1] = r;
		this.vertical_boundary.sort(_sort_fn);
	};
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

}());