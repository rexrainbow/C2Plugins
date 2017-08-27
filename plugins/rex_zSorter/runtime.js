// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ZSorter = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	var pluginProto = cr.plugins_.Rex_ZSorter.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
	    this.yIncMode = (this.properties[0] === 0);
        this.xIncMode = (this.properties[1] === 0);
        this.cmpUIDA = 0;
	    this.cmpUIDB = 0;
        this.cmpResult = 0;        
		this.sortFnName = "";
		
		var self = this;
		this.SortByPos = function (instA, instB)
		{        
			var ax = instA.x;
			var ay = instA.y;
			var bx = instB.x;
			var by = instB.y; 
			
			if (ay === by)
			{
				if (ax === bx)
					return 0;
				else if (self.xIncMode)            
					return (ax > bx)? 1:-1;            
				else  // !this.xIncMode
					return (ax < bx)? 1:-1;
					
			}
			else if (self.yIncMode)
				return (ay > by)? 1:-1;
			else // !this.yIncMode
				return (ay < by)? 1:-1;
		};
		
		this.SortByFn = function (instA, instB)
		{   
			self.cmpUIDA = instA.uid;
			self.cmpUIDB = instB.uid;	    
			self.runtime.trigger(cr.plugins_.Rex_ZSorter.prototype.cnds.OnSortingFn, self);
			return self.cmpResult;	    
		};
	};

	var getUID2ZIdx = function (insts, uid2ZIdx)
	{
		if (uid2ZIdx == null)
			uid2ZIdx = {};
		else
		{
			for(var k in uid2ZIdx)
				delete uid2ZIdx[k];
		}
		
		var i, cnt=insts.length, inst;
		for(i=0; i<cnt; i++)
		{
			inst = insts[i];
			uid2ZIdx[inst.uid] = inst.get_zindex();
		}
		return uid2ZIdx;
	};
	
	instanceProto.saveToJSON = function ()
	{
		return { 
			"xi": this.xIncMode,
			"yi": this.yIncMode
		};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.xIncMode = o["xi"];
		this.yIncMode = o["yi"];
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds(); 
	  
	Cnds.prototype.OnSortingFn = function (name)
	{
		return cr.equals_nocase(this.sortFnName, name);
	};	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	var uid2ZIdx = {};
    //Z-Sort all objects in current layer by their Y position
	Acts.prototype.SortObjsLayerByY = function (layer)
	{     
        if (layer == null)
        {
            alart("Z Sort: Can not find layer");
            return;
		}

		var insts = layer.instances;
		uid2ZIdx = getUID2ZIdx(insts, uid2ZIdx);		
		insts.sort(this.SortByPos);
		var i, cnt=insts.length, inst;
		for(i=0; i<cnt; i++)
		{
			inst = insts[i];
			if (i !== uid2ZIdx[inst.uid])
				layer.setZIndicesStaleFrom(i);
		}
	    this.runtime.redraw = true;
	};
    
	Acts.prototype.SetXorder = function (xOrder)
	{
        this.xIncMode = (xOrder === 0);
	};    
    
	Acts.prototype.SortByFn = function (layer, fnName)
	{
        if (layer == null)
        {
            alart("Z Sort: Can not find layer");
            return;
		}
		var insts = layer.instances;
		uid2ZIdx = getUID2ZIdx(insts, uid2ZIdx);
	    this.sortFnName = fnName;
	    insts.sort(this.SortByFn);
		var i, cnt=insts.length, inst;
		for(i=0; i<cnt; i++)
		{
			inst = insts[i];
			if (i !== uid2ZIdx[inst.uid])
				layer.setZIndicesStaleFrom(i);
		}
	    this.runtime.redraw = true;       
	}; 

	Acts.prototype.SetCmpResultDirectly = function (result)
	{
	    this.cmpResult = result;
	};		
	
    Acts.prototype.SetCmpResultCombo = function (result)
	{
	    this.cmpResult = result -1;
	};
    
	Acts.prototype.SetYorder = function (yOrder)
	{
        this.yIncMode = (yOrder === 0);
	}; 
		
    Acts.prototype.ZMoveToObject = function (uidA, where_, uidB)
	{	        
	    if (uidA == uidB)
	        return;
	        
	    var instA = this.runtime.getObjectByUID(uidA);
	    var instB = this.runtime.getObjectByUID(uidB);
	    if ((instA == null) || (instB == null))
	        return;
	
	    // copy from commonace.js, line 831
	    var isafter = (where_ === 0);
	    // First move to same layer as other object if different
	    if (instA.layer.index !== instB.layer.index)
	    {
	    	instA.layer.removeFromInstanceList(instA, true);
	    	
	    	instA.layer = instB.layer;
	    	instB.layer.appendToInstanceList(instA, true);
	    }
	    
	    instA.layer.moveInstanceAdjacent(instA, instB, isafter);				
	    instA.runtime.redraw = true;	        
	};	
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.CmpUIDA = function (ret)
	{   
	    ret.set_int(this.cmpUIDA);
	};    
	
	Exps.prototype.CmpUIDB = function (ret)
	{   
	    ret.set_int(this.cmpUIDB);
	};   
}());