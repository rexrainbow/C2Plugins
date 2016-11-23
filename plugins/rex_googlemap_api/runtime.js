// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.rex_googlemap_api = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	var pluginProto = cr.plugins_.rex_googlemap_api.prototype;
 
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
        this.isLoaded = false;
	};
    
        
    typeProto.LoadAPI = function(file_name, onload_, onerror_)
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
                onload_();
            };
            var onError = function()
            {
                onerror_();
            };        
            newScriptTag["onload"] = onLoad;
            newScriptTag["onerror"] = onError;            
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

	// called whenever an instance is created

	instanceProto.onCreate = function()
	{ 
        window.RexC2GoogleAPILoader = this;
        
        this.isLoadOK = null;
        this.pendingCallbacks = [];
        
        this.apiKey = this.properties[1];    
        this.apiLanguage = this.properties[2];        
        this.apiURLType = this.properties[3];
        
        if (this.properties[0] === 1)        
            this.LoadAPI(getAPIURL(this.apiURLType, this.apiLanguage, this.apiKey));
	};

    var APIURLTYPE_MAP = ["maps.googleapis.com", "maps.google.cn"];
	var getAPIURL = function(apiURLType, language, apiKey)
	{ 
        var protocol = window["location"]["protocol"];
        var url_= 'http' + (/^https/.test(protocol)?'s':'') + "://";
        url_ += APIURLTYPE_MAP[apiURLType];
        url_ += "/maps/api/js";
        
        if ((apiKey !== "") || (language !== ""))
            url_ += "?";
        
        if (apiKey !== "")
            url_ += "key=" + apiKey;
        if (language !== "")
            url_ += "language=" + language;
        
        return url_;
	};        
    
    instanceProto.tick = function()
    {        
        if (this.isLoadOK === null)
            return;
        
        if (this.isLoadOK === true)
        {
            var i, cnt=this.pendingCallbacks.length;
            for (i=0; i<cnt; i++)
            {
                this.pendingCallbacks[i]();
            }
            this.pendingCallbacks.length = 0;              
            this.runtime.trigger(cr.plugins_.rex_googlemap_api.prototype.cnds.OnLoaded, this);            
        }
        else if (this.isLoadOK === false)
        {       
            this.runtime.trigger(cr.plugins_.rex_googlemap_api.prototype.cnds.OnError, this);
        }            
        
        this.runtime.untickMe(this);   
    };
    
	instanceProto.LoadAPI = function(apiURL)
	{ 
        if (this.IsLoaded())
            return;
        
        var self=this;
        var onLoad = function()
        {
            self.isLoadOK = true;
        };
        
        var onError = function()
        {       
            self.isLoadOK = false;
        };        

        this.runtime.tickMe(this);         
	    this.type.LoadAPI(apiURL, onLoad, onError);       
	};
    
	instanceProto.AddPendingCallbacks = function(callback)
	{ 
        if (this.IsLoaded())
            return false;
        
        this.pendingCallbacks.push(callback);
        return true;       
	};

	instanceProto.IsLoaded = function()
	{ 
        return this.type.isLoaded;   
	};
	//////////////////////////////////////
	// Conditions
    function Cnds() {};
	pluginProto.cnds = new Cnds();  

	Cnds.prototype.OnLoaded = function ()
	{
		return true;
	};	
	
	Cnds.prototype.IsLoaded = function ()
	{
		return this.IsLoaded();
	};	  

	Cnds.prototype.OnError = function ()
	{
		return true;
	};	    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.Load = function ()
	{
        this.LoadAPI(getAPIURL(this.apiURLType, this.apiLanguage, this.apiKey));
	};    

	Acts.prototype.SetLanguage = function (lang)
	{
        this.apiLanguage = lang;
	};  

	Acts.prototype.SetAPIURL = function (apiURLType)
	{
        this.apiURLType = apiURLType;
	};  

	Acts.prototype.SetAPIKey = function (key)
	{
        this.apiKey = key;
	};  
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();      
    
}());