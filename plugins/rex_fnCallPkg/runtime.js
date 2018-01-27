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
        this.fnQueue = []; 
        
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
             
    instanceProto.callC2Fn = function (pkg)
    {
		var params = [];
        var c2FnGlobalName = this.getC2FnType();
        if (c2FnGlobalName === "")
            return 0;
        
        var c2FnName = pkg[0];
        var i, cnt=pkg.length;
        for(i=1; i<cnt; i++)
        {
            params.push( pkg[i] );
        }
        var retValue = window[c2FnGlobalName](c2FnName, params);
        
        return retValue;
    };
    
	instanceProto.executePackage = function(pkg, isReverse)
	{	  
        if (this.getC2FnType() === "")
	        return;
	        
        var retVal;
        var isOneFunction = (typeof(pkg[0]) == "string");
        if (isOneFunction)
        {
            retVal = this.callC2Fn(pkg);
        }
        else
        {
            var i,cnt=pkg.length;            
            if (isReverse !== 1)
            {
                for(i=0; i<cnt; i++)
                {
                    retVal = this.callC2Fn(pkg[i]);
                }
            }
            else
            {
                for(i=cnt-1; i>=0; i--)
                {
                    retVal = this.callC2Fn(pkg[i]);
                }                
            }
        }
        
        return retVal;
	};  

    instanceProto.saveToJSON = function ()
    { 
        return { "fq" : this.fnQueue,
                };
    };
    
    instanceProto.loadFromJSON = function (o)
    {
		this.c2FnType = null;
        this.fnQueue = o["fq"]
    };         
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();  
	  
	Cnds.prototype.ForEachPkg = function ()
	{
	    var i,cnt=this.fnQueue.length;
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
			    
        for (i=0; i<cnt; i++)
        {
            if (solModifierAfterCnds)
                this.runtime.pushCopySol(current_event.solModifiers);
            
            this.exp_pkg = this.fnQueue[i];            
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

    Acts.prototype.CallFunction = function (pkg, isReverse)
	{
        if (pkg == "")
            return;
            
		try {
			pkg = JSON.parse(pkg);
		}
		catch(e) { return; }
		
		this.executePackage(pkg, isReverse);
	}; 
    
    Acts.prototype.CleanFnQueue = function ()
	{
		this.fnQueue.length = 0;
	}; 
    
    Acts.prototype.PushToFnQueue = function (name, params)
	{   
		Acts.prototype.PushToFnQueue2.call(this, 0, name, params);
	};
	
    Acts.prototype.LoadFnQueue = function (pkg)
	{
		Acts.prototype.CleanFnQueue.call(this);
        Acts.prototype.AppendFnQueue.call(this, pkg);
	};
    
    Acts.prototype.OverwriteParam = function (index_, value_)
	{
	    var pkg = this.exp_pkg || this.fnQueue[0];
	    if (pkg == null)
	    {
	        return;
	    }
	    
	    var paramCnt = pkg.length -1;
	    var paramIndex = index_+1;
        
	    if (index_ >= paramCnt)
	    {
	        // extend param array
	        pkg.length = paramIndex+1;
	        var i;
	        for (i=paramCnt+1; i<paramIndex; i++)
	        {
	            pkg[i] = 0;
	        }
	    }

	    pkg[paramIndex] = value_;
	};

    Acts.prototype.CallFunctionInQueue = function (isReverse)
	{   
	    this.executePackage(this.fnQueue, isReverse);
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
	        this.fnQueue.push(pkg);
	    else
	        this.fnQueue.unshift(pkg);
	};	
    
    Acts.prototype.ReverseFnQueue = function ()
	{
        this.fnQueue.reverse();
	};
           
    Acts.prototype.InsertParam = function (index_, param_)
	{
	    var pkg = this.exp_pkg || this.fnQueue[0];
	    if (pkg == null)
	    {
	        return;
	    }
	    
        pkg.splice(index_+1, 0, param_);
	};  

    Acts.prototype.AddToParam = function (index_, value_)
	{
	    var pkg = this.exp_pkg || this.fnQueue[0];
	    if (pkg == null)
	    {
	        return;
	    }
	    
	    var paramCnt = pkg.length -1;
	    var paramIndex = index_+1;
        
	    if (index_ >= paramCnt)
	    {
	        // extend param array
	        pkg.length = paramIndex+1;
	        var i;
	        for (i=paramCnt+1; i<paramIndex; i++)
	        {
	            pkg[i] = 0;
	        }
	    }

	    pkg[paramIndex] += value_;
	};

    Acts.prototype.AppendFnQueue = function (pkg)
	{
        if (pkg == "")
            return;
            
		try {
			pkg = JSON.parse(pkg);
		}
		catch(e) { return; }
				
		var isOneFunction = (typeof(pkg[0]) == "string");
		if (isOneFunction)
		{
		    this.fnQueue.push(pkg);
		}
		else
		{
		    this.fnQueue.push.apply(this.fnQueue, pkg);
		}
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
	
    Exps.prototype.Call = function (ret, pkg, isReverse)
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
		        retVal = this.executePackage(pkg, isReverse);            
        }
        
	    ret.set_any( retVal );
	};

    Exps.prototype.FnQueuePkg = function (ret)
	{
	    ret.set_string( JSON.stringify(this.fnQueue) );
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