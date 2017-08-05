// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_canvas = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_canvas.prototype;
		
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
		if (this.is_family)
			return;
		// Create the texture
		this.texture_img = new Image();
		this.texture_img.src = this.texture_file;
		this.texture_img.cr_filesize = this.texture_filesize;
		
		// Tell runtime to wait for this to load
		this.runtime.wait_for_textures.push(this.texture_img);
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
		this.visible = (this.properties[0] === 0);							// 0=visible, 1=invisible
		this.canvas = document.createElement('canvas');
		this.canvas["width"] = this.width;
		this.canvas["height"] = this.height;
		this.ctx = this.canvas["getContext"]('2d');
		this.ctx["drawImage"](this.type.texture_img,0,0,this.width,this.height);
		
        this.update_tex = true;
		this.rcTex = new cr.rect(0, 0, 0, 0);
		//if (this.runtime.gl && !this.type.webGL_texture)
		//	this.type.webGL_texture = this.runtime.glwrap.loadTexture(this.type.texture_img, true, this.runtime.linearSampling);
	};
    
    // called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
		this.ctx = null;
		jQuery(this.canvas).remove();
		this.canvas = null;		
	};
    
	instanceProto.draw = function(ctx)
	{	
		ctx["save"]();
		
		ctx["globalAlpha"] = this.opacity;
        
		var myx = this.x;
		var myy = this.y;
		
		if (this.runtime.pixel_rounding)
		{
			myx = Math.round(myx);
			myy = Math.round(myy);
		}
		
        if ((myx !== 0) || (myy !== 0))
		    ctx["translate"](myx, myy);
        
        if (this.angle !== 0)
		    ctx["rotate"](this.angle);
				
		ctx["drawImage"](this.canvas,
						  0 - (this.hotspotX * this.width),
						  0 - (this.hotspotY * this.height),
						  this.width,
						  this.height);
		
		ctx["restore"]();
	};

	instanceProto.drawGL = function(glw)
	{
        if (this.update_tex)
        {
            if (this.tex)
                glw.deleteTexture(this.tex);
            this.tex=glw.loadTexture(this.canvas, false, this.runtime.linearSampling);
            this.update_tex = false;
        }
		glw.setTexture(this.tex);
		glw.setOpacity(this.opacity);

		var q = this.bquad;
		
		if (this.runtime.pixel_rounding)
		{
			var ox = Math.round(this.x) - this.x;
			var oy = Math.round(this.y) - this.y;
			
			glw.quad(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy);
		}
		else
			glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
	};

	//helper function
	instanceProto.draw_instances = function (instances, canvas_inst, blend_mode)
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
			
			ctx["save"]();
			ctx["scale"](canvas.width/canvas_inst.width, canvas.height/canvas_inst.height);
			ctx["rotate"](-canvas_inst.angle);
			ctx["translate"](-canvas_inst.bquad.tlx, -canvas_inst.bquad.tly);
			mode_save = inst.compositeOp;
			inst.compositeOp = blend_mode;
            ctx["globalCompositeOperation"] = blend_mode;
			inst.draw(ctx);		
			inst.compositeOp = mode_save;	
			ctx["restore"]();
		}
	};
    
	instanceProto.DrawObject = function (objtype, blend_mode)
	{
        if (!objtype)
            return;

		this.update_bbox();
		
		var sol = objtype.getCurrentSol();
		var instances;
		if (sol.select_all)
			instances = sol.type.instances;
		else
			instances = sol.instances;
		
		this.draw_instances(instances, this, blend_mode);
		
		this.runtime.redraw = true;
        this.update_tex = true;  
	};    
    
    var CompositingMap = [
        "source-over",
        "source-in",
        "source-out",
        "source-atop",
        "destination-over",
        "destination-in",
        "destination-out",
        "destination-atop",
        "lighter",
        "copy",
        "xor",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity",  
    ];

	instanceProto.saveToJSON = function ()
	{
        var w = this.canvas["width"];
        var h = this.canvas["height"];
        var plain = this.ctx["getImageData"](0, 0, w, h)["data"];
        var d = window.RexC2ZlibU8Arr.u8a2String(plain);
        
		return {
            "w":w,
            "h":h,
            "d":d,
		};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        this.canvas["width"] = o["w"];
        this.canvas["height"] = o["h"];
        
        var plain = window.RexC2ZlibU8Arr.string2u8a(o["d"]);
        var img_data = this.ctx["createImageData"](o["w"], o["h"]);
        var data = img_data["data"];
        var i, cnt = data.length;
        for (i=0; i<cnt; i++)
        {
            data[i] = plain[i];
        }
        this.ctx["putImageData"](img_data, 0, 0);
		this.runtime.redraw = true;        
        this.update_tex = true;  
	};
	    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnURLLoaded = function ()
	{
		return true;
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.Eval = function (code)
	{
        var f = "(function(ctx){" + code + "})";
        f = eval(f);
        f(this.ctx);
		this.runtime.redraw = true;
        this.update_tex = true;        
	};   
    	
	Acts.prototype.ResizeCanvas = function (w, h)
	{
		this.canvas["width"] = w;
		this.canvas["height"] = h;
		this.runtime.redraw = true;
        this.update_tex = true;
	};
	
    
    // Drawing rectangles    
	Acts.prototype.ClearRect = function (x,y,w,h)
	{
        this.ctx["clearRect"](x,y,w,h);
		this.runtime.redraw = true;
        this.update_tex = true;  
	};
    
	Acts.prototype.FillRect = function (x,y,w,h)
	{
        this.ctx["fillRect"](x,y,w,h);        
		this.runtime.redraw = true;
        this.update_tex = true;  
	}; 
    
	Acts.prototype.StrokeRect = function (x,y,w,h)
	{
        this.ctx["strokeRect"](x,y,w,h);                
		this.runtime.redraw = true;
        this.update_tex = true;  
	};   
    
    // Drawing text    
	Acts.prototype.FillText = function (text,x,y)
	{
        this.ctx["fillText"](text,x,y);          
		this.runtime.redraw = true;
        this.update_tex = true;  
	}; 
    
	Acts.prototype.StrokeText = function (text,x,y)
	{
        this.ctx["strokeText"](text,x,y);
		this.runtime.redraw = true;
        this.update_tex = true;
	};   
    
    // Line styles
	Acts.prototype.SetLineWidth = function (w)
	{
        this.ctx["lineWidth"] = w;
	}; 
    var LineCapMap = ["butt", "round", "square"];
	Acts.prototype.SetLineCap = function (cap)
	{
        if (typeof(cap) === "number")
            cap = LineCapMap[cap];
        this.ctx["lineCap"] = cap; 
	};
    var LineJoinMap = ["bevel", "round", "miter"];
	Acts.prototype.SetLineCap = function (join)
	{
        if (typeof(cap) === "number")
            join = LineJoinMap[join];
        this.ctx["lineJoin"] = join;
	};
	Acts.prototype.SetMiterLimit = function (m)
	{
        this.ctx["miterLimit"] = m;
	};     
    // TODO    
    
    // Text styles      
	Acts.prototype.SetFont = function (font)
	{
        this.ctx["font"] = font;
	};    
    var AlignMap = ["left", "right", "center", "start", "end"];
	Acts.prototype.SetTextAlign = function (align)
	{
        if (typeof(align) === "number")
            align = AlignMap[align];
        this.ctx["textAlign"] = align;
	};
    var BaselineMap = ["top", "hanging", "middle", "alphabetic", "ideographic", "bottom"];
	Acts.prototype.SetTextBaseline = function (baseline)
	{
        if (typeof(baseline) === "number")
            baseline = BaselineMap[baseline];
        this.ctx["textBaseline"] = baseline;
	};    
    
    // Fill and stroke styles  
	Acts.prototype.SetFillColor = function (color)
	{
        this.ctx["fillStyle"] = color;
	};     
	Acts.prototype.SetStrokeColor = function (color)
	{
        this.ctx["strokeStyle"] = color;
	};    

    // Shadows
	Acts.prototype.SetShadowBlur = function (blur)
	{
        this.ctx["shadowBlur"] = blur;
	};        
	Acts.prototype.SetShadowColor = function (color)
	{
        this.ctx["shadowColor"] = color;
	};     
	Acts.prototype.SetShadowOffsetX = function (offset)
	{
        this.ctx["shadowOffsetX"] = offset;
	};        
	Acts.prototype.SetShadowOffsetY = function (offset)
	{
        this.ctx["shadowOffsetY"] = offset;
	};
    
    // Paths
	Acts.prototype.BeginPath = function ()
	{
        this.ctx["beginPath"]();
	};    
	Acts.prototype.ClosePath = function ()
	{
        this.ctx["closePath"]();
	}; 
	Acts.prototype.MoveTo = function (x, y)
	{
        this.ctx["moveTo"](x, y);
	};
	Acts.prototype.LineTo = function (x, y)
	{
        this.ctx["lineTo"](x, y);
	};
	Acts.prototype.BezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y)
	{
        this.ctx["bezierCurveTo"](cp1x, cp1y, cp2x, cp2y, x, y);
	};
	Acts.prototype.QuadraticCurveTo = function (cpx, cpy, x, y)
	{
        this.ctx["quadraticCurveTo"](cpx, cpy, x, y);
	};
	Acts.prototype.Arc = function (x, y, radius, startAngle, endAngle, anticlockwise)
	{
        this.ctx["arc"](x, y, radius, cr.to_radians(startAngle), cr.to_radians(endAngle), (anticlockwise===1));
	};
	Acts.prototype.ArcTo = function (x1, y1, x2, y2, radius)
	{
        this.ctx["arcTo"](x1, y1, x2, y2, radius);
	}; 
	Acts.prototype.Rect = function (x, y, width, height)
	{
        this.ctx["rect"](x, y, width, height);
	};    
    
    // Drawing paths
    var FillRuleMap = ["nonzero", "evenodd"];
	Acts.prototype.Fill = function (fillRule)
	{
        if (typeof(fillRule) === "number")
            fillRule = FillRuleMap[fillRule];        
        this.ctx["fill"](fillRule);
		this.runtime.redraw = true;
        this.update_tex = true;        
	};    
    
	Acts.prototype.Stroke = function ()
	{       
        this.ctx["stroke"]();
		this.runtime.redraw = true;
        this.update_tex = true;
	};  

	Acts.prototype.Clip = function (fillRule)
	{
        if (typeof(fillRule) === "number")
            fillRule = FillRuleMap[fillRule];        
        this.ctx["clip"](fillRule);
	};      

    
	// http://www.scirra.com/forum/plugin-canvas_topic46006_post289303.html#289303
	Acts.prototype.EraseObject = function (objtype)
	{
        this.DrawObject(objtype, "destination-out");
	};
    
	Acts.prototype.DrawObject = function (objtype, mode)
	{
        if (typeof(mode) === "number")
            mode = CompositingMap[mode];
        this.DrawObject(objtype, mode);
	};	
	Acts.prototype.LoadURL = function (url_, resize_)
	{
		var img = new Image();
		var self = this;

		img.onload = function ()
		{
		    var inst = self;

            var is_size_change = false;
            // Resize to image size
			if ((resize_ === 0) && 
			    ((inst.width != img.width) || (inst.height != img.height)))
			{
				inst.width = img.width;
				inst.height = img.height;
                
				is_size_change = true;            
			}
            else if (resize_ === 2)
            {
                var scale_width = inst.width / img.width;
                var scale_height = inst.height / img.height;            
                
                // smaller than canvas, keep current size
                if ((scale_width > 1) && (scale_height > 1))
                {
				    inst.width = img.width;
				    inst.height = img.height;
                    
				    is_size_change = true;   
                }
                // larger than canvas, scale down
                else if ((scale_width < 1) || (scale_height < 1))
                {
                    var min_scale = (scale_width < scale_height)? scale_width:scale_height;
                    
				    inst.width = img.width * min_scale;
				    inst.height = img.height * min_scale;
                    
				    is_size_change = true; 
                }
            }
            
            if (is_size_change)
            {
			    inst.set_bbox_changed();
				inst.canvas.width = inst.width;
				inst.canvas.height = inst.height;              
            }
            
            var canvas = inst.canvas;
            if (img.width !== canvas.width)
                canvas.width = img.width;
            if (img.height !== canvas.height)
                canvas.height = img.height;            

            inst.ctx.clearRect(0,0, img.width, img.height);
		    inst.ctx.drawImage(img, 0, 0, img.width, img.height);
			
			self.runtime.redraw = true;
            inst.update_tex = true; 
			self.runtime.trigger(cr.plugins_.Rex_canvas.prototype.cnds.OnURLLoaded, inst);
		};
		
		if (url_.substr(0, 5) !== "data:")
			img.crossOrigin = 'anonymous';
		
		img.src = url_;
	};
	 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.CanvasWidth = function (ret)
	{
		ret.set_float( this.canvas["width"] );
	};    
    
	Exps.prototype.CanvasHeight = function (ret)
	{
		ret.set_float( this.canvas["height"] );
	};   
    
	Exps.prototype.TextWidth = function (ret, text)
	{
		ret.set_float( this.ctx["measureText"](text)["width"] );
	};
    
	Exps.prototype.ImageUrl = function (ret)
	{
		ret.set_string(this.canvas["toDataURL"]());
	};    
    
}());

(function ()
{
    // dependency:	zlib_and_gzip.min.js
    
    if (window.RexC2ZlibU8Arr != null)
        return;
    
    window.RexC2ZlibU8Arr = {};
    
        var CHUNK_SZ = 0x8000;    
    var __arr = [];
	window.RexC2ZlibU8Arr.u8a2String = function (u8a)
	{
        var deflate = new window["Zlib"]["Deflate"](u8a);
        var d = deflate["compress"]();    

        for (var i=0; i < d.length; i+=CHUNK_SZ) 
        {
            __arr.push(String.fromCharCode.apply(null, d.subarray(i, i+CHUNK_SZ)));
        }
        var s = __arr.join("");
        s = btoa(s);
        __arr.length = 0;
        
        return s;
	};
    
	window.RexC2ZlibU8Arr.string2u8a = function (s)
	{     
        var d = atob(s);
        d = d.split('').map(function(e) {
                return e.charCodeAt(0);
        });
        var inflate = new window["Zlib"]["Inflate"](d);
        var plain = inflate["decompress"]();
        return plain;
	}; 
    
}());    