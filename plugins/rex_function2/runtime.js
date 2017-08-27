// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Function2 = function(runtime)
{
    this.runtime = runtime;
};

(function ()
{
    var pluginProto = cr.plugins_.Rex_Function2.prototype;
        
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
    
    var funcStack = [];
    var funcStackPtr = -1;
    var isInPreview = false;	// set in onCreate
    
    function FuncStackEntry()
    {
        this.name = "";
        this.retVal = 0;
        this.params = [];
        this.parameterTable = {};
        this.name2index = {};
        this.name2value = {};  
    };
    
    function pushFuncStack()
    {
        funcStackPtr++;
        
        if (funcStackPtr === funcStack.length)
            funcStack.push(new FuncStackEntry());
            
        return funcStack[funcStackPtr];
    };
    
    function getCurrentFuncStack()
    {
        if (funcStackPtr < 0)
            return null;
            
        return funcStack[funcStackPtr];
    };
    
    function getOneAboveFuncStack()
    {
        if (!funcStack.length)
            return null;
        
        var i = funcStackPtr + 1;
        
        if (i >= funcStack.length)
            i = funcStack.length - 1;
            
        return funcStack[i];
    };
    
    function popFuncStack()
    {
        assert2(funcStackPtr >= 0, "Popping empty function stack");
        
        funcStackPtr--;
    };

    instanceProto.onCreate = function()
    {
        isInPreview = (typeof cr_is_preview !== "undefined");
        
        this.isDebugMode = (typeof(log) !== "undefined") && (this.properties[0] == 1);
        
        var fs = pushFuncStack();
        fs.name = "__main__";
                
        this.parameter_table_cache = new ObjCacheKlass();        
        this.paramIndex = 0;
        
		var self = this;
		
		window["c2_callRexFunction2"] = function (name_, params_)
		{
			var i, len, v;
			var fs = pushFuncStack();
			fs.name = name_.toLowerCase();
			fs.retVal = 0;
			
			if (params_)
			{
				// copy only number and string types; all others just set to 0
				fs.params.length = params_.length;
				
				for (i = 0, len = params_.length; i < len; ++i)
				{
					v = params_[i];
					
					if (typeof v === "number" || typeof v === "string")
						fs.params[i] = v;
					else if (typeof v === "boolean")
						fs.params[i] = (v ? 1 : 0);
					else
						fs.params[i] = 0;
				}
			}
			else
			{
				cr.clearArray(fs.params);
			}
            
            if (self.isDebugMode)
            {
                var i, lead = "+";
                for(i=1; i<funcStackPtr; i++)
                    lead += "-";                 
                log(lead+ fs.name + " : " + fs.params.toString());
            }              
			
            self.functionCallPrelude();                
			// Note: executing fast trigger path based on fs.name
			var ran = self.runtime.trigger(cr.plugins_.Rex_Function2.prototype.cnds.OnFunction, self, fs.name);
            self.functionCallFinale();
            
            // In preview mode, log to the console if nothing was triggered
            if (isInPreview && !ran)
            {
                log("[Construct 2] Rex_Function2 object: expression Rex_Function2.Call('" + name_ + "' ...) was used, but no event was triggered. Is the function call spelt incorrectly or no longer used?", "warn");
            }            
        
			popFuncStack();
			
			return fs.retVal;
		};        
    };
    
    instanceProto.functionCallPrelude = function()
    {
        this.paramIndex = 0;
    };
    
    instanceProto.functionCallFinale = function()
    {
        var fs = getCurrentFuncStack();
        cleanTable(fs.name2value);
        cleanTable(fs.name2index);        
    };
    
    instanceProto.defineParam = function (name, defaultValue, typeCheck)
    {
        var fs = getCurrentFuncStack();
        
        if (!fs)
            return false;
        
        fs.name2index[name] = this.paramIndex;
        if (this.paramIndex >= fs.params.length)
        {
            fs.params.length = this.paramIndex + 1;
            var value = fs.name2value[name];
            if (value == null)
                value = defaultValue;
            
            if ((typeCheck === 1) && (typeof(value) !== "number"))
                log("[Construct 2] Rex_Function2 object: parameter "+ name + "= " + value + " is not a number", "warn");
            else if ((typeCheck === 2) && (typeof(value) !== "string")) 
                log("[Construct 2] Rex_Function2 object: parameter "+ name + "= " + value + " is not a string", "warn");
            
            fs.params[this.paramIndex] = value;
        }
        this.paramIndex += 1;
        return true;
    };     
    
    instanceProto.getParam = function (paramIndex_)
    {
        var fs = getCurrentFuncStack();
        if (!fs)
        {
            log("[Construct 2] Rex_Function2 object: used 'Param' expression when not in a function call", "warn");
            return null;
        }
        
        var index_;
        if (typeof(paramIndex_) == "string")
        {
            index_ = fs.name2index[paramIndex_];
            if (index_ == null)
            {
                log("[Construct 2] Rex_Function2 object: in function '" + fs.name + "', could not find parameter " + paramIndex_ , "warn");
                return null;
            }
        }
        else
            index_ = cr.floor(paramIndex_);
            
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
            log("[Construct 2] Rex_Function2 object: in function '" + fs.name + "', accessed parameter out of bounds (accessed index " + index_ + ", " + fs.params.length + " params available)", "warn");
            return null;      
        }
        
    };    
    
    var cleanTable = function(table)
    {
        var n;
        for(n in table)
            delete table[n];
    }
    
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
    
    var din = function (d, defaultValue)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (d == null)
        {
            if (defaultValue != null)
                o = defaultValue;
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
        var fs = getCurrentFuncStack();
        
        if (!fs)
            return false;
        
        return cr.equals_nocase(name_, fs.name);
    };
    
    Cnds.prototype.CompareParam = function (paramIndex_, cmp_, value_)
    {
        var paramValue = this.getParam(paramIndex_);
        if (paramValue == null)
            return false;
        return cr.do_cmp(paramValue, cmp_, value_);
    };
    
    Cnds.prototype.TypeOfParam = function (paramIndex_, typeCmp)
    {        
        var paramValue = this.getParam(paramIndex_);
        if (paramValue == null)
            return false;
            
        var t = (typeCmp == 0)? "number":"string";        
        return (typeof(paramValue) == t);
    };    
    
    pluginProto.cnds = new Cnds();

    //////////////////////////////////////
    // Actions
    function Acts() {};

    Acts.prototype.CallFunction = function (name_, params_)
    {
        var fs = pushFuncStack();
        fs.name = name_.toLowerCase();
        fs.retVal = 0;
        cr.shallowAssignArray(fs.params, params_);
        
        if (this.isDebugMode)
        {
            var i, lead = "+";
            for(i=1; i<funcStackPtr; i++)
                lead += "-";             
            log(lead + fs.name + " : " + fs.params.toString());
        }      
        this.functionCallPrelude();
        // Note: executing fast trigger path based on fs.name
        var ran = this.runtime.trigger(cr.plugins_.Rex_Function2.prototype.cnds.OnFunction, this, fs.name);
        this.functionCallFinale();
        
        // In preview mode, log to the console if nothing was triggered
        if (isInPreview && !ran)
        {
            log("[Construct 2] Rex_Function2 object: called function '" + name_ + "', but no event was triggered. Is the function call spelt incorrectly or no longer used?", "warn");
        }
        
        popFuncStack();
    };
	
	Acts.prototype.CallExpression = function (unused)
	{
		// no-op: the function will have been called during parameter evaluation.
	};    
    
    Acts.prototype.SetReturnValue = function (value_)
    {
        var fs = getCurrentFuncStack();
        
        if (fs)
            fs.retVal = value_;
        else
            log("[Construct 2] Rex_Function2 object: used 'Set return value' when not in a function call", "warn");
    };
    
    Acts.prototype.SetParameter = function (name_, value_, table)
    {
        var fs = getCurrentFuncStack();
        
        var pt = fs.parameterTable;
        if (!pt.hasOwnProperty(table))
            pt[table] = this.parameter_table_cache.allocLine() || {};
        
        pt[table][name_] = value_;
    };
    
    Acts.prototype.DefineParam = function (name, defaultValue, typeCheck)
    {
        this.defineParam(name, defaultValue, typeCheck);
    }; 
    
    Acts.prototype.Dump = function ()
    {
        if (!this.isDebugMode)
            return;

        var fs = getCurrentFuncStack();          
        log("Dump - " + fs.name + ":" +fs.params.toString());
    };    
    
    Acts.prototype.CallFunctionwPT = function (name_, tale_)
    {
        var pt = getCurrentFuncStack().parameterTable[tale_];
        
        var fs = pushFuncStack();
        fs.name = name_.toLowerCase();
        fs.retVal = 0;
        fs.params.length = 0;

        if (pt != null)
        {
            var n;
            for (n in pt)            
                fs.name2value[n] = pt[n];   
            
            cleanTable(pt);
        }

        if (this.isDebugMode)
        {
            var str_name2value = "";
            for(n in fs.name2value)
                str_name2value += (n + "=" + fs.name2value[n]+ ", ");
            var i, lead = "+";
            for(i=1; i<funcStackPtr; i++)
                lead += "-";  
            log(lead+ fs.name + " : " + str_name2value);
        }                   
        this.functionCallPrelude();
        // Note: executing fast trigger path based on fs.name
        var ran = this.runtime.trigger(cr.plugins_.Rex_Function2.prototype.cnds.OnFunction, this, fs.name);
        this.functionCallFinale();
        
        // In preview mode, log to the console if nothing was triggered
        if (isInPreview && !ran)
        {
            log("[Construct 2] Rex_Function2 object: called function '" + name_ + "', but no event was triggered. Is the function call spelt incorrectly or no longer used?", "warn");
        }
        
        popFuncStack();
    };
    Acts.prototype.SetReturnDict = function (key_, value_)
    {
        var fs = getCurrentFuncStack();
        
        if (fs)
        {
            if (typeof(fs.retVal) !== "object")
                fs.retVal = {};
            
            setValue(fs.retVal, key_, value_);
        }
        else
            log("[Construct 2] Rex_Function2 object: used 'Set return value' when not in a function call", "warn");
    };    
    pluginProto.acts = new Acts();

    //////////////////////////////////////
    // Expressions
    function Exps() {};

    Exps.prototype.ReturnValue = function (ret, key_, defaultValue)
    {
        // The previous function has already popped - so check one level up the function stack
        var fs = getOneAboveFuncStack();
        
        if (fs)
        {
            var val = fs.retVal;
            val = getValue(val, key_);
            ret.set_any(din(val, defaultValue));
        }
        else
            ret.set_int(0);
    };
    
    Exps.prototype.ParamCount = function (ret)
    {
        var fs = getCurrentFuncStack();
        
        if (fs)
            ret.set_int(fs.params.length);
        else
        {
            log("[Construct 2] Rex_Function2 object: used 'ParamCount' expression when not in a function call", "warn");
            ret.set_int(0);
        }
    };
    
    Exps.prototype.Param = function (ret, paramIndex_)
    {
        ret.set_any(this.getParam(paramIndex_));
    };
    
    Exps.prototype.Call = function (ret, name_)
    {
        var fs = pushFuncStack();
        fs.name = name_.toLowerCase();
        fs.retVal = 0;
        
        // Copy rest of parameters from arguments
        fs.params.length = 0;
        var i, len;
        for (i = 2, len = arguments.length; i < len; i++)
            fs.params.push(arguments[i]);
        
        if (this.isDebugMode)
        {
            var i, lead = "+";
            for(i=1; i<funcStackPtr; i++)
                lead += "-";                 
            log(lead+ fs.name + " : " + fs.params.toString());
        }        
        this.functionCallPrelude();       
        // Note: executing fast trigger path based on fs.name
        var ran = this.runtime.trigger(cr.plugins_.Rex_Function2.prototype.cnds.OnFunction, this, fs.name);
        this.functionCallFinale();
        
        // In preview mode, log to the console if nothing was triggered
        if (isInPreview && !ran)
        {
            log("[Construct 2] Rex_Function2 object: expression Rex_Function2.Call('" + name_ + "' ...) was used, but no event was triggered. Is the function call spelt incorrectly or no longer used?", "warn");
        }
        
        popFuncStack();

        ret.set_any(fs.retVal);
    };
    
    Exps.prototype.CallwPT = function (ret, name_)
    {
        var fs = pushFuncStack();
        fs.name = name_.toLowerCase();
        fs.retVal = 0;
        
        // Copy rest of parameters from arguments
        fs.params.length = 0;
        var i, len=arguments.length;
        for (i = 2; i < len; i=i+2)
            fs.name2value[arguments[i]] = arguments[i+1];        
        
        if (this.isDebugMode)
        {
            var str_name2value = "";
            for(n in fs.name2value)
                str_name2value += (n + "=" + fs.name2value[n]+ ", ");
            var i, lead = "+";
            for(i=1; i<funcStackPtr; i++)
                lead += "-";  
            log(lead+ fs.name + " : " + str_name2value);
        }
        this.functionCallPrelude(); 
        // Note: executing fast trigger path based on fs.name
        var ran = this.runtime.trigger(cr.plugins_.Rex_Function2.prototype.cnds.OnFunction, this, fs.name);
        this.functionCallFinale();
        
        // In preview mode, log to the console if nothing was triggered
        if (isInPreview && !ran)
        {
            log("[Construct 2] Rex_Function2 object: expression Rex_Function2.Call('" + name_ + "' ...) was used, but no event was triggered. Is the function call spelt incorrectly or no longer used?", "warn");
        }
        
        popFuncStack();

        ret.set_any(fs.retVal);
    };    
    
    pluginProto.exps = new Exps();

}());