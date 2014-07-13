// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGHexTx = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SLGHexTx.prototype;
		
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
        this.SetPOX(this.properties[0]);
        this.SetPOY(this.properties[1]);
        this.SetWidth(this.properties[2]);
        this.SetHeight(this.properties[3]);
        this.is_up2down = (this.properties[4]==1);
        this.indent_first = this.properties[5];
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
	    var px;
	    if (this.is_up2down)
	        px = (logic_x*this.width)+this.PositionOX;
	    else
	        px = (logic_x*this.width)+((logic_y%2)*this.half_width)+this.PositionOX;
        return px;
	};
	instanceProto.LXYZ2PY = function(logic_x, logic_y, logic_z)
	{
	    var py;
	    if (this.is_up2down)
	        py = (logic_y*this.height)+((logic_x%2)*this.half_height)+this.PositionOY;
	    else
	        py = (logic_y*this.height)+this.PositionOY;
        return py;
	};   
	instanceProto.PXY2LX = function(physical_x,physical_y)
	{
	    var lx;
	    if (this.is_up2down)
	        lx = Math.round((physical_x-this.PositionOX)/this.width);
	    else
	    {
	        var ly = this.PXY2LY(physical_x,physical_y);
		    lx = Math.round((physical_x - this.PositionOX - ((ly%2)*this.half_width))/this.width);
	    }	    
		return lx;
	};
	instanceProto.PXY2LY = function(physical_x,physical_y)
	{
	    var ly;
	    if (this.is_up2down)
	    {
	        var lx = this.PXY2LX(physical_y,physical_x);
		    ly = Math.round((physical_y - this.PositionOY - ((lx%2)*this.half_height))/this.height); 
	    }
	    else
	        ly = Math.round((physical_y-this.PositionOY)/this.height);
	    return ly;
	};
	
	var nlx_map_ud = [1, 0, -1, -1, 0, 1];
	var nlx_map_lr_0 = [1, 0, -1, -1, -1, 0];
	var nlx_map_lr_1 = [1, 1, 0, -1, 0, 1];		
	instanceProto.GetNeighborLX = function(x, y, dir)
	{
	    var dx;
	    if (this.is_up2down)
	    {
	        dx = nlx_map_ud[dir];  
	    }
	    else
	    {
	        dx = ((y%2) == 0)? nlx_map_lr_0[dir]:
	                           nlx_map_lr_1[dir];
	    }	   
		return (x+dx);
	};
	
	var nly_map_ud_0 = [0, 1, 0, -1, -1, -1];
	var nly_map_ud_1 = [1, 1, 1, 0, -1, 0];
	var nly_map_lr = [0, 1, 1, 0, -1, -1];	
	instanceProto.GetNeighborLY = function(x, y, dir)
	{
	    var dy;
	    if (this.is_up2down)
	    {
	        dy = ((x%2) == 0)? nly_map_ud_0[dir]:
	                           nly_map_ud_1[dir];        
	    }
		else
		{
		    dy = nly_map_lr[dir];
		}          
        return (y+dy);						 
	};	
	instanceProto.GetDirCount = function()
	{  
        return 6;						 
	};
	
	var dxy2dir = function (dx, dy, x, y, is_up2down)
	{
	    var dir;
	    if (is_up2down)
	    {
	        if ((x%2) == 1)
	        {
	            dir = ((dx==1) && (dy==1))?   0:
                      ((dx==0) && (dy==1))?   1:
	                  ((dx==-1) && (dy==1))?  2:
                      ((dx==-1) && (dy==0))?  3:
	                  ((dx==0) && (dy==-1))?  4: 
	                  ((dx==1) && (dy==0))?   5:
	                  null;  //fixme
	        }		 
	        else
	        {
	            dir = ((dx==1) && (dy==0))?   0:
                      ((dx==0) && (dy==1))?   1:
	                  ((dx==-1) && (dy==0))?  2:
                      ((dx==-1) && (dy==-1))? 3:
	                  ((dx==0) && (dy==-1))?  4:
	                  ((dx==1) && (dy==-1))?  5: 
	                  null;	 //fixme
	        }
	    }
	    else
	    {
	        if ((y%2) == 1)
	        {
	            dir = ((dx==1) && (dy==0))?   0:
	                  ((dx==1) && (dy==1))?   1:
                      ((dx==0) && (dy==1))?   2:
	                  ((dx==-1) && (dy==0))?  3:
                      ((dx==0) && (dy==-1))?  4:
	                  ((dx==1) && (dy==-1))?  5: 
	                  null;  //fixme
	        }		 
	        else
	        {
	            dir = ((dx==1) && (dy==0))?   0:
	                  ((dx==0) && (dy==1))?   1:
                      ((dx==-1) && (dy==1))?  2:
	                  ((dx==-1) && (dy==0))?  3:
                      ((dx==-1) && (dy==-1))? 4:
	                  ((dx==0) && (dy==-1))?  5: 
	                  null;	 //fixme
	        }     
	    }	
        
        return dir;
	};
	instanceProto.XYZ2LA = function(xyz_o, xyz_to)
	{  
	    var dx = xyz_to.x - xyz_o.x;
	    var dy = xyz_to.y - xyz_o.y;	    
	    var vmax = Math.max(Math.abs(dx), Math.abs(dy));
	    if (vmax != 0)
	    {
	        dx = dx/vmax;
	        dy = dy/vmax;
	    }

	    var dir = dxy2dir(dx, dy, xyz_o.x, xyz_o.y, this.is_up2down); 
	    var angle;	    
	    if (this.is_up2down)
	    {
	        angle = (dir != null)? ((dir*60)+30):
	                               (-1);
	    }
	    else
	    {
	        angle = (dir != null)? dir*60:
	                               (-1);
	    }
        return angle;				 
	};
	instanceProto.XYZ2Dir = function(xyz_o, xyz_to)
	{  
	    var dx = xyz_to.x - xyz_o.x;
	    var dy = xyz_to.y - xyz_o.y;	    
	    var vmax = Math.max(Math.abs(dx), Math.abs(dy));
	    if (vmax != 0)
	    {
	        dx = dx/vmax;
	        dy = dy/vmax;
	    }
	    
	    var dir = dxy2dir(dx, dy, xyz_o.x, xyz_o.y, this.is_up2down);  
	    return dir;
	};		
	
	instanceProto.saveToJSON = function ()
	{
		return { "isud": this.is_up2down,
                 "w": this.width,
                 "h": this.height,
                 "ox": this.PositionOX,
                 "oy": this.PositionOY
                 };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        this.is_up2down = o["isud"];    
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
	
	Exps.prototype.DIRLRRIGHT = function (ret)
    {
	    ret.set_int(0);
	};		
	Exps.prototype.DIRLRDOWNRIGHT = function (ret)
    {
	    ret.set_int(1);
	};		
	Exps.prototype.DIRLRDOWNLEFT = function (ret)
    {
	    ret.set_int(2);
	};		
	Exps.prototype.DIRLRLEFT = function (ret)
    {
	    ret.set_int(3);
	};	
	Exps.prototype.DIRLRUPLEFT = function (ret)
    {
	    ret.set_int(4);
	};		
	Exps.prototype.DIRLRUPRIGHT = function (ret)
    {
	    ret.set_int(5);
	};	
	Exps.prototype.DIRUDDOWNRIGHT = function (ret)
    {
	    ret.set_int(0);
	};		
	Exps.prototype.DIRUDDOWN = function (ret)
    {
	    ret.set_int(1);
	};		
	Exps.prototype.DIRUDDOWNLEFT = function (ret)
    {
	    ret.set_int(2);
	};		
	Exps.prototype.DIRUDUPLEFT = function (ret)
    {
	    ret.set_int(3);
	};	
	Exps.prototype.DIRUDUP = function (ret)
    {
	    ret.set_int(4);
	};		
	Exps.prototype.DIRUDUPRIGHT = function (ret)
    {
	    ret.set_int(5);
	};	
}());