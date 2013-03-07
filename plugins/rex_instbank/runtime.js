// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_InstanceBank = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_InstanceBank.prototype;
		
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
        this.bank = new cr.plugins_.Rex_InstanceBank.InstBankKlass(this);    
        this._target_inst = null;
        this._info = {};
	};
	
	// handlers
    instanceProto.OnSaving = function(inst, ret_info)
    {     
        this._target_inst = inst;
        this._info = ret_info;
        this.runtime.trigger(cr.plugins_.Rex_InstanceBank.prototype.cnds.OnSave, this);
    }; 	
    instanceProto.OnLoading = function(inst, info)
    {
        this._target_inst = inst;
        this._info = info;    
        this.runtime.trigger(cr.plugins_.Rex_InstanceBank.prototype.cnds.OnLoad, this);
    };     
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnSave = function (obj_type)
	{
		if (!obj_type)
			return;    
	    return this.bank.SOLPickOne(obj_type, this._target_inst);
	};
    
	Cnds.prototype.OnLoad = function (obj_type)
	{
		if (!obj_type)
			return;      
		return this.bank.SOLPickOne(obj_type, this._target_inst);
	}; 
     
	Cnds.prototype.PickBySavedUID = function (obj_type, saved_uid)
	{
		if (!obj_type)
			return;      
		return this.bank.SOLPickBySavedUID(obj_type, saved_uid);
	};  
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.CleanBank = function ()
	{
        this.bank.CleanBank();
	};
    
    Acts.prototype.SaveInstances = function (obj_type, is_pick_all)
	{
		if (!obj_type)
			return;      
        this.bank.SaveInstances(obj_type, is_pick_all);
	};

    Acts.prototype.LoadInstances = function ()
	{  
        this.bank.LoadAllInstances();
	};

    Acts.prototype.StringToBank = function (JSON_string)
	{  
        this.bank.JSON2Bank(JSON_string);
	};  

    Acts.prototype.SaveInfo = function (index, value)
	{  
        this._info[index] = value;
	};
    
	Acts.prototype.PickBySavedUID = function (obj_type, saved_uid)
	{
		if (!obj_type)
			return;      
		this.bank.SOLPickBySavedUID(obj_type, saved_uid);
	};  
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.BankToString = function (ret)
	{
        var json_string = this.bank.ToString();
		ret.set_string(json_string);
	}; 

    Exps.prototype.SavedInfo = function (ret, index, default_value)
	{
        var val = this.bank._info[index];
        if (val == null)
            val = default_value;
	    ret.set_any(val);
	};    
}());

(function ()
{
    cr.plugins_.Rex_InstanceBank.InstBankKlass = function(plugin)
    {
        this.plugin = plugin;  
        this.has_on_saving_handler = (plugin.OnSaving != null);
        this.has_on_loading_handler = (plugin.OnLoading != null);
        this._z_sorting = new ZSortingKlass(plugin);     
        this._bank = {};  
        this._saveduid2inst_map = {};
        this._info = {};
        
        this.CleanBank();   
                                      
    };
    var InstBankKlassProto = cr.plugins_.Rex_InstanceBank.InstBankKlass.prototype;  

	InstBankKlassProto.CleanBank = function()
	{
        hash_clean(this._bank); 
	};     
  
    // save    
    InstBankKlassProto._on_saving = function(inst)
    {
        this._target_inst = inst;
        hash_clean(this._info);
        this.plugin.OnSaving(inst, this._info);
        return hash_copy(this._info);
    }; 
    InstBankKlassProto._get_save_obj = function(uid)
    {
        var save_obj = this._bank[uid];
        if (save_obj == null)
        {
            save_obj = {};
            this._bank[uid] = save_obj;
        }
        else   // already existed in bank, ignored
            save_obj = null;
        return save_obj;
    }; 
    InstBankKlassProto._save_world_inst = function(inst, save_obj)
    {
        if (cr.plugins_.Sprite && (inst instanceof cr.plugins_.Sprite.prototype.Instance))
        {
            save_obj["plugin"] = "Sprite";
            save_obj["cur_frame"] = inst.cur_frame;  
            save_obj["cur_anim_speed"] = inst.cur_anim_speed; 
            save_obj["cur_anim_name"] = inst.cur_animation.name; 
        }
        else if (cr.plugins_.Text && (inst instanceof cr.plugins_.Text.prototype.Instance))
        {
            save_obj["plugin"] = "Text";
            save_obj["content"] = inst.text;
        }
        else
            save_obj["plugin"] = "World";
        
        save_obj["x"] = inst.x;
        save_obj["y"] = inst.y;
        save_obj["width"] = inst.width;
        save_obj["height"] = inst.height;
        save_obj["angle"] = inst.angle;
        save_obj["opacity"] = inst.opacity;
        save_obj["visible"] = inst.visible;        
        save_obj["layer"] = inst.layer.index;
        save_obj["z_order"] = inst.layer.instances.indexOf(inst);
    };     
    InstBankKlassProto._save_array_inst = function(inst, save_obj)
    {
        save_obj["plugin"] = "Array";
        save_obj["content"] = inst.getAsJSON();
    };
    InstBankKlassProto._save_dictionary_inst = function(inst, save_obj)
    {
        save_obj["plugin"] = "Dictionary";
        save_obj["content"] = JSON.stringify({"c2dictionary":true, "data":inst.dictionary})
    };
    InstBankKlassProto._save_sibling = function(inst, save_obj)
    {
        if (!inst.is_contained)
            return;
            
        save_obj["container_insts"] = {};
        var i, cnt=inst.siblings.length, s, sibling_save_obj;
        for (i=0; i<cnt; i++)
	    {
		    s = inst.siblings[i];
            save_obj["container_insts"][s.type.name] = s.uid;            
            sibling_save_obj = this.SaveInstance(s, true);
            sibling_save_obj["create_me"] = false;   // container object will be created automatically
		}
    }; 
    InstBankKlassProto.SaveInstance = function(inst, ignored_container_insts)
	{
        var save_obj = this._get_save_obj(inst.uid);
        if (save_obj == null)
            return;
        save_obj["create_me"] = true;
        save_obj["saveduid"] = inst.uid;

        if (inst.type.plugin.is_world)
            this._save_world_inst(inst, save_obj);
        else if (cr.plugins_.Arr && (inst instanceof cr.plugins_.Arr.prototype.Instance))
            this._save_array_inst(inst, save_obj);
        else if (cr.plugins_.Dictionary && (inst instanceof cr.plugins_.Dictionary.prototype.Instance))
            this._save_dictionary_inst(inst, save_obj);

        // general
        save_obj["type"] = inst.type.name;        
        save_obj["inst_vars"] = inst.instance_vars.slice();        
        save_obj["custom_data"] = (this.has_on_saving_handler)? this._on_saving(inst):{};
        
        // container 
        if (!ignored_container_insts)
            this._save_sibling(inst, save_obj);     

        return  save_obj;          
	};
    InstBankKlassProto.SaveInstances = function(obj_type, is_pick_all)
	{   
        var sol = obj_type.getCurrentSol();
        var select_all_save = sol.select_all;  
        if (is_pick_all==1)
            sol.select_all = true;  
            
        var insts = sol.getObjects().slice();
        var insts_length = insts.length;
        var i;

        for (i=0; i < insts_length; i++)
            this.SaveInstance(insts[i]);
        
        sol.select_all = select_all_save;
	};      
    // save

    // load
    InstBankKlassProto._on_loading = function(inst, custom_data)
    {
        hash_copy(custom_data, hash_clean(this._info));      
        this.plugin.OnLoading(inst, this._info);
    }; 
    InstBankKlassProto._filled_world_inst = function(inst, save_obj)
    {
        if (save_obj["plugin"] == "Sprite")
        {
            inst.cur_anim_speed = save_obj["cur_anim_speed"];
            cr.plugins_.Sprite.prototype.acts.SetAnimFrame.apply(inst, [save_obj["cur_frame"]]); 
            cr.plugins_.Sprite.prototype.acts.SetAnim.apply(inst, [save_obj["cur_anim_name"], 1]);   
        } 
        else if (save_obj["plugin"] == "Text")
        {
            cr.plugins_.Text.prototype.acts.SetText.apply(inst, [save_obj["content"]]);
        } 

        inst.x = save_obj["x"];
        inst.y = save_obj["y"];
        inst.width = save_obj["width"];
        inst.height = save_obj["height"];  
        inst.angle = save_obj["angle"];
        inst.opacity = save_obj["opacity"];        
        inst.visible = save_obj["visible"];            
    };
    InstBankKlassProto._filled_array_inst = function(inst, save_obj)
    {
        cr.plugins_.Arr.prototype.acts.JSONLoad.apply(inst, [save_obj["content"]]);          
    };
    InstBankKlassProto._filled_dictionary_inst = function(inst, save_obj)
    {
        cr.plugins_.Dictionary.prototype.acts.JSONLoad.apply(inst, [save_obj["content"]]);          
    };    
    
    InstBankKlassProto._filled_instance = function(inst, save_obj)
	{  
        if ((inst == null) || (save_obj == null))
            return;
            
        this._saveduid2inst_map[save_obj["saveduid"]] = inst;

        if (inst.type.plugin.is_world)
            this._filled_world_inst(inst, save_obj);
        else if (save_obj["plugin"] == "Array")
            this._filled_array_inst(inst, save_obj);
        else if (save_obj["plugin"] == "Dictionary")
            this._filled_dictionary_inst(inst, save_obj);
            
        // general        
        cr.shallowAssignArray(inst.instance_vars, save_obj["inst_vars"]);
        if (this.has_on_loading_handler)        
            this._on_loading(inst, save_obj["custom_data"]);
        
        // z sort
        this._z_sorting.add_layer(this.plugin.runtime.getLayerByNumber(save_obj["layer"]));
        this._z_sorting.uid2Zinidex(inst.uid, save_obj["z_order"]);
        
	};    
    InstBankKlassProto._filled_sibling = function(inst, save_obj)
	{   
        var container_insts=save_obj["container_insts"];
        if ((container_insts == null) || (!inst.is_contained))
            return;
            
		var i, cnt=inst.siblings.length, s, sibling_uid;
        for (i=0; i <cnt; i++)
	    {
			s = inst.siblings[i];
            sibling_uid = container_insts[s.type.name];
            this._filled_instance(s, this.UID2SaveObj(sibling_uid));
		}
	};       
    InstBankKlassProto._callevent_on_created = function(inst)
	{   
        var objtype = inst.type;
        this.SOLPickOne(objtype, inst);
        var runtime = this.plugin.runtime;
        runtime.isInOnDestroy++;
		runtime.trigger(Object.getPrototypeOf(objtype.plugin).cnds.OnCreated, inst);
		runtime.isInOnDestroy--;
	};
    InstBankKlassProto.CreateInstance = function(save_obj)  // save_obj or saved_uid
	{  
	    if (typeof(save_obj) != "object")
	        save_obj = this.UID2SaveObj(save_obj);
        if ((save_obj == null) || (!save_obj["create_me"]))
            return null;
            
        var runtime = this.plugin.runtime;
        var objtype = runtime.types[save_obj["type"]];
        //if (objtype == null)
        //    return null;
        var sol = objtype.getCurrentSol();
        var select_all_save = sol.select_all;  
	    var _layer = runtime.getLayerByNumber(save_obj["layer"]);        

        var inst = runtime.createInstance(
                       objtype, 
                       _layer, 
                       save_obj["x"], 
                       save_obj["y"]);
        if (!inst)
            return null;                       
        
        this._filled_instance(inst, save_obj);

        // container has been created but not filled
        this._filled_sibling(inst, save_obj);

        this._callevent_on_created(inst);
		
        sol.select_all = select_all_save;
        
        return inst;
	};  
    InstBankKlassProto.LoadAllInstancesPrelude = function()
	{
        this._z_sorting.Clean();
        hash_clean(this._saveduid2inst_map); 
	};    
    InstBankKlassProto.LoadAllInstancesEpilogue = function()
	{
        this._z_sorting.Sorting();
        hash_clean(this._saveduid2inst_map); 
	};      
    InstBankKlassProto._load_all_instances_handler = function()
	{
        var uid, save_obj;
        for (uid in this._bank)
            this.CreateInstance(uid);
	};
    InstBankKlassProto.LoadAllInstances = function(handler, thisArg, params)
	{
        this.LoadAllInstancesPrelude();
        if (handler == null)  // default handler  
            this._load_all_instances_handler();
        else
            handler.apply(thisArg, params);
        this.LoadAllInstancesEpilogue();
	};
    // load
 
    InstBankKlassProto.ToString = function()
	{
        return JSON.stringify(this._bank);
	};
    InstBankKlassProto.JSON2Bank = function(JSON_string)
	{
        this._bank = JSON.parse(JSON_string);
	};
    InstBankKlassProto.ContentGet = function()
	{
        return this._bank;
	};	
    InstBankKlassProto.ContentSet = function(content)
	{
		hash_copy(content, hash_clean(this._bank));
	};
    InstBankKlassProto.UID2SaveObj = function(uid)
	{
        return this._bank[uid];
	};	    
	
    InstBankKlassProto.SOLPickOne = function(obj_type, inst)
	{
        if ((!obj_type) || (!inst))
            return false;   
        if (obj_type.is_family)
        {
            var members = obj_type.members;
            var member_cnt = members.length;
            var i,member, is_found=false;
            for (i=0; i<member_cnt; i++)
            {
                member = members[i];
                if (inst.type == member)
                {
                    is_found = true;
                    break;
                }
            }
            if (!is_found)
                return false;
        }
        else
        {
	        if (inst.type != obj_type)	    
	            return false;
        }

        obj_type.getCurrentSol().pick_one(inst);

		// Siblings aren't in instance lists yet, pick them manually
		if (inst.is_contained)
		{
            var i, cnt=inst.siblings.length, s;
			for (i=0; i<cnt; i++)
			{
				s = inst.siblings[i];
				s.type.getCurrentSol().pick_one(s);
			}
		}
	    return true;
	};
    
    InstBankKlassProto.SavedUID2Inst = function (saved_uid)
    {
        var inst = this._saveduid2inst_map[saved_uid];
        if (inst == null)
            inst = this.CreateInstance(saved_uid);        
        return inst;
    };
    InstBankKlassProto.SOLPickBySavedUID = function (obj_type, saved_uid)
    {
        return this.SOLPickOne(obj_type, this.SavedUID2Inst(saved_uid));
    };
    
    var hash_copy = function (obj_in, obj_src)
    {
        var obj_out = (obj_src == null)? {}:obj_src;
        var key;
        for (key in obj_in)
            obj_out[key] = obj_in[key];
            
        return obj_out;
    };    
    var hash_clean = function (obj_in)
    {
        var key;
        for (key in obj_in)
            delete obj_in[key];
        return obj_in;
    };   
    
    
    var ZSortingKlass = function(plugin)
    {
        this.plugin = plugin;
        this.Clean();      
    };
    var ZSortingKlassProto = ZSortingKlass.prototype;
    
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