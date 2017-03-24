/*
- counter value
*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_Storage = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Firebase_Storage.prototype;
		
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
        
        this.uploadTask = null;
        this.metadata = {};
        
        this.snapshot = null;
        this.isUploading = false;
        this.error = null;
        
        this.exp_LastDownloadURL = "";
        this.exp_LastMetadata = null
	};
	
	instanceProto.onDestroy = function ()
	{		
	};

	instanceProto.get_storage_ref = function(k)
	{
        if (k == null)
	        k = "";
	    var path = this.rootpath + k + "/";
        return window["Firebase"]["storage"]()["ref"](path);
	};     
    
    instanceProto.upload = function(file, path, metadata)
    {
        if (this.uploadTask)
            this.uploadTask["cancel"]();
        
        var self=this;
        this.isUploading = null;
        this.snapshot = null;
        this.error = null;              
        this.exp_LastDownloadURL = "";
        
        var onComplete = function ()
        {
            self.isUploading = false;
            self.snapshot = self.uploadTask["snapshot"];
            self.exp_LastDownloadURL = self.snapshot["downloadURL"];
            self.exp_LastMetadata = self.snapshot["metadata"];
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnUploadCompleted, self);
        };
        var onError = function (error)
        {
            self.isUploading = false;
            self.error = error;
            switch (error["code"]) 
            {
            case 'storage/unauthorized':
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnUploadError, self);
                break;
            
            case 'storage/canceled':
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnUploadCanceled, self);            
                break;
                
            case 'storage/unknown':
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnUploadError, self);
                break;
                
            default:
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnUploadError, self);
                break;            
            }
        };
        var onStateChanged = function (snapshot)
        {
            self.snapshot = self.uploadTask["snapshot"];            
            var isRunning = (snapshot["state"] === 'running');
            if (isRunning && (self.isUploading === null))
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnStart, self);                 
            else if (isRunning && !self.isUploading)
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnResmue, self); 
            else if (!isRunning && self.isUploading)
                self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnPaused, self);
                        
            self.isUploading = isRunning;
            
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnProgress, self);
        };
        
        this.exp_LastMetadata = metadata;
        this.uploadTask = this.get_storage_ref(path)["put"](file, metadata);
        this.uploadTask["on"]('state_changed', onStateChanged, onError, onComplete);   
    };
    
    	
	instanceProto.doRequest = function ( url_, callback )
	{
	    var oReq;
	    
		// Windows Phone 8 can't AJAX local files using the standards-based API, but
		// can if we use the old-school ActiveXObject. So use ActiveX on WP8 only.
		if (this.runtime.isWindowsPhone8)
			oReq = new ActiveXObject("Microsoft.XMLHTTP");
		else
			oReq = new XMLHttpRequest();
			
        oReq.open("GET", url_, true);
        oReq.responseType = "arraybuffer";
        
        oReq.onload = function (oEvent) 
        {
            callback(oReq.response);
        };
        
        oReq.send(null);
	};	 

    var parseMetadata = function(metadata, defaultContentType)
    {
        if ((metadata.indexOf("{") !== -1) && (metadata.indexOf("}") !== -1))
        {
            metadata = JSON.parse(metadata);
        }
        else if (metadata !== "")
        {
            metadata = {"contentType":  metadata}; 
        }
        else
            metadata = {};
        
        if (!metadata.hasOwnProperty("contentType") && defaultContentType)
            metadata["contentType"] = defaultContentType;

        return metadata;
    };
    
	var setValue = function(keys, value, root)
	{
        if (typeof (keys) === "string")
            keys = keys.split(".");
        
        var lastKey = keys.pop(); 
        var entry = getEntry(keys, root);
        entry[lastKey] = value;
	};  
    
	var getEntry = function(keys, root)
	{
        var entry = root;
        if ((keys === "") || (keys.length === 0))
        {
            //entry = root;
        }
        else
        {
            if (typeof (keys) === "string")
                keys = keys.split(".");
            
            var i,  cnt=keys.length, key;
            for (i=0; i< cnt; i++)
            {
                key = keys[i];
                if ( (entry[key] == null) || (typeof(entry[key]) !== "object") )                
                    entry[key] = {};
                
                entry = entry[key];            
            }           
        }
        
        return entry;
	};         

 	var getItemValue = function (item, k, default_value)
	{
        var v;
	    if (item == null)
            v = null;
        else if ( (k == null) || (k === "") )
            v = item;
        else if ((typeof(k) === "number") || (k.indexOf(".") == -1))
            v = item[k];
        else
        {
            var kList = k.split(".");
            v = item;
            var i,cnt=kList.length;
            for(i=0; i<cnt; i++)
            {
                if (typeof(v) !== "object")
                {
                    v = null;
                    break;
                }
                    
                v = v[kList[i]];
            }
        }

        return din(v, default_value);
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
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnUploadCompleted = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnUploadError = function ()
	{
	    return true;
	};     

	Cnds.prototype.OnUploadCanceled = function ()
	{
	    return true;
	};  

	Cnds.prototype.OnPaused = function ()
	{
	    return true;
	};     

	Cnds.prototype.OnResmue = function ()
	{
	    return true;
	};  	

	Cnds.prototype.IsUploading = function ()
	{
	    return this.isUploading;
	};  

	Cnds.prototype.OnProgress = function ()
	{
	    return true;
	}; 

	Cnds.prototype.OnStart = function ()
	{
	    return true;
	};     
    
	Cnds.prototype.OnGetDownloadURL = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnGetDownloadURLError = function ()
	{
	    return true;
	};     

	Cnds.prototype.FileDoesntExist = function ()
	{
        return (this.error && (this.error === 'storage/object_not_found'));
	};     
    
	Cnds.prototype.OnDeleteCompleted = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnDeleteError = function ()
	{
	    return true;
	};     
    
	Cnds.prototype.OnGetMetadata = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnGetMetadataError = function ()
	{
	    return true;
	};    
    
	Cnds.prototype.OnUpdateMetadata = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnUpdateMetadataError = function ()
	{
	    return true;
	};     
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
     Acts.prototype.SetSubDomainRef = function (ref)
	{
	    this.rootpath = ref + "/";         
    };
 
    Acts.prototype.UploadFromFileChooser = function (fileChooserObjs, storagePath)
	{
        if (!fileChooserObjs)
            return;
        
        var fc = fileChooserObjs.getFirstPicked();
        if (!fc)
            return;
        
        assert2( fc.elem, "Firebase storage: input is not a file chooser object.");
        var files = fc.elem["files"];
        if (!files)
            return;
        
        var f = files[0];
        if (!f)
            return;
        
        this.upload(f, storagePath, this.metadata);
        this.metadata = {};
	}; 
    
    Acts.prototype.CancelUploading = function ()
	{
        if (!this.uploadTask)
            return;
        
        this.uploadTask["cancel"]();
	}; 
    
    Acts.prototype.PauseUploading = function ()
	{
        if (!this.uploadTask)
            return;
        
        this.uploadTask["pause"]();
	};     
    
    Acts.prototype.ResumeUploading = function ()
	{
        if (!this.uploadTask)
            return;
        
        this.uploadTask["resume"]();
	};      
    
    Acts.prototype.UploadFromSprite = function (objType, storagePath)
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
            self.upload(blob, storagePath, self.metadata);
            self.metadata = {};
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

    Acts.prototype.UploadDataURI = function (dataURI, storagePath)
	{
        var obj = dataURItoBlob(dataURI);
        var blob = obj[0];
        var contentType = obj[1];
        
        if (!this.metadata.hasOwnProperty("contentType"))
            this.metadata["contentType"] = contentType;
        
        this.upload(blob, storagePath, this.metadata);   
        this.metadata = {};
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
    
    Acts.prototype.UploadString = function (s, storagePath)
	{
        var type = "text/plain";
        var blob = new Blob([s], {"type": type});
        
        if (!this.metadata.hasOwnProperty("contentType"))
            this.metadata["contentType"] = type;
        
        this.upload(blob, storagePath, this.metadata);   
        this.metadata = {};
	};       
    
    Acts.prototype.UploadObjectURL = function (objectURL, contentType, storagePath)
	{
        var self=this;
        var callback = function (blob)
        {
            if (contentType !== "")
                self.metadata["contentType"] = contentType;        
            
            self.upload(blob, storagePath, self.metadata); 
            self.metadata = {};
        }
        this.doRequest(objectURL, callback);
	};      
    
    Acts.prototype.GetDownloadURL = function (storagePath)
	{
        var self=this;
        var ref = this.get_storage_ref(storagePath);
        
        this.error = null;
        this.exp_LastDownloadURL = "";
        var onComplete = function (url)
        {
            self.exp_LastDownloadURL = url;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnGetDownloadURL, self);
        };
        var onError = function (error)
        {
            self.error = error;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnGetDownloadURLError, self);
        }
        ref["getDownloadURL"]()["then"](onComplete)["catch"](onError);
	};     
    
    Acts.prototype.DeleteAtURL = function (storagePath)
	{
        var self=this;
        var ref = this.get_storage_ref(storagePath);
        
        this.error = null;
        var onComplete = function ()
        {
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnDeleteCompleted, self);
        };
        var onError = function (error)
        {
            self.error = error;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnDeleteError, self);
        }
        ref["delete"]()["then"](onComplete)["catch"](onError);
	};
        
    Acts.prototype.GetMetadata = function (storagePath)
	{
        var self=this;
        var ref = this.get_storage_ref(storagePath);
        
        this.error = null;
        this.exp_LastMetadata = null;
        var onComplete = function (metadata)
        {
            self.exp_LastMetadata = metadata;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnGetMetadata, self);
        };
        var onError = function (error)
        {
            self.error = error;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnGetMetadataError, self);
        }
        ref["getMetadata"]()["then"](onComplete)["catch"](onError);
	};
        
    Acts.prototype.UpdateMetadata = function (storagePath)
	{
        var self=this;
        var ref = this.get_storage_ref(storagePath);
        
        this.error = null;
        this.exp_LastMetadata = null;
        var onComplete = function (metadata)
        {
            self.exp_LastMetadata = metadata;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnUpdateMetadata, self);
        };
        var onError = function (error)
        {
            self.error = error;
            self.runtime.trigger(cr.plugins_.Rex_Firebase_Storage.prototype.cnds.OnUpdateMetadataError, self);
        }
        ref["updateMetadata"](this.metadata)["then"](onComplete)["catch"](onError);
        this.metadata = {};
	};
    
    Acts.prototype.MetadataSetValue = function (k, v)
	{
        setValue(k, v, this.metadata);
        this.metadata
	};    
        
    Acts.prototype.MetadataLoadJSON = function (s)
	{
        this.metadata = JSON.parse(s);
	};  
    
    Acts.prototype.MetadataRemoveKey = function (k)
	{
        setValue(k, null, this.metadata);
        this.metadata
	};  
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.LastDownloadURL = function (ret)
	{
		ret.set_string(this.exp_LastDownloadURL);
	};	
    
	Exps.prototype.Progress = function (ret)
	{
        var p;        
	    if (this.snapshot)
            p = this.snapshot["bytesTransferred"] / this.snapshot["totalBytes"];
	    
		ret.set_float(p || 0);
	};	
    
	Exps.prototype.TransferredBytes = function (ret)
	{
        var b;        
	    if (this.snapshot)
            b = this.snapshot["bytesTransferred"];
	    
		ret.set_float(b || 0);
	};		
    
	Exps.prototype.TotalBytes = function (ret)
	{
        var b;        
	    if (this.snapshot)
            b = this.snapshot["totalBytes"];
	    
		ret.set_float(b || 0);
	};	    
    
	Exps.prototype.LastErrorCode = function (ret)
	{
        var code;
	    if (this.error)
            code = this.error["code"];
		ret.set_string(code || "");
	}; 
	
	Exps.prototype.LastErrorMessage = function (ret)
	{
        var s;
	    if (this.error)
            s = this.error["serverResponse"];
		ret.set_string(s || "");
	};	  
	
	Exps.prototype.LastMetadata = function (ret, k, default_value)
	{
		ret.set_any( getItemValue(this.exp_LastMetadata, k, default_value) );
	};	
    
}());