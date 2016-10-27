// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_tesseractjs = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_tesseractjs.prototype;
		
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
        this.options = {};    
        if (this.properties[0] !== "")        
            this.options["lang"] = this.properties[0];
        
        this.createOptions = { };
        if (this.properties[1] !== "")
            this.createOptions["corePath"] = this.properties[1];
        if (this.properties[2] !== "")
            this.createOptions["langPath"] = this.properties[2];        
        if (this.properties[3] !== "")
            this.createOptions["workerPath"] = this.properties[3];            
        
        this.tesseractObj = null;        
        this.progress = null;
        this.error = null;        
        this.result = null;
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
    
	instanceProto.GetTesseractObj = function ()
	{
        if (this.tesseractObj !== null)
            return this.tesseractObj;
        
        this.tesseractObj = window["Tesseract"]["create"](this.createOptions);
        return this.tesseractObj;
	}; 
    
	instanceProto.GetTesseractJob = function(img, fnName)
    {
        var self=this;
        var onProgress = function(p)
        {
            self.progress = p;
            self.runtime.trigger(cr.plugins_.Rex_tesseractjs.prototype.cnds.OnProgress, self);                 
        };
        var onError = function (err)
        {
            self.error = err;
            self.runtime.trigger(cr.plugins_.Rex_tesseractjs.prototype.cnds.OnError, self);            
        }
        var onFinished = function(result)
        {
            self.result = result;
            self.runtime.trigger(cr.plugins_.Rex_tesseractjs.prototype.cnds.OnCompleted, self);
        };
        var job = this.GetTesseractObj()[fnName](img, this.options);
        job["progress"](onProgress);
        job["catch"](onError);
        job["then"](onFinished);   

        return job;        
    }    
    
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
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnCompleted = function ()
	{
		return true;
	};

	Cnds.prototype.OnError = function ()
	{
		return true;
	};        

	Cnds.prototype.OnProgress = function ()
	{
		return true;
	};      
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.Recognize = function (objs)
	{
        if (!objs)
            return;
        
        var inst = objs.getFirstPicked();
        var img = getImage(inst);
        
        this.GetTesseractJob(img, "recognize");
	}; 

    Acts.prototype.Detect = function (objs)
	{
        if (!objs)
            return;
        
        var inst = objs.getFirstPicked();
        var img = getImage(inst);
        
        this.GetTesseractJob(img, "detect");
	}; 
    
	Acts.prototype.AddProperty = function (name, value)
	{       
        this.options[name] = value;
	};
    
	Acts.prototype.SetLanguage = function (lang)
	{       
        this.options["lang"] = lang;
	};    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.Result = function (ret)
	{
        var result = "";
        if (this.result)
        {
            if (this.result.hasOwnProperty("text"))
                result = this.result["text"];        
            else if (this.result.hasOwnProperty("script"))
                result = this.result["script"];                                
        } 
		ret.set_string( result );
	};
    
	Exps.prototype.Error = function (ret)
	{
        var error = (!this.error)? "": this.error;        
		ret.set_string( error );
	};    
    
	Exps.prototype.Status = function (ret)
	{
        var status = (!this.progress)? "": this.progress["status"];        
		ret.set_string( status );
	};	
    
	Exps.prototype.Progress = function (ret)
	{
        var progress = 0;
        if (this.progress)
        {
            if (this.progress.hasOwnProperty("progress"))
                progress = this.progress["progress"];
            else
                progress = 1;
        }
		ret.set_float( progress );
	};	    
    
}());