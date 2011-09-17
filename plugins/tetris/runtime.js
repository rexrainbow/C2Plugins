// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Tetris = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Tetris.prototype;
		
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
	    // create array of board
		this.cx = this.properties[0];
		this.cy = this.properties[1];

		this.board = [];
		this.board.length = this.cx;

		var x, y;
		for (x = 0; x < this.cx; x++)
		{
			this.board[x] = [];
			this.board[x].length = this.cy;
								
			for (y = 0; y < this.cy; y++)
			{
				this.board[x][y] = {mask:0,uid:-1};
			}
		}
		
		this.full_line_index = 0;
	};
	
	instanceProto.is_in_array = function (x, y)
	{
        return ((x>=0) && (x< this.cx) &&
		        (y>=0) && (y< this.cy));
	};
	
	instanceProto.at = function (x, y)
	{
	    var val = null;
	    if ( this.is_in_array(x, y) ) 
		{
			val = this.board[x][y];
	    }
        return val;
	};
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	
	cnds.EmptyTest = function (x, y)
	{	  
        var val = false;
	    if ( this.is_in_array(x, y) ) 
		{
			val = (this.at(x, y).mask==0);
	    }		
		return val;
	};	
	
	cnds.FullLineForEach = function ()
	{
	    var x, y;
		var is_full_line;
        var current_event = this.runtime.getCurrentEventStack().current_event;
		
		this.full_line_index = 0;
		for (y = (this.cy -1) ; y >= 0; y--)
		{	
            is_full_line = true;		
			for (x = 0; x < this.cx; x++)
			{	
                if (this.board[x][y].mask == 0) {
				    is_full_line = false;
				    break;
			    }
			}
			if (is_full_line)
			{
			    this.full_line_index = y;
			    this.runtime.pushCopySol(current_event.solModifiers);
                current_event.retrigger();
                this.runtime.popSol(current_event.solModifiers);
			}
		} 
		this.full_line_index = 0;
		return false;
	};	

	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

	acts.SetData = function (x, y, mask, uid)
	{
		var cell = this.at(x,y);
		if (cell != null) {
		    cell.mask = mask;
			cell.uid = uid;
		}
	};
	
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.DumpMaskArray = function (ret)
	{
		var x, y;	
        var dump_out = "";
		for (y = 0; y < this.cy; y++)
		{				
			for (x = 0; x < this.cx; x++)
			{	
                dump_out += this.board[x][y].mask.toString();
			}
			dump_out += "\n";
		} 
		ret.set_string(dump_out);
	};
	
	exps.Mask = function (ret, x, y)
	{
	    ret.set_int(this.at(x, y).mask);
	};
	
	exps.UID = function (ret, x, y)
	{
	    ret.set_int(this.at(x, y).mask);
	};	
	
	exps.CurFullLine = function (ret)
	{
		ret.set_int(this.full_line_index);
	};	
}());