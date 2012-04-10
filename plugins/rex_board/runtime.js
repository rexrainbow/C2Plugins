// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGBoard = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SLGBoard.prototype;
		
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
        this.check_name = "BOARD";
	    this.board = [];
	    this.reset_board(this.properties[0]-1,
	                     this.properties[1]-1,
	                     this.properties[2]-1);
	                     
        this.layout = null;
        
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
        this.remove_item(inst.uid);
    };
    
	instanceProto.reset_board = function(x_max, y_max, z_max)
	{
	    if (x_max>=0)
	        this.x_max = x_max;
	    if (y_max>=0)    
	        this.y_max = y_max;
	    if (z_max>=0)
	        this.z_max = z_max;
	    
		this.board.length = x_max;
		var x, y, z;
		for (x=0;x<=x_max;x++)
		{
		    this.board[x] = [];
		    this.board[x].length = y_max;
		    for(y=0;y<=y_max;y++)
		    {
		        this.board[x][y] = [];
		        this.board[x][y].length = z_max;
		        for(z=0;z<=z_max;z++)
		        {
		            this.board[x][y][z] = null;
		        }
		    }
		}
		
		this.items = {};
	};
	
	instanceProto.is_inside_board = function (x,y,z)
	{
	    return ((x>=0) && (y>=0) && (z>=0) &&
	            (x<=this.x_max) && (y<=this.y_max) && (z<=this.z_max));
	};	
	
	var _get_uid = function(objs)
	{
        var uid;
	    if (objs == null)
	        uid = null;
	    else if (typeof(objs) != "number")
	    {
	        var inst = objs.getFirstPicked();
	        uid = (inst!=null)? inst.uid:null;
	    }
	    else
	        uid = objs;
            
        return uid;
	};
    
    instanceProto._get_layer = function(layerparam)
    {
        return (typeof layerparam == "number")?
               this.runtime.getLayerByNumber(layerparam):
               this.runtime.getLayerByName(layerparam);
    };    
	instanceProto.CreateItem = function(obj_type,x,y,_layer)
	{
        var layer = this._get_layer(_layer);
        var inst = this.layout.CreateItem(obj_type,x,y,layer);

        // Pick just this instance
        var sol = inst.type.getCurrentSol();
        sol.select_all = false;
		sol.instances.length = 1;
		sol.instances[0] = inst;   

        return inst;        
	};
    
	instanceProto.add_item = function(uid, _x, _y, _z)
	{    
        if ((uid == null) || (!this.is_inside_board(_x, _y, _z)))
            return;
        
        this.remove_item(this.xyz2uid(_x,_y,_z));
	    this.board[_x][_y][_z] = uid;
	    this.items[uid] = {x:_x, y:_y, z:_z};
	};	
    
	instanceProto.remove_item = function(uid)
	{    
        if (uid == null)
            return;
	    
        var _xyz = this.uid2xyz(uid);
        if (_xyz == null)
            return;

        delete this.items[uid];
        this.board[_xyz.x][_xyz.y][_xyz.z] = null;
	};
	instanceProto.move_item = function(chess_uid, target_x, target_y, target_z)
	{    
	    this.remove_item(chess_uid);   
        this.add_item(chess_uid, target_x, target_y, target_z); 
	}; 
	instanceProto.xyz2uid = function(x, y, z)
	{
	    return (this.is_inside_board(x, y, z))? this.board[x][y][z]:null;
	};
	
	instanceProto.uid2xyz = function(uid)
	{
	    return this.items[uid];
	};
	
	instanceProto.CreateChess = function(obj_type,x,y,z,_layer)
	{
        if ((obj_type ==null) || (this.layout == null) || (!this.is_inside_board(x,y,0)))
            return;
            
        var obj = this.CreateItem(obj_type,x,y,_layer);
	    this.add_item(obj.uid,x,y,z);  
	    return obj;
	};	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;        
	  
	cnds.IsEmpty = function (_x,_y,_z)
	{
		return (this.board[_x][_y][_z] == null);
	}; 	
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	
	acts.ResetBoard = function (x_max,y_max,z_max)
	{
		this.reset_board(x_max-1, y_max-1, z_max-1);
	};
		
	acts.AddTile = function (objs,x,y)
	{
	    this.add_item(_get_uid(objs),x,y,0);
	};
	
	acts.AddChess = function (objs,x,y,z)
	{
	    this.add_item(_get_uid(objs),x,y,z);
	};		
    
    acts.SetupLayout = function (layout_objs)
	{   
        var layout = layout_objs.instances[0];
        if (layout.check_name == "LAYOUT")
            this.layout = layout;        
        else
            alert ("SLG board should connect to a layout object");
	};  
		
	acts.CreateTile = function (_obj_type,x,y,_layer)
	{
	    this.CreateChess(_obj_type,x,y,0,_layer);
	};
	
	acts.CreateChess = function (_obj_type,x,y,z,_layer)
	{ 
	    this.CreateChess(_obj_type,x,y,z,_layer);        
	};	
	
	acts.RemoveChess = function (objs)
	{
	    this.remove_item(_get_uid(objs));
	}; 
	
	acts.MoveChess = function (chess_objs, tile_objs)
	{	
        var chess_uid = _get_uid(chess_objs);
        var tile_uid = _get_uid(tile_objs);
	    if ((chess_uid == null) || (tile_uid == null))
	        return;  
        
        var chess_xyz = this.uid2xyz(chess_uid);
        var tile_xyz = this.uid2xyz(tile_uid);
        this.move_item(chess_uid, tile_xyz.x, tile_xyz.y, chess_xyz.z);    
	};
	
	acts.MoveChess2Index = function (chess_objs, x, y, z)
	{	
        var chess_uid = _get_uid(chess_objs);
	    if ((chess_uid == null) || (!this.is_inside_board(x,y,z)))
	        return;  

	    this.remove_item(chess_uid);   
        this.add_item(chess_uid, x, y, z);        
	};    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.UID2LX = function (ret, uid)
	{
	    var _xyz = this.uid2xyz(uid);
	    var x = (_xyz==null)? (-1):_xyz.x;
		ret.set_int(x);
	};	
	
	exps.UID2LY = function (ret, uid)
	{
	    var _xyz = this.uid2xyz(uid);
	    var y = (_xyz==null)? (-1):_xyz.y;
		ret.set_int(y);
	};
	
	exps.UID2LZ = function (ret, uid)
	{
	    var _xyz = this.uid2xyz(uid);
	    var z = (_xyz==null)? (-1):_xyz.z;
		ret.set_int(z);
	};
	
	exps.LXYZ2UID = function (ret,_x,_y,_z)
	{
        var uid = this.xyz2uid(_x,_y,_z);
        if (uid == null)
            uid = -1;
	    ret.set_int(uid);
	}; 	
    
	exps.LZ2UID = function (ret,uid,_z)
	{
	    var ret_uid;
        var _xyz = this.uid2xyz(uid);
        if (_xyz != null)
        {
            ret_uid = this.xyz2uid(_xyz.x, _xyz.y, _z);
            if (ret_uid == null)
                ret_uid = -1;
        }
        else
            ret_uid = -1;
	    ret.set_int(ret_uid);
	}; 	
    
	exps.LXY2PX = function (ret,logic_x,logic_y)
	{
        var px;
        if (this.layout != null)
            px = this.layout.GetX(logic_x,logic_y);
        else
            px = (-1);
	    ret.set_float(px);
	};
    
	exps.LXY2PY = function (ret,logic_x,logic_y)
	{
        var py;
        if (this.layout != null)
            py = this.layout.GetY(logic_x,logic_y);
        else
            py = (-1);
	    ret.set_float(py);
	};
    
	exps.UID2PX = function (ret,uid)
	{
        var px;
        var _xyz = this.uid2xyz(uid);
        if ((this.layout != null) && (_xyz != null))           
            px = this.layout.GetX(_xyz.x,_xyz.y)
        else
            px = (-1);
	    ret.set_float(px);
	};
    
	exps.UID2PY = function (ret,uid)
	{  
        var py;
        var _xyz = this.uid2xyz(uid);
        if ((this.layout != null) && (_xyz != null))        
            py = this.layout.GetY(_xyz.x,_xyz.y)
        else
            py = (-1);
	    ret.set_float(py);
	};  
    
	exps.UID2LA = function (ret, uid_o, uid_to)
	{
        var angle;
        var xyz_o = this.uid2xyz(uid_o);
        var xyz_to = this.uid2xyz(uid_to);
        if ((xyz_o == null) || (xyz_to == null))
            angle = (-1);
        else
        {
            var dx = xyz_to.x - xyz_o.x;
            var dy = xyz_to.y - xyz_o.y;
            if (dy == 0)
                angle = (dx>0)? 0: 180;
            else if (dx == 0)
                angle = (dy>0)? 90: 270;
            else
                angle = cr.to_clamped_degrees(Math.atan2(dy,dx));
        }
	    ret.set_float(angle);
	};  
    
}());