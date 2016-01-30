// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Live2DObj = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Live2DObj.prototype;
		
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
	    jsfile_load("PlatformManager.js");    
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
	    this.model = {};
	    this.model["textures"] = [];
	    this.model["model"] = "";
	    this.model["motions"] = {};
	    this.runtime.tickMe(this);
	};
    
	instanceProto.onDestroy = function ()
	{
	};   

	instanceProto.tick = function()
	{
    };

	instanceProto.draw = function(ctx)
	{
    };    
    
	instanceProto.drawGL = function(glw)
	{  
	};

	instanceProto.load_resources = function()
	{
        // load textures
        var paths = this.model["textures"];
        var i, cnt=paths.length;
        for (i=0; i<cnt; i++)
        {
            
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

	Acts.prototype.AddTexture = function (url_)
	{
	    this.model["textures"].push(url_);
	};

	Acts.prototype.SetModel = function (url_)
	{
	    this.model["model"] = url_;
	};

	Acts.prototype.AddMotion = function (namne_, url_)
	{
	    // TODO
	};	
	
	Acts.prototype.Initial = function ()
	{
        this.load_resources(this.model);
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());