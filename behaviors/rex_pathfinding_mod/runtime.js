// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Pathfinding = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Pathfinding.prototype;
		
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
		this.obstacleTypes = [];		// object types to treat as obstacles in custom mode
		this.costTypes = [];			// object types with cost: { obj: type, cost: n }
	};

	/////////////////////////////////////
	// Behavior instance class
	
	// Global map of cell size and border to a 2D array of obstacles
	// e.g. cellData["60, 0"] = [[...]];
	var cellData = {};
	
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
		//this.cellSize = this.properties[0];
		
		this.cellBorder = this.properties[0];
		this.obstacles = this.properties[1];		// 0 = solids, 1 = custom
		this.maxSpeed = this.properties[2];
		this.acc = this.properties[3];
		this.dec = this.properties[4];
		this.av = cr.to_radians(this.properties[5]);
		this.rotateEnabled = (this.properties[6] !== 0);
		this.diagonalsEnabled = (this.properties[7] !== 0);
		this.enabled = (this.properties[8] !== 0);
		
		this.isMoving = false;
		this.movingFromStopped = false;
		this.firstTickMovingWhileMoving = false;
		this.hasPath = false;
		this.moveNode = 0;
		this.a = this.inst.angle;
		this.lastKnownAngle = this.inst.angle;
		this.s = 0;
		this.rabbitX = 0;
		this.rabbitY = 0;
		this.rabbitA = 0;
			
		//this.myHcells = Math.ceil(this.runtime.running_layout.width / this.cellSize);
		//this.myVcells = Math.ceil(this.runtime.running_layout.height / this.cellSize);
		
		this.myPath = [];				// copy of path returned from pathfinder
		this.delayFindPath = false;
		this.delayPathX = 0;
		this.delayPathY = 0;
		
		this.is_destroyed = false;
		
		this.isCalculating = false;
		this.calcPathX = 0;
		this.calcPathY = 0;
		
		this.firstRun = true;
		var self = this;
		
		if (!this.recycled)
		{
			this.pathSuccessFn = function ()
			{
				if (self.is_destroyed)
					return;
				
				self.isCalculating = false;
				self.copyResultPath();
				self.hasPath = (self.myPath.length > 0);
				self.moveNode = 0;
				self.runtime.trigger(cr.behaviors.Rex_Pathfinding.prototype.cnds.OnPathFound, self.inst);
				self.doDelayFindPath();		// run next pathfind if queued
			};
			
			this.pathFailFn = function ()
			{
				if (self.is_destroyed)
					return;
				
				self.isCalculating = false;
				self.clearResultPath();
				self.hasPath = false;
				self.isMoving = false;
				self.moveNode = 0;
				self.runtime.trigger(cr.behaviors.Rex_Pathfinding.prototype.cnds.OnFailedToFindPath, self.inst);
				self.doDelayFindPath();		// run next pathfind if queued
			};
		}
	};
	
	behinstProto.onDestroy = function ()
	{
		this.is_destroyed = true;		// start ignoring callbacks
		this.delayFindPath = false;
	};
	
	behinstProto.saveToJSON = function ()
	{
		var o = {			
			"cb": this.cellBorder,
			"ms": this.maxSpeed,
			"acc": this.acc,
			"dec": this.dec,
			"av": this.av,
			"re": this.rotateEnabled,
			"de": this.diagonalsEnabled,
			"im": this.isMoving,
			"mfs": this.movingFromStopped,
			"ftmwm": this.firstTickMovingWhileMoving,
			"hp": this.hasPath,
			"mn": this.moveNode,
			"a": this.a,
			"lka": this.lastKnownAngle,
			"s": this.s,
			"rx": this.rabbitX,
			"ry": this.rabbitY,
			"ra": this.rabbitA,
			"path": this.myPath,
			"en": this.enabled,
			"fr": this.firstRun,
			"obs": [],
			"costs": []
		};
		
		// If calculating, save the requested destination and re-issue the calculation when loading.
		if (this.isCalculating)
		{
			o["dfp"] = true;
			o["dpx"] = this.calcPathX;
			o["dpy"] = this.calcPathY;
		}
		else
		{
			o["dfp"] = this.delayFindPath;
			o["dpx"] = this.delayPathX;
			o["dpy"] = this.delayPathY;
		}
		
		var i, len;
		for (i = 0, len = this.type.obstacleTypes.length; i < len; i++)
		{
			o["obs"].push(this.type.obstacleTypes[i].sid);
		}
		
		for (i = 0, len = this.type.costTypes.length; i < len; i++)
		{
			o["costs"].push({ "sid": this.type.costTypes[i].obj.sid, "cost": this.type.costTypes[i].cost });
		}
		
		return o;
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.cellBorder = o["cb"];
		this.maxSpeed = o["ms"];
		this.acc = o["acc"];
		this.dec = o["dec"];
		this.av = o["av"];
		this.rotateEnabled = o["re"];
		this.diagonalsEnabled = o["de"];
		this.isMoving = o["im"];
		this.movingFromStopped = o["mfs"];
		this.firstTickMovingWhileMoving = o["ftmwm"];
		this.hasPath = o["hp"];
		this.moveNode = o["mn"];
		this.a = o["a"];
		this.lastKnownAngle = o["lka"];
		this.s = o["s"];
		this.rabbitX = o["rx"];
		this.rabbitY = o["ry"];
		this.rabbitA = o["ra"];
		this.myPath = o["path"];
		this.enabled = o["en"];
		this.firstRun = o["fr"];
		
		// Re-issue any pending movement calculation
		this.delayFindPath = o["dfp"];
		this.delayPathX = o["dpx"];
		this.delayPathY = o["dpy"];
		
		// Reloaded by each instance but oh well
		this.type.obstacleTypes.length = 0;
		var obsarr = o["obs"];
		var i, len, t;
		for (i = 0, len = obsarr.length; i < len; i++)
		{
			t = this.runtime.getObjectTypeBySid(obsarr[i]);
			if (t)
				this.type.obstacleTypes.push(t);
		}
		
		this.type.costTypes.length = 0;
		var costarr = o["costs"];
		for (i = 0, len = costarr.length; i < len; i++)
		{
			t = this.runtime.getObjectTypeBySid(costarr[i]["sid"]);
			
			if (t)
				this.type.costTypes.push({ obj: t, cost: costarr[i]["cost"] });
		}
		
		// Update diagonals enabled state
		this.getMyInfo().pathfinder["setDiagonals"](this.diagonalsEnabled);
	};
	
	behinstProto.afterLoad = function ()
	{
		this.getMyInfo().regenerate = true;
	};

	behinstProto.tick = function ()
	{
		if (!this.enabled || !this.isMoving)
			return;
		
		// Update angle to object angle if changed
		if (this.rotateEnabled && this.inst.angle !== this.lastKnownAngle)
			this.a = this.inst.angle;
		
		var dt = this.runtime.getDt(this.inst);
		var targetAngle, da, dist, nextX, nextY, t, r, curveDist, curMaxSpeed;
		var inst = this.inst;
		
		var rabbitAheadDist = Math.min(this.maxSpeed * 0.4, Math.abs(this.inst.width) * 2);
		var rabbitSpeed = Math.max(this.s * 1.5, 30);
		
		// Get position of current node moving towards and get distance to it
		if (this.moveNode < this.myPath.length)
		{
			nextX = this.myPath[this.moveNode].x;
			nextY = this.myPath[this.moveNode].y;
			
			dist = cr.distanceTo(this.rabbitX, this.rabbitY, nextX, nextY);
		
			if (dist < 3 * rabbitSpeed * dt) // within 3 ticks of movement at the max speed
			{
				this.moveNode++;
				
				// snap rabbit to the node
				this.rabbitX = nextX;
				this.rabbitY = nextY;
				
				// not yet arrived
				if (this.moveNode < this.myPath.length)
				{
					nextX = this.myPath[this.moveNode].x;
					nextY = this.myPath[this.moveNode].y;
				}
			}
		}
		else
		{
			nextX = this.myPath[this.myPath.length - 1].x;
			nextY = this.myPath[this.myPath.length - 1].y;
		}
		
		this.rabbitA = cr.angleTo(this.rabbitX, this.rabbitY, nextX, nextY);
		var distToRabbit = cr.distanceTo(inst.x, inst.y, this.rabbitX, this.rabbitY);
		
		// Move rabbit at max speed along nodes if less than the rabbit dist ahead
		if (distToRabbit < rabbitAheadDist && this.moveNode < this.myPath.length)
		{
			var moveDist;
			
			if (this.firstTickMovingWhileMoving)
			{
				moveDist = rabbitAheadDist;
				this.firstTickMovingWhileMoving = false;
			}
			else
				moveDist = rabbitSpeed * dt;
			
			this.rabbitX += Math.cos(this.rabbitA) * moveDist;
			this.rabbitY += Math.sin(this.rabbitA) * moveDist;
		}
		
		targetAngle = cr.angleTo(inst.x, inst.y, this.rabbitX, this.rabbitY);
		da = cr.angleDiff(this.a, targetAngle);
		
		var distToFinish = cr.distanceTo(inst.x, inst.y, this.myPath[this.myPath.length - 1].x, this.myPath[this.myPath.length - 1].y);
		var decelDist = (this.maxSpeed * this.maxSpeed) / (2 * this.dec);
		
		// Rotate object towards rabbit
		if (distToRabbit > 1)
		{
			this.a = cr.angleRotate(this.a, targetAngle, this.av * dt);
			
			// Within 1 degree of target: allow accelerating to max speed
			if (cr.to_degrees(da) <= 0.5)
			{
				curMaxSpeed = this.maxSpeed;
			}
			// Over 120 degrees off target or first node: way off, and might draw a huge circle, so stop and rotate on the spot
			else if (cr.to_degrees(da) >= 120 || (this.movingFromStopped && this.moveNode === 0))
			{
				curMaxSpeed = 0;
				this.movingFromStopped = true;	// we're way off, so make sure it rotates all the way round
			}
			// Between 1 and 120 degrees off: compute maximum speed to achieve turn to target
			else
			{
				t = da / this.av;
				dist = cr.distanceTo(inst.x, inst.y, this.rabbitX, this.rabbitY);
				r = dist / (2 * Math.sin(da));
				curveDist = r * da;
				curMaxSpeed = curveDist / t;
				
				if (curMaxSpeed < 0)
					curMaxSpeed = 0;
				if (curMaxSpeed > this.maxSpeed)
					curMaxSpeed = this.maxSpeed;
			}
			
			// Decelerate if close to finish
			if (distToFinish < decelDist)
				curMaxSpeed = Math.min(curMaxSpeed, (distToFinish / decelDist) * this.maxSpeed + (this.maxSpeed / 40));
			
			this.s += this.acc * dt;
				
			if (this.s > curMaxSpeed)
				this.s = curMaxSpeed;
		}
		
		/*
		targetAngle = cr.angleTo(inst.x, inst.y, nextX, nextY);
		da = cr.angleDiff(this.a, targetAngle);
		
		// First node handled differently
		if (this.moveNode === 0)
		{
			this.nextMaxSpeed = this.maxSpeed;
			
			// If within 1 degree of target, start accelerating towards it
			if (cr.to_degrees(da) <= 0.5)
			{
				this.s += this.acc * dt;
				
				if (this.s > this.maxSpeed)
					this.s = this.maxSpeed;
			}
			// Otherwise keep rotating until within 1 degree of target
			else
			{
				// Remain stopped and keep rotating until within 1 degree
				this.a = cr.angleRotate(this.a, targetAngle, this.av * dt);
				this.s = 0;
			}
		}
		// Second node and beyond
		else
		{
			// Within 1 degree of target: allow accelerating to max speed
			if (cr.to_degrees(da) <= 0.5)
				this.nextMaxSpeed = this.maxSpeed;
			
			// Accelerate to the maximum speed for this corner and rotate towards target
			this.s += this.acc * dt;
			
			if (this.s > Math.min(this.maxSpeed, this.nextMaxSpeed))
				this.s = Math.min(this.maxSpeed, this.nextMaxSpeed);
				
			this.a = cr.angleRotate(this.a, targetAngle, this.av * dt);
			
			// More than 95 degrees off target: stop and rotate
			if (cr.to_degrees(da) > 50)
				this.s = 0;
		}
		*/
		
		inst.x += Math.cos(this.a) * this.s * dt;
		inst.y += Math.sin(this.a) * this.s * dt;
		
		if (this.rotateEnabled)
		{
			inst.angle = this.a;
			this.lastKnownAngle = this.a;
		}
		
		inst.set_bbox_changed();
		
		// Check if arrived at final destination
		if (this.moveNode === this.myPath.length && cr.distanceTo(inst.x, inst.y, nextX, nextY) < Math.max(3 * this.s * dt, 10))
		{
			this.isMoving = false;
			this.hasPath = false;
			this.moveNode = 0;
			this.s = 0;
			this.runtime.trigger(cr.behaviors.Rex_Pathfinding.prototype.cnds.OnArrived, inst);
			return;
		}
	};
	
	behinstProto.tick2 = function ()
	{
		if (!this.enabled)
			return;
		
		this.generateMap();			// not actually done every tick, just checks for regenerate flag
		this.doDelayFindPath();
	};
	
	behinstProto.doDelayFindPath = function()
	{
		if (this.delayFindPath && !this.is_destroyed)
		{
			this.delayFindPath = false;
			this.doFindPath(this.inst.x, this.inst.y, this.delayPathX, this.delayPathY);
		}
	};
	
	behinstProto.getMyInfo = function ()
	{
		var cellkey = "" + this.cellSize + "," + this.cellBorder;
		
		if (!cellData.hasOwnProperty(cellkey))
		{
			cellData[cellkey] = {
				pathfinder: new window["Pathfinder"](),
				cells: null,
				regenerate: false,
				regenerateRegions: []
			};
		}
			
		return cellData[cellkey];
	};
	
	behinstProto.generateMap = function ()
	{
		var myinfo = this.getMyInfo();
		
		if (myinfo.pathfinder["isReady"]() && !myinfo.regenerate && !myinfo.regenerateRegions.length)
			return;		// already got a map and not marked to regenerate
		
		var arr, x, y, lenx, leny, i, len, r, cx1, cy1, cx2, cy2, q;
		
		// regenerate entire map
		if (!myinfo.pathfinder["isReady"]() || myinfo.regenerate)
		{
			arr = [];
			arr.length = this.myHcells;
			
			lenx = this.myHcells;
			leny = this.myVcells;
			
			for (x = 0; x < lenx; ++x)
			{
				arr[x] = [];
				arr[x].length = leny;
				
				for (y = 0; y < leny; ++y)
					arr[x][y] = this.queryCellCollision(x, y);
			}
			
			myinfo.cells = arr;
			myinfo.pathfinder["init"](this.myHcells, this.myVcells, arr, this.diagonalsEnabled);
			myinfo.regenerate = false;
			myinfo.regenerateRegions.length = 0;
		}
		else if (myinfo.regenerateRegions.length)
		{
			for (i = 0, len = myinfo.regenerateRegions.length; i < len; ++i)
			{
				r = myinfo.regenerateRegions[i];
				cx1 = r[0];
				cy1 = r[1];
				cx2 = r[2];
				cy2 = r[3];
				
				arr = [];
				lenx = cx2 - cx1;
				leny = cy2 - cy1;
				arr.length = lenx;
				
				for (x = 0; x < lenx; ++x)
				{
					arr[x] = [];
					arr[x].length = leny;
					
					for (y = 0; y < leny; ++y)
					{
						q = this.queryCellCollision(cx1 + x, cy1 + y);
						
						// store result in both new array and the existing obstacle map
						arr[x][y] = q;
						myinfo.cells[cx1 + x][cy1 + y] = q;
					}
				}
				
				myinfo.pathfinder["updateRegion"](cx1, cy1, lenx, leny, arr);
			}
			
			myinfo.regenerateRegions.length = 0;
		}
	};
	
	behinstProto.clearResultPath = function ()
	{
		var i, len;
		for (i = 0, len = this.myPath.length; i < len; i++)
			window["freeResultNode"](this.myPath[i]);
			
		this.myPath.length = 0;
	};
	
	behinstProto.copyResultPath = function ()
	{
		var pathfinder = this.getMyInfo().pathfinder;
		var pathList = pathfinder["pathList"];
		
		this.clearResultPath();
		
		var i, len, n, m;			
		for (i = 0, len = pathList.length; i < len; i++)
		{
			n = pathList[i];
			m = window["allocResultNode"]();
			m.x = (n.x + 0.5) * this.cellSize;
			m.y = (n.y + 0.5) * this.cellSize;
			this.myPath.push(m);
		}
	};
	
	var candidates = [];
	var tmpRect = new cr.rect();
	
	behinstProto.queryCellCollision = function (x_, y_)
	{
		var i, len, t, j, lenj, cost, ret = 0;
		
		tmpRect.left = x_ * this.cellSize - this.cellBorder;
		tmpRect.top = y_ * this.cellSize - this.cellBorder;
		tmpRect.right = (x_ + 1) * this.cellSize + this.cellBorder;
		tmpRect.bottom = (y_ + 1) * this.cellSize + this.cellBorder;
		
		if (this.obstacles === 0)	// solids
		{
			if (this.runtime.testRectOverlapSolid(tmpRect))
				return window["PF_OBSTACLE"];
		}
		else
		{
			this.runtime.getTypesCollisionCandidates(this.inst.layer, this.type.obstacleTypes, tmpRect, candidates);

			for (i = 0, len = candidates.length; i < len; ++i)
			{
				if (this.runtime.testRectOverlap(tmpRect, candidates[i]))
				{
					candidates.length = 0;
					return window["PF_OBSTACLE"];
				}
			}
			
			candidates.length = 0;
		}
		
		// Not an obstacle: check for additional costs
		for (i = 0, len = this.type.costTypes.length; i < len; i++)
		{
			t = this.type.costTypes[i].obj;
			cost = this.type.costTypes[i].cost;
			
			this.runtime.getCollisionCandidates(this.inst.layer, t, tmpRect, candidates);
			
			for (j = 0, lenj = candidates.length; j < lenj; ++j)
			{
				if (this.runtime.testRectOverlap(tmpRect, candidates[j]))
					ret += cost;
			}
			
			candidates.length = 0;
		}
		
		return ret;
	};
	
	behinstProto.doFindPath = function (startX, startY, endX, endY)
	{
		var pathfinder = this.getMyInfo().pathfinder;
		
		if (!pathfinder["isReady"]())
			return false;		// not yet ready
			
		this.isCalculating = true;
		this.calcPathX = endX;
		this.calcPathY = endY;
		
		var cellX = Math.floor(startX / this.cellSize);
		var cellY = Math.floor(startY / this.cellSize);
		var destCellX = Math.floor(endX / this.cellSize);
		var destCellY = Math.floor(endY / this.cellSize);
		
		var bestDist, bestX, bestY, x, y, dx, dy, curDist;
		
		// Sent to an obstacle cell: find the nearest cell that is not an obstacle and move there instead.
		if (pathfinder["at"](destCellX, destCellY) === window["PF_OBSTACLE"])
		{
			bestDist = 1000000;
			bestX = 0;
			bestY = 0;
			
			for (x = 0; x < this.myHcells; x++)
			{
				for (y = 0; y < this.myVcells; y++)
				{
					if (pathfinder["at"](x, y) !== window["PF_OBSTACLE"])
					{
						dx = destCellX - x;
						dy = destCellY - y;
						curDist = dx*dx + dy*dy;

						if (curDist < bestDist)
						{
							bestDist = curDist;
							bestX = x;
							bestY = y;
						}
					}
				}
			}

			destCellX = bestX;
			destCellY = bestY;
		}
		
		var self = this;
		
		// Find a path
		pathfinder["findPath"](cellX, cellY, destCellX, destCellY, this.pathSuccessFn, this.pathFailFn);
	};
	
	behinstProto.onLayoutChange = function ()
	{
		// Regenerate map when changing layout
		this.getMyInfo().regenerate = true;
	};
	
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Has path", "value": this.hasPath, "readonly": true},
				{"name": "Calculating path", "value": this.isCalculating, "readonly": true},
				{"name": "Is moving", "value": this.isMoving, "readonly": true},
				{"name": "Speed", "value": (this.isMoving ? this.s : 0)},
				{"name": "Angle of motion", "value": cr.to_degrees(this.a)},
				{"name": "Max speed", "value": this.maxSpeed},
				{"name": "Acceleration", "value": this.acc},
				{"name": "Deceleration", "value": this.dec},
				{"name": "Rotate speed", "value": cr.to_degrees(this.av)},
				{"name": "Enabled", "value": this.enabled}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		switch (name) {
		case "Speed":				this.s = value;				break;
		case "Angle of motion":		this.a = cr.to_radians(value); break;
		case "Max speed":			this.maxSpeed = value;		break;
		case "Acceleration":		this.acc = value;			break;
		case "Deceleration":		this.dec = value;			break;
		case "Rotate speed":		this.av = cr.to_radians(av); break;
		case "Enabled":				this.enabled = value;		break;
		}
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	
	Cnds.prototype.OnPathFound = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnFailedToFindPath = function ()
	{
		return true;
	};

	Cnds.prototype.IsCellObstacle = function (x_, y_)
	{
		return (this.getMyInfo().pathfinder["at"](x_, y_) === window["PF_OBSTACLE"]);
	};
	
	Cnds.prototype.IsCalculatingPath = function ()
	{
		return this.isCalculating;
	};
	
	Cnds.prototype.IsMoving = function ()
	{
		return this.isMoving;
	};
	
	Cnds.prototype.OnArrived = function ()
	{
		return true;
	};
	
	Cnds.prototype.CompareSpeed = function (cmp, x)
	{
		return cr.do_cmp(this.s, cmp, x);
	};
	
	Cnds.prototype.DiagonalsEnabled = function (cmp, x)
	{
		return this.diagonalsEnabled;
	};
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.FindPath = function (x_, y_)
	{
		if (!this.enabled)
			return;
		
		if (this.isCalculating || !this.getMyInfo().pathfinder["isReady"]())
		{
			// postpone request until next result comes in to prevent clogging up worker
			this.delayFindPath = true;
			this.delayPathX = x_;
			this.delayPathY = y_;
		}
		else
			this.doFindPath(this.inst.x, this.inst.y, x_, y_);
	};
	
	Acts.prototype.StartMoving = function ()
	{
		if (this.hasPath)
		{
			if (this.isMoving)
				this.firstTickMovingWhileMoving = true;
			
			this.movingFromStopped = !this.isMoving;
			this.isMoving = true;
			this.rabbitX = this.inst.x;
			this.rabbitY = this.inst.y;
			this.rabbitA = this.inst.angle;
		}
	};
	
	Acts.prototype.Stop = function ()
	{
		this.isMoving = false;
	};
	
	Acts.prototype.SetEnabled = function (e)
	{
		this.enabled = (e !== 0);
	};
	
	Acts.prototype.RegenerateMap = function ()
	{
		this.getMyInfo().regenerate = true;
	};
	
	Acts.prototype.AddObstacle = function (obj_)
	{
		var obstacleTypes = this.type.obstacleTypes;
		
		// Check not already an obstacle, we don't want to add twice
		if (obstacleTypes.indexOf(obj_) !== -1)
			return;
		
		// Check obj is not a member of a family that is already an obstacle
		var i, len, t;
		for (i = 0, len = obstacleTypes.length; i < len; i++)
		{
			t = obstacleTypes[i];
			
			if (t.is_family && t.members.indexOf(obj_) !== -1)
				return;
		}
		
		obstacleTypes.push(obj_);
	};
	
	Acts.prototype.ClearObstacles = function ()
	{
		this.type.obstacleTypes.length = 0;
	};
	
	Acts.prototype.AddCost = function (obj_, cost_)
	{
		var costTypes = this.type.costTypes;
		
		// Check obj is not already a cost or a member of a family that is already a cost
		var i, len, t;
		for (i = 0, len = costTypes.length; i < len; i++)
		{
			t = costTypes[i].obj;
			
			if (t === obj_)
				return;			// already added this one
			
			if (t.is_family && t.members.indexOf(obj_) !== -1)
				return;			// already added via family
		}
		
		costTypes.push({ obj: obj_, cost: cost_ });
	};
	
	Acts.prototype.ClearCost = function ()
	{
		this.type.costTypes.length = 0;
	};
	
	Acts.prototype.SetMaxSpeed = function (x_)
	{
		this.maxSpeed = x_;
	};
	
	Acts.prototype.SetSpeed = function (x_)
	{
		if (x_ < 0)
			x_ = 0;
		if (x_ > this.maxSpeed)
			x_ = this.maxSpeed;
			
		this.s = x_;
	};
	
	Acts.prototype.SetAcc = function (x_)
	{
		this.acc = x_;
	};
	
	Acts.prototype.SetDec = function (x_)
	{
		this.dec = x_;
	};
	
	Acts.prototype.SetRotateSpeed = function (x_)
	{
		this.av = cr.to_radians(x_);
	};
	
	Acts.prototype.SetDiagonalsEnabled = function (e)
	{
		this.diagonalsEnabled = (e !== 0);
		this.getMyInfo().pathfinder["setDiagonals"](this.diagonalsEnabled);
	};
	
	Acts.prototype.RegenerateRegion = function (startx, starty, endx, endy)
	{
		this.doRegenerateRegion(startx, starty, endx, endy);
	};
	
	Acts.prototype.RegenerateObjectRegion = function (obj)
	{
		if (!obj)
			return;
		
		var instances = obj.getCurrentSol().getObjects();
		
		var i, len, inst;
		for (i = 0, len = instances.length; i < len; ++i)
		{
			inst = instances[i];
			
			if (!inst.update_bbox)
				continue;
			
			inst.update_bbox();
			this.doRegenerateRegion(inst.bbox.left, inst.bbox.top, inst.bbox.right, inst.bbox.bottom);
		}
	};
	
	behinstProto.doRegenerateRegion = function (startx, starty, endx, endy)
	{
		var x1 = Math.min(startx, endx) - this.cellBorder;
		var y1 = Math.min(starty, endy) - this.cellBorder;
		var x2 = Math.max(startx, endx) + this.cellBorder;
		var y2 = Math.max(starty, endy) + this.cellBorder;
		
		var cellX1 = Math.max(Math.floor(x1 / this.cellSize), 0);
		var cellY1 = Math.max(Math.floor(y1 / this.cellSize), 0);
		var cellX2 = Math.min(Math.ceil(x2 / this.cellSize), this.myHcells);
		var cellY2 = Math.min(Math.ceil(y2 / this.cellSize), this.myVcells);
		
		if (cellX1 >= cellX2 || cellY1 >= cellY2)
			return;		// empty area to regenerate
		
		this.getMyInfo().regenerateRegions.push([cellX1, cellY1, cellX2, cellY2]);
	};
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.NodeCount = function (ret)
	{
		ret.set_int(this.myPath.length);
	};
	
	Exps.prototype.NodeXAt = function (ret, i)
	{
		i = Math.floor(i);
		
		if (i < 0 || i >= this.myPath.length)
			ret.set_float(0);
		else
			ret.set_float(this.myPath[i].x);
	};
	
	Exps.prototype.NodeYAt = function (ret, i)
	{
		i = Math.floor(i);
		
		if (i < 0 || i >= this.myPath.length)
			ret.set_float(0);
		else
			ret.set_float(this.myPath[i].y);
	};
	
	Exps.prototype.CellSize = function (ret)
	{
		ret.set_int(this.cellSize);
	};
	
	Exps.prototype.RabbitX = function (ret)
	{
		ret.set_float(this.rabbitX);
	};
	
	Exps.prototype.RabbitY = function (ret)
	{
		ret.set_float(this.rabbitY);
	};
	
	Exps.prototype.MaxSpeed = function (ret)
	{
		ret.set_float(this.maxSpeed);
	};
	
	Exps.prototype.Acceleration = function (ret)
	{
		ret.set_float(this.acc);
	};
	
	Exps.prototype.Deceleration = function (ret)
	{
		ret.set_float(this.dec);
	};
	
	Exps.prototype.RotateSpeed = function (ret)
	{
		ret.set_float(cr.to_degrees(this.av));
	};
	
	Exps.prototype.MovingAngle = function (ret)
	{
		ret.set_float(cr.to_degrees(this.a));
	};
	
	Exps.prototype.CurrentNode = function (ret)
	{
		ret.set_int(this.moveNode);
	};
	
	Exps.prototype.Speed = function (ret)
	{
		ret.set_float(this.isMoving ? this.s : 0);
	};
	
	behaviorProto.exps = new Exps();
	
}());