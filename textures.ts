interface TextureGenerator{
    generate() : HTMLCanvasElement;
    WIDTH:number;
}

class TileTexture implements TextureGenerator{
    private _WIDTH:number;
    constructor(public GRID_WIDTH:number,
                public GRID_HEGHT:number,
                public OFFSET_X:number,
                public OFFSET_Y:number,
                public TEXTURE:TextureGenerator){
                    this._WIDTH = TEXTURE.WIDTH*this.GRID_WIDTH;
                }

    get WIDTH():number{
        return this._WIDTH;
    }

    generate(): HTMLCanvasElement{
        const texture_canvas:HTMLCanvasElement = document.createElement("canvas");
        texture_canvas.width = texture_canvas.height = this.WIDTH;

        
        return texture_canvas;
    }
}

class SolidColorTexture implements TextureGenerator{
    constructor(private _WIDTH:number, private _COLOR:Color = new Color(0, 0, 0)){}

    get WIDTH():number{
        return this._WIDTH;
    }

    generate(): HTMLCanvasElement{
        const texture_canvas:HTMLCanvasElement = document.createElement("canvas");
        texture_canvas.width = texture_canvas.height = this.WIDTH;
        const ctx = texture_canvas.getContext("2d");

        ctx.fillStyle = this._COLOR.to_str();
        ctx.fillRect(0, 0, this._WIDTH, this._WIDTH);

        return texture_canvas;
    }
}

class MarbleTexture implements TextureGenerator{
    public PERIOD = 4;
    SCHEME:[string, number][] = COLOR_SCHEME["Marble"];

    constructor(private _WIDTH:number){}

    get WIDTH():number{
        return this._WIDTH;
    }

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
        //if(this.SCHEME.length != 2){
        //    throw "Scheme should only have 2 colors";
        //}
        const COLOR0 = new Color(this.SCHEME[0][0]);
        const COLOR1 = new Color(this.SCHEME[1][0]);

        Perlin2D.WIDTH = this.WIDTH;
        const perlin = Perlin2D.generate();
        const texture_canvas:HTMLCanvasElement = document.createElement("canvas");
        texture_canvas.width = this.WIDTH*4;
        texture_canvas.height = this.WIDTH*4;
        const texture = texture_canvas.getContext("2d");
        for(let i=0;i<perlin.length;i++){
            for(let j=0;j<perlin[i].length;j++){
                const rgbv = this.marble(i, j, perlin[i][j]);
                const color = COLOR0.times(1-rgbv).plus(COLOR1.times(rgbv));
                texture.fillStyle = color.to_str();
                texture.fillRect(i*4, j*4, 4, 4);
            }
        }
        return texture_canvas;
    }
}

class WoodGrainTexture implements TextureGenerator{
    public PERIOD = 4;
    SCHEME:[string, number][] = COLOR_SCHEME["Blackwood"];
    //public COLOR0 = new Color(150, 130, 130);
    //public COLOR1 = new Color(228, 203, 170);

    constructor(private _WIDTH:number){}

    get WIDTH():number{
        return this._WIDTH;
    }

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
        //if(this.SCHEME.length != 2){
        //    throw "Scheme should only have 2 colors";
        //}
        const COLOR0 = new Color(this.SCHEME[0][0]);
        const COLOR1 = new Color(this.SCHEME[1][0]);

        Perlin2D.WIDTH = this.WIDTH;
        const perlin = Perlin2D.generate();
        const texture_canvas:HTMLCanvasElement = document.createElement("canvas");
        texture_canvas.width = this.WIDTH*4;
        texture_canvas.height = this.WIDTH*4;
        const texture = texture_canvas.getContext("2d");
        for(let i=0;i<perlin.length;i++){
            for(let j=0;j<perlin[i].length;j++){
                const rgbv = this.marble(i, j, perlin[i][j]);
                const color = COLOR0.times(1-rgbv).plus(COLOR1.times(rgbv));
                texture.fillStyle = color.to_str();
                texture.fillRect(i*4, j*4, 4, 4);
            }
        }
        return texture_canvas;
    }
}

class SandTexture implements TextureGenerator{
    SCHEME:[string, number][] = COLOR_SCHEME["Mesa"];
    constructor(private _WIDTH:number){}

    get WIDTH():number{
        return this._WIDTH;
    }

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
