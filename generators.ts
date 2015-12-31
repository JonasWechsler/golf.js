module WorldGenerators {
	export interface LinearGenerator {
		getHeightAt: (x: number) => number;
	}
    export class PerlinPerlinGenerator implements LinearGenerator {
        private maximum_resolution: number = 6;
        private minimum_resolution: number = 1;
        private low_wavelength: number = 1000;
        private high_wavelength: number = 1500;
        private interpolate: WorldGenerators.PerlinGenerator;
        private persistance: WorldGenerators.PerlinGenerator;
        private wavelength: WorldGenerators.PerlinGenerator;
        private perlin: WorldGenerators.PerlinGenerator;

        private DEFAULT_SEED: number = 1;
        private seed: number = this.DEFAULT_SEED;
        private initial_seed: number = this.seed;

        constructor(private height: number){
            this.interpolate = new WorldGenerators.PerlinGenerator(1);
            this.persistance = new WorldGenerators.PerlinGenerator(.2);
            this.wavelength = new WorldGenerators.PerlinGenerator(1);
            this.perlin = new WorldGenerators.PerlinGenerator(height);
            
            this.interpolate.setMaxWavelength(4000);
            this.interpolate.setMaximumResolution(4);
            this.interpolate.setPersistance(.4);
            this.interpolate.setInterpolation(1);

            this.persistance.setMaxWavelength(4000);
            this.persistance.setMaximumResolution(4);
            this.persistance.setPersistance(.4);
            this.persistance.setInterpolation(1);

            this.wavelength.setMaxWavelength(4000);
            this.wavelength.setMaximumResolution(4);
            this.wavelength.setPersistance(.4);
            this.wavelength.setInterpolation(1);

            this.interpolate.setSeed(new Date().getHours());
            this.persistance.setSeed(new Date().getSeconds());
            this.wavelength.setSeed(new Date().getMinutes());
        }

        public getHeightAt(x: number): number {
            var persistance = .3 + Math.abs(this.persistance.getHeightAt(x));
            var interpolate = Math.abs(this.interpolate.getHeightAt(x));
            var low_wavelength_value = this.perlin.generate_perlin_with_parameters(x,
                this.minimum_resolution,
                this.maximum_resolution,
                this.low_wavelength,
                persistance,
                interpolate,
                this.height);
            var high_wavelength_value = this.perlin.generate_perlin_with_parameters(x,
                this.minimum_resolution,
                this.maximum_resolution,
                this.high_wavelength,
                persistance,
                interpolate,
                this.height);
            var wavelength_coef = Math.abs(this.wavelength.getHeightAt(x));
            return low_wavelength_value * (1 - wavelength_coef) + high_wavelength_value * wavelength_coef;
        }
    }
    export class PerlinGenerator implements LinearGenerator {
        private heights: { [key: number]: number };
        private x: number;
        private max_x: number;
        private min_x: number;
        private left_perlin_subgraph: any[];
        private right_perlin_subgraph: any[];

        private maximum_resolution: number = 6;
        private minimum_resolution: number = 1;
        private perlin_smoothness: number = .99;
        private persistance: number = .45;
        private interpolate: number = 1;
        private max_wavelength: number = 1000;

        private DEFAULT_SEED: number = 1;
        private seed: number = this.DEFAULT_SEED;
        private initial_seed: number = this.seed;

        constructor(private height: number) {
            this.init(height);
        }

        public init(height: number): void {
            this.heights = {};

            this.x = 0;
            this.max_x = 1;
            this.min_x = -1;

            this.left_perlin_subgraph = [];
            this.right_perlin_subgraph = [];

            var y = 0;
            for (var idx = this.minimum_resolution; idx < this.maximum_resolution; idx++) {
                var frequency = Math.pow(2, idx),
                    wavelength = Math.floor(this.max_wavelength / frequency);

                if (wavelength == 0)
                    continue;

                var amplitude = Math.pow(this.persistance, idx);
                this.left_perlin_subgraph[idx] = {};
                this.left_perlin_subgraph[idx].value = amplitude / 2;
                this.left_perlin_subgraph[idx].wavelength = wavelength;
                this.right_perlin_subgraph[idx] = {};
                this.right_perlin_subgraph[idx].value = amplitude / 2;
                this.right_perlin_subgraph[idx].wavelength = wavelength;

                y += amplitude / 2;
            }
            this.heights[-1] = y;
            this.heights[0] = y;
            this.heights[1] = y;
        }

        public getSeed(): number {
            return this.seed;
        }

        public getInitialSeed(): number {
            return this.initial_seed;
        }

        public random(): number {
            var x = Math.sin(this.seed++) * 10000;
            return x - Math.floor(x);
        }

        public no_interpolate(a: number, b: number, x: number): number {
            return a;
        }

        public linear_interpolate(a: number, b: number, x: number): number {
            return a * (1 - x) + b * x;
        }

        public cosine_interpolate(a: number, b: number, x: number): number {
            var pi = x * Math.PI;
            var f = (1 - Math.cos(pi)) * .5;
            return a * (1 - f) + b * f;
        }

        public smooth(a: number, b: number, c: number): number {
            return ((a + c) / 2 * this.perlin_smoothness) + (b * (1 - this.perlin_smoothness));
        }

        public generate_perlin_with_parameters(x: number, 
            minimum_resolution: number,
            maximum_resolution: number, 
            max_wavelength: number, 
            persistance: number, 
            interpolate: number,
            height: number): number {
            if (x < this.min_x - 1) {
                this.generate_perlin_with_parameters(x + 1,
                 minimum_resolution,
                 maximum_resolution,
                 max_wavelength,
                 persistance,
                 interpolate,
                 height);
            }
            if (x > this.max_x + 1) {
                this.generate_perlin_with_parameters(x - 1,
                 minimum_resolution,
                 maximum_resolution,
                 max_wavelength,
                 persistance,
                 interpolate,
                 height);
            }
            var active_subgraphs = [];
            if (x < this.min_x) {
                this.min_x = x;
                active_subgraphs = this.left_perlin_subgraph;
            } else if (x > this.max_x) {
                this.max_x = x;
                active_subgraphs = this.right_perlin_subgraph;
            } else {
                return this.heights[x] * height;
            }

            for (var idx = this.minimum_resolution; idx < maximum_resolution; idx++) {
                var frequency = Math.pow(2, idx),
                    wavelength = Math.floor(max_wavelength / frequency);

                if (x % wavelength == 0) {
                    var amplitude = Math.pow(persistance, idx);
                    if (!active_subgraphs[idx]) active_subgraphs[idx] = {};
                    active_subgraphs[idx].last_value = active_subgraphs[idx].value;
                    active_subgraphs[idx].value = amplitude * this.random();
                    active_subgraphs[idx].wavelength = wavelength;
                }
            }

            var y = 0;
            var self = this;
            active_subgraphs.forEach(function(val) {
                if (val) {
                    var a = val.last_value;
                    var b = val.value;
                    var i = (x % val.wavelength) / val.wavelength;

                    if (x < 0) i *= -1;
                    if (!a) a = b;
                    y += self.cosine_interpolate(a, b, i) * interpolate + self.linear_interpolate(a, b, i) * (1 - interpolate);
                }
            });

            this.heights[x] = y;
            return this.heights[x] * height;
        }

        public generate_perlin_at(x: number): number {
            return this.generate_perlin_with_parameters(x,
             this.minimum_resolution,
             this.maximum_resolution,
             this.max_wavelength,
             this.persistance,
             this.interpolate,
             this.height);
        }

        public getHeightAt(x: number): number {
            return this.generate_perlin_at(x);
        }

        public setSeed(seed: number): void {
            if (seed < 0) {
                seed = Math.pow(2, 30) + seed;
            }
            this.seed = seed;
            this.initial_seed = seed;
            this.init(this.height);
        }

        public resetSeed(): void {
            this.seed = this.initial_seed;
        }

        public setMaximumResolution(val: number): void {
            this.maximum_resolution = val;
            this.resetSeed();
            this.init(this.height);
        }

        public setMinimumResolution(val: number): void {
            this.minimum_resolution = val;
            this.resetSeed();
            this.init(this.height);
        }

        public setPerlinSmoothness(val: number): void {
            this.perlin_smoothness = val;
            this.resetSeed();
            this.init(this.height);
        }

        public setPersistance(val: number): void {
            this.persistance = val;
            this.resetSeed();
            this.init(this.height);
        }

        public setInterpolation(val: number): void {
            this.interpolate = val;
            this.resetSeed();
            this.init(this.height);
        }

        public setMaxWavelength(val: number): void {
            this.max_wavelength = val;
            this.resetSeed();
            this.init(this.height);
        }

    }
}