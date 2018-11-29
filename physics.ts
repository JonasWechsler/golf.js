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

    public static lineOfSight(segment:LineSegment):boolean{
        const statics = EntityManager.current.get_entities([ComponentType.StaticPhysics]);
        for(let i=0;i<statics.length;i++){
            const stat_seg = statics[i].get_component<StaticPhysicsComponent>(ComponentType.StaticPhysics);
            if(VectorMath.intersectSegSeg(segment, stat_seg)){
                return false;
            }
        }
        return true;
    }

    public static lineOfSightDistance(segment:LineSegment, distance:number):boolean{
        const statics = EntityManager.current.get_entities([ComponentType.StaticPhysics]);
        for(let i=0;i<statics.length;i++){
            const stat_seg = statics[i].get_component<StaticPhysicsComponent>(ComponentType.StaticPhysics);
            if(VectorMath.intersectSegSegDist(segment, stat_seg, distance)){
                return false;
            }
        }
        return true;
    }

    private static stepDynamics() {
        const dynamics = EntityManager.current.get_entities([ComponentType.DynamicPhysics]);
        dynamics.forEach((entity) => {
            const dynamic = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            dynamic.speed = dynamic.speed.clampTo(dynamic.r);
            dynamic.position.plusEquals(dynamic.speed);
        });
    }

    //http://doswa.com/2009/07/13/circle-segment-intersectioncollision.html
    private static resolveCollision(dynamic:DynamicPhysicsComponent, stat:StaticPhysicsComponent){
        const v0:Vector = stat.v0;
        const v1:Vector = stat.v1;

        const originStatic:Vector = v1.minus(v0);
        const originDynamic:Vector = dynamic.position.minus(v0);

        const projectedScalar:number = VectorMath.projectScalar(originDynamic, originStatic);

        let closestPoint;
        //projected vector is the closest point
        if (projectedScalar < 0){
            closestPoint = v0;
        }else if (projectedScalar > originStatic.length()){
            closestPoint = v1;
        }else{
            const projectedVector:Vector = v0.plus(originStatic.unit().times(projectedScalar));
            closestPoint = projectedVector;
        }

        const overlap:number = dynamic.r - dynamic.position.distanceTo(closestPoint);

        if (overlap > dynamic.r)
            return;

        const overlapVector:Vector = closestPoint.minus(dynamic.position).unitTimes(overlap);

        if(overlapVector.x*-originStatic.y + overlapVector.y*originStatic.x < 0){
            return;
        }

        const projectedSpeed:number = VectorMath.projectScalar(dynamic.speed, originStatic);
        const projectedSpeedVector:Vector = VectorMath.projectVector(dynamic.speed, originStatic);
        const rejectedSpeedVector:Vector = dynamic.speed.minus(projectedSpeedVector);
//
//        if (!overlapVector.unit().equals(rejectedSpeedVector.unit()))
//            return;
//
//        const perpendicularComponent:number = Math.sqrt(dynamic.speed.length() * dynamic.speed.length() - projectedSpeed * projectedSpeed);

        if (dynamic.speed.length() > 1 || stat.material.bounce >= 1) {
            dynamic.speed = projectedSpeedVector.plus(rejectedSpeedVector.timesEquals(-1 * stat.material.bounce));
        }
        dynamic.position = dynamic.position.minus(overlapVector);
        dynamic.speed.timesEquals(1 - stat.material.friction);
    }

    private static processBall(ball_entity: ECSEntity){
        if(!ball_entity.has_component(ComponentType.DynamicPhysics)){
            throw "Entity must have DynamicPhysics component";
        }
        const ball = ball_entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
        const statics = EntityManager.current.get_entities([ComponentType.StaticPhysics]);
        const dynamics = EntityManager.current.get_entities([ComponentType.DynamicPhysics]);

        statics.forEach((entity) => {
            const stat = entity.get_component<StaticPhysicsComponent>(ComponentType.StaticPhysics);
            var collision = VectorMath.intersectSegBall(stat, ball);
            if (collision) {
                PhysicsSystem.resolveCollision(ball, stat);
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
                entity.get_component<HealthComponent>(ComponentType.Health).hp -= dmg;
            }

            if(entity.has_component(ComponentType.Projectile) && ball_entity.has_component(ComponentType.Health)){
                const dmg = ball_entity.get_component<ProjectileComponent>(ComponentType.Projectile).damage;
                entity.get_component<HealthComponent>(ComponentType.Health).hp -= dmg;
            }
        });
    }
    private static processDynamics():void{
        const dynamics = EntityManager.current.get_entities([ComponentType.DynamicPhysics]);
        dynamics.forEach((entity:ECSEntity) => PhysicsSystem.processBall(entity));
    }

    public step():void {
        /**
         * 1 move all dynamics according to level rules. This includes momentum, friction, and other forces
         * 2 check for dynamic on static collisions
         * 3 move all fixeds according to their specific rules.
         */
        PhysicsSystem.stepDynamics();
        PhysicsSystem.processDynamics();
    }
}
