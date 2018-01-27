/*
<rankID>
    userID - userID of owner
    userName - name of owner
    score - score of owner
    extra - extra data of owner
    userObject - object at user table indexed by userID (optional)
*/

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
	    if (!this.recycled)
	    {	    
	        this.rank_klass = window["Parse"].Object["extend"](this.properties[0]);
	    }
	    
	    var leaderboardID = this.properties[1];
	    var page_lines = this.properties[2]
	    this.ranking_order = this.properties[3];
        this.acl_write_mode = this.properties[4];
        this.acl_read_mode = this.properties[5];
	    this.user_class = this.properties[6];
	    
	    if (!this.recycled)
            this.leaderboard = this.create_leaderboard(page_lines);
        
        this.set_leaderBoardID(leaderboardID);

        this.exp_LoopIndex = -1;
	    this.exp_CurPlayerRank = -1;
	    this.exp_CurRankCol = null;
	    this.exp_PostRankObj = null;
        
        this.exp_LastRanking = -1;
        this.exp_LastUserID = ""; 
        this.exp_LastScore = "";           
        this.exp_LastUsersCount = -1; 
        this.last_error = null;	            
	};
	
	instanceProto.create_leaderboard = function(page_lines)
	{ 
	    var leaderboard = new window.ParseItemPageKlass(page_lines);
	    
	    var self = this;
	    var onReceived = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnReceived, self);
	    }
	    leaderboard.onReceived = onReceived;
	    
	    var onReceivedError = function(error)
	    {
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnReceivedError, self);
	    }
	    leaderboard.onReceivedError = onReceivedError;	
	        
	    var onGetIterItem = function(item, i)
	    {
	        self.exp_CurPlayerRank = i;
	        self.exp_CurRankCol = item;
	        self.exp_LoopIndex = i - leaderboard.GetStartIndex();
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

        if (this.user_class !== "")
        {
            query["include"]("userObject");
        }
	    return query;
	};	
    	
	var get_ACL = function (wm, rm)
	{
	    if ((wm === 0) && (rm === 0))
	        return null;	    
	    var current_user = window["Parse"]["User"]["current"]();
	    if (!current_user)
	        return null;
  	        
	    var acl = new window["Parse"]["ACL"](current_user);

        if (wm === 0)
            acl["setPublicWriteAccess"](true);
            
        if (rm === 0)
            acl["setPublicReadAccess"](true); 	
            
        return acl;	    
	};	
    
	var get_itemValue = function(item, key_, default_value)
	{ 
        var val;
        if (item != null)
        {
            if (key_ === "id")
                val = item[key_];
            else if ((key_ === "createdAt") || (key_ === "updatedAt"))
                val = item[key_].getTime();
            else
                val = item["get"](key_);
        }
        
        if (val == null)
            val = default_value;
        return val;
	};    
    
    var din = function (d, default_value)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (d == null)
        {
            if (default_value != null)
                o = default_value;
            else
                o = 0;
        }
        else if (typeof(d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
	    return o;
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
	Cnds.prototype.OnReceived = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnReceivedError = function ()
	{
	    return true;
	}; 	
	Cnds.prototype.ForEachRank = function (start, end)
	{	            
		return this.leaderboard.ForEachItem(this.runtime, start, end);
	};   

	Cnds.prototype.IsTheLastPage = function ()
	{
	    return this.leaderboard.IsTheLastPage();
	}; 		
	
	Cnds.prototype.OnGetRanking = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnGetRankingError = function ()
	{
	    return true;
	}; 	
	Cnds.prototype.OnGetScore = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnGetScoreError = function ()
	{
	    return true;
	}; 		
	Cnds.prototype.OnGeUsersCount = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnGetUsersCountError = function ()
	{
	    return true;
	};		  
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.PostScore = function (userID, name, score, extra_data, post_cond)
	{	
	    var self = this;
	    // step 3    
	    var OnPostComplete = function(rank_obj)
	    { 	        
            self.exp_PostRankObj = rank_obj;
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnPostComplete, self);
	    };	
	    
	    var OnPostError = function(rank_obj, error)
	    {
            self.exp_PostRankObj = null;
            self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnPostError, self);
	    };
	    	    
	    var save_rank = function(rank_obj)
	    {
	        rank_obj["set"]("boardID", self.leaderBoardID);
	        rank_obj["set"]("userID", userID);
	        rank_obj["set"]("name", name);
	        rank_obj["set"]("score", score);
	        rank_obj["set"]("extraData", extra_data);	
	        
	        
            var acl = get_ACL(self.acl_write_mode, self.acl_read_mode);
            if (acl)
            {
                rank_obj["setACL"](acl);
            }
	        
	        if (self.user_class !== "")
	        {
	            var t = window["Parse"].Object["extend"](self.user_class);
	            var o = new t();
	            o["id"] = userID;
	            rank_obj["set"]("userObject", o);
	        }
	        
	        var handler = {"success":OnPostComplete, "error": OnPostError};
	        rank_obj["save"](null, handler);	        
	    };
	    
	    // step 2
	    var on_success = function(rank_obj)
	    {	 
            var doPosting = true;
	        if (!rank_obj)
	            rank_obj = new self.rank_klass();
	        else 
            {
                var preScore = rank_obj["get"]("score"); 
                if (post_cond === 1)  // post if greater                
                    doPosting = (score > preScore);
                else if (post_cond === 2)  // post if less
                    doPosting = (score < preScore);
            }
            
            if (doPosting)
	            save_rank(rank_obj);
            else
                OnPostComplete(rank_obj);
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
    Acts.prototype.AddScore = function (userID, name, scoreAddTo, extra_data)
	{	
	    var self = this;
	    // step 3    
	    var OnPostComplete = function(rank_obj)
	    { 	        
            self.exp_PostRankObj = rank_obj;
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnPostComplete, self);
	    };	
	    
	    var OnPostError = function(rank_obj, error)
	    {
            self.exp_PostRankObj = null;
            self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnPostError, self);
	    };
	    	    
	    var save_rank = function(rank_obj)
	    {
	        rank_obj["set"]("boardID", self.leaderBoardID);
	        rank_obj["set"]("userID", userID);
	        rank_obj["set"]("name", name);
	        rank_obj["increment"]("score", scoreAddTo);
	        rank_obj["set"]("extraData", extra_data);	
	        
	        
            var acl = get_ACL(self.acl_write_mode, self.acl_read_mode);
            if (acl)
            {
                rank_obj["setACL"](acl);
            }
	        
	        if (self.user_class !== "")
	        {
	            var t = window["Parse"].Object["extend"](self.user_class);
	            var o = new t();
	            o["id"] = userID;
	            rank_obj["set"]("userObject", o);
	        }
	        
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
    Acts.prototype.SetLeaderboardID = function (leaderboardID)
	{
        this.set_leaderBoardID(leaderboardID);
	};

    Acts.prototype.GetRanking = function (userID)
	{	        
	    var start = 0;
	    var lines = 1000;
	    
        var self = this;
        
        var return_ranking = function (ranking)
        {
            self.exp_LastUserID = userID;
	        self.exp_LastRanking = ranking;
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnGetRanking, self); 
        };
        
	    var on_success = function(rank_obj)
	    {		        
	        if ((!rank_obj) || (rank_obj.length == 0))
	        {
	            // page not found, cound not find userID
	            return_ranking(-1);
	        }
	        else
	        {
	            var ranking = -1;
	            var i, cnt = rank_obj.length;
	            for(i=0; i<cnt; i++)
	            {
	                if (rank_obj[i]["get"]("userID") === userID)
	                {
	                    // found ranking
	                    ranking = start + i;
	                    break;
	                }
	            }
	            
	            // cound not find userID in this page, try get next page
	            if (ranking === -1)
	            {
	                if (cnt < lines)
	                {
	                    return_ranking(-1);
	                }
	                else
	                {
	                    start += lines;
	                    query_page(start);
	                }
	            }
	            else
	            {
	                return_ranking(ranking);
	            }
	        }	            
	    };	    
	    var on_error = function(error)
	    {
	        // page not found, cound not find userID
            self.exp_LastUserID = userID;
	        self.exp_LastRanking = -1;
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnGetRankingError, self);
	    };	    
	    var handler = {"success":on_success, "error": on_error};	
	    	    
	    var query_page = function (start_)
	    {
	        // get 1000 lines for each request until get null or get userID
	        var query = self.get_request_query(self.leaderBoardID);
            query["skip"](start_);
            query["limit"](lines);
            query["select"]("userID");
            query["find"](handler);
        }
        
        query_page(start);
	}; 
	
    Acts.prototype.GetScore = function (userID)
	{	
	    var self = this;
	    
	    // step 2
	    var on_success = function(rank_obj)
	    {	         
            self.exp_LastUserID = userID;
            self.exp_LastScore = (!rank_obj)? "": rank_obj["get"]("score");            
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnGetScore, self);
	    };	    
	    var on_error = function(error)
	    {
            self.exp_LastUserID = userID;
            self.exp_LastScore = "";
            self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnGetScoreError, self);
	    };
        
	    // step 1
		var handler = {"success":on_success, "error": on_error};		
	    this.get_base_query(this.leaderBoardID, userID)["first"](handler); 
	}; 
		
    Acts.prototype.GetUsersCount = function ()
	{	    
	    var self = this;
	    var on_success = function(count)
	    {
	        self.exp_LastUsersCount = count;
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnGeUsersCount, self); 	        
	    };	    
	    var on_error = function(error)
	    {      
	        self.exp_LastUsersCount = -1;
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_parse_Leaderboard.prototype.cnds.OnGetUsersCountError, self); 
	    };
	    
	    var handler = {"success":on_success, "error": on_error};    	     	    
	    this.get_request_query(self.leaderBoardID)["count"](handler);
	};	
	
    Acts.prototype.InitialTable = function ()
	{	
	    var rank_obj = new this.rank_klass();
	    rank_obj["set"]("boardID", "");
	    rank_obj["set"]("userID", "");
	    window.ParseInitTable(rank_obj);
	}; 	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.LastSentMessageID = function (ret)
	{
		ret.set_string(this.exp_LastSentMessageID);
	};
	
	Exps.prototype.CurPlayerName = function (ret)
	{
		ret.set_string( get_itemValue(this.exp_CurRankCol, "name", "") );                
	}; 	
	Exps.prototype.CurPlayerScore = function (ret)
	{
		ret.set_any( get_itemValue(this.exp_CurRankCol, "score", 0) );          
	};
	Exps.prototype.CurPlayerRank = function (ret)
	{
		ret.set_int(this.exp_CurPlayerRank);
	};
	Exps.prototype.CurUserID = function (ret)
	{
		ret.set_string( get_itemValue(this.exp_CurRankCol, "userID", "") );             
	}; 	
	Exps.prototype.CurExtraData = function (ret)
	{
		ret.set_any( get_itemValue(this.exp_CurRankCol, "extraData", "") );         
	};
	Exps.prototype.CurUserObject = function (ret, k_, default_value)
	{
        var v;    
	    var obj = get_itemValue(this.exp_CurRankCol, "userObject", null);
        if (obj)           
	        v = (k_ == null)? obj : obj["get"](k_);

		ret.set_any( din(v, default_value)  );        
	};
	
	Exps.prototype.CurRankingCount = function (ret)
	{
		ret.set_int( this.leaderboard.GetItems().length );
	};	
    
	Exps.prototype.CurStartIndex = function (ret)
	{
		ret.set_int(this.leaderboard.GetStartIndex());
	};	
    
	Exps.prototype.LoopIndex = function (ret)
	{
		ret.set_int(this.exp_LoopIndex);
	};	
				
	Exps.prototype.PostPlayerName = function (ret)
	{
		ret.set_string( get_itemValue(this.exp_PostRankObj, "name", "") );    
	}; 	
				
	Exps.prototype.PostPlayerScore = function (ret)
	{
		ret.set_any( get_itemValue(this.exp_PostRankObj, "score", 0) );    
	}; 		
	Exps.prototype.PostPlayerUserID = function (ret)
	{
		ret.set_string( get_itemValue(this.exp_PostRankObj, "userID", "") );    
	}; 	
				
	Exps.prototype.PostExtraData = function (ret)
	{
		ret.set_any( get_itemValue(this.exp_PostRankObj, "extraData", "") );    
	};    
	Exps.prototype.UserID2Rank = function (ret, userID)
	{
		ret.set_int(this.leaderboard.FindFirst("userID", userID));
	};
	   	
	Exps.prototype.Rank2PlayerName = function (ret, i, default_value)
	{
		ret.set_string( get_itemValue(this.leaderboard.GetItem(i), "name", (default_value || "")) );
	};
	Exps.prototype.Rank2PlayerScore = function (ret, i, default_value)
	{
		ret.set_any( get_itemValue(this.leaderboard.GetItem(i), "score", (default_value || 0)) );        
	};	
	Exps.prototype.Rank2ExtraData = function (ret, i, default_value)
	{
		ret.set_any( get_itemValue(this.leaderboard.GetItem(i), "extraData", (default_value || "")) );          
	};	
	Exps.prototype.Rank2PlayerUserID = function (ret, i, default_value)
	{
		ret.set_string( get_itemValue(this.leaderboard.GetItem(i), "userID", (default_value || "")) );          
	};	
	Exps.prototype.Rank2PlayerObject = function (ret, k, default_value)
	{
        var v;    
	    var obj = get_itemValue(this.leaderboard.GetItem(i), "userObject", null);
        if (obj)           
	        v = (k_ == null)? obj : obj["get"](k_);

		ret.set_any( din(v, default_value)  );          
	};    
    
	Exps.prototype.PageIndex = function (ret)
	{
		ret.set_int(this.leaderboard.GetCurrentPageIndex());
	};    


	Exps.prototype.LastRanking = function (ret)
	{
		ret.set_int(this.exp_LastRanking);
	};	
	Exps.prototype.LastUserID = function (ret)
	{
		ret.set_string(this.exp_LastUserID);
	};	    
	Exps.prototype.LastScore = function (ret)
	{
		ret.set_any(this.exp_LastScore);
	};		
	
	Exps.prototype.LastUsersCount = function (ret)
	{
		ret.set_int(this.exp_LastUsersCount);
	};	
	
	
	Exps.prototype.ErrorCode = function (ret)
	{
	    var val = (!this.last_error)? "": this.last_error["code"];    
		ret.set_int(val);
	}; 
	
	Exps.prototype.ErrorMessage = function (ret)
	{
	    var val = (!this.last_error)? "": this.last_error["message"];    
		ret.set_string(val);
	};	
}());