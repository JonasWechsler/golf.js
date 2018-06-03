interface Error{
  stack?: string;
}

function assert(b:boolean){
    if(!b) throw "Assert failed!";
}

function cantorPairing(x:number, y:number){
    const px = (x >= 0)?x*2:-x*2-1;
    const py = (y >= 0)?y*2:-y*2-1;
    return .5*(px+py)*(px+py+1)+py;
}

function modulus(a:number, b:number){
    return ((a % b) + b) % b;
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
        if (active.length == 0 && rest.length == 0){
            result.push([]);
            return result;
        }
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

function hash(arr:number[]) {
    var hash = 0;
    if (arr.length == 0) {
        return hash;
    }
    for (let idx = 0; idx < arr.length; idx++) {
        hash = ((hash<<5)-hash)+arr[idx];
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

/* From https://stackoverflow.com/questions/9838812/how-can-i-open-a-json-file-in-javascript-without-jquery */
function loadJSON(path, success, error){
    return load(path, (data) => success(JSON.parse(data)), error);
}

function load(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(xhr.responseText);
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
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
  apply(fun:(x:number)=>number): Vector{
    return new Vector(fun(this.x), fun(this.y));
  }
  applyEquals(fun:(x:number)=>number): Vector{
    this.x = fun(this.x);
    this.y = fun(this.y);
    return this;
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
    return this.dividedEquals(this.length()).times(scalar);
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
        if (r <= 0) {
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

class Color{
	public r:number;
    constructor(r:number|string,
                public g:number = undefined,
                public b:number = undefined){
        if(g == undefined){
            this.set_str(<string>r);
        }else{
			this.r = <number> r;
		}
    }

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

    public to_hex():string{
        const component = (c) => {
            const hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        const r = component(this.r);
        const g = component(this.g);
        const b = component(this.b);

        return "#" + r + g + b;
    }

    public to_str():string{
        if(this.r  < 0 || this.r > 255 ||
        this.g  < 0 || this.g > 255 ||
        this.b  < 0 || this.b > 255){
            throw "0 <= r,g,b <= 255";
        }
        
        return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    }

    public to_hsv():[number, number, number]{
        const r = this.r/255;
        const g = this.g/255;
        const b = this.b/255;
        const max = Math.max(r,g,b);
        const min = Math.min(r,g,b);
        const diff = max - min;
        const v = max;

        if(diff == 0){
            return [0, 0, v];
        }

        const diffc = (c)=>(v-c) / 6 / diff + 1/2;

        const rr = diffc(r);
        const gg = diffc(g);
        const bb = diffc(b);

        let h;
        if(r === v)
            h = bb - gg;
        else if(g === v)
            h = (1 / 3) + rr - bb;
        else if(b === v)
            h = (2 / 3) + gg - rr;

        if (h < 0)
            h += 1;
        else if (h > 1)
            h -= 1;

        const s = diff / v;

        return [h,s,v];
    }

    public set_str(hex:string){
        if(hex.charAt(0) == '#'){
            this.set_str(hex.substring(1));
            return;
        }
        const parse_byte = (x) => <number> new Number("0x" + x);
        this.r = parse_byte(hex.substr(0, 2));
        this.g = parse_byte(hex.substr(2, 2));
        this.b = parse_byte(hex.substr(4, 2));
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


class CanvasCache {
    public static DEFAULT_CANVAS_WIDTH:number = 1024; //TODO If this is 500, draw_image bugs out on images of size 512*16
    private cache:VectorMap<HTMLCanvasElement> = new VectorMap<HTMLCanvasElement>();
    constructor(private CANVAS_WIDTH: number = CanvasCache.DEFAULT_CANVAS_WIDTH) { }
    
    private mod(a: number, b: number): number{
        return ((a % b) + b) % b;
    }

    draw_image(canvas:HTMLCanvasElement, position:Vector):void{
        const p = position.divided(this.CANVAS_WIDTH).apply(Math.floor);
        const dimensions = new Vector(canvas.width, canvas.height).divided(this.CANVAS_WIDTH).apply(Math.ceil);
        for(let i=0;i<dimensions.x+1;i++){
            for(let j=0;j<dimensions.y+1;j++){
                const left = position.x - (p.x + i)*this.CANVAS_WIDTH;
                const top = position.y - (p.y + j) * this.CANVAS_WIDTH;
                const idx = new Vector(p.x + i, p.y + j);
                if (!this.cache.has(idx)) {
                    const new_canvas = document.createElement("canvas");
                    new_canvas.width = this.CANVAS_WIDTH;
                    new_canvas.height = this.CANVAS_WIDTH;
                    this.cache.map(idx, new_canvas);
                }
                const ctx = this.cache.at(idx).getContext("2d");
                disableImageSmoothing(ctx);
                ctx.drawImage(canvas, left, top);
            }
        }
    }

    get_image(view:Square):HTMLCanvasElement{
        const result = document.createElement("canvas");
        result.width = view.width;
        result.height = view.height;
        const ctx = result.getContext("2d");
        disableImageSmoothing(ctx);
        const position = new Vector(view.left, view.top).divided(this.CANVAS_WIDTH).apply(Math.floor);
        const dimensions = new Vector(view.width, view.height).divided(this.CANVAS_WIDTH).apply(Math.ceil);
        const offset_x = this.mod(view.left, this.CANVAS_WIDTH);
        const offset_y = this.mod(view.top, this.CANVAS_WIDTH);
        for(let i=0;i<dimensions.x+1;i++){
            for(let j=0;j<dimensions.y+1;j++){
                let left = i*this.CANVAS_WIDTH - offset_x;
                let top = j*this.CANVAS_WIDTH - offset_y;
                const idx = position.plus(new Vector(i, j));
                const img = this.cache.at(idx);
                if (!img) continue;
                /*
                const sx = Math.max(-left, 0);
                const sy = Math.max(-top, 0);
                const sWidth = img.width - sx;
                const sHeight = img.height - sy;
                ctx.drawImage(img, sx, sy, sWidth, sHeight, left+sx, top+sx, sWidth, sHeight);
               */
                ctx.drawImage(img, left, top);
                ctx.fillStyle = "red";
                ctx.fillRect(left, top, 2, 2);
                ctx.fillStyle = "green";
                ctx.fillRect(left + img.width - 2, top + img.height - 2, 2, 2);
            }
        }
        return result;
    }
}

class PriorityQueue<T> {
    private heap = [];
    private left = i => 2*i + 1;
    private right = i => 2*i + 2;
    private top = 0;
    private parent = i => (i%2)?(i-1)/2:(i-2)/2;
    constructor(private comparator:(a:T,b:T)=>boolean = (a, b) => a > b){}

    private swap(a,b){
        console.log("swap " + a + " with " + b + " " + this.heap);
        const tmp = this.heap[a];
        this.heap[a] = this.heap[b];
        this.heap[b] = tmp;
    }

    private greater(a,b){
        return this.comparator(this.heap[a], this.heap[b]);
    }

    private sift_down(){
        let node = this.top;
        while((this.left(node) < this.length && this.greater(this.left(node), node)) ||
              (this.right(node) < this.length && this.greater(this.right(node), node))){
            if(this.left(node) >= this.length){
                this.swap(node, this.right(node));
                node = this.right(node);
            }else if(this.right(node) >= this.length){
                this.swap(node, this.left(node));
                node = this.left(node);
            }else if(this.greater(this.left(node), this.right(node))){
                this.swap(node, this.left(node));
                node = this.left(node);
            }else{
                this.swap(node, this.right(node));
                node = this.right(node);
            }
        }
    }

    private sift_up(){
        let node = this.length-1;
        while( node != this.top && this.greater(node, this.parent(node))){
            this.swap(node, this.parent(node));
            node = this.parent(node);
        }
    }

    private is_valid(node){
        return node >= 0 && node < this.length;
    }

    private validate(){
        for(let i=0;i<this.length;i++){
            console.assert(!this.is_valid(this.parent(i)) || this.greater(this.parent(i), i));
            console.assert(!this.is_valid(this.left(i)) || this.greater(i, this.left(i)));
            console.assert(!this.is_valid(this.right(i)) || this.greater(i, this.right(i)));
        }
    }

    empty():boolean{
        return this.length == 0;
    }

    peek():T{
        return this.heap[this.top];
    }

    pop():T{
        const result = this.peek();

        if(this.length == 1){
            this.heap.pop();
            return result;
        }

        const bottom = this.length-1;
        this.swap(this.top, bottom);
        this.heap.pop();
        this.sift_down();
        this.validate();
        return result;
    }

    push(value:T){
        this.heap.push(value);
        this.sift_up();
        this.validate();
    }

    get length(){
        return this.heap.length;
    }
}

