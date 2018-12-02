const VECTOR_EPS = 1.19e-07;

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
  constructor(x:number|Vector3, y?:number) {
    if(y !== undefined){
      super(x as number,y)
    }else{
      const v = x as Vector3;
      super(v.x, v.y);
    }
    this.vector = true;
  }
  clone() {
    return new Vector(this.x, this.y);
  }
  equals(v: Vector) {
    return Math.abs(this.x - v.x) < VECTOR_EPS && Math.abs(this.y - v.y) < VECTOR_EPS;
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
      var error = new Error("<" + JSON.stringify(v) + "> += <" + this.x + ", " + this.y + ">");
      error.message += error.stack;
      throw error;
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
    if (v instanceof Vector){
      return this.plus(v.times(-1));
    }else if(typeof v === "number"){
      return this.plus(v * -1);
    }else{
      var error = new Error("<" + JSON.stringify(v) + "> - <" + this.x + ", " + this.y + ">");
      error.message += error.stack;
      throw error;
    }
  }
  minusEquals(v: Quantity) {
    if (v instanceof Vector)
      return this.plusEquals(v.times(-1));
    else if(typeof v === "number")
      return this.plusEquals(v * -1);
    else{
      var error = new Error("<" + JSON.stringify(v) + "> -= <" + this.x + ", " + this.y + ">");
      error.message += error.stack;
      throw error;
    }
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
  to_string(){
    return "<" + this.x + "," + this.y + ">";
  }
}

class Point3 {
    constructor(public x:number,
                public y:number,
                public z:number){}

}

class Vector3 extends Point3{
    constructor(x:number|Vector, y:number, z?:number){
        if(z !== undefined){
            super(x as number, y, z);
        }else{
            const v = x as Vector;
            super(v.x, v.y, y);
        }
    }

    clone():Vector3{
        return new Vector3(this.x, this.y, this.z);
    }

    equals(v: Vector3):boolean{
        return Math.abs(this.x - v.x) < VECTOR_EPS &&
            Math.abs(this.y - v.y) < VECTOR_EPS &&
            Math.abs(this.z - v.z) < VECTOR_EPS;
    }

    length():number{
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    distanceToSquared(v: Vector3):number{
        const dx = v.x - this.x;
        const dy = v.y - this.y;
        const dz = v.z - this.z;
        return dx * dx + dy * dy + dz * dz;
    }

    distanceTo(v:Vector3):number{
        return Math.sqrt(this.distanceToSquared(v));
    }

    column():Matrix{
        return new Matrix([[this.x],[this.y],[this.z]]);
    }

    row():Matrix{
        return new Matrix([[this.x, this.y, this.z]]);
    }

    plus(v:Vector3):Vector3{
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
}

class Matrix{
    public array:number[][];
    constructor(N:number|number[][], M:number = undefined){
        if(M === undefined){
            this.array = N as number[][];
            return;
        }
        this.array = [];
        for(let i=0;i<N;i++){
            this.array[i] = [];
            for(let j=0;j<M;j++){
                this.array[i][j] = 0;
            }
        }
    }
    size():[number, number]{
        return [this.array.length, this.array[0].length];
    }
    times(m:Matrix):Matrix{
        if(m.size()[0] != this.size()[1])
            throw "Array size mismatch";
        const N = this.size()[0];
        const M = this.size()[1];
        const P = m.size()[1];
        const C = new Matrix(N, P);
        for(let i=0;i<N;i++){
            for(let j=0;j<P;j++){
                for(let k=0;k<M;k++){
                    C.array[i][j] += this.array[i][k] * m.array[k][j];
                }
            }
        }
        return C;
    }
}

class Mat3 extends Matrix{
    constructor(A?:number[][]){
        if(A) super(A);
        else super(3,3);
    }
    times(m:Mat3):Mat3{
        return new Mat3(super.times(m).array);
    }
    timesVector(v:Vector3):Vector3{
        const result = super.times(v.column()).array;
        return new Vector3(result[0][0], result[1][0], result[2][0]);
    }
    inverse():Mat3{
		// computes the inverse of a matrix m
		const det:number = this.array[0][0] * (this.array[1][1] * this.array[2][2] - this.array[2][1] * this.array[1][2]) -
		  	 this.array[0][1] * (this.array[1][0] * this.array[2][2] - this.array[1][2] * this.array[2][0]) +
		  	 this.array[0][2] * (this.array[1][0] * this.array[2][1] - this.array[1][1] * this.array[2][0]);

		const idet:number = 1 / det;

		const R:Mat3 = new Mat3(); // inverse of matrix m
		R.array[0][0] = (this.array[1][1] * this.array[2][2] - this.array[2][1] * this.array[1][2]) * idet;
		R.array[0][1] = (this.array[0][2] * this.array[2][1] - this.array[0][1] * this.array[2][2]) * idet;
		R.array[0][2] = (this.array[0][1] * this.array[1][2] - this.array[0][2] * this.array[1][1]) * idet;
		R.array[1][0] = (this.array[1][2] * this.array[2][0] - this.array[1][0] * this.array[2][2]) * idet;
		R.array[1][1] = (this.array[0][0] * this.array[2][2] - this.array[0][2] * this.array[2][0]) * idet;
		R.array[1][2] = (this.array[1][0] * this.array[0][2] - this.array[0][0] * this.array[1][2]) * idet;
		R.array[2][0] = (this.array[1][0] * this.array[2][1] - this.array[2][0] * this.array[1][1]) * idet;
		R.array[2][1] = (this.array[2][0] * this.array[0][1] - this.array[0][0] * this.array[2][1]) * idet;
		R.array[2][2] = (this.array[0][0] * this.array[1][1] - this.array[1][0] * this.array[0][1]) * idet;
        return R;
    }
}

class Mat3Transform{
    static rotate(radians:number):Mat3{
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        return new Mat3([[cos, -sin, 0],
                        [sin, cos, 0],
                        [0, 0, 1]]);
    }
    
    static identity():Mat3{
        return new Mat3([[1,0,0],[0,1,0],[0,0,1]]);
    }

    static scale(x:number, y:number):Mat3{
        return new Mat3([[x, 0, 0], [0, y, 0], [0, 0, 1]]);
    }

    static translate(x:number, y:number):Mat3{
        return new Mat3([[1, 0, x], [0, 1, y], [0, 0, 1]]);
    }
}
