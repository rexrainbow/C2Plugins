// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_text_properties = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_text_properties.prototype;
		
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
	};  
	
	behinstProto.tick = function ()
	{
	};
 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetHorizontalAlignment = function(align)
	{
	    if (this.inst.halign != align)
	    {
	        this.inst.need_text_redraw = true;
	        this.runtime.redraw = true;
	    }
	    
        this.inst.halign = align;   // 0=left, 1=center, 2=right
	};

	Acts.prototype.SetVerticalAlignment = function(align)
	{
	    if (this.inst.valign != align)
	    {
	        this.inst.need_text_redraw = true;
	        this.runtime.redraw = true;
	    }	    
  
        this.inst.valign = align;   // 0=top, 1=center, 2=bottom
	};	

	Acts.prototype.SetWrapping = function(wrap_mode)
	{
	    wrap_mode = (wrap_mode === 0);  // 0=word, 1=character
	    if (this.inst.wrapbyword != wrap_mode)
	    {
	        this.inst.need_text_redraw = true;
	        this.runtime.redraw = true;
	    }
	    
        this.inst.wrapbyword = wrap_mode;   
	};

	Acts.prototype.SetLineHeight = function(line_height_offset)
	{
	    if (this.inst.line_height_offset != line_height_offset)
	    {
	        this.inst.need_text_redraw = true;
	        this.runtime.redraw = true;
	    }
	    	    
        this.inst.line_height_offset = line_height_offset;
	};	
	
	Acts.prototype.SetFontFace = function (face_, style_)
	{
		var newstyle = "";
		
		switch (style_) {
		case 1: newstyle = "bold"; break;
		case 2: newstyle = "italic"; break;
		case 3: newstyle = "bold italic"; break;
		}
		
		var inst = this.inst;
		if (face_ === inst.facename && newstyle === inst.fontstyle)
			return;		// no change
			
		inst.facename = face_;
		inst.fontstyle = newstyle;
		inst.updateFont();
	};  
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());