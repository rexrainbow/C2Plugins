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
		this.enableWrapper = (this.properties[0] === 1);
		this.curTag = "";
        				
		if (this.isCocoonJs())
		{
			var self = this;			
			CocoonJS["App"]["onTextDialogFinished"].addEventListener(function(text) {
				input_text = text;
				self.runtime.trigger(cr.plugins_.Rex_PromptWrap.prototype.cnds.OnKeyboardOK, self);
			});

			CocoonJS["App"]["onTextDialogCancelled"].addEventListener(function() {
				self.runtime.trigger(cr.plugins_.Rex_PromptWrap.prototype.cnds.OnKeyboardCancelled, self);
			});            
        }            
        
	};

	instanceProto.isCocoonJs = function()
	{
		return (this.runtime.isCocoonJs && this.enableWrapper);
	}

	instanceProto.cocoonJS_prompt = function (title_, message_, initial_, type_, canceltext_, oktext_)
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
    
	Cnds.prototype.OnKeyboardCancelled = function (tag)
	{
		return cr.equals_nocase(tag, this.curTag);
	};
	
	Cnds.prototype.OnKeyboardOK = function (tag)
	{
		return cr.equals_nocase(tag, this.curTag);
	}; 
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	Acts.prototype.PromptKeyboard = function (title_, message_, initial_, type_, canceltext_, oktext_, tag)
	{	
		this.curTag = tag;
		var fn = this.isCocoonJs()? this.cocoonJS_prompt:this.web_prompt;
		fn.call(this, title_, message_, initial_, type_, canceltext_, oktext_);
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