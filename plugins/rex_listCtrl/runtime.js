// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ListCtrl = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var pluginProto = cr.plugins_.Rex_ListCtrl.prototype;

	pluginProto.onCreate = function () {
		pluginProto.acts.Destroy = function () {
			this.runtime.DestroyInstance(this);
			this.setLineNum(0);
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
		this.linesMgr = new cr.plugins_.Rex_ListCtrl.LinesMgrKlass(this);
		this.verticalScrollingMode = (this.properties[4] === 1);
		this.clampOYMode = (this.properties[3] === 1);
		this.linesMgr.SetDefaultLineHeight(this.properties[1]);
		this.updatingFlag = true;
		this.OY = 0;


		this.linesMgr.SetLinesCount(this.properties[2]);
		this.visibleLineIndexes = {};
		this.previousVisibleLineIndexes = {};

		this.visibleStartIndex = 0;
		this.visibleEndIndex = 0;

		// monitor ListCtrl changing
		this.previousInstX = this.x;
		this.previousInstY = this.y;
		this.previousInstHeight = this.getInstHeight();
		this.isOutTop = false;
		this.isOutBottom = false;
		this.boundType = null;

		this.exp_LineIndex = 0;
		this.exp_LineTLX = 0;
		this.exp_LineTLY = 0;
		this.exp_LastRemovedLines = "";
		this.exp_LastBoundOY = 0;

		this.runtime.tick2Me(this);

		this.linesMgrSave = null;
	};

	instanceProto.draw = function (ctx) {};

	instanceProto.drawGL = function (glw) {};

	instanceProto.tick2 = function () {
		var currentInstHeight = this.getInstHeight();
		var isHeightChanged = (this.previousInstHeight !== currentInstHeight);
		var isXChanged = (this.previousInstX !== this.x);
		var isYChanged = (this.previousInstY !== this.y);
		var isAreaChange = isHeightChanged || isXChanged || isYChanged;

		if (isAreaChange)
			this.updatingFlag = true;

		if (!this.updatingFlag)
			return;

		this.update();

		this.previousInstX = this.x;
		this.previousInstY = this.y;
		this.previousInstHeight = currentInstHeight;
	};

	instanceProto.onDestroy = function () {
		//this.setLineNum(0);
	};

	instanceProto.getInstHeight = function () {
		return (this.verticalScrollingMode) ? this.height : this.width;
	};

	instanceProto.getInstWidth = function () {
		return (this.verticalScrollingMode) ? this.width : this.height;
	};


	instanceProto.update = function (refresh) {
		this.updatingFlag = false;
		if (refresh) {
			this.prepare();
			this.hideLines();
		}

		this.prepare();
		this.showLines();
		this.hideLines();

		this.exp_LineIndex = -1;
	};

	instanceProto.prepare = function () {
		var tmp = this.previousVisibleLineIndexes;
		this.previousVisibleLineIndexes = this.visibleLineIndexes;
		this.visibleLineIndexes = tmp;

		cleanTable(this.visibleLineIndexes);

	};

	instanceProto.showLines = function () {
		// index
		var lineIndex = this.linesMgr.Height2LineIndex(-this.OY);
		var lineTLX = this.getLineTLX();
		var lineTLY = this.getLineTLY(lineIndex);
		// end condition
		var bottomBound = this.getBottomBound();
		var lastIndex = this.linesMgr.GetLinesCount() - 1;

		var line;
		this.visibleStartIndex = null;
		this.visibleEndIndex = null;
		// visible lines
		while ((lineTLY < bottomBound) && (lineIndex <= lastIndex)) {
			if (this.linesMgr.IsInRange(lineIndex)) {
				if (this.visibleStartIndex === null) {
					this.visibleStartIndex = lineIndex;
				}
				this.visibleEndIndex = lineIndex;
				this.visibleLineIndexes[lineIndex] = true;

				line = this.linesMgr.GetLine(lineIndex);
				lineTLY += line.offsety;
				line.SetTLXY(lineTLX, lineTLY);

				if (this.previousVisibleLineIndexes.hasOwnProperty(lineIndex)) {
					line.PinInsts();
				} else {
					// on line visible
					this.onShowLine(lineIndex, lineTLX, lineTLY);
				}
			}

			lineTLY += this.linesMgr.GetLineHeight(lineIndex);
			lineIndex += 1;
		}
	};

	instanceProto.onShowLine = function (lineIndex, tlx, tly) {
		this.exp_LineIndex = lineIndex;

		if (this.verticalScrollingMode) {
			this.exp_LineTLX = tlx;
			this.exp_LineTLY = tly;
		} else {
			this.exp_LineTLX = tly;
			this.exp_LineTLY = tlx;
		}

		this.runtime.trigger(cr.plugins_.Rex_ListCtrl.prototype.cnds.OnLineVisible, this);
	};

	instanceProto.hideLines = function () {
		// invisible lines
		var i, insts;
		for (i in this.previousVisibleLineIndexes) {
			if (this.visibleLineIndexes.hasOwnProperty(i))
				continue;

			this.onHideLine(i);
		}
	};

	instanceProto.onHideLine = function (lineIndex) {
		this.exp_LineIndex = parseInt(lineIndex);
		this.runtime.trigger(cr.plugins_.Rex_ListCtrl.prototype.cnds.OnLineInvisible, this);

		// destroy instances in the line  
		this.linesMgr.DestroyPinedInsts(lineIndex);
	};

	instanceProto.getLineTLX = function () {
		this.update_bbox();
		return (this.verticalScrollingMode) ? this.bquad.tlx : this.bquad.tly;
	};

	instanceProto.getLineTLY = function (lineIndex) {
		this.update_bbox();
		var poy = (this.verticalScrollingMode) ? this.bquad.tly : this.bquad.tlx;
		var py = this.OY + this.linesMgr.LineIndex2Height(0, lineIndex - 1) + poy;

		return py;
	};

	instanceProto.getBottomBound = function () {
		this.update_bbox();
		return (this.verticalScrollingMode) ? this.bquad.bly : this.bquad.trx;
	};

	instanceProto.setOY = function (oy) {
		// check out-of-bound
		var isOutTop = this.isOYOutBound(oy, 0);
		var isOutBottom = this.isOYOutBound(oy, 1);

		if (this.clampOYMode) {
			var totalLinesNum = this.linesMgr.GetLinesCount();
			var visibleLinesNum = this.linesMgr.Height2LineIndex(this.getInstHeight(), true);

			// less then 1 page
			if (totalLinesNum === visibleLinesNum)
				oy = 0;

			else if (oy > 0)
				oy = 0;

			else {
				var listHeight = this.getListHeight();
				if (oy < -listHeight)
					oy = -listHeight;
			}
		}

		if (this.OY !== oy) {
			this.updatingFlag = true;
			this.OY = oy;
		}

		// trigger out-of-bound	    	    
		if (isOutTop && (!this.isOutTop)) {
			this.boundType = 0;
			this.exp_LastBoundOY = 0;
			this.runtime.trigger(cr.plugins_.Rex_ListCtrl.prototype.cnds.OnOYOutOfBound, this);
			this.boundType = null;
		}
		if (isOutBottom && !this.isOutBottom) {
			this.boundType = 1;
			this.exp_LastBoundOY = -this.getListHeight();
			this.runtime.trigger(cr.plugins_.Rex_ListCtrl.prototype.cnds.OnOYOutOfBound, this);
			this.boundType = null;
		}

		this.isOutTop = isOutTop;
		this.isOutBottom = isOutBottom;
	};

	instanceProto.isLineVisible = function (lineIndex) {
		if (this.visibleStartIndex == null)
			return false;

		return (lineIndex >= this.visibleStartIndex) && (lineIndex <= this.visibleEndIndex);
	};

	var NEWLINES = [];
	var getContent = function (content) {
		if (content === "")
			return null;

		if (typeof (content) === "string") {
			try {
				return JSON.parse(content);
			} catch (e) {
				return null;
			}
		} else if (typeof (content) === "number") {
			NEWLINES.length = content;
			var i;
			for (i = 0; i < content; i++)
				NEWLINES[i] = null;
			return NEWLINES;
		} else
			return content;
	};

	instanceProto.setLineNum = function (cnt) {
		if (cnt < 0)
			cnt = 0;

		var isChanged = this.linesMgr.SetLinesCount(cnt);
		if (isChanged)
			this.updatingFlag = true;
	};

	instanceProto.insertLines = function (lineIndex, content) {
		content = getContent(content);
		if (content === null)
			return;

		var cnt = content.length;
		if (this.isLineVisible(lineIndex)) {
			var i;
			for (i = 0; i < cnt; i++) {
				delete this.visibleLineIndexes[lineIndex + i];
				this.visibleLineIndexes[this.visibleEndIndex + 1 + i] = true;
			}
		}
		this.linesMgr.InsertLines(lineIndex, content);
		this.updatingFlag = true;
	};

	instanceProto.removeLines = function (lineIndex, cnt) {
		var totalLinesNum = this.linesMgr.GetLinesCount();
		if ((lineIndex + cnt) > totalLinesNum)
			cnt = totalLinesNum - lineIndex;

		if (this.isLineVisible(lineIndex)) {
			var i;
			for (i = 0; i < cnt; i++) {
				delete this.visibleLineIndexes[this.visibleEndIndex - i];
			}
		}
		var removedLines = this.linesMgr.RemoveLines(lineIndex, cnt);
		this.exp_LastRemovedLines = JSON.stringify(removedLines);
		this.updatingFlag = true;
	};

	instanceProto.forEachLine = function (start_, end_, filterFn) {
		var totalLinesNum = this.linesMgr.GetLinesCount();
		var start = (start_ == null) ? 0 : Math.min(start_, end_);
		var end = (end_ == null) ? totalLinesNum - 1 : Math.max(start_, end_);
		if (start < 0)
			start = 0;
		if (end > totalLinesNum)
			end = totalLinesNum - 1;

		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();

		var i;
		for (i = start; i <= end; i++) {
			if ((!filterFn) || filterFn(i)) {

				if (solModifierAfterCnds) {
					this.runtime.pushCopySol(current_event.solModifiers);
				}


				this.exp_LineIndex = i;
				current_event.retrigger();


				if (solModifierAfterCnds) {
					this.runtime.popSol(current_event.solModifiers);
				}

			}
		}

		return false;

	};

	instanceProto.getListHeight = function () {
		var h;
		var totalLinesHeight = this.linesMgr.GetTotalLinesHeight();
		var instHeight = this.getInstHeight();
		if (totalLinesHeight > instHeight)
			h = totalLinesHeight - instHeight;
		else
			h = 0;

		return h;
	};

	instanceProto.isOYOutBound = function (OY, boundType) {
		var isOutBound;
		// top
		if (boundType === 0)
			isOutBound = (OY > 0);

		// bottom	    
		else
			isOutBound = (OY < -this.getListHeight());

		return isOutBound;
	};

	instanceProto.uid2Inst = function (uid, objtype) {
		if (uid == null)
			return null;
		var inst = this.runtime.getObjectByUID(uid);
		if (inst == null)
			return null;

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

	instanceProto.pickInstsOnLine = function (lineIndex, objtype) {
		var line = this.linesMgr.GetLine(lineIndex, true);
		if (line == null)
			return false;

		var instsUID = line.GetPinInstsUID();

		var sol = objtype.getCurrentSol();
		sol.select_all = false;
		sol.instances.length = 0; // clear contents
		var uid, inst;
		for (uid in instsUID) {
			inst = this.uid2Inst(uid, objtype)
			if (inst != null)
				sol.instances.push(inst);
		}
		objtype.applySolToContainer();
		return (sol.instances.length > 0);
	};

	var name2type = {}; // private global object
	instanceProto.pickAllInstsOnLine = function (lineIndex) {
		var line = this.linesMgr.GetLine(lineIndex, true);
		if (line == null)
			return false;
		var instsUID = line.GetPinInstsUID();

		var uid, inst, objtype, sol;
		cleanTable(name2type);
		var hasInst = false;
		for (uid in instsUID) {
			inst = this.uid2Inst(uid);
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
			hasInst = true;
		}
		var name;
		for (name in name2type)
			name2type[name].applySolToContainer();
		cleanTable(name2type);
		return hasInst;
	};

	var cleanTable = function (o) {
		for (var k in o)
			delete o[k];
	};

	instanceProto.saveToJSON = function () {
		// monitor ListCtrl changing
		this.previousInstX = this.x;
		this.previousInstY = this.y;
		this.previousInstHeight = this.height;

		return {
			"updatingFlag": this.updatingFlag,
			"OY": this.OY,
			"linesMgr": this.linesMgr.saveToJSON(),
			"visibleLinesNum": this.visibleLineIndexes,
			"pre_visible_lines": this.previousVisibleLineIndexes,
			"visibleStartIndex": this.visibleStartIndex,
			"visibleEndIndex": this.visibleEndIndex,

			"previousInstX": this.previousInstX,
			"previousInstY": this.previousInstY,
			"previousInstHeight": this.previousInstHeight,
			"topb": this.isOutTop,
			"bottomb": this.isOutBottom
		};
	};

	instanceProto.loadFromJSON = function (o) {
		this.updatingFlag = o["updatingFlag"];
		this.OY = o["OY"];
		this.linesMgrSave = o["linesMgr"];
		this.visibleLineIndexes = o["visibleLinesNum"];
		this.previousVisibleLineIndexes = o["pre_visible_lines"];
		this.visibleStartIndex = o["visibleStartIndex"];
		this.visibleEndIndex = o["visibleEndIndex"];

		this.previousInstX = o["previousInstX"];
		this.previousInstY = o["previousInstY"];
		this.previousInstHeight = o["previousInstHeight"];
		this.isOutTop = o["topb"];
		this.isOutBottom = o["bottomb"];
	};

	instanceProto.afterLoad = function () {
		this.linesMgr.afterLoad(this.linesMgrSave);
		this.linesMgrSave = null;
	};

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections) {
		var visibleIndexes;
		if (this.visibleStartIndex != null)
			visibleIndexes = this.visibleStartIndex.toString() + " - " + this.visibleEndIndex.toString();
		else
			visibleIndexes = "";

		propsections.push({
			"title": this.type.name,
			"properties": [{
					"name": "Offset Y",
					"value": this.OY
				},
				{
					"name": "Visible line indexes",
					"value": visibleIndexes
				},
			]
		});
	};
	/**END-PREVIEWONLY**/
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnLineVisible = function () {
		return true;
	};

	Cnds.prototype.OnLineInvisible = function () {
		return true;
	};

	Cnds.prototype.ForEachLine = function (start, end) {
		return this.forEachLine(start, end);
	};

	Cnds.prototype.ForEachVisibleLine = function () {
		return this.forEachLine(this.visibleStartIndex, this.visibleEndIndex);
	};

	Cnds.prototype.ForEachMatchedLine = function (k_, cmp, v_) {
		var self = this;
		var filterFn = function (lineIndex) {
			var d = self.linesMgr.GetCustomData(lineIndex, k_);
			if (d == null)
				return false;

			return cr.do_cmp(d, cmp, v_);
		}
		return this.forEachLine(null, null, filterFn);
	};

	Cnds.prototype.IsOYOutOfBound = function (boundType) {
		if ((boundType === 0) || (boundType === 1))
			return this.isOYOutBound(this.OY, boundType);
		else
			return this.isOYOutBound(this.OY, 0) || this.isOYOutBound(this.OY, 1);
	};

	Cnds.prototype.OnOYOutOfBound = function (boundType) {
		if ((boundType === 0) || (boundType === 1))
			return (this.boundType === boundType);
		else
			return true;
	};

	Cnds.prototype.PickInstsOnLine = function (lineIndex, objtype) {
		if (!objtype)
			return false;
		return this.pickInstsOnLine(lineIndex, objtype);
	};

	Cnds.prototype.PickAllInstsOnLine = function (lineIndex) {
		return this.pickAllInstsOnLine(lineIndex);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.SetOY = function (oy) {
		this.setOY(oy);
	};
	Acts.prototype.AddOY = function (dy) {
		this.setOY(this.OY + dy);
	};
	Acts.prototype.PinInstToLine = function (objs) {
		if ((!objs) || (this.exp_LineIndex == -1))
			return;

		var insts = objs.getCurrentSol().getObjects();
		var i, cnt = insts.length;
		for (i = 0; i < cnt; i++) {
			this.linesMgr.AddInstToLine(this.exp_LineIndex, insts[i]);
		}
	};
	Acts.prototype.UnPinInst = function (objs) {
		if (!objs)
			return;

		if (this.visibleStartIndex !== null) {
			var insts = objs.getCurrentSol().getObjects();
			var i, j, cnt = insts.length,
				uid;
			for (i = 0; i < cnt; i++) {
				uid = insts[i].uid;
				for (j = this.visibleStartIndex; j <= this.visibleEndIndex; j++)
					this.linesMgr.RemoveInstFromLine(j, uid)
			}
		}
	};

	Acts.prototype.SetLinesCount = function (cnt) {
		this.setLineNum(cnt);
	};

	Acts.prototype.SetOYToLineIndex = function (lineIndex) {
		var p = this.linesMgr.LineIndex2Height(0, lineIndex);
		this.setOY(-p);
	};

	Acts.prototype.SetOYByPercentage = function (percentage) {
		var p = this.getListHeight() * percentage;
		this.setOY(-p);
	};
	Acts.prototype.SetValue = function (lineIndex, key_, value_) {
		var isChanged = this.linesMgr.SetCustomData(lineIndex, key_, value_);

		if (isChanged)
			this.updatingFlag = true;
	};
	Acts.prototype.CleanKeyInAllLine = function (key_) {
		this.linesMgr.SetCustomData(null, key_, null);
		this.updatingFlag = true;
	};
	Acts.prototype.CleanAllKeysInAllLine = function () {
		this.linesMgr.SetCustomData(null, null, null);
		this.updatingFlag = true;
	};
	Acts.prototype.InsertNewLines = function (lineIndex, cnt) {
		this.insertLines(lineIndex, cnt);
	};

	Acts.prototype.RemoveLines = function (lineIndex, cnt) {
		this.removeLines(lineIndex, cnt);
	};

	Acts.prototype.InsertLines = function (lineIndex, content) {
		this.insertLines(lineIndex, content);
	};

	Acts.prototype.PushNewLines = function (where, cnt) {
		var lineIndex = (where == 1) ? 0 : this.linesMgr.GetLinesCount();
		this.insertLines(lineIndex, cnt);
	};

	Acts.prototype.PushLines = function (where, content) {
		var lineIndex = (where == 1) ? 0 : this.linesMgr.GetLinesCount();
		this.insertLines(lineIndex, content);
	};

	Acts.prototype.SetDefaultLineHeight = function (height) {
		if (height <= 0)
			return;
		var isChanged = this.linesMgr.SetDefaultLineHeight(height);

		if (isChanged)
			this.updatingFlag = true;
	};

	Acts.prototype.SetLineOffsetY = function (lineIndex, offsety) {
		var line = this.linesMgr.GetLine(lineIndex);
		if (!line)
			return;
		var isChanged = (line.offsety != offsety);
		line.offsety = offsety;

		if (isChanged)
			this.updatingFlag = true;
	};

	Acts.prototype.SetLineHeight = function (lineIndex, height) {
		if (!this.linesMgr.IsInRange(lineIndex))
			return;

		if (height < 0)
			return;

		var isChanged = this.linesMgr.SetLineHeight(lineIndex, height);

		if (isChanged)
			this.updatingFlag = true;
	};

	Acts.prototype.RefreshVisibleLines = function () {
		this.update(true);
	};

	Acts.prototype.PickInstsOnLine = function (lineIndex, objtype) {
		if (!objtype)
			return;
		this.pickInstsOnLine(lineIndex, objtype);
	};

	Acts.prototype.PickAllInstsOnLine = function (lineIndex) {
		return this.pickAllInstsOnLine(lineIndex);
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.LineIndex = function (ret) {
		ret.set_int(this.exp_LineIndex);
	};

	Exps.prototype.LineTLX = function (ret) {
		ret.set_float(this.exp_LineTLX);
	};
	Exps.prototype.LineTLY = function (ret) {
		ret.set_float(this.exp_LineTLY);
	};

	Exps.prototype.UID2LineIndex = function (ret, uid) {
		var lineIndex;
		if (this.visibleStartIndex !== null) {
			var i;
			for (i = this.visibleStartIndex; i <= this.visibleEndIndex; i++) {
				if (this.linesMgr.LineHasInst(i, uid)) {
					lineIndex = i;
					break;
				}
			}
		}
		if (lineIndex == null)
			lineIndex = -1;

		ret.set_int(lineIndex);
	};

	Exps.prototype.LineIndex2LineTLY = function (ret, lineIndex) {
		ret.set_float(this.getLineTLY(lineIndex));
	};

	Exps.prototype.TotalLinesCount = function (ret) {
		ret.set_int(this.linesMgr.GetLinesCount());
	};

	Exps.prototype.DefaultLineHeight = function (ret) {
		ret.set_float(this.linesMgr.defaultLineHeight);
	};

	Exps.prototype.LineHeight = function (ret, index_) {
		ret.set_float(this.linesMgr.GetLineHeight(index_));
	};

	Exps.prototype.ListHeight = function (ret) {
		ret.set_float(this.linesMgr.GetTotalLinesHeight());
	};

	Exps.prototype.At = function (ret, index_, key_, defaultValue) {
		var v = this.linesMgr.GetCustomData(index_, key_);
		if (v == null)
			v = defaultValue || 0;

		ret.set_any(v);
	};

	Exps.prototype.LastRemovedLines = function (ret) {
		ret.set_string(this.exp_LastRemovedLines);
	};

	Exps.prototype.CustomDataInLines = function (ret, lineIndex, cnt) {
		var dataInLines = this.linesMgr.GetCustomDataInLines(lineIndex, cnt);
		ret.set_string(JSON.stringify(dataInLines));
	};

	Exps.prototype.OY = function (ret) {
		ret.set_float(this.OY);
	};

	Exps.prototype.BotomOY = function (ret) {
		ret.set_float(-this.getListHeight());
	};

	Exps.prototype.TopOY = function (ret) {
		ret.set_float(0);
	};

	Exps.prototype.LastBoundOY = function (ret) {
		ret.set_float(this.exp_LastBoundOY);
	};

	Exps.prototype.LineCX = function (ret) {
		var x = this.exp_LineTLX + (0.5 * this.getInstWidth());
		ret.set_float(x);
	};

	Exps.prototype.CurLineIndex = function (ret) {
		ret.set_int(this.exp_LineIndex);
	};

	Exps.prototype.FirstVisibleLineIndex = function (ret) {
		ret.set_int(this.visibleStartIndex || 0);
	};

	Exps.prototype.LastVisibleLineIndex = function (ret) {
		ret.set_int(this.visibleEndIndex || 0);
	};

}());


(function () {
	var ObjCacheKlass = function () {
		this.lines = [];
	};
	var ObjCacheKlassProto = ObjCacheKlass.prototype;
	ObjCacheKlassProto.allocLine = function () {
		return (this.lines.length > 0) ? this.lines.pop() : null;
	};
	ObjCacheKlassProto.freeLine = function (l) {
		this.lines.push(l);
	};
	var lineCache = new ObjCacheKlass();

	// LinesMgr
	cr.plugins_.Rex_ListCtrl.LinesMgrKlass = function (plugin) {
		this.plugin = plugin;
		this.lines = [];
		this.defaultLineHeight = 0;
		this.defaultLineHeightMode = true;
		this.totalLinesHeight = null;
	};
	var LinesMgrKlassProto = cr.plugins_.Rex_ListCtrl.LinesMgrKlass.prototype;

	LinesMgrKlassProto.SetLinesCount = function (cnt) {
		var end = this.GetLinesCount();
		if (end === cnt)
			return false;
		else if (end > cnt) {
			var i, line;
			for (i = cnt; i < end; i++) {
				// release lines
				line = this.lines[i];
				if (!line)
					continue;

				line.Clean();
				lineCache.freeLine(line);
			}
			this.lines.length = cnt;
		} else if (end < cnt) {
			var i, start = end;
			this.lines.length = cnt
			for (i = start; i < cnt; i++) {
				this.lines[i] = null;
			}
		}

		if (this.GetLinesCount() === 0)
			this.defaultLineHeightMode = true;

		this.totalLinesHeight = null;
		return true;
	};

	LinesMgrKlassProto.GetLinesCount = function () {
		return this.lines.length;
	};

	LinesMgrKlassProto.IsInRange = function (lineIndex) {
		return ((lineIndex >= 0) && (lineIndex < this.GetLinesCount()));
	};

	LinesMgrKlassProto.GetNewLine = function () {
		// allocate line
		var line = lineCache.allocLine();
		if (line == null)
			line = new LineKlass(this.plugin);
		else
			line.Reset(this.plugin);

		return line;
	};

	LinesMgrKlassProto.GetLine = function (lineIndex, dontCreateLineInst) {
		if (!this.IsInRange(lineIndex))
			return;

		if ((this.lines[lineIndex] == null) && (!dontCreateLineInst)) {
			this.lines[lineIndex] = this.GetNewLine();
		}

		return this.lines[lineIndex];
	};

	LinesMgrKlassProto.AddInstToLine = function (lineIndex, inst) {
		if (inst == null)
			return;
		var line = this.GetLine(lineIndex);
		if (line == null)
			return;

		line.AddInst(inst);
	};
	LinesMgrKlassProto.RemoveInstFromLine = function (lineIndex, uid) {
		var line = this.GetLine(lineIndex, true);
		if (line == null)
			return;

		line.RemoveInst(uid);
	};
	LinesMgrKlassProto.LineHasInst = function (lineIndex, uid) {
		var line = this.GetLine(lineIndex, true);
		if (line == null)
			return;

		return line.HasInst(uid);
	};

	LinesMgrKlassProto.DestroyPinedInsts = function (lineIndex) {
		var line = this.GetLine(lineIndex, true);
		if (line == null)
			return;

		line.DestroyPinedInsts();
	};

	LinesMgrKlassProto.SetCustomData = function (lineIndex, k, v) {
		if (lineIndex != null) // set custom data in a line
		{
			var line = this.GetLine(lineIndex);
			if (line == null)
				return;

			line.SetCustomData(k, v);
		} else // set custom data in all lines
		{
			var i, cnt = this.GetLinesCount(),
				line;
			var is_clean_key = (v == null);
			for (i = 0; i < cnt; i++) {
				line = this.GetLine(i, is_clean_key);
				if (line == null)
					continue;

				line.SetCustomData(k, v);
			}
		}
	};

	LinesMgrKlassProto.GetCustomData = function (lineIndex, k) {
		var line = this.GetLine(lineIndex, true);
		if (line == null)
			return;

		return line.GetCustomData(k);
	};

	LinesMgrKlassProto.InsertLines = function (lineIndex, content) {
		var cnt = content.length;

		if (lineIndex < 0)
			lineIndex = 0;
		else if (lineIndex > this.GetLinesCount())
			lineIndex = this.GetLinesCount();

		this.lines.length += cnt;
		var start = this.GetLinesCount() - 1;
		var end = lineIndex + cnt;
		var i, insertLine, newLine;
		for (i = start; i >= lineIndex; i--) {
			if (i >= end) // shift line down
				this.lines[i] = this.lines[i - cnt];
			else // empty space
			{
				insertLine = content[i - lineIndex];
				if (insertLine == null)
					this.lines[i] = null;
				else {
					newLine = this.GetNewLine();
					newLine.SetCustomData(insertLine);
					this.lines[i] = newLine;
				}
			}
		}

		this.totalLinesHeight = null;
	};

	LinesMgrKlassProto.RemoveLines = function (lineIndex, cnt) {
		var i, line, removedLines = [];
		removedLines.length = cnt;
		for (i = 0; i < cnt; i++) {
			line = this.GetLine(lineIndex + i, true);
			if (line) {
				// save custom data
				removedLines[i] = line.GetCustomData();

				// clean line and recycle
				line.Clean();
				lineCache.freeLine(line);
			} else {
				removedLines[i] = null;
			}
		}
		var start = lineIndex + cnt;
		var end = this.GetLinesCount() - 1;
		for (i = start; i <= end; i++) {
			this.lines[i - cnt] = this.lines[i];
		}
		this.lines.length -= cnt;

		if (this.GetLinesCount() === 0)
			this.defaultLineHeightMode = true;

		this.totalLinesHeight = null;
		return removedLines;
	};

	LinesMgrKlassProto.GetCustomDataInLines = function (lineIndex, cnt) {
		var i, line, dataInLines = [];
		dataInLines.length = cnt;
		for (i = 0; i < cnt; i++) {
			line = this.GetLine(lineIndex + i, true);
			if (line)
				dataInLines[i] = line.GetCustomData();
			else
				dataInLines[i] = null;
		}

		return dataInLines;
	};

	LinesMgrKlassProto.SetDefaultLineHeight = function (height) {
		if (this.defaultLineHeight === height)
			return false;

		this.defaultLineHeight = height;
		this.totalLinesHeight = null;
		return true;
	};

	LinesMgrKlassProto.GetLineHeight = function (lineIndex) {
		if (!this.IsInRange(lineIndex))
			return 0;

		var lineHeight;
		if (this.defaultLineHeightMode)
			lineHeight = this.defaultLineHeight;
		else {
			var line = this.GetLine(lineIndex, true);
			var deltaHeight = (line) ? line.deltaHeight : 0;
			lineHeight = this.defaultLineHeight + deltaHeight;
		}

		return lineHeight;
	};

	LinesMgrKlassProto.SetLineHeight = function (lineIndex, height) {
		if (!this.IsInRange(lineIndex))
			return;

		var curHeight = this.GetLineHeight(lineIndex);
		if (curHeight === height)
			return false;

		var deltaHeight = height - this.defaultLineHeight;
		var line = this.GetLine(lineIndex);
		var dd = deltaHeight - line.deltaHeight;
		line.deltaHeight = deltaHeight;

		if (deltaHeight !== 0)
			this.defaultLineHeightMode = false;

		if (this.totalLinesHeight !== null)
			this.totalLinesHeight += dd;

		return true;
	};

	LinesMgrKlassProto.Height2LineIndex = function (h, isCeil) {
		if (this.defaultLineHeightMode) {
			var lineIndex = h / this.defaultLineHeight;
			if (isCeil)
				lineIndex = Math.ceil(lineIndex);
			else
				lineIndex = Math.floor(lineIndex);

			return lineIndex;
		} else {
			var totalLnesNum = this.GetLinesCount();
			var remain = h,
				lineCnt = 0,
				isValidIndex;
			var line, lineHeight, lineIndex = 0;

			while (1) {
				lineHeight = this.GetLineHeight(lineIndex);
				remain -= lineHeight;

				isValidIndex = (lineIndex >= 0) && (lineIndex < totalLnesNum);
				if ((remain > 0) && isValidIndex) {
					lineIndex += 1;
				} else if (remain === 0)
					return lineIndex;
				else {
					if (isCeil) {
						var line_index_save = lineIndex;
						lineIndex += 1;
						isValidIndex = (lineIndex >= 0) && (lineIndex < totalLnesNum);

						if (!isValidIndex)
							lineIndex = line_index_save;
					}

					return lineIndex;
				}
			}
		}
	};

	LinesMgrKlassProto.LineIndex2Height = function (start, end) {
		if (this.defaultLineHeightMode)
			return (end - start + 1) * this.defaultLineHeight;
		else {
			var i, h, sum = 0;
			var allDefaultHeight = true;
			for (i = start; i <= end; i++) {
				h = this.GetLineHeight(i);
				sum += h;

				if (h !== this.defaultLineHeight)
					allDefaultHeight = false;
			}

			var all_lines = (start === 0) && (end >= (this.GetLinesCount() - 1));
			if (allDefaultHeight && all_lines)
				this.defaultLineHeightMode = true;

			return sum;
		}
	};

	LinesMgrKlassProto.GetTotalLinesHeight = function () {
		if (this.totalLinesHeight === null)
			this.totalLinesHeight = this.LineIndex2Height(0, (this.GetLinesCount() - 1));

		return this.totalLinesHeight;
	};

	LinesMgrKlassProto.saveToJSON = function () {
		var i, cnt = this.GetLinesCount();
		var savedLines = [],
			line, savedLine;
		for (i = 0; i < cnt; i++) {
			line = this.lines[i];
			savedLine = (!line) ? null : line.saveToJSON()
			savedLines.push(savedLine);
		}

		return {
			"lines": savedLines,
			"dlh": this.defaultLineHeight,
			"dlhm": this.defaultLineHeightMode,
			"tlh": this.totalLinesHeight,
		};
	};

	LinesMgrKlassProto.afterLoad = function (o) {
		this.lines.length = 0;

		var savedLines = o["lines"];
		var i, cnt = savedLines.length;
		var savedLines = [],
			savedLine;
		for (i = 0; i < cnt; i++) {
			savedLine = savedLines[i];
			if (!savedLine)
				this.lines.push(null);
			else {
				var newLine = this.GetNewLine();
				newLine.afterLoad(savedLine);
				this.lines.push(newLine);
			}
		}

		this.defaultLineHeight = o["dlh"];
		this.defaultLineHeightMode = o["dlhm"];
		this.totalLinesHeight = o["tlh"];
	};
	// LinesMgr

	// Line
	var LineKlass = function (plugin) {
		this.pinedInsts = {};
		this.customData = {};

		this.Reset(plugin);
	};
	var LineKlassProto = LineKlass.prototype;

	LineKlassProto.Reset = function (plugin) {
		this.plugin = plugin;
		this.tlx = 0;
		this.tly = 0;
		this.offsety = 0;
		this.deltaHeight = 0;
	};

	LineKlassProto.SetTLXY = function (tlx, tly) {
		this.tlx = tlx;
		this.tly = tly;
	};

	LineKlassProto.AddInst = function (inst) {
		var uid = inst.uid;
		if (!this.pinedInsts.hasOwnProperty(uid))
			this.pinedInsts[uid] = {};

		var pinInfo = this.pinedInsts[uid];
		pinInfo["dx"] = inst.x - this.getPX();
		pinInfo["dy"] = inst.y - this.getPY();
	};
	LineKlassProto.RemoveInst = function (uid) {
		if (uid != null) {
			if (!this.pinedInsts.hasOwnProperty(uid))
				return;
			delete this.pinedInsts[uid];
		} else {
			for (var uid in this.pinedInsts)
				delete this.pinedInsts[uid];
		}
	};

	LineKlassProto.HasInst = function (uid) {
		return this.pinedInsts.hasOwnProperty(uid);
	};

	LineKlassProto.PinInsts = function () {
		var uid, inst, pinInfo, runtime = this.plugin.runtime;
		for (uid in this.pinedInsts) {
			inst = runtime.getObjectByUID(uid);
			if (!inst) {
				delete this.pinedInsts[uid];
				continue;
			}
			pinInfo = this.pinedInsts[uid];
			pin_inst(inst, pinInfo, this.getPX(), this.getPY());
		}
	};

	LineKlassProto.GetPinInstsUID = function () {
		return this.pinedInsts;
	};


	LineKlassProto.getPX = function () {
		return (this.plugin.verticalScrollingMode) ? this.tlx : this.tly;
	};

	LineKlassProto.getPY = function () {
		return (this.plugin.verticalScrollingMode) ? this.tly : this.tlx;
	};

	var pin_inst = function (inst, pinInfo, refX, refY) {
		var newX = refX + pinInfo["dx"];
		var newY = refY + pinInfo["dy"];

		if ((newX != inst.x) || (newY != inst.y)) {
			inst.x = newX;
			inst.y = newY;
			inst.set_bbox_changed();
		}
	};

	LineKlassProto.DestroyPinedInsts = function () {
		var uid, inst, runtime = this.plugin.runtime;
		for (uid in this.pinedInsts) {
			inst = runtime.getObjectByUID(uid);
			if (!inst)
				continue;

			Object.getPrototypeOf(inst.type.plugin).acts.Destroy.call(inst);
			//runtime.DestroyInstance(inst);

			delete this.pinedInsts[uid];
		}
	};

	LineKlassProto.SetCustomData = function (k, v) {
		var isChanged;
		if (typeof (k) != "object") // single key
		{
			if (v != null) {
				isChanged = (this.customData[k] !== v);
				this.customData[k] = v;
			} else if (this.customData.hasOwnProperty(k)) // v == null: clean key
			{
				delete this.customData[k];
				isChanged = true;
			}
		} else if (k === null) // clean all
		{
			for (var n in this.customData) {
				delete this.customData[n];
			}

			isChanged = true;
		} else // copy all
		{
			var d = k;
			for (var k in d) {
				isChanged = (this.customData[k] !== d[k]);
				this.customData[k] = d[k];
			}
		}
	};

	LineKlassProto.GetCustomData = function (k) {
		if (k != null) // single key
			return this.customData[k];
		else // copy all
		{
			var d = {};
			for (k in this.customData)
				d[k] = this.customData[k];

			return d;
		}
	};

	LineKlassProto.Clean = function () {
		this.DestroyPinedInsts();
		for (var k in this.customData)
			delete this.customData[k];
	};

	LineKlassProto.saveToJSON = function () {
		return {
			"insts": this.pinedInsts,
			"data": this.customData,
			"tlx": this.tlx,
			"tly": this.tly,
			"offsety": this.offsety,
			"dh": this.deltaHeight,
		};
	};

	LineKlassProto.afterLoad = function (o) {
		this.pinedInsts = o["insts"];
		this.customData = o["data"];
		this.tlx = o["tlx"];
		this.tly = o["tly"];
		this.offsety = o["offsety"];
		this.deltaHeight = o["dh"];
	};
	// Line
}());