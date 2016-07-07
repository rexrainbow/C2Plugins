// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_betCounter = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_betCounter.prototype;
		
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
	    this.max_interval = this.properties[0];
        this.beat_recorder = [];
		this.cur_time = 0;
        this.pre_value = 0;
	};

	behinstProto.tick = function ()
	{ 
        var cnt = this.beat_recorder.length;	
	    if (cnt == 0)
		{
		    this.cur_time = 0;
			return;
		}

		this.cur_time += this.runtime.getDt(this.inst);
		this._beat_recorder_update();
	}; 
    
	behinstProto._beat_recorder_update = function ()
	{ 
        var i, cnt = this.beat_recorder.length;	
        this.pre_value = cnt;
		for (i=0; i<cnt; i++)
		{
		    if ((this.cur_time - this.beat_recorder[i]) <= this.max_interval)
			    break;
		}
		
		if (i > 0)
		{
            if (i == 1)
                this.beat_recorder.shift();
            else
                this.beat_recorder.splice(0,i);		
        }
        
        if (this.beat_recorder.length != this.pre_value)
            this.runtime.trigger(cr.behaviors.Rex_betCounter.prototype.cnds.OnValueChanged, this.inst);  
	}; 
	behinstProto.beat = function (count)
	{   
        for(var i=0; i<count; i++)
	        this.beat_recorder.push(this.cur_time);
            
        this.runtime.trigger(cr.behaviors.Rex_betCounter.prototype.cnds.OnValueChanged, this.inst);   
	}; 
	
	behinstProto.saveToJSON = function ()
	{
		return { "ct": this.cur_time,
                 "br": this.beat_recorder,
                 "pv": this.pre_value    };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.cur_time = o["ct"];
        this.beat_recorder = o["br"];
        this.pre_value = o["pv"];
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.CompareBetCount = function (cmp, c)
	{
		return cr.do_cmp(this.beat_recorder.length, cmp, c);
	};
    
	Cnds.prototype.OnValueChanged = function (from_, to_)
	{
        if (from_ == null)
            return true;
        else 
            return (from_ == this.pre_value) && (to_ == this.beat_recorder.length);
	};    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.Beat = function (count)
	{
		this.beat(count);
	};  

	Acts.prototype.Clean = function ()
	{
		this.beat_recorder.length = 0;
	};      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.BetCount = function (ret)
	{    
		ret.set_int(this.beat_recorder.length);
	};  
    
	Exps.prototype.BeatCount = function (ret)
	{    
		ret.set_int(this.beat_recorder.length);
	};      
    
}());