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
	};
    
    instanceProto.board_setup = function(board, instances)
    {      
        var board_layout = board.GetLayout();
        assert2(board_layout, "[Layout to Board] please add squareTx or hexTx plugin into project.");
        var i, cnt=instances.length, chess;
        // assume OXY is at first instance
        chess = instances[0];
        board_layout.SetPOX(chess.x);
        board_layout.SetPOY(chess.y);        
        var lxmin=chess.x, lymin=chess.y;
        var lxmax=chess.x, lymax=chess.y;
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
		var w = board_layout.OffsetLX(lxmax, lymax, 0, -lxmin, -lymin, 0);
		var h = board_layout.OffsetLY(lxmax, lymax, 0, -lxmin, -lymin, 0);
        board.ResetBoard(w, h);
                
        var px0 = board_layout.LXYZ2PX(lxmin, lymin);
        var py0 = board_layout.LXYZ2PY(lxmin, lymin);      
        board_layout.SetPOX(px0);
        board_layout.SetPOY(py0);
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
        if (!board)
            return;
        
        var is_board = (cr.plugins_.Rex_SLGBoard && (board instanceof cr.plugins_.Rex_SLGBoard.prototype.Instance));
        if (is_board && (lz === 0))
            this.board_setup(board, instances);
            
        var i, cnt=instances.length, chess; 
        var lx, ly;
        var board_layout = board.GetLayout();
        var error_flg;
        for (i=0; i<cnt; i++)
        {
            chess = instances[i];
            lx = board_layout.PXY2LX(chess.x, chess.y);
            ly = board_layout.PXY2LY(chess.x, chess.y);            
            error_flg = (board.xyz2uid(lx, ly, lz) != null)? null:true;
            assert2(error_flg, "[Layout to Board] Error! ("+lx+","+ly+","+lz+") had been occupied.");
            board.AddChess(chess, lx, ly, lz);
        }
	};
    
    //af_deprecated
    Acts.prototype.SetCellSize = function (width, height)
    {
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());