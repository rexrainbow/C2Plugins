// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Layouter = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var pluginProto = cr.plugins_.Rex_Layouter.prototype;

	pluginProto.onCreate = function () {
		pluginProto.acts.Destroy = function () {
			this.runtime.DestroyInstance(this);
			this.destoryAllPinInstances();
		};
	};
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function (plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function () {};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function (type) {
		this.type = type;
		this.runtime = type.runtime;
	};

	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function () {
		this.check_name = "LAYOUTER";
		this.pinUIDs = {};
		this.sprites = []; // uid
		this.removedUIDs = [];
		this.pinStatus = {};
		this.pinMode = this.properties[0];

		this.opactiySave = this.opacity;
		this.visibleSave = this.visible;

		// handlers for behaviors
		this.handlers = [];
		this.tempInsts = []; // temp list
		this.layoutInstParams = null;
		this.hasEventCall = false;
		this.getLayoutFn();

		this.runtime.tick2Me(this);
	};

	instanceProto.onDestroy = function () {
		//this.destoryAllPinInstances();
	};

	instanceProto.updateOpacity = function () {
		if (this.opactiySave == this.opacity)
			return;
		var i, cnt = this.sprites.length,
			inst;
		this.opacity = cr.clamp(this.opacity, 0, 1);
		for (i = 0; i < cnt; i++) {
			inst = this.uid2inst(this.sprites[i]);
			if (inst == null)
				continue;
			inst.opacity = this.opacity;
		}
		this.runtime.redraw = true;
		this.opactiySave = this.opacity;
	};

	instanceProto.updateVisible = function () {
		if (this.visibleSave == this.visible)
			return;
		var i, cnt = this.sprites.length,
			inst;
		for (i = 0; i < cnt; i++) {
			inst = this.uid2inst(this.sprites[i]);
			if (inst == null)
				continue;
			inst.visible = this.visible;
		}
		this.runtime.redraw = true;
		this.visibleSave = this.visible;
	};

	instanceProto.updatePositionAngle = function () {
		// pin	    
		if (this.pinMode == 0)
			return;

		var uid, status, pinInst, a, newX, newY, newAngle;
		for (uid in this.pinStatus) {
			pinInst = this.uid2inst(uid);
			if (pinInst == null)
				continue;
			status = this.pinStatus[uid];
			if ((this.pinMode == 1) || (this.pinMode == 2)) {
				a = this.angle + status["da"];
				newX = this.x + (status["dd"] * Math.cos(a));
				newY = this.y + (status["dd"] * Math.sin(a));
			}
			if ((this.pinMode == 1) || (this.pinMode == 3)) {
				newAngle = status["rda"] + this.angle;
			}
			if (((newX != null) && (newY != null)) &&
				((newX != pinInst.x) || (newY != pinInst.y))) {
				pinInst.x = newX;
				pinInst.y = newY;
				pinInst.set_bbox_changed();
			}
			if ((newAngle != null) && (newAngle != pinInst.angle)) {
				pinInst.angle = newAngle;
				pinInst.set_bbox_changed();
			}
		}
	};

	instanceProto.tick2 = function () {
		var i, cnt = this.sprites.length,
			inst;
		if (cnt == 0)
			return;
		this.updateOpacity();
		this.updateVisible();
		this.updatePositionAngle();
	};

	instanceProto.draw = function (ctx) {};

	instanceProto.drawGL = function (glw) {};

	instanceProto.addInsts = function (insts, skipLayoutFn) {
		var inst, i, cnt = insts.length;
		var isWorld = insts[0].type.plugin.is_world;

		// update uids, sprites
		for (i = 0; i < cnt; i++) {
			inst = insts[i];
			if (this.pinUIDs[inst.uid]) // is inside container
				continue;
			this.pinUIDs[inst.uid] = true;
			inst.extra["rex_glayouter_uid"] = this.uid;
			if (isWorld)
				this.sprites.push(inst.uid);
		}

		// layout instances
		if (!skipLayoutFn)
			this.runLayoutFn(insts, true);

		// pin instances
		if (isWorld && (this.pinMode != 0)) {
			for (i = 0; i < cnt; i++)
				this.pinInst(insts[i]);
		}
	};

	instanceProto.pinInst = function (inst) {
		if (this.pinStatus[inst.uid] == null)
			this.pinStatus[inst.uid] = {};

		var pinInfo = this.pinStatus[inst.uid];
		pinInfo["da"] = cr.angleTo(this.x, this.y, inst.x, inst.y) - this.angle;
		pinInfo["dd"] = cr.distanceTo(this.x, this.y, inst.x, inst.y);
		pinInfo["rda"] = inst.angle - this.angle;
	};

	instanceProto.createInstance = function (objtype, x, y, _layer, callback) {
		if (objtype == null)
			return;
		var layer = (_layer == null) ? this.layer : _layer;

		var inst = window.RexC2CreateObject.call(this, objtype, layer, x, y, callback);
		return inst;
	};


	instanceProto.removeUID = function (uid) {
		if (uid in this.pinUIDs)
			delete this.pinUIDs[uid];
		else
			return;

		if (uid in this.pinInst)
			delete this.pinInst[uid];
		cr.arrayFindRemove(this.sprites, uid);
	};

	instanceProto.removeUIDs = function (insts) {
		var i, cnt = insts.length;
		for (i = 0; i < cnt; i++) {
			this.removeUID(insts[i].uid);
		}
	};

	instanceProto.destroyInstances = function (insts) {
		var i,
			cnt = insts.length,
			inst,
			delInsts = [];

		for (i = 0; i < cnt; i++) {
			inst = insts[i];
			if (!(inst.uid in this.pinUIDs))
				continue;
			delInsts.push(inst);
			Object.getPrototypeOf(inst.type.plugin).acts.Destroy.call(inst);
			//this.runtime.DestroyInstance(inst);
			this.removeUID(inst.uid);
		}
		// layout instances
		this.runLayoutFn(delInsts, false);
	};

	instanceProto.uid2inst = function (uid, objtype) {
		if (uid == null)
			return null;
		var inst = this.runtime.getObjectByUID(uid);
		if (inst == null) {
			this.removeUID(uid);
			return null;
		}

		if ((objtype == null) || (inst.type == objtype))
			return inst;
		else if (objtype.is_family) {
			var families = inst.type.families;
			var cnt = families.length,
				i;
			for (i = 0; i < cnt; i++) {
				if (objtype == families[i])
					return inst;
			}
		}
		// objtype mismatch
		return null;
	};

	instanceProto.pickInstances = function (objtype) {
		var sol = objtype.getCurrentSol();
		sol.select_all = false;
		sol.instances.length = 0; // clear contents
		var uid, inst;
		for (uid in this.pinUIDs) {
			inst = this.uid2inst(uid, objtype)
			if (inst != null)
				sol.instances.push(inst);
		}
		return (sol.instances.length > 0);
	};

	var name2type = {}; // private global object
	instanceProto.pickAllInstances = function () {
		var uid, inst, objtype, sol;
		var uids = this.pinUIDs;
		cleanTable(name2type);
		var has_inst = false;
		for (uid in uids) {
			inst = this.uid2inst(uid);
			if (inst == null)
				continue;
			objtype = inst.type;
			sol = objtype.getCurrentSol();
			if (!(objtype.name in name2type)) {
				sol.select_all = false;
				sol.instances.length = 0;
				name2type[objtype.name] = objtype;
			}
			sol.instances.push(inst);
			has_inst = true;
		}
		var name;
		for (name in name2type)
			name2type[name].applySolToContainer();
		cleanTable(name2type);
		return has_inst;
	};

	instanceProto.destoryAllPinInstances = function () {
		var uid, inst;
		for (uid in this.pinUIDs) {
			inst = this.runtime.getObjectByUID(uid);
			if (inst != null) {
				Object.getPrototypeOf(inst.type.plugin).acts.Destroy.call(inst);
				//this.runtime.DestroyInstance(inst);       
			}
		}
	};

	instanceProto.removeInvalidInstances = function () {
		var uid, inst;
		this.removedUIDs.length = 0;
		for (uid in this.pinUIDs) {
			inst = this.runtime.getObjectByUID(uid);
			if (inst == null)
				this.removedUIDs.push(parseInt(uid));
		}
		var i, cnt = this.removedUIDs.length;
		for (i = 0; i < cnt; i++)
			this.removeUID(this.removedUIDs[i]);
	};

	instanceProto.getLayoutFn = function () {
		var behaviorInsts = this.behavior_insts;
		var cnt = behaviorInsts.length;
		var i, behaviorInst;
		for (i = 0; i < cnt; i++) {
			behaviorInst = behaviorInsts[i];
			if (behaviorInst.check_name == "LAYOUTER")
				this.handlers.push(behaviorInst);
		}
	};

	instanceProto.runLayoutFn = function (insts, isAddMode) {
		if (this.sprites.length == 0)
			return;

		var j, handlerCnt = this.handlers.length,
			cb;
		for (j = 0; j < handlerCnt; j++) {
			cb = (isAddMode) ? this.handlers[j].onAddInstances :
				this.handlers[j].onRemoveInstances;
			if (cb != null)
				cb.call(this.handlers[j], insts);
		}
	};

	instanceProto.onLayoutInstance = function (uid, params) {
		var inst;
		if (typeof (uid) == "number")
			inst = this.runtime.getObjectByUID(uid);
		else
			inst = uid;

		params.inst = inst;
		this.layoutInstParams = params;
		this.hasEventCall = false;
		this.runtime.trigger(cr.plugins_.Rex_Layouter.prototype.cnds.OnLayoutInst, this);
		if (!this.hasEventCall) {
			if (params.x != null)
				inst.x = params.x;
			if (params.y != null)
				inst.y = params.y;
			if (params.angle != null)
				inst.angle = params.angle;
			if (params.width != null)
				inst.width = params.width;
			if (params.height != null)
				inst.height = params.height;
			if (params.opacity != null)
				inst.opacity = params.opacity;
			if (params.visible != null)
				inst.visible = params.visible;
			inst.set_bbox_changed();
		}
		this.pinInst(inst);
		this.layoutInstParams = null;
	};

	instanceProto.getCenterX = function (inst) {
		if (inst == null)
			inst = this;
		inst.update_bbox();
		var bbox = inst.bbox;
		return (bbox.right + bbox.left) / 2;
	};

	instanceProto.getCenterY = function (inst) {
		if (inst == null)
			inst = this;
		inst.update_bbox();
		var bbox = inst.bbox;
		return (bbox.top + bbox.bottom) / 2;
	};

	var cleanTable = function (obj) {
		var k;
		for (k in obj)
			delete obj[k];
	};

	var isTableEmpty = function (obj) {
		var k;
		for (k in obj) {
			return false;
		}
		return true;
	};

	instanceProto.saveToJSON = function () {
		return {
			"uids": this.pinUIDs,
			"s": this.sprites,
			"ps": this.pinStatus,
		};
	};

	instanceProto.loadFromJSON = function (o) {
		this.pinUIDs = o["uids"];
		this.sprites = o["s"];
		this.pinStatus = o["ps"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnLayoutInst = function () {
		this.hasEventCall = true;
		return true;
	};

	Cnds.prototype.PickInsts = function (objtype) {
		if (!objtype)
			return;
		this.removeInvalidInstances();
		return this.pickInstances(objtype);
	};

	Cnds.prototype.PickLayouter = function (objtype) {
		if (!objtype)
			return;

		var insts = objtype.getCurrentSol().getObjects();
		var cnt = insts.length;
		if (cnt == 0)
			return false;
		var container_type = this.runtime.getCurrentCondition().type;
		var container_sol = container_type.getCurrentSol();
		container_sol.select_all = false;
		container_sol.instances.length = 0;
		var i, container_uid, container_inst;
		var uids = {};
		for (i = 0; i < cnt; i++) {
			container_uid = insts[i].extra["rex_glayouter_uid"];
			if (container_uid in uids)
				continue;
			container_inst = this.runtime.getObjectByUID(container_uid);
			if (container_inst == null)
				continue;
			container_sol.instances.push(container_inst);
			uids[container_uid] = true;
		}
		var current_event = this.runtime.getCurrentEventStack().current_event;
		this.runtime.pushCopySol(current_event.solModifiers);
		current_event.retrigger();
		this.runtime.popSol(current_event.solModifiers);
		return false;
	};

	Cnds.prototype.PickAllInsts = function () {
		this.removeInvalidInstances();
		return this.pickAllInstances();
	};


	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.AddInsts = function (objtype) {
		if (!objtype)
			return;

		this.removeInvalidInstances();
		var insts = objtype.getCurrentSol().getObjects();
		if (insts.length == 0)
			return;
		this.addInsts(insts);
	};

	Acts.prototype.PickInsts = function (objtype) {
		if (!objtype)
			return;

		this.removeInvalidInstances();
		this.pickInstances(objtype);
	};

	Acts.prototype.PickAllInsts = function () {
		this.removeInvalidInstances();
		this.pickAllInstances();
	};

	Acts.prototype.CreateInsts = function (objtype, x, y, _layer) {
		if (!objtype)
			return;

		var inst = this.createInstance(objtype, x, y, _layer);
		if (inst == null)
			return;

		this.removeInvalidInstances();
		this.addInsts([inst]);
	};

	Acts.prototype.RemoveInsts = function (objtype) {
		if (!objtype)
			return;

		this.removeInvalidInstances();
		var insts = objtype.getCurrentSol().getObjects();
		if (insts.length == 0)
			return;
		this.removeUIDs(insts);
	};

	Acts.prototype.ForceLayout = function () {
		this.removeInvalidInstances();
		this.runLayoutFn([], true);
	};

	Acts.prototype.RemoveAllInsts = function () {
		var uid;
		for (uid in this.pinUIDs) {
			delete this.pinUIDs[uid];
			if (uid in this.pinInst)
				delete this.pinInst[uid];
		}
		this.sprites.length = 0;
	};

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	pluginProto.exps = new Exps();

	Exps.prototype.InstUID = function (ret) {
		ret.set_int(this.layoutInstParams.inst.uid);
	};

	Exps.prototype.InstX = function (ret) {
		var val = this.layoutInstParams.x;
		if (val == null)
			val = this.layoutInstParams.inst.x;
		ret.set_float(val);
	};

	Exps.prototype.InstY = function (ret) {
		var val = this.layoutInstParams.y;
		if (val == null)
			val = this.layoutInstParams.inst.y;
		ret.set_float(val);
	};

	Exps.prototype.InstAngle = function (ret) {
		var val = this.layoutInstParams.angle;
		if (val == null)
			val = this.layoutInstParams.inst.angle;
		else
			val = cr.to_degrees(val);
		ret.set_float(val);
	};

	Exps.prototype.InstWidth = function (ret) {
		var val = this.layoutInstParams.width;
		if (val == null)
			val = this.layoutInstParams.inst.width;
		ret.set_float(val);
	};

	Exps.prototype.InstHeight = function (ret) {
		var val = this.layoutInstParams.height;
		if (val == null)
			val = this.layoutInstParams.inst.height;
		ret.set_float(val);
	};

	Exps.prototype.InstOpacity = function (ret) {
		var val = this.layoutInstParams.opacity;
		if (val == null)
			val = this.layoutInstParams.inst.opacity;
		ret.set_float(val);
	};

	Exps.prototype.InstVisible = function (ret) {
		var val = this.layoutInstParams.visible;
		if (val == null)
			val = this.layoutInstParams.inst.visible;
		ret.set_int(val);
	};

	Exps.prototype.SpritesCnt = function (ret) {
		ret.set_int(this.sprites.length);
	};
}());

(function () {
	// general CreateObject function which call a callback before "OnCreated" triggered
	if (window.RexC2CreateObject != null)
		return;

	// copy from system action: CreateObject
	var CreateObject = function (obj, layer, x, y, callback, ignore_picking) {
		if (!layer || !obj)
			return;

		var inst = this.runtime.createInstance(obj, layer, x, y);

		if (!inst)
			return;

		this.runtime.isInOnDestroy++;

		// call callback before "OnCreated" triggered
		if (callback)
			callback(inst);
		// call callback before "OnCreated" triggered

		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);

		if (inst.is_contained) {
			for (i = 0, len = inst.siblings.length; i < len; i++) {
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s);
			}
		}

		this.runtime.isInOnDestroy--;

		if (ignore_picking !== true) {
			// Pick just this instance
			var sol = obj.getCurrentSol();
			sol.select_all = false;
			sol.instances.length = 1;
			sol.instances[0] = inst;

			// Siblings aren't in instance lists yet, pick them manually
			if (inst.is_contained) {
				for (i = 0, len = inst.siblings.length; i < len; i++) {
					s = inst.siblings[i];
					sol = s.type.getCurrentSol();
					sol.select_all = false;
					sol.instances.length = 1;
					sol.instances[0] = s;
				}
			}
		}

		// add solModifiers
		//var current_event = this.runtime.getCurrentEventStack().current_event;
		//current_event.addSolModifier(obj);
		// add solModifiers

		return inst;
	};

	window.RexC2CreateObject = CreateObject;
}());