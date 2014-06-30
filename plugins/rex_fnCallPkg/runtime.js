// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_fnCallPkg = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_fnCallPkg.prototype;
		
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

	var FNTYPE_UK = 0;          // unknow 
	var FNTYPE_NA = 1;	        // not avaiable
	var FNTYPE_REXFNEX = 2;     // rex_functionext
    var FNTYPE_REXFN2 = 3;      // rex_function2
	var FNTYPE_OFFICIALFN = 4;  // official function
	instanceProto.onCreate = function()
	{
        this._fnobj = null;
        this._fnobj_type = FNTYPE_UK;
	    this._act_call_fn = null;
	    //this._act_set_param = null; // for rex_function2
		this._exp_call = null;
		this._exp_retvalue = null;	

        // function queue
        this.fn_queue = [];  	    
	};
	var fake_ret = {value:0,
	                set_any: function(value){this.value=value;},
	                set_int: function(value){this.value=value;},	 
                    set_float: function(value){this.value=value;},	 
                    set_string: function(value){this.value=value;},	    
	               }; 
	                        
	instanceProto.onDestroy = function ()
	{
	}; 
	  
	instanceProto._setup_cmdhandler = function ()
	{
        var plugins = this.runtime.types;			
        var name, inst;
		//// try to get cmdhandler from function extension
		//if (cr.plugins_.Rex_FnExt != null)
		//{
        //    for (name in plugins)
        //    {
        //        inst = plugins[name].instances[0];
        //        if (inst instanceof cr.plugins_.Rex_FnExt.prototype.Instance)
        //        {
        //            this._fnobj = inst;
        //            this._act_call_fn = cr.plugins_.Rex_FnExt.prototype.acts.CallFunction;
		//	        this._exp_call = cr.plugins_.Rex_FnExt.prototype.exps.Call;
		//		    this._fnobj_type = FNTYPE_REXFNEX;
        //            return;
        //        }                                          
        //    }
		//}
        
               
		// try to get cmdhandler from rex_function2
		//if (cr.plugins_.Rex_Function2 != null)
		//{
        //    
        //    for (name in plugins)
        //    {
        //        inst = plugins[name].instances[0];
        //        if (inst instanceof cr.plugins_.Rex_Function2.prototype.Instance)
        //        {
        //            this._fnobj = inst;
        //            this._act_call_fn = cr.plugins_.Rex_Function2.prototype.acts.CallFunction;  // with parameter table
		//	        //this._act_set_param = cr.plugins_.Rex_Function2.prototype.acts.SetParameter;
		//	        this._exp_call = cr.plugins_.Rex_Function2.prototype.exps.Call;
		//		    this._fnobj_type = FNTYPE_REXFN2;
        //            return;
        //        }                                          
        //    }
		//}        
        
        // try to get fn object from official function
		if (cr.plugins_.Function != null)    
		{	
            for (name in plugins)
            {
                inst = plugins[name].instances[0];
                if (inst instanceof cr.plugins_.Function.prototype.Instance)
                {
                    this._fnobj = inst;
                    this._act_call_fn = cr.plugins_.Function.prototype.acts.CallFunction;
                    this._exp_call = cr.plugins_.Function.prototype.exps.Call;
                    this._exp_retvalue = cr.plugins_.Function.prototype.exps.ReturnValue;	
				    this._fnobj_type = FNTYPE_OFFICIALFN;
                    return;
                }                                          
            }
		}
		        
        this._fnobj_type = FNTYPE_NA;  // function object is not avaiable
	};  
    	 
	instanceProto.execute_package = function(pkg)
	{	  
	    if (this._fnobj_type == FNTYPE_NA)
	        return;
	        
	    if (this._fnobj_type == FNTYPE_UK)
	        this._setup_cmdhandler();	    
	    
        var is_one_function = (typeof(pkg[0]) == "string");
        if (is_one_function)
        {
	        this.call_function(pkg);
        }
        else
        {
            var i,cnt=pkg.length;
            for(i=0; i<cnt; i++)
            {
                this.call_function(pkg[i]);
            }
        }
	};  

	instanceProto.call_function = function(pkg)
	{	  
	    var name = pkg.shift();
	    this._act_call_fn.call(this._fnobj, name, pkg);
	};    
 	
    instanceProto.return_value_get = function ()
    {
	    if (this._fnobj_type == FNTYPE_NA)
	        return 0;
	        
	    if (this._fnobj_type == FNTYPE_UK)
	        this._setup_cmdhandler();	    
	     
        this._exp_retvalue.call(this._fnobj, fake_ret);
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

    Acts.prototype.CallFunction = function (pkg)
	{
        if (pkg == "")
            return;
            
		try {
			pkg = JSON.parse(pkg);
		}
		catch(e) { return; }
		
		this.execute_package(pkg);
	}; 
    
    Acts.prototype.CleanFnQueue = function ()
	{
		this.fn_queue.length = 0;
	}; 
    
    Acts.prototype.PushToFnQueue = function (name, params)
	{   
        var pkg = [name];
        pkg.push.apply(pkg, params);
	    this.fn_queue.push(pkg);
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    var pkg=[];
    Exps.prototype.FnCallPkg = function (ret)
	{
	    pkg.length = 0;	   
		var i, cnt=arguments.length;
		for (i=1; i < cnt; i++)
		    pkg.push(arguments[i]);
		    
	    ret.set_string( JSON.stringify(pkg) );
	};
	
    Exps.prototype.Call = function (ret, pkg)
	{
        if (pkg == "")
        {
            ret.set_any( 0 );
            return;
        }
        
		try {
			pkg = JSON.parse(pkg);
		}
		catch(e) 
		{
		     ret.set_any( 0 ); 
		     return;
	    }
	    
		this.execute_package(pkg);		   
	    ret.set_any( this.return_value_get() );
	};

    Exps.prototype.FnQueuePkg = function (ret)
	{
	    ret.set_string( JSON.stringify(this.fn_queue) );
	};
}());