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
	    this.set_nickname(this.properties[0], this.properties[1]); 
	};

	behinstProto.tick = function ()
	{
	};  

	behinstProto.set_nickname = function (_nickname, _mode)
	{
	    if (cr.plugins_.Rex_Nickname == null)
		    return;
            
        var nickname = (_mode == 1)? this.inst.type.sid:
                                     _nickname;
        if (nickname == "")
        {
            nickname = cr.plugins_.Rex_Nickname.sid2nickname[this.inst.type.sid.toString()];  // try to get nickname from nickname plugin
            if (nickname != null)
                this.nickname = nickname;
            else
                this.nickname = "";
        }
        else
        {
	        this.nickname = nickname;                                     
            cr.plugins_.Rex_Nickname.AddNickname(nickname, this.inst.type);        
        }
        
	};  	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
			
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.Nickname = function (ret)
	{
		ret.set_any(this.nickname);
	};			
			
}());