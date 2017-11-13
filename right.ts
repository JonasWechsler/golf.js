class DungeonRenderSystem implements System{
    constructor(render:boolean=true){
        if(render) this.render_dungeons();
    }

    public generate(dungeon:DungeonComponent){
        dungeon.rooms = new VectorMap<number>()
        dungeon.adjacent = new VectorMap<Vector[]>();
        dungeon.distance_from_start = new VectorMap<number>();
        dungeon.main_path = [];

        for(let i = 0; i < dungeon.width; i++)
        for(let j = 0; j < dungeon.height; j++)
        dungeon.adjacent.map(new Vector(i, j), []);

        dungeon.distance_from_start.map(dungeon.start, 1);
        this.add_path(dungeon, dungeon.start, 100);
        this.merge_adjacent(dungeon, 7);
        this.find_rooms(dungeon);
        this.build(dungeon);
    }

    public on_border(dungeon:DungeonComponent, v:Vector){
        return v.x == 0 || v.x == dungeon.width-1 ||
            v.y == 0 || v.y == dungeon.height-1;
    }
    public in_bounds(dungeon:DungeonComponent, v:Vector){
        return v.x >= 0 && v.x < dungeon.width &&
            v.y >= 0 && v.y < dungeon.height;
    }

    public open(dungeon:DungeonComponent, v:Vector){
        if(!this.in_bounds(dungeon, v)) return false;
        return dungeon.adjacent.at(v).length == 0;
    }

    public adjacent_vectors(v:Vector){
        return [
            new Vector(v.x, v.y - 1),
            new Vector(v.x - 1, v.y),
            new Vector(v.x, v.y + 1),
            new Vector(v.x + 1, v.y)
        ];
    }

    public merge_adjacent(dungeon:DungeonComponent, dist:number){
        const self = this;

        for(let i = 0; i < dungeon.width; i++){
            for(let j = 0; j < dungeon.height; j++){
                const curr = new Vector(i, j);
                if(self.open(dungeon, curr)) continue;
                this.adjacent_vectors(curr).forEach(function(adj){
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

    public add_path(dungeon:DungeonComponent, start:Vector, length:number):Vector[]{
        const self = this;

        const path:Vector[] = [start];
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
            self.adjacent_vectors(curr).forEach(function(adj:Vector){
                if(self.open(dungeon, adj) && !self.on_border(dungeon, adj))
                    next.push(adj);
            });
            if(next.length == 0) path.pop();
            else path.push(next[Math.floor(Math.random()*next.length)]);
        }
        return path;
    }

    public add_adjacent(dungeon:DungeonComponent, a:Vector, b:Vector){
        dungeon.adjacent.at(a).push(b);
        dungeon.adjacent.at(b).push(a);
    }

    public find_rooms(dungeon:DungeonComponent){
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

    public openings(dungeon:DungeonComponent, i:number, j:number):boolean[]{
        if(!this.in_bounds(dungeon, new Vector(i, j))){
            return [true, true, true, true];
        }
        const v = new Vector(i, j);
        const open = [false, false, false, false];
        const NORTH = 0, WEST = 1, SOUTH = 2, EAST = 3;

        if(this.open(dungeon, v)){
            this.adjacent_vectors(v).forEach((adj, idx) => {
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

    public build(dungeon:DungeonComponent){
        for(let i = 0; i < dungeon.width; i++){
            for(let j = 0; j < dungeon.height; j++){
                const v = new Vector(i, j);
                const TOP = 0, LEFT = 1, BOTTOM = 2, RIGHT = 3;

                const block_x = dungeon.left + i*dungeon.cell_width;
                const block_y = dungeon.left + j*dungeon.cell_height;

                const square_upper_left = new Vector(block_x, block_y);
                const square_lower_left = new Vector(block_x, block_y+dungeon.cell_height);
                const square_upper_right = new Vector(block_x + dungeon.cell_width, block_y);
                const square_lower_right = new Vector(block_x + dungeon.cell_width, block_y+dungeon.cell_height);

                const square_corners = [];

                square_corners[TOP] = square_upper_right;
                square_corners[LEFT] = square_upper_left;
                square_corners[BOTTOM] = square_lower_left;
                square_corners[RIGHT] = square_lower_right;

                const room_corners = [];

                for(let idx = 0; idx < 4; idx++){
                    room_corners[idx] = square_corners[idx].times(.875).plus(square_corners[(idx+2)%4].times(.125));
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
                        const adj = this.adjacent_vectors(v)[idx];
                        const bdj = this.adjacent_vectors(v)[(idx+5)%4];
                        const cdj = this.adjacent_vectors(v)[(idx+3)%4];
                        const ccw_open = this.openings(dungeon, adj.x, adj.y)[(idx+3)%4] && open[(idx+3)%4];
                        const cw_open = this.openings(dungeon, adj.x, adj.y)[(idx+5)%4] && open[(idx+5)%4];
                        if(!(ccw_open && this.openings(dungeon, cdj.x, cdj.y)[idx]))
                            add_line(openings[idx][0]);
                        if(!(cw_open && this.openings(dungeon, bdj.x, bdj.y)[idx]))
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

    render_walls(dungeon:DungeonComponent, x:number, y:number){

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
                if(!room_label) continue;
                if(!room_textures[room_label])
                    room_textures[room_label] = this.render_room(dungeon, room_label);
                ctx.drawImage(room_textures[room_label], square_left, square_top, dungeon.cell_width, dungeon.cell_height);
            }
        }
    }

    step(e:EntityManager){}
}
