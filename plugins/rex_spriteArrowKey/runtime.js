// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Sprite2ArrowKey = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Sprite2ArrowKey.prototype;
		
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
        this._directions = this.properties[0];
        this.runtime.tickMe(this);
        this.setup_stage = true;
        // touch   
        this.touchwrap = null;
        this.pre_key_id = 0;
        this.keyMap = [{uid:null, state:false, is_in_touch:false}, 
                       {uid:null, state:false, is_in_touch:false}, 
                       {uid:null, state:false, is_in_touch:false}, 
                       {uid:null, state:false, is_in_touch:false}  ];
        
        this.press_handlers =   [cr.plugins_.Rex_Sprite2ArrowKey.prototype.cnds.OnRIGHTPressed,
                                 cr.plugins_.Rex_Sprite2ArrowKey.prototype.cnds.OnDOWNPressed,
                                 cr.plugins_.Rex_Sprite2ArrowKey.prototype.cnds.OnLEFTPressed,
                                 cr.plugins_.Rex_Sprite2ArrowKey.prototype.cnds.OnUPPressed     ];   
        this.release_handlers = [cr.plugins_.Rex_Sprite2ArrowKey.prototype.cnds.OnRIGHTReleased,
                                 cr.plugins_.Rex_Sprite2ArrowKey.prototype.cnds.OnDOWNReleased,
                                 cr.plugins_.Rex_Sprite2ArrowKey.prototype.cnds.OnLEFTReleased,
                                 cr.plugins_.Rex_Sprite2ArrowKey.prototype.cnds.OnUPReleased    ];
	};

	instanceProto.TouchWrapGet = function ()
	{  
        var plugins = this.runtime.types;
        var name, obj;
        for (name in plugins)
        {
            obj = plugins[name].instances[0];
            if ((obj != null) && (obj.check_name == "TOUCHWRAP"))
            {
                this.touchwrap = obj;
                this.touchwrap.HookMe(this);
                break;
            }
        }
	}; 
    
    instanceProto.OnTouchStart = function (_NthTouch, _TouchX, _TouchY)
    {
    };
    
    instanceProto.OnTouchEnd = function (_NthTouch)
    {
    };

    instanceProto.tick = function()
    {
        this._setup();
        this._touch_arrow();
    };

	instanceProto._setup = function ()
	{
        if (!this.setup_stage)
            return;
        
        this.TouchWrapGet();  
        this.setup_stage = false;
        if (this.touchwrap == null)
            assert("Sprite Arrow key object need at least one input signal.");
	};
    
    instanceProto._update_is_in_touch = function()
    {
        if (!this.touchwrap.IsInTouch())
        {
            var i;
            for (i=0; i<4; i++)
                this.keyMap[i].is_in_touch = false;
            return;
        }
        var touchs = this.touchwrap.touches, tx, ty;    
        var i, px, py, inst, keyMap;    
        var j, lenj = touchs.length;        
        for (i=0; i<4; i++)
        {
            keyMap = this.keyMap[i];
            keyMap.is_in_touch = false;       
            if (keyMap.uid == null)			
			    continue;
            inst = this.runtime.getObjectByUID(keyMap.uid);
            if (inst == null)
                continue;
 			for (j=0; j<lenj; j++)
			{
				tx = touchs[j].x;
				ty = touchs[j].y;
				px = inst.layer.canvasToLayer(tx, ty, true);
				py = inst.layer.canvasToLayer(tx, ty, false);
                if (inst.contains_pt(px, py))
				{
				    keyMap.is_in_touch = true;
					break;
			    }
			}
        }
    };    
    
    var RIGHTKEY = 0x1;
    var DOWNKEY = 0x2;
    var LEFTKEY = 0x4;
    var UPKEY = 0x8;
	instanceProto._touch_arrow = function ()
	{    
        if (this.touchwrap == null)       
            return;
        
        this._update_is_in_touch();

        switch (this._directions)
        {
        case 0:  // Up & down
            var key_id = (this.keyMap[3].is_in_touch)?  UPKEY:
                         (this.keyMap[1].is_in_touch)?  DOWNKEY:0;
            this._keydown(key_id);
            break;
        case 1:  // Left & right
            var key_id = (this.keyMap[0].is_in_touch)?  RIGHTKEY:
                         (this.keyMap[2].is_in_touch)?  LEFTKEY:0;
            this._keydown(key_id);
            break;  
        case 2:  // 4 directions
            var key_id = (this.keyMap[0].is_in_touch)?  RIGHTKEY:
                         (this.keyMap[1].is_in_touch)?  DOWNKEY:
                         (this.keyMap[2].is_in_touch)?  LEFTKEY:
                         (this.keyMap[3].is_in_touch)?  UPKEY:0;                          
            this._keydown(key_id);
            break;
        case 3:  // 8 directions
            var key_UD = (this.keyMap[3].is_in_touch)?  UPKEY:
                         (this.keyMap[1].is_in_touch)?  DOWNKEY:0;
            var key_LR = (this.keyMap[0].is_in_touch)?  RIGHTKEY:
                         (this.keyMap[2].is_in_touch)?  LEFTKEY:0;                       
            this._keydown(key_UD + key_LR);
            break;                
        }
	}; 
    
    var _keyid_list = [RIGHTKEY,DOWNKEY,LEFTKEY,UPKEY];       
    instanceProto._keydown = function(key_id)
    {
        if (this.pre_key_id == key_id)
            return;
        		
        var i, is_key_down;
        for (i=0; i<4; i++)
        {
            var is_key_down = ((_keyid_list[i] & key_id) != 0);            
            if (this.keyMap[i].state && (!is_key_down))
                this.runtime.trigger(this.release_handlers[i], this);
        }
        var pressed_any_key = false;
        for (i=0; i<4; i++)
        {
            var is_key_down = ((_keyid_list[i] & key_id) != 0); 
            if ((!this.keyMap[i].state) && is_key_down)
            {
                this.runtime.trigger(this.press_handlers[i], this);
                pressed_any_key = true;
            }
            this.keyMap[i].state = is_key_down;
        }         
        if (pressed_any_key)
            this.runtime.trigger(cr.plugins_.Rex_Sprite2ArrowKey.prototype.cnds.OnAnyKey, this);
        
        this.pre_key_id = key_id;            
    };    
	
	instanceProto.saveToJSON = function ()
	{    	    
	    var i, cnt=this.keyMap.length, keyuid=[];
	    for (i=0; i<cnt; i++)
	        keyuid.push(this.keyMap[i].uid);
		return { "keyuid": keyuid,
                 };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    var keyuid = o["keyuid"];
	    var i, cnt=this.keyMap.length, keyMap;
	    for (i=0; i<cnt; i++)
		    this.keyMap[i].uid = keyuid[i];
	};    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.IsUPDown = function()
	{
        return this.keyMap[3].state;
	};
	Cnds.prototype.IsDOWNDown = function()
	{
        return this.keyMap[1].state;    
	};	
	Cnds.prototype.IsLEFTDown = function()
	{
        return this.keyMap[2].state;
	};
	Cnds.prototype.IsRIGHTDown = function()
	{
        return this.keyMap[0].state;
	};    
    
	Cnds.prototype.OnUPPressed = function()
	{
        return true;
	};
	Cnds.prototype.OnDOWNPressed = function()
	{
        return true;    
	};    
	Cnds.prototype.OnLEFTPressed = function()
	{
        return true;    
	};
	Cnds.prototype.OnRIGHTPressed = function()
	{
        return true;    
	};      

	Cnds.prototype.OnAnyPressed = function()
	{
        return true;    
	};
	
	Cnds.prototype.OnUPReleased = function()
	{
        return true;
	};
	Cnds.prototype.OnDOWNReleased = function()
	{
        return true;    
	};  
	Cnds.prototype.OnLEFTReleased = function()
	{
        return true;    
	};
	Cnds.prototype.OnRIGHTReleased = function()
	{
        return true;    
	};     
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetArrowkeySprite = function (arrowkey, objs)
	{
	    if (!objs)
	        return;
	    var keyMap = this.keyMap[arrowkey];
		keyMap.uid = objs.getFirstPicked().uid;
		keyMap.state = false;
		keyMap.is_in_touch = false;
	}; 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());