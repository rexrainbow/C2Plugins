// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_LJ_potential = function (runtime) {
	this.runtime = runtime;
	this.sources = {};
};

cr.behaviors.Rex_LJ_potential.uid2behaviorInst = {};

(function () {
	function GetThisBehavior(inst) {
		var i, len;
		for (i = 0, len = inst.behavior_insts.length; i < len; i++) {
			if (inst.behavior_insts[i] instanceof behaviorProto.Instance)
				return inst.behavior_insts[i];
		}

		return null;
	};

	var behaviorProto = cr.behaviors.Rex_LJ_potential.prototype;

	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function () {};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;
		this.sources = this.behavior.sources;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function () {
		this.sourceTag = this.properties[1];
		this.previousSourceTag = null;
		this.targetTag = this.properties[8];
		this.setSource((this.properties[0] == 1));
		if (!this.recycled) {
			this.LJPotentialParams = {};
		}
		this.LJPotentialParams["A"] = this.properties[2];
		this.LJPotentialParams["n"] = this.properties[3];
		this.LJPotentialParams["B"] = this.properties[4];
		this.LJPotentialParams["m"] = this.properties[5];

		this.setTarget((this.properties[7] == 1));
		this.setRange(this.properties[6]);

		this.hasBeenAttracted = false;
		this.hasAttracting = false;
		this.attractingSourceUID = (-1);
		this.attractedTargetUID = (-1)

		if (!this.recycled) {
			this.outputForce = {};
		}
		this.outputForce["x"] = 0;
		this.outputForce["y"] = 0;

		if (!this.recycled) {
			this.previousSources = {};
			this.previousTargets = {};
			this.currentSources = {};
			this.currentTargets = {};
		}
	};

	behinstProto.onDestroy = function () {
		this.removeSource();
		var uid, has_inst = false;
		for (uid in this.sources[this.sourceTag]) {
			has_inst = true;
			break;
		}
		if (!has_inst)
			delete this.sources[this.sourceTag];

		cleanTable(this.previousSources);
		cleanTable(this.previousTargets);
		cleanTable(this.currentSources);
		cleanTable(this.currentTargets);

		var uid2behaviorInst = cr.behaviors.Rex_LJ_potential.uid2behaviorInst;
		if (uid2behaviorInst.hasOwnProperty(this.inst.uid))
			delete uid2behaviorInst[this.inst.uid];
	};

	behinstProto.appendSource = function () {
		if (this.previousSourceTag == this.sourceTag)
			return;

		var uid = this.inst.uid;
		if ((this.previousSourceTag != null) && (this.sources.hasOwnProperty(this.previousSourceTag))) {
			var sources = this.sources[this.previousSourceTag];
			if (uid in sources)
				delete sources[uid];
		}
		if (!(this.sources.hasOwnProperty(this.sourceTag)))
			this.sources[this.sourceTag] = {};
		this.sources[this.sourceTag][uid] = this;
		this.previousSourceTag = this.sourceTag;
	};

	behinstProto.removeSource = function () {
		var uid = this.inst.uid;
		if (this.sources.hasOwnProperty(this.sourceTag)) {
			var sources = this.sources[this.sourceTag];
			if (uid in sources)
				delete sources[uid];
		}
		this.previousSourceTag = null;
	};

	behinstProto.setSource = function (isSource) {
		this.isSource = isSource;
		if (isSource)
			this.appendSource();
		else
			this.removeSource();

	};
	behinstProto.setTarget = function (isTarget) {
		this.isTarget = isTarget;
	};
	behinstProto.setRange = function (range) {
		this.sensitivityRange = range;
		this.sensitivityRangePOW2 = range * range;
	};

	behinstProto.tick = function () {};

	behinstProto.attractedBySources = function () {
		if (!this.isTarget)
			return;

		this.outputForce["x"] = 0;
		this.outputForce["y"] = 0;

		this.hasBeenAttracted = false;
		if (!(this.targetTag in this.sources))
			return;

		var sources = this.sources[this.targetTag];
		var myUID = this.inst.uid;
		var uid, behaviorInstB, instB;
		this.hasBeenAttracted = false;
		this.hasAttracting = false;
		for (uid in sources) {
			behaviorInstB = sources[uid];
			instB = behaviorInstB.inst;

			//We do not want an object to be exerting a gravitational force on itself
			if (myUID === instB.uid) {
				behaviorInstB.hasAttracting = false;
				continue;
			}

			if (!this.isInRange(instB, behaviorInstB.sensitivityRangePOW2)) {
				behaviorInstB.hasAttracting = false;
				continue;
			}

			this.hasBeenAttracted = true;
			behaviorInstB.hasAttracting = true;
			this.accumulateForce(behaviorInstB);
			this.attractingTarget(behaviorInstB, myUID);
			this.attractedBySource(this, uid);
		}

		this.attractedEnd();
	};

	behinstProto.attractedEnd = function () {
		this.attractingTargetEnd();
		this.attractedBySourceEnd();

		copyTable(this.previousSources, this.currentSources);
		cleanTable(this.currentSources);
		copyTable(this.previousTargets, this.currentTargets);
		cleanTable(this.currentTargets);
	};

	behinstProto.attractingTarget = function (behaviorInstB, targetUID) {
		behaviorInstB.attractedTargetUID = parseInt(targetUID);
		var previousTargets = behaviorInstB.previousTargets;
		if (!(targetUID in behaviorInstB.previousTargets))
			this.runtime.trigger(cr.behaviors.Rex_LJ_potential.prototype.cnds.BeginAttracting, behaviorInstB.inst);
		behaviorInstB.currentTargets[targetUID] = true;
	};

	behinstProto.attractedBySource = function (targetInst, sourceUID) {
		this.attractingSourceUID = parseInt(sourceUID);
		var previousSources = targetInst.previousSources;
		if (!(sourceUID in targetInst.previousSources))
			this.runtime.trigger(cr.behaviors.Rex_LJ_potential.prototype.cnds.BeginAttracted, targetInst.inst);
		targetInst.currentSources[sourceUID] = true;
	};

	behinstProto.attractingTargetEnd = function () {
		var uid;
		for (uid in this.previousTargets) {
			if (uid in this.currentTargets)
				continue;
			this.attractedTargetUID = parseInt(uid);
			this.runtime.trigger(cr.behaviors.Rex_LJ_potential.prototype.cnds.EndAttracting, this.inst);
		}
	};

	behinstProto.attractedBySourceEnd = function () {
		var uid, behaviorInstB;
		for (uid in this.previousSources) {
			if (uid in this.currentSources)
				continue;
			this.attractingSourceUID = parseInt(uid);
			this.runtime.trigger(cr.behaviors.Rex_LJ_potential.prototype.cnds.EndAttracted, this.inst);
		}
	};

	behinstProto.isInRange = function (instB, sensitivityRangePOW2) {
		if (sensitivityRangePOW2 == 0)
			return true;

		var instA = this.inst;
		var dx = instB.x - instA.x;
		var dy = instB.y - instA.y;
		var distancePOW2 = (dx * dx) + (dy * dy);
		return (distancePOW2 <= sensitivityRangePOW2);
	};

	behinstProto.getThisBehaviorInst = function (inst) {
		var uid = inst.uid;
		var uid2behaviorInst = cr.behaviors.Rex_LJ_potential.uid2behaviorInst;
		if (uid2behaviorInst.hasOwnProperty(uid))
			return uid2behaviorInst[uid];

		var behaviorInst = GetThisBehavior(inst);
		if (behaviorInst) {
			uid2behaviorInst[uid] = behaviorInst;
		}
		return behaviorInst;
	};

	// LJ potential
	behinstProto.accumulateForce = function (sourceBehaviorInst) {
		var dx = sourceBehaviorInst.inst.x - this.inst.x;
		var dy = sourceBehaviorInst.inst.y - this.inst.y;
		// get force
		var params = sourceBehaviorInst.LJPotentialParams;
		var fA = getTermValue(params["A"], params["n"], dx, dy);
		var fB = getTermValue(params["B"], params["m"], dx, dy);
		var U = fA - fB;
		// accumulate force
		var a = Math.atan2(dy, dx);
		this.outputForce["x"] += U * Math.cos(a);
		this.outputForce["y"] += U * Math.sin(a);
	};

	var getTermValue = function (A, n, dx, dy) {
		var val;
		if (A == 0)
			val = 0;
		else if (n === 0)
			val = A;
		else {
			var r = Math.sqrt((dx * dx) + (dy * dy));
			switch (n) {
				case 1:
					val = A / r;
					break;
				case 2:
					val = A / (r * r);
					break;
				case 3:
					val = A / (r * r * r);
					break;
				default:
					val = A / Math.pow(r, n);
					break;
			}
		}
		return val;
	};

	var cleanTable = function (table) {
		var key;
		for (key in table)
			delete table[key];
	};
	var copyTable = function (target, source) {
		cleanTable(target);
		var key;
		for (key in source)
			target[key] = source[key];
	};

	behinstProto.saveToJSON = function () {
		return {
			"st": this.sourceTag,
			"pst": this.previousSourceTag,
			"tt": this.targetTag,
			"is": this.isSource,
			"it": this.isTarget,
			"LJparams": this.LJPotentialParams,
			"sr": this.sensitivityRange,
			"of": this.outputForce,
		};
	};

	behinstProto.loadFromJSON = function (o) {
		this.sourceTag = o["st"];
		this.previousSourceTag = o["pst"];
		this.targetTag = o["tt"];
		this.isSource = o["is"];
		this.setSource(this.isSource);
		this.isTarget = o["it"];
		this.setTarget(this.isTarget);
		this.LJPotentialParams = o["LJparams"];
		this.sensitivityRange = o["sr"];
		this.setRange(this.sensitivityRange);
		this.outputForce = o["of"];

		var uid2behaviorInst = cr.behaviors.Rex_LJ_potential.uid2behaviorInst;
		for (var uid in uid2behaviorInst)
			delete uid2behaviorInst[uid];
	};

	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections) {
		var params = this.LJPotentialParams;

		propsections.push({
			"title": this.type.name,
			"properties": [{
					"name": "A",
					"value": params["A"]
				},
				{
					"name": "n",
					"value": params["n"]
				},
				{
					"name": "B",
					"value": params["B"]
				},
				{
					"name": "m",
					"value": params["m"]
				},
			]
		});
	};

	behinstProto.onDebugValueEdited = function (header, name, value) {
		switch (name) {
			case "A":
				this.LJPotentialParams["A"] = value;
				break;
			case "n":
				this.LJPotentialParams["n"] = value;
				break;
			case "B":
				this.LJPotentialParams["B"] = value;
				break;
			case "m":
				this.LJPotentialParams["m"] = value;
				break;
		}
	};
	/**END-PREVIEWONLY**/
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.HasBeenAttracted = function () {
		return this.hasBeenAttracted;
	};

	Cnds.prototype.BeginAttracted = function () {
		return true;
	};

	Cnds.prototype.BeginAttracting = function () {
		return true;
	};

	Cnds.prototype.EndAttracted = function () {
		return true;
	};

	Cnds.prototype.EndAttracting = function () {
		return true;
	};

	Cnds.prototype.HasAttracting = function () {
		return this.hasAttracting;
	};

	Cnds.prototype.HasForce = function () {
		return (this.outputForce["x"] != 0) || (this.outputForce["y"] != 0);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetSourceActivated = function (s) {
		this.setSource((s == 1));
	};

	Acts.prototype.SetTargetActivated = function (s) {
		this.setTarget((s == 1));
	};

	Acts.prototype.SetRange = function (range) {
		this.setRange(range);
	};

	Acts.prototype.SetSourceTag = function (tag) {
		this.sourceTag = tag;
		this.appendSource();
	};

	Acts.prototype.SetLJParam = function (i, value) {
		var params = this.LJPotentialParams;
		switch (i) {
			case 0:
				params["A"] = value;
				break;
			case 1:
				params["n"] = value;
				break;
			case 2:
				params["B"] = value;
				break;
			case 3:
				params["m"] = value;
				break;
		}
	};
	Acts.prototype.SetTargetTag = function (tag) {
		this.targetTag = tag;
	};

	Acts.prototype.UpdateForce = function () {
		this.attractedBySources();
	};

	Acts.prototype.CleanForce = function () {
		this.outputForce["x"] = 0;
		this.outputForce["y"] = 0;
		this.hasBeenAttracted = false;
	};

	Acts.prototype.AttractedBySource = function (objtype) {
		if (!objtype)
			return;

		var insts = objtype.getCurrentSol().getObjects();
		var i, cnt = insts.length,
			inst, behaviorInst;
		var myUID = this.inst.uid;
		for (i = 0; i < cnt; i++) {
			inst = insts[i];

			behaviorInst = this.getThisBehaviorInst(inst);
			if (behaviorInst == null)
				continue;

			if (myUID === inst.uid) {
				behaviorInst.hasAttracting = false;
				continue;
			}

			if (!this.isInRange(inst, behaviorInst.sensitivityRangePOW2)) {
				behaviorInst.hasAttracting = false;
				continue;
			}

			this.hasBeenAttracted = true;
			behaviorInst.hasAttracting = true;
			this.accumulateForce(behaviorInst);
		}
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.IsSource = function (ret) {
		ret.set_int((this.isSource) ? 1 : 0);
	};

	Exps.prototype.IsTarget = function (ret) {
		ret.set_int((this.isTarget) ? 1 : 0);
	};

	Exps.prototype.Range = function (ret) {
		ret.set_float(this.sensitivityRange);
	};
	Exps.prototype.SourceUID = function (ret) {
		ret.set_int(this.attractingSourceUID);
	};
	Exps.prototype.TargetUID = function (ret) {
		ret.set_int(this.attractedTargetUID);
	};
	Exps.prototype.SourceTag = function (ret) {
		ret.set_string(this.sourceTag);
	};
	Exps.prototype.TargetTag = function (ret) {
		ret.set_string(this.targetTag);
	};

	Exps.prototype.ForceAngle = function (ret) {
		var dx = this.outputForce["x"];
		var dy = this.outputForce["y"];
		var a = Math.atan2(dy, dx);
		ret.set_float(cr.to_clamped_degrees(a));
	};
	Exps.prototype.ForceMagnitude = function (ret) {
		var dx = this.outputForce["x"];
		var dy = this.outputForce["y"];
		var m;
		if ((dx != 0) && (dy != 0))
			m = Math.sqrt((dx * dx) + (dy * dy));
		else
			m = 0;
		ret.set_float(m);
	};
	Exps.prototype.ForceDx = function (ret) {
		ret.set_float(this.outputForce["x"]);
	};
	Exps.prototype.ForceDy = function (ret) {
		ret.set_float(this.outputForce["y"]);
	};

	Exps.prototype.A = function (ret) {
		ret.set_float(this.LJPotentialParams["A"]);
	};

	Exps.prototype.n = function (ret) {
		ret.set_float(this.LJPotentialParams["n"]);
	};

	Exps.prototype.B = function (ret) {
		ret.set_float(this.LJPotentialParams["B"]);
	};

	Exps.prototype.m = function (ret) {
		ret.set_float(this.LJPotentialParams["m"]);
	};
}());