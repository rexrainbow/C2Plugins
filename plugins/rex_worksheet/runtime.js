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
        this.timer = null;
        this.timeline = null;
        this.callback = null;  
        this.instructions = [];
        this.offset = 0;
        this.current_cmd = {};
        this.pre_abs_time = 0;
	};
    
	instanceProto.Start = function(instructions, offset)
	{
        this.instructions = this._parsing(instructions);
        this.offset = offset;        
        this._start_cmd();
	}; 
    
	instanceProto.Run = function()
	{
        this.callback.CallFn(this.current_cmd.fn_name, 
                             this.current_cmd.fn_args);
        
        this._start_cmd();
	};   
    
    var _INSTRUCTION_SORT = function(instA, instB)
    {
        return (instA.time > instB.time);
    }
    
    instanceProto._parsing = function(instructions_string)
	{
        var lines = instructions_string.split(/\r\n|\r|\n/);
        var instructions = [];
        var i,line,slices,slice;
        var fn_args,j,slices_length,arg_slices,sn;
        var line_length = lines.length;
        for (i=0; i<line_length; i++)
        {
            line = lines[i];
            if ((line.length==0) ||
                (line[0]==" ")   ||
                (line[0]=="/")     ) // "/" is a comment line
                continue;
                
            slices = line.split(",");
            
            // get args
            slices_length = slices.length;
            fn_args = {};
            sn = 0;
            for (j=2; j<slices_length; j++)
            {
                slice = slices[j];
                if (slice.indexOf("=")!=(-1))
                {
                    arg_slices = slice.split("=");
                    fn_args[arg_slices[0]] = arg_slices[1];
                }
                else
                {
                    fn_args[sn] = slice;
                    sn += 1;
                }
            }
            
            // output
            instructions.push({time:parseFloat(slices[0]),
                               fn_name:slices[1], 
                               fn_args:fn_args});                               
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
            this.runtime.trigger(cr.plugins_.Rex_WorkSheet.prototype.cnds.OnComplete, this);
        }
	};
    
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
    
	cnds.OnComplete = function ()
	{
		return true;
	};  

	cnds.IsRunning = function ()
	{
        var is_running = false;
        if (this.timer)
        {
            is_running = this.timer.IsActive();
        }       
		return is_running;
	};      

	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

    acts.Setup = function (timeline_objs, fn_objs)
	{
        this.timeline = timeline_objs.instances[0];
        this.callback = fn_objs.instances[0];
	};    
    
    acts.Start = function (instructions, offset)
	{
        this.Start(instructions, offset);
	};   
    
    acts.Pause = function ()
	{
        if (this.timer)
        {
            this.timer.Suspend();
        }    
	};

    acts.Resume = function (timer_name)
	{
        if (this.timer)
        {
            this.timer.Resume();
        }
	};
    
    acts.Stop = function ()
	{
        if (this.timer)
        {
            this.timer.Remove();
        }
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