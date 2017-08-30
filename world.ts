enum WorldCell{
    None, NotNone
}

class Grid<T>{
    private grid:T[][];
    constructor(public WIDTH:number,
                public HEIGHT:number,
               public DEFAULT:T){
            this.grid = [];
            for(let i=0;i<this.WIDTH;i++){
                this.grid[i] = [];
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

class WorldGrid{
    private world:Grid<WorldCell>;
    constructor(public WIDTH:number,
                public HEIGHT:number){
        this.world = new Grid<WorldCell>(WIDTH, HEIGHT, WorldCell.None);
        
                }

}
