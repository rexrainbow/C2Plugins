// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_MPsyncfunction = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_MPsyncfunction.prototype;
		
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
    var FNTYPE_REXFN2 = 2;      // rex_function2
	var FNTYPE_OFFICIALFN = 3;  // official function	
	instanceProto.onCreate = function()
	{
        this.tag = this.properties[0];
        this.response_mode = this.properties[1]; // 0=Response immediately , 1=wait for host sendback 
        this.accept_cmd_cnt = (this.properties[2] == 0)? (-1):0;  // (-1) is Blocking = No
        this.mpwrap = null;
        
        this.sender_alias = "";
        this.cmdparams = new_cmdparams();
        this.param_index = 0;
        this.name2index = {};
		
        this._fnobj = null;
        this._fnobj_type = FNTYPE_UK;	
        this._act_call_fn = null;
		this._act_set_pt = null;
		this._act_call_fn_wpt = null;		
        
        // initial at tick()
        this.runtime.tickMe(this);
        
        // blocking
        this.blocking_command_list = [];
        this.blocking_ignored_list = {};
	};
	
    var new_cmdparams = function()
    {         
        return {"n":"",
                "l":[],
                "t":{},						  
               };
    }; 	
    
    instanceProto.tick = function()
    {         
        this._mpwrap_get();    // connect to mpwrap
		this._setup_callback();
        this.runtime.untickMe(this);
    }; 
    
    instanceProto._mpwrap_get = function ()
    {
        if (this.mpwrap != null)
            return this.mpwrap;

        assert2(cr.plugins_.Rex_MPwrap, "MPsyncfunction: Can not find MPwrap oject.");
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Rex_MPwrap.prototype.Instance)
            {
                this.mpwrap = inst;
                inst.MsgHandlerAdd(this.tag, this, this.CmdHandler);
                return this.mpwrap;
            }
        }
        assert2(this.mpwrap, "MPsyncfunction: Can not find MPwrap oject.");
        return null; 
    };   
    
	instanceProto.CmdHandler = function(fromId, fromAlias, content)
	{
	    var mpwrap_obj = this._mpwrap_get();
	    if (mpwrap_obj.IsHost())  // host
	    {
	        mpwrap_obj.HostBroadcastMessage(fromId, this.tag, content, 0, (this.response_mode==1));
	        this.run_command(content, fromAlias);
	    }
	    else  // peer
	    {
	        this.run_command(content, fromAlias);
	    }
	};  
	
    
	instanceProto.CallFunction = function(cmdparams)
	{    
	    if (cmdparams != null)
	        this.cmdparams = cmdparams;	    
	    var mpwrap_obj = this._mpwrap_get();
	    
	    // single player
	    if (!mpwrap_obj.IsConnected())
	    {
	        this.run_command();
	        return;
	    }
	    
	    // mutli-player
	    var is_host = mpwrap_obj.IsHost();
	    if (is_host)
	    {
	        mpwrap_obj.HostBroadcastMessage(null, this.tag, this.cmdparams);
	        this.run_command();
	    }
	    else
	    {
	        mpwrap_obj.SendMessage(null, this.tag, this.cmdparams);
	        if (this.response_mode==0)
	        {
	            this.run_command();
	        }
	    }
	};  
	
	instanceProto._setup_callback = function ()
	{
        var plugins = this.runtime.types;			
        var name, inst;
		// try to get callback from rex_function2
		if (cr.plugins_.Rex_Function2 != null)
		{
            this._act_call_fn = cr.plugins_.Rex_Function2.prototype.acts.CallFunction;
            for (name in plugins)
            {
                inst = plugins[name].instances[0];
				if (inst instanceof cr.plugins_.Rex_Function2.prototype.Instance)
                {
                    this._fnobj = inst
				    this._fnobj_type = FNTYPE_REXFN2;
					this._act_call_fn = cr.plugins_.Rex_Function2.prototype.acts.CallFunction;
					this._act_set_pt = cr.plugins_.Rex_Function2.prototype.acts.SetParameter;
					this._act_call_fn_wpt = cr.plugins_.Rex_Function2.prototype.acts.CallFunctionwPT;
                    return;
                }                                          
            }
		}        
        
        // try to get callback from official function
		if (cr.plugins_.Function != null)    
		{			
            for (name in plugins)
            {
                inst = plugins[name].instances[0];
				if (inst instanceof cr.plugins_.Function.prototype.Instance)
                {
                    this._fnobj = inst;
				    this._fnobj_type = FNTYPE_OFFICIALFN;
					this._act_call_fn = cr.plugins_.Function.prototype.acts.CallFunction;
                    return;
                }                                          
            }
		}
		
        this._fnobj_type = FNTYPE_NA;  // function object is not avaiable
	}; 
		  
	instanceProto.run_command = function(cmdparams, sender_alias)
	{	   	    
	    if (cmdparams != null)
	        this.cmdparams = cmdparams;
	        
	    this.function_call_prelude();
	    if (sender_alias == null)	    
	        this.sender_alias = this._mpwrap_get().GetMyAlias();	    
	    else
	        this.sender_alias = sender_alias;
	 
        var fn_name = this.cmdparams["n"].toLowerCase();
		var param_list = this.cmdparams["l"];
		var param_table = this.cmdparams["t"];
		        		  	       
	    // block command
	    if ((this.accept_cmd_cnt >= 0) &&
	        (!this.blocking_ignored_list.hasOwnProperty(fn_name))
	       )
	    {
	        // pendding
	        if (this.accept_cmd_cnt == 0)
	        {
	            this.blocking_command_list.push([this.cmdparams, this.sender_alias]);
	            this.cmdparams = new_cmdparams();
	            return;
	        }
	        
	        // accept
	        if (this.accept_cmd_cnt > 0)
	        {
	            this.accept_cmd_cnt -= 1;
	        }
	    }
        
        // execute command        		
        this.runtime.trigger(cr.plugins_.Rex_MPsyncfunction.prototype.cnds.OnAnyFunction, this);
        this.runtime.trigger(cr.plugins_.Rex_MPsyncfunction.prototype.cnds.OnFunction, this, fn_name);

        if (this._fnobj_type == FNTYPE_REXFN2)
		{
		    if (param_list.length>0)
			    this._act_call_fn.call(this._fnobj, fn_name, param_list);
		    else
			{
			    var p;
				for (p in param_table)
				{
				    this._act_set_pt.call(this._fnobj, p, param_table[p], "_");
				}
				this._act_call_fn_wpt.call(this._fnobj, fn_name, "_");
			}
		}		
		if (this._fnobj_type == FNTYPE_OFFICIALFN)
		{
		    this._act_call_fn.call(this._fnobj, fn_name, param_list);
		}
		
        this.cmdparams_clear();
	};	
		
	instanceProto.cmdparams_clear = function()
	{            
	    this.cmdparams["l"].length = 0;
	    hashtable_clear(this.cmdparams["t"]);
	};
    
    instanceProto.function_call_prelude = function()
    {
        this.param_index = 0;
        hashtable_clear(this.name2index);       
    };
    
    instanceProto.define_param = function (name, default_value)
    {
        var params_list = this.cmdparams["l"];
		var params_table = this.cmdparams["t"];
        this.name2index[name] = this.param_index;
        if (this.param_index >= params_list.length)
        {
            params_list.length = this.param_index + 1;
            var value = params_table[name];
            if (value == null)
                value = default_value;
            params_list[this.param_index] = value;
        }
        this.param_index += 1;
    };

    instanceProto.param_get = function (param_index_)
    {
        var index_;
        if (typeof(param_index_) == "string")
        {
            index_ = this.name2index[param_index_];
            if (index_ == null)
            {
                //log("[Construct 2] Rex_Function2 object: in function '" + fs.name + "', could not find parameter " + param_index_ , "warn");
                return null;
            }
        }
        else
            index_ = cr.floor(param_index_);
        
        var params_list = this.cmdparams["l"]; 
        if (index_ >= 0 && index_ < params_list.length)
        {
            var value = params_list[index_];
            if (value == null)
            {
                // warn 
                value = 0;
            }
            return value;
        }
        else
        {
            //log("[Construct 2] Rex_Function2 object: in function '" + fs.name + "', accessed parameter out of bounds (accessed index " + index_ + ", " + fs.params.length + " params available)", "warn");
            return null;      
        }
        
    };        
    
    var hashtable_clear = function(t)
    {
        var k;
        for (k in t)
            delete t[k];
    }; 	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnFunction = function (cmd_name_)
	{
		return cr.equals_nocase(cmd_name_, this.cmdparams["n"]);
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

	Cnds.prototype.OnAnyFunction = function ()
	{
		return true;
	};    	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.CallFunction = function (name_, params_)
    {
        cr.shallowAssignArray(this.cmdparams["l"], params_);        
        this.cmdparams["n"] = name_;
        this.CallFunction();
    };

    Acts.prototype.SetParameter = function (name_, value_)
    {
        this.cmdparams["t"][name_] = value_;
    };

    Acts.prototype.CallFunctionwPT = function (name_)
    {
        this.cmdparams["n"] = name_;
        this.CallFunction();
    };  
        
    Acts.prototype.DefineParam = function (name, default_value)
    {
        this.define_param(name, default_value);
    }; 

    Acts.prototype.AddIgnored = function (name_)
    {
        this.blocking_ignored_list[name_.toLowerCase()] = true;
    };

    Acts.prototype.AcceptOne = function ()
    {
        if (this.accept_cmd_cnt == (-1))
            return;
            
        this.accept_cmd_cnt = 1;
        if (this.blocking_command_list.length == 0)
            return;
        
        var cmd_saved = this.blocking_command_list.shift();
        this.run_command(cmd_saved[0], cmd_saved[1]);
    };
        
    Acts.prototype.RemoveIgnored = function (name_)
    {        
        delete this.blocking_ignored_list[name_.toLowerCase()];
    };   

    Acts.prototype.Close = function ()
    {
        if (this.accept_cmd_cnt == (-1))
            return;
        this.accept_cmd_cnt = 0;
    };
    
    Acts.prototype.Discard = function ()
    {
        if (this.accept_cmd_cnt == (-1))
            return;
            
        this.blocking_command_list.length = 0;
        this.accept_cmd_cnt = 0;
    };    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
    Exps.prototype.Param = function (ret, param_index_)
    {
        ret.set_any(this.param_get(param_index_));
    };
    
    Exps.prototype.ParamCount = function (ret)
    {
        ret.set_int(this.cmdparams["l"].length);
    };    

    Exps.prototype.SenderAlias = function (ret)
	{
	    ret.set_string( this.sender_alias );
	}; 

    Exps.prototype.FunctionName = function (ret)
	{
	    ret.set_string( this.cmdparams["n"] );
	};	

    Exps.prototype.FunctionParams = function (ret)
	{
	    var _p = (this.cmdparams["l"].length>0)? this.cmdparams["l"]:this.cmdparams["t"];
	    ret.set_string( JSON.stringify(_p) );
	};	
	
		
}());
