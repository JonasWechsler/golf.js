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

                    ctx.strokeStyle = material.debugColor;
                    ctx.moveTo(border[0].x,border[0].y);
                    border.forEach(function(val){
                        ctx.lineTo(val.x,val.y);
                    });
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
        private left_perlin_subgraph: any[];
        private right_perlin_subgraph: any[];

        private maximum_resolution: number = 15;
        private minimum_resolution: number = 1;
        private perlin_smoothness: number = .99;
        private persistance: number = 1 / 4;
        private interpolate: number = .3;
        private max_wavelength:number = 500;

        private DEFAULT_SEED: number = 3;
        private seed: number = this.DEFAULT_SEED;
        private initial_seed: number = this.seed;

        constructor(private height: number) {
            this.init(height);
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

        getSeed():number {
            return this.seed;
        }

        random() {
            var x = Math.sin(this.seed++) * 10000;
            return x - Math.floor(x);
        }

        no_interpolate(a, b, x){
            return a;
        }

        linear_interpolate(a, b, x){
            return a*(1-x) + b*x;
        }

        cosine_interpolate(a, b, x){
            var pi = x * Math.PI;
            var f = (1 - Math.cos(pi)) * .5;
            return a*(1-f) + b*f;
        }

        smooth(a, b, c){
            return ((a + c) / 2 * this.perlin_smoothness) + (b * (1 - this.perlin_smoothness));
        }

        generate_perlin_with_parameters(x, minimum_resolution, maximum_resolution, max_wavelength, persistance, height):number {
            if (x < this.min_x - 1){
                this.generate_perlin_with_parameters(x+1, minimum_resolution, maximum_resolution, max_wavelength, persistance, height);
            }
            if (x > this.max_x + 1){
                this.generate_perlin_with_parameters(x-1, minimum_resolution, maximum_resolution, max_wavelength, persistance, height);
            }
            var active_subgraphs = [];
            var dx = 0;
            if (x < this.min_x) {
                this.min_x = x;
                dx = 1;
                active_subgraphs = this.left_perlin_subgraph;
            } else if (x > this.max_x) {
                this.max_x = x;
                dx = -1;
                active_subgraphs = this.right_perlin_subgraph;
            } else {
                return this.heights[x] * height;
            }

            for (var idx = this.minimum_resolution; idx < maximum_resolution; idx++) {
                var frequency = Math.pow(2, idx),
                    wavelength = Math.floor(max_wavelength / frequency);

                if (x % wavelength == 0) {
                    var amplitude = Math.pow(persistance, idx);
                    if(!active_subgraphs[idx]) active_subgraphs[idx] = {};
                    active_subgraphs[idx].last_value = active_subgraphs[idx].value;
                    active_subgraphs[idx].value = amplitude * this.random();
                    active_subgraphs[idx].wavelength = wavelength;
                }
            }

            var y = 0;
            var self = this;
            active_subgraphs.forEach(function(val) {
                if (val){
                    var a = val.last_value;
                    var b = val.value;
                    var i = (x % val.wavelength) / val.wavelength;
                   
                    if(x < 0)i *= -1;
                    if(!a)a = b;
                    y += self.cosine_interpolate(a, b, i)*self.interpolate + self.linear_interpolate(a, b, i)*(1-self.interpolate);
                }
            });

            if(y < 0 || y > 1){
                console.log(persistance);
                console.log(y);
            }
            this.heights[x] = y;
            return this.heights[x] * height;
        }

        generate_perlin_at(x):number {
            return this.generate_perlin_with_parameters(x, this.minimum_resolution, this.maximum_resolution, this.max_wavelength, this.persistance, this.height);
        }

        getHeightAt(x) {
            return this.generate_perlin_at(x);
        }

        setSeed(seed: number) {
            if(seed < 0){
                seed = Math.pow(2,30) + seed;
            }
            this.seed = seed;
            this.initial_seed = seed;
            this.init(this.height);
        }

        resetSeed(){
            this.seed = this.initial_seed;
        }

        setMaximumResolution(val){
            this.maximum_resolution = val;
            this.resetSeed();
            this.init(this.height);
        }
            setMinimumResolution(val){
            this.minimum_resolution = val;
            this.resetSeed();
            this.init(this.height);
        }
            setPerlinSmoothness(val){
            this.perlin_smoothness = val;
            this.resetSeed();
            this.init(this.height);
        }
            setPersistance(val){
            this.persistance = val;
            this.resetSeed();
            this.init(this.height);
        }
            setInterpolation(val){
            this.interpolate = val;
            this.resetSeed();
            this.init(this.height);
        }
            setMaxWavelength(val){
            this.max_wavelength = val;
            this.resetSeed();
            this.init(this.height);
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
                self.xoffset -= 1280;
            else
                self.xoffset += 1280;
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
                console.log(newY);
                self.player.position = new Vector(1280 - self.player.width() - 1, 1080 - newY - self.player.height());
            }));

            self.physics.addTrigger(new Physics.TriggerLineSegment(new Vector(1270, 0), new Vector(1270, 1080), function() {
                self.setLevel(self.x + 1, 0);
                var newY = self.getHeightAt(self.player.width() * 2);
                console.log(newY);
                self.player.position = new Vector(self.player.width() + 1, 1080 - newY - self.player.height());
            }));

            this.player = self.physics.addDynamic(new Physics.DynamicBall(new Vector(413, 100), 10, new Vector(0, 0)));
        }
    }
}