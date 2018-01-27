// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Scenario = function (runtime) {
    this.runtime = runtime;
};

(function () {
    var pluginProto = cr.plugins_.Rex_Scenario.prototype;

    /////////////////////////////////////
    // Object type class
    pluginProto.Type = function (plugin) {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };

    var typeProto = pluginProto.Type.prototype;

    typeProto.onCreate = function () {};

    /////////////////////////////////////
    // Instance class
    pluginProto.Instance = function (type) {
        this.type = type;
        this.runtime = type.runtime;
    };

    var instanceProto = pluginProto.Instance.prototype;

    instanceProto.onCreate = function () {
        if (!this.recycled) {
            this._scenario = new cr.plugins_.Rex_Scenario.ScenarioKlass(this);
        } else {
            this._scenario.Reset();
        }


        this._scenario.isDebugMode = (typeof (log) !== "undefined") && (this.properties[0] === 1);
        this._scenario.isAccMode = (this.properties[1] === 0);
        this._scenario.isEvalMode = (this.properties[2] === 1);
        this._scenario.isMustacheMode = (this.properties[4] === 1);
        this.delimiterCfg = null;
        this.setDelimiter(this.properties[5], this.properties[6]);

        this.timeline = null;
        this.timelineUid = -1; // for loading     

        // callback:      
        this.c2FnType = null;

        // sync timescale
        this.my_timescale = -1.0;
        this.runtime.tickMe(this);
        this.isSyncTimescaleMode = (this.properties[3] === 1);
        this.preTimescale = 1;
    };

    instanceProto.setDelimiter = function (leftDelimiter, rightDelimiter) {
        if (leftDelimiter === "") leftDelimiter = "{{";
        if (rightDelimiter === "") rightDelimiter = "}}";
        if ((leftDelimiter === "{{") && (rightDelimiter === "}}"))
            this.delimiterCfg = null;
        else
            this.delimiterCfg = "{{=" + leftDelimiter + " " + rightDelimiter + "=}}";
    };

    instanceProto.tick = function () {
        if (this.isSyncTimescaleMode)
            this.syncTimescale();
    };

    instanceProto.syncTimescale = function () {
        var ts = this.getTimescale();
        if (this.preTimescale == ts)
            return;

        this._scenario.SetTimescale(ts);
        this.preTimescale = ts;
    };

    instanceProto.getTimescale = function () {
        var ts = this.my_timescale;
        if (ts == -1)
            ts = 1;
        return ts;
    };

    instanceProto.onDestroy = function () {
        this._scenario.onDestroy();
    };

    instanceProto.getTimeline = function () {
        if (this.timeline != null)
            return this.timeline;

        assert2(cr.plugins_.Rex_TimeLine, "Scenario: Can not find timeline oject.");
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins) {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Rex_TimeLine.prototype.Instance) {
                this.timeline = inst;
                return this.timeline;
            }
        }
        assert2(this.timeline, "Scenario: Can not find timeline oject.");
        return null;
    };

    // ---- callback ----    
    instanceProto.getC2FnType = function (raise_assert_when_not_fnobj_avaiable) {
        if (this.c2FnType === null) {
            if (window["c2_callRexFunction2"])
                this.c2FnType = "c2_callRexFunction2";
            else if (window["c2_callFunction"])
                this.c2FnType = "c2_callFunction";
            else {
                if (raise_assert_when_not_fnobj_avaiable)
                    assert2(this.c2FnType, "Timeline: Official function, or rex_function2 was not found.");

                this.c2FnType = "";
            }
        }
        return this.c2FnType;
    };

    instanceProto.RunCallback = function (c2FnName, c2FnParms, raise_assert_when_not_fnobj_avaiable) {
        var c2FnGlobalName = this.getC2FnType(raise_assert_when_not_fnobj_avaiable);
        if (c2FnGlobalName === "")
            return null;

        var retValue = window[c2FnGlobalName](c2FnName, c2FnParms);
        return retValue;
    };
    // ---- callback ----      

    instanceProto.render = function (template, view) {
        if (this.delimiterCfg !== null)
            template = this.delimiterCfg + template;

        return window["Mustache"]["render"](template, view);
    };

    instanceProto.saveToJSON = function () {
        return {
            "s": this._scenario.saveToJSON(),
            "tlUid": (this.timeline != null) ? this.timeline.uid : (-1),
            "ft": this.c2FnType,
        };
    };

    instanceProto.loadFromJSON = function (o) {
        this._scenario.loadFromJSON(o["s"]);
        this.timelineUid = o["tlUid"];
        this.c2FnType = o["ft"];
    };

    instanceProto.afterLoad = function () {
        if (this.timelineUid === -1)
            this.timeline = null;
        else {
            this.timeline = this.runtime.getObjectByUID(this.timelineUid);
            assert2(this.timeline, "Scenario: Failed to find timeline object by UID");
        }

        this._scenario.afterLoad();
    };

    /**BEGIN-PREVIEWONLY**/
    instanceProto.getDebuggerValues = function (propsections) {
        var prop = [];
        prop.push({
            "name": "Tag",
            "value": this._scenario.GetLastTag()
        });
        var debuggerInfo = this._scenario.debuggerInfo;
        var i, cnt = debuggerInfo.length;
        for (i = 0; i < cnt; i++)
            prop.push(debuggerInfo[i]);
        var k, mem = this._scenario["Mem"];
        for (k in mem)
            prop.push({
                "name": "MEM-" + k,
                "value": mem[k]
            });

        propsections.push({
            "title": this.type.name,
            "properties": prop
        });
    };

    instanceProto.onDebugValueEdited = function (header, name, value) {
        if (name == "Tag") // change page
        {
            if (this._scenario.HasTag(value))
                this._scenario.Start(null, value);
            else
                alert("Invalid tag " + value);
        } else if (name.substring(0, 4) == "MEM-") // set mem value
        {
            var k = name.substring(4);
            this._scenario["Mem"][k] = value;
        }
    };
    /**END-PREVIEWONLY**/

    //////////////////////////////////////
    // Conditions
    function Cnds() {};
    pluginProto.cnds = new Cnds();

    Cnds.prototype.OnCompleted = function () {
        return true;
    };

    Cnds.prototype.IsRunning = function () {
        return this._scenario.IsRunning;
    };

    Cnds.prototype.OnTagChanged = function () {
        return true;
    };

    Cnds.prototype.IsTagExisted = function (tag) {
        return this._scenario.HasTag(tag);
    };

    Cnds.prototype.IsWaiting = function (key) {
        return this._scenario.IsPaused(key);
    };
    Cnds.prototype.OnWaitingStart = function (key) {
        return this._scenario.IsPaused(key);
    };
    //////////////////////////////////////
    // Actions
    function Acts() {};
    pluginProto.acts = new Acts();

    Acts.prototype.Setup_deprecated = function (timeline_objs, fn_objs) {};

    Acts.prototype.LoadCmds = function (s, fmt) {
        this._scenario.Load(s, fmt);
    };

    Acts.prototype.Start = function (offset, tag) {
        this._scenario.Start(offset, tag);
    };

    Acts.prototype.Pause = function () {
        var timer = this._scenario.timer;
        if (timer)
            timer.Suspend();
    };

    Acts.prototype.Resume = function () {
        var timer = this._scenario.timer;
        if (timer)
            timer.Resume();
    };

    Acts.prototype.Stop = function () {
        this._scenario.Stop();
    };

    Acts.prototype.SetOffset = function (offset) {
        this._scenario.offset = offset;
    };

    Acts.prototype.CleanCmds = function () {
        this._scenario.Clean();
    };

    Acts.prototype.AppendCmds = function (s, fmt) {
        this._scenario.Append(s, fmt);
    };

    Acts.prototype.Continue = function (key) {
        this._scenario.Resume(key);
    };

    Acts.prototype.GoToTag = function (tag) {
        this._scenario.Start(null, tag);
    };

    Acts.prototype.SetMemory = function (index, value) {
        this._scenario["Mem"][index] = value;
    };

    Acts.prototype.StringToMEM = function (JSON_string) {
        this._scenario["Mem"] = JSON.parse(JSON_string);;
    };

    Acts.prototype.SetupTimeline = function (timeline_objs) {
        var timeline = timeline_objs.getFirstPicked();
        if ((cr.plugins_.Rex_TimeLine) && (timeline instanceof cr.plugins_.Rex_TimeLine.prototype.Instance))
            this.timeline = timeline;
        else
            alert("Scenario should connect to a timeline object");
    };

    Acts.prototype.SetupCallback = function (callback_type) {
        this.c2FnType = (callback_type === 0) ? "c2_callFunction" : "c2_callRexFunction2";
    };

    Acts.prototype.SetDelimiters = function (leftDelimiter, rightDelimiter) {
        this.setDelimiter(leftDelimiter, rightDelimiter);
    };
    //////////////////////////////////////
    // Expressions
    function Exps() {};
    pluginProto.exps = new Exps();

    Exps.prototype.LastTag = function (ret) {
        ret.set_string(this._scenario.GetLastTag());
    };

    Exps.prototype.Mem = function (ret, index) {
        var val = (this._scenario["Mem"].hasOwnProperty(index)) ?
            this._scenario["Mem"][index] : 0;
        ret.set_any(val);
    };

    Exps.prototype.MEMToString = function (ret) {
        ret.set_string(JSON.stringify(this._scenario["Mem"]));
    };

    Exps.prototype.PreviousTag = function (ret) {
        ret.set_string(this._scenario.GetPrevTag());
    };

    Exps.prototype.CurrentTag = Exps.prototype.LastTag;

}());

(function () {
    cr.plugins_.Rex_Scenario.ScenarioKlass = function (plugin) {
        this.plugin = plugin;
        this.isDebugMode = true;
        this.isMustacheMode = false;
        this.isEvalMode = true;
        this.isAccMode = false;
        this.cmdTable = new CmdQueueKlass(this);
        // default is the same as worksheet 
        // -status-
        this.IsRunning = false;
        this.isPaused = false;
        // --------
        this.sn = 0; // serial number of starting
        this.timer = null;
        this.preAbsTime = 0;
        this.offset = 0;
        // for other commands   
        this.extraCmdHandlers = {
            "wait": new CmdWAITKlass(this),
            "time stamp": new CmdTIMESTAMPKlass(this),
            "exit": new CmdEXITKlass(this),
            "tag": new CmdTAGKlass(this),
            "goto": new CmdGOTOKlass(this),
            "if": new CmdIFKlass(this),
            "else if": new CmdELSEIFKlass(this),
            "else": new CmdELSEKlass(this),
            "end if": new CmdENDIFKlass(this),
        };
        // alias
        this.extraCmdHandlers["label"] = this.extraCmdHandlers["tag"];

        // variablies pool
        this["Mem"] = {};
        this.timerSave = null;

        /**BEGIN-PREVIEWONLY**/
        this.debuggerInfo = [];
        /**END-PREVIEWONLY**/
    };
    var ScenarioKlassProto = cr.plugins_.Rex_Scenario.ScenarioKlass.prototype;

    // export methods
    ScenarioKlassProto.Reset = function () {
        //this.cmdTable = new CmdQueueKlass(this);        
        this.Clean();

        // -status-
        this.IsRunning = false;
        this.isPaused = false;
        // --------
        //this.timer = null;        

        this.preAbsTime = 0;
        this.offset = 0;

        // this["Mem"] = {};
        for (var k in this["Mem"])
            delete this["Mem"][k];

        this.timerSave = null;
    };

    ScenarioKlassProto.onDestroy = function () {
        this.Clean();
    };

    ScenarioKlassProto.SetTimescale = function (ts) {
        if (this.timer)
            this.timer.SetTimescale(ts);
    };

    ScenarioKlassProto.Load = function (s, fmt) {
        this.Clean();
        if (s === "")
            return;

        this.cmdTable.Reset();
        this.Append(s, fmt);
    };

    ScenarioKlassProto.Append = function (s, fmt) {
        if (s === "")
            return;

        var arr;
        if (fmt == 0)
            arr = CSVToArray(s);
        else {
            arr = JSON.parse(s);
            if (arr[0].length == null)
                arr = [arr];
        }

        this.removeInvalidCommands(arr);
        this.parseCommands(arr);
        this.cmdTable.Append(arr);
    };

    ScenarioKlassProto.Clean = function () {
        this.Stop();

        // reset all extra cmd handler
        for (var handler in this.extraCmdHandlers)
            this.extraCmdHandlers[handler].onReset();

        this.cmdTable.Clean();
    };

    ScenarioKlassProto.removeInvalidCommands = function (queue) {
        var i, cmd, cnt = queue.length;
        var invalidCmdIndexs = [];
        for (i = 0; i < cnt; i++) {
            cmd = queue[i][0];
            if (this.getCmdType(cmd) === null) {
                // invalid command                
                invalidCmdIndexs.push(i);
                if (this.isDebugMode)
                    log("Scenario: line " + i + " = '" + cmd + "' is not a valid command");
            }
        }

        // remove invalid commands
        cnt = invalidCmdIndexs.length;
        if (cnt != 0) {
            invalidCmdIndexs.reverse();
            for (i = 0; i < cnt; i++)
                queue.splice(invalidCmdIndexs[i], 1);
        }
    };

    ScenarioKlassProto.getCmdType = function (cmd, noEval) {
        if (typeof (cmd) === "number")
            return cmd;
        else if (cmd === "")
            return 0;

        // number: delay command
        if (!isNaN(cmd))
            return parseFloat(cmd);

        // other command types
        if (this.extraCmdHandlers.hasOwnProperty(cmd.toLowerCase()))
            return cmd;

        // eval command
        if (!this.isEvalMode || noEval)
            return null;

        try {
            cmd = this.getParam(cmd);
            return this.getCmdType(cmd, true);
        } catch (err) {
            return null;
        }
    };

    ScenarioKlassProto.parseCommands = function (queue) {
        var i, cnt = queue.length,
            cmdPack, cmd;
        for (i = 0; i < cnt; i++) {
            cmdPack = queue[i];
            cmd = this.getCmdType(cmdPack[0]);
            if (isNaN(cmd)) // might be other command
                this.getCmdHandler(cmd).onParsing(i, cmdPack);
        }
    };

    ScenarioKlassProto.Start = function (offset, tag) {
        // increase sn
        this.sn++;
        if (this.sn === 65535)
            this.sn = 0;
        // increase sn        

        this.IsRunning = true;
        this.isPaused = false;
        this.resetAbsTime();
        if (offset != null)
            this.offset = offset;
        if (this.timer == null) {
            this.timer = this.plugin.getTimeline().CreateTimer(onTimeout);
            this.timer.plugin = this;
        } else
            this.timer.Remove(); // stop timer
        this.cmdTable.Reset();
        var index = this.getCmdHandler("tag").tag2index(tag);
        if (index == null) {
            assert2(index, "Scenario: Could not find tag " + tag);
            return;
        }

        if (this.isDebugMode)
            log("Scenario: Start at tag: " + tag + " , index = " + index);
        this.runNextCmd(index);
    };

    ScenarioKlassProto.Stop = function () {
        this.IsRunning = false;
        this.isPaused = false;
        if (this.timer)
            this.timer.Remove();
    };

    ScenarioKlassProto.getCmdHandler = function (cmd_name) {
        return this.extraCmdHandlers[cmd_name];
    };

    ScenarioKlassProto.GetLastTag = function () {
        return this.getCmdHandler("tag").lastTag;
    };

    ScenarioKlassProto.GetPrevTag = function () {
        return this.getCmdHandler("tag").prevTag;
    };
    ScenarioKlassProto.HasTag = function (tag) {
        return this.getCmdHandler("tag").HasTag(tag);
    };

    // internal methods
    ScenarioKlassProto.resetAbsTime = function () {
        this.preAbsTime = 0;
    };

    ScenarioKlassProto.runNextCmd = function (index) {
        var mysn = this.sn;
        var isContinue = true;
        var cmdPack, cmd;
        while (isContinue) {
            cmdPack = this.cmdTable.get(index);
            index = null;
            if ((cmdPack == null) && (this.cmdTable.queue != null)) {
                this.exit();
                return;
            }
            cmd = this.getCmdType(cmdPack[0]);
            if (!isNaN(cmd))
                isContinue = this.onDelayExecutionCmd(cmd, cmdPack);
            else // might be other command
                isContinue = this.getCmdHandler(cmd.toLowerCase()).onExecuting(cmdPack);

            isContinue = isContinue && (mysn === this.sn);
        }
    };
    ScenarioKlassProto.setTableIndex = function (index) {
        this.cmdTable.currentIndex = index - 1;
    };

    ScenarioKlassProto.exit = function () {
        if (this.isDebugMode)
            log("Scenario: Scenario finished");

        this.IsRunning = false;
        var inst = this.plugin;
        inst.runtime.trigger(cr.plugins_.Rex_Scenario.prototype.cnds.OnCompleted, inst);
    };

    ScenarioKlassProto.pause = function () {
        this.isPaused = true;
        var inst = this.plugin;
        inst.runtime.trigger(cr.plugins_.Rex_Scenario.prototype.cnds.OnWaitingStart, inst);
    };
    ScenarioKlassProto.Resume = function (key) {
        if (!this.IsRunning)
            return;
        if (!this.isPaused)
            return;

        var isUnlocked = this.getCmdHandler("wait").IsKeyMatched(key);
        if (!isUnlocked)
            return;
        this.isPaused = false;
        this.resetAbsTime();
        this.runNextCmd();
    };
    ScenarioKlassProto.IsPaused = function (key) {
        var isKeyMatched = this.getCmdHandler("wait").IsKeyMatched(key);
        return this.isPaused && isKeyMatched;
    };

    ScenarioKlassProto.onTagChanged = function () {
        var inst = this.plugin;
        inst.runtime.trigger(cr.plugins_.Rex_Scenario.prototype.cnds.OnTagChanged, inst);
    };
    ScenarioKlassProto.onDelayExecutionCmd = function (delayT_, cmdPack) {
        var deltaT;
        if (this.isAccMode) {
            var nextAbsTime = delayT_ + this.offset;
            deltaT = nextAbsTime - this.preAbsTime;
            this.preAbsTime = nextAbsTime
        } else
            deltaT = delayT_;

        // get function  name and parameters
        var fnName = cmdPack[1];
        var fnParams = [];
        fnParams.length = cmdPack.length - 2;
        // eval parameters
        var param_cnt = fnParams.length,
            i, param;
        for (i = 0; i < param_cnt; i++) {
            param = cmdPack[i + 2];
            if (param != "") {
                param = this.getParam(param);
            }
            fnParams[i] = param;
        }
        if (deltaT == 0) {
            this.executeC2fn(fnName, fnParams);
        } else {
            this.timer._cb_name = fnName;
            this.timer._cb_params = fnParams;
            this.timer.Start(deltaT);
        }
        return (deltaT == 0); // isContinue
    };

    // call c2fn then return value
    var gC2FnParms = [];
    var _thisArg = null;
    ScenarioKlassProto["_call_c2fn"] = function () {
        var c2FnName = arguments[0];
        var i, cnt = arguments.length;
        for (i = 1; i < cnt; i++) {
            gC2FnParms.push(arguments[i]);
        }
        var retValue = _thisArg._executeC2fn(c2FnName, gC2FnParms);
        gC2FnParms.length = 0;

        return retValue;
    };

    // expression:Call in function object	
    var re = new RegExp("\n", "gm");
    ScenarioKlassProto.getParam = function (param) {
        //debugger

        if (this.isMustacheMode)
            param = this.plugin.render(param, this["Mem"]);

        if (this.isEvalMode) {
            param = param.replace(re, "\\n"); // replace "\n" to "\\n"
            var code_string = "function(scenario)\
            {\
                var MEM = scenario.Mem;\
                var Call = scenario._call_c2fn;\
                return " + param + "\
            }";
            _thisArg = this;

            if (this.isDebugMode) {
                var fn = eval("(" + code_string + ")");
                param = fn(this);
            } else // ignore error
            {
                try {
                    var fn = eval("(" + code_string + ")");
                    param = fn(this);
                } catch (e) {
                    param = 0;
                }
            }
        } else {
            if (!(isNaN(param)))
                param = parseFloat(param);
        }
        return param;
    };

    ScenarioKlassProto.executeC2fn = function (name, params) {
        /**BEGIN-PREVIEWONLY**/
        var debuggerInfo = this.debuggerInfo;
        debuggerInfo.length = 0;
        debuggerInfo.push({
            "name": "Function name",
            "value": name
        });
        var i, cnt = params.length;
        for (i = 0; i < cnt; i++)
            debuggerInfo.push({
                "name": "Parameter " + i,
                "value": params[i]
            });
        /**END-PREVIEWONLY**/

        if (this.isDebugMode)
            log("Scenario: " + name + ":" + params.toString());
        this._executeC2fn(name, params);
    };

    ScenarioKlassProto._executeC2fn = function (name, params) {
        var retValue = this.plugin.RunCallback(name, params);
        return retValue;
    };

    // handler of timeout for timers in this plugin, this=timer   
    var onTimeout = function () {
        this.plugin.delayExecuteC2fn(this._cb_name, this._cb_params);
    };

    ScenarioKlassProto.delayExecuteC2fn = function (name, params) {
        this.executeC2fn(name, params);
        this.runNextCmd();
    };

    ScenarioKlassProto.saveToJSON = function () {
        var timerSave = null;
        if (this.timer != null) {
            timerSave = this.timer.saveToJSON();
            timerSave["__cbargs"] = [this.timer._cb_name, this.timer._cb_params]; // compatiable
        }
        return {
            "q": this.cmdTable.saveToJSON(),
            "isrun": this.IsRunning,
            "isp": this.isPaused,
            "tim": timerSave,
            "pa": this.preAbsTime,
            "off": this.offset,
            "mem": this["Mem"],
            "CmdENDIF": this.getCmdHandler("end if").saveToJSON(),
        };
    };
    ScenarioKlassProto.loadFromJSON = function (o) {
        this.cmdTable.loadFromJSON(o["q"]);
        this.IsRunning = o["isrun"];
        this.isPaused = o["isp"];
        this.timerSave = o["tim"];
        this.preAbsTime = o["pa"];
        this.offset = o["off"];
        this["Mem"] = o["mem"];
        if (o["CmdENDIF"])
            this.getCmdHandler("end if").loadFromJSON(o["CmdENDIF"]);
    };
    ScenarioKlassProto.afterLoad = function () {
        if (this.timerSave != null) {
            var timeline = this.plugin.getTimeline();
            this.timer = timeline.LoadTimer(this.timerSave, onTimeout);
            this.timer.plugin = this;
            this.timer._cb_name = this.timerSave["__cbargs"][0];
            this.timer._cb_params = this.timerSave["__cbargs"][1];
            this.timerSave = null;
        }
    };

    // CmdQueueKlass
    var CmdQueueKlass = function (scenario, queue) {
        this.scenario = scenario;
        this.queue = null;
        this.Reset(queue);
    };
    var CmdQueueKlassProto = CmdQueueKlass.prototype;

    CmdQueueKlassProto.Reset = function (queue) {
        this.currentIndex = -1;
        if (queue)
            this.queue = queue;
    };

    CmdQueueKlassProto.Append = function (queue) {
        if (!queue)
            return;

        if (!this.queue)
            this.queue = [];

        var i, cnt = queue.length;
        for (i = 0; i < cnt; i++) {
            this.queue.push(queue[i]);
        }
    };
    CmdQueueKlassProto.Clean = function () {
        this.currentIndex = -1;

        if (this.queue)
            this.queue.length = 0;
    };

    CmdQueueKlassProto.get = function (index) {
        if (index == null)
            index = this.currentIndex + 1;
        var cmd = this.queue[index];
        if (this.scenario.isDebugMode)
            log("Scenario: Get command from index = " + index);

        this.currentIndex = index;
        return cmd;
    };
    CmdQueueKlassProto.saveToJSON = function () {
        return {
            "q": this.queue,
            "i": this.currentIndex,
        };
    };
    CmdQueueKlassProto.loadFromJSON = function (o) {
        this.queue = o["q"];
        this.currentIndex = o["i"];

        if (this.scenario.isDebugMode)
            log("Scenario: Load, start at index = " + this.currentIndex);
    };

    // extra command : WAIT
    var CmdWAITKlass = function (scenario) {
        this.locked = null;
        this.scenario = scenario;
    };
    var CmdWAITKlassProto = CmdWAITKlass.prototype;
    CmdWAITKlassProto.onReset = function () {};
    CmdWAITKlassProto.onParsing = function (index, cmdPack) {};
    CmdWAITKlassProto.onExecuting = function (cmdPack) {
        var locked = cmdPack[1];
        if ((locked != null) && (locked !== ""))
            this.locked = this.scenario.getParam(locked);
        else
            this.locked = "";

        /**BEGIN-PREVIEWONLY**/
        var debuggerInfo = this.scenario.debuggerInfo;
        debuggerInfo.length = 0;
        debuggerInfo.push({
            "name": "WAIT",
            "value": this.locked
        });
        /**END-PREVIEWONLY**/

        if (this.scenario.isDebugMode)
            log("Scenario: WAIT " + this.locked);

        this.scenario.pause();
        return false; // isContinue
    };
    CmdWAITKlassProto.IsKeyMatched = function (key) {
        if (key == null) // null could unlock all
            return true;

        return (key == this.locked)
    };

    // extra command : TIMESTAMP
    var CmdTIMESTAMPKlass = function (scenario) {
        this.scenario = scenario;
    };
    var CmdTIMESTAMPKlassProto = CmdTIMESTAMPKlass.prototype;
    CmdTIMESTAMPKlassProto.onReset = function () {};
    CmdTIMESTAMPKlassProto.onParsing = function (index, cmdPack) {};
    CmdTIMESTAMPKlassProto.onExecuting = function (cmdPack) {
        var mode = cmdPack[1].toLowerCase().substring(0, 4);
        this.scenario.plugin.isAccMode = (mode == "acc");
        return true; // isContinue
    };

    // extra command : EXIT
    var CmdEXITKlass = function (scenario) {
        this.scenario = scenario;
    };
    var CmdEXITKlassProto = CmdEXITKlass.prototype;
    CmdEXITKlassProto.onReset = function () {};
    CmdEXITKlassProto.onParsing = function (index, cmdPack) {};
    CmdEXITKlassProto.onExecuting = function (cmdPack) {
        /**BEGIN-PREVIEWONLY**/
        var debuggerInfo = this.scenario.debuggerInfo;
        debuggerInfo.length = 0;
        debuggerInfo.push({
            "name": "EXIT",
            "value": ""
        });
        /**END-PREVIEWONLY**/

        if (this.scenario.isDebugMode)
            log("Scenario: EXIT");
        this.scenario.exit();
        return false; // isContinue
    };

    // extra command : TAG (alias: LABEL)
    var CmdTAGKlass = function (scenario) {
        this.scenario = scenario;
        this.tag2indexMap = {};
        this.prevTag = "";
        this.lastTag = "";
    };
    var CmdTAGKlassProto = CmdTAGKlass.prototype;
    CmdTAGKlassProto.onReset = function () {
        var t;
        for (t in this.tag2indexMap)
            delete this.tag2indexMap[t];

        this.prevTag = "";
        this.lastTag = "";
    };
    CmdTAGKlassProto.onParsing = function (index, cmdPack) {
        var tag = cmdPack[1];
        this.checkTag(index, tag);
        this.tag2indexMap[tag] = index;
    };
    CmdTAGKlassProto.onExecuting = function (cmdPack) {
        if (this.scenario.isDebugMode)
            log("Scenario: TAG " + cmdPack[1]);

        this.prevTag = this.lastTag;
        this.lastTag = cmdPack[1];
        this.scenario.resetAbsTime();
        this.scenario.onTagChanged();
        return true; // isContinue
    };
    CmdTAGKlassProto.checkTag = function (index, tag) {
        // check if tag had not been repeated 
        var newTag = (this.tag2indexMap[tag] == null);
        assert2(newTag, "Scenario: line " + index + " , Tag " + tag + " was existed.");

        // check if tag was not in if-block
        var CmdENDIF = this.scenario.getCmdHandler("end if");
        var isnot_in_ifblock = !(CmdENDIF.IsNotInIFblock());
        assert2(isnot_in_ifblock, "Scenario: line " + index + " , Tag " + tag + " is in if-block.");
    };
    CmdTAGKlassProto.tag2index = function (tag) {
        var index = this.tag2indexMap[tag];
        if ((tag == "") && (index == null))
            index = 0;
        return index;
    };
    CmdTAGKlassProto.HasTag = function (tag) {
        return (this.tag2indexMap[tag] != null);
    };

    // extra command : GOTO    
    var CmdGOTOKlass = function (scenario) {
        this.scenario = scenario;
    };
    var CmdGOTOKlassProto = CmdGOTOKlass.prototype;
    CmdGOTOKlassProto.onReset = function () {};
    CmdGOTOKlassProto.onParsing = function (index, cmdPack) {};
    CmdGOTOKlassProto.onExecuting = function (cmdPack) {
        if (this.scenario.isDebugMode)
            log("Scenario: GOTO tag " + cmdPack[1]);

        var tag = this.scenario.getParam(cmdPack[1]);
        var index = this.scenario.getCmdHandler("tag").tag2index(tag);
        if (index == null) {
            assert2(index, "Scenario: Could not find tag " + tag);
            return;
        }
        this.scenario.setTableIndex(index);
        this.scenario.resetAbsTime();
        return true; // isContinue
    };

    var INDEX_NEXTIF = 2;
    var INDEX_ENDIF = 3;
    // extra command : IF
    var CmdIFKlass = function (scenario) {
        this.scenario = scenario;
    };
    var CmdIFKlassProto = CmdIFKlass.prototype;
    CmdIFKlassProto.onReset = function () {};
    CmdIFKlassProto.onParsing = function (index, cmdPack) {
        var CmdENDIF = this.scenario.getCmdHandler("end if");
        CmdENDIF.SetIFblockEnable(index);
        CmdENDIF.pushIFCmd(index, cmdPack);
    };
    CmdIFKlassProto.onExecuting = function (cmdPack) {
        if (this.scenario.isDebugMode)
            log("Scenario: IF " + cmdPack[1]);

        var cond = this.scenario.getParam(cmdPack[1]);
        var CmdENDIF = this.scenario.getCmdHandler("end if");
        CmdENDIF.goToEndFlag = cond;
        if (cond) {
            // goto next line
            this.scenario.resetAbsTime();
            return true; // isContinue    
        } else {
            // goto next if line , or end if line
            var index = cmdPack[INDEX_NEXTIF];
            if (index == null)
                index = cmdPack[INDEX_ENDIF];
            assert2(index, "Scenario: Error at IF block, line " + index);
            this.scenario.setTableIndex(index);
            this.scenario.resetAbsTime();
            return true; // isContinue 
        }
    };

    // extra command : ELSE IF
    var CmdELSEIFKlass = function (scenario) {
        this.scenario = scenario;
    };
    var CmdELSEIFKlassProto = CmdELSEIFKlass.prototype;
    CmdELSEIFKlassProto.onReset = function () {};
    CmdELSEIFKlassProto.onParsing = function (index, cmdPack) {
        var CmdENDIF = this.scenario.getCmdHandler("end if");
        CmdENDIF.pushIFCmd(index, cmdPack);
    };
    CmdELSEIFKlassProto.onExecuting = function (cmdPack) {
        if (this.scenario.isDebugMode)
            log("Scenario: ELSE IF " + cmdPack[1]);

        // go to end
        var goToEndFlag = this.scenario.getCmdHandler("end if").goToEndFlag;
        if (goToEndFlag) {
            var index = cmdPack[INDEX_ENDIF];
            assert2(index, "Scenario: Error at IF block, line " + index);
            this.scenario.setTableIndex(index);
            this.scenario.resetAbsTime();
            return true; // isContinue 
        }

        // test condition
        var cond = this.scenario.getParam(cmdPack[1]);
        var CmdENDIF = this.scenario.getCmdHandler("end if");
        CmdENDIF.goToEndFlag = cond;
        if (cond) {
            // goto next line
            this.scenario.resetAbsTime();
            return true; // isContinue    
        } else {
            // goto next if line , or end if line
            var index = cmdPack[INDEX_NEXTIF];
            if (index == null)
                index = cmdPack[INDEX_ENDIF];
            assert2(index, "Scenario: Error at IF block, line " + index);
            this.scenario.setTableIndex(index);
            this.scenario.resetAbsTime();
            return true; // isContinue 
        }
    };

    // extra command : ELSE
    var CmdELSEKlass = function (scenario) {
        this.scenario = scenario;
    };
    var CmdELSEKlassProto = CmdELSEKlass.prototype;
    CmdELSEKlassProto.onReset = function () {};
    CmdELSEKlassProto.onParsing = function (index, cmdPack) {
        var CmdENDIF = this.scenario.getCmdHandler("end if");
        CmdENDIF.pushIFCmd(index, cmdPack);
    };
    CmdELSEKlassProto.onExecuting = function (cmdPack) {
        if (this.scenario.isDebugMode)
            log("Scenario: ELSE");

        // go to end
        var goToEndFlag = this.scenario.getCmdHandler("end if").goToEndFlag;
        if (goToEndFlag) {
            var index = cmdPack[INDEX_ENDIF];
            assert2(index, "Scenario: Error at IF block, line " + index);
            this.scenario.setTableIndex(index);
            this.scenario.resetAbsTime();
            return true; // isContinue 
        }

        // goto next line
        this.scenario.resetAbsTime();
        return true; // isContinue  
    };

    // extra command : ENDIF
    var CmdENDIFKlass = function (scenario) {
        this.scenario = scenario;
        // onParsing
        this.penddingEnable = false;
        this.penddingCmds = [];
        // onExecuting
        this.goToEndFlag = false;
    };
    var CmdENDIFKlassProto = CmdENDIFKlass.prototype;
    CmdENDIFKlassProto.onReset = function () {
        this.penddingCmds.length = 0;
        this.goToEndFlag = false;
    };
    CmdENDIFKlassProto.onParsing = function (index, cmdPack) {
        assert2(this.penddingEnable, "Scenario: Error at IF block, line " + index);
        var i, cnt = this.penddingCmds.length;
        for (i = 0; i < cnt; i++) {
            this.penddingCmds[i][INDEX_ENDIF] = index;
        }
        this.penddingCmds.length = 0;
        this.penddingEnable = false;
    };
    CmdENDIFKlassProto.onExecuting = function (cmdPack) {
        if (this.scenario.isDebugMode)
            log("Scenario: END IF ");

        this.goToEndFlag = false;
        // goto next line
        this.scenario.resetAbsTime();
        return true; // isContinue        
    };
    CmdENDIFKlassProto.SetIFblockEnable = function (index) {
        assert2(!this.penddingEnable, "Scenario: Error at IF block, line " + index);
        this.penddingEnable = true;
    };
    CmdENDIFKlassProto.IsNotInIFblock = function () {
        return this.penddingEnable;
    };
    CmdENDIFKlassProto.pushIFCmd = function (index, cmdPack) {
        assert2(this.penddingEnable, "Scenario: Error at IF block, line " + index);
        cmdPack.length = 4; // [if , cond, next_if_line, end_if_line]
        cmdPack[INDEX_NEXTIF] = null;
        cmdPack[INDEX_ENDIF] = null;
        if (this.penddingCmds.length >= 1) {
            // assign index of next if line
            var pre_cmd_pack = this.penddingCmds[this.penddingCmds.length - 1];
            pre_cmd_pack[INDEX_NEXTIF] = index;
        }
        this.penddingCmds.push(cmdPack);
    };
    CmdENDIFKlassProto.saveToJSON = function () {
        return {
            "gef": this.goToEndFlag
        };
    };
    CmdENDIFKlassProto.loadFromJSON = function (o) {
        this.goToEndFlag = o["gef"];
    };

    // template
    //var CmdHandlerKlass = function(scenario) {};
    //var CmdHandlerKlassProto = CmdHandlerKlass.prototype;    
    //CmdHandlerKlassProto.onReset = function() {};
    //CmdHandlerKlassProto.onParsing = function(index, cmdPack) {};
    //CmdHandlerKlassProto.onExecuting = function(cmdPack) {};


    // copy from    
    // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm

    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    var CSVToArray = function (strData, strDelimiter) {
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
        );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [
            []
        ];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
            ) {

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);

            }


            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                var strMatchedValue = arrMatches[2].replace(
                    new RegExp("\"\"", "g"),
                    "\""
                );

            } else {

                // We found a non-quoted value.
                var strMatchedValue = arrMatches[3];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
        }

        // Return the parsed data.
        return (arrData);
    };
}());