// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Line = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Line.prototype;
		
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
	};

	behinstProto.tick = function ()
	{
	};  

    behinstProto.line_to_points = function (x0, y0, x1, y1)
    {
        var dx=x1-x0, dy=y1-y0;
        var d = Math.sqrt(dx*dx + dy*dy);
        var a = Math.atan2(dy, dx);
        //d = Math.ceil(d);
                
        var has_update = false;
        var inst = this.inst;
        if ((inst.x !== x0) || (inst.y !== y0))
        {
        	inst.x = x;
        	inst.y = y;
            has_update = true;
        }
        
        if (inst.angle != a)
        {
            inst.angle = a;
            has_update = true;
        }
        
        if (inst.width != d)
        {
            inst.width = d;
            has_update = true;
        }
        
        if (has_update)
        {
        	inst.set_bbox_changed();    
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

    Acts.prototype.LineBtPoints = function (x0, y0, x1, y1)
	{
        this.line_to_points(x0, y0, x1, y1);       
	}; 

    Acts.prototype.LineBtInsts = function (objtype0, objtype1)
	{
        if ((!objtype0) || (!objtype1))
            return;	    
        var inst0 = objtype0.getFirstPicked();
        var inst1 = objtype1.getFirstPicked();
        this.line_to_points(inst0.x, inst0.y, inst1.x, inst1.y);      
	};     

    Acts.prototype.LineBtInstsUID = function (uid0, uid1)
	{
        var inst0 = this.runtime.getObjectByUID(uid0);
        var inst1 = this.runtime.getObjectByUID(uid1);
        if ((!inst0) || (!inst1))
            return;	    
        this.line_to_points(inst0.x, inst0.y, inst1.x, inst1.y);  
	};
	
    Acts.prototype.LineToPoint = function (x1, y1)
	{
        this.line_to_points(this.inst.x, this.inst.y, x1, y1);       
	}; 	  
	
    Acts.prototype.LineToInst = function (objtype1)
	{
        if (!objtype1)
            return;	    
        var inst0 = this.inst;
        var inst1 = objtype1.getFirstPicked();
        this.line_to_points(inst0.x, inst0.y, inst1.x, inst1.y);      
	};

    Acts.prototype.LineToInstUID = function (uid1)
	{
	    var inst0 = this.inst;
        var inst1 = this.runtime.getObjectByUID(uid1);
        if (!inst1)
            return;	    
        this.line_to_points(inst0.x, inst0.y, inst1.x, inst1.y);  
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.EndX = function (ret)
	{
        var end_x = this.inst.x + (Math.cos(this.inst.angle) * this.inst.width);
        ret.set_float( end_x );
	};
	Exps.prototype.EndY = function (ret)
	{
        var end_y = this.inst.y + (Math.sin(this.inst.angle) * this.inst.width);
        ret.set_float( end_y );
	};    
}());