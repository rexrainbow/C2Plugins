// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_Query = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_Query.prototype;
		
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
	    jsfile_load("firebase.js");
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
	    this.rootpath = this.properties[0] + "/";
	    
	    this.current_query = null; 
	};
	
	instanceProto.get_ref = function(k)
	{
	    if (k == null)
	        k = "";
	        
	    var path;
	    if (k.substring(0,8) == "https://")
	        path = k;
	    else
	        path = this.rootpath + k + "/";
	        
        return new window["Firebase"](path);
	};
	    
	// export  
	instanceProto.GetQuery = function()
	{
        var q = this.current_query;
        this.current_query = null;
        return q;
	};	       
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.CreateNewQuery = function (k)
	{
	    this.current_query = this.get_ref(k);
	};
	
    Acts.prototype.OrderByKey = function ()
	{
	    assert2(this.current_query, "Firebase Query: create a new first.");
	    this.current_query = this.current_query["orderByKey"]();
	};	
	
    Acts.prototype.OrderByChild = function (child_name)
	{
	    assert2(this.current_query, "Firebase Query: create a new first.");
	    this.current_query = this.current_query["orderByChild"](child_name);
	};	
	
    Acts.prototype.OrderByPriority = function (child_name)
	{
	    assert2(this.current_query, "Firebase Query: create a new first.");
	    this.current_query = this.current_query["orderByPriority"]();
	};		
	
    Acts.prototype.OrderByValue = function ()
	{
	    assert2(this.current_query, "Firebase Query: create a new first.");
	    this.current_query = this.current_query["orderByValue"]();
	};		
    
    Acts.prototype.StartAt = function (v)
	{
	    assert2(this.current_query, "Firebase Query: create a new first.");
	    this.current_query = this.current_query["startAt"](v);
	};	
	
    Acts.prototype.EndAt = function (v)
	{
	    assert2(this.current_query, "Firebase Query: create a new first.");
	    this.current_query = this.current_query["endAt"](v);
	};		
	
    Acts.prototype.StartEndAt = function (v0, v1)
	{
	    assert2(this.current_query, "Firebase Query: create a new first.");
	    this.current_query = this.current_query["startAt"](v0)["endAt"](v1);
	};		
	
    Acts.prototype.EqualTo = function (v)
	{
	    assert2(this.current_query, "Firebase Query: create a new first.");
	    this.current_query = this.current_query["equalTo"](v);
	};		

    Acts.prototype.LimitToFirst = function (l)
	{
	    assert2(this.current_query, "Firebase Query: create a new first.");
	    this.current_query = this.current_query["limitToFirst"](l);
	};	
	
    Acts.prototype.LimitToLast = function (l)
	{
	    assert2(this.current_query, "Firebase Query: create a new first.");
	    this.current_query = this.current_query["limitToLast"](l);
	};		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	
}());