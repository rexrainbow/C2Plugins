// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_GridFreezer = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
    // global for all instances
    var _SID2Objtype = {};  
	
	var pluginProto = cr.plugins_.Rex_GridFreezer.prototype;
		
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
	    this.activated = (this.properties[0]==1);
		this.save_mode = this.properties[1];
		
		// logic mask
	    this.origin = [null, null];
	    this.mask2board = {};  // mask - board
	    this.board2mask = {};  // board - mask		
	    this.onenter = [];
		this.is_mask_update = false;
        this.global_data = null;
		
		this.layout = null;
		
		// save-load
		this.extra_data = null;
		this.cond_save_inst = null;
	    this.target_types = [];
	    this.board2insts = {};  // board - inst
	    this.runtime.tick2Me(this);
		
		// expressions
		this.exp_LoadInstUID = -1;
		this.exp_ExtraData = null;
	    this.exp_CurLX = 0;
	    this.exp_CurLY = 0;		
	};

    instanceProto.tick2 = function()
    {
        if (!this.activated)
            return;
			
        this.runtime.ClearDeathRow();
        
        // save instances which not in mask
        var insts = this.pick_target_instances();
        insts = this.instances_not_in_mask(insts);
        this.save_instances(insts);                
    };	
    
    instanceProto.GetLayout = function()
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
        assert2(this.layout, "Logic mask: Can not find layout oject.");
        return null;
    };  

	var lxy2key = function (x, y)
	{
	    return x.toString()+","+y.toString();
	};
	var key2lxy = function (k)
	{
	    var lxy = k.split(",");
	    lxy[0] = parseInt(lxy[0]);
	    lxy[1] = parseInt(lxy[1]);
	    return lxy;
	};						
	var clean_table = function (o)
	{
	    var k;
		for (k in o)
		    delete o[k];
	};
	
	instanceProto.set_mask = function (x, y, v)
	{
	    var k = lxy2key(x,y);
	    if (v !== null)
	    {
	        this.mask2board[k] = null;
	    }
	    else
	    {
	        delete this.mask2board[k];
	    }
        this.is_mask_update = true;		
	};
	
	instanceProto.clean_mask = function ()
	{
	    clean_table(this.board2mask);
	    this.onenter.length = 0; 
		this.is_mask_update = true;
	};	
	
	instanceProto.clean_masked_area = function ()
	{
	    clean_table(this.mask2board);	     	   
	};
		
	var pre_board2mask = {};
	instanceProto.place_mask = function (olx, oly)
	{	  
        this.onenter.length = 0;
        
        this.is_mask_update |= ((olx != this.origin[0]) || (oly != this.origin[1]));              
        if (!this.is_mask_update)
        {
            return;
        }
		
	    this.origin[0] = olx;
	    this.origin[1] = oly;	    	    
	    // swap pre_board2mask and this.board2mask
		var tmp = pre_board2mask;
		pre_board2mask = this.board2mask;
		this.board2mask = tmp;
		
        var k, lxy, new_place;
        for (k in this.mask2board)
        {            
		    lxy = key2lxy(k);
			lxy[0] += olx;
            lxy[1] += oly;
            new_place = lxy2key(lxy[0], lxy[1]);
            this.mask2board[k] = new_place;
            this.board2mask[new_place] = k;
        }
        
        for (k in this.board2mask)
        {
            if (!pre_board2mask.hasOwnProperty(k))
                this.onenter.push(k);
        }
        clean_table(pre_board2mask); 
		this.is_mask_update = false;		
	};	

    instanceProto.pick_target_instances = function()
    {
        var candidates = [];
        var i, len;
		for (i = 0, len = this.target_types.length; i < len; ++i)
		{
			cr.appendArray(candidates, this.target_types[i].instances);
		}
		return candidates;
    };	
    
	instanceProto.inst2key = function (inst)
	{
	    var layout = this.GetLayout();
	    var lx = layout.PXY2LX(inst.x, inst.y);
	    var ly = layout.PXY2LY(inst.x, inst.y);	   
	    return lxy2key(lx, ly);
	};	
	    
    instanceProto.instances_not_in_mask = function(insts)
    {
        var i, len, inst, k;
        var valid_index = -1;
		for (i = 0, len = insts.length; i < len; ++i)
		{
		    inst = insts[i];
		    k = this.inst2key(inst);
		    if (this.board2mask.hasOwnProperty(k))
		       continue;
		    
		    valid_index += 1;
		    insts[valid_index] = insts[i];
		}
		insts.length = valid_index + 1;
		return insts;
    };	
 
	instanceProto.save_instances = function (insts)
	{
        var i, len, inst, k, saved_obj, nn;
		for (i = 0, len = insts.length; i < len; ++i)
		{
		    inst = insts[i];
		    k = this.inst2key(inst);
		    if (!this.board2insts.hasOwnProperty(k))
		    {
		        this.board2insts[k] = [];
		    }
			
			if (this.save_mode === 0)
			{
		        saved_obj = this.runtime.saveInstanceToJSON(inst, true);
				saved_obj["sid"] = inst.type.sid.toString();
		    }
			else
			{
			    saved_obj = {};
			}
			this.cond_save_inst = inst;
			this.runtime.trigger(cr.plugins_.Rex_GridFreezer.prototype.cnds.OnSave, this);			
			if (this.extra_data != null)
			{			    
			    saved_obj["ed"]  = this.extra_data;
				this.extra_data = null;
		    }
			
		    this.board2insts[k].push(saved_obj);
		    this.runtime.DestroyInstance(inst);			
		}
		insts.length = 0;
	};
	
    instanceProto.SID2Type = function(sid)
    {
        if (_SID2Objtype[sid] == null)
        {
            _SID2Objtype[sid] = this.runtime.getObjectTypeBySid(sid);
        }
        return _SID2Objtype[sid];
    };   
	
	instanceProto.load_entered_instances = function (onenter)
	{
        // load instances which in entered area
        var i, len;
		for (i = 0, len = onenter.length; i < len; ++i)
		{		
			this.load_instances(onenter[i]);
		}
	};
	
    instanceProto.load_instances = function(k)
    {
        if (!this.board2insts.hasOwnProperty(k))
            return;
            
        var load_objs = this.board2insts[k];
        var i, len, inst, load_obj, t, layer;
		for (i = 0, len = load_objs.length; i < len; ++i)
		{
		    load_obj = load_objs[i];
			
			if (this.save_mode === 0)
			{
		        t = this.SID2Type(parseInt(load_obj["sid"]));
		        if (!t)
		            continue;
		
		        layer = null;
                if (t.plugin.is_world)
                {
                    layer = this.runtime.running_layout.getLayerBySid(load_obj["w"]["l"]);						
                    if (!layer)
                        return;
                }  				

		        inst = window.RexC2CreateObject.call(this, t, layer, 0, 0, null, true);
                this.runtime.loadInstanceFromJSON(inst, load_obj, true);
				
				this.exp_LoadInstUID = inst.uid;                
			}
			else
			{
			    this.exp_LoadInstUID = -1;
			}
			
			this.exp_ExtraData = load_obj["ed"];
	        this.runtime.trigger(cr.plugins_.Rex_GridFreezer.prototype.cnds.OnLoad, this);			
		}
		
		delete this.board2insts[k];
		this.exp_LoadInstUID = -1;
    };	 

    var types2sid = function (types)
    {
        var sids=[], i, len;
	    for (i = 0, len = types.length; i < len; ++i)
		{
			sids.push(types[i].sid.toString());
		}
        return sids;
    };
    
	instanceProto.export_grids_data = function ()
	{
        var grids_data = { "origin": this.origin,
		                   "mask2board" : this.mask2board,
		                   "board2mask" : this.board2mask,
		                   "board2insts" : this.board2insts,
                           "save_mode" : this.save_mode,
		                 };
        if (this.save_mode === 0)
        {
            grids_data["target_types"] = types2sid(this.target_types);
        }
		

		var layout = this.GetLayout();
		grids_data["layout"] = layout.saveToJSON();
        grids_data["global_data"] = this.global_data;
		
        return JSON.stringify( grids_data );		
	};

	instanceProto.import_grids_data = function (json_)
	{        
		var o;
		
		try {
			o = JSON.parse(json_);
		}
		catch(e) { return; }
        
        this.save_mode = o["save_mode"];
	    this.origin = o["origin"];
	    this.mask2board = o["mask2board"];
	    this.board2mask = o["board2mask"];
	    this.board2insts = o["board2insts"];  

        this.target_types.length = 0;
        if (o["target_types"] != null)
        {
            var save_sid=o["target_types"], i, len, t;
		    for (i = 0, len = save_sid.length; i < len; ++i)
		    {		
		        t = this.runtime.getObjectTypeBySid(parseInt(save_sid[i]));
		        if (t)
		            this.target_types.push(t);
		    }        
        }
		
		var layout = this.GetLayout();
		layout.loadFromJSON( o["layout"] );

        this.global_data = o["global_data"];
	};    
	
	instanceProto.cond_for_each = function (klist, for_each_key)
	{
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		var i, k, lxy;
        for(i in klist)
        {
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            k = (for_each_key)? i:klist[i];
			lxy = key2lxy(k);
	        this.exp_CurLX = lxy[0];
	        this.exp_CurLY = lxy[1];
	        if (this.board2mask.hasOwnProperty(k))
	        {
	            var mask_k = this.board2mask[k];
	        }
	        
		    current_event.retrigger();
		      
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }
        }
                    		
		return false;
	};	
	
	instanceProto.saveToJSON = function ()
	{	    	    
		return { 
                 "e": this.activated,
                 "origin": this.origin,
		         "mask2board" : this.mask2board,
		         "board2mask" : this.board2mask,
		         "target_types" : types2sid(this.target_types),
		         "board2insts" : this.board2insts,
				 "mask_update" : this.is_mask_update,
                 "global_data": this.global_data,
		        };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        this.activated = o["e"];                          
	    this.origin = o["origin"];
	    this.mask2board = o["mask2board"];
	    this.board2mask = o["board2mask"];
	    
        var save_sid=o["target_types"], i, len, t;
		for (i = 0, len = save_sid.length; i < len; ++i)
		{		
		    t = this.runtime.getObjectTypeBySid(parseInt(save_sid[i]));
		    if (t)
		        this.target_types.push(t);
		}
		
	    this.board2insts = o["board2insts"];
        this.is_mask_update = o["mask_update"];	

        this.global_data = o["global_data"];   
	};
    
 	var getItemValue = function (item, k, default_value)
	{
        var v;
	    if (item == null)
            v = null;
        else if ( (k == null) || (k === "") )
            v = item;
        else if ((typeof(k) === "number") || (k.indexOf(".") == -1))
            v = item[k];
        else
        {
            var kList = k.split(".");
            v = item;
            var i,cnt=kList.length;
            for(i=0; i<cnt; i++)
            {
                if (typeof(v) !== "object")
                {
                    v = null;
                    break;
                }
                    
                v = v[kList[i]];
            }
        }

        return din(v, default_value);
	};	    
    
    var din = function (d, default_value)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (d == null)
        {
            if (default_value != null)
                o = default_value;
            else
                o = 0;
        }
        else if (typeof(d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
	    return o;
    };     
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();  
	
	Cnds.prototype.OnSave = function (objType)
	{
	    var type_match = (this.cond_save_inst.type === objType);
		var sol = objType.getCurrentSol();
		if (type_match)
		{		   
		    sol.pick_one(this.cond_save_inst);
		}
		else
		{
		    sol.instances.length = 0;
		}
		return type_match;
	};

	Cnds.prototype.OnLoad = function ()
	{
		return true;
	};
	
	Cnds.prototype.ForEachMask = function ()
	{	     
        return this.cond_for_each(this.board2mask, true);
	};		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	Acts.prototype.SetEnabled = function (s)
	{
		this.activated = (s == 1);
	};  
	
	Acts.prototype.CleanMask = function ()
	{
	    this.clean_mask();
	};
	
	Acts.prototype.FillRectangleMask = function (x, y, w, h)
	{
	    var i,j, xmax=x+w-1, ymax=y+h-1;
	    for (i=x; i<=xmax; i++)
	    {
	        for (j=y; j<=ymax; j++)
	        {
	            this.set_mask(i,j,1);
	        }
	    }
	};	

	Acts.prototype.FloodFillMask = function (r)
	{
	    var layout = this.GetLayout();
	    if (r <= 0)
	        return;
              
	    var nodes = [], lxy_visited = {};
	    var push_node = function(x_, y_, r_)
	    {
	        var k = lxy2key(x_, y_);
	        if (lxy_visited.hasOwnProperty(k))
	            return;
	            
	        nodes.push( {x:x_, y:y_, r:r_} );
	        lxy_visited[k] = true;
	    };
	    
	    push_node(0, 0, r);
	    	   
        var n, dir_count = layout.GetDirCount();  	    
	    while (nodes.length > 0)
	    {
	        // get a node
	        n = nodes.shift();
	        // set mask value
	        this.set_mask(n.x, n.y, 1);
	        // push neighbors
	        if (n.r > 0)
	        {
	            var neighobr_r = n.r - 1;
	            var dir, neighobr_x, neighobr_y;
	            for(dir=0; dir<dir_count; dir++)
	            {
	                neighobr_x = layout.GetNeighborLX(n.x, n.y, dir);
	                neighobr_y = layout.GetNeighborLY(n.x, n.y, dir);	                
	                push_node(neighobr_x, neighobr_y, neighobr_r);
	            }
	        }
	    };
	};	

	Acts.prototype.PutMask = function (x, y)
	{
        if (!this.activated)
            return;
			
	    var layout = this.GetLayout();
	    var olx = layout.PXY2LX(x, y);
	    var oly = layout.PXY2LY(x, y);	

	    this.place_mask(olx, oly);

	    this.load_entered_instances(this.onenter);
	    this.onenter.length = 0;
	};	
	
	Acts.prototype.CleanMaskedArea = function ()
	{
	    this.clean_masked_area();
	};	
	
    Acts.prototype.SetupLayout = function (layout_objs)
	{   
        var layout = layout_objs.getFirstPicked();
        if (layout.check_name == "LAYOUT")
            this.layout = layout;        
        else
            alert ("Grid freezer should connect to a layout object");
	}; 	
	
	Acts.prototype.AddTarget = function (obj_)
	{
		if (!obj_)
			return;
			
		// Check not already a target, we don't want to add twice
		if (this.target_types.indexOf(obj_) !== -1)
			return;
			
		// Check obj is not a member of a family that is already a target
		var i, len, t;
		for (i = 0, len = this.target_types.length; i < len; i++)
		{
			t = this.target_types[i];
			
			if (t.is_family && t.members.indexOf(obj_) !== -1)
				return;
		}
		
		this.target_types.push(obj_);			
	};	

	Acts.prototype.SaveAll = function ()
	{
	    this.save_instances( this.pick_target_instances() );
	};	

	Acts.prototype.ImportGridData = function (json_)
	{
		this.import_grids_data(json_);
	};	

	Acts.prototype.SetExtraData = function (index, value)
	{
	    if (this.extra_data == null)
		    this.extra_data = {};
			
        this.extra_data[index] = value;
	}; 

	Acts.prototype.SetGlobalData = function (index, value)
	{
	    if (this.global_data == null)
		    this.global_data = {};
			
        this.global_data[index] = value;
	}; 

	Acts.prototype.LoadAll = function ()
	{
        for (var k in this.board2insts)
	        this.load_instances(k);
	}; 	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.GridData = function (ret)
	{
	    ret.set_string(this.export_grids_data());
	};	
    Exps.prototype.ExtraData = function (ret, keys, default_value)
	{
	    ret.set_any( getItemValue(this.exp_ExtraData, keys, default_value) );
	};	
	Exps.prototype.LoadInstUID = function (ret)
	{
		ret.set_int(this.exp_LoadInstUID);
	}; 	
    Exps.prototype.GlobalData = function (ret, keys, default_value)
	{
	    ret.set_any( getItemValue(this.global_data, keys, default_value) );
	};	    
	Exps.prototype.CurLX = function (ret)
	{
		ret.set_int(this.exp_CurLX);
	}; 	
	Exps.prototype.CurLY = function (ret)
	{
		ret.set_int(this.exp_CurLY);
	};	
	Exps.prototype.CurPX = function (ret)
	{
	    var px = this.GetLayout().LXYZ2PX(this.exp_CurLX, this.exp_CurLY);
		ret.set_float(px);
	}; 	
	Exps.prototype.CurPY = function (ret)
	{
	    var py = this.GetLayout().LXYZ2PY(this.exp_CurLX, this.exp_CurLY);
		ret.set_float(py);
	};	
}());

(function ()
{
    // general CreateObject function which call a callback before "OnCreated" triggered
    if (window.RexC2CreateObject != null)
        return;
        
    // copy from system action: CreateObject
    var CreateObject = function (obj, layer, x, y, callback, ignore_picking)
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

        if (ignore_picking !== true)
        {
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
        }

        // add solModifiers
        //var current_event = this.runtime.getCurrentEventStack().current_event;
        //current_event.addSolModifier(obj);
        // add solModifiers
        
		return inst;
    };
    
    window.RexC2CreateObject = CreateObject;
}());
    