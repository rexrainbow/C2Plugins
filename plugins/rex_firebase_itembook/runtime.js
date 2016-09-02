/*
<tableID>\
    <itemID>: <value>
*/

// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_ItemBook = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_ItemBook.prototype;
		
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
	    this.rootpath = this.properties[0] + "/"; 
        
        this.exp_LastGeneratedKey = "";
        this.exp_LastRandomBase32 = "";             
        this.writeItems = {};
        this.writeTableID = null;
        this.writeItemID = null;

        this.readTables = {};
        this.queueMode = false;
        this.requestQueue = [];
        this.onRequestComplete = null;  
        this.addToRequestQueue = null;        
        this.exp_LastTableID = "";         
        this.exp_LastItemID = "";
   
        this.trigTag = null;
        
        
        this.exp_CurItemID = ""; 
        this.exp_CurItemContent = null;   
        this.exp_CurKey = "";  
        this.exp_CurValue = 0;        
        
        this.convertKeyTableID = "tableID";
        this.convertKeyItemID = "itemID";
	};
	
	instanceProto.onDestroy = function ()
	{
	};

	instanceProto.get_ref = function(k)
	{
        if (k == null)
	        k = "";
	    var path = this.rootpath + k + "/";
            
        return window["Firebase"]["database"]()["ref"](path);
        
	};      
    
	instanceProto.repeatEvents = function ()
	{
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
        if (solModifierAfterCnds)
            this.runtime.pushCopySol(current_event.solModifiers);
        
        current_event.retrigger();
        
        if (solModifierAfterCnds)
            this.runtime.popSol(current_event.solModifiers);            
	};    

    var getFullKey = function (prefix, tableID, itemID, key)
    {
        var k = prefix;
        if (tableID != null)
            k += "/" + tableID;
        if (itemID != null)
            k +=  "/" + itemID;
        if (key != null)
        {
            key = key.replace(/\./g, "/");
            k += "/" + key;
        }
        
        return k;
    }
	instanceProto.setValue = function (tableID_, itemID_, k_, v_)
	{                
        // update tables
        k_ = getFullKey("", tableID_, itemID_, k_);
        this.writeItems[k_] = v_;         
	};      
    
    instanceProto.TreeSetValue = function (k_, v_)
	{
        if ((this.writeTableID === null) || (this.writeItemID === null))
        {
            alert("ItemBook: key-value must be assigned under table and item.");
            return;
        }        
        this.setValue(this.writeTableID, this.writeItemID, k_, v_);
	};      
    
    instanceProto.EnumSetValue = function (tableID_, itemID_, k_, v_)
	{
        if ((tableID_ === "") || (itemID_ === ""))
        {
            alert("ItemBook: key-value must be assigned under table and item.");
            return;
        }        
        this.setValue(tableID_, itemID_, k_, v_);
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
                this.runtime.pushCopySol(current_event.solModifiers);            
            
            this.exp_CurItemID = itemIDList[i];
            this.exp_CurItemContent = items[this.exp_CurItemID]; 
            current_event.retrigger();
            
		    if (solModifierAfterCnds)		    
		        this.runtime.popSol(current_event.solModifiers);		   
		}
     		
		return false;
	}; 
        
	instanceProto.ConvertItem = function (item, tableID_, itemID_)
	{
        item[this.convertKeyTableID] = tableID_;        
        item[this.convertKeyItemID] = itemID_;
        return item;
	};

	instanceProto.RevertItem = function (item)
	{
        delete item[this.convertKeyTableID];
        delete item[this.convertKeyItemID];        
	};    
    
	instanceProto.saveToJSON = function ()
	{
		return { 
            "lk": this.exp_LastGeneratedKey,
            "lr": this.exp_LastRandomBase32,
            };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.exp_LastGeneratedKey = o["lk"];
        this.exp_LastRandomBase32 = o["lr"];        
	};    
    
    var isCleanBook = function (o)
    {
        // object has only one property, and this property is ""
        var cnt = 0;
        for (var k in o)
        {
            if ((k === "") && (cnt === 0))
                return true;
            
            cnt++;
        }
        
        return false;
    }
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.AddTableNode = function (name_)
	{
        if (this.writeTableID !== null)
        {
            alert("ItemBook: nested table is not allowed.");
            return;
        }
        this.writeTableID = name_;
        this.repeatEvents();
        this.writeTableID = null;
        return false;
	};	

	Cnds.prototype.AddItemNode = function (name_)
	{
        if (this.writeTableID === null)
        {
            alert("ItemBook: itemID should be put in a table.");
            return;
        }        
        if (this.writeItemID !== null)
        {
            alert("ItemBook: nested itemID is not allowed.");
            return;
        }          
        
        this.writeItemID = name_;
        this.repeatEvents();
        this.writeItemID = null;
        return false;
	};	    
    
	Cnds.prototype.TreeOnDisconnectedRemove = function ()
	{
        var k = getFullKey("", this.writeTableID, this.writeItemID);  
        var ref = this.get_ref(k);
        ref["onDisconnect"]()["remove"]();	   
        return true;
	};     
    
	Cnds.prototype.TreeOnDisconnectedCancel = function ()
	{
        var k = getFullKey("", this.writeTableID, this.writeItemID);  
        var ref = this.get_ref(k);
        ref["onDisconnect"]()["cancel"]();	   
        return true;
	};       
    
	Cnds.prototype.OnUpdateComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnUpdateError = function ()
	{
	    return true;
	};
	
	Cnds.prototype.OnRequestComplete = function (tag_)
	{
	    return cr.equals_nocase(tag_, this.trigTag);
	}; 

	Cnds.prototype.ForEachItemID = function (tableID_, sortMode_)
	{
        var table = this.readTables[tableID_];
        if (table == null)
           return false;

	    var itemIDList = Object.keys(table);

        var self = this;        
        var sortFn = function (valA, valB)
        {
            var m = sortMode_;
            
            if (sortMode_ >= 2)  // logical descending, logical ascending
            {
                valA = parseFloat(valA);
                valB = parseFloat(valB);
                m -= 2;
            }

            switch (m)
            {
            case 0:  // descending
                if (valA === valB) return 0;
                else if (valA < valB) return 1;
                else return -1;
                break;
                
            case 1:  // ascending
                if (valA === valB) return 0;
                else if (valA > valB) return 1;
                else return -1;
                break;
                
            }
        };

	    itemIDList.sort(sortFn);
	    return this.ForEachItemID(itemIDList, table);
	};	
	
	Cnds.prototype.ForEachKey = function (tableID_, itemID)
	{
        var table = this.readTables[tableID_];
        if (table == null)
           return false;

	    var item_props = table[itemID];
	    if (item_props == null)
	        return false;
	        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		var k, o=item_props;
		for(k in o)
		{
            if (solModifierAfterCnds)
                this.runtime.pushCopySol(current_event.solModifiers);            
            
            this.exp_CurKey = k;
            this.exp_CurValue = o[k];
            current_event.retrigger();
            
		    if (solModifierAfterCnds)		    
		        this.runtime.popSol(current_event.solModifiers);		             
		}

		return false;
	};	

	Cnds.prototype.TableIsEmpty = function (tableID_)
	{
        var table = this.readTables[tableID_];
        if (table == null)
           return true;
       
         for (var k in table)
         {
             return false;
         }
         
         return true;
	}; 	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetSubDomainRef = function (ref)
	{
		this.rootpath = ref + "/";
        this.readTables = {};
	};      
    Acts.prototype.TreeSetValue = function (k_, v_)
	{
        this.TreeSetValue(k_, v_);
	};     

    Acts.prototype.TreeSetBooleanValue = function (k_, v_)
	{
        this.TreeSetValue(k_, (v_ === 1));
	};   

    Acts.prototype.TreeSetNullValue = function (k_)
	{
        this.TreeSetValue(k_, null);
	};   

    Acts.prototype.TreeCleanAll = function ()
	{
        this.setValue(this.writeTableID, this.writeItemID, null, null);
	};   
    
    Acts.prototype.TreeSetServerTimestamp = function (k_)
	{
        this.TreeSetValue(k_, window["Firebase"]["database"]["ServerValue"]);
	};       
    
    Acts.prototype.TreeSetJSON = function (k_, v_)
	{
        v_ = JSON.parse(v_);
        this.TreeSetValue(k_, v_);
	};       

    Acts.prototype.UpdateBook = function ()
	{        
        var self=this;      
	    var handler = function(error) 
	    {
	        var trig = (error)? cr.plugins_.Rex_Firebase_ItemBook.prototype.cnds.OnUpdateError:
	                                    cr.plugins_.Rex_Firebase_ItemBook.prototype.cnds.OnUpdateComplete;
	        self.runtime.trigger(trig, self);  
        };
        var ref = this.get_ref();
        
        if (isCleanBook(this.writeItems))
        {
            ref["parent"]["set"](null, handler);
        }
        else
        {
            ref["update"](this.writeItems, handler);
        }
        this.writeItems = {};
	};      
    
    Acts.prototype.EnumSetValue = function (tableID_, itemID_, k_, v_)
	{
        this.EnumSetValue(tableID_, itemID_, k_, v_);
	};     

    Acts.prototype.EnumSetBooleanValue = function (tableID_, itemID_, k_, v_)
	{
        this.EnumSetValue(tableID_, itemID_, k_, (v_ === 1));
	};   

    Acts.prototype.EnumSetNullValue = function (tableID_, itemID_, k_)
	{
        if (tableID_ === "")
            this.setValue(null, null, null, null);
        else if (itemID_ === "")
            this.setValue(tableID_, null, null, null);
        else if (k_ === "")
            this.setValue(tableID_, itemID_, null, null);   
        else
            this.setValue(tableID_, itemID_, k_, null);
	};   
    
    Acts.prototype.EnumSetServerTimestamp = function (tableID_, itemID_, k_)
	{
        this.EnumSetValue(tableID_, itemID_, k_, window["Firebase"]["database"]["ServerValue"]);
	};       
    
    Acts.prototype.EnumSetJSON = function (tableID_, itemID_, k_, v_)
	{
        v_ = JSON.parse(v_);
        this.EnumSetValue(tableID_, itemID_, k_, v_);
	};      
    Acts.prototype.TreeOnDisconnectedCancel = function (k_)
	{
        var k = getFullKey("", this.writeTableID, this.writeItemID, k_);  
        var ref = this.get_ref(k);
        ref["onDisconnect"]()["cancel"]();	    
	};        
   
    Acts.prototype.TreeOnDisconnectedSetServerTimestamp = function (k_)
	{
        var k = getFullKey("", this.writeTableID, this.writeItemID, k_);  
        var ref = this.get_ref(k);
        ref["onDisconnect"]()["set"](window["Firebase"]["database"]["ServerValue"]);	    
	};     
   
    Acts.prototype.TreeOnDisconnectedSetValue = function (k_, v_)
	{
        var k = getFullKey("", this.writeTableID, this.writeItemID, k_);  
        var ref = this.get_ref(k);
        ref["onDisconnect"]()["set"](v_);	    
	};      
   
    Acts.prototype.TreeOnDisconnectedSetBooleanValue = function (k_, v_)
	{
        var k = getFullKey("", this.writeTableID, this.writeItemID, k_);  
        var ref = this.get_ref(k);
        ref["onDisconnect"]()["set"](v_===1);	    
	};  
    
    Acts.prototype.TreeOnDisconnectedSetJSON = function (k_, v_)
	{
        var k = getFullKey("", this.writeTableID, this.writeItemID, k_);  
        var ref = this.get_ref(k);
        v_ = JSON.parse(v_);
        ref["onDisconnect"]()["set"](v_);	    
	};    
    
    Acts.prototype.EnumOnDisconnectedRemove = function (tableID_, itemID_, k_)
	{
        var k = getFullKey("", tableID_, itemID_, k_);  
        var ref = this.get_ref(k);
        ref["onDisconnect"]()["remove"]();	    
	};        
   
    Acts.prototype.EnumOnDisconnectedSetServerTimestamp = function (tableID_, itemID_, k_)
	{
        var k = getFullKey("", tableID_, itemID_, k_);  
        var ref = this.get_ref(k);
        ref["onDisconnect"]()["set"](window["Firebase"]["database"]["ServerValue"]);	    
	};     
   
    Acts.prototype.EnumOnDisconnectedSetValue = function (tableID_, itemID_, k_, v_)
	{
        var k = getFullKey("", tableID_, itemID_, k_);  
        var ref = this.get_ref(k);
        ref["onDisconnect"]()["set"](v_);	    
	};     
   
    Acts.prototype.EnumOnDisconnectedSetBooleanValue = function (tableID_, itemID_, k_, v_)
	{
        var k = getFullKey("", tableID_, itemID_, k_);  
        var ref = this.get_ref(k);
        ref["onDisconnect"]()["set"](v_ === 1);	    
	};     
   
    Acts.prototype.EnumOnDisconnectedSetJSON = function (tableID_, itemID_, k_, v_)
	{        
        var k = getFullKey("", tableID_, itemID_, k_);  
        var ref = this.get_ref(k);
        v_ = JSON.parse(v_);
        ref["onDisconnect"]()["set"](v_);	    
	};         
    
    Acts.prototype.EnumOnDisconnectedCancel = function (tableID_, itemID_, k_)
	{
        var k = getFullKey("", tableID_, itemID_, k_);  
        var ref = this.get_ref(k);
        ref["onDisconnect"]()["cancel"]();	    
	};
    
    // query
	var LIMITTYPE = ["limitToFirst", "limitToLast"];
    Acts.prototype.GetItemsBySingleConditionInRange = function (tableID_, key_, start, end, limit_type, limit_count, tag_)
	{  
        var self=this;
        var onReqDone = this.onRequestComplete;
        var onRead = function (snapshot)
        {
            if (!self.readTables.hasOwnProperty(tableID_))
                self.readTables[tableID_] = {};
            var table = self.readTables[tableID_];
            var items = snapshot["val"]() || {};
            for (var k in items)
                table[k] = items[k];
            
            self.exp_LastTableID = tableID_;                  
            self.trigTag = tag_;
		    self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemBook.prototype.cnds.OnRequestComplete, self); 	   
			self.trigTag = null;
            
            if (onReqDone)
                onReqDone();
        };	    
        	    
	    var query = this.get_ref()["child"](tableID_);
        query = query["orderByChild"](key_);
	    query = query["startAt"](start)["endAt"](end);
        if (limit_count > 0)
	        query = query[LIMITTYPE[limit_type]](limit_count);
        
        var qf = function()
        {
	        query["once"]("value", onRead);
        }
        if (!onReqDone)
	        qf();
        else
            this.addToRequestQueue(qf);
	};	
	
	var COMPARSION_TYPE = ["equalTo", "startAt", "endAt", "startAt", "endAt"];
    Acts.prototype.GetItemsBySingleCondition = function (tableID_, key_, comparsion_type, value_, limit_type, limit_count, tag_)
	{  
        var self=this;
        var onReqDone = this.onRequestComplete;     
        var onRead = function (snapshot)
        {
            if (!self.readTables.hasOwnProperty(tableID_))
                self.readTables[tableID_] = {};            
            var table = self.readTables[tableID_];
            var items = snapshot["val"]() || {};
            for (var k in items)
                table[k] = items[k];
            
            self.exp_LastTableID = tableID_;              
            self.trigTag = tag_;
		    self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemBook.prototype.cnds.OnRequestComplete, self); 	   
			self.trigTag = null;
            
            if (onReqDone)
                onReqDone();
        };	       
        	    
	    var query = this.get_ref()["child"](tableID_);	  
        query = query["orderByChild"](key_);        
	    query = query[COMPARSION_TYPE[comparsion_type]](value_);
        if (limit_count > 0)	    
	        query = query[LIMITTYPE[limit_type]](limit_count);

        var qf = function()
        {
	        query["once"]("value", onRead);
        }
        if (!onReqDone)
	        qf();
        else
            this.addToRequestQueue(qf);        
	};	    

    Acts.prototype.LoadItem = function (tableID_, itemID_, tag_)
	{ 
        if (tableID_ === "")
            itemID_ = "";   
        
        var self=this;
        var onReqDone = this.onRequestComplete;   
        var onRead = function (snapshot)
        {            
            var o =  snapshot["val"]() || {};
            if (tableID_ === "")
            {
                self.readTables = o;  
            }
            else if (itemID_ === "")
            {
                self.readTables[tableID_] = o ;
            }
            else
            {
                if (!self.readTables.hasOwnProperty(tableID_))
                    self.readTables[tableID_] = {};
                self.readTables[tableID_][itemID_] = o;
            }   
            self.exp_LastTableID = tableID_;   
            self.exp_LastItemID = itemID_;               
            self.trigTag = tag_;
		    self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemBook.prototype.cnds.OnRequestComplete, self); 	   
			self.trigTag = null;
            
            if (onReqDone)
                onReqDone();            
        };	       
        
     
        var query = this.get_ref();       
        if (tableID_ !== "")        
            query = query["child"](tableID_);
        if (itemID_ !== "")
            query = query["child"](itemID_);
                
        var qf = function()
        {
	        query["once"]("value", onRead);
        }
        if (!onReqDone)
	        qf();
        else
            this.addToRequestQueue(qf);            
	};
    
    
    Acts.prototype.StartQueue = function (tag_)
	{
        this.queueMode = true;
        this.requestQueue.length = 0;  
        
        var self=this;
        var queueCnt=0;
        this.addToRequestQueue = function (qf)
        {
            this.requestQueue.push(qf);
            queueCnt += 1;
        }
        this.onRequestComplete = function ()
        {
            queueCnt -= 1;
            if (queueCnt === 0)
            {
                self.trigTag = tag_;
		        self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemBook.prototype.cnds.OnRequestComplete, self); 	   
			    self.trigTag = null;
                self.onRequestComplete = null;
            }
        }
	};     
    Acts.prototype.ProcessQueue = function ()
	{
        for (var i in this.requestQueue)
            this.requestQueue[i]();
        
        this.queueMode = false;
	};

    Acts.prototype.CleanResultTable = function (tableID_)
	{
        if (tableID_ === "")
            this.readTables = {};
        else if (this.readTables.hasOwnProperty(tableID_))
            delete this.readTables[tableID_];
            
	};    
    // query    
    
    Acts.prototype.SetConvertKeyName = function (keyTableID_, keyItemID_)
	{
        this.convertKeyTableID = keyTableID_;
        this.convertKeyItemID = keyItemID_;        
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
  	Exps.prototype.GenerateKey = function (ret)
	{
	    var ref = this.get_ref()["push"]();
        this.exp_LastGeneratedKey = ref["key"];
		ret.set_string(this.exp_LastGeneratedKey);
	};	
    
	Exps.prototype.LastGeneratedKey = function (ret)
	{
	    ret.set_string(this.exp_LastGeneratedKey);
	};
    
    Exps.prototype.At = function (ret, tableID, itemID, key, default_value)
	{
        var item = this.readTables;
        if (tableID)
        {
            item = item[tableID];
            if (item && itemID)
                item = item[itemID];        
        }
		ret.set_any( window.FirebaseGetValueByKeyPath(item, key, default_value) );
	};	    
    
	Exps.prototype.LastTableID = function (ret)
	{
		ret.set_string(this.exp_LastTableID);
	}	
	Exps.prototype.LastItemID = function (ret)
	{
		ret.set_string(this.exp_LastItemID);
	};    

    Exps.prototype.CurItemID = function (ret)
	{
		ret.set_string(this.exp_CurItemID);
	};

    Exps.prototype.CurKey = function (ret)
	{
		ret.set_string(this.exp_CurKey);
	};	
	
    Exps.prototype.CurValue = function (ret, subKey, default_value)
	{
		ret.set_any( window.FirebaseGetValueByKeyPath(this.exp_CurValue, subKey, default_value ) );
	};	
    	
    Exps.prototype.CurItemContent = function (ret, k, default_value)
	{
		ret.set_any( window.FirebaseGetValueByKeyPath(this.exp_CurItemContent, k, default_value ) );
	};    
        
    Exps.prototype.AsItemList = function (ret, tableID_, itemID_)
	{
        var itemList = [];
        var table, item;
        if (tableID_ == null)
        {
            // convert all tables into item list            
            for (var tableID in this.readTables)
            {
                table = this.readTables[tableID];
                for (var itemID in table)
                {
                    item = table[itemID];
                    itemList.push(this.ConvertItem(item, tableID, itemID));
                }
            }
        }
        else if (itemID_ == null)
        {
            // convert a table into item list     
            table = this.readTables[tableID_];
            if (table)
            {
                for (var itemID in table)
                {
                    item = table[itemID];
                    itemList.push(this.ConvertItem(item, tableID_, itemID));
                }
            }            
        }
        else
        {
            // convert an item into item list 
            table = this.readTables[tableID_];
            if (table)
            {
                item = table[itemID_];
                if (item)
                    itemList.push(this.ConvertItem(item, tableID_, itemID_));
            }
            
        }
        var json_ = JSON.stringify(itemList);
        
        var i, cnt=itemList.length;
        for(i=0; i<cnt; i++)
        {
            this.RevertItem(itemList[i]);
        }
        
		ret.set_string(json_);
	};	 
    
    Exps.prototype.ItemCount = function (ret, tableID_)
	{
        var cnt=0;
        if (tableID_ != null)
        {
            var table = this.readTables[tableID_];
            if (table)
            {
                for (var itemID in table)                
                    cnt++                
            }
        }
        else
        {
            var table;
            for(var tableID in this.readTables)
            {
                table = this.readTables[tableID];
                for (var itemID in table)                
                    cnt++        
            }
        }
		ret.set_int(cnt);
	};    
    
    Exps.prototype.Ref = function (ret, tableID_, itemID_, key_)
	{
        var path = this.rootpath + getFullKey("", tableID_, itemID_, key_);  
		ret.set_string(path);
	};

    var num2base32 = ["0","1","2","3","4","5","6","7","8","9",
                                 "b","c","d","e","f","g","h","j","k","m",
                                 "n","p","q","r","s","t","u","v","w","x",
                                 "y","z"];
    Exps.prototype.RandomBase32 = function (ret, dig)
	{
        var o = "";
        for (var i=0;i<dig;i++)
            o += num2base32[ Math.floor( Math.random()*32 ) ];
        
        this.exp_LastRandomBase32 = o;
	    ret.set_string( o );
	};	   
    Exps.prototype.LastRandomBase32 = function (ret)
	{
	    ret.set_string( this.exp_LastRandomBase32 );
	};	  

    
}());