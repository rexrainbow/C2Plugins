// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Canvas_rgbaBin = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Canvas_rgbaBin.prototype;
		
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
        this.bin_width = this.properties[0];
        this.set_process_mode(this.properties[1]);
        
        // multi-tick
	    this.processing_time = percentage2time(this.properties[2]);
		this.is_tick_running = false;                
	    this.img_data = null;
		this.curi = 0;
		this.endi = 0;
        this.pixel_cnt = 0;        

        this.exp_CurBinIndex = 0;
        this.exp_CurBinValue = 0;        
        
        // webworker
        this.worker = null;  
        this.is_webworker_running = false;
		
	    this.binR = [];
		this.binG = [];
		this.binB = [];
		this.binA = [];
	};  
    
	behinstProto.set_process_mode = function (m)
	{
        this.process_mode = m;
        // webworker does not support, use multi-tick mode
        if ((this.process_mode == 2) && (typeof Worker === "undefined"))
            this.process_mode = 1;
	};
    	
	behinstProto.tick = function ()
	{
	    if (this.is_tick_running)		
            this.tick_process();
	};
    
	behinstProto.tick_process = function ()
	{
        var start_time = Date.now();
        while ((Date.now() - start_time) <= this.processing_time)
        {
            this.is_tick_running = this.processing();
            if (!this.is_tick_running)
			{
			    this.on_finished();
                break;
		    }
        }			
	};    

    var binArr = function (arr, bin_count)
    {
        arr.length = bin_count;
        for (var i=0; i<bin_count; i++)
            arr[i] = 0;        
    };
    
	behinstProto.on_start = function ()
	{
        var canvas = this.inst.canvas;
        this.img_data = this.inst.ctx.getImageData(0,0, canvas.width, canvas.height).data;
        var bin_count = Math.floor(256/this.bin_width);
        binArr(this.binR, bin_count);
	    binArr(this.binG, bin_count);
        binArr(this.binB, bin_count);
	    binArr(this.binA, bin_count);
        
		this.curi = 0;
		this.endi = canvas.width*canvas.height*4;	
        this.pixel_cnt = 0;
		this.is_tick_running = true;
	};	
	
	behinstProto.processing = function ()
	{
        if ( this.img_data[this.curi+3] != 0)
        {
            this.binR[ Math.floor(this.img_data[this.curi  ]/this.bin_width) ] += 1;
            this.binG[ Math.floor(this.img_data[this.curi+1]/this.bin_width) ] += 1;
            this.binB[ Math.floor(this.img_data[this.curi+2]/this.bin_width) ] += 1;
            this.binA[ Math.floor(this.img_data[this.curi+3]/this.bin_width) ] += 1;       
            this.pixel_cnt ++;
        }        
		
		this.curi += 4;
		return (this.curi < this.endi);
	};	
	
	behinstProto.on_finished = function ()
	{	
        var bin_count = Math.ceil(256/this.bin_width);
        
        if (this.pixel_cnt > 0)
        {
            for (var i=0; i<bin_count; i++)
            {
                this.binR[ i ] /= this.pixel_cnt;
                this.binG[ i ] /= this.pixel_cnt;
                this.binB[ i ] /= this.pixel_cnt;
                this.binA[ i ] /= this.pixel_cnt;        
            }
        }        
		this.img_data = null;
		this.runtime.trigger(cr.behaviors.Rex_Canvas_rgbaBin.prototype.cnds.OnFinished, this.inst);		
	};

	var percentage2time = function (percentage)
    {
	    if (percentage < 0.01)
		    percentage = 0.01;
	    return (1/60)*1000*percentage;
    };
    
	behinstProto.one_tick_process = function ()
	{
	    this.on_start();
        while (this.is_tick_running)        
            this.is_tick_running = this.processing();
                
        this.on_finished();
	};
    
	behinstProto.start_webworker = function ()
	{
        this.is_webworker_running = true;
        if (!this.worker)
            this.worker = new Worker("rgbaBin.js");
        
        var self = this;
        var on_complete = function (e)
        {
            self.is_webworker_running = true;
            var bins = e.data;
		    self.binR = bins[0];
		    self.binG = bins[1];
		    self.binB = bins[2];
		    self.binA = bins[3];
            self.runtime.trigger(cr.behaviors.Rex_Canvas_rgbaBin.prototype.cnds.OnFinished, self.inst);		            
        };
        this.worker.addEventListener("message", on_complete, false); 
        
        var canvas = this.inst.canvas;
        var img_data = this.inst.ctx.getImageData(0,0, canvas.width, canvas.height).data;
        this.worker.postMessage(["start", img_data, this.bin_width]);        
	};
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	Cnds.prototype.OnFinished = function ()
	{
		return true;
	};
	
	Cnds.prototype.IsProcessing = function ()
	{
		return this.is_tick_running || this.is_webworker_running;
	};	
    
	Cnds.prototype.ForEachBin = function (bin_typs)
	{        
	    var bins = (bin_typs==0)? this.binR:
                   (bin_typs==1)? this.binG:
                   (bin_typs==2)? this.binB:
                                  this.binA;
                   

        // retriving result
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i, cnt=bins.length;
		for (i=0; i<cnt; i++)
		{
            if (solModifierAfterCnds)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurBinIndex = i;
            this.exp_CurBinValue = bins[i];
            current_event.retrigger();
            
		    if (solModifierAfterCnds)
		    {
		        this.runtime.popSol(current_event.solModifiers);
		    }            
		}
     		
		return false;	    
	};      
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	Acts.prototype.Start = function ()
	{	
        if (this.process_mode == 0)
            this.one_tick_process();
        else if (this.process_mode == 1)
	        this.on_start();		
        else if (this.process_mode == 2)
            this.start_webworker();           
	};
	
	Acts.prototype.Stop = function ()
	{
        if (this.is_tick_running)
	        this.is_tick_running = false;		
        else if (this.is_webworker_running)
        {
            this.worker.postMessage(["stop"]); 
            this.is_webworker_running = false;
        }
	};
	
	Acts.prototype.SetProcessingMode = function(m)
	{
        this.set_process_mode(m);
	};	
	Acts.prototype.SetProcessingTime = function(percentage)
	{
        this.processing_time = percentage2time(percentage);
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.BinsCount = function (ret)
	{
		ret.set_int(Math.floor(256/this.bin_width));
	};
	Exps.prototype.CurBinIndex = function (ret)
	{
		ret.set_int(this.exp_CurBinIndex);
	};
	Exps.prototype.CurBinValue = function (ret)
	{
		ret.set_float(this.exp_CurBinValue);
	};		
}());