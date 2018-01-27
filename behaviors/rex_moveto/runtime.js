// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_MoveTo = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var behaviorProto = cr.behaviors.Rex_MoveTo.prototype;

	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function () {

	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function () {
		this.enabled = (this.properties[0] === 1);
		if (!this.recycled) {
			this.moveParams = {};
		}
		this.moveParams["max"] = this.properties[1];
		this.moveParams["acc"] = this.properties[2];
		this.moveParams["dec"] = this.properties[3];
		this.soildStopEnable = (this.properties[4] === 1);
		this.isContinueMode = (this.properties[5] === 1);

		if (!this.recycled) {
			this.target = { "x": 0, "y": 0, "a": 0 };
		}
		this.isMoving = false;
		this.currentSpeed = 0;
		this.remainDistance = 0;
		this.remainDt = 0;

		if (!this.recycled) {
			this.prePosition = { "x": 0, "y": 0 };
		}
		this.prePosition["x"] = 0;
		this.prePosition["y"] = 0;

		this.movingAngleData = newPointData(this.movingAngleData);
		this.movingAngleStartData = newPointData(this.movingAngleStartData);
		this.lastTick = null;
		this.isMyCall = false;
	};

	var newPointData = function (point) {
		if (point == null)
			point = {};
		point["x"] = 0;
		point["y"] = 0;
		point["a"] = -1;
		return point;
	};

	behinstProto.tick = function () {
		this.remainDt = 0;
		if ((!this.enabled) || (!this.isMoving))
			return;

		var dt = this.runtime.getDt(this.inst);

		this.move(dt);
	};

	behinstProto.move = function (dt) {
		if (dt == 0)   // can not move if dt == 0
			return;

		if ((this.prePosition["x"] !== this.inst.x) || (this.prePosition["y"] !== this.inst.y))
			this.resetCurrentPosition();    // reset this.remainDistance

		// assign speed
		var isSlowDown = false;
		if (this.moveParams["dec"] != 0) {
			// is time to deceleration?
			var d = (this.currentSpeed * this.currentSpeed) / (2 * this.moveParams["dec"]); // (v*v)/(2*a)
			isSlowDown = (d >= this.remainDistance);
		}
		var acc = (isSlowDown) ? (-this.moveParams["dec"]) : this.moveParams["acc"];
		if (acc != 0) {
			this.setCurrentSpeed(this.currentSpeed + (acc * dt));
		}

		// Apply movement to the object     
		var distance = this.currentSpeed * dt;
		this.remainDistance -= distance;

		var isHitTarget = false;
		var angle = this.target["a"];
		var ux = Math.cos(angle);
		var uy = Math.sin(angle);
		// is hit to target at next tick?
		if ((this.remainDistance <= 0) || (this.currentSpeed <= 0)) {
			isHitTarget = true;
			this.inst.x = this.target["x"];
			this.inst.y = this.target["y"];

			if (this.currentSpeed > 0)
				this.remainDt = (-this.remainDistance) / this.currentSpeed;

			this.getMovingAngle();
			this.setCurrentSpeed(0);
			this.remainDistance = 0;
		}
		else {
			var angle = this.target["a"];
			this.inst.x += (distance * ux);
			this.inst.y += (distance * uy);
		}

		this.inst.set_bbox_changed();

		var isSolidStop = false;
		if (this.soildStopEnable) {
			var collobj = this.runtime.testOverlapSolid(this.inst);
			if (collobj) {
				this.runtime.registerCollision(this.inst, collobj);
				this.runtime.pushOutSolid(this.inst, -ux, -uy, Math.max(distance, 50));
				isSolidStop = true;
			}
		}

		this.prePosition["x"] = this.inst.x;
		this.prePosition["y"] = this.inst.y;

		if (isSolidStop) {
			this.isMoving = false;  // stop
			this.isMyCall = true;
			this.runtime.trigger(cr.behaviors.Rex_MoveTo.prototype.cnds.OnSolidStop, this.inst);
			this.isMyCall = false;
		}
		else if (isHitTarget) {
			this.isMoving = false;  // stop
			this.isMyCall = true;
			this.runtime.trigger(cr.behaviors.Rex_MoveTo.prototype.cnds.OnHitTarget, this.inst);
			this.isMyCall = false;
		}
	};

	behinstProto.tick2 = function () {
		// save pre pos to get moveing angle
		this.movingAngleData["x"] = this.inst.x;
		this.movingAngleData["y"] = this.inst.y;
	};

	behinstProto.setCurrentSpeed = function (speed) {
		if (speed != null) {
			this.currentSpeed = (speed > this.moveParams["max"]) ?
				this.moveParams["max"] : speed;
		}
		else if (this.moveParams["acc"] == 0) {
			this.currentSpeed = this.moveParams["max"];
		}
	};

	behinstProto.resetCurrentPosition = function () {
		var dx = this.target["x"] - this.inst.x;
		var dy = this.target["y"] - this.inst.y;

		this.target["a"] = Math.atan2(dy, dx);
		this.remainDistance = Math.sqrt((dx * dx) + (dy * dy));
		this.prePosition["x"] = this.inst.x;
		this.prePosition["y"] = this.inst.y;
	};

	behinstProto.setTargetPos = function (_x, _y) {
		this.target["x"] = _x;
		this.target["y"] = _y;
		this.setCurrentSpeed(null);
		this.resetCurrentPosition();
		this.movingAngleData["x"] = this.inst.x;
		this.movingAngleData["y"] = this.inst.y;
		this.isMoving = true;

		// start position
		this.movingAngleStartData["x"] = this.inst.x;
		this.movingAngleStartData["y"] = this.inst.y;
		this.movingAngleStartData["a"] = cr.to_clamped_degrees(cr.angleTo(this.inst.x, this.inst.y, _x, _y));

		if (this.isContinueMode)
			this.move(this.remainDt);
	};

	behinstProto.isTickChanged = function () {
		var curTick = this.runtime.tickcount;
		var tickChanged = (this.lastTick != curTick);
		this.lastTick = curTick;
		return tickChanged;
	};

	behinstProto.getMovingAngle = function (ret) {
		if (this.isTickChanged()) {
			var dx = this.inst.x - this.movingAngleData["x"];
			var dy = this.inst.y - this.movingAngleData["y"];
			if ((dx != 0) || (dy != 0))
				this.movingAngleData["a"] = cr.to_clamped_degrees(Math.atan2(dy, dx));
		}
		return this.movingAngleData["a"];
	};

	function clone(obj) {
		if (null == obj || "object" != typeof obj)
			return obj;
		var result = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr))
				result[attr] = obj[attr];
		}
		return result;
	};

	behinstProto.saveToJSON = function () {
		return {
			"en": this.enabled,
			"v": clone(this.moveParams),
			"t": clone(this.target),
			"is_m": this.isMoving,
			"c_spd": this.currentSpeed,
			"rd": this.remainDistance,
			"pp": clone(this.prePosition),
			"ma": clone(this.movingAngleData),
			"ms": clone(this.movingAngleStartData),
			"lt": this.lastTick,
		};
	};

	behinstProto.loadFromJSON = function (o) {
		this.enabled = o["en"];
		this.moveParams = o["v"];
		this.target = o["t"];
		this.isMoving = o["is_m"];
		this.currentSpeed = o["c_spd"];
		this.remainDistance = o["rd"];
		this.prePosition = o["pp"];
		this.movingAngleData = o["ma"];
		this.movingAngleStartData = o["ms"];
		this.lastTick = o["lt"];
	};

	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections) {
		propsections.push({
			"title": this.type.name,
			"properties": [
				{ "name": "Activated", "value": this.enabled },
				{ "name": "Is moving", "value": this.isMoving },
				{ "name": "Target X", "value": this.target["x"] },
				{ "name": "Target Y", "value": this.target["y"] },
				{ "name": "Current speed", "value": this.currentSpeed },
				{ "name": "Remaining distance", "value": this.remainDistance },
			]
		});
	};

	behinstProto.onDebugValueEdited = function (header, name, value) {
		var a, s;

		switch (name) {
			case "Target X": this.target["x"] = value; break;
			case "Target Y": this.target["y"] = value; break;
			case "Current speed": this.currentSpeed = value; break;
			case "Remaining distance": this.remainDistance = value; break;
		}
	};
	/**END-PREVIEWONLY**/
	//////////////////////////////////////
	// Conditions
	function Cnds() { };
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnHitTarget = function () {
		return (this.isMyCall);
	};

	Cnds.prototype.CompareSpeed = function (cmp, s) {
		return cr.do_cmp(this.currentSpeed, cmp, s);
	};

	Cnds.prototype.OnMoving = function ()  // deprecated
	{
		return false;
	};

	Cnds.prototype.IsMoving = function () {
		return (this.enabled && this.isMoving);
	};

	Cnds.prototype.CompareMovingAngle = function (cmp, s) {
		var angle = this.getMovingAngle();
		if (angle != (-1))
			return cr.do_cmp(this.getMovingAngle(), cmp, s);
		else
			return false;
	};

	Cnds.prototype.OnSolidStop = function () {
		return this.isMyCall;
	};
	//////////////////////////////////////
	// Actions
	function Acts() { };
	behaviorProto.acts = new Acts();

	Acts.prototype.SetEnabled = function (en) {
		this.enabled = (en === 1);
	};

	Acts.prototype.SetMaxSpeed = function (s) {
		this.moveParams["max"] = s;
		this.setCurrentSpeed(null);
	};

	Acts.prototype.SetAcceleration = function (a) {
		this.moveParams["acc"] = a;
		this.setCurrentSpeed(null);
	};

	Acts.prototype.SetDeceleration = function (a) {
		this.moveParams["dec"] = a;
	};

	Acts.prototype.SetTargetPos = function (x, y) {
		this.setTargetPos(x, y)
	};

	Acts.prototype.SetCurrentSpeed = function (s) {
		this.setCurrentSpeed(s);
	};

	Acts.prototype.SetTargetPosOnObject = function (objtype) {
		if (!objtype)
			return;
		var inst = objtype.getFirstPicked();
		if (inst != null)
			this.setTargetPos(inst.x, inst.y);
	};

	Acts.prototype.SetTargetPosByDeltaXY = function (dx, dy) {
		this.setTargetPos(this.inst.x + dx, this.inst.y + dy);
	};

	Acts.prototype.SetTargetPosByDistanceAngle = function (distance, angle) {
		var a = cr.to_clamped_radians(angle);
		var dx = distance * Math.cos(a);
		var dy = distance * Math.sin(a);
		this.setTargetPos(this.inst.x + dx, this.inst.y + dy);
	};

	Acts.prototype.Stop = function () {
		this.isMoving = false;
	};

	Acts.prototype.SetTargetPosOnUID = function (uid) {
		var inst = this.runtime.getObjectByUID(uid);
		if (inst != null)
			this.setTargetPos(inst.x, inst.y);
	};

	Acts.prototype.SetStopBySolid = function (en) {
		this.soildStopEnable = (en === 1);
	};
	//////////////////////////////////////
	// Expressions
	function Exps() { };
	behaviorProto.exps = new Exps();

	Exps.prototype.Activated = function (ret) {
		ret.set_int((this.enabled) ? 1 : 0);
	};

	Exps.prototype.Speed = function (ret) {
		ret.set_float(this.currentSpeed);
	};

	Exps.prototype.MaxSpeed = function (ret) {
		ret.set_float(this.moveParams["max"]);
	};

	Exps.prototype.Acc = function (ret) {
		ret.set_float(this.moveParams["acc"]);
	};

	Exps.prototype.Dec = function (ret) {
		ret.set_float(this.moveParams["dec"]);
	};

	Exps.prototype.TargetX = function (ret) {
		ret.set_float(this.target["x"]);
	};

	Exps.prototype.TargetY = function (ret) {
		ret.set_float(this.target["y"]);
	};

	Exps.prototype.MovingAngle = function (ret) {
		ret.set_float(this.getMovingAngle());
	};

	Exps.prototype.MovingAngleStart = function (ret) {
		ret.set_float(this.movingAngleStartData["a"]);
	};

}());