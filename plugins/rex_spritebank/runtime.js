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
        this._z_sorting = new cr.plugins_.Rex_SpriteBank.ZSortingKlass(this);
        this.callback = null;
                
        this._clean_bank();     
	};

	instanceProto._clean_bank = function()
	{
        this._banks = {};
        this._z_sorting.Clean();
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
        save_obj["cur_anim_speed"] = inst.cur_anim_speed;         
        save_obj["inst_vars"] = inst.instance_vars.slice();
        save_obj["layer"] = inst.layer.index;
        save_obj["z_order"] = inst.layer.instances.indexOf(inst);

        // save inst.cur_animation.name for restoring animation
        save_obj["cur_anim_name"] = inst.cur_animation.name;           
        
        if (cb_cmd != null)
        {
            sol.instances.length = 0;   // clear contents
            sol.instances.push(inst);
            sol.select_all = false;
            this.callback.ExecuteCommands(cb_cmd);
            save_obj["custom_data"] = hash_copy(this.callback.GetReturns());
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
    
    // copy from sprite plugin
	instanceProto._set_anim_frame = function (inst, framenumber)
	{
		inst.changeAnimFrame = framenumber;
		
		// start ticking if not already
		if (!inst.isTicking)
		{
			inst.runtime.tickMe(inst);
			inst.isTicking = true;
		}
		
		// not in trigger: apply immediately
		if (!inst.inAnimTrigger)
			inst.doChangeAnimFrame();
	};    
          
    instanceProto._create_instance = function(obj_type, save_obj)
	{  
	    var _layer = this.runtime.getLayerByNumber(save_obj["layer"]);
        var inst = this.runtime.createInstance(
                       obj_type, 
                       _layer, 
                       save_obj["x"], 
                       save_obj["y"]);
                   
        inst.cur_anim_speed = save_obj["cur_anim_speed"];         
        this._set_anim_frame(inst, save_obj["cur_frame"]);
        inst.changeAnimName = save_obj["cur_anim_name"];
        inst.doChangeAnim();
        
        // after set anim frame
        inst.width = save_obj["width"];
        inst.height = save_obj["height"];  
        inst.angle = save_obj["angle"];
        inst.opacity = save_obj["opacity"];        
        inst.visible = save_obj["visible"];
        inst.instance_vars = save_obj["inst_vars"].slice();  
        
        this._z_sorting.add_layer(_layer);
        this._z_sorting.uid2Zinidex(inst.uid, save_obj["z_order"]);
        
        return inst;        
	};     
    instanceProto._load_instances = function(sprite_name, obj_type, cb_cmd, do_sorting)
	{
        var sprite_bank, i, save_obj, inst;
        var sol = obj_type.getCurrentSol();
        var select_all_save = sol.select_all;
        sprite_bank = this._banks[sprite_name];   
        if (sprite_bank == null)
            return;
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
        
        if (do_sorting)
            this._z_sorting.Sorting();
        
        sol.select_all = select_all_save;
	};
    
    instanceProto._load_all_instances = function()
	{
        var sprite_name, sprite_bank, uid, obj_type;
       
        for (sprite_name in this._banks)
        {
            obj_type = this.runtime.types[sprite_name];
            this._load_instances(sprite_name, obj_type, null, false);
        }

        this._z_sorting.Sorting();
	};
    
    instanceProto._bank2string = function()
	{
        return JSON.stringify(this._banks);
	};
    
    instanceProto._JSONString2bank = function(JSON_string)
	{
        this._banks = JSON.parse(JSON_string);
	};
    
    var hash_copy = function (obj_in, obj_src)
    {
        var obj_out = (obj_src == null)? {}:obj_src;
        var key;
        for (key in obj_in)
            obj_out[key] = obj_in[key];
            
        return obj_out;
    };    
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
     
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.CleanBank = function ()
	{
        this._clean_bank();
	};
    
    Acts.prototype.SaveInstances = function (obj_type, is_pick_all)
	{
        this._save_instances(obj_type, is_pick_all);
	};

    Acts.prototype.LoadInstances = function ()
	{  
        this._load_all_instances();
	};

    Acts.prototype.StringToBank = function (JSON_string)
	{  
        this._JSONString2bank(JSON_string);
	};  
    
    Acts.prototype.ConnectFn = function (fn_objs)
	{  
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.callback = callback;        
        else
            alert ("Sprite Bank should connect to a function object");
	};
    
    Acts.prototype.AdvSaveInstances = function (obj_type, is_pick_all, cb_cmd)
	{
        this._save_instances(obj_type, is_pick_all, cb_cmd);
	};

    Acts.prototype.AdvLoadInstances = function (obj_type, cb_cmd)
	{
        if (obj_type.is_family)
        {
            var members = obj_type.members;
            var member_cnt = members.length;
            var i,member;
            for (i=0; i<member_cnt; i++)
            {
                member = members[i];
                this._load_instances(member.name, member, cb_cmd, true);
            }
        }
        else
            this._load_instances(obj_type.name, obj_type, cb_cmd, true);
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.BankToString = function (ret)
	{
        var json_string = this._bank2string();
		ret.set_string(json_string);
	};    
}());

(function ()
{
    // for injecting javascript
    cr.plugins_.Rex_SpriteBank.ZSortingKlass = function(plugin)
    {
        this.plugin = plugin;
        this.Clean();      
    };
    var ZSortingKlassProto = cr.plugins_.Rex_SpriteBank.ZSortingKlass.prototype;
    
    ZSortingKlassProto.Clean = function()
    {
        this.layers = {};
        this.uid2zorder = {}; 
    };    
    ZSortingKlassProto.add_layer = function(layer)
    {
        if (this.layers[layer.index] == null)
            this.layers[layer.index] = layer;
    };
    ZSortingKlassProto.uid2Zinidex = function(uid, z_index)
    {
        this.uid2zorder[uid] = z_index;
    };
    var thisArg = null;
    var ZSORT = function(inst_a, inst_b)
    {
        var z_order_a = thisArg.uid2zorder[inst_a.uid];
        var z_order_b = thisArg.uid2zorder[inst_b.uid];
        if ( (z_order_a != null) && (z_order_b != null) )
            return (z_order_a > z_order_b)? 1:
                   (z_order_a < z_order_b)? (-1):0;
        else
            return ((z_order_a == null) && (z_order_b == null))? 0:
                   (z_order_b == null)?                          1:(-1);           
    };      
    ZSortingKlassProto.Sorting = function()
    {
	    var index, layer;
        thisArg = this;      
	    for (index in this.layers)
	    {
	        layer = this.layers[index];
	        layer.instances.sort(ZSORT);
	        layer.zindices_stale = true;
	    }
	    this.plugin.runtime.redraw = true;
    };
}());    