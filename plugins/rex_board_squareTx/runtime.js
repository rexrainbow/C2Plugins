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
	instanceProto.GetX = function(logic_x, logic_y, logic_z)
	{
        var x = (this.is_isometric)? ((logic_x - logic_y)*this.half_width):
                                     (logic_x*this.width);
        return x+this.PositionOX;
	};
	instanceProto.GetY = function(logic_x, logic_y, logic_z)
	{
        var y = (this.is_isometric)? ((logic_x + logic_y)*this.half_height):
                                     (logic_y*this.height);
        return y+this.PositionOY;
	};   
	instanceProto.CreateItem = function(obj_type,x,y,z,layer)
	{
        return this.runtime.createInstance(obj_type, layer,this.GetX(x,y,z),this.GetY(x,y,z) );        
	};
	instanceProto.GetNeighborLX = function(x, y, dir)
	{
        var dx = (dir==0)? 1:
		         (dir==2)? (-1):
				          0;
		return (x+dx);
	};
	instanceProto.GetNeighborLY = function(x, y, dir)
	{
        var dy = (dir==1)? 1:
		        (dir==3)? (-1):
				          0;       
        return (y+dy);
	};
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
    acts.SetOrientation = function (orientation)
    {        
        this.is_isometric = (orientation == 1);
	};
    acts.SetCellSize = function (width, height)
    {        
        this.SetWidth(width);
        this.SetHeight(height);
	};
    acts.SetOffset = function (x, y)
    {        
        this.PositionOX = x;
        this.PositionOY = y;
	};    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

}());