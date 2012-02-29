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
	    this.groups = {};
	    this._cmp_uidA = 0;
	    this._cmp_uidB = 0;
	    this._sort_fn_name = "";	    
	    this._compared_result = 0;
	    this._foreach_UID = 0;
	};

	instanceProto.get_group = function(name)
	{
	    var group = this.groups[name];
	    if (group == null)
	    {
	        group = new cr.plugins_.Rex_gInstGroup.GroupKlass();
	        this.groups[name] = group;
	    }
	    return group;
	};
	
    
    instanceProto._sets_operation_target_get = function (group_a, group_b, group_result)
    {
	    if ((group_a != group_result) && (group_b != group_result))
	    {
	        this.get_group(group_result).Copy(this.get_group(group_a));
            group_a = group_result;   
	    }
	    else if (group_result == group_b)
	    {
	        group_b = group_a;
	        group_a = group_result;
        }
        return {"a":group_a, "b":group_b};
    };

    var _thisArg  = null;
	var _sort_fn = function(uid_a, uid_b)
	{
	    _thisArg._cmp_uidA = uid_a;
	    _thisArg._cmp_uidB = uid_b;	    
	    _thisArg.runtime.trigger(cr.plugins_.Rex_gInstGroup.prototype.cnds.OnSortingFn, this);
	    return _thisArg._compared_result;	    
	};		
	
	var _shuffle = function (arr)
	{
        var i = arr.length, j, temp;
        if ( i == 0 ) return;
        while ( --i ) 
        {
            j = Math.floor( Math.random() * (i+1) );
            temp = arr[i]; 
            arr[i] = arr[j]; 
            arr[j] = temp;
        }
    };	

	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds; 
	  
	cnds.OnSortingFn = function (name)
	{
	    _thisArg = this;
		return (this._sort_fn_name == name);
	};	 
	
	cnds.ForEachUID = function (name)
	{
	    var uids = this.get_group(name).GetList();
	    var uids_len = uids.length;
	    var i;
        var current_event = this.runtime.getCurrentEventStack().current_event;		
		for (i=0; i<uids_len; i++)
	    {
	        this._foreach_UID = uids[i];
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}
		
        return false;
	};
	    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts; 
	
    acts.Clean = function (name)
	{
	    this.get_group(name).Clean();
	};  	
	
    acts.Copy = function (group_a, group_result)
	{
	    this.get_group(group_result).Copy(this.get_group(group_a));
	};	
	
    acts.PushInsts = function (objtype, name)
	{
	    var insts = objtype.getCurrentSol().getObjects();
	    var insts_length = insts.length;
	    var i;
	    
	    var group = this.get_group(name);
	    for (i=0; i<insts_length; i++)
	        group.AddUID(insts[i].uid);
	};		
	
    acts.PushInst = function (uid, name)
	{
	    this.get_group(name).AddUID(uid);	    
	};		
	
    acts.RemoveInsts = function (objtype, name)
	{
	    var insts = objtype.getCurrentSol().getObjects();
	    var insts_length = insts.length;
	    var i;
	    
	    var group = this.get_group(name);
	    for (i=0; i<insts_length; i++)
	        group.RemoveUID(insts[i].uid);	    
	};		
	
    acts.RemoveInst = function (uid, name)
	{
	    this.get_group(name).RemoveUID(uid);		    
	};		
	
    acts.Union = function (group_a, group_b, group_result)
	{
	    var groups = this._sets_operation_target_get(group_a, group_b, group_result);
	    this.get_group(groups["a"]).Union(this.get_group(groups["b"]).GetSet());
	};
	
    acts.Complement = function (group_a, group_b, group_result)
	{
	    var groups = this._sets_operation_target_get(group_a, group_b, group_result);
	    this.get_group(groups["a"]).Complement(this.get_group(groups["b"]).GetSet());	    
	};	
	
    acts.Intersection = function (group_a, group_b, group_result)
	{
	    var groups = this._sets_operation_target_get(group_a, group_b, group_result);	
	    this.get_group(groups["a"]).Intersection(this.get_group(groups["b"]).GetSet());	      
	};		
	
    acts.Shuffle = function (name)
	{
	    _shuffle(this.get_group(name).GetList());
	};	
	
    acts.SortByFn = function (name, fn_name)
	{
	    this._sort_fn_name = fn_name;
	    this.get_group(name).GetList().sort(this._sort_fn);
	};		
	
    acts.SetCmpResultDirectly = function (result)
	{
	    this._compared_result = result;
	};		
	
    acts.SetCmpResultCombo = function (result)
	{
	    this._compared_result = result -1;
	};
	
    acts.CreateIterator = function (name)
	{
	};	
		
    acts.PickInsts = function (name, objtype, is_pop)
	{
	    var group = this.get_group(name);
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
	
	exps.InstCnt = function (ret, name)
	{   
	    ret.set_int(this.get_group(name).GetList().length);
	};
    
	exps.ForEachUID = function (ret, name)
	{   
	    ret.set_int(this._foreach_UID);
	};	
    
	exps.IterUID = function (ret, name)
	{   
	    ret.set_int(0);
	};		
}());

(function ()
{
    cr.plugins_.Rex_gInstGroup.GroupKlass = function()
    {
        this.Clean();
    };
    var GroupKlassProto = cr.plugins_.Rex_gInstGroup.GroupKlass.prototype;
    
	GroupKlassProto.Clean = function()
	{
		this._set = {};
        this._list = [];
	};
    
	GroupKlassProto.Copy = function(group)
	{
		this._set = jQuery.extend({}, group._set);
        this._list.length =0;
        var uid;
        for (uid in this._set)
            this._list.push(parseInt(uid));
	};
	
	GroupKlassProto.AddUID = function(uid)
	{
	    if (this._set[uid] == null)
	    {
	        this._set[uid] = 0;
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
		
	GroupKlassProto.Union = function(uids)
	{	    		    
        var uid;        
        for (uid in uids)        
            this.AddUID(parseInt(uid));    
	};	
		
	GroupKlassProto.Complement = function(uids)
	{	        
        var uid;        
        for (uid in uids)        
            this.RemoveUID(parseInt(uid));                
	};
		
	GroupKlassProto.Intersection = function(uids)
	{	    
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
	
	GroupKlassProto.GetSet = function()
	{
	    return this._set;
	};
	
	GroupKlassProto.GetList = function()
	{
	    return this._list;
	};
}());    
    