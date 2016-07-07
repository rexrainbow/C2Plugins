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
        
        this.customParamsCB = [];
        this.breathingEnable = false;
        this.currentMotion = {name:"", no:-1, data:null};
        this.currentMotionName = "";
        this.currentMotionData = null;        
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
        var mocFilePath;
        
        var waitJobsCnt=0, errorPaths="";        
        var onJobDone = function (errorPath)
        {
            waitJobsCnt -= 1;           
            if (errorPath)
            {
                if (errorPaths !== "")
                    errorPaths += ";";
                
                errorPaths += errorPath;
            }
            
            if (waitJobsCnt === 0)
            {                
                if (errorPaths === "")
                {
                    thisRef.live2DModel.saveParam();
                    //thisRef.live2DModel.setGL(gl);                
                    thisRef.mainMotionManager.stopAllMotions();                     
            
                    thisRef.setUpdating(false);
                    thisRef.setInitialized(true);
                }
                
                callback(errorPaths);
            }
        }
        
        var thisRef = this;
        
        var onLoadModelMoc = function (model)
        {
            // error
            if (!model)
            {
                callback(mocFilePath);
                return;
            } 
            
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
                thisRef.loadTexture(i, gl, texPaths, function(tex) {
                    var errorPath = (tex)? null: texPaths;
                    onJobDone(errorPath);
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
                    thisRef.loadExpression(expName, expFilePath, function(buf) {
                        var errorPath = (buf)? null: expFilePath;
                        onJobDone(errorPath);
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
                thisRef.loadPhysics(physicsFilePath, function(buf) {
                    var errorPath = (buf)? null: physicsFilePath;
                    onJobDone(errorPath);
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
                thisRef.loadPose(poseFilePath, function(buf) {
                    if (buf)
                        thisRef.pose.updateParam(thisRef.live2DModel);
                    
                    var errorPath = (buf)? null: poseFilePath;
                    onJobDone(errorPath);
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
                    var motionFilePath = thisRef.modelHomeDir + file;                    
                    waitJobsCnt += 1;
                    thisRef.loadMotion(file, motionFilePath, function(motion) {
                        if (motion)
                        {
                            motion.setFadeIn(thisRef.modelSetting.getMotionFadeIn(name, i));
                            motion.setFadeOut(thisRef.modelSetting.getMotionFadeOut(name, i));
                        }

                        var errorPath = (motion)? null: motionFilePath;
                        onJobDone(errorPath);                        
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
        
        var onLoadModelSetting = function(buf)
        {
            // error
            if (!buf)
            {
                callback(modelSettingPath);
                return;
            }
            
            // load model.moc
            mocFilePath = thisRef.modelHomeDir + thisRef.modelSetting.getModelFile();
            thisRef.loadModelData(mocFilePath, onLoadModelMoc);
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
        
        this.currentMotion.name = "";
        this.currentMotion.no = -1;
        this.currentMotion.data = null;
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
        {
            this.currentMotion.name = "";
            this.currentMotion.no = -1;
            this.currentMotion.data = null;
        }
        
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
        
        // look at
        if ((this.dragX !== 0) || (this.dragY !== 0))
        {
            // ドラッグによる顔の向きの調整
            // -30から30の値を加える
            this.live2DModel.addToParamFloat("PARAM_ANGLE_X", this.dragX * 30, 1);   // -30 ~ 30
            this.live2DModel.addToParamFloat("PARAM_ANGLE_Y", this.dragY * 30, 1);   // -30 ~ 30
            this.live2DModel.addToParamFloat("PARAM_ANGLE_Z", (this.dragX * this.dragY) * -30, 1);   // -30 ~ 30
            
            // ドラッグによる体の向きの調整
            // -10から10の値を加える
            this.live2DModel.addToParamFloat("PARAM_BODY_ANGLE_X", this.dragX*10, 1);    // -10 ~ 10
            
            // ドラッグによる目の向きの調整
            // -1から1の値を加える
            this.live2DModel.addToParamFloat("PARAM_EYE_BALL_X", this.dragX, 1);   // -1 ~ 1
            this.live2DModel.addToParamFloat("PARAM_EYE_BALL_Y", this.dragY, 1);   // -1 ~ 1
        }
        // look at 


        // Breathing
        if (this.breathingEnable)
        {
            var timeMSec = UtSystem.getUserTimeMSec() - this.startTimeMSec;
            var timeSec = timeMSec / 1000.0;
            var t = timeSec * 2 * Math.PI; // 2πt
            
            // 呼吸など
            this.live2DModel.addToParamFloat("PARAM_ANGLE_X", 
                                             Number((15 * Math.sin(t / 6.5345))), 0.5);
            this.live2DModel.addToParamFloat("PARAM_ANGLE_Y", 
                                             Number((8 * Math.sin(t / 3.5345))), 0.5);
            this.live2DModel.addToParamFloat("PARAM_ANGLE_Z", 
                                             Number((10 * Math.sin(t / 5.5345))), 0.5);
            this.live2DModel.addToParamFloat("PARAM_BODY_ANGLE_X", 
                                             Number((4 * Math.sin(t / 15.5345))), 0.5);
            this.live2DModel.setParamFloat("PARAM_BREATH", 
                                           Number((0.5 + 0.5 * Math.sin(t / 3.2345))), 1);
                                           
        }
        // Breathing                                       
                                   
    
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
        
        // custom params configure
        var i, cnt=this.customParamsCB.length;
        for(i=0; i<cnt; i++)
        {
            this.customParamsCB[i]();
        }  
        this.customParamsCB.length = 0;
        
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
    
        // all motions had been loaded
        var motion= this.motions[motionName];            
        // フェードイン、フェードアウトの設定
        this.setFadeInFadeOut(name, no, priority, motion);

        this.currentMotion.name = name;
        this.currentMotion.no = no;
        this.currentMotion.data = this.modelSetting.getMotions()[name][no];    
    }
    
    
    LAppModel.prototype.setFadeInFadeOut = function(name, no, priority, motion)
    {
        var motionName = this.modelSetting.getMotionFile(name, no);
        
        motion.setFadeIn(this.modelSetting.getMotionFadeIn(name, no));
        motion.setFadeOut(this.modelSetting.getMotionFadeOut(name, no));
        
        
        if (LAppDefine.DEBUG_LOG)
                console.log("Start motion : " + motionName);
    
        this.mainMotionManager.startMotionPrio(motion, priority);
        // no sound feature in C2 plugin        
    }

    LAppModel.prototype.isMotionFinished = function()
    {
        return this.mainMotionManager.isFinished();
    };
    
    LAppModel.prototype.hasUpdated = function()
    {
        // motion updating is moved to live2D plugin
        var isMotionUpdating = (this.currentMotion.name !== "") && (!this.isMotionFinished());
        
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
            isPosePlaying ||
            this.breathingEnable;
    };    
    
    LAppModel.prototype.getCurrentMotion = function()
    {
        return this.currentMotion;
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
        VIEW_LOGICAL_LEFT : -1,
        VIEW_LOGICAL_RIGHT : 1,
    
        // モーションの優先度定数
        PRIORITY_NONE : 0,
        PRIORITY_IDLE : 1,
        PRIORITY_NORMAL : 2,
        PRIORITY_FORCE : 3,
        
    };
    
    window.LAppModel = LAppModel;
    window.LAppDefine = LAppDefine;
}());