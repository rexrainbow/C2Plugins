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
        this.content = "";
	    this.content_lines = [];
	    this.total_lines = 0;
	    this.visible_lines = 0;
        this.line_pos_percent = 0;
        this.start_line_index = 0;        
        this.text_changed = false;
        this.lastwidth = this.inst.width;
        this.lastheight = this.inst.height;
		this._text_type = "";  
		this._set_text_handler = this._set_text_handler_get();
	};

	behinstProto.onDestroy = function()
	{    
	};    
	
	behinstProto.tick = function ()
	{  	    
        this.redraw_text();
	};
    
	behinstProto.redraw_text = function ()
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
        var idx = this.total_lines - this.visible_lines;
        if (idx < 0)
            idx = 0;
        return idx;
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
    
	behinstProto._visible_text_get = function (start_line_index)
	{
        this.start_line_index = (start_line_index < 0)? 0:start_line_index;
        var end_index = this.start_line_index + this.visible_lines;
        if (end_index > this.total_lines)
            end_index = this.total_lines;
        var i,text;
		
		if ( (this.text_type == "Text") || (this.text_type == "Spritefont2") )
		{
		    text = "";
		    for (i=this.start_line_index; i<end_index; i++)
			    text += (this.content_lines[i] + "\n");
		}
		else if (this.text_type == "rex_TagText")
		{
	        if (this.start_line_index == end_index)
		        return "";
            var start_char_index, end_char_index;
            start_char_index = this.content_lines[this.start_line_index].index;            
            var l = this.content_lines[end_index-1];
            end_char_index = l.index + l.text.length;
			text = this.inst.subTextGet(this.content, start_char_index, end_char_index);
		}
        return text;
	};
	
	behinstProto._copy_content_lines = function (lines)
	{
	    this.content_lines.length = 0;
	    var i, line, line_cnt=lines.length;
	    for (i=0; i<line_cnt; i++)
		{
		    if ((this.text_type == "Text") || (this.text_type == "Spritefont2"))
                this.content_lines.push(lines[i].text);
            else if (this.text_type == "rex_TagText")
			{
			    line = lines[i];
                this.content_lines.push( { text:line["text"], index:line["index"] } );   // copy	
		    }
	    }
	};	

    behinstProto._get_webgl_ctx = function ()
	{
        var inst = this.inst;            
        var ctx = inst.myctx;
		if (!ctx)
		{
			inst.mycanvas = document.createElement("canvas");
            var scaledwidth = Math.ceil(inst.layer.getScale()*inst.width);
            var scaledheight = Math.ceil(inst.layer.getAngle()*inst.height);
			inst.mycanvas.width = scaledwidth;
			inst.mycanvas.height = scaledheight;
			inst.lastwidth = scaledwidth;
			inst.lastheight = scaledheight;
			inst.myctx = inst.mycanvas.getContext("2d");
            ctx = inst.myctx;
		}
        return ctx;
	};
    
	behinstProto.SetContent = function ()
	{        
        var inst = this.inst;              
        this.SetText(this.content);         // start from line 0        
        var ctx = (this.runtime.enableWebGL)? 
                  this._get_webgl_ctx():this.runtime.ctx;
        inst.draw(ctx);                      // call this function to get lines
	    this.total_lines = inst.lines.length;
		var line_height = this._line_height_get();
	    this.visible_lines = Math.floor(inst.height/line_height);
        if ((inst.height%line_height) == 0)
            this.visible_lines -= 1;
	    this._copy_content_lines(inst.lines);
        
        if (this.start_line_index != 0)
	        this.SetText(this._visible_text_get(this.start_line_index));
	};    
	
	behinstProto._line_height_get = function ()
	{	
	    var line_height, inst=this.inst;
        if ( (this.text_type == "Text") || (this.text_type == "rex_TagText") )
	        line_height = inst.pxHeight;
	    else if (this.text_type == "Spritefont2")	
			line_height = (inst.characterHeight * inst.characterScale) + inst.lineHeight;

	    assert2(line_height, "Text Scrolling behavior: the instance is not a text object, neither a sprite font object.");
	    return line_height;
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
	
	behinstProto.SetText = function (content)
	{
	    if (this._set_text_handler == null)
		    return;
        
        this._set_text_handler.call(this.inst, "");      // clean remain text     
		this._set_text_handler.call(this.inst, content); // set text
	};  
 	
	behinstProto.saveToJSON = function ()
	{
		return { "raw" : this.content,
		         "lines": this.content_lines,
		         "lcnt": this.total_lines,
		         "vlcnt": this.visible_lines,
		         "lper": this.line_pos_percent,
		         "start": this.start_line_index, 
		          };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
        this.content = o["raw"];
	    this.content_lines = o["lines"];
	    this.total_lines = o["lcnt"];
	    this.visible_lines = o["vlcnt"];
        this.line_pos_percent = o["lper"];
        this.start_line_index = o["start"];
	};
    
    
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Content", "value": this.content},
                {"name": "Start at", "value": this.start_line_index},
				{"name": "Total lines", "value": this.total_lines},
				{"name": "Visible lines", "value": this.visible_lines}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/    
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
        this.content = _param2string(param);
		this.start_line_index = 0;
        this.SetContent();
	};

	Acts.prototype.ScrollByPercent = function(percent)
	{   
        this.redraw_text();            
        this.line_pos_percent = cr.clamp(percent, 0, 1);
        var start_line_index = this.perent2line(this.line_pos_percent);
        this.SetText(this._visible_text_get(start_line_index));
	};
    
	Acts.prototype.AppendContent = function(param)
	{   
        this.content += _param2string(param);
        this.text_changed = true;
	}; 

	Acts.prototype.ScrollByIndex = function(line_index)
	{               
        this.redraw_text();       
        this.SetText(this._visible_text_get(line_index));
	}; 

	Acts.prototype.NextLine = function()
	{   
        this.redraw_text();      
        this.SetText(this._visible_text_get(this.start_line_index+1));
	}; 

	Acts.prototype.PreviousLine = function()
	{   
        this.redraw_text();      
        this.SetText(this._visible_text_get(this.start_line_index-1));
	};   

	Acts.prototype.NextPage = function()
	{   
        this.redraw_text();      
        this.SetText(this._visible_text_get(this.start_line_index+this.visible_lines));
	}; 

	Acts.prototype.PreviousPage = function()
	{   
        this.redraw_text();      
        this.SetText(this._visible_text_get(this.start_line_index-this.visible_lines));
	};   
	  
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.Text = function(ret)
	{
		ret.set_string(this.content);
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