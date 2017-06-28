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
        this.minWidth = this.properties[1];
        this.minHeight = this.properties[2];
        
        this.maxWidth = this.inst.width;
        this.maxHeight = this.inst.height;
        this.is_resize_now = false;
        this.background_objects = {};        
        this.pre_width = this.inst.width;
        this.pre_height = this.inst.height;
        this.bgInsts_save = null;        
        
	    this.textObjType = this._textObjType_get();
	    this.get_TextHeight_handler = this.get_TextHeight_handler_get();
	    this.get_TextWidth_handler = this.get_TextWidth_handler_get();
        
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
        // 2. resize text inst
        if (this.is_resize_now && !this._text_changed_get(this.textObjType))
        {
            this.resize();
        }
        
	};
	
	behinstProto.tick2 = function ()
	{
        if (!this.is_auto_resize)
            return;
            
        // 1. this tick will render text ( text had chnaged ) with max width 
        if (this._text_changed_get())
        {
            this.prepare_draw();
        }    
	};

    behinstProto.prepare_draw = function ()
	{
        var inst = this.inst;
        // use the max width to render text
        inst.width = this.maxWidth;
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
        var new_width= this.get_TextWidth() + 1;        
        new_width = cr.clamp(new_width, this.minWidth, this.maxWidth);

        var new_height = this.get_TextHeight() + 1;
        if (new_height < this.minHeight)        
            new_height = this.minHeight;
        
        var inst=this.inst, is_resized=false;
        if ((new_width !== inst.width) || (new_height !== inst.height))
        {
            this.setInstSize(new_width, new_height);        
            is_resized = true;
        }
        
        return is_resized;
	};  

    behinstProto.setInstSize = function (width, height)
    {
        var inst=this.inst;
        inst.width = width;
        inst.height = height;       
        inst.set_bbox_changed();             
        
        // prevent wrap text again
        switch (this.textObjType)
        {
        case "Text":                  inst.lastwrapwidth = width;  break;
        case "Spritefont2":        inst.lastwrapwidth = width;  break;
        case "rex_TagText":      inst.lastwrapwidth = width;  break;
        case "rex_bbcodeText": inst.lastwrapwidth = width;  break;  
        }        
    }
		
	behinstProto.resize_background = function ()
	{  
        var my_width = this.inst.width;
        var my_height = this.inst.height;
        
        var dw = this.inst.width - this.maxWidth;
        var dh = this.inst.height - this.maxHeight;
        var w, h;
        
        var uid, bg_obj, bg_inst, resize_mode;
        for (uid in this.background_objects)
        {
            bg_obj = this.background_objects[uid];
            bg_inst = bg_obj["inst"];
            resize_mode = bg_obj["rm"];
            
            w = bg_obj["maxw"] + dw;
            h = bg_obj["maxh"] + dh;
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
        
	behinstProto._textObjType_get = function ()
	{
	    var textObjType;
        if (cr.plugins_.Text &&
		    (this.inst instanceof cr.plugins_.Text.prototype.Instance))		
	        textObjType = "Text";	    
	    else if (cr.plugins_.Spritefont2 &&
		         (this.inst instanceof cr.plugins_.Spritefont2.prototype.Instance))
			textObjType = "Spritefont2";	  
	    else if (cr.plugins_.rex_TagText &&
		         (this.inst instanceof cr.plugins_.rex_TagText.prototype.Instance))
		    textObjType = "rex_TagText";
	    else if (cr.plugins_.rex_bbcodeText &&
		         (this.inst instanceof cr.plugins_.rex_bbcodeText.prototype.Instance))
		    textObjType = "rex_bbcodeText";            
		else
		    textObjType = "";	 
		return textObjType;
	};	
 	           
    behinstProto.get_TextHeight_handler_get = function ()
    {
        switch (this.textObjType)
        {
        case "Text":                  return cr.plugins_.Text.prototype.exps.TextHeight;	
        case "Spritefont2":        return cr.plugins_.Spritefont2.prototype.exps.TextHeight;	
        case "rex_TagText":      return cr.plugins_.rex_TagText.prototype.exps.TextHeight;	
        case "rex_bbcodeText": return cr.plugins_.rex_bbcodeText.prototype.exps.TextHeight;        
        }
    };
    
    behinstProto.get_TextWidth_handler_get = function ()
    {
        switch (this.textObjType)
        {
        case "Text":                  return cr.plugins_.Text.prototype.exps.TextWidth;	
        case "Spritefont2":        return cr.plugins_.Spritefont2.prototype.exps.TextWidth;	
        case "rex_TagText":      return cr.plugins_.rex_TagText.prototype.exps.TextWidth;	
        case "rex_bbcodeText": return cr.plugins_.rex_bbcodeText.prototype.exps.TextWidth;        
        }
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
    
	behinstProto._text_changed_get = function ()
	{
        switch (this.textObjType)
        {
        case "Text":                  return this.inst.text_changed;
        case "Spritefont2":        return this.inst.text_changed;	 
        case "rex_TagText":      return this.inst.text_changed;	 
        case "rex_bbcodeText": return this.inst.text_changed;	   
        }
	};	    
	
	behinstProto.saveToJSON = function ()
	{
	    var uid, bg_insts_save = {}, bgInfo;
	    for (uid in this.background_objects)
	    {
            bgInfo = this.background_objects[uid];
	        bg_insts_save[uid] = {
               "rm": bgInfo["rm"],
               "maxw": bgInfo["maxw"],
               "maxh": bgInfo["maxh"],
            };
	    }
	    
		return {
            "minw":this.minWidth,
            "minh":this.minHeight,
			"maxw": this.maxWidth,
            "maxh": this.maxHeight,
            "pw": this.pre_width,
            "ph": this.pre_height,
            "bg": bg_insts_save,
		};
	};   
    
	behinstProto.loadFromJSON = function (o)
	{
        this.minWidth = o["minw"];
        this.minHeight = o["minh"];
		this.maxWidth = o["maxw"];
        this.maxHeight = o["maxh"];
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
            uid = parseInt(uid);
	        bg_inst = this.runtime.getObjectByUID(uid);
	        assert2(bg_inst, "Failed to find background object by UID");
	        
	        this.background_objects[uid] = this.bgInsts_save[uid];
            this.background_objects[uid]["inst"] = bg_inst;  
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
	    this.maxWidth = w;
	};
	
	Acts.prototype.SetMinWidth = function (w)
	{
	    this.minWidth = w;
	};
	
	Acts.prototype.SetMinHeight = function (h)
	{
	    this.minHeight = h;
	};
	
	Acts.prototype.AddBackground = function (obj, resize_mode)
	{
		if (!obj)
			return;
			
		var inst = obj.getFirstPicked();
		
		if (!inst)
			return;
	
        var bg_obj = {
            "inst":inst, 
            "rm": resize_mode,
            "maxw": inst.width,
            "maxh": inst.height,
        };
                      
        this.background_objects[inst.uid] = bg_obj;
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());