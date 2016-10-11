// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_multiplayer = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_multiplayer.prototype;
		
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
        this.sourceType = "";
        this.player = null;
	};
    
	instanceProto.onDestroy = function ()
	{
        if (this.player == null)
            return;
        
        this.player["dispose"]();
        this.sourceType = "";        
        this.player = null;
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
        var props = (this.player)?  JSON.stringify(this.player["get"](),null,"\t") : "";

        propsections.push({
            "title": "JSON",
            "properties": [
                {
                    "name":"Type",
                    "value": this.sourceType,
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
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");                
        return this.player;
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

	Acts.prototype.CreatePlayer = function (url)
	{
        if (this.player !== null)
            this.onDestroy();
            
        var self=this;
        var onload = function ()
        {
            self.runtime.trigger(cr.plugins_.Rex_ToneJS_multiplayer.prototype.cnds.OnLoad, self); 
        }
            
        this.sourceType = "MultiPlayer";
        this.player = new window["Tone"][this.sourceType](JSON.parse(url), onload);
	};     
    
	Acts.prototype.Dispose = function ()
	{        
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");    
        this.player["dispose"]();
	};
    
	Acts.prototype.SetValue = function (keys, value)
	{        
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");    
        this.player["set"](keys, value);
	};
     
	Acts.prototype.SetJSON = function (keys, value)
	{
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");                  
        this.player["set"](keys, JSON.parse(value));
	};    
     
	Acts.prototype.SetBoolean = function (keys, value)
	{
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");      
        this.player["set"](keys, (value === 1));
	};     
    
	Acts.prototype.SetJSONProps = function (params)
	{        
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");             
        this.player["set"](JSON.parse(params));      
	};  
    
	Acts.prototype.Start = function (buffer, time, offset, duration, pitch, gain)
	{        
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");
        
        var params = [buffer, time, offset, duration, pitch, gain];
        if (time === "")
            params.length = 1;
        else if (offset === "")
            params.length = 2;    
        else if (duration === "")
            params.length = 3;
        else if (pitch === "")
            params.length = 4;
        else if (gain === "")
            params.length = 5;        
        
        this.player["start"].apply(this.player, params);         
	};  
    
	Acts.prototype.Stop = function (buffer, time)
	{
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");
        
        var params = [buffer, time];
        if (time === "")
            params.length = 1;
        
        this.player["stop"].apply(this.player, params);    
	};   
    
	Acts.prototype.StopAll = function (time)
	{
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");
        
        var params = [time];
        if (time === "")
            params.length = 1;
        
        this.player["stopAll"].apply(this.player, params);    
	};
    
	Acts.prototype.StarttLoop = function (buffer, time, offset, loopStart, loopEnd, pitch, gain)
	{        
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");
        
        var params = [buffer, time, offset, loopStart, loopEnd, pitch, gain];
        if (time === "")
            params.length = 1;
        else if (offset === "")
            params.length = 2;    
        else if (loopStart === "")
            params.length = 3;
        else if (loopEnd === "")
            params.length = 4;        
        else if (pitch === "")
            params.length = 5;
        else if (gain === "")
            params.length = 6;        
        
        this.player["startLoop"].apply(this.player, params);         
	};      

	Acts.prototype.Sync = function ()
	{
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");               
        this.player["sync"]();     
	};   
    
	Acts.prototype.Unsync = function ()
	{
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");             
        this.player["unsync"]();     
	};   

	Acts.prototype.Add = function (name, url)
	{
        var self=this;
        var onload = function ()
        {
            self.runtime.trigger(cr.plugins_.Rex_ToneJS_multiplayer.prototype.cnds.OnLoad, self); 
        }
        this.player["load"](name, url, onload);
	};     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Property = function (ret, keys)
	{
        assert2(this.player, "MultiPlayer: missing player '"+ this.type.name + "'");                
        var val = this.player["get"](keys);
		ret.set_any( window.ToneJSGetItemValue(val) );
	}; 
}());