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
        this.isFirstStart = true;
        
        this.exp_Time = 0;
        this.exp_Event = null;
        this.exp_TrackIndex = 0;
	};
    
	instanceProto.onDestroy = function ()
	{
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
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.ConvertMidi2JSON = function (url_)
	{
	    var self = this;
	    var callback = function (text)
	    {
            var midiData;
	        if (text)  // complete
	        {
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
	        }

	        if (midiData)  // complete
	        {
	            self.midiData = midiData;   
                self.isFirstStart = true;                
                self.runtime.trigger(cr.plugins_.Rex_ToneJS_MidiConvert.prototype.cnds.OnConvertCompleted, self);	
	        }
	        else    // error
	        {
                self.runtime.trigger(cr.plugins_.Rex_ToneJS_MidiConvert.prototype.cnds.OnConvertError, self);	         
	        }    
	    };
	    
        this.doRequest(url_, callback);
	};	

    Acts.prototype.Start = function (time)
	{
        if (!this.midiData)
            return;
        
        var transport = window["Tone"]["Transport"];
        var Part = window["Tone"]["Part"];
        transport["stop"]();
        if (this.isFirstStart)
        {
            transport["set"](this.midiData["transport"]);
            // TODO: recycle
            var i, cnt=this.parts.length;
            for(i=0; i<cnt; i++)
            {
                this.parts[i]["dispose"]();
            }
            this.parts.length = 0;
            
            var tracks = this.midiData["tracks"], notes;
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
                    self.runtime.trigger(cr.plugins_.Rex_ToneJS_MidiConvert.prototype.cnds.OnEvent, self);	
                }
                var midiPart = new Part(callback, notes)["start"]();
                this.parts.push(midiPart);
            }
            
            this.isFirstStart = false;
        }
        
        transport["start"](time);
	};
     
    Acts.prototype.Stop = function (time)
	{ 
        var i, cnt=this.parts.length;
        for(i=0; i<cnt; i++)
        {
            this.parts[i]["stop"](time);
        }      
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