// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_layouter_2dCharArray = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_layouter_2dCharArray.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{     
	};
    
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;       
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
	    this.check_name = "LAYOUTER";
        this.cell_width = this.properties[0];
        this.cell_height = this.properties[1];
        this._mapped_char = "";
        this._mapped_inst_uid = 0;
        this._logic_x = 0;
        this._logic_y = 0;
        this._insts = [];    // temp list
        
        // implement handlers
        this.on_add_insts = this.null_fn;
        this.on_remove_insts = this.null_fn;        
	};

	behinstProto.tick = function ()
	{
	};  

	behinstProto.null_fn = function ()
	{
	};  
	
	behinstProto.map_content = function (obj_type, _layer, s)
	{
	    var layouter = this.inst;
	    var ox = layouter.x; 
	    var oy = layouter.y; 
	    var lines = s.split("\n");
	    var c, ci, c_cnt, l, li, l_cnt=lines.length;
	    var px, py, inst, params;
	    var is_world = obj_type.plugin.is_world;
	    
	    layouter._destory_all_insts();
	    this._insts.length = 0;	    
	    for(li=0; li<l_cnt; li++)
	    {
	        l = lines[li];
	        c_cnt = l.length;
	        for (ci=0; ci<c_cnt; ci++)
	        {
	            c = l.charAt(ci);	            
	            px = ox + (ci*this.cell_width);
	            py = oy + (li*this.cell_height); 
	            inst = layouter.create_inst(obj_type,px,py,_layer);
	            if (inst == null)
	                continue;
	            this._mapped_inst_uid = inst.uid;
	            this._logic_x = ci;
	            this._logic_y = li;
	            this._insts.push(inst);
	            this._mapped_char = c;	                
	            params = {x:px,
	                      y:py};
	            layouter.layout_inst(inst, params);     
	            this.runtime.trigger(cr.behaviors.Rex_layouter_2dCharArray.prototype.cnds.OnEachChar, this.inst);	            
	        }
	    }
	    layouter.add_insts(this._insts, true);	
	    this._insts.length = 0;
	}; 	 	
    
	behinstProto.saveToJSON = function ()
	{
		return { "w": this.cell_width, 
                 "h": this.cell_height
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{            
        this.cell_width = o["w"];
	    this.cell_height = o["h"];
	};       
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnEachChar = function ()
	{	
		return true;
	}; 
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.MapContent = function (obj_type, _layer, s)
	{
	    if (!obj_type)
	        return;
		this.map_content(obj_type, _layer, s);
	}; 
    
	Acts.prototype.SetCellWidth = function (w)
	{
		this.cell_width = w;
	};	
	
	Acts.prototype.SetCellHeight = function (h)
	{
        this.cell_height = h;
	};     
	      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.InstUID = function (ret)
	{
		ret.set_int(this._mapped_inst_uid);
	};
	
	Exps.prototype.Char = function (ret)
	{
		ret.set_string(this._mapped_char);
	};		

	Exps.prototype.LX = function (ret)
	{
		ret.set_int(this._logic_x);
	};	

	Exps.prototype.LY = function (ret)
	{
		ret.set_int(this._logic_y);
	};		
}());