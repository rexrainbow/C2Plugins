// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ProjectionTx = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ProjectionTx.prototype;
		
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
        
        this.SetVectorU( this.properties[2], this.properties[3]);
        this.SetVectorV( this.properties[4], this.properties[5]);
        
        this.is_8dir = (this.properties[6] == 1);        
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
	instanceProto.SetVectorU = function(dx, dy)
	{
        this.UX = dx;
        this.UY = dy;
	}; 
	instanceProto.SetVectorV = function(dx, dy)
	{
        this.VX = dx;
        this.VY = dy;
	};	
    
	instanceProto.LXYZ2PX = function(lx, ly, lz)
	{
	    var x = (lx * this.UX) + (ly * this.VX);
        return x+this.PositionOX;
	};
	instanceProto.LXYZ2PY = function (lx, ly, lz)
	{
	    var y = (lx * this.UY) + (ly * this.VY);
        return y+this.PositionOY;
	};   

    // jcw_trace
	function InterceptSegment(s2x1, s2y1, s2x2, s2y2, s1x1, s1y1, s1x2, s1y2)
	{
		var s1dx = s1x2 - s1x1;
		var s1dy = s1y2 - s1y1;
		var s2dx = s2x2 - s2x1;
		var s2dy = s2y2 - s2y1;

		var den = s1dy * s2dx - s1dx * s2dy;
		if (den === 0) {return 0;}
		var num = (s1x1 - s2x1) * s1dy + (s2y1 - s1y1) * s1dx;
		return num / den;
	}
    // jcw_trace
    
	instanceProto.PXY2LX = function(px, py)
	{
        // offset to origin
		px -= this.PositionOX;
		py -= this.PositionOY;

        var lx = InterceptSegment(px,py, px-this.UX, py-this.UY, 0,0, this.VX,this.VY);
        return lx;
	};
	instanceProto.PXY2LY = function(px,py)
	{
        // offset to origin
		px -= this.PositionOX;
		py -= this.PositionOY;

        var ly = InterceptSegment(px,py, px-this.VX, py-this.VY, 0,0, this.UX,this.UY);
        return ly;
	};
	
    var map_01 = [[1,0], [0,1], [-1,0], [0,-1],
                  [1,1], [-1,1], [-1,-1], [1,-1]];   // Orthogonal or Isometric
	instanceProto.GetNeighborLX = function(x, y, dir)
	{
	    var dx = map_01[dir][0];
		return (x+dx);
	};

	var nly_map_2 = [1, 1, -1, -1, 2, 0, -2, 0];  // Staggered
	instanceProto.GetNeighborLY = function(x, y, dir)
	{
	    var dy = map_01[dir][1];
        return (y+dy);
	};
	
	instanceProto.GetDirCount = function()
	{  
        return (!this.is_8dir)? 4:8;						 
	};
	
	var dxy2dir = function (dx, dy, x, y)
	{
	    var dir = ((dx==1) && (dy==0))?  0:
	                  ((dx==0) && (dy==1))?  1:
	                  ((dx==-1) && (dy==0))? 2:
	                  ((dx==0) && (dy==-1))? 3:
                      ((dx==1) && (dy==1))?  4:
	                  ((dx==-1) && (dy==1))?  5:
	                  ((dx==-1) && (dy==-1))? 6:
	                  ((dx==1) && (dy==-1))? 7:
	                     null;
                                                          
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
	    var vmax = Math.max(quickAbs(dx), quickAbs(dy));
	    if (vmax != 0)
	    {
	        dx = dx/vmax;
	        dy = dy/vmax;
	    }
	    var dir = dxy2dir(dx, dy, xyz_o.x, xyz_o.y);  
        return dir;				 
	};
	
	instanceProto.NeighborXYZ2Dir = function(xyz_o, xyz_to)
	{  
	    var dx = xyz_to.x - xyz_o.x;
	    var dy = xyz_to.y - xyz_o.y;
	    var dir = dxy2dir(dx, dy, xyz_o.x, xyz_o.y);  
	    
	    if ((dir != null) && (!this.is_8dir) && (dir > 3))	    
	        dir = null;
	        
        return dir;				 
	};    
	
	instanceProto.LXYZRotate2LX = function (lx, ly, lz, dir)
	{
        var new_lx;
	    switch (dir)
	    {	        
	    case 1: new_lx = -ly; break;
	    case 2: new_lx = -lx; break;
	    case 3: new_lx = ly; break;
	    default: new_lx = lx; break;	            
	    }

        return new_lx;        
	};

	instanceProto.LXYZRotate2LY = function (lx, ly, lz, dir)
	{
        var new_ly;
	    switch (dir)
	    {
	    case 1: new_ly = lx; break;
	    case 2: new_ly = -ly; break;
	    case 3: new_ly = -lx; break;
	    default: new_ly = ly; break;	        
	    }

        return new_ly;        
	};  

	instanceProto.LXYZ2Dist = function (lx0, ly0, lz0, lx1, ly1, lz1, is_rough)
	{
        var dx = lx1 - lx0;
        var dy = ly1 - ly0;
        var d;
        if (!is_rough)
            d = Math.sqrt(dx*dx + dy*dy);
        else
            d = quickAbs(dx) + quickAbs(dy);
       return d;
	};  
	
	instanceProto.OffsetLX = function (lx0, ly0, lz0, offsetx, offsety, offsetz)
	{
        return lx0 + offsetx;
	}; 	 
	
	instanceProto.OffsetLY = function (lx0, ly0, lz0, offsetx, offsety, offsetz)
	{
        return ly0 + offsety;
	}; 
	
	function quickAbs(x)
	{
		return x < 0 ? -x : x;
	};   
	
	instanceProto.PXY2EdgePA = function (px1, py1, px0, py0)
	{
	    var a, a01 = cr.angleTo(px1, py1, px0, py0);;
	    a = a01;
		return a;
	};
	
	instanceProto.saveToJSON = function ()
	{
		return { 
            "ox": this.PositionOX,
            "oy": this.PositionOY,
            "ux": this.UX,
            "uy": this.UY,
            "vx": this.VX,
            "vy": this.VY,
            "is8d": this.is_8dir
                 };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        this.SetPOX(o["ox"]);
        this.SetPOY(o["oy"]); 
        this.SetVectorU(o["ux"], o["uy"]);
        this.SetVectorV(o["vx"], o["vy"]);        
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
   
    Acts.prototype.SetOffset = function (x, y)
    {        
        this.SetPOX(x);
        this.SetPOY(y);
	}; 
    
    Acts.prototype.SetVectorU = function (dx, dy)
    {        
        this.SetVectorU(dx, dy);
	};
    Acts.prototype.SetVectorV = function (dx, dy)
    {        
        this.SetVectorV(dx, dy);
	}; 
    
    Acts.prototype.SetDirections = function (d)
    {        
        this.is_8dir = (d==1);
	}; 	
	   
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.POX = function (ret)
	{
	    ret.set_float(this.PositionOX);
	};
	Exps.prototype.POY = function (ret)
    {
	    ret.set_float(this.PositionOY);
	};	
	Exps.prototype.UX = function (ret)
	{
	    ret.set_float(this.UX);
	};
	Exps.prototype.UY = function (ret)
	{
	    ret.set_float(this.UY);
	};  
	Exps.prototype.VX = function (ret)
	{
	    ret.set_float(this.VX);
	};
	Exps.prototype.VY = function (ret)
	{
	    ret.set_float(this.VY);
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
	
	Exps.prototype.LXY2PX = function (ret,lx,ly)
	{
        var px = this.LXYZ2PX(lx,ly,0);
	    ret.set_float(px);
	};
    
	Exps.prototype.LXY2PY = function (ret,lx,ly)
	{
        var py = this.LXYZ2PY(lx,ly,0);
	    ret.set_float(py);
	};	
	
	Exps.prototype.PXY2LX = function (ret,px,py)
	{
        var lx = this.PXY2LX(px,py);
	    ret.set_float(lx);
	};
    
	Exps.prototype.PXY2LY = function (ret,px,py)
	{
        var ly = this.PXY2LY(px,py);
	    ret.set_float(ly);
	};    
    
}());