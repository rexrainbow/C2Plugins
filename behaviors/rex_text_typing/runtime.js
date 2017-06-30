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

    behtypeProto.getTimelineObj = function ()
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
        this.typingTimer = null;
        this.typingspeed = 0; 
        this.typingIndex = 0;
        this.content = "";
        this.typingContent = null;
        this.rawTextLength = 0;
        this.timerSave = null;
		this.textObjType = this.getTextObjType();  
		this.SetTextFn = this.getSetTextFn(this.textObjType);
	};
    
   	behinstProto.getTextObjType = function ()
	{
	    var textObjType;
        if (cr.plugins_.Text &&
		    (this.inst instanceof cr.plugins_.Text.prototype.Instance))		
	        textObjType = "Text";	    
	    else if (cr.plugins_.Spritefont2 &&
		         (this.inst instanceof cr.plugins_.Spritefont2.prototype.Instance))
			textObjType = "Spritefont2";	  
	    else if (cr.plugins_.TextBox &&
		         (this.inst instanceof cr.plugins_.TextBox.prototype.Instance))
		    textObjType = "TextBox";					
	    else if (cr.plugins_.rex_TagText &&
		         (this.inst instanceof cr.plugins_.rex_TagText.prototype.Instance))
		    textObjType = "rex_TagText";   
	    else if (cr.plugins_.rex_bbcodeText &&
		         (this.inst instanceof cr.plugins_.rex_bbcodeText.prototype.Instance))
		    textObjType = "rex_bbcodeText";    
	    else if (cr.plugins_.SpriteFontPlus &&
		         (this.inst instanceof cr.plugins_.SpriteFontPlus.prototype.Instance))
			textObjType = "SpriteFontPlus";	    				            
		else
		    textObjType = "";	 
		return textObjType;
	};
    
	behinstProto.getSetTextFn = function (textObjType)
	{
	    var setTextFn;
        if (textObjType === "Text")		
	        setTextFn = cr.plugins_.Text.prototype.acts.SetText;	    
	    else if (textObjType === "Spritefont2")	
			setTextFn = cr.plugins_.Spritefont2.prototype.acts.SetText;
	    else if (textObjType === "TextBox")	
			setTextFn = cr.plugins_.TextBox.prototype.acts.SetText;				
	    else if (textObjType === "rex_TagText")	
			setTextFn = cr.plugins_.rex_TagText.prototype.acts.SetText;
	    else if (this.textObjType === "rex_bbcodeText")	
			setTextFn = cr.plugins_.rex_bbcodeText.prototype.acts.SetText;  
	    else if (this.textObjType === "SpriteFontPlus")	
			setTextFn = cr.plugins_.SpriteFontPlus.prototype.acts.SetText;			 		
	    else
		    setTextFn = null;
	    return setTextFn;
    };
    
	behinstProto.onDestroy = function()
	{    
        this.removeTypingTimer();     
	};    
    
	behinstProto.removeTypingTimer = function ()
	{
        if (this.typingTimer != null)
            this.typingTimer.Remove();
    };  
	
	behinstProto.tick = function ()
	{
	};
	

	behinstProto.getRawTextLength = function (content)
	{	    
	    var len;
		if ((this.textObjType === "Text") || 
		    (this.textObjType === "Spritefont2") || (this.textObjType === "SpriteFontPlus") || 
			(this.textObjType === "TextBox"))
		    len = content.length;
        else if ((this.textObjType === "rex_TagText") || (this.textObjType === "rex_bbcodeText"))
            len = this.inst.getRawText(content).length;
        else
            len = 0;
        return len;
	};
	
	behinstProto.setText = function (content, startIndex, endIndex)
	{	    
	    if (this.SetTextFn == null)
		    return;
		    
	    if (startIndex == null)
	        startIndex = 0;
	    if (endIndex == null)
	        endIndex = this.getRawTextLength(content);

		if ((this.textObjType == "Text") || 
		   (this.textObjType == "Spritefont2") || (this.textObjType === "SpriteFontPlus") || 
		   (this.textObjType == "TextBox"))
		{
		    content = content.slice(startIndex, endIndex);
            this.SetTextFn.call(this.inst, content);
        }
        else if ((this.textObjType === "rex_TagText") || (this.textObjType === "rex_bbcodeText"))
        {
            content = this.inst.getSubText(startIndex, endIndex, content);
            this.SetTextFn.call(this.inst, content);
        }
	};

    behinstProto.getTimer = function ()
    {
        var timer = this.typingTimer;
        if  (timer == null)
        {
            var timeline = this.type.getTimelineObj();
            assert2(timeline, "Text typing need a timeline object");
            timer = timeline.CreateTimer(on_timeout);
            timer.plugin = this;
        }
        return timer;
    };
    
	behinstProto.startTyping = function (text, speed, startIndex)
	{
        if (this.isLineBreak)
        {
            text = this.lineBreakContent(text);
        }
                
	    this.rawTextLength = this.getRawTextLength(text);
        if (speed != 0)
        {
            if (startIndex == null)
                startIndex = 1;
            
            this.typingTimer = this.getTimer();
            this.typingContent = text;
            this.typingspeed = speed;
            this.typingIndex = startIndex;
            this.typingTimer.Start(0);
        }
        else
        {
            this.typingIndex = this.rawTextLength;
            this.setText(text, 0, this.typingIndex);
            this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTypingCompleted, this.inst);
        }
    };
    
    // handler of timeout for timers in this plugin, this=timer   
    var on_timeout = function ()
    {
        this.plugin.typeContent();
    };
        
	behinstProto.typeContent = function()
	{
        this.setText(this.typingContent, 0, this.typingIndex);
        this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTextTyping, this.inst);         
        this.typingIndex += 1;        
        if (this.typingIndex <= this.rawTextLength)
            this.typingTimer.Restart(this.typingspeed);        
        else
        {
            this.typingIndex = this.rawTextLength;
            this.typingContent = null;            
            this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTypingCompleted, this.inst);
        }
	}; 

	behinstProto.is_typing = function ()
	{ 
        return (this.typingTimer)? this.typingTimer.IsActive():false;
	}; 
    
 
    behinstProto.getWebglCtx = function ()
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
        this.setText(text);
        var inst = this.inst;               
        var ctx = (this.runtime.enableWebGL)? 
                  this.getWebglCtx():this.runtime.ctx;
        inst.draw(ctx);                      // call this function to get lines        
	}; 

    behinstProto.lineBreakContent = function (source)
	{
        this.drawText(source);
        var content;
		if (this.textObjType === "Text")
		{
			content = this.inst.lines.join("\n");
		}
		else if ((this.textObjType === "Spritefont2") || (this.textObjType === "SpriteFontPlus"))
		{
			var cnt = this.inst.lines.length;
			var lines = [];
			for(var i=0; i<cnt; i++)
			{
				lines.push(this.inst.lines[i].text);
			}
			content = lines.join("\n");
		}
        else if ((this.textObjType === "rex_TagText") || (this.textObjType === "rex_bbcodeText"))
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
                 "tc": this.typingContent,
		         "spd" : this.typingspeed,
		         "i" : this.typingIndex,
		         
		         "tim": (this.typingTimer != null)? this.typingTimer.saveToJSON() : null,
                 "tluid": (this.type.timeline != null)? this.type.timeline.uid: (-1)
                };
	};
    
	behinstProto.loadFromJSON = function (o)
	{    
	    this.content = o["c"];
        this.typingContent = o["tc"];
	    this.typingspeed = o["spd"];
	    this.typingIndex = o["i"];
	    
        this.timerSave = o["tim"];
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
        
        if (this.timerSave == null)
            this.typingTimer = null;
        else
        {
            this.typingTimer = this.type.timeline.LoadTimer(this.timerSave, on_timeout);
            this.typingTimer.plugin = this;
        }     
        this.timerSave = null;        
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
        this.startTyping(this.content, speed);
	};

	Acts.prototype.SetTypingSpeed = function(speed)
	{
	    if (this.typingspeed === speed)
	        return;
	        
	        
        this.typingspeed = speed;                   
        var timer = this.typingTimer;
        if (timer == null)
            return;
                    
        if (timer.IsActive())
        {
            timer.Restart(speed);
        }
	};
    
	Acts.prototype.StopTyping = function(is_show_all)
	{
        this.removeTypingTimer();   
        if (is_show_all)
        {
            this.setText(this.content);
            this.runtime.trigger(cr.behaviors.Rex_text_typing.prototype.cnds.OnTypingCompleted, this.inst);
        }
	};
    
	Acts.prototype.AppendText = function(param)
	{
        var startIndex = this.rawTextLength;
        if (typeof param === "number")
            param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
        this.content += param.toString();
        if (!this.is_typing())
            this.startTyping(this.content, this.typingspeed, startIndex);
	};    

    Acts.prototype.Pause = function ()
	{
	    if (this.typingTimer == null)
	        return;
	        
	    this.typingTimer.Suspend();
	};   

    Acts.prototype.Resume = function ()
	{
	    if (this.typingTimer == null)
	        return;
	    
	    this.typingTimer.Resume();
	};       
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
    Exps.prototype.TypingSpeed = function (ret)
	{
	    ret.set_float( this.typingspeed );
	};
    
    Exps.prototype.TypingIndex = function (ret)
	{
	    ret.set_float( this.typingIndex -1 );
	};	

    Exps.prototype.Content = function (ret)
	{
	    ret.set_string( this.content );
	};
    
    Exps.prototype.LastTypingCharacter = function (ret)
	{
	    ret.set_string( this.content.charAt(this.typingIndex-1) );
	};	
}());