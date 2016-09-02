/*
in\
    <pushAt>

out\
    <pushAt>
    
*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_SyncQueue = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var input_text = "";
	var pluginProto = cr.plugins_.Rex_Firebase_SyncQueue.prototype;
		
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
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/";   
	    this.tokenCtrl = null;     
	    
	    this.has_input_handler = false;
	    this.exp_LastIn = null;   
	    this.on_get_indata = null;           
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
	
    // for tokenCtl object
    instanceProto.OnGetToken = function ()
    {
        // listen in-channel   
        var self = this;     
        var on_get_indata = function(snapshot)
        {
            var d = snapshot["val"]();
            if (d == null)
                return;            
            self.OnGetInputData(d);
        };
        this.on_get_indata = on_get_indata;
        this.get_ref("in")["on"]("child_added", on_get_indata);
    };  
    instanceProto.OnReleaseToken = function ()
    {
        // remove in-channel listening        
        if (!this.on_get_indata)
            return;            
        this.get_ref("in")["off"]("child_added", this.on_get_indata);
        this.on_get_indata = null;
    };  	
    
    // token owner only
    instanceProto.OnGetInputData = function (d)
    {
        // process in-data to out-data
        this.exp_LastIn = din(d);
	    this.has_input_handler = false;
	    this.runtime.trigger(cr.plugins_.Rex_Firebase_SyncQueue.prototype.cnds.OnGetInputData, this);	    	   
	    // process in-data to out-data

        // push out-data
        if (!this.has_input_handler)
        {
            this.get_ref("out")["push"](d);
        }

        // remove from in-channel   
        var k = snapshot["key"]();
        this.get_ref("in")["child"](k)["remove"]();        
    };    
    
    var din = function (d)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (typeof(d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
	    return o;
    };
    
    var dout = function (d)
    {
        var o;
        if (typeof(d) == "string")	
        {        
            try
            {
	            o = JSON.parse(d) 
            }
            catch(err)
            {
                o = d;
            } 
        }
        else
        {
            o = d;
        }
        return o;
    };      
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnGetData = function ()
	{
	    return true;
	};
    
	Cnds.prototype.OnGetInputData = function ()
	{
	    this.has_input_handler = true;
	    return true;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
     Acts.prototype.SetupToken = function (token_objs)
	{   
	    // release token
	    if (this.tokenCtrl)
	    {
	        this.tokenCtrl.Remove(this);
	        this.tokenCtrl = null;
	    }

        var token_inst = token_objs.instances[0];
        if (token_inst.GetTokenCtrl)
        {
            this.tokenCtrl = token_inst.GetTokenCtrl();
            this.tokenCtrl.Add(this);
        }      
        else
            alert ("Sync Queue should connect to a token object");               
	};
	
    Acts.prototype.Push2In = function (d)
	{	    
	    this.get_ref("in")["push"](dout(d));
	};
	
    Acts.prototype.Push2Out = function (d)
	{	           
        this.get_ref("out")["push"](dout(d));
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.LastIn = function (ret)
	{
		ret.set_any(this.exp_LastIn);
	};
}());