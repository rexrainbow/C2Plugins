// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Graph = function (runtime) {
    this.runtime = runtime;
};

(function () {
    var pluginProto = cr.plugins_.Rex_Graph.prototype;

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
    var DIRAtoB = 1;
    var DIRBtoA = 2;
    instanceProto.onCreate = function () {
        this.check_name = "GRAPH";
        this.vertices = {}; // {vertex: {edge:true, ...} }
        this.edges = {}; // {edge: {vA:vertex, vB:vertex, dir:1,2,3} }
        this.group = null;
        this.groupUid = -1; // for loading   

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
        this.RemoveAll();
        this.runtime.removeDestroyCallback(this.myDestroyCallback);
    };

    instanceProto.onInstanceDestroyed = function (inst) {
        this.RemoveVertex(inst.uid);
        this.RemoveEdge(inst.uid);
    };

    instanceProto.GetInstGroup = function () {
        if (this.group != null)
            return this.group;

        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins) {
            inst = plugins[name].instances[0];

            if (cr.plugins_.Rex_gInstGroup && (inst instanceof cr.plugins_.Rex_gInstGroup.prototype.Instance)) {
                this.group = inst;
                return this.group;
            }
        }
        assert2(this.group, "Graph movement plugin: Can not find instance group oject.");
        return null;
    };

    instanceProto.IsEdge = function (UID) {
        return this.edges.hasOwnProperty(UID);
    };

    instanceProto.IsVertex = function (UID) {
        return this.vertices.hasOwnProperty(UID);
    };

    instanceProto.IsInGraph = function (UID) {
        return this.IsEdge(UID) || this.IsVertex(UID);
    };

    instanceProto.GetEdge = function (UID, newIfNotExists) {
        if (newIfNotExists && !this.IsEdge(UID))
            this.edges[UID] = {};

        return this.edges[UID];
    };

    instanceProto.GetAnotherVertexUID = function (edgeUID, vertexUID) {
        var edge = this.GetEdge(edgeUID);
        if (edge.vA !== vertexUID)
            return edge.vA;
        else
            return edge.vB;
    };

    instanceProto.GetEdgeLength = function (UID) {
        var edge = this.GetEdge(UID);
        if (!edge)
            return null;

        var instVA = this.uid2inst(edge.vA);
        var instVB = this.uid2inst(edge.vB);
        if (!instVA || !instVB)
            return null;

        return cr.distanceTo(instVA.x, instVA.y, instVB.x, instVB.y);
    };

    instanceProto.GetVABDistance = function (vAUID, vBUID) {
        var instVA = this.uid2inst(vAUID);
        var instVB = this.uid2inst(vBUID);
        if (!instVA || !instVB)
            return null;

        return cr.distanceTo(instVA.x, instVA.y, instVB.x, instVB.y);
    };
    instanceProto.GetVABAngle = function (vAUID, vBUID) {
        var instVA = this.uid2inst(vAUID);
        var instVB = this.uid2inst(vBUID);
        if (!instVA || !instVB)
            return null;

        return cr.angleTo(instVA.x, instVA.y, instVB.x, instVB.y);
    };
    instanceProto.GetVertex = function (UID, newIfNotExists) {
        if (newIfNotExists && !this.IsVertex(UID))
            this.vertices[UID] = {};

        return this.vertices[UID];
    };

    instanceProto.AddEdge = function (edgeUID, vAUID, vBUID, dir) {
        var edge = this.GetEdge(edgeUID, true);
        edge.dir = dir;
        edge.vA = vAUID;
        edge.vB = vBUID;

        var vA = this.GetVertex(vAUID, true);
        var vB = this.GetVertex(vBUID, true);
        if (dir & DIRAtoB)
            vA[edgeUID] = true;
        if (dir & DIRBtoA)
            vB[edgeUID] = true;
    };

    instanceProto.AddVertex = function (UID) {
        return this.GetVertex(UID, true);
    };

    instanceProto.RemoveEdge = function (UID) {
        if (!this.edges.hasOwnProperty(UID))
            return;

        delete this.edges[UID];
    };

    instanceProto.RemoveVertex = function (UID) {
        if (!this.vertices.hasOwnProperty(UID))
            return;

        var vertex = this.GetVertex(UID);
        for (var eUID in vertex)
            this.RemoveEdge(eUID);

        delete this.vertices[UID];
    };

    instanceProto.RemoveAll = function () {
        for (var k in this.vertices) {
            this.RemoveVertex(k);
        }
    };

    instanceProto.IsInLoop = function (vUID) {
        var queue = [];
        var addedEdgeUID = {};
        var edgeUID, edges, node, pUID, cUID;
        queue.push([vUID, null]);
        while (queue.length > 0) {
            node = queue.pop();
            pUID = node[0];
            edgeUID = node[1];
            if ((pUID === vUID) && (edgeUID !== null))
                return true;

            if (edgeUID !== null)
                addedEdgeUID[edgeUID] = true;

            edges = this.GetVertex(pUID);
            for (edgeUID in edges) {
                if (addedEdgeUID.hasOwnProperty(edgeUID))
                    continue;

                cUID = this.GetAnotherVertexUID(edgeUID, pUID);
                queue.push([cUID, edgeUID]);
            }
        }
        return false;
    };

    instanceProto.uid2inst = function (uid, ignored_check) {
        var uid_digital = parseInt(uid);
        if (typeof (uid_digital) !== "number")
            return null;
        else if (uid_digital < 0)
            return null;
        else if (!ignored_check && !this.IsInGraph(uid)) // not on the board
            return null;
        else
            return this.runtime.getObjectByUID(uid);
    };

    instanceProto.PickUIDs = function (uids, objType) {
        if (!objType)
            return false;

        return window.RexC2PickUIDs.call(this, uids, objType);
    };

    instanceProto.PickVerticesOfEdge = function (edge_type, vertexA_type, vertexB_type) {
        if ((edge_type == null) || (vertexA_type == null) || (vertexB_type == null))
            return false;


        var eInstsAreObject = (typeof (edge_type) === "object");
        var outputAreObject = (typeof (vertexA_type) === "object");
        var eInsts;
        if (eInstsAreObject)
            eInsts = edge_type.getCurrentSol().getObjects();
        else // UID or symbol
            eInsts = [edge_type];

        var i, cnt = eInsts.length,
            eInst, edgeUID, edge, vUID;
        var vAs = {},
            vBs = {};
        for (i = 0; i < cnt; i++) {
            eInst = eInsts[i];
            edgeUID = (eInstsAreObject) ? eInst.uid : eInst;
            edge = this.GetEdge(edgeUID);

            if (!isNaN(edge.vA))
                vAs[edge.vA] = true;

            if (!isNaN(edge.vB))
                vBs[edge.vB] = true;
        }

        // output
        var has_inst;
        if (vertexA_type === vertexB_type) {
            _uids.length = 0;
            for (var vUID in vAs) {
                _uids.push(parseInt(vUID));
            }
            for (var vUID in vBs) {
                if (vAs.hasOwnProperty(vUID))
                    continue;

                _uids.push(parseInt(vUID));
            }
            if (outputAreObject)
                has_inst = this.PickUIDs(_uids, vertexA_type);
            else {
                this.GetInstGroup().GetGroup(vertexA_type).SetByUIDList(_uids);
                has_inst = (_uids.length > 0);
            }
            _uids.length = 0;
        } else {
            _uids.length = 0;
            for (vUID in vAs) {
                _uids.push(parseInt(vUID));
            }
            var has_instVA;
            if (outputAreObject)
                has_instVA = this.PickUIDs(_uids, vertexA_type);
            else {
                this.GetInstGroup().GetGroup(vertexA_type).SetByUIDList(_uids);
                has_instVA = (_uids.length > 0);
            }
            _uids.length = 0;

            for (vUID in vBs) {
                _uids.push(parseInt(vUID));
            }
            var has_instVB;
            if (outputAreObject)
                has_instVB = this.PickUIDs(_uids, vertexB_type);
            else {
                this.GetInstGroup().GetGroup(vertexB_type).SetByUIDList(_uids);
                has_instVB = (_uids.length > 0);
            }
            has_inst = has_instVA | has_instVB;
        }

        return has_inst;
    };

    instanceProto.PickEdgesOfVertex = function (vertex_type, edge_type) {
        if ((vertex_type == null) || (edge_type == null))
            return false;

        var vInstsAreObject = (typeof (vertex_type) === "object");
        var outputAreObject = (typeof (edge_type) === "object");

        var vInsts;
        if (vInstsAreObject)
            vInsts = vertex_type.getCurrentSol().getObjects();
        else // UID or symbol
            vInsts = [vertex_type];

        var i, cnt = vInsts.length,
            vInst, vUID, vertex, vUID, edgeUID;
        for (i = 0; i < cnt; i++) {
            vInst = vInsts[i];
            vUID = (vInstsAreObject) ? vInst.uid : vInst;
            vertex = this.GetVertex(vUID);
            if (!vertex)
                continue;

            for (edgeUID in vertex) {
                if (isNaN(edgeUID))
                    continue;

                _uids.push(parseInt(edgeUID));
            }

        }

        // output        
        var has_inst;
        if (outputAreObject)
            has_inst = this.PickUIDs(_uids, edge_type);
        else {
            this.GetInstGroup().GetGroup(edge_type).SetByUIDList(_uids);
            has_inst = (_uids.length > 0);
        }
        _uids.length = 0;
        return has_inst;
    };

    instanceProto.PickNeighborVertices = function (vUID, vertex_type) {
        if (vertex_type == null)
            return false;

        var outputAreObject = (typeof (vertex_type) === "object");

        var vertex = this.GetVertex(vUID);
        if (vertex) {
            for (var edgeUID in vertex) {
                _uids.push(this.GetAnotherVertexUID(edgeUID, vUID));
            }
        }

        var has_inst;
        if (outputAreObject)
            has_inst = this.PickUIDs(_uids, vertex_type);
        else {
            this.GetInstGroup().GetGroup(vertex_type).SetByUIDList(_uids);
            has_inst = (_uids.length > 0);
        }
        _uids.length = 0;
        return has_inst;
    };

    instanceProto.PickAllConnectedVertices = function (vUID, vertex_type, travelMethod, includeStart) {
        var outputAreObject = (typeof (vertex_type) === "object");

        if (!this.IsVertex(vUID)) {
            if (outputAreObject)
                this.PickUIDs(_uids, vertex_type);
            else
                this.GetInstGroup().GetGroup(vertex_type).SetByUIDList(_uids);
            return false;
        }

        var isBFS = (travelMethod === 0);
        var queue = [];
        var addedVertexUID = {};
        var addUID = function (uid) {
            if (addedVertexUID.hasOwnProperty(uid))
                return false;

            addedVertexUID[uid] = true;
            _uids.push(uid);
            return true;
        };

        var edges, edgeUID, addSuccess, pUID, cUID;
        queue.push(vUID);
        while (queue.length > 0) {
            if (isBFS)
                pUID = queue.shift();
            else
                pUID = queue.pop();

            addSuccess = addUID(pUID);
            if (!addSuccess)
                continue;

            edges = this.GetVertex(pUID);
            for (edgeUID in edges) {
                cUID = this.GetAnotherVertexUID(edgeUID, pUID);
                if (!addedVertexUID.hasOwnProperty(cUID))
                    queue.push(cUID);
            }
        }

        if (!includeStart)
            _uids.shift();

        // output
        var has_inst;
        if (outputAreObject)
            has_inst = this.PickUIDs(_uids, vertex_type);
        else {
            this.GetInstGroup().GetGroup(vertex_type).SetByUIDList(_uids);
            has_inst = (_uids.length > 0);
        }
        _uids.length = 0;
        return has_inst;
    };

    instanceProto.PickAllVertices = function (vertex_type) {
        if (vertex_type == null)
            return false;
        var outputAreObject = (typeof (vertex_type) === "object");

        for (var vUID in this.vertices) {
            _uids.push(vUID);
        }

        // output
        var has_inst;
        if (outputAreObject)
            has_inst = this.PickUIDs(_uids, vertex_type);
        else {
            this.GetInstGroup().GetGroup(vertex_type).SetByUIDList(_uids);
            has_inst = (_uids.length > 0);
        }
        _uids.length = 0;
        return has_inst;
    };

    instanceProto.PickAllEdges = function (edge_type) {
        if (edge_type == null)
            return false;
        var outputAreObject = (typeof (edge_type) === "object");

        for (var edgeUIDUID in this.edges) {
            _uids.push(edgeUIDUID);
        }

        // output
        var has_inst;
        if (outputAreObject)
            has_inst = this.PickUIDs(_uids, edge_type);
        else {
            this.GetInstGroup().GetGroup(edge_type).SetByUIDList(_uids);
            has_inst = (_uids.length > 0);
        }
        _uids.length = 0;
        return has_inst;
    };

    instanceProto.saveToJSON = function () {
        var vertices_save = {},
            v;
        for (var k in this.vertices) {
            if (!isNaN(k))
                k = parseInt(k);

            vertices_save[k] = [];
            v = this.vertices[k];
            for (var e in v) {
                if (!isNaN(e))
                    e = parseInt(e);
                vertices_save[k].push(e);
            }
        }
        var edges_save = {},
            edge;
        for (var k in this.edges) {
            edge = this.edges[k];
            edges_save[k] = [edge.vA, edge.vB, edge.dir];
        }
        return {
            "v": vertices_save,
            "e": edges_save
        };
    };

    instanceProto.loadFromJSON = function (o) {
        this.vertices = {};
        var vertices_save = o["v"],
            v, i, cnt;
        for (var k in vertices_save) {
            if (!isNaN(k))
                k = parseInt(k);

            v = vertices_save[k];
            cnt = v.length;
            this.vertices[k] = {};
            for (i = 0; i < cnt; i++)
                this.vertices[k][v[i]] = true;
        }

        var edge, edges_save = o["e"];
        this.edges = {};
        for (var k in edges_save) {
            edge = edges_save[k];
            var o = {};
            o.vA = edge[0];
            o.vB = edge[1];
            o.dir = edge[2];
            this.edges[k] = o;
        }
    };
    //////////////////////////////////////
    // Conditions
    function Cnds() {};
    pluginProto.cnds = new Cnds();

    Cnds.prototype.PickVerticesOfEdge = function (edge_type, vertexA_type, vertexB_type) {
        return this.PickVerticesOfEdge(edge_type, vertexA_type, vertexB_type);
    };

    Cnds.prototype.PickEdgesOfVertex = function (vertex_type, edge_type) {
        return this.PickEdgesOfVertex(vertex_type, edge_type);
    };

    Cnds.prototype.PickNeighborVertices = function (vUID, vertex_type) {
        return this.PickNeighborVertices(vUID, vertex_type);
    };

    Cnds.prototype.PickAllConnectedVertices = function (vUID, vertex_type, travelMethod, includeStart) {
        return this.PickAllConnectedVertices(vUID, vertex_type, travelMethod, includeStart);
    };

    Cnds.prototype.PickAllVertices = function (vertex_type) {
        return this.PickAllVertices(vertex_type);
    };

    Cnds.prototype.PickAllEdges = function (edge_type) {
        return this.PickAllEdges(edge_type);
    };

    Cnds.prototype.AreNeighbor = function (vAUID, vBUID) {
        if (!this.IsVertex(vAUID) || !this.IsVertex(vBUID))
            return false;

        var vertexA = this.GetVertex(vAUID);
        for (var edgeUID in vertexA) {
            if (this.GetAnotherVertexUID(edgeUID, vAUID) === vBUID)
                return true;
        }
        var vertexB = this.GetVertex(vBUID);
        for (var edgeUID in vertexB) {
            if (this.GetAnotherVertexUID(edgeUID, vBUID) === vAUID)
                return true;
        }
        return false;
    };

    Cnds.prototype.IsInLoop = function (vUID) {
        return this.IsInLoop(vUID);
    };
    //////////////////////////////////////
    // Actions
    function Acts() {};
    pluginProto.acts = new Acts();

    var DIRNUMMAP = [DIRAtoB, DIRBtoA, (DIRAtoB + DIRBtoA)];
    var DIRSTRMAP = {
        "->": DIRAtoB,
        "<-": DIRBtoA,
        "<->": (DIRAtoB + DIRBtoA)
    };
    Acts.prototype.AddEdge = function (edgeUID, vAUID, vBUID, dir) {
        if (typeof (dir) === "number")
            dir = DIRNUMMAP[dir];
        else
            dir = DIRSTRMAP[dir];
        this.AddEdge(edgeUID, vAUID, vBUID, dir);
    };

    Acts.prototype.AddVertex = function (UID) {
        this.AddVertex(UID);
    };

    Acts.prototype.RemoveEdge = function (UID) {
        this.RemoveEdge(UID);
    };

    Acts.prototype.RemoveVertex = function (UID) {
        this.RemoveVertex(UID);
    };

    Acts.prototype.RemoveAll = function () {
        this.RemoveAll();
    };
    Acts.prototype.PickVerticesOfEdge = function (edge_type, vertexA_type, vertexB_type) {
        this.PickVerticesOfEdge(edge_type, vertexA_type, vertexB_type);
    };

    Acts.prototype.PickEdgesOfVertex = function (vertex_type, edge_type) {
        this.PickEdgesOfVertex(vertex_type, edge_type);
    };

    Acts.prototype.PickNeighborVertices = function (vUID, vertex_type) {
        this.PickNeighborVertices(vUID, vertex_type);
    };

    Acts.prototype.PickAllConnectedVertices = function (vUID, vertex_type, travelMethod, includeStart) {
        this.PickAllConnectedVertices(vUID, vertex_type, travelMethod, includeStart);
    };

    Acts.prototype.PickAllVertices = function (vertex_type) {
        this.PickAllVertices(vertex_type);
    };

    Acts.prototype.PickAllEdges = function (edge_type) {
        this.PickAllEdges(edge_type);
    };
    //////////////////////////////////////
    // Expressions
    function Exps() {};
    pluginProto.exps = new Exps();

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