// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGCubeTx = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SLGCubeTx.prototype;
		
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
        this.deep = this.properties[5];
	};
	instanceProto.SetPOX = function(pox)
	{
        this.PositionOX = pox;       
	}; 
	instanceProto.SetPOY = function(poy)
	{
        this.PositionOY = poy;
	};   
	instanceProto.GetPOX = function()
	{
        return this.PositionOX;       
	}; 
	instanceProto.GetPOY = function()
	{
        return this.PositionOY;
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
	instanceProto.LXYZ2PX = function(logic_x, logic_y, logic_z)
	{
        var x = (this.is_isometric)? ((logic_x - logic_y)*this.half_width):
                                     (logic_x*this.width);
        return x+this.PositionOX;
	};
	instanceProto.LXYZ2PY = function(logic_x, logic_y, logic_z)
	{
        var y = (this.is_isometric)? ((logic_x + logic_y)*this.half_height):
                                     (logic_y*this.height);
        y -= (logic_z*this.deep);
        return y+this.PositionOY;
	}; 
	instanceProto.PXY2LX = function(physical_x,physical_y)
	{
	    var lx;
	    if (this.is_isometric)
		{
		    physical_x -= this.PositionOX;
		    physical_y -= this.PositionOY;
		    lx = 0.5*(Math.round(physical_y/this.half_height)+Math.round(physical_x/this.half_width));
		}
		else
		    lx = (physical_x - this.PositionOX)/this.width;
        return lx;
	};
	instanceProto.PXY2LY = function(physical_x,physical_y)
	{
	    var ly;
	    if (this.is_isometric)
		{
		    physical_x -= this.PositionOX;
		    physical_y -= this.PositionOY;
		    ly = 0.5*(Math.round(physical_y/this.half_height)-Math.round(physical_x/this.half_width));
		}
		else
		    ly = (physical_y - this.PositionOY)/this.height;
        return ly;
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
	instanceProto.GetDirCount = function()
	{  
        return 4;						 
	};
	instanceProto.XYZ2LA = function(xyz_o, xyz_to)
	{  
        return null;				 
	};
	instanceProto.XYZ2Dir = function(xyz_o, xyz_to)
	{  
        return null;				 
	};	
	
	instanceProto.saveToJSON = function ()
	{
		return { "iso": this.is_isometric,
                 "w": this.width,
                 "h": this.height,
                 "ox": this.PositionOX,
                 "oy": this.PositionOY};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.is_isometric = o["iso"];
        this.SetWidth(o["w"]);
        this.SetHeight(o["h"]);   
        this.SetPOX(o["ox"]);
        this.SetPOY(o["oy"]);          
	};	    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();        
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetOrientation = function (orientation)
    {        
        this.is_isometric = (orientation == 1);
	};
    Acts.prototype.SetCellSize = function (width, height)
    {        
        this.SetWidth(width);
        this.SetHeight(height);
	};
    Acts.prototype.SetOffset = function (x, y)
    {        
        this.SetPOX(x);
        this.SetPOY(y);
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());