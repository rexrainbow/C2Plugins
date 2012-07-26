// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_afterimage = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_afterimage.prototype;
		
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
	    this._shadow_count = this.properties[0];
	    this.canvas_inst = null;
	    this._shadow_pos = []; 
        this.pre_pos = {x:0,y:0};  
        this.saved_info = {};        
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
	    if (this.type.canvas_type == null)
	        return;
	        
	    this._position_update();
	    this._create_canvas();
	    this._draw_shadow();
	};
	
	behinstProto._position_update = function ()
	{  	    
        // tail is the newest one  
        if ((this.pre_pos.x != this.inst.x) || (this.pre_pos.y != this.inst.y))
        {
            this._shadow_pos.push({x:this.inst.x,y:this.inst.y});
            this.pre_pos.x = this.inst.x;
            this.pre_pos.y = this.inst.y;
        }
        else 
            this._shadow_pos.push(null);
	    if (this._shadow_pos.length > this._shadow_count)
	        this._shadow_pos.shift();
	};
		
	behinstProto._create_canvas = function ()
	{
	    if (this.canvas_inst != null)
	        return;
	        
	    var canvas_type = this.type.canvas_type;
	    var _layer = this.runtime.getLayerByNumber(this.inst.layer.index);
	    var _x = 0;
	    var _y = 0;        
        this.canvas_inst = this.runtime.createInstance(canvas_type,_layer,_x,_y);
        this.canvas_inst.angle = 0;
        this.canvas_inst.width = this.runtime.width;//this.inst.width;
        this.canvas_inst.height = this.runtime.height;//this.inst.height;
        this.canvas_inst.canvas.width=this.canvas_inst.width;
		this.canvas_inst.canvas.height=this.canvas_inst.height;        
        //this.canvas_inst.hotspotX = this.inst.hotspotX;
        //this.canvas_inst.hotspotY = this.inst.hotspotY;
        
        // move shadow down at z index
        var layer_insts = _layer.instances;
        layer_insts.pop();
        var inst_index = layer_insts.indexOf(this.inst);
        layer_insts.splice(inst_index, 0, this.canvas_inst);
	};
    
	behinstProto._paste_sprite_image = function (_x, _y, _percentage)
	{
	    this._save_info();
	    
	    // set image x,y,opacity
	    this.inst.x = _x;
	    this.inst.y = _y;
	    //this.inst.opacity = opacity_save * _percentage;
	    
	    // draw on canvas
	    var canvas = this.canvas_inst;
	    var ctx = canvas.ctx;  
	    ctx.save();	    
	    this.inst.draw(ctx);
	    ctx.restore();
	    canvas.runtime.redraw = true;
	    
	    this._restore_info();   
	};
	
	behinstProto._save_info = function ()
	{  	    
	    this.saved_info.x = this.inst.x;
	    this.saved_info.y = this.inst.y;
	    this.saved_info.opacity = this.inst.opacity;
	};  

	behinstProto._restore_info = function ()
	{  	    
	    this.inst.x = this.saved_info.x;
	    this.inst.y = this.saved_info.y;
	    this.inst.opacity = this.saved_info.opacity;	
	};    
	
	behinstProto._clean_canvas = function ()
	{
	    var canvas = this.canvas_inst;
	    canvas.ctx.clearRect(0,0,canvas.canvas.width, canvas.canvas.height);
	};	 
       
	behinstProto._draw_shadow = function ()
	{
	    this._clean_canvas();
	    var pos, i;
	    var cnt = this._shadow_pos.length-1;
	    for (i=cnt-1; i>= 0; i--)
	    {
	        pos = this._shadow_pos[i];
	        if (pos == null)
	           continue;
	        this._paste_sprite_image(pos.x, pos.y, (cnt-i)/(cnt+1));
	    }
	};	       
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.SetupCanvas = function (canvas_type)
	{
	    this.type.canvas_type = canvas_type;  
	}; 

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());