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
	    
	    if (!this.recycled)
	    {
            this.save_item = {};
            this.disconnectRemove_absRefs = {};        
            this.load_request_itemIDs = {};
            this.load_items = {};   
        }
        else
        {
            clean_table( this.save_item );
            clean_table( this.disconnectRemove_absRefs );
            clean_table( this.load_request_itemIDs );
            clean_table( this.load_items );           
        }
        
        //this.attachments = ["", ""];      
        this.trig_tag = null;        
             
        this.exp_CurItemID = ""; 
        this.exp_CurItemContent = null;   
        this.exp_CurKey = "";  
        this.exp_CurValue = 0;
        this.exp_LastItemID = ""; 
        this.exp_LastGeneratedKey = "";  
        this.exp_LastAttachment = "";
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
	
    instanceProto.Save = function (itemID, set_mode, tag_)
	{	 
	    if (itemID === "")
	    {
	        var ref = this.get_ref()["push"]();
	   	    itemID = ref["key"]();
	    }
	    else
	    {
	        var ref = this.get_ref(itemID);	
	    }
	    
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

	    this.exp_LastItemID = itemID;	    
	    var is_empty = is_empty_table(this.save_item);
	    var save_data = is_empty? true: this.save_item;
	    
	    var op = (set_mode == 1)? "set":"update";	    
	    ref[op](save_data, on_save);
	    
	    if (!is_empty)
	        this.save_item = {};
	};	
		
    instanceProto.At = function (itemID, key_, default_value)
	{
	    var v;
        if (!this.load_items.hasOwnProperty(itemID))
            v = null;
        else
            v = this.load_items[itemID][key_];
        
        v = din(v, default_value);
		return v;
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

    var inc = function(a, b)
    {
        return (a < b)?  1:
               (a == b)? 0:
                         (-1);
    };
    var dec = function(a, b)
    {
        return (a > b)?  1:
               (a == b)? 0:
                         (-1);
    }; 
    	
	Cnds.prototype.ForEachItemID = function ()
	{
	    var itemIDList = Object.keys(this.load_items);
	    var sort_fn = (order == 0)? inc:dec;
	    itemIDList.sort(sort_fn);
	    return this.ForEachItemID(itemIDList, this.load_items);
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
	      
    Acts.prototype.SetValue = function (key_, value_)
	{
		this.save_item[key_] = dout(value_);
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
	    this.Save(itemID, set_mode, tag_);
	};	
	
    Acts.prototype.Push = function (tag_)
	{	 
	    this.Save("", 1, tag_);
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
	
    Acts.prototype.GenerateKey = function ()
	{
	    var ref = this.get_ref()["push"]();
        this.exp_LastGeneratedKey = ref["key"]();
	};	
	
    Acts.prototype.SetPosValue = function (x, y)
	{
		this.save_item["pos"] = {"x":x, "y":y};
	};	    
	
    Acts.prototype.SetServerTimestampValue = function (key_)
	{
		this.save_item[key_] = window["Firebase"]["ServerValue"]["TIMESTAMP"];
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
  
    Acts.prototype.CancelOnDisconnected = function ()
	{
	    for(var r in this.disconnectRemove_absRefs)
	    {
	        this.get_ref(r)["onDisconnect"]()["cancel"]();
	        delete this.disconnectRemove_absRefs[r];
	    }
	};	
    
    Acts.prototype.RemoveOnDisconnected = function (itemID)
	{
	    if (itemID == "")
	        return;
        
        var ref = this.get_ref(itemID);
        ref["onDisconnect"]()["remove"]();
	    this.disconnectRemove_absRefs[ref["toString"]()] = true;
	};  
    
    Acts.prototype.SetActionID = function (on_success, on_error)
	{	 
	    this.attachments[0] = on_success;
        this.attachments[1] = on_error;
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

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
	    v = din(v);
		ret.set_any(v);
	};	
		
    Exps.prototype.At = function (ret, itemID, key_, default_value)
	{
	    var v;
        if (!this.load_items.hasOwnProperty(itemID))
            v = null;
        else
            v = this.load_items[itemID][key_];
        
        v = din(v, default_value);
		ret.set_any(v);
	};	
	
	Exps.prototype.LastItemID = function (ret)
	{
		ret.set_string(this.exp_LastItemID);
	};
	
    Exps.prototype.CurItemContent = function (ret, key_, default_value)
	{
        if (key_ == null)
            v = din(this.exp_CurItemContent);
        else
            v = din(this.exp_CurItemContent[key_], default_value);
 
		ret.set_any(v);
	};

	Exps.prototype.GenerateKey = function (ret)
	{
	    var ref = this.get_ref()["push"]();
        this.exp_LastGeneratedKey = ref["key"]();
		ret.set_string(this.exp_LastGeneratedKey);
	};	
    
	Exps.prototype.LastGeneratedKey = function (ret)
	{
	    ret.set_string(this.exp_LastGeneratedKey);
	};
    
	Exps.prototype.LastAttachment = function (ret)
	{
	    ret.set_any(this.exp_LastAttachment);
	};
    
}());