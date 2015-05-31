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
        this.bet_recorder = [];
		this.cur_time = 0;
        this.pre_value = 0;
	};

	behinstProto.tick = function ()
	{ 
        var cnt = this.bet_recorder.length;	
	    if (cnt == 0)
		{
		    this.cur_time = 0;
			return;
		}

		this.cur_time += this.runtime.getDt(this.inst);
		this._bet_recorder_update();
	}; 
    
	behinstProto._bet_recorder_update = function ()
	{ 
        var i, cnt = this.bet_recorder.length;	
        this.pre_value = cnt;
		for (i=0; i<cnt; i++)
		{
		    if ((this.cur_time - this.bet_recorder[i]) <= this.max_interval)
			    break;
		}
		
		if (i > 0)
		{
            if (i == 1)
                this.bet_recorder.shift();
            else
                this.bet_recorder.splice(0,i);		
        }
        
        if (this.bet_recorder.length != this.pre_value)
            this.runtime.trigger(cr.behaviors.Rex_betCounter.prototype.cnds.OnValueChanged, this.inst);  
	}; 
	behinstProto.bet = function (count)
	{   
        for(var i=0; i<count; i++)
	        this.bet_recorder.push(this.cur_time);
            
        this.runtime.trigger(cr.behaviors.Rex_betCounter.prototype.cnds.OnValueChanged, this.inst);   
	}; 
	
	behinstProto.saveToJSON = function ()
	{
		return { "ct": this.cur_time,
                 "br": this.bet_recorder,
                 "pv": this.pre_value    };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.cur_time = o["ct"];
        this.bet_recorder = o["br"];
        this.pre_value = o["pv"];
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.CompareBetCount = function (cmp, c)
	{
		return cr.do_cmp(this.bet_recorder.length, cmp, c);
	};
    
	Cnds.prototype.OnValueChanged = function (from, to)
	{
        if (from == null)
            return true;
        else 
            return (from == this.pre_value) && (to == this.bet_recorder.length);
	};    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.Bet = function (count)
	{
		this.bet(count);
	};  
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.BetCount = function (ret)
	{    
		ret.set_float(this.bet_recorder.length);
	};  
}());