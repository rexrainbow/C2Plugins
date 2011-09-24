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
		
		this.CurBrickUID = (-1);
        this.CurBrickArrX = (-1);
        this.CurBrickArrY = (-1);
        this.FullLineCnt = 0;
        this.FallingLevel = 0;
        this.full_line_indexs = [];
	};
	
	instanceProto._is_in_array = function (x, y)
	{
        return ((x>=0) && (x< this.cx) &&
		        (y>=0) && (y< this.cy));
	};
	
	instanceProto._at = function (x, y)
	{
	    var val = null;
	    if ( this._is_in_array(x, y) ) 
		{
			val = this.board[x][y];
	    }
        return val;
	};
    
	instanceProto._clean_cell = function (x, y)
	{
        this.board[x][y].mask = 0;
        this.board[x][y].uid = (-1);
	};  
    
	instanceProto._fall_down_cell = function (x, y, level)
	{
        var upper_cell = this.board[x][y];
        var lower_cell = this.board[x][y+level];
        lower_cell.mask = upper_cell.mask;
        lower_cell.uid = upper_cell.uid;
	    this._clean_cell(x,y);   
	};  
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	
	cnds.EmptyTest = function (x, y)
	{	
		return (this._is_in_array(x, y))? 
                   (this.board[x][y].mask==0):
                   false;	
	};	
	
	cnds.OnBricksEliminated = function ()
	{
		return true;
	};

	cnds.OnBricksFalling = function ()
	{
		return true;
	};	

	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

	acts.SetData = function (x, y, mask, uid)
	{
		var cell = this._at(x,y);
		if (cell != null) {
		    cell.mask = mask;
			cell.uid = uid;
		}
	};
	
	acts.BricksElimination = function ()
	{
	    var x, y;
		var is_full_line;
        
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
                this.full_line_indexs.push(y);
                for (x = 0; x < this.cx; x++)
                {                    
                    this.CurBrickUID = this.board[x][y].uid;
                    this.CurBrickArrX = x;
                    this.CurBrickArrY = y;
                    // Trigger 'OnBricksEliminated'
		            this.runtime.trigger(cr.plugins_.Tetris.prototype.cnds.OnBricksEliminated, this); 
                    this._clean_cell(x,y);
                }
			}
		} 
        this.FullLineCnt = this.full_line_indexs.length;
	};    
    
	acts.BricksFallen = function ()
	{
        var x, y, i;  
        var empty_line_index,  upper_line_index;
        var cell;
        
        for(i=0; i<this.FullLineCnt; i++)
        {
            empty_line_index = this.full_line_indexs[i];
            upper_line_index = empty_line_index-1;
            if ( (empty_line_index==0) || // topmost line
                 (upper_line_index == this.full_line_indexs[i+1]) ) // upper line is also empty
            {
                continue;
            }
            
		    for (x = 0; x < this.cx; x++)
            {    
                cell = this.board[x][upper_line_index];
                if (cell.mask == 1) 
                {
                    this.CurBrickUID = cell.uid;
                    this.CurBrickArrX = x;
                    this.CurBrickArrY = upper_line_index;   
                    this.FallingLevel = i+1;
                    // Trigger 'OnBricksEliminated'
		            this.runtime.trigger(cr.plugins_.Tetris.prototype.cnds.OnBricksFalling, this); 
                    this._fall_down_cell(x,upper_line_index, this.FallingLevel);                    
                }
            }
        }
        
        this.full_line_indexs = [];
        this.FullLineCnt=0;
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
    
	exps.DumpUIDArray = function (ret)
	{
		var x, y;	
        var dump_out = "";
        var num;
		for (y = 0; y < this.cy; y++)
		{				
			for (x = 0; x < this.cx; x++)
			{	
                num = this.board[x][y].uid;
                num = (num==(-1))? "x":num.toString();
                dump_out += "(" + num + ")";
			}
			dump_out += "\n";
		} 
		ret.set_string(dump_out);
	}; 
	
	exps.Mask = function (ret, x, y)
	{
        var val = (this._is_in_array(x, y))? 
                      this.board[x][y].mask:
                      1;	      
	    ret.set_int(val);
	};
	
	exps.UID = function (ret, x, y)
	{
        var val = (this._is_in_array(x, y))? 
                      this.board[x][y].uid:
                      (-1);
	    ret.set_int(val);
	};	
	
	exps.CurBrickUID = function (ret)
	{
		ret.set_int(this.CurBrickUID);
	};

	exps.CurBrickArrX = function (ret)
	{
		ret.set_int(this.CurBrickArrX);
	};	
    
	exps.CurBrickArrY = function (ret)
	{
		ret.set_int(this.CurBrickArrY);
	}; 

	exps.FullLineCnt = function (ret)
	{
		ret.set_int(this.FullLineCnt);
	}; 

	exps.FallingLevel = function (ret)
	{
		ret.set_int(this.FallingLevel);
	};     
}());