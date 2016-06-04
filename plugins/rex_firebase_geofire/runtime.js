/*
- counter value
*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_Geofire = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_Geofire.prototype;
		
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
	    this.rootpath = this.properties[0] + "/" ;
        this.exp_LastGeneratedKey = "";
        
        this.geoQuery = null;          
        this.current_items = {};
        this.exp_LastItemID = "";
        this.exp_LastLocation = null;      
        this.exp_LastDistance = 0;        
        this.exp_CurItemID = ""; 
        this.exp_CurItemContent = null;           
      
	};
	
	instanceProto.onDestroy = function ()
	{
        this.queryStop();
        this.current_items = {};
	};
    
	instanceProto.get_ref = function(k)
	{
        if (k == null)
	        k = "";
	    var path = this.rootpath + k + "/";
            
        return window["Firebase"]["database"]()["ref"](path);
        
	};   

	instanceProto.getGeo = function()
	{
        return new window["GeoFire"](this.get_ref());   
	};      
    
    instanceProto.setValue = function (itemID, location)
	{
        var self=this;      
        var onComplete = function ()
        {
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Geofire.prototype.cnds.OnUpdateComplete, self);  
        };
        
        var onError= function (error)
        {
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Geofire.prototype.cnds.OnUpdateError, self);  
        };	    
		var geo = this.getGeo();
        geo["set"](itemID, location)["then"](onComplete, onError);
	};
    
    instanceProto.getValue = function (itemID)
	{
        var self=this;      
        var onComplete = function (location)
        {
            self.exp_LastItemID = itemID;
            self.exp_LastLocation = location;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Geofire.prototype.cnds.OnGetItemComplete, self);  
        };
        
        var onError= function (error)
        {
            self.exp_LastItemID = itemID;            
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Geofire.prototype.cnds.OnGetItemError, self);  
        };	    
		var geo = this.getGeo();
        geo["get"](itemID)["then"](onComplete, onError);
	};
    
    
    instanceProto.queryStart = function (lat, lng, r)
	{
        var d = { "center": [lat, lng], "radius": r };
		if (!this.geoQuery)
        {
            this.geoQuery = this.getGeo()["query"](d);
            
            var trig = cr.plugins_.Rex_Firebase_Geofire.prototype.cnds;            
            var self = this;
            var onReady = function ()
            {
                self.runtime.trigger(trig.OnReady, self);  
            };
            var onEntered = function (itemID, location, distance)
            {
                self.exp_LastItemID = itemID;
                self.exp_LastLocation = location;
                self.exp_LastDistance = distance;
                self.current_items[itemID] = [location, distance];
                self.runtime.trigger(trig.OnItemEntered, self);  
            };
            var onExisted = function (itemID, location, distance)
            {
                self.exp_LastItemID = itemID;
                self.exp_LastLocation = location;
                self.exp_LastDistance = distance;
                if (self.current_items.hasOwnProperty(itemID))
                    delete self.current_items[itemID];
                self.runtime.trigger(trig.OnItemExisted, self);  
            };            
            var onMoved = function (itemID, location, distance)
            {
                self.exp_LastItemID = itemID;
                self.exp_LastLocation = location;
                self.exp_LastDistance = distance;
                self.current_items[itemID] = [location, distance];
                self.runtime.trigger(trig.OnItemMoved, self);  
            };              

            this.geoQuery.on("ready", onReady);
            this.geoQuery.on("key_entered", onEntered );        
            this.geoQuery.on("key_exited", onExisted  );
            this.geoQuery.on("key_moved", onMoved  );   
            
        }
        else
            this.geoQuery["updateCriteria"](d);
	}; 
    
    instanceProto.queryStop= function ()
	{
        if (!this.geoQuery)
            return;
        
        this.geoQuery["cancel"]();
        this.geoQuery = null;
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
            
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	
	Cnds.prototype.OnUpdateComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnUpdateError = function ()
	{
	    return true;
	};    
	
	Cnds.prototype.OnGetItemComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnGetItemError = function ()
	{
	    return true;
	};   	
	Cnds.prototype.IsItemNotFound = function ()
	{
	    return (this.exp_LastLocation == null);
	};      
	Cnds.prototype.OnItemEntered = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnItemExisted = function ()
	{
	    return true;
	};        
	Cnds.prototype.OnItemMoved = function ()
	{
	    return true;
	};            
	Cnds.prototype.OnReady = function ()
	{
	    return true;
	};

	Cnds.prototype.ForEachItemID = function (sortMode_)
	{
        var table = this.current_items;
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
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
     
    Acts.prototype.SetSubDomainRef = function (ref)
	{
		this.rootpath = ref + "/";
      
	};   
     
    Acts.prototype.SetLocation = function (itemID, lat, lng)
	{
        this.setValue(itemID, [lat, lng]);
	};   
     
    Acts.prototype.OnDisconnectedRemove = function (itemID)
	{
		var geo = this.getGeo();
        geo["ref"]()["child"](itemID)["onDisconnect"]()["remove"]();
	}; 
     
    Acts.prototype.RemoveItem = function (itemID)
	{
        this.setValue(itemID, null);
	}; 
     
    Acts.prototype.GetItem = function (itemID)
	{
        this.getValue(itemID);
	};      
         
    Acts.prototype.OnDisconnectedCancel = function (itemID)
	{
		var geo = this.getGeo();
        geo["ref"]()["child"](itemID)["onDisconnect"]()["cancel"]();
	}; 
    
    Acts.prototype.MonitorAt = function (lat, lng, r)
	{
		this.queryStart(lat, lng, r);
	};   
     
    Acts.prototype.MonitorStop = function ()
	{
		this.queryStop();
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
    
	Exps.prototype.LastItemID = function (ret)
	{
		ret.set_string(this.exp_LastItemID);
	};
    
	Exps.prototype.LastLatitude = function (ret)
	{
        var lat = (this.exp_LastLocation)? this.exp_LastLocation[0]:0;
		ret.set_float(lat);
	};
    
	Exps.prototype.LastLongitude = function (ret)
	{
        var lng = (this.exp_LastLocation)? this.exp_LastLocation[1]:0;
		ret.set_float(lng);
	};        
  
	Exps.prototype.LastDistance = function (ret)
	{
		ret.set_float(this.exp_LastDistance);
	};

    Exps.prototype.CurItemID = function (ret)
	{
		ret.set_string(this.exp_CurItemID);
	};    

    Exps.prototype.CurLatitude = function (ret)
	{
        var lat = (this.exp_CurItemContent)? this.exp_CurItemContent[0][0] : 0;
		ret.set_float(lat);
	};    

    Exps.prototype.CurLongitude = function (ret)
	{
        var lng = (this.exp_CurItemContent)? this.exp_CurItemContent[0][1] : 0;
		ret.set_float(lng);
	};    

    Exps.prototype.CurDistance = function (ret)
	{
        var d = (this.exp_CurItemContent)? this.exp_CurItemContent[1] : 0;
		ret.set_float(d);
	};        
    
	Exps.prototype.MonitorLatitude = function (ret)
	{
        var lat = (this.geoQuery)? this.geoQuery["center"]()[0]:0;
		ret.set_float(lat);
	};
    
	Exps.prototype.MonitorLongitude = function (ret)
	{
        var lng = (this.geoQuery)? this.geoQuery["center"]()[1]:0;
		ret.set_float(lng);
	};     
    
	Exps.prototype.MonitorRadius = function (ret)
	{
        var r = (this.geoQuery)? this.geoQuery["radius"]():0;
		ret.set_float(r);
	};    
	Exps.prototype.Distance = function (ret, latA, lngA, latB, lngB)
	{
        var d = window["GeoFire"]["distance"]([latA, lngA], [latB, lngB]);
		ret.set_float(d);
	};  
    
}());