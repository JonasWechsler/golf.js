/*Running*/
class Runner {
	private canvasDOM: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	private world: WorldGenerators.PerlinGenerator;
	private plants: Graphics.Plant;
	private physics: Physics;
	private builder: WorldBuilder.Build1;

	private mouse: MouseHandler;
	private self: Runner;

	constructor(id) {

		this.canvasDOM = <HTMLCanvasElement>document.getElementById(id);
		this.ctx = this.canvasDOM.getContext("2d");

		this.canvasDOM.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		this.canvasDOM.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		this.canvasDOM.width = 1280;
		this.canvasDOM.height = 1080;
		// this.canvasDOM.width = screen.width;
		// this.canvasDOM.height = screen.height;

		this.world = new WorldGenerators.PerlinGenerator(this.canvasDOM.height);
		this.plants = new Graphics.Plant();
		this.physics = new Physics();
		this.builder = new WorldBuilder.Build1(this.physics);

		this.plants.setLength(25).setIterations(3);

		this.mouse = new MouseHandler(canvas);

		var self = this;

		var draw = function() {
			self.builder.step();
			self.physics.drawPhysics(self.ctx);
			window.requestAnimationFrame(draw);
		}

		draw();

		setInterval(() => {
			this.physics.stepPhysics();
		}, 10);
	}
}