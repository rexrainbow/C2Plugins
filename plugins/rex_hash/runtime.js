// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Hash = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Hash.prototype;
		
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
        this.exp_CurKey = "";
        this.exp_CurValue = 0;
        this._clean_all();  
        var init_data = this.properties[0];
        if (init_data != "")
            this._my_hash = JSON.parse(init_data);
	};
    
	instanceProto._clean_all = function()
	{
		this._my_hash = {};
        this._current_entry = this._my_hash;
	};    
        
	instanceProto._set_entry_byKeys = function(keys)
	{
        var key_len = keys.length;
        var i, key;
        var _entry = this._my_hash;
        for (i=0; i< key_len; i++)
        {
            key = keys[i];
            if ( (_entry[key] == null) ||
                 (typeof _entry[key] != "object") )
            {
                _entry[key] = {};
            }
            _entry = _entry[key];            
        }
        
        this._current_entry = _entry;
	};
    
	instanceProto._set_current_entey = function (key_string)
	{        
        if (key_string != "")
        {
            var keys = key_string.split(".");      
		    this._set_entry_byKeys(keys);
        }
        else
            this._current_entry = this._my_hash;
	};
    
	instanceProto._get_data = function(keys)
	{           
        var key_len = keys.length;
        var i;
        var _entry = this._my_hash;
        for (i=0; i< key_len; i++)
        {
             _entry = _entry[keys[i]];
            if ( (_entry == null) ||
                 ((typeof _entry != "object") && (i != (key_len-1))) )
            {
                return null;
            }              
        }
        return _entry;        
	}; 
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.ForEachKey = function (key_string)
	{
        this._set_current_entey(key_string);
        var current_event = this.runtime.getCurrentEventStack().current_event;

        var key, value;
		for (key in this._current_entry)
	    {
            value = this._current_entry[key];
            if ((typeof value != "number") && (typeof value != "string"))
                continue;
                
            this.exp_CurKey = key;
            this.exp_CurValue = value;
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

        this.exp_CurKey = "";
        this.exp_CurValue = 0;      
		return false;
	}; 

	Cnds.prototype.KeyExists = function (key_string)
	{
	    if (key_string == "")
            return false;
        var data = this._get_data(key_string.split("."));		    
        return (data != null);
	}; 	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.SetByKeyString = function (key_string, val)
	{        
        if (key_string != "")
        {
		    var keys = key_string.split(".");             
            var last_key = keys.splice(keys.length-1, 1);      
            this._set_entry_byKeys(keys);
            this._current_entry[last_key] = val;
        }
	};

	Acts.prototype.SetCurHashEntey = function (key_string)
	{        
        this._set_current_entey(key_string);
	};

	Acts.prototype.SetValueInCurHashEntey = function (key_name, val)
	{        
        if (key_name != "")
        {
            this._current_entry[key_name] = val;
        }        
	};    

	Acts.prototype.CleanAll = function ()
	{        
        this._clean_all();      
	};  

    Acts.prototype.StringToHashTable = function (JSON_string)
	{  
        this._my_hash = JSON.parse(JSON_string);
	};  
    
    Acts.prototype.RemoveByKeyString = function (key_string)
	{  
        if (key_string != "")
        {
		    var keys = key_string.split(".");             
            var last_key = keys.splice(keys.length-1, 1);      
            this._set_entry_byKeys(keys);
            delete this._current_entry[last_key];
        }
	};  
    
    Acts.prototype.PickKeysToArray = function (key_string, array_objs)
	{  
        var array_obj = array_objs.getFirstPicked();
        if (array_obj.arr == null)
        {
            alert("Action:Pick keys : it is not an array object.");
            return;
        }
        cr.plugins_.Arr.prototype.acts.SetSize.apply(array_obj, [0,1,1]);
        
        this._set_current_entey(key_string);
        var key;
		for (key in this._current_entry)
            cr.plugins_.Arr.prototype.acts.Push.apply(array_obj, [0,key,0]); 
	};     
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.Hash = function (ret, key_string, default_value)
	{   
        var keys = (arguments.length > 2)?
                   Array.prototype.slice.call(arguments,1):
                   key_string.split(".");
        var val = this._get_data(keys);
        if ((typeof val != "number") && (typeof val != "string"))
            val = default_value;
		ret.set_any(val);
	};
    
	Exps.prototype.At = function (ret, key_string, default_value)
	{     
        var keys = (arguments.length > 2)?
                   Array.prototype.slice.call(arguments,1):
                   key_string.split(".");
        var val = this._get_data(keys);
        if ((typeof val != "number") && (typeof val != "string"))
            val = default_value;        
		ret.set_any(val);
	};
	Exps.prototype.AtKeys = function (ret, key_string)
	{     
        var keys = (arguments.length > 2)?
                   Array.prototype.slice.call(arguments,1):
                   [key_string];
        var val = this._get_data(keys);      
		ret.set_any(val);
	};    
    
	Exps.prototype.Entry = function (ret, key_name)
	{       
		ret.set_any(this._current_entry[key_name]);
	};

	Exps.prototype.HashTableToString = function (ret)
	{
        var json_string = JSON.stringify(this._my_hash);
		ret.set_string(json_string);
	};  
	
	Exps.prototype.CurKey = function (ret)
	{
		ret.set_string(this.exp_CurKey);
	};  
    
	Exps.prototype.CurValue = function (ret)
	{
		ret.set_any(this.exp_CurValue);
	};    
}());