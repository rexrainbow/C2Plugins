// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_objectshell = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_objectshell.prototype;
		
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
        this.objectType = "";
        this.toneObject = null;
	};
    
	instanceProto.onDestroy = function ()
	{
        if (this.toneObject == null)
            return;
        
        if (this.objectType !== "Master")
            this.toneObject["dispose"]();
        
        this.objectType = "";        
        this.toneObject = null;
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
        var props = (this.toneObject)?  JSON.stringify(this.toneObject["get"](),null,"\t") : "";

        propsections.push({
            "title": "JSON",
            "properties": [
                {
                    "name":"Type",
                    "value": this.objectType,
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
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");                
        return this.toneObject;
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

	Acts.prototype.CreateObject = function (type, params)
	{
        if (this.toneObject !== null)
            this.onDestroy();
        
        this.objectType = type;
        if (type === "Master")
        {
            this.toneObject = window["Tone"]["Master"];
        }
        else if (params instanceof Array)
        {
            params.unshift(null);
            this.toneObject = new (Function.prototype.bind.apply(window["Tone"][type], params));
        }
        else
            this.toneObject = new window["Tone"][type]( params );
	};     
    
	Acts.prototype.Dispose = function ()
	{        
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");    
        this.toneObject["dispose"]();
	};
    
	Acts.prototype.Plug = function (objType)
	{
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");            
        if (!objType)
            return;
        
        var insts = objType.getCurrentSol().getObjects();
        var i,cnt=insts.length, toneObj, myToneObj=this.GetObject();
        for (i=0; i<cnt; i++)
        {
            toneObj = insts[i].GetObject(); 
            toneObj["connect"]( myToneObj );         
        }
	};        
    
    
	Acts.prototype.Connect = function (objType, port)
	{
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");            
        if (!objType)
            return;
        
        var insts = objType.getCurrentSol().getObjects();
        var i,cnt=insts.length, toneObj, myToneObj=this.GetObject();
        for (i=0; i<cnt; i++)
        {
            toneObj = insts[i].GetObject(); 
            window.ToneJSConnect(myToneObj, toneObj, port);
        }
	};   
    
	Acts.prototype.SetValue = function (keys, value)
	{        
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");    
        this.toneObject["set"](keys, value);
	};
     
	Acts.prototype.SetJSON = function (keys, value)
	{
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");                  
        this.toneObject["set"](keys, JSON.parse(value));
	};    
     
	Acts.prototype.SetBoolean = function (keys, value)
	{
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");      
        this.toneObject["set"](keys, (value === 1));
	};     
    
	Acts.prototype.SetJSONProps = function (params)
	{        
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");             
        this.toneObject["set"](JSON.parse(params));      
	};  
    
	Acts.prototype.Call = function (fnName, params)
	{        
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");  
        this.toneObject[fnName].apply(this.toneObject, params);         
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());