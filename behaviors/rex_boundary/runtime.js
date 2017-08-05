// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_boundary = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_boundary.prototype;
		
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

	var sortBoundary = function(boundary)
	{   
	    if (boundary[1] < boundary[0])
	    {
	        var tmp = boundary[0]; 
			boundary[0] = boundary[1]; 
			boundary[1] = tmp;
	    }
	};    	
	behinstProto.onCreate = function()
	{    
		this.mode = this.properties[0];
		this.alignMode = this.properties[1];
        this.horizontalEnable = (this.properties[2]==1);
        this.horizontalBoundary = [this.properties[3], this.properties[4]];
        this.verticalEnable = (this.properties[5]==1);
        this.verticalBoundary = [this.properties[6], this.properties[7]];

		
        sortBoundary(this.horizontalBoundary);
        sortBoundary(this.verticalBoundary);
        this.horizontalBoundInstInfo = {"uid":(-1), "p0":null, "p1":null};
        this.verticalBoundInstInfo = {"uid":(-1), "p0":null, "p1":null};
	};

	behinstProto.tick = function ()
	{
        //this.updateH();
        //this.updateV();
		
		var isReachedHorizontal, isReachedVertical;
		if (this.mode == 0)
		{
		    isReachedHorizontal = this.clampH();
		    isReachedVertical = this.clampV();	
        }
		else if (this.mode == 1)
		{
		    isReachedHorizontal = this.wrapH();
		    isReachedVertical = this.wrapV();			
		}
		else if (this.mode == 2)
		{
		    isReachedHorizontal = this.modwrapH();
		    isReachedVertical = this.modwrapV();			
		}
		
		if (isReachedHorizontal || isReachedVertical)
        {                         
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitAnyBoundary, this.inst);            
		    this.inst.set_bbox_changed();             
        }
	};
	
	behinstProto.updateH = function ()
	{
        var instInfo = this.horizontalBoundInstInfo;
        var pin_inst = this.runtime.getObjectByUID(instInfo["uid"]);
        if (pin_inst == null)
            return;
        this.horizontalBoundary[0] = pin_inst.getImagePoint(instInfo["p0"], true);
        this.horizontalBoundary[1] = pin_inst.getImagePoint(instInfo["p1"], true);    
        sortBoundary(this.horizontalBoundary);
	};
    
	behinstProto.updateV = function ()
	{
        var instInfo = this.verticalBoundInstInfo;
        var pin_inst = this.runtime.getObjectByUID(instInfo["uid"]);
        if (pin_inst == null)
            return;
        this.verticalBoundary[0] = pin_inst.getImagePoint(instInfo["p0"], false);
        this.verticalBoundary[1] = pin_inst.getImagePoint(instInfo["p1"], false);    
        sortBoundary(this.verticalBoundary);
	};
	    
	// clamp
	behinstProto.clampH = function ()
	{
	    if (!this.horizontalEnable)
		    return false;
		var currentX = this.inst.x;
		
		if (this.alignMode == 0)    // origin
		{
		    // left
		    if (this.isReachedBound(1))
            {
		        this.inst.x = this.horizontalBoundary[0];
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitLeftBoundary, this.inst);
            }
            
            // right
            else if (this.isReachedBound(2))
            {
		        this.inst.x = this.horizontalBoundary[1];
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitRightBoundary, this.inst);
            }
		}
		else    // boundaries
		{
		    this.inst.update_bbox();
			var bbox = this.inst.bbox;		
			
			// left	
		    if (this.isReachedBound(1))
            {			 
		        this.inst.x = this.horizontalBoundary[0] + (this.inst.x - bbox.left);
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitLeftBoundary, this.inst);
            }
            
            // right
            else if (this.isReachedBound(2))
            {
		        this.inst.x = this.horizontalBoundary[1] - (bbox.right - this.inst.x);
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitRightBoundary, this.inst);
            }
		}
	    return (currentX != this.inst.x);
	};
	
	behinstProto.clampV = function ()
	{
	    if (!this.verticalEnable)
		    return false;
	    var currentY = this.inst.y;
		
		if (this.alignMode == 0)    // origin
		{
		    // top
		    if (this.isReachedBound(4))
            {
		        this.inst.y = this.verticalBoundary[0];
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitTopBoundary, this.inst);
            }
            
            // bottom
            else if (this.isReachedBound(8))
            {
		        this.inst.y = this.verticalBoundary[1];
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitBottomBoundary, this.inst);
            }
		}
		else    // boundaries
		{
		    this.inst.update_bbox();
			var bbox = this.inst.bbox;		
			
			// top
		    if (this.isReachedBound(4))
            {
		        this.inst.y = this.verticalBoundary[0] + (this.inst.y - bbox.top);
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitTopBoundary, this.inst);
            }
            
            // bottom
            else if (this.isReachedBound(8))
            {
		        this.inst.y = this.verticalBoundary[1] - (bbox.bottom - this.inst.y);
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitBottomBoundary, this.inst);
            }		
		}
	    return (currentY != this.inst.y);			
	};
	
	// wrap	
	behinstProto.wrapH = function ()
	{
	    if (!this.horizontalEnable)
		    return false;
		var currentX = this.inst.x;
		
		if (this.alignMode == 0)    // origin
		{
		    // left
		    if (this.isReachedBound(1))
            {
		        this.inst.x = this.horizontalBoundary[1] + 1;
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitLeftBoundary, this.inst);
            }
            
            // right
            else if (this.isReachedBound(2))
            {
		        this.inst.x = this.horizontalBoundary[0] - 1;
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitRightBoundary, this.inst);
            }
		}
		else    // boundaries
		{
		    this.inst.update_bbox();
			var bbox = this.inst.bbox;		
			
			// left	
		    if (this.isReachedBound(1))
            {			 
		        this.inst.x = this.horizontalBoundary[1] + 1 + (bbox.right - this.inst.x);
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitLeftBoundary, this.inst);
            }
            
            // right
            else if (this.isReachedBound(2))
            {
		        this.inst.x = this.horizontalBoundary[0] - 1 - (this.inst.x - bbox.left);
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitRightBoundary, this.inst);
            }
		}
	    return (currentX != this.inst.x);
	};
	
	behinstProto.wrapV = function ()
	{
	    if (!this.verticalEnable)
		    return false;
	    var currentY = this.inst.y;
		
		if (this.alignMode == 0)    // origin
		{
		    // top
		    if (this.isReachedBound(4))
            {
		        this.inst.y = this.verticalBoundary[1] + 1;
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitTopBoundary, this.inst);
            }
            
            // bottom
            else if (this.isReachedBound(8))
            {
		        this.inst.y = this.verticalBoundary[0] - 1;
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitBottomBoundary, this.inst);
            }
		}
		else    // boundaries
		{
		    this.inst.update_bbox();
			var bbox = this.inst.bbox;	
			
			// top	
		    if (this.isReachedBound(4))
            {
		        this.inst.y = this.verticalBoundary[1] + 1 + (bbox.bottom - this.inst.y) ;
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitTopBoundary, this.inst);
            }
            
            // bottom
            else if (this.isReachedBound(8))
            {
		        this.inst.y = this.verticalBoundary[0] - 1- (this.inst.y - bbox.top);
                this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitBottomBoundary, this.inst);
            }		
		}
	    return (currentY != this.inst.y);			
	};	
	
	// mod wrap	
	behinstProto.modwrapH = function ()
	{
	    if (!this.horizontalEnable)
		    return false;
		
		// mod wrap only support origin alignment
		var isReachedLeft = this.isReachedBound(1);
		var isReachedRight = this.isReachedBound(2);
		var isReached = (isReachedLeft || isReachedRight);
		
		if (isReached)
		{
		    var dist = this.horizontalBoundary[1] - this.horizontalBoundary[0];
		    var offset =  (this.inst.x - this.horizontalBoundary[0]) % dist;
		    if (offset < 0)
		        offset += dist;
	        
	        this.inst.x = offset + this.horizontalBoundary[0];
		}
		
        if (isReachedLeft)
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitLeftBoundary, this.inst);
        else if (isReachedRight)
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitRightBoundary, this.inst);
            
	    return isReached;
	};
	
	behinstProto.modwrapV = function ()
	{
	    if (!this.verticalEnable)
		    return false;
		    
		// mod wrap only support origin alignment		
		var isReachedTop = this.isReachedBound(4);
		var isReachedBottom = this.isReachedBound(8);
		var isReached = (isReachedTop || isReachedBottom);
		
		if (isReached)
		{
		    var dist = this.verticalBoundary[1] - this.verticalBoundary[0];
		    var offset =  (this.inst.y - this.verticalBoundary[0]) % dist;
		    if (offset < 0)
		        offset += dist;
	        
	        this.inst.y = offset + this.verticalBoundary[0];
		}		

		if (isReachedTop)
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitTopBoundary, this.inst);
        else if (isReachedBottom)        
            this.runtime.trigger(cr.behaviors.Rex_boundary.prototype.cnds.OnHitBottomBoundary, this.inst);
                    
	    return isReached;			
	};		
	
	behinstProto.isReachedBound = function (boundType)
	{
        this.updateH();
        this.updateV();
        	    
        var isReached = false;
        if (this.alignMode == 0) 
        {
	        // left
		    if ((boundType & 1) === 1)
		        isReached |= (this.inst.x < this.horizontalBoundary[0]);
		        
		    // right
		    if (((boundType>>1) & 1) === 1)
		        isReached |=  (this.inst.x > this.horizontalBoundary[1]);
		        
	        // top
		    if (((boundType>>2) & 1) === 1)
		        isReached |=  (this.inst.y < this.verticalBoundary[0]);
		        
		    // bottom
		    if (((boundType>>3) & 1) === 1)
		        isReached |=  (this.inst.y > this.verticalBoundary[1]);
		        
		}
		
		else
		{
		    this.inst.update_bbox();
			var bbox = this.inst.bbox;	
					
            if (this.mode === 0)
            {
	            // left
		        if ((boundType&1) === 1)
		            isReached |= (bbox.left < this.horizontalBoundary[0]);
		        
		        // right
		        if (((boundType>>1)&1) === 1)
		            isReached |= (bbox.right > this.horizontalBoundary[1]);
		        
	            // top
		        if (((boundType>>2)&1) === 1)
		            isReached |= (bbox.top < this.verticalBoundary[0]);
		        
		        // bottom
		        if (((boundType>>3)&1) === 1)
		            isReached |= (bbox.bottom > this.verticalBoundary[1]);				
            }			
			else if ((this.mode === 1) || (this.mode === 2))
		    {
	            // left
		        if ((boundType&1) === 1)
		            isReached |= (bbox.right < this.horizontalBoundary[0]);
		        
		        // right
		        if (((boundType>>1)&1) === 1)
		            isReached |= (bbox.left > this.horizontalBoundary[1]);
		        
	            // top
		        if (((boundType>>2)&1) === 1)
		            isReached |= (bbox.bottom < this.verticalBoundary[0]);
		        
		        // bottom
		        if (((boundType>>3)&1) === 1)
		            isReached |= (bbox.top > this.verticalBoundary[1]);			
			}

		        		    
		}
		
		return isReached;
	}; 
	    
	behinstProto.posX2percentage = function ()
	{
	    var instOffset, boundOffset;
        this.updateH();
        if (this.alignMode == 0)        
		{
            instOffset = this.inst.x - this.horizontalBoundary[0];
            boundOffset = this.horizontalBoundary[1] - this.horizontalBoundary[0];
	    }
		else
		{
		    this.inst.update_bbox();
            //instOffset = this.inst.x - this.horizontalBoundary[0] - (this.inst.x - this.inst.bbox.left);
            instOffset = this.inst.bbox.left - this.horizontalBoundary[0];
            boundOffset = this.horizontalBoundary[1] - this.horizontalBoundary[0] - (this.inst.bbox.right - this.inst.bbox.left);		
		}
        var pec = cr.clamp((instOffset/boundOffset), 0, 1) ;
        return pec;
	};    
	behinstProto.posY2percentage = function ()
	{
	    var instOffset, boundOffset;	
        this.updateV();
        if (this.alignMode == 0)        
		{		
            instOffset = this.inst.y - this.verticalBoundary[0];
            boundOffset = this.verticalBoundary[1] - this.verticalBoundary[0];
		}
		else
		{
		    this.inst.update_bbox();
            //instOffset = this.inst.y - this.verticalBoundary[0] - (this.inst.y - this.inst.bbox.top);
            instOffset = this.inst.bbox.top - this.verticalBoundary[0];
            boundOffset = this.verticalBoundary[1] - this.verticalBoundary[0] - (this.inst.bbox.bottom - this.inst.bbox.top);				
        }
        var pec = cr.clamp((instOffset/boundOffset), 0, 1);
        return pec;
	};        
    

	behinstProto.percentage2posX = function (p)
	{  
        p = cr.clamp(p, 0, 1);
        this.updateH();   
        var rb, lb;
		if (this.alignMode == 0)    // origin
		{
            lb = this.horizontalBoundary[0];               
            rb = this.horizontalBoundary[1];         
        }
		else    // boundaries
		{
		    this.inst.update_bbox();
            lb = this.horizontalBoundary[0] + (this.inst.x - this.inst.bbox.left);
			rb = this.horizontalBoundary[1] - (this.inst.bbox.right - this.inst.x);
        }
        
        var x = lb + (rb - lb)*p;    
        return x;        
	};
    
	behinstProto.percentage2posY = function (p)
	{  
        p = cr.clamp(p, 0, 1);
        this.updateV();   
        var bb, tb;
		if (this.alignMode == 0)    // origin
		{
            tb = this.verticalBoundary[0];                   
            bb = this.verticalBoundary[1];     
        }
		else    // boundaries
		{
		    this.inst.update_bbox();
            tb = this.verticalBoundary[0] + (this.inst.y - this.inst.bbox.top);
			bb = this.verticalBoundary[1] - (this.inst.bbox.bottom - this.inst.y);
        }
        
        var y = tb + (bb - tb)*p;
        return y;
	};
        
    function clone(obj) 
	{
        if (null == obj || "object" != typeof obj) 
		    return obj;
        var result = obj.constructor();
        for (var attr in obj) 
		{
            if (obj.hasOwnProperty(attr)) 
			    result[attr] = obj[attr];
        }
        return result;
    };

	behinstProto.saveToJSON = function ()
	{
		return { "he": this.horizontalEnable,
		         "hb": this.horizontalBoundary,
                 "ve": this.verticalEnable,                 
                 "vb": this.verticalBoundary,
                 "hp": clone(this.horizontalBoundInstInfo),
                 "vp": clone(this.verticalBoundInstInfo)
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.activated = o["he"];
		this.horizontalBoundary = o["hb"];
        this.verticalEnable = o["ve"];        
        this.verticalBoundary = o["vb"];
        this.horizontalBoundInstInfo = o["hp"];
        this.verticalBoundInstInfo = o["vp"];
	};

	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Horizontal", "value": this.horizontalBoundary[0] + "," + this.horizontalBoundary[1]},
				{"name": "Vertical", "value": this.verticalBoundary[0] + "," + this.verticalBoundary[1]},
			]
		});
	};
	/**END-PREVIEWONLY**/
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.OnHitAnyBoundary = function ()
	{
		return true;
	};
    
	Cnds.prototype.OnHitLeftBoundary = function ()
	{
		return true;
	};
    
	Cnds.prototype.OnHitRightBoundary = function ()
	{
		return true;
	};    
    
	Cnds.prototype.OnHitTopBoundary = function ()
	{
		return true;
	};
    
	Cnds.prototype.OnHitBottomBoundary = function ()
	{
		return true;
	};        
    
	var BOUNDTYPE_MAP = [15,1,2,4,8];
	Cnds.prototype.IsHitBoundary = function (boundType)
	{
		return this.isReachedBound( BOUNDTYPE_MAP[boundType] );
	};    	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.EnableHorizontal = function (s)
	{
		this.horizontalEnable = (s==1);
	};  

	Acts.prototype.EnableVertical = function (s)
	{
		this.verticalEnable = (s==1);
	};

	Acts.prototype.SetHorizontalBoundary = function (l, r)
	{
		this.horizontalBoundary[0] = l;
		this.horizontalBoundary[1] = r;
		sortBoundary(this.horizontalBoundary);
        this.horizontalBoundInstInfo["uid"] = (-1);
	};

	Acts.prototype.SetVerticalBoundary = function (u, d)
	{
		this.verticalBoundary[0] = u;
		this.verticalBoundary[1] = d;
		sortBoundary(this.verticalBoundary);
        this.verticalBoundInstInfo["uid"] = (-1);        
	};

    var getInstance = function (obj)
	{
		return obj.getFirstPicked();
	};
	Acts.prototype.SetHorizontalBoundaryToObject = function (obj, leftImgpt, rightImgpt)
	{
        var instInfo = this.horizontalBoundInstInfo;
		instInfo["uid"] = obj.getFirstPicked().uid;	
        instInfo["p0"] = leftImgpt;	
        instInfo["p1"] = rightImgpt;	
	};   
    
	Acts.prototype.SetVerticalBoundaryToObject = function (obj, topImgpt, bottomImgpt)
	{
        var instInfo = this.verticalBoundInstInfo;
		instInfo["uid"] = obj.getFirstPicked().uid;	
        instInfo["p0"] = topImgpt;	
        instInfo["p1"] = bottomImgpt;	        
	};
    
	Acts.prototype.SetXByPercentage = function (p)
	{  
	    if (!this.horizontalEnable)
		    return;
        
        var newX = this.percentage2posX(p);    
        if (newX !== this.inst.x)
        {
            this.inst.x = newX;
            this.inst.set_bbox_changed();  
        }
	};
    
	Acts.prototype.SetYByPercentage = function (p)
	{  
	    if (!this.verticalEnable)
		    return;
        
        var newY = this.percentage2posY(p);    
        if (newY !== this.inst.y)
        {
            this.inst.y = newY;
            this.inst.set_bbox_changed();         
        }
	};
    
	Acts.prototype.SetYXByPercentage = function (px, py)
	{  
        var isXChanged = false;
	    if (this.horizontalEnable)
        {
            this.inst.x = this.percentage2posX(px);    
            isXChanged = (newX !== this.inst.x);
            if (isXChanged)
                this.inst.x = newX;
        }
        
        var isYChanged = false;
	    if (this.verticalEnable)
        {
		    newY = this.percentage2posY(py); 
            isYChanged = (newY !== this.inst.y);
            if (isYChanged)
                this.inst.y = newY;
        }

        if (isXChanged || isYChanged)
        {
            this.inst.set_bbox_changed();  
        }
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.HorizontalEnable = function (ret)
	{
        ret.set_int( (this.horizontalEnable)? 1:0 );
	};

	Exps.prototype.VerticalEnable = function (ret)
	{
        ret.set_int( (this.verticalEnable)? 1:0 );
	}; 
    
	Exps.prototype.LeftBound = function (ret)
	{
        this.updateH();   
        ret.set_float( this.horizontalBoundary[0] );
	};

	Exps.prototype.RightBound = function (ret)
	{
        this.updateH();    
        ret.set_float( this.horizontalBoundary[1] );
	};  

	Exps.prototype.TopBound = function (ret)
	{
        this.updateV();     
        ret.set_float( this.verticalBoundary[0] );
	};

	Exps.prototype.BottomBound = function (ret)
	{
        this.updateV();     
        ret.set_float( this.verticalBoundary[1] );
	};  
    
	Exps.prototype.HorPercent = function (ret)
	{
        ret.set_float( this.posX2percentage() );
	};

	Exps.prototype.VerPercent = function (ret)
	{
        ret.set_float( this.posY2percentage() );
	};   
    
	Exps.prototype.HorScale = function (ret, minValue, maxValue)
	{
        var pec = this.posX2percentage();
        if (maxValue < minValue)
        {
            var tmp = maxValue; maxValue = minValue; minValue = tmp;
            pec = 1.0-pec;
        }
        var scaled = minValue + pec*(maxValue-minValue);
        ret.set_float( scaled );
	};
    
	Exps.prototype.VerScale = function (ret, minValue, maxValue)
	{
        var pec = this.posY2percentage();
        if (maxValue < minValue)
        {
            var tmp = maxValue; maxValue = minValue; minValue = tmp;
            pec = 1.0-pec;
        }
        var scaled = minValue + pec*(maxValue-minValue);
        ret.set_float( scaled );
	};

	Exps.prototype.HorPercent2PosX = function (ret, p)
	{
        ret.set_float( this.percentage2posX(p) );
	};

	Exps.prototype.VerPercent2PosY = function (ret, p)
	{
        ret.set_float( this.percentage2posY(p) );
	};   
        
}());