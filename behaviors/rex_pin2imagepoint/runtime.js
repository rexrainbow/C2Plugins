// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_pin2imgpt = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_pin2imgpt.prototype;
		
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
	        this.getImgptX = null;
	        this.getImgptY = null;
	    }
	    else
	    {
	        this.getImgptX = cr.plugins_.Sprite.prototype.exps.ImagePointX;
	        this.getImgptY = cr.plugins_.Sprite.prototype.exps.ImagePointY;
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
		this.pinObject = null;
		this.pinObjectUid = -1;		// for loading
		this.imgpt = null;
		this.myStartAngle = 0;
		this.theirStartAngle = 0;
		this.lastKnownAngle = 0;		
		this.mode = null;
		
		var self = this;
		
		// Need to know if pinned object gets destroyed
		if (!this.recycled)
		{
			this.myDestroyCallback = (function(inst) {
													self.onInstanceDestroyed(inst);
												});
		}
										
		this.runtime.addDestroyCallback(this.myDestroyCallback);
	};
	
	behinstProto.saveToJSON = function ()
	{
		return {
			"uid": this.pinObject ? this.pinObject.uid : -1,
			"imgpt": this.imgpt,
			"msa": this.myStartAngle,
			"tsa": this.theirStartAngle,
			"lka": this.lastKnownAngle,			
			"m": this.mode
		};
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.pinObjectUid = o["uid"];		// wait until afterLoad to look up		
		this.imgpt = o["imgpt"];
		this.myStartAngle = o["msa"];
		this.theirStartAngle = o["tsa"];
		this.lastKnownAngle = o["lka"];		
		this.mode = o["m"];
	};
	
	behinstProto.afterLoad = function ()
	{
		// Look up the pinned object UID now getObjectByUID is available
		if (this.pinObjectUid === -1)
			this.pinObject = null;
		else
		{
			this.pinObject = this.runtime.getObjectByUID(this.pinObjectUid);
			assert2(this.pinObject, "Failed to find pin object by UID");
		}
		
		this.pinObjectUid = -1;
	};
	
	behinstProto.onInstanceDestroyed = function (inst)
	{
		// Pinned object being destroyed
		if (this.pinObject == inst)
			this.pinObject = null;
	};
	
	behinstProto.onDestroy = function()
	{
		this.pinObject = null;
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	
	behinstProto.tick = function ()
	{
		// do work in tick2 instead, after events to get latest object position
	};
	
	var fake_ret = {value:0,
	                set_any: function(value){this.value=value;},
	                set_int: function(value){this.value=value;},	 
                    set_float: function(value){this.value=value;},	 
                    set_string: function(value){this.value=value;},	    
	               };  

    behinstProto.getImgptX = function (pinObject, imgpt)
    {    
        this.type.getImgptX.call(pinObject, fake_ret, imgpt);
        return fake_ret.value;
    };
    
    behinstProto.getImgptY = function (pinObject, imgpt)
    {
        this.type.getImgptY.call(pinObject, fake_ret, imgpt);
        return fake_ret.value;
    };    
    	                    
	behinstProto.tick2 = function ()
	{
		if ((!this.pinObject) || (!this.type.getImgptX) || (!this.type.getImgptY))
			return;

		var newx = this.getImgptX(this.pinObject, this.imgpt);
		var newy = this.getImgptY(this.pinObject, this.imgpt);						
		if (this.inst.x !== newx || this.inst.y !== newy)
		{
			this.inst.x = newx;
			this.inst.y = newy;
			this.inst.set_bbox_changed();
		}
		
		if (this.mode == 1)
		{
		    // Instance angle has changed by events/something else
		    if (this.lastKnownAngle !== this.inst.angle)
		    {
			    this.myStartAngle = cr.clamp_angle(this.myStartAngle + (this.inst.angle - this.lastKnownAngle));
			}
					    
		    var newangle = cr.clamp_angle(this.myStartAngle + (this.pinObject.angle - this.theirStartAngle));
		    this.lastKnownAngle = newangle;		
    	}				
		if ((this.mode == 1) && (this.inst.angle !== newangle))
		{
			this.inst.angle = newangle;
			this.inst.set_bbox_changed();
		}		
	};
	

	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Is pinned", "value": !!this.pinObject, "readonly": true},
				{"name": "Pinned UID", "value": this.pinObject ? this.pinObject.uid : 0, "readonly": true}
			]
		});
	};
	/**END-PREVIEWONLY**/
		 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.IsPinned = function ()
	{
		return !!this.pinObject;
	};
		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.Pin = function (obj, imgpt, mode_)
	{
		if (!obj)
			return;
			
		var otherinst = obj.getFirstPicked(this.inst);
		
		if (!otherinst)
			return;
			                
		this.pinObject = otherinst;
        this.imgpt = imgpt;
		this.myStartAngle = this.inst.angle;
		this.lastKnownAngle = this.inst.angle;
		this.theirStartAngle = otherinst.angle;         
        this.mode = mode_; 		
	};
	
	Acts.prototype.Unpin = function ()
	{
		this.pinObject = null;
	};  
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.PinnedUID = function (ret)
	{
		ret.set_int(this.pinObject ? this.pinObject.uid : -1);
	};
	 
}());