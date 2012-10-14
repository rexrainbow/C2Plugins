// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Card = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Card.prototype;
		
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
        this.init_face = this.properties[0];    
		this.card_back = this.properties[1]; 	
	    this.card_front = this.properties[2];
	};

	behinstProto.tick = function ()
	{
        if (this.init_face != (-1))
        {
            this.trun_face(this.init_face==0);
            this.init_face = (-1);
        }
	};  

	behinstProto.trun_face = function(is_back_face)
	{
	    var frame_index = (is_back_face)? this.card_back:this.card_front;
	    cr.plugins_.Sprite.prototype.acts.SetAnimFrame.apply(this.inst, [frame_index]);
        this.init_face = (-1);
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.IsBackFace = function ()
	{  
	    return (this.inst.cur_frame == this.card_back);
	};
    
	Cnds.prototype.IsFrontFace = function ()
	{  
	    return (this.inst.cur_frame == this.card_front);	
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.SetBackFace = function (frame_index)
	{
		this.card_back = frame_index; 	
	};  	
	
    Acts.prototype.SetFrontFace = function (frame_index)
	{
	    this.card_front = frame_index;
	};  
	
    Acts.prototype.TurnBackFace = function ()
	{
	    this.trun_face(true);
	};  	
	
    Acts.prototype.TurnFrontFace = function ()
	{
	    this.trun_face(false);
	};   	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
}());