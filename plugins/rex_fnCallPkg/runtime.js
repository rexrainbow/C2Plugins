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

	instanceProto.onCreate = function()
	{
        this.c2FnType = null;
        // function queue
        this.fn_queue = []; 
        
        // for each pkg
        this.exp_pkg = null; 	    
	};
	                        
	instanceProto.onDestroy = function ()
	{
	}; 
    
	instanceProto.getC2FnType = function ()
	{
        if (this.c2FnType === null)
        {
            if (window["c2_callRexFunction2"])
                this.c2FnType = "c2_callRexFunction2";
            else if (window["c2_callFunction"])
                this.c2FnType = "c2_callFunction";            
            else
                this.c2FnType = "";
        }
        return this.c2FnType;
	};    
    
     // [fnName, param0, param1, ….]
    var gC2FnParms = [];
    instanceProto.callC2Fn = function ()
    {
        var c2FnGlobalName = this.getC2FnType();
        if (c2FnGlobalName === "")
            return 0;
        
        var c2FnName = arguments[0];
        var i, cnt=arguments.length;
        for(i=1; i<cnt; i++)
        {
            gC2FnParms.push( arguments[i] );
        }
        var retValue = window[c2FnGlobalName](c2FnName, gC2FnParms);
        gC2FnParms.length = 0;
        
        return retValue;
    };
    
	instanceProto.execute_package = function(pkg, is_reverse)
	{	  
        if (this.getC2FnType() === "")
	        return;
	        
        var retVal;
        var is_one_function = (typeof(pkg[0]) == "string");
        if (is_one_function)
        {
            retVal = this.callC2Fn.apply(this, pkg);
        }
        else
        {
            var i,cnt=pkg.length;            
            if (is_reverse !== 1)
            {
                for(i=0; i<cnt; i++)
                {
                    retVal = this.callC2Fn.apply(this, pkg[i]);
                }
            }
            else
            {
                for(i=cnt-1; i>=0; i--)
                {
                    retVal = this.callC2Fn.apply(this, pkg[i]);
                }                
            }
        }
        
        return retVal;
	};  

    instanceProto.saveToJSON = function ()
    { 
        return { "ft": this.c2FnType,
                      "fq" : this.fn_queue,
                   };
    };
    
    instanceProto.loadFromJSON = function (o)
    {
        this.c2FnType = o["ft"];
        this.fn_queue = o["fq"]
    };         
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();  
	  
	Cnds.prototype.ForEachPkg = function ()
	{
	    var i,cnt=this.fn_queue.length;
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
			    
        for (i=0; i<cnt; i++)
        {
            if (solModifierAfterCnds)
                this.runtime.pushCopySol(current_event.solModifiers);
            
            this.exp_pkg = this.fn_queue[i];            
            current_event.retrigger();
            
            if (solModifierAfterCnds)
			    this.runtime.popSol(current_event.solModifiers);
        }  
	    this.exp_pkg = null;

		return false;
	}; 
	
	  
	Cnds.prototype.IsCurName = function (name_)
	{
	    if (this.exp_pkg == null)	        
		    return false;
		
		return cr.equals_nocase(name_, this.exp_pkg[0]);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.CallFunction = function (pkg, is_reverse)
	{
        if (pkg == "")
            return;
            
		try {
			pkg = JSON.parse(pkg);
		}
		catch(e) { return; }
		
		this.execute_package(pkg, is_reverse);
	}; 
    
    Acts.prototype.CleanFnQueue = function ()
	{
		this.fn_queue.length = 0;
	}; 
    
    Acts.prototype.PushToFnQueue = function (name, params)
	{   
        var pkg = [name];
        var i, cnt=params.length;
        pkg.length = cnt+1;
        for(i=0; i<cnt; i++)
        {
            pkg[i+1] = params[i];
        }
        
	    this.fn_queue.push(pkg);
	};
	
    Acts.prototype.LoadFnQueue = function (pkg)
	{
	    this.fn_queue.length = 0;
        if (pkg == "")
            return;
            
		try {
			pkg = JSON.parse(pkg);
		}
		catch(e) { return; }
				
		var is_one_function = (typeof(pkg[0]) == "string");
		if (is_one_function)
		{
		    this.fn_queue.push(pkg);
		}
		else
		{
		    this.fn_queue.push.apply(this.fn_queue, pkg);
		}
		
	};
    
    Acts.prototype.OverwriteParam = function (index_, value_)
	{
	    var pkg = this.exp_pkg || this.fn_queue[0];
	    if (pkg == null)
	    {
	        return;
	    }
	    
	    var param_cnt = pkg.length -1;
	    var param_index = index_+1;
        
	    if (index_ >= param_cnt)
	    {
	        // extend param array
	        pkg.length = param_index+1;
	        var i;
	        for (i=param_cnt+1; i<param_index; i++)
	        {
	            pkg[i] = 0;
	        }
	    }

	    pkg[param_index] = value_;
	};

    Acts.prototype.CallFunctionInQueue = function (is_reverse)
	{   
	    this.execute_package(this.fn_queue, is_reverse);
	};
    
    Acts.prototype.PushToFnQueue2 = function (where, name, params)
	{   
        var pkg = [name];
        var i, cnt=params.length;
        pkg.length = cnt+1;
        for(i=0; i<cnt; i++)
        {
            pkg[i+1] = params[i];
        }
        
        if (where == 0)
	        this.fn_queue.push(pkg);
	    else
	        this.fn_queue.unshift(pkg);
	};	
    
    Acts.prototype.ReverseFnQueue = function ()
	{
        this.fn_queue.reverse();
	};
        
    Acts.prototype.SetupCallback = function (callback_type)
	{	
        this.c2FnType = (callback_type===0)? "c2_callFunction" : "c2_callRexFunction2";
	};	       
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    var pkg=[];
    Exps.prototype.FnCallPkg = function (ret)
	{	   
		var i, cnt=arguments.length;
		for (i=1; i < cnt; i++)
		    pkg.push(arguments[i]);
		
		var s = JSON.stringify(pkg);
		pkg.length = 0;	
	    ret.set_string( s );
	};
	
    Exps.prototype.Call = function (ret, pkg, is_reverse)
	{
        var retVal = null;
        if (pkg == "")        
            retVal = 0;
        else
        {
		    try 
            {
		    	pkg = JSON.parse(pkg);
		    }
		    catch(e) 
		    {
		         retVal = 0;
	        }
            
            if (retVal === null)
		        retVal = this.execute_package(pkg, is_reverse);            
        }
        
	    ret.set_any( retVal );
	};

    Exps.prototype.FnQueuePkg = function (ret)
	{
	    ret.set_string( JSON.stringify(this.fn_queue) );
	};

    Exps.prototype.CurName = function (ret)
	{
	    var n = (this.exp_pkg == null)? "" : this.exp_pkg[0];
	    ret.set_string( n );
	};	

    Exps.prototype.CurParam = function (ret, index_)
	{
	    var p;
	    if (this.exp_pkg == null)
	        p = 0;
	    else
	    {
	        p = this.exp_pkg[index_ + 1];
	        if (p == null)
	            p = 0;
	    }
	    ret.set_any( p );
	};	
}());