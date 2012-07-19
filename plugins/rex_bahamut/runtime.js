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
	    this._tag = "";
	    this._current_user_name = "";
		this.exp_CurFriendName = "";
		this.exp_CurFriendNickname = "";
	};
	
    instanceProto._get_gamecard_url = function (user_name)
	{
	    if (user_name == null)
	       user_name = this._current_user_name;	    
	    var card_url = "http://gc.bahamut.com.tw/gc/html/"+
	                   user_name.charAt(0) +"/"+ user_name.charAt(1) +"/"+ user_name +".html";
	    return card_url;
	};		
		
    var _is_vaild_html = function(content)
    {
        return (content != "") && content.indexOf("查詢失敗") == (-1);
    };
		
    var _is_error_html = function(content)
    {
        return content.indexOf("<Error>") != (-1);
    };
        
	var _user2property = function(content, property_name)
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
	    return parseFloat(value_string);
	};
	
    var _get_friendlist = function(content)
    {
	    var friend_list = [];
		var bound_index = content.indexOf("<!--內容左側區塊結束-->");		
	    var key = '<a href="http://home.gamer.com.tw/';		
		var key_length = key.length;
		var start_index = content.indexOf(key);		
		var name, end_index, nickname;		
		while (start_index < bound_index)
		{
		    start_index += key_length;
		    end_index = content.indexOf('"', start_index);
			name = content.substring(start_index, end_index);
			nickname = _friendlist_name2nickname(content, name, end_index);
			start_index = content.indexOf(key, end_index+1);
			friend_list.push([name,nickname]);			
		}
        return friend_list;
    };  

    var _friendlist_name2nickname = function (content, name, start_index)
	{
		var nickname, nickname_start_index, nickname_end_index, nickname_key;	
	    nickname_key = name + "<br/>\n";
		nickname_start_index = content.indexOf(nickname_key, start_index);
		nickname_start_index += nickname_key.length;
		nickname_end_index = content.indexOf("</a></td>", nickname_start_index);
		nickname = content.substring(nickname_start_index, nickname_end_index);
		return nickname;
	};	
	
	var _gamecard2nickname = function (content)
	{
	    var nickname_key = '<div id="apDiv1">';
	    var nickname_start_index = content.indexOf(nickname_key);
	    nickname_key = "<p>";
	    nickname_start_index = content.indexOf(nickname_key, nickname_start_index);
	    nickname_start_index += nickname_key.length;
	    var nickname_end_index = content.indexOf("</p>", nickname_start_index);
	    var nickname = content.substring(nickname_start_index, nickname_end_index);
	    return nickname;
	};
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds(); 

	Cnds.prototype.OnGetUserData = function(tag)
	{    
		return (this._tag == tag);
	};
	
	Cnds.prototype.OnGetUserDataFailed = function(tag)
	{
		return (this._tag == tag);
	}; 

	Cnds.prototype.OnGetFriendList = function(tag)
	{    
		return (this._tag == tag);
	};
	
	Cnds.prototype.OnGetFriendListFailed = function(tag)
	{
		return (this._tag == tag);
	}; 

	Cnds.prototype.OnGetGameCard = function(tag)
	{    
		return (this._tag == tag);
	};
	
	Cnds.prototype.OnGetGameCardFailed = function(tag)
	{
		return (this._tag == tag);
	};
			
	Cnds.prototype.ForEachFriend = function (user_name)
	{   
        var current_event = this.runtime.getCurrentEventStack().current_event;
		
        var usr_data = this._user_data[user_name];
		if (usr_data == null)
		    return false;
        var friend_list = usr_data.friend_list;
		if (friend_list == null)
		    return false;		
        var friend_cnt=friend_list.length;
		var i, friend_item;
		for (i=0; i<friend_cnt; i++)
	    {
		    friend_item = friend_list[i];
            this.exp_CurFriendName = friend_item[0];
            this.exp_CurFriendNickname = friend_item[1];
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

		this.exp_CurFriendName = "";
		this.exp_CurFriendNickname = "";
		return false;        
	}; 	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	Acts.prototype.CleanUserData = function()
	{
	    var name;
	    for (name in this._user_data)
	        delete this._user_data[name];
	};
	
	Acts.prototype.GetUserData = function(user_name, tag)
	{       
	    this._current_user_name = user_name;	    
	    var inst = this;
	    var is_success = false;
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
                    var user_data = inst._user_data[usr_name];         
                    user_data.STR = _user2property(content, "STR");
                    user_data.DEX = _user2property(content, "DEX");
                    user_data.INT = _user2property(content, "INT");
                    user_data.LUK = _user2property(content, "LUK");
                    user_data.VIT = _user2property(content, "VIT");
                    user_data.AGI = _user2property(content, "AGI");
                    user_data.MND = _user2property(content, "MND");
				    is_success = true;
                }
                else
			        is_success = false;
            },
            "error": function()
		    {
		        is_success = false;
		    },
		    "complete": function()
		    {
		        var trg_method = (is_success)? 
		                         cr.plugins_.Rex_Bahamut.prototype.cnds.OnGetUserData:
		                         cr.plugins_.Rex_Bahamut.prototype.cnds.OnGetUserDataFailed;
		        inst._tag = tag;
		        inst.runtime.trigger(trg_method, inst);
		    }
        });  	    
	}; 
	
	Acts.prototype.GetFriendList = function(user_name, tag)
	{       
	    this._current_user_name = user_name;	    
	    var inst = this;
	    var is_success = false;
        jQuery.ajax({
            "url": "http://home.gamer.com.tw/friend.php?owner="+user_name,
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
		 	        inst._user_data[usr_name].friend_list = _get_friendlist(content);
                    is_success = true;			
                }
                else
                    is_success = false;
            },
            "error": function()
		     {
		         is_success = false;
		     },
		     "complete": function()
		     {
		        var trg_method = (is_success)? 
		                         cr.plugins_.Rex_Bahamut.prototype.cnds.OnGetFriendList:
		                         cr.plugins_.Rex_Bahamut.prototype.cnds.OnGetFriendListFailed;
		        inst._tag = tag;
		        inst.runtime.trigger(trg_method, inst);
		     }
        });	
	}; 	
	
	Acts.prototype.GetGameCard = function(user_name, tag)
	{       
	    this._current_user_name = user_name;	    
	    var inst = this;
	    var is_success = false;
        jQuery.ajax({
            "url": inst._get_gamecard_url(user_name),
            "type": 'GET',
            "success": function(res) {
                var content = res.responseText;
                content = content.replace(/\r\n/g, "\n");
                var usr_name = user_name;
                inst._current_user_name = user_name;                 
                if (content != "")
                {
                    if (inst._user_data[usr_name] == null)
                        inst._user_data[usr_name] = {}; 
		 	        inst._user_data[usr_name].Nickname = _gamecard2nickname(content);
                    is_success = true;			
                }
                else
                    is_success = false;
            },
            "error": function()
		     {
		         is_success = false;
		     },
		     "complete": function()
		     {
		        var trg_method = (is_success)? 
		                         cr.plugins_.Rex_Bahamut.prototype.cnds.OnGetGameCard:
		                         cr.plugins_.Rex_Bahamut.prototype.cnds.OnGetGameCardFailed;
		        inst._tag = tag;
		        inst.runtime.trigger(trg_method, inst);
		     }
        });	
	}; 	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.CurUserName = function(ret)
	{   
		ret.set_string(this._current_user_name);         
	}; 
		
	Exps.prototype.STR = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		var val = (this._user_data[user_name] == null)?
		           0:this._user_data[user_name].STR;
		ret.set_float(val);         
	}; 

	Exps.prototype.DEX = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		var val = (this._user_data[user_name] == null)?
		           0:this._user_data[user_name].DEX;
		ret.set_float(val);     		
	}; 	
	
	Exps.prototype.INT = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		var val = (this._user_data[user_name] == null)?
		           0:this._user_data[user_name].INT;
		ret.set_float(val);		
	}; 

	Exps.prototype.LUK = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		var val = (this._user_data[user_name] == null)?
		           0:this._user_data[user_name].LUK;
		ret.set_float(val);			
	}; 	
	
	Exps.prototype.VIT = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		var val = (this._user_data[user_name] == null)?
		           0:this._user_data[user_name].VIT;
		ret.set_float(val);	        
	}; 	
	
	Exps.prototype.AGI = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		var val = (this._user_data[user_name] == null)?
		           0:this._user_data[user_name].AGI;
		ret.set_float(val);	      
	}; 

	Exps.prototype.MND = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		var val = (this._user_data[user_name] == null)?
		           0:this._user_data[user_name].MND;
		ret.set_float(val);	      
	};

	Exps.prototype.ImageURL = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;	    
	    var img_url = "http://avatar2.bahamut.com.tw/avataruserpic/"+
	                  user_name.charAt(0) +"/"+ user_name.charAt(1)+ "/"+ user_name +"/"+ user_name +".png";
		ret.set_string(img_url);          
	}; 	
	
	Exps.prototype.CurFriendName = function(ret)
	{   
		ret.set_string(this.exp_CurFriendName);         
	}; 
	
	Exps.prototype.CurFriendNickname = function(ret)
	{   
		ret.set_string(this.exp_CurFriendNickname);         
	}; 	

	Exps.prototype.GameCardURL = function(ret, user_name)
	{   
		ret.set_string(this._get_gamecard_url(user_name));
	}; 	
	
	Exps.prototype.Nickname = function(ret, user_name)
	{   
	    if (user_name == null)
	       user_name = this._current_user_name;
		var val = (this._user_data[user_name] == null)?
		           "":this._user_data[user_name].Nickname;
		ret.set_string(val);	      
	};
		
}());