var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Vector = (function (_super) {
    __extends(Vector, _super);
    /**
    *
    */
    function Vector(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.vector = true;
        return _this;
    }
    Vector.prototype.clone = function () {
        return new Vector(this.x, this.y);
    };
    Vector.prototype.equals = function (v) {
        return Math.abs(this.x - v.x) < .0001 && Math.abs(this.y - v.y) < .0001;
    };
    Vector.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vector.prototype.distanceToSquared = function (v) {
        var dx = v.x - this.x;
        var dy = v.y - this.y;
        return dx * dx + dy * dy;
    };
    Vector.prototype.distanceTo = function (v) {
        return Math.sqrt(this.distanceToSquared(v));
    };
    Vector.prototype.manhattanDistance = function (v) {
        return Math.abs(v.x - this.x) + Math.abs(v.y - this.y);
    };
    Vector.prototype.plus = function (v) {
        var x = this.x;
        var y = this.y;
        if (v instanceof Vector) {
            x += v.x;
            y += v.y;
        }
        else if (typeof v === "number") {
            x += v;
            y += v;
        }
        else if (v instanceof Array
            && typeof v[0] === "number"
            && typeof v[1] === "number") {
            x += v[0];
            y += v[1];
        }
        else {
            var error = new Error("<" + JSON.stringify(v) + "> + <" + this.x + ", " + this.y + ">");
            error.message += error.stack;
            throw error;
        }
        return new Vector(x, y);
    };
    Vector.prototype.plusEquals = function (v) {
        if (v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        }
        else if (typeof v === "number") {
            this.x += v;
            this.y += v;
        }
        else if (v instanceof Array
            && typeof v[0] === "number"
            && typeof v[1] === "number") {
            this.x += v[0];
            this.y += v[1];
        }
        else {
            throw "Error: <" + JSON.stringify(v) + "> + <" + this.x + ", " + this.y + "> is not valid";
        }
        return this;
    };
    Vector.prototype.times = function (scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    };
    Vector.prototype.timesEquals = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    };
    Vector.prototype.minus = function (v) {
        if (v instanceof Vector)
            return this.plus(v.times(-1));
        else if (typeof v === "number")
            return this.plus(v * -1);
        else
            throw "<" + JSON.stringify(v) + "> * <" + this.x + ", " + this.y + "> is not valid";
    };
    Vector.prototype.minusEquals = function (v) {
        if (v instanceof Vector)
            return this.plusEquals(v.times(-1));
        else if (typeof v === "number")
            return this.plusEquals(v * -1);
        else
            throw "<" + this.x + ", " + this.y + "> -= <" + JSON.stringify(v) + "> is not valid";
    };
    Vector.prototype.divided = function (scalar) {
        return this.times(1 / scalar);
    };
    Vector.prototype.dividedEquals = function (scalar) {
        return this.timesEquals(1 / scalar);
    };
    Vector.prototype.dot = function (vector) {
        return this.x * vector.x + this.y * vector.y;
    };
    Vector.prototype.unit = function () {
        if (this.length() == 0) {
            return new Vector(0, 0);
        }
        return this.clone().divided(this.length());
    };
    Vector.prototype.unitTimes = function (scalar) {
        if (this.length() == 0) {
            return new Vector(0, 0);
        }
        return this.dividedEquals(this.length()).timesEquals(scalar);
    };
    Vector.prototype.clampTo = function (max) {
        if (this.length() > max) {
            return this.unit().times(max);
        }
        return this;
    };
    Vector.prototype.rotate = function (angle, pivot) {
        var s = Math.sin(angle), c = Math.cos(angle), v = this.clone(), p = pivot.clone();
        v.x -= p.x;
        v.y -= p.y;
        var xnew = v.x * c - v.y * s;
        var ynew = v.x * s + v.y * c;
        v.x = xnew + p.x;
        v.y = ynew + p.y;
        return v;
    };
    return Vector;
}(Point));
var LineSegment = (function () {
    function LineSegment(v0, v1) {
        this.v0 = v0;
        this.v1 = v1;
    }
    return LineSegment;
}());
var Ball = (function () {
    function Ball(position, r) {
        if (!r) {
            throw "Radius should be number > 0";
        }
        this.position = position;
        this.r = r;
    }
    return Ball;
}());
var VectorMath = (function () {
    function VectorMath() {
    }
    VectorMath.intersectBallBall = function (ball0, ball1) {
        if (ball0.position.distanceTo(ball1) < ball0.r + ball1.r) {
            return true;
        }
        return false;
    };
    VectorMath.projectScalar = function (a, b) {
        return a.dot(b.unit());
    };
    VectorMath.projectVector = function (a, b) {
        return b.unit().timesEquals(VectorMath.projectScalar(a, b));
    };
    return VectorMath;
}());
function randomInt(max) {
    return Math.floor(max * Math.random());
}
var VectorMap = (function () {
    function VectorMap() {
        this.struc = [];
    }
    VectorMap.prototype.map = function (p, val) {
        if (!this.struc[p.x]) {
            this.struc[p.x] = [];
        }
        this.struc[p.x][p.y] = val;
    };
    VectorMap.prototype.unmap = function (p) {
        if (!this.has(p))
            return;
        this.struc[p.x][p.y] = undefined;
    };
    VectorMap.prototype.has = function (p) {
        if (!this.struc[p.x]) {
            return false;
        }
        return this.struc[p.x][p.y] ? true : false;
    };
    VectorMap.prototype.at = function (p) {
        if (!this.has(p))
            return undefined;
        return this.struc[p.x][p.y];
    };
    VectorMap.prototype.spread = function () {
        var result = [];
        for (var x in this.struc) {
            for (var y in this.struc[x]) {
                result.push(new Vector(parseInt(x), parseInt(y)));
            }
        }
        return result;
    };
    return VectorMap;
}());
var VectorSet = (function () {
    function VectorSet() {
        this.struc = new VectorMap();
    }
    VectorSet.prototype.add = function (p) {
        this.struc.map(p, true);
    };
    VectorSet.prototype.remove = function (p) {
        this.struc.unmap(p);
    };
    VectorSet.prototype.has = function (p) {
        return this.struc.has(p);
    };
    return VectorSet;
}());
/*Game time*/
var Physics = (function () {
    function Physics() {
        this.currentMaterial = new Physics.Material(1, "red", function () { }, function (x, y) {
            return 0.01;
        });
        this.dynamics = [];
        this.statics = [];
        this.fixeds = [];
        this.triggers = [];
        this.timestamp = [];
        this.debug = true;
        this.debugVectorScalar = 100;
        this.debugLines = [];
        this.acceleration = function (x, y) {
            return new Vector(0, .05);
        };
        this.friction = function (x, y) {
            return 0.01;
        };
    }
    Physics.prototype.clearAll = function () {
        this.dynamics = [];
        this.statics = [];
        this.fixeds = [];
        this.triggers = [];
        this.timestamp = [];
        this.currentMaterial = new Physics.Material(1, "red", function () { }, function (x, y) {
            return 0.01;
        });
    };
    Physics.prototype.setMaterial = function (material) {
        this.currentMaterial = material;
    };
    Physics.polygon = function (x, y, r, numSides) {
        var sides = [];
        var last_theta = (1 - 1 / numSides) * Math.PI * 2, last_x0 = Math.cos(last_theta) * r, last_y0 = Math.sin(last_theta) * r;
        for (var i = 0; i < numSides; i++) {
            var theta = (i / numSides) * Math.PI * 2;
            var x0 = Math.cos(theta) * r;
            var y0 = Math.sin(theta) * r;
            sides.push(new LineSegment(new Vector(last_x0, last_y0), new Vector(x0, y0)));
            last_theta = theta;
            last_x0 = x0;
            last_y0 = y0;
        }
        return sides;
    };
    Physics.prototype.addStaticLineSegment = function (stat) {
        stat.material = this.currentMaterial;
        this.statics.push(stat);
    };
    Physics.prototype.addDynamic = function (dynamic) {
        this.dynamics.push(dynamic);
        return dynamic;
    };
    Physics.prototype.addFixed = function (fixed) {
        fixed.material = this.currentMaterial;
        this.fixeds.push(fixed);
    };
    Physics.prototype.addTrigger = function (trigger) {
        if (!trigger.effect)
            throw "Triggers must have effects";
        this.triggers.push(trigger);
    };
    Physics.prototype.getDynamics = function () {
        return this.dynamics;
    };
    Physics.prototype.getStatics = function () {
        return this.statics;
    };
    Physics.prototype.getFixeds = function () {
        return this.fixeds;
    };
    Physics.prototype.getTriggers = function () {
        return this.triggers;
    };
    Physics.prototype.setAcceleration = function (fn) {
        this.acceleration = fn;
    };
    Physics.prototype.lineOfSight = function (segment) {
        for (var i = 0; i < this.statics.length; i++) {
            var stat_seg = this.statics[i];
            if (Physics.intersectSegSeg(segment, stat_seg)) {
                return false;
            }
        }
        return true;
    };
    Physics.prototype.lineOfSightDistance = function (segment, distance) {
        for (var i = 0; i < this.statics.length; i++) {
            var stat_seg = this.statics[i];
            if (Physics.intersectSegSegDist(segment, stat_seg, distance)) {
                return false;
            }
        }
        return true;
    };
    Physics.prototype.processTriggers = function () {
        var self = this;
        self.triggers.forEach(function (trigger) {
            self.dynamics.forEach(function (dynamic) {
                if (trigger instanceof Physics.TriggerLineSegment && Physics.intersectSegBall(trigger, dynamic)) {
                    trigger.effect();
                }
                if (trigger instanceof Physics.TriggerBall && VectorMath.intersectBallBall(trigger, dynamic)) {
                    trigger.effect();
                }
            });
        });
    };
    Physics.prototype.stepDynamics = function () {
        var self = this;
        self.dynamics.forEach(function (dynamic) {
            dynamic.speed = dynamic.speed.clampTo(Math.min(dynamic.width(), dynamic.height()) / 2);
            dynamic.move();
            dynamic.accelerate(self.acceleration(dynamic.position.x, dynamic.position.y));
            dynamic.accelerate(dynamic.getAcceleration());
        });
    };
    Physics.prototype.stepFixeds = function () {
        var self = this;
        self.fixeds.forEach(function (fixed) {
            fixed.move();
        });
    };
    Physics.prototype.resolveCollision = function (dynamic, stat) {
        var self = this;
        var v0 = stat.v0;
        var v1 = stat.v1;
        var originStatic = v1.minus(v0);
        var originDynamic = dynamic.position.minus(v0);
        var projectedScalar = VectorMath.projectScalar(originDynamic, originStatic);
        var projectedVector = v0.plus(originStatic.unit().times(projectedScalar));
        var overlap = dynamic.r - dynamic.position.distanceTo(projectedVector);
        if (overlap > dynamic.r)
            return null;
        var overlapVector = projectedVector.minus(dynamic.position).unitTimes(overlap);
        if (overlapVector.x * -originStatic.y + overlapVector.y * originStatic.x < 0)
            return null;
        var projectedSpeed = VectorMath.projectScalar(dynamic.speed, originStatic);
        var projectedSpeedVector = VectorMath.projectVector(dynamic.speed, originStatic);
        var rejectedSpeedVector = dynamic.speed.minus(projectedSpeedVector);
        if (!overlapVector.unit().equals(rejectedSpeedVector.unit()))
            return null;
        var perpendicularComponent = Math.sqrt(dynamic.speed.length() * dynamic.speed.length() - projectedSpeed * projectedSpeed);
        if (this.debug) {
            this.debugLines.push({
                x0: dynamic.position.x,
                y0: dynamic.position.y,
                x1: overlapVector.times(100).plus(dynamic.position).x,
                y1: overlapVector.times(100).plus(dynamic.position).y,
                color: "green"
            });
            this.debugLines.push({
                x0: dynamic.position.x,
                y0: dynamic.position.y,
                x1: rejectedSpeedVector.x * this.debugVectorScalar + dynamic.position.x,
                y1: rejectedSpeedVector.y * this.debugVectorScalar + dynamic.position.y,
                color: "yellow"
            });
            this.debugLines.push({
                x0: dynamic.position.x,
                y0: dynamic.position.y,
                x1: projectedSpeedVector.x * this.debugVectorScalar + dynamic.position.x,
                y1: projectedSpeedVector.y * this.debugVectorScalar + dynamic.position.y,
                color: "purple"
            });
        }
        if (dynamic.speed.length() > 1 || stat.material.bounce >= 1) {
            dynamic.speed = projectedSpeedVector.plus(rejectedSpeedVector.timesEquals(-1 * stat.material.bounce));
        }
        stat.material.callback(dynamic.speed.length() / dynamic.maxSpeed);
        dynamic.position = dynamic.position.minus(overlapVector);
        dynamic.speed.timesEquals(1 - stat.material.friction(dynamic.position.x, dynamic.position.y));
    };
    Physics.prototype.processDynamics = function () {
        var self = this;
        self.dynamics.forEach(function (dynamic) {
            var deepest_collision = {
                overlap: Math.pow(2, 32) - 1
            };
            self.statics.forEach(function (stat) {
                var collision = Physics.intersectSegBall(stat, dynamic);
                if (collision) {
                    self.resolveCollision(dynamic, stat);
                }
            });
            self.fixeds.forEach(function (fixed) {
                var collision = false, collided = fixed;
                if (fixed.segments) {
                    for (var i = 0; i < fixed.segments.length; i++) {
                        var val = fixed.segments[i];
                        collision = Physics.intersectSegBall(val, dynamic);
                        if (collision) {
                            collided = fixed.segments[i];
                            collided.material = fixed.material;
                            break;
                        }
                    }
                }
                else {
                    collision = Physics.intersectSegBall(fixed, dynamic);
                }
                if (collision) {
                    self.resolveCollision(dynamic, collided);
                    dynamic.speed = dynamic.speed.plus(fixed.getSpeedAt(dynamic.position));
                }
            });
        });
    };
    Physics.prototype.stepPhysics = function () {
        /**
         * 1 move all dynamics according to level rules. This includes momentum, friction, and other forces
         * 2 check for dynamic on static collisions
         * 3 move all fixeds according to their specific rules.
         */
        this.processTriggers();
        this.stepDynamics();
        this.stepFixeds();
        this.processDynamics();
        //TODO Fix "sticky" back collisions
        this.timestamp++;
    };
    Physics.prototype.drawPhysics = function (ctx) {
        var self = this;
        var canvas = ctx.canvas;
        ctx.fillStyle = "rgba(255,255,255,.01)";
        for (var i = 0; i < this.statics.length; i++) {
            var v = this.statics[i];
            var v0 = v.v0;
            var v1 = v.v1;
            if (this.debug) {
                ctx.strokeStyle = v.material.debugColor;
                ctx.fillStyle = v.material.debugColor;
            }
            ctx.beginPath();
            ctx.moveTo(v0.x, v0.y);
            ctx.lineTo(v1.x, v1.y);
            ctx.stroke();
        }
        for (var i = 0; i < this.fixeds.length; i++) {
            var fixed = this.fixeds[i];
            ctx.strokeStyle = fixed.material.debugColor;
            ctx.fillStyle = fixed.material.debugColor;
            if (fixed.segments) {
                for (var j = 0; j < fixed.segments.length; j++) {
                    var v = fixed.segments[j], v0 = v.v0, v1 = v.v1;
                    ctx.beginPath();
                    ctx.moveTo(v0.x, v0.y);
                    ctx.lineTo(v1.x, v1.y);
                    ctx.stroke();
                }
            }
            else {
                var v0 = fixed.v0;
                var v1 = fixed.v1;
                ctx.beginPath();
                ctx.moveTo(v0.x, v0.y);
                ctx.lineTo(v1.x, v1.y);
                ctx.stroke();
            }
        }
        if (this.debug) {
            this.debugLines.forEach(function (val) {
                ctx.strokeStyle = val.color;
                ctx.beginPath();
                ctx.moveTo(val.x0, val.y0);
                ctx.lineTo(val.x1, val.y1);
                ctx.stroke();
                if (self.debugLines.length > 10) {
                    self.debugLines.shift();
                }
            });
        }
        ctx.strokeStyle = "blue";
        ctx.fillStyle = "blue";
        for (var i = 0; i < this.dynamics.length; i++) {
            ctx.beginPath();
            ctx.arc(this.dynamics[i].position.x, this.dynamics[i].position.y, this.dynamics[i].r, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.moveTo(this.dynamics[i].position.x, this.dynamics[i].position.y);
            ctx.lineTo(this.dynamics[i].position.x + this.dynamics[i].speed.x * this.debugVectorScalar, this.dynamics[i].position.y + this.dynamics[i].speed.y * this.debugVectorScalar);
            ctx.stroke();
        }
        ctx.strokeStyle = "orange";
        ctx.fillStyle = "orange";
        for (var i = 0; i < this.triggers.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.triggers[i].v0.x, this.triggers[i].v0.y);
            ctx.lineTo(this.triggers[i].v1.x, this.triggers[i].v1.y);
            ctx.stroke();
        }
    };
    Physics.intersectSegBall = function (seg, ball) {
        //http://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
        var d = seg.v1.minus(seg.v0), f = seg.v0.minus(ball.position), a = d.dot(d), b = 2 * f.dot(d), c = f.dot(f) - ball.r * ball.r;
        var discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            // no intersection
            return false;
        }
        else {
            discriminant = Math.sqrt(discriminant);
            var t1 = (-b - discriminant) / (2 * a), t2 = (-b + discriminant) / (2 * a);
            if (t1 >= 0 && t1 <= 1) {
                return true;
            }
            if (t2 >= 0 && t2 <= 1) {
                return true;
            }
            return false;
        }
    };
    /** Returns true iff seg0 and seg1 are within distance of each other.
     *
     */
    Physics.intersectSegSegDist = function (seg0, seg1, distance) {
        if (Physics.intersectSegBall(seg0, new Ball(seg1.v0, distance)))
            return true;
        if (Physics.intersectSegBall(seg0, new Ball(seg1.v1, distance)))
            return true;
        if (Physics.intersectSegBall(seg1, new Ball(seg0.v0, distance)))
            return true;
        if (Physics.intersectSegBall(seg1, new Ball(seg0.v1, distance)))
            return true;
        return false;
    };
    Physics.onSeg = function (seg, q) {
        //http://www.cdn.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
        var p = seg.v0;
        var r = seg.v1;
        if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
            return true;
        return false;
    };
    Physics.orientation = function (p, q, r) {
        var val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);
        if (val === 0)
            return 0;
        return (val > 0) ? 1 : 2;
    };
    Physics.intersectSegSeg = function (seg0, seg1) {
        var o1 = Physics.orientation(seg0.v0, seg0.v1, seg1.v0);
        var o2 = Physics.orientation(seg0.v0, seg0.v1, seg1.v1);
        var o3 = Physics.orientation(seg1.v0, seg1.v1, seg0.v0);
        var o4 = Physics.orientation(seg1.v0, seg1.v1, seg0.v1);
        if (o1 !== o2 && o3 !== o4)
            return true;
        if (o1 == 0 && Physics.onSeg(seg0, seg1.v0))
            return true;
        if (o2 == 0 && Physics.onSeg(seg0, seg1.v1))
            return true;
        if (o1 == 0 && Physics.onSeg(seg1, seg0.v0))
            return true;
        if (o1 == 0 && Physics.onSeg(seg1, seg0.v1))
            return true;
        return false;
    };
    return Physics;
}());
(function (Physics) {
    var StaticLineSegment = (function (_super) {
        __extends(StaticLineSegment, _super);
        function StaticLineSegment() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return StaticLineSegment;
    }(LineSegment));
    Physics.StaticLineSegment = StaticLineSegment;
    var Material = (function () {
        function Material(bounce, debugColor, callback, friction) {
            this.bounce = bounce;
            this.debugColor = debugColor;
            this.callback = callback;
            this.friction = friction;
        }
        Material.defaultMaterial = function () {
            return new Physics.Material(0, "black", function (vol) { return void {}; }, function (x, y) {
                return 0.01;
            });
        };
        return Material;
    }());
    Physics.Material = Material;
    var DynamicBall = (function () {
        function DynamicBall(position, r, speed) {
            if (!r) {
                throw "Radius should be number > 0";
            }
            this.position = position;
            this.r = r;
            this.maxSpeed = this.r;
            this.speed = speed;
            this.acceleration = function (x, y) {
                return new Vector(0, 0);
            };
        }
        DynamicBall.prototype.accelerate = function (v) {
            this.speed = this.speed.plus(v);
        };
        DynamicBall.prototype.setAcceleration = function (func) {
            this.acceleration = func;
        };
        DynamicBall.prototype.getAcceleration = function () {
            return this.acceleration(this.position.x, this.position.y);
        };
        DynamicBall.prototype.move = function () {
            if (this.speed.length() > this.maxSpeed) {
                this.speed = this.speed.unit().times(this.r);
            }
            this.position = this.position.plus(this.speed);
        };
        DynamicBall.prototype.width = function () {
            return this.r * 2;
        };
        DynamicBall.prototype.height = function () {
            return this.r * 2;
        };
        return DynamicBall;
    }());
    Physics.DynamicBall = DynamicBall;
    var Flapper = (function () {
        function Flapper(position, angleSpeed, upAngle, downAngle) {
            if (!position.vector) {
                throw "Center should be a vector";
            }
            this.position = position;
            this.up = false;
            this.moving = false;
            this.upAngle = upAngle;
            this.downAngle = downAngle;
            this.angle = this.downAngle;
            this.angleSpeed = angleSpeed;
            this.structure = [2, -11,
                48, 20,
                49, 24,
                49, 28,
                45, 32,
                41, 32, -5, 10, -11, 5, -12, -1, -9, -7, -4, -11,
                2, -11
            ];
            this.segments = [];
            for (var i = 2; i < this.structure.length; i += 2) {
                var v0 = new Vector(this.structure[i - 2] + position.x, this.structure[i - 1] + position.y), v1 = new Vector(this.structure[i] + position.x, this.structure[i + 1] + position.y), segment = new Physics.StaticLineSegment(v0, v1);
                segment.material = this.material;
                this.segments.push(segment);
            }
        }
        Flapper.prototype.getSpeedAt = function (position) {
            if (!this.moving)
                return new Vector(0, 0);
            var speed = 2 * Math.PI * this.position.distanceTo(position) * this.angleSpeed * Math.PI;
            var translated = this.segments[2].v1.minus(this.position);
            var perp = new Vector(translated.y * -1, translated.x).unit().times(speed);
            return perp;
        };
        Flapper.prototype.move = function () {
            if (this.angle / this.upAngle < 1 && this.up) {
                if (1 - this.angle / this.upAngle < this.angleSpeed / this.upAngle) {
                    this.angle = this.upAngle;
                    this.moving = false;
                }
                else {
                    this.angle += this.angleSpeed;
                    this.moving = true;
                }
            }
            else if (this.angle / this.downAngle > 1 && !this.up) {
                if (this.angle / this.downAngle < this.angleSpeed / this.downAngle) {
                    this.angle = this.downAngle;
                    this.moving = false;
                }
                else {
                    this.angle -= this.angleSpeed;
                    this.moving = true;
                }
            }
            else {
                this.moving = false;
            }
            this.segments = [];
            for (var i = 2; i < this.structure.length; i += 2) {
                var v0 = new Vector(this.structure[i - 2] + this.position.x, this.structure[i - 1] + this.position.y)
                    .rotate(this.angle * Math.PI, this.position);
                var v1 = new Vector(this.structure[i] + this.position.x, this.structure[i + 1] + this.position.y)
                    .rotate(this.angle * Math.PI, this.position);
                var segment = new StaticLineSegment(v0, v1);
                segment.material = this.material;
                this.segments.push(segment);
            }
        };
        return Flapper;
    }());
    Physics.Flapper = Flapper;
    var TriggerBall = (function () {
        function TriggerBall(position, r, effect) {
            this.position = position;
            this.r = r;
            this.effect = effect;
        }
        return TriggerBall;
    }());
    Physics.TriggerBall = TriggerBall;
    var TriggerLineSegment = (function () {
        function TriggerLineSegment(v0, v1, effect) {
            this.v0 = v0;
            this.v1 = v1;
            this.effect = effect;
        }
        return TriggerLineSegment;
    }());
    Physics.TriggerLineSegment = TriggerLineSegment;
})(Physics || (Physics = {}));
var NavigationMesh = (function () {
    function NavigationMesh() {
    }
    NavigationMesh.prototype.neighbors = function (p, depth) {
        var result = new VectorMap();
        var self = this;
        var queue = [[p, depth]];
        var _loop_1 = function () {
            var q = queue.shift();
            var x = q[0].x, y = q[0].y, d = q[1];
            if (d == 0)
                return "continue";
            if (result.has(q[0]) && result.at(q[0]) <= d)
                return "continue";
            result.map(q[0], d);
            this_1.adjacent(q[0]).forEach(function (adj) {
                queue.push([adj, d - 1]);
            });
        };
        var this_1 = this;
        while (queue.length) {
            _loop_1();
        }
        return result.spread();
    };
    return NavigationMesh;
}());
var FiniteGridNavigationMesh = (function (_super) {
    __extends(FiniteGridNavigationMesh, _super);
    function FiniteGridNavigationMesh(cell_width, min_x, max_x, min_y, max_y) {
        var _this = _super.call(this) || this;
        _this.cell_width = cell_width;
        _this.min_x = min_x;
        _this.max_x = max_x;
        _this.min_y = min_y;
        _this.max_y = max_y;
        _this.vertices = [];
        for (var i = min_x; i < max_x; i += cell_width) {
            for (var j = min_y; j < max_y; j += cell_width) {
                _this.vertices.push(new Vector(i, j));
            }
        }
        return _this;
    }
    FiniteGridNavigationMesh.prototype.get_vertices = function () {
        return this.vertices;
    };
    FiniteGridNavigationMesh.prototype.adjacent = function (p) {
        if (!(p.x % this.cell_width === 0 && p.y % this.cell_width === 0)) {
            return [];
        }
        var result = [];
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                var x = p.x + i * this.cell_width;
                var y = p.y + j * this.cell_width;
                if (x < this.min_x || x > this.max_x || y < this.min_y || y > this.max_y)
                    continue;
                result.push(new Vector(x, y));
            }
        }
        return result;
    };
    return FiniteGridNavigationMesh;
}(NavigationMesh));
var NonintersectingFiniteGridNavigationMesh = (function (_super) {
    __extends(NonintersectingFiniteGridNavigationMesh, _super);
    function NonintersectingFiniteGridNavigationMesh(cell_width, min_x, max_x, min_y, max_y, physics) {
        var _this = _super.call(this) || this;
        _this.cell_width = cell_width;
        _this.min_x = min_x;
        _this.max_x = max_x;
        _this.min_y = min_y;
        _this.max_y = max_y;
        _this.physics = physics;
        _this.vertices = [];
        _this.adjacent_map = new VectorMap();
        var mesh = new FiniteGridNavigationMesh(cell_width, min_x, max_x, min_y, max_y);
        var self = _this;
        mesh.get_vertices().forEach(function (vertex) {
            self.vertices.push(vertex);
            self.adjacent_map.map(vertex, []);
            mesh.adjacent(vertex).forEach(function (adjacent) {
                if (physics.lineOfSightDistance(new LineSegment(vertex, adjacent), 10)) {
                    self.adjacent_map.at(vertex).push(adjacent);
                }
            });
        });
        console.log(self.adjacent_map);
        return _this;
    }
    NonintersectingFiniteGridNavigationMesh.prototype.adjacent = function (p) {
        return this.adjacent_map.at(p);
    };
    NonintersectingFiniteGridNavigationMesh.prototype.get_vertices = function () {
        return this.vertices;
    };
    return NonintersectingFiniteGridNavigationMesh;
}(NavigationMesh));
/*
let Mouse:Vector = new Vector(0, 0);
document.onmousemove = function (e) {
  Mouse = new Vector(e.pageX, e.pageY);
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);

const mesh = new FiniteGridNavigationMesh(10, 0, 500, 0, 500);
console.log(mesh.neighbors(new Vector(70, 70), 5));
const obstacle = new Circle(new Vector(80, 80), 20);
const children: Vector[] = [
  new Vector(100, 70),
  new Vector(100, 80),
  new Vector(100, 90),
  new Vector(100, 100),
  new Vector(90, 100),
  new Vector(80, 100),
  new Vector(70, 100)
];

const pts: VectorSet = new VectorSet();
setInterval(function () {
  const px = Math.round(Mouse.x / 10) * 10;
  const py = Math.round(Mouse.y / 10) * 10;

  children.forEach(function (child, idx) {
    const options = [];
    if (!intersect(child, [px, py], obstacle)) {
      mesh.neighbors(child, 5).forEach(function (pt) {
        const dx = pt.x - obstacle.center.x;
        const dy = pt.y - obstacle.center.y;
        const d = dx * dx + dy * dy;
        if (intersect(pt, [px, py], obstacle) && d > obstacle.radius * obstacle.radius && !pts.has(pt)) {
          options.push([d, pt]);
        }
      });
    }
    console.log(JSON.stringify(options));
    options.sort(function (a, b) {
      return a[0] - b[0];
    });
    if (options.length) {
      pts.remove(children[idx]);
      pts.add(options[0][1]);
      children[idx] = options[0][1];
    }
  });


    console.log(children);

  ctx.clearRect(0, 0, 500, 500);
  ctx.beginPath();
  ctx.arc(obstacle.center.x, obstacle.center.y, obstacle.radius,0,2*Math.PI);
  ctx.stroke();

  const DEBUG = false;
  
  children.forEach(function (child) {
    if (DEBUG) {
      if (intersect(child, [px, py], obstacle)) {
        ctx.strokeStyle = "red";
      } else {
        ctx.strokeStyle = "blue";
      }
      ctx.beginPath();
      ctx.moveTo(child.x, child.y);
      ctx.lineTo(px, py);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(child.x, child.y, 5,0,2*Math.PI);
    ctx.stroke();

    if (DEBUG) {
      mesh.neighbors(child, 5).forEach(function (pt) {
        if (!intersect(pt, [px, py], obstacle)) {
          ctx.strokeStyle = "green";
        } else {
          ctx.strokeStyle = "purple";
        }
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
        ctx.stroke();
      });
    }
  });
  ctx.strokeStyle = "black";

  ctx.beginPath();
  ctx.arc(px, py, 5,0,2*Math.PI);
  ctx.stroke();
}, 10);

*/
var WorldGenerators;
(function (WorldGenerators) {
    var PerlinPerlinGenerator = (function () {
        function PerlinPerlinGenerator(height) {
            this.height = height;
            this.maximum_resolution = 6;
            this.minimum_resolution = 1;
            this.low_wavelength = 1000;
            this.high_wavelength = 1500;
            this.DEFAULT_SEED = 1;
            this.seed = this.DEFAULT_SEED;
            this.initial_seed = this.seed;
            this.interpolate = new WorldGenerators.PerlinGenerator(1);
            this.persistance = new WorldGenerators.PerlinGenerator(.2);
            this.wavelength = new WorldGenerators.PerlinGenerator(1);
            this.perlin = new WorldGenerators.PerlinGenerator(height);
            this.interpolate.setMaxWavelength(4000);
            this.interpolate.setMaximumResolution(4);
            this.interpolate.setPersistance(.4);
            this.interpolate.setInterpolation(1);
            this.persistance.setMaxWavelength(4000);
            this.persistance.setMaximumResolution(4);
            this.persistance.setPersistance(.4);
            this.persistance.setInterpolation(1);
            this.wavelength.setMaxWavelength(4000);
            this.wavelength.setMaximumResolution(4);
            this.wavelength.setPersistance(.4);
            this.wavelength.setInterpolation(1);
            this.interpolate.setSeed(new Date().getHours());
            this.persistance.setSeed(new Date().getSeconds());
            this.wavelength.setSeed(new Date().getMinutes());
        }
        PerlinPerlinGenerator.prototype.getHeightAt = function (x) {
            var persistance = .3 + Math.abs(this.persistance.getHeightAt(x));
            var interpolate = Math.abs(this.interpolate.getHeightAt(x));
            var low_wavelength_value = this.perlin.generate_perlin_with_parameters(x, this.minimum_resolution, this.maximum_resolution, this.low_wavelength, persistance, interpolate, this.height);
            var high_wavelength_value = this.perlin.generate_perlin_with_parameters(x, this.minimum_resolution, this.maximum_resolution, this.high_wavelength, persistance, interpolate, this.height);
            var wavelength_coef = Math.abs(this.wavelength.getHeightAt(x));
            return low_wavelength_value * (1 - wavelength_coef) + high_wavelength_value * wavelength_coef;
        };
        return PerlinPerlinGenerator;
    }());
    WorldGenerators.PerlinPerlinGenerator = PerlinPerlinGenerator;
    var PerlinGenerator = (function () {
        function PerlinGenerator(height) {
            this.height = height;
            this.maximum_resolution = 6;
            this.minimum_resolution = 1;
            this.perlin_smoothness = .99;
            this.persistance = .45;
            this.interpolate = 1;
            this.max_wavelength = 1000;
            this.DEFAULT_SEED = 1;
            this.seed = this.DEFAULT_SEED;
            this.initial_seed = this.seed;
            this.init(height);
        }
        PerlinGenerator.prototype.init = function (height) {
            this.heights = {};
            this.x = 0;
            this.max_x = 1;
            this.min_x = -1;
            this.left_perlin_subgraph = [];
            this.right_perlin_subgraph = [];
            var y = 0;
            for (var idx = this.minimum_resolution; idx < this.maximum_resolution; idx++) {
                var frequency = Math.pow(2, idx), wavelength = Math.floor(this.max_wavelength / frequency);
                if (wavelength == 0)
                    continue;
                var amplitude = Math.pow(this.persistance, idx);
                this.left_perlin_subgraph[idx] = {};
                this.left_perlin_subgraph[idx].value = amplitude / 2;
                this.left_perlin_subgraph[idx].wavelength = wavelength;
                this.right_perlin_subgraph[idx] = {};
                this.right_perlin_subgraph[idx].value = amplitude / 2;
                this.right_perlin_subgraph[idx].wavelength = wavelength;
                y += amplitude / 2;
            }
            this.heights[-1] = y;
            this.heights[0] = y;
            this.heights[1] = y;
        };
        PerlinGenerator.prototype.getSeed = function () {
            return this.seed;
        };
        PerlinGenerator.prototype.getInitialSeed = function () {
            return this.initial_seed;
        };
        PerlinGenerator.prototype.random = function () {
            var x = Math.sin(this.seed++) * 10000;
            return x - Math.floor(x);
        };
        PerlinGenerator.prototype.no_interpolate = function (a, b, x) {
            return a;
        };
        PerlinGenerator.prototype.linear_interpolate = function (a, b, x) {
            return a * (1 - x) + b * x;
        };
        PerlinGenerator.prototype.cosine_interpolate = function (a, b, x) {
            var pi = x * Math.PI;
            var f = (1 - Math.cos(pi)) * .5;
            return a * (1 - f) + b * f;
        };
        PerlinGenerator.prototype.smooth = function (a, b, c) {
            return ((a + c) / 2 * this.perlin_smoothness) + (b * (1 - this.perlin_smoothness));
        };
        PerlinGenerator.prototype.generate_perlin_with_parameters = function (x, minimum_resolution, maximum_resolution, max_wavelength, persistance, interpolate, height) {
            if (x < this.min_x - 1) {
                this.generate_perlin_with_parameters(x + 1, minimum_resolution, maximum_resolution, max_wavelength, persistance, interpolate, height);
            }
            if (x > this.max_x + 1) {
                this.generate_perlin_with_parameters(x - 1, minimum_resolution, maximum_resolution, max_wavelength, persistance, interpolate, height);
            }
            var active_subgraphs = [];
            if (x < this.min_x) {
                this.min_x = x;
                active_subgraphs = this.left_perlin_subgraph;
            }
            else if (x > this.max_x) {
                this.max_x = x;
                active_subgraphs = this.right_perlin_subgraph;
            }
            else {
                return this.heights[x] * height;
            }
            for (var idx = this.minimum_resolution; idx < maximum_resolution; idx++) {
                var frequency = Math.pow(2, idx), wavelength = Math.floor(max_wavelength / frequency);
                if (x % wavelength == 0) {
                    var amplitude = Math.pow(persistance, idx);
                    if (!active_subgraphs[idx])
                        active_subgraphs[idx] = {};
                    active_subgraphs[idx].last_value = active_subgraphs[idx].value;
                    active_subgraphs[idx].value = amplitude * this.random();
                    active_subgraphs[idx].wavelength = wavelength;
                }
            }
            var y = 0;
            var self = this;
            active_subgraphs.forEach(function (val) {
                if (val) {
                    var a = val.last_value;
                    var b = val.value;
                    var i = (x % val.wavelength) / val.wavelength;
                    if (x < 0)
                        i *= -1;
                    if (!a)
                        a = b;
                    y += self.cosine_interpolate(a, b, i) * interpolate + self.linear_interpolate(a, b, i) * (1 - interpolate);
                }
            });
            this.heights[x] = y;
            return this.heights[x] * height;
        };
        PerlinGenerator.prototype.generate_perlin_at = function (x) {
            return this.generate_perlin_with_parameters(x, this.minimum_resolution, this.maximum_resolution, this.max_wavelength, this.persistance, this.interpolate, this.height);
        };
        PerlinGenerator.prototype.getHeightAt = function (x) {
            return this.generate_perlin_at(x);
        };
        PerlinGenerator.prototype.setSeed = function (seed) {
            if (seed < 0) {
                seed = Math.pow(2, 30) + seed;
            }
            this.seed = seed;
            this.initial_seed = seed;
            this.init(this.height);
        };
        PerlinGenerator.prototype.resetSeed = function () {
            this.seed = this.initial_seed;
        };
        PerlinGenerator.prototype.setMaximumResolution = function (val) {
            this.maximum_resolution = val;
            this.resetSeed();
            this.init(this.height);
        };
        PerlinGenerator.prototype.setMinimumResolution = function (val) {
            this.minimum_resolution = val;
            this.resetSeed();
            this.init(this.height);
        };
        PerlinGenerator.prototype.setPerlinSmoothness = function (val) {
            this.perlin_smoothness = val;
            this.resetSeed();
            this.init(this.height);
        };
        PerlinGenerator.prototype.setPersistance = function (val) {
            this.persistance = val;
            this.resetSeed();
            this.init(this.height);
        };
        PerlinGenerator.prototype.setInterpolation = function (val) {
            this.interpolate = val;
            this.resetSeed();
            this.init(this.height);
        };
        PerlinGenerator.prototype.setMaxWavelength = function (val) {
            this.max_wavelength = val;
            this.resetSeed();
            this.init(this.height);
        };
        PerlinGenerator.prototype.randomize = function () {
            this.setInterpolation(Math.random());
            this.setMaxWavelength(Math.random() * 1000 + 500);
            this.setPersistance(Math.random() / 2);
        };
        return PerlinGenerator;
    }());
    WorldGenerators.PerlinGenerator = PerlinGenerator;
})(WorldGenerators || (WorldGenerators = {}));
/*Running*/
var MouseHandler = (function () {
    function MouseHandler(element) {
        this.element = element;
        var self = this;
        element.addEventListener('mousedown', function (e) {
            self.mouseDown = true;
            var point = self.relMouseCoords(e);
            self.mouseXOnDown = point.x;
            self.mouseYOnDown = point.y;
        });
        element.addEventListener('mousemove', function (e) {
            var point = self.relMouseCoords(e);
            self.mouseX = Math.floor(point.x);
            self.mouseY = Math.floor(point.y);
        });
        element.addEventListener('mouseup', function (e) {
            self.mouseDown = false;
        });
    }
    MouseHandler.prototype.relMouseCoords = function (event) {
        var rect = this.element.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        return { x: x, y: y };
    };
    MouseHandler.prototype.getX = function () {
        return this.mouseX;
    };
    MouseHandler.prototype.getY = function () {
        return this.mouseY;
    };
    MouseHandler.prototype.getXOnDown = function () {
        return this.mouseXOnDown;
    };
    MouseHandler.prototype.getYOnDown = function () {
        return this.mouseYOnDown;
    };
    MouseHandler.prototype.down = function () {
        return this.mouseDown;
    };
    return MouseHandler;
}());
var KeyHandler = (function () {
    function KeyHandler(element) {
        this.element = element;
        var self = this;
        this.keysDown = [];
        element.addEventListener('keydown', function (e) {
            var char = String.fromCharCode(e.keyCode);
            self.keysDown[char] = true;
        }, false);
        element.addEventListener('keyup', function (e) {
            var char = String.fromCharCode(e.keyCode);
            self.keysDown[char] = false;
        }, false);
    }
    KeyHandler.prototype.isDown = function (char) {
        return this.keysDown[char];
    };
    return KeyHandler;
}());
var WorldBuilder;
(function (WorldBuilder) {
    var Build1 = (function () {
        function Build1(physics) {
            this.xoffset = 0;
            this.screenWidth = 1280;
            this.screenHeight = 1080;
            this.physics = physics;
            this.physics.setAcceleration(function (x, y) {
                //return new Vector(-1*(x-canvas.width/2),-1*(y-canvas.width/2)).divided(1000);
                return new Vector(0, .02);
            });
            this.keyHandler = new KeyHandler(document);
            this.sounds = [];
            this.perlin = new WorldGenerators.PerlinPerlinGenerator(1080);
            this.x = 0;
            this.y = 0;
            this.build();
        }
        Build1.prototype.setPhysics = function (physics) {
            this.physics = physics;
        };
        Build1.prototype.setLevel = function (x, y) {
            var self = this;
            //self.perlin.setSeed((x >> 32) + y);
            if (self.x > x)
                self.xoffset -= this.screenWidth;
            else
                self.xoffset += this.screenWidth;
            self.build();
            self.x = x;
            self.y = y;
            return self;
        };
        Build1.prototype.playSound = function (sound, vol) {
            if (!this.sounds[sound]) {
                this.sounds[sound] = new Audio('sounds/' + sound);
            }
            this.sounds[sound].volume = vol;
            this.sounds[sound].play();
        };
        Build1.prototype.getHeightAt = function (x) {
            return this.perlin.getHeightAt(x + this.xoffset);
        };
        Build1.prototype.drawLevel = function () {
            var self = this;
            var lastStroke = new Vector(0, 0);
            var moveTo = function (x, y) {
                lastStroke = new Vector(x, y);
            };
            var strokeTo = function (x, y) {
                var vec = new Vector(x, y);
                self.physics.addStaticLineSegment(new Physics.StaticLineSegment(lastStroke, vec));
                lastStroke = vec;
            };
            var dirt = new Physics.Material(0, "black", function (vol) {
                if (vol < .05)
                    vol *= vol;
                vol = Math.min(vol, 1);
                var sounds = ["Percussive Elements-06.wav",
                    "Percussive Elements-04.wav",
                    "Percussive Elements-05.wav"
                ];
                var i = Math.floor(Math.random() * Math.random() * Math.random() * sounds.length);
                // self.playSound(sounds[i], vol);
            }, function (x, y) {
                return 0.01;
            });
            if (!self.player) {
                self.player = new Player(new Vector(413, 0), 10, new Vector(0, 0));
            }
            self.physics.setMaterial(dirt);
            moveTo(-1 * self.player.width(), this.screenHeight - self.getHeightAt(-1 * self.player.width()));
            for (var x = -1 * self.player.width(); x <= this.screenWidth + self.player.width(); x++) {
                strokeTo(x, this.screenHeight - self.getHeightAt(x));
            }
        };
        Build1.prototype.drawTriggers = function () {
            var self = this;
            self.physics.addTrigger(new Physics.TriggerLineSegment(new Vector(0, -10000), new Vector(0, 10000), function () {
                if (self.player.speed.x < 0) {
                    self.setLevel(self.x - 1, 0);
                    self.player.position.x = self.screenWidth;
                }
            }));
            self.physics.addTrigger(new Physics.TriggerLineSegment(new Vector(this.screenWidth, -10000), new Vector(this.screenWidth, 10000), function () {
                if (self.player.speed.x > 0) {
                    self.setLevel(self.x + 1, 0);
                    self.player.position.x = -.5 * self.player.width();
                }
            }));
        };
        Build1.prototype.build = function () {
            this.physics.clearAll();
            this.drawLevel();
            this.drawTriggers();
            this.physics.addDynamic(this.player);
            this.physics.setAcceleration(function (x, y) {
                return new Vector(0, .02);
            });
        };
        Build1.prototype.step = function () { };
        return Build1;
    }());
    WorldBuilder.Build1 = Build1;
})(WorldBuilder || (WorldBuilder = {}));
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(position, radius, speed) {
        var _this = _super.call(this, position, radius, speed) || this;
        _this.keyHandler = new KeyHandler(document);
        return _this;
    }
    Player.prototype.step = function () {
        var A = this.keyHandler.isDown('A');
        var D = this.keyHandler.isDown('D');
        var S = this.keyHandler.isDown('S');
        var W = this.keyHandler.isDown('W');
        var ddx = 0, ddy = 0;
        if (A && !D) {
            ddx = -1;
        }
        else if (D && !A) {
            ddx = 1;
        }
        else {
            ddx = 0;
        }
        if (S && !W) {
            ddy = 1;
        }
        else if (W && !S) {
            ddy = -1;
        }
        else {
            ddy = 0;
        }
        this.speed = new Vector(ddx, ddy).unit().times(2);
    };
    return Player;
}(Physics.DynamicBall));
var NullState = (function () {
    function NullState() {
    }
    NullState.prototype.weight = function (pt) {
        return 0;
    };
    return NullState;
}());
var IsolationState = (function () {
    function IsolationState() {
    }
    IsolationState.prototype.weight = function (pt) {
        var player = WorldInfo.player.position;
        if (WorldInfo.physics.lineOfSight(new LineSegment(pt, player))) {
            return 0;
        }
        else {
            return pt.distanceToSquared(player);
        }
    };
    return IsolationState;
}());
var AI = (function (_super) {
    __extends(AI, _super);
    function AI(p, r, s) {
        var _this = _super.call(this, p, r, s) || this;
        _this.state = new IsolationState();
        _this.path = [p];
        return _this;
    }
    AI.prototype.update_path = function () {
        var options = [];
        var self = this;
        WorldInfo.mesh.neighbors(this.path[0], 7).forEach(function (pt) {
            var weight = self.state.weight(pt);
            options.push([weight, pt]);
        });
        options.sort(function (a, b) { return b[0] - a[0]; });
        var objective = options[0][1];
        //BFS
        var successor = new VectorMap();
        var touched = new VectorSet();
        var queue = [];
        touched.add(this.path[0]);
        queue.push(this.path[0]);
        var _loop_2 = function () {
            var current = queue.shift();
            if (current.equals(objective)) {
                return "break";
            }
            WorldInfo.mesh.adjacent(current).forEach(function (n) {
                if (touched.has(n))
                    return;
                touched.add(n);
                successor.map(n, current);
                queue.push(n);
            });
        };
        while (queue.length !== 0) {
            var state_1 = _loop_2();
            if (state_1 === "break")
                break;
        }
        /*
        let r = "";
        successor.spread().forEach((a) => {r += "" + a.x + "," + a.y + ":" + successor.at(a).x + "," + successor.at(a).y + "\n"});
        console.log(objective.x + "," + objective.y + "\n" + r);
       */
        var path = [];
        for (var i = objective; i !== this.path[0]; i = successor.at(i)) {
            if (!i)
                break;
            path.push(i);
        }
        console.log(JSON.stringify(path));
        this.path = [options[0][1]];
    };
    AI.prototype.step = function () {
        var objective = this.path[0];
        var d = objective.minus(this.position);
        this.speed = d.clampTo(1);
        this.update_path();
        if (this.position.distanceTo(objective) < 1) {
            if (this.path.length > 1)
                this.path.shift();
        }
    };
    return AI;
}(Physics.DynamicBall));
//
//var contour = [
//        new poly2tri.Point(100, 100),
//        new poly2tri.Point(100, 300),
//        new poly2tri.Point(300, 300),
//        new poly2tri.Point(300, 100)
//];
//var swctx = new poly2tri.SweepContext(contour);
//swctx.triangulate();
//var triangles = swctx.getTriangles();
//triangles.forEach(function(t) {
//    t.getPoints().forEach(function(p) {
//        console.log(p.x, p.y);
//    });
//});
//
var WorldInfo = (function () {
    function WorldInfo() {
    }
    return WorldInfo;
}());
var canvasDOM = document.createElement("canvas");
document.body.appendChild(canvasDOM);
var ctx = canvasDOM.getContext("2d");
canvasDOM.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
canvasDOM.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
canvasDOM.width = 1280;
canvasDOM.height = 1080;
var physics = new Physics();
physics.setAcceleration(function (x, y) { return new Vector(0, 0); });
var player = new Player(new Vector(100, 100), 10, new Vector(0, 0));
physics.addDynamic(player);
var ai = new AI(new Vector(360, 360), 10, new Vector(0, 0));
physics.addDynamic(ai);
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(0, 0), new Vector(0, 500)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(0, 500), new Vector(500, 500)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(500, 500), new Vector(500, 0)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(500, 0), new Vector(0, 0)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(400, 370), new Vector(400, 400)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(370, 370), new Vector(400, 370)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(370, 400), new Vector(370, 370)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(400, 400), new Vector(370, 400)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(200, 300), new Vector(300, 200)));
var entities = [player, ai];
var mouse = new MouseHandler(canvasDOM);
WorldInfo.physics = physics;
WorldInfo.player = player;
WorldInfo.entities = entities;
WorldInfo.mesh = new NonintersectingFiniteGridNavigationMesh(20, 0, 500, 0, 500, WorldInfo.physics);
var draw = function () {
    ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height);
    ctx.fillRect(ai.path[0].x, ai.path[0].y, 10, 10);
    WorldInfo.mesh.neighbors(ai.path[0], 7).forEach(function (vertex) {
        ctx.fillRect(vertex.x, vertex.y, 5, 5);
    });
    physics.drawPhysics(ctx);
    window.requestAnimationFrame(draw);
};
draw();
setInterval(function () {
    entities.forEach(function (entity) {
        entity.step();
    });
    physics.stepPhysics();
}, 10);
//const r = new Runner();
//# sourceMappingURL=out.js.map