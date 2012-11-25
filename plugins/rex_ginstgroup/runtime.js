// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_gInstGroup = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_gInstGroup.prototype;
		
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
	    this.check_name = "INSTGROUP";
	    this.groups = {};
	    this._cmp_uidA = 0;
	    this._cmp_uidB = 0;
	    this._sort_fn_name = "";	    
	    this._compared_result = 0;
	    this._foreach_item = {};
	    this._foreach_index = {};
	    this._inst_private_group_name = {};
	    
		// Need to know if pinned object gets destroyed
		this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this);
										
		this.runtime.addDestroyCallback(this.myDestroyCallback);     	    
	};
	cr.plugins_.Rex_gInstGroup._random_gen = null;  // random generator for Shuffing
	
	instanceProto.onDestroy = function ()
	{
        this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};   
    
    instanceProto.onInstanceDestroyed = function(inst)
    {
        // auto remove uid from groups
        var uid = inst.uid;
        var name;
        var groups = this.groups;
        for (name in groups)
            groups[name].RemoveUID(uid);
            
        this._remove_pg(uid);
    };
    
    var _pg_prefix = "@";
    var _pg_postfix = "$";
    var _get_pg_uid = function (name)
    {
        if (name.charAt(0) != _pg_prefix)
            return (-1);
            
        var index = name.indexOf(_pg_postfix);
        if (index == (-1))
            return (-1);
            
        var uid = parseInt(name.substring(1,index));
        return uid;
    };
    
    instanceProto._append_pg = function (name)
    {
        var uid = _get_pg_uid(name);
        if (uid == (-1))
            return;
            
        var name_list = this._inst_private_group_name[uid];
        if (name_list == null)
        {
            name_list = [name];	            
            this._inst_private_group_name[uid] = name_list;
        }
        else
            name_list.push(name);
    };
    
    instanceProto._remove_pg = function (uid)
    {
        var name_list = this._inst_private_group_name[uid];
        if (name_list == null)
            return;

        var list_len = name_list.length;
        var i;
        for (i=0; i<list_len; i++)
            this.DestroyGroup(name_list[i]);          
        delete this._inst_private_group_name[uid];
    };    

	instanceProto.GetGroup = function(name)
	{
	    var group = this.groups[name];
	    if (group == null)
	    {
	        group = new cr.plugins_.Rex_gInstGroup.GroupKlass();
	        this.groups[name] = group;
	        this._append_pg(name);
	    }
	    return group;
	};
	
    instanceProto.DestroyGroup = function (name)
	{
	    if (this.groups[name] != null)
	        delete this.groups[name];
	}; 	
	
	instanceProto.all2string = function()
	{
		var strings = {};
	    var name;
	    var groups = this.groups;
	    for (name in groups)
	        strings[name] = groups[name].ToString();
	    return JSON.stringify(strings);
	};
	
    
    instanceProto._sets_operation_target_get = function (group_a, group_b, group_result)
    {
	    if ((group_a != group_result) && (group_b != group_result))
	    {
	        this.GetGroup(group_result).Copy(this.GetGroup(group_a));
            group_a = group_result;   
	    }
	    else if (group_result == group_b)
	    {
	        group_b = group_a;
	        group_a = group_result;
        }
        return {"a":group_a, "b":group_b};
    };
    
    instanceProto._pick_insts = function (name, objtype, is_pop)
	{
	    var group = this.GetGroup(name);
	    var group_uids = group.GetSet();	    
        var sol = objtype.getCurrentSol();  
        sol.select_all = true;   
        var insts = sol.getObjects();
        var insts_length = insts.length;
        var i, inst;
        sol.instances.length = 0;   // clear contents
        for (i=0; i < insts_length; i++)
        {
           inst = insts[i];
           if (group_uids[ inst.uid ] != null)
           {
               sol.instances.push(inst);
               if (is_pop == 1)
                   group.RemoveUID(inst.uid);
           }
        }
        sol.select_all = false;    
        return  (sol.instances.length >0);       
	};  
    
    instanceProto._pop_one_instance = function (name, index, objtype, is_pop)
	{	    
        var uid_list = this.GetGroup(name).GetList();
        var is_valid_index = (uid_list.length > index);
                   
        var sol = objtype.getCurrentSol();  
        sol.select_all = true;   
        var insts = sol.getObjects();
        var insts_length = insts.length;
        var i, inst;
        sol.instances.length = 0;   // clear contents
        if (is_valid_index)
        {
            var _uid = uid_list[index];
            for (i=0; i < insts_length; i++)
            {
               inst = insts[i];
               if (inst.uid == _uid)
               {
                   sol.instances.push(inst);
                   break;
               }
            }
        }
        sol.select_all = false;       
        
        if ((is_pop==1) && is_valid_index)
            cr.arrayRemove(uid_list, index);  
        return  (sol.instances.length >0);              
	};	    

    var _thisArg  = null;
	var _sort_fn = function(uid_a, uid_b)
	{   
	    _thisArg._cmp_uidA = uid_a;
	    _thisArg._cmp_uidB = uid_b;	    
	    _thisArg.runtime.trigger(cr.plugins_.Rex_gInstGroup.prototype.cnds.OnSortingFn, _thisArg);
	    return _thisArg._compared_result;	    
	};		
	

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds(); 
	  
	Cnds.prototype.OnSortingFn = function (name)
	{
		return (this._sort_fn_name == name);
	};	 
	
	Cnds.prototype.ForEachUID = function (var_name, name)
	{
	    var uids = this.GetGroup(name).GetList();
	    var uids_len = uids.length;
	    var i;
        var current_event = this.runtime.getCurrentEventStack().current_event;		
		for (i=0; i<uids_len; i++)
	    {
	        this._foreach_item[var_name] = uids[i];
	        this._foreach_index[var_name] = i;
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}
		
        return false;
	};
	  
	Cnds.prototype.PickInsts = function (name, objtype, is_pop)
	{
		return this._pick_insts(name, objtype, is_pop);   
	};  
	  
	Cnds.prototype.IsInGroup = function (uid, name)
	{
		return this.GetGroup(name).IsInGroup(uid);        
	}; 
	  
	Cnds.prototype.IsEmpty = function (name)
	{
		return (this.GetGroup(name).GetList().length == 0);        
	}; 	
	  
	Cnds.prototype.PopInstance = function (name, index, objtype, is_pop)
	{
		return this._pop_one_instance(name, index, objtype, is_pop);     
	};	 
	  
	Cnds.prototype.IsSubset = function (subset_name, main_name)
	{
        debugger;
        var main_group = this.GetGroup(main_name);
        var subset_group = this.GetGroup(subset_name);
		return main_group.IsSubset(subset_group);     
	};			
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts(); 
	
    Acts.prototype.Clean = function (name)
	{
	    this.GetGroup(name).Clean();
	};  	
	
    Acts.prototype.Destroy = function (name)
	{
	    this.DestroyGroup(name);
	}; 	
	
    Acts.prototype.Copy = function (source, target)
	{
        if (source == target)
            return;
	    this.GetGroup(target).Copy(this.GetGroup(source));
	};	
	
    Acts.prototype.String2Group = function (JSON_string, name)
	{
	    this.GetGroup(name).JSONString2Group(JSON_string);
	};		
	
    Acts.prototype.String2All = function (JSON_string)
	{
	    var groups = JSON.parse(JSON_string);
	    var name;
	    for (name in groups)
	        this.GetGroup(name).JSONString2Group(groups[name]);
	};	
	
    Acts.prototype.PushInsts = function (objtype, name)
	{
	    var insts = objtype.getCurrentSol().getObjects();
	    var insts_length = insts.length;
	    var i;
	    
	    var group = this.GetGroup(name);
	    for (i=0; i<insts_length; i++)
	        group.AddUID(insts[i].uid);
	};		
	
    Acts.prototype.PushInst = function (uid, name)
	{
	    this.GetGroup(name).AddUID(uid);	    
	};		
	
    Acts.prototype.RemoveInsts = function (objtype, name)
	{
	    var insts = objtype.getCurrentSol().getObjects();
	    var insts_length = insts.length;
	    var i;
	    
	    var group = this.GetGroup(name);
	    for (i=0; i<insts_length; i++)
	        group.RemoveUID(insts[i].uid);	    
	};		
	
    Acts.prototype.RemoveInst = function (uid, name)
	{
	    this.GetGroup(name).RemoveUID(uid);		    
	};		
	
    Acts.prototype.Union = function (group_a, group_b, group_result)
	{
	    var groups = this._sets_operation_target_get(group_a, group_b, group_result);
	    this.GetGroup(groups["a"]).Union(this.GetGroup(groups["b"]));
	};
	
    Acts.prototype.Complement = function (group_a, group_b, group_result)
	{
	    var groups = this._sets_operation_target_get(group_a, group_b, group_result);
	    this.GetGroup(groups["a"]).Complement(this.GetGroup(groups["b"]));	    
	};	
	
    Acts.prototype.Intersection = function (group_a, group_b, group_result)
	{
	    var groups = this._sets_operation_target_get(group_a, group_b, group_result);	
	    this.GetGroup(groups["a"]).Intersection(this.GetGroup(groups["b"]));	      
	};		
	
    Acts.prototype.Shuffle = function (name)
	{
	    this.GetGroup(name).Shuffle();
	};	
	
    Acts.prototype.SortByFn = function (name, fn_name)
	{
        _thisArg  = this;
	    this._sort_fn_name = fn_name;
	    this.GetGroup(name).GetList().sort(_sort_fn);
	};		
	
    Acts.prototype.SetCmpResultDirectly = function (result)
	{
	    this._compared_result = result;
	};		
	
    Acts.prototype.SetCmpResultCombo = function (result)
	{
	    this._compared_result = result -1;
	};
	
    Acts.prototype.PickInsts = function (name, objtype, is_pop)
	{
	    this._pick_insts(name, objtype, is_pop);
	};
	
    Acts.prototype.SortByUIDInc = function (name)
	{
	    this.GetGroup(name).GetList().sort();
	};	
	
    Acts.prototype.SortByUIDDec = function (name)
	{
	    this.GetGroup(name).GetList().sort().reverse();
	};		
	
    Acts.prototype.Reverse = function (name)
	{
	    this.GetGroup(name).GetList().reverse();
	};
	
    Acts.prototype.Slice = function (source, start, end, target, is_pop)
	{
        var source_group = this.GetGroup(source);
        var target_group = this.GetGroup(target);
	    var _list = source_group.GetList().slice(start, end);
        target_group.SetByUIDList(_list);
        if (is_pop==1)
            source_group.Complement(target_group);
	};	
	
    Acts.prototype.PopInstance = function (name, index, objtype, is_pop)
	{	    
        this._pop_one_instance(name, index, objtype, is_pop);  
	};		
	
    Acts.prototype.SetRandomGenerator = function (random_gen_objs)
	{
        var random_gen = random_gen_objs.instances[0];
        if (random_gen.check_name == "RANDOM")
            cr.plugins_.Rex_gInstGroup._random_gen = random_gen;        
        else
            alert ("[Instance group] This object is not a random generator object.");
	};  
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.CmpUIDA = function (ret)
	{   
	    ret.set_int(this._cmp_uidA);
	};    
	
	Exps.prototype.CmpUIDB = function (ret)
	{   
	    ret.set_int(this._cmp_uidB);
	};    	
    
	Exps.prototype.InstCnt = function (ret, name)
	{   
	    ret.set_int(this.GetGroup(name).GetList().length);
	};
	
	Exps.prototype.UID2Index = function (ret, name, uid)
	{
	    ret.set_int(this.GetGroup(name).UID2Index(uid));
	};   	
	
	Exps.prototype.Index2UID = function (ret, name, index)
	{
	    ret.set_int(this.GetGroup(name).Index2UID(index));
	}; 
    
	Exps.prototype.Item = function (ret, var_name)
	{   
	    var item = this._foreach_item[var_name];
	    if (item == null)
	        item = (-1);
	    ret.set_int(item);
	};	
    
	Exps.prototype.Index = function (ret, var_name)
	{   
	    var index = this._foreach_index[var_name];
	    if (index == null)
	        index = (-1);	    
	    ret.set_int(index);
	};	  
    
	Exps.prototype.GroupToString = function (ret, name)
	{
	    ret.set_string(this.GetGroup(name).ToString());
	};
    
	Exps.prototype.AllToString = function (ret)
	{
	    ret.set_string(this.all2string());
	};		
    
	Exps.prototype.PrivateGroup = function (ret, uid, name)
	{
	    ret.set_string(_pg_prefix+uid.toString()+_pg_postfix+name);
	};	
    
	Exps.prototype.Pop = function (ret, name, index)
	{
	    var uid_list = this.GetGroup(name).GetList();
	    var uid = uid_list[index];
	    cr.arrayRemove(uid_list, index);
	    ret.set_int(uid);
	};
	  
}());

(function ()
{
    cr.plugins_.Rex_gInstGroup.GroupKlass = function()
    {
		this._set = {};
        this._list = [];    
    };
    var GroupKlassProto = cr.plugins_.Rex_gInstGroup.GroupKlass.prototype;
    
	GroupKlassProto.Clean = function()
	{
        var key;
        for (key in this._set)
            delete this._set[key];
        this._list.length = 0;
	};
    
	GroupKlassProto.Copy = function(group)
	{
        var key, hash_obj;
        hash_obj = this._set;
        for (key in hash_obj)
            delete this._set[key];
        hash_obj = group._set;
        for (key in hash_obj)
            this._set[key] = hash_obj[key];
		cr.shallowAssignArray(this._list, group._list);
	};   
	
	GroupKlassProto.SetByUIDList = function(uid_list)
	{
	    cr.shallowAssignArray(this._list, uid_list);
	    var list_len = uid_list.length;
	    var i, key, hash_obj;
        hash_obj = this._set;
        for (key in hash_obj)
            delete this._set[key];
	    for (i=0; i<list_len; i++)
	        this._set[uid_list[i]] = true;
	};
	
	GroupKlassProto.AddUID = function(uid)
	{
	    if (this._set[uid] == null)
	    {
	        this._set[uid] = true;
	        this._list.push(uid);
	    }
	};
	
	GroupKlassProto.RemoveUID = function(uid)
	{
	    if (this._set[uid] != null)
	    {
	        delete this._set[uid];
	        var i = this._list.indexOf(uid);
	        this._list.splice(i,1);	        
	    }	    
	};
	
	GroupKlassProto.UID2Index = function(uid)
	{
	    return this._list.indexOf(uid);    
	};
	
	GroupKlassProto.Index2UID = function(index)
	{
        var _list = this._list;
        var uid = (index < _list.length)? _list[index]:(-1);
        return uid;
	};		
		
	GroupKlassProto.Union = function(group)
	{
	    var uids = group._set;
        var uid;        
        for (uid in uids)        
            this.AddUID(parseInt(uid));    
	};	
		
	GroupKlassProto.Complement = function(group)
	{	  
	    var uids = group._set;      
        var uid;        
        for (uid in uids)        
            this.RemoveUID(parseInt(uid));                
	};
		
	GroupKlassProto.Intersection = function(group)
	{	    
	    var uids = group._set;
        var uid;
        var remove_uids = [];        
        for (uid in this._set)
        {
            if (uids[uid] == null)
                remove_uids.push(parseInt(uid));
        }
        
        var remove_len = remove_uids.length;
        var i;
        for (i=0; i<remove_len; i++)
            this.RemoveUID(remove_uids[i]);
	};	
    
	GroupKlassProto.IsSubset = function(subset_group)
	{
        var subset_uids = subset_group._set;
        var uid;     
        var is_subset = true;        
        for (uid in subset_uids)        
        {
            if (!(uid in this._set))
            {
                is_subset = false;
                break;
            }
        }
        return is_subset;
	};    
	
	GroupKlassProto.GetSet = function()
	{
	    return this._set;
	};
	
	GroupKlassProto.GetList = function()
	{
	    return this._list;
	};
	
	GroupKlassProto.IsInGroup = function(uid)
	{
	    return (this._set[uid] != null);
	};	
	GroupKlassProto.ToString = function()
	{
	    return JSON.stringify(this._list);
	};
	
	GroupKlassProto.JSONString2Group = function(JSON_string)
	{
	    this.SetByUIDList(JSON.parse(JSON_string));
	};	
	
	GroupKlassProto.Shuffle = function()
	{
	    _shuffle(this._list);
	}
		
	var _shuffle = function (arr)
	{
        var i = arr.length, j, temp, random_value;
		var random_gen = cr.plugins_.Rex_gInstGroup._random_gen;
        if ( i == 0 ) return;
        while ( --i ) 
        {
		    random_value = (random_gen == null)?
			               Math.random(): random_gen.random();
            j = Math.floor( random_value * (i+1) );
            temp = arr[i]; 
            arr[i] = arr[j]; 
            arr[j] = temp;
        }
    };	
}());    
    