"use strict";

//============================================================
//============================================================
//  class LAppModel     extends L2DBaseModel         
//============================================================
//============================================================
(function ()
{
       
       
    function LAppModel()
    {
        //L2DBaseModel.apply(this, arguments);
        L2DBaseModel.prototype.constructor.call(this);
        
        this.modelHomeDir = "";
        this.modelSetting = null;
        this.tmpMatrix = [];
    }
    
    LAppModel.prototype = new L2DBaseModel();
    
    /*
     * モデルを初期化する
     */
    LAppModel.prototype.load = function(gl, modelSettingPath, callback)
    {
        this.gl = gl;
        
        this.setUpdating(true);
        this.setInitialized(false);
    
        this.modelHomeDir = modelSettingPath.substring(0, modelSettingPath.lastIndexOf("/") + 1); 
    
        this.modelSetting = new ModelSettingJson();
        
        var thisRef = this;
        
        this.modelSetting.loadModelSetting(modelSettingPath, function(){
            // モデルデータを読み込む
            var path = thisRef.modelHomeDir + thisRef.modelSetting.getModelFile();
            thisRef.loadModelData(path, function(model){
                
                thisRef.__texCounter = 0;
    			for (var i = 0; i < thisRef.modelSetting.getTextureNum(); i++)
    			{
                    // テクスチャを読み込む
                    var texPaths = thisRef.modelHomeDir + 
                        thisRef.modelSetting.getTextureFile(i);
                    
    				thisRef.loadTexture(i, gl, texPaths, function() {
                        // すべてのテクスチャを読み込んだ後の処理
                        if( thisRef.isTexLoaded ) {
                            // 表情
                            if (thisRef.modelSetting.getExpressionNum() > 0)
                            {
                                // 古い表情を削除
                                thisRef.expressions = {};
                                
                                for (var j = 0; j < thisRef.modelSetting.getExpressionNum(); j++)
                                {
                                    var expName = thisRef.modelSetting.getExpressionName(j);
                                    var expFilePath = thisRef.modelHomeDir + 
                                        thisRef.modelSetting.getExpressionFile(j);
                                    
                                    thisRef.loadExpression(expName, expFilePath);
                                }
                            }
                            else
                            {
                                thisRef.expressionManager = null;
                                thisRef.expressions = {};
                            }
                            
                            
                            // 自動目パチ
                            if (thisRef.eyeBlink == null)
                            {
                                thisRef.eyeBlink = new L2DEyeBlink();
                            }
                            
                            // 物理演算
                            if (thisRef.modelSetting.getPhysicsFile() != null)
                            {
                                thisRef.loadPhysics(thisRef.modelHomeDir + 
                                                    thisRef.modelSetting.getPhysicsFile());
                            }
                            else
                            {
                                thisRef.physics = null;
                            }
                            
                            
                            // パーツ切り替え
                            if (thisRef.modelSetting.getPoseFile() != null)
                            {
                                thisRef.loadPose(
                                    thisRef.modelHomeDir +
                                    thisRef.modelSetting.getPoseFile(),
                                    function() {
                                        thisRef.pose.updateParam(thisRef.live2DModel);
                                    }
                                );
                            }
                            else
                            {
                                thisRef.pose = null;
                            }
                            
                            
                            // レイアウト
                            if (thisRef.modelSetting.getLayout() != null)
                            {
                                var layout = thisRef.modelSetting.getLayout();
                                if (layout["width"] != null)
                                    thisRef.modelMatrix.setWidth(layout["width"]);
                                if (layout["height"] != null)
                                    thisRef.modelMatrix.setHeight(layout["height"]);
    
                                if (layout["x"] != null)
                                    thisRef.modelMatrix.setX(layout["x"]);
                                if (layout["y"] != null)
                                    thisRef.modelMatrix.setY(layout["y"]);
                                if (layout["center_x"] != null)
                                    thisRef.modelMatrix.centerX(layout["center_x"]);
                                if (layout["center_y"] != null)
                                    thisRef.modelMatrix.centerY(layout["center_y"]);
                                if (layout["top"] != null)
                                    thisRef.modelMatrix.top(layout["top"]);
                                if (layout["bottom"] != null)
                                    thisRef.modelMatrix.bottom(layout["bottom"]);
                                if (layout["left"] != null)
                                    thisRef.modelMatrix.left(layout["left"]);
                                if (layout["right"] != null)
                                    thisRef.modelMatrix.right(layout["right"]);
                            }
                            
                            for (var j = 0; j < thisRef.modelSetting.getInitParamNum(); j++)
                            {
                                // パラメータを上書き
                                thisRef.live2DModel.setParamFloat(
                                    thisRef.modelSetting.getInitParamID(j),
                                    thisRef.modelSetting.getInitParamValue(j)
                                );
                            }
    
                            for (var j = 0; j < thisRef.modelSetting.getInitPartsVisibleNum(); j++)
                            {
                                // パーツの透明度を設定
                                thisRef.live2DModel.setPartsOpacity(
                                    thisRef.modelSetting.getInitPartsVisibleID(j),
                                    thisRef.modelSetting.getInitPartsVisibleValue(j)
                                );
                            }
                            
                            
                            // パラメータを保存。次回のloadParamで読みだされる
                            thisRef.live2DModel.saveParam();
                            thisRef.live2DModel.setGL(gl);
                            
                            // アイドリングはあらかじめ読み込んでおく。
                            //thisRef.preloadMotionGroup(LAppDefine.MOTION_GROUP_IDLE);
                            thisRef.mainMotionManager.stopAllMotions();
    
                            thisRef.setUpdating(false); // 更新状態の完了
                            thisRef.setInitialized(true); // 初期化完了
                            
                            if (typeof callback == "function") callback();
                            
                        }
                    });
                }
            });
        });
    };
    
    
    /*
     * GCだけで解放されないメモリを解放
     */
    LAppModel.prototype.release = function()
    {
        if (!this.gl)
            return;
        
        var i,cnt=this.textures.length;
        for(i=0; i<cnt; i++)
            this.gl.deleteTexture(this.textures[i]);
        
        this.gl = null;
        this.textures.length = 0;
        
        for(var k in this.motions)
            delete this.motions[k];
            
        for(var k in this.expressions)
            delete this.expressions[k];
    }
    
    
    /*
     * モーションファイルをあらかじめ読み込む
     */
    LAppModel.prototype.preloadMotionGroup = function(name)
    {
        var thisRef = this;
        
        for (var i = 0; i < this.modelSetting.getMotionNum(name); i++)
        {
            var file = this.modelSetting.getMotionFile(name, i);
            this.loadMotion(file, this.modelHomeDir + file, function(motion) {
                motion.setFadeIn(thisRef.modelSetting.getMotionFadeIn(name, i));
                motion.setFadeOut(thisRef.modelSetting.getMotionFadeOut(name, i));
            });
            
        }
    }
    
    
    LAppModel.prototype.update = function()
    {
        // 待機モーション判定
        //if (this.mainMotionManager.isFinished())
        //{
        //    // モーションの再生がない場合、待機モーションの中からランダムで再生する
        //    this.startRandomMotion(LAppDefine.MOTION_GROUP_IDLE, LAppDefine.PRIORITY_IDLE);
        //}
    
        //-----------------------------------------------------------------		
        
        // 前回セーブされた状態をロード
        this.live2DModel.loadParam();
        
        /* インスタンスが作られていたら更新 */
        
        var update = this.mainMotionManager.updateParam(this.live2DModel); // モーションを更新
        if (!update) {
            // 目ぱち
            if(this.eyeBlink != null) {
                this.eyeBlink.updateParam(this.live2DModel);
            }
        }
    
        // 状態を保存
        this.live2DModel.saveParam();
        
        //-----------------------------------------------------------------		
        
        // 表情でパラメータ更新（相対変化）
        if (this.expressionManager != null && 
            this.expressions != null && 
            !this.expressionManager.isFinished())
        {
            this.expressionManager.updateParam(this.live2DModel); 
        }
        
        // 物理演算
        if (this.physics != null)
        {
            this.physics.updateParam(this.live2DModel); // 物理演算でパラメータ更新
        }
        
        // リップシンクの設定
        if (this.lipSync == null)
        {
            this.live2DModel.setParamFloat("PARAM_MOUTH_OPEN_Y",
                                           this.lipSyncValue);
        }
        
        // ポーズ
        if( this.pose != null ) {
            this.pose.updateParam(this.live2DModel);
        }
            
        this.live2DModel.update();
    };
    
    
    /*
     * 表情をランダムに切り替える
     */
    LAppModel.prototype.setRandomExpression = function()
    {
        var tmp = [];
        for (var name in this.expressions)
        {
            tmp.push(name);
        }
    
        var no = parseInt(Math.random() * tmp.length);
    
        this.setExpression(tmp[no]);
    }
    
    
    /*
     * モーションをランダムで再生する
     */
    LAppModel.prototype.startRandomMotion = function(name, priority)
    {
        var max = this.modelSetting.getMotionNum(name);
        var no = parseInt(Math.random() * max);
        this.startMotion(name, no, priority);
    }
    
    
    /*
     * モーションの開始。
     * 再生できる状態かチェックして、できなければ何もしない。
     * 再生出来る場合は自動でファイルを読み込んで再生。
     * 音声付きならそれも再生。
     * フェードイン、フェードアウトの情報があればここで設定。なければ初期値。
     */
    LAppModel.prototype.startMotion = function(name, no, priority)
    {
        // console.log("startMotion : " + name + " " + no + " " + priority);
        
        var motionName = this.modelSetting.getMotionFile(name, no);
        
        if (motionName == null || motionName == "")
        {
            if (LAppDefine.DEBUG_LOG)
                console.error("Failed to motion.");
            return;
        }
    
        if (priority == LAppDefine.PRIORITY_FORCE) 
        {
            this.mainMotionManager.setReservePriority(priority);
        }
        else if (!this.mainMotionManager.reserveMotion(priority))
        {
            if (LAppDefine.DEBUG_LOG)
                console.log("Motion is running.")
            return;
        }
    
        var thisRef = this;
        var motion;
    
        if (this.motions[name] == null) 
        {
            this.loadMotion(null, this.modelHomeDir + motionName, function(mtn) {
                motion = mtn;
                
                // フェードイン、フェードアウトの設定
                thisRef.setFadeInFadeOut(name, no, priority, motion);
                
            });
        }
        else 
        {
            motion = this.motions[name];
            
            // フェードイン、フェードアウトの設定
            thisRef.setFadeInFadeOut(name, no, priority, motion);
        }
    }
    
    
    LAppModel.prototype.setFadeInFadeOut = function(name, no, priority, motion)
    {
        var motionName = this.modelSetting.getMotionFile(name, no);
        
        motion.setFadeIn(this.modelSetting.getMotionFadeIn(name, no));
        motion.setFadeOut(this.modelSetting.getMotionFadeOut(name, no));
        
        
        if (LAppDefine.DEBUG_LOG)
                console.log("Start motion : " + motionName);
    
        if (this.modelSetting.getMotionSound(name, no) == null)
        {
            this.mainMotionManager.startMotionPrio(motion, priority);
        }
        else
        {
            var soundName = this.modelSetting.getMotionSound(name, no);
            // var player = new Sound(this.modelHomeDir + soundName);
            
            var snd = document.createElement("audio");
            snd.src = this.modelHomeDir + soundName;
            
            if (LAppDefine.DEBUG_LOG)
                console.log("Start sound : " + soundName);
            
            snd.play();
            this.mainMotionManager.startMotionPrio(motion, priority);
        }
    }
    
    
    /*
     * 表情を設定する
     */
    LAppModel.prototype.setExpression = function(name)
    {
        var motion = this.expressions[name];
        
        if (LAppDefine.DEBUG_LOG)
            console.log("Expression : " + name);
            
        this.expressionManager.startMotion(motion, false);
    }
    
    
    /*
     * 描画
     */
    LAppModel.prototype.draw = function(gl)
    {
        //console.log("--> LAppModel.draw()");
        
        // if(this.live2DModel == null) return;
        
        // 通常
        MatrixStack.push();
        
        MatrixStack.multMatrix(this.modelMatrix.getArray());
        
        this.tmpMatrix = MatrixStack.getMatrix()
        this.live2DModel.setMatrix(this.tmpMatrix);
        this.live2DModel.draw();
        
        MatrixStack.pop();
        
    };
            
    
    /*
     * 当たり判定との簡易テスト。
     * 指定IDの頂点リストからそれらを含む最大の矩形を計算し、点がそこに含まれるか判定
     */
    LAppModel.prototype.hitTest = function(id, testX, testY)
    {
        var len = this.modelSetting.getHitAreaNum();
        for (var i = 0; i < len; i++)
        {        
            if (id == this.modelSetting.getHitAreaName(i))
            {
                var drawID = this.modelSetting.getHitAreaID(i);
                
                return this.hitTestSimple(drawID, testX, testY);
            }
        }
        
        return false; // 存在しない場合はfalse
    }

    window.LAppModel = LAppModel;
}());