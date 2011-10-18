// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.MyCSV = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.MyCSV.prototype;
		
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
		this.Clear();
	};
    
	instanceProto.Clear = function()
	{
		this._table = {};
        this.keys = [];
        this.key_cnt = 0;
        this.items = [];
        this.item_cnt = 0;   
	};    

    instanceProto._create_keys = function(key_string)
	{
		var keys = key_string.split(",");
        keys.shift();
        var i, key;
        var key_cnt = keys.length;
        for (i=0; i<key_cnt; i++)
        {
            key = keys[i];
            if (this._table[key] == null)
                this._table[key] = {};         
        }
        this.keys = keys;
        this.key_cnt = keys.length;
	};
    
    instanceProto._create_items = function(item_string)
	{
        var values = item_string.split(",");
        var item_name = values.shift();
        var keys = this.keys;
        var key_cnt = this.key_cnt;
        var table = this._table;
        var i;
        for (i=0; i<key_cnt; i++)
        {
            table[keys[i]][item_name] = values[i];        
        }
        this.items.push(item_name);
	}; 
    
	instanceProto._parsing = function(csv_string)
	{
        if (csv_string == "")
            return;
            
		var lines = csv_string.split(/\r\n|\r|\n/);
        var key_string = lines.shift();
        this._create_keys(key_string);
        var line_cnt = lines.length;
        var i;
        for (i=0; i<line_cnt; i++)
        {
            this._create_items(lines[i]);
        }
        this.item_cnt = this.items.length;
	}; 

    instanceProto.at = function(col, row)
	{
        if (this._table[col]==null)
            return 0;
        
        var val = this._table[col][row];
		if (val == null)
            return 0;

        return val;   
	};
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;

	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
	acts.LoadCSV = function (csv_string)
	{         
        this._parsing(csv_string);
	};
    
	acts.SetEntry = function (col, row, val)
	{
        if (this._table[col] == null)
        {
            this._table[col] = {};
        }
        this._table[col][row] = val;        
	};
    
	acts.Clear = function ()
	{
		this.Clear();
	};    
    
	acts.ConvertType = function (row, to_type)
	{
        var handler = (to_type==0)? parseInt:
                                    parseFloat;
        var keys = this.keys;
        var key_cnt = this.key_cnt;
        var table = this._table;
        var i, val;
        for (i=0; i<key_cnt; i++)
        {
            val = table[keys[i]][row];
            table[keys[i]][row] = handler(val);        
        }                    
	};   
    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
    
	exps.At = function (ret, col, row)
	{
        ret.set_any(this.at(col,row));
	}; 
    
	exps.CurCol = function (ret)
	{
		ret.set_int(this.forCol);
	};
	
	exps.CurRow = function (ret)
	{
		ret.set_int(this.forRow);
	};
	
	exps.CurValue = function (ret)
	{
		ret.set_any(this.at(this.forCol,this.forRow));
	};    
    
}());