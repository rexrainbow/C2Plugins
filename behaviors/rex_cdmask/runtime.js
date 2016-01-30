// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_cdmask = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_cdmask.prototype;
		
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
        this.canvas_type = null;   	    
	};
	
	behtypeProto._canvas_get = function ()
	{
        if (this.canvas_type != null)
            return this.canvas_type;
    
        assert2(cr.plugins_.c2canvas, "[CD mask] you need pass a canvas object.");
        var plugins = this.runtime.types;
        var name, t;
        for (name in plugins)
        {
            t = plugins[name];
            if (t instanceof cr.plugins_.c2canvas.prototype.Type)
            {
                this.canvas_type = t;
                return this.canvas_type;
            }
        }
        assert2(this.canvas_type, "[CD mask] you need pass a canvas object.");
        return null;	
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
	    this.mask_color = this.properties[0];
	    this.is_circle = (this.properties[1] == 1);
        this.is_back = (this.properties[2] == 1);
	    this.canvas_inst = null;
	};  
    
	behinstProto.onDestroy = function()
	{
        if (this.canvas_inst != null)
        {
            this.runtime.DestroyInstance(this.canvas_inst);
            this.canvas_inst = null;
        }
	};  
	
	behinstProto.tick = function ()
	{
		// do work in tick2 instead, after events to get latest object position
	};

	behinstProto.tick2 = function ()
	{
        this._pin_canvas_to_inst();
	};
	
	behinstProto._create_canvas = function ()
	{
	    if (this.canvas_inst != null)
	        return;
	        
	    var canvas_type = this.type._canvas_get();           
	    var _layer = this.runtime.getLayerByNumber(this.inst.layer.index);
	    var _x = this.inst.x;
	    var _y = this.inst.y;	         
        this.canvas_inst = this.runtime.createInstance(canvas_type,_layer,_x,_y);
        this.canvas_inst.angle = 0;
        this.canvas_inst.width = this.inst.width;
        this.canvas_inst.height = this.inst.height;    
        this.canvas_inst.canvas.width=this.canvas_inst.width;
		this.canvas_inst.canvas.height=this.canvas_inst.height;            
        this._pin_canvas_to_inst();
        this.canvas_inst.hotspotX = this.inst.hotspotX;
        this.canvas_inst.hotspotY = this.inst.hotspotY;
        
        if (this.is_back)
        {
            // move mask down at z index
            var layer_insts = _layer.instances;
            layer_insts.pop();
            var inst_index = layer_insts.indexOf(this.inst);
            layer_insts.splice(inst_index, 0, this.canvas_inst);
        }
	};
       
	behinstProto._pin_canvas_to_inst = function ()
	{
	    var canvas_inst = this.canvas_inst;
        if (canvas_inst == null)
            return;
            
        var reflash = false;     
        if (canvas_inst.x != this.inst.x)
        {
            canvas_inst.x = this.inst.x;
            reflash = true;
        }
        if (canvas_inst.y != this.inst.y)
        {
            canvas_inst.y = this.inst.y;
            reflash = true;
        }   
        if (reflash)
        {
            canvas_inst.set_bbox_changed();
            canvas_inst.runtime.redraw = true; 
            canvas_inst.update_tex = true; 
        }
	};
    
    var start_radians = cr.to_radians(-90);
	behinstProto._cd_mask = function (percentage)
	{
	    this._create_canvas();    
	    if (percentage > 1)
	        percentage = 1;	      
	    var inst = this.canvas_inst;
	    var ctx = inst.ctx;
	    var width = inst.canvas.width;
	    var height = inst.canvas.height;
	    ctx.clearRect(0,0,width,height);
	    
	    var center_x = width/2;
	    var center_y = height/2; 
	    var radius;
	    if (this.is_circle)
	        radius = Math.min(center_x, center_y);
	    else
	        radius = Math.max(width, height) *2 ;	    
	    if (percentage == 1)
	    {
	        ctx.fillStyle = this.mask_color;
	        if (this.is_circle)
	        {
		        ctx.beginPath();
		        ctx.arc(center_x, center_y, radius, 0, cr.to_radians(360), true);
		        ctx.fill();          
	        }
	        else 	       
	            ctx.fillRect(0,0,width,height);
	    }	   
	    else if (percentage > 0)
	    {
	        var end_angle = (360*(1-percentage)) -90;
	        ctx.beginPath();
	        ctx.moveTo(center_x, center_y);
	        ctx.lineTo(center_x, center_y - radius);
	        ctx.arc(center_x, center_y, radius, 
	                start_radians, cr.to_radians(end_angle), 
	                true);
		    ctx.fillStyle = this.mask_color;
		    ctx.fill();
	    }
	    
	    inst.runtime.redraw = true;  
	    inst.update_tex = true;  
	};	
	
	behinstProto._pick_canvas_inst = function ()
	{
        this._create_canvas();
        var canvas_type = this.type.canvas_type;
        var sol = canvas_type.getCurrentSol();  
        sol.instances.push(this.canvas_inst);   
        sol.select_all = false; 
	};
	
	behinstProto.saveToJSON = function ()
	{ 
		return { "mc": this.mask_color
                };
	};
    
	behinstProto.loadFromJSON = function (o)
	{    
        this.mask_color = o["mc"];  
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	  
	Cnds.prototype.PickCanvas = function ()
	{
        this._pick_canvas_inst(); 
		return true;
	};	 
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.SetupCanvas = function (canvas_type)
	{
	    this.type.canvas_type = canvas_type;   
	}; 

	Acts.prototype.SetCoolDownPercentage = function(percentage)
	{
	    this._cd_mask(percentage);
	};

	Acts.prototype.SetMaskColor = function(color)
	{
	    this.mask_color = color;
	};  

	Acts.prototype.PickCanvas = function()
	{
        this._pick_canvas_inst();      
	};    
    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());