// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Spline = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Spline.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	};
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;       
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.enabled = (this.properties[0] === 1);
        this.speed = this.properties[1];
        this.setAngle = (this.properties[2] !== 0);        
        this.isLooping = (this.properties[3] === 1);       
        this.tension = this.properties[4];
        
        if (!this.recycled)
        {
            this.points = [];
            this.curSeg = {ptr:-1, t:1,
                                  p0:null, p1:null, p2:null, p3:null,
                                  dist:0,                            
                                  preX:0,
                                  preY:0};
        } 
    
        this.traveledDist = 0;    
        this.movingAngle = 0;        
        this.is_moving = false;
        this.is_my_call = false;
	};
    
	behinstProto.onDestroy = function ()
	{
        this.curSeg.p0 = null;
        this.curSeg.p1 = null;   
        this.curSeg.p2 = null;
        this.curSeg.p3 = null;         
        this.points.length = 0;
	}; 
    
	behinstProto.tick = function ()
	{
        if (!this.enabled || !this.is_moving)
            return;

        this.move();
	}; 
    
	behinstProto.move = function (dt)
	{
        if (dt == null)
            dt = this.runtime.getDt(this.inst);
        if ((dt === 0) || (this.speed == 0))
            return;
        
        var tickMovingDist = this.speed*dt;
        var tMD2 = tickMovingDist*tickMovingDist;
        var sTickMovingDist=tickMovingDist/20;
        var segDist=null, t; 
        var x0=this.inst.x, y0=this.inst.y;
        var seg, nx, ny, dist, dist2, i=0;
        var preX, preY, preDist2, preSegT;
        while (1)
        {
            seg = this.getSeg();
            if (seg == null)            
                break;            
            if (seg.dist === 0)
                continue;
            if (segDist !== seg.dist)
            {
                segDist = seg.dist
                t = (sTickMovingDist/segDist);
                if (t > 0.5)
                    t = 0.5;  // 2 points at least
            }
            
            seg.t += t;
            i++;
            if (seg.t >= 1)
            {
                seg.t = 1;
                nx = seg.p2[0];
                ny = seg.p2[1];
            }
            else
            {
                nx=interpolate(seg, 0, this.tension);
                ny=interpolate(seg, 1, this.tension);
            }
                
            dist2 = distance2(x0, y0, nx, ny);
            if (dist2 >= tMD2)
            {
                if (Math.abs(preDist2 - tMD2) < Math.abs(dist2 - tMD2))
                {
                    nx = preX;
                    ny = preY;
                    dist2 = preDist2;
                    seg.t = preSegT;
                }

                dist = Math.sqrt(dist2);
                this.traveledDist += dist;
                this.inst.x = nx;
                this.inst.y = ny;

                // debug
                //var diff = Math.abs(dist-tickMovingDist)/tickMovingDist;
                //diff = Math.floor(diff*100)/100;
                //if (diff < 1)
                //    console.log(tickMovingDist + "," + dist+ " :" + diff + "; " + i);     
                //else
                //    console.warn(tickMovingDist + "," + dist+ " :" + diff + "; " + i);  

                break;
            }
            else
            {
                preX = nx;
                preY = ny;
                preDist2 = dist2;
                preSegT = (seg.t === 1)? 0:seg.t;
            }
        } // while(1)
                   
        if ((x0 === this.inst.x) && (y0 === this.inst.y))
            this.movingAngle = this.inst.angle;
        else            
            this.movingAngle = cr.angleTo(x0, y0, this.inst.x, this.inst.y);
        
        if (this.setAngle)
            this.inst.angle = this.movingAngle;
        
        if (this.speed !== 0)
        {
            this.inst.set_bbox_changed();
        
            if (seg == null)
            {
                this.onReachLastPoint();
            }
            else
            {
                seg.preX = nx;
                seg.preY = ny;
            }
        }
	};     

    var distance2 = function(x0, y0, x1, y1)
    {
        var dx = (x1-x0);
        var dy = (y1-y0);
        return dx*dx + dy*dy;
    }

	behinstProto.start = function ()
	{
        this.curSeg.ptr = -1;
        this.curSeg.t = 1;
        this.traveledDist = 0;
        this.is_moving = true;
        
        var seg = this.getSeg();
        if (seg === null)
            this.onReachLastPoint();
	}; 
    
	behinstProto.onReachLastPoint = function ()
	{
        if (!this.is_moving)
            return;
        
        this.is_moving = false;  // stop
        this.is_my_call = true;
        this.runtime.trigger(cr.behaviors.Rex_Spline.prototype.cnds.OnHitTarget, this.inst); 
        this.is_my_call = false;
	};     
    
	behinstProto.hitPoint = function ()
	{
        this.is_my_call = true;
        this.runtime.trigger(cr.behaviors.Rex_Spline.prototype.cnds.OnHitAnyPoint, this.inst); 
        this.is_my_call = false;
	};      
    behinstProto.wrapIndex = function (idx)
    {
        if (this.isLooping)
        {
            var cnt = this.points.length;   
            idx = idx % cnt;
            if (idx < 0)
                idx = cnt + idx;
        }
        
        return idx;
    };

	behinstProto.getSeg = function ()
	{
        if (this.curSeg.t === 1)       
        {       
            this.curSeg.ptr = this.wrapIndex(this.curSeg.ptr + 1);
            var ptr1 =  this.curSeg.ptr;
            var ptr2 = this.wrapIndex(ptr1 + 1); 
            
            if (ptr2 >= this.points.length)
                return null;
            
            var ptr0 = this.wrapIndex(ptr1 - 1);
            var ptr3 = this.wrapIndex(ptr2 + 1);
            
            this.curSeg.p0 = this.points[ptr0];
            this.curSeg.p1 = this.points[ptr1];
            this.curSeg.p2 = this.points[ptr2];
            this.curSeg.p3 = this.points[ptr3];
            this.curSeg.dist = cr.distanceTo(this.curSeg.p1[0], this.curSeg.p1[1], this.curSeg.p2[0], this.curSeg.p2[1]);   
            this.curSeg.t = 0;
            this.curSeg.preX = this.curSeg.p1[0];
            this.curSeg.preY = this.curSeg.p1[1];  

            this.hitPoint();            
        }
        
        return this.curSeg;              
	};     
    
    var LASTU, LASTUU, LASTUUU;
	var interpolate = function (seg, i, tension)
	{
        var p1 = seg.p1[i];
        var p2 = seg.p2[i];
        var t = seg.t;
        var p0 = (seg.p0)? seg.p0[i] : p1+(p1-p2);
        var p3 = (seg.p3)? seg.p3[i] : p2+(p2-p1);

        var u, uu, uuu;
        if (t === LASTU)
        {
            u = LASTU;
            uu = LASTUU;
            uuu = LASTUUU;
        }
        else
        {
            LASTU = u = t;
            LASTUU = uu = u*u;
            LASTUUU = uuu = uu*u;
        }

        return (-tension*u +2*tension*uu -tension*uuu)*p0 + 
                   (+1 +(tension-3)*uu +(2-tension)*uuu)*p1 +
                   (+tension*u +(3-2*tension)*uu +(tension-2)*uuu)*p2 +
                   (-tension*uu +tension*uuu)*p3;
	};   

    var din = function (d, default_value)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (d == null)
        {
            if (default_value != null)
                o = default_value;
            else
                o = 0;
        }
        else if (typeof(d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
	    return o;
    };
    
	behinstProto.saveToJSON = function ()
	{
        var seg = {
            "ptr": this.curSeg.ptr,
            "t": this.curSeg.t,
            "d": this.curSeg.dist,
            "pX": this.curSeg.preX,
            "pY": this.curSeg.preY,
            
        };
		return { "en": this.enabled,
                      "spd": this.speed,
                      "lop": this.isLooping,
                      "ts": this.tension,
		              "ps": this.points,
                      "ptr": this.curSeg.ptr,
                      "seg": seg,
                      "td": this.traveledDist,                      
                      "ma": this.movingAngle,
                      "mov": this.is_moving,
               };
	};
	
	behinstProto.loadFromJSON = function (o)
	{  
		this.enabled = o["en"];   
        this.speed = o["spd"];   
        this.isLooping = o["lop"];
        this.tension = o["ts"];
        
        this.points = o["ps"];        
        this.curSeg = o["seg"];
        
        this.curSeg.ptr = o["seg"]["ptr"];
        this.curSeg.t = o["seg"]["t"];    
        this.curSeg.dist = o["seg"]["d"];          
        this.curSeg.preX = o["seg"]["pX"];                  
        this.curSeg.preY = o["seg"]["pY"]; 
        this.curSeg.p0 = this.points[ this.wrapIndex( this.curSeg.ptr-1 ) ];
        this.curSeg.p1 = this.points[ this.wrapIndex( this.curSeg.ptr ) ]; 
        this.curSeg.p2 = this.points[ this.wrapIndex( this.curSeg.ptr+1 ) ];
        this.curSeg.p3 = this.points[ this.wrapIndex( this.curSeg.ptr+2 ) ];         
     
        this.traveledDist = o["td"];     
        this.movingAngle = o["ma"];
        this.is_moving = o["mov"];  
	};

	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{	
        var idx0 = this.curSeg.ptr;
        var idx1 = this.wrapIndex(this.curSeg.ptr + 1)
        var p0 = this.points[idx0];
        var p1 = this.points[idx1]; 
		propsections.push({
			"title": this.type.name,
			"properties": [{"name": "P"+idx0, "value": p0[0] + ","  + p0[1]},
			               {"name": "P"+idx1, "value": p1[0] + ","  + p1[1]}]
		});
	};
	/**END-PREVIEWONLY**/
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.OnHitTarget = function ()
	{
		return (this.is_my_call);
	};
    
	Cnds.prototype.OnHitAnyPoint = function ()
	{
		return (this.is_my_call);
	};    
    
	Cnds.prototype.IsMoving = function ()
	{
		return (this.enabled && this.is_moving);
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetEnabled = function (en)
	{
		this.enabled = (en === 1);
    };
    
	Acts.prototype.SetAngleEnabled = function (en)
	{
		this.setAngle = (en === 1);
	};    
    
	Acts.prototype.AddPoint = function (x, y)
	{
        this.points.push([x,y]);
	};  
    
	Acts.prototype.ResetPoint = function (i, x, y)
	{
        if (this.is_moving)
        {
            var idxp1 = this.curSeg.ptr;
            var idxp2 = this.curSeg.ptr+1;
            if ((idxp1 === i) || (idxp2 === i))
                return;
        }
        
        if (i < 0)
        {
            this.points.unshift([x, y]);
        }            
        else if (i < this.points.length)
        {
            var p = this.points[i];
            p[0] = x;
            p[1] = y;            
        }
        else
        {
            this.points.push([x,y]);
        }       
	}; 

	Acts.prototype.CleanAll = function ()
	{
        this.points.length = 0;        
        this.is_moving = false;  // stop
	};
    
	Acts.prototype.Start = function ()
	{
        this.start();     
	}; 
    
	Acts.prototype.Stop = function ()
	{
        this.is_moving = false;  // stop    
	}; 
      
	Acts.prototype.SetSpeed = function (spd)
	{
		this.speed = spd;
	};         
      
	Acts.prototype.SetLooping = function (en)
	{
		this.isLooping = (en === 1);
	};    
      
	Acts.prototype.SetTension = function (tension)
	{
		this.tension = tension;
	};       
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.Speed = function (ret)
	{
		ret.set_float(this.speed);
	};    

	Exps.prototype.Tension = function (ret)
	{
		ret.set_float(this.tension);
	};  

	Exps.prototype.AngleOfMotion = function (ret)
	{
		ret.set_float( cr.to_clamped_degrees(this.movingAngle) );
	};  
	Exps.prototype.Point = function (ret, idx, part)
	{
        var val = this.points;
        if (idx != null)
            val = val[idx];
        if ((val != null) && (part != null))
        {
            if ((part === 0) || (part === "x") || (part === "X"))
                val = val[0];
            else if ((part === 1) || (part === "y") || (part === "Y"))
                val = val[1];
        }
            
		ret.set_any(din(val));
	};   
	Exps.prototype.CurSegP0 = function (ret, part)
	{
        var val = this.curSeg.ptr;
        if (part != null)
        {
            val = this.points[val];
            if (val != null)
            {
                if ((part === 0) || (part === "x") || (part === "X"))
                    val = val[0];
                else if ((part === 1) || (part === "y") || (part === "Y"))
                    val = val[1];
            }
            else
                val = 0;
        }
		ret.set_int(val);
	};
	Exps.prototype.CurSegP1 = function (ret, part)
	{  
        var val = this.wrapIndex(this.curSeg.ptr + 1);  
        if (part != null)
        {
            val = this.points[val];
            if (val != null)
            {
                if ((part === 0) || (part === "x") || (part === "X"))
                    val = val[0];
                else if ((part === 1) || (part === "y") || (part === "Y"))
                    val = val[1];
            }
            else
                val = 0;
        }        
		ret.set_int(val);
	};
	Exps.prototype.PointsCount = function (ret)
	{    
		ret.set_int(this.points.length);
	};
    
	Exps.prototype.TraveledDistance = function (ret)
	{
		ret.set_float(this.traveledDist);
	};
}());