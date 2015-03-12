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
	    this.text_type = this._text_type_get();
	};  
	
	behinstProto.tick = function ()
	{
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
	    if (this.text_type === "Text")
	    {
	        if (this.inst.halign != align)
	        {
	            this.inst.need_text_redraw = true;
	            this.runtime.redraw = true;
	        }
	        
            this.inst.halign = align;   // 0=left, 1=center, 2=right
        }
        else if (this.text_type === "Spritefont2")
        {
            cr.plugins_.Spritefont2.prototype.acts.SetHAlign.call(this.inst, align);
        }
	};

	Acts.prototype.SetVerticalAlignment = function(align)
	{
	    if (this.text_type === "Text")
	    {	    
	        if (this.inst.valign != align)
	        {
	            this.inst.need_text_redraw = true;
	            this.runtime.redraw = true;
	        }	    
            
            this.inst.valign = align;   // 0=top, 1=center, 2=bottom
        }
        else if (this.text_type === "Spritefont2")
        {
            cr.plugins_.Spritefont2.prototype.acts.SetVAlign.call(this.inst, align);
        }        
	};	

	Acts.prototype.SetWrapping = function(wrap_mode)
	{
	    wrap_mode = (wrap_mode === 0);  // 0=word, 1=character
	    if (this.text_type === "Text")
	    {	            
	        if (this.inst.wrapbyword != wrap_mode)
	        {
	            this.inst.need_text_redraw = true;
	            this.runtime.redraw = true;
	        }
	        
            this.inst.wrapbyword = wrap_mode;   
        }
        else if (this.text_type === "Spritefont2")
        {
	        if (this.inst.wrapbyword != wrap_mode)
	        {
			    this.inst.text_changed = true;
			    this.runtime.redraw = true;
	        }
	        
            this.inst.wrapbyword = wrap_mode;  
        }         
	};

	Acts.prototype.SetLineHeight = function(line_height_offset)
	{
	    if (this.text_type === "Text")
	    {		    
	        if (this.inst.line_height_offset != line_height_offset)
	        {
	            this.inst.need_text_redraw = true;
	            this.runtime.redraw = true;
	        }
	        	    
            this.inst.line_height_offset = line_height_offset;
        }
        else if (this.text_type === "Spritefont2")
        {
            cr.plugins_.Spritefont2.prototype.acts.SetLineHeight.call(this.inst, line_height_offset);
        }         
	};	
	
	Acts.prototype.SetFontFace = function (face_, style_)
	{
	    if (this.text_type === "Text")
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
	    }
	};  
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());