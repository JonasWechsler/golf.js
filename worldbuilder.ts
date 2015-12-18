module WorldBuilder {
    export interface World{
        setPhysics:(physics: Physics) => void;
        getSurfaces:() => WorldBuilder.Surface[];
        getObjects:() => Graphics.Object[];
    }

    export module Surface{
        export interface DrawCallback {
            (ctx:CanvasRenderingContext2D,
            material: Physics.Material,
            border:Point[]): void;
        }
    }
    
    export class Surface{
        constructor(private material: Physics.Material,
            private border:Point[],
            private drawFunction:WorldBuilder.Surface.DrawCallback){
        }
        setMaterial(material: Physics.Material){
            this.material = material;
            return this;
        }
        getMaterial(){
            return this.material;
        }
        setBorder(border: Point[]){
            this.border = border;
            return this;
        }
        getBorder(){
            return this.border;
        }
        setDrawFunction(fun:WorldBuilder.Surface.DrawCallback){
            this.drawFunction = fun;
            return this;
        }
        getDrawFunction(){
            return this.drawFunction;
        }
        draw(ctx:CanvasRenderingContext2D){
            this.drawFunction(ctx,this.getMaterial(),this.getBorder());
        }
        static defaultSurface() : WorldBuilder.Surface{
            var defaultMaterial =  Physics.Material.defaultMaterial();
            var defaultBorder = [];
            var defaultDrawFunction = (ctx: CanvasRenderingContext2D,
                material: Physics.Material,
                border: Point[]) => {
                    if(border.length === 0)
                        return;

                    ctx.beginPath();
                    ctx.strokeStyle = material.debugColor;
                    ctx.moveTo(border[0].x,border[0].y);
                    border.forEach(function(val){
                        ctx.lineTo(val.x,val.y);
                    });
                    ctx.stroke();
            };
            return new Surface(defaultMaterial,
                defaultBorder,
                defaultDrawFunction);
        }    
    }



    export class PerlinGenerator {
        private heights: {[key: number]: number};
        private x: number;
        private max_x: number;
        private min_x: number;

        private maximum_resolution: number;
        private minimum_resolution: number;
        private left_perlin_subgraph: any[];
        private right_perlin_subgraph: any[];
        private perlin_smoothness: number;

        private seed: number;
        private DEFAULT_SEED: number = 5;

        constructor(private height: number) {
            this.init(height);

            this.maximum_resolution = 15;
            this.minimum_resolution = 2;

            this.perlin_smoothness = .997; //0<smooth<1 .9965 is alright

            this.seed = this.DEFAULT_SEED;
        }

        init(height: number){
            this.heights = {
                '-1': height / 2,
                '0': height / 2,
                '1': height / 2
            };

            this.x = 0;
            this.max_x = -1;
            this.min_x = 1;

            this.left_perlin_subgraph = [];
            this.right_perlin_subgraph = [];
        }

        setSeed(seed: number) {
            if(seed < 0){
                seed = Math.pow(2,30) + seed;
            }
            this.seed = seed;
            this.init(this.height);
        }

        getSeed():number {
            return this.seed;
        }

        random() {
            var x = Math.sin(this.seed++) * 10000;
            return x - Math.floor(x);
        }

        generate_perlin_at(x) {
            if (x < this.min_x - 1){
                this.generate_perlin_at(x+1);
            }
            if (x>this.max_x + 1){
                this.generate_perlin_at(x-1);
            }
            var active_subgraphs = [];
            var last_y = 0;
            if (x < this.min_x) {
                this.min_x = x;
                last_y = this.heights[x + 1];
                active_subgraphs = this.left_perlin_subgraph;
            } else if (x > this.max_x) {
                this.max_x = x;
                last_y = this.heights[x - 1];
                active_subgraphs = this.right_perlin_subgraph;
            } else {
                return this.heights[x];
            }

            var new_point = false;

            for (var idx = this.minimum_resolution; idx < this.maximum_resolution; idx++) {
                var frequency = Math.pow(2, idx),
                    wavelength = Math.floor(200 / frequency);

                if (x % wavelength == 0) {
                    var persistance = 1 / Math.sqrt(2),
                        amplitude = Math.pow(persistance, idx) * this.height;
                    active_subgraphs[idx] = amplitude * this.random();
                    new_point = true;
                }
            }

            var y = 0;
            if (new_point) {
                active_subgraphs.forEach(function(val) {
                    if (val)
                        y += val;
                });
                y = last_y * this.perlin_smoothness + y * (1 - this.perlin_smoothness);
            } else {
                y = last_y;
            }

            this.heights[x] = y;
            return y;
        }

        getHeightAt(x) {
            return this.generate_perlin_at(x);
        }
    }
    export class Build1 implements WorldBuilder.World{
        sounds: any[];
        private physics: Physics;
        private perlin: WorldBuilder.PerlinGenerator;
        private x: number;
        private y: number;
        private xoffset: number = 0;
        public player: Physics.Dynamic;
        constructor(physics: Physics) {
            this.physics = physics;
            this.physics.setAcceleration(function(x, y) {
                //return new Vector(-1*(x-canvas.width/2),-1*(y-canvas.width/2)).divided(1000);
                return new Vector(0, .02);
            });
            this.sounds = [];
            this.perlin = new WorldBuilder.PerlinGenerator(1080);
            this.x = 0;
            this.y = 0;
            this.build();
        }
        setPhysics(physics: Physics){
            this.physics = physics;
        }
        getSurfaces() : WorldBuilder.Surface[]{
            return [];
        }

        getObjects() : Graphics.Object[]{
            return [];
        }

        setLevel(x, y): WorldBuilder.World {
            var self = this;
            //self.perlin.setSeed((x >> 32) + y);
            if (self.x > x)
                self.xoffset += 1280;
            else
                self.xoffset -= 1280;
            self.build();
            self.x = x;
            self.y = y;
            return self;
        }

        playSound(sound, vol) {
            if (!this.sounds[sound]) {
                this.sounds[sound] = new Audio('sounds/' + sound);
            }
            this.sounds[sound].volume = vol;
            this.sounds[sound].play();
        }

        getHeightAt(x:number):number{
            return this.perlin.getHeightAt(x + this.xoffset);
        }

        build() {
            var self = this;

            self.physics.clearAll();
            var stat = function(x0, y0, x1, y1) {
                self.physics.addStatic(new Physics.LineSegment(new Vector(x0, y0), new Vector(x1, y1)));
            }
            var lastStroke = new Vector(0, 0);
            var moveTo = function(x, y) {
                lastStroke = new Vector(x, y);
            }
            var strokeTo = function(x, y) {
                var vec = new Vector(x, y);
                self.physics.addStatic(new Physics.LineSegment(lastStroke, vec));
                lastStroke = vec;
            }
            var glass = new Physics.Material(0, "black", function(vol) {
                if (vol < .05) vol *= vol;
                vol = Math.min(vol, 1);
                var sounds = ["Percussive Elements-06.wav",
                    "Percussive Elements-04.wav",
                    "Percussive Elements-05.wav"
                ];
                var i = Math.floor(Math.random() * sounds.length);
                //self.playSound(sounds[i], vol);
            });
            self.physics.setMaterial(glass);
            
            moveTo(0, 0);
            for (var x = 0; x < 1280; x++) {
                strokeTo(x, 1080 - this.getHeightAt(x));
            }
            strokeTo(1280 - 1, 0);


            self.physics.addTrigger(new Physics.TriggerLineSegment(new Vector(10, 0), new Vector(10, 1080), function(){
                self.setLevel(self.x - 1, 0);
                var newY = self.getHeightAt(1280 - self.player.width()*2);
                self.player.position = new Vector(1280 - self.player.width() - 1, 1080 - newY - self.player.height());
            }));

            self.physics.addTrigger(new Physics.TriggerLineSegment(new Vector(1270, 0), new Vector(1270, 1080), function() {
                self.setLevel(self.x + 1, 0);
                var newY = self.getHeightAt(self.player.width()*2);
                self.player.position = new Vector(self.player.width() + 1, 1080 - newY - self.player.height());
            }));

            this.player = self.physics.addDynamic(new Physics.DynamicBall(new Vector(413, 100), 10, new Vector(0, 0)));
        }
    }
}