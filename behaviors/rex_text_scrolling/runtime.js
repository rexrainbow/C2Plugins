// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_text_scrolling = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var behaviorProto = cr.behaviors.Rex_text_scrolling.prototype;

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
		this.inst = inst;
		this.runtime = type.runtime;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function () {
		this.autoRedraw = (this.properties[0] === 1);
		this.content = "";
		this.totalLinesCnt = 0;
		this.visibleLines = 0;
		this.linePositionInPercent = 0;
		this.startLineIndex = 0;
		this.textChanged = false;
		this.lastwidth = this.inst.width;
		this.lastheight = this.inst.height;

		this.textObjType = this.getTextObjType();
		this.FnSetText = this.getFnSetText();
		this.initContentLines();
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

	behinstProto.getFnSetText = function () {
		var setTextFn;
		if (this.textObjType === TYPE_TEXT)
			setTextFn = cr.plugins_.Text.prototype.acts.SetText;
		else if (this.textObjType === TYPE_SPRITEFONT2)
			setTextFn = cr.plugins_.Spritefont2.prototype.acts.SetText;
		else if (this.textObjType === TYPE_REX_TAGTEXT)
			setTextFn = cr.plugins_.rex_TagText.prototype.acts.SetText;
		else if (this.textObjType === TYPE_REX_BBCODETEXT)
			setTextFn = cr.plugins_.rex_bbcodeText.prototype.acts.SetText;
		else if (this.textObjType === TYPE_SPRITEFONTPLUS)
			setTextFn = cr.plugins_.SpriteFontPlus.prototype.acts.SetText;
		else
			setTextFn = null;
		return setTextFn;
	};

	behinstProto.initContentLines = function () {
		var setTextFn;
		if ((this.textObjType === TYPE_TEXT) || (this.textObjType === TYPE_SPRITEFONT2) || (this.textObjType === TYPE_SPRITEFONTPLUS))
			this.contentLines = [];
		else if ((this.textObjType === TYPE_REX_TAGTEXT) || (this.textObjType === TYPE_REX_BBCODETEXT))
			this.contentLines = null;
		else
			this.contentLines = [];
	};

	behinstProto.onDestroy = function () {
	};

	behinstProto.tick = function () {
	};

	behinstProto.tick2 = function () {
		if (this.autoRedraw)
			this.redrawText();
	};

	behinstProto.redrawText = function () {
		var isSizeChanged = (this.lastwidth !== this.inst.width) || (this.lastheight !== this.inst.height);
		if (isSizeChanged || this.textChanged) {
			this.SetContent();
			this.textChanged = false;
			this.lastwidth = this.inst.width;
			this.lastheight = this.inst.height;
		}
	};
	behinstProto.getLastStartLineIndex = function () {
		var idx = this.totalLinesCnt - this.visibleLines;
		if (idx < 0)
			idx = 0;
		return idx;
	};

	behinstProto.perent2line = function (percent) {
		return Math.floor(this.getLastStartLineIndex() * percent);
	};

	behinstProto.line2percent = function (lineIndex) {
		var percent = lineIndex / this.getLastStartLineIndex();
		return cr.clamp(percent, 0, 1);
	};

	behinstProto.copyContentLines = function () {
		if ((this.textObjType === TYPE_TEXT) || (this.textObjType === TYPE_SPRITEFONT2) || (this.textObjType === TYPE_SPRITEFONTPLUS)) {
			var lines = this.inst.lines;
			this.contentLines.length = 0;
			var i, line, line_cnt = lines.length;
			for (i = 0; i < line_cnt; i++) {
				this.contentLines.push(lines[i].text);
			}
		}
		else if ((this.textObjType === TYPE_REX_TAGTEXT) || (this.textObjType === TYPE_REX_BBCODETEXT)) {
			this.contentLines = this.inst.copyPensMgr(this.contentLines);
		}
		return this.contentLines;
	};

	behinstProto.getVisibleText = function (startLineIndex) {
		this.startLineIndex = (startLineIndex < 0) ? 0 : startLineIndex;
		var endIndex = this.startLineIndex + this.visibleLines;
		if (endIndex > this.totalLinesCnt)
			endIndex = this.totalLinesCnt;

		return this.getSubText(this.startLineIndex, endIndex);
	};

	behinstProto.getSubText = function (start, end) {
		if (start >= end)
			return "";

		var txt;
		if ((this.textObjType === TYPE_TEXT) || (this.textObjType === TYPE_SPRITEFONT2) || (this.textObjType === TYPE_SPRITEFONTPLUS)) {
			txt = "";
			end -= 1;
			for (var i = start; i <= end; i++) {
				txt += this.contentLines[i];
				if (i < end)
					txt += "\n";
			}
		}
		else if ((this.textObjType === TYPE_REX_TAGTEXT) || (this.textObjType === TYPE_REX_BBCODETEXT)) {
			// get start chart index     
			var si = this.contentLines.getLineStartChartIndex(start);
			// get end chart index
			var ei = this.contentLines.getLineEndChartIndex(end - 1);
			txt = this.contentLines.getSliceTagText(si, ei + 1);
		}
		return txt;
	};


	behinstProto.getTotalLinesCount = function () {
		var cnt;
		if ((this.textObjType === TYPE_TEXT) || (this.textObjType === TYPE_SPRITEFONT2) || (this.textObjType === TYPE_SPRITEFONTPLUS)) {
			cnt = this.contentLines.length;
		}
		else if ((this.textObjType === TYPE_REX_TAGTEXT) || (this.textObjType === TYPE_REX_BBCODETEXT)) {
			cnt = this.contentLines.getLines().length;
		}
		return cnt;
	};


	behinstProto.SetContent = function () {
		// render all content
		var inst = this.inst;
		this.setText(this.content);         // start from line 0        
		var ctx = (this.runtime.enableWebGL) ?
			this.getWebglCtx() : this.runtime.ctx;
		inst.draw(ctx);                      // call this function to get lines

		// copy content in lines, or pensMgr
		this.copyContentLines();
		// get total lines count
		this.totalLinesCnt = this.getTotalLinesCount();
		// calc visible lines count
		var lineHeight = this.getLineHeight();
		this.visibleLines = Math.floor(inst.height / lineHeight);
		if ((inst.height % lineHeight) == 0)
			this.visibleLines -= 1;

		// only show visible lines
		this.setText("");     // clean remain text
		this.setText(this.getVisibleText(this.startLineIndex));
	};

	behinstProto.getLineHeight = function () {
		var lineHeight, inst = this.inst;
		if (this.textObjType == TYPE_TEXT)
			lineHeight = inst.pxHeight;
		else if ((this.textObjType === TYPE_REX_TAGTEXT) || (this.textObjType === TYPE_REX_BBCODETEXT))
			lineHeight = inst.pxHeight;
		else if ((this.textObjType == TYPE_SPRITEFONT2) || (this.textObjType === TYPE_SPRITEFONTPLUS))
			lineHeight = (inst.characterHeight * inst.characterScale) + inst.lineHeight;

		assert2(lineHeight, "Text Scrolling behavior: the instance is not a text object, neither a sprite font object.");
		return lineHeight;
	};


	behinstProto.setText = function (content) {
		if (this.FnSetText == null)
			return;

		if ((this.textObjType === TYPE_REX_TAGTEXT) || (this.textObjType === TYPE_REX_BBCODETEXT)) {
			var isForceRenderSave = this.inst.isForceRender;
			this.inst.isForceRender = false;
		}

		this.FnSetText.call(this.inst, content); // set text

		if ((this.textObjType === TYPE_REX_TAGTEXT) || (this.textObjType === TYPE_REX_BBCODETEXT)) {
			this.inst.isForceRender = isForceRenderSave;
		}
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

	behinstProto.saveToJSON = function () {
		return {
			"raw": this.content,
			"lcnt": this.totalLinesCnt,
			"vlcnt": this.visibleLines,
			"lper": this.linePositionInPercent,
			"start": this.startLineIndex,
		};
	};

	behinstProto.loadFromJSON = function (o) {
		this.content = o["raw"];
		this.totalLinesCnt = o["lcnt"];
		this.visibleLines = o["vlcnt"];
		this.linePositionInPercent = o["lper"];
		this.startLineIndex = o["start"];
	};

	behinstProto.afterLoad = function () {
		this.SetContent();    // get this.contentLines back
	};

	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections) {
		propsections.push({
			"title": this.type.name,
			"properties": [
				{ "name": "Content", "value": this.content },
				{ "name": "Start at", "value": this.startLineIndex },
				{ "name": "Total lines", "value": this.totalLinesCnt },
				{ "name": "Visible lines", "value": this.visibleLines }
			]
		});
	};

	behinstProto.onDebugValueEdited = function (header, name, value) {
	};
	/**END-PREVIEWONLY**/
	//////////////////////////////////////
	// Conditions
	function Cnds() { };
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.IsLastPage = function () {
		return (this.startLineIndex + this.visibleLines >= this.totalLinesCnt);
	};
	//////////////////////////////////////
	// Actions
	function Acts() { };
	behaviorProto.acts = new Acts();

	var param2string = function (param) {
		if (typeof param === "number")
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		return param.toString();
	};

	Acts.prototype.SetContent = function (param) {
		this.content = param2string(param);
		this.startLineIndex = 0;
		this.SetContent();
	};

	Acts.prototype.ScrollToPercent = function (percent) {
		this.redrawText();
		this.linePositionInPercent = cr.clamp(percent, 0, 1);
		var startLineIndex = this.perent2line(this.linePositionInPercent);
		this.setText(this.getVisibleText(startLineIndex));
	};

	Acts.prototype.AppendContent = function (param) {
		this.content += param2string(param);
		this.textChanged = true;
	};

	Acts.prototype.ScrollToLineIndex = function (lineIndex) {
		this.redrawText();
		this.setText(this.getVisibleText(lineIndex));
	};

	Acts.prototype.NextLine = function () {
		this.redrawText();
		this.setText(this.getVisibleText(this.startLineIndex + 1));
	};

	Acts.prototype.PreviousLine = function () {
		this.redrawText();
		this.setText(this.getVisibleText(this.startLineIndex - 1));
	};

	Acts.prototype.NextPage = function () {
		this.redrawText();
		this.setText(this.getVisibleText(this.startLineIndex + this.visibleLines));
	};

	Acts.prototype.PreviousPage = function () {
		this.redrawText();
		this.setText(this.getVisibleText(this.startLineIndex - this.visibleLines));
	};

	Acts.prototype.ScrollToPageIndex = function (page_index) {
		this.redrawText();
		this.setText(this.getVisibleText(page_index * this.visibleLines));
	};

	//////////////////////////////////////
	// Expressions
	function Exps() { };
	behaviorProto.exps = new Exps();

	Exps.prototype.Text = function (ret) {
		ret.set_string(this.content);
	};

	Exps.prototype.TotalCnt = function (ret) {
		ret.set_int(this.totalLinesCnt);
	};

	Exps.prototype.VisibleCnt = function (ret) {
		ret.set_int(this.visibleLines);
	};

	Exps.prototype.CurrIndex = function (ret) {
		ret.set_int(this.startLineIndex);
	};

	Exps.prototype.CurrLastIndex = function (ret) {
		var currentLastIndex = this.startLineIndex + this.visibleLines - 1;
		var lastIndex = this.totalLinesCnt - 1;
		if (currentLastIndex > lastIndex)
			currentLastIndex = lastIndex;
		ret.set_int(currentLastIndex);
	};


	Exps.prototype.Lines = function (ret, start, end) {
		if (start < 0)
			start = 0;
		if (end > this.totalLinesCnt)
			end = this.totalLinesCnt;

		var text;
		if (end > start)
			text = this.getSubText(start, end);
		else
			text = "";

		ret.set_string(text);
	};

}());