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
        
        this.prepared_item = {};
        this.request_itemIDs = {};
           
        this.trig_tag = null;            
        this.exp_CurItemID = "";
	};
	
	instanceProto.onDestroy = function ()
	{		
        this.prepared_item = {};
        this.request_itemIDs = {};
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
    
	var get_key_path = function(itemID, key_)
	{
	    return "filters/" + key_ + "/" + itemID;
	};	    
	
	instanceProto.get_itemID2Keys_ref = function(itemID, key_)
	{
	    var ref = this.get_ref("itemID-keys")["child"](itemID);
	    if (!key_)
	        ref = ref["child"](key_);
        return ref;
	};
	
	var get_itemID2Keys_path = function(itemID, key_)
	{
	    var p = "itemID-keys/" + itemID;
		if (key_)
		    p += "/" + key_;
        return p;
	};	
	
	instanceProto.get_itemID_ref = function(itemID)
	{
        return this.get_ref("itemIDs")["child"](itemID);
	};
	
	var get_itemID_path = function(itemID)
	{
	    return "itemIDs/" + itemID;
	};
	
	instanceProto.create_save_item = function (itemID, item_)
	{
	    var save_item = {};
        save_item[ get_itemID_path(itemID) ] = true;
	    var k, v;   
	    for (k in item_)
	    {
	        v = item_[k];
	        save_item[ get_key_path(itemID, k) ] = v;
	        save_item[ get_itemID2Keys_path(itemID, k) ] = (v === null)? null : true;
	    }	    
	    return save_item;
	};
	
	instanceProto.create_remove_item = function (itemID, keys)
	{
        var remove_item = {};
        // remove itemID from list
        remove_item[ get_itemID_path(itemID) ] = null;
        // remove itemID-key
        remove_item[ get_itemID2Keys_path(itemID, k) ] = null;
                        
	    // remove keys from filters
	    var k;
	    for(k in keys)
	    {
	        remove_item[ get_key_path(itemID, k) ] = null;
        }
	    return remove_item;
	};
	
    instanceProto.save_item = function (itemID, item_, tag_)
	{	
	    var self = this;	    
	    var onComplete_handler = function(error)
	    {
	        if (!tag_)
	            return;
	            
		    var trig = (!error)? cr.plugins_.Rex_Firebase_ItemFilter.prototype.cnds.OnSaveComplete:
		                         cr.plugins_.Rex_Firebase_ItemFilter.prototype.cnds.OnSaveError;
            self.trig_tag = tag_;	
            self.exp_CurItemID = itemID;	                         
		    self.runtime.trigger(trig, self); 	   
		    self.trig_tag = null;
		    self.exp_CurItemID = "";
	    };


	    // multi-location update
	    var write_item = this.create_save_item(itemID, item_);    	     
		this.get_ref()["update"](write_item, onComplete_handler);
	    // multi-location update
	};
	
    instanceProto.remove_item = function (itemID, tag_)
	{
	    var self = this;
	    
	    // try remove itemID
	    var on_read_keys = function (snapshot)
        {
            var keys = snapshot.val();
            if (keys == null)  // itemID is not existed
            {
                onComplete_handler(true);
            }
            else  // itemID is existed, get keys
            {
                var items = self.create_remove_item(itemID, keys);
                self.get_ref()["update"](items, onComplete_handler);
                
            }
        };
	    // try remove itemID	    
	    
	    var onComplete_handler = function(error)
	    {
	        if (!tag_)
	            return;
	            	        
		    var trig = (!error)? cr.plugins_.Rex_Firebase_ItemFilter.prototype.cnds.OnRemoveComplete:
		                         cr.plugins_.Rex_Firebase_ItemFilter.prototype.cnds.OnRemoveError;
            self.trig_tag = tag_;
            self.exp_CurItemID = itemID;				                         
		    self.runtime.trigger(trig, self); 	   
		    self.trig_tag = null;    
		    self.exp_CurItemID = "";   
	    };  
	    	    
	    // read itemID-keys
	    this.get_itemID2Keys_ref(itemID)["once"]("value", on_read_keys);   
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

    Acts.prototype.SetDomainRef = function (domain_ref, sub_domain_ref)
	{
		this.rootpath = domain_ref + "/" + sub_domain_ref + "/";
	};
		
    Acts.prototype.SetValue = function (key_, value_)
	{
		this.prepared_item[key_] = value_;
	};
	
    Acts.prototype.SetBooleanValue = function (key_, is_true)
	{
		this.prepared_item[key_] = (is_true === 1);
	};
	
    Acts.prototype.Save = function (itemID, tag_)
	{	
	    this.save_item(itemID, this.prepared_item, tag_);
        this.prepared_item = {};
	};
	
    Acts.prototype.Remove = function (itemID, tag_)
	{
	    this.remove_item(itemID, tag_);
	};

    Acts.prototype.RemoveKey = function (key_)
	{
		this.prepared_item[key_] = null;
	};
	
    Acts.prototype.GetRandomItems = function (pick_count, tag_)
	{	    
        this.request_itemIDs = {};
	    
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
        var filter = new FilterKlass(this);      
        var self=this;
        var on_complete = function(result)
        {
            self.request_itemIDs = {};
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
	    this.request_itemIDs = {};
	    
	    var self = this;
        var read_item = function(childSnapshot)
        {
            var k = get_key(childSnapshot);
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
        query = query["orderByValue"]();
	    query = query["startAt"](start)["endAt"](end);
	    query = query[LIMITTYPE[limit_type]](limit_count);
	    query["once"]("value", on_read_itemIDs);
	};	
	
	var COMPARSION_TYPE = ["equalTo", "startAt", "endAt", "startAt", "endAt"];
    Acts.prototype.GetItemsBySingleCondition = function (key_, comparsion_type, value_, limit_type, limit_count, tag_)
	{  
	    var is_exclusive = (comparsion_type == 3) || (comparsion_type == 4);
	    var current_item_count=0, last_key = "";
	    
	    this.request_itemIDs = {};
	    
	    var self = this;
        var read_item = function(childSnapshot)
        {
            var k = get_key(childSnapshot);               
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
        query = query["orderByValue"]();        
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

    
    // ---------------------------------------------------------------------
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
            var k = get_key(childSnapshot);
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
        query = query["orderByValue"]();
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
    
}());