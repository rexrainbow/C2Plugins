"use strict";

(function ()
{
	var workersSupported = (typeof Worker !== "undefined");
	var isInWebWorker = (typeof document === "undefined");		// no DOM in a worker

// called from plugin
    if (!isInWebWorker)
    {
        var DungeonGen = function()
        {
            this.worker = null;
            this.is_processing = false;
        };
        var DungeonGenProto = DungeonGen.prototype;
        
        DungeonGenProto.Start = function (type, w, h, seed, options, callback)
	    {        	       
            if (workersSupported)
            {
                this.worker = new Worker("dungeongen.js");                
                var self = this;
                var on_complete = function (e)
                {
                    self.is_processing = false;
                    callback(e.data);	            
                };
                var on_error = function (e)
                {
                    console.error(e);
                };
                this.worker.addEventListener("message", on_complete, false);
                this.worker.addEventListener("error", on_complete, false);
                
                this.is_processing = true;
                var args = ["start", type, w, h, seed, options];
                this.worker.postMessage(args);  
            }
            else
            {
                var map = get_map(type, w, h, seed, options);
                callback([map]);
            }
	    };
	    
	    DungeonGenProto.Stop = function ()
	    {
            if (workersSupported)
            {
                if (this.worker)
                {
                    this.is_processing = false;
                    this.worker.terminate();
                }
            }
	    };
	    	    	        	    
	    DungeonGenProto.IsProcessing = function ()
	    {
            return this.is_processing;
	    };

        window["DungeonGen"] = DungeonGen;
    }
// called from plugin    
    	
// webworker    
    if (isInWebWorker)
    {
        var start = function (type, w, h, seed, options)
        {
            var map = get_map(type, w, h, seed, options);
            self.postMessage([map]); 
        };

        var stop = function ()
        {
            self.close();
        };

        var cmdMap = {
            "start": start,
            "stop": stop,
        };

        var runCommand = function (e)
        {
            var cmd = e.data;
	        var cmdFunction = cmdMap[cmd[0]];
	        if (cmdFunction == null)
	            return;
	
	        cmd.shift();
	        cmdFunction.apply(null, cmd);	
        };
        
        self.addEventListener("message", runCommand, false);
    }
// webworker     
	
// ROT body	
	if (!workersSupported || isInWebWorker)
	{
        var get_map = function (type, w, h, seed, options)
        {
            ROT.RNG.setSeed(seed);
            // type = Digger|Uniform|Rogue
            var dungeon = new ROT.Map[type](w, h, options);                       
            var errorMessage = "";
            try
            {
                dungeon.create(); 
            }
            catch(e)
            {
                errorMessage = e.message;
            }          
            
            //dungeon.create(); 
            debugger
            var map = dungeon.getMap();            
            var rooms = dungeon.getRooms();            
            var i, cnt=rooms.length, roomsBox=[];
            for (i=0; i<cnt; i++)
            {
                if ((type === "Digger") || (type === "Uniform"))
                    roomsBox.push(rooms[i].getBox());
                else if (type === "Rogue")
                {
                    var room = rooms[i];
                    var x1 = room["x"]; 
                    var y1 = room["y"];
                    var x2 = x1 + room["width"] -1;
                    var y2 = y1 + room["height"] - 1;
                    roomsBox.push([x1, y1, x2, y2]);
                }
            }
            return [map, roomsBox, errorMessage];
        };
        	    
        var ROT = {
	        DIRS: {
	        	"4": [
	        		[ 0, -1],
	        		[ 1,  0],
	        		[ 0,  1],
	        		[-1,  0]
	        	],
	        	"8": [
	        		[ 0, -1],
	        		[ 1, -1],
	        		[ 1,  0],
	        		[ 1,  1],
	        		[ 0,  1],
	        		[-1,  1],
	        		[-1,  0],
	        		[-1, -1]
	        	],
	        }            
        };
        
        /**
         * Sets prototype of this function to an instance of parent function
         * @param {function} parent
         */
        Function.prototype.extend = Function.prototype.extend || function(parent) {
        	this.prototype = Object.create(parent.prototype);
        	this.prototype.constructor = this;
        	return this;
        }
        
        /**
         * @returns {any} Randomly picked item, null when length=0
         */
        Array.prototype.random = Array.prototype.random || function() {
        	if (!this.length) { return null; }
        	return this[Math.floor(ROT.RNG.getUniform() * this.length)];
        }
        
        /**
         * @returns {array} New array with randomized items
         * FIXME destroys this!
         */
        Array.prototype.randomize = Array.prototype.randomize || function() {
        	var result = [];
        	while (this.length) {
        		var index = this.indexOf(this.random());
        		result.push(this.splice(index, 1)[0]);
        	}
        	return result;
        }        
        
        //rng.js
        /**
         * @namespace
         * This code is an implementation of Alea algorithm; (C) 2010 Johannes Baagoe.
         * Alea is licensed according to the http://en.wikipedia.org/wiki/MIT_License.
         */
        ROT.RNG = {
        	/**
        	 * @returns {number} 
        	 */
        	getSeed: function() {
        		return this._seed;
        	},
        
        	/**
        	 * @param {number} seed Seed the number generator
        	 */
        	setSeed: function(seed) {
        		seed = (seed < 1 ? 1/seed : seed);
        
        		this._seed = seed;
        		this._s0 = (seed >>> 0) * this._frac;
        
        		seed = (seed*69069 + 1) >>> 0;
        		this._s1 = seed * this._frac;
        
        		seed = (seed*69069 + 1) >>> 0;
        		this._s2 = seed * this._frac;
        
        		this._c = 1;
        		return this;
        	},
        
        	/**
        	 * @returns {float} Pseudorandom value [0,1), uniformly distributed
        	 */
        	getUniform: function() {
        		var t = 2091639 * this._s0 + this._c * this._frac;
        		this._s0 = this._s1;
        		this._s1 = this._s2;
        		this._c = t | 0;
        		this._s2 = t - this._c;
        		return this._s2;
        	},
        
        	/**
        	 * @param {int} lowerBound The lower end of the range to return a value from, inclusive
        	 * @param {int} upperBound The upper end of the range to return a value from, inclusive
        	 * @returns {int} Pseudorandom value [lowerBound, upperBound], using ROT.RNG.getUniform() to distribute the value
        	 */
        	getUniformInt: function(lowerBound, upperBound) {
        		var max = Math.max(lowerBound, upperBound);
        		var min = Math.min(lowerBound, upperBound);
        		return Math.floor(this.getUniform() * (max - min + 1)) + min;
        	},
        
        	/**
        	 * @param {float} [mean=0] Mean value
        	 * @param {float} [stddev=1] Standard deviation. ~95% of the absolute values will be lower than 2*stddev.
        	 * @returns {float} A normally distributed pseudorandom value
        	 */
        	getNormal: function(mean, stddev) {
        		do {
        			var u = 2*this.getUniform()-1;
        			var v = 2*this.getUniform()-1;
        			var r = u*u + v*v;
        		} while (r > 1 || r == 0);
        
        		var gauss = u * Math.sqrt(-2*Math.log(r)/r);
        		return (mean || 0) + gauss*(stddev || 1);
        	},
        
        	/**
        	 * @returns {int} Pseudorandom value [1,100] inclusive, uniformly distributed
        	 */
        	getPercentage: function() {
        		return 1 + Math.floor(this.getUniform()*100);
        	},
        	
        	/**
        	 * @param {object} data key=whatever, value=weight (relative probability)
        	 * @returns {string} whatever
        	 */
        	getWeightedValue: function(data) {
        		var total = 0;
        		
        		for (var id in data) {
        			total += data[id];
        		}
        		var random = this.getUniform()*total;
        		
        		var part = 0;
        		for (var id in data) {
        			part += data[id];
        			if (random < part) { return id; }
        		}
        
        		// If by some floating-point annoyance we have
        		// random >= total, just return the last id.
        		return id;
        	},
        
        	/**
        	 * Get RNG state. Useful for storing the state and re-setting it via setState.
        	 * @returns {?} Internal state
        	 */
        	getState: function() {
        		return [this._s0, this._s1, this._s2, this._c];
        	},
        
        	/**
        	 * Set a previously retrieved state.
        	 * @param {?} state
        	 */
        	setState: function(state) {
        		this._s0 = state[0];
        		this._s1 = state[1];
        		this._s2 = state[2];
        		this._c  = state[3];
        		return this;
        	},
        
        	/**
        	 * Returns a cloned RNG
        	 */
        	clone: function() {
        		var clone = Object.create(this);
        		clone.setState(this.getState());
        		return clone;
        	},
        
        	_s0: 0,
        	_s1: 0,
        	_s2: 0,
        	_c: 0,
        	_frac: 2.3283064365386963e-10 /* 2^-32 */
        }
        
        ROT.RNG.setSeed(Date.now());
        
        
        // map.js
        /**
         * @class Base map generator
         * @param {int} [width=ROT.DEFAULT_WIDTH]
         * @param {int} [height=ROT.DEFAULT_HEIGHT]
         */
        ROT.Map = function(width, height) {
        	this._width = width || ROT.DEFAULT_WIDTH;
        	this._height = height || ROT.DEFAULT_HEIGHT;
            this._map = null;
        };
        
        ROT.Map.prototype.create = function(callback) {}
        
        ROT.Map.prototype._fillMap = function(value) {
        	var map = [];
        	for (var i=0;i<this._width;i++) {
        		map.push([]);
        		for (var j=0;j<this._height;j++) { map[i].push(value); }
        	}
        	return map;
        };
        
        ROT.Map.prototype.getMap = function(value) {
        	return this._map;
        }
        
        
        // features.js     
        /**
         * @class Dungeon feature; has own .create() method
         */
        ROT.Map.Feature = function() {}
        ROT.Map.Feature.prototype.isValid = function(canBeDugCallback) {}
        ROT.Map.Feature.prototype.create = function(digCallback) {}
        ROT.Map.Feature.prototype.debug = function() {}
        ROT.Map.Feature.createRandomAt = function(x, y, dx, dy, options) {}
        
        /**
         * @class Room
         * @augments ROT.Map.Feature
         * @param {int} x1
         * @param {int} y1
         * @param {int} x2
         * @param {int} y2
         * @param {int} [doorX]
         * @param {int} [doorY]
         */
        ROT.Map.Feature.Room = function(x1, y1, x2, y2, doorX, doorY) {
        	this._x1 = x1;
        	this._y1 = y1;
        	this._x2 = x2;
        	this._y2 = y2;
        	this._doors = {};
        	if (arguments.length > 4) { this.addDoor(doorX, doorY); }
        }
        ROT.Map.Feature.Room.extend(ROT.Map.Feature);
        
        /**
         * Room of random size, with a given doors and direction
         */
        ROT.Map.Feature.Room.createRandomAt = function(x, y, dx, dy, options) {
        	var min = options.roomWidth[0];
        	var max = options.roomWidth[1];
        	var width = ROT.RNG.getUniformInt(min, max);
        	
        	var min = options.roomHeight[0];
        	var max = options.roomHeight[1];
        	var height = ROT.RNG.getUniformInt(min, max);
        	
        	if (dx == 1) { /* to the right */
        		var y2 = y - Math.floor(ROT.RNG.getUniform() * height);
        		return new this(x+1, y2, x+width, y2+height-1, x, y);
        	}
        	
        	if (dx == -1) { /* to the left */
        		var y2 = y - Math.floor(ROT.RNG.getUniform() * height);
        		return new this(x-width, y2, x-1, y2+height-1, x, y);
        	}
        
        	if (dy == 1) { /* to the bottom */
        		var x2 = x - Math.floor(ROT.RNG.getUniform() * width);
        		return new this(x2, y+1, x2+width-1, y+height, x, y);
        	}
        
        	if (dy == -1) { /* to the top */
        		var x2 = x - Math.floor(ROT.RNG.getUniform() * width);
        		return new this(x2, y-height, x2+width-1, y-1, x, y);
        	}
        
                throw new Error("dx or dy must be 1 or -1");
        }
        
        /**
         * Room of random size, positioned around center coords
         */
        ROT.Map.Feature.Room.createRandomCenter = function(cx, cy, options) {
        	var min = options.roomWidth[0];
        	var max = options.roomWidth[1];
        	var width = ROT.RNG.getUniformInt(min, max);
        	
        	var min = options.roomHeight[0];
        	var max = options.roomHeight[1];
        	var height = ROT.RNG.getUniformInt(min, max);
        
        	var x1 = cx - Math.floor(ROT.RNG.getUniform()*width);
        	var y1 = cy - Math.floor(ROT.RNG.getUniform()*height);
        	var x2 = x1 + width - 1;
        	var y2 = y1 + height - 1;
        
        	return new this(x1, y1, x2, y2);
        }
        
        /**
         * Room of random size within a given dimensions
         */
        ROT.Map.Feature.Room.createRandom = function(availWidth, availHeight, options) {
        	var min = options.roomWidth[0];
        	var max = options.roomWidth[1];
        	var width = ROT.RNG.getUniformInt(min, max);
        	
        	var min = options.roomHeight[0];
        	var max = options.roomHeight[1];
        	var height = ROT.RNG.getUniformInt(min, max);
        	
        	var left = availWidth - width - 1;
        	var top = availHeight - height - 1;
        
        	var x1 = 1 + Math.floor(ROT.RNG.getUniform()*left);
        	var y1 = 1 + Math.floor(ROT.RNG.getUniform()*top);
        	var x2 = x1 + width - 1;
        	var y2 = y1 + height - 1;
        
        	return new this(x1, y1, x2, y2);
        }
        
        ROT.Map.Feature.Room.prototype.addDoor = function(x, y) {
        	this._doors[x+","+y] = 1;
        	return this;
        }
        
        /**
         * @param {function}
         */
        ROT.Map.Feature.Room.prototype.getDoors = function(callback) {
        	for (var key in this._doors) {
        		var parts = key.split(",");
        		callback(parseInt(parts[0]), parseInt(parts[1]));
        	}
        	return this;
        }
        
        ROT.Map.Feature.Room.prototype.clearDoors = function() {
        	this._doors = {};
        	return this;
        }
        
        ROT.Map.Feature.Room.prototype.addDoors = function(isWallCallback) {
        	var left = this._x1-1;
        	var right = this._x2+1;
        	var top = this._y1-1;
        	var bottom = this._y2+1;
        
        	for (var x=left; x<=right; x++) {
        		for (var y=top; y<=bottom; y++) {
        			if (x != left && x != right && y != top && y != bottom) { continue; }
        			if (isWallCallback(x, y)) { continue; }
        
        			this.addDoor(x, y);
        		}
        	}
        
        	return this;
        }
        
        ROT.Map.Feature.Room.prototype.debug = function() {
        	console.log("room", this._x1, this._y1, this._x2, this._y2);
        }
        
        ROT.Map.Feature.Room.prototype.isValid = function(isWallCallback, canBeDugCallback) { 
        	var left = this._x1-1;
        	var right = this._x2+1;
        	var top = this._y1-1;
        	var bottom = this._y2+1;
        	
        	for (var x=left; x<=right; x++) {
        		for (var y=top; y<=bottom; y++) {
        			if (x == left || x == right || y == top || y == bottom) {
        				if (!isWallCallback(x, y)) { return false; }
        			} else {
        				if (!canBeDugCallback(x, y)) { return false; }
        			}
        		}
        	}
        
        	return true;
        }
        
        /**
         * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty, 1 = wall, 2 = door. Multiple doors are allowed.
         */
        ROT.Map.Feature.Room.prototype.create = function(digCallback) { 
        	var left = this._x1-1;
        	var right = this._x2+1;
        	var top = this._y1-1;
        	var bottom = this._y2+1;

        	var value = 0;
        	for (var x=left; x<=right; x++) {
        		for (var y=top; y<=bottom; y++) {
        			if (x+","+y in this._doors) {
        				value = 2;
        			} else if (x == left || x == right || y == top || y == bottom) {
        				value = 1;
        			} else {
        				value = 0;
        			}
        			digCallback(x, y, value);
        		}
        	}
            
            return true;
        }
        
        ROT.Map.Feature.Room.prototype.getCenter = function() {
        	return [Math.round((this._x1 + this._x2)/2), Math.round((this._y1 + this._y2)/2)];
        }
        
        ROT.Map.Feature.Room.prototype.getLeft = function() {
        	return this._x1;
        }
        
        ROT.Map.Feature.Room.prototype.getRight = function() {
        	return this._x2;
        }
        
        ROT.Map.Feature.Room.prototype.getTop = function() {
        	return this._y1;
        }
        
        ROT.Map.Feature.Room.prototype.getBottom = function() {
        	return this._y2;
        }
        
        ROT.Map.Feature.Room.prototype.getBox = function() {      
        	return [ this._x1, this._y1, this._x2, this._y2 ];
        }        
        
        
        /**
         * @class Corridor
         * @augments ROT.Map.Feature
         * @param {int} startX
         * @param {int} startY
         * @param {int} endX
         * @param {int} endY
         */
        ROT.Map.Feature.Corridor = function(startX, startY, endX, endY) {
        	this._startX = startX;
        	this._startY = startY;
        	this._endX = endX; 
        	this._endY = endY;
        	this._endsWithAWall = true;
        }
        ROT.Map.Feature.Corridor.extend(ROT.Map.Feature);
        
        ROT.Map.Feature.Corridor.createRandomAt = function(x, y, dx, dy, options) {
        	var min = options.corridorLength[0];
        	var max = options.corridorLength[1];
        	var length = ROT.RNG.getUniformInt(min, max);
        	
        	return new this(x, y, x + dx*length, y + dy*length);
        }
        
        ROT.Map.Feature.Corridor.prototype.debug = function() {
        	console.log("corridor", this._startX, this._startY, this._endX, this._endY);
        }
        
        ROT.Map.Feature.Corridor.prototype.isValid = function(isWallCallback, canBeDugCallback){ 
        	var sx = this._startX;
        	var sy = this._startY;
        	var dx = this._endX-sx;
        	var dy = this._endY-sy;
        	var length = 1 + Math.max(Math.abs(dx), Math.abs(dy));
        	
        	if (dx) { dx = dx/Math.abs(dx); }
        	if (dy) { dy = dy/Math.abs(dy); }
        	var nx = dy;
        	var ny = -dx;
        	
        	var ok = true;
        	for (var i=0; i<length; i++) {
        		var x = sx + i*dx;
        		var y = sy + i*dy;
        
        		if (!canBeDugCallback(     x,      y)) { ok = false; }
        		if (!isWallCallback  (x + nx, y + ny)) { ok = false; }
        		if (!isWallCallback  (x - nx, y - ny)) { ok = false; }
        		
        		if (!ok) {
        			length = i;
        			this._endX = x-dx;
        			this._endY = y-dy;
        			break;
        		}
        	}
        	
        	/**
        	 * If the length degenerated, this corridor might be invalid
        	 */
        	 
        	/* not supported */
        	if (length == 0) { return false; } 
        	
        	 /* length 1 allowed only if the next space is empty */
        	if (length == 1 && isWallCallback(this._endX + dx, this._endY + dy)) { return false; }
        	
        	/**
        	 * We do not want the corridor to crash into a corner of a room;
        	 * if any of the ending corners is empty, the N+1th cell of this corridor must be empty too.
        	 * 
        	 * Situation:
        	 * #######1
        	 * .......?
        	 * #######2
        	 * 
        	 * The corridor was dug from left to right.
        	 * 1, 2 - problematic corners, ? = N+1th cell (not dug)
        	 */
        	var firstCornerBad = !isWallCallback(this._endX + dx + nx, this._endY + dy + ny);
        	var secondCornerBad = !isWallCallback(this._endX + dx - nx, this._endY + dy - ny);
        	this._endsWithAWall = isWallCallback(this._endX + dx, this._endY + dy);
        	if ((firstCornerBad || secondCornerBad) && this._endsWithAWall) { return false; }
        
        	return true;
        }
        
        /**
         * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty.
         */
        ROT.Map.Feature.Corridor.prototype.create = function(digCallback) { 
        	var sx = this._startX;
        	var sy = this._startY;
        	var dx = this._endX-sx;
        	var dy = this._endY-sy;
        	var length = 1+Math.max(Math.abs(dx), Math.abs(dy));
        	
        	if (dx) { dx = dx/Math.abs(dx); }
        	if (dy) { dy = dy/Math.abs(dy); }
        	var nx = dy;
        	var ny = -dx;
        	
        	for (var i=0; i<length; i++) {
        		var x = sx + i*dx;
        		var y = sy + i*dy;
        		digCallback(x, y, 0);
        	}
        	
        	return true;
        }
        
        ROT.Map.Feature.Corridor.prototype.createPriorityWalls = function(priorityWallCallback) {
        	if (!this._endsWithAWall) { return; }
        
        	var sx = this._startX;
        	var sy = this._startY;
        
        	var dx = this._endX-sx;
        	var dy = this._endY-sy;
        	if (dx) { dx = dx/Math.abs(dx); }
        	if (dy) { dy = dy/Math.abs(dy); }
        	var nx = dy;
        	var ny = -dx;
        
        	priorityWallCallback(this._endX + dx, this._endY + dy);
        	priorityWallCallback(this._endX + nx, this._endY + ny);
        	priorityWallCallback(this._endX - nx, this._endY - ny);
        }        
        
        // dungeon.js
        /**
         * @class Dungeon map: has rooms and corridors
         * @augments ROT.Map
         */
        ROT.Map.Dungeon = function(width, height) {
        	ROT.Map.call(this, width, height);
        	this._rooms = []; /* list of all rooms */
        	this._corridors = [];
        }
        ROT.Map.Dungeon.extend(ROT.Map);
        
        /**
         * Get all generated rooms
         * @returns {ROT.Map.Feature.Room[]}
         */
        ROT.Map.Dungeon.prototype.getRooms = function() {
        	return this._rooms;
        }
        
        /**
         * Get all generated corridors
         * @returns {ROT.Map.Feature.Corridor[]}
         */
        ROT.Map.Dungeon.prototype.getCorridors = function() {
        	return this._corridors;
        }
        
        
        // digger.js
        /**
         * @class Random dungeon generator using human-like digging patterns.
         * Heavily based on Mike Anderson's ideas from the "Tyrant" algo, mentioned at 
         * http://www.roguebasin.roguelikedevelopment.org/index.php?title=Dungeon-Building_Algorithm.
         * @augments ROT.Map.Dungeon
         */
        ROT.Map.Digger = function(width, height, options) {
        	ROT.Map.Dungeon.call(this, width, height);
        	
        	this._options = {
        		roomWidth: [3, 9], /* room minimum and maximum width */
        		roomHeight: [3, 5], /* room minimum and maximum height */
        		corridorLength: [3, 10], /* corridor minimum and maximum length */
        		dugPercentage: 0.2, /* we stop after this percentage of level area has been dug out */
        		timeLimit: 1000 /* we stop after this much time has passed (msec) */
        	}
        	for (var p in options) { this._options[p] = options[p]; }
        	
        	this._features = {
        		"Room": 4,
        		"Corridor": 4
        	}
        	this._featureAttempts = 20; /* how many times do we try to create a feature on a suitable wall */
        	this._walls = {}; /* these are available for digging */
        	
        	this._digCallback = this._digCallback.bind(this);
        	this._canBeDugCallback = this._canBeDugCallback.bind(this);
        	this._isWallCallback = this._isWallCallback.bind(this);
        	this._priorityWallCallback = this._priorityWallCallback.bind(this);
        }
        ROT.Map.Digger.extend(ROT.Map.Dungeon);
        
        /**
         * Create a map
         * @see ROT.Map#create
         */
        ROT.Map.Digger.prototype.create = function(callback) {
        	this._rooms = [];
        	this._corridors = [];
        	this._map = this._fillMap(1);
        	this._walls = {};
        	this._dug = 0;
        	var area = (this._width-2) * (this._height-2);
        
        	this._firstRoom();
        	
        	var t1 = Date.now();
        
        	do {
        		var t2 = Date.now();
        		if (t2 - t1 > this._options.timeLimit) { break; }
        
        		/* find a good wall */
        		var wall = this._findWall();
        		if (!wall) { break; } /* no more walls */
        		
        		var parts = wall.split(",");
        		var x = parseInt(parts[0]);
        		var y = parseInt(parts[1]);
        		var dir = this._getDiggingDirection(x, y);
        		if (!dir) { continue; } /* this wall is not suitable */
        		
        //		console.log("wall", x, y);
        
        		/* try adding a feature */
        		var featureAttempts = 0;
        		do {
        			featureAttempts++;
        			if (this._tryFeature(x, y, dir[0], dir[1])) { /* feature added */
        				//if (this._rooms.length + this._corridors.length == 2) { this._rooms[0].addDoor(x, y); } /* first room oficially has doors */
        				this._removeSurroundingWalls(x, y);
        				this._removeSurroundingWalls(x-dir[0], y-dir[1]);
        				break; 
        			}
        		} while (featureAttempts < this._featureAttempts);
        		
        		var priorityWalls = 0;
        		for (var id in this._walls) { 
        			if (this._walls[id] > 1) { priorityWalls++; }
        		}
        
        	} while (this._dug/area < this._options.dugPercentage || priorityWalls); /* fixme number of priority walls */
        
        	this._addDoors();
        
        	// edit by rex.rainbow	        
        	//if (callback) {
        	//	for (var i=0;i<this._width;i++) {
        	//		for (var j=0;j<this._height;j++) {
        	//			callback(i, j, this._map[i][j]);
        	//		}
        	//	}
        	//}
        	// edit by rex.rainbow	            
            
        	this._walls = {};
        	//this._map = null;
        
        	return this;
        }
        
        ROT.Map.Digger.prototype._digCallback = function(x, y, value) {
            // 0 = empty, 1 = wall, 2 = door
            if (value === 2)
                value = 0;
            
            this._map[x][y] = value;
        	if (value === 0) { /* empty or door*/
        		this._dug++;
        	} else { /* wall */
        		this._walls[x+","+y] = 1;
        	}
        }
        
        ROT.Map.Digger.prototype._isWallCallback = function(x, y) {
        	if (x < 0 || y < 0 || x >= this._width || y >= this._height) { return false; }
        	return (this._map[x][y] == 1);
        }
        
        ROT.Map.Digger.prototype._canBeDugCallback = function(x, y) {
        	if (x < 1 || y < 1 || x+1 >= this._width || y+1 >= this._height) { return false; }
        	return (this._map[x][y] == 1);
        }
        
        ROT.Map.Digger.prototype._priorityWallCallback = function(x, y) {
        	this._walls[x+","+y] = 2;
        }
        
        ROT.Map.Digger.prototype._firstRoom = function() {
        	var cx = Math.floor(this._width/2);
        	var cy = Math.floor(this._height/2);
        	var room = ROT.Map.Feature.Room.createRandomCenter(cx, cy, this._options);
        	this._rooms.push(room);
        	room.create(this._digCallback);
        }
        
        /**
         * Get a suitable wall
         */
        ROT.Map.Digger.prototype._findWall = function() {
        	var prio1 = [];
        	var prio2 = [];
        	for (var id in this._walls) {
        		var prio = this._walls[id];
        		if (prio == 2) { 
        			prio2.push(id); 
        		} else {
        			prio1.push(id);
        		}
        	}
        	
        	var arr = (prio2.length ? prio2 : prio1);
        	if (!arr.length) { return null; } /* no walls :/ */
        	
        	var id = arr.random();
        	delete this._walls[id];
        
        	return id;
        }
        
        /**
         * Tries adding a feature
         * @returns {bool} was this a successful try?
         */
        ROT.Map.Digger.prototype._tryFeature = function(x, y, dx, dy) {
        	var feature = ROT.RNG.getWeightedValue(this._features);
        	feature = ROT.Map.Feature[feature].createRandomAt(x, y, dx, dy, this._options);
        	
        	if (!feature.isValid(this._isWallCallback, this._canBeDugCallback)) {
        //		console.log("not valid");
        //		feature.debug();
        		return false;
        	}
        	
        	feature.create(this._digCallback);
        //	feature.debug();
        
        	if (feature instanceof ROT.Map.Feature.Room) { this._rooms.push(feature); }
        	if (feature instanceof ROT.Map.Feature.Corridor) { 
        		feature.createPriorityWalls(this._priorityWallCallback);
        		this._corridors.push(feature); 
        	}
        	
        	return true;
        }
        
        ROT.Map.Digger.prototype._removeSurroundingWalls = function(cx, cy) {
        	var deltas = ROT.DIRS[4];
        
        	for (var i=0;i<deltas.length;i++) {
        		var delta = deltas[i];
        		var x = cx + delta[0];
        		var y = cy + delta[1];
        		delete this._walls[x+","+y];
        		var x = cx + 2*delta[0];
        		var y = cy + 2*delta[1];
        		delete this._walls[x+","+y];
        	}
        }
        
        /**
         * Returns vector in "digging" direction, or false, if this does not exist (or is not unique)
         */
        ROT.Map.Digger.prototype._getDiggingDirection = function(cx, cy) {
        	if (cx <= 0 || cy <= 0 || cx >= this._width - 1 || cy >= this._height - 1) { return null; }
        
        	var result = null;
        	var deltas = ROT.DIRS[4];
        	
        	for (var i=0;i<deltas.length;i++) {
        		var delta = deltas[i];
        		var x = cx + delta[0];
        		var y = cy + delta[1];
        		
        		if (!this._map[x][y]) { /* there already is another empty neighbor! */
        			if (result) { return null; }
        			result = delta;
        		}
        	}
        	
        	/* no empty neighbor */
        	if (!result) { return null; }
        	
        	return [-result[0], -result[1]];
        }
        
        /**
         * Find empty spaces surrounding rooms, and apply doors.
         */
        ROT.Map.Digger.prototype._addDoors = function() {
        	var data = this._map;
        	var isWallCallback = function(x, y) {
        		return (data[x][y] == 1);
        	}
        	for (var i = 0; i < this._rooms.length; i++ ) {
        		var room = this._rooms[i];
        		room.clearDoors();
        		room.addDoors(isWallCallback);
        	}
        }


        // uniform.js
        /**
         * @class Dungeon generator which tries to fill the space evenly. Generates independent rooms and tries to connect them.
         * @augments ROT.Map.Dungeon
         */
        ROT.Map.Uniform = function(width, height, options) {
        	ROT.Map.Dungeon.call(this, width, height);
        
        	this._options = {
        		roomWidth: [3, 9], /* room minimum and maximum width */
        		roomHeight: [3, 5], /* room minimum and maximum height */
        		roomDugPercentage: 0.1, /* we stop after this percentage of level area has been dug out by rooms */
        		timeLimit: 1000 /* we stop after this much time has passed (msec) */
        	}
        	for (var p in options) { this._options[p] = options[p]; }
        
        	this._roomAttempts = 20; /* new room is created N-times until is considered as impossible to generate */
        	this._corridorAttempts = 20; /* corridors are tried N-times until the level is considered as impossible to connect */
        
        	this._connected = []; /* list of already connected rooms */
        	this._unconnected = []; /* list of remaining unconnected rooms */
        	
        	this._digCallback = this._digCallback.bind(this);
        	this._canBeDugCallback = this._canBeDugCallback.bind(this);
        	this._isWallCallback = this._isWallCallback.bind(this);
        }
        ROT.Map.Uniform.extend(ROT.Map.Dungeon);
        
        /**
         * Create a map. If the time limit has been hit, returns null.
         * @see ROT.Map#create
         */
        ROT.Map.Uniform.prototype.create = function(callback) {
        	var t1 = Date.now();
        	while (1) {
        		var t2 = Date.now();
        		if (t2 - t1 > this._options.timeLimit) { return null; } /* time limit! */
        	
        		this._map = this._fillMap(1);
        		this._dug = 0;
        		this._rooms = [];
        		this._unconnected = [];
        		this._generateRooms();
        		if (this._rooms.length < 2) { continue; }
        		if (this._generateCorridors()) { break; }
        	}
        	
            // edit by rex.rainbow	
        	//if (callback) {
        	//	for (var i=0;i<this._width;i++) {
        	//		for (var j=0;j<this._height;j++) {
        	//			callback(i, j, this._map[i][j]);
        	//		}
        	//	}
        	//}
            // edit by rex.rainbow	
        	
        	return this;
        }
        
        /**
         * Generates a suitable amount of rooms
         */
        ROT.Map.Uniform.prototype._generateRooms = function() {
        	var w = this._width-2;
        	var h = this._height-2;
        
        	do {
        		var room = this._generateRoom();
        		if (this._dug/(w*h) > this._options.roomDugPercentage) { break; } /* achieved requested amount of free space */
        	} while (room);
        
        	/* either enough rooms, or not able to generate more of them :) */
        }
        
        /**
         * Try to generate one room
         */
        ROT.Map.Uniform.prototype._generateRoom = function() {
        	var count = 0;
        	while (count < this._roomAttempts) {
        		count++;
        		
        		var room = ROT.Map.Feature.Room.createRandom(this._width, this._height, this._options);
        		if (!room.isValid(this._isWallCallback, this._canBeDugCallback)) { continue; }
        		
        		room.create(this._digCallback);
        		this._rooms.push(room);
        		return room;
        	} 
        
        	/* no room was generated in a given number of attempts */
        	return null;
        }
        
        /**
         * Generates connectors beween rooms
         * @returns {bool} success Was this attempt successfull?
         */
        ROT.Map.Uniform.prototype._generateCorridors = function() {
        	var cnt = 0;
        	while (cnt < this._corridorAttempts) {
        		cnt++;
        		this._corridors = [];
        
        		/* dig rooms into a clear map */
        		this._map = this._fillMap(1);
        		for (var i=0;i<this._rooms.length;i++) { 
        			var room = this._rooms[i];
        			room.clearDoors();
        			room.create(this._digCallback); 
        		}
        
        		this._unconnected = this._rooms.slice().randomize();
        		this._connected = [];
        		if (this._unconnected.length) { this._connected.push(this._unconnected.pop()); } /* first one is always connected */
        		
        		while (1) {
        			/* 1. pick random connected room */
        			var connected = this._connected.random();
        			
        			/* 2. find closest unconnected */
        			var room1 = this._closestRoom(this._unconnected, connected);
        			
        			/* 3. connect it to closest connected */
        			var room2 = this._closestRoom(this._connected, room1);
        			
        			var ok = this._connectRooms(room1, room2);
        			if (!ok) { break; } /* stop connecting, re-shuffle */
        			
        			if (!this._unconnected.length) { return true; } /* done; no rooms remain */
        		}
        	}
        	return false;
        }
        
        /**
         * For a given room, find the closest one from the list
         */
        ROT.Map.Uniform.prototype._closestRoom = function(rooms, room) {
        	var dist = Infinity;
        	var center = room.getCenter();
        	var result = null;
        	
        	for (var i=0;i<rooms.length;i++) {
        		var r = rooms[i];
        		var c = r.getCenter();
        		var dx = c[0]-center[0];
        		var dy = c[1]-center[1];
        		var d = dx*dx+dy*dy;
        		
        		if (d < dist) {
        			dist = d;
        			result = r;
        		}
        	}
        	
        	return result;
        }
        
        ROT.Map.Uniform.prototype._connectRooms = function(room1, room2) {
        	/*
        		room1.debug();
        		room2.debug();
        	*/
        
        	var center1 = room1.getCenter();
        	var center2 = room2.getCenter();
        
        	var diffX = center2[0] - center1[0];
        	var diffY = center2[1] - center1[1];
        
        	if (Math.abs(diffX) < Math.abs(diffY)) { /* first try connecting north-south walls */
        		var dirIndex1 = (diffY > 0 ? 2 : 0);
        		var dirIndex2 = (dirIndex1 + 2) % 4;
        		var min = room2.getLeft();
        		var max = room2.getRight();
        		var index = 0;
        	} else { /* first try connecting east-west walls */
        		var dirIndex1 = (diffX > 0 ? 1 : 3);
        		var dirIndex2 = (dirIndex1 + 2) % 4;
        		var min = room2.getTop();
        		var max = room2.getBottom();
        		var index = 1;
        	}
        
        	var start = this._placeInWall(room1, dirIndex1); /* corridor will start here */
        	if (!start) { return false; }
        
        	if (start[index] >= min && start[index] <= max) { /* possible to connect with straight line (I-like) */
        		var end = start.slice();
        		var value = null;
        		switch (dirIndex2) {
        			case 0: value = room2.getTop()-1; break;
        			case 1: value = room2.getRight()+1; break;
        			case 2: value = room2.getBottom()+1; break;
        			case 3: value = room2.getLeft()-1; break;
        		}
        		end[(index+1)%2] = value;
        		this._digLine([start, end]);
        		
        	} else if (start[index] < min-1 || start[index] > max+1) { /* need to switch target wall (L-like) */
        
        		var diff = start[index] - center2[index];
        		switch (dirIndex2) {
        			case 0:
        			case 1:	var rotation = (diff < 0 ? 3 : 1); break;
        			case 2:
        			case 3:	var rotation = (diff < 0 ? 1 : 3); break;
        		}
        		dirIndex2 = (dirIndex2 + rotation) % 4;
        		
        		var end = this._placeInWall(room2, dirIndex2);
        		if (!end) { return false; }
        
        		var mid = [0, 0];
        		mid[index] = start[index];
        		var index2 = (index+1)%2;
        		mid[index2] = end[index2];
        		this._digLine([start, mid, end]);
        		
        	} else { /* use current wall pair, but adjust the line in the middle (S-like) */
        	
        		var index2 = (index+1)%2;
        		var end = this._placeInWall(room2, dirIndex2);
        		if (!end) { return false; }
        		var mid = Math.round((end[index2] + start[index2])/2);
        
        		var mid1 = [0, 0];
        		var mid2 = [0, 0];
        		mid1[index] = start[index];
        		mid1[index2] = mid;
        		mid2[index] = end[index];
        		mid2[index2] = mid;
        		this._digLine([start, mid1, mid2, end]);
        	}
        
        	room1.addDoor(start[0], start[1]);
        	room2.addDoor(end[0], end[1]);
        	
        	var index = this._unconnected.indexOf(room1);
        	if (index != -1) {
        		this._unconnected.splice(index, 1);
        		this._connected.push(room1);
        	}
        
        	var index = this._unconnected.indexOf(room2);
        	if (index != -1) {
        		this._unconnected.splice(index, 1);
        		this._connected.push(room2);
        	}
        	
        	return true;
        }
        
        ROT.Map.Uniform.prototype._placeInWall = function(room, dirIndex) {
        	var start = [0, 0];
        	var dir = [0, 0];
        	var length = 0;
        	
        	switch (dirIndex) {
        		case 0:
        			dir = [1, 0];
        			start = [room.getLeft(), room.getTop()-1];
        			length = room.getRight()-room.getLeft()+1;
        		break;
        		case 1:
        			dir = [0, 1];
        			start = [room.getRight()+1, room.getTop()];
        			length = room.getBottom()-room.getTop()+1;
        		break;
        		case 2:
        			dir = [1, 0];
        			start = [room.getLeft(), room.getBottom()+1];
        			length = room.getRight()-room.getLeft()+1;
        		break;
        		case 3:
        			dir = [0, 1];
        			start = [room.getLeft()-1, room.getTop()];
        			length = room.getBottom()-room.getTop()+1;
        		break;
        	}
        	
        	var avail = [];
        	var lastBadIndex = -2;
        
        	for (var i=0;i<length;i++) {
        		var x = start[0] + i*dir[0];
        		var y = start[1] + i*dir[1];
        		avail.push(null);
        		
        		var isWall = (this._map[x][y] == 1);
        		if (isWall) {
        			if (lastBadIndex != i-1) { avail[i] = [x, y]; }
        		} else {
        			lastBadIndex = i;
        			if (i) { avail[i-1] = null; }
        		}
        	}
        	
        	for (var i=avail.length-1; i>=0; i--) {
        		if (!avail[i]) { avail.splice(i, 1); }
        	}
        	return (avail.length ? avail.random() : null);
        }
        
        /**
         * Dig a polyline.
         */
        ROT.Map.Uniform.prototype._digLine = function(points) {
        	for (var i=1;i<points.length;i++) {
        		var start = points[i-1];
        		var end = points[i];
        		var corridor = new ROT.Map.Feature.Corridor(start[0], start[1], end[0], end[1]);
        		corridor.create(this._digCallback);
        		this._corridors.push(corridor);
        	}
        }
        
        ROT.Map.Uniform.prototype._digCallback = function(x, y, value) {
            // 0 = empty, 1 = wall, 2 = door            
            this._map[x][y] = value;
        	if (value == 0) { this._dug++; }
            return true;
        }
        
        ROT.Map.Uniform.prototype._isWallCallback = function(x, y) {
        	if (x < 0 || y < 0 || x >= this._width || y >= this._height) { return false; }
        	return (this._map[x][y] == 1);
        }
        
        ROT.Map.Uniform.prototype._canBeDugCallback = function(x, y) {
        	if (x < 1 || y < 1 || x+1 >= this._width || y+1 >= this._height) { return false; }
        	return (this._map[x][y] == 1);
        }

        // rogue.js
        /**
         * @author hyakugei
         * @class Dungeon generator which uses the "orginal" Rogue dungeon generation algorithm. See http://kuoi.com/~kamikaze/GameDesign/art07_rogue_dungeon.php
         * @augments ROT.Map
         * @param {int} [width=ROT.DEFAULT_WIDTH]
         * @param {int} [height=ROT.DEFAULT_HEIGHT]
         * @param {object} [options] Options
         * @param {int[]} [options.cellWidth=3] Number of cells to create on the horizontal (number of rooms horizontally)
         * @param {int[]} [options.cellHeight=3] Number of cells to create on the vertical (number of rooms vertically) 
         * @param {int} [options.roomWidth] Room min and max width - normally set auto-magically via the constructor.
         * @param {int} [options.roomHeight] Room min and max height - normally set auto-magically via the constructor. 
         */
        ROT.Map.Rogue = function(width, height, options) {
        	ROT.Map.call(this, width, height);
        	
        	this._options = {
        		cellWidth: 3,  // NOTE to self, these could probably work the same as the roomWidth/room Height values
        		cellHeight: 3  //     ie. as an array with min-max values for each direction....
        	}
        	
        	for (var p in options) { this._options[p] = options[p]; }
        	
        	/*
        	Set the room sizes according to the over-all width of the map, 
        	and the cell sizes. 
        	*/
        	
        	if (!this._options.hasOwnProperty("roomWidth")) {
        		this._options["roomWidth"] = this._calculateRoomSize(this._width, this._options["cellWidth"]);
        	}
        	if (!this._options.hasOwnProperty("roomHeight")) {
        		this._options["roomHeight"] = this._calculateRoomSize(this._height, this._options["cellHeight"]);
        	}
        	
        }
        
        ROT.Map.Rogue.extend(ROT.Map.Dungeon); 
        
        /**
         * @see ROT.Map#create
         */
        ROT.Map.Rogue.prototype.create = function(callback) {
        	this._map = this._fillMap(1);
        	this._rooms = [];  // for export
            this.rooms = [];
        	this.connectedCells = [];
        	
        	this._initRooms();
        	this._connectRooms();
        	this._connectUnconnectedRooms();
        	this._createRandomRoomConnections();
        	this._createRooms();
        	this._createCorridors();
        	
            // edit by rex.rainbow	
        	//if (callback) {
        	//	for (var i = 0; i < this._width; i++) {
        	//		for (var j = 0; j < this._height; j++) {
        	//			callback(i, j, this._map[i][j]);   
        	//		}
        	//	}
        	//}
            // edit by rex.rainbow	            
        	
        	return this;
        }
        
        ROT.Map.Rogue.prototype._calculateRoomSize = function(size, cell) {
        	var max = Math.floor((size/cell) * 0.8);
        	var min = Math.floor((size/cell) * 0.25);
        	if (min < 2) min = 2;
        	if (max < 2) max = 2;
        	return [min, max];
        }
        
        ROT.Map.Rogue.prototype._initRooms = function () { 
        	// create rooms array. This is the "grid" list from the algo.  
            var room;
        	for (var i = 0; i < this._options.cellWidth; i++) {  
        		this.rooms.push([]);
        		for(var j = 0; j < this._options.cellHeight; j++) {
                    room = {"x":0, "y":0, "width":0, "height":0, "connections":[], "cellx":i, "celly":j};
        			this.rooms[i].push(room);
                    this._rooms.push(room);
        		}
        	}
        }
        
        ROT.Map.Rogue.prototype._connectRooms = function() {
        	//pick random starting grid
        	var cgx = ROT.RNG.getUniformInt(0, this._options.cellWidth-1);
        	var cgy = ROT.RNG.getUniformInt(0, this._options.cellHeight-1);
        	
        	var idx;
        	var ncgx;
        	var ncgy;
        	
        	var found = false;
        	var room;
        	var otherRoom;
        	
        	// find  unconnected neighbour cells
        	do {
        	
        		//var dirToCheck = [0,1,2,3,4,5,6,7];
        		var dirToCheck = [0,2,4,6];
        		dirToCheck = dirToCheck.randomize();
        		
        		do {
        			found = false;
        			idx = dirToCheck.pop();
        			
        			
        			ncgx = cgx + ROT.DIRS[8][idx][0];
        			ncgy = cgy + ROT.DIRS[8][idx][1];
        			
        			if(ncgx < 0 || ncgx >= this._options.cellWidth) continue;
        			if(ncgy < 0 || ncgy >= this._options.cellHeight) continue;
        			
        			room = this.rooms[cgx][cgy];
        			
        			if(room["connections"].length > 0)
        			{
        				// as long as this room doesn't already coonect to me, we are ok with it. 
        				if(room["connections"][0][0] == ncgx &&
        				room["connections"][0][1] == ncgy)
        				{
        					break;
        				}
        			}
        			
        			otherRoom = this.rooms[ncgx][ncgy];
        			
        			if (otherRoom["connections"].length == 0) { 
        				otherRoom["connections"].push([cgx,cgy]);
        				
        				this.connectedCells.push([ncgx, ncgy]);
        				cgx = ncgx;
        				cgy = ncgy;
        				found = true;
        			}
        					
        		} while (dirToCheck.length > 0 && found == false)
        		
        	} while (dirToCheck.length > 0)
        
        }
        
        ROT.Map.Rogue.prototype._connectUnconnectedRooms = function() {
        	//While there are unconnected rooms, try to connect them to a random connected neighbor 
        	//(if a room has no connected neighbors yet, just keep cycling, you'll fill out to it eventually).
        	var cw = this._options.cellWidth;
        	var ch = this._options.cellHeight;
        	
        	var randomConnectedCell;
        	this.connectedCells = this.connectedCells.randomize();
        	var room;
        	var otherRoom;
        	var validRoom;
        	
        	for (var i = 0; i < this._options.cellWidth; i++) {
        		for (var j = 0; j < this._options.cellHeight; j++)  {
        				
        			room = this.rooms[i][j];
        			
        			if (room["connections"].length == 0) {
        				var directions = [0,2,4,6];
        				directions = directions.randomize();
        				
        				var validRoom = false;
        				
        				do {
        					
        					var dirIdx = directions.pop();
        					var newI = i + ROT.DIRS[8][dirIdx][0];
        					var newJ = j + ROT.DIRS[8][dirIdx][1];
        					
        					if (newI < 0 || newI >= cw || 
        					newJ < 0 || newJ >= ch) {
        						continue;
        					}
        					
        					otherRoom = this.rooms[newI][newJ];
        					
        					validRoom = true;
        					
        					if (otherRoom["connections"].length == 0) {
        						break;
        					}
        					
        					for (var k = 0; k < otherRoom["connections"].length; k++) {
        						if(otherRoom["connections"][k][0] == i && 
        						otherRoom["connections"][k][1] == j) {
        							validRoom = false;
        							break;
        						}
        					}
        					
        					if (validRoom) break;
        					
        				} while (directions.length)
        				
        				if(validRoom) { 
        					room["connections"].push( [otherRoom["cellx"], otherRoom["celly"]] );  
        				} else {
        					console.log("-- Unable to connect room.");
        				}
        			}
        		}
        	}
        }
        
        ROT.Map.Rogue.prototype._createRandomRoomConnections = function(connections) {
        	// Empty for now. 
        }
        
        
        ROT.Map.Rogue.prototype._createRooms = function() {
        	// Create Rooms 
        	
        	var w = this._width;
        	var h = this._height;
        	
        	var cw = this._options.cellWidth;
        	var ch = this._options.cellHeight;
        	
        	var cwp = Math.floor(this._width / cw);
        	var chp = Math.floor(this._height / ch);
        	
        	var roomw;
        	var roomh;
        	var roomWidth = this._options["roomWidth"];
        	var roomHeight = this._options["roomHeight"];
        	var sx;
        	var sy;
        	var tx;
        	var ty;
        	var otherRoom;
        	
        	for (var i = 0; i < cw; i++) {
        		for (var j = 0; j < ch; j++) {
        			sx = cwp * i;
        			sy = chp * j;
        			
        			if (sx == 0) sx = 1;
        			if (sy == 0) sy = 1;
        			
        			roomw = ROT.RNG.getUniformInt(roomWidth[0], roomWidth[1]);
        			roomh = ROT.RNG.getUniformInt(roomHeight[0], roomHeight[1]);
        			
        			if (j > 0) {
        				otherRoom = this.rooms[i][j-1];
        				while (sy - (otherRoom["y"] + otherRoom["height"] ) < 3) {
        					sy++;
        				}
        			}
        			
        			if (i > 0) {
        				otherRoom = this.rooms[i-1][j];
        				while(sx - (otherRoom["x"] + otherRoom["width"]) < 3) {
        					sx++;
        				}
        			}
        			
        			var sxOffset = Math.round(ROT.RNG.getUniformInt(0, cwp-roomw)/2);
        			var syOffset = Math.round(ROT.RNG.getUniformInt(0, chp-roomh)/2);
        			
        			while (sx + sxOffset + roomw >= w) {
        				if(sxOffset) {
        					sxOffset--;
        				} else {
        					roomw--; 
        				}
        			}
        			
        			while (sy + syOffset + roomh >= h) { 
        				if(syOffset) {
        					syOffset--;
        				} else {
        					roomh--; 
        				}
        			}
        			
        			sx = sx + sxOffset;
        			sy = sy + syOffset;
        			
        			this.rooms[i][j]["x"] = sx;
        			this.rooms[i][j]["y"] = sy;
        			this.rooms[i][j]["width"] = roomw;
        			this.rooms[i][j]["height"] = roomh;  
        			
        			for (var ii = sx; ii < sx + roomw; ii++) {
        				for (var jj = sy; jj < sy + roomh; jj++) {
        					this._map[ii][jj] = 0;
        				}
        			}  
        		}
        	}
        }
        
        ROT.Map.Rogue.prototype._getWallPosition = function(aRoom, aDirection) {
        	var rx;
        	var ry;
        	var door;
        	
        	if (aDirection == 1 || aDirection == 3) {
        		rx = ROT.RNG.getUniformInt(aRoom["x"] + 1, aRoom["x"] + aRoom["width"] - 2);
        		if (aDirection == 1) {
        			ry = aRoom["y"] - 2;
        			door = ry + 1;
        		} else {
        			ry = aRoom["y"] + aRoom["height"] + 1;
        			door = ry -1;
        		}
        		
        		this._map[rx][door] = 0; // i'm not setting a specific 'door' tile value right now, just empty space. 
        		
        	} else if (aDirection == 2 || aDirection == 4) {
        		ry = ROT.RNG.getUniformInt(aRoom["y"] + 1, aRoom["y"] + aRoom["height"] - 2);
        		if(aDirection == 2) {
        			rx = aRoom["x"] + aRoom["width"] + 1;
        			door = rx - 1;
        		} else {
        			rx = aRoom["x"] - 2;
        			door = rx + 1;
        		}
        		
        		this._map[door][ry] = 0; // i'm not setting a specific 'door' tile value right now, just empty space. 
        		
        	}
        	return [rx, ry];
        }
        
        /***
        * @param startPosition a 2 element array
        * @param endPosition a 2 element array
        */
        ROT.Map.Rogue.prototype._drawCorridore = function (startPosition, endPosition) {
        	var xOffset = endPosition[0] - startPosition[0];
        	var yOffset = endPosition[1] - startPosition[1];
        	
        	var xpos = startPosition[0];
        	var ypos = startPosition[1];
        	
        	var tempDist;
        	var xDir;
        	var yDir;
        	
        	var move; // 2 element array, element 0 is the direction, element 1 is the total value to move. 
        	var moves = []; // a list of 2 element arrays
        	
        	var xAbs = Math.abs(xOffset);
        	var yAbs = Math.abs(yOffset);
        	
        	var percent = ROT.RNG.getUniform(); // used to split the move at different places along the long axis
        	var firstHalf = percent;
        	var secondHalf = 1 - percent;
        	
        	xDir = xOffset > 0 ? 2 : 6;
        	yDir = yOffset > 0 ? 4 : 0;
        	
        	if (xAbs < yAbs) {
        		// move firstHalf of the y offset
        		tempDist = Math.ceil(yAbs * firstHalf);
        		moves.push([yDir, tempDist]);
        		// move all the x offset
        		moves.push([xDir, xAbs]);
        		// move sendHalf of the  y offset
        		tempDist = Math.floor(yAbs * secondHalf);
        		moves.push([yDir, tempDist]);
        	} else {
        		//  move firstHalf of the x offset
        		tempDist = Math.ceil(xAbs * firstHalf);
        		moves.push([xDir, tempDist]);
        		// move all the y offset
        		moves.push([yDir, yAbs]);
        		// move secondHalf of the x offset.
        		tempDist = Math.floor(xAbs * secondHalf);
        		moves.push([xDir, tempDist]);  
        	}
        	
        	this._map[xpos][ypos] = 0;
        	
        	while (moves.length > 0) {
        		move = moves.pop();
        		while (move[1] > 0) {
        			xpos += ROT.DIRS[8][move[0]][0];
        			ypos += ROT.DIRS[8][move[0]][1];
        			this._map[xpos][ypos] = 0;
        			move[1] = move[1] - 1;
        		}
        	}
        }
        
        ROT.Map.Rogue.prototype._createCorridors = function () {
        	// Draw Corridors between connected rooms
        	
        	var cw = this._options.cellWidth;
        	var ch = this._options.cellHeight;
        	var room;
        	var connection;
        	var otherRoom;
        	var wall;
        	var otherWall;
        	
        	for (var i = 0; i < cw; i++) {
        		for (var j = 0; j < ch; j++) {
        			room = this.rooms[i][j];
        			
        			for (var k = 0; k < room["connections"].length; k++) {
        					
        				connection = room["connections"][k]; 
        				
        				otherRoom = this.rooms[connection[0]][connection[1]];
        				
        				// figure out what wall our corridor will start one.
        				// figure out what wall our corridor will end on. 
        				if (otherRoom["cellx"] > room["cellx"] ) {
        					wall = 2;
        					otherWall = 4;
        				} else if (otherRoom["cellx"] < room["cellx"] ) {
        					wall = 4;
        					otherWall = 2;
        				} else if(otherRoom["celly"] > room["celly"]) {
        					wall = 3;
        					otherWall = 1;
        				} else if(otherRoom["celly"] < room["celly"]) {
        					wall = 1;
        					otherWall = 3;
        				}
        				
        				this._drawCorridore(this._getWallPosition(room, wall), this._getWallPosition(otherRoom, otherWall));
        			}
        		}
        	}
        }
             
    }
// ROT body	

}());



