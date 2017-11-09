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

class DungeonComponent implements Component{
    constructor(public width:number,
    public height:number,
    public left:number,
    public top:number,
    public cell_width:number,
    public cell_height:number,
    public start:Vector,
    public adjacent:VectorMap<Vector[]> = new VectorMap<Vector[]>(),
    public main_path:Vector[] = [],
    public distance_from_start:VectorMap<number> = new VectorMap<number>(),
    public rooms:VectorMap<number> = new VectorMap<number>()){}
    type:ComponentType = ComponentType.Dungeon;
}

class DungeonRenderSystem implements System{
    constructor(render:boolean=true){
        if(render)
        this.render_dungeons();
    }

  public generate(dungeon: DungeonComponent){
    dungeon.adjacent = new VectorMap<Vector[]>();
    dungeon.main_path = [];
    dungeon.distance_from_start = new VectorMap<number>();
    dungeon.rooms = new VectorMap<number>();

    for(let i = 0; i < dungeon.width; i++)
      for(let j = 0; j < dungeon.height; j++)
        dungeon.adjacent.map(new Vector(i, j), []);

    dungeon.distance_from_start.map(dungeon.start, 1);
    this.add_path(dungeon, dungeon.start, 100);
    this.merge_adjacent(dungeon, 7);
    this.find_rooms(dungeon);
    this.build(dungeon);
  }

  public on_border(dungeon: DungeonComponent, v:Vector){
    return v.x == 0 || v.x == dungeon.width-1 ||
        v.y == 0 || v.y == dungeon.height-1;
  }
    public in_bounds(dungeon: DungeonComponent, v:Vector){
    return v.x >= 0 && v.x < dungeon.width &&
      v.y >= 0 && v.y < dungeon.height;
  }
  
  public open(dungeon: DungeonComponent, v:Vector){
    if(!this.in_bounds(dungeon, v)) return false;
    return dungeon.adjacent.at(v).length == 0;
  }
  
  public adj(v:Vector){
    return [
      new Vector(v.x, v.y - 1),
      new Vector(v.x - 1, v.y),
      new Vector(v.x, v.y + 1),
      new Vector(v.x + 1, v.y)
    ];
  }
  
  public merge_adjacent(dungeon: DungeonComponent, dist:number){
    const self = this;
    
    for(let i = 0; i < dungeon.width; i++){
      for(let j = 0; j < dungeon.height; j++){
        const curr = new Vector(i, j);
        if(self.open(dungeon, curr)) continue;
        this.adj(curr).forEach(function(adj){
          if(self.open(dungeon, adj)) return;
          if(!self.in_bounds(dungeon, adj)) return;
          
          const dist_curr = dungeon.distance_from_start.at(curr);
          const dist_adj = dungeon.distance_from_start.at(adj);
          if(Math.abs(dist_curr - dist_adj) < dist){
            self.add_adjacent(dungeon, curr, adj);
          }
        });
      }
    }
  }
  
  public add_path(dungeon: DungeonComponent, start:Vector, length:number):Vector[]{
    const self = this;
    
    var path:Vector[] = [start];
    while(path.length < length){
      const curr = path[path.length-1];
      const last = path[path.length-2];

      if(!curr){
        throw "Nowhere to go ";
      }
      
      if(last){
        this.add_adjacent(dungeon, curr, last);
        dungeon.distance_from_start.map(curr, path.length
                                     + dungeon.distance_from_start.at(start));
      }
      
      const next = [];
      self.adj(curr).forEach(function(adj){
        if(self.open(dungeon, adj) && !self.on_border(dungeon, adj))
            next.push(adj);
      });
      if(next.length == 0) path.pop();
      else path.push(next[Math.floor(Math.random()*next.length)]);
    }
    return path;
  }
  
  public add_adjacent(dungeon: DungeonComponent, next:Vector, parent:Vector){
      dungeon.adjacent.at(next).push(parent);
      dungeon.adjacent.at(parent).push(next);
  }
  
  public find_rooms(dungeon: DungeonComponent) {
      let room = 1;
      dungeon.rooms = new VectorMap<number>();
      let Q = [dungeon.start];
      while(Q.length != 0){
        const q = Q.shift();
        if(dungeon.rooms.has(q)) continue;
        dungeon.rooms.map(q, room);

        let l = false,
            r = false,
            t = false,
            b = false;
        dungeon.adjacent.at(q).forEach(function(adj){
            if (adj.x == q.x - 1 && adj.y == q.y) l = true;
            if (adj.x == q.x + 1 && adj.y == q.y) r = true;
            if (adj.x == q.x && adj.y == q.y - 1) t = true;
            if (adj.x == q.x && adj.y == q.y + 1) b = true;
          Q.push(adj);
        });

        if((l && r && !t && !b) || (!l && !r && t && b)) room++;
      }
  }

  public openings(dungeon: DungeonComponent, i:number, j:number):boolean[]{
        if(!this.in_bounds(dungeon, new Vector(i, j))){
            return [true, true, true, true];
        }
        const v = new Vector(i, j);
        const open = [false, false, false, false];
        const NORTH = 0, WEST = 1, SOUTH = 2, EAST = 3;

        if(this.open(dungeon, v)){
            this.adj(v).forEach((adj, idx) => {
                open[idx] = this.open(dungeon, adj) || !this.in_bounds(dungeon, adj)
            });
        }else{
             dungeon.adjacent.at(v).forEach(function(adj){
                if (adj.x == i - 1 && adj.y == j) open[WEST] = true;
                if (adj.x == i + 1 && adj.y == j) open[EAST] = true;
                if (adj.x == i && adj.y == j - 1) open[NORTH] = true;
                if (adj.x == i && adj.y == j + 1) open[SOUTH] = true;
            });
        }
        return open;
  }
  
  public build(dungeon: DungeonComponent){
    for(let i = 0; i < dungeon.width; i++){
      for(let j = 0; j < dungeon.height; j++){
        const v = new Vector(i, j);
        const open = this.openings(dungeon, i, j);
        const TOP = 0, LEFT = 1, BOTTOM = 2, RIGHT = 3;

        const square_x = dungeon.left + i*dungeon.cell_width;
        const square_y = dungeon.top + j*dungeon.cell_height;

        const square_upper_left = new Vector(square_x, square_y);
        const square_lower_left = new Vector(square_x, square_y + dungeon.cell_height);
        const square_upper_right = new Vector(square_x + dungeon.cell_width, square_y);
        const square_lower_right = new Vector(square_x + dungeon.cell_width, square_y + dungeon.cell_height);

        const square_corners = [];

        square_corners[TOP] = square_upper_right;
        square_corners[LEFT] = square_upper_left;
        square_corners[BOTTOM] = square_lower_left;
        square_corners[RIGHT] = square_lower_right;

        const room_corners = [];

        for(let idx = 0; idx < 4; idx++){
            room_corners[idx] = square_corners[idx].times(7/8).plus(square_corners[(idx+2)%4].times(1/8));
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
                new StaticPhysicsComponent(left_wall, room_corners[(idx+1)%4])
            ];
        }

        const add_line = function(s:StaticPhysicsComponent){
            const line = new ECSEntity();
            const view = new StaticRenderComponent(0, 0, document.createElement("canvas"));
            line.add_component(s);
            line.add_component(view);
            EntityManager.current.add_entity(line);
        }

        for(let idx = 0; idx < 4; idx++){
            if(open[idx]){
                const adj = this.adj(v)[idx];
                const bdj = this.adj(v)[(idx+5)%4];
                const cdj = this.adj(v)[(idx+3)%4];
                if(!(this.openings(dungeon, adj.x, adj.y)[(idx+3)%4] && open[(idx+3)%4] && this.openings(dungeon, cdj.x, cdj.y)[idx]))
                    add_line(openings[idx][0]);
                if(!(this.openings(dungeon, adj.x, adj.y)[(idx+5)%4] && open[(idx+5)%4] && this.openings(dungeon, bdj.x, bdj.y)[idx]))
                    add_line(openings[idx][1]);
            }else{
                add_line(walls[idx]);
            }
        }
      }
    }
  }


    render_dungeons(){
        const dungeons = EntityManager.current.get_entities([ComponentType.StaticRender, ComponentType.Dungeon]);
        dungeons.forEach((d) => {
            const dungeon = d.get_component<DungeonComponent>(ComponentType.Dungeon);
            const target = d.get_component<StaticRenderComponent>(ComponentType.StaticRender);
            this.render_dungeon(dungeon, target);
        });
    }

    render_room(dungeon:DungeonComponent, room_id:number){
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = dungeon.cell_width;
        canvas.height = dungeon.cell_height;
        disableImageSmoothing(ctx);
        const texture_entities = EntityManager.current.get_entities([ComponentType.FloorTexture]);
        const entity = texture_entities[room_id%texture_entities.length];
        return entity.get_component<FloorTextureComponent>(ComponentType.FloorTexture).texture;
    }

    private adjacent(v:Vector){
        return [
          new Vector(v.x, v.y - 1),
          new Vector(v.x - 1, v.y),
          new Vector(v.x, v.y + 1),
          new Vector(v.x + 1, v.y)
        ];
    }

    public render_walls(dungeon: DungeonComponent, i:number, j:number){
        const v = new Vector(i, j);
        const open = this.openings(dungeon, i, j);
        const TOP = 0, LEFT = 1, BOTTOM = 2, RIGHT = 3;

        const square_x = 0;//dungeon.left + i*dungeon.cell_width;
        const square_y = 0;//dungeon.top + j*dungeon.cell_height;

        const square_upper_left = new Vector(square_x, square_y);
        const square_lower_left = new Vector(square_x, square_y + dungeon.cell_height);
        const square_upper_right = new Vector(square_x + dungeon.cell_width, square_y);
        const square_lower_right = new Vector(square_x + dungeon.cell_width, square_y + dungeon.cell_height);

        const square_corners = [];

        square_corners[TOP] = square_upper_right;
        square_corners[LEFT] = square_upper_left;
        square_corners[BOTTOM] = square_lower_left;
        square_corners[RIGHT] = square_lower_right;

        const room_corners = [];

        for(let idx = 0; idx < 4; idx++){
            room_corners[idx] = square_corners[idx].times(7/8).plus(square_corners[(idx+2)%4].times(1/8));
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
                new LineSegment(room_corners[idx], right_wall),
                new LineSegment(left_wall, room_corners[(idx+1)%4])
            ];
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = dungeon.cell_width;
        canvas.height = dungeon.cell_height;

        const add_wall = function(v:[Vector, Vector, Vector, Vector]){
            context.beginPath();
            context.moveTo(v[0].x, v[0].y);
            [1,2,3,0].forEach((i) => context.lineTo(v[i].x, v[i].y));
            context.fillStyle = "black";
            context.fill();
        }

        for(let idx = 0; idx < 4; idx++){
            if(open[idx]){
                const adj = this.adj(v)[idx];
                const bdj = this.adj(v)[(idx+5)%4];
                const cdj = this.adj(v)[(idx+3)%4];
                if(!(this.openings(dungeon, adj.x, adj.y)[(idx+3)%4] && open[(idx+3)%4] && this.openings(dungeon, cdj.x, cdj.y)[idx])){
                    add_wall([openings[idx][0].v0, openings[idx][0].v1, square_corners[idx], square_corners[idx]]);
                }
                if(!(this.openings(dungeon, adj.x, adj.y)[(idx+5)%4] && open[(idx+5)%4] && this.openings(dungeon, bdj.x, bdj.y)[idx])){
                    add_wall([openings[idx][1].v0, openings[idx][1].v1, square_corners[(idx+1)%4], square_corners[(idx+1)%4]]);
                }
            }else{
                add_wall([square_corners[idx], room_corners[idx], room_corners[(idx+1)%4], square_corners[(idx+1)%4]]);
            }
        }

        return canvas;
    }

    render_dungeon(dungeon:DungeonComponent, target:StaticRenderComponent){
        const ctx = target.content.getContext("2d");
        disableImageSmoothing(ctx);

        target.x = dungeon.left;
        target.y = dungeon.top;

        const room_textures = {};

        for(let x = 0; x < dungeon.width; x++){
            for(let y = 0; y < dungeon.height; y++){
                const square_left = x*dungeon.cell_width;
                const square_top = y*dungeon.cell_height;
                const room_label = dungeon.rooms.at(new Vector(x, y));
                if(room_label){
                if(!room_textures[room_label])
                    room_textures[room_label] = this.render_room(dungeon, room_label);
                ctx.drawImage(room_textures[room_label], square_left, square_top, dungeon.cell_width, dungeon.cell_height);
                    ctx.drawImage(this.render_walls(dungeon, x, y), square_left, square_top);
                }else{
                    ctx.drawImage(this.render_walls(dungeon, x, y), square_left, square_top);
                }
            }
        }
    }

    step(e:EntityManager){}
}

class DungeonGenerator{
  public static CELL_WIDTH = 10;
  public static CELL_HEIGHT = 10;
  public static WIDTH = 20;
  public static HEIGHT = 20;
  public static LEFT_POS = 10;
  public static TOP_POS = 10;
  public static START_POS:Vector = new Vector(10, 10);
  
  public static generate(){
    const render_component = new StaticRenderComponent(0, 0, document.createElement("canvas"));
    const dungeon_component = new DungeonComponent(0, 0, 0, 0, 0, 0, undefined);
    const entity = new ECSEntity();
    entity.add_component(dungeon_component);
    entity.add_component(render_component);
    EntityManager.current.add_entity(entity);

    dungeon_component.width = DungeonGenerator.WIDTH;
    dungeon_component.height = DungeonGenerator.HEIGHT;
    dungeon_component.left = DungeonGenerator.LEFT_POS;
    dungeon_component.top = DungeonGenerator.TOP_POS;
    dungeon_component.cell_width = DungeonGenerator.CELL_WIDTH;
    dungeon_component.cell_height = DungeonGenerator.CELL_HEIGHT;
    dungeon_component.start = DungeonGenerator.START_POS.clone();

    new DungeonRenderSystem(false).generate(dungeon_component);

    render_component.x = dungeon_component.left;
    render_component.y = dungeon_component.top;
    render_component.content.width = dungeon_component.cell_width * dungeon_component.width;
    render_component.content.height = dungeon_component.cell_height * dungeon_component.height;
  }
}


