// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_UID2Prop = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_UID2Prop.prototype;
		
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
        this.alias2pv = {}; // {sid:pv_index}
	};
    
	instanceProto.onDestroy = function ()
	{
	};
    
	instanceProto.add_alias = function (alias_, type_, var_)
	{
        var map = this.alias2pv[alias_];
        if (map == null)
        {
            map = {};
            this.alias2pv[alias_] = map;

        }
        else
        {
            var k;
            for (k in map)
                delete map[k];
        }
        
		if (type_.is_family)
		{
            var i, cnt=type_.members.length, t;
			for (i=0; i<cnt; i++)
			{
				t = type_.members[i];
                
                map[t.sid] = var_ + t.family_var_map[type_.family_index];
			}
		}
		else
		{
            map[type_.sid] = var_;
		}
	};
    
	instanceProto.get_pv = function (inst, alias_)
	{
        if (inst == null)
            return 0;
        var map = this.alias2pv[alias_];
        if (map == null)
            return 0;
            
        var pv_index = map[inst.type.sid];
        if (pv_index == null)
            return 0;
            
        return inst.instance_vars[pv_index];
	};
    
	instanceProto.saveToJSON = function ()
	{    
		return { "alias": this.alias2pv,
		         };
	};
	
	instanceProto.loadFromJSON = function (o)
	{   
	    this.alias2pv = o["alias"];
	};
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.DefinePrivateVariableAlias = function (alias_, type_, var_)
	{
        this.add_alias(alias_, type_, var_);
	};
   
	Acts.prototype.InstDestroy = function (uid)
	{
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst)
            return;
 
        this.runtime.DestroyInstance(inst);
	};  

    Acts.prototype.InstSetX = function (uid, x)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.x == null))
            return;
                    
    	if (inst.x !== x)
    	{
    		inst.x = x;
    		inst.set_bbox_changed();
    	}
    };
    
    Acts.prototype.InstSetY = function (uid, y)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.y == null))
            return;
                    
    	if (inst.y !== y)
    	{
    		inst.y = y;
    		inst.set_bbox_changed();
    	}
    };
    
    Acts.prototype.InstSetPos = function (uid, x, y)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.x == null))
            return;
                    
    	if (inst.x !== x || inst.y !== y)
    	{
    		inst.x = x;
    		inst.y = y;
    		inst.set_bbox_changed();
    	}
    };
    
    Acts.prototype.InstSetPosToObject = function (uid, uidB, imgpt)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.x == null))
            return;
                    
    	var instB = this.runtime.getObjectByUID(uidB);   
    	if (!instB)
    		return;
    		
    	var newx, newy;
    		
    	if (instB.getImagePoint)
    	{
    		newx = instB.getImagePoint(imgpt, true);
    		newy = instB.getImagePoint(imgpt, false);
    	}
    	else
    	{
    		newx = instB.x;
    		newy = instB.y;
    	}
    		
    	if (inst.x !== newx || inst.y !== newy)
    	{
    		inst.x = newx;
    		inst.y = newy;
    		inst.set_bbox_changed();
    	}
    };
    
    Acts.prototype.InstMoveForward = function (uid, dist)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.x == null))
            return;
                    
    	if (dist !== 0)
    	{
    		inst.x += Math.cos(inst.angle) * dist;
    		inst.y += Math.sin(inst.angle) * dist;
    		inst.set_bbox_changed();
    	}
    };
    
    Acts.prototype.InstMoveAtAngle = function (uid, a, dist)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.x == null))
            return;
                    
    	if (dist !== 0)
    	{
    		inst.x += Math.cos(cr.to_radians(a)) * dist;
    		inst.y += Math.sin(cr.to_radians(a)) * dist;
    		inst.set_bbox_changed();
    	}
    };

    Acts.prototype.InstSetWidth = function (uid, w)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.width == null))
            return;
                    
    	if (inst.width !== w)
    	{
    		inst.width = w;
    		inst.set_bbox_changed();
    	}
    };
    
    Acts.prototype.InstSetHeight = function (uid, h)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.height == null))
            return;
                    
    	if (inst.height !== h)
    	{
    		inst.height = h;
    		inst.set_bbox_changed();
    	}
    };
    
    Acts.prototype.InstSetSize = function (uid, w, h)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.width == null))
            return;
                    
    	if (inst.width !== w || inst.height !== h)
    	{
    		inst.width = w;
    		inst.height = h;
    		inst.set_bbox_changed();
    	}
    };

    Acts.prototype.InstSetAngle = function (uid, a)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.angle == null))
            return;
                    
    	var newangle = cr.to_radians(cr.clamp_angle_degrees(a));
    
    	if (isNaN(newangle))
    		return;
    
    	if (inst.angle !== newangle)
    	{
    		inst.angle = newangle;
    		inst.set_bbox_changed();
    	}
    };
    
    Acts.prototype.InstRotateClockwise = function (uid, a)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.angle == null))
            return;
                    
    	if (a !== 0 && !isNaN(a))
    	{
    		inst.angle += cr.to_radians(a);
    		inst.angle = cr.clamp_angle(inst.angle);
    		inst.set_bbox_changed();
    	}
    };
    
    Acts.prototype.InstRotateCounterclockwise = function (uid, a)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.angle == null))
            return;
                    
    	if (a !== 0 && !isNaN(a))
    	{
    		inst.angle -= cr.to_radians(a);
    		inst.angle = cr.clamp_angle(inst.angle);
    		inst.set_bbox_changed();
    	}
    };
    
    Acts.prototype.InstRotateTowardAngle = function (uid, amt, target)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.angle == null))
            return;
                    
    	var newangle = cr.angleRotate(inst.angle, cr.to_radians(target), cr.to_radians(amt));
    
    	if (isNaN(newangle))
    		return;
    
    	if (inst.angle !== newangle)
    	{
    		inst.angle = newangle;
    		inst.set_bbox_changed();
    	}
    };
    
    Acts.prototype.InstRotateTowardPosition = function (uid, amt, x, y)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.angle == null))
            return;
                    
    	var dx = x - inst.x;
    	var dy = y - inst.y;
    	var target = Math.atan2(dy, dx);
    	var newangle = cr.angleRotate(inst.angle, target, cr.to_radians(amt));
    
    	if (isNaN(newangle))
    		return;
    
    	if (inst.angle !== newangle)
    	{
    		inst.angle = newangle;
    		inst.set_bbox_changed();
    	}
    };
    
    Acts.prototype.InstSetTowardPosition = function (uid, x, y)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.angle == null))
            return;
                    
    	// Calculate angle towards position
    	var dx = x - inst.x;
    	var dy = y - inst.y;
    	var newangle = Math.atan2(dy, dx);
    
    	if (isNaN(newangle))
    		return;
    
    	if (inst.angle !== newangle)
    	{
    		inst.angle = newangle;
    		inst.set_bbox_changed();
    	}
    };  

    Acts.prototype.InstSetOpacity = function (uid, x)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.opacity == null))
            return;
                    
    	var new_opacity = x / 100.0;
    
    	if (new_opacity < 0)
    		new_opacity = 0;
    	else if (new_opacity > 1)
    		new_opacity = 1;
    
    	if (new_opacity !== inst.opacity)
    	{
    		inst.opacity = new_opacity;
    		inst.runtime.redraw = true;
    	}
    };  
    
    Acts.prototype.InstSetVisible = function (v)
	{
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst || (inst.visible == null))
            return;
            
		if (!v !== !inst.visible)
		{
			inst.visible = v;
			inst.runtime.redraw = true;
		}
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.X = function (ret, uid)
	{
        var inst = this.runtime.getObjectByUID(uid);
        if ((inst == null) || (inst.x == null))
        {
	        ret.set_float(0);
            return;
        }
        
        ret.set_float(inst.x);
	};

    Exps.prototype.Y = function (ret, uid)
	{
        var inst = this.runtime.getObjectByUID(uid);
        if ((inst == null) || (inst.y == null))
        {
	        ret.set_float(0);
            return;
        }
        
        ret.set_float(inst.y);
	};

    Exps.prototype.Angle = function (ret, uid)
	{
        var inst = this.runtime.getObjectByUID(uid);
        if ((inst == null) || (inst.angle == null))
        {
	        ret.set_float(0);
            return;
        }
        
        ret.set_float(cr.to_clamped_degrees(inst.angle));
	};    

    Exps.prototype.Width = function (ret, uid)
	{
        var inst = this.runtime.getObjectByUID(uid);
        if ((inst == null) || (inst.width == null))
        {
	        ret.set_float(0);
            return;
        }
        
        ret.set_float(inst.width);
	};    

    Exps.prototype.Height = function (ret, uid)
	{
        var inst = this.runtime.getObjectByUID(uid);
        if ((inst == null) || (inst.height == null))
        {
	        ret.set_float(0);
            return;
        }
        
        ret.set_float(inst.height);
	};       

    Exps.prototype.Opacity = function (ret, uid)
	{
        var inst = this.runtime.getObjectByUID(uid);
        if ((inst == null) || (inst.opacity == null))
        {
	        ret.set_float(0);
            return;
        }
        
        ret.set_float(inst.opacity);
	};     

    Exps.prototype.Visible = function (ret, uid)
	{
        var inst = this.runtime.getObjectByUID(uid);
        if ((inst == null) || (inst.visible == null))
        {
	        ret.set_float(0);
            return;
        }
        
        ret.set_float(inst.visible);
	};      
    
    Exps.prototype.ImgptX = function (ret, uid, imgpt)
	{
        var inst = this.runtime.getObjectByUID(uid);
        if ((inst == null) || (inst.getImagePoint == null))
        {
	        ret.set_float(0);
            return;
        }
        
        ret.set_float(inst.getImagePoint(imgpt, true));
	};

    Exps.prototype.ImgptY = function (ret, uid, imgpt)
	{
        var inst = this.runtime.getObjectByUID(uid);
        if ((inst == null) || (inst.getImagePoint == null))
        {
	        ret.set_float(0);
            return;
        }
        
        ret.set_float(inst.getImagePoint(imgpt, false));
	};

    Exps.prototype.PV = function (ret, uid, alias)
	{
        var inst = this.runtime.getObjectByUID(uid);    
        ret.set_any(this.get_pv(inst, alias));
	}; 

    Exps.prototype.DistanceTo = function (ret, uidA, uidB)
	{
        var dist;
        var instA = this.runtime.getObjectByUID(uidA);
        var instB = this.runtime.getObjectByUID(uidB);   
        if ( (instA == null) || (instB == null) ||
              (instA.x == null) || (instA.y == null) ||
              (instB.x == null) || (instB.y == null) )
            dist = 0;
        else
            dist = cr.distanceTo(instA.x, instA.y, instB.x, instB.y);
        ret.set_float(dist);
	};

    Exps.prototype.AngleTo = function (ret, uidA, uidB)
	{
        var a;
        var instA = this.runtime.getObjectByUID(uidA);
        var instB = this.runtime.getObjectByUID(uidB);   
        if ( (instA == null) || (instB == null) ||
              (instA.x == null) || (instA.y == null) ||
              (instB.x == null) || (instB.y == null) )
            a = 0;
        else
            a = cr.angleTo(instA.x, instA.y, instB.x, instB.y);
        ret.set_float(cr.to_clamped_degrees(a));
	};
    
}());