async function main(){
    new SystemManager(new EntityManager());
    MouseInfo.setup();
    DOMManager.make_canvas();
    DOMManager.canvas.style.left = "0%";
    DOMManager.canvas.style.top = "0%";
    DOMManager.canvas.style.marginLeft = "0";
    DOMManager.canvas.style.marginTop = "0";

    const settings_entity = new ECSEntity();
    settings_entity.add_component(new SettingsComponent(8, 8, 1, true));
    EntityManager.current.add_entity(settings_entity);

    const mouse_entity = new ECSEntity();
    mouse_entity.add_component(new MouseInputComponent());
    EntityManager.current.add_entity(mouse_entity);

    await ModelReader.read('model.xrig');

    const add_bone = (x:BoneComponent) => {
        const entity = new ECSEntity();
        entity.add_component(x);
        EntityManager.current.add_entity(entity);
    }
    //add_bone(root);
    //add_bone(a);
    //add_bone(b);
    //add_bone(c);
    //add_bone(d);
    //add_bone(g);
    //add_bone(h);
    //add_bone(e);
    //add_bone(f);

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
    init_canvas();

    class BoneSelectSystem implements System{
        static current_bone:ECSEntity;
        static current_endpoint:ECSEntity;

        static highlighted_bone():ECSEntity{
            const mouse = EntityManager.current.get_entities([ComponentType.MouseInput])[0];
            const mouse_info = mouse.get_component<MouseInputComponent>(ComponentType.MouseInput);
            const entities = EntityManager.current.get_entities([ComponentType.Bone]);

            for(let idx = 0; idx < entities.length; idx++){
                const entity = entities[idx];
                const bone = entity.get_component<BoneComponent>(ComponentType.Bone);
                if(bone.intersects(new Ball(mouse_info.position, 10))){
                    return entity;
                }
            }
            return undefined;
        }

        static highlighted_endpoint():ECSEntity{
            const mouse = EntityManager.current.get_entities([ComponentType.MouseInput])[0];
            const mouse_info = mouse.get_component<MouseInputComponent>(ComponentType.MouseInput);
            const entities = EntityManager.current.get_entities([ComponentType.Bone]);

            for(let idx = 0; idx < entities.length; idx++){
                const entity = entities[idx];
                const bone = entity.get_component<BoneComponent>(ComponentType.Bone);
                const endpoint = new Ball(bone.endpoint(), 10);
                const mouse = new Ball(mouse_info.position, 10);
                if(VectorMath.intersectBallBall(endpoint, mouse)){
                    return entity;
                }
            }
            return undefined;
        }

        public step(){
            const mouse = EntityManager.current.get_entities([ComponentType.MouseInput])[0];
            const mouse_info = mouse.get_component<MouseInputComponent>(ComponentType.MouseInput);
            //h.move_endpoint(150, 150);
            //g.move_endpoint(200, 100);
            //e.move_endpoint(300, 300);
            //f.move_endpoint(350, 250);
            if(mouse_info.left){
                if(BoneSelectSystem.current_endpoint === undefined){
                    const highlighted_endpoint = BoneSelectSystem.highlighted_endpoint();
                    if(highlighted_endpoint !== undefined){
                        BoneSelectSystem.current_endpoint = highlighted_endpoint;
                    }else if(BoneSelectSystem.current_bone === undefined){
                        const highlighted = BoneSelectSystem.highlighted_bone();
                        if(highlighted !== undefined){
                            BoneSelectSystem.current_bone = highlighted;
                        }
                    }else{
                        const bone = BoneSelectSystem.current_bone.get_component<BoneComponent>(ComponentType.Bone);
                        bone.rotate(mouse_info.dx/-100);
                    }
                }else{
                    const bone = BoneSelectSystem.current_endpoint.get_component<BoneComponent>(ComponentType.Bone);
                    bone.move_endpoint(mouse_info.x, mouse_info.y);
                }
            }else{
                BoneSelectSystem.current_endpoint = undefined;
                BoneSelectSystem.current_bone = undefined;
            }
        }
    }

    class BoneRenderSystem implements System{
        public step(){
            const mouse = EntityManager.current.get_entities([ComponentType.MouseInput])[0];
            const mouse_info = mouse.get_component<MouseInputComponent>(ComponentType.MouseInput);

            const bone_entities:ECSEntity[] = EntityManager.current.get_entities([ComponentType.Bone]);

            const draw_target:ECSEntity = EntityManager.current.get_entities([ComponentType.UI])[0];
            const canvas:HTMLCanvasElement = draw_target.get_component<UIComponent>(ComponentType.UI).content;
            const context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            context.lineWidth=1;
            context.font="20px Georgia";
            context.strokeText(mouse_info.x + "," + mouse_info.y + "," + mouse_info.left + "," + mouse_info.middle + "," + mouse_info.right,mouse_info.x,mouse_info.y);

            bone_entities.forEach((entity) => {
                if(BoneSelectSystem.current_bone === entity){
                    context.strokeStyle = "red";
                }else if(BoneSelectSystem.highlighted_bone() === entity &&
                         BoneSelectSystem.highlighted_endpoint() === undefined){
                    context.strokeStyle = "green";
                }else{
                    context.strokeStyle = "black";
                }
                const bone = entity.get_component<BoneComponent>(ComponentType.Bone);
                const a = bone.origin(), b = bone.endpoint();
                context.beginPath();
                context.moveTo(a.x, a.y);
                context.lineTo(b.x, b.y);
                context.lineWidth = 2;
                context.stroke();
                if(BoneSelectSystem.current_endpoint === entity){
                    context.fillStyle = "red";
                }else if(BoneSelectSystem.highlighted_endpoint() === entity){
                    context.fillStyle = "green";
                }else{
                    context.fillStyle = "black";
                }
                context.fillRect(b.x - 5, b.y - 5, 10, 10);
            });
        }
    }

    SystemManager.current.add(new MouseInputSystem());
    SystemManager.current.add(new BoneSelectSystem());
    SystemManager.current.add(new BoneRenderSystem());
    SystemManager.current.add(new UIRenderSystem());
    SystemManager.current.start();
}
main();
