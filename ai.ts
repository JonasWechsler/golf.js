
class AIInputComponent implements Component{
    type:ComponentType = ComponentType.AIInput;
    
    /*destination: Long term destination- a system finds a path to here*/
    /*walk_target: Short term walk target- walks straight here without path finding*/
    constructor(public destination:Vector = new Vector(0, 0),
                public walk_target:Vector = new Vector(0, 0),
                public max_speed:number = .4){}
}

class AIMovementSystem implements System{
    step(){
        const AIs = EntityManager.current.get_entities([ComponentType.AIInput,
                                                       ComponentType.DynamicPhysics]);
        AIs.forEach((entity) => {
            const input = entity.get_component<AIInputComponent>(ComponentType.AIInput);
            const dynamic = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            dynamic.speed = input.walk_target.minus(dynamic.position).clampTo(input.max_speed);
        });
    }
}

class AIGuidanceSystem implements System{
    step(){
        const player = EntityManager.current.get_entities([ComponentType.KeyInput,
                                                          ComponentType.DynamicPhysics])[0];
        const player_physics = player.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);

        const AIs = EntityManager.current.get_entities([ComponentType.AIInput,
                                                       ComponentType.DynamicPhysics]);
        AIs.forEach((entity) => {
            const input = entity.get_component<AIInputComponent>(ComponentType.AIInput);
            input.destination = player_physics.position;
        });
    }
}

class StupidAISystem implements System{
    step(){
        const player = EntityManager.current.get_entities([ComponentType.KeyInput,
                                                          ComponentType.DynamicPhysics])[0];
        const player_physics = player.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);

        const AIs = EntityManager.current.get_entities([ComponentType.AIInput,
                                                       ComponentType.DynamicPhysics]);
        AIs.forEach((entity) => {
            const input = entity.get_component<AIInputComponent>(ComponentType.AIInput);
            input.walk_target = input.destination;
        });
    }
}
