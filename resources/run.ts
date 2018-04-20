function render(canvas, scheme){
    const context = canvas.getContext("2d");
    const width = canvas.width / scheme.length;
    let x = 0;
    let h = 0, s = 0, v = 0;
    for(let i=0;i<scheme.length;i++){
        const color_hex = scheme[i][0];
        const block_width = Math.round(scheme[i][1]*canvas.width);
        context.fillStyle = color_hex;
        const color = new Color(color_hex);
        const hsv = color.to_hsv();
        h += hsv[0];
        s += hsv[1];
        v += hsv[2];
        context.fillRect(x, 0, block_width, canvas.height);
        x += block_width;
    }
    h/=scheme.length;
    s/=scheme.length;
    v/=scheme.length;
}

function render_all(){
    const big_canvas = document.createElement("canvas");
    const big_context = big_canvas.getContext("2d");
    big_canvas.width = 1000;
    big_canvas.height = 1000;
    let y = 0;
    for(let scheme_name in COLOR_SCHEME){
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = 1000;
        canvas.height = 100;
        render(canvas, COLOR_SCHEME[scheme_name]);
        big_context.drawImage(canvas, 0, y);
        y += 100;
    }
    document.body.appendChild(big_canvas);
}

class RGB{
    private make_input(callback:()=>void){
        const div = document.createElement("div");
        const value = document.createElement("span");
        const input = document.createElement("input");
        input.setAttribute("type", "range");
        input.setAttribute("min", "0");
        input.setAttribute("max", "255");
        div.appendChild(input);
        div.appendChild(value);
        input.oninput = function(){
            value.innerHTML = input.value;
            callback();
        }
        return div;
    }

    private red;
    private green;
    private blue;

    public get_red(){
        return this.red.children[0].value;
    }
    public get_green(){
        return this.green.children[0].value;
    }
    public get_blue(){
        return this.blue.children[0].value;
    }
    public get_color():Color{
        return new Color(this.get_red(),
                         this.get_green(),
                         this.get_blue());
    }

    constructor(){
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = canvas.height = 100;
        const self = this;
        function update(){
            context.fillStyle = this.get_color().to_str();
            context.fillRect(0, 0, 200, 200);
        }

        const container = document.createElement("div");
        this.red = this.make_input(update);
        this.green = this.make_input(update);
        this.blue = this.make_input(update);
        container.appendChild(this.red);
        container.appendChild(this.green);
        container.appendChild(this.blue);
        container.appendChild(canvas);

        document.body.appendChild(container);
    }
}

//const rgb = new RGB();
render_all();

let loaded = false;
const img = document.createElement("img");
img.onload = () => {
    const tile_canvas = document.createElement("canvas");
    tile_canvas.width = tile_canvas.height = 750;
    document.body.appendChild(tile_canvas);
    const ctx = tile_canvas.getContext("2d");
    const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet", "darkgreen"];
    let t = 0;
    const render_grid = (gg:TileGenerator) => {
        const gg_tile_grid = gg.TILES;
        const square_width = tile_canvas.width /   gg_tile_grid.id_width;
        const square_height = tile_canvas.height / gg_tile_grid.id_height;
        ctx.clearRect(0, 0, tile_canvas.width, tile_canvas.height);
        for(let i=0;i<gg_tile_grid.id_width;i++){
            for(let j=0;j<gg_tile_grid.id_height;j++){
                if(gg_tile_grid.get_id(i, j) !== undefined){
                    ctx.fillStyle = colors[gg_tile_grid.get_id(i, j)];
                    ctx.fillRect(i*square_width, j*square_height, square_width, square_height);
                }else{
                    //ctx.fillStyle = "black";
                    //const txt = gg.wave_entropy(Math.floor(i/3), Math.floor(j/3));
                    //ctx.fillText("" + txt, i*square_width, (j+1)*square_height);
                }
            }
        }

        //for(let i=0;i<tile_grid.tile_width;i++){
        //    ctx.beginPath();
        //    ctx.moveTo(i*square_width*3, 0);
        //    ctx.lineTo(i*square_width*3, tile_canvas.height);
        //    ctx.strokeStyle = "black";
        //    ctx.stroke();
        //    for(let j=0;j<tile_grid.tile_height;j++){
        //        ctx.beginPath();
        //        ctx.moveTo(0, j*square_height*3);
        //        ctx.lineTo(tile_canvas.width, j*square_height*3);
        //        ctx.strokeStyle = "black";
        //        ctx.stroke();
        //    }
        //}

        t = 1-t;
        ctx.fillStyle = ["red", "green"][t];
        ctx.fillRect(t*10, 0, 10, 10);
    }

    function initiate(gg:TileGenerator){
        let id_water = -1;
        outer:for(let i=0;i<gg.TILES.tiles.length;i++){
            const arr = gg.TILES.tiles[i];
            for(let j=0;j<3;j++)
            for(let k=0;k<3;k++)
            if(arr.get(j, k) != 5)
                continue outer;
            id_water = i;
            break;
        }
        for(let i=0;i<gg.WIDTH;i++){
            gg.wave_set_tile(new Vector(i, 0), id_water);
            gg.wave_set_tile(new Vector(i, gg.HEIGHT-1), id_water);
        }
        for(let i=0;i<gg.HEIGHT;i++){
            gg.wave_set_tile(new Vector(0, i), id_water);
            gg.wave_set_tile(new Vector(gg.WIDTH-1, i), id_water);
        }
        let id_mountain = -1;
        outer:for(let i=0;i<gg.TILES.tiles.length;i++){
            const arr = gg.TILES.tiles[i];
            for(let j=0;j<3;j++)
            for(let k=0;k<3;k++)
            if(arr.get(j, k) != 6)
                continue outer;
            id_mountain = i;
            break;
        }
        console.log(id_mountain);
        gg.wave_set_tile(new Vector(10, 10), id_mountain);
        let id_cave = -1;
        outer:for(let i=0;i<gg.TILES.tiles.length;i++){
            const arr = gg.TILES.tiles[i];
            for(let j=0;j<3;j++)
            for(let k=0;k<3;k++)
            if(arr.get(j, k) != 4)
                continue outer;
            id_cave = i;
            break;
        }
        console.log(id_cave);
        gg.wave_set_tile(new Vector(30, 30), id_cave);
    }

    const tiles = new TileSet(img).TILES;
    console.log(tiles);
    const gg = new TileGenerator(tiles,
                                40,
                                40,
                                TileGeneratorMethod.WaveCollapse,
                                () => console.log("donezo"),
                                render_grid,
                                initiate, 5, 1);
}
img.crossOrigin = "Anonymous";
img.src = "tiles-reformatted.png";
