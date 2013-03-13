// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_LoopIterator = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_LoopIterator.prototype;
		
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
	    this.loop_iters = new cr.plugins_.Rex_LoopIterator.LoopItersKlass();
        this._last_tick = null;
	};
    
	instanceProto.is_tick_changed = function ()
	{       
	    var cur_tick = this.runtime.tickcount;
		var tick_changed = (this._last_tick != cur_tick);
        this._last_tick = cur_tick;
		return tick_changed;
	};   
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      

	Cnds.prototype.HasNext = function()
	{    
		return this.loop_iters.has_next();;
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.AddForLoop = function (name, start, end, step)
	{  
        if (this.is_tick_changed())
            this.loop_iters.reset();
            
        this.loop_iters.add_forloop(name, start, end, step);
	};

    Acts.prototype.AddList = function (name, json_string)
	{  
        if (this.is_tick_changed())
            this.loop_iters.reset();
        var list = JSON.parse(json_string);
        this.loop_iters.add_list(name, list);
	};
    Acts.prototype.Next = function ()
	{	
        this.loop_iters.next();
	};	
	
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.loopindex = function (ret, name)
	{  
        ret.set_any(this.loop_iters.index_get(name));
	}; 
}());

(function ()
{
    cr.plugins_.Rex_LoopIterator.LoopItersKlass = function()
    {
        this.loops = [];
        this.vars = {};
        this.first_flg = true;
    };
    var LoopItersKlassProto = cr.plugins_.Rex_LoopIterator.LoopItersKlass.prototype;
    
    LoopItersKlassProto.reset = function ()
    {
        this.loops.length = 0;
        var name;
        for (name in this.vars)
            delete this.vars[name];
        this.first_flg = true;
    };
    LoopItersKlassProto.add_forloop = function (name, start, end, step)
    {
        if (this.vars[name] != null)
            return;
        var iter = new forloopIterKlass(start, end, step);
        this.loops.push(iter);
        this.vars[name] = iter;
    };
    LoopItersKlassProto.add_list = function (name, list)
    {
        if (this.vars[name] != null)
            return;    
        var iter = new listIterKlass(list);
        this.loops.push(iter);
        this.vars[name] = iter;
    };
    LoopItersKlassProto.has_next = function ()
    {
        var i, cnt=this.loops.length;
        for (i=0; i<cnt; i++)
        {
            if (this.loops[i].has_next())
                return true;
        }
        return false;
    };
    LoopItersKlassProto.next = function ()
    {
        if (this.first_flg)
        {
            this._first_run();
            this.first_flg = false;
            return;
        }
        
        var i, cnt=this.loops.length, iter;
        for (i=cnt-1; i>=0; i--)
        {
            iter = this.loops[i];
            if (iter.has_next())
            {
                iter.next();
                break;
            }
            else
            {
                iter.return2zero();
            }
        }
    };    
    LoopItersKlassProto._first_run = function ()
    {
        var i, cnt=this.loops.length;
        for (i=cnt-1; i>=0; i--)
            this.loops[i].return2zero();
    };
    LoopItersKlassProto.index_get = function (name)
    {
	    var iter = this.vars[name];
	    return (iter != null)? iter.index_get():0;
    };
    
    // for loop
    var forloopIterKlass = function(start, end, step)
    {
        this.start = start;
        this.end = end;
        this.step = step;
        this.current = null;
    };
    var forloopIterKlassProto = forloopIterKlass.prototype;
    
    forloopIterKlassProto.has_next = function()
    {
        if (this.current == null)
            return true;
        return (this.current + this.step <= this.end);
    };
    forloopIterKlassProto.return2zero = function()
    {
        this.current = this.start;
    };      
    forloopIterKlassProto.next = function()
    {
        if (this.current == null)
            this.return2zero();
        else
            this.current += this.step;
    };
    forloopIterKlassProto.index_get = function()
    {
        var ret = this.current;
        if (ret == null)
            ret = this.start;
        return ret;
    };
    
    // list
    var listIterKlass = function(list)
    {
        this.list = list;
        this.current = null;
    };
    var listIterKlassProto = listIterKlass.prototype;
  
    listIterKlassProto.has_next = function()
    {
        if (this.current == null)
            return true;
        return (this.current+1 <  this.list.length);
    };
    
    listIterKlassProto.return2zero = function()
    {
        this.current = 0;
    };     
    listIterKlassProto.next = function()
    {
        if (this.current == null)
            this.return2zero();
        else
            this.current += 1;
    };
    listIterKlassProto.index_get = function()
    {
        var ret = this.current;
        if (ret == null)
            ret = 0;
            
        return this.list[ret];        
    };    
}()); 