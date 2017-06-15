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

class WorldInfo{
    static player: Player;
    static physics: Physics;
    static mesh: NavigationMesh;
    static camera: Camera;
}

KeyInfo.setup();
MouseInfo.setup();

const physics = new Physics();
physics.setAcceleration((x, y) => { return new Vector(0, 0); });

const player = new Player(new Vector(100, 100), 10,new Vector(0, 0));
physics.addDynamic(player);

const ai = new AI(new Vector(360, 360), 10, new Vector(0, 0));
physics.addDynamic(ai);
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(0, 0), new Vector(0, 500)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(0, 500), new Vector(500, 500)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(500, 500), new Vector(500, 0)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(500, 0), new Vector(0, 0)));

physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(400, 370), new Vector(400, 400)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(370, 370), new Vector(400, 370)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(370, 400), new Vector(370, 370)));
physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(400, 400), new Vector(370, 400)));

physics.addStaticLineSegment(new Physics.StaticLineSegment(new Vector(200, 300), new Vector(300, 200)));

WorldInfo.physics = physics;
WorldInfo.player = player;
WorldInfo.mesh = new NonintersectingFiniteGridNavigationMesh(20, 0, 500, 0, 500, WorldInfo.physics);

/*
const draw = () => {
    ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height);

    ctx.fillStyle = "orange";
    WorldInfo.mesh.neighbors(ai.target(), 20).forEach(function(vertex){
        ctx.fillStyle = ai.state.weight(vertex)?"orange":"black";
        ctx.fillRect(vertex.x, vertex.y, 5, 5);
    });

    ctx.fillStyle = "purple";
    ctx.fillRect(ai.objective().x, ai.objective().y, 10, 10);
    ctx.fillStyle = "green";
    ctx.fillRect(ai.target().x, ai.target().y, 10, 10);
    ctx.fillStyle = "red";
    ai.path.forEach(function(vertex){
        ctx.fillRect(vertex.x, vertex.y, 5, 5);
    });
	physics.drawPhysics(ctx);

	window.requestAnimationFrame(draw);
}
*/

DOMManager.make_canvas();

const camera = new Camera(DOMManager.canvas.width*2, DOMManager.canvas.height*2);
camera.add_render_object(physics);
camera.follow(() => player.position);

WorldInfo.camera = camera;

RenderManager.add_render_object(camera);
RenderManager.add_time_listener(player);
RenderManager.add_time_listener(ai);
RenderManager.add_time_listener(physics);
RenderManager.draw_loop();
RenderManager.execute_loop();
