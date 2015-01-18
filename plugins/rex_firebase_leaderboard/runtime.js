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
	
	instanceProto.get_ref = function(k)
	{
	    if (k == null)
	        k = "";
	        
	    var path;
	    if (k.substring(0,8) == "https://")
	        path = k;
	    else
	        path = this.rootpath + k + "/";
	        
        return new window["Firebase"](path);
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
	        this.UserID2rank[this.ranks[i]["userID"]] = i;
	    }	
	};    
    
	instanceProto.add_rank = function(snapshot, prevName, force_push)
	{
	    var k = snapshot["key"]();
	    var v = snapshot["val"]();
	    v["userID"] = k;
        
        if (force_push === true)
        {
            this.ranks.push(v);
            return;
        }
        
	    if (prevName == null)
	    {
            this.ranks.unshift(v);
        }
        else
        {
            var i = this.UserID2rank[prevName];
            if (i == this.ranks.length-1)
                this.ranks.push(v);
            else
                this.ranks.splice(i+1, 0, v);
        }
	}; 
	
	instanceProto.remove_rank = function(snapshot)
	{
	    var k = snapshot["key"]();
	    var i = this.UserID2rank[k];
	    cr.arrayRemove(this.ranks, i);
	};

    instanceProto.update_ranks = function (count)
	{
	    var ref = this.get_ref();
        ref["off"]();
        this.ranks.length = 0; 
	    
		if (count == -1)  // update all
		{
	         // no filter
		}
		else
		{
		    ref = ref["orderByPriority"]()["limitToFirst"](count);
		}
			
	    if (this.update_mode == 0)    // manual
	    {	      
            var self = this;
            var read_item = function(childSnapshot)
            {
	            self.add_rank(childSnapshot, null, true);
            };            
            var handler = function (snapshot)
            {           
                snapshot["forEach"](read_item);                
                self.update_UserID2Rank();                
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnUpdate, self); 
            };
        
	        
			ref["once"]("value", handler);
	    }
	    else    // auto
	    {        
	        var self = this;	        
	        var add_child_handler = function (newSnapshot, prevName)
	        {
	            self.add_rank(newSnapshot, prevName);
	            self.update_UserID2Rank();
	            self.runtime.trigger(cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnUpdate, self); 
	        };
	        var remove_child_handler = function (snapshot)
	        {
	            self.remove_rank(snapshot);
	            self.update_UserID2Rank();
	            self.runtime.trigger(cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnUpdate, self); 
	        };      	        
	        var change_child_handler = function (snapshot, prevName)
	        {
	            self.remove_rank(snapshot);
	            self.update_UserID2Rank();
	            self.add_rank(snapshot, prevName);
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
	    if ((start == null) || (start < 0))
	        start = 0; 
	    if ((end == null) || (end > this.ranks.length - 1))
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
        var save_data = {"name":name, 
                         "score":score, 
                         "extra": save_extra_data,
                         "updateAt": window["Firebase"]["ServerValue"]["TIMESTAMP"]
                        };
        var priority = (this.ranking_order == 0)? score:-score;
	    ref["child"](userID)["setWithPriority"](save_data, priority, onComplete);
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
	    var ref = this.get_post_ref();
	    ref["child"](userID)["remove"]();
	};	
	
      
    Acts.prototype.StopUpdating = function ()
	{
        this.get_ref()["off"]();
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
	    
		ret.set_string(this.exp_CurRankCol["name"]);
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
	
	Exps.prototype.RankCount = function (ret)
	{
		ret.set_int(this.ranks.length);
	}; 	
	Exps.prototype.UserID2Rank = function (ret, userID)
	{
	    var rank = this.UserID2rank[userID];
	    if (rank == null)
	        rank = -1;    
		ret.set_int(rank);
	};
	   	
	Exps.prototype.Rank2PlayerName = function (ret, i)
	{
	    var rank_info = this.rank_info_get(i);
	    var name = (!rank_info)? "":rank_info["name"];
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