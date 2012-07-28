// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_CSV2Fn = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_CSV2Fn.prototype;
		
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
        this.csv = null;
        this.callback = null;
	};
    
    var clean_hash_table = function(hash_table)
    {
        var key;
        for (key in hash_table)
            delete hash_table[key];
        return hash_table;
    }
   
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Setup = function (csv_objs, fn_objs)
	{  
        var csv = csv_objs.instances[0];
        if (csv.check_name == "CSV")
            this.csv = csv;        
        else
            alert ("CSV2Fn should connect to a csv object");          
        
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.callback = callback;        
        else
            alert ("CSV2Fn should connect to a function object");
	};   
    
    Acts.prototype.RunCmds = function (page_name, is_eval_mode)
	{  
        assert2(this.csv, "CSV2Fn should connect to a csv object");
        assert2(this.callback, "CSV2Fn should connect to a function object");
        var table = this.csv._tables[page_name];
        if (table == null)
            return;
        
        var items = table.items;
        var item_cnt = items.length;           
        var keys = table.keys;
        var key_cnt = keys.length;     
        var i,j, fn_name, cur_item, cur_key, cur_value;
        var param = {};
		for (i=0; i<item_cnt; i++ )
	    {
            cur_item = items[i];
            clean_hash_table(param);
		    for (j=0; j<key_cnt; j++ )
	        {
                cur_key = keys[j];
                cur_value = table._table[cur_key][cur_item];            
                if (j==0)
                    fn_name = cur_value;
                else
                {
                    if (is_eval_mode)
                        cur_value = eval("("+cur_value+")");
                    this.callback.fnObj["param"][cur_key] = cur_value;
                }                        
            }        
            this.callback.CallFn(fn_name, param);
        }
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());