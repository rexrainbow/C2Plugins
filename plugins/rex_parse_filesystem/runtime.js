/*
<itemID>
    parentID - itemID of parent
    name - folder name or file (link) name
    ext - extend name of file (link)
    type - -1: file link, -2: folder, 0~N: file content
    content - description of folder, or file link. Or slices of file content
*/

/*
Command list
pwd - print name of working directory  
cd - change the directory
mkdir - make directories
ls - list directory contents
edit - update file
cat
rm
rmdir
*/

// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Parse_filesystem = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Parse_filesystem.prototype;
		
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
	    jsfile_load("parse-1.5.0.min.js");
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
	    if ((!window.RexC2IsParseInit) && (this.properties[0] !== ""))
	    {
	        window["Parse"]["initialize"](this.properties[0], this.properties[1]);
	        window.RexC2IsParseInit = true;
	    }
        
	    if (!this.recycled)
	    {	    
	        this.item_klass = window["Parse"].Object["extend"](this.properties[2]);
	    }	        
        
        this.response_enable = (this.properties[3] === 1);
        
        this.nodeNames = ["root"];
        this.nodeIDs = [""];
        this.exp_LastRespondedMessage = ""; 
	};
    
    var TYPE_FOLDER = 1;
    var TYPE_FILELINK = 2;
    var TYPE_FILECONTENT = 4;
	instanceProto.get_base_query = function(parentID, type_, name_, ext_)
	{ 
	    var query = new window["Parse"]["Query"](this.item_klass);
	    
	    if (parentID != null)
	        query["equalTo"]("parentID", parentID);

	    if (type_ != null)
        {
            switch (type_)
            {
            case (TYPE_FOLDER & TYPE_FILELINK): 
                query["containedIn"]("type", [-1, -2] );
                break;
            
            case TYPE_FOLDER:
                query["equalTo"]("type", -2);  
                break;
                
            case TYPE_FILELINK:
                query["equalTo"]("type", -1);  
                break;              

            case TYPE_FILECONTENT:
                query["greaterThanOrEqualTo"]("type", 0);
                break;                   
            }
        }            
            
	    if (name_ != null)
	        query["equalTo"]("name", name_);
            
	    if (ext_ != null)
	        query["equalTo"]("ext", ext_);      
            

	        	                
	    return query;
	};
	
	instanceProto.fill_item = function(itemObj, parentID, name_, ext_, type_, content_)
	{ 
	    itemObj["set"]("parentID", parentID);
	    itemObj["set"]("name", name_);
	    itemObj["set"]("ext", ext_);	
	    itemObj["set"]("type", type_);	 
	    itemObj["set"]("content", content_);		           
	};	
    
	instanceProto.response = function(message)
	{
        if (!this.response_enable)
            return;
            
        this.exp_LastRespondedMessage = message;
	    this.runtime.trigger(cr.plugins_.Rex_Parse_filesystem.prototype.cnds.OnCommandResponded, this);		           
	};    

	instanceProto.get_current_working_path = function()
	{
        return this.nodeNames.join("/") + "/";
	};
    
	instanceProto.get_baseName = function(filename)
	{
        var base;
        if (filename.lastIndexOf(".") === -1) 
            base = filename;
        else
            base = filename.substring(0, filename.lastIndexOf("."));
        return base;
	};    

	instanceProto.get_extName = function(filename)
	{
        return filename.split('.').pop();
	};
    
    var byteCount = function (s) { return encodeURI(s).split(/%..|./).length - 1; }
	
	var MAXSIZE = 1024*128;
	var RESULT = [];
    var _char2BytesArr = [];
	var get_part_values = function (value_)
	{
	    RESULT.length = 0;
	    var i, cnt=value_.length;        
        _char2BytesArr.length = cnt;  
        for (i=0; i<=cnt; i++)
        {
            _char2BytesArr[i] = byteCount(value_.charAt(i));
        }
        
	    var start=0, l=0;
	    for (i=0; i<=cnt; i++)
	    {
            l += _char2BytesArr[i];
            if (l > MAXSIZE)
            {
                RESULT.push(value_.substring(start, i));
                start = i;
                l = _char2BytesArr[i];
            }
	    }
        
        if (start != cnt)
            RESULT.push(value_.substring(start, cnt));
	    
        _char2BytesArr.length = 0;
	    return RESULT;
	};    
	
	// command handler
	instanceProto["execute"] = function(input_)
	{ 
	    var args = input_.match(/\S+/g);
        var cmd = args.shift();
        var handler = this[cmd];
        if (handler)
            handler.apply(this, args);       
	};
    
	instanceProto["pwd"] = function()
	{ 
        this.response( this.get_current_working_path() );
	};	
	instanceProto["cd"] = function(name_)
	{ 
	    var self = this;
        // error
        var on_any_error = function(error)
	    {
            self.response( error["message"] );
	    };

        //        
	    var on_read_success = function(item_obj)
	    {
	        if (item_obj != null)
	        {
                self.nodeNames.push(name_);
                self.nodeIDs.push(item_obj["id"]);
                
                self["pwd"]();
	        }
	        else
	        {
                self.response( name_+": No such file or directory." );
            }
	    };	    

	    var read_handler = {"success":on_read_success, "error": on_any_error};		
        var lastNodeID = this.nodeIDs[ this.nodeIDs.length - 1 ];
	    this.get_base_query(lastNodeID, TYPE_FOLDER, name_)["first"](read_handler);
	};
	
	instanceProto["mkdir"] = function(name_, description_)
	{ 
	    var parentID = this.nodeIDs[ this.nodeIDs.length - 1 ];
	    var self = this;    
        
        // error
        var on_any_error = function(error)
	    {
            self.response( error["message"] );
	    };
        
        //        
	    var on_write_success = function(item_obj)
	    {
            self.response( "create folder `"+name_+"'" );              
	    };	        	    
	    var write_handler = {"success":on_write_success, "error": on_any_error};	
	    var create_folder = function (parentID, name_, description_)
	    {
	        var item_obj = new self.item_klass();
	        self.fill_item(item_obj, parentID, name_, "", -2, description_);
	        item_obj["save"](null, write_handler);
	    };
	    // 
	    var on_read_success = function(item_obj)
	    {
	        if (item_obj != null)
	        { 
                self.response( "mkdir: cannot create directory `"+name_+"': File exists" );  
	        }
	        else
	        {
	            create_folder(parentID, name_, description_);
            }
	              
	    };	    
	    var read_handler = {"success":on_read_success, "error": on_any_error};		
	    this.get_base_query(parentID, (TYPE_FOLDER & TYPE_FILELINK), name_, "")["first"](read_handler);
	};

	instanceProto["ls"] = function()
	{ 
	    var parentID = this.nodeIDs[ this.nodeIDs.length - 1 ];
	    var self = this; 

        // error
        var on_any_error = function(error)
	    {
            self.response( error["message"] );
	    };

        //        
        var response_list = function (item_objs)
        {
	        var l = "";
	        var i, cnt= item_objs.length, item;
            var folder_num = 0, file_num = 0;
	        for(i=0; i<cnt; i++)
	        {
                item = item_objs[i];
                if (item["get"]("type") === -2)
                {
                    l += item["get"]("name") + "/" + "\n";
                    folder_num ++;
                }
                else
                {
                    l += item["get"]("name")  + "." + item["get"]("ext") + "\n";
                    file_num ++;
                }
            }

            l += folder_num + " folder(s), " + file_num + " file(s).";
	        self.response( l );
        };
	        	    	        
	    // step 2    	    	    
	    var on_read_all = function(item_objs)
	    {
            if (self.response_enable)
                response_list(item_objs);
	    };	    
	    
	    // step 1
        var on_read_handler = {"success":on_read_all, "error": on_any_error};  
	    var query = this.get_base_query(parentID, (TYPE_FOLDER & TYPE_FILELINK))["ascending"]("-type,name");
	    window.ParseQuery(query, on_read_handler);	
	};	    

	instanceProto["edit"] = function(name_, content_, description_)
	{ 
        var base = this.get_baseName(name_);
        var ext = this.get_extName(name_);
	    var folderID = this.nodeIDs[ this.nodeIDs.length - 1 ];
        
	    var self = this;

        // error
        var on_any_error = function(error)
	    {
            self.response( error["message"] );
	    };
        
        // step4. save file content
	    var On_write_fileContent_success = function()
	    {
            self.response( "Write file "+ name_ + " success.");
	    };	        
        var save_fileContent = function ()
        {
            var partValues = get_part_values(content_ || "");
	        var i, cnt=partValues.length, item_objs=[];
	        for(i=0; i<cnt; i++)
	        {
	            var item_obj = new self.item_klass();
                self.fill_item(item_obj, folderID, base, ext, i, partValues[i]);
	            item_objs.push(item_obj);
	        }
	        var on_saveAll_handler = {"success":On_write_fileContent_success, "error": on_any_error};		
	        window["Parse"]["Object"]["saveAll"](item_objs, on_saveAll_handler);
	        // done            
        };
        
        // step3. remove file content
        var remove_fileContent = function(parentID_, base_, ext_)
        {
            var item_query = self.get_base_query(parentID_, TYPE_FILECONTENT, base, ext);
	        var remove_handler = {"success":save_fileContent, "error": on_any_error};		
	        window.ParseRemoveAllItems(item_query, remove_handler);        
        };

        // step2. save file link
	    var on_write_fileLink_success = function(item_obj)
	    {
            remove_fileContent(folderID, base, ext);
	    };	
         	    
        // step1. read file link
	    var on_read_fileLink_success = function(item_obj)
	    {
	        if (item_obj == null)
	            item_obj = new self.item_klass();
                
	        self.fill_item(item_obj, folderID, base, ext, -1, description_);
            var update_fileLink_handler = {"success":on_write_fileLink_success, "error": on_any_error};	            
	        item_obj["save"](null, update_fileLink_handler);   
	    };	    

	    var read_fileLink_handler = {"success":on_read_fileLink_success, "error": on_any_error};
        var query = this.get_base_query(folderID, TYPE_FILELINK, base, ext);
	    query["first"](read_fileLink_handler);
	};    
    
	instanceProto["cat"] = function(name_)
	{ 
        var base = this.get_baseName(name_);
        var ext = this.get_extName(name_);
	    var folderID = this.nodeIDs[ this.nodeIDs.length - 1 ];

	    var self = this;

        // error
        var on_any_error = function(error)
	    {
            self.response( error["message"] );
	    };	
        
        // 
        var response_content = function (value_)
        {
            self.response( value_ );
        };
         	    
        // step1. read file link
	    var on_read_fileContent_success = function(item_objs)
	    {
	        var value_ = "";
	        var i, cnt= item_objs.length;
	        for(i=0; i<cnt; i++)
	            value_ += item_objs[i]["get"]("content");

	        response_content(value_);
	    };	    

	    var read_fileContent_handler = {"success":on_read_fileContent_success, "error": on_any_error};
        var query = this.get_base_query(folderID, TYPE_FILECONTENT, base, ext)["ascending"]("type")["select"]("content");
	    window.ParseQuery(query, read_fileContent_handler);	   
	};     
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	
	Cnds.prototype.OnCommandResponded = function ()
	{
        return true;
	}; 
       
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.RunCommand = function (cmd_)
	{
        this["execute"](cmd_);
	};
 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.LastRespondedMessage = function (ret)
	{
		ret.set_string( this.exp_LastRespondedMessage );
	};
}());


(function ()
{
    if (window.ParseQuery != null)
        return;  
        
   var request = function (query, handler, start, lines)
   {	   	          
	    if (start==null)
	        start = 0;
        
        var all_items = [];            
	    var is_onePage = (lines != null) && (lines <= 1000);
	    var linesInPage = (is_onePage)? lines:1000;
	                                       	    
        var self = this;       
	    var on_success = function(items)
	    {
	        all_items.push.apply(all_items, items);
	        var is_last_page = (items.length < linesInPage);   
	        	        
	        if ((!is_onePage) && (!is_last_page))  // try next page
	        {               
	            start += linesInPage;
	            query_page(start);
	        }
	        else  // finish
	        {
                handler["success"](all_items);            
	        }
	    };
	     
	    var read_page_handler = {"success":on_success, "error": handler["error"]};	 	    
	    var query_page = function (start_)
	    {
	        // get 1000 lines for each request until get null or get userID	       
            query["skip"](start_);
            query["limit"](linesInPage);
            query["find"](read_page_handler);
        };

	    query_page(start);
	}; 
	
	var remove_all_items = function (query, handler)
    {
        query["select"]("id");    
	    var on_read_all = function(all_items)
	    {
	        if (all_items.length === 0)
	        {
	            handler["success"](all_items);
	            return;
	        }
	        window["Parse"]["Object"]["destroyAll"](all_items, handler); 
	    };	    
	    var on_read_handler = {"success":on_read_all, "error": handler["error"]};  
	    request(query, on_read_handler);
    };
    
    window.ParseQuery = request;
    window.ParseRemoveAllItems = remove_all_items;
}());