interface Error{
  stack?: string;
}

function assert(b:boolean){
    if(!b) throw "Assert failed!";
}

function cantorPairing(x:number, y:number){
    return .5*(x+y)*(x+y+1)+y;
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

function combinations(arr:any[]) {
    const fn = (active:any[], rest:any[], result:any[][]):any[][] => {
        if (active.length == 0 && rest.length == 0)
            return result;
        if (rest.length == 0) {
            result.push(active);
        } else {
            const t:any[] = active.slice(0);
            t.push(rest[0]);
            fn(t, rest.slice(1), result);
            fn(active, rest.slice(1), result);
        }
        return result;
    }
    return fn([], arr, []);
}

class NumberTreeMapNode<T>{
    public value:T;
    public children:{[key:number]:NumberTreeMapNode<T>};
    constructor(){
        this.children = {};
    }
}

class NumberTreeMap<T>{
    private root:NumberTreeMapNode<T>;
    constructor(){
        this.root = new NumberTreeMapNode<T>();
    }
    public insert(key:number[], value:T):void{
        key.sort();
        let curr = this.root;
        for(let idx = 0; idx < key.length; idx++){
            if(!curr.children[key[idx]]){
                curr.children[key[idx]] = new NumberTreeMapNode<T>();
            }
            curr = curr.children[key[idx]];
        }
        curr.value = value;
    }

    public get(key:number[]):T{
        key.sort();
        let curr = this.root;
        for(let idx = 0; idx < key.length; idx++){
            const val = key[idx];
            if(curr.children[val]){
                curr = curr.children[val];
            }else{
                return undefined;
            }
        }
        return curr.value;
    }
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

    bounding_box() : Square{
        const l = Math.min(this.v0.x, this.v1.x);
        const t = Math.min(this.v0.y, this.v1.y);
        const w = Math.max(this.v0.x, this.v1.x) - l;
        const h = Math.max(this.v0.y, this.v1.y) - t;
        return new Square(l, t, w, h);
    }
}

class Ball {
    position: Vector;
    r: number;

    constructor(position: Vector, r: number) {
        if (!r) {
            throw "Radius should be number > 0";
        }
        this.position = position;
        this.r = r;
    }

    bounding_box() : Square{
        const l = this.position.x - this.r;
        const t = this.position.y - this.r;
        const w = this.r*2;
        return new Square(l, t, w, w);
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
    
    public contains_line_entirely(line:LineSegment){
        return this.contains(line.v0) && this.contains(line.v1);
    }

    public contains_line_partially(line:LineSegment){
        return this.contains(line.v0) || this.contains(line.v1);
    }

    public intersects(sq:Square){
        if(this.left > sq.left + sq.width || sq.left > this.left + this.width)
            return false;
        if(this.top > sq.top + sq.height || sq.top > this.top + this.height)
            return false;
        return true;
    }
}
