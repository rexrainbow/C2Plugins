// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_sequence = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_sequence.prototype;
		
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
        this.exp_TrigTime = 0;
        this.exp_TrigNote = "";
        
        var notes = this.properties[0];
        if (notes !== "")
            notes = notes.split(",");
        else
            notes = [];
        
        var subdivision = this.properties[1];
        var self=this;
        var callback = function(time, note)
        {
            self.exp_TrigTime = time;
            self.exp_TrigNote = note;            
            self.runtime.trigger(cr.plugins_.Rex_ToneJS_sequence.prototype.cnds.OnNoteEvent, self); 
        };
        this.seq = new window["Tone"]["Sequence"](callback, notes, subdivision);
        
        var loopCnt = this.properties[2];
        if (loopCnt > 0)
            this.seq.loop = loopCnt;
        
        if (this.properties[3] === 1)
            this.seq["start"]("+0");     
	};
    
	instanceProto.onDestroy = function ()
	{
	};   

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnNoteEvent = function ()
	{
        return true;  
	};	    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.Start = function (time)
	{
        this.seq["start"](time);      
	};      

	Acts.prototype.Stop = function (time)
	{
        this.seq["stop"](time);      
	};      

	Acts.prototype.RemoveAll = function ()
	{
        this.seq["removeAll"]();      
	}; 

	Acts.prototype.Add = function (index, value)
	{
        if (value.indexOf(",") !== -1)
            value = value.split(",");
        this.seq["add"](index, value);      
	};

	Acts.prototype.Remove = function (index)
	{
        this.seq["remove"](index);      
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.Time = function (ret)
	{
		ret.set_any(this.exp_TrigTime);
	};
    
	Exps.prototype.Note = function (ret)
	{
		ret.set_any(this.exp_TrigNote);
	};    
    
    var idxs = [];
	Exps.prototype.At = function (ret, idx0)
	{
        var i,cnt=arguments.length;
        for(i=1; i<cnt; i++)
            idxs.push(arguments[i]);        
        var note = this.seq["at"].apply(this.seq, idxs);
        idxs.length = 0;
		ret.set_any(note);
	};
    
	Exps.prototype.Progress = function (ret)
	{
		ret.set_float(this.seq["progress"]);
	};
    
}());