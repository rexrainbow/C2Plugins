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
	    this.origin = [null, null];
	    this.mask2value = {};  // mask - value
	    this.mask2board = {};  // mask - board
	    this.board2mask = {};  // board - mask

	    this.onenter = [];
	    this.onexit = [];
	    
	    this.exp_CurLX = 0;
	    this.exp_CurLY = 0;
	    this.exp_CurValue = 0;
	};
	
	var lxy2key = function (x, y)
	{
	    return JSON.stringify([x,y]);
	};
	var key2lxy = function (k)
	{
	    return JSON.parse(k);
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
	    this.mask2board[k] = null;	 	    
	    this.mask2value[k] = v;   
	};
	
	instanceProto.clean_mask = function ()
	{
	    clean_table(this.mask2value);
	    clean_table(this.mask2board);	     	   
	};	
	
	var pre_board2mask = {};
	instanceProto.place_mask = function (x, y)
	{	  
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
            new_place = JSON.stringify(lxy);
            this.mask2board[k] = new_place;
            this.board2mask[new_place] = k;
        }
        
        this.onenter.length = 0;
        this.onexit.length = 0;
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
            
			if (!for_each_key)
			{
                k = klist[i];
		    }
			else
			{
			    k = i;
			}
			lxy = key2lxy(k);
	        this.exp_CurLX = lxy[0];
	        this.exp_CurLY = lxy[1];
	        this.exp_CurValue = this.mask2value[ this.board2mask[k] ];
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
		return {  };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	};
	
	instanceProto.afterLoad = function ()
	{
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
	
	Acts.prototype.SetOrigin = function (x, y)
	{
	    this.place_mask(x, y);
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
	Exps.prototype.CurValue = function (ret)
	{
		ret.set_any(this.exp_CurValue);
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