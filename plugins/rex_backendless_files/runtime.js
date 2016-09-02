/*
- counter value
*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Backendless_Files = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Backendless_Files.prototype;
		
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
        var self = this;
        var myInit = function()
        {
            self.myInit();
        };
        window.BackendlessAddInitCallback(myInit);
	};
    
	instanceProto.myInit = function()
	{ 
	    if (!this.recycled)
	    {    
            var page_lines = this.properties[0];	    
            this.filesListTable = this.create_filesListTable(page_lines);	
	    }
	    else
	    {
	        this.filesListTable.Reset();
        }
        
        // list
        this.listQuery = [
            "",        // path
            "*.*",   // pattern
            false,   // recursively (include sub-directory)
        ];
        
        this.exp_CurFileIndex = 0;
        this.exp_CurFile = null;
        this.exp_LoopIndex = -1;
        this.last_error = null;        
        this.exp_LastDownloadURL = "";
	};
	
	instanceProto.filesListTable = function ()
	{		
	    this.filesListTable.Reset();    
	};
    

	instanceProto.create_filesListTable = function(page_lines)
	{ 
	    var filesListTable = new window.BackendlessFilePageKlass(page_lines);
	    
	    var self = this;
	    var onReceived = function()
	    {
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_Files.prototype.cnds.OnGetList, self);
	    }
	    filesListTable.onReceived = onReceived;
        
	    var onReceivedError = function(error)
	    {	       
	        self.last_error = error;
	        self.runtime.trigger(cr.plugins_.Rex_Backendless_Files.prototype.cnds.OnGetListError, self);
	    }
	    filesListTable.onReceivedError = onReceivedError;	    
	    
	    var onGetIterItem = function(item, i)
	    {        
	        self.exp_CurFileIndex = i;
	        self.exp_CurFile = item;
	        self.exp_LoopIndex = i - filesListTable.GetStartIndex()
	    };	    	    
	    filesListTable.onGetIterItem = onGetIterItem;
	    
	    return filesListTable;
	};	    

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnUpload = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnUploadError = function ()
	{
	    return true;
	};     
    
	Cnds.prototype.OnRenameError = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnGetList = function ()
	{
	    return true;
	}; 
    
    Cnds.prototype.ForEachFile = function (start, end)
	{	    
	    return this.filesListTable.ForEachItem(this.runtime, start, end);
	};          

	Cnds.prototype.OnRename = function ()
	{
	    return true;
	}; 

	Cnds.prototype.OnGetListError = function ()
	{
	    return true;
	}; 
    
	Cnds.prototype.OnCopy = function ()
	{
	    return true;
	}; 
    
	Cnds.prototype.OnCopyError = function ()
	{
	    return true;
	}; 

	Cnds.prototype.OnMove = function ()
	{
	    return true;
	}; 
    
	Cnds.prototype.OnMoveError = function ()
	{
	    return true;
	};     
	Cnds.prototype.OnDelete = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnDeleteError = function ()
	{
	    return true;
	};     
    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	var getHandler = function(self, successTrig, errorTrig)
	{        
        var cnds = cr.plugins_.Rex_Backendless_Files.prototype.cnds;
        if (successTrig == null)
            successTrig = cnds.OnUpload;
        if (errorTrig == null)
            errorTrig = cnds.OnUploadError;
        
        var on_success = function( result )
        {            
            var path = (typeof(result)==="string")? result:result["fileURL"];
            if (path)
                self.exp_LastDownloadURL = path;
            
            self.runtime.trigger(successTrig, self); 
        };
        var on_error = function( error )
        {
            self.last_error = error;
            self.runtime.trigger(errorTrig, self);
        };
        return new window["Backendless"]["Async"]( on_success, on_error );        
    };
    
    Acts.prototype.UploadFromFileChooser = function (fileChooserObjs, dictPath)
	{
        if (!fileChooserObjs)
            return;
        
        var fc = fileChooserObjs.getFirstPicked();
        if (!fc)
            return;
        
        assert2( fc.elem, "Backendless files: input is not a file chooser object.");
        var files = fc.elem["files"];
        if (!files)
            return;
                
        if (files.length == 0)
            return;
        
        window["Backendless"]["Files"]["upload"]( files, dictPath, true, getHandler(this) );
	}; 
    
    Acts.prototype.UploadFromSprite = function (objType, dictPath, fileName)
	{
        if (!objType)
            return;
        
        var inst = objType.getFirstPicked();
        if (!inst)
            return;
        
        
        // get canvas element
        var canvas;        
        // sprite
        if (inst.curFrame)
        {
            canvas = frame_getCanvas.call(inst.curFrame);
        }
        
        // canvas
        else if (inst.canvas)
        {
            canvas = inst.canvas;
        }

        // canvas to blob
        var self=this;         
        var onGetBlob = function (blob)
        {
            // upload blob
            window["Backendless"]["Files"]["saveFile"]( dictPath, fileName, blob, true, getHandler(self) );            
        };
        canvas["toBlob"](onGetBlob);   
	};     
    
	function frame_getCanvas()
	{
        var tmpcanvas = document.createElement("canvas");
        tmpcanvas.width = this.width;
        tmpcanvas.height = this.height;
        var tmpctx = tmpcanvas.getContext("2d");
        
        if (this.spritesheeted)
        {
        	tmpctx.drawImage(this.texture_img, this.offx, this.offy, this.width, this.height,
        							 0, 0, this.width, this.height);
        }
        else
        {
        	tmpctx.drawImage(this.texture_img, 0, 0, this.width, this.height);
        }
		
		return tmpcanvas;
	};  

    Acts.prototype.UploadDataURI = function (dataURI, dictPath, fileName)
	{
        var obj = dataURItoBlob(dataURI);
        var blob = obj[0];
        // upload blob
        window["Backendless"]["Files"]["saveFile"]( dictPath, fileName, blob, true, getHandler(this) ); 
	};       
    
    /*
    The MIT License (MIT)
    Copyright (c) 2016 David Gomez-Urquiza
    
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    */
    
    function dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        var byteString = atob(dataURI.split(',')[1]);
    
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
        // write the bytes of the string to an ArrayBuffer
        var arrayBuffer = new ArrayBuffer(byteString.length);
        var _ia = new Uint8Array(arrayBuffer);
        for (var i = 0; i < byteString.length; i++) {
            _ia[i] = byteString.charCodeAt(i);
        }
    
        var dataView = new DataView(arrayBuffer);
        var blob = new Blob([dataView], { "type": mimeString });
        return [blob, mimeString];
    };
    
    Acts.prototype.UploadString = function (s, dictPath, fileName)
	{
        var blob = new Blob([s], {"type": 'text/plain'});
        // upload blob
        window["Backendless"]["Files"]["saveFile"]( dictPath, fileName, blob, true, getHandler(this) ); 
	};        
    
    Acts.prototype.List_SetDirectory = function (dictPath, includeSubdirectory)
	{
        this.listQuery[0] = dictPath;        
        this.listQuery[2] = (includeSubdirectory===1);
	};        
    
    Acts.prototype.List_SetPattern = function (pattern)
	{
        this.listQuery[1] = pattern;
	}; 
    
    Acts.prototype.RequestInRange = function (start, lines)
	{
	    this.filesListTable.RequestInRange(this.listQuery, start, lines);
	};

    Acts.prototype.RequestTurnToPage = function (page_index)
	{
	    this.filesListTable.RequestTurnToPage(this.listQuery, page_index);
	};	 
    
    Acts.prototype.RequestUpdateCurrentPage = function ()
	{
	    this.filesListTable.RequestUpdateCurrentPage(this.listQuery);
	};    
    
    Acts.prototype.RequestTurnToNextPage = function ()
	{
	    this.filesListTable.RequestTurnToNextPage(this.listQuery);
	};     
    
    Acts.prototype.RequestTurnToPreviousPage = function ()
	{
	    this.filesListTable.RequestTurnToPreviousPage(this.listQuery);
	};  
    
    Acts.prototype.LoadAllItems = function ()
	{
	    this.filesListTable.LoadAllItems(this.listQuery);
	}; 
    
    Acts.prototype.Rename = function (dictPath, fileName, newName)
	{
        var cnds = cr.plugins_.Rex_Backendless_Files.prototype.cnds;        
        var handler = getHandler(this, cnds.OnRename, cnds.OnRenameError);           
        var filePath = dictPath + "/" + fileName;   
        window["Backendless"]["Files"]["renameFile"]( filePath, handler );
	};    
    
    Acts.prototype.Rename = function (dictPath, fileName, newName)
	{
        var cnds = cr.plugins_.Rex_Backendless_Files.prototype.cnds;        
        var handler = getHandler(this, cnds.OnRename, cnds.OnRenameError);           
        var filePath = dictPath + "/" + fileName;   
        window["Backendless"]["Files"]["renameFile"]( filePath, handler );
	};
    
    Acts.prototype.Copy = function (dictPath, fileName, newName)
	{
        var cnds = cr.plugins_.Rex_Backendless_Files.prototype.cnds;        
        var handler = getHandler(this, cnds.OnCopy, cnds.OnCopyError);              
        var filePath = dictPath + "/" + fileName;   
        window["Backendless"]["Files"]["copyFile"]( filePath, handler );
	};  
    
    Acts.prototype.Move = function (dictPath, fileName, newName)
	{
        var cnds = cr.plugins_.Rex_Backendless_Files.prototype.cnds;        
        var handler = getHandler(this, cnds.OnMove, cnds.OnMoveError);              
        var filePath = dictPath + "/" + fileName;   
        window["Backendless"]["Files"]["moveFile"]( filePath, handler );
	};      
    
    Acts.prototype.Delete = function (dictPath, fileName)
	{ 
        var cnds = cr.plugins_.Rex_Backendless_Files.prototype.cnds;        
        var handler = getHandler(this, cnds.OnDelete, cnds.OnDeleteError);       
        var filePath = dictPath + "/" + fileName;   
        var fnName = (fileName !== "")? "remove":"removeDirectory";
        window["Backendless"]["Files"][fnName]( filePath, handler );
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.LastDownloadURL = function (ret)
	{
		ret.set_string(this.exp_LastDownloadURL);
	};	

	Exps.prototype.DownloadURL = function (ret, dictPath, fileName)
	{
		ret.set_string(window.BackendlessFilesStorageRoot(dictPath, fileName));
	};	
    
	Exps.prototype.CurFileName = function (ret)
	{
		ret.set_string( window.BackendlessGetItemValue(this.exp_CurFile, "name", "") );
	};	    

	Exps.prototype.CurPublicUrl = function (ret)
	{
		ret.set_string( window.BackendlessGetItemValue(this.exp_CurFile, "publicUrl", "") );
	};	    	

	Exps.prototype.CurDirectory = function (ret)
	{
        var p = window.BackendlessGetItemValue(this.exp_CurFile, "url", "");
        if (p !== "")
        {
            var s = p.split("/"); 
            s.length = s.length-1;        
            p = s.join("/");
        }
		ret.set_string( p );
	};	        

	Exps.prototype.CurCreated = function (ret)
	{
		ret.set_int( window.BackendlessGetItemValue(this.exp_CurFile, "createdOn", 0) );
	};	     

	Exps.prototype.CurFileSize = function (ret)
	{
		ret.set_int( window.BackendlessGetItemValue(this.exp_CurFile, "size", 0) );
	};    
    
	Exps.prototype.CurStartIndex = function (ret)
	{
		ret.set_int(this.filesListTable.GetStartIndex());
	};	
    
	Exps.prototype.LoopIndex = function (ret)
	{
		ret.set_int(this.exp_LoopIndex);
	};	
    
	Exps.prototype.CurFileIndex = function (ret)
	{
		ret.set_int(this.exp_CurFileIndex);
	};		  

	Exps.prototype.Index2FileName = function (ret, index)
	{
		ret.set_string( window.BackendlessGetItemValue(this.filesListTable.GetItem(index), "name", "") );
	};	    

	Exps.prototype.Index2PublicUrl = function (ret, index)
	{
		ret.set_string( window.BackendlessGetItemValue(this.filesListTable.GetItem(index), "publicUrl", "") );
	};	    	

	Exps.prototype.Index2Directory = function (ret, index)
	{
        var p = window.BackendlessGetItemValue(this.filesListTable.GetItem(index), "url", "");
        if (p !== "")
        {
            var s = p.split("/"); 
            s.length = s.length-1;        
            p = s.join("/");
        }
		ret.set_string( p );
	};	        

	Exps.prototype.Index2Created = function (ret, index)
	{
		ret.set_int( window.BackendlessGetItemValue(this.filesListTable.GetItem(index), "createdOn", 0) );
	};	     

	Exps.prototype.Index2FileSize = function (ret, index)
	{
		ret.set_int( window.BackendlessGetItemValue(this.filesListTable.GetItem(index), "size", 0) );
	};    
        
    
	Exps.prototype.ErrorCode = function (ret)
	{
	    var val = (!this.last_error)? "": this.last_error["code"];    
		ret.set_int(val);
	}; 
	
	Exps.prototype.ErrorMessage = function (ret)
	{
	    var val = (!this.last_error)? "": this.last_error["message"];    
		ret.set_string(val);
	};
		
}());