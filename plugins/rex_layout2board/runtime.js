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
        var board_info = this.boards[board.uid];
        var i, cnt=instances.length, chess; 
        var pxmax=null, pymax=null;
        
        board_info.px0 = null;
        board_info.py0 = null;
        for (i=0; i<cnt; i++)
        {
            chess = instances[i];
            if ((board_info.px0 == null) || (chess.x < board_info.px0))
                board_info.px0 = chess.x;
            if ((board_info.py0 == null) || (chess.y < board_info.py0))
                board_info.py0 = chess.y;  
            if ((pxmax==null) || (chess.x > pxmax))
                pxmax = chess.x;
            if ((pymax==null) || (chess.y > pymax))
                pymax = chess.y;                   
        }
            
        board.reset_board(Math.ceil((pxmax-board_info.px0)/this.cell_width)+1, 
                          Math.ceil((pymax-board_info.py0)/this.cell_height)+1);
        var board_layout = board.layout;
        if (cr.plugins_.Rex_SLGSquareTx && 
           (board_layout instanceof cr.plugins_.Rex_SLGSquareTx.prototype.Instance))
        {
            board_layout.is_isometric = false;
            board_layout.PositionOX = board_info.px0;
            board_layout.PositionOY = board_info.py0;
        }
        else
            alert("[Layout to Board] only support square borad, please add a SquareTx plugin into project.");
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
        var board = board_objs.getFirstPicked();        
        if (!(board.uid in this.boards))
            this.boards[board.uid] = {px0:null, py0:null};        
        if (lz==0)
            this.board_setup(board, instances);
        var i, cnt=instances.length, chess; 
        var lx, ly;       
        var board_info = this.boards[board.uid];               
        for (i=0; i<cnt; i++)
        {
            chess = instances[i];
            lx = Math.ceil((chess.x - board_info.px0)/this.cell_width);
            ly = Math.ceil((chess.y - board_info.py0)/this.cell_height);
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