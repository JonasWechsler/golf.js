class CameraComponent implements Component{
    type: ComponentType = ComponentType.Camera;
    target : ()=>Vector;

    constructor(){
        this.target = ()=>new Vector(0, 0);
    }
}

class CameraSystem implements System{
    private canvas_cache:CanvasCache = new CanvasCache();

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

    constructor(){
        this.render_statics();
    }

    private render_statics(){
        const visible_statics:ECSEntity[] = EntityManager.current.get_entities([ComponentType.StaticRender]);
        visible_statics.sort((left, right) => {
            const left_component = left.get_component<StaticRenderComponent>(ComponentType.StaticRender);
            const right_component = right.get_component<StaticRenderComponent>(ComponentType.StaticRender);
            return left_component.z_index - right_component.z_index;
        });
        console.log(visible_statics);
        visible_statics.forEach((entity: ECSEntity) => {
            const render_component = entity.get_component<StaticRenderComponent>(ComponentType.StaticRender);
            this.canvas_cache.draw_image(render_component.content, new Vector(render_component.x, render_component.y));
        });
    }

    public step(){
        const entity_manager = EntityManager.current;
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

        //Draw statics from a cache
        const static_cache = this.canvas_cache.get_image(info);
        assert(static_cache.width == info.width);
        assert(static_cache.height == info.height);
        ctx.drawImage(static_cache, 0, 0);

        //Draw dynamic entities
        const visible_entities = entity_manager.get_entities([ComponentType.DynamicRender]);

        ctx.translate(-info.left, -info.top);
        visible_entities.forEach((entity: ECSEntity) => {
            const render_component = entity.get_component<DynamicRenderComponent>(ComponentType.DynamicRender);
            const bb = new Square(render_component.x, render_component.y, render_component.content.width, render_component.content.height);
            if(info.intersects(bb))
                ctx.drawImage(render_component.content, render_component.x, render_component.y);
        });
        ctx.translate(info.left, info.top);

        ui.content = content;
        ui.x = 0;
        ui.y = 0;
    }
}
