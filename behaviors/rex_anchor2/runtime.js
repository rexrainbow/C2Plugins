// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.rex_Anchor2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.rex_Anchor2.prototype;
		
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
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.alignModeX = this.properties[0]; // 0=left, 1=right, 2=center, 3=hotspot, 4=none
        this.viewPortScaleX = this.properties[1]; // 0=window left, 0.5=window center, 1=window right

        this.alignModeY = this.properties[2]; // 0=top, 1=bottom, 2=center, 3=hotspot, 4=none
        this.viewPortScaleY = this.properties[3]; // 0=window top, 0.5=window center, 1=window bottom

		this.enabled = (this.properties[4] !== 0);
		
		// extend
		this.set_once = (this.properties[5] == 1);
		this.update_cnt = 0;
		this.viewLeft_saved = null;
		this.viewRight_saved = null;
		this.viewTop_saved = null;
		this.viewBottom_saved = null;			
	};
	
	behinstProto.is_layer_size_changed = function()
	{	    
	    var layer = this.inst.layer;
	    return (this.viewLeft_saved != layer.viewLeft) ||
	           (this.viewRight_saved != layer.viewRight) ||
	           (this.viewTop_saved != layer.viewTop) ||
	           (this.viewBottom_saved != layer.viewBottom);
	};	
	
	behinstProto.set_update_flag = function()
	{	    
        if (this.update_cnt === 0)
            this.update_cnt = 1;
	};	
    
	behinstProto.tick = function ()
	{	   
        if (!this.enabled)
            return;        
        
        if (this.set_once)
        {            
            if (this.is_layer_size_changed())
            {
                var layer = this.inst.layer;
		        this.viewLeft_saved = layer.viewLeft;
		        this.viewRight_saved = layer.viewRight;
		        this.viewTop_saved = layer.viewTop;
		        this.viewBottom_saved = layer.viewBottom;
		        this.update_cnt = 2;
            }
            
            if (this.update_cnt == 0)  // no need to update
                return;
            else                       // update once
                this.update_cnt -= 1;
        }

        var enableX = (this.alignModeX !== 4);
        var enableY = (this.alignModeY !== 4);
        
        if (!enableX && !enableY)
            return;
                
		var layer = this.inst.layer;
        var targetX = (enableX)? layer.viewLeft + ( (layer.viewRight - layer.viewLeft) * this.viewPortScaleX ) : 0;
        var targetY = (enableY)? layer.viewTop + ( (layer.viewBottom - layer.viewTop) * this.viewPortScaleY ) : 0;
        
		var inst = this.inst;
		var bbox = this.inst.bbox;     
        inst.update_bbox();
		
		
		var nx=0, ny=0;        
        // X
        switch (this.alignModeX)
        {
        case 0:    // set left edge to targetX
            nx = targetX + ( this.inst.x - bbox.left );
            break;
            
        case 1:    // set right edge to targetX
            nx = targetX + ( this.inst.x - bbox.right );
            break;  

        case 2:    // cneter
            nx = targetX + ( this.inst.x - (bbox.right + bbox.left)/2 );
            break;             

        case 3:    // hotspot
            nx = targetX;
            break; 

        case 4:    // None
            nx = this.inst.x;
            break;         
        }
        
        // Y
        switch (this.alignModeY)
        {
        case 0:    // top edge
            ny = targetY + ( this.inst.y - bbox.top );
            break;
            
        case 1:    // bottom edge
            ny = targetY + ( this.inst.y - bbox.bottom );
            break;  

        case 2:    // cneter
            ny = targetY + ( this.inst.y - (bbox.bottom + bbox.top)/2 );
            break;     

        case 3:    // hotspot
            ny = targetY;
            break;

        case 4:    // None
            ny = this.inst.y;
            break;               
        }        
        
        if ((nx !== this.inst.x) || (ny !== this.inst.y))
        {
            inst.x = nx;
            inst.y = ny;
            inst.set_bbox_changed();
        }
        
		if (this.set_once)
		    this.runtime.trigger(cr.behaviors.rex_Anchor2.prototype.cnds.OnAnchored, this.inst); 
	};
	
	behinstProto.saveToJSON = function ()
	{
		return {
			"enabled": this.enabled,
            "amx": this.alignModeX,
            "vx": this.viewPortScaleX,
            "amy": this.alignModeY,
            "vy": this.viewPortScaleY,            
            
		};
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.enabled = o["enabled"];
        this.alignModeX = o["amx"];
        this.viewPortScaleX = o["vx"];
        this.alignModeY = o["amy"];
        this.viewPortScaleY = o["vy"];        
	};
	//////////////////////////////////////
	// Conditions

	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	    
	Cnds.prototype.OnAnchored = function ()
	{
        return true;
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetEnabled = function (e)
	{
        var e = (e === 1);       
        
        if (!this.enabled && e)
            this.set_update_flag();
        
        this.enabled = e;
	};

	Acts.prototype.SetHorizontalAlignMode = function (m)
	{
        if (m !== 4)
            this.set_update_flag();
        
        this.alignModeX = m;        
	};	

	Acts.prototype.SetHorizontalPosition = function (p)
	{
        this.set_update_flag();
        
        this.viewPortScaleX = p;       
	};	    

	Acts.prototype.SetVerticalAlignMode = function (m)
	{
        if (m !== 4)
            this.set_update_flag();
        
        this.alignModeY = m;        
	};	

	Acts.prototype.SetVerticalPosition = function (p)
	{
        this.set_update_flag();
        
        this.viewPortScaleY = p;       
	};	     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
}());