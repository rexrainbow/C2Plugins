// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_bNickname = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_bNickname.prototype;
		
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
	    this.nickname = null;
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
	    if (this.type.nickname == null)
            this.set_nickname(this.properties[0]); 
	};

	behinstProto.tick = function ()
	{
	};  

	behinstProto.set_nickname = function (nickname)
	{
	    this.type.nickname = nickname;
	    if (cr.plugins_.Rex_Nickname == null)
		    return;
		cr.plugins_.Rex_Nickname.nickname2objtype[nickname] = this.inst.type;
	};  	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetNickname = function (nickname)
	{
		this.set_nickname(nickname); 
	}; 			
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.Nickname = function (ret)
	{
		ret.set_string(this.type.nickname);
	};			
			
}());