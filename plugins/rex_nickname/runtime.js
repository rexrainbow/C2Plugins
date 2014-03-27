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
cr.plugins_.Rex_Nickname.nickname2objtype = {};  // {sid:_sid, index:types_by_index[_index
cr.plugins_.Rex_Nickname.sid2nickname = {};  // {sid:nickname}
cr.plugins_.Rex_Nickname.AddNickname = function(nickname, objtype)
{
    cr.plugins_.Rex_Nickname.nickname2objtype[nickname] = {sid:objtype.sid, index:-1};
    cr.plugins_.Rex_Nickname.sid2nickname[objtype.sid.toString()] = nickname;
};

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
        this.sid2nickname = cr.plugins_.Rex_Nickname.sid2nickname;
	    this.ActCreateInstance = cr.system_object.prototype.acts.CreateObject;
	};
    
	// export		
	instanceProto.Nickname2Type = function (nickname)
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
	
	// export
	instanceProto.CreateInst = function (nickname,x,y,_layer)
	{
	    var objtype = (typeof(nickname) == "string")? this.Nickname2Type(nickname):
	                                                  nickname;
        if (objtype == null)
            return null;
                        
        var layer = (typeof _layer == "number")? this.runtime.getLayerByNumber(_layer):
                    (typeof _layer == "string")? this.runtime.getLayerByName(_layer):  
                                                 _layer;
                                                 
        // call system action: Create instance
        this.ActCreateInstance.call(
            this.runtime.system,
            objtype,
            layer,
            x,
            y
        );
                           
	    return objtype.getFirstPicked();
	}; 	

    // export
    instanceProto.PickAll = function (nickname, family_objtype)
	{
	    if (!family_objtype.is_family)
		    return false;

		var sol_family = family_objtype.getCurrentSol(); 
		sol_family.select_all = false;
		sol_family.instances.length = 0;   // clear contents
				    
	    var objtype = this.Nickname2Type(nickname);
        if ( (!objtype) ||
		     (family_objtype.members.indexOf(objtype) == -1) )
	    {			
            return false;
		}
		else
		{
            var sol = objtype.getCurrentSol();    
            var sol_save = sol.select_all;   
            sol.select_all = true;
            var all_insts = sol.getObjects();
            sol_family.instances = all_insts.slice();
            sol_family.select_all = false; 
            sol.select_all = sol_save; 		
		}
		return true;
	};	
	

    instanceProto.PickMatched = function (_substring, family_objtype)
	{
	    if (!family_objtype.is_family)
		    return false;
		    
		var sol_family = family_objtype.getCurrentSol(); 
		sol_family.select_all = false;
		var sol_family_insts = sol_family.instances;
		sol_family_insts.length = 0;   // clear contents
		    
		var nickname;
		var objtype, sol, sol_save;
		for (nickname in this.nickname2objtype)
		{
		    if (nickname.match(_substring) == null)
		        continue;
		    
		    objtype = this.Nickname2Type(nickname);
		    if ( (!objtype) ||
		         (family_objtype.members.indexOf(objtype) == -1) )
		        continue;
		    
		    sol = objtype.getCurrentSol();  
		    sol_save = sol.select_all;
		    sol_family_insts.push.apply(sol_family_insts, sol.getObjects());
		    sol.select_all = sol_save;
		}
		return (sol_family_insts.length > 0);		
	};

	instanceProto.saveToJSON = function ()
	{    
		return { "sid2name": this.sid2nickname,
		         };
	};
	
	instanceProto.loadFromJSON = function (o)
	{   
	    var sid2name = o["sid2name"];
	    this.sid2nickname = sid2name; 	   
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

	Cnds.prototype.IsNicknameValid = function (nickname)
	{	    
		return (this.nickname2objtype[nickname] != null);
	};
	
	Cnds.prototype.Pick = function (nickname, family_objtype)
	{
		return this.PickAll(nickname, family_objtype);
	};
	
	Cnds.prototype.PickMatched = function (_substring, family_objtype)
	{
		return this.PickMatched(_substring, family_objtype);
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
		
	Acts.prototype.AssignNickname = function (nickname, objtype)
	{
        if (objtype == null)
            return;
        cr.plugins_.Rex_Nickname.AddNickname(nickname, objtype);
	};
	
	Acts.prototype.CreateInst = function (nickname,x,y,_layer, family_objtype)
	{
        var inst = this.CreateInst(nickname,x,y,_layer);
		
		// SOL
        if (!family_objtype)
            return;
			
        if ((inst == null) || 
		    (family_objtype.members.indexOf(inst.type) == -1))	    
		{
		    // clean sol
			var sol = family_objtype.getCurrentSol();
			sol.select_all = false;
            sol.instances.length = 0;   // clear contents
		}
        else
		{
		    // sol push
            family_objtype.getCurrentSol().pick_one(inst);
            family_objtype.applySolToContainer();
        }             
	};	

    Acts.prototype.Pick = function (nickname, family_objtype)
	{
	    this.PickAll(nickname, family_objtype);    
	}; 
	
	Acts.prototype.PickMatched = function (_substring, family_objtype)
	{
		this.PickMatched(_substring, family_objtype);
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
}());