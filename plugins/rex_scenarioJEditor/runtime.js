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

    var TYPE_RAW = 0;
    var TYPE_EVAL = 1;
    var TYPE_MUSTACHE = 2;    
	instanceProto.onCreate = function()
	{
        this.defaultStringType = (this.properties[0] === 1)? TYPE_MUSTACHE:TYPE_RAW;
        this.delimiterCfg = null;
        this.setDelimiter(this.properties[1], this.properties[2]);
        
        this.editor = {
            scope: {},
            stack: [],
        };
	};
    
	instanceProto.setDelimiter = function (leftDelimiter, rightDelimiter)
	{
        if (leftDelimiter === "")  leftDelimiter = "{{";
        if (rightDelimiter === "")  rightDelimiter = "}}";        
		if ((leftDelimiter === "{{") && (rightDelimiter === "}}"))
            this.delimiterCfg = null;
        else
            this.delimiterCfg = "{{=" + leftDelimiter + " " + rightDelimiter + "=}}";
	};

    instanceProto.getMustacheTemplate = function (template)
	{
        if (this.delimiterCfg !== null)
            template = this.delimiterCfg + template;
        
        return template;
	};    
    
	instanceProto.onDestroy = function ()
	{
	};      
    
	instanceProto.getCurrentSequence = function()
	{
        var stack = this.editor.stack;
        return stack[stack.length-1];
	};
    
	instanceProto.transferContent = function()
	{
        var content = this.editor.scope;
        this.editor = {
            scope: {},
            stack: [],
        };
        
        return content;
	};

    // type: 0=bypass, 1=eval, 2=mustache
    var gExpPattern = /^@#@(\[.*\])@#@/;
	instanceProto.getValueObj = function (sIn, defaultType)
	{        
        var valueObj = null;
        var type_sIn = typeof(sIn);
        if (type_sIn === "number")
        {
            valueObj = [ sIn , TYPE_RAW ];
        }
        else if ((type_sIn ==="string") && gExpPattern.test(sIn))
        {
            valueObj = sIn.match(gExpPattern)[1];
            try 
            {
		    	valueObj = JSON.parse(valueObj);
		    }
		    catch(e) { valueObj=null; }
        }
        
        if (valueObj === null)
        {
            valueObj = [ sIn , defaultType ];
        }
        
        if (valueObj[1] === TYPE_MUSTACHE)
        {
            valueObj[0] = this.getMustacheTemplate( valueObj[0] )
        }
        
        return valueObj;
	};     


    instanceProto.saveToJSON = function ()
    { 
        var editor_save = {};
        editor_save["scope"] = this.editor.scope;
        editor_save["stack"] = this.editor.stack;
        
        return { "dm": this.delimiterCfg,
                      "editor": editor_save,
                   };
    };
    
    instanceProto.loadFromJSON = function (o)
    {
        this.delimiterCfg= o["dm"];
        
        var editor_save = o["editor"];
        this.editor.scope = editor_save["scope"];
        this.editor.stack = editor_save["stack"];
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
        
        condition_ = this.getValueObj(condition_, TYPE_EVAL);
        var instruction_if = ["_if_", condition_, []];
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
            alert('Instruction "Else IF" only can be put in a task.');
            return;            
        }
        
        var last_instruction = curSeq[curSeq.length-1];
        if ((last_instruction == null) || (last_instruction[0] !== "_if_"))
        {
            alert('Instruction "Else If" only can be put after "If".');
            return;        
        }
        
        condition_ = this.getValueObj(condition_, TYPE_EVAL);
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
            alert('Instruction "Else" only can be put in a task.');
            return;            
        }
        
        var last_instruction = curSeq[curSeq.length-1];
        if ((last_instruction == null) || (last_instruction[0] !== "_if_"))
        {
            alert('Instruction "Else" only can be put after "If".');
            return;        
        }
        
        var condition_ = this.getValueObj(1, TYPE_EVAL);
        var instruction_else = [condition_, []];
        last_instruction.push.apply(last_instruction, instruction_else);
        
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
        
        varName = this.getValueObj(varName, this.defaultStringType);
        start = this.getValueObj(start, TYPE_EVAL);
        end = this.getValueObj(end, TYPE_EVAL);
        step = this.getValueObj(step, TYPE_EVAL);
        var instruction_for = ["_for_", varName, start, end, step, []];
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
        
        condition_ = this.getValueObj(condition_, TYPE_EVAL);
        var instruction_while = ["_while_", condition_, []];
        curSeq.push(instruction_while);
        
        var newSeq = instruction_while[2];         
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
        
    Cnds.prototype.SWITCHSwitch = function (expression_)
    {
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Switch" only can be put in a task.');
            return;            
        }
        
        expression_ = this.getValueObj(expression_, TYPE_EVAL);     
        var instruction_switch = ["_switch_", expression_];
        curSeq.push(instruction_switch);
        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
        if (solModifierAfterCnds)
            this.runtime.pushCopySol(current_event.solModifiers);
        
        current_event.retrigger();
        
        if (solModifierAfterCnds)
            this.runtime.popSol(current_event.solModifiers);
            
		return false;
    };   

    Cnds.prototype.SWITCHCase = function (value_)
    {
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Case" only can be put in a task.');
            return;            
        }
        
        var last_instruction = curSeq[curSeq.length-1];
        if ((last_instruction == null) || (last_instruction[0] !== "_switch_"))
        {
            alert('Instruction "Case" only can be put after "Switch".');
            return;        
        }
        
        if (value_ == null)  // default
            value_ = null;
        else
            value_ = this.getValueObj(value_, this.defaultStringType);   
        
        var instruction_case = [value_, []];
        last_instruction.push.apply(last_instruction, instruction_case);
        
        var newSeq = instruction_case[1];
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
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetLocalVarDefault = function (name_, value_)
	{        
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Define LocalVar" only can be put in a task.');
            return;            
        }
        
        name_ = this.getValueObj(name_, this.defaultStringType);
        value_ = this.getValueObj(value_, this.defaultStringType);
        curSeq.push(["_local_", name_, value_, "default"]);
	};  
    
    Acts.prototype.Return = function ()
	{
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Return" only can be put in a task.');
            return;            
        }
        
        curSeq.push(["_return_"]);
	};  
    
    Acts.prototype.SetLocalVar = function (name_, value_, taskName)
	{        
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Set LocalVar" only can be put in a task.');
            return;
        }
        
        name_ = this.getValueObj(name_, this.defaultStringType);
        value_ = this.getValueObj(value_, this.defaultStringType);
        curSeq.push(["_local_", name_, value_, "set", taskName]);
	};    
    
    Acts.prototype.BreakLoop = function ()
	{
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Break" only can be put in a task.');
            return;            
        }
        
        curSeq.push(["_break_"]);
	};  
    
    Acts.prototype.AddToLocalVar = function (name_, value_, taskName)
	{        
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Add to LocalVar" only can be put in a task.');
            return;
        }
        
        name_ = this.getValueObj(name_, this.defaultStringType);
        value_ = this.getValueObj(value_, TYPE_EVAL);    
        curSeq.push(["_local_", name_, value_, "add", taskName]);
	};    
    
    Acts.prototype.SetFunctionParameter = function (name_, value_)
	{
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Set function parameter" only can be put in a task.');
            return;
        }
        
        name_ = this.getValueObj(name_, this.defaultStringType);
        value_ = this.getValueObj(value_, this.defaultStringType);
        curSeq.push(["_fnParam_", name_, value_, "set"]);
	};  

    Acts.prototype.Call = function (name_)
	{        
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Call Function" only can be put in a task.');
            return;            
        }
        
        name_ = this.getValueObj(name_, this.defaultStringType);
        curSeq.push(["_callFn_", name_]);
	};     

    Acts.prototype.CallC2Function = function (name_, params_)
	{
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Call C2 function" only can be put in a task.');
            return;            
        }
        
        name_ = this.getValueObj(name_, this.defaultStringType);
        var instruction = ["_callC2Fn_", name_];
        var i, cnt=params_.length;
        for (i=0; i<cnt; i++)
            instruction.push( this.getValueObj(params_[i], this.defaultStringType) );
        
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
        
        signal = this.getValueObj(signal, this.defaultStringType);  
        curSeq.push(["_wait_", signal])
	};      
        
    Acts.prototype.ExitTask = function ()
	{
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Exit task" only can be put in a task.');
            return;            
        }
        
        curSeq.push(["_exit_"]);
	}; 

    Acts.prototype.SetTaskVarDefault = function (name_, value_)
	{        
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Define TaskVar" only can be put in a task.');
            return;            
        }
        
        name_ = this.getValueObj(name_, this.defaultStringType);
        value_ = this.getValueObj(value_, this.defaultStringType);
        curSeq.push(["_task_", name_, value_, "default"]);
	};  
    
    Acts.prototype.SetTaskVar = function (name_, value_, taskName)
	{        
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Set TaskVar" only can be put in a task.');
            return;
        }
        
        name_ = this.getValueObj(name_, this.defaultStringType);
        value_ = this.getValueObj(value_, this.defaultStringType);
        curSeq.push(["_task_", name_, value_, "set", taskName]);
	};    

    Acts.prototype.AddToTaskVar = function (name_, value_, taskName)
	{        
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Add to TaskVar" only can be put in a task.');
            return;
        }
        
        name_ = this.getValueObj(name_, this.defaultStringType);
        value_ = this.getValueObj(value_, TYPE_EVAL);    
        curSeq.push(["_task_", name_, value_, "add", taskName]);
	};     
    
    Acts.prototype.SetGlobalVarDefault = function (name_, value_)
	{        
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Define GlobalVar" only can be put in a task.');
            return;            
        }
        
        name_ = this.getValueObj(name_, this.defaultStringType);
        value_ = this.getValueObj(value_, this.defaultStringType);
        curSeq.push(["_global_", name_, value_, "default"]);
	};  
    
    Acts.prototype.SetGlobalVar = function (name_, value_)
	{        
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Set GlobalVar" only can be put in a global.');
            return;
        }
        
        name_ = this.getValueObj(name_, this.defaultStringType);
        value_ = this.getValueObj(value_, this.defaultStringType);
        curSeq.push(["_global_", name_, value_, "set"]);
	};    

    Acts.prototype.AddToGlobalVar = function (name_, value_)
	{        
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Add to GlobalVar" only can be put in a global.');
            return;
        }
        
        name_ = this.getValueObj(name_, this.defaultStringType);
        value_ = this.getValueObj(value_, TYPE_EVAL);    
        curSeq.push(["_global_", name_, value_, "add"]);
	};     
    
    Acts.prototype.StartTask = function (taskName, fnName)
	{        
        var curSeq = this.getCurrentSequence();
        if (curSeq == null)        
        {
            alert('Instruction "Start task" only can be put in a task.');
            return;            
        }
        
        taskName = this.getValueObj(taskName, this.defaultStringType);        
        fnName = this.getValueObj(fnName, this.defaultStringType);
        curSeq.push(["_new_", fnName, taskName]);
	};      
    
    Acts.prototype.SetDelimiters = function (leftDelimiter, rightDelimiter)
	{        
        this.setDelimiter(leftDelimiter, rightDelimiter);
	};     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.Content = function (ret)
	{
	    ret.set_string( JSON.stringify(this.editor.scope) );
	};   

    Exps.prototype.Eval = function (ret, exp_)
	{
        exp_ = [ exp_, TYPE_EVAL ];
        exp_ = "@#@" +JSON.stringify(exp_)+ "@#@";
	    ret.set_string( exp_ );
	};   
    
    Exps.prototype.Num = Exps.prototype.Eval;     
    
    Exps.prototype.Raw = function (ret, exp_)
	{
        exp_ = [ exp_, TYPE_RAW ];
        exp_ = "@#@" +JSON.stringify(exp_)+ "@#@";
	    ret.set_string( exp_ );
	}; 
    
    Exps.prototype.Mustache = function (ret, exp_)
	{
        exp_ = [ exp_, TYPE_MUSTACHE ];
        exp_ = "@#@" +JSON.stringify(exp_)+ "@#@";
	    ret.set_string( exp_ );
	}; 
  
}());