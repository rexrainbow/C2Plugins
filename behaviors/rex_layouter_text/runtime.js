// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_layouter_text = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var behaviorProto = cr.behaviors.Rex_layouter_text.prototype;

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
		this.content = "";
		this.charObjectSID = -1;
		this.char2frameindex = {};
		this.setChar2FrameIndex(this.properties[0]);

		this.spriteObjType = null;
		this.spriteIndex = 0; // temp var
	};

	behinstProto.setChar2FrameIndex = function (characters) {
		var c;
		for (c in this.char2frameindex)
			delete this.char2frameindex[c];
		var i, cnt = characters.length;
		for (i = 0; i < cnt; i++) {
			c = characters.charAt(i);
			this.char2frameindex[c] = i;
		}
	};
	behinstProto.tick = function () {};

	behinstProto.getCharObject = function () {
		if (this.spriteObjType == null)
			this.spriteObjType = this.runtime.getObjectTypeBySid(this.charObjectSID);
		return this.spriteObjType;
	};

	behinstProto.getSpriteInst = function () {
		var inst = null;
		var sprites = this.inst.sprites;
		var sprites_cnt = sprites.length;
		while (this.spriteIndex < sprites_cnt) {
			inst = this.runtime.getObjectByUID(sprites[this.spriteIndex]);
			this.spriteIndex += 1;
			if (inst instanceof cr.plugins_.Sprite.prototype.Instance)
				break;
			else
				inst = null;
		}
		return inst;
	};

	behinstProto.setText = function (text) {
		var objtype = this.getCharObject();
		if (!objtype)
			return;
		this.content = text;
		var set_frameindex = cr.plugins_.Sprite.prototype.acts.SetAnimFrame;
		var set_amin_speed = cr.plugins_.Sprite.prototype.acts.SetAnimSpeed;
		var layouter = this.inst;
		var sprites = layouter.sprites;
		var i, textLen = text.length;
		this.spriteIndex = 0;
		var inst, c, frameIndex;
		var tempInst = [];
		var mode = null; // 0: add, 1: remove
		for (i = 0; i < textLen; i++) {
			inst = this.getSpriteInst();
			if (inst == null) // create a sprite inst
			{
				inst = this.inst.createInstance(objtype, 0, 0);
				tempInst.push(inst);
				mode = 0;
			}

			c = text.charAt(i);
			frameIndex = this.char2frameindex[c];
			if (frameIndex == null)
				frameIndex = -1;
			if (inst.cur_frame != frameIndex)
				set_frameindex.call(inst, frameIndex);
			if (inst.cur_anim_speed != 0)
				set_amin_speed.call(inst, 0);
		}
		if (mode == null) {
			inst = this.getSpriteInst();
			while (inst != null) {
				tempInst.push(inst);
				inst = this.getSpriteInst();
			}
			if (tempInst.length > 0)
				mode = 1;
		}
		if (mode == 0)
			this.inst.addInsts(tempInst);
		else if (mode == 1)
			this.inst.destroy_insts(tempInst);
	};
	behinstProto.saveToJSON = function () {
		return {
			"t": this.content,
			"csid": this.charObjectSID,
			"c2fi": this.char2frameindex,
		};
	};

	behinstProto.loadFromJSON = function (o) {
		this.content = o["t"];
		this.charObjectSID = o["csid"];
		this.char2frameindex = o["c2fi"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetCharacterObject = function (objtype) {
		if (!objtype)
			return;
		assert2(cr.plugins_.Sprite, "Layouter text: you should assign a sprite objct for character.");
		this.spriteObjType = objtype;
		this.charObjectSID = objtype.sid;
	};

	Acts.prototype.SetText = function (param) {
		if (cr.is_number(param) && param < 1e9)
			param = Math.round(param * 1e10) / 1e10; // round to nearest ten billionth - hides floating point errors

		var text_to_set = param.toString();
		if (this.content !== text_to_set)
			this.setText(text_to_set);
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.Value = function (ret) {
		ret.set_float(this.value);
	};
}());