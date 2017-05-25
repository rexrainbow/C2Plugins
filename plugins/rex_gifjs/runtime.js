// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_GIFJS = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_GIFJS.prototype;
		
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
        this.options = {
            "repeat": this.properties[0],
            "quality": this.properties[1],
            "workers": this.properties[2],
            "background": this.properties[3],
            "transparent": (this.properties[4] !== "")? this.properties[4] : null,
        };
        this.GIFObj = null;        
        this.afterRender = false;        
        this.resultBlob = null;
        
        this.exp_ObjectURL = "";
        this.exp_ContentType = "";

	};
    
	instanceProto.onDestroy = function ()
	{
        this.releaseObjectURL(); 
	};   
    
	instanceProto.getGIFObj = function ()
	{
        if (this.GIFObj != null)
            return this.GIFObj;
        
        this.GIFObj = new window["GIF"](this.options);
        
        var self=this;
        var onFinished = function(blob)
        {
            self.releaseObjectURL();            
            self.resultBlob = blob;
            self.exp_ObjectURL = URL.createObjectURL(blob);
            self.exp_ContentType = blob["type"] || "";
            self.runtime.trigger(cr.plugins_.Rex_GIFJS.prototype.cnds.OnFinished, self); 
        }
        this.GIFObj["on"]("finished", onFinished);        
        return this.GIFObj;
	};     
    
	instanceProto.releaseObjectURL = function ()
	{
        if (this.exp_ObjectURL === "")
            return;
        
        URL.revokeObjectURL(this.exp_ObjectURL);
        this.exp_ObjectURL = "";
        this.exp_ContentType = "";
	};  
    
	instanceProto.addFrame = function (img, delay, copy)
	{        
        if (img == null)
            return;
        
        if (this.afterRender)
        {
            this.GIFObj = null;
            this.afterRender = false;
        }
        
        var options = {
            "delay": Math.floor(delay*1000),   
            "copy": (copy === 1),
        };        
        this.getGIFObj()["addFrame"](img, options)
	};      
    
    var getImage= function (inst)
    {        
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
    }
    
    ////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnFinished = function ()
	{
		return true;
	};

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.AddCanvas = function (objs, delay, copy)
	{
        if (!objs)
            return;
        
        var inst = objs.getFirstPicked();
        var img = getImage(inst);
        
        this.addFrame(img, delay, copy);
	}; 

    Acts.prototype.AddURI = function (url_, delay)
	{     
        //var img = new Image();
		//if (url_.substr(0, 5) !== "data:")
		//	img["crossOrigin"] = "anonymous";
		//
		//// use runtime function to work around WKWebView permissions
		//this.runtime.setImageSrc(img, url_);
        //this.addFrame(img, delay);
	}; 
    
    Acts.prototype.Render = function ()
	{
        this.getGIFObj()["render"]();
        this.afterRender = true;
	};

    Acts.prototype.SetRepeat = function (repeat)
	{
        this.options["repeat"] = repeat;
	};

    Acts.prototype.SetQuality = function (quality)
	{
        this.options["quality"] = quality;
	};    

    Acts.prototype.SetWorkers = function (workers)
	{
        this.options["workers"] = workers;
	}; 
    
    Acts.prototype.SetBackground = function (background)
	{
        this.options["background"] = background;
	};     

    Acts.prototype.SetTransparent = function (transparent)
	{
        this.options["transparent"] = (transparent !== "")? transparent : null;
	}; 

    Acts.prototype.Release = function ()
	{
        this.releaseObjectURL(); 
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.ObjectURL = function (ret)
	{
		ret.set_string( this.exp_ObjectURL );
	}; 

	Exps.prototype.ContentType = function (ret)
	{
		ret.set_string( this.exp_ContentType );
	};     
    
}());