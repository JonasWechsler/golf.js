const system_manager = new SystemManager(new EntityManager());
MouseInfo.setup();
DOMManager.make_canvas();

const settings_entity = new ECSEntity();
settings_entity.add_component(new SettingsComponent(8, 8, 1, true));
EntityManager.current.add_entity(settings_entity);

const vec3 = new Vector3(0, 0, 1);
const mat3trans = Mat3Transform.translate(1, 0);
const mat3rot = Mat3Transform.rotate(Math.PI/2);
console.log(mat3rot.timesVector(mat3trans.timesVector(vec3)));
console.log("inverse transform:", mat3trans.inverse().array);
console.log("inverse rotation:", mat3rot.inverse().array);
const root = new BoneComponent(new Vector(2, 2), undefined, 0);
const a = new BoneComponent(new Vector(-2, 2), root, 1);
const b = new BoneComponent(new Vector(2, 2), root, 2);
console.log(root, a, b);
console.log("root", root.origin(), root.endpoint());
console.log("a", a.origin(), a.endpoint());
console.log("b", b.origin(), b.endpoint());

function init_canvas(){
    const canvas = new ECSEntity();
    const c = document.createElement("canvas");
    const context = c.getContext("2d");
    context.fillRect(5, 5, 5, 5);
    canvas.add_component(new UIComponent(0, 0, c, DOMManager.CANVAS_WIDTH, DOMManager.CANVAS_HEIGHT));
    system_manager.entity_manager.add_entity(canvas);
}
init_canvas();

system_manager.add(new UIRenderSystem());
system_manager.start();
