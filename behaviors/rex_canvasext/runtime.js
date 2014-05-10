// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_CanvasExt = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_CanvasExt.prototype;
		
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
	    this.webGL_texture = null;
	};  
	
	behinstProto.tick = function ()
	{
	};
 	
	//helper function
	behinstProto.draw_instances = function (instances, canvas_inst, blend_mode)
	{
	    var ctx = canvas_inst.ctx;
	    var canvas = canvas_inst.canvas;
	    var mode_save;
	    var i, cnt=instances.length, inst;
		for(i=0; i<cnt; i++)
		{
		    inst = instances[i];
			if(inst.visible==false && this.runtime.testOverlap(canvas_inst, inst)== false)
				continue;
			
			ctx.save();
			ctx.scale(canvas.width/canvas_inst.width, canvas.height/canvas_inst.height);
			ctx.rotate(-canvas_inst.angle);
			ctx.translate(-canvas_inst.bquad.tlx, -canvas_inst.bquad.tly);
			mode_save = inst.compositeOp;
			inst.compositeOp = blend_mode;
            ctx.globalCompositeOperation = blend_mode;
			inst.draw(ctx);		
			inst.compositeOp = mode_save;	
			ctx.restore();
		}
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	Cnds.prototype.OnURLLoaded = function ()
	{
		return true;
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	// http://www.scirra.com/forum/plugin-canvas_topic46006_post289303.html#289303
	Acts.prototype.EraseObject = function (object)
	{
	    var canvas_inst = this.inst;	
		this.inst.update_bbox();
		
		var sol = object.getCurrentSol();
		var instances;
		if (sol.select_all)
			instances = sol.type.instances;
		else
			instances = sol.instances;
		
		this.draw_instances(instances, canvas_inst, "destination-out");
		
		this.inst.runtime.redraw = true;
        this.inst.update_tex = true;  
	};
	
	Acts.prototype.LoadURL = function (url_, resize_)
	{
		var img = new Image();
		var self = this;
		var curFrame_ = this.curFrame;
		
		img.onload = function ()
		{
		    var inst = self.inst;

			if ((resize_ === 0) && 
			    ((inst.width != img.width) || (inst.height != img.height)))
			{
				inst.width = img.width;
				inst.height = img.height;
				inst.set_bbox_changed();
				inst.canvas.width = inst.width;
				inst.canvas.height = inst.height;                
			}
            
            inst.ctx.clearRect(0,0, inst.canvas.width, inst.canvas.height);
		    inst.ctx.drawImage(img, 0, 0, inst.width, inst.height);
			
			// WebGL renderer: need to create texture (canvas2D just draws with img directly)
			if (self.runtime.glwrap)
			{
				if (self.webGL_texture)
					self.runtime.glwrap.deleteTexture(self.webGL_texture);
					
				self.webGL_texture = self.runtime.glwrap.loadTexture(img, false, self.runtime.linearSampling);
			}
			
			self.runtime.redraw = true;
            inst.update_tex = true; 
			self.runtime.trigger(cr.behaviors.Rex_CanvasExt.prototype.cnds.OnURLLoaded, inst);
		};
		
		if (url_.substr(0, 5) !== "data:")
			img.crossOrigin = 'anonymous';
		
		img.src = url_;
	};
	 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());