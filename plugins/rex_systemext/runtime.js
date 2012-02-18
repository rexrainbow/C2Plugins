// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SysExt = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SysExt.prototype;
		
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
    
    instanceProto._get_layer = function(layerparam)
    {
        return (typeof layerparam == "number")?
               this.runtime.getLayerByNumber(layerparam):
               this.runtime.getLayerByName(layerparam);
    };    

    instanceProto._get_type = function(_obj_type)
    {
        var obj_type;
        if (typeof _obj_type == "string")
        {
            var name = _obj_type;
            var types = this.runtime.types;
            var type_name, item;
            obj_type = null;            
            for(type_name in types)
            {
                item = types[type_name];
                if (item.name == name)
                {
                    obj_type = item;
                    break;
                }
            }
        }
        else
            obj_type = _obj_type;
        return obj_type;
    };
	var GetInstPropertyValue = function(inst, prop_index)
	{
	    var val;
	    switch(prop_index)
	    {
	    case 0:   // uid
	        val = inst.uid;
	        break;
	    case 1:   // x
	        val = inst.x;
	        break;	
	    case 2:   // y
	        val = inst.y;
	        break;	        
	    case 3:   // width
	        val = inst.width;
	        break;	
	    case 4:   // height
	        val = inst.height;
	        break;	
	    case 5:   // angle
	        val = inst.angle;
	        break;
	    case 6:   // opacity
	        val = inst.opacity;
	        break;	
	    default:
	        val = 0;
	        break;	  	        	            
	    }
	    return val;
	};	
    
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    

	cnds.PickAll = function (objtype)
	{
        var sol = objtype.getCurrentSol();        
        sol.select_all = true;
		return true;
	};
    
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
    
    acts.PickByPropCmp = function (objtype, prop_index, cmp, value, is_pick_all)
	{
        var sol = objtype.getCurrentSol();  
        if (is_pick_all==1)
            sol.select_all = true;  
            
        var insts = sol.getObjects();
        var insts_length = insts.length;
        var i, inst;
        var is_find = false;
        var find_insts = [];

        for (i=0; i < insts_length; i++)
        {
            inst = insts[i];
            if (cr.do_cmp(GetInstPropertyValue(inst, prop_index), cmp, value))
            {
                find_insts.push(inst);
            }
        }
        sol.instances = find_insts;
            
        sol.select_all = false;
	};  

    acts.SetGroupActive = function (group, active)
    {
		var activeGroups = this.runtime.activeGroups;
        
        if (activeGroups[group] == null)
        {
            alert("Group '" + group + "' does not exist");
            return;
        }
        
		group = group.toLowerCase();
		
		switch (active) {
		// Disable
		case 0:
			delete activeGroups[group];
			break;
		// Enable
		case 1:
			activeGroups[group] = true;
			break;
		// Toggle
		case 2:
			if (activeGroups[group])
				delete activeGroups[group];
			else
				activeGroups[group] = true;
			break;
		}
    };

    acts.SetLayerVisible = function (layerparam, visible_)
    {
        var layer;
		if (cr.is_number(layerparam))
			layer = this.runtime.getLayerByNumber(layerparam);
		else
			layer = this.runtime.getLayerByName(layerparam);
                
        if (!layer)
            return;

        var is_visible = (visible_ == 1);
		if (layer.visible !== is_visible)
		{
			layer.visible = is_visible;
			this.runtime.redraw = true;
		}
    };    
        
    acts.CreateObjectByname = function (name, layer, x, y)
	{
        var obj_type = this._get_type(name);
        if (obj_type == null)
            return;
        this.runtime.createInstance(obj_type, this._get_layer(layer), x, y);
	}; 
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

    exps.Eval = function (ret, code_string)
	{
	    ret.set_any( eval( "("+code_string+")" ) );
	};
    
}());