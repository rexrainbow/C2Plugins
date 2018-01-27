// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_layouter_cyclic = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var behaviorProto = cr.behaviors.Rex_layouter_cyclic.prototype;

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
		this.shape = this.properties[0];
		this.mode = this.properties[1];
		this.startAngle = cr.to_clamped_radians(this.properties[2]); // in radians
		var rangeAngle = this.properties[3];
		this.is360Mode = (Math.abs(rangeAngle) == 360);
		this.rangeAngle = (this.is360Mode) ?
			(2 * Math.PI) : cr.to_clamped_radians(rangeAngle); // in radians

		this.deltaAngle = cr.to_clamped_radians(this.properties[4]); // in radians
		this.angleOffset = cr.to_clamped_radians(this.properties[5]); // in radians

		// implement handlers
		this.onAddInstances = this.onUpdate;
		this.onRemoveInstances = this.onUpdate;
	};

	behinstProto.tick = function () {};

	behinstProto.onUpdate = function () {
		var layouter = this.inst;
		var OX = layouter.getCenterX(layouter);
		var OY = layouter.getCenterY(layouter);
		var sprites = layouter.sprites;
		var i, cnt = sprites.length;

		if (this.mode == 0) // average mode
		{
			if (cnt == 1)
				this.deltaAngle = 0;
			else {
				if (this.is360Mode)
					this.deltaAngle = this.rangeAngle / cnt; // in radians
				else
					this.deltaAngle = this.rangeAngle / (cnt - 1); // in radians
			}
		} else // fix mode
			this.rangeAngle = this.deltaAngle * (cnt - 1); // in radians

		var params, angle_, x_, y_;
		var rW = this.getRadiusW();
		var rH = this.getRadiusH();
		var startAngle = this.startAngle; // in radians            
		for (i = 0; i < cnt; i++) {
			angle_ = startAngle + (this.deltaAngle * i); // in radians
			x_ = OX + (rW * Math.cos(angle_));
			y_ = OY + (rH * Math.sin(angle_));

			params = {
				x: x_,
				y: y_,
				angle: angle_, // in radians
			};
			params = this.getRotateParams(params);
			layouter.onLayoutInstance(sprites[i], params);
		}
	};

	behinstProto.getRotateParams = function (params) {
		var layouter = this.inst;

		if (layouter.angle === 0)
			return params;

		var new_angle = cr.angleTo(layouter.x, layouter.y, params.x, params.y) + layouter.angle;
		var d = cr.distanceTo(layouter.x, layouter.y, params.x, params.y);

		var newX = layouter.x + (d * Math.cos(new_angle));
		var newY = layouter.y + (d * Math.sin(new_angle));
		params.x = newX;
		params.y = newY;
		params.angle += layouter.angle;
		return params;
	};


	behinstProto.getRadiusW = function () {
		var r;
		if (this.shape === 0)
			r = Math.min(this.inst.width, this.inst.height) / 2;
		else
			r = this.inst.width / 2;

		return r;
	};

	behinstProto.getRadiusH = function () {
		var r;
		if (this.shape === 0)
			r = Math.min(this.inst.width, this.inst.height) / 2;
		else
			r = this.inst.height / 2;

		return r;
	};

	behinstProto.saveToJSON = function () {
		return {
			"m": this.mode,
			"sa": this.startAngle,
			"ra": this.rangeAngle,
			"da": this.deltaAngle,
			"aoff": this.angleOffset,
		};
	};

	behinstProto.loadFromJSON = function (o) {
		this.mode = o["m"];
		this.startAngle = o["sa"];
		this.rangeAngle = o["ra"]; // in degree
		this.deltaAngle = o["da"]; // in degree
		this.angleOffset = o["aoff"]; // in degree
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetMode = function (m) {
		this.mode = m;
	};

	Acts.prototype.SetStartAngle = function (a) {
		this.startAngle = cr.to_clamped_radians(a);
	};

	Acts.prototype.SetRangeAngle = function (a) {
		if (a > 360)
			a = 360;
		this.is360Mode = (Math.abs(a) == 360);
		this.rangeAngle = (this.is360Mode) ?
			(2 * Math.PI) : cr.to_clamped_radians(a); // in radians
	};
	Acts.prototype.SetDeltaAngle = function (a) {
		this.deltaAngle = cr.to_clamped_radians(a);
	};

	Acts.prototype.AddToStartAngle = function (a) {
		a += cr.to_clamped_degrees(this.startAngle);
		this.startAngle = cr.to_clamped_radians(a);
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.StartAngle = function (ret) {
		ret.set_float(cr.to_clamped_degrees(this.startAngle));
	};
}());