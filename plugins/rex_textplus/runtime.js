// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_TextPlus = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_TextPlus.prototype;

	pluginProto.onCreate = function ()
	{
		// Override the 'set width' action
		pluginProto.acts.SetWidth = function (w)
		{
			if (this.width !== w)
			{
				this.width = w;
				this.text_changed = true;	// also recalculate text wrapping
				this.set_bbox_changed();
			}
		};
	};

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
		this.lines = [];		// for word wrapping
		this.text_changed = true;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
		this.text = this.properties[0];
		this.visible = (this.properties[1] === 0);	// 0=visible, 1=invisible
		this.font = this.properties[2];
		this.color = this.properties[3];
		this.halign = this.properties[4];			// 0=left, 1=center, 2=right
		
		// Get the font height in pixels.
		// Look for token ending "NNpt" in font string (e.g. "bold 12pt Arial").
		var arr = this.font.split(" ");
		var ptSize = 0;
		
		var i;
		for (i = 0; i < arr.length; i++)
		{
			// Ends with 'pt'
			if (arr[i].substr(arr[i].length - 2, 2) === "pt")
			{
				ptSize = parseInt(arr[i].substr(0, arr[i].length - 2));
				this.pxHeight = Math.ceil((ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
				break;
			}
		}
		
		assert2(this.pxHeight, "Could not determine font text height");
	};

	instanceProto.draw = function(ctx)
	{
		ctx.font = this.font;
		ctx.textBaseline = "top";
		ctx.fillStyle = this.color;
		
		// Set global alpha if opacity not 100%
		if (this.opacity !== 1.0)
			ctx.globalAlpha = this.opacity;
		
		// If text has changed, run the word wrap.
		if (this.text_changed)
		{
			this.type.plugin.WordWrap(this.text, this.lines, ctx, this.width);
			this.text_changed = false;
		}
		
		// Draw each line after word wrap
		var penX = this.x - (this.hotspotX * this.width);
		var penY = this.y - (this.hotspotY * this.height);
		
		if (this.runtime.pixel_rounding)
		{
			penX = Math.round(penX);
			penY = Math.round(penY);
		}
		
		var endY = penY + this.height;
		var line_height = this.pxHeight;
		var drawX;
		var i;
		
		for (i = 0; i < this.lines.length; i++)
		{
			// Adjust the line draw position depending on alignment
			drawX = penX;
			
			if (this.halign === 1)		// center
				drawX = penX + (this.width - this.lines[i].width) / 2;
			else if (this.halign === 2)	// right
				drawX = penX + (this.width - this.lines[i].width);
				
			ctx.fillText(this.lines[i].text, drawX, penY);
			penY += line_height;
			
			if (penY >= endY - line_height)
				break;
		}
		
		// Restore global alpha if opacity was not 100%
		if (this.opacity !== 1.0)
			ctx.globalAlpha = 1.0;
	};
	
	var wordsCache = [];

	pluginProto.TokeniseWords = function (text)
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
			else if ( (ch === " ") || (ch === "\t") || (ch === "-") ||
                      (ch.charCodeAt(0) >= 128) )
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
	};

	pluginProto.WordWrap = function (text, lines, ctx, width)
	{
		if (!text || !text.length)
		{
			lines.length = 0;
			return;
		}
			
		if (width <= 2.0)
		{
			lines.length = 0;
			return;
		}
		
		// If under 100 characters (i.e. a fairly short string), try a short string optimisation: just measure the text
		// and see if it fits on one line, without going through the tokenise/wrap (which tends to create garbage)
		// Text musn't contain a linebreak!
		if (text.length <= 100 && text.indexOf("\n") === -1)
		{
			var all_width = ctx.measureText(text).width;
			
			if (all_width <= width)
			{
				// fits on one line
				if (lines.length)
					lines.length = 1;
				else
					lines.push({});
					
				lines[0].text = text;
				lines[0].width = all_width;
				return;
			}
		}
			
		this.WordWrapByWord(text, lines, ctx, width);
	};

	pluginProto.WordWrapByWord = function (text, lines, ctx, width)
	{
		this.TokeniseWords(text);	// writes to wordsCache
		var cur_line = "";
		var prev_line;
		var line_width;
		var i;
		var lineIndex = 0;
		var line;
		
		for (i = 0; i < wordsCache.length; i++)
		{
			// Look for newline
			if (wordsCache[i] === "\n")
			{
				// Flush line.  Recycle a line if possible
				if (lineIndex >= lines.length)
					lines.push({});
					
				line = lines[lineIndex];
				line.text = cur_line;
				line.width = ctx.measureText(cur_line).width;
				lineIndex++;
				cur_line = "";
				continue;
			}
			
			// Otherwise add to line
			prev_line = cur_line;
			cur_line += wordsCache[i];
			
			// Measure line
			line_width = ctx.measureText(cur_line).width;
			
			// Line too long: wrap the line before this word was added
			if (line_width >= width)
			{
				// Append the last line's width to the string object
				if (lineIndex >= lines.length)
					lines.push({});
					
				line = lines[lineIndex];
				line.text = prev_line;
				line.width = ctx.measureText(prev_line).width;
				lineIndex++;
				cur_line = wordsCache[i];
			}
		}
		
		// Add any leftover line
		if (cur_line.length)
		{
			if (lineIndex >= lines.length)
				lines.push({});
				
			line = lines[lineIndex];
			line.text = cur_line;
			line.width = ctx.measureText(cur_line).width;
			lineIndex++;
		}
		
		// truncate lines to the number that were used
		lines.length = lineIndex;
	};

	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;

	cnds.CompareText = function(text_to_compare, case_sensitive)
	{
		if (case_sensitive)
			return this.text == text_to_compare;
		else
			return this.text.toLowerCase() == text_to_compare.toLowerCase();
	};

	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

	acts.SetText = function(param)
	{
		if (typeof param === "number")
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		
		var text_to_set = param.toString();
		
		if (this.text !== text_to_set)
		{
			this.text = text_to_set;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};
	
	acts.AppendText = function(param)
	{
		if (typeof param === "number")
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
			
		var text_to_append = param.toString();
		
		if (text_to_append)	// not empty
		{
			this.text += text_to_append;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

	exps.Text = function(ret)
	{
		ret.set_string(this.text);
	};
		
}());