// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");


window["Rex_DebugPanel_inst"] = {};
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
        this._objs = {};          
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
        this.is_stay_on_top = (this.properties[2]==1);
        this.max_log_length = this.properties[3];
        this.runtime.tickMe(this);
        
		jQuery(document).keyup(
			(function (self) {
				return function(info) {
					self.onKeyUp(info);
				};
			})(this)
		);        
        this.KEY_POPUP = 113;  // F2
       
        // save instance
        window["Rex_DebugPanel_inst"][this.uid] = this;
        // toggle pause
        this.is_pause = false;
        this.previous_timescale = 0;
        // step
        this.step_stage = 0;
	};
	
	instanceProto.onDestroy = function ()
	{
	};
	
	instanceProto.tick = function ()
	{
        this._stay_on_top();               
        this._step();
	};
    
    instanceProto._stay_on_top = function()
    {
        if (this.is_stay_on_top && this._has_panel()) 
            this.panel.focus();    
    };
    
    instanceProto._step = function()
    {
        switch(this.step_stage)
        {
        case 1:
            this.toggle_pause(false);
            this.step_stage = 2;
            break;
        case 2: 
            debugger;
            this.toggle_pause(true);
            this.step_stage = 0;
            break;
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
            var html_code = "\
<html>\
<style rel='text/css'>\
body{\
  font-family:verdana, sans-serif;\
}\
h2 {\
  font-size:1em;\
  letter-spacing:1em;\
  font-variant:small-caps;\
  margin:0;\
  margin-top:1em;\
  margin:1em 0 0.4em;\
  text-align:center;\
  font-weight:normal;\
}\
input,form {\
  margin:0;\
}\
th,td{\
  border:1px solid black;\
  margin:0;\
  padding:0.4em 1em;\
  text-align:left;\
  border-spacing:0;\
}\
table{\
  border-collapse:collapse;\
}\
</style>\
<head>\
<script language='javascript' type='text/javascript'>\
function _parent_inst(){return opener.window.Rex_DebugPanel_inst[window.parent_uid];}\
function _toggle_pause() {_parent_inst().toggle_pause();}\
function _step() {_parent_inst().step();}\
</script>\
</head>\
<body>\
<div style='overflow:auto'>\
<h2>Watch</h2>\
<table id='watch_table'>\
  <tbody><tr>\
    <th>Alias</th>\
    <th>Value</th>\
  </tr>\
</table>\
</div>\
<h2>Log</h2>\
<div id='logger' style='overflow:auto'></div>\
<h2>Control</h2>\
<div id='Control'>\
  <form>\
    <input type='button' value='Pause' name='play_pause' onClick='_toggle_pause();'>\
    <input type='button' value='Step' name='step' onClick='_step();'>\
  </form>\
</div>\
</body></html>";
            panel.document.write(html_code);
            panel.window.parent_uid = this.uid;

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
    
    instanceProto.toggle_pause = function (state)
    {
        var cur_state = this.is_pause;
        if (state == cur_state)
            return;
            
        this.is_pause = (!cur_state);
        if (this.is_pause)
        {
            this.previous_timescale = this.runtime.timescale;
            this.runtime.timescale = 0;
        }
        else
        {
            this.runtime.timescale = this.previous_timescale;
        }
    };  
    
    instanceProto.step = function ()
    {
        if (!this.is_pause)
            return;

        this.step_stage = 1;
    };      
    
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

	acts.SetActivated = function (s)
	{
        if (!this.enable)
            return;
        if (s==1)
            this._create_panel();
        else
            this._close_panel();
	};  
    
	acts.CleanMessages = function ()
	{
        if (this._has_panel())
        {
            var _log_panel = this._get_log_panel();
            while (_log_panel.hasChildNodes()) {
                _log_panel.removeChild(_log_panel.lastChild);
            }
		}
	};      
    
	acts.AppendLogMessage = function (message)
	{
        if (this._has_panel())
        {    
            this._append_log_message(message, "black");
        }
	};
    
	acts.AppendErrorMessage = function (message)
	{
        if (!this.enable)
            return;
        this._pop_up_debug_panel();           
        this._append_log_message(message, "red");
	};
    
	acts.UpdateWatchVariable = function (name, value)
	{
        if (this._has_panel())
        {
            var row_index = this.watch_vars[name];
            row_index = this._update_data(name, value, row_index);
            this.watch_vars[name] = row_index;
        }
	}; 
    
	acts.SetPopupKey = function (keycode)
	{
        if (!this.enable)
            return;    
		this.KEY_POPUP = keycode;
	};      
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

}());