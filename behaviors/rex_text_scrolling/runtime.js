// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_text_scrolling = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_text_scrolling.prototype;
		
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
        this.content_raw = "";
	    this.content_lines = [];
	    this.total_lines = 0;
	    this.visible_lines = 0;
        this.line_pos_percent = 0;
        this.lastwidth = this.inst.width;
	};

	behinstProto.onDestroy = function()
	{    
	};    
	
	behinstProto.tick = function ()
	{  
        this.width_update();    
	};
    
	behinstProto.width_update = function ()
	{   
        if (this.lastwidth == this.inst.width)
            return;
        
        this.SetContent();
	};
    
	behinstProto._get_visible_lines = function (percent)
	{
        var start_index = Math.floor((this.total_lines - this.visible_lines) * percent);
        var end_index = start_index + this.visible_lines;
        if (end_index > this.total_lines)
            end_index = this.total_lines;
        var i,text = "";
        for (i=start_index; i<end_index; i++)
            text += (this.content_lines[i] + "\n");
        return text;
	};
	
	behinstProto._copy_content_lines = function (lines)
	{
	    this.content_lines.length = 0;
	    var i, line, line_cnt=lines.length;
	    for (i=0; i<line_cnt; i++)
	        this.content_lines.push(lines[i].text);
	};	

	behinstProto.SetContent = function (s)
	{
        if (s != null)
            this.content_raw = s;
        var inst = this.inst;              
        this.SetText(this.content_raw);
        inst.draw(this.runtime.overlay_ctx);                      // call this function to get lines
	    this.total_lines = inst.lines.length;
	    this.visible_lines = Math.floor(inst.height/inst.pxHeight);
        if ((inst.height%inst.pxHeight) == 0)
            this.visible_lines -= 1;
	    this._copy_content_lines(inst.lines);
	    this.SetText(this._get_visible_lines(this.line_pos_percent));
	};    
	
	behinstProto.SetText = function (s)
	{
        cr.plugins_.Text.prototype.acts.SetText.apply(this.inst, [s]);
	};    
    
	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

    var _param2string = function (param)
    {
        if (typeof param === "number")
            param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
        return param.toString();    
    };
    
	acts.SetContent = function(param)
	{   
        this.SetContent(_param2string(param));
	};

	acts.ScrollTo = function(percent)
	{   
        this.line_pos_percent = cr.clamp(percent, 0, 1);
        this.SetText(this._get_visible_lines(this.line_pos_percent));
	};
    
	acts.AppendContent = function(param)
	{   
        this.SetContent(this.content_raw + _param2string(param));
	};    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	exps.Text = function(ret)
	{
		ret.set_string(this.content_raw);
	};
	
}());