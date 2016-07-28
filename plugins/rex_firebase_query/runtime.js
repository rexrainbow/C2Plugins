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
	
    // 2.x , 3.x    
	var isFirebase3x = function()
	{ 
        return (window["FirebaseV3x"] === true);
    };
    
    var isFullPath = function (p)
    {
        return (p.substring(0,8) === "https://");
    };
	
	instanceProto.get_ref = function(k)
	{
        if (k == null)
	        k = "";
	    var path;
	    if (isFullPath(k))
	        path = k;
	    else
	        path = this.rootpath + k + "/";
            
        // 2.x
        if (!isFirebase3x())
        {
            return new window["Firebase"](path);
        }  
        
        // 3.x
        else
        {
            var fnName = (isFullPath(path))? "refFromURL":"ref";
            return window["Firebase"]["database"]()[fnName](path);
        }
        
	};
    
    var get_key = function (obj)
    {       
        return (!isFirebase3x())?  obj["key"]() : obj["key"];
    };
    
    var get_root = function (obj)
    {       
        return (!isFirebase3x())?  obj["root"]() : obj["root"];
    };
    
    var serverTimeStamp = function ()
    {       
        if (!isFirebase3x())
            return window["Firebase"]["ServerValue"]["TIMESTAMP"];
        else
            return window["Firebase"]["database"]["ServerValue"];
    };       

    var get_timestamp = function (obj)    
    {       
        return (!isFirebase3x())?  obj : obj["TIMESTAMP"];
    };    
    // 2.x , 3.x  
	    
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
 
     Acts.prototype.SetDomainRef = function (ref)
	{
	    this.rootpath = ref + "/"; 
	}; 	
    
    Acts.prototype.CreateNewQuery = function (k)
	{
	    this.current_query = this.get_ref(k);
	};
	
    Acts.prototype.OrderByKey = function ()
	{
        if (this.current_query === null)
            this.current_query = this.get_ref();

	    this.current_query = this.current_query["orderByKey"]();
	};	
	
    Acts.prototype.OrderByChild = function (child_name)
	{
        if (this.current_query === null)
            this.current_query = this.get_ref();
            
	    this.current_query = this.current_query["orderByChild"](child_name);
	};	
	
    Acts.prototype.OrderByPriority = function (child_name)
	{
        if (this.current_query === null)
            this.current_query = this.get_ref();
            
	    this.current_query = this.current_query["orderByPriority"]();
	};		
	
    Acts.prototype.OrderByValue = function ()
	{
        if (this.current_query === null)
            this.current_query = this.get_ref();
            
	    this.current_query = this.current_query["orderByValue"]();
	};		
    
    Acts.prototype.StartAt = function (v)
	{
        if (this.current_query === null)
            this.current_query = this.get_ref();
            
	    this.current_query = this.current_query["startAt"](v);
	};	
	
    Acts.prototype.EndAt = function (v)
	{
        if (this.current_query === null)
            this.current_query = this.get_ref();
            
	    this.current_query = this.current_query["endAt"](v);
	};		
	
    Acts.prototype.StartEndAt = function (v0, v1)
	{
        if (this.current_query === null)
            this.current_query = this.get_ref();
            
	    this.current_query = this.current_query["startAt"](v0)["endAt"](v1);
	};		
	
    Acts.prototype.EqualTo = function (v)
	{
        if (this.current_query === null)
            this.current_query = this.get_ref();
            
	    this.current_query = this.current_query["equalTo"](v);
	};		
    
    Acts.prototype.LimitToFirst = function (l)
	{
        if (this.current_query === null)
            this.current_query = this.get_ref();
            
	    this.current_query = this.current_query["limitToFirst"](l);
	};	
	
    Acts.prototype.LimitToLast = function (l)
	{
        if (this.current_query === null)
            this.current_query = this.get_ref();
            
	    this.current_query = this.current_query["limitToLast"](l);
	};		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	
}());