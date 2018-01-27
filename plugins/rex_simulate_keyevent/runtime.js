// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SimulateInput = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SimulateInput.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;
	var dummyoffset = {left: 0, top: 0}; 
    var elem = jQuery(document);
	instanceProto.onCreate = function()
	{
        this.useMouseInput = null;
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
    
    instanceProto.GetUseMouseInput = function()
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
    
    instanceProto.getTouchType = function()
    {
        if (this.GetUseMouseInput())
            return 3;
        else if (typeof PointerEvent !== "undefined")
            return 0;
        else if (window.navigator["msPointerEnabled"])
            return 1;
        else
            return 2;
    };
       
    var pos = {x:0, y:0};
	instanceProto.layerxy2canvasxy = function (x, y, layer)
	{
		var offset = (this.runtime.isDomFree)? dummyoffset : jQuery(this.runtime.canvas).offset();
        pos.x = layer.layerToCanvas(x, y, true) + offset.left;
        pos.y = layer.layerToCanvas(x, y, false) + offset.top;
        return pos;
    };
    
	instanceProto.triggerEvent = function (evetName, info)
	{
        var e = jQuery["Event"]( evetName, info );
        elem["trigger"]( e );
	};     
        
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    var KeyboardEvtName = ["keydown", "keyup", "keypress"];
    Acts.prototype.SimulateKeyboard = function (code, evtType)
	{
        var evetName = KeyboardEvtName[evtType];
        var info = { "keyCode": code, "which": code };
        this.triggerEvent(evetName, info);
	}; 
        
    var TouchStartEvtNames = ["pointerdown", "MSPointerDown", "touchstart", "mousedown"];
    var TouchEndEvtNames = ["pointerup", "MSPointerUp", "touchend", "mouseup"];    
    var TouchMoveEvtNames = ["pointermove", "MSPointerMove", "touchmove", "mousemove"];
    Acts.prototype.SimulateTouchStart = function (x, y, layer, identifier)
	{
        var evetName = TouchStartEvtNames[this.getTouchType()];
        var pos = this.layerxy2canvasxy(x, y, layer);
        var info = { "pageX":pos.x, "pageY":pos.y, "identifier":identifier };
        this.triggerEvent(evetName, info);
	};
    Acts.prototype.SimulateTouchEnd = function (identifier)
	{
        var evetName = TouchEndEvtNames[this.getTouchType()];
        var info = { "identifier":identifier };
        this.triggerEvent(evetName, info);
	};    
    Acts.prototype.SimulateTouchMove = function (x, y, layer, identifier)
	{
        var evetName = TouchMoveEvtNames[this.getTouchType()];
        var pos = this.layerxy2canvasxy(x, y, layer);
        var info = { "pageX":pos.x, "pageY":pos.y, "identifier":identifier };
        this.triggerEvent(evetName, info);
	};    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());