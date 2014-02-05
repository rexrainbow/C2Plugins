// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Replacer = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Replacer.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	    this.nickname_object = null;
	};
  
	behtypeProto._nickname_inst_get = function ()
	{
	    if (this.nickname_object != null)
	    {
	        return this.nickname_object;
	    }
	    
	    assert2(cr.plugins_.Rex_Nickname, "Replacer behavior: Could not find nickname plugin.");

        var plugins = this.runtime.types;			
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            
            if (inst instanceof cr.plugins_.Rex_Nickname.prototype.Instance)
            {
                this.nickname_object = inst;
                return inst;
            }                                          
        }
        return null;
	};
	
	behtypeProto.Nickname2Type = function (nickname)
	{
	    var nickname_inst = this._nickname_inst_get();
	    if (nickname_inst == null)
	        return null;
	        
	    return nickname_inst.Nickname2Type(nickname);
	};
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;       
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

    var CMD_IDLE = 0;
    var CMD_FADEOUT = 1;
    var CMD_FADEIN = 2;    
	behinstProto.onCreate = function()
	{      
        this.fade_duration = this.properties[0];	     
        this.fade = null;
        this.cmd = CMD_IDLE;
        this.ReplacingInstUID = -1;
	};

	behinstProto.tick = function ()
	{
	    if (this.cmd == CMD_IDLE)
	        return;
	        
	    var dt = this.runtime.getDt(this.inst);
	    if (dt == 0)
	        return;
	        
	    var is_continue = this.fade.tick(dt);
	    
        this.inst.opacity = this.fade.value;
        this.runtime.redraw = true;
        
	    if (!is_continue)
	    {  
	        if (this.cmd == CMD_FADEOUT)
	        {
	            this.runtime.trigger(cr.behaviors.Rex_Replacer.prototype.cnds.OnFadeOutStart, this.inst);
	            this.runtime.DestroyInstance(this.inst);
	        }
	        else  // CMD_FADEIN
	        {
	            this.runtime.trigger(cr.behaviors.Rex_Replacer.prototype.cnds.OnFadeInStart, this.inst);
	        }
	        this.cmd = CMD_IDLE;
	    }
	};  
	
  	behinstProto.fadeout_start = function (duration)
	{          
	    if (this.fade == null)
	    {
	        this.fade = new cr.behaviors.Rex_Replacer.LinearInterpolationKlass();
	    }
	    
	    this.cmd = CMD_FADEOUT;
	    this.fade.start(this.inst.opacity, 0, duration);
	    this.runtime.trigger(cr.behaviors.Rex_Replacer.prototype.cnds.OnFadeOutStart, this.inst);   
	};	
	
  	behinstProto.fadein_start = function (duration)
	{     
	    if (this.fade == null)
	    {
	        this.fade = new cr.behaviors.Rex_Replacer.LinearInterpolationKlass();
	    }

	    this.cmd = CMD_FADEIN;
	    this.fade.start(0, this.inst.opacity, duration);
	    this.runtime.trigger(cr.behaviors.Rex_Replacer.prototype.cnds.OnFadeInStart, this.inst);  
	};
	
	function GetReplacerBehavior(inst)
	{
		var i, len;
		for (i = 0, len = inst.behavior_insts.length; i < len; i++)
		{
			if (inst.behavior_insts[i] instanceof behaviorProto.Instance)
				return inst.behavior_insts[i];
		}
		
		return null;
	};
	
  	behinstProto.pushback_inst = function (target_inst)
	{     
	    var layer_insts = this.inst.layer.instances;
	    var targetZ = target_inst.get_zindex();
	    cr.arrayRemove(layer_insts, targetZ);
        var insertZ = this.inst.get_zindex();
        layer_insts.splice(insertZ, 0, target_inst);
        this.inst.layer.zindices_stale = true;				
		this.runtime.redraw = true;        
	};
			
  	behinstProto.replaceTo = function (objtype)
	{     
	    this.fadeout_start(this.fade_duration);
	    var target_inst = this.create_inst(objtype);
	    if (target_inst == null)
	        return;
	    this.ReplacingInstUID = target_inst.uid;
	    this.pushback_inst(target_inst);
	    var replacer_inst = GetReplacerBehavior(target_inst);
	    if (replacer_inst == null)
	        return;
	    replacer_inst.fadein_start(this.fade_duration);     
	};
	
	behinstProto.create_inst = function (objtype)
	{
        var inst = this.runtime.createInstance(objtype, 
                                               this.inst.layer, this.inst.x, this.inst.y ); 
		if (inst == null)
		    return null;
		
        var sol = inst.type.getCurrentSol();
        sol.select_all = false;
		sol.instances.length = 1;
		sol.instances[0] = inst;
		
		// Siblings aren't in instance lists yet, pick them manually
		var i, len, s;
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				sol = s.type.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = s;
			}
		}
        
		this.runtime.isInOnDestroy++;
		this.runtime.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnCreated, inst);
		this.runtime.isInOnDestroy--;
        
	    return inst;
	}; 		
	
	behinstProto.saveToJSON = function ()
	{
		return { "fd": this.fade_duration,
		         "fade": (this.fade == null)? null: this.fade.saveToJSON(),
                 "cmd": this.cmd,
                 "touid": this.ReplacingInstUID };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.fade_duration = o["fd"];
		var fade_obj = o["fade"];
		if (fade_obj == null)		    
		    this.fade = null;
		else
		{
		    this.fade = new cr.behaviors.Rex_Replacer.LinearInterpolationKlass();
		    this.fade.loadFromJSON(fade_obj);
		}
		this.cmd = o["cmd"];
		this.ReplacingInstUID = o["touid"];
	};	
	 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnFadeOutStart = function ()
	{
		return true;
	};

	Cnds.prototype.OnFadeOutFinish = function ()
	{
		return true;
	};   

	Cnds.prototype.OnFadeInStart = function ()
	{
		return true;
	};

	Cnds.prototype.OnFadeInFinish = function ()
	{
		return true;
	};
	
	Cnds.prototype.IsFadeOut = function ()
	{
		return (this.cmd == CMD_FADEOUT);
	};

	Cnds.prototype.IsFadeIn = function ()
	{
		return (this.cmd == CMD_FADEIN);
	};

	Cnds.prototype.IsIdle = function ()
	{
		return (this.cmd == CMD_IDLE);
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.ReplaceInst = function (objtype)
	{
        if (typeof(objtype) == "string")
        {
            objtype = this.type.Nickname2Type(objtype);
        }
        if (!objtype)
            return;
            
        this.replaceTo(objtype);                           
	}; 
	
    Acts.prototype.SetDuration = function (t)
	{
       this.fade_duration = t;                           
	}; 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.ReplacingInstUID = function (ret)
	{
		ret.set_int(this.ReplacingInstUID);
	}; 
}());

(function ()
{
    // command queue
    cr.behaviors.Rex_Replacer.LinearInterpolationKlass = function()
    {
    };
    var LinearInterpolationKlassProto = cr.behaviors.Rex_Replacer.LinearInterpolationKlass.prototype;
    
    LinearInterpolationKlassProto.start = function(start, end, duration)
	{
        this.start_value = start;
        this.delta_value = end - start;      
        this.duration = duration;
        this.accDt = 0; 
        this.value = start;           
	};
	
    LinearInterpolationKlassProto.tick = function(dt)
	{
         this.accDt += dt;
         var p = (this.accDt >= this.duration)? 1 : (this.accDt/this.duration); 
         this.value = (p*this.delta_value) + this.start_value;         
         return (p < 1);
	};	
	
	LinearInterpolationKlassProto.saveToJSON = function ()
	{
		return { "s": this.start_value,
                 "dv": this.delta_value,
                 "dt": this.duration,
                 "accDt": this.accDt,
                 "v": this.value,
               };
	};
	
	LinearInterpolationKlassProto.loadFromJSON = function (o)
	{
		this.start_value = o["s"];
		this.delta_value = o["dv"];
		this.duration = o["dt"];
		this.accDt = o["accDt"];	
		this.value = o["v"];				
	};	
}());