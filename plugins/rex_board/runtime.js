// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGBoard = function (runtime) {
    this.runtime = runtime;
};

(function () {
    var pluginProto = cr.plugins_.Rex_SLGBoard.prototype;

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

    var _uids = []; // private global object
    var ALLDIRECTIONS = (-1);
    instanceProto.onCreate = function () {
        this.check_name = "BOARD";
        this.board = new window.RexC2BoardKlass();
        this.infinityMode = (this.properties[3] === 1);
        this.isWrapMode = (this.properties[2] === 1);
        this.ResetBoard(this.properties[0] - 1, this.properties[1] - 1);

        this.layout = null;
        this.layoutUid = -1; // for loading
        this.kickedChessUID = -1;
        this.exp_EmptyLX = -1;
        this.exp_EmptyLY = -1;
        this.exp_CurLX = 0;
        this.exp_CurLY = 0;
        this.exp_CurLZ = 0;

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
        this.ResetBoard(-1, -1);
        this.runtime.removeDestroyCallback(this.myDestroyCallback);
    };

    instanceProto.onInstanceDestroyed = function (inst) {
        // auto remove uid from board array
        this.RemoveChess(inst.uid);
    };

    instanceProto.GetLayout = function () {
        if (this.layout != null)
            return this.layout;

        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins) {
            inst = plugins[name].instances[0];

            if ((cr.plugins_.Rex_SLGSquareTx && (inst instanceof cr.plugins_.Rex_SLGSquareTx.prototype.Instance)) ||
                (cr.plugins_.Rex_SLGHexTx && (inst instanceof cr.plugins_.Rex_SLGHexTx.prototype.Instance)) ||
                (cr.plugins_.Rex_ProjectionTx && (inst instanceof cr.plugins_.Rex_ProjectionTx.prototype.Instance)) ||
                (cr.plugins_.Rex_SLGCubeTx && (inst instanceof cr.plugins_.Rex_SLGCubeTx.prototype.Instance))
            ) {
                this.layout = inst;
                return this.layout;
            }
        }
        assert2(this.layout, "Board: Can not find layout oject.");
        return null;
    };

    instanceProto.ResetBoard = function (x_max, y_max) {
        if (this.infinityMode)
            this.x_max = -1;
        else if (x_max >= -1)
            this.x_max = x_max;

        if (this.infinityMode)
            this.y_max = -1;
        if (y_max >= -1)
            this.y_max = y_max;

        this.board.Reset();
    };

    instanceProto.GetAllChess = function () {
        return this.board.GetAllChess();
    };

    instanceProto.SetBoardWidth = function (x_max) {
        if (this.infinityMode)
            return;
        else if (this.x_max === x_max)
            return;
        else if (this.x_max < x_max) // extend
        {
            // do nothing
        } else // (this.x_max > x_max) : collapse
        {
            var x, y, z, zHash;
            for (x = this.x_max; x > x_max; x--) {
                for (y = 0; y <= this.y_max; y++) {
                    zHash = this.xy2zHash(x, y);
                    if (!zHash)
                        continue;
                    for (z in zHash)
                        this.RemoveChess(zHash[z], true);
                }
            }
        }
        this.x_max = x_max;
    };

    instanceProto.SetBoardHeight = function (y_max) {
        if (this.infinityMode)
            return;
        else if (this.y_max == y_max)
            return;
        else if (this.y_max < y_max) // extend
        {
            // do nothing
        } else // (this.y_max > y_max) : collapse
        {
            var x, y, z, zHash;
            for (x = 0; x <= this.x_max; x++) {
                for (y = this.y_max; y > y_max; y--) {
                    zHash = this.xy2zHash(x, y);
                    if (!zHash)
                        continue;
                    for (z in zHash)
                        this.RemoveChess(zHash[z], true);
                }
            }
        }
        this.y_max = y_max;
    };

    instanceProto.IsInsideBoard = function (x, y, z) {
        var is_in_board;
        // check x,y boundary
        if (this.infinityMode)
            is_in_board = true;
        else
            is_in_board = (x >= 0) && (y >= 0) && (x <= this.x_max) && (y <= this.y_max);

        // check z 
        if (is_in_board && (z != null))
            is_in_board = (this.xyz2uid(x, y, z) != null);

        return is_in_board;
    };

    instanceProto.IsEmpty = function (x, y, z) {
        var zHash = this.xy2zHash(x, y);
        if (!zHash) {
            if (this.infinityMode)
                return true;
            else if (!this.IsInsideBoard(x, y)) // not infinityMode
                return false;
            else
                return true;
        } else if (z === 0)
            return (zHash[0] == null);
        else
            return (zHash[0] != null) && (zHash[z] == null);
    };

    var getUID = function (objs) {
        var uid;
        if (objs == null)
            uid = null;
        else if (typeof (objs) === "object") {
            var inst = objs.getFirstPicked();
            uid = (inst != null) ? inst.uid : null;
        } else
            uid = objs;

        return uid;
    };

    instanceProto.xyz2uid = function (x, y, z) {
        return this.board.GetCell(x, y, z);
    };

    instanceProto.xy2zHash = function (x, y) {
        return this.board.GetCell(x, y) || null;
    };

    instanceProto.xy2zCnt = function (x, y) {
        var zHash = this.xy2zHash(x, y);
        if (!zHash)
            return 0;

        var zcnt = 0;
        for (var z in zHash)
            zcnt += 1;
        return zcnt;
    };

    instanceProto.lz2uid = function (uid, lz) {
        var o_xyz = this.uid2xyz(uid);
        if (o_xyz == null)
            return null;
        if (o_xyz.z == lz)
            return uid;

        return this.xyz2uid(o_xyz.x, o_xyz.y, lz);
    };

    instanceProto.GetNeighborLX = function (lx, ly, dir, isWrapMode) {
        if (this.infinityMode)
            isWrapMode = false;
        else if (isWrapMode == null)
            isWrapMode = this.isWrapMode;

        var layout = this.GetLayout();
        var nlx = layout.GetNeighborLX(lx, ly, dir);
        if (isWrapMode)
            nlx = this.WrapLX(nlx);

        return nlx;
    };

    instanceProto.WrapLX = function (lx, isWrapMode) {
        if (this.infinityMode)
            isWrapMode = false;
        else if (isWrapMode == null)
            isWrapMode = this.isWrapMode;

        if (!isWrapMode)
            return lx;

        var cnt = this.x_max + 1;
        lx = lx % cnt;
        if (lx < 0)
            lx = lx + (cnt);

        return lx;
    };

    instanceProto.GetNeighborLY = function (lx, ly, dir, isWrapMode) {
        if (this.infinityMode)
            isWrapMode = false;
        else if (isWrapMode == null)
            isWrapMode = this.isWrapMode;

        var layout = this.GetLayout();
        var nly = layout.GetNeighborLY(lx, ly, dir);
        if (isWrapMode)
            nly = this.WrapLY(nly);

        return nly;
    };

    instanceProto.WrapLY = function (ly, isWrapMode) {
        if (this.infinityMode)
            isWrapMode = false;
        else if (isWrapMode == null)
            isWrapMode = this.isWrapMode;

        if (!isWrapMode)
            return ly;

        var cnt = this.y_max + 1;
        ly = ly % cnt;
        if (ly < 0)
            ly = ly + (cnt);

        return ly;
    };

    instanceProto.dir2uid = function (uid, dir, tz, isWrapMode) {
        var o_xyz = this.uid2xyz(uid);
        if (o_xyz == null)
            return null;

        var tx = this.GetNeighborLX(o_xyz.x, o_xyz.y, dir, isWrapMode);
        var ty = this.GetNeighborLY(o_xyz.x, o_xyz.y, dir, isWrapMode);
        if (tz == null)
            tz = o_xyz.z;
        return this.xyz2uid(tx, ty, tz);
    };

    instanceProto.uid2xyz = function (uid) {
        return this.GetAllChess()[uid] || null;
    };

    instanceProto.uid2inst = function (uid, ignored_chess_check) {
        var uid_digital = parseInt(uid);
        if (typeof (uid_digital) !== "number")
            return null;
        else if (uid_digital < 0)
            return null;
        else if (!ignored_chess_check && (!this.uid2xyz(uid))) // not on the board
            return null;
        else
            return this.runtime.getObjectByUID(uid);
    };

    instanceProto.SwapChess = function (uidA, uidB) {
        var xyzA = this.uid2xyz(uidA);
        var xyzB = this.uid2xyz(uidB);
        if ((xyzA == null) || (xyzB == null))
            return false;

        this.RemoveChess(uidA);
        this.RemoveChess(uidB);
        this.AddChess(uidA, xyzB.x, xyzB.y, xyzB.z);
        this.AddChess(uidB, xyzA.x, xyzA.y, xyzA.z);
        return true;
    };

    instanceProto.CanPut = function (x, y, z, test_mode) {
        var result;
        switch (test_mode) {
            case 0: // x,y is inside board
                result = this.IsInsideBoard(x, y);
                break;
            case 1: // x,y is inside board, and stand on a tile if z!=0
                var check_z = (z == 0) ? null : 0;
                result = this.IsInsideBoard(x, y, check_z);
                break;
            case 2: // x,y is stand on a tile and is empty
                result = this.IsEmpty(x, y, z);
                break;
        }
        return result;
    };

    instanceProto.RemoveChess = function (uid, kickingNotify) {
        if (uid == null)
            return;

        var xyz = this.uid2xyz(uid);
        if (xyz == null)
            return;

        if (kickingNotify && this.uid2inst(uid)) {
            this.kickedChessUID = uid;
            this.runtime.trigger(cr.plugins_.Rex_SLGBoard.prototype.cnds.OnChessKicked, this);
        }

        this.board.RemoveCell(uid);
    };

    instanceProto.AddChess = function (inst, x, y, z) {
        if (inst == null)
            return;

        // check if lxy is inside board
        if (!this.IsInsideBoard(x, y))
            return;

        // "inst" could be instance(object) or uid(number) or ?(string)
        var instIsInstType = (typeof (inst) === "object");
        var uid = (instIsInstType) ? inst.uid : inst;

        this.RemoveChess(uid); // keep unique uid (symbol)            
        this.RemoveChess(this.xyz2uid(x, y, z), true);
        this.board.AddCell(uid, x, y, z);

        // board changed, check logical overlapping
        if (instIsInstType || (this.uid2inst(uid) != null))
            this.runtime.trigger(cr.plugins_.Rex_SLGBoard.prototype.cnds.OnCollided, this);
    };

    instanceProto.MoveChess = function (inst, x, y, z) {
        var uid = (typeof (inst) === "object") ? inst.uid : inst;
        this.RemoveChess(uid);
        this.AddChess(uid, x, y, z);
    };

    instanceProto.uid2NeighborDir = function (uidA, uidB, isWrapMode) {
        var xyzA = this.uid2xyz(uidA);
        var xyzB = this.uid2xyz(uidB);
        if (!xyzA || !xyzB)
            return null;

        return this.xy2NeighborDir(xyzA.x, xyzA.y, xyzB.x, xyzB.y, isWrapMode);
    };

    var GXYZA = {
        x: 0,
        y: 0,
        z: 0
    };
    var GXYZB = {
        x: 0,
        y: 0,
        z: 0
    };
    instanceProto.xy2NeighborDir = function (x0, y0, x1, y1, isWrapMode) {
        GXYZA.x = x0, GXYZA.y = y0;
        GXYZB.x = x1, GXYZB.y = y1;
        var layout = this.GetLayout();
        var dir = layout.NeighborXYZ2Dir(GXYZA, GXYZB);

        if (dir == null) {
            if (this.infinityMode)
                isWrapMode = false;
            if (isWrapMode == null)
                isWrapMode = this.isWrapMode;

            if (isWrapMode) {
                var i, dirCount = layout.GetDirCount();
                var tx, ty;
                for (i = 0; i < dirCount; i++) {
                    tx = this.GetNeighborLX(GXYZA.x, GXYZA.y, i, isWrapMode);
                    ty = this.GetNeighborLY(GXYZA.x, GXYZA.y, i, isWrapMode);
                    if ((tx == GXYZB.x) && (ty == GXYZB.y)) {
                        dir = i;
                        break;
                    }
                }
            }
        }
        return dir;
    };

    instanceProto.CreateChess = function (objtype, x, y, z, layer) {
        if (!objtype || !layer)
            return;

        if (!this.IsInsideBoard(x, y))
            return;

        // callback
        var self = this;
        var callback = function (inst) {
            self.AddChess(inst, x, y, z);
        }
        // callback

        var layout = this.GetLayout();
        var px = layout.LXYZ2PX(x, y, z);
        var py = layout.LXYZ2PY(x, y, z);
        var inst = window.RexC2CreateObject.call(this, objtype, layer, px, py, callback);
        return inst;
    };

    instanceProto.overlapTest = function (_objA, _objB) {
        var _insts_A = _objA.getCurrentSol().getObjects();
        var _insts_B = _objB.getCurrentSol().getObjects();
        var objA, objB, insts_A, insts_B;
        if (_insts_A.length > _insts_B.length) {
            objA = _objB;
            objB = _objA;
            insts_A = _insts_B;
            insts_B = _insts_A;
        } else {
            objA = _objA;
            objB = _objB;
            insts_A = _insts_A;
            insts_B = _insts_B;
        }

        var runtime = this.runtime;
        var current_event = runtime.getCurrentEventStack().current_event;
        var is_the_same_type = (objA === objB);
        var cnt_instA = insts_A.length;
        var i, z, inst_A, uid_A, xyz_A, zHash, tmp_inst, tmp_uid;
        var cursol_A, cursol_B;
        for (i = 0; i < cnt_instA; i++) {
            inst_A = insts_A[i];
            uid_A = inst_A.uid;
            xyz_A = this.uid2xyz(uid_A);
            if (xyz_A == null)
                continue;

            var zHash = this.xy2zHash(xyz_A.x, xyz_A.y);
            if (!zHash)
                continue;

            for (z in zHash) {
                tmp_uid = zHash[z];
                if (tmp_uid == uid_A)
                    continue;
                tmp_inst = this.uid2inst(tmp_uid);
                if (insts_B.indexOf(tmp_inst) != (-1)) {
                    runtime.pushCopySol(current_event.solModifiers);
                    cursol_A = objA.getCurrentSol();
                    cursol_B = objB.getCurrentSol();
                    cursol_A.select_all = false;
                    cursol_B.select_all = false;
                    // If ltype === rtype, it's the same object (e.g. Sprite collides with Sprite)
                    // In which case, pick both instances                                        
                    if (is_the_same_type) {
                        // just use lsol, is same reference as rsol
                        cursol_A.instances.length = 2;
                        cursol_A.instances[0] = inst_A;
                        cursol_A.instances[1] = tmp_inst;
                    } else // Pick each instance in its respective SOL
                    {
                        cursol_A.instances.length = 1;
                        cursol_A.instances[0] = inst_A;
                        cursol_B.instances.length = 1;
                        cursol_B.instances[0] = tmp_inst;
                    }
                    current_event.retrigger();
                    runtime.popSol(current_event.solModifiers);
                }
            }
        }
    };

    instanceProto.PickUIDs = function (uids, chess_type, ignored_chess_check) {
        if (!chess_type)
            return false;

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

    instanceProto.PickChess = function (chess_type) {
        if (!chess_type)
            return false;

        _uids.length = 0;
        var u;
        var items = this.GetAllChess();
        for (u in items) {
            _uids.push(parseInt(u));
        }
        var has_inst = this.PickUIDs(_uids, chess_type);
        _uids.length = 0;
        return has_inst;
    };

    instanceProto.PickChessAtLXY = function (chess_type, x, y) {
        if (!chess_type)
            return false;

        var zHash = this.xy2zHash(x, y);
        if (!zHash)
            return false;

        _uids.length = 0;
        var z;
        for (z in zHash) {
            _uids.push(zHash[z]);
        }
        var has_inst = this.PickUIDs(_uids, chess_type);
        _uids.length = 0;
        return has_inst;
    };
    instanceProto.PickChessAtTiles = function (chess_type, tiles) {
        if (!chess_type)
            return false;

        _uids.length = 0;
        var tiles_cnt = tiles.length;
        var t, tile, uid, xyz, zHash, z;
        for (t = 0; t < tiles_cnt; t++) {
            tile = tiles[t];
            uid = (typeof (tile) === "object") ? tile.uid : tile;
            // Do you want to scan all tiles to pick matched symbol tiles?
            xyz = this.uid2xyz(uid);
            if (!xyz)
                continue;
            zHash = this.xy2zHash(xyz.x, xyz.y);
            if (!zHash)
                continue;
            for (z in zHash) {
                _uids.push(zHash[z]);
            }
        }
        var has_inst = this.PickUIDs(_uids, chess_type);
        _uids.length = 0;
        return has_inst;
    };

    instanceProto.PointIsInBoard = function (px, py) {
        if (this.infinityMode)
            return true;

        var layout = this.GetLayout();
        var lx = layout.PXY2LX(px, py);
        var ly = layout.PXY2LY(px, py);
        return this.IsInsideBoard(lx, ly);
    };

    instanceProto.PickChessAtLXYZ = function (chess_type, x, y, z) {
        if (!chess_type)
            return false;

        _uids.length = 0;
        var uid = this.xyz2uid(x, y, z);
        if (uid != null)
            _uids.push(uid);

        var has_inst = this.PickUIDs(_uids, chess_type);
        _uids.length = 0;
        return has_inst;
    };

    instanceProto.PickChessAtLX = function (chess_type, x) {
        if (!chess_type)
            return false;


        _uids.length = 0;

        if (this.infinityMode) {
            // scan all chess
            var uid, xyz;
            var items = this.GetAllChess();
            for (uid in items) {
                uid = parseInt(uid);
                xyz = this.uid2xyz(uid);
                if (xyz.x === x) {
                    _uids.push(uid);
                }
            }
        } else {
            // scan a line
            var y, z, zHash, uid;
            for (y = 0; y <= this.y_max; y++) {
                zHash = this.xy2zHash(x, y);
                if (!zHash)
                    continue;
                for (z in zHash) {
                    _uids.push(zHash[z]);
                }
            }
        }
        var has_inst = this.PickUIDs(_uids, chess_type);
        _uids.length = 0;
        return has_inst;
    };


    instanceProto.PickChessAtLY = function (chess_type, y) {
        if (!chess_type)
            return false;

        _uids.length = 0;

        if (this.infinityMode) {
            // scan all chess
            var uid, xyz;
            var items = this.GetAllChess();
            for (uid in items) {
                uid = parseInt(uid);
                xyz = this.uid2xyz(uid);
                if (xyz.y === y) {
                    _uids.push(uid);
                }
            }
        } else {
            // scan a line            
            var x, z, zHash, uid;
            for (x = 0; x <= this.x_max; x++) {
                zHash = this.xy2zHash(x, y);
                if (!zHash)
                    continue;
                for (z in zHash) {
                    _uids.push(zHash[z]);
                }
            }
        }
        var has_inst = this.PickUIDs(_uids, chess_type);
        _uids.length = 0;
        return has_inst;
    };

    instanceProto.PickChessAtLZ = function (chess_type, z) {
        if (!chess_type)
            return false;

        _uids.length = 0;

        if (this.infinityMode) {
            // scan all chess
            var uid, xyz;
            var items = this.GetAllChess();
            for (uid in items) {
                uid = parseInt(uid);
                xyz = this.uid2xyz(uid);
                if (xyz.z === z) {
                    _uids.push(uid);
                }
            }
        } else {
            // scan a face
            var x, y, uid;
            for (y = 0; y <= this.y_max; y++) {
                for (x = 0; x <= this.x_max; x++) {
                    uid = this.xyz2uid(x, y, z);
                    if (uid == null)
                        continue;

                    _uids.push(uid);
                }
            }
        }
        var has_inst = this.PickUIDs(_uids, chess_type);
        _uids.length = 0;
        return has_inst;
    };

    instanceProto.PickChessInsideSquare = function (chess_type, x0_, x1_, y0_, y1_) {
        if (!chess_type)
            return false;

        var x0 = Math.min(x0_, x1_);
        var x1 = Math.max(x0_, x1_);
        var y0 = Math.min(y0_, y1_);
        var y1 = Math.max(y0_, y1_);

        var x, y, z, zHash, uid;
        _uids.length = 0;
        for (y = y0; y <= y1; y++) {
            for (x = x0; x <= x1; x++) {
                zHash = this.xy2zHash(x, y);
                if (!zHash)
                    continue;

                for (z in zHash) {
                    _uids.push(zHash[z]);
                }
            }
        }
        var has_inst = this.PickUIDs(_uids, chess_type);
        _uids.length = 0;
        return has_inst;
    };

    instanceProto.PickNeighborChess = function (origin_insts, dir, chess_type, isWrapMode) {
        if (!chess_type)
            return false;

        var layout = this.GetLayout();
        var dir_cnt = layout.GetDirCount();
        var origin_uid;
        var tiles_uid = [],
            i, cnt, neighbor_uid;
        var i, cnt = origin_insts.length;
        for (i = 0; i < cnt; i++) {
            origin_uid = origin_insts[i].uid;
            if (dir == ALLDIRECTIONS) {
                var i;
                for (i = 0; i < dir_cnt; i++) {
                    neighbor_uid = this.dir2uid(origin_uid, i, 0, isWrapMode);
                    if (neighbor_uid != null)
                        tiles_uid.push(neighbor_uid);
                }
            } else if ((dir >= 0) && (dir < dir_cnt)) {
                neighbor_uid = this.dir2uid(origin_uid, dir, 0, isWrapMode);
                if (neighbor_uid != null)
                    tiles_uid.push(this.dir2uid(origin_uid, dir, 0, isWrapMode));
            }
        }

        return this.PickChessAtTiles(chess_type, tiles_uid);;
    };

    instanceProto.PickChessAboveTile = function (chess_type, tile_type) {
        if (!chess_type || !tile_type)
            return false;
        var tiles = tile_type.getCurrentSol().getObjects();
        return this.PickChessAtTiles(chess_type, tiles);
    };

    instanceProto.PickChessAboveTileUID = function (chess_type, tile_uid) {
        if (!chess_type)
            return;

        // Do you want to scan all tiles to pick matched symbol tiles?
        var xyz = this.uid2xyz(tile_uid);
        if (xyz) // single tile
            return this.PickChessAtLXY(chess_type, xyz.x, xyz.y);
        else // otherwise, might be tiles list
        {
            var uid_list;
            try {
                uid_list = JSON.parse(tile_uid);
            } catch (e) {
                uid_list = null;
            }

            if (uid_list)
                return this.PickChessAtTiles(chess_type, uid_list);
            else
                return false;
        }
    };

    instanceProto.saveToJSON = function () {
        var layout = this.GetLayout();
        return {
            "luid": (layout != null) ? layout.uid : (-1),
            "mx": this.x_max,
            "my": this.y_max,
            "b": this.board.saveToJSON(),
            "iswrap": this.isWrapMode
        };
    };

    instanceProto.loadFromJSON = function (o) {
        this.layoutUid = o["luid"];
        this.x_max = o["mx"];
        this.y_max = o["my"];
        this.board.loadFromJSON(o["b"]);
        this.isWrapMode = o["iswrap"];
    };

    instanceProto.afterLoad = function () {
        if (this.layoutUid === -1)
            this.layout = null;
        else {
            this.layout = this.runtime.getObjectByUID(this.layoutUid);
            assert2(this.layout, "Board: Failed to find layout object by UID");
        }

        this.layoutUid = -1;
    };

    var cleanTable = function (o) {
        for (var k in o)
            delete o[k];
    };

    //////////////////////////////////////	
    // Conditions
    function Cnds() {};
    pluginProto.cnds = new Cnds();

    Cnds.prototype.ForEachCell = function (direction) {
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();

        var self = this;
        var callback = function (x, y) {
            if (solModifierAfterCnds)
                self.runtime.pushCopySol(current_event.solModifiers);

            self.exp_CurLX = x;
            self.exp_CurLY = y;
            current_event.retrigger();

            if (solModifierAfterCnds)
                self.runtime.popSol(current_event.solModifiers);
        }

        var maxX, maxY, minX, minY;
        if (this.infinityMode) {
            maxX = this.board.GetMaxX();
            maxY = this.board.GetMaxY();
            minX = this.board.GetMinX();
            minY = this.board.GetMinY();
        } else {
            maxX = this.x_max;
            maxY = this.y_max;
            minX = 0;
            minY = 0;
        }

        var curLX, curLY;
        // Top to bottom, or Bottom to top -> y axis
        if ((direction === 0) || (direction === 1)) {
            for (var y = minY; y <= maxY; y++) {
                curLY = (direction === 0) ? y : (maxY - y);
                for (var x = minX; x <= maxX; x++) {
                    curLX = x;
                    callback(curLX, curLY);
                }
            }
        }

        // Left to right, or Right to left -> x axis
        else if ((direction === 2) || (direction === 3)) {
            for (var x = minX; x <= maxX; x++) {
                curLX = (direction === 2) ? x : (maxX - x);
                for (var y = minY; y <= maxY; y++) {
                    curLY = y;
                    callback(curLX, curLY);
                }
            }
        }
        return false;
    };

    Cnds.prototype.IsOccupied = function (x, y, z) {
        if (!this.IsInsideBoard(x, y))
            return false;

        return (this.xyz2uid(x, y, z) != null);
    };

    Cnds.prototype.IsEmpty = function (x, y, z) {
        return this.IsEmpty(x, y, z);
    };

    Cnds.prototype.OnCollided = function (objA, objB) {
        this.overlapTest(objA, objB);
        // We've aleady run the event by now.
        return false;
    };

    Cnds.prototype.IsOverlapping = function (objA, objB) {
        this.overlapTest(objA, objB);
        // We've aleady run the event by now.
        return false;
    };

    Cnds.prototype.PointIsInBoard = function (px, py) {
        return this.PointIsInBoard(px, py);
    };

    Cnds.prototype.AreNeighbors = function (uidA, uidB) {
        return (this.uid2NeighborDir(uidA, uidB) != null);
    };

    Cnds.prototype.PickAllChess = function () {
        return this.PickAllInsts();
    };

    Cnds.prototype.OnChessKicked = function (chess_type) {
        _uids.length = 0;
        _uids.push(this.kickedChessUID);
        var has_inst = this.PickUIDs(_uids, chess_type);
        _uids.length = 0;
        return has_inst;
    };

    Cnds.prototype.PickChessAtLXY = function (chess_type, x, y) {
        return this.PickChessAtLXY(chess_type, x, y);
    };
    Cnds.prototype.PickChessAboveTile = function (chess_type, tile_type) {
        return this.PickChessAboveTile(chess_type, tile_type);
    };
    Cnds.prototype.PickChessAboveTileUID = function (chess_type, tile_uid) {
        return this.PickChessAboveTileUID(chess_type, tile_uid);
    };
    Cnds.prototype.IsOnTheBoard = function (chess_type) {
        if (!chess_type)
            return false;
        var sol = chess_type.getCurrentSol();
        var chess_insts = sol.getObjects();
        var i, cnt = chess_insts.length,
            uid;
        var items = this.GetAllChess();
        for (i = 0; i < cnt; i++) {
            uid = chess_insts[i].uid;
            if (!items.hasOwnProperty(uid))
                return false;
        }
        return true;
    };
    Cnds.prototype.PickChessAtLXYZ = function (chess_type, x, y, z) {
        return this.PickChessAtLXYZ(chess_type, x, y, z);
    };

    Cnds.prototype.PickNeighborChess = function (origin, dir, chess_type) {
        if (!origin)
            return false;

        var origin_insts = origin.getCurrentSol().getObjects();
        return this.PickNeighborChess(origin_insts, dir, chess_type);
    };

    var __empty_cells = [];
    Cnds.prototype.PickEmptyCell = function (z) {
        // not support in infinityMode
        if (this.infinityMode)
            return false;

        var x, y;
        for (x = 0; x <= this.x_max; x++) {
            for (y = 0; y <= this.y_max; y++) {
                if (this.IsEmpty(x, y, z)) {
                    __empty_cells.push([x, y]);
                }
            }
        }
        var cnt = __empty_cells.length;
        if (cnt > 0) {
            var i = cr.floor(Math.random() * cnt);
            this.exp_EmptyLX = __empty_cells[i][0];
            this.exp_EmptyLY = __empty_cells[i][1];
        } else {
            this.exp_EmptyLX = -1;
            this.exp_EmptyLY = -1;
        }
        __empty_cells.length = 0;
        return (cnt > 0);
    };

    Cnds.prototype.HasEmptyCell = function (z) {
        // not support in infinityMode        
        if (this.infinityMode)
            return true;

        var x, y;
        for (x = 0; x <= this.x_max; x++) {
            for (y = 0; y <= this.y_max; y++) {
                if (this.IsEmpty(x, y, z)) {
                    this.exp_EmptyLX = x;
                    this.exp_EmptyLY = y;
                    return true;
                }
            }
        }
        return false;
    };

    Cnds.prototype.AreWrappedNeighbors = function (uidA, uidB) {
        var dir1 = this.uid2NeighborDir(uidA, uidB, 1);
        if (dir1 == null)
            return false;

        var dir0 = this.uid2NeighborDir(uidA, uidB, 0);
        return (dir1 != dir0);
    };

    Cnds.prototype.PickChess = function (chess_type) {
        return this.PickChess(chess_type);
    };

    Cnds.prototype.PickChessAtLX = function (chess_type, x) {
        return this.PickChessAtLX(chess_type, x);
    };

    Cnds.prototype.PickChessAtLY = function (chess_type, y) {
        return this.PickChessAtLY(chess_type, y);
    };

    Cnds.prototype.PickChessAtLZ = function (chess_type, z) {
        return this.PickChessAtLZ(chess_type, z);
    };

    Cnds.prototype.PickEmptyCellOnTiles = function (tile_type, z) {
        if (!tile_type)
            return false;
        var tiles = tile_type.getCurrentSol().getObjects();

        var xyz, i, cnt = tiles.length;
        for (i = 0; i < cnt; i++) {
            xyz = this.uid2xyz(tiles[i].uid);
            if (xyz == null)
                continue;

            if (this.IsEmpty(xyz.x, xyz.y, z)) {
                __empty_cells.push([xyz.x, xyz.y]);
            }
        }

        cnt = __empty_cells.length;
        if (cnt > 0) {
            var i = cr.floor(Math.random() * cnt);
            this.exp_EmptyLX = __empty_cells[i][0];
            this.exp_EmptyLY = __empty_cells[i][1];
        } else {
            this.exp_EmptyLX = -1;
            this.exp_EmptyLY = -1;
        }
        __empty_cells.length = 0;
        return (cnt > 0);
    };

    Cnds.prototype.HasEmptyCellOnTiles = function (tile_type, z) {
        if (!tile_type)
            return false;
        var tiles = tile_type.getCurrentSol().getObjects();
        var xyz, i, cnt = tiles.length;
        for (i = 0; i < cnt; i++) {
            xyz = this.uid2xyz(tiles[i].uid);
            if (xyz == null)
                continue;

            if (this.IsEmpty(xyz.x, xyz.y, z)) {
                this.exp_EmptyLX = xyz.x;
                this.exp_EmptyLY = xyz.y;
                return true;
            }
        }

        this.exp_EmptyLX = -1;
        this.exp_EmptyLY = -1;
        return false;
    };
    Cnds.prototype.IsChessOnBoard = function (chess_type) {
        if (!chess_type)
            return false;
        var chess = chess_type.getFirstPicked();
        if (!chess)
            return false;

        return !!this.uid2xyz(chess.uid);
    };

    Cnds.prototype.PickChessInsideSquare = function (chess_type, x0, x1, y0, y1) {
        return this.PickChessInsideSquare(chess_type, x0, x1, y0, y1);
    };


    Cnds.prototype.ForEachLZ = function (x, y) {
        var zHash = this.xy2zHash(x, y);
        if (!zHash)
            return false;

        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();

        for (var z in zHash) {
            if (solModifierAfterCnds)
                this.runtime.pushCopySol(current_event.solModifiers);

            if (!isNaN(z))
                z = parseFloat(z);
            this.exp_CurLZ = z;
            current_event.retrigger();

            if (solModifierAfterCnds)
                this.runtime.popSol(current_event.solModifiers);
        }

        return false;
    };

    //////////////////////////////////////
    // Actions
    function Acts() {};
    pluginProto.acts = new Acts();

    Acts.prototype.ResetBoard = function (width, height) {
        this.ResetBoard(width - 1, height - 1);
    };

    Acts.prototype.AddTile = function (objs, x, y) {
        if (!objs)
            return;

        var inst = objs.getFirstPicked();
        this.AddChess(inst, x, y, 0);
    };

    Acts.prototype.DestroyChess = function (chess_type) {
        if (!chess_type)
            return;

        var chess = chess_type.getCurrentSol().getObjects();
        var i, chess_cnt = chess.length;
        for (i = 0; i < chess_cnt; i++) {
            this.RemoveChess(chess[i].uid);
            this.runtime.DestroyInstance(chess[i]);
        }
    };


    Acts.prototype.AddChess = function (obj_type, x, y, z) {
        if (obj_type == null)
            return;

        var inst;
        if (typeof (obj_type) === "object")
            inst = obj_type.getFirstPicked();
        else // uid
            inst = obj_type;

        this.AddChess(inst, x, y, z);
    };

    Acts.prototype.SetupLayout = function (layout_objs) {
        if (layout_objs == null)
            return;

        var layout = layout_objs.getFirstPicked();
        if (layout.check_name == "LAYOUT")
            this.layout = layout;
        else
            alert("Board should connect to a layout object");
    };

    Acts.prototype.CreateTile = function (objtype, x, y, layer) {
        this.CreateChess(objtype, x, y, 0, layer);
    };

    Acts.prototype.CreateChess = function (objtype, x, y, z, layer) {
        this.CreateChess(objtype, x, y, z, layer);
    };

    Acts.prototype.RemoveChess = function (obj_type) {
        if (!obj_type)
            return;

        if (typeof (obj_type) === "object") {
            var insts = obj_type.getCurrentSol().getObjects();
            var i, cnt = insts.length;
            for (i = 0; i < cnt; i++)
                this.RemoveChess(insts[i].uid);
        } else // uid
        {
            var uid = obj_type;
            this.RemoveChess(uid);
        }
    };

    Acts.prototype.MoveChess = function (chess_type, tile_objs) {
        var chess_uid = getUID(chess_type);
        var tile_uid = getUID(tile_objs);
        if ((chess_uid == null) || (tile_uid == null))
            return;

        var chess_xyz = this.uid2xyz(chess_uid);
        var tile_xyz = this.uid2xyz(tile_uid);
        if ((chess_xyz == null) || (tile_xyz == null))
            return;
        this.MoveChess(chess_uid, tile_xyz.x, tile_xyz.y, chess_xyz.z);
    };

    Acts.prototype.MoveChess2LXYZ = function (chess_type, x, y, z) {
        var chess_uid = getUID(chess_type);
        if (chess_uid == null)
            return;

        this.RemoveChess(chess_uid, true);
        this.AddChess(chess_uid, x, y, z);
    };

    Acts.prototype.SwapChess = function (uidA, uidB) {
        this.SwapChess(uidA, uidB);
    };

    Acts.prototype.PickAllChess = function () {
        this.PickAllInsts();
    };

    Acts.prototype.PickChessAtLXY = function (chess_type, x, y) {
        this.PickChessAtLXY(chess_type, x, y);
    };
    Acts.prototype.PickChessAboveTile = function (chess_type, tile_type) {
        this.PickChessAboveTile(chess_type, tile_type);
    };
    Acts.prototype.PickChessAboveTileUID = function (chess_type, tile_uid) {
        this.PickChessAboveTileUID(chess_type, tile_uid);
    };

    Acts.prototype.PickChessAtLXYZ = function (chess_type, x, y, z) {
        this.PickChessAtLXYZ(chess_type, x, y, z);
    };
    Acts.prototype.SetBoardWidth = function (width) {
        this.SetBoardWidth(width - 1);
    };

    Acts.prototype.SetBoardHeight = function (height) {
        this.SetBoardHeight(height - 1);
    };

    Acts.prototype.PickNeighborChess = function (origin, dir, chess_type) {
        if (!origin)
            return false;

        var origin_insts = origin.getCurrentSol().getObjects();
        this.PickNeighborChess(origin_insts, dir, chess_type);
    };

    Acts.prototype.CreateChessAboveTile = function (chess_type, tile_type, z, layer) {
        if ((!chess_type) || (tile_type == null))
            return false;

        // create chess above tile instances
        if (typeof (tile_type) === "object") {
            var tiles = tile_type.getCurrentSol().getObjects();
            var i, tiles_cnt = tiles.length;
            for (i = 0; i < tiles_cnt; i++) {
                var xyz = this.uid2xyz(tiles[i].uid);
                if (xyz == null)
                    continue;
                this.CreateChess(chess_type, xyz.x, xyz.y, z, layer);
            }
        }

        // tile_type is inst_uid or symbol, or list in JSON string
        else {
            var xyz = this.uid2xyz(tile_type);

            // single tile
            if (xyz) {
                this.CreateChess(chess_type, xyz.x, xyz.y, z, layer);
            } else // might be list in JSON string
            {
                var uid_list;
                try {
                    uid_list = JSON.parse(tile_type);
                } catch (e) {
                    uid_list = null;
                }

                if (uid_list === null)
                    return;

                var i, cnt = uid_list.length,
                    xyz;
                for (i = 0; i < cnt; i++) {
                    xyz = this.uid2xyz(uid_list[i]);
                    if (xyz == null)
                        continue;
                    this.CreateChess(chess_type, xyz.x, xyz.y, z, layer);
                }
            }

        }
    };

    Acts.prototype.FillChess = function (tile_type, layer, z) {
        // not support in infinityMode
        if (this.infinityMode)
            return;

        if (!tile_type)
            return false;
        if (z == null)
            z = 0;
        var x, y;
        for (y = 0; y <= this.y_max; y++) {
            for (x = 0; x <= this.x_max; x++) {
                this.CreateChess(tile_type, x, y, z, layer);
            }
        }
    };

    Acts.prototype.SetWrapMode = function (enable) {
        this.isWrapMode = (enable == 1);
    };

    Acts.prototype.PickChess = function (chess_type) {
        this.PickChess(chess_type);
    };

    Acts.prototype.PickChessAtLX = function (chess_type, x) {
        this.PickChessAtLX(chess_type, x);
    };

    Acts.prototype.PickChessAtLY = function (chess_type, y) {
        this.PickChessAtLY(chess_type, y);
    };

    Acts.prototype.PickChessAtLZ = function (chess_type, z) {
        this.PickChessAtLZ(chess_type, z);
    };

    Acts.prototype.MoveChessLZ = function (chess_type, z) {
        var chess_uid = getUID(chess_type);
        if (chess_uid == null)
            return;

        var xyz = this.uid2xyz(chess_uid);
        if (xyz == null)
            return;

        this.RemoveChess(chess_uid);
        this.AddChess(chess_uid, xyz.x, xyz.y, z);
    };

    Acts.prototype.MoveChessLXY = function (chess_type, x, y) {
        var chess_uid = getUID(chess_type);
        if (chess_uid == null)
            return;

        var xyz = this.uid2xyz(chess_uid);
        if (xyz == null)
            return;

        this.RemoveChess(chess_uid);
        this.AddChess(chess_uid, x, y, xyz.z);
    };

    Acts.prototype.PickChessInsideSquare = function (chess_type, x0, x1, y0, y1) {
        this.PickChessInsideSquare(chess_type, x0, x1, y0, y1);
    };
    //////////////////////////////////////
    // Expressions
    function Exps() {};
    pluginProto.exps = new Exps();

    Exps.prototype.UID2LX = function (ret, uid) {
        var xyz = this.uid2xyz(uid);
        var x = (xyz == null) ? (-1) : xyz.x;
        ret.set_int(x);
    };

    Exps.prototype.UID2LY = function (ret, uid) {
        var xyz = this.uid2xyz(uid);
        var y = (xyz == null) ? (-1) : xyz.y;
        ret.set_int(y);
    };

    Exps.prototype.UID2LZ = function (ret, uid) {
        var xyz = this.uid2xyz(uid);
        var z = (xyz == null) ? (-1) : xyz.z;
        ret.set_any(z);
    };

    Exps.prototype.LXYZ2UID = function (ret, x, y, z) {
        var uid = this.xyz2uid(x, y, z);
        if (uid == null)
            uid = -1;
        ret.set_any(uid);
    };

    Exps.prototype.LZ2UID = function (ret, uid, z) {
        var ret_uid = this.lz2uid(uid, z);
        if (ret_uid == null)
            ret_uid = (-1);
        ret.set_any(ret_uid);
    };

    Exps.prototype.LXY2PX = function (ret, x, y) {
        var px = this.GetLayout().LXYZ2PX(x, y, 0);
        ret.set_float(px);
    };

    Exps.prototype.LXY2PY = function (ret, x, y) {
        var py = this.GetLayout().LXYZ2PY(x, y, 0);
        ret.set_float(py);
    };

    Exps.prototype.UID2PX = function (ret, uid) {
        var xyz = this.uid2xyz(uid);
        var px = (xyz) ? this.GetLayout().LXYZ2PX(xyz.x, xyz.y) : -1;
        ret.set_float(px);
    };

    Exps.prototype.UID2PY = function (ret, uid) {
        var xyz = this.uid2xyz(uid);
        var py = (xyz) ? this.GetLayout().LXYZ2PY(xyz.x, xyz.y) : -1;
        ret.set_float(py);
    };

    Exps.prototype.UID2LA = function (ret, uid_o, uid_to) {
        var angle;
        var xyz_o = this.uid2xyz(uid_o);
        var xyz_to = this.uid2xyz(uid_to);
        if ((xyz_o == null) || (xyz_to == null))
            angle = (-1);
        else {
            angle = this.GetLayout().XYZ2LA(xyz_o, xyz_to);
            if (angle == null)
                angle = (-1);
        }
        ret.set_float(angle);
    };

    Exps.prototype.LXYZ2PX = function (ret, lx, ly, lz) {
        ret.set_float(this.GetLayout().LXYZ2PX(lx, ly, lz));
    };

    Exps.prototype.LXYZ2PY = function (ret, lx, ly, lz) {
        ret.set_float(this.GetLayout().LXYZ2PY(lx, ly, lz));
    };

    Exps.prototype.UID2ZCnt = function (ret, uid) {
        var cnt;
        var xyz = this.uid2xyz(uid);
        if (xyz != null)
            cnt = this.xy2zCnt(xyz.x, xyz.y);
        else
            cnt = 0;
        ret.set_int(cnt);
    };

    Exps.prototype.LXY2ZCnt = function (ret, x, y) {
        var cnt = this.xy2zCnt(x, y);
        ret.set_int(cnt);
    };

    Exps.prototype.PXY2LX = function (ret, px, py) {
        ret.set_int(this.GetLayout().PXY2LX(px, py));
    };

    Exps.prototype.PXY2LY = function (ret, px, py) {
        ret.set_int(this.GetLayout().PXY2LY(px, py));
    };

    Exps.prototype.DIR2UID = function (ret, uid, dir, z) {
        var ret_uid = this.dir2uid(uid, dir, z);
        if (ret_uid == null)
            ret_uid = (-1);
        ret.set_any(ret_uid);
    };

    Exps.prototype.BoardWidth = function (ret) {
        ret.set_int(this.x_max + 1);
    };

    Exps.prototype.BoardHeight = function (ret) {
        ret.set_int(this.y_max + 1);
    };

    Exps.prototype.PXY2NearestPX = function (ret, px, py) {
        var layout = this.GetLayout();
        var lx = layout.PXY2LX(px, py);
        var ly = layout.PXY2LY(px, py);
        lx = cr.clamp(Math.round(lx), 0, this.x_max);
        ly = cr.clamp(Math.round(ly), 0, this.y_max);
        ret.set_float(layout.LXYZ2PX(lx, ly, 0));
    };

    Exps.prototype.PXY2NearestPY = function (ret, px, py) {
        var layout = this.GetLayout();
        var lx = layout.PXY2LX(px, py);
        var ly = layout.PXY2LY(px, py);
        lx = cr.clamp(Math.round(lx), 0, this.x_max);
        ly = cr.clamp(Math.round(ly), 0, this.y_max);
        ret.set_float(layout.LXYZ2PY(lx, ly, 0));
    };

    Exps.prototype.LogicDistance = function (ret, uid_A, uid_B) {
        var xyz_A = this.uid2xyz(uid_A);
        var xyz_B = this.uid2xyz(uid_B);
        var distanc;
        if ((xyz_A == null) || (xyz_B == null))
            distanc = (-1)
        else
            distanc = this.GetLayout().LXYZ2Dist(xyz_B.x, xyz_B.y, xyz_B.z, xyz_A.x, xyz_A.y, xyz_A.z);

        ret.set_float(distanc);
    };

    Exps.prototype.EmptyLX = function (ret) {
        ret.set_int(this.exp_EmptyLX);
    };

    Exps.prototype.EmptyLY = function (ret) {
        ret.set_int(this.exp_EmptyLY);
    };

    Exps.prototype.DirCount = function (ret) {
        ret.set_int(this.GetLayout().GetDirCount());
    };

    Exps.prototype.NeigborUID2DIR = function (ret, uid_A, uid_B) {
        var dir = this.uid2NeighborDir(uid_A, uid_B);
        if (dir == null)
            dir = (-1);
        ret.set_int(dir);
    };

    Exps.prototype.ALLDIRECTIONS = function (ret) {
        ret.set_int(ALLDIRECTIONS);
    };

    Exps.prototype.PXY2UID = function (ret, px, py, lz) {
        if (lz == null)
            lz = 0;
        var layout = this.GetLayout();
        var lx = layout.PXY2LX(px, py);
        var ly = layout.PXY2LY(px, py);
        var uid = this.xyz2uid(lx, ly, lz);
        if (uid == null)
            uid = -1;
        ret.set_any(uid);
    };

    Exps.prototype.CurLX = function (ret) {
        ret.set_int(this.exp_CurLX);
    };

    Exps.prototype.CurLY = function (ret) {
        ret.set_int(this.exp_CurLY);
    };

    Exps.prototype.CurLZ = function (ret) {
        ret.set_any(this.exp_CurLZ);
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
    // general CreateObject function which call a callback before "OnCreated" triggered
    if (window.RexC2CreateObject != null)
        return;

    // copy from system action: CreateObject
    var CreateObject = function (obj, layer, x, y, callback, ignore_picking) {
        if (!layer || !obj)
            return;

        var inst = this.runtime.createInstance(obj, layer, x, y);

        if (inst == null)
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
    // logical XYZ structure recycle
    if (window.RexC2BoardLXYZCache != null)
        return;

    var LXYZCacheKlass = function () {
        this.lines = [];
    };
    var LXYZCacheKlassProto = LXYZCacheKlass.prototype;

    LXYZCacheKlassProto.allocLine = function (x, y, z) {
        var l = (this.lines.length > 0) ? this.lines.pop() : {};
        l.x = x;
        l.y = y;
        l.z = z;
        return l;
    };
    LXYZCacheKlassProto.freeLine = function (l) {
        this.lines.push(l);
    };
    LXYZCacheKlassProto.freeLinesInDict = function (d) {
        var k;
        for (k in d) {
            this.lines.push(d[k]);
            delete d[k];
        }
    };
    LXYZCacheKlassProto.freeLinesInArr = function (arr) {
        var i, len;
        for (i = 0, len = arr.length; i < len; i++)
            this.freeLine(arr[i]);
        arr.length = 0;
    };
    window.RexC2BoardLXYZCache = new LXYZCacheKlass();
}());