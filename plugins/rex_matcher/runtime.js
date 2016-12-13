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
	    this.is_autoUpdate_symbolCache = (this.properties[3] == 1);
        this.board = null; 
        this.boardUid = -1;    // for loading 
        this._dir = null;
        this.group = null;
        this.groupUid = -1;    // for loading     
	    this.exp_TileUID =0;	
	    this.exp_TileX =0;	        
	    this.exp_TileY =0;
        this.exp_MatchedSymbol = null;
        this._group_name = ""; 
        this._symbol_value = "";        	    	    
        this._symbol_cache = {}; 
        this._tiles_groups = [];
        this._matched_axis = null;        
        this._has_matched_pattern = false;
		this._last_tick = null;
        
        this._square_modes = [(this.properties[0] == 1),  // horizontal
                              (this.properties[1] == 1),  // vertical
                              (this.properties[2] == 1),  // isometric-0
                              (this.properties[2] == 1),  // isometric-1
                              ];  
        
		this.wildcard_symbol = this.properties[4];		
	};
	
	instanceProto.onDestroy = function ()
	{
		this._clean_symbol_cache();
	};
		
	instanceProto.GetBoard = function()
	{
        if (this.board != null)
            return this.board;
            
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            
            if (cr.plugins_.Rex_SLGBoard && (inst instanceof cr.plugins_.Rex_SLGBoard.prototype.Instance))
            {
                this.board = inst;
                return this.board;
            }            
        }
        assert2(this.board, "Matcher plugin: Can not find board oject.");
        return null;
	};
	
	instanceProto.GetInstGroup = function()
	{
        if (this.group != null)
            return this.group;
            
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            
            if (cr.plugins_.Rex_gInstGroup && (inst instanceof cr.plugins_.Rex_gInstGroup.prototype.Instance))
            {
                this.group = inst;
                return this.group;
            }            
        }
        assert2(this.group, "Matcher plugin: Can not find instance group oject.");
        return null;
	};	

	var _get_uid = function(objs)
	{
        var uid;
	    if (objs == null)
	        uid = null;
	    else if (typeof(objs) === "object")
	    {
	        var inst = objs.getFirstPicked();
	        uid = (inst!=null)? inst.uid:null;
	    }
	    else
	        uid = objs;
            
        return uid;
	};
	    
    // symbol cache
    var ObjCacheKlass = function ()
    {        
        this.lines = [];       
    };
    var ObjCacheKlassProto = ObjCacheKlass.prototype;       
	ObjCacheKlassProto.allocLine = function()
	{
		return (this.lines.length > 0)? this.lines.pop(): null;
	};
	ObjCacheKlassProto.freeLine = function (l)
	{
		this.lines.push(l);
	};	
    var nodeCache = new ObjCacheKlass();
    
    instanceProto._clean_symbol_cache = function ()
    {
        var x,y,entry;
        for (x in this._symbol_cache)
        {
            entry = this._symbol_cache[x];
            for (y in entry)
            {
                nodeCache.freeLine(entry[y]);
            }
        }
        this._symbol_cache = {};
    };    
    
    instanceProto.write_symbol_cache = function (x,y, is_update_all)
    {
        var tile_uid = this.GetBoard().xyz2uid(x,y,0);
        if (tile_uid == null)
            return;
	    this.exp_TileUID = tile_uid;
	    this.exp_TileX=x;
	    this.exp_TileY=y;
	    this._symbol_value = "";
	    this.runtime.trigger(cr.plugins_.Rex_Matcher.prototype.cnds.OnGetSymbol, this);
	    
	    // index x	    
        if (this._symbol_cache[x] == null)
            this._symbol_cache[x] = {};
        // index y
        var entry = this._symbol_cache[x];
        if (entry[y] == null)
        {
            var cell = nodeCache.allocLine();
            if (cell == null)
                cell = {};
            entry[y] = cell;
        }        
        var cell = entry[y];
        // write
        cell.symbol = this._symbol_value;
        cell.uid = tile_uid;
        
        if (is_update_all)
            this._last_tick = this.runtime.tickcount;
        
        return this._symbol_value;;
    };    
	instanceProto._symbol_at = function(x,y)
	{
	    var s = this._symbol_cache[x];
	    return (s==null)? s:s[y];
	};
	instanceProto._is_valid_symbol = function(s)
	{
	    if (s)
		    return (s.symbol !== "");
        else
		    return false;	    
	};	
	instanceProto._is_wildcard_symbol = function(s)
	{
	    if (s && (this.wildcard_symbol !== ""))
		{
		    return (s.symbol === this.wildcard_symbol);
	    }
        else
		    return false;  
	};	
	instanceProto.refilled_symbol_array = function()
	{
        this._clean_symbol_cache();
        var x,y,uid;
        var board = this.GetBoard();
        var x_max= board.x_max;
        var y_max= board.y_max;
        for (y=0; y<=y_max; y++)
        {
            for (x=0; x<=x_max; x++)
                this.write_symbol_cache(x,y, true);
        }
	};	
	// ----
	
	instanceProto.get_match_tiles = function(group_name,pattern_dimation)
	{
        this._group_name = group_name;
	    if (this.is_updateCache())
		    this.refilled_symbol_array();	
        this._has_matched_pattern = false;
        
        if (pattern_dimation == 1)
            this.runtime.trigger(cr.plugins_.Rex_Matcher.prototype.cnds.OnMatchPattern, this);
        else if (pattern_dimation == 2)
        {
            this.runtime.trigger(cr.plugins_.Rex_Matcher.prototype.cnds.OnMatchTemplatePattern2D, this);
            this.runtime.trigger(cr.plugins_.Rex_Matcher.prototype.cnds.OnMatchPattern2D, this);
        }
        if (!this._has_matched_pattern)
            this.runtime.trigger(cr.plugins_.Rex_Matcher.prototype.cnds.OnNoMatchPattern, this);
	};
    
	instanceProto.pattern_search = function(pattern, is_any_pattern_mode)
	{
        this._tiles_groups.length = 0;
        if (this._dir == null)
            this._dir = this.GetBoard().GetLayout().GetDirCount();
        if ((this._dir == 4) || (this._dir == 8))
            this.pattern_search_square(pattern, is_any_pattern_mode);
        else if (this._dir == 6)
            this.pattern_search_hex(pattern, is_any_pattern_mode);
        // filled this._tiles_groups
        return this._tiles_groups;
	};
    
    var pattern_splitting = function (pattern)
    {
        var s = (pattern.indexOf(",") != null)? ",": "";
        return pattern.split(s);        
    }
	instanceProto.pattern_search_square = function(pattern, is_any_pattern_mode)
	{
        var is_matchN_mode = (typeof(pattern) == "number"); 
        if (!is_matchN_mode)        
            pattern = pattern_splitting(pattern);         
            
	    var x,y,i,s,is_matched,matched_tiles=[];
	    var pattern_length=(is_matchN_mode)? pattern:pattern.length;
	    var board = this.GetBoard();
	    var x_max=board.x_max;
	    var y_max=board.y_max;
        var cur_x,cur_y,next_x,next_y;		
	    var m, mode_cnt=this._square_modes.length;
		var is_wildcard;
	    for (m=0; m<mode_cnt; m++)
	    {
	        if (!this._square_modes[m])
	            continue;
	            
	        for(y=0;y<=y_max;y++)
	        {
	            for(x=0;x<=x_max;x++)
	            {
	                is_matched = true;
	                matched_tiles.length=0;
                    if (is_matchN_mode)
                        pattern = null;
	                cur_x = x;
	                cur_y = y;									
	                for(i=0;i<pattern_length;i++)
	                {	                                        
	                    s = this._symbol_at(cur_x,cur_y);
	                    if (!this._is_valid_symbol(s))
	                    {
	                        is_matched = false;
	                        break;
	                    }
						
						is_wildcard = this._is_wildcard_symbol(s);
						
						// matchN
						if ((!is_wildcard) && is_matchN_mode && (pattern === null))
                        {
                            pattern = [];
                            for (var r=0; r<pattern_length; r++)
                                pattern.push(s.symbol);   

                            this.exp_MatchedSymbol = s.symbol;                                       
                        }
						
						// symbol not matched
						if ((!is_wildcard) && (s.symbol != pattern[i]))
	                    {
	                        is_matched = false;
	                        break;
	                    }
                        matched_tiles.push(s);   
						
	                    switch (m)
	                    {
						case 0:    // horizontal
                            next_x = board.GetNeighborLX(cur_x,cur_y,0);
	                        next_y = board.GetNeighborLY(cur_x,cur_y,0);
							break;
						case 1:    // vertical
                            next_x = board.GetNeighborLX(cur_x,cur_y,1);
	                        next_y = board.GetNeighborLY(cur_x,cur_y,1);
							break;
						case 2:    // isometric-0
                            next_x = board.GetNeighborLX(cur_x,cur_y,4);
	                        next_y = board.GetNeighborLY(cur_x,cur_y,4);
							break;
						case 3:    // isometric-1
                            next_x = board.GetNeighborLX(cur_x,cur_y,5);
	                        next_y = board.GetNeighborLY(cur_x,cur_y,5);
							break;
					    }
						
	                    cur_x = next_x;
	                    cur_y = next_y;
	                }					
	                if (is_matched)
					{
	                    this._tiles_groups.push({"uid":matched2uid(matched_tiles),
	                                             "dir":m}); 

						if (is_any_pattern_mode)
						    return;
				    }
	            }
	        }
	    }         	            
	};
	instanceProto.pattern_search_hex = function(pattern, is_any_pattern_mode)
	{	  
        var is_matchN_mode = (typeof(pattern) == "number"); 
        if (!is_matchN_mode)
            pattern = pattern_splitting(pattern); 
            
        var dir,x,y,i,s,is_matched,matched_tiles=[];
	    var pattern_length=(is_matchN_mode)? pattern:pattern.length;     
	    var board = this.GetBoard();
	    var x_max=board.x_max;
	    var y_max=board.y_max;       
        var cur_x,cur_y,next_x,next_y;
		var is_wildcard;
        for(dir=0;dir<3;dir++)  // dir = 0,1,2
        {
	        for(x=0;x<=x_max;x++)
	        {
	            for(y=0;y<=y_max;y++)
	            {
	                is_matched = true;
	                matched_tiles.length=0;
                    if (is_matchN_mode)
                        pattern = null;                    
	                cur_x = x;
	                cur_y = y;
	                for(i=0;i<pattern_length;i++)
	                {	                                        
	                    s = this._symbol_at(cur_x,cur_y);
	                    if (!this._is_valid_symbol(s))
	                    {
	                        is_matched = false;
	                        break;
	                    }
						
						is_wildcard = this._is_wildcard_symbol(s);
						
						// matchN
						if ((!is_wildcard) && is_matchN_mode && (pattern === null))
                        {
                            pattern = [];
                            for (var r=0; r<pattern_length; r++)
                                pattern.push(s.symbol);
                            
                            this.exp_MatchedSymbol = s.symbol;                            
                        }    

						// symbol not matched
						if ((!is_wildcard) && (s.symbol != pattern[i]))
	                    {
	                        is_matched = false;
	                        break;
	                    }
                        matched_tiles.push(s);                        
                        next_x = board.GetNeighborLX(cur_x,cur_y,dir);
	                    next_y = board.GetNeighborLY(cur_x,cur_y,dir);
	                    cur_x = next_x;
	                    cur_y = next_y;
	                }
	                if (is_matched)
					{
	                    this._tiles_groups.push({"uid":matched2uid(matched_tiles),
	                                             "dir":dir});                                                  
                        
						if (is_any_pattern_mode)
						    return;						
				    }
	            }
	        }
        }        
	};
	
	var _fill_2d_template_pattern = function (template_pattern, symbol)
	{
	    var i,icnt=template_pattern.length;
	    var j,jcnt;
	    for (i=0; i<icnt; i++)
	    {
	        jcnt = template_pattern[i].length;
	        for (j=0; j<jcnt; j++)
	        {
	            if (template_pattern[i][j] != "")
	                template_pattern[i][j] = symbol;
	        }
	    }
	};
	
	instanceProto.pattern_search_2d = function(pattern, is_template_mode, is_any_pattern_mode)
	{
        pattern = csv2array(pattern);
        this._tiles_groups.length = 0;
        var x,y,i,j,c,s,is_matched,matched_tiles=[];
        var board = this.GetBoard();
	    var x_max=board.x_max;
	    var y_max=board.y_max;
        var pattern_row=pattern.length,pattern_col;
        var is_template_pattern;
        var tlx, tly;
	    for(y=0;y<=y_max;y++)
	    {
	        for(x=0;x<=x_max;x++)
	        {
	            is_matched = true;
	            matched_tiles.length=0;
	            if (is_template_mode)
	                is_template_pattern = true;

	            for(i=0;i<pattern_row;i++)
	            {
	                pattern_col = pattern[i].length;
	                for(j=0;j<pattern_col;j++)
	                {
	                    // check pattern first
	                    c = pattern[i][j];
	                    if (c=="")
	                    {
	                        continue;
	                    }
	                    
	                    // then check symbol on board
	                    tlx = board.WrapLX(x+j);
	                    tly = board.WrapLY(y+i);
	                    s = this._symbol_at(tlx, tly);
	                    if (!this._is_valid_symbol(s))
	                    {
	                        is_matched = false;
	                        break;
	                    }	                    	                   

	                    else if (is_template_pattern)
	                    {
	                        _fill_2d_template_pattern(pattern, s.symbol);
	                        is_template_pattern = false;	      
                            this.exp_MatchedSymbol = s.symbol;                                       
	                    }
	                    else if (s.symbol != c)
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
                {				
	                this._tiles_groups.push({"uid":matched2uid(matched_tiles),
	                                         "dir":null});   
					if (is_any_pattern_mode)
					    return this._tiles_groups;	
			    }
	        }
	    }      
        return this._tiles_groups;
	};
	
	instanceProto.on_match_pattern = function (tiles_groups)
	{       
        var i,cnt=tiles_groups.length;
        var runtime = this.runtime;
        var current_frame = runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var _group=this.GetInstGroup().GetGroup(this._group_name);
		
        for (i=0;i<cnt;i++)
        {                
		    if (solModifierAfterCnds)
			{
                runtime.pushCopySol(current_event.solModifiers);
		    }
            
            _group.SetByUIDList(tiles_groups[i]["uid"]);
            this._matched_axis = tiles_groups[i]["dir"];                
            current_event.retrigger();
			
			if (solModifierAfterCnds)
			{
                runtime.popSol(current_event.solModifiers);        
		    }
        }
        
        this._matched_axis = null;  
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
	
	instanceProto.is_updateCache = function ()
	{       
	    return (this.is_autoUpdate_symbolCache && this.is_tick_changed())
	};	
	
	instanceProto.is_tick_changed = function ()
	{       
	    var cur_tick = this.runtime.tickcount;
		var tick_changed = (this._last_tick !== cur_tick);
        this._last_tick = cur_tick;
		return tick_changed;
	};
	
	instanceProto.saveToJSON = function ()
	{    
		return { "boarduid": (this.board != null)? this.board.uid:(-1),
		         "groupuid": (this.group != null)? this.group.uid:(-1),
		         "sm": this._square_modes};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.boardUid = o["boarduid"];
		this.groupUid = o["groupuid"];	
		this._square_modes = o["sm"];
		this._last_tick = null;  	 		      
	};
	
	instanceProto.afterLoad = function ()
	{
		if (this.boardUid === -1)
			this.board = null;
		else
		{
			this.board = this.runtime.getObjectByUID(this.boardUid);
			assert2(this.board, "Matcher: Failed to find board object by UID");
		}		
		this.boardUid = -1;
		
		if (this.groupUid === -1)
			this.group = null;
		else
		{
			this.group = this.runtime.getObjectByUID(this.groupUid);
			assert2(this.group, "Matcher: Failed to find instance group object by UID");
		}		
		this.groupUid = -1;						
	};	
    
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{	  
		propsections.push({
			"title": this.type.name,
			"properties": [{"name": "Board UID", "value": this.GetBoard().uid},	
			               {"name": "InstGroup UID", "value": this.GetInstGroup().uid},		               			               
			               ]
		});
	};
	/**END-PREVIEWONLY**/	    
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
        var tiles_groups = this.pattern_search(pattern, false);	    
        this.on_match_pattern(tiles_groups);
        return false;
	};
	
	Cnds.prototype.OnNoMatchPattern = function ()
	{
        return true;
	};
	
	Cnds.prototype.OnMatchPattern2D = function (pattern)
	{       
        var tiles_groups = this.pattern_search_2d(pattern, false, false);	    
        this.on_match_pattern(tiles_groups);
        return false;
	};
	
	Cnds.prototype.OnMatchTemplatePattern2D = function (pattern)
	{
        var tiles_groups = this.pattern_search_2d(pattern, true, false);	    
        this.on_match_pattern(tiles_groups);
        return false;
	};	
	
	Cnds.prototype.HasNoMatchPattern = function ()
	{
        return (!this._has_matched_pattern);
	};	
	// any
	Cnds.prototype.AnyMatchPattern = function (pattern, group_name)
	{
	    if (this.is_updateCache())
		    this.refilled_symbol_array();
	    var tiles_groups = this.pattern_search(pattern, true);
	    var has_any_matched = (tiles_groups.length != 0);
	    if (has_any_matched)
	    {
	        var group=this.GetInstGroup().GetGroup(group_name);
            group.SetByUIDList(tiles_groups[0]["uid"]);
            this._matched_axis = tiles_groups[0]["dir"];   	    
        }
        return has_any_matched;
	};	
	
	Cnds.prototype.AnyMatchPattern2D = function (pattern, group_name)
	{
	    if (this.is_updateCache())
		    this.refilled_symbol_array();
	    var tiles_groups = this.pattern_search_2d(pattern, false, true);
	    var has_any_matched = (tiles_groups.length != 0);
	    if (has_any_matched)
	    {
	        var group=this.GetInstGroup().GetGroup(group_name);
            group.SetByUIDList(tiles_groups[0]["uid"]);
            this._matched_axis = tiles_groups[0]["dir"];   	    
        }
        return has_any_matched;
	};		
	
	Cnds.prototype.AnyMatchTemplatePattern2D = function (pattern, group_name)
	{
	    if (this.is_updateCache())
		    this.refilled_symbol_array();		
	    var tiles_groups = this.pattern_search_2d(pattern, true, true);
	    var has_any_matched = (tiles_groups.length != 0);
	    if (has_any_matched)
	    {
	        var group=this.GetInstGroup().GetGroup(group_name);
            group.SetByUIDList(tiles_groups[0]["uid"]);
            this._matched_axis = tiles_groups[0]["dir"];   	    
        }
        return has_any_matched;
	};	
	// for each
	Cnds.prototype.ForEachMatchPattern = function (pattern, group_name)
	{
	    if (this.is_updateCache())
		    this.refilled_symbol_array();
	    var tiles_groups = this.pattern_search(pattern, false);
	    this._has_matched_pattern = (tiles_groups.length != 0);
	    if (this._has_matched_pattern)
	    {
	        this._group_name = group_name;
	        this.on_match_pattern(tiles_groups);
	    }
        return false;
	};	
	
	Cnds.prototype.ForEachMatchPattern2D = function (pattern, group_name)
	{
	    if (this.is_updateCache())
		    this.refilled_symbol_array();
	    var tiles_groups = this.pattern_search_2d(pattern, false, false);
	    this._has_matched_pattern = (tiles_groups.length != 0);
	    if (this._has_matched_pattern)
	    {
	        this._group_name = group_name;
	        this.on_match_pattern(tiles_groups);
	    }
        return false;
	};		
	
	Cnds.prototype.ForEachMatchTemplatePattern2D = function (pattern, group_name)
	{
	    if (this.is_updateCache())
		    this.refilled_symbol_array();		
	    var tiles_groups = this.pattern_search_2d(pattern, true, false);
	    this._has_matched_pattern = (tiles_groups.length != 0);
	    if (this._has_matched_pattern)
	    {
	        this._group_name = group_name;
	        this.on_match_pattern(tiles_groups);
	    }
        return false;
	};	
	
	Cnds.prototype.IsMatchAxisSquare = function (axis)
	{
        if (this._matched_axis == null)
            return false;
        
        var matched;
        if ((this._matched_axis == 0) && (axis == 0))
            matched = true;
        else if ((this._matched_axis == 1) && (axis == 1))
            matched = true;
        else if (( (this._matched_axis == 2) || (this._matched_axis == 3) ) && (axis == 2))
            matched = true;
        else
            matched = false;
        
        return matched;
	};
	
	Cnds.prototype.IsMatchAxisHex = function (axis)
	{
        return (this._matched_axis === axis);
	};    
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Setup = function (board_objs, group_objs)
	{
        var board = board_objs.getFirstPicked();
        if (board.check_name == "BOARD")
            this.board = board;
        else
            alert ("Matcher should connect to a board object");
            
        var group = group_objs.getFirstPicked();
        if (group.check_name == "INSTGROUP")
            this.group = group;        
        else
            alert ("Matcher should connect to a instance group object");            
	};  
	Acts.prototype.GetMatchTiles = function (group_name)	
	{
        this.get_match_tiles(group_name,1);
	};
    Acts.prototype.SetSymbol = function (symbol_value)
	{
        this._symbol_value = symbol_value;
	};
	Acts.prototype.GetMatchTiles2D = function (group_name)	
	{
        this.get_match_tiles(group_name,2);
	};
	Acts.prototype.ForceUpdaeSymbolArray = function ()	
	{
        this.refilled_symbol_array();
	};	
		
	Acts.prototype.SetHorizontalAxisEnable = function (enable)	
	{
        this._square_modes[0] = (enable==1);
	};		
	Acts.prototype.SetVerticalAxisEnable = function (enable)	
	{
        this._square_modes[1] = (enable==1);
	};	     
	Acts.prototype.SetIsometricAxisEnable = function (enable)	
	{	     
        this._square_modes[2] = (enable==1);
        this._square_modes[3] = (enable==1);        
	};
	Acts.prototype.ForceUpdaeCellByLXY = function (lx, ly)	
	{	     
        this.write_symbol_cache(lx, ly);   
	};		
    
	Acts.prototype.ForceUpdaeCellByTile = function (chess_type)	
	{
        if (!chess_type)
            return;  
        var chess = chess_type.getCurrentSol().getObjects();
        var i, chess_cnt=chess.length;
		var _xyz, board=this.GetBoard();
        for (i=0; i<chess_cnt; i++)
        {
		    _xyz = board.uid2xyz(chess[i].uid);
            if (_xyz == null)
                continue;
                
			this.write_symbol_cache(_xyz.x, _xyz.y);    
		}      
	};	

	Acts.prototype.ForceUpdaeCellByTileUID = function (uid)	
	{
	    var _xyz = this.GetBoard().uid2xyz(uid);
        if (_xyz == null)
            return;
        this.write_symbol_cache(_xyz.x, _xyz.y);       
	};

	Acts.prototype.SetWildcard = function (s)	
	{
	    this.wildcard_symbol = s;    
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
    Exps.prototype.TileUID = function (ret)
    {
        ret.set_any(this.exp_TileUID);
    };
	
    Exps.prototype.TileX = function (ret)
    {
        ret.set_int(this.exp_TileX);
    };
    	
    Exps.prototype.TileY = function (ret)
    {
        ret.set_int(this.exp_TileY);
    };
    	
    Exps.prototype.NOSYMBOL = function (ret)
    {
        ret.set_string("");
    };    
    	
    Exps.prototype.Wildcard = function (ret)
    {
        ret.set_string(this.wildcard_symbol);
    };    	

    	
    Exps.prototype.UID2Symbol = function (ret, uid)
    {
        var s = ""
	    var _xyz = this.GetBoard().uid2xyz(uid);
        if (_xyz !== null)
            s = this.write_symbol_cache(_xyz.x, _xyz.y);  
            
        ret.set_string(s);
    };
    	
    Exps.prototype.MatchedSymbol = function (ret)
    {
        ret.set_string(this.exp_MatchedSymbol || "");
    }; 	
}());