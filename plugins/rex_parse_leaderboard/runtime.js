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
	var input_text = "";
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
	    this.ranks = [];
        this.rank_start = 0;
        
	    this.exp_CurPlayerRank = -1;
	    this.exp_CurRankCol = null;
	    this.exp_PostPlayerName = "";        
	    
	    window["Parse"]["initialize"](this.properties[0], this.properties[1]);
	    this.rank_klass = window["Parse"].Object["extend"](this.properties[2]);
        this.set_leaderBoardID(this.properties[3]);
        this.page_lines = this.properties[4];
	    this.ranking_order = this.properties[5];
	};
    
	instanceProto.set_leaderBoardID = function(boardID)
	{ 
	    this.leaderBoardID = boardID;
        this.ranks.length = 0;
        this.rank_start = 0;      
	};
    
	instanceProto.get_query = function(boardID, userID)
	{ 
	    var query = new window["Parse"]["Query"](this.rank_klass);
	    query["equalTo"]("boardID", boardID);
	    if (userID != null)
	        query["equalTo"]("userID", userID);
	    return query;
	};
	
	instanceProto.get_request_query = function(boardID, start, lines)
	{ 
	    var query = this.get_query(boardID);
        if (this.ranking_order==0)
        {
            query["ascending"]("score,updatedAt");
        }
        else
        {
            query["ascending"]("-score,updatedAt");
        }
            
	    query["skip"](start);
        query["limit"](lines);
	    return query;
	};
	
	instanceProto.RequestInRange = function(boardID, start, lines)
	{ 
        if (start < 0)
            start = 0;
            
        var self = this;
        
	    var on_success = function(ranks)
	    {
	        if ((ranks != null) && (ranks.length > 0))
            {
	            self.ranks = ranks;
                self.rank_start = start;
            }
            self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnUpdate, self);
	    };	    
	    var on_error = function(error)
	    {
	        self.ranks.length = 0;        
	    };
	    
	    var handler = {"success":on_success, "error": on_error};
	    this.get_request_query(boardID, start, lines)["find"](handler);	    
	};	
    
	instanceProto.rank_info_get = function(i)
	{
	    return this.ranks[i-this.rank_start];
	};		
	instanceProto.UserID2Rank = function(userID)
	{
        var i, cnt=this.ranks.length;
        for(i=0; i<cnt; i++)
        {
            if (this.ranks[i]["get"]("userID") == userID)
                return i+this.rank_start;
        }
	    return -1;
	};	
	instanceProto.for_each_bank_in_range = function (start, end)
	{	     
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i;
		for(i=start; i<=end; i++)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurPlayerRank = i;
            this.exp_CurRankCol = this.rank_info_get(i);
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
		             
        this.exp_CurRankCol = null;       		
		return false;
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
        var rank_end = this.rank_start + this.ranks.length - 1;       
	    if (start == null)
	        start = this.rank_start; 
	    if (end == null) 
	        end = rank_end;
        start = cr.clamp(start, this.rank_start, rank_end);
        end = cr.clamp(end, start, rank_end);

		return this.for_each_bank_in_range(start, end);
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
	    this.get_query(this.leaderBoardID, userID)["first"](handler); 
	}; 
	
    Acts.prototype.RequestInRange = function (start, lines)
	{
	    this.RequestInRange(this.leaderBoardID, start, lines);
	};

    Acts.prototype.RequestTurnToPage = function (page_index)
	{
	    var start = page_index*this.page_lines;
	    this.RequestInRange(this.leaderBoardID, start, this.page_lines);
	};	 
    
    Acts.prototype.RequestUpdateCurrentPage = function ()
	{
	    this.RequestInRange(this.leaderBoardID, this.rank_start, this.page_lines);
	};    
    
    Acts.prototype.RequestTurnToNextPage = function ()
	{
        var start = this.rank_start + this.page_lines;
	    this.RequestInRange(this.leaderBoardID, start, this.page_lines);
	};     
    
    Acts.prototype.RequestTurnToPreviousPage = function ()
	{
        var start = this.rank_start - this.page_lines;
	    this.RequestInRange(this.leaderBoardID, start, this.page_lines);
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
		ret.set_int(this.UserID2Rank(userID));
	};
	   	
	Exps.prototype.Rank2PlayerName = function (ret, i)
	{
	    var rank_info = this.rank_info_get(i);
	    var name = (!rank_info)? "":rank_info["get"]("name");
		ret.set_string(name);
	};
	Exps.prototype.Rank2PlayerScore = function (ret, i)
	{
	    var rank_info = this.rank_info_get(i);    
	    var score = (!rank_info)? "":rank_info["get"]("score");
		ret.set_any(score);
	};	
	Exps.prototype.Rank2ExtraData = function (ret, i)
	{
	    var rank_info = this.rank_info_get(i);	    
	    var extra_data = (!rank_info)? "":rank_info["get"]("extraData");
		ret.set_any(extra_data);
	};	
		
	Exps.prototype.PageIndex = function (ret)
	{
        var page_index = Math.floor(this.rank_start/this.page_lines)
		ret.set_int(page_index);
	};    
    
}());