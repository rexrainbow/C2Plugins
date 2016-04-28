// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_XMLWriter = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_XMLWriter.prototype;
		
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
        if (!this.recycled)
        {
            this.xw = new XMLWriter( 'UTF-8', '1.0' );            
        }
        this.clean();
	};
    
	instanceProto.onDestroy = function ()
	{
        this.clean();
	};   
    
	instanceProto.clean = function()
	{   
        this.xw.close();
        this.level = null;
	};       

    instanceProto.get_output = function(is_prettyPrint)
    {
        this.xw.formatting = (is_prettyPrint)? 'indented':'none';
        return this.xw.flush();
    };
    
	instanceProto.saveToJSON = function ()
	{
		return { "xw": this.xw.saveToJSON(),
                };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        this.xw.loadFromJSON(o["xw"]);
	};                  
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.AddElement = function (name)
	{
        if (this.level === null)
        {
            this.clean();
            this.xw.writeStartDocument();
            this.level = 0;
        }
        this.xw.writeStartElement(name);
        this.level += 1;
        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
        if (solModifierAfterCnds)
            this.runtime.pushCopySol(current_event.solModifiers);
        
        current_event.retrigger();
        
        if (solModifierAfterCnds)
            this.runtime.popSol(current_event.solModifiers);

            
        this.xw.writeEndElement();
        this.level -= 1;
                  
        if (this.level === 0)
        {
            this.level = null;
        }                 
		return false;        
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Clean = function ()
	{     
        this.clean();
	}; 

    Acts.prototype.AddAttribute = function (k_, v_)
	{
        assert2(this.level, "XMLWriter: Should add an atrribute under an element.");
        this.xw.writeAttributeString(k_, v_.toString());
	};     

    Acts.prototype.SetContent = function (content_)
	{
        assert2(this.level, "XMLWriter: Should add an text under an element.");
        this.xw.writeString(content_.toString());
	};   

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.AsXML = function (ret)
	{
	    ret.set_string( this.get_output() );
	};

    Exps.prototype.AsPrettyPrintXML = function (ret)
	{
	    ret.set_string( this.get_output(true) );
	};    

    
    

/**
 * XMLWriter - XML generator for Javascript, based on .NET's XMLTextWriter.
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
 * Date: 3/12/2008
 * @version 1.0.0
 * @author Ariel Flesler
 * http://flesler.blogspot.com/2008/03/xmlwriter-for-javascript.html
 */
 
function XMLWriter( encoding, version ){
	if( encoding )
		this.encoding = encoding;
	if( version )
		this.version = version;
};
(function(){
	
XMLWriter.prototype = {
	encoding:'ISO-8859-1',// what is the encoding
	version:'1.0', //what xml version to use
	formatting: 'indented', //how to format the output (indented/none)  ?
	indentChar:'\t', //char to use for indent
	indentation: 1, //how many indentChar to add per level
	newLine: '\n', //character to separate nodes when formatting
	//start a new document, cleanup if we are reusing
	writeStartDocument:function( standalone ){
		this.close();//cleanup
		this.stack = [ ];
		this.standalone = standalone;
	},
	//get back to the root
	writeEndDocument:function(){
		this.active = this.root;
		this.stack = [ ];
	},
	//set the text of the doctype
	writeDocType:function( dt ){
		this.doctype = dt;
	},
	//start a new node with this name, and an optional namespace
	writeStartElement:function( name, ns ){
		if( ns )//namespace
			name = ns + ':' + name;
		
		var node = { "n":name, "a":{ }, "c": [ ] };//(n)ame, (a)ttributes, (c)hildren
		
		if( this.active ){
			this.active["c"].push(node);
			this.stack.push(this.active);
		}else
			this.root = node;
		this.active = node;
	},
	//go up one node, if we are in the root, ignore it
	writeEndElement:function(){
		this.active = this.stack.pop() || this.root;
	},
	//add an attribute to the active node
	writeAttributeString:function( name, value ){
		if( this.active )
			this.active["a"][name] = value;
	},
	//add a text node to the active node
	writeString:function( text ){
		if( this.active )
			this.active["c"].push(text);
	},
	//shortcut, open an element, write the text and close
	writeElementString:function( name, text, ns ){
		this.writeStartElement( name, ns );
		this.writeString( text );
		this.writeEndElement();
	},
	//add a text node wrapped with CDATA
	writeCDATA:function( text ){
		this.writeString( '<![CDATA[' + text + ']]>' );
	},
	//add a text node wrapped in a comment
	writeComment:function( text ){
		this.writeString('<!-- ' + text + ' -->');
	},
	//generate the xml string, you can skip closing the last nodes
	flush:function(){		
		if( this.stack && this.stack[0] )//ensure it's closed
			this.writeEndDocument();
		
		var 
			chr = '', indent = '', num = this.indentation,
			formatting = this.formatting.toLowerCase() == 'indented',
			buffer = '<?xml version="'+this.version+'" encoding="'+this.encoding+'"';
			
		if( this.standalone !== undefined )
			buffer += ' standalone="'+!!this.standalone+'"';
		buffer += ' ?>';
		
		buffer = [buffer];
		
		if( this.doctype && this.root )
			buffer.push('<!DOCTYPE '+ this.root["n"] + ' ' + this.doctype+'>'); 
		
		if( formatting ){
			while( num-- )
				chr += this.indentChar;
		}
		
		if( this.root )//skip if no element was added
			format( this.root, indent, chr, buffer );
		
		return buffer.join( formatting ? this.newLine : '' );
	},
	//cleanup, don't use again without calling startDocument
	close:function(){
		if( this.root )
			clean( this.root );
		this.active = this.root = this.stack = null;
	},
	//getDocument: window.ActiveXObject 
	//	? function(){ //MSIE
	//		var doc = new ActiveXObject('Microsoft.XMLDOM');
	//		doc.async = false;
	//		doc.loadXML(this.flush());
	//		return doc;
	//	}
	//	: function(){// Mozilla, Firefox, Opera, etc.
	//		return (new DOMParser()).parseFromString(this.flush(),'text/xml');
	//}
	
	saveToJSON: function ()
	{
		return { "root": this.root,
                };
	},
	
	loadFromJSON: function (o)
	{
        this.root = o["root"];      
        this.writeEndDocument();
	},	
};

//utility, you don't need it
function clean( node ){
	var l = node["c"].length;
	while( l-- ){
		if( typeof node["c"][l] == 'object' )
			clean( node["c"][l] );
	}
	node["n"] = node["a"] = node["c"] = null;	
};

//utility, you don't need it
function format( node, indent, chr, buffer ){
	var 
		xml = indent + '<' + node["n"],
		nc = node["c"].length,
		attr, child, i = 0;
		
	for( attr in node.a )
		xml += ' ' + attr + '="' + node["a"][attr] + '"';
	
	xml += nc ? '>' : ' />';

	buffer.push( xml );
		
	if( nc ){
		do{
			child = node["c"][i++];
			if( typeof child == 'string' ){
				if( nc == 1 )//single text node
					return buffer.push( buffer.pop() + child + '</'+node["n"]+'>' );					
				else //regular text node
					buffer.push( indent+chr+child );
			}else if( typeof child == 'object' ) //element node
				format(child, indent+chr, chr, buffer);
		}while( i < nc );
		buffer.push( indent + '</'+node["n"]+'>' );
	}
	
};

})();

})();