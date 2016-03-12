"use strict";

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */
(function ()
{
  
    function MatrixStack() {}
    
    // 行列スタック。4x4行列を基本とするので、16ごとの区切りの配列。
    MatrixStack.matrixStack = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    
    // 現在のスタックの深さ。初期は0でpushするごとに+1。
    MatrixStack.depth = 0;
    
    // 現在の行列
    MatrixStack.currentMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    
    // 計算用
    MatrixStack.tmp = new Array(16);
    
    
    /*
     * スタックをリセット
     */
    MatrixStack.reset = function()
    {
        this.depth = 0;
    }
    		
    		
    /*
     * 単位行列にする
     */
    MatrixStack.loadIdentity = function()
    {
        for (var i = 0; i < 16; i++)
        {
            this.currentMatrix[i] = (i % 5 == 0) ? 1 : 0;
        }
    }
    		
    		
    /*
     * 現在の行列を保存
     */
    MatrixStack.push = function()
    {    
        var offset = this.depth * 16;
        var nextOffset = (this.depth + 1) * 16;
        
        if (this.matrixStack.length < nextOffset + 16)
        {
            this.matrixStack.length = nextOffset + 16;
        }
    
        for (var i = 0; i < 16; i++)
        {
            this.matrixStack[nextOffset + i] = this.currentMatrix[i];
        }
    
        this.depth++;
    }
    		
    		
    /*
     * 一つ前の行列へ
     */
    MatrixStack.pop = function()
    {
        this.depth--;
        if (this.depth < 0)
        {
            myError("Invalid matrix stack.");
            this.depth = 0;
        }
    
        var offset = this.depth * 16;
        for (var i = 0; i < 16; i++)
        {
            this.currentMatrix[i] = this.matrixStack[offset + i];
        }
    }
    		
    		
    /*
     * 現在の行列を取得
     */
    MatrixStack.getMatrix = function()
    {
        return this.currentMatrix;
    }
    		
    		
    /*
     * 行列を掛け合わせる
     */
    MatrixStack.multMatrix = function(matNew)
    {
        var i, j, k;
    
        for (i = 0; i < 16; i++)
        {
            this.tmp[i] = 0;
        }
    
        for (i = 0; i < 4; i++)
        {
            for (j = 0; j < 4; j++)
            {
                for (k = 0; k < 4; k++)
                {
                    this.tmp[i + j * 4] += this.currentMatrix[i + k * 4] * matNew[k + j * 4];
                }
            }
        }
        for (i = 0; i < 16; i++)
        {
            this.currentMatrix[i] = this.tmp[i];
        }
    }

    window.MatrixStack = MatrixStack;
}());