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
        this.adapter = new cr.plugins_.Rex_Function.FunctionAdapterKlass(this);
        this.check_name = "FUNCTION";
	};
    
	instanceProto.CallFn = function(name, args)
	{
        if ((typeof(args) == "object") || (typeof(args) == "undefined"))
        {
            this.fnObj["_CallFn"](name, args);
        }
        else
        {
            this.fnObj["_ExeCmd"](arguments);
        }
        return this.fnObj["result"];
	};  
    
	instanceProto.ExecuteCommands = function (command_string)
	{
        if (command_string == "")
            return;
        
        var cmds = CSVToArray(command_string);
        var cmd_cnt = cmds.length;
        var i;
        var cmd, j, arg_len, mcmd;
        for(i=0; i<cmd_cnt; i++)
        {
           cmd = cmds[i];
           arg_len = cmd.length;
           for(j=1; j<arg_len; j++)
           {
               mcmd = cmd[j];
               cmd[j] = (mcmd != "")? 
                        eval("("+mcmd+")"):
                        null;
           }
           this._ExeCmd(cmd);
        }
        return this.fnObj["result"];
	};    
    
	instanceProto.InjectJS = function(name, fn)
	{
        this.fnObj["InjectJS"](name, fn);
	};  
    
	instanceProto.AddParams = function(param)
	{
        if (param)
            this.fnObj["param"] = this.hash_copy(param, this.fnObj["param"]);
	};  
    
	instanceProto.GetReturns = function()
	{
        return this.fnObj["ret"];
	}; 
    
	instanceProto._ExeCmd = function(_args)
	{
        var args = (typeof _args === "string")? arguments:_args;
        return this.fnObj["_ExeCmd"](args);
	};    
   
    instanceProto.hash_copy = function (obj_in, obj_src)
    {
        var obj_out = (obj_src == null)? {}:obj_src;
        var key;
        for (key in obj_in)
            obj_out[key] = obj_in[key];
            
        return obj_out;
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

    var clean_hashtable = function (hash_table)
	{
        var key;
        for (key in hash_table)
            delete hash_table[key];
	}; 
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnFunctionCalled = function (name)
	{
        var is_my_call = (this.fnObj["fn_name"] == name);
        this.fnObj["is_echo"] |= is_my_call;
		return is_my_call;
	};	    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.CallFunction = function (name)
	{  
        this.CallFn(name);
	}; 
    
	Acts.prototype.CleanParameters = function ()
	{
        clean_hashtable(this.fnObj["param"]);
	};    
    
	Acts.prototype.SetParameter = function (index, value)
	{
        this.fnObj["param"][index] = value;
	};  

	Acts.prototype.CleanRetruns = function ()
	{
        clean_hashtable(this.fnObj["ret"]);    
	};    
    
	Acts.prototype.SetReturn = function (index, value)
	{
        this.fnObj["ret"][index] = value;
	};

	Acts.prototype.CreateJSFunctionObject = function (name, code_string)
	{
        var fn = eval("("+code_string+")");
        this.InjectJS(name, fn);
	};

	Acts.prototype.SetResult = function (value)
	{
        this.fnObj["result"] = value;
	};  

	Acts.prototype.ExecuteCommands = function (command_string)
	{
        this.ExecuteCommands(command_string);
	}; 

	Acts.prototype.InjectJSFunctionObjects = function (code_string)
	{
        var fn = eval("("+code_string+")");
        var fns = fn(this.fnObj);
	};    
    

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.Param = function (ret, index)
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
    
    Exps.prototype.Ret = function (ret, index)
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

    Exps.prototype.Eval = function (ret, code_string)
	{
	    ret.set_any( eval( "("+code_string+")" ) );
	};	

    Exps.prototype.Result = function (ret)
	{
	    ret.set_any( this.fnObj["result"] );
	};
    
    Exps.prototype.Call = function (ret)
	{        
        var args = Array.prototype.slice.call(arguments,1);
	    ret.set_any( this._ExeCmd(args) );
	};    
}());

(function ()
{
    // for injecting javascript
    cr.plugins_.Rex_Function.FunctionKlass = function(plugin, is_debug_mode)
    {
        this["plugin"] = plugin;
        this["is_debug_mode"] = is_debug_mode;    
        this["fn_name"] = "";
        this["_fn_name_stack"] = [];
        this["param"] = {};
        this["ret"] = {};
        this["result"] = 0;
        this["is_echo"] = false;
		this["JSFns"] = {};
    };
    var FunctionKlassProto = cr.plugins_.Rex_Function.FunctionKlass.prototype;
    
	FunctionKlassProto["CallFn"] = function()   // (name, param0, param1...)
	{
        return this["_ExeCmd"](arguments);
	};    

	FunctionKlassProto["InjectJS"] = function(name, fn)
	{
        if (this["is_debug_mode"] && this["JSFns"][name] != null) 
            alert ("JS function '" + name + "' has existed.");  
            
        this["JSFns"][name] = fn;
	};
    
	FunctionKlassProto["_ExeCmd"] = function(args)
	{    
        var arg_len = args.length;
        var i, arg;
        for (i=1; i<arg_len; i++)
        {
            arg = args[i];
            if (arg != null)
                this["param"][i-1] = arg;
        }
        this["_CallFn"](args[0] || "");
        return this["result"];
	}; 
    
	FunctionKlassProto["_CallFn"] = function(name, args)
	{   
        if (args)
            this["param"] = this["plugin"].hash_copy(args, this["param"]);
        
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
	    this["_fn_name_stack"].push(this["fn_name"]);
        this["fn_name"] = name; 
	    this["plugin"].runtime.trigger(cr.plugins_.Rex_Function.prototype.cnds.OnFunctionCalled, this["plugin"]);
	    this["fn_name"] = this["_fn_name_stack"].pop();
	}; 

 	FunctionKlassProto["_CallJS"] = function(name)
	{
        var is_break = false;
	    var fn_obj = this["JSFns"][name];
        if (fn_obj != null) 
        {
            this["is_echo"] = true;
            is_break = fn_obj(this);
        }
        return is_break;
	};     
    
    // adapter for exporting to javascript
    cr.plugins_.Rex_Function.FunctionAdapterKlass = function(plugin)
    {
        this["_plugin"] = plugin;
    };
    var FunctionAdapterKlassProto = cr.plugins_.Rex_Function.FunctionAdapterKlass.prototype;
    
	FunctionAdapterKlassProto["CallFn"] = function(name, args)
	{
	    return this["_plugin"].CallFn(name, args);
	};   
	
	FunctionAdapterKlassProto["GetReturns"] = function()
	{
	    return this["_plugin"].GetReturns();
	};  	
	
	FunctionAdapterKlassProto["InjectJS"] = function(name, fn)
	{
	    this["_plugin"].InjectJS(name, fn);
	};  	  
}());