// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_MiniBoard = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var pluginProto = cr.plugins_.Rex_MiniBoard.prototype;

	pluginProto.onCreate = function () {
		pluginProto.acts.Destroy = function () {
			this.runtime.DestroyInstance(this);

			// destroy all chess instances in this miniboard
			var uid, inst;
			var items = this.GetAllChess();
			for (uid in items) {
				inst = this.uid2inst(uid);
				if (inst == null)
					continue;
				this.runtime.DestroyInstance(inst);
			}
			this.ResetBoard();
		};
	};
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function (plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function () {
		this.layout = null;
		this.layoutUid = -1;
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function (type) {
		this.type = type;
		this.runtime = type.runtime;
	};

	var instanceProto = pluginProto.Instance.prototype;

	var GINSTGROUP;
	var _uids = []; // private global object
	instanceProto.onCreate = function () {
		this.check_name = "BOARD";
		this.board = new window.RexC2BoardKlass();
		this.is_pin_mode = (this.properties[1] === 1);
		this.pre_POX = this.x;
		this.pre_POY = this.y;
		this.is_putting_request_accepted = false;

		// mainboard ref
		if (!this.recycled) {
			this.mainboard = new MainboardRefKlass(this.runtime);
			this.mainboard_last = new MainboardRefKlass(this.runtime);
		}

		this.ResetBoard();

		if (!this.recycled) {
			this.myDestroyCallback = (function (self) {
				return function (inst) {
					self.onInstanceDestroyed(inst);
				};
			})(this);
		}

		this.runtime.addDestroyCallback(this.myDestroyCallback);
		this.runtime.tick2Me(this);

		this.exp_RequestLX = (-1);
		this.exp_RequestLY = (-1);
		this.exp_RequestLZ = (-1);
		this.exp_RequestChessUID = (-1);
		this.exp_RequestMainBoardUID = (-1);
		this.is_putable = 0;
		this._kicked_chess_uid = -1;

	};

	instanceProto.GetLayout = function () {
		if (this.type.layout != null)
			return this.type.layout;

		var plugins = this.runtime.types;
		var name, inst;
		for (name in plugins) {
			inst = plugins[name].instances[0];

			if ((cr.plugins_.Rex_SLGSquareTx && (inst instanceof cr.plugins_.Rex_SLGSquareTx.prototype.Instance)) ||
				(cr.plugins_.Rex_SLGHexTx && (inst instanceof cr.plugins_.Rex_SLGHexTx.prototype.Instance)) ||
				(cr.plugins_.Rex_ProjectionTx && (inst instanceof cr.plugins_.Rex_ProjectionTx.prototype.Instance)) ||
				(cr.plugins_.Rex_SLGCubeTx && (inst instanceof cr.plugins_.Rex_SLGCubeTx.prototype.Instance))
			) {
				this.type.layout = inst;
				return this.type.layout;
			}
		}
		assert2(this.type.layout, "Mini board: Can not find layout oject.");
		return null;
	};

	instanceProto.ResetBoard = function () {
		this.board.Reset();
		this.mainboard.Reset();
		this.mainboard_last.Reset();
		this.uid2pdxy = {};
	};

	instanceProto.mainboard_ref_set = function (inst, lx, ly) {
		this.mainboard.SetBoard(inst, lx, ly);
		if (inst != null) {
			this.mainboard_last.SetBoard(inst, lx, ly);
		}
	};

	instanceProto.onInstanceDestroyed = function (inst) {
		this.RemoveChess(inst.uid);

		// remove board instance
		if (this.mainboard.inst === inst) {
			this.mainboard.SetBoard(null);
			this.mainboard_last.SetBoard(null);
		}
	};

	instanceProto.onDestroy = function () {
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	instanceProto.chess_pin = function () {
		var POX = this.x,
			POY = this.y;
		if ((POX == this.pre_POX) && (POY == this.pre_POY))
			return;

		var uid, inst, pdxy;
		var items = this.GetAllChess();
		for (uid in items) {
			inst = this.uid2inst(uid);
			if (inst == null)
				continue;
			pdxy = this.uid2pdxy[uid];
			inst.x = POX + pdxy.x;
			inst.y = POY + pdxy.y;
			inst.set_bbox_changed();
		}
		this.pre_POX = POX;
		this.pre_POY = POY;
	};

	instanceProto.AddUID2pdxy = function (inst) {
		var uid = inst.uid;
		if (!this.uid2pdxy.hasOwnProperty(uid)) {
			this.uid2pdxy[uid] = {
				x: 0,
				y: 0
			};
		}

		this.uid2pdxy[uid].x = inst.x - this.x;
		this.uid2pdxy[uid].y = inst.y - this.y;
	};

	instanceProto.tick2 = function () {
		if (this.is_pin_mode)
			this.chess_pin(); // pin
	};

	instanceProto.draw = function (ctx) {};

	instanceProto.drawGL = function (glw) {};

	instanceProto.GetAllChess = function () {
		return this.board.GetAllChess();
	};

	instanceProto.xyz2uid = function (x, y, z) {
		return this.board.GetCell(x, y, z) || null;
	};

	instanceProto.uid2xyz = function (uid) {
		return this.GetAllChess()[uid] || null;
	};

	instanceProto.uid2inst = function (uid) {
		uid = parseInt(uid);
		if (typeof (uid) !== "number")
			return null;
		else if (uid < 0)
			return null;
		else if (this.uid2xyz(uid) == null) // not on the board
			return null;
		else
			return this.runtime.getObjectByUID(uid);
	};

	instanceProto.RemoveChess = function (uid, kicking_notify) {
		if (uid == null)
			return;

		var _xyz = this.uid2xyz(uid);
		if (_xyz == null)
			return;

		var inst = this.uid2inst(uid);
		if (kicking_notify && inst) {
			getExtraInfo(inst)["minb_uid"] = null;
			this._kicked_chess_uid = uid;
			this.runtime.trigger(cr.plugins_.Rex_SLGBoard.prototype.cnds.OnChessKicked, this);
		}

		this.board.RemoveCell(uid);
		delete this.uid2pdxy[uid];
	};

	var getExtraInfo = function (inst) {
		if (!inst.extra.hasOwnProperty("rex_minb"))
			inst.extra["rex_minb"] = {};
		return inst.extra["rex_minb"];
	};

	instanceProto.AddChess = function (inst, x, y, z) {
		if (inst == null)
			return;

		// "inst" could be instance(object) or uid(number) or ?(string)
		var instIsInstType = (typeof (inst) === "object");
		var uid = (instIsInstType) ? inst.uid : inst;

		this.RemoveChess(uid); // keep unique uid (symbol)            
		this.RemoveChess(this.xyz2uid(x, y, z), true);
		this.board.AddCell(uid, x, y, z);

		// try get inst from uid
		inst = this.uid2inst(uid);
		if (inst) {
			getExtraInfo(inst)["minb_uid"] = this.uid;
			this.AddUID2pdxy(inst);
		}
	};

	instanceProto.CreateChess = function (obj_type, lx, ly, lz, layer) {
		var layout = this.GetLayout();
		if ((obj_type == null) || (layout == null))
			return;

		var pox_save = layout.GetPOX();
		var poy_save = layout.GetPOY();
		layout.SetPOX(this.x);
		layout.SetPOY(this.y);

		// callback
		var self = this;
		var __callback = function (inst) {
			self.AddChess(inst, lx, ly, lz);
		}
		// callback          
		var inst = window.RexC2CreateObject.call(this, obj_type, layer,
			layout.LXYZ2PX(lx, ly, lz),
			layout.LXYZ2PY(lx, ly, lz),
			__callback);


		layout.SetPOX(pox_save);
		layout.SetPOY(poy_save);
		return inst;
	};

	instanceProto.CellIsInside = function (board_inst, chess_uid, lx, ly, lz) {
		return board_inst.IsInsideBoard(lx, ly);
	};

	instanceProto.CellIsEmpty = function (board_inst, chess_uid, lx, ly, lz) {
		if (!board_inst.IsInsideBoard(lx, ly))
			return false;

		return board_inst.IsEmpty(lx, ly, lz);
	};

	instanceProto.CellIsPutable = function (board_inst, chess_uid, lx, ly, lz) {
		if (!board_inst.IsInsideBoard(lx, ly))
			return false;

		this.is_putable = false;
		this.exp_RequestChessUID = chess_uid;
		this.exp_RequestMainBoardUID = board_inst.uid;
		this.exp_RequestLX = lx;
		this.exp_RequestLY = ly
		this.exp_RequestLZ = lz;
		this.runtime.trigger(cr.plugins_.Rex_MiniBoard.prototype.cnds.OnPutAbleRequest, this);

		return this.is_putable;
	};

	// export
	instanceProto.CellCanPut = function (board_inst, chess_uid, lx, ly, lz, test_mode) {
		// uid is not a symbol
		if (!isNaN(chess_uid))
			chess_uid = parseInt(chess_uid);

		var cell_can_put;
		switch (test_mode) {
			case 0:
				cell_can_put = true;
				break;
			case 1:
				cell_can_put = this.CellIsInside(board_inst, chess_uid, lx, ly, lz);
				break;
			case 2:
				cell_can_put = this.CellIsEmpty(board_inst, chess_uid, lx, ly, lz);
				break;
			case 3:
				cell_can_put = this.CellIsPutable(board_inst, chess_uid, lx, ly, lz);
				break;
			default:
				cell_can_put = this.CellIsEmpty(board_inst, chess_uid, lx, ly, lz);
				break;
		}
		return cell_can_put;
	};

	instanceProto.CanPut = function (board_inst, offset_lx, offset_ly, test_mode) {
		if (board_inst == null)
			return false;

		if (test_mode == 0)
			return true;

		var layout = board_inst.GetLayout();
		var uid, xyz, lx, ly, lz;
		var items = this.GetAllChess();
		for (uid in items) {
			xyz = this.uid2xyz(uid);
			lx = layout.OffsetLX(xyz.x, xyz.y, xyz.z, offset_lx, offset_ly, 0);
			ly = layout.OffsetLY(xyz.x, xyz.y, xyz.z, offset_lx, offset_ly, 0);
			lz = xyz.z;

			if (!this.CellCanPut(board_inst, uid, lx, ly, lz, test_mode))
				return false;
		}
		return true;
	};

	instanceProto.PutChess = function (board_inst, offset_lx, offset_ly,
		test_mode, is_pos_set, is_put_test,
		ignore_put_request) {
		if (!board_inst)
			return;

		this.PullOutChess();

		var is_success = this.CanPut(board_inst, offset_lx, offset_ly, test_mode);
		if (is_success && (!is_put_test)) {
			// put on main board logically
			this.mainboard_ref_set(board_inst, offset_lx, offset_ly);

			var uid, xyz, inst;
			var layout = board_inst.GetLayout();
			var items = this.GetAllChess();
			for (uid in items) {
				xyz = this.uid2xyz(uid);

				// uid is not a symbol
				if (!isNaN(uid))
					uid = parseInt(uid);

				board_inst.AddChess(uid,
					layout.OffsetLX(xyz.x, xyz.y, xyz.z, offset_lx, offset_ly, 0),
					layout.OffsetLY(xyz.x, xyz.y, xyz.z, offset_lx, offset_ly, 0),
					xyz.z);
			}

			// put on main board physically
			if (is_pos_set) {
				var mainboard_layout = board_inst.GetLayout();
				this.x = mainboard_layout.LXYZ2PX(offset_lx, offset_ly, 0);
				this.y = mainboard_layout.LXYZ2PY(offset_lx, offset_ly, 0);
				this.chess_pin();
			}
		}
		if (ignore_put_request !== true)
			this.do_putting_request(is_success);
		return is_success;
	};

	instanceProto.do_putting_request = function (can_put) {
		this.is_putting_request_accepted = can_put;
		var trig = (can_put) ? cr.plugins_.Rex_MiniBoard.prototype.cnds.OnPuttingRequestAccepted :
			cr.plugins_.Rex_MiniBoard.prototype.cnds.OnPuttingRequestRejected;
		this.runtime.trigger(trig, this);
	};

	instanceProto.PullOutChess = function () {
		var mainboard = this.mainboard.inst;
		if (mainboard == null)
			return;

		var uid;
		var items = this.GetAllChess();
		for (uid in items) {
			// uid is not a symbol
			if (!isNaN(uid))
				uid = parseInt(uid);

			mainboard.RemoveChess(uid);
		}

		this.mainboard_ref_set(null);
	};

	// transfer miniboard 
	instanceProto.TransferMiniboard = function (options) {
		var miniboard = this.inst;
		var is_on_mainboard = (this.mainboard.inst != null);
		if (!is_on_mainboard)
			options.checkMode = null;

		if (is_on_mainboard) {
			this.PullOutChess();
		}

		var new_items = this.DoLogicalTransfer(options);
		var is_success = (new_items != null);
		if (is_success && (!options.isTest)) {
			this.board.ResetCells(new_items);
			if (options.isSetPosition)
				this.ChessPositionReset();
		}

		if (is_on_mainboard) {
			this.PutChess(this.mainboard_last.inst, // board_inst
				this.mainboard_last.LOX, // offset_lx
				this.mainboard_last.LOY, // offset_ly
				false, // test_mode
				null, // is_pos_set
				null, // is_put_test
				true // ignore_put_request	    
			);
		}
		if (!options.isTest) {
			if (is_success)
				options.onAccepted();
			else
				options.onRejected();
		}

		return is_success;
	};

	instanceProto.ChessPositionReset = function () {
		var layout = this.GetLayout();
		var pox_save = layout.GetPOX();
		var poy_save = layout.GetPOY();
		layout.SetPOX(this.x);
		layout.SetPOY(this.y);
		var _uid, xyz, chess_inst;
		var items = this.GetAllChess();
		for (_uid in items) {
			var uid = parseInt(_uid);
			chess_inst = this.uid2inst(uid);
			if (chess_inst == null)
				continue;
			xyz = this.uid2xyz(uid);
			chess_inst.x = layout.LXYZ2PX(xyz.x, xyz.y, xyz.z);
			chess_inst.y = layout.LXYZ2PY(xyz.x, xyz.y, xyz.z);
			chess_inst.set_bbox_changed();
			this.AddUID2pdxy(chess_inst);
		}
		layout.SetPOX(pox_save);
		layout.SetPOY(poy_save);
	};

	instanceProto.DoLogicalTransfer = function (options) {
		var layout = this.GetLayout();
		var mainboard = this.mainboard_last;

		var uid, new_xyz, new_items = {};
		var lx, ly, lz;
		// rotate items to new_items  
		var items = this.GetAllChess();
		for (uid in items) {
			new_xyz = options.onTransferCell(this.uid2xyz(uid), options);

			if (options.checkMode != null) {
				lx = layout.OffsetLX(new_xyz.x, new_xyz.y, 0, mainboard.LOX, mainboard.LOY, 0);
				ly = layout.OffsetLY(new_xyz.x, new_xyz.y, 0, mainboard.LOX, mainboard.LOY, 0);
				lz = new_xyz.z;

				if (!this.CellCanPut(mainboard.inst, uid, lx, ly, lz, options.checkMode)) {
					window.RexC2BoardLXYZCache.freeLinesInDict(new_items);
					return null;
				}
			}
			new_items[uid] = new_xyz;
		}
		return new_items;
	};
	// transfer miniboard		

	instanceProto.PickUIDs = function (uids, chess_type, ignored_chess_check) {
		var check_callback;
		if (!ignored_chess_check) {
			var self = this;
			check_callback = function (uid) {
				return (self.uid2xyz(uid) != null);
			}
		}
		return window.RexC2PickUIDs.call(this, uids, chess_type, check_callback);
	};

	var name2type = {}; // private global object
	instanceProto.PickAllInsts = function () {
		var uid, inst, objtype, sol;
		cleanTable(name2type);
		var has_inst = false;
		var items = this.GetAllChess();
		for (uid in items) {
			inst = this.uid2inst(uid);
			if (inst == null)
				continue;
			objtype = inst.type;
			sol = objtype.getCurrentSol();
			if (!name2type.hasOwnProperty(objtype.name)) {
				sol.select_all = false;
				sol.instances.length = 0;
				name2type[objtype.name] = true;
			}
			sol.instances.push(inst);
			has_inst = true;
		}
		cleanTable(name2type);
		return has_inst;
	};

	instanceProto.PickChess = function (chess_type) {
		_uids.length = 0;
		var uid;
		var items = this.GetAllChess();
		for (uid in items) {
			_uids.push(parseInt(uid));
		}
		var has_inst = this.PickUIDs(_uids, chess_type);
		_uids.length = 0;
		return has_inst;
	};

	var cleanTable = function (o) {
		for (var k in o)
			delete o[k];
	};

	var isEmptyTable = function (o) {
		for (var k in o)
			return false;

		return true;
	};

	instanceProto.saveToJSON = function () {
		// wrap: copy from this.uid2pdxy
		var uid2pdxy_save = {};
		for (uid in this.uid2pdxy) {
			uid2pdxy_save[uid] = {};
			uid2pdxy_save[uid]["x"] = this.uid2pdxy[uid].x;
			uid2pdxy_save[uid]["y"] = this.uid2pdxy[uid].y;
		}

		return {
			"pre_x": this.pre_POX,
			"pre_y": this.pre_POY,
			"b": this.board.saveToJSON(),
			"uid2pdxy": uid2pdxy_save,
			"luid": (this.type.layout != null) ? this.type.layout.uid : (-1),
			"mb": this.mainboard.saveToJSON(),
			"mbl": this.mainboard_last.saveToJSON(),
			"pq": this.is_putting_request_accepted,
		};
	};

	instanceProto.loadFromJSON = function (o) {
		this.pre_POX = o["pre_x"];
		this.pre_POY = o["pre_y"];
		this.board.loadFromJSON(o["b"]);
		this.type.layoutUid = o["luid"];
		this.mainboard.loadFromJSON(o["mb"]);
		this.mainboard_last.loadFromJSON(o["mbl"]);

		// copy from this.uid2pdxy
		cleanTable(this.uid2pdxy);
		var uid2pdxy_save = o["uid2pdxy"];
		for (uid in uid2pdxy_save) {
			this.uid2pdxy[uid] = {};
			this.uid2pdxy[uid].x = uid2pdxy_save[uid]["x"];
			this.uid2pdxy[uid].y = uid2pdxy_save[uid]["y"];
		}

		this.is_putting_request_accepted = o["pq"];
	};

	instanceProto.afterLoad = function () {
		if (this.type.layoutUid === -1)
			this.type.layout = null;
		else {
			this.type.layout = this.runtime.getObjectByUID(this.type.layoutUid);
			assert2(this.type.layout, "Mini board: Failed to find layout object by UID");
		}
		this.type.layoutUid = -1;

		this.mainboard.afterLoad();
		this.mainboard_last.afterLoad();
	};

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections) {
		var items = this.GetAllChess();
		var chessUID = [];
		for (var uid in items)
			chessUID.push(parseInt(uid));

		var mainboard = this.mainboard.inst;

		propsections.push({
			"title": this.type.name,
			"properties": [{
					"name": "Chess",
					"value": JSON.stringify(chessUID)
				},
				{
					"name": "Mainboard",
					"value": (mainboard) ? mainboard.uid : -1
				}
			]
		});
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.CanPut = function (board_objs, offset_lx, offset_ly, test_mode) {
		if (!board_objs)
			return;

		return this.CanPut(board_objs.getFirstPicked(), offset_lx, offset_ly, test_mode);
	};

	Cnds.prototype.PickAllChess = function () {
		return this.PickAllInsts();
	};

	Cnds.prototype.PickMiniboard = function (objtype) {
		if (!objtype)
			return;

		if (GINSTGROUP == null)
			GINSTGROUP = new window.RexC2GroupKlass();

		var insts = objtype.getCurrentSol().getObjects();
		var i, cnt = insts.length;
		for (i = 0; i < cnt; i++) {
			var miniboard_uid = getExtraInfo(insts[i])["minb_uid"];
			if (miniboard_uid == null)
				continue;
			GINSTGROUP.AddUID(miniboard_uid);
		}
		var miniboard_type = this.runtime.getCurrentCondition().type;
		var has_picked = window.RexC2PickUIDs.call(this, GINSTGROUP.GetList(), miniboard_type);
		GINSTGROUP.Clean();
		if (has_picked) {
			var current_frame = this.runtime.getCurrentEventStack();
			var current_event = current_frame.current_event;
			var solModifierAfterCnds = current_frame.isModifierAfterCnds();

			if (solModifierAfterCnds) {
				this.runtime.pushCopySol(current_event.solModifiers);
			}

			current_event.retrigger();

			if (solModifierAfterCnds) {
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		return false;
	};

	Cnds.prototype.IsOnTheBoard = function (board_objs) {
		if (!board_objs)
			return false;
		var board_inst = board_objs.getFirstPicked();
		return (this.mainboard.inst === board_inst);
	};

	//cf_deprecated
	Cnds.prototype.ArePutAble = function (board_objs, offset_lx, offset_ly) {};

	Cnds.prototype.OnPutAbleRequest = function () {
		return true;
	};

	Cnds.prototype.OnChessKicked = function (chess_type) {
		_uids.length = 0;
		_uids.push(this._kicked_chess_uid);
		var has_inst = this.PickUIDs(_uids, chess_type);
		_uids.length = 0;
		return has_inst;
	};

	Cnds.prototype.PickChess = function (obj_type) {
		return this.PickChess(obj_type);
	};

	//cf_deprecated
	Cnds.prototype.CanFindEmpty = function (board_objs, _start_lx, _start_ly, _range) {};

	Cnds.prototype.IsPuttingRequestAccepted = function () {
		return this.is_putting_request_accepted;
	};

	Cnds.prototype.OnPuttingRequestAccepted = function () {
		return true;
	};
	Cnds.prototype.OnPuttingRequestRejected = function () {
		return true;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.SetupLayout = function (layout_objs) {
		var layout = layout_objs.getFirstPicked();
		if (layout.check_name == "LAYOUT")
			this.type.layout = layout;
		else
			alert("Mini board should connect to a layout object");
	};

	Acts.prototype.CreateChess = function (obj_type, lx, ly, lz, layer) {
		this.CreateChess(obj_type, lx, ly, lz, layer);
	};

	Acts.prototype.PutChess = function (board_objs, offset_lx, offset_ly, is_pos_set, test_mode) {
		if (!board_objs)
			return;

		this.PutChess(board_objs.getFirstPicked(), // board_inst
			offset_lx, // offset_lx
			offset_ly, // offset_ly
			test_mode, // test_mode
			is_pos_set, // is_pos_set
			false // is_put_test
			// ignore_put_request
		);
	};

	Acts.prototype.PullOutChess = function () {
		this.PullOutChess();
	};

	Acts.prototype.PickAllChess = function () {
		this.PickAllInsts();
	};

	Acts.prototype.ReleaseAllChess = function () {
		this.ResetBoard();
	};

	Acts.prototype.SetPutAble = function (put_able) {
		this.is_putable = (put_able === 1);
	};

	Acts.prototype.AddChess = function (obj_type, lx, ly, lz) {
		if (!obj_type)
			return;
		var inst = obj_type.getFirstPicked();
		this.AddChess(inst, lx, ly, lz);
	};

	Acts.prototype.PickChess = function (obj_type) {
		this.PickChess(obj_type);
	};


	Acts.prototype.PutBack = function (is_pos_set) {
		this.PutChess(this.mainboard_last.inst, // board_inst
			this.mainboard_last.LOX, // offset_lx
			this.mainboard_last.LOY, // offset_ly
			null, // test_mode
			is_pos_set, // is_pos_set
			false // is_put_test
			// ignore_put_request
		);
	};

	Acts.prototype.ShiftLOXY = function (pos_type) {
		var items = this.GetAllChess();
		if (isEmptyTable(items))
			return;

		var minX = this.board.GetMinX();
		var minY = this.board.GetMinY();
		var maxX = this.board.GetMaxX();
		var maxY = this.board.GetMaxY();
		var new_LOX, new_LOY;
		switch (pos_type) {
			case 0:
				new_LOX = Math.floor((maxX + minX) / 2);
				new_LOY = Math.floor((maxY + minY) / 2);
				break;
			case 1:
				new_LOX = minX;
				new_LOY = minY;
				break;
		}

		if ((new_LOX === 0) && (new_LOY === 0)) {
			return;
		}

		var layout = this.GetLayout();
		var pox_save = layout.GetPOX();
		var poy_save = layout.GetPOY();
		layout.SetPOX(this.x);
		layout.SetPOY(this.y);
		this.x = layout.LXYZ2PX(new_LOX, new_LOY);
		this.y = layout.LXYZ2PY(new_LOX, new_LOY);

		// do logic shift
		var uid, xyz;
		var chess_inst, new_lx, new_ly, new_items = {};
		for (uid in items) {
			uid = parseInt(uid);
			xyz = this.uid2xyz(uid);
			new_lx = layout.OffsetLX(xyz.x, xyz.y, xyz.z, -new_LOX, -new_LOY, 0);
			new_ly = layout.OffsetLY(xyz.x, xyz.y, xyz.z, -new_LOX, -new_LOY, 0);

			new_items[uid] = window.RexC2BoardLXYZCache.allocLine(new_lx, new_ly, xyz.z);
		};
		this.board.ResetCells(new_items);
		window.RexC2BoardLXYZCache.freeLinesInDict(new_items); // recycle

		layout.SetPOX(pox_save);
		layout.SetPOY(poy_save);
	};

	Acts.prototype.RemoveChess = function (obj_type) {
		if (!obj_type)
			return;
		var chess = obj_type.getCurrentSol().getObjects();
		var i, chess_cnt = chess.length;
		for (i = 0; i < chess_cnt; i++) {
			this.RemoveChess(chess[i].uid);
		}
	};

	Acts.prototype.MoveChessToLZ = function (obj_type, lz) {
		if (!obj_type)
			return;
		var chess = obj_type.getCurrentSol().getObjects();
		var mainboard = this.mainboard.inst;
		var i, chess_cnt = chess.length,
			chess_uid;
		for (i = 0; i < chess_cnt; i++) {
			chess_uid = chess[i].uid;
			var xyzMini = this.uid2xyz(chess_uid);
			if (xyzMini == null)
				continue;

			this.AddChess(chess_uid, xyzMini.x, xyzMini.y, lz);

			if (mainboard) {
				var lx, ly;
				var xyzMain = mainboard.uid2xyz(chess_uid);
				if (xyzMain == null) // not in main board
				{
					var layout = mainboard.GetLayout();
					var offset_lx = this.mainboard.LOX;
					var offset_ly = this.mainboard.LOY;
					lx = layout.OffsetLX(xyzMini.x, xyzMini.y, lz, offset_lx, offset_ly, 0);
					ly = layout.OffsetLY(xyzMini.x, xyzMini.y, lz, offset_lx, offset_ly, 0);
				} else {
					lx = xyzMain.x;
					ly = xyzMain.y;
				}

				mainboard.MoveChess(chess_uid, lx, ly, lz);
			}
		}
	};

	Acts.prototype.MoveToLayer = function (layerMove) {
		if (!layerMove)
			return;

		if (this.layer !== layerMove) {
			this.layer.removeFromInstanceList(this, true);

			this.layer = layerMove;
			layerMove.appendToInstanceList(this, true);

			this.runtime.redraw = true;
		}

		var uid, inst;
		var items = this.GetAllChess();
		for (uid in items) {
			inst = this.uid2inst(uid);
			if ((inst == null) ||
				(inst.layer == layerMove))
				continue;

			inst.layer.removeFromInstanceList(inst, true);

			inst.layer = layerMove;
			layerMove.appendToInstanceList(inst, true);

			inst.runtime.redraw = true;
		}
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.LX = function (ret) {
		ret.set_int(this.mainboard.LOX);
	};
	Exps.prototype.LY = function (ret) {
		ret.set_int(this.mainboard.LOY);
	};
	Exps.prototype.LastLX = function (ret) {
		ret.set_int(this.mainboard_last.LOX);
	};
	Exps.prototype.LastLY = function (ret) {
		ret.set_int(this.mainboard_last.LOY);
	};
	Exps.prototype.RequestLX = function (ret) {
		ret.set_int(this.exp_RequestLX);
	};
	Exps.prototype.RequestLY = function (ret) {
		ret.set_int(this.exp_RequestLY);
	};
	Exps.prototype.RequestLZ = function (ret) {
		ret.set_int(this.exp_RequestLZ);
	};
	Exps.prototype.RequestChessUID = function (ret) {
		ret.set_any(this.exp_RequestChessUID);
	};
	Exps.prototype.RequestMainBoardUID = function (ret) {
		ret.set_int(this.exp_RequestMainBoardUID);
	};
	//ef_deprecated
	Exps.prototype.EmptyLX = function (ret) {
		ret.set_int(0);
	};
	// ef_deprecated
	Exps.prototype.EmptyLY = function (ret) {
		ret.set_int(0);
	};

	Exps.prototype.UID2LX = function (ret, uid) {
		var xyz = this.uid2xyz(uid);
		var lx = (xyz == null) ? (-1) : xyz.x;
		ret.set_int(lx);
	};
	Exps.prototype.UID2LY = function (ret, uid) {
		var xyz = this.uid2xyz(uid);
		var ly = (xyz == null) ? (-1) : xyz.y;
		ret.set_int(ly);
	};
	Exps.prototype.UID2LZ = function (ret, uid) {
		var xyz = this.uid2xyz(uid);
		var lz = (xyz == null) ? (-1) : xyz.z;
		ret.set_int(lz);
	};

	Exps.prototype.UID2PX = function (ret, uid) {
		var xyz = this.uid2xyz(uid);
		var px;
		if (xyz == null)
			px = -1;
		else {
			var layout = this.GetLayout();
			var pox_save = layout.GetPOX();
			var poy_save = layout.GetPOY();
			layout.SetPOX(this.x);
			layout.SetPOY(this.y);
			px = this.GetLayout().LXYZ2PX(xyz.x, xyz.y, xyz.z);
			layout.SetPOX(pox_save);
			layout.SetPOY(poy_save);
		}
		ret.set_float(px);
	};
	Exps.prototype.UID2PY = function (ret, uid) {
		var xyz = this.uid2xyz(uid);
		var py;
		if (xyz == null)
			py = -1;
		else {
			var layout = this.GetLayout();
			var pox_save = layout.GetPOX();
			var poy_save = layout.GetPOY();
			layout.SetPOX(this.x);
			layout.SetPOY(this.y);
			py = this.GetLayout().LXYZ2PY(xyz.x, xyz.y, xyz.z);
			layout.SetPOX(pox_save);
			layout.SetPOY(poy_save);
		}
		ret.set_float(py);
	};

	Exps.prototype.MaxLX = function (ret) {
		ret.set_int(this.board.GetMaxX() || 0);
	};

	Exps.prototype.MaxLY = function (ret) {
		ret.set_int(this.board.GetMaxY() || 0);
	};

	Exps.prototype.MinLX = function (ret) {
		ret.set_int(this.board.GetMinX() || 0);
	};

	Exps.prototype.MinLY = function (ret) {
		ret.set_int(this.board.GetMinY() || 0);
	};


	// --------    
	var MainboardRefKlass = function (runtime) {
		this.runtime = runtime;
		this.Reset();
	}
	var MainboardRefKlassProto = MainboardRefKlass.prototype;

	MainboardRefKlassProto.Reset = function () {
		this.inst = null;
		this.LOX = (-1);
		this.LOY = (-1);
		this.saveUID = (-1); // for loading	   
	};
	MainboardRefKlassProto.SetBoard = function (inst, lx, ly) {
		this.inst = inst;
		this.LOX = (inst == null) ? (-1) : lx;
		this.LOY = (inst == null) ? (-1) : ly;
	};
	MainboardRefKlassProto.saveToJSON = function () {
		return {
			"uid": (this.inst == null) ? (-1) : this.inst.uid,
			"LOX": this.LOX,
			"LOY": this.LOY
		};
	};
	MainboardRefKlassProto.loadFromJSON = function (o) {
		this.LOX = o["LOX"];
		this.LOY = o["LOY"];
		this.saveUID = o["uid"];
	};
	MainboardRefKlassProto.afterLoad = function () {
		if (this.saveUID === -1)
			this.inst = null;
		else {
			this.inst = this.runtime.getObjectByUID(this.saveUID);
			assert2(this.inst, "Mini board: Failed to find main board object by UID");
		}
		this.saveUID = -1;
	};

	// export
	cr.plugins_.Rex_MiniBoard.MainboardRefKlass = MainboardRefKlass;
}());


(function () {
	// class of board
	if (window.RexC2BoardKlass != null)
		return;

	var BoardKlass = function () {
		this.xyz2uid = {};
		this.uid2xyz = {};
		this.x_max = null;
		this.y_max = null;
		this.x_min = null;
		this.y_min = null;
	};
	var BoardKlassProto = BoardKlass.prototype;

	BoardKlassProto.Reset = function (ignore_recycle) {
		this.xyz2uid = {};
		window.RexC2BoardLXYZCache.freeLinesInDict(this.uid2xyz);

		this.x_max = null;
		this.y_max = null;
		this.x_min = null;
		this.y_min = null;
	};

	BoardKlassProto.GetAllChess = function () {
		return this.uid2xyz;
	};

	BoardKlassProto.AddCell = function (uid, x, y, z) {
		if (arguments.length == 2) {
			var xyz = x;
			x = xyz.x;
			y = xyz.y;
			z = xyz.z;
		}

		// xyz
		if (!this.xyz2uid.hasOwnProperty(x))
			this.xyz2uid[x] = {};
		var tmpx = this.xyz2uid[x];
		if (!tmpx.hasOwnProperty(y))
			tmpx[y] = {};
		var tmpy = tmpx[y];
		tmpy[z] = uid;

		// uid
		this.uid2xyz[uid] = window.RexC2BoardLXYZCache.allocLine(x, y, z);

		this.x_max = null;
		this.y_max = null;
		this.x_min = null;
		this.y_min = null;
	};

	BoardKlassProto.GetCell = function (x, y, z) {
		// (x,y,z) -> uid
		// (x,y) -> zHash = {z:uid}
		var tmp = this.xyz2uid[x];
		if (tmp != null) {
			tmp = tmp[y];
			if (z == null)
				return tmp;
			else if (tmp != null)
				return tmp[z];
		}
		return null;
	};

	BoardKlassProto.RemoveCell = function (x, y, z) {
		var uid, xyz;
		// board.RemoveCell(uid)        
		if (arguments.length === 1) {
			uid = x;
			xyz = this.uid2xyz[uid];
			if (!xyz)
				return;
			x = xyz.x, y = xyz.y, z = xyz.z;
		}
		// board.RemoveCell(x,y,z)               
		else if (arguments.length === 3) {
			uid = this.GetCell(x, y, z);
			if (uid == null)
				return;

			xyz = this.uid2xyz[uid];
		} else
			return;

		// xyz
		if (!this.xyz2uid.hasOwnProperty(x))
			return;
		var tmpx = this.xyz2uid[x];
		if (!tmpx.hasOwnProperty(y))
			return;
		var tmpy = tmpx[y];
		if (!tmpy.hasOwnProperty(z))
			return;

		delete tmpy[z];
		if (isEmptyTable(tmpy))
			delete tmpx[y];
		if (isEmptyTable(tmpx))
			delete this.xyz2uid[x];

		// uid
		delete this.uid2xyz[uid];
		window.RexC2BoardLXYZCache.freeLine(xyz);

		this.x_max = null;
		this.y_max = null;
		this.x_min = null;
		this.y_min = null;
	};

	var isEmptyTable = function (o) {
		for (var k in o)
			return false;

		return true;
	};

	BoardKlassProto.ResetCells = function (uid2xyz) {
		this.Reset();
		var uid, xyz;
		for (uid in uid2xyz) {
			xyz = uid2xyz[uid];
			this.AddCell(parseInt(uid), xyz.x, xyz.y, xyz.z);
		}
	};

	BoardKlassProto.GetMaxX = function () {
		if (this.x_max === null) {
			var uid, xyz;
			for (uid in this.uid2xyz) {
				xyz = this.uid2xyz[uid];
				if ((this.x_max === null) || (this.x_max < xyz.x))
					this.x_max = xyz.x;
			}
		}

		return this.x_max;
	};

	BoardKlassProto.GetMaxY = function () {
		if (this.y_max === null) {
			var uid, xyz;
			for (uid in this.uid2xyz) {
				xyz = this.uid2xyz[uid];
				if ((this.y_max === null) || (this.y_max < xyz.y))
					this.y_max = xyz.y;
			}
		}

		return this.y_max;
	};

	BoardKlassProto.GetMinX = function () {
		if (this.x_min === null) {
			var uid, xyz;
			for (uid in this.uid2xyz) {
				xyz = this.uid2xyz[uid];
				if ((this.x_min === null) || (this.x_min > xyz.x))
					this.x_min = xyz.x;
			}
		}

		return this.x_min;
	};

	BoardKlassProto.GetMinY = function () {
		if (this.y_min === null) {
			var uid, xyz;
			for (uid in this.uid2xyz) {
				xyz = this.uid2xyz[uid];
				if ((this.y_min === null) || (this.y_min > xyz.y))
					this.y_min = xyz.y;
			}
		}

		return this.y_min;
	};


	BoardKlassProto.saveToJSON = function () {
		// wrap: copy from this.items
		var uid, uid2xyz = {},
			xyz;
		for (uid in this.uid2xyz) {
			uid2xyz[uid] = {};
			xyz = this.uid2xyz[uid];
			uid2xyz[uid]["x"] = xyz.x;
			uid2xyz[uid]["y"] = xyz.y;
			uid2xyz[uid]["z"] = xyz.z;
		}
		return {
			"xyz2uid": this.xyz2uid,
			"uid2xyz": uid2xyz
		};
	};

	BoardKlassProto.loadFromJSON = function (o) {
		this.xyz2uid = o["xyz2uid"];

		window.RexC2BoardLXYZCache.freeLinesInDict(this.uid2xyz);
		var uid, uid2xyz = o["uid2xyz"],
			xyz;
		for (uid in uid2xyz) {
			xyz = uid2xyz[uid];
			this.uid2xyz[uid] = window.RexC2BoardLXYZCache.allocLine(xyz["x"], xyz["y"], xyz["z"]);
		}
	};

	window.RexC2BoardKlass = BoardKlass;

}());


(function () {
	// general pick instances function
	if (window.RexC2PickUIDs != null)
		return;

	var _uidmap = {};
	var PickUIDs = function (uids, objtype, checkCb) {
		var sol = objtype.getCurrentSol();
		sol.instances.length = 0;
		sol.select_all = false;
		var isFamily = objtype.is_family;
		var members, memberCnt, i;
		if (isFamily) {
			members = objtype.members;
			memberCnt = members.length;
		}
		var i, j, uid_cnt = uids.length;
		for (i = 0; i < uid_cnt; i++) {
			var uid = uids[i];
			if (uid == null)
				continue;

			if (_uidmap.hasOwnProperty(uid))
				continue;
			_uidmap[uid] = true;

			var inst = this.runtime.getObjectByUID(uid);
			if (inst == null)
				continue;
			if ((checkCb != null) && (!checkCb(uid)))
				continue;

			var typeName = inst.type.name;
			if (isFamily) {
				for (j = 0; j < memberCnt; j++) {
					if (typeName == members[j].name) {
						sol.instances.push(inst);
						break;
					}
				}
			} else {
				if (typeName == objtype.name) {
					sol.instances.push(inst);
				}
			}
		}
		objtype.applySolToContainer();

		for (var k in _uidmap)
			delete _uidmap[k];

		return (sol.instances.length > 0);
	};

	window.RexC2PickUIDs = PickUIDs;
}());

(function () {
	// general group class
	if (window.RexC2GroupKlass != null)
		return;

	var GroupKlass = function () {
		this._set = {};
		this._list = [];
	};
	var GroupKlassProto = GroupKlass.prototype;

	GroupKlassProto.Clean = function () {
		var key;
		for (key in this._set)
			delete this._set[key];
		this._list.length = 0;
		return this;
	};

	GroupKlassProto.Copy = function (group) {
		var key, table;
		table = this._set;
		for (key in table)
			delete this._set[key];
		table = group._set;
		for (key in table)
			this._set[key] = table[key];
		cr.shallowAssignArray(this._list, group._list);
		return this;
	};

	GroupKlassProto.SetByUIDList = function (uidList, can_repeat) {
		if (can_repeat) // special case
		{
			cr.shallowAssignArray(this._list, uidList);
			var listLen = uidList.length;
			var i, key, table;
			table = this._set;
			for (key in table)
				delete this._set[key];
			for (i = 0; i < listLen; i++)
				this._set[uidList[i]] = true;
		} else {
			this.Clean();
			this.AddUID(uidList);
		}
		return this;
	};

	GroupKlassProto.AddUID = function (_uid) // single number, number list
	{
		if (typeof (_uid) === "object") // uid list      
		{
			var i, uid, cnt = _uid.length;
			for (i = 0; i < cnt; i++) {
				uid = _uid[i];
				if (this._set[uid] == null) // not in group
				{
					this._set[uid] = true;
					this._list.push(uid); // push back
				}
				// else ingored 
			}
		} else // single number
		{
			if (this._set[_uid] == null) // not in group
			{
				this._set[_uid] = true;
				this._list.push(_uid); // push back
			}
			// else ingored 
		}
		return this;
	};

	GroupKlassProto.PushUID = function (_uid, isFront) // single number, number list
	{
		if (typeof (_uid) === "object") // uid list      
		{
			var i, uid, cnt = _uid.length;
			for (i = 0; i < cnt; i++) {
				uid = _uid[i];
				if (this._set[uid] == null)
					this._set[uid] = true;
				else // remove existed item in this._list
					cr.arrayRemove(this._list, this._list.indexOf(uid));
			}

			// add uid ( no repeating check )
			if (isFront)
				this._list.unshift.apply(this._list, _uid); // push front
			else
				this._list.push.apply(this._list, _uid); // push back	  

		} else // single number
		{
			if (this._set[_uid] == null)
				this._set[_uid] = true;
			else // remove existed item in this._list
				cr.arrayRemove(this._list, this._list.indexOf(_uid));


			// add uid
			if (isFront)
				this._list.unshift(_uid); // push front
			else
				this._list.push(_uid); // push back	        
		}
		return this;
	};

	GroupKlassProto.InsertUID = function (_uid, index) // single number, number list
	{
		if (typeof (_uid) === "object") // uid list             
		{
			var i, uid, cnt = _uid.length;
			for (i = 0; i < cnt; i++) {
				uid = _uid[i];
				if (this._set[uid] == null)
					this._set[uid] = true;
				else // remove existed item in this._list
					cr.arrayRemove(this._list, this._list.indexOf(uid));
			}

			// add uid ( no repeating check )
			arrayInsert(this._list, _uid, index)

		} else // single number
		{
			if (this._set[_uid] == null)
				this._set[_uid] = true;
			else // remove existed item in this._list
				cr.arrayRemove(this._list, this._list.indexOf(_uid));

			arrayInsert(this._list, _uid, index)
		}
		return this;
	};

	GroupKlassProto.RemoveUID = function (_uid) // single number, number list
	{
		if (typeof (_uid) === "object") // uid list                         
		{
			var i, uid, cnt = _uid.length;
			for (i = 0; i < cnt; i++) {
				uid = _uid[i];
				if (this._set[uid] != null) {
					delete this._set[uid];
					cr.arrayRemove(this._list, this._list.indexOf(uid));
				}
				// else ingored 
			}
		} else // single number
		{
			if (this._set[_uid] != null) {
				delete this._set[_uid];
				cr.arrayRemove(this._list, this._list.indexOf(_uid));
			}
		}
		return this;
	};

	GroupKlassProto.UID2Index = function (uid) {
		return this._list.indexOf(uid);
	};

	GroupKlassProto.Index2UID = function (index) {
		var _list = this._list;
		var uid = _list[index];
		if (uid == null)
			uid = -1;
		return uid;
	};

	GroupKlassProto.Pop = function (index) {
		var _list = this._list;
		if (index < 0)
			index = _list.length + index;

		var uid = _list[index];
		if (uid == null)
			uid = -1;
		else
			this.RemoveUID(uid);

		return uid;
	};
	GroupKlassProto.Union = function (group) {
		var uids = group._set;
		var uid;
		for (uid in uids)
			this.AddUID(parseInt(uid));
		return this;
	};

	GroupKlassProto.Complement = function (group) {
		this.RemoveUID(group._list);
		return this;
	};

	GroupKlassProto.Intersection = function (group) {
		// copy this._set
		var uid, uids = this._set;
		var flags = {};
		for (uid in uids)
			flags[uid] = true;

		// clean all
		this.Clean();

		// add intersection itme
		uids = group._set;
		for (uid in uids) {
			if (flags[uid] != null)
				this.AddUID(parseInt(uid));
		}
		return this;
	};

	GroupKlassProto.IsSubset = function (subsetGroup) {
		var subsetUIDs = subsetGroup._set;
		var uid;
		var isSubset = true;
		for (uid in subsetUIDs) {
			if (!(uid in this._set)) {
				isSubset = false;
				break;
			}
		}
		return isSubset;
	};

	GroupKlassProto.GetSet = function () {
		return this._set;
	};

	GroupKlassProto.GetList = function () {
		return this._list;
	};

	GroupKlassProto.IsInGroup = function (uid) {
		return (this._set[uid] != null);
	};

	GroupKlassProto.ToString = function () {
		return JSON.stringify(this._list);
	};

	GroupKlassProto.JSONString2Group = function (JSONString) {
		this.SetByUIDList(JSON.parse(JSONString));
	};

	GroupKlassProto.Shuffle = function (randomGen) {
		_shuffle(this._list, randomGen);
	};

	var _shuffle = function (arr, randomGen) {
		var i = arr.length,
			j, temp, randomValue;
		if (i == 0) return;
		while (--i) {
			randomValue = (randomGen == null) ?
				Math.random() : randomGen.random();
			j = Math.floor(randomValue * (i + 1));
			temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
	};

	var arrayInsert = function (arr, _value, index) {
		var arrLen = arr.length;
		if (index > arrLen)
			index = arrLen;
		if (typeof (_value) != "object") {
			if (index == 0)
				arr.unshift(_value);
			else if (index == arrLen)
				arr.push(_value);
			else {
				var i, last_index = arr.length;
				arr.length += 1;
				for (i = last_index; i > index; i--)
					arr[i] = arr[i - 1];
				arr[index] = _value;
			}
		} else {
			if (index == 0)
				arr.unshift.apply(arr, _value);
			else if (index == arrLen)
				arr.push.apply(arr, _value);
			else {
				var start_index = arr.length - 1;
				var end_index = index;
				var cnt = _value.length;
				arr.length += cnt;
				var i;
				for (i = start_index; i >= end_index; i--)
					arr[i + cnt] = arr[i];
				for (i = 0; i < cnt; i++)
					arr[i + index] = _value[i];
			}
		}
	};

	window.RexC2GroupKlass = GroupKlass;
}());