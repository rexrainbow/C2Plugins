// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Live2DObj = function(runtime)
{
	this.runtime = runtime;
    window["Live2D"]["init"]();
    var cfg = {
        "isWindowsPhone8": this.runtime.isWindowsPhone8,
    }
    var pm = new window["PlatformManager"](cfg);
    window["Live2DFramework"]["setPlatformManager"](pm);
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Live2DObj.prototype;
		
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

    var STATE_NONE = 0;
    var STATE_LOADING = 1;
    var STATE_BUILD = 2;
    var STATE_IDLE = 3;
    var STATE_PLAY = 4;
	instanceProto.onCreate = function()
	{
        if(!this.runtime.glwrap)
            return;
        
        if (!this.recycled)
        {         
    		this.canvas = null;
            this.gl = null;
            this.tempTexture = null;
	        this.model = new window["LAppModel"]();   
        }
      
        this.state = STATE_NONE;
        this.redrawModel = false;
        
        this.idleMotionName = this.properties[2];
        this.currentMotionName = "";
        this.previousMotionName = "";
        this.currentExpression = "";
        
        this.runtime.tickMe(this);
	};
    
    instanceProto.isReady = function()
    {
        return this.model["isInitialized"]();
    };
    
	instanceProto.getTempTexture = function (glw)
	{
        if (!this.tempTexture)
            this.tempTexture = glw.createEmptyTexture(this.width, this.height, this.runtime.linearSampling);
        
        return this.tempTexture;
	}; 
    
	instanceProto.getCanvas = function ()
	{
        if (!this.canvas)
        {
		    this.canvas = document.createElement('canvas');
		    this.canvas.width = this.width;
		    this.canvas.height = this.height;            
        }
        
        return this.canvas;
	};
    
	instanceProto.getGL = function ()
	{
        if (!this.gl)
        {
            this.gl = getWebGLContext(this.getCanvas());
        }

        return this.gl;
	};    

	instanceProto.freeModel = function ()
	{        
        this.model["release"]();
	}; 
    
	instanceProto.onDestroy = function ()
	{
        this.freeModel();              
	};   
    
    instanceProto.tick = function()
    {      
        if (!this.isReady())
            return;
        
        if (this.model["isMotionFinished"]())
        {
            // current motion had finished
            this.previousMotionName = this.currentMotionName;
            this.currentMotionName = "";
            this.runtime.trigger(cr.plugins_.Rex_Live2DObj.prototype.cnds.OnMotionFinished, this);
            this.runtime.trigger(cr.plugins_.Rex_Live2DObj.prototype.cnds.OnAnyMotionFinished, this);          
        }
        
        // no new motion playing, play idle motion if existed            
        if ((this.currentMotionName === "")  && (this.idleMotionName !== ""))
        {
            this.startMotion(this.idleMotionName, window["LAppDefine"]["PRIORITY_IDLE"]);
        }
        
        if (this.model["hasUpdated"]())
            this.updateModel();
    };        
    
	instanceProto.draw = function(ctx)
	{
		// none
	};   

	instanceProto.drawGL = function(glw)
	{     
        if (!this.isReady())
            return;
        
        var tempTexture = this.getTempTexture(glw);
        if (this.redrawModel)
        {
            var gl = this.getGL();
            gl.clear(gl.COLOR_BUFFER_BIT);
            this.model["update"]();
            this.model["draw"]();
            
            var canvas = this.getCanvas();        
            this.runtime.glwrap.videoToTexture(canvas, tempTexture);
            this.redrawModel = false;            
        }
    
        glw.setTexture(tempTexture);
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
  
	instanceProto.updateModel = function ()
	{
        this.redrawModel = true; 
        this.runtime.redraw = true;        
    };

    var getWebGLContext = function(canvas)
    {
    	var NAMES = [ "webgl" , "experimental-webgl" , "webkit-3d" , "moz-webgl"];
    	
        var param = {
            "alpha" : true,
            "premultipliedAlpha" : true
        };
        
    	for( var i = 0; i < NAMES.length; i++ ){
    		try{
    			var ctx = canvas.getContext( NAMES[i], param );
    			if( ctx ) return ctx;
    		} 
    		catch(e){}
    	}
    	return null;
    };    
    
	instanceProto.startMotion = function (name_, priority)
	{   
        if (!this.isReady())
            return;
        
        this.currentMotionName = name_;
        this.model["startRandomMotion"](name_, priority);
        this.updateModel();
	};	            

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Motion", "value": this.currentMotionName},
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
	Cnds.prototype.OnModelLoaded = function ()
	{  
		return true;
	};    

	Cnds.prototype.OnModelLoadedFailed = function ()
	{  
		return true;
	};   

	Cnds.prototype.IsModelReady = function ()
	{  
		return this.isReady();
	};     
    
	Cnds.prototype.IsMotionPlaying = function (motionName)
	{
        if (!this.isReady())
            return false;
        
        return cr.equals_nocase(this.model["getCurrentMotionName"](), motionName);
	};    
    
	Cnds.prototype.OnMotionFinished = function (motionName)
	{
		return cr.equals_nocase(this.previousMotionName, motionName);
	};
	
	Cnds.prototype.OnAnyMotionFinished = function ()
	{
		return true;
	};
	
	Cnds.prototype.IsInsideArea = function (x, y, areaName)
	{
        if (!this.isReady())
            return false;
        
        this.update_bbox(); 
        x -= this.bbox.left;
        y -= this.bbox.top;
		return this.model["hitTest"](areaName, x, y);
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.Load = function (url_)
	{   
        debugger
        var self=this;
        var callback = function ()
        {           
            self.runtime.trigger(cr.plugins_.Rex_Live2DObj.prototype.cnds.OnModelLoaded, self); 
            self.updateModel();
        };
        var gl = this.getGL();
        this.model["load"](gl, url_, callback);
	};

	Acts.prototype.SetParameterValue = function (name_, value_)
	{   
        if (!this.isReady())
            return;
        
        // TODO
        //this.live2DModel["setParamFloat"](name_, value_);
        this.updateModel();
	};	
    
	Acts.prototype.StartMotion = function (name_)
	{   
        this.startMotion(name_, window["LAppDefine"]["PRIORITY_FORCE"]);
	};	 

	Acts.prototype.SetIdleMotion = function (name_)
	{   
        this.idleMotionName = name_;
	};	    
    
	Acts.prototype.SetExpression = function (name_)
	{   
        this.model["setExpression"](name_);
	};	     
    
	Acts.prototype.SetRandomExpression = function (name_)
	{   
        this.model["setRandomExpression"]();
	};	       
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.MotionName = function (ret)
	{
		ret.set_string(this.model["getCurrentMotionName"]());
	};
	
}());