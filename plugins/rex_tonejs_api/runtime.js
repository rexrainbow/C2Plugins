// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_api = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_api.prototype;
		
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
        var transport = window["Tone"]["Transport"];
        
        if (this.properties[0] === 1)
            transport["start"]();        
        
        transport["set"]("bpm", this.properties[1]);
	};
    
	instanceProto.onDestroy = function ()
	{
	};   

    var forEachInst = function(objType, callback)
    {
        if (!objType)
            return;
        
        var insts = objType.getCurrentSol().getObjects();
        var i,cnt=insts.length;
        for (i=0; i<cnt; i++)
            callback(insts[i]);        
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
        var transport = JSON.stringify(window["Tone"]["Transport"]["get"](),null,"\t");

        propsections.push({
            "title": "JSON",
            "properties": [
                {
                    "name":"Transport",
                    "value": "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+syntaxHighlight(transport)+"</style>",
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
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.SetBPM = function (bpm)
	{
        window["Tone"]["Transport"]["set"]("bpm", bpm);
	};    
    
	Acts.prototype.StartTimeline = function (time, offset)
	{
        window["Tone"]["Transport"]["start"](time, offset);  
	};       
    
	Acts.prototype.StopTimeline = function (time)
	{
        window["Tone"]["Transport"]["stop"](time);  
	};    
    
	Acts.prototype.PauseTimeline = function (time)
	{
        window["Tone"]["Transport"]["pause"](time);  
	};  
    
	Acts.prototype.SetValue = function (objType, keys, value)
	{
        var self=this;
        var callback = function(inst)
        {
            var toneObj = inst.GetObject();
            if (!toneObj)
                return;
            
            toneObj["set"](keys, value);     
        }
        
        forEachInst(objType, callback);
	};
     
	Acts.prototype.SetJSON = function (objType, keys, value)
	{
        var self=this;
        var callback = function(inst)
        {
            var toneObj = inst.GetObject();
            if (!toneObj)
                return;
            
            toneObj["set"](keys, JSON.parse(value));
        }
        
        forEachInst(objType, callback);
	};    
     
	Acts.prototype.SetBoolean = function (objType, keys, value)
	{
        value = (value === 1);
        
        var self=this;
        var callback = function(inst)
        {
            var toneObj = inst.GetObject();
            if (!toneObj)
                return;
            
            toneObj["set"](keys, value);
        }
        
        forEachInst(objType, callback);
	};     
    
	Acts.prototype.SetJSON = function (objType, params)
	{            
        var self=this;
        var callback = function(inst)
        {
            var toneObj = inst.GetObject();
            if (!toneObj)
                return;
            
            toneObj["set"](JSON.parse(params));
        }
        
        forEachInst(objType, callback);       
	};  
        
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Now = function (ret)
	{
		ret.set_float(window["Tone"]["now"]());
	};

	Exps.prototype.Property = function (ret, uid, keys)
	{
        var val = 0;
        var inst = this.runtime.getObjectByUID(uid);
        if (inst)
        {
            val = inst.GetObject()["get"](keys);
        }
		ret.set_any( window.ToneJSGetItemValue(val) );
	};    
    

 	var getItemValue = function (item, k, default_value)
	{
        var v;
	    if (item == null)
            v = null;
        else if ( (k == null) || (k === "") )
            v = item;
        else if (k.indexOf(".") == -1)
            v = item[k];
        else
        {
            var kList = k.split(".");
            v = item;
            var i,cnt=kList.length;
            for(i=0; i<cnt; i++)
            {
                if (typeof(v) !== "object")
                {
                    v = null;
                    break;
                }
                    
                v = v[kList[i]];
            }
        }

        return din(v, default_value);
	};	    
    
    var din = function (d, default_value)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (d == null)
        {
            if (default_value != null)
                o = default_value;
            else
                o = 0;
        }
        else if (typeof(d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
	    return o;
    };    
    window.ToneJSGetItemValue = getItemValue;    
    
    var connect = function(a, b, port)
    {
        if ((typeof(port) === "string") && (port !== ""))
            b = b[port];
        
        a["connect"](b);
    }
    window.ToneJSConnect = connect;       
    
}());