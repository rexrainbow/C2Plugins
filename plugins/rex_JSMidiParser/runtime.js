// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_JSMIDIparser = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_JSMIDIparser.prototype;
		
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
	    jsfile_load("JSMIDIparser.js");
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

	instanceProto.onCreate = function()
	{
	    this.beat_period = this.properties[0];
	    this.timeline = null;
	    this.midi_json = null;
	    this.player = new cr.plugins_.Rex_JSMIDIparser.PlayerKlass(this);
	    	    
	    this.exp_note = null;
	    this.exp_Tick = 0;
        this.exp_TrackID = 0;
	};
    
	instanceProto.onDestroy = function ()
	{
	}; 

    instanceProto._timeline_get = function ()
    {
        if (this.timeline != null)
            return this.timeline;
    
        assert2(cr.plugins_.Rex_TimeLine, "Scenario: Can not find timeline oject.");
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Rex_TimeLine.prototype.Instance)
            {
                this.timeline = inst;
                return this.timeline;
            }
        }
        assert2(this.timeline, "Scenario: Can not find timeline oject.");
        return null;	
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
        oReq.responseType = "arraybuffer";
        
        oReq.onload = function (oEvent) 
        {
            callback(oReq.response);
        };
        
        oReq.send(null);
	};
	
    instanceProto.ConvertMidi2JSON = function (url_)
	{
	    var self = this;
	    var callback = function (arrayBuffer)
	    {
	        var midi_json;
	        if (arrayBuffer)  // complete
	        {
	            midi_json = window["JSMIDIParser"]["parse"](new Uint8Array(arrayBuffer));
	        }
	        
	        if (midi_json)  // complete
	        {
	            self.midi_json = midi_json;
                self.player.Load(midi_json);    // load to player     
                self.runtime.trigger(cr.plugins_.Rex_JSMIDIparser.prototype.cnds.OnConvertCompleted, self);	
	        }
	        else    // error
	        {
                self.runtime.trigger(cr.plugins_.Rex_JSMIDIparser.prototype.cnds.OnConvertError, self);		            
	        }    
	    };
	    
        this.doRequest(url_, callback); 
	};	

    
    instanceProto.PlayNote = function (note, is_on, ID)
    {
        this.exp_note = note;
        this.exp_Tick = (is_on)? note["start"] : note["end"];
        this.exp_TrackID = ID;
        var trig = (is_on)? cr.plugins_.Rex_JSMIDIparser.prototype.cnds.OnNoteOn:
                            cr.plugins_.Rex_JSMIDIparser.prototype.cnds.OnNoteOff;
                            
        this.runtime.trigger(trig, this);        
    };        
    
	instanceProto.OnPlayingEnded = function ()
	{
        this.runtime.trigger(cr.plugins_.Rex_JSMIDIparser.prototype.cnds.OnEnded, this); 
	}; 
    
	instanceProto.saveToJSON = function ()
	{
		return { "res": this.midi_json,
		        };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.midi_json = o["res"];
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

	Cnds.prototype.IsPlaying = function ()
	{
	    return this.player.IsPlaying;
	};
    
	Cnds.prototype.OnNoteOn = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnNoteOff = function ()
	{
	    return true;
	}; 	
    
	Cnds.prototype.CompareChannel = function (cmp, s)
	{
        if (!this.exp_note)
            return false;
            
		return cr.do_cmp(this.exp_note["channel"], cmp, s);
	}; 

	Cnds.prototype.CompareTrackID = function (cmp, s)
	{
        if (!this.exp_note)
            return false;
            
		return cr.do_cmp(this.exp_TrackID, cmp, s);
	};

	Cnds.prototype.OnEnded = function ()
	{
	    return true;
	}; 	
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.ConvertMidi2JSON = function (url_)
	{
	    this.ConvertMidi2JSON(url_);               
	};
    
    Acts.prototype.Play = function (url_)
	{
        this.player.Start();          
	};         
     
    Acts.prototype.Stop = function (url_)
	{
        this.player.Stop();          
	};     
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.LastJSON = function (ret)
	{
	    var result = this.midi_json || {};
		ret.set_string(JSON.stringify( result ));
	}; 	
    
    
	Exps.prototype.EndTime = function (ret)
	{
        var time = this.player.GetEndTime();    
	    ret.set_float(time);
	};      

    Exps.prototype.CurPitch = function(ret)
    {
        var pitch = (this.exp_note)? this.exp_note["pitch"]:0;
        ret.set_int(pitch);
    };

    Exps.prototype.CurVelocity = function(ret)
    {
        var pitch = (this.exp_note)? this.exp_note["velocity"]:0;
        ret.set_int(pitch);
    };    

    Exps.prototype.CurPitchKey = function(ret)
    {
        var pitch = (this.exp_note)? noteToKey[ this.exp_note["pitch"] ]: "";
        ret.set_string(pitch);
    };    

    Exps.prototype.CurTick = function(ret)
    {
        ret.set_int(this.exp_Tick);
    };    

    Exps.prototype.CurDuration = function(ret)
    {
        var tick = (this.exp_note)? (this.exp_note["end"] - this.exp_note["start"]): 0;
        var time = tick * this.player.tickPeriod;
        ret.set_float(time);
    };    

    Exps.prototype.CurDurationTick = function(ret)
    {
        var tick = (this.exp_note)? (this.exp_note["end"] - this.exp_note["start"]): 0;
        ret.set_int(tick);
    };    

    Exps.prototype.CurTime = function(ret)
    {
        var time = this.exp_Tick * this.player.tickPeriod;
        ret.set_float(time);
    }; 

    Exps.prototype.CurPitchKeyName = function(ret)
    {
        var name;
        if (this.exp_note)
            name = number2key[this.exp_note["pitch"]%12];
        else
            name = "";
        
        ret.set_string(name);
    };    

    Exps.prototype.CurPitchKeyOctave = function(ret)
    {
        var octave;
        if (this.exp_note)
            octave = Math.floor(this.exp_note["pitch"]/12)-2;
        else
            octave = 0;
        
        ret.set_int(octave);
    };     

    Exps.prototype.CurChannel = function(ret)
    {
        var channel = (this.exp_note)? this.exp_note["channel"]: 0;
        ret.set_int(channel);
    }; 

    Exps.prototype.CurTrackID = function(ret)
    {
        ret.set_int(this.exp_TrackID);
    };    
    
    // note conversions
    var keyToNote = {}; // C8  == 108
    var noteToKey = {}; // 108 ==  C8
    var number2key = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    (function () {
        var note, kidx=0, octave=-2, name, klen=number2key.length;
    	for (note=0; note<=127; note++) {
            name = number2key[kidx].toString() + octave.toString();
    		keyToNote[name] = note;
    		noteToKey[note] = name;
            
            kidx += 1;
    		if (kidx == klen)
            {
                kidx = 0;
                octave += 1;
            }
    	}
    })();
    	
}());

(function ()
{
    var PlayerKlass = function (plugin)
    {
        this.plugin = plugin;
        this.tracks = [];
        this.tickPeriod = 0;

        // -status-
        this.IsPlaying = false;
        this.playingTrackCnt = 0;
               
    };
    var PlayerKlassProto = PlayerKlass.prototype;  
    
    PlayerKlassProto.Load = function (midi_json)
    {
        this.Stop();
        
        this.set_tick_period(midi_json);
                
        // load track
        this.tracks.length = 0;
        var tracks = midi_json["track"];        
        var i, cnt=tracks.length, t;
        for (i=0; i<cnt; i++)
        {
            t = new TrackKlass(this, i);
            t.Load(tracks[i]);
            this.tracks.push(t);
        }
    };

    PlayerKlassProto.set_tick_period = function (midi_json)
    {   
        var timeDivision = midi_json["timeDivision"];
        if (typeof (timeDivision) === "number")    // Pulses per quarter note
            this.tickPeriod = this.plugin.beat_period / timeDivision;
        else  // Frames per second
            this.tickPeriod =  1 / (timeDivision[0] * timeDivision[1]);    
    };
    
    PlayerKlassProto.Start = function ()
    {
        this.Stop();
            
        this.IsPlaying = true;
        var i, cnt=this.tracks.length;
        for (i=0; i<cnt; i++)        
            this.tracks[i].Start();    

        if (this.playingTrackCnt == 0)
        {
             this.IsPlaying = false;
             this.plugin.OnPlayingEnded();            
        }
    };  
    
    PlayerKlassProto.Stop = function ()
    {   
        if (!this.IsPlaying)
            return;
            
        this.IsPlaying = false;
        var i, cnt=this.tracks.length;
        for (i=0; i<cnt; i++)        
            this.tracks[i].Stop();

        this.playingTrackCnt = 0;            
    }; 

    PlayerKlassProto.OnPlayingStart = function ()
    {     
        this.playingTrackCnt += 1;   
    };     

    PlayerKlassProto.OnPlayingEnded = function ()
    {     
        this.playingTrackCnt -= 1;
        
        if (this.playingTrackCnt == 0)
        {
             this.plugin.OnPlayingEnded();
             this.IsPlaying = false;
        }
    };         

    PlayerKlassProto.GetEndTime = function ()
    {     
        var end_time=0, t;
        var i, cnt=this.tracks.length;
        for (i=0; i<cnt; i++)
        {
            t = this.tracks[i].GetEndTime();
            if (end_time < t)
                end_time = t;
        }
        return (end_time * this.tickPeriod);
    };    
    
    
    
    var TrackKlass = function (player, id)
    {
        this.player = player;    
        this.plugin = player.plugin;
        this.ID = id;   
        this.track = []; // [ absTime, noteIdx, isOn ]
        this.notes = []; // { start, end, channel, pitch, velocity }               
        // --------
        this.timer = null;      
        this.abs_time = 0;
        this.track_index = -1;
        this.onNotes = {};
    };
    var TrackKlassProto = TrackKlass.prototype;  
    
    TrackKlassProto.Load = function (track)
    {
        this.track.length = 0;
        var events=track["event"], e;
        var i, cnt=events.length, t=0;
        var is_note_off, is_note_on, cmd;
        var current_notes = {}, pitch, note, note_idx;        

        for (i=0; i<cnt; i++)
        {
            e = events[i];
            t += (e["deltaTime"] || 0);
            
            is_note_on = (e["type"] === 9) && (e["data"][1] > 0);
            is_note_off = (e["type"] === 8) || ((e["type"] === 9) && (e["data"][1] === 0));
            
            if (is_note_on || is_note_off)
            {
                pitch = e["data"][0];
            }
                        
            
            if (is_note_on && !current_notes.hasOwnProperty(pitch))
            {    
                // create new note
                note = {};
                note["channel"] = e["channel"];
                note["start"] = t;
                note["pitch"] = pitch;
                note["velocity"] = e["data"][1];
                
                // add to notes
                this.notes.push(note);  
                note_idx = this.notes.length-1;
                note["idx"] = note_idx;
                current_notes[pitch] = note;                 
                
                // add to track
                cmd = [t, note_idx, true]; 
                this.track.push(cmd);      
            }
            else if (is_note_off && current_notes.hasOwnProperty(pitch))
            {
                // get note
                note = current_notes[pitch];
                note["end"] = t;
                delete current_notes[pitch]; 
                
                // add to track
                cmd = [t, note_idx, false]; 
                this.track.push(cmd);    
            }
        }                     
    };
        
    TrackKlassProto.Start = function ()
    {
        if (this.track.length === 0)
            return;
        
        if (this.timer == null)
        {
            this.timer = this.plugin._timeline_get().CreateTimer(on_timeout);
            this.timer.track = this;
        }
        else
            this.timer.Remove();  // stop timer
        
        this.abs_time = 0;       
        this.track_index = 0;        
        this.player.OnPlayingStart();        
        this.run_next_cmd(0);
    };

    TrackKlassProto.Stop = function ()
    {
        if (this.timer)
            this.timer.Remove();  // stop timer
    };    

    TrackKlassProto.GetEndTime = function ()
    {
        var last = this.track[this.track.length-1];
        return (last)? last[0]:0;
    };      
    
    TrackKlassProto.run_next_cmd = function (idx)
    {
        if (idx != null)
            this.track_index = idx;
            
        var is_continue=true, cmd, note, deltaT;
        while (is_continue)
        {
            cmd = this.track[this.track_index];
            if (cmd == null)
            {
                this.player.OnPlayingEnded(); 
                return;
            }
         
            if (cmd[0] === this.abs_time)
                this.play_note(this.notes[cmd[1]], cmd[2]);
            else
            {
                deltaT = cmd[0] - this.abs_time;
                this.abs_time = cmd[0];
                this.timer._note_index = cmd[1];
                this.timer._is_on = cmd[2];
                this.timer.Start(deltaT * this.player.tickPeriod);
                is_continue = false;
            }
            
            this.track_index += 1;
        }        
    };

    TrackKlassProto.play_note = function (note, is_on)
    {
        var pitch = note["pitch"];
        if (is_on)
            this.onNotes[pitch] = note;
        else if (this.onNotes.hasOwnProperty(pitch))        
            delete this.onNotes[pitch];
            
        this.plugin.PlayNote(note, is_on, this.ID);
    };
    // handler of timeout for timers in this track, this=timer   
    var on_timeout = function ()
    {        
        var note = this.track.notes[this._note_index];
        this.track.play_note(note, this._is_on);
        this.track.run_next_cmd();
    };
           
    cr.plugins_.Rex_JSMIDIparser.PlayerKlass = PlayerKlass;
}());  