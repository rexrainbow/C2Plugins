// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_tmx_importer_v2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_tmx_importer_v2.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

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
	    this.POX = this.properties[0];
	    this.POY = this.properties[1];
	    
        // tiles
        this.exp_MapWidth = 0;
        this.exp_MapHeight = 0;  
        this.exp_TileWidth = 0;
        this.exp_TileHeight = 0;
        this.exp_TotalWidth = 0;
        this.exp_TotalHeight = 0; 
        this.exp_IsIsometric = 0;         
        this.exp_TileID = (-1);
        this.exp_tilesetRef = null;
        this.exp_LogicX = (-1);
        this.exp_LogicY = (-1);  
        this.exp_PhysicalX = (-1);
        this.exp_PhysicalY = (-1);        
        this.exp_InstUID = (-1);
        this.exp_Frame = (-1);        
        this.exp_IsMirrored = 0;
        this.exp_IsFlipped = 0;
        this.exp_TileAngle = 0;
        this.exp_LayerName = "";  
        this.exp_LayerOpacity = 1;  
        this.exp_MapProperties = null;                
        this.exp_LayerProperties = null;       
        this.exp_TileProperties = null;
        this.exp_BaclgroundColor = 0;        
        
        // objects
        this.exp_objGroupRef = null;
        this.exp_objRef = null;

        // for each property
        this.exp_CurLayerPropName = "";
        this.exp_CurLayerPropValue =0;
        this.exp_CurTilesetPropName = "";
        this.exp_CurTilesetPropValue =0;        
        this.exp_CurTilePropName = "";
        this.exp_CurTilePropValue =0;     
        this.exp_CurMapPropName = "";
        this.exp_CurMapPropValue =0;        
        this.exp_CurObjectPropName = "";
        this.exp_CurObjectPropValue =0; 
        
        // hexagon layout
        this.exp_isUp2Down = 0;
        this.exp_isIndent = 0;    
             
        // duration
        this.processingTime = 0.5;
        this.exp_RetrievingPercent = 0;         
              
        this.tmxObj = null;  
        this.objType = null;
        this.c2Layer = null;        
        this.layout = null;
        this.createdC2Inst = null;
        
        // official save load
        this.tmxSrcContent = null;
        this.parserUID = null;
        this.save_pox = null;
        this.save_poy = null;
        
        // duration
        this.durationReset();     
	};
    
    instanceProto.parseTmxContent = function (source, parser)
    {
        var tmxObj = parser.TMXObjGet(source);        
        this.importTmxObj(tmxObj);
        
        this.tmxSrcContent = source;
        this.parserUID = parser.uid;
    };
    instanceProto.releaseTmxObj = function ()
    {
        this.tmxObj = null;    
        
        this.tmxSrcContent = null;
        this.parserUID = null;
        this.save_pox = null;
        this.save_poy = null;       
    };    
    
        
	instanceProto.importTmxObj = function(tmxObj)
	{        	    
        this.tmxObj = tmxObj;
        this.exp_MapWidth = this.tmxObj.map.width;
        this.exp_MapHeight = this.tmxObj.map.height;  
        this.exp_TileWidth = this.tmxObj.map.tilewidth; 
        this.exp_TileHeight = this.tmxObj.map.tileheight; 
        this.exp_IsIsometric = (this.tmxObj.map.orientation == "isometric");
        this.exp_TotalWidth = (this.exp_IsIsometric)? ((this.exp_MapWidth+this.exp_MapHeight)/2)*this.exp_TileWidth: 
                                                      this.exp_MapWidth*this.exp_TileWidth;
        this.exp_TotalHeight = (this.exp_IsIsometric)? ((this.exp_MapWidth+this.exp_MapHeight)/2)*this.exp_TileHeight: 
                                                       this.exp_MapHeight*this.exp_TileHeight;
        this.exp_BaclgroundColor = this.tmxObj.map.backgroundcolor;                                                       
        this.exp_MapProperties = this.tmxObj.map.properties;
        
        
        // setup this.layout
        var orientation = this.tmxObj.map.orientation;
        var is6DirMap = (orientation === "hexagonal");
        var is4DirMap = (orientation === "orthogonal") || (orientation === "isometric") || (orientation === "staggered") ;
        if (is4DirMap)
        {
            var mode ={"orthogonal":0, 
                               "isometric": 1,
                               "staggered": 2}[orientation];
            
            this.layout = new SquareLayoutKlass(this.POX, this.POY, 
                                                this.exp_TileWidth, this.exp_TileHeight, mode);
        }
        else if (is6DirMap) 
        {
            var isUp2down = (this.tmxObj.map.staggeraxis === "x");
            var isEven = (this.tmxObj.map.staggerindex === "even");
            var mode = (!isUp2down && !isEven)? ODD_R:
                       (!isUp2down &&  isEven)? EVEN_R:
                       ( isUp2down && !isEven)? ODD_Q:
                       ( isUp2down &&  isEven)? EVEN_Q:0; 
        
            this.layout = new HexLayoutKlass(this.POX, this.POY, 
                                             this.exp_TileWidth, this.exp_TileHeight, mode);
                                             
            this.exp_isUp2Down = isUp2down;
            this.exp_isIndent = isEven;                                             
        }
                
	};
	instanceProto.retrieveTileArray = function(objType)
	{
	    // tiles
        this.retrieveTiles(objType);
           
        // objects
        this.retrieveObjects();
        this.runtime.trigger(cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnRetrieveFinished, this);
	};
	
	
	var getTileAngle = function (gid)
	{
        var rotate = (gid >> 29) & 0x7;
        var tileAngle;
        switch (rotate)
        {
        case 5: tileAngle = 90;  break;
        case 6: tileAngle = 180; break;
        case 3: tileAngle = 270; break;
        default: tileAngle = 0;  break;
        }
        return tileAngle; 
    }

	// bitmaks to check for flipped & rotated tiles
	var FlippedHorizontallyFlag		= 0x80000000;
	var FlippedVerticallyFlag		= 0x40000000;
	var FlippedAntiDiagonallyFlag   = 0x20000000;   	
	instanceProto.readTileAtLXY = function(tmxLayer, x, y, is_raw_data)
	{
        var idx = (tmxLayer.width * y) + x;
	    var gid = tmxLayer.data[idx];	    
        if ((gid == null) || (gid === 0) || is_raw_data)
            return gid;     // return gid                    
     
        // prepare expressions
        this.exp_TileID = gid & ~(FlippedHorizontallyFlag | FlippedVerticallyFlag | FlippedAntiDiagonallyFlag);  
        this.exp_LogicX = x;
        this.exp_LogicY = y;
        this.exp_PhysicalX = this.layout.LXYZ2PX(x,y);
        this.exp_PhysicalY = this.layout.LXYZ2PY(x,y);
        this.exp_TileAngle = getTileAngle(gid);
        if (this.exp_TileAngle == 0)
        {
            this.exp_IsMirrored = ((gid & FlippedHorizontallyFlag) !=0)? 1:0;
            this.exp_IsFlipped = ((gid & FlippedVerticallyFlag) !=0)? 1:0;
        }
        else
        {
            this.exp_IsMirrored = 0;
            this.exp_IsFlipped = 0;
        }
        var tilesetObj = this.tmxObj.GetTileSet(this.exp_TileID);
        this.exp_tilesetRef = tilesetObj;
        var tileObj = tilesetObj.tiles[this.exp_TileID];
        this.exp_Frame = this.exp_TileID - tilesetObj.firstgid;
        this.exp_TileProperties = (tileObj != null)? tileObj.properties: null;

        if (this.objType)       
            this.createdC2Inst = this.createC2Instance(this.exp_PhysicalX, this.exp_PhysicalY);         
        else
            this.createdC2Inst = null;
                            
        return gid;  // return gid
    };

	instanceProto._create_layer_objects = function(tmxLayer, layerIndex)
	{	  
	    var c2Layer = this.getLayer(tmxLayer.name);
        this.c2Layer = c2Layer;
        if (this.objType && !c2Layer)
        {
            alert('TMX Importer: Can not find "' + tmxLayer.name + '" layer');
        }
        
        if (this.objType && c2Layer && (this.exp_BaclgroundColor != null) && 
             (layerIndex === 0) )
        {
            cr.system_object.prototype.acts.SetLayerBackground.call(this, c2Layer, this.exp_BaclgroundColor);
            //cr.system_object.prototype.acts.SetLayerTransparent.call(this, c2Layer, 0);            
        }
            
        var width = tmxLayer.width;
        var height = tmxLayer.height;
        var x,y,inst,tilesetObj,tileObj,layer_opacity,gid; 
        var i=0, gid;
        
        this.exp_LayerName = tmxLayer.name;        
        this.exp_LayerProperties = tmxLayer.properties;
        this.exp_LayerOpacity = tmxLayer.opacity;
        for (y=0; y<height; y++)
        {
            for (x=0; x<width; x++)
            {     
                gid = this.readTileAtLXY(tmxLayer, x,y);
                if ((gid == null) || (gid === 0))
                    continue;

                // trigger callback
                this.runtime.trigger(cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnEachTileCell, this); 
            }
        }         
	};

            	
	instanceProto.createC2Instance = function(px, py)
	{
        var inst = this.runtime.createInstance(this.objType, this.c2Layer, px, py );
        cr.plugins_.Sprite.prototype.acts.SetAnimFrame.call(inst, this.exp_Frame);
        inst.opacity = this.exp_LayerOpacity;          
        inst.angle = cr.to_clamped_radians(this.exp_TileAngle);
        
        if (this.exp_IsMirrored ==1)
            inst.width = -inst.width;
        if (this.exp_IsFlipped ==1)
            inst.height = -inst.height;         
        
        this.exp_InstUID = inst.uid; 
        return inst        
    };
	    
    instanceProto.getLayer = function(layerparam)
    {
        return (typeof layerparam == "number")?
               this.runtime.getLayerByNumber(layerparam):
               this.runtime.getLayerByName(layerparam);
    };   
	instanceProto.retrieveTiles = function(objType)
	{
        this.objType = objType;
        	    
        var layers = this.tmxObj.layers;
        var layersCnt = layers.length;
        var i;
        // tiles
        for(i=0; i<layersCnt; i++)
        {
           this._create_layer_objects(layers[i], i);
        }           
           
        this.objType = null;
	};
	
	instanceProto._read_obj = function (obj)
	{
        this.exp_objRef = obj;
        return true;
    }
                	        
    instanceProto.retrieveObjects = function()
    {
        var objGroups = this.tmxObj.objectgroups;
        var i, group, groupCnt=objGroups.length;
        var j, obj, objs, obj_cnt;
        var x,y;
        for (i=0; i<groupCnt; i++)
        {
            group = objGroups[i];
            this.exp_objGroupRef = objGroups[i];           
            objs = this.exp_objGroupRef.objects;
            obj_cnt = objs.length;
            for (j=0; j<obj_cnt; j++)
            {
                this._read_obj(objs[j]);
                this.runtime.trigger(cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnEachObject, this); 
            }
        }
    };
    
    // duration mode
    instanceProto.durationStart = function(objType)
    {
        this.durationReset();       
        this.durationInfo.totalObjectsCount = getTilesCnt(this.tmxObj) + getObjectsCnt(this.tmxObj);
        this.objType = objType;        
        this.runtime.tickMe(this);
        this.tick();
    }; 
    instanceProto.durationReset = function()
    {
        this.durationInfo = {
            workingTime:(1/60)*1000*this.processingTime,
            state:0, // 0=idle, 1=retrieve tile layer, 2=retrieve object layer
            evtGotoNextState:false,
            totalObjectsCount:0,
            currentObjectsCount:0,
            tileLayer:{layerIndex:0,dataIndex:0},
            objectLayer:{groupIndex:0,objectIndex:0},
        };
    }; 
    instanceProto.tick = function()
    {                
        var unitCnt, isTimeout=false;
        var startTime = Date.now();
        var workingTime = this.durationInfo.workingTime;
        // fix workingTime
        while (!isTimeout)
        {
            assert2(this.tmxObj, "TMX Importer: Can not find tmx object.");
            
            unitCnt = this.retrieveOneObj();
            
            this.durationInfo.currentObjectsCount += unitCnt;
            this.exp_RetrievingPercent = (this.durationInfo.currentObjectsCount/this.durationInfo.totalObjectsCount);
            
            if (unitCnt > 0)
                this.triggerC2EventForOneObj();

            if (this.exp_RetrievingPercent === 1)
                break;
            else if (this.durationInfo.evtGotoNextState)
            {
                this.durationInfo.state += 1;                
                this.durationInfo.evtGotoNextState = false;
            }

            if (unitCnt > 0)
                isTimeout = (Date.now() - startTime) > workingTime;
        }
		this.runtime.trigger(cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnRetrieveDurationTick, this); 
		if (this.exp_RetrievingPercent === 1)
		    this.durationFinished();   
    };    
    instanceProto.durationFinished = function()
    {
        this.durationInfo.state = 0;
        this.objType = null;  
        this.runtime.untickMe(this);
        this.runtime.trigger(cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnRetrieveFinished, this);
    };
    
    var getTilesCnt = function(tmxObj)
    {
        var layers = tmxObj.layers;
        var i, layersCnt = layers.length;
        var tileCnt, totalTilesCnt=0;
        for(i=0; i<layersCnt; i++)
           totalTilesCnt += layers[i].data.length;
        return totalTilesCnt;
    };     
    var getObjectsCnt = function(tmxObj)
    {
        var objGroups = tmxObj.objectgroups;
        var i, groupCnt=objGroups.length;
        var obj_cnt, totalObjectsCnt=0;
        for (i=0; i<groupCnt; i++)        
            totalObjectsCnt += objGroups[i].objects.length; 
        return totalObjectsCnt;
    };          
    instanceProto.retrieveOneObj = function()
    {
        var unitCnt;
        switch (this.durationInfo.state)
        {
        case 0: unitCnt = this.retrieveOneTile();     break;
        case 1: unitCnt = this.retrieveOneObject();   break;
        }

        
        return unitCnt;   
    };
    
    instanceProto.retrieveOneTile = function()
    {   
        var unitCnt=0, gid;
        var layerIndex,dataIndex,layers,tmxLayer,c2Layer,x,y;

        while (1)
        {
            layerIndex = this.durationInfo.tileLayer.layerIndex;
            dataIndex = this.durationInfo.tileLayer.dataIndex;
            tmxLayer = this.tmxObj.layers[layerIndex];
            if (!tmxLayer)
            {
                // finish
                this.durationInfo.evtGotoNextState = true;
                return unitCnt;
            }
       
            // check c2 layer
            c2Layer =  this.getLayer(tmxLayer.name);
            this.c2Layer = c2Layer;
            if (this.objType && !c2Layer)
            {
                alert('TMX Importer: Can not find "' + tmxLayer.name + '" layer'); 
            }
            
            // set layer background color
            if (this.objType && c2Layer && (this.exp_BaclgroundColor != null) &&
               (layerIndex === 0) && (dataIndex === 0))
            {
                cr.system_object.prototype.acts.SetLayerBackground.call(this, c2Layer, this.exp_BaclgroundColor);
                //cr.system_object.prototype.acts.SetLayerTransparent.call(this, c2Layer, 0);            
            } 
                   

            x = dataIndex % tmxLayer.width;
            y = (dataIndex-x)/tmxLayer.height;                   
            gid = this.readTileAtLXY(tmxLayer, x,y);
            if (gid == null)
            {
                this.durationInfo.tileLayer.layerIndex += 1; // next layer
                this.durationInfo.tileLayer.dataIndex = 0;    // start from 0 
                continue; 
            }
            else  // gid == 0 or gid > 0
            {
                unitCnt += 1;
                this.durationInfo.tileLayer.dataIndex += 1;  // next tile
                if (gid > 0)
                    return unitCnt; 
                else 
                    continue;
            }                         
        }   
    }; 
    
    instanceProto.retrieveOneObject = function()
    {
        var objectgroups = this.tmxObj.objectgroups;
        var group, obj;
        while (1)
        {
            group = objectgroups[this.durationInfo.objectLayer.groupIndex];
            if (!group)
            {
                // finish
                this.durationInfo.evtGotoNextState = true;
                return 0; 
            }
            this.exp_objGroupRef = group;            
            obj = group.objects[this.durationInfo.objectLayer.objectIndex];                   
            if (obj)  // get valid object
            {
                this._read_obj(obj);
                this.durationInfo.objectLayer.objectIndex += 1;  // next index            
                return 1;
            }            
            else    // no object in this group
            {
                this.durationInfo.objectLayer.groupIndex += 1;  // try next group
                this.durationInfo.objectLayer.objectIndex = 0;  // start from 0
                continue;
            }
        }
    };  
      
    instanceProto.triggerC2EventForOneObj = function()
    {
        var trg;
        switch (this.durationInfo.state)
        {
        case 0: trg = cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnEachTileCell;   break;
        case 1: trg = cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnEachObject;     break;
        }
        this.runtime.trigger(trg, this);
    };  
    
	instanceProto.saveToJSON = function ()
	{   
		return { "src": this.tmxSrcContent,
		         "parserUid": this.parserUID,
                 "pox": (this.layout)? this.layout.PositionOX : null,
                 "poy": (this.layout)? this.layout.PositionOY : null
		         };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        this.releaseTmxObj();
        
	    this.tmxSrcContent = o["src"];
	    this.parserUID = o["parserUid"];
        this.save_pox = o["pox"];
        this.save_poy = o["poy"];        
	};    
    
	instanceProto.afterLoad = function ()
	{
        if (this.parserUID === null)
            return;
            
        var parser = this.runtime.getObjectByUID(this.parserUID);
        assert2(parser, "TMX Importer: Failed to find parser object by UID");
        
        this.parseTmxContent(this.tmxSrcContent, parser);
        this.layout.SetPOXY(this.save_pox, this.save_poy);
        
        this.save_pox = null;
        this.save_poy = null;          
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
	  
	Cnds.prototype.OnEachTileCell = function ()
	{
        var inst = this.createdC2Inst;
        if (inst != null)
        {
            var sol = inst.type.getCurrentSol();
            sol.select_all = false;
		    sol.instances.length = 1;
		    sol.instances[0] = inst;
		
		    // Siblings aren't in instance lists yet, pick them manually
		    var i, len, s;
		    if (inst.is_contained)
		    {
			    for (i = 0, len = inst.siblings.length; i < len; i++)
			    {
				    s = inst.siblings[i];
				    sol = s.type.getCurrentSol();
				    sol.select_all = false;
				    sol.instances.length = 1;
				    sol.instances[0] = s;
			    }
		    }
        
		    this.runtime.isInOnDestroy++;
		    this.runtime.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnCreated, inst);
		    this.runtime.isInOnDestroy--;
        }
		return true;
	};	
	Cnds.prototype.OnEachObject = function ()
	{
		return true;
	};    
    
    // for each property
	Cnds.prototype.ForEachLayerProperty = function ()
	{   
        if (this.exp_LayerProperties == null)
            return false;
            
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        
        var key, props = this.exp_LayerProperties, value;
		for (key in props)
	    {
            this.exp_CurLayerPropName = key;
            this.exp_CurLayerPropValue = props[key];
            
            // trigger current event
            if (solModifierAfterCnds)
		        this.runtime.pushCopySol(current_event.solModifiers);
                
			current_event.retrigger();

            if (solModifierAfterCnds)
		    	this.runtime.popSol(current_event.solModifiers);            
		}

		this.exp_CurLayerPropName = "";
        this.exp_CurLayerPropValue = 0;
		return false;        
	};   
	Cnds.prototype.ForEachTilesetProperty = function ()
	{
        if (this.exp_tilesetRef == null)
            return false;
            
        var props = this.exp_tilesetRef.prope;
        if (props == null)
            return false;

        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        
        var key, value;
		for (key in props)
	    {
            this.exp_CurTilesetPropName = key;
            this.exp_CurTilesetPropValue = props[key];
            	 
            // trigger current event       
            if (solModifierAfterCnds)
		        this.runtime.pushCopySol(current_event.solModifiers);
                
			current_event.retrigger();

            if (solModifierAfterCnds)
		    	this.runtime.popSol(current_event.solModifiers);             
		}

		this.exp_CurTilesetPropName = "";
        this.exp_CurTilesetPropValue = 0;
		return false;        
	};   
	Cnds.prototype.ForEachTileProperty = function ()
	{   
        if (this.exp_TileProperties == null)
            return false;
            
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        
        var key, props = this.exp_TileProperties, value;
		for (key in props)
	    {
            this.exp_CurTilePropName = key;
            this.exp_CurTilePropValue = props[key];
            
            // trigger current event    
            if (solModifierAfterCnds)
		        this.runtime.pushCopySol(current_event.solModifiers);
                
			current_event.retrigger();

            if (solModifierAfterCnds)
		    	this.runtime.popSol(current_event.solModifiers);                
		}

		this.exp_CurTilePropName = "";
        this.exp_CurTilePropValue = 0;
		return false;        
	};
	Cnds.prototype.ForEachMapProperty = function ()
	{   
        if (this.exp_MapProperties == null)
            return false;
            
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        
        var key, props = this.exp_MapProperties, value;
		for (key in props)
	    {
            this.exp_CurMapPropName = key;
            this.exp_CurMapPropValue = props[key];
           
            // trigger current event 	        
            if (solModifierAfterCnds)
		        this.runtime.pushCopySol(current_event.solModifiers);
                
			current_event.retrigger();

            if (solModifierAfterCnds)
		    	this.runtime.popSol(current_event.solModifiers);            
		}

		this.exp_CurMapPropName = "";
        this.exp_CurMapPropValue = 0;
		return false;        
	};	        
    Cnds.prototype.ForEachLayer = function ()
	{   
        if (this.tmxObj == null)
            return false;
            
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        
        var layers = this.tmxObj.layers;          
        var exp_LayerName_save = this.exp_LayerName;
        var exp_LayerProperties_save = this.exp_LayerProperties;
        var exp_LayerOpacity_save = this.exp_LayerOpacity;
        
        var i, cnt=layers.length, layer;
		for (i=0; i<cnt; i++)
	    {
            layer = layers[i];
            this.exp_LayerName = layer.name;                
            this.exp_LayerProperties = layer.properties;
            this.exp_LayerOpacity = layer.opacity;  
            
            // trigger current event
            if (solModifierAfterCnds)
		        this.runtime.pushCopySol(current_event.solModifiers);
                  
			current_event.retrigger();

            if (solModifierAfterCnds)
		    	this.runtime.popSol(current_event.solModifiers);              
		}

        this.exp_LayerName = exp_LayerName_save;
        this.exp_LayerProperties = exp_LayerProperties_save;
        this.exp_LayerOpacity = exp_LayerOpacity_save; 
        
		return false;        
	};
    Cnds.prototype.ForEachObjectProperty = function ()
	{   
        if (this.exp_objRef == null)
            return false;
        
        var props = this.exp_objRef.properties;
        if (props == null)
            return false;

        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        
        var key, value;
		for (key in props)
	    {
            this.exp_CurObjectPropName = key;
            this.exp_CurObjectPropValue = props[key];
            	      
            // trigger current event  
            if (solModifierAfterCnds)
		        this.runtime.pushCopySol(current_event.solModifiers);
                
			current_event.retrigger();

            if (solModifierAfterCnds)
		    	this.runtime.popSol(current_event.solModifiers);                   
		}

		this.exp_CurObjectPropName = "";
        this.exp_CurObjectPropValue = 0;
		return false;        
	};	
	 
    // duration
	Cnds.prototype.OnRetrieveFinished = function ()
	{
		return true;
	};
	Cnds.prototype.OnRetrieveDurationTick = function ()
	{
		return true;
	};   
	
	// retrieve one logic position
	Cnds.prototype.ForEachTileAtLXY = function (x, y)
	{
        if (this.tmxObj == null)
            return false;
    
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();            

        var objTypeSave = this.objType;
        this.objType = null;    
                
        var layers = this.tmxObj.layers;
        var layersCnt = layers.length;
        var i, tmxLayer, gid;      
        // tiles
        for(i=0; i<layersCnt; i++)
        {  
		    // fill expressions
            tmxLayer = layers[i];
            this.exp_LayerName = tmxLayer.name;        
            this.exp_LayerProperties = tmxLayer.properties;
            this.exp_LayerOpacity = tmxLayer.opacity;
            
            gid = this.readTileAtLXY(tmxLayer, x,y);
            if ((gid == null) || (gid === 0))
                continue;
		    // fill expressions            
            
            // trigger current event
            if (solModifierAfterCnds)
		        this.runtime.pushCopySol(current_event.solModifiers);
		                    
			current_event.retrigger();

            if (solModifierAfterCnds)
		    	this.runtime.popSol(current_event.solModifiers);             
        }
                
        this.objType = objTypeSave; 
        return false;
	};   	 
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
    Acts.prototype.ImportTMX = function (source, objType)
	{	     
        if (!objType)
            return;
        var parser = objType.getFirstPicked();
        if (!parser.TMXObjGet)
        {
            alert ("TMX Importer v2: wrong parser object.");
            return;
        }
        
        this.parseTmxContent(source, parser);
	};
    Acts.prototype.CreateTiles = function (objType)
	{	             
        this.retrieveTileArray(objType);
	};
    Acts.prototype.ReleaseTMX = function ()
	{	     
        this.releaseTmxObj();   
	};	
    Acts.prototype.SetOPosition = function (pox, poy)
	{	     
	    this.POX = pox;
	    this.POY = poy;
	    
	    if (this.layout)
	    {
            this.layout.SetPOX(pox);
            this.layout.SetPOY(poy);           
        }
	};
    Acts.prototype.RetrieveTileArray = function ()
	{	  
        this.retrieveTileArray();
	}; 
    Acts.prototype.CreateTilesDuration = function (objType, processingTime)
	{
        this.processingTime = processingTime;
	    this.durationStart(objType);
	};    
    Acts.prototype.RetrieveTileArrayDuration = function (processingTime)
	{
        this.processingTime = processingTime;
	    this.durationStart();	    
	}; 
	
    Acts.prototype.ResetTilemap = function (layerName, objType)
	{
        if (!objType)
            return;
        var c2TilemapInst = objType.getFirstPicked();
        if (!c2TilemapInst || !this.tmxObj)
            return;
            
        // get tmxLayer
		var layers=this.tmxObj.layers, i, cnt=layers.length, tmxLayer;
		for (i=0; i<cnt; i++)
		{		    
		    if (layers[i].name === layerName)
		    {
		        tmxLayer = layers[i];
		        break;
		    }
		}
		if (!tmxLayer)
		    return;
            
            
        // resize tilemap
		c2TilemapInst.mapwidth = this.exp_MapWidth;
		c2TilemapInst.mapheight = this.exp_MapHeight;
		c2TilemapInst.maybeResizeTilemap(true);
		//inst.setTilesFromRLECSV([...]);
		c2TilemapInst.setAllQuadMapChanged();
		c2TilemapInst.physics_changed = true;
		
		c2TilemapInst.tilewidth = this.exp_TileWidth;
		c2TilemapInst.tileheight = this.exp_TileHeight;
		var new_width = this.exp_TileWidth * this.exp_MapWidth;
		var new_height = this.exp_TileHeight * this.exp_MapHeight;
		if ((new_width !== c2TilemapInst.width) || (new_height !== c2TilemapInst.height))
		{
		    c2TilemapInst.width = new_width;
		    c2TilemapInst.height = new_height;
		    c2TilemapInst.set_bbox_changed();
		}  

        // no sprite instance created
        var objTypeSave = this.objType;
        this.objType = null;
        		
		// fill tiles
		var x, y, gid;
		for (y=0; y<this.exp_MapHeight; y++)
		{
		    for (x=0; x<this.exp_MapWidth; x++)
		    {
		        gid = this.readTileAtLXY(tmxLayer, x,y, true);
                if ((gid == null) || (gid === 0))  // null tile
                    gid = -1;
                else
                    gid -= 1;
                c2TilemapInst.setTileAt(x, y, gid);      
		    }
		}
		
		this.objType = objTypeSave;
	}; 	    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
    // tiles
	Exps.prototype.MapWidth = function (ret)
	{   
	    ret.set_int(this.exp_MapWidth);
	};
	Exps.prototype.MapHeight = function (ret)
	{   
	    ret.set_int(this.exp_MapHeight);
	};
	Exps.prototype.TileWidth = function (ret)
	{     
	    ret.set_int(this.exp_TileWidth);
	};
	Exps.prototype.TileHeight = function (ret)
	{    
	    ret.set_int(this.exp_TileHeight);
	}; 	
	Exps.prototype.TotalWidth = function (ret)
	{     
	    ret.set_int(this.exp_TotalWidth);
	};
	Exps.prototype.TotalHeight = function (ret)
	{    
	    ret.set_int(this.exp_TotalHeight);
	}; 	
	Exps.prototype.IsIsometric = function (ret)
	{    
	    ret.set_int(this.exp_IsIsometric? 1:0);
	}; 	
	Exps.prototype.ImageSource = function (ret, gid)
	{     
        var tilesetObj = (gid == null)? this.exp_tilesetRef : this.tmxObj.GetTileSet(gid);
	    ret.set_string((tilesetObj)? tilesetObj.image.source : "");
	};
	Exps.prototype.ImageWidth = function (ret, gid)
	{     
        var tilesetObj = (gid == null)? this.exp_tilesetRef : this.tmxObj.GetTileSet(gid);
	    ret.set_float((tilesetObj)? tilesetObj.image.width : 0);
	};
	Exps.prototype.ImageHeight = function (ret)
	{
        var tilesetObj = (gid == null)? this.exp_tilesetRef : this.tmxObj.GetTileSet(gid);
	    ret.set_float((tilesetObj)? tilesetObj.image.height : 0);
	}; 	
	
	Exps.prototype.TileID = function (ret)
	{    
	    ret.set_int(this.exp_TileID);
	}; 
	Exps.prototype.LogicX = function (ret)
	{   
	    ret.set_int(this.exp_LogicX);
	};
	Exps.prototype.LogicY = function (ret)
	{   
	    ret.set_int(this.exp_LogicY);
	};    
	Exps.prototype.LayerProp = function (ret, name, defaultValue)
	{   
        var value;
        if (this.exp_LayerProperties == null)
            value = defaultValue;
        else
        {
            value = this.exp_LayerProperties[name];
            if (value == null)
                value = defaultValue;
        }
	    ret.set_any(value);
	};
	Exps.prototype.TilesetProp = function (ret, name, defaultValue)
	{       
        var value;
        if (this.exp_tilesetRef == null)
            value = defaultValue;
        else
        {
            value = this.exp_tilesetRef.properties[name];
            if (value == null)
                value = defaultValue;        
        }
	    ret.set_any(value);
	};     
	Exps.prototype.TileProp = function (ret, name, defaultValue)
	{    
        var value    
        if (this.exp_TileProperties == null)
            value = defaultValue;
        else
        {
            value = this.exp_TileProperties[name];
            if (value == null)
                value = defaultValue;        
        }
	    ret.set_any(value);
	}; 
	Exps.prototype.PhysicalX = function (ret)
	{   
	    ret.set_int(this.exp_PhysicalX);
	};
	Exps.prototype.PhysicalY = function (ret)
	{   
	    ret.set_int(this.exp_PhysicalY);
	};
	Exps.prototype.LayerName = function (ret)
	{   
	    ret.set_string(this.exp_LayerName);
	};
	Exps.prototype.LayerOpacity = function (ret)
	{   
	    ret.set_float(this.exp_LayerOpacity);
	}; 
	Exps.prototype.IsMirrored = function (ret)
	{   
	    ret.set_int(this.exp_IsMirrored);
	};
	Exps.prototype.IsFlipped = function (ret)
	{   
	    ret.set_int(this.exp_IsFlipped);
	}; 
	Exps.prototype.InstUID = function (ret)
	{   
	    ret.set_int(this.exp_InstUID);
	}; 
	Exps.prototype.Frame = function (ret, gid)
	{   
        var frameIdx;
        if (gid == null)
            frameIdx = this.exp_Frame;
        else
        {
            var tilesetObj = this.tmxObj.GetTileSet(gid);
            frameIdx = gid - tilesetObj.firstgid;
        }
	    ret.set_int(frameIdx);
	};  
	Exps.prototype.TilesetName = function (ret, gid)
	{     
        var tilesetObj = (gid == null)? this.exp_tilesetRef : this.tmxObj.GetTileSet(gid);
	    ret.set_string((tilesetObj)? tilesetObj.name : "");
	};
	Exps.prototype.MapProp = function (ret, name, defaultValue)
	{   
        var value;
        if (this.exp_MapProperties == null)
            value = defaultValue;
        else
        {
            value = this.exp_MapProperties[name];
            if (value == null)
                value = defaultValue;
        }
	    ret.set_any(value);
	};	
	Exps.prototype.TileAngle = function (ret)
	{     
	    ret.set_float(this.exp_TileAngle);
	};    
	Exps.prototype.BackgroundColor = function (ret)
	{     
	    var val = this.exp_BaclgroundColor;
	    if (val == null)
	        val = 0;
	    ret.set_int(val);
	}; 
	
    // object group
	Exps.prototype.ObjGroupName = function (ret)
	{     
	    ret.set_string((this.exp_objGroupRef)? this.exp_objGroupRef.name : "");
	};    
	Exps.prototype.ObjGroupWidth = function (ret)
	{     
	    ret.set_float((this.exp_objGroupRef)? this.exp_objGroupRef.width : 0);
	};
	Exps.prototype.ObjGroupHeight = function (ret)
	{     
	    ret.set_float((this.exp_objGroupRef)? this.exp_objGroupRef.height : 0);
	};  
    
    // object
	Exps.prototype.ObjectName = function (ret)
	{     
	    ret.set_string((this.exp_objRef)? this.exp_objRef.name : "");
	};  
	Exps.prototype.ObjectType = function (ret)
	{ 
        ret.set_string((this.exp_objRef)? this.exp_objRef.type : "");    	    
	};     
	Exps.prototype.ObjectWidth = function (ret)
	{     
        ret.set_int((this.exp_objRef)? this.exp_objRef.width : 0);    	    
	};
	Exps.prototype.ObjectHeight = function (ret)
	{    
        ret.set_int((this.exp_objRef)? this.exp_objRef.height : 0);    	        	   
	};
	Exps.prototype.ObjectX = function (ret)
	{     
        ret.set_int((this.exp_objRef)? (this.exp_objRef.x + this.POX) : 0);    	        	       	    
	};
	Exps.prototype.ObjectY = function (ret)
	{     
        ret.set_int((this.exp_objRef)? (this.exp_objRef.y + this.POY) : 0);    	        	       	    
	};
    
	Exps.prototype.ObjectProp = function (ret, name, defaultValue)
	{             
        var value;
        if (this.exp_objRef == null)
            value = defaultValue;
        else
        {
            value = this.exp_objRef.properties[name];
            if (value == null)
                value = defaultValue;
        }
	    ret.set_any(value);
	};
    
    // ef_deprecated    
	Exps.prototype.ObjectPX = Exps.prototype.ObjectX;
	Exps.prototype.ObjectPY = Exps.prototype.ObjectY;
    // ef_deprecated

	Exps.prototype.ObjectID = function (ret)
	{     
        ret.set_int((this.exp_objRef)? this.exp_objRef.id : 0);    	        	       	    
	};    
 
	Exps.prototype.ObjectRotation = function (ret)
	{     
        ret.set_float((this.exp_objRef)? this.exp_objRef.rotation : 0);    	        	       	    
	};    
 
	Exps.prototype.ObjectRefGID = function (ret)
	{     
        ret.set_int((this.exp_objRef)? this.exp_objRef.gid : -1);    	        	       	    
	};      
    
    // for each property
	Exps.prototype.CurLayerPropName = function (ret)
	{
		ret.set_string(this.exp_CurLayerPropName);
	};    
	Exps.prototype.CurLayerPropValue = function (ret)
	{
		ret.set_any(this.exp_CurLayerPropValue);
	};    
	Exps.prototype.CurTilesetPropName = function (ret)
	{
		ret.set_string(this.exp_CurTilesetPropName);
	};    
	Exps.prototype.CurTilesetPropValue = function (ret)
	{
		ret.set_any(this.exp_CurTilesetPropValue);
	};     
	Exps.prototype.CurTilePropName = function (ret)
	{
		ret.set_string(this.exp_CurTilePropName);
	};    
	Exps.prototype.CurTilePropValue = function (ret)
	{
		ret.set_any(this.exp_CurTilePropValue);
	};    
	Exps.prototype.CurMapPropName = function (ret)
	{
		ret.set_string(this.exp_CurMapPropName);
	};    
	Exps.prototype.CurMapPropValue = function (ret)
	{
		ret.set_any(this.exp_CurMapPropValue);
	};    	
	Exps.prototype.CurObjectPropName = function (ret)
	{
		ret.set_string(this.exp_CurObjectPropName);
	};    
	Exps.prototype.CurObjectPropValue = function (ret)
	{
		ret.set_any(this.exp_CurObjectPropValue);
	};       
	
    // duration
	Exps.prototype.RetrievingPercent = function (ret)
	{     
	    ret.set_float(this.exp_RetrievingPercent);
	};	
	
	Exps.prototype.POX = function (ret)
	{    
	    ret.set_float(this.POX);
	}; 
	Exps.prototype.POY = function (ret)
	{   
	    ret.set_float(this.POY);
	};	
	
	// hexagon
	Exps.prototype.IsUp2Down = function (ret)
	{    
	    ret.set_int(this.exp_isUp2Down? 1:0);
	}; 
	Exps.prototype.IsIndent = function (ret)
	{   
	    ret.set_int(this.exp_isIndent? 1:0);
	};		
	
// ----
// square layout
    var SquareLayoutKlass = function(pox, poy, width, height, mode)
    {
        this.mode = mode;
        this.SetPOX(pox);
        this.SetPOY(poy);
        this.SetWidth(width);
        this.SetHeight(height);
    };
    var SquareLayoutKlassProto = SquareLayoutKlass.prototype;
      
	SquareLayoutKlassProto.SetPOX = function(pox)
	{
        this.PositionOX = pox;       
	}; 
	SquareLayoutKlassProto.SetPOY = function(poy)
	{
        this.PositionOY = poy;
	}; 
		
	SquareLayoutKlassProto.SetWidth = function(width)
	{
        this.width = width;
        this.halfWidth = width/2;        
	}; 
	SquareLayoutKlassProto.SetHeight = function(height)
	{
        this.height = height;
        this.halfHeight = height/2;        
	};   
    SquareLayoutKlassProto.LXYZ2PX =function(lx, ly, lz)
	{
	    var x;
	    if (this.mode == 0)  // Orthogonal
	    {
	        x = lx * this.width;
	    }
	    else if (this.mode == 1)  // Isometric
	    {
	        x = (lx - ly) * this.halfWidth;
	    }
	    else if (this.mode == 2)  // Staggered
	    {
	        x = lx * this.width;
	        if (ly&1)
	            x += this.halfWidth;
	    }

        return x+this.PositionOX;
	};
	SquareLayoutKlassProto.LXYZ2PY = function (lx, ly, lz)
	{
	    var y;
	    if (this.mode == 0)  // Orthogonal
	    {
	        y = ly * this.height;
	    }
	    else if (this.mode == 1)  // Isometric
	    {
	        y = (lx + ly) * this.halfHeight;
	    }
	    else if (this.mode == 2)  // Staggered
	    {
	        y = ly * this.halfHeight;
	    }

        return y+this.PositionOY;
	};   

// hex layout 
    var ODD_R = 0;
    var EVEN_R = 1;
    var ODD_Q = 2;
    var EVEN_Q = 3;  
    var HexLayoutKlass = function(pox, poy, width, height, mode)
    {
        this.mode = mode;
        this.SetPOX(pox);
        this.SetPOY(poy);
        this.SetWidth(width);
        this.SetHeight(height);
    };
    var HexLayoutKlassProto = HexLayoutKlass.prototype;
      
	HexLayoutKlassProto.SetPOX = function(pox)
	{
        this.PositionOX = pox;       
	}; 
	HexLayoutKlassProto.SetPOY = function(poy)
	{
        this.PositionOY = poy;
	}; 
		   
	HexLayoutKlassProto.SetWidth = function(width)
	{
        this.width = width;
        this.halfWidth = width/2;      
	}; 
	HexLayoutKlassProto.SetHeight = function(height)
	{
        this.height = height; 
        this.halfHeight = height/2;   
	};   
    HexLayoutKlassProto.LXYZ2PX = function(lx, ly, lz)
	{
	    var px;
	    switch (this.mode)
	    {
	    case ODD_R:
	        px = (lx*this.width) + this.PositionOX;
	        if (ly&1)
	            px += this.halfWidth;	        
	    break;
	    
	    case EVEN_R:
	        px = (lx*this.width) + this.PositionOX;
	        if (ly&1)
	            px -= this.halfWidth;	   	        
	    break;
	    
	    case ODD_Q:
	    case EVEN_Q:	    
	        px = (lx*this.width) + this.PositionOX;
	    break;	    
	    }
        return px;
	};
	HexLayoutKlassProto.LXYZ2PY = function(lx, ly, lz)
	{
	    var py;
	    switch (this.mode)
	    {
	    case ODD_R:
	    case EVEN_R:
	        py = (ly*this.height) + this.PositionOY;	        
	    break;
	    
	    case ODD_Q:
	        py = (ly*this.height) + this.PositionOY;
	        if (lx&1)
	            py += this.halfHeight;	        
	    break;
	    
	    case EVEN_Q:	    
	        py = (ly*this.height) + this.PositionOY;
	        if (lx&1)
	            py -= this.halfHeight;	  	        
	    break;	    
	    }
        return py;
	};   

// ----		
}());