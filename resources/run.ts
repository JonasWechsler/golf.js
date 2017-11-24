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
    console.log(h,s,v);
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

