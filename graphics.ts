module Graphics {
    export class GraphicsRenderer {
        constructor(private world:WorldBuilder.World){}

        drawAll(ctx: CanvasRenderingContext2D){
            this.world.getSurfaces().forEach((val) => {
                val.draw(ctx);
            });
            this.world.getObjects().forEach((val) => {
                val.draw(ctx);
            });
        }
    }
    export interface Object{
        generate:(x:number, y:number, ctx:CanvasRenderingContext2D) => void;
        draw:(ctx: CanvasRenderingContext2D) => void;
    }
    export class Plant {
        private iterations: number;
        private diam: number;
        private len: number;
        private diam_coef: number;
        private len_coef: number;
        private branches: number;
        private twig_chance: number;
        private max_angle: number;

        constructor() {
            this.iterations = 5;
            this.diam = Math.random() * 1 + 1;
            this.len = (Math.random() * (screen.height / (this.iterations + 1)) + screen.height / (this.iterations + 1)) / 2;
            this.diam_coef = Math.random() * .5 + .5;
            this.len_coef = Math.random() * .7 + .3;
            this.branches = Math.random() * 2 + 3;
            this.twig_chance = Math.random() * .5 + .5;
            this.max_angle = Math.random() * Math.PI / 2;
        }

        setIterations(p: number) {
            this.iterations = p;
            return this;
        }
        setDiameter(p: number) {
            this.diam = p;
            return this;
        }
        setLength(p: number) {
            this.len = p;
            return this;
        }
        setDiameterCoefficient(p: number) {
            this.diam_coef = p;
            return this;
        }
        setLengthCoefficient(p: number) {
            this.len_coef = p;
            return this;
        }
        setBranches(p: number) {
            this.branches = p;
            return this;
        }
        setTwigChance(p: number) {
            this.twig_chance = p;
            return this;
        }
        setMaxAngle(p: number) {
            this.max_angle = p;
            return this;
        }

        generate(x0: number, y0: number, ctx: any) {
            var bases_x = [x0],
                bases_y = [y0],
                angles = [3 * Math.PI / 2];

            var len_initial = this.len;
            var diam_initial = this.diam;

            for (var i = 0; i < this.iterations; i++) {
                ctx.lineWidth = diam_initial;

                var new_bases_x = [],
                    new_bases_y = [],
                    new_angles = [];

                for (var a = 0; a < bases_x.length; a++) {
                    for (var b = 0; b < this.branches; b++) {
                        if (Math.random() > this.twig_chance) {
                            continue;
                        }

                        var angle = (b / this.branches) * this.max_angle + Math.random() - .5,
                            angle_adjusted0 = angles[a] + angle + Math.random() - .5,
                            angle_adjusted1 = angles[a] - angle + Math.random() - .5;
                        ctx.beginPath();
                        ctx.moveTo(bases_x[a], bases_y[a]);
                        ctx.lineTo(bases_x[a] + Math.cos(angle_adjusted0) * len_initial, bases_y[a] + Math.sin(angle_adjusted0) * len_initial);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(bases_x[a], bases_y[a]);
                        ctx.lineTo(bases_x[a] + Math.cos(angle_adjusted1) * len_initial, bases_y[a] + Math.sin(angle_adjusted1) * len_initial);
                        ctx.stroke();
                        new_bases_x.push(bases_x[a] + Math.cos(angle_adjusted0) * len_initial);
                        new_bases_y.push(bases_y[a] + Math.sin(angle_adjusted0) * len_initial);
                        new_angles.push(angle_adjusted0);
                        new_bases_x.push(bases_x[a] + Math.cos(angle_adjusted1) * len_initial);
                        new_bases_y.push(bases_y[a] + Math.sin(angle_adjusted1) * len_initial);
                        new_angles.push(angle_adjusted1);
                    }
                }
                bases_x = new_bases_x;
                bases_y = new_bases_y;
                angles = new_angles;

                diam_initial *= this.diam_coef;
                len_initial *= this.len_coef;
            }


        }
    }


}