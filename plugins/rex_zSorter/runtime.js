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
    var x_increasing = true;    
	instanceProto.onCreate = function()
	{
        x_increasing = (this.properties[0] == 0);
        this._cmp_uidA = 0;
	    this._cmp_uidB = 0;
        this._compared_result = 0;        
	    this._sort_fn_name = "";	        
	};
	
	// only called if a layout object
	instanceProto.draw = function(ctx)
	{
	};
	instanceProto.get_layer = function(layerparam)
	{
        return (typeof layerparam == "number")?
               this.runtime.getLayerByNumber(layerparam):
               this.runtime.getLayerByName(layerparam);
	};    
    
    var _thisArg  = null;
	var _sort_fn = function(instance_a, instance_b)
	{   
	    _thisArg._cmp_uidA = instance_a.uid;
	    _thisArg._cmp_uidB = instance_b.uid;	    
	    _thisArg.runtime.trigger(cr.plugins_.Rex_ZSorter.prototype.cnds.OnSortingFn, _thisArg);
	    return _thisArg._compared_result;	    
	};
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds; 
	  
	cnds.OnSortingFn = function (name)
	{
		return (this._sort_fn_name == name);
	};	
	
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
    var ZSORT = function(instance_a, instance_b)
    {        
        var ax = instance_a.x;
        var ay = instance_a.y;
        var bx = instance_b.x;
        var by = instance_b.y; 
        if (ay > by)
            return 1;
        else if (ay == by)
        {
            if (ax == bx)
                return 0;
            if ((x_increasing && (ax > bx)) || (!x_increasing && (ax < bx)))
                return 1;
            else
                return (-1);
        }
        else  // ay < by
            return (-1);
    }

    //Z-Sort all objects in current layer by their Y position
	acts.SortObjsLayerByY = function (layerparam)
	{
        var layer = this.get_layer(layerparam);        
        if (layer == null)
        {
            alart("Z Sort: Can not find layer  " + layerparam);
            return;
        }
	    layer.instances.sort(ZSORT);
	    layer.zindices_stale = true;
	    this.runtime.redraw = true;
	};
    
	acts.SetXorder = function (x_order)
	{
        x_increasing = (x_order == 0);
	};    
    
	acts.SortByFn = function (layerparam, fn_name)
	{
        var layer = this.get_layer(layerparam);  
        if (layer == null)
        {
            alert("Z Sort: Can not find layer  " + layerparam);
            return;
        }
        _thisArg  = this;
	    this._sort_fn_name = fn_name;        
	    layer.instances.sort(_sort_fn);
	    layer.zindices_stale = true;
	    this.runtime.redraw = true;        
	}; 

	acts.SetCmpResultDirectly = function (result)
	{
	    this._compared_result = result;
	};		
	
    acts.SetCmpResultCombo = function (result)
	{
	    this._compared_result = result -1;
	};
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.CmpUIDA = function (ret)
	{   
	    ret.set_int(this._cmp_uidA);
	};    
	
	exps.CmpUIDB = function (ret)
	{   
	    ret.set_int(this._cmp_uidB);
	};   
}());