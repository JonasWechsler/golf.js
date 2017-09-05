var data = [
    [0, 0],
    [0, 100],
    [100, 0],
];

var voronoi = d3.voronoi(data);

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

KeyInfo.setup();
MouseInfo.setup();

//const player = new Player(new Vector(30, 30), 20,new Vector(0, 0));
const player = new ECSEntity();
player.add_component(new DynamicPhysicsComponent(new Vector(30, 30), 20));

//const ai = new AI(new Vector(360, 360), 20, new Vector(0, 0));

DungeonGenerator.LEFT_POS=-1000;
DungeonGenerator.TOP_POS=-1000;
DungeonGenerator.CELL_WIDTH=100;
DungeonGenerator.CELL_HEIGHT=100;
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
fps.add_component(new FPSComponent(0));
fps.add_component(new UIComponent(0, 0, document.createElement("canvas")));

system_manager.entity_manager.add_entity(camera);
system_manager.entity_manager.add_entity(fps);
system_manager.entity_manager.add_entity(player);
system_manager.add(new CameraSystem());
system_manager.add(new UIRenderSystem());
system_manager.add(new PhysicsRenderSystem());
system_manager.add(new FPSSystem());
system_manager.add(new PhysicsSystem());
system_manager.start();
