// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_layouter_linear = function (runtime) {
    this.runtime = runtime;
};

(function () {
    var behaviorProto = cr.behaviors.Rex_layouter_linear.prototype;

    /////////////////////////////////////
    // Behavior type class
    behaviorProto.Type = function (behavior, objtype) {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };

    var behtypeProto = behaviorProto.Type.prototype;

    behtypeProto.onCreate = function () {};

    /////////////////////////////////////
    // Behavior instance class
    behaviorProto.Instance = function (type, inst) {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;
        this.runtime = type.runtime;
    };

    var behinstProto = behaviorProto.Instance.prototype;

    behinstProto.onCreate = function () {
        this.check_name = "LAYOUTER";
        this.mode = this.properties[0];
        this.direction = this.properties[1];
        this.alignment = this.properties[2];
        this.spacing = this.properties[3];


        this.points = {
            start: {
                x: 0,
                y: 0
            },
            end: {
                x: 0,
                y: 0
            }
        };

        // implement handlers
        this.onAddInstances = this.onUpdate;
        this.onRemoveInstances = this.onUpdate;
        this.handler = [this.updateAvarage,
            this.updateFix
        ];
    };

    behinstProto.tick = function () {};

    var OFFSET_RIGHT = 0;
    var OFFSET_BOTTOM = 1;
    var OFFSET_LEFT = 2;
    var OFFSET_TOP = 3;
    var offsetP = {
        x: 0,
        y: 0
    };
    behinstProto.getOffset = function (uid, direction) {
        var inst = this.runtime.getObjectByUID(uid);
        if (inst == null)
            return;
        inst.update_bbox();
        var quad = inst.bquad;
        var px, py;
        switch (direction) {
            case OFFSET_RIGHT:
                px = (quad.trx + quad.brx) / 2;
                py = (quad.try_ + quad.bry) / 2;
                break;
            case OFFSET_BOTTOM:
                px = (quad.blx + quad.brx) / 2;
                py = (quad.bly + quad.bry) / 2;
                break;
            case OFFSET_LEFT:
                px = (quad.tlx + quad.blx) / 2;
                py = (quad.tly + quad.bly) / 2;
                break;
            case OFFSET_TOP:
                px = (quad.tlx + quad.trx) / 2;
                py = (quad.tly + quad.try_) / 2;
                break;
        }
        offsetP.x = inst.x - px;
        offsetP.y = inst.y - py;
        return offsetP;
    };

    behinstProto.getStartEnd = function (uids) {
        var layouter = this.inst;
        layouter.update_bbox();
        var quad = layouter.bquad;
        var instCnt = uids.length;
        var offsetP;
        switch (this.direction) {
            case 0: // Left to right
                this.points.start.x = (quad.tlx + quad.blx) / 2;
                this.points.start.y = (quad.tly + quad.bly) / 2;
                this.points.end.x = (quad.trx + quad.brx) / 2;
                this.points.end.y = (quad.try_ + quad.bry) / 2;
                if (instCnt >= 1) {
                    offsetP = this.getOffset(uids[0], OFFSET_LEFT);
                    this.points.start.x += offsetP.x;
                    this.points.start.y += offsetP.y;
                }
                if (instCnt >= 2) {
                    offsetP = this.getOffset(uids[instCnt - 1], OFFSET_RIGHT);
                    this.points.end.x += offsetP.x;
                    this.points.end.y += offsetP.y;
                }
                break;
            case 1: // Right to left
                this.points.start.x = (quad.trx + quad.brx) / 2;
                this.points.start.y = (quad.try_ + quad.bry) / 2;
                this.points.end.x = (quad.tlx + quad.blx) / 2;
                this.points.end.y = (quad.tly + quad.bly) / 2;
                if (instCnt >= 1) {
                    offsetP = this.getOffset(uids[0], OFFSET_RIGHT);
                    this.points.start.x += offsetP.x;
                    this.points.start.y += offsetP.y;
                }
                if (instCnt >= 2) {
                    offsetP = this.getOffset(uids[instCnt - 1], OFFSET_LEFT);
                    this.points.end.x += offsetP.x;
                    this.points.end.y += offsetP.y;
                }
                break;
            case 2: // Top to bottom
                this.points.start.x = (quad.tlx + quad.trx) / 2;
                this.points.start.y = (quad.tly + quad.try_) / 2;
                this.points.end.x = (quad.blx + quad.brx) / 2;
                this.points.end.y = (quad.bly + quad.bry) / 2;
                if (instCnt >= 1) {
                    offsetP = this.getOffset(uids[0], OFFSET_TOP);
                    this.points.start.x += offsetP.x;
                    this.points.start.y += offsetP.y;
                }
                if (instCnt >= 2) {
                    offsetP = this.getOffset(uids[instCnt - 1], OFFSET_BOTTOM);
                    this.points.end.x += offsetP.x;
                    this.points.end.y += offsetP.y;
                }
                break;
            case 3: // Bottom to top
                this.points.start.x = (quad.blx + quad.brx) / 2;
                this.points.start.y = (quad.bly + quad.bry) / 2;
                this.points.end.x = (quad.tlx + quad.trx) / 2;
                this.points.end.y = (quad.tly + quad.try_) / 2;
                if (instCnt >= 1) {
                    offsetP = this.getOffset(uids[0], OFFSET_BOTTOM);
                    this.points.start.x += offsetP.x;
                    this.points.start.y += offsetP.y;
                }
                if (instCnt >= 2) {
                    offsetP = this.getOffset(uids[instCnt - 1], OFFSET_TOP);
                    this.points.end.x += offsetP.x;
                    this.points.end.y += offsetP.y;
                }
                break;
        }

        return this.points;
    };

    behinstProto.onUpdate = function () {
        this.handler[this.mode].apply(this);
    };

    // rotate angle of instances
    var angleSaved = [];
    behinstProto.rotateAll = function (uids, a) {
        var cnt = uids.length,
            i, inst;
        for (i = 0; i < cnt; i++) {
            inst = this.runtime.getObjectByUID(uids[i]);
            if (inst == null)
                continue;
            angleSaved.push(inst.angle);
            inst.angle = a;
            inst.set_bbox_changed();
        }
    };

    behinstProto.rotateBack = function (uids) {
        var cnt = uids.length,
            i, inst;
        for (i = 0; i < cnt; i++) {
            inst = this.runtime.getObjectByUID(uids[i]);
            if (inst == null)
                continue;
            inst.angle = angleSaved[i];
            inst.set_bbox_changed();
        }
        angleSaved.length = 0;
    };

    behinstProto.updateAvarage = function () {
        var layouter = this.inst;
        var sprites = layouter.sprites;
        var cnt = sprites.length;
        if (cnt == 0)
            return;

        var a = layouter.angle;
        this.rotateAll(sprites, a);
        var points = this.getStartEnd(sprites);
        var i, params;
        var seg = (cnt == 1) ? 1 : (cnt - 1);
        var dx = (points.end.x - points.start.x) / seg;
        var dy = (points.end.y - points.start.y) / seg;
        this.spacing = Math.sqrt((dx * dx) + (dy * dy));
        var startX = points.start.x;
        var startY = points.start.y;
        this.rotateBack(sprites);
        for (i = 0; i < cnt; i++) {
            params = {
                x: startX + (dx * i),
                y: startY + (dy * i),
                angle: sprites[i].angle
            };
            layouter.onLayoutInstance(sprites[i], params);
        }
    };

    behinstProto.updateFix = function () {
        var layouter = this.inst;
        var sprites = layouter.sprites;
        var cnt = sprites.length;
        if (cnt == 0)
            return;

        this.rotateAll(sprites, layouter.angle);
        var points = this.getStartEnd(sprites);
        var layouter = this.inst;
        var a = Math.atan2(points.end.y - points.start.y,
            points.end.x - points.start.x);
        var cosA = Math.cos(a),
            sinA = Math.sin(a);
        var i, params;
        var dx = this.spacing * cosA;
        var dy = this.spacing * sinA;

        // re-calc start point
        var totalDistance = this.spacing * (cnt - 1);
        switch (this.alignment) {
            case 0:
                break;
            case 1: // alignment center
                totalDistance /= 2;
                var centerX = (points.start.x + points.end.x) / 2;
                var centerY = (points.start.y + points.end.y) / 2;
                this.points.start.x = centerX - (totalDistance * cosA);
                this.points.start.y = centerY - (totalDistance * sinA);
                break;
            case 2: // alignment end
                this.points.start.x = points.end.x - (totalDistance * cosA);
                this.points.start.y = points.end.y - (totalDistance * sinA);
                break;
        }

        var startX = points.start.x;
        var startY = points.start.y;
        this.rotateBack(sprites);
        for (i = 0; i < cnt; i++) {
            params = {
                x: startX + (dx * i),
                y: startY + (dy * i),
                angle: sprites[i].angle
            };
            layouter.onLayoutInstance(sprites[i], params);
        }
    };

    behinstProto.saveToJSON = function () {
        return {
            "m": this.mode,
            "dir": this.direction,
            "ali": this.alignment,
            "dd": this.spacing
        };
    };

    behinstProto.loadFromJSON = function (o) {
        this.mode = o["m"];
        this.direction = o["dir"];
        this.alignment = o["ali"];
        this.spacing = o["dd"];
    };
    //////////////////////////////////////
    // Conditions
    function Cnds() {};
    behaviorProto.cnds = new Cnds();

    //////////////////////////////////////
    // Actions
    function Acts() {};
    behaviorProto.acts = new Acts();

    Acts.prototype.SetMode = function (m) {
        this.mode = m;
    };

    Acts.prototype.SetDirection = function (m) {
        this.direction = m;
    };

    Acts.prototype.SetAlignment = function (m) {
        this.alignment = m;
    };

    Acts.prototype.SetDeltaDist = function (d) {
        this.spacing = d;
    };

    //////////////////////////////////////
    // Expressions
    function Exps() {};
    behaviorProto.exps = new Exps();

}());