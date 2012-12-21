// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_UndoRedo = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_UndoRedo.prototype;
		
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
	    this._handler = (this.properties[0] == 0)? new steps_handler(this):
                                                   new states_handler(this)
	    this._is_states_mode = (this.properties[0] == 0);
        this.max_record_length = this.properties[1];
        this._recorder = [];
        this._clean_all();
	};

	instanceProto._clean_all = function()
	{
        this._recorder.length = 0;
        this._current_index = (-1);
	};

	instanceProto._push = function(data)
	{
	    if ((this._recorder.length-1) == this._current_index)
	    {
            this._current_index += 1;	        
            this._recorder.push(data);
        }
        else
        {
            this._current_index += 1;
            this._recorder[this._current_index] = data;
            this._recorder.length = this._current_index+1;
        }
            
        if ((this.max_record_length > 0) && 
            (this._recorder.length > this.max_record_length))  
        {      
            this._recorder.shift();
            this._current_index -= 1;
        }          
	};

    var states_handler = function(plugin)
    {
        this.plugin = plugin;
    };
    var states_handlerProto = states_handler.prototype;
    // undo
	states_handlerProto.CanUndo = function()
	{
	    return (this.plugin._current_index > 0);
	};
	states_handlerProto.Undo = function()
	{	    
	    if (!this.CanUndo())
	        return 0;
	    
	    var plugin = this.plugin;
	    plugin._current_index -=1;
	    return plugin._recorder[plugin._current_index];
	};
	// redo
	states_handlerProto.CanRedo = function()
	{
	    var plugin = this.plugin;
	    return (plugin._current_index < (plugin._recorder.length-1));
	};
	states_handlerProto.Redo = function()
	{
	    if (!this.CanRedo())
	        return 0;
	    
	    var plugin = this.plugin;
	    plugin._current_index +=1 ;
	    return plugin._recorder[plugin._current_index];
	};	
	
    var steps_handler = function(plugin)
    {
        this.plugin = plugin;
    };
    var steps_handlerProto = steps_handler.prototype;
    // undo
	steps_handlerProto.CanUndo = function()
	{
	    return (this.plugin._current_index >= 0);
	};
	steps_handlerProto.Undo = function()
	{	    
	    if (!this.CanUndo())
	        return 0;
	    
	    var plugin = this.plugin;
	    var val = plugin._recorder[plugin._current_index];
	    plugin._current_index -=1;
	    return val;
	};
	// redo
	steps_handlerProto.CanRedo = function()
	{
	    var plugin = this.plugin;
	    return (plugin._current_index <= (plugin._recorder.length-1));
	};
	steps_handlerProto.Redo = function()
	{
	    if (!this._can_redo())
	        return 0;
	    
	    var plugin = this.plugin;
	    var val = plugin._recorder[plugin._current_index];
	    plugin._current_index +=1 ;
	    return val;
	};
	
	
	// current step
	instanceProto._has_steps = function()
	{
	    return (this._current_index != -1);
	};
	instanceProto._cur_step = function()
	{
	    if (!this._has_steps())
	        return 0;
	    
	    return this._recorder[this._current_index];
	};
	
	// JSON
	instanceProto._to_string = function()
	{
	    return JSON.stringify({"data":this._recorder,
	                           "curIndex":this._current_index,
	                           });
	};
	instanceProto._to_steps = function(JSON_string)
	{
	    if (JSON_string == "")
	        return;
	    var o = JSON.parse(JSON_string);
	    this._recorder = o["data"];
	    this._current_index = o["curIndex"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds(); 
     
	Cnds.prototype.CanUndo = function ()
	{
		return this._handler.CanUndo();      
	};
     
	Cnds.prototype.CanRedo = function ()
	{
		return this._handler.CanRedo();        
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
		
	Acts.prototype.CleanAll = function ()
	{        
	    this._clean_all();
	};	
		
	Acts.prototype.Push = function (data)
	{        
	    this._push(data);
	};	
		
	Acts.prototype.StringToSteps = function (JSON_string)
	{        
	    this._to_steps(JSON_string);
	};		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.Undo = function (ret)
	{
	    ret.set_any(this._handler.Undo());
	};
	
	Exps.prototype.Redo = function (ret)
	{
	    ret.set_any(this._handler.Redo());
	};	
	
	Exps.prototype.CurStep = function (ret)
	{
	    ret.set_any(this._cur_step());
	};
		
	Exps.prototype.StepsCnt = function (ret)
	{
	    ret.set_int(this._recorder.length);
	};
		
	Exps.prototype.CurIndex = function (ret)
	{
	    ret.set_int(this._current_index);
	};		
	
	Exps.prototype.ToString = function (ret)
	{
	    ret.set_string(this._to_string());
	};
}());