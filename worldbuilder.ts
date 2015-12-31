module WorldBuilder {
    export interface World {
        setPhysics: (physics: Physics) => void;
        getSurfaces: () => Graphics.Surface[];
        getObjects: () => Graphics.Object[];
        step: () => void;
    }

    export class Build1 implements WorldBuilder.World {
        sounds: any[];
        private physics: Physics;
        private perlin: WorldGenerators.LinearGenerator;
        private x: number;
        private y: number;
        private xoffset: number = 0;
        private keyHandler: KeyHandler;
        private mouseHandler: MouseHandler;
        public player: Entity.Player;
        constructor(physics: Physics) {
            this.physics = physics;
            this.physics.setAcceleration(function(x, y) {
                //return new Vector(-1*(x-canvas.width/2),-1*(y-canvas.width/2)).divided(1000);
                return new Vector(0, .02);
            });
            this.keyHandler = new KeyHandler(document);
            this.mouseHandler = new MouseHandler(document);
            this.sounds = [];
            this.perlin = new WorldGenerators.PerlinPerlinGenerator(1080);
            this.x = 0;
            this.y = 0;
            this.build();
        }
        setPhysics(physics: Physics):void {
            this.physics = physics;
        }
        getSurfaces(): Graphics.Surface[] {
            return [];
        }

        getObjects(): Graphics.Object[] {
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

        playSound(sound, vol):void {
            if (!this.sounds[sound]) {
                this.sounds[sound] = new Audio('sounds/' + sound);
            }
            this.sounds[sound].volume = vol;
            this.sounds[sound].play();
        }

        getHeightAt(x: number): number {
            return this.perlin.getHeightAt(x + this.xoffset);
        }

        drawLevel():void {
            var self = this;
            var lastStroke = new Vector(0, 0);
            var moveTo = function(x, y) {
                lastStroke = new Vector(x, y);
            }
            var strokeTo = function(x, y) {
                var vec = new Vector(x, y);
                self.physics.addStatic(new Physics.LineSegment(lastStroke, vec));
                lastStroke = vec;
            }
            var dirt = new Physics.Material(0, "black", function(vol) {
                if (vol < .05) vol *= vol;
                vol = Math.min(vol, 1);
                var sounds = ["Percussive Elements-06.wav",
                    "Percussive Elements-04.wav",
                    "Percussive Elements-05.wav"
                ];
                var i = Math.floor(Math.random() * Math.random() * Math.random() * sounds.length);
                // self.playSound(sounds[i], vol);
            });

            if (!self.player) {
                self.player = new Entity.Player(new Vector(413, 0), 10, new Vector(0, 0));
            }

            self.physics.setMaterial(dirt);

            moveTo(-1 * self.player.width(), 1080 - self.getHeightAt(-1 * self.player.width()));
            for (var x = -1 * self.player.width(); x <= 1280 + self.player.width(); x++) {
                strokeTo(x, 1080 - self.getHeightAt(x));
            }
        }

        drawTriggers():void {
            var self = this;

            self.physics.addTrigger(new Physics.TriggerLineSegment(new Vector(0, -10000), new Vector(0, 10000), function() {
                if (self.player.speed.x < 0) {
                    self.setLevel(self.x - 1, 0);
                    self.player.position.x = 1280 + 0.5*self.player.width();
                }
            })); 

            self.physics.addTrigger(new Physics.TriggerLineSegment(new Vector(1280, -10000), new Vector(1280, 10000), function() {
                if (self.player.speed.x > 0) {
                    self.setLevel(self.x + 1, 0);
                    self.player.position.x = -.5 * self.player.width();
                }
            }));
        }

        build():void {
            this.physics.clearAll();
            this.drawLevel();
            this.drawTriggers();
            this.physics.addDynamic(this.player);
            this.physics.setAcceleration(function(x,y){
                return new Vector(0, .02);
            });
        }

        step(): void{
            var ddx = 0,
                ddy = 0;
            if(this.keyHandler.isDown('A')){
                ddx -= 0.03;
            }
            if(this.keyHandler.isDown('D')){
                ddx += 0.03;
            }
            if (this.keyHandler.isDown('S')) {
                ddy += 0.03;
            }
            if (this.keyHandler.isDown('W')) {
                ddy -= 0.01;
            }
            this.player.setAcceleration(function(x, y) {
                return new Vector(ddx, ddy);
            });
            
        }
    }
}