// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.rex_TagText = function (runtime) {
    this.runtime = runtime;
};

(function () {
    var pluginProto = cr.plugins_.rex_TagText.prototype;

    pluginProto.onCreate = function () {
        // Override the 'set width' action
        pluginProto.acts.SetWidth = function (w) {
            if (this.width !== w) {
                this.width = w;
                this.set_bbox_changed();

                if (!this.isCanvasSizeLocked)
                    this.renderText(this.isForceRender);
            }
        };
    };

    /////////////////////////////////////
    // Object type class
    pluginProto.Type = function (plugin) {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };

    var typeProto = pluginProto.Type.prototype;

    typeProto.onCreate = function () {};

    typeProto.onLostWebGLContext = function () {
        if (this.is_family)
            return;

        var i, len, inst;
        for (i = 0, len = this.instances.length; i < len; i++) {
            inst = this.instances[i];
            inst.mycanvas = null;
            inst.myctx = null;
            inst.mytex = null;
        }
    };

    /////////////////////////////////////
    // Instance class
    pluginProto.Instance = function (type) {
        this.type = type;
        this.runtime = type.runtime;

        this.text_changed = true;
    };

    var instanceProto = pluginProto.Instance.prototype;

    var requestedWebFonts = {}; // already requested web fonts have an entry here
    var lineJoinMode = ["miter", "round", "bevel"];
    instanceProto.onCreate = function () {
        this.text = "";
        this.set_text(this.properties[0]);
        this.visible = (this.properties[1] === 0); // 0=visible, 1=invisible

        // "[bold|italic] 12pt Arial"
        this.font = this.properties[2];

        this.color = this.properties[3];
        this.stroke = "none";
        this.halign = this.properties[4]; // 0=left, 1=center, 2=right
        this.valign = this.properties[5]; // 0=top, 1=center, 2=bottom

        this.textShadow = "";

        this.wrapbyword = (this.properties[7] === 0); // 0=word, 1=character
        this.lastwidth = this.width;
        this.lastwrapwidth = this.width;
        this.lastheight = this.height;

        this.lineHeightOffset = this.properties[8];
        this.baseLineMode = this.properties[9];
        this.vshift = this.properties[10];
        this.isForceRender = (this.properties[11] === 1);
        this.LockCanvasSize((this.properties[12] === 1), this.width, this.height);

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

        this.tagInfo = null;
        if (!this.recycled) {
            this.tagText = new CanvasText();
        }
        this.tagText.Reset(this);
        this.tagText.textBaseline = (this.baseLineMode === 0) ? "alphabetic" : "top";
        //this.lines = this.tagText.getLines();
        this.tagText.backgroundColor = this.properties[13];


        // render text at object initialize
        if (this.text)
            this.renderText(this.isForceRender);
    };

    instanceProto.parseFont = function () {
        var arr = this.font.split(" ");

        var i;
        for (i = 0; i < arr.length; i++) {
            // Ends with 'pt'
            if (arr[i].substr(arr[i].length - 2, 2) === "pt") {
                this.ptSize = parseInt(arr[i].substr(0, arr[i].length - 2));
                this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4; // assume 96dpi...

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

    instanceProto.saveToJSON = function () {
        return {
            "t": this.text,
            "f": this.font,
            "c": this.color,
            "ha": this.halign,
            "va": this.valign,
            "wr": this.wrapbyword,
            "lho": this.lineHeightOffset,
            "vs": this.vshift,
            "fn": this.facename,
            "fs": this.fontstyle,
            "ps": this.ptSize,
            "pxh": this.pxHeight,
            "tw": this.textWidth,
            "th": this.textHeight,
            "ts": this.textShadow,
            "lrt": this.last_render_tick,
            "bl": this.tagText.textBaseline,
            "txtObj": this.tagText.saveToJSON(),
            "isLcs": this.isCanvasSizeLocked,
            "lcw": this.lockedCanvasWidth,
            "lch": this.lockedCanvasHeight,
        };
    };

    instanceProto.loadFromJSON = function (o) {
        this.text = o["t"];
        this.font = o["f"];
        this.color = o["c"];
        this.halign = o["ha"];
        this.valign = o["va"];
        this.wrapbyword = o["wr"];
        this.lineHeightOffset = o["lho"];
        this.vshift = o["vs"];
        this.facename = o["fn"];
        this.fontstyle = o["fs"];
        this.ptSize = o["ps"];
        this.pxHeight = o["pxh"];
        this.textWidth = o["tw"];
        this.textHeight = o["th"];
        this.textShadow = o["ts"];
        this.last_render_tick = o["lrt"];

        this.text_changed = true;
        this.lastwidth = this.width;
        this.lastwrapwidth = this.width;
        this.lastheight = this.height;

        this.tagText.textBaseline = o["bl"];
        this.tagText.loadFromJSON(o["txtObj"]);

        this.isCanvasSizeLocked = o["isLcs"];
        this.lockedCanvasWidth = o["lcw"];
        this.lockedCanvasHeight = o["lch"];
    };

    instanceProto.tick = function () {
        // In WebGL renderer, if not rendered for 300 frames (about 5 seconds), assume
        // the object has gone off-screen and won't need its textures any more.
        // This allows us to free its canvas, context and WebGL texture to save memory.
        if (this.runtime.glwrap && this.mytex && (this.runtime.tickcount - this.last_render_tick >= 300)) {
            // Only do this if on-screen, otherwise static scenes which aren't re-rendering will release
            // text objects that are on-screen.
            var layer = this.layer;
            this.update_bbox();
            var bbox = this.bbox;

            if (bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom) {
                this.runtime.glwrap.deleteTexture(this.mytex);
                this.mytex = null;
                this.myctx = null;
                this.mycanvas = null;
            }
        }
    };

    instanceProto.onDestroy = function () {
        // Remove references to allow GC to collect and save memory
        this.myctx = null;
        this.mycanvas = null;

        if (this.runtime.glwrap && this.mytex)
            this.runtime.glwrap.deleteTexture(this.mytex);

        this.mytex = null;
    };

    instanceProto.updateFont = function () {
        this.font = this.fontstyle + " " + this.ptSize.toString() + "pt " + this.facename;
        this.renderText(this.isForceRender);
    };

    instanceProto.draw = function (ctx, glmode, is_ignore) {
        var isCtxSave = false;
        var width = (this.isCanvasSizeLocked) ? this.lockedCanvasWidth : this.width;
        var height = (this.isCanvasSizeLocked) ? this.lockedCanvasHeight : this.height;

        ctx.globalAlpha = glmode ? 1 : this.opacity;
        var myscale = 1;

        if (glmode) {
            myscale = this.layer.getScale();

            if (!isCtxSave) {
                ctx.save();
                isCtxSave = true;
            }
            ctx.scale(myscale, myscale);
        }

        // If text has changed, run the word wrap.
        if (this.text_changed || width !== this.lastwrapwidth) {
            this.tagText.text_changed = true; // it will update pens (wordwrap) to redraw
            this.text_changed = false;
            this.lastwrapwidth = width;
        }

        this.update_bbox();
        var penX = glmode ? 0 : this.bquad.tlx;
        var penY = glmode ? 0 : this.bquad.tly;

        if (this.runtime.pixel_rounding) {
            penX = (penX + 0.5) | 0;
            penY = (penY + 0.5) | 0;
        }


        if (!glmode) {
            var isResized = (width !== this.width) || (height !== this.height);
            var isRotated = (this.angle !== 0);
            if (isRotated || isResized) {
                if (!isCtxSave) {
                    ctx.save();
                    isCtxSave = true;
                }

                if (isResized) {
                    var scalew = this.width / width;
                    var scaleh = this.height / height;
                    ctx.scale(scalew, scaleh);
                    ctx.translate(penX / scalew, penY / scaleh);
                    penX = 0;
                    penY = 0;
                }

                if (isRotated) {
                    if ((penX !== 0) || (penY !== 0))
                        ctx.translate(penX, penY);

                    ctx.rotate(this.angle);
                }

            }
        }

        var lineHeight = this.pxHeight;
        lineHeight += (this.lineHeightOffset * this.runtime.devicePixelRatio);

        // configure
        this.tagText.canvas = ctx.canvas;
        this.tagText.context = ctx;
        // default setting
        this.tagText.defaultProperties.family = this.facename;
        // this.tagText.defaultProperties.weight = ??
        this.tagText.defaultProperties.ptSize = this.ptSize.toString() + "pt";
        this.tagText.defaultProperties.style = this.fontstyle;
        this.tagText.defaultProperties.color = this.color;
        this.tagText.defaultProperties.stroke = this.stroke;
        this.tagText.defaultProperties.shadow = this.textShadow;
        this.tagText.lineHeight = lineHeight;

        this.tagText.textInfo["text"] = this.text;
        this.tagText.textInfo["x"] = penX;
        this.tagText.textInfo["y"] = penY;
        this.tagText.textInfo["boxWidth"] = width;
        this.tagText.textInfo["boxHeight"] = height;
        this.tagText.textInfo["ignore"] = is_ignore;
        this.tagText.drawText();


        if (isCtxSave)
            ctx.restore();

        this.last_render_tick = this.runtime.tickcount;
    };

    instanceProto.drawGL = function (glw) {
        if (this.width < 1 || this.height < 1)
            return;

        var need_redraw = this.text_changed || this.need_text_redraw;
        this.need_text_redraw = false;
        var layerScale = this.layer.getScale();
        var layerAngle = this.layer.getAngle();
        var rcTex = this.rcTex;

        // Calculate size taking in to account scale
        var floatscaledwidth = layerScale * this.width;
        var floatscaledheight = layerScale * this.height;
        var scaledwidth = Math.ceil(floatscaledwidth);
        var scaledheight = Math.ceil(floatscaledheight);

        var halfw = this.runtime.draw_width / 2;
        var halfh = this.runtime.draw_height / 2;

        // canvas size  
        var canvaswidth = (!this.isCanvasSizeLocked) ? scaledwidth : Math.ceil(layerScale * this.lockedCanvasWidth);
        var canvasheight = (!this.isCanvasSizeLocked) ? scaledheight : Math.ceil(layerScale * this.lockedCanvasHeight);

        // Create 2D context for this instance if not already
        if (!this.myctx) {
            this.mycanvas = document.createElement("canvas");
            this.mycanvas.width = canvaswidth;
            this.mycanvas.height = canvasheight;
            this.lastwidth = canvaswidth;
            this.lastheight = canvasheight;
            need_redraw = true;
            this.myctx = this.mycanvas.getContext("2d");
        }

        // Update size if changed
        if (canvaswidth !== this.lastwidth || canvasheight !== this.lastheight) {
            this.mycanvas.width = canvaswidth;
            this.mycanvas.height = canvasheight;

            if (this.mytex) {
                glw.deleteTexture(this.mytex);
                this.mytex = null;
            }

            need_redraw = true;
        }

        // Need to update the GL texture
        if (need_redraw) {
            // Draw to my context
            this.myctx.clearRect(0, 0, canvaswidth, canvasheight);
            this.draw(this.myctx, true);

            // Create GL texture if none exists
            // Create 16-bit textures (RGBA4) on mobile to reduce memory usage - quality impact on desktop
            // was almost imperceptible
            if (!this.mytex)
                this.mytex = glw.createEmptyTexture(scaledwidth, scaledheight, this.runtime.linearSampling, this.runtime.isMobile);

            // Copy context to GL texture
            glw.videoToTexture(this.mycanvas, this.mytex, this.runtime.isMobile);
        }

        this.lastwidth = canvaswidth;
        this.lastheight = canvasheight;

        // Draw GL texture
        glw.setTexture(this.mytex);
        glw.setOpacity(this.opacity);

        glw.resetModelView();
        glw.translate(-halfw, -halfh);
        glw.updateModelView();

        var q = this.bquad;

        var tlx = this.layer.layerToCanvas(q.tlx, q.tly, true, true);
        var tly = this.layer.layerToCanvas(q.tlx, q.tly, false, true);
        var trx = this.layer.layerToCanvas(q.trx, q.try_, true, true);
        var try_ = this.layer.layerToCanvas(q.trx, q.try_, false, true);
        var brx = this.layer.layerToCanvas(q.brx, q.bry, true, true);
        var bry = this.layer.layerToCanvas(q.brx, q.bry, false, true);
        var blx = this.layer.layerToCanvas(q.blx, q.bly, true, true);
        var bly = this.layer.layerToCanvas(q.blx, q.bly, false, true);

        if (this.runtime.pixel_rounding || (this.angle === 0 && layerAngle === 0)) {
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

        if (this.angle === 0 && layerAngle === 0) {
            trx = tlx + scaledwidth;
            try_ = tly;
            brx = trx;
            bry = tly + scaledheight;
            blx = tlx;
            bly = bry;
            rcTex.right = 1;
            rcTex.bottom = 1;
        } else {
            rcTex.right = floatscaledwidth / scaledwidth;
            rcTex.bottom = floatscaledheight / scaledheight;
        }

        glw.quadTex(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex);

        glw.resetModelView();
        glw.scale(layerScale, layerScale);
        glw.rotateZ(-this.layer.getAngle());
        glw.translate((this.layer.viewLeft + this.layer.viewRight) / -2, (this.layer.viewTop + this.layer.viewBottom) / -2);
        glw.updateModelView();

        this.last_render_tick = this.runtime.tickcount;
    };


    // copy from rex_text_scrolling
    instanceProto.getWebglCtx = function () {
        var inst = this;
        var ctx = inst.myctx;
        if (!ctx) {
            inst.mycanvas = document.createElement("canvas");
            var scaledwidth = Math.ceil(inst.layer.getScale() * inst.width);
            var scaledheight = Math.ceil(inst.layer.getAngle() * inst.height);
            inst.mycanvas.width = scaledwidth;
            inst.mycanvas.height = scaledheight;
            inst.lastwidth = scaledwidth;
            inst.lastheight = scaledheight;
            inst.myctx = inst.mycanvas.getContext("2d");
            ctx = inst.myctx;
        }
        return ctx;
    };

    instanceProto.fakeRender = function () {
        var inst = this;
        var ctx = (this.runtime.enableWebGL) ?
            this.getWebglCtx() : this.runtime.ctx;
        inst.draw(ctx, null, true);
    };

    instanceProto.renderText = function (isRenderNow) {
        if (isRenderNow) {
            this.text_changed = true;
            this.fakeRender();
        }

        this.text_changed = true;
        this.runtime.redraw = true;
    };

    instanceProto.set_text = function (txt) {
        txt = txt.replace(/<\s*br\s*\/>/g, "\n"); // replace "<br />" to "\n"
        if (this.text !== txt) {
            this.text = txt;
            this.renderText(this.isForceRender);
        }
    };

    instanceProto.LockCanvasSize = function (isLocked, width, height) {
        this.isCanvasSizeLocked = isLocked;
        this.lockedCanvasWidth = width;
        this.lockedCanvasHeight = height;
    };

    var copyTable = function (inObj, outObj, isMerge) {
        if (outObj == null)
            outObj = {};

        if (!isMerge) {
            for (var k in outObj) {
                if (!inObj.hasOwnProperty(k))
                    delete outObj[k];
            }
        }

        for (var k in inObj)
            outObj[k] = inObj[k];

        return outObj;
    };

    /**BEGIN-PREVIEWONLY**/
    instanceProto.getDebuggerValues = function (propsections) {
        propsections.push({
            "title": this.type.name,
            "properties": [{
                    "name": "Text",
                    "value": this.text
                },
                {
                    "name": "Font",
                    "value": this.font
                },
                {
                    "name": "Line height",
                    "value": this.lineHeightOffset
                },
                {
                    "name": "Baseline",
                    "value": this.tagText.textBaseline
                },
            ]
        });
    };

    instanceProto.onDebugValueEdited = function (header, name, value) {
        if (name === "Text")
            this.text = value;
        else if (name === "Font") {
            this.font = value;
            this.parseFont();
        } else if (name === "Line height")
            this.lineHeightOffset = value;

        this.text_changed = true;

    };
    /**END-PREVIEWONLY**/

    // export
    instanceProto.getRawText = function (text) {
        return this.tagText.getRawText(text);
    };
    instanceProto.getSubText = function (start, end, text) {
        return this.tagText.getSubText(start, end, text);
    };
    instanceProto.copyPensMgr = function (pensMgr) {
        return this.tagText.copyPensMgr(pensMgr);
    };
    //////////////////////////////////////
    // Conditions
    function Cnds() {};
    pluginProto.cnds = new Cnds();

    Cnds.prototype.CompareText = function (text_to_compare, case_sensitive) {
        if (case_sensitive)
            return this.text == text_to_compare;
        else
            return cr.equals_nocase(this.text, text_to_compare);
    };
    Cnds.prototype.DefineClass = function (name) {
        this.tagInfo = {};

        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();

        if (solModifierAfterCnds)
            this.runtime.pushCopySol(current_event.solModifiers);

        current_event.retrigger();

        if (solModifierAfterCnds)
            this.runtime.popSol(current_event.solModifiers);

        this.tagText.defineClass(name, this.tagInfo);
        this.tagInfo = null;
        return false;
    };

    //////////////////////////////////////
    // Actions
    function Acts() {};
    pluginProto.acts = new Acts();


    Acts.prototype.SetText = function (param) {
        if (cr.is_number(param) && param < 1e9)
            param = Math.round(param * 1e10) / 1e10; // round to nearest ten billionth - hides floating point errors

        var text_to_set = param.toString();
        this.set_text(text_to_set);
    };

    Acts.prototype.AppendText = function (param) {
        if (cr.is_number(param))
            param = Math.round(param * 1e10) / 1e10; // round to nearest ten billionth - hides floating point errors

        var text_to_append = param.toString();
        if (text_to_append.length > 0) // not empty
            this.set_text(this.text + text_to_append);
    };

    Acts.prototype.SetFontFace = function (face_, style_) {
        var newstyle = "";

        switch (style_) {
            case 1:
                newstyle = "bold";
                break;
            case 2:
                newstyle = "italic";
                break;
            case 3:
                newstyle = "bold italic";
                break;
        }

        if (this.tagInfo != null) // <class> ... </class>
        {
            this.tagInfo["font-family"] = face_;
            this.tagInfo["font-style"] = newstyle;
            this.renderText(false);
        } else // global
        {

            if (face_ === this.facename && newstyle === this.fontstyle)
                return; // no change

            this.facename = face_;
            this.fontstyle = newstyle;
            this.updateFont();
        }
    };

    Acts.prototype.SetFontSize = function (size_) {
        if (this.tagInfo != null) // <class> ... </class>
        {
            this.tagInfo["font-size"] = size_.toString() + "pt";
            this.renderText(false);
        } else // global
        {
            if (this.ptSize === size_)
                return;

            this.ptSize = size_;
            this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4; // assume 96dpi...
            this.updateFont();
        }
    };

    Acts.prototype.SetFontColor = function (rgb) {
        var newcolor;
        if (typeof (rgb) == "number")
            newcolor = "rgb(" + cr.GetRValue(rgb).toString() + "," + cr.GetGValue(rgb).toString() + "," + cr.GetBValue(rgb).toString() + ")";
        else
            newcolor = rgb;
        if (this.tagInfo != null) // <class> ... </class>
        {
            this.tagInfo["color"] = newcolor;
            this.renderText(false);
        } else // global
        {
            if (newcolor === this.color)
                return;

            this.color = newcolor;
            this.renderText(this.isForceRender);

        }
    };

    Acts.prototype.SetWebFont = function (familyname_, cssurl_) {
        if (this.runtime.isDomFree) {
            cr.logexport("[Construct 2] TagText plugin: 'Set web font' not supported on this platform - the action has been ignored");
            return; // DC todo
        }

        var self = this;
        var refreshFunc = (function () {
            self.runtime.redraw = true;
            self.text_changed = true;
        });
        var newfacename = "'" + familyname_ + "'";

        // Already requested this web font?
        if (requestedWebFonts.hasOwnProperty(cssurl_)) {

            if (this.tagInfo != null) // <class> ... </class>
            {
                this.tagInfo["font-family"] = newfacename;
                this.renderText(false);
            } else // global
            {

                // Use it immediately without requesting again.  Whichever object
                // made the original request will refresh the canvas when it finishes
                // loading.

                if (this.facename === newfacename)
                    return; // no change

                this.facename = newfacename;
                this.updateFont();

            }

            // There doesn't seem to be a good way to test if the font has loaded,
            // so just fire a refresh every 100ms for the first 1 second, then
            // every 1 second after that up to 10 sec - hopefully will have loaded by then!
            for (var i = 1; i < 10; i++) {
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

        if (this.tagInfo != null) // <class> ... </class>
        {
            this.tagInfo["font-family"] = newfacename;
            this.renderText(false);
        } else {
            this.facename = "'" + familyname_ + "'";
            this.updateFont();
        }

        // Another refresh hack
        for (var i = 1; i < 10; i++) {
            setTimeout(refreshFunc, i * 100);
            setTimeout(refreshFunc, i * 1000);
        }

        log("Requesting web font '" + cssurl_ + "'... (tick " + this.runtime.tickcount.toString() + ")");
    };

    Acts.prototype.SetEffect = function (effect) {
        this.compositeOp = cr.effectToCompositeOp(effect);
        cr.setGLBlend(this, effect, this.runtime.gl);

        this.renderText(this.isForceRender);
    };

    Acts.prototype.SetFontStyle = function (style_) {
        var newstyle = "";

        switch (style_) {
            case 1:
                newstyle = "bold";
                break;
            case 2:
                newstyle = "italic";
                break;
            case 3:
                newstyle = "bold italic";
                break;
        }

        if (this.tagInfo != null) // <class> ... </class>
        {
            this.tagInfo["font-style"] = newstyle;
            this.renderText(false);
        } else // global
        {

            if (newstyle === this.fontstyle)
                return; // no change

            this.fontstyle = newstyle;
            this.updateFont();
        }
    };

    Acts.prototype.SetFontFace2 = function (face_) {
        if (this.tagInfo != null) // <class> ... </class>
        {
            this.tagInfo["font-family"] = face_;
            this.renderText(false);
        } else // global
        {

            if (face_ === this.facename)
                return; // no change

            this.facename = face_;
            this.updateFont();
        }
    };

    Acts.prototype.SetLineHeight = function (lineHeightOffset) {
        if (this.lineHeightOffset === lineHeightOffset)
            return;

        this.lineHeightOffset = lineHeightOffset;
        this.renderText(this.isForceRender);
    };

    Acts.prototype.SetHorizontalAlignment = function (align) {
        if (this.halign === align)
            return;

        this.halign = align; // 0=left, 1=center, 2=right
        this.renderText(this.isForceRender);

    };

    Acts.prototype.SetVerticalAlignment = function (align) {
        if (this.valign === align)
            return;

        this.valign = align; // 0=top, 1=center, 2=bottom
        this.renderText(this.isForceRender);

    };

    Acts.prototype.SetWrapping = function (wrap_mode) {
        wrap_mode = (wrap_mode === 0); // 0=word, 1=character
        if (this.wrapbyword === wrap_mode)
            return;

        this.wrapbyword = wrap_mode;
        this.renderText(this.isForceRender);
    };


    Acts.prototype.SetCustomProperty = function (name_, value_) {
        if (!this.tagInfo)
            return;

        // <class> ... </class>
        this.tagInfo[name_] = value_;
    };

    Acts.prototype.SetShadow = function (offsetX, offsetY, blur_, color_) {
        color_ = color_.replace(/ /g, '');

        // 2px 2px 2px #000        
        var shadow = offsetX.toString() + "px " + offsetY.toString() + "px " + blur_.toString() + "px " + color_;
        if (this.tagInfo != null) // <class> ... </class>
        {

            this.tagInfo["text-shadow"] = shadow
            this.renderText(false);
        } else // global
        {
            this.textShadow = shadow;
            this.renderText(this.isForceRender);
        }
    };

    Acts.prototype.AddCSSTags = function (css_) {
        // reference - https://github.com/jotform/css.js
        var cssRegex = new RegExp('([\\s\\S]*?){([\\s\\S]*?)}', 'gi');
        var commentsRegex;

        var isRenderNow = false;
        var arr;
        var tagName, comments;
        var props, rules, i, cnt, elems, n, v;
        while (true) {
            arr = cssRegex.exec(css_);
            if (arr === null)
                break;

            // selector
            tagName = arr[1].split('\r\n').join('\n').trim();
            commentsRegex = new RegExp(this.cssCommentsRegex, 'gi');
            comments = commentsRegex.exec(tagName);
            if (comments !== null) {
                tagName = tagName.replace(commentsRegex, '').trim();
            }
            tagName = tagName.replace(/\n+/, "\n");

            // rules
            props = {};
            rules = arr[2].split('\r\n').join('\n').split(';');
            cnt = rules.length;
            for (i = 0; i < cnt; i++) {
                if (rules[i].indexOf(":") === (-1))
                    continue;

                elems = rules[i].trim().split(':');
                n = elems[0].trim().toLowerCase();
                v = elems[1].trim();
                props[n] = v;
            }
            this.tagText.defineClass(tagName, props);
            isRenderNow = true;
        }

        if (isRenderNow)
            this.renderText(this.isForceRender);
    };

    Acts.prototype.SetUnderline = function (color_, thinkness, offset) {
        color_ = color_.replace(/ /g, '');

        // #000 1px 0px
        var underline = color_ + " " + thinkness.toString() + "px " + offset.toString() + "px";
        if (this.tagInfo != null) // <class> ... </class>
        {

            this.tagInfo["underline"] = underline;
            this.renderText(false);
        }
        //else    // global
        //{
        //    this.renderText(this.isForceRender);
        //}              
    };

    Acts.prototype.SetStroke = function (color_, lineWidth, lineJoin) {
        color_ = color_.replace(/ /g, '');
        lineJoin = lineJoinMode[lineJoin];

        // #000 1px
        var stroke = color_ + " " + lineWidth.toString() + "px " + lineJoin;
        if (this.tagInfo != null) // <class> ... </class>
        {
            this.tagInfo["stroke"] = stroke;
            this.renderText(false);
        } else // global
        {
            if (stroke === this.stroke)
                return;

            this.stroke = stroke;
            this.renderText(this.isForceRender);

        }
    };

    Acts.prototype.InsertImage = function (key) {
        if (this.tagInfo != null) // <class> ... </class>
        {
            this.tagInfo["image"] = key;
            this.renderText(false);
        }
        //else    // global
        //{
        //    this.renderText(this.isForceRender);
        //}          
    };

    Acts.prototype.AddImage = function (key, objs, yoffset) {
        if (!objs)
            return;

        window.RexImageBank.AddImage(key, objs.getFirstPicked(), yoffset);
        this.renderText(this.isForceRender);
    };

    Acts.prototype.RemoveImage = function (key) {
        window.RexImageBank.RemoveImage(key);
        this.renderText(this.isForceRender);
    };

    Acts.prototype.RemoveAll = function () {
        window.RexImageBank.RemoveAll();
        this.renderText(this.isForceRender);
    };

    Acts.prototype.SetBackgroundColor = function (color) {
        if (color === this.tagText.backgroundColor)
            return;

        this.tagText.backgroundColor = color;
        this.need_text_redraw = true;
        this.runtime.redraw = true;
    };

    //////////////////////////////////////
    // Expressions
    function Exps() {};
    pluginProto.exps = new Exps();

    Exps.prototype.Text = function (ret, start, end) {
        var txt;
        if ((start == null) && (end == null))
            txt = this.text;
        else
            txt = this.getSubText(start, end);
        ret.set_string(txt);
    };

    Exps.prototype.FaceName = function (ret) {
        ret.set_string(this.facename);
    };

    Exps.prototype.FaceSize = function (ret) {
        ret.set_int(this.ptSize);
    };

    Exps.prototype.TextWidth = function (ret) {
        ret.set_int(this.tagText.getTextWidth());
    };

    Exps.prototype.TextHeight = function (ret) {
        var total_line_count = this.tagText.getLines().length;
        var text_height = total_line_count * (this.pxHeight + this.lineHeightOffset) - this.lineHeightOffset;

        if (this.baseLineMode === 0) // alphabetic
            text_height += this.vshift;

        ret.set_float(text_height);
    };

    Exps.prototype.RawText = function (ret) {
        ret.set_string(this.tagText.getRawText());
    };

    Exps.prototype.LastClassPropValue = function (ret, name, default_value) {
        var val;
        var lastPen = this.tagText.getLastPen();
        if (lastPen)
            val = lastPen.prop[name];

        if (!val)
            val = default_value || 0;

        ret.set_any(val);
    };


    // ----------------------------------------------------------------------------
    // ----------------------------------------------------------------------------
    // ----------------------------------------------------------------------------

    // ---------
    // object pool class
    // ---------
    var ObjCacheKlass = function () {
        this.lines = [];
    };
    var ObjCacheKlassProto = ObjCacheKlass.prototype;

    ObjCacheKlassProto.allocLine = function () {
        return (this.lines.length > 0) ? this.lines.pop() : null;
    };
    ObjCacheKlassProto.freeLine = function (l) {
        this.lines.push(l);
    };
    ObjCacheKlassProto.freeAllLines = function (arr) {
        var i, len;
        for (i = 0, len = arr.length; i < len; i++)
            this.freeLine(arr[i]);
        arr.length = 0;
    };
    // ---------
    // object pool class
    // ---------

    var CanvasText = function () {
        this.canvas = null;
        this.context = null;
        this.savedClasses = {}; // class define

        this.textInfo = {
            "text": "",
            "x": 0,
            "y": 0,
            "boxWidth": 0,
            "boxHeight": 0,
            "ignore": null,
        };
        this.pensMgr = new PensMgrKlass();
        this.text_changed = true; // update this.pens to redraw

        /*
         * Default values, overwrite before draw by plugin
         */
        this.defaultProperties = {
            family: "Verdana",
            weight: "",
            ptSize: "12pt",
            color: "#000000",
            stroke: ["none", 1],
            style: "normal",
            shadow: "",
        };
        this.underline = {
            thickness: 1,
            offset: 0
        };
        this.textAlign = "start";
        this.lineHeight = "16";
        this.textBaseline = "alphabetic";
        this.backgroundColor = "";
    };
    var CanvasTextProto = CanvasText.prototype;

    CanvasTextProto.Reset = function (plugin) {
        this.plugin = plugin;
    };
    CanvasTextProto.getLines = function () {
        return this.pensMgr.getLines();
    };

    CanvasTextProto.get_propScope = function (propIn) {
        var propScope = {};

        if (propIn != null) {
            /*
             * Loop the class properties.
             */
            var atribute;
            for (atribute in propIn) {
                switch (atribute) {
                    case "font":
                        propScope["font"] = propIn[atribute];
                        break;

                    case "font-family":
                        propScope["family"] = propIn[atribute];
                        break;

                    case "font-weight":
                        propScope["weight"] = propIn[atribute];
                        break;

                    case "font-size":
                        propScope["size"] = propIn[atribute];
                        break;

                    case "color":
                        propScope["color"] = propIn[atribute];
                        break;

                    case "stroke":
                        propScope["stroke"] = propIn[atribute];
                        break;

                    case "font-style":
                        propScope["style"] = propIn[atribute];
                        break;


                    case "text-shadow":
                        propScope["shadow"] = propIn[atribute];
                        break;

                    case "underline":
                        propScope["u"] = propIn[atribute];
                        break;

                    case "image":
                        propScope["img"] = propIn[atribute];
                        break;


                        // custom property
                    default:
                        propScope[atribute] = propIn[atribute];
                        break;
                }
            }
        }

        return propScope;
    };

    CanvasTextProto.applyPropScope = function (propScope) {
        if (this.isTextMode(propScope)) {
            // draw text
            var font = propScope["font"];
            if (font) {
                this.context.font = font;
            } else {
                var style = propScope["style"] || this.defaultProperties.style;
                var weight = propScope["weight"] || this.defaultProperties.weight;
                var ptSize = this.getTextSize(propScope);
                var family = propScope["family"] || this.defaultProperties.family;
                this.context.font = style + " " + weight + " " + ptSize + " " + family;
            }

            var color = this.getFillColor(propScope);
            if (color.toLowerCase() !== "none")
                this.context.fillStyle = color;

            var stroke = this.getStroke(propScope);
            if (stroke.toLowerCase() !== "none") {
                stroke = stroke.split(" ");
                this.context.strokeStyle = stroke[0];
                if (stroke[1] != null) this.context.lineWidth = parseFloat(stroke[1].replace("px", ""));
                if (stroke[2] != null) {
                    this.context.lineJoin = stroke[2];
                    this.context.miterLimit = 2;
                }
            }
        }

        var shadow = (propScope["shadow"]) ? propScope["shadow"] : this.defaultProperties.shadow;
        if (shadow !== "") {
            shadow = shadow.split(" ");
            this.context.shadowOffsetX = parseFloat(shadow[0].replace("px", ""));
            this.context.shadowOffsetY = parseFloat(shadow[1].replace("px", ""));
            this.context.shadowBlur = parseFloat(shadow[2].replace("px", ""));
            this.context.shadowColor = shadow[3];
        }

    };

    CanvasTextProto.isTextMode = function (propScope) {
        var isImageMode = propScope.hasOwnProperty("img");
        return !isImageMode;
    };

    CanvasTextProto.getTextSize = function (propScope) {
        var size;
        if (propScope.hasOwnProperty("size"))
            size = propScope["size"];
        else
            size = this.defaultProperties.ptSize;
        return size;
    };
    CanvasTextProto.getFillColor = function (propScope) {
        var color;
        if (propScope.hasOwnProperty("color"))
            color = propScope["color"];
        else
            color = this.defaultProperties.color;
        return color;
    };
    CanvasTextProto.getStroke = function (propScope) {
        var stroke;
        if (propScope.hasOwnProperty("stroke"))
            stroke = propScope["stroke"];
        else
            stroke = this.defaultProperties.stroke;
        return stroke;
    };

    CanvasTextProto.drawPen = function (pen, offsetX, offsetY) {
        var ctx = this.context;
        ctx.save();

        this.applyPropScope(pen.prop);

        var startX = offsetX + pen.x;
        var startY = offsetY + pen.y;

        // underline
        var underline = pen.prop["u"];
        if (underline) {
            underline = underline.split(" ");
            var color = underline[0];

            var thicknessSave = this.underline.thickness;
            if (underline[1] != null) this.underline.thickness = parseFloat(underline[1].replace("px", ""));

            var offsetSave = this.underline.offset;
            if (underline[2] != null) this.underline.offset = parseFloat(underline[2].replace("px", ""));

            this.drawUnderline(pen.text, startX, startY,
                this.getTextSize(pen.prop),
                color);

            this.underline.thickness = thicknessSave;
            this.underline.offset = offsetSave;
        }

        // draw image
        if (pen.prop.hasOwnProperty("img")) {
            var img = window.RexImageBank.GetImage(pen.prop["img"]);
            if (img) {
                var y = startY + img.yoffset;
                if (this.textBaseline == "alphabetic") {
                    y -= this.lineHeight;
                }
                ctx.drawImage(img.img, startX, y, img.width, img.height);
            }
        }

        // draw text
        else {
            // stoke
            if (this.getStroke(pen.prop).toLowerCase() !== "none")
                ctx.strokeText(pen.text, startX, startY);

            // fill text
            if (this.getFillColor(pen.prop).toLowerCase() !== "none")
                ctx.fillText(pen.text, startX, startY);
        }


        ctx.restore();
    };

    CanvasTextProto.drawUnderline = function (text, x, y, size, color) {
        var ctx = this.context;
        var width = ctx.measureText(text).width;
        //switch(ctx.textAlign)
        //{
        //case "center": x -= (width/2); break;
        //case "right": x -= width; break;
        //}
        y += this.underline.offset;
        if (this.textBaseline === "top")
            y += parseInt(size);

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = this.underline.thickness;
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.stroke();
    };

    CanvasTextProto.preProcess = function () {
        if (this.backgroundColor !== "") {
            var ctx = this.context;
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, this.textInfo["boxWidth"], this.textInfo["boxHeight"]);
        }
    };

    CanvasTextProto.drawPens = function (pensMgr, textInfo) {
        var boxWidth = textInfo["boxWidth"],
            boxHeight = textInfo["boxHeight"];
        var startX = textInfo["x"],
            startY = textInfo["y"];
        var lines = pensMgr.getLines(),
            lcnt = lines.length;

        var offsetX, offsetY;
        // vertical alignment
        if (this.plugin.valign === 1) // center
            offsetY = Math.max((boxHeight - (lcnt * this.lineHeight)) / 2, 0);
        else if (this.plugin.valign === 2) // bottom
            offsetY = Math.max(boxHeight - (lcnt * this.lineHeight) - 2, 0);
        else
            offsetY = 0;

        offsetY += startY;

        if (this.textBaseline == "alphabetic")
            offsetY += (this.plugin.vshift * this.plugin.runtime.devicePixelRatio); // shift line down    

        var li, lineWidth;
        var pi, pcnt, pens, pen;
        for (li = 0; li < lcnt; li++) {
            lineWidth = pensMgr.getLineWidth(li);
            if (lineWidth === 0)
                continue;

            if (this.plugin.halign === 1) // center
                offsetX = (boxWidth - lineWidth) / 2;
            else if (this.plugin.halign === 2) // right
                offsetX = boxWidth - lineWidth;
            else
                offsetX = 0;

            offsetX += startX;

            pens = lines[li];
            pcnt = pens.length;
            for (pi = 0; pi < pcnt; pi++) {
                pen = pens[pi];
                if (pen.text === "")
                    continue;

                this.drawPen(pen, offsetX, offsetY);
            }
        }
    };

    CanvasTextProto.postProcess = function () {

    };



    // split text into array
    var __re_class_header = /<\s*class=/i;
    var __re_class = /<\s*class=["|']([^"|']+)["|']\s*\>([\s\S]*?)<\s*\/class\s*\>/;
    var __re_style_header = /<\s*style=/i;
    var __re_style = /<\s*style=["|']([^"|']+)["|']\s*\>([\s\S]*?)<\s*\/style\s*\>/;

    var RAWTEXTONLY_MODE = 1;
    var __result = [];
    var splitText = function (txt, mode) {
        var re = /<\s*class=["|']([^"|']+)["|']\s*\>([\s\S]*?)<\s*\/class\s*\>|<\s*style=["|']([^"|']+)["|']\s*\>([\s\S]*?)<\s*\/style\s*\>/g;
        __result.length = 0;
        var arr, m, charIdx = 0,
            totalLen = txt.length,
            matchStart = totalLen;
        var innerMatch;
        while (true) {
            arr = re.exec(txt);
            if (!arr) {
                break;
            }


            m = arr[0];
            matchStart = re["lastIndex"] - m.length;

            if (charIdx < matchStart) {
                __result.push(txt.substring(charIdx, matchStart));

            }
            if (mode == null) {
                __result.push(m);
            } else if (mode === RAWTEXTONLY_MODE) {
                if (__re_class_header.test(m)) {
                    innerMatch = m.match(__re_class);
                    __result.push(innerMatch[2]);
                } else if (__re_style_header.test(m)) {
                    innerMatch = m.match(__re_style);
                    __result.push(innerMatch[2]);
                }
            }

            charIdx = re["lastIndex"];
        }


        if (charIdx < totalLen) {
            __result.push(txt.substring(charIdx, totalLen));
        }
        return __result;
    };
    // split text into array    

    var style2Prop = function (s) {
        s = s.split(";");
        var i, cnt = s.length;
        var result = {},
            prop, k, v;
        for (i = 0; i < cnt; i++) {
            prop = s[i].split(":");
            k = prop[0], v = prop[1];
            if (isEmpty(k) || isEmpty(v)) {
                // Wrong property name or value. We jump to the
                // next loop.
                continue;
            }

            result[k] = v;
        }
        return result;
    };


    CanvasTextProto.updatePens = function (pensMgr, textInfo, ignore_wrap) {
        if (textInfo == null)
            textInfo = this.textInfo;

        pensMgr.freePens();

        // Save the textInfo into separated vars to work more comfortably.
        var text = textInfo["text"],
            boxWidth = textInfo["boxWidth"],
            boxHeight = textInfo["boxHeight"];
        if (text === "")
            return;

        //var startX = textInfo["x"], startY = textInfo["y"];  
        // textInfo["x"], textInfo["y"] had been moved to drawPens

        var startX = 0,
            startY = 0;
        var cursorX = startX,
            cursorY = startY;
        var currentPropScope, proText;


        // The main regex. Looks for <style>, <class> tags.
        var m, match = splitText(text);
        if (match.length === 0)
            return;
        var i, match_cnt = match.length;
        var innerMatch = null;

        for (i = 0; i < match_cnt; i++) {

            m = match[i];
            proText = null;
            // Check if current fragment is a class tag.
            if (__re_class_header.test(m)) {
                // Looks the attributes and text inside the class tag.
                innerMatch = m.match(__re_class);
                if (innerMatch != null) {
                    currentPropScope = this.get_propScope(this.getClass(innerMatch[1]));
                    currentPropScope["class"] = innerMatch[1];
                    proText = innerMatch[2];
                }
            } else if (__re_style_header.test(m)) {
                // Looks the attributes and text inside the style tag.
                innerMatch = m.match(__re_style);

                if (innerMatch != null) {
                    // innerMatch[1] contains the properties of the attribute.               
                    currentPropScope = this.get_propScope(style2Prop(innerMatch[1]));
                    proText = innerMatch[2];
                }
            }

            if (proText === null) {
                // Text without special style.
                proText = m;
                currentPropScope = {};
            }

            // add image pen                    
            if (currentPropScope.hasOwnProperty("img")) {
                var img = window.RexImageBank.GetImage(currentPropScope["img"]);
                if (!img)
                    continue;

                if (!ignore_wrap) {
                    if (img.width > boxWidth - (cursorX - startX)) {
                        cursorX = startX;
                        cursorY += this.lineHeight;
                    }
                    pensMgr.addPen(null, // text
                        cursorX, // x
                        cursorY, // y
                        img.width, // width
                        currentPropScope, // prop
                        0 // newLineMode
                    );

                    cursorX += img.width;
                } else {
                    pensMgr.addPen(null, // text
                        null, // x
                        null, // y
                        null, // width
                        currentPropScope, // prop
                        0 // newLineMode
                    );
                }
            }

            // add text pen            
            else {

                if (!ignore_wrap) {
                    // Save the current context.
                    this.context.save();

                    this.applyPropScope(currentPropScope);

                    // wrap text
                    var wrap_lines = wordWrap(proText, this.context, boxWidth, this.plugin.wrapbyword, cursorX - startX);

                    // add pens
                    var lcnt = wrap_lines.length,
                        n, wrap_line;
                    for (n = 0; n < lcnt; n++) {
                        wrap_line = wrap_lines[n];
                        pensMgr.addPen(wrap_line.text, // text
                            cursorX, // x
                            cursorY, // y
                            wrap_line.width, // width
                            currentPropScope, // prop
                            wrap_line.newLineMode // newLineMode
                        );

                        if (wrap_line.newLineMode !== NO_NEWLINE) {
                            cursorX = startX;
                            cursorY += this.lineHeight;
                        } else {
                            cursorX += wrap_line.width;
                        }

                    }
                    this.context.restore();
                } else {
                    pensMgr.addPen(proText, // text
                        null, // x
                        null, // y
                        null, // width
                        currentPropScope, // prop
                        0 // newLineMode
                    );
                    // new line had been included in raw text
                }

            }
        } // for (i = 0; i < match_cnt; i++) 
    };

    CanvasTextProto.drawText = function () {
        var textInfo = this.textInfo;
        if (this.text_changed) {
            this.updatePens(this.pensMgr, textInfo);
            this.text_changed = false;
        }

        if (!textInfo["ignore"]) {
            // Let's draw the text
            // Set the text Baseline
            this.context.textBaseline = this.textBaseline;
            // Set the text align
            this.context.textAlign = this.textAlign;

            this.preProcess();
            this.drawPens(this.pensMgr, textInfo);
            this.postProcess();
        }

    };

    var __tempPensMgr = null;
    CanvasTextProto.getSubText = function (start, end, text) {
        if (text == null)
            return this.pensMgr.getSliceTagText(start, end);

        if (__tempPensMgr === null)
            __tempPensMgr = new PensMgrKlass();

        var textSave = this.textInfo["text"];
        this.textInfo["text"] = text;
        this.updatePens(__tempPensMgr, this.textInfo, true);
        this.textInfo["text"] = textSave;

        return __tempPensMgr.getSliceTagText(start, end);
    };

    CanvasTextProto.getRawText = function (text) {
        if (text == null)
            return this.pensMgr.getRawText();

        var m, match = splitText(text, RAWTEXTONLY_MODE);
        if (match.length === 0)
            return "";

        var i, match_cnt = match.length;
        var innerMatch, rawTxt = "";
        for (i = 0; i < match_cnt; i++) {
            rawTxt += match[i];
        } // for (i = 0; i < match_cnt; i++)     

        return rawTxt;
    };

    CanvasTextProto.copyPensMgr = function (pensMgr) {
        return this.pensMgr.copy(pensMgr);
    }

    CanvasTextProto.getTextWidth = function (pensMgr) {
        if (pensMgr == null)
            pensMgr = this.pensMgr;

        return pensMgr.getMaxLineWidth();
    };

    CanvasTextProto.getLastPen = function (pensMgr) {
        if (pensMgr == null)
            pensMgr = this.pensMgr;

        return pensMgr.getLastPen();
    };

    /**
     * Save a new class definition.
     */
    CanvasTextProto.defineClass = function (id, definition) {
        this.savedClasses[id] = definition;
        return true;
    };

    /**
     * Returns a saved class.
     */
    CanvasTextProto.getClass = function (id) {
        return this.savedClasses[id];
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

    CanvasTextProto.saveToJSON = function () {
        return {
            "cls": this.savedClasses,
            "bgc": this.backgroundColor
        };
    };

    CanvasTextProto.loadFromJSON = function (o) {
        this.savedClasses = o["cls"];
        this.backgroundColor = o["bgc"];
    };


    // ---------
    // wrap characters into lines
    // ---------	
    var NO_NEWLINE = 0;
    var RAW_NEWLINE = 1;
    var WRAPPED_NEWLINE = 2;
    var lineCache = new ObjCacheKlass();
    lineCache.newline = function (text, width, newLineMode) {
        var l = this.allocLine() || {};
        l.text = text;
        l.width = width;
        l.newLineMode = newLineMode; // 0= no new line, 1=raw "\n", 2=wrapped "\n"
        return l;
    };

    var __wrappedLines = [];
    var wordWrap = function (text, ctx, width, wrapbyword, offsetX) {
        var lines = __wrappedLines;
        lineCache.freeAllLines(lines);

        if (!text || !text.length) {
            return lines;
        }

        if (width <= 2.0) {
            return lines;
        }

        // If under 100 characters (i.e. a fairly short string), try a short string optimisation: just measure the text
        // and see if it fits on one line, without going through the tokenise/wrap.
        // Text musn't contain a linebreak!
        if (text.length <= 100 && text.indexOf("\n") === -1) {
            var all_width = ctx.measureText(text).width;

            if (all_width <= (width - offsetX)) {
                // fits on one line
                lineCache.freeAllLines(lines);
                lines.push(lineCache.newline(text, all_width, NO_NEWLINE));
                return lines;
            }
        }

        return WrapText(text, lines, ctx, width, wrapbyword, offsetX);
    };

    var WrapText = function (text, lines, ctx, width, wrapbyword, offsetX) {
        var wordArray = (wrapbyword) ? TokeniseWords(text) : text;

        var cur_line = "";
        var prev_line;
        var lineWidth;
        var i, wcnt = wordArray.length;
        var lineIndex = 0;
        var line;

        for (i = 0; i < wcnt; i++) {
            // Look for newline
            if (wordArray[i] === "\n") {
                // Flush line.  Recycle a line if possible
                if (lineIndex >= lines.length)
                    lines.push(lineCache.newline(cur_line, ctx.measureText(cur_line).width, RAW_NEWLINE));

                lineIndex++;
                cur_line = "";
                offsetX = 0;
                continue;
            }

            // Otherwise add to line
            prev_line = cur_line;
            cur_line += wordArray[i];

            // Measure line
            lineWidth = ctx.measureText(cur_line).width;

            // Line too long: wrap the line before this word was added
            if (lineWidth >= (width - offsetX)) {
                // Append the last line's width to the string object
                if (lineIndex >= lines.length)
                    lines.push(lineCache.newline(prev_line, ctx.measureText(prev_line).width, WRAPPED_NEWLINE));

                lineIndex++;
                cur_line = wordArray[i];

                // Wrapping by character: avoid lines starting with spaces
                if (!wrapbyword && cur_line === " ")
                    cur_line = "";

                offsetX = 0;
            }
        }

        // Add any leftover line
        if (cur_line.length) {
            if (lineIndex >= lines.length)
                lines.push(lineCache.newline(cur_line, ctx.measureText(cur_line).width, NO_NEWLINE));

            lineIndex++;
        }

        // truncate lines to the number that were used. recycle any spare line objects
        for (i = lineIndex; i < lines.length; i++)
            lineCache.freeLine(lines[i]);

        lines.length = lineIndex;
        return lines;
    };

    var __wordsCache = [];
    var TokeniseWords = function (text) {
        __wordsCache.length = 0;
        var cur_word = "";
        var ch;

        // Loop every char
        var i = 0;

        while (i < text.length) {
            ch = text.charAt(i);

            if (ch === "\n") {
                // Dump current word if any
                if (cur_word.length) {
                    __wordsCache.push(cur_word);
                    cur_word = "";
                }

                // Add newline word
                __wordsCache.push("\n");

                ++i;
            }
            // Whitespace or hyphen: swallow rest of whitespace and include in word
            else if (ch === " " || ch === "\t" || ch === "-") {
                do {
                    cur_word += text.charAt(i);
                    i++;
                }
                while (i < text.length && (text.charAt(i) === " " || text.charAt(i) === "\t"));

                __wordsCache.push(cur_word);
                cur_word = "";
            } else if (i < text.length) {
                cur_word += ch;
                i++;
            }
        }

        // Append leftover word if any
        if (cur_word.length)
            __wordsCache.push(cur_word);

        return __wordsCache;
    };



    // ---------
    // wrap characters into lines
    // ---------

    // ---------
    // pens manager
    // ---------    
    var __penMgr_penCache = new ObjCacheKlass();
    var __penMgr_lineCache = new ObjCacheKlass();
    var PensMgrKlass = function () {
        this.pens = []; // all pens
        this.lines = []; // pens in lines [ [],[],[],.. ]

    };
    var PensMgrKlassProto = PensMgrKlass.prototype;

    PensMgrKlassProto.freePens = function () {
        var li, lcnt = this.lines.length;
        for (li = 0; li < lcnt; li++)
            this.lines[li].length = 0; // unlink pens 

        __penMgr_penCache.freeAllLines(this.pens);
        __penMgr_lineCache.freeAllLines(this.lines);
    };


    PensMgrKlassProto.addPen = function (txt, x, y, width, prop, newLineMode) {
        var pen = __penMgr_penCache.allocLine();
        if (pen === null) {
            pen = new PenKlass();
        }
        pen.setPen(txt, x, y, width, prop, newLineMode);

        var previousPen = this.pens[this.pens.length - 1];
        if (previousPen == null)
            pen.startIndex = 0;
        else
            pen.startIndex = previousPen.getNextStartIndex();
        this.pens.push(pen);

        // maintan lines
        var line = this.lines[this.lines.length - 1];
        if (line == null) {
            line = __penMgr_lineCache.allocLine() || [];
            this.lines.push(line);
        }
        line.push(pen);

        // new line, add an empty line
        if (newLineMode !== NO_NEWLINE) {
            line = __penMgr_lineCache.allocLine() || [];
            this.lines.push(line);
        }
    };

    PensMgrKlassProto.getPens = function () {
        return this.pens;
    };

    PensMgrKlassProto.getLastPen = function () {
        return this.pens[this.pens.length - 1];
    };

    PensMgrKlassProto.getLines = function () {
        return this.lines;
    };

    PensMgrKlassProto.getLineStartChartIndex = function (i) {
        var line = this.lines[i];
        if (line == null)
            return 0;

        return line[0].startIndex;
    };

    PensMgrKlassProto.getLineEndChartIndex = function (i) {
        var li, hasLastPen = false,
            line;
        for (li = i; li >= 0; li--) {
            line = this.lines[li];
            hasLastPen = (line != null) && (line.length > 0);
            if (hasLastPen)
                break;
        }
        if (!hasLastPen)
            return 0;

        var lastPen = line[line.length - 1];
        return lastPen.getEndIndex();
    };

    PensMgrKlassProto.copy = function (targetPensMgr) {
        if (targetPensMgr == null)
            targetPensMgr = new PensMgrKlass();

        targetPensMgr.freePens();

        var li, lcnt = this.lines.length;
        var pens, pi, pcnt, pen;
        for (li = 0; li < lcnt; li++) {
            pens = this.lines[li];
            pcnt = pens.length;

            for (pi = 0; pi < pcnt; pi++) {
                pen = pens[pi];
                targetPensMgr.addPen(pen.text,
                    pen.x,
                    pen.y,
                    pen.width,
                    pen.prop,
                    pen.newLineMode);

            }
        }

        return targetPensMgr;
    };

    PensMgrKlassProto.getLineWidth = function (i) {
        var line = this.lines[i];
        if (!line)
            return 0;

        var lastPen = line[line.length - 1];
        if (!lastPen)
            return 0;

        var firstPen = line[0];
        var lineWidth = lastPen.getLastX(); // start from 0
        return lineWidth;
    };

    PensMgrKlassProto.getMaxLineWidth = function () {
        var w, maxW = 0,
            i, cnt = this.lines.length,
            line, lastPen;
        for (i = 0; i < cnt; i++) {
            w = this.getLineWidth(i);
            if (w > maxW)
                maxW = w;
        }

        return maxW;
    };

    PensMgrKlassProto.getRawText = function () {
        var txt = "",
            i, cnt = this.pens.length,
            pen;
        for (i = 0; i < cnt; i++)
            txt += this.pens[i].getRawText();

        return txt;
    };

    PensMgrKlassProto.getRawTextLength = function () {
        var l = 0,
            i, cnt = this.pens.length,
            pen;
        for (i = 0; i < cnt; i++)
            l += this.pens[i].getRawText().length;

        return l;
    };

    PensMgrKlassProto.getSliceTagText = function (start, end) {
        if (start == null)
            start = 0;
        if (end == null) {
            var lastPen = this.getLastPen();
            if (lastPen == null)
                return "";

            end = lastPen.getEndIndex();
        }

        var txt = "",
            i, cnt = this.pens.length,
            pen, pen_txt, pen_si, pen_ei, in_range;
        for (i = 0; i < cnt; i++) {
            pen = this.pens[i];
            pen_txt = pen.getRawText();
            pen_si = pen.startIndex;
            pen_ei = pen.getNextStartIndex();

            if (pen_ei < start)
                continue;

            in_range = (pen_si >= start) && (pen_ei < end);
            if (!in_range) {
                pen_txt = pen_txt.substring(start - pen_si, end - pen_si);
            }

            txt += prop2TagText(pen_txt, pen.prop);

            if (pen_ei >= end)
                break;
        }

        return txt;
    };

    var __propList = [];
    var prop2TagText = function (txt, prop) {
        if (prop["class"]) // class mode
            txt = "<class='" + prop["class"] + "'>" + txt + "</class>";
        else // style mode
        {
            __propList.length = 0;
            for (var k in prop) {
                __propList.push(k + ":" + prop[k]);
            }

            if (__propList.length > 0)
                txt = "<style='" + __propList.join(";") + "'>" + txt + "</style>";
        }
        return txt;
    };


    var PenKlass = function () {
        this.text = null;
        this.x = null;
        this.y = null;
        this.width = null;
        this.prop = {};
        this.newLineMode = null;
        this.startIndex = null;
    }
    var PenKlassProto = PenKlass.prototype;

    PenKlassProto.setPen = function (txt, x, y, width, prop, newLineMode, start_index) {
        this.text = txt;
        this.x = x;
        this.y = y;
        this.width = width;
        copyTable(prop, this.prop); // font, size, color, shadow, etc...
        this.newLineMode = newLineMode; // 0= no new line, 1=raw "\n", 2=wrapped "\n"
        this.startIndex = start_index;
    };

    PenKlassProto.getRawText = function () {
        var txt = this.text || "";
        if (this.newLineMode == RAW_NEWLINE)
            txt += "\n";

        return txt;
    }
    PenKlassProto.getNextStartIndex = function () {
        return this.startIndex + this.getRawText().length;
    };

    PenKlassProto.getEndIndex = function () {
        return this.getNextStartIndex() - 1;
    };

    PenKlassProto.getLastX = function () {
        return this.x + this.width;
    };
    // ---------
    // pens manager
    // --------- 

    // ---------
    // Image bank
    // ---------   
    var ImageBankKlass = function () {
        this.images = {};
    }
    var ImageBankKlassProto = ImageBankKlass.prototype;

    ImageBankKlassProto.AddImage = function (name, inst, yoffset_) {
        var img = getImage(inst)
        if (!inst)
            return;

        this.images[name] = {
            img: img,
            width: inst.width,
            height: inst.height,
            yoffset: yoffset_
        };
    };
    ImageBankKlassProto.GetImage = function (name, inst) {
        return this.images[name];
    };
    ImageBankKlassProto.RemoveImage = function (name) {
        if (this.images.hasOwnProperty(name))
            delete this.images[name];
    };
    ImageBankKlassProto.RemoveAll = function () {
        for (var n in this.images)
            delete this.images[n];
    };

    var getImage = function (inst) {
        if (!inst)
            return null;

        var img;
        if (inst.canvas)
            img = inst.canvas;
        else if (inst.curFrame && inst.curFrame.texture_img)
            img = inst.curFrame.texture_img;
        else
            img = null;

        return img;
    };

    window.RexImageBank = new ImageBankKlass();
    // ---------
    // Image bank
    // ---------         
}());