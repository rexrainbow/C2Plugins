// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.MySysExt = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.MySysExt.prototype;
		
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

    acts.PickAll = function (objtype)
	{
        var sol = objtype.getCurrentSol();        
        sol.select_all = true;
	}; 
    
    acts.PickByUID = function (objtype, uid, is_pick_all)
	{
        var sol = objtype.getCurrentSol();  
        if (is_pick_all==1)
            sol.select_all = true;  
            
        var insts = sol.getObjects();
        var insts_length = insts.length;
        var i, inst;
        var is_find = false;

        for (i=0; i < insts_length; i++)
        {
            inst = insts[i];
            if (inst.uid == uid)
            {
                is_find = true;
                break;
            }
        }
        
        sol.instances.length = 0;   // clear contents
        if (is_find)
            sol.instances.push(inst);
            
        sol.select_all = false;
	}; 
    
    acts.PickByPropCmp = function (objtype, var_name, cmp, y, is_pick_all)
	{
        var sol = objtype.getCurrentSol();  
        if (is_pick_all==1)
            sol.select_all = true;  
            
        var insts = sol.getObjects();
        var insts_length = insts.length;
        var i, inst;
        var is_find = false;
        var find_insts = [];

        var_name = var_name.toLowerCase();
        for (i=0; i < insts_length; i++)
        {
            inst = insts[i];
            if (cr.do_cmp(inst[var_name], cmp, y))
            {
                find_insts.push(inst);
            }
        }
        
        sol.instances.length = 0;   // clear contents
        if (find_insts.length > 0)
        {
            insts_length = find_insts.length;
            for (i=0; i < insts_length; i++)
            {            
                sol.instances.push(find_insts[i]);
            }
        }
            
        sol.select_all = false;
	};  
    
    

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

}());