/*
<UserID>
    name - user name
	score - score
	extra - extra data like photo
	updateAt - timestamp of last score updating
*/
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
	    
	    this.ranks = this.create_ranks(this.properties[3]==1);
	    
	    this.exp_CurRankCol = null;	    	    
	    this.exp_CurPlayerRank = -1;	
        
	    this.exp_PostPlayerName = "";
        this.exp_PostPlayerScore = 0;
        this.exp_PostPlayerUserID = "";        
        this.exp_PostExtraData = "";

		this.exp_LastUserID = "";
		this.exp_LastScore = 0;
		this.exp_LastPlayerName = "";		
	};
	
	instanceProto.onDestroy = function ()
	{		
	    this.ranks.StopUpdate(); 	    
	};
	
    // 2.x , 3.x    
	var isFirebase3x = function()
	{ 
        return (window["FirebaseV3x"] === true);
    };
    
    var isFullPath = function (p)
    {
        return (p.substring(0,8) === "https://");
    };
	
	instanceProto.get_ref = function(k)
	{
        if (k == null)
	        k = "";
	    var path;
	    if (isFullPath(k))
	        path = k;
	    else
	        path = this.rootpath + k + "/";
            
        // 2.x
        if (!isFirebase3x())
        {
            return new window["Firebase"](path);
        }  
        
        // 3.x
        else
        {
            var fnName = (isFullPath(path))? "refFromURL":"ref";
            return window["Firebase"]["database"]()[fnName](path);
        }
        
	};
    
    var get_key = function (obj)
    {       
        return (!isFirebase3x())?  obj["key"]() : obj["key"];
    };
    
    var get_root = function (obj)
    {       
        return (!isFirebase3x())?  obj["root"]() : obj["root"];
    };
    
    var serverTimeStamp = function ()
    {       
        if (!isFirebase3x())
            return window["Firebase"]["ServerValue"]["TIMESTAMP"];
        else
            return window["Firebase"]["database"]["ServerValue"];
    };       

    var get_timestamp = function (obj)    
    {       
        return (!isFirebase3x())?  obj : obj["TIMESTAMP"];
    };    
    // 2.x , 3.x  
	
	instanceProto.create_ranks = function(isAutoUpdate)
	{
	    var ranks = new window.FirebaseItemListKlass();
	    
	    ranks.updateMode = (isAutoUpdate)? ranks.AUTOCHILDUPDATE : ranks.MANUALUPDATE;
	    ranks.keyItemID = "userID";
	    
	    var self = this;
	    var on_update = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnUpdate, self); 
	    };	    
	    ranks.onItemsFetch = on_update;
        ranks.onItemAdd = on_update;
        ranks.onItemRemove = on_update;
        ranks.onItemChange = on_update;
        
	    var onGetIterItem = function(item, i)
	    {
	        self.exp_CurRankCol = item;
	        self.exp_CurPlayerRank = i;
	    };
	    ranks.onGetIterItem = onGetIterItem; 
	           
        return ranks;
    };
	
    instanceProto.update_ranks = function (count)
	{
	    var query = this.get_ref();
		if (count == -1)  // update all
		{
	         // no filter
		}
		else
		{
		    query = query["orderByPriority"]()["limitToFirst"](count);
		}
		
		this.ranks.StartUpdate(query);
	}; 
	
    var get_extraData = function (extra_data)
    {
        var save_extra_data;   
        if (extra_data == "")
        {
            save_extra_data = null;
        }
        else
        {
            try
            {
	            save_extra_data = JSON.parse(extra_data) 
            }
            catch(err)
            {
                save_extra_data = extra_data;
            }
        }
        return save_extra_data;
    }
    instanceProto.post_score = function (userID, name, score, extra_data)
	{	    
        extra_data = get_extraData(extra_data);

	    var self = this;
	    var onComplete = function(error) 
	    {
            self.onPostComplete.call(self, error, userID, name, score, extra_data);
        };
        
        var save_data = {"name":name, 
                         "score":score, 
                         "extra": extra_data,
                         "updateAt": serverTimeStamp()
                        };
        var priority = (this.ranking_order == 0)? score:-score;
        var ref = this.get_ref();        
	    ref["child"](userID)["setWithPriority"](save_data, priority, onComplete);
	};  

	instanceProto.onPostComplete = function(error, userID, name, score, extra_data) 
	{
	    this.exp_PostPlayerName = name;
        this.exp_PostPlayerScore = score;
        this.exp_PostPlayerUserID = userID;        
        this.exp_PostExtraData = extra_data;             
	    var trig = (error)? cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnPostError:
	                        cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnPostComplete;
	    this.runtime.trigger(trig, this); 
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
		return this.ranks.ForEachItem(this.runtime, start, end);
	};  	

	Cnds.prototype.OnGetScore = function ()
	{
	    return true;
	}; 	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
        
    Acts.prototype.SetDomainRef = function (ref, ID_)
	{
	    this.ranks.StopUpdate();
	    this.rootpath = ref + "/" + ID_ + "/";
	}; 
	
    Acts.prototype.PostScore = function (userID, name, score, extra_data, post_cond)
	{
        if (post_cond !== 0)
        {
            var self=this;
            var onReadScore = function(snapshot)
            {
                var preScore = snapshot["val"]();
                var doPosting;  
                if (post_cond === 1)
                    doPosting = (score > preScore);
                else if (post_cond === 2)
                    doPosting = (score < preScore);    
                else if (post_cond === 3)
                    doPosting = (preScore == null) ;                     
                
                if (doPosting)
                    self.post_score(userID, name, score, extra_data);
                else
                {
                    self.onPostComplete.call(self, false, userID, name, preScore, extra_data);
                }
            };
            var ref = this.get_ref()["child"](userID)["child"]("score");        
	        ref["once"]("value", onReadScore)
        }
        else
        {
            this.post_score(userID, name, score, extra_data);
        }
	}; 
	
    Acts.prototype.UpdateAllRanks = function ()
	{
	    this.update_ranks(-1);
	}; 	
      
    Acts.prototype.UpdateTopRanks = function (count)
	{	    
	    this.update_ranks(count);
	};
	
    Acts.prototype.RemovePost = function (userID)
	{	    
	    var ref = this.get_ref();
	    ref["child"](userID)["remove"]();
	};	
	      
    Acts.prototype.StopUpdating = function ()
	{
        this.ranks.StopUpdate();
	};	
    
    Acts.prototype.AddScore = function (userID, name, scoreAddTo, extra_data)
	{
        extra_data = get_extraData(extra_data);

	    var self = this;
	    var on_complete = function(error, committed, snapshot) 
	    {
            var val = snapshot["val"]();
            self.onPostComplete.call(self, error, userID, name, val["score"], extra_data);
        };

        var on_transaction = function (currentValue)
        {
            var old_score = (currentValue == null)? 0: currentValue["score"];
            var new_score = old_score + scoreAddTo;
            var save_data = {"name":name, 
                                       "score":new_score, 
                                       "extra": extra_data,
                                       "updateAt": serverTimeStamp()
                                      };
            var priority = (self.ranking_order == 0)? new_score:-new_score;
            return { '.value': save_data, '.priority': priority };
        };
        var ref = this.get_ref();        
	    ref["child"](userID)["transaction"](on_transaction, on_complete);		
	};    

    Acts.prototype.GetScore = function (userID)
	{
        var self=this;
        var onReadUserID = function(snapshot)
        {
			var userData = snapshot["val"]();
            if (userData)
			{
				self.exp_LastUserID = userID;
				self.exp_LastScore = userData["score"];
				self.exp_LastPlayerName = userData["name"];
			}
			else
			{
				self.exp_LastUserID = "";
				self.exp_LastScore = 0;
				self.exp_LastPlayerName = "";
			}
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnGetScore, self);			
        };
		var ref = this.get_ref()["child"](userID);
		ref["once"]("value", onReadUserID);
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.CurPlayerName = function (ret)
	{
	    var name;	    
	    if (this.exp_CurRankCol != null)
	        name = this.exp_CurRankCol["name"];
	    else
	        name = "";
	    
		ret.set_string(name);
	}; 	
	Exps.prototype.CurPlayerScore = function (ret)
	{
	    var score;	    
	    if (this.exp_CurRankCol != null)
	        score = this.exp_CurRankCol["score"];
	    else
	        score = 0;
	        	    
		ret.set_any(score);
	};
	Exps.prototype.CurPlayerRank = function (ret)
	{
		ret.set_int(this.exp_CurPlayerRank);
	};
	Exps.prototype.CurUserID = function (ret)
	{
	    var userID;	    
	    if (this.exp_CurRankCol != null)
	        userID = this.exp_CurRankCol["userID"];
	    else
	        userID = "";

		ret.set_string(this.exp_CurRankCol["userID"]);
	}; 	
	Exps.prototype.CurExtraData = function (ret)
	{
	    var extra_data = this.exp_CurRankCol["extra"];
	    if (extra_data == null)
	    {
	        extra_data = "";
	    }
	    else if (typeof(extra_data) == "object")
	    {
	        extra_data = JSON.stringify(extra_data);
	        this.exp_CurRankCol["extra"] = extra_data; 
	    }

		ret.set_any(extra_data);
	};

		
	Exps.prototype.PostPlayerName = function (ret)
	{
		ret.set_string(this.exp_PostPlayerName);
	}; 	

	Exps.prototype.PostPlayerScore = function (ret)
	{
		ret.set_any(this.exp_PostPlayerScore);    
	}; 		
	Exps.prototype.PostPlayerUserID = function (ret)
	{
		ret.set_string(this.exp_PostPlayerUserID);    
	}; 	
				
	Exps.prototype.PostExtraData = function (ret)
	{
		ret.set_any(this.exp_PostExtraData);    
	};    
	
	Exps.prototype.RankCount = function (ret)
	{
		ret.set_int(this.ranks.GetItems().length);
	}; 	
	Exps.prototype.UserID2Rank = function (ret, userID)
	{
	    var rank = this.ranks.GetItemIndexByID(userID);
	    if (rank == null)
	        rank = -1;    
		ret.set_int(rank);
	};
	   	
	Exps.prototype.Rank2PlayerName = function (ret, i)
	{
	    var rank_info = this.ranks.GetItems()[i];
	    var name = (!rank_info)? "":rank_info["name"];
		ret.set_string(name);
	};
	Exps.prototype.Rank2PlayerScore = function (ret, i)
	{
	    var rank_info = this.ranks.GetItems()[i];
	    var score = (!rank_info)? "":rank_info["score"];
		ret.set_any(score);
	};	
	Exps.prototype.Rank2ExtraData = function (ret, i)
	{
	    var rank_info = this.ranks.GetItems()[i];
	    var extra_data = (!rank_info)? "":rank_info["extra"];
		ret.set_any(extra_data);
	};
	Exps.prototype.Rank2PlayerUserID = function (ret, i)
	{
	    var rank_info = this.ranks.GetItems()[i];
	    var extra_data = (!rank_info)? "":rank_info["userID"];
		ret.set_any(extra_data);
	};	

	Exps.prototype.LastUserID = function (ret)
	{
		ret.set_string(this.exp_LastUserID);
	};	    
	Exps.prototype.LastScore = function (ret)
	{
		ret.set_any(this.exp_LastScore);
	};		
	Exps.prototype.LastPlayerName = function (ret)
	{
		ret.set_any(this.exp_LastPlayerName);
	};									 	
}());