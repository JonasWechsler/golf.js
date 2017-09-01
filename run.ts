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

KeyInfo.setup();
MouseInfo.setup();

const physics = new Physics();
physics.setAcceleration((x, y) => { return new Vector(0, 0); });

const player = new Player(new Vector(30, 30), 20,new Vector(0, 0));
physics.addDynamic(player);

WorldInfo.physics = physics;
WorldInfo.player = player;

const ai = new AI(new Vector(360, 360), 20, new Vector(0, 0));
physics.addDynamic(ai);

DungeonGenerator.LEFT_POS=-1000;
DungeonGenerator.TOP_POS=-1000;
DungeonGenerator.CELL_WIDTH=100;
DungeonGenerator.CELL_HEIGHT=100;
DungeonGenerator.START_POS = new Vector(10, 10);
DungeonGenerator.generate();

WorldInfo.mesh = new NonintersectingFiniteGridNavigationMesh(20, 0, 500, 0, 500, WorldInfo.physics);

DOMManager.make_canvas();

const system_manager = new SystemManager(new EntityManager());
const camera = new ECSEntity();
const ui_component = new UIComponent(0, 0, document.createElement("canvas"));
const camera_component = new CameraComponent();
camera_component.target = () => player.position;
camera.add_component(camera_component);
camera.add_component(ui_component);

const fps = new ECSEntity();
fps.add_component(new FPSComponent());
fps.add_component(new UIComponent(0, 0, document.createElement("canvas")));

system_manager.entity_manager.add_entity(camera);
system_manager.entity_manager.add_entity(fps);
system_manager.add(new CameraSystem());
system_manager.add(new UIRenderSystem());
system_manager.add(new PhysicsRenderSystem(physics));
system_manager.add(new FPSSystem());
system_manager.start();

RenderManager.add_time_listener(player);
RenderManager.add_time_listener(ai);
RenderManager.add_time_listener(physics);
RenderManager.execute_loop();
