// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_text_typing = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var behaviorProto = cr.behaviors.Rex_text_typing.prototype;

	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function () {
		this.timeline = null;
		this.timelineUid = -1;    // for loading     
	};

	behtypeProto.getTimeline = function () {
		if (this.timeline != null)
			return this.timeline;

		assert2(cr.plugins_.Rex_TimeLine, "Text Typing behavior: Can not find timeline oject.");
		var plugins = this.runtime.types;
		var name, inst;
		for (name in plugins) {
			inst = plugins[name].instances[0];
			if (inst instanceof cr.plugins_.Rex_TimeLine.prototype.Instance) {
				this.timeline = inst;
				return this.timeline;
			}
		}
		assert2(this.timeline, "Text Typing behavior: Can not find timeline oject.");
		return null;
	};
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
		this.typeMode = this.properties[0];
		this.isLineBreak = (this.properties[1] === 1);
		this.typingTimer = null;
		this.typingSpeed = 0;
		this.typingIndex = 0;
		this.content = "";
		this.typingContent = null;
		this.rawTextLength = 0;
		this.timerSave = null;
		this.textType = this.getTextObjType();
		this.FnSetText = this.getFnSetText(this.textType);
	};

	var TYPE_NONE = 0;
	var TYPE_TEXT = 1;
	var TYPE_SPRITEFONT2 = 2;
	var TYPE_TEXTBOX = 3;
	var TYPE_SPRITEFONTPLUS = 4;
	var TYPE_REX_TAGTEXT = 10;
	var TYPE_REX_BBCODETEXT = 11;
	behinstProto.getTextObjType = function () {
		var textType;
		if (cr.plugins_.Text &&
			(this.inst instanceof cr.plugins_.Text.prototype.Instance))
			textType = TYPE_TEXT;
		else if (cr.plugins_.Spritefont2 &&
			(this.inst instanceof cr.plugins_.Spritefont2.prototype.Instance))
			textType = TYPE_SPRITEFONT2;
		else if (cr.plugins_.TextBox &&
			(this.inst instanceof cr.plugins_.TextBox.prototype.Instance))
			textType = TYPE_TEXTBOX;
		else if (cr.plugins_.rex_TagText &&
			(this.inst instanceof cr.plugins_.rex_TagText.prototype.Instance))
			textType = TYPE_REX_TAGTEXT;
		else if (cr.plugins_.rex_bbcodeText &&
			(this.inst instanceof cr.plugins_.rex_bbcodeText.prototype.Instance))
			textType = TYPE_REX_BBCODETEXT;
		else if (cr.plugins_.SpriteFontPlus &&
			(this.inst instanceof cr.plugins_.SpriteFontPlus.prototype.Instance))
			textType = TYPE_SPRITEFONTPLUS;
		else
			textType = TYPE_NONE;
		return textType;
	};

	behinstProto.getFnSetText = function (textType) {
		var set_text_handler;
		if (textType === TYPE_TEXT)
			set_text_handler = cr.plugins_.Text.prototype.acts.SetText;
		else if (textType === TYPE_SPRITEFONT2)
			set_text_handler = cr.plugins_.Spritefont2.prototype.acts.SetText;
		else if (textType === TYPE_TEXTBOX)
			set_text_handler = cr.plugins_.TextBox.prototype.acts.SetText;
		else if (textType === TYPE_REX_TAGTEXT)
			set_text_handler = cr.plugins_.rex_TagText.prototype.acts.SetText;
		else if (this.textType === TYPE_REX_BBCODETEXT)
			set_text_handler = cr.plugins_.rex_bbcodeText.prototype.acts.SetText;
		else if (this.textType === TYPE_SPRITEFONTPLUS)
			set_text_handler = cr.plugins_.SpriteFontPlus.prototype.acts.SetText;
		else
			set_text_handler = null;
		return set_text_handler;
	};

	behinstProto.onDestroy = function () {
		this.removeTypingTimer();
	};

	behinstProto.removeTypingTimer = function () {
		if (this.typingTimer != null)
			this.typingTimer.Remove();
	};

	behinstProto.tick = function () {
	};

	behinstProto.getRawTextLength = function (content) {
		var len;
		if ((this.textType === TYPE_TEXT) ||
			(this.textType === TYPE_SPRITEFONT2) || (this.textType === TYPE_SPRITEFONTPLUS) ||
			(this.textType === TYPE_TEXTBOX))
			len = content.length;
		else if ((this.textType === TYPE_REX_TAGTEXT) || (this.textType === TYPE_REX_BBCODETEXT))
			len = this.inst.getRawText(content).length;
		else
			len = 0;
		return len;
	};

	behinstProto.getSubString = function (txt, startIndex, endIndex) {
		if (startIndex == null)
			startIndex = 0;
		if (endIndex == null)
			endIndex = this.getRawTextLength(txt);
		if (startIndex > endIndex) { // swap
			var endIdx = startIndex;
			var startIdx = endIndex;
			startIndex = startIdx;
			endIndex = endIdx;
		}

		var result;
		if ((this.textType == TYPE_TEXT) ||
			(this.textType == TYPE_SPRITEFONT2) || (this.textType === TYPE_SPRITEFONTPLUS) ||
			(this.textType == TYPE_TEXTBOX)) {
			result = txt.slice(startIndex, endIndex);
		}
		else if ((this.textType === TYPE_REX_TAGTEXT) || (this.textType === TYPE_REX_BBCODETEXT)) {
			result = this.inst.getSubText(startIndex, endIndex, txt);
		}

		return result;
	};

	behinstProto.getTypingString = function (txt, typeIdx, typeMode) {
		var result;
		if (typeMode === 0) { //Left to right
			var startIdx = 0;
			var endIdx = typeIdx;
			result = this.getSubString(txt, startIdx, endIdx);

		} else if (typeMode === 1) { //Right to left
			var endIdx = this.rawTextLength;
			var startIdx = endIdx - typeIdx;
			result = this.getSubString(txt, startIdx, endIdx);

		} else if (typeMode === 2) { //Middle to sides
			var txtMidIdx = this.rawTextLength / 2;
			var startIdx = Math.floor(txtMidIdx - (typeIdx / 2));
			var endIdx = startIdx + typeIdx;
			result = this.getSubString(txt, startIdx, endIdx);

		} else if (typeMode === 3) { //Sides to middle
			var lowerLen = Math.floor(typeIdx / 2);
			var lowerResult;
			if (lowerLen > 0) {
				var endIdx = this.rawTextLength;
				var startIdx = endIdx - lowerLen;				
				lowerResult = this.getSubString(txt, startIdx, endIdx);
			} else {
				lowerResult = "";
			}

			var upperLen = typeIdx - lowerLen;
			var upperResult;
			if (upperLen > 0) {
				var startIdx = 0;					
				var endIdx = startIdx + upperLen;			
				upperResult = this.getSubString(txt, startIdx, endIdx);
			} else {
				upperResult = "";
			}
			result = upperResult + lowerResult;
		}

		return result;
	};

	behinstProto.SetText = function (txt) {
		if (this.FnSetText == null)
			return;

		this.FnSetText.call(this.inst, txt);
	};

	behinstProto.getTimer = function () {
		var timer = this.typingTimer;
		if (timer == null) {
			var timeline = this.type.getTimeline();
			assert2(timeline, "Text typing need a timeline object");
			timer = timeline.CreateTimer(on_timeout);
			timer.plugin = this;
		}
		return timer;
	};

	behinstProto.startTyping = function (text, speed, startIndex) {
		this.content = text;

		if (this.isLineBreak) {
			text = this.lineBreakContent(text);
		}

		this.rawTextLength = this.getRawTextLength(text);
		if (speed != 0) {
			if (startIndex == null)
				startIndex = 1;

			this.typingTimer = this.getTimer();
			this.typingContent = text;
			this.typingSpeed = speed;
			this.typingIndex = startIndex;
			this.typingTimer.Start(0);
		}
		else {
			this.typingIndex = this.rawTextLength;
			text = this.getTypingString(text, this.typingIndex, this.typeMode);
			this.SetText(text);
			this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTypingCompleted, this.inst);
		}
	};

	// handler of timeout for timers in this plugin, this=timer   
	var on_timeout = function () {
		this.plugin.typing();
	};

	behinstProto.typing = function () {
		var text = this.getTypingString(this.typingContent, this.typingIndex, this.typeMode);
		this.SetText(text);
		this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTextTyping, this.inst);
		this.typingIndex += 1;
		if (this.typingIndex <= this.rawTextLength)
			this.typingTimer.Restart(this.typingSpeed);
		else {
			this.typingIndex = this.rawTextLength;
			this.typingContent = null;
			this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTypingCompleted, this.inst);
		}
	};

	behinstProto.isTyping = function () {
		return (this.typingTimer) ? this.typingTimer.IsActive() : false;
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
	behinstProto.drawText = function (text) {
		// render all content
		this.SetText(text);
		var inst = this.inst;
		var ctx = (this.runtime.enableWebGL) ?
			this.getWebglCtx() : this.runtime.ctx;
		inst.draw(ctx);                      // call this function to get lines        
	};

	behinstProto.lineBreakContent = function (source) {
		this.drawText(source);
		var content;
		if (this.textType === TYPE_TEXT) {
			content = this.inst.lines.join("\n");
		}
		else if ((this.textType === TYPE_SPRITEFONT2) || (this.textType === TYPE_SPRITEFONTPLUS)) {
			var cnt = this.inst.lines.length;
			var lines = [];
			for (var i = 0; i < cnt; i++) {
				lines.push(this.inst.lines[i].text);
			}
			content = lines.join("\n");
		}
		else if ((this.textType === TYPE_REX_TAGTEXT) || (this.textType === TYPE_REX_BBCODETEXT)) {
			var pensMgr = this.inst.copyPensMgr();
			var cnt = pensMgr.getLines().length;
			var addNewLine = false;
			content = "";
			for (var i = 0; i < cnt; i++) {
				if (addNewLine)
					content += "\n";

				// get start chart index     
				var si = pensMgr.getLineStartChartIndex(i);
				// get end chart index
				var ei = pensMgr.getLineEndChartIndex(i);
				var txt = pensMgr.getSliceTagText(si, ei + 1);

				content += txt;
				addNewLine = (txt.indexOf("\n") === -1);
			}
		}

		return content || "";
	};

	behinstProto.saveToJSON = function () {
		return {
			"c": this.content,
			"tc": this.typingContent,
			"spd": this.typingSpeed,
			"i": this.typingIndex,

			"tim": (this.typingTimer != null) ? this.typingTimer.saveToJSON() : null,
			"tluid": (this.type.timeline != null) ? this.type.timeline.uid : (-1)
		};
	};

	behinstProto.loadFromJSON = function (o) {
		this.content = o["c"];
		this.typingContent = o["tc"];
		this.typingSpeed = o["spd"];
		this.typingIndex = o["i"];

		this.timerSave = o["tim"];
		this.type.timelineUid = o["tluid"];
	};

	behinstProto.afterLoad = function () {
		if (this.type.timelineUid === -1)
			this.type.timeline = null;
		else {
			this.type.timeline = this.runtime.getObjectByUID(this.type.timelineUid);
			assert2(this.type.timeline, "Timer: Failed to find timeline object by UID");
		}

		if (this.timerSave == null)
			this.typingTimer = null;
		else {
			this.typingTimer = this.type.timeline.LoadTimer(this.timerSave, on_timeout);
			this.typingTimer.plugin = this;
		}
		this.timers_save = null;
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() { };
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnTextTyping = function () {
		return true;
	};

	Cnds.prototype.OnTypingCompleted = function () {
		return true;
	};

	Cnds.prototype.IsTextTyping = function () {
		return this.isTyping();
	};

	//////////////////////////////////////
	// Actions
	function Acts() { };
	behaviorProto.acts = new Acts();

	Acts.prototype.SetupTimer = function (timeline_objs) {
		var timeline = timeline_objs.instances[0];
		if (timeline.check_name == "TIMELINE")
			this.type.timeline = timeline;
		else
			alert("Text-typing should connect to a timeline object");
	};

	Acts.prototype.TypeText = function (param, speed) {
		if (typeof param === "number")
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors

		this.startTyping(param.toString(), speed);
	};

	Acts.prototype.SetTypingSpeed = function (speed) {
		if (this.typingSpeed === speed)
			return;


		this.typingSpeed = speed;
		var timer = this.typingTimer;
		if (timer == null)
			return;

		if (timer.IsActive()) {
			timer.Restart(speed);
		}
	};

	Acts.prototype.StopTyping = function (is_show_all) {
		this.removeTypingTimer();
		if (is_show_all) {
			this.SetText(this.content);
			this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTypingCompleted, this.inst);
		}
	};

	Acts.prototype.AppendText = function (param) {
		var startIndex = this.rawTextLength;
		if (typeof param === "number")
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		if (!this.isTyping())
			this.startTyping(this.content + param.toString(), this.typingSpeed, startIndex);
	};

	Acts.prototype.Pause = function () {
		if (this.typingTimer == null)
			return;

		this.typingTimer.Suspend();
	};

	Acts.prototype.Resume = function () {
		if (this.typingTimer == null)
			return;

		this.typingTimer.Resume();
	};
	//////////////////////////////////////
	// Expressions
	function Exps() { };
	behaviorProto.exps = new Exps();

	Exps.prototype.TypingSpeed = function (ret) {
		ret.set_float(this.typingSpeed);
	};

	Exps.prototype.TypingIndex = function (ret) {
		ret.set_float(this.typingIndex - 1);
	};

	Exps.prototype.Content = function (ret) {
		ret.set_string(this.content);
	};

	Exps.prototype.LastTypingCharacter = function (ret) {
		ret.set_string(this.content.charAt(this.typingIndex - 1));
	};
}());