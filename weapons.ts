class ProjectileComponent implements Component{
    type:ComponentType = ComponentType.Projectile;
    public contact:ECSEntity|false = false;
    public owner:ECSEntity;
    constructor(public damage:number,
        public destroy_on_contact:boolean,
        public stick_on_contact:boolean,
        public lifetime:number = 100){}
}

class ProjectileLauncherComponent implements Component{
    type:ComponentType = ComponentType.ProjectileLauncher;
    constructor(public damage:number,
        public destroy_on_contact:boolean,
        public stick_on_contact:boolean,
        public speed:number = 1,
        public radius:number = 5){}
}

class ProjectileSystem implements System{
    public static launch_projectile(launcher_entity:ECSEntity){
        const launcher = launcher_entity.get_component<ProjectileLauncherComponent>(ComponentType.ProjectileLauncher);
        const state = launcher_entity.get_component<InventoryStateComponent>(ComponentType.InventoryState);
        const owner = state.owner.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
        const mouse = launcher_entity.get_component<MouseInputComponent>(ComponentType.MouseInput);
        const aim = mouse.position.minus(owner.position).unit();
        const projectile = new ProjectileComponent(launcher.damage, launcher.destroy_on_contact, launcher.stick_on_contact);
        const physics = new DynamicPhysicsComponent(owner.position.clone(), launcher.radius, aim.unitTimes(launcher.speed).plus(owner.speed));
        projectile.owner = state.owner;
        const entity = new ECSEntity([projectile, physics, new DynamicRenderComponent()]);
        EntityManager.current.add_entity(entity);
    }

    step(){
        const projectiles = EntityManager.current.get_entities([ComponentType.ProjectileLauncher, ComponentType.InventoryState, ComponentType.MouseInput]);
        projectiles.forEach((entity) => {
            const launcher = entity.get_component<ProjectileLauncherComponent>(ComponentType.ProjectileLauncher);
            const item_state = entity.get_component<InventoryStateComponent>(ComponentType.InventoryState);
            if(item_state.state == InventoryState.JustUsed){
                item_state.start_cooldown();
                ProjectileSystem.launch_projectile(entity);
            }
        });

        const projectile_entities = EntityManager.current.get_entities([ComponentType.Projectile]);
        projectile_entities.forEach((entity) => {
            const projectile = entity.get_component<ProjectileComponent>(ComponentType.Projectile);
            if(projectile.lifetime > 0)
                projectile.lifetime--;
            if(projectile.lifetime == 0){
                EntityManager.current.remove_entity(entity);
            }
        });
    }
}

enum GrapplingHookState{
    Ready,
    Deploying,
    DeployedNoContact,
    Returning,
    Anchored,
    UserToAnchor
}

class GrapplingHookComponent implements Component{
    type:ComponentType = ComponentType.GrapplingHook;
    constructor(public owner:ECSEntity,
    public anchor:ECSEntity,
    public speed:number = 30,
    public state:GrapplingHookState = GrapplingHookState.Ready){}
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
    public static launch_grappling_hook(grappling_hook_entity:ECSEntity){
        const hook = grappling_hook_entity.get_component<GrapplingHookComponent>(ComponentType.GrapplingHook);
        hook.state = GrapplingHookState.Deploying;
        const anchor = hook.anchor;
        const owner_position = hook.owner.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics).position;
        const mouse = grappling_hook_entity.get_component<MouseInputComponent>(ComponentType.MouseInput);
        const aim = mouse.position.minus(owner_position).unit();
        const anchor_physics = anchor.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
        anchor_physics.position = owner_position.clone();
        anchor_physics.speed = aim.times(hook.speed);
    }

    public static resolve_hook_contact_static(grappling_hook_entity:ECSEntity){
        const hook = grappling_hook_entity.get_component<GrapplingHookComponent>(ComponentType.GrapplingHook);
        const destination = hook.anchor.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
        const owner = hook.owner.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
        const aim = destination.position.minus(owner.position).times(.1);

        owner.speed = aim;
    }

    public static resolve_hook_contact(grappling_hook_entity:ECSEntity){
        const hook = grappling_hook_entity.get_component<GrapplingHookComponent>(ComponentType.GrapplingHook);
        const projectile = hook.anchor.get_component<ProjectileComponent>(ComponentType.Projectile);
        const contact:ECSEntity = <ECSEntity>projectile.contact;
        if(contact.has_component(ComponentType.StaticPhysics)){
            GrapplingHookSystem.resolve_hook_contact_static(grappling_hook_entity);
        }
        const destination = hook.anchor.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
        const owner = hook.owner.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
        if(destination.position.distanceToSquared(owner.position) < 1000){
            destination.position = owner.position.clone();
            projectile.contact = false;
        }
    }

    step(){
        const hooks = EntityManager.current.get_entities([ComponentType.GrapplingHook, ComponentType.InventoryState, ComponentType.MouseInput]);
        hooks.forEach((entity) =>{
            const hook = entity.get_component<GrapplingHookComponent>(ComponentType.GrapplingHook);
            const projectile = hook.anchor.get_component<ProjectileComponent>(ComponentType.Projectile);
            projectile.owner = hook.owner;

            const item_state = entity.get_component<InventoryStateComponent>(ComponentType.InventoryState);
            if(item_state.state == InventoryState.JustUsed){
                if(hook.state == GrapplingHookState.Ready){
                    item_state.start_cooldown();
                    GrapplingHookSystem.launch_grappling_hook(entity);
                }else{
                    item_state.state = InventoryState.Equipped;
                }
            }

            switch(hook.state){
                case GrapplingHookState.Deploying:{
                    break;
                }
                case GrapplingHookState.Deploying:{
                    break;
                }
            }

            const destination = hook.anchor.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            const owner = hook.owner.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            if(destination.position.distanceToSquared(owner.position) > 100000){
                destination.speed.timesEquals(-1);
                projectile.contact = false;
            }
            if(projectile.contact){
                GrapplingHookSystem.resolve_hook_contact(entity);
                //hook.anchor = projectile.contact;
            }
        });
    }
}
