// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_LayerObj = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	var pluginProto = cr.plugins_.Rex_LayerObj.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
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

	// called whenever an instance is created    
	instanceProto.onCreate = function()
	{
        this.visible = (this.properties[0] === 1);
	    this._width_init = this.width;
	    this._height_init = this.height;
                
 
	    this.runtime.tick2Me(this);        
	};

	instanceProto.tick2 = function()
	{
        var layer = this.layer;
        
	    var wscale = this.width/this._width_init;
	    var hscale = this.height/this._height_init;
	    var scale = Math.min(wscale, hscale);
        if (layer.scale != scale)
        {
            layer.scale = scale;
            this.runtime.redraw = true;	    
        }
	    
	    if (layer.angle != this.angle)
        {
	        layer.angle = this.angle;
	        this.runtime.redraw = true;
        }
	    
	    var opacity_ = cr.clamp(this.opacity, 0, 1);
        if (layer.opacity != opacity_)
        {
	        layer.opacity = opacity_;
	        this.runtime.redraw = true;
        }
	    
	    if (layer.visible != this.visible)
        {
	        layer.visible = this.visible;
	        this.runtime.redraw = true;
        }	    
	};	
	
	// only called if a layout object
	instanceProto.draw = function(ctx)
	{
	};  

	instanceProto.drawGL = function(glw)
	{
	};
    
	instanceProto.saveToJSON = function ()
	{    
		return { "wi": this._width_init,
                 "hi": this._height_init
	            };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this._width_init = o["wi"];
        this._height_init = o["hi"];
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds(); 

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
}());