
class AIInputComponent implements Component{
    type:ComponentType = ComponentType.AIInput;
    constructor(public destination:Vector, public max_speed:number = .4){}
}

class AIMovementSystem implements System{
    step(){
        const AIs = EntityManager.current.get_entities([ComponentType.AIInput,
                                                       ComponentType.DynamicPhysics]);
        AIs.forEach((entity) => {
            const input = entity.get_component<AIInputComponent>(ComponentType.AIInput);
            const dynamic = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            dynamic.speed = input.destination.minus(dynamic.position).clampTo(input.max_speed);
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
