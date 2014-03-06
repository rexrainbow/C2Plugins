/**
 * Copyright (c) 2011 Pere Monfort Pàmies (http://www.pmphp.net)
 * Official site: http://www.canvastext.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
 
(function ()
{
    var savedClasses = {};        // global class define
    var CanvasText = function ()
    {
        // The property that will contain the ID attribute value.
        this.canvasId = null;
        // The property that will contain the Canvas element.
        this.canvas = null;
        // The property that will contain the canvas context.
        this.context = null;
        // The property that will contain the created style class.
        //this.savedClasses = [];
        
        this.rawTextLine = [pkgCache.allocLine("", null, 0)];
        this._text_pkg = [];
        
        /*
         * Default values.
         */
        this.fontFamily = "Verdana";
        this.fontWeight = "normal";
        this.fontSize = "12px";
        this.fontColor = "#000000";
        this.fontStyle = "normal";
        this.textAlign = "start";
        this.textBaseline = "alphabetic";
        this.lineHeight = "16";
        this.textShadow = null; 
        
        // Properties of C2 text object
		this.wrapbyword = 1;   // 0=word, 1=character
		this.halign = 0;          // 0=left, 1=center, 2=right
		this.valign = 0;          // 0=top, 1=center, 2=bottom
		this.vshift = 0;
    };
    var CanvasTextProto = CanvasText.prototype;
    
    /**
     * Set the main values.
     * @param object config Text properties.
     */    
    CanvasTextProto.config = function (config) {
        var property;
        /*
         * Loop the config properties.
         */
        for (property in config) {
            // If it's a valid property, save it.
            if (this[property] !== undefined) {
                this[property] = config[property];
            }
        }
    };
    
    CanvasTextProto._text_prop_get = function (prop)
    {
        var proFont={}, proColor, proShadow;
        // Default color
        proColor = this.fontColor;
        // Default font
        proFont.style = this.fontStyle;
        proFont.weight = this.fontWeight;
        proFont.size = this.fontSize;
        proFont.family = this.fontFamily;

        // Default shadow
        proShadow = this.textShadow;
        
        if (prop != null)
        {
            /*
            * Loop the class properties.
             */
            for (atribute in prop) 
            {
                switch (atribute) 
                {
                //case "font":
                //    proFont = prop[atribute];
                //    break;
                case "fontFamily":
                    proFont.family = prop[atribute];
                    break;
                case "fontWeight":
                    proFont.weight = prop[atribute];
                    break;
                case "fontSize":
                    proFont.size = prop[atribute];
                    break;
                case "fontStyle":
                    proFont.style = prop[atribute];
                    break;
                case "fontColor":
                    proColor = prop[atribute];
                    break;
                //case "textShadow":
                //    proShadow = this.trim(prop[atribute]);
                //    proShadow = proShadow.split(" ");
                //    if (proShadow.length != 4)
                //       proShadow = null;                
                //    break;
                }
            }
        }
        

        //// Font styles.
        this.context.font = proFont.style + " " + proFont.weight + " " + proFont.size + " " + proFont.family;
        // Set the color.
        this.context.fillStyle = proColor;
        // Set the Shadow.
        //if (proShadow != null) {
        //    this.context.shadowOffsetX = proShadow[0].replace("px", "");
        //    this.context.shadowOffsetY = proShadow[1].replace("px", "");
        //    this.context.shadowBlur = proShadow[2].replace("px", "");
        //    this.context.shadowColor = proShadow[3].replace("px", "");
        //}  
        
        return { font: this.context.font,
                 color: this.context.fillStyle,
                 //shadow: proShadow
                };
    };
    
    
    CanvasTextProto._draw_word = function (prop, offset_x, offset_y)
    {
        this.context.save(); 
        
        this.context.font = prop.font;
        this.context.fillStyle = prop.color;
        //var proShadow = prop.shadow;
        //if (proShadow != null) {
        //    this.context.shadowOffsetX = proShadow[0].replace("px", "");
        //    this.context.shadowOffsetY = proShadow[1].replace("px", "");
        //    this.context.shadowBlur = proShadow[2].replace("px", "");
        //    this.context.shadowColor = proShadow[3].replace("px", "");
        //} 
        this.context.textBaseline = this.textBaseline;
        //this.context.textAlign = this.textAlign;
        this.context.fillText(prop.text, offset_x + prop.x, offset_y + prop.y);
        
        this.context.restore();
    };
    
    CanvasTextProto._draw_text = function (pens, boxWidth, boxHeight)
    {    
        var i,l,lcnt = pens.length;
        var j,w,wcnt, last_word, line_width;
        var offset_x=0, offset_y=0;

		// vertical alignment
		if (this.valign === 1)		// center
			offset_y = Math.max( (boxHeight - (lcnt * this.lineHeight)) / 2, 0);
		else if (this.valign === 2)	// bottom
			offset_y = Math.max(boxHeight - (lcnt * this.lineHeight) - 2, 0);
        else
            offset_y = 0;
        
        if (this.textBaseline == "alphabetic")
            offset_y += this.vshift;  // shift line down    
        
			
        for(i=0; i<lcnt; i++)
        {
            l = pens[i];            
            wcnt = l.length;
            if (wcnt == 0)
                continue;
            
            last_word = l[wcnt-1];
            line_width = last_word.x + last_word.width;
			if (this.halign === 1)		// center
				offset_x = (boxWidth - line_width) / 2;
			else if (this.halign === 2)	// right
				offset_x = boxWidth - line_width;  
				          
            for(j=0; j<wcnt; j++)
            {
                w = l[j];
                if (w.text == "")
                    continue;
                this._draw_word(w, offset_x, offset_y);
            }
        }
    };    
    
    /**
     * @param object textInfo Contains the Text string, axis X value and axis Y value.
     */
    var _lines = [];
    
    // pens for draw
    var pens = [[]];
    CanvasTextProto._pens_clean = function()
    {
        var i,lcnt = pens.length;
        for(i=0; i<lcnt; i++)
        {
            penCache.freeAllLines(pens[i]);  
        }
        pens.length = 1;
        pens[0].length = 0;
    };
    
    var propname_map = 
    {
    "color":"fontColor",
    "font-family":"fontFamily",
    "font-size":"fontSize",
    "font-weight":"fontWeight",
    "font-style":"fontStyle",
    };
    var _style2prop = function(properties)   // property list
    {
        var i, cnt=properties.length;
        var prop = {}, property;
        for (i= 0; i<cnt; i++) 
        {
            property = properties[i].split(":");
            if (isEmpty(property[0]) || isEmpty(property[1])) 
            {
                // Wrong property name or value. We jump to the
                // next loop.
                continue;
            }
            prop[propname_map[property[0]]] = property[1];
        }
        return prop;
    };
    
    CanvasTextProto.drawText = function (textInfo) 
    {  	
        // Save the textInfo into separated vars to work more comfortably.
        var text = textInfo.text, start_x = textInfo.x, y = textInfo.y;
        // Needed vars for automatic line break;
        var splittedText, xAux, textLines = _lines, boxWidth = textInfo.boxWidth;
        // Declaration of needed vars.
        var classDefinition, proText;
        // Loop vars
        var i, j, k, n;
		var cursor_x = start_x;
		var text_prop;
		
        this.rawTextLine.length = 1;
		this.rawTextLine[0].text = "";
		
        // The main regex. Looks for <style>, <class> or <br /> tags.
        var match = text.match(/<\s*br\s*\/>|<\s*class=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/class\s*\>|<\s*style=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/style\s*\>|[^<]+/g);
		if (!match)
		    return;
        var match_cnt = match.length;
        var innerMatch = null;


		var acc_line_len = 0;
        
        // Let's draw something for each match found.
        for (i = 0; i < match_cnt; i++) 
        {
            // Save the current context.
            this.context.save();        
            
            // Check if current fragment is a class tag.
            if (/<\s*class=/i.test(match[i])) 
            { 
                // Looks the attributes and text inside the class tag.
                innerMatch = match[i].match(/<\s*class=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/class\s*\>/);
               
                classDefinition = this.getClass(innerMatch[1]);
                proText = innerMatch[2];
                text_prop = this._text_prop_get(classDefinition);
            }
            else if (/<\s*style=/i.test(match[i])) 
            {
                // Looks the attributes and text inside the style tag.
                innerMatch = match[i].match(/<\s*style=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/style\s*\>/);

                // innerMatch[1] contains the properties of the attribute.
                var properties = _style2prop(innerMatch[1].split(";"));                
                proText = innerMatch[2];
                text_prop = this._text_prop_get(properties);
                
            } else if (/<\s*br\s*\/>/i.test(match[i])) 
            {
                // Check if current fragment is a line break.
                y += this.lineHeight;
                start_x = textInfo.x;
                continue;
            } else 
            {
                // Text without special style.
                proText = match[i];
                text_prop = this._text_prop_get();
            }
            
            // Set the text Baseline
            this.context.textBaseline = this.textBaseline;
            // Set the text align
            this.context.textAlign = this.textAlign;

            // Reset textLines;
            textLines.length = 0;
			// boxWidth comes from plugin
            textLines = _word_wrap(proText, textLines, this.context, boxWidth, this.wrapbyword, cursor_x-start_x );
            
            // save pen info
            var lcnt=textLines.length, txt;         
            var last_line_index=this.rawTextLine.length-1; 
            var cur_line, cur_line_char_cnt, is_new_line;           
            for (n = 0; n < lcnt; n++) {
                cur_line = textLines[n];
                txt = cur_line.text;
                
                var _word_pen = penCache.allocLine();
                _word_pen.text = txt;
                _word_pen.x = cursor_x;
                _word_pen.y = y;
                _word_pen.width = cur_line.width;
                _word_pen.font = text_prop.font;
                _word_pen.color = text_prop.color;
                //_word_pen.shadow = text_prop.shadow; 
                pens[last_line_index].push(_word_pen);
                    
				cursor_x = (cur_line.new_line)? textInfo.x : (cursor_x+cur_line.width);
				if (cur_line.new_line)
				    y += this.lineHeight;
								                
				this.rawTextLine[last_line_index].text += txt;				
				if (cur_line.new_line) // not the last line
				{
				    cur_line_char_cnt = this.rawTextLine[last_line_index].text.length;
				    if (cur_line.new_line)   // has "\n"
				        cur_line_char_cnt ++;
				    acc_line_len += cur_line_char_cnt;
					this.rawTextLine.push(pkgCache.allocLine("", null, acc_line_len));  
                    last_line_index ++; 
                    
                    pens.push([]);
				}
            }
            this.context.restore();
        }
  
        // Let's draw the text
        this._draw_text(pens, textInfo.boxWidth, textInfo.boxHeight);
        
        this._pens_clean();
        
    }; 

    CanvasTextProto._text_pkg_get = function (text) 
    {
        pkgCache.freeAllLines(this._text_pkg);
        // The main regex. Looks for <style>, <class> or <br /> tags.
        var match = text.match(/<\s*br\s*\/>|<\s*class=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/class\s*\>|<\s*style=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/style\s*\>|[^<]+/g);
		if (!match)
		    return this._text_pkg;
			
        var innerMatch=null, classDefinition=null;
        var i, icnt=match.length;
        var start_index=0;
        for (i=0; i<icnt; i++) 
        {
             // Check if current fragment is a class tag.
            if (/<\s*class=/i.test(match[i]))
            {
                // Looks the attributes and text inside the class tag.
                innerMatch = match[i].match(/<\s*class=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/class\s*\>/);               
                this._text_pkg.push( pkgCache.allocLine(innerMatch[2], innerMatch[1], start_index) );
                start_index += innerMatch[2].length;
            }
            // Text without special style.
            else
            {
                this._text_pkg.push( pkgCache.allocLine(match[i], null, start_index) );
                start_index += match[i].length;
            }
        }
        return this._text_pkg;
    };
    CanvasTextProto.rawTextGet = function (text)
    {
        var text_pkg = (text == null)? this._text_pkg: this._text_pkg_get(text);
        var raw_text="", i, icnt= text_pkg.length;
        for (i=0; i<icnt; i++)
            raw_text += text_pkg[i].text;
        return raw_text;
    };
    CanvasTextProto.textGet = function (start, end, text)
    {
        var text_pkg = (text == null)? this._text_pkg: this._text_pkg_get(text);
        var ret_text = "";
        var i, icnt= text_pkg.length, string_start, string_end;
        var _pkg;
        for (i=0; i<icnt; i++)
        {
            _pkg = text_pkg[i];
            string_start = _pkg.index;
            string_end = string_start + _pkg.text.length;
            if ((string_end < start) || (string_start >= end))
                continue;
                
            if (_pkg.tag != null)
                ret_text += "<class='"+_pkg.tag+"'>";
            if ((string_start >= start) && (string_end < end))
                ret_text += _pkg.text;
            else
                ret_text += _pkg.text.substring(start-string_start, end-string_start);

            if (_pkg.tag != null)
                ret_text += "</class>";            
        }
        return ret_text;
    }

    /**
     * Save a new class definition.
     */
    CanvasTextProto.defineClass = function (id, definition) {
        // Save it.
        //this.savedClasses[id] = definition;
		savedClasses[id] = definition;
        return true;
    }; 
    
    /**
     * Returns a saved class.
     */
    CanvasTextProto.getClass = function (id) {
        //if (this.savedClasses[id] !== undefined) {
        //    return this.savedClasses[id];
        //}
		return savedClasses[id];
    };
    
    /**
     * A simple function to check if the given value is empty.
     */
    var isEmpty = function (str) {
        // Remove white spaces.
        str = str.replace(/^\s+|\s+$/, '');
        return str.length == 0;
    };    
    
    /**
     * Check if a line break is needed.
     */
    CanvasTextProto.checkLineBreak = function (text, boxWidth, x) {
        return (this.context.measureText(text).width + x > boxWidth);
    };
    /**
     * A simple function clear whitespaces.
     */
    CanvasTextProto.trim = function (str) {
        var ws, i;
        str = str.replace(/^\s\s*/, '');
        ws = /\s/;
        i = str.length;
        while (ws.test(str.charAt(--i))) {
            continue;
        }
        return str.slice(0, i + 1);
    };       

// ----
    var ObjCacheKlass = function ()
    {        
        this.lines = [];       
    };
    var ObjCacheKlassProto = ObjCacheKlass.prototype;   
    
	ObjCacheKlassProto._allocLine = function()
	{
		return (this.lines.length > 0)? this.lines.pop(): {};
	};
	ObjCacheKlassProto.freeLine = function (l)
	{
		this.lines.push(l);
	};	
	ObjCacheKlassProto.freeAllLines= function (arr)
	{
		var i, len;
		for (i = 0, len = arr.length; i < len; i++)
			this.freeLine(arr[i]);
		arr.length = 0;
	};
	
	var pkgCache = new ObjCacheKlass();
    pkgCache.allocLine = function(_text, _tag, _index)
	{
	    var pkg = this._allocLine();
		pkg.text = _text;
		pkg.tag = _tag;
		pkg.index = _index;
		return pkg;
	};
	
	var lineCache = new ObjCacheKlass();
    lineCache.allocLine = function(_text, _width, _new_line)
	{
	    var l = this._allocLine();
		l.text = _text;
		l.width = _width;
		l.new_line = _new_line;     // for "\n" char
		return l;
	};	
    
	var penCache = new ObjCacheKlass();
    penCache.allocLine = function()
	{
		return this._allocLine();
	};	
	
	
	var wordsCache = [];
	var _tokenise_words = function (text)
	{
		wordsCache.length = 0;
		var cur_word = "";
		var ch;
		
		// Loop every char
		var i = 0;
		
		while (i < text.length)
		{
			ch = text.charAt(i);
			
			if (ch === "\n")
			{
				// Dump current word if any
				if (cur_word.length)
				{
					wordsCache.push(cur_word);
					cur_word = "";
				}
				
				// Add newline word
				wordsCache.push("\n");
				
				++i;
			}
			// Whitespace or hyphen: swallow rest of whitespace and include in word
			else if (ch === " " || ch === "\t" || ch === "-")
			{
				do {
					cur_word += text.charAt(i);
					i++;
				}
				while (i < text.length && (text.charAt(i) === " " || text.charAt(i) === "\t"));
				
				wordsCache.push(cur_word);
				cur_word = "";
			}
			else if (i < text.length)
			{
				cur_word += ch;
				i++;
			}
		}
		
		// Append leftover word if any
		if (cur_word.length)
			wordsCache.push(cur_word);
			
	    return wordsCache;
	};	
	
	var _wrap_text = function (text, lines, ctx, width, wrapbyword, offset_x)
	{
		var wordArray = (wrapbyword)?  _tokenise_words(text) : text;
			
		var cur_line = "";
		var prev_line;
		var line_width;
		var i, wcnt=wordArray.length;
		var lineIndex = 0;
		var line;
		
		for (i = 0; i < wcnt; i++)
		{
			// Look for newline
			if (wordArray[i] === "\n")
			{
				// Flush line.  Recycle a line if possible
				if (lineIndex >= lines.length)
					lines.push(lineCache.allocLine(cur_line, ctx.measureText(cur_line).width, true));
					
				lineIndex++;
				cur_line = "";
				continue;
			}
			
			// Otherwise add to line
			prev_line = cur_line;
			cur_line += wordArray[i];
			
			// Measure line
			line_width = ctx.measureText(cur_line).width;
			
			// Line too long: wrap the line before this word was added
			if (line_width >= (width - offset_x))
			{
				// Append the last line's width to the string object
				if (lineIndex >= lines.length)
					lines.push(lineCache.allocLine(prev_line, ctx.measureText(prev_line).width, true));
					
				lineIndex++;
				cur_line = wordArray[i];
				
				// Wrapping by character: avoid lines starting with spaces
				if (!wrapbyword && cur_line === " ")
					cur_line = "";
					
		        offset_x = 0;
			}
		}
		
		// Add any leftover line
		if (cur_line.length)
		{
			if (lineIndex >= lines.length)
				lines.push(lineCache.allocLine(cur_line, ctx.measureText(cur_line).width, false));
					
			lineIndex++;
		}
		
		// truncate lines to the number that were used. recycle any spare line objects
		for (i = lineIndex; i < lines.length; i++)
			lineCache.freeLine(lines[i]);
		
		lines.length = lineIndex;
		return lines;
	};
	
	var _word_wrap = function (text, lines, ctx, width, wrapbyword, offset_x)
	{	    
		if (!text || !text.length)
		{
			lineCache.freeAllLines(lines);
			return lines;
		}
			
		if (width <= 2.0)
		{
			lineCache.freeAllLines(lines);
			return lines;
		}
		
		// If under 100 characters (i.e. a fairly short string), try a short string optimisation: just measure the text
		// and see if it fits on one line, without going through the tokenise/wrap.
		// Text musn't contain a linebreak!
		if (text.length <= 100 && text.indexOf("\n") === -1)
		{
			var all_width = ctx.measureText(text).width;
			
			if (all_width <= (width - offset_x))
			{
				// fits on one line
				lineCache.freeAllLines(lines);
				lines.push(lineCache.allocLine(text, all_width, false));
				return lines;
			}
		}
			
		return _wrap_text(text, lines, ctx, width, wrapbyword, offset_x);
	};	
	
    
    window["canvas_text"] = CanvasText;  
    	
}()); 