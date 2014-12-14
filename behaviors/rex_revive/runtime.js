// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Revive = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
    // global for all instances
    var _SID2Objtype = {};  
        
	var behaviorProto = cr.behaviors.Rex_Revive.prototype;
		
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
        this.timeline = null;   
        this.behavior_index = null;        
	};

    behtypeProto._timeline_get = function ()
    {
        if (this.timeline != null)
            return this.timeline;
    
        assert2(cr.plugins_.Rex_TimeLine, "Revive behavior: Can not find timeline oject.");
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Rex_TimeLine.prototype.Instance)
            {
                this.timeline = inst;
                return this.timeline;
            }
        }
        assert2(this.timeline, "Revive behavior: Can not find timeline oject.");
        return null;	
    };
    
    behtypeProto.SID2Type = function(sid)
    {
        if (_SID2Objtype[sid] == null)
        {
            _SID2Objtype[sid] = this.runtime.getObjectTypeBySid(sid);
        }
        return _SID2Objtype[sid];
    };    
    
    // handler of timeout for timers in this plugin, this=timer   
    var on_timeout = function ()
    {
        this.plugin.revive_inst(this.revive_data, this.custom_data);
    };
    
	behtypeProto.revive_inst = function(revive_data, custom_data)
	{
	    revive_data = JSON.parse(revive_data);
	    custom_data = JSON.parse(custom_data);
	     	    
	    var objtype = this.SID2Type(revive_data["sid"]);
        var layer = null;
        if (objtype.plugin.is_world)
        {
            layer = this.runtime.running_layout.getLayerBySid(revive_data["w"]["l"]);						
            if (!layer)
                return;
        }  
             
        var inst = window.RexC2CreateObject.call(this, objtype, layer, 0, 0, null, false);		
        this.runtime.loadInstanceFromJSON(inst, revive_data, true); 
      
        var behavior_inst = GetThisBehavior(inst);
        behavior_inst._mem = custom_data;
        this.runtime.trigger(cr.behaviors.Rex_Revive.prototype.cnds.OnRevive, inst); 
	};
	
	function GetThisBehavior(inst)
	{
		var i, len;
		for (i = 0, len = inst.behavior_insts.length; i < len; i++)
		{
			if (inst.behavior_insts[i] instanceof behaviorProto.Instance)
				return inst.behavior_insts[i];
		}
		
		return null;
	};	
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.activated = (this.properties[0]==1);
        this.revive_time = this.properties[1];
        this.revive_at = this.properties[2];
        this.revive_data = null;
        this.init_save_flg = true;
        this._mem = {};
	};

	behinstProto.onDestroy = function()
	{
        if (!this.activated)
            return;
            
        this.runtime.trigger(cr.behaviors.Rex_Revive.prototype.cnds.OnDestroy, this.inst);
        if (this.revive_at == 1)
        {
            this.revive_data = JSON.stringify(this.status_get());
        }
        var timeline = this.type._timeline_get();
        var timer = timeline.CreateTimer(on_timeout);
        timer.plugin = this.type;
        timer.revive_data = this.revive_data;
        timer.custom_data = JSON.stringify(this._mem);
        timer.Start(this.revive_time);  
	};

	behinstProto.status_get = function()
	{
        var status = this.runtime.saveInstanceToJSON(this.inst, true);
        var sid = this.inst.type.sid;
        status["sid"] = sid;
        _SID2Objtype[sid] = this.inst.type;
        return status;
	};
	
	behinstProto.tick = function ()
	{
	    if (!this.init_save_flg)
	        return;
	        
	    this.init_save_flg = false;
        if (this.revive_at == 0)
        {
            this.revive_data = JSON.stringify(this.status_get());
        }
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnDestroy = function ()
	{
		return true;
	};

	Cnds.prototype.OnRevive = function ()
	{
		return true;
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.Setup = function (timeline_objs)
	{
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.type.timeline = timeline;        
        else
            alert ("Revive behavior should connect to a timeline object");
	}; 
    
	Acts.prototype.SetActivated = function (s)
	{
		this.activated = s;
	};  
	
	Acts.prototype.SetReviveTime = function (t)
	{
        this.revive_time = t;
	};
        
	Acts.prototype.SetMemory = function (index, value)
	{
        this._mem[index] = value;
	};    

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

    Exps.prototype.Mem = function (ret, index)
	{
        var value = this._mem[index];
        if (value == null) 
            value = 0;
	    ret.set_any(value);
	};
}());

(function ()
{
    // general CreateObject function which call a callback before "OnCreated" triggered
    if (window.RexC2CreateObject != null)
        return;
        
    // copy from system action: CreateObject
    var CreateObject = function (obj, layer, x, y, callback, ignore_picking)
    {
        if (!layer || !obj)
            return;

        var inst = this.runtime.createInstance(obj, layer, x, y);
		
		if (!inst)
			return;
		
		this.runtime.isInOnDestroy++;
		
		// call callback before "OnCreated" triggered
		if (callback)
		    callback(inst);
		// call callback before "OnCreated" triggered
		
		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s);
			}
		}
		
		this.runtime.isInOnDestroy--;

        if (ignore_picking !== true)
        {
            // Pick just this instance
            var sol = obj.getCurrentSol();
            sol.select_all = false;
		    sol.instances.length = 1;
		    sol.instances[0] = inst;
		
		    // Siblings aren't in instance lists yet, pick them manually
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
        }

        // add solModifiers
        //var current_event = this.runtime.getCurrentEventStack().current_event;
        //current_event.addSolModifier(obj);
        // add solModifiers
        
		return inst;
    };
    
    window.RexC2CreateObject = CreateObject;
}());
    