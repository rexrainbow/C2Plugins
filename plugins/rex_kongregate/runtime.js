// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

window["kongregate"] = null;
/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_kongregate = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_kongregate.prototype;
		
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
        // callback
        this.callbackTag = "";
        this.result = null;
        
        var self=this;             
        var onload = function ()
        {
            window["kongregate"] = window["kongregateAPI"]["getAPI"]();
            window["kongregate"]["services"]["connect"]();
            self.runtime.trigger(cr.plugins_.Rex_kongregate.prototype.cnds.OnAPILoaded, self); 
            
            // Authentication
            window["kongregate"]["services"]["addEventListener"]("login", function()
	        {
                self.runtime.trigger(cr.plugins_.Rex_kongregate.prototype.cnds.OnLogin, self); 
	        });
            
            // Incentivized Ads
            window["kongregate"]["mtx"]["addEventListener"]("adsAvailable", function() 
            {
                // Ads are now available, and kongregate.mtx.showIncentivizedAd() will work
                self.runtime.trigger(cr.plugins_.Rex_kongregate.prototype.cnds.OnAdsAvailable, self);               
            });
            
            window["kongregate"]["mtx"]["addEventListener"]("adsUnavailable", function() 
            {
                // Ads are no longer available, kongregate.mtx.showIncentivizedAd() will fail
                self.runtime.trigger(cr.plugins_.Rex_kongregate.prototype.cnds.OnAdsUnavailable, self);                   
            });
            
            window["kongregate"]["mtx"]["addEventListener"]("adOpened", function() 
            {
                // An ad is being displayed
                self.runtime.trigger(cr.plugins_.Rex_kongregate.prototype.cnds.OnAdOpened, self);                     
            });
            
            window["kongregate"]["mtx"]["addEventListener"]("adCompleted", function() 
            {
                // An ad has completed successfully, and the player should be rewarded
                self.runtime.trigger(cr.plugins_.Rex_kongregate.prototype.cnds.OnAdCompleted, self);                   
            });
            
            window["kongregate"]["mtx"]["addEventListener"]("adAbandoned", function() 
            {
                // Ad ad has been closed before completion, the player should not be rewarded
                self.runtime.trigger(cr.plugins_.Rex_kongregate.prototype.cnds.OnAdAbandoned, self);                    
            });

            if (window["kongregate"]["services"]["getUserId"]() !== 0)
                self.runtime.trigger(cr.plugins_.Rex_kongregate.prototype.cnds.OnLogin, self); 
        };

        if (!this.runtime.isDomFree && typeof window["kongregateAPI"] !== "undefined")
            window["kongregateAPI"]["loadAPI"](onload);    
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
    
 	var getItemValue = function (item, k, default_value)
	{
        var v;
	    if (item == null)
            v = null;
        else if ( (k == null) || (k === "") )
            v = item;
        else if ((typeof(k) === "number") || (k.indexOf(".") == -1))
            v = item[k];
        else
        {
            var kList = k.split(".");
            v = item;
            var i,cnt=kList.length;
            for(i=0; i<cnt; i++)
            {
                if (typeof(v) !== "object")
                {
                    v = null;
                    break;
                }
                    
                v = v[kList[i]];
            }
        }

        return din(v, default_value);
	};	    
    
    var din = function (d, default_value)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (d == null)
        {
            if (default_value != null)
                o = default_value;
            else
                o = 0;
        }
        else if (typeof(d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
	    return o;
    };     
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

    // API Load    
	Cnds.prototype.OnAPILoaded = function ()
	{
		return true;
	};	
    
	Cnds.prototype.IsAPILoaded = function ()
	{
		return (window["kongregate"] != null);
	};    
    
	Cnds.prototype.OnCallback = function (tag)
	{
		return cr.equals_nocase(tag, this.callbackTag);
	};
        

    // Authentication
	Cnds.prototype.OnLogin = function ()
	{
		return true;
	};
    
	Cnds.prototype.IsGuest = function ()
	{
        if (!window["kongregate"])
			return true;		// preview mode
		
		return window["kongregate"]["services"]["isGuest"]();
	};    

    // Incentivized Ads
	Cnds.prototype.OnAdsAvailable = function ()
	{
		return true;
	};

	Cnds.prototype.OnAdsUnavailable = function ()
	{
		return true;
	};    

	Cnds.prototype.OnAdOpened = function ()
	{
		return true;
	};

	Cnds.prototype.OnAdCompleted = function ()
	{
		return true;
	};        

	Cnds.prototype.OnAdAbandoned = function ()
	{
		return true;
	};            
        
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    var getCallback = function (self, tag)
    {
        var callback = function (result)
        {
            self.callbackTag = tag;
            self.result = result;
            self.runtime.trigger(cr.plugins_.Rex_kongregate.prototype.cnds.OnCallback, self);      
        };
        return callback;
    }
    // Authentication
	Acts.prototype.ServicesShowRegBox = function ()
	{
        if (!window["kongregate"])
            return;
        
        window["kongregate"] ["services"]["showRegistrationBox"]();
	};
	
    // Incentivized Ads
	Acts.prototype.MtxInitializeIncentivizedAds = function ()
	{
        if (!window["kongregate"])
            return;

        window["kongregate"]["mtx"]["initializeIncentivizedAds"]();
	};   
    
	Acts.prototype.MtxShowIncentivizedAd = function ()
	{
        if (!window["kongregate"])
            return;
        
        window["kongregate"]["mtx"]["showIncentivizedAd"]();
	};   
	
    // Kreds & Virtual Goods
	Acts.prototype.MtxRequestUserItemList = function (tag)
	{
        if (!window["kongregate"])
            return;

        window["kongregate"]["mtx"]["requestUserItemList"](null, getCallback(this, tag));
	}; 
    
	Acts.prototype.MtxRequestItemList = function (itemTags, tag)
	{
        if (!window["kongregate"])
            return;

        itemTags = itemTags.split(",");
        window["kongregate"]["mtx"]["requestItemList"](itemTags, getCallback(this, tag));
	};   
    
	Acts.prototype.MtxPurchaseItems = function (items, tag)
	{
        if (!window["kongregate"])
            return;

        items = items.split(",");
        window["kongregate"]["mtx"]["purchaseItems"](items, getCallback(this, tag));
	};   
    
    var KredPurchaseDialogType = ["", "offers", "mobile"];
	Acts.prototype.MtxShowKredPurchaseDialog = function (type)
	{
        if (!window["kongregate"])
            return;

        type = KredPurchaseDialogType[type];
        window["kongregate"]["mtx"]["showKredPurchaseDialog"](type);
	};  

    // Feeds & User Messaging    
	Acts.prototype.ServicesShowFeedPostBox = function (content, image_uri, kv_params)
	{
        if (!window["kongregate"])
            return;

        if ((image_uri === "") && (kv_params === ""))
            window["kongregate"]["services"]["showFeedPostBox"](content);
        else
        {
            var obj = {
                "content": content,
                "image_uri": image_uri,
            };
            if (kv_params !== "")
                obj["kv_params"] = JSON.parse( kv_params );
            window["kongregate"]["services"]["showFeedPostBox"](obj);            
        }
	};  

	Acts.prototype.ServicesShowShoutBox = function (message)
	{
        if (!window["kongregate"])
            return;

        window["kongregate"]["services"]["showShoutBox"](message);
	};

	Acts.prototype.ServicesShowInvitationBox = function (content, filter, kv_params)
	{
        if (!window["kongregate"])
            return;
        
        var obj = {
            "content": content,
        };
        if (filter !== "")
            obj["filter"] = filter;                
        if (kv_params !== "")
            obj["kv_params"] = JSON.parse( kv_params );        
        window["kongregate"]["services"]["showInvitationBox"](obj);
	}; 

	Acts.prototype.ServicesPrivateMessage = function (content)
	{
        if (!window["kongregate"])
            return;

        window["kongregate"]["services"]["privateMessage"](content);
	};
    
    // Custom Chat
	Acts.prototype.ChatShowTab = function (name, description, options)
	{
        if (!window["kongregate"])
            return;

        if (options === "")
            options = {};
        else
            options = JSON.parse(options);
        window["kongregate"]["chat"]["showTab"](name, description, options);
	};
    
	Acts.prototype.ChatDisplayMessage = function (message)
	{
        if (!window["kongregate"])
            return;

        var userName = (!window["kongregate"])? "": window["kongregate"]["services"]["getUsername"]();    
        window["kongregate"]["chat"]["displayMessage"](message, userName);
	};
    
	Acts.prototype.ChatClearMessages = function ()
	{
        if (!window["kongregate"])
            return;
 
        window["kongregate"]["chat"]["clearMessages"]();
	};    
    
	Acts.prototype.ChatCloseTab = function ()
	{
        if (!window["kongregate"])
            return;
 
        window["kongregate"]["chat"]["closeTab"]();
	};      
    
    var chatEventType = ["message", "room.message", "tab_visible"];
	Acts.prototype.ChatAddEventListener = function (type, tag)
	{
        if (!window["kongregate"])
            return;
 
        window["kongregate"]["chat"]["addEventListener"](chatEventType[type], getCallback(this, tag));
	};  

    // Shared Content
	Acts.prototype.SharedContentSave = function (type, content, label, tag)
	{
        if (!window["kongregate"])
            return;

        if (label === "")
            label = null;
        window["kongregate"]["sharedContent"]["save"](type, content, getCallback(this, tag), null, label);
	};      
    
    var SortOrderType = ["by_own", "by_newest", "by_load_count", "by_friends"];
	Acts.prototype.SharedContentBrowse = function (type, sort_order, label)
	{
        if (!window["kongregate"])
            return;

        if (label === "")
            label = null;
        window["kongregate"]["sharedContent"]["browse"](type, SortOrderType[sort_order], label);
	};

	Acts.prototype.SharedContentAddLoadListener = function (type, tag)
	{
        if (!window["kongregate"])
            return;

        window["kongregate"]["sharedContent"]["addLoadListener"](type, getCallback(this, tag));
	};   

	Acts.prototype.StatsSubmit = function (name, value)
	{
        if (!window["kongregate"])
            return;

        window["kongregate"]["Stats"]["Submit"](name, value);
	};  

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.Result = function (ret, keys, default_value)
	{
		ret.set_any( getItemValue( this.result, keys, 0) );
	};
    
	Exps.prototype.UserID = function (ret)
	{
        var userID = (!window["kongregate"])? 0: window["kongregate"]["services"]["getUserId"]();
		ret.set_int( userID );
	};
	
	Exps.prototype.UserName = function (ret)
	{
        var userName = (!window["kongregate"])? "": window["kongregate"]["services"]["getUsername"]();        
		ret.set_string( userName );
	};
	
	Exps.prototype.UserName = function (ret)
	{
        var gameAuthToken = (!window["kongregate"])? "": window["kongregate"]["services"]["getGameAuthToken"]();        
		ret.set_string( gameAuthToken );
	};	
    
}());