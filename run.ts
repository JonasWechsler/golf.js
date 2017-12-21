//var data = [
//    [0, 0],
//    [0, 100],
//    [100, 0],
//];
//
//var voronoi = d3.voronoi(data);
//
//
//var contour = [
//        new poly2tri.Point(100, 100),
//        new poly2tri.Point(100, 300),
//        new poly2tri.Point(300, 300),
//        new poly2tri.Point(300, 100)
//];
//var swctx = new poly2tri.SweepContext(contour);
//swctx.triangulate();
//var triangles = swctx.getTriangles();
//triangles.forEach(function(t) {
//    t.getPoints().forEach(function(p) {
//        console.log(p.x, p.y);
//    });
//});
//

const system_manager = new SystemManager(new EntityManager());

MouseInfo.setup();
DOMManager.make_canvas();

//const player = new Player(new Vector(30, 30), 20,new Vector(0, 0));
const player = new ECSEntity();
player.add_component(new DynamicPhysicsComponent(new Vector(60, 60), 3));
player.add_component(new KeyInputComponent());
const player_canvas = document.createElement("canvas");
player_canvas.width = player_canvas.height = 6;
player.add_component(new DynamicRenderComponent(0, 0, player_canvas));

//const ai = new AI(new Vector(360, 360), 20, new Vector(0, 0));

function floor(){
    for(let i=0;i<5;i++){
        const ent = new ECSEntity();
        const texture = new FloorTextureComponent(new MarbleTexture(16).generate());
        ent.add_component(texture);
        EntityManager.current.add_entity(ent);
    }
}
floor();

function background(){
    const ent = new ECSEntity();
    const view = new StaticRenderComponent(0, 0, document.createElement("canvas"), -2);
    view.content.width = view.content.height = 256*8;
    view.x = view.y = view.content.width/-2;
    const ctx = view.content.getContext("2d");
    const img = new SandTexture(512).generate();
    disableImageSmoothing(ctx);
    ctx.drawImage(img, 0, 0, view.content.width, view.content.height);
    ent.add_component(view);
    EntityManager.current.add_entity(ent);
}
background();

let entity_inspector;
function joints(){
    const player_joint = new JointComponent(new Vector(60, 60));
    player.add_component(player_joint);

    const fixed_joint_entity = new ECSEntity();
    const fixed_joint = new JointComponent(new Vector(60, 60));
    fixed_joint_entity.add_component(fixed_joint);
    fixed_joint_entity.add_component(new DynamicRenderComponent(0, 0, document.createElement("canvas")));

    const fixed_connection_entity = new ECSEntity();
    const fixed_connection = new FixedConnectionComponent(player_joint, fixed_joint, new Vector(0, 0));
    fixed_connection_entity.add_component(fixed_connection);
    fixed_connection_entity.add_component(new DynamicRenderComponent(0, 0, document.createElement("canvas"), false));

    player_joint.adjacent_fixed.push(fixed_connection);
    fixed_joint.adjacent_fixed.push(fixed_connection);

    EntityManager.current.add_entity(fixed_joint_entity);
    EntityManager.current.add_entity(fixed_connection_entity);

    const joints_list:ECSEntity[] = [player, fixed_connection_entity];

    let last_j = player_joint;
    for(let i=1;i<5;i++){
        const e = new ECSEntity();
        const jc = new JointComponent(new Vector(player_joint.position.x, player_joint.position.y+i*3));
        e.add_component(jc);
        e.add_component(new DynamicRenderComponent(0, 0, document.createElement("canvas"), false));

        if(last_j){
            const connection_entity = new ECSEntity();
            const connection = new FlexibleConnectionComponent(jc, last_j, 3);
            jc.adjacent_flexible.push(connection);
            last_j.adjacent_flexible.push(connection);
            connection_entity.add_component(connection);
            connection_entity.add_component(new DynamicRenderComponent(0, 0, document.createElement("canvas"), false));
            EntityManager.current.add_entity(connection_entity);
            joints_list.push(connection_entity);
        }
        last_j = jc;
        EntityManager.current.add_entity(e);
    }

    entity_inspector = new ECSEntity();
    const entity_inspector_component = new EntityInspectorComponent(joints_list, () => player.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics).position);
    const entity_inspector_canvas = document.createElement("canvas");
    entity_inspector_canvas.width = entity_inspector_canvas.height = 100;
    const entity_inspector_ui = new UIComponent(DOMManager.canvas.width/2 - 400,
                                                DOMManager.canvas.height/2 - 400,
                                                entity_inspector_canvas, 800, 800);
    entity_inspector.add_component(entity_inspector_component);
    entity_inspector.add_component(entity_inspector_ui);
}
joints();

DungeonGenerator.CELL_WIDTH=32;
DungeonGenerator.CELL_HEIGHT=32;
DungeonGenerator.HEIGHT=20;
DungeonGenerator.WIDTH=20;
DungeonGenerator.LEFT_POS=-.5*DungeonGenerator.WIDTH*DungeonGenerator.CELL_WIDTH+16;
DungeonGenerator.TOP_POS=-.5*DungeonGenerator.HEIGHT*DungeonGenerator.CELL_HEIGHT+16;
DungeonGenerator.START_POS = new Vector(DungeonGenerator.WIDTH/2, DungeonGenerator.HEIGHT/2);
DungeonGenerator.generate();

for(let i=0;ComponentType[i];i++)
    console.log(i, ComponentType[i]);
console.log(system_manager);

//WorldInfo.mesh = new NonintersectingFiniteGridNavigationMesh(20, 0, 500, 0, 500, WorldInfo.physics);

const camera = new ECSEntity();
const ui_component = new UIComponent(0, 0, document.createElement("canvas"),
                                     DOMManager.canvas.width, DOMManager.canvas.height);
const camera_component = new CameraComponent();
camera_component.target = () => player.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics).position;
camera.add_component(camera_component);
camera.add_component(ui_component);

const fps = new ECSEntity();
fps.add_component(new FPSComponent());
fps.add_component(new UIComponent(0, 0, document.createElement("canvas")));

system_manager.entity_manager.add_entity(camera);
system_manager.entity_manager.add_entity(fps);
system_manager.entity_manager.add_entity(entity_inspector);
system_manager.entity_manager.add_entity(player);
system_manager.add(new KeySystem());
system_manager.add(new ControlSystem());
system_manager.add(new DungeonRenderSystem());
//system_manager.add(new PhysicsRenderSystem(false));
system_manager.add(new JointMovementSystem());
system_manager.add(new JointRenderSystem());
system_manager.add(new CameraSystem());
system_manager.add(new UIRenderSystem());
system_manager.add(new FPSSystem());
system_manager.add(new EntityInspectorRenderSystem());
system_manager.add(new PhysicsSystem());
system_manager.start();
