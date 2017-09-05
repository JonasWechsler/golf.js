/*Game time*/

class Material{
    constructor(public friction:number, public bounce:number, public color:Color){}
}

class StaticPhysicsComponent extends LineSegment implements Component{
    type:ComponentType = ComponentType.StaticPhysics;
    material:Material;
    public static DEFAULT_MATERIAL:Material = new Material(0.01, 0, new Color("black"));
    constructor(v0:Vector, v1:Vector, material:Material = StaticPhysicsComponent.DEFAULT_MATERIAL){
        super(v0, v1);
        this.material = material;
    }
}

class DynamicPhysicsComponent extends Ball implements Component{
    type:ComponentType = ComponentType.DynamicPhysics;
    speed:Vector;
    constructor(position: Vector, r: number, speed: Vector = new Vector(0, 0)){
        super(position, r);
        this.speed = speed;
    }
}

class ProjectileComponent implements Component{
    type:ComponentType = ComponentType.Projectile;
    constructor(public damage:number){}
}

class PhysicsSystem implements System{
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

    public lineOfSight(segment:LineSegment):boolean{
        const statics = EntityManager.current.get_entities([ComponentType.StaticPhysics]);
        for(let i=0;i<statics.length;i++){
            const stat_seg = statics[i].get_component<StaticPhysicsComponent>(ComponentType.StaticPhysics);
            if(PhysicsSystem.intersectSegSeg(segment, stat_seg)){
                return false;
            }
        }
        return true;
    }

    public lineOfSightDistance(segment:LineSegment, distance:number):boolean{
        const statics = EntityManager.current.get_entities([ComponentType.StaticPhysics]);
        for(let i=0;i<statics.length;i++){
            const stat_seg = statics[i].get_component<StaticPhysicsComponent>(ComponentType.DynamicPhysics);
            if(PhysicsSystem.intersectSegSegDist(segment, stat_seg, distance)){
                return false;
            }
        }
        return true;
    }

    private stepDynamics() {
        const dynamics = EntityManager.current.get_entities([ComponentType.DynamicPhysics]);
        dynamics.forEach((entity) => {
            const dynamic = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            dynamic.speed = dynamic.speed.clampTo(dynamic.r);
            dynamic.position.plusEquals(dynamic.speed);
        });
    }

    private resolveCollision(dynamic:DynamicPhysicsComponent, stat:StaticPhysicsComponent){
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

        if (dynamic.speed.length() > 1 || stat.material.bounce >= 1) {
            dynamic.speed = projectedSpeedVector.plus(rejectedSpeedVector.timesEquals(-1 * stat.material.bounce));
        }
        dynamic.position = dynamic.position.minus(overlapVector);
        dynamic.speed.timesEquals(1 - stat.material.friction);
    }

    private processBall(ball_entity: ECSEntity){
        if(!ball_entity.has_component(ComponentType.DynamicPhysics)){
            throw "Entity must have DynamicPhysics component";
        }
        const ball = ball_entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
        const statics = EntityManager.current.get_entities([ComponentType.StaticPhysics]);
        const dynamics = EntityManager.current.get_entities([ComponentType.DynamicPhysics]);
        const self = this;
        statics.forEach((entity) => {
            const stat = entity.get_component<StaticPhysicsComponent>(ComponentType.StaticPhysics);
            var collision = PhysicsSystem.intersectSegBall(stat, ball);
            if (collision) {
                self.resolveCollision(ball, stat);
                if(ball_entity.has_component(ComponentType.Projectile)){
                    EntityManager.current.remove_entity(ball_entity);
                }
            }
        });
        dynamics.forEach((entity) => {
            const dynamic = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            if(dynamic == ball)
                return;

            if(ball_entity.has_component(ComponentType.Projectile) && entity.has_component(ComponentType.Health)){
                const dmg = ball_entity.get_component<ProjectileComponent>(ComponentType.Projectile).damage;
                entity.get_component<HealthComponent>(ComponentType.Health).amount -= dmg;
            }

            if(entity.has_component(ComponentType.Projectile) && ball_entity.has_component(ComponentType.Health)){
                const dmg = ball_entity.get_component<ProjectileComponent>(ComponentType.Projectile).damage;
                entity.get_component<HealthComponent>(ComponentType.Health).amount -= dmg;
            }
        });
    }
    private processDynamics():void{
        var self = this;
        const dynamics = EntityManager.current.get_entities([ComponentType.DynamicPhysics]);
        dynamics.forEach((entity:ECSEntity) => self.processBall(entity));
    }

    public step():void {
        /**
         * 1 move all dynamics according to level rules. This includes momentum, friction, and other forces
         * 2 check for dynamic on static collisions
         * 3 move all fixeds according to their specific rules.
         */
        this.stepDynamics();
        this.processDynamics();
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
        if(PhysicsSystem.intersectSegBall(seg0, new Ball(seg1.v0, distance))) return true;
        if(PhysicsSystem.intersectSegBall(seg0, new Ball(seg1.v1, distance))) return true;
        if(PhysicsSystem.intersectSegBall(seg1, new Ball(seg0.v0, distance))) return true;
        if(PhysicsSystem.intersectSegBall(seg1, new Ball(seg0.v1, distance))) return true;
        if(PhysicsSystem.intersectSegSeg(seg0, seg1)) return true;
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
        const o1 = PhysicsSystem.orientation(seg0.v0, seg0.v1, seg1.v0);
        const o2 = PhysicsSystem.orientation(seg0.v0, seg0.v1, seg1.v1);
        const o3 = PhysicsSystem.orientation(seg1.v0, seg1.v1, seg0.v0);
        const o4 = PhysicsSystem.orientation(seg1.v0, seg1.v1, seg0.v1);

        if(o1 !== o2 && o3 !== o4) return true;

        if(o1 == 0 && PhysicsSystem.onSeg(seg0, seg1.v0)) return true;
        if(o2 == 0 && PhysicsSystem.onSeg(seg0, seg1.v1)) return true;
        if(o1 == 0 && PhysicsSystem.onSeg(seg1, seg0.v0)) return true;
        if(o1 == 0 && PhysicsSystem.onSeg(seg1, seg0.v1)) return true;
        return false;
    }
}

module Physics {
    /*
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
            public callback: (vol: number) => void,
            public friction: (x: number, y: number) => number) {

        }
        public static defaultMaterial() {
            return new Physics.Material(0, (vol: number) => void {}, function(x,y){
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
*/
}
