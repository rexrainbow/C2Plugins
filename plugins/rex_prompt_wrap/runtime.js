// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_PromptWrap = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var input_text = "";
	var pluginProto = cr.plugins_.Rex_PromptWrap.prototype;
		
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
        this.enable_wrap = (this.properties[0] === 1);
        
		var self = this;		
		if (this.runtime.isCocoonJs && this.enable_wrap)
		{
			CocoonJS["App"]["onTextDialogFinished"].addEventListener(function(text) {
				input_text = text;
				self.runtime.trigger(cr.plugins_.Rex_PromptWrap.prototype.cnds.OnKeyboardOK, self);
			});

			CocoonJS["App"]["onTextDialogCancelled"].addEventListener(function() {
				self.runtime.trigger(cr.plugins_.Rex_PromptWrap.prototype.cnds.OnKeyboardCancelled, self);
			});            
        }            
        

	};
    
	instanceProto.cocoonJS_PromptKeyboard = function (title_, message_, initial_, type_, canceltext_, oktext_)
	{
		if (!this.runtime.isCocoonJs)
			return;
		
		var typestr = ["text", "num", "phone", "email", "url"][type_];
		
		CocoonJS["App"]["showTextDialog"](title_, message_, initial_, typestr, canceltext_, oktext_);
	};
    
	instanceProto.web_prompt = function (title_, message_, initial_, type_, canceltext_, oktext_)
	{
		var retval = prompt(title_, initial_);
        if(retval != null)
        {
            input_text = retval;
            this.runtime.trigger(cr.plugins_.Rex_PromptWrap.prototype.cnds.OnKeyboardOK, this);
        }
        else
            this.runtime.trigger(cr.plugins_.Rex_PromptWrap.prototype.cnds.OnKeyboardCancelled, this);
        
	};    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
	Cnds.prototype.OnKeyboardCancelled = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnKeyboardOK = function ()
	{
		return true;
	}; 
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	Acts.prototype.PromptKeyboard = function (title_, message_, initial_, type_, canceltext_, oktext_)
	{	    
		if (this.runtime.isCocoonJs && this.enable_wrap)
			this.cocoonJS_PromptKeyboard(title_, message_, initial_, type_, canceltext_, oktext_);
        else
            this.web_prompt(title_, message_, initial_, type_, canceltext_, oktext_);
	};

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.InputText = function (ret)
	{
		ret.set_string(input_text);
	};
	
}());