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

const player = new Player(new Vector(100, 100), 20,new Vector(0, 0));
physics.addDynamic(player);

WorldInfo.physics = physics;
WorldInfo.player = player;

const ai = new AI(new Vector(360, 360), 20, new Vector(0, 0));
physics.addDynamic(ai);

DungeonGenerator.LEFT_POS=-50;
DungeonGenerator.TOP_POS=-50;
DungeonGenerator.CELL_WIDTH=100;
DungeonGenerator.CELL_HEIGHT=100;
DungeonGenerator.generate();

WorldInfo.mesh = new NonintersectingFiniteGridNavigationMesh(20, 0, 500, 0, 500, WorldInfo.physics);

DOMManager.make_canvas();

const camera = new Camera(DOMManager.canvas.width*2, DOMManager.canvas.height*2);
camera.add_render_object(new PhysicsRender(physics));
camera.follow(() => player.position);

WorldInfo.camera = camera;

RenderManager.add_render_object(camera);
RenderManager.add_time_listener(player);
RenderManager.add_time_listener(ai);
RenderManager.add_time_listener(physics);
RenderManager.draw_loop();
RenderManager.execute_loop();
