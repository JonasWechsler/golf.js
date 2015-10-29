interface Error{
  stack?: string;
}

/*Tools*/
type Quantity = Vector | Point | number;

class Point {
  x: number;
  y: number;
}

class Vector {
  x: number;
  y: number;
  vector: boolean;
  constructor(x, y) {
    this.x = x;
    this.y = y;
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
  distanceTo(v: Vector) {
    var dx = v.x - this.x;
    var dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  plus(v: Quantity) {
    var x = this.x;
    var y = this.y;
    if (v instanceof Vector) {
      x += v.x;
      y += v.y;
    } else if(typeof v === "number"){
      x += v;
      y += v;
    } else {
      var error = new Error("<" + JSON.stringify(v) + "> + <" + this.x + ", " + this.y + ">");
      error.message += error.stack;
      throw error;
    }
    return new Vector(x, y);
  }
  plusEquals(v: Quantity) {
    if (v instanceof Vector) {
      this.x += v.x;
      this.y += v.y;
    } else if (typeof v === "number") {
      this.x += v;
      this.y += v;
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

class VectorMath {
  static intersectBallBall(ball0, ball1) {
    if (ball0.position.distanceTo(ball1) < ball0.r + ball1.r) {
      return true;
    }
    return false;
  }

  static project(a:Vector, b:Vector) {
    return a.dot(b.unit());
  }

  static projectVector(a:Vector, b:Vector) {
    return b.unit().timesEquals(VectorMath.project(a, b));
  }
}

function rint(max: number) {
  return Math.floor(max * Math.random());
}