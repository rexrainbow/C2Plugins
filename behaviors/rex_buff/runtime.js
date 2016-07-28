// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_buff = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
    // BuffCacheKlass
    var BuffCacheKlass = function ()
    {
        this.lines = [];  
    };
    var BuffCacheKlassProto = BuffCacheKlass.prototype;   
         
	BuffCacheKlassProto.alloc = function(plugin, name, priority, value, is_clamp)
	{
        var buff;
        if (this.lines.length > 0)
        {
            buff = this.lines.pop();
			buff.Init(plugin, name, priority, value, is_clamp);
        }
        else
        {
            buff = new cr.behaviors.Rex_buff.BuffKlass(plugin, name, priority, value, is_clamp);
        }            
		return buff;
	};

	BuffCacheKlassProto.free = function(buff)
	{
	    buff.plugin = null;
        this.lines.push(buff);
	};
	// BuffCacheKlass	
	cr.behaviors.Rex_buff.buff_cache = new BuffCacheKlass();
	
	var behaviorProto = cr.behaviors.Rex_buff.prototype;
		
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
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
	    this.is_my_call = false;
	    	    
	    this.base = this.properties[0];
	    this.max = this.properties[1];	 
	    this.min = this.properties[2];
		this.sum = this.base;	
        this.next_lower_priority = 0;		

	    if (!this.recycled)
	    {
		    this.buff = {};
		    this.queue = [];
        }
		this.buff_cache = cr.behaviors.Rex_buff.buff_cache;

        this.exp_CurIndex = 0;            
        this.exp_CurBuff = null;     
        
        /**BEGIN-PREVIEWONLY**/
        this.propsections = [];
        /**END-PREVIEWONLY**/		
	};
	
	behinstProto.onDestroy = function()
	{
        this.RemoveAllBuffs();
	};    	
	
	behinstProto.tick = function ()
	{	   
	};

    behinstProto.AddBuff = function (name, priority, value, is_clamp)
	{
	    priority = Math.floor(priority);
	    var buff;
		if (!this.buff.hasOwnProperty(name))
		{	
			buff = this.buff_cache.alloc(this, name, priority, value, is_clamp);
			this.buff[name] = buff;
			this.queue.push(buff);
		}
		else  // already in this behavior
		{
            buff = this.buff[name];
		    buff.Init(this, name, priority, value, is_clamp);
		}
        this.queue.sort(_sort_by_priority);
		this.next_lower_priority_update(priority);
	};	
	
    behinstProto.RemoveBuff = function (name)
	{
	    if (!this.buff.hasOwnProperty(name))
		    return;
			
	    var buff = this.buff[name];
	    delete this.buff[name];
		cr.arrayFindRemove(this.queue, buff);
		this.buff_cache.free(buff);	
	};
	
    behinstProto.RemoveAllBuffs = function ()
	{
	    this.queue.length = 0;
        var name, buff;
		for (name in this.buff)
		{
	        buff = this.buff[name];
	        delete this.buff[name];
		    this.buff_cache.free(buff);
        }			
	};	
	
    behinstProto.sum_update = function ()
	{
		var sum = this.base;
		var i, ql = this.queue.length;
		for (i=0; i<ql; i++)
		{
		    sum = this.queue[i].SumGet(sum);
		}

	    if (this.sum != sum)
	    {
	        this.sum = sum;
	        this.is_my_call = true;
	        this.runtime.trigger(cr.behaviors.Rex_buff.prototype.cnds.OnSumChanging, this.inst);
	        this.is_my_call = false;
	    }
	};
	
    behinstProto.next_lower_priority_update = function (new_priority)
	{
		if (new_priority >= this.next_lower_priority)
		    this.next_lower_priority = new_priority + 1;
	};	
	
	var _sort_by_priority = function(buff_a, buff_b)
	{   	    
		var pa = buff_a.priority;
		var pb = buff_b.priority;
		return (pa < pb)? -1:
		       (pa > pb)? 1:
			              0;
	};
	
	behinstProto.saveToJSON = function ()
	{
	    var q_save = [];
		var i, ql = this.queue.length;
		for (i=0; i<ql; i++)
		{
		    q_save.push(this.queue[i].saveToJSON());
		}
		return {"b":this.base,
		        "max": this.max,
		        "min": this.min,
				"sum": this.sum,
				"np": this.next_lower_priority,
				"q": q_save
		};
	};
	
	behinstProto.loadFromJSON = function (o)
	{
	    this.base = o["b"]
	    this.max = o["max"];	 
	    this.min = o["min"];	
		this.sum = o["sum"];
		this.next_lower_priority = o["np"];
		
		this.queue.length = 0;
		
	    var q_save = o["q"];
		var i, ql = q_save.length, buff;
		for (i=0; i<ql; i++)
		{
		    buff = new cr.behaviors.Rex_buff.BuffKlass(this);
			buff.loadFromJSON(q_save[i]);
		    this.queue.push(buff);
		}
	};

    /**BEGIN-PREVIEWONLY**/
    behinstProto.getDebuggerValues = function (propsections)
    {
        this.propsections.length = 0;
		this.propsections.push({"name": "Base", "value": this.base});
		var i, ql = this.queue.length;
		for (i=0; i<ql; i++)
		{
		    this.queue[i].getDebuggerValues(this.propsections);
		}		
        this.propsections.push({"name": "Sum", "value": this.sum, "readonly": true});
        propsections.push({
            "title": this.type.name,
            "properties": this.propsections
        });
    };
    
    behinstProto.onDebugValueEdited = function (header, name, value)
    {
	    if (name == "Base")
		{
		    this.base = value;
			this.sum_update();		
		}
		else if (name.substring(0,5) == "Buff-") // set buff value
		{
		    var buff_name = name.substring(5);
			var buff = this.buff[buff_name];
            buff.ValueSet(value);
			this.sum_update();	
		}
    };
    /**END-PREVIEWONLY**/		
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
    Cnds.prototype.OnSumChanging = function ()
	{
		return this.is_my_call;
	};

	Cnds.prototype.CompareSum = function (cmp, s)
	{
		return cr.do_cmp(this.sum, cmp, s);
	};
	
	Cnds.prototype.ForEachBuff = function ()
	{
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();

		var i, cnt=this.queue.length;
		for(i=0; i<cnt; i++)
		{
            if (solModifierAfterCnds)            
                this.runtime.pushCopySol(current_event.solModifiers);            
            
            this.exp_CurIndex = i;            
            this.exp_CurBuff = this.queue[this.exp_CurIndex];   
            current_event.retrigger();
            
		    if (solModifierAfterCnds)		    
		        this.runtime.popSol(current_event.solModifiers);		   
		}
     		
		return false;
	};      
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.SetBase = function (v)
	{
        this.base = v;
        this.sum_update();
	};
	
    Acts.prototype.SetMax = function (v)
	{
	    this.max = v;
	    this.sum_update();
	};	
	
    Acts.prototype.SetMin = function (v)
	{
	    this.min = v;
	    this.sum_update();	
	};
	
    Acts.prototype.AddToBase = function (v)
	{
	    this.base += v;
	    this.sum_update();	
	};	
	
    Acts.prototype.SubtractFromBase = function (v)
	{
	    this.base -= v;
	    this.sum_update();	
	};		
	
    Acts.prototype.AddBuff = function (name, priority, value, is_clamp)
	{
	    this.AddBuff(name, priority, value, (is_clamp==1));
	    this.sum_update();		    
	};	
	
    Acts.prototype.RemoveBuff = function (name)
	{
	    this.RemoveBuff(name);
	    this.sum_update();		    
	};	
	
    Acts.prototype.RemoveAllBuffs = function ()
	{
	    this.RemoveAllBuffs();
	    this.sum_update();		    
	};	
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.Sum = function (ret)
	{
		ret.set_float(this.sum);
	}; 	
	
 	Exps.prototype.Base = function (ret)
	{
		ret.set_float(this.base);
	}; 	
	
 	Exps.prototype.Max = function (ret)
	{
		ret.set_float(this.max);
	};	
	
 	Exps.prototype.Min = function (ret)
	{
		ret.set_float(this.min);
	};
	
 	Exps.prototype.Buff = function (ret, i)
	{
	    var value;	
	    if (name == null)
		    value = this.sum - this.base;
		else
		{
            if (typeof(i) === "string")
            {
	            if (this.buff.hasOwnProperty(i))
		            value = this.buff[i].buff;
            }
            else
            {
                if (this.queue.hasOwnProperty(i))
                    value = this.queue[i].buff;
            }
	    }
		ret.set_float(value || 0);
	};
	
 	Exps.prototype.NextPriority = function (ret)
	{
		ret.set_int(this.next_lower_priority);
	};
    
 	Exps.prototype.BuffCount = function (ret)
	{
		ret.set_int(this.queue.length);
	};    
	
 	Exps.prototype.CurIndex = function (ret)
	{
		ret.set_int(this.exp_CurIndex);
	};    
    
 	Exps.prototype.CurBuffName = function (ret)
	{
        var val;
        if (this.exp_CurBuff)
            val = this.exp_CurBuff.name;
		ret.set_string(val || "");
	};    
    
 	Exps.prototype.CurBuffValue = function (ret)
	{
        var val;
        if (this.exp_CurBuff)
            val = this.exp_CurBuff.buff;
		ret.set_float(val || 0);
	};    
    
 	Exps.prototype.Index2BuffName = function (ret, index)
	{
        var val, buff = this.queue[index];
        if (buff)
            val = buff.name;
		ret.set_string(val || "");
	};    
    
 	Exps.prototype.Index2BuffValue = function (ret, index)
	{
        var val, buff = this.queue[index];
        if (buff)
            val = buff.buff;
		ret.set_float(val || 0);
	};    
    
}());

(function ()
{

	cr.behaviors.Rex_buff.BuffKlass = function (plugin, name, priority, value, is_clamp)
	{
	    this.Init(plugin, name, priority, value, is_clamp);
	};
	var BuffKlassProto = cr.behaviors.Rex_buff.BuffKlass.prototype;   
	
	BuffKlassProto.Init = function (plugin, name, priority, value, is_clamp)
	{
	    this.plugin = plugin;
		this.name = name;
	    this.priority = priority;
		this.buff = 0;
		this.is_clamp = is_clamp;
		this.ValueSet(value);
	};
	
	BuffKlassProto.ValueSet = function (value)
	{
		if (typeof(value) == "number")
		{
		    this.is_percentage = false;
			this.value = value;
		}
		else  // (typeof(value) == "string")
		{
		    if (value.indexOf("%") == -1)
			{
			    this.is_percentage = false;
			    this.value = parseFloat(value);				
			}
			else  // % in value
			{
			    this.is_percentage = true;
			    this.value = parseFloat(value)/100;				
			}
		}	
	};	
	
	BuffKlassProto.SumGet = function (value_in)
	{
	    var base = (this.priority >= 0)? value_in : this.plugin.base;
		this.buff = (this.is_percentage)? (base*this.value) : this.value;
		var sum = value_in + this.buff;
		if (this.is_clamp)
		{
		    sum = cr.clamp(sum, this.plugin.min, this.plugin.max);
			this.buff = sum - value_in;
	    }
			
	    return sum;
	};
	
	BuffKlassProto.saveToJSON = function ()
	{
		return {"n": this.name,
		        "p":this.priority,
		        "v": this.value,
		        "b": this.buff,
				"is": this.is_percentage,
				"ismm": this.is_clamp,
		};
	};
	
	BuffKlassProto.loadFromJSON = function (o)
	{
	    this.priority = o["p"];
		this.value = o["v"];
		this.buff = o["b"];
        this.is_percentage = o["is%"];
		this.is_clamp = o["ismm"];
	};	
	
	BuffKlassProto.getDebuggerValues = function (propsections)
	{
	    var valueS = (this.is_percentage)? (this.value*100).toString()+"%" : this.value.toString();
		if (this.value >= 0)
		    valueS = "+"+valueS;
		propsections.push({"name": "Buff-"+this.name, "value": valueS});		
	};	
	
}());
	