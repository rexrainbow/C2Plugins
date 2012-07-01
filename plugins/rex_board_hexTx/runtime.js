// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGHexTx = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SLGHexTx.prototype;
		
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
        this.check_name = "LAYOUT";
        this.PositionOX = this.properties[0];
        this.PositionOY = this.properties[1];
        this.width = this.properties[2];
        this.half_width = this.width/2;
        this.height = this.properties[3];
	};
   
	instanceProto.GetX = function(logic_x, logic_y)
	{
        return (logic_x*this.width)+((logic_y%2)*this.half_width)+this.PositionOX;
	};
	instanceProto.GetY = function(logic_x, logic_y)
	{
        return (logic_y*this.height)+this.PositionOY;
	};   
	instanceProto.CreateItem = function(obj_type,x,y,layer)
	{
        return this.runtime.createInstance(obj_type, layer,this.GetX(x,y),this.GetY(x,y) );        
	}; 	
	instanceProto.GetNeighborLX = function(x, y, dir)
	{
	    var dx;
	    if ((y%2) == 1)
		{
		    dx = ((dir==0) || (dir==1) || (dir==5))? 1:
			     (dir==3)?                          (-1):
                                                   0;
        }												  
        else
		{
		    dx = ((dir==2) || (dir==3) || (dir==4))? (-1):
			     (dir==0)?                           1:
                                                     0;
        }
		return (x+dx);
	};
	instanceProto.GetNeighborLY = function(x, y, dir)
	{
        var dy = ((dir==1) || (dir==2))? 1:
			     ((dir==4) || (dir==5))? (-1):
                                         0;        
        return (y+dy);						 
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