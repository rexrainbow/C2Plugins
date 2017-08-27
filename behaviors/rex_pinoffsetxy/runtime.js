// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_pinOffsetXY = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_pinOffsetXY.prototype;
		
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
		this.pinObject = null;
		this.pinObjectUid = -1;		// for loading
		this.pinOffsetX = 0;
		this.pinOffsetY = 0;
		
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
			"offx": this.pinOffsetX,
			"offy": this.pinOffsetY,
		};
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.pinObjectUid = o["uid"];		// wait until afterLoad to look up		
		this.pinOffsetX = o["offx"];
		this.pinOffsetY = o["offy"];
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

	behinstProto.tick2 = function ()
	{
		if (!this.pinObject)
			return;
		
		var newx = this.pinObject.x + this.pinOffsetX;
		var newy = this.pinObject.y + this.pinOffsetY;		
		if (this.inst.x !== newx || this.inst.y !== newy)
		{
			this.inst.x = newx;
			this.inst.y = newy;
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

	Acts.prototype.Pin = function (obj, offsetX, offsetY)
	{
		if (!obj)
			return;
			
		var otherinst = obj.getFirstPicked(this.inst);
		
		if (!otherinst)
			return;
			
        if (offsetX == null)
            offsetX = this.inst.x - otherinst.x;
        if (offsetY == null)
            offsetY = this.inst.y - otherinst.y;
                  
		this.pinObject = otherinst;
		this.pinOffsetX = offsetX;
		this.pinOffsetY = offsetY;
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