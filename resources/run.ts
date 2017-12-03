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
        console.log(hsv);
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
    console.log(img, img.width, img.height);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d");
    
    context.drawImage(img, 0, 0);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const ids = {};
    let max_id = 0;

    for(let i=0;i<canvas.width;i++){
        const r = data[i*4];
        const g = data[i*4+1];
        const b = data[i*4+2];
        if(r == 255 && g == 255 && b == 255){
            break;
        }
        if(!ids[r]) ids[r] = {}
        if(!ids[r][g]) ids[r][g] = {}
        ids[r][g][b] = max_id;
        max_id++;
    }

    console.log(ids);

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

                    console.log(r,g,b);
                    tile_values[di][dj] = ids[r][g][b];
                }
            }
            tiles.push(new Tile(tile_values));
        }
    }

    const t0 = new Tile([[0, 0, 0],[0, 0, 0],[0, 0, 0]]);
    const t1 = new Tile([[0, 0, 0],[1, 1, 1],[0, 0, 0]]);
    const t2 = new Tile([[0, 1, 0],[0, 1, 0],[0, 1, 0]]);
    const t3 = new Tile([[0, 0, 0],[0, 1, 0],[0, 1, 0]]);
    const t4 = new Tile([[0, 1, 0],[1, 1, 1],[0, 1, 0]]);

    const tile_grid = new TileGrid(tiles, 20, 20);
    const tile_canvas = document.createElement("canvas");
    document.body.appendChild(tile_canvas);
    tile_canvas.width = tile_canvas.height = 500;
    const ctx = tile_canvas.getContext("2d");
    const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
    setInterval(function(){
        const square_width = tile_canvas.width / tile_grid.id_width;
        const square_height = tile_canvas.height / tile_grid.id_height;
        for(let i=0;i<tile_grid.id_width;i++){
            for(let j=0;j<tile_grid.id_height;j++){
                if(tile_grid.get_id(i, j) === undefined){
                    ctx.fillStyle = "white";
                    const options = tile_grid.valid_options(Math.floor(i/3), Math.floor(j/3));
                    ctx.fillRect(i*square_width, j*square_height, square_width, square_height);
                    ctx.fillStyle = "black";
                    ctx.fillText("" + options.length, i*square_width, j*square_height + square_height/2);
                }else{
                    ctx.fillStyle = colors[tile_grid.get_id(i, j)];
                    ctx.fillRect(i*square_width, j*square_height, square_width, square_height);
                }
            }
        }

        for(let i=0;i<tile_grid.tile_width;i++){
            ctx.beginPath();
            ctx.moveTo(i*square_width*3, 0);
            ctx.lineTo(i*square_width*3, tile_canvas.height);
            ctx.strokeStyle = "black";
            ctx.stroke();
            for(let j=0;j<tile_grid.tile_height;j++){
                ctx.beginPath();
                ctx.moveTo(0, j*square_height*3);
                ctx.lineTo(tile_canvas.width, j*square_height*3);
                ctx.strokeStyle = "black";
                ctx.stroke();
            }
        }


        if(tile_grid.undecided_tiles_on_map()){
            const undecided_ij = tile_grid.get_undecided_tiles();
            for(let idx = 0;idx < undecided_ij.length;idx++){
                const i = undecided_ij[idx][0];
                const j = undecided_ij[idx][1];
                const options = tile_grid.valid_options(i, j);
                if(options.length == 0) continue;
                const choice = options[Math.floor(options.length*Math.random())];
                tile_grid.set_tile(i, j, choice);
                return;
            }

            const random_undecidable = undecided_ij[Math.floor(undecided_ij.length*Math.random())];
            const i = random_undecidable[0], j = random_undecidable[1];
            const clear_cell = (i,j) => {
                [[i+1,j],[i,j-1],[i-1,j],[i,j+1]].forEach((position) => {
                    if(!tile_grid.contains(position[0], position[1])) return;
                    tile_grid.set_tile(position[0], position[1], undefined);
                    if(tile_grid.valid_options(position[0], position[1]).length == 1){
                        clear_cell(position[0], position[1]);
                    }
                });
            }
            clear_cell(i, j);
        }
    }, 25);
}
img.crossOrigin = "Anonymous";
img.src = "tiles.png";
