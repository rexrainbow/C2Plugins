// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Mustache = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Mustache.prototype;
		
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
        this.delimiterCfg = null;
        this.setDelimiter(this.properties[0], this.properties[1]);
        this.view = {};
	};
    
	instanceProto.setDelimiter = function (leftDelimiter, rightDelimiter)
	{
        if (leftDelimiter === "")  leftDelimiter = "{{";
        if (rightDelimiter === "")  rightDelimiter = "}}";        
		if ((leftDelimiter === "{{") && (rightDelimiter === "}}"))
            this.delimiterCfg = null;
        else
            this.delimiterCfg = "{{=" + leftDelimiter + " " + rightDelimiter + "=}}";
	};
    
    instanceProto.getView = function (view_)
	{
        var view;
        if (typeof(view_) === "string")
        {
            try
            {
                view = JSON.parse(view_);
            }
            catch(e) 
            { 
                view = {}; 
            }
        }
        else
            view = this.view;
        
        return view;
	};  
    
    instanceProto.render = function (template, view)
	{
        if (this.delimiterCfg !== null)
            template = this.delimiterCfg + template;
        
        return window["Mustache"]["render"](template, view);
	};
    
	instanceProto.saveToJSON = function ()
	{
		return { "v": this.view,
                      "d": this.delimiterCfg,
                   };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.view = o["v"];
        this.delimiterCfg = o["d"];
	};    
    
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
        var varList = [];
        for (var n in this.view)
        {
            varList.push({"name": n, "value": this.view[n]});
        }

		propsections.push({
			"title": this.type.name,
			"properties": varList
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
        this.view[name] = value;
	};
	/**END-PREVIEWONLY**/    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
   
    Acts.prototype.CleanAll = function ()
	{        
        for (var n in this.view)
            delete this.view[n];
	};
    
    Acts.prototype.SetValue = function (name_, value_)
	{        
        this.view[name_] = value_;
	}; 
    
    Acts.prototype.JSON2Variables = function (json_)
	{        
        try
        {
            this.view = JSON.parse(json_);
        }
        catch(e) 
        { 
            this.view = {}; 
        }
	};    
    
    
    Acts.prototype.SetDelimiters = function (leftDelimiter, rightDelimiter)
	{        
        this.setDelimiter(leftDelimiter, rightDelimiter);
	};     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.Render = function (ret, template, view_)
	{
	    ret.set_string( this.render(template, this.getView(view_)) );
	};
    
    Exps.prototype.Value = function (ret, name_, default_value)
	{
        if (!this.view.hasOwnProperty(name_))
            this.view = default_value || 0;
                
	    ret.set_any( this.view[name_] );
	};
    
    Exps.prototype.VariablesAsJSON = function (ret)
	{
	    ret.set_string( JSON.stringify(this.view) );
	};
    
}());