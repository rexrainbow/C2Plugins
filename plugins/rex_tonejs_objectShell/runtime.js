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
        this.toneObject = null;
        
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
                self.runtime.trigger(cr.plugins_.Rex_ToneJS_objectshell.prototype.cnds.OnCallback, self); 
            }
            return cb;
        };              
	};

	instanceProto.onDestroy = function ()
	{
        this.CleanToneObject();
	};   

	instanceProto.CleanToneObject = function ()
	{
        if (this.toneObject == null)
            return;
        
        window.ToneJSObjectCall(this.toneObject, "dispose");
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
        var typeName = (this.toneObject)?  this.toneObject["extra"]["type"] : ""; 
        var props = (this.toneObject)?  JSON.stringify(this.toneObject["get"](),null,"\t") : "";

        propsections.push({
            "title": this.type.name,
            "properties": [
                {
                    "name":"Type",
                    "value": typeName,
                    "readonly":true
                },            
                {
                    "name":"Properties",
                    "value": "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+syntaxHighlight(props)+"</style>",
                    "html": true,
                    "readonly":true
                }

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
    

	instanceProto.saveToJSON = function ()
	{
        var o = (this.toneObject)? window.ToneJSObjectSerialize( this.toneObject ) : null;
        // serialize toneObject
        return {
            "obj": o,
        }
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        // clean object
        this.CleanToneObject();
        
        // create toneObject
        this.toneObject = window.ToneJSObjectDeserialize( o["obj"], this.getCallback );
	};
	
	instanceProto.afterLoad = function ()
	{
        if (this.toneObject == null)
            return;
        
        // connect to another objects
        var objectA = this.toneObject;
        var nodes = objectA["extra"]["co"];
        for (var c in nodes)
        {
            var objectB = window.ToneJSGObjects[ c["uid"] ];
            window.ToneJSConnect(objectA, objectB, c["port"]);
        }
	};	    
    
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

	Acts.prototype.CreateObject = function (type, params)
	{
        if (this.toneObject != null)
            this.CleanToneObject();
   
        this.toneObject = window.ToneJSObjectNew(type, params, this.getCallback);
	};     
    
	Acts.prototype.ConnectToMaster = function ()
	{
        var myToneObj = this.GetObject();
        window.ToneJSConnect(myToneObj, window["Tone"]["Master"], "");
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
    
	Acts.prototype.SetByReturn = function (keys, objType, fnName, params)
	{        
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");            
        if (!objType)
            return;
        
        var inst = objType.getFirstPicked(); 
        if (!inst)
            return;
        
        var toneObjectB = inst.GetObject();
        if (!toneObjectB)
            return;  
        
        var retVal = window.ToneJSObjectCall(toneObjectBt, fnName, params, this.getCallback); 
        this.toneObject["set"](keys, retVal);
	};        
    
	Acts.prototype.Call = function (fnName, params)
	{        
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");  
        window.ToneJSObjectCall(this.toneObject, fnName, params, this.getCallback);        
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
    
	Exps.prototype.Property = function (ret, keys)
	{
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");             
        var val = this.toneObject["get"](keys);
		ret.set_any( window.ToneJSGetItemValue(val, keys) );
	}; 
    
	Exps.prototype.ReturnValue = function (ret, keys)
	{        
        assert2(this.toneObject, "Object shell: missing object '"+ this.type.name + "'");             
        var retVal = this.toneObject["extra"]["returnValue"];
		ret.set_any( window.ToneJSGetItemValue(retVal, keys, 0) );
	};     
}());