// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_CopyToClipboard = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_CopyToClipboard.prototype;
		
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
        this.content = "";
        this.succeed = false;
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
    
    // reference: http://stackoverflow.com/questions/22581345/click-button-copy-to-clipboard-using-jquery
    var copyToClipboard = function(s) 
    {
    	  // create hidden text element, if it doesn't already exist
        var targetId = "_hiddenCopyText_";
        // must use a temporary form element for the selection and copy
        target = document["getElementById"](targetId);
        if (!target) 
        {
            var target = document["createElement"]("textarea");
            target["style"]["position"] = "absolute";
            target["style"]["left"] = "-9999px";
            target["style"]["top"] = "0";
            target["id"] = targetId;
            document.body.appendChild(target);
        }
        target["textContent"] = s;
    
        // select the content
        var currentFocus = document["activeElement"];
        target.focus();
        target["setSelectionRange"](0, target["value"].length);
        
        // copy the selection
        var succeed;
        try 
        {
        	  succeed = document["execCommand"]("copy");
        } 
        catch(e) 
        {
            succeed = false;
        }
        // restore original focus
        if (currentFocus && typeof currentFocus["focus"] === "function") 
        {
            currentFocus["focus"]();
        }
        
        target["textContent"] = "";
        return succeed;
    };
    
	instanceProto.saveToJSON = function ()
	{
		return {
			"c": this.content,
			"s": this.succeed,
		};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.content = o["c"];
		this.succeed = o["s"];
	};
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.IsSuccess = function ()
	{
		return this.succeed;
	};

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.Copy = function (s)
	{
        this.content = s;
        this.succeed = copyToClipboard(s)
	}; 

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.Content = function (ret)
	{
	    ret.set_string( this.content );
	};
    
}());