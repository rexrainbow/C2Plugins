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

	behinstProto.set_value = function (value)
	{
        value = Math.floor(value);
        this.value = value;
        var is_negative = (value < 0);
        var is_zero = (value == 0);
        var layouter=this.inst;
        var sprites=layouter.sprites; 
        var i, cnt=sprites.length, params;
        var _index, is_visible;    
        value = Math.abs(value);
	    for (i=0; i<cnt; i++)
	    {	        
            if (is_zero)
            {
                _index = 0;
                is_visible = 1;
                is_zero = false;
            }
            else if (value == 0)
            {
                if (is_negative)
                {
                    _index = 10;  // "-"
                    is_visible = 1;
                    is_negative = false;                    
                }
                else
                {
                    _index = 0;
                    is_visible = 0;
                }
            }
            else
            {
                _index = (value%10);
                is_visible = 1;
                value = Math.floor(value/10); 
            }
	        params = {frameindex: _index,   
                      visible: is_visible   
                      };
	        layouter.layout_inst(sprites[i], params);     
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