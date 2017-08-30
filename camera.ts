class CameraComponent implements Component{
    type: ComponentType = ComponentType.Camera;
    target : ()=>Vector;

    constructor(){
        this.target = ()=>new Vector(0, 0);
    }
}

class CameraSystem implements System{
    public static camera_info() : Square {
        const targets = EntityManager.current.get_entities([ComponentType.UI, ComponentType.Camera]);
        assert(targets.length == 1);
        const target = targets[0];
        const ui = target.get_component<UIComponent>(ComponentType.UI);
        const camera = target.get_component<CameraComponent>(ComponentType.Camera);
        const width = DOMManager.canvas.width;
        const height = DOMManager.canvas.height;

        let left, top;
        if(camera.target){
            left = camera.target().x - width/2;
            top = camera.target().y - height/2;
        }else{
            const left_norm = (width - MouseInfo.x()) / width;
            const top_norm = MouseInfo.y() / height;

            const shift_width = ui.content.width - width;
            const shift_height = ui.content.height - height;

            left = left_norm * shift_width;
            top = top_norm * shift_height;
        }

        return new Square(left, top, width, height);
    }

    public static screen_to_camera(x : number, y : number) : Vector {
        const entity_manager = EntityManager.current;
        const targets = entity_manager.get_entities([ComponentType.UI, ComponentType.Camera]);
        assert(targets.length == 1);
        const target = targets[0];
        const ui = target.get_component<UIComponent>(ComponentType.UI);
        const cam = target.get_component<CameraComponent>(ComponentType.Camera);
        const info = this.camera_info();
        return new Vector(
            (x / DOMManager.canvas.width) * info.width + info.left,
            (y / DOMManager.canvas.height) * info.height + info.top
        );
    }

    public step(entity_manager:EntityManager){
        const targets = entity_manager.get_entities([ComponentType.UI, ComponentType.Camera]);
        assert(targets.length == 1);
        const target = targets[0];
        const ui = target.get_component<UIComponent>(ComponentType.UI);
        const cam = target.get_component<CameraComponent>(ComponentType.Camera);

        const content = document.createElement("canvas");
        const ctx = content.getContext("2d");

        const info = CameraSystem.camera_info();
        content.width = info.width;
        content.height = info.height;

        const visible_entities = entity_manager.get_entities([ComponentType.Render]);

        ctx.translate(-info.left, -info.top);
        visible_entities.forEach((entity: ECSEntity) => {
            const render_component = entity.get_component<RenderComponent>(ComponentType.Render);
            ctx.drawImage(render_component.content, render_component.x, render_component.y);
        });
        ctx.translate(info.left, info.top);

        ui.content = content;
        ui.x = 0;
        ui.y = 0;
    }
}
