// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_text_resize = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_text_resize.prototype;
		
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
        this.is_auto_resize = (this.properties[0] === 1);
        this.max_width = this.inst.width;
        this.is_resize_now = false;
        this.background_objects = {};        
        this.pre_width = this.inst.width;
        this.pre_height = this.inst.height;
        this.bgInsts_save = null;        
        
	    this.text_type = this._text_type_get();
	    this.get_TextHeight_handler = this.get_TextHeight_handler_get(this.text_type);
	    this.get_TextWidth_handler = this.get_TextWidth_handler_get(this.text_type);
        
		// Need to know if pinned object gets destroyed
		if (!this.recycled)
		{
		    this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this);
        }										
		this.runtime.addDestroyCallback(this.myDestroyCallback);        
	};  
	
	behinstProto.onInstanceDestroyed = function (inst)
	{
        var uid = inst.uid;
        if (this.background_objects.hasOwnProperty(uid))
            delete this.background_objects[uid];
	};
	
	behinstProto.onDestroy = function()
	{
        var uid;
		for (uid in this.background_objects)
            delete this.background_objects[uid];
            
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	
	behinstProto.tick = function ()
	{
        // resize
        if (this.is_resize_now && !this._text_changed_get(this.text_type))
        {
            this.resize();
        }
        
	};
	
	behinstProto.tick2 = function ()
	{
        if (!this.is_auto_resize)
            return;
            
        // this tick will render text
        if (this._text_changed_get(this.text_type))
        {
            this.prepare_draw();
        }    
	};

    behinstProto.prepare_draw = function ()
	{
        var inst = this.inst;
        // use the max width to render text
        inst.width = this.max_width;
        inst.set_bbox_changed();
            
        // resize next tick
        this.is_resize_now = true;
	};
    
    behinstProto.force_draw = function ()
	{
        // render text
        this.prepare_draw();
        var ctx = (this.runtime.enableWebGL)? 
                  this._get_webgl_ctx():this.runtime.ctx;
                  
        var inst = this.inst;
        inst.draw(ctx);
        
        // draw text at normal render stage
        inst.text_changed = true;
        inst.runtime.redraw = true;        
	};
	
    behinstProto._get_webgl_ctx = function ()
	{
        var inst = this.inst;            
        var ctx = inst.myctx;
		if (!ctx)
		{
			inst.mycanvas = document.createElement("canvas");
            var scaledwidth = Math.ceil(inst.layer.getScale()*inst.width);
            var scaledheight = Math.ceil(inst.layer.getAngle()*inst.height);
			inst.mycanvas.width = scaledwidth;
			inst.mycanvas.height = scaledheight;
			inst.lastwidth = scaledwidth;
			inst.lastheight = scaledheight;
			inst.myctx = inst.mycanvas.getContext("2d");
            ctx = inst.myctx;
		}
        return ctx;
	};
    
    
	behinstProto.resize = function ()
	{
        this.is_resize_now = false; 
                    
        var is_resized = this.resize_myself();

        if (is_resized)
        {        
            this.resize_background();
            this.save_current_size();        
            this.runtime.trigger(cr.behaviors.Rex_text_resize.prototype.cnds.OnSizeChanged, this.inst);
        }
	};  
	    
	behinstProto.resize_myself = function ()
	{
        var new_height = this.get_TextHeight() + 1;
        var new_width= this.get_TextWidth() + 1;
        
        if (new_width > this.max_width)
            new_width = this.max_width;
                	    
        var inst=this.inst, is_resized=false;
        if ((new_width !== inst.width) || (new_height !== inst.height))
        {
            inst.width = new_width;            
            inst.height = new_height;
            inst.set_bbox_changed();      
            is_resized = true;
        }
        
        return is_resized;
	};     
		
	behinstProto.resize_background = function ()
	{  
        var my_width = this.inst.width;
        var my_height = this.inst.height;
        
        var dw = this.inst.width - this.pre_width;
        var dh = this.inst.height - this.pre_height;
        var w, h;
        
        var uid, bg_obj, bg_inst, resize_mode;
        for (uid in this.background_objects)
        {
            bg_obj = this.background_objects[uid];
            bg_inst = bg_obj["inst"];
            resize_mode = bg_obj["rm"];
            
            w = bg_inst.width + dw;
            h = bg_inst.height + dh;
            if (resize_mode === 0)
            {
                if (  (bg_inst.width !== w) || (bg_inst.height !== h)  )
                {                
                    bg_inst.height = h;
                    bg_inst.width = w;
                    bg_inst.set_bbox_changed(); 
                }
            }
            
            else if (resize_mode === 1)
            {
                if (bg_inst.height !== h)
                {
                    bg_inst.height = h;
                    bg_inst.set_bbox_changed();                 
                }
            }
        }
	};  
	
	behinstProto.save_current_size = function ()
	{
        this.pre_width = this.inst.width;
        this.pre_height = this.inst.height;
	};  	      
        
	behinstProto._text_type_get = function ()
	{
	    var text_type;
        if (cr.plugins_.Text &&
		    (this.inst instanceof cr.plugins_.Text.prototype.Instance))		
	        text_type = "Text";	    
	    else if (cr.plugins_.Spritefont2 &&
		         (this.inst instanceof cr.plugins_.Spritefont2.prototype.Instance))
			text_type = "Spritefont2";	  
	    else if (cr.plugins_.rex_TagText &&
		         (this.inst instanceof cr.plugins_.rex_TagText.prototype.Instance))
		    text_type = "rex_TagText";
		else
		    text_type = "";	 
		return text_type;
	};	
 	           
    behinstProto.get_TextHeight_handler_get = function (text_type)
    {
	    var get_TextHeight_handler;
        if (text_type === "Text")		
	        get_TextHeight_handler = cr.plugins_.Text.prototype.exps.TextHeight;	    
	    else if (text_type === "Spritefont2")	
			get_TextHeight_handler = cr.plugins_.Spritefont2.prototype.exps.TextHeight;		
	    else if (text_type === "rex_TagText")	
			get_TextHeight_handler = cr.plugins_.rex_TagText.prototype.exps.TextHeight;		
	    else
		    get_TextHeight_handler = null;
	    return get_TextHeight_handler;
    };
    
    behinstProto.get_TextWidth_handler_get = function (text_type)
    {
	    var get_TextWidth_handler;
        if (text_type === "Text")		
	        get_TextWidth_handler = cr.plugins_.Text.prototype.exps.TextWidth;	    
	    else if (text_type === "Spritefont2")	
			get_TextWidth_handler = cr.plugins_.Spritefont2.prototype.exps.TextWidth;		
	    else if (text_type === "rex_TagText")	
			get_TextWidth_handler = cr.plugins_.rex_TagText.prototype.exps.TextWidth;		
	    else
		    get_TextWidth_handler = null;
	    return get_TextWidth_handler;
    };      
 	           
 	var fake_ret = {value:0,
	                set_any: function(value){this.value=value;},
	                set_int: function(value){this.value=value;},	 
                    set_float: function(value){this.value=value;},	 
                    set_string: function(value){this.value=value;},	    
	               };
	               
	behinstProto.get_TextHeight = function ()
	{
        this.get_TextHeight_handler.call(this.inst, fake_ret);
        return fake_ret.value;
	}; 
	
	behinstProto.get_TextWidth = function ()
	{
        this.get_TextWidth_handler.call(this.inst, fake_ret);
        return fake_ret.value;
	}; 	
    
	behinstProto._text_changed_get = function (text_type)
	{
	    var text_changed;
        if (text_type === "Text")		
	        text_changed = this.inst.text_changed;	    
	    else if (text_type === "Spritefont2")	
			text_changed = this.inst.text_changed;	 
	    else if (text_type === "rex_TagText")	
			text_changed = this.inst.text_changed;	 		
	    else
		    text_changed = null;
	    return text_changed;
	};	    
	
	behinstProto.saveToJSON = function ()
	{
	    var uid, bg_insts_save = {};
	    for (uid in this.background_objects)
	    {
	        bg_insts_save[uid] = this.background_objects[uid]["rm"];
	    }
	    
		return {
			"mw": this.max_width,
            "pw": this.pre_width,
            "ph": this.pre_height,
            "bg": bg_insts_save,
		};
	};   
    
	behinstProto.loadFromJSON = function (o)
	{
		this.max_width = o["mw"];
		this.pre_width = o["pw"];
		this.pre_height = o["ph"];		
		this.bgInsts_save = o["bg"];
	};
	
	behinstProto.afterLoad = function ()
	{	    
	    var uid;
	    for(uid in this.background_objects)
	        delete this.background_objects[uid];
	        
	    var bg_inst, rm;
	    for(uid in this.bgInsts_save)
	    {
	        rm = this.bgInsts_save[uid];
	        bg_inst = this.runtime.getObjectByUID(uid);
	        assert2(bg_inst, "Failed to find background object by UID");
	        
	        this.background_objects[parseInt(uid)] = { "inst": bg_inst, 
	                                                   "rm":rm };
	                                         	                                        
	    }   
	    
	    this.bgInsts_save = null; 
	};    	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnSizeChanged = function ()
	{
		return true;
	};    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.Resize = function ()
	{         
	    this.force_draw();
	    this.resize();
	};
	
	Acts.prototype.SetMaxWidth = function (w)
	{
	    this.max_width = w;
	};
	
	Acts.prototype.AddBackground = function (obj, resize_mode)
	{
		if (!obj)
			return;
			
		var inst = obj.getFirstPicked();
		
		if (!inst)
			return;
	
        var bg_obj = {"inst":inst, 
                      "rm": resize_mode};
                      
        this.background_objects[inst.uid] = bg_obj;
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());