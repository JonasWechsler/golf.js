async function main(){
    new SystemManager(new EntityManager());
    MouseInfo.setup();
    DOMManager.make_canvas();
    DOMManager.canvas.style.left = "0%";
    DOMManager.canvas.style.top = "0%";
    DOMManager.canvas.style.marginLeft = "0";
    DOMManager.canvas.style.marginTop = "0";

    const settings_entity = new ECSEntity([new SettingsComponent(8, 8, 1, true)]);
    EntityManager.current.add_entity(settings_entity);

    const mouse_entity = new ECSEntity([
        new MouseInputComponent(),
        new DynamicRenderComponent()
    ]);
    EntityManager.current.add_entity(mouse_entity);

    EntityManager.current.add_entity(new ECSEntity([
        new ProjectileComponent(1, true, false),
        new DynamicPhysicsComponent(new Vector(100, 100), 10, new Vector(5, 0)),
        new DynamicRenderComponent()
    ]));


    const model_entity:ECSEntity = await ModelReader.read('model.xrig', false);
    const mesh_component = model_entity.get_component<MeshComponent>(ComponentType.Mesh);
    model_entity.add_component(new DynamicRenderComponent());
    const skeleton = mesh_component.skeleton.get_component<SkeletonComponent>(ComponentType.Skeleton);
    EntityManager.current.add_entity(model_entity);
    EntityManager.current.add_entity(mesh_component.skeleton);
    for(let bone_id = 0; bone_id < skeleton.length; bone_id++){
        const entity = skeleton.id_to_bone(bone_id);
        const bone = entity.get_component<BoneComponent>(ComponentType.Bone);
        if(bone_id == 1){
            const weapon = new ECSEntity([
                //new ProjectileLauncherComponent(1, false, true, 5, 5),
                new InventoryStateComponent(20),
                new KeyInputComponent(),
                new MouseInputComponent()
            ]);
            entity.add_component(new KeyInputComponent());
            entity.add_component(new FixableEndpointComponent(new Vector(0,0), true));
            entity.add_component(new InventoryComponent(entity, [weapon]));
            entity.add_component(new UIComponent());
            const anchor = new ECSEntity([
                new ProjectileComponent(10, false, true, -1),
                new DynamicPhysicsComponent(new Vector(0,0), 5),
                new DynamicRenderComponent()
            ]);
            EntityManager.current.add_entity(anchor);
            weapon.add_component(new GrapplingHookComponent(entity, anchor));
            EntityManager.current.add_entity(weapon);
            entity.add_component(new DynamicPhysicsComponent(bone.endpoint(), 10, new Vector(0,0), 1, 5));
        }else if(bone_id%5 == 0){
            entity.add_component(new DynamicPhysicsComponent(bone.endpoint(), 10, new Vector(0,0), 1, 5));
        }
        entity.add_component(new DynamicRenderComponent());
        EntityManager.current.add_entity(entity);
    }

    EntityManager.current.add_entity(new ECSEntity([
        new DynamicRenderComponent(), 
        new DynamicPhysicsComponent(new Vector(200, 350), 10, new Vector(5*.38, 5*-.92))
    ]));

    for(let i=0, dd=1/8;i<1;i+=dd){
        const x0 = Math.cos(i*2*Math.PI)*100 + 350;
        const y0 = Math.sin(i*2*Math.PI)*100 + 150;
        const x1 = Math.cos((i+dd)*2*Math.PI)*100 + 350;
        const y1 = Math.sin((i+dd)*2*Math.PI)*100 + 150;
        console.log(i,x0,y0,x1,y1,Math.cos(i*2*Math.PI),Math.sin(i*2*Math.PI));
        EntityManager.current.add_entity(new ECSEntity([
            new StaticRenderComponent(),
            new StaticPhysicsComponent(new Vector(x0, y0), new Vector(x1, y1))
        ]));
    }

    const camera_entity = new ECSEntity([
        new CameraComponent(()=>new Vector(350,350)),
        new UIComponent(0,0,document.createElement("canvas"),DOMManager.CANVAS_WIDTH,DOMManager.CANVAS_HEIGHT)
    ]);

    EntityManager.current.add_entity(camera_entity);

    function init_canvas(){
        const canvas = new ECSEntity();
        const c = document.createElement("canvas");
        c.width = DOMManager.CANVAS_WIDTH;
        c.height = DOMManager.CANVAS_HEIGHT;
        const context = c.getContext("2d");
        context.fillRect(0, 0, 1, c.height);
        context.fillRect(c.width-1, 0, 1, c.height);
        context.fillRect(0, 0, c.width, 1);
        context.fillRect(0, c.height-1, c.width, 1);
        canvas.add_component(new UIComponent(0, 0, c, DOMManager.CANVAS_WIDTH, DOMManager.CANVAS_HEIGHT));
        SystemManager.current.entity_manager.add_entity(canvas);
    }

    SystemManager.current.add(new MouseInputSystem());
    SystemManager.current.add(new KeyInputSystem());

    SystemManager.current.add(new ControlSystem());

    SystemManager.current.add(new SkeletonSystem());
    SystemManager.current.add(new MouseInputSystem());
    SystemManager.current.add(new BoneSelectSystem());

    SystemManager.current.add(new InventoryControlSystem());
    SystemManager.current.add(new InventoryTimerSystem());
    SystemManager.current.add(new ProjectileSystem());
    SystemManager.current.add(new GrapplingHookSystem());
    SystemManager.current.add(new InventoryRenderSystem());

    SystemManager.current.add(new PhysicsSystem());

    SystemManager.current.add(new PhysicsRenderSystem());
    SystemManager.current.add(new CameraSystem());
    SystemManager.current.add(new UIRenderSystem());
    SystemManager.current.add(new MouseRenderSystem());
    SystemManager.current.add(new MeshRenderSystem());
    SystemManager.current.start();
}
main();
