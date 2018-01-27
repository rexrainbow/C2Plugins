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
		this.text_type = this.get_text_type();          
	};  
	
	behinstProto.tick = function ()
	{
	};
	
   	behinstProto.get_text_type = function ()
	{
	    var text_type;
        if (cr.plugins_.Text &&
		    (this.inst instanceof cr.plugins_.Text.prototype.Instance))		
	        text_type = "Text";	    
	    else if (cr.plugins_.Spritefont2 &&
		         (this.inst instanceof cr.plugins_.Spritefont2.prototype.Instance))
			text_type = "Spritefont2";	  
	    else if (cr.plugins_.TextBox &&
		         (this.inst instanceof cr.plugins_.TextBox.prototype.Instance))
		    text_type = "TextBox";					
	    else if (cr.plugins_.rex_TagText &&
		         (this.inst instanceof cr.plugins_.rex_TagText.prototype.Instance))
		    text_type = "rex_TagText";   
	    else if (cr.plugins_.rex_bbcodeText &&
		         (this.inst instanceof cr.plugins_.rex_bbcodeText.prototype.Instance))
		    text_type = "rex_bbcodeText";                
		else
		    text_type = "";	 
		return text_type;
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
	behinstProto.drawText = function ()
	{               
        // render all content
        var inst = this.inst;               
        var ctx = (this.runtime.enableWebGL)? 
                  this._get_webgl_ctx():this.runtime.ctx;
        inst.draw(ctx);                      // call this function to get lines        
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
        if (this.text_type === "Spritefont2")
        {
            cr.plugins_.Spritefont2.prototype.acts.SetHAlign.call(this.inst, align);
        }        
	    else // Text, rex_TagText, rex_bbcodeText
	    {
	        if (this.inst.halign != align)
	        {
	            this.inst.need_text_redraw = true;
	            this.runtime.redraw = true;
	        }
	        
            this.inst.halign = align;   // 0=left, 1=center, 2=right
        }
	};

	Acts.prototype.SetVerticalAlignment = function(align)
	{
        if (this.text_type === "Spritefont2")
        {
            cr.plugins_.Spritefont2.prototype.acts.SetVAlign.call(this.inst, align);
        }
	    else // Text, rex_TagText, rex_bbcodeText
	    {	    
	        if (this.inst.valign != align)
	        {
	            this.inst.need_text_redraw = true;
	            this.runtime.redraw = true;
	        }	    
            
            this.inst.valign = align;   // 0=top, 1=center, 2=bottom
        }
 
	};	

	Acts.prototype.SetWrapping = function(wrap_mode)
	{
	    wrap_mode = (wrap_mode === 0);  // 0=word, 1=character
        if (this.text_type === "Spritefont2")
        {
	        if (this.inst.wrapbyword != wrap_mode)
	        {
			    this.inst.text_changed = true;
			    this.runtime.redraw = true;
	        }
	        
            this.inst.wrapbyword = wrap_mode;  
        }
	    else // Text, rex_TagText, rex_bbcodeText
	    {	            
	        if (this.inst.wrapbyword != wrap_mode)
	        {
	            this.inst.need_text_redraw = true;
	            this.runtime.redraw = true;
	        }
	        
            this.inst.wrapbyword = wrap_mode;   
        }     
	};

	Acts.prototype.SetLineHeight = function(line_height_offset)
	{
        if (this.text_type === "Spritefont2")
        {
            cr.plugins_.Spritefont2.prototype.acts.SetLineHeight.call(this.inst, line_height_offset);
        }        
	    else // Text, rex_TagText, rex_bbcodeText
	    {		    
	        if (this.inst.line_height_offset != line_height_offset)
	        {
	            this.inst.need_text_redraw = true;
	            this.runtime.redraw = true;
	        }
	        	    
            this.inst.line_height_offset = line_height_offset;
        }         
	};	
	
	Acts.prototype.SetFontFace = function (face_, style_)
	{
        if (this.text_type === "Spritefont2")
        {
            // not support
        }         
	    else // Text, rex_TagText, rex_bbcodeText
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

    Exps.prototype.LineBreakContent = function (ret)
	{
        this.drawText();
        var content;
        if ((this.text_type === "Text") || (this.text_type === "Spritefont2"))
        {
            content = this.inst.lines.join("\n");
        }
        else if ((this.text_type === "rex_TagText") || (this.text_type === "rex_bbcodeText"))
        {
            var pensMgr = this.inst.copyPensMgr(); 
            var cnt = pensMgr.getLines().length;
            var lines = [];
            for (var i=0; i<cnt; i++)            
            {
              // get start chart index     
              var si = pensMgr.getLineStartChartIndex(i);
              // get end chart index
              var ei = pensMgr.getLineEndChartIndex(i);
              var txt = pensMgr.getSliceTagText(si, ei+1);                
              lines.push(txt);
            }
            content = lines.join("\n");
        }        
	    ret.set_string( content );
	};
    
}());