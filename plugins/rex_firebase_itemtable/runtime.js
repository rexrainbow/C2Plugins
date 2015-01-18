// ECMAScript 5 strict mode
"use strict";

/*
<itemID>\
    <Key> : <value>
*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_ItemTable = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var input_text = "";
	var pluginProto = cr.plugins_.Rex_Firebase_ItemTable.prototype;
		
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
	    
        this.save_item = {};
        this.trig_tag = null;
        this.load_request_itemIDs = {};
        this.load_items = {};        
        this.exp_CurItemID = "";    
        this.exp_CurKey = "";  
        this.exp_CurValue = 0;
        this.exp_LastItemID = "";           	    
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

	var clean_table = function (o)
	{
	    var k;
		for (k in o)
		    delete o[k];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnSaveComplete = function (tag_)
	{
	    return cr.equals_nocase(tag_, this.trig_tag);
	}; 
	Cnds.prototype.OnSaveError = function (tag_)
	{
	    return cr.equals_nocase(tag_, this.trig_tag);
	};
	
	Cnds.prototype.OnRemoveComplete = function (tag_)
	{
	    return cr.equals_nocase(tag_, this.trig_tag);
	}; 
	Cnds.prototype.OnRemoveError = function (tag_)
	{
	    return cr.equals_nocase(tag_, this.trig_tag);
	};	
	
	Cnds.prototype.OnLoadComplete = function (tag_)
	{
	    return cr.equals_nocase(tag_, this.trig_tag);
	}; 
	
	Cnds.prototype.ForEachItemID = function ()
	{
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		var k, o=this.load_items;
		for(k in o)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurItemID = k;
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
		    
        this.exp_CurItemID = "";   		
		return false;
	};	
	
	Cnds.prototype.ForEachKey = function (itemID)
	{
	    var item_props = this.load_items[itemID];
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
		    
        this.exp_CurItemID = "";   		
		return false;
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
      
    Acts.prototype.SetValue = function (key_, value_)
	{
        var save_value;
        if (typeof(value_) == "string")
        {
            try
            {
	            save_value = JSON.parse(value_);
            }
            catch(err)
            {
                save_value = value_;
            }
        }
        else
        {
            save_value = value_;
        }
            
		this.save_item[key_] = save_value;
	};
	
    Acts.prototype.SetBooleanValue = function (key_, is_true)
	{
		this.save_item[key_] = (is_true == 1);
	};

    Acts.prototype.RemoveKey = function (key_)
	{
		this.save_item[key_] = null;
	};  	
	
    Acts.prototype.Save = function (itemID, set_mode, tag_)
	{	 
	    var self = this;	
	    var on_save = function (error)
	    {
		    var trig = (!error)? cr.plugins_.Rex_Firebase_ItemTable.prototype.cnds.OnSaveComplete:
		                         cr.plugins_.Rex_Firebase_ItemTable.prototype.cnds.OnSaveError;
            self.trig_tag = tag_;	
            self.exp_CurItemID = itemID;	                         
		    self.runtime.trigger(trig, self); 	   
		    self.trig_tag = null;
		    self.exp_CurItemID = "";
	    };
	    var op = (set_mode == 1)? "set":"update";
	    this.get_ref(itemID)[op](this.save_item, on_save);
	    this.exp_LastItemID = itemID;
	    this.save_item = {};
	};	
	
    Acts.prototype.Push = function (tag_)
	{	 
	    var self = this;
	    var itemID;	
	    var on_push = function (error)
	    {
		    var trig = (!error)? cr.plugins_.Rex_Firebase_ItemTable.prototype.cnds.OnSaveComplete:
		                         cr.plugins_.Rex_Firebase_ItemTable.prototype.cnds.OnSaveError;
            self.trig_tag = tag_;	
            self.exp_CurItemID = itemID;	                         
		    self.runtime.trigger(trig, self); 	   
		    self.trig_tag = null;
		    self.exp_CurItemID = "";
	    };
	    var ref = this.get_ref(itemID)["push"](this.save_item, on_push);
	    itemID = ref["key"]();
	    this.exp_LastItemID = itemID;
	    this.save_item = {};
	};	
	
    Acts.prototype.Remove = function (itemID, tag_)
	{
	    var self = this;	
	    var on_remove = function (error)
	    {
		    var trig = (!error)? cr.plugins_.Rex_Firebase_ItemTable.prototype.cnds.OnRemoveComplete:
		                         cr.plugins_.Rex_Firebase_ItemTable.prototype.cnds.OnRemoveError;
            self.trig_tag = tag_;	
            self.exp_CurItemID = itemID;	                         
		    self.runtime.trigger(trig, self); 	   
		    self.trig_tag = null;
		    self.exp_CurItemID = "";
	    };  
	    this.get_ref(itemID)["remove"](on_remove);
	};
  
	
    Acts.prototype.AddLoadRequestItemID = function (itemID)
	{
	    if (itemID == "")
	        return;
	        
		this.load_request_itemIDs[itemID] = true;
	};
			
    Acts.prototype.LoadItems = function (tag_)
	{
	    clean_table(this.load_items);

        var self = this;
	    // wait done
        var wait_events = 0;    
	    var isDone_handler = function()
	    {
	        wait_events -= 1;
	        if (wait_events == 0)
	        {	            
	            // all jobs done
                self.trig_tag = tag_;	                    
                var trig = cr.plugins_.Rex_Firebase_ItemTable.prototype.cnds.OnLoadComplete;     
				self.runtime.trigger(trig, self); 	   
				self.trig_tag = null;	  
	        }
	    };
	    // wait done
	    
        // read handler	    
	    var on_read = function (snapshot)
	    {
	        var itemID = snapshot["key"]();
	        var content = snapshot["val"]();
	        self.load_items[itemID] = content;
	        isDone_handler();
	    };		    
	    	    
        // read itemIDs
        var itemID, item_ref;
		for(itemID in this.load_request_itemIDs)
		{
		    wait_events += 1;
		    item_ref = this.get_ref(itemID)["once"]("value", on_read);
		    delete this.load_request_itemIDs[itemID];
		}		
	};	

    Acts.prototype.LoadAllItems = function (tag_)
	{
	    clean_table(this.load_items);

        var self = this;
	    // wait done
        var wait_events = 0;    
	    var isDone_handler = function()
	    {
	        wait_events -= 1;
	        if (wait_events == 0)
	        {	            
	            // all jobs done
                self.trig_tag = tag_;	                    
                var trig = cr.plugins_.Rex_Firebase_ItemTable.prototype.cnds.OnLoadComplete;     
				self.runtime.trigger(trig, self); 	   
				self.trig_tag = null;	  
	        }
	    };
	    // wait done
        
        // read handler	
        var read_item = function(childSnapshot)
        {
            var key = childSnapshot["key"]();
            var childData = childSnapshot["val"]();
            self.load_items[key] = childData;
        };   
	    var on_read = function (snapshot)
	    {            
            snapshot["forEach"](read_item);
            isDone_handler();
	    };		    
	    	    
        // read all
        wait_events += 1;
        this.get_ref()["once"]("value", on_read);	
	};	    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    var parse_itemValue = function (vin)
    {        
        var vout;
	    if (vin === true)
	        vout = 1;
	    else if (vin === false)
	        vout = 0;
        else if (typeof(vin) == "object")
            vout = JSON.stringify(vin);
        else
            vout = vin;
	    return vout;
    };
    
    Exps.prototype.CurItemID = function (ret)
	{
		ret.set_string(this.exp_CurItemID);
	};
    
	Exps.prototype.LoadResultToJSON = function (ret)
	{
		ret.set_string(JSON.stringify(this.load_items));
	};	
	
    Exps.prototype.CurKey = function (ret)
	{
		ret.set_string(this.exp_CurKey);
	};	
	
    Exps.prototype.CurValue = function (ret)
	{
	    var v = this.exp_CurValue;
	    v = parse_itemValue(v);
		ret.set_any(v);
	};	
		
    Exps.prototype.At = function (ret, itemID, key_, default_value)
	{
	    var v;
	    var item_props = this.load_items[itemID];
	    if (item_props)
	    {
	        v = item_props[key_];
	        v = parse_itemValue(v);	        
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
	
	Exps.prototype.LastItemID = function (ret)
	{
		ret.set_string(this.exp_LastItemID);
	};			
}());