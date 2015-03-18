/*
<itemID>\
    # monitor item added and removed
    <Key> : <value>
    # monitor key added and removed, and value changed
*/

// ECMAScript 5 strict mode
"use strict";

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
	    jsfile_load("firebase.js");
	};
	
	var jsfile_load = function(file_name)
	{
	    var scripts=document.getElementsByTagName("script");
	    var exist=false;
	    for(var i=0;i<scripts.length;i++)
	    {
	    	if(scripts[i].src.indexOf(file_name) != -1)
	    	{
	    		exist=true;
	    		break;
	    	}
	    }
	    if(!exist)
	    {
	    	var newScriptTag=document.createElement("script");
	    	newScriptTag.setAttribute("type","text/javascript");
	    	newScriptTag.setAttribute("src", file_name);
	    	document.getElementsByTagName("head")[0].appendChild(newScriptTag);
	    }
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
        
        if (!this.recycled)
        {
            this.items = {};
            this.tag2items = {};            
            this.callbackMap = new window.FirebaseCallbackMapKlass();
        }
        else
        {
            clean_table( this.items );
            clean_table( this.tag2items );
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
        
	    /**BEGIN-PREVIEWONLY**/ 
        this.propsections = [];    
        /**END-PREVIEWONLY**/  
	};
	
	instanceProto.get_ref = function(k)
	{
	    if (k == null)
	        k = "";
	        
	    var path;
	    if (k.substring(0,8) == "https://")
	        path = k;
	    else
	        path = this.rootpath + k + "/";
	        
        return new window["Firebase"](path);
	};
    	
    var get_tag = function (key_, value_)
    {
        return key_.toString() + "=" + value_.toString();
    };
    
    instanceProto.AddMonitorQuery = function (query, tag, monitorKey)
	{
        if (this.tag2items.hasOwnProperty(tag)) 
            return;
            
	    this.tag2items[tag] = {};
	    var tag2items = this.tag2items[tag];

        var self = this;
        var on_add = function (snapshot)
        {
            var itemID = snapshot["key"]();            
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
            var itemID = snapshot["key"]();            
            // add itemID into tag2items, indexed by tag  
            delete tag2items[itemID];
            if (is_empty_table(self.tag2items[tag]))
                delete self.tag2items[tag];
                
            // remove item from monitor
            delete self.items[itemID];                
            self.stop_monitor_item(snapshot["ref"](), monitorKey);                                 
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
	
	instanceProto.RemoveAllMonitorQuery = function ()
	{
	    var query = this.get_ref();
	    for (var tag in this.tag2items)
	    {
	        this.RemoveMonitorQuery(query, tag);
	    }  	    
	};	
	
    
    // read the item once then start monitor
	instanceProto.start_monitor_item = function(snapshot, tag)
	{
        if (tag == null)
            tag = "";
            
        var ref = snapshot["ref"]();
        var k = snapshot["key"]();
        var v = snapshot["val"]();
        
        // add item into items
        this.items[k] = v;
        var monitor_item = this.items[k];
        
        // add callback
        var self = this;
        var on_prop_added = function (snapshot)
	    {
            var ck = snapshot["key"]();
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
            var ck = snapshot["key"]();
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
            var ck = snapshot["key"]();
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

	var clean_table = function (o)
	{
		for (var k in o)
		    delete o[k];
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
    
    var dout = function (d)
    {
        var o;
        if (typeof(d) == "string")	
        {        
            try
            {
	            o = JSON.parse(d) 
            }
            catch(err)
            {
                o = d;
            } 
        }
        else
        {
            o = d;
        }
        return o;
    }; 
	
	var get_data = function(in_data, default_value)
	{
	    var val;
	    if (in_data === null)
	    {
	        if (default_value === null)
	            val = 0;
	        else
	            val = default_value;
	    }
        else
        {
            val = din(in_data)
        }	    
        return val;
	};

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    this.propsections.length = 0;
        this.callbackMap.getDebuggerValues(this.propsections);        
        
		propsections.push({
			"title": this.type.name,
			"properties": this.propsections
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
		clean_table(this.load_items);
	};
    
    Acts.prototype.StartMonitorAll = function ()
	{
	    var query = this.get_ref();
        this.AddMonitorQuery(query, "all");
	};    
    
    Acts.prototype.StopMonitorAll = function ()
	{
	    this.RemoveAllMonitorQuery(); 
	};     
    
    Acts.prototype.StartMonitorItemsWCond = function (key_, value_)
	{
	     var query = this.get_ref()["orderByChild"](key_)["equalTo"](value_);
         var tag = get_tag(key_, value_);
	     this.AddMonitorQuery(query, tag, key_);
	};  

    Acts.prototype.StopMonitorItemsWCond = function (key_, value_)
	{
	     var query = this.get_ref();
         var tag = get_tag(key_, value_);
	     this.RemoveMonitorQuery(query, tag);
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
        var v;
        if (key_ == null)
            v = din(this.exp_LastItemContent);
        else
            v = get_data(this.exp_LastItemContent[key_], default_value);
 
		ret.set_any(v);
	};	
    Exps.prototype.At = function (ret, itemID, key_, default_value)
	{
	    var item_props = this.items[itemID];
	    if (item_props)
	    {
	        v = item_props[key_];
	        v = din(v);	        
	    }
	    
	    if (v == null)
	    {
	        if (default_value != null)
	            v = default_value;
	        else
	            v = 0;
	    }
		ret.set_any(v);
	};    
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
    Exps.prototype.LastValue = function (ret)
	{
		ret.set_any(din(this.exp_LastValue));
	};
    Exps.prototype.PrevValue = function (ret)
	{
		ret.set_any(din(this.exp_PrevValue));
	};	
    Exps.prototype.LastValuePosX = function (ret)
	{
	    var v = this.exp_LastValue;
        if (v != null)
            v = v["x"];         
        if ( v == null)
            v = 0;     
		ret.set_float(v);
	};    
    Exps.prototype.LastValuePosY = function (ret)
	{
	    var v = this.exp_LastValue;
        if (v != null)
            v = v["y"];   
        if ( v == null)
            v = 0;     
		ret.set_float(v);
	};
    Exps.prototype.PrevValuePosX = function (ret)
	{
	    var v = this.exp_PrevValue;
        if (v != null)
            v = v["x"];     
        if ( v == null)
            v = 0;     
		ret.set_float(v);
	};    
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
	
    Exps.prototype.CurValue = function (ret)
	{
	    var v = this.exp_CurValue;
	    v = din(v);
		ret.set_any(v);
	};	
    Exps.prototype.CurItemContent = function (ret, key_, default_value)
	{
        var v;
        if (key_ == null)
            v = din(this.exp_CurItemContent);
        else
            v = get_data(this.exp_CurItemContent[key_], default_value);
 
		ret.set_any(v);
	};	
}());

(function ()
{
    if (window.FirebaseCallbackMapKlass != null)
        return;    
    
    var FirebaseCallbackMapKlass = function ()
    {
        this.map = {};
    };
    
    var CallbackMapKlassProto = FirebaseCallbackMapKlass.prototype;

	CallbackMapKlassProto.Reset = function(k)
	{
        for (var k in this.map)
            delete this.map[k];
	}; 
	    
	CallbackMapKlassProto.get_ref = function(k)
	{
        return new window["Firebase"](k);
	};    
	
	CallbackMapKlassProto.get_callback = function(absRef, eventType, cbName)
	{
        if (!this.IsExisted(absRef, eventType, cbName))
            return null;
    
        return this.map[absRef][eventType][cbName];
	};

    CallbackMapKlassProto.IsExisted = function (absRef, eventType, cbName)
    {
        if (!this.map.hasOwnProperty(absRef))
            return false;
        
        if (!eventType)  // don't check event type
            return true;
         
        var eventMap = this.map[absRef];
        if (!eventMap.hasOwnProperty(eventType))
            return false;
            
        if (!cbName)  // don't check callback name
            return true;
                                    
        var cbMap = eventMap[eventType];
        if (!cbMap.hasOwnProperty(cbName))
            return false;
        
        return true;     
    };
    
	CallbackMapKlassProto.Add = function(query, eventType, cbName, cb)
	{
	    var absRef = query["toString"]();
        if (this.IsExisted(absRef, eventType, cbName))
            return;
            	    
        if (!this.map.hasOwnProperty(absRef))
            this.map[absRef] = {};
        
        var eventMap = this.map[absRef];
        if (!eventMap.hasOwnProperty(eventType))
            eventMap[eventType] = {};

        var cbMap = eventMap[eventType];
        cbMap[cbName] = cb;
        
	    query["on"](eventType, cb);         
	};
       
	CallbackMapKlassProto.Remove = function(absRef, eventType, cbName)
	{
	    if ((absRef != null) && (typeof(absRef) == "object"))
	        absRef = absRef["toString"]();
	        
        if (absRef && eventType && cbName)
        {
            var cb = this.get_callback(absRef, eventType, cbName);
            if (cb == null)
                return;                
            this.get_ref(absRef)["off"](eventType, cb);  
            delete this.map[absRef][eventType][cbName];
        }
        else if (absRef && eventType && !cbName)
        {
            var eventMap = this.map[absRef];
            if (!eventMap)
                return;
            var cbMap = eventMap[eventType];
            if (!cbMap)
                return;
            this.get_ref(absRef)["off"](eventType); 
            delete this.map[absRef][eventType];
        }
        else if (absRef && !eventType && !cbName)
        {
            var eventMap = this.map[absRef];
            if (!eventMap)
                return;
            this.get_ref(absRef)["off"](); 
            delete this.map[absRef];
        }  
        else if (!absRef && !eventType && !cbName)
        {
            for (var r in this.map)
            {
                this.get_ref(r)["off"](); 
                delete this.map[r];
            } 
        }  
	}; 
	
	CallbackMapKlassProto.RemoveAllCB = function(absRef)
	{
	    if (absRef)
	    {
            var eventMap = this.map[absRef];
            for (var e in eventMap)
            {
                var cbMap = eventMap[e];
                for (var cbName in cbMap)
                {
                    this.get_ref(absRef)["off"](e, cbMap[cbName]);  
                }
            }
            
            delete this.map[absRef];
	    }
	    else if (!absRef)
	    {
            for (var r in this.map)
            {
                var eventMap = this.map[r];
                for (var e in eventMap)
                {
                    var cbMap = eventMap[e];
                    for (var cbName in cbMap)
                    {
                        this.get_ref(r)["off"](e, cbMap[cbName]);  
                    }
                }
                
                delete this.map[r];
            }
        } 	    
	};	
    
    CallbackMapKlassProto.getDebuggerValues = function (propsections)
    {
        var r, eventMap, e, cbMap, cn, display;
        for (r in this.map)
        {
            eventMap = this.map[r];
            for (e in eventMap)
            {
                cbMap = eventMap[e];
                for (cn in cbMap)
                {
                    display = cn+":"+e+"-"+r;
                    propsections.push({"name": display, "value": ""});
                }
            }
        }
    };
    
    CallbackMapKlassProto.GetRefMap = function ()
    {
        return this.map;
    };    
    
	window.FirebaseCallbackMapKlass = FirebaseCallbackMapKlass;
}()); 