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
        var initPatterns = this.properties[1];
        if (initPatterns != "")        
            this.patterns = JSON.parse(initPatterns);        
        else
            this.patterns = {};	   	                 
	    this.patternsRank = [];
        this.shadowPatterns = {};
        this.startGen(); 	
		this.randomGenObj = null;
        
        this.exp_LastPattern = "";
        this.exp_CurPatternName = "";
        this.exp_LoopIndex = -1;
        
        this.randomGenUid = -1;    // for loading
	};
	
	instanceProto.resetPatternsRank = function(patterns)
	{
	    var pat;
	    // clean this.patternsRank
	    this.patternsRank.length = 0;
	    var pat, count, totalCount=0;
	    // get total count
	    for (pat in patterns)
	    {
	        count = patterns[pat];
	        if (count > 0)
	            totalCount += count;
	    }
	    // set rate
	    for (pat in patterns)
	    {
	        count = patterns[pat];
	        if (count > 0)
	        {
	            this.patternsRank.push(
					{"rate":count/totalCount,
				  	 "pattern":pat}
				);
	        }
	    }
	};
	
	instanceProto.getRandomValue = function()
	{
	    var value = (this.randomGenObj == null)?
			        Math.random(): this.randomGenObj.random();
        return value;
	};	
	
	instanceProto.getRandomPattern = function(pat_rank)
	{
	    var value = this.getRandomValue();
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
		
	instanceProto.startGen = function()
	{
	    var pat,count;
	    // clean shadow patterns
	    for (pat in this.shadowPatterns)
	        delete this.shadowPatterns[pat];
	    // set shadow patterns
	    for (pat in this.patterns)
	    {
	        count = this.patterns[pat];
	        if (count > 0)
	            this.shadowPatterns[pat] = this.patterns[pat];	        
	    }
	    if (this.mode == 1) // random mode
	        this.resetPatternsRank(this.shadowPatterns);
	    this.restartGenFlg = false; 
	};
	
	var isTableEmpty = function(table)
	{
	    var isEmpty=true;
	    var pat;
	    for (pat in table)
	    {
	        isEmpty = false;
	        break;
	    }
	    return isEmpty;
	};
	
	instanceProto.addShadowPattern = function(pattern, inc, max_count)
	{
	    if ((pattern == null) || (inc == 0))
	        return;
	        
        if (!this.shadowPatterns.hasOwnProperty(pattern))                    
            this.shadowPatterns[pattern] = 0;            
                                   
        this.shadowPatterns[pattern] += inc;
        if ((max_count != null) && (this.shadowPatterns[pattern] > max_count))
            this.shadowPatterns[pattern] = max_count 
                
        if (this.shadowPatterns[pattern] <= 0)            
            delete this.shadowPatterns[pattern];
            
        if ((this.mode == 0) && isTableEmpty(this.shadowPatterns))
            this.restartGenFlg = true;
	};	
		
	instanceProto.genPattern = function(pattern)
	{
	    if (this.restartGenFlg)
	        this.startGen();	
	    if (pattern == null)
		{
	        if ((this.mode == 0) || (this.mode == 2))  // shuffle mode
	        {
	            this.resetPatternsRank(this.shadowPatterns);
	            pattern = this.getRandomPattern(this.patternsRank);
	            this.addShadowPattern(pattern, -1);        
	        }
	        else if (this.mode == 1)   // random mode
	        {
	            pattern = this.getRandomPattern(this.patternsRank);
	        }
		}
		else  // force pick
		{
			if (!this.shadowPatterns.hasOwnProperty(pattern))
				pattern = "";	
            else
            {
			    if ((this.mode == 0) || (this.mode == 2))  // shuffle mode
	            {			    
	                this.addShadowPattern(pattern, -1);
			    }
			}
		}
	    return pattern;
	};
    
	instanceProto.getPatternCount = function (name, is_remain)
	{
        var patList = (is_remain)? this.shadowPatterns : this.patterns;
        return patList[name] || 0;
	};    

	instanceProto.saveToJSON = function ()
	{       	 
        var randomGenUid = (this.randomGenObj != null)? this.randomGenObj.uid:(-1);    
		return { "m": this.mode,
		         "pats": this.patterns,
		         "pr": this.patternsRank,
		         "spats": this.shadowPatterns,
		         "rstf": this.restartGenFlg,
                 "randomuid":randomGenUid,
                 "lp" : this.exp_LastPattern,
                 };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.mode = o["m"];
	    this.patterns = o["pats"];
	    this.patternsRank = o["pr"];
	    this.shadowPatterns = o["spats"];
	    this.restartGenFlg = o["rstf"];        
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
		this.randomGenObj = randomGen;
	};
    
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    var prop = [];
        var remain;
        var pat_list = (this.restartGenFlg)? this.patterns : this.shadowPatterns
        for (var pat in this.patterns)
        {
            remain = pat_list[pat] || 0;
	        prop.push({"name": pat, "value": remain +" ("+this.patterns[pat]+")"});
        }
		propsections.push({
			"title": this.type.name,
			"properties": prop
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

    var countAscending = function(a, b)
    {                 
        if (a[1] > b[1])
            return 1;
        else if (a[1] == b[1])
            return 0;
        else  // ay < by
            return (-1);
    };
    var countDescending = function(a, b)
    {                 
        if (a[1] < b[1])
            return 1;
        else if (a[1] == b[1])
            return 0;
        else  // ay < by
            return (-1);
    };
    var nameAscending = function(a, b)
    {                 
        if (a[0] > b[0])
            return 1;
        else if (a[0] == b[0])
            return 0;
        else
            return (-1);
    };
    var nameDescending = function(a, b)
    {                 
        if (a[0] < b[0])
            return 1;
        else if (a[0] == b[0])
            return 0;
        else
            return (-1);
    };        
    var SortFns = [countAscending, countDescending, nameAscending, nameDescending];
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
	    this.restartGenFlg = true;   
	};
		
    Acts.prototype.SetPattern = function (pattern, count)
	{
	    if (pattern == "")
	        return;
        this.patterns[pattern] = count;
        this.restartGenFlg = true;       
	};
	
    Acts.prototype.RemovePattern = function (pattern)
	{  
	    if (pattern in this.patterns)
	        delete this.patterns[pattern];   
        this.restartGenFlg = true;	          
	};	
	
    Acts.prototype.RemoveAllPatterns = function ()
	{  
	    var pattern;
	    for (pattern in this.patterns)
	        delete this.patterns[pattern];   
	    this.restartGenFlg = true;  
	};	
	
    Acts.prototype.StartGenerator = function ()
	{  
	    this.restartGenFlg = true; 
	};
	
    Acts.prototype.Generate = function ()
	{  
        this.exp_LastPattern = this.genPattern();
	};	
    Acts.prototype.AddPattern = function (pattern, count)
	{
	    if (pattern == "")
	        return;
            
        // this.patterns
        if (!this.patterns.hasOwnProperty(pattern))
            this.patterns[pattern] = 0;

        this.patterns[pattern] += count; 

        if (this.restartGenFlg)        
            return;
            
        // pattern gen had started
        
	    if (this.mode == 1) // random mode
	        this.resetPatternsRank(this.shadowPatterns);  
	    else if ((this.mode == 0) || (this.mode == 2))  // shuffle mode   
	        this.addShadowPattern(pattern, count);              
        
      
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
            
        if ((this.mode == 2) && this.restartGenFlg)
            return;
        
        
        
        // pattern gen had started        
        // this.shadowPatterns      
        if (!this.shadowPatterns.hasOwnProperty(pattern))        
            this.shadowPatterns[pattern] = 0;      
        
        this.addShadowPattern(pattern, count, this.patterns[pattern]);              
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
        var randomGenObj = random_gen_objs.getFirstPicked();
        if (randomGenObj.check_name == "RANDOM")
            this.randomGenObj = randomGenObj;        
        else
            alert ("[Pattern generator] This object is not a random generator object.");
	}; 	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.Pattern = function (ret)
	{
        this.exp_LastPattern = this.genPattern();
		ret.set_string(this.exp_LastPattern);
	};	
	
	Exps.prototype.TotalCount = function (ret, pattern)
	{
		ret.set_float(this.getPatternCount(pattern));
	};
	
	Exps.prototype.ManualPick = function (ret, pattern)
	{
		ret.set_string(this.genPattern(pattern));
	};
	
	Exps.prototype.LastPattern = function (ret)
	{
		ret.set_string(this.exp_LastPattern);
	};		
    
	Exps.prototype.RemainCount = function (ret, pattern)
	{
		ret.set_float(this.getPatternCount(pattern, true));
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
		ret.set_float(this.getPatternCount(this.exp_CurPatternName) );
	};     
    
	Exps.prototype.CurPatternRemainCount = function (ret)
	{
		ret.set_float(this.getPatternCount(this.exp_CurPatternName, true) );
	};  
    
	Exps.prototype.LoopIndex = function (ret)
	{
		ret.set_int(this.exp_LoopIndex );
	}; 
    
}());