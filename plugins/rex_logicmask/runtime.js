// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_LogicMask = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_LogicMask.prototype;
		
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
	    this.origin = [0, 0];
	    this.mask2value = {};  // mask - value
	    this.mask2board = {};  // mask - board
	    this.board2mask = {};  // board - mask
        this.is_mask_update = false;

	    this.onenter = [];
	    this.onexit = [];
	    
	    this.exp_CurLX = 0;
	    this.exp_CurLY = 0;
	    this.exp_CurValue = 0;
	    
        this.layout = null;
        this.layoutUid = -1;    // for loading 	            
        this.board = null;
        this.boardUid = -1;    // for loading
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
        assert2(this.board, "Logic mask: Can not find board oject.");
        return null;
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
                 (cr.plugins_.Rex_ProjectionTx && (inst instanceof cr.plugins_.Rex_ProjectionTx.prototype.Instance))   ||                 
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
	        this.mask2value[k] = v;   
	    }
	    else
	    {
	        delete this.mask2board[k];
	        delete this.mask2value[k];
	    }
        this.is_mask_update = true;
	};
	
	instanceProto.clean_mask = function ()
	{
	    clean_table(this.board2mask);
	    this.onenter.length = 0;
	    this.onexit.length = 0;
        this.is_mask_update = true;
	};	
	
	instanceProto.clean_masked_area = function ()
	{
	    clean_table(this.mask2value);
	    clean_table(this.mask2board);	     	   
	};	
		
	var pre_board2mask = {};
	instanceProto.place_mask = function (x, y)
	{
        this.onenter.length = 0;
        this.onexit.length = 0;
        
        this.is_mask_update |= ((x != this.origin[0]) || (y != this.origin[1]));              
        if (!this.is_mask_update)
        {
            return;
        }
        
	    this.origin[0] = x;
	    this.origin[1] = y;	    	    
	    // swap pre_board2mask and this.board2mask
		var tmp = pre_board2mask;
		pre_board2mask = this.board2mask;
		this.board2mask = tmp;
		
        var k, lxy, new_place;
        for (k in this.mask2board)
        {            
		    lxy = key2lxy(k);
			lxy[0] += x;
            lxy[1] += y;
            new_place = lxy2key(lxy[0], lxy[1]);
            this.mask2board[k] = new_place;
            this.board2mask[new_place] = k;
        }

        for (k in this.board2mask)
        {
            if (!pre_board2mask.hasOwnProperty(k))
                this.onenter.push(k);
        }
        for (k in pre_board2mask)
        {
            if (!this.board2mask.hasOwnProperty(k))
                this.onexit.push(k);
        }
        clean_table(pre_board2mask);
		this.is_mask_update = false;
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
	        this.exp_CurValue = null;
	        if (this.board2mask.hasOwnProperty(k))
	        {
	            var mask_k = this.board2mask[k];
	            if (this.mask2value.hasOwnProperty(mask_k))
	                this.exp_CurValue = this.mask2value[mask_k];
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
	    this.origin = [0, 0];
	    this.mask2value = {};  // mask - value
	    this.mask2board = {};  // mask - board
	    this.board2mask = {};  // board - mask

	    this.onenter = [];
	    this.onexit = [];
		return { "origin" :  this.origin,
                 "mask2value" : this.mask2value,
                 "mask2board" : this.mask2board,
                 "board2mask" : this.board2mask,
                 "mask_update" : this.is_mask_update,
                 "onenter" : this.onenter,
                 "onexit" : this.onexit,
                 "luid" : (this.layout != null)? this.layout.uid : (-1),
                 "buid" : (this.board != null)? this.board.uid : (-1)
                 };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.origin = o["origin"];
	    this.mask2value = o["mask2value"];
	    this.mask2board = o["mask2board"];
	    this.board2mask = o["board2mask"];
        this.is_mask_update = o["mask_update"];

	    this.onenter = o["onenter"];
	    this.onexit = o["onexit"];   
        
        this.layoutUid = o["luid"];
        this.boardUid = o["buid"];
	};
	
	instanceProto.afterLoad = function ()
	{
		if (this.layoutUid === -1)
			this.layout = null;
		else
		{
			this.layout = this.runtime.getObjectByUID(this.layoutUid);
			assert2(this.layout, "Logic mask: Failed to find layout object by UID");
		}
		
		this.layoutUid = -1;    
        
		if (this.boardUid === -1)
			this.board = null;
		else
		{
			this.board = this.runtime.getObjectByUID(this.boardUid);
			assert2(this.layout, "Logic mask: Failed to find layout object by UID");
		}
		
		this.boardUid = -1;          
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds(); 
	   
	Cnds.prototype.ForEachEnter = function ()
	{
        return this.cond_for_each(this.onenter);
	};		
	Cnds.prototype.ForEachExit = function ()
	{	     
        return this.cond_for_each(this.onexit);
	};	
	Cnds.prototype.ForEachMask = function ()
	{	     
        return this.cond_for_each(this.board2mask, true);
	};	
	Cnds.prototype.IsMaskArea = function (x, y)
	{	     
        return this.board2mask.hasOwnProperty(lxy2key(x,y));
	};	
    //////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	Acts.prototype.CleanMask = function ()
	{
	    this.clean_mask();
	};
	
	Acts.prototype.FillRectangleMask = function (x, y, w, h, v)
	{
	    var i,j, xmax=x+w-1, ymax=y+h-1;
	    for (i=x; i<=xmax; i++)
	    {
	        for (j=y; j<=ymax; j++)
	        {
	            this.set_mask(i,j,v);
	        }
	    }
	};	
	
	Acts.prototype.FillPointMask = function (x, y, v)
	{
	    this.set_mask(x, y, v);
	};	
	
	Acts.prototype.CleanPointMask = function (x, y)
	{
	    this.set_mask(x, y, null);
	};	
    
	Acts.prototype.FloodFillMask = function (r, v)
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
	        this.set_mask(n.x, n.y, v);
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
	    this.place_mask(x, y);
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
            alert ("Logic mask should connect to a layout object");
	}; 						
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.CurLX = function (ret)
	{
		ret.set_int(this.exp_CurLX);
	}; 	
	Exps.prototype.CurLY = function (ret)
	{
		ret.set_int(this.exp_CurLY);
	};
	Exps.prototype.CurValue = function (ret, default_value)
	{
	    var val = this.exp_CurValue;
	    if (val === null)
	    {
	        if (default_value !== null)
	            val = default_value;
	        else
	            val = 0;
	    }
		ret.set_any(val);
	}; 
	Exps.prototype.OX = function (ret)
	{
		ret.set_int(this.origin[0]);
	}; 	
	Exps.prototype.OY = function (ret)
	{
		ret.set_int(this.origin[1]);
	};	
}());

(function ()
{   
}());