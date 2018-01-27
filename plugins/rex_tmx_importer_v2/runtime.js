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
        this.processing_time = 0.5;
        this.exp_RetrievingPercent = 0;         
              
        this._tmx_obj = null;  
        this._obj_type = null;
        this._c2_layer = null;        
        this.layout = null;
        this._created_inst = null;
        
        // official save load
        this.tmx_source = null;
        this.parser_uid = null;
        this.save_pox = null;
        this.save_poy = null;
        
        // duration
        this._duration_reset();     
	};
    
    instanceProto.import_tmxObj = function (source, parser)
    {
        var tmx_obj = parser.TMXObjGet(source);        
        this.ImportTMX(tmx_obj);
        
        this.tmx_source = source;
        this.parser_uid = parser.uid;
    };
    instanceProto.release_tmxObj = function ()
    {
        this._tmx_obj = null;    
        
        this.tmx_source = null;
        this.parser_uid = null;
        this.save_pox = null;
        this.save_poy = null;       
    };    
    
        
	instanceProto.ImportTMX = function(tmx_obj)
	{        	    
        this._tmx_obj = tmx_obj;
        this.exp_MapWidth = this._tmx_obj.map.width;
        this.exp_MapHeight = this._tmx_obj.map.height;  
        this.exp_TileWidth = this._tmx_obj.map.tilewidth; 
        this.exp_TileHeight = this._tmx_obj.map.tileheight; 
        this.exp_IsIsometric = (this._tmx_obj.map.orientation == "isometric");
        this.exp_TotalWidth = (this.exp_IsIsometric)? ((this.exp_MapWidth+this.exp_MapHeight)/2)*this.exp_TileWidth: 
                                                      this.exp_MapWidth*this.exp_TileWidth;
        this.exp_TotalHeight = (this.exp_IsIsometric)? ((this.exp_MapWidth+this.exp_MapHeight)/2)*this.exp_TileHeight: 
                                                       this.exp_MapHeight*this.exp_TileHeight;
        this.exp_BaclgroundColor = this._tmx_obj.map.backgroundcolor;                                                       
        this.exp_MapProperties = this._tmx_obj.map.properties;
        
        
        // setup this.layout
        var orientation = this._tmx_obj.map.orientation;
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
            var is_up2down = (this._tmx_obj.map.staggeraxis === "x");
            var is_even = (this._tmx_obj.map.staggerindex === "even");
            var mode = (!is_up2down && !is_even)? ODD_R:
                       (!is_up2down &&  is_even)? EVEN_R:
                       ( is_up2down && !is_even)? ODD_Q:
                       ( is_up2down &&  is_even)? EVEN_Q:0; 
        
            this.layout = new HexLayoutKlass(this.POX, this.POY, 
                                             this.exp_TileWidth, this.exp_TileHeight, mode);
                                             
            this.exp_isUp2Down = is_up2down;
            this.exp_isIndent = is_even;                                             
        }
                
	};
	instanceProto.RetrieveTileArray = function(obj_type)
	{
	    // tiles
        this._retrieve_tiles(obj_type);
           
        // objects
        this._retrieve_objects();
        this.runtime.trigger(cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnRetrieveFinished, this);
	};
	
	
	var get_tile_angle = function (_gid)
	{
        var rotate = (_gid >> 29) & 0x7;
        var tile_angle;
        switch (rotate)
        {
        case 5: tile_angle = 90;  break;
        case 6: tile_angle = 180; break;
        case 3: tile_angle = 270; break;
        default: tile_angle = 0;  break;
        }
        return tile_angle; 
    }

	// bitmaks to check for flipped & rotated tiles
	var FlippedHorizontallyFlag		= 0x80000000;
	var FlippedVerticallyFlag		= 0x40000000;
	var FlippedAntiDiagonallyFlag   = 0x20000000;   	
	instanceProto._read_tile_at_LXY = function(tmx_layer, x, y, is_raw_data)
	{
        var idx = (tmx_layer.width * y) + x;
	    var _gid = tmx_layer.data[idx];	    
        if ((_gid == null) || (_gid === 0) || is_raw_data)
            return _gid;     // return gid                    
     
        // prepare expressions
        this.exp_TileID = _gid & ~(FlippedHorizontallyFlag | FlippedVerticallyFlag | FlippedAntiDiagonallyFlag);  
        this.exp_LogicX = x;
        this.exp_LogicY = y;
        this.exp_PhysicalX = this.layout.LXYZ2PX(x,y);
        this.exp_PhysicalY = this.layout.LXYZ2PY(x,y);
        this.exp_TileAngle = get_tile_angle(_gid);
        if (this.exp_TileAngle == 0)
        {
            this.exp_IsMirrored = ((_gid & FlippedHorizontallyFlag) !=0)? 1:0;
            this.exp_IsFlipped = ((_gid & FlippedVerticallyFlag) !=0)? 1:0;
        }
        else
        {
            this.exp_IsMirrored = 0;
            this.exp_IsFlipped = 0;
        }
        var tileset_obj = this._tmx_obj.GetTileSet(this.exp_TileID);
        this.exp_tilesetRef = tileset_obj;
        var tile_obj = tileset_obj.tiles[this.exp_TileID];
        this.exp_Frame = this.exp_TileID - tileset_obj.firstgid;
        this.exp_TileProperties = (tile_obj != null)? tile_obj.properties: null;

        if (this._obj_type)       
            this._created_inst = this._create_instance(this.exp_PhysicalX, this.exp_PhysicalY);         
        else
            this._created_inst = null;
                            
        return _gid;  // return gid
    };

	instanceProto._create_layer_objects = function(tmx_layer, layer_index)
	{	  
	    var c2_layer = this._get_layer(tmx_layer.name);
        this._c2_layer = c2_layer;
        if (this._obj_type && !c2_layer)
        {
            alert('TMX Importer: Can not find "' + tmx_layer.name + '" layer');
        }
        
        if (this._obj_type && c2_layer && (this.exp_BaclgroundColor != null) && 
             (layer_index === 0) )
        {
            cr.system_object.prototype.acts.SetLayerBackground.call(this, c2_layer, this.exp_BaclgroundColor);
            //cr.system_object.prototype.acts.SetLayerTransparent.call(this, c2_layer, 0);            
        }
            
        var width = tmx_layer.width;
        var height = tmx_layer.height;
        var x,y,inst,tileset_obj,tile_obj,layer_opacity,_gid; 
        var i=0, _gid;
        
        this.exp_LayerName = tmx_layer.name;        
        this.exp_LayerProperties = tmx_layer.properties;
        this.exp_LayerOpacity = tmx_layer.opacity;
        for (y=0; y<height; y++)
        {
            for (x=0; x<width; x++)
            {     
                _gid = this._read_tile_at_LXY(tmx_layer, x,y);
                if ((_gid == null) || (_gid === 0))
                    continue;

                // trigger callback
                this.runtime.trigger(cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnEachTileCell, this); 
            }
        }         
	};

            	
	instanceProto._create_instance = function(px, py)
	{
        var inst = this.runtime.createInstance(this._obj_type, this._c2_layer, px, py );
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
	    
    instanceProto._get_layer = function(layerparam)
    {
        return (typeof layerparam == "number")?
               this.runtime.getLayerByNumber(layerparam):
               this.runtime.getLayerByName(layerparam);
    };   
	instanceProto._retrieve_tiles = function(obj_type)
	{
        this._obj_type = obj_type;
        	    
        var layers = this._tmx_obj.layers;
        var layers_cnt = layers.length;
        var i;
        // tiles
        for(i=0; i<layers_cnt; i++)
        {
           this._create_layer_objects(layers[i], i);
        }           
           
        this._obj_type = null;
	};
	
	instanceProto._read_obj = function (obj)
	{
        this.exp_objRef = obj;
        return true;
    }
                	        
    instanceProto._retrieve_objects = function()
    {
        var obj_groups = this._tmx_obj.objectgroups;
        var i, group, group_cnt=obj_groups.length;
        var j, obj, objs, obj_cnt;
        var x,y;
        for (i=0; i<group_cnt; i++)
        {
            group = obj_groups[i];
            this.exp_objGroupRef = obj_groups[i];           
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
    instanceProto._duration_start = function(tile_objtype)
    {
        this._duration_reset();       
        this._duration_info.total_objects_count = _get_tiles_cnt(this._tmx_obj) + _get_objects_cnt(this._tmx_obj);
        this._obj_type = tile_objtype;        
        this.runtime.tickMe(this);
        this.tick();
    }; 
    instanceProto._duration_reset = function()
    {
        this._duration_info = {working_time:(1/60)*1000*this.processing_time,
                               state:0, // 0=idle, 1=retrieve tile layer, 2=retrieve object layer
                               goto_next_state:false,
                               total_objects_count:0,
                               current_objects_count:0,
                               tile_layer:{layer_index:0,data_index:0},
                               object_layer:{group_index:0,object_index:0},
                               };
    }; 
    instanceProto.tick = function()
    {                
        var unit_cnt, is_timeout=false;
        var start_time = Date.now();
        var working_time = this._duration_info.working_time;
        // fix working_time
        while (!is_timeout)
        {
            assert2(this._tmx_obj, "TMX Importer: Can not find tmx object.");
            
            unit_cnt = this._retrieve_one_tile_prepare();
            
            this._duration_info.current_objects_count += unit_cnt;
            this.exp_RetrievingPercent = (this._duration_info.current_objects_count/this._duration_info.total_objects_count);
            
            if (unit_cnt > 0)
                this._retrieve_one_tile_callevent();

            if (this.exp_RetrievingPercent === 1)
                break;
            else if (this._duration_info.goto_next_state)
            {
                this._duration_info.state += 1;                
                this._duration_info.goto_next_state = false;
            }

            if (unit_cnt > 0)
                is_timeout = (Date.now() - start_time) > working_time;
        }
		this.runtime.trigger(cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnRetrieveDurationTick, this); 
		if (this.exp_RetrievingPercent === 1)
		    this._duration_finished();   
    };    
    instanceProto._duration_finished = function()
    {
        this._duration_info.state = 0;
        this._obj_type = null;  
        this.runtime.untickMe(this);
        this.runtime.trigger(cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnRetrieveFinished, this);
    };
    
    var _get_tiles_cnt = function(tmx_obj)
    {
        var layers = tmx_obj.layers;
        var i, layers_cnt = layers.length;
        var tile_cnt, total_tiles_cnt=0;
        for(i=0; i<layers_cnt; i++)
           total_tiles_cnt += layers[i].data.length;
        return total_tiles_cnt;
    };     
    var _get_objects_cnt = function(tmx_obj)
    {
        var obj_groups = tmx_obj.objectgroups;
        var i, group_cnt=obj_groups.length;
        var obj_cnt, total_objects_cnt=0;
        for (i=0; i<group_cnt; i++)        
            total_objects_cnt += obj_groups[i].objects.length; 
        return total_objects_cnt;
    };          
    instanceProto._retrieve_one_tile_prepare = function()
    {
        var unit_cnt;
        switch (this._duration_info.state)
        {
        case 0: unit_cnt = this._retrieve_one_tile();     break;
        case 1: unit_cnt = this._retrieve_one_object();   break;
        }

        
        return unit_cnt;   
    };
    
    instanceProto._retrieve_one_tile = function()
    {   
        var unit_cnt=0, _gid;
        var layer_index,data_index,layers,tmx_layer,c2_layer,x,y;

        while (1)
        {
            layer_index = this._duration_info.tile_layer.layer_index;
            data_index = this._duration_info.tile_layer.data_index;
            tmx_layer = this._tmx_obj.layers[layer_index];
            if (!tmx_layer)
            {
                // finish
                this._duration_info.goto_next_state = true;
                return unit_cnt;
            }
       
            // check c2 layer
            c2_layer =  this._get_layer(tmx_layer.name);
            this._c2_layer = c2_layer;
            if (this._obj_type && !c2_layer)
            {
                alert('TMX Importer: Can not find "' + tmx_layer.name + '" layer'); 
            }
            
            // set layer background color
            if (this._obj_type && c2_layer && (this.exp_BaclgroundColor != null) &&
               (layer_index === 0) && (data_index === 0))
            {
                cr.system_object.prototype.acts.SetLayerBackground.call(this, c2_layer, this.exp_BaclgroundColor);
                //cr.system_object.prototype.acts.SetLayerTransparent.call(this, c2_layer, 0);            
            } 
                   

            x = data_index%tmx_layer.width;
            y = (data_index-x)/tmx_layer.height;                   
            _gid = this._read_tile_at_LXY(tmx_layer, x,y);
            if (_gid == null)
            {
                this._duration_info.tile_layer.layer_index += 1; // next layer
                this._duration_info.tile_layer.data_index = 0;    // start from 0 
                continue; 
            }
            else  // _gid == 0 or _gid > 0
            {
                unit_cnt += 1;
                this._duration_info.tile_layer.data_index += 1;  // next tile
                if (_gid > 0)
                    return unit_cnt; 
                else 
                    continue;
            }                         
        }   
    }; 
    
    instanceProto._retrieve_one_object = function()
    {
        var objectgroups = this._tmx_obj.objectgroups;
        var group, obj;
        while (1)
        {
            group = objectgroups[this._duration_info.object_layer.group_index];
            if (!group)
            {
                // finish
                this._duration_info.goto_next_state = true;
                return 0; 
            }
            this.exp_objGroupRef = group;            
            obj = group.objects[this._duration_info.object_layer.object_index];                   
            if (obj)  // get valid object
            {
                this._read_obj(obj);
                this._duration_info.object_layer.object_index += 1;  // next index            
                return 1;
            }            
            else    // no object in this group
            {
                this._duration_info.object_layer.group_index += 1;  // try next group
                this._duration_info.object_layer.object_index = 0;  // start from 0
                continue;
            }
        }
    };  
      
    instanceProto._retrieve_one_tile_callevent = function()
    {
        var trg;
        switch (this._duration_info.state)
        {
        case 0: trg = cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnEachTileCell;   break;
        case 1: trg = cr.plugins_.Rex_tmx_importer_v2.prototype.cnds.OnEachObject;     break;
        }
        this.runtime.trigger(trg, this);
    };  
    
	instanceProto.saveToJSON = function ()
	{   
		return { "src": this.tmx_source,
		         "parserUid": this.parser_uid,
                 "pox": (this.layout)? this.layout.PositionOX : null,
                 "poy": (this.layout)? this.layout.PositionOY : null
		         };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        this.release_tmxObj();
        
	    this.tmx_source = o["src"];
	    this.parser_uid = o["parserUid"];
        this.save_pox = o["pox"];
        this.save_poy = o["poy"];        
	};    
    
	instanceProto.afterLoad = function ()
	{
        if (this.parser_uid === null)
            return;
            
        var parser = this.runtime.getObjectByUID(this.parser_uid);
        assert2(parser, "TMX Importer: Failed to find parser object by UID");
        
        this.import_tmxObj(this.tmx_source, parser);
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
        var inst = this._created_inst;
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
        if (this._tmx_obj == null)
            return false;
            
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        
        var layers = this._tmx_obj.layers;          
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
        if (this._tmx_obj == null)
            return false;
    
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();            

        var obj_type_save = this._obj_type;
        this._obj_type = null;    
                
        var layers = this._tmx_obj.layers;
        var layers_cnt = layers.length;
        var i, tmx_layer, _gid;      
        // tiles
        for(i=0; i<layers_cnt; i++)
        {  
		    // fill expressions
            tmx_layer = layers[i];
            this.exp_LayerName = tmx_layer.name;        
            this.exp_LayerProperties = tmx_layer.properties;
            this.exp_LayerOpacity = tmx_layer.opacity;
            
            _gid = this._read_tile_at_LXY(tmx_layer, x,y);
            if ((_gid == null) || (_gid === 0))
                continue;
		    // fill expressions            
            
            // trigger current event
            if (solModifierAfterCnds)
		        this.runtime.pushCopySol(current_event.solModifiers);
		                    
			current_event.retrigger();

            if (solModifierAfterCnds)
		    	this.runtime.popSol(current_event.solModifiers);             
        }
                
        this._obj_type = obj_type_save; 
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
        
        this.import_tmxObj(source, parser);
	};
    Acts.prototype.CreateTiles = function (obj_type)
	{	             
        this.RetrieveTileArray(obj_type);
	};
    Acts.prototype.ReleaseTMX = function ()
	{	     
        this.release_tmxObj();   
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
        this.RetrieveTileArray();
	}; 
    Acts.prototype.CreateTilesDuration = function (obj_type, processing_time)
	{
        this.processing_time = processing_time;
	    this._duration_start(obj_type);
	};    
    Acts.prototype.RetrieveTileArrayDuration = function (processing_time)
	{
        this.processing_time = processing_time;
	    this._duration_start();	    
	}; 
	
    Acts.prototype.ResetTilemap = function (layer_name, objType)
	{
        if (!objType)
            return;
        var tilemap_inst = objType.getFirstPicked();
        if (!tilemap_inst || !this._tmx_obj)
            return;
            
        // get tmx_layer
		var layers=this._tmx_obj.layers, i, cnt=layers.length, tmx_layer;
		for (i=0; i<cnt; i++)
		{		    
		    if (layers[i].name === layer_name)
		    {
		        tmx_layer = layers[i];
		        break;
		    }
		}
		if (!tmx_layer)
		    return;
            
            
        // resize tilemap
		tilemap_inst.mapwidth = this.exp_MapWidth;
		tilemap_inst.mapheight = this.exp_MapHeight;
		tilemap_inst.maybeResizeTilemap(true);
		//inst.setTilesFromRLECSV([...]);
		tilemap_inst.setAllQuadMapChanged();
		tilemap_inst.physics_changed = true;
		
		tilemap_inst.tilewidth = this.exp_TileWidth;
		tilemap_inst.tileheight = this.exp_TileHeight;
		var new_width = this.exp_TileWidth * this.exp_MapWidth;
		var new_height = this.exp_TileHeight * this.exp_MapHeight;
		if ((new_width !== tilemap_inst.width) || (new_height !== tilemap_inst.height))
		{
		    tilemap_inst.width = new_width;
		    tilemap_inst.height = new_height;
		    tilemap_inst.set_bbox_changed();
		}  

        // no sprite instance created
        var obj_type_save = this._obj_type;
        this._obj_type = null;
        		
		// fill tiles
		var x, y, _gid;
		for (y=0; y<this.exp_MapHeight; y++)
		{
		    for (x=0; x<this.exp_MapWidth; x++)
		    {
		        _gid = this._read_tile_at_LXY(tmx_layer, x,y, true);
                if ((_gid == null) || (_gid === 0))  // null tile
                    _gid = -1;
                else
                    _gid -= 1;
                tilemap_inst.setTileAt(x, y, _gid);      
		    }
		}
		
		this._obj_type = obj_type_save;
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
        var tileset_obj = (gid == null)? this.exp_tilesetRef : this._tmx_obj.GetTileSet(gid);
	    ret.set_string((tileset_obj)? tileset_obj.image.source : "");
	};
	Exps.prototype.ImageWidth = function (ret, gid)
	{     
        var tileset_obj = (gid == null)? this.exp_tilesetRef : this._tmx_obj.GetTileSet(gid);
	    ret.set_float((tileset_obj)? tileset_obj.image.width : 0);
	};
	Exps.prototype.ImageHeight = function (ret)
	{
        var tileset_obj = (gid == null)? this.exp_tilesetRef : this._tmx_obj.GetTileSet(gid);
	    ret.set_float((tileset_obj)? tileset_obj.image.height : 0);
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
	Exps.prototype.LayerProp = function (ret, name, default_value)
	{   
        var value;
        if (this.exp_LayerProperties == null)
            value = default_value;
        else
        {
            value = this.exp_LayerProperties[name];
            if (value == null)
                value = default_value;
        }
	    ret.set_any(value);
	};
	Exps.prototype.TilesetProp = function (ret, name, default_value)
	{       
        var value;
        if (this.exp_tilesetRef == null)
            value = default_value;
        else
        {
            value = this.exp_tilesetRef.properties[name];
            if (value == null)
                value = default_value;        
        }
	    ret.set_any(value);
	};     
	Exps.prototype.TileProp = function (ret, name, default_value)
	{    
        var value    
        if (this.exp_TileProperties == null)
            value = default_value;
        else
        {
            value = this.exp_TileProperties[name];
            if (value == null)
                value = default_value;        
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
            var tileset_obj = this._tmx_obj.GetTileSet(gid);
            frameIdx = gid - tileset_obj.firstgid;
        }
	    ret.set_int(frameIdx);
	};  
	Exps.prototype.TilesetName = function (ret, gid)
	{     
        var tileset_obj = (gid == null)? this.exp_tilesetRef : this._tmx_obj.GetTileSet(gid);
	    ret.set_string((tileset_obj)? tileset_obj.name : "");
	};
	Exps.prototype.MapProp = function (ret, name, default_value)
	{   
        var value;
        if (this.exp_MapProperties == null)
            value = default_value;
        else
        {
            value = this.exp_MapProperties[name];
            if (value == null)
                value = default_value;
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
    
	Exps.prototype.ObjectProp = function (ret, name, default_value)
	{             
        var value;
        if (this.exp_objRef == null)
            value = default_value;
        else
        {
            value = this.exp_objRef.properties[name];
            if (value == null)
                value = default_value;
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
        this.half_width = width/2;        
	}; 
	SquareLayoutKlassProto.SetHeight = function(height)
	{
        this.height = height;
        this.half_height = height/2;        
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
	        x = (lx - ly) * this.half_width;
	    }
	    else if (this.mode == 2)  // Staggered
	    {
	        x = lx * this.width;
	        if (ly&1)
	            x += this.half_width;
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
	        y = (lx + ly) * this.half_height;
	    }
	    else if (this.mode == 2)  // Staggered
	    {
	        y = ly * this.half_height;
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
        this.half_width = width/2;      
	}; 
	HexLayoutKlassProto.SetHeight = function(height)
	{
        this.height = height; 
        this.half_height = height/2;   
	};   
    HexLayoutKlassProto.LXYZ2PX = function(lx, ly, lz)
	{
	    var px;
	    switch (this.mode)
	    {
	    case ODD_R:
	        px = (lx*this.width) + this.PositionOX;
	        if (ly&1)
	            px += this.half_width;	        
	    break;
	    
	    case EVEN_R:
	        px = (lx*this.width) + this.PositionOX;
	        if (ly&1)
	            px -= this.half_width;	   	        
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
	            py += this.half_height;	        
	    break;
	    
	    case EVEN_Q:	    
	        py = (ly*this.height) + this.PositionOY;
	        if (lx&1)
	            py -= this.half_height;	  	        
	    break;	    
	    }
        return py;
	};   

// ----		
}());