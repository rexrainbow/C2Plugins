// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_layouter_text = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_layouter_text.prototype;
		
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
        this.content = "";
        this.character_object_sid = -1;
        this.char2frameindex = {};
        this._char2frameindex_set(this.properties[0]);
        
        this._sprite_objtype = null;
        this._sprite_index = 0;  // temp var
        this._insts = [];        // temp list
	};
    
	behinstProto._char2frameindex_set = function (characters)
	{
        var c;
        for (c in this.char2frameindex)
            delete this.char2frameindex[c];
        var i, cnt=characters.length;
        for (i=0; i<cnt; i++)
        {
            c = characters.charAt(i);
            this.char2frameindex[c] = i;
        }
	}; 
	behinstProto.tick = function ()
	{
	};  
	
	behinstProto._get_character_object = function ()
	{
        if (this._sprite_objtype == null)
            this._sprite_objtype = this.runtime.getObjectTypeBySid(this.character_object_sid);
        return this._sprite_objtype;
	};  
    
	behinstProto._get_sprite_inst = function ()
	{
        var inst = null;
        var sprites = this.inst.sprites;
        var sprites_cnt = sprites.length;
        while (this._sprite_index < sprites_cnt)
        {
            inst = this.runtime.getObjectByUID(sprites[this._sprite_index]);
            this._sprite_index += 1;
            if (inst instanceof cr.plugins_.Sprite.prototype.Instance)
                break;
            else
                inst = null;
        }
        return inst;
	};    
    
	behinstProto.set_text = function (text)
	{
        var objtype = this._get_character_object();
        if (!objtype)
            return;            
        this.content = text;
        var set_frameindex = cr.plugins_.Sprite.prototype.acts.SetAnimFrame;
        var set_amin_speed = cr.plugins_.Sprite.prototype.acts.SetAnimSpeed;
        var layouter=this.inst;
        var sprites=layouter.sprites;
        var i, text_len = text.length;
        this._sprite_index = 0;    
        var inst, c, frame_index;
        this._insts.length = 0;
        var mode = null;    // 0: add, 1: remove
	    for (i=0; i<text_len; i++)
	    {	
            inst = this._get_sprite_inst();
            if (inst == null)  // create a sprite inst
            {
                inst = this.inst.create_inst(objtype, 0, 0);
                this._insts.push(inst);
                mode = 0;
            }
	        
            c = text.charAt(i);
            frame_index = this.char2frameindex[c];
            if (frame_index == null)
                frame_index = -1;         
            if (inst.cur_frame != frame_index)
                set_frameindex.call(inst, frame_index);
            if (inst.cur_anim_speed != 0)
                set_amin_speed.call(inst, 0);            
	    }
        if (mode == null)        
        {
            inst = this._get_sprite_inst();
            while (inst != null)
            {                
                this._insts.push(inst);
                inst = this._get_sprite_inst();
            }
            if (this._insts.length > 0)
                mode = 1;
        }
        if (mode == 0)
            this.inst.add_insts(this._insts);
        else if (mode == 1)
            this.inst.destroy_insts(this._insts);
        this._insts.length = 0;
	}; 
	behinstProto.saveToJSON = function ()
	{
		return { "t": this.content,
		         "csid": this.character_object_sid,
                 "c2fi": this.char2frameindex,
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{            
        this.content = o["t"];
        this.character_object_sid = o["csid"];
        this.char2frameindex = o["c2fi"];
	};       
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.SetCharacterObject = function (objtype)
	{
	    if (!objtype)
	        return;
	    assert2(cr.plugins_.Sprite, "Layouter text: you should assign a sprite objct for character.");	       
        this._sprite_objtype = objtype;        
		this.character_object_sid = objtype.sid;
	}; 
    
	Acts.prototype.SetText = function(param)
	{
		if (cr.is_number(param) && param < 1e9)
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		
		var text_to_set = param.toString();		
		if (this.content !== text_to_set)		
			this.set_text(text_to_set);		
	};  
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.Value = function (ret)
	{
	    ret.set_float(this.value);
	};	
}());