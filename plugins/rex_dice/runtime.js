// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Dice = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Dice.prototype;
		
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
        this.dice_results = [];
		this.dice_count = 0;
		this.dice_faces = 0;
		this.dice_sum = 0;	

        this.randomGenUid = -1;    // for loading               
	};
	cr.plugins_.Rex_Dice._random_gen = null;  // random generator for Shuffing	
	
	instanceProto.Roll = function(dice_count, dice_faces)
	{
		this.dice_count = dice_count;
		this.dice_faces = dice_faces; 
        this.dice_results.length = dice_count;
		var i, value;
		this.dice_sum = 0;
		for(i=0;i<dice_count;i++)
		{
		    value = Math.floor( this._get_random_value() * dice_faces + 1 );
		    this.dice_results[i] = value;
			this.dice_sum += value;
		}
		//return this.dice_sum;
	};	
	
	instanceProto._get_random_value = function()
	{
	    var gen = cr.plugins_.Rex_Dice._random_gen;
	    var value = (gen == null)?
			        Math.random(): gen.random();
        return value;
	};		

	instanceProto.saveToJSON = function ()
	{
        var randomGen = cr.plugins_.Rex_Dice._random_gen;
        var randomGenUid = (randomGen != null)? randomGen.uid:(-1);    
		return { "rs": this.dice_results,
		         "c": this.dice_count,
                 "f": this.dice_faces,
				 "s": this.dice_sum,
                 "randomuid":randomGenUid};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.dice_results = o["rs"];
		this.dice_count = o["c"];
		this.dice_faces = o["d"];
		this.dice_sum = o["s"];		
        
        this.randomGenUid = o["randomuid"];	        
	};
    
	instanceProto.afterLoad = function ()
	{
        var randomGen;
		if (this.randomGenUid === -1)
			randomGen = null;
		else
		{
			randomGen = this.runtime.getObjectByUID(this.randomGenUid);
			assert2(randomGen, "Pattern gen: Failed to find random gen object by UID");
		}		
		this.randomGenUid = -1;			
		cr.plugins_.Rex_Dice._random_gen = randomGen;
	};    
    
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
        var prop = [
            {"name": "Count", "value": this.dice_count},
            {"name": "Faces", "value": this.dice_faces},
            {"name": "Sum", "value": this.dice_sum}
        ];
        var i, cnt=this.dice_results.length;
        for (i=0; i<cnt; i++)
        {
	        prop.push({"name": "Die-"+i.toString(), "value": this.dice_results[i]});
        }
		propsections.push({
			"title": this.type.name,
			"properties": prop
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/       
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.Roll = function (dice_count, dice_faces)
	{	
	    this.Roll(dice_count, dice_faces);
	}; 
	
    Acts.prototype.SetRandomGenerator = function (random_gen_objs)
	{
        var random_gen = random_gen_objs.getFirstPicked();
        if (random_gen.check_name == "RANDOM")
            cr.plugins_.Rex_Dice._random_gen = random_gen;        
        else
            alert ("[Pattern generator] This object is not a random generator object.");
	}; 	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
    Exps.prototype.Roll = function (ret, p0, p1)
	{
	    if (typeof (p0) == "number")
		{
		    this.Roll(p0, p1);
		}		
		else
		{
		    p0 = p0.toLowerCase();
			var params = p0.split("d");
			if (params.length < 2)
			{
		        this.dice_count = 0;
		        this.dice_faces = 0;
		        this.dice_sum = 0;
	        }
			else
			{
			    p0 = parseInt(params[0]);
				p1 = parseInt(params[1]);
			    this.Roll(p0, p1);
			}
		}
	    ret.set_int( this.dice_sum );
	};
    Exps.prototype.DiceCount = function (ret)
	{
	    ret.set_int( this.dice_count );
	};
    Exps.prototype.DiceFaces = function (ret)
	{
	    ret.set_int( this.dice_faces );
	};  
    Exps.prototype.Sum = function (ret)
	{
	    ret.set_int( this.dice_sum );
	};
    Exps.prototype.Die = function (ret, index)
	{
	    var value = this.dice_results[index];
		if (value == null)
		    value = 0;
	    ret.set_int( value );
	}; 
	
}());