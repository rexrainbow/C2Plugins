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
        this.layout_mode = this.properties[0];
        this.is_8dir = (this.properties[5] == 1);
                
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
	instanceProto.LXYZ2PX = function(lx, ly, lz)
	{
	    var x;
	    if (this.layout_mode == 0)  // Orthogonal
	    {
	        x = lx * this.width;
	    }
	    else if (this.layout_mode == 1)  // Isometric
	    {
	        x = (lx - ly) * this.half_width;
	    }
	    else if (this.layout_mode == 2)  // Staggered
	    {
	        x = lx * this.width;
	        if (ly&1)
	            x += this.half_width;
	    }

        return x+this.PositionOX;
	};
	instanceProto.LXYZ2PY = function (lx, ly, lz)
	{
	    var y;
	    if (this.layout_mode == 0)  // Orthogonal
	    {
	        y = ly * this.height;
	    }
	    else if (this.layout_mode == 1)  // Isometric
	    {
	        y = (lx + ly) * this.half_height;
	    }
	    else if (this.layout_mode == 2)  // Staggered
	    {
	        y = ly * this.half_height;
	    }

        return y+this.PositionOY;
	};   
	instanceProto.PXY2LX = function(px, py)
	{
	    var lx;
	    if (this.layout_mode == 0)   // Orthogonal
	    {
	        px -= this.PositionOX;
	        lx = Math.round(px/this.width);
	    }
	    else if (this.layout_mode == 1)   // Isometric
		{
		    px -= this.PositionOX;
		    py -= this.PositionOY;
		    lx = 0.5 * (Math.round(py/this.half_height) + Math.round(px/this.half_width));
		}
		else if (this.layout_mode == 2)  // Staggered
		{
		    var ly = Math.round((py - this.PositionOY)/this.half_height);
		    px = px - this.PositionOX;
		    if (ly&1)
		        px -= this.half_width;
		    lx = Math.round(px/this.width);
		}
		    
        return lx;
	};
	instanceProto.PXY2LY = function(px,py)
	{
	    var ly;
	    if (this.layout_mode == 0)   // Orthogonal
	    {
	        py -= this.PositionOY;
	        ly = Math.round(py/this.height);
	    }
	    else if (this.layout_mode == 1)   // Isometric
		{
		    px -= this.PositionOX;
		    py -= this.PositionOY;
		    ly = 0.5 * (Math.round(py/this.half_height) - Math.round(px/this.half_width));
		}
		else if (this.layout_mode == 2)  // Staggered
	    {
		    ly = Math.round((py - this.PositionOY)/this.half_height);
		}
		    
        return ly;
	};
	
    var map_01 = [[1,0], [0,1], [-1,0], [0,-1],
                  [1,1], [-1,1], [-1,-1], [1,-1]];   // Orthogonal or Isometric
	var nlx_map_2_0 = [0, -1, -1, 0, 0, -1, 0, 1]; // Staggered (y%2==0)
	var nlx_map_2_1 = [1, 0, 0, 1, 0, -1, 0, 1]; // Staggered (y%2==1)
	instanceProto.GetNeighborLX = function(x, y, dir)
	{
	    var dx;
	    if (this.layout_mode == 0)   // Orthogonal
	    {
	        dx = map_01[dir][0];
	    }
	    else if (this.layout_mode == 1)   // Isometric
		{
	        dx = map_01[dir];
		}
		else if (this.layout_mode == 2)  // Staggered
	    {
	        if (y&1)
	            dx = nlx_map_2_1[dir];
	        else
	            dx = nlx_map_2_0[dir];
		}
		
		return (x+dx);
	};

	var nly_map_2 = [1, 1, -1, -1, 2, 0, -2, 0];  // Staggered
	instanceProto.GetNeighborLY = function(x, y, dir)
	{
	    var dy;
	    if (this.layout_mode == 0)   // Orthogonal
	    {
	        dy = map_01[dir][1];
	    }
	    else if (this.layout_mode == 1)   // Isometric
		{
	        dy = map_01[dir][1];
		}
		else if (this.layout_mode == 2)  // Staggered
	    {
	        dy = nly_map_2[dir];
		} 
        return (y+dy);
	};
	
	instanceProto.GetDirCount = function()
	{  
        return (!this.is_8dir)? 4:8;						 
	};
	
	var dxy2dir = function (dx, dy, x, y, layout_mode)
	{
	    var dir;
	    if (layout_mode == 0)   // Orthogonal
	    {
	        dir = ((dx==1) && (dy==0))?  0:
	              ((dx==0) && (dy==1))?  1:
	              ((dx==-1) && (dy==0))? 2:
	              ((dx==0) && (dy==-1))? 3:
                  ((dx==1) && (dy==1))?  4:
	              ((dx==-1) && (dy==1))?  5:
	              ((dx==-1) && (dy==-1))? 6:
	              ((dx==1) && (dy==-1))? 7:
	                                     null;
	    }
	    else if (layout_mode == 1)   // Isometric
		{
	        dir = ((dx==1) && (dy==0))?  0:
	              ((dx==0) && (dy==1))?  1:
	              ((dx==-1) && (dy==0))? 2:
	              ((dx==0) && (dy==-1))? 3:
                  ((dx==1) && (dy==1))?  4:
	              ((dx==-1) && (dy==1))?  5:
	              ((dx==-1) && (dy==-1))? 6:
	              ((dx==1) && (dy==-1))? 7:
	                                     null;
		}
		else if (layout_mode == 2)  // Staggered
	    {
	        if (y&1)
	        {
	            dir = ((dx==1) && (dy==-1))?  0:
	                  ((dx==1) && (dy==1))?   1:
	                  ((dx==0) && (dy==1))?   2:
	                  ((dx==0) && (dy==-1))?  3:
	                  ((dx==0) && (dy==2))?  4:
	                  ((dx==-1) && (dy==0))?  5:
	                  ((dx==0) && (dy==-2))? 6:
	                  ((dx==1) && (dy==-0))? 7:
	                                          null;  	            
	        }
	        else
	        {
	            dir = ((dx==0) && (dy==-1))?  0:
	                  ((dx==0) && (dy==1))?   1:
	                  ((dx==-1) && (dy==1))?  2:
	                  ((dx==-1) && (dy==-1))? 3:
	                  ((dx==0) && (dy==2))?  4:
	                  ((dx==-1) && (dy==0))?  5:
	                  ((dx==0) && (dy==-2))? 6:
	                  ((dx==1) && (dy==-0))? 7:
	                                          null;	            
	        }
		} 
		return dir;			   
	};
		
	instanceProto.XYZ2LA = function(xyz_o, xyz_to)
	{  
	    var dir = this.XYZ2Dir(xyz_o, xyz_to); 
        var angle;
        if (dir == null)
            angle = -1;
        else
        {
            if (dir < 4)
                angle = dir*90;
            else
                angle = (dir - 4)*90 + 45;
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
	    var dir = dxy2dir(dx, dy, xyz_o.x, xyz_o.y, this.layout_mode);  
        return dir;				 
	};
	
	instanceProto.NeighborXYZ2Dir = function(xyz_o, xyz_to)
	{  
	    var dx = xyz_to.x - xyz_o.x;
	    var dy = xyz_to.y - xyz_o.y;
	    var dir = dxy2dir(dx, dy, xyz_o.x, xyz_o.y, this.layout_mode);  
	    
	    if ((dir != null) && (!this.is_8dir) && (dir > 3))	    
	        dir = null;
	        
        return dir;				 
	};    
	
	instanceProto.LXYZRotate2LX = function (lx, ly, lz, dir)
	{
        var new_lx;
        switch (this.layout_mode)
        {
        case 0:    // Orthogonal
        case 1:    // Isometric
	        switch (dir)
	        {	        
	        case 1: new_lx = -ly; break;
	        case 2: new_lx = -lx; break;
	        case 3: new_lx = ly; break;
	        default: new_lx = lx; break;	            
	        }
        break;
            
        case 2:
        break;
        }	

        return new_lx;        
	};

	instanceProto.LXYZRotate2LY = function (lx, ly, lz, dir)
	{
        var new_ly;
        switch (this.layout_mode)
        {
        case 0:    // Orthogonal
        case 1:    // Isometric
	        switch (dir)
	        {
	        case 1: new_ly = lx; break;
	        case 2: new_ly = -ly; break;
	        case 3: new_ly = -lx; break;
	        default: new_ly = ly; break;	        
	        }
        break;
            
        case 2:
        break;
        }	

        return new_ly;        
	};    
	
	instanceProto.saveToJSON = function ()
	{
		return { "iso": this.layout_mode,
                 "w": this.width,
                 "h": this.height,
                 "ox": this.PositionOX,
                 "oy": this.PositionOY,
                 "is8d": this.is_8dir};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.layout_mode = o["iso"];
        this.SetWidth(o["w"]);
        this.SetHeight(o["h"]);   
        this.SetPOX(o["ox"]);
        this.SetPOY(o["oy"]); 
        this.is_8dir = o["is8d"];         
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();  
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetOrientation = function (m)
    {        
        this.layout_mode = m;
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
    Acts.prototype.SetDirections = function (d)
    {        
        this.is_8dir = (d==1);
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
	Exps.prototype.DIRRIGHTDOWN = function (ret)
    {
	    ret.set_int(4);
	};		
	Exps.prototype.DIRLEFTDOWN = function (ret)
    {
	    ret.set_int(5);
	};		
	Exps.prototype.DIRLEFTUP = function (ret)
    {
	    ret.set_int(6);
	};		
	Exps.prototype.DIRRIGHTUP = function (ret)
    {
	    ret.set_int(7);
	};	
}());