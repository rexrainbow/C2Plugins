// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Token = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Token.prototype;
		
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
	    this._set_id_list(this.properties[0]);
        this.index = this.properties[1];
        this.is_inc_order = (this.properties[2] == 0);
	};
	
	instanceProto._set_id_list = function(id_list_string)
	{
	    this.player_id_list = JSON.parse("["+id_list_string+"]");
	};	
	
	instanceProto._set_next_index = function()
	{
	    var last_index = this.player_id_list.length-1;
	    if (this.index == (-1))
	        this.index = (this.is_inc_order)? 0: last_index;
	    else
	    {
	        if (this.is_inc_order)
	            this.index = (this.index == last_index)? 0: (this.index+1);
	        else
	            this.index = (this.index == 0)? last_index: (this.index-1);
	    }
	};	

	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    
    
	cnds.IsFirst = function ()
	{
		return (this.index == 0);        
	}; 	    
	cnds.IsLast = function ()
	{
		return (this.index == (this.player_id_list.length-1));        
	};
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
		
	acts.NextIndex = function ()
	{        
	    this._set_next_index();
	};	
	
	acts.SetIndex = function (_index)
	{        
        if (_index < this.player_id_list.length)
            this.index = _index;
	};
	
	acts.TurnOff = function ()
	{        
        this.index = (-1);
	};
		
	acts.InvertOrder = function ()
	{        
        this.is_inc_order = !this.is_inc_order;
	};
	
	acts.SetIDList = function (id_list_string)
	{        
        this._set_id_list(id_list_string);
	};	
	acts.AppendIDList = function (_id)
	{        
        this.player_id_list.push(_id);
	};	
	acts.RemoveIDList = function (_id)
	{        
        //
	};		
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
    
	exps.Index2ID = function (ret, _index, default_value)
	{
	    ret.set_any(this.player_id_list[_index]);
	};    
	exps.ID2Index = function (ret, _id)
	{
	    ret.set_int(this.player_id_list.indexOf(_id));
	};   
	exps.CurrIndex = function (ret)
	{
	    ret.set_int(this.index);
	};
	exps.CurrID = function (ret)
	{
	    ret.set_any(this.player_id_list[this.index]);
	};	
	
}());