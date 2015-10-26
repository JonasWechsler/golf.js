/*Game time*/

function Physics() {
    var dynamics = [];
    var statics = [];
    var fixeds = [];
    var triggers = [];
    var timestamp = 0;
    var currentMaterial = new Physics.Material(1, "red", function() {});

    var debug = true;
    var debugCtx = document.getElementById("draw").getContext("2d");
    var debugVectorScalar = 100;
    var debugLines = [];

    this.clearAll = function() {
        dynamics = [];
        statics = [];
        fixeds = [];
        triggers = [];
        timestamp = [];
        currentMaterial = new Physics.Material(1, "red", function() {});
    }

    this.acceleration = function(x, y) {
        return new Vector(0, .05);
    };

    friction = function(x, y) {
        return .99;
    };

    this.setMaterial = function(material) {
        currentMaterial = material;
    }

    this.polygon = function(x, y, r, sides) {
        var sides = [];
        var last_theta = (1 - 1 / sides) * Math.PI * 2,
            last_x0 = Math.cos(last_theta) * r,
            last_y0 = Math.sin(last_theta) * r;
        for (var i = 0; i < sides; i++) {
            var theta = (i / sides) * Math.PI * 2;
            var x0 = Math.cos(theta) * r;
            var y0 = Math.sin(theta) * r;
            sides.push(new Physics.LineSegment(new Vector(last_x0, last_y0), new Vector(x0, y0)));
            last_theta = theta;
            last_x0 = x0;
            last_y0 = y0;
        }
        return sides;
    }


    this.addStatic = function(stat) {
        stat.material = currentMaterial;
        statics.push(stat);
    }

    this.addDynamic = function(dynamic) {
        if (!dynamic.move || !dynamic.accelerate || !dynamic.position) {
            throw "Dynamics must have move(), accelerate(vector), and position attributes";
        }
        dynamics.push(dynamic);
    }

    this.addFixed = function(fixed) {
        if (!fixed.move || !fixed.position || !fixed.getSpeedAt) {
            throw "Dynamics must have move(), getSpeedAt(Vector), and position attributes";
        }
        fixed.material = currentMaterial;
        fixeds.push(fixed);
    }

    this.addTrigger = function(trigger) {
        if (!trigger.effect)
            throw "Triggers must have effects";
        triggers.push(trigger);
    }

    this.setAcceleration = function(fn) {
        acceleration = fn;
    }

    this.stepPhysics = function() {
        /**
         * 1 move all dynamics according to level rules. This includes momentum, friction, and other forces
         * 2 check for dynamic on static collisions
         * 3 move all fixeds according to their specific rules.
         */
        triggers.forEach(function(trigger) {
            dynamics.forEach(function(dynamic) {
                if (trigger.type === "LineSegment" && VectorMath.intersectSegBall(trigger, dynamic)) {
                    trigger.effect();
                }
                if (trigger.type === "Ball" && VectorMath.intersectBallBall(trigger, dynamic)) {
                    trigger.effect();
                }
            });
        });

        dynamics.forEach(function(dynamic) {
            dynamic.move();
            dynamic.accelerate(acceleration(dynamic.position.x, dynamic.position.y));
            dynamic.speed.timesEquals(friction(dynamic.position.x, dynamic.position.y));
        });

        fixeds.forEach(function(fixed) {
            fixed.move();
        });

        var resolveCollision = function(dynamic, stat) {
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

            if (debug) {

                debugLines.push({
                    x0: dynamic.position.x,
                    y0: dynamic.position.y,
                    x1: overlapVector.times(100).plus(dynamic.position).x,
                    y1: overlapVector.times(100).plus(dynamic.position).y,
                    color: "rgba(0,0,255,.5)"
                });
                debugLines.push({
                    x0: dynamic.position.x,
                    y0: dynamic.position.y,
                    x1: rejectedSpeedVector.x * debugVectorScalar + dynamic.position.x,
                    y1: rejectedSpeedVector.y * debugVectorScalar + dynamic.position.y,
                    color: "rgba(255,0,0,.5)"
                });
                debugLines.push({
                    x0: dynamic.position.x,
                    y0: dynamic.position.y,
                    x1: projectedSpeedVector.x * debugVectorScalar + dynamic.position.x,
                    y1: projectedSpeedVector.y * debugVectorScalar + dynamic.position.y,
                    color: "rgba(0,255,0,.5)"
                });
            }

            if (dynamic.speed.length() > 1 || stat.material.bounce >= 1) {
                dynamic.speed = projectedSpeedVector.plus(rejectedSpeedVector.timesEquals(-1 * stat.material.bounce));
            }
            stat.material.callback(dynamic.speed.length() / dynamic.maxSpeed);
            dynamic.position = dynamic.position.minus(overlapVector);
        }


        dynamics.forEach(function(dynamic) {
            var deepest_collision = {
                overlap: Math.pow(2, 32) - 1
            };
            statics.forEach(function(stat) {
                var collision = VectorMath.intersectSegBall(stat, dynamic);
                if (collision) {
                    resolveCollision(dynamic, stat);
                }
            });
            fixeds.forEach(function(fixed) {
                var collision = false,
                    collided = fixed;
                if (fixed.segments) {
                    for (var i = 0; i < fixed.segments.length; i++) {
                        var val = fixed.segments[i];
                        collision = VectorMath.intersectSegBall(val, dynamic);
                        if (collision) {
                            collided = fixed.segments[i];
                            collided.material = fixed.material;
                            break;
                        }
                    }
                } else {
                    collision = VectorMath.intersectSegBall(fixed, dynamic);
                }
                if (collision) {
                    resolveCollision(dynamic, collided);
                    dynamic.speed = dynamic.speed.plus(fixed.getSpeedAt(dynamic.position));
                }
            });
        });
        //TODO Fix "sticky" back collisions
        timestamp++;
    }

    this.drawPhysics = function(ctx) {
        ctx.fillStyle = "rgba(255,255,255,.01)";
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < statics.length; i++) {
            var v = statics[i];
            var v0 = v.v0;
            var v1 = v.v1;
            if (debug) {
                ctx.strokeStyle = v.material.debugColor;
                ctx.fillStyle = v.material.debugColor;
            }
            ctx.beginPath();
            ctx.moveTo(v0.x, v0.y);
            ctx.lineTo(v1.x, v1.y);
            ctx.stroke();
        }

        for (var i = 0; i < fixeds.length; i++) {
            var fixed = fixeds[i];
            ctx.strokeStyle = fixed.material.debugColor;
            ctx.fillStyle = fixed.material.debugColor;
            if (fixed.segments) {
                for (var j = 0; j < fixed.segments.length; j++) {
                    var v = fixed.segments[j],
                        v0 = v.v0,
                        v1 = v.v1;

                    ctx.beginPath();
                    ctx.moveTo(v0.x, v0.y);
                    ctx.lineTo(v1.x, v1.y);
                    ctx.stroke();
                }
            } else {
                var v0 = fixed.v0;
                var v1 = fixed.v1;

                ctx.beginPath();
                ctx.moveTo(v0.x, v0.y);
                ctx.lineTo(v1.x, v1.y);
                ctx.stroke();
            }
        }

        if (debug)
            debugLines.forEach(function(val) {
                ctx.strokeStyle = val.color;
                ctx.beginPath();
                ctx.moveTo(val.x0, val.y0);
                ctx.lineTo(val.x1, val.y1);
                ctx.stroke();
                if (debugLines.length > 10)
                    debugLines.shift();
            });

        ctx.strokeStyle = "blue";
        ctx.fillStyle = "blue";
        for (var i = 0; i < dynamics.length; i++) {
            ctx.beginPath();
            ctx.arc(dynamics[i].position.x, dynamics[i].position.y, dynamics[i].r, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.moveTo(dynamics[i].position.x, dynamics[i].position.y);
            ctx.lineTo(dynamics[i].position.x + dynamics[i].speed.x * debugVectorScalar,
                dynamics[i].position.y + dynamics[i].speed.y * debugVectorScalar);
            ctx.stroke();
        }
    }
}

Physics.Material = function(bounce, debugColor, callback) {
    this.bounce = bounce;
    this.debugColor = debugColor;
    this.callback = callback;
}

Physics.LineSegment = function(v0, v1) {
    if (!v0.vector || !v1.vector) {
        throw new Exception("Parameters should be vectors");
    }
    this.v0 = v0;
    this.v1 = v1;
}

Physics.Ball = function(position, r) {
    if (!position.vector) {
        throw new Exception("Center should be a vector");
    }
    if (!r) {
        throw new Exception("Radius should be number > 0");
    }
    this.position = position;
    this.r = r;
}

Physics.DynamicBall = function(position, r, speed) {
    if (!position.vector) {
        throw new Exception("Center should be a vector");
    }
    if (!r) {
        throw new Exception("Radius should be number > 0");
    }
    this.type = "ball";
    this.position = position;
    this.r = r;
    this.maxSpeed = this.r;
    this.speed = speed;
    this.accelerate = function(v) {
        this.speed = this.speed.plus(v);
    }
    this.move = function() {
        if (this.speed.length() > this.maxSpeed) {
            this.speed = this.speed.unit().times(this.r);
        }
        this.position = this.position.plus(this.speed);

    }
}

Physics.Flapper = function(position, angleSpeed, upAngle, downAngle) {
    if (!position.vector) {
        throw new Exception("Center should be a vector");
    }
    this.type = "spinner";
    this.position = position;
    this.up = false;
    this.moving = false;
    this.upAngle = upAngle;
    this.downAngle = downAngle;
    this.angle = this.downAngle;
    this.angleSpeed = angleSpeed;
    var structure = [2, -11,
        48, 20,
        49, 24,
        49, 28, //tip
        45, 32,
        41, 32, -5, 10, -11, 5, -12, -1, -9, -7, -4, -11,
        2, -11
    ];
    this.segments = [];
    for (var i = 2; i < structure.length; i += 2) {
        var v0 = new Vector(structure[i - 2] + position.x, structure[i - 1] + position.y),
            v1 = new Vector(structure[i] + position.x, structure[i + 1] + position.y),
            segment = new Physics.LineSegment(v0, v1);
        segment.material = this.material;
        this.segments.push(new Physics.LineSegment(v0, v1));
    }
    this.getSpeedAt = function(position) {
        if (!this.moving)
            return 0;
        var speed = 2 * Math.PI * this.position.distanceTo(position) * this.angleSpeed * Math.PI;
        var translated = this.segments[2].v1.minus(this.position);
        var perp = new Vector(translated.y * -1, translated.x).unit().times(speed);

        return perp;
    }
    this.move = function() {
        if (this.angle / this.upAngle < 1 && this.up) {
            if (1 - this.angle / this.upAngle < this.angleSpeed / this.upAngle) {
                this.angle = this.upAngle;
                this.moving = false;
            } else {
                this.angle += this.angleSpeed;
                this.moving = true;
            }
        } else if (this.angle / this.downAngle > 1 && !this.up) {
            if (this.angle / this.downAngle < this.angleSpeed / this.downAngle) {
                this.angle = this.downAngle;
                this.moving = false;
            } else {
                this.angle -= this.angleSpeed;
                this.moving = true;
            }
        } else {
            this.moving = false;
        }
        this.segments = [];
        for (var i = 2; i < structure.length; i += 2) {
            var v0 = new Vector(structure[i - 2] + position.x, structure[i - 1] + position.y)
                .rotate(this.angle * Math.PI, this.position);
            var v1 = new Vector(structure[i] + position.x, structure[i + 1] + position.y)
                .rotate(this.angle * Math.PI, this.position);
            var segment = new Physics.LineSegment(v0, v1);
            segment.material = this.material;
            this.segments.push(new Physics.LineSegment(v0, v1));
        }
    }
}

Physics.TriggerBall = function(position, r, effect) {
    if (!position.vector) {
        throw new Exception("Center should be a vector");
    }
    if (!r) {
        throw new Exception("Radius should be number > 0");
    }
    this.type = "Ball";
    this.position = position;
    this.r = r;
    this.effect = effect;
}

Physics.TriggerLineSegment = function(v0, v1, effect) {
    if (!v0.vector || !v1.vector) {
        throw new Exception("Parameters should be vectors");
    }
    this.type = "LineSegment";
    this.v0 = v0;
    this.v1 = v1;
    this.effect = effect;
}