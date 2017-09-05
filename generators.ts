module WorldGenerators {
	export interface LinearGenerator {
		getHeightAt: (x: number) => number;
	}
    export interface BlockGenerator {
        getSurfaces: (minimum: number, maximum:number) => Array<Vector>;
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

        public randomize(): void {
            this.setInterpolation(Math.random());
            this.setMaxWavelength(Math.random() * 1000 + 500);
            this.setPersistance(Math.random() / 2);
        }
    }
}

class DungeonGenerator{
  private adjacent:VectorMap<Vector[]> = new VectorMap<Vector[]>();
  private main_path:Vector[] = [];
  private distance_from_start:VectorMap<number> = new VectorMap<number>();
  private rooms:VectorMap<number> = new VectorMap<number>();
  
  public static CELL_WIDTH = 10;
  public static CELL_HEIGHT = 10;
  public static WIDTH = 20;
  public static HEIGHT = 20;
  public static LEFT_POS = 10;
  public static TOP_POS = 10;
  public static START_POS:Vector = new Vector(10, 10);
  
  private CELL_W;
  private CELL_H;
  private WIDTH;
  private HEIGHT;
  private LEFT;
  private TOP;
  private START:Vector;
  
  public static generate(){
    new DungeonGenerator();
  }

  private constructor(){
    this.CELL_W = DungeonGenerator.CELL_WIDTH;
    this.CELL_H = DungeonGenerator.CELL_HEIGHT;
    this.WIDTH = DungeonGenerator.WIDTH;
    this.HEIGHT = DungeonGenerator.HEIGHT;
    this.LEFT = DungeonGenerator.LEFT_POS;
    this.TOP = DungeonGenerator.TOP_POS;
    this.START = DungeonGenerator.START_POS.clone();
    
    for(let i = 0; i < this.WIDTH; i++)
      for(let j = 0; j < this.HEIGHT; j++)
        this.adjacent.map(new Vector(i, j), []);
    
    this.distance_from_start.map(this.START, 1);
    this.add_path(this.START, 100);
    this.merge_adjacent(7);
    this.find_rooms();
    this.build();
  }
  
  private on_border(v:Vector){
    return v.x == 0 || v.x == this.WIDTH-1 ||
        v.y == 0 || v.y == this.HEIGHT-1;
  }
    private in_bounds(v:Vector){
    return v.x >= 0 && v.x < this.WIDTH &&
      v.y >= 0 && v.y < this.HEIGHT;
  }
  
  private open(v:Vector){
    if(!this.in_bounds(v)) return false;
    return this.adjacent.at(v).length == 0;
  }
  
  private adj(v:Vector){
    return [
      new Vector(v.x, v.y - 1),
      new Vector(v.x - 1, v.y),
      new Vector(v.x, v.y + 1),
      new Vector(v.x + 1, v.y)
    ];
  }
  
  private merge_adjacent(dist:number){
    const self = this;
    
    for(let i = 0; i < self.WIDTH; i++){
      for(let j = 0; j < self.HEIGHT; j++){
        const curr = new Vector(i, j);
        if(self.open(curr)) continue;
        this.adj(curr).forEach(function(adj){
          if(self.open(adj)) return;
          if(!self.in_bounds(adj)) return;
          
          const dist_curr = self.distance_from_start.at(curr);
          const dist_adj = self.distance_from_start.at(adj);
          if(Math.abs(dist_curr - dist_adj) < dist){
            self.add_adjacent(curr, adj);
          }
        });
      }
    }
  }
  
  private add_path(start:Vector, length:number):Vector[]{
    const self = this;
    
    var path:Vector[] = [start];
    while(path.length < length){
      const curr = path[path.length-1];
      const last = path[path.length-2];

      if(!curr){
        throw "Nowhere to go ";
      }
      
      if(last){
        this.add_adjacent(curr, last);
        self.distance_from_start.map(curr, path.length
                                     + self.distance_from_start.at(start));
      }
      
      const next = [];
      self.adj(curr).forEach(function(adj){
        if(self.open(adj) && !self.on_border(adj)) next.push(adj);
      });
      if(next.length == 0) path.pop();
      else path.push(next[Math.floor(Math.random()*next.length)]);
    }
    return path;
  }
  
  private add_adjacent(next:Vector, parent:Vector){
      this.adjacent.at(next).push(parent);
      this.adjacent.at(parent).push(next);
  }
  
  public find_rooms() {
      let room = 1;
      this.rooms = new VectorMap<number>();
      let Q = [this.START];
      while(Q.length != 0){
        const q = Q.shift();
        if(this.rooms.has(q)) continue;
        this.rooms.map(q, room);

        let l = false,
            r = false,
            t = false,
            b = false;
        this.adjacent.at(q).forEach(function(adj){
            if (adj.x == q.x - 1 && adj.y == q.y) l = true;
            if (adj.x == q.x + 1 && adj.y == q.y) r = true;
            if (adj.x == q.x && adj.y == q.y - 1) t = true;
            if (adj.x == q.x && adj.y == q.y + 1) b = true;
          Q.push(adj);
        });

        if((l && r && !t && !b) || (!l && !r && t && b)) room++;
      }
  }

  private openings(i:number, j:number):boolean[]{
        if(!this.in_bounds(new Vector(i, j))){
            return [false, false, false, false];
        }
        const v = new Vector(i, j);
        const open = [false, false, false, false];
        const NORTH = 0, WEST = 1, SOUTH = 2, EAST = 3;

        if(this.open(v)){
            this.adj(v).forEach((adj, idx) => {
                open[idx] = this.open(adj) || !this.in_bounds(adj)
            });
        }else{
             this.adjacent.at(v).forEach(function(adj){
                if (adj.x == i - 1 && adj.y == j) open[WEST] = true;
                if (adj.x == i + 1 && adj.y == j) open[EAST] = true;
                if (adj.x == i && adj.y == j - 1) open[NORTH] = true;
                if (adj.x == i && adj.y == j + 1) open[SOUTH] = true;
            });
        }
        return open;
  }
  
  public build(){
    for(let i = 0; i < this.WIDTH; i++){
      for(let j = 0; j < this.HEIGHT; j++){
        const v = new Vector(i, j);
        const open = this.openings(i, j);
        const TOP = 0, LEFT = 1, BOTTOM = 2, RIGHT = 3;

        const square_upper_left = new Vector(this.LEFT + i*this.CELL_W, this.TOP + j*this.CELL_H);
        const square_lower_left = new Vector(this.LEFT + i*this.CELL_W, this.TOP + (j+1)*this.CELL_H);
        const square_upper_right = new Vector(this.LEFT + (i+1)*this.CELL_W, this.TOP + j*this.CELL_H);
        const square_lower_right = new Vector(this.LEFT + (i+1)*this.CELL_W, this.TOP + (j+1)*this.CELL_H);

        const square_corners = [];

        square_corners[TOP] = square_upper_right;
        square_corners[LEFT] = square_upper_left;
        square_corners[BOTTOM] = square_lower_left;
        square_corners[RIGHT] = square_lower_right;

        const room_corners = [];

        for(let idx = 0; idx < 4; idx++){
            room_corners[idx] = square_corners[idx].times(.9).plus(square_corners[(idx+2)%4].times(.1));
        }

        const walls = [];

        for(let idx = 0; idx < 4; idx++){
            walls[idx] = new StaticPhysicsComponent(room_corners[idx], room_corners[(idx+1)%4]);
        }

        const openings = [];

        for(let idx = 0; idx < 4; idx++){
            let right_wall, left_wall;
            if(idx % 2 == 0){
                right_wall = new Vector(room_corners[idx].x, square_corners[idx].y);
                left_wall = new Vector(room_corners[(idx+1)%4].x, square_corners[(idx+1)%4].y);
            }else{
                right_wall = new Vector(square_corners[idx].x, room_corners[idx].y);
                left_wall = new Vector(square_corners[(idx+1)%4].x, room_corners[(idx+1)%4].y);
            }

            openings[idx] = [
                new StaticPhysicsComponent(room_corners[idx], right_wall),
                new StaticPhysicsComponent(room_corners[(idx+1)%4], left_wall)
            ];
        }

        const add_line = function(s:StaticPhysicsComponent){
            const line = new ECSEntity();
            const view = new RenderComponent(0, 0, document.createElement("canvas"));
            const bb = s.bounding_box();
            view.x = bb.left;
            view.y = bb.top;
            view.content.width = Math.max(bb.width, 5);
            view.content.height = Math.max(bb.height, 5);

            line.add_component(s);
            line.add_component(view);
            EntityManager.current.add_entity(line);
        }

        for(let idx = 0; idx < 4; idx++){
            if(open[idx]){
                const adj = this.adj(v)[idx];
                const bdj = this.adj(v)[(idx+5)%4];
                const cdj = this.adj(v)[(idx+3)%4];
                if(!(this.openings(adj.x, adj.y)[(idx+3)%4] && open[(idx+3)%4] && this.openings(cdj.x, cdj.y)[idx]))
                    add_line(openings[idx][0]);
                if(!(this.openings(adj.x, adj.y)[(idx+5)%4] && open[(idx+5)%4] && this.openings(bdj.x, bdj.y)[idx]))
                    add_line(openings[idx][1]);
            }else{
                add_line(walls[idx]);
            }
        }
      }
    }
  }
}
