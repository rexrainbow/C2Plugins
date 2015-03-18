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
	    
	    this.ranks = this.create_ranks(this.properties[3]==1);
	    
	    this.exp_CurRankCol = null;	    	    
	    this.exp_CurPlayerRank = -1;	    
	    this.exp_PostPlayerName = "";
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
	
	instanceProto.create_ranks = function(isAutoUpdate)
	{
	    var ranks = new window.FirebaseItemListKlass();
	    
	    ranks.isAutoUpdate = isAutoUpdate;
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
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
        
    Acts.prototype.SetDomainRef = function (ref, ID_)
	{
	    this.ranks.StopUpdate();
	    this.rootpath = ref + "/" + ID_ + "/";
	}; 
	
    Acts.prototype.PostScore = function (userID, name, score, extra_data)
	{	    
        var ref = this.get_ref();
	        
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
	    var ref = this.get_ref();
	    ref["child"](userID)["remove"]();
	};	
	
      
    Acts.prototype.StopUpdating = function ()
	{
        this.ranks.StopUpdate();
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
}());

(function ()
{
    if (window.FirebaseItemListKlass != null)
        return;    
    
    var ItemListKlass = function ()
    {
        // export: overwrite these values
        this.isAutoUpdate = true;
        this.keyItemID = "__itemID__";
        this.snapshot2Item = null;
        this.onItemAdd = null;
        this.onItemRemove = null;
        this.onItemChange = null;
        this.onItemsFetch = null;   // manual update, to get all items
        this.onGetIterItem = null;  // used in ForEachItem
        this.extra = {};
        // export: overwrite these values
        
        this.query = null;
        this.items = [];
        this.itemID2Index = {}; 
        
        
        // saved callbacks
        this.add_child_handler = null;
        this.remove_child_handler = null;
        this.change_child_handler = null;
    };
    
    var ItemListKlassProto = ItemListKlass.prototype;    
    
    // export
    ItemListKlassProto.GetItems = function ()
    {
        return this.items;
    };
    
    ItemListKlassProto.GetItemIndexByID = function (itemID)
    {
        return this.itemID2Index[itemID];
    };     
    
    ItemListKlassProto.GetItemByID = function (itemID)
    {
        var i = this.GetItemIndexByID(itemID);
        if (i == null)
            return null;
            
        return this.items[i];
    };  
    
    ItemListKlassProto.Clean = function ()
    {
        this.items.length = 0;
        clean_table(this.itemID2Index); 
    };        
    
    ItemListKlassProto.StartUpdate = function (query)
    {
        this.StopUpdate();            
        this.Clean();        
        var self = this;        
        if (this.isAutoUpdate)
        {
	        var add_child_handler = function (newSnapshot, prevName)
	        {
	            var item = self.add_item(newSnapshot, prevName);
	            self.update_itemID2Index();
	            if (self.onItemAdd)
	                self.onItemAdd(item);
	        };
	        var remove_child_handler = function (snapshot)
	        {
	            var item = self.remove_item(snapshot);
	            self.update_itemID2Index();
	            if (self.onItemRemove)
	                self.onItemRemove(item);
	        };      	        
	        var change_child_handler = function (snapshot, prevName)
	        {
	            var item = self.remove_item(snapshot);
	            self.update_itemID2Index();
	            self.add_item(snapshot, prevName);
	            self.update_itemID2Index();
	            if (self.onItemChange)
	                self.onItemChange(item); 
	        };
	        
	        query["on"]("child_added", add_child_handler);
	        query["on"]("child_removed", remove_child_handler);
	        query["on"]("child_moved", change_child_handler);
	        query["on"]("child_changed", change_child_handler);  
	        
	        this.query = query;
            this.add_child_handler = add_child_handler;
            this.remove_child_handler = remove_child_handler;
            this.change_child_handler = change_child_handler;	        
        }
        else
        {
            var read_item = function(childSnapshot)
            {
	            self.add_item(childSnapshot, null, true);
            };            
            var handler = function (snapshot)
            {           
                snapshot["forEach"](read_item);                
                self.update_itemID2Index();   
                if (self.onItemsFetch)
                    self.onItemsFetch(self.items)
            };
        
			query["once"]("value", handler);
        }
    };
    
    ItemListKlassProto.StopUpdate = function ()
	{
        if (this.query)
        {
            this.query["off"]("child_added", this.add_child_handler);
	        this.query["off"]("child_removed", this.remove_child_handler);
	        this.query["off"]("child_moved", this.change_child_handler);
	        this.query["off"]("child_changed", this.change_child_handler);
            this.add_child_handler = null;
            this.remove_child_handler = null;
            this.change_child_handler = null;	
            //this.query["off"]();
        }
        this.query = null;
	};	
	
	ItemListKlassProto.ForEachItem = function (runtime, start, end)
	{	     
	    if ((start == null) || (start < 0))
	        start = 0; 
	    if ((end == null) || (end > this.items.length - 1))
	        end = this.items.length - 1;
	    
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
                this.onGetIterItem(this.items[i], i);
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        runtime.popSol(current_event.solModifiers);
		    }            
		}
     		
		return false;
	};    	    
	// export
    
    ItemListKlassProto.add_item = function(snapshot, prevName, force_push)
	{
	    var item;
	    if (this.snapshot2Item)
	        item = this.snapshot2Item(snapshot);
	    else
	    {
	        var k = snapshot["key"]();
	        var item = snapshot["val"]();
	        item[this.keyItemID] = k;
	    }
        
        if (force_push === true)
        {
            this.items.push(item);
            return;
        }        
	        
	    if (prevName == null)
	    {
            this.items.unshift(item);
        }
        else
        {
            var i = this.itemID2Index[prevName];
            if (i == this.items.length-1)
                this.items.push(item);
            else
                this.items.splice(i+1, 0, item);
        }
        
        return item;
	};
	
	ItemListKlassProto.remove_item = function(snapshot)
	{
	    var k = snapshot["key"]();
	    var i = this.itemID2Index[k];	 
	    var item = this.items[i];
	    cr.arrayRemove(this.items, i);
	    return item;
	};	  

	ItemListKlassProto.update_itemID2Index = function()
	{
	    clean_table(this.itemID2Index);
	    var i,cnt = this.items.length;
	    for (i=0; i<cnt; i++)
	    {
	        this.itemID2Index[this.items[i][this.keyItemID]] = i;
	    }	
	};
		  
	var clean_table = function (o)
	{
	    var k;
	    for (k in o)
	        delete o[k];
	};
	
	window.FirebaseItemListKlass = ItemListKlass;
}()); 