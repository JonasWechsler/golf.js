class Grid<T>{
    private grid:T[][];
    constructor(private _WIDTH:number,
                private _HEIGHT:number,
               private _DEFAULT:T = undefined){
            this.grid = [];
            for(let i=0;i<this._WIDTH;i++){
                this.grid[i] = [];
                if(this._DEFAULT == undefined)
                    continue;
                for(let j=0;j<this._HEIGHT;j++){
                    this.grid[i][j]=this._DEFAULT;
                }
            }
        }

    get(x:number, y:number):T{
        return this.grid[x][y];
    }
    set(x:number, y:number, c:T):void{
        this.grid[x][y] = c;
    }
    get WIDTH(){
        return this._WIDTH;
    }
    get HEIGHT(){
        return this._HEIGHT;
    }
    get DEFAULT_VALUE(){
        return this._DEFAULT;
    }
}
class CellPositionComponent implements Component{
    type:ComponentType = ComponentType.CellPosition;
    constructor(x:number, y:number){}
}

/*We want all entities in the grid to haev a CellPositionComponent*/
class EntityGridComponent implements Component{
    type:ComponentType = ComponentType.EntityGrid;
    constructor(public grid:Grid<ECSEntity>){}
}

class GridCellComponent implements Component{
    type:ComponentType = ComponentType.GridCell;
    constructor(public id:number,
                public blocked:boolean = false,
                public spawn:ECSEntity = undefined,
                public name:String = "cell"){}
}

class TileGridComponent implements Component{
    type:ComponentType = ComponentType.TileGrid;
    constructor(public tile_grid:TileGrid){}
}

class IDCellMapComponent implements Component{
    type:ComponentType = ComponentType.IDCellMap;
    constructor(public map: { [key:number]:() => GridCellComponent; }){}
}

class GridGeneratorSystem implements System{
     constructor(){}

     /*Gets TileGrid and IDCellMap and inserts into a EntityGrid*/
     static generate_from_tile_grid(){
        const tile_grid_entities = EntityManager.current.get_entities([ComponentType.TileGrid]);
        console.assert(tile_grid_entities.length == 1);
        const tile_grid_entity = tile_grid_entities[0];
        const tile_grid = tile_grid_entity.get_component<TileGridComponent>(ComponentType.TileGrid).tile_grid;

        GridGeneratorSystem.make_grid(tile_grid.id_width, tile_grid.id_height);
        const grid = GridGeneratorSystem.get_grid();

        const map_entities = EntityManager.current.get_entities([ComponentType.IDCellMap]);
        console.assert(map_entities.length == 1);
        const map_entity = map_entities[0];
        const map = map_entity.get_component<IDCellMapComponent>(ComponentType.IDCellMap).map;
        for(let x=0;x<tile_grid.id_width;x++){
            for(let y=0;y<tile_grid.id_height;y++){
                const id = tile_grid.get_id(x, y);
                const size = Object.keys(map).length;
                const cell:GridCellComponent = map[id%size]();
                const cell_entity = new ECSEntity();
                cell_entity.add_component(cell);
                grid.grid.set(x,y,cell_entity);
            }
        }
     }

     static get_grid():EntityGridComponent{
        const grid_entities = EntityManager.current.get_entities([ComponentType.EntityGrid]);
        console.assert(grid_entities.length == 1);
        const grid_entity = grid_entities[0];
        const grid = grid_entity.get_component<EntityGridComponent>(ComponentType.EntityGrid);
        return grid;
     }

      static create_room(room:Square){
         const grid = GridGeneratorSystem.get_grid();

        for(let i=room.left;i<room.left+room.width;i++){
            for(let j=room.top;j<room.top+room.height;j++){
                const cell = grid.grid.get(i, j);
                const grid_cell = cell.get_component<GridCellComponent>(ComponentType.GridCell);
                grid_cell.id =  1;
                grid_cell.blocked = false;
            }
        }
    }
    
      static place_entity(x:number, y:number, entity:ECSEntity){
        const grid = GridGeneratorSystem.get_grid();
        const cell = grid.grid.get(x, y);
        const grid_cell = cell.get_component<GridCellComponent>(ComponentType.GridCell);
        if(grid_cell.blocked){
            return;
        }
        grid_cell.spawn = entity;
    }

      static place_player(x:number, y:number){
        const grid = GridGeneratorSystem.get_grid();
        const player = new ECSEntity();
        player.add_component(new DynamicPhysicsComponent(new Vector(60, 60), 3));
        player.add_component(new KeyInputComponent());
        const player_canvas = document.createElement("canvas");
        player_canvas.width = player_canvas.height = 6;
        player.add_component(new DynamicRenderComponent(0, 0, player_canvas));

        GridGeneratorSystem.place_entity(x, y, player);
    }

     static make_grid(width:number, height:number){
        const result = new Grid<ECSEntity>(width, height);
        for(let i=0;i<width;i++){
            for(let j=0;j<height;j++){
                const cell = new ECSEntity();
                cell.add_component(new CellPositionComponent(i, j));
                cell.add_component(new GridCellComponent(0, true));
                result.set(i, j, cell);
            }
        }
        const entity = new ECSEntity();
        entity.add_component(new EntityGridComponent(result));
        EntityManager.current.add_entity(entity);
    }

    step(){}
}

class GridParserSystem implements System{
    private static cell_texture(id:number){
        const texture_entities = EntityManager.current.get_entities([ComponentType.FloorTexture]);
        const entity = texture_entities[id%texture_entities.length];
        return entity.get_component<FloorTextureComponent>(ComponentType.FloorTexture).texture;
    }
    
    private static render_cell(position:Vector, id:number){
        const view = document.createElement("canvas");
        const ctx = view.getContext("2d");
        const texture = GridParserSystem.cell_texture(id);
        view.width = texture.width;
        view.height = texture.height;
        ctx.drawImage(texture, 0, 0);

        const render = new StaticRenderComponent(position.x, position.y, view, -1);
        const render_entity = new ECSEntity();
        render_entity.add_component(render);
        EntityManager.current.add_entity(render_entity);
    }

    private static parse_grid(grid_component:EntityGridComponent){
        const settings_entities:ECSEntity[] = EntityManager.current.get_entities([ComponentType.Settings]);
        console.assert(settings_entities.length == 1);
        const settings_entity = settings_entities[0];
        const settings:SettingsComponent = settings_entity.get_component<SettingsComponent>(ComponentType.Settings);
        const cell_width = settings.cell_width;
        const cell_height = settings.cell_height;

        const grid:Grid<ECSEntity> = grid_component.grid;

        const get_cell = (v:Vector) => grid.get(v.x,v.y).get_component<GridCellComponent>(ComponentType.GridCell);
        const in_bounds = (v:Vector) => v.x >= 0 && v.y >= 0 && v.x < grid.WIDTH && v.y < grid.HEIGHT;
        for(let x=0;x<grid.WIDTH;x++){
            for(let y=0;y<grid.HEIGHT;y++){
                const cell = get_cell(new Vector(x, y));
                const position = new Vector(x*cell_width, y*cell_height);
                const center = position.plus(new Vector(cell_width/2, cell_height/2));

                if(cell.blocked){
                    const adj = [new Vector(x-1, y),
                                new Vector(x, y-1),
                                 new Vector(x+1, y),
                                new Vector(x, y+1)];
                    const corners = [position.clone(),
                        position.plus(new Vector(cell_width, 0)),
                        position.plus(new Vector(cell_width, cell_height)),
                        position.plus(new Vector(0, cell_height))];
                    for(let i=0;i<4;i++){
                        if(in_bounds(adj[i]) && get_cell(adj[i]).blocked)
                            continue;
                        const wall_entity = new ECSEntity();
                        wall_entity.add_component(new StaticPhysicsComponent(corners[(i+3)%4], corners[i]));
                        const render = new StaticRenderComponent(0, 0, document.createElement("canvas"), -1);
                        wall_entity.add_component(render);
                        EntityManager.current.add_entity(wall_entity);
                    }
                }

                if(cell.spawn != undefined){
                    const entity = cell.spawn;
                    console.assert(entity.has_component(ComponentType.DynamicPhysics));
                    const physics = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
                    physics.position = center;
                    EntityManager.current.add_entity(entity);
                }

                GridParserSystem.render_cell(position, cell.id);
            }
        }
    }
    static parse_grids(){
        const entities:ECSEntity[] = EntityManager.current.get_entities([ComponentType.EntityGrid]);
        console.assert(entities.length == 1);
        entities.forEach((entity) => {
            const grid:EntityGridComponent = entity.get_component<EntityGridComponent>(ComponentType.EntityGrid);
            GridParserSystem.parse_grid(grid);
        });
    }
    step(){}
}
