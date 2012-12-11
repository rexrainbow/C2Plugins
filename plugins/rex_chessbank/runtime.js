// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ChessBank = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ChessBank.prototype;
		
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
        this.bank = null;    
        this._target_inst = null;
        this._info = {};
	};
	
    instanceProto.instbank_get = function()
    {     
        if (this.bank != null)
            return;
        assert2(cr.plugins_.Rex_InstanceBank, "Chess bank: please put a instance bank object into project");
        this.bank = new cr.plugins_.Rex_InstanceBank.InstBankKlass(this);   
    }; 		
	// handlers
    instanceProto.OnSaving = function(inst, ret_info)
    {     
        this._target_inst = inst;
        this._info = ret_info;
        this.runtime.trigger(cr.plugins_.Rex_ChessBank.prototype.cnds.OnSave, this);
    }; 	
    instanceProto.OnLoading = function(inst, info)
    {
        this._target_inst = inst;
        this._info = info;    
        this.runtime.trigger(cr.plugins_.Rex_ChessBank.prototype.cnds.OnLoad, this);
    };     
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnSave = function (obj_type)
	{
		if (!obj_type)
			return;    
	    return this.bank.SOLPickOne(obj_type, this._target_inst);
	};
    
	Cnds.prototype.OnLoad = function (obj_type)
	{
		if (!obj_type)
			return;      
		return this.bank.SOLPickOne(obj_type, this._target_inst);
	}; 
     
	Cnds.prototype.PickBySavedUID = function (obj_type, saved_uid)
	{
		if (!obj_type)
			return;      
		return this.bank.SOLPickBySavedUID(obj_type, saved_uid);
	};  
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.CleanBank = function ()
	{
	    this.instbank_get();
        this.bank.CleanBank();
	};
    
    Acts.prototype.SaveInstances = function (board_obj, save_target_type)
	{
        this.instbank_get();	    
		if (!board_obj)
			return;      
        this.bank.SaveInstances(obj_type, is_pick_all);
	};

    Acts.prototype.LoadInstances = function (board_obj)
	{  
        this.instbank_get();	    
        this.bank.LoadAllInstances();
	};

    Acts.prototype.StringToBank = function (JSON_string)
	{  
        this.instbank_get();	    
        this.bank.JSON2Bank(JSON_string);
	};  

    Acts.prototype.SaveInfo = function (index, value)
	{  
        this.instbank_get();	    
        this._info[index] = value;
	};
    
	Acts.prototype.PickBySavedUID = function (obj_type, saved_uid)
	{
        this.instbank_get();	    
		if (!obj_type)
			return;      
		this.bank.SOLPickBySavedUID(obj_type, saved_uid);
	};  
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.BankToString = function (ret)
	{
        this.instbank_get();	    
        var json_string = this.bank.ToString();
		ret.set_string(json_string);
	}; 

    Exps.prototype.SavedInfo = function (ret, index, default_value)
	{
        this.instbank_get();	    
        var val = this.bank._info[index];
        if (val == null)
            val = default_value;
	    ret.set_any(val);
	};     
}());