// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGSquareTx = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SLGSquareTx.prototype;
		
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
        this.is_isometric = (this.properties[0]==1);
        this.PositionOX = this.properties[1];
        this.PositionOY = this.properties[2];
        this.SetWidth(this.properties[3]);
        this.SetHeight(this.properties[4]);
	};
   
	instanceProto.SetWidth = function(width)
	{
        this.width = width;
        this.half_width = width/2;        
	}; 
	instanceProto.SetHeight = function(height)
	{
        this.height = height;
        this.half_height = height/2;        
	};     
	instanceProto.GetX = function(logic_x, logic_y)
	{
        var x = (this.is_isometric)? ((logic_x - logic_y)*this.half_width):
                                     (logic_x*this.width);
        return x+this.PositionOX;
	};
	instanceProto.GetY = function(logic_x, logic_y)
	{
        var y = (this.is_isometric)? ((logic_x + logic_y)*this.half_height):
                                     (logic_y*this.height);
        return y+this.PositionOY;
	};   
	instanceProto.CreateItem = function(obj_type,x,y,layer,offset_x,offset_y)
	{
        return this.runtime.createInstance(obj_type, layer,this.GetX(x,y)+offset_x,this.GetY(x,y)+offset_y );        
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