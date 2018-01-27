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
        this.symbolBuffer = new cr.plugins_.Rex_SequenceMatcher.BufferKlass(this.properties[0]);
        this.hasMatchedPattern = false;
	};
	
	instanceProto.pushSymbol = function (s)	
	{
	    this.symbolBuffer.pushData(s);
	    this.hasMatchedPattern = false;
	    this.runtime.trigger(cr.plugins_.Rex_SequenceMatcher.prototype.cnds.OnMatchPattern, this);
	    if (!this.hasMatchedPattern)
            this.runtime.trigger(cr.plugins_.Rex_SequenceMatcher.prototype.cnds.OnNoMatchPattern, this);
	};
	
	instanceProto.saveToJSON = function ()
	{    
		return { "d": this.symbolBuffer.saveToJSON()
	            };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.symbolBuffer.loadFromJSON(o["d"]);    
	};	
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{	  
		propsections.push({
			"title": this.type.name,
			"properties": [{"name": "Buffer", "value": this.symbolBuffer.content2string("")},
			              ]
		});
	};
	/**END-PREVIEWONLY**/	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnMatchPattern = function (pattern)
	{       
	    var isMatched = this.symbolBuffer.isMatched(pattern);
	    this.hasMatchedPattern |= isMatched;
        return isMatched;
	};
	
	Cnds.prototype.OnNoMatchPattern = function ()
	{
        return true;
	};

	Cnds.prototype.IsMatchPattern = function (pattern)
	{
        return this.symbolBuffer.isMatched(pattern);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.CleanSymbolBuffer = function ()	
	{
	    this.symbolBuffer.clean();
	};
	Acts.prototype.SetSymbolBufferLength = function (maxLen)	
	{
	    this.symbolBuffer.setMaxLength(maxLen);
	};    
	Acts.prototype.PushSymbol = function (s)	
	{
	    this.pushSymbol(s);
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
}());

(function ()
{
    cr.plugins_.Rex_SequenceMatcher.BufferKlass = function(maxLen)
    {    
        this.buf = [];
        this.setMaxLength(maxLen);
    };
    var BufferKlassProto = cr.plugins_.Rex_SequenceMatcher.BufferKlass.prototype;
    
	BufferKlassProto.clean = function()
	{
	    this.buf.length = 0;
	};
	
	BufferKlassProto.setMaxLength = function(maxLen)
	{
	    this.maxLen = maxLen;
        if (maxLen < this.buf.length)
            this.buf.length = maxLen;
	};
	
	BufferKlassProto.pushData = function(data)
	{
	    this.buf.push(data);
	    if (this.buf.length > this.maxLen)
	        this.buf.shift()
	};
	
	BufferKlassProto.isMatched = function(pattern)
	{
	    if (pattern == "")
	        return false;
	   
	    var has_comma = (pattern.indexOf(",") != -1);
	    if (has_comma)
	    {
	        pattern = pattern.split(",");
	    }
	         
	    var patternLen=pattern.length;
	    var bufLen=this.buf.length;
	    if (patternLen > bufLen)
	        return false;
	    
	    var i,isMatched=true;
	    for (i=0; i<patternLen; i++)
	    {
	        if (pattern[patternLen-1-i] != this.buf[bufLen-1-i])
	        {
	            isMatched = false;
	            break;
	        }
	    }
	    return isMatched;
	};
	
	BufferKlassProto.saveToJSON = function ()
	{    
		return { "b" : this.buf,
		         "l" : this.maxLen,
	            };
	};
	
	BufferKlassProto.loadFromJSON = function (o)
	{
	    this.buf = o["b"];
	    this.setMaxLength(o["l"]);
	};
	
	BufferKlassProto.content2string = function (separator)
	{
	    return this.buf.join(separator);
	};		
}());    