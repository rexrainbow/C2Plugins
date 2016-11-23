// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_MazeGen = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_MazeGen.prototype;
		
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
	        this.maze_gen = new window["MazeGen"]();
	        
	    this.map = null;
        this.exp_MapWidth = 0;
        this.exp_MapHeight = 0;   
        
        // for official save/load    
        this.current_task = null;
        // for official save/load
	};
    
	instanceProto.onDestroy = function ()
	{
	    this.Cencel();
	};   
	
    instanceProto.Start = function (w, h, type, seed)
	{
	    this.maze_gen["Stop"]();
	    
        var self = this;
        var on_complete = function (args)
        {
            self.exp_MapWidth = w;
            self.exp_MapHeight = h;            
            self.map = args[0];
            self.current_task = null;
            self.runtime.trigger(cr.plugins_.Rex_MazeGen.prototype.cnds.OnCompleted, self);              
        };
        
        // for official save/load
        this.current_task = [w, h, type, seed];
        // for official save/load
        
        this.maze_gen["Start"](w, h, type, seed, on_complete);
	};   
	
    instanceProto.Cencel = function (cell)
	{
	    this.current_task = null;
	    this.maze_gen["Stop"]();    
	};		
	
    instanceProto.ValueAt = function (x, y)
	{
	    var value;
	    if (this.map && this.map[x])
	        value = this.map[x][y];
	    
	    if (value == null)
	        value = -1;
	    return value;
	};   
		
	instanceProto.saveToJSON = function ()
	{
		return { "map": this.map,
                 "w": this.exp_MapWidth,
                 "h": this.exp_MapHeight,
                 "curTsk": this.current_task,
               };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.map = o["map"];
		this.exp_MapWidth = o["w"];
		this.exp_MapHeight = o["h"];
		this.current_task = o["curTsk"];			
	};
	
	instanceProto.afterLoad = function ()
	{
		if (this.current_task !== null)
		{
		    this.Start.apply(this, this.current_task);
		}
    };
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	    
	Cnds.prototype.IsGenerating = function ()
	{
		return this.maze_gen["IsProcessing"]();
	};
	
	Cnds.prototype.OnCompleted = function ()
	{
		return true;
	};
	
	Cnds.prototype.IsCharAt = function (x, y, type)
	{
	    var c = this.ValueAt(x,y);
	    if (c === -1)
	        return false;
	    else
		    return (c === type);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
		
    Acts.prototype.GenerateMaze = function (w, h, type, seed)
	{
	    this.Start(w, h, type, seed);
	};   

    Acts.prototype.Cencel = function ()
	{
	    this.Cencel();   
	};
	
    Acts.prototype.Release = function ()
	{   
        this.exp_MapWidth = 0;
        this.exp_MapHeight = 0;	    
        this.map = null;    
	};	    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.MapWidth = function (ret)
	{
	    ret.set_float( this.exp_MapWidth );
	};

    Exps.prototype.MapHeight = function (ret)
	{
	    ret.set_float( this.exp_MapHeight );
	};   

    Exps.prototype.ValueAt = function (ret, x, y)
	{
	    ret.set_any( this.ValueAt(x,y) );
	};

    Exps.prototype.MapAsJson = function (ret)
	{
        var json = (this.map)? JSON.stringify( this.map ) : "";
	    ret.set_string( json );
	};
   	
}());

