// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.rex_TagText = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.rex_TagText.prototype;

	pluginProto.onCreate = function ()
	{
		// Override the 'set width' action
		pluginProto.acts.SetWidth = function (w)
		{
			if (this.width !== w)
			{
				this.width = w;
				this.text_changed = true;	// also recalculate text wrapping
				this.set_bbox_changed();
			}
		};
	};

	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};
	
	typeProto.onLostWebGLContext = function ()
	{
		if (this.is_family)
			return;
			
		var i, len, inst;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			inst.mycanvas = null;
			inst.myctx = null;
			inst.mytex = null;
		}
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		this.text_changed = true;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	var requestedWebFonts = {};		// already requested web fonts have an entry here
	
	instanceProto.onCreate = function()
	{
		this.text = this.properties[0];
		this.visible = (this.properties[1] === 0);		// 0=visible, 1=invisible
		
		// "[bold|italic] 12pt Arial"
		this.font = this.properties[2];
		
		this.color = this.properties[3];
		this.halign = this.properties[4];				// 0=left, 1=center, 2=right
		this.valign = this.properties[5];				// 0=top, 1=center, 2=bottom
		
		this.wrapbyword = (this.properties[7] === 0);	// 0=word, 1=character
		this.lastwidth = this.width;
		this.lastwrapwidth = this.width;
		this.lastheight = this.height;
		
		this.line_height_offset = this.properties[8];

		this.vshift = this.properties[10] * this.runtime.devicePixelRatio;
		
		// Get the font height in pixels.
		// Look for token ending "NNpt" in font string (e.g. "bold 12pt Arial").
		this.facename = "";
		this.fontstyle = "";
		this.ptSize = 0;
		this.textWidth = 0;
		this.textHeight = 0;
		
		this.parseFont();
		
		// For WebGL rendering
		this.mycanvas = null;
		this.myctx = null;
		this.mytex = null;
		this.need_text_redraw = false;
		this.last_render_tick = this.runtime.tickcount;
		
		if (this.recycled)
			this.rcTex.set(0, 0, 1, 1);
		else
			this.rcTex = new cr.rect(0, 0, 1, 1);
			
		// In WebGL renderer tick this text object to release memory if not rendered any more
		if (this.runtime.glwrap)
			this.runtime.tickMe(this);
		
		assert2(this.pxHeight, "Could not determine font text height");
		
        this._tag = null;
        if (!this.recycled)
        {
		    this.canvas_text = new cr.plugins_.rex_TagText.CanvasTextKlass();
        }
        this.canvas_text.Reset(this);
        this.canvas_text.textBaseline = (this.properties[9] == 0)? "alphabetic":"top";
		this.lines = this.canvas_text.rawTextLine;
	};
	
	instanceProto.parseFont = function ()
	{
		var arr = this.font.split(" ");
		
		var i;
		for (i = 0; i < arr.length; i++)
		{
			// Ends with 'pt'
			if (arr[i].substr(arr[i].length - 2, 2) === "pt")
			{
				this.ptSize = parseInt(arr[i].substr(0, arr[i].length - 2));
				this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
				
				if (i > 0)
					this.fontstyle = arr[i - 1];
				
				// Get the face name. Combine all the remaining tokens in case it's a space
				// separated font e.g. "Comic Sans MS"
				this.facename = arr[i + 1];
				
				for (i = i + 2; i < arr.length; i++)
					this.facename += " " + arr[i];
					
				break;
			}
		}
	};
	
	instanceProto.saveToJSON = function ()
	{
		return {
			"t": this.text,
			"f": this.font,
			"c": this.color,
			"ha": this.halign,
			"va": this.valign,
			"wr": this.wrapbyword,
			"lho": this.line_height_offset,
			"vs": this.vshift,
            "bl": this.canvas_text.textBaseline,
			"fn": this.facename,
			"fs": this.fontstyle,
			"ps": this.ptSize,
			"pxh": this.pxHeight,
			"tw": this.textWidth,
			"th": this.textHeight,
			"lrt": this.last_render_tick
		};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.text = o["t"];
		this.font = o["f"];
		this.color = o["c"];
		this.halign = o["ha"];
		this.valign = o["va"];
		this.wrapbyword = o["wr"];
		this.line_height_offset = o["lho"];
		this.vshift = o["vs"];
		this.facename = o["fn"];
		this.fontstyle = o["fs"];
		this.ptSize = o["ps"];
		this.pxHeight = o["pxh"];
		this.textWidth = o["tw"];
		this.textHeight = o["th"];
		this.last_render_tick = o["lrt"];
		
		this.text_changed = true;
		this.lastwidth = this.width;
		this.lastwrapwidth = this.width;
		this.lastheight = this.height;

        this.canvas_text.textBaseline = o["bl"];	
	};
	
	instanceProto.tick = function ()
	{
		// In WebGL renderer, if not rendered for 300 frames (about 5 seconds), assume
		// the object has gone off-screen and won't need its textures any more.
		// This allows us to free its canvas, context and WebGL texture to save memory.
		if (this.runtime.glwrap && this.mytex && (this.runtime.tickcount - this.last_render_tick >= 300))
		{
			// Only do this if on-screen, otherwise static scenes which aren't re-rendering will release
			// text objects that are on-screen.
			var layer = this.layer;
            this.update_bbox();
            var bbox = this.bbox;

            if (bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom)
			{
				this.runtime.glwrap.deleteTexture(this.mytex);
				this.mytex = null;
				this.myctx = null;
				this.mycanvas = null;
			}
		}
	};
	
	instanceProto.onDestroy = function ()
	{
		// Remove references to allow GC to collect and save memory
		this.myctx = null;
		this.mycanvas = null;
		
		if (this.runtime.glwrap && this.mytex)
			this.runtime.glwrap.deleteTexture(this.mytex);
		
		this.mytex = null;
	};
	
	instanceProto.updateFont = function ()
	{
		this.font = this.fontstyle + " " + this.ptSize.toString() + "pt " + this.facename;
		this.text_changed = true;
		this.runtime.redraw = true;
	};

	instanceProto.draw = function(ctx, glmode)
	{
	    if (this.text == "")
		    return;
			
        ctx.globalAlpha = glmode ? 1 : this.opacity;
            
		var myscale = 1;
		
		if (glmode)
		{
			myscale = this.layer.getScale();
			ctx.save();
			ctx.scale(myscale, myscale);
		}
		
		// If text has changed, run the word wrap.
		if (this.text_changed || this.width !== this.lastwrapwidth)
		{
            this.canvas_text.text_changed = true;  // it will update pens (wordwrap) to redraw
			this.text_changed = false;
			this.lastwrapwidth = this.width;
		}
		
		// Draw each line after word wrap
		this.update_bbox();
		var penX = glmode ? 0 : this.bquad.tlx;
		var penY = glmode ? 0 : this.bquad.tly;
		
		if (this.runtime.pixel_rounding)
		{
			penX = (penX + 0.5) | 0;
			penY = (penY + 0.5) | 0;
		}
		
		if (this.angle !== 0 && !glmode)
		{
			ctx.save();
			ctx.translate(penX, penY);
			ctx.rotate(this.angle);
			penX = 0;
			penY = 0;
		}

		var line_height = this.pxHeight;
		line_height += (this.line_height_offset * this.runtime.devicePixelRatio);
			
        // configure
        this.canvas_text.canvas = ctx.canvas;
        this.canvas_text.context = ctx;
        this.canvas_text.fontFamily = this.facename;
        this.canvas_text.fontSize = this.ptSize.toString() + "pt";
        this.canvas_text.fontStyle = this.fontstyle;
        this.canvas_text.fontColor = this.color;
        this.canvas_text.lineHeight = line_height;
      
        this.canvas_text.drawText({
            "text":this.text,
            "x": penX,
            "y": penY,
            "boxWidth": this.width,
            "boxHeight": this.height
        });
        
		
		if (this.angle !== 0 || glmode)
			ctx.restore();
			
		this.last_render_tick = this.runtime.tickcount;
	};
	
	instanceProto.drawGL = function(glw)
	{
		if (this.width < 1 || this.height < 1)
			return;
		
		var need_redraw = this.text_changed || this.need_text_redraw;
		this.need_text_redraw = false;
		var layer_scale = this.layer.getScale();
		var layer_angle = this.layer.getAngle();
		var rcTex = this.rcTex;
		
		// Calculate size taking in to account scale
		var floatscaledwidth = layer_scale * this.width;
		var floatscaledheight = layer_scale * this.height;
		var scaledwidth = Math.ceil(floatscaledwidth);
		var scaledheight = Math.ceil(floatscaledheight);
		
		var halfw = this.runtime.draw_width / 2;
		var halfh = this.runtime.draw_height / 2;
		
		// Create 2D context for this instance if not already
		if (!this.myctx)
		{
			this.mycanvas = document.createElement("canvas");
			this.mycanvas.width = scaledwidth;
			this.mycanvas.height = scaledheight;
			this.lastwidth = scaledwidth;
			this.lastheight = scaledheight;
			need_redraw = true;
			this.myctx = this.mycanvas.getContext("2d");
		}
		
		// Update size if changed
		if (scaledwidth !== this.lastwidth || scaledheight !== this.lastheight)
		{
			this.mycanvas.width = scaledwidth;
			this.mycanvas.height = scaledheight;
			
			if (this.mytex)
			{
				glw.deleteTexture(this.mytex);
				this.mytex = null;
			}
			
			need_redraw = true;
		}
		
		// Need to update the GL texture
		if (need_redraw)
		{
			// Draw to my context
			this.myctx.clearRect(0, 0, scaledwidth, scaledheight);
			this.draw(this.myctx, true);
			
			// Create GL texture if none exists
			// Create 16-bit textures (RGBA4) on mobile to reduce memory usage - quality impact on desktop
			// was almost imperceptible
			if (!this.mytex)
				this.mytex = glw.createEmptyTexture(scaledwidth, scaledheight, this.runtime.linearSampling, this.runtime.isMobile);
				
			// Copy context to GL texture
			glw.videoToTexture(this.mycanvas, this.mytex, this.runtime.isMobile);
		}
		
		this.lastwidth = scaledwidth;
		this.lastheight = scaledheight;
		
		// Draw GL texture
		glw.setTexture(this.mytex);
		glw.setOpacity(this.opacity);
		
		glw.resetModelView();
		glw.translate(-halfw, -halfh);
		glw.updateModelView();
		
		var q = this.bquad;
		
		// Temporarily ignore the devicePixelRatio when translating to the canvas so we get
		// canvas pixels and not CSS pixels. Otherwise text becomes misaligned.
		var old_dpr = this.runtime.devicePixelRatio;
		this.runtime.devicePixelRatio = 1;
		var tlx = this.layer.layerToCanvas(q.tlx, q.tly, true, true);
		var tly = this.layer.layerToCanvas(q.tlx, q.tly, false, true);
		var trx = this.layer.layerToCanvas(q.trx, q.try_, true, true);
		var try_ = this.layer.layerToCanvas(q.trx, q.try_, false, true);
		var brx = this.layer.layerToCanvas(q.brx, q.bry, true, true);
		var bry = this.layer.layerToCanvas(q.brx, q.bry, false, true);
		var blx = this.layer.layerToCanvas(q.blx, q.bly, true, true);
		var bly = this.layer.layerToCanvas(q.blx, q.bly, false, true);
		this.runtime.devicePixelRatio = old_dpr;
		
		if (this.runtime.pixel_rounding || (this.angle === 0 && layer_angle === 0))
		{
			var ox = ((tlx + 0.5) | 0) - tlx;
			var oy = ((tly + 0.5) | 0) - tly
			
			tlx += ox;
			tly += oy;
			trx += ox;
			try_ += oy;
			brx += ox;
			bry += oy;
			blx += ox;
			bly += oy;
		}
		
		if (this.angle === 0 && layer_angle === 0)
		{
			trx = tlx + scaledwidth;
			try_ = tly;
			brx = trx;
			bry = tly + scaledheight;
			blx = tlx;
			bly = bry;
			rcTex.right = 1;
			rcTex.bottom = 1;
		}
		else
		{
			rcTex.right = floatscaledwidth / scaledwidth;
			rcTex.bottom = floatscaledheight / scaledheight;
		}

		glw.quadTex(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex);
		
		glw.resetModelView();
		glw.scale(layer_scale, layer_scale);
		glw.rotateZ(-this.layer.getAngle());
		glw.translate((this.layer.viewLeft + this.layer.viewRight) / -2, (this.layer.viewTop + this.layer.viewBottom) / -2);
		glw.updateModelView();
		
		this.last_render_tick = this.runtime.tickcount;
	};

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": "Text",
			"properties": [
				{"name": "Text", "value": this.text},
				{"name": "Font", "value": this.font},
				{"name": "Line height", "value": this.line_height_offset},
				{"name": "Baseline", "value": this.canvas_text.textBaseline},
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		if (name === "Text")
			this.text = value;
		else if (name === "Font")
		{
			this.font = value;
			this.parseFont();
		}
		else if (name === "Line height")
			this.line_height_offset = value;
		
		this.text_changed = true;
			
	};
	/**END-PREVIEWONLY**/
	
	// export
	instanceProto.subTextGet = function (text, start, end)
	{
		return this.canvas_text.textGet(start, end, text);
	};
	instanceProto.rawTextGet = function (text)
	{
		return this.canvas_text.rawTextGet(text);
	};	

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.CompareText = function(text_to_compare, case_sensitive)
	{
		if (case_sensitive)
			return this.text == text_to_compare;
		else
			return cr.equals_nocase(this.text, text_to_compare);
	};
	Cnds.prototype.DefineClass = function(name)
	{
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		this._tag = {};
		if (solModifierAfterCnds)
		{
		    this.runtime.pushCopySol(current_event.solModifiers);
		    current_event.retrigger();
		    this.runtime.popSol(current_event.solModifiers);
		}
		else
		{
		    current_event.retrigger();
		}
		
		this.canvas_text.defineClass(name, this._tag);           
		return false;
	};	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.SetText = function(param)
	{
		if (cr.is_number(param) && param < 1e9)
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		
		var text_to_set = param.toString();
		
		if (this.text !== text_to_set)
		{
			this.text = text_to_set;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};
	
	Acts.prototype.AppendText = function(param)
	{
		if (cr.is_number(param))
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
			
		var text_to_append = param.toString();
		
		if (text_to_append)	// not empty
		{
			this.text += text_to_append;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};
	
	Acts.prototype.SetFontFace = function (face_, style_)
	{
		var newstyle = "";
		
		switch (style_) {
		case 1: newstyle = "bold"; break;
		case 2: newstyle = "italic"; break;
		case 3: newstyle = "bold italic"; break;
		}
		    	    
	    if (this._tag != null)  // <class> ... </class>
	    {
	        this._tag["fontFamily"] = face_;
	        this._tag["fontStyle"] = newstyle;	       
	    }
	    else    // global
	    {
	            	    
		    if (face_ === this.facename && newstyle === this.fontstyle)
		    	return;		// no change
		    	
		    this.facename = face_;
		    this.fontstyle = newstyle;
		    this.updateFont();
	    }
	};
	
	Acts.prototype.SetFontSize = function (size_)
	{	    
	    if (this._tag != null)  // <class> ... </class>
	    {
	        this._tag["fontSize"] = size_.toString() + "px";
	    }
	    else    // global
	    {
		    if (this.ptSize === size_)
		    	return;
            
		    this.ptSize = size_;
		    this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
		    this.updateFont();
	   }
	};
	
	Acts.prototype.SetFontColor = function (rgb)
	{        
	    var newcolor;
        if (typeof(rgb) == "number")        
            newcolor = "rgb(" + cr.GetRValue(rgb).toString() + "," + cr.GetGValue(rgb).toString() + "," + cr.GetBValue(rgb).toString() + ")";        
        else
            newcolor = rgb;
	    if (this._tag != null)  // <class> ... </class>
	    {
	        this._tag["fontColor"] = newcolor;
	    }
	    else    // global
	    {    		    
		    if (newcolor === this.color)
		    	return;
            
		    this.color = newcolor;
		    this.need_text_redraw = true;
		    this.runtime.redraw = true;
		}
	};
	
	Acts.prototype.SetWebFont = function (familyname_, cssurl_)
	{
		if (this.runtime.isDomFree)
		{
			cr.logexport("[Construct 2] Text plugin: 'Set web font' not supported on this platform - the action has been ignored");
			return;		// DC todo
		}
		
		var self = this;
		var refreshFunc = (function () {
							self.runtime.redraw = true;
							self.text_changed = true;
						});
        var newfacename = "'" + familyname_ + "'";
        
		// Already requested this web font?
		if (requestedWebFonts.hasOwnProperty(cssurl_))
		{
            
	        if (this._tag != null)  // <class> ... </class>
	        {
	            this._tag["fontFamily"] = newfacename;                             
	        }
	        else    // global
	        {
        
			    // Use it immediately without requesting again.  Whichever object
			    // made the original request will refresh the canvas when it finishes
			    // loading.
			    
			    if (this.facename === newfacename)
				    return;	// no change
				
			    this.facename = newfacename;
			    this.updateFont();
			
            }
            
            // There doesn't seem to be a good way to test if the font has loaded,
			// so just fire a refresh every 100ms for the first 1 second, then
			// every 1 second after that up to 10 sec - hopefully will have loaded by then!
			for (var i = 1; i < 10; i++)
			{
				setTimeout(refreshFunc, i * 100);
				setTimeout(refreshFunc, i * 1000);
			}
            
			return;            
		}
		
		// Otherwise start loading the web font now
		var wf = document.createElement("link");
		wf.href = cssurl_;
		wf.rel = "stylesheet";
		wf.type = "text/css";
		wf.onload = refreshFunc;
					
		document.getElementsByTagName('head')[0].appendChild(wf);
		requestedWebFonts[cssurl_] = true;
		
	    if (this._tag != null)  // <class> ... </class>
	    {
	        this._tag["fontFamily"] = newfacename;                              
	    }
        else
        {        
		    this.facename = "'" + familyname_ + "'";
		    this.updateFont();
		
           
		}
        
        // Another refresh hack
		for (var i = 1; i < 10; i++)
		{
			setTimeout(refreshFunc, i * 100);
			setTimeout(refreshFunc, i * 1000);
		} 
        
		log("Requesting web font '" + cssurl_ + "'... (tick " + this.runtime.tickcount.toString() + ")");
	};
	
	Acts.prototype.SetEffect = function (effect)
	{
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};
	
	Acts.prototype.SetFontStyle = function (style_)
	{
		var newstyle = "";
		
		switch (style_) {
		case 1: newstyle = "bold"; break;
		case 2: newstyle = "italic"; break;
		case 3: newstyle = "bold italic"; break;
		}
		    	    
	    if (this._tag != null)  // <class> ... </class>
	    {
	        this._tag["fontStyle"] = newstyle;	       
	    }
	    else    // global
	    {
	            	    
		    if (newstyle === this.fontstyle)
		    	return;		// no change
		    	
		    this.fontstyle = newstyle;
		    this.updateFont();
	    }
	};
	
	Acts.prototype.SetFontFace2 = function (face_)
	{    
	    if (this._tag != null)  // <class> ... </class>
	    {
	        this._tag["fontFamily"] = face_;	       
	    }
	    else    // global
	    {
	            	    
		    if (face_ === this.facename)
		    	return;		// no change
		    	
		    this.facename = face_;
		    this.updateFont();
	    }
	};	
    
	Acts.prototype.SetLineHeight = function(line_height_offset)
	{
	    if (this.line_height_offset != line_height_offset)
	    {
	        this.need_text_redraw = true;
	        this.runtime.redraw = true;
	    }    
        this.line_height_offset = line_height_offset;
	};	

	Acts.prototype.SetHorizontalAlignment = function(align)
	{
	    if (this.halign != align)
	    {
	        this.need_text_redraw = true;
	        this.runtime.redraw = true;
	    }
	    
        this.halign = align;   // 0=left, 1=center, 2=right
	};

	Acts.prototype.SetVerticalAlignment = function(align)
	{
	    if (this.valign != align)
	    {
	        this.need_text_redraw = true;
	        this.runtime.redraw = true;
	    }	    
  
        this.valign = align;   // 0=top, 1=center, 2=bottom
	};	

	Acts.prototype.SetWrapping = function(wrap_mode)
	{
	    wrap_mode = (wrap_mode === 0);  // 0=word, 1=character
	    if (this.wrapbyword != wrap_mode)
	    {
	        this.need_text_redraw = true;
	        this.runtime.redraw = true;
	    }
	    
        this.wrapbyword = wrap_mode;   
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.Text = function(ret)
	{
		ret.set_string(this.text);
	};
	
	Exps.prototype.FaceName = function (ret)
	{
		ret.set_string(this.facename);
	};
	
	Exps.prototype.FaceSize = function (ret)
	{
		ret.set_int(this.ptSize);
	};
	
	Exps.prototype.TextWidth = function (ret)
	{
		var w = 0;
		var i, len, x;
		for (i = 0, len = this.lines.length; i < len; i++)
		{
			x = this.lines[i].width;
			
			if (w < x)
				w = x;
		}
		
		ret.set_int(w);
	};
	
	Exps.prototype.TextHeight = function (ret)
	{
	    var text_height = this.lines.length * (this.pxHeight + this.line_height_offset) - this.line_height_offset;
	    text_height += this.vshift
		ret.set_float(text_height);
	};

	Exps.prototype.RawText = function(ret)
	{
		ret.set_string(this.canvas_text.rawTextGet());
	};
}());

(function ()
{
    var savedClasses = {};        // global class define
    var CanvasText = function ()
    {
        // The property that will contain the ID attribute value.
        this.canvasId = null;
        // The property that will contain the Canvas element.
        this.canvas = null;
        // The property that will contain the canvas context.
        this.context = null;
        // The property that will contain the created style class.
        
        // pens for draw        
        this.pens = [[]];
        this.text_changed = true; // update this.pens to redraw
        this.rawTextLine = [pkgCache.allocLine("", null, 0, 0)];
        this._text_pkg = [];
        
        /*
         * Default values.
         */
        this.fontFamily = "Verdana";
        this.fontWeight = "normal";
        this.fontSize = "12px";
        this.fontColor = "#000000";
        this.fontStyle = "normal";
        this.textAlign = "start";
        this.textBaseline = "alphabetic";
        this.lineHeight = "16";
        this.textShadow = null; 
        
    };
    var CanvasTextProto = CanvasText.prototype;

    CanvasTextProto.Reset = function(plugin)
    {
       this.plugin = plugin;
    };
    
    CanvasTextProto._text_prop_get = function (prop)
    {
        var proFont={}, proColor, proShadow;
        // Default color
        proColor = this.fontColor;
        // Default font
        proFont.style = this.fontStyle;
        proFont.weight = this.fontWeight;
        proFont.size = this.fontSize;
        proFont.family = this.fontFamily;

        // Default shadow
        proShadow = this.textShadow;
        
        if (prop != null)
        {
            /*
            * Loop the class properties.
             */
            var atribute;
            for (atribute in prop) 
            {
                switch (atribute) 
                {
                //case "font":
                //    proFont = prop[atribute];
                //    break;
                case "fontFamily":
                    proFont.family = prop[atribute];
                    break;
                case "fontWeight":
                    proFont.weight = prop[atribute];
                    break;
                case "fontSize":
                    proFont.size = prop[atribute];
                    break;
                case "fontStyle":
                    proFont.style = prop[atribute];
                    break;
                case "fontColor":
                    proColor = prop[atribute];
                    break;
                //case "textShadow":
                //    proShadow = this.trim(prop[atribute]);
                //    proShadow = proShadow.split(" ");
                //    if (proShadow.length != 4)
                //       proShadow = null;                
                //    break;
                }
            }
        }
        

        //// Font styles.
        this.context.font = proFont.style + " " + proFont.weight + " " + proFont.size + " " + proFont.family;
        // Set the color.
        this.context.fillStyle = proColor;
        // Set the Shadow.
        //if (proShadow != null) {
        //    this.context.shadowOffsetX = proShadow[0].replace("px", "");
        //    this.context.shadowOffsetY = proShadow[1].replace("px", "");
        //    this.context.shadowBlur = proShadow[2].replace("px", "");
        //    this.context.shadowColor = proShadow[3].replace("px", "");
        //}  
        
        return { font: this.context.font,
                 color: this.context.fillStyle,
                 //shadow: proShadow
                };
    };
    
    
    CanvasTextProto._draw_word = function (prop, offset_x, offset_y)
    {
        this.context.save(); 
        
        this.context.font = prop.font;
        this.context.fillStyle = prop.color;
        //var proShadow = prop.shadow;
        //if (proShadow != null) {
        //    this.context.shadowOffsetX = proShadow[0].replace("px", "");
        //    this.context.shadowOffsetY = proShadow[1].replace("px", "");
        //    this.context.shadowBlur = proShadow[2].replace("px", "");
        //    this.context.shadowColor = proShadow[3].replace("px", "");
        //} 
        this.context.textBaseline = this.textBaseline;
        //this.context.textAlign = this.textAlign;
        this.context.fillText(prop.text, offset_x + prop.x, offset_y + prop.y);
        
        this.context.restore();
    };
    
    CanvasTextProto._draw_text = function (pens, boxWidth, boxHeight)
    {    
        var i,l,lcnt = pens.length;
        var j,w,wcnt, last_word, line_width;
        var offset_x=0, offset_y=0;

		// vertical alignment
		if (this.plugin.valign === 1)		// center
			offset_y = Math.max( (boxHeight - (lcnt * this.lineHeight)) / 2, 0);
		else if (this.plugin.valign === 2)	// bottom
			offset_y = Math.max(boxHeight - (lcnt * this.lineHeight) - 2, 0);
        else
            offset_y = 0;
        
        if (this.textBaseline == "alphabetic")
            offset_y += this.plugin.vshift;  // shift line down    
        
			
        for(i=0; i<lcnt; i++)
        {
            l = pens[i];            
            wcnt = l.length;
            if (wcnt == 0)
                continue;
            
            last_word = l[wcnt-1];
            line_width = last_word.x + last_word.width;
			if (this.plugin.halign === 1)		// center
				offset_x = (boxWidth - line_width) / 2;
			else if (this.plugin.halign === 2)	// right
				offset_x = boxWidth - line_width;  
				          
            for(j=0; j<wcnt; j++)
            {
                w = l[j];
                if (w.text == "")
                    continue;
                this._draw_word(w, offset_x, offset_y);
            }
        }
    };    
    
    var _lines = [];
    
    CanvasTextProto._pens_clean = function(pens)
    {
        var i,lcnt = pens.length;
        for(i=0; i<lcnt; i++)
        {
            penCache.freeAllLines(pens[i]);  
        }
        pens.length = 1;
        pens[0].length = 0;
    };
    
    var propname_map = 
    {
    "color":"fontColor",
    "font-family":"fontFamily",
    "font-size":"fontSize",
    "font-weight":"fontWeight",
    "font-style":"fontStyle",
    };
    var _style2prop = function(properties)   // property list
    {
        var i, cnt=properties.length;
        var prop = {}, property;
        for (i= 0; i<cnt; i++) 
        {
            property = properties[i].split(":");
            if (isEmpty(property[0]) || isEmpty(property[1])) 
            {
                // Wrong property name or value. We jump to the
                // next loop.
                continue;
            }
            prop[propname_map[property[0]]] = property[1];
        }
        return prop;
    };

    CanvasTextProto._update_pens = function (pens, textInfo) 
    {  	
        this._pens_clean(pens);
        
        // Save the textInfo into separated vars to work more comfortably.
        var splittedText, xAux, textLines = _lines, boxWidth = textInfo["boxWidth"];
        // Declaration of needed vars.
        var classDefinition, proText;
        // Loop vars
        var text = textInfo["text"], start_x = textInfo["x"], y = textInfo["y"];
        // Needed vars for automatic line break;
        var i, j, k, n;
		var cursor_x = start_x;
		var text_prop;
		
        this.rawTextLine.length = 1;
		this.rawTextLine[0].text = "";
		
        // The main regex. Looks for <style>, <class> or <br /> tags.
        var match = text.match(/<\s*br\s*\/>|<\s*class=["|']([^"|']+)["|']\s*\>(.*?)<\s*\/class\s*\>|<\s*style=["|']([^"|']+)["|']\s*\>(.*?)<\s*\/style\s*\>|[^<]+/g);
		if (!match)
		    return;
        var match_cnt = match.length;
        var innerMatch = null;

		var acc_line_len = 0;
        
        // Let's draw something for each match found.
        for (i = 0; i < match_cnt; i++) 
        {
            // Save the current context.
            this.context.save();        
            
            // Check if current fragment is a class tag.
            if (/<\s*class=/i.test(match[i])) 
            { 
                // Looks the attributes and text inside the class tag.
                innerMatch = match[i].match(/<\s*class=["|']([^"|']+)["|']\s*\>(.*?)<\s*\/class\s*\>/);
               
                classDefinition = this.getClass(innerMatch[1]);
                proText = innerMatch[2];
                text_prop = this._text_prop_get(classDefinition);
            }
            else if (/<\s*style=/i.test(match[i])) 
            {
                // Looks the attributes and text inside the style tag.
                innerMatch = match[i].match(/<\s*style=["|']([^"|']+)["|']\s*\>(.*?)<\s*\/style\s*\>/);

                // innerMatch[1] contains the properties of the attribute.
                var properties = _style2prop(innerMatch[1].split(";"));                
                proText = innerMatch[2];
                text_prop = this._text_prop_get(properties);
                
            } else if (/<\s*br\s*\/>/i.test(match[i])) 
            {
                // Check if current fragment is a line break.
                y += this.lineHeight;
                start_x = textInfo["x"];
                continue;
            } else 
            {
                // Text without special style.
                proText = match[i];
                text_prop = this._text_prop_get();
            }
            
            // Set the text Baseline
            this.context.textBaseline = this.textBaseline;
            // Set the text align
            this.context.textAlign = this.textAlign;

            // Reset textLines;
            textLines.length = 0;
			// boxWidth comes from plugin
            _word_wrap(proText, textLines, this.context, boxWidth, this.plugin.wrapbyword, cursor_x-start_x );

            // save pen info
            var lcnt=textLines.length, txt;         
            var last_line_index=this.rawTextLine.length-1; 
            var cur_line, cur_line_char_cnt, is_new_line;         
            for (n = 0; n < lcnt; n++) {
                cur_line = textLines[n];
                txt = cur_line.text;
                       
                var _word_pen = penCache.allocLine();
                _word_pen.text = txt;
                _word_pen.x = cursor_x;
                _word_pen.y = y;
                _word_pen.width = cur_line.width;
                _word_pen.font = text_prop.font;
                _word_pen.color = text_prop.color;
                //_word_pen.shadow = text_prop.shadow; 
                pens[last_line_index].push(_word_pen);
                
                is_new_line = (cur_line.new_line == RAW_NEWLINE) || (cur_line.new_line == WRAPPED_NEWLINE);
				cursor_x = (is_new_line)? textInfo["x"]:(cursor_x+cur_line.width);
				if (is_new_line)
				    y += this.lineHeight;
								                
				this.rawTextLine[last_line_index].text += txt;
				this.rawTextLine[last_line_index].width = cursor_x;
				if (is_new_line) // not the last line
				{
				    cur_line_char_cnt = this.rawTextLine[last_line_index].text.length;
				    if (cur_line.new_line == RAW_NEWLINE)   // has "\n"
				        cur_line_char_cnt ++;
				    acc_line_len += cur_line_char_cnt;
					this.rawTextLine.push(pkgCache.allocLine("", null, acc_line_len));  
                    last_line_index ++; 
                    
                    pens.push([]);
				}
            }
            this.context.restore();
        }
    }; 
    
    CanvasTextProto.drawText = function (textInfo) 
    {  	
        if (this.text_changed)
        {
            this._update_pens(this.pens, textInfo);
            this.text_changed = false;
        }
        // Let's draw the text
        this._draw_text(this.pens, textInfo["boxWidth"], textInfo["boxHeight"]);
                
    }; 

    CanvasTextProto._text_pkg_get = function (text) 
    {
        pkgCache.freeAllLines(this._text_pkg);
        // The main regex. Looks for <style>, <class> or <br /> tags.
        var match = text.match(/<\s*br\s*\/>|<\s*class=["|']([^"|']+)["|']\s*\>(.*?)<\s*\/class\s*\>|<\s*style=["|']([^"|']+)["|']\s*\>(.*?)<\s*\/style\s*\>|[^<]+/g);
		if (!match)
		    return this._text_pkg;
			
        var innerMatch=null, classDefinition=null;
        var i, icnt=match.length;
        var start_index=0;
        for (i=0; i<icnt; i++) 
        {
             // Check if current fragment is a class tag.
            if (/<\s*class=/i.test(match[i]))
            {
                // Looks the attributes and text inside the class tag.
                innerMatch = match[i].match(/<\s*class=["|']([^"|']+)["|']\s*\>(.*?)<\s*\/class\s*\>/);               
                this._text_pkg.push( pkgCache.allocLine(innerMatch[2], innerMatch[1], start_index) );
                start_index += innerMatch[2].length;
            }
            // Text without special style.
            else
            {
                this._text_pkg.push( pkgCache.allocLine(match[i], null, start_index) );
                start_index += match[i].length;
            }
        }
        return this._text_pkg;
    };
    CanvasTextProto.rawTextGet = function (text)
    {
        var text_pkg = (text == null)? this._text_pkg: this._text_pkg_get(text);
        var raw_text="", i, icnt= text_pkg.length;
        for (i=0; i<icnt; i++)
            raw_text += text_pkg[i].text;
        return raw_text;
    };
    CanvasTextProto.textGet = function (start, end, text)
    {
        var text_pkg = (text == null)? this._text_pkg: this._text_pkg_get(text);
        var ret_text = "";
        var i, icnt= text_pkg.length, string_start, string_end;
        var _pkg;
        for (i=0; i<icnt; i++)
        {
            _pkg = text_pkg[i];
            string_start = _pkg.index;
            string_end = string_start + _pkg.text.length;
            if ((string_end < start) || (string_start >= end))
                continue;
                
            if (_pkg.tag != null)
                ret_text += "<class='"+_pkg.tag+"'>";
            if ((string_start >= start) && (string_end < end))
                ret_text += _pkg.text;
            else
                ret_text += _pkg.text.substring(start-string_start, end-string_start);

            if (_pkg.tag != null)
                ret_text += "</class>";            
        }
        return ret_text;
    }

    /**
     * Save a new class definition.
     */
    CanvasTextProto.defineClass = function (id, definition) {
		savedClasses[id] = definition;
        return true;
    }; 
    
    /**
     * Returns a saved class.
     */
    CanvasTextProto.getClass = function (id) {
		return savedClasses[id];
    };
    
    /**
     * A simple function to check if the given value is empty.
     */
    var isEmpty = function (str) {
        // Remove white spaces.
        str = str.replace(/^\s+|\s+$/, '');
        return str.length == 0;
    };    

    /**
     * A simple function clear whitespaces.
     */
    CanvasTextProto.trim = function (str) {
        var ws, i;
        str = str.replace(/^\s\s*/, '');
        ws = /\s/;
        i = str.length;
        while (ws.test(str.charAt(--i))) {
            continue;
        }
        return str.slice(0, i + 1);
    };       

// ----
    var ObjCacheKlass = function ()
    {        
        this.lines = [];       
    };
    var ObjCacheKlassProto = ObjCacheKlass.prototype;   
    
	ObjCacheKlassProto._allocLine = function()
	{
		return (this.lines.length > 0)? this.lines.pop(): {};
	};
	ObjCacheKlassProto.freeLine = function (l)
	{
		this.lines.push(l);
	};	
	ObjCacheKlassProto.freeAllLines= function (arr)
	{
		var i, len;
		for (i = 0, len = arr.length; i < len; i++)
			this.freeLine(arr[i]);
		arr.length = 0;
	};
	
	var pkgCache = new ObjCacheKlass();
    pkgCache.allocLine = function(_text, _tag, _index)
	{
	    var pkg = this._allocLine();
		pkg.text = _text;
		pkg.tag = _tag;
		pkg.index = _index;
        pkg.width = 0;       // line width of text
		return pkg;
	};
	
	var NO_NEWLINE = 0;
	var RAW_NEWLINE = 1;
	var WRAPPED_NEWLINE = 2;
	var lineCache = new ObjCacheKlass();
    lineCache.allocLine = function(_text, _width, new_line_type)
	{
	    var l = this._allocLine();
		l.text = _text;
		l.width = _width;
		l.new_line = new_line_type; // 0= no new line, 1=raw "\n", 2=wrapped "\n"
		return l;
	};	
    
	var penCache = new ObjCacheKlass();
    penCache.allocLine = function()
	{
		return this._allocLine();
	};	
	
	
	var wordsCache = [];
	var _tokenise_words = function (text)
	{
		wordsCache.length = 0;
		var cur_word = "";
		var ch;
		
		// Loop every char
		var i = 0;
		
		while (i < text.length)
		{
			ch = text.charAt(i);
			
			if (ch === "\n")
			{
				// Dump current word if any
				if (cur_word.length)
				{
					wordsCache.push(cur_word);
					cur_word = "";
				}
				
				// Add newline word
				wordsCache.push("\n");
				
				++i;
			}
			// Whitespace or hyphen: swallow rest of whitespace and include in word
			else if (ch === " " || ch === "\t" || ch === "-")
			{
				do {
					cur_word += text.charAt(i);
					i++;
				}
				while (i < text.length && (text.charAt(i) === " " || text.charAt(i) === "\t"));
				
				wordsCache.push(cur_word);
				cur_word = "";
			}
			else if (i < text.length)
			{
				cur_word += ch;
				i++;
			}
		}
		
		// Append leftover word if any
		if (cur_word.length)
			wordsCache.push(cur_word);
			
	    return wordsCache;
	};	
	
	var _wrap_text = function (text, lines, ctx, width, wrapbyword, offset_x)
	{
		var wordArray = (wrapbyword)?  _tokenise_words(text) : text;
			
		var cur_line = "";
		var prev_line;
		var line_width;
		var i, wcnt=wordArray.length;
		var lineIndex = 0;
		var line;
		
		for (i = 0; i < wcnt; i++)
		{
			// Look for newline
			if (wordArray[i] === "\n")
			{
				// Flush line.  Recycle a line if possible
				if (lineIndex >= lines.length)
					lines.push(lineCache.allocLine(cur_line, ctx.measureText(cur_line).width, RAW_NEWLINE));
					
				lineIndex++;
				cur_line = "";
				offset_x = 0;
				continue;
			}
			
			// Otherwise add to line
			prev_line = cur_line;
			cur_line += wordArray[i];
			
			// Measure line
			line_width = ctx.measureText(cur_line).width;
			
			// Line too long: wrap the line before this word was added
			if (line_width >= (width - offset_x))
			{
				// Append the last line's width to the string object
				if (lineIndex >= lines.length)
					lines.push(lineCache.allocLine(prev_line, ctx.measureText(prev_line).width, WRAPPED_NEWLINE));
					
				lineIndex++;
				cur_line = wordArray[i];
				
				// Wrapping by character: avoid lines starting with spaces
				if (!wrapbyword && cur_line === " ")
					cur_line = "";
					
		        offset_x = 0;
			}
		}
		
		// Add any leftover line
		if (cur_line.length)
		{
			if (lineIndex >= lines.length)
				lines.push(lineCache.allocLine(cur_line, ctx.measureText(cur_line).width, NO_NEWLINE));
					
			lineIndex++;
		}
		
		// truncate lines to the number that were used. recycle any spare line objects
		for (i = lineIndex; i < lines.length; i++)
			lineCache.freeLine(lines[i]);
		
		lines.length = lineIndex;
		return lines;
	};
	
	var _word_wrap = function (text, lines, ctx, width, wrapbyword, offset_x)
	{	    
		if (!text || !text.length)
		{
			lineCache.freeAllLines(lines);
			return lines;
		}
			
		if (width <= 2.0)
		{
			lineCache.freeAllLines(lines);
			return lines;
		}
		
		// If under 100 characters (i.e. a fairly short string), try a short string optimisation: just measure the text
		// and see if it fits on one line, without going through the tokenise/wrap.
		// Text musn't contain a linebreak!
		if (text.length <= 100 && text.indexOf("\n") === -1)
		{
			var all_width = ctx.measureText(text).width;
			
			if (all_width <= (width - offset_x))
			{
				// fits on one line
				lineCache.freeAllLines(lines);
				lines.push(lineCache.allocLine(text, all_width, NO_NEWLINE));
				return lines;
			}
		}
			
		return _wrap_text(text, lines, ctx, width, wrapbyword, offset_x);
	};	
	    
    cr.plugins_.rex_TagText.CanvasTextKlass = CanvasText;     
}());     