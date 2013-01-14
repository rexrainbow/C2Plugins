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
	};   
	instanceProto.LXYZ2PX = function(logic_x, logic_y, logic_z)
	{
        return (logic_x*this.width)+((logic_y%2)*this.half_width)+this.PositionOX;
	};
	instanceProto.LXYZ2PY = function(logic_x, logic_y, logic_z)
	{
        return (logic_y*this.height)+this.PositionOY;
	};   
	instanceProto.PXY2LX = function(physical_x,physical_y)
	{
	    var ly = this.PXY2LY(physical_x,physical_y);
		var lx = Math.round((physical_x - this.PositionOX - ((ly%2)*this.half_width))/this.width);
		return lx;
	};
	instanceProto.PXY2LY = function(physical_x,physical_y)
	{
	    return Math.round((physical_y-this.PositionOY)/this.height);
	};	
	instanceProto.CreateItem = function(obj_type,x,y,z,layer)
	{
        return this.runtime.createInstance(obj_type, layer,this.LXYZ2PX(x,y,z),this.LXYZ2PY(x,y,z) );        
	}; 	
	instanceProto.GetNeighborLX = function(x, y, dir)
	{
	    var dx;
	    if ((y%2) == 1)
		{
		    dx = ((dir==0) || (dir==1) || (dir==5))? 1:
			     (dir==3)?                          (-1):
                                                   0;
        }												  
        else
		{
		    dx = ((dir==2) || (dir==3) || (dir==4))? (-1):
			     (dir==0)?                           1:
                                                     0;
        }
		return (x+dx);
	};
	instanceProto.GetNeighborLY = function(x, y, dir)
	{
        var dy = ((dir==1) || (dir==2))? 1:
			     ((dir==4) || (dir==5))? (-1):
                                         0;        
        return (y+dy);						 
	};	
	instanceProto.GetDirCount = function()
	{  
        return 6;						 
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

	    
	    var angle;
	    if ((xyz_o.y%2) == 1)
	    {
	        angle = ((dx==1) && (dy==0))?    0:
	                ((dx==1) && (dy==1))?   60:
                    ((dx==0) && (dy==1))?  120:
	                ((dx==-1) && (dy==0))? 280:
                    ((dx==0) && (dy==-1))? 240:
	                ((dx==1) && (dy==-1))? 300: 
	                (-1); //fixme
	    }		 
	    else
	    {
	        angle = ((dx==1) && (dy==0))?     0:
	                ((dx==0) && (dy==1))?    60:
                    ((dx==-1) && (dy==1))?  120:
	                ((dx==-1) && (dy==0))?  280:
                    ((dx==-1) && (dy==-1))? 240:
	                ((dx==0) && (dy==-1))?  300:
	                (-1); //fixme
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
	    
	    var dir;
	    if ((xyz_o.y%2) == 1)
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
	    return dir;
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

}());