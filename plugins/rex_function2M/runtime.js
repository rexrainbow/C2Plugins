// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Function2M = function(runtime)
{
    this.runtime = runtime;
};

(function ()
{
    var pluginProto = cr.plugins_.Rex_Function2M.prototype;
        
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
     var isInPreview = false;	// set in onCreate
    
    var ObjCacheKlass = function ()
    {        
        this.lines = [];       
    };
    var ObjCacheKlassProto = ObjCacheKlass.prototype;   
    
	ObjCacheKlassProto.allocLine = function()
	{
		return (this.lines.length > 0)? this.lines.pop(): null;
	};
	ObjCacheKlassProto.freeLine = function (l)
	{
		this.lines.push(l);
	};	   
	ObjCacheKlassProto.freeAllLines= function (arr)
	{
		var i, len;
		for (i = 0, len = arr.length; i < len; i++)
			this.freeLine(arr[i]);
		arr.length = 0;
	};    
    
    function FuncStackEntry()
    {
        this.name = "";
        this.retVal = 0;
        this.params = [];
        this.parameter_tables = {};
        this.name2index = {};
        this.name2value = {};      
    };
    
    var funcEntryCahce = new ObjCacheKlass();   
    
    var FuncStackKlass = function()
    {
        this.stack = [];
        this.ptr = -1;
    };
    var FuncStackKlassProto = FuncStackKlass.prototype;
    
    FuncStackKlassProto.reset = function()
    {
        funcEntryCahce.freeAllLines(this.stack);
        this.ptr = -1;
    };    
    FuncStackKlassProto.push = function ()
    {
        this.ptr++;
        
        if (this.ptr === this.stack.length)
        {
            var entry = funcEntryCahce.allocLine() || (new FuncStackEntry());
            this.stack.push(entry);
        }
            
        return this.stack[this.ptr];     
    }

    FuncStackKlassProto.getCurrentEntry = function ()
    {
        if (this.ptr < 0)
            return null;
            
        return this.stack[this.ptr];        
    };
    
    FuncStackKlassProto.getOneAboveEntry = function ()
    {
        if (!this.stack.length)
            return null;
        
        var i = this.ptr + 1;
        
        if (i >= this.stack.length)
            i = this.stack.length - 1;
            
        return this.stack[i];
    };
    
    FuncStackKlassProto.pop = function()
    {
        assert2(this.ptr >= 0, "Popping empty function stack");
        
        this.ptr--;        
    };

    instanceProto.onCreate = function()
    {
        isInPreview = (typeof cr_is_preview !== "undefined");
        
        this.is_debug_mode = (typeof(log) !== "undefined") && (this.properties[0] == 1);
        
        if (!this.recycled)    
            this.funcStack = new FuncStackKlass();
        
        var fs = this.funcStack.push();
        fs.name = "__main__";
                
        this.parameter_table_cache = new ObjCacheKlass();        
        this.param_index = 0;
        
		//var self = this;
		//
		//window["c2_callRexFunction2"] = function (name_, params_)
		//{
		//	var i, len, v;
		//	var fs = this.funcStack.push();
		//	fs.name = name_.toLowerCase();
		//	fs.retVal = 0;
		//	
		//	if (params_)
		//	{
		//		// copy only number and string types; all others just set to 0
		//		fs.params.length = params_.length;
		//		
		//		for (i = 0, len = params_.length; i < len; ++i)
		//		{
		//			v = params_[i];
		//			
		//			if (typeof v === "number" || typeof v === "string")
		//				fs.params[i] = v;
		//			else if (typeof v === "boolean")
		//				fs.params[i] = (v ? 1 : 0);
		//			else
		//				fs.params[i] = 0;
		//		}
		//	}
		//	else
		//	{
		//		cr.clearArray(fs.params);
		//	}
        //    
        //    if (self.is_debug_mode)
        //    {
        //        var i, lead = "+";
        //        for(i=1; i<funcStackPtr; i++)
        //            lead += "-";                 
        //        log(lead+ fs.name + " : " + fs.params.toString());
        //    }              
		//	
        //    self.function_call_prelude();                
		//	// Note: executing fast trigger path based on fs.name
		//	var ran = self.runtime.trigger(cr.plugins_.Rex_Function2M.prototype.cnds.OnFunction, self, fs.name);
        //    self.function_call_finale();
        //    
        //    // In preview mode, log to the console if nothing was triggered
        //    if (isInPreview && !ran)
        //    {
        //        log("[Construct 2] Rex_Function2M object: expression Rex_Function2M.Call('" + name_ + "' ...) was used, but no event was triggered. Is the function call spelt incorrectly or no longer used?", "warn");
        //    }            
        //
		//	this.funcStack.pop();
		//	
		//	return fs.retVal;
		//};        
        
        
        this.name2uid = {};
    };
    
	instanceProto.onDestroy = function ()
	{
        this.funcStack.reset();        
	};    
    
    instanceProto.function_call_prelude = function()
    {
        this.param_index = 0;
    };
    
    instanceProto.function_call_finale = function()
    {
        var fs = this.funcStack.getCurrentEntry();
        hashtable_clean(fs.name2value);
        hashtable_clean(fs.name2index);        
    };
    
    instanceProto.define_param = function (name, default_value, type_check)
    {
        var fs = this.funcStack.getCurrentEntry();
        
        if (!fs)
            return false;
        
        fs.name2index[name] = this.param_index;
        if (this.param_index >= fs.params.length)
        {
            fs.params.length = this.param_index + 1;
            var value = fs.name2value[name];
            if (value == null)
                value = default_value;
            
            if ((type_check === 1) && (typeof(value) !== "number"))
                log("[Construct 2] Rex_Function2M object: parameter "+ name + "= " + value + " is not a number", "warn");
            else if ((type_check === 2) && (typeof(value) !== "string")) 
                log("[Construct 2] Rex_Function2M object: parameter "+ name + "= " + value + " is not a string", "warn");
            
            fs.params[this.param_index] = value;
        }
        this.param_index += 1;
        return true;
    };     
    
    instanceProto.param_get = function (param_index_)
    {
        var fs = this.funcStack.getCurrentEntry();
        if (!fs)
        {
            log("[Construct 2] Rex_Function2M object: used 'Param' expression when not in a function call", "warn");
            return null;
        }
        
        var index_;
        if (typeof(param_index_) == "string")
        {
            index_ = fs.name2index[param_index_];
            if (index_ == null)
            {
                log("[Construct 2] Rex_Function2M object: in function '" + fs.name + "', could not find parameter " + param_index_ , "warn");
                return null;
            }
        }
        else
            index_ = cr.floor(param_index_);
            
        if (index_ >= 0 && index_ < fs.params.length)
        {
            var value = fs.params[index_];
            if (value == null)
            {
                // warn 
                value = 0;
            }
            return value;
        }
        else
        {
            log("[Construct 2] Rex_Function2M object: in function '" + fs.name + "', accessed parameter out of bounds (accessed index " + index_ + ", " + fs.params.length + " params available)", "warn");
            return null;      
        }
        
    };    
    
    var hashtable_clean = function(table)
    {
        var n;
        for(n in table)
            delete table[n];
    };    
    
	var setValue = function(o, keys, value)
	{        
        if (keys.indexOf(".") === -1)
        {
            o[keys] = value;
        }
        else
        {            
            keys = keys.split(".");
            var lastKey = keys.pop(); 
            var entry = o;
            var i,  cnt=keys.length, key;
            for (i=0; i< cnt; i++)
            {
                key = keys[i];
                if ( (entry[key] == null) || (typeof(entry[key]) !== "object") )                
                    entry[key] = {};
                
                entry = entry[key];            
            }
            entry[lastKey] = value;
        }
	};     
    
    var getValue = function (o, keyPath)
    {  
        // invalid key    
        if ((keyPath == null) || (keyPath === ""))
            return o;
        
        // key but no object
        else if (typeof(o) !== "object")
            return null;
        
        else if (keyPath.indexOf(".") === -1)
            return o[keyPath];
        else
        {
            var val = o;              
            var keys = keyPath.split(".");
            var i, cnt=keys.length;
            for(i=0; i<cnt; i++)
            {
                val = val[keys[i]];
                if (val == null)
                    return null;
            }
            return val;
        }
    };
    
    var din = function (d, default_value)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (d == null)
        {
            if (default_value != null)
                o = default_value;
            else
                o = 0;
        }
        else if (typeof(d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
	    return o;
    };    
    //////////////////////////////////////
    // Conditions
    function Cnds() {};

    // THIS IS A SPECIAL TRIGGER
    Cnds.prototype.OnFunction = function (name_)
    {                
        var fs = this.funcStack.getCurrentEntry();
        
        if (!fs)
            return false;
        
        return cr.equals_nocase(name_, fs.name);
    };
    
    Cnds.prototype.CompareParam = function (param_index_, cmp_, value_)
    {
        var param_value = this.param_get(param_index_);
        if (param_value == null)
            return false;
        return cr.do_cmp(param_value, cmp_, value_);
    };
    
    Cnds.prototype.TypeOfParam = function (param_index_, type_cmp)
    {        
        var param_value = this.param_get(param_index_);
        if (param_value == null)
            return false;
            
        var t = (type_cmp == 0)? "number":"string";        
        return (typeof(param_value) == t);
    };    
    
    pluginProto.cnds = new Cnds();

    //////////////////////////////////////
    // Actions
    function Acts() {};

    Acts.prototype.CallFunction = function (name_, params_)
    {
        var fs = this.funcStack.push();
        fs.name = name_.toLowerCase();
        fs.retVal = 0;
        cr.shallowAssignArray(fs.params, params_);
        
        if (this.is_debug_mode)
        {
            var i, lead = "+";
            for(i=1; i<funcStackPtr; i++)
                lead += "-";             
            log(lead + fs.name + " : " + fs.params.toString());
        }      
        this.function_call_prelude();
        // Note: executing fast trigger path based on fs.name
        var ran = this.runtime.trigger(cr.plugins_.Rex_Function2M.prototype.cnds.OnFunction, this, fs.name);
        this.function_call_finale();
        
        // In preview mode, log to the console if nothing was triggered
        if (isInPreview && !ran)
        {
            log("[Construct 2] Rex_Function2M object: called function '" + name_ + "', but no event was triggered. Is the function call spelt incorrectly or no longer used?", "warn");
        }
        
        this.funcStack.pop();
    };
	
	Acts.prototype.CallExpression = function (unused)
	{
		// no-op: the function will have been called during parameter evaluation.
	};    
    
    Acts.prototype.SetReturnValue = function (value_)
    {
        var fs = this.funcStack.getCurrentEntry();
        
        if (fs)
            fs.retVal = value_;
        else
            log("[Construct 2] Rex_Function2M object: used 'Set return value' when not in a function call", "warn");
    };
    
    Acts.prototype.SetParameter = function (name_, value_, table)
    {
        var fs = this.funcStack.getCurrentEntry();
        
        var pt = fs.parameter_tables;
        if (!pt.hasOwnProperty(table))
            pt[table] = this.parameter_table_cache.allocLine() || {};
        
        pt[table][name_] = value_;
    };
    
    Acts.prototype.DefineParam = function (name, default_value, type_check)
    {
        this.define_param(name, default_value, type_check);
    }; 
    
    Acts.prototype.Dump = function ()
    {
        if (!this.is_debug_mode)
            return;

        var fs = this.funcStack.getCurrentEntry();          
        log("Dump - " + fs.name + ":" +fs.params.toString());
    };    
    
    Acts.prototype.CallFunctionwPT = function (name_, tale_)
    {
        var pt = this.funcStack.getCurrentEntry().parameter_tables[tale_];
        
        var fs = this.funcStack.push();
        fs.name = name_.toLowerCase();
        fs.retVal = 0;
        fs.params.length = 0;

        if (pt != null)
        {
            var n;
            for (n in pt)            
                fs.name2value[n] = pt[n];   
            
            hashtable_clean(pt);
        }

        if (this.is_debug_mode)
        {
            var str_name2value = "";
            for(n in fs.name2value)
                str_name2value += (n + "=" + fs.name2value[n]+ ", ");
            var i, lead = "+";
            for(i=1; i<funcStackPtr; i++)
                lead += "-";  
            log(lead+ fs.name + " : " + str_name2value);
        }                   
        this.function_call_prelude();
        // Note: executing fast trigger path based on fs.name
        var ran = this.runtime.trigger(cr.plugins_.Rex_Function2M.prototype.cnds.OnFunction, this, fs.name);
        this.function_call_finale();
        
        // In preview mode, log to the console if nothing was triggered
        if (isInPreview && !ran)
        {
            log("[Construct 2] Rex_Function2M object: called function '" + name_ + "', but no event was triggered. Is the function call spelt incorrectly or no longer used?", "warn");
        }
        
        this.funcStack.pop();
    };
    Acts.prototype.SetReturnDict = function (key_, value_)
    {
        var fs = this.funcStack.getCurrentEntry();
        
        if (fs)
        {
            if (typeof(fs.retVal) !== "object")
                fs.retVal = {};
            
            setValue(fs.retVal, key_, value_);
        }
        else
            log("[Construct 2] Rex_Function2M object: used 'Set return value' when not in a function call", "warn");
    };  

    //Acts.prototype.AddPackage = function (objtype, name)
    //{
    //    if (!objtype)
    //        return;
    //    
    //    var inst = objtype.getFirstPicked();
    //    if (!inst)
    //        return;
    //    
    //    this.name2uid[name] = inst.uid;
    //};      
    pluginProto.acts = new Acts();

    //////////////////////////////////////
    // Expressions
    function Exps() {};

    Exps.prototype.ReturnValue = function (ret, key_, default_value)
    {
        // The previous function has already popped - so check one level up the function stack
        var fs = this.funcStack.getOneAboveEntry();
        
        if (fs)
        {
            var val = fs.retVal;
            val = getValue(val, key_);
            ret.set_any(din(val, default_value));
        }
        else
            ret.set_int(0);
    };
    
    Exps.prototype.ParamCount = function (ret)
    {
        var fs = this.funcStack.getCurrentEntry();
        
        if (fs)
            ret.set_int(fs.params.length);
        else
        {
            log("[Construct 2] Rex_Function2M object: used 'ParamCount' expression when not in a function call", "warn");
            ret.set_int(0);
        }
    };
    
    Exps.prototype.Param = function (ret, param_index_)
    {
        ret.set_any(this.param_get(param_index_));
    };
    
    Exps.prototype.Call = function (ret, name_)
    {
        var fs = this.funcStack.push();
        fs.name = name_.toLowerCase();
        fs.retVal = 0;
        
        // Copy rest of parameters from arguments
        fs.params.length = 0;
        var i, len;
        for (i = 2, len = arguments.length; i < len; i++)
            fs.params.push(arguments[i]);
        
        if (this.is_debug_mode)
        {
            var i, lead = "+";
            for(i=1; i<funcStackPtr; i++)
                lead += "-";                 
            log(lead+ fs.name + " : " + fs.params.toString());
        }        
        this.function_call_prelude();       
        // Note: executing fast trigger path based on fs.name
        var ran = this.runtime.trigger(cr.plugins_.Rex_Function2M.prototype.cnds.OnFunction, this, fs.name);
        this.function_call_finale();
        
        // In preview mode, log to the console if nothing was triggered
        if (isInPreview && !ran)
        {
            log("[Construct 2] Rex_Function2M object: expression Rex_Function2M.Call('" + name_ + "' ...) was used, but no event was triggered. Is the function call spelt incorrectly or no longer used?", "warn");
        }
        
        this.funcStack.pop();

        ret.set_any(fs.retVal);
    };
    
    Exps.prototype.CallwPT = function (ret, name_)
    {
        var fs = this.funcStack.push();
        fs.name = name_.toLowerCase();
        fs.retVal = 0;
        
        // Copy rest of parameters from arguments
        fs.params.length = 0;
        var i, len=arguments.length;
        for (i = 2; i < len; i=i+2)
            fs.name2value[arguments[i]] = arguments[i+1];        
        
        if (this.is_debug_mode)
        {
            var str_name2value = "";
            for(n in fs.name2value)
                str_name2value += (n + "=" + fs.name2value[n]+ ", ");
            var i, lead = "+";
            for(i=1; i<funcStackPtr; i++)
                lead += "-";  
            log(lead+ fs.name + " : " + str_name2value);
        }
        this.function_call_prelude(); 
        // Note: executing fast trigger path based on fs.name
        var ran = this.runtime.trigger(cr.plugins_.Rex_Function2M.prototype.cnds.OnFunction, this, fs.name);
        this.function_call_finale();
        
        // In preview mode, log to the console if nothing was triggered
        if (isInPreview && !ran)
        {
            log("[Construct 2] Rex_Function2M object: expression Rex_Function2M.Call('" + name_ + "' ...) was used, but no event was triggered. Is the function call spelt incorrectly or no longer used?", "warn");
        }
        
        this.funcStack.pop();

        ret.set_any(fs.retVal);
    };    
    
    pluginProto.exps = new Exps();

}());