// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SequenceMatcher = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SequenceMatcher.prototype;
		
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
        this._symbol_buffer = new cr.plugins_.Rex_SequenceMatcher.BufferKlass(this.properties[0]);
        this._has_matched_pattern = false;
	};
	
	instanceProto.push_symbol = function (s)	
	{
	    this._symbol_buffer.push_data(s);
	    this._has_matched_pattern = false;
	    this.runtime.trigger(cr.plugins_.Rex_SequenceMatcher.prototype.cnds.OnMatchPattern, this);
	    if (!this._has_matched_pattern)
            this.runtime.trigger(cr.plugins_.Rex_SequenceMatcher.prototype.cnds.OnNoMatchPattern, this);
	};
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnMatchPattern = function (pattern)
	{       
	    var is_matched = this._symbol_buffer.is_matched(pattern);
	    this._has_matched_pattern |= is_matched;
        return is_matched;
	};
	
	Cnds.prototype.OnNoMatchPattern = function ()
	{
        return true;
	};

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.CleanSymbolBuffer = function ()	
	{
	    this._symbol_buffer.clean();
	};
	Acts.prototype.SetSymbolBufferLength = function (max_len)	
	{
	    this._symbol_buffer.set_max_length(max_len);
	};    
	Acts.prototype.PushSymbol = function (s)	
	{
	    this.push_symbol(s);
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
}());

(function ()
{
    cr.plugins_.Rex_SequenceMatcher.BufferKlass = function(max_len)
    {    
        this._buf = [];
        this.set_max_length(max_len);
    };
    var BufferKlassProto = cr.plugins_.Rex_SequenceMatcher.BufferKlass.prototype;
    
	BufferKlassProto.clean = function()
	{
	    this._buf.length = 0;
	};
	
	BufferKlassProto.set_max_length = function(max_len)
	{
	    this.max_len = max_len;
        if (max_len < this._buf.length)
            this._buf.length = max_len;
	};
	
	BufferKlassProto.push_data = function(data)
	{
	    this._buf.push(data);
	    if (this._buf.length > this.max_len)
	        this._buf.shift()
	};
	
	BufferKlassProto.is_matched = function(pattern)
	{
	    if (pattern == "")
	        return false;
	        
	    var pattern_len=pattern.length;
	    var buf_len=this._buf.length;
	    if (pattern_len > buf_len)
	        return false;
	    
	    var i,is_matched=true;
	    for (i=0; i<pattern_len; i++)
	    {
	        if (pattern[pattern_len-1-i] != this._buf[buf_len-1-i])
	        {
	            is_matched = false;
	            break;
	        }
	    }
	    return is_matched;
	};
}());    