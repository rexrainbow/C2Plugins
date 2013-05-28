// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_DebugPanel = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	var pluginProto = cr.plugins_.Rex_DebugPanel.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
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

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
        this.panel = null;
        this.debug_panel_doucment = null;
        
        this.enable = (this.properties[0]==1);
        if (!this.enable)
            return;

        var actived = (this.properties[1]==1);
        if (this.enable && actived)
        {
            this._create_panel();
            this.watch_vars = {};
        }
        var is_stay_on_top = (this.properties[2]==1);
        if (is_stay_on_top)
        {
            this.runtime.tickMe(this);
        }
        this.max_log_length = this.properties[3];
        
		jQuery(document).keyup(
			(function (self) {
				return function(info) {
					self.onKeyUp(info);
				};
			})(this)
		);        
        this.KEY_POPUP = 113;  // F2
	};
	
	instanceProto.onDestroy = function ()
	{
	};
	
	instanceProto.tick = function ()
	{
        // always stay on top
        if (this._has_panel()) 
        {
            this.panel.focus();
        }
	};
    
	instanceProto._pop_up_debug_panel = function ()
	{
        if (!this._has_panel())
            this._create_panel()
        else
            this.panel.focus();   
	}; 
    
	instanceProto.onKeyUp = function (info)
	{
		var keycode = info.which;
        if (keycode == this.KEY_POPUP)
        {
            this._pop_up_debug_panel();          
        }
	};    
	
	// only called if a layout object
	instanceProto.draw = function(ctx)
	{
	};
	
	instanceProto.drawGL = function(glw)
	{
	};
    
	instanceProto._has_panel = function ()
	{
        return ((this.panel != null) && (!this.panel.closed));
	}; 

	instanceProto._create_panel = function ()
	{
        if (!this._has_panel())
        {        
            //scrollbars=yes
            var panel = window.open("", "Debug", "height=600, width=200, location=no, menubar=no, status=no"); 
            var html_code;
            html_code  = "<div style='overflow:auto; height:40%'>";
            html_code += "<table id='watch_table' width='100%' border='1'>";
            html_code += "<caption>Watch</caption>";
            html_code += "</table>";
            html_code += "</div>";
            html_code += "<div id='logger' style='overflow:auto; height:60%'></div>";
            panel.document.write(html_code);

            this.panel = panel;            
            this.debug_panel_doucment = panel.document;
        }
	};   
    
	instanceProto._close_panel = function ()
	{
        if (this._has_panel())
        {
            this.panel.close();
            this.panel = null;
        }
	};    

	instanceProto._get_log_panel = function ()
	{
        return this.debug_panel_doucment.getElementById("logger");
	};      
    
	instanceProto._get_watch_table = function ()
	{
        return this.debug_panel_doucment.getElementById("watch_table");
	};  
    
    instanceProto._create_text_node = function (text, color)
    {       
        if (typeof text != "string")
            text = text.toString();
        var text_node = document.createTextNode(text);
        var font_node = document.createElement("font");
        if (typeof color == "string")
            font_node.style.color = color;
        font_node.appendChild(text_node);
        return font_node;
    };
    
    instanceProto._create_br_node = function ()
    {
        var br_node = this.debug_panel_doucment.createElement("BR");;
        return br_node;
    };    
     
	instanceProto._append_log_message = function (message, color)
	{
        var _log_panel = this._get_log_panel(); 
        
        _log_panel.appendChild(this._create_text_node(message, color));
        _log_panel.appendChild(this._create_br_node());
        _log_panel.scrollTop = _log_panel.scrollHeight;
   
        if (this.max_log_length != 0)
        {            
            var log_length = _log_panel.childNodes.length/2;
            if (log_length > this.max_log_length)
            {
                _log_panel.removeChild(_log_panel.firstChild);
                _log_panel.removeChild(_log_panel.firstChild);
            }
        }        
	};      
 
	instanceProto._update_data = function (name, value, row_index)
	{
        var table = this._get_watch_table();        
        var row, cell0, cell1;
        if (row_index == null)
        {
            var row_count = table.rows.length;
            row = table.insertRow(row_count);
            row_index = row_count;
            cell0 = row.insertCell(0);
            cell0.appendChild(this._create_text_node(name));
            cell1 = row.insertCell(1);
            cell1.appendChild(this._create_text_node(value));
        }
        else
        {
            if (typeof value != "string")
                value = value.toString();
            cell1 = table.rows[row_index].cells[1];
            var font_node = cell1.childNodes[0];
            var text_node = font_node.childNodes[0];
            var old_value = text_node.nodeValue;
            if (old_value != value)
            {
                font_node.style.color = "red";
                text_node.nodeValue = value;  
            }
            else
            {
                font_node.style.color = "black";
            }
        }        
        return row_index;
	};

	instanceProto.saveToJSON = function ()
	{    
		return { "key": this.KEY_POPUP
                 };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.KEY_POPUP = o["key"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
        if (!this.enable)
            return;
        if (s==1)
            this._create_panel();
        else
            this._close_panel();
	};  
    
	Acts.prototype.CleanMessages = function ()
	{
        if (this._has_panel())
        {
            var _log_panel = this._get_log_panel();
            while (_log_panel.hasChildNodes()) {
                _log_panel.removeChild(_log_panel.lastChild);
            }
		}
	};      
    
	Acts.prototype.AppendLogMessage = function (message)
	{
        if (this._has_panel())
        {    
            this._append_log_message(message, "black");
        }
	};
    
	Acts.prototype.AppendErrorMessage = function (message)
	{
        if (!this.enable)
            return;
        this._pop_up_debug_panel();           
        this._append_log_message(message, "red");
	};
    
	Acts.prototype.UpdateWatchVariable = function (name, value)
	{
        if (this._has_panel())
        {
            var row_index = this.watch_vars[name];
            row_index = this._update_data(name, value, row_index);
            this.watch_vars[name] = row_index;
        }
	}; 
    
	Acts.prototype.SetPopupKey = function (keycode)
	{
        if (!this.enable)
            return;    
		this.KEY_POPUP = keycode;
	};      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());