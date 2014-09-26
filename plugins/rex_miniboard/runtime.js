// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_MiniBoard = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_MiniBoard.prototype;
		
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
	    this.layout = null;	
	    this.layoutUid = -1;	
	};

    typeProto.GetLayout = function()
    {
        if (this.layout != null)
            return this.layout;
            
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            
            if ( (cr.plugins_.Rex_SLGSquareTx && (inst instanceof cr.plugins_.Rex_SLGSquareTx.prototype.Instance)) ||
                 (cr.plugins_.Rex_SLGHexTx && (inst instanceof cr.plugins_.Rex_SLGHexTx.prototype.Instance))       ||
                 (cr.plugins_.Rex_SLGCubeTx && (inst instanceof cr.plugins_.Rex_SLGCubeTx.prototype.Instance)) 
                )
            {
                this.layout = inst;
                return this.layout;
            }            
        }
        assert2(this.layout, "Mini board: Can not find layout oject.");
        return null;
    };   
    
	typeProto.CreateItem = function (objtype, lx, ly, lz, layer, callback)
	{
        if ((objtype == null) || (layer == null))
            return;
         
        var layout = this.GetLayout();         
        var px = layout.LXYZ2PX(lx, ly, lz);
        var py = layout.LXYZ2PY(lx, ly, lz);        
        var inst = window.RexC2CreateObject.call(this, objtype, layer, px, py, callback);
        return inst;
	};    
	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

    var _uids = [];  // private global object
	instanceProto.onCreate = function()
	{
	    this.check_name = "BOARD";
        this._pre_x = this.x;
		this._pre_y = this.y;
         
        this.last_POX = (-1);
        this.last_POY = (-1);                
		this.ResetBoard();
		
		this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this); 
        this.runtime.addDestroyCallback(this.myDestroyCallback); 
		this.runtime.tick2Me(this); 

		//this._kicked_chess_inst = null;	
        this.is_putable = 0;
        this.exp_RequestLX = (-1);		
        this.exp_RequestLY = (-1);
        this.exp_RequestLZ = (-1);   
        this.exp_RequestChessUID = (-1);
	};
	
	instanceProto.ResetBoard = function ()
	{
		this.board = {};
		this.items = {};  // uid2xyz
		this.mainBoard = null;
		this.mainBoardUid = -1;    // for loading
		this.POX = (-1);
		this.POY = (-1);
		this._kicked_chess_uid = -1;
	};	
	
	instanceProto.onInstanceDestroyed = function (inst)
	{
		this.remove_item(inst.uid);
	};
    
	instanceProto.onDestroy = function ()
	{
		var uid, inst, uids=this.items;
		for (uid in uids)
		{
		    inst = this.uid2inst(uid);
		    if (inst == null)
		        continue;
		    this.runtime.DestroyInstance(inst);
		}
		this.runtime.removeDestroyCallback(this.myDestroyCallback);        	    	
	};
	instanceProto.chess_pos_set = function ()
	{
	    var dx = this.x - this._pre_x;
		var dy = this.y - this._pre_y;
		if ((dx == 0) && (dy == 0))
		    return;
			
		var uid, inst, uids=this.items;
		for (uid in uids)
		{
		    inst = this.uid2inst(uid);
		    if (inst == null)
		        continue;
			inst.x += dx;
			inst.y += dy;
			inst.set_bbox_changed();
		}
        this._pre_x = this.x;
		this._pre_y = this.y;
	}; 
	instanceProto.tick2 = function ()
	{
	    this.chess_pos_set();  // pin
	};    
	
	instanceProto.draw = function(ctx)
	{
	};
	
	instanceProto.drawGL = function(glw)
	{
	};

	instanceProto.xyz2uid = function(x, y, z)
	{
	    var tmp = this.board[x];
		if (tmp != null)
		{
		    tmp = tmp[y];
			if (tmp != null)
			    return tmp[z];
		}
		return null;
	};
	
	instanceProto.uid2xyz = function(uid)
	{
	    return this.items[uid];
	};
	
	instanceProto.uid2inst = function(uid)
	{
	    if (this.uid2xyz(uid) == null)  // not on the board
	        return null;
	    else
	        return this.runtime.getObjectByUID(uid);
	};
		
	instanceProto._put_chess = function(x, y, z, uid)
	{
	    var tmp;
		if (this.board[x] == null)
		    this.board[x] = {};
        tmp = this.board[x];
		if (tmp[y] == null)
		    tmp[y] = {};
	    tmp = tmp[y];
		tmp[z] = uid;
	};	

	instanceProto.remove_item = function(uid, kicking_notify)
	{            
        var inst = this.uid2inst(uid);
        if (inst == null)
            return;            
                    
        if (kicking_notify)
        {
            this._kicked_chess_uid = uid;
            this.runtime.trigger(cr.plugins_.Rex_SLGBoard.prototype.cnds.OnChessKicked, this); 
        }
        
        var _xyz = this.uid2xyz(uid);
        delete this.items[uid];
        delete this.board[_xyz.x][_xyz.y][_xyz.z];	 
        get_extra_info(inst)["minb_uid"] = null;
	};
	
	var get_extra_info = function (inst)
	{
	    if (!inst.extra.hasOwnProperty("rex_minb"))
	        inst.extra["rex_minb"] = {};
	    return inst.extra["rex_minb"];
	};
	
	instanceProto.add_item = function(inst, lx, ly, lz)
	{
        if (inst == null)
            return;
			
        var uid = inst.uid;
        this.remove_item(this.xyz2uid(lx, ly, lz), true);
		this._put_chess(lx, ly, lz,uid);
	    this.items[uid] = {x:lx, y:ly, z:lz};  
	    get_extra_info(inst)["minb_uid"] = this.uid;
        //this.runtime.trigger(cr.plugins_.Rex_MiniBoard.prototype.cnds.OnCollided, this);                                           
	};
	
	instanceProto.CreateChess = function(obj_type, lx, ly, lz, layer)
	{
	    var layout = this.type.GetLayout();
        if ( (obj_type ==null) || (layout == null) )
            return;
            
	    var pox_save = layout.GetPOX();
		var poy_save = layout.GetPOY();
		layout.SetPOX(this.x);
		layout.SetPOY(this.y);
        
        // callback
        var self = this;  
        var __callback = function (inst)
        {
            self.add_item(inst, lx, ly, lz); 
        }
        // callback        		
        var inst = this.type.CreateItem(obj_type, lx, ly, lz, layer, __callback);
        
		layout.SetPOX(pox_save);
		layout.SetPOY(poy_save);
	    return inst;
	};
	instanceProto.IsEmpty = function (board_inst, offset_lx, offset_ly)
	{
		var board_xmax = board_inst.x_max;
		var board_ymax = board_inst.y_max;
		var board = board_inst.board;   
		var _xyz, x, y, z;
		var uid, uids=this.items;
		for (uid in uids)
		{
		    _xyz = this.uid2xyz(uid);
			x = _xyz.x+offset_lx;
			y = _xyz.y+offset_ly;
			z = _xyz.z;
			if ((x < 0) || (x > board_xmax) || 
			    (y < 0) || (y > board_ymax) || 
			    (board[x][y][z] != null))
			    return false;
		}
		return true;
	}; 	
	instanceProto.PutChess = function (board_inst, offset_lx, offset_ly)
	{	 
	    if (this.mainBoard != null)
		    return;
			
		var _xyz, x, y, z;
		var uid, inst, uids=this.items;
		for (uid in uids)
		{
		    inst = this.uid2inst(uid);
		    if (inst == null)
		        continue;
		    _xyz = this.uid2xyz(uid);
			x = _xyz.x+offset_lx;
			y = _xyz.y+offset_ly;
			z = _xyz.z;			
			board_inst.add_item(inst, x, y, z);
		}
		this.x = board_inst.layout.LXYZ2PX(offset_lx, offset_ly, 0);
		this.y = board_inst.layout.LXYZ2PY(offset_lx, offset_ly, 0);
		this.chess_pos_set();
		this.mainBoard = board_inst;
		this.POX = offset_lx;
		this.POY = offset_ly;
        this.last_POX = offset_lx;
        this.last_POY = offset_ly;        
	};
	
	instanceProto.PullOutChess = function ()
	{	 
	    if (this.mainBoard == null)
		    return;
        
		var _xyz, x, y, z;
		var uid, uids=this.items;
		for (uid in uids)
			this.mainBoard.remove_item(uid);
		this.mainBoard = null;
		this.POX = (-1);
		this.POY = (-1);
	};
	
	instanceProto.pickuids = function (uids, chess_type, ignored_chess_check)
	{
	    var check_callback;
	    if (!ignored_chess_check)
	    {
	        var self = this;
	        check_callback = function (uid)
	        {
	            return (self.uid2xyz(uid) != null);
	        }
	    }	       
	    return window.RexC2PickUIDs.call(this, uids, chess_type, check_callback);  
	};
    
    var name2type = {};  // private global object
	instanceProto._pick_all_insts = function ()
	{	    
	    var uid, inst, objtype, sol;
	    var uids=this.items;
	    hash_clean(name2type);
	    var has_inst = false;    
	    for (uid in uids)
	    {
		    inst = this.uid2inst(uid);
		    if (inst == null)
		        continue;
	        objtype = inst.type; 
	        sol = objtype.getCurrentSol();
	        if (!(objtype.name in name2type))
	        {
	            sol.select_all = false;
	            sol.instances.length = 0;
	            name2type[objtype.name] = true;
	        }
	        sol.instances.push(inst);  
	        has_inst = true;
	    }
        hash_clean(name2type);
	    return has_inst;
	};
	
	instanceProto._is_putable_test = function (board_inst, offset_lx, offset_ly)
	{
		var board_xmax = board_inst.x_max;
		var board_ymax = board_inst.y_max;
		var board = board_inst.board;   
		var _xyz, x, y, z;
		var uid, uids=this.items;
		for (uid in uids)
		{		    
		    _xyz = this.uid2xyz(uid);
			x = _xyz.x+offset_lx;
			y = _xyz.y+offset_ly;
			z = _xyz.z;
        									
			if ((x < 0) || (x > board_xmax) || 
			    (y < 0) || (y > board_ymax)    )
			    return false;
		    else
		    {
                this.exp_RequestLX = _xyz.x+offset_lx;	
                this.exp_RequestLY = _xyz.y+offset_ly;
                this.exp_RequestLZ = _xyz.z;
                this.exp_RequestChessUID = parseInt(uid);
                this.is_putable = false;
                this.runtime.trigger(cr.plugins_.Rex_MiniBoard.prototype.cnds.OnPutAbleRequest, this);
                if (!this.is_putable)
                    return false;
		    }
		}
        this.exp_RequestLX = (-1);		
        this.exp_RequestLY = (-1);
        this.exp_RequestLZ = (-1);	
        this.exp_RequestChessUID = (-1);	
		return true;
	};
		
	var hash_clean = function (obj)
	{
	    var k;
	    for (k in obj)
	        delete obj[k];
	};
	
	instanceProto.saveToJSON = function ()
	{    
	    // wrap: copy from this.items
	    var uid, uid2xyz = {}, item;
	    for (uid in this.items)
	    {
	        uid2xyz[uid] = {};
	        item = this.items[uid];
	        uid2xyz[uid]["x"] = item.x;
	        uid2xyz[uid]["y"] = item.y;
	        uid2xyz[uid]["z"] = item.z;	        
	    }
	    	    
		return { "pre_x": this._pre_x,
		         "pre_y": this._pre_y,
                 "l_pox": this.last_POX,
                 "l_poy": this.last_POY,
                 "xyz2uid": this.board,
                 "uid2xyz": uid2xyz,
                 "mbuid" : (this.mainBoard!=null)? this.mainBoard.uid:(-1),
                 "pox": this.POX,
                 "poy": this.POY,
                 "luid": (this.type.layout != null)? this.type.layout.uid:(-1)
               };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this._pre_x = o["pre_x"];
		this._pre_y = o["pre_y"];
        this.last_POX = o["l_pox"]; 
        this.last_POY = o["l_poy"];
        this.board = o["xyz2uid"];     
        this.mainBoardUid = o["mbuid"];
        this.POX = o["pox"]; 
        this.POY = o["poy"];  
        this.type.layoutUid = o["luid"];
        
        
        // wrap: copy to this.items
        hash_clean(this.items);
	    var uid, uid2xyz = o["uid2xyz"], item;
	    for (uid in uid2xyz)
	    {
	        this.items[uid] = {};
	        item = uid2xyz[uid];
	        this.items[uid].x = item["x"];
	        this.items[uid].y = item["y"];
	        this.items[uid].z = item["z"];	        
	    }          
	};
	
	instanceProto.afterLoad = function ()
	{
		if (this.mainBoardUid === -1)
			this.mainBoard = null;
		else
		{
			this.mainBoard = this.runtime.getObjectByUID(this.mainBoardUid);
			assert2(this.mainBoard, "Mini board: Failed to find main board object by UID");
		}
		
		this.mainBoardUid = -1;
		
		if (this.type.layoutUid === -1)
			this.type.layout = null;
		else
		{
			this.type.layout = this.runtime.getObjectByUID(this.type.layoutUid);
			assert2(this.type.layout, "Mini board: Failed to find layout object by UID");
		}
		
		this.type.layoutUid = -1;		
	};
			
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	  
	Cnds.prototype.AreEmpty = function (board_objs, offset_lx, offset_ly)
	{
		if (!board_objs)
			return; 
		return this.IsEmpty(board_objs.getFirstPicked(), offset_lx, offset_ly);
	}; 

	Cnds.prototype.PickAllChess = function ()
	{
	    return this._pick_all_insts();
	};
    
	Cnds.prototype.PickMiniboard = function (objtype)
	{
		if (!objtype)
			return; 
            
    	var insts = objtype.getCurrentSol().getObjects();        
    	var cnt = insts.length;
        if (cnt == 0)
            return false;
        var miniboard_type = this.runtime.getCurrentCondition().type;  
        var miniboard_sol = miniboard_type.getCurrentSol();
        miniboard_sol.select_all = false;
        miniboard_sol.instances.length = 0;                
        var i, miniboard_uid, miniboard_inst;
        var uids = {};
        for (i=0; i<cnt; i++)
        {
            miniboard_uid = get_extra_info(insts[i])["minb_uid"];
            if (miniboard_uid == null)
                continue;
            if (miniboard_uid in uids)
                continue;
            miniboard_inst = this.runtime.getObjectByUID(miniboard_uid);
            if (miniboard_inst == null)
                continue;
            miniboard_sol.instances.push(miniboard_inst);
            uids[miniboard_uid] = true;
        }
        var current_event = this.runtime.getCurrentEventStack().current_event;
        this.runtime.pushCopySol(current_event.solModifiers);
        current_event.retrigger();
        this.runtime.popSol(current_event.solModifiers);
		return false;            
	}; 
	  
	Cnds.prototype.IsOnTheBoard = function (board_objs)
	{
		if (!board_objs)
			return; 
		var board_inst = board_objs.getFirstPicked();
		return (this.mainBoard == board_inst);
	}; 
	
	Cnds.prototype.ArePutAble = function (board_objs, offset_lx, offset_ly)
	{
		if (!board_objs)
			return; 
		return this._is_putable_test(board_objs.getFirstPicked(), offset_lx, offset_ly);
	}; 
	  
	Cnds.prototype.OnPutAbleRequest = function ()
	{
		return true;
	}; 
	
	Cnds.prototype.OnChessKicked = function (chess_type)
	{
        _uids.length = 0;
        _uids.push(this._kicked_chess_uid);
        var has_inst = this.pickuids(_uids, chess_type);
        _uids.length = 0;
        return has_inst;  
	};		
	
	//cf_deprecated
	Cnds.prototype.CanFindEmpty = function (board_objs, _start_lx, _start_ly, _range)  {	};	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetupLayout = function (layout_objs)
	{   
        var layout = layout_objs.instances[0];
        if (layout.check_name == "LAYOUT")
            this.type.layout = layout;        
        else
            alert ("Mini board should connect to a layout object");
	};  
	
	Acts.prototype.CreateChess = function (obj_type, lx, ly, lz, layer)
	{
	    this.CreateChess(obj_type, lx, ly, lz, layer);        
	};	
	
	Acts.prototype.PutChess = function (board_objs, offset_lx, offset_ly)
	{	 
		if (!board_objs)
			return;
		this.PutChess(board_objs.getFirstPicked(), offset_lx, offset_ly);
	};
	
	Acts.prototype.PullOutChess = function ()
	{	 
		this.PullOutChess();
	};
	
	Acts.prototype.PickAllChess = function ()
	{	
        this._pick_all_insts();
	};
	
	Acts.prototype.ReleaseAllChess = function ()
	{	
        this.ResetBoard();
	};	
	
	Acts.prototype.SetPutAble = function (put_able)
	{	
        this.is_putable = (put_able == 1);
	};		
	
	Acts.prototype.AddChess = function (obj_type, lx, ly, lz)
	{	
        if (!obj_type)
            return;			
	    var inst = obj_type.getFirstPicked();
        if (!inst)
            return;	  	    
        this.add_item(inst, lx, ly, lz);
	};		
		    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.LX = function (ret)
	{
	    var lx = (this.mainBoard == null)? (-1): this.POX;
	    ret.set_int(lx);
	};
	Exps.prototype.LY = function (ret)
    {
	    var ly = (this.mainBoard == null)? (-1): this.POY;
	    ret.set_int(ly);
	};	
	Exps.prototype.LastLX = function (ret)
	{
	    ret.set_int(this.last_POX);
	};
	Exps.prototype.LastLY = function (ret)
    {
	    ret.set_int(this.last_POY);
	};	
	Exps.prototype.RequestLX = function (ret)
	{
	    ret.set_int(this.exp_RequestLX);
	};
	Exps.prototype.RequestLY = function (ret)
	{
	    ret.set_int(this.exp_RequestLY);
	}; 
	Exps.prototype.RequestLZ = function (ret)
	{
	    ret.set_int(this.exp_RequestLZ);
	};
	Exps.prototype.RequestChessUID = function (ret)
	{
	    ret.set_int(this.exp_RequestChessUID);
	};	

	//ef_deprecated
	Exps.prototype.EmptyLX = function (ret) { ret.set_int(0); };
	// ef_deprecated
	Exps.prototype.EmptyLY = function (ret) { ret.set_int(0); };    
}());


(function ()
{
    // general CreateObject function which call a callback before "OnCreated" triggered
    if (window.RexC2CreateObject != null)
        return;
        
    // copy from system action: CreateObject
    var CreateObject = function (obj, layer, x, y, callback)
    {
        if (!layer || !obj)
            return;

        var inst = this.runtime.createInstance(obj, layer, x, y);
		
		if (!inst)
			return;
		
		this.runtime.isInOnDestroy++;
		
		// call callback before "OnCreated" triggered
		if (callback)
		    callback(inst);
		// call callback before "OnCreated" triggered
		
		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s);
			}
		}
		
		this.runtime.isInOnDestroy--;

        // Pick just this instance
        var sol = obj.getCurrentSol();
        sol.select_all = false;
		sol.instances.length = 1;
		sol.instances[0] = inst;
		
		// Siblings aren't in instance lists yet, pick them manually
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				sol = s.type.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = s;
			}
		}
		
		return inst;
    };
    
    window.RexC2CreateObject = CreateObject;
}());

(function ()
{
    // general pick instances function
    if (window.RexC2PickUIDs != null)
        return;

	var PickUIDs = function (uids, objtype, check_callback)
	{
        var sol = objtype.getCurrentSol();
        sol.instances.length = 0;
        sol.select_all = false;
        var is_family = objtype.is_family;
        var members,member_cnt,i;
        if (is_family)
        {
            members = objtype.members;
            member_cnt = members.length;
        }
        var i,j,uid_cnt=uids.length;
        for (i=0; i<uid_cnt; i++)
        {
            var uid = uids[i];
            var inst = this.runtime.getObjectByUID(uid);
            if (inst == null)
                continue;
            if ((check_callback != null) && (!check_callback(uid)))
                continue;
            
            var type_name = inst.type.name;
            if (is_family)
            {
                for (j=0; j<member_cnt; j++)
                {
                    if (type_name == members[j].name)
                    {
                        sol.instances.push(inst); 
                        break;
                    }
                }
            }
            else
            {
                if (type_name == objtype.name)
                {
                    sol.instances.push(inst);
                }
            }            
        }
        objtype.applySolToContainer();
	    return (sol.instances.length > 0);	    
	};    

    window.RexC2PickUIDs = PickUIDs;
}());    