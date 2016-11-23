// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_MidiConvert = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_MidiConvert.prototype;
		
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
        this.midiData = null;
        this.parts = [];
        this.isPlaying = false;
        this.isInitiated = false;
        this.isPlayed = false;    // elapsedTime
        this.endTime = null;
        this.isPaused = false;
        this.startAt = null;
        this.elapsedTime = 0;
        
        this.exp_Time = 0;
        this.exp_Event = null;
        this.exp_TrackIndex = 0;
        
        this.exp_CurTrackIndex = -1;
        this.exp_CurEventIndex = -1;
        this.exp_CurEvent = null;
        
        if (this.properties[0] === 1)
        {
            this.my_timescale = -1.0;
            this.runtime.tick2Me(this);
        }
	};
    
	instanceProto.onDestroy = function ()
	{
        this.invokeAllParts("stop");
        this.invokeAllParts("removeAll");
        partCache.freeAllLines( this.parts ); 
	}; 
    
	
    instanceProto.tick2 = function()
    {
        if (this.parts.length === 0)
            return;
        
        var ts = this.my_timescale;
        if (ts == -1)
            ts = this.runtime.timescale;
        
        this.SetPlaybackRate(ts);
    };    

        
	instanceProto.invokeAllParts = function (fnName, params)
	{
        var i, cnt=this.parts.length, midiPart
        for(i=0; i<cnt; i++)
        {
            midiPart = this.parts[i];
            if (params == null)
                midiPart[fnName]();
            else
                midiPart[fnName].apply(midiPart, params);
        }        
	};  
    
	instanceProto.doRequest = function ( url_, callback )
	{
	    var oReq;
	    
		// Windows Phone 8 can't AJAX local files using the standards-based API, but
		// can if we use the old-school ActiveXObject. So use ActiveX on WP8 only.
		if (this.runtime.isWindowsPhone8)
			oReq = new ActiveXObject("Microsoft.XMLHTTP");
		else
			oReq = new XMLHttpRequest();
			
        oReq.open("GET", url_, true);
        oReq.overrideMimeType("text/plain; charset=x-user-defined");
        //oReq.responseType = "arraybuffer";
        
        oReq.onload = function (oEvent) 
        {
            callback(oReq.responseText);
        };
        
        oReq.send(null);
	};    
    
	var blob2json = function ( text )
	{
        if (text == null)
            return null;
        
        var midiData;
        var ff = new Array(text.length);
        for (var i = 0; i < text.length; i++) 
        {
            ff[i] = String.fromCharCode(text.charCodeAt(i) & 255);
        }    
        
        try
        {                
	        midiData = window["MidiConvert"]["parse"](ff.join(""));
        }
	    catch(e) 
        { 
            midiData = null;
        } 
        return midiData;
	};   
    

// ---------
// object pool class
// ---------
    var ObjCacheKlass = function ()
    {        
        this.lines = [];       
    };
    var ObjCacheKlassProto = ObjCacheKlass.prototype;   
    
	ObjCacheKlassProto.allocLine = function()
	{
		return (this.lines.length > 0)? this.lines.pop(): null;
	};    
	ObjCacheKlassProto.freeLine = function (l)
	{
		this.lines.push(l);
	};	
	ObjCacheKlassProto.freeAllLines= function (arr)
	{
		var i, len;
		for (i = 0, len = arr.length; i < len; i++)
			this.freeLine(arr[i]);
		arr.length = 0;
	};
    
    var partCache = new ObjCacheKlass();
// ---------
// object pool class
// ---------

    
    instanceProto.InitParts = function (midiData)
	{
        if (!midiData || this.isInitiated)
            return;
        
        this.invokeAllParts("removeAll");
        partCache.freeAllLines( this.parts );
        
        window["Tone"]["Transport"]["set"](midiData["transport"]);        
        var tracks = midiData["tracks"], notes;
        var i, cnt=tracks.length;
        var self=this;
        for (i=0; i<cnt; i++)
        {
            notes = tracks[i]["notes"];
            if (!notes)
                continue;
            
            var callback = function(time, event)
            {
                self.exp_TrackIndex = i;
                self.exp_Time = time;
                self.exp_Event = event;
                
                if (!self.isPlaying)
                {
                    self.isPlaying = true;            
                    self.startAt = time;                    
                    self.runtime.trigger(cr.plugins_.Rex_ToneJS_MidiConvert.prototype.cnds.OnStarted, self);	                        
                }
                
                if (event["note"] != null)          
                    self.runtime.trigger(cr.plugins_.Rex_ToneJS_MidiConvert.prototype.cnds.OnEvent, self);                        
                else if (event["end"])
                {
                    self.invokeAllParts("stop");                    
                    self.isPlaying = false;   
                    self.isPlayed = true;                    
                    self.runtime.trigger(cr.plugins_.Rex_ToneJS_MidiConvert.prototype.cnds.OnEnded, self);
                }
            }
            
            var midiPart = partCache.allocLine() || new window["Tone"]["Part"]();
            midiPart["callback"] = callback;
            
            var j, jcnt=notes.length;
            for (j=0; j<jcnt; j++)
            {
                midiPart["add"](notes[j]);
            }
          
            this.parts.push(midiPart);           
        }
        
        var midiPart = this.parts[0];
        if (midiPart)
        {
            midiPart["add"]({"time":0, "start":true});
            midiPart["add"]({"time":this.getEndTime(midiData), "end":true});
        }     

        this.isInitiated = true;        
	}; 

    instanceProto.Start = function (time)
	{
        if (!this.midiData)
            return;
        
        //log("act: Start");  
        
        this.invokeAllParts("stop");
        this.InitParts(this.midiData);

        this.invokeAllParts("start", [time]);
	};
     
    instanceProto.Stop = function (time)
	{ 
        //log("act: Stop");     
        this.invokeAllParts("stop", [time]);
	};     
     
    instanceProto.Pause = function (time)
	{ 
        if (!this.isPlaying)
            return;
         
        this.elapsedTime = this.getElapsedTime() + ((time)? parseFloat(time):0);
        //og("act: Pause, offset=" + this.elapsedTime);           
        this.invokeAllParts("stop", [time]);
	};     
     
    instanceProto.Resume = function (time)
	{ 
        if (!this.isPlaying)
            return;
        
        //log("act: Resume, offset=" + this.elapsedTime);      
        this.invokeAllParts("start", [time, this.elapsedTime]);
	};    
    
    instanceProto.SetPlaybackRate = function(rate)
    {
        var state = this.parts[0]["state"];    
        //log(state)        
        if (rate == 0)
        {
            if (state === "started")
            {
                this.Pause();
            }
        }
        else
        {
            if (this.isPaused)
                return;
            
            if (state === "stopped")
            {
                this.Resume();     
            }
            
            var playbackRate = this.parts[0]["playbackRate"];   
            if (rate != playbackRate)
            {
                this.invokeAllParts("set", ["playbackRate", rate]);   
            }
        }
    };        
   
    instanceProto.getEndTime = function(midiData)    
    {
        if (this.endTime !== null)
            return this.endTime;
        
        this.endTime = 0;
        if (!midiData)
            return this.endTime;
        
        var tracks = midiData["tracks"], notes;
        var i, cnt=tracks.length;
        for (i=0; i<cnt; i++)
        {
            notes = tracks[i]["notes"];
            if (!notes)
                continue;
            
            var j, jcnt=notes.length;
            var note, endTime;            
            for(j=0; j<jcnt; j++)
            {
                note = notes[j];
                endTime = note["time"] + note["duration"];
                this.endTime = Math.max(endTime, this.endTime);                    
            }
        }
        
        return this.endTime;
    };
    
    instanceProto.getElapsedTime = function ()
	{ 
        var elapsedTime;
        if (this.isPlaying)
        {
            if (!this.isPaused)
                elapsedTime = window["Tone"]["Transport"]["seconds"] - this.startAt;
            else  // Paused
                elapsedTime = this.elapsedTime;
        }
        else if (this.isPlayed)
            elapsedTime = this.getEndTime(this.midiData);
        else
            elapsedTime = 0;
        
        return elapsedTime;
	};   
    
	instanceProto.getProgress = function ()
	{
        return this.getElapsedTime()/this.getEndTime(this.midiData);
	}    
    
    instanceProto.getState = function()    
    {
        var state;
        if (!this.midiData)
            state = "None";
        else if (this.isPlaying)
        {
            if (!this.isPaused)
                state = "Play";
            else
                state = "Pause";
        }
        else
            state = "Idle";
        return state.toUpperCase();
    };
    
   
    
    /**BEGIN-PREVIEWONLY**/

    instanceProto.getDebuggerValues = function (propsections)
    {
        propsections.push({
            "title": "Midi convert",
            "properties": [ 
                {"name":"State", "value": this.getState(), "readonly":true },
                {"name":"Elapsed time", "value": Math.floor(this.getElapsedTime()*100)/100, "readonly":true },
                {"name":"Progress", "value": Math.floor(this.getProgress()*100)/100, "readonly":true },                
            ]
        });
    };
    
    /**END-PREVIEWONLY**/      

    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnConvertCompleted = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnConvertError = function ()
	{
	    return true;
	};

	Cnds.prototype.OnEvent = function ()
	{
        return true;  
	};	 

	Cnds.prototype.OnEnded = function ()
	{
        return true;  
	};	 

	Cnds.prototype.OnStarted = function ()
	{
        return true;  
	};	     
    
	Cnds.prototype.IsPlaying = function ()
	{
        return this.isPlaying; 
	};
        
	Cnds.prototype.CompareTrackID = function (cmp, s)
	{
        if (!this.exp_note)
            return false;
            
		return cr.do_cmp(this.exp_TrackIndex, cmp, s);
	};
    
	Cnds.prototype.ForEachTrack = function ()
	{
        if (this.midiData == null)
            return false;
        
        var tracks = this.midiData["tracks"];
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();

        var i, cnt=tracks.length;        
		for(i=0; i<cnt; i++)
	    {
		    if (solModifierAfterCnds)
                this.runtime.pushCopySol(current_event.solModifiers);
            
            this.exp_CurTrackIndex = i;
		    current_event.retrigger();
		    	
            if (solModifierAfterCnds)
		        this.runtime.popSol(current_event.solModifiers);
		}        

        this.exp_CurTrackIndex = -1;        
		return false;   
	};    
    
	Cnds.prototype.ForEachNote = function (trackIndex)
	{
        if (this.midiData == null)
            return false;
        
        var notes = this.midiData["tracks"][trackIndex];
        if (notes == null)
            return false;
        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();

        var i, cnt=notes.length;        
		for(i=0; i<cnt; i++)
	    {
		    if (solModifierAfterCnds)
                this.runtime.pushCopySol(current_event.solModifiers);
            
            this.exp_CurEventIndex = i;
            this.exp_CurEvent = notes[i];
		    current_event.retrigger();
		    	
            if (solModifierAfterCnds)
		        this.runtime.popSol(current_event.solModifiers);
		}        

        this.exp_CurEventIndex = -1;
        this.exp_CurEvent = null;        
		return false;   
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.ConvertMidi2JSON = function (url_)
	{
	    var self = this;
	    var callback = function (text)
	    {
            var midiData= blob2json(text);
	        if (midiData)  // complete
	        {
	            self.midiData = midiData; 
                self.isInitiated = false;   
                self.isPlayed = false;                
                self.startAt = null;
                self.endTime = null;
                self.runtime.trigger(cr.plugins_.Rex_ToneJS_MidiConvert.prototype.cnds.OnConvertCompleted, self);	
	        }
	        else    // error
	        {
                self.runtime.trigger(cr.plugins_.Rex_ToneJS_MidiConvert.prototype.cnds.OnConvertError, self);	         
	        }    
	    };
	    
        this.doRequest(url_, callback);
	};	

	Acts.prototype.SetValue = function (keys, value)
	{
        this.invokeAllParts("set", [keys, value]);
	};
     
	Acts.prototype.SetJSON = function (keys, value)
	{
        this.invokeAllParts("set", [keys, JSON.parse(value)]);
	};    
     
	Acts.prototype.SetBoolean = function (keys, value)
	{
        this.invokeAllParts("set", [keys, (value === 1)]);     
	};     
    
	Acts.prototype.SetJSONProps = function (params)
	{
        this.invokeAllParts("set", [JSON.parse(params)]);
	};  
    
    Acts.prototype.Start = function (time)
	{
        this.isPaused = false;
        this.Start(time);
	};
     
    Acts.prototype.Stop = function (time)
	{ 
        if (!this.isPlaying)
            return;
        
        this.Stop(time);       
        this.isPaused = false;     
        this.isPlaying = false;        
        this.runtime.trigger(cr.plugins_.Rex_ToneJS_MidiConvert.prototype.cnds.OnEnded, this);
	};     
     
    Acts.prototype.Pause = function (time)
	{ 
        if (!this.isPlaying)
            return;
        
        this.Pause(time);
        this.isPaused = true;            
	};     
     
    Acts.prototype.Resume = function (time)
	{ 
        if (!this.isPlaying)
            return;
  
        this.Resume(time);
        this.isPaused = false;           
	};
     
    Acts.prototype.SetPlaybackRate = function (rate)
	{ 
        this.SetPlaybackRate(rate);
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Midi2JSON = function (ret)
	{
	    var json_ = this.midiData || {};
		ret.set_string(JSON.stringify( json_ ));
	}; 	   

	Exps.prototype.EndTime = function (ret)
	{
	    ret.set_float(this.getEndTime(this.midiData));
	};        

	Exps.prototype.ElapsedTime = function (ret)
	{
	    ret.set_float(this.getElapsedTime());
	}; 

	Exps.prototype.Progress = function (ret)
	{
	    ret.set_float(this.getProgress());
	}; 

	Exps.prototype.State = function (ret)
	{
	    ret.set_string(this.getState());
	};     
    
	Exps.prototype.Time = function (ret)
	{       
		ret.set_any(this.exp_Time || 0);
	};     

	Exps.prototype.Note = function (ret)
	{
		ret.set_string(window.ToneJSGetItemValue(this.exp_Event, "note", ""));
	};

	Exps.prototype.Duration = function (ret)
	{       
		ret.set_any(window.ToneJSGetItemValue(this.exp_Event, "duration", 0));
	};

	Exps.prototype.Velocity = function (ret)
	{
		ret.set_float(window.ToneJSGetItemValue(this.exp_Event, "velocity", 0));
	};

	Exps.prototype.Ticks = function (ret)
	{
		ret.set_int(window.ToneJSGetItemValue(this.exp_Event, "ticks", 0));
	};

	Exps.prototype.Midi = function (ret)
	{
		ret.set_float(window.ToneJSGetItemValue(this.exp_Event, "midi", 0));
	};    
    
	Exps.prototype.TrackIndex = function (ret)
	{       
		ret.set_any(this.exp_TrackIndex);
	};
    
}());