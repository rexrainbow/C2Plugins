// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ChessBank = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ChessBank.prototype;
		
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
        this.bank = null;
        this.saved_board = {save_type:-1,
                            board:[],
                            x_max:0,
                            y_max:0,
                            chess_cnt:0;
                            };		
        this._target_inst = null;
        this._info = {};
	};
	instanceProto.reset_board_array = function(x_max, y_max, board_array_in, save_type)
	{
        this.saved_board.save_type = save_type;
        this.saved_board.x_max = x_max;
        this.saved_board.y_max = y_max;
        var board_array = this.saved_board.board;
		board_array.length = x_max;
		var x, y, z, item, zhash, chess_cnt=0;
		for (x=0;x<=x_max;x++)
		{
		    board_array[x] = [];
		    board_array[x].length = y_max;
		    for(y=0;y<=y_max;y++)
            {
		        board_array[x][y] = {};
                
                if ((save_type == 0) || (save_type == 2))
                {
                    item = board_array_in[x][y][0];
                    if (item != null)
                    {
                        board_array[x][y][0] = item;
                        chess_cnt += 1;
                    }
                }
                if ((save_type == 1) || (save_type == 2))
                {
                    zhash = board_array_in[x][y];
                    for (z in zhash)
                    {
                        if (z == 0)
                            continue;
                        board_array[x][y][z] = zhash[z];
                        chess_cnt += 1;
                    }                    
                }
            }
		}
        this.saved_board.chess_cnt = chess_cnt;
	};
	
    instanceProto.instbank_get = function()
    {     
        if (this.bank != null)
            return;
        assert2(cr.plugins_.Rex_InstanceBank, "Chess bank: please put a instance bank object into project");
        this.bank = new cr.plugins_.Rex_InstanceBank.InstBankKlass(this);   
    }; 		
	// handlers
    instanceProto.OnSaving = function(inst, ret_info)
    {     
        this._target_inst = inst;
        this._info = ret_info;
        this.runtime.trigger(cr.plugins_.Rex_ChessBank.prototype.cnds.OnSave, this);
    }; 	
    instanceProto.OnLoading = function(inst, info)
    {
        this._target_inst = inst;
        this._info = info;    
        this.runtime.trigger(cr.plugins_.Rex_ChessBank.prototype.cnds.OnLoad, this);
    }; 

    instanceProto._save_chess = function(board, save_type)
    {
        var x_max=board.x_max, y_max=board.y_max, board_array=this.saved_board.board;
        var x,y,z,zhash, uid;
        this.reset_board_array(x_max, y_max, board.board, save_type);		
        // save tiles	
	    if ((save_type == 0) || (save_type == 2))
		{
		    for (y=0; y<=y_max; y++)
			{
			    for (x=0; x<=x_max; x++)
				{
				    uid = board_array[x][y][0];
					if (uid == null)
					    continue;
					bank.SaveInstance(board.uid2inst(uid));
				}
			}
		}
		// save chess
		if ((save_type == 1) || (save_type == 2))
		{
		    for (y=0; y<=y_max; y++)
			{
			    for (x=0; x<=x_max; x++)
				{
				    zhash = board_array[x][y];
				    for (z in zhash)
					{
					    if (z == 0)
						    continue;
				        uid = board_array[x][y][z];
					    if (uid == null)
					        continue;
					    bank.SaveInstance(board.uid2inst(uid));
					}
				}
			}		
		}		
    };     
    instanceProto._load_chess = function(board)
    {     
        var save_type=this.saved_board.save_type;
        var x_max=this.saved_board.x_max;
        var y_max=this.saved_board.y_max;
        var board_array=this.saved_board.board;
        var x,y,z,zhash, uid;		
        // save tiles
	    if ((save_type == 0) || (save_type == 2))
		{
		    for (y=0; y<=y_max; y++)
			{
			    for (x=0; x<=x_max; x++)
				{
				    uid = board_array[x][y][0];
					if (uid == null)
					    continue;
                    bank.CreateInstance(bank.UID2SaveObj(uid));
				}
			}
		}
		// save chess
		if ((save_type == 1) || (save_type == 2))
		{
		    for (y=0; y<=y_max; y++)
			{
			    for (x=0; x<=x_max; x++)
				{
				    zhash = board_array[x][y];
				    for (z in zhash)
					{
					    if (z == 0)
						    continue;
				        uid = board_array[x][y][z];
					    if (uid == null)
					        continue;
					    bank.CreateInstance(bank.UID2SaveObj(uid));
					}
				}
			}		
		}	
    };  
    instanceProto._to_string = function()
    {     
        return JSON.stringify({"board":this.board_array,
		                       "bank:":this.bank.ContentGet()
                               });
    };  
    instanceProto._string2bank = function(JSON_string)
    {     
        var o = JSON.parse(JSON_string);       
		this.bank.ContentSet(o["bank"]);        
        var board = o["board"];
        this.reset_board_array(board.x_max, board.y_max, board.board, board.save_type);
    };  
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnSave = function (obj_type)
	{
		if (!obj_type)
			return;    
	    return this.bank.SOLPickOne(obj_type, this._target_inst);
	};
    
	Cnds.prototype.OnLoad = function (obj_type)
	{
		if (!obj_type)
			return;      
		return this.bank.SOLPickOne(obj_type, this._target_inst);
	}; 
     
	Cnds.prototype.PickBySavedUID = function (obj_type, saved_uid)
	{
		if (!obj_type)
			return;      
		return this.bank.SOLPickBySavedUID(obj_type, saved_uid);
	};  
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.CleanBank = function ()
	{
	    this.instbank_get();
	};
    
    Acts.prototype.SaveInstances = function (board_obj, save_type)
	{
        this.instbank_get();	    
		if (!board_obj)
			return;   
        var board = board_obj.instances[0];	
        this._save_chess(board, save_type);
	};

    Acts.prototype.LoadInstances = function (board_obj)
	{  
        this.instbank_get();
		if (!board_obj)
			return;   
	    var board = board_obj.instances[0];	
        this.bank.LoadAllInstances(this._load_chess,
                                   this,
                                   [board]);
	};

    Acts.prototype.StringToBank = function (JSON_string)
	{  
        this.instbank_get();
		this._string2bank(JSON_string);
	};  

    Acts.prototype.SaveInfo = function (index, value)
	{  
        this.instbank_get();	    
        this._info[index] = value;
	};
    
	Acts.prototype.PickBySavedUID = function (obj_type, saved_uid)
	{
        this.instbank_get();	    
		if (!obj_type)
			return;      
		this.bank.SOLPickBySavedUID(obj_type, saved_uid);
	};  
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.BankToString = function (ret)
	{
        this.instbank_get();	    
        var json_string = this._to_string();
		ret.set_string(json_string);
	}; 

    Exps.prototype.SavedInfo = function (ret, index, default_value)
	{
        this.instbank_get();	    
        var val = this.bank._info[index];
        if (val == null)
            val = default_value;
	    ret.set_any(val);
	};     
}());