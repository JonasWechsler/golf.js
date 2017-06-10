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
    static entities: Entity[];
    static physics: Physics;
    static mesh: NavigationMesh;
}

const canvasDOM = document.createElement("canvas");
document.body.appendChild(canvasDOM);
const ctx = canvasDOM.getContext("2d");

canvasDOM.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
canvasDOM.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
canvasDOM.width = 1280;
canvasDOM.height = 1080;

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

const entities: Entity[] = [player, ai];

const mouse = new MouseHandler(canvasDOM);

WorldInfo.physics = physics;
WorldInfo.player = player;
WorldInfo.entities = entities;
WorldInfo.mesh = new NonintersectingFiniteGridNavigationMesh(20, 0, 500, 0, 500, WorldInfo.physics);

const draw = () => {
    ctx.clearRect(0, 0, canvasDOM.width, canvasDOM.height);

    ctx.fillStyle = "orange";
    WorldInfo.mesh.neighbors(ai.target(), 7).forEach(function(vertex){
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

draw();

setInterval(() => {
    entities.forEach((entity) => {
        entity.step();
    });
	physics.stepPhysics();
}, 10);



//const r = new Runner();
