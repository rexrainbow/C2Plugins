/*
<leaderboard>  
    // primary-keys
    boardID - leaderboard ID
    tag - filter tag (optional)
    owner - ownerID, or userData (Linked)
    
    score - score
*/

// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Backendless_Leaderboard = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Backendless_Leaderboard.prototype;
		
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
        var self = this;
        var myInit = function()
        {
            self.myInit();
        };
        window.BackendlessAddInitCallback(myInit);
	};    
    
    var PERIODMAP = ["date", "week", "month", "year", null];
	instanceProto.myInit = function()
	{ 	    
        this.leaderboardKlass = window.BackendlessGetKlass(this.properties[0]);     
        this.rankStorage = window["Backendless"]["Persistence"]["of"](this.leaderboardKlass);        
            
	    var boardID = this.properties[1];
        var tag = this.properties[2];
	    var page_lines = this.properties[3];
	    this.ranking_order = this.properties[4];
        var period = this.properties[5];
	    this.LinkOwnerToTable = (this.properties[6] !== "");
        if (this.LinkOwnerToTable)
            this.ownerKlass = window.BackendlessGetKlass(this.properties[6]);
	    
	    if (!this.recycled)
            this.leaderboard = this.create_leaderboard(page_lines);
        else
            this.leaderboard.Reset();	
        
        
        this.setBoardID(boardID);
        this.setTag(tag);
        this.setPeriod(period);        

        this.currentDateTime = null;
        this.exp_LoopIndex = -1;
	    this.exp_CurUserRank = -1;
	    this.exp_CurRankCol = null;
	    this.cacheRankObj = null;
        
        this.exp_LastRanking = -1;
        this.exp_LastUserID = ""; 
        this.exp_LastScore = 0;           
        this.exp_LastUsersCount = -1; 
        this.last_error = null;	            
	};
        
	instanceProto.onDestroy = function ()
	{
        this.leaderboard.Reset();	
        this.cacheRankObj = null;
	};   
        
	instanceProto.create_leaderboard = function(page_lines)
	{ 
	    var leaderboard = new window.BackendlessItemPageKlass(page_lines);
	    
        leaderboard.storage = this.rankStorage;
	    var self = this;
	    var onReceived = function()
	    {        
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_Leaderboard.prototype.cnds.OnReceived, self);
	    }
	    leaderboard.onReceived = onReceived;
	    
	    var onReceivedError = function(error)
	    {
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_Leaderboard.prototype.cnds.OnReceivedError, self);
	    }
	    leaderboard.onReceivedError = onReceivedError;	
	        
	    var onGetIterItem = function(item, i)
	    {
	        self.exp_CurUserRank = i;
	        self.exp_CurRankCol = item;
	        self.exp_LoopIndex = i - leaderboard.GetStartIndex();
	    };	    	    
	    leaderboard.onGetIterItem = onGetIterItem;
	    
	    return leaderboard;
	};	
    
	instanceProto.setBoardID = function(boardID)
	{ 
	    this.boardID = boardID;
	    this.leaderboard.Reset();		
	};
    
	instanceProto.setTag = function(tag)
	{
        if (tag === "")
            tag = null;
	    this.tag = tag;
	    this.leaderboard.Reset();		
	};
    
	instanceProto.setPeriod = function(period)
	{
        this.period = PERIODMAP[ period ];
	};    

    var reverEval = function (value)
    {
        if (typeof(value) === "string")
            value = "'" + value + "'";
        
        return value;
    }
	instanceProto.get_base_query = function(boardID, tag, userID)
	{ 
        var conds = [];
        conds.push("boardID=" + reverEval(boardID));
        
        if (tag != null)        
            conds.push("tag=" + reverEval(tag));
        
        if (userID != null) 
        {    
            var key = (this.LinkOwnerToTable)? "owner.objectId":"owner";               
            conds.push(key + "=" + reverEval(userID));                    
        }
        

        var query = new window["Backendless"]["DataQuery"]();
        query["condition"] = conds.join(" AND ");
        query["options"] = {
            "pageSize": 1,
            "offset": 0,
        }
	    return query;
	};
	
	instanceProto.get_request_query = function(boardID, tag, period)
	{ 
	    var query = this.get_base_query(boardID, tag);
        var sortByScore = (this.ranking_order===0)? "score":"score desc"; 
        query["options"]["sortBy"] = [sortByScore, "updated"];        
        
        if (period != null)  // All-time
        {            
            var date = (this.currentDateTime)? this.currentDateTime:(new Date()).getTime(); // timestamp
            var start = window["moment"](date)["startOf"](period)["valueOf"]().toString();           
            var end = window["moment"](date)["endOf"](period)["valueOf"]().toString();
            var startCond = window.BackendlessGetUpdatedCond(">=", start);
            var endCond = window.BackendlessGetUpdatedCond("<=", end);
            query["condition"] += " AND " + startCond + " AND " + endCond;
        }
        
        if (this.LinkOwnerToTable)
        {
            if (!query["options"].hasOwnProperty("relations"))
            {
                query["options"]["relations"] = [];
            }
            
            query["options"]["relations"].push("owner");
        }

	    return query;
	};	
    
	instanceProto.getUserID = function(rank)
	{ 
        var userID;
        if (this.LinkOwnerToTable)        
            userID = this.cacheRankObj["owner"]["objectId"];
        else
            userID = this.cacheRankObj["owner"];
        
        return userID;
	};
    
	instanceProto.getCacheObject = function(boardID, tag, userID)
	{ 
	    if (this.cacheRankObj == null)	
            return null;
        
        if (boardID != this.cacheRankObj["boardID"])
            return null;        
        if (tag != this.cacheRankObj["tag"])
            return null;
        
        if (userID != this.getUserID(this.cacheRankObj))
            return null;   
        
        return this.cacheRankObj;
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

    var isScoreUpdating = function (oldScore, newScore, cond)
    {
        if (cond === 0)
            return true;
        else if (cond === 1) // post if greater 
            return (newScore > oldScore);
        else if (cond === 2) // post if less
            return (newScore < oldScore);
    };
    
    Acts.prototype.PostScore = function (userID, score, post_cond)
	{	
        if (userID === "")
            return;
        
	    var self = this;
	    // step 3    
	    var OnPostComplete = function(rankObj)
	    {
            self.cacheRankObj = rankObj;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_Leaderboard.prototype.cnds.OnPostComplete, self);
	    };	
	    
	    var OnPostError = function(error)
	    {
            self.cacheRankObj = null;
            self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_Leaderboard.prototype.cnds.OnPostError, self);
	    };

	    var saveRank = function(rankObj)
	    {
            if (rankObj == null)
                rankObj = new self.leaderboardKlass();
            
	        rankObj["boardID"] = self.boardID;            
            if (self.tag != null)
	            rankObj["tag"] = self.tag;              
            
            if (self.LinkOwnerToTable)
            {
                var user = new self.ownerKlass();   
                user["objectId"] = userID;               
                rankObj["owner"] = user;
            }           
            else
                rankObj["owner"] = userID;
            
	        rankObj["score"] = score;


            
            var handler = new window["Backendless"]["Async"]( OnPostComplete, OnPostError );	
            self.rankStorage["save"](rankObj, handler);
	    };
	    
	    // step 2  
        var trySaveRank = function (rankObj)
        {
            if (!rankObj ||
                 isScoreUpdating(rankObj["score"], score, post_cond))
	            saveRank(rankObj);
            else
                OnPostComplete(rankObj);
        };        
	    var onReadRank = function(result)
	    {	 
            trySaveRank(result["data"][0])
	    };	

	    // step 1
        var readRank = function ()
        {
            var query = self.get_base_query(self.boardID, self.tag, userID);
		    var handler = new window["Backendless"]["Async"]( onReadRank, OnPostError );
            window.BackendlessQuery(self.rankStorage, query, handler);        
        }
        
        var rankObj = this.getCacheObject(this.boardID, this.tag, userID);
        if (rankObj == null)
            readRank();
        else
            trySaveRank(rankObj);
	}; 
	
    Acts.prototype.RequestInRange = function (start, lines)
	{
	    var query = this.get_request_query(this.boardID, this.tag, this.period);
	    this.leaderboard.RequestInRange(query, start, lines);
	};

    Acts.prototype.RequestTurnToPage = function (page_index)
	{
	    var query = this.get_request_query(this.boardID, this.tag, this.period);
	    this.leaderboard.RequestTurnToPage(query, page_index);
	};	 
    
    Acts.prototype.RequestUpdateCurrentPage = function ()
	{
	    var query = this.get_request_query(this.boardID, this.tag, this.period);
	    this.leaderboard.RequestUpdateCurrentPage(query);
	};    
    
    Acts.prototype.RequestTurnToNextPage = function ()
	{
	    var query = this.get_request_query(this.boardID, this.tag, this.period);
	    this.leaderboard.RequestTurnToNextPage(query);
	};     
    
    Acts.prototype.RequestTurnToPreviousPage = function ()
	{
	    var query = this.get_request_query(this.boardID, this.tag, this.period);
	    this.leaderboard.RequestTurnToPreviousPage(query);
	}; 
    
    Acts.prototype.SetBoardID = function (boardID)
	{
        this.setBoardID(boardID);
	};
    
    Acts.prototype.SetTag = function (tag)
	{
        this.setTag(tag);
	};           
    
    Acts.prototype.SetPeriod = function (period)
	{
        this.setPeriod(period); 
	};  
    
    Acts.prototype.SetDateTime = function (t)
	{
        this.currentDateTime = t;
	};     
    
    Acts.prototype.GetRanking = function (userID)
	{	        
	    var start = 0;
	    var lines = 100;
	    
        var self = this;
        
        var return_ranking = function (ranking)
        {
            self.exp_LastUserID = userID;
	        self.exp_LastRanking = ranking;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_Leaderboard.prototype.cnds.OnGetRanking, self); 
        };
        
	    var on_success = function(result)
	    {		      
            var rankObjs = result["data"];
	        if (rankObjs.length === 0)
	        {
	            // page not found, cound not find userID
	            return_ranking(-1);
	        }
	        else
	        {
	            var ranking = -1;
	            var i, cnt = rankObjs.length;
	            for(i=0; i<cnt; i++)
	            {
                    if (userID === self.getUserID(rankObjs[i]))
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
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_Leaderboard.prototype.cnds.OnGetRankingError, self);
	    };	    
        
        var handler = new window["Backendless"]["Async"]( on_success, on_error );
        var query = self.get_request_query(this.boardID, this.tag, this.period);
        query["options"]["pageSize"] = lines;        
        
        if (this.LinkOwnerToTable)
        {
            if (!query["options"].hasOwnProperty("relations"))
            {
                query["options"]["relations"] = [];
            }
            
            query["options"]["relations"].push("owner");
            query["properties"] = ["objectId"];
        }
        else
            query["properties"] = ["owner"];   
        
	    var query_page = function (start_)
	    {
	        // get 100 lines for each request until get null or get userID
            query["options"]["offset"] = start_;
            self.rankStorage["find"](query, handler);
        }
        
        query_page(start);
	}; 
	
    Acts.prototype.GetScore = function (userID)
	{	
	    var self = this;
        
        var onGetScore = function (rankObj)
        {
            self.cacheRankObj = rankObj;
            self.exp_LastUserID = userID;
            self.exp_LastScore = (!rankObj)? 0: rankObj["score"];            
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_Leaderboard.prototype.cnds.OnGetScore, self);
        };
        
	    var onReadRank = function(result)
	    {
            onGetScore(result["data"][0]);
	    };	    
	    var onReadRankError = function(error)
	    {
            self.exp_LastUserID = userID;
            self.exp_LastScore = 0;
            self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_Leaderboard.prototype.cnds.OnGetScoreError, self);
	    };        
        var readRank = function ()
        {
            var query = self.get_base_query(self.boardID, self.tag, userID);
		    var handler = new window["Backendless"]["Async"]( onReadRank, onReadRankError );	     
            self.rankStorage["find"](query, handler);
        }
        
        var rankObj = this.getCacheObject(this.boardID, this.tag, userID);
        if (rankObj != null)        
            onGetScore(rankObj);        
        else        
            readRank();
	}; 
		
    //Acts.prototype.GetUsersCount = function ()
	//{	    
	//    var self = this;
	//    var on_success = function(count)
	//    {
	//        self.exp_LastUsersCount = count;
	//        self.runtime.trigger(cr.plugins_.Rex_Backendless_Leaderboard.prototype.cnds.OnGeUsersCount, self); 	        
	//    };	    
	//    var on_error = function(error)
	//    {      
	//        self.exp_LastUsersCount = -1;
	//        self.last_error = error;
	//        self.runtime.trigger(cr.plugins_.Rex_Backendless_Leaderboard.prototype.cnds.OnGetUsersCountError, self); 
	//    };
	//    
	//    var handler = {"success":on_success, "error": on_error};    	     	    
	//    this.get_request_query(self.boardID)["count"](handler);
	//};	
	
    Acts.prototype.InitialTable = function ()
	{	
        var rankObj = new this.leaderboardKlass();
	    rankObj["boardID"] = "";            
        if (this.tag != null)
	        rankObj["tag"] = "";              
        
        rankObj["owner"] = (this.LinkOwnerToTable)? new this.ownerKlass():"";
	    rankObj["score"] = 0;

	    window.BackendlessInitTable(this.rankStorage, rankObj);
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	    
	Exps.prototype.LastSentMessageID = function (ret)
	{
		ret.set_string(this.exp_LastSentMessageID);
	};

	Exps.prototype.CurScore = function (ret)
	{
		ret.set_any( window.BackendlessGetItemValue(this.exp_CurRankCol, "score", 0) );          
	};
	Exps.prototype.CurUserRank = function (ret)
	{
		ret.set_int(this.exp_CurUserRank);
	};
	Exps.prototype.CurUserID = function (ret)
	{
        var key = (this.LinkOwnerToTable)? "owner.objectId":"owner";
		ret.set_string( window.BackendlessGetItemValue(this.exp_CurRankCol, key, "") );             
	}; 	
	Exps.prototype.CurUserData = function (ret, subKey, default_value)
	{
		ret.set_any( window.BackendlessGetSubItemValue(this.exp_CurRankCol, "owner", subKey, default_value)  );        
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

	Exps.prototype.PostScore = function (ret)
	{
		ret.set_any( window.BackendlessGetItemValue(this.cacheRankObj, "score", 0) );    
	}; 		
	Exps.prototype.PostUserID = function (ret)
	{
        var key = (this.LinkOwnerToTable)? "owner.objectId":"owner";        
		ret.set_string( window.BackendlessGetItemValue(this.cacheRankObj, key, "") );    
	}; 	

	Exps.prototype.UserID2Rank = function (ret, userID)
	{      
        // TODO
		ret.set_int(this.leaderboard.FindFirst("userID", userID));
	};
    
	Exps.prototype.Rank2Score = function (ret, i, default_value)
	{
		ret.set_any( window.BackendlessGetItemValue(this.leaderboard.GetItem(i), "score", (default_value || 0)) );        
	};	

	Exps.prototype.Rank2UserID = function (ret, i, default_value)
	{
        var key = (this.LinkOwnerToTable)? "owner.objectId":"owner";             
		ret.set_string( window.BackendlessGetItemValue(this.leaderboard.GetItem(i), key, (default_value || "")) );          
	};	
	Exps.prototype.Rank2UserData = function (ret, i, subKey, default_value)
	{
		ret.set_any( window.BackendlessGetSubItemValue(this.leaderboard.GetItem(i), "owner", subKey, default_value)  ); 
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
	
	Exps.prototype.BoardID = function (ret)
	{
		ret.set_string(this.boardID);
	};		
	
	Exps.prototype.Tag = function (ret)
	{
		ret.set_string(this.tag || "");
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