// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_CanvasExt = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_CanvasExt.prototype;
		
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
        var overrideSL = this.properties[0];
        if (overrideSL === 1)
        {
            this.my_saveToJSON = this.zlib_saveToJSON;
            this.my_loadFromJSON = this.zlib_loadFromJSON;        
        }
        
        if (overrideSL !== 0)
        {
            this.inst.saveToJSON = this.my_saveToJSON;
            this.inst.loadFromJSON = this.my_loadFromJSON;        
        }        
	};  
	
	behinstProto.tick = function ()
	{
	};
    
    // ---------------------------------------------------------------------
    // override original saving/loading
    // ---------------------------------------------------------------------    
	behinstProto.zlib_saveToJSON = function ()
	{
        var inst = this;
        var w = inst.canvas.width;
        var h = inst.canvas.height;
        var plain = inst.ctx.getImageData(0, 0, w, h).data;
        var d = window.RexC2ZlibU8Arr.u8a2String(plain);
        
		return {
            "w":w,
            "h":h,
            "d":d,
		};
	};
    
	behinstProto.zlib_loadFromJSON = function (o)
	{             
        var inst = this;
        inst.canvas.width = o["w"];
        inst.canvas.height = o["h"];
        
        var plain = window.RexC2ZlibU8Arr.string2u8a(o["d"]);
        var img_data = inst.ctx.createImageData(o["w"], o["h"]);
        var data = img_data.data;
        var i, cnt = data.length;
        for (i=0; i<cnt; i++)
        {
            data[i] = plain[i];
        }
        inst.ctx.putImageData(img_data, 0, 0);
        inst.update_tex = true;
	};    
    // ---------------------------------------------------------------------
    // override original saving/loading
    // ---------------------------------------------------------------------        
 	
	//helper function
	behinstProto.draw_instances = function (instances, canvas_inst, blend_mode)
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
			
			ctx.save();
			ctx.scale(canvas.width/canvas_inst.width, canvas.height/canvas_inst.height);
			ctx.rotate(-canvas_inst.angle);
			ctx.translate(-canvas_inst.bquad.tlx, -canvas_inst.bquad.tly);
			mode_save = inst.compositeOp;
			inst.compositeOp = blend_mode;
            ctx.globalCompositeOperation = blend_mode;
			inst.draw(ctx);		
			inst.compositeOp = mode_save;	
			ctx.restore();
		}
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	Cnds.prototype.OnURLLoaded = function ()
	{
		return true;
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	Acts.prototype.JSONLoad = function (json_)
	{
		var o;
		
		try {
			o = JSON.parse(json_);
		}
		catch(e) { return; }
		
        this.my_loadFromJSON.call(this.inst, o);
        
		this.inst.runtime.redraw = true;
        this.inst.update_tex = true;  
	};
		
    
	// http://www.scirra.com/forum/plugin-canvas_topic46006_post289303.html#289303
	Acts.prototype.EraseObject = function (object)
	{
	    var canvas_inst = this.inst;	
		this.inst.update_bbox();
		
		var sol = object.getCurrentSol();
		var instances;
		if (sol.select_all)
			instances = sol.type.instances;
		else
			instances = sol.instances;
		
		this.draw_instances(instances, canvas_inst, "destination-out");
		
		this.inst.runtime.redraw = true;
        this.inst.update_tex = true;  
	};
	
	Acts.prototype.LoadURL = function (url_, resize_, crossOrigin_)
	{
		var img = new Image();
		var self = this;

		img.onload = function ()
		{
		    var inst = self.inst;

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
			self.runtime.trigger(cr.behaviors.Rex_CanvasExt.prototype.cnds.OnURLLoaded, inst);
		};
		
		if (url_.substr(0, 5) !== "data:" && crossOrigin_ === 0)
			img["crossOrigin"] = "anonymous";
		
		// use runtime function to work around WKWebView permissions
		this.runtime.setImageSrc(img, url_);
	};
    
	Acts.prototype.Eval = function (code)
	{
        var f = "(function(ctx){" + code + "})";
        f = eval(f);
        
        var inst = this.inst;
        f(inst.ctx);
		inst.runtime.redraw = true;
        inst.update_tex = true;        
	};   
        
    
	Acts.prototype.SetShadow = function (offsetX, offsetY, blur, color)
	{
        var ctx = this.inst.ctx;
        ctx["shadowOffsetX"] = offsetX;
        ctx["shadowOffsetY"] = offsetY;
        ctx["shadowBlur"] = blur;
        ctx["shadowColor"] = color;        
	}; 	   
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.AsJSON = function (ret)
	{
        var o = this.my_saveToJSON.call(this.inst);
		ret.set_string(JSON.stringify(o));
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