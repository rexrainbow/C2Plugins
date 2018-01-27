// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_board_edge = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var pluginProto = cr.plugins_.Rex_board_edge.prototype;

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
		this.ActCreateInstance = cr.system_object.prototype.acts.CreateObject;
		this.lxykey2edgeuid = {};
		this.edgeuid2lxykey = {};
		this.pinstgroup = new window.RexC2GroupKlass();
		this._kicked_edge_uid = -1;

		this.board = null;
		this.boardUid = -1; // for loading   

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

	instanceProto.onDestroy = function () {
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};

	instanceProto.onInstanceDestroyed = function (inst) {
		// auto remove uid from board array
		this.remove_edge(inst.uid);
	};

	instanceProto.GetBoard = function () {
		if (this.board != null)
			return this.board;

		var plugins = this.runtime.types;
		var name, inst;
		for (name in plugins) {
			inst = plugins[name].instances[0];

			if (cr.plugins_.Rex_SLGBoard && (inst instanceof cr.plugins_.Rex_SLGBoard.prototype.Instance)) {
				this.board = inst;
				return this.board;
			}
		}
		assert2(this.board, "SLG movement plugin: Can not find board oject.");
		return null;
	};

	instanceProto.lxy2edgeuid = function (lx0, ly0, lx1, ly1) {
		var k = lxy2key(lx0, ly0, lx1, ly1);
		var edge_uid = this.lxykey2edgeuid[k];
		return edge_uid;
	};

	instanceProto.CreateInst = function (objtype, px, py, layer) {
		// call system action: Create instance
		this.ActCreateInstance.call(
			this.runtime.system,
			objtype,
			layer,
			px,
			py
		);

		return objtype.getFirstPicked();
	};

	instanceProto.set_position_angle = function (inst, lx0, ly0, lx1, ly1) {
		var layout = this.GetBoard().GetLayout();
		var px0 = layout.LXYZ2PX(lx0, ly0, 0);
		var py0 = layout.LXYZ2PY(lx0, ly0, 0);
		var px1 = layout.LXYZ2PX(lx1, ly1, 0);
		var py1 = layout.LXYZ2PY(lx1, ly1, 0);

		inst.x = (px0 + px1) / 2;
		inst.y = (py0 + py1) / 2;
		inst.angle = layout.PXY2EdgePA(px1, py1, px0, py0);
		inst.set_bbox_changed();
	};

	var lxy2key = function (lx0, ly0, lx1, ly1) {
		var k0 = lx0.toString() + "," + ly0.toString();
		var k1 = lx1.toString() + "," + ly1.toString();
		var k;
		if (lx0 < lx1) {
			k = k0 + "," + k1;
		} else if (lx0 == lx1) {
			if (ly0 < ly1) {
				k = k0 + "," + k1;
			} else {
				k = k1 + "," + k0;
			}
		} else {
			k = k1 + "," + k0;
		}

		return k;
	};

	var key2lxy = function (k) {
		var lxy = k.split(",");
		lxy[0] = parseInt(lxy[0]);
		lxy[1] = parseInt(lxy[1]);
		lxy[2] = parseInt(lxy[2]);
		lxy[3] = parseInt(lxy[3]);
		return lxy;
	};

	instanceProto.remove_edge = function (edge_uid, kicking_notify) {
		if (edge_uid == null)
			return false;
		var k = this.edgeuid2lxykey[edge_uid];
		if (k == null)
			return false;

		if (kicking_notify) {
			this._kicked_edge_uid = edge_uid;
			this.runtime.trigger(cr.plugins_.Rex_board_edge.prototype.cnds.OnEdgeKicked, this);
		}

		delete this.lxykey2edgeuid[k];
		delete this.edgeuid2lxykey[edge_uid];
		return true;
	};

	instanceProto.add_edge = function (edge_uid, lx0, ly0, lx1, ly1) {
		this.remove_edge(edge_uid);
		var k = lxy2key(lx0, ly0, lx1, ly1);
		this.remove_edge(this.lxykey2edgeuid[k], true);
		this.lxykey2edgeuid[k] = edge_uid;
		this.edgeuid2lxykey[edge_uid] = k;
	};

	instanceProto.PickUIDs = function (group, objtype) {
		var has_picked = this.GetBoard().PickUIDs(group.GetList(), objtype, true);
		group.Clean();
		return has_picked;
	};

	instanceProto.CreateEdgeBetweenLP = function (edge_objtype, lx0, ly0, lx1, ly1, layer) {
		if (!edge_objtype)
			return;
		if (this.GetBoard().xy2NeighborDir(lx0, ly0, lx1, ly1) == null) // not neighbor
		{
			this.PickUIDs(this.pinstgroup, edge_objtype);
			return;
		}

		// callback
		var self = this;
		var __callback = function (inst) {
			self.add_edge(inst.uid, lx0, ly0, lx1, ly1);
			self.set_position_angle(inst, lx0, ly0, lx1, ly1);
		}
		// callback

		var edge_inst = window.RexC2CreateObject.call(this, edge_objtype, layer, 0, 0, __callback);
		return edge_inst;
	};

	instanceProto.PickAllEdges = function (edge_objtype) {
		if (!edge_objtype)
			return false;

		var uid;
		for (uid in this.edgeuid2lxykey) {
			this.pinstgroup.AddUID(parseInt(uid));
		}

		return this.PickUIDs(this.pinstgroup, edge_objtype);
	};

	instanceProto.PickEdgeBetweenLP = function (edge_objtype, lx0, ly0, lx1, ly1) {
		if (!edge_objtype)
			return false;
		var edgeuid = this.lxy2edgeuid(lx0, ly0, lx1, ly1);
		if (edgeuid != null) {
			this.pinstgroup.AddUID(edgeuid);
		}
		return this.PickUIDs(this.pinstgroup, edge_objtype);
	};

	instanceProto.PickEdgeBetweenChess = function (edge_objtype, chess_uid0, chess_uid1) {
		if (!edge_objtype)
			return false;

		var board = this.GetBoard();
		var xyz0 = board.uid2xyz(chess_uid0);
		var xyz1 = board.uid2xyz(chess_uid1);
		if ((xyz0 == null) || (xyz1 == null))
			return false;

		var edgeuid = this.lxy2edgeuid(xyz0.x, xyz0.y, xyz1.x, xyz1.y);
		if (edgeuid != null) {
			this.pinstgroup.AddUID(edgeuid);
		}
		return this.PickUIDs(this.pinstgroup, edge_objtype);
	};

	instanceProto.PickEdgesAroundChessAtDirection = function (edge_objtype, chess_objtype, dir) {
		if ((!edge_objtype) || (!chess_objtype))
			return false;

		var chess = chess_objtype.getCurrentSol().getObjects();
		var i, chess_cnt = chess.length;
		var board = this.GetBoard();
		var layout = board.GetLayout();
		for (i = 0; i < chess_cnt; i++) {
			var xyz0 = board.uid2xyz(chess[i].uid);
			if (xyz0 == null)
				continue;

			if (dir == -1) {
				var j, cnt = layout.GetDirCount();
				for (j = 0; j < cnt; j++) {
					var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, j);
					var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, j);
					var edgeuid = this.lxy2edgeuid(xyz0.x, xyz0.y, lx1, ly1);
					if (edgeuid != null) {
						this.pinstgroup.AddUID(edgeuid);
					}
				}
			} else {
				var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, dir);
				var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, dir);
				var edgeuid = this.lxy2edgeuid(xyz0.x, xyz0.y, lx1, ly1);
				if (edgeuid != null) {
					this.pinstgroup.AddUID(edgeuid);
				}
			}
		}
		return this.PickUIDs(this.pinstgroup, edge_objtype);
	};

	instanceProto.PickEdgesClampedByChess = function (edge_objtype, chess_objtype) {
		if ((!edge_objtype) || (!chess_objtype))
			return false;

		var chess = chess_objtype.getCurrentSol().getObjects();
		var i, chess_cnt = chess.length;
		var board = this.GetBoard();
		var layout = board.GetLayout();
		var j, dir_cnt = layout.GetDirCount();
		var edgeuid2count = {};
		for (i = 0; i < chess_cnt; i++) {
			var xyz0 = board.uid2xyz(chess[i].uid);
			if (xyz0 == null)
				continue;

			for (j = 0; j < dir_cnt; j++) {
				var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, j);
				var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, j);
				var edgeuid = this.lxy2edgeuid(xyz0.x, xyz0.y, lx1, ly1);
				if (edgeuid == null)
					continue;

				if (!edgeuid2count.hasOwnProperty(edgeuid)) {
					edgeuid2count[edgeuid] = 0;
				}
				edgeuid2count[edgeuid] += 1;
			}
		}

		var uid;
		for (uid in edgeuid2count) {
			if (edgeuid2count[uid] >= 2) {
				this.pinstgroup.AddUID(parseInt(uid));
			}
		}

		return this.PickUIDs(this.pinstgroup, edge_objtype);
	};

	instanceProto.PickChessAroundEdge = function (chess_objtype, edge_objtype, lz) {
		if ((!edge_objtype) || (!chess_objtype))
			return false;

		var edges = edge_objtype.getCurrentSol().getObjects();
		var i, edges_cnt = edges.length;
		var board = this.GetBoard();
		var layout = board.GetLayout();
		for (i = 0; i < edges_cnt; i++) {
			var k = this.edgeuid2lxykey[edges[i].uid];
			if (k == null)
				continue;

			var lxy = key2lxy(k);
			if (lz != null) {
				var chess_uid0 = board.xyz2uid(lxy[0], lxy[1], lz);
				var chess_uid1 = board.xyz2uid(lxy[2], lxy[3], lz);
				if (chess_uid0 != null)
					this.pinstgroup.AddUID(chess_uid0);
				if (chess_uid1 != null)
					this.pinstgroup.AddUID(chess_uid1);
			} else {
				var z;

				var zhash0 = board.xy2zHash(lxy[0], lxy[1]);
				if (zhash0) {
					for (z in zhash0) {
						this.pinstgroup.AddUID(zhash0[z]);
					}
				}

				var zhash1 = board.xy2zHash(lxy[2], lxy[3]);
				if (zhash1) {
					for (z in zhash1) {
						this.pinstgroup.AddUID(zhash1[z]);
					}
				}
			}
		}
		return this.PickUIDs(this.pinstgroup, chess_objtype);
	};

	instanceProto.saveToJSON = function () {
		return {
			"lxykey2edgeuid": this.lxykey2edgeuid,
			"edgeuid2lxykey": this.edgeuid2lxykey,
			"boarduid": (this.board != null) ? this.board.uid : (-1)
		};
	};

	instanceProto.loadFromJSON = function (o) {
		this.lxykey2edgeuid = o["lxykey2edgeuid"];
		this.edgeuid2lxykey = o["edgeuid2lxykey"];
		this.boardUid = o["boarduid"];
	};

	instanceProto.afterLoad = function () {
		if (this.boardUid === -1)
			this.board = null;
		else {
			this.board = this.runtime.getObjectByUID(this.boardUid);
			assert2(this.board, "SLG movement: Failed to find board object by UID");
		}
		this.boardUid = -1;
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.HasEdgeBetweenLP = function (lx0, ly0, lx1, ly1) {
		var k = lxy2key(lx0, ly0, lx1, ly1);
		return this.lxykey2edgeuid.hasOwnProperty(k);

	};
	Cnds.prototype.HasEdgeBetweenChess = function (chess_uid0, chess_uid1) {
		var board = this.GetBoard();
		var xyz0 = board.uid2xyz(chess_uid0);
		var xyz1 = board.uid2xyz(chess_uid1);
		if ((xyz0 == null) || (xyz1 == null))
			return false;

		var k = lxy2key(xyz0.x, xyz0.y, xyz1.x, xyz1.y);
		return this.lxykey2edgeuid.hasOwnProperty(k);
	};

	Cnds.prototype.HasAnyEdgesAroundChessAtDirection = function (chess_objtype, dir) {
		if (!chess_objtype)
			return false;

		var chess_inst = chess_objtype.getFirstPicked();
		if (!chess_inst)
			return false;

		var board = this.GetBoard();
		var xyz0 = board.uid2xyz(chess_inst.uid);
		var layout = board.GetLayout();
		var has_edge;
		if (dir == -1) {
			var i, cnt = layout.GetDirCount();
			for (i = 0; i < cnt; i++) {
				var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, i);
				var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, i);
				has_edge = (this.lxy2edgeuid(xyz0.x, xyz0.y, lx1, ly1) != null);
				if (has_edge)
					break;
			}
		} else {
			var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, dir);
			var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, dir);
			has_edge = (this.lxy2edgeuid(xyz0.x, xyz0.y, lx1, ly1) != null);
		}
		return has_edge;
	};

	Cnds.prototype.PickAllEdges = function (edge_objtype) {
		return this.PickAllEdges(edge_objtype);
	};

	Cnds.prototype.PickEdgeBetweenLP = function (edge_objtype, lx0, ly0, lx1, ly1) {
		return this.PickEdgeBetweenLP(edge_objtype, lx0, ly0, lx1, ly1);
	};

	Cnds.prototype.PickEdgeBetweenChess = function (edge_objtype, chess_uid0, chess_uid1) {
		return this.PickEdgeBetweenChess(edge_objtype, chess_uid0, chess_uid1);
	};

	Cnds.prototype.PickEdgesAroundChessAtDirection = function (edge_objtype, chess_objtype, dir) {
		return this.PickEdgesAroundChessAtDirection(edge_objtype, chess_objtype, dir);
	};

	Cnds.prototype.PickEdgesClampedByChess = function (edge_objtype, chess_objtype) {
		return this.PickEdgesClampedByChess(edge_objtype, chess_objtype);
	};

	Cnds.prototype.PickChessAroundEdge = function (chess_objtype, edge_objtype, lz) {
		return this.PickChessAroundEdge(chess_objtype, edge_objtype, lz);
	};

	Cnds.prototype.OnEdgeKicked = function (edge_objtype) {
		this.pinstgroup.AddUID(this._kicked_edge_uid);
		return this.PickUIDs(this.pinstgroup, edge_objtype);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.Setup = function (board_objs) {
		var board = board_objs.getFirstPicked();
		if (board.check_name == "BOARD")
			this.board = board;
		else
			alert("Edge object should connect to a board object");
	};

	Acts.prototype.CreateEdgeBetweenLP = function (edge_objtype, lx0, ly0, lx1, ly1, layer) {
		this.CreateEdgeBetweenLP(edge_objtype, lx0, ly0, lx1, ly1, layer);
	};

	Acts.prototype.CreateEdgeBetweenChess = function (edge_objtype, chess_uid0, chess_uid1, layer) {
		var board = this.GetBoard();
		var xyz0 = board.uid2xyz(chess_uid0);
		var xyz1 = board.uid2xyz(chess_uid1);
		if ((xyz0 == null) || (xyz1 == null))
			return;

		this.CreateEdgeBetweenLP(edge_objtype, xyz0.x, xyz0.y, xyz1.x, xyz1.y, layer);
	};

	Acts.prototype.CreateEdgeAroundChess = function (edge_objtype, chess_objtype, dir, layer) {
		if (!chess_objtype)
			return;

		var chess = chess_objtype.getCurrentSol().getObjects();
		var i, chess_cnt = chess.length;
		var board = this.GetBoard();
		var layout = board.GetLayout();
		for (i = 0; i < chess_cnt; i++) {
			var xyz0 = board.uid2xyz(chess[i].uid);
			if (xyz0 == null)
				continue;

			if (dir == -1) {
				var j, cnt = layout.GetDirCount();
				for (j = 0; j < cnt; j++) {
					var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, i);
					var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, i);
					this.CreateEdgeBetweenLP(edge_objtype, xyz0.x, xyz0.y, lx1, ly1, layer);
				}
			} else {
				var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, dir);
				var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, dir);
				this.CreateEdgeBetweenLP(edge_objtype, xyz0.x, xyz0.y, lx1, ly1, layer);
			}
		}
	};

	Acts.prototype.DestroyEdges = function (edge_objtype) {
		if (!edge_objtype)
			return;
		var edges = edge_objtype.getCurrentSol().getObjects();
		var i, edge_cnt = edges.length;
		for (i = 0; i < edge_cnt; i++) {
			this.remove_edge(edges[i].uid);
			this.runtime.DestroyInstance(edges[i]);
		}
	};

	Acts.prototype.RemoveEdges = function (edge_objtype) {
		if (!edge_objtype)
			return;
		var edges = edge_objtype.getCurrentSol().getObjects();
		var i, edge_cnt = edges.length;
		for (i = 0; i < edge_cnt; i++) {
			this.remove_edge(edges[i].uid);
		}
	};

	Acts.prototype.MoveEdgeBetweenLP = function (edge_objtype, lx0, ly0, lx1, ly1) {
		if (!edge_objtype)
			return;
		var edge_inst = edge_objtype.getFirstPicked();
		if (!edge_inst)
			return;

		this.add_edge(edge_inst.uid, lx0, ly0, lx1, ly1);
		//this.set_position_angle(edge_inst, lx0, ly0, lx1, ly1);
	};

	Acts.prototype.MoveEdgeBetweenChess = function (edge_objtype, chess_uid0, chess_uid1) {
		var board = this.GetBoard();
		var xyz0 = board.uid2xyz(chess_uid0);
		var xyz1 = board.uid2xyz(chess_uid1);
		if ((xyz0 == null) || (xyz1 == null))
			return;

		if (!edge_objtype)
			return;
		var edge_inst = edge_objtype.getFirstPicked();
		if (!edge_inst)
			return;
		this.add_edge(edge_inst.uid, xyz0.x, xyz0.y, xyz1.x, xyz1.y);
		//this.set_position_angle(edge_inst, xyz0.x, xyz0.y, xyz1.x, xyz1.y);
	};

	Acts.prototype.MoveEdgeAroundChess = function (edge_objtype, chess_objtype, dir, layer) {
		if (!chess_objtype)
			return;
		var chess_inst = chess_objtype.getFirstPicked();
		if (!chess_inst)
			return;

		var board = this.GetBoard();
		var xyz0 = board.uid2xyz(chess_inst.uid);
		if (xyz0 == null)
			return;
		var layout = board.GetLayout();
		var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, dir);
		var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, dir);

		if (!edge_objtype)
			return;
		var edge_inst = edge_objtype.getFirstPicked();
		if (!edge_inst)
			return;
		this.add_edge(edge_inst.uid, xyz0.x, xyz0.y, lx1, ly1);
		//this.set_position_angle(edge_inst, xyz0.x, xyz0.y, lx1, ly1);
	};

	Acts.prototype.PickAllEdges = function (edge_objtype) {
		this.PickAllEdges(edge_objtype);
	};

	Acts.prototype.PickEdgeBetweenLP = function (edge_objtype, lx0, ly0, lx1, ly1) {
		this.PickEdgeBetweenLP(edge_objtype, lx0, ly0, lx1, ly1);
	};

	Acts.prototype.PickEdgeBetweenChess = function (edge_objtype, chess_uid0, chess_uid1) {
		this.PickEdgeBetweenChess(edge_objtype, chess_uid0, chess_uid1);
	};

	Acts.prototype.PickEdgesAroundChessAtDirection = function (edge_objtype, chess_objtype, dir) {
		this.PickEdgesAroundChessAtDirection(edge_objtype, chess_objtype, dir);
	};

	Acts.prototype.PickEdgesClampedByChess = function (edge_objtype, chess_objtype) {
		return this.PickEdgesClampedByChess(edge_objtype, chess_objtype);
	};

	Acts.prototype.PickChessAroundEdge = function (chess_objtype, edge_objtype, lz) {
		this.PickChessAroundEdge(chess_objtype, edge_objtype, lz);
	};

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.LXY2EdgeUID = function (ret, lx0, ly0, lx1, ly1) {
		var uid = this.lxy2edgeuid(lx0, ly0, lx1, ly1);
		if (uid == null)
			uid = -1;
		ret.set_int(uid);
	};

	Exps.prototype.ChessUID2EdgeUID = function (ret, chess_uid0, chess_uid1) {
		var board = this.GetBoard();
		var xyz0 = board.uid2xyz(chess_uid0);
		var xyz1 = board.uid2xyz(chess_uid1);
		if ((xyz0 == null) || (xyz1 == null)) {
			ret.set_int(-1);
			return;
		}
		var uid = this.lxy2edgeuid(xyz0.x, xyz0.y, xyz1.x, xyz1.y);
		if (uid == null)
			uid = -1;
		ret.set_int(uid);
	};

	Exps.prototype.ChessDIR2EdgeUID = function (ret, chess_uid, dir) {
		var board = this.GetBoard();
		var xyz0 = board.uid2xyz(chess_uid);
		if (xyz0 == null) {
			ret.set_int(-1);
			return;
		}
		var layout = board.GetLayout();
		var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, dir);
		var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, dir);
		var uid = this.lxy2edgeuid(xyz0.x, xyz0.y, lx1, ly1);
		if (uid == null)
			uid = -1;
		ret.set_int(uid);
	};

	Exps.prototype.ChessUID2EdgeCount = function (ret, chess_uid) {
		var board = this.GetBoard();
		var xyz0 = board.uid2xyz(chess_uid);
		if (xyz0 == null) {
			ret.set_int(-1);
			return;
		}
		var layout = board.GetLayout();
		var dir, dir_cnt = layout.GetDirCount(),
			edge_count = 0;
		var lx0 = xyz0.x,
			ly0 = xyz0.y,
			lx1, ly1;
		for (dir = 0; dir < dir_cnt; dir++) {
			lx1 = layout.GetNeighborLX(lx0, ly0, dir);
			ly1 = layout.GetNeighborLY(lx0, ly0, dir);
			if (this.lxy2edgeuid(lx0, ly0, lx1, ly1) != null) {
				edge_count += 1;
			}
		}
		ret.set_int(edge_count);
	};

	Exps.prototype.EdgeUID2PX = function (ret, edge_uid) {
		var k = this.edgeuid2lxykey[edge_uid];
		if (k == null) {
			ret.set_float(-1);
			return;
		}

		var layout = this.GetBoard().GetLayout();
		var lxy = key2lxy(k);
		var px0 = layout.LXYZ2PX(lxy[0], lxy[1], 0);
		var px1 = layout.LXYZ2PX(lxy[2], lxy[3], 0);
		ret.set_float((px0 + px1) / 2);
	};

	Exps.prototype.EdgeUID2PY = function (ret, edge_uid) {
		var k = this.edgeuid2lxykey[edge_uid];
		if (k == null) {
			ret.set_float(-1);
			return;
		}

		var layout = this.GetBoard().GetLayout();
		var lxy = key2lxy(k);
		var py0 = layout.LXYZ2PY(lxy[0], lxy[1], 0);
		var py1 = layout.LXYZ2PY(lxy[2], lxy[3], 0);
		ret.set_float((py0 + py1) / 2);
	};

	Exps.prototype.EdgeUID2PA = function (ret, edge_uid) {
		var k = this.edgeuid2lxykey[edge_uid];
		if (k == null) {
			ret.set_float(-1);
			return;
		}

		var layout = this.GetBoard().GetLayout();
		var lxy = key2lxy(k);
		var px0 = layout.LXYZ2PX(lxy[0], lxy[1], 0);
		var py0 = layout.LXYZ2PY(lxy[0], lxy[1], 0);
		var px1 = layout.LXYZ2PX(lxy[2], lxy[3], 0);
		var py1 = layout.LXYZ2PY(lxy[2], lxy[3], 0);
		var a = cr.angleTo((px0 + px1) / 2, (py0 + py1) / 2, px0, py0);
		ret.set_float(cr.to_clamped_degrees(a));
	};

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