/*
# for random picking
itemIDs\
    <itemID>: true
    
# for condition picking    
filters\
    <keys>
        <itemID>: <value>

# for remove itemID
itemID-keys\
    <itemID>\
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
	        
	    var path;
	    if (k.substring(4) == "http")
	        path = k;
	    else
	        path = this.rootpath + k + "/";
	        
        return new window["Firebase"](path);
	};
	
	instanceProto.get_key_ref = function(itemID, key_)
	{
        return this.get_ref("filters")["child"](key_)["child"](itemID);
	};
	
	instanceProto.get_itemID2Keys_ref = function(itemID)
	{
        return this.get_ref("itemID-keys")["child"](itemID);
	};
	
	instanceProto.get_itemID_ref = function(itemID)
	{
        return this.get_ref("itemIDs")["child"](itemID);
	};
    
    instanceProto.get_Equal_codeString = function (key_, value_)
	{
        key_ = string_quote(key_);
        value_ = string_quote(value_);
        var code_string = 'filter.Query("Equal",'+key_+","+value_+")";
        return code_string;
	};
    
    instanceProto.get_GreaterEqual_codeString = function (key_, value_)
	{
        key_ = string_quote(key_);
        value_ = string_quote(value_);
        var code_string = 'filter.Query("GreaterEqual",'+key_+","+value_+")";
        return code_string;
	};
    
    instanceProto.get_LessEqual_codeString = function (key_, value_)
	{
        key_ = string_quote(key_);
        value_ = string_quote(value_);
        var code_string = 'filter.Query("LessEqual",'+key_+","+value_+")";
		return code_string;
	};    
    
    instanceProto.get_InRange_codeString = function (key_, start_, end_)
	{
        key_ = string_quote(key_);
        start_ = string_quote(start_);
        end_ = string_quote(end_);
        var code_string = 'filter.Query("InRange",'+key_+","+start_+","+end_+")";
		return code_string;
	};  

    var ARGS_COPY = [];    
    instanceProto.get_OR_codeString = function ()
	{
        array_copy(ARGS_COPY, arguments);
        var code_string = 'filter.AddSETOP("OR",'+ARGS_COPY.join(",")+")";
		return code_string;
	};     
    
    instanceProto.get_AND_codeString = function ()
	{
        array_copy(ARGS_COPY, arguments);
        var code_string = 'filter.AddSETOP("AND",'+ARGS_COPY.join(",")+")";
		return code_string;
	};    
    
    instanceProto.get_SUB_codeString = function ()
	{
        array_copy(ARGS_COPY, arguments);
        var code_string = 'filter.AddSETOP("SUB",'+ARGS_COPY.join(",")+")";
		return code_string;
	};    
    
    instanceProto.get_SUBVALUE_codeString = function ()
	{
        array_copy(ARGS_COPY, arguments);
        var code_string = 'filter.AddSETOP("SUB_VALUE",'+ARGS_COPY.join(",")+")";
		return code_string;
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
    
    var string_quote = function(v)
    {
        var s;
        if (typeof (v) == "string")
            s = '"'+v+'"';
        else // number
            s = v.toString();
        return s
    }; 

    var array_copy = function (arr_out, arr_in, start_index)
    {
        if (start_index == null)
            start_index = 0
            
        var i, cnt=arr_in.length;
        arr_out.length = cnt - start_index;        
        for(i=start_index; i<cnt; i++)
            arr_out[i-start_index] = arr_in[i];
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
	    
	    // add itemID into itemID list
	    wait_events += 1;
	    this.get_itemID_ref(itemID)["set"](true, isDone_handler);
	    // add key-value pairs		 
	    var item_value, is_remove;   
	    for (var k in this.save_item)
	    {
	        item_value = this.save_item[k];
	        wait_events += 1;
	        this.get_key_ref(itemID, k)["setWithPriority"](item_value, item_value, isDone_handler);
	        wait_events += 1;
	        is_remove = (item_value === null);
	        this.get_itemID2Keys_ref(itemID)["child"](k)["set"]((is_remove)? null:true, isDone_handler);
	    }
		clean_table(this.save_item);	
	};
	
    Acts.prototype.Remove = function (itemID, tag_)
	{
	    var self = this;
	    
	    // try remove itemID
	    var on_read_keys = function (snapshot)
        {
            var keys = snapshot.val();
            if (keys == null)  // itemID is not existed
            {
            }
            else  // itemID is existed, get keys
            {
                // remove itemID from list
                wait_events += 1;
	            self.get_itemID_ref(itemID)["remove"](isDone_handler);
                // remove itemID-key
                wait_events += 1;
	            self.get_itemID2Keys_ref(itemID)["remove"](isDone_handler);
	            
	            // remove keys from filters
	            for(var k in keys)
	            {
                    wait_events += 1; 
                    self.get_key_ref(itemID, k)["remove"](isDone_handler);
                }
            }           
            isDone_handler();
        };
	    // try remove itemID	    
	    
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
	    	    
	    // read itemID-keys
	    wait_events += 1;
	    this.get_itemID2Keys_ref(itemID)["once"]("value", on_read_keys);   
	};

    Acts.prototype.RemoveKey = function (key_)
	{
		this.save_item[key_] = null;
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

    Acts.prototype.GetItemsByCondition = function (condition_expression, tag_)
	{  
        var filter = new cr.plugins_.Rex_Firebase_ItemFilter.FilterKlass(this);      
        var self=this;
        var on_complete = function(result)
        {
            clean_table(self.request_itemIDs);
            for (var k in result)
                self.request_itemIDs[k] = true;
            self.trig_tag = tag_;		            
		    self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemFilter.prototype.cnds.OnRequestComplete, self); 	   
			self.trig_tag = null;
        }

        filter.DoRequest(condition_expression, on_complete);
	};
	
	var LIMITTYPE = ["limitToFirst", "limitToLast"];
    Acts.prototype.GetItemsBySingleConditionInRange = function (key_, start, end, limit_type, limit_count, tag_)
	{  
	    clean_table(this.request_itemIDs);
	    
	    var self = this;
        var read_item = function(childSnapshot)
        {
            var k = childSnapshot["key"]();
            var v = childSnapshot["val"]();
            self.request_itemIDs[k] = v;
        };     
        var on_read_itemIDs = function (snapshot)
        {
            snapshot["forEach"](read_item);
            
            self.trig_tag = tag_;		            
		    self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemFilter.prototype.cnds.OnRequestComplete, self); 	   
			self.trig_tag = null;
        };	    
        	    
	    var query = this.get_ref("filters")["child"](key_);
        query = query["orderByPriority"]();
	    query = query["startAt"](start)["endAt"](end);
	    query = query[LIMITTYPE[limit_type]](limit_count);
	    query["once"]("value", on_read_itemIDs);
	};	
	
	var COMPARSION_TYPE = ["equalTo", "startAt", "endAt", "startAt", "endAt"];
    Acts.prototype.GetItemsBySingleCondition = function (key_, comparsion_type, value_, limit_type, limit_count, tag_)
	{  
	    var is_exclusive = (comparsion_type == 3) || (comparsion_type == 4);
	    var current_item_count=0, last_key = "";
	    
	    clean_table(this.request_itemIDs);
	    
	    var self = this;
        var read_item = function(childSnapshot)
        {
            var k = childSnapshot["key"]();               
            var v = childSnapshot["val"]();
            
            self.request_itemIDs[k] = v;
            current_item_count += 1;
        };     
        var on_read_itemIDs = function (snapshot)
        {
            snapshot["forEach"](read_item);
            
            self.trig_tag = tag_;		            
		    self.runtime.trigger(cr.plugins_.Rex_Firebase_ItemFilter.prototype.cnds.OnRequestComplete, self); 	   
			self.trig_tag = null;
        };	    
        	    
	    var query = this.get_ref("filters")["child"](key_);	  
        query = query["orderByPriority"]();        
	    query = query[COMPARSION_TYPE[comparsion_type]](value_);	    
	    query = query[LIMITTYPE[limit_type]](limit_count);
	    query["once"]("value", on_read_itemIDs);
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

    Exps.prototype.Equal = function (ret, key_, value_)
	{
        var code_string;
        if (arguments.length == 3)
        {        
		    code_string = this.get_Equal_codeString(key_, value_);
        }
        else
        {
            var equals = [];
            var i, cnt=arguments.length;
            for (i=2; i<cnt; i++)
            {
                equals.push(this.get_Equal_codeString(key_, arguments[i]));
            }
            code_string = this.get_OR_codeString.apply(this, equals);
        }
        ret.set_string(code_string);
	};
    
    Exps.prototype.GreaterEqual = function (ret, key_, value_)
	{
        ret.set_string(this.get_GreaterEqual_codeString(key_, value_));
	};
    
    Exps.prototype.LessEqual = function (ret, key_, value_)
	{
        ret.set_string(this.get_LessEqual_codeString(key_, value_));
	};    
    
    Exps.prototype.InRange = function (ret, key_, start_, end_)
	{
        ret.set_string(this.get_InRange_codeString(key_, start_, end_));
	};    

    Exps.prototype.Greater = function (ret, key_, value_)
	{
        var query_code_string = this.get_GreaterEqual_codeString(key_, value_);
        var code_string = this.get_SUBVALUE_codeString(query_code_string, value_);
        ret.set_string(code_string);
	};
    
    Exps.prototype.Less = function (ret, key_, value_)
	{
        var query_code_string = this.get_LessEqual_codeString(key_, value_);
        var code_string = this.get_SUBVALUE_codeString(query_code_string, value_);
        ret.set_string(code_string);
	};       
    
    Exps.prototype.OR = function (ret)
	{
        array_copy(ARGS_COPY, arguments, 1);
        var code_string = this.get_OR_codeString.apply(this, ARGS_COPY);
		ret.set_string(code_string);
	};     
    
    Exps.prototype.AND = function (ret)
	{
        array_copy(ARGS_COPY, arguments, 1);
        var code_string = this.get_AND_codeString.apply(this, ARGS_COPY);
		ret.set_string(code_string);
	};    
    
    Exps.prototype.SUB = function (ret)
	{
        array_copy(ARGS_COPY, arguments, 1);
        var code_string = this.get_SUB_codeString.apply(this, ARGS_COPY);
		ret.set_string(code_string);
	};     
}());


(function ()
{
    var FilterKlass = function(plugin)
    {
        this.plugin = plugin;
        
        this.wait_events = 0;
        this.on_complete = null;
        this.current_groupUid = 0;
        this.groups = {};
        this.set_expression = "";
    };
    var FilterKlassProto = FilterKlass.prototype;
    
	FilterKlassProto.isDone_test = function(on_complete)
	{    
	    this.wait_events -= 1;
        if (this.wait_events > 0)
            return;
            
        // all jobs done 
        var result_group = this.DoSetOperation(this.set_expression);        
              
	    if (on_complete != null)	        
			on_complete(result_group);	    
	};  

    FilterKlassProto.NewGroupUID = function()
    {
        var current_group_uid = this.current_groupUid.toString();
        this.groups[current_group_uid] = {};
        this.current_groupUid += 1;
        return current_group_uid;
    };
    
    // picking cnditions
    // export
    FilterKlassProto["Query"] = function (query_typeName, key_, value0, value1)
    {
        // read handler
        var current_group_uid = this.NewGroupUID();
        var read_result = this.groups[current_group_uid];
        
        var self = this;
        var read_item = function(childSnapshot)
        {
            var k = childSnapshot["key"]();
            var v = childSnapshot["val"]();
            read_result[k] = v;
        };     
        var on_read = function (snapshot)
        {
            snapshot["forEach"](read_item);
            self.isDone_test(self.on_complete);
        };
        
        // create query
        this.wait_events += 1;
        var query = this.plugin.get_ref("filters")["child"](key_);        
        query = query["orderByPriority"]();
        query = this[query_typeName](query, value0, value1);
        query["once"]("value", on_read);
        
        var code_string = '(filter.groups["'+current_group_uid+'"])';
        return code_string;
    };
    // export 
    
    FilterKlassProto["Equal"] = function (query, value_)
    {
        return query["equalTo"](value_);
    };
    FilterKlassProto["GreaterEqual"] = function (query, value_)
    {
        return query["startAt"](value_);
    };  
    FilterKlassProto["LessEqual"] = function (query, value_)
    {
        return query["endAt"](value_);
    };    
    FilterKlassProto["InRange"] = function (query, value0, value1)
    {
        return query["startAt"](value0)["endAt"](value1);
    };     
    // picking cnditions
    
    // set operations    
    // export    
    var params = [];
    FilterKlassProto["AddSETOP"] = function (operation_name)
    {
        var i,cnt=arguments.length;
        for (i=1; i<cnt; i++)
            params.push(arguments[i]);
        operation_name = '"'+operation_name+'"';
        // TODO
        var code_string = 'filter["SET"]('+operation_name+","+params.join(",")+")";
        return code_string;
    };
    // export     
    
    FilterKlassProto["SET"] = function (operation_name)
    {   
        // arguments are group_uids
        var i, cnt=arguments.length;
        var groupA=arguments[1], groupB;
        var itemID;
        
        for (i=2; i<cnt; i++)
        {
            groupB = arguments[i];
            this[operation_name](groupA, groupB);
        }
        return groupA;        
    };
    FilterKlassProto["OR"] = function (setA, setB)
    {
        var k;
        for (k in setB)
            setA[k] = true;      
    };
    FilterKlassProto["AND"] = function (setA, setB)
    {
        var k;
        for (k in setA)
        {
            if (!setB.hasOwnProperty(k))
                delete setA[k];
        }   
    };    
    FilterKlassProto["SUB"] = function (setA, setB)
    {
        var k;
        for (k in setB)
        {
            if (setA.hasOwnProperty(k))
                delete setA[k];
        }   
    };     
    FilterKlassProto["SUB_VALUE"] = function (setA, value_)
    {
        var k;
        for (k in setA)
        {
            if (setA[k] == value_)
                delete setA[k];
        }   
    };     
    // set operations
    
    // code string to handler
    FilterKlassProto.DoRequest = function (condition_expression, on_complete)
    {
        this.current_groupUid = 0;
        this.wait_events = 0;
        
        this.on_complete = on_complete;      
        var code_string = "function(filter){\n return "+condition_expression +";\n}";
        var request;        
        try
        {
            request = eval("("+code_string+")");
        }
        catch(err)
        {
            request = null;
        }
        this.set_expression = request(this);
    };
    
    FilterKlassProto.DoSetOperation = function (set_expression)
    {
        var code_string = "function(filter){\n return "+set_expression +";\n}";
        var handler;
        try
        {
            handler = eval("("+code_string+")");
        }
        catch(err)
        {
            handler = null;
        }
        var result_groupUid = handler(this); 
        return result_groupUid;   
    };
    // code string to handler    
    
    cr.plugins_.Rex_Firebase_ItemFilter.FilterKlass = FilterKlass;
}());