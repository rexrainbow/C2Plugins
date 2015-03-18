// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_parse_Leaderboard = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_parse_Leaderboard.prototype;
		
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
	    jsfile_load("parse-1.3.2.min.js");
	};
	
	var jsfile_load = function(file_name)
	{
	    var scripts=document.getElementsByTagName("script");
	    var exist=false;
	    for(var i=0;i<scripts.length;i++)
	    {
	    	if(scripts[i].src.indexOf(file_name) != -1)
	    	{
	    		exist=true;
	    		break;
	    	}
	    }
	    if(!exist)
	    {
	    	var newScriptTag=document.createElement("script");
	    	newScriptTag.setAttribute("type","text/javascript");
	    	newScriptTag.setAttribute("src", file_name);
	    	document.getElementsByTagName("head")[0].appendChild(newScriptTag);
	    }
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
	    if (!window.RexC2IsParseInit)
	    {
	        window["Parse"]["initialize"](this.properties[0], this.properties[1]);
	        window.RexC2IsParseInit = true;
	    }
	    	     
	    if (!this.recycled)
	    {	    
	        this.rank_klass = window["Parse"].Object["extend"](this.properties[2]);
	    }
	    
	    var leaderboardID = this.properties[3];
	    var page_lines = this.properties[4]
	    this.ranking_order = this.properties[5];
	    
	    if (!this.recycled)
            this.leaderboard = this.create_leaderboard(page_lines);
        
        this.set_leaderBoardID(leaderboardID);
        
	    this.exp_CurPlayerRank = -1;
	    this.exp_CurRankCol = null;
	    this.exp_PostPlayerName = "";
	};
	
	instanceProto.create_leaderboard = function(page_lines)
	{ 
	    var leaderboard = new window.ParseItemPageKlass(page_lines);
	    
	    var self = this;
	    var onReceived = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnUpdate, self);
	    }
	    leaderboard.onReceived = onReceived;
	    
	    var onGetIterItem = function(item, i)
	    {
	        self.exp_CurPlayerRank = i;
	        self.exp_CurRankCol = item;
	    };	    	    
	    leaderboard.onGetIterItem = onGetIterItem;
	    
	    return leaderboard;
	};	
    
	instanceProto.set_leaderBoardID = function(boardID, leaderboard)
	{ 
	    this.leaderBoardID = boardID;
	    
	    if (leaderboard == null)
	        leaderboard = this.leaderboard;
	    leaderboard.Reset();		
	};
    
	instanceProto.get_base_query = function(boardID, userID)
	{ 
	    var query = new window["Parse"]["Query"](this.rank_klass);
	    query["equalTo"]("boardID", boardID);
	    if (userID != null)
	        query["equalTo"]("userID", userID);
	    return query;
	};
	
	instanceProto.get_request_query = function(boardID)
	{ 
	    var query = this.get_base_query(boardID);       	   
        if (this.ranking_order==0)        
            query["ascending"]("score,updatedAt");        
        else        
            query["ascending"]("-score,updatedAt");        

	    return query;
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	
	Cnds.prototype.OnPostComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnPostError = function ()
	{
	    return true;
	}; 	 
	Cnds.prototype.OnUpdate = function ()
	{
	    return true;
	}; 
	Cnds.prototype.ForEachRank = function (start, end)
	{	            
		return this.leaderboard.ForEachItem(this.runtime, start, end);
	};     
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.PostScore = function (userID, name, score, extra_data)
	{	
	    var self = this;
	    // step 3    
	    var OnPostComplete = function(rank_obj)
	    { 	        
            self.exp_PostPlayerName = name;
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnPostComplete, self);
	    };	
	    
	    var OnPostError = function(rank_obj, error)
	    {
            self.exp_PostPlayerName = name;
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnPostError, self);
	    };
	    	    
	    var save_rank = function(rank_obj)
	    {
	        rank_obj["set"]("boardID", self.leaderBoardID);
	        rank_obj["set"]("userID", userID);
	        rank_obj["set"]("name", name);
	        rank_obj["set"]("score", score);
	        rank_obj["set"]("extraData", extra_data);	
	        
	        var handler = {"success":OnPostComplete, "error": OnPostError};
	        rank_obj["save"](null, handler);	        
	    };
	    
	    // step 2
	    var on_success = function(rank_obj)
	    {	 
	        if (!rank_obj)
	            rank_obj = new self.rank_klass();
	            
	        save_rank(rank_obj);
	    };	    
	    var on_error = function(error)
	    {
	        OnPostError(null, error);
	    };
        
	    // step 1
		var handler = {"success":on_success, "error": on_error};		
	    this.get_base_query(this.leaderBoardID, userID)["first"](handler); 
	}; 
	
    Acts.prototype.RequestInRange = function (start, lines)
	{
	    var query = this.get_request_query(this.leaderBoardID);
	    this.leaderboard.RequestInRange(query, start, lines);
	};

    Acts.prototype.RequestTurnToPage = function (page_index)
	{
	    var query = this.get_request_query(this.leaderBoardID);
	    this.leaderboard.RequestTurnToPage(query, page_index);
	};	 
    
    Acts.prototype.RequestUpdateCurrentPage = function ()
	{
	    var query = this.get_request_query(this.leaderBoardID);
	    this.leaderboard.RequestUpdateCurrentPage(query);
	};    
    
    Acts.prototype.RequestTurnToNextPage = function ()
	{
	    var query = this.get_request_query(this.leaderBoardID);
	    this.leaderboard.RequestTurnToNextPage(query);
	};     
    
    Acts.prototype.RequestTurnToPreviousPage = function ()
	{
	    var query = this.get_request_query(this.leaderBoardID);
	    this.leaderboard.RequestTurnToPreviousPage(query);
	};  
    
    Acts.prototype.SetLeaderboardID = function (leaderboardID)
	{
        this.set_leaderBoardID(leaderboardID);
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.CurPlayerName = function (ret)
	{
	    if (this.exp_CurRankCol == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.exp_CurRankCol["get"]("name"));
	}; 	
	Exps.prototype.CurPlayerScore = function (ret)
	{
	    if (this.exp_CurRankCol == null)
	    {
	        ret.set_any(0);
	        return;
	    }
	    
		ret.set_any(this.exp_CurRankCol["get"]("score"));
	};
	Exps.prototype.CurPlayerRank = function (ret)
	{
		ret.set_int(this.exp_CurPlayerRank);
	};
	Exps.prototype.CurUserID = function (ret)
	{
	    if (this.exp_CurRankCol == null)
	    {
	        ret.set_string("");
	        return;
	    }
	    
		ret.set_string(this.exp_CurRankCol["get"]("userID"));
	}; 	
	Exps.prototype.CurExtraData = function (ret)
	{
	    if (this.exp_CurRankCol == null)
	    {
	        ret.set_any("");
	        return;
	    }
        
		ret.set_any(this.exp_CurRankCol["get"]("extraData"));
	};

		
	Exps.prototype.PostPlayerName = function (ret)
	{
		ret.set_string(this.exp_PostPlayerName);
	}; 	
		
	Exps.prototype.UserID2Rank = function (ret, userID)
	{
		ret.set_int(this.leaderboard.FindFirst("userID", userID));
	};
	   	
	Exps.prototype.Rank2PlayerName = function (ret, i)
	{
	    var rank_info = this.leaderboard.GetItem(i);
	    var name = (!rank_info)? "":rank_info["get"]("name");
		ret.set_string(name);
	};
	Exps.prototype.Rank2PlayerScore = function (ret, i)
	{
	    var rank_info = this.leaderboard.GetItem(i);    
	    var score = (!rank_info)? "":rank_info["get"]("score");
		ret.set_any(score);
	};	
	Exps.prototype.Rank2ExtraData = function (ret, i)
	{
	    var rank_info = this.leaderboard.GetItem(i);	    
	    var extra_data = (!rank_info)? "":rank_info["get"]("extraData");
		ret.set_any(extra_data);
	};	
		
	Exps.prototype.PageIndex = function (ret)
	{
		ret.set_int(this.leaderboard.GetCurrentPageIndex());
	};    
    
}());

(function ()
{
    if (window.ParseItemPageKlass != null)
        return;    

    var ItemPageKlass = function (page_lines)
    {
        // export
        this.onReceived = null;
        this.onGetIterItem = null;  // used in ForEachItem
        // export
	    this.items = [];
        this.start = 0;
        this.page_lines = page_lines;   
        this.page_index = 0;     
    };
    
    var ItemPageKlassProto = ItemPageKlass.prototype;  
     
	ItemPageKlassProto.Reset = function()
	{ 
	    this.items.length = 0;
        this.start = 0;     
	};	
	     
	ItemPageKlassProto.request = function(query, start, lines)
	{
        if (start < 0)
            start = 0;
            
        var self = this;
        
	    var on_success = function(items)
	    {
	        self.items = items;
            self.start = start;
            self.page_index = Math.floor(start/self.page_lines);
            
            if (self.onReceived)
                self.onReceived();
	    };	    
	    var on_error = function(error)
	    {
	        self.items.length = 0;        
	    };
	    
	    var handler = {"success":on_success, "error": on_error};
	    query["skip"](start);
        query["limit"](lines);	    
	    query["find"](handler);	    
	};	    

    ItemPageKlassProto.RequestInRange = function (query, start, lines)
	{
	    this.request(query, start, lines);
	};

    ItemPageKlassProto.RequestTurnToPage = function (query, page_index)
	{
	    var start = page_index*this.page_lines;
	    this.request(query, start, this.page_lines);
	};	 
    
    ItemPageKlassProto.RequestUpdateCurrentPage = function (query)
	{
	    this.request(query, this.start, this.page_lines);
	};    
    
    ItemPageKlassProto.RequestTurnToNextPage = function (query)
	{
        var start = this.start + this.page_lines;
	    this.request(query, start, this.page_lines);
	};     
    
    ItemPageKlassProto.RequestTurnToPreviousPage = function (query)
	{
        var start = this.start - this.page_lines;
	    this.request(query, start, this.page_lines);
	};  

	ItemPageKlassProto.ForEachItem = function (runtime, start, end)
	{
        var items_end = this.start + this.items.length - 1;       
	    if (start == null)
	        start = this.start; 
	    else
	        start = cr.clamp(start, this.start, items_end);
	        
	    if (end == null) 
	        end = items_end;
        else     
            end = cr.clamp(end, start, items_end);
        	    	     
        var current_frame = runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i;
		for(i=start; i<=end; i++)
		{
            if (solModifierAfterCnds)
            {
                runtime.pushCopySol(current_event.solModifiers);
            }
            
            if (this.onGetIterItem)
                this.onGetIterItem(this.GetItem(i), i);
                
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
    		
		return false;
	}; 

	ItemPageKlassProto.FindFirst = function(key, value, start_index)
	{
	    if (start_index == null)
	        start_index = 0;
	        
        var i, cnt=this.items.length;
        for(i=start_index; i<cnt; i++)
        {
            if (this.items[i]["get"](key) == value)
                return i + this.start;
        }
	    return -1;
	};
			
	ItemPageKlassProto.GetItem = function(i)
	{
	    return this.items[i - this.start];
	};
	
	ItemPageKlassProto.GetCurrentPageIndex = function ()
	{
	    return this.page_index;
	};	

	window.ParseItemPageKlass = ItemPageKlass;
}());                