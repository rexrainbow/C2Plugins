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
        this._pre_index = (-1);
	};
	
	instanceProto._set_id_list = function(id_list_string)
	{
        if (id_list_string.charAt(0) != "[")
            id_list_string = "["+id_list_string+"]";         
	    this.player_id_list = JSON.parse(id_list_string);
	};	
	instanceProto._set_next_index = function()
	{
	    this._pre_index = this.index;
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
	    this.runtime.trigger(cr.plugins_.Rex_Token.prototype.cnds.OnIndexChanging, this);
	};
	instanceProto._set_pre_index = function()
	{
	    this._pre_index = this.index;
	    var last_index = this.player_id_list.length-1;
	    if (this.index == (-1))
	        return;
	    else
	    {
	        if (this.is_inc_order)
                this.index = (this.index == 0)? last_index: (this.index-1);
	        else
	            this.index = (this.index == last_index)? 0: (this.index+1);
	    }
	    this.runtime.trigger(cr.plugins_.Rex_Token.prototype.cnds.OnIndexChanging, this);
	};
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    
    
	cnds.OnIndexChanging = function ()
	{
		return true;        
	}; 	
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
        var _index = this.player_id_list.indexOf(_id);
        if (_index == (-1))
            return;
        
        cr.arrayRemove(this.player_id_list, _index); 
        this._set_pre_index();     
	};	
	acts.SwitchID = function (_idA, _idB)
	{       
        if (_idA == _idB)
            return;
        var _indexA = this.player_id_list.indexOf(_idA);
        var _indexB = this.player_id_list.indexOf(_idB);
        if ((_indexA == (-1)) || (_indexB == (-1)))
            return;
            
        this.player_id_list[_indexA] = _idB;
        this.player_id_list[_indexB] = _idA;
	};	
	acts.CleanIDList = function ()
	{       
        this.player_id_list.length = 0;
	};	    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.ListLength = function (ret)
	{
	    ret.set_int(this.player_id_list.length);
	};     
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
	exps.PreIndex = function (ret)
	{
	    ret.set_int(this._pre_index);
	};
	exps.PreID = function (ret)
	{
	    ret.set_any(this.player_id_list[this._pre_index]);
	};
	exps.List2String = function (ret)
	{
	    ret.set_string(JSON.stringify(this.player_id_list));
	};	
}());