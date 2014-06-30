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
}());