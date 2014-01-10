// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Canvas_Fan = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Canvas_Fan.prototype;
		
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
	    this.start_angle = this.properties[1];
	    this.delta_angle = this.properties[2];
	    this.drawing_duration = this.properties[3];
	    this.filled_color = this.properties[4];
	    this.is_circle = (this.properties[5] == 1);	 
	     
	    this.remain_time = 0;
	    this.is_running = false;
	    if (this.properties[0] == 1)
	        this.start_drawing();
	        
	    this.is_my_call = false;	        
	};  
	
	behinstProto.tick = function ()
	{
	    if (!this.is_running)
	        return;
	    
	    var percentage = this.percentage_get();
	    this.draw_fan(percentage);
	    
	    if (percentage == 1)
	    {
	        this.is_my_call = true;
	        this.runtime.trigger(cr.behaviors.Rex_Canvas_Fan.prototype.cnds.OnFinished, this.inst); 
	        this.is_my_call = false;
	        this.is_running = false;
	    }
	};
	
	behinstProto.start_drawing = function ()
	{
	    this.remain_time = this.drawing_duration;
	    this.is_running = true;
	};

	behinstProto.percentage_get = function ()
	{
	    var dt = this.runtime.getDt(this.inst);
	    this.remain_time -= dt;
	    if (this.remain_time < 0)
	        this.remain_time = 0;
	    var percentage = 1- (this.remain_time/this.drawing_duration);
	    return percentage;
	};	
		
	behinstProto.draw_fan = function(percentage)
	{               
	    var ctx = ctx = this.inst.ctx;
	    var width = this.inst.canvas.width;
	    var height = this.inst.canvas.height;
	    ctx.clearRect(0,0,width,height);
	    
	    var center_x = width/2;
	    var center_y = height/2; 
	    var radius;
	    if (this.is_circle)
	        radius = Math.min(center_x, center_y);
	    else
	        radius = Math.max(width, height) *2;
	              

        if ( (percentage == 1) && 
             ( (this.delta_angle==180) || (this.delta_angle==-180) ) )
        {
            // filled all
            if (this.delta_angle==180)
            {
                ctx.beginPath();
                ctx.arc(center_x, center_y, radius, 
	                    0, cr.to_radians(360), 
	                    false);
                ctx.fillStyle = this.filled_color;
		        ctx.fill();	                     
            }
        }
        else
        {
	        var delta_angle = this.delta_angle * percentage;	    
	        var start_radians = cr.to_clamped_radians(this.start_angle - delta_angle);
	        var end_radians = cr.to_clamped_radians(this.start_angle + delta_angle);
	        ctx.beginPath();
	        ctx.moveTo(center_x, center_y);
	        ctx.lineTo( center_x + (radius*Math.cos(start_radians)), 
	                    center_y + (radius*Math.sin(start_radians))  );
	        ctx.arc(center_x, center_y, radius, 
	                start_radians, end_radians, 
	                false);
		    ctx.fillStyle = this.filled_color;
		    ctx.fill();
	    }
	    
	    this.inst.runtime.redraw = true;  
	    this.inst.update_tex = true;  	        
	};  	

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	  
	Cnds.prototype.OnFinished = function ()
	{        
		return this.is_my_call;
	};
	
	Cnds.prototype.IsDrawing = function ()
	{        
		return this.is_running;
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	Acts.prototype.Start = function()
	{	    
	    this.start_drawing();
	}; 
	Acts.prototype.Pause = function()
	{
	    if (this.is_running && (this.remain_time >0))
	        this.is_running = false;
	}; 	
	Acts.prototype.Resume = function()
	{
	    if ((!this.is_running) && (this.remain_time >0))
	        this.is_running = true;	    
	}; 		
	Acts.prototype.SetStartAngle = function(a)
	{
	    this.start_angle = a;
	}; 	
	Acts.prototype.SetDuration = function(s)
	{
	    this.drawing_duration = s;
	}; 		
	Acts.prototype.SetFilledColor = function(color)
	{
	    this.filled_color = color;
	}; 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

    Exps.prototype.StartAngle = function (ret)
	{       
	    ret.set_float(this.start_angle);
	};
	
    Exps.prototype.Duration = function (ret)
	{       
	    ret.set_float(this.drawing_duration);
	};	
	
    Exps.prototype.Color = function (ret)
	{       
	    ret.set_string(this.filled_color);
	};	
	
}());