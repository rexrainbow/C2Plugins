// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_JSONBuider = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_JSONBuider.prototype;
		
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
        this.clean();
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
    
	instanceProto.clean = function()
	{
        this.data = null;
        this.current_object = null;
	};
    
	instanceProto.add_object = function (k_, type_)
	{
        var new_object = (type_===0)? []:{};
         // root
        if (this.data === null)
            this.data = new_object;
        else
            this.add_value(k_, new_object);

            
        var previous_object = this.current_object;    
        this.current_object = new_object;
        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
        if (solModifierAfterCnds)
            this.runtime.pushCopySol(current_event.solModifiers);
        
        current_event.retrigger();
        
        if (solModifierAfterCnds)
            this.runtime.popSol(current_event.solModifiers);
            
        this.current_object = previous_object;
		return false;        
	};
    
	instanceProto.add_value = function (k_, v_)
	{
        if (this.current_object == null)
        {
            alert("JSON Builder: Please add a key-value into an object.");
            return;
        }
        
        if (this.current_object instanceof Array)  // add to array
            this.current_object.push(v_);
        else                                                               // add to dictionary
            this.current_object[k_] = v_; 
        
	};     
    
	instanceProto.saveToJSON = function ()
	{
		return { "d": this.data,
                };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.data = o["d"];
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
        var str = JSON.stringify(this.data,null,"\t");

        propsections.push({
            "title": "JSON builder",
            "properties": [
                {
                    "name":"content",
                    "value": "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+syntaxHighlight(str)+"</style>",
                    "html": true,
                    "readonly":true
                }
            ]
        });
    };
    /**END-PREVIEWONLY**/    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.AddObject = function (k_, type_)
	{
        return this.add_object(k_, type_);
	};

	Cnds.prototype.SetRoot = function (type_)
	{
        this.clean();
        return this.add_object("", type_);
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Clean = function ()
	{     
        this.clean();
	}; 

    Acts.prototype.AddValue = function (k_, v_)
	{
        this.add_value(k_, v_);
	};     

    Acts.prototype.AddBooleanValue = function (k_, v_)
	{
        this.add_value(k_, (v_ === 1));
	};   

    Acts.prototype.AddNullValue = function (k_)
	{
        this.add_value(k_, null);
	};   
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.AsJSON = function (ret)
	{
	    ret.set_string( JSON.stringify(this.data) );
	};
    
}());