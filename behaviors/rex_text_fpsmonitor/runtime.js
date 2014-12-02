// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_text_fpsmonitor = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_text_fpsmonitor.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{  
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{         
	    this.activated = (this.properties[0] == 1);
	    this.current_fps_enable = (this.properties[1] == 1);
	    this.minimum_fps_enable = (this.properties[2] == 1);
	    this.maximum_fps_enable = (this.properties[3] == 1);	
	    this.average_fps_enable = (this.properties[4] == 1);
        this.cpuutilisation_enable = (this.properties[5] == 1);
        this._text_type = ""; 
        this._set_text_handler = this._set_text_handler_get();        
	    this._reset();       
	};  

	behinstProto._text_type_get = function ()
	{
	    var text_type;
        if (cr.plugins_.Text &&
		    (this.inst instanceof cr.plugins_.Text.prototype.Instance))		
	        text_type = "Text";	    
	    else if (cr.plugins_.Spritefont2 &&
		         (this.inst instanceof cr.plugins_.Spritefont2.prototype.Instance))
			text_type = "Spritefont2";	  
	    else if (cr.plugins_.rex_TagText &&
		         (this.inst instanceof cr.plugins_.rex_TagText.prototype.Instance))
		    text_type = "rex_TagText";
		else
		    text_type = "";	 
		return text_type;
	};
    
	behinstProto._set_text_handler_get = function ()
	{
	    this.text_type = this._text_type_get();
	    var set_text_handler;
        if (this.text_type == "Text")		
	        set_text_handler = cr.plugins_.Text.prototype.acts.SetText;	    
	    else if (this.text_type == "Spritefont2")	
			set_text_handler = cr.plugins_.Spritefont2.prototype.acts.SetText;
	    else if (this.text_type == "rex_TagText")	
			set_text_handler = cr.plugins_.rex_TagText.prototype.acts.SetText;
	    else
		    set_text_handler = null;
	    return set_text_handler;
    };      
	
	behinstProto._reset = function()
	{         	    
	    this.min_fps = null;
	    this.max_fps = null;	 
	    this.acc_fps = 0; 
	    this.tick_cnt = 0;        
	};
	 
	behinstProto.SetText = function (content)
	{	    
	    if (this._set_text_handler == null)
		    return;
		this._set_text_handler.call(this.inst, content);
	};  
	
	behinstProto.tick = function ()
	{
	    if (!this.activated)
	        return;
	        
	    var content = "";
	    var cur_fps = this.runtime.fps;
	    if (this.current_fps_enable)
	        content += (Math.floor(cur_fps).toString() + "  ");
	    if ((this.minimum_fps_enable) && (cur_fps != 0))
	    {
	        if ((this.min_fps == null) || (cur_fps < this.min_fps))
	            this.min_fps = this.runtime.fps;
	        content += ("min:" + Math.floor(this.min_fps).toString() + "  ");
	    }
	    if (this.maximum_fps_enable)
	    {
	        if ((this.max_fps == null) || (cur_fps > this.max_fps))
	            this.max_fps = this.runtime.fps;
	        content += ("max:" + Math.floor(this.max_fps).toString() + "  ");
	    }
	    if (this.average_fps_enable)
	    {
	        this.acc_fps += cur_fps;
	        this.tick_cnt += 1;
	        var avg_fps = this.acc_fps/this.tick_cnt;
	        content += ("avg:" + Math.floor(avg_fps).toString());
	    }	
        if (this.cpuutilisation_enable)
            content += (" CPU:" + Math.floor(this.runtime.cpuutilisation/10).toString() + "%  ");        
	    
	    if (content != "")
	        this.SetText(content);  
	};
 	
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.activated };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.activated = o["en"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
	    if (s == 2)
	        this.activated = (!this.activated);
	    else
		    this.activated = (s==1);
		    
		if (!this.activated)
		{
		    this._reset();
		    this.SetText(""); 
		}
	};  
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());