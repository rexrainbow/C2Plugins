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

    var IsAPIReady = false;   
	typeProto.onCreate = function()
	{
        if (!window["onYouTubeIframeAPIReady"])
        {
            window["onYouTubeIframeAPIReady"] = function() 
            {
                IsAPIReady = true;                          
            };
	        jsfile_load("https://www.youtube.com/iframe_api");            
            // Function onYouTubeIframeAPIReady() should be defined before loading 
        }
	};
	
	var jsfile_load = function(file_name, callback)
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
            newScriptTag["type"] = "text/javascript";
            newScriptTag["src"] = file_name;
            
            if (typeof callback === "function")
                newScriptTag["onload"] = callback;
            
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
	instanceProto.onCreate = function()
	{
		// Not supported in DC
		if (this.runtime.isDomFree)
		{
			cr.logexport("[Construct 2] Textbox plugin not supported on this platform - the object will not be created");
			return;
		}
    
        // create div element
        this.myElemId = "YT" + this.uid.toString();
		this.elem = document.createElement("div");
		this.elem.id = this.myElemId;	 		
		jQuery(this.elem).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body");
		this.element_hidden = false;
		      
		this.lastLeft = null;
		this.lastTop = null;
		this.lastRight = null;
		this.lastBottom = null;
		this.lastWinWidth = null;
		this.lastWinHeight = null;

		if (this.properties[8] === 0)
		{
			jQuery(this.elem).hide();
			this.visible = false;
			this.element_hidden = true;
		}
        else
            this.visible = true;
					
        if (!this.recycled)
		    this.pendingCallbacks = [];
        else
            this.pendingCallbacks.length = 0;
                
        this.is_player_init = false;		
        this.youtube_player = null;
        this.youtube_state = null;        
        this.cur_videoId = this.properties[0];
        this.cur_isAutoPlay = (this.properties[1] === 1);
        this.cur_isLooping = (this.properties[2] === 1);     
        this.show_controls = (this.properties[3] === 1);
		this.show_info = (this.properties[4] === 1);
		this.modestbranding = (this.properties[5] === 1);        
		this.disablekb = (this.properties[6] === 0);
		this.exp_errorCode = 0;
		this.playinbackground = (this.properties[7] === 1);
        		
        this.isInFullScreen = false;
        this.beforefullwindow = {"x":null, "y":null, "w":null, "h":null};
        
		this.updatePosition(true);  // init position and size        
		this.runtime.tickMe(this);

	   var self = this;		
		this.runtime.addSuspendCallback(function(s)
		{
			self.onSuspend(s);
		});	   
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
		this.updatePosition();	        
        this.on_player_init();		
	};

	instanceProto.updatePosition = function (first)
	{
		if (this.runtime.isDomFree)
			return;
		
		var left = this.layer.layerToCanvas(this.x, this.y, true);
		var top = this.layer.layerToCanvas(this.x, this.y, false);
		var right = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, true);
		var bottom = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, false);
		
		var rightEdge = this.runtime.width / this.runtime.devicePixelRatio;
		var bottomEdge = this.runtime.height / this.runtime.devicePixelRatio;
		
		// Is entirely offscreen or invisible: hide
		if (!this.visible || !this.layer.visible || right <= 0 || bottom <= 0 || left >= rightEdge || top >= bottomEdge)
		{
			if (!this.element_hidden)
				jQuery(this.elem).hide();
				
			this.element_hidden = true;
			return;
		}
		
		// Truncate to canvas size
		//if (left < 0)
		//	left = 0;
		//if (top < 0)
		//	top = 0;
		//if (right > rightEdge)
		//	right = rightEdge;
		//if (bottom > bottomEdge)
		//	bottom = bottomEdge;
		
		var curWinWidth = window.innerWidth;
		var curWinHeight = window.innerHeight;
			
		// Avoid redundant updates
		if (!first && this.lastLeft === left && this.lastTop === top && this.lastRight === right && this.lastBottom === bottom && this.lastWinWidth === curWinWidth && this.lastWinHeight === curWinHeight)
		{
			if (this.element_hidden)
			{
				jQuery(this.elem).show();
				this.element_hidden = false;
			}
			
			return;
		}
			
		this.lastLeft = left;
		this.lastTop = top;
		this.lastRight = right;
		this.lastBottom = bottom;
		this.lastWinWidth = curWinWidth;
		this.lastWinHeight = curWinHeight;
		
		if (this.element_hidden)
		{
			jQuery(this.elem).show();
			this.element_hidden = false;
		}
		
		var offx = Math.round(left) + jQuery(this.runtime.canvas).offset().left;
		var offy = Math.round(top) + jQuery(this.runtime.canvas).offset().top;
		jQuery(this.elem).css("position", "absolute");
		jQuery(this.elem).offset({left: offx, top: offy});
		jQuery(this.elem).width(Math.round(right - left));
		jQuery(this.elem).height(Math.round(bottom - top));
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
        if (this.is_player_init)
            return; 
                    
        if (!IsAPIReady)
            return;
      
                                               
        this.is_player_init = true;       
        this.create_player(this.cur_videoId);        
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
	        //if (event["data"] === self.youtube_state)
	        //    return;
	            
	        self.youtube_state = event["data"];	        
	        	        
	        // do looping
	        if ((self.youtube_state === 0) && self.cur_isLooping)
	        {
	            self.youtube_player["playVideo"]();
	        } 

	        self.runtime.trigger(cr.plugins_.rex_youtube_player.prototype.cnds.OnPlaybackEvent, self);
	    };
	    
	    var onPlayerReady = function (event)
	    {	         
	        self.run_pended_cmds();	        
	        self.runtime.trigger(cr.plugins_.rex_youtube_player.prototype.cnds.OnPlayerReady, self);
	    };

		var onPlayerError = function (event)
		{
			self.exp_errorCode = event["data"];
			self.runtime.trigger(cr.plugins_.rex_youtube_player.prototype.cnds.OnPlayerError, self);
		};	    
          
	    var playerVars = {};
	    if (this.cur_isAutoPlay)
	        playerVars["autoplay"] = 1;
	        
	    if (!this.show_controls)
	        playerVars["controls"] = 0;

		if (!this.show_info)
			playerVars["showinfo"] = 0;

		if (!this.disablekb)
			playerVars["disablekb"] = 1;	


        if (this.modestbranding)
            playerVars["modestbranding"] = 1;
	     
        this.youtube_player = new window["YT"]["Player"](
            this.myElemId, 
            { "videoId": videoId,    
              "playerVars": playerVars,                      
              "events": {"onStateChange": onPlayerStateChange,
                         "onReady": onPlayerReady,
                         "onError": onPlayerError
                        }
            }
        );    
        
        // element DIV had been replaced by IFRAME
        jQuery(this.elem).remove();
        this.elem = document.getElementById(this.myElemId);
        
        // bind mouse events
        this.elem.onmouseover = function (e)
        {
            self.runtime.trigger(cr.plugins_.rex_youtube_player.prototype.cnds.OnMouseOver, self);
        }
	};	
	
    instanceProto.run_pended_cmds = function ()
    {
         var i, cnt=this.pendingCallbacks.length;
         for (i=0; i<cnt; i++)
         {
             this.pendingCallbacks[i]();
         }
         this.pendingCallbacks.length = 0;           
    };

	instanceProto.LoadVideoID = function (videoId, is_autoplay)
	{	    
	    this.cur_videoId = videoId;
	    this.cur_isAutoPlay = is_autoplay;
        
        var self=this;
        var callback = function ()
        {
            self.youtube_player["loadVideoById"](videoId);
            if (is_autoplay)
                self.youtube_player["playVideo"]();
            else
                self.youtube_player["pauseVideo"]();
        };
        
	    if (!this.youtube_player || !this.youtube_player["loadVideoById"])	    
            this.pendingCallbacks.push(callback);  
        else        
            callback();        
	};
	
	instanceProto.SetPlaybackTime = function (s)
	{	    
        var self=this;
        var callback = function ()
        {
            self.youtube_player["seekTo"](s);
        };

	    if (!this.youtube_player || !this.youtube_player["seekTo"])	    
            this.pendingCallbacks.push(callback);  
        else        
            callback();
	};
	
	instanceProto.SetLooping = function (l)
	{
	    this.cur_isLooping = l;
	};
	
	instanceProto.SetMuted = function (m)
	{
        var cmd = (m ===  1)? "mute":"unMute";
        
        var self=this;
        var callback = function ()
        {
            self.youtube_player[cmd]();
        };

	    if (!this.youtube_player || !this.youtube_player[cmd])	    
            this.pendingCallbacks.push(callback);  
        else        
            callback();
	};
	
	instanceProto.SetVolume = function (v)
	{
	    v = cr.clamp(v, 0, 100);        
        var self=this;
        var callback = function ()
        {
            self.youtube_player["setVolume"](v); 
        };

	    if (!this.youtube_player || !this.youtube_player["setVolume"])	    
            this.pendingCallbacks.push(callback);  
        else        
            callback();
	};
	
	instanceProto.Pause = function ()
	{
        var self=this;
        var callback = function ()
        {
            self.youtube_player["pauseVideo"](); 
        };

	    if (!this.youtube_player || !this.youtube_player["pauseVideo"])	    
            this.pendingCallbacks.push(callback);  
        else        
            callback();
	};
	
	instanceProto.Play = function ()
	{
        var self=this;
        var callback = function ()
        {
            self.youtube_player["playVideo"](); 
        };

	    if (!this.youtube_player || !this.youtube_player["playVideo"])	    
            this.pendingCallbacks.push(callback);  
        else        
            callback();
	};
		
	instanceProto.get_playbackTime = function (ret)
	{
	    var t;
		if (!this.youtube_player || !this.youtube_player["getCurrentTime"])
		    t = 0;
		else
		    t = this.youtube_player["getCurrentTime"]() || 0;
		    
		return t;
	};
	
	instanceProto.get_duration = function (ret)
	{
	    var t;	    
		if (!this.youtube_player || !this.youtube_player["getDuration"])
		    t = 0;
		else
		    t = this.youtube_player["getDuration"]() || 0;
			    
		return t;
	};
	
	instanceProto.get_volume = function (ret)
	{
	    var vol;
		if (!this.youtube_player || !this.youtube_player["getVolume"])
		    vol = 100;
		else
		    vol = this.youtube_player["getVolume"]() || 100;
		    
		return vol;
	};
	
	instanceProto.isMuted = function (ret)
	{
	    var isMute;
		if (!this.youtube_player || !this.youtube_player["isMuted"])
		    isMute = false;
		else
		    isMute = this.youtube_player["isMuted"]() || false;
		    
		return isMute;
	};	    

	instanceProto.onSuspend = function (s)
	{
		// ignore suspend/resume events if set to play in background - normally
		// everything is paused in response to a suspend event
		if (this.playinbackground)
			return;
		
		if (s)
			this.Pause()
		else
			this.Play()
	};

	instanceProto.saveToJSON = function ()
	{    
		return { "videoId": this.cur_videoId,
		         "isAutoPlay": this.cur_isAutoPlay,
		         "playBackTime": this.get_playbackTime(),
		         "isLooping": this.cur_isLooping,   
		         "isMute": this.isMuted(),		         
		         "vol": this.get_volume(),
		         "isPlaying": (this.youtube_state === 1),
		         "isPaused": (this.youtube_state === 2),
                 "fw": this.beforefullwindow,
		         };
	};
	
	instanceProto.loadFromJSON = function (o)
	{   
        this.pendingCallbacks.length = 0;
        
        this.LoadVideoID(o["videoId"], o["isAutoPlay"]);
        this.SetPlaybackTime(o["playBackTime"]);
        this.SetLooping(o["isLooping"]);
        this.SetMuted(o["isMute"]);
        this.SetVolume(o["vol"]);
        
        if (o["isPlaying"])
            this.Play();
        if (o["isPaused"])
            this.Pause(); 

        this.beforefullwindow = o["fw"];            
	};    
	//////////////////////////////////////
	// Conditions
    function Cnds() {};
	pluginProto.cnds = new Cnds();  
	
	Cnds.prototype.IsPlaying = function ()  
	{
		if (this.runtime.isDomFree)
			return false;
            
		if (!this.youtube_player || !this.youtube_player["getPlayerState"])
		    return false;
  
	    return (this.youtube_player["getPlayerState"]() === window["YT"]["PlayerState"]["PLAYING"]);
	};
	
	Cnds.prototype.IsPaused = function ()
	{
		if (this.runtime.isDomFree)
			return false;
            
		if (!this.youtube_player || !this.youtube_player["getPlayerState"])
		    return false;
		    	    
	    return (this.youtube_player["getPlayerState"]() === window["YT"]["PlayerState"]["PAUSED"]);
	};
	
	Cnds.prototype.HasEnded = function ()
	{
		if (this.runtime.isDomFree)
			return false;
            
		if (!this.youtube_player || !this.youtube_player["getPlayerState"])
		    return false;
		    	    
	    return (this.youtube_player["getPlayerState"]() === window["YT"]["PlayerState"]["ENDED"]);
	};
	
	Cnds.prototype.IsMuted = function ()
	{
		if (this.runtime.isDomFree)
			return false;
            
		if (!this.youtube_player || !this.youtube_player["getPlayerState"])
		    return false;
		    
		return this.youtube_player["isMuted"]();
	};
	
	Cnds.prototype.OnPlaybackEvent = function (state)
	{
	    var s;
	    switch (this.youtube_state)
	    {
	    case -1:                                                           s=0; break;  //Unstarted
	    case  window["YT"]["PlayerState"]["ENDED"]:       s=1; break;  //Ended
	    case  window["YT"]["PlayerState"]["PLAYING"]:     s=2; break;  //Playing
	    case  window["YT"]["PlayerState"]["PAUSED"]:      s=3; break;  //Paused	
	    case  window["YT"]["PlayerState"]["BUFFERING"]: s=4; break;  //Buffering
	    case  window["YT"]["PlayerState"]["CUED"]:         s=5; break;  //Video cued	    	        
	    }
		return (s === state);
	};

	Cnds.prototype.ComparePlaybackTime = function (cmp, s)
	{
		if (this.runtime.isDomFree)
			return false;
            
		return cr.do_cmp(this.get_playbackTime(), cmp, s);
	};
	
	Cnds.prototype.OnPlayerReady = function ()
	{   
	    return true;
	};	
	
	Cnds.prototype.OnPlayerError = function ()
	{
		return true;
	};	
	
	Cnds.prototype.IsFullScreen = function ()
	{
		return this.isInFullScreen;
	};    
	
	Cnds.prototype.IsFullWindow = function ()
	{
		return (this.beforefullwindow["x"] !== null);
	};       

	Cnds.prototype.OnMouseOver = function ()
	{
		return true;
	};    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.LoadVideoID = function (videoId, is_autoplay)
	{	    
		if (this.runtime.isDomFree)
			return;
            
	    this.LoadVideoID(videoId, (is_autoplay === 1));
	};
	
	Acts.prototype.SetPlaybackTime = function (s)
	{	
		if (this.runtime.isDomFree)
			return;
            
	    this.SetPlaybackTime(s);
	};
	
	Acts.prototype.SetLooping = function (l)
	{
		if (this.runtime.isDomFree)
			return;
            
	    this.SetLooping(l===1);
	};
	
	Acts.prototype.SetMuted = function (m)
	{
		if (this.runtime.isDomFree)
			return;
            
	    this.SetMuted(m === 1);
	};
	
	Acts.prototype.SetVolume = function (vol)
	{
		if (this.runtime.isDomFree)
			return;
            
	    this.SetVolume(vol);   
	};
	
	Acts.prototype.Pause = function ()
	{
		if (this.runtime.isDomFree)
			return;
            
	    this.Pause();
	};
	
	Acts.prototype.Play = function ()
	{
		if (this.runtime.isDomFree)
			return;
            
	    this.Play();
	};
	
	Acts.prototype.SetFullWindow = function (m)
	{   
		if (this.runtime.isDomFree)
			return;

        var is_fullwindow = (this.beforefullwindow["x"] !== null);
        if (m === 2)
        {            
            m = (is_fullwindow)? 0:1
        }
         
        if ( (m === 0) && is_fullwindow ) // exit
        {
	        this.x = this.beforefullwindow["x"];
	        this.y = this.beforefullwindow["y"];
	        this.width = this.beforefullwindow["w"];
	        this.height = this.beforefullwindow["h"];
	        this.updatePosition();   
            
            this.beforefullwindow["x"] = null;
            this.beforefullwindow["y"] = null;
            this.beforefullwindow["w"] = null;
            this.beforefullwindow["h"] = null;
        }
        else if ( (m === 1) && (!is_fullwindow) )  // enter
        {
            this.beforefullwindow["x"] = this.x;
            this.beforefullwindow["y"] = this.y;
            this.beforefullwindow["w"] = this.width;
            this.beforefullwindow["h"] = this.height;
            
	        this.x = this.layer.viewLeft;
	        this.y = this.layer.viewTop;
	        this.width = this.layer.viewRight - this.layer.viewLeft;
	        this.height = this.layer.viewBottom - this.layer.viewTop;
	        this.updatePosition();        
        }
        

	};	
    
	Acts.prototype.SetVisible = function (vis)
	{        
		if (this.runtime.isDomFree)
			return;
		
		this.visible = (vis !== 0);
	};     
	
	Acts.prototype.SetFullScreen = function (m)
	{
		if (this.runtime.isDomFree)
			return;
         
        if (m === 2)
        {
            m = (this.isInFullScreen)? 0:1;
        }
        
        if (m === 0) // exit
        {
            this.isInFullScreen = false;
            if(document["exitFullscreen"])
                document["exitFullscreen"]();
            else if(document["mozCancelFullScreen"])
                document["mozCancelFullScreen"]();
            else if(document["webkitExitFullscreen"])
                document["webkitExitFullscreen"]();                
        }        
        else if (m === 1)  // enter
        {                       
            var requestFullScreen = this.elem["requestFullScreen"] || this.elem["mozRequestFullScreen"] || this.elem["webkitRequestFullScreen"];
            if (requestFullScreen)    
            {            
                requestFullScreen["bind"](this.elem)();
                this.isInFullScreen = true;;
            }
        }

	};   
   
	Acts.prototype.SetFocus = function ()
	{
		if (this.runtime.isDomFree)
			return;
		
		this.elem.focus();
	};   
    
	Acts.prototype.SetBlur = function ()
	{
		if (this.runtime.isDomFree)
			return;
		
		this.elem.blur();
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.PlaybackTime = function (ret)
	{
		if (this.runtime.isDomFree)
		{
			ret.set_float(0);
			return;
		}
        
		ret.set_float( this.get_playbackTime() );
	};
	
	Exps.prototype.Duration = function (ret)
	{
		if (this.runtime.isDomFree)
		{
			ret.set_float(0);
			return;
		}
        
		ret.set_float( this.get_duration() );
	};
	
	Exps.prototype.Volume = function (ret)
	{
		if (this.runtime.isDomFree)
		{
			ret.set_float(0);
			return;
		}
        
		ret.set_float( this.get_volume() );
	};
	
	Exps.prototype.ErrorCode = function (ret)
	{
		if (this.runtime.isDomFree)
		{
			ret.set_float(0);
			return;
		}
        
		ret.set_float(this.exp_errorCode);
	};
	
	Exps.prototype.VideoState = function (ret)
	{
		if (this.runtime.isDomFree)
		{
			ret.set_string("");
			return;
		}
        
        var state = "";
        if (this.youtube_state == null)
        {
            state="Unstarted";
        }
        else
        {
	        switch (this.youtube_state)
	        {    
	        case -1:                                                           state="Unstarted"; break;
	        case  window["YT"]["PlayerState"]["ENDED"]:       state="Ended";     break;
	        case  window["YT"]["PlayerState"]["PLAYING"]:     state="Playing";   break;
	        case  window["YT"]["PlayerState"]["PAUSED"]:      state="Paused";    break;
	        case  window["YT"]["PlayerState"]["BUFFERING"]: state="Buffering"; break;
	        case  window["YT"]["PlayerState"]["CUED"]:         state="Video cued"; break;    
	        }
        }
		ret.set_string(state);
	};

	
}());