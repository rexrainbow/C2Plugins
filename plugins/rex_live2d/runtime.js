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

	instanceProto.onCreate = function()
	{
        if(!this.runtime.glwrap)
            return;
        
        if (!this.recycled)
        {         
    		this.myCanvas = null;
            this.gl = null;
            this.myTex = null;
	        this.model = new window["LAppModel"]();   
        }
      
        this.exp_LoadedFailedFilePaths = "";
        
        this.redrawModel = false;
        
        this.idleMotionName = this.properties[2];
        this.currentMotionName = "";
        this.triggeredMotionName = "";
        this.currentExpression = "";
        
        this.deviceToScreen = null;  // transfer C2 point into live2D point
        this.projMatrix = null;          // keep the ratio of width/height
        this.viewMatrix = null;
        this.dragMgr = new window["L2DTargetPoint"]();
        this.model["breathingEnable"] = (this.properties[3] === 1);
        this.model["setLipSync"](this.properties[4] === 1);
        
        
        // camera
        this.modelScale = 1;
        this.modelShiftX = 0;
        this.modelShiftY = 0;
        
        this.runtime.tickMe(this);
	};
    
    instanceProto.isModelInitialize = function()
    {
        return this.model["isInitialized"]();
    };
    
	instanceProto.getMyTexture = function (glw)
	{
        if (!this.myTex)
            this.myTex = glw.createEmptyTexture(this.width, this.height, this.runtime.linearSampling, this.runtime.isMobile);
        
        return this.myTex;
	}; 
    
	instanceProto.getCanvas = function ()
	{
        if (!this.myCanvas)
        {
		    this.myCanvas = document.createElement('canvas');
            var scale = this.layer.getScale();
		    this.myCanvas.width = this.width * scale;
		    this.myCanvas.height = this.height * scale;            
        }
        
        return this.myCanvas;
	};
    
	instanceProto.getGL = function ()
	{
        if (!this.gl)
        {
            this.gl = getWebGLContext(this.getCanvas());
        }

        return this.gl;
	};  

	instanceProto.getDeviceToScreenMat = function ()
	{    
        if (this.deviceToScreen === null)
        {
            this.deviceToScreen = new window["L2DMatrix44"]();
            this.deviceToScreen["multTranslate"](-this.width / 2.0, -this.height / 2.0);
            this.deviceToScreen["multScale"](2 / this.width, -2 / this.width);
        }
        return this.deviceToScreen;
    };

	instanceProto.getProjMat = function ()
	{    
        if (this.projMatrix === null)
        {
            this.projMatrix = new window["L2DMatrix44"]();
            this.projMatrix["multScale"](1, (this.width / this.height));
        }
        return this.projMatrix;
    };
    
	instanceProto.getViewMat = function ()
	{    
        if (this.viewMatrix === null)
        {
            this.viewMatrix = new window["L2DViewMatrix"]();
            var LAppDefine = window["LAppDefine"];

            var ratio = this.height / this.width;
            var left = LAppDefine["VIEW_LOGICAL_LEFT"];
            var right = LAppDefine["VIEW_LOGICAL_RIGHT"];
            var bottom = -ratio;
            var top = ratio;
            this.viewMatrix["setScreenRect"](left, right, bottom, top);            
        }
        return this.viewMatrix;
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
        if (!this.isModelInitialize())
            return;
        
        if ((this.currentMotionName !== "") && this.model["isMotionFinished"]())
        {
            // current motion had finished
            this.triggeredMotionName = this.currentMotionName;
            this.currentMotionName = "";
            this.runtime.trigger(cr.plugins_.Rex_Live2DObj.prototype.cnds.OnMotionFinished, this);
            this.runtime.trigger(cr.plugins_.Rex_Live2DObj.prototype.cnds.OnAnyMotionFinished, this);          
            this.triggeredMotionName = "";
        }
        
        // no new motion playing, play idle motion if existed            
        if ((this.currentMotionName === "")  && (this.idleMotionName !== ""))
        {
            this.startMotion(this.idleMotionName, window["LAppDefine"]["PRIORITY_IDLE"]);
        }
        
        if (this.dragMgr["enable"])
        {
            this.dragMgr["update"]();
            this.model["setDrag"](this.dragMgr["getX"](), this.dragMgr["getY"]());
        }
        
        var hasUpdate = this.model["hasUpdated"]() || this.dragMgr["enable"];
        if (hasUpdate)
            this.updateModel();
    };        
    
	instanceProto.draw = function(ctx)
	{
		// none
	};   

	instanceProto.drawGL = function(glw)
	{     
        if (!this.isModelInitialize())
            return;
        
        var mytex = this.getMyTexture(glw);
        if (this.redrawModel)
        {                   
            this.drawLive2D();
            var mycanvas = this.getCanvas();
            glw.videoToTexture(mycanvas, mytex, this.runtime.isMobile);
            this.redrawModel = false;            
        }
    
        glw.setTexture(mytex);
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
  
	instanceProto.drawLive2D = function ()
	{
        var gl = this.getGL();
        gl.clear(gl.COLOR_BUFFER_BIT);    
        
        var MatrixStack = window["MatrixStack"];
        MatrixStack["reset"]();
        MatrixStack["loadIdentity"]();     
        
        var projMatrix = this.getProjMat();
        MatrixStack["multMatrix"](projMatrix["getArray"]());
        
        var viewMatrix = this.getViewMat();
        MatrixStack["multMatrix"](viewMatrix["getArray"]());
        
        MatrixStack["push"]();
          
        this.model["update"]();
        this.model["draw"]();   
        
        MatrixStack["pop"]();
    };
    
	instanceProto.updateModel = function ()
	{
        this.redrawModel = true; 
        this.runtime.redraw = true;        
    };

    var getWebGLContext = function(myCanvas)
    {
    	var NAMES = [ "webgl" , "experimental-webgl" , "webkit-3d" , "moz-webgl"];
    	
        var param = {
            "alpha" : true,
            "premultipliedAlpha" : true
        };
        
    	for( var i = 0; i < NAMES.length; i++ ){
    		try{
    			var ctx = myCanvas.getContext( NAMES[i], param );
    			if( ctx ) return ctx;
    		} 
    		catch(e){}
    	}
    	return null;
    };  

	instanceProto.pixelX2ModelX = function (deviceX)
	{
        this.update_bbox(); 
        deviceX -= this.bbox.left;   
        var  deviceToScreenMat = this.getDeviceToScreenMat();
        var screenX = deviceToScreenMat["transformX"](deviceX);

        var viewMatrix = this.getViewMat();
        var viewX = viewMatrix["invertTransformX"](screenX);
        return viewX;
    };    
    
	instanceProto.pixelY2ModelY = function (deviceY)
	{
        this.update_bbox(); 
        deviceY -= this.bbox.top;   
        var  deviceToScreenMat = this.getDeviceToScreenMat();
        var screenY = deviceToScreenMat["transformY"](deviceY);

        var viewMatrix = this.getViewMat();        
        var viewY = viewMatrix["invertTransformY"](screenY);
        return viewY;
    };     
    
	instanceProto.startMotion = function (name_, priority)
	{   
        if (!this.isModelInitialize())
            return;
        
        this.currentMotionName = name_;
        this.model["startRandomMotion"](name_, priority);
        
        var triggeredMotionName_save = this.triggeredMotionName;
        this.triggeredMotionName = name_;
        this.runtime.trigger(cr.plugins_.Rex_Live2DObj.prototype.cnds.OnMotionBegan, this);
        this.runtime.trigger(cr.plugins_.Rex_Live2DObj.prototype.cnds.OnAnyMotionBegan, this); 
        this.triggeredMotionName = triggeredMotionName_save;
            
        this.updateModel();
	};	            
    
	instanceProto.setModelScale = function (newScale)
	{   
        if (!this.isModelInitialize())
            return;    
        
        var s = newScale/this.modelScale;
        var viewMatrix = this.getViewMat();
        viewMatrix["adjustScale"](0, 0, s);
        this.updateModel();        
        this.modelScale = newScale;
	};        
//	instanceProto.setModelShift = function (newShiftX, newShiftY)
//	{   
//        if (!this.isModelInitialize())
//            return;    
//        
//        var dx = newShiftX - this.modelShiftX;
//        var dy = newShiftY - this.modelShiftY;
//        if ((dx === 0) && (dy === 0))
//            return;
//        
//        var viewMatrix = this.getViewMat();
//        viewMatrix["adjustTranslate"](dx, dy);
//        this.updateModel();        
//        this.modelShiftX = newShiftX;
//        this.modelShiftY = newShiftY;
//	};     

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Motion", "value": this.currentMotionName},
				{"name": "Shift X", "value": this.modelShiftX}, 
				{"name": "Shift Y", "value": this.modelShiftY},
				{"name": "Scale", "value": this.modelScale},                
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
		return this.isModelInitialize();
	};     
    
	Cnds.prototype.IsMotionPlaying = function (motionName)
	{
        if (!this.isModelInitialize())
            return false;
        
        return cr.equals_nocase(this.model["getCurrentMotionName"](), motionName);
	};    
    
	Cnds.prototype.OnMotionFinished = function (motionName)
	{
		return cr.equals_nocase(this.triggeredMotionName, motionName);
	};
	
	Cnds.prototype.OnAnyMotionFinished = function ()
	{
		return true;
	};
    
	Cnds.prototype.OnMotionBegan = function (motionName)
	{
		return cr.equals_nocase(this.triggeredMotionName, motionName);
	};
	
	Cnds.prototype.OnAnyMotionBegan = function ()
	{
		return true;
	};	
    
	Cnds.prototype.IsInsideArea = function (deviceX, deviceY, areaName)
	{
        if (!this.isModelInitialize())
            return false;
        
        var viewX = this.pixelX2ModelX(deviceX);
        var viewY = this.pixelY2ModelY(deviceY);
		return this.model["hitTest"](areaName, viewX, viewY);
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.Load = function (url_)
	{   
        var self=this;
        var callback = function (errorPaths)
        {           
            self.exp_LoadedFailedFilePaths = errorPaths;
            if (errorPaths === "")
            {
                self.runtime.trigger(cr.plugins_.Rex_Live2DObj.prototype.cnds.OnModelLoaded, self); 
                self.updateModel();
            }
            else
            {
                self.runtime.trigger(cr.plugins_.Rex_Live2DObj.prototype.cnds.OnModelLoadedFailed, self); 
            }
        };
        var gl = this.getGL();
        this.model["load"](gl, url_, callback);
	};

	Acts.prototype.SetParameterValue = function (name_, value_)
	{   
        if (!this.isModelInitialize())
            return;
        
        var model = this.model["getLive2DModel"]();
        var fn = function()
        {
            model["setParamFloat"](name_, value_);
        }        
        this.model["customParamsCB"].push(fn);
        this.updateModel();
	};	
    
	Acts.prototype.AddToParameterValue = function (name_, value_)
	{   
        if (!this.isModelInitialize())
            return;
        
        var model = this.model["getLive2DModel"]();
        var fn = function()
        {
            model["addToParamFloat"](name_, value_);
        }        
        this.model["customParamsCB"].push(fn);
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
        if (!this.isModelInitialize())
            return;    
        
        this.model["setExpression"](name_);
	};	  
    
	Acts.prototype.SetModelScale = function (scale)
	{   
        this.setModelScale(scale);
	};    
    
	Acts.prototype.SetPartOpacity = function (partIndex, opacity)
	{   
        var model = this.model["getLive2DModel"]();    
        model["setPartsOpacity"](partIndex, opacity);
	};
    
	Acts.prototype.LookAt = function (deviceX, deviceY)
	{   
        var viewX = this.pixelX2ModelX(deviceX);
        var viewY = this.pixelY2ModelY(deviceY);        
        this.dragMgr["setPoint"](viewX, viewY);
	};	  
    
	Acts.prototype.LookFront = function ()
	{
        this.dragMgr["setPoint"](0, 0);
	};	 
    
	Acts.prototype.Breathing = function (e)
	{
        this.model["breathingEnable"] = (e === 1);
	};	 
    
	Acts.prototype.SetLipSync = function (e)
	{
        this.model["setLipSync"](e === 1);
	};    
    
	Acts.prototype.SetLipSyncValue = function (v)
	{
        this.model["setLipSyncValue"](v);
	};        
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.LoadedFailedFilePaths = function (ret)
	{
		ret.set_string(this.exp_LoadedFailedFilePaths);
	};  
    
	Exps.prototype.MotionName = function (ret)
	{
		ret.set_string(this.currentMotionName);
	};
    
	Exps.prototype.TriggeredMotionName = function (ret)
	{
		ret.set_string(this.triggeredMotionName);
	};    
    
    var din = function (d, default_value)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (d == null)
        {
            if (default_value != null)
                o = default_value;
            else
                o = 0;
        }
        else if (typeof(d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
	    return o;
    };    
	Exps.prototype.MotionData = function (ret, key, defaultValue)
	{
        var v;
        if (!this.isModelInitialize())
            v = defaultValue || 0;
        else
        {
            var d = this.model["getCurrentMotion"]()["data"];
            if (key != null)
                d = d[key];
            
            v = din(d, defaultValue);
        }
		ret.set_any(v);
	};       
    
	Exps.prototype.ModelScale = function (ret)
	{
		ret.set_float(this.modelScale);
	};	
}());