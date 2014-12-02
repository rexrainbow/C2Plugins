// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_Leaderboard = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var input_text = "";
	var pluginProto = cr.plugins_.Rex_Firebase_Leaderboard.prototype;
		
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
	    jsfile_load("firebase.js");
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
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/";
		this.ranking_order = this.properties[2];
	    this.update_mode = this.properties[3];
	    
	    this.exp_CurPlayerRank = -1;
	    this.exp_CurRankCol = null;
	    this.exp_PostPlayerName = "";
	    	    
	    this.post_ref = null;
	    this.ranks = [];	
	    this.UserID2rank = {};
	    
	    // auto mode
	    this.update_all_ranks_handler = null;	   
	};
	
	instanceProto.get_ref = function()
	{
        return new window["Firebase"](this.rootpath);
	};	
	
	instanceProto.get_post_ref = function()
	{
	    if (this.post_ref == null)
	        this.post_ref = this.get_ref();
	    
	    return this.post_ref;
	};			
	       
	instanceProto.update_UserID2Rank = function()
	{
	    clean_table(this.UserID2rank);	    
	    var i,cnt = this.ranks.length;
	    for (i=0; i<cnt; i++)
	    {
	        this.UserID2rank[this.ranks[i].userID] = i;
	    }	
	};    
    
	instanceProto.add_a_rank = function(snapshot)
	{
	    var UserID = snapshot.key();
	    var read_info = snapshot.val();
        this.ranks.push(read_info);
	}; 
	
	instanceProto.remove_a_rank = function(snapshot)
	{
	    var i = this.UserID2rank[snapshot.key()];
	    cr.arrayRemove(this.ranks, i);
	};
	
	instanceProto.update_a_rank = function(snapshot)
	{
	    var i = this.UserID2rank[snapshot.key()];
	    var rank = this.ranks[i];
	    var read_info = snapshot.val();
	    rank.name = read_info["name"];
	    rank.score = read_info["score"];
	    rank.extra = read_info["extra"];
	    rank.timestamp = read_info["timestamp"];
	};	 	
	
	// large to small, old to new
    var SORT_SCORE = function(ra, rb)
    {        
        var scoreA = ra["score"];
        var scoreB = rb["score"];
        if (scoreA == scoreB)
        {
            var timeA = ra["timestamp"];
            var timeB = rb["timestamp"];
            if (timeA < timeB)
                return 1;
            else if (timeA > timeB)
                return -1;
            else
                return 0;
        }
        else if (scoreA > scoreB)        
            return 1;        
        else if (scoreA < scoreB)        
            return -1;        
    }	
	instanceProto.sort_ranks = function()
	{
	    this.ranks.sort(SORT_SCORE);
	};	   
          
    instanceProto.update_ranks = function (start, end)
	{
	    var ref = this.get_ref();
	    
		if (end == -1)  // update all
		{
	         // no filter
		}
		else
		{	
            var count = end + 1;
            var limit_cb = (this.ranking_order == 0)? "limitToFirst":"limitToLast";
		    ref = ref["orderByPriority"]()[limit_cb](count);
		}
			
	    if (this.update_mode == 0)    // manual
	    {	    
	            
            var self = this;
            var handler = function (snapshot)
            {
                self.ranks.length = 0;            
                var UserID, read_info=snapshot.val(), rank_info;
                for (UserID in read_info)
                {           
                    self.ranks.push(read_info[UserID]);
                }
                
                self.sort_ranks();
                self.update_UserID2Rank();                
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnUpdate, self); 
            };
        
	        
			ref["once"]("value", handler);
	    }
	    else    // auto
	    {        
	        ref["off"]();
	        var self = this;	        
	        var add_child_handler = function (snapshot)
	        {
	            self.add_a_rank(snapshot);
	            self.sort_ranks();
	            self.update_UserID2Rank();
	            self.runtime.trigger(cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnUpdate, self); 
	        };
	        var remove_child_handler = function (snapshot)
	        {
	            self.remove_a_rank(snapshot);
	            self.sort_ranks();
	            self.update_UserID2Rank();
	            self.runtime.trigger(cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnUpdate, self); 
	        } 	        
	        var change_child_handler = function (snapshot)
	        {
	            self.update_a_rank(snapshot);
	            self.sort_ranks();
	            self.update_UserID2Rank();
	            self.runtime.trigger(cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnUpdate, self); 
	        };
	        
	        ref["on"]("child_added", add_child_handler);
	        ref["on"]("child_removed", remove_child_handler);
	        ref["on"]("child_moved", change_child_handler);
	        ref["on"]("child_changed", change_child_handler);
	    }
	}; 
	
	instanceProto.rank_info_get = function(i)
	{
	    if (this.ranking_order == 1)
	        i = this.ranks.length - 1 - i;
	    
	    return this.ranks[i];
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
	
	instanceProto.UserID2Rank = function (userID)
	{	    
	    var rank = this.UserID2rank[userID];
	    if (rank === null)
	        rank = -1;
	    else if (this.ranking_order == 1)
	        rank = this.ranks.length - 1 - rank;	        
		
		return rank;
	};	
	
	var clean_table = function (o)
	{
	    var k;
	    for (k in o)
	        delete o[k];
	}	
		
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
	    if ((start === null) || (start < 0))
	        start = 0; 
	    if ((end === null) || (end > this.ranks.length - 1))
	        end = this.ranks.length - 1;

		return this.for_each_bank_in_range(start, end);
	};  	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.PostScore = function (userID, name, score, extra_data)
	{	    
        var ref = this.get_post_ref();
	        
	    var self = this;
	    var onComplete = function(error) 
	    {
	        self.exp_PostPlayerName = name;
	        var trig = (error)? cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnPostError:
	                            cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnPostComplete;
	        self.runtime.trigger(trig, self); 
        };	    
        var save_data = {"userID": userID,
                         "userName":name, 
                         "score":score, 
                         "extra": extra_data,
                         "timestamp": window["Firebase"]["ServerValue"]["TIMESTAMP"]
                        };
	    ref["child"](userID)["setWithPriority"](save_data, score, onComplete);
	}; 
	
    Acts.prototype.UpdateAllRanks = function ()
	{
	    this.update_ranks(0,-1);
	}; 	
      
    Acts.prototype.UpdateTopRanks = function (count)
	{	    
	    this.update_ranks(0, count-1);
	};
	
    Acts.prototype.RemovePost = function (userID)
	{	    
	    var ref = this.get_post_ref();
	    ref["child"](userID)["remove"]();
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
	    
		ret.set_string(this.exp_CurRankCol["userName"]);
	}; 	
	Exps.prototype.CurPlayerScore = function (ret)
	{
	    if (this.exp_CurRankCol == null)
	    {
	        ret.set_any(0);
	        return;
	    }
	    
		ret.set_any(this.exp_CurRankCol["score"]);
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
	    
		ret.set_string(this.exp_CurRankCol["userID"]);
	}; 	
	Exps.prototype.CurExtraData = function (ret)
	{
	    if (this.exp_CurRankCol == null)
	    {
	        ret.set_any("");
	        return;
	    }
	    
		ret.set_any(this.exp_CurRankCol["extra"]);
	};

		
	Exps.prototype.PostPlayerName = function (ret)
	{
		ret.set_string(this.exp_PostPlayerName);
	}; 	
	
	Exps.prototype.RankCount = function (ret)
	{
		ret.set_int(this.ranks.length);
	}; 	
	Exps.prototype.UserID2Rank = function (ret, userID)
	{
		ret.set_int(this.UserID2Rank(userID));
	};
	   	
	Exps.prototype.Rank2PlayerName = function (ret, i)
	{
	    var rank_info = this.rank_info_get(i);
	    var name = (!rank_info)? "":rank_info["userName"];
		ret.set_string(name);
	};
	Exps.prototype.Rank2PlayerScore = function (ret, i)
	{
	    var rank_info = this.rank_info_get(i);    
	    var score = (!rank_info)? "":rank_info["score"];
		ret.set_any(score);
	};	
	Exps.prototype.Rank2ExtraData = function (ret, i)
	{
	    var rank_info = this.rank_info_get(i);	    
	    var extra_data = (!rank_info)? "":rank_info["extra"];
		ret.set_any(extra_data);
	};						 	
}());