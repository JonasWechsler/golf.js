class EntityInspectorComponent implements Component{
    type: ComponentType = ComponentType.EntityInspector;
    constructor(public entities:ECSEntity[], public target:() => Vector){}
}

class EntityInspectorRenderSystem implements System{
    static render_entity_inspector(entity:EntityInspectorComponent, ui:UIComponent){
        const target = entity.target();

        const ctx = ui.content.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        disableImageSmoothing(ctx);

        entity.entities.forEach((entity)=>{
            console.assert(entity.has_component(ComponentType.DynamicRender));
            const render = entity.get_component<DynamicRenderComponent>(ComponentType.DynamicRender);
            ctx.drawImage(render.content, render.x - target.x + ui.content.width/2,
                          render.y - target.y + ui.content.height/2);
        });
    }

    step(){
        const components = [ComponentType.EntityInspector, ComponentType.UI];
        const entities = EntityManager.current.get_entities(components);

        entities.forEach((entity) => {
            const inspector = entity.get_component<EntityInspectorComponent>(ComponentType.EntityInspector);
            const target = entity.get_component<UIComponent>(ComponentType.UI);
            EntityInspectorRenderSystem.render_entity_inspector(inspector, target);
        });
    }
}

class CameraComponent implements Component{
    type: ComponentType = ComponentType.Camera;
    constructor(public target:()=>Vector = ()=>new Vector(0, 0)){}
}

class CameraSystem implements System{
    private canvas_cache:CanvasCache = new CanvasCache();
    private static SCALE:number = 8;

    public static camera_info() : Square {
        const targets = EntityManager.current.get_entities([ComponentType.UI, ComponentType.Camera]);
        console.assert(targets.length == 1);
        const target = targets[0];
        const ui = target.get_component<UIComponent>(ComponentType.UI);
        const camera = target.get_component<CameraComponent>(ComponentType.Camera);
        const width = Math.floor(DOMManager.canvas.width/CameraSystem.SCALE);
        const height = Math.floor(DOMManager.canvas.height/CameraSystem.SCALE);

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

        //left = Math.round(left);
        //top = Math.round(top);

        return new Square(left, top, width, height);
    }

    public static screen_to_camera(x : number, y : number) : Vector {
        const entity_manager = EntityManager.current;
        const targets = entity_manager.get_entities([ComponentType.UI, ComponentType.Camera]);
        console.assert(targets.length == 1);
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
        visible_statics.forEach((entity: ECSEntity) => {
            const render_component = entity.get_component<StaticRenderComponent>(ComponentType.StaticRender);
            this.canvas_cache.draw_image(render_component.content, new Vector(render_component.x, render_component.y));
        });
    }

    public step(){
        const entity_manager = EntityManager.current;
        const targets = entity_manager.get_entities([ComponentType.UI, ComponentType.Camera]);
        console.assert(targets.length == 1);
        const target = targets[0];
        const ui = target.get_component<UIComponent>(ComponentType.UI);
        const cam = target.get_component<CameraComponent>(ComponentType.Camera);

        const content = document.createElement("canvas");
        const ctx = content.getContext("2d");
        disableImageSmoothing(ctx);

        const info = CameraSystem.camera_info();
        content.width = info.width;
        content.height = info.height;

        //Draw statics from a cache
        const static_cache = this.canvas_cache.get_image(info);
        console.assert(static_cache.width == info.width);
        console.assert(static_cache.height == info.height);
        ctx.drawImage(static_cache, 0, 0, content.width, content.height);

        //Draw dynamic entities
        const visible_entities = entity_manager.get_entities([ComponentType.DynamicRender]);

        ctx.translate(-info.left, -info.top);

        visible_entities.forEach((entity: ECSEntity) => {
            const render_component = entity.get_component<DynamicRenderComponent>(ComponentType.DynamicRender);

            if(!render_component.visible){
                return;
            }

            const bounding_box = new Square(render_component.x,
                                  render_component.y,
            render_component.content.width,
            render_component.content.height);
            
            if(info.intersects(bounding_box)){
                ctx.drawImage(render_component.content, Math.round(render_component.x), Math.round(render_component.y));
            }
        });
        ctx.translate(info.left, info.top);

        ui.content = content;
        ui.x = modulus(info.left,1)*CameraSystem.SCALE;
        ui.y = modulus(info.top,1)*CameraSystem.SCALE;
    }
}
