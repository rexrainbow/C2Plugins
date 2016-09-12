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
        this.touchStyle = (window.navigator["pointerEnabled"])? 0:
                                   (window.navigator["pointerEnabled"])? 1:
                                   2;
        
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
    
	instanceProto.triggerTouchEvent = function (evetNames, info)
	{
        var name = evetNames[this.touchStyle];
        var e = jQuery["Event"]( name, info );
        elem["trigger"]( e );      

        if (this.GetUseMouseInput())
        {
            var e = jQuery["Event"]( evetNames[3], info );
            elem["trigger"]( e );               
        }
	};       
    var pos = {x:0, y:0};
	instanceProto.layerxy2canvasxy = function (x, y, layer)
	{
		var offset = (this.runtime.isDomFree)? dummyoffset : jQuery(this.runtime.canvas).offset();
        pos.x = layer.layerToCanvas(x, y, true) + offset.left;
        pos.y = layer.layerToCanvas(x, y, false) + offset.top;
        return pos;
	};
        
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    var KEYBOARD_EVENTTYPE = ["keydown", "keyup", "keypress"];
    Acts.prototype.SimulateKeyboard = function (code, event_type)
	{
        var e = jQuery["Event"]( KEYBOARD_EVENTTYPE[event_type], { "keyCode": code, "which": code } );
        elem["trigger"]( e );               
	}; 
        
    var TouchStartEvtNames = ["pointerdown", "MSPointerDown", "touchstart", "mousedown"];
    var TouchEndEvtNames = ["pointerup", "MSPointerUp", "touchend", "mouseup"];    
    var TouchMoveEvtNames = ["pointermove", "MSPointerMove", "touchmove", "mousemove"];
    Acts.prototype.SimulateTouchStart = function (x, y, layer, identifier)
	{
        var pos = this.layerxy2canvasxy(x, y, layer);

        var evetName = TouchStartEvtNames[this.touchStyle];
        var info = { "pageX":pos.x, "pageY":pos.y, "identifier":identifier };
        this.triggerTouchEvent(TouchStartEvtNames, info);
	};
    Acts.prototype.SimulateTouchEnd = function (identifier)
	{
        var evetName = TouchEndEvtNames[this.touchStyle];
        var info = { "identifier":identifier };
        this.triggerTouchEvent(TouchEndEvtNames, info);
	};    
    Acts.prototype.SimulateTouchMove = function (x, y, layer, identifier)
	{
        var pos = this.layerxy2canvasxy(x, y, layer);

        var evetName = TouchMoveEvtNames[this.touchStyle];
        var info = { "pageX":pos.x, "pageY":pos.y, "identifier":identifier };
        this.triggerTouchEvent(TouchMoveEvtNames, info);
	};    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());