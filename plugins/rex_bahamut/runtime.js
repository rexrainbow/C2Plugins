// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

// load jquery.xdomainajax.js
document.write('<script src="jquery.xdomainajax.js"></script>');

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Bahamut = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Bahamut.prototype;
		
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
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
	    this._user_data = {};
	    this._current_user_name = "";
	};
		
    var _is_vaild_html = function(content)
    {
        return content.indexOf("查詢失敗") == (-1);
    };
    
	var _get_user_property = function(content, property_name)
	{	    
	    property_name += "：";
	    var key = "<p>"+property_name;
	    var start_index = content.indexOf(key);
	    if (start_index == (-1))
	    {
	        key = "<li>"+property_name;
	        start_index = content.indexOf(key);
	    }
	    if (start_index == (-1))
	        return null;
	    start_index += key.length;
	    var end_index = content.indexOf("<", start_index);
	    var value_string = content.substring(start_index, end_index);
	    return parseInt(value_string);
	};
   
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    

	cnds.OnGetUserData = function()
	{    
		return true;
	};
	cnds.OnGetUserDataFailed = function()
	{
		return true;
	};    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

	acts.GetUserData = function(user_name)
	{       
	    this._current_user_name = user_name;	    
	    var inst = this;
        jQuery.ajax({
            "url": "http://home.gamer.com.tw/homeindex.php?owner="+user_name,
            "type": 'GET',
            "success": function(res) {
                var content = res.responseText;
                content = content.replace(/\r\n/g, "\n");
                var usr_name = user_name;
                inst._current_user_name = user_name;
                if (_is_vaild_html(content))
                {
                    if (inst._user_data[usr_name] == null)
                        inst._user_data[usr_name] = {}; 
                    var properties = inst._user_data[usr_name];         
                    properties.STR = _get_user_property(content, "STR");
                    properties.DEX = _get_user_property(content, "DEX");
                    properties.INT = _get_user_property(content, "INT");
                    properties.LUK = _get_user_property(content, "LUK");
                    properties.VIT = _get_user_property(content, "VIT");
                    properties.AGI = _get_user_property(content, "AGI");
                    properties.MND = _get_user_property(content, "MND"); 
                    inst.runtime.trigger(cr.plugins_.Rex_Bahamut.prototype.cnds.OnGetUserData, inst);                                                     
                }
                else
                    inst.runtime.trigger(cr.plugins_.Rex_Bahamut.prototype.cnds.OnGetUserDataFailed, inst);
            },
            "error": function()
			{
				inst._current_user_name = user_name;
				inst.runtime.trigger(cr.plugins_.Rex_Bahamut.prototype.cnds.OnGetUserDataFailed, inst);
			},
        });        
	};  
	
	acts.CleanUserData = function()
	{
	    var name;
	    for (name in this._user_data)
	        delete this._user_data[name];
	};
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.Name = function(ret)
	{   
		ret.set_string(this._current_user_name);         
	}; 
		
	exps.STR = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		ret.set_int(this._user_data[user_name].STR);         
	}; 

	exps.DEX = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		ret.set_int(this._user_data[user_name].DEX);           
	}; 	
	
	exps.INT = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		ret.set_int(this._user_data[user_name].INT);         
	}; 

	exps.LUK = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		ret.set_int(this._user_data[user_name].LUK);      
	}; 	
	
	exps.VIT = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		ret.set_int(this._user_data[user_name].VIT);           
	}; 	
	
	exps.AGI = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		ret.set_int(this._user_data[user_name].AGI);           
	}; 

	exps.MND = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		ret.set_int(this._user_data[user_name].MND);          
	};

	exps.ImageURL = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;	    
	    var img_url = "http://avatar2.bahamut.com.tw/avataruserpic/"+
	                  user_name.charAt(0) +"/"+ user_name.charAt(1)+ "/"+ user_name + "/"+user_name+".png";
		ret.set_string(img_url);          
	}; 		
}());