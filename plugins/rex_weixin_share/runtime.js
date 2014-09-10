// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Weixin_share = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Weixin_share.prototype;
		
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
        this.WeixinJSBridge_enable = false;
        
        this.appmessage_enable = false;
        this.appmessage_content = {
            "appid": "",
            "img_url": "",
            "img_width": "",
            "img_height": "",
            "link": "",
            "desc": "",
            "title": ""
        };
        this.appmessage_inshare = false;
        
        this.timeline_enable = false;        
        this.timeline_content = {
            "img_url": "",
            "img_width": "",
            "img_height": "",
            "link": "",
            "desc": "",
            "title": ""
        };
        this.timeline_inshare = false;
        
        this.weibo_enable = false;
        this.weibo_content = {
            "content": "",
            "url": ""
        };
        this.weibo_inshare = false;

        this.error_msg = "";

        var self = this;
        document["addEventListener"](
            'WeixinJSBridgeReady', 
            function onBridgeReady() 
            {
                window["WeixinJSBridge"]["on"](
                   'menu:share:appmessage', 
                    function(argv) { self.ShareMessage(); }
                );
                window["WeixinJSBridge"]["on"](
                    'menu:share:timeline', 
                    function(argv) { self.ShareTimeline(); }
                );
                window["WeixinJSBridge"]["on"](
                    'menu:share:weibo', 
                    function(argv) { self.ShareWeibo(); }
                );
                
                self.WeixinJSBridge_enable = true;                
                self.runtime.trigger(cr.plugins_.Rex_Weixin_share.prototype.cnds.OnReady, self);
            }
            , false
        );
	};
    
    instanceProto.ShareMessage = function ()
    {
        this.appmessage_inshare = true;
        this.runtime.trigger(cr.plugins_.Rex_Weixin_share.prototype.cnds.OnShareMessage, this);
        
        if (this.appmessage_enable)
        {  
            var self = this;            
            window["WeixinJSBridge"]["invoke"](
                'sendAppMessage',
                table_copy(this.appmessage_content),
                
                function(res) 
                { 
                    self.error_msg = res["err_msg"];
                    self.runtime.trigger(cr.plugins_.Rex_Weixin_share.prototype.cnds.OnShareMessageError, self);
                }
            );         
            this.appmessage_enable = false;
		}
		
        this.appmessage_inshare = false;
    };

    instanceProto.ShareTimeline = function ()
    {
        this.timeline_inshare = true;
        this.runtime.trigger(cr.plugins_.Rex_Weixin_share.prototype.cnds.OnShareTimeline, this);
        
        if (this.timeline_enable)
        {
            var self = this;  
            window["WeixinJSBridge"]["invoke"](
                'shareTimeline',
                table_copy(this.timeline_content), 
                
                function(res) 
                { 
                    self.error_msg = res["err_msg"];
                    self.runtime.trigger(cr.plugins_.Rex_Weixin_share.prototype.cnds.OnShareTimelineError, self);
                }
            );           
            this.timeline_enable = false;
		}
        this.timeline_inshare = false;
    };    

    instanceProto.ShareWeibo = function ()
    {
        this.weibo_inshare = true;
        this.runtime.trigger(cr.plugins_.Rex_Weixin_share.prototype.cnds.OnShareWeibo, this);
        
        if (this.weibo_enable)
        {
            var self = this;
            window["WeixinJSBridge"]["invoke"](
                'shareWeibo',
                table_copy(this.weibo_content), 
                
                function(res) 
                { 
                    self.error_msg = res["err_msg"];
                    self.runtime.trigger(cr.plugins_.Rex_Weixin_share.prototype.cnds.OnShareWeiboError, self);
                }
            );          
            this.weibo_enable = false;
		}
        this.weibo_inshare = false;
    };  

    var table_copy = function (in_table, out_table)
    {
        if (out_table == null)
            out_table = {};
        else
        {
            var k;
            for (k in out_table)
            {
                delete out_table[k];
            }
        }
            
        var k;
        for (k in in_table)
        {
            out_table[k] = in_table[k];
        }
        return out_table;
    }    
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();     
    
	Cnds.prototype.OnReady = function ()
	{          
        return true;
	};
    
	Cnds.prototype.IsReady = function ()
	{       
        return this.WeixinJSBridge_enable;
	};
    
	Cnds.prototype.OnShareMessage = function ()
	{          
        return true;
	};    
    
	Cnds.prototype.OnShareTimeline = function ()
	{          
        return true;
	}; 
    
	Cnds.prototype.OnShareWeibo = function ()
	{          
        return true;
	}; 
    
	Cnds.prototype.OnShareMessageError = function ()
	{          
        return true;
	};    
    
	Cnds.prototype.OnShareTimelineError = function ()
	{          
        return true;
	}; 
    
	Cnds.prototype.OnShareWeiboError = function ()
	{          
        return true;
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.ShareMessage = function (appid, desc, title, link, img_url, img_width, img_height)
	{  
        this.appmessage_content["appid"] = appid;        
        this.appmessage_content["desc"] = desc;
        this.appmessage_content["title"] = title;
        this.appmessage_content["link"] = link;
        this.appmessage_content["img_url"] = img_url;
        this.appmessage_content["img_width"] = img_width.toString();
        this.appmessage_content["img_height"] = img_height.toString();
        this.appmessage_enable = true;      
	};
    
    Acts.prototype.ShareTimeline = function (desc, title, link, img_url, img_width, img_height)
	{  
        this.timeline_content["desc"] = desc;
        this.timeline_content["title"] = title;
        this.timeline_content["link"] = link;
        this.timeline_content["img_url"] = img_url;
        this.timeline_content["img_width"] = img_width.toString();
        this.timeline_content["img_height"] = img_height.toString();
        this.timeline_enable = true;       
	};      
    
    Acts.prototype.ShareWeibo = function (content, url)
	{  
        this.weibo_content["content"] = content;
        this.weibo_content["url"] = url;
        this.weibo_enable = true;             
	};      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.ErrorMessage = function (ret)
	{
	    ret.set_string(this.error_msg);
	};	
}());