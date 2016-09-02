// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_TouchArea2 = function(runtime)
{
    this.runtime = runtime;
};

(function ()
{
    var behaviorProto = cr.behaviors.Rex_TouchArea2.prototype;
        
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
        this.touchwrap = null;
    };
    
    behtypeProto.TouchWrapGet = function ()
    {
        if (this.touchwrap != null)
            return;
            
        var plugins = this.runtime.types;
        var name, obj;
        for (name in plugins)
        {
            obj = plugins[name].instances[0];
            if ((obj != null) && (obj.check_name == "TOUCHWRAP"))
            {
                this.touchwrap = obj;
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for TouchArea behavior");
    };  
    
    /////////////////////////////////////
    // Behavior instance class
    behaviorProto.Instance = function(type, inst)
    {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;				// associated object instance to modify
        this.runtime = type.runtime;
        
        type.TouchWrapGet();                                 
    };

    var behinstProto = behaviorProto.Instance.prototype;

    behinstProto.onCreate = function()
    {
        this.enabled = (this.properties[0]===1);          
        this.is_touched = false;	    
        this.cur_touchX = -1;
        this.cur_touchY = -1;
        this.delta_touchX = 0;
        this.delta_touchY = 0;        
        this.start_touchX = -1;
        this.start_touchY = -1;
        this._vectorX = -1;
        this._vectorY = -1;
        this._distance = -1;
    };	

    behinstProto.tick = function ()
    {  
        if (!this.enabled)
            return;
        
        var touch_obj = this.type.touchwrap;
        var touch_pts = touch_obj.touches;
        var cnt=touch_pts.length;
        
        var is_touched = false;
        var inst = this.inst;
        inst.update_bbox();
        var pre_tx = this.cur_touchX;
        var pre_ty = this.cur_touchY;
        if (touch_obj.IsInTouch())
        {
            var i, touch_pt, tx, ty;
            for (i=0; i<cnt; i++)
            {                
                touch_pt = touch_pts[i];
                tx = inst.layer.canvasToLayer(touch_pt.x, touch_pt.y, true);
                ty = inst.layer.canvasToLayer(touch_pt.x, touch_pt.y, false);   		    
                if (inst.contains_pt(tx,ty))
                {
                    this.cur_touchX = tx;
                    this.cur_touchY = ty;
                    is_touched = true;
                    break;
                }
            }
        }
        
        // clean unit vector return
        this._vectorX = -1;
        this._vectorY = -1
        this._distance = -1;
        
        var pre_is_touched = this.is_touched;
        this.is_touched = is_touched;	
        
        if (pre_is_touched && is_touched)
        {
            this.delta_touchX = this.cur_touchX - pre_tx;
            this.delta_touchY = this.cur_touchY - pre_ty;
        }
        else         
        {
            this.delta_touchX = 0;
            this.delta_touchY = 0; 
        }
        
        if ((!pre_is_touched) && is_touched)
        {
            this.start_touchX = this.cur_touchX;
            this.start_touchY = this.cur_touchY;
            this.runtime.trigger(cr.behaviors.Rex_TouchArea2.prototype.cnds.OnTouchStart, inst);
        }
        if ((pre_tx != this.cur_touchX) || (pre_ty != this.cur_touchY))
            this.runtime.trigger(cr.behaviors.Rex_TouchArea2.prototype.cnds.OnTouchMoving, inst);
        if (pre_is_touched && (!is_touched))
            this.runtime.trigger(cr.behaviors.Rex_TouchArea2.prototype.cnds.OnTouchEnd, inst);
            
    }; 
    

    behinstProto._dist_get = function ()
    { 
        if (this._distance == -1)
        {
            this._distance = cr.distanceTo(this.start_touchX, this.start_touchY,
                                           this.cur_touchX, this.cur_touchY);
        }
        return this._distance;
    };
    
    behinstProto._unit_vecXY_get = function ()
    { 
        if ((this._vectorX != -1) || (this._vectorY != -1))
            return;
        if ((this.start_touchX == this.cur_touchX) &&
            (this.start_touchY == this.cur_touchY))
        {
            this._vectorX = 0;
            this._vectorY = 0;
        }
        else
        {
            var angle = cr.angleTo(this.start_touchX, this.start_touchY,
                                this.cur_touchX, this.cur_touchY);
            this._vectorX = Math.cos(angle);
            this._vectorY = Math.sin(angle);
        }
    };    
    
    behinstProto._currx_get = function ()
    {
        var x = (this.is_touched)? this.cur_touchX: (-1);
        return x;
    };
    
    behinstProto._curry_get = function ()
    {
        var y = (this.is_touched)? this.cur_touchY: (-1);
        return y;
    };    
    
    behinstProto._startx_get = function ()
    {
        var x = (this.is_touched)? this.start_touchX: (-1);
        return x;
    };
    
    behinstProto._starty_get = function ()
    {
        var y = (this.is_touched)? this.start_touchY: (-1);
        return y;
    }; 
    
    behinstProto._distance_get = function ()
    {
        var dist;
        if (this.is_touched)
        {
            dist = this._dist_get();
        }
        else
        {
            dist = -1;
        }
        return dist;
    };
    
    behinstProto._angle_get = function ()
    {
        var angle;
        if (this.is_touched)
        {
            angle = cr.angleTo(this.start_touchX, this.start_touchY,
                            this.cur_touchX, this.cur_touchY);
            angle = cr.to_clamped_degrees(angle);
        }
        else
        {
            angle = -1;
        }
        return angle;
    };
    
    behinstProto._vectorx_get = function ()
    {
        var vectX;
        if (this.is_touched)
        {
            this._unit_vecXY_get();
            vectX = this._vectorX;
        }
        else
        {
            vectX = 0;
        }
        return vectX;
    };
    
    behinstProto._vectory_get = function ()
    {
        var vectY;
        if (this.is_touched)
        {
            this._unit_vecXY_get();
            vectY = this._vectorY;
        }
        else
        {
            vectY = 0;
        }
        return vectY;
    };			
    
    /**BEGIN-PREVIEWONLY**/
    behinstProto.getDebuggerValues = function (propsections)
    {
        propsections.push({
            "title": this.type.name,
            "properties": (!this.is_touched)? []:
                        [{"name": "Current", "value": "( " + (Math.round(this._currx_get()*10)/10) + " , " + (Math.round(this._curry_get()*10)/10) + " )"},
                        {"name": "Start", "value": "( " + (Math.round(this._startx_get()*10)/10) + " , " + (Math.round(this._starty_get()*10)/10) + " )"},
                        {"name": "Distance", "value": (Math.round(this._distance_get()*10)/10)},
                        {"name": "Angle", "value": (Math.round(this._angle_get()*10)/10)},
                        {"name": "Vector X", "value": (Math.round(this._vectorx_get()*100)/100)},
                        {"name": "Vector Y", "value": (Math.round(this._vectory_get()*100)/100)},
                        ]
        });
    };
    
    behinstProto.onDebugValueEdited = function (header, name, value)
    {
    };
    /**END-PREVIEWONLY**/		
    //////////////////////////////////////
    // Conditions
    function Cnds() {};
    behaviorProto.cnds = new Cnds();    

    Cnds.prototype.OnTouchStart = function ()
    {
        return true;
    };
    
    Cnds.prototype.OnTouchEnd = function ()
    {
        return true;
    };
    
    Cnds.prototype.IsInTouch = function ()
    {
        return this.is_touched;
    };
    
    Cnds.prototype.OnTouchMoving = function ()
    {
        return true;
    };    
    
	Cnds.prototype.CompareDragDistance = function (cmp, s)
	{
        if (!this.is_touched)
            return false;
            
		return cr.do_cmp(this._distance_get(), cmp, s);
	};  
    
	Cnds.prototype.CompareDragAngle = function (cmp, s)
	{
        if (!this.is_touched)
            return false;
            
		return cr.do_cmp(this._angle_get(), cmp, s);
	};  
    
    //////////////////////////////////////
    // Actions
    function Acts() {};
    behaviorProto.acts = new Acts();

	Acts.prototype.SetEnabled = function (s)
	{
		this.enabled = (s !== 0);
	};
    
    //////////////////////////////////////
    // Expressions
    function Exps() {};
    behaviorProto.exps = new Exps();
    
    Exps.prototype.X = function (ret)
    {
        ret.set_float(this._currx_get());
    };
    
    Exps.prototype.Y = function (ret)
    {
        ret.set_float(this._curry_get());
    };    
    
    Exps.prototype.StartX = function (ret)
    {
        ret.set_float(this._startx_get());
    };
    
    Exps.prototype.StartY = function (ret)
    {
        ret.set_float(this._starty_get());
    }; 
    
    Exps.prototype.Distance = function (ret)
    {
        ret.set_float(this._distance_get());
    };
    
    Exps.prototype.Angle = function (ret)
    {
        ret.set_float(this._angle_get());
    };
    
    Exps.prototype.VectorX = function (ret)
    {
        ret.set_float(this._vectorx_get());
    };
    
    Exps.prototype.VectorY = function (ret)
    {
        ret.set_float(this._vectory_get());
    };

    Exps.prototype.DeltaX = function (ret)
    {
        ret.set_float(this.delta_touchX);
    };
    
    Exps.prototype.DeltaY = function (ret)
    {
        ret.set_float(this.delta_touchY);
    };     
}());