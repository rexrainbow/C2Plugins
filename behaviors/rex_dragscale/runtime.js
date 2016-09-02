// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_DragScale2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_DragScale2.prototype;
		
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
        this.GetX = null;
        this.GetY = null;
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
                this.GetX = cr.plugins_.rex_TouchWrap.prototype.exps.XForID;
                this.GetY = cr.plugins_.rex_TouchWrap.prototype.exps.YForID;                
                this.touchwrap.HookMe(this);
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for drag scale behavior");
	};  
	
	function GetThisBehavior(inst)
	{
		var i, len;
		for (i = 0, len = inst.behavior_insts.length; i < len; i++)
		{
			if (inst.behavior_insts[i] instanceof behaviorProto.Instance)
				return inst.behavior_insts[i];
		}
		
		return null;
	};
    	
    var _touch_insts = [];            
	var _behavior_insts = [];
    behtypeProto.OnTouchStart = function (touch_src, touchX, touchY)
    {
        _touch_insts.length = 0;
        _behavior_insts.length = 0;        
        var insts = this.objtype.instances, inst;
        var lx, ly;
        var i, cnt=insts.length;
        for (i=0; i<cnt; i++)
        {
            inst = insts[i];
            inst.update_bbox();
			
			// Transform point from canvas to instance's layer
			lx = inst.layer.canvasToLayer(touchX, touchY, true);
			ly = inst.layer.canvasToLayer(touchX, touchY, false);
            
            if (inst.contains_pt(lx, ly))
                _touch_insts.push(inst);
        }
        
        var touch_insts_cnt=_touch_insts.length
        if (touch_insts_cnt === 0)
        {
            _touch_insts.length = 0;
            _behavior_insts.length = 0;
            return false;
        }
        
        // touch_insts_cnt > 0
        // 0. find out index of behavior instance          
            
        // 1. get all valid behavior instances            
        var behavior_inst;                 
        cnt = touch_insts_cnt;
        _behavior_insts.length = 0; 		
        for (i=0; i<cnt; i++ )
        {
		    inst = _touch_insts[i];
		    if (!inst)
		    {
		        continue;
		        // insts might be removed
		    }		    
            behavior_inst = GetThisBehavior(inst);
            if (behavior_inst == null)
                continue;
            if (behavior_inst.is_enable())
			    _behavior_insts.push(behavior_inst);
        }            

		// 2. get the max z-order inst
        cnt = _behavior_insts.length;
		if (cnt === 0)  // no inst match
        {
            _touch_insts.length = 0;
            _behavior_insts.length = 0;
            return false;
        }

        var target_inst_behavior = _behavior_insts[0];
        var instB=target_inst_behavior.inst, instA;
        for (i=1; i<cnt; i++ )
        {
            behavior_inst = _behavior_insts[i];
            instA = behavior_inst.inst;
            if ( ( instA.layer.index > instB.layer.index) ||
                 ( (instA.layer.index == instB.layer.index) && (instA.get_zindex() > instB.get_zindex()) ) )                 
            {
                target_inst_behavior = behavior_inst;
                instB = instA;
            } 
        }		
        _touch_insts.length = 0;
        _behavior_insts.length = 0;
        
		target_inst_behavior.on_touch_start(touch_src);
        
        return true;  // get touch inst
    };
    
    behtypeProto.OnTouchEnd = function (touch_src)
    {
		var insts = this.objtype.instances;
        var i, cnt=insts.length, inst, behavior_inst;
        for (i=0; i<cnt; i++ )
        {
		    inst = insts[i];
		    if (!inst)
		    {
		        continue;
		        // insts might be removed
		    }			    
            behavior_inst = GetThisBehavior(inst);
            if (behavior_inst == null)
                continue;
			if (behavior_inst.activated)
            {
                behavior_inst.on_touch_end(touch_src);       
			}
        }  	    
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

    // state
    var TOUCH0 = 0;
    var TOUCH1 = 1;
    var TOUCH2 = 2;
    var state2name = ["TOUCH0","TOUCH1","TOUCH2"];    
	behinstProto.onCreate = function()
	{   
	    this.activated = (this.properties[0]==1);   
	    this.autoscale_mode = (this.properties[1]==1);            
	    this.dragPoints = new cr.behaviors.Rex_DragScale2.DragPointsKlass(this);
	    this.state = TOUCH0;
	    this.touchids = [];
		this.dragStartWidth = 0;
		this.dragStartHeight = 0;
        this.baseWidth = this.inst.width;
        this.baseHeight = this.inst.height;
	};
	
	behinstProto.on_touch_start = function (touchid)
	{  
	    if (this.state === TOUCH2)
	        return;
	         
        this.touchids.push(touchid);
        this.state = (this.touchids.length === 1)? TOUCH1:TOUCH2;
        if (this.state === TOUCH2)
		{		
		    this.dragStartWidth = this.inst.width;
		    this.dragStartHeight = this.inst.height;
            this.dragPoints.start_drag(this.touchids[0], this.touchids[1]);			
		}
	}; 	
	
	behinstProto.on_touch_end = function (touchid)
	{
	    switch (this.state)
		{
		case TOUCH2:
		    if (touchid === this.touchids[0])
			    this.touchids.shift();
		    else if (touchid === this.touchids[1])
			    this.touchids.pop();
			if (this.touchids.length === 1)
			{
			    this.dragPoints.cancel();
			    this.state = TOUCH1;				
		    }
		    break;
		case TOUCH1:
		    this.touchids.length = 0;
			this.state = TOUCH0;
		    break;			
		}
	}; 
	
	behinstProto.auto_scale = function (has_updated)
	{  
	    if (!this.autoscale_mode || !has_updated)
	        return;
			
	    var scale = this.dragPoints.get_scale();	    
        this.inst.width = this.dragStartWidth * scale;
		this.inst.height = this.dragStartHeight * scale;
        this.inst.set_bbox_changed();
        this.runtime.redraw = true;
	}; 
	
	behinstProto.tick = function ()
	{  
        if (this.state !== TOUCH2)
            return;
            
        var pos_changed = this.dragPoints.tick();
        this.auto_scale(pos_changed);        
	}; 
    
	behinstProto.is_enable = function()
	{
        return this.activated;
	};
    
	behinstProto.GetX = function(touchid)
	{
        var touch_obj = this.type.touchwrap;
		this.type.GetX.call(touch_obj, 
                            touch_obj.fake_ret, touchid, this.inst.layer.index);
        return touch_obj.fake_ret.value;          
	};
    
	behinstProto.GetY = function(touchid)
	{
        var touch_obj = this.type.touchwrap;
		this.type.GetY.call(touch_obj, 
                            touch_obj.fake_ret, touchid, this.inst.layer.index);
        return touch_obj.fake_ret.value;         
	};
	
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.activated,
                 "as": this.autoscale_mode };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.activated = o["en"];
		this.autoscale_mode = o["as"]; 
	};	
    
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "State", "value": state2name[this.state]},
			]
		});
	};
	/**END-PREVIEWONLY**/	
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();    

	Cnds.prototype.OnDragStart = function ()
	{
        return true;
	};

	Cnds.prototype.OnCanceled = function ()
	{
        return true;
	}; 
	
	Cnds.prototype.IsDragging = function ()
	{
        return (this.state == TOUCH2);
	};  

	Cnds.prototype.OnDragMoveStart = function ()
	{
        return true;
	}; 

	Cnds.prototype.OnDragMove = function ()
	{
        return true;
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
	    var activated = (s==1);
		if (this.activated && (!activated))
		{
		    if (this.state == TOUCH2)
		        this.dragPoints.cancel();
		    this.state = TOUCH0;			
		}
		else if ((!this.activated) && activated)
		{
		    this.state = TOUCH0;
		}
		this.activated = activated;
	};  

	Acts.prototype.SetAutoScale = function (s)
	{
	    this.autoscale_mode = (s==1); 
	};	

	Acts.prototype.SetBaseSize = function (w, h)
	{
        this.baseWidth = w;
        this.baseHeight = h;
	};    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.Scale = function (ret)
	{
	    ret.set_float(this.dragPoints.get_scale());
	};	

	Exps.prototype.P0X = function (ret)
	{
	    ret.set_float(this.dragPoints.get_P0X());
	};	

	Exps.prototype.P0Y = function (ret)
	{
	    ret.set_float(this.dragPoints.get_P0Y());
	};	

	Exps.prototype.P1X = function (ret)
	{
	    ret.set_float(this.dragPoints.get_P1X());
	};	

	Exps.prototype.P1Y = function (ret)
	{
	    ret.set_float(this.dragPoints.get_P1Y());
	};		

	Exps.prototype.CurState = function (ret)
	{
	    ret.set_string(state2name[this.state]);
	};	
}());

(function ()
{
    cr.behaviors.Rex_DragScale2.DragPointsKlass = function(plugin)
    {       
        this.plugin = plugin;
        this.valid = false;
        this.pos_changed = false;
        this.p0 = new PointKlass();
        this.p1 = new PointKlass();
        this.start_dist = null;
    };
    var DragPointsKlassProto = cr.behaviors.Rex_DragScale2.DragPointsKlass.prototype;
    
    DragPointsKlassProto.start_drag = function(touchid0, touchid1)
    {        
        this.valid = true;
        this.pos_changed = false;
		var p0x = this.plugin.GetX(touchid0), p0y = this.plugin.GetY(touchid0);
		var p1x = this.plugin.GetX(touchid1), p1y = this.plugin.GetY(touchid1);
		this.start_dist = cr.distanceTo(p0x, p0y, p1x, p1y);		
        this.p0.set_startxy(touchid0, p0x, p0y);
        this.p1.set_startxy(touchid1, p1x, p1y);
        this.plugin.runtime.trigger(cr.behaviors.Rex_DragScale2.prototype.cnds.OnDragStart, this.plugin.inst);
    };
    
    DragPointsKlassProto.cancel = function()
    {        
        this.plugin.runtime.trigger(cr.behaviors.Rex_DragScale2.prototype.cnds.OnCanceled, this.plugin.inst);
        this.valid = false;
        this.pos_changed = false;
		
        this.p0.reset();
        this.p1.reset();
    };    
    
    DragPointsKlassProto.tick = function()
    {        
        var pos_changed = false;
        pos_changed |= this.p0.set_curxy(this.plugin.GetX(this.p0.touchid), this.plugin.GetY(this.p0.touchid));
        pos_changed |= this.p1.set_curxy(this.plugin.GetX(this.p1.touchid), this.plugin.GetY(this.p1.touchid));
        
        if (pos_changed)
        {
            if (!this.pos_changed)
                this.plugin.runtime.trigger(cr.behaviors.Rex_DragScale2.prototype.cnds.OnDragMoveStart, this.plugin.inst);
            this.plugin.runtime.trigger(cr.behaviors.Rex_DragScale2.prototype.cnds.OnDragMove, this.plugin.inst);
        }
        this.pos_changed = pos_changed;  
        return pos_changed;
    };
    
    DragPointsKlassProto.get_scale = function()
    {
        if (!this.valid)
            return 1;
		if (this.p0.is_at_start() && this.p1.is_at_start())
		    return 1;
        var d1 = cr.distanceTo(this.p0.cur_x, this.p0.cur_y, 
                               this.p1.cur_x, this.p1.cur_y);
        return d1/this.start_dist;
    };
        
    DragPointsKlassProto.get_P0X = function()
    {
        return this.p0.cur_x;
    };
    
    DragPointsKlassProto.get_P0Y = function()
    {
        return this.p0.cur_y;
    };   
    
    DragPointsKlassProto.get_P1X = function()
    {
        return this.p1.cur_x;
    };
    
    DragPointsKlassProto.get_P1Y = function()
    {
        return this.p1.cur_y;
    };
    

    var PointKlass = function()
    {
        this.reset();
    };    
    var PointKlassProto = PointKlass.prototype;
    
    PointKlassProto.set_startxy = function (touchid, x, y)
    {
        this.touchid = touchid;        
        this.start_x = x;
        this.start_y = y;
        this.cur_x = x;
        this.cur_y = y;		
    };
    
    PointKlassProto.set_curxy = function (x, y)
    {
        var pos_changed = (this.cur_x != x) || (this.cur_y != y);
        this.cur_x = x;
        this.cur_y = y;
        return pos_changed;
    };
    
    PointKlassProto.is_at_start = function ()
    {
        return ((this.cur_x == this.start_x) && (this.cur_y == this.start_y));
    };
	
    PointKlassProto.reset = function ()
    {
        this.touchid = null;
        this.start_x = 0;
        this.start_y = 0;
        this.cur_x = 0;
        this.cur_y = 0;
    }; 
}());