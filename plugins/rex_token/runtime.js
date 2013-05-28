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
	instanceProto._set_next_index = function(_next_index)
	{
	    this._pre_index = this.index;
        
        if (_next_index == null)
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
        }
        else if ((_next_index >= 0) && (_next_index < this.player_id_list.length))
            this.index = _next_index;
        
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
	
	instanceProto.saveToJSON = function ()
	{
		return { "l": this.player_id_list,
                 "i": this.index          };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.player_id_list = o["l"];
		this.index = o["i"];		
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
	Cnds.prototype.OnIndexChanging = function ()
	{
		return true;        
	}; 	
	Cnds.prototype.IsFirst = function ()
	{
		return (this.index == 0);        
	}; 	    
	Cnds.prototype.IsLast = function ()
	{
		return (this.index == (this.player_id_list.length-1));        
	};
	Cnds.prototype.IsCurID = function (_id)
	{
		return (_id == this.player_id_list[this.index]);        
	};    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
		
	Acts.prototype.NextIndex = function ()
	{        
	    this._set_next_index();
	};	
	Acts.prototype.SetNextIndex = function (_index)
	{        
        this._set_next_index(_index);
	};
	Acts.prototype.TurnOff = function ()
	{        
        this.index = (-1);
	};
	Acts.prototype.InvertOrder = function ()
	{        
        this.is_inc_order = !this.is_inc_order;
	};
	Acts.prototype.SetIDList = function (id_list_string)
	{        
        this._set_id_list(id_list_string);
	};	
	Acts.prototype.AppendIDList = function (_id)
	{        
        this.player_id_list.push(_id);
	};	
	Acts.prototype.RemoveIDList = function (_id)
	{
        var _index = this.player_id_list.indexOf(_id);
        if (_index == (-1))
            return;
        
        cr.arrayRemove(this.player_id_list, _index); 
        this._set_pre_index();     
	};	
	Acts.prototype.SwitchID = function (_idA, _idB)
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
	Acts.prototype.CleanIDList = function ()
	{       
        this.player_id_list.length = 0;
	};
    Acts.prototype.SetNextID = function (_id)
	{        
        var index = this.player_id_list.indexOf(_id);
        if (index != (-1))
            this._set_next_index(index);
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.ListLength = function (ret)
	{
	    ret.set_int(this.player_id_list.length);
	};     
	Exps.prototype.Index2ID = function (ret, _index, default_value)
	{
	    ret.set_any(this.player_id_list[_index]);
	};    
	Exps.prototype.ID2Index = function (ret, _id)
	{
	    ret.set_int(this.player_id_list.indexOf(_id));
	};   
	Exps.prototype.CurrIndex = function (ret)
	{
	    ret.set_int(this.index);
	};
	Exps.prototype.CurrID = function (ret)
	{
	    ret.set_any(this.player_id_list[this.index]);
	};	
	Exps.prototype.PreIndex = function (ret)
	{
	    ret.set_int(this._pre_index);
	};
	Exps.prototype.PreID = function (ret)
	{
	    ret.set_any(this.player_id_list[this._pre_index]);
	};
	Exps.prototype.List2String = function (ret)
	{
	    ret.set_string(JSON.stringify(this.player_id_list));
	};	
}());