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
        this._clean_bank();
        this.callback = null;
	};

	instanceProto._clean_bank = function()
	{
        this._banks = {};
	};   
    
    
    instanceProto._get_sprite_bank = function(sprite_name)
    {
        var sprite_bank = this._banks[sprite_name];
        if (sprite_bank == null)
        {
            sprite_bank = [];
            this._banks[sprite_name] = sprite_bank;
        }
        return sprite_bank;
    }
    instanceProto._get_sprite_save_obj = function(sprite_name, uid)
    {
        var sprite_bank = this._get_sprite_bank(sprite_name);
        var save_obj = {};
        sprite_bank.push(save_obj);
        return save_obj;
    }    
    
    instanceProto._save_instance = function(inst, cb_cmd, sol)
	{
        var save_obj = this._get_sprite_save_obj(inst.type.name, inst.uid);
        save_obj["x"] = inst.x;
        save_obj["y"] = inst.y;
        save_obj["width"] = inst.width;
        save_obj["height"] = inst.height;
        save_obj["angle"] = inst.angle;
        save_obj["opacity"] = inst.opacity;
        save_obj["visible"] = inst.visible;  
        save_obj["cur_frame"] = inst.cur_frame;         
        save_obj["inst_vars"] = inst.instance_vars.slice();
        save_obj["layer"] = inst.layer.index;
        
        // save inst.cur_animation.name for restoring animation
        save_obj["cur_anim_name"] = inst.cur_animation.name;           
        
        if (cb_cmd != null)
        {
            sol.instances.length = 0;   // clear contents
            sol.instances.push(inst);
            sol.select_all = false;
            this.callback.ExecuteCommands(cb_cmd);
            save_obj["custom_data"] = jQuery.extend({}, this.callback.GetReturns());
        }
	};
    
    instanceProto._save_instances = function(obj_type, is_pick_all, cb_cmd)
	{
        var sol = obj_type.getCurrentSol();
        var select_all_save = sol.select_all;  
        if (is_pick_all==1)
            sol.select_all = true;  
            
        var insts = sol.getObjects();
        var insts_length = insts.length;
        var i;

        for (i=0; i < insts_length; i++)
        {
            this._save_instance(insts[i], cb_cmd, sol);
        }
        
        sol.select_all = select_all_save;
	};    
        
    instanceProto._create_instance = function(obj_type, save_obj)
	{  
        var inst = this.runtime.createInstance(
                       obj_type, 
                       this.runtime.getLayerByNumber(save_obj["layer"]), 
                       save_obj["x"], 
                       save_obj["y"]);
                                    
        inst.width = save_obj["width"];
        inst.height = save_obj["height"];
        inst.angle = save_obj["angle"];
        inst.opacity = save_obj["opacity"];        
        inst.visible = save_obj["visible"];
        inst.cur_frame = save_obj["cur_frame"];  
        inst.instance_vars = save_obj["inst_vars"].slice();  
        inst.changeAnimName = save_obj["cur_anim_name"];
        inst.doChangeAnim();
        return inst;        
	};   

    
    instanceProto._load_instances = function(sprite_name, obj_type, cb_cmd)
	{
        var sprite_bank, i, save_obj, inst;
        var sol = obj_type.getCurrentSol();
        var select_all_save = sol.select_all;
        sprite_bank = this._banks[sprite_name];   
        var sprite_bank_length = sprite_bank.length;
        for (i=0; i<sprite_bank_length; i++)
        {
            save_obj = sprite_bank[i];
            inst = this._create_instance(obj_type, save_obj);
            if (cb_cmd != null)
            {
                sol.instances.length = 0;   // clear contents
                sol.instances.push(inst); 
                sol.select_all = false;
                this.callback.AddParams(save_obj["custom_data"]);
                this.callback.ExecuteCommands(cb_cmd);
            }
        }
        
        sol.select_all = select_all_save;
	};
    
    instanceProto._load_all_instances = function()
	{
        var sprite_name, sprite_bank, uid, obj_type;               
        for (sprite_name in this._banks)
        {
            obj_type = this.runtime.types[sprite_name];
            this._load_instances(sprite_name, obj_type);
        }
	};
    
    instanceProto._bank2string = function()
	{
        return JSON.stringify(this._banks);
	};
    
    instanceProto._JSONString2bank = function(JSON_string)
	{
        this._banks = JSON.parse(JSON_string);
	};
    
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
     
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
    acts.CleanBank = function ()
	{
        this._clean_bank();
	};
    
    acts.SaveInstances = function (obj_type, is_pick_all)
	{
        this._save_instances(obj_type, is_pick_all);
	};

    acts.LoadInstances = function ()
	{  
        this._load_all_instances();
	};

    acts.StringToBank = function (JSON_string)
	{  
        this._JSONString2bank(JSON_string);
	};  
    
    acts.ConnectFn = function (fn_objs)
	{  
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.callback = callback;        
        else
            alert ("Sprite Bank should connect to a function object");
	};
    
    acts.AdvSaveInstances = function (obj_type, is_pick_all, cb_cmd)
	{
        this._save_instances(obj_type, is_pick_all, cb_cmd);
	};

    acts.AdvLoadInstances = function (obj_type, cb_cmd)
	{  
        this._load_instances(obj_type.name, obj_type, cb_cmd);
	};    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.BankToString = function (ret)
	{
        var json_string = this._bank2string();
		ret.set_string(json_string);
	};    
}());