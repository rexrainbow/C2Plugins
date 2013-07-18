// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Nickname = function(runtime)
{
	this.runtime = runtime;
};
cr.plugins_.Rex_Nickname.nickname2objtype = {};  // {sid:_sid, index:types_by_index[_index]}

(function ()
{
	var pluginProto = cr.plugins_.Rex_Nickname.prototype;
		
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
	    this.nickname2objtype = cr.plugins_.Rex_Nickname.nickname2objtype;
	};
    
	instanceProto._getObjectType = function (nickname)
	{
        var sid_info = this.nickname2objtype[nickname];
        if (sid_info == null)
            return null;
            
        var sid = sid_info.sid;
        var objtypes = this.runtime.types_by_index;
        var t = objtypes[sid_info.index];
        if ((t != null) && (t.sid === sid))
            return t;
    
		var i, len=objtypes.length;
		for (i=0; i<len; i++)
		{
            t = objtypes[i];
			if (t.sid === sid)
            {
                sid_info.index = i;
				return t;
            }
		}
		
		return null;
	};    
	
	instanceProto.create_insts = function (nickname,x,y,_layer)
	{
	    var objtype = this._getObjectType(nickname);
        if (objtype == null)
            return;
        var layer = (typeof _layer == "number")?
                    this.runtime.getLayerByNumber(_layer):
                    this.runtime.getLayerByName(_layer);  
        var inst = this.runtime.createInstance(objtype, layer, x, y ); 
		if (inst == null)
		    return null;
		
        var sol = inst.type.getCurrentSol();
        sol.select_all = false;
		sol.instances.length = 1;
		sol.instances[0] = inst;
		
		// Siblings aren't in instance lists yet, pick them manually
		var i, len, s;
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
        
		this.runtime.isInOnDestroy++;
		this.runtime.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnCreated, inst);
		this.runtime.isInOnDestroy--;
        
	    return inst;
	}; 	

    instanceProto.PickAll = function (nickname, family_objtype)
	{
	    if (!family_objtype.is_family)
		    return;
	    var objtype = this._getObjectType(nickname);
        if (!objtype)
            return;
        if (family_objtype.members.indexOf(objtype) == -1)
            return;           
        var sol = objtype.getCurrentSol();    
        var sol_save = sol.select_all;   
        sol.select_all = true;
        var all_insts = sol.getObjects();
        var sol_family = family_objtype.getCurrentSol();  
        sol_family.instances = all_insts.slice();
        sol_family.select_all = false; 
        sol.select_all = sol_save;  
	};	
	
	instanceProto.saveToJSON = function ()
	{    
	    var sid2name = {};
	    var name, objtype;
	    for (name in this.nickname2objtype)
	        sid2name[this.nickname2objtype[name].sid] = name;
		return { "sid2name": sid2name,
		         };
	};
	
	instanceProto.loadFromJSON = function (o)
	{   
	    var sid2name = o["sid2name"];	   
	    var sid, name, objtype;
	    for (sid in sid2name)
	    {
	        name = sid2name[sid];
            this.nickname2objtype[name] = {sid:parseInt(sid, 10), index:-1};
	    }
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.PickAll = function (nickname, family_objtype)
	{
	    this.PickAll(nickname, family_objtype);
		return true;
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
		
	Acts.prototype.AssignNickname = function (nickname, objtype)
	{
        if (objtype == null)
            return;
        this.nickname2objtype[nickname] = {sid:objtype.sid, index:-1};
	};
	
	Acts.prototype.CreateInsts = function (nickname,x,y,_layer, family_objtype)
	{
        var inst = this.create_insts(nickname,x,y,_layer);
        if (inst == null)
            return;            
        if (!family_objtype)
            return;

        if (family_objtype.members.indexOf(inst.type) == -1)
            return; 
             
        family_objtype.getCurrentSol().pick_one(inst);
        family_objtype.applySolToContainer();
	};	

    Acts.prototype.PickAll = function (nickname, family_objtype)
	{
	    this.PickAll(nickname, family_objtype);    
	}; 
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
}());