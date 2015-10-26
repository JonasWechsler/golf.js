/*Tools*/
function Vector(x, y) {
  this.x = x;
  this.y = y;
  this.vector = true;
  this.clone = function() {
    return new Vector(this.x, this.y);
  }
  this.equals = function(v){
    return (this.x - v.x) < .0001 && (this.y - v.y) < .0001;
  }
  this.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  this.distanceTo = function(v){
    var dx = v.x - this.x;
    var dy = v.y - this.y;
    return Math.sqrt(dx*dx+dy*dy);
  }
  this.plus = function(v) {  
    var x = this.x;
    var y = this.y;
    if ((v.x && v.y) || v.x === 0 || v.y === 0) {
      x += v.x;
      y += v.y;
    } else if (!isNaN(parseFloat(v)) && isFinite(v)) {
      x += v;
      y += v;
    } else {
      throw "<" + v + "> + <" + this.x + ", " + this.y + ">";
    }
    return new Vector(x, y);
  }
  this.plusEquals = function(v){
    if ((v.x && v.y) || v.x === 0 || v.y === 0) {
      this.x += v.x;
      this.y += v.y;
    } else if (!isNaN(parseFloat(v)) && isFinite(v)) {
      this.x += v;
      this.y += v;
    } else {
      throw "Error: <" + v + "> + <" + this.x + ", " + this.y + "> is not valid";
    }
    return this;
  }
  this.times = function(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }
  this.timesEquals = function(scalar){
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  this.minus = function(v) {
    if (v.x || v.x === 0)
      return this.plus(v.times(-1));
    else
      return this.plus(v * -1);

  }
  this.minusEquals = function(v){
    if (v.x || v.x === 0)
      return this.plusEquals(v.times(-1));
    else
      return this.plusEquals(v * -1);
  }
  this.divided = function(scalar) {
    return this.times(1 / scalar);
  }
  this.dividedEquals = function(scalar){
    return this.timesEquals(1 / scalar);
  }
  this.dot = function(vector) {
    return this.x * vector.x + this.y * vector.y;
  }
  this.unit = function() {
    if(this.length()==0){
      return new Vector(0,0);
    }
    return this.clone().divided(this.length());
  }
  this.unitTimes = function(scalar){
    if(this.length()==0){
      return new Vector(0,0);
    }
    return this.dividedEquals(this.length()).timesEquals(scalar);
  }
  /**
  *
  */
  this.rotate = function(angle,pivot){
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

function VectorMath(){}

VectorMath.intersectSegBall = function(seg, ball) {
  //http://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
    var d = seg.v1.minus(seg.v0),
      f = seg.v0.minus(ball.position),
      a = d.dot(d),
      b = 2 * f.dot(d),
      c = f.dot(f) - ball.r * ball.r;

    var discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      // no intersection
    } else {
      discriminant = Math.sqrt(discriminant);
      var t1 = (-b - discriminant) / (2 * a),
        t2 = (-b + discriminant) / (2 * a);
      if (t1 >= 0 && t1 <= 1) {
        return true;
      }
      if (t2 >= 0 && t2 <= 1) {
        return true;
      }
      return false;
    }
}

VectorMath.intersectBallBall = function(ball0,ball1){
  if(ball.position.distanceTo(ball1)<ball0.r + ball1.r){
    return true;
  }
  return false;
}

VectorMath.project = function(a,b){
  return a.dot(b.unit());
}

VectorMath.projectVector = function(a,b){
  return b.unit().timesEquals(VectorMath.project(a,b));
}

function rint(max){
  return Math.floor(max*Math.random());
}