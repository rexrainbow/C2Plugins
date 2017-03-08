// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_tmx_XML_parser = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_tmx_XML_parser.prototype;
		
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
        var isIE = this.runtime.isIE;
        var tmx_obj = new cr.plugins_.Rex_tmx_XML_parser.TMXKlass(tmx_content, isIE);
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
    cr.plugins_.Rex_tmx_XML_parser.TMXKlass = function(tmx_string, isIE)
    {
        var xml_obj=  new XMLParser(tmx_string, isIE);
        this.map = _get_map(xml_obj);
        this.tilesets = _get_tilesets(xml_obj);
        this.layers = _get_layers(xml_obj);
        this.objectgroups = _get_objectgroups(xml_obj);
    };
    var TMXKlassProto = cr.plugins_.Rex_tmx_XML_parser.TMXKlass.prototype;

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

    var _get_map = function (xml_obj)
    {     
        var map = {};          
        map.orientation = xml_obj.get_string_value("@orientation");
        map.renderorder = xml_obj.get_string_value("@renderorder");
        map.width =  xml_obj.get_number_value("@width");
        map.height = xml_obj.get_number_value("@height");
        map.tilewidth = xml_obj.get_number_value("@tilewidth");
        map.tileheight = xml_obj.get_number_value("@tileheight");
        
        map.hexsidelength = xml_obj.get_number_value("@hexsidelength");
        map.staggeraxis = xml_obj.get_string_value("@staggeraxis");
        map.staggerindex = xml_obj.get_string_value("@staggerindex");   
        map.nextobjectid = xml_obj.get_number_value("@nextobjectid");             
        
        map.backgroundcolor = _get_C2_color_number(xml_obj.get_string_value("@backgroundcolor"));
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
        tileset.tiles = _get_tiles(xml_obj, xml_tiles, tileset.firstgid);        
		var xml_images = xml_obj.get_nodes("./image", xml_tileset);
		tileset.image = _get_image_properties(xml_obj, xml_images);
        var xml_properties = xml_obj.get_nodes("./properties/property", xml_tileset);
        tileset.properties = _get_properties(xml_obj, xml_properties);
        return tileset;
    };
    var _get_tiles = function(xml_obj, xml_tiles, gid_offset)
    {
        var tiles = {};  
        var id;
        var xml_tile = xml_tiles.get_next_node();    
     
        while (xml_tile != null)
        {
            id = xml_obj.get_number_value("@id", xml_tile) + gid_offset;
            tiles[id] = _get_tile(xml_obj, xml_tile); 
            xml_tile = xml_tiles.get_next_node();
        }        
        return tiles;
    };
	
	var _get_image_properties = function(xml_obj, xml_images)
	{
	    var image_prop = {};
		var xml_image = xml_images.get_next_node(); 
		image_prop.source = xml_obj.get_string_value("@source", xml_image);
		image_prop.width = xml_obj.get_number_value("@width", xml_image);
		image_prop.height = xml_obj.get_number_value("@height", xml_image);
		return image_prop;
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
        var encoding = xml_obj.get_string_value("@encoding", xml_data);
        var compression = xml_obj.get_string_value("@compression", xml_data); 
        var data = _get_node_text(xml_data);        
        layer.data = _get_data(data, encoding, compression);
        return layer;
    };
    var _get_data = function (data, encoding, compression)
    {      
        if(typeof(String.prototype.trim) === "undefined")
        {
            String.prototype.trim = function() 
            {
                return String(this).replace(/^\s+|\s+$/g, '');
            };
        }
        
        data = data.trim();
        if (encoding === "base64")
        {
            data = atob(data);
            data = data.split('').map(function(e) {
                return e.charCodeAt(0);
            });
            
            if (compression === "zlib")
            {
                var inflate = new window["Zlib"]["Inflate"](data);
                data = inflate["decompress"]();
            }
            else if (compression === "gzip")
            {
                var gunzip = new window["Zlib"]["Gunzip"](data);
                data = gunzip["decompress"]();               
            }
            data = _array_merge(data);
        }
        else if (encoding === "csv")
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
        object.id = xml_obj.get_number_value("@id", xml_object);
        object.name = xml_obj.get_string_value("@name", xml_object);
        object.type = xml_obj.get_string_value("@type", xml_object); 
        object.x = xml_obj.get_number_value("@x", xml_object);
        object.y = xml_obj.get_number_value("@y", xml_object);          
        object.width = xml_obj.get_number_value("@width", xml_object);
        object.height = xml_obj.get_number_value("@height", xml_object);
        object.rotation = xml_obj.get_number_value("@rotation", xml_object);
        object.gid = xml_obj.get_number_value("@gid", xml_object, -1);
        object.visible = xml_obj.get_number_value("@visible", xml_object);
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
        var xml_property = xml_properties.get_next_node(); 
        if (xml_property == null)
            return null
        
        var name, value, properties = {};        
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
	            xml["loadXml"](xml_string);
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