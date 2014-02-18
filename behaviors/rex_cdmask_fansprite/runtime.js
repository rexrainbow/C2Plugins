// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_cdmask_fansprite = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_cdmask_fansprite.prototype;
		
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
        this.fan_type = null;       
        this.set_anim_frame = cr.plugins_.Sprite.prototype.acts.SetAnimFrame;
        this.set_anim_speed = cr.plugins_.Sprite.prototype.acts.SetAnimSpeed;
        this.set_sprite_angle = cr.plugins_.Sprite.prototype.acts.SetAngle;
        this.set_sprite_visible = cr.plugins_.Sprite.prototype.acts.SetVisible;
        this.set_sprite_flipped = cr.plugins_.Sprite.prototype.acts.SetFlipped;
	};
	
	behtypeProto.CreateInst = function (x, y, layer, is_flipped, frame_index)
	{
	    if (this.fan_type == null)
	        return null;
	    var inst = this.runtime.createInstance(this.fan_type, layer, x, y);
	    if (inst == null)
	        return null;
	      
	    this.set_anim_frame.call(inst, frame_index);  
	    this.set_anim_speed.call(inst, 0);
	    if (is_flipped)
	        this.set_sprite_flipped.call(inst, 0);
	    return inst;
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
    
    var _frame2angle = [256, 128, 64, 32, 16, 8, 4, 2, 1];    
	behinstProto.onCreate = function()
	{        
        this.start_angle = this.properties[0];
        this.is_clockwise = (this.properties[1] == 1);
        this.is_back = (this.properties[0] == 1);
        this.fan_insts = [-1,-1,-1,-1,-1,-1,-1,-1,-1];  // uid
	};  
    
	behinstProto.onDestroy = function()
	{
        var i, cnt=this.fan_insts.length, fan_inst;
        for (i=0; i<cnt; i++)
        {
            fan_inst = this._uid2inst(this.fan_insts[i]);
            if (fan_inst == null)
                continue;
            this.runtime.DestroyInstance(fan_inst);
        }
	};  
	
	behinstProto.tick = function ()
	{
		// do work in tick2 instead, after events to get latest object position
	};

	behinstProto.tick2 = function ()
	{
        this._pin_fan_insts();
	};
	 
	behinstProto._uid2inst = function (uid)
	{
	    if (uid == null)
	        return null;
	    
	    return this.runtime.getObjectByUID(uid);
	};	
		 
	behinstProto._pin_fan_insts = function ()
	{
        var i, cnt=this.fan_insts.length, fan_inst;
        var reflash = false;     
        for (i=0; i<cnt; i++)
        {
            fan_inst = this._uid2inst(this.fan_insts[i]);
            if (fan_inst == null)
                continue;
                
            reflash = false;            
            if (fan_inst.x != this.inst.x)
            {
                fan_inst.x = this.inst.x;
                reflash = true;
            }
            if (fan_inst.y != this.inst.y)
            {
                fan_inst.y = this.inst.y;
                reflash = true;
            }
            if (reflash)
            {
                fan_inst.set_bbox_changed();
                fan_inst.runtime.redraw = true; 
            }
        }
	};


	behinstProto._cd_mask = function (percentage)
	{
	    if (this.type.fan_type == null)
	        return;
	        	    
	    var a = Math.floor(percentage * 360), f2a;
	    var i, cnt=this.fan_insts.length, j=-1;
	    var fan_angle=this.start_angle;
	    var fan_inst;
	    
	    for (i=0; i<cnt; i++)
	    {
	        fan_inst = this._uid2inst(this.fan_insts[i]);	        
	        if (fan_inst == null)
	        {
	            fan_inst = this.type.CreateInst(this.inst.x, this.inst.y, this.inst.layer, 
	                                            (!this.is_clockwise), i);
	            if (fan_inst == null)
	                return;
	            this.fan_insts[i] = fan_inst.uid;
	        }
	        
	        f2a = _frame2angle[i];
	        if (a >= f2a)
	        {	            
	            a -= f2a;	            
	            this.type.set_sprite_visible.call(fan_inst, true);
	            this.type.set_sprite_angle.call(fan_inst, fan_angle);
	            fan_angle += (this.is_clockwise)? (f2a):(-f2a);
	        }
	        else
	        {
	            this.type.set_sprite_visible.call(fan_inst, false);
	        }
	    }
	    
	    if (percentage == 0)     // destroy all fan sprites
	    {
	        for (i=0; i<cnt; i++)
	        {
	            fan_inst = this._uid2inst(this.fan_insts[i]);
	            this.fan_insts[i] = -1;
	            if (fan_inst == null)
                    continue;
                this.runtime.DestroyInstance(fan_inst);
	        }
	    }	    
	};	
	
	behinstProto._pick_fan_insts = function ()
	{
	    if (this.type.fan_type == null)
	        return false;

        var sol = this.type.fan_type.getCurrentSol(); 
        sol.instances.length = 0;
        sol.select_all = false; 
        var i, cnt=this.fan_insts.length, fan_inst;
        for (i=0; i<cnt; i++)
        {
            fan_inst = this._uid2inst(this.fan_insts[i]);
            if (fan_inst == null)
                continue;
            sol.instances.push(fan_inst);
        }
        return (sol.instances.length > 0);
	};
	
	behinstProto.saveToJSON = function ()
	{    
		return { "fansid": this.type.fan_type.sid,
		         };
	};
	
	behinstProto.loadFromJSON = function (o)
	{   
	    this.type.fan_type = this.runtime.getObjectTypeBySid(o["fansid"]);
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	  
	Cnds.prototype.PickCanvas = function ()
	{
		return this._pick_fan_insts(); 
	};	 
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.SetupFan = function (fan_type)
	{
	    this.type.fan_type = fan_type;
	}; 

	Acts.prototype.SetCoolDownPercentage = function(percentage)
	{
	    this._cd_mask(percentage);
	};
	
	Acts.prototype.PickFan = function()
	{
        this._pick_fan_insts();      
	};    
    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());