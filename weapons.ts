class ProjectileComponent implements Component{
    type:ComponentType = ComponentType.Projectile;
    public contact:ECSEntity|false = false;
    constructor(public damage:number,
        public destroy_on_contact:boolean,
        public stick_on_contact:boolean){}
}

class GrapplingHookComponent implements Component{
    type:ComponentType = ComponentType.GrapplingHook;
    public owner:ECSEntity;
    public anchor:ECSEntity;
}

class ProjectileSystem implements System{
    step(){
        const projectiles = EntityManager.current.get_entities([ComponentType.Projectile,
            ComponentType.DynamicPhysics, ComponentType.InventoryState]);
        projectiles.forEach((entity) => {
            const projectile = entity.get_component<ProjectileComponent>(ComponentType.Projectile);
            const dynamic = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            const item_state = entity.get_component<InventoryStateComponent>(ComponentType.InventoryState);
            if(item_state.state == InventoryState.JustUsed){
                item_state.start_cooldown();
                dynamic.speed = new Vector(1,0);
            }
        });
    }
}
/* 1. User presses use key, KeyboardInput picks up
 * 2. Inventory system picks up input + inventorystate, changes state to use
 * 3. Projectile system picks up inventory state + projectile + dynamicphysics, launches
 * 4. Other systems connect bones and move the dynamicphysics during flight
 * 5. Projectile sticks on contact or stops at extent of bone
 * 6. Grappling hook system picks up projectile + grapplinghookcomponent, sends owner to
 * anchor until distance is small
 */
class GrapplingHookSystem implements System{
    step(){
        const hooks = EntityManager.current.get_entities([ComponentType.Projectile,
            ComponentType.GrapplingHook, ComponentType.InventoryState]);
        hooks.forEach((entity) =>{
            const projectile = entity.get_component<ProjectileComponent>(ComponentType.Projectile);
            const hook = entity.get_component<GrapplingHookComponent>(ComponentType.GrapplingHook);
            const item_state = entity.get_component<InventoryStateComponent>(ComponentType.InventoryState);
            if(projectile.contact){
                hook.anchor = projectile.contact;
                
            }
        });
    }
}
