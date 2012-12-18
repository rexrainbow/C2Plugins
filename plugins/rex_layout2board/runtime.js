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
        this.boards = {};
	};
    
    instanceProto.board_setup = function(board, instances)
    {      
        var board_layout = board.layout;
        assert2(board_layout, "[Layout to Board] please add squareTx or hexTx plugin into project.");
        var board_info = this.boards[board.uid];        
        var i, cnt=instances.length, chess;
        // assume OXY is at first instance
        chess = instances[0];
        board_layout.SetPOX(chess.x);
        board_layout.SetPOY(chess.y);
        board_layout.SetWidth(this.cell_width);
        board_layout.SetHeight(this.cell_height);
        var lxmin=0, lymin=0, lxmax=0, lymax=0;
        var lx,ly;
        for (i=1; i<cnt; i++)
        {
            chess = instances[i];
            lx = board_layout.PXY2LX(chess.x, chess.y);
            ly = board_layout.PXY2LY(chess.x, chess.y);
            if (lxmin > lx)
                lxmin = lx;
            if (lymin > ly)
                lymin = ly; 
            if (lxmax < lx)
                lxmax = lx;
            if (lymax < ly)
                lymax = ly;                        
        }
        // offset logic position
        board_info.px0 = board_layout.GetX(lxmin, lymin);
        board_info.py0 = board_layout.GetY(lxmin, lymin);      
        lxmax -= lxmin;
        lymax -= lymin;
        board.reset_board(lxmax+1, lymax+1);
        board_layout.SetPOX(board_info.px0);
        board_layout.SetPOY(board_info.py0);
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
            
        var instances = chess_objs.getCurrentSol().getObjects();
        if (instances.length == 0)
            return;
            
        var board = board_objs.getFirstPicked();        
        if (!(board.uid in this.boards))
            this.boards[board.uid] = {px0:null, py0:null};        
        if (lz==0)
            this.board_setup(board, instances);
        var i, cnt=instances.length, chess; 
        var lx, ly;       
        var board_info = this.boards[board.uid];
        var board_layout = board.layout;
        for (i=0; i<cnt; i++)
        {
            chess = instances[i];
            lx = board_layout.PXY2LX(chess.x, chess.y);
            ly = board_layout.PXY2LY(chess.x, chess.y); 
            board.add_item(chess, lx, ly, lz);
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