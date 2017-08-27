// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_NGIO_Medal = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_NGIO_Medal.prototype;
		
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
        this.ngio = null;
        this.lastResult = null;
        this.lastMedals = null;
        this.exp_LoopIndex = 0;
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
    
    instanceProto.GetNGIO = function ()
	{
        if (this.ngio != null)
            return this.ngio;
            
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            
            if (cr.plugins_.Rex_NGIO_Authentication && (inst instanceof cr.plugins_.Rex_NGIO_Authentication.prototype.Instance))
            {
                this.ngio = inst.GetNGIO();
                return this.ngio;
            }            
        }
        assert2(this.ngio, "NGIO.Medal: Can not find NGIO Authentication oject.");
        return null; 
	};    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnGetMedalsListSuccess= function () { return true; };     
	Cnds.prototype.OnGetMedalsListError= function () { return true; };     
    
	Cnds.prototype.ForEachMedal = function ()
	{
        if (!this.lastMedals)
            return false;
                
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();

		var i, cnt=this.lastMedals.length;
		for(i=0; i<cnt; i++)
		{
            if (solModifierAfterCnds)            
                this.runtime.pushCopySol(current_event.solModifiers);            
            
            this.exp_LoopIndex = i;
            this.exp_CurMedal = this.lastMedals[this.exp_LoopIndex]; 
            current_event.retrigger();
            
		    if (solModifierAfterCnds)		    
		        this.runtime.popSol(current_event.solModifiers);		   
		}
     		
		return false;
	}; 
    
	Cnds.prototype.CurMedalIsSecret= function () 
    {     
        return this.exp_CurMedal && this.exp_CurMedal["secret"]; 
    };
    
	Cnds.prototype.CurMedalIsUnlocked= function () 
    {     
        return this.exp_CurMedal && this.exp_CurMedal["unlocked"]; 
    };
    
	Cnds.prototype.CompareCurMedalDifficulty= function (cmp, s)
    {     
        if (this.exp_CurMedal && this.exp_CurMedal["difficulty"])
            return cr.do_cmp(this.exp_CurMedal["difficulty"], cmp, s-1);
        
        return false;
    };    
    
	Cnds.prototype.Index2MedalIsSecret= function (index) 
    {
        return this.lastMedals && this.lastMedals[index] && this.lastMedals[index]["secret"]; 
    };
    
	Cnds.prototype.Index2MedalIsUnlocked= function (index) 
    {     
        return this.lastMedals && this.lastMedals[index] && this.lastMedals[index]["unlocked"]; 
    }; 
    
	Cnds.prototype.CompareIndex2MedalDifficulty= function (index, cmp, s)
    {     
        if (this.lastMedals && this.lastMedals[index])        
            return cr.do_cmp(this.lastMedals[index]["difficulty"], cmp, s-1);

        return false;
    };        
    
	Cnds.prototype.OnUnlockMedalSuccess= function () { return true; };     
	Cnds.prototype.OnUnlockMedalError= function () { return true; };     
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    var getHandler = function (self, successTrig, errorTrig, callback)
    {      
        var handler =  function(result) 
        {
            if (callback)
                callback(result);
            
            self.lastResult = result;    
            var trig = (result["success"])? successTrig:errorTrig;
            self.runtime.trigger(trig, self);
        };
        return handler;
    };
    
    Acts.prototype.GetList = function ()
	{
        var self=this;
        var getMedals = function(result)
        {
            if  (result["success"])
            {
                self.lastMedals = [];
                var medals = result["medals"], medal;
                var i, cnt=medals.length;
                for (i=0; i<cnt; i++)
                {
                    medal = medals[i];
                    var data = {
                        "description": medal["description"],
                        "difficulty": medal["difficulty"],
                        "icon": medal["icon"],
                        "id": medal["id"],                      
                        "name": medal["name"],
                        "secret": medal["secret"],                
                        "value": medal["value"],                               
                    };
                    if (medal["unlocked"] != null)
                        data["unlocked"] = medal["unlocked"];
                    
                    self.lastMedals.push(data);
                }
            }
            else                
            {
                self.lastMedals = null;
            }    
            
        };
        
        var cnds = cr.plugins_.Rex_NGIO_Medal.prototype.cnds;
        var callback = getHandler(this, cnds.OnGetMedalsListSuccess, cnds.OnGetMedalsListError, getMedals);
        this.GetNGIO()["callComponent"]("Medal.getList", {}, callback);
	};             
    
    Acts.prototype.Unlock = function (id)
	{
        var cnds = cr.plugins_.Rex_NGIO_Medal.prototype.cnds;
        var callback = getHandler(this, cnds.OnUnlockMedalSuccess, cnds.OnUnlockMedalError);
        var param = {
            "id": id,
            };        
        this.GetNGIO()["callComponent"]("Medal.unlock", param, callback);
	};  
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.ErrorMessage = function (ret)
	{
        var val;
        if (this.lastResult && this.lastResult["error"])
            val = this.lastResult["error"]["message"];
	    ret.set_string(val || "");
	};    
    
	Exps.prototype.MedalsAsJSON = function (ret)
	{
        var val;
        if (this.lastMedals)
            val = JSON.stringify( this.lastMedals );
	    ret.set_string(val || "");
	};	        
    
	Exps.prototype.CurMedalDescription = function (ret)
	{
        var val;
        if (this.exp_CurMedal)
            val = this.exp_CurMedal["description"];
	    ret.set_string(val || "");
	};	 
    
	Exps.prototype.CurMedalDifficulty = function (ret)
	{
        var val;
        if (this.exp_CurMedal)
            val = this.exp_CurMedal["difficulty"];
	    ret.set_int(val || -1);
	};	     
    
	Exps.prototype.CurMedalIcon = function (ret)
	{
        var val;
        if (this.exp_CurMedal)
            val = this.exp_CurMedal["icon"];
	    ret.set_string(val || "");
	};	     
    
	Exps.prototype.CurMedalID = function (ret)
	{
        var val;
        if (this.exp_CurMedal)
            val = this.exp_CurMedal["id"];
	    ret.set_int(val || -1);
	};	       
    
	Exps.prototype.CurMedalName = function (ret)
	{
        var val;
        if (this.exp_CurMedal)
            val = this.exp_CurMedal["name"];
	    ret.set_string(val || "");
	};	  
    
	Exps.prototype.CurMedalValue = function (ret)
	{
        var val;
        if (this.exp_CurMedal)
            val = this.exp_CurMedal["value"];
	    ret.set_int(val || -1);
	};
    
	Exps.prototype.CurMedalIsSecret = function (ret)
	{
        var val;
        if (this.exp_CurMedal)
            val = (this.exp_CurMedal["secret"])? 1:0;
	    ret.set_int(val || -1);
	};
    
	Exps.prototype.CurMedalIsUnlocked = function (ret)
	{
        var val;
        if (this.exp_CurMedal)
            val = (this.exp_CurMedal["unlocked"])? 1:0;
	    ret.set_int(val || -1);
	};   
    
	Exps.prototype.LoopIndex = function (ret)
	{
	    ret.set_int(this.exp_LoopIndex);
	};   
    
	Exps.prototype.Index2MedalDescription = function(ret, index)
	{
        var val;
        if (this.lastMedals && this.lastMedals[index])
            val = this.lastMedals[index]["description"];
	    ret.set_string(val || "");
	};	 
    
	Exps.prototype.Index2MedalDifficulty = function (ret, index)
	{
        var val;
        if (this.lastMedals && this.lastMedals[index])
            val = this.lastMedals[index]["difficulty"];
	    ret.set_int(val || -1);
	};	     
    
	Exps.prototype.Index2MedalIcon = function (ret)
	{
        var val;
        if (this.lastMedals && this.lastMedals[index])
            val = this.lastMedals[index]["icon"];
	    ret.set_string(val || "");
	};	     
    
	Exps.prototype.Index2MedalID = function (ret, index)
	{
        var val;
        if (this.lastMedals && this.lastMedals[index])
            val = this.lastMedals[index]["id"];
	    ret.set_int(val || -1);
	};	       
    
	Exps.prototype.Index2MedalName = function (ret, index)
	{
        var val;
        if (this.lastMedals && this.lastMedals[index])
            val = this.lastMedals[index]["name"];
	    ret.set_string(val || "");
	};	  
    
	Exps.prototype.Index2MedalValue = function (ret, index)
	{
        var val;
        if (this.lastMedals && this.lastMedals[index])
            val = this.lastMedals[index]["value"];
	    ret.set_int(val || -1);
	};
    
	Exps.prototype.Index2rMedalIsSecret = function (ret, index)
	{
        var val;
        if (this.lastMedals && this.lastMedals[index])
            val = (this.lastMedals[index]["secret"])? 1:0;
	    ret.set_int(val || -1);
	};
    
	Exps.prototype.Index2MedalIsUnlocked = function (ret, index)
	{
        var val;
        if (this.lastMedals && this.lastMedals[index])
            val = (this.lastMedals[index]["unlocked"])? 1:0;
	    ret.set_int(val || -1);
	};        
    
	Exps.prototype.MedalsCount = function (ret)
	{
        var val;
        if (this.lastMedals)
            val = this.lastMedals.lngth;
	    ret.set_int(val || 0);
	};	       
    
	Exps.prototype.LastUnlockedMedalID = function (ret)
	{
        var val; 
        if (this.lastResult && this.lastResult["medal"])
            val = this.lastResult["medal"]["id"];
	    ret.set_int(val || 0);
	}; 
}());