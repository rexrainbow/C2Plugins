"use strict";

(function ()
{
	var workersSupported = (typeof Worker !== "undefined");
	var isInWebWorker = (typeof document === "undefined");		// no DOM in a worker
	
// called from plugin
    if (!isInWebWorker)
    {
        var FloodFill = function()
        {
            this.worker = null;
            this.is_processing = false;
        };
        var FloodFillProto = FloodFill.prototype;
        
        FloodFillProto.Start = function (img_data, callback)
	    {        	       
            if (workersSupported)
            {
                this.worker = new Worker("floodfill.js");                
                var self = this;
                var on_complete = function (e)
                {
                    self.is_processing = false;
                    callback(e.data);	            
                };
                var on_error = function (e)
                {
                    console.error(e);
                };
                this.worker.addEventListener("message", on_complete, false);
                this.worker.addEventListener("error", on_error, false);
                
                this.is_processing = true;
                var args = ["start", img_data];
                this.worker.postMessage(args);  
            }
            else
            {
                callback(floodFill_main(img_data));
            }
	    };
	    
	    FloodFillProto.Stop = function ()
	    {
            if (workersSupported)
            {
                if (this.worker)
                {
                    this.is_processing = false;
                    this.worker.terminate();
                }
            }
	    };
	    	    	        	    
	    FloodFillProto.IsProcessing = function ()
	    {
            return this.is_processing;
	    };

        window["FloodFill"] = FloodFill;        
    }
// called from plugin 

// webworker    
    if (isInWebWorker)
    {
        var start = function (img_data)
        {
            var result = floodFill_main(img_data);
            self.postMessage(result); 
        };

        var stop = function ()
        {
            self.close();
        };

        var cmdMap = {
            "start": start,
            "stop": stop,
        };

        var runCommand = function (e)
        {
            var cmd = e.data;
	        var cmdFunction = cmdMap[cmd[0]];
	        if (cmdFunction == null)
	            return;
	
	        cmd.shift();
	        cmdFunction.apply(null, cmd);	
        };
        
        self.addEventListener("message", runCommand, false);
    }
// webworker    

// body	
	if (!workersSupported || isInWebWorker)
	{
        var floodFill_main = function (img_data)
        {
            return [avg_r, avg_g, avg_b, avg_a];    
        };
               
    }
    
    // https://github.com/binarymax/floodfill.js    
    var floodfill=(function(){function f(p,v,u,l,t,g,B){var k=p.length;var q=[];var o=(v+u*g)*4;var r=o,z=o,s,A,n=g*4;var h=[p[o],p[o+1],p[o+2],p[o+3]];if(!a(o,h,l,p,k,t)){return false}q.push(o);while(q.length){o=q.pop();if(e(o,h,l,p,k,t)){r=o;z=o;A=parseInt(o/n)*n;s=A+n;while(A<z&&A<(z-=4)&&e(z,h,l,p,k,t)){}while(s>r&&s>(r+=4)&&e(r,h,l,p,k,t)){}for(var m=z;m<r;m+=4){if(m-n>=0&&a(m-n,h,l,p,k,t)){q.push(m-n)}if(m+n<k&&a(m+n,h,l,p,k,t)){q.push(m+n)}}}}return p}function a(j,l,h,m,k,g){if(j<0||j>=k){return false}if(m[j+3]===0&&h.a>0){return true}if(Math.abs(l[3]-h.a)<=g&&Math.abs(l[0]-h.r)<=g&&Math.abs(l[1]-h.g)<=g&&Math.abs(l[2]-h.b)<=g){return false}if((l[3]===m[j+3])&&(l[0]===m[j])&&(l[1]===m[j+1])&&(l[2]===m[j+2])){return true}if(Math.abs(l[3]-m[j+3])<=(255-g)&&Math.abs(l[0]-m[j])<=g&&Math.abs(l[1]-m[j+1])<=g&&Math.abs(l[2]-m[j+2])<=g){return true}return false}function e(j,l,h,m,k,g){if(a(j,l,h,m,k,g)){m[j]=h.r;m[j+1]=h.g;m[j+2]=h.b;m[j+3]=h.a;return true}return false}function b(j,n,m,i,k,g,o){if(!j instanceof Uint8ClampedArray){throw new Error("data must be an instance of Uint8ClampedArray")}if(isNaN(g)||g<1){throw new Error("argument 'width' must be a positive integer")}if(isNaN(o)||o<1){throw new Error("argument 'height' must be a positive integer")}if(isNaN(n)||n<0){throw new Error("argument 'x' must be a positive integer")}if(isNaN(m)||m<0){throw new Error("argument 'y' must be a positive integer")}if(g*o*4!==j.length){throw new Error("width and height do not fit Uint8ClampedArray dimensions")}var l=Math.floor(n);var h=Math.floor(m);if(l!==n){console.warn("x truncated from",n,"to",l)}if(h!==m){console.warn("y truncated from",m,"to",h)}k=(!isNaN(k))?Math.min(Math.abs(Math.round(k)),254):0;return f(j,l,h,i,k,g,o)}var d=function(l){var h=document.createElement("div");var g={r:0,g:0,b:0,a:0};h.style.color=l;h.style.display="none";document.body.appendChild(h);var i=window.getComputedStyle(h,null).color;document.body.removeChild(h);var k=/([\.\d]+)/g;var j=i.match(k);if(j&&j.length>2){g.r=parseInt(j[0])||0;g.g=parseInt(j[1])||0;g.b=parseInt(j[2])||0;g.a=Math.round((parseFloat(j[3])||1)*255)}return g};function c(p,n,m,i,o,q,g){var s=this;var k=d(this.fillStyle);i=(isNaN(i))?0:i;o=(isNaN(o))?0:o;q=(!isNaN(q)&&q)?Math.min(Math.abs(q),s.canvas.width):s.canvas.width;g=(!isNaN(g)&&g)?Math.min(Math.abs(g),s.canvas.height):s.canvas.height;var j=s.getImageData(i,o,q,g);var l=j.data;var h=j.width;var r=j.height;if(h>0&&r>0){b(l,p,n,k,m,h,r);s.putImageData(j,i,o)}}if(typeof CanvasRenderingContext2D==="function"){CanvasRenderingContext2D.prototype.fillFlood=c}return b})();    
// body	                     	    
}());