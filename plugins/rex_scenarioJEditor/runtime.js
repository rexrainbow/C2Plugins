// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ScenarioJEditor = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ScenarioJEditor.prototype;
		
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
        this.editor = {
            scope: {},
            stack: [],  
            fnParameters: {},
        }
	};
    
	instanceProto.getCurrentSequence = function()
	{
        var stack = this.editor.stack;
        return stack[stack.length-1];
	};
    
	instanceProto.onDestroy = function ()
	{
	};   

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
    Cnds.prototype.OnFunction = function (task_name)
    {
        var curSeq = this.getCurrentSequence();        
        if (curSeq != null)
        {
            alert("Task " + task_name + " only can be declared in first level.");
            return false;            
        }
        
        var newSeq = [];
        this.editor.scope[task_name] = newSeq;        
        this.editor.stack.push(newSeq);
        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
        if (solModifierAfterCnds)
            this.runtime.pushCopySol(current_event.solModifiers);
        
        current_event.retrigger();
        
        if (solModifierAfterCnds)
            this.runtime.popSol(current_event.solModifiers);
            
        this.editor.stack.pop();        
		return false;
    }; 
    
    Cnds.prototype.IFIf = function (condition_)
    {
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "If" only can be put in a task.');
            return;            
        }
        
        var instruction_if = ["if", condition_, []];
        curSeq.push(instruction_if);
        
        var newSeq = instruction_if[2];
        this.editor.stack.push(newSeq);
        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
        if (solModifierAfterCnds)
            this.runtime.pushCopySol(current_event.solModifiers);
        
        current_event.retrigger();
        
        if (solModifierAfterCnds)
            this.runtime.popSol(current_event.solModifiers);
            
        this.editor.stack.pop();  // pop newSeq
		return false;
    }; 
    
    
    Cnds.prototype.IFElseIf = function (condition_)
    {
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "If" only can be put in a task.');
            return;            
        }
        
        var last_instruction = curSeq[curSeq.length-1];
        if ((last_instruction == null) || (last_instruction[0] !== "if"))
        {
            alert('Instruction "Else If" only can be put after "If".');
            return;        
        }
        
        var instruction_elseif = [condition_, []];
        last_instruction.push.apply(last_instruction, instruction_elseif);
        
        var newSeq = instruction_elseif[1];
        this.editor.stack.push(newSeq);
        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
        if (solModifierAfterCnds)
            this.runtime.pushCopySol(current_event.solModifiers);
        
        current_event.retrigger();
        
        if (solModifierAfterCnds)
            this.runtime.popSol(current_event.solModifiers);
            
        this.editor.stack.pop();  // pop newSeq
		return false;
    };     
    
    Cnds.prototype.IFElse = function ()
    {
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "If" only can be put in a task.');
            return;            
        }
        
        var last_instruction = curSeq[curSeq.length-1];
        if ((last_instruction == null) || (last_instruction[0] !== "if"))
        {
            alert('Instruction "Else" only can be put after "If".');
            return;        
        }
        
        var instruction_else = ["(true)", []];
        last_instruction.push.apply(last_instruction, instruction_elseif);
        
        var newSeq = instruction_else[1];
        this.editor.stack.push(newSeq);
        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
        if (solModifierAfterCnds)
            this.runtime.pushCopySol(current_event.solModifiers);
        
        current_event.retrigger();
        
        if (solModifierAfterCnds)
            this.runtime.popSol(current_event.solModifiers);
            
        this.editor.stack.pop();  // pop newSeq
		return false;
    };         
    
    Cnds.prototype.For = function (varName, start, end, step)
    {
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "For" only can be put in a task.');
            return;            
        }
        
        var instruction_for = ["for", varName, start, end, step, []];
        curSeq.push(instruction_for);
        
        var newSeq = instruction_for[5];         
        this.editor.stack.push(newSeq);
        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
        if (solModifierAfterCnds)
            this.runtime.pushCopySol(current_event.solModifiers);
        
        current_event.retrigger();
        
        if (solModifierAfterCnds)
            this.runtime.popSol(current_event.solModifiers);
            
        this.editor.stack.pop();        
		return false;
    }; 
    
    Cnds.prototype.While = function (condition_)
    {
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "While" only can be put in a task.');
            return;            
        }
        
        var instruction_while = ["while", condition_, []];
        curSeq.push(instruction_while);
        
        var newSeq = instruction_for[2];         
        this.editor.stack.push(newSeq);
        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
        if (solModifierAfterCnds)
            this.runtime.pushCopySol(current_event.solModifiers);
        
        current_event.retrigger();
        
        if (solModifierAfterCnds)
            this.runtime.popSol(current_event.solModifiers);
            
        this.editor.stack.pop();        
		return false;
    };     
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Exit = function ()
	{
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Exit" only can be put in a task.');
            return;            
        }
        
        curSeq.push(["exit"]);
	};  
    
    Acts.prototype.SetFunctionParameter = function (name_, value_)
	{        
        this.editor.fnParameters[name_] = value_;
	};  

    Acts.prototype.Call = function (name_)
	{        
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Invoke task" only can be put in a task.');
            return;            
        }
        
        curSeq.push(["run", name_, this.editor.fnParameters]);
        this.editor.fnParameters = {};
	};     

    Acts.prototype.CallC2Function = function (name_, params_)
	{
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Call C2 function" only can be put in a task.');
            return;            
        }
        
        var instruction = ["C2", name_];
        instruction.push.apply(instruction, params_)
        curSeq.push(instruction);
	};     

    Acts.prototype.Wait = function (signal)
	{
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Wait" only can be put in a task.');
            return;            
        }
        
        curSeq.push(["wait", signal])
	};      
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.OutputScript = function (ret)
	{
	    ret.set_string( JSON.stringify(this.editor.scope) );
	};    
}());