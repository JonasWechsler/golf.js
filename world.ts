class Grid<T>{
    private grid:T[][];
    constructor(public WIDTH:number,
                public HEIGHT:number,
               public DEFAULT:T = undefined){
            this.grid = [];
            for(let i=0;i<this.WIDTH;i++){
                this.grid[i] = [];
                if(this.DEFAULT == undefined)
                    continue;
                for(let j=0;j<this.HEIGHT;j++){
                    this.grid[i][j]=this.DEFAULT;
                }
            }
        }

    get(x:number, y:number):T{
        return this.grid[x][y];
    }
    set(x:number, y:number, c:T):void{
        this.grid[x][y] = c;
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
    constructor(public blocked:boolean, public spawn:ECSEntity = undefined){}
}

class GridGenerator{
    private static create_room(grid:EntityGridComponent, room:Square){
        for(let i=room.left;i<room.left+room.width;i++){
            for(let j=room.top;j<room.top+room.height;j++){
                const cell = grid.grid.get(i, j);
                const grid_cell = cell.get_component<GridCellComponent>(ComponentType.GridCell);
                grid_cell.blocked = false;
            }
        }
    }
    
    private static place_entity(grid:EntityGridComponent, x:number, y:number, entity:ECSEntity){
        const cell = grid.grid.get(x, y);
        const grid_cell = cell.get_component<GridCellComponent>(ComponentType.GridCell);
        if(grid_cell.blocked){
            return;
        }
        grid_cell.spawn = entity;
    }

    private static place_player(grid:EntityGridComponent, x:number, y:number){
        const player = new ECSEntity();
        player.add_component(new DynamicPhysicsComponent(new Vector(60, 60), 3));
        player.add_component(new KeyInputComponent());
        const player_canvas = document.createElement("canvas");
        player_canvas.width = player_canvas.height = 6;
        player.add_component(new DynamicRenderComponent(0, 0, player_canvas));

        GridGenerator.place_entity(grid, x, y, player);
    }

    static generate(width:number, height:number):EntityGridComponent{
        const result = new Grid<ECSEntity>(width, height);
        for(let i=0;i<width;i++){
            for(let j=0;j<height;j++){
                const cell = new ECSEntity();
                cell.add_component(new CellPositionComponent(i, j));
                cell.add_component(new GridCellComponent(true));
                result.set(i, j, cell);
            }
        }

        return new EntityGridComponent(result);
    }
}

class GridRenderer{
    private static CELL_WIDTH = 8;
    private static add_wall
    private static add_walls(grid:EntityGridComponent){
        for(let i=0;i<grid.grid.WIDTH;i++){
            for(let j=0;j<grid.grid.HEIGHT;j++){
                
            }
        }
    }
    static generate(grid:EntityGridComponent){
        
    }
}
