// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_text_typing = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_text_typing.prototype;
		
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
        this.timeline = null;  
        this.timelineUid = -1;    // for loading     
	};

    behtypeProto._timeline_get = function ()
    {
        if (this.timeline != null)
            return this.timeline;
    
        assert2(cr.plugins_.Rex_TimeLine, "Text Typing behavior: Can not find timeline oject.");
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Rex_TimeLine.prototype.Instance)
            {
                this.timeline = inst;
                return this.timeline;
            }
        }
        assert2(this.timeline, "Text Typing behavior: Can not find timeline oject.");
        return null;	
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
        this.isLineBreak = (this.properties[0] === 1);    
        this.typing_timer = null;
        this.typing_speed = 0; 
        this.typing_index = 0;
        this.content = "";
        this.typing_content = null;
        this.raw_text_length = 0;
        this.timer_save = null;
		this.text_type = this.get_text_type();  
		this.SetText_handler = this.get_setText_handler(this.text_type);
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
	    else if (cr.plugins_.TextBox &&
		         (this.inst instanceof cr.plugins_.TextBox.prototype.Instance))
		    text_type = "TextBox";					
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
    
	behinstProto.get_setText_handler = function (text_type)
	{
	    var set_text_handler;
        if (text_type === "Text")		
	        set_text_handler = cr.plugins_.Text.prototype.acts.SetText;	    
	    else if (text_type === "Spritefont2")	
			set_text_handler = cr.plugins_.Spritefont2.prototype.acts.SetText;
	    else if (text_type === "TextBox")	
			set_text_handler = cr.plugins_.TextBox.prototype.acts.SetText;				
	    else if (text_type === "rex_TagText")	
			set_text_handler = cr.plugins_.rex_TagText.prototype.acts.SetText;
	    else if (this.text_type === "rex_bbcodeText")	
			set_text_handler = cr.plugins_.rex_bbcodeText.prototype.acts.SetText;   		
	    else
		    set_text_handler = null;
	    return set_text_handler;
    };
    
	behinstProto.onDestroy = function()
	{    
        this.typing_timer_remove();     
	};    
    
	behinstProto.typing_timer_remove = function ()
	{
        if (this.typing_timer != null)
            this.typing_timer.Remove();
    };  
	
	behinstProto.tick = function ()
	{
	};
	

	behinstProto.get_rawTextLength = function (content)
	{	    
	    var len;
		if ((this.text_type === "Text") || (this.text_type === "Spritefont2") || (this.text_type === "TextBox"))
		    len = content.length;
        else if ((this.text_type === "rex_TagText") || (this.text_type === "rex_bbcodeText"))
            len = this.inst.getRawText(content).length;
        else
            len = 0;
        return len;
	};
	
	behinstProto.SetText = function (content, start_index, end_index)
	{	    
	    if (this.SetText_handler == null)
		    return;
		    
	    if (start_index == null)
	        start_index = 0;
	    if (end_index == null)
	        end_index = this.get_rawTextLength(content);

		if ((this.text_type == "Text") || (this.text_type == "Spritefont2") || (this.text_type == "TextBox"))
		{
		    content = content.slice(start_index, end_index);
            this.SetText_handler.call(this.inst, content);
        }
        else if ((this.text_type === "rex_TagText") || (this.text_type === "rex_bbcodeText"))
        {
            content = this.inst.getSubText(start_index, end_index, content);
            this.SetText_handler.call(this.inst, content);
        }
	};

    behinstProto._get_timer = function ()
    {
        var timer = this.typing_timer;
        if  (timer == null)
        {
            var timeline = this.type._timeline_get();
            assert2(timeline, "Text typing need a timeline object");
            timer = timeline.CreateTimer(on_timeout);
            timer.plugin = this;
        }
        return timer;
    };
    
	behinstProto.start_typing = function (text, speed, start_index)
	{
        if (this.isLineBreak)
        {
            text = this.lineBreakContent(text);
        }
                
	    this.raw_text_length = this.get_rawTextLength(text);
        if (speed != 0)
        {
            if (start_index == null)
                start_index = 1;
            
            this.typing_timer = this._get_timer();
            this.typing_content = text;
            this.typing_speed = speed;
            this.typing_index = start_index;
            this.typing_timer.Start(0);
        }
        else
        {
            this.typing_index = this.raw_text_length;
            this.SetText(text, 0, this.typing_index);
            this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTypingCompleted, this.inst);
        }
    };
    
    // handler of timeout for timers in this plugin, this=timer   
    var on_timeout = function ()
    {
        this.plugin.text_typing_handler();
    };
        
	behinstProto.text_typing_handler = function()
	{
        this.SetText(this.typing_content, 0, this.typing_index);
        this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTextTyping, this.inst);         
        this.typing_index += 1;        
        if (this.typing_index <= this.raw_text_length)
            this.typing_timer.Restart(this.typing_speed);        
        else
        {
            this.typing_index = this.raw_text_length;
            this.typing_content = null;            
            this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTypingCompleted, this.inst);
        }
	}; 

	behinstProto.is_typing = function ()
	{ 
        return (this.typing_timer)? this.typing_timer.IsActive():false;
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
	behinstProto.drawText = function (text)
	{
        // render all content
        this.SetText(text);
        var inst = this.inst;               
        var ctx = (this.runtime.enableWebGL)? 
                  this._get_webgl_ctx():this.runtime.ctx;
        inst.draw(ctx);                      // call this function to get lines        
	}; 

    behinstProto.lineBreakContent = function (source)
	{
        this.drawText(source);
        var content;
		if (this.text_type === "Text")
		{
			content = this.inst.lines.join("\n");
		}
		else if (this.text_type === "Spritefont2")
		{
			var cnt = this.inst.lines.length;
			var lines = [];
			for(var i=0; i<cnt; i++)
			{
				lines.push(this.inst.lines[i].text);
			}
			content = lines.join("\n");
		}
        else if ((this.text_type === "rex_TagText") || (this.text_type === "rex_bbcodeText"))
        {
            var pensMgr = this.inst.copyPensMgr(); 
            var cnt = pensMgr.getLines().length;
			var addNewLine=false;
			content = "";
            for (var i=0; i<cnt; i++)            
            {
			  if (addNewLine)
			    content += "\n";

              // get start chart index     
              var si = pensMgr.getLineStartChartIndex(i);
              // get end chart index
              var ei = pensMgr.getLineEndChartIndex(i);
              var txt = pensMgr.getSliceTagText(si, ei+1);  

              content += txt;
			  addNewLine = (txt.indexOf("\n") === -1);
			}
        }

	    return content || "";
	};    
    
	behinstProto.saveToJSON = function ()
	{ 
		return { "c": this.content,
                 "tc": this.typing_content,
		         "spd" : this.typing_speed,
		         "i" : this.typing_index,
		         
		         "tim": (this.typing_timer != null)? this.typing_timer.saveToJSON() : null,
                 "tluid": (this.type.timeline != null)? this.type.timeline.uid: (-1)
                };
	};
    
	behinstProto.loadFromJSON = function (o)
	{    
	    this.content = o["c"];
        this.typing_content = o["tc"];
	    this.typing_speed = o["spd"];
	    this.typing_index = o["i"];
	    
        this.timer_save = o["tim"];
        this.type.timelineUid = o["tluid"];   
	};
    
	behinstProto.afterLoad = function ()
	{
		if (this.type.timelineUid === -1)
			this.type.timeline = null;
		else
		{
			this.type.timeline = this.runtime.getObjectByUID(this.type.timelineUid);
			assert2(this.type.timeline, "Timer: Failed to find timeline object by UID");
		}		       
        
        if (this.timer_save == null)
            this.typing_timer = null;
        else
        {
            this.typing_timer = this.type.timeline.LoadTimer(this.timer_save, on_timeout);
            this.typing_timer.plugin = this;
        }     
        this.timers_save = null;        
	}; 	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
 
    Cnds.prototype.OnTextTyping = function ()
	{
		return true;
	};  
 
    Cnds.prototype.OnTypingCompleted = function ()
	{
		return true;
	}; 
    
	Cnds.prototype.IsTextTyping = function ()
	{ 
        return this.is_typing();
	}; 
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
    Acts.prototype.SetupTimer = function (timeline_objs)
	{
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.type.timeline = timeline; 
        else
            alert ("Text-typing should connect to a timeline object");
	}; 

	Acts.prototype.TypeText = function(param, speed)
	{
        if (typeof param === "number")
            param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		
        this.content = param.toString();       
        this.start_typing(this.content, speed);
	};

	Acts.prototype.SetTypingSpeed = function(speed)
	{
	    if (this.typing_speed === speed)
	        return;
	        
	        
        this.typing_speed = speed;                   
        var timer = this.typing_timer;
        if (timer == null)
            return;
                    
        if (timer.IsActive())
        {
            timer.Restart(speed);
        }
	};
    
	Acts.prototype.StopTyping = function(is_show_all)
	{
        this.typing_timer_remove();   
        if (is_show_all)
        {
            this.SetText(this.content);
            this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTypingCompleted, this.inst);
        }
	};
    
	Acts.prototype.AppendText = function(param)
	{
        var start_index = this.raw_text_length;
        if (typeof param === "number")
            param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
        this.content += param.toString();
        if (!this.is_typing())
            this.start_typing(this.content, this.typing_speed, start_index);
	};    

    Acts.prototype.Pause = function ()
	{
	    if (this.typing_timer == null)
	        return;
	        
	    this.typing_timer.Suspend();
	};   

    Acts.prototype.Resume = function ()
	{
	    if (this.typing_timer == null)
	        return;
	    
	    this.typing_timer.Resume();
	};       
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
    Exps.prototype.TypingSpeed = function (ret)
	{
	    ret.set_float( this.typing_speed );
	};
    
    Exps.prototype.TypingIndex = function (ret)
	{
	    ret.set_float( this.typing_index -1 );
	};	

    Exps.prototype.Content = function (ret)
	{
	    ret.set_string( this.content );
	};
    
    Exps.prototype.LastTypingCharacter = function (ret)
	{
	    ret.set_string( this.content.charAt(this.typing_index-1) );
	};	
}());