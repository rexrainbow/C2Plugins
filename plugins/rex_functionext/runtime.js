// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_FnExt = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_FnExt.prototype;
		
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
	    this.fnObj = new cr.plugins_.Rex_FnExt.FunctionKlass(this);
	    this.callback = null;
	    this._call_fn = null;
	    this._get_ret = null;
	    this._fake_ret = {value:0,
	                      set_any: function(value){this.value=value;},
	                      set_int: function(value){this.value=value;},	                      
	                     };
	};
	
	instanceProto._setup = function ()
	{
        var plugins = this.runtime.types;
        assert2(plugins.Function, "Official function was not found.");
        this._call_fn = cr.plugins_.Function.prototype.acts.CallFunction;
        this._get_ret = cr.plugins_.Function.prototype.exps.ReturnValue;
        var name, plugin;
        for (name in plugins)
        {
            plugin = plugins[name];
            if (plugin.plugin.acts.CallFunction == this._call_fn)
            {
                this.callback = plugin.instances[0];
                break;
            }                                          
        }
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
  
    instanceProto._call_C2function = function (_name, _params)
    {                         
        this._call_fn.call(this.callback, _name, _params);
        this._get_ret.call(this.callback, this._fake_ret);
        return this._fake_ret.value;
    };

    instanceProto.CallFunction = function (name_, params_)
    {  
        return this.fnObj["CallFn"](name_, params_);
    };    
        
	instanceProto._run_csv_cmds = function (csv_string)
	{
        if (csv_string == "")
            return;
        
        var cmds=CSVToArray(csv_string);
        var i,j,cmd,param,args=[];
        var cmd_cnt=cmds.length,arg_cnt=cmds[0].length;
        
        for(i=0; i<cmd_cnt; i++)
        {
           cmd = cmds[i];
           args.length = 1;
           args[0] = cmd[0];
           for(j=1; j<arg_cnt; j++)
           {
               param = cmd[j];
               if (param != "")
                   args.push(eval("("+param+")"));
               else
                   break;
           }
           this.CallFunction(args);
        }
	};    
        
	instanceProto._run_json_cmds = function (JSON_string)
	{
        if (JSON_string == "")
            return;
        
        var cmds = JSON.parse(JSON_string);
        if (typeof(cmds[0]) != "object")
            this.CallFunction(cmds);
        else
        {            
            var i, cmd_cnt=cmds.length;
            for(i=0; i<cmd_cnt; i++)
                this.CallFunction(cmds[i]);
        }
        
	};             
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	Acts.prototype.CreateJSFunctionObject = function (name, code_string)
	{
	    if (this.callback == null)
            this._setup(); 
        var fn = eval("("+code_string+")");
        this.fnObj["InjectJS"](name, fn);
	};

	Acts.prototype.InjectJSFunctionObjects = function (code_string)
	{
        if (this.callback == null)
            this._setup(); 	    
        var fn = eval("("+code_string+")");
        fn(this.fnObj);
	};
	
	Acts.prototype.RunCSVCommands = function (csv_string)
	{
        if (this.callback == null)
            this._setup(); 	    
        this._run_csv_cmds(csv_string);
	}; 
	
	Acts.prototype.RunJSONCommands = function (JSON_string)
	{
        if (this.callback == null)
            this._setup(); 	    
        this._run_json_cmds(JSON_string);
	};
	
	Acts.prototype.CallFunction = function (name_, params_)
	{
        if (this.callback == null)
            this._setup();	
	    this.CallFunction(name_, params_);
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
    Exps.prototype.ReturnValue = function (ret)
	{
	    var val = this.fnObj["ret"];
		if (val == null)
		    val = 0;
	    ret.set_any(val);
	};
	
	Exps.prototype.Call = function (ret, name_)
	{
        if (this.callback == null)
            this._setup();
	    var i, len=arguments.length;
		var param_=[];
		param_.length = len - 2;
		for (i=2; i<len; i++)
		    param_[i-2] = arguments[i];
		var val = this.CallFunction(name_, param_);
		if (val == null)
		    val = 0;
		ret.set_any(val);
	};	
}());

(function ()
{
    // for injecting javascript
    cr.plugins_.Rex_FnExt.FunctionKlass = function(plugin)
    {
        this["_plugin"] = plugin;
		this["JSFns"] = {};
		this["_name"] = "";
		this["params"] = [];
		this["ret"] = 0;
    };
    var FunctionKlassProto = cr.plugins_.Rex_FnExt.FunctionKlass.prototype;
    
	FunctionKlassProto["CallFn"] = function(name, params)
	{
	    var ret;
	    this["_prepare_params"](name, params);
        var fn_obj = this["JSFns"][name];
        if (fn_obj)
        {
            ret = fn_obj(this, this["params"]);
        }
        else
            ret = this["_plugin"]._call_C2function(this["_name"], this["params"]);
        this["ret"] = ret;
        return ret;       
	};   
	
	FunctionKlassProto["InjectJS"] = function(name, fn)
	{
        this["JSFns"][name] = fn;
	};

    FunctionKlassProto["_prepare_params"] = function(_name, _params)
    {          
        if (typeof(_name) == "object") // [name, param0, param1, ...]
        {
            this["params"] = _name;       
            this["_name"] = this["params"].shift();
        }
        else if (typeof(_params) != "object")  // name, param0, param1,...
        {
            this["_name"] = arguments[0];
            this["params"].length = arguments.length -1;
            var i, len=arguments.length;
            for (i=1; i<len; i++)
                this["params"][i-1] = arguments[i];
        }
        else // name, [param0, param1, ...]
        {
            this["_name"] = _name;
            this["params"] = _params;
        }                
    };
}());