// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

// load socket.io.min.js
document.write('<script src="zlib_and_gzip.min.js"></script>');

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_TMXImporter = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_TMXImporter.prototype;
		
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
        // tiles
        this.exp_MapWidth = 0;
        this.exp_MapHeight = 0;  
        this.exp_TileWidth = 0;
        this.exp_TileHeight = 0;
        this.exp_TotalWidth = 0;
        this.exp_TotalHeight = 0; 
        this.exp_IsIsometric = 0;         
        this.exp_TileID = (-1);
		this.exp_TilesetName = "";
        this.exp_LogicX = (-1);
        this.exp_LogicY = (-1);  
        this.exp_PhysicalX = (-1);
        this.exp_PhysicalY = (-1);        
        this.exp_InstUID = (-1);
        this.exp_Frame = (-1);        
        this.exp_IsMirrored = 0;
        this.exp_IsFlipped = 0;        
        this.exp_LayerName = "";  
        this.exp_LayerOpacity = 1;  
        this.exp_map_properties = {};                
        this.exp_layer_properties = {};
        this.exp_tileset_properties = {};        
        this.exp_tile_properties = {};        
        
        // objects
		this.exp_ObjGroupName = "";        
        this.exp_ObjGroupWidth = 0;
        this.exp_ObjGroupHeight = 0;  
		this.exp_ObjectName = "";  
		this.exp_ObjectType = "";         
        this.exp_ObjectWidth = 0;
        this.exp_ObjectHeight = 0; 
        this.exp_ObjectLX = 0;
        this.exp_ObjectLY = 0; 
        this.exp_ObjectPX = 0;
        this.exp_ObjectPY = 0;         
        this.exp_object_properties = {};

        // for each property
        this.exp_CurLayerPropName = "";
        this.exp_CurLayerPropValue ="";
        this.exp_CurTilesetPropName = "";
        this.exp_CurTilesetPropValue ="";        
        this.exp_CurTilePropName = "";
        this.exp_CurTilePropValue ="";     
        this.exp_CurMapPropName = "";
        this.exp_CurMapPropValue ="";        
        
        // duration
        this.exp_RetrievingPercent = 0;      
        
        
        this._tmx_obj = null;  
        this._obj_type = null;
        this.layout = new cr.plugins_.Rex_TMXImporter.LayoutKlass(this, this.properties[0], this.properties[1],
                                                                  0,0,0);
        this._created_inst = null;
        
        // duration
        this._duration_reset();     
	};
	instanceProto.ImportTMX = function(tmx_string)
	{
        var isIE = this.runtime.isIE;
        this._tmx_obj = new cr.plugins_.Rex_TMXImporter.TMXKlass(tmx_string, isIE);
        this.exp_MapWidth = this._tmx_obj.map.width;
        this.exp_MapHeight = this._tmx_obj.map.height;  
        this.exp_TileWidth = this._tmx_obj.map.tilewidth; 
        this.exp_TileHeight = this._tmx_obj.map.tileheight; 
        this.exp_IsIsometric = (this._tmx_obj.map.orientation == "isometric");
        this.exp_TotalWidth = (this.exp_IsIsometric)? ((this.exp_MapWidth+this.exp_MapHeight)/2)*this.exp_TileWidth: 
                                                      this.exp_MapWidth*this.exp_TileWidth;
        this.exp_TotalHeight = (this.exp_IsIsometric)? ((this.exp_MapWidth+this.exp_MapHeight)/2)*this.exp_TileHeight: 
                                                       this.exp_MapHeight*this.exp_TileHeight;
        this.exp_map_properties = this._tmx_obj.map.properties;
	};
	instanceProto.RetrieveTileArray = function(obj_type)
	{
        this._layout_set(this._tmx_obj);
        var layers = this._tmx_obj.layers;
        var layers_cnt = layers.length;
        this._obj_type = obj_type;
        var i;
        // tiles
        for(i=0; i<layers_cnt; i++)
           this._create_layer_objects(layers[i]); 
        // objects
        this._retrieve_objects();
        this.runtime.trigger(cr.plugins_.Rex_TMXImporter.prototype.cnds.OnRetrieveFinished, this);
	};
	instanceProto._layout_set = function(tmx_obj)
	{
        this.layout.is_isometric = this.exp_IsIsometric;
        this.layout.SetWidth(this.exp_TileWidth);
        this.layout.SetHeight(this.exp_TileHeight);
	};	
	// bitmaks to check for flipped & rotated tiles
	var FlippedHorizontallyFlag		= 0x80000000;
	var FlippedVerticallyFlag		= 0x40000000;
	var FlippedAntiDiagonallyFlag   = 0x20000000;    
	instanceProto._create_layer_objects = function(tmx_layer)
	{
        var c2_layer =  this._get_layer(tmx_layer.name);
        if ((c2_layer == null) && (this._obj_type != null))
            alert('TMX Importer: Can not find "' + tmx_layer.name + '" layer'); 
        var width = tmx_layer.width;
        var height = tmx_layer.height;
        var data = tmx_layer.data;
        var x,y,inst,tileset_obj,tile_obj,layer_opacity,_gid; 
        var i=0;
        
        this.exp_LayerName = tmx_layer.name;        
        this.exp_layer_properties = tmx_layer.properties;
        this.exp_LayerOpacity = tmx_layer.opacity;
        for (y=0; y<height; y++)
        {
            for (x=0; x<width; x++)
            {     
                // get tile id
                _gid = data[i];
                i++;
                if (_gid == 0)
                    continue;
                
                // prepare expressions
                this.exp_TileID = _gid & ~(FlippedHorizontallyFlag | FlippedVerticallyFlag | FlippedAntiDiagonallyFlag);  
                this.exp_LogicX = x;
                this.exp_LogicY = y;
                this.exp_PhysicalX = this.layout.LXYZ2PX(x,y);
                this.exp_PhysicalY = this.layout.LXYZ2PY(x,y);
                this.exp_IsMirrored = ((_gid & FlippedHorizontallyFlag) !=0)? 1:0;
                this.exp_IsFlipped = ((_gid & FlippedVerticallyFlag) !=0)? 1:0;
                tileset_obj = this._tmx_obj.GetTileSet(this.exp_TileID);
				this.exp_TilesetName = tileset_obj.name;
                this.exp_tileset_properties = tileset_obj.properties;
                tile_obj = tileset_obj.tiles[this.exp_TileID];
                this.exp_Frame = this.exp_TileID - tileset_obj.firstgid;
                this.exp_tile_properties = (tile_obj != null)? tile_obj.properties: {};
                   
                if (this._obj_type != null)
                    this._created_inst = this._create_instance(x,y,c2_layer); 
                else
                    this._created_inst = null;
                    
                // trigger callback
                this.runtime.trigger(cr.plugins_.Rex_TMXImporter.prototype.cnds.OnEachTileCell, this); 
            }
        }         
	};
	instanceProto._create_instance = function(x,y,c2_layer)
	{  
        var inst = this.layout.CreateItem(this._obj_type,x,y,c2_layer);
        cr.plugins_.Sprite.prototype.acts.SetAnimFrame.apply(inst, [this.exp_TileID-1]);
        inst.opacity = this.exp_LayerOpacity;
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
    instanceProto._retrieve_objects = function()
    {
        var obj_groups = this._tmx_obj.objectgroups;
        var i, group, group_cnt=obj_groups.length;
        var j, obj, objs, obj_cnt;
        var x,y;
        for (i=0; i<group_cnt; i++)
        {
            group = obj_groups[i];
            this.exp_ObjGroupName = group.name;
            this.exp_ObjGroupWidth = group.width;
            this.exp_ObjGroupHeight = group.height;            
            objs = group.objects;
            obj_cnt = objs.length;
            for (j=0; j<obj_cnt; j++)
            {
                obj = objs[j];
                this.exp_ObjectName = obj.name;
                this.exp_ObjectType = obj.type;
                this.exp_ObjectWidth = obj.width / this.exp_TileWidth;
                this.exp_ObjectHeight = obj.height / this.exp_TileHeight;
                x = obj.x / this.exp_TileWidth;
                y = obj.y / this.exp_TileHeight;
                this.exp_ObjectLX = x;
                this.exp_ObjectLY = y;                
                this.exp_ObjectPX = this.layout.LXYZ2PX(x,y);
                this.exp_ObjectPY = this.layout.LXYZ2PY(x,y);                
                this.exp_object_properties = obj.properties;
                this.runtime.trigger(cr.plugins_.Rex_TMXImporter.prototype.cnds.OnEachObject, this); 
            }
        }
    };
    
    // duration mode
    instanceProto._duration_start = function(tile_objtype)
    {
        this._duration_reset();       
        this._duration_info.total_objects_count = _get_tiles_cnt(this._tmx_obj) + _get_objects_cnt(this._tmx_obj);
        this._layout_set(this._tmx_obj);
        this._obj_type = tile_objtype;        
        this.runtime.tickMe(this);
        this.tick();
    }; 
    instanceProto._duration_reset = function()
    {
        this._duration_info = {working_time:(1/60)*1000*0.5,
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
        var process_percent;
        var start_time = Date.now();
        var working_time = this._duration_info.working_time;
        // fix working_time
        while ((Date.now() - start_time) <= working_time)
        {
            this.exp_RetrievingPercent = this._retrieve_one_tile_prepare();
            this._retrieve_one_tile_callevent();
            if (this.exp_RetrievingPercent == 1)
                break;
            else if (this._duration_info.goto_next_state)
            {
                this._duration_info.state += 1;                
                this._duration_info.goto_next_state = false;
            }
        }
		this.runtime.trigger(cr.plugins_.Rex_TMXImporter.prototype.cnds.OnRetrieveDurationTick, this); 
		if (this.exp_RetrievingPercent == 1)
		    this._duration_finished();   
    };    
    instanceProto._duration_finished = function()
    {
        this._duration_info.state = 0;
        this.runtime.untickMe(this);
        this.runtime.trigger(cr.plugins_.Rex_TMXImporter.prototype.cnds.OnRetrieveFinished, this);
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
        if (this._duration_info.state == 1)
            unit_cnt = this._retrieve_one_tile();
        else
            unit_cnt = this._retrieve_one_object(); 
            
        this._duration_info.current_objects_count += unit_cnt;
        return (this._duration_info.current_objects_count/this._duration_info.total_objects_count);   
    };
    
    instanceProto._retrieve_one_tile = function()
    {   
        var unit_cnt=0;
        var layer_index,data_index,layers,layer,c2_layer,_gid,x,y;
        var tileset_obj,tile_obj;
        var is_valid = false;
        while (!is_valid)
        {
            layer_index = this._duration_info.tile_layer.layer_index;
            data_index = this._duration_info.tile_layer.data_index;

            layers = this._tmx_obj.layers;
            if (layers.length == 0)
            {
                this._duration_info.goto_next_state = true;  // tile layer retrieve finished
                return 0;
            }
            
            layer = layers[layer_index];
            c2_layer =  this._get_layer(layer.name);
            if ((c2_layer == null) && (this._obj_type != null))
                alert('TMX Importer: Can not find "' + tmx_layer.name + '" layer'); 
            // get tile id
            unit_cnt += 1;
            _gid = layer.data[data_index];            
            is_valid = (_gid != 0);
            if (is_valid)  
            {         
                this.exp_LayerName = layer.name;        
                this.exp_layer_properties = layer.properties;
                this.exp_LayerOpacity = layer.opacity;            
                this.exp_TileID = _gid & ~(FlippedHorizontallyFlag | FlippedVerticallyFlag | FlippedAntiDiagonallyFlag);       
                // prepare expressions
                x = data_index%layer.width;
                y = (data_index-x)/layer.height;
                this.exp_LogicX = x;
                this.exp_LogicY = y;
                this.exp_PhysicalX = this.layout.LXYZ2PX(x,y);
                this.exp_PhysicalY = this.layout.LXYZ2PY(x,y);
                this.exp_IsMirrored = ((_gid & FlippedHorizontallyFlag) !=0)? 1:0;
                this.exp_IsFlipped = ((_gid & FlippedVerticallyFlag) !=0)? 1:0;
                tileset_obj = this._tmx_obj.GetTileSet(this.exp_TileID);
		        this.exp_TilesetName = tileset_obj.name;
                this.exp_tileset_properties = tileset_obj.properties;
                tile_obj = tileset_obj.tiles[this.exp_TileID];
                this.exp_Frame = this.exp_TileID - tileset_obj.firstgid;
                this.exp_tile_properties = (tile_obj != null)? tile_obj.properties: {};
                   
                if (this._obj_type != null)
                    this._created_inst = this._create_instance(x,y,c2_layer); 
                else
                    this._created_inst = null;   
            }     
            
            // update index
            if (data_index == (layer.data.length-1))  // the last data index
            {
                if (layer_index != (layers.length-1))  // not the last layer
                {
                    this._duration_info.tile_layer.layer_index += 1;
                    this._duration_info.tile_layer.data_index = 0;  // start from 0                    
                }
                else
                {
                    this._duration_info.goto_next_state = true;  // tile layer retrieve finished
                    break;
                }
            }
            else
                this._duration_info.tile_layer.data_index += 1;    
        }   
        return unit_cnt;
    }; 
    
    instanceProto._retrieve_one_object = function()
    {
        var group_index = this._duration_info.object_layer.group_index;
        var object_index = this._duration_info.object_layer.object_index;
        
        var objectgroups = this._tmx_obj.objectgroups;
        if (objectgroups.length == 0)
        {
            this._duration_info.goto_next_state = true;
            return 0;
        }
        var group = objectgroups[group_index];
        this.exp_ObjGroupName = group.name;
        this.exp_ObjGroupWidth = group.width;
        this.exp_ObjGroupHeight = group.height; 
        var obj = group.objects[object_index];
        this.exp_ObjectName = obj.name;
        this.exp_ObjectType = obj.type;
        this.exp_ObjectWidth = obj.width / this.exp_TileWidth;
        this.exp_ObjectHeight = obj.height / this.exp_TileHeight;
        var x = obj.x / this.exp_TileWidth;
        var y = obj.y / this.exp_TileHeight;
        this.exp_ObjectLX = x;
        this.exp_ObjectLY = y;                
        this.exp_ObjectPX = this.layout.LXYZ2PX(x,y);
        this.exp_ObjectPY = this.layout.LXYZ2PY(x,y);                
        this.exp_object_properties = obj.properties;
        
        // update index
        if (object_index == (group.objects.length-1))  // the last object index
        {
            if (group_index != objectgroups.length-1)  // not the last object group
            {
                this._duration_info.object_layer.group_index += 1;
                this._duration_info.object_layer.object_index = 0;  // start from 0
            }
            else
            {
                this._duration_info.goto_next_state = true;  // objects layer retrieve finished
            }
        }
        else
            this._duration_info.object_layer.object_index += 1;
            
        return 1;
    };    
    instanceProto._retrieve_one_tile_callevent = function()
    {
        if (this._duration_info.state == 1)
            this.runtime.trigger(cr.plugins_.Rex_TMXImporter.prototype.cnds.OnEachTileCell, this); 
        else
            this.runtime.trigger(cr.plugins_.Rex_TMXImporter.prototype.cnds.OnEachObject, this); 
    };  
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
	  
	Cnds.prototype.OnEachTileCell = function ()
	{
        if (this._created_inst != null)
        {
            var sol = this._created_inst.type.getCurrentSol();
            sol.select_all = false;
		    sol.instances.length = 1;
		    sol.instances[0] = this._created_inst;    
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
        var current_event = this.runtime.getCurrentEventStack().current_event;
		
        var key, props = this.exp_layer_properties, value;
		for (key in props)
	    {
            this.exp_CurLayerPropName = key;
            this.exp_CurLayerPropValue = props[key];
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

		this.exp_CurLayerPropName = "";
        this.exp_CurLayerPropValue = "";
		return false;        
	};   
	Cnds.prototype.ForEachTilesetProperty = function ()
	{   
        var current_event = this.runtime.getCurrentEventStack().current_event;
		
        var key, props = this.exp_tileset_properties, value;
		for (key in props)
	    {
            this.exp_CurTilesetPropName = key;
            this.exp_CurTilesetPropValue = props[key];
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

		this.exp_CurTilesetPropName = "";
        this.exp_CurTilesetPropValue = "";
		return false;        
	};   
	Cnds.prototype.ForEachTileProperty = function ()
	{   
        var current_event = this.runtime.getCurrentEventStack().current_event;
		
        var key, props = this.exp_tile_properties, value;
		for (key in props)
	    {
            this.exp_CurTilePropName = key;
            this.exp_CurTilePropValue = props[key];
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

		this.exp_CurTilePropName = "";
        this.exp_CurTilePropValue = "";
		return false;        
	};
	Cnds.prototype.ForEachMapProperty = function ()
	{   
        var current_event = this.runtime.getCurrentEventStack().current_event;
		
        var key, props = this.exp_map_properties, value;
		for (key in props)
	    {
            this.exp_CurMapPropName = key;
            this.exp_CurMapPropValue = props[key];
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

		this.exp_CurMapPropName = "";
        this.exp_CurMapPropValue = "";
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
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
    Acts.prototype.ImportTMX = function (tmx_string)
	{	     
        this.ImportTMX(tmx_string);
	};
    Acts.prototype.CreateTiles = function (obj_type)
	{	     
        this.RetrieveTileArray(obj_type);
	};
    Acts.prototype.ReleaseTMX = function ()
	{	     
        this._tmx_obj = null;    
	};	
    Acts.prototype.SetOPosition = function (x,y)
	{	     
        this.layout.PositionOX = x;
        this.layout.PositionOY = y;        
	};
    Acts.prototype.RetrieveTileArray = function ()
	{	  
        this.RetrieveTileArray();
	}; 
    Acts.prototype.CreateTilesDuration = function (obj_type)
	{
	    this._duration_start(obj_type);
	};    
    Acts.prototype.RetrieveTileArrayDuration = function ()
	{
	    this._duration_start();	    
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
        var value = this.exp_layer_properties[name];
        if (value == null)
            value = default_value;
	    ret.set_any(value);
	};
	Exps.prototype.TilesetProp = function (ret, name, default_value)
	{       
        var value = this.exp_tileset_properties[name];
        if (value == null)
            value = default_value;        
	    ret.set_any(value);
	};     
	Exps.prototype.TileProp = function (ret, name, default_value)
	{       
        var value = this.exp_tile_properties[name];
        if (value == null)
            value = default_value;        
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
	    ret.set_int(this.exp_IsFlipped);
	}; 
	Exps.prototype.Frame = function (ret)
	{   
	    ret.set_int(this.exp_Frame);
	};  
	Exps.prototype.TilesetName = function (ret)
	{     
	    ret.set_string(this.exp_TilesetName);
	};
	Exps.prototype.MapProp = function (ret, name, default_value)
	{   
        var value = this.exp_map_properties[name];
        if (value == null)
            value = default_value;
	    ret.set_any(value);
	};	
    
    // objects
	Exps.prototype.ObjGroupName = function (ret)
	{     
	    ret.set_string(this.exp_ObjGroupName);
	};    
	Exps.prototype.ObjGroupWidth = function (ret)
	{     
	    ret.set_string(this.exp_ObjGroupWidth);
	};
	Exps.prototype.ObjGroupHeight = function (ret)
	{     
	    ret.set_string(this.exp_ObjGroupHeight);
	};  
	Exps.prototype.ObjectName = function (ret)
	{     
	    ret.set_string(this.exp_ObjectName);
	};  
	Exps.prototype.ObjectType = function (ret)
	{     
	    ret.set_string(this.exp_ObjectType);
	};     
	Exps.prototype.ObjectWidth = function (ret)
	{     
	    ret.set_int(this.exp_ObjectWidth);
	};
	Exps.prototype.ObjectHeight = function (ret)
	{     
	    ret.set_int(this.exp_ObjectHeight);
	};
	Exps.prototype.ObjectX = function (ret)
	{     
	    ret.set_int(this.exp_ObjectLX);
	};
	Exps.prototype.ObjectY = function (ret)
	{     
	    ret.set_int(this.exp_ObjectLY);
	};
	Exps.prototype.ObjectPX = function (ret)
	{     
	    ret.set_int(this.exp_ObjectPX);
	};
	Exps.prototype.ObjectPY = function (ret)
	{     
	    ret.set_int(this.exp_ObjectPY);
	};	
	Exps.prototype.ObjectProp = function (ret, name, default_value)
	{       
        var value = this.exp_object_properties[name];
        if (value == null)
            value = default_value;        
	    ret.set_any(value);
	}; 
    
    // for each property
	Exps.prototype.CurLayerPropName = function (ret)
	{
		ret.set_string(this.exp_CurLayerPropName);
	};    
	Exps.prototype.CurLayerPropValue = function (ret)
	{
		ret.set_string(this.exp_CurLayerPropValue);
	};    
	Exps.prototype.CurTilesetPropName = function (ret)
	{
		ret.set_string(this.exp_CurTilesetPropName);
	};    
	Exps.prototype.CurTilesetPropValue = function (ret)
	{
		ret.set_string(this.exp_CurTilesetPropValue);
	};     
	Exps.prototype.CurTilePropName = function (ret)
	{
		ret.set_string(this.exp_CurTilePropName);
	};    
	Exps.prototype.CurTilePropValue = function (ret)
	{
		ret.set_string(this.exp_CurTilePropValue);
	};    
	Exps.prototype.CurMapPropName = function (ret)
	{
		ret.set_string(this.exp_CurMapPropName);
	};    
	Exps.prototype.CurMapPropValue = function (ret)
	{
		ret.set_string(this.exp_CurMapPropValue);
	};    	
    
    // duration
	Exps.prototype.RetrievingPercent = function (ret)
	{     
	    ret.set_float(this.exp_RetrievingPercent);
	};		
}());

(function ()
{
    cr.plugins_.Rex_TMXImporter.TMXKlass = function(tmx_string, isIE)
    {
        var xml_obj=  new XMLParser(tmx_string, isIE);
        this.map = _get_map(xml_obj);
        this.tilesets = _get_tilesets(xml_obj);
        this.layers = _get_layers(xml_obj);
        this.objectgroups = _get_objectgroups(xml_obj);
    };
    var TMXKlassProto = cr.plugins_.Rex_TMXImporter.TMXKlass.prototype;

    TMXKlassProto.GetTileSet = function (gid)
    {
        var tilesets_cnt = this.tilesets.length;
        var i, tileset;
        for (i=tilesets_cnt-1; i>=0; i--)
        {
            tileset = this.tilesets[i];
            if (gid >= tileset.firstgid)
                return tileset;
        }
        return null;    
    }; 

    var _get_map = function (xml_obj)
    {     
        var map = {};          
        map.orientation = xml_obj.get_string_value("@orientation");
        map.width =  xml_obj.get_number_value("@width");
        map.height = xml_obj.get_number_value("@height");
        map.tilewidth = xml_obj.get_number_value("@tilewidth");
        map.tileheight = xml_obj.get_number_value("@tileheight");
        var xml_properties = xml_obj.get_nodes("./properties/property");
        map.properties = _get_properties(xml_obj, xml_properties);
        return map;           
    };
    var _get_tilesets = function (xml_obj)
    {  
        var xml_tilesets = xml_obj.get_nodes("//tileset");
        var tilesets = [];
        var xml_tileset = xml_tilesets.get_next_node();
        while (xml_tileset != null)
        {
            tilesets.push(_get_tileset(xml_obj, xml_tileset));
            xml_tileset = xml_tilesets.get_next_node();
        }
        return tilesets;
    };
    var _get_tileset = function(xml_obj, xml_tileset)
    {      
        var tileset = {};    
        tileset.name = xml_obj.get_string_value("@name", xml_tileset);
        tileset.firstgid = xml_obj.get_number_value("@firstgid", xml_tileset);
        tileset.tilewidth = xml_obj.get_number_value("@tilewidth", xml_tileset);
        tileset.tileheight = xml_obj.get_number_value("@tileheight", xml_tileset);
        tileset.spacing = xml_obj.get_number_value("@spacing", xml_tileset);
        tileset.margin = xml_obj.get_number_value("@margin", xml_tileset); 
        var xml_tiles = xml_obj.get_nodes("./tile", xml_tileset);
        tileset.tiles = _get_tiles(xml_obj, xml_tiles);
        
        var xml_properties = xml_obj.get_nodes("./properties/property", xml_tileset);
        tileset.properties = _get_properties(xml_obj, xml_properties);
        return tileset;
    };
    var _get_tiles = function(xml_obj, xml_tiles)
    {
        var tiles = {};  
        var id;
        var xml_tile = xml_tiles.get_next_node();    
     
        while (xml_tile != null)
        {
            id = xml_obj.get_number_value("@id", xml_tile) + 1;
            tiles[id] = _get_tile(xml_obj, xml_tile); 
            xml_tile = xml_tiles.get_next_node();
        }        
        return tiles;
    };
    var _get_tile = function(xml_obj, xml_tile)
    {    
        var tile = {};
        var xml_properties = xml_obj.get_nodes("./properties/property", xml_tile);
        tile.properties = _get_properties(xml_obj, xml_properties);
        return tile;
    };
    var _get_layers = function (xml_obj)
    {       
        var layers = [];
        var layer;
        var xml_layers = xml_obj.get_nodes("//layer");
        var xml_layer = xml_layers.get_next_node(); 
        while (xml_layer != null)
        {
            layer = _get_layer(xml_obj, xml_layer);
            if (layer != null)
                layers.push(layer);
            xml_layer = xml_layers.get_next_node();
        }  
        return layers;
    };    
    var _get_layer = function (xml_obj, xml_layer)
    {
        var visible = xml_obj.get_string_value("@visible", xml_layer);
        if (visible == "0")
            return null;
            
        var layer = {};    
       
        layer.name = xml_obj.get_string_value("@name", xml_layer);
        layer.width = xml_obj.get_number_value("@width", xml_layer);
        layer.height = xml_obj.get_number_value("@height", xml_layer);        
        layer.opacity = xml_obj.get_number_value("@opacity", xml_layer, 1);
        var xml_properties = xml_obj.get_nodes("./properties/property", xml_layer);
        layer.properties = _get_properties(xml_obj, xml_properties);
        var xml_data = xml_obj.get_nodes("./data", xml_layer).get_next_node();
        layer.data = _get_data(xml_obj, xml_data);
        return layer;
    };
    var _get_data = function (xml_obj, xml_data)
    {      
        var encoding = xml_obj.get_string_value("@encoding", xml_data);
        var compression = xml_obj.get_string_value("@compression", xml_data);      
        var data = _get_node_text(xml_data);
        if(typeof(String.prototype.trim) === "undefined")
        {
            String.prototype.trim = function() 
            {
                return String(this).replace(/^\s+|\s+$/g, '');
            };
        }
        
        data = data.trim();
        if (encoding == "base64")
        {
            if (compression == "")
            {
                data = _decBase64AsArray(data);
            }
            else if (compression == "zlib")
            {
                data = atob(data);
                data = data.split('').map(function(e) {
                    return e.charCodeAt(0);
                });
                var inflate = new window["Zlib"]["Inflate"](data);
                data = inflate["decompress"]();
            }
            else if (compression == "gzip")
            {
                data = atob(data);
                data = data.split('').map(function(e) {
                    return e.charCodeAt(0);
                });
                var gunzip = new window["Zlib"]["Gunzip"](data);
                data = gunzip["decompress"]();               
            }
        }
        else if (encoding == "csv")
            data = _decCSV(data);
        else
            alert ("TMXImporter: could not decompress data");             
        return data;
    };
    var _get_objectgroups = function (xml_obj)
    {

        var objectgroups = [];
        var objectgroup;
        var xml_objectgroups = xml_obj.get_nodes("//objectgroup");
        var xml_objectgroup = xml_objectgroups.get_next_node(); 
        while (xml_objectgroup != null)
        {
            objectgroup = _get_objectgroup(xml_obj, xml_objectgroup);
            objectgroups.push(objectgroup);
            xml_objectgroup = xml_objectgroups.get_next_node();
        }  
        return objectgroups;
    };
    var _get_objectgroup = function (xml_obj, xml_objectgroup)
    {
        var objectgroup = {};    
       
        objectgroup.name = xml_obj.get_string_value("@name", xml_objectgroup);
        objectgroup.width = xml_obj.get_number_value("@width", xml_objectgroup);
        objectgroup.height = xml_obj.get_number_value("@height", xml_objectgroup);       
        var xml_objects = xml_obj.get_nodes("./object", xml_objectgroup);
        objectgroup.objects = _get_objects(xml_obj, xml_objects);        
        return objectgroup;
    };
    var _get_objects = function(xml_obj, xml_objects)
    {
        var objects = [];  
        var object;
        var xml_object = xml_objects.get_next_node();    
     
        while (xml_object != null)
        {
            object = _get_object(xml_obj, xml_object); 
            objects.push(object);
            xml_object = xml_objects.get_next_node();    
        }        
        return objects;
    };   
    var _get_object = function(xml_obj, xml_object)
    {    
        var object = {};
        object.name = xml_obj.get_string_value("@name", xml_object);
        object.type = xml_obj.get_string_value("@type", xml_object); 
        object.x = xml_obj.get_number_value("@x", xml_object);
        object.y = xml_obj.get_number_value("@y", xml_object);          
        object.width = xml_obj.get_number_value("@width", xml_object);
        object.height = xml_obj.get_number_value("@height", xml_object);
        var xml_properties = xml_obj.get_nodes("./properties/property", xml_object);
        object.properties = _get_properties(xml_obj, xml_properties);
        return object;
    };
    
    // xpath: text() has 4096 limitation
    var _get_node_text = function (node) 
    {
        var r = "", x, cnt = node.childNodes.length;
        for (x = 0;x < cnt; x++) {
            r = r + node.childNodes[x].nodeValue;
        }
        return r;
    };
    
    var _get_properties = function (xml_obj, xml_properties)
    {  
        var properties = {};
        var name, value;         
        var xml_property = xml_properties.get_next_node();              
        while (xml_property != null)
        {            
            name = xml_obj.get_string_value("@name", xml_property);
            value = xml_obj.get_string_value("@value", xml_property);
            properties[name] = value;
            xml_property = xml_properties.get_next_node();
        }   
        return properties;
    };
    var _string2int = function(s, default_value)
    {
        return (s!=null)? parseInt(s):default_value;
    };    
    var _string2float = function(s, default_value)
    {
        return (s!=null)? parseFloat(s):default_value;
    };
    
    var _decBase64AsArray = function(data) 
    {
        data = Base64.decode(data);
   	    var bytes = 4;
   	    var len = data.length / bytes;
   	    var arr = [];
   	    var i, j;
   
   	    for (i = 0; i<len; i++) 
   	    {
   		    arr[i] = 0;
   		    for (j = bytes - 1; j >= 0; --j) 
   			    arr[i] += data.charCodeAt((i * bytes) + j) << (j << 3);
   	    }  
        return arr;
    };
    var _decCSV = function(data) 
    {     
        data = data.replace(/(^\s*)|(\s*$)/g,"");
        data = data.split(",");
        var data_cnt = data.length;
        var i,entries;
        var arr = [];
        for(i=0; i<data_cnt; i++)
            data[i] = _string2int(data[i]);
        return data;
    };
    
      
    cr.plugins_.Rex_TMXImporter.LayoutKlass = function(plugin, OX, OY, width, height, is_isometric)
    {
        this.plugin = plugin;
        this.is_isometric = is_isometric;
        this.PositionOX = OX;
        this.PositionOY = OY;
        this.SetWidth(width);
        this.SetHeight(height);
    };
    var LayoutKlassProto = cr.plugins_.Rex_TMXImporter.LayoutKlass.prototype;
      
	LayoutKlassProto.SetWidth = function(width)
	{
        this.width = width;
        this.half_width = width/2;        
	}; 
	LayoutKlassProto.SetHeight = function(height)
	{
        this.height = height;
        this.half_height = height/2;        
	};   
    LayoutKlassProto.LXYZ2PX = function(logic_x, logic_y)
	{
        var x = (this.is_isometric)? ((logic_x - logic_y)*this.half_width):
                                     (logic_x*this.width);
        return x+this.PositionOX;
	};
	LayoutKlassProto.LXYZ2PY = function(logic_x, logic_y)
	{
        var y = (this.is_isometric)? ((logic_x + logic_y)*this.half_height):
                                     (logic_y*this.height);
        return y+this.PositionOY;
	};
    LayoutKlassProto.CreateItem = function(obj_type,x,y,layer)
	{
        return this.plugin.runtime.createInstance(obj_type, layer,this.LXYZ2PX(x,y),this.LXYZ2PY(x,y) );         
	}; 
	
	
	/**
	 *  Base64 decoding
	 *  @see <a href="http://www.webtoolkit.info/">http://www.webtoolkit.info/</A>
	 */
	var Base64 = (function() {

		// hold public stuff in our singleton
		var singleton = {};

		// private property
		var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

		// public method for decoding
		singleton.decode = function(input) {
			
			// make sure our input string has the right format
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			
			var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
            
            while (i < input.length) 
            {
                enc1 = _keyStr.indexOf(input.charAt(i++));
                enc2 = _keyStr.indexOf(input.charAt(i++));
                enc3 = _keyStr.indexOf(input.charAt(i++));
                enc4 = _keyStr.indexOf(input.charAt(i++));
                
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                
                output.push(String.fromCharCode(chr1));
                
                if (enc3 != 64)
                    output.push(String.fromCharCode(chr2));
                if (enc4 != 64)
                    output.push(String.fromCharCode(chr3));
            }
            
            output = output.join('');
            return output;
		};

		return singleton;

	})();
    
    // copy from xml plugin
    var XMLParser = function(xml_string, isIE) 
	{
        this.isIE = isIE;
        this.xmlDoc = null;
        this._xml_nodes = new XMLNodes(null, isIE);
        
		var xml, tmp;
        var isWindows8 = !!(typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
		try {
			if (isWindows8)
	        {
	            xml = new Windows["Data"]["Xml"]["Dom"]["XmlDocument"]()
	            xml["loadXml"](str);
	        }
			else if (isIE)
			{
				var versions = ["MSXML2.DOMDocument.6.0",
                                "MSXML2.DOMDocument.3.0",
                                "MSXML2.DOMDocument"];

				for (var i = 0; i < 3; i++){
					try {
						xml = new ActiveXObject(versions[i]);
						
						if (xml)
							break;
					} catch (ex){
						xml = null;
					}
				}
				
				if (xml)
				{
					xml.async = "false";
					xml.loadXML(xml_string);
				}
			}
			else {
				tmp = new DOMParser();
				xml = tmp.parseFromString(xml_string, "text/xml");
			}
		} catch(e) {
			xml = null;
		}
		
		if (xml)
		{
			this.xmlDoc = xml;
			
			if (isIE && !isWindows8)
				this.xmlDoc["setProperty"]("SelectionLanguage","XPath");
		}
	};   
    var XMLParserProto = XMLParser.prototype;

    XMLParserProto._xpath_eval_one = function (xpath, result_type, root)
	{
		if (!this.xmlDoc)
			return;
		
        if (root == null)
		    root = this.xmlDoc.documentElement;
		
		try {
			if (this.isIE)
				return root.selectSingleNode(xpath);
			else
				return this.xmlDoc.evaluate(xpath, root, null, result_type, null);
		}
		catch (e) { return null; }
	};
	
	XMLParserProto._xpath_eval_many = function(xpath, result_type, root)
	{
		if (!this.xmlDoc)
			return;
		
        if (root == null)
		    root = this.xmlDoc.documentElement;
		
		try {
			if (this.isIE)
				return root.selectNodes(xpath);
			else
				return this.xmlDoc.evaluate(xpath, root, null, result_type, null);
		}
		catch (e) { return null; }
	};
    
    XMLParserProto.get_number_value = function(xpath, root, default_value)
    {
        default_value = default_value || 0;
		var result = this._xpath_eval_one(xpath, 1, root);
		
		if (!result)
			result = default_value;
		else if (this.isIE)
			result = parseInt(result.nodeValue, 10) || default_value;
		else
			result = result.numberValue || default_value;
        return result;
    };
    
    XMLParserProto.get_string_value = function(xpath, root, default_value)
    {
        default_value = default_value || "";    
		var result = this._xpath_eval_one(xpath, 2, root);
		
		if (!result)
			result = default_value;
		else if (this.isIE)
			result = result.nodeValue || default_value;
		else
			result = result.stringValue || default_value;    
        return result;
    };
    
    XMLParserProto.get_nodes = function(xpath, root)
    {
        return new XMLNodes(this._xpath_eval_many(xpath, 7, root), this.isIE);
    };
    
    var XMLNodes = function (nodes, isIE) 
	{ 
        this.isIE = isIE;
        this._set_nodes(nodes);
    };
    var XMLNodesProto = XMLNodes.prototype;
    
    XMLNodesProto._set_nodes = function(nodes)
    {
        this.nodes = nodes;  
        this.node_cnt = (nodes == null)? 0:
                        (this.isIE)? nodes.length:nodes.snapshotLength;
        this._i = 0;                        
    };
    
    XMLNodesProto.get_next_node = function()
    {
        if ((this._i >= this.node_cnt) || (this.nodes == null))
            return null;
        
        var node = (this.isIE)? this.nodes[this._i]:this.nodes.snapshotItem(this._i);
        this._i += 1;
        return node;
    };
}());    