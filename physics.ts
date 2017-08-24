/*Game time*/

class Physics {
    private dynamics: Physics.Dynamic[];
    private statics: Physics.StaticLineSegment[];
    private fixeds: Physics.Fixed[];
    private triggers: Physics.Trigger[];
    private timestamp: number;

    private currentMaterial: Physics.Material;
    private debug: boolean;
    private debugVectorScalar: number;
    private debugLines: any;
    private friction: (x: number, y: number) => number;
    private acceleration: (x: number, y: number) => Vector;

    constructor() {
        this.currentMaterial = new Physics.Material(1, "red", function() { }, function(x,y){
            return 0.01;
        });

        this.dynamics = [];
        this.statics = [];
        this.fixeds = [];
        this.triggers = [];
        this.timestamp = 0;

        this.debug = false;
        this.debugVectorScalar = 100;
        this.debugLines = [];

        this.acceleration = function(x, y) {
            return new Vector(0, .05);
        }
        this.friction = function(x, y) {
            return 0.01;
        }
    }

    public clearAll() {
        this.dynamics = [];
        this.statics = [];
        this.fixeds = [];
        this.triggers = [];
        this.timestamp = 0;
        this.currentMaterial = new Physics.Material(1, "red", function() { }, function(x, y) {
            return 0.01;
        });
    }

    public setMaterial(material: Physics.Material) {
        this.currentMaterial = material;
    }

    public static polygon(x: number, y: number, r: number, numSides: number):LineSegment[]{
        var sides:LineSegment[] = [];

        var last_theta = (1 - 1 / numSides) * Math.PI * 2,
            last_x0 = Math.cos(last_theta) * r,
            last_y0 = Math.sin(last_theta) * r;
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
    }


    public addStaticLineSegment(stat: Physics.StaticLineSegment) {
        stat.material = this.currentMaterial;
        this.statics.push(stat);
    }

    public addDynamic(dynamic: Physics.Dynamic) {
        this.dynamics.push(dynamic);
        return dynamic;
    }

    public removeDynamic(dynamic: Physics.Dynamic) {
        for(let i=0;i<this.dynamics.length;i++){
            if(this.dynamics[i] == dynamic){
                this.dynamics.splice(i, 1);
            }
        }
    }

    public addFixed(fixed: Physics.Fixed) {
        fixed.material = this.currentMaterial;
        this.fixeds.push(fixed);
    }

    public addTrigger(trigger) {
        if (!trigger.effect)
            throw "Triggers must have effects";
        this.triggers.push(trigger);
    }

    public getDynamics():Physics.Dynamic[]{
        return this.dynamics;
    }

    public getStatics():Physics.StaticLineSegment[]{
        return this.statics;
    }

    public getFixeds():Physics.Fixed[]{
        return this.fixeds;
    }

    public getTriggers():Physics.Trigger[]{
        return this.triggers;
    }

    public setAcceleration(fn) {
        this.acceleration = fn;
    }

    public lineOfSight(segment:LineSegment):boolean{
        for(let i=0;i<this.statics.length;i++){
            const stat_seg = this.statics[i];
            if(Physics.intersectSegSeg(segment, stat_seg)){
                return false;
            }
        }
        return true;
    }

    public lineOfSightDistance(segment:LineSegment, distance:number):boolean{
        for(let i=0;i<this.statics.length;i++){
            const stat_seg = this.statics[i];
            if(Physics.intersectSegSegDist(segment, stat_seg, distance)){
                return false;
            }
        }
        return true;
    }

    private processTriggers() {
        var self = this;
        self.triggers.forEach(function(trigger:Physics.Trigger) {
            self.dynamics.forEach(function(dynamic:Physics.Dynamic) {
                if(dynamic instanceof Ball){
                    const ball : Ball = dynamic as Ball;
                    if (trigger instanceof Physics.TriggerLineSegment && Physics.intersectSegBall(trigger, ball)) {
                        trigger.effect();
                    }
                    if (trigger instanceof Physics.TriggerBall && VectorMath.intersectBallBall(trigger, ball)) {
                        trigger.effect();
                    }
                }
            });
        });
    }

    private stepDynamics() {
        var self = this;
        self.dynamics.forEach(function(dynamic) {
            dynamic.speed = dynamic.speed.clampTo(Math.min(dynamic.width(), dynamic.height()) / 2);
            dynamic.move();
            dynamic.accelerate(self.acceleration(dynamic.position.x, dynamic.position.y));
            dynamic.accelerate(dynamic.getAcceleration());
        });

    }

    private stepFixeds() {
        var self = this;
        self.fixeds.forEach(function(fixed) {
            fixed.move();
        });
    }

    private resolveCollision(dynamic:Physics.DynamicBall, stat:Physics.StaticLineSegment){
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

        if(overlapVector.x*-originStatic.y + overlapVector.y*originStatic.x < 0)
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
    }

    private processBall(ball: Physics.DynamicBall){
        const self = this;
        const deepest_collision = {
            overlap: Math.pow(2, 32) - 1
        };
        this.statics.forEach(function(stat) {
            var collision = Physics.intersectSegBall(stat, ball);
            if (collision) {
                self.resolveCollision(ball, stat);
                ball.oncontact(stat);
            }
        });
        this.dynamics.forEach(function(dynamic){
            if(dynamic instanceof Physics.DynamicBall && dynamic != ball){
                const other_ball : Physics.DynamicBall = dynamic as Physics.DynamicBall;
                if(Physics.intersectBallBall(ball, other_ball)){
                    ball.oncontact(other_ball);
                    other_ball.oncontact(ball);
                }
            }
        });
        this.fixeds.forEach(function(fixed) {
            var collision = false,
                collided : Physics.StaticLineSegment;
            if (fixed instanceof Physics.Flapper) {
                const flapper = fixed as Physics.Flapper;
                for (var i = 0; i < flapper.segments.length; i++) {
                    var val = flapper.segments[i];
                    collision = Physics.intersectSegBall(val, ball);
                    if (collision) {
                        collided = flapper.segments[i];
                        collided.material = flapper.material;
                        break;
                    }
                }
                if (collision) {
                    self.resolveCollision(ball, collided);
                    ball.speed = ball.speed.plus(flapper.getSpeedAt(ball.position));
                }
            } else {
                throw new Error("Not implemented");
            }
        });
    }
    private processDynamics():void{
        var self = this;

        self.dynamics.forEach(function(dynamic:Physics.Dynamic) {
            if(dynamic instanceof Physics.DynamicBall){
                const ball : Physics.DynamicBall = dynamic as Physics.DynamicBall;
                self.processBall(ball);
            }else{
                throw new Error("Not implemented");
            }
        });
    }

    public execute():void {
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
    }

    public draw(ctx:CanvasRenderingContext2D):void {
        var self = this;

        var canvas = <HTMLCanvasElement>ctx.canvas;
        ctx.fillStyle = "rgba(255,255,255,.01)";
        ctx.strokeStyle = "black";

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
            var fixed = this.fixeds[i] as Physics.Flapper;
            ctx.strokeStyle = fixed.material.debugColor;
            ctx.fillStyle = fixed.material.debugColor;
            for (var j = 0; j < fixed.segments.length; j++) {
                var v = fixed.segments[j],
                    v0 = v.v0,
                    v1 = v.v1;

                ctx.beginPath();
                ctx.moveTo(v0.x, v0.y);
                ctx.lineTo(v1.x, v1.y);
                ctx.stroke();
            }
        }

        if (this.debug){
            this.debugLines.forEach(function(val) {
                ctx.strokeStyle = val.color;
                ctx.beginPath();
                ctx.moveTo(val.x0, val.y0);
                ctx.lineTo(val.x1, val.y1);
                ctx.stroke();
                if (self.debugLines.length > 10){
                    self.debugLines.shift();
                }
            });
        }

        ctx.strokeStyle = "blue";
        ctx.fillStyle = "blue";
        for (var i = 0; i < this.dynamics.length; i++) {
            const ball : Physics.DynamicBall = this.dynamics[i] as Physics.DynamicBall;
            ctx.beginPath();
            ctx.arc(ball.position.x, ball.position.y, ball.r, 0, 2 * Math.PI);
            ctx.stroke();
            if(this.debug){
                ctx.moveTo(ball.position.x, ball.position.y);
                ctx.lineTo(ball.position.x + ball.speed.x * this.debugVectorScalar,
                    ball.position.y + ball.speed.y * this.debugVectorScalar);
                ctx.stroke();
            }
        }
        ctx.strokeStyle = "orange";
        ctx.fillStyle = "orange";
        for (var i = 0; i < this.triggers.length; i++) {
            const trigger : Physics.TriggerLineSegment = this.triggers[i] as Physics.TriggerLineSegment;
            ctx.beginPath();
            ctx.moveTo(trigger.v0.x, trigger.v0.y);
            ctx.lineTo(trigger.v1.x, trigger.v1.y);
            ctx.stroke();
        }
    }

    public static intersectSegBall(seg:LineSegment, ball:Ball):boolean{
        if(!ball.bounding_box().intersects(seg.bounding_box())) return false;

        //http://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
        var d = seg.v1.minus(seg.v0),
            f = seg.v0.minus(ball.position),
            a = d.dot(d),
            b = 2 * f.dot(d),
            c = f.dot(f) - ball.r * ball.r;

        var discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            // no intersection
            return false;
        } else {
            discriminant = Math.sqrt(discriminant);
            var t1 = (-b - discriminant) / (2 * a),
                t2 = (-b + discriminant) / (2 * a);
            if (t1 >= 0 && t1 <= 1) {
                return true;
            }
            if (t2 >= 0 && t2 <= 1) {
                return true;
            }
            return false;
        }
    }

    /** Returns true iff seg0 and seg1 are within distance of each other.
     *
     */
    public static intersectSegSegDist(seg0:LineSegment, seg1:LineSegment, distance:number):boolean{
        if(Physics.intersectSegBall(seg0, new Ball(seg1.v0, distance))) return true;
        if(Physics.intersectSegBall(seg0, new Ball(seg1.v1, distance))) return true;
        if(Physics.intersectSegBall(seg1, new Ball(seg0.v0, distance))) return true;
        if(Physics.intersectSegBall(seg1, new Ball(seg0.v1, distance))) return true;
        if(Physics.intersectSegSeg(seg0, seg1)) return true;
        return false;
    }

    public static intersectBallBall(ball0: Ball, ball1: Ball):boolean{
        return (ball0.r + ball1.r)*(ball0.r + ball1.r) > ball0.position.distanceToSquared(ball1.position);
    }

    private static onSeg(seg:LineSegment, q:Vector){
        //http://www.cdn.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
        const p = seg.v0;
        const r = seg.v1;
        if(q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
           q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
            return true;
        return false;
    }

    private static orientation(p: Vector, q: Vector, r: Vector){
        const val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);
        if(val === 0) return 0;
        return (val > 0)? 1:2;
    }

    public static intersectSegSeg(seg0:LineSegment, seg1:LineSegment):boolean{
        const o1 = Physics.orientation(seg0.v0, seg0.v1, seg1.v0);
        const o2 = Physics.orientation(seg0.v0, seg0.v1, seg1.v1);
        const o3 = Physics.orientation(seg1.v0, seg1.v1, seg0.v0);
        const o4 = Physics.orientation(seg1.v0, seg1.v1, seg0.v1);

        if(o1 !== o2 && o3 !== o4) return true;

        if(o1 == 0 && Physics.onSeg(seg0, seg1.v0)) return true;
        if(o2 == 0 && Physics.onSeg(seg0, seg1.v1)) return true;
        if(o1 == 0 && Physics.onSeg(seg1, seg0.v0)) return true;
        if(o1 == 0 && Physics.onSeg(seg1, seg0.v1)) return true;
        return false;
    }
}
module Physics {
    export class StaticLineSegment extends LineSegment{
        material: Physics.Material;
    }

    export interface Fixed {
        move: () => void;
        position: Vector;
        getSpeedAt: (v: Vector) => Vector;
        material: Physics.Material;
    }

    export interface Dynamic {
        position: Vector;
        speed: Vector;
        move: () => void;
        accelerate: (vector: Vector) => void;
        setAcceleration: (func:(x: number, y: number) => Vector) => void;
        getAcceleration: () => Vector;
        width: () => number;
        height: () => number;
        oncontact: (object : PhysicsObject) => void;
    }

    export interface Trigger {
        effect: (any: any) => void;
    }

    export type PhysicsObject = Physics.StaticLineSegment | Physics.Fixed | Physics.Dynamic | Physics.Trigger;

    export class Material {
        constructor(public bounce: number,
            public debugColor: any,
            public callback: (vol: number) => void,
            public friction: (x: number, y: number) => number) {

        }
        public static defaultMaterial() {
            return new Physics.Material(0, "black", (vol: number) => void {}, function(x,y){
                return 0.01;
            });
        }
    }

    export class DynamicBall extends Ball implements Physics.Dynamic{
        public speed: Vector;
        public maxSpeed: number;
        private acceleration: (x: number, y: number) => Vector;

        constructor(position: Vector, r: number, speed: Vector) {
            super(position, r);
            this.maxSpeed = this.r;
            this.speed = speed;
            this.acceleration = function(x, y){
                return new Vector(0,0);
            }
        }
        public accelerate(v: Vector):void {
            this.speed = this.speed.plus(v);
        }
        public setAcceleration(func: (x: number, y: number) => Vector): void {
            this.acceleration = func;
        }
        public getAcceleration():Vector{
            return this.acceleration(this.position.x, this.position.y);
        }
        public move():void {
            if (this.speed.length() > this.maxSpeed) {
                this.speed = this.speed.unit().times(this.r);
            }
            this.position = this.position.plus(this.speed);

        }
        public width():number {
            return this.r * 2;
        }
        public height():number {
            return this.r * 2;
        }
        public oncontact(object:PhysicsObject){}
    }

    export class Flapper implements Physics.Fixed{
        public position: Vector;
        up: boolean;
        moving: boolean;
        upAngle: number;
        downAngle: number;
        angle: number;
        angleSpeed: number;
        public material: Physics.Material;

        segments: Physics.StaticLineSegment[];
        private structure: any;

        constructor(position: Vector, angleSpeed: number, upAngle: number, downAngle: number) {
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
                49, 28, //tip
                45, 32,
                41, 32, -5, 10, -11, 5, -12, -1, -9, -7, -4, -11,
                2, -11
            ];
            this.segments = [];
            for (var i = 2; i < this.structure.length; i += 2) {
                var v0 = new Vector(this.structure[i - 2] + position.x, this.structure[i - 1] + position.y),
                    v1 = new Vector(this.structure[i] + position.x, this.structure[i + 1] + position.y),
                    segment = new Physics.StaticLineSegment(v0, v1);
                segment.material = this.material;
                this.segments.push(segment);
            }
        }

        public getSpeedAt(position: Vector): Vector {
            if (!this.moving)
                return new Vector(0, 0);

            var speed = 2 * Math.PI * this.position.distanceTo(position) * this.angleSpeed * Math.PI;
            var translated = this.segments[2].v1.minus(this.position);
            var perp = new Vector(translated.y * -1, translated.x).unit().times(speed);

            return perp;
        }

        public move() : void{
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
            for (var i = 2; i < this.structure.length; i += 2) {
                var v0 = new Vector(this.structure[i - 2] + this.position.x, this.structure[i - 1] + this.position.y)
                    .rotate(this.angle * Math.PI, this.position);
                var v1 = new Vector(this.structure[i] + this.position.x, this.structure[i + 1] + this.position.y)
                    .rotate(this.angle * Math.PI, this.position);
                var segment = new StaticLineSegment(v0, v1);
                segment.material = this.material;
                this.segments.push(segment);
            }
        }
    }

    export class TriggerBall extends Ball implements Physics.Trigger{
        constructor(position: Vector, r: number, public effect: any) {
            super(position, r); 
        }
    }

    export class TriggerLineSegment extends LineSegment implements Physics.Trigger {
        constructor(public v0: Vector, public v1: Vector, public effect: () => void) {
            super(v0, v1); 
        }
    }

}
