"use strict";

(function ()
{
	var workersSupported = (typeof Worker !== "undefined");
	var isInWebWorker = (typeof document === "undefined");		// no DOM in a worker

// called from plugin
    if (!isInWebWorker)
    {
        var MazeGen = function()
        {
            this.worker = null;
            this.is_processing = false;
        };
        var MazeGenProto = MazeGen.prototype;
        
        MazeGenProto.Start = function (w, h, type, seed, callback)
	    {        	       
            if (workersSupported)
            {
                this.worker = new Worker("mazegen.js");                
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
                this.worker.addEventListener("error", on_error, false);
                
                this.is_processing = true;
                var args = ["start", w, h, type, seed];
                this.worker.postMessage(args);  
            }
            else
            {
                callback([get_map(w, h, type, seed)]);
            }
	    };
	    
	    MazeGenProto.Stop = function ()
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
	    	    	        	    
	    MazeGenProto.IsProcessing = function ()
	    {
            return this.is_processing;
	    };

        window["MazeGen"] = MazeGen;
    }
// called from plugin    
    	
// webworker    
    if (isInWebWorker)
    {
        var start = function (w, h, type, seed)
        {
            var tile_array = get_map(w, h, type, seed);
            self.postMessage([tile_array]); 
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
        var get_map = function (w, h, type, seed)
        {
            ROT.RNG.setSeed(seed);
            
            var fn_name;
            switch (type)
            {
            case 0: fn_name = "DividedMaze"; break;
            case 1: fn_name = "IceyMaze";    break;
            case 2: fn_name = "EllerMaze";   break;
            }
            var maze = new ROT.Map[fn_name](w, h);
            maze.create(); 
            return maze.getMap();
        };
        	    
        var ROT = {};
        
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
        
        //dividedmaze.js
        /**
         * @class Recursively divided maze, http://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method
         * @augments ROT.Map
         */
        ROT.Map.DividedMaze = function(width, height) {
        	ROT.Map.call(this, width, height);
        	this._stack = [];
        }
        ROT.Map.DividedMaze.extend(ROT.Map);
        
        ROT.Map.DividedMaze.prototype.create = function(callback) {
        	var w = this._width;
        	var h = this._height;
        	
        	this._map = [];
        	
        	for (var i=0;i<w;i++) {
        		this._map.push([]);
        		for (var j=0;j<h;j++) {
        			var border = (i == 0 || j == 0 || i+1 == w || j+1 == h);
        			this._map[i].push(border ? 1 : 0);
        		}
        	}
        	
        	this._stack = [
        		[1, 1, w-2, h-2]
        	];
        	this._process();
        	
        	// edit by rex.rainbow	
        	//for (var i=0;i<w;i++) {
        	//	for (var j=0;j<h;j++) {
        	//		callback(i, j, this._map[i][j]);
        	//	}
        	//}	
        	//this._map = null;	
        	// edit by rex.rainbow
        	
        
        	return this;
        }
        
        ROT.Map.DividedMaze.prototype._process = function() {
        	while (this._stack.length) {
        		var room = this._stack.shift(); /* [left, top, right, bottom] */
        		this._partitionRoom(room);
        	}
        }
        
        ROT.Map.DividedMaze.prototype._partitionRoom = function(room) {
        	var availX = [];
        	var availY = [];
        	
        	for (var i=room[0]+1;i<room[2];i++) {
        		var top = this._map[i][room[1]-1];
        		var bottom = this._map[i][room[3]+1];
        		if (top && bottom && !(i % 2)) { availX.push(i); }
        	}
        	
        	for (var j=room[1]+1;j<room[3];j++) {
        		var left = this._map[room[0]-1][j];
        		var right = this._map[room[2]+1][j];
        		if (left && right && !(j % 2)) { availY.push(j); }
        	}
        
        	if (!availX.length || !availY.length) { return; }
        
        	var x = availX.random();
        	var y = availY.random();
        	
        	this._map[x][y] = 1;
        	
        	var walls = [];
        	
        	var w = []; walls.push(w); /* left part */
        	for (var i=room[0]; i<x; i++) { 
        		this._map[i][y] = 1;
        		w.push([i, y]); 
        	}
        	
        	var w = []; walls.push(w); /* right part */
        	for (var i=x+1; i<=room[2]; i++) { 
        		this._map[i][y] = 1;
        		w.push([i, y]); 
        	}
        
        	var w = []; walls.push(w); /* top part */
        	for (var j=room[1]; j<y; j++) { 
        		this._map[x][j] = 1;
        		w.push([x, j]); 
        	}
        	
        	var w = []; walls.push(w); /* bottom part */
        	for (var j=y+1; j<=room[3]; j++) { 
        		this._map[x][j] = 1;
        		w.push([x, j]); 
        	}
        		
        	var solid = walls.random();
        	for (var i=0;i<walls.length;i++) {
        		var w = walls[i];
        		if (w == solid) { continue; }
        		
        		var hole = w.random();
        		this._map[hole[0]][hole[1]] = 0;
        	}
        
        	this._stack.push([room[0], room[1], x-1, y-1]); /* left top */
        	this._stack.push([x+1, room[1], room[2], y-1]); /* right top */
        	this._stack.push([room[0], y+1, x-1, room[3]]); /* left bottom */
        	this._stack.push([x+1, y+1, room[2], room[3]]); /* right bottom */
        }
        
        // ellermaze.js
        /**
         * @class Maze generator - Eller's algorithm
         * See http://homepages.cwi.nl/~tromp/maze.html for explanation
         * @augments ROT.Map
         */
        ROT.Map.EllerMaze = function(width, height) {
        	ROT.Map.call(this, width, height);
        }
        ROT.Map.EllerMaze.extend(ROT.Map);
        
        ROT.Map.EllerMaze.prototype.create = function(callback) {
        	var map = this._fillMap(1);
        	var w = Math.ceil((this._width-2)/2);
        	
        	var rand = 9/24;
        	
        	var L = [];
        	var R = [];
        	
        	for (var i=0;i<w;i++) {
        		L.push(i);
        		R.push(i);
        	}
        	L.push(w-1); /* fake stop-block at the right side */
        
        	for (var j=1;j+3<this._height;j+=2) {
        		/* one row */
        		for (var i=0;i<w;i++) {
        			/* cell coords (will be always empty) */
        			var x = 2*i+1;
        			var y = j;
        			map[x][y] = 0;
        			
        			/* right connection */
        			if (i != L[i+1] && ROT.RNG.getUniform() > rand) {
        				this._addToList(i, L, R);
        				map[x+1][y] = 0;
        			}
        			
        			/* bottom connection */
        			if (i != L[i] && ROT.RNG.getUniform() > rand) {
        				/* remove connection */
        				this._removeFromList(i, L, R);
        			} else {
        				/* create connection */
        				map[x][y+1] = 0;
        			}
        		}
        	}
        
        	/* last row */
        	for (var i=0;i<w;i++) {
        		/* cell coords (will be always empty) */
        		var x = 2*i+1;
        		var y = j;
        		map[x][y] = 0;
        		
        		/* right connection */
        		if (i != L[i+1] && (i == L[i] || ROT.RNG.getUniform() > rand)) {
        			/* dig right also if the cell is separated, so it gets connected to the rest of maze */
        			this._addToList(i, L, R);
        			map[x+1][y] = 0;
        		}
        		
        		this._removeFromList(i, L, R);
        	}
        	
        	// edit by rex.rainbow      
        	//for (var i=0;i<this._width;i++) {
        	//	for (var j=0;j<this._height;j++) {
        	//		callback(i, j, map[i][j]);
        	//	}
        	//}
        	this._map = map;              
        	// edit by rex.rainbow             
        
        	
        	return this;
        }
        
        /**
         * Remove "i" from its list
         */
        ROT.Map.EllerMaze.prototype._removeFromList = function(i, L, R) {
        	R[L[i]] = R[i];
        	L[R[i]] = L[i];
        	R[i] = i;
        	L[i] = i;
        }
        
        /**
         * Join lists with "i" and "i+1"
         */
        ROT.Map.EllerMaze.prototype._addToList = function(i, L, R) {
        	R[L[i+1]] = R[i];
        	L[R[i]] = L[i+1];
        	R[i] = i+1;
        	L[i+1] = i;
        }
        
        // iceymaze.js
        /**
         * @class Icey's Maze generator
         * See http://www.roguebasin.roguelikedevelopment.org/index.php?title=Simple_maze for explanation
         * @augments ROT.Map
         */
        ROT.Map.IceyMaze = function(width, height, regularity) {
        	ROT.Map.call(this, width, height);
        	this._regularity = regularity || 0;
        }
        ROT.Map.IceyMaze.extend(ROT.Map);
        
        ROT.Map.IceyMaze.prototype.create = function(callback) {
        	var width = this._width;
        	var height = this._height;
        	
        	var map = this._fillMap(1);
        	
        	width -= (width % 2 ? 1 : 2);
        	height -= (height % 2 ? 1 : 2);
        
        	var cx = 0;
        	var cy = 0;
        	var nx = 0;
        	var ny = 0;
        
        	var done = 0;
        	var blocked = false;
        	var dirs = [
        		[0, 0],
        		[0, 0],
        		[0, 0],
        		[0, 0]
        	];
        	do {
        		cx = 1 + 2*Math.floor(ROT.RNG.getUniform()*(width-1) / 2);
        		cy = 1 + 2*Math.floor(ROT.RNG.getUniform()*(height-1) / 2);
        
        		if (!done) { map[cx][cy] = 0; }
        		
        		if (!map[cx][cy]) {
        			this._randomize(dirs);
        			do {
        				if (Math.floor(ROT.RNG.getUniform()*(this._regularity+1)) == 0) { this._randomize(dirs); }
        				blocked = true;
        				for (var i=0;i<4;i++) {
        					nx = cx + dirs[i][0]*2;
        					ny = cy + dirs[i][1]*2;
        					if (this._isFree(map, nx, ny, width, height)) {
        						map[nx][ny] = 0;
        						map[cx + dirs[i][0]][cy + dirs[i][1]] = 0;
        						
        						cx = nx;
        						cy = ny;
        						blocked = false;
        						done++;
        						break;
        					}
        				}
        			} while (!blocked);
        		}
        	} while (done+1 < width*height/4);
        	
        	// edit by rex.rainbow	
        	//for (var i=0;i<this._width;i++) {
        	//	for (var j=0;j<this._height;j++) {
        	//		callback(i, j, map[i][j]);
        	//	}
        	//}
        	this._map = map;
        	// edit by rex.rainbow
        		
        	return this;
        }
        
        ROT.Map.IceyMaze.prototype._randomize = function(dirs) {
        	for (var i=0;i<4;i++) {
        		dirs[i][0] = 0;
        		dirs[i][1] = 0;
        	}
        	
        	switch (Math.floor(ROT.RNG.getUniform()*4)) {
        		case 0:
        			dirs[0][0] = -1; dirs[1][0] = 1;
        			dirs[2][1] = -1; dirs[3][1] = 1;
        		break;
        		case 1:
        			dirs[3][0] = -1; dirs[2][0] = 1;
        			dirs[1][1] = -1; dirs[0][1] = 1;
        		break;
        		case 2:
        			dirs[2][0] = -1; dirs[3][0] = 1;
        			dirs[0][1] = -1; dirs[1][1] = 1;
        		break;
        		case 3:
        			dirs[1][0] = -1; dirs[0][0] = 1;
        			dirs[3][1] = -1; dirs[2][1] = 1;
        		break;
        	}
        }
        
        ROT.Map.IceyMaze.prototype._isFree = function(map, x, y, width, height) {
        	if (x < 1 || y < 1 || x >= width || y >= height) { return false; }
        	return map[x][y];
        }
        
    }
// ROT body	

}());



