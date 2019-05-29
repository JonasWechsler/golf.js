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

    const mouse_entity = new ECSEntity([new MouseInputComponent(), new DynamicRenderComponent()]);
    EntityManager.current.add_entity(mouse_entity);

    const model_entity:ECSEntity = await ModelReader.read('bones.xrig', false);
    const mesh_component = model_entity.get_component<MeshComponent>(ComponentType.Mesh);
    const skeleton = mesh_component.skeleton.get_component<SkeletonComponent>(ComponentType.Skeleton);
    EntityManager.current.add_entity(model_entity);
    EntityManager.current.add_entity(mesh_component.skeleton);
    for(let bone_id = 0; bone_id < skeleton.length; bone_id++){
        const bone = skeleton.id_to_bone(bone_id).get_component<BoneComponent>(ComponentType.Bone);
        if(bone_id == 0){
            skeleton.id_to_bone(bone_id).add_component(new KeyInputComponent());
            skeleton.id_to_bone(bone_id).add_component(new FixableEndpointComponent(new Vector(0,0), true));
        }
        if(bone_id%5 == 0)
        skeleton.id_to_bone(bone_id).add_component(new DynamicPhysicsComponent(bone.endpoint(), 10));
        skeleton.id_to_bone(bone_id).add_component(new DynamicRenderComponent());
        EntityManager.current.add_entity(skeleton.id_to_bone(bone_id));
    }

    EntityManager.current.add_entity(new ECSEntity([new DynamicRenderComponent(), new DynamicPhysicsComponent(new Vector(200, 350), 10, new Vector(100*.38,100*-.92))]));

    for(let i=0, dd=1/8;i<1;i+=dd){
        const x0 = Math.cos(i*2*Math.PI)*100 + 350;
        const y0 = Math.sin(i*2*Math.PI)*100 + 150;
        const x1 = Math.cos((i+dd)*2*Math.PI)*100 + 350;
        const y1 = Math.sin((i+dd)*2*Math.PI)*100 + 150;
        console.log(i,x0,y0,x1,y1,Math.cos(i*2*Math.PI),Math.sin(i*2*Math.PI));
        EntityManager.current.add_entity(new ECSEntity([new StaticRenderComponent(), new StaticPhysicsComponent(new Vector(x0, y0), new Vector(x1, y1))]));
    }

    const ui = new UIComponent(0, 0, document.createElement("canvas"), DOMManager.CANVAS_WIDTH, DOMManager.CANVAS_HEIGHT)
    const camera_entity = new ECSEntity([new CameraComponent(()=>new Vector(350,350)), ui]);
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

    //SystemManager.current.add(new ControlSystem());

    //SystemManager.current.add(new SkeletonSystem());
    SystemManager.current.add(new MouseInputSystem());
    SystemManager.current.add(new BoneSelectSystem());

    //SystemManager.current.add(new PhysicsSystem());

    SystemManager.current.add(new PhysicsRenderSystem());
    SystemManager.current.add(new CameraSystem());
    SystemManager.current.add(new UIRenderSystem());
    SystemManager.current.add(new MouseRenderSystem());
    SystemManager.current.start();
}
main();
