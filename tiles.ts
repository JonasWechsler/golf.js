/* TileGenerator makes a grid of enums, where the values are cell types
 * (wall, floor, door, lake, with specificity, i.e. wood floor, stone wall, water)
 * GridGenerator makes a grid of GridCells, which are not components
 * GridCells contain minimal information on their content
 * GridParser transforms a grid into a world, and returns a list of entities?
 *
 */

class Tile{
    static get OMIT_TAG_IDX() : number{
        return 0;
    }
    static get WEIGHT_TAG_IDX() : number{
        return 1;
    }

    constructor(private values:number[][], private _tags:number[]){
        console.assert(values.length == 3);
        console.assert(values[0].length == 3);
    }
    public get(x:number, y:number){
        console.assert(x < 3);
        console.assert(y < 3);
        console.assert(x >= 0);
        console.assert(y >= 0);

        return this.values[x][y];
    }

    public get_tag(x:number):number{
        return this._tags[x];
    }

    public rotate_cw(){
        const new_values = [[],[],[]];
        for(let i=0;i<3;i++){
            for(let j=0;j<3;j++){
                new_values[i][j] = this.values[j][2-i];
            }
        }

        this.values = new_values;
    }

    public rotate_ccw(){
        this.rotate_cw();
        this.rotate_cw();
        this.rotate_cw();
    }

    public to_array():number[]{
        const result = [];
        for(let j=0;j<3;j++){
            for(let i=0;i<3;i++){
                result.push(this.get(i,j));
            }
        }
        return result;
    }

    public clone():Tile{
        const new_values = [[],[],[]];
        for(let i=0;i<3;i++){
            for(let j=0;j<3;j++){
                new_values[i][j] = this.values[i][j];
            }
        }
        const new_tags = [];
        for(let i=0;i<this._tags.length;i++)
            new_tags[i] = this._tags[i];
        return new Tile(new_values, new_tags);
    }

    public hash():number{
        return hash(this.to_array());
    }
}

class TileGrid{
    private _tiles:Tile[];
    private _tile_map:Tile[][];
    private _undecided:[number, number][];
    constructor(tiles:Tile[], private _width:number, private _height:number){
        const tile_set = {};
        tiles.forEach((tile) => {
            if(tile.get_tag(Tile.OMIT_TAG_IDX)){
                return;
            }

            const add = (t) => tile_set[t.hash()]=t;
            const clone = tile.clone();
            for(let i=0;i<4;i++){
                add(clone.clone());
                clone.rotate_cw();
            }
        });
        
        this._tiles = [];
        for(const hash_key in tile_set){
            this._tiles.push(tile_set[hash_key]);
        }

        this._undecided = [];
        this._tile_map = [];
        for(let idx=0;idx<_height;idx++){
            this._tile_map[idx] = [];
            for(let jdx=0;jdx<_width;jdx++){
                this._undecided.push([idx, jdx]);
            }
        }
    }

    public contains(i0:number, j0:number){
        return i0 >= 0 && j0 >= 0 && i0 < this._width && j0 < this._height;
    }

    valid_adjacent(t0:Tile, i0:number, j0:number, t1:Tile, i1:number, j1:number):boolean{
        if(!this.contains(i0, j0) || !this.contains(i1, j1)){
            return true;
        }

        const di = Math.abs(i1 - i0);
        const dj = Math.abs(j1 - j0);

        console.assert(dj <= 1 && di <= 1);
        console.assert(di != 1 || dj != 1);
        console.assert(di != 0 || dj != 0);
        
        if(i1 < i0 || j1 < j0){
            return this.valid_adjacent(t1, i1, j1, t0, i0, j0);
        }

        console.assert(i0 <= i1 && j0 <= j1);
        
        if(i0 == i1 && j0+1 == j1){
            const top = t0.clone();
            top.rotate_cw(); //right
            const bottom = t1.clone();
            bottom.rotate_cw(); //left
            return this.valid_adjacent(bottom, i0, j0, top, i0 + 1, j0);
        }

        console.assert(j0 == j1 && i0+1 == i1);

        const left = t0;
        const right = t1;

        return left.get(2, 0) == right.get(0, 0) &&
               left.get(2, 1) == right.get(0, 1) &&
               left.get(2, 2) == right.get(0, 2);
    }

    valid_options(i:number, j:number){
        const self = this;
        const adjacent = [[i-1, j], [i+1, j], [i, j-1], [i, j+1]];
        let options = this._tiles;

        adjacent.forEach((position:[number, number]) => {
            const pass = [];

            if(!self._tile_map[position[0]] || !self._tile_map[position[0]][position[1]]){
                return;
            }

            const t1 = self._tile_map[position[0]][position[1]];

            options.forEach((t0:Tile) => {
                if(self.valid_adjacent(t0, i, j, t1, position[0], position[1])){
                    pass.push(t0.clone());
                }
            });

            options = pass;
        });
        return options;
    }

    get_tile(i:number, j:number):Tile{
        console.assert(this.contains(i, j), "0<=" + i + "<" + this._width +
                      " 0<=" + j + "<" + this._height);
        return this._tile_map[i][j];
    }

    get_id(i:number, j:number):number{
        const tile_i = Math.floor(i/3);
        const tile_j = Math.floor(j/3);
        const tile = this.get_tile(tile_i, tile_j);
        if(!tile) return undefined;
        return tile.get(i%3,j%3);
    }

    set_tile(i:number, j:number, value:Tile):void{
        if(!this.contains(i,j))
            return;
        this._tile_map[i][j] = value;
    }

    undecided_tiles_on_map():boolean{
        for(let i=0;i<this._width;i++){
            for(let j=0;j<this._height;j++){
                if(this.get_tile(i, j) === undefined){
                    return true;
                }
            }
        }
        return false;
    }

    get_undecided_tiles():[number, number][]{
        const undecided = [];
        for(let i=0;i<this._width;i++){
            for(let j=0;j<this._height;j++){
                if(this.get_tile(i, j) === undefined){
                    undecided.push([i,j]);
                }
            }
        }
        return undecided;
    }

    get tiles() : Tile[]{
        return this._tiles;
    }

    get tile_width():number{
        return this._width;
    }

    get tile_height():number{
        return this._height;
    }

    get id_width():number{
        return this._width*3;
    }

    get id_height():number{
        return this._height*3;
    }
}

