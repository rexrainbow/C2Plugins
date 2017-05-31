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

    // reference - http://www.redblobgames.com/grids/hexagons/
    var ODD_R = 0;
    var EVEN_R = 1;
    var ODD_Q = 2;
    var EVEN_Q = 3;  
	instanceProto.onCreate = function()
	{
        this.check_name = "LAYOUT";
        this.SetPOX(this.properties[0]);
        this.SetPOY(this.properties[1]);
        this.SetWidth(this.properties[2]);
        this.SetHeight(this.properties[3]);
        
        var is_up2down = (this.properties[4]===1);
        var is_even = (this.properties[5]===1);
        this.SetOrientation(is_up2down, is_even);                                              
	};
	instanceProto.SetPOX = function(pox)
	{
        this.pox = pox;       
	}; 
	instanceProto.SetPOY = function(poy)
	{
        this.poy = poy;
	};   
	instanceProto.GetPOX = function()
	{
        return this.pox;       
	}; 
	instanceProto.GetPOY = function()
	{
        return this.poy;
	}; 	
	instanceProto.SetWidth = function(width)
	{
        this.width = width;
        this.halfWidth = width/2;        
	};
	instanceProto.SetHeight = function(height)
	{
        this.height = height; 
        this.halfHeight = height/2;
	}; 
	instanceProto.SetOrientation = function(is_up2down, is_even)
	{
        this.mode = (!is_up2down && !is_even)? ODD_R:
                    (!is_up2down &&  is_even)? EVEN_R:
                    ( is_up2down && !is_even)? ODD_Q:
                    ( is_up2down &&  is_even)? EVEN_Q:0;       
	};	
	
	instanceProto.qr2x = function(q, r)
	{
	    var x;
	    switch (this.mode)
	    {
	    case ODD_R:
	        x = q - (r - (r&1)) / 2;     
	    break;
	    
	    case EVEN_R:
	        x = q - (r + (r&1)) / 2;    	   	        
	    break;
	    
	    case ODD_Q:
	    case EVEN_Q:	    
	        x = q;
	    break;	    
	    }
        return x;
	};  
	
	instanceProto.qr2y = function(q, r)
	{
	    var x = this.qr2x(q, r);
	    var z = this.qr2z(q, r);
	    var y = -x-z;
        return y;
	};	
	
	instanceProto.qr2z = function(q, r)
	{
	    var z;
	    switch (this.mode)
	    {
	    case ODD_R:
	    case EVEN_R:
	        z = r; 
	    break;

	    case ODD_Q:
	        z = r - (q - (q&1)) / 2;
	    break;
	    case EVEN_Q:	    
	        z = r - (q + (q&1)) / 2;
	    break;	    
	    }
        return z;
	}; 
	
	instanceProto.xyz2q = function(x, y, z)
	{
	    var q;
	    switch (this.mode)
	    {
	    case ODD_R:
	        q = x + (z - (z&1)) / 2;
	    break;
	    case EVEN_R:
	        q = x + (z + (z&1)) / 2;
	    break;

	    case ODD_Q:
	    case EVEN_Q:
	        q = x;
	    break;	    
	    }
        return q;
	}; 
		
	instanceProto.xyz2r = function(x, y, z)
	{
	    var r;
	    switch (this.mode)
	    {
	    case ODD_R:
	    case EVEN_R:
	        r = z; 
	    break;

	    case ODD_Q:
	        r = z + (x - (x&1)) / 2;
	    break;
	    case EVEN_Q:	    
	        r = z + (x + (x&1)) / 2;
	    break;	    
	    }
        return r;
	};  
			
	instanceProto.LXYZ2PX = function(lx, ly, lz)
	{
	    var px;
	    switch (this.mode)
	    {
	    case ODD_R:
	        px = (lx*this.width) + this.pox;
	        if (ly&1)
	            px += this.halfWidth;	        
	    break;
	    
	    case EVEN_R:
	        px = (lx*this.width) + this.pox;
	        if (ly&1)
	            px -= this.halfWidth;	   	        
	    break;
	    
	    case ODD_Q:
	    case EVEN_Q:	    
	        px = (lx*this.width) + this.pox;
	    break;	    
	    }
        return px;
	};
	instanceProto.LXYZ2PY = function(lx, ly, lz)
	{
	    var py;
	    switch (this.mode)
	    {
	    case ODD_R:
	    case EVEN_R:
	        py = (ly*this.height) + this.poy;	        
	    break;
	    
	    case ODD_Q:
	        py = (ly*this.height) + this.poy;
	        if (lx&1)
	            py += this.halfHeight;	        
	    break;
	    
	    case EVEN_Q:	    
	        py = (ly*this.height) + this.poy;
	        if (lx&1)
	            py -= this.halfHeight;	  	        
	    break;	    
	    }
        return py;
	};   
	instanceProto.PXY2LX = function(px, py)
	{
	    var lx;
	    var offx=px-this.pox;
	    switch (this.mode)
	    {
	    case ODD_R:
	    case EVEN_R:
	        var ly = this.PXY2LY( px, py );
	        if (ly&1)
	        {
	            if (this.mode == ODD_R)
	                offx -= this.halfWidth;
	            else
	                offx += this.halfWidth;
	        } 	        
	    break;   
	    }	       
	    lx = Math.round( offx/this.width );
		return lx;
	};
	instanceProto.PXY2LY = function(px, py)
	{
	    var ly;
	    var offy=py-this.poy;
	    switch (this.mode)
	    {
	    case ODD_Q:
	    case EVEN_Q:	
	        var lx = this.PXY2LX( px, py );
	        if (lx&1)
	        {
	            if (this.mode == ODD_Q)
	                offy -= this.halfHeight;
	            else
	                offy += this.halfHeight;
	        } 	        
	    break;   
	    }	       
	    ly = Math.round( offy/this.height );
	    return ly;
	};
	
	var dir2dxy_ODD_R = [
	    [ [+1,  0], [ 0, +1], [-1, +1],
          [-1,  0], [-1, -1], [ 0, -1] ],          
        [ [+1,  0], [+1, +1], [ 0, +1],
          [-1,  0], [ 0, -1], [+1, -1] ]
    ];
    var dir2dxy_EVEN_R = [
        [ [+1,  0], [+1, +1], [ 0, +1],
          [-1,  0], [ 0, -1], [+1, -1] ],          
        [ [+1,  0], [ 0, +1], [-1, +1],
          [-1,  0], [-1, -1], [ 0, -1] ]
    ];
	var dir2dxy_ODD_Q = [
        [ [+1,  0], [ 0, +1], [-1,  0],
          [-1, -1], [ 0, -1], [+1, -1] ],          
        [ [+1, +1], [ 0, +1], [-1, +1],
          [-1,  0], [ 0, -1], [+1,  0] ]
    ];
    var dir2dxy_EVEN_Q = [
        [ [+1, +1], [ 0, +1], [-1, +1],
          [-1,  0], [ 0, -1], [+1,  0] ],          
        [ [+1,  0], [ 0, +1], [-1,  0],
          [-1, -1], [ 0, -1], [+1, -1] ]
    ];
	var neighbors = [dir2dxy_ODD_R,
	                 dir2dxy_EVEN_R,
	                 dir2dxy_ODD_Q,
	                 dir2dxy_EVEN_Q];
	                 
	// reverse dir2dxy to dxy2dir
    var dxy2dir_ODD_R = [];
    var dxy2dir_EVEN_R = []; 
    var dxy2dir_ODD_Q = [];
    var dxy2dir_EVEN_Q = []; 
    var dxy2dir_map = {0:dxy2dir_ODD_R,
                       1:dxy2dir_EVEN_R,
                       2:dxy2dir_ODD_Q,
                       3:dxy2dir_EVEN_Q};
    
    var dxy2dir_gen = function (dir2dxy_in, dxy2dir_out)
    {
        var p,dir;
        var dx,dy;                    
        for (p=0; p<2; p++)
        { 
            var _dxy2dir = {};
            for (dir=0; dir<6; dir++)
            {
                dx = dir2dxy_in[p][dir][0];
                dy = dir2dxy_in[p][dir][1];
                if (!_dxy2dir.hasOwnProperty(dx))
                    _dxy2dir[dx] = {};
                _dxy2dir[dx][dy] = dir;
            }   
            dxy2dir_out.push(_dxy2dir);                 
        }
    }
    dxy2dir_gen(dir2dxy_ODD_R, dxy2dir_ODD_R);
    dxy2dir_gen(dir2dxy_EVEN_R, dxy2dir_EVEN_R);    
    dxy2dir_gen(dir2dxy_ODD_Q, dxy2dir_ODD_Q);
    dxy2dir_gen(dir2dxy_EVEN_Q, dxy2dir_EVEN_Q);      

	instanceProto.get_neighbor = function(q, r, dir)
	{	    
	    var parity;
	    switch (this.mode)
	    {
	    case ODD_R:
	    case EVEN_R:
	        parity = r & 1;	        
	    break;
	    
	    case ODD_Q:
	    case EVEN_Q:
	        parity = q & 1; 	        
	    break;	    
	    }
	    var d = neighbors[this.mode][parity][dir];	   	   
		return d;
	};
	 	
	instanceProto.GetNeighborLX = function(q, r, dir)
	{  	   
		return q + this.get_neighbor(q, r, dir)[0];
	};
	
	instanceProto.GetNeighborLY = function(q, r, dir)
	{	    
		return r + this.get_neighbor(q, r, dir)[1];
	};
		
	instanceProto.GetDirCount = function()
	{  
        return 6;						 
	};
	
	var dxy2dir = function (dq, dr, q, r, mode)
	{
	    var parity;
	    switch (mode)
	    {
	    case ODD_R:
	    case EVEN_R:
	        parity = r & 1;	        
	    break;
	    
	    case ODD_Q:
	    case EVEN_Q:
	        parity = q & 1; 	        
	    break;	    
	    }
	    var _dxy2dir = dxy2dir_map[mode][parity];
	    
	    if (!_dxy2dir.hasOwnProperty(dq))
	        return null;
	    if (!_dxy2dir[dq].hasOwnProperty(dr))
	        return null;
	    
	    return _dxy2dir[dq][dr];
	};
	
	instanceProto.XYZ2LA = function(xyz_o, xyz_to)
	{  
        var dir = this.XYZ2Dir(xyz_o, xyz_to); 
	    var angle = (dir != null)? (dir*60):(-1);
	    switch (this.mode)  
	    {
	    case ODD_Q:
	    case EVEN_Q:
	        if (dir != null)
	            angle += 30; 	        
	    break;	    
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

	    var dir = dxy2dir(dx, dy, xyz_o.x, xyz_o.y, this.mode); 
	    return dir;  
	};
	
	instanceProto.NeighborXYZ2Dir = function(xyz_o, xyz_to)
	{
	    var dx = xyz_to.x - xyz_o.x;
	    var dy = xyz_to.y - xyz_o.y;
	    var dir = dxy2dir(dx, dy, xyz_o.x, xyz_o.y, this.mode); 
	    return dir;  
	};	
	
	var rotate_result = {q:0, r:0};
	instanceProto.hex_rotate = function (q, r, dir)
	{
	    var x = this.qr2x(q,r);
	    var y = this.qr2y(q,r);
	    var z = this.qr2z(q,r);
	    var new_x, new_y, new_z;
	    switch (dir)
	    {
	    case 1: new_x=-z; new_y=-x; new_z=-y; break;
	    case 2: new_x= y; new_y= z; new_z= x; break;
	    case 3: new_x=-x; new_y=-y; new_z=-z; break;
	    case 4: new_x= z; new_y= x; new_z= y; break;
	    case 5: new_x=-y; new_y=-z; new_z=-x; break;
	    default: new_x= x; new_y= y; new_z= z; break;
	    }
	    rotate_result.q = this.xyz2q(new_x, new_y, new_z);
	    rotate_result.r = this.xyz2r(new_x, new_y, new_z);
	    return rotate_result;
	};
	instanceProto.LXYZRotate2LX = function (lx, ly, lz, dir)
	{	  
	    return this.hex_rotate(lx, ly, dir).q;
	};

	instanceProto.LXYZRotate2LY = function (lx, ly, lz, dir)
	{
	    return this.hex_rotate(lx, ly, dir).r;
	};	

	instanceProto.LXYZ2Dist = function (q0, r0, s0, q1, r1, s1)
	{       
        var dx = this.qr2x(q1,r1) - this.qr2x(q0,r0);
        var dy = this.qr2y(q1,r1) - this.qr2y(q0,r0);
	    var dz = this.qr2z(q1,r1) - this.qr2z(q0,r0);
        
        return (quickAbs(dx) + quickAbs(dy) + quickAbs(dz)) / 2
	};   
	
	instanceProto.OffsetLX = function (lx0, ly0, lz0, offsetx, offsety, offsetz)
	{
	    var new_lx = lx0 + offsetx;
	   
        switch (this.mode)
        {
        case ODD_R:
            if ((offsety&1) !== 0)
            {
                var new_ly = ly0 + offsety;
                if ((new_ly&1) === 0)
                    new_lx += 1;
            }
        break;
        
        case EVEN_R:
            if ((offsety&1) !== 0)
            {
                var new_ly = ly0 + offsety;
                if ((new_ly&1) === 0)
                    new_lx -= 1;
            }
        break;                 
        }

        return new_lx;
	}; 	 
	
	instanceProto.OffsetLY = function (lx0, ly0, lz0, offsetx, offsety, offsetz)
	{	    
	    var new_ly = ly0 + offsety;
	   
        switch (this.mode)
        {
        case ODD_Q:
            if ((offsetx&1) !== 0)
            {
                var new_lx = lx0 + offsetx;
                if ((new_lx&1) == 0)
                    new_ly += 1;
            }
        break;
        
        case EVEN_Q:
            if ((offsetx&1) !== 0)
            {
                var new_lx = lx0 + offsetx;
                if ((new_lx&1) == 0)
                    new_ly -= 1;
            }
        break;                 
        }

        return new_ly;
	};	    

	function quickAbs(x)
	{
		return x < 0 ? -x : x;
	};
	
	instanceProto.PXY2EdgePA = function (px1, py1, px0, py0)
	{
		return cr.angleTo(px1, py1, px0, py0);
	}; 		
	
	instanceProto.saveToJSON = function ()
	{
		return { "m": this.mode,
                 "w": this.width,
                 "h": this.height,
                 "ox": this.pox,
                 "oy": this.poy
                 };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        this.mode = o["m"];    
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
    Acts.prototype.SetOrientation = function (is_updown, is_indent)
    {        
        this.SetOrientation((is_updown===1), (is_indent===1));      
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
	    ret.set_float(this.pox);
	};
	Exps.prototype.POY = function (ret)
    {
	    ret.set_float(this.poy);
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