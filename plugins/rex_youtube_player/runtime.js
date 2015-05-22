// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.rex_youtube_player = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var manuallyChanged = false;
	/////////////////////////////////////
	var pluginProto = cr.plugins_.rex_youtube_player.prototype;

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
	    jsfile_load("https://www.youtube.com/iframe_api");
	};
	
	var jsfile_load = function(file_name)
	{
	    var scripts=document.getElementsByTagName("script");
	    var exist=false;	    
	    for(var i=0;i<scripts.length;i++)
	    {
	    	if(scripts[i].src.indexOf(file_name) != -1)
	    	{
	    		exist=true;
	    		break;
	    	}
	    }
	    if(!exist)
	    {
	    	var newScriptTag=document.createElement("script");
	    	newScriptTag.setAttribute("type","text/javascript");
	    	newScriptTag.setAttribute("src", file_name);
	    	document.getElementsByTagName("head")[0].appendChild(newScriptTag);
	    }
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};

	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
    var IsAPIReady = false;
	instanceProto.onCreate = function()
	{
	    var elemId = this.uid.toString();	    
		this.elem = document.createElement("div");
		this.elem.id = elemId;
		this.elem.setAttribute("id", elemId);	
		
		jQuery(this.elem).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body");
		if (this.properties[2] === 0)		// initially invisible
		{
			jQuery(this.elem).hide();
			this.visible = false;
			//this.element_hidden = true;
		}
					

		this.updatePosition();

		this.runtime.tickMe(this);

        this.is_player_init = false;		
        this.youtube_player = null;
        this.init_videoId = this.properties[0];
        this.youtube_state = -1;
        this.is_autoplay = this.properties[1];
        //this.show_controls = this.properties[2];
        
        
        // init
        if (!window["onYouTubeIframeAPIReady"])
        {
            window["onYouTubeIframeAPIReady"] = function() 
            {            
                IsAPIReady = true;                 
            };
        }
        // init        
	};       

	instanceProto.onDestroy = function ()
	{
		if (this.youtube_player != null)
		    this.youtube_player["destroy"]();

		jQuery(this.elem).remove();
		this.elem = null;
	};

	instanceProto.tick = function ()
	{
        this.on_player_init();
		this.updatePosition();
	};

	instanceProto.updatePosition = function ()
	{
		var left = this.layer.layerToCanvas(this.x, this.y, true);
		var top = this.layer.layerToCanvas(this.x, this.y, false);
		var right = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, true);
		var bottom = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, false);

		// Is entirely offscreen or invisible: hide
		if (!this.visible || !this.layer.visible || right <= 0 || bottom <= 0 || left >= this.runtime.width || top >= this.runtime.height)
		{
			jQuery(this.elem).hide();
			return;
		}

		// Truncate to canvas size
		if (left < 1)
			left = 1;
		if (top < 1)
			top = 1;
		if (right >= this.runtime.width)
			right = this.runtime.width - 1;
		if (bottom >= this.runtime.height)
			bottom = this.runtime.height - 1;

		jQuery(this.elem).show();
		
		var offx = Math.round(left) + jQuery(this.runtime.canvas).offset().left;
		var offy = Math.round(top) + jQuery(this.runtime.canvas).offset().top;
		jQuery(this.elem).css("position", "absolute");
		jQuery(this.elem).offset({left: offx, top: offy});
		jQuery(this.elem).width(Math.round(right - left));
		jQuery(this.elem).height(Math.round(bottom - top));		
		//	
	};

	// only called if a layout object
	instanceProto.draw = function(ctx)
	{
	};

	instanceProto.drawGL = function(glw)
	{
	};
    
    instanceProto.on_player_init = function ()
    {
        if (!IsAPIReady)
            return;
            
        if (this.is_player_init)
            return;                                    
        this.is_player_init = true;
        
        if (this.init_videoId === "")
            return;
                
        this.create_player(this.init_videoId);        
    };    
	
	instanceProto.create_player = function (videoId)
	{
	    if (!this.is_player_init)
	        return;
	        
        if (this.youtube_player != null)
            return;
	        
	    var self = this;
	    var onPlayerStateChange = function (event)
	    {
	        if (event["data"] === self.youtube_state)
	            return;
	            	        
	        self.youtube_state = event["data"];
	        self.runtime.trigger(cr.plugins_.rex_youtube_player.prototype.cnds.OnPlaybackEvent, self);
	    };
	    
	    var onPlayerReady = function (event)
	    {
	        if (self.is_autoplay)
	            self.youtube_player["playVideo"]();
	    };
	
	    var playerVars = {};
        this.youtube_player = new window["YT"]["Player"](
            this.elem.id, 
            { "height": this.elem.height,
              "width":  this.elem.width,
              "videoId": videoId,    
              "playerVars": playerVars,                      
              "events": {"onStateChange": onPlayerStateChange,
                         "onReady": onPlayerReady,
                        }
            }
        );
	};	
	

	//////////////////////////////////////
	// Conditions
    function Cnds() {};
	pluginProto.cnds = new Cnds();     

	Cnds.prototype.IsPlaying = function ()
	{
		if (this.youtube_player == null)
		    return false;
		    	    
	    return (this.youtube_player["getPlayerState"]() === window["YT"]["PlayerState"]["PLAYING"]);
	};
	
	Cnds.prototype.IsPaused = function ()
	{
		if (this.youtube_player == null)
		    return false;
		    	    
	    return (this.youtube_player["getPlayerState"]() === window["YT"]["PlayerState"]["PAUSED"]);
	};
	
	Cnds.prototype.HasEnded = function ()
	{
		if (this.youtube_player == null)
		    return false;
		    	    
	    return (this.youtube_player["getPlayerState"]() === window["YT"]["PlayerState"]["ENDED"]);
	};
	
	Cnds.prototype.IsMuted = function ()
	{
		if (this.youtube_player == null)
		    return false;
		    
		return this.youtube_player["isMuted"]();
	};
	
	Cnds.prototype.OnPlaybackEvent = function (state)
	{
	    var s;
	    switch (this.youtube_state)
	    {
	    case -1:  s=0; break;  //Unstarted
	    case  0:  s=1; break;  //Ended
	    case  1:  s=2; break;  //Playing
	    case  2:  s=3; break;  //Paused	
	    case  3:  s=4; break;  //Buffering
	    case  5:  s=5; break;  //Video cued	    	        
	    }
		return (s === state);
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.LoadVideoID = function (videoId, is_autoplay)
	{	   
	    this.is_autoplay = is_autoplay;
	    
	    if (!this.is_player_init)
	        this.init_videoId = videoId;
	    else if (this.youtube_player == null)
		    this.create_player(videoId);
		else
		    this.youtube_player["loadVideoById"](videoId);
	};
	
	Acts.prototype.SetPlaybackTime = function (s)
	{
		if (this.youtube_player == null)
		    return;
		
		this.youtube_player["seekTo"](s);
	};
	
	Acts.prototype.SetLooping = function (l)
	{
		if (this.youtube_player == null)
		    return;
		    	    
	    this.youtube_player["setLoop"](l===1);
	};
	
	Acts.prototype.SetMuted = function (m)
	{
		if (this.youtube_player == null)
		    return;
		    	    
	    if (m === 0)
	        this.youtube_player["unMute"]();
	    else
	        this.youtube_player["mute"]();
	};
	
	Acts.prototype.SetVolume = function (v)
	{
		if (this.youtube_player == null)
		    return;
		    
		this.youtube_player["setVolume"]( cr.clamp(v, 0, 100) );    
	};
	
	Acts.prototype.Pause = function ()
	{
		if (this.youtube_player == null)
		    return;
		
		this.youtube_player["pauseVideo"]();
	};
	
	Acts.prototype.Play = function ()
	{
	    if (this.youtube_player == null)
		    return;
		
		this.youtube_player["playVideo"]();
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.PlaybackTime = function (ret)
	{
		if (this.youtube_player == null)
		    t = 0;
		else
		    t = this.youtube_player["getCurrentTime"]();
			    
		ret.set_float( t );
	};
	
	Exps.prototype.Duration = function (ret)
	{
		if (this.youtube_player == null)
		    t = 0;
		else
		    t = this.youtube_player["getDuration"]();
			    
		ret.set_float( t );
	};
	
	Exps.prototype.Volume = function (ret)
	{
	    var v;
		if (this.youtube_player == null)
		    v = 0;
		else
		    v = this.youtube_player["getVolume"]();
		ret.set_float( v );
	};
}());