// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGDiamondTx = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SLGDiamondTx.prototype;
		
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
        this.check_name = "LAYOUT";
        this.PositionOX = this.properties[0];
        this.PositionOY = this.properties[1];
        this.half_width = this.properties[2]/2;
        this.half_height = this.properties[3]/2;
	};
   
	instanceProto.GetX = function(logic_x, logic_y)
	{
        return ((logic_x - logic_y)*this.half_width)+this.PositionOX;
	};
	instanceProto.GetY = function(logic_x, logic_y)
	{
        return ((logic_x + logic_y)*this.half_height)+this.PositionOY;
	}; 
	instanceProto.CreateItem = function(obj_type,logic_x,logic_y,layer,offset_x,offset_y)
	{
        return this.runtime.createInstance(
                       obj_type, 
                       layer, 
                       this.GetX(logic_x,logic_y)+offset_x, 
                       this.GetY(logic_x,logic_y)+offset_y );
	};
   	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

}());