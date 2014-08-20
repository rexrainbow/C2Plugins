// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_menufsm = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_menufsm.prototype;
		
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

    var STATE_OFF = 0;
    var STATE_OPENING = 1;
    var STATE_OPENED = 2;
    var STATE_CLOSING = 3;
    var STATE_CLOSED = 4;
    var CMD_OPEN = 1;
    var CMD_CLOSE = 2;
    var CMD_FINISHEDEVENT = 3;
    var CMD_FORCEFINISHEDEVENT = 4;
    var STATENAMEMAP = ["Off", "Opening", "Opened", "Closing", "Closed"];
	behinstProto.onCreate = function()
	{       
        this.state = (this.properties[0] == 1)? STATE_OPENED:
                     (this.properties[0] == 2)? STATE_CLOSED:
                                                STATE_OFF;
        this.has_transition_state = (this.properties[1] == 1);                                               
        this.waiting_event_count = 0;        
	};

	behinstProto.tick = function ()
	{ 
	};  
    
	behinstProto._on_logic = function (cmd)
	{
        var pre_state = this.state;
        switch (this.state)
        {
        case STATE_OFF:
            if (cmd == CMD_OPEN)             
                this.state = (this.has_transition_state)? STATE_OPENING:STATE_OPENED;
            else if (cmd == CMD_CLOSE)
                this.state = (this.has_transition_state)? STATE_CLOSING:STATE_CLOSED;
        break;
        case STATE_OPENING:
            if (cmd == CMD_FINISHEDEVENT)
            {
                if (this.waiting_event_count > 0)
                    this.waiting_event_count -= 1;
                if (this.waiting_event_count == 0)
                    this.state = STATE_OPENED;
            }
            else if (cmd == CMD_FORCEFINISHEDEVENT)
            {
                this.waiting_event_count = 0;
                this.state = STATE_OPENED;
            }
        break;
        case STATE_OPENED:
            if (cmd == CMD_CLOSE)
                this.state = (this.has_transition_state)? STATE_CLOSING:STATE_CLOSED;
        break;
        case STATE_CLOSING:
            if (cmd == CMD_FINISHEDEVENT)
            {
                if (this.waiting_event_count > 0)
                    this.waiting_event_count -= 1;
                if (this.waiting_event_count == 0)
                    this.state = STATE_CLOSED;
            }
            else if (cmd == CMD_FORCEFINISHEDEVENT)
            {
                this.waiting_event_count = 0;
                this.state = STATE_CLOSED;
            }                              
        break;
        case STATE_CLOSED:
            if (cmd == CMD_OPEN)
                this.state = (this.has_transition_state)? STATE_OPENING:STATE_OPENED;
        break;   
        }
        
        if (pre_state != this.state)
        {
            var handler = (this.state == STATE_OPENING)? cr.behaviors.Rex_menufsm.prototype.cnds.OnOpening:
                          (this.state == STATE_OPENED)? cr.behaviors.Rex_menufsm.prototype.cnds.OnOpened:
                          (this.state == STATE_CLOSING)? cr.behaviors.Rex_menufsm.prototype.cnds.OnClosing:
                          (this.state == STATE_CLOSED)? cr.behaviors.Rex_menufsm.prototype.cnds.OnClosed:
                                                        null;
            if (handler != null)
                this.runtime.trigger(handler, this.inst);      
        }        
	};    

	behinstProto._inc_waiting_event_count = function ()
	{
		if ((this.state == STATE_OPENING) || (this.state == STATE_CLOSING))
        {
            this.waiting_event_count += 1;
        }
	};
	behinstProto.saveToJSON = function ()
	{
		return { "s": this.state,
                 "wec": this.waiting_event_count
               };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.state = o["s"];
        this.waiting_event_count = o["wec"];
	};	
    
	/**BEGIN-PREVIEWONLY**/    
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [{"name": "State", "value":STATENAMEMAP[this.state]}
                           ]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnOpening = function () { return true; };
	Cnds.prototype.OnOpened = function () { return true; };   
	Cnds.prototype.OnClosing = function () { return true; };
	Cnds.prototype.OnClosed = function () { return true; }; 
    
	Cnds.prototype.IsOpened = function ()
	{
		return (this.state == STATE_OPENED);
	};
	Cnds.prototype.IsClosed = function ()
	{
		return (this.state == STATE_CLOSED);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.OpenMenu = function ()
	{  
        this._on_logic(CMD_OPEN);
	}; 

    Acts.prototype.CloseMenu = function ()
	{
        this._on_logic(CMD_CLOSE);
	};     

    Acts.prototype.WaitEvnet = function ()
	{
        this._inc_waiting_event_count();
	};    

    Acts.prototype.FinishEvnet = function ()
	{
        this._on_logic(CMD_FINISHEDEVENT);
	};

    Acts.prototype.ForceFinishEvnet = function ()
	{
        this._on_logic(CMD_FORCEFINISHEDEVENT);
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());