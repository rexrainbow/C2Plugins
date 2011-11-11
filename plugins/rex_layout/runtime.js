// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Layout = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Layout.prototype;
		
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

	instanceProto.onCreate = function()
	{
	};
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    

	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
    acts.DistributeInsts = function (objtype, start_x, start_y, end_x, end_y)
	{
        var sol = objtype.getCurrentSol();  
            
        var insts = sol.getObjects();
        var insts_length = insts.length;
        var seg_len = insts_length -1;
        var i, prop, inst;
        var dx = end_x - start_x;
        var dy = end_y - start_y;
        for (i=0; i < insts_length; i++)
        {
            inst = insts[i];
            prop = i/seg_len;
            inst.x = start_x + (dx * prop);
            inst.y = start_y + (dy * prop);
            inst.set_bbox_changed();
        }
        
	}; 

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
    
}());