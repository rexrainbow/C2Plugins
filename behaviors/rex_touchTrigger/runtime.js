// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_TriggerTouch = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_TriggerTouch.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;
    
        
    var TouchStartEvtNames = ["pointerdown", "MSPointerDown", "touchstart", "mousedown"];
    var TouchEndEvtNames = ["pointerup", "MSPointerUp", "touchend", "mouseup"];       
    var TouchMoveEvtNames = ["pointermove", "MSPointerMove", "touchmove", "mousemove"];    
	var dummyoffset = {left: 0, top: 0};  
    var elem = jQuery(document);    
	behtypeProto.onCreate = function()
	{
        this.touchStyle = (window.navigator["pointerEnabled"])? 0:
                                   (window.navigator["pointerEnabled"])? 1:
                                   2;
        
        this.useMouseInput = null;
	};
    
    behtypeProto.GetUseMouseInput = function()
    {
        if (this.useMouseInput !== null)
            return this.useMouseInput;
            
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            
            if ( (cr.plugins_.Touch && (inst instanceof cr.plugins_.Touch.prototype.Instance)) ||
                 (cr.plugins_.rex_TouchWrap && (inst instanceof cr.plugins_.rex_TouchWrap.prototype.Instance)) )
            {
                this.useMouseInput = inst.useMouseInput;
                return this.useMouseInput;
            }            
        }
        
        this.useMouseInput = false;
        return this.useMouseInput;
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
        this.identifier = this.properties[1];
        this.isTouched = false;
        this.preX = this.inst.x;
        this.preY = this.inst.y;
        
        if (this.properties[0] === 1)
            this.TriggerTouchEvent(0);        
	};

	behinstProto.tick = function ()
	{
        if (this.isTouched)
        {
            if ((this.preX !== this.inst.x) || (this.preY !== this.inst.y))
            {
                this.TriggerTouchEvent(2);
            }
        }
        
        this.preX = this.inst.x;
        this.preY = this.inst.y;
	};  
    
    var Type2EventNames = [TouchStartEvtNames, TouchEndEvtNames, TouchMoveEvtNames];
    behinstProto.TriggerTouchEvent = function (type)
	{
        var isTouchStart = (type === 0);
        var isTouchEnd = (type === 1);
        var isTouchMove = (type === 2);

        if (isTouchStart)
            this.isTouched = true;        
        else if (isTouchEnd)
            this.isTouched = false;   
            
        var info;
        if (isTouchStart || isTouchMove)
        {
            var pos = this.layerxy2canvasxy();
            info = { "pageX":pos.x, "pageY":pos.y, "identifier":this.identifier };
        }
        else
        {
            info = { "identifier":this.identifier };            
        }
        var evetNames = Type2EventNames[type];
        
        var e = jQuery["Event"]( evetNames[this.type.touchStyle], info );
        elem["trigger"]( e );      

        if (this.type.GetUseMouseInput())
        {
            var e = jQuery["Event"]( evetNames[3], info );
            elem["trigger"]( e );               
        }
	};  
       
    var pos = {x:0, y:0};
	behinstProto.layerxy2canvasxy = function (x, y, layer)
	{        
        if (x == null) 
            x = this.inst.x;
        if (y ==null)
            y = this.inst.y;        
        if (layer == null)
            layer = this.inst.layer;
        
		var offset = (this.runtime.isDomFree)? dummyoffset : jQuery(this.runtime.canvas).offset();
        pos.x = layer.layerToCanvas(x, y, true) + offset.left;
        pos.y = layer.layerToCanvas(x, y, false) + offset.top;
        return pos;
	};    
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.IsTouching = function ()
	{
		return this.isTouched;
	};
    ///////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.SetIdentifier = function (identifier)
	{
        this.identifier = identifier;       
	}; 

    Acts.prototype.TriggerTouchEvent = function (type)
	{

        this.TriggerTouchEvent(type);
	};     
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());