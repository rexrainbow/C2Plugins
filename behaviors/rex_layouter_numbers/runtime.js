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
	behinstProto.set_value = function (value)
	{
        this.value = Math.floor(value);
        if (!cr.plugins_.Sprite)
            return;
        var set_frameindex = cr.plugins_.Sprite.prototype.acts.SetAnimFrame;
        var layouter=this.inst;
        var sprites=layouter.sprites; 
        var i, cnt=sprites.length, inst;
                  
        var value_string = this.value.toString();          
        var last_index = value_string.length-1;
        var c, string_index = 0;
	    for (i=0; i<cnt; i++)
	    {	    
	        inst = this.runtime.getObjectByUID(sprites[i]);
	        if (! (inst instanceof cr.plugins_.Sprite.prototype.Instance) )
	           continue;	            
	        
	        c = value_string.charAt(last_index - string_index);  
            set_frameindex.call(inst, char2frameindex[c]);
            string_index += 1;
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
    
	Acts.prototype.SetValue = function (v)
	{
		this.set_value(v);		
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