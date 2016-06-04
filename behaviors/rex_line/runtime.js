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
	    if (!cr.plugins_.Sprite)
	    {
	        this.imgptX_get = null;
	        this.imgptY_get = null;
	    }
	    else
	    {
	        this.imgptX_get = cr.plugins_.Sprite.prototype.exps.ImagePointX;
	        this.imgptY_get = cr.plugins_.Sprite.prototype.exps.ImagePointY;
	    }	    
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
	    if (!this.recycled)
	    {
	        this.start = {inst: null, imgpt: 0};
	        this.end   = {inst: null, imgpt: 0};
	    }
	    else
	    {
            this.start.inst = null;
            this.end.inst = null;
	    }
	     
		this.startUid = -1;		// for loading 
        this.endUid = -1;		// for loading          

		if (!this.recycled)
		{
		    this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this);
        }	
										
		this.runtime.addDestroyCallback(this.myDestroyCallback);           
	};
	
	behinstProto.onInstanceDestroyed = function (inst)
	{
        if ((this.start.inst == inst) || (this.end.inst == inst))
        {
            this.start.inst = null;
            this.end.inst = null;
        }
	};
	
	behinstProto.onDestroy = function()
	{
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
    
	behinstProto.tick = function ()
	{
	};  
    
	behinstProto.tick2 = function ()
	{
        if ((!this.start.inst) || (!this.end.inst))
            return;	    
            
        var x0, y0, x1, y1;
        if (this.type.imgptX_get && this.type.imgptY_get)
        {
		    x0 = this.imgptX_get(this.start.inst, this.start.imgpt);
		    y0 = this.imgptY_get(this.start.inst, this.start.imgpt);	
		    x1 = this.imgptX_get(this.end.inst, this.end.imgpt);
		    y1 = this.imgptY_get(this.end.inst, this.end.imgpt);			    		            
        }
        else
        {
            x0 = this.start.inst.x;
            y0 = this.start.inst.y;
            x1 = this.end.inst.x;
            y1 = this.end.inst.y;                        
        }
        
        this.line_to_points(x0, y0, x1, y1);    
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
        	inst.x = x0;
        	inst.y = y0;
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

	var fake_ret = {value:0,
	                set_any: function(value){this.value=value;},
	                set_int: function(value){this.value=value;},	 
                    set_float: function(value){this.value=value;},	 
                    set_string: function(value){this.value=value;},	    
	               };  

    behinstProto.imgptX_get = function (inst, imgpt)
    {    
        this.type.imgptX_get.call(inst, fake_ret, imgpt);
        return fake_ret.value;
    };
    
    behinstProto.imgptY_get = function (inst, imgpt)
    {
        this.type.imgptY_get.call(inst, fake_ret, imgpt);
        return fake_ret.value;
    }; 
        
	behinstProto.lock_to_inst = function (start_inst, start_imgpt, end_inst, end_imgpt)
	{
        if ((!start_inst) || (!end_inst))
            return;	 
            
        this.start.inst = start_inst;
        this.start.imgpt = start_imgpt;
        this.end.inst = end_inst;
        this.end.imgpt = end_imgpt;             
	};    
    
	behinstProto.saveToJSON = function ()
	{
	    var start = {"uid": this.start.inst ? this.start.inst.uid : -1 ,
	                 "imgpt": this.start.imgpt};
	    var end = {"uid": this.end.inst ? this.end.inst.uid : -1 ,
	               "imgpt": this.end.imgpt};	                 
	                 
		return {
			"start": start,
            "end": end,
		};
	};   
    
	behinstProto.loadFromJSON = function (o)
	{
	    this.start.imgpt = o["start"]["imgpt"];
	    this.end.imgpt = o["end"]["imgpt"];
		this.startUid = o["start"]["uid"];		// wait until afterLoad to look up		
		this.endUid = o["end"]["uid"];
	};
	
	behinstProto.afterLoad = function ()
	{
		// Look up the pinned object UID now getObjectByUID is available
		if (this.startUid === -1)
			this.start.inst = null;
		else
		{
			this.start.inst = this.runtime.getObjectByUID(this.startUid);
			assert2(this.start.inst, "Failed to find start object by UID");
		}
		
		this.startUid = -1;
        
		// Look up the pinned object UID now getObjectByUID is available
		if (this.endUid === -1)
			this.end.inst = null;
		else
		{
			this.end.inst = this.runtime.getObjectByUID(this.endUid);
			assert2(this.end.inst, "Failed to find start object by UID");
		}
		
		this.endUid = -1;        
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
        if ((!inst0) || (!inst1))
            return;	  
            
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

    Acts.prototype.LockBtInsts = function (objtype0, imgpt0, objtype1, imgpt1)
	{
        if ((!objtype0) || (!objtype1))
            return;	    
        var inst0 = objtype0.getFirstPicked();
        var inst1 = objtype1.getFirstPicked();
        
        this.lock_to_inst(inst0, imgpt0, inst1, imgpt1);      
	}; 
    
    Acts.prototype.LockBtInstsUID = function (uid0, imgpt0, uid1, imgpt1)
	{
        var inst0 = this.runtime.getObjectByUID(uid0);
        var inst1 = this.runtime.getObjectByUID(uid1);
        
        this.lock_to_inst(inst0, imgpt0, inst1, imgpt1);      
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
    
	Exps.prototype.StartUID = function (ret)
	{
        var uid = this.start_inst ? this.start_inst.uid : -1;
        ret.set_int( uid );
	};
	Exps.prototype.EndUID = function (ret)
	{
        var uid = this.end_inst ? this.end_inst.uid : -1;
        ret.set_int( uid );
	};
    
}());