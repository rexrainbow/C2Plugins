/*
- counter value
*/
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Firebase_CurTime = function (runtime) {
    this.runtime = runtime;
};

(function () {
    var pluginProto = cr.plugins_.Rex_Firebase_CurTime.prototype;

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

    instanceProto.onCreate = function () {
        this.rootpath = this.properties[0] + "/" + this.properties[1] + "/";
        this.updatingPeriod = this.properties[2];  // seconds
        this.timestamp_ref = null;
        this.lastServerTimestamp = null;
        this.lastLocalTimestamp = null;
        this.lastPredictErr = 0;
    };

    instanceProto.onDestroy = function () {
    };

    // 2.x , 3.x    
    var isFirebase3x = function () {
        return (window["FirebaseV3x"] === true);
    };

    var isFullPath = function (p) {
        return (p.substring(0, 8) === "https://");
    };

    instanceProto.get_ref = function (k) {
        if (k == null)
            k = "";
        var path;
        if (isFullPath(k))
            path = k;
        else
            path = this.rootpath + k + "/";

        // 2.x
        if (!isFirebase3x()) {
            return new window["Firebase"](path);
        }

        // 3.x
        else {
            var fnName = (isFullPath(path)) ? "refFromURL" : "ref";
            return window["Firebase"]["database"]()[fnName](path);
        }

    };

    var get_key = function (obj) {
        return (!isFirebase3x()) ? obj["key"]() : obj["key"];
    };

    var get_refPath = function (obj) {
        return (!isFirebase3x()) ? obj["ref"]() : obj["ref"];
    };

    var get_root = function (obj) {
        return (!isFirebase3x()) ? obj["root"]() : obj["root"];
    };

    var serverTimeStamp = function () {
        if (!isFirebase3x())
            return window["Firebase"]["ServerValue"]["TIMESTAMP"];
        else
            return window["Firebase"]["database"]["ServerValue"];
    };

    var get_timestamp = function (obj) {
        return (!isFirebase3x()) ? obj : obj["TIMESTAMP"];
    };
    // 2.x , 3.x  

    // export
    instanceProto.UpdatingTimestamp = function (onComplete) {
        var self = this;
        var onRead = function (snapshot) {
            var ts = snapshot["val"]();
            if (ts != null) {
                ts = get_timestamp(ts);
                var isFirstUpdating = (self.lastServerTimestamp === null);
                if (!isFirstUpdating) {
                    var predictTS = self.getCurTimestamp();
                    self.lastPredictErr = (ts - predictTS) / 1000;
                }
                else {
                    self.lastPredictErr = 0;
                }
                self.lastServerTimestamp = ts;

                if (onComplete)
                    onComplete(self.lastServerTimestamp);
                else if (isFirstUpdating)
                    self.runtime.trigger(cr.plugins_.Rex_Firebase_CurTime.prototype.cnds.OnStart, self);
            }
            else  // run again
                setTimeout(function () {
                    self.UpdatingTimestamp();
                }, 0);
        };
        var onWrite = function (error) {
            if (!error)
                self.timestamp_ref["once"]("value", onRead);
            else  // run again
                setTimeout(function () {
                    self.UpdatingTimestamp();
                }, 0);
        };
        this.timestamp_ref["set"](serverTimeStamp(), onWrite);
    };

    instanceProto.getCurTimestamp = function () {
        var ts;
        if (this.lastServerTimestamp == null) {
            ts = 0;  // invalid
        }
        if (this.lastLocalTimestamp == null) {
            ts = this.lastServerTimestamp;
        }
        else {
            var curLocalTS = (new Date()).getTime();
            var dt = curLocalTS - this.lastLocalTimestamp;
            ts = this.lastServerTimestamp + dt;
        }
        return ts;
    };
    // export

    /**BEGIN-PREVIEWONLY**/
    instanceProto.getDebuggerValues = function (propsections) {
        var curDate;
        if (this.lastServerTimestamp !== null)
            curDate = (new Date(this.lastServerTimestamp)).toLocaleString();
        else
            curDate = " - ";

        propsections.push({
            "title": this.type.name,
            "properties": [
                { "name": "Current date", "value": curDate },
                { "name": "Last predicted error", "value": this.lastPredictErr },
            ]
        });
    };
    /**END-PREVIEWONLY**/
    //////////////////////////////////////
    // Conditions
    function Cnds() { };
    pluginProto.cnds = new Cnds();

    Cnds.prototype.IsUpdating = function () {
        return (this.lastServerTimestamp != null);
    };

    Cnds.prototype.OnStart = function () {
        return true;
    };

    //////////////////////////////////////
    // Actions
    function Acts() { };
    pluginProto.acts = new Acts();

    Acts.prototype.SetDomainRef = function (domain_ref, sub_domain_ref) {
        this.rootpath = domain_ref + "/" + sub_domain_ref + "/";
    };

    Acts.prototype.Start = function (userID) {
        this.timestamp_ref = this.get_ref(userID);
        var self = this;
        setInterval(function () {
            self.UpdatingTimestamp();
        }, self.updatingPeriod);
    };

    Acts.prototype.Stop = function () {
        this.timestamp_ref = null;
        this.lastServerTimestamp = null;
    };

    //////////////////////////////////////
    // Expressions
    function Exps() { };
    pluginProto.exps = new Exps();

    Exps.prototype.Timestamp = function (ret) {
        ret.set_int(Math.floor(this.getCurTimestamp()));
    };

    Exps.prototype.LastPredictedError = function (ret) {
        ret.set_float(this.lastPredictErr);
    };
}());