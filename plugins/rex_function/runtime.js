// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Function = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Function.prototype;
		
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
        this.fnObj = new cr.plugins_.Rex_Function.FunctionKlass(this, this.properties[0]);
        this.check_name = "FUNCTION";
	};
    
	instanceProto.CallFn = function(name, args)
	{
        this.fnObj["_CallFn"](name, args);
	};  
    
	instanceProto.ExecuteCommands = function (command_string)
	{
        if (command_string == "")
            return;
        
        var cmds = CSVToArray(command_string);
        var cmd_cnt = cmds.length;
        var i;
        var cmd, j, arg_len;
        for(i=0; i<cmd_cnt; i++)
        {
           cmd = cmds[i];
           arg_len = cmd.length;
           for(j=1; j<arg_len; j++)
           {
               cmd[j] = eval("("+cmd[j]+")");
           }
           this._ExeCmd(cmd);
        }
	};    
    
	instanceProto.CreateJS = function(name, code_string)
	{
        this.fnObj["CreateJS"](name, code_string);
	};  
    
	instanceProto.AddParams = function(param)
	{
        if (param)
            jQuery.extend(this.fnObj["param"], param);
	};  
    
	instanceProto._ExeCmd = function(_args)
	{
        var args = (typeof _args === "string")? arguments:_args;
        return this.fnObj["_ExeCmd"](args);
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
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
    
	cnds.OnFunctionCalled = function (name)
	{
        var is_my_call = (this.fnObj["fn_name"] == name);
        this.fnObj["is_echo"] |= is_my_call;
		return is_my_call;
	};	    

	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
	acts.CallFunction = function (name)
	{  
        this.CallFn(name);
	}; 
    
	acts.CleanParameters = function ()
	{
        this.fnObj["param"] = {};
	};    
    
	acts.SetParameter = function (index, value)
	{
        this.fnObj["param"][index] = value;
	};  

	acts.CleanRetruns = function ()
	{
        this.fnObj["ret"] = {};
	};    
    
	acts.SetReturn = function (index, value)
	{
        this.fnObj["ret"][index] = value;
	};

	acts.CreateJSFunctionObject = function (name, code_string)
	{
        this.CreateJS(name, code_string);
	};

	acts.SetResult = function (value)
	{
        this.fnObj["result"] = value;
	};  

	acts.ExecuteCommands = function (command_string)
	{
        this.ExecuteCommands(command_string);
	}; 
    
    

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

    exps.Param = function (ret, index)
	{
        var value = this.fnObj["param"][index];
        if (value == null) 
        {
            value = 0;
            if (this.fnObj["is_debug_mode"]) 
            {
                alert ("Can not find parameter '" + index + "'");
            }
        }
	    ret.set_any(value);
	};
    
    exps.Ret = function (ret, index)
	{
        var value = this.fnObj["ret"][index];
        if (value == null) 
        {
            value = 0;
            if (this.fnObj["is_debug_mode"]) 
            {
                alert ("Can not find return value '" + index + "'");
            }
        }
	    ret.set_any(value);
	};  

    exps.Eval = function (ret, code_string)
	{
	    ret.set_any( eval( "("+code_string+")" ) );
	};	

    exps.Result = function (ret)
	{
	    ret.set_any( this.fnObj["result"] );
	};
    
    exps.Call = function (ret)
	{        
        var args = Array.prototype.slice.call(arguments,1);
	    ret.set_any( this._ExeCmd(args) );
	};    
}());

(function ()
{
    cr.plugins_.Rex_Function.FunctionKlass = function(plugin, is_debug_mode)
    {
        this["plugin"] = plugin;
        this["is_debug_mode"] = is_debug_mode;    
        this["fn_name"] = "";
        this["param"] = {};
        this["ret"] = {};
        this["result"] = 0;
        this["is_echo"] = false;
		this["JSFnObjs"] = {};
    };
    var FunctionKlassProto = cr.plugins_.Rex_Function.FunctionKlass.prototype;
    
	FunctionKlassProto["CallFn"] = function()   // (name, param0, param1...)
	{
        return this["_ExeCmd"](arguments);
	};    

	FunctionKlassProto["CreateJS"] = function(name, code_string)
	{
        if (this["is_debug_mode"] && this["JSFnObjs"][name] != null) 
            alert ("JS function '" + name + "' has existed.");  
            
        this["JSFnObjs"][name] = eval("("+code_string+")");
	};
    
	FunctionKlassProto["_ExeCmd"] = function(args)
	{    
        var arg_len = args.length;
        var i;
        for (i=1; i<arg_len; i++)
        {
            this["param"][i-1] = args[i];
        }
        this["_CallFn"](args[0] || "");
        return this["result"];
	}; 
    
	FunctionKlassProto["_CallFn"] = function(name, args)
	{    
        if (args)
            jQuery.extend(this["param"], args);
        
        this["is_echo"] = false;
        
        // call JS function first
        var is_break = this["_CallJS"](name);
        if (!is_break)
        {
            // then call trigger function in C2 event
            this["_CallC2Event"](name);
        }
        
        if ((!this["is_echo"]) && this["is_debug_mode"]) 
        {
            alert ("Can not find function '" + name + "'");
        }
	}; 
    
	FunctionKlassProto["_CallC2Event"] = function(name)
	{
        this["fn_name"] = name; 
	    this["plugin"].runtime.trigger(cr.plugins_.Rex_Function.prototype.cnds.OnFunctionCalled, this["plugin"]);
	}; 

 	FunctionKlassProto["_CallJS"] = function(name)
	{
        var is_break = false;
	    var fn_obj = this["JSFnObjs"][name];
        if (fn_obj != null) 
        {
            this["is_echo"] = true;
            is_break = fn_obj(this);
        }
        return is_break;
	};     
    
}());