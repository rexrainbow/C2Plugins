(function ()
{
    //============================================================
    //============================================================
    //  class PlatformManager     extend IPlatformManager
    //============================================================
    //============================================================
    window.PlatformManager = function()
    {
    
    };

    //============================================================
    //    PlatformManager # loadBytes()
    //============================================================
    PlatformManager.prototype.loadBytes       = function(path/*String*/, callback)
    {
        var request = new XMLHttpRequest();
	    request.open("GET", path, true);
	    request.responseType = "arraybuffer";
	    request.onload = function(){
		    switch(request.status){
		    case 200:
			    callback(request.response);
			    break;
		    default:
			    console.error("Failed to load (" + request.status + ") : " + path);
			    break;
		    }
	    }
	    request.send(null);
	    //return request;
    };

    //============================================================
    //    PlatformManager # loadString()
    //============================================================
    PlatformManager.prototype.loadString      = function(path/*String*/)
    {
    
        this.loadBytes(path, function(buf) {        
            return buf;
        });
        
    };

    //============================================================
    //    PlatformManager # loadLive2DModel()
    //============================================================
    PlatformManager.prototype.loadLive2DModel = function(path/*String*/, callback)
    {
        var model = null;
        
        // load moc
	    this.loadBytes(path, function(buf){
		    model = Live2DModelWebGL.loadModel(buf);
            callback(model);
	    });

    };

    //============================================================
    //    PlatformManager # loadTexture()
    //============================================================
    PlatformManager.prototype.loadTexture     = function(model/*ALive2DModel*/, no/*int*/, path/*String*/, callback)
    { 
        // load textures
        var loadedImage = new Image();
        loadedImage.src = path;
        
        var thisRef = this;
        loadedImage.onload = function() {
                
            // create texture
            var canvas = document.getElementById("glcanvas");                      // TODO
            var gl = getWebGLContext(canvas, {premultipliedAlpha : true});
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
            texture = null;
            
            if (typeof callback == "function") callback();
        };
    
        loadedImage.onerror = function() { 
            console.error("Failed to load image : " + path); 
        }
    };


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
    };

    /*
    * WebGLのコンテキストを取得する
    */
    function getWebGLContext()
    {
	    var NAMES = [ "webgl" , "experimental-webgl" , "webkit-3d" , "moz-webgl"];
    	
    	for( var i = 0; i < NAMES.length; i++ ){
	    	try{
		    	var ctx = this.canvas.getContext(NAMES[i], {premultipliedAlpha : true});
    			if(ctx) return ctx;
		    } 
		    catch(e){}
	    }
	    return null;
    };

}());