// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.rex_miniboard_rotate = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.rex_miniboard_rotate.prototype;
		
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
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{  
	    this.face_direction = this.properties[0];
        this.is_set_position = (this.properties[1] == 1);
	    this.is_rotating_request_accepted = false;
	    this.is_flipping_request_accepted = false;
	    this.is_mirroring_request_accepted = false;	    
	};
	
	behinstProto.tick = function ()
	{
	};
	
	var direction_normalize = function (dir, dir_count)
	{
	    dir = dir % dir_count;
	    if (dir < 0)
	        dir += dir_count;
	        
	    return dir;
	};	
	
	var TestModeMap = [0, 2, 3];
	
	behinstProto.rotate_miniboard = function (a, test_mode, is_set_position, is_test)
	{    
	    // prepare
	    var self = this;
	    var layout = this.inst.GetLayout();   
	    var on_transfer_cell = function (xyz, options)
	    {
            var nx = layout.LXYZRotate2LX(xyz.x, xyz.y, xyz.z, options.direction);
            var ny = layout.LXYZRotate2LY(xyz.x, xyz.y, xyz.z, options.direction);
	        var nz = xyz.z;
	        
	        return window.RexC2BoardLXYZCache.allocLine(nx, ny, nz);
	    };

	    var on_accepted = function ()
	    {      
	        self.is_rotating_request_accepted = true; 
	        self.runtime.trigger(cr.behaviors.rex_miniboard_rotate.prototype.cnds.OnRotatingRequestAccepted, self.inst);
	    };	    
	    var on_rejected = function ()
	    {      
	        self.is_rotating_request_accepted = false; 
	        self.runtime.trigger(cr.behaviors.rex_miniboard_rotate.prototype.cnds.OnRotatingRequestRejected, self.inst);
	    };
	    // prepare		    
		   
	    var dir_count = layout.GetDirCount();
	    a = direction_normalize(a, dir_count); 
	    if (a == 0)
	    {
            on_accepted();	                       
	        return true;
	    }
	    		    
	    var options = { checkMode: TestModeMap[test_mode],
	                    isSetPosition : is_set_position,
	                    isTest : is_test,
	                    
	                    onTransferCell : on_transfer_cell,
	                    direction: a,
	                    
	                    onAccepted : on_accepted,
	                    onRejected : on_rejected
	                   };	                             
	    return this.inst.TransferMiniboard(options);
    };	
	
	behinstProto.flip_miniboard = function (test_mode, is_set_position, is_test)
	{
	    // prepare		    
	    var self = this;
	    var on_transfer_cell = function (xyz)
	    {      
            var nx = xyz.x;
            var ny = -xyz.y;
	        var nz = xyz.z;
	        
	        return window.RexC2BoardLXYZCache.allocLine(nx, ny, nz);
	    };
	    var on_accepted = function ()
	    {      
	        self.is_flipping_request_accepted = true; 
	        self.runtime.trigger(cr.behaviors.rex_miniboard_rotate.prototype.cnds.OnFlippingRequestAccepted, self.inst);
	    };	    
	    var on_rejected = function ()
	    {      
	        self.is_flipping_request_accepted = false; 
	        self.runtime.trigger(cr.behaviors.rex_miniboard_rotate.prototype.cnds.OnFlippingRequestRejected, self.inst);
	    };		
	    // prepare		        
		    
	    var options = { checkMode: TestModeMap[test_mode],
	                    isSetPosition : is_set_position,
	                    isTest : is_test,
	                    
	                    onTransferCell : on_transfer_cell,
	                    
	                    onAccepted : on_accepted,
	                    onRejected : on_rejected
	                   };
	    return this.inst.TransferMiniboard(options);
    };
    	
	behinstProto.mirror_miniboard = function (test_mode, is_set_position, is_test)
	{
	    // prepare		    
	    var self = this;
	    var on_transfer_cell = function (xyz)
	    {      
            var nx = -xyz.x;
            var ny = xyz.y;
	        var nz = xyz.z;
	        
	        return window.RexC2BoardLXYZCache.allocLine(nx, ny, nz);
	    };
	    var on_accepted = function ()
	    {      
	        self.is_mirroring_request_accepted = true; 
	        self.runtime.trigger(cr.behaviors.rex_miniboard_rotate.prototype.cnds.OnMirroringRequestAccepted, self.inst);
	    };	    
	    var on_rejected = function ()
	    {      
	        self.is_mirroring_request_accepted = false; 
	        self.runtime.trigger(cr.behaviors.rex_miniboard_rotate.prototype.cnds.OnMirroringRequestRejected, self.inst);
	    };		    
	    // prepare	
	    		    
	    var options = { checkMode: TestModeMap[test_mode],
	                    isSetPosition : is_set_position,
	                    isTest : is_test,
	                    
	                    onTransferCell : on_transfer_cell,
	                    
	                    onAccepted : on_accepted,
	                    onRejected : on_rejected
	                   };
	    return this.inst.TransferMiniboard(options);
    };
    
	behinstProto.saveToJSON = function ()
	{  
	    return {"fd": this.face_direction,
                "ra": this.is_rotating_request_accepted,
                "fa": this.is_flipping_request_accepted,
                "ma": this.is_mirroring_request_accepted,
	           };
	};	
		
	behinstProto.loadFromJSON = function (o)
	{       
	    this.face_direction = o["fd"];
        this.is_rotating_request_accepted = o["ra"];
        this.is_flipping_request_accepted = o["fa"];        
        this.is_mirroring_request_accepted = o["ma"];        
	};	
	
	//////////////////////////////////////
	// Conditions
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	    
	Cnds.prototype.TestRotate = function (a, test_mode)
	{
		return this.rotate_miniboard(a, test_mode, false, true);
	}; 
    
	Cnds.prototype.TestFaceTo = function (a, test_mode)
	{	    
	    var da = a - this.face_direction;
		return this.rotate_miniboard(a, test_mode, false, true);
	}; 
    
	Cnds.prototype.TestFlip = function (test_mode)
	{	    
		return this.flip_miniboard(test_mode, false, true);
	}; 	    
    
	Cnds.prototype.TestMirror = function (test_mode)
	{	    
		return this.mirror_miniboard(test_mode, false, true);
	}; 	
	
	Cnds.prototype.IsRotatingRequestAccepted = function ()
	{
		return this.is_rotating_request_accepted;
	};     
    
    Cnds.prototype.OnRotatingRequestAccepted = function ()
	{
		return true;
	};	
    Cnds.prototype.OnRotatingRequestRejected = function ()
	{
		return true;
	}; 
	
	Cnds.prototype.IsFlippingRequestAccepted = function ()
	{
		return this.is_rotating_request_accepted;
	};     
    
    Cnds.prototype.OnFlippingRequestAccepted = function ()
	{
		return true;
	};	
    Cnds.prototype.OnFlippingRequestRejected = function ()
	{
		return true;
	};	
	
	Cnds.prototype.IsMirroringRequestAccepted = function ()
	{
		return this.is_mirroring_request_accepted;
	};     
    
    Cnds.prototype.OnMirroringRequestAccepted = function ()
	{
		return true;
	};	
    Cnds.prototype.OnMirroringRequestRejected = function ()
	{
		return true;
	};		   
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.Rotate = function (a, test_mode)
	{
        this.rotate_miniboard(a, test_mode, this.is_set_position, false);
	};  

	Acts.prototype.FaceTo = function (a, test_mode)
	{ 
	    var da = a - this.face_direction;
        this.rotate_miniboard(da, test_mode, this.is_set_position, false);
	}; 

	Acts.prototype.Flip = function (test_mode)
	{ 
        this.flip_miniboard(test_mode, this.is_set_position, false);
	};	

	Acts.prototype.Mirror = function (test_mode)
	{ 
        this.mirror_miniboard(test_mode, this.is_set_position, false);
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.Direction = function (ret)
    {
	    ret.set_int(this.face_direction);
	};	
}());