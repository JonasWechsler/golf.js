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

//const player = new Player(new Vector(30, 30), 20,new Vector(0, 0));
const player = new ECSEntity();
player.add_component(new DynamicPhysicsComponent(new Vector(30, 30), 20));
player.add_component(new KeyInputComponent());
const player_canvas = document.createElement("canvas");
player_canvas.width = 40;
player_canvas.height = 40;
player.add_component(new DynamicRenderComponent(0, 0, player_canvas));

//const ai = new AI(new Vector(360, 360), 20, new Vector(0, 0));

function floor(){
    for(let i=0;i<5;i++){
    const ent = new ECSEntity();
    const texture = new FloorTextureComponent(new MarbleTexture(8).generate());
    ent.add_component(texture);
    EntityManager.current.add_entity(ent);
    }
}
floor();

function background(){
const ent = new ECSEntity();
const view = new StaticRenderComponent(0, 0, document.createElement("canvas"));
view.content.width = view.content.height = 512*32;
view.x = view.y = -512*8;
const ctx = view.content.getContext("2d");
disableImageSmoothing(ctx);
ctx.drawImage(new SandTexture(512).generate(), 0, 0, 512*16, 512*16);
ent.add_component(view);
EntityManager.current.add_entity(ent);
}
background();

DungeonGenerator.LEFT_POS=-1280;
DungeonGenerator.TOP_POS=-1280;
DungeonGenerator.CELL_WIDTH=128;
DungeonGenerator.CELL_HEIGHT=128;
DungeonGenerator.HEIGHT=20;
DungeonGenerator.WIDTH=20;
DungeonGenerator.START_POS = new Vector(10, 10);
DungeonGenerator.generate();

for(let i=0;i<9;i++)
    console.log(i, ComponentType[i]);
console.log(system_manager);

//WorldInfo.mesh = new NonintersectingFiniteGridNavigationMesh(20, 0, 500, 0, 500, WorldInfo.physics);

DOMManager.make_canvas();

const camera = new ECSEntity();
const ui_component = new UIComponent(0, 0, document.createElement("canvas"));
const camera_component = new CameraComponent();
camera_component.target = () => player.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics).position;
camera.add_component(camera_component);
camera.add_component(ui_component);

const fps = new ECSEntity();
fps.add_component(new FPSComponent());
fps.add_component(new UIComponent(0, 0, document.createElement("canvas")));

system_manager.entity_manager.add_entity(camera);
system_manager.entity_manager.add_entity(fps);
system_manager.entity_manager.add_entity(player);
system_manager.add(new KeySystem());
system_manager.add(new ControlSystem());
system_manager.add(new DungeonRenderSystem());
system_manager.add(new PhysicsRenderSystem(false));
system_manager.add(new CameraSystem());
system_manager.add(new UIRenderSystem());
system_manager.add(new FPSSystem());
system_manager.add(new PhysicsSystem());
system_manager.start();
