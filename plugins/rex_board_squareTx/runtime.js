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
        this.SetPOX(this.properties[1]);
        this.SetPOY(this.properties[2]);
        this.SetWidth(this.properties[3]);
        this.SetHeight(this.properties[4]);
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
	
	instanceProto.CreateItem = function(obj_type,x,y,z,layer)
	{
        return this.runtime.createInstance(obj_type, layer,this.LXYZ2PX(x,y,z),this.LXYZ2PY(x,y,z) );        
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
	    var dx = xyz_to.x - xyz_o.x;
	    var dy = xyz_to.y - xyz_o.y;
	    var angle;
        if (dy == 0)
            angle = (dx>0)? 0: 180;
        else if (dx == 0)
            angle = (dy>0)? 90: 270;
        else
            angle = cr.to_clamped_degrees(Math.atan2(dy,dx));	
        return angle;				 
	};
	instanceProto.XYZ2Dir = function(xyz_o, xyz_to)
	{  
	    var angle = this.XYZ2LA(xyz_o, xyz_to);
	    var dir = (angle==0)?   0:
	              (angle==90)?  1:
	              (angle==180)? 2:
	              (angle==270)? 3: 
	              null;  //fixme
        return dir;				 
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
	
	Exps.prototype.Width = function (ret)
	{
	    ret.set_float(this.width);
	};
	Exps.prototype.Height = function (ret)
    {
	    ret.set_float(this.height);
	};
	Exps.prototype.POX = function (ret)
	{
	    ret.set_float(this.PositionOX);
	};
	Exps.prototype.POY = function (ret)
    {
	    ret.set_float(this.PositionOY);
	};	
	Exps.prototype.DIRRIGHT = function (ret)
    {
	    ret.set_int(0);
	};		
	Exps.prototype.DIRDOWN = function (ret)
    {
	    ret.set_int(1);
	};		
	Exps.prototype.DIRLEFT = function (ret)
    {
	    ret.set_int(2);
	};		
	Exps.prototype.DIRUP = function (ret)
    {
	    ret.set_int(3);
	};	
}());