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
        this.start_line_index = 0;        
        this.text_changed = false;
        this.lastwidth = this.inst.width;
        this.lastheight = this.inst.height;
	};

	behinstProto.onDestroy = function()
	{    
	};    
	
	behinstProto.tick = function ()
	{  	    
        if ((this.lastwidth == this.inst.width) &&
            (this.lastheight == this.inst.height) &&
            (!this.text_changed) )
            return;
        
        this.SetContent(); 
        this.text_changed = false;
        this.lastwidth = this.inst.width;
        this.lastheight = this.inst.height;
	};
    
	behinstProto._last_start_line = function ()
	{  
        return this.total_lines - this.visible_lines;
	};
    
	behinstProto.perent2line = function (percent)
	{  
        return Math.floor(this._last_start_line() * percent);
	};

	behinstProto.line2percent = function (line_index)
	{  
        var percent = line_index/this._last_start_line();
        return cr.clamp(percent, 0, 1);
	};    
    
	behinstProto._get_visible_lines = function (start_line_index)
	{
        this.start_line_index = (start_line_index < 0)? 0:start_line_index;
        var end_index = this.start_line_index + this.visible_lines;
        if (end_index > this.total_lines)
            end_index = this.total_lines;
        var i,text = "";
        for (i=this.start_line_index; i<end_index; i++)
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

	behinstProto.SetContent = function ()
	{
        var inst = this.inst;              
        this.SetText(this.content_raw);
        var ctx = (this.runtime.enableWebGL)? 
                  this.runtime.overlay_ctx:this.runtime.ctx;
        inst.draw(ctx);                      // call this function to get lines
	    this.total_lines = inst.lines.length;
	    this.visible_lines = Math.floor(inst.height/inst.pxHeight);
        if ((inst.height%inst.pxHeight) == 0)
            this.visible_lines -= 1;
	    this._copy_content_lines(inst.lines);
	    this.SetText(this._get_visible_lines(this.start_line_index));
	};    
	
	behinstProto.SetText = function (s)
	{
        cr.plugins_.Text.prototype.acts.SetText.apply(this.inst, [s]);
	};    
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	  
	Cnds.prototype.IsLastPage = function ()
	{
		return (this.start_line_index + this.visible_lines >= this.total_lines);
	};	 
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    var _param2string = function (param)
    {
        if (typeof param === "number")
            param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
        return param.toString();    
    };
 
	Acts.prototype.SetContent = function(param)
	{   
        this.content_raw = _param2string(param);
        this.SetContent();
	};

	Acts.prototype.ScrollByPercent = function(percent)
	{   
        this.line_pos_percent = cr.clamp(percent, 0, 1);
        var start_line_index = this.perent2line(this.line_pos_percent);
        this.SetText(this._get_visible_lines(start_line_index));
	};
    
	Acts.prototype.AppendContent = function(param)
	{   
        this.content_raw += _param2string(param);
        this.text_changed = true;
	}; 

	Acts.prototype.ScrollByIndex = function(line_index)
	{   
        this.SetText(this._get_visible_lines(line_index));
	}; 

	Acts.prototype.NextLine = function()
	{   
        this.SetText(this._get_visible_lines(this.start_line_index+1));
	}; 

	Acts.prototype.PreviousLine = function()
	{   
        this.SetText(this._get_visible_lines(this.start_line_index-1));
	};   

	Acts.prototype.NextPage = function()
	{   
        this.SetText(this._get_visible_lines(this.start_line_index+this.visible_lines));
	}; 

	Acts.prototype.PreviousPage = function()
	{   
        this.SetText(this._get_visible_lines(this.start_line_index-this.visible_lines));
	};   
	  
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.Text = function(ret)
	{
		ret.set_string(this.content_raw);
	};

	Exps.prototype.TotalCnt = function(ret)
	{
		ret.set_int(this.total_lines);
	};	

	Exps.prototype.VisibleCnt = function(ret)
	{
		ret.set_int(this.visible_lines);
	};	    

	Exps.prototype.CurrIndex = function(ret)
	{
		ret.set_int(this.start_line_index);
	};

	Exps.prototype.CurrLastIndex = function(ret)
	{
        var cur_last = this.start_line_index + this.visible_lines-1;
        var last_index = this.total_lines -1;
        if (cur_last > last_index)
            cur_last = last_index;
		ret.set_int(cur_last);
	};    
    

	Exps.prototype.Lines = function(ret, start, end)
	{
        var i,text = "";
        if (start < 0)
            start = 0;
        var last_index = this.total_lines -1;
        if (end > last_index)
            end = last_index;
        for (i=start; i<=end; i++)
            text += this.content_lines[i];    
		ret.set_string(text);
	};
    
}());