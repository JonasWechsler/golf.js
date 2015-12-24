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
		this.canvasDOM.width = 450;
		this.canvasDOM.height = 900;
		this.canvasDOM.width = screen.width;
		this.canvasDOM.height = screen.height;

		this.world = new WorldGenerators.PerlinGenerator(this.canvasDOM.height);
		this.plants = new Graphics.Plant();
		this.physics = new Physics();
		this.builder = new WorldBuilder.Build1(this.physics);

		this.plants.setLength(25).setIterations(3);

		this.mouse = new MouseHandler(canvas);

		this.setUpInputs();

		var self = this;

		var draw = function() {
			self.physics.drawPhysics(self.ctx);
			self.checkInputs();
			window.requestAnimationFrame(draw);
		}

		draw();

		setInterval(() => {
			this.physics.stepPhysics();
		}, 10);
	}

	setUpInputs() {
		var self = this;

		document.addEventListener('keydown', function(e) {
			var char = String.fromCharCode(e.keyCode);
			switch (char) {
				case 'A':
					self.physics.setAcceleration(function(x, y) { return new Vector(-.03, .02) });
					break;
				case 'D':
					self.physics.setAcceleration(function(x, y) { return new Vector(.03, .02) });
					break;
			}
		}, false);

		document.addEventListener('keyup', function(e) {
			var char = String.fromCharCode(e.keyCode);
			switch (char) {
				case 'A':
				case 'D':
					self.physics.setAcceleration(function(x, y) { return new Vector(0, .02) });
					break;
			}
		}, false);
	}

	checkInputs() {
		this.ctx.strokeStyle = "black";
		if (this.mouse.down()) {
			this.ctx.beginPath();
			this.ctx.moveTo(Math.floor(this.mouse.getXOnDown()), Math.floor(this.mouse.getYOnDown()));
			this.ctx.lineTo(Math.floor(this.mouse.getX()), Math.floor(this.mouse.getY()));
			this.ctx.stroke();
		}
	}
}