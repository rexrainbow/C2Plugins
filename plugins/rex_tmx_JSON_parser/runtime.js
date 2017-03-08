// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_tmx_JSON_parser = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_tmx_JSON_parser.prototype;
		
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
	};
    
	instanceProto.TMXObjGet = function(tmx_content)
	{
        var tmx_obj = new cr.plugins_.Rex_tmx_JSON_parser.TMXKlass(tmx_content);
        return tmx_obj;
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
}());

(function ()
{
    cr.plugins_.Rex_tmx_JSON_parser.TMXKlass = function(JSON_string)
    {
        var dict_obj= JSON.parse(JSON_string);;
        this.map = _get_map(dict_obj);
        this.tilesets = _get_tilesets(dict_obj);
        this.layers = _get_layers(dict_obj);
        this.objectgroups = _get_objectgroups(dict_obj);       
    };
    var TMXKlassProto = cr.plugins_.Rex_tmx_JSON_parser.TMXKlass.prototype;

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
    
    // RGB -> BGR
    var _get_C2_color_number = function(rgb_string) 
    {
        if (rgb_string == "")
            return null;
        
        var rgb = parseInt(rgb_string.substring(1), 16);
        var r = (rgb >> 16) & 0xFF;
        var g = (rgb >> 8) & 0xFF;
        var b = (rgb) & 0xFF;
        return ( (b<<16) | (g<<8) | (r) );
    };

    var _get_map = function (dict_obj)
    {     
        var map = {};  
        map.orientation = _get_value(dict_obj, "orientation");
        map.renderorder = _get_value(dict_obj, "renderorder");
        map.width =  _get_value(dict_obj, "width");
        map.height = _get_value(dict_obj, "height");
        map.tilewidth = _get_value(dict_obj, "tilewidth");
        
        map.hexsidelength = _get_value(dict_obj, "hexsidelength");
        map.staggeraxis = _get_value(dict_obj, "staggeraxis");
        map.staggerindex = _get_value(dict_obj, "staggerindex");
        map.nextobjectid = _get_value(dict_obj, "nextobjectid");
        
        map.tileheight = _get_value(dict_obj, "tileheight");
        map.backgroundcolor = _get_C2_color_number(_get_value(dict_obj, "backgroundcolor", ""));
        map.properties = _get_properties(dict_obj, "properties");
        return map;           
    };
    var _get_tilesets = function (dict_obj)
    {  
        if (dict_obj.hasOwnProperty("tilesets"))
            dict_obj = dict_obj["tilesets"];
        else
            return {};
                    
        var tileset, tilesets = [];        
        var tileset_cnt = dict_obj.length;
        var i;
        for (i=0; i<tileset_cnt; i++)
        {
            tileset = _get_tileset(dict_obj[i]);
            if (tileset != null)
                tilesets.push(tileset);
        }
        return tilesets;
    };
    var _get_tileset = function(dict_obj)
    {
        var tileset = {};    
        tileset.name = _get_value(dict_obj, "name");
        tileset.firstgid = _get_value(dict_obj, "firstgid");
        tileset.tilewidth = _get_value(dict_obj, "tilewidth");
        tileset.tileheight = _get_value(dict_obj, "tileheight");
        tileset.spacing = _get_value(dict_obj, "spacing");
        tileset.margin = _get_value(dict_obj, "margin"); 
        tileset.tiles = _get_tiles(dict_obj, tileset.firstgid);
		tileset.image = _get_image_properties(dict_obj);
        tileset.properties = _get_properties(dict_obj, "properties");
        return tileset;
    };
    var _get_tiles = function(dict_obj, gid_offset)
    {
        if (dict_obj.hasOwnProperty("tileproperties"))
            dict_obj = dict_obj["tileproperties"];
        else
            return {};
            
        var id, tiles = {}; 
        for (id in dict_obj)
        {
            tiles[parseInt(id)+ gid_offset] = _get_tile(dict_obj[id]);
        }
        return tiles;
    };
    var _get_tile = function(dict_obj, xml_tile)
    {    
        var tile = {};
        tile.properties = _get_properties(dict_obj);
        return tile;
    };
	var _get_image_properties = function(dict_obj)
	{
	    var image_prop = {};
		image_prop.source = _get_value(dict_obj, "image");
		image_prop.width = _get_value(dict_obj, "imagewidth");
		image_prop.height = _get_value(dict_obj, "imageheight");
		return image_prop;
	};
    var _get_layers = function (dict_obj)
    {       
        if (dict_obj.hasOwnProperty("layers"))
            dict_obj = dict_obj["layers"];
        else
            return [];
        
        var layer, layers = [];        
        var layer_cnt = dict_obj.length;
        var i;
        for (i=0; i<layer_cnt; i++)
        {
            layer = _get_layer(dict_obj[i]);
            if (layer != null)
                layers.push(layer);
        }
        return layers;
    };    
    var _get_layer = function (dict_obj)
    {        
        var type = _get_value(dict_obj, "type");
        if (type != "tilelayer")
            return null;
        var visible = _get_value(dict_obj, "visible");
        if (visible == "0")
            return null;
            
        var layer = {};    
       
        layer.name = _get_value(dict_obj, "name");
        layer.width = _get_value(dict_obj, "width");
        layer.height = _get_value(dict_obj, "height");        
        layer.opacity = _get_value(dict_obj, "opacity", 1);
        layer.properties = _get_properties(dict_obj, "properties");

        var encoding = dict_obj["encoding"];
        var compression = dict_obj["compression"];
        var data = dict_obj["data"];      
        layer.data = _get_data(data, encoding, compression);
        return layer;
    };
    
    var _get_data = function (data, encoding, compression)
    {      
        // CSV
        if (encoding == null)
            return data;
            
        // base64     
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
            data = atob(data);
            data = data.split('').map(function(e) {
                return e.charCodeAt(0);
            });
            
            if (compression == "zlib")
            {
                var inflate = new window["Zlib"]["Inflate"](data);
                data = inflate["decompress"]();
            }
            else if (compression == "gzip")
            {
                var gunzip = new window["Zlib"]["Gunzip"](data);
                data = gunzip["decompress"]();               
            }
            data = _array_merge(data);
        }
        else
            alert ("TMXImporter: could not get tiles data");             
        return data;
    };
    var _array_merge = function(data) 
    {
   	    var bytes = 4;
   	    var len = data.length / bytes;
   	    var arr = [];
   	    var i, j, tmp;
   
   	    for (i = 0; i<len; i++) 
   	    {
            tmp = 0;
   		    for (j = bytes - 1; j >= 0; --j) 
                tmp += ( data[(i * bytes) + j] << (j << 3) );
            arr[i] = tmp;
   	    }  
        arr.length = len;
        return arr;
    };
    
    var _get_objectgroups = function (dict_obj)
    {
        if (dict_obj.hasOwnProperty("layers"))
            dict_obj = dict_obj["layers"];
        else
            return [];
            
        var objectgroup, objectgroups = [];        
        var objectgroups_cnt = dict_obj.length;
        var i;
        for (i=0; i<objectgroups_cnt; i++)
        {
            objectgroup = _get_objectgroup(dict_obj[i]);
            if (objectgroup != null)
                objectgroups.push(objectgroup);
        }
        return objectgroups;
    };
    var _get_objectgroup = function (dict_obj)
    {
        var type = _get_value(dict_obj, "type");
        if (type != "objectgroup")
            return null;
            
        var objectgroup = {};    
        objectgroup.name = _get_value(dict_obj, "name");
        objectgroup.width = _get_value(dict_obj, "width");
        objectgroup.height = _get_value(dict_obj, "height");       
        objectgroup.objects = _get_objects(dict_obj);    
        return objectgroup;
    };
    var _get_objects = function(dict_obj)
    {
        if (dict_obj.hasOwnProperty("objects"))
            dict_obj = dict_obj["objects"];
        else
            return [];
            
        var object, objects = [];        
        var objects_cnt = dict_obj.length;
        var i;
        for (i=0; i<objects_cnt; i++)
        {
            object = _get_object(dict_obj[i]);
            objects.push(object);
        }
        return objects;
    };   
    var _get_object = function(dict_obj)
    {    
        var object = {};
        object.id = _get_value(dict_obj, "id");
        object.name = _get_value(dict_obj, "name");
        object.type = _get_value(dict_obj, "type"); 
        object.x = _get_value(dict_obj, "x");
        object.y = _get_value(dict_obj, "y");          
        object.width = _get_value(dict_obj, "width");
        object.height = _get_value(dict_obj, "height");
        object.rotation = _get_value(dict_obj, "rotation");
        object.gid = _get_value(dict_obj, "gid", -1);
        object.visible = _get_value(dict_obj, "visible");
        object.is_ellipse = _get_value(dict_obj, "ellipse", false);
        object.properties = _get_properties(dict_obj, "properties");
        return object;
    };    

    var _get_properties = function (dict_obj, prop_key)
    {    
        if (prop_key != null)
        {
            if (dict_obj.hasOwnProperty(prop_key)) 
                dict_obj = dict_obj[prop_key];
            else
                return {};
        }

            
        var properties = {}, name;
        for(name in dict_obj)
            properties[name] = dict_obj[name]; 
        return properties;
    };

    var _get_value = function (obj, key, default_value)
    {
        var val = obj[key];
        if (val != null)
            return val;
            
        return default_value;
    }; 
    
}());    