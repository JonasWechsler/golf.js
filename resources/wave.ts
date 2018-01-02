class TileSet{
    private _tiles:Tile[];
    constructor(img:HTMLImageElement){
        this.set_image(img);
    }
    
    private set_image(img:HTMLImageElement){
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext("2d");

        context.drawImage(img, 0, 0);
        const data = context.getImageData(0, 0, canvas.width, canvas.height);
        const ids = {};
        let max_id = 0;

        /*Read colors from first row of pixels, stop at white*/
        for(let i=0;i<canvas.width;i++){
            const r = data[i*4];
            const g = data[i*4+1];
            const b = data[i*4+2];

            if(r == 255 && g == 255 && b == 255)
                break;

            if(!ids[r]) ids[r] = {}
            if(!ids[r][g]) ids[r][g] = {}
            ids[r][g][b] = max_id;
            max_id++;
        }

        /*Read tiles, stop when one contains white*/
        const tiles = [];

        outer: for(let j=1;j<canvas.height-2;j+=3){
            for(let i=0;i<canvas.width-2;i+=3){
                const tile_values = [[],[],[]];
                for(let dj=0;dj<3;dj++){
                    for(let di=0;di<3;di++){
                        const idx = (i + di + (j + dj)*canvas.width)*4;

                        const r = data[idx];
                        const g = data[idx+1];
                        const b = data[idx+2];
                        if(r == 255 && g == 255 && b == 255) break outer;

                        tile_values[di][dj] = ids[r][g][b];
                    }
                }
                tiles.push(new Tile(tile_values));
            }
        }

        this._tiles = [];
    }

    get tiles(){
        return this._tiles;
    }
}

enum GridGeneratorMethod{
    Greedy, WaveCollapse
}

class GridGenerator{
    private tile_grid:TileGrid;
    private P:boolean[][][];

    constructor(private _tiles:Tile[],
                private _width:number,
               private _height:number,
               private _method:GridGeneratorMethod,
               private _complete_callback:(gg:GridGenerator)=>void = ()=>0,
               private _generate_callback:(gg:GridGenerator)=>void = ()=>0){
        this.tile_grid = new TileGrid(_tiles, _width, _height);
        this.generate();
    }

    private greedy_step():boolean{
        if(!this.tile_grid.undecided_tiles_on_map())
            return false;
        const undecided_ij = this.tile_grid.get_undecided_tiles();

        for(let idx = 0;idx < undecided_ij.length;idx++){
            const i = undecided_ij[idx][0];
            const j = undecided_ij[idx][1];
            const options = this.tile_grid.valid_options(i, j);
            if(options.length == 0) continue;
            const choice = options[Math.floor(options.length*Math.random())];
            this.tile_grid.set_tile(i, j, choice);
            return;
        }

        const random_undecidable = undecided_ij[Math.floor(undecided_ij.length*Math.random())];
        const i = random_undecidable[0], j = random_undecidable[1];

        const clear_cell = (i,j) => {
            [[i+1,j],[i,j-1],[i-1,j],[i,j+1]].forEach((position) => {
                if(!this.tile_grid.contains(position[0], position[1])) return;
                this.tile_grid.set_tile(position[0], position[1], undefined);
                if(this.tile_grid.valid_options(position[0], position[1]).length == 1){
                    clear_cell(position[0], position[1]);
                }
            });
        }

        clear_cell(i, j);
        
        return true;
    }

    private setup_wave_collapse(){
        this.P = [];

        for(let i=0;i<this.tile_grid.tile_width;i++){
            this.P[i] = [];
            for(let j=0;j<this.tile_grid.tile_height;j++){
                this.P[i][j] = [];
                for(let k=0;k<this.tile_grid.tiles.length;k++){
                    this.P[i][j][k] = true;
                }
            }
        }
    }

    private update(i:number, j:number){
        console.assert(i >= 0);
        console.assert(j >= 0);
        console.assert(i < this.tile_grid.tile_width);
        console.assert(j < this.tile_grid.tile_height);

        const adj = [[i-1,j],[i+1,j],[i,j-1],[i,j+1]];
        
        for(let k=0;k<this.tile_grid.tiles.length;k++){
            const tile = this.tile_grid.tiles[k];
            if(!this.P[i][j][k])
                continue;
            for(let y=0;y<adj.length;y++){
                const adj_i = adj[y][0], adj_j = adj[y][1];
                if(!this.tile_grid.contains(adj_i, adj_j))
                    continue;
                let any_good = false;
                for(let l=0;l<this.tile_grid.tiles.length;l++){
                    if(!this.P[adj_i][adj_j][l])
                        continue;
                    const adj_tile = this.tile_grid.tiles[l];
                    if(this.tile_grid.valid_adjacent(tile,i,j,adj_tile,adj_i,adj_j)){
                        any_good = true;
                        break;
                    }
                }
                this.P[i][j][k] = this.P[i][j][k] && any_good;
            }
        }
    }

    private bfs_update(i:number, j:number){
        const Q:Vector[] = [
            new Vector(i-1,j),
            new Vector(i+1,j),
            new Vector(i, j-1),
            new Vector(i, j+1)];

        const V = new VectorSet();
        V.add(new Vector(i,j));

        while(Q.length != 0){
            const B:Vector = Q.shift();

            if(V.has(B) ||
               B.x < 0 ||
               B.y < 0 ||
               B.x >= this.tile_grid.tile_width ||
               B.y >= this.tile_grid.tile_height ||
               B.distanceToSquared(new Vector(i, j)) > 25){
                continue;
            }

            V.add(B);
            this.update(B.x, B.y);

            Q.push(new Vector(B.x-1,B.y));
            Q.push(new Vector(B.x+1,B.y));
            Q.push(new Vector(B.x,B.y-1));
            Q.push(new Vector(B.x,B.y+1));
        }
    }

    wave_entropy(i:number, j:number){
        let entropy = 0;
        for(let k=0;k<this.tile_grid.tiles.length;k++){
            if(this.P[i][j][k]){
                entropy++;
            }
        }
        return entropy;
    }

    private collapse(i:number, j:number){
        const options = [];

        for(let k=0;k<this.tile_grid.tiles.length;k++){
            if(this.P[i][j][k]){
                options.push(k);
            }
        }

        const collapsed = options[Math.floor(Math.random()*options.length)];

        for(let k=0;k<this.tile_grid.tiles.length;k++){
            if(k == collapsed){
                this.P[i][j][k] = true;
                this.tile_grid.set_tile(i, j, this.tile_grid.tiles[k]);
            }else{
                this.P[i][j][k] = false;
            }
        }
    }

    private wave_collapse_step(){
        if(!this.tile_grid.undecided_tiles_on_map())
            return false;

        let min_entropy = this.tile_grid.tiles.length*2;
        let min_tile = [];
        for(let i=0;i<this.tile_grid.tile_width;i++){
            for(let j=0;j<this.tile_grid.tile_height;j++){
                if(this.tile_grid.get_tile(i, j) !== undefined){
                    continue;
                }

                const entropy = this.wave_entropy(i, j);

                if(entropy == 0){
                    continue;
                }

                if(entropy == min_entropy){
                    min_tile.push([i,j]);
                }else if(entropy < min_entropy){
                    min_tile = [[i,j]];
                    min_entropy = entropy;
                }
            }
        }

        console.assert(min_tile.length != 0);
        if(min_tile.length == 0)
            return false;

        const X = min_tile[Math.floor(Math.random()*min_tile.length)];
        const i = X[0], j = X[1];
        this.collapse(i, j);
        this.bfs_update(i, j);

        return true;
    }

    private ASYNC_LOOPS = 5;
    private generate(){
        const self = this;
        if(this._method == GridGeneratorMethod.Greedy){
            const looper = () => {
                for(let loop=0; loop<self.ASYNC_LOOPS; loop++){
                    const loop_again = self.greedy_step();

                    if(!loop_again){
                        self._complete_callback(self);
                        return;
                    }
                }
                self._generate_callback(self);
                requestAnimationFrame(looper);
            }
            looper();
        }

        if(this._method == GridGeneratorMethod.WaveCollapse){
            const looper = () => {
                for(let loop = 0; loop < self.ASYNC_LOOPS; loop++){
                    const loop_again = this.wave_collapse_step();

                    if(!loop_again){
                        self._complete_callback(self);
                        return;
                    }
                }
                self._generate_callback(self);
                requestAnimationFrame(looper);
            }
            this.setup_wave_collapse();
            looper();
        }
    }

    get TILES():TileGrid{
        return this.tile_grid;
    }
    get WIDTH():number{
        return this._width;
    }
    get HEIGHT():number{
        return this._height;
    }
}
