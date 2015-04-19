// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_exif_parser = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_exif_parser.prototype;
		
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
	    jsfile_load("exif.js");
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
	    this.exif = {};
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
    
	instanceProto.doRequest = function ( url_, callback )
	{
	    var oReq;
	    
		// Windows Phone 8 can't AJAX local files using the standards-based API, but
		// can if we use the old-school ActiveXObject. So use ActiveX on WP8 only.
		if (this.runtime.isWindowsPhone8)
			oReq = new ActiveXObject("Microsoft.XMLHTTP");
		else
			oReq = new XMLHttpRequest();
			
        oReq.open("GET", url_, true);
        oReq.responseType = "blob";
        
        oReq.onload = function (oEvent) 
        {
            callback(oReq.response);
        };
        
        oReq.send(null);
	};
    
	instanceProto.saveToJSON = function ()
	{
		return { "p": this.is_pause,
                 "ts": this.previous_timescale };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.is_pause = o["p"];
		this.previous_timescale = o["ts"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnLoad = function ()
	{
		return true;
	};

	Cnds.prototype.OnLoadError = function ()
	{
		return true;
	};    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.LoadImage = function (url_)
	{   
	    var self = this;
        
		var get_exif = function ()
		{	    
		    self.exif = this;
		    self.runtime.trigger(cr.plugins_.Rex_exif_parser.prototype.cnds.OnLoad, self);
		};
        
	    var on_load = function (blob)
	    { 
            var is_success;
            
            if (blob)
        	    is_success = window["EXIF"]["getData"](blob, get_exif);	
                
            if (!is_success)
                self.runtime.trigger(cr.plugins_.Rex_exif_parser.prototype.cnds.OnLoadError, self);
	    };
	    
        // does not support CORS         
        this.doRequest(url_, on_load); 		    
	}; 

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Pretty = function (ret)
	{	    
		ret.set_string( window["EXIF"]["pretty"](this.exif) );
	};	
	
	Exps.prototype.Tag = function (ret, tag_name)
	{	    
		ret.set_any( window["EXIF"]["getTag"](this.exif, tag_name) );
	};
	
	Exps.prototype.AllTags = function (ret, tag_name)
	{	    
	    var tags = window["EXIF"]["getAllTags"](this.exif);
		ret.set_string( JSON.stringify(tags) );
	};		
}());