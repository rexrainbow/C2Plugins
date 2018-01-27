// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Tilt2ArrowKey = function (runtime) {
    this.runtime = runtime;
};

(function () {
    var pluginProto = cr.plugins_.Rex_Tilt2ArrowKey.prototype;

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
        this.initCalibrationMode = this.properties[0];
        this.directions = this.properties[1];
        this.sensitivity = this.properties[2];
        this.runtime.tickMe(this);

        this.setupStage = true;
        this.touchwrap = null;
        this.GetBetaFn = null;
        this.GetGammaFn = null;
        this.degree_ZEROUD = 0;
        this.degree_ZEROLR = 0;
        this.degree_diffUD = 0;
        this.degree_diffLR = 0;
        this.keyUD = 0; // 0=no key, 1=up key, 2=down key 
        this.keyLR = 0; // 0=no key, 1=left key, 2=right key 
        this.previousOrientation = 0;
        this.isAnyPressed = false;
    };

    instanceProto.TouchWrapGet = function () {
        var plugins = this.runtime.types;
        var name, obj;
        for (name in plugins) {
            obj = plugins[name].instances[0];
            if ((obj != null) && (obj.check_name == "TOUCHWRAP")) {
                this.touchwrap = obj;
                this.GetBetaFn = cr.plugins_.rex_TouchWrap.prototype.exps.Beta;
                this.GetGammaFn = cr.plugins_.rex_TouchWrap.prototype.exps.Gamma;
                this.touchwrap.HookMe(this);
                break;
            }
        }
    };

    instanceProto.tick = function () {
        this.setup();
        this.tilt2arrowkey();
    };

    var getOrientation = function () {
        var ret = window["orientation"];
        if (ret == null)
            ret = 0;
        return ret;
    };

    instanceProto.getBeta = function () {
        var touch_obj = this.touchwrap;
        this.GetBetaFn.call(touch_obj, touch_obj.fake_ret);
        return touch_obj.fake_ret.value;
    };

    instanceProto.getGamma = function () {
        var touch_obj = this.touchwrap;
        this.GetGammaFn.call(touch_obj, touch_obj.fake_ret);
        return touch_obj.fake_ret.value;
    };

    instanceProto.setup = function () {
        if (!this.setupStage)
            return;

        this.TouchWrapGet();
        if (this.touchwrap == null)
            assert("Tilt to Arrowkey: No Touchwrap object found.");
        else {
            if (this.initCalibrationMode == 0) // 0
                this.setDegree_ZERO(0, 0);
            else // current angle
                this.setDegree_ZERO();
        }

        this.setupStage = false;
    };

    instanceProto.setDegree_ZERO = function (ZERO_UD, ZERO_LR) {
        var is_landspcape = (Math.abs(getOrientation()) == 90);
        if (ZERO_UD == null) {
            ZERO_UD = (is_landspcape) ?
                this.getGamma() : this.getBeta();
        }
        if (ZERO_LR == null) {
            ZERO_LR = (is_landspcape) ?
                this.getBeta() : this.getGamma();
        }
        this.degree_ZEROUD = ZERO_UD;
        this.degree_ZEROLR = ZERO_LR;
    };

    instanceProto._diffUD_get = function (orientation) {
        var diff;
        switch (orientation) {
            case 0: // U:b+ , D:b-
                diff = -this.getBeta() + this.degree_ZEROUD;
                break;
            case 90: // U:g- , D:g+
                diff = this.getGamma() - this.degree_ZEROUD;
                break;
            case 180: // U:b- , D:b+
                diff = this.getBeta() - this.degree_ZEROUD;
                break;
            case -90: // U:g+ , D:g-
                diff = -this.getGamma() + this.degree_ZEROUD;
                break;
        }
        return diff;
    };
    instanceProto._diffLR_get = function (orientation) {
        var diff;
        switch (orientation) {
            case 0: // L:g+ , R:g-
                diff = -this.getGamma() + this.degree_ZEROLR;
                break;
            case 90: // L:b+ , R:b-
                diff = -this.getBeta() + this.degree_ZEROLR;
                break;
            case 180: // L:g- , R:g+
                diff = this.getGamma() - this.degree_ZEROLR;
                break;
            case -90: // L:b- , R:b+
                diff = this.getBeta() - this.degree_ZEROLR;
                break;
        }
        return diff;
    };
    instanceProto.tilt2arrowkey = function () {
        if (this.touchwrap == null)
            return;

        var orientation = getOrientation();
        if (this.previousOrientation != orientation) {
            this.setDegree_ZERO();
            this.previousOrientation = orientation;
        }
        var dir = this.directions; //0=UD, 1=LR, 2=4dir, 3=8dir
        this.isAnyPressed = false;
        // key UD
        if ((dir == 0) || (dir == 2) || (dir == 3))
            this.updateKeyUD(orientation);

        // key LR
        if ((dir == 1) || (dir == 3) || ((dir == 2) && (this.keyUD == 0)))
            this.updateKeyLR(orientation);
    };

    instanceProto.updateKeyUD = function (orientation) {
        this.degree_diffUD = this._diffUD_get(orientation);
        var currentKeyUD;
        if (Math.abs(this.degree_diffUD) >= this.sensitivity)
            currentKeyUD = (this.degree_diffUD > 0) ? 1 : 2; // 1=up, 2=bottom
        else // no key
            currentKeyUD = 0;

        if (currentKeyUD == this.keyUD)
            return;

        // release
        if (this.keyUD == 1) // release up key
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnUPReleased, this);
        else if (this.keyUD == 2) // release bottom key
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnDOWNReleased, this);

        // press    
        if (currentKeyUD == 1) // press up key
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnUPPressed, this);
        else if (currentKeyUD == 2) // press bottom key
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnDOWNPressed, this);
        if (currentKeyUD != 0)
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnAnyPressed, this);

        this.keyUD = currentKeyUD;
    };
    instanceProto.updateKeyLR = function (orientation) {
        // key LR
        this.degree_diffLR = this._diffLR_get(orientation);
        var currentKeyLR;
        if (Math.abs(this.degree_diffLR) >= this.sensitivity)
            currentKeyLR = (this.degree_diffLR > 0) ? 1 : 2; // 1=left, 2=right
        else // no key
            currentKeyLR = 0;

        if (currentKeyLR == this.keyLR)
            return;

        // release
        if (this.keyLR == 1) // release left key
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnLEFTReleased, this);
        else if (this.keyLR == 2) // release right key
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnRIGHTReleased, this);

        // pressed
        if (currentKeyLR == 1) // press left key                
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnLEFTPressed, this);
        else if (currentKeyLR == 2) // press right key              
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnRIGHTPressed, this);
        if (currentKeyLR != 0)
            this.runtime.trigger(cr.plugins_.Rex_Tilt2ArrowKey.prototype.cnds.OnAnyPressed, this);

        this.keyLR = currentKeyLR;
    };

    instanceProto.saveToJSON = function () {
        return {
            "s": this.sensitivity
        };
    };

    instanceProto.loadFromJSON = function (o) {
        this.sensitivity = o["s"];
    };

    //////////////////////////////////////
    // Conditions
    function Cnds() {};
    pluginProto.cnds = new Cnds();

    Cnds.prototype.IsUPDown = function () {
        return (this.keyUD == 1);
    };
    Cnds.prototype.IsDOWNDown = function () {
        return (this.keyUD == 2);
    };
    Cnds.prototype.IsLEFTDown = function () {
        return (this.keyLR == 1);
    };
    Cnds.prototype.IsRIGHTDown = function () {
        return (this.keyLR == 2);
    };

    Cnds.prototype.OnUPPressed = function () {
        return true;
    };
    Cnds.prototype.OnDOWNPressed = function () {
        return true;
    };
    Cnds.prototype.OnLEFTPressed = function () {
        return true;
    };
    Cnds.prototype.OnRIGHTPressed = function () {
        return true;
    };

    Cnds.prototype.OnAnyPressed = function () {
        var ret;
        if (!this.isAnyPressed) {
            this.isAnyPressed = true;
            ret = true;
        } else
            ret = false;
        return ret;
    };

    Cnds.prototype.OnUPReleased = function () {
        return true;
    };
    Cnds.prototype.OnDOWNReleased = function () {
        return true;
    };
    Cnds.prototype.OnLEFTReleased = function () {
        return true;
    };
    Cnds.prototype.OnRIGHTReleased = function () {
        return true;
    };

    //////////////////////////////////////
    // Actions
    function Acts() {};
    pluginProto.acts = new Acts();

    Acts.prototype.Calibration = function (ZERO_UD, ZERO_LR) {
        if (ZERO_UD == 1)
            ZERO_UD = null;
        if (ZERO_LR == 1)
            ZERO_LR = null;
        this.setup();
        this.setDegree_ZERO(ZERO_UD, ZERO_LR);
    };

    Acts.prototype.SetSensitivity = function (a) {
        this.sensitivity = a;
    };

    //////////////////////////////////////
    // Expressions
    function Exps() {};
    pluginProto.exps = new Exps();

    Exps.prototype.ZEROUD = function (ret) {
        ret.set_float(this.degree_ZEROUD);
    };
    Exps.prototype.ZEROLR = function (ret) {
        ret.set_float(this.degree_ZEROLR);
    };
    Exps.prototype.RotateUD = function (ret) {
        ret.set_float(this.degree_diffUD);
    };
    Exps.prototype.RotateLR = function (ret) {
        ret.set_float(this.degree_diffLR);
    };
    Exps.prototype.SensitivityAngle = function (ret) {
        ret.set_float(this.sensitivity);
    };
}());