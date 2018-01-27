// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGMovement = function (runtime) {
    this.runtime = runtime;
};

(function () {
    var pluginProto = cr.plugins_.Rex_SLGMovement.prototype;

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

    var GLOBOL_NODES = {};
    instanceProto.onCreate = function () {
        this.pathMode = this.properties[0];
        this.cacheCostMode = (this.properties[1] === 1);
        this.shuffleNeighborsMode = (this.properties[2] === 1);
        this.weightHeuristic = this.properties[3];

        this.board = null;
        this.boardUid = -1; // for loading         
        this.group = null;
        this.groupUid = -1; // for loading        
        this.randomGen = null;
        this.randomGenUid = -1; // for loading
        this.costFnName = null;
        this.filterFnName = null;
        this.costValue = 0;
        this.filterUIDList = [];
        this.isCostFnMode = null;
        this.neighborsLXY = [];
        this.uid2cost = {};

        this.exp_ChessUID = -1;
        this.exp_StartTileUID = -1;
        this.exp_StartX = -1;
        this.exp_StartY = -1;
        this.exp_NearestTileUID = -1;
        this.exp_CurTile = null;
        this.exp_PreTile = null;
        this.exp_EndTileUID = -1;
        this.exp_EndX = -1;
        this.exp_EndY = -1;
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
        assert2(this.group, "SLG movement plugin: Can not find instance group oject.");
        return null;
    };

    instanceProto.IsInsideBoard = function (x, y, z) {
        return this.GetBoard().IsInsideBoard(x, y, z);
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
        return this.GetBoard().xyz2uid(x, y, z);
    };

    instanceProto.uid2xyz = function (uid) {
        return this.GetBoard().uid2xyz(uid);
    };

    instanceProto.lz2uid = function (uid, lz) {
        return this.GetBoard().lz2uid(uid, lz);
    };

    instanceProto.lxy2dist = function (lx0, ly0, lx1, ly1) {
        return this.GetBoard().GetLayout().LXYZ2Dist(lx1, ly1, 0, lx0, ly0, 0, true);
    };
    instanceProto.lxy2px = function (lx, ly) {
        return this.GetBoard().GetLayout().LXYZ2PX(lx, ly, 0);
    };

    instanceProto.lxy2py = function (lx, ly) {
        return this.GetBoard().GetLayout().LXYZ2PY(lx, ly, 0);
    };

    var prop_BLOCKING = -1;
    var prop_INFINITY = -1;
    instanceProto.getCostFromEvent = function (currentNode, previousNode) {
        var cost;
        if (this.isCostFnMode) {
            this.exp_CurTile = currentNode;
            this.exp_PreTile = previousNode;
            this.costValue = prop_BLOCKING;
            this.runtime.trigger(cr.plugins_.Rex_SLGMovement.prototype.cnds.OnCostFn, this);
            this.exp_CurTile = null;
            this.exp_PreTile = null;
            cost = this.costValue;
        } else
            cost = this.costFnName;
        return cost;
    };

    instanceProto.resetNeighborsLXY = function (dirCount) {
        if (this.neighborsLXY.length > dirCount) {
            this.neighborsLXY.length = dirCount;
        } else if (this.neighborsLXY.length < dirCount) {
            for (var i = this.neighborsLXY.length; i < dirCount; i++) {
                this.neighborsLXY.push({
                    x: 0,
                    y: 0
                });
            }
        }
    };

    instanceProto.getNeighborsLXY = function (_x, _y) {
        var board = this.GetBoard();
        this.resetNeighborsLXY(board.GetLayout().GetDirCount());
        var dir;
        var neighborsCnt = this.neighborsLXY.length;
        for (dir = 0; dir < neighborsCnt; dir++) {
            this.neighborsLXY[dir].x = board.GetNeighborLX(_x, _y, dir);
            this.neighborsLXY[dir].y = board.GetNeighborLY(_x, _y, dir);
        }

        if (this.shuffleNeighborsMode) {
            _shuffle(this.neighborsLXY, this.randomGen);
        }
        return this.neighborsLXY;
    };

    var _shuffle = function (arr, randomGen) {
        if (randomGen == null)
            randomGen = Math;

        var i = arr.length,
            j, temp;
        if (i == 0) return;
        while (--i) {
            j = Math.floor(randomGen.random() * (i + 1));
            temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    };

    instanceProto.RandomInt = function (a, b) {
        return Math.floor(this.Random() * (b - a) + a);
    };

    instanceProto.Random = function () {
        return (this.randomGen == null) ?
            Math.random() : this.randomGen.random();
    };

    instanceProto.UID2DIR = function (t0_uid, t1_uid) {
        var t0_xyz = this.uid2xyz(t0_uid);
        var t1_xyz = this.uid2xyz(t1_uid);
        var dir = this.GetBoard().GetLayout().XYZ2Dir(t0_xyz, t1_xyz);
        return dir;
    };

    instanceProto.setupCostFunction = function (cost) {
        this.costFnName = cost;
        this.isCostFnMode = (typeof cost == "string");
    };

    instanceProto.getTileUID = function (chessUID) {
        var chess_xyz = this.uid2xyz(chessUID);
        if (chess_xyz == null)
            return null;
        var tileUID = this.xyz2uid(chess_xyz.x, chess_xyz.y, 0);
        return tileUID;
    };

    instanceProto.requestInit = function () {
        cleanTable(this.uid2cost);
        this.exp_NearestTileUID = -1;
    };

    instanceProto.getStartUID = function (chessUID) {
        var startTileUID = this.getTileUID(chessUID);
        if (startTileUID != null) {
            this.exp_StartTileUID = startTileUID;
            var xyz = this.uid2xyz(startTileUID);
            this.exp_StartX = xyz.x;
            this.exp_StartY = xyz.y;
        } else {
            this.exp_StartTileUID = -1;
            this.exp_StartX = -1;
            this.exp_StartY = -1;
        }

        return startTileUID;
    };

    instanceProto.getMoveableArea = function (chessUID, movingPoints, cost) {
        var startTileUID = this.getStartUID(chessUID);
        if (startTileUID == null)
            return [];

        var nodes = this.AStartSearch(startTileUID, null, movingPoints, cost, CMD_AREA);
        if (nodes == null)
            return [];

        var areaTilesUIDList = this.getAStartClosedNodes(nodes);
        cr.arrayFindRemove(areaTilesUIDList, startTileUID);
        this.releaseAStartNodes();
        return areaTilesUIDList;
    };

    instanceProto.getMovingPath = function (chessUID, endTileUID, movingPoints, cost, isNearest) {
        var startTileUID = this.getStartUID(chessUID);
        if (startTileUID == null)
            return [];

        var searchCmd = (isNearest === 1) ? CMD_PATH_NEAREST : CMD_PATH;
        var nodes = this.AStartSearch(startTileUID, endTileUID, movingPoints, cost, searchCmd);
        if (nodes == null)
            return [];

        if (isNearest === 1)
            endTileUID = this.exp_NearestTileUID;

        var startNode = nodes[startTileUID];
        var pathUIDs = nodes[endTileUID].path2Root(startNode);
        this.releaseAStartNodes();
        return pathUIDs;
    };

    // ----
    // javascript-astar 0.3.0
    // http://github.com/bgrins/javascript-astar
    // Freely distributable under the MIT License.
    // Implements the astar search algorithm in javascript using a Binary Heap.
    // Includes Binary Heap (with modifications) from Marijn Haverbeke.
    // http://eloquentjavascript.net/appendix2.html    
    // ----
    var CMD_PATH = 0;
    var CMD_PATH_NEAREST = 1;
    var CMD_AREA = 16;
    instanceProto.AStartSearch = function (startTileUID, endTileUID, movingPoints, cost, searchCmd) {
        // path mode: 0=Random, 1=Diagonal, 2=Straight, 3=A*, 4=Line, 5=A* -line, 6=A* -random

        var IS_PATH_SEARCH = (searchCmd == CMD_PATH) || (searchCmd == CMD_PATH_NEAREST);
        var IS_AREA_SEARCH = (searchCmd == CMD_AREA);
        var isAStart = (this.pathMode == 3) || (this.pathMode == 5) || (this.pathMode == 6);
        var astarHeuristicEnable = IS_PATH_SEARCH && isAStart;
        var shortestPathEnable = IS_PATH_SEARCH && (!isAStart);
        var astarHeuristicMode = (!astarHeuristicEnable) ? null :
            (this.pathMode == 3) ? 0 :
            (this.pathMode == 5) ? 1 :
            (this.pathMode == 6) ? 2 :
            null;


        this.setupCostFunction(cost);

        var end = (endTileUID != null) ? this.getAStartNode(endTileUID) : null;
        //if ((end != null) && (searchCmd == CMD_PATH))
        //{
        //    var neighbors = end.getNeighborNodes();
        //    var il = neighbors.length;
        //    var all_walls = true;
        //    for(var i=0; i<il; ++i) 
        //    {
        //        if ( !isWall( end.getCost(neighbors[i]) ) )
        //        {
        //            all_walls = false;
        //            break;
        //        }
        //    }
        //    if (all_walls)
        //        return;
        //}

        var start = this.getAStartNode(startTileUID);
        start.h = start.heuristic(end, astarHeuristicMode);

        // NEAREST NODE
        var closestNode = start;
        // helper function to update closerH                
        var updateCloserH = function (node, baseNode) {
            if (astarHeuristicEnable)
                node.closerH = node.h;
            else
                node.closerH = node.closerH || node.heuristic(end, astarHeuristicMode, baseNode);
        };
        if (IS_PATH_SEARCH) {
            updateCloserH(closestNode);
            this.exp_NearestTileUID = closestNode.uid;
        }
        // NEAREST NODE

        openHeap.push(start);
        while (openHeap.size() > 0) {
            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();

            // End case -- result has been found, return the traced path.
            if (astarHeuristicEnable && (currentNode === end)) {
                break;
                //return GLOBOL_NODES;
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;

            // Find all neighbors for the current node.
            var neighbors = currentNode.getNeighborNodes();

            var il = neighbors.length;
            for (var i = 0; i < il; ++i) {
                var neighbor = neighbors[i];
                var neighborCost = neighbor.getCost(currentNode);
                if (neighbor.closed || isWall(neighborCost)) {
                    // Not a valid node to process, skip to next neighbor.
                    //log("("+neighbor.x+","+neighbor.y+") is closed");
                    continue;
                }

                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentNode.g + neighborCost,
                    beenVisited = neighbor.visited;

                //log("("+currentNode.x+","+currentNode.y+") -> ("+neighbor.x+","+neighbor.y+")="+neighborCost+" ,acc="+gScore);
                if ((movingPoints != prop_INFINITY) && (gScore > movingPoints)) {
                    //log("("+neighbor.x+","+neighbor.y+") out of range");
                    continue;
                }

                if (!beenVisited || gScore < neighbor.g) {

                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent.length = 0;
                    neighbor.parent.push(currentNode.uid);
                    neighbor.h = neighbor.h || neighbor.heuristic(end, astarHeuristicMode, start);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    this.uid2cost[neighbor.uid] = gScore;

                    // NEAREST NODE
                    if (IS_PATH_SEARCH) {
                        updateCloserH(neighbor, start);
                        var isNeighborMoreCloser = (neighbor.closerH < closestNode.closerH) ||
                            ((neighbor.closerH === closestNode.closerH) && (neighbor.g < closestNode.g));

                        if (isNeighborMoreCloser) {
                            closestNode = neighbor;
                            this.exp_NearestTileUID = closestNode.uid;
                        }
                    }
                    // NEAREST NODE

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                        //log("push ("+neighbor.x+","+neighbor.y+") ")
                    } else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbor);
                        //log("reorder ("+neighbor.x+","+neighbor.y+") ")
                    }
                } else if (shortestPathEnable && (gScore == neighbor.g)) {
                    neighbor.parent.push(currentNode.uid);

                    //if (neighbor.parent.indexOf(currentNode.uid) == -1)                    
                    //    neighbor.parent.push(currentNode.uid);                    
                    //else                    
                    //    debugger;                 

                    //log("drop ("+neighbor.x+","+neighbor.y+") ")                
                } else {
                    //log("drop ("+neighbor.x+","+neighbor.y+") ")       
                }
            }

        }

        openHeap.clean();
        return GLOBOL_NODES;
    };

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
    var nodeCache = new ObjCacheKlass();

    var GLOBOL_NODES_ORDER_INDEX = -1;
    instanceProto.getAStartNode = function (uid) {
        // create node and put it into GLOBOL_NODES
        GLOBOL_NODES_ORDER_INDEX += 1;
        if (GLOBOL_NODES[uid] == null) {
            var node = nodeCache.allocLine();
            if (node == null)
                node = new nodeKlass(this, uid);
            else
                node.init(this, uid);
            GLOBOL_NODES[uid] = node;
        }
        return GLOBOL_NODES[uid];
    };

    // sorting by created order
    var SORT_BY_ORDER = function (nodeA, nodeB) {
        var indexA = nodeA.orderIndex;
        var indexB = nodeB.orderIndex;
        if (indexA > indexB)
            return 1;
        else if (indexA < indexB)
            return (-1);
        else // (indexA == indexB)
            return 0;
    }
    instanceProto.getAStartClosedNodes = function (nodes) {
        var closedNodes = [];
        var uid, node;
        for (uid in nodes) {
            node = nodes[uid];
            if (node.closed) // get closed node
                closedNodes.push(node);
        }
        closedNodes.sort(SORT_BY_ORDER); // sorting by created order
        var i, cnt = closedNodes.length;
        for (i = 0; i < cnt; i++) {
            closedNodes[i] = closedNodes[i].uid;
        }
        return closedNodes;
    };
    instanceProto.releaseAStartNodes = function () {
        // release all nodes into node cache
        var uid;
        for (uid in GLOBOL_NODES) {
            nodeCache.freeLine(GLOBOL_NODES[uid]);
            delete GLOBOL_NODES[uid];
        }
        GLOBOL_NODES_ORDER_INDEX = -1;
    };

    var nodeKlass = function (plugin, uid) {
        this.parent = [];
        this.init(plugin, uid);
    };
    var nodeKlassProto = nodeKlass.prototype;
    nodeKlassProto.init = function (plugin, uid) {
        this.orderIndex = GLOBOL_NODES_ORDER_INDEX; // for sorting by created order
        var _xyz = plugin.uid2xyz(uid);
        this.plugin = plugin;
        this.uid = uid;
        this.x = _xyz.x;
        this.y = _xyz.y;
        this.px = null;
        this.py = null;
        this.cost = null;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.closerH = 0;
        this.visited = false;
        this.closed = false;
        this.parent.length = 0;
    };
    nodeKlassProto.heuristic = function (endNode, pathMode, baseNode) {
        if (pathMode === null)
            return 0;

        var h;
        var dist = this.plugin.lxy2dist(endNode.x, endNode.y, this.x, this.y) * this.plugin.weightHeuristic;

        if ((pathMode === 1) && baseNode) {
            var da = endNode.angleTo(baseNode) - this.angleTo(baseNode);
            h = dist + quickAbs(da);
        } else if (pathMode === 2) {
            h = dist + this.plugin.Random();
        } else {
            h = dist;
        }

        return h;
    };
    nodeKlassProto.getNeighborNodes = function () {
        var neighborsLXY = this.plugin.getNeighborsLXY(this.x, this.y);
        var _n, _uid;
        var neighborNodes = [];
        var i, cnt = neighborsLXY.length;
        for (i = 0; i < cnt; i++) {
            _n = neighborsLXY[i];
            _uid = this.plugin.xyz2uid(_n.x, _n.y, 0);
            if (_uid != null) {
                neighborNodes.push(this.plugin.getAStartNode(_uid));
            }
        }

        return neighborNodes;
    };
    nodeKlassProto.getCost = function (previousNode) {
        var cost;
        if (this.plugin.cacheCostMode) {
            if (this.cost == null) {
                this.cost = this.plugin.getCostFromEvent(this, previousNode);
            }
            cost = this.cost;
        } else {
            cost = this.plugin.getCostFromEvent(this, previousNode);
        }
        return cost;
    };
    var isWall = function (cost) {
        return (cost == prop_BLOCKING);
    };
    nodeKlassProto.path2Root = function (endNode) {
        var isAStartMode = (this.plugin.pathMode == 3) || (this.plugin.pathMode == 5) || (this.plugin.pathMode == 6);
        var isShortestRandomMode = (this.plugin.pathMode == 0);
        var isShortestDiagonalMode = (this.plugin.pathMode == 1);
        var isShortestStraightMode = (this.plugin.pathMode == 2);
        var isShortestLineMode = (this.plugin.pathMode == 4);

        var parentIndex, currentDir = null,
            parentDir, i, cnt;

        if (isShortestLineMode) {
            var startNode = this;
            var ta = endNode.angleTo(startNode);
        }

        var curr = this,
            path = [];
        while (curr.parent.length > 0) {
            path.push(curr.uid);
            cnt = curr.parent.length;

            // get parent
            if (isAStartMode)
                curr = GLOBOL_NODES[curr.parent[0].toString()];

            else if (isShortestRandomMode) {
                parentIndex = (cnt === 1) ? 0 : this.plugin.RandomInt(0, cnt);
                curr = GLOBOL_NODES[curr.parent[parentIndex].toString()];
            } else if (isShortestDiagonalMode) {
                for (i = 0; i < cnt; i++) {
                    parentDir = this.plugin.UID2DIR(curr.uid, curr.parent[i]);
                    if ((parentDir != currentDir) ||
                        (i == (cnt - 1))) // the last one
                    {
                        parentIndex = i;
                        currentDir = parentDir;
                        break;
                    }
                }
                curr = GLOBOL_NODES[curr.parent[parentIndex].toString()];
            } else if (isShortestStraightMode) {
                for (i = 0; i < cnt; i++) {
                    parentDir = this.plugin.UID2DIR(curr.uid, curr.parent[i]);
                    if ((parentDir == currentDir) ||
                        (i == (cnt - 1))) // the last one
                    {
                        parentIndex = i;
                        currentDir = parentDir;
                        break;
                    }
                }
                curr = GLOBOL_NODES[curr.parent[parentIndex].toString()];
            } else if (isShortestLineMode) {
                if (cnt == 1) {
                    curr = GLOBOL_NODES[curr.parent[0].toString()];
                    startNode = curr; // turn in the course
                    ta = endNode.angleTo(startNode);
                } else {
                    var n = GLOBOL_NODES[curr.parent[0].toString()],
                        n_;
                    var da = quickAbs(endNode.angleTo(n) - ta),
                        da_;
                    for (i = 1; i < cnt; i++) {
                        n_ = GLOBOL_NODES[curr.parent[i].toString()];
                        da_ = quickAbs(endNode.angleTo(n_) - ta);
                        if (da_ < da) {
                            n = n_;
                            da = da_;
                        }
                    }
                    curr = n;
                }

            }

        }
        return path.reverse();
    };
    nodeKlassProto.angleTo = function (endNode) {
        if (this.px == null)
            this.px = this.plugin.lxy2px(this.x, this.y);
        if (this.py == null)
            this.py = this.plugin.lxy2py(this.x, this.y);

        if (endNode.px == null)
            endNode.px = this.plugin.lxy2px(endNode.x, endNode.y);
        if (endNode.py == null)
            endNode.py = this.plugin.lxy2py(endNode.x, endNode.y);

        return cr.angleTo(this.px, this.py, endNode.px, endNode.py);
    };

    var node2uid = function (node) {
        return (node != null) ? node.uid : (-1);
    };

    var node2lx = function (node) {
        return (node != null) ? node.x : (-1);
    };

    var node2ly = function (node) {
        return (node != null) ? node.y : (-1);
    };

    var node2pathcost = function (node) {
        return (node != null) ? node.g : (-1);
    };

    var openHeap;
    var BinaryHeapKlass = function (scoreFunction) {
        this.content = [];
        this.scoreFunction = scoreFunction;
    }
    var BinaryHeapKlassProto = BinaryHeapKlass.prototype;
    BinaryHeapKlassProto.clean = function () {
        this.content.length = 0;
    };
    BinaryHeapKlassProto.push = function (element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    };
    BinaryHeapKlassProto.pop = function () {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    };
    BinaryHeapKlassProto.remove = function (node) {
        var i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            } else {
                this.bubbleUp(i);
            }
        }
    };
    BinaryHeapKlassProto.size = function () {
        return this.content.length;
    };
    BinaryHeapKlassProto.rescoreElement = function (node) {
        this.sinkDown(this.content.indexOf(node));
    };
    BinaryHeapKlassProto.sinkDown = function (n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1,
                parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    };
    BinaryHeapKlassProto.bubbleUp = function (n) {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);

        while (true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1,
                child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null,
                child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
            // Otherwise, we are done.
            else {
                break;
            }
        }
    };
    openHeap = new BinaryHeapKlass(function (node) {
        return node.f;
    });
    // a star

    var cleanTable = function (o) {
        var k;
        for (k in o)
            delete o[k];
    };

    function quickAbs(x) {
        return x < 0 ? -x : x;
    };

    instanceProto.saveToJSON = function () {
        return {
            "pm": this.pathMode,
            "boarduid": (this.board != null) ? this.board.uid : (-1),
            "groupuid": (this.group != null) ? this.group.uid : (-1),
            "randomuid": (this.randomGen != null) ? this.randomGen.uid : (-1),
            "chessuid": this.exp_ChessUID,
            "nearesttileuid": this.exp_NearestTileUID,
            "uid2cost": this.uid2cost,
            "start": [this.exp_StartTileUID, this.exp_StartX, this.exp_StartY],
            "end": [this.exp_EndTileUID, this.exp_EndX, this.exp_EndY],
        };
    };

    instanceProto.loadFromJSON = function (o) {
        this.pathMode = o["pm"];
        this.boardUid = o["boarduid"];
        this.groupUid = o["groupuid"];
        this.randomGenUid = o["randomuid"];
        this.exp_ChessUID = o["chessuid"];
        this.exp_NearestTileUID = o["nearesttileuid"];
        this.uid2cost = o["uid2cost"];
        this.exp_StartTileUID = o["start"][0];
        this.exp_StartX = o["start"][1];
        this.exp_StartY = o["start"][2];
        this.exp_EndTileUID = o["end"][0];
        this.exp_EndX = o["end"][1];
        this.exp_EndY = o["end"][2];

    };

    instanceProto.afterLoad = function () {
        if (this.boardUid === -1)
            this.board = null;
        else {
            this.board = this.runtime.getObjectByUID(this.boardUid);
            assert2(this.board, "SLG movement: Failed to find board object by UID");
        }
        this.boardUid = -1;

        if (this.groupUid === -1)
            this.group = null;
        else {
            this.group = this.runtime.getObjectByUID(this.groupUid);
            assert2(this.group, "SLG movement: Failed to find instance group object by UID");
        }
        this.groupUid = -1;

        if (this.randomGenUid === -1)
            this.randomGen = null;
        else {
            this.randomGen = this.runtime.getObjectByUID(this.randomGenUid);
            assert2(this.randomGen, "SLG movement: Failed to find random gen object by UID");
        }
        this.randomGenUid = -1;

    };

    /**BEGIN-PREVIEWONLY**/
    instanceProto.getDebuggerValues = function (propsections) {
        var board = this.GetBoard();
        var group = this.GetInstGroup();
        propsections.push({
            "title": this.type.name,
            "properties": [{
                    "name": "Board UID",
                    "value": (board) ? board.uid : -1
                },
                {
                    "name": "Instance UID",
                    "value": (group) ? group.uid : -1
                }
            ]
        });
    };
    /**END-PREVIEWONLY**/

    //////////////////////////////////////
    // Conditions
    function Cnds() {};
    pluginProto.cnds = new Cnds();

    Cnds.prototype.OnCostFn = function (name) {
        return cr.equals_nocase(name, this.costFnName);
    };

    Cnds.prototype.OnFilterFn = function (name) {
        return cr.equals_nocase(name, this.filterFnName);
    };

    //////////////////////////////////////
    // Actions
    function Acts() {};
    pluginProto.acts = new Acts();

    Acts.prototype.Setup = function (boardObjType, groupObjType) {
        var board = boardObjType.getFirstPicked();
        if (board.check_name == "BOARD")
            this.board = board;
        else
            alert("SLG movement should connect to a board object");

        var group = groupObjType.getFirstPicked();
        if (group.check_name == "INSTGROUP")
            this.group = group;
        else
            alert("SLG movement should connect to a instance group object");
    };

    Acts.prototype.SetCost = function (value) {
        if ((value < 0) && (value != prop_BLOCKING)) {
            value = 0;
        }
        this.costValue = value;
    };

    Acts.prototype.AppendFilter = function (filterUID) {
        if (this.filterUIDList.indexOf(filterUID) == (-1))
            this.filterUIDList.push(filterUID);
    };

    var _tileNode = {
        uid: -1,
        x: -1,
        y: -1
    };
    Acts.prototype.GetMoveableArea = function (chessObjType, movingPoints, cost, filterFnName, groupName) {
        this.requestInit();

        var saveToGroup = this.GetInstGroup().GetGroup(groupName);
        var board = this.GetBoard();

        saveToGroup.Clean();
        var chessUID = getUID(chessObjType);
        var _xyz = this.uid2xyz(chessUID);
        if (_xyz == null)
            return;
        if ((movingPoints != prop_INFINITY) && (movingPoints <= 0))
            return;

        this.exp_ChessUID = chessUID;
        var tileUIDs = this.getMoveableArea(chessUID, movingPoints, cost);

        // no filter applied
        if (filterFnName == "") {
            saveToGroup.SetByUIDList(tileUIDs);
        } else {
            // filter applied
            var i, cnt = tileUIDs.length,
                uid, _xyz;
            this.filterFnName = filterFnName;
            this.filterUIDList.length = 0;

            this.exp_CurTile = _tileNode;
            for (i = 0; i < cnt; i++) {
                uid = tileUIDs[i];
                if (!isNaN(uid))
                    uid = parseInt(uid);

                this.exp_CurTile.uid = uid;
                _xyz = this.uid2xyz(uid);
                this.exp_CurTile.x = _xyz.x;
                this.exp_CurTile.y = _xyz.y;
                this.runtime.trigger(cr.plugins_.Rex_SLGMovement.prototype.cnds.OnFilterFn, this);
            }
            saveToGroup.SetByUIDList(this.filterUIDList);
        }
    };

    Acts.prototype.GetMovingPath = function (chessObjType, tileObjType, movingPoints, cost, groupName, isNearest) {
        this.requestInit();

        var saveToGroup = this.GetInstGroup().GetGroup(groupName);
        var board = this.GetBoard();

        saveToGroup.Clean();
        var chessUID = getUID(chessObjType);
        var tileUID = getUID(tileObjType);
        if ((chessUID == null) || (tileUID == null))
            return;
        if ((movingPoints != prop_INFINITY) && (movingPoints <= 0))
            return;
        if (this.uid2xyz(chessUID) == null)
            return;
        tileUID = this.lz2uid(tileUID, 0);
        if (tileUID == null)
            return;

        this.exp_ChessUID = chessUID;
        var pathTilesUIDList = this.getMovingPath(chessUID, tileUID, movingPoints, cost, isNearest);
        if (pathTilesUIDList.length > 0) {
            saveToGroup.SetByUIDList(pathTilesUIDList);

            this.exp_EndTileUID = pathTilesUIDList[pathTilesUIDList.length - 1];
            var xyz = this.uid2xyz(this.exp_EndTileUID);
            this.exp_EndX = xyz.x;
            this.exp_EndY = xyz.y;
        } else {
            this.exp_EndTileUID = -1;
            this.exp_EndX = -1;
            this.exp_EndY = -1;
        }
    };

    Acts.prototype.SetPathMode = function (m) {
        this.pathMode = m;
    };

    Acts.prototype.SetRandomGenerator = function (randomGen_objs) {
        var randomGen = randomGen_objs.getFirstPicked();
        if (randomGen.check_name == "RANDOM")
            this.randomGen = randomGen;
        else
            alert("[slg movement] This object is not a random generator object.");
    };
    //////////////////////////////////////
    // Expressions
    function Exps() {};
    pluginProto.exps = new Exps();

    Exps.prototype.ChessUID = function (ret) {
        ret.set_any(this.exp_ChessUID);
    };

    Exps.prototype.TileUID = function (ret) {
        ret.set_any(node2uid(this.exp_CurTile));
    };

    Exps.prototype.BLOCKING = function (ret) {
        ret.set_int(prop_BLOCKING);
    };

    Exps.prototype.TileX = function (ret) {
        ret.set_int(node2lx(this.exp_CurTile));
    };

    Exps.prototype.TileY = function (ret) {
        ret.set_int(node2ly(this.exp_CurTile));
    };

    Exps.prototype.INFINITY = function (ret) {
        ret.set_int(prop_INFINITY);
    };

    Exps.prototype.UID2PathCost = function (ret, chessUID) {
        var tileUID = this.getTileUID(chessUID);
        var c = this.uid2cost[tileUID];
        if (c == null)
            c = -1;
        ret.set_float(c);
    };

    Exps.prototype.NearestTileUID = function (ret) {
        ret.set_any(this.exp_NearestTileUID);
    };

    Exps.prototype.StartTileUID = function (ret) {
        ret.set_any(this.exp_StartTileUID);
    };


    Exps.prototype.PreTileUID = function (ret) {
        ret.set_any(node2uid(this.exp_PreTile));
    };

    Exps.prototype.PreTileX = function (ret) {
        ret.set_int(node2lx(this.exp_PreTile));
    };

    Exps.prototype.PreTileY = function (ret) {
        ret.set_int(node2ly(this.exp_PreTile));
    };

    Exps.prototype.PreTilePathCost = function (ret) {
        ret.set_float(node2pathcost(this.exp_PreTile));
    };

    Exps.prototype.StartX = function (ret) {
        ret.set_int(this.exp_StartX);
    };

    Exps.prototype.StartY = function (ret) {
        ret.set_int(this.exp_StartY);
    };

    Exps.prototype.EndTileUID = function (ret) {
        ret.set_any(this.exp_EndTileUID);
    };

    Exps.prototype.EndX = function (ret) {
        ret.set_int(this.exp_EndX);
    };

    Exps.prototype.EndY = function (ret) {
        ret.set_int(this.exp_EndY);
    };
}());