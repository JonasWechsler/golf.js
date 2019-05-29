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
    constructor(position: Vector, r: number, public speed: Vector = new Vector(0, 0), public mass:number = 1, public mu:number = 0.01){
        super(position, r);
    }
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

    private static processBall(ball_entity: ECSEntity):boolean{
        if(!ball_entity.has_component(ComponentType.DynamicPhysics)){
            throw "Entity must have DynamicPhysics component";
        }
        const ball = ball_entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
        const statics = EntityManager.current.get_entities([ComponentType.StaticPhysics]);
        const dynamics = EntityManager.current.get_entities([ComponentType.DynamicPhysics]);
        let projectile:ProjectileComponent;
        if(ball_entity.has_component(ComponentType.Projectile)){
            projectile = ball_entity.get_component<ProjectileComponent>(ComponentType.Projectile);
        }

        let any_collision = false;
        statics.forEach((entity) => {
            const stat = entity.get_component<StaticPhysicsComponent>(ComponentType.StaticPhysics);
            let collision = VectorMath.intersectSegBall(stat, ball);
            if (collision) {
                any_collision = true;
                PhysicsSystem.resolveCollision(ball, stat);
                if(projectile){
                    projectile.contact = entity;
                    if(projectile.destroy_on_contact){
                        EntityManager.current.remove_entity(ball_entity);
                    }
                    if(projectile.stick_on_contact){
                        ball.speed.timesEquals(0);
                    }
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
        return any_collision;
    }
    private static processDynamics():void{
        const dynamics = EntityManager.current.get_entities([ComponentType.DynamicPhysics]);
        dynamics.forEach((entity:ECSEntity) => PhysicsSystem.processBall(entity));
    }

    private static stepDynamic(entity:ECSEntity, depth:number = 0):void{
        if(depth > 4)
            return;
        const dynamic = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
        const speed = dynamic.speed.length();
        const unit = dynamic.speed.divided(speed);
        const iterations = Math.ceil(speed/dynamic.r);
        const remainder = speed % dynamic.r;
        //dynamic.speed = dynamic.speed.clampTo(dynamic.r);
        for(let _=0;_<iterations;_++){
            dynamic.position.plusEquals(unit.times(dynamic.r));
            const collision = PhysicsSystem.processBall(entity);
            if(collision){
                return PhysicsSystem.stepDynamic(entity, depth+1);
            }
        }
        dynamic.position.plusEquals(unit.times(remainder));
        PhysicsSystem.processBall(entity);

        const normal = dynamic.mass;
        const friction = dynamic.speed.times(-1).unitTimes(normal*dynamic.mu);
        dynamic.speed.plusEquals(friction);
    }

    public step():void {
        /**
         * 1 move all dynamics according to level rules. This includes momentum, friction, and other forces
         * 2 check for dynamic on static collisions
         * 3 if speed is greater than the radius of the ball, iterate 1 and 2 with lower speed
         */
        const dynamics = EntityManager.current.get_entities([ComponentType.DynamicPhysics]);
        dynamics.forEach((entity:ECSEntity) => PhysicsSystem.stepDynamic(entity));

        //    PhysicsSystem.stepDynamic(entity);
            //if(entity.has_component(ComponentType.Bone)){
            //    const dynamic = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            //    const bone = entity.get_component<BoneComponent>(ComponentType.Bone);
            //    const endpoint = bone.endpoint();
            //    dynamic.speed.plusEquals(endpoint.minus(dynamic.position));
            //}
            //if(entity.has_component(ComponentType.Bone)){
            //    const dynamic = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            //    const bone = entity.get_component<BoneComponent>(ComponentType.Bone);
            //    const endpoint = bone.endpoint();
            //    bone.move_endpoint(dynamic.position);
            //}
        //});
    }
}
