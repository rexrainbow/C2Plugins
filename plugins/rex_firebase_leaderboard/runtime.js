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
	    
	    this.exp_CurPlayerName = "";
	    this.exp_CurPlayerScore = 0;
	    this.exp_CurPlayerRank = -1;
	    this.exp_PostPlayerName = "";
	    	    
	    this.ref = this.get_ref();
	    this.ranks = [];	    
	    
	    // auto mode
	    this.update_all_ranks_handler = null;	   
	};
	
	instanceProto.get_ref = function()
	{
        return new window["Firebase"](this.rootpath);
	};		
	
	var read_ranks_handler_get = function(self)
	{
        var handler = function (snapshot)
        {
            self.ranks.length = 0;
            var name, ranks=snapshot.val();
            for (name in ranks)
            {
                self.ranks.push([name, ranks[name]]);
            }
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnUpdate, self); 
        };
        return handler;
    };
          
    instanceProto.update_ranks = function (start, end)
	{
	    var ref = this.get_ref();
	    if (this.update_mode == 0)    // manual
	    {
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
			ref["once"]("value", read_ranks_handler_get(this));
	    }
	    else    // auto
	    {
	    }
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
	Cnds.prototype.ForEachRank = function ()
	{	     
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i, cnt=this.ranks.length;		
		this.exp_CurPlayerRank = -1;
        if (this.ranking_order == 0)  // small to large
        {
            for(i=0; i<cnt; i++)
            {
                if (solModifierAfterCnds)
                {
                    this.runtime.pushCopySol(current_event.solModifiers);
                }
                
                this.exp_CurPlayerRank += 1;
	            this.exp_CurPlayerName = this.ranks[i][0];
	            this.exp_CurPlayerScore = this.ranks[i][1];                
		        current_event.retrigger();
		         
		         if (solModifierAfterCnds)
		         {
		             this.runtime.popSol(current_event.solModifiers);
		         }
            }
        }
        else            // large to small
        {
            for(i=cnt-1; i>=0; i--)
            {
                if (solModifierAfterCnds)
                {
                    this.runtime.pushCopySol(current_event.solModifiers);
                }
                
                this.exp_CurPlayerRank += 1;
	            this.exp_CurPlayerName = this.ranks[i][0];
	            this.exp_CurPlayerScore = this.ranks[i][1];                
		        current_event.retrigger();
		         
		        if (solModifierAfterCnds)
		        {
		            this.runtime.popSol(current_event.solModifiers);
		        }
            }                
        }	
                    		
		return false;
	};  	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.PostScore = function (name, score)
	{	    
	    var self = this;
	    var onComplete = function(error) 
	    {
	        self.exp_PostPlayerName = name;
	        var trig = (error)? cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnPostError:
	                            cr.plugins_.Rex_Firebase_Leaderboard.prototype.cnds.OnPostComplete;
	        self.runtime.trigger(trig, self); 
        };	    
	    this.ref["child"](name)["setWithPriority"](score, score, onComplete);
	}; 
	
    Acts.prototype.UpdateAllRanks = function ()
	{
	    this.update_ranks(0,-1);
	}; 	
      
    Acts.prototype.UpdateTopRanks = function (count)
	{	    
	    this.update_ranks(0, count-1);
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.CurPlayerName = function (ret)
	{
		ret.set_string(this.exp_CurPlayerName);
	}; 	
	Exps.prototype.CurPlayerScore = function (ret)
	{
		ret.set_float(this.exp_CurPlayerScore);
	};
	Exps.prototype.CurPlayerRank = function (ret)
	{
		ret.set_int(this.exp_CurPlayerRank);
	};
	Exps.prototype.PostPlayerName = function (ret)
	{
		ret.set_string(this.exp_PostPlayerName);
	}; 	
		 	
}());