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
        this.boards = {};
	};
    
    instanceProto.board_setup = function(board, instances)
    {      
        var board_layout = board.GetLayout();
        assert2(board_layout, "[Layout to Board] please add squareTx or hexTx plugin into project.");
        var board_info = this.boards[board.uid];        
        var i, cnt=instances.length, chess;
        // assume OXY is at first instance
        chess = instances[0];
        board_layout.SetPOX(chess.x);
        board_layout.SetPOY(chess.y);        
        var lxmin=0, lymin=0, lxmax=0, lymax=0;
        var lx,ly;
        var error_flg;
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
        board_info.px0 = board_layout.LXYZ2PX(lxmin, lymin);
        board_info.py0 = board_layout.LXYZ2PY(lxmin, lymin);      
        lxmax -= lxmin;
        lymax -= lymin;
        board.reset_board(lxmax+1, lymax+1);
        board_layout.SetPOX(board_info.px0);
        board_layout.SetPOY(board_info.py0);
    };
	
	instanceProto.saveToJSON = function ()
	{
		return { "w": this.cell_width,
                 "h": this.cell_height };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.cell_width = o["w"];
		this.cell_height = o["h"];		
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
        var board_layout = board.GetLayout();
        var error_flg;
        for (i=0; i<cnt; i++)
        {
            chess = instances[i];
            lx = board_layout.PXY2LX(chess.x, chess.y);
            ly = board_layout.PXY2LY(chess.x, chess.y);            
            error_flg = (board.xyz2uid(lx, ly, lz) != null)? null:true;
            assert2(error_flg, "[Layout to Board] Error! ("+lx+","+ly+","+lz+") had been occupied.");
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