// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_jsshell = function (runtime) {
    this.runtime = runtime;
};

(function () {
    var pluginProto = cr.plugins_.Rex_jsshell.prototype;

    /////////////////////////////////////
    // Object type class
    pluginProto.Type = function (plugin) {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };

    var typeProto = pluginProto.Type.prototype;

    typeProto.onCreate = function () {
    };

    /////////////////////////////////////
    // Instance class
    pluginProto.Instance = function (type) {
        this.type = type;
        this.runtime = type.runtime;
    };

    var instanceProto = pluginProto.Instance.prototype;

    var callItem = function () {
        this.name = "";
        this.retVal = 0;
        this.params = [];
    };
    var callbackItem = function () {
        this.params = [];
    };

    instanceProto.onCreate = function () {
        this.callStack = new StackKlass(callItem);

        // c2 function
        this.c2FnType = null;

        // callback
        this.callbackStack = new StackKlass(callbackItem);
        var self = this;
        this.getCallback = function (callbackTag) {
            if (callbackTag == null)
                return null;

            var cb = function () {
                self.callbackStack.push();
                var lastCall = self.callbackStack.getCurrent();
                cr.shallowAssignArray(lastCall.params, arguments);
                self.callbackTag = callbackTag;
                self.runtime.trigger(cr.plugins_.Rex_jsshell.prototype.cnds.OnCallback, self);
                lastCall.params.length = 0;
                self.callbackStack.pop();
            }
            return cb;
        };

        this.getC2FnCallback = function (c2FunctionName) {
            if (c2FunctionName == null)
                return null;

            var cb = function () {
                self.callC2Fn(c2FunctionName, arguments);
            }
            return cb;
        };
    };

    instanceProto.onDestroy = function () {
    };

    instanceProto.LoadAPI = function (src, onloadCb, onerrorCb) {
        var scripts = document.getElementsByTagName("script");
        var exist = false;
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src.indexOf(src) != -1) {
                exist = true;
                break;
            }
        }
        if (!exist) {
            var newScriptTag = document.createElement("script");
            newScriptTag["type"] = "text/javascript";
            newScriptTag["src"] = src;

            // onLoad callback
            var self = this;
            var onLoad = function () {
                self.isLoaded = true;
                if (onloadCb)
                    onloadCb();
            };
            var onError = function () {
                if (onerrorCb)
                    onerrorCb();
            };
            newScriptTag["onload"] = onLoad;
            newScriptTag["onerror"] = onError;
            document.getElementsByTagName("head")[0].appendChild(newScriptTag);
        }
    };

    instanceProto.getC2FnType = function () {
        if (this.c2FnType === null) {
            if (window["c2_callRexFunction2"])
                this.c2FnType = "c2_callRexFunction2";
            else if (window["c2_callFunction"])
                this.c2FnType = "c2_callFunction";
            else
                this.c2FnType = "";
        }
        return this.c2FnType;
    };

    instanceProto.callC2Fn = function (c2FnName, params) {
        var c2FnGlobalName = this.getC2FnType();
        if (c2FnGlobalName === "")
            return 0;

        var i, cnt = params.length;
        for (i = 0; i < cnt; i++) {
            params[i] = din(params[i]);
        }
        var retValue = window[c2FnGlobalName](c2FnName, params);
        return retValue;
    };

    var invokeFunction = function (functionName, params, isNewObject) {
        var names = functionName.split(".");
        var fnName = names.pop();
        var o = getValue(names, window);
        if (!o) {
            log("JSSH: Can not get function " + functionName);
            return;
        }

        var retValue;
        if (isNewObject) {
            params.unshift(null);
            retValue = new (Function.prototype.bind.apply(o[fnName], params));
        }
        else {
            retValue = o[fnName].apply(o, params);
        }
        return retValue;
    };
    //////////////////////////////////////
    // Conditions
    function Cnds() { };
    pluginProto.cnds = new Cnds();

    Cnds.prototype.OnCallback = function (tag) {
        return cr.equals_nocase(tag, this.callbackTag);
    };
    //////////////////////////////////////
    // Actions
    function Acts() { };
    pluginProto.acts = new Acts();

    Acts.prototype.InvokeFunction = function (varName) {
        var lastCall = this.callStack.getCurrent();
        this.callStack.pop();

        var params = lastCall.params;
        lastCall.params = [];
        lastCall.retVal = invokeFunction(lastCall.name, params);
        if (varName !== "") {
            setValue(varName, lastCall.retVal, window);
        }
    };

    Acts.prototype.CreateInstance = function (varName) {
        if (varName === "")
            return;
        var lastCall = this.callStack.getCurrent();
        this.callStack.pop();

        var params = lastCall.params;
        lastCall.params = [];
        var o = invokeFunction(lastCall.name, params, true);
        setValue(varName, o, window);
    };

    Acts.prototype.SetFunctionName = function (name) {
        this.callStack.push();
        var lastCall = this.callStack.getCurrent();
        lastCall.name = name;
        lastCall.retVal = 0;
    };

    Acts.prototype.AddValue = function (v) {
        var lastCall = this.callStack.getCurrent();
        lastCall.params.push(v);
    };

    Acts.prototype.AddJSON = function (v) {
        var lastCall = this.callStack.getCurrent();
        lastCall.params.push(JSON.parse(v));
    };

    Acts.prototype.AddBoolean = function (v) {
        var lastCall = this.callStack.getCurrent();
        lastCall.params.push(v === 1);
    };

    Acts.prototype.AddCallback = function (callbackTag) {
        var lastCall = this.callStack.getCurrent();
        lastCall.params.push(this.getCallback(callbackTag));
    };

    Acts.prototype.AddNull = function () {
        var lastCall = this.callStack.getCurrent();
        lastCall.params.push(null);
    };

    Acts.prototype.AddObject = function (varName) {
        var lastCall = this.callStack.getCurrent();
        lastCall.params.push(getValue(varName, window));
    };

    Acts.prototype.AddC2Callback = function (c2FnName) {
        var lastCall = this.callStack.getCurrent();
        lastCall.params.push(this.getC2FnCallback(c2FnName));
    };

    Acts.prototype.SetProp = function (varName, value) {
        setValue(varName, value, window);
    };

    Acts.prototype.LoadAPI = function (src, successTag, errorTag) {
        this.LoadAPI(src, this.getCallback(successTag), this.getCallback(errorTag));
    };
    //////////////////////////////////////
    // Expressions
    function Exps() { };
    pluginProto.exps = new Exps();

    Exps.prototype.Param = function (ret, index, keys, defaultValue) {
        var params = this.callbackStack.getCurrent().params;
        var val = params[index];
        if (typeof (keys) === "number") {
            keys = [keys];
        }
        ret.set_any(getItemValue(val, keys, defaultValue));
    };

    Exps.prototype.ParamCount = function (ret) {
        var params = this.callbackStack.getCurrent().params;
        ret.set_int(params.length);
    };

    Exps.prototype.ReturnValue = function (ret, keys, defaultValue) {
        if (typeof (keys) === "number") {
            keys = [keys];
        }
        var preCall = this.callStack.getOneAbove();
        ret.set_any(getItemValue(preCall.retVal, keys, defaultValue));
    };

    Exps.prototype.Prop = function (ret, keys, defaultValue) {
        ret.set_any(getItemValue(window, keys, defaultValue));
    };

    var PARAMTYPE_VALUE = 0;
    var PARAMTYPE_JSON = 1;
    var PARAMTYPE_CALLBACK = 2;
    var PARAMTYPE_VAR = 3;
    var PARAMTYPE_C2FN = 4;
    var gExpPattern = /^@#@(\[.*\])@#@/;
    Exps.prototype.Call = function (ret, functionName) {
        this.callStack.push();
        var lastCall = this.callStack.getCurrent();
        var params = [];
        var i, cnt = arguments.length;
        for (i = 2; i < cnt; i++) {
            var param = arguments[i];
            if ((typeof (param) === "string") && (gExpPattern.test(param))) {
                param = param.match(gExpPattern)[1];
                param = JSON.parse(param);
                switch (param[0]) {
                    case PARAMTYPE_VALUE: param = param[1]; break;
                    case PARAMTYPE_JSON: param = param[1]; break;
                    case PARAMTYPE_CALLBACK: param = this.getCallback(param[1]); break;
                    case PARAMTYPE_VAR: param = getValue(param[1], window); break;
                    case PARAMTYPE_C2FN: param = this.getC2FnCallback(param[1]); break;
                    default: param = null;
                }
            }
            params.push(param);
        }
        lastCall.retVal = invokeFunction(functionName, params);
        ret.set_any(din(lastCall.retVal));
    };

    Exps.prototype.ValueParam = function (ret, value) {
        var param = [PARAMTYPE_VALUE, value];
        param = "@#@" + JSON.stringify(param) + "@#@";
        ret.set_string(param);
    };

    Exps.prototype.JSONParam = function (ret, s) {
        var param = [PARAMTYPE_JSON, JSON.parse(s)];
        param = "@#@" + JSON.stringify(param) + "@#@";
        ret.set_string(param);
    };

    Exps.prototype.BooleanParam = function (ret, b) {
        var param = [PARAMTYPE_VALUE, (b === 1)];
        param = "@#@" + JSON.stringify(param) + "@#@";
        ret.set_string(param);
    };

    Exps.prototype.CallbackParam = function (ret, fnName) {
        var param = [PARAMTYPE_CALLBACK, fnName];
        param = "@#@" + JSON.stringify(param) + "@#@";
        ret.set_string(param);
    };

    Exps.prototype.NullParam = function (ret) {
        var param = [PARAMTYPE_VALUE, null];
        param = "@#@" + JSON.stringify(param) + "@#@";
        ret.set_string(param);
    };

    Exps.prototype.ObjectParam = function (ret, varName) {
        var param = [PARAMTYPE_VAR, varName];
        param = "@#@" + JSON.stringify(param) + "@#@";
        ret.set_string(param);
    };

    Exps.prototype.C2FnParam = function (ret, fnName) {
        var param = [PARAMTYPE_C2FN, fnName];
        param = "@#@" + JSON.stringify(param) + "@#@";
        ret.set_string(param);
    };

    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------    
    // ------------------------------------------------------------------------   	

    var getValue = function (keys, root) {
        if ((keys == null) || (keys === "") || (keys.length === 0)) {
            return root;
        }
        else {
            if (typeof (keys) === "string")
                keys = keys.split(".");

            var i, cnt = keys.length, key;
            var entry = root;
            for (i = 0; i < cnt; i++) {
                key = keys[i];

                if (key in entry) {
                    entry = entry[key];
                } else {
                    log("JSSH: Can not find property " + keys);
                    return;
                }
            }
            return entry;
        }
    };


    var getEntry = function (keys, root, defaultEntry) {
        var entry = root;
        if ((keys === "") || (keys.length === 0)) {
            //entry = root;
        }
        else {
            if (typeof (keys) === "string")
                keys = keys.split(".");

            var i, cnt = keys.length, key;
            for (i = 0; i < cnt; i++) {
                key = keys[i];
                if ((entry[key] == null) || (typeof (entry[key]) !== "object")) {
                    var newEntry;
                    if (i === cnt - 1) {
                        newEntry = defaultEntry || {};
                    }
                    else {
                        newEntry = {};
                    }

                    entry[key] = newEntry;
                }

                entry = entry[key];
            }
        }

        return entry;
    };

    var setValue = function (keys, value, root) {
        if ((keys === "") || (keys.length === 0)) {
            if ((value !== null) && typeof (value) === "object") {
                root = value;
            }
        }
        else {
            if (typeof (keys) === "string")
                keys = keys.split(".");

            var lastKey = keys.pop();
            var entry = getEntry(keys, root);
            entry[lastKey] = value;
        }
    };

    var getItemValue = function (item, k, defaultValue) {
        return din(getValue(k, item), defaultValue);
    };

    var din = function (d, defaultValue) {
        var o;
        if (d === true)
            o = 1;
        else if (d === false)
            o = 0;
        else if (d == null) {
            if (defaultValue != null)
                o = defaultValue;
            else
                o = 0;
        }
        else if (typeof (d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
        return o;
    };

    // call stack
    var StackKlass = function (itemCb) {
        this.items = [];
        this.ptr = -1;
        this.itemCb = itemCb;
    };
    var StackKlassProto = StackKlass.prototype;

    StackKlassProto.getCurrent = function () {
        if (this.ptr < 0)
            return null;

        return this.items[this.ptr];
    };

    StackKlassProto.getOneAbove = function () {
        if (this.items.length == 0)
            return null;

        var i = this.ptr + 1;

        if (i >= this.items.length)
            i = this.items.length - 1;

        return this.items[i];
    };

    // push then set
    StackKlassProto.push = function () {
        this.ptr++;

        if (this.ptr === this.items.length) {
            this.items.push(new this.itemCb());
        }

        return this.items[this.ptr];
    };

    // get then pop
    StackKlassProto.pop = function () {
        assert2(this.ptr >= 0, "Popping empty stack");

        this.ptr--;
    };

}());