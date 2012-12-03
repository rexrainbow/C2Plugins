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
        this.behavior_index = null;
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
        assert2(this.touchwrap, "You need put a Touchwrap object for Cursor behavior");
	};  
    
    behtypeProto.OnTouchStart = function (touch_src, x, y)
    {
        var sol = this.objtype.getCurrentSol(); 
        var select_all_save = sol.select_all;
        sol.select_all = true;
        var overlap_cnt = this.runtime.testAndSelectCanvasPointOverlap(this.objtype, x, y, false);
        if (overlap_cnt == 0)
        {
            // recover to select_all_save
            sol.select_all = select_all_save;        
            return false;
        }
        
        // overlap_cnt > 0
        // 0. find out index of behavior instance
        if (this.behavior_index == null )
            this.behavior_index = this.objtype.getBehaviorIndexByName(this.name);
            
            
        // 1. get all valid behavior instances            
        var ovl_insts = sol.getObjects();
        var i, cnt, inst, behavior_inst;          
        cnt = ovl_insts.length;           
        for (i=0; i<cnt; i++ )
        {
		    inst = ovl_insts[i];
            behavior_inst = inst.behavior_insts[this.behavior_index];
            if (behavior_inst._state == ACTIVE_STATE)
                behavior_inst.start_click_detecting(touch_src);
        }
        
        // recover to select_all_save
        sol.select_all = select_all_save;
    };
    
    behtypeProto.OnTouchEnd = function (touch_src)
    {
        if (this.behavior_index == null )
            return;
			
	    var sol = this.objtype.getCurrentSol();
        var select_all_save = sol.select_all;	
		sol.select_all = true;
		var insts = sol.getObjects();
        var i, cnt=insts.length, inst, behavior_inst;
        for (i=0; i<cnt; i++ )
        {
		    inst = insts[i];
            behavior_inst = inst.behavior_insts[this.behavior_index];
			if ((behavior_inst._touch_src == touch_src) && (behavior_inst._state == CLICK_DETECTING_STATE))
                behavior_inst.finish_click_detecting();            
        }	
		sol.select_all = select_all_save;     
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
    var INACTIVE_STATE = "INACTIVE";
    var ACTIVE_STATE = "ACTIVE";
    var CLICK_DETECTING_STATE = "CLICK DETECTING";
    var CLICKED_STATE = "CLICKED";
    // display
    var NORMAL_DISPLAY = 0;
    var CLICKED_DISPLAY = 1;
    var INACTIVE_DISPLAY = 2;
    var ROLLINGIN_DISPLAY = 3;
	behinstProto.onCreate = function()
	{   
	    this._init_activated = (this.properties[0]==1);
        this._click_mode = this.properties[1];      
        this._auto_CLICK2ACTIVE = (this.properties[0]==1);
        this._touch_src = null;
        this._state = ACTIVE_STATE; 
        this._pre_state = ACTIVE_STATE;       
        this._init_flag = true;
        this._rollingover_flag = false;
        this._display = {normal:"", 
                         click:"",
                         inactive:"", 
                         rollingin:"",
                         frame_speed_save:0,
                         cur_name:null};                        
	};

	behinstProto.tick = function ()
	{  
        this._init();                      
        if (this._state == INACTIVE_STATE)
            return;
        var is_touch_inside = this._is_touch_inside();         
        this._check_click_cancel(is_touch_inside);    
        this._check_rollingover(is_touch_inside);           
	}; 

	behinstProto._display_frame = function(frame_index)
	{
        this._display.frame_speed_save = this.inst.cur_anim_speed;
        this.inst.cur_anim_speed = 0;
        if (frame_index != null)
            cr.plugins_.Sprite.prototype.acts.SetAnimFrame.apply(this.inst, [frame_index]); 
	}; 
    
	behinstProto._display_animation = function(anim_name)
	{
        var frame_speed_save = this._display.frame_speed_save;
        if (frame_speed_save != null)
            this.inst.cur_anim_speed = frame_speed_save;
        if (anim_name != "")
            cr.plugins_.Sprite.prototype.acts.SetAnim.apply(this.inst, [anim_name, 1]);
	}; 

	behinstProto._set_animation = function(display, name)
	{      
        var valid =  (display != "");   
        if (!valid)
            this._display_frame();
        else
        {
            if (typeof(display) == "number")
                this._display_frame(display);
            else
                this._display_animation(display);
            this._display.cur_name = name;
        }    
        return valid;        
	}; 
    
	behinstProto._init = function()
	{
        if (!this._init_flag)
            return;
            
        this._display.frame_speed_save = this.inst.cur_anim_speed;
        if (this._init_activated)        
            this._goto_active_state();    
        else
            this._goto_inactive_state();         
        this._init_flag = false;
	};    
	behinstProto._is_touch_inside = function ()
	{
        var touchwrap = this.type.touchwrap;
        var touch_x = touchwrap.GetXAt(this._touch_src, this.inst.layer);
        var touch_y = touchwrap.GetYAt(this._touch_src, this.inst.layer);
        this.inst.update_bbox();  
        return this.inst.contains_pt(touch_x, touch_y)
	};
	behinstProto._check_click_cancel = function (is_touch_inside)
	{
        if ((this._state == CLICK_DETECTING_STATE) && (!is_touch_inside))
        {
            this.cancel_click_detecting(); 
            this._goto_active_state();
        }
	};    
	behinstProto._check_rollingover = function (is_touch_inside)
	{
        if (is_touch_inside)
        {
            // only ACTIVE_STATE or CLICK_DETECTING_STATE could rolling in
            if ((!this._rollingover_flag) &&
                ((this._state == ACTIVE_STATE) || (this._state == CLICK_DETECTING_STATE))  )
            {
                this._set_animation(this._display.rollingin, ROLLINGIN_DISPLAY);  
                this._rollingover_flag = true;
                this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnRollingIn, this.inst);
            }
        }
        else
        {
            if (this._rollingover_flag)
            {        
                this._rollingover_flag = false;
                if (this._display.cur_name == ROLLINGIN_DISPLAY)
                    this._set_animation(this._display.normal, NORMAL_DISPLAY);
                this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnRollingOut, this.inst);
            }
        }
	};     
 
	behinstProto._set_state = function (state)
	{
	    this._pre_state = this._state;
        this._state = state;
	};
	behinstProto.start_click_detecting = function (touch_src)
	{
        if (this._click_mode == 0)
        {
            this._touch_src = touch_src;
            this._set_state(CLICK_DETECTING_STATE);
            this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnClickStart, this.inst);         
        }        
        else
            this.finish_click_detecting();
	};
	behinstProto._goto_active_state = function ()
	{
        this._touch_src = null;
        this._set_state(ACTIVE_STATE);
        this._set_animation(this._display.normal, NORMAL_DISPLAY);  
        this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnActivated, this.inst);  
	};  	
	behinstProto._goto_inactive_state = function ()
	{
        this._touch_src = null;
        this._set_state(INACTIVE_STATE);
        this._set_animation(this._display.inactive, INACTIVE_DISPLAY);      
        this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnInactivated, this.inst);
	};  
	behinstProto.cancel_click_detecting = function ()
	{
        this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnClickCancel, this.inst);      
	};     
	behinstProto.finish_click_detecting = function ()
	{
        this._set_state(CLICKED_STATE);
        this._set_animation(this._display.click, CLICKED_DISPLAY);
        this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnClick, this.inst);  
        if (this._auto_CLICK2ACTIVE)
        {
            this._set_animation(this._display.normal, NORMAL_DISPLAY);  
            this._set_state(ACTIVE_STATE);
        }
	};  
    
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
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.GotoActive = function ()
	{		
	    if (this._state == ACTIVE_STATE)  // state does not change
	        return;
	    if (this._state == CLICK_DETECTING_STATE)
	        this.cancel_click_detecting();	        
	    this._goto_active_state();
	}; 
	
	Acts.prototype.GotoInactive = function ()
	{	
	    if (this._state == INACTIVE_STATE)  // state does not change
	        return;
	    if (this._state == CLICK_DETECTING_STATE)
	        this.cancel_click_detecting();	        
	    this._goto_inactive_state();   	
	}; 
	 
	Acts.prototype.SetDisplay = function (display_normal, display_click, display_inactive, display_rollingin)
	{
        // check sprite
        this._display.normal = display_normal;
        this._display.click = display_click;
        this._display.inactive = display_inactive;
        this._display.rollingin = display_rollingin;        
        this._init();
	};   
  
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.CurState = function (ret)
	{
	    ret.set_string(this._state);
	};	
	
	Exps.prototype.PreState = function (ret)
	{
	    ret.set_string(this._pre_state);
	};
}());