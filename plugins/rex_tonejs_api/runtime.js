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
        
        this.toneObjects = {};
        
        // callback
        this.callbackTag = "";   
        this.params = [];   
        var self=this;
        this.getCallback = function(callbackTag)
        {
            if (callbackTag == null)
                return null;
        
            var cb = function ()
            {
                self.callbackTag = callbackTag;
                cr.shallowAssignArray(self.params, arguments);
                self.runtime.trigger(cr.plugins_.Rex_ToneJS_api.prototype.cnds.OnCallback, self); 
            }
            return cb;
        };          
        
        /**BEGIN-PREVIEWONLY**/
        this.dbg_varName = "";
        /**END-PREVIEWONLY**/           
	};
    
	instanceProto.onDestroy = function ()
	{
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
        var object2Type = {};
        for (var varName in this.toneObjects)
        {
            object2Type[varName] = this.toneObjects[varName]["extra"]["type"];
        }
        object2Type = JSON.stringify(object2Type,null,"\t");
        
        var toneObject = this.toneObjects[this.dbg_varName];
        toneObject = (toneObject)? JSON.stringify(toneObject["get"](),null,"\t") : "";

        propsections.push({
            "title": "Tone objects",
            "properties": [
                {
                    "name":"Objects",
                    "value": "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+syntaxHighlight(object2Type)+"</style>",
                    "html": true,
                    "readonly":true
                },
                {
                    "name":"Name",
                    "value": this.dbg_varName,
                },                
                {
                    "name":"Properties",
                    "value": "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+syntaxHighlight(toneObject)+"</style>",
                    "html": true,
                    "readonly":true
                },
            ]
        });
    };
    
    instanceProto.onDebugValueEdited = function (header, name, value)
    {
		if (name == "Name")    // change page
		{
		    this.dbg_varName = value;
		}
    };
    /**END-PREVIEWONLY**/  
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnCallback = function (tag)
	{
		return cr.equals_nocase(tag, this.callbackTag);
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.CreateObject = function (varName, type, params)
	{
        var toneObject = this.toneObjects[varName];
        if (toneObject != null)
        {
            toneObject["dispose"]();
            toneObject = null;
        }
        
        this.objectType = type;      
        this.toneObjects[varName] = window.ToneJSObjectNew(type, params, this.getCallback);
	};     
    
	Acts.prototype.Connect = function (varNameA, varNameB, port)
	{
        var toneObjectA = this.toneObjects[varNameA];
        var toneObjectB = this.toneObjects[varNameB];
        assert2(toneObjectA, "ToneJS API: missing object '"+ varNameA + "'");      
        assert2(toneObjectB, "ToneJS API: missing object '"+ varNameB + "'"); 
        if (!toneObjectA || !toneObjectB)
            return;
        
        window.ToneJSConnect(toneObjectA, toneObjectB, port);
	};   
    
	Acts.prototype.SetValue = function (varName, keys, value)
	{       
        var toneObject = this.toneObjects[varName];
        assert2(toneObject, "ToneJS API: missing object '"+ varName + "'");      
        toneObject["set"](keys, value);
	};
     
	Acts.prototype.SetJSON = function (varName, keys, value)
	{
        var toneObject = this.toneObjects[varName];
        assert2(toneObject, "ToneJS API: missing object '"+ varName + "'");      
        toneObject["set"](keys, JSON.parse(value));
	};    
     
	Acts.prototype.SetBoolean = function (varName, keys, value)
	{
        var toneObject = this.toneObjects[varName];
        assert2(toneObject, "ToneJS API: missing object '"+ varName + "'");      
        toneObject["set"](keys, (value === 1));
	};     
    
	Acts.prototype.SetJSONProps = function (varName, params)
	{
        var toneObject = this.toneObjects[varName];
        assert2(toneObject, "ToneJS API: missing object '"+ varName + "'");      
        toneObject["set"](JSON.parse(params));      
	};  
    
	Acts.prototype.Call = function (varName, fnName, params)
	{        
        var toneObject = this.toneObjects[varName];
        assert2(toneObject, "ToneJS API: missing object '"+ varName + "'");      
        window.ToneJSObjectCall(toneObject, fnName, params, this.getCallback);        
	};
        
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Param = function (ret, index, keys)
	{             
        var val = this.params[index];        
		ret.set_any( window.ToneJSGetItemValue(val, keys) );
	}; 
    
	Exps.prototype.Property = function (ret, varName, keys)
	{
        var toneObject = this.toneObjects[varName];
        assert2(toneObject, "ToneJS API: missing object '"+ varName + "'");  
        
        var val = toneObject["get"](keys);
		ret.set_any( window.ToneJSGetItemValue(val, keys) );
	}; 

    
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------    
    // ------------------------------------------------------------------------    
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
    
    
	var createObject = function (type, params, getCallback)
	{
        var toneObject;
        if ((type === "Master") || (type === "Transport") || (type === "Listener"))
        {
            toneObject = window["Tone"][type];
        }       
        else
        {
            var options = params[0];
            var isOptionMode = (typeof(options) === "string") && (options.indexOf("{") !== -1);            
            if (isOptionMode)
            {
                options = JSON.parse(options);  
                params[0] = options;            
            }

            // instrument
            if (type === "PolySynth")
            {
                if (isOptionMode)
                    options["voice"] = window["Tone"][ options["voice"] ];
                else if (params[1] != null)
                    params[1] = window["Tone"][ params[1] ];
            }
            else if (type === "Sampler")
            {
                var callbackTag = params[1];
                
                if (callbackTag != null)
                {            
                    var onload = getCallback(callbackTag);                    
                    if (isOptionMode)
                        options["onload"] = onload;
                    else
                        params[1] = onload;
                }
            }
            // instrument   
            
            // effect
            else if (type === "Convolver")
            {
                var callbackTag = params[1];
                if (callbackTag != null)
                {                
                    var onload = getCallback(callbackTag);                    
                    if (isOptionMode)
                        options["onload"] = onload;
                    else
                        params[1] = onload;
                }
            } 
            // effect

            // source            
            else if ((type === "Player") || (type === "GrainPlayer"))
            {
                var callbackTag = params[1];
                if (callbackTag != null)
                {     
                    var onload = getCallback(callbackTag);
                    if (isOptionMode)
                        options["onload"] = onload;
                    else
                        params[1] = onload;
                }
            }
            else if (type === "MultiPlayer")
            {
                var callbackTag = params[1];
                if (callbackTag != null)
                { 
                    var onload = getCallback(callbackTag);
                    isOptionMode = options.hasOwnProperty("buffers");
                    if (isOptionMode)
                        options["onload"] = onload;
                    else
                        params[1] = onload;
                }
            }                        
            // source
            
            // event            
            else if (type === "Loop")
            {
                var callbackTag = params[0];
                if (callbackTag != null)
                {     
                    var onload = getCallback(callbackTag);
                    if (isOptionMode)
                        options["callback"] = onload;
                    else
                        params[0] = onload;
                }
            }
            else if ((type === "Part") || (type === "Pattern") || (type === "Sequence"))
            {
                var callbackTag = params[0];
                if (callbackTag != null)
                {     
                    var onload = getCallback(callbackTag);
                    if (isOptionMode)
                        options["callback"] = onload;
                    else
                        params[0] = onload;
                }
                
                if (!isOptionMode)
                {
                    params[1] = JSON.parse( params[1] );
                }
            }            
            // event         
            
            // reference: http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible/#1608546
            params.unshift(null);
            toneObject = new (Function.prototype.bind.apply(window["Tone"][type], params));
        }
        
        toneObject["extra"] = {};
        toneObject["extra"]["type"] = type;
        return toneObject;
	};     
    window.ToneJSObjectNew = createObject;      
        
    var isType = function(o, type)
    {
        return (o instanceof window["Tone"][type]);
    }     
	var objectCall = function (toneObject, fnName, params, getCallback)
	{        
        var i, cnt=params.length;
        for (i=0; i<cnt; i++)
        {
            if (typeof(params[i]) === "string")
            {
                if ((params[i].indexOf("{") !== -1) || (params[i].indexOf("[") !== -1))
                    params[i] = JSON.parse(params[i]);
            }
        }
        
        // source
        if (isType(toneObject, "Player"))
        {
            if (fnName === "load")
            {
                params[1] = getCallback(params[1]); 
            }
        }
        else if (isType(toneObject, "MultiPlayer"))
        {
            if (fnName === "add")
            {
                params[2] = getCallback(params[2]);
            }
        }   
        else if (isType(toneObject, "Microphone"))
        {
            if (fnName === "open")
            {
                params[0] = getCallback(params[0]); 
                params[1] = getCallback(params[1]);
            }
        }   
        // source
        
        toneObject[fnName].apply(toneObject, params);         
	};
    window.ToneJSObjectCall = objectCall;
}());