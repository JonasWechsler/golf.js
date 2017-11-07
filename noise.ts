class Perlin2D {
  private static DEFAULT_WIDTH : number = 256;
  private static DEFAULT_PERSISTENCE : number = 0.25;
  private static DEFAULT_ITERATIONS : number = 5;
  private static DEFAULT_FREQUENCY : number = 10;
  
  public static WIDTH : number = Perlin2D.DEFAULT_WIDTH;
  public static PERSISTENCE : number = Perlin2D.DEFAULT_PERSISTENCE;
  public static ITERATIONS : number = Perlin2D.DEFAULT_ITERATIONS;
  public static FREQUENCY : number = Perlin2D.DEFAULT_FREQUENCY;
  
  public static INTERPOLATION : any = Perlin2D.linear_interp;
  
  public static generate():number[][]{
    return new Perlin2D(Perlin2D.WIDTH,
                        Perlin2D.PERSISTENCE,
                        Perlin2D.ITERATIONS,
                        Perlin2D.FREQUENCY).generate();
  }
  
    private constructor(public width : number, 
            public persistence : number,
            public iterations : number,
            public frequency : number) {
        if (persistence <= 0 || persistence >= 1) {
            throw "0<p<1";
        }
    }
  
    public static lfill_interp(f00 : number,
            f10 : number,
            f01 : number,
            f11 : number,
            x : number,
            y : number) : number {
        return f00;
    }

    public static linear_interp(f00 : number,
            f10 : number,
            f01 : number,
            f11 : number,
            x : number,
            y : number) : number {
        const a00 = f00;
        const a10 = f10 - f00;
        const a01 = f01 - f00;
        const a11 = f11 + f00 - (f10 + f01);
        return a00 + a10 * x + a01 * y + a11 * x * y;
    }
    private generate_function(amplitude : number, frequency : number) : number[][]{
        const map : number[][] = [];
        for (let i = 0; i < frequency; i++) {
            map[i] = [];
            for (let j = 0; j < frequency; j++) {
                map[i][j] = Math.random() * amplitude;
            }
        }
        return map;
    }

    private generate_perlin(amplitude:number, frequency:number) : number[][] {
        const layers = [];
        let max = 0;
        for (let i = 0; i < this.iterations; i++) {
            layers[i] = this.generate_function(amplitude, frequency);
            max += amplitude;
            amplitude *= this.persistence;
            frequency /= this.persistence;
        }
        const map : number[][] = [];
        for (let x = 0; x < this.width; x++) {
            map[x] = [];
            for (let y = 0; y < this.width; y++) {
                map[x][y] = 0;
                /*Iterate through layers*/
                for (let it = 0; it < this.iterations; it++) {
                    /*Iterate through layer*/
                    const left = Math.floor((layers[it].length - 1) * x / this.width);
                    const top = Math.floor((layers[it][0].length - 1) * y / this.width);

                    if (!layers[it][left + 1] || !layers[it][left][top + 1]) {
                        continue;
                    }

                    const f00 = layers[it][left][top];
                    const f10 = layers[it][left + 1][top];
                    const f01 = layers[it][left][top + 1];
                    const f11 = layers[it][left + 1][top + 1];

                    const square_width = this.width * 1 / (layers[it].length - 1);

                    map[x][y] += Perlin2D.INTERPOLATION(f00, f10, f01, f11, (x % square_width) / square_width, (y % square_width) / square_width) / max;
                }
            }
        }
        return map;
    }
    private generate() : number[][]{
        return this.generate_perlin(1, this.frequency);
    }
}
