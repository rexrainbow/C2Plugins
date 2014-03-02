// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

// load CanvasText-0.4.1.js
//document.write('<script src="CanvasText-0.4.1.js"></script>');

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
		this.vshift = this.properties[9];
		
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
		    this.canvas_text = new window["canvas_text"]();
        }
		this.canvas_text["wrapbyword"] = this.wrapbyword;
		this.canvas_text["halign"] = this.halign;
		this.canvas_text["valign"] = this.valign;
		this.canvas_text["vshift"] = this.vshift * this.runtime.devicePixelRatio;
		this.lines = this.canvas_text["rawTextLine"];
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
		
		this.canvas_text["wrapbyword"] = this.wrapbyword;
		this.canvas_text["halign"] = this.halign;
		this.canvas_text["valign"] = this.valign;
		this.canvas_text["vshift"] = this.vshift * this.runtime.devicePixelRatio;
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
		
		//// If text has changed, run the word wrap.
		//if (this.text_changed || this.width !== this.lastwrapwidth)
		//{
		//	this.type.plugin.WordWrap(this.text, this.lines, ctx, this.width, this.wrapbyword);
		//	this.text_changed = false;
		//	this.lastwrapwidth = this.width;
		//}
		
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
			
		this.canvas_text["config"]({
            "canvas": ctx.canvas,
            "context": ctx,
            "fontFamily": this.facename,
            "fontSize": this.ptSize.toString() + "pt",
            "fontStyle": this.fontstyle,
            "fontColor":this.color,
			"lineHeight": line_height,
            //"textBaseline": "top",          
        });      
        this.canvas_text["drawText"]({
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
				{"name": "Line height", "value": this.line_height_offset}
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
		return this.canvas_text["textGet"](start, end, text);
	};
	instanceProto.rawTextGet = function (text)
	{
		return this.canvas_text["rawTextGet"](text);
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
		    this.plugin.runtime.pushCopySol(current_event.solModifiers);
		    current_event.retrigger();
		    this.plugin.runtime.popSol(current_event.solModifiers);
		}
		else
		{
		    current_event.retrigger();
		}
		
		this.canvas_text["defineClass"](name, this._tag);    
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

		// Already requested this web font?
		if (requestedWebFonts.hasOwnProperty(cssurl_))
		{
			// Use it immediately without requesting again.  Whichever object
			// made the original request will refresh the canvas when it finishes
			// loading.
			var newfacename = "'" + familyname_ + "'";
			
			if (this.facename === newfacename)
				return;	// no change
				
			this.facename = newfacename;
			this.updateFont();
			
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
		
		this.facename = "'" + familyname_ + "'";
		this.updateFont();
					
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
		ret.set_int(this.lines.length * (this.pxHeight + this.line_height_offset) - this.line_height_offset);
	};

	Exps.prototype.Text = function(ret)
	{
		ret.set_string(this.canvas_text["rawTextGet"]());
	};
	
}());