// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_layout2board = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_layout2board.prototype;
		
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
        this.cell_width = this.properties[0];
        this.cell_height = this.properties[1];  
        this.px0 = null;
        this.py0 = null;
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.Layout2Board = function (chess_objs, board_objs, lz)
	{  
		if ((!chess_objs) || (!board_objs))
			return;    
            
        var board = board_objs.getFirstPicked();
        var instances = chess_objs.getCurrentSol().getObjects();
        var i, cnt=instances.length, chess; 
        var pxmax=null, pymax=null;
        for (i=0; i<cnt; i++)
        {
            chess = instances[i];
            if ((this.px0==null) || (chess.x < this.px0))
                this.px0 = chess.x;
            if ((this.py0==null) || (chess.y < this.py0))
                this.py0 = chess.y;  
            if (lz==0)                
            {
                if ((pxmax==null) || (chess.x > pxmax))
                    pxmax = chess.x;
                if ((pymax==null) || (chess.y > pymax))
                    pymax = chess.y;                   
            }
        }
        if (lz==0)
        {
            var logic_width=Math.ceil((pxmax-this.px0)/this.cell_width)+1;
            var logic_height=Math.ceil((pymax-this.py0)/this.cell_height)+1;
            board.reset_board(logic_width, logic_height);
            board.layout.PositionOX = this.px0;
            board.layout.PositionOY = this.py0;
        }
        var lx, ly;            
        for (i=0; i<cnt; i++)
        {
            chess = instances[i];
            lx = (chess.x - this.px0)/this.cell_width;
            ly = (chess.y - this.py0)/this.cell_height;
            board.add_item(chess, Math.ceil(lx), Math.ceil(ly), lz);
        }
	};
    
    Acts.prototype.SetCellSize = function (width, height)
    {
        this.cell_width = width;
        this.cell_height = height; 
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());