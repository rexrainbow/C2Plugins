// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_VerbalExpressions = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_VerbalExpressions.prototype;
		
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
	    jsfile_load("VerbalExpressions.js");
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
	    this.verEx = window["VerEx"]();
	    this.replacing_callback = "";
	    this.replacing_target = "";
	    this.replaced_result = "";
	};
    
	instanceProto.onDestroy = function ()
	{
	};   

	instanceProto.saveToJSON = function ()
	{
		return { "verEx": this.verEx["saveToJSON"]()
		         };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.verEx["loadFromJSON"](o["verEx"]);
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": "Verbal Expressions",
			"properties": [
				{"name": "Regex", "value": this.verEx["getRegex"]()},
				{"name": "Flags", "value": this.verEx["getFlags"]()},
			]
		});
	};
	/**END-PREVIEWONLY**/	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.IsMatched = function (in_)
	{
        return this.verEx["test"](in_);
	};

	Cnds.prototype.OnReplacingCallback = function (name_)
	{
        return cr.equals_nocase(name_, this.replacing_callback);
	};	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.NewExp = function ()
	{      
	    this.verEx = window["VerEx"]();
	}; 

    Acts.prototype.StartOfLine = function ()
	{      
	    this.verEx = this.verEx["startOfLine"]();
	}; 

    Acts.prototype.EndOfLine = function ()
	{      
	    this.verEx = this.verEx["endOfLine"]();
	}; 

    Acts.prototype.Find = function (s)
	{      
	    this.verEx = this.verEx["then"](s);
	}; 	
	
    Acts.prototype.Maybe = function (s)
	{      
	    this.verEx = this.verEx["maybe"](s);
	};
	
    Acts.prototype.Anything = function ()
	{      
	    this.verEx = this.verEx["anything"]();
	};	
	
    Acts.prototype.AnythingBut = function (s)
	{      
	    this.verEx = this.verEx["anythingBut"](s);
	};
	
    Acts.prototype.Something = function ()
	{      
	    this.verEx = this.verEx["something"]();
	};	
	
    Acts.prototype.SomethingBut = function (s)
	{      
	    this.verEx = this.verEx["somethingBut"](s);
	};		
	
    Acts.prototype.LineBreak = function ()
	{      
	    this.verEx = this.verEx["lineBreak"]();
	}; 	
	
    Acts.prototype.Word = function ()
	{      
	    this.verEx = this.verEx["word"]();
	};	
	
    Acts.prototype.Tab = function ()
	{      
	    this.verEx = this.verEx["tab"]();
	};			
	
    Acts.prototype.SetReplaceResult = function (param)
	{      
		if (cr.is_number(param) && param < 1e9)
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
				
        this.replaced_result = param.toString();		
	};		
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Replace = function (ret, in_, replace_by)
	{
		ret.set_string(this.verEx["replace"]( in_, replace_by ));
	}; 

	Exps.prototype.ReplaceByCallback = function (ret, in_, replace_by)
	{
	    var self=this;
	    var callback = function (x)
	    {
	        self.replacing_callback = replace_by;
	        self.replacing_target = x;
	        self.replaced_result = "";
	        self.runtime.trigger(cr.plugins_.Rex_VerbalExpressions.prototype.cnds.OnReplacingCallback, self);
	        return self.replaced_result;
	    };
		ret.set_string(this.verEx["replace"]( in_, callback ));
	}; 	
	
	Exps.prototype.ReplacingTarget = function (ret)
	{
		ret.set_string(this.replacing_target);
	}; 	
	
	Exps.prototype.Regex = function (ret)
	{
		ret.set_string(this.verEx["getRegex"]());
	}; 		
	
	Exps.prototype.Flags = function (ret)
	{
		ret.set_string(this.verEx["getFlags"]());
	}; 			
	
}());