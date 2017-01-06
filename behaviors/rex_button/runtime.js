// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Button2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Button2.prototype;
		
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
                this.touchwrap.HookMe(this);
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for button behavior");
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
        
		target_inst_behavior.start_click_detecting(touch_src);
        
        return true;  // get drag inst  
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
			if ((behavior_inst.touchSrc == touch_src) && (behavior_inst.buttonState == CLICK_DETECTING_STATE))
                behavior_inst.finish_click_detecting();            
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
    var OFF_STATE = 0;
    var INACTIVE_STATE = 1;
    var ACTIVE_STATE = 2;
    var CLICK_DETECTING_STATE = 3;
    var CLICKED_STATE = 4;
    var state2name = ["OFF","INACTIVE","ACTIVE","CLICK DETECTING","CLICKED"];    
    // display
    var NORMAL_DISPLAY = 0;
    var CLICKED_DISPLAY = 1;
    var INACTIVE_DISPLAY = 2;
    var ROLLINGIN_DISPLAY = 3;
	behinstProto.onCreate = function()
	{
	    this.initActivated = (this.properties[0]==1);
        this.clickMode = this.properties[1];      
        this.isAutoCLICK2ACTIVE = (this.properties[2]==1);
		this.isVisibleChecking = (this.properties[3]==1);
        this.touchSrc = null;
        this.buttonState = OFF_STATE; 
        this.buttonPreState = null;       
        this.initFlag = true;
        this.rollingoverFlag = false;
        this.displayAnim = {normal:"", 
                         click:"",
                         inactive:"", 
                         rollingin:"",
                         frameSpeedSave:0,
                         cur_name:null};

        this.isSetStateInAction = false;
	};

	behinstProto.tick = function ()
	{  
        this._init();                      
        if (this.buttonState == INACTIVE_STATE)
            return;
        var is_touch_inside = this._is_touch_inside();         
        this._check_click_cancel(is_touch_inside);    
        this._check_rollingover(is_touch_inside);           
	}; 
	
	behinstProto.is_enable = function()
	{
	    var is_visible;
	    if (this.isVisibleChecking)
		{
	        var layer = this.runtime.getLayerByNumber(this.inst.layer.index);
	        is_visible = (layer.visible && this.inst.visible);
        }
		else
		    is_visible = true;
        return ( (this.buttonState == ACTIVE_STATE) && is_visible );               
	}; 	

	behinstProto._display_frame = function(frame_index)
	{
        this.displayAnim.frameSpeedSave = this.inst.cur_anim_speed;
        this.inst.cur_anim_speed = 0;
        if (frame_index != null)
            cr.plugins_.Sprite.prototype.acts.SetAnimFrame.apply(this.inst, [frame_index]); 
	}; 
    
	behinstProto._display_animation = function(anim_name)
	{
        var frameSpeedSave = this.displayAnim.frameSpeedSave;
        if (frameSpeedSave != null)
            this.inst.cur_anim_speed = frameSpeedSave;
        if (anim_name != "")
            cr.plugins_.Sprite.prototype.acts.SetAnim.apply(this.inst, [anim_name, 1]);
	}; 

	behinstProto._set_animation = function(display, name)
	{      
       if (typeof(display) == "number")
       {
           this._display_frame(display);
       }
       else if (display != "")
       {
           this._display_animation(display);
       }
       this.displayAnim.cur_name = name;        
	}; 
    
	behinstProto._init = function()
	{
        if (!this.initFlag)
            return;
            
        this.displayAnim.frameSpeedSave = this.inst.cur_anim_speed;
        if (this.initActivated != null)
        {
            if (this.initActivated)        
                this._goto_active_state();    
            else
                this._goto_inactive_state();         
        }
        this.initFlag = false;
	};    
	behinstProto._is_touch_inside = function ()
	{
        var touchwrap = this.type.touchwrap;
        var touch_x = this.GetTouchX();
        var touch_y = this.GetTouchY();
        this.inst.update_bbox();  
        return this.inst.contains_pt(touch_x, touch_y);
	};
	behinstProto._check_click_cancel = function (is_touch_inside)
	{
        if ((this.buttonState == CLICK_DETECTING_STATE) && (!is_touch_inside))
        {
            this.cancel_click_detecting(); 
            this._goto_active_state();
        }
	};    
	behinstProto._check_rollingover = function (is_touch_inside)
	{
        if (is_touch_inside)
        {            
            if (!this.rollingoverFlag)
            {
                this._set_animation(this.displayAnim.rollingin, ROLLINGIN_DISPLAY);  
                this.rollingoverFlag = true;
                this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnRollingIn, this.inst);
            }
        }
        else
        {
            if (this.rollingoverFlag)
            {        
                this.rollingoverFlag = false;
                if (this.displayAnim.cur_name == ROLLINGIN_DISPLAY)
                    this._set_animation(this.displayAnim.normal, NORMAL_DISPLAY);
                this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnRollingOut, this.inst);
            }
        }
	};     
 
	behinstProto._set_state = function (state)
	{
	    this.buttonPreState = this.buttonState;
        this.buttonState = state;
	};
	behinstProto.start_click_detecting = function (touch_src)
	{
        if (this.clickMode == 0)
        {
            this.touchSrc = touch_src;        
            this._set_state(CLICK_DETECTING_STATE);
            this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnClickStart, this.inst);         
        }        
        else
            this.finish_click_detecting();
	};
	behinstProto._goto_active_state = function ()
	{
	    this.initActivated = null;
        this.touchSrc = null;
        this._set_state(ACTIVE_STATE);
        this._set_animation(this.displayAnim.normal, NORMAL_DISPLAY);  
        this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnActivated, this.inst);  
	};  	
	behinstProto._goto_inactive_state = function ()
	{
	    this.initActivated = null;	    
        this.touchSrc = null;
        this._set_state(INACTIVE_STATE);
        this._set_animation(this.displayAnim.inactive, INACTIVE_DISPLAY);      
        this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnInactivated, this.inst);
	};  
	behinstProto.cancel_click_detecting = function ()
	{
        this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnClickCancel, this.inst);      
	};     
	behinstProto.finish_click_detecting = function ()
	{
        this._set_state(CLICKED_STATE);
        this._set_animation(this.displayAnim.click, CLICKED_DISPLAY);
        this.isSetStateInAction = false;         
        this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnClick, this.inst);  
        if (this.isAutoCLICK2ACTIVE && !this.isSetStateInAction)
        {
            this._set_animation(this.displayAnim.normal, NORMAL_DISPLAY);  
            this._set_state(ACTIVE_STATE);
        }
	};  
    
	behinstProto.GetTouchX = function()
	{
        return this.type.touchwrap.XForID(this.touchSrc, this.inst.layer.index);
	};
    
	behinstProto.GetTouchY = function()
	{
        return this.type.touchwrap.YForID(this.touchSrc, this.inst.layer.index);      
	};
	
	behinstProto.saveToJSON = function ()
	{
	    var activated = (this.buttonState != INACTIVE_STATE);
		return { "en": activated,
                 "fn": this.displayAnim.normal,
                 "fc": this.displayAnim.click,
                 "fi": this.displayAnim.inactive,
                 "fr": this.displayAnim.rollingin};
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		var activated = o["en"];
		if (activated)
		    this._goto_active_state();
		else
		    this._goto_inactive_state(); 
        this.displayAnim.normal = o["fn"];
        this.displayAnim.click = o["fc"];
        this.displayAnim.inactive = o["fi"];
        this.displayAnim.rollingin = o["fr"];           
	};
	
	behinstProto._cmd_goto_state = function (state)
	{
	    if (state == this.buttonState)  // state does not change
	        return;
	    if (this.buttonState == CLICK_DETECTING_STATE)
	        this.cancel_click_detecting();	
	        
	    if (state == ACTIVE_STATE)       
	        this._goto_active_state();
	    else    
	        this._goto_inactive_state();
	};	
	
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "State", "value": state2name[this.buttonState]},
			]
		});
	};
	/**END-PREVIEWONLY**/	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();    

	Cnds.prototype.OnClick = function ()
	{
        return true;
	};

	Cnds.prototype.OnClickCancel = function ()
	{
        return true;
	};  

	Cnds.prototype.OnClickStart = function ()
	{
        return true;
	}; 
    
	Cnds.prototype.OnActivated = function ()
	{
        return true;
	};     

	Cnds.prototype.OnInactivated = function ()
	{
        return true;
	}; 

	Cnds.prototype.OnRollingIn = function ()
	{
        return true;
	};  

	Cnds.prototype.OnRollingOut = function ()
	{
        return true;
	};    

	Cnds.prototype.IsEnable = function ()
	{
        return this.is_enable();
	};    	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.GotoACTIVE = function (_layer)
	{
        this.isSetStateInAction = true;        
	    var state = ACTIVE_STATE;
	    if ((_layer!= null) && (this.inst.layer != _layer))
	        state = INACTIVE_STATE;	    
	    this._cmd_goto_state(state);
	}; 
	
	Acts.prototype.GotoINACTIVE = function (_layer)
	{	
        this.isSetStateInAction = true;     
	    var state = INACTIVE_STATE;
	    if ((_layer!= null) && (this.inst.layer != _layer))
	        state = ACTIVE_STATE;	  	    
	    this._cmd_goto_state(state);
	}; 
	 
	Acts.prototype.SetDisplay = function (display_normal, display_click, display_inactive, display_rollingin)
	{
        // check sprite
        this.displayAnim.normal = display_normal;
        this.displayAnim.click = display_click;
        this.displayAnim.inactive = display_inactive;
        this.displayAnim.rollingin = display_rollingin;        
        this._init();
	};   
	 
	Acts.prototype.ManualTriggerCondition = function (condition_type)
	{
        var conds = cr.behaviors.Rex_Button2.prototype.cnds;
        var trig;
        switch (condition_type)
        {
        case 0: trig = conds.OnClick;        break;
        case 1: trig = conds.OnClickCancel;  break; 
        case 2: trig = conds.OnClickStart;   break;
        case 3: trig = conds.OnActivated;    break; 
        case 4: trig = conds.OnInactivated;  break;
        case 5: trig = conds.OnRollingIn;    break; 
        case 6: trig = conds.OnRollingOut;   break;
        }
        this.runtime.trigger(trig, this.inst);      
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.CurState = function (ret)
	{
	    ret.set_string(state2name[this.buttonState]);
	};	
	
	Exps.prototype.PreState = function (ret)
	{
	    ret.set_string(state2name[this.buttonPreState]);
	};
}());