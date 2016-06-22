// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGMovement = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SLGMovement.prototype;
		
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
	    this.is_cache_cost = (this.properties[1]===1);
	    this.is_shuffle_neighbors = (this.properties[2]===1); 
        this.weight_heuristic = this.properties[3];
	                     
        this.board = null;
        this.boardUid = -1;    // for loading         
        this.group = null;
        this.groupUid = -1;    // for loading        
        this.randomGen = null;
        this.randomGenUid = -1;    // for loading
        this._cost_fn_name = null;
        this._filter_fn_name = null;
        this._cost_value = 0;
        this._filter_uid_list = [];
        this._is_cost_fn = null;  
		this._neighbors_lxy = [];

        this._hit_dist_tile = false; 
        this.uid2cost = {};
        
	    this.exp_ChessUID = -1;
	    this.exp_StartTileUID = -1;
	    this.exp_NearestTileUID = -1;
	    this.exp_CurTile = null;
	    this.exp_PreTile = null;         
	};

	instanceProto.GetBoard = function()
	{
        if (this.board != null)
            return this.board;
            
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            
            if (cr.plugins_.Rex_SLGBoard && (inst instanceof cr.plugins_.Rex_SLGBoard.prototype.Instance))
            {
                this.board = inst;
                return this.board;
            }            
        }
        assert2(this.board, "SLG movement plugin: Can not find board oject.");
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
        assert2(this.group, "SLG movement plugin: Can not find instance group oject.");
        return null;
	};
	
	instanceProto.IsInsideBoard = function (x,y,z)
	{
	    return this.GetBoard().IsInsideBoard(x,y,z);
	};	
	
	var _get_uid = function(objs)
	{
        var uid;
	    if (objs == null)
	        uid = null;
        else if (typeof(objs) === "object")
	    {
	        var inst = objs.getFirstPicked();
	        uid = (inst!=null)? inst.uid:null;
	    }
	    else
	        uid = objs;
            
        return uid;
	};
   
	instanceProto.xyz2uid = function(x, y, z)
	{
	    return this.GetBoard().xyz2uid(x, y, z);
	};
	
	instanceProto.uid2xyz = function(uid)
	{
	    return this.GetBoard().uid2xyz(uid);
	};
	
	instanceProto.lz2uid = function(uid,lz)
	{
	    return this.GetBoard().lz2uid(uid,lz);
	};	
	
	instanceProto.lxy2dist = function(lx0, ly0, lx1, ly1)
	{
	    return this.GetBoard().GetLayout().LXYZ2Dist(lx1, ly1, 0, lx0, ly0, 0, true);
	};	
	instanceProto.lxy2px = function(lx, ly)
	{
	    return this.GetBoard().GetLayout().LXYZ2PX(lx, ly, 0);
	};	
	
	instanceProto.lxy2py = function(lx, ly)
	{
	    return this.GetBoard().GetLayout().LXYZ2PY(lx, ly, 0);
	};	    
    
	var prop_BLOCKING = -1;
    var prop_INFINITY = -1; 
	instanceProto.cost_get_from_event = function (cur_node, pre_node)
	{
	    var cost;
	    if (this._is_cost_fn)
	    {           
	        this.exp_CurTile = cur_node;
	        this.exp_PreTile = pre_node;	                   
	        this._cost_value = prop_BLOCKING;
	        this.runtime.trigger(cr.plugins_.Rex_SLGMovement.prototype.cnds.OnCostFn, this);
	        this.exp_CurTile = null;
	        this.exp_PreTile = null;	        
	        cost = this._cost_value;
	    }
	    else
	        cost = this._cost_fn_name;        
	    return cost; 
	};
	
	instanceProto._neighbors_lxy_init = function(dir_count)
	{	    
	    if (this._neighbors_lxy.length > dir_count)
	    {
	        this._neighbors_lxy.length = dir_count;
	    }
	    else if (this._neighbors_lxy.length < dir_count)
	    {
		    for (var i=this._neighbors_lxy.length; i<dir_count; i++)
		    {
		        this._neighbors_lxy.push({x:0, y:0});
		    }
	    }
	};	
	
	instanceProto.neighborsLXY_get = function(_x,_y)
	{
	    var board = this.GetBoard();
	    this._neighbors_lxy_init(board.GetLayout().GetDirCount());
	    var dir;
	    var neighbors_cnt = this._neighbors_lxy.length;	    
        for (dir=0; dir<neighbors_cnt; dir++)
        {
            this._neighbors_lxy[dir].x = board.GetNeighborLX(_x,_y, dir);
            this._neighbors_lxy[dir].y = board.GetNeighborLY(_x,_y, dir);
        }
        
        if (this.is_shuffle_neighbors)
        {
            _shuffle(this._neighbors_lxy, this.randomGen);
        }
        return this._neighbors_lxy;
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
    
    instanceProto.UID2DIR = function (t0_uid, t1_uid)
    {
        var t0_xyz = this.uid2xyz(t0_uid);
        var t1_xyz = this.uid2xyz(t1_uid);
        var dir = this.GetBoard().GetLayout().XYZ2Dir(t0_xyz, t1_xyz);
        return dir;
    };    
	
	instanceProto.cost_function_setup = function(cost)
	{
	    this._cost_fn_name = cost;
	    this._is_cost_fn = (typeof cost == "string");
	};
    
	instanceProto.tile_uid_get = function(chess_uid)
	{
	    var chess_xyz = this.uid2xyz(chess_uid);
        if (chess_xyz == null)
            return null;
        var tile_uid = this.xyz2uid(chess_xyz.x, chess_xyz.y, 0);
        return tile_uid;
	}; 
	
	instanceProto.request_init_clean = function()
	{
        clean_table ( this.uid2cost );
        this.exp_NearestTileUID = -1;
	}; 	   
    
	instanceProto.get_moveable_area = function(chess_uid, moving_points, cost)
	{
        var start_tile_uid = this.tile_uid_get(chess_uid);
        if (start_tile_uid == null)
            return [];
        this.exp_StartTileUID = start_tile_uid;
        var nodes = this.ASTAR_search(start_tile_uid, null, moving_points, cost, CMD_AREA);
        if (nodes == null)
            return [];
        
        var area_uids = this.ASTAR_closed_nodes_to_uid_get(nodes);
        cr.arrayFindRemove(area_uids, start_tile_uid);
        this.ASTAR_nodes_release();     
	    return area_uids;
	};
	
	instanceProto.get_moving_path = function (chess_uid, end_tile_uid, moving_points, cost, is_nearest)
	{   
        var start_tile_uid = this.tile_uid_get(chess_uid);
        if (start_tile_uid == null)
            return [];        
        this.exp_StartTileUID = start_tile_uid;
        var search_cmd = (is_nearest===1)? CMD_PATH_NEAREST : CMD_PATH;
        var nodes = this.ASTAR_search(start_tile_uid, end_tile_uid, moving_points, cost, search_cmd);
        if (nodes == null)
            return [];
 
        if (is_nearest===1)
            end_tile_uid = this.exp_NearestTileUID;
        
        var start_node = nodes[start_tile_uid];
        var path_uids = nodes[end_tile_uid].path_to_root(start_node);
        this.ASTAR_nodes_release();     
	    return path_uids;
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
	instanceProto.ASTAR_search = function (start_tile_uid, end_tile_uid, moving_points, cost, search_cmd)
	{ 
        var IS_PATH_SEARCH = (search_cmd == CMD_PATH) || (search_cmd == CMD_PATH_NEAREST);
        var IS_AREA_SEARCH = (search_cmd == CMD_AREA); 
        var is_astar = (this.path_mode == 3) || (this.path_mode == 5) || (this.path_mode == 6);  
        var astar_heuristic_enable = IS_PATH_SEARCH && is_astar;
        var shortest_path_enable = IS_PATH_SEARCH && (!is_astar);
        var astar_heuristic_mode = (!astar_heuristic_enable)? null:
                                   (this.path_mode == 3)?     0:
                                   (this.path_mode == 5)?     1:
                                   (this.path_mode == 6)?     2:
                                                              null;

                                                              
	    this.cost_function_setup(cost);

        var end = (end_tile_uid != null)? this.ASTAR_node_get(end_tile_uid): null;
        //if ((end != null) && (search_cmd == CMD_PATH))
        //{
        //    var neighbors = end.neighbor_nodes_get();
        //    var il = neighbors.length;
        //    var all_walls = true;
        //    for(var i=0; i<il; ++i) 
        //    {
        //        if ( !is_wall( end.cost_get(neighbors[i]) ) )
        //        {
        //            all_walls = false;
        //            break;
        //        }
        //    }
        //    if (all_walls)
        //        return;
        //}

        var start = this.ASTAR_node_get(start_tile_uid);        
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
            if (currentNode === end)
            {
                break;
                //return GLOBOL_NODES;
            }
            
            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;
            
            // Find all neighbors for the current node.
            var neighbors = currentNode.neighbor_nodes_get();

            var il = neighbors.length;
            for(var i=0; i<il; ++i) 
            {
                var neighbor = neighbors[i];                
                var neighbor_cost = neighbor.cost_get(currentNode);
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
                    neighbor.parent.push(currentNode.uid);   
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
                    neighbor.parent.push(currentNode.uid);
                    
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
    }	
	instanceProto.ASTAR_closed_nodes_to_uid_get = function (nodes)
	{
        var closed_nodes = [];
        var uid, node;
        for (uid in nodes)
        {
            node = nodes[uid];
            if (node.closed)              // get closed node
                closed_nodes.push(node);
        }
        closed_nodes.sort(SORT_BY_ORDER); // sorting by created order
        var i, cnt=closed_nodes.length;
        for (i=0; i<cnt; i++)
        {
            closed_nodes[i] = closed_nodes[i].uid;
        }
        return closed_nodes;
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
        this.parent = [];
        this.init(plugin, uid);        
    };    
    var nodeKlassProto = nodeKlass.prototype;
    nodeKlassProto.init = function (plugin, uid)
    {
        this.order_index = GLOBOL_NODES_ORDER_INDEX;  // for sorting by created order
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
        this.closer_h = 0;
        this.visited = false;      
        this.closed = false;
        this.parent.length = 0;
    };
    nodeKlassProto.heuristic = function (end_node, path_mode, base_node)
    {
        if (path_mode === null)
            return 0;
        
        var h;
        var dist = this.plugin.lxy2dist(end_node.x, end_node.y, this.x, this.y) * this.plugin.weight_heuristic;
        
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
    nodeKlassProto.neighbor_nodes_get = function()
    {
        var _neighbors_lxy = this.plugin.neighborsLXY_get(this.x, this.y);
        var _n, _uid;
        var neighbor_nodes = []; 
        var i, cnt=_neighbors_lxy.length;
        for (i=0; i<cnt; i++)
        {        
            _n = _neighbors_lxy[i];
            _uid = this.plugin.xyz2uid(_n.x, _n.y, 0);
            if ( _uid != null )
            {
                neighbor_nodes.push( this.plugin.ASTAR_node_get(_uid) );
            }
        }

        return neighbor_nodes;        
    };       
    nodeKlassProto.cost_get = function (pre_node)
    {
        var cost;
        if (this.plugin.is_cache_cost)
        {
            if (this.cost == null)
            {                        
                this.cost = this.plugin.cost_get_from_event(this, pre_node);
            }
            cost = this.cost;  
        }
        else
        {
            cost = this.plugin.cost_get_from_event(this, pre_node);
        }
        return cost;
    };
    var is_wall = function(cost)
    {
        return (cost == prop_BLOCKING);
    };
    nodeKlassProto.path_to_root = function (end_node)
    {
        var is_astar_mode = (this.plugin.path_mode == 3) || (this.plugin.path_mode == 5) || (this.plugin.path_mode == 6);      
        var is_shortest_random_mode = (this.plugin.path_mode == 0);
        var is_shortest_diagonal_mode = (this.plugin.path_mode == 1);
        var is_shortest_straight_mode = (this.plugin.path_mode == 2);      
        var is_shortest_line_mode = (this.plugin.path_mode == 4);
        
        var parent_index, cur_dir = null, parent_dir, i, cnt;
        
        if (is_shortest_line_mode)
        {
            var start_node=this;
            var ta = end_node.angleTo(start_node);
        }
        
        var curr = this, path = [];
        while (curr.parent.length > 0)
        {
            path.push(curr.uid);
            cnt = curr.parent.length;      
            
            // get parent
            if (is_astar_mode)            
                curr =  GLOBOL_NODES[ curr.parent[0].toString() ];
            
            else if (is_shortest_random_mode)
            {
                parent_index = (cnt===1)? 0: this.plugin.RandomInt(0, cnt);
                curr =  GLOBOL_NODES[ curr.parent[parent_index].toString() ];
            }

            else if (is_shortest_diagonal_mode)
            {             
                for (i=0; i<cnt; i++)
                {
                    parent_dir = this.plugin.UID2DIR(curr.uid, curr.parent[i]);
                    if ( (parent_dir != cur_dir) || 
                         (i == (cnt -1))            )   // the last one
                    {
                        parent_index = i;
                        cur_dir = parent_dir;
                        break;
                    }
                }             
                curr =  GLOBOL_NODES[ curr.parent[parent_index].toString() ];
            }    
            
            else if (is_shortest_straight_mode)
            {
                for (i=0; i<cnt; i++)
                {
                    parent_dir = this.plugin.UID2DIR(curr.uid, curr.parent[i]);
                    if ( (parent_dir == cur_dir) || 
                         (i == (cnt -1))            )   // the last one
                    {
                        parent_index = i;
                        cur_dir = parent_dir;
                        break;
                    }
                }             
                curr =  GLOBOL_NODES[ curr.parent[parent_index].toString() ];
            } 
            
            else if (is_shortest_line_mode)
            {
                if (cnt == 1)
                {
                    curr =  GLOBOL_NODES[ curr.parent[0].toString() ];
                    start_node = curr; // turn in the course
                    ta = end_node.angleTo(start_node);
                }
                else
                {
                    var n = GLOBOL_NODES[ curr.parent[0].toString() ], n_;
                    var da = quickAbs(end_node.angleTo(n) - ta), da_;
                    for (i=1; i<cnt; i++)
                    {
                        n_ = GLOBOL_NODES[ curr.parent[i].toString() ];
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
        
        } 
        return path.reverse();   
    };  
    nodeKlassProto.angleTo = function (end_node)
    {
        if (this.px == null)
            this.px = this.plugin.lxy2px(this.x, this.y);
        if (this.py == null)
            this.py = this.plugin.lxy2py(this.x, this.y);    
    
        if (end_node.px == null)
            end_node.px = this.plugin.lxy2px(end_node.x, end_node.y);
        if (end_node.py == null)
            end_node.py = this.plugin.lxy2py(end_node.x, end_node.y);            
           
        return cr.angleTo(this.px, this.py, end_node.px, end_node.py);
    };    
	
	var node2uid = function(node)
	{
	    return (node != null)? node.uid:(-1);
	};
	
	var node2lx = function(node)
	{
	    return (node != null)? node.x:(-1);
	};
	
	var node2ly = function(node)
	{
	    return (node != null)? node.y:(-1);
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
		         "boarduid": (this.board != null)? this.board.uid:(-1),
		         "groupuid": (this.group != null)? this.group.uid:(-1),
		         "randomuid": (this.randomGen != null)? this.randomGen.uid:(-1),
		         "chessuid": this.exp_ChessUID,
		         "starttileuid": this.exp_StartTileUID,
		         "nearesttileuid": this.exp_NearestTileUID,
                 "uid2cost": this.uid2cost};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.path_mode = o["pm"];
	    this.boardUid = o["boarduid"];
		this.groupUid = o["groupuid"];
		this.randomGenUid = o["randomuid"];	
		this.exp_ChessUID = o["chessuid"];	
		this.exp_StartTileUID = o["starttileuid"];
		this.exp_NearestTileUID = o["nearesttileuid"];		
        this.uid2cost = o["uid2cost"];
	};
	
	instanceProto.afterLoad = function ()
	{
		if (this.boardUid === -1)
			this.board = null;
		else
		{
			this.board = this.runtime.getObjectByUID(this.boardUid);
			assert2(this.board, "SLG movement: Failed to find board object by UID");
		}		
		this.boardUid = -1;
		
		if (this.groupUid === -1)
			this.group = null;
		else
		{
			this.group = this.runtime.getObjectByUID(this.groupUid);
			assert2(this.group, "SLG movement: Failed to find instance group object by UID");
		}		
		this.groupUid = -1;	
		
		if (this.randomGenUid === -1)
			this.randomGen = null;
		else
		{
			this.randomGen = this.runtime.getObjectByUID(this.randomGenUid);
			assert2(this.randomGen, "SLG movement: Failed to find random gen object by UID");
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
    
    Acts.prototype.Setup = function (board_objs, group_objs)
	{
        var board = board_objs.instances[0];
        if (board.check_name == "BOARD")
            this.board = board;        
        else
            alert ("SLG movement should connect to a board object");		
            
        var group = group_objs.instances[0];
        if (group.check_name == "INSTGROUP")
            this.group = group;        
        else
            alert ("SLG movement should connect to a instance group object");            
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
	 
	Acts.prototype.GetMoveableArea = function (chess_objs, moving_points, cost, filter_name, group_name)
	{	  
	    this.request_init_clean();
	    	    
	    var group = this.GetInstGroup(); 
	    var board = this.GetBoard();
	    
	    group.GetGroup(group_name).Clean();	    
	    var chess_uid = _get_uid(chess_objs);	    	        
	    var _xyz = this.uid2xyz(chess_uid);
        if (_xyz == null)
            return;
	    if ((moving_points != prop_INFINITY) && (moving_points<=0))
	        return;
	    
	    this.exp_ChessUID = chess_uid;
		var tiles_uids = this.get_moveable_area(chess_uid, moving_points, cost);
        
        // no filter applied
        if (filter_name == "")
        {
            group.GetGroup(group_name).SetByUIDList(tiles_uids);
            return;
        }
        
        // filter applied
	    var i, cnt=tiles_uids.length ,uid, _xyz;	    
        this._filter_fn_name = filter_name;
	    this._filter_uid_list.length = 0;   
	    
	    this.exp_CurTile = {uid:-1, x:-1, y:-1};
	    for (i=0; i<cnt; i++)
		{
            uid = parseInt(tiles_uids[i]);
            this.exp_CurTile.uid = uid;            
            _xyz = this.uid2xyz(uid);
	        this.exp_CurTile.x = _xyz.x;
	        this.exp_CurTile.y = _xyz.y;
            this.runtime.trigger(cr.plugins_.Rex_SLGMovement.prototype.cnds.OnFilterFn, this);
		}
		group.GetGroup(group_name).SetByUIDList(this._filter_uid_list);
	};  
		
	Acts.prototype.GetMovingPath = function (chess_objs, tile_objs, moving_points, cost, group_name, is_nearest)	
	{     
	    this.request_init_clean();
	    	    
	    var group = this.GetInstGroup(); 
	    var board = this.GetBoard();  
	    
	    group.GetGroup(group_name).Clean();
	    var chess_uid = _get_uid(chess_objs);
	    var tile_uid = _get_uid(tile_objs);
        if ((chess_uid == null) || (tile_uid == null))
            return;
	    if ((moving_points != prop_INFINITY) && (moving_points<=0))
	        return;
	    if (this.uid2xyz(chess_uid) == null)
		    return;		
        tile_uid = this.lz2uid(tile_uid, 0);
		if (tile_uid == null)
		    return;
			
        this.exp_ChessUID = chess_uid;
	    var path_tiles_uids = this.get_moving_path(chess_uid, tile_uid, moving_points, cost, is_nearest);
        if (path_tiles_uids.length > 0)
	        group.GetGroup(group_name).SetByUIDList(path_tiles_uids);
	};	 

    Acts.prototype.SetPathMode = function (m)
	{
        this.path_mode = m;
	};
	
    Acts.prototype.SetRandomGenerator = function (randomGen_objs)
	{
        var randomGen = randomGen_objs.instances[0];
        if (randomGen.check_name == "RANDOM")
            this.randomGen = randomGen;        
        else
            alert ("[slg movement] This object is not a random generator object.");
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.ChessUID = function (ret)
	{
	    ret.set_any(this.exp_ChessUID);
	};
		
    Exps.prototype.TileUID = function (ret)
    {
        ret.set_any(node2uid(this.exp_CurTile));
    };	
	
    Exps.prototype.BLOCKING = function (ret)
    {
        ret.set_int(prop_BLOCKING);
    };	
    	
    Exps.prototype.TileX = function (ret)
    {
        ret.set_int(node2lx(this.exp_CurTile));
    };
    	
    Exps.prototype.TileY = function (ret)
    {
        ret.set_int(node2ly(this.exp_CurTile));
    }; 
	
    Exps.prototype.INFINITY = function (ret)
    {
        ret.set_int(prop_INFINITY);
    };
	
    Exps.prototype.UID2PathCost = function (ret, chess_uid)
    {
        var tile_uid = this.tile_uid_get(chess_uid);
        var c = this.uid2cost[tile_uid];
        if (c == null)
            c = -1;
        ret.set_float(c);
    };  
    
    Exps.prototype.NearestTileUID = function (ret)
    {
        ret.set_any(this.exp_NearestTileUID);
    };
    
    Exps.prototype.StartTileUID = function (ret)
    {
        ret.set_any(this.exp_StartTileUID);
    };    
    
    
    Exps.prototype.PreTileUID = function (ret)
    {
        ret.set_any(node2uid(this.exp_PreTile));
    };	
	
    Exps.prototype.PreTileX = function (ret)
    {
        ret.set_int(node2lx(this.exp_PreTile));
    };
    	
    Exps.prototype.PreTileY = function (ret)
    {
        ret.set_int(node2ly(this.exp_PreTile));
    };
    	
    Exps.prototype.PreTilePathCost = function (ret)
    {
        ret.set_float(node2pathcost(this.exp_PreTile));
    };    
         	    
}());