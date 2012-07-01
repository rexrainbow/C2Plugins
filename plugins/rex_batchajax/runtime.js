// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_BatchAJAX = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_BatchAJAX.prototype;
		
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
		
		this._data = {};
        this._jobs = {};
        this._error_tag = "";
        this._is_process_request = false;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
	};
    
	instanceProto.Request = function (tag_, url_)
	{
		// Create a context object with the tag name and a reference back to this
		var context_obj = { tag: tag_, inst: this };
		
		// Make the request
		jQuery.ajax({
			context: context_obj,
			dataType: "text",
			url: url_,
			success: function(data) {
                if (this.inst._error_tag != "")
                    return;
                    
                var tag = this.tag;
                this.inst._data[tag] = data;
                
                var jobs = this.inst._jobs;
                delete jobs[tag];
                
                var has_item = false;
                var key;                
                for (key in jobs)
                {
                    has_item = true;
                    break;                    
                }
                
                if (!has_item)
                {
                    this._is_process_request = false;
				    this.inst.runtime.trigger(cr.plugins_.Rex_BatchAJAX.prototype.cnds.OnComplete, this.inst);
                }
			},
			error: function() {          
				this.inst._error_tag = this.tag;
                delete this.inst._jobs[this.tag];
				this.inst.runtime.trigger(cr.plugins_.Rex_BatchAJAX.prototype.cnds.OnError, this.inst);
			}
		});
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnComplete = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnError = function ()
	{
		return true;
	};

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.AddRequest = function (tag, url)
	{   
        if (this._is_process_request)
        {
            alert("Error: process other batch request");
            return;
        }
            
        this._jobs[tag] = url;
	}; 
    
	Acts.prototype.RequestStart = function ()
	{
        if (this._is_process_request)
        {
            alert("Error: process other batch request");
            return;
        }
            
        this._error_tag = "";
		var tag;
        var jobs = this._jobs;
        for (tag in jobs)
        {
            this.Request(tag, jobs[tag]); 
        }
	};
    
	Acts.prototype.Clean = function ()
	{     
		this._data = {};
        this._jobs = {};
	};

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Data = function (ret, tag)
	{
		ret.set_string(this._data[tag]);
	};

	Exps.prototype.ErrorTag = function (ret)
	{
		ret.set_string(this._error_tag);
	};    
    

}());