// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Appwarp_Timer = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Appwarp_Timer.prototype;
		
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
	    jsfile_load("App42-all-2.9.1.min.js");
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
	    if (!window.RexC2IsAppwarpInit)
	    {
	        window["App42"]["initialize"](this.properties[0], this.properties[1]);
	        window.RexC2IsAppwarpInit = true;
	    }
        
        this.exp_CurrentTime = 0;
        this.exp_UTCTime = "";
	};         
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();   

	Cnds.prototype.OnGetCurrentTimeSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnGetCurrentTimeError = function ()
	{
	    return true;
	};   
    
	Cnds.prototype.OnCreateOrUpdateTimerSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnCreateOrUpdateTimerError = function ()
	{
	    return true;
	};     

	Cnds.prototype.OnStartTimerSuccessfully = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnStartTimerError = function ()
	{
	    return true;
	};   
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	    
    Acts.prototype.GetCurrentTime = function ()
	{
        var self = this;
        var on_success = function (object)
        {
            var timerObj = JSON.parse(object); 
            self.exp_UTCTime = timerObj["app42"]["response"]["timer"]["currentTime"];       
            self.exp_CurrentTime = Date.parse(self.exp_UTCTime);
            self.runtime.trigger(cr.plugins_.Rex_Appwarp_Timer.prototype.cnds.OnGetCurrentTimeSuccessfully, self);        
        };
        
        var on_error = function (error)
        {
            self.runtime.trigger(cr.plugins_.Rex_Appwarp_Timer.prototype.cnds.OnGetCurrentTimeError, self);  
        };
        var handler = {"success":on_success, "error":on_error};
	    var timerService  = new window["App42Timer"](); 
	    timerService["getCurrentTime"](handler);
	}; 

    Acts.prototype.CreateOrUpdateTimer = function (timerName, timeInSeconds)
	{
        var self = this;
        var on_success = function (object)
        {
            var timerObj = JSON.parse(object); 
            self.runtime.trigger(cr.plugins_.Rex_Appwarp_Timer.prototype.cnds.OnCreateOrUpdateTimerSuccessfully, self);        
        };
        
        var on_error = function (error)
        {
            self.runtime.trigger(cr.plugins_.Rex_Appwarp_Timer.prototype.cnds.OnCreateOrUpdateTimerError, self);  
        };
        var handler = {"success":on_success, "error":on_error};
	    var timerService  = new window["App42Timer"](); 
	    timerService["createOrUpdateTimer"](timerName, timeInSeconds, handler);
	}; 
    
    Acts.prototype.StartTimer = function (timerName, userName)
	{
        var self = this;
        var on_success = function (object)
        {
            var timerObj = JSON.parse(object); 
            self.runtime.trigger(cr.plugins_.Rex_Appwarp_Timer.prototype.cnds.OnStartTimerSuccessfully, self);        
        };
        
        var on_error = function (error)
        {
            self.runtime.trigger(cr.plugins_.Rex_Appwarp_Timer.prototype.cnds.OnStartTimerError, self);  
        };
        var handler = {"success":on_success, "error":on_error};
	    var timerService  = new window["App42Timer"](); 
	    timerService["startTimer"](timerName, userName, handler);
	};     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.CurrentTime = function(ret)
    {
        ret.set_float(this.exp_CurrentTime);
    };

    Exps.prototype.CurrentUTCTime = function(ret)
    {
        ret.set_string(this.exp_UTCTime);
    };
    
}());