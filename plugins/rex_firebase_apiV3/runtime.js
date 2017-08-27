// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

// 2.x: window["Firebase"]
// 3.x: window["firebase"]
window["Firebase"] = window["firebase"];
window["FirebaseV3x"] = true;
        
/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_FirebaseAPIV3 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_FirebaseAPIV3.prototype;
		
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
        window["Firebase"]["database"]["enableLogging"](this.properties[4] === 1);        
        if (this.properties[0] !== "")
        {
            this.initializeApp(this.properties[0], this.properties[1], this.properties[2], this.properties[3]);
        }        
	};
	
	instanceProto.onDestroy = function ()
	{		
	};
	instanceProto.initializeApp = function (apiKey, authDomain, databaseURL, storageBucket)
	{
        var config = {
            "apiKey": apiKey,
            "authDomain": authDomain,
            "databaseURL": databaseURL,
            "storageBucket": storageBucket,
        };
        window["Firebase"]["initializeApp"](config);
        runAfterInitializeHandlers();
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
    
	var getRef = function(path)
	{
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
	
	instanceProto.getRef = function(k)
	{
        if (k == null)
	        k = "";
	    var path;
	    if (isFullPath(k))
	        path = k;
	    else
	        path = this.rootpath + k + "/";
            
        return getRef(path);
	};
    
    var getKey = function (obj)
    {       
        return (!isFirebase3x())?  obj["key"]() : obj["key"];
    };
    
    var getRefPath = function (obj)
    {       
        return (!isFirebase3x())?  obj["ref"]() : obj["ref"];
    };    
    
    var getRoot = function (obj)
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

    var getTimestamp = function (obj)    
    {       
        return (!isFirebase3x())?  obj : obj["TIMESTAMP"];
    };    
    // 2.x , 3.x    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.initializeApp = function (apiKey, authDomain, databaseURL, storageBucket)
	{
        this.initializeApp(apiKey, authDomain, databaseURL, storageBucket);
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
 
    // --------------------------------------------------------------------------
    // --------------------------------------------------------------------------
    // --------------------------------------------------------------------------    
    var __afterInitialHandler = [];
    var addAfterInitialHandler = function(callback)
    {
        if (__afterInitialHandler === null)
            callback()
        else
            __afterInitialHandler.push(callback);
    };
    var runAfterInitializeHandlers = function()
    {
        var i, cnt=__afterInitialHandler.length;
        for(i=0; i<cnt; i++)
        {
            __afterInitialHandler[i]();
        }
        __afterInitialHandler = null;
    };
	window.FirebaseAddAfterInitializeHandler = addAfterInitialHandler;
    
    
    
    var ItemListKlass = function ()
    {
        // -----------------------------------------------------------------------
        // export: overwrite these values
        this.updateMode = 1;                  // AUTOCHILDUPDATE
        this.keyItemID = "__itemID__";
        
        // custom snapshot2Item function
        this.snapshot2Item = null;
        
        // auto child update, to get one item
        this.onItemAdd = null;
        this.onItemRemove = null;
        this.onItemChange = null;
        
        // manual update or
        // auto all update, to get all items
        this.onItemsFetch = null;
        
        // used in ForEachItem
        this.onGetIterItem = null;  
        
        this.extra = {};
        // export: overwrite these values
        // -----------------------------------------------------------------------        
        
        // -----------------------------------------------------------------------        
        // internal
        this.query = null;
        this.items = [];
        this.itemID2Index = {}; 
                
        // saved callbacks
        this.onAddChildCb = null;
        this.onRemoveChildCb = null;
        this.onChangeChildCb = null;
        this.onItemsFetchCb = null;        
        // internal       
        // -----------------------------------------------------------------------        
    };
    
    var ItemListKlassProto = ItemListKlass.prototype;
    
    ItemListKlassProto.MANUALUPDATE = 0;
    ItemListKlassProto.AUTOCHILDUPDATE = 1;
    ItemListKlassProto.AUTOALLUPDATE = 2;    
    
    // --------------------------------------------------------------------------
    // export
    ItemListKlassProto.GetItems = function ()
    {
        return this.items;
    };
    
    ItemListKlassProto.GetItemIndexByID = function (itemID)
    {
        return this.itemID2Index[itemID];
    };     
    
    ItemListKlassProto.GetItemByID = function (itemID)
    {
        var i = this.GetItemIndexByID(itemID);
        if (i == null)
            return null;
            
        return this.items[i];
    };  
    
    ItemListKlassProto.Clean = function ()
    {
        this.items.length = 0;
        cleanTable(this.itemID2Index); 
    };        
    
    ItemListKlassProto.StartUpdate = function (query)
    {
        this.StopUpdate();            
        this.Clean();        
  
        if (this.updateMode === this.MANUALUPDATE)
            this.manualUpdate(query);
        else if (this.updateMode === this.AUTOCHILDUPDATE)        
            this.startUpdateChild(query);        
        else if (this.updateMode === this.AUTOALLUPDATE)   
            this.startUpdateAll(query);    
    };
    
    ItemListKlassProto.StopUpdate = function ()
	{
        if (this.updateMode === this.AUTOCHILDUPDATE)        
            this.stopUpdateChild();        
        else if (this.updateMode === this.AUTOALLUPDATE)   
            this.stopUpdateAll();
	};	
	
	ItemListKlassProto.ForEachItem = function (runtime, start, end)
	{	     
	    if ((start == null) || (start < 0))
	        start = 0; 
	    if ((end == null) || (end > this.items.length - 1))
	        end = this.items.length - 1;
	    
        var current_frame = runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i;
		for(i=start; i<=end; i++)
		{
            if (solModifierAfterCnds)
            {
                runtime.pushCopySol(current_event.solModifiers);
            }
            
            if (this.onGetIterItem)
                this.onGetIterItem(this.items[i], i);
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        runtime.popSol(current_event.solModifiers);
		    }            
		}
     		
		return false;
	};    	    
	// export
    // --------------------------------------------------------------------------    
    
    // --------------------------------------------------------------------------
    // internal   
    ItemListKlassProto.addItem = function(snapshot, prevName, force_push)
	{
	    var item;
	    if (this.snapshot2Item)
	        item = this.snapshot2Item(snapshot);
	    else
	    {
	        var k = getKey(snapshot);
	        item = snapshot["val"]();
	        item[this.keyItemID] = k;
	    }
        
        if (force_push === true)
        {
            this.items.push(item);
            return;
        }        
	        
	    if (prevName == null)
	    {
            this.items.unshift(item);
        }
        else
        {
            var i = this.itemID2Index[prevName];
            if (i == this.items.length-1)
                this.items.push(item);
            else
                this.items.splice(i+1, 0, item);
        }
        
        return item;
	};
	
	ItemListKlassProto.removeItem = function(snapshot)
	{
	    var k = getKey(snapshot);
	    var i = this.itemID2Index[k];	 
	    var item = this.items[i];
	    cr.arrayRemove(this.items, i);
	    return item;
	};	  

	ItemListKlassProto.updateItemID2Index = function()
	{
	    cleanTable(this.itemID2Index);
	    var i,cnt = this.items.length;
	    for (i=0; i<cnt; i++)
	    {
	        this.itemID2Index[this.items[i][this.keyItemID]] = i;
	    }	
	};
    
    ItemListKlassProto.manualUpdate = function(query)
    {
        var self=this;
        var onReadItem = function(childSnapshot)
        {
            self.addItem(childSnapshot, null, true);
        };            
        var handler = function (snapshot)
        {           
            snapshot["forEach"](onReadItem);                
            self.updateItemID2Index();   
            if (self.onItemsFetch)
                self.onItemsFetch(self.items)
        };
      
        query["once"]("value", handler);    
    };
    
    ItemListKlassProto.startUpdateChild = function(query)
    {
        var self = this;         
	    var onAddChildCb = function (newSnapshot, prevName)
	    {
	        var item = self.addItem(newSnapshot, prevName);
	        self.updateItemID2Index();
	        if (self.onItemAdd)
	            self.onItemAdd(item);
	    };
	    var onRemoveChildCb = function (snapshot)
	    {
	        var item = self.removeItem(snapshot);
	        self.updateItemID2Index();
	        if (self.onItemRemove)
	            self.onItemRemove(item);
	    };      	        
	    var onChangeChildCb = function (snapshot, prevName)
	    {
	        var item = self.removeItem(snapshot);
	        self.updateItemID2Index();
	        self.addItem(snapshot, prevName);
	        self.updateItemID2Index();
	        if (self.onItemChange)
	            self.onItemChange(item); 
	    };
	    
	    this.query = query;
        this.onAddChildCb = onAddChildCb;
        this.onRemoveChildCb = onRemoveChildCb;
        this.onChangeChildCb = onChangeChildCb;
        
	    query["on"]("child_added", onAddChildCb);
	    query["on"]("child_removed", onRemoveChildCb);
	    query["on"]("child_moved", onChangeChildCb);
	    query["on"]("child_changed", onChangeChildCb);  	        
    };
    
    ItemListKlassProto.stopUpdateChild = function ()
	{
        if (!this.query)
            return;
        
        this.query["off"]("child_added", this.onAddChildCb);
	    this.query["off"]("child_removed", this.onRemoveChildCb);
	    this.query["off"]("child_moved", this.onChangeChildCb);
	    this.query["off"]("child_changed", this.onChangeChildCb);
        this.onAddChildCb = null;
        this.onRemoveChildCb = null;
        this.onChangeChildCb = null;	
        this.query = null;
	};	    

    ItemListKlassProto.startUpdateAll = function(query)
    {
        var self=this;
        var onReadItem = function(childSnapshot)
        {
            self.addItem(childSnapshot, null, true);
        };            
        var onItemsFetchCb = function (snapshot)
        {           
            self.Clean();
            snapshot["forEach"](onReadItem);                
            self.updateItemID2Index();   
            if (self.onItemsFetch)
                self.onItemsFetch(self.items)
        };
        
        this.query = query;
        this.onItemsFetchCb = onItemsFetchCb;
        
        query["on"]("value", onItemsFetchCb);    
    };
    
    ItemListKlassProto.stopUpdateAll = function ()
	{
        if (!this.query)
            return;
        
        this.query["off"]("value", this.onItemsFetchCb);
        this.onItemsFetchCb = null;
        this.query = null;
	};	      
    
	var cleanTable = function (o)
	{
	    var k;
	    for (k in o)
	        delete o[k];
	};
    // internal 
    // --------------------------------------------------------------------------	
	window.FirebaseItemListKlass = ItemListKlass;

    // --------------------------------------------------------------------------
    // --------------------------------------------------------------------------    
    // -------------------------------------------------------------------------- 
    var CallbackMapKlass = function ()
    {
        this.map = {};
    };
    
    var CallbackMapKlassProto = CallbackMapKlass.prototype;

	CallbackMapKlassProto.Reset = function(k)
	{
        for (var k in this.map)
            delete this.map[k];
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
            getRef(absRef)["off"](eventType, cb);  
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
            getRef(absRef)["off"](eventType); 
            delete this.map[absRef][eventType];
        }
        else if (absRef && !eventType && !cbName)
        {
            var eventMap = this.map[absRef];
            if (!eventMap)
                return;
            getRef(absRef)["off"](); 
            delete this.map[absRef];
        }  
        else if (!absRef && !eventType && !cbName)
        {
            for (var r in this.map)
            {
                getRef(r)["off"](); 
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
                    getRef(absRef)["off"](e, cbMap[cbName]);  
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
                        getRef(r)["off"](e, cbMap[cbName]);  
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
    
	window.FirebaseCallbackMapKlass = CallbackMapKlass;
    
    var getValueByKeyPath = function (item, k, default_value)
    {  
        var v;
        if (item == null)
            v = null;
        
        // invalid key    
        else if ((k == null) || (k === ""))
            v = item;
        
        // key but no object
        else if (typeof(item) !== "object")
            v = null;
        
        // only one key
        else if (k.indexOf(".") === -1)
            v = item[k];
        else
        {
            v = item;              
            var keys = k.split(".");
            var i, cnt=keys.length;
            for(i=0; i<cnt; i++)
            {
                v = v[ keys[i] ];
                if (v == null)
                    break;
            }
        }
        
        return din(v, default_value);
    }    
    
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
    
	window.FirebaseGetValueByKeyPath = getValueByKeyPath;    
    
}()); 