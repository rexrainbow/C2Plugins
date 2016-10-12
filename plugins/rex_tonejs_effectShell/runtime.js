// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_effectshell = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_effectshell.prototype;
		
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
        this.effectType = "";
        this.effect = null;
	};
    
	instanceProto.onDestroy = function ()
	{
        if (this.effect == null)
            return;
        
        this.effect["dispose"]();
        this.effectType = "";        
        this.effect = null;
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
        var props = (this.effect)?  JSON.stringify(this.effect["get"](),null,"\t") : "";

        propsections.push({
            "title": "JSON",
            "properties": [
                {
                    "name":"Type",
                    "value": this.effectType,
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
        assert2(this.effect, "Effect shell: missing effect '"+ this.type.name + "'");                
        return this.effect;
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

	Acts.prototype.CreateEffect = function (type, params)
	{
        if (this.effect !== null)
            this.onDestroy();
        
        this.effectType = type;            
        var options = params[0];
        if (options == null)
        {
            options = {};
        }
        else if ((typeof(options) === "string") && (options.indexOf("{") !== -1))
        {
            options = JSON.parse(options);         
        }
        else if (type === "AutoFilter")
        {
            options = {}
            var frequency = params[0];
            if (frequency != null)
                options["frequency"] = frequency;
            
            var baseFrequency = params[1];
            if (baseFrequency != null)
                options["baseFrequency"] = baseFrequency;
            
            var octaves = params[2];
            if (octaves != null)
                options["octaves"] = octaves;  
            
        }
        else if (type === "AutoPanner")
        {
            options = {}
            var frequency = params[0];
            if (frequency != null)
                options["frequency"] = frequency;
            
        } 
        else if (type === "AutoWah")
        {
            options = {}
            var frequency = params[0];
            if (frequency != null)
                options["frequency"] = frequency;
            
            var octaves = params[1];
            if (octaves != null)
                options["octaves"] = octaves;       
            
            var sensitivity = params[2];
            if (sensitivity != null)
                options["sensitivity"] = sensitivity;  
                             
        } 
        else if (type === "BitCrusher")
        {
            options = {}
            var bits = params[0];
            if (bits != null)
                options["bits"] = bits;

        }
        else if (type === "Chebyshev")
        {
            options = {}
            var order = params[0];
            if (order != null)
                options["order"] = order;
                           
        } 
        else if (type === "Chorus")
        {
            options = {}
            var frequency = params[0];
            if (frequency != null)
                options["frequency"] = frequency;
            
            var delayTime = params[1];
            if (delayTime != null)
                options["frequency"] = delayTime;  
            
            var depth = params[2];
            if (depth != null)
                options["depth"] = depth;  

        }         
        else if (type === "Convolver")
        {
            options = {}
            var url = params[0];
            if (url != null)
                options["url"] = url;            
            
            // add onload later
        }
        else if (type === "Distortion")
        {
            options = {};
            var distortion = params[0];
            if (distortion != null)
                options["distortion"] = distortion;

        }  
        else if (type === "Effect")
        {
            options = {};
            var wet = params[0];
            if (wet != null)
                options["wet"] = wet;

        }          
        else if (type === "FeedbackDelay")
        {
            options = {};
            var delayTime = params[0];
            if (delayTime != null)
                options["delayTime"] = delayTime;
            
            var feedback = params[1];
            if (feedback != null)
                options["feedback"] = feedback;            

        }                  
        else if (type === "FeedbackEffect")
        {
            options = {};
            var feedback = params[0];
            if (feedback != null)
                options["feedback"] = feedback;       

        }
        else if (type === "Freeverb")
        {
            options = {};
            var roomSize = params[0];
            if (roomSize != null)
                options["roomSize"] = roomSize;   

            var dampening = params[1];
            if (dampening != null)
                options["dampening"] = dampening;               
      
        }        
        else if (type === "JCReverb")
        {
            options = {};
            var roomSize = params[0];
            if (roomSize != null)
                options["roomSize"] = roomSize;          
         
        }
        else if (type === "Phaser")
        {
            options = {};
            var frequency = params[0];
            if (frequency != null)
                options["frequency"] = frequency;     

            var octaves = params[1];
            if (octaves != null)
                options["octaves"] = octaves;    

            var baseFrequency = params[2];
            if (baseFrequency != null)
                options["baseFrequency"] = baseFrequency;    
      
        }
        else if (type === "PingPongDelay")
        {
            options = {};
            var delayTime = params[0];
            if (delayTime != null)
                options["delayTime"] = delayTime;     

            var feedback = params[1];
            if (feedback != null)
                options["feedback"] = feedback;    
  
        }
        else if (type === "PitchShift")
        {
            options = {};
            var pitch = params[0];
            if (pitch != null)
                options["pitch"] = pitch;
            
        }      
        else if (type === "StereoWidener")
        {
            options = {};
            var width = params[0];
            if (width != null)
                options["width"] = width;   
   
        }
        else if (type === "Tremolo")
        {
            options = {};
            var frequency = params[0];
            if (frequency != null)
                options["frequency"] = frequency; 

            var depth = params[1];
            if (depth != null)
                options["depth"] = depth;             
    
        }
        else if (type === "Vibrato")
        {
            options = {};
            var frequency = params[0];
            if (frequency != null)
                options["frequency"] = frequency; 

            var depth = params[1];
            if (depth != null)
                options["depth"] = depth;             
 
        }  
        
        if (type === "Convolver")
        {
            var self=this;
            var onload = function ()
            {
                self.runtime.trigger(cr.plugins_.Rex_ToneJS_effectshell.prototype.cnds.OnLoad, self); 
            }
            options["onload"] = onload;
        }
        
        this.effect = new window["Tone"][type]( options );
        
	};     
    
	Acts.prototype.Dispose = function ()
	{        
        assert2(this.effect, "Effect shell: missing effect '"+ this.type.name + "'");    
        this.effect["dispose"]();
	};
    
	Acts.prototype.Plug = function (objType)
	{
        assert2(this.effect, "Effect shell: missing effect '"+ this.type.name + "'");            
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
        assert2(this.effect, "Effect shell: missing effect '"+ this.type.name + "'");            
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
        assert2(this.effect, "Effect shell: missing effect '"+ this.type.name + "'");    
        this.effect["set"](keys, value);
	};
     
	Acts.prototype.SetJSON = function (keys, value)
	{
        assert2(this.effect, "Effect shell: missing effect '"+ this.type.name + "'");                  
        this.effect["set"](keys, JSON.parse(value));
	};    
     
	Acts.prototype.SetBoolean = function (keys, value)
	{
        assert2(this.effect, "Effect shell: missing effect '"+ this.type.name + "'");      
        this.effect["set"](keys, (value === 1));
	};     
    
	Acts.prototype.SetJSONProps = function (params)
	{        
        assert2(this.effect, "Effect shell: missing effect '"+ this.type.name + "'");             
        this.effect["set"](JSON.parse(params));      
	};  
    
	Acts.prototype.Start = function (params)
	{        
        assert2(this.effect, "Effect shell: missing effect '"+ this.type.name + "'");  
        this.effect["start"].apply(this.effect, params);         
	};
    
	Acts.prototype.Stop = function (params)
	{        
        assert2(this.effect, "Effect shell: missing effect '"+ this.type.name + "'");  
        this.effect["stop"].apply(this.effect, params);         
	};    
    
	Acts.prototype.Sync = function (params)
	{        
        assert2(this.effect, "Effect shell: missing effect '"+ this.type.name + "'");  
        this.effect["sync"].apply(this.effect, params);         
	};  
    
	Acts.prototype.Unsync = function (params)
	{        
        assert2(this.effect, "Effect shell: missing effect '"+ this.type.name + "'");  
        this.effect["unsync"].apply(this.effect, params);         
	};

    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());