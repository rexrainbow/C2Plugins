// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_webpage_reader = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_webpage_reader.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	    jsfile_load("jquery.xdomainajax.js");
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
		this.lastData = "";
		this.curTag = "";	    
	};

	instanceProto.doRequest = function (tag_, url_, method_, data_)
	{
	    var self = this;
        window["xdmAjax"]({
            "url": url_,
            "type": method_,
            "success": function(res) 
            {
                self.lastData = res["responseText"];
                self.curTag = tag_;
                self.runtime.trigger(cr.plugins_.Rex_webpage_reader.prototype.cnds.OnComplete, self);
            },
            "error": function()
		    {
		        self.curTag = tag_;
		        self.runtime.trigger(cr.plugins_.Rex_webpage_reader.prototype.cnds.OnError, self);
		    }
        });	    
    };
        
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
	
	Cnds.prototype.OnComplete = function (tag)
	{
		return cr.equals_nocase(tag, this.curTag);
	};
	
	Cnds.prototype.OnError = function (tag)
	{
		return cr.equals_nocase(tag, this.curTag);
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.Request = function (tag_, url_)
	{
		this.doRequest(tag_, url_, "GET");
	};   
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.LastData = function (ret)
	{
		ret.set_string(this.lastData);
	};
	
}());