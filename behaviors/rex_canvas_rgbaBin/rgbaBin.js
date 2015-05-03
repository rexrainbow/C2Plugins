"use strict";

var binArr = function (bin_count)
{
    var arr = [];
    arr.length = bin_count;
    for (var i=0; i<bin_count; i++)
        arr[i] = 0;
        
    return arr;
};

var rgbaBins = function(img_data, bin_width)
{
    var bin_count = Math.floor(256/bin_width);
    var binR = binArr(bin_count);
    var binG = binArr(bin_count);
    var binB = binArr(bin_count);
    var binA = binArr(bin_count);
    var pixel_cnt = 0;

    var i, cnt = img_data.length;	
    for (i=0; i<cnt; i=i+4)
    {
        if (img_data[i+3] == 0)
            continue;
            
        binR[ Math.floor(img_data[i  ]/bin_width) ] += 1;
        binG[ Math.floor(img_data[i+1]/bin_width) ] += 1;
        binB[ Math.floor(img_data[i+2]/bin_width) ] += 1;
        binA[ Math.floor(img_data[i+3]/bin_width) ] += 1;                 
        pixel_cnt ++;
    }
    
    if (pixel_cnt > 0)
    {
        for (i=0; i<bin_count; i++)
        {
            binR[ i ] /= pixel_cnt;
            binG[ i ] /= pixel_cnt;
            binB[ i ] /= pixel_cnt;
            binA[ i ] /= pixel_cnt;        
        }
    }
    
    self.postMessage([binR, binG, binB, binA]);    
};

var stop = function ()
{
    self.close();
};

var cmdMap = {
    "start": rgbaBins,
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