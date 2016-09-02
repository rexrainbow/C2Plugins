/*
<itemID>
    # monitor item added and removed
    <Key> : <value>
    # monitor key added and removed, and value changed
*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_ItemMonitor = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_ItemMonitor.prototype;
		
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
	    this.rootpath = this.properties[0] + "/" + this.properties[1] + "/"; 	    
        
        this.query = null;
        this.items = {};
        this.tag2items = {};         
        if (!this.recycled)
        {            
            this.callbackMap = new window.FirebaseCallbackMapKlass();
        }
        else
        {
            this.callbackMap.Reset();
        }

        this.exp_LastItemID = "";
        this.exp_LastItemContent = null;
        this.exp_LastPropertyName = "";
        this.exp_LastValue = null;        
        this.exp_PrevValue = null;
        this.exp_CurItemID = "";
        this.exp_CurItemContent = null;       
        this.exp_CurKey = "";  
        this.exp_CurValue = 0;
	};
	
	instanceProto.onDestroy = function ()
	{		
	    this.StopMonitor(); 
	};
		
    // 2.x , 3.x    
	var isFirebase3x = function()
	{ 
        return (window["FirebaseV3x"] === true);
    };
    
    var isFullPath = function (p)
    {
        return (p.substring(0,8) === "https://");
    };
	
	instanceProto.get_ref = function(k)
	{
        if (k == null)
	        k = "";
	    var path;
	    if (isFullPath(k))
	        path = k;
	    else
	        path = this.rootpath + k + "/";
            
        // 2.x
        if (!isFirebase3x())
        {
            return new window["Firebase"](path);
        }  
        
        // 3.x
        else
        {
            var fnName = (isFullPath(path))? "refFromURL":"ref";
            return window["Firebase"]["database"]()[fnName](path);
        }
        
	};
    
    var get_key = function (obj)
    {       
        return (!isFirebase3x())?  obj["key"]() : obj["key"];
    };
    
    var get_refPath = function (obj)
    {       
        return (!isFirebase3x())?  obj["ref"]() : obj["ref"];
    };    
    
    var get_root = function (obj)
    {       
        return (!isFirebase3x())?  obj["root"]() : obj["root"];
    };
    
    var serverTimeStamp = function ()
    {       
        if (!isFirebase3x())
            return window["Firebase"]["ServerValue"]["TIMESTAMP"];
        else
            return window["Firebase"]["database"]["ServerValue"];
    };       

    var get_timestamp = function (obj)    
    {       
        return (!isFirebase3x())?  obj : obj["TIMESTAMP"];
    };    
    // 2.x , 3.x  
    
    instanceProto.StartMonitor = function (query, tag, monitorKey)
	{
	    this.StopMonitor(); 
        if (this.tag2items.hasOwnProperty(tag)) 
            return;
            
	    this.tag2items[tag] = {};
	    var tag2items = this.tag2items[tag];

        var self = this;
        var on_add = function (snapshot)
        {
            var itemID = get_key(snapshot);            
            // add itemID into tag2items, indexed by tag
            tag2items[itemID] = true;  
            
            // add item on monitor
            var itemContent = snapshot["val"]();
            self.items[itemID] = itemContent;              
            self.exp_LastItemID = itemID;
            self.exp_LastItemContent = itemContent;            
            self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnItemAdded, self);
            self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnItemListChanged, self);                                    
            self.start_monitor_item(snapshot, monitorKey);
        };
        var on_remove = function (snapshot)
        {
            var itemID = get_key(snapshot);            
            // add itemID into tag2items, indexed by tag  
            delete tag2items[itemID];
            if (is_empty_table(self.tag2items[tag]))
                delete self.tag2items[tag];
                
            // remove item from monitor
            delete self.items[itemID];                
            self.stop_monitor_item(get_refPath(snapshot), monitorKey);                                 
            self.exp_LastItemID = itemID;  
            self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnItemRemoved, self);    
            self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnItemListChanged, self);             
        };
        this.callbackMap.Add(query, "child_added", "child_added#"+tag, on_add);
        this.callbackMap.Add(query, "child_removed", "child_removed#"+tag, on_remove);     
	};
	
	instanceProto.RemoveMonitorQuery = function (query, tag)
	{
        this.callbackMap.Remove(query, "child_added", "child_added#"+tag);
        this.callbackMap.Remove(query, "child_removed", "child_removed#"+tag); 
	    this.remove_tag2items(tag);    	    
	};
	
	instanceProto.StopMonitor = function ()
	{
        if (this.query == null)
            return;
        
	    for (var tag in this.tag2items)
	    {
	        this.RemoveMonitorQuery(this.query, tag);
	    }          

        this.query = null;        
	};	
	
    
    // read the item once then start monitor
	instanceProto.start_monitor_item = function(snapshot, tag)
	{
        if (tag == null)
            tag = "";
            
        var ref = get_refPath(snapshot);
        var k = get_key(snapshot);
        var v = snapshot["val"]();
        
        // add item into items
        this.items[k] = v;
        var monitor_item = this.items[k];
        
        // add callback
        var self = this;
        var on_prop_added = function (snapshot)
	    {
            var ck = get_key(snapshot);
            var cv = snapshot["val"]();
            if (monitor_item[ck] === cv)
                return;

            // run trigger
            self.exp_LastItemID = k;
            self.exp_LastPropertyName = ck;
            self.exp_LastValue = cv;
            monitor_item[ck] = cv;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnPropertyAdded, self);
            self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnItemListChanged, self); 
	    };        
        
        var on_value_changed = function (snapshot)
	    {
            var ck = get_key(snapshot);
            var cv = snapshot["val"]();
            if (monitor_item[ck] === cv)
                return;

            // run trigger
            self.exp_LastItemID = k;
            self.exp_LastPropertyName = ck;
            self.exp_LastValue = cv;
            
            if (monitor_item[ck] == null)
                self.exp_PrevValue = self.exp_LastValue;
            else
                self.exp_PrevValue = monitor_item[ck];
            
            monitor_item[ck] = cv;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnAnyValueChnaged, self);            
            self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnValueChnaged, self);
            self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnItemListChanged, self); 
	    };

        var on_prop_removed = function (snapshot)
	    {
            var ck = get_key(snapshot);
            if (!monitor_item.hasOwnProperty(ck))
                return;
                
            // run trigger
            self.exp_LastItemID = k;
            self.exp_LastPropertyName = ck;
            delete monitor_item[k];
            self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnPropertyRemoved, self); 
            self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnItemListChanged, self); 
	    };
	        
        this.callbackMap.Add(ref, "child_added", "prop_added#"+tag, on_prop_added);
        this.callbackMap.Add(ref, "child_removed", "prop_removed#"+tag, on_prop_removed);
        this.callbackMap.Add(ref, "child_moved", "prop_added#"+tag, on_value_changed);
        this.callbackMap.Add(ref, "child_changed", "prop_removed#"+tag, on_value_changed);      
        // add callback       
	};    
    
	instanceProto.stop_monitor_item = function(ref, tag)
	{
        this.callbackMap.Remove(ref, "child_added", "prop_added#"+tag);
        this.callbackMap.Remove(ref, "child_removed", "prop_removed#"+tag);
        this.callbackMap.Remove(ref, "child_moved", "prop_added#"+tag);
        this.callbackMap.Remove(ref, "child_changed", "prop_removed#"+tag);             
	}; 
	
	instanceProto.remove_tag2items = function (tag)
	{
	    var tag2items = this.tag2items[tag];
	    if (tag2items == null)
	        return;

        delete this.tag2items[tag];	    
        for(var itemID in tag2items)
        {
            delete this.items[itemID];    
            this.stop_monitor_item(this.get_ref(itemID), tag);
            
            this.exp_LastItemID = itemID;  
            this.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnItemRemoved, this); 
            this.runtime.trigger(cr.plugins_.Rex_Firebase_ItemMonitor.prototype.cnds.OnItemListChanged, this);             
        }
	};	
	
	instanceProto.ForEachItemID = function (itemIDList, items)
	{
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i, cnt=itemIDList.length;
		for(i=0; i<cnt; i++)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurItemID = itemIDList[i];
            this.exp_CurItemContent = items[this.exp_CurItemID]; 
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
     		
		return false;
	};
	
	var is_empty_table = function (o)
	{
		for (var k in o)
		    return false;
		
		return true;
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
    
    var getValueByKeyPath = function (o, keyPath)
    {  
        // invalid key    
        if ((keyPath == null) || (keyPath === ""))
            return o;
        
        // key but no object
        else if (typeof(o) !== "object")
            return null;
        
        else if (keyPath.indexOf(".") === -1)
            return o[keyPath];
        else
        {
            var val = o;              
            var keys = keyPath.split(".");
            var i, cnt=keys.length;
            for(i=0; i<cnt; i++)
            {
                val = val[keys[i]];
                if (val == null)
                    return null;
            }
            return val;
        }
    }  

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    var prop = [];
        this.callbackMap.getDebuggerValues(prop);        
        
		propsections.push({
			"title": this.type.name,
			"properties": prop
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnItemAdded = function ()
	{
	    return true;
	}; 

	Cnds.prototype.OnItemRemoved = function ()
	{
	    return true;
	};	

	Cnds.prototype.OnValueChnaged = function (name)
	{
	    return cr.equals_nocase(name, this.exp_LastPropertyName);
	}; 

	Cnds.prototype.OnAnyValueChnaged = function ()
	{
	    return true;
	};	
	
	Cnds.prototype.OnPropertyAdded = function ()
	{
	    return true;
	}; 

	Cnds.prototype.OnPropertyRemoved = function ()
	{
	    return true;
	};

	Cnds.prototype.OnItemListChanged = function ()
	{
	    return true;
	};	

    var inc = function(a, b)
    {
        return (a > b)?  1:
               (a == b)? 0:
                         (-1);
    }; 
    var dec = function(a, b)
    {
        return (a < b)?  1:
               (a == b)? 0:
                         (-1);
    };
   
	Cnds.prototype.ForEachItemID = function (order)
	{
	    var itemIDList = Object.keys(this.items);
	    var sort_fn = (order == 0)? inc:dec;
	    itemIDList.sort(sort_fn);
	    return this.ForEachItemID(itemIDList, this.items);
	};	
	
	Cnds.prototype.ForEachKey = function (itemID)
	{
	    var item_props = this.items[itemID];
	    if (item_props == null)
	        return false;
	        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		var k, o=item_props;
		for(k in o)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurKey = k;
            this.exp_CurValue = o[k];
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
		    
		return false;
	};		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
      
    Acts.prototype.SetDomainRef = function (domain_ref, sub_domain_ref)
	{
		this.rootpath = domain_ref + "/" + sub_domain_ref + "/";
        this.load_items = {};
	};
    
    Acts.prototype.StartMonitor = function ()
	{
        if (this.query == null)
            this.query = this.get_ref();            
        
        this.StartMonitor(this.query, "all");
	};
    
    Acts.prototype.StopMonitor = function ()
	{
	    this.StopMonitor(); 
	};       

    var get_query = function (queryObjs)
    {
	    if (queryObjs == null)
	        return null;	        
        var query = queryObjs.getFirstPicked();
        if (query == null)
            return null;
            
        return query.GetQuery();
    };    
    Acts.prototype.SetQueryObject = function (queryObjs, type_, cbName)
	{
	    this.StopMonitor();                 
        this.query = get_query(queryObjs);
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
    Exps.prototype.LastItemID = function (ret)
	{
		ret.set_string(this.exp_LastItemID);
	};
    Exps.prototype.LastItemContent = function (ret, key_, default_value)
	{
        var val = getValueByKeyPath(this.exp_LastItemContent, key_);
        val = din(val, default_value);
		ret.set_any(val);
	};	
    Exps.prototype.At = function (ret, itemID, key_, default_value)
	{
	    var val, props = this.items[itemID];
	    if (props)	    
	        val = getValueByKeyPath(props, key_);
        
        val = din(val, default_value);
		ret.set_any(val);
	};    
    
    // ef_deprecated    
    Exps.prototype.LastItemContentPosX = function (ret)
	{
	    var v = this.exp_LastItemContent;
        if (v != null)
        {
            v = v["pos"];
            if (v != null)
                v = v["x"];                   
        }
        if ( v == null)
            v = 0;     
		ret.set_float(v); 
	};
    // ef_deprecated     
    Exps.prototype.LastItemContentPosY = function (ret)
	{
	    var v = this.exp_LastItemContent;
        if (v != null)
        {
            v = v["pos"];
            if (v != null)
                v = v["y"];                   
        }
        if ( v == null)
            v = 0;     
		ret.set_float(v); 
	}; 	

    Exps.prototype.LastPropertyName = function (ret)
	{
		ret.set_string(this.exp_LastPropertyName);
	};
    Exps.prototype.LastValue = function (ret, subKey)
	{
        var val = getValueByKeyPath(this.exp_LastValue, subKey);
		ret.set_any(din(val));
	};
    Exps.prototype.PrevValue = function (ret, subKey)
	{
        var val = getValueByKeyPath(this.exp_PrevValue, subKey);
		ret.set_any(din(val));
	};	
    
    // ef_deprecated     
    Exps.prototype.LastValuePosX = function (ret)
	{
	    var v = this.exp_LastValue;
        if (v != null)
            v = v["x"];         
        if ( v == null)
            v = 0;     
		ret.set_float(v);
	};    
    // ef_deprecated         
    Exps.prototype.LastValuePosY = function (ret)
	{
	    var v = this.exp_LastValue;
        if (v != null)
            v = v["y"];   
        if ( v == null)
            v = 0;     
		ret.set_float(v);
	};
    // ef_deprecated         
    Exps.prototype.PrevValuePosX = function (ret)
	{
	    var v = this.exp_PrevValue;
        if (v != null)
            v = v["x"];     
        if ( v == null)
            v = 0;     
		ret.set_float(v);
	};    
    // ef_deprecated         
    Exps.prototype.PrevValuePosY = function (ret)
	{
	    var v = this.exp_PrevValue;
        if (v != null)
            v = v["y"];     
        if ( v == null)
            v = 0;     
		ret.set_float(v);
	};    
    
    Exps.prototype.CurItemID = function (ret)
	{
		ret.set_string(this.exp_CurItemID);
	};
    Exps.prototype.CurKey = function (ret)
	{
		ret.set_string(this.exp_CurKey);
	};	
	
    Exps.prototype.CurValue = function (ret, subKey)
	{
        var val = getValueByKeyPath(this.exp_CurValue, subKey);
		ret.set_any(din(val));
	};	
    Exps.prototype.CurItemContent = function (ret, key_, default_value)
	{
        var val = getValueByKeyPath(this.exp_CurItemContent, key_);
		ret.set_any(din(val));
	};	
}());