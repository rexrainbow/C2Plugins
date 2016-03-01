// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_htmlElem_fullwindow = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_htmlElem_fullwindow.prototype;
		
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
		if (this.runtime.isDomFree)
			return;
        
        this.init_full_window = (this.properties[0] === 1);
        this.beforefullwindow = {"x":null, "y":null, "w":null, "h":null, "b":null};
        this.isInFullScreen = false;
            
        // override
        var inst = this.inst;    
		inst.lastLeft = null;
		inst.lastTop = null;
		inst.lastRight = null;
		inst.lastBottom = null;
		inst.lastWinWidth = null;
		inst.lastWinHeight = null; 
        inst.element_hidden = false;        

        inst.updatePosition = this.updatePosition;     
	};
	
	behinstProto.tick = function()
	{     
	    if (this.init_full_window)
	    {
	        this.set_full_window(1);
	        this.init_full_window = false;
	    }
	};
    
    // override
	behinstProto.updatePosition = function (first)
	{
        var inst = this;
		if (this.runtime.isDomFree)
			return;
		
		var left = inst.layer.layerToCanvas(inst.x, inst.y, true);
		var top = inst.layer.layerToCanvas(inst.x, inst.y, false);
		var right = inst.layer.layerToCanvas(inst.x + inst.width, inst.y + inst.height, true);
		var bottom = inst.layer.layerToCanvas(inst.x + inst.width, inst.y + inst.height, false);
		
		var rightEdge = this.runtime.width / this.runtime.devicePixelRatio;
		var bottomEdge = this.runtime.height / this.runtime.devicePixelRatio;
		
		// Is entirely offscreen or invisible: hide
		if (!inst.visible || !inst.layer.visible || right <= 0 || bottom <= 0 || left >= rightEdge || top >= bottomEdge)
		{
			if (!inst.element_hidden)
				jQuery(inst.elem).hide();
				
			inst.element_hidden = true;
			return;
		}

		// Truncate to canvas size
		if (left < 0)
			left = 0;
		if (top < 0)
			top = 0;
		if (right > rightEdge)
			right = rightEdge;
		if (bottom > bottomEdge)
			bottom = bottomEdge;
		
		var curWinWidth = window.innerWidth;
		var curWinHeight = window.innerHeight;
           
		// Avoid redundant updates
		if (!first && inst.lastLeft === left && inst.lastTop === top && inst.lastRight === right && inst.lastBottom === bottom && inst.lastWinWidth === curWinWidth && inst.lastWinHeight === curWinHeight)
		{
			if (inst.element_hidden)
			{
				jQuery(inst.elem).show();
				inst.element_hidden = false;
			}
			
			return;
		}
			
		inst.lastLeft = left;
		inst.lastTop = top;
		inst.lastRight = right;
		inst.lastBottom = bottom;
		inst.lastWinWidth = curWinWidth;
		inst.lastWinHeight = curWinHeight;
		
		if (inst.element_hidden)
		{
			jQuery(inst.elem).show();
			inst.element_hidden = false;
		}
		
		var offx = Math.round(left) + jQuery(this.runtime.canvas).offset().left;
		var offy = Math.round(top) + jQuery(this.runtime.canvas).offset().top;
		jQuery(inst.elem).css("position", "absolute");
		jQuery(inst.elem).offset({left: offx, top: offy});
		jQuery(inst.elem).width(Math.round(right - left));
		jQuery(inst.elem).height(Math.round(bottom - top));
	};

	behinstProto.set_full_window = function (m)
	{   
		if (this.runtime.isDomFree)
			return;

        var is_fullwindow = (this.beforefullwindow["x"] !== null);
        if (m === 2)
        {            
            m = (is_fullwindow)? 0:1
        }
        
        var inst = this.inst;
        if ( (m === 0) && is_fullwindow ) // exit
        {
	        inst.x = this.beforefullwindow["x"];
	        inst.y = this.beforefullwindow["y"];
	        inst.width = this.beforefullwindow["w"];
	        inst.height = this.beforefullwindow["h"];
	        inst.updatePosition();
            inst.elem.setAttribute("frameborder", this.beforefullwindow["b"]);             
            
            this.beforefullwindow["x"] = null;
            this.beforefullwindow["y"] = null;
            this.beforefullwindow["w"] = null;
            this.beforefullwindow["h"] = null;
            this.beforefullwindow["b"] = null;
        }
        else if ( (m === 1) && (!is_fullwindow) )  // enter
        {
            this.beforefullwindow["x"] = inst.x;
            this.beforefullwindow["y"] = inst.y;
            this.beforefullwindow["w"] = inst.width;
            this.beforefullwindow["h"] = inst.height;
            this.beforefullwindow["b"] = inst.elem.getAttribute("frameborder");
                        
	        inst.x = inst.layer.viewLeft;
	        inst.y = inst.layer.viewTop;
	        inst.width = inst.layer.viewRight - inst.layer.viewLeft;
	        inst.height = inst.layer.viewBottom - inst.layer.viewTop;
	        inst.updatePosition();        
            inst.elem.setAttribute("frameborder", 0);            
        }
        
	};	
    	
	behinstProto.set_full_screen = function (m)
	{
		if (this.runtime.isDomFree)
			return;
         
        if (m === 2)
        {
            m = (this.isInFullScreen)? 0:1;
        }
        
        if (m === 0) // exit
        {
            this.isInFullScreen = false;
            if(document["exitFullscreen"])
                document["exitFullscreen"]();
            else if(document["mozCancelFullScreen"])
                document["mozCancelFullScreen"]();
            else if(document["webkitExitFullscreen"])
                document["webkitExitFullscreen"]();                
        }        
        else if (m === 1)  // enter
        {                       
            var elem = this.inst.elem;
            var requestFullScreen = elem["requestFullScreen"] || elem["mozRequestFullScreen"] || elem["webkitRequestFullScreen"];
            if (requestFullScreen)    
            {            
                requestFullScreen["bind"](elem)();
                this.isInFullScreen = true;;
            }
        }

	}; 

	behinstProto.saveToJSON = function ()
	{
		return {"bw": this.beforefullwindow
		         };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.beforefullwindow = o["bw"];
	};		
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.IsFullWindow = function ()
	{
		return (this.beforefullwindow["x"] !== null);
	};  
    
	Cnds.prototype.IsFullScreen = function ()
	{
		return this.isInFullScreen;
	};       
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	Acts.prototype.SetFullWindow = function (m)
	{   
		this.set_full_window(m);
        
	};	
    	
	Acts.prototype.SetFullScreen = function (m)
	{
		this.set_full_screen(m);
	};     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
 
}());