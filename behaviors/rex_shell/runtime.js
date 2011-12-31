// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Shell = function(runtime)
{
	this.runtime = runtime;
    this.uid2inst = {};     // mapping uid to behavior instance
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Shell.prototype;
		
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
        this.create_cb = null;
        this.destroy_cb = null;
        this.tick_cb = null;
        this.fn_obj = null;
        this.csv_obj = null;

	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime; 
        
        this.uid2inst = this.behavior.uid2inst;   // mapping uid to behavior instance          
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.activated = (this.properties[1]==1);
                                                                       
        this.uid2inst[this.inst.uid] = this;
        
		// initial memory
		var mem = this.properties[2];
        try
        {
            mem = (mem!="")? jQuery.parseJSON(mem):{};      
        }
        catch(err)
        {
            alert(err);
            mem = {};            
        }
        this.shell_obj = new cr.behaviors.Rex_Shell.ShellKlass(this,
                                                               mem);   
        
        var create_cb = this.type.create_cb;
        if (create_cb != null)
        {
            create_cb(this.shell_obj, this.type.fn_obj, this.type.csv_obj);
        }
	};  
	behinstProto.onDestroy = function()
	{
        var destroy_cb = this.type.destroy_cb;
        if (destroy_cb != null)
        {
            destroy_cb(this.shell_obj, this.type.fn_obj, this.type.csv_obj);
        }    
		delete this.uid2inst[this.inst.uid];
	};    
    
	behinstProto.tick = function ()
	{
        var tick_cb = this.type.tick_cb;
        if (this.activated && 
            (tick_cb!= null))
        {
            tick_cb(this.shell_obj, this.type.fn_obj, this.type.csv_obj);
        }
	};
	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;
    
	acts.SetActivated = function (s)
	{
		this.activated = (s==1);
	};   
    
	acts.CleanMemory = function ()
	{
        this.shell_obj["Mem"] = {};
	};  
        
	acts.SetMemory = function (index, value)
	{
        this.shell_obj["Mem"][index] = value;
	};
    

	acts.InjectJSFunctionObjects = function (code_string)
	{
        var fn = eval("("+code_string+")");
        fn(this.shell_obj, this.type.fn_obj, this.type.csv_obj);
	};      

    acts.ConnectFn = function (fn_objs)
	{  
        var fn_obj = fn_objs.instances[0];
        if (fn_obj.check_name == "FUNCTION")
            this.type.fn_obj = fn_obj.adapter;        
        else
            alert ("Can not connect to a function object");
	};    
    
    acts.ConnectCSV = function (csv_objs)
	{  
        var csv_obj = csv_objs.instances[0];
        if (csv_obj.check_name == "CSV")
            this.type.csv_obj = csv_obj.adapter;        
        else
            alert ("Can not connect to a csv object");
	};   
  
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

    exps.Mem = function (ret, index)
	{
        var value = this.fsm["Mem"][index];
        if (value == null) 
        {
            value = 0;
            if (this.is_debug_mode) 
                alert ("Can not find index in memory '" + index + "'");
                
        }
	    ret.set_any(value);
	};	

    exps.X = function (ret, uid, default_value)
	{
        var inst = this.uid2inst[uid];
        var val = (inst != null)? inst.inst.x:default_value;
	    ret.set_float(val);
	};	    

    exps.Y = function (ret, uid, default_value)
	{
        var inst = this.uid2inst[uid];
        var val = (inst != null)? inst.inst.y:default_value;
	    ret.set_float(val);
	};

    exps.Width = function (ret, uid, default_value)
	{
        var inst = this.uid2inst[uid];
        var val = (inst != null)? inst.inst.width:default_value;
	    ret.set_float(val);
	};	    

    exps.Height = function (ret, uid, default_value)
	{
        var inst = this.uid2inst[uid];
        var val = (inst != null)? inst.inst.height:default_value;
	    ret.set_float(val);
	};    

    exps.Angle = function (ret, uid, default_value)
	{
        var inst = this.uid2inst[uid];
        var val = (inst != null)? cr.to_clamped_degrees(inst.inst.angle):default_value;
	    ret.set_float(val);
	};	    

    exps.Opacity = function (ret, uid, default_value)
	{
        var inst = this.uid2inst[uid];
        var val = (inst != null)? inst.inst.opacity:default_value;
	    ret.set_float(val);
	};     

    exps.Visible = function (ret, uid, default_value)
	{
        var inst = this.uid2inst[uid];
        var val = (inst != null)? inst.inst.visible:default_value;
	    ret.set_float(val);
	};	    
    
}());

(function ()
{
    cr.behaviors.Rex_Shell.ShellKlass = function(plugin,
                                                 mem)
    {
        this["_plugin"] = plugin;
        this["_type"] = plugin.type;
        this["_runtime"] = plugin.runtime;
        this["inst"] = plugin.inst;

        this["Mem"] = mem;
        this["uid2inst"] = plugin.uid2inst;
    };
    var ShellKlassProto = cr.behaviors.Rex_Shell.ShellKlass.prototype;
    
    ShellKlassProto["GetDt"] = function()
    {return this["_runtime"].getDt(this["inst"]);};
    
    ShellKlassProto["GetX"] = function(inst){return this["inst"].x;}; 
    ShellKlassProto["GetY"] = function(inst){return this["inst"].y;};
    ShellKlassProto["GetWidth"] = function(inst){return this["inst"].width;}; 
    ShellKlassProto["GetHeight"] = function(inst){return this["inst"].height;};    
    ShellKlassProto["GetAngle"] = function(inst){return this["inst"].angle;};
    ShellKlassProto["GetOpacity"] = function(inst){return this["inst"].opacity;}; 
    ShellKlassProto["GetVisible"] = function(inst){return this["inst"].visible;};
    
    ShellKlassProto["SetX"] = function(inst, value){this["inst"].x = value;}; 
    ShellKlassProto["SetY"] = function(inst, value){this["inst"].y = value;};
    ShellKlassProto["SetWidth"] = function(inst, value){this["inst"].width = value;}; 
    ShellKlassProto["SetHeight"] = function(inst, value){this["inst"].height = value;};
    ShellKlassProto["SetAngle"] = function(inst, value){this["inst"].angle = value;};      
    ShellKlassProto["SetOpacity"] = function(inst, value){this["inst"].opacity = value;};    
    ShellKlassProto["SetVisible"] = function(inst, value){this["inst"].visible = value;};    

    ShellKlassProto["set_bbox_changed"] = function(inst){inst.set_bbox_changed();};     
    
    
    ShellKlassProto["InjectCreateCB"] = function(fn)
    {
        this["_type"].create_cb = fn;
    };  
    
    ShellKlassProto["InjectDestroyCB"] = function(fn)
    {
        this["_type"].destroy_cb = fn;
    };      
    
    ShellKlassProto["InjectTickCB"] = function(fn)
    {
        this["_type"].tick_cb = fn;
    };  
}());