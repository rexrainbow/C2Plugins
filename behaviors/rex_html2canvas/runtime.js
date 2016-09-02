// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_HTML2Canvas = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_HTML2Canvas.prototype;
		
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
        this.useCORS = (this.properties[0] === 1);
        this.exp_snapShot = "";    
	};

	behinstProto.tick = function ()
	{
	};  
    
	behinstProto.getHtmlElem = function ()
	{
        var elem, inst=this.inst;
        if (inst.elem)
            elem = inst.elem;
        
        return elem;
	};      
    
	behinstProto.saveToJSON = function ()
	{
		return { "ss": this.exp_snapShot };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.exp_snapShot = o["ss"];
	};	
	 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	Cnds.prototype.OnSnapshot = function ()
	{
		return true;
	};	   
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.Snapshot = function ()
	{
        var elem = this.getHtmlElem();
        if (elem == null)
            return;
        
        var self=this;
        var onSnapShot = function (canvas)
        {
            self.exp_snapShot = canvas.toDataURL('image/png')
            self.runtime.trigger(cr.behaviors.Rex_HTML2Canvas.prototype.cnds.OnSnapshot, self.inst) ;
        }
        var options = {
            "onrendered": onSnapShot,
            "useCORS": this.useCORS,
        };
        window["html2canvas"](elem, options)
	};  
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.Snapshot = function (ret)
	{
		ret.set_string(this.exp_snapShot);
	};   
    
}());