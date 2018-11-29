const system_manager = new SystemManager(new EntityManager());
MouseInfo.setup();
DOMManager.make_canvas();

const settings_entity = new ECSEntity();
settings_entity.add_component(new SettingsComponent(8, 8, 1, true));
EntityManager.current.add_entity(settings_entity);

const mouse_entity = new ECSEntity();
mouse_entity.add_component(new MouseInputComponent());
EntityManager.current.add_entity(mouse_entity);

const vec3 = new Vector3(0, 0, 1);
const mat3trans = Mat3Transform.translate(1, 0);
const mat3rot = Mat3Transform.rotate(Math.PI/2);
console.log(mat3rot.timesVector(mat3trans.timesVector(vec3)));
console.log("inverse transform:", mat3trans.inverse().array);
console.log("inverse rotation:", mat3rot.inverse().array);
const root = new BoneComponent(new Vector(100, 50), undefined, 0);
const a = new BoneComponent(new Vector(-50, 50), root, 1);
const b = new BoneComponent(new Vector(50, 50), root, 2);
const add_bone = (x:BoneComponent) => {
    const entity = new ECSEntity();
    entity.add_component(x);
    EntityManager.current.add_entity(entity);
}
add_bone(root);
add_bone(a);
add_bone(b);
add_bone(new BoneComponent(new Vector(-20, 20), a, 3));
add_bone(new BoneComponent(new Vector(20, 20), a, 3));
add_bone(new BoneComponent(new Vector(-20, 20), b, 3));
add_bone(new BoneComponent(new Vector(20, 20), b, 3));

console.log(root, a, b);
console.log("root", root.origin(), root.endpoint());
console.log("a", a.origin(), a.endpoint());
console.log("b", b.origin(), b.endpoint());

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
    system_manager.entity_manager.add_entity(canvas);
}
init_canvas();

class BoneSelectSystem implements System{
    static current_bone:ECSEntity;

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

    public step(){
        const mouse = EntityManager.current.get_entities([ComponentType.MouseInput])[0];
        const mouse_info = mouse.get_component<MouseInputComponent>(ComponentType.MouseInput);
        if(mouse_info.left){
            if(BoneSelectSystem.current_bone === undefined){
                const highlighted = BoneSelectSystem.highlighted_bone();
                if(highlighted !== undefined){
                    BoneSelectSystem.current_bone = highlighted;
                }
            }else{
                const bone = BoneSelectSystem.current_bone.get_component<BoneComponent>(ComponentType.Bone);
                bone.rotate(mouse_info.dx/100);
            }
        }else{
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
            }else if(BoneSelectSystem.highlighted_bone() === entity){
                context.strokeStyle = "blue";
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
        });
    }
}

system_manager.add(new MouseInputSystem());
system_manager.add(new BoneSelectSystem());
system_manager.add(new BoneRenderSystem());
system_manager.add(new UIRenderSystem());
system_manager.start();
