// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ZSorter = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	var pluginProto = cr.plugins_.Rex_ZSorter.prototype;
		
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

	};
	
	// only called if a layout object
	instanceProto.draw = function(ctx)
	{
	};

	//////////////////////////////////////
	// Conditions

	
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
    var ZSORT = function(instance_a, instance_b)
    {
        if ( (instance_a.y > instance_b.y) ||
             ((instance_a.y == instance_b.y) && 
              (instance_a.x > instance_b.x))
           )
            return 1;
        else if ( (instance_a.y == instance_b.y) && 
                  (instance_a.x == instance_b.x)   )
            return 0;
        else
            return -1;
    }

    //Z-Sort all objects in current layer by their Y position
	acts.SortObjsLayerByY = function (layerparam)
	{
        var layer = (typeof layerparam == "number")?
                    this.runtime.getLayerByNumber(layerparam):
                    this.runtime.getLayerByName(layerparam);
        if (layer == null)
        {
            alert("Z Sort: Can not find layer  " + layerparam);
            return;
        }
	    layer.instances.sort(ZSORT);
	    layer.zindices_stale = true;
	    this.runtime.redraw = true;
	};
	
	//////////////////////////////////////
	// Expressions
	// pluginProto.exps = {};
	// var exps = pluginProto.exps;

}());