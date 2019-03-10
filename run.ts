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

    const model_entity:ECSEntity = await ModelReader.read('long.xrig', false);
    EntityManager.current.add_entity(model_entity);
    const mesh_component = model_entity.get_component<MeshComponent>(ComponentType.Mesh);
    EntityManager.current.add_entity(mesh_component.skeleton);
    const skeleton = mesh_component.skeleton.get_component<SkeletonComponent>(ComponentType.Skeleton);
    for(let bone_id = 0; bone_id < skeleton.length; bone_id++){
        const bone = skeleton.id_to_bone(bone_id).get_component<BoneComponent>(ComponentType.Bone);
        skeleton.id_to_bone(bone_id).add_component(new DynamicRenderComponent());
        EntityManager.current.add_entity(skeleton.id_to_bone(bone_id));
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

    class FABRIKSystem implements System{
        step(){
            const fixed_endpoints = EntityManager.current.get_entities([ComponentType.FixableEndpoint,
                                                                       ComponentType.Bone]);
            fixed_endpoints.forEach((entity) => {
                const bone = entity.get_component<BoneComponent>(ComponentType.Bone);
                const fixable = entity.get_component<FixableEndpointComponent>(ComponentType.FixableEndpoint);
                if(fixable.fixed)
                    bone.move_endpoint(fixable.p);
            });
        }
    }

    class BonePhysicsSystem implements System{
        step(){
            const bone_physics_endpoints = EntityManager.current.get_entities([ComponentType.Bone,
                ComponentType.DynamicPhysics]);
            bone_physics_endpoints.forEach((entity) => {
                const bone = entity.get_component<BoneComponent>(ComponentType.Bone);
                const dynamic = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            });
        }
    }

    SystemManager.current.add(new PhysicsSystem());
    SystemManager.current.add(new BonePhysicsSystem());
    SystemManager.current.add(new FABRIKSystem());
    SystemManager.current.add(new MouseInputSystem());
    SystemManager.current.add(new BoneSelectSystem());
    SystemManager.current.add(new PhysicsRenderSystem());
    SystemManager.current.add(new CameraSystem());
    SystemManager.current.add(new UIRenderSystem());
    SystemManager.current.add(new MouseRenderSystem());
    SystemManager.current.start();
}
main();
