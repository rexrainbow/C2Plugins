// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

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
        this.exp_LogicX = (-1);
        this.exp_LogicY = (-1);  
        this.exp_PhysicalX = (-1);
        this.exp_PhysicalY = (-1);
        this.exp_LayerName = "";        
        this.exp_layer_properties = {};
        this.exp_tileset_properties = {};        
        this.exp_tile_properties = {};
        
        this._tmx_obj = null;    
        this.layout = new cr.plugins_.Rex_TMXImporter.LayoutKlass(this, this.properties[0], this.properties[1],
                                                                  0,0,0);
	};
	instanceProto.ImportTMX = function(tmx_string)
	{
        this._tmx_obj = new cr.plugins_.Rex_TMXImporter.TMXKlass(tmx_string);
	};
	instanceProto.RetrieveTileArray = function(obj_type)
	{
        this._layout_set(this._tmx_obj);
        var layers = this._tmx_obj.layers;
        var layers_cnt = layers.length;
        var i;
        for(i=0; i<layers_cnt; i++)
           this._create_layer_objects(obj_type, layers[i]);           
	};
	instanceProto._layout_set = function(tmx_obj)
	{
        this.layout.is_isometric = (tmx_obj.map.orientation == "isometric");
        this.layout.SetWidth(tmx_obj.map.tilewidth);
        this.layout.SetHeight(tmx_obj.map.tileheight);
	};	
	instanceProto._create_layer_objects = function(obj_type, tmx_layer)
	{
        var c2_layer =  this._get_layer(tmx_layer.name);
        var width = tmx_layer.width;
        var height = tmx_layer.height;
        var data = tmx_layer.data;
        var x,y,inst,tile_id,tileset_obj,tile_obj; 
        var i=0;
        
        this.exp_LayerName = tmx_layer.name;        
        this.exp_layer_properties = tmx_layer.properties;
        for (y=0; y<height; y++)
        {
            for (x=0; x<width; x++)
            {     
                // get tile id
                tile_id = data[i];
                i++;
                if (tile_id == 0)
                    continue;
                
                if (obj_type != null)
                {
                    inst = this._create_instance(obj_type,x,y,c2_layer,tile_id);
                    this._setup_SOL(inst);     
                }
                
                // prepare expressions
                this.exp_LogicX = x;
                this.exp_LogicY = y;
                this.exp_PhysicalX = this.layout.GetX(x,y);
                this.exp_PhysicalY = this.layout.GetY(x,y);                
                tileset_obj = this._tmx_obj.GetTileSet(tile_id);
                this.exp_tileset_properties = tileset_obj.properties;
                tile_obj = tileset_obj.tiles[tile_id];
                this.exp_tile_properties = (tile_obj != null)? tile_obj.properties: {};
                   
                // trigger callback
                this.runtime.trigger(cr.plugins_.Rex_TMXImporter.prototype.cnds.OnEachTileCell, this); 
            }
        }         
	};
	instanceProto._create_instance = function(obj_type,x,y,c2_layer,tile_id)
	{  
        var inst = this.layout.CreateItem(obj_type,x,y,c2_layer);
        this._set_anim_frame(inst, tile_id-1);
        return inst;        
    };	
	instanceProto._setup_SOL = function(inst)
	{
        var sol = inst.type.getCurrentSol();
        sol.select_all = false;
		sol.instances.length = 1;
		sol.instances[0] = inst;     
    };
    instanceProto._get_layer = function(layerparam)
    {
        return (typeof layerparam == "number")?
               this.runtime.getLayerByNumber(layerparam):
               this.runtime.getLayerByName(layerparam);
    };   
    // copy from sprite plugin
	instanceProto._set_anim_frame = function (inst, framenumber)
	{
		inst.changeAnimFrame = framenumber;
		
		// start ticking if not already
		if (!inst.isTicking)
		{
			inst.runtime.tickMe(inst);
			inst.isTicking = true;
		}
		
		// not in trigger: apply immediately
		if (!inst.inAnimTrigger)
			inst.doChangeAnimFrame();
	};            
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    
	  
	cnds.OnEachTileCell = function ()
	{
		return true;
	};	
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	
    acts.ImportTMX = function (tmx_string)
	{	     
        this.ImportTMX(tmx_string);
	};
    acts.CreateTiles = function (obj_type)
	{	     
        this.RetrieveTileArray(obj_type);
	};
    acts.ReleaseTMX = function ()
	{	     
        this._tmx_obj = null;    
	};	
    acts.SetOPosition = function (x,y)
	{	     
        this.layout.PositionOX = x;
        this.layout.PositionOY = y;        
	};
    acts.RetrieveTileArray = function ()
	{	  
        this.RetrieveTileArray();
	};    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
    
	exps.MapWidth = function (ret)
	{   
        var map_width = (this._tmx_obj != null)? this._tmx_obj.map.width:0;
	    ret.set_int(map_width);
	};
	exps.MapHeight = function (ret)
	{   
        var map_height = (this._tmx_obj != null)? this._tmx_obj.map.height:0;
	    ret.set_int(map_height);
	};
	exps.TileWidth = function (ret)
	{   
        var tile_width = (this._tmx_obj != null)? this._tmx_obj.map.tilewidth:0;   
	    ret.set_int(tile_width);
	};
	exps.TileHeight = function (ret)
	{   
        var tile_height = (this._tmx_obj != null)? this._tmx_obj.map.tileheight:0;  
	    ret.set_int(tile_height);
	}; 	
	exps.InstUID = function (ret)
	{   
	    ret.set_int(this.exp_CreatedInstUID);
	}; 
	exps.LogicX = function (ret)
	{   
	    ret.set_int(this.exp_LogicX);
	};
	exps.LogicY = function (ret)
	{   
	    ret.set_int(this.exp_LogicY);
	};    
	exps.LayerProp = function (ret, name)
	{   
        var value = this.exp_layer_properties[name];
        if (value == null)
            value = 0;
	    ret.set_any(value);
	};
	exps.TilesetProp = function (ret, name)
	{       
        var value = this.exp_tileset_properties[name];
        if (value == null)
            value = 0;        
	    ret.set_any(value);
	};     
	exps.TileProp = function (ret, name)
	{       
        var value = this.exp_tile_properties[name];
        if (value == null)
            value = 0;        
	    ret.set_any(value);
	}; 
	exps.PhysicalX = function (ret)
	{   
	    ret.set_int(this.exp_PhysicalX);
	};
	exps.PhysicalY = function (ret)
	{   
	    ret.set_int(this.exp_PhysicalY);
	};
	exps.LayerName = function (ret)
	{   
	    ret.set_string(this.exp_LayerName);
	};    
}());

(function ()
{
    cr.plugins_.Rex_TMXImporter.TMXKlass = function(tmx_string)
    {
        var xml_obj= jQuery.parseXML(tmx_string);
        this.map = _get_map(xml_obj);
        this.tilesets = _get_tilesets(xml_obj);
        this.layers = _get_layers(xml_obj);        
    };
    var TMXKlassProto = cr.plugins_.Rex_TMXImporter.TMXKlass.prototype;

    TMXKlassProto.GetTileSet = function (gid)
    {
        var tilesets_cnt = this.tilesets.length;
        var i, tileset;
        var image_index = {};
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
        var xml_map = jQuery(xml_obj).find("map");
        var map = {};
        map.orientation = xml_map.attr("orientation");
        map.width = parseInt(xml_map.attr("width"));
        map.height = parseInt(xml_map.attr("height"));
        map.tilewidth = parseInt(xml_map.attr("tilewidth"));
        map.tileheight = parseInt(xml_map.attr("tileheight"));
        return map;           
    };
    var _get_tilesets = function (xml_obj)
    {
        var xml_tilesets = jQuery(xml_obj).find("tileset");  
        var tilesets_cnt = xml_tilesets.length;
        var i;
        var tilesets = [];
        for (i=0; i<tilesets_cnt; i++)
            tilesets.push(_get_tileset(xml_tilesets[i]));
        return tilesets;
    };
    var _get_tileset = function(xml_tileset)
    {
        var tileset = {};
        tileset.name = xml_tileset.getAttribute("name");
        tileset.firstgid = parseInt(xml_tileset.getAttribute("firstgid"));
        tileset.tilewidth = parseInt(xml_tileset.getAttribute("tilewidth"));
        tileset.tileheight = parseInt(xml_tileset.getAttribute("tileheight"));
        tileset.spacing = parseInt(xml_tileset.getAttribute("spacing"));
        tileset.margin = parseInt(xml_tileset.getAttribute("margin"));     
        var xml_tiles = jQuery(xml_tileset).find("tile");
        tileset.tiles = _get_tiles(xml_tiles);
        
        var xml_properties = jQuery(xml_tileset).children("properties").find("property");
        tileset.properties = _get_properties(xml_properties);
        return tileset;
    };
    var _get_tiles = function(xml_tiles)
    {
        var i, xml_tile, id, properties;
        var tiles_cnt = xml_tiles.length;
        var tiles = {};
        for(i=0; i<tiles_cnt; i++)
        {
            xml_tile = xml_tiles[i];
            id = parseInt(xml_tile.getAttribute("id"))+1;
            tiles[id] = _get_tile(xml_tile);
        }
        return tiles;
    };
    var _get_tile = function(xml_tile)
    {
        var tile = {};
        var xml_properties = jQuery(xml_tile).find("properties").find("property");
        tile.properties = _get_properties(xml_properties);
        return tile;
    };
    var _get_layers = function (xml_obj)
    {            
        var xml_layers = jQuery(xml_obj).find("layer");
        var layers_cnt = xml_layers.length;
        var i, layer;
        var layers = [];        
        for(i=0; i<layers_cnt; i++)
        {
            layer = _get_layer(xml_layers[i]);
            if (layer != null)
                layers.push(layer);
        }
        return layers;
    };    
    var _get_layer = function (xml_layer)
    {
        var visible = xml_layer.getAttribute("visible");
        if (visible == "0")
            return null;
            
        var layer = {};     
        layer.name = xml_layer.getAttribute("name");
        layer.width = parseInt(xml_layer.getAttribute("width"));
        layer.height = parseInt(xml_layer.getAttribute("width"));
        layer.opacity = parseFloat(xml_layer.getAttribute("opacity"));
        var xml_properties = jQuery(xml_layer).find("properties").find("property"); 
        layer.properties = _get_properties(xml_properties);
        var xml_data = jQuery(xml_layer).find("data");
        layer.data = _get_data(xml_data);
        return layer;
    };
    var _get_data = function (xml_data)
    {
        var encoding = xml_data.attr("encoding");
        var compression = xml_data.attr("compression");      
        var data = xml_data.text();
        data = (encoding == "base64")? _decBase64AsArray(data):_decCSV(data);
        if (compression != null)
            alert ("TMXImporter could not support any decompression"); 
        return data;
    };    
    var _get_properties = function (xml_properties)
    {
        var i, name, value, xml_property;
        var properties_cnt = xml_properties.length;
        var properties = {};
        for(i=0; i<properties_cnt; i++)
        {
            xml_property = xml_properties[i];
            name = xml_property.getAttribute("name");
            value = xml_property.getAttribute("value");
            properties[name] = value;
        }
        return properties;
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
            data[i] = parseInt(data[i]);
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
    LayoutKlassProto.GetX = function(logic_x, logic_y)
	{
        var x = (this.is_isometric)? ((logic_x - logic_y)*this.half_width):
                                     (logic_x*this.width);
        return x+this.PositionOX;
	};
	LayoutKlassProto.GetY = function(logic_x, logic_y)
	{
        var y = (this.is_isometric)? ((logic_x + logic_y)*this.half_height):
                                     (logic_y*this.height);
        return y+this.PositionOY;
	};
    LayoutKlassProto.CreateItem = function(obj_type,x,y,layer)
	{
        return this.plugin.runtime.createInstance(obj_type, layer,this.GetX(x,y),this.GetY(x,y) );         
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

}());    