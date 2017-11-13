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
        const render_component = new StaticRenderComponent(0, 0, document.createElement("canvas"));
        const dungeon_component = new DungeonComponent(0, 0, 0, 0, 0, 0, undefined, undefined, undefined, undefined, undefined);
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

        new DungeonRenderSystem(false).generate(dungeon_component);

        render_component.x = dungeon_component.left;
        render_component.y = dungeon_component.top;
        render_component.content.width = dungeon_component.cell_width * dungeon_component.width;
        render_component.content.height = dungeon_component.cell_height * dungeon_component.height;
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
            return [true, true, true, true];
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


