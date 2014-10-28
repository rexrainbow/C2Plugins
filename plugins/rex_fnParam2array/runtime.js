// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_fnParam2Array = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_fnParam2Array.prototype;
		
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
	};

	var fake_ret = {value:0,
	                set_any: function(value){this.value=value;},
	                set_int: function(value){this.value=value;},	 
                    set_float: function(value){this.value=value;},	 
                    set_string: function(value){this.value=value;},	    
	               };	
	               
	instanceProto.new_array = function (array_objs)
	{
        cr.system_object.prototype.acts.CreateObject.call(
            this.runtime.system,
            array_objs,
            this.runtime.getLayerByNumber(0),
            0,
            0
        );
        
        return array_objs.getFirstPicked();
	}; 	               
	instanceProto.get_fn_object = function ()
	{
	    assert2(cr.plugins_.Function, "[FnParam2Array] Error: official function was not found.");

        var plugins = this.runtime.types;			
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Function.prototype.Instance)
            {
                return inst;
            }                                          
        }        
	};	 
	instanceProto.get_fn_params_cnt = function (fn_obj)
	{
        cr.plugins_.Function.prototype.exps.ParamCount.call(fn_obj, fake_ret);
        return fake_ret.value;
	}; 
	instanceProto.get_fn_param = function (fn_obj, index_)
	{
        cr.plugins_.Function.prototype.exps.Param.call(fn_obj, fake_ret, index_);
        return fake_ret.value;
	}; 	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
   
    Acts.prototype.DumpFParam2NewArray = function (array_objs)
	{  
	    assert2(cr.plugins_.Arr, "[FnParam2Array] Error:No Array object found.");	    	    	        
        var array_obj = this.new_array(array_objs);
        var is_array_inst = (array_obj instanceof cr.plugins_.Arr.prototype.Instance);
        assert2(is_array_inst, "[FnParam2Array] Error:Need an array object.");
        
        cr.plugins_.Arr.prototype.acts.SetSize.call(array_obj, 0, 1, 1);
                
        var fn_obj = this.get_fn_object();
        var params_cnt = this.get_fn_params_cnt(fn_obj);
        var i, p, arr_push = cr.plugins_.Arr.prototype.acts.Push;
        for (i=0; i<params_cnt; i++)
        {
            p = this.get_fn_param(fn_obj, i);
            arr_push.call(array_obj, 0, p, 0);
        }
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
       
}());