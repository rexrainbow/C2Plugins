// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_GraphMovement = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_GraphMovement.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{ 
	};
	

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

    var GLOBOL_NODES = {};
	instanceProto.onCreate = function()
	{            	    
	    this.path_mode = this.properties[0];
	    this.is_shuffle_neighbors = (this.properties[1]===1); 
        this.weight_heuristic = this.properties[2];
	                     
        this.graph = null;
        this.graphUid = -1;    // for loading         
        this.group = null;
        this.groupUid = -1;    // for loading        
        this.randomGen = null;
        this.randomGenUid = -1;    // for loading
        this._cost_fn_name = null;
        this._cost_value = 0;
        this._filter_uid_list = [];        
        this._is_cost_fn = null;  
		this._nextEdges = [];

        this._hit_dist_tile = false; 
        this.uid2cost = {};
        
	    this.exp_StartVertexUID = -1;
	    this.exp_EndVertexUID = -1;
	    this.exp_NearestVertexUID = -1;
	    this.exp_CurVertexUID = null;
        this.exp_CurEdgeUID = null;
	    this.exp_PreVertexUID = null;     
	};

	instanceProto.GetGraph = function()
	{
        if (this.graph != null)
            return this.graph;
            
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            
            if (cr.plugins_.Rex_Graph && (inst instanceof cr.plugins_.Rex_Graph.prototype.Instance))
            {
                this.graph = inst;
                return this.graph;
            }            
        }
        assert2(this.graph, "Graph movement plugin: Can not find graph oject.");
        return null;
	};
	
	instanceProto.GetInstGroup = function()
	{
        if (this.group != null)
            return this.group;
            
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            
            if (cr.plugins_.Rex_gInstGroup && (inst instanceof cr.plugins_.Rex_gInstGroup.prototype.Instance))
            {
                this.group = inst;
                return this.group;
            }            
        }
        assert2(this.group, "Graph movement plugin: Can not find instance group oject.");
        return null;
	};  

	var prop_BLOCKING = -1;
    var prop_INFINITY = -1; 
	instanceProto.cost_get_from_event = function (preVertexUID, curEdgeUID, curVertexUID)
	{
	    var cost;
	    if (this._is_cost_fn)
	    {           
	        this.exp_CurVertexUID = curVertexUID;
            this.exp_CurEdgeUID = curEdgeUID;
	        this.exp_PreVertexUID = preVertexUID;	             
	        this._cost_value = prop_BLOCKING;
	        this.runtime.trigger(cr.plugins_.Rex_GraphMovement.prototype.cnds.OnCostFn, this);
	        this.exp_CurVertexUID = null;
            this.exp_CurEdgeUID = null;            
	        this.exp_PreVertexUID = null;	        
	        cost = this._cost_value;
	    }
	    else
	        cost = this._cost_fn_name;        
	    return cost; 
	};
    
	instanceProto.getNextEdges = function(vertexUID)
	{
	    var graph = this.GetGraph();
        var vertex = graph.GetVertex(vertexUID);
        this._nextEdges.length = 0;
        for (var edgeUID in vertex)
            this._nextEdges.push(edgeUID);
        
        if (this.is_shuffle_neighbors)
        {
            _shuffle(this._nextEdges, this.randomGen);
        }
        return this._nextEdges;
	};	
    
	var _shuffle = function (arr, random_gen)
	{
        var i = arr.length, j, temp, random_value;
        if ( i == 0 ) return;
        while ( --i ) 
        {
		    random_value = (random_gen == null)?
			               Math.random(): random_gen.random();
            j = Math.floor( random_value * (i+1) );
            temp = arr[i]; 
            arr[i] = arr[j]; 
            arr[j] = temp;
        }
    };
    
    instanceProto.RandomInt = function (a, b)
    {    
        return Math.floor(this.Random() * (b - a) + a);
    };
    
    instanceProto.Random = function ()
    {
        return (this.randomGen == null)?
			    Math.random(): this.randomGen.random();  
    };   

	instanceProto.cost_function_setup = function(cost)
	{
	    this._cost_fn_name = cost;
	    this._is_cost_fn = (typeof cost == "string");
	};    
	
	instanceProto.request_init_clean = function()
	{
        clean_table ( this.uid2cost );
        this.exp_NearestVertexUID = -1;
	}; 	   
    
	instanceProto.get_moveable_area = function(startVertexUID, moving_points, cost, result_mode)
	{
        var graph = this.GetGraph();
        if (!graph.IsVertex(startVertexUID))
            return [];
        
        this.exp_StartVertexUID = startVertexUID;
        var nodes = this.ASTAR_search(startVertexUID, null, moving_points, cost, CMD_AREA);
        if (nodes == null)
            return [];
        
        var uids = this.ASTAR_closed_nodes_to_uid_get(nodes, result_mode);
        cr.arrayFindRemove(uids, startVertexUID);
        this.ASTAR_nodes_release();     
	    return uids;
	};
	
	instanceProto.get_moving_path = function (startVertexUID, endVertexUID, moving_points, cost, is_nearest, result_mode)
	{   
        var graph = this.GetGraph();
        if (!graph.IsVertex(startVertexUID) || !graph.IsVertex(endVertexUID))
            return [];
              
        this.exp_StartVertexUID = startVertexUID;
        this.exp_EndVertexUID = endVertexUID;
        var search_cmd = (is_nearest===1)? CMD_PATH_NEAREST : CMD_PATH;
        var nodes = this.ASTAR_search(startVertexUID, endVertexUID, moving_points, cost, search_cmd);
        if (nodes == null)
            return [];
 
        if (is_nearest===1)
            endVertexUID = this.exp_NearestVertexUID;
        
        var start_node = nodes[startVertexUID];
        var uids = nodes[endVertexUID].path_to_root(start_node, result_mode);
        this.ASTAR_nodes_release();     
	    return uids;
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
	instanceProto.ASTAR_search = function (startVertexUID, endVertexUID, moving_points, cost, search_cmd)
	{         
        var IS_PATH_SEARCH = (search_cmd == CMD_PATH) || (search_cmd == CMD_PATH_NEAREST);
        var IS_AREA_SEARCH = (search_cmd == CMD_AREA); 
        var is_astar = (this.path_mode == 1) || (this.path_mode == 3) || (this.path_mode == 4);  
        var astar_heuristic_enable = IS_PATH_SEARCH && is_astar;
        var shortest_path_enable = IS_PATH_SEARCH && (!is_astar);
        var astar_heuristic_mode = (!astar_heuristic_enable)? null:
                                   (this.path_mode == 1)?     0:
                                   (this.path_mode == 3)?     1:
                                   (this.path_mode == 4)?     2:
                                                              null;

                                                              
	    this.cost_function_setup(cost);

        var end = (endVertexUID != null)? this.ASTAR_node_get(endVertexUID): null;        
        var start = this.ASTAR_node_get(startVertexUID);        
        start.h = start.heuristic(end, astar_heuristic_mode); 
        
        // NEAREST NODE
        var closestNode = start;
        // helper function to update closer_h                
        var closer_h_update = function(node, base_node)
        {
            if (astar_heuristic_enable)     
                node.closer_h = node.h;                    
            else
                node.closer_h = node.closer_h || node.heuristic(end, astar_heuristic_mode, base_node);
        };
        if (IS_PATH_SEARCH)
        {
            closer_h_update(closestNode);       
            this.exp_NearestTileUID = closestNode.uid;
        }
        // NEAREST NODE
        
        openHeap.push(start);
        while(openHeap.size() > 0) 
        {
            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();
            
            // End case -- result has been found, return the traced path.
            if (astar_heuristic_enable && (currentNode === end))
            {
                break;
                //return GLOBOL_NODES;
            }
            
            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;
            
            // Find all edges for the current node.
            var edges = currentNode.edges_get(), edgeUID;
            var neighbor;  // neighbor = vertex
            
            // Find all neighbors for the current node.
            var neighbors = currentNode.edges_get();

            var il = edges.length;
            for(var i=0; i<il; ++i) 
            {
                edgeUID = edges[i];
                neighbor = currentNode.neighbor_get(edgeUID);              
                var neighbor_cost = neighbor.cost_get(currentNode, edgeUID);
                if(neighbor.closed || is_wall(neighbor_cost))
                {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }

                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentNode.g + neighbor_cost,
                    beenVisited = neighbor.visited;
                    
                if ((moving_points != prop_INFINITY) && (gScore > moving_points))
                {
                    continue;
                }

                if(!beenVisited || gScore < neighbor.g) 
                {

                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;                    
                    neighbor.parent.length = 0;
                    neighbor.parent.push(edgeUID);   
                    neighbor.h = neighbor.h || neighbor.heuristic(end, astar_heuristic_mode, start);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;                    
                    this.uid2cost[neighbor.uid] = gScore;

                    // NEAREST NODE
                    if (IS_PATH_SEARCH)
                    {           
                        closer_h_update(neighbor, start);          
                        var is_neighbor_more_closer = (neighbor.closer_h < closestNode.closer_h) ||
                                                      ( (neighbor.closer_h === closestNode.closer_h) && (neighbor.g < closestNode.g) ) ;
                       
                        if (is_neighbor_more_closer)
                        {
                            closestNode = neighbor;
                            this.exp_NearestTileUID = closestNode.uid;
                        }   
                    }
                    // NEAREST NODE

                    if (!beenVisited) 
                    {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                    }
                    else 
                    {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbor);
                    }
                }
                else if ((gScore == neighbor.g) && shortest_path_enable)
                {
                    neighbor.parent.push(edgeUID);
                    
                    //if (neighbor.parent.indexOf(currentNode.uid) == -1)                    
                    //    neighbor.parent.push(currentNode.uid);                    
                    //else                    
                    //    debugger;                    
                }
            }            
            
        }
        
        openHeap.clean();
        return GLOBOL_NODES;
	};

    var ObjCacheKlass = function ()
    {        
        this.lines = [];       
    };
    var ObjCacheKlassProto = ObjCacheKlass.prototype;       
	ObjCacheKlassProto.allocLine = function()
	{
		return (this.lines.length > 0)? this.lines.pop(): null;
	};
	ObjCacheKlassProto.freeLine = function (l)
	{
		this.lines.push(l);
	};	
    var nodeCache = new ObjCacheKlass();

    var GLOBOL_NODES_ORDER_INDEX = -1;
	instanceProto.ASTAR_node_get = function (uid)
	{
	    // create node and put it into GLOBOL_NODES
	    GLOBOL_NODES_ORDER_INDEX += 1;
	    if (GLOBOL_NODES[uid] == null)
	    {
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
    var SORT_BY_ORDER = function(node_a, node_b)
    {
        var index_a = node_a.order_index;
        var index_b = node_b.order_index;        
        if (index_a > index_b)
            return 1;
        else if (index_a < index_b)
            return (-1);
        else  // (index_a == index_b)
            return 0;
    };
    var __closed_nodes = [];
	instanceProto.ASTAR_closed_nodes_to_uid_get = function (nodes, result_mode)
	{
        __closed_nodes.length = 0;
        var uid, node;
        for (uid in nodes)
        {
            node = nodes[uid];
            if (node.closed)              // get closed node
                __closed_nodes.push(node);
        }
        __closed_nodes.sort(SORT_BY_ORDER); // sorting by created order
        
        var i, cnt=__closed_nodes.length;
        var uids = [], node;
        for (i=0; i<cnt; i++)
        {
            node = __closed_nodes[i];
            uids.push(node.uid);
            
            if (result_mode === 1)  // add edges into result
            {
                var edges = node.parent;
                var j, jcnt=edges.length;
                for (j=0; j<jcnt; j++)
                    uids.push(edges[j]);
            }
        }
        
        __closed_nodes.length = 0;
        return uids;
	};
	instanceProto.ASTAR_nodes_release = function ()
	{
	    // release all nodes into node cache
        var uid;
        for (uid in GLOBOL_NODES)
        {
            nodeCache.freeLine(GLOBOL_NODES[uid]);
	        delete GLOBOL_NODES[uid];  
        }  
        GLOBOL_NODES_ORDER_INDEX = -1;      
	};
	
    var nodeKlass = function (plugin, uid)
    {
        this.parent = [];  // [ edgeUID, ... ]
        this.cost = {};  // {edgeUID: cost}
        this.init(plugin, uid);        
    };    
    var nodeKlassProto = nodeKlass.prototype;
    nodeKlassProto.init = function (plugin, uid)
    {
        this.order_index = GLOBOL_NODES_ORDER_INDEX;  // for sorting by created order   
        this.plugin = plugin;  
        this.uid = uid;    
        this.f = 0;   
        this.g = 0;   
        this.h = 0;  
        this.closer_h = 0;
        this.visited = false;      
        this.closed = false;
        this.parent.length = 0;
        for (var k in this.cost)
            delete this.cost[k];
    };
    nodeKlassProto.heuristic = function (end_node, path_mode, base_node)
    {
        if (path_mode === null)
            return 0;
        
        var h;       
        var dist = this.distanceTo(end_node) * this.plugin.weight_heuristic;        
        
        if ((path_mode === 1) && base_node)
        {
            var da = end_node.angleTo(base_node) - this.angleTo(base_node);
            h = dist + quickAbs(da);
        }
        else if (path_mode === 2)
        {
            h = dist + this.plugin.Random();
        }
        else
            h = dist;
        
        return h;
    };   
    nodeKlassProto.edges_get = function()
    {
        return this.plugin.getNextEdges(this.uid);
    };       
    nodeKlassProto.neighbor_get = function(edgeUID)
    {
        var graph = this.plugin.GetGraph();
        var uid = graph.GetAnotherVertexUID(edgeUID, this.uid);
        return this.plugin.ASTAR_node_get(uid);
    };           
    
    nodeKlassProto.cost_get = function (preNode, edgeUID)
    {
        if (!this.cost.hasOwnProperty(edgeUID))
            this.cost[edgeUID] = this.plugin.cost_get_from_event(preNode.uid, edgeUID, this.uid);
        
        return this.cost[edgeUID];
    };
    var is_wall = function(cost)
    {
        return (cost == prop_BLOCKING);
    };
    nodeKlassProto.path_to_root = function (end_node, result_mode)
    {
        var graph = this.plugin.GetGraph();
        
        var is_astar_mode = (this.plugin.path_mode == 1) || (this.plugin.path_mode == 3) || (this.plugin.path_mode == 4);      
        var is_shortest_random_mode = (this.plugin.path_mode == 0);  
        var is_shortest_line_mode = (this.plugin.path_mode == 2);
        
        var parent_index, cur_dir = null, parent_dir, i, cnt;
        
        if (is_shortest_line_mode)
        {
            var start_node=this;
            var ta = end_node.angleTo(start_node);
        }
        
        var curr = this, path = [], edgeUID, nextNodeUID;
        while (curr.parent.length > 0)
        {
            path.push(curr.uid);
            cnt = curr.parent.length;   
            
            // get parent           
            if (is_astar_mode)            
            {
                edgeUID = curr.parent[0];
                nextNodeUID = graph.GetAnotherVertexUID(edgeUID, curr.uid);
                curr =  GLOBOL_NODES[ nextNodeUID.toString() ];
            }
            
            else if (is_shortest_random_mode)
            {
                parent_index = (cnt===1)? 0:this.plugin.RandomInt(0, cnt);
                edgeUID = curr.parent[parent_index];
                nextNodeUID = graph.GetAnotherVertexUID(edgeUID, curr.uid);
                curr =  GLOBOL_NODES[ nextNodeUID.toString() ];
            }

            else if (is_shortest_line_mode)
            {
                if (cnt === 1)
                {
                    curr =  GLOBOL_NODES[ curr.parent[0].toString() ];
                    start_node = curr; // turn in the course
                    ta = end_node.angleTo(start_node);
                }
                else
                {
                    var n =  GLOBOL_NODES[ graph.GetAnotherVertexUID(curr.parent[0], curr.uid).toString() ];                
                    var n_;
                    var da = quickAbs(end_node.angleTo(n) - ta), da_;
                    for (i=1; i<cnt; i++)
                    {
                        n_ = GLOBOL_NODES[ graph.GetAnotherVertexUID(curr.parent[i], curr.uid).toString() ];
                        da_ = quickAbs(end_node.angleTo(n_) - ta);
                        if (da_ < da)
                        {
                            n = n_;
                            da = da_;
                        }
                    }
                    curr =  n;
                }                
                
            }  
            
            if (result_mode === 1)
                path.push(edgeUID);

        } 
        return path.reverse();   
    };  

    nodeKlassProto.distanceTo = function (end_node)
    {
        var graph = this.plugin.GetGraph();
        var dist = graph.GetVABDistance(this.uid, end_node.uid);
        if (dist == null)
            dist = 0;
        return dist;
    };   
    
    nodeKlassProto.angleTo = function (end_node)
    {
        var graph = this.plugin.GetGraph();
        var angle = graph.GetVABAngle(this.uid, end_node.uid);
        if (angle == null)
            angle = 0;
        return angle;
    };    
	
	var node2uid = function(node)
	{
	    return (node != null)? node.uid:(-1);
	};
	
	var node2pathcost = function(node)
	{
	    return (node != null)? node.g:(-1);
	};	    

    var openHeap;
    var BinaryHeapKlass = function (scoreFunction)
    {
        this.content = [];
        this.scoreFunction = scoreFunction;
    }
    var BinaryHeapKlassProto = BinaryHeapKlass.prototype;
    BinaryHeapKlassProto.clean = function ()
    {
        this.content.length = 0;
    };       
    BinaryHeapKlassProto.push = function (element)
    {
        // Add the new element to the end of the array.
        this.content.push(element);
    
        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    };
    BinaryHeapKlassProto.pop = function () 
    {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) 
        {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    };
    BinaryHeapKlassProto.remove = function(node) 
    {
        var i = this.content.indexOf(node);
        
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();
        
        if (i !== this.content.length - 1) {
            this.content[i] = end;
        
            if (this.scoreFunction(end) < this.scoreFunction(node)) 
            {
                this.sinkDown(i);
            }
            else 
            {
                this.bubbleUp(i);
            }
        }
    };
    BinaryHeapKlassProto.size = function() 
    {
        return this.content.length;
    };
    BinaryHeapKlassProto.rescoreElement = function(node) 
    {
        this.sinkDown(this.content.indexOf(node));
    };
    BinaryHeapKlassProto.sinkDown = function(n) 
    {
        // Fetch the element that has to be sunk.
        var element = this.content[n];
        
        // When at 0, an element can not sink any further.
        while (n > 0) 
        {
        
            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1,
                parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) 
            {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to sink any further.
            else 
            {
                break;
            }
        }
    };
    BinaryHeapKlassProto.bubbleUp = function(n) 
    {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);
        
        while(true) 
        {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1,
                child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null,
                child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) 
            {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);
        
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore)
                {
                    swap = child1N;
                }
            }
        
            // Do the same checks for the other child.
            if (child2N < length) 
            {
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) 
                {
                    swap = child2N;
                }
            }
        
            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) 
            {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
            // Otherwise, we are done.
            else 
            {
                break;
            }
        }
    }; 
    openHeap = new BinaryHeapKlass( function(node) { return node.f; } );
	// a star
	
    var clean_table = function (o)
    {
        var k;
        for (k in o)
            delete o[k];
    };

	function quickAbs(x)
	{
		return x < 0 ? -x : x;
	};	
	
	instanceProto.saveToJSON = function ()
	{    
		return { "pm" : this.path_mode,
		         "graphuid": (this.graph != null)? this.graph.uid:(-1),
		         "groupuid": (this.group != null)? this.group.uid:(-1),
		         "randomuid": (this.randomGen != null)? this.randomGen.uid:(-1),
		         "sVUID": this.exp_startVertexUID,
		         "eVUID": this.exp_endVertexUID,
		         "nearVUID": this.exp_NearestVertexUID,
                 "uid2cost": this.uid2cost};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.path_mode = o["pm"];
	    this.graphUid = o["graphuid"];
		this.groupUid = o["groupuid"];
		this.randomGenUid = o["randomuid"];	
		this.exp_startVertexUID = o["sVUID"];	
		this.exp_endVertexUID = o["eVUID"];
		this.exp_NearestVertexUID = o["nearVUID"];		
        this.uid2cost = o["uid2cost"];
	};
	
	instanceProto.afterLoad = function ()
	{
		if (this.graphUid === -1)
			this.graph = null;
		else
		{
			this.graph = this.runtime.getObjectByUID(this.graphUid);
			assert2(this.graph, "Graph movement: Failed to find graph object by UID");
		}		
		this.graphUid = -1;
		
		if (this.groupUid === -1)
			this.group = null;
		else
		{
			this.group = this.runtime.getObjectByUID(this.groupUid);
			assert2(this.group, "Graph movement: Failed to find instance group object by UID");
		}		
		this.groupUid = -1;	
		
		if (this.randomGenUid === -1)
			this.randomGen = null;
		else
		{
			this.randomGen = this.runtime.getObjectByUID(this.randomGenUid);
			assert2(this.randomGen, "Graph movement: Failed to find random gen object by UID");
		}		
		this.randomGenUid = -1;			
			
	};
		
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();        

	Cnds.prototype.OnCostFn = function (name)
	{
	    return cr.equals_nocase(name, this._cost_fn_name);
	};

	Cnds.prototype.OnFilterFn = function (name)
	{
	    return cr.equals_nocase(name, this._filter_fn_name);
	}; 	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Setup = function (graph_objs, group_objs)
	{
        var graph = graph_objs.getFirstPicked();
        if (graph.check_name == "BOARD")
            this.graph = graph;        
        else
            alert ("Graph movement should connect to a graph object");		
            
        var group = group_objs.getFirstPicked();
        if (group.check_name == "INSTGROUP")
            this.group = group;        
        else
            alert ("Graph movement should connect to a instance group object");            
	};   
    
    Acts.prototype.SetCost = function (cost_value)
	{
	    if ((cost_value < 0) && (cost_value != prop_BLOCKING))
	        cost_value = 0;
        this._cost_value = cost_value;           
	}; 
    
    Acts.prototype.AppendFilter = function (filter_uid)
	{
        if (this._filter_uid_list.indexOf(filter_uid) == (-1))
            this._filter_uid_list.push(filter_uid);
	}; 	
    
	Acts.prototype.GetMoveableArea = function (startVertexUID, moving_points, cost, filter_name, group_name, result_mode)
	{	  
	    this.request_init_clean();
	    	    
	    var saveToGroup = this.GetInstGroup().GetGroup(group_name); 
	    var graph = this.GetGraph();
	    
	    saveToGroup.Clean();	    
	    if ((moving_points != prop_INFINITY) && (moving_points<=0))
	        return;
	    
	    this.exp_startVertexUID = startVertexUID;
		var uids = this.get_moveable_area(startVertexUID, moving_points, cost, result_mode);
		
        // no filter applied
        if (filter_name == "")
        {
            saveToGroup.SetByUIDList(uids);
            return;
        }
        
        // filter applied
	    var i, cnt=uids.length ,uid;	    
        this._filter_fn_name = filter_name;
	    this._filter_uid_list.length = 0;   
	    
	    for (i=0; i<cnt; i++)
		{
            uid = parseInt(uids[i]);
            this.exp_CurVertexUID = uid;
            this.runtime.trigger(cr.plugins_.Rex_GraphMovement.prototype.cnds.OnFilterFn, this);
		}
		saveToGroup.SetByUIDList(this._filter_uid_list);        
	};  
		
	Acts.prototype.GetMovingPath = function (startVertexUID, endVertexUID, moving_points, cost, group_name, is_nearest, result_mode)	
	{     
	    this.request_init_clean();
	    	    
	    var saveToGroup = this.GetInstGroup().GetGroup(group_name); 
	    saveToGroup.Clean();	    
	    if ((moving_points != prop_INFINITY) && (moving_points<=0))
	        return;
        
	    this.exp_startVertexUID = startVertexUID;
	    var uids = this.get_moving_path(startVertexUID, endVertexUID, moving_points, cost, is_nearest, result_mode);
        if (uids.length > 0)
	        saveToGroup.SetByUIDList(uids);
	};	 
    
    Acts.prototype.SetPathMode = function (m)
	{
        this.path_mode = m;
	};
	
    Acts.prototype.SetRandomGenerator = function (randomGen_objs)
	{
        var randomGen = randomGen_objs.getFirstPicked();
        if (randomGen.check_name == "RANDOM")
            this.randomGen = randomGen;        
        else
            alert ("[slg movement] This object is not a random generator object.");
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.StartVertexUID = function (ret)
	{
	    ret.set_any(this.exp_StartVertexUID);
	};
		
    Exps.prototype.EndVertexUID = function (ret)
    {
	    ret.set_any(this.exp_EndVertexUID);
    };	
	
	Exps.prototype.VertexUID = function (ret)
	{
	    ret.set_any(this.exp_CurVertexUID);
	};
		
    Exps.prototype.EdgeUID = function (ret)
    {
	    ret.set_any(this.exp_CurEdgeUID);
    };	
    
    Exps.prototype.PreVertexUID = function (ret)
    {
        ret.set_any(exp_PreVertexUID);
    };	

    Exps.prototype.PrePathCost = function (ret)
    {
        ret.set_float(node2pathcost(null));
    }; 
    
    Exps.prototype.BLOCKING = function (ret)
    {
        ret.set_int(prop_BLOCKING);
    };	
    		
    Exps.prototype.INFINITY = function (ret)
    {
        ret.set_int(prop_INFINITY);
    };
	
    Exps.prototype.UID2PathCost = function (ret, vertexUID)
    {
        var c = this.uid2cost[vertexUID];
        if (c == null)
            c = -1;
        ret.set_float(c);
    };  
    
    Exps.prototype.NearestVertexUID = function (ret)
    {
        ret.set_any(this.exp_NearestVertexUID);
    };
               	  
}());