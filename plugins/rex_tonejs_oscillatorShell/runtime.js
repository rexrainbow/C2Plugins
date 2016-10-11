// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_oscillatortshell = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_oscillatortshell.prototype;
		
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
        this.oscillatorType = "";
        this.oscillator = null;
	};
    
	instanceProto.onDestroy = function ()
	{
        if (this.oscillator == null)
            return;
        
        this.oscillator["dispose"]();
        this.oscillatorType = "";        
        this.oscillator = null;
	};   
    
    
    // The comments around these functions ensure they are removed when exporting, since the
    // debugger code is no longer relevant after publishing.
    /**BEGIN-PREVIEWONLY**/

    // slightly modified neet simple function from Pumbaa80
    // http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript#answer-7220510
    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); // basic html escaping
        return json
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'red';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'blue';
                    } else {
                        cls = 'green';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'Sienna';
                } else if (/null/.test(match)) {
                    cls = 'gray';
                }
                return '<span style="color:' + cls + ';">' + match + '</span>';
            })
            .replace(/\t/g,"&nbsp;&nbsp;") // to keep indentation in html
            .replace(/\n/g,"<br/>");       // to keep line break in html
    }

    instanceProto.getDebuggerValues = function (propsections)
    {
        // Append to propsections any debugger sections you want to appear.
        // Each section is an object with two members: "title" and "properties".
        // "properties" is an array of individual debugger properties to display
        // with their name and value, and some other optional settings.
        var props = (this.oscillator)?  JSON.stringify(this.oscillator["get"](),null,"\t") : "";

        propsections.push({
            "title": "JSON",
            "properties": [
                {
                    "name":"Type",
                    "value": this.oscillatorType,
                    "readonly":true
                },            
                {
                    "name":"Properties",
                    "value": "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+syntaxHighlight(props)+"</style>",
                    "html": true,
                    "readonly":true
                }

                // Each property entry can use the following values:
                // "name" (required): name of the property (must be unique within this section)
                // "value" (required): a boolean, number or string for the value
                // "html" (optional, default false): set to true to interpret the name and value
                //                                   as HTML strings rather than simple plain text
                // "readonly" (optional, default false): set to true to disable editing the property
                
                // Example:
                // {"name": "My property", "value": this.myValue}
            ]
        });
    };
    
    instanceProto.onDebugValueEdited = function (header, name, value)
    {
        // Called when a non-readonly property has been edited in the debugger. Usually you only
        // will need 'name' (the property name) and 'value', but you can also use 'header' (the
        // header title for the section) to distinguish properties with the same name.
        // if (name === "My property")
        //  this.myProperty = value;
    };
    /**END-PREVIEWONLY**/  
    
    // export
	instanceProto.GetObject = function ()
	{
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");                
        return this.oscillator;
	};     
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnLoad = function ()
	{
	    return true;
	}; 
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.CreateOscillator = function (oscillatorType, params)
	{
        if (this.oscillator !== null)
            this.onDestroy();
            
        this.oscillatorType = oscillatorType;               
        var options = params[0];
        if (options == null)
        {
            options = {};
        }        
        else if ((typeof(options) === "string") && (options.indexOf("{") !== -1))
        {
            options = JSON.parse(options);         
        }
        else if ((type === "Oscillator") || (type === "OmniOscillator"))
        {            
            options = {};
            var frequency = params[0];
            if (frequency != null)
                options["frequency"] = frequency;
            
            var type = params[1];
            if (type != null)
                options["type"] = type;
        }
        else if ((type === "AMOscillator") || (type === "FMOscillator") || (type === "FatOscillator"))
        {
            options = {};
            var frequency = params[0];
            if (frequency != null)
                options["frequency"] = url;
            
            var type = params[1];
            if (type != null)
                options["type"] = type;   
            
            var modulationType = params[2];
            if (modulationType != null)
                options["modulationType"] = modulationType;  
        }
        else if (type === "PWMOscillator")
        {
            options = {};
            var frequency = params[0];
            if (frequency != null)
                options["frequency"] = url;

            var modulationType = params[1];
            if (modulationType != null)
                options["modulationType"] = modulationType;  
        }
        else if (type === "PWMOscillator")
        {
            options = {};
            var frequency = params[0];
            if (frequency != null)
                options["frequency"] = url;

            var width = params[1];
            if (width != null)
                options["width"] = width;  
        }        
        else if (type === "Noise")
        {
            options = {};
            var type = params[0];
            if (type != null)
                options["type"] = type;   
        }         
        
        this.oscillator = new window["Tone"][oscillatorType](options);
	};     
    
	Acts.prototype.Dispose = function ()
	{        
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");    
        this.oscillator["dispose"]();
	};
    
	Acts.prototype.SetValue = function (keys, value)
	{        
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");    
        this.oscillator["set"](keys, value);
	};
     
	Acts.prototype.SetJSON = function (keys, value)
	{
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");                  
        this.oscillator["set"](keys, JSON.parse(value));
	};    
     
	Acts.prototype.SetBoolean = function (keys, value)
	{
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");      
        this.oscillator["set"](keys, (value === 1));
	};     
    
	Acts.prototype.SetJSONProps = function (params)
	{        
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");             
        this.oscillator["set"](JSON.parse(params));      
	};  
    
	Acts.prototype.Start = function (params)
	{        
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");            
        this.oscillator["start"].apply(this.oscillator, params);         
	};  
    
	Acts.prototype.Stop = function (params)
	{
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");
        this.oscillator["stop"].apply(this.oscillator, params);    
	};   
    
	Acts.prototype.Sync = function ()
	{
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");                
        this.oscillator["sync"]();     
	};   
    
	Acts.prototype.Unsync = function ()
	{
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");                
        this.oscillator["unsync"]();     
	};   
    
	Acts.prototype.SyncFrequency = function (params)
	{
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");
        this.oscillator["syncFrequency"].apply(this.oscillator, params);    
	};   
    
	Acts.prototype.UnsyncFrequency = function ()
	{
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");                
        this.oscillator["unsyncFrequency"]();     
	};       
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Property = function (ret, keys)
	{
        assert2(this.oscillator, "Oscillator shell: missing oscillator '"+ this.type.name + "'");                
        var val = this.oscillator["get"](keys);
		ret.set_any( window.ToneJSGetItemValue(val) );
	}; 
}());