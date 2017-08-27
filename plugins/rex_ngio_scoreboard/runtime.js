// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_NGIO_Scoreboard = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_NGIO_Scoreboard.prototype;
		
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

    var periodCode = ["D", "W", "M", "Y", "A"];
	instanceProto.onCreate = function()
	{  
        this.scoreboardID = this.properties[0];
        this.limit = this.properties[1];
        this.period = periodCode[ this.properties[2] ];
        this.tag = this.properties[3];      
        this.socialUser = null;
        this.pageIndex = 0;
        
        this.ngio = null;
        this.lastResult = null;
        this.lastBoards = null;
        this.lastScores = null;     
        this.lastScoresStartIndex = 0;
        
        this.exp_CurScore = null;        
	};
    
	instanceProto.onDestroy = function ()
	{
        this.lastResult = null;
        this.lastBoards = null;
        this.lastScores = null;  
	};   
    
    instanceProto.GetNGIO = function ()
	{
        if (this.ngio != null)
            return this.ngio;
            
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            
            if (cr.plugins_.Rex_NGIO_Authentication && (inst instanceof cr.plugins_.Rex_NGIO_Authentication.prototype.Instance))
            {
                this.ngio = inst.GetNGIO();
                return this.ngio;
            }            
        }
        assert2(this.ngio, "NGIO.Scoreboard: Can not find NGIO Authentication oject.");
        return null; 
	};

    instanceProto.GetSkip = function (pageIndex)
	{
        if (pageIndex == null)
            pageIndex = this.pageIndex;
        
        return pageIndex * this.limit;
	};     

    instanceProto.GetScoresInRange = function (skip, limit)
	{
        var self=this;
        var getScores = function(result)
        {
            self.lastScoresStartIndex = skip;

            if  (result["success"])
            {
                self.lastScores = [];
                var scores = result["scores"], score, user;
                var i, cnt=scores.length;
                for (i=0; i<cnt; i++)
                {
                    score = scores[i];
                    user = score["user"];
                    self.lastScores.push({
                      "formatted_value": score["formatted_value"],
                      "user": {
                          "id": user["id"], 
                          "name": user["name"],
                          },
                      "value": score["value"],
                    })
                }
            }
            else                
            {
                self.lastScores = null;
            }            
        };
        var cnds = cr.plugins_.Rex_NGIO_Scoreboard.prototype.cnds;
        var callback = getHandler(this, cnds.OnGetScoresSuccess, cnds.OnGetScoresError, getScores);
        var param = {
            "id": this.scoreboardID,
            "limit": limit,
            "period": this.period,
            "skip": skip,
            };
            
        if (this.tag !== "")
            param["tag"] = this.tag;
        
        if (this.socialUser !== null)
        {
            param["social"] = true;
            param["user"] = this.socialUser;
        }
        this.GetNGIO()["callComponent"]("ScoreBoard.getScores", param, callback);        
	};      
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnGetBoardsSuccess= function () { return true; };     
	Cnds.prototype.OnGetBoardsError= function () { return true; };     
	Cnds.prototype.ForEachBoard = function ()
	{
        if (!this.lastBoards)
            return false;
                
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();

		var i, cnt=this.lastBoards.length;
		for(i=0; i<cnt; i++)
		{
            if (solModifierAfterCnds)            
                this.runtime.pushCopySol(current_event.solModifiers);            
            
            this.exp_LoopIndex = i;
            this.exp_CurScore = this.lastBoards[this.exp_LoopIndex]; 
            current_event.retrigger();
            
		    if (solModifierAfterCnds)		    
		        this.runtime.popSol(current_event.solModifiers);		   
		}
     		
		return false;
	};
    
	Cnds.prototype.OnPostScoreSuccess= function () { return true; };     
	Cnds.prototype.OnPostScoreError = function () { return true; }; 

	Cnds.prototype.OnGetScoresSuccess= function () { return true; };     
	Cnds.prototype.OnGetScoresError = function () { return true; }; 
    
	Cnds.prototype.ForEachScore = function (start, end)
	{
        if (!this.lastScores)
            return false;
        
        var r0 = this.lastScoresStartIndex;
        var r1 = this.lastScores.length + r0;
        if (start == null)
            start = r0;
        else
            start = cr.clamp(start, r0, r1);
        
        if (end == null)
            end = r1;
        else
            end = cr.clamp(end, r0, r1);          
                
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();

		var i, cnt=end-start;
		for(i=start; i<cnt; i++)
		{
            if (solModifierAfterCnds)            
                this.runtime.pushCopySol(current_event.solModifiers);            
            
            this.exp_LoopIndex = i - start;         
            this.exp_CurBoard = this.lastScores[this.exp_LoopIndex]; 
            current_event.retrigger();
            
		    if (solModifierAfterCnds)		    
		        this.runtime.popSol(current_event.solModifiers);		   
		}
     		
		return false;
	};    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    var getHandler = function (self, successTrig, errorTrig, callback)
    {      
        var handler =  function(result) 
        {
            if (callback)
                callback(result);
            
            self.lastResult = result;    
            var trig = (result["success"])? successTrig:errorTrig;
            self.runtime.trigger(trig, self);
        };
        return handler;
    };
    
    // Configuration
    Acts.prototype.SetBoardID = function (id)
	{
        this.scoreboardID = id;
	};   
    
    Acts.prototype.SetTag = function (tag)
	{
        this.tag = tag;
	};       
    // Configuration    
    
    Acts.prototype.GetBoards = function ()
	{
        var self=this;
        var getBoards = function(result)
        {
            if (result["success"])
            {
                self.lastBoards = [];                
                var boards = result["scoreboards"], board;
                var i, cnt=boards.length;
                for (i=0; i<cnt; i++)
                {
                    board = boards[i];
                    self.lastBoards.push({
                      "id": board["id"],
                      "name": board["name"]
                    })
                }
            }
            else
                self.lastBoards = null;
        };
                
        var cnds = cr.plugins_.Rex_NGIO_Scoreboard.prototype.cnds;
        var callback = getHandler(this, cnds.OnGetBoardsSuccess, cnds.OnGetBoardsError, getBoards);
        this.GetNGIO()["callComponent"]("ScoreBoard.getBoards", {}, callback);
	};    
    
    Acts.prototype.PostScore = function (value, tag)
	{
        var cnds = cr.plugins_.Rex_NGIO_Scoreboard.prototype.cnds;        
        var callback = getHandler(this, cnds.OnPostScoreSuccess, cnds.OnPostScoreError);
        var param = {
            "id": this.scoreboardID,
            "value": value,
            };
            
        if (this.tag !== "")
            param["tag"] = this.tag;
        this.GetNGIO()["callComponent"]("ScoreBoard.postScore", param, callback);
	};        
    
    // Get scores
    Acts.prototype.SetPeriod = function (period)
	{
        if (typeof(period) === "number" )
            period = periodCode[ period ];
        this.period = period;
	};  

    Acts.prototype.RequestInRange = function (skip, limit)
	{
        this.GetScoresInRange(skip, limit);
	};
    
    Acts.prototype.RequestTurnToPage = function (pageIndex)
	{
        this.pageIndex = pageIndex;
        var skip = this.GetSkip();
        this.GetScoresInRange(skip, this.limit);
	};	 
    
    Acts.prototype.RequestUpdateCurrentPage = function ()
	{
        var skip = this.GetSkip();
        this.GetScoresInRange(skip, this.limit);
	};    
    
    Acts.prototype.RequestTurnToNextPage = function ()
	{
        this.pageIndex += 1;
        var skip = this.GetSkip();
        this.GetScoresInRange(skip, this.limit);
	};     
    
    Acts.prototype.RequestTurnToPreviousPage = function ()
	{
        this.pageIndex -= 1;
        if (this.pageIndex < 0)
            this.pageIndex = 0;
        var skip = this.GetSkip();
        this.GetScoresInRange(skip, this.limit);
	};  
    
    Acts.prototype.ShowAll = function ()
	{
        this.socialUser = null;        
	};  
    Acts.prototype.ShowUser = function (user)
	{
        this.socialUser = user;  // userID or userName
	}; 

    // Get scores    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.ErrorMessage = function (ret)
	{
        var val;
        if (this.lastResult && this.lastResult["error"])
            val = this.lastResult["error"]["message"];
	    ret.set_string(val || "");
	};    

	Exps.prototype.BoardID = function (ret)
	{
	    ret.set_int(this.scoreboardID);
	};    
    
	Exps.prototype.Period = function (ret)
	{
	    ret.set_string(this.period);
	}; 
    
	Exps.prototype.Tag = function (ret)
	{
	    ret.set_string(this.tag);
	}; 

	Exps.prototype.PageIndex = function (ret)
	{
	    ret.set_int(this.pageIndex);
	};        
    
	Exps.prototype.LoopIndex = function (ret)
	{
	    ret.set_int(this.exp_LoopIndex);
	};   
    
	Exps.prototype.BoardsAsJSON = function (ret)
	{
        var val;
        if (this.lastBoards)
            val = JSON.stringify( this.lastBoards );
	    ret.set_string(val || "");
	};	
    
    Exps.prototype.CurBoardID = function (ret)
	{
        var val;
        if (this.exp_CurBoard)
            val = this.exp_CurBoard["id"];
	    ret.set_int(val || 0);
	};    
    
	Exps.prototype.CurBoardName = function (ret)
	{
        var val;
        if (this.exp_CurBoard)
            val = this.exp_CurBoard["name"];
	    ret.set_string(val || "");
	};
    
    Exps.prototype.Index2BoardID = function (ret, index)
	{
        var val;
        if (this.lastBoards && this.lastBoards[index])
            val = this.lastBoards[index]["id"];
	    ret.set_int(val || 0);
	};    
    
	Exps.prototype.Index2BoardName = function (ret, index)
	{
        var val;
        if (this.lastBoards && this.lastBoards[index])
            val = this.lastBoards[index]["name"];
	    ret.set_string(val || "");
	};
    
	Exps.prototype.BoardsCount = function (ret)
	{
        var val;
        if (this.lastBoards)
            val = this.lastBoards.lngth;
	    ret.set_int(val || 0);
	};	      
    
	Exps.prototype.ScoresAsJSON = function (ret)
	{
        var val;
        if (this.lastScores)
            val = JSON.stringify( this.lastScores );
	    ret.set_string(val || "");
	};     
    
	Exps.prototype.CurFormattedValue = function (ret)
	{
        var val;
        if (this.exp_CurScore)
            val = this.exp_CurScore["formatted_value"];
	    ret.set_string(val || "");
	}; 
    
	Exps.prototype.CurUserName = function (ret)
	{
        var val;
        if (this.exp_CurScore)
            val = this.exp_CurScore["user"]["name"];
	    ret.set_string(val || "");
	};   
    
	Exps.prototype.CurUserID = function (ret)
	{
        var val;
        if (this.exp_CurScore)
            val = this.exp_CurScore["user"]["id"];
	    ret.set_int(val || 0);
	};   
    
	Exps.prototype.CurValue = function (ret)
	{
        var val;
        if (this.exp_CurScore)
            val = this.exp_CurScore["value"];
	    ret.set_int(val || 0);
	};    
    
	Exps.prototype.IndexFormattedValue = function (ret, index)
	{
        var val;
        if (this.lastScores && this.lastScores[index])
            val = this.lastScores[index]["formatted_value"];
	    ret.set_string(val || "");
	}; 
    
	Exps.prototype.IndexUserName = function (ret, index)
	{
        var val;
        if (this.lastScores && this.lastScores[index])
            val = this.lastScores[index]["user"]["name"];
	    ret.set_string(val || "");
	};   
    
	Exps.prototype.IndexUserID = function (ret, index)
	{
        var val;
        if (this.lastScores && this.lastScores[index])
            val = this.lastScores[index]["user"]["id"];        
	    ret.set_int(val || 0);
	};   
    
	Exps.prototype.IndexValue = function (ret, index)
	{
        var val;
        if (this.lastScores && this.lastScores[index])
            val = this.lastScores[index]["value"];
	    ret.set_int(val || 0);
	};        
    
	Exps.prototype.CurScoresCount = function (ret)
	{
        var val;
        if (this.lastScores)
            val = this.lastScores.length;
	    ret.set_int(val || 0);
	}; 
   
	Exps.prototype.CurStartIndex = function (ret)
	{
	    ret.set_int(this.lastScoresStartIndex);
	};     
    
    Exps.prototype.ScoresCount = Exps.prototype.CurStartIndex;
    
    
}());