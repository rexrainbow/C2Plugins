// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_layouter_numbers = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_layouter_numbers.prototype;
		
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
		this.inst = inst;
		this.runtime = type.runtime;       
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
	    this.check_name = "LAYOUTER";
        this.value = 0;
	};

	behinstProto.tick = function ()
	{
	};  

    var char2frameindex = { "0":0, "1":1, "2":2, "3":3, "4":4, 
                            "5":5, "6":6, "7":7, "8":8, "9":9, 
                            "": 10, "-": 11 };
	behinstProto.setValue = function (value)
	{
        this.value = Math.floor(value);
        if (!cr.plugins_.Sprite)
            return;
        var setFrameIndexFn = cr.plugins_.Sprite.prototype.acts.SetAnimFrame;
        var setAminSpeedFn = cr.plugins_.Sprite.prototype.acts.SetAnimSpeed;
        var layouter=this.inst;
        var sprites=layouter.sprites; 
        var i, cnt=sprites.length, inst;
                  
        var valueString = this.value.toString();          
        var lastIndex = valueString.length-1;
        var c, stringIndex = 0, frame_index;
	    for (i=0; i<cnt; i++)
	    {	    
	        inst = this.runtime.getObjectByUID(sprites[i]);
	        if (! (inst instanceof cr.plugins_.Sprite.prototype.Instance) )
	           continue;	            
	        
	        c = valueString.charAt(lastIndex - stringIndex);  
            frame_index = char2frameindex[c];            
            if (inst.cur_frame != frame_index)
                setFrameIndexFn.call(inst, frame_index);
            if (inst.cur_anim_speed != 0)
                setAminSpeedFn.call(inst, 0);
            stringIndex += 1;
	    }
	};  
	behinstProto.saveToJSON = function ()
	{
		return { "v": this.this.value
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{            
        this.value = o["v"];
	};       
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.CreateNumberSprites = function (objtype, digit_cnt)
	{
	    if (!objtype)
	        return;
	    assert2(cr.plugins_.Sprite, "Layouter number: you should assign a sprite objct for digit.");	    
        var i, inst;
        var tempInsts = [];
        for (i=0; i<digit_cnt; i++)
        {
            inst = this.inst.createInstance(objtype, 0, 0);
            tempInsts.push(inst);
        }   
        this.inst.addInsts(tempInsts); 	
	};    
	Acts.prototype.SetValue = function (v)
	{
		this.setValue(v);		
	}; 
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.Value = function (ret)
	{
	    ret.set_float(this.value);
	};	
}());