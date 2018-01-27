// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_text_resize = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var behaviorProto = cr.behaviors.Rex_text_resize.prototype;

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
		this.isAutoResize = (this.properties[0] === 1);
		this.minWidth = this.properties[1];
		this.minHeight = this.properties[2];

		this.maxWidth = this.inst.width;
		this.maxHeight = this.inst.height;
		this.isResizeNow = false;
		this.backgroundObjects = {};
		this.preWidth = this.inst.width;
		this.preHeight = this.inst.height;
		this.bgInstsSave = null;

		this.textObjType = this.getTextObjType();
		this.FnGetTextHeight = this.getFnGetTextHeight();
		this.FnGetTextWidth = this.getFnGetTextWidth();

		// Need to know if pinned object gets destroyed
		if (!this.recycled) {
			this.myDestroyCallback = (function (self) {
				return function (inst) {
					self.onInstanceDestroyed(inst);
				};
			})(this);
		}
		this.runtime.addDestroyCallback(this.myDestroyCallback);
	};

	behinstProto.onInstanceDestroyed = function (inst) {
		var uid = inst.uid;
		if (this.backgroundObjects.hasOwnProperty(uid))
			delete this.backgroundObjects[uid];
	};

	behinstProto.onDestroy = function () {
		var uid;
		for (uid in this.backgroundObjects)
			delete this.backgroundObjects[uid];

		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};

	behinstProto.tick = function () {
	};

	behinstProto.tick2 = function () {
		if (!this.isAutoResize)
			return;			

		if (this.isTextChanged()) {
			this.resize();
		}
	};

	behinstProto.forceDrawing = function () {
		var inst = this.inst;
		// render text
		var ctx = (this.runtime.enableWebGL) ?
			this.getWebglCtx() : this.runtime.ctx;

		// use the max width to render text
		inst.width = this.maxWidth;
		inst.set_bbox_changed();			
		inst.draw(ctx);

		// draw text at normal render stage
		inst.text_changed = true;		
		inst.runtime.redraw = true;
	};

	behinstProto.getWebglCtx = function () {
		var inst = this.inst;
		var ctx = inst.myctx;
		if (!ctx) {
			inst.mycanvas = document.createElement("canvas");
			var scaledwidth = Math.ceil(inst.layer.getScale() * inst.width);
			var scaledheight = Math.ceil(inst.layer.getAngle() * inst.height);
			inst.mycanvas.width = scaledwidth;
			inst.mycanvas.height = scaledheight;
			inst.lastwidth = scaledwidth;
			inst.lastheight = scaledheight;
			inst.myctx = inst.mycanvas.getContext("2d");
			ctx = inst.myctx;
		}
		return ctx;
	};


	behinstProto.resize = function () {
		this.forceDrawing();

		var isResized = this.resizeMyself();

		if (isResized) {
			this.resizeBackground();
			this.saveCurrentSize();
			this.runtime.trigger(cr.behaviors.Rex_text_resize.prototype.cnds.OnSizeChanged, this.inst);
		}
	};

	behinstProto.resizeMyself = function () {
		var newWidth = this.getTextWidth() + 1;
		newWidth = cr.clamp(newWidth, this.minWidth, this.maxWidth);

		var newHeight = this.getTextHeight() + 1;
		if (newHeight < this.minHeight)
			newHeight = this.minHeight;

		var inst = this.inst,
			isResized = false;
		if ((newWidth !== inst.width) || (newHeight !== inst.height)) {
			this.setInstSize(newWidth, newHeight);
			isResized = true;
		}

		return isResized;
	};

	var TYPE_NONE = 0;
	var TYPE_TEXT = 1;
	var TYPE_SPRITEFONT2 = 2;
	var TYPE_TEXTBOX = 3;
	var TYPE_SPRITEFONTPLUS = 4;
	var TYPE_REX_TAGTEXT = 10;
	var TYPE_REX_BBCODETEXT = 11;
	behinstProto.getTextObjType = function () {
		var textObjType;
		if (cr.plugins_.Text &&
			(this.inst instanceof cr.plugins_.Text.prototype.Instance))
			textObjType = TYPE_TEXT;
		else if (cr.plugins_.Spritefont2 &&
			(this.inst instanceof cr.plugins_.Spritefont2.prototype.Instance))
			textObjType = TYPE_SPRITEFONT2;
		else if (cr.plugins_.rex_TagText &&
			(this.inst instanceof cr.plugins_.rex_TagText.prototype.Instance))
			textObjType = TYPE_REX_TAGTEXT;
		else if (cr.plugins_.rex_bbcodeText &&
			(this.inst instanceof cr.plugins_.rex_bbcodeText.prototype.Instance))
			textObjType = TYPE_REX_BBCODETEXT;
		else if (cr.plugins_.SpriteFontPlus &&
			(this.inst instanceof cr.plugins_.SpriteFontPlus.prototype.Instance))
			textObjType = TYPE_SPRITEFONTPLUS;
		else
			textObjType = TYPE_NONE;
		return textObjType;
	};

	behinstProto.setInstSize = function (width, height) {
		var inst = this.inst;
		inst.width = width;
		inst.height = height;
		inst.set_bbox_changed();

		// prevent wrap text again
		switch (this.textObjType) {
			case TYPE_TEXT:
				inst.lastwrapwidth = width;
				break;
			case TYPE_SPRITEFONT2:
				inst.lastwrapwidth = width;
				break;
			case TYPE_REX_TAGTEXT:
				inst.lastwrapwidth = width;
				break;
			case TYPE_REX_BBCODETEXT:
				inst.lastwrapwidth = width;
				break;
		}
	}

	behinstProto.resizeBackground = function () {
		var myWidth = this.inst.width;
		var myHeight = this.inst.height;

		var dw = this.inst.width - this.maxWidth;
		var dh = this.inst.height - this.maxHeight;
		var w, h;

		var uid, bgObj, bgInst, resizeMode;
		for (uid in this.backgroundObjects) {
			bgObj = this.backgroundObjects[uid];
			bgInst = bgObj["inst"];
			resizeMode = bgObj["rm"];

			w = bgObj["maxw"] + dw;
			h = bgObj["maxh"] + dh;
			if (resizeMode === 0) {
				if ((bgInst.width !== w) || (bgInst.height !== h)) {
					bgInst.height = h;
					bgInst.width = w;
					bgInst.set_bbox_changed();
				}
			} else if (resizeMode === 1) {
				if (bgInst.height !== h) {
					bgInst.height = h;
					bgInst.set_bbox_changed();
				}
			}
		}
	};

	behinstProto.saveCurrentSize = function () {
		this.preWidth = this.inst.width;
		this.preHeight = this.inst.height;
	};

	behinstProto.getFnGetTextHeight = function () {
		switch (this.textObjType) {
			case TYPE_TEXT:
				return cr.plugins_.Text.prototype.exps.TextHeight;
			case TYPE_SPRITEFONT2:
				return cr.plugins_.Spritefont2.prototype.exps.TextHeight;
			case TYPE_REX_TAGTEXT:
				return cr.plugins_.rex_TagText.prototype.exps.TextHeight;
			case TYPE_REX_BBCODETEXT:
				return cr.plugins_.rex_bbcodeText.prototype.exps.TextHeight;
		}
	};

	behinstProto.getFnGetTextWidth = function () {
		switch (this.textObjType) {
			case TYPE_TEXT:
				return cr.plugins_.Text.prototype.exps.TextWidth;
			case TYPE_SPRITEFONT2:
				return cr.plugins_.Spritefont2.prototype.exps.TextWidth;
			case TYPE_REX_TAGTEXT:
				return cr.plugins_.rex_TagText.prototype.exps.TextWidth;
			case TYPE_REX_BBCODETEXT:
				return cr.plugins_.rex_bbcodeText.prototype.exps.TextWidth;
		}
	};

	var fake_ret = {
		value: 0,
		set_any: function (value) {
			this.value = value;
		},
		set_int: function (value) {
			this.value = value;
		},
		set_float: function (value) {
			this.value = value;
		},
		set_string: function (value) {
			this.value = value;
		},
	};

	behinstProto.getTextHeight = function () {
		this.FnGetTextHeight.call(this.inst, fake_ret);
		return fake_ret.value;
	};

	behinstProto.getTextWidth = function () {
		this.FnGetTextWidth.call(this.inst, fake_ret);
		return fake_ret.value;
	};

	behinstProto.isTextChanged = function () {
		switch (this.textObjType) {
			case TYPE_TEXT:
				return this.inst.text_changed;
			case TYPE_SPRITEFONT2:
				return this.inst.text_changed;
			case TYPE_REX_TAGTEXT:
				return this.inst.text_changed;
			case TYPE_REX_BBCODETEXT:
				return this.inst.text_changed;
		}
	};

	behinstProto.saveToJSON = function () {
		var uid, bgInstsSave = {},
			bgInfo;
		for (uid in this.backgroundObjects) {
			bgInfo = this.backgroundObjects[uid];
			bgInstsSave[uid] = {
				"rm": bgInfo["rm"],
				"maxw": bgInfo["maxw"],
				"maxh": bgInfo["maxh"],
			};
		}

		return {
			"minw": this.minWidth,
			"minh": this.minHeight,
			"maxw": this.maxWidth,
			"maxh": this.maxHeight,
			"pw": this.preWidth,
			"ph": this.preHeight,
			"bg": bgInstsSave,
		};
	};

	behinstProto.loadFromJSON = function (o) {
		this.minWidth = o["minw"];
		this.minHeight = o["minh"];
		this.maxWidth = o["maxw"];
		this.maxHeight = o["maxh"];
		this.preWidth = o["pw"];
		this.preHeight = o["ph"];
		this.bgInstsSave = o["bg"];
	};

	behinstProto.afterLoad = function () {
		var uid;
		for (uid in this.backgroundObjects)
			delete this.backgroundObjects[uid];

		var bgInst, rm;
		for (uid in this.bgInstsSave) {
			uid = parseInt(uid);
			bgInst = this.runtime.getObjectByUID(uid);
			assert2(bgInst, "Failed to find background object by UID");

			this.backgroundObjects[uid] = this.bgInstsSave[uid];
			this.backgroundObjects[uid]["inst"] = bgInst;
		}

		this.bgInstsSave = null;
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnSizeChanged = function () {
		return true;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.Resize = function () {
		this.resize();
	};

	Acts.prototype.SetMaxWidth = function (w) {
		this.maxWidth = w;
	};

	Acts.prototype.SetMinWidth = function (w) {
		this.minWidth = w;
	};

	Acts.prototype.SetMinHeight = function (h) {
		this.minHeight = h;
	};

	Acts.prototype.AddBackground = function (obj, resizeMode) {
		if (!obj)
			return;

		var inst = obj.getFirstPicked();

		if (!inst)
			return;

		var bgObj = {
			"inst": inst,
			"rm": resizeMode,
			"maxw": inst.width,
			"maxh": inst.height,
		};

		this.backgroundObjects[inst.uid] = bgObj;
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());