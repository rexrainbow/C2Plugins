// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Simplex = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Simplex.prototype;
		
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
		
		this.i = 0;		// period offset (radians)
	};
	
	var behinstProto = behaviorProto.Instance.prototype;
	
	behinstProto.onCreate = function()
	{
		// Load properties
		this.active = (this.properties[0] === 1);
		this.movement = this.properties[1]; // 0=Horizontal|1=Vertical|2=Size|3=Width|4=Height|5=Angle|6=Opacity|7=Value only
		this.i = this.properties[2];
		this.i += Math.random() * this.properties[3];								// start random
		this.increment = this.properties[4];
		this.increment += Math.random() * this.properties[5];					    // increment random
		
		this.mag = this.properties[6];													// magnitude
		this.mag += Math.random() * this.properties[7];									// magnitude random
        
        this.seed = this.properties[8];
        this.seed += Math.random() * this.properties[9];
        
        if (!this.recycled)
        {
            this.noise = new Noise();
        }
        this.lastValue = null;
            
        this.noise.SetSeed(this.seed);
    			
		this.initialValue = 0;
		this.initialValue2 = 0;
		this.ratio = 0;
		
		this.init();
	};
	
	behinstProto.saveToJSON = function ()
	{
		return {
			"i": this.i,
			"a": this.active,
			"mv": this.movement,
			"inc": this.increment,
			"mag": this.mag,
            "seed": this.seed,
			"iv": this.initialValue,
			"iv2": this.initialValue2,
			"r": this.ratio,
			"lkv": this.lastKnownValue,
			"lkv2": this.lastKnownValue2
		};
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.i = o["i"];
		this.active = o["a"];
		this.movement = o["mv"];
		this.increment = o["inc"];
		this.mag = o["mag"];
        this.seed = o["seed"];
		this.initialValue = o["iv"];
		this.initialValue2 = o["iv2"] || 0;
		this.ratio = o["r"];
		this.lastKnownValue = o["lkv"];
		this.lastKnownValue2 = o["lkv2"] || 0;
        
        this.noise.SetSeed(this.seed);
	};
	
	behinstProto.init = function ()
	{
		switch (this.movement) {
		case 0:		// horizontal
			this.initialValue = this.inst.x;
			break;
		case 1:		// vertical
			this.initialValue = this.inst.y;
			break;
		case 2:		// size
			this.initialValue = this.inst.width;
			this.ratio = this.inst.height / this.inst.width;
			break;
		case 3:		// width
			this.initialValue = this.inst.width;
			break;
		case 4:		// height
			this.initialValue = this.inst.height;
			break;
		case 5:		// angle
			this.initialValue = this.inst.angle;
			this.mag = cr.to_radians(this.mag);		// convert magnitude from degrees to radians
			break;
		case 6:		// opacity
			this.initialValue = this.inst.opacity;
			break;
		case 7:
			//value only, leave at 0
			this.initialValue = 0;
			break;
		case 8:		// forwards/backwards
			this.initialValue = this.inst.x;
			this.initialValue2 = this.inst.y;
			break;
		default:
			assert2(false, "Invalid noise movement type");
		}
		
		this.lastKnownValue = this.initialValue;
		this.lastKnownValue2 = this.initialValue2;
	};
	
	behinstProto.waveFunc = function (x)
	{
        if (this.lastValue === null)
            this.lastValue = this.noise.Simplex1(x);
            
        return this.lastValue;
	};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		
		if (!this.active || dt === 0)
			return;
		
		this.i += (this.increment * dt);
        this.lastValue = null;
		
		switch (this.movement) {
		case 0:		// horizontal
			if (this.inst.x !== this.lastKnownValue)
				this.initialValue += this.inst.x - this.lastKnownValue;
				
			this.inst.x = this.initialValue + this.waveFunc(this.i) * this.mag;
			this.lastKnownValue = this.inst.x;
			break;
		case 1:		// vertical
			if (this.inst.y !== this.lastKnownValue)
				this.initialValue += this.inst.y - this.lastKnownValue;
				
			this.inst.y = this.initialValue + this.waveFunc(this.i) * this.mag;
			this.lastKnownValue = this.inst.y;
			break;
		case 2:		// size
			this.inst.width = this.initialValue + this.waveFunc(this.i) * this.mag;
			this.inst.height = this.inst.width * this.ratio;
			break;
		case 3:		// width
			this.inst.width = this.initialValue + this.waveFunc(this.i) * this.mag;
			break;
		case 4:		// height
			this.inst.height = this.initialValue + this.waveFunc(this.i) * this.mag;
			break;
		case 5:		// angle
			if (this.inst.angle !== this.lastKnownValue)
				this.initialValue = cr.clamp_angle(this.initialValue + (this.inst.angle - this.lastKnownValue));
				
			this.inst.angle = cr.clamp_angle(this.initialValue + this.waveFunc(this.i) * this.mag);
			this.lastKnownValue = this.inst.angle;
			break;
		case 6:		// opacity
			this.inst.opacity = this.initialValue + (this.waveFunc(this.i) * this.mag) / 100;
			
			if (this.inst.opacity < 0)
				this.inst.opacity = 0;
			else if (this.inst.opacity > 1)
				this.inst.opacity = 1;
				
			break;
		case 8:		// forwards/backwards
			if (this.inst.x !== this.lastKnownValue)
				this.initialValue += this.inst.x - this.lastKnownValue;
			if (this.inst.y !== this.lastKnownValue2)
				this.initialValue2 += this.inst.y - this.lastKnownValue2;
				
			this.inst.x = this.initialValue + Math.cos(this.inst.angle) * this.waveFunc(this.i) * this.mag;
			this.inst.y = this.initialValue2 + Math.sin(this.inst.angle) * this.waveFunc(this.i) * this.mag;
			this.lastKnownValue = this.inst.x;
			this.lastKnownValue2 = this.inst.y;
			break;
		}

		this.inst.set_bbox_changed();
	};
	
	behinstProto.onSpriteFrameChanged = function (prev_frame, next_frame)
	{
		// Handle size change when in width, height or size mode
		switch (this.movement) {
		case 2:	// size
			this.initialValue *= (next_frame.width / prev_frame.width);
			this.ratio = next_frame.height / next_frame.width;
			break;
		case 3:	// width
			this.initialValue *= (next_frame.width / prev_frame.width);
			break;
		case 4:	// height
			this.initialValue *= (next_frame.height / prev_frame.height);
			break;
		}
	};
	
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Active", "value": this.active},
				{"name": "Magnitude", "value": this.mag},                
			    {"name": "Mapping position", "value": this.i},
				{"name": "Value", "value": this.waveFunc(this.i) * this.mag, "readonly": true}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		switch (name) {
		case "Active":			this.active = value;			break;
		case "Magnitude":		this.mag = value;				break;
		}
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};	
	behaviorProto.cnds = new Cnds();
		
	Cnds.prototype.IsActive = function ()
	{
		return this.active;
	};
	
	Cnds.prototype.CompareMovement = function (m)
	{
		return this.movement === m;
	};
	
	Cnds.prototype.CompareMagnitude = function (cmp, v)
	{
		if (this.movement === 5)
			return cr.do_cmp(this.mag, cmp, cr.to_radians(v));
		else
			return cr.do_cmp(this.mag, cmp, v);
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
		
	Acts.prototype.SetActive = function (a)
	{
		this.active = (a === 1);
	};
	
	Acts.prototype.SetMagnitude = function (x)
	{
		this.mag = x;
		
		if (this.movement === 5)	// angle
			this.mag = cr.to_radians(this.mag);
	};
	
	Acts.prototype.SetMappingPosition = function (x)
	{
	    if (this.i === x)
	        return;
	        
		this.i = x;
        this.lastValue = null;
	};
	
	Acts.prototype.SetIncreasement = function (inc)
	{
		this.increment = inc;
	};		

	Acts.prototype.SetSeed = function (seed)
	{
	    this.seed = seed;
        this.noise.SetSeed(this.seed);
	};		
	
	Acts.prototype.SetMovement = function (m)
	{
		// Undo radians conversion if in angle mode
		if (this.movement === 5)
			this.mag = cr.to_degrees(this.mag);
			
		this.movement = m;
		this.init();
	};
		
	Acts.prototype.UpdateInitialState = function ()
	{
		this.init();
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};	
	behaviorProto.exps = new Exps();

	Exps.prototype.Magnitude = function (ret)
	{
		if (this.movement === 5)	// angle
			ret.set_float(cr.to_degrees(this.mag));
		else
			ret.set_float(this.mag);
	};
	
	Exps.prototype.MappingPosition = function (ret)
	{
		ret.set_float(this.i);
	};
	
	Exps.prototype.Increment = function (ret)
	{
		ret.set_float(this.increment);
	};		
	
	Exps.prototype.Seed = function (ret)
	{
		ret.set_float(this.seed);
	};			
	
	Exps.prototype.Value = function (ret)
	{
		ret.set_float(this.waveFunc(this.i) * this.mag);
	};


    // ---- Simplex1 ----
    //reference: https://github.com/SRombauts/SimplexNoise/blob/master/src/SimplexNoise.cpp    
    // global
    var p = [151,160,137,91,90,15,
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];    
    // global
    
    var Noise = function()
    {    
        // To remove the need for index wrapping, double the permutation table length
        this.perm = new Uint8Array(256);
    };
    var NoiseProto = Noise.prototype;
    
    // This isn't a very good seeding function, but it works ok. It supports 2^16
    // different seed values. Write something better if you need more seeds.
    NoiseProto.SetSeed = function(seed) 
    {
        if(seed > 0 && seed < 1) 
        {
            // Scale the seed out
            seed *= 65536;
        }
        
        seed = Math.floor(seed);
        if(seed < 256) 
        {
            seed |= seed << 8;
        }
        
        var v;
        for(var i = 0; i < 256; i++) 
        {
            if (i & 1) 
            {
                v = p[i] ^ (seed & 255);
            } 
            else 
            {
                v = p[i] ^ ((seed>>8) & 255);
            }
            
            this.perm[i] = v;
        }
    };
    
    NoiseProto.hash = function(i) 
    {
        return this.perm[i & 255];
    };   

    var gradP = function(hash, x) 
    {
        var h = hash & 0x0F;        // Convert low 4 bits of hash code
        var grad = 1 + (h & 7);    // Gradient value 1.0, 2.0, ..., 8.0
        if ((h & 8) !== 0) grad = -grad; // Set a random sign for the gradient
        //  float grad = gradients1D[h];    // NOTE : Test of Gradient look-up table instead of the above
        return (grad * x);              // Multiply the gradient with the distance
    };    
        
    NoiseProto.Simplex1 = function(x) 
    {
        var n0, n1;   // Noise contributions from the two "corners"
    
        // No need to skew the input space in 1D
    
        // Corners coordinates (nearest integer values):
        var i0 = Math.floor(x);
        var i1 = i0 + 1.0;
        // Distances to corners (between 0 and 1):
        var x0 = x - i0;
        var x1 = x0 - 1.0;

        // Calculate the contribution from the first corner
        var t0 = 1.0 - x0*x0;
        //  if(t0 < 0.0f) t0 = 0.0f; // not possible
        t0 *= t0;
        n0 = t0 * t0 * gradP(this.hash(i0), x0);  // TODO
    
        // Calculate the contribution from the second corner
        var t1 = 1.0 - x1*x1;
        //  if(t1 < 0.0f) t1 = 0.0f; // not possible
        t1 *= t1;
        n1 = t1 * t1 * gradP(this.hash(i1), x1); // TODO
    
        // The maximum value of this noise is 8*(3/4)^4 = 2.53125
        // A factor of 0.395 scales to fit exactly within [-1,1]
        // 0.9395123193338055 ~ -0.99984375
        return 0.395 * (n0 + n1);
    };	
}());