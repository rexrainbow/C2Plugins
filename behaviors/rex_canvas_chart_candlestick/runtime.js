// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_canvas_chart_candlestick = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_canvas_chart_candlestick.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{  
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.options = reset_options();        
        this.options["backgroundcolor"] = this.properties[0];
        this.options["upperbackgroundcolor"] = this.properties[1];
        this.options["upperscalefontcolor"] = this.properties[2];        
        this.options["upperhorizontalscalelinecolor"] = this.properties[3];
        this.options["upperverticalscalelinecolor"] = this.properties[4];  
        this.options["upperindicatorslinecolors"] = [this.properties[5], this.properties[6], this.properties[7], this.properties[8], 
                                                     this.properties[9], this.properties[10], this.properties[11]];
        
        this.options["uppercandlecolor"] = this.properties[12];
        this.options["uppercandlerisecolor"] = this.properties[13];
        this.options["uppercandlefallcolor"] = this.properties[14];
                                                     
        this.options["lowerbackgroundcolor"] = this.properties[15]; 
        this.options["lowerMACDlinecolor"] = this.properties[16];  
        this.options["lowersignallinecolor"] = this.properties[17];  
        this.options["lowerhistogrambinscolor"] = this.properties[18];       
        
        this.options["margintop"] = this.properties[19]; 
        this.options["marginbottom"] = this.properties[20];  
        this.options["marginleft"] = this.properties[21];  
        this.options["marginright"] = this.properties[22];   
        this.options["lowerheight"] = this.properties[23]; 
        this.options["candlewidth"] = this.properties[24];   
        
        this.chart = null;            
	};  

	behinstProto.tick = function ()
	{

	};
	
	var reset_options = function(options)
	{
	    if (options == null)
	    {
	        options = {};	        
	        options["indicators"] = [];
	    }
        
        options["title"] = "";
        options["adjust"] = 0;
        options["indicators"].length = 0;
        
        return options;
	};	

	behinstProto.saveToJSON = function ()
	{
	    return { "opts": this.options,
	           };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
	    this.options = o["opts"];
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.Draw = function(data)
	{
	    if (data === "")  // invalid
	    {
	        var ctx = this.inst.ctx;
	        var canvas = this.inst.canvas;
		    ctx.fillStyle = this.options["backgroundcolor"];
		    ctx.fillRect(0,0,canvas.width, canvas.height);	        
	    }
	    else
	    {
	        if (this.chart === null)  
	            this.chart = new window["Candlestick"](this.inst.ctx);  
	            
	        this.chart["Draw"](data, this.options);	
	    }
	    
	    this.inst.runtime.redraw = true;  
	    this.inst.update_tex = true;
	    	        
	    this.options = reset_options(this.options);           
	}; 
	
	Acts.prototype.SetTitle = function(title)
	{
	    this.options["title"] = title;
	}; 	
	
	var TypeToIndicatorName = ["SMA", "EMA", "MACD"]
	Acts.prototype.AddIndicator = function(type, p0, p1, p2)
	{
	    this.options["indicators"].push([TypeToIndicatorName[type], p0, p1, p2]);
	}; 	
	
	Acts.prototype.SetAdjust = function(adjust)
	{
	    this.options["adjust"] = adjust;
	};
	
	var TYPENAME = ["o", "h", "l", "c", "v"];
	Acts.prototype.AddSMA = function(type, n)
	{
	    this.options["indicators"].push(["SMA", TYPENAME[type], n]);
	};	 	
	Acts.prototype.AddEMA = function(type, n)
	{
	    this.options["indicators"].push(["EMA", TYPENAME[type], n]);
	};	
	Acts.prototype.AddMACD = function(n0, n1, n2)
	{
	    this.options["indicators"].push(["MACD", n0, n1, n2]);
	};		
	//////////////////////////////////////	
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());

