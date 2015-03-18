// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Parse_FileUpload = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Parse_FileUpload.prototype;
		
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
	    jsfile_load("parse-1.3.2.min.js");
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
	    this.file_obj = null;
	    
	    if (!window.RexC2IsParseInit)
	    {
	        window["Parse"]["initialize"](this.properties[0], this.properties[1]);
	        window.RexC2IsParseInit = true;
	    }
	};

	instanceProto.OnUploadComplete = function()
	{ 
	    this.runtime.trigger(cr.plugins_.Rex_Parse_FileUpload.prototype.cnds.OnUploadCompleted, this);
	};	
	
	instanceProto.OnUploadError = function()
	{ 
	    this.runtime.trigger(cr.plugins_.Rex_Parse_FileUpload.prototype.cnds.OnUploadError, this);
	};		  
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnUploadCompleted = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnUploadError = function ()
	{
	    return true;
	}; 
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
 
    Acts.prototype.UploadImage = function (dataURI, file_name)
	{
	    var d = {'base64': dataURI};
        this.file_obj = new Parse["File"](file_name, d, null);       
        
        var self = this;
        var on_complete = function()
        {
            self.OnUploadComplete();
        };   
        var on_error = function(error)
        {
            self.OnUploadError();
        };    
         
		this.file_obj["save"]()["then"](on_complete, on_error);        
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.LastURL = function (ret)
	{
	    var url = "";
	    if ((this.file_obj != null) && this.file_obj["url"])
	        url = this.file_obj["url"]();	    
	    
		ret.set_string(url);
	};

	Exps.prototype.LastFileName = function (ret)
	{
	    var name = "";
	    if ((this.file_obj != null) && this.file_obj["name"])
	        name = this.file_obj["name"]();	    
	    
		ret.set_string(name);
	};
}());