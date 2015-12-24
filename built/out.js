var Graphics;
(function (Graphics) {
    var GraphicsRenderer = (function () {
        function GraphicsRenderer(world) {
            this.world = world;
        }
        GraphicsRenderer.prototype.drawAll = function (ctx) {
            ctx.beginPath();
            this.world.getSurfaces().forEach(function (val) {
                val.draw(ctx);
            });
            ctx.stroke();
            this.world.getObjects().forEach(function (val) {
                val.draw(ctx);
            });
        };
        return GraphicsRenderer;
    })();
    Graphics.GraphicsRenderer = GraphicsRenderer;
    var Plant = (function () {
        function Plant() {
            this.iterations = 5;
            this.diam = Math.random() * 1 + 1;
            this.len = (Math.random() * (screen.height / (this.iterations + 1)) + screen.height / (this.iterations + 1)) / 2;
            this.diam_coef = Math.random() * .5 + .5;
            this.len_coef = Math.random() * .7 + .3;
            this.branches = Math.random() * 2 + 3;
            this.twig_chance = Math.random() * .5 + .5;
            this.max_angle = Math.random() * Math.PI / 2;
        }
        Plant.prototype.setIterations = function (p) {
            this.iterations = p;
            return this;
        };
        Plant.prototype.setDiameter = function (p) {
            this.diam = p;
            return this;
        };
        Plant.prototype.setLength = function (p) {
            this.len = p;
            return this;
        };
        Plant.prototype.setDiameterCoefficient = function (p) {
            this.diam_coef = p;
            return this;
        };
        Plant.prototype.setLengthCoefficient = function (p) {
            this.len_coef = p;
            return this;
        };
        Plant.prototype.setBranches = function (p) {
            this.branches = p;
            return this;
        };
        Plant.prototype.setTwigChance = function (p) {
            this.twig_chance = p;
            return this;
        };
        Plant.prototype.setMaxAngle = function (p) {
            this.max_angle = p;
            return this;
        };
        Plant.prototype.generate = function (x0, y0, ctx) {
            var bases_x = [x0], bases_y = [y0], angles = [3 * Math.PI / 2];
            var len_initial = this.len;
            var diam_initial = this.diam;
            for (var i = 0; i < this.iterations; i++) {
                ctx.lineWidth = diam_initial;
                var new_bases_x = [], new_bases_y = [], new_angles = [];
                for (var a = 0; a < bases_x.length; a++) {
                    for (var b = 0; b < this.branches; b++) {
                        if (Math.random() > this.twig_chance) {
                            continue;
                        }
                        var angle = (b / this.branches) * this.max_angle + Math.random() - .5, angle_adjusted0 = angles[a] + angle + Math.random() - .5, angle_adjusted1 = angles[a] - angle + Math.random() - .5;
                        ctx.beginPath();
                        ctx.moveTo(bases_x[a], bases_y[a]);
                        ctx.lineTo(bases_x[a] + Math.cos(angle_adjusted0) * len_initial, bases_y[a] + Math.sin(angle_adjusted0) * len_initial);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(bases_x[a], bases_y[a]);
                        ctx.lineTo(bases_x[a] + Math.cos(angle_adjusted1) * len_initial, bases_y[a] + Math.sin(angle_adjusted1) * len_initial);
                        ctx.stroke();
                        new_bases_x.push(bases_x[a] + Math.cos(angle_adjusted0) * len_initial);
                        new_bases_y.push(bases_y[a] + Math.sin(angle_adjusted0) * len_initial);
                        new_angles.push(angle_adjusted0);
                        new_bases_x.push(bases_x[a] + Math.cos(angle_adjusted1) * len_initial);
                        new_bases_y.push(bases_y[a] + Math.sin(angle_adjusted1) * len_initial);
                        new_angles.push(angle_adjusted1);
                    }
                }
                bases_x = new_bases_x;
                bases_y = new_bases_y;
                angles = new_angles;
                diam_initial *= this.diam_coef;
                len_initial *= this.len_coef;
            }
        };
        return Plant;
    })();
    Graphics.Plant = Plant;
})(Graphics || (Graphics = {}));
var Point = (function () {
    function Point() {
    }
    return Point;
})();
var Vector = (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
        this.vector = true;
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
    Vector.prototype.distanceTo = function (v) {
        var dx = v.x - this.x;
        var dy = v.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
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
})();
var VectorMath = (function () {
    function VectorMath() {
    }
    VectorMath.intersectBallBall = function (ball0, ball1) {
        if (ball0.position.distanceTo(ball1) < ball0.r + ball1.r) {
            return true;
        }
        return false;
    };
    VectorMath.project = function (a, b) {
        return a.dot(b.unit());
    };
    VectorMath.projectVector = function (a, b) {
        return b.unit().timesEquals(VectorMath.project(a, b));
    };
    return VectorMath;
})();
function rint(max) {
    return Math.floor(max * Math.random());
}
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
        var canvas = document.getElementById("draw");
        this.debugCtx = canvas.getContext("2d");
        this.debugVectorScalar = 100;
        this.debugLines = [];
        this.acceleration = function (x, y) {
            return new Vector(0, .05);
        };
        this.friction = function (x, y) {
            return .99;
        };
    }
    Physics.prototype.clearAll = function () {
        this.dynamics = [];
        this.statics = [];
        this.fixeds = [];
        this.triggers = [];
        this.timestamp = [];
        this.currentMaterial = new Physics.Material(1, "red", function () { });
    };
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
    Physics.prototype.setAcceleration = function (fn) {
        this.acceleration = fn;
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
            dynamic.move();
            dynamic.accelerate(self.acceleration(dynamic.position.x, dynamic.position.y));
            dynamic.speed.timesEquals(self.friction(dynamic.position.x, dynamic.position.y));
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
        var self = this;
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
        self.timestamp++;
    };
    Physics.prototype.drawPhysics = function (ctx) {
        var self = this;
        var canvas = ctx.canvas;
        ctx.fillStyle = "rgba(255,255,255,.01)";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
            this.bounce = bounce;
            this.debugColor = debugColor;
            this.callback = callback;
        }
        Material.defaultMaterial = function () {
            return new Physics.Material(0, "black", function (vol) { return void {}; });
        };
        return Material;
    })();
    Physics.Material = Material;
    var LineSegment = (function () {
        function LineSegment(v0, v1) {
            this.v0 = v0;
            this.v1 = v1;
        }
        return LineSegment;
    })();
    Physics.LineSegment = LineSegment;
    var Ball = (function () {
        function Ball(position, r) {
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
        DynamicBall.prototype.width = function () {
            return this.r * 2;
        };
        DynamicBall.prototype.height = function () {
            return this.r * 2;
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
var WorldBuilder;
(function (WorldBuilder) {
    var Surface = (function () {
        function Surface(material, border, drawFunction) {
            this.material = material;
            this.border = border;
            this.drawFunction = drawFunction;
        }
        Surface.prototype.setMaterial = function (material) {
            this.material = material;
            return this;
        };
        Surface.prototype.getMaterial = function () {
            return this.material;
        };
        Surface.prototype.setBorder = function (border) {
            this.border = border;
            return this;
        };
        Surface.prototype.getBorder = function () {
            return this.border;
        };
        Surface.prototype.setDrawFunction = function (fun) {
            this.drawFunction = fun;
            return this;
        };
        Surface.prototype.getDrawFunction = function () {
            return this.drawFunction;
        };
        Surface.prototype.draw = function (ctx) {
            this.drawFunction(ctx, this.getMaterial(), this.getBorder());
        };
        Surface.defaultSurface = function () {
            var defaultMaterial = Physics.Material.defaultMaterial();
            var defaultBorder = [];
            var defaultDrawFunction = function (ctx, material, border) {
                if (border.length === 0)
                    return;
                ctx.strokeStyle = material.debugColor;
                ctx.moveTo(border[0].x, border[0].y);
                border.forEach(function (val) {
                    ctx.lineTo(val.x, val.y);
                });
            };
            return new Surface(defaultMaterial, defaultBorder, defaultDrawFunction);
        };
        return Surface;
    })();
    WorldBuilder.Surface = Surface;
    var PerlinGenerator = (function () {
        function PerlinGenerator(height) {
            this.height = height;
            this.maximum_resolution = 15;
            this.minimum_resolution = 1;
            this.perlin_smoothness = .99;
            this.persistance = 1 / 4;
            this.interpolate = .3;
            this.max_wavelength = 500;
            this.DEFAULT_SEED = 3;
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
        PerlinGenerator.prototype.generate_perlin_with_parameters = function (x, minimum_resolution, maximum_resolution, max_wavelength, persistance, height) {
            if (x < this.min_x - 1) {
                this.generate_perlin_with_parameters(x + 1, minimum_resolution, maximum_resolution, max_wavelength, persistance, height);
            }
            if (x > this.max_x + 1) {
                this.generate_perlin_with_parameters(x - 1, minimum_resolution, maximum_resolution, max_wavelength, persistance, height);
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
                    y += self.cosine_interpolate(a, b, i) * self.interpolate + self.linear_interpolate(a, b, i) * (1 - self.interpolate);
                }
            });
            this.heights[x] = y;
            return this.heights[x] * height;
        };
        PerlinGenerator.prototype.generate_perlin_at = function (x) {
            return this.generate_perlin_with_parameters(x, this.minimum_resolution, this.maximum_resolution, this.max_wavelength, this.persistance, this.height);
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
        return PerlinGenerator;
    })();
    WorldBuilder.PerlinGenerator = PerlinGenerator;
    var Build1 = (function () {
        function Build1(physics) {
            this.xoffset = 0;
            this.physics = physics;
            this.physics.setAcceleration(function (x, y) {
                //return new Vector(-1*(x-canvas.width/2),-1*(y-canvas.width/2)).divided(1000);
                return new Vector(0, .02);
            });
            this.sounds = [];
            this.perlin = new WorldBuilder.PerlinGenerator(1080);
            this.x = 0;
            this.y = 0;
            this.build();
        }
        Build1.prototype.setPhysics = function (physics) {
            this.physics = physics;
        };
        Build1.prototype.getSurfaces = function () {
            return [];
        };
        Build1.prototype.getObjects = function () {
            return [];
        };
        Build1.prototype.setLevel = function (x, y) {
            var self = this;
            //self.perlin.setSeed((x >> 32) + y);
            if (self.x > x)
                self.xoffset -= 1280;
            else
                self.xoffset += 1280;
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
        Build1.prototype.build = function () {
            var self = this;
            self.physics.clearAll();
            var stat = function (x0, y0, x1, y1) {
                self.physics.addStatic(new Physics.LineSegment(new Vector(x0, y0), new Vector(x1, y1)));
            };
            var lastStroke = new Vector(0, 0);
            var moveTo = function (x, y) {
                lastStroke = new Vector(x, y);
            };
            var strokeTo = function (x, y) {
                var vec = new Vector(x, y);
                self.physics.addStatic(new Physics.LineSegment(lastStroke, vec));
                lastStroke = vec;
            };
            var glass = new Physics.Material(0, "black", function (vol) {
                if (vol < .05)
                    vol *= vol;
                vol = Math.min(vol, 1);
                var sounds = ["Percussive Elements-06.wav",
                    "Percussive Elements-04.wav",
                    "Percussive Elements-05.wav"
                ];
                var i = Math.floor(Math.random() * sounds.length);
                //self.playSound(sounds[i], vol);
            });
            if (!this.player)
                this.player = new Physics.DynamicBall(new Vector(413, 0), 10, new Vector(0, 0));
            self.physics.setMaterial(glass);
            moveTo(-1 * self.player.width(), this.getHeightAt(-1 * self.player.width()));
            for (var x = -1 * self.player.width(); x <= 1280 + self.player.width(); x++) {
                strokeTo(x, this.getHeightAt(x));
            }
            self.physics.addTrigger(new Physics.TriggerLineSegment(new Vector(0, 0), new Vector(0, 1080), function () {
                if (self.player.speed.x < 0) {
                    self.setLevel(self.x - 1, 0);
                    self.player.position.x = 1280 + self.player.width();
                }
            }));
            self.physics.addTrigger(new Physics.TriggerLineSegment(new Vector(1280, 0), new Vector(1280, 1080), function () {
                if (self.player.speed.x > 0) {
                    self.setLevel(self.x + 1, 0);
                    self.player.position.x = -1 * self.player.width();
                }
            }));
            self.physics.addDynamic(this.player);
        };
        return Build1;
    })();
    WorldBuilder.Build1 = Build1;
})(WorldBuilder || (WorldBuilder = {}));
/*Running*/
var canvas = document.getElementById("draw");
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
})();
/*Running*/
var Runner = (function () {
    function Runner(id) {
        var _this = this;
        this.canvasDOM = document.getElementById(id);
        this.ctx = this.canvasDOM.getContext("2d");
        this.canvasDOM.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        this.canvasDOM.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        this.canvasDOM.width = 450;
        this.canvasDOM.height = 900;
        this.canvasDOM.width = screen.width;
        this.canvasDOM.height = screen.height;
        this.world = new WorldBuilder.PerlinGenerator(this.canvasDOM.height);
        this.plants = new Graphics.Plant();
        this.physics = new Physics();
        this.builder = new WorldBuilder.Build1(this.physics);
        this.plants.setLength(25).setIterations(3);
        this.mouse = new MouseHandler(canvas);
        this.setUpInputs();
        var self = this;
        var draw = function () {
            self.physics.drawPhysics(self.ctx);
            self.checkInputs();
            window.requestAnimationFrame(draw);
        };
        draw();
        setInterval(function () {
            _this.physics.stepPhysics();
        }, 10);
    }
    Runner.prototype.setUpInputs = function () {
        var self = this;
        document.addEventListener('keydown', function (e) {
            var char = String.fromCharCode(e.keyCode);
            switch (char) {
                case 'A':
                    self.physics.setAcceleration(function (x, y) { return new Vector(-.03, .02); });
                    break;
                case 'D':
                    self.physics.setAcceleration(function (x, y) { return new Vector(.03, .02); });
                    break;
            }
        }, false);
        document.addEventListener('keyup', function (e) {
            var char = String.fromCharCode(e.keyCode);
            switch (char) {
                case 'A':
                case 'D':
                    self.physics.setAcceleration(function (x, y) { return new Vector(0, .02); });
                    break;
            }
        }, false);
    };
    Runner.prototype.checkInputs = function () {
        this.ctx.strokeStyle = "black";
        if (this.mouse.down()) {
            this.ctx.beginPath();
            this.ctx.moveTo(Math.floor(this.mouse.getXOnDown()), Math.floor(this.mouse.getYOnDown()));
            this.ctx.lineTo(Math.floor(this.mouse.getX()), Math.floor(this.mouse.getY()));
            this.ctx.stroke();
        }
    };
    return Runner;
})();
//# sourceMappingURL=out.js.map