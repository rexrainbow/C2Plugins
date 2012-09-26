// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Matcher = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Matcher.prototype;
		
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
        this.board = null; 
        this._dir = null;
        this.group = null;    
	    this.exp_TileUID =0;	
	    this.exp_TileX =0;	        
	    this.exp_TileY =0;
        this._group_name = ""; 
        this._symbol_value = "";        	    	    
        this._symbol_cache = {}; 
        this._tiles_groups = [];
        this._has_matched_pattern = false;
        
        this._pattern_axis = this.properties[0];    
	};
    
    instanceProto._clean_symbol_cache = function ()
    {
        var x,y,z,_entry,_cell;
        for (x in this._symbol_cache)
        {
            _entry = this._symbol_cache[x];
            for (y in _entry)
            {
                _cell = _entry[y];
                for (z in _cell)
                {
                    delete _cell[z];
                }
                delete _entry[y];
            }
            delete this._symbol_cache[x];
        }
    };    
    
    instanceProto._fill_symbol_cache = function (_x,_y)
    {
        var tile_uid = this.board.xyz2uid(_x,_y,0);
        if (tile_uid == null)
            return;
	    this.exp_TileUID = tile_uid;
	    this.exp_TileX=_x;
	    this.exp_TileY=_y;
	    this._symbol_value = "";
	    this.runtime.trigger(cr.plugins_.Rex_Matcher.prototype.cnds.OnGetSymbol, this);
        if (this._symbol_cache[_x] == null)
            this._symbol_cache[_x] = {};
        this._symbol_cache[_x][_y] = {symbol:this._symbol_value, 
                                      uid:tile_uid};
    };    
	instanceProto._symbol_at = function(x,y)
	{
	    var s = this._symbol_cache[x];
	    return (s==null)? s:s[y];
	};
	instanceProto._get_match_tiles = function(group_name,is_2d_pattern)
	{
        this._group_name = group_name;
        this._clean_symbol_cache();
        var x,y,uid;
        var x_max= this.board.x_max;
        var y_max= this.board.y_max;
        for (y=0; y<=y_max; y++)
        {
            for (x=0; x<=x_max; x++)
                this._fill_symbol_cache(x,y);
        }
        this._has_matched_pattern = false;
        var trg = (!is_2d_pattern)? cr.plugins_.Rex_Matcher.prototype.cnds.OnMatchPattern:
                                    cr.plugins_.Rex_Matcher.prototype.cnds.OnMatchPattern2D;        
        this.runtime.trigger(trg, this);
        if (!this._has_matched_pattern)
            this.runtime.trigger(cr.plugins_.Rex_Matcher.prototype.cnds.OnNoMatchPattern, this);
	};
    
	instanceProto._pattern_search = function(pattern)
	{
        this._tiles_groups.length = 0;
        if (this._dir == null)
            this._dir = this.board.layout.GetDirCount();
        if (this._dir == 4)
            this._pattern_search_square(pattern);
        else if (this._dir == 6)
            this._pattern_search_hex(pattern);
        // filled this._tiles_groups
        return this._tiles_groups;
	};
	instanceProto._pattern_search_square = function(pattern)
	{	    
	    var x,y,i,c,s,is_matched,matched_tiles=[];
	    var pattern_length=pattern.length;
	    var x_max=this.board.x_max;
	    var y_max=this.board.y_max;
	    if ((this._pattern_axis==0) || (this._pattern_axis==1))  // Horizontal
	    {	        
	        for(y=0;y<=y_max;y++)
	        {
	            for(x=0;x<=x_max;x++)
	            {
	                if ((x_max-x+1) < pattern_length)
	                    break;
	                
	                is_matched = true;
	                matched_tiles.length=0;
	                for(i=0;i<pattern_length;i++)
	                {
	                    s = this._symbol_at(x+i,y);
	                    if (s==null)
	                    {
	                        is_matched = false;
	                        break;
	                    }
	                    c = pattern.charAt(i);
	                    if (s.symbol!=c)
	                    {
	                        is_matched = false;
	                        break;
	                    }
                        matched_tiles.push(s);
	                }
	                if (is_matched)                
	                    this._tiles_groups.push(matched2uid(matched_tiles));   
	            }
	        }
	    }
	    if ((this._pattern_axis==0) || (this._pattern_axis==2))  // Vertical
	    {
	        for(x=0;x<=x_max;x++)
	        {
	            for(y=0;y<=y_max;y++)
	            {
	                if ((y_max-y+1) < pattern_length)
	                    break;
	                
	                is_matched = true;
	                matched_tiles.length=0;
	                for(i=0;i<pattern_length;i++)
	                {
	                    s = this._symbol_at(x,y+i);
	                    if (s==null)
	                    {
	                        is_matched = false;
	                        break;
	                    }
	                    c = pattern.charAt(i);
	                    if (s.symbol!=c)
	                    {
	                        is_matched = false;
	                        break;
	                    }
                        matched_tiles.push(s);
	                }
	                if (is_matched)                
	                    this._tiles_groups.push(matched2uid(matched_tiles));                
	            }
	        }	        
	    }
	};
	instanceProto._pattern_search_hex = function(pattern)
	{	  
        var dir,x,y,i,c,s,is_matched,matched_tiles=[];
	    var pattern_length=pattern.length;        
	    var x_max=this.board.x_max;
	    var y_max=this.board.y_max;       
        var get_neighbor_x = this.board.layout.GetNeighborLX;
        var get_neighbor_y = this.board.layout.GetNeighborLY;
        var cur_x,cur_y,next_x,next_y;
        for(dir=0;dir<3;dir++)  // dir = 0,1,2
        {
	        for(x=0;x<=x_max;x++)
	        {
	            for(y=0;y<=y_max;y++)
	            {
	                is_matched = true;
	                matched_tiles.length=0;
	                cur_x = x;
	                cur_y = y;
	                for(i=0;i<pattern_length;i++)
	                {	                                        
	                    s = this._symbol_at(cur_x,cur_y);
	                    if (s==null)
	                    {
	                        is_matched = false;
	                        break;
	                    }
	                    c = pattern.charAt(i);
	                    if (s.symbol!=c)
	                    {
	                        is_matched = false;
	                        break;
	                    }
                        matched_tiles.push(s);                        
                        next_x = get_neighbor_x(cur_x,cur_y,dir);
	                    next_y = get_neighbor_y(cur_x,cur_y,dir);
	                    cur_x = next_x;
	                    cur_y = next_y;
	                }
	                if (is_matched)
	                    this._tiles_groups.push(matched2uid(matched_tiles));                 
	            }
	        }
        }        
	};
	
	instanceProto._pattern_search_2d = function(pattern)
	{
        pattern = csv2array(pattern);
        this._tiles_groups.length = 0;
        var x,y,i,j,c,s,is_matched,matched_tiles=[];
	    var x_max=this.board.x_max;
	    var y_max=this.board.y_max;
        var pattern_row=pattern.length,pattern_col;
	    for(y=0;y<=y_max;y++)
	    {
	        for(x=0;x<=x_max;x++)
	        {
	            is_matched = true;
	            matched_tiles.length=0;

	            for(i=0;i<pattern_row;i++)
	            {
	                pattern_col = pattern[i].length;
	                for(j=0;j<pattern_col;j++)
	                {
	                    s = this._symbol_at(x+j,y+i);
	                    if (s==null)
	                    {
	                        is_matched = false;
	                        break;
	                    }	                   
	                    c = pattern[i][j];
	                    if (c=="")
	                    {
	                        continue;
	                    }
	                    else if (s.symbol!=c)
	                    {
	                        is_matched = false;
	                        break;
	                    }   
	                    matched_tiles.push(s);
	                }
	                if (!is_matched)
	                    break;
	            }
	            
	            if (is_matched)                
	                this._tiles_groups.push(matched2uid(matched_tiles));   
	        }
	    }      
        return this._tiles_groups;
	};
	
	instanceProto._on_match_pattern = function (tiles_groups)
	{       
        var i,cnt=tiles_groups.length;
        var runtime = this.runtime;
        var current_event = runtime.getCurrentEventStack().current_event;
        var _group=this.group.GetGroup(this._group_name)
        for (i=0;i<cnt;i++)
        {              
            _group.SetByUIDList(tiles_groups[i]);            
            runtime.pushCopySol(current_event.solModifiers);
            current_event.retrigger();
            runtime.popSol(current_event.solModifiers);        
        }
        this._has_matched_pattern |= (cnt>0);
	};	
	
	var matched2uid = function(matched_tiles)
	{
	    var cnt=matched_tiles.length;
	    var matched_uid=[];
	    var i;  	    
	    for(i=0;i<cnt;i++)
	    {
	        matched_tiles[i].dirty = true;
	        matched_uid.push(matched_tiles[i].uid);
	    }
	    return matched_uid;
	};	
	
	var csv2array = function(csv_string)
	{
        var arr = csv_string.split("\n");
        var i,arr_cnt=arr.length;
        for (i=0;i<arr_cnt;i++)
            arr[i]=arr[i].split(",");	
        return arr;    
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnGetSymbol = function ()
	{
        return true;
	};
	
	Cnds.prototype.OnMatchPattern = function (pattern)
	{       
        var tiles_groups = this._pattern_search(pattern);	    
        this._on_match_pattern(tiles_groups);
        return false;
	};
	
	Cnds.prototype.OnNoMatchPattern = function ()
	{
        return true;
	};
	
	Cnds.prototype.OnMatchPattern2D = function (pattern)
	{       
        var tiles_groups = this._pattern_search_2d(pattern);	    
        this._on_match_pattern(tiles_groups);
        return false;
	};		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Setup = function (board_objs, group_objs)
	{
        var board = board_objs.instances[0];
        if (board.check_name == "BOARD")
            this.board = board;
        else
            alert ("Matcher should connect to a board object");
            
        var group = group_objs.instances[0];
        if (group.check_name == "INSTGROUP")
            this.group = group;        
        else
            alert ("Matcher should connect to a instance group object");            
	};  
	Acts.prototype.GetMatchTiles = function (group_name)	
	{
        assert2(this.board, "Matcher should connect to a board object");
        this._get_match_tiles(group_name,false);
	};
    Acts.prototype.SetSymbol = function (symbol_value)
	{
        this._symbol_value = symbol_value;
	};
	Acts.prototype.GetMatchTiles2D = function (group_name)	
	{
        assert2(this.board, "Matcher should connect to a board object");
        this._get_match_tiles(group_name,true);
	};	     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
    Exps.prototype.TileUID = function (ret)
    {
        ret.set_int(this.exp_TileUID);
    };
	
    Exps.prototype.TileX = function (ret)
    {
        ret.set_int(this.exp_TileX);
    };
    	
    Exps.prototype.TileY = function (ret)
    {
        ret.set_int(this.exp_TileY);
    };
}());