/*!
 * CandleStickChart.js
 * Copyright 2013 Ami Heines
 * Released under the MIT license
 */
 
(function ()
{    
    // utility finctions
    var Max = function (arr)
    {
        return Math.max.apply( Math, arr );
    };
    
    var Min = function (arr)
    {
        return Math.min.apply( Math, arr );
    };
    
    var SMA = function ( arr, smaLength )
    {
        arr.reverse(); // easier on my limited brain to think of the array in the "proper" order
        var sma = new Array();
        var i, cnt;
        cnt = smaLength-1
        for (i=0; i<cnt; i++)
        {
            sma[i] = NaN;
        }
        sma[smaLength-1] = arr.slice(0,smaLength).reduce(function(a, b) { return a + b }) / smaLength;
        cnt = arr.length
        for(i=smaLength; i<cnt; i++)
        {
            sma[i] = sma[i-1] + (arr[i] - arr[i-smaLength]) / smaLength;
        }
        sma.reverse();// reverse back for main consumption
        arr.reverse();// reverse back
        return sma;
    };

    var EMA = function ( originalArray, emaLength )
    {
        var arr = originalArray.slice().reverse(); // easier on my limited brain to think of the array in the "proper" order
        // trim initial NaN values
        var iPos = 0, cnt=arr.length;
        for(iPos=0; iPos<cnt && isNaN(arr[iPos]); iPos++) {}
        arr = arr.slice(iPos);// trim initial NaN values from array
        var ema = new Array();
        var k = 2/(emaLength+1);
        var i, cnt = emaLength-1;
        for (var i=0; i<cnt; i++)
        {
            ema[i] = NaN;
        }
        ema[emaLength-1] = arr.slice(0,emaLength).reduce(function(a, b) { return a + b }) / emaLength;
        cnt = arr.length;
        for(i=emaLength; i<cnt; i++)
        {
            ema[i] = arr[i]*k + ema[i-1]*(1-k);
        }
        ema.reverse();// reverse back for main consumption
        for (i=0; i<iPos; i++)
        {
            ema.push(NaN);
        }
        return ema;
    };

    var MACD = function (arr, i12, i26, i9)
    {
        var ema12 = EMA(arr, i12);
        var ema26 = EMA(arr, i26);
        var macd = [];
        var i, cnt=ema12.length;
        for(i=0; i<cnt; i++)
        { 
            macd.push(ema12[i]-ema26[i]); 
        }
        var signal = EMA(macd, i9);
        var histogram = [];
        cnt=macd.length;
        for( i=0; i<cnt; i++)
        {
            histogram.push(macd[i]-signal[i]); 
        }
        return { macd: macd, signal: signal, histogram: histogram };
    };

    var convertYahooFinanceCsvToCandles = function (rawData, options) 
    {
        var adjust = (options.adjust == null)? 0: options.adjust;
            
        var allTextLines = rawData.split(/\r\n|\n/);
        //allTextLines.pop();// remove last element which is empty due to the last /n at the end of the last line
        allTextLines.shift();// remove first line - the headers of the array
        
        if (!isNaN(options.offset))
            allTextLines = allTextLines.slice(options.offset);
            
        var d=[], o=[], h=[], l=[], c=[], v=[];

        var i, cnt=allTextLines.length;
        for(i=0; i<cnt; i++)
        {
            var entries = allTextLines[i].split(',');
            if (entries.length < 7) continue;          // skip invalid line
            d.push(new Date(entries[0]));
            var oo = entries[1]
              , hh = entries[2]
              , ll = entries[3]
              , cc = entries[4]
              , vv = entries[5]
              , adjC = entries[6];
            var ratio;
            if(adjust===0)
            {
                ratio = 1;
            }
            else if(adjust===1)
            {
                ratio = adjC / cc;
            }
            else if(adjust===2)
            {
                ratio = adjC / cc;
            }
            o.push(Number((oo*ratio).toFixed(2)));
            h.push(Number((hh*ratio).toFixed(2)));
            l.push(Number((ll*ratio).toFixed(2)));
            c.push(Number((cc*ratio).toFixed(2)));
            v.push(Number((vv/ratio).toFixed(0)));
        }
        return { d:d, o:o, h:h, l:l, c:c, v:v };
    };    

    var getColor = function (j, colors)
    {
        if (colors == null)
            colors = ['coral','crimson','darkblue','chocolate','chartreuse','blueviolet','darksalmon'];

        return colors[j % colors.length];
    };
    
    var scale = function (ll, hh, height, marginTop, marginBottom, y)
    {
        return marginTop+(height-marginTop-marginBottom)*(1 - (y-ll)/(hh-ll));
    }; 
    
    // add format to strings -- from http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436
    if (!String.prototype.format) 
    {
        String.prototype.format = function() 
        {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) { 
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        };
    }       

    var Candlestick = function(context)
    {
	    //Variables global to the chart
	    var width = context.canvas.width;
	    var height = context.canvas.height;

	    // it might change the size of context 
	    //High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
	    if (!context["C2RexIsScaled"] && window.devicePixelRatio) 
	    {
		    context.canvas.style.width = width + "px";
		    context.canvas.style.height = height + "px";
		    context.canvas.height = height * window.devicePixelRatio;
		    context.canvas.width = width * window.devicePixelRatio;
		    context.scale(window.devicePixelRatio, window.devicePixelRatio);
		    context["C2RexIsScaled"] = true;
	    }

        this.context = context;
	    //Variables global to the chart
	    this.canvas_owidth = width;
	    this.canvas_oheight = height;
	    
    };
    var CandlestickProto = Candlestick.prototype;
     
    CandlestickProto.Draw = function(rawData, options)
    {
        var context = this.context;
        var oCandle = convertYahooFinanceCsvToCandles(rawData, options);
        var d = oCandle.d,
            o = oCandle.o,
            h = oCandle.h,
            l = oCandle.l,
            c = oCandle.c,
            v = oCandle.v;
          
        // calculate the indicators
        var upperIndicators = new Array();
        var lowerIndicator = {}, item;
        for (var key in options.indicators)
        {
            var indicator = options.indicators[key];
            if (indicator[0]==='SMA')
            {
                item = {arr:SMA(oCandle[indicator[1]], indicator[2]),
                        label: 'SMA('+indicator[1]+','+indicator[2]+')'
                       };
                upperIndicators.push(item);
            }
            else if (indicator[0]==='EMA')
            {
                item = {arr:EMA(oCandle[indicator[1]], indicator[2]),
                        label: 'EMA('+indicator[1]+','+indicator[2]+')'
                       };
                upperIndicators.push(item);
            }
            else if (indicator[0]==='MACD')
            {
                lowerIndicator.label = 'MACD({0},{1},{2})'.format(indicator[1], indicator[2], indicator[3]);
                lowerIndicator.data  = MACD(oCandle.c, indicator[1], indicator[2], indicator[3]);
            }
        }
        // calculate the indicators        
            
       
        var pixelsPerCandle = options.candlewidth? options.candlewidth:4;
        var marginTop = options.margintop? options.margintop:8;
        var marginBottom = options.lowerheight? options.lowerheight:200;
        var marginLeft = options.marginleft? options.marginleft:5;
        var marginRight = options.marginright? options.marginright:23;
        
	    var width = this.canvas_owidth;
	    var height = this.canvas_oheight; 
        // find highest high in candles that will be drawn and add margin
        var hh = Max(h.slice(0,Math.min(h.length, (width-marginLeft-marginRight) / pixelsPerCandle))); 
        var ll = Min(l.slice(0,Math.min(l.length, (width-marginLeft-marginRight) / pixelsPerCandle)));	    
        // improve hh, ll
        var range = hh-ll;
        var step = 1;
        while (range/step > 16)
        {
            if (step<4) 
            {
                step++;
            }
            else if (step<9)
            {
                step +=2;
            }
            else if (step<30)
            {
                step +=5;
            }
            else
            {
                step +=10;
            }
            //console.log('    step [1] '+step);
        }
        // now that we have the step, find ll and hh which are round and near.
        ll = step * Math.floor(ll/step);
        hh = step * Math.ceil(hh/step);

        var drawLine = function(i0,v0,i1,v1,style,linewidth)
        {
            var y0 = scale(ll,hh,height,marginTop,marginBottom,v0);
            var y1 = scale(ll,hh,height,marginTop,marginBottom,v1);
            var x0 = (width-marginRight) - (i0+1)*pixelsPerCandle + 1;
            var x1 = (width-marginRight) - (i1+1)*pixelsPerCandle + 1;
            context.beginPath();
            context.moveTo(x0,y0);
            context.lineTo(x1,y1);
            context.strokeStyle = style;
            context.lineWidth = linewidth;
            context.stroke();
       }
        
        // draw upperIndicator
        if (!lowerIndicator.data)  // no lowIndicator
            marginBottom = options.marginbottom? options.marginbottom:20;
            
        context.fillStyle = options.backgroundcolor? options.backgroundcolor:"rgb(240,240,220)";//pale yellow
        context.fillRect(0,0,width-1,height-1);
        context.fillStyle = options.upperbackgroundcolor? options.upperbackgroundcolor:"rgb(250,250,200)";//pale yellow  
        context.fillRect  (marginLeft,marginTop,width-marginLeft-marginRight,height-marginTop-marginBottom);
        //context.strokeRect(0,0,width-1,height-1);// just for fun, frame the whole canvas
        // Y coordinate - prices ticks
        for (var i=ll; i<=hh; i+=step)
        {
            var y0 = scale(ll,hh,height,marginTop,marginBottom, i);
            context.moveTo(marginLeft, y0);
            context.lineTo(width-marginRight, y0);
            context.textBaseline = 'middle';
            context.fillStyle = options.upperscalefontcolor? options.upperscalefontcolor:'black';
            context.fillText(i, width-marginRight+2, y0);
        }
        context.strokeStyle = options.upperhorizontalscalelinecolor? options.upperhorizontalscalelinecolor:'rgb(200,200,150)';
        context.stroke();
        // X coordinate - month ticks (for weekly charts, for daily chart use 3 letter for each month)
        context.beginPath();
        var y0 = scale(ll,hh,height, marginTop,marginBottom, ll);
        var y1 = scale(ll,hh,height, marginTop,marginBottom, hh);
        for (var i=0; i<d.length-1 && i<(width-marginLeft-marginRight-pixelsPerCandle)/pixelsPerCandle; i++)
        {
            if (d[i].getMonth()!=d[i+1].getMonth())
            {
                var x0 = (width-marginRight) - (i+1)*pixelsPerCandle -1;
                context.moveTo(x0, y0);
                context.lineTo(x0, y1);
                mm = ['J','F','M','A','M','J','J','A','S','O','N','D'][d[i].getMonth()];
                if (d[i].getMonth()==0) 
                {
                    mm = (''+d[i].getFullYear()).substr(2,2);
                }
                context.textBaseline = 'top';
                var metrics = context.measureText(mm);
                context.fillText(mm, x0-metrics.width/2, y0);
            }
        }
        context.strokeStyle = options.upperverticalscalelinecolor? options.upperverticalscalelinecolor:'rgb(200,200,150)';
        context.stroke();
        // draw the upperIndicators, SMA and EMA arrays
        var leftPos = marginLeft+5;
        context.fillStyle = 'black';
        context.font = "bold 16px sans-serif";
        context.fillText(options.title, leftPos, marginTop + 1);
        var metrics = context.measureText(options.title);
        leftPos += metrics.width + 5;
        for (var j=0; j<upperIndicators.length; j++)
        {
            var upperIndicator = upperIndicators[j];
            var yPrev = scale(ll,hh,height, marginTop, marginBottom, upperIndicator.arr[0]),
                x0  = (width-marginRight) - pixelsPerCandle;
            context.beginPath();// the upperIndicators line
            context.moveTo(x0 + 1, yPrev);
            for (var i=1; i<c.length && i<(width-marginLeft-marginRight-pixelsPerCandle)/pixelsPerCandle; i++)
            {
                var yCurr = scale(ll,hh,height, marginTop,marginBottom, upperIndicator.arr[i]);
                x0 = (width-marginRight) - (i+1)*pixelsPerCandle;
                context.lineTo(x0 + 1, yCurr);
            }
            context.strokeStyle = getColor(j);
            context.fillStyle = getColor(j);
            context.fillText(upperIndicator.label, leftPos, marginTop + 1);
            context.stroke();
            var metrics = context.measureText(upperIndicator.label);
            leftPos += metrics.width + 5;
        }
        // draw upperIndicator
        
        // draw lowerIndicator    
        if (lowerIndicator.data)
        {        
            // draw the lowerIndocator, MACD    
            context.font = "bold 12px sans-serif";
            // draw the background of the MACD chart
            context.fillStyle = options.lowerbackgroundcolor? options.lowerbackgroundcolor:"rgba(200,250,200, .5)";
            var liMarginTop = height-marginBottom+10;// li===LowerIndicator
            var liMarginBottom = options.marginbottom? options.marginbottom:10;
            context.fillRect  (marginLeft, liMarginTop, width-marginLeft-marginRight, marginBottom-20);
            // find out the highest high and lowest low of the MACD sub chart    
            var li = lowerIndicator.data; 
            var lihh = Max(li.macd.slice(0,Math.min(li.macd.length, (width-marginLeft-marginRight) / pixelsPerCandle))); // find highest high in MACD
            var lill = Min(li.macd.slice(0,Math.min(li.macd.length, (width-marginLeft-marginRight) / pixelsPerCandle)));
            // the MACD line
            var yPrev = scale(lill,lihh,height, liMarginTop, liMarginBottom, li.macd[0]),
                x0  = (width-marginRight) - pixelsPerCandle;
            context.beginPath();
            context.moveTo(x0 + 1, yPrev);
            for (var i=1; i<li.macd.length && i<(width-marginLeft-marginRight-pixelsPerCandle)/pixelsPerCandle; i++)
            {
                var yCurr = scale(lill,lihh,height, liMarginTop,liMarginBottom, li.macd[i]);
                x0 = (width-marginRight) - (i+1)*pixelsPerCandle;
                context.lineTo(x0 + 1, yCurr);
            }
            context.strokeStyle = options.lowerMACDlinecolor? options.lowerMACDlinecolor:'black';
            context.fillStyle = options.lowerMACDlinecolor? options.lowerMACDlinecolor:'black';
            leftPos = marginLeft+5;
            context.fillText(lowerIndicator.label, leftPos, liMarginTop + 5);
            metrics = context.measureText(lowerIndicator.label);
            leftPos += metrics.width + 5;
            context.stroke();
            // the signal line
            var yPrev = scale(lill,lihh,height, liMarginTop, liMarginBottom, li.signal[0]),
                x0  = (width-marginRight) - pixelsPerCandle;
            context.beginPath();
            context.moveTo(x0 + 1, yPrev);
            for (var i=1; i<li.signal.length && i<(width-marginLeft-marginRight-pixelsPerCandle)/pixelsPerCandle; i++)
            {
                var yCurr = scale(lill,lihh,height, liMarginTop,liMarginBottom, li.signal[i]);
                x0 = (width-marginRight) - (i+1)*pixelsPerCandle;
                context.lineTo(x0 + 1, yCurr);
            }
            context.strokeStyle = options.lowersignallinecolor? options.lowersignallinecolor:'red';
            context.fillStyle = options.lowersignallinecolor? options.lowersignallinecolor:'red';
            context.fillText('Signal', leftPos, liMarginTop + 5);
            metrics = context.measureText('Signal');
            leftPos += metrics.width + 5;
            context.stroke();
            // the histogram
            context.beginPath();
            var y0 = scale(lill,lihh,height, liMarginTop, liMarginBottom, 0)
            for (var i=0; i<li.histogram.length && i<(width-marginLeft-marginRight-pixelsPerCandle)/pixelsPerCandle; i++)
            {
                var yCurr = scale(lill,lihh,height, liMarginTop,liMarginBottom, li.histogram[i]);
                x0 = (width-marginRight) - (i+1)*pixelsPerCandle;
                context.moveTo(x0 + 1, y0);
                context.lineTo(x0 + 1, yCurr);
            }
    
            context.strokeStyle = options.lowerhistogrambinscolor? options.lowerhistogrambinscolor:'blue';
            context.fillStyle = options.lowerhistogrambinscolor? options.lowerhistogrambinscolor:'blue';
            context.fillText('Histogram', leftPos, liMarginTop + 5);
            context.stroke();
            // END OF draw the lowerIndocator, MACD
      
        }
        // draw lowerIndicator          

        // the candles themselves
        for (var i=0; i<c.length && i<(width-marginLeft-marginRight-pixelsPerCandle)/pixelsPerCandle; i++)
        {
            var yo = scale(ll,hh,height, marginTop,marginBottom, o[i]),
                yh = scale(ll,hh,height, marginTop,marginBottom, h[i]),
                yl = scale(ll,hh,height, marginTop,marginBottom, l[i]),
                yc = scale(ll,hh,height, marginTop,marginBottom, c[i]),
                x0 = (width-marginRight) - (i+1)*pixelsPerCandle;
            context.beginPath();//body of the candle
            context.moveTo(x0 + 1, Math.min(yo,yc));
            context.lineTo(x0 + 1, Math.max(yo,yc));
    
            if (o[i]<c[i])
                context.strokeStyle = options.uppercandlefallcolor? options.uppercandlefallcolor:'lightgreen';
            else
                context.strokeStyle = options.uppercandlerisecolor? options.uppercandlerisecolor:'red';
      
            if(o[i]>c[i])            
                context.stroke();

            // draw the line around the candle
            context.beginPath();
            context.moveTo(x0 + 1, yl);//lower wick
            context.lineTo(x0 + 1, Math.max(yo,yc));
            context.moveTo(x0 + 1, yh);//higher wick
            context.lineTo(x0 + 1, Math.min(yo,yc));
            context.moveTo(x0, yo);//box around the candle's body
            context.lineTo(x0, yc);
            context.lineTo(x0 + 2, yc);
            context.lineTo(x0 + 2, yo);
            context.lineTo(x0, yo);
            context.strokeStyle = options.uppercandlecolor? options.uppercandlecolor:'black';
            context.stroke();
        }
                
    };

    window.Candlestick = Candlestick;
}());