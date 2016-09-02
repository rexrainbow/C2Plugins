// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Lookup = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Lookup.prototype;
		
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
        this.tests = new cr.plugins_.Rex_Lookup.TestsMgrKlass(this.properties[1]);
            
        this.vaild_result = false;        
        this.props = {};   
        
        // for each
        this.exp_CurPassedTestName = "";
	};
    
	instanceProto.run_test = function()
	{
	    if (!this.vaild_result)  
	    {
	        this.tests.RunTest(this.props);
	        this.vaild_result = true;
	        
	        for (var n in this.props)
	            delete this.props[n];		        
	    }
	    
        return this.tests.GetPassedName();
	};    
    
	instanceProto.saveToJSON = function ()
	{
		return {"tests": this.tests.saveToJSON(),
                "props": this.props,
                "valid": this.vaild_result};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.tests.loadFromJSON(o["tests"]);
	    this.props = o["props"];
		this.vaild_result = o["valid"];	
		 		      
	};

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    var prop = [];
	    // show test result
	    this.tests.getDebuggerValues(prop);

	    // show property	    
	    prop.push({"name": "Property", "value": "Value"});
	    for (var n in this.props)
	    {
	        prop.push({"name": n, "value": this.props[n]});
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
    
	Cnds.prototype.ForEachPassedTestName = function ()
	{
	    var passed_names = this.run_test();

        // retriving result
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i, cnt=passed_names.length;
		for (i=0; i<cnt; i++)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurPassedTestName = passed_names[i];
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
     		
		return false;	    
	};  
    
	Cnds.prototype.HasPassedTest = function ()
	{
	    var passed_names = this.run_test();
	    return (passed_names.length > 0);
	};  	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.LoadTable = function (csv_string)
	{  	
        for (var n in this.props)
            delete this.props[n];
            
        this.vaild_result = false;            
            
	    var csv_table = CSVToArray(csv_string, this.strDelimiter);	    
	    this.tests.LoadTable(csv_table);
	};
 
    Acts.prototype.SetProperty = function (prop, val)
	{  	
	    this.props[prop] = val;	    
	    this.vaild_result = false;    
	};   
 
    Acts.prototype.RemoveTest = function (name)
	{  	
        this.tests.RemoveTest(name);
	};       
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.CurPassedTestName = function (ret)
	{
		ret.set_string(this.exp_CurPassedTestName);
	};
    
	Exps.prototype.FirstPassedTestName = function (ret)
	{
	    var first_name = this.run_test()[0];
	    if (first_name == null)
	        first_name = "";
		ret.set_string(first_name);
	};    
}());

(function ()
{
    var IF_MODE = 0;
    var IFELSEIF_MODE = 1;    
    cr.plugins_.Rex_Lookup.TestsMgrKlass = function(condition_mode)
    {  
        this.condition_mode = condition_mode;
        this.tests = [];   
        this.passed_names = [];
        this.passed_names_map = {};
    };
    var TestsMgrKlassProto = cr.plugins_.Rex_Lookup.TestsMgrKlass.prototype;

	TestsMgrKlassProto.GetPassedName = function()
	{
        return this.passed_names;
	}; 
	
    TestsMgrKlassProto.LoadTable = function (csv_table)
	{  	
        this.clean_results();
        	    
	    this.tests.length = 0;
	    var i, cnt = csv_table.length;
	    var prop_names = csv_table[0];

	    var test_obj, test_name;
	    for(i=1; i<cnt; i++)
	    {
	        test_obj = new TestKlass();
	        test_name = test_obj.CreateTestCode(prop_names, csv_table[i], i);   
	        test_obj.extra["name"] = test_name;
	        this.tests.push(test_obj);
	    }  
	};
	        
	TestsMgrKlassProto.RunTest = function(props)
	{
        this.clean_results();

        var i, cnt=this.tests.length, test_name;
        // IF_MODE
        if (this.condition_mode == IF_MODE)
        {
            for (i=0; i<cnt; i++)
            {
                test_name = this.tests[i].extra["name"];                
                if (this.passed_names_map.hasOwnProperty(test_name)) // already passed
                    continue;
                
                if (this.tests[i].RunTest(props))
                {                  
                    this.passed_names.push(test_name);
                    this.passed_names_map[test_name] = true;
                }
            } 
        }
        // IF_MODE
                
        // IFELSEIF_MODE
        else if (this.condition_mode == IFELSEIF_MODE)
        {
            for (i=0; i<cnt; i++)
            {
                if (this.tests[i].RunTest(props))
                {                  
                    test_name = this.tests[i].extra["name"];
                    this.passed_names.push(test_name);
                    this.passed_names_map[test_name] = true;
                    break;
                }
            }   
        } 
        // IFELSEIF_MODE  
	};    
	
    TestsMgrKlassProto.RemoveTest = function (name)
	{  		    
        var i, cnt=this.tests.length;	           
        var j = 0;
        for (i=0; i<cnt; i++)
        {           
            if (this.tests[i].extra["name"] == name)
                continue;
            
            this.tests[j] = this.tests[i];
            j += 1;
        } 
        this.tests.length = j;
	}; 	
    
	TestsMgrKlassProto.saveToJSON = function ()
	{   
        var tests = [];	     
        var i, cnt=this.tests.length;	   
        for (i=0; i<cnt; i++)
        {
            tests.push(this.tests[i].saveToJSON());
        }
        
		return {"tests": tests,
		        };
	};
	
	TestsMgrKlassProto.loadFromJSON = function (o)
	{
		var tests = o["tests"];
        var i, cnt=tests.length;
        this.tests.length = 0;	   
        for (i=0; i<cnt; i++)
        {
	        test_obj = new TestKlass();
	        test_obj.loadFromJSON(tests[i]);
	        this.tests.push(test_obj);
        }        				 		      
	};

	/**BEGIN-PREVIEWONLY**/
	TestsMgrKlassProto.getDebuggerValues = function (propsections)
	{
	    // show test result
	    propsections.push({"name": "Test", "value": "Result"});
	    
        var i, cnt=this.tests.length;	
        var info;   
        for (i=0; i<cnt; i++)
        {
            info = this.tests[i].extra;
            propsections.push({"name": info["name"], "value": info["result"]});
        }    
	};
	/**END-PREVIEWONLY**/	
	
	TestsMgrKlassProto.clean_results = function()
	{
        this.passed_names.length = 0;
        for(var n in this.passed_names_map)
            delete this.passed_names_map[n];
	};   

    var TestKlass = function()
    {  
        this.test_handler = null;
        this.code_save = "";
        this.extra = {};
    };
    var TestKlassProto = TestKlass.prototype;
    
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
            cond = "==(" + cond + ")";
        return "(prop['"+prop_name+"']"+cond+")"
    }
    
    TestKlassProto.CreateTestCode = function(prop_names, d, line_index)
    {
        var name = d[0];
        var i, cnt=d.length;
        var conds = [], cond_part;
        for (i=1; i<cnt; i++)
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
        return name;
    };
    
    TestKlassProto.CleanResult = function ()
    {
        this.result = null;
    };
        
    TestKlassProto.RunTest = function (prop)
    {
        return this.test_handler(prop);
    };   
        
    TestKlassProto.saveToJSON = function ()
    {
        return {"code": this.code_save,
                "extra": this.extra};
    };      
        
    TestKlassProto.loadFromJSON = function (o)
    {
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
        
        this.extra = o["extra"]; 
    };  
    
}());    