// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_DungeonGen = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_DungeonGen.prototype;
		
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
	    if (!this.recycled)
	        this.dungeon_gen = new window["DungeonGen"]();
	        
	    this.map = null;
        this.rooms = null;
        this.exp_MapWidth = 0;
        this.exp_MapHeight = 0;   
        this.exp_CurRoom = null;
        this.exp_CurRoomIndex = -1;
        
        // for official save/load    
        this.current_task = null;
        // for official save/load
	};
    
	instanceProto.onDestroy = function ()
	{
	    this.Cencel();
	};   
	
    instanceProto.Start = function (type, w, h, seed, options)
	{
	    this.dungeon_gen["Stop"]();
	    
        var self = this;
        var on_complete = function (args)
        {
            self.exp_MapWidth = w;
            self.exp_MapHeight = h;
            var mapInfo = args[0];
            self.map = mapInfo[0];
            self.rooms = mapInfo[1];
            self.current_task = null;
            self.runtime.trigger(cr.plugins_.Rex_DungeonGen.prototype.cnds.OnCompleted, self);              
        };
        
        // for official save/load
        this.current_task = [type, w, h, seed, options];
        // for official save/load
        
        this.dungeon_gen["Start"](type, w, h, seed, options, on_complete);
	};   
	
    instanceProto.Cencel = function (cell)
	{
	    this.current_task = null;
	    this.dungeon_gen["Stop"]();    
	};		
	
    instanceProto.ValueAt = function (x, y)
	{
	    var value;
	    if (this.map && this.map[x])
	        value = this.map[x][y];
	    
	    if (value == null)
	        value = -1;
	    return value;
	};   
    
    instanceProto.isInMap = function (x, y)
	{
        return ((x >= 0) && (x <this.exp_MapWidth) && (y >= 0) && (y < this.exp_MapHeight));
	};       
    
    instanceProto.LXY2RoomIndex = function (x, y)
	{
        if (!this.isInMap(x,y))
            return -1;
        
        var i, cnt=this.rooms.length, room;
        for (i=0; i<cnt; i++)
        {
            room = this.rooms[i];
            if ((x >= room[0]) && (x <= room[2]) && (y >= room[1]) && (y <= room[3]))
                return i;
        }
	    return -1;
	};      

    instanceProto.isInvalid = function (x, y)
	{        
	    return (this.ValueAt(x,y) === -1);
	};    
    instanceProto.isWall = function (x, y)
	{        
	    return (this.ValueAt(x,y) === 1);
	};
    instanceProto.isEmptySpace = function (x, y)
	{        
	    return (this.ValueAt(x,y) === 0);
	}; 
        
    instanceProto.isBorderWall = function (x, y)
	{        
        if (this.isWall(x,y))
        {               
            // 8 dir
            var hasEmptySpaceNeighbor = this.isEmptySpace(x, y-1);
            if (!hasEmptySpaceNeighbor) hasEmptySpaceNeighbor = this.isEmptySpace(x+1, y);
            if (!hasEmptySpaceNeighbor) hasEmptySpaceNeighbor = this.isEmptySpace(x, y+1);
            if (!hasEmptySpaceNeighbor) hasEmptySpaceNeighbor = this.isEmptySpace(x-1, y);             
            if (!hasEmptySpaceNeighbor) hasEmptySpaceNeighbor = this.isEmptySpace(x+1, y-1);
            if (!hasEmptySpaceNeighbor) hasEmptySpaceNeighbor = this.isEmptySpace(x+1, y+1);
            if (!hasEmptySpaceNeighbor) hasEmptySpaceNeighbor = this.isEmptySpace(x-1, y+1); 
            if (!hasEmptySpaceNeighbor) hasEmptySpaceNeighbor = this.isEmptySpace(x-1, y-1); 
	        return hasEmptySpaceNeighbor;
        }

        return false;
	};    
    
    instanceProto.isFilledWall = function (x, y)
	{
        return this.isWall(x,y) && (!this.isBorderWall(x,y));
	}; 
    
    instanceProto.isRoomSpace = function (x, y)
	{                   
        return (this.LXY2RoomIndex(x,y) !== -1);
	};   
    instanceProto.isCorridor = function (x, y, simpleTest)
	{               
        if (this.isEmptySpace(x,y) && (!this.isRoomSpace(x,y)))
        {               
            if (simpleTest)  // include door-type
                return true;
            
            // 4 dir
            var hasRoomSpaceNeighbor = this.isRoomSpace(x, y-1);
            if (!hasRoomSpaceNeighbor) hasRoomSpaceNeighbor = this.isRoomSpace(x+1, y);
            if (!hasRoomSpaceNeighbor) hasRoomSpaceNeighbor = this.isRoomSpace(x, y+1);
            if (!hasRoomSpaceNeighbor) hasRoomSpaceNeighbor = this.isRoomSpace(x-1, y);            
	        return !hasRoomSpaceNeighbor;
        }

        return false;
	};   
    instanceProto.isDoor = function (x, y)	
	{               
        if (this.isEmptySpace(x,y) && (!this.isRoomSpace(x,y)))
        {               
            // 4 dir    
            var hasRoomSpaceNeighbor = this.isRoomSpace(x, y-1);
            if (!hasRoomSpaceNeighbor) hasRoomSpaceNeighbor = this.isRoomSpace(x+1, y);
            if (!hasRoomSpaceNeighbor) hasRoomSpaceNeighbor = this.isRoomSpace(x, y+1);
            if (!hasRoomSpaceNeighbor) hasRoomSpaceNeighbor = this.isRoomSpace(x-1, y);            
	        return hasRoomSpaceNeighbor;
        }

        return false;
	}; 
    
    instanceProto.getCorridorNeighborsCount = function (x, y)
	{
        var cnt = 0;
        if (this.isCorridor(x, y-1, true))  cnt += 1;
        if (this.isCorridor(x+1, y, true))  cnt += 1;
        if (this.isCorridor(x, y+1, true))  cnt += 1;
        if (this.isCorridor(x-1, y, true))  cnt += 1; 
	    return cnt;
	};    
        
    instanceProto.getCorridorNeighborsCode = function (x, y)
	{
        var code = 0;
        // right
        if (this.isCorridor(x+1, y, true))  code |= 1;
        
        // down
        if (this.isCorridor(x, y+1, true))  code |= 2;
        
        // left
        if (this.isCorridor(x-1, y, true))  code |= 4;
        
        // up
        if (this.isCorridor(x, y-1, true))  code |= 8;

	    return code;
	};         

    instanceProto.getRoomLeft = function (room)
	{
        return (room === null)? (-1):room[0];
	};    
    instanceProto.getRoomRight = function (room)
	{
        return (room === null)? (-1):room[2];
	}; 
    instanceProto.getRoomTop = function (room)
	{
        return (room === null)? (-1):room[1];
	};    
    instanceProto.getRoomBottom = function (room)
	{
        return (room === null)? (-1):room[3];
	};
    instanceProto.getRoomCenterX = function (room)
	{
        return (room === null)? (-1): (Math.floor((room[0] + room[2])/2));
	};    
    instanceProto.getRoomCenterY = function (room)
	{
        return (room === null)? (-1): (Math.floor((room[1] + room[3])/2));
	};
    instanceProto.getRoomWidth = function (room)
	{
        return (room === null)? (-1): (room[2] - room[0] + 1);
	};    
    instanceProto.getRoomHeight = function (room)
	{
        return (room === null)? (-1): (room[3] - room[1] + 1);
	}; 
    
	instanceProto.saveToJSON = function ()
	{
		return { "map": this.map,
                 "rooms": this.rooms,
                 "w": this.exp_MapWidth,
                 "h": this.exp_MapHeight,
                 "curTsk": this.current_task,
               };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.map = o["map"];
        this.rooms = o["rooms"];
		this.exp_MapWidth = o["w"];
		this.exp_MapHeight = o["h"];
				
		var current_task = o["curTsk"];			
		if (current_task !== null)
		{
		    this.Start.apply(this, current_task);
		}
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	    
	Cnds.prototype.IsGenerating = function ()
	{
		return this.dungeon_gen["IsProcessing"]();
	};
	
	Cnds.prototype.OnCompleted = function ()
	{
		return true;
	};
	
	Cnds.prototype.TileType = function (x, y, type)
	{
        switch (type)
        {
        case 0:  return this.isInvalid(x,y);
        case 1:  return this.isFilledWall(x,y);
        case 2:  return this.isBorderWall(x,y);        
        case 3:  return this.isRoomSpace(x,y);
        case 4:  return this.isCorridor(x,y);
        case 5:  return this.isDoor(x,y);        
        default: return false;
        }
	};
    
	Cnds.prototype.IsCorridorType = function (x, y, type)
	{
        if (!this.isCorridor(x,y, true))
            return false;

        switch (type)
        {
        case 0:  return (this.getCorridorNeighborsCount(x,y) === 1);  // dead end
        
        case 1:  // L-junction
            var code = this.getCorridorNeighborsCode(x,y);
            return ((code === 3) || (code === 6) || (code === 12) || (code == 9));
            
        case 2:  // I-junction
            var code = this.getCorridorNeighborsCode(x,y);
            return ((code === 5) || (code === 10));
            
        case 3:  return (this.getCorridorNeighborsCount(x,y) === 3);  // T-junction
        
        case 4:  return (this.getCorridorNeighborsCount(x,y) === 4);  // X-junction
        
        default: return false;        
        }
	};   

	Cnds.prototype.DoorType = function (x, y, dir)
	{
        switch (dir)
        {
        case 0:  return this.isRoomSpace(x-1, y);    // left
        case 1:  return this.isRoomSpace(x+1, y);    // right
        case 2:  return this.isRoomSpace(x, y-1);    // top 
        case 3:  return this.isRoomSpace(x, y+1);    // bottom
        default: return false;
        }
	};    
    
	Cnds.prototype.ForEachRoom = function ()
	{
        if (this.rooms == null)
            return false;
        
	    var runtime = this.runtime;
        var current_frame = runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var self = this;
		
        var i,cnt=this.rooms.length;
        for(i=0; i<cnt; i++)
		{
            if (solModifierAfterCnds)
            {
                runtime.pushCopySol(current_event.solModifiers);
            }
            
            this.exp_CurRoom = this.rooms[i];
            this.exp_CurRoomIndex = i;
            current_event.retrigger();            
            
		    if (solModifierAfterCnds)
		    {
		        runtime.popSol(current_event.solModifiers);
		    } 
		}
        
        this.exp_CurRoom = null;
        this.exp_CurRoomIndex = -1;
		return false;
	};     
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
		
    Acts.prototype.GenerateDungeonDigger = function (w, h, seed, 
        roomWidthMin, roomWidthMax, 
        roomHeightMin, roomHeightMax,
        corridorLengthMin, corridorLengthMax,
        dugPercentage, timeLimit)
	{
        var options = {
            "roomWidth": [roomWidthMin, roomWidthMax],
            "roomHeight": [roomHeightMin, roomHeightMax],
            "corridorLength": [corridorLengthMin, corridorLengthMax],
            "dugPercentage": dugPercentage,
            "timeLimit": timeLimit*1000
        }
	    this.Start("Digger", w, h, seed, options);
	};   
    
    Acts.prototype.GenerateDungeonUniform = function (w, h, seed, 
        roomWidthMin, roomWidthMax, 
        roomHeightMin, roomHeightMax,
        dugPercentage, timeLimit)
	{
        var options = {
            "roomWidth": [roomWidthMin, roomWidthMax],
            "roomHeight": [roomHeightMin, roomHeightMax],
            "dugPercentage": dugPercentage,
            "timeLimit": timeLimit*1000
        }
	    this.Start("Uniform", w, h, seed, options);
	};      
    
    Acts.prototype.GenerateDungeonRogue = function (w, h, seed, 
        cellWidth, cellHeight)
	{
        var options = {
            "cellWidth": cellWidth,
            "cellHeight": cellHeight
        }
	    this.Start("Rogue", w, h, seed, options);
	};
    
    Acts.prototype.Cencel = function ()
	{
	    this.Cencel();   
	};
	
    Acts.prototype.Release = function ()
	{   
        this.exp_MapWidth = 0;
        this.exp_MapHeight = 0;	    
        this.map = null;    
	};	    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.MapWidth = function (ret)
	{
	    ret.set_float( this.exp_MapWidth );
	};

    Exps.prototype.MapHeight = function (ret)
	{
	    ret.set_float( this.exp_MapHeight );
	};   

    Exps.prototype.ValueAt = function (ret, x, y)
	{
	    ret.set_any( this.ValueAt(x,y) );
	};   	    
    
    Exps.prototype.MapAsJson = function (ret)
	{
        var json = (this.map)? JSON.stringify( this.map ) : "";
	    ret.set_string( json );
	};    
    
    Exps.prototype.CurRoomLeft = function (ret)
	{
	    ret.set_int( this.getRoomLeft(this.exp_CurRoom) );
	};    
    Exps.prototype.CurRoomRight = function (ret)
	{
	    ret.set_int( this.getRoomRight(this.exp_CurRoom) );
	}; 
    Exps.prototype.CurRoomTop = function (ret)
	{
	    ret.set_int( this.getRoomTop(this.exp_CurRoom) );
	};    
    Exps.prototype.CurRoomBottom = function (ret)
	{
	    ret.set_int( this.getRoomBottom(this.exp_CurRoom) );
	};
    Exps.prototype.CurRoomCenterX = function (ret)
	{
	    ret.set_int( this.getRoomCenterX(this.exp_CurRoom) );
	};    
    Exps.prototype.CurRoomCenterY = function (ret)
	{
	    ret.set_int( this.getRoomCenterY(this.exp_CurRoom) );
	};
    Exps.prototype.CurRoomWidth = function (ret)
	{
	    ret.set_int( this.getRoomWidth(this.exp_CurRoom) );
	};    
    Exps.prototype.CurRoomHeight = function (ret)
	{
	    ret.set_int( this.getRoomHeight(this.exp_CurRoom) );
	}; 
    Exps.prototype.CurRoomIndex = function (ret)
	{
	    ret.set_int( this.exp_CurRoomIndex );
	}; 
    Exps.prototype.RoomsCount = function (ret)
	{
        var c = (this.rooms == null)? 0 : this.rooms.length;
	    ret.set_int( c );
	}; 

    Exps.prototype.LXY2RoomIndex = function (ret, x, y)
	{        
	    ret.set_int( this.LXY2RoomIndex(x, y) );
	}; 
    Exps.prototype.RoomLeft = function (ret, index)
	{
        var v = (this.rooms == null)? (-1) : this.getRoomLeft(this.rooms[index]);
	    ret.set_int( v );
	};    
    Exps.prototype.RoomRight = function (ret, index)
	{
        var v = (this.rooms == null)? (-1) : this.getRoomRight(this.rooms[index]);
	    ret.set_int( v );
	}; 
    Exps.prototype.RoomTop = function (ret, index)
	{
        var v = (this.rooms == null)? (-1) : this.getRoomTop(this.rooms[index]);
	    ret.set_int( v );
	};    
    Exps.prototype.RoomBottom = function (ret, index)
	{
        var v = (this.rooms == null)? (-1) : this.getRoomBottom(this.rooms[index]);
	    ret.set_int( v );
	};
    Exps.prototype.RoomCenterX = function (ret, index)
	{
        var v = (this.rooms == null)? (-1) : this.getRoomCenterX(this.rooms[index]);
	    ret.set_int( v );
	};    
    Exps.prototype.RoomCenterY = function (ret, index)
	{
        var v = (this.rooms == null)? (-1) : this.getRoomCenterY(this.rooms[index]);
	    ret.set_int( v );
	};
    Exps.prototype.RoomWidth = function (ret, index)
	{
        var v = (this.rooms == null)? (-1) : this.getRoomWidth(this.rooms[index]);
	    ret.set_int( v );
	};    
    Exps.prototype.RoomHeight = function (ret, index)
	{
        var v = (this.rooms == null)? (-1) : this.getRoomHeight(this.rooms[index]);
	    ret.set_int( v );
	}; 
}());

