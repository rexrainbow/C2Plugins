// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_board_edge = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_board_edge.prototype;
		
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

	instanceProto.onCreate = function()
	{
	    this.ActCreateInstance = cr.system_object.prototype.acts.CreateObject;
	    this.lxykey2edgeuid = {};
		this.edgeuid2lxykey = {};
		
        this.board = null;
        this.boardUid = -1;    // for loading   
        
		// Need to know if pinned object gets destroyed
		this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this);
										
		this.runtime.addDestroyCallback(this.myDestroyCallback);               	
	};	
	
	instanceProto.onDestroy = function ()
	{
        this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};   
    
    instanceProto.onInstanceDestroyed = function(inst)
    {
        // auto remove uid from board array
        this.remove_edge(inst.uid);
    };	
    
	instanceProto.board_get = function()
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

	instanceProto.lxy2edgeuid = function (lx0, ly0, lx1, ly1)
	{
	    var k = this.lxy2key(lx0, ly0, lx1, ly1);
	    var edge_uid = this.lxykey2edgeuid[k];
	    return edge_uid;  
	};		         
	
	instanceProto.CreateInst = function (objtype, px, py, layer)
	{
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
	
	instanceProto.set_position_angle = function (inst, lx0, ly0, lx1, ly1)
	{
        var layout = this.board_get().GetLayout();	    
	    var px0 = layout.LXYZ2PX(lx0, ly0, 0);
	    var py0 = layout.LXYZ2PY(lx0, ly0, 0);
        var px1 = layout.LXYZ2PX(lx1, ly1, 0); 
        var py1 = layout.LXYZ2PY(lx1, ly1, 0);
        
        inst.x = (px0 + px1)/2;
        inst.y = (py0 + py1)/2;        
	    inst.angle = cr.angleTo(inst.x, inst.y, px0, py0);
	    inst.set_bbox_changed();
	};
	
	instanceProto.lxy2key = function (lx0, ly0, lx1, ly1)
	{   
	    var lxymap;
        if ( lx0 < lx1 )
        {
            lxymap = [lx0, ly0, lx1, ly1];
            return JSON.stringify([lx0, ly0, lx1, ly1]);
        }
        else if ( lx0 == lx1 )
        {
            if ( ly0 < ly1)
            {
                lxymap = [lx0, ly0, lx1, ly1];
            }
            else 
            {
                lxymap = [lx1, ly1, lx0, ly0];
            }
        }
        else
        {
            lxymap = [lx1, ly1, lx0, ly0];
        }
        
        return JSON.stringify(lxymap);
	};
					
	instanceProto.key2lxy = function (k)
	{   	            
        return JSON.parse(k);
	};
	
	instanceProto.remove_edgebylxy = function (lx0, ly0, lx1, ly1)
	{   
	    var k = this.lxy2key(lx0, ly0, lx1, ly1);
	    var edge_uid = this.lxykey2edgeuid[k];
	    if (edge_uid == null)
	        return false;

		delete this.lxykey2edgeuid[k];	        
		delete this.edgeuid2lxykey[edge_uid];
		return true; 
	};	
	
	instanceProto.remove_edge = function (edge_uid)
	{   
	    if (edge_uid == null)
	        return false;
	    var k = this.edgeuid2lxykey[edge_uid];	    
	    if (k == null) 
	        return false;

		delete this.lxykey2edgeuid[k];	        
		delete this.edgeuid2lxykey[edge_uid]; 
		return true; 
	};	
	
	instanceProto.add_edge = function (edge_uid, lx0, ly0, lx1, ly1)
	{   
	    this.remove_edge(edge_uid);
        var k = this.lxy2key(lx0, ly0, lx1, ly1);
        this.lxykey2edgeuid[k] = edge_uid;	    
		this.edgeuid2lxykey[edge_uid] = k;    
	};	
	
	var _uids = [];  // private global object	
	instanceProto.pickuid = function (uid, objtype)
	{
        _uids.length = 1;
        _uids[0] = uid;
        return this.board_get().pickuids(_uids, edge_objtype);
    };	
	
	instanceProto.CreateEdgeBetweenLP = function (edge_objtype, lx0, ly0, lx1, ly1, layer)
	{
        if (!edge_objtype)
            return;
        if (this.board_get().lxy2neighborDir(lx0, ly0, lx1, ly1) == null)  // not neighbor
            return;
            
        var edge_inst = this.CreateInst(edge_objtype, 0, 0, layer);
        if (edge_inst == null)
            return;
            
		this.add_edge(edge_inst.uid, lx0, ly0, lx1, ly1);         
        this.set_position_angle(edge_inst, lx0, ly0, lx1, ly1);		
	};			
    
	instanceProto.saveToJSON = function ()
	{
		return { "lxykey2edgeuid": this.lxykey2edgeuid,
                 "edgeuid2lxykey": this.edgeuid2lxykey,
                 "boarduid": (this.board != null)? this.board.uid:(-1) };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.lxykey2edgeuid = o["lxykey2edgeuid"];
		this.edgeuid2lxykey = o["edgeuid2lxykey"];
		this.boardUid = o["boarduid"];
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
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
	
	Cnds.prototype.HasEdgeBetweenLP = function (lx0, ly0, lx1, ly1)
	{
        var k = this.lxy2key(lx0, ly0, lx1, ly1);        
	    return this.lxykey2edgeuid.hasOwnProperty(k);
	    
	};		  
	Cnds.prototype.HasEdgeBetweenChess = function (chess_uid0, chess_uid1)
	{
	    var board = this.board_get();
	    var xyz0 = board.uid2xyz(chess_uid0);
	    var xyz1 = board.uid2xyz(chess_uid1);
	    if ((xyz0 == null) || (xyz1 == null))
	        return false;
	        
        var k = this.lxy2key(xyz0.x, xyz0.y, xyz1.x, xyz1.y);        
	    return this.lxykey2edgeuid.hasOwnProperty(k);
	};
	
	Cnds.prototype.HasEdgesBesideChessAtDirection = function (chess_objtype, dir)
	{
        if (!chess_objtype)
            return false; 
            
	    var chess_inst = chess_objtype.getFirstPicked();
        if (!chess_inst)
            return false; 
            
	    var board = this.board_get();
	    var xyz0 = board.uid2xyz(chess_inst.uid);
	    var layout = board.GetLayout();
	    var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, dir);
	    var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, dir);
        var edgeuid = this.lxy2edgeuid(xyz0.x, xyz0.y, lx1, ly1);	    	             
        return (edgeuid != null);   
	};			
	
	Cnds.prototype.PickAllEdges = function (edge_objtype)
	{
        if (!edge_objtype)
            return false;
        
        _uids.length = 0;
        var uid;
        for (uid in this.edgeuid2lxykey)                      
        {
            _uids.push(parseInt(uid));
        }
        return board.pickuids(_uids, edge_objtype);
	};
	
	Cnds.prototype.PickEdgeBetweenLP = function (edge_objtype, lx0, ly0, lx1, ly1)
	{
        if (!edge_objtype)
            return false;                      
        var edgeuid = this.lxy2edgeuid(lx0, ly0, lx1, ly1);
        if (edgeuid == null)
            return false;

        return this.pickuid(edgeuid, edge_objtype);
	};	     
	
	Cnds.prototype.PickEdgeBetweenChess = function (edge_objtype, chess_uid0, chess_uid1)
	{	    
        if (!edge_objtype)
            return false; 

	    var board = this.board_get();
	    var xyz0 = board.uid2xyz(chess_uid0);
	    var xyz1 = board.uid2xyz(chess_uid1);
	    if ((xyz0 == null) || (xyz1 == null))
	        return false;
	                
        var edgeuid = this.lxy2edgeuid(lx0, ly0, lx1, ly1);
        if (edgeuid == null)
            return false;
            	                               
        return this.pickuid(edgeuid, edge_objtype);           
	};	    
    
    
	Cnds.prototype.PickEdgesBesideChessAtDirection = function (edge_objtype, chess_objtype, dir)
	{
        if ((!edge_objtype) || (!chess_objtype))
            return false; 
            
	    var chess_inst = chess_objtype.getFirstPicked();
        if (!chess_inst)
            return false; 
            
	    var board = this.board_get();
	    var xyz0 = board.uid2xyz(chess_inst.uid);
	    var layout = board.GetLayout();
	    var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, dir);
	    var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, dir);
        var edgeuid = this.lxy2edgeuid(xyz0.x, xyz0.y, lx1, ly1);
        if (edgeuid == null)
            return false;
            	    	             
        return this.pickuid(edgeuid, edge_objtype);   
	};	
    
	Cnds.prototype.PickChessBesideEdge = function (chess_objtype, edge_objtype, lz)
	{
        if ((!edge_objtype) || (!chess_objtype))
            return false; 
            
	    var edge_inst = edge_objtype.getFirstPicked();
        if (!edge_inst)
            return false;
            
        var k = this.edgeuid2lxykey[edge_inst.uid];
        if (k == null)
            return false;
            
        var lxy = this.key2lxy(k);
        var board = this.board_get();
        if (lz != null)
        {
            var chess_uid0 = board.xyz2uid(lxy[0], lxy[1], lz);
            var chess_uid1 = board.xyz2uid(lxy[2], lxy[3], lz);
            _uids.length = 0;
            if (chess_uid0 != null)
                _uids.push(chess_uid0);
            if (chess_uid1 != null)
                _uids.push(chess_uid1);                
        }
        else
        {
            var zhash0 = board.xy2zhash(lxy[0], lxy[1]);
            var zhash1 = board.xy2zhash(lxy[2], lxy[3]);
            _uids.length = 0;
            var z;
            for (z in zhash0)
            {
                _uids.push(zhash0[z]);
            }
            for (z in zhash1)
            {
                _uids.push(zhash1[z]);
            }            
        }
        
        return board.pickuids(_uids, edge_objtype);
	};	    
    //////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
    Acts.prototype.Setup = function (board_objs)
	{
        var board = board_objs.instances[0];
        if (board.check_name == "BOARD")
            this.board = board;        
        else
            alert ("Edge object should connect to a board object");
	}; 
    
	Acts.prototype.CreateEdgeBetweenLP = function (edge_objtype, lx0, ly0, lx1, ly1, layer)
	{
        this.CreateEdgeBetweenLP(edge_objtype, lx0, ly0, lx1, ly1, layer);
	};	
	    
	Acts.prototype.CreateEdgeBetweenChess = function (edge_objtype, chess_uid0, chess_uid1, layer)
	{
	    var board = this.board_get();
	    var xyz0 = board.uid2xyz(chess_uid0);
	    var xyz1 = board.uid2xyz(chess_uid1);
	    if ((xyz0 == null) || (xyz1 == null))
	        return;
	        
	    this.CreateEdgeBetweenLP(edge_objtype, xyz0.x, xyz0.y, xyz1.x, xyz1.y, layer);        
	};    
	
	Acts.prototype.CreateEdgeBesideChess = function (edge_objtype, chess_objtype, dir, layer)
	{
        if (!chess_objtype)
            return;			
	    var chess_inst = chess_objtype.getFirstPicked();
        if (!chess_inst)
            return;
            
	    var board = this.board_get();
	    var xyz0 = board.uid2xyz(chess_inst.uid);
        if (xyz0 == null)
            return;
	    var layout = board.GetLayout();
	    var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, dir);
	    var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, dir);	    
	    this.CreateEdgeBetweenLP(edge_objtype, xyz0.x, xyz0.y, lx1, ly1, layer);	    
	};	
    
	
	Acts.prototype.RemoveEdgeBetweenLP = function (lx0, ly0, lx1, ly1)
	{       
	    this.remove_edgebylxy(lx0, ly0, lx1, ly1);
	};	 
	
	Acts.prototype.RemoveEdgeBetweenChess = function (chess_uid0, chess_uid1)
	{       
	    var board = this.board_get();
	    var xyz0 = board.uid2xyz(chess_uid0);
	    var xyz1 = board.uid2xyz(chess_uid1);
	    if ((xyz0 == null) || (xyz1 == null))
	        return;
	        
	    this.remove_edgebylxy(xyz0.x, xyz0.y, xyz1.x, xyz1.y); 
	};
	
	Acts.prototype.RemoveEdgeBesideChess = function (chess_objtype, dir, layer)
	{       
        if (!chess_objtype)
            return;			
	    var chess_inst = chess_objtype.getFirstPicked();
        if (!chess_inst)
            return;
            
	    var board = this.board_get();
	    var xyz0 = board.uid2xyz(chess_inst.uid);
        if (xyz0 == null)
            return;        
	    var layout = board.GetLayout();
	    var lx1 = layout.GetNeighborLX(xyz0.x, xyz0.y, dir);
	    var ly1 = layout.GetNeighborLY(xyz0.x, xyz0.y, dir);
	    this.remove_edgebylxy(xyz0.x, xyz0.y, lx1, ly1);
	};    
	
	Acts.prototype.RemoveEdge = function (edge_objtype)
	{       
        if (!edge_objtype)
            return;			
	    var edge_inst = edge_objtype.getFirstPicked();
        if (!edge_inst)
            return;

	    this.remove_edge(edge_inst.uid);
	};   
	
    
	Acts.prototype.MoveEdgeBetweenLP = function (edge_objtype, lx0, ly0, lx1, ly1)
	{
        if (!edge_objtype)
            return;			
	    var edge_inst = edge_objtype.getFirstPicked();
        if (!edge_inst)
            return;
            
        this.add_edge(edge_inst.uid, lx0, ly0, lx1, ly1);
        this.set_position_angle(edge_inst, lx0, ly0, lx1, ly1);
	};
	
	Acts.prototype.MoveEdgeBetweenChess = function (edge_objtype, chess_uid0, chess_uid1)
	{   
	    var board = this.board_get();
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
	    this.set_position_angle(edge_inst, xyz0.x, xyz0.y, xyz1.x, xyz1.y);
	};
	
	Acts.prototype.MoveEdgeBesideChess = function (edge_objtype, chess_objtype, dir, layer)
	{       
        if (!chess_objtype)
            return;			
	    var chess_inst = chess_objtype.getFirstPicked();
        if (!chess_inst)
            return;
            
	    var board = this.board_get();
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
        this.set_position_angle(edge_inst, xyz0.x, xyz0.y, lx1, ly1);
	}; 
	  			
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.LXY2EdgeUID = function (ret, lx0, ly0, lx1, ly1)
	{
        var uid = this.lxy2edgeuid(lx0, ly0, lx1, ly1);
        if (uid == null)
            uid = -1;
	    ret.set_int(uid);
	};
    
	Exps.prototype.ChessUID2EdgeUID = function (ret, chess_uid, dir)
	{
        var board = this.board_get();
        var xyz0 = board.uid2xyz(chess_uid0);
	    var xyz1 = board.uid2xyz(chess_uid1);
	    if ((xyz0 == null) || (xyz1 == null))
        {
            ret.set_int(-1);        
	        return;    
        }
        var uid = this.lxy2edgeuid(xyz0.x, xyz0.y, xyz1.x, xyz1.y);
        if (uid == null)
            uid = -1;
	    ret.set_int(uid);
	};
    
	Exps.prototype.ChessDIR2EdgeUID = function (ret, chess_uid, dir)
	{
	    var board = this.board_get();
	    var xyz0 = board.uid2xyz(chess_uid);
        if (xyz0 == null)
        {
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

	Exps.prototype.ChessUID2EdgeCount = function (ret, chess_uid)
	{
	    var board = this.board_get();
	    var xyz0 = board.uid2xyz(chess_uid);
        if (xyz0 == null)
        {
            ret.set_int(-1);        
	        return;    
        }    
	    var layout = board.GetLayout();         
        var dir, dir_cnt=layout.GetDirCount(), edge_count=0;
        var lx0=xyz0.x, ly0=xyz0.y, lx1, ly1;
        for (dir=0; dir<dir_cnt; dir++)
        {
	        lx1 = layout.GetNeighborLX(lx0, ly0, dir);
	        ly1 = layout.GetNeighborLY(lx0, ly0, dir);        
            if (this.lxy2edgeuid(lx0, ly0, lx1, ly1) != null)
            {
                edge_count += 1;
            }
        }
	    ret.set_int(edge_count);
	};    
}());