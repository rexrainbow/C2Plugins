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
        this.tmp_insts = [];
	};
    instanceProto._pick_all = function (objtype)
	{
        if (!objtype)
            return false;
		if (!objtype.instances.length)
			return false;            

        // Get the current sol and reset the select_all flag
        var sol = objtype.getCurrentSol();
        sol.select_all = true;
		objtype.applySolToContainer();
        return true;
	}; 
    instanceProto._pick_inverse = function (objtype, uid, is_pick_all)
	{
        if (!objtype)
            return false;
		if (!objtype.instances.length)
			return false;
                    
        var sol = objtype.getCurrentSol();  
        if (is_pick_all==1)
        {
            sol.select_all = true;  
            cr.shallowAssignArray(sol.instances, sol.getObjects());
        }

        var insts = sol.instances;        
        var insts_length = insts.length;
        var i, inst;
        var index = -1;

        for (i=0; i < insts_length; i++)
        {
            inst = insts[i];
            if (inst.uid == uid)
            {
                index = i;
                break;
            }
        }
        
        if (index != -1)
            cr.arrayRemove(insts, index);
        sol.select_all = false; 
        objtype.applySolToContainer();
        return (sol.instances.length != 0);        
	};      
    instanceProto._quick_pick = function (objtype, uid)
	{	    
        if (!objtype)
            return;
		if (!objtype.instances.length)
			return;
        
        var inst = this.runtime.getObjectByUID(uid);
        var is_find = (inst != null);
        if (is_find)
        {
            var type_name = inst.type.name;
            if (objtype.is_family)
            {
                is_find = false;
                var members = objtype.members;
                var cnt = members.length;
                var i;
                for (i=0; i<cnt; i++)
                {
                    if (type_name == members[i].name)
                    {
                        is_find = true;
                        break;
                    }
                }
            }
            else
                is_find = (type_name == objtype.name);
        }
        var sol = objtype.getCurrentSol();  
        if (is_find)
            sol.pick_one(inst);
        else
            sol.instances.length = 0;
        sol.select_all = false;
        objtype.applySolToContainer();
        return is_find;
	};        
    instanceProto._get_layer = function(layerparam)
    {
        return (typeof layerparam == "number")?
               this.runtime.getLayerByNumber(layerparam):
               this.runtime.getLayerByName(layerparam);
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
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.PickAll = function (objtype)
	{
		return this._pick_all(objtype);;
	};
 
	Cnds.prototype.PickInverse = function (objtype, uid, is_pick_all)
	{
        return this._pick_inverse(objtype, uid, is_pick_all);
	};     
 
	Cnds.prototype.QuickPickByUID = function (objtype, uid)
	{
        return this._quick_pick(objtype, uid);
	};        
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    // deprecated
    Acts.prototype.__PickByUID = function (objtype, uid, is_pick_all)
	{  
        if (!objtype)
            return;
		if (!objtype.instances.length)
			return;
       
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
        
        if (is_find)
            sol.pick_one(inst);
        else
            sol.instances.length = 0;
            
        sol.select_all = false;
        objtype.applySolToContainer();
	}; 
   
        
    Acts.prototype.PickByPropCmp = function (objtype, prop_index, cmp, value, is_pick_all)
	{
        if (!objtype)
            return;
		if (!objtype.instances.length)
			return;
            
        var sol = objtype.getCurrentSol();  
        if (is_pick_all==1)
            sol.select_all = true;  
            
        var insts = sol.getObjects();
        var insts_length = insts.length;
        var i, inst;
        this.tmp_insts.length = 0;

        for (i=0; i < insts_length; i++)
        {
            inst = insts[i];
            if (cr.do_cmp(GetInstPropertyValue(inst, prop_index), cmp, value))
                this.tmp_insts.push(inst);
        }
        cr.shallowAssignArray(sol.instances, this.tmp_insts);
        sol.select_all = false;
	};  

    Acts.prototype.__PickInverse = function (objtype, uid, is_pick_all)
	{
        this._pick_inverse(objtype, uid, is_pick_all);
	};   
	
	// valid
    Acts.prototype.PickAll = function (objtype)
	{
        if (!objtype)
            return;
            	    
        // Get the current sol and reset the select_all flag
        var sol = objtype.getCurrentSol();
        sol.select_all = true;
		objtype.applySolToContainer();	    
	}; 
	    
    Acts.prototype.PickByUID = function (objtype, uid)
	{
		var i, len, j, inst, families, instances, sol;
					    
        if (!objtype)
            return;
            	    
        // Not inverted (ordinary pick of single instance with matching UID)
        // Use the runtime's getObjectByUID() function to look up
        // efficiently, and also support pending creation objects.
        inst = this.runtime.getObjectByUID(uid);
        
        if (!inst)
        	return;
        	
        // Verify this instance is already picked. We should not be able to
        // pick instances already filtered out by prior conditions.
        sol = objtype.getCurrentSol();
        
        if (!sol.select_all && sol.instances.indexOf(inst) === -1)
        	return;		// not picked
        
        // If this type is a family, verify the inst belongs to this family.
        // Otherwise verify the inst is of the same type as this.
        if (objtype.is_family)
        {
        	families = objtype.families;
        	
        	for (i = 0, len = families.length; i < len; i++)
        	{
        		if (families[i] === inst.type)
        		{
        			sol.pick_one(inst);
        			objtype.applySolToContainer();
        			return;
        		}
        	}
        }
        else if (inst.type === objtype)
        {
        	sol.pick_one(inst);
        	objtype.applySolToContainer();
        	return;
        }	    	    
	}; 
	
    Acts.prototype.PickInverse = function (objtype, uid, is_pick_all)
	{
	    var i, len, j, inst, families, instances, sol;

        if (!objtype)
            return;
            
        sol = objtype.getCurrentSol();
        
        if (is_pick_all)
        {
            sol.select_all = true;
        }
        
        if (sol.select_all)
        {
        	sol.select_all = false;
        	sol.instances.length = 0;
        	
        	instances = objtype.instances;
        	for (i = 0, len = instances.length; i < len; i++)
        	{
        		inst = instances[i];
        		
        		if (inst.uid !== uid)
        			sol.instances.push(inst);
        	}
        	
        	objtype.applySolToContainer();
        	return;
        }
        else
        {
        	for (i = 0, j = 0, len = sol.instances.length; i < len; i++)
        	{
        		inst = sol.instances[i];
        		sol.instances[j] = inst;
        		
        		if (inst.uid !== uid)
        			j++;
        	}
        	
        	sol.instances.length = j;
        	
        	objtype.applySolToContainer();
        	return;
        }	
					    
	}; 	
		
    Acts.prototype.SetGroupActive = function (group, active)
    {
		var g = this.runtime.groups_by_name[group.toLowerCase()];
        
		if (!g)
			return;
        
		switch (active) {
		// Disable
		case 0:
			g.setGroupActive(false);
			break;
		// Enable
		case 1:
			g.setGroupActive(true);
			break;
		// Toggle
		case 2:
			g.setGroupActive(!g.group_active);
			break;
		}
    }; 

    Acts.prototype.SetLayerVisible = function (layerparam, visible_)
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

    Acts.prototype.SwapPosByUID = function (uidA, uidB)
    {
        var instA = this.runtime.getObjectByUID(uidA);
        var instB = this.runtime.getObjectByUID(uidB);
        
        if (!instA || !instB)
            return;
            
        var pxA = instA.x, pyA = instA.y;
        var pxB = instB.x, pyB = instB.y;
        
        instA.x = pxB; instA.y = pyB;
        instB.x = pxA; instB.y = pyA;
        
        instA.set_bbox_changed();
        instB.set_bbox_changed();        
    };      
      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.Eval = function (ret, code_string)
	{
	    ret.set_any( eval( "("+code_string+")" ) );
	};

    Exps.prototype.ToHexString = function (ret, decval)
	{
	    ret.set_string( decval.toString(16) );
	};  
    
    Exps.prototype.ToDecimalMark = function (ret, number_in, locales)
	{
	    ret.set_string( number_in.toLocaleString(locales) );
	};
    
    Exps.prototype.String2ByteCount = function (ret, s)
	{
	    var c = encodeURI(s).split(/%..|./).length - 1;
	    ret.set_int( c );
	};	
    
    Exps.prototype.SubString = function (ret, s, start, end)
	{
	    ret.set_string( s.substring(start, end) );
	};	
    
    Exps.prototype.ToFixed = function (ret, n, dig)
	{
        if (dig == null)
            dig = 10;
	    ret.set_string( n["toFixed"](dig) );
	};	
    
    Exps.prototype.ToPrecision = function (ret, n, dig)
	{
        if (dig == null)
            dig = 10;        
	    ret.set_string( n["toPrecision"](dig) );
	};	    
    
    Exps.prototype.ToFixedNumber = function (ret, n, dig)
	{
        if (dig == null)
            dig = 10;
        var val = n["toFixed"](dig);
	    ret.set_float( parseFloat( val ) );
	};	    
    
    Exps.prototype.Newline = function (ret, cnt)
	{
        if (cnt == null)
            cnt = 1;
        
        var i, s = "";
        for (i=0; i<cnt; i++)
            s += "\n";
	    ret.set_string( s );
	};	    
    
    Exps.prototype.NormalRandom = function (ret, mean, stddev)
	{
        var u, v, r
		do 
        {
			u = 2*Math.random() -1;
			v = 2*Math.random() -1;
			r = u*u + v*v;
		} while (r > 1 || r == 0);

		var gauss = u * Math.sqrt(-2*Math.log(r)/r);
	    ret.set_float( mean + gauss*stddev );
	};

    Exps.prototype.NormalRandomApproximation = function (ret, mean, stddev)
	{
        var g=0;
        for (var i=0; i<6; i++)
            g += Math.random();
        
		g = (g - 3) / 3;
	    ret.set_float( mean + g*stddev );
	};
    
	Exps.prototype.ReflectionAngle = function (ret, inputA, normalA)
	{    
	    var normalangle = cr.to_radians(normalA);
        var startangle = cr.to_radians(inputA);
		var vx = Math.cos(startangle);
		var vy = Math.sin(startangle);
		var nx = Math.cos(normalangle);
		var ny = Math.sin(normalangle);
		var v_dot_n = vx * nx + vy * ny;
		var rx = vx - 2 * v_dot_n * nx;
		var ry = vy - 2 * v_dot_n * ny;
        var ra = cr.angleTo(0, 0, rx, ry);
	    ret.set_float(cr.to_degrees(ra));
	};	   

    var num2base32 = ["0","1","2","3","4","5","6","7","8","9",
                                 "b","c","d","e","f","g","h","j","k","m",
                                 "n","p","q","r","s","t","u","v","w","x",
                                 "y","z"];
    Exps.prototype.RandomBase32 = function (ret, dig)
	{
        var o = "";
        for (var i=0;i<dig;i++)
            o += num2base32[ Math.floor( Math.random()*32 ) ];
        
	    ret.set_string( o );
	};	
}());