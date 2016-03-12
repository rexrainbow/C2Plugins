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
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());