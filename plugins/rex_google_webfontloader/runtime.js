// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_GoogleWebFontLoader = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_GoogleWebFontLoader.prototype;
		
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
        this.timeout = Math.floor(this.properties[0]*1000);
        this.isLocalAPI = (this.properties[0] ===0);
        this.isLoaded = false;   
        this.exp_LastFamilyName = "";

        var self=this;
        var cnds = cr.plugins_.Rex_GoogleWebFontLoader.prototype.cnds;
        window["WebFontConfig"] = {
            "loading": function() {self.runtime.trigger(cnds.OnLoading, self);},
            "active": function() {self.runtime.trigger(cnds.OnActive, self);},
            "inactive": function() {self.runtime.trigger(cnds.OnInactive, self);},
            "fontloading": function(familyName, fvd) { self.exp_LastFamilyName=familyName; self.runtime.trigger(cnds.OnFontloading, self);},
            "fontactive": function(familyName, fvd) { self.exp_LastFamilyName=familyName; self.runtime.trigger(cnds.OnFontactive, self);},
            "fontinactive": function(familyName, fvd) { self.exp_LastFamilyName=familyName; self.runtime.trigger(cnds.OnFontinactive, self);},
            
            "timeout": this.timeout,
        };
	};
    
	instanceProto.onDestroy = function ()
	{
	};   

    instanceProto.LoadAPI = function(file_name, onload_, onerror_)
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
            newScriptTag["type"] = "text/javascript";
            newScriptTag["src"] = file_name;
            
            // onLoad callback
            var self=this;        
            var onLoad = function()
            {
                self.isLoaded = true;
                if (onload_)
                    onload_();
            };
            var onError = function()
            {
                if (onerror_)
                    onerror_();
            };        
            newScriptTag["onload"] = onLoad;
            newScriptTag["onerror"] = onError;            
	    	document.getElementsByTagName("head")[0].appendChild(newScriptTag);
	    }
	};

    var getAPISrc = function (isLocalAPI)
    {
        var url;
        if (isLocalAPI)
        {
            url = "webfont.js";
        }
        else
        {
            var protocol = ('https:' == document.location.protocol ? 'https' : 'http');
            url = protocol + "://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js";
        }
        return url;
    };
    
    var isCSSFile = function (url_)
    {
        var s = url_.split(".");
        var ext = s[ s.length-1 ];
        return (ext === "css");        
    }
    
    var insertCss = function ( code ) 
    {
        var style = document.createElement('style');
        style.type = 'text/css';
    
        if (style.styleSheet) 
        {
            // IE
            style.styleSheet.cssText = code;
        } 
        else 
        {
            // Other browsers
            style.innerHTML = code;
        }
    
        document.getElementsByTagName("head")[0].appendChild( style );
    };    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
	Cnds.prototype.OnLoading = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnActive = function ()
	{
	    return true;
	};
	Cnds.prototype.OnInactive = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnFontloading = function ()
	{
	    return true;
	};	
	Cnds.prototype.OnFontactive = function ()
	{
	    return true;
	};
	Cnds.prototype.OnFontinactive = function ()
	{
	    return true;
	};     
    
	Cnds.prototype.OnLoadAPIError = function ()
	{
	    return true;
	};      
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.Load = function()
	{
        if (this.isLoaded)  
        {            
            return;
        }
        else
        {
            var self=this;
            var on_error = function()
            {
                self.runtime.trigger(cr.plugins_.Rex_GoogleWebFontLoader.prototype.cnds.OnLoadAPIError, self);
            };
            this.LoadAPI(getAPISrc(this.isLocalAPI), null, on_error);
        }
	};	

	Acts.prototype.AddGoogleFont = function(name)
	{
        var fontsCfg = window["WebFontConfig"];
        if (!fontsCfg.hasOwnProperty("google"))
        {
            fontsCfg["google"] = { "families":[] };
        }
        var  families = fontsCfg["google"]["families"];
        if (cr.fastIndexOf(families, name) === -1)
            families.push(name);
	};	  

	Acts.prototype.AddTypekitFont = function(id, api)
	{
        var fontsCfg = window["WebFontConfig"];
        fontsCfg["typekit"] = {
            "id": id,
            "api": api,
        }   
	};	  

	Acts.prototype.AddFontsCom = function(projectId, version, loadAllFonts)
	{
        var fontsCfg = window["WebFontConfig"];
        fontsCfg["monotype"] = {
            "projectId": projectId,
            "version": version,
            "loadAllFonts": (loadAllFonts===1),
        }   
	};	 
    
	Acts.prototype.AddCustomFont = function(name, url)
	{
        var fontsCfg = window["WebFontConfig"];
        if (!fontsCfg.hasOwnProperty("custom"))
        {
            fontsCfg["custom"] = { "families":[] };
        }
        var  families = fontsCfg["custom"]["families"];
        if (cr.fastIndexOf(families, name) === -1)
            families.push(name);

        if (isCSSFile(url))
        {
            if (!fontsCfg["custom"].hasOwnProperty("urls"))
            {
                fontsCfg["custom"]["urls"] = [];
            }
            
            var urls = fontsCfg["custom"]["urls"];
            if (cr.fastIndexOf(urls, url) === -1)
                urls.push(url);
        }
        else
        {
            var cssCode = "@font-face { font-family: '" + name + "'; src: url('" + url + "'); }";
            insertCss(cssCode);
        }
	};	    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.LastFamilyName = function (ret)
	{
		ret.set_string(this.exp_LastFamilyName);
	}	
}());