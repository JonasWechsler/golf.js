function Graphics() {
}
Graphics.Plant = function () {
    var iterations = 5, diam = Math.random() * 1 + 1, len = (Math.random() * (screen.height / (iterations + 1)) + screen.height / (iterations + 1)) / 2, diam_coef = Math.random() * .5 + .5, len_coef = Math.random() * .7 + .3, branches = Math.random() * 2 + 3, twig_chance = Math.random() * .5 + .5, max_angle = Math.random() * Math.PI / 2;
    this.setIterations = function (p) {
        iterations = p;
        return this;
    };
    this.setDiameter = function (p) {
        diam = p;
        return this;
    };
    this.setLength = function (p) {
        len = p;
        return this;
    };
    this.setDiameterCoefficient = function (p) {
        diam_coef = p;
        return this;
    };
    this.setLengthCoefficient = function (p) {
        len_coef = p;
        return this;
    };
    this.setBranches = function (p) {
        branches = p;
        return this;
    };
    this.setTwigChance = function (p) {
        twig_chance = p;
        return this;
    };
    this.setMaxAngle = function (p) {
        max_angle = p;
        return this;
    };
    this.generate = function (x0, y0, ctx) {
        var bases_x = [x0], bases_y = [y0], angles = [3 * Math.PI / 2];
        var len_initial = len;
        var diam_initial = diam;
        for (var i = 0; i < iterations; i++) {
            ctx.lineWidth = diam_initial;
            var new_bases_x = [], new_bases_y = [], new_angles = [];
            for (var a = 0; a < bases_x.length; a++) {
                for (var b = 0; b < branches; b++) {
                    if (Math.random() > twig_chance) {
                        continue;
                    }
                    var angle = (b / branches) * max_angle + Math.random() - .5, angle_adjusted0 = angles[a] + angle + Math.random() - .5, angle_adjusted1 = angles[a] - angle + Math.random() - .5;
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
            diam_initial *= diam_coef;
            len_initial *= len_coef;
        }
    };
};
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
        return (this.x - v.x) < .0001 && (this.y - v.y) < .0001;
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
    Physics.prototype.stepPhysics = function () {
        var self = this;
        /**
         * 1 move all dynamics according to level rules. This includes momentum, friction, and other forces
         * 2 check for dynamic on static collisions
         * 3 move all fixeds according to their specific rules.
         */
        self.triggers.forEach(function (trigger) {
            self.dynamics.forEach(function (dynamic) {
                if (trigger.type === "LineSegment" && Physics.intersectSegBall(trigger, dynamic)) {
                    trigger.effect();
                }
                if (trigger.type === "Ball" && VectorMath.intersectBallBall(trigger, dynamic)) {
                    trigger.effect();
                }
            });
        });
        self.dynamics.forEach(function (dynamic) {
            dynamic.move();
            dynamic.accelerate(self.acceleration(dynamic.position.x, dynamic.position.y));
            dynamic.speed.timesEquals(self.friction(dynamic.position.x, dynamic.position.y));
        });
        self.fixeds.forEach(function (fixed) {
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
        self.dynamics.forEach(function (dynamic) {
            var deepest_collision = {
                overlap: Math.pow(2, 32) - 1
            };
            self.statics.forEach(function (stat) {
                var collision = Physics.intersectSegBall(stat, dynamic);
                if (collision) {
                    resolveCollision(dynamic, stat);
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
                    resolveCollision(dynamic, collided);
                    dynamic.speed = dynamic.speed.plus(fixed.getSpeedAt(dynamic.position));
                }
            });
        });
        //TODO Fix "sticky" back collisions
        self.timestamp++;
    };
    Physics.prototype.drawPhysics = function (ctx) {
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
            this.bounce = bounce;
            this.debugColor = debugColor;
            this.callback = callback;
        }
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
function WorldBuilder() {
}
WorldBuilder.Screen = function () {
};
WorldBuilder.PerlinGenerator = function (height) {
    var heights = {
        '-1': height / 2,
        '0': height / 2,
        '1': height / 2
    };
    var x = 0;
    var max_x = -1;
    var min_x = 1;
    var perlin_resolution = 15;
    var left_perlin_subgraph = [];
    var right_perlin_subgraph = [];
    var perlin_smoothness = .9965; //0<smooth<1
    var seed = new Date().getTime();
    this.setSeed = function (s) {
        seed = s;
    };
    var random = function () {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
    var generate_perlin_at = function (x) {
        var active_subgraphs = [];
        var last_y = 0;
        if (x < min_x) {
            min_x = x;
            last_y = heights[x + 1];
            active_subgraphs = left_perlin_subgraph;
        }
        else if (x > max_x) {
            max_x = x;
            last_y = heights[x - 1];
            active_subgraphs = right_perlin_subgraph;
        }
        else {
            return heights[x];
        }
        var new_point = false;
        for (var idx = 1; idx < perlin_resolution; idx++) {
            var frequency = Math.pow(2, idx), wavelength = Math.floor(200 / frequency);
            if (x % wavelength == 0) {
                var persistance = 1 / 2, amplitude = Math.pow(persistance, idx) * height;
                active_subgraphs[idx] = amplitude * random();
                new_point = true;
            }
        }
        var y = 0;
        if (new_point) {
            active_subgraphs.forEach(function (val) {
                if (val)
                    y += val;
            });
            y = last_y * perlin_smoothness + y * (1 - perlin_smoothness);
        }
        else {
            y = last_y;
        }
        heights[x] = y;
        return y;
    };
    this.getHeightAt = function (x) {
        return generate_perlin_at(x);
    };
};
WorldBuilder.Build1 = function (physics) {
    physics.setAcceleration(function (x, y) {
        //return new Vector(-1*(x-canvas.width/2),-1*(y-canvas.width/2)).divided(1000);
        return new Vector(0, .02);
    });
    var sounds = [];
    var playSound = function (sound, vol) {
        if (!sounds[sound]) {
            sounds[sound] = new Audio('sounds/' + sound);
        }
        sounds[sound].volume = vol;
        sounds[sound].play();
    };
    var build = function () {
        physics.clearAll();
        var stat = function (x0, y0, x1, y1) {
            physics.addStatic(new Physics.LineSegment(new Vector(x0, y0), new Vector(x1, y1)));
        };
        var lastStroke = new Vector(0, 0);
        var moveTo = function (x, y) {
            lastStroke = new Vector(x, y);
        };
        var strokeTo = function (x, y) {
            var vec = new Vector(x, y);
            physics.addStatic(new Physics.LineSegment(lastStroke, vec));
            lastStroke = vec;
        };
        var glass = new Physics.Material(0, "black", function (vol) {
            if (vol < .05)
                vol *= vol;
            vol = Math.min(vol, 1);
            var sounds = ["Percussive Elements-06.wav",
                "Percussive Elements-04.wav",
                "Percussive Elements-05.wav"
            ], i = Math.floor(Math.random() * sounds.length);
            playSound(sounds[i], vol);
        });
        physics.setMaterial(glass);
        var world = new WorldBuilder.PerlinGenerator(1080);
        moveTo(0, 0);
        for (var x = 0; x < 1280; x++) {
            strokeTo(x, 1080 - world.getHeightAt(x));
        }
        strokeTo(1280 - 1, 0);
        physics.addDynamic(new Physics.DynamicBall(new Vector(413, 370), 10, new Vector(0, 0)));
    };
    build();
};
/*Running*/
var canvas = document.getElementById("draw");
function MouseHandler(element) {
    function relMouseCoords(event) {
        var rect = element.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        return { x: x, y: y };
    }
    var mouseXOnDown = 0;
    var mouseYOnDown = 0;
    var mouseX = 0;
    var mouseY = 0;
    var mouseDown = false;
    element.addEventListener('mousedown', function (e) {
        mouseDown = true;
        var point = relMouseCoords(e);
        mouseXOnDown = point.x;
        mouseYOnDown = point.y;
    });
    element.addEventListener('mousemove', function (e) {
        var point = relMouseCoords(e);
        mouseX = Math.floor(point.x);
        mouseY = Math.floor(point.y);
    });
    element.addEventListener('mouseup', function (e) {
        mouseDown = false;
    });
    this.getX = function () {
        return mouseX;
    };
    this.getY = function () {
        return mouseY;
    };
    this.getXOnDown = function () {
        return mouseXOnDown;
    };
    this.getYOnDown = function () {
        return mouseYOnDown;
    };
    this.down = function () {
        return mouseDown;
    };
}
var mouse = new MouseHandler(canvas);
document.addEventListener('keydown', function (e) {
    var char = String.fromCharCode(e.keyCode);
    switch (char) {
        case 'A':
            physics.setAcceleration(function (x, y) { return new Vector(-.03, .02); });
            break;
        case 'D':
            physics.setAcceleration(function (x, y) { return new Vector(.03, .02); });
            break;
    }
}, false);
document.addEventListener('keyup', function (e) {
    var char = String.fromCharCode(e.keyCode);
    switch (char) {
        case 'A':
        case 'D':
            physics.setAcceleration(function (x, y) { return new Vector(0, .02); });
            break;
    }
}, false);
function checkInputs() {
    ctx.strokeStyle = "black";
    if (mouse.down()) {
        ctx.beginPath();
        ctx.moveTo(Math.floor(mouse.getXOnDown()), Math.floor(mouse.getYOnDown()));
        ctx.lineTo(Math.floor(mouse.getX()), Math.floor(mouse.getY()));
        ctx.stroke();
    }
}
/*Running*/
var canvas = document.getElementById("draw");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
canvas.width = 450;
canvas.height = 900;
canvas.width = screen.width;
canvas.height = screen.height;
var world = new WorldBuilder.PerlinGenerator(canvas.height);
var plants = new Graphics.Plant();
var physics = new Physics();
var builder = new WorldBuilder.Build1(physics);
plants.setLength(25).setIterations(3);
function runPhysics() {
    physics.stepPhysics();
    setTimeout(runPhysics, 10);
}
function draw() {
    physics.drawPhysics(ctx);
    checkInputs();
    window.requestAnimationFrame(draw);
}
window.requestAnimationFrame(draw);
runPhysics();
/*
 *
 *               (Vector Tools)
 *                    |
 *               (Physics Engine)
 *                    |
 *  (Save Data)  (Game World)-+
 *        \           |       |
 *    (Back end)-(Game Rules)-|-(Inputs)
 *         |                  |
 *      (Game)-(Front End)-(Graphics)
 *
 *
 */
//# sourceMappingURL=out.js.map