"use strict";

(function ()
{
	var workersSupported = (typeof Worker !== "undefined");
	var isInWebWorker = (typeof document === "undefined");		// no DOM in a worker
	
// called from plugin
    if (!isInWebWorker)
    {
        var CalcAvgRGB = function()
        {
            this.worker = null;
            this.is_processing = false;
        };
        var CalcAvgRGBProto = CalcAvgRGB.prototype;
        
        CalcAvgRGBProto.Start = function (img_data, callback)
	    {        	       
            if (workersSupported)
            {
                this.worker = new Worker("avgRGB.js");                
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
                callback(avgRGB_main(img_data));
            }
	    };
	    
	    CalcAvgRGBProto.Stop = function ()
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
	    	    	        	    
	    CalcAvgRGBProto.IsProcessing = function ()
	    {
            return this.is_processing;
	    };

        window["CalcAvgRGB"] = CalcAvgRGB;        
    }
// called from plugin 

// webworker    
    if (isInWebWorker)
    {
        var start = function (img_data)
        {
            var result = avgRGB_main(img_data);
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
        var avgRGB_main = function (img_data)
        {
        	var avg_r = 0;
        	var avg_g = 0;
        	var avg_b = 0;
        	var avg_a = 0;
            var pixel_cnt = 0;
            
            var i, cnt = img_data.length;	
            for (i=0; i<cnt; i=i+4)
            {
                if (img_data[i+3] == 0)
                    continue;
                    
                avg_r += img_data[i];
                avg_g += img_data[i+1];  
                avg_b += img_data[i+2];
                avg_a += img_data[i+3];
                pixel_cnt ++;        
            }
        
            if (pixel_cnt > 0)
            {
                avg_r = avg_r / pixel_cnt;
                avg_g = avg_g / pixel_cnt;    
                avg_b = avg_b / pixel_cnt;
                avg_a = avg_a / pixel_cnt;      
            }
        
            return [avg_r, avg_g, avg_b, avg_a];    
        };
    }
// body	                     	    
}());