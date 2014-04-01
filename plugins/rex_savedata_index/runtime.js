// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SaveDataIndex = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SaveDataIndex.prototype;
		
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
	    this.prefix = this.properties[0];
        this.initialize_flg = true;
	    this.saveslot_mgr = new cr.plugins_.Rex_SaveDataIndex.SaveSlotMgrKlass(this);
	    this.extra_data = {};
	    this._fetched_current_index = null;
	    this._fetched_current_content = null;
	    
        this._webstorage_obj = null;
        this._save_fn = null;
        this._load_fn = null;
        this._key_exist_fn = null;
        this._remove_entry = null;
	    this.fake_ret = {value:0,
	                     set_any: function(value){this.value=value;},
	                     set_int: function(value){this.value=value;},	 
                         set_float: function(value){this.value=value;},	 
                         set_string: function(value){this.value=value;},	    
	                    };  	    
	};
    
	instanceProto.onDestroy = function ()
	{
	}; 
	
	instanceProto.key_get = function (index)
	{
	    if (index == null)
	        index = "##INDEX##";
        else
            index = "-index-"+index.toString();
	    return this.prefix+index;
	}; 
		
	instanceProto.entry_get = function (index)
	{  
	    if (index != this._fetched_current_index)
	    {
	        var key = this.key_get(index);
	        if (this.key_exist(key))
	        {
	            this._fetched_current_index = index;                
	            this._fetched_current_content = JSON.parse(this.load_value(key));
	        }
	        else
	        {
	            return null;
	        }
	    }
	    return this._fetched_current_content;
	};
    
	instanceProto.refresh_fetched_current_content = function ()
	{  
	    this._fetched_current_index = null;
	    this._fetched_current_content = null;
	};
    
	instanceProto.initialize_index = function ()
	{  
        if (!this.initialize_flg)
            return;
            
        this.initialize_flg = false;
        var key = this.key_get();
        if (!this.key_exist(key))
            return;
        
        var o = JSON.parse(this.load_value(key));
        this.saveslot_mgr.loadFromJSON(o);
	};
	  
	instanceProto.webstorage_get = function ()
	{   	 
        if (this._webstorage_obj != null)
            return this._webstorage_obj;      
            
	    assert2(cr.plugins_.WebStorage, "SaveDataIndex: Could not find official webstorage oject.");
        var plugins = this.runtime.types;
        this._save_fn = cr.plugins_.WebStorage.prototype.acts.StoreLocal;
        this._load_fn = cr.plugins_.WebStorage.prototype.exps.LocalValue;
        this._key_exist_fn = cr.plugins_.WebStorage.prototype.cnds.LocalStorageExists;
        this._remove_entry = cr.plugins_.WebStorage.prototype.cnds.RemoveLocal;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.WebStorage.prototype.Instance)
            {
                this._webstorage_obj = inst;
                return this._webstorage_obj;
            }                                          
        }
        assert2(this._webstorage_obj, "SaveDataIndex: Could not find official webstorage oject.");
        return null;         
	};
    
    instanceProto.load_value = function (key)
    {
        var webstorage_obj = this.webstorage_get();
        this._load_fn.call(webstorage_obj, this.fake_ret, key);
        return this.fake_ret.value;
    };
    
    instanceProto.save_value = function (key, value)
    {
        var webstorage_obj = this.webstorage_get();
        this._save_fn.call(webstorage_obj, key, value);
    };	
    
    instanceProto.key_exist = function (key)
    {
        var webstorage_obj = this.webstorage_get();
        return this._key_exist_fn.call(webstorage_obj, key);
    }; 
    
    instanceProto.remove_entry = function (key)
    {
        var webstorage_obj = this.webstorage_get();
        this._remove_entry.call(webstorage_obj, key);
    };       
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

    Cnds.prototype.IsEmpty = function ()
	{
        this.initialize_index();
        var index2slotname = this.saveslot_mgr.index2slotname;
        var i, has_key = false;
        for (i in index2slotname)
        {
            has_key = true;
            break;
        }
		return (!has_key);
	};
    
	Cnds.prototype.IsOccupied = function (index)
	{
        this.initialize_index();
        var index2slotname = this.saveslot_mgr.index2slotname;
        
		return index2slotname.hasOwnProperty(index);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	  
    Acts.prototype.TemporarySaveGame = function ()
	{
        this.initialize_index();
        this.saveslot_mgr.tmp_save();   
	}; 
	  
    Acts.prototype.SetExtraData = function (name, value)
	{
        this.initialize_index();    
        this.extra_data[name] = value;
	}; 
	  
    Acts.prototype.SaveSlot = function (index)
	{
        this.initialize_index();    
	    // save slot
        var slotname = this.saveslot_mgr.savedslot_register(index);
	    var entry = { "ex" : this.extra_data,
	                };
	    this.save_value(this.key_get(index), JSON.stringify(entry));
        // save index
        var o = this.saveslot_mgr.saveToJSON();
        this.save_value(this.key_get(), JSON.stringify(o));
        this.refresh_fetched_current_content();
	}; 
    
    Acts.prototype.LoadGame = function (index)
	{	    
        this.initialize_index();    
	    this.saveslot_mgr.load(index);   
	};    
	  
    Acts.prototype.TemporaryLoadGame = function ()
	{
        this.initialize_index();
	    this.saveslot_mgr.load();   
	};		
	  
    Acts.prototype.CleanSlot = function (index)
	{
        this.initialize_index();  
        var has_entry = this.saveslot_mgr.clean_entry(index); 
        if (has_entry)
            this.remove_entry(this.key_get(index));
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.ExtraData = function (ret, name, index)
	{  
        this.initialize_index();
        var value;
        if (index == null)
        {
            value = this.extra_data[name];
        }
        else
        {
	        var entry = this.entry_get(index);
            value = (entry == null)? null : entry["ex"][name];
        }
        if (value == null)
            value = 0;      
            
        ret.set_any(value);
	};      
    
}());

(function ()
{
    cr.plugins_.Rex_SaveDataIndex.SaveSlotMgrKlass = function(plugin)
    {                        
        this.plugin = plugin;
        this.index2slotname = {};
        this.slotname2index = {};
        this.recyle_slotname = [];
        this.slotid = 0;
        this.current_slotname = null;
        this.slotname_update_flg = true;
    };
    var SaveSlotMgrKlassProto = cr.plugins_.Rex_SaveDataIndex.SaveSlotMgrKlass.prototype;
    
    SaveSlotMgrKlassProto.new_slotname_get = function()
    {
        if (this.recyle_slotname.length > 0)
            return this.recyle_slotname.pop();
        else
        {
            var name = this.plugin.prefix + "-save-" + this.slotid.toString();
            this.slotid += 1;
            return name;
        }
              
    };
        
    SaveSlotMgrKlassProto.tmp_save = function()
    {            
        if (this.slotname_update_flg)
        {
            this.current_slotname = this.new_slotname_get();
            this.slotname_update_flg = false;            
        }
            
        cr.system_object.prototype.acts.SaveState.call(this.plugin.runtime.system, this.current_slotname);
    };
    
    SaveSlotMgrKlassProto.load = function(index)
    {
        var slotname = (index == null)? this.current_slotname : this.index2slotname[index];
        if (slotname == null)
            return;
        cr.system_object.prototype.acts.LoadState.call(this.plugin.runtime.system, slotname)
    };    
            
    SaveSlotMgrKlassProto.savedslot_register = function(index)
    {   
        // this.current_slotname should NOT be null
        assert2(this.current_slotname, "SaveDataIndex : miss saved slot.");
                        
        this.slotname_update_flg = true;
        var old_slotname = this.index2slotname[index];
        if (old_slotname == this.current_slotname)     // save at the same index
        {
            return this.current_slotname;
        }
        
        if (old_slotname != null)
        {
            var index_list = this.slotname2index[old_slotname];            
            cr.arrayFindRemove(index_list, index);
            if (index_list.length == 0)
            {
                // recyle slotname
                delete this.slotname2index[old_slotname];
                this.recyle_slotname.push(old_slotname);
            }
        }
         
        this.index2slotname[index] = this.current_slotname;
        var index_list = this.slotname2index[this.current_slotname];
        if (index_list == null)
        {
            this.slotname2index[this.current_slotname] = [index];
        }
        else
        {
            index_list.push(index);
        }
        return this.current_slotname;
    };  
    
    SaveSlotMgrKlassProto.clean_entry = function(index)
    {
        var slotname = this.index2slotname[index];
        if (slotname == null)
            return false;
            
        delete this.index2slotname[index];
        var index_list = this.slotname2index[slotname];
        cr.arrayFindRemove(index_list, index);
        if (index_list.length == 0)
        {
            // recyle slotname
            delete this.slotname2index[slotname];
            this.recyle_slotname.push(slotname);            
        } 
        return true;    
    };    
             
    
	SaveSlotMgrKlassProto.saveToJSON = function ()
	{    
		return { "index2slotname": this.index2slotname,
                 "slotname2index": this.slotname2index,
                 "recyle_slotname": this.recyle_slotname,
                 "slotid": this.slotid,
                 "slotname_update_flg": this.slotname_update_flg
		         };
	};
	
	SaveSlotMgrKlassProto.loadFromJSON = function (o)
	{   
	    this.index2slotname = o["index2slotname"];
        this.slotname2index = o["slotname2index"];
        this.recyle_slotname = o["recyle_slotname"];
        this.slotid = o["slotid"]; 
        this.slotname_update_flg = o["slotname_update_flg"];   
	};    
}());      