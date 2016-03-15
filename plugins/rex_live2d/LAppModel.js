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
        this.currentMotionName = "";
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
        
        var waitJobsCnt=0, errorFlag=false;        
        var onJobDone = function (error)
        {
            waitJobsCnt -= 1;           
            if (error)
                errorFlag = true;
            
            if (waitJobsCnt === 0)
            {
                
                thisRef.live2DModel.saveParam();
                thisRef.live2DModel.setGL(gl);                
                thisRef.mainMotionManager.stopAllMotions(); 
            
                thisRef.setUpdating(false);
                thisRef.setInitialized(true);
                
                if (!errorFlag && (typeof callback === "function"))
                    callback();
                
            }
        }
        
        var thisRef = this;
        
        var onLoadModelMoc = function (model)
        {
            loadTextures();
            loadMotionGroups();
            loadPose();            
            loadExpressions();
            loadPhysics();  

            
            setInstanceLayout();  
            
            if (thisRef.eyeBlink == null)
            {
                thisRef.eyeBlink = new L2DEyeBlink();
            }            
                   
            var cnt=thisRef.modelSetting.getInitParamNum();
            for (var j = 0; j <cnt; j++)
            {
                thisRef.live2DModel.setParamFloat(
                    thisRef.modelSetting.getInitParamID(j),
                    thisRef.modelSetting.getInitParamValue(j)
                );
            }
            
            var cnt=thisRef.modelSetting.getInitPartsVisibleNum();            
            for (var j = 0; j < cnt; j++)
            {
                thisRef.live2DModel.setPartsOpacity(
                    thisRef.modelSetting.getInitPartsVisibleID(j),
                    thisRef.modelSetting.getInitPartsVisibleValue(j)
                );
            }
            
            //console.log(waitJobsCnt);
        };

        var loadTextures = function()
        {
            // load textures
            thisRef.__texCounter = 0;
            var i, cnt=thisRef.modelSetting.getTextureNum(), texPaths;
    	    for (i=0; i<cnt; i++)
    	    {
                texPaths = thisRef.modelHomeDir +  thisRef.modelSetting.getTextureFile(i);
                waitJobsCnt += 1;
                thisRef.loadTexture(i, gl, texPaths, function() {
                    onJobDone();
                });             
            }            
        };   

        var loadExpressions = function ()        
        {
            var cnt=thisRef.modelSetting.getExpressionNum();
            if (cnt > 0)
            {
                for (var k in thisRef.expressions)
                    delete thisRef.expressions[k];
                
                var expName, expFilePath;
                for (var j = 0; j < cnt; j++)
                {
                    expName = thisRef.modelSetting.getExpressionName(j);
                    expFilePath = thisRef.modelHomeDir + thisRef.modelSetting.getExpressionFile(j);
                    waitJobsCnt += 1;
                    thisRef.loadExpression(expName, expFilePath, function() {
                        onJobDone();
                    });  
                }
            }
            else
            {
                thisRef.expressionManager = null;
                thisRef.expressions = {};
            }
        };
        
        var loadPhysics = function()
        {
            if (thisRef.modelSetting.getPhysicsFile() != null)
            {
                var physicsFilePath = thisRef.modelHomeDir + thisRef.modelSetting.getPhysicsFile();
                waitJobsCnt += 1;                
                thisRef.loadPhysics(physicsFilePath, function() {
                    onJobDone();
                });  
            }
            else
            {
                thisRef.physics = null;
            }        
        };
        
        var loadPose = function()
        {
            if (thisRef.modelSetting.getPoseFile() != null)
            {
                var poseFilePath = thisRef.modelHomeDir + thisRef.modelSetting.getPoseFile();
                waitJobsCnt += 1;
                thisRef.loadPose(poseFilePath, function() {
                    thisRef.pose.updateParam(thisRef.live2DModel);
                    onJobDone();
                });
            }
            else
            {
                thisRef.pose = null;
            }   
        };
        
        var loadMotionGroups = function()
        {
            var motions = thisRef.modelSetting.getMotions();
            for (var name in motions)
            {
                var cnt = thisRef.modelSetting.getMotionNum(name);
                for (var i = 0; i < cnt; i++)
                {
                    var file = thisRef.modelSetting.getMotionFile(name, i);
                    waitJobsCnt += 1;
                    thisRef.loadMotion(file, thisRef.modelHomeDir + file, function(motion) {
                        motion.setFadeIn(thisRef.modelSetting.getMotionFadeIn(name, i));
                        motion.setFadeOut(thisRef.modelSetting.getMotionFadeOut(name, i));
                        onJobDone();
                    });
                    
                }                
            }
        };
        
        var setInstanceLayout= function()
        {        
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
        };
        
        var onLoadModelSetting = function()
        {
            // load model.moc
            var path = thisRef.modelHomeDir + thisRef.modelSetting.getModelFile();
            thisRef.loadModelData(path, onLoadModelMoc);
        };
        
        this.modelSetting.loadModelSetting(modelSettingPath, onLoadModelSetting);
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
        // console.log("--> LAppModel.update()");
    
        if(this.live2DModel == null) 
        {
            if (LAppDefine.DEBUG_LOG) console.error("Failed to update.");
            
            return;
        }
        
        if (this.isMotionFinished())
            this.currentMotionName = "";
        
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
        if (this.lipSync)
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
        this.currentMotionName = name;
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
            
            //var snd = document.createElement("audio");
            //snd.src = this.modelHomeDir + soundName;
            
            //if (LAppDefine.DEBUG_LOG)
            //    console.log("Start sound : " + soundName);
            
            //snd.play();
            this.mainMotionManager.startMotionPrio(motion, priority);
        }
        
    }

    LAppModel.prototype.isMotionFinished = function()
    {
        return this.mainMotionManager.isFinished();
    };
    
    LAppModel.prototype.hasUpdated = function()
    {
        // motion updating is moved to live2D plugin
        var isMotionUpdating = (this.currentName !== "") && (!this.isMotionFinished());
        
        var isEyeBlinking = (this.eyeBlink != null);
        
        var isExpressionPlaying = (this.expressionManager != null && 
            this.expressions != null && 
            !this.expressionManager.isFinished());

        var isPhysicsPUpdatinig = (this.physics != null);
        
        var isLipSyncUpdating = this.lipSync;
        
        var isPosePlaying = ( this.pose != null );
 
        return isMotionUpdating || 
            isEyeBlinking || 
            isExpressionPlaying || 
            isPhysicsPUpdatinig ||
            isLipSyncUpdating ||
            isPosePlaying;
    };    
    
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

    var LAppDefine = 
    {
        
        // デバッグ。trueのときにログを表示する。
        DEBUG_LOG : true,
        DEBUG_MOUSE_LOG : false, // マウス関連の冗長なログ
        // DEBUG_DRAW_HIT_AREA : false, // 当たり判定の可視化
        // DEBUG_DRAW_ALPHA_MODEL : false, // 半透明のモデル描画を行うかどうか。
        
        //  全体の設定
        
        // 画面
        VIEW_MAX_SCALE : 2,
        VIEW_MIN_SCALE : 0.8,
    
        VIEW_LOGICAL_LEFT : -1,
        VIEW_LOGICAL_RIGHT : 1,
    
        VIEW_LOGICAL_MAX_LEFT : -2,
        VIEW_LOGICAL_MAX_RIGHT : 2,
        VIEW_LOGICAL_MAX_BOTTOM : -2,
        VIEW_LOGICAL_MAX_TOP : 2,
        
        // モーションの優先度定数
        PRIORITY_NONE : 0,
        PRIORITY_IDLE : 1,
        PRIORITY_NORMAL : 2,
        PRIORITY_FORCE : 3,
        
    };
    
    window.LAppModel = LAppModel;
    window.LAppDefine = LAppDefine;
}());