var Point = (function () {
    function Point() {
    }
    return Point;
})();
var Vector = (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
        this.vector = true;
    }
    Vector.prototype.clone = function () {
        return new Vector(this.x, this.y);
    };
    Vector.prototype.equals = function (v) {
        return (this.x - v.x) < .0001 && (this.y - v.y) < .0001;
    };
    Vector.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vector.prototype.distanceTo = function (v) {
        var dx = v.x - this.x;
        var dy = v.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    Vector.prototype.plus = function (v) {
        var x = this.x;
        var y = this.y;
        if (typeof v === "Vector") {
            x += v.x;
            y += v.y;
        }
        else if (!isNaN(parseFloat(v)) && isFinite(v)) {
            x += v;
            y += v;
        }
        else {
            throw "<" + v + "> + <" + this.x + ", " + this.y + ">";
        }
        return new Vector(x, y);
    };
    Vector.prototype.plusEquals = function (v) {
        if (typeof v === "Vector") {
            this.x += v.x;
            this.y += v.y;
        }
        else if (!isNaN(parseFloat(v)) && isFinite(v)) {
            this.x += v;
            this.y += v;
        }
        else {
            throw "Error: <" + v + "> + <" + this.x + ", " + this.y + "> is not valid";
        }
        return this;
    };
    Vector.prototype.times = function (scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    };
    Vector.prototype.timesEquals = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    };
    Vector.prototype.minus = function (v) {
        if (typeof v === "Vector")
            return this.plus(v.times(-1));
        else
            return this.plus(v * -1);
    };
    Vector.prototype.minusEquals = function (v) {
        if (typeof v === "Vector")
            return this.plusEquals(v.times(-1));
        else
            return this.plusEquals(v * -1);
    };
    Vector.prototype.divided = function (scalar) {
        return this.times(1 / scalar);
    };
    Vector.prototype.dividedEquals = function (scalar) {
        return this.timesEquals(1 / scalar);
    };
    Vector.prototype.dot = function (vector) {
        return this.x * vector.x + this.y * vector.y;
    };
    Vector.prototype.unit = function () {
        if (this.length() == 0) {
            return new Vector(0, 0);
        }
        return this.clone().divided(this.length());
    };
    Vector.prototype.unitTimes = function (scalar) {
        if (this.length() == 0) {
            return new Vector(0, 0);
        }
        return this.dividedEquals(this.length()).timesEquals(scalar);
    };
    Vector.prototype.rotate = function (angle, pivot) {
        var s = Math.sin(angle), c = Math.cos(angle), v = this.clone(), p = pivot.clone();
        v.x -= p.x;
        v.y -= p.y;
        var xnew = v.x * c - v.y * s;
        var ynew = v.x * s + v.y * c;
        v.x = xnew + p.x;
        v.y = ynew + p.y;
        return v;
    };
    return Vector;
})();
var VectorMath = (function () {
    function VectorMath() {
    }
    VectorMath.intersectBallBall = function (ball0, ball1) {
        if (ball0.position.distanceTo(ball1) < ball0.r + ball1.r) {
            return true;
        }
        return false;
    };
    VectorMath.project = function (a, b) {
        return a.dot(b.unit());
    };
    VectorMath.projectVector = function (a, b) {
        return b.unit().timesEquals(VectorMath.project(a, b));
    };
    return VectorMath;
})();
function rint(max) {
    return Math.floor(max * Math.random());
}
