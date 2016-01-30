"use strict";

function avgRGB(img_data)
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

    self.postMessage([avg_r, avg_g, avg_b, avg_a]);    
};

var stop = function ()
{
    self.close();
};

var cmdMap = {
    "start": avgRGB,
    "stop": stop,
}

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