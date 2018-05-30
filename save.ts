/*Prevents a component from being saved*/
//class SaveOmitComponent implements Component{
//    type:ComponentType = ComponentType.SaveOmit;
//}
//class WorldStateComponent implements Component{
//    type:ComponentType = ComponentType.WorldState;
//
//}
//
class WorldStateSystem implements System{

    static stringify_entity_grid():string{
        const grid_component:EntityGridComponent = GridGeneratorSystem.get_grid();
        const grid = grid_component.grid;

        const result_grid:number[][] = [];
        for(let i = 0; i < grid.WIDTH; i++){
            result_grid[i] = [];
            for(let j = 0; j < grid.HEIGHT; j++){
                const entity:ECSEntity = grid.get(i, j);
                const cell = entity.get_component<GridCellComponent>(ComponentType.GridCell);
                const id = cell.id;
                result_grid[i][j] = id;
            }
        }
        return JSON.stringify(result_grid);
    }

    static parse_entity_grid(str:string){
        const map_entities = EntityManager.current.get_entities([ComponentType.IDCellMap]);
        console.assert(map_entities.length == 1);
        const map_entity = map_entities[0];
        const map = map_entity.get_component<IDCellMapComponent>(ComponentType.IDCellMap).map;

        const array = JSON.parse(str);

        GridGeneratorSystem.make_grid(array.length, array[0].length);
        const grid = GridGeneratorSystem.get_grid();

        for(let i = 0; i < array.length; i++){
            for(let j = 0; j < array[i].length; j++){
                const id = array[i][j];
                const size = Object.keys(map).length;
                const cell:GridCellComponent = map[id%size]();
                const cell_entity = new ECSEntity();
                cell_entity.add_component(cell);
                grid.grid.set(i,j,cell_entity);
            }
        }
    }

    step(){}
}
