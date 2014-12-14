// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.rex_treenode = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.rex_treenode.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
        this.group = null;  
	};
	
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
	    this.parent = -1;
	    this.children = [];		    
	    this.root = this.inst.uid;    
	    
	    this.inst.extra.rex_treeNode = this;  // It will not be saveed	
	};
	
	behinstProto.onDestroy = function()
	{
		this.NodeRemove();
	};	

	behinstProto.tick = function ()
	{
	};
		
	behinstProto.saveToJSON = function ()
	{
		return { "p": this.parent,
		         "c": this.children,
		         "r": this.root
		       };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
	    this.parent = o["p"];
	    this.children = o["c"];
	    this.root = o["r"];
	};
	
	behinstProto._add_child = function (child_uid)
	{
	    if (this.children.indexOf(child_uid) == (-1))
	        this.children.push(child_uid);
	};	
	
	behinstProto._bind_child = function (child_inst)
	{
        var child_tn = this.TreeNodeGet(child_inst);
	    assert2(child_tn, "[Tree node] The child need to have tree node behavior");
	    child_tn.parent = this.inst.uid;
	    child_tn.root = this.root;
	    this._add_child(child_inst.uid);
	};		
	
	behinstProto.CreateChildInst = function (objtype,x,y,layer)
	{ 
        // callback
        var self = this;  
        var __callback = function (inst)
        {
            self._bind_child(inst);
        }
        // callback
        
	    var inst = window.RexC2CreateObject(objtype, layer, x, y, __callback);
	    return inst;	
	}; 		
	
	behinstProto.TreeNodeGet = function(inst)
	{
	    if (typeof(inst) == "number")
	        inst = this.runtime.getObjectByUID(inst);	    
	    if (inst == null)
	        return null;
	        
	    return inst.extra.rex_treeNode;
	};	
	
	behinstProto.ParentSet = function(parent_inst)
	{	   
	    // parent_inst might be null
	    // parent no changed
	    var parent_uid = (parent_inst != null)? parent_inst.uid:(-1);
	    if (parent_uid == this.parent)	       
	        return;
	        
	    // set previous parent node
	    var pre_parent_tn = this.TreeNodeGet(this.parent);
	    if (pre_parent_tn != null)
	        pre_parent_tn._remove_child(this.inst.uid);
	    
	    // set new parent node
		var parent_tn = this.TreeNodeGet(parent_inst);
		if (parent_tn != null)
		    parent_tn._add_child(this.inst.uid);
	    
	    // set my node	    
	    this.parent = parent_uid;
	    this.root = (parent_tn != null)? parent_tn.root:this.inst.uid;
	};
	
	behinstProto.ChildrenAdd = function(children_insts)
	{	
	    // children have no tree node behavior
		var child_tn = this.TreeNodeGet(children_insts[0]);
		if (child_tn == null)
		    return;
		    
		var i, cnt=children_insts.length, child_inst;
		for(i=0; i<cnt; i++)
		{
		    child_inst = children_insts[i];
		    child_tn = this.TreeNodeGet(child_inst);
		    child_tn.ParentSet(this);
		}
	};	
	
	behinstProto._remove_child = function(child_uid)
	{	   
		var i = this.children.indexOf(child_uid);
		this.children.splice(i, 1);
	};
	
    behinstProto.NodeRemove = function ()
	{
	    // reset parent node
	    var parent_tn = this.TreeNodeGet(this.parent);
	    if (parent_tn != null)	    
	        parent_tn._remove_child(this.inst.uid);
	    
	    // reset children node
	    var i, cnt=this.children.length, child_inst, child_tn;
	    for (i=0; i<cnt; i++)
	    {
	        child_tn = this.TreeNodeGet(this.children[i]);
	        if (child_tn != null)
	            child_tn.ParentSet(null);
	    }
	    
	    // reset my node
	    this.parent = -1;
	    this.children.length = 0;	    
	    this.root = this.inst.uid;
	};		
	
	var ret_uids = [];
	var children_uid = [];
	behinstProto.ChildrenUIDGet = function(has_grandson)
	{
	    var child_uid, child_inst, child_tn;
	    ret_uids.length = 0;
	    children_uid.push.apply(children_uid, this.children);  
	    while (children_uid.length >0)
	    {
	        child_uid = children_uid.pop();
	        child_inst = this.runtime.getObjectByUID(child_uid);
	        if (child_inst == null)
	            continue;	        
	        ret_uids.push(child_uid);
	        if (has_grandson)
	        {
	            child_tn = this.TreeNodeGet(child_inst);
	            children_uid.push.apply(children_uid, child_tn.children);
	        }
	    }
	    children_uid.length = 0;	
	    return ret_uids;   	    
	};
	
	behinstProto._sibling_get = function ()
	{
	    var parent_tn = this.TreeNodeGet(this.parent);
	    if (parent_tn == null)
	    {
	        ret_uids.length = 0;
	    }
	    else
	    {
	        cr.shallowAssignArray(ret_uids, parent_tn.children);
		    var i = ret_uids.indexOf(this.inst.uid);
		    ret_uids.splice(i, 1);	    
		}
		return ret_uids;
	};
		
	behinstProto._get_inst = function (objtype)
	{
	    var inst;                        
	    if (objtype == null)
	        inst = null; 
	    else if (typeof(objtype) == "number")	    
	        inst = this.runtime.getObjectByUID(objtype);	
	    else
	        inst = objtype.getCurrentSol().instances[0];
	    return inst;
	};
	//////////////////////////////////////
	// Conditions
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	    
    Cnds.prototype.IsRoot = function ()
	{
		return (this.parent == -1);
	};
	
    Cnds.prototype.HasChild = function ()
	{
		return (this.children.length > 0);
	};
	
    Cnds.prototype.HasSibling = function ()
	{
	    var parent_tn = this.TreeNodeGet(this.parent);
	    var cnt = (parent_tn != null)? parent_tn.children.length-1: 0;
		return (cnt > 0);
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.SetInstanceGroup = function (group_objs)
	{
        var group = group_objs.instances[0];
        if (group.check_name == "INSTGROUP")
            this.type.group = group;        
        else
            alert ("[Tree noe] This object is not a instance group object.");            
	};

	
    Acts.prototype.AssignParent = function (objtype)
	{
	    // objtype = type | uid
        var parent_inst = this._get_inst(objtype);
        if (parent_inst == null)
            return;
            
        this.ParentSet(parent_inst);
	}; 
	
    Acts.prototype.CreateChild = function (objtype,x,y,layer)
	{ 
        this.CreateChildInst(objtype,x,y,layer);
	}; 
	
    Acts.prototype.AddChildren = function (objtype)
	{
	    // objtype = type | uid
        var children_insts = this._get_inst(objtype);
        if (children_insts == null)
            return;
        this.ChildrenAdd(children_insts);
	};
	
    Acts.prototype.RemoveFromTree = function ()
	{
	    this.NodeRemove();
	};	
	
    Acts.prototype.PickChildren = function (group_name, has_grandson)
	{
        var children_uids = this.ChildrenUIDGet(has_grandson);
        this.type.group.GetGroup(group_name).SetByUIDList(children_uids);
        children_uids.length = 0;
	};	
	
    Acts.prototype.PickParent = function (group_name)
	{
	    var group = this.type.group.GetGroup(group_name);
	    group.Clean();
	    if (this.parent != -1)
	        group.AddUID(this.parent);
	};
	
    Acts.prototype.PickSibling = function (group_name)
	{
	    var children_uids = this._sibling_get();
	    this.type.group.GetGroup(group_name).SetByUIDList(children_uids);
	    children_uids.length = 0;
	};
		
    Acts.prototype.PickRoot = function (group_name)
	{
	    var group = this.type.group.GetGroup(group_name);
	    group.Clean();
	    group.AddUID(this.root);
	};
		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.ChildrenCount = function (ret)
	{
		ret.set_int(this.children.length);
	};
    
	Exps.prototype.SiblingCount = function (ret)
	{
	    var parent_tn = this.TreeNodeGet(this.parent);
	    var cnt = (parent_tn != null)? parent_tn.children.length-1: 0;
		ret.set_int(cnt);
	};
	
	Exps.prototype.ParentUID = function (ret)
	{
		ret.set_int(this.parent);
	};
	
	Exps.prototype.RootUID = function (ret)
	{
		ret.set_int(this.root);
	};
	
	Exps.prototype.FirstChildUID = function (ret)
	{
	    var uid = (this.children.length > 0)? this.children[0]: (-1);	                          
		ret.set_int(uid);
	};
	
	Exps.prototype.LastChildUID = function (ret)
	{
	    var uid = (this.children.length > 0)? this.children[this.children.length-1]: (-1);	                          
		ret.set_int(uid);
	};	
	
	Exps.prototype.FirstSiblingUID = function (ret)
	{
	    var children_uids = this._sibling_get();
	    var uid = (children_uids.length > 0)? children_uids[0]: (-1);                      
		ret.set_int(uid);
	};
	
	Exps.prototype.LastSiblingUID = function (ret)
	{
	    var children_uids = this._sibling_get();
	    var uid = (children_uids.length > 0)? children_uids[children_uids.length-1]: (-1);                                  
		ret.set_int(uid);
	};	
}());


(function ()
{
    // general CreateObject function which call a callback before "OnCreated" triggered
    if (window.RexC2CreateObject != null)
        return;
        
    // copy from system action: CreateObject
    var CreateObject = function (obj, layer, x, y, callback, ignore_picking)
    {
        if (!layer || !obj)
            return;

        var inst = this.runtime.createInstance(obj, layer, x, y);
		
		if (!inst)
			return;
		
		this.runtime.isInOnDestroy++;
		
		// call callback before "OnCreated" triggered
		if (callback)
		    callback(inst);
		// call callback before "OnCreated" triggered
		
		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s);
			}
		}
		
		this.runtime.isInOnDestroy--;

        if (ignore_picking !== true)
        {
            // Pick just this instance
            var sol = obj.getCurrentSol();
            sol.select_all = false;
		    sol.instances.length = 1;
		    sol.instances[0] = inst;
		
		    // Siblings aren't in instance lists yet, pick them manually
		    if (inst.is_contained)
		    {
			    for (i = 0, len = inst.siblings.length; i < len; i++)
			    {
				    s = inst.siblings[i];
				    sol = s.type.getCurrentSol();
				    sol.select_all = false;
				    sol.instances.length = 1;
				    sol.instances[0] = s;
			    }
		    }
        }

        // add solModifiers
        //var current_event = this.runtime.getCurrentEventStack().current_event;
        //current_event.addSolModifier(obj);
        // add solModifiers
        
		return inst;
    };
    
    window.RexC2CreateObject = CreateObject;
}());