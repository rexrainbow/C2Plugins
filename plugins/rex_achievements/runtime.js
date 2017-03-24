// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Achievements = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Achievements.prototype;
		
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
        this.strDelimiter = this.properties[0];
        this.achievements = new AchievementsMgrKlass();
            
        this.vaild_result = false;   
        this.level_name = "";     
        this.props = {};   
        
        // for each
        this.exp_CurAchievementName = "";      
	};
    
	instanceProto.run_test = function()
	{
	    if (!this.vaild_result)  
	    {
	        this.achievements.RunTest(this.level_name, this.props);
	        this.vaild_result = true;
	        
	        for (var n in this.props)
	            delete this.props[n];	        
	    }	    
	        
	    return this.achievements.GetAchievementsByLevelName(this.level_name);
	};    	
	
	instanceProto.for_each_name = function (names)
	{
        // retriving result
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i, cnt=names.length;
		for (i=0; i<cnt; i++)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurAchievementName = names[i];
                
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
     		
		return false;	    
	};  	
    
	instanceProto.saveToJSON = function ()
	{
		return {"as": this.achievements.saveToJSON(),
		        "ln": this.level_name,
                "ps": this.props,
                "va": this.vaild_result};
	};
	
	instanceProto.statesToJSON = function ()
	{
		return this.achievements.statesToJSON();
	};	
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.achievements.loadFromJSON(o["as"]);
	    this.level_name = o["ln"];
	    this.props = o["ps"];
		this.vaild_result = o["va"];	
		 		      
	}; 
	  
	instanceProto.statesFromJSON = function (o)
	{
        this.achievements.statesFromJSON(o);
	}; 	
	
    // copy from    
    // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
    
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    var CSVToArray = function ( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
                (
                        // Delimiters.
                        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                        // Quoted fields.
                        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                        // Standard fields.
                        "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ),
                "gi"
                );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[ 1 ];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                        strMatchedDelimiter.length &&
                        (strMatchedDelimiter != strDelimiter)
                        ){

                        // Since we have reached a new row of data,
                        // add an empty row to our data array.
                        arrData.push( [] );

                }


                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[ 2 ]){

                        // We found a quoted value. When we capture
                        // this value, unescape any double quotes.
                        var strMatchedValue = arrMatches[ 2 ].replace(
                                new RegExp( "\"\"", "g" ),
                                "\""
                                );

                } else {

                        // We found a non-quoted value.
                        var strMatchedValue = arrMatches[ 3 ];

                }


                // Now that we have our value string, let's add
                // it to the data array.
                arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    };        
   
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      

	Cnds.prototype.ForEachAchievement = function (level_name)
	{
	    this.level_name = level_name;
	    var names = this.achievements.GetAchievementNameList(level_name);
        return this.for_each_name(names);
	};  
	
	Cnds.prototype.IsObtained = function (level_name, achievement_name, latest_obtained)
	{
	    this.level_name = level_name;
        var obtainedState = this.achievements.GetObtainedState(level_name, achievement_name);
	    if (latest_obtained === 0)
	    {
            return obtainedState["isObtained"];
        }
        else
        {
            return obtainedState["cur"] && (!obtainedState["pre"]);
        }
	};  	 
	 
	Cnds.prototype.ForEachNewObtainedAchievement = function ()
	{	    
        var achievement_names = this.achievements.GetAchievementNameList(this.level_name);
        var i, cnt=achievement_names.length, obtainedState, names=[];
        for(i=0; i<cnt; i++)
        {
            obtainedState = this.achievements.GetObtainedState(this.level_name, achievement_names[i]);
            if (obtainedState["cur"] && (!obtainedState["pre"]))
                names.push( achievement_names[i] );
        }        
        
        return this.for_each_name( names );    
	};  	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.LoadRules = function (csv_string)
	{  	
        for (var n in this.props)
            delete this.props[n];
            
        this.vaild_result = false;            
            
	    var csv_table = CSVToArray(csv_string, this.strDelimiter);	    
	    this.achievements.LoadRules(csv_table);
	};
	
    Acts.prototype.SetLevelName = function (level_name)
	{  	
	    this.level_name = level_name;    
	    this.vaild_result = false;  
	};
	    
    Acts.prototype.SetProperty = function (prop, val)
	{  	
	    this.props[prop] = val;	    
	    this.vaild_result = false;    
	};   
	    
    Acts.prototype.RunTest = function ()
	{
	    this.run_test(); 
	}; 
	
	Acts.prototype.Forceobtain = function (level_name, achievement_name, isObtained)
	{
        this.achievements.SetObtainedState(level_name, achievement_name, (isObtained === 1));
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
	
	Acts.prototype.StateJSONLoad = function (json_)
	{
		var o;
		
		try {
			o = JSON.parse(json_);
		}
		catch(e) { return; }
		
		this.statesFromJSON(o);
	};	    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.CurAchievementName = function (ret)
	{
		ret.set_string(this.exp_CurAchievementName);
	};
    
	Exps.prototype.LevelName = function (ret)
	{
		ret.set_string(this.level_name);
	};    
	
	Exps.prototype.AsJSON = function (ret)
	{
	    var s = JSON.stringify( this.saveToJSON() );
		ret.set_string(s);
	};
    
	Exps.prototype.StatesAsJSON = function (ret)
	{       
	    var s = JSON.stringify( this.statesToJSON() );
		ret.set_string(s);
	};	
	
    
// --------
    var AchievementsMgrKlass = function()
    {  
        this.achievements = {};
        this.obtainedStates = {};
    };
    var AchievementsMgrKlassProto = AchievementsMgrKlass.prototype; 
	
    AchievementsMgrKlassProto.LoadRules = function (csv_table)
	{  	
        for (var n in this.achievements)
            delete this.achievements[n];
                        	     
	    var i, cnt = csv_table.length;
	    var prop_names = csv_table[0];
 
	    var items, achievement_obj, level_name, achievement_name;
	    for(i=1; i<cnt; i++)
	    {
	        items = csv_table[i];
	        level_name = items[0];
	        achievement_name = items[1];
	        achievement_obj = new AchievementKlass();
	        achievement_obj.CreateTestCode(prop_names, items, i);

	        if (!this.achievements.hasOwnProperty(level_name))
	            this.achievements[level_name] = [];
	        this.achievements[level_name].push(achievement_obj);
	    }  
	};
	
	AchievementsMgrKlassProto.GetAchievementsByLevelName = function(level_name)
	{
	    return this.achievements[level_name];
	}; 	

	AchievementsMgrKlassProto.GetAchievementNameList = function (level_name)
	{
	    var achievements = this.GetAchievementsByLevelName(level_name);
        if (!achievements)
            return [];
        
	    var names = [], names_map = {};
	    var i,cnt=achievements.length, n;
	    for(i=0; i<cnt; i++)
	    {
	        n = achievements[i].name;
	        if (!names_map.hasOwnProperty(n))
	        {
	            names.push(n);
	            names_map[n] = true;
	        }
	    }
        return names;	    
	}; 


    AchievementsMgrKlassProto.GetObtainedState = function(level_name, achievement_name)
	{
        if (!this.obtainedStates.hasOwnProperty(level_name))
            this.obtainedStates[level_name] = {};
        if (!this.obtainedStates[level_name].hasOwnProperty(achievement_name))
            this.obtainedStates[level_name][achievement_name] = get_new_obtainState();
            
        return this.obtainedStates[level_name][achievement_name];
	}; 	
    
    AchievementsMgrKlassProto.SetObtainedState = function(level_name, achievement_name, state)
	{
        var obtainedState = this.GetObtainedState(level_name, achievement_name);
        obtainedState["isObtained"] = state;
        obtainedState["cur"] = state;
	};    
    
    var get_new_obtainState = function ()
    {
        return { "isObtained": false,
                 "pre": false,
                 "cur": false,
                 };
    };
			
	AchievementsMgrKlassProto.RunTest = function(level_name, props)
	{
	    var achievements = this.GetAchievementsByLevelName(level_name);
	    if (!achievements)
	        return;

        var i, cnt=achievements.length, achievement, result, obtainedState;
        for (i=0; i<cnt; i++)
        {
            obtainedState = this.GetObtainedState(level_name, achievements[i].name);
            obtainedState["pre"] = obtainedState["isObtained"];      
            obtainedState["cur"] = false;              
        }
        
        for (i=0; i<cnt; i++)
        {
            obtainedState = this.GetObtainedState(level_name, achievements[i].name);
            obtainedState["cur"] = obtainedState["cur"] || achievements[i].RunTest(props);
            obtainedState["isObtained"] = obtainedState["isObtained"] || obtainedState["cur"];               
        }   
	};    

	AchievementsMgrKlassProto.saveToJSON = function ()
	{   
        var achievements = {};
        for (var ln in this.achievements)
        {
            achievements[ln] = [];
            var i, cnt = this.achievements[ln].length;
            achievements[ln].length = cnt;
            for(i=0; i<cnt; i++)
                achievements[ln][i] = this.achievements[ln][i].saveToJSON();
        }
        
		return {"achievements": achievements,
                "state": this.obtainedStates,
		        };
	};
	
	AchievementsMgrKlassProto.statesToJSON = function ()
	{   
		return this.obtainedStates;
	};	

	AchievementsMgrKlassProto.loadFromJSON = function (o)
	{
	    for (var ln in this.achievements)
	        delete this.achievements[ln];
	        
		var achievements = o["achievements"];
		for (var ln in achievements)
        {
            var i, cnt= achievements[ln].length;
            this.achievements[ln] = [];
            this.achievements[ln].length = cnt;
            for (i=0; i<cnt; i++)
            {            
	            var test_obj = new AchievementKlass();
	            test_obj.loadFromJSON(achievements[ln][i]);
	            this.achievements[ln][i] = test_obj;
	        }
        }   

        this.obtainedStates = o["state"];        
	};	
	
	AchievementsMgrKlassProto.statesFromJSON = function (o)
	{
        this.obtainedStates = o;    				 		      
	};	
	
		
    var AchievementKlass = function()
    {  
        this.name = "";
        this.test_handler = null;
        this.code_save = "";
    };
    var AchievementKlassProto = AchievementKlass.prototype;
    
    var is_equation = function (cond)
    {
        return (cond.indexOf("==") != -1) ||
               (cond.indexOf("!=") != -1) ||
               (cond.indexOf(">=") != -1) ||
               (cond.indexOf("<=") != -1) ||
               (cond.indexOf(">")  != -1) ||
               (cond.indexOf("<")  != -1);
    };
    var get_prop_cond_code = function (prop_name, cond)
    {
        if (!is_equation(cond))
        {
            if (isNaN(cond))
                cond = '"' + cond + '"';
            
            cond = "==(" + cond + ")";
        }
        return "(prop['"+prop_name+"']"+cond+")"
    }
    
    AchievementKlassProto.CreateTestCode = function(prop_names, d, line_index)
    {
        this.name = d[1];
        this.flag = false;
        
        var i, cnt=d.length;
        var conds = [], cond_part;
        // start from index 2. 0 for level name, 1 for achievement name.
        for (i=2; i<cnt; i++)  
        {
            cond_part = d[i];
            if (cond_part == "")
                continue;
            cond_part = get_prop_cond_code(prop_names[i-1], cond_part);
            conds.push(cond_part);
        }
        
        cond_part = (conds.length > 0)? conds.join("&&") : "false"
        var code_string = "function(prop){\n return "+ cond_part +";\n}";       
        try
        {
            this.test_handler = eval("("+code_string+")");
            this.code_save = code_string;             
        }
        catch(err)
        {        
            assert2(null, "Lookup plugin: parse line " + line_index + " failed.");
        }
    };
            
    AchievementKlassProto.RunTest = function (prop)
    {
        return this.test_handler(prop);
    };      
        
    AchievementKlassProto.saveToJSON = function ()
    {
        return {"name": this.name,                
                "code": this.code_save
               };
    };  
     
    AchievementKlassProto.loadFromJSON = function (o)
    {
        this.name = o["name"];        
        var code_string = o["code"];
        try
        {
            this.test_handler = eval("("+code_string+")");
            this.code_save = code_string;             
        }
        catch(err)
        {        
            assert2(null, "Lookup plugin: parse code " + code_string + " failed.");
        } 
    };       
}());    