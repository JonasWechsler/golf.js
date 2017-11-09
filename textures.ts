interface TextureGenerator{
    generate() : HTMLCanvasElement;
}

class MarbleTexture implements TextureGenerator{
    public PERIOD = 4;
    public COLOR0 = new Color(150, 130, 130);
    public COLOR1 = new Color(228, 203, 170);

    constructor(private WIDTH:number){}
    private marble(x, y, v){
        const xP = this.PERIOD/this.WIDTH;
        const yP = this.PERIOD/this.WIDTH;
        const turbPower = 2.5;
        const turbSize = 4.0;
        const xy = x * xP + y * yP + turbPower * v;
        const sine = Math.abs(Math.sin(xy * Math.PI));
        return sine;
    }
    generate(): HTMLCanvasElement{
        Perlin2D.WIDTH = this.WIDTH;
        const perlin = Perlin2D.generate();
        const texture_canvas:HTMLCanvasElement = document.createElement("canvas");
        texture_canvas.width = this.WIDTH*4;
        texture_canvas.height = this.WIDTH*4;
        const texture = texture_canvas.getContext("2d");
        for(let i=0;i<perlin.length;i++){
            for(let j=0;j<perlin[i].length;j++){
                const rgbv = this.marble(i, j, perlin[i][j]);
                const color = this.COLOR0.times(1-rgbv).plus(this.COLOR1.times(rgbv));
                texture.fillStyle = color.to_str();
                texture.fillRect(i*4, j*4, 4, 4);
            }
        }
        return texture_canvas;
    }
}

class SandTexture implements TextureGenerator{
    SCHEME:[string, number][] = [
        ["#565656",0.2],
        ["#6e5457",0.1],
        ["#6D5051",0.025],
        ["#834B5F",0.025],
        ["#A98978",0.025],
        ["#A7705A",0.025],
        ["#B88968",0.0375],
        ["#82694A",0.0125],
        ["#A98978",0.0375],
        ["#B88968",0.025],
        ["#B88968",0.1],
        ["#A37B5F",0.1],
        ["#C8B998",0.2]
    ];
    constructor(private WIDTH:number){}
    private color0(height:number, intensity:number){
        let sum:number = 0;
        for(let i=0;i<this.SCHEME.length;i++){
            const tuple = this.SCHEME[i];
            const name:string = tuple[0];
            const percent:number = tuple[1];

            sum += percent;
            if(height < sum){
                return name;
            }
        }
    }
    generate(): HTMLCanvasElement{
        Perlin2D.WIDTH = this.WIDTH;
        const height = Perlin2D.generate();
        const intensity = Perlin2D.generate();

        const texture_canvas:HTMLCanvasElement = document.createElement("canvas");
        texture_canvas.width = this.WIDTH;
        texture_canvas.height = this.WIDTH;
        const texture = texture_canvas.getContext("2d");
        for(let i=0;i<height.length;i++){
            for(let j=0;j<height[i].length;j++){
                texture.fillStyle = this.color0(height[i][j], intensity[i][j]);
                texture.fillRect(i, j, 1, 1);
                texture.fillStyle = "rgba(0, 0, 0, " + Math.random()*.05 + ")";
                texture.fillRect(i, j, 1, 1);
            }
        }
        return texture_canvas;
    }
}

class FloorTextureComponent implements Component{
    type:ComponentType = ComponentType.FloorTexture;
    constructor(public texture:HTMLCanvasElement){}
}
