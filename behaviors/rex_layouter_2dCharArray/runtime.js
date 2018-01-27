// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_layouter_2dCharArray = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var behaviorProto = cr.behaviors.Rex_layouter_2dCharArray.prototype;

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
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function () {
		this.check_name = "LAYOUTER";
		this.cellWidth = this.properties[0];
		this.cellHeight = this.properties[1];
		this.mappedChar = "";
		this.mappedUID = 0;
		this.logicX = 0;
		this.logicY = 0;
		this.tempInsts = []; // temp list

		// implement handlers
		this.onAddInstances = this.nullFn;
		this.onRemoveInstances = this.nullFn;
	};

	behinstProto.tick = function () {};

	behinstProto.nullFn = function () {};

	behinstProto.mapContent = function (objType, _layer, s) {
		var layouter = this.inst;
		var ox = layouter.x;
		var oy = layouter.y;
		var lines = s.split("\n");
		var c, ci, c_cnt, l, li, l_cnt = lines.length;
		var px, py, inst, params;

		layouter.destoryAllPinInstances();
		var tempInsts = [];
		for (li = 0; li < l_cnt; li++) {
			l = lines[li];
			c_cnt = l.length;
			for (ci = 0; ci < c_cnt; ci++) {
				c = l.charAt(ci);
				px = ox + (ci * this.cellWidth);
				py = oy + (li * this.cellHeight);
				inst = layouter.createInstance(objType, px, py, _layer);
				if (inst == null)
					continue;
				this.mappedUID = inst.uid;
				this.logicX = ci;
				this.logicY = li;
				tempInsts.push(inst);
				this.mappedChar = c;
				params = {
					x: px,
					y: py
				};
				layouter.onLayoutInstance(inst, params);
				this.runtime.trigger(cr.behaviors.Rex_layouter_2dCharArray.prototype.cnds.OnEachChar, this.inst);
			}
		}
		layouter.addInsts(tempInsts, true);
	};

	behinstProto.saveToJSON = function () {
		return {
			"w": this.cellWidth,
			"h": this.cellHeight
		};
	};

	behinstProto.loadFromJSON = function (o) {
		this.cellWidth = o["w"];
		this.cellHeight = o["h"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnEachChar = function () {
		return true;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.MapContent = function (objType, _layer, s) {
		if (!objType)
			return;
		this.mapContent(objType, _layer, s);
	};

	Acts.prototype.SetCellWidth = function (w) {
		this.cellWidth = w;
	};

	Acts.prototype.SetCellHeight = function (h) {
		this.cellHeight = h;
	};

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.InstUID = function (ret) {
		ret.set_int(this.mappedUID);
	};

	Exps.prototype.Char = function (ret) {
		ret.set_string(this.mappedChar);
	};

	Exps.prototype.LX = function (ret) {
		ret.set_int(this.logicX);
	};

	Exps.prototype.LY = function (ret) {
		ret.set_int(this.logicY);
	};
}());