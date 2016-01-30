// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_PatternGen = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_PatternGen.prototype;
		
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
	    this.mode = this.properties[0];
        var init_patterns = this.properties[1];
        if (init_patterns != "")        
            this.patterns = JSON.parse(init_patterns);        
        else
            this.patterns = {};	   	                 
	    this._pat_rank = [];
        this._shadow_patterns = {};
        this.start_gen(); 	
		this.random_gen = null;
        
        this.exp_LastPattern = "";
        this.exp_CurPatternName = "";
        this.exp_LoopIndex = -1;
        
        this.randomGenUid = -1;    // for loading
        
        /**BEGIN-PREVIEWONLY**/
        this.propsections = [];      
        /**END-PREVIEWONLY**/           
	};
	
	instanceProto.reset_pat_rank = function(patterns)
	{
	    var pat;
	    // clean this._pat_rank
	    this._pat_rank.length = 0;
	    var pat, count, total_count=0;
	    // get total count
	    for (pat in patterns)
	    {
	        count = patterns[pat];
	        if (count > 0)
	            total_count += count;
	    }
	    // set rate
	    for (pat in patterns)
	    {
	        count = patterns[pat];
	        if (count > 0)
	        {
	            this._pat_rank.push({"rate":count/total_count,
	                                 "pattern":pat});
	        }
	    }
	};
	
	instanceProto.get_random_value = function()
	{
	    var value = (this.random_gen == null)?
			        Math.random(): this.random_gen.random();
        return value;
	};	
	
	instanceProto.get_rand_pattern = function(pat_rank)
	{
	    var value = this.get_random_value();
	    var pattern="", i, cnt=pat_rank.length;
	    for (i=0; i<cnt; i++)
	    {
	        value -= pat_rank[i]["rate"];
	        if (value < 0)
	        {
	            pattern = pat_rank[i]["pattern"];
	            break;
	        }
	    }
	    return pattern;
	};
		
	instanceProto.start_gen = function()
	{
	    var pat,count;
	    // clean shadow patterns
	    for (pat in this._shadow_patterns)
	        delete this._shadow_patterns[pat];
	    // set shadow patterns
	    for (pat in this.patterns)
	    {
	        count = this.patterns[pat];
	        if (count > 0)
	            this._shadow_patterns[pat] = this.patterns[pat];	        
	    }
	    if (this.mode == 1) // random mode
	        this.reset_pat_rank(this._shadow_patterns);
	    this.restart_gen_flg = false; 
	};
	
	var is_hash_empty = function(hash_obj)
	{
	    var is_empty=true;
	    var pat;
	    for (pat in hash_obj)
	    {
	        is_empty = false;
	        break;
	    }
	    return is_empty;
	};
	
	instanceProto.add_shadow_patterns = function(pattern, inc, max_count)
	{
	    if ((pattern == null) || (inc == 0))
	        return;
	        
        if (!this._shadow_patterns.hasOwnProperty(pattern))                    
            this._shadow_patterns[pattern] = 0;            
                                   
        this._shadow_patterns[pattern] += inc;
        if ((max_count != null) && (this._shadow_patterns[pattern] > max_count))
            this._shadow_patterns[pattern] = max_count 
                
        if (this._shadow_patterns[pattern] <= 0)            
            delete this._shadow_patterns[pattern];
            
        if ((this.mode == 0) && is_hash_empty(this._shadow_patterns))
            this.restart_gen_flg = true;
	};	
		
	instanceProto.get_pattern = function(pattern)
	{
	    if (this.restart_gen_flg)
	        this.start_gen();	
	    if (pattern == null)
		{
	        if ((this.mode == 0) || (this.mode == 2))  // shuffle mode
	        {
	            this.reset_pat_rank(this._shadow_patterns);
	            pattern = this.get_rand_pattern(this._pat_rank);
	            this.add_shadow_patterns(pattern, -1);        
	        }
	        else if (this.mode == 1)   // random mode
	        {
	            pattern = this.get_rand_pattern(this._pat_rank);
	        }
		}
		else  // force pick
		{
			if (!this._shadow_patterns.hasOwnProperty(pattern))
				pattern = "";	
            else
            {
			    if ((this.mode == 0) || (this.mode == 2))  // shuffle mode
	            {			    
	                this.add_shadow_patterns(pattern, -1);
			    }
			}
		}
	    return pattern;
	};
    
	instanceProto.get_pattern_count = function (name, is_remain)
	{
        var patList = (is_remain)? this._shadow_patterns : this.patterns;
        return patList[name] || 0;
	};    

	instanceProto.saveToJSON = function ()
	{       	 
        var randomGenUid = (this.random_gen != null)? this.random_gen.uid:(-1);    
		return { "m": this.mode,
		         "pats": this.patterns,
		         "pr": this._pat_rank,
		         "spats": this._shadow_patterns,
		         "rstf": this.restart_gen_flg,
                 "randomuid":randomGenUid,
                 "lp" : this.exp_LastPattern,
                 };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.mode = o["m"];
	    this.patterns = o["pats"];
	    this._pat_rank = o["pr"];
	    this._shadow_patterns = o["spats"];
	    this.restart_gen_flg = o["rstf"];        
        this.randomGenUid = o["randomuid"];	
        this.exp_LastPattern = o["lp"];	
	};	
    
	instanceProto.afterLoad = function ()
	{
        var randomGen;
		if (this.randomGenUid === -1)
			randomGen = null;
		else
		{
			randomGen = this.runtime.getObjectByUID(this.randomGenUid);
			assert2(randomGen, "Pattern gen: Failed to find random gen object by UID");
		}		
		this.randomGenUid = -1;			
		this.random_gen = randomGen;
	};
    
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    this.propsections.length = 0;
        var remain;
        var pat_list = (this.restart_gen_flg)? this.patterns : this._shadow_patterns
        for (var pat in this.patterns)
        {
            remain = pat_list[pat] || 0;
	        this.propsections.push({"name": pat, "value": remain +" ("+this.patterns[pat]+")"});
        }
		propsections.push({
			"title": this.type.name,
			"properties": this.propsections
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

    var CountAscending = function(a, b)
    {                 
        if (a[1] > b[1])
            return 1;
        else if (a[1] == b[1])
            return 0;
        else  // ay < by
            return (-1);
    };
    var CountDescending = function(a, b)
    {                 
        if (a[1] < b[1])
            return 1;
        else if (a[1] == b[1])
            return 0;
        else  // ay < by
            return (-1);
    };
    var NameAscending = function(a, b)
    {                 
        if (a[0] > b[0])
            return 1;
        else if (a[0] == b[0])
            return 0;
        else
            return (-1);
    };
    var NameDescending = function(a, b)
    {                 
        if (a[0] < b[0])
            return 1;
        else if (a[0] == b[0])
            return 0;
        else
            return (-1);
    };        
    var SortFns = [CountAscending, CountDescending, NameAscending, NameDescending];
	Cnds.prototype.ForEachPattern = function (m)
	{	    
	    var l = [];
	    for (var n in this.patterns)	    
	        l.push([n, this.patterns[n]]);
	    
	    l.sort(SortFns[m]);
	    
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i, cnt=l.length;
		for(i=0; i<cnt; i++)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurPatternName = l[i][0];
            this.exp_LoopIndex = i;
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
        
        this.exp_CurPatternName = "";
    		
		return false;
	};    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.SetMode = function (m)
	{
	    this.mode = m;
	    this.restart_gen_flg = true;   
	};
		
    Acts.prototype.SetPattern = function (pattern, count)
	{
	    if (pattern == "")
	        return;
        this.patterns[pattern] = count;
        this.restart_gen_flg = true;       
	};
	
    Acts.prototype.RemovePattern = function (pattern)
	{  
	    if (pattern in this.patterns)
	        delete this.patterns[pattern];   
        this.restart_gen_flg = true;	          
	};	
	
    Acts.prototype.RemoveAllPatterns = function ()
	{  
	    var pattern;
	    for (pattern in this.patterns)
	        delete this.patterns[pattern];   
	    this.restart_gen_flg = true;  
	};	
	
    Acts.prototype.StartGenerator = function ()
	{  
	    this.restart_gen_flg = true; 
	};
	
    Acts.prototype.Generate = function ()
	{  
        this.exp_LastPattern = this.get_pattern();
	};	
    Acts.prototype.AddPattern = function (pattern, count)
	{
	    if (pattern == "")
	        return;
            
        // this.patterns
        if (!this.patterns.hasOwnProperty(pattern))
            this.patterns[pattern] = 0;

        this.patterns[pattern] += count; 

        if (this.restart_gen_flg)        
            return;
            
        // pattern gen had started
        
	    if (this.mode == 1) // random mode
	        this.reset_pat_rank(this._shadow_patterns);  
	    else if ((this.mode == 0) || (this.mode == 2))  // shuffle mode   
	        this.add_shadow_patterns(pattern, count);              
        
      
	};
	
    Acts.prototype.PutPatternBack = function (pattern, count)
	{
	    if (this.mode == 1) // random mode
	        return;
	        
	    if (pattern == "")
	        return;
            
        // this.patterns
        if (!this.patterns.hasOwnProperty(pattern))        
            return;
            
        if ((this.mode == 2) && this.restart_gen_flg)
            return;
        
        
        
        // pattern gen had started        
        // this._shadow_patterns      
        if (!this._shadow_patterns.hasOwnProperty(pattern))        
            this._shadow_patterns[pattern] = 0;      
        
        this.add_shadow_patterns(pattern, count, this.patterns[pattern]);              
	};	
    
	Acts.prototype.JSONLoad = function (json_)
	{
		var o;
		
		try {
			o = JSON.parse(json_);
		}
		catch(e) { return; }
		
		this.loadFromJSON(o);		
	};
		
    Acts.prototype.SetRandomGenerator = function (random_gen_objs)
	{
        var random_gen = random_gen_objs.instances[0];
        if (random_gen.check_name == "RANDOM")
            this.random_gen = random_gen;        
        else
            alert ("[Pattern generator] This object is not a random generator object.");
	}; 	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.Pattern = function (ret)
	{
        this.exp_LastPattern = this.get_pattern();
		ret.set_string(this.exp_LastPattern);
	};	
	
	Exps.prototype.TotalCount = function (ret, pattern)
	{
		ret.set_float(this.get_pattern_count(pattern));
	};
	
	Exps.prototype.ManualPick = function (ret, pattern)
	{
		ret.set_string(this.get_pattern(pattern));
	};
	
	Exps.prototype.LastPattern = function (ret)
	{
		ret.set_string(this.exp_LastPattern);
	};		
    
	Exps.prototype.RemainCount = function (ret, pattern)
	{
		ret.set_float(this.get_pattern_count(pattern, true));
	};
    
	Exps.prototype.AsJSON = function (ret)
	{
		ret.set_string(JSON.stringify(this.saveToJSON()));
	};
    
	Exps.prototype.CurPatternName = function (ret)
	{
		ret.set_string(this.exp_CurPatternName);
	};    
    
	Exps.prototype.CurPatternTotalCount = function (ret)
	{
		ret.set_float(this.get_pattern_count(this.exp_CurPatternName) );
	};     
    
	Exps.prototype.CurPatternRemainCount = function (ret)
	{
		ret.set_float(this.get_pattern_count(this.exp_CurPatternName, true) );
	};  
    
	Exps.prototype.LoopIndex = function (ret)
	{
		ret.set_int(this.exp_LoopIndex );
	}; 
    
}());