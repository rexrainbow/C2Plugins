// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SpriteBank = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SpriteBank.prototype;
		
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
        this._banks = {};
	};
    
    instanceProto._get_sprite_bank = function(sprite_name)
    {
        var sprite_bank = this._banks[sprite_name];
        if (sprite_bank == null)
        {
            sprite_bank = {};
            this._banks[sprite_name] = sprite_bank;
        }
        return sprite_bank;
    }
    instanceProto._get_sprite_save_obj = function(sprite_name, uid)
    {
        var sprite_bank = this._get_sprite_bank(sprite_name);
        var save_obj = sprite_bank[uid];
        if (save_obj == null)
        {
            save_obj = {};
            sprite_bank[uid] = save_obj;
        }
        return save_obj;
    }    
    
    instanceProto._save_instance = function(inst, cb_fn)
	{
        var save_obj = this._get_sprite_save_obj(inst.type.name, inst.uid);
        save_obj.x = inst.x;
        save_obj.y = inst.y;
        save_obj.width = inst.width;
        save_obj.height = inst.height;
        save_obj.angle = inst.angle;
        save_obj.opacity = inst.opacity;
        save_obj.visible = inst.visible;
        save_obj.instance_vars = inst.instance_vars.slice();
        save_obj.layer = inst.layer.index;
        
        if (cb_fn != null)
        {
        }
	};
    
    instanceProto._save_instances = function(objtype, is_pick_all, cb_fn)
	{
        var sol = objtype.getCurrentSol();
        var select_all_save = sol.select_all;  
        if (is_pick_all==1)
            sol.select_all = true;  
            
        var insts = sol.getObjects();
        var insts_length = insts.length;
        var i;

        for (i=0; i < insts_length; i++)
        {
            this._save_instance(insts[i]);
        }
        
        sol.select_all = select_all_save;
	};    
    
    
    instanceProto._create_instance = function(obj_type, save_obj)
	{  
        var inst = this.runtime.createInstance(obj_type, 
                                               this.runtime.getLayerByNumber(save_obj.layer), 
                                               save_obj.x, 
                                               save_obj.y);
                                    
        inst.width = save_obj.width;
        inst.height = save_obj.height;
        inst.angle = save_obj.angle;
        inst.opacity = save_obj.opacity;        
        inst.visible = save_obj.visible;
        inst.instance_vars = save_obj.instance_vars.slice();       
	};    
    
    instanceProto._load_all_instances = function()
	{
        var sprite_name, sprite_bank, uid, obj_type;               
        for (sprite_name in this._banks)
        {
            obj_type = this.runtime.types[sprite_name];
            sprite_bank = this._banks[sprite_name];
            for (uid in sprite_bank)
            {
                this._create_instance(obj_type, 
                                      sprite_bank[uid]);
            }
        }
	};
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
     
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

    acts.SaveInstances = function (objtype, is_pick_all)
	{
        this._save_instances(objtype, is_pick_all);
	};

    acts.LoadInstances = function ()
	{  
        this._load_all_instances();
	};    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
       
}());