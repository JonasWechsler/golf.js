interface Error{
  stack?: string;
}

function cantorPairing(x:number, y:number){
    const px = (x >= 0)?x*2:-x*2-1;
    const py = (y >= 0)?y*2:-y*2-1;
    return .5*(px+py)*(px+py+1)+py;
}

function disableImageSmoothing(context: CanvasRenderingContext2D){
    let ctx: any = context;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
}

function enableImageSmoothing(context: CanvasRenderingContext2D){
    let ctx: any = context;
    ctx.mozImageSmoothingEnabled = true;
    ctx.webkitImageSmoothingEnabled = true;
    ctx.msImageSmoothingEnabled = true;
    ctx.imageSmoothingEnabled = true;
}

/*Tools*/
type Quantity = Vector | Point | number;

class Point {
    constructor(public x:number,
                public y:number){}
}

class Vector extends Point{
  vector: boolean;
  /**
  * 
  */
  constructor(x, y) {
      super(x,y)
    this.vector = true;
  }
  clone() {
    return new Vector(this.x, this.y);
  }
  equals(v: Vector) {
    return Math.abs(this.x - v.x) < .0001 && Math.abs(this.y - v.y) < .0001;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  distanceToSquared(v: Vector):number {
    var dx = v.x - this.x;
    var dy = v.y - this.y;
    return dx * dx + dy * dy;
  }
  distanceTo(v: Vector):number {
    return Math.sqrt(this.distanceToSquared(v));
  }
  manhattanDistance(v: Vector):number {
    return Math.abs(v.x - this.x) + Math.abs(v.y - this.y);
  }
  plus(v: Quantity):Vector {
    var x = this.x;
    var y = this.y;
    if (v instanceof Vector) {
      x += v.x;
      y += v.y;
    } else if(typeof v === "number"){
      x += v;
      y += v;
    } else if(v instanceof Array
              && typeof v[0] === "number"
          && typeof v[1] === "number"){
      x += v[0];
      y += v[1];
    }else{
      var error = new Error("<" + JSON.stringify(v) + "> + <" + this.x + ", " + this.y + ">");
      error.message += error.stack;
      throw error;
    }
    return new Vector(x, y);
  }
  plusEquals(v: Quantity):Vector {
    if (v instanceof Vector) {
      this.x += v.x;
      this.y += v.y;
    } else if (typeof v === "number") {
      this.x += v;
      this.y += v;
    } else if(v instanceof Array
              && typeof v[0] === "number"
          && typeof v[1] === "number"){
      this.x += v[0];
      this.y += v[1];
    } else {
      throw "Error: <" + JSON.stringify(v) + "> + <" + this.x + ", " + this.y + "> is not valid";
    }
    return this;
  }
  times(scalar: number) {
    return new Vector(this.x * scalar, this.y * scalar);
  }
  timesEquals(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  minus(v: Quantity) {
    if (v instanceof Vector)
      return this.plus(v.times(-1));
    else if(typeof v === "number")
      return this.plus(v * -1);
    else
      throw "<" + JSON.stringify(v) + "> * <" + this.x + ", " + this.y + "> is not valid";
  }
  minusEquals(v: Quantity) {
    if (v instanceof Vector)
      return this.plusEquals(v.times(-1));
    else if(typeof v === "number")
      return this.plusEquals(v * -1);
    else
      throw "<" + this.x + ", " + this.y + "> -= <" + JSON.stringify(v) + "> is not valid";
  }
  divided(scalar: number) {
    return this.times(1 / scalar);
  }
  dividedEquals(scalar: number) {
    return this.timesEquals(1 / scalar);
  }
  dot(vector: Vector) {
    return this.x * vector.x + this.y * vector.y;
  }
  unit() {
    if (this.length() == 0) {
      return new Vector(0, 0);
    }
    return this.clone().divided(this.length());
  }
  unitTimes(scalar: number) {
    if (this.length() == 0) {
      return new Vector(0, 0);
    }
    return this.dividedEquals(this.length()).timesEquals(scalar);
  }
  clampTo(max: number): Vector{
    if(this.length() > max){
      return this.unit().times(max);
    }
    return this;
  }
  rotate(angle: number, pivot: Vector) {
    var s = Math.sin(angle),
      c = Math.cos(angle),
      v = this.clone(),
      p = pivot.clone();

    v.x -= p.x;
    v.y -= p.y;

    var xnew = v.x * c - v.y * s;
    var ynew = v.x * s + v.y * c;

    v.x = xnew + p.x;
    v.y = ynew + p.y;
    return v;
  }
}

class LineSegment {
    v0: Vector;
    v1: Vector;

    constructor(v0: Vector, v1: Vector) {
        this.v0 = v0;
        this.v1 = v1;
    }
}

class Ball {
    position: any;
    r: any;

    constructor(position: Vector, r: number) {
        if (!r) {
            throw "Radius should be number > 0";
        }
        this.position = position;
        this.r = r;
    }
}

class VectorMath {
  static intersectBallBall(ball0, ball1) {
    if (ball0.position.distanceTo(ball1) < ball0.r + ball1.r) {
      return true;
    }
    return false;
  }

  static projectScalar(a:Vector, b:Vector) {
    return a.dot(b.unit());
  }

  static projectVector(a:Vector, b:Vector) {
    return b.unit().timesEquals(VectorMath.projectScalar(a, b));
  }
}

function randomInt(max: number) {
  return Math.floor(max * Math.random());
}

class VectorMap<T>{
  struc: T[][] = [];
  map(p: Vector, val: T) {
    if (!this.struc[p.x]) {
      this.struc[p.x] = [];
    }
    this.struc[p.x][p.y] = val;
  }
  unmap(p: Vector) {
    if (!this.has(p)) return;
    this.struc[p.x][p.y] = undefined;
  }
  has(p: Vector): boolean{
    if (!this.struc[p.x]) {
      return false;
    }
    return this.struc[p.x][p.y]?true:false;
  }
  at(p: Vector): T{
    if (!this.has(p)) return undefined;
    return this.struc[p.x][p.y];
  }
  spread(): Vector[]{
    const result = [];
    for (const x in this.struc) {
      for (const y in this.struc[x]) {
        result.push(new Vector(parseInt(x), parseInt(y)));
      }
    }
    return result;
  }
}

class VectorSet{
  struc: VectorMap<boolean> = new VectorMap<boolean>();
  add(p: Vector) {
    this.struc.map(p, true);
  }
  remove(p: Vector) {
    this.struc.unmap(p);
  }
  has(p: Vector): boolean{
    return this.struc.has(p);
  }
}

class Square{
    constructor(public left:number,
                public top:number,
                public width:number,
                public height:number){}
    
    public contains(vector:Vector){
        return (vector.x > this.left && vector.x < this.left + this.width) &&
            (vector.y > this.top && vector.y < this.top + this.height);
    }
    
    public contains_line(line:LineSegment){
        return this.contains(line.v0) && this.contains(line.v1);
    }
}

class Color{
	public r:number;
    constructor(r:number|string,
                public g:number,
                public b:number){
        if(g == undefined){
            this.set_str(<string>r);
        }else{
			this.r = <number> r;
		}
    }
    /* accepts parameters
     *  h  Object = {h:x, s:y, v:z}
     *   OR 
     *  * h, s, v
     *  */
    public set_hsv(h:number, s:number, v:number) {
        if(h < 0 || h >= 1 || s < 0 || s >= 1 || v < 0 || v >= 1){
            throw "0 <= h,s,v < 1";
        }
        var r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        this.r = Math.round(r * 255);
        this.g = Math.round(g * 255);
        this.b = Math.round(b * 255);
    }

    public to_str():string{
        if(this.r  < 0 || this.r > 255 ||
        this.g  < 0 || this.g > 255 ||
        this.b  < 0 || this.b > 255){
            throw "0 <= r,g,b <= 255";
        }
        
        return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    }

    public set_str(hex:string){
        if(hex.charAt(0) == '#'){
            this.set_str(hex.substring(1));
            return;
        }
        const parse_byte = (x) => <number> new Number("0x" + x);
        this.r = parse_byte(hex.substring(0, 2));
        this.g = parse_byte(hex.substring(2, 2));
        this.b = parse_byte(hex.substring(4, 2));
    }
    public times(x:number){
        const r = Math.round(this.r*x);
        const g = Math.round(this.g*x);
        const b = Math.round(this.b*x);
        return new Color(r,g,b);
    }
    public plus(color:Color){
        const r = this.r + color.r;
        const g = this.g + color.g;
        const b = this.b + color.b;
        return new Color(r,g,b);
    }
    public minus(color:Color){
        return this.plus(color.times(-1));
    }
}
