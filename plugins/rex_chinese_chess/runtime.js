// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ChineseChess = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ChineseChess.prototype;
		
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
	    this.exp_SelectedUID =0;
	    this.exp_ToX = 0;
	    this.exp_ToY = 0;
        this.board = new cr.plugins_.Rex_ChineseChess.BoardKlass(this);
	};
	
	instanceProto._create_new_game = function(black_uids, red_uids, is_red_first)
	{
        this.board.new_game(black_uids, red_uids, is_red_first);
	};
	
	instanceProto._move_chess = function(chess_uid, toX, toY)
	{
        this.board.move_chess(chess_uid, toX, toY);
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();        
	
	Cnds.prototype.CBPutChess = function ()
	{
		return true;
	};
	
	Cnds.prototype.CBMoveChess = function ()
	{
		return true;
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.NewGame = function (black_side_uids, red_side_uids, is_red_first)
	{
	    this._create_new_game(JSON.parse('[' + black_side_uids + ']'),
	                          JSON.parse('[' + red_side_uids + ']'), is_red_first);
	}; 	

	Acts.prototype.CmdMoveChess = function (chess_uid, toX, toY)
	{
	    this._create_new_game(JSON.parse('[' + black_side_uids + ']'),
	                          JSON.parse('[' + red_side_uids + ']'), is_red_first)
	}; 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.SelectedUID = function (ret)
	{
		ret.set_int(this.exp_SelectedUID);
	};
	
	Exps.prototype.SelectedX = function (ret, uid)
	{
	    var chess = this.board.uid2chess(uid);
	    var x = (chess==null)? (-1):chess.x;
		ret.set_int(x);
	};	
	
	Exps.prototype.SelectedY = function (ret, uid)
	{
	    var chess = this.board.uid2chess(uid);
	    var y = (chess==null)? (-1):chess.y;
		ret.set_int(y);
	};		
	
	Exps.prototype.SelectedName = function (ret, uid)
	{
	    var chess = this.board.uid2chess(uid);
	    var name = (chess==null)? "":chess.name;
		ret.set_string(name);
	};	
	
	Exps.prototype.SelectedPlayerID = function (ret, uid)
	{
	    var chess = this.board.uid2chess(uid);
	    var player_id = (chess==null)? (-1):chess.player_id;
		ret.set_string(player_id);
	};	
			
	Exps.prototype.ToX = function (ret)
	{
		ret.set_int(this.exp_ToX);
	};	
	
	Exps.prototype.ToY = function (ret)
	{
		ret.set_int(this.exp_ToY);
	};	
}());

(function ()
{
    // for injecting javascript
    cr.plugins_.Rex_ChineseChess.ChessKlass = function(board, player_id, name, uid, x, y)
    {
        this.board = board;
        this.player_id = player_id;
        this.name = name;
        this.uid = uid;
        this.x = x;
        this.y = y;
    };
    
    var ChessKlassProto = cr.plugins_.Rex_ChineseChess.ChessKlass.prototype;

    ChessKlassProto.IsAtPalace = function(_x, _y)
    {   
        var x = (_y==null)? this.x:_x;
        var y = (_y==null)? this.y:_y;        
        return (player_id==0)? ((x>=3) && (x<=5) && (y>=0) && (y<=2)):
                               ((x>=3) && (x<=5) && (y>=7) && (y<=9));
    };
        
    ChessKlassProto.IsBeforeRiver = function(y)
    {       
        var x = (_y==null)? this.x:_x;
        var y = (_y==null)? this.y:_y;         
        return (player_id==0)? (y<4)):(y>5));
    };
    
    
    ChessKlassProto.CanKingMove = function(dx, dy)
    { 
        var can_move;
        can_move = (Math.abs(dx)==1) || (Math.abs(dy)==1);
        if (!can_move)
            return false;  
                    
        return this.IsAtPalace(dx+this.x, dy+this.y);
    };
    
    ChessKlassProto.CanAssistantMove = function(dx, dy)
    {
        var can_move;
        can_move = (Math.abs(dx)==1) || (Math.abs(dy)==1);
        if (!can_move)
            return false;   
                 
        return this.IsAtPalace(dx+this.x, dy+this.y);
    };
    
    ChessKlassProto.CanElephantMove = function(dx, dy)
    {
        var can_move;
        can_move = (Math.abs(dx)==2) || (Math.abs(dy)==2);
        if (!can_move)
            return false;
            
        var toX = dx+this.x;
        var toY = dy+this.y;
        var chess = this.board.xy2chess((toX+this.x)/2, (toY+this.y)/2);
        if (chess != null)
            return false;
                    
        return IsBeforeRiver(toY);
    };    
    
    ChessKlassProto.CanHorseMove = function(dx, dy)
    {      
        if ((Math.abs(dx)==1) && (Math.abs(dy)==2))
            return (this.board.xy2chess(this.x, this.y+(dy/2))==null);
        else if ((Math.abs(dx)==2) && (Math.abs(dy)==1))
            return (this.board.xy2chess(this.x+(dx/2), this.y)==null);
        else             
            return false;
    }; 
    
    ChessKlassProto.CanRookMove = function(dx, dy)
    {               
        if ((dx!=0) && (dy==0))
        {
            var x;                
            var start_x = (this.x<dx)? this.x:dx;
            var end_x = (this.x>dx)? this.x:dx;
            for (x=start_x+1; x<end_x; x++)
            {
                if (this.board.xy2chess(x,this.y) !== null)
                    return false;
            }
            return true;
        }
        else if ((dx==0) && (dy!=0))
        {
            var y;                
            var start_y = (this.y<dy)? this.y:dy;
            var end_y = (this.y>dy)? this.y:dy;
            for (y=start_y+1; y<end_y; y++)
            {
                if (this.board.xy2chess(this.x,y) !== null)
                    return false;
            }
            return true;
        }
        return false;
    };
    
    ChessKlassProto.CanCannonMove = function(dx, dy)
    {
    };    
    
    ChessKlassProto.CanPawnMove = function(dx, dy)
    {  
        var can_move;
        if (this.player_id==0)
        {
            if (this.IsBeforeRiver())
                can_move = (dx==0) && (dy==1);
            else
                can_move = ((Math.abs(dx)==1) && dy==0) || ((dx==0) && (dy==1));
        }
        else
        {
            if (this.IsBeforeRiver())
                can_move = (dx==0) && (dy==(-1));
            else
                can_move = ((Math.abs(dx)==1) && dy==0) || ((dx==0) && (dy==(-1)));
        }
        return can_move;
    };  
    
    ChessKlassProto.CanMoveMap = {"將":CanKingMove,"士":CanAssistantMove,"象":CanElephantMove,
                                  "車":CanRookMove,"馬":CanHorseMove,"砲":CanCannonMove,"卒":CanPawnMove};
            
    cr.plugins_.Rex_ChineseChess.BoardKlass = function(plugin)
    {
        this.plugin = plugin;
        this.board=[];
        this.chesses = {};
        this.empty_board(9,10);
    };    
    
    var ChessKlassProto = cr.plugins_.Rex_ChineseChess.BoardKlass.prototype;  
     
    ChessKlassProto.empty_board = function(x_num, y_num)
    {
        var x, y;
        this.board.length = y_num
        for(y=0; y<y_num; y++)
        {
            this.board[y] = [];
            this.board[y].length = x_num;
            for (x=0; x<x_num; x++)
            {
                this.board[y][x] = null;
            }
        }
        this.x_max = x_num-1;
        this.y_max = y_num-1;
        this.chesses = {};
        this.token = 1;    // red first
    };  
    ChessKlassProto.add_chese = function(player_id, name, uid, x, y)
    {
        var chess = new cr.plugins_.Rex_ChineseChess.ChessKlass(this, player_id, name, uid, x, y);
        this.board[y][x] = chess;
        this.chesses[uid] = chess;
        
        plugin = this.plugin;
        plugin.exp_SelectedUID = uid;
        plugin.runtime.trigger(cr.plugins_.Rex_ChineseChess.prototype.cnds.CBPutChess, plugin);
    };
    ChessKlassProto.new_game = function(black_uids, red_uids, is_red_first)
    {
        this.add_chese(0,"將",black_uids[0],4,0);
        this.add_chese(0,"士",black_uids[1],3,0);
        this.add_chese(0,"士",black_uids[2],5,0); 
        this.add_chese(0,"象",black_uids[3],2,0);
        this.add_chese(0,"象",black_uids[4],6,0);
        this.add_chese(0,"車",black_uids[5],0,0);
        this.add_chese(0,"車",black_uids[6],8,0); 
        this.add_chese(0,"馬",black_uids[7],1,0);
        this.add_chese(0,"馬",black_uids[8],7,0);
        this.add_chese(0,"砲",black_uids[9],1,2);
        this.add_chese(0,"砲",black_uids[10],7,2);  
        this.add_chese(0,"卒",black_uids[11],0,3);
        this.add_chese(0,"卒",black_uids[12],2,3); 
        this.add_chese(0,"卒",black_uids[13],4,3);
        this.add_chese(0,"卒",black_uids[14],6,3); 
        this.add_chese(0,"卒",black_uids[15],8,3);  
        
        this.add_chese(1,"將",red_uids[0],4,9);
        this.add_chese(1,"士",red_uids[1],3,9);
        this.add_chese(1,"士",red_uids[2],5,9); 
        this.add_chese(1,"象",red_uids[3],2,9);
        this.add_chese(1,"象",red_uids[4],6,9);
        this.add_chese(1,"車",red_uids[5],0,9);
        this.add_chese(1,"車",red_uids[6],8,9); 
        this.add_chese(1,"馬",red_uids[7],1,9);
        this.add_chese(1,"馬",red_uids[8],7,9);
        this.add_chese(1,"砲",red_uids[9],1,7);
        this.add_chese(1,"砲",red_uids[10],7,7);  
        this.add_chese(1,"卒",red_uids[11],0,6);
        this.add_chese(1,"卒",red_uids[12],2,6); 
        this.add_chese(1,"卒",red_uids[13],4,6);
        this.add_chese(1,"卒",red_uids[14],6,6); 
        this.add_chese(1,"卒",red_uids[15],8,6);                                
        
        this.token = (is_red_first)? 1:0;
    };
    ChessKlassProto.uid2chess = function(chess_uid)
    {
        return this.chesses[chess_uid];
    };
    ChessKlassProto.xy2chess = function(x,y)
    {
        return this.board[y][x];
    };
    
    ChessKlassProto.move_chess = function(chess_uid, toX, toY)
    {
        if ((toX<0) || (toX>this.x_max) || (toY<0) || (toY>this.y_max))
            return;
            
        var chess = this.uid2chess(chess_uid);
        if (chess == null)
            return;
        
        var target_pos_chess = this.xy2chess(toX, toY);
        if ( (target_pos_chess != null) && 
             (target_pos_chess.player_id == chess.player_id))
            return;
        
        var dx = toX - chess.x;
        var dy = toY - chess.y;
        if (chess.CanMoveMap[chess.name](dx, dy))
        {
            this.x += dx;
            this.y += dy;
        }
    }; 
    
}());