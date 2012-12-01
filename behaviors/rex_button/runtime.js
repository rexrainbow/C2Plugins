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
        this._behavior_insts = [];
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
    
    behtypeProto.OnTouchStart = function (_NthTouch, _TouchX, _TouchY)
    {
        this.ClickDetecting(_TouchX, _TouchY, _NthTouch);
    };
    
    behtypeProto.OnTouchEnd = function (_NthTouch)
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
			if ((behavior_inst._touch_src == _NthTouch) && (behavior_inst._state == 1))
                behavior_inst.finish_click_detecting(true);            
        }	
		sol.select_all = select_all_save;     
    };
    
    // click detecting
	behtypeProto.ClickDetecting = function(x, y, touch_src)
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
        this._behavior_insts.length = 0;          
        for (i=0; i<cnt; i++ )
        {
		    inst = ovl_insts[i];
            behavior_inst = inst.behavior_insts[this.behavior_index];
            if ((behavior_inst.activated) && (behavior_inst._touch_src == null))
                this._behavior_insts.push(behavior_inst);
        }
            
        // 2. click detecting start
        cnt = this._behavior_insts.length;
        for (i=0; i<cnt; i++)
            this._behavior_insts[i].start_click_detecting(touch_src);
        
        // recover to select_all_save
        sol.select_all = select_all_save;
        this._behavior_insts.length = 0; 
        
        return true;  // get drag inst  
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
        this.activated = (this.properties[0]==1);
        this.click_mode = this.properties[1];
        this._touch_src = null;
        this._state = 0;  // 0=idle, 1=wait, 2=clicking        
	};

	behinstProto.tick = function ()
	{  
        if (!(this.activated && (this._state == 1)))
            return;
            
        var touchwrap = this.type.touchwrap;
        var touch_x = touchwrap.GetXAt(this._touch_src, this.inst.layer);
        var touch_y = touchwrap.GetYAt(this._touch_src, this.inst.layer);
        this.inst.update_bbox();   
        if (!this.inst.contains_pt(touch_x, touch_y))
            this.finish_click_detecting(false);        
	};   
	 
    //  
	behinstProto.start_click_detecting = function (touch_src)
	{
        this._touch_src = touch_src;
        this._state = 1;  // 0=idle, 1=wait, 2=clicking  
        this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnClickStart, this.inst); 
        
        if (this.click_mode == 1)
            this.finish_click_detecting(true);
	};
	behinstProto.finish_click_detecting = function (is_success)
	{
        this._touch_src = null;
        this._state = 0;  // 0=idle, 1=wait, 2=clicking
 
        if (is_success)
            this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnClick, this.inst); 
        else
            this.runtime.trigger(cr.behaviors.Rex_Button2.prototype.cnds.OnClickCancel, this.inst);             
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
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s==1);
	};  

	Acts.prototype.CancelClickDetecting = function ()
	{
		this.finish_click_detecting(false);
	}; 
    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());