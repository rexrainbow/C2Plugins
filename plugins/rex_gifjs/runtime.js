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
        };
        this.GIFObj = null;        
        this.resultBlob = null;
        this.afterRender = false;
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
    
	instanceProto.getGIFObj = function ()
	{
        if (this.GIFObj != null)
            return this.GIFObj;
        
        this.GIFObj = new window["GIF"](this.options);
        
        var self=this;
        var onFinished = function(blob)
        {
            self.resultBlob = blob;
            self.runtime.trigger(cr.plugins_.Rex_GIFJS.prototype.cnds.OnFinished, self); 
        }
        this.GIFObj["on"]("finished", onFinished);        
        return this.GIFObj;
	};     
    
    var getImage= function (inst)
    {
        var img;
        if (cr.plugins_.c2canvas && (inst instanceof cr.plugins_.c2canvas.prototype.Instance))
            img = inst.canvas;
        else if (cr.plugins_.Sprite && (inst instanceof cr.plugins_.Sprite.prototype.Instance))
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

    Acts.prototype.AddFrame = function (objs, delay, copy)
	{
        if (!objs)
            return;
        
        var inst = objs.getFirstPicked();
        var img = getImage(inst);
        if (!img)
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
        this.options["transparent"] = transparent;
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.ObjectURL = function (ret)
	{             
        var val = (this.resultBlob)? URL.createObjectURL(this.resultBlob): "";
		ret.set_string( val );
	}; 
    
    
}());