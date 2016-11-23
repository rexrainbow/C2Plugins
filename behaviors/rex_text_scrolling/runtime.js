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
	    this.total_lines_cnt = 0;
	    this.visible_lines = 0;
        this.line_pos_percent = 0;
        this.start_line_index = 0;        
        this.text_changed = false;
        this.lastwidth = this.inst.width;
        this.lastheight = this.inst.height;
        
		this.text_type = this.get_text_type();
		this.SetText_handler = this.get_setText_handler();
        this.init_content_lines();
	};
    
	behinstProto.get_text_type = function ()
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
	    else if (cr.plugins_.rex_bbcodeText &&
		         (this.inst instanceof cr.plugins_.rex_bbcodeText.prototype.Instance))
		    text_type = "rex_bbcodeText";                        
		else
		    text_type = "";	 
		return text_type;
	};
	
	behinstProto.get_setText_handler = function ()
	{
	    var set_text_handler;
        if (this.text_type === "Text")		
	        set_text_handler = cr.plugins_.Text.prototype.acts.SetText;	    
	    else if (this.text_type === "Spritefont2")	
			set_text_handler = cr.plugins_.Spritefont2.prototype.acts.SetText;
	    else if (this.text_type === "rex_TagText")	
			set_text_handler = cr.plugins_.rex_TagText.prototype.acts.SetText;
	    else if (this.text_type === "rex_bbcodeText")	
			set_text_handler = cr.plugins_.rex_bbcodeText.prototype.acts.SetText;        
	    else
		    set_text_handler = null;
	    return set_text_handler;
    };  		
	
	behinstProto.init_content_lines = function ()
	{
	    var set_text_handler;
        if ((this.text_type === "Text") || (this.text_type === "Spritefont2"))		
	        this.content_lines = [];    
	    else if ((this.text_type === "rex_TagText") || (this.text_type === "rex_bbcodeText"))
			this.content_lines = null;
	    else
		    this.content_lines = [];
    }; 
    
	behinstProto.onDestroy = function()
	{    
	};    

	behinstProto.tick = function ()
	{  	    
	};
	
	behinstProto.tick2 = function ()
	{  	    
        this.redraw_text();
	};
    
	behinstProto.redraw_text = function ()
	{  	    
        var size_changed = (this.lastwidth !== this.inst.width) || (this.lastheight !== this.inst.height);        
        if (size_changed || this.text_changed)
        {
            this.SetContent(); 
            this.text_changed = false;
            this.lastwidth = this.inst.width;
            this.lastheight = this.inst.height;        
        }
	};    
	behinstProto.get_lastStartLineIndex = function ()
	{  
        var idx = this.total_lines_cnt - this.visible_lines;
        if (idx < 0)
            idx = 0;
        return idx;
	};
    
	behinstProto.perent2line = function (percent)
	{  
        return Math.floor(this.get_lastStartLineIndex() * percent);
	};

	behinstProto.line2percent = function (line_index)
	{  
        var percent = line_index/this.get_lastStartLineIndex();
        return cr.clamp(percent, 0, 1);
	};    
    	
	behinstProto.copy_content_lines = function ()
	{
        if ((this.text_type === "Text") || (this.text_type === "Spritefont2"))
        {
            var lines = this.inst.lines
	        this.content_lines.length = 0;            
	        var i, line, line_cnt=lines.length;
	        for (i=0; i<line_cnt; i++)
		    {
		        this.content_lines.push(lines[i].text);
	        }
        }
        else if ((this.text_type === "rex_TagText") || (this.text_type === "rex_bbcodeText"))
        {
            this.content_lines = this.inst.copyPensMgr(this.content_lines);           
        }
        return this.content_lines;
	};    
    
	behinstProto.get_visible_text = function (start_line_index)
	{
        this.start_line_index = (start_line_index < 0)? 0:start_line_index;
        var end_index = this.start_line_index + this.visible_lines;
        if (end_index > this.total_lines_cnt)
            end_index = this.total_lines_cnt;
        
        return this.getSubText(this.start_line_index, end_index);
	};
    
	behinstProto.getSubText = function (start, end)  
	{        
        if (start >= end)
            return "";
        
        var txt;		
		if ( (this.text_type === "Text") || (this.text_type === "Spritefont2") )
		{
		    txt = "";
            end -= 1;
		    for (var i=start; i<=end; i++)
            {
                txt += this.content_lines[i];
                if (i > end )
			        txt += "\n";
            }
		}
		else if ((this.text_type === "rex_TagText") || (this.text_type === "rex_bbcodeText"))
		{
            // get start chart index     
            var si = this.content_lines.getLineStartChartIndex(start);
            // get end chart index
            var ei = this.content_lines.getLineEndChartIndex(end-1);
            txt = this.content_lines.getSliceTagText(si, ei+1);
		}
        return txt;    
	};    
	
    
	behinstProto.get_total_lines_cnt = function ()
	{
        var cnt;
        if ((this.text_type === "Text") || (this.text_type === "Spritefont2"))
        {
	        cnt = this.content_lines.length;
        }
        else if ((this.text_type === "rex_TagText") || (this.text_type === "rex_bbcodeText"))
        {
            cnt = this.content_lines.getLines().length;        
        }
        return cnt;
	};    

    
	behinstProto.SetContent = function ()
	{               
        // render all content
        var inst = this.inst;              
        this.SetText(this.content);         // start from line 0        
        var ctx = (this.runtime.enableWebGL)? 
                  this._get_webgl_ctx():this.runtime.ctx;
        inst.draw(ctx);                      // call this function to get lines
        
        // copy content in lines, or pensMgr
        this.copy_content_lines();
        // get total lines count
	    this.total_lines_cnt = this.get_total_lines_cnt();
        // calc visible lines count
		var line_height = this.get_line_height();
	    this.visible_lines = Math.floor(inst.height/line_height);
        if ((inst.height%line_height) == 0)
            this.visible_lines -= 1;	    
        
        // only show visible lines
        this.SetText("");     // clean remain text
        this.SetText(this.get_visible_text(this.start_line_index));
	};    
	
	behinstProto.get_line_height = function ()
	{	
	    var line_height, inst=this.inst;
        if (this.text_type == "Text")
	        line_height = inst.pxHeight;
        else if ((this.text_type === "rex_TagText") || (this.text_type === "rex_bbcodeText"))
	        line_height = inst.pxHeight;        
	    else if (this.text_type == "Spritefont2")	
			line_height = (inst.characterHeight * inst.characterScale) + inst.lineHeight;

	    assert2(line_height, "Text Scrolling behavior: the instance is not a text object, neither a sprite font object.");
	    return line_height;
    };  
	

	behinstProto.SetText = function (content)
	{
	    if (this.SetText_handler == null)
		    return;
        
        if  ((this.text_type === "rex_TagText") || (this.text_type === "rex_bbcodeText"))
        {
            var is_force_render_save = this.inst.is_force_render;
            this.inst.is_force_render = false;
        }
        
		this.SetText_handler.call(this.inst, content); // set text
        
        if  ((this.text_type === "rex_TagText") || (this.text_type === "rex_bbcodeText"))
        {
            this.inst.is_force_render = is_force_render_save;
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
 	
	behinstProto.saveToJSON = function ()
	{
		return { "raw" : this.content,
		         "lcnt": this.total_lines_cnt,
		         "vlcnt": this.visible_lines,
		         "lper": this.line_pos_percent,
		         "start": this.start_line_index, 
		          };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
        this.content = o["raw"];
	    this.total_lines_cnt = o["lcnt"];
	    this.visible_lines = o["vlcnt"];
        this.line_pos_percent = o["lper"];
        this.start_line_index = o["start"];
	};

	behinstProto.afterLoad = function ()
	{    
        this.SetContent();    // get this.content_lines back
	};    
    
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Content", "value": this.content},
                {"name": "Start at", "value": this.start_line_index},
				{"name": "Total lines", "value": this.total_lines_cnt},
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
		return (this.start_line_index + this.visible_lines >= this.total_lines_cnt);
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
        this.SetText(this.get_visible_text(start_line_index));
	};
    
	Acts.prototype.AppendContent = function(param)
	{   
        this.content += _param2string(param);
        this.text_changed = true;
	}; 

	Acts.prototype.ScrollByIndex = function(line_index)
	{               
        this.redraw_text();       
        this.SetText(this.get_visible_text(line_index));
	}; 

	Acts.prototype.NextLine = function()
	{   
        this.redraw_text();      
        this.SetText(this.get_visible_text(this.start_line_index+1));
	}; 

	Acts.prototype.PreviousLine = function()
	{   
        this.redraw_text();      
        this.SetText(this.get_visible_text(this.start_line_index-1));
	};   

	Acts.prototype.NextPage = function()
	{   
        this.redraw_text();      
        this.SetText(this.get_visible_text(this.start_line_index+this.visible_lines));
	}; 

	Acts.prototype.PreviousPage = function()
	{   
        this.redraw_text();      
        this.SetText(this.get_visible_text(this.start_line_index-this.visible_lines));
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
		ret.set_int(this.total_lines_cnt);
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
        var last_index = this.total_lines_cnt -1;
        if (cur_last > last_index)
            cur_last = last_index;
		ret.set_int(cur_last);
	};    
    

	Exps.prototype.Lines = function(ret, start, end)
	{
        if (start < 0)
            start = 0;
        if (end > this.total_lines_cnt)
            end = this.total_lines_cnt;
        
        var text;
        if (end > start)
            text = this.getSubText(start, end); 
        else
            text = "";
            
		ret.set_string(text);
	};
    
}());