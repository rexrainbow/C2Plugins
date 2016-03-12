// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_animation_loader = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_animation_loader.prototype;
		
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
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.exp_AnimationName = "";
        this.exp_FrameIndex = 0;
        this.exp_URL = "";
	};
	
	behinstProto.tick = function ()
	{
	};
    
	behinstProto.request_url = function (animation_name, frame_index)
	{
        this.exp_AnimationName = animation_name;
        this.exp_FrameIndex = frame_index;
        this.exp_URL = "";
        this.runtime.trigger(cr.behaviors.Rex_animation_loader.prototype.cnds.OnGetURL, this.inst);
        return this.exp_URL;
	};
	
	var event_name_get = function (animation_name, frame_index)
    {
        return animation_name+"-"+frame_index.toString();
    };
    
	behinstProto.load_imagee = function (target_frame, animation_name, frame_index, resize_, loader_task)
	{
	    var task_key = loader_task.key;
        loader_task.addWait( event_name_get(animation_name, frame_index) );

        var url_ = this.request_url(animation_name, frame_index);    
        var thebehavior = this;
        
        // copy from official sprite plugin
		var img = new Image();
		var self = this.inst;
		var curFrame_ = target_frame;
		
		img.onload = function ()
		{
		    if (!loader_task.isCurrentTask(task_key))
		        return;
		        
			// If this action was used on multiple instances, they will each try to create a
			// separate image or texture, which is a waste of memory. So if the same image has
			// already been loaded, ignore this callback.
			if (curFrame_.texture_img.src === img.src)
			{
				// Still may need to switch to using the image's texture in WebGL renderer
				if (self.runtime.glwrap && self.curFrame === curFrame_)
					self.curWebGLTexture = curFrame_.webGL_texture;
				
				// Still may need to update object size
				if (resize_ === 0)		// resize to image size
				{
					self.width = img.width;
					self.height = img.height;
					self.set_bbox_changed();
				}
				
				// Still need to trigger 'On loaded'
				self.runtime.redraw = true;
				self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self);
			
				return;
			}
			
			curFrame_.texture_img = img;
			curFrame_.offx = 0;
			curFrame_.offy = 0;
			curFrame_.width = img.width;
			curFrame_.height = img.height;
			curFrame_.spritesheeted = false;
			curFrame_.datauri = "";
			
			// WebGL renderer: need to create texture (canvas2D just draws with img directly)
			if (self.runtime.glwrap)
			{
				if (curFrame_.webGL_texture)
					self.runtime.glwrap.deleteTexture(curFrame_.webGL_texture);
					
				curFrame_.webGL_texture = self.runtime.glwrap.loadTexture(img, false, self.runtime.linearSampling);
				
				if (self.curFrame === curFrame_)
					self.curWebGLTexture = curFrame_.webGL_texture;
				
				// Need to update other instance's curWebGLTexture
				self.type.updateAllCurrentTexture();
			}
			
			// Set size if necessary
			if (resize_ === 0)		// resize to image size
			{
				self.width = img.width;
				self.height = img.height;
				self.set_bbox_changed();
			}
			
			self.runtime.redraw = true;
			self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self);
            
            
            thebehavior.on_frame_loaded( animation_name, frame_index, url_, true, loader_task ); 
              
		};   // end of img.onload
		
        img.onerror = function ()
        {
		    if (!loader_task.isCurrentTask(task_key))
		        return;
		                    
            thebehavior.on_frame_loaded( animation_name, frame_index, url_, false, loader_task );               
        };
		
		if (url_.substr(0, 5) !== "data:")
			img.crossOrigin = 'anonymous';
		
		img.src = url_;
        // copy from official sprite plugin
        
	};  

	behinstProto.on_frame_loaded = function (animation_name, frame_index, url_, is_success, loader_task)
	{
        this.exp_AnimationName = animation_name;
        this.exp_FrameIndex = frame_index; 
        this.exp_URL = url_;
        
        if ( is_success )
            this.runtime.trigger(cr.behaviors.Rex_animation_loader.prototype.cnds.OnFrameLoaded, this.inst);
        else
            this.runtime.trigger(cr.behaviors.Rex_animation_loader.prototype.cnds.OnFrameLoadedFailed, this.inst);
            
       loader_task.removeWait( event_name_get(animation_name, frame_index) );
       if ( !loader_task.isWaitting() )
        {
            this.runtime.trigger(cr.behaviors.Rex_animation_loader.prototype.cnds.OnAllAnimationLoaded, this.inst);
        }
	};
	  
	//////////////////////////////////////
	// Conditions
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	    
	Cnds.prototype.OnGetURL = function ()
	{  
		return true;
	};

	Cnds.prototype.OnAllAnimationLoaded = function ()
	{  
		return true;
	};    

	Cnds.prototype.OnFrameLoaded = function ()
	{  
		return true;
	};    

	Cnds.prototype.OnFrameLoadedFailed = function ()
	{  
		return true;
	};    	
	    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
    Acts.prototype.SetURL = function (url_)
	{
	    this.exp_URL = url_;
	}; 
    
	Acts.prototype.LoadAllAnimations = function (resize_)
	{
	    var loader_task = loaderTaskGet(this.inst.type.sid.toString());	    
	    loader_task.resetTask();
	    
        var animations=this.inst.type.animations;
        var i, cnti=animations.length;
        var j, cntj, frames, target_frame;
        var animation_name, frame_index;
        for (i=0; i<cnti; i++)
        {
            animation_name = animations[i].name;
            frames = animations[i].frames;
            cntj = frames.length;
            for (j=0; j<cntj; j++)
            {
                frame_index = j;
                target_frame = frames[frame_index];
                this.load_imagee(target_frame, animation_name, frame_index, resize_, loader_task);
            }
        }
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

    Exps.prototype.AnimationName = function (ret)
	{     
	    ret.set_string(this.exp_AnimationName);
	};

    Exps.prototype.FrameIndex = function (ret)
	{     
	    ret.set_int(this.exp_FrameIndex);
	};	

    Exps.prototype.FrameURL = function (ret)
	{     
	    ret.set_string(this.exp_URL);
	};		

    
// ------------------------------------------------------------------------   
// ------------------------------------------------------------------------  
// ------------------------------------------------------------------------  
 
    var LoaderKlass = function ()
    {
        this.key = 0;
        this.wait_events = {};
    };
    
    var LoaderKlassProto = LoaderKlass.prototype;
    
    LoaderKlassProto.resetTask = function ()
	{
        this.key = 0;
        for(var k in this.wait_events)
            delete this.wait_events[k];
	};
	
    LoaderKlassProto.isCurrentTask = function (key)
	{	
        return (this.key === key);
	};	
	    
    LoaderKlassProto.addWait = function (name)
	{
        this.wait_events[name] = true;
	}; 
    
	LoaderKlassProto.removeWait = function (name)
	{
        if (!this.wait_events.hasOwnProperty(name))
            return;
        
        delete this.wait_events[name];
	};  
	
    LoaderKlassProto.isWaitting = function (name)
	{
        var n, isWaitting=false;
        for (n in this.wait_events)
        {
            isWaitting = true;
            break;
        }
        return isWaitting;
	};
	
	var _sid2task = {};
	var loaderTaskGet = function (sid)
	{
	    if (!_sid2task.hasOwnProperty(sid))
	    {
	        _sid2task[sid] = new LoaderKlass;
	    }
	    return _sid2task[sid];
	}; 
		   
}());