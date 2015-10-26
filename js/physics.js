/*Game time*/
var Physics = (function () {
    function Physics() {
        this.currentMaterial = new Physics.Material(1, "red", function () { });
        this.dynamics = [];
        this.statics = [];
        this.fixeds = [];
        this.triggers = [];
        this.timestamp = [];
        this.debug = true;
        this.debugCtx = document.getElementById("draw").getContext("2d");
        this.debugVectorScalar = 100;
        this.debugLines = [];
    }
    Physics.prototype.clearAll = function () {
        this.dynamics = [];
        this.statics = [];
        this.fixeds = [];
        this.triggers = [];
        this.timestamp = [];
        this.currentMaterial = new Physics.Material(1, "red", function () { });
    };
    Physics.prototype.acceleration = function (x, y) {
        return new Vector(0, .05);
    };
    ;
    Physics.prototype.friction = function (x, y) {
        return .99;
    };
    ;
    Physics.prototype.setMaterial = function (material) {
        this.currentMaterial = material;
    };
    Physics.prototype.polygon = function (x, y, r, numSides) {
        var sides = [];
        var last_theta = (1 - 1 / numSides) * Math.PI * 2, last_x0 = Math.cos(last_theta) * r, last_y0 = Math.sin(last_theta) * r;
        for (var i = 0; i < numSides; i++) {
            var theta = (i / numSides) * Math.PI * 2;
            var x0 = Math.cos(theta) * r;
            var y0 = Math.sin(theta) * r;
            sides.push(new Physics.LineSegment(new Vector(last_x0, last_y0), new Vector(x0, y0)));
            last_theta = theta;
            last_x0 = x0;
            last_y0 = y0;
        }
        return sides;
    };
    Physics.prototype.addStatic = function (stat) {
        stat.material = this.currentMaterial;
        this.statics.push(stat);
    };
    Physics.prototype.addDynamic = function (dynamic) {
        if (!dynamic.move || !dynamic.accelerate || !dynamic.position) {
            throw "Dynamics must have move(), accelerate(vector), and position attributes";
        }
        this.dynamics.push(dynamic);
    };
    Physics.prototype.addFixed = function (fixed) {
        if (!fixed.move || !fixed.position || !fixed.getSpeedAt) {
            throw "Dynamics must have move(), getSpeedAt(Vector), and position attributes";
        }
        fixed.material = this.currentMaterial;
        this.fixeds.push(fixed);
    };
    Physics.prototype.addTrigger = function (trigger) {
        if (!trigger.effect)
            throw "Triggers must have effects";
        this.triggers.push(trigger);
    };
    Physics.prototype.setAcceleration = function (fn) {
        this.acceleration = fn;
    };
    Physics.prototype.stepPhysics = function () {
        /**
         * 1 move all dynamics according to level rules. This includes momentum, friction, and other forces
         * 2 check for dynamic on static collisions
         * 3 move all fixeds according to their specific rules.
         */
        this.triggers.forEach(function (trigger) {
            this.dynamics.forEach(function (dynamic) {
                if (trigger.type === "LineSegment" && Physics.intersectSegBall(trigger, dynamic)) {
                    trigger.effect();
                }
                if (trigger.type === "Ball" && VectorMath.intersectBallBall(trigger, dynamic)) {
                    trigger.effect();
                }
            });
        });
        this.dynamics.forEach(function (dynamic) {
            dynamic.move();
            dynamic.accelerate(this.acceleration(dynamic.position.x, dynamic.position.y));
            dynamic.speed.timesEquals(this.friction(dynamic.position.x, dynamic.position.y));
        });
        this.fixeds.forEach(function (fixed) {
            fixed.move();
        });
        var resolveCollision = function (dynamic, stat) {
            var v0 = stat.v0;
            var v1 = stat.v1;
            var originStatic = v1.minus(v0);
            var originDynamic = dynamic.position.minus(v0);
            var projectedScalar = VectorMath.project(originDynamic, originStatic);
            var projectedVector = v0.plus(originStatic.unit().times(projectedScalar));
            var overlap = dynamic.r - dynamic.position.distanceTo(projectedVector);
            if (overlap > dynamic.r)
                return;
            var overlapVector = projectedVector.minus(dynamic.position).unitTimes(overlap);
            var projectedSpeed = VectorMath.project(dynamic.speed, originStatic);
            var projectedSpeedVector = VectorMath.projectVector(dynamic.speed, originStatic);
            var rejectedSpeedVector = dynamic.speed.minus(projectedSpeedVector);
            if (!overlapVector.unit().equals(rejectedSpeedVector.unit()))
                return;
            var perpendicularComponent = Math.sqrt(dynamic.speed.length() * dynamic.speed.length() - projectedSpeed * projectedSpeed);
            if (this.debug) {
                this.debugLines.push({
                    x0: dynamic.position.x,
                    y0: dynamic.position.y,
                    x1: overlapVector.times(100).plus(dynamic.position).x,
                    y1: overlapVector.times(100).plus(dynamic.position).y,
                    color: "rgba(0,0,255,.5)"
                });
                this.debugLines.push({
                    x0: dynamic.position.x,
                    y0: dynamic.position.y,
                    x1: rejectedSpeedVector.x * this.debugVectorScalar + dynamic.position.x,
                    y1: rejectedSpeedVector.y * this.debugVectorScalar + dynamic.position.y,
                    color: "rgba(255,0,0,.5)"
                });
                this.debugLines.push({
                    x0: dynamic.position.x,
                    y0: dynamic.position.y,
                    x1: projectedSpeedVector.x * this.debugVectorScalar + dynamic.position.x,
                    y1: projectedSpeedVector.y * this.debugVectorScalar + dynamic.position.y,
                    color: "rgba(0,255,0,.5)"
                });
            }
            if (dynamic.speed.length() > 1 || stat.material.bounce >= 1) {
                dynamic.speed = projectedSpeedVector.plus(rejectedSpeedVector.timesEquals(-1 * stat.material.bounce));
            }
            stat.material.callback(dynamic.speed.length() / dynamic.maxSpeed);
            dynamic.position = dynamic.position.minus(overlapVector);
        };
        this.dynamics.forEach(function (dynamic) {
            var deepest_collision = {
                overlap: Math.pow(2, 32) - 1
            };
            this.statics.forEach(function (stat) {
                var collision = Physics.intersectSegBall(stat, dynamic);
                if (collision) {
                    resolveCollision(dynamic, stat);
                }
            });
            this.fixeds.forEach(function (fixed) {
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
                    resolveCollision(dynamic, collided);
                    dynamic.speed = dynamic.speed.plus(fixed.getSpeedAt(dynamic.position));
                }
            });
        });
        //TODO Fix "sticky" back collisions
        this.timestamp++;
    };
    Physics.prototype.drawPhysics = function (ctx) {
        ctx.fillStyle = "rgba(255,255,255,.01)";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < this.statics.length; i++) {
            var v = this.statics[i];
            var v0 = v.v0;
            var v1 = v.v1;
            if (this.debug) {
                ctx.strokeStyle = v.material.this.debugColor;
                ctx.fillStyle = v.material.this.debugColor;
            }
            ctx.beginPath();
            ctx.moveTo(v0.x, v0.y);
            ctx.lineTo(v1.x, v1.y);
            ctx.stroke();
        }
        for (var i = 0; i < this.fixeds.length; i++) {
            var fixed = this.fixeds[i];
            ctx.strokeStyle = fixed.material.this.debugColor;
            ctx.fillStyle = fixed.material.this.debugColor;
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
        if (this.debug)
            this.debugLines.forEach(function (val) {
                ctx.strokeStyle = val.color;
                ctx.beginPath();
                ctx.moveTo(val.x0, val.y0);
                ctx.lineTo(val.x1, val.y1);
                ctx.stroke();
                if (this.debugLines.length > 10)
                    this.debugLines.shift();
            });
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
    };
    Physics.intersectSegBall = function (seg, ball) {
        //http://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
        var d = seg.v1.minus(seg.v0), f = seg.v0.minus(ball.position), a = d.dot(d), b = 2 * f.dot(d), c = f.dot(f) - ball.r * ball.r;
        var discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
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
    return Physics;
})();
var Physics;
(function (Physics) {
    var Material = (function () {
        function Material(bounce, debugColor, callback) {
        }
        return Material;
    })();
    Physics.Material = Material;
    var LineSegment = (function () {
        function LineSegment(v0, v1) {
            if (!v0.vector || !v1.vector) {
                throw "Parameters should be vectors";
            }
            this.v0 = v0;
            this.v1 = v1;
        }
        return LineSegment;
    })();
    Physics.LineSegment = LineSegment;
    var Ball = (function () {
        function Ball(position, r) {
            if (!position.vector) {
                throw "Center should be a vector";
            }
            if (!r) {
                throw "Radius should be number > 0";
            }
            this.position = position;
            this.r = r;
        }
        return Ball;
    })();
    Physics.Ball = Ball;
    var DynamicBall = (function () {
        function DynamicBall(position, r, speed) {
            if (!position.vector) {
                throw "Center should be a vector";
            }
            if (!r) {
                throw "Radius should be number > 0";
            }
            this.position = position;
            this.r = r;
            this.maxSpeed = this.r;
            this.speed = speed;
        }
        DynamicBall.prototype.accelerate = function (v) {
            this.speed = this.speed.plus(v);
        };
        DynamicBall.prototype.move = function () {
            if (this.speed.length() > this.maxSpeed) {
                this.speed = this.speed.unit().times(this.r);
            }
            this.position = this.position.plus(this.speed);
        };
        return DynamicBall;
    })();
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
                var v0 = new Vector(this.structure[i - 2] + position.x, this.structure[i - 1] + position.y), v1 = new Vector(this.structure[i] + position.x, this.structure[i + 1] + position.y), segment = new Physics.LineSegment(v0, v1);
                segment.material = this.material;
                this.segments.push(new Physics.LineSegment(v0, v1));
            }
        }
        Flapper.prototype.getSpeedAt = function (position) {
            if (!this.moving)
                return 0;
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
                var segment = new Physics.LineSegment(v0, v1);
                segment.material = this.material;
                this.segments.push(new Physics.LineSegment(v0, v1));
            }
        };
        return Flapper;
    })();
    Physics.Flapper = Flapper;
    var TriggerBall = (function () {
        function TriggerBall(position, r, effect) {
            this.position = position;
            this.r = r;
            this.effect = effect;
        }
        return TriggerBall;
    })();
    Physics.TriggerBall = TriggerBall;
    var TriggerLineSegment = (function () {
        function TriggerLineSegment(v0, v1, effect) {
            this.v0 = v0;
            this.v1 = v1;
            this.effect = effect;
        }
        return TriggerLineSegment;
    })();
    Physics.TriggerLineSegment = TriggerLineSegment;
})(Physics || (Physics = {}));
