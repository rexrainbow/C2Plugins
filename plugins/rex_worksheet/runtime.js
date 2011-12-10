// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_WorkSheet = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_WorkSheet.prototype;
		
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
        this.timeline = null;
        this.callback = null;        
        this.timer = null; 
        this.instructions = [];
        this.offset = 0;
        this.current_cmd = {};
        this.pre_abs_time = 0;        
	};
    
	
	instanceProto.onDestroy = function ()
	{
        if (this.timer)
            this.timer.Remove();
	};    

	instanceProto.Start = function(instructions, offset)
	{
        this.pre_abs_time = 0;
        this.instructions = this._parsing(instructions);
        this.offset = offset;        
        this._start_cmd();
	}; 
    
	instanceProto.Run = function()
	{
        this.callback.ExecuteCommands(this.current_cmd.fn_args);        
        this._start_cmd();
	};   
    
    var _INSTRUCTION_SORT = function(instA, instB)
    {
        var ta = instA.time;
        var tb = instB.time;
        return (ta < tb) ? -1 : (ta > tb) ? 1 : 0;
    }
    
    instanceProto._parsing = function(instructions_string)
	{
        var lines = instructions_string.split(/\r\n|\r|\n/);
        var instructions = [];
        var i,line,slices,comma_index;
        var line_length = lines.length;
        for (i=0; i<line_length; i++)
        {
            line = lines[i];
            if ((line.length==0) ||
                (line[0]==" ")   ||
                (line[0]=="/")     ) // "/" is a comment line
                continue;
                
            comma_index = line.indexOf(",");
            if (comma_index == -1)
                continue;
                
            // output
            instructions.push({time:parseFloat(line.slice(0,comma_index)),
                               fn_args:line.slice(comma_index+1)});                               
        }
        
        instructions.sort(_INSTRUCTION_SORT);
        
        return instructions;
	};
    
	instanceProto._start_cmd = function()
	{
        if (this.instructions.length>0)
        {
            this.current_cmd = this.instructions.shift();
            if (this.timer== null)
            {
                this.timer = this.timeline.CreateTimer(this, this.Run);
            }
            
            var next_abs_time = this.current_cmd.time + this.offset;
            this.timer.Start(next_abs_time - this.pre_abs_time);
            this.pre_abs_time = next_abs_time
        }
        else
        {
            this.runtime.trigger(cr.plugins_.Rex_WorkSheet.prototype.cnds.OnCompleted, this);
        }
	};
    
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
    
	cnds.OnCompleted = function ()
	{
		return true;
	};  

	cnds.IsRunning = function ()
	{
		return ((this.timer)? this.timer.IsActive():false);
	};      

	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

    acts.Setup = function (timeline_objs, fn_objs)
	{  
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.timeline = timeline;        
        else
            alert ("Worksheet should connect to a timeline object");          
        
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.callback = callback;        
        else
            alert ("Worksheet should connect to a function object");
	};    
    
    acts.Start = function (instructions, offset)
	{   
        this.Start(instructions, offset);
	};   
    
    acts.Pause = function ()
	{
        if (this.timer)
            this.timer.Suspend();  
	};

    acts.Resume = function (timer_name)
	{
        if (this.timer)
            this.timer.Resume();
	};
    
    acts.Stop = function ()
	{
        if (this.timer)
            this.timer.Remove();
	};  
    
    acts.SetOffset = function (offset)
	{
        this.offset = offset;
	}; 
    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

    exps.Offset = function (ret)
	{
	    ret.set_float( this.offset );
	};	
}());