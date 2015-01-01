/*
itemIDs\
    <itemID>: true
    
filters\
    <keys>
        <itemID>: <value>

keys\
    <keys>: true
*/

// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_ItemFilter = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var input_text = "";
	var pluginProto = cr.plugins_.Rex_Firebase_ItemFilter.prototype;
		
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
        this.request_itemIDs = {};	
        
        this.exp_CurItemID = "";
	};
	
	instanceProto.get_ref = function(k)
	{
        if (k == null)
            k = "";

        return new window["Firebase"](this.rootpath + k + "/");
	};
	
	instanceProto.get_key_ref = function(itemID, key_)
	{
        return this.get_ref()["child"]("filters")["child"](key_)["child"](itemID);
	};
	
	instanceProto.get_keyIndex_ref = function()
	{
        return this.get_ref()["child"]("keys");
	};
	
	instanceProto.get_itemID_ref = function(itemID)
	{
        return this.get_ref("itemIDs")["child"](itemID)
	};

	var clean_table = function (o)
	{
	    var k;
		for (k in o)
		    delete o[k];
	};
	
	var retrieve_itemIDs = function (table_in, arr_out)
	{
        var itemID;
        arr_out.length = 0;
        for (itemID in table_in)
        {
            arr_out.push(itemID);
        }
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
	
	Cnds.prototype.OnRequestComplete = function (tag_)
	{
	    return cr.equals_nocase(tag_, this.trig_tag);
	}; 
	
	Cnds.prototype.ForEachItemID = function ()
	{
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		var k, o=this.request_itemIDs;
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
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
    Acts.prototype.SetValue = function (key_, value_)
	{
		this.save_item[key_] = value_;
	};
	
    Acts.prototype.SetBooleanValue = function (key_, is_true)
	{
		this.save_item[key_] = (is_true == 1);
	};
	
    Acts.prototype.Save = function (itemID, tag_)
	{
	    var self = this;
	    
	    // try add new item
	    var on_read_itemID = function (snapshot)
        {
            if (snapshot.val() == null)  // itemID is not in itemID list, add it
            {
                // add itemID to list
                wait_events += 1;
	            self.get_itemID_ref(itemID)["set"](true, isDone_handler);
            }
            else  // itemID is existed
            {
            }
            isDone_handler();
        };
	    // try add new item
	    
	    // wait done
        var wait_events = 0;
        var has_error = false;	    
	    var isDone_handler = function(error)
	    {
	        has_error |= (error != null);
	        wait_events -= 1;
	        if (wait_events == 0)
	        {	            
	            // all jobs done
			    var trig = (!has_error)? cr.plugins_.Rex_Firebase_ItemFilter.prototype.cnds.OnSaveComplete:
				                         cr.plugins_.Rex_Firebase_ItemFilter.prototype.cnds.OnSaveError;
                self.trig_tag = tag_;	
                self.exp_CurItemID = itemID;	                         
				self.runtime.trigger(trig, self); 	   
				self.trig_tag = null;
				self.exp_CurItemID = "";	  
	        }
	    };
	    // wait done
	    
	    // try add new itemID into itemID list
	    wait_events += 1;
	    // check if itemID is in itemID list
	    this.get_itemID_ref(itemID)["once"]("value", on_read_itemID);	
	    for (var k in this.save_item)
	    {	        
	        // add key-value
	        wait_events += 1;
	        this.get_key_ref(itemID, k)["set"](this.save_item[k], isDone_handler);
	        wait_events += 1;
	        this.get_keyIndex_ref()["child"](k)["set"](true, isDone_handler);
	    }
		clean_table(this.save_item);	
	};
	
    Acts.prototype.Remove = function (itemID, tag_)
	{
	    var self = this;
	    
	    // try remove itemID
	    var on_read_itemID = function (snapshot)
        {
            if (snapshot.val() == null)  // itemID is not in itemID list
            {
            }
            else  // itemID is existed, try remove it
            {
                // remove itemID from list
                wait_events += 1;
	            self.get_itemID_ref(itemID)["remove"](isDone_handler);
                // read keys list
                wait_events += 1; 
                self.get_keyIndex_ref()["once"]("value", on_read_keylist);
            }           
            isDone_handler();
        };
	    // try remove itemID
	    
	    // remove keys
	    var on_read_keylist = function (snapshot)
        {   
            var keys = snapshot.val();
            if (keys != null)
            {
                for(var k in keys)
                {
                    wait_events += 1;
	                self.get_key_ref(itemID, k)["remove"](isDone_handler);
                }                
            }
            isDone_handler();
        };
	    // remove keys
	    
	    // wait done
        var wait_events = 0;
        var has_error = false;	    
	    var isDone_handler = function(error)
	    {
	        has_error |= (error != null);
	        wait_events -= 1;
	        if (wait_events == 0)
	        {	            
	            // all jobs done
			    var trig = (!has_error)? cr.plugins_.Rex_Firebase_ItemFilter.prototype.cnds.OnRemoveComplete:
				                         cr.plugins_.Rex_Firebase_ItemFilter.prototype.cnds.OnRemoveError;
                self.trig_tag = tag_;
                self.exp_CurItemID = itemID;				                         
				self.runtime.trigger(trig, self); 	   
				self.trig_tag = null;    
				self.exp_CurItemID = "";     
	        }
	    };
	    // wait done	    
	    	    
	    // try remove itemID from itemID list
	    wait_events += 1;
	    // check if itemID is in itemID list
	    this.get_itemID_ref(itemID)["once"]("value", on_read_itemID);	    
	};

    Acts.prototype.GetRandomItems = function (pick_count, tag_)
	{	    
	    clean_table(this.request_itemIDs);
	    
	    var self = this;
	    var on_read_itemIDs = function (snapshot)
        {
            var arr_itemIDs = [];
            var itemIDs = snapshot.val();
            if (itemIDs == null)
            {
                // pick none
            }
            else
            {
                retrieve_itemIDs(itemIDs, arr_itemIDs);
                var cnt = arr_itemIDs.length;
                
                if (cnt <= pick_count)
                {
                    var i;
                    for (i=0; i<cnt; i++)
                        self.request_itemIDs[arr_itemIDs[i]] = true; 
                }
                else if ((pick_count/cnt) < 0.5)
                {
                    // random number picking
                    var i, rv, try_pick, itemID;
                    for (i=0; i<pick_count; i++)
                    {
                        try_pick = true;
                        while (try_pick)
                        {
                            rv = Math.floor(Math.random() * cnt);
                            itemID = arr_itemIDs[rv];
                            if (!self.request_itemIDs.hasOwnProperty(itemID))
                            {
                                self.request_itemIDs[itemID] = true;
                                try_pick = false;
                            }
                        }
                    }
                }
                else
                {
                    // shuffle index array picking
                    _shuffle(arr_itemIDs);
                    arr_itemIDs.length = pick_count;
                    var i;
                    for (i=0; i<pick_count; i++)
                        self.request_itemIDs[arr_itemIDs[i]] = true; 
                }
            } // pick random 

            self.trig_tag = tag_;		            
		    self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemFilter.prototype.cnds.OnRequestComplete, self); 	   
			self.trig_tag = null;     
        };
	

		this.get_ref("itemIDs")["once"]("value", on_read_itemIDs);
	};	
	
	var _shuffle = function (arr, random_gen)
	{
        var i = arr.length, j, temp, random_value;
        if ( i == 0 ) return;
        while ( --i ) 
        {
		    random_value = (random_gen == null)?
			               Math.random(): random_gen.random();
            j = Math.floor( random_value * (i+1) );
            temp = arr[i]; 
            arr[i] = arr[j]; 
            arr[j] = temp;
        }
    };		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.CurItemID = function (ret)
	{
		ret.set_string(this.exp_CurItemID);
	};
    
	Exps.prototype.ItemIDToJSON = function (ret)
	{
		ret.set_string(JSON.stringify(this.request_itemIDs));
	};	
}());