// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Lzstring = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Lzstring.prototype;
		
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
        this.setEncoding(this.properties[0]);
	};
    
    var CompressFnNames = ["compress", "compressToBase64", "compressToUTF16", "compressToEncodedURIComponent"];
    var DecompressFnNames = ["decompress", "decompressFromBase64", "decompressFromUTF16", "decompressFromEncodedURIComponent"];    
	instanceProto.setEncoding = function(m)
	{
        this.compressFn = CompressFnNames[m];
        this.decompressFn = DecompressFnNames[m];
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	Acts.prototype.SetEncodingMode = function (m)	
	{
        this.setEncoding(m);
	};    
    
    // deprecated
	Acts.prototype.StoreLocal = function(key, data) { };
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.Compress = function (ret, s)
	{
		var result = window["LZString"][ this.compressFn ](s);
		if (typeof(result) !== "string")
		{
			result = "";
		}
	    ret.set_string( result );
	};
    Exps.prototype.Decompress = function (ret, s)
	{
		var result = window["LZString"][ this.decompressFn ](s);
		if (typeof(result) !== "string")
		{
			result = "";
		}
	    ret.set_string( result );		
	};    
	
    // deprecated    
    Exps.prototype.LocalValue = function (ret, _key, _default) { ret.set_any( 0 ); };	
}());