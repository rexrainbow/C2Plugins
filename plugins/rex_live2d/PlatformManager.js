"use strict";

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class PlatformManager     extend IPlatformManager
//============================================================
//============================================================
(function ()
{
        
    function PlatformManager(cfg)
    {
        this.isWindowsPhone8 = cfg["isWindowsPhone8"];
    }
    
    //============================================================
    //    PlatformManager # loadBytes()
    //============================================================
    PlatformManager.prototype.loadBytes       = function(path/*String*/, callback)
    {
        var request;
        if (this.isWindowsPhone8)
            request = new ActiveXObject("Microsoft.XMLHTTP");
        else
            request = new XMLHttpRequest();
        
    	request.open("GET", path, true);
    	request.responseType = "arraybuffer";
    	request.onload = function(){
    		switch(request.status){
    		case 200:
    			callback(request.response);
    			break;
    		default:
                callback(null);
    			//console.error("Failed to load (" + request.status + ") : " + path);
    			break;
    		}
    	}
    	request.send(null);
    	//return request;
    }
    
    //============================================================
    //    PlatformManager # loadLive2DModel()
    //============================================================
    var G_GLNO = 1;
    PlatformManager.prototype.loadLive2DModel = function(path/*String*/, gl, callback)
    {
        var model = null;
        
        // load moc
    	this.loadBytes(path, function(buf){
            if (buf)
            {
                Live2D.setGL(gl, G_GLNO);
    		    model = Live2DModelWebGL.loadModel(buf, G_GLNO);
                G_GLNO ++;
            }

            callback(model);  // null while error
    	});
    
    }
    
    //============================================================
    //    PlatformManager # loadTexture()
    //============================================================
    PlatformManager.prototype.loadTexture     = function(model/*ALive2DModel*/, no/*int*/, gl, path/*String*/, callback)
    { 
        // load textures
        var loadedImage = new Image();
    		
        if (path.substr(0, 5) !== "data:")
            loadedImage.crossOrigin = 'anonymous';
            
        loadedImage.src = path;
            
        var thisRef = this;
        loadedImage.onload = function() {
                    
            // create texture
            //var canvas = document.getElementById("glcanvas");
            //var gl = getWebGLContext(canvas, {premultipliedAlpha : true});
            var texture = gl.createTexture();	 // テクスチャオブジェクトを作成する
            if (!texture){ console.error("Failed to generate gl texture name."); return -1; }
    
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);	// imageを上下反転
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, 
                          gl.UNSIGNED_BYTE, loadedImage);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
    
    
            // 画像からWebGLテクスチャ化を生成し、モデルに登録
            model.setTexture(no, texture);// モデルにテクスチャをセット
            
            // テクスチャオブジェクトを解放
            //texture = null;
            
            if (typeof callback == "function") callback(texture);
        };
        
        loadedImage.onerror = function() { 
            if (typeof callback == "function") callback(null);
            //console.error("Failed to load image : " + path); 
        }
    }
    
    
    //============================================================
    //    PlatformManager # parseFromBytes(buf)
    //    ArrayBuffer から JSON に変換する
    //============================================================
    PlatformManager.prototype.jsonParseFromBytes = function(buf){
        
        var jsonStr;
        
        // BOMの有無に応じて処理を分ける
        // UTF-8のBOMは0xEF 0xBB 0xBF（10進数：239 187 191）
        var bomCode = new Uint8Array(buf, 0, 3);
        if (bomCode[0] == 239 && bomCode[1] == 187 && bomCode[2] == 191) {
            jsonStr = String.fromCharCode.apply(null, new Uint8Array(buf, 3));
        } else {
            jsonStr = String.fromCharCode.apply(null, new Uint8Array(buf));
        }
        
        var jsonObj = JSON.parse(jsonStr);
        
        return jsonObj;
    };
    
    
    //============================================================
    //    PlatformManager # log()
    //============================================================
    PlatformManager.prototype.log             = function(txt/*String*/)
    {
        console.log(txt);
    }
    
    window.PlatformManager = PlatformManager;

}());
