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
        this.board = null;
        this.callback = null;
        this.layout = new cr.plugins_.Rex_TMXImporter.LayoutKlass(this.properties[0], this.properties[1],
                                                               0,0,0);
        this._tmx_obj = null;
	};
	instanceProto.LoadTMX = function(tmx_string)
	{
        this._tmx_obj = new cr.plugins_.Rex_TMXImporter.TMXKlass(tmx_string);
        this._layout_set(this._tmx_obj);
        var layers = this._tmx_obj.layers;
        var layers_cnt = layers.length;
        var i;
        for(i=0; i<layers_cnt; i++)
           this._create_objects(layers[i]);
	};
	instanceProto._layout_set = function(tmx_obj)
	{
        this.layout.is_isometric = (tmx_obj.map.orientation == "isometric");
        this.layout.SetWidth(tmx_obj.map.tilewidth);
        this.layout.SetHeight(tmx_obj.map.tileheight);
	};	
	instanceProto._create_objects = function(tmx_layer)
	{
        var layer_name = tmx_layer.name;
        var width = tmx_layer.width;
        var height = tmx_layer.height;
        var data = tmx_layer.data;
        var x,y,sprite_image,i=0;
        for (y=0; y<height; y++)
        {
            for (x=0; x<width; x++)
            {           
                sprite_image = this._tmx_obj.GetSpriteImage(data[i]);
                i++;
            }
        }
	};	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	
    acts.LoadTMXImporter = function (tmx_string, board_objs)
	{
        var board = board_objs.instances[0];
        if (board.check_name == "BOARD")
        {
            this.board = board;        
            board.layout = this.layout;
        }
        else
            alert ("TMXImporter should connect to a board object");
            
        this.LoadTMX(tmx_string);
                      
	};
	
    acts.LoadTMX = function (tmx_string)
	{	     
        this.LoadTMX(tmx_string);
	};	
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

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
    
    TMXKlassProto.GetSpriteImage = function (gid)
    {
        var tilesets_cnt = this.tilesets.length;
        var i, tileset, tile;
        var sprie_image = {};
        for (i=tilesets_cnt-1; i>=0; i--)
        {
            tileset = this.tilesets[i];
            if (gid >= tileset.firstgid)
            {
                var _image = _tile2sprite_image(tileset.tiles[gid]);
                if (_image != null)
                    sprie_image = _image;
                else
                {
                    sprie_image.name = tileset.name;
                    sprie_image.cur_frame = gid;
                }
                break;
            }
        }
        return sprie_image;
    };
    
    var _tile2sprite_image = function(tile)
    {
        if (tile == null)
            return null;
        var name = tile.properties.name;
        var cur_frame = tile.properties.cur_frame;
        if ((name == null) || (cur_frame == null))
            return null;
        
        var sprie_image = {};
        sprie_image.name = name;
        sprie_image. cur_frame = cur_frame;
        return sprie_image;    
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
        //var xml_properties = jQuery(xml_tileset).find("properties").find("property");
        //tileset.properties = _get_properties(xml_properties);
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
            id = parseInt(xml_tile.getAttribute("id"));
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
        data = data.trim().split("\n");
        var data_cnt = data.length;
        var i;
        for(i=0; i<data_cnt; i++)
            data[i] = parseInt(data[i]);
        return data;
    };
    
      
    cr.plugins_.Rex_TMXImporter.LayoutKlass = function(OX, OY, width, height, is_isometric)
    {
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
	LayoutKlassProto.CreateItem = function(obj_type,x,y,layer,offset_x,offset_y)
	{
        return this.runtime.createInstance(obj_type, layer,this.GetX(x,y)+offset_x,this.GetY(x,y)+offset_y );        
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