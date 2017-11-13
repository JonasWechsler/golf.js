var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function assert(b) {
    if (!b)
        throw "Assert failed!";
}
function cantorPairing(x, y) {
    var px = (x >= 0) ? x * 2 : -x * 2 - 1;
    var py = (y >= 0) ? y * 2 : -y * 2 - 1;
    return .5 * (px + py) * (px + py + 1) + py;
}
function disableImageSmoothing(context) {
    var ctx = context;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
}
function enableImageSmoothing(context) {
    var ctx = context;
    ctx.mozImageSmoothingEnabled = true;
    ctx.webkitImageSmoothingEnabled = true;
    ctx.msImageSmoothingEnabled = true;
    ctx.imageSmoothingEnabled = true;
}
function combinations(arr) {
    var fn = function (active, rest, result) {
        if (active.length == 0 && rest.length == 0)
            return result;
        if (rest.length == 0) {
            result.push(active);
        }
        else {
            var t = active.slice(0);
            t.push(rest[0]);
            fn(t, rest.slice(1), result);
            fn(active, rest.slice(1), result);
        }
        return result;
    };
    return fn([], arr, []);
}
var NumberTreeMapNode = (function () {
    function NumberTreeMapNode() {
        this.children = {};
    }
    return NumberTreeMapNode;
}());
var NumberTreeMap = (function () {
    function NumberTreeMap() {
        this.root = new NumberTreeMapNode();
    }
    NumberTreeMap.prototype.insert = function (key, value) {
        key.sort();
        var curr = this.root;
        for (var idx = 0; idx < key.length; idx++) {
            if (!curr.children[key[idx]]) {
                curr.children[key[idx]] = new NumberTreeMapNode();
            }
            curr = curr.children[key[idx]];
        }
        curr.value = value;
    };
    NumberTreeMap.prototype.get = function (key) {
        key.sort();
        var curr = this.root;
        for (var idx = 0; idx < key.length; idx++) {
            var val = key[idx];
            if (curr.children[val]) {
                curr = curr.children[val];
            }
            else {
                return undefined;
            }
        }
        return curr.value;
    };
    return NumberTreeMap;
}());
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Vector = (function (_super) {
    __extends(Vector, _super);
    /**
    *
    */
    function Vector(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.vector = true;
        return _this;
    }
    Vector.prototype.clone = function () {
        return new Vector(this.x, this.y);
    };
    Vector.prototype.equals = function (v) {
        return Math.abs(this.x - v.x) < .0001 && Math.abs(this.y - v.y) < .0001;
    };
    Vector.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vector.prototype.distanceToSquared = function (v) {
        var dx = v.x - this.x;
        var dy = v.y - this.y;
        return dx * dx + dy * dy;
    };
    Vector.prototype.distanceTo = function (v) {
        return Math.sqrt(this.distanceToSquared(v));
    };
    Vector.prototype.manhattanDistance = function (v) {
        return Math.abs(v.x - this.x) + Math.abs(v.y - this.y);
    };
    Vector.prototype.plus = function (v) {
        var x = this.x;
        var y = this.y;
        if (v instanceof Vector) {
            x += v.x;
            y += v.y;
        }
        else if (typeof v === "number") {
            x += v;
            y += v;
        }
        else if (v instanceof Array
            && typeof v[0] === "number"
            && typeof v[1] === "number") {
            x += v[0];
            y += v[1];
        }
        else {
            var error = new Error("<" + JSON.stringify(v) + "> + <" + this.x + ", " + this.y + ">");
            error.message += error.stack;
            throw error;
        }
        return new Vector(x, y);
    };
    Vector.prototype.plusEquals = function (v) {
        if (v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        }
        else if (typeof v === "number") {
            this.x += v;
            this.y += v;
        }
        else if (v instanceof Array
            && typeof v[0] === "number"
            && typeof v[1] === "number") {
            this.x += v[0];
            this.y += v[1];
        }
        else {
            throw "Error: <" + JSON.stringify(v) + "> + <" + this.x + ", " + this.y + "> is not valid";
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
        if (v instanceof Vector)
            return this.plus(v.times(-1));
        else if (typeof v === "number")
            return this.plus(v * -1);
        else
            throw "<" + JSON.stringify(v) + "> * <" + this.x + ", " + this.y + "> is not valid";
    };
    Vector.prototype.minusEquals = function (v) {
        if (v instanceof Vector)
            return this.plusEquals(v.times(-1));
        else if (typeof v === "number")
            return this.plusEquals(v * -1);
        else
            throw "<" + this.x + ", " + this.y + "> -= <" + JSON.stringify(v) + "> is not valid";
    };
    Vector.prototype.divided = function (scalar) {
        return this.times(1 / scalar);
    };
    Vector.prototype.dividedEquals = function (scalar) {
        return this.timesEquals(1 / scalar);
    };
    Vector.prototype.apply = function (fun) {
        return new Vector(fun(this.x), fun(this.y));
    };
    Vector.prototype.applyEquals = function (fun) {
        this.x = fun(this.x);
        this.y = fun(this.y);
        return this;
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
    Vector.prototype.clampTo = function (max) {
        if (this.length() > max) {
            return this.unit().times(max);
        }
        return this;
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
}(Point));
var LineSegment = (function () {
    function LineSegment(v0, v1) {
        this.v0 = v0;
        this.v1 = v1;
    }
    LineSegment.prototype.bounding_box = function () {
        var l = Math.min(this.v0.x, this.v1.x);
        var t = Math.min(this.v0.y, this.v1.y);
        var w = Math.max(this.v0.x, this.v1.x) - l;
        var h = Math.max(this.v0.y, this.v1.y) - t;
        return new Square(l, t, w, h);
    };
    return LineSegment;
}());
var Ball = (function () {
    function Ball(position, r) {
        if (r <= 0) {
            throw "Radius should be number > 0";
        }
        this.position = position;
        this.r = r;
    }
    Ball.prototype.bounding_box = function () {
        var l = this.position.x - this.r;
        var t = this.position.y - this.r;
        var w = this.r * 2;
        return new Square(l, t, w, w);
    };
    return Ball;
}());
var VectorMath = (function () {
    function VectorMath() {
    }
    VectorMath.intersectBallBall = function (ball0, ball1) {
        if (ball0.position.distanceTo(ball1) < ball0.r + ball1.r) {
            return true;
        }
        return false;
    };
    VectorMath.projectScalar = function (a, b) {
        return a.dot(b.unit());
    };
    VectorMath.projectVector = function (a, b) {
        return b.unit().timesEquals(VectorMath.projectScalar(a, b));
    };
    return VectorMath;
}());
function randomInt(max) {
    return Math.floor(max * Math.random());
}
var VectorMap = (function () {
    function VectorMap() {
        this.struc = [];
    }
    VectorMap.prototype.map = function (p, val) {
        if (!this.struc[p.x]) {
            this.struc[p.x] = [];
        }
        this.struc[p.x][p.y] = val;
    };
    VectorMap.prototype.unmap = function (p) {
        if (!this.has(p))
            return;
        this.struc[p.x][p.y] = undefined;
    };
    VectorMap.prototype.has = function (p) {
        if (!this.struc[p.x]) {
            return false;
        }
        return this.struc[p.x][p.y] ? true : false;
    };
    VectorMap.prototype.at = function (p) {
        if (!this.has(p))
            return undefined;
        return this.struc[p.x][p.y];
    };
    VectorMap.prototype.spread = function () {
        var result = [];
        for (var x in this.struc) {
            for (var y in this.struc[x]) {
                result.push(new Vector(parseInt(x), parseInt(y)));
            }
        }
        return result;
    };
    return VectorMap;
}());
var VectorSet = (function () {
    function VectorSet() {
        this.struc = new VectorMap();
    }
    VectorSet.prototype.add = function (p) {
        this.struc.map(p, true);
    };
    VectorSet.prototype.remove = function (p) {
        this.struc.unmap(p);
    };
    VectorSet.prototype.has = function (p) {
        return this.struc.has(p);
    };
    return VectorSet;
}());
var Square = (function () {
    function Square(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
    Square.prototype.contains = function (vector) {
        return (vector.x > this.left && vector.x < this.left + this.width) &&
            (vector.y > this.top && vector.y < this.top + this.height);
    };
    Square.prototype.contains_line_entirely = function (line) {
        return this.contains(line.v0) && this.contains(line.v1);
    };
    Square.prototype.contains_line_partially = function (line) {
        return this.contains(line.v0) || this.contains(line.v1);
    };
    Square.prototype.intersects = function (sq) {
        if (this.left > sq.left + sq.width || sq.left > this.left + this.width)
            return false;
        if (this.top > sq.top + sq.height || sq.top > this.top + this.height)
            return false;
        return true;
    };
    return Square;
}());
var Color = (function () {
    function Color(r, g, b) {
        if (g === void 0) { g = undefined; }
        if (b === void 0) { b = undefined; }
        this.g = g;
        this.b = b;
        if (g == undefined) {
            this.set_str(r);
        }
        else {
            this.r = r;
        }
    }
    /* accepts parameters
     *  h  Object = {h:x, s:y, v:z}
     *   OR
     *  * h, s, v
     *  */
    Color.prototype.set_hsv = function (h, s, v) {
        if (h < 0 || h >= 1 || s < 0 || s >= 1 || v < 0 || v >= 1) {
            throw "0 <= h,s,v < 1";
        }
        var r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        this.r = Math.round(r * 255);
        this.g = Math.round(g * 255);
        this.b = Math.round(b * 255);
    };
    Color.prototype.to_str = function () {
        if (this.r < 0 || this.r > 255 ||
            this.g < 0 || this.g > 255 ||
            this.b < 0 || this.b > 255) {
            throw "0 <= r,g,b <= 255";
        }
        return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    };
    Color.prototype.set_str = function (hex) {
        if (hex.charAt(0) == '#') {
            this.set_str(hex.substring(1));
            return;
        }
        var parse_byte = function (x) { return new Number("0x" + x); };
        this.r = parse_byte(hex.substring(0, 2));
        this.g = parse_byte(hex.substring(2, 2));
        this.b = parse_byte(hex.substring(4, 2));
    };
    Color.prototype.times = function (x) {
        var r = Math.round(this.r * x);
        var g = Math.round(this.g * x);
        var b = Math.round(this.b * x);
        return new Color(r, g, b);
    };
    Color.prototype.plus = function (color) {
        var r = this.r + color.r;
        var g = this.g + color.g;
        var b = this.b + color.b;
        return new Color(r, g, b);
    };
    Color.prototype.minus = function (color) {
        return this.plus(color.times(-1));
    };
    return Color;
}());
var CanvasCache = (function () {
    function CanvasCache(CANVAS_WIDTH) {
        if (CANVAS_WIDTH === void 0) { CANVAS_WIDTH = CanvasCache.DEFAULT_CANVAS_WIDTH; }
        this.CANVAS_WIDTH = CANVAS_WIDTH;
        this.cache = new VectorMap();
    }
    CanvasCache.prototype.mod = function (a, b) {
        return ((a % b) + b) % b;
    };
    CanvasCache.prototype.draw_image = function (canvas, position) {
        var p = position.divided(this.CANVAS_WIDTH).apply(Math.floor);
        var dimensions = new Vector(canvas.width, canvas.height).divided(this.CANVAS_WIDTH).apply(Math.ceil);
        for (var i = 0; i < dimensions.x + 1; i++) {
            for (var j = 0; j < dimensions.y + 1; j++) {
                var left = position.x - (p.x + i) * this.CANVAS_WIDTH;
                var top_1 = position.y - (p.y + j) * this.CANVAS_WIDTH;
                var idx = new Vector(p.x + i, p.y + j);
                if (!this.cache.has(idx)) {
                    var new_canvas = document.createElement("canvas");
                    new_canvas.width = this.CANVAS_WIDTH;
                    new_canvas.height = this.CANVAS_WIDTH;
                    this.cache.map(idx, new_canvas);
                }
                this.cache.at(idx).getContext("2d").drawImage(canvas, left, top_1);
            }
        }
    };
    CanvasCache.prototype.get_image = function (view) {
        var result = document.createElement("canvas");
        result.width = view.width;
        result.height = view.height;
        var ctx = result.getContext("2d");
        var position = new Vector(view.left, view.top).divided(this.CANVAS_WIDTH).apply(Math.floor);
        var dimensions = new Vector(view.width, view.height).divided(this.CANVAS_WIDTH).apply(Math.ceil);
        for (var i = 0; i < dimensions.x + 1; i++) {
            for (var j = 0; j < dimensions.y + 1; j++) {
                var left = i * this.CANVAS_WIDTH - this.mod(view.left, this.CANVAS_WIDTH);
                var top_2 = j * this.CANVAS_WIDTH - this.mod(view.top, this.CANVAS_WIDTH);
                var idx = new Vector(position.x + i, position.y + j);
                var img = this.cache.at(idx);
                if (!img)
                    continue;
                ctx.drawImage(img, left, top_2);
            }
        }
        return result;
    };
    return CanvasCache;
}());
CanvasCache.DEFAULT_CANVAS_WIDTH = 512; //TODO If this is 500, draw_image bugs out on images of size 512*16
var Perlin2D = (function () {
    function Perlin2D(width, persistence, iterations, frequency) {
        this.width = width;
        this.persistence = persistence;
        this.iterations = iterations;
        this.frequency = frequency;
        if (persistence <= 0 || persistence >= 1) {
            throw "0<p<1";
        }
    }
    Perlin2D.generate = function () {
        return new Perlin2D(Perlin2D.WIDTH, Perlin2D.PERSISTENCE, Perlin2D.ITERATIONS, Perlin2D.FREQUENCY).generate();
    };
    Perlin2D.lfill_interp = function (f00, f10, f01, f11, x, y) {
        return f00;
    };
    Perlin2D.linear_interp = function (f00, f10, f01, f11, x, y) {
        var a00 = f00;
        var a10 = f10 - f00;
        var a01 = f01 - f00;
        var a11 = f11 + f00 - (f10 + f01);
        return a00 + a10 * x + a01 * y + a11 * x * y;
    };
    Perlin2D.prototype.generate_function = function (amplitude, frequency) {
        var map = [];
        for (var i = 0; i < frequency; i++) {
            map[i] = [];
            for (var j = 0; j < frequency; j++) {
                map[i][j] = Math.random() * amplitude;
            }
        }
        return map;
    };
    Perlin2D.prototype.generate_perlin = function (amplitude, frequency) {
        var layers = [];
        var max = 0;
        for (var i = 0; i < this.iterations; i++) {
            layers[i] = this.generate_function(amplitude, frequency);
            max += amplitude;
            amplitude *= this.persistence;
            frequency /= this.persistence;
        }
        var map = [];
        for (var x = 0; x < this.width; x++) {
            map[x] = [];
            for (var y = 0; y < this.width; y++) {
                map[x][y] = 0;
                /*Iterate through layers*/
                for (var it = 0; it < this.iterations; it++) {
                    /*Iterate through layer*/
                    var left = Math.floor((layers[it].length - 1) * x / this.width);
                    var top_3 = Math.floor((layers[it][0].length - 1) * y / this.width);
                    if (!layers[it][left + 1] || !layers[it][left][top_3 + 1]) {
                        continue;
                    }
                    var f00 = layers[it][left][top_3];
                    var f10 = layers[it][left + 1][top_3];
                    var f01 = layers[it][left][top_3 + 1];
                    var f11 = layers[it][left + 1][top_3 + 1];
                    var square_width = this.width * 1 / (layers[it].length - 1);
                    map[x][y] += Perlin2D.INTERPOLATION(f00, f10, f01, f11, (x % square_width) / square_width, (y % square_width) / square_width) / max;
                }
            }
        }
        return map;
    };
    Perlin2D.prototype.generate = function () {
        return this.generate_perlin(1, this.frequency);
    };
    return Perlin2D;
}());
Perlin2D.DEFAULT_WIDTH = 256;
Perlin2D.DEFAULT_PERSISTENCE = 0.25;
Perlin2D.DEFAULT_ITERATIONS = 5;
Perlin2D.DEFAULT_FREQUENCY = 10;
Perlin2D.WIDTH = Perlin2D.DEFAULT_WIDTH;
Perlin2D.PERSISTENCE = Perlin2D.DEFAULT_PERSISTENCE;
Perlin2D.ITERATIONS = Perlin2D.DEFAULT_ITERATIONS;
Perlin2D.FREQUENCY = Perlin2D.DEFAULT_FREQUENCY;
Perlin2D.INTERPOLATION = Perlin2D.linear_interp;
var MarbleTexture = (function () {
    function MarbleTexture(WIDTH) {
        this.WIDTH = WIDTH;
        this.PERIOD = 4;
        this.COLOR0 = new Color(150, 130, 130);
        this.COLOR1 = new Color(228, 203, 170);
    }
    MarbleTexture.prototype.marble = function (x, y, v) {
        var xP = this.PERIOD / this.WIDTH;
        var yP = this.PERIOD / this.WIDTH;
        var turbPower = 2.5;
        var turbSize = 4.0;
        var xy = x * xP + y * yP + turbPower * v;
        var sine = Math.abs(Math.sin(xy * Math.PI));
        return sine;
    };
    MarbleTexture.prototype.generate = function () {
        Perlin2D.WIDTH = this.WIDTH;
        var perlin = Perlin2D.generate();
        var texture_canvas = document.createElement("canvas");
        texture_canvas.width = this.WIDTH * 4;
        texture_canvas.height = this.WIDTH * 4;
        var texture = texture_canvas.getContext("2d");
        for (var i = 0; i < perlin.length; i++) {
            for (var j = 0; j < perlin[i].length; j++) {
                var rgbv = this.marble(i, j, perlin[i][j]);
                var color = this.COLOR0.times(1 - rgbv).plus(this.COLOR1.times(rgbv));
                texture.fillStyle = color.to_str();
                texture.fillRect(i * 4, j * 4, 4, 4);
            }
        }
        return texture_canvas;
    };
    return MarbleTexture;
}());
var SandTexture = (function () {
    function SandTexture(WIDTH) {
        this.WIDTH = WIDTH;
        this.SCHEME = [
            ["#565656", 0.2],
            ["#6e5457", 0.1],
            ["#6D5051", 0.025],
            ["#834B5F", 0.025],
            ["#A98978", 0.025],
            ["#A7705A", 0.025],
            ["#B88968", 0.0375],
            ["#82694A", 0.0125],
            ["#A98978", 0.0375],
            ["#B88968", 0.025],
            ["#B88968", 0.1],
            ["#A37B5F", 0.1],
            ["#C8B998", 0.2]
        ];
    }
    SandTexture.prototype.color0 = function (height, intensity) {
        var sum = 0;
        for (var i = 0; i < this.SCHEME.length; i++) {
            var tuple = this.SCHEME[i];
            var name_1 = tuple[0];
            var percent = tuple[1];
            sum += percent;
            if (height < sum) {
                return name_1;
            }
        }
    };
    SandTexture.prototype.generate = function () {
        Perlin2D.WIDTH = this.WIDTH;
        var height = Perlin2D.generate();
        var intensity = Perlin2D.generate();
        var texture_canvas = document.createElement("canvas");
        texture_canvas.width = this.WIDTH;
        texture_canvas.height = this.WIDTH;
        var texture = texture_canvas.getContext("2d");
        for (var i = 0; i < height.length; i++) {
            for (var j = 0; j < height[i].length; j++) {
                texture.fillStyle = this.color0(height[i][j], intensity[i][j]);
                texture.fillRect(i, j, 1, 1);
                texture.fillStyle = "rgba(0, 0, 0, " + Math.random() * .05 + ")";
                texture.fillRect(i, j, 1, 1);
            }
        }
        return texture_canvas;
    };
    return SandTexture;
}());
var FloorTextureComponent = (function () {
    function FloorTextureComponent(texture) {
        this.texture = texture;
        this.type = ComponentType.FloorTexture;
    }
    return FloorTextureComponent;
}());
var ComponentType;
(function (ComponentType) {
    ComponentType[ComponentType["DynamicPhysics"] = 0] = "DynamicPhysics";
    ComponentType[ComponentType["StaticPhysics"] = 1] = "StaticPhysics";
    ComponentType[ComponentType["Projectile"] = 2] = "Projectile";
    ComponentType[ComponentType["Timer"] = 3] = "Timer";
    ComponentType[ComponentType["Health"] = 4] = "Health";
    ComponentType[ComponentType["DynamicRender"] = 5] = "DynamicRender";
    ComponentType[ComponentType["StaticRender"] = 6] = "StaticRender";
    ComponentType[ComponentType["UI"] = 7] = "UI";
    ComponentType[ComponentType["Camera"] = 8] = "Camera";
    ComponentType[ComponentType["FPS"] = 9] = "FPS";
    ComponentType[ComponentType["KeyInput"] = 10] = "KeyInput";
    ComponentType[ComponentType["WorldCell"] = 11] = "WorldCell";
    ComponentType[ComponentType["Dungeon"] = 12] = "Dungeon";
    ComponentType[ComponentType["FloorTexture"] = 13] = "FloorTexture";
})(ComponentType || (ComponentType = {}));
var HealthComponent = (function () {
    function HealthComponent(amount) {
        this.amount = amount;
        this.type = ComponentType.Health;
    }
    return HealthComponent;
}());
var ECSEntity = (function () {
    function ECSEntity() {
        this.components = [];
        this.component_types = {};
    }
    ECSEntity.prototype.add_component = function (c) {
        if (this.component_types[c.type]) {
            throw "Already have component of type " + c.type;
        }
        this.component_types[c.type] = c;
        this.components.push(c);
    };
    ECSEntity.prototype.has_component = function (type) {
        return this.component_types[type] ? true : false;
    };
    ECSEntity.prototype.get_component = function (type) {
        return this.component_types[type];
    };
    ECSEntity.prototype.get_components = function () {
        return this.components;
    };
    return ECSEntity;
}());
var EntityManager = (function () {
    function EntityManager() {
        this.entities = new NumberTreeMap();
        EntityManager.current = this;
    }
    EntityManager.prototype.add_entity = function (e) {
        var _this = this;
        var types = [];
        e.get_components().forEach(function (c) { return types.push(c.type); });
        combinations(types).forEach(function (arr) {
            var entry = _this.entities.get(arr);
            if (entry) {
                entry.push(e);
            }
            else {
                _this.entities.insert(arr, [e]);
            }
        });
    };
    EntityManager.prototype.remove_entity = function (e) {
        var _this = this;
        var types = [];
        e.get_components().forEach(function (c) { return types.push(c.type); });
        combinations(types).forEach(function (arr) {
            var entry = _this.entities.get(arr);
            var idx = entry.indexOf(e);
            assert(idx != -1);
            entry.splice(idx, 1);
        });
    };
    EntityManager.prototype.get_entities = function (types) {
        return this.entities.get(types);
    };
    return EntityManager;
}());
var SystemManager = (function () {
    function SystemManager(entity_manager) {
        this.entity_manager = entity_manager;
        this.systems = [];
    }
    SystemManager.prototype.add = function (system) {
        this.systems.push(system);
    };
    SystemManager.frame = function (self) {
        self.systems.forEach(function (system) {
            system.step(self.entity_manager);
        });
        window.requestAnimationFrame(function () { return SystemManager.frame(self); });
    };
    SystemManager.prototype.start = function () {
        var _this = this;
        window.requestAnimationFrame(function () { return SystemManager.frame(_this); });
    };
    return SystemManager;
}());
var ControlSystem = (function () {
    function ControlSystem() {
    }
    ControlSystem.prototype.step = function () {
        var entities = EntityManager.current.get_entities([ComponentType.KeyInput, ComponentType.DynamicPhysics]);
        entities.forEach(function (entity) {
            var dynamic = entity.get_component(ComponentType.DynamicPhysics);
            var keys = entity.get_component(ComponentType.KeyInput);
            var speed = new Vector(0, 0);
            speed.x -= keys.left ? 2 : 0;
            speed.x += keys.right ? 2 : 0;
            speed.y -= keys.up ? 2 : 0;
            speed.y += keys.down ? 2 : 0;
            dynamic.speed = speed;
        });
    };
    return ControlSystem;
}());
/*interface Killable{
    damage(amt: number);
    get_health():number;
    get_max_health():number;
}

class Projectile extends Physics.DynamicBall{
    constructor(position:Vector, radius:number, speed:Vector){
        super(position, radius, speed);
    }
    oncontact(object:Physics.PhysicsObject){
        if(object instanceof Projectile)
            return;
        WorldInfo.physics.removeDynamic(this);
    }
}

class Entity extends Physics.DynamicBall implements Killable, RenderObject{
    private MAX_HEALTH : number = 5;
    private health : number = this.MAX_HEALTH;
    private renderer : Leech;

    constructor(p: Vector, r: number, speed:Vector){
        super(p, r, speed);
        this.renderer = new Leech(p, 10);
    }

    draw(ctx:CanvasRenderingContext2D){
        this.renderer.move_to(this.position);
        this.renderer.draw(ctx);
    }

    damage(amt: number){
        this.health -= amt;
    }

    get_health():number{
        return this.health;
    }

    get_max_health():number{
        return this.MAX_HEALTH;
    }

    oncontact(object:Physics.PhysicsObject){
        if(object instanceof Projectile){
            this.damage(1);
        }
    }
}

class Player extends Entity implements Killable, MouseListener{
    private keyHandler : KeyHandler = new KeyHandler(document);

    constructor(position:Vector, radius:number, speed:Vector){
        super(position, radius, speed);
        MouseInfo.add_listener(this);
    }

    onclick (x : number, y : number, which : number) : void{}
    ondown (x : number, y : number, which : number) :void{
        const mouse = CameraSystem.screen_to_camera(x, y);
        const speed:Vector = mouse.minus(this.position).unitTimes(20);
        const position:Vector = this.position.clone().plus(this.speed).plus(speed);
        const radius:number = 2;
        const projectile:Projectile = new Projectile(position, radius, speed);
        WorldInfo.physics.addDynamic(projectile);
    }
    onup (x : number, y : number, which : number) : void{}
    onmove (x: number, y: number) : void {}

    execute(){
        const A = this.keyHandler.isDown('A');
        const D = this.keyHandler.isDown('D');
        const S = this.keyHandler.isDown('S');
        const W = this.keyHandler.isDown('W');
        const F = this.keyHandler.isDown('F');

        let ddx = 0, ddy = 0;

        if(A && !D){
            ddx = -1;
        }else if(D && !A){
            ddx = 1;
        }else{
            ddx = 0;
        }

        if (S && !W) {
            ddy = 1;
        }else if (W && !S) {
            ddy = -1;
        }else{
            ddy = 0;
        }
        this.speed = new Vector(ddx, ddy).unit().times(2);
    }
}

interface AIState{
    weight(pt:Vector):number;
}

class NullState implements AIState{
    weight(pt:Vector):number{
        return 0;
    }
}

class IsolationState implements AIState{
    weight(pt:Vector):number{
        const player = WorldInfo.player.position;
        if(WorldInfo.physics.lineOfSight(new LineSegment(pt, player))){
            return 0;
        }else{
            return pt.distanceToSquared(player);
        }
    }
}

class AI extends Entity implements RenderObject{
    public path : Vector[];
    public state : AIState = new IsolationState();

    constructor(p:Vector, r:number, s:Vector){
        super(p, r, s);
        this.path = [p];

    }

    update_path(){
        const options:[number, Vector][] = [];
        const self = this;
        WorldInfo.mesh.neighbors(this.target(), 7).forEach(
            (pt:Vector) => {
                const weight = self.state.weight(pt);
                options.push([weight, pt]);
            }
        );
        options.sort((a, b) => b[0] - a[0]);
        const objective = options[0][1];

        //BFS
        const successor:VectorMap<Vector> = new VectorMap<Vector>();
        const touched:VectorSet = new VectorSet();
        const queue:Vector[] = [];

        touched.add(this.target());
        queue.push(this.target());

        while(queue.length !== 0){
            const current = queue.shift();

            if(current.equals(objective)){
                break;
            }

            WorldInfo.mesh.adjacent(current).forEach(
                (n:Vector) => {
                    if(touched.has(n))
                        return;
                    touched.add(n);
                    successor.map(n, current);
                    queue.push(n);
                }
            );
        }

        const path = [];
        for(let i=objective;i!==this.target();i=successor.at(i)){
            if(!i)break;
            path.push(i);
        }
        path.push(this.target());
        this.path = path;
    }

    target() : Vector{
        return this.path[this.path.length-1];
    }

    objective() : Vector{
        return this.path[0];
    }
    
    change_state(){

    }

    execute(){
        this.update_path();

        const objective = this.target();
        
        const d = objective.minus(this.position);
        this.speed = d.clampTo(1);

        if(this.position.distanceTo(objective) < 1)
            if(this.path.length > 1) this.path.pop();
            else this.change_state();
    }
}*/
/*Game time*/
var Material = (function () {
    function Material(friction, bounce, color) {
        this.friction = friction;
        this.bounce = bounce;
        this.color = color;
    }
    return Material;
}());
var StaticPhysicsComponent = (function (_super) {
    __extends(StaticPhysicsComponent, _super);
    function StaticPhysicsComponent(v0, v1, material) {
        if (material === void 0) { material = StaticPhysicsComponent.DEFAULT_MATERIAL; }
        var _this = _super.call(this, v0, v1) || this;
        _this.type = ComponentType.StaticPhysics;
        _this.material = material;
        return _this;
    }
    return StaticPhysicsComponent;
}(LineSegment));
StaticPhysicsComponent.DEFAULT_MATERIAL = new Material(0.01, 0, new Color("black"));
var DynamicPhysicsComponent = (function (_super) {
    __extends(DynamicPhysicsComponent, _super);
    function DynamicPhysicsComponent(position, r, speed) {
        if (speed === void 0) { speed = new Vector(0, 0); }
        var _this = _super.call(this, position, r) || this;
        _this.type = ComponentType.DynamicPhysics;
        _this.speed = speed;
        return _this;
    }
    return DynamicPhysicsComponent;
}(Ball));
var ProjectileComponent = (function () {
    function ProjectileComponent(damage) {
        this.damage = damage;
        this.type = ComponentType.Projectile;
    }
    return ProjectileComponent;
}());
var PhysicsSystem = (function () {
    function PhysicsSystem() {
    }
    PhysicsSystem.polygon = function (x, y, r, numSides) {
        var sides = [];
        var last_theta = (1 - 1 / numSides) * Math.PI * 2, last_x0 = Math.cos(last_theta) * r, last_y0 = Math.sin(last_theta) * r;
        for (var i = 0; i < numSides; i++) {
            var theta = (i / numSides) * Math.PI * 2;
            var x0 = Math.cos(theta) * r;
            var y0 = Math.sin(theta) * r;
            sides.push(new LineSegment(new Vector(last_x0, last_y0), new Vector(x0, y0)));
            last_theta = theta;
            last_x0 = x0;
            last_y0 = y0;
        }
        return sides;
    };
    PhysicsSystem.prototype.lineOfSight = function (segment) {
        var statics = EntityManager.current.get_entities([ComponentType.StaticPhysics]);
        for (var i = 0; i < statics.length; i++) {
            var stat_seg = statics[i].get_component(ComponentType.StaticPhysics);
            if (PhysicsSystem.intersectSegSeg(segment, stat_seg)) {
                return false;
            }
        }
        return true;
    };
    PhysicsSystem.prototype.lineOfSightDistance = function (segment, distance) {
        var statics = EntityManager.current.get_entities([ComponentType.StaticPhysics]);
        for (var i = 0; i < statics.length; i++) {
            var stat_seg = statics[i].get_component(ComponentType.DynamicPhysics);
            if (PhysicsSystem.intersectSegSegDist(segment, stat_seg, distance)) {
                return false;
            }
        }
        return true;
    };
    PhysicsSystem.prototype.stepDynamics = function () {
        var dynamics = EntityManager.current.get_entities([ComponentType.DynamicPhysics]);
        dynamics.forEach(function (entity) {
            var dynamic = entity.get_component(ComponentType.DynamicPhysics);
            dynamic.speed = dynamic.speed.clampTo(dynamic.r);
            dynamic.position.plusEquals(dynamic.speed);
        });
    };
    PhysicsSystem.prototype.resolveCollision = function (dynamic, stat) {
        var self = this;
        var v0 = stat.v0;
        var v1 = stat.v1;
        var originStatic = v1.minus(v0);
        var originDynamic = dynamic.position.minus(v0);
        var projectedScalar = VectorMath.projectScalar(originDynamic, originStatic);
        var projectedVector = v0.plus(originStatic.unit().times(projectedScalar));
        var overlap = dynamic.r - dynamic.position.distanceTo(projectedVector);
        if (overlap > dynamic.r)
            return;
        var overlapVector = projectedVector.minus(dynamic.position).unitTimes(overlap);
        if (overlapVector.x * -originStatic.y + overlapVector.y * originStatic.x < 0) {
            return;
        }
        var projectedSpeed = VectorMath.projectScalar(dynamic.speed, originStatic);
        var projectedSpeedVector = VectorMath.projectVector(dynamic.speed, originStatic);
        var rejectedSpeedVector = dynamic.speed.minus(projectedSpeedVector);
        if (!overlapVector.unit().equals(rejectedSpeedVector.unit()))
            return;
        var perpendicularComponent = Math.sqrt(dynamic.speed.length() * dynamic.speed.length() - projectedSpeed * projectedSpeed);
        if (dynamic.speed.length() > 1 || stat.material.bounce >= 1) {
            dynamic.speed = projectedSpeedVector.plus(rejectedSpeedVector.timesEquals(-1 * stat.material.bounce));
        }
        dynamic.position = dynamic.position.minus(overlapVector);
        dynamic.speed.timesEquals(1 - stat.material.friction);
    };
    PhysicsSystem.prototype.processBall = function (ball_entity) {
        if (!ball_entity.has_component(ComponentType.DynamicPhysics)) {
            throw "Entity must have DynamicPhysics component";
        }
        var ball = ball_entity.get_component(ComponentType.DynamicPhysics);
        var statics = EntityManager.current.get_entities([ComponentType.StaticPhysics]);
        var dynamics = EntityManager.current.get_entities([ComponentType.DynamicPhysics]);
        var self = this;
        statics.forEach(function (entity) {
            var stat = entity.get_component(ComponentType.StaticPhysics);
            var collision = PhysicsSystem.intersectSegBall(stat, ball);
            if (collision) {
                self.resolveCollision(ball, stat);
                if (ball_entity.has_component(ComponentType.Projectile)) {
                    EntityManager.current.remove_entity(ball_entity);
                }
            }
        });
        dynamics.forEach(function (entity) {
            var dynamic = entity.get_component(ComponentType.DynamicPhysics);
            if (dynamic == ball)
                return;
            if (ball_entity.has_component(ComponentType.Projectile) && entity.has_component(ComponentType.Health)) {
                var dmg = ball_entity.get_component(ComponentType.Projectile).damage;
                entity.get_component(ComponentType.Health).amount -= dmg;
            }
            if (entity.has_component(ComponentType.Projectile) && ball_entity.has_component(ComponentType.Health)) {
                var dmg = ball_entity.get_component(ComponentType.Projectile).damage;
                entity.get_component(ComponentType.Health).amount -= dmg;
            }
        });
    };
    PhysicsSystem.prototype.processDynamics = function () {
        var self = this;
        var dynamics = EntityManager.current.get_entities([ComponentType.DynamicPhysics]);
        dynamics.forEach(function (entity) { return self.processBall(entity); });
    };
    PhysicsSystem.prototype.step = function () {
        /**
         * 1 move all dynamics according to level rules. This includes momentum, friction, and other forces
         * 2 check for dynamic on static collisions
         * 3 move all fixeds according to their specific rules.
         */
        this.stepDynamics();
        this.processDynamics();
    };
    PhysicsSystem.intersectSegBall = function (seg, ball) {
        if (!ball.bounding_box().intersects(seg.bounding_box()))
            return false;
        //http://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
        var d = seg.v1.minus(seg.v0), f = seg.v0.minus(ball.position), a = d.dot(d), b = 2 * f.dot(d), c = f.dot(f) - ball.r * ball.r;
        var discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            // no intersection
            return false;
        }
        else {
            discriminant = Math.sqrt(discriminant);
            var t1 = (-b - discriminant) / (2 * a), t2 = (-b + discriminant) / (2 * a);
            if (t1 >= 0 && t1 <= 1) {
                return true;
            }
            if (t2 >= 0 && t2 <= 1) {
                return true;
            }
            return false;
        }
    };
    /** Returns true iff seg0 and seg1 are within distance of each other.
     *
     */
    PhysicsSystem.intersectSegSegDist = function (seg0, seg1, distance) {
        if (PhysicsSystem.intersectSegBall(seg0, new Ball(seg1.v0, distance)))
            return true;
        if (PhysicsSystem.intersectSegBall(seg0, new Ball(seg1.v1, distance)))
            return true;
        if (PhysicsSystem.intersectSegBall(seg1, new Ball(seg0.v0, distance)))
            return true;
        if (PhysicsSystem.intersectSegBall(seg1, new Ball(seg0.v1, distance)))
            return true;
        if (PhysicsSystem.intersectSegSeg(seg0, seg1))
            return true;
        return false;
    };
    PhysicsSystem.intersectBallBall = function (ball0, ball1) {
        return (ball0.r + ball1.r) * (ball0.r + ball1.r) > ball0.position.distanceToSquared(ball1.position);
    };
    PhysicsSystem.onSeg = function (seg, q) {
        //http://www.cdn.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
        var p = seg.v0;
        var r = seg.v1;
        if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
            return true;
        return false;
    };
    PhysicsSystem.orientation = function (p, q, r) {
        var val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);
        if (val === 0)
            return 0;
        return (val > 0) ? 1 : 2;
    };
    PhysicsSystem.intersectSegSeg = function (seg0, seg1) {
        var o1 = PhysicsSystem.orientation(seg0.v0, seg0.v1, seg1.v0);
        var o2 = PhysicsSystem.orientation(seg0.v0, seg0.v1, seg1.v1);
        var o3 = PhysicsSystem.orientation(seg1.v0, seg1.v1, seg0.v0);
        var o4 = PhysicsSystem.orientation(seg1.v0, seg1.v1, seg0.v1);
        if (o1 !== o2 && o3 !== o4)
            return true;
        if (o1 == 0 && PhysicsSystem.onSeg(seg0, seg1.v0))
            return true;
        if (o2 == 0 && PhysicsSystem.onSeg(seg0, seg1.v1))
            return true;
        if (o1 == 0 && PhysicsSystem.onSeg(seg1, seg0.v0))
            return true;
        if (o1 == 0 && PhysicsSystem.onSeg(seg1, seg0.v1))
            return true;
        return false;
    };
    return PhysicsSystem;
}());
var NavigationMesh = (function () {
    function NavigationMesh() {
        this.neighbor_cache = new VectorMap();
    }
    NavigationMesh.prototype.neighbors = function (p, depth) {
        if (!this.adjacent(p))
            throw "Not a part of navigation mesh: " + p;
        var result = new VectorMap();
        var self = this;
        var queue = [[p, depth]];
        var _loop_1 = function () {
            var q = queue.shift();
            var x = q[0].x, y = q[0].y, d = q[1];
            if (d == 0)
                return "continue";
            if (result.has(q[0]) && result.at(q[0]) <= d)
                return "continue";
            result.map(q[0], d);
            this_1.adjacent(q[0]).forEach(function (adj) {
                queue.push([adj, d - 1]);
            });
        };
        var this_1 = this;
        while (queue.length) {
            _loop_1();
        }
        return result.spread();
    };
    NavigationMesh.prototype.draw = function (ctx) {
        var self = this;
        ctx.beginPath();
        this.get_vertices().forEach(function (v) {
            self.adjacent(v).forEach(function (w) {
                ctx.moveTo(v.x, v.y);
                ctx.lineTo(w.x, w.y);
            });
        });
        ctx.stroke();
    };
    return NavigationMesh;
}());
var FiniteGridNavigationMesh = (function (_super) {
    __extends(FiniteGridNavigationMesh, _super);
    function FiniteGridNavigationMesh(cell_width, min_x, max_x, min_y, max_y) {
        var _this = _super.call(this) || this;
        _this.cell_width = cell_width;
        _this.min_x = min_x;
        _this.max_x = max_x;
        _this.min_y = min_y;
        _this.max_y = max_y;
        _this.vertices = [];
        for (var i = min_x; i < max_x; i += cell_width) {
            for (var j = min_y; j < max_y; j += cell_width) {
                _this.vertices.push(new Vector(i, j));
            }
        }
        return _this;
    }
    FiniteGridNavigationMesh.prototype.get_vertices = function () {
        return this.vertices;
    };
    FiniteGridNavigationMesh.prototype.adjacent = function (p) {
        if (!(p.x % this.cell_width === 0 && p.y % this.cell_width === 0)) {
            return [];
        }
        var result = [];
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                var x = p.x + i * this.cell_width;
                var y = p.y + j * this.cell_width;
                if (x < this.min_x || x > this.max_x || y < this.min_y || y > this.max_y)
                    continue;
                result.push(new Vector(x, y));
            }
        }
        return result;
    };
    return FiniteGridNavigationMesh;
}(NavigationMesh));
var NonintersectingFiniteGridNavigationMesh = (function (_super) {
    __extends(NonintersectingFiniteGridNavigationMesh, _super);
    function NonintersectingFiniteGridNavigationMesh(cell_width, min_x, max_x, min_y, max_y, physics) {
        var _this = _super.call(this) || this;
        _this.cell_width = cell_width;
        _this.min_x = min_x;
        _this.max_x = max_x;
        _this.min_y = min_y;
        _this.max_y = max_y;
        _this.physics = physics;
        _this.vertices = [];
        _this.adjacent_map = new VectorMap();
        var mesh = new FiniteGridNavigationMesh(cell_width, min_x, max_x, min_y, max_y);
        var self = _this;
        mesh.get_vertices().forEach(function (vertex) {
            self.vertices.push(vertex);
            self.adjacent_map.map(vertex, []);
            mesh.adjacent(vertex).forEach(function (adjacent) {
                if (adjacent.x < min_x || adjacent.x >= max_x ||
                    adjacent.y < min_y || adjacent.y >= max_y)
                    return;
                if (!physics.lineOfSightDistance(new LineSegment(vertex, adjacent), 10))
                    return;
                self.adjacent_map.at(vertex).push(adjacent);
            });
        });
        return _this;
    }
    NonintersectingFiniteGridNavigationMesh.prototype.adjacent = function (p) {
        return this.adjacent_map.at(p);
    };
    NonintersectingFiniteGridNavigationMesh.prototype.get_vertices = function () {
        return this.vertices;
    };
    return NonintersectingFiniteGridNavigationMesh;
}(NavigationMesh));
/*
let Mouse:Vector = new Vector(0, 0);
document.onmousemove = function (e) {
  Mouse = new Vector(e.pageX, e.pageY);
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);

const mesh = new FiniteGridNavigationMesh(10, 0, 500, 0, 500);
console.log(mesh.neighbors(new Vector(70, 70), 5));
const obstacle = new Circle(new Vector(80, 80), 20);
const children: Vector[] = [
  new Vector(100, 70),
  new Vector(100, 80),
  new Vector(100, 90),
  new Vector(100, 100),
  new Vector(90, 100),
  new Vector(80, 100),
  new Vector(70, 100)
];

const pts: VectorSet = new VectorSet();
setInterval(function () {
  const px = Math.round(Mouse.x / 10) * 10;
  const py = Math.round(Mouse.y / 10) * 10;

  children.forEach(function (child, idx) {
    const options = [];
    if (!intersect(child, [px, py], obstacle)) {
      mesh.neighbors(child, 5).forEach(function (pt) {
        const dx = pt.x - obstacle.center.x;
        const dy = pt.y - obstacle.center.y;
        const d = dx * dx + dy * dy;
        if (intersect(pt, [px, py], obstacle) && d > obstacle.radius * obstacle.radius && !pts.has(pt)) {
          options.push([d, pt]);
        }
      });
    }
    console.log(JSON.stringify(options));
    options.sort(function (a, b) {
      return a[0] - b[0];
    });
    if (options.length) {
      pts.remove(children[idx]);
      pts.add(options[0][1]);
      children[idx] = options[0][1];
    }
  });


    console.log(children);

  ctx.clearRect(0, 0, 500, 500);
  ctx.beginPath();
  ctx.arc(obstacle.center.x, obstacle.center.y, obstacle.radius,0,2*Math.PI);
  ctx.stroke();

  const DEBUG = false;
  
  children.forEach(function (child) {
    if (DEBUG) {
      if (intersect(child, [px, py], obstacle)) {
        ctx.strokeStyle = "red";
      } else {
        ctx.strokeStyle = "blue";
      }
      ctx.beginPath();
      ctx.moveTo(child.x, child.y);
      ctx.lineTo(px, py);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(child.x, child.y, 5,0,2*Math.PI);
    ctx.stroke();

    if (DEBUG) {
      mesh.neighbors(child, 5).forEach(function (pt) {
        if (!intersect(pt, [px, py], obstacle)) {
          ctx.strokeStyle = "green";
        } else {
          ctx.strokeStyle = "purple";
        }
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
        ctx.stroke();
      });
    }
  });
  ctx.strokeStyle = "black";

  ctx.beginPath();
  ctx.arc(px, py, 5,0,2*Math.PI);
  ctx.stroke();
}, 10);

*/
var DOMManager = (function () {
    function DOMManager() {
    }
    DOMManager.make_canvas = function () {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext('2d');
    };
    DOMManager.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    return DOMManager;
}());
var DynamicRenderComponent = (function () {
    function DynamicRenderComponent(x, y, content) {
        this.x = x;
        this.y = y;
        this.content = content;
        this.type = ComponentType.DynamicRender;
    }
    return DynamicRenderComponent;
}());
var StaticRenderComponent = (function () {
    function StaticRenderComponent(x, y, content) {
        this.x = x;
        this.y = y;
        this.content = content;
        this.type = ComponentType.StaticRender;
    }
    return StaticRenderComponent;
}());
var UIComponent = (function () {
    function UIComponent(x, y, content) {
        this.x = x;
        this.y = y;
        this.content = content;
        this.type = ComponentType.UI;
    }
    return UIComponent;
}());
var TimerComponent = (function () {
    function TimerComponent(time) {
        this.time = time;
        this.type = ComponentType.Timer;
    }
    return TimerComponent;
}());
var FPSComponent = (function () {
    function FPSComponent() {
        this.type = ComponentType.FPS;
        this.last_time = Date.now();
        this.fps = [];
    }
    return FPSComponent;
}());
var FPSSystem = (function () {
    function FPSSystem() {
    }
    FPSSystem.prototype.step = function (e) {
        var entities = e.get_entities([ComponentType.FPS]);
        var time = Date.now();
        entities.forEach(function (entity) {
            var fps = entity.get_component(ComponentType.FPS);
            var dt = time - fps.last_time;
            fps.last_time = time;
            fps.fps.push(Math.floor(1000 / dt));
        });
        var output = e.get_entities([ComponentType.FPS, ComponentType.UI]);
        output.forEach(function (entity) {
            var fps = entity.get_component(ComponentType.FPS);
            if (fps.fps.length < 100) {
                return;
            }
            var ui = entity.get_component(ComponentType.UI);
            var canvas = ui.content;
            canvas.width = 100;
            canvas.height = 100;
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, 100, 100);
            var avg = 0;
            fps.fps.forEach(function (v) { return avg += v; });
            avg = Math.floor(avg / fps.fps.length);
            fps.fps = [];
            var str = "000" + avg.toString();
            ctx.fillText(str.substr(str.length - 3, 3), 0, 100);
        });
    };
    return FPSSystem;
}());
var UIRenderSystem = (function () {
    function UIRenderSystem() {
    }
    UIRenderSystem.prototype.step = function (entity_manager) {
        var targets = entity_manager.get_entities([ComponentType.UI]);
        DOMManager.clear();
        targets.forEach(function (entity) {
            var ui = entity.get_component(ComponentType.UI);
            DOMManager.context.drawImage(ui.content, ui.x, ui.y);
        });
    };
    return UIRenderSystem;
}());
var TimeSystem = (function () {
    function TimeSystem() {
    }
    TimeSystem.prototype.step = function (entity_manager) {
        var targets = entity_manager.get_entities([ComponentType.Timer]);
        targets.forEach(function (entity) {
            var timer = entity.get_component(ComponentType.Timer);
            timer.time++;
        });
    };
    return TimeSystem;
}());
var Connection = (function () {
    function Connection(joint, length) {
        this.joint = joint;
        this.length = length;
    }
    return Connection;
}());
var Joint = (function () {
    function Joint(x, y) {
        this.x = x;
        this.y = y;
        this.adjacent = [];
        this.mark = false;
    }
    Joint.prototype.add_adjacent = function (joint) {
        var dx = this.x - joint.x;
        var dy = this.y - joint.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        this.adjacent.push(new Connection(joint, distance));
        joint.adjacent.push(new Connection(joint, distance));
    };
    Joint.prototype.move = function (x, y) {
        this.mark = true;
        this.x += x;
        this.y += y;
        var self = this;
        this.adjacent.forEach(function (connection) {
            if (connection.joint.mark)
                return;
            var dx = self.x - connection.joint.x;
            var dy = self.y - connection.joint.y;
            var d = connection.length;
            var di = Math.sqrt(dx * dx + dy * dy);
            if (di > d) {
                var c = (di - d) / di;
                connection.joint.move(dx * c, dy * c);
            }
        });
        this.mark = false;
    };
    return Joint;
}());
var Leech = (function () {
    function Leech(position, parts) {
        this.joints = [];
        for (var i = 0; i < 10; i++)
            this.joints.push(new Joint(position.x - i * 5, position.y));
        for (var i = 0; i < this.joints.length - 1; i++) {
            this.joints[i].add_adjacent(this.joints[i + 1]);
        }
    }
    Leech.prototype.move_to = function (position) {
        this.joints[0].move(position.x - this.joints[0].x, position.y - this.joints[0].y);
    };
    Leech.prototype.draw_line = function (points, context) {
        for (var i = 0; i + 2 < points.length; i++) {
            var w = 20 - 20 * i / points.length;
            var p = points[i];
            var q = points[i + 1];
            var r = points[i + 2];
            var x0 = (p.x + q.x) / 2;
            var y0 = (p.y + q.y) / 2;
            var x1 = (q.x + r.x) / 2;
            var y1 = (q.y + r.y) / 2;
            context.beginPath();
            context.lineCap = "round";
            context.lineWidth = w;
            context.moveTo(x0, y0);
            context.quadraticCurveTo(q.x, q.y, x1, y1);
            context.stroke();
        }
    };
    Leech.prototype.draw = function (ctx) {
        this.draw_line(this.joints, ctx);
    };
    return Leech;
}());
var CameraComponent = (function () {
    function CameraComponent() {
        this.type = ComponentType.Camera;
        this.target = function () { return new Vector(0, 0); };
    }
    return CameraComponent;
}());
var CameraSystem = (function () {
    function CameraSystem() {
        this.canvas_cache = new CanvasCache();
        this.render_statics();
    }
    CameraSystem.camera_info = function () {
        var targets = EntityManager.current.get_entities([ComponentType.UI, ComponentType.Camera]);
        assert(targets.length == 1);
        var target = targets[0];
        var ui = target.get_component(ComponentType.UI);
        var camera = target.get_component(ComponentType.Camera);
        var width = DOMManager.canvas.width;
        var height = DOMManager.canvas.height;
        var left, top;
        if (camera.target) {
            left = camera.target().x - width / 2;
            top = camera.target().y - height / 2;
        }
        else {
            var left_norm = (width - MouseInfo.x()) / width;
            var top_norm = MouseInfo.y() / height;
            var shift_width = ui.content.width - width;
            var shift_height = ui.content.height - height;
            left = left_norm * shift_width;
            top = top_norm * shift_height;
        }
        return new Square(left, top, width, height);
    };
    CameraSystem.screen_to_camera = function (x, y) {
        var entity_manager = EntityManager.current;
        var targets = entity_manager.get_entities([ComponentType.UI, ComponentType.Camera]);
        assert(targets.length == 1);
        var target = targets[0];
        var ui = target.get_component(ComponentType.UI);
        var cam = target.get_component(ComponentType.Camera);
        var info = this.camera_info();
        return new Vector((x / DOMManager.canvas.width) * info.width + info.left, (y / DOMManager.canvas.height) * info.height + info.top);
    };
    CameraSystem.prototype.render_statics = function () {
        var _this = this;
        var visible_statics = EntityManager.current.get_entities([ComponentType.StaticRender]);
        visible_statics.forEach(function (entity) {
            var render_component = entity.get_component(ComponentType.StaticRender);
            _this.canvas_cache.draw_image(render_component.content, new Vector(render_component.x, render_component.y));
        });
    };
    CameraSystem.prototype.step = function () {
        var entity_manager = EntityManager.current;
        var targets = entity_manager.get_entities([ComponentType.UI, ComponentType.Camera]);
        assert(targets.length == 1);
        var target = targets[0];
        var ui = target.get_component(ComponentType.UI);
        var cam = target.get_component(ComponentType.Camera);
        var content = document.createElement("canvas");
        var ctx = content.getContext("2d");
        var info = CameraSystem.camera_info();
        content.width = info.width;
        content.height = info.height;
        //Draw statics from a cache
        var static_cache = this.canvas_cache.get_image(info);
        assert(static_cache.width == info.width);
        assert(static_cache.height == info.height);
        ctx.drawImage(static_cache, 0, 0);
        //Draw dynamic entities
        var visible_entities = entity_manager.get_entities([ComponentType.DynamicRender]);
        ctx.translate(-info.left, -info.top);
        visible_entities.forEach(function (entity) {
            var render_component = entity.get_component(ComponentType.DynamicRender);
            var bb = new Square(render_component.x, render_component.y, render_component.content.width, render_component.content.height);
            if (info.intersects(bb))
                ctx.drawImage(render_component.content, render_component.x, render_component.y);
        });
        ctx.translate(info.left, info.top);
        ui.content = content;
        ui.x = 0;
        ui.y = 0;
    };
    return CameraSystem;
}());
var AbstractItem = (function () {
    function AbstractItem() {
        this.ID = 0;
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.width = 32;
        this.canvas.height = 32;
        this.context.fillStyle = "#ccc";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "#222";
        this.context.font = "10px Georgia";
        var instance = this.constructor;
        this.context.fillText(instance.name, 0, this.canvas.height / 2);
    }
    AbstractItem.prototype.drop = function () {
        this.deselect();
        Inventory.current().drop(this);
    };
    AbstractItem.prototype.select = function () { };
    AbstractItem.prototype.deselect = function () { };
    AbstractItem.prototype.use = function () { };
    AbstractItem.prototype.icon = function () {
        return this.canvas;
    };
    return AbstractItem;
}());
var AbstractExpendable = (function (_super) {
    __extends(AbstractExpendable, _super);
    function AbstractExpendable(count) {
        var _this = _super.call(this) || this;
        _this.count = 1;
        _this.count = count;
        return _this;
    }
    AbstractExpendable.prototype.pick_up = function (count) {
        this.count += count;
    };
    AbstractExpendable.prototype.use = function () {
        this.count--;
        if (this.count <= 0) {
            this.drop();
        }
    };
    return AbstractExpendable;
}(AbstractItem));
var Inventory = (function () {
    function Inventory() {
        this.items = [];
        this.current = 0;
        this.MAX_SIZE = 10;
        for (var i = 0; i < this.MAX_SIZE; i++) {
            this.items.push(new AbstractItem());
        }
    }
    Inventory.current = function () {
        return undefined;
    };
    Inventory.prototype.select = function (current) {
        if (current < 0 || current >= this.MAX_SIZE) {
            throw "Input Mismatch Exception";
        }
        this.items[this.current].deselect();
        this.current = current;
        this.items[this.current].select();
    };
    Inventory.prototype.use = function () {
        this.items[this.current].use();
    };
    Inventory.prototype.add = function (item) {
        for (var idx = 0; idx < this.MAX_SIZE; idx++) {
            if (this.items[idx].ID == item.ID
                && this.items[idx] instanceof AbstractExpendable
                && item instanceof AbstractExpendable) {
                var inventory = this.items[idx];
                var addition = item;
                inventory.pick_up(addition.count);
                return;
            }
            if (this.items[idx].ID == 0) {
                this.items[idx] = item;
                this.items[this.current].select();
                return;
            }
        }
        throw "Inventory Full Exception";
    };
    Inventory.prototype.drop = function (dropped) {
        var self = this;
        this.items.forEach(function (item, idx) {
            if (item == dropped) {
                self.items[idx] = new AbstractItem();
            }
        });
    };
    Inventory.prototype.draw = function (context) {
        var margin = 4;
        var width = 32;
        var self = this;
        disableImageSmoothing(context);
        this.items.forEach(function (item, idx) {
            var x = idx * (width + margin * 2) + margin * 2;
            var y = margin * 2;
            var img = item.icon();
            if (idx == self.current) {
                context.fillStyle = "orange";
                context.fillRect(x - margin, y - margin, width + 2 * margin, width + 2 * margin);
            }
            context.drawImage(img, 0, 0, img.width, img.height, x, y, 32, 32);
        });
        enableImageSmoothing(context);
    };
    return Inventory;
}());
var WorldGenerators;
(function (WorldGenerators) {
    var PerlinPerlinGenerator = (function () {
        function PerlinPerlinGenerator(height) {
            this.height = height;
            this.maximum_resolution = 6;
            this.minimum_resolution = 1;
            this.low_wavelength = 1000;
            this.high_wavelength = 1500;
            this.DEFAULT_SEED = 1;
            this.seed = this.DEFAULT_SEED;
            this.initial_seed = this.seed;
            this.interpolate = new WorldGenerators.PerlinGenerator(1);
            this.persistance = new WorldGenerators.PerlinGenerator(.2);
            this.wavelength = new WorldGenerators.PerlinGenerator(1);
            this.perlin = new WorldGenerators.PerlinGenerator(height);
            this.interpolate.setMaxWavelength(4000);
            this.interpolate.setMaximumResolution(4);
            this.interpolate.setPersistance(.4);
            this.interpolate.setInterpolation(1);
            this.persistance.setMaxWavelength(4000);
            this.persistance.setMaximumResolution(4);
            this.persistance.setPersistance(.4);
            this.persistance.setInterpolation(1);
            this.wavelength.setMaxWavelength(4000);
            this.wavelength.setMaximumResolution(4);
            this.wavelength.setPersistance(.4);
            this.wavelength.setInterpolation(1);
            this.interpolate.setSeed(new Date().getHours());
            this.persistance.setSeed(new Date().getSeconds());
            this.wavelength.setSeed(new Date().getMinutes());
        }
        PerlinPerlinGenerator.prototype.getHeightAt = function (x) {
            var persistance = .3 + Math.abs(this.persistance.getHeightAt(x));
            var interpolate = Math.abs(this.interpolate.getHeightAt(x));
            var low_wavelength_value = this.perlin.generate_perlin_with_parameters(x, this.minimum_resolution, this.maximum_resolution, this.low_wavelength, persistance, interpolate, this.height);
            var high_wavelength_value = this.perlin.generate_perlin_with_parameters(x, this.minimum_resolution, this.maximum_resolution, this.high_wavelength, persistance, interpolate, this.height);
            var wavelength_coef = Math.abs(this.wavelength.getHeightAt(x));
            return low_wavelength_value * (1 - wavelength_coef) + high_wavelength_value * wavelength_coef;
        };
        return PerlinPerlinGenerator;
    }());
    WorldGenerators.PerlinPerlinGenerator = PerlinPerlinGenerator;
    var PerlinGenerator = (function () {
        function PerlinGenerator(height) {
            this.height = height;
            this.maximum_resolution = 6;
            this.minimum_resolution = 1;
            this.perlin_smoothness = .99;
            this.persistance = .45;
            this.interpolate = 1;
            this.max_wavelength = 1000;
            this.DEFAULT_SEED = 1;
            this.seed = this.DEFAULT_SEED;
            this.initial_seed = this.seed;
            this.init(height);
        }
        PerlinGenerator.prototype.init = function (height) {
            this.heights = {};
            this.x = 0;
            this.max_x = 1;
            this.min_x = -1;
            this.left_perlin_subgraph = [];
            this.right_perlin_subgraph = [];
            var y = 0;
            for (var idx = this.minimum_resolution; idx < this.maximum_resolution; idx++) {
                var frequency = Math.pow(2, idx), wavelength = Math.floor(this.max_wavelength / frequency);
                if (wavelength == 0)
                    continue;
                var amplitude = Math.pow(this.persistance, idx);
                this.left_perlin_subgraph[idx] = {};
                this.left_perlin_subgraph[idx].value = amplitude / 2;
                this.left_perlin_subgraph[idx].wavelength = wavelength;
                this.right_perlin_subgraph[idx] = {};
                this.right_perlin_subgraph[idx].value = amplitude / 2;
                this.right_perlin_subgraph[idx].wavelength = wavelength;
                y += amplitude / 2;
            }
            this.heights[-1] = y;
            this.heights[0] = y;
            this.heights[1] = y;
        };
        PerlinGenerator.prototype.getSeed = function () {
            return this.seed;
        };
        PerlinGenerator.prototype.getInitialSeed = function () {
            return this.initial_seed;
        };
        PerlinGenerator.prototype.random = function () {
            var x = Math.sin(this.seed++) * 10000;
            return x - Math.floor(x);
        };
        PerlinGenerator.prototype.no_interpolate = function (a, b, x) {
            return a;
        };
        PerlinGenerator.prototype.linear_interpolate = function (a, b, x) {
            return a * (1 - x) + b * x;
        };
        PerlinGenerator.prototype.cosine_interpolate = function (a, b, x) {
            var pi = x * Math.PI;
            var f = (1 - Math.cos(pi)) * .5;
            return a * (1 - f) + b * f;
        };
        PerlinGenerator.prototype.smooth = function (a, b, c) {
            return ((a + c) / 2 * this.perlin_smoothness) + (b * (1 - this.perlin_smoothness));
        };
        PerlinGenerator.prototype.generate_perlin_with_parameters = function (x, minimum_resolution, maximum_resolution, max_wavelength, persistance, interpolate, height) {
            if (x < this.min_x - 1) {
                this.generate_perlin_with_parameters(x + 1, minimum_resolution, maximum_resolution, max_wavelength, persistance, interpolate, height);
            }
            if (x > this.max_x + 1) {
                this.generate_perlin_with_parameters(x - 1, minimum_resolution, maximum_resolution, max_wavelength, persistance, interpolate, height);
            }
            var active_subgraphs = [];
            if (x < this.min_x) {
                this.min_x = x;
                active_subgraphs = this.left_perlin_subgraph;
            }
            else if (x > this.max_x) {
                this.max_x = x;
                active_subgraphs = this.right_perlin_subgraph;
            }
            else {
                return this.heights[x] * height;
            }
            for (var idx = this.minimum_resolution; idx < maximum_resolution; idx++) {
                var frequency = Math.pow(2, idx), wavelength = Math.floor(max_wavelength / frequency);
                if (x % wavelength == 0) {
                    var amplitude = Math.pow(persistance, idx);
                    if (!active_subgraphs[idx])
                        active_subgraphs[idx] = {};
                    active_subgraphs[idx].last_value = active_subgraphs[idx].value;
                    active_subgraphs[idx].value = amplitude * this.random();
                    active_subgraphs[idx].wavelength = wavelength;
                }
            }
            var y = 0;
            var self = this;
            active_subgraphs.forEach(function (val) {
                if (val) {
                    var a = val.last_value;
                    var b = val.value;
                    var i = (x % val.wavelength) / val.wavelength;
                    if (x < 0)
                        i *= -1;
                    if (!a)
                        a = b;
                    y += self.cosine_interpolate(a, b, i) * interpolate + self.linear_interpolate(a, b, i) * (1 - interpolate);
                }
            });
            this.heights[x] = y;
            return this.heights[x] * height;
        };
        PerlinGenerator.prototype.generate_perlin_at = function (x) {
            return this.generate_perlin_with_parameters(x, this.minimum_resolution, this.maximum_resolution, this.max_wavelength, this.persistance, this.interpolate, this.height);
        };
        PerlinGenerator.prototype.getHeightAt = function (x) {
            return this.generate_perlin_at(x);
        };
        PerlinGenerator.prototype.setSeed = function (seed) {
            if (seed < 0) {
                seed = Math.pow(2, 30) + seed;
            }
            this.seed = seed;
            this.initial_seed = seed;
            this.init(this.height);
        };
        PerlinGenerator.prototype.resetSeed = function () {
            this.seed = this.initial_seed;
        };
        PerlinGenerator.prototype.setMaximumResolution = function (val) {
            this.maximum_resolution = val;
            this.resetSeed();
            this.init(this.height);
        };
        PerlinGenerator.prototype.setMinimumResolution = function (val) {
            this.minimum_resolution = val;
            this.resetSeed();
            this.init(this.height);
        };
        PerlinGenerator.prototype.setPerlinSmoothness = function (val) {
            this.perlin_smoothness = val;
            this.resetSeed();
            this.init(this.height);
        };
        PerlinGenerator.prototype.setPersistance = function (val) {
            this.persistance = val;
            this.resetSeed();
            this.init(this.height);
        };
        PerlinGenerator.prototype.setInterpolation = function (val) {
            this.interpolate = val;
            this.resetSeed();
            this.init(this.height);
        };
        PerlinGenerator.prototype.setMaxWavelength = function (val) {
            this.max_wavelength = val;
            this.resetSeed();
            this.init(this.height);
        };
        PerlinGenerator.prototype.randomize = function () {
            this.setInterpolation(Math.random());
            this.setMaxWavelength(Math.random() * 1000 + 500);
            this.setPersistance(Math.random() / 2);
        };
        return PerlinGenerator;
    }());
    WorldGenerators.PerlinGenerator = PerlinGenerator;
})(WorldGenerators || (WorldGenerators = {}));
var DungeonComponent = (function () {
    function DungeonComponent(width, height, left, top, cell_width, cell_height, start, adjacent, main_path, distance_from_start, rooms) {
        if (adjacent === void 0) { adjacent = new VectorMap(); }
        if (main_path === void 0) { main_path = []; }
        if (distance_from_start === void 0) { distance_from_start = new VectorMap(); }
        if (rooms === void 0) { rooms = new VectorMap(); }
        this.width = width;
        this.height = height;
        this.left = left;
        this.top = top;
        this.cell_width = cell_width;
        this.cell_height = cell_height;
        this.start = start;
        this.adjacent = adjacent;
        this.main_path = main_path;
        this.distance_from_start = distance_from_start;
        this.rooms = rooms;
        this.type = ComponentType.Dungeon;
    }
    return DungeonComponent;
}());
var DungeonRenderSystem = (function () {
    function DungeonRenderSystem(render) {
        if (render === void 0) { render = true; }
        if (render)
            this.render_dungeons();
    }
    DungeonRenderSystem.prototype.generate = function (dungeon) {
        dungeon.adjacent = new VectorMap();
        dungeon.main_path = [];
        dungeon.distance_from_start = new VectorMap();
        dungeon.rooms = new VectorMap();
        for (var i = 0; i < dungeon.width; i++)
            for (var j = 0; j < dungeon.height; j++)
                dungeon.adjacent.map(new Vector(i, j), []);
        dungeon.distance_from_start.map(dungeon.start, 1);
        this.add_path(dungeon, dungeon.start, 100);
        this.merge_adjacent(dungeon, 7);
        this.find_rooms(dungeon);
        this.build(dungeon);
    };
    DungeonRenderSystem.prototype.on_border = function (dungeon, v) {
        return v.x == 0 || v.x == dungeon.width - 1 ||
            v.y == 0 || v.y == dungeon.height - 1;
    };
    DungeonRenderSystem.prototype.in_bounds = function (dungeon, v) {
        return v.x >= 0 && v.x < dungeon.width &&
            v.y >= 0 && v.y < dungeon.height;
    };
    DungeonRenderSystem.prototype.open = function (dungeon, v) {
        if (!this.in_bounds(dungeon, v))
            return false;
        return dungeon.adjacent.at(v).length == 0;
    };
    DungeonRenderSystem.prototype.adj = function (v) {
        return [
            new Vector(v.x, v.y - 1),
            new Vector(v.x - 1, v.y),
            new Vector(v.x, v.y + 1),
            new Vector(v.x + 1, v.y)
        ];
    };
    DungeonRenderSystem.prototype.merge_adjacent = function (dungeon, dist) {
        var self = this;
        for (var i = 0; i < dungeon.width; i++) {
            var _loop_2 = function (j) {
                var curr = new Vector(i, j);
                if (self.open(dungeon, curr))
                    return "continue";
                this_2.adj(curr).forEach(function (adj) {
                    if (self.open(dungeon, adj))
                        return;
                    if (!self.in_bounds(dungeon, adj))
                        return;
                    var dist_curr = dungeon.distance_from_start.at(curr);
                    var dist_adj = dungeon.distance_from_start.at(adj);
                    if (Math.abs(dist_curr - dist_adj) < dist) {
                        self.add_adjacent(dungeon, curr, adj);
                    }
                });
            };
            var this_2 = this;
            for (var j = 0; j < dungeon.height; j++) {
                _loop_2(j);
            }
        }
    };
    DungeonRenderSystem.prototype.add_path = function (dungeon, start, length) {
        var self = this;
        var path = [start];
        var _loop_3 = function () {
            var curr = path[path.length - 1];
            var last = path[path.length - 2];
            if (!curr) {
                throw "Nowhere to go ";
            }
            if (last) {
                this_3.add_adjacent(dungeon, curr, last);
                dungeon.distance_from_start.map(curr, path.length
                    + dungeon.distance_from_start.at(start));
            }
            var next = [];
            self.adj(curr).forEach(function (adj) {
                if (self.open(dungeon, adj) && !self.on_border(dungeon, adj))
                    next.push(adj);
            });
            if (next.length == 0)
                path.pop();
            else
                path.push(next[Math.floor(Math.random() * next.length)]);
        };
        var this_3 = this;
        while (path.length < length) {
            _loop_3();
        }
        return path;
    };
    DungeonRenderSystem.prototype.add_adjacent = function (dungeon, next, parent) {
        dungeon.adjacent.at(next).push(parent);
        dungeon.adjacent.at(parent).push(next);
    };
    DungeonRenderSystem.prototype.find_rooms = function (dungeon) {
        var room = 1;
        dungeon.rooms = new VectorMap();
        var Q = [dungeon.start];
        var _loop_4 = function () {
            var q = Q.shift();
            if (dungeon.rooms.has(q))
                return "continue";
            dungeon.rooms.map(q, room);
            var l = false, r = false, t = false, b = false;
            dungeon.adjacent.at(q).forEach(function (adj) {
                if (adj.x == q.x - 1 && adj.y == q.y)
                    l = true;
                if (adj.x == q.x + 1 && adj.y == q.y)
                    r = true;
                if (adj.x == q.x && adj.y == q.y - 1)
                    t = true;
                if (adj.x == q.x && adj.y == q.y + 1)
                    b = true;
                Q.push(adj);
            });
            if ((l && r && !t && !b) || (!l && !r && t && b))
                room++;
        };
        while (Q.length != 0) {
            _loop_4();
        }
    };
    DungeonRenderSystem.prototype.openings = function (dungeon, i, j) {
        var _this = this;
        if (!this.in_bounds(dungeon, new Vector(i, j))) {
            return [true, true, true, true];
        }
        var v = new Vector(i, j);
        var open = [false, false, false, false];
        var NORTH = 0, WEST = 1, SOUTH = 2, EAST = 3;
        if (this.open(dungeon, v)) {
            this.adj(v).forEach(function (adj, idx) {
                open[idx] = _this.open(dungeon, adj) || !_this.in_bounds(dungeon, adj);
            });
        }
        else {
            dungeon.adjacent.at(v).forEach(function (adj) {
                if (adj.x == i - 1 && adj.y == j)
                    open[WEST] = true;
                if (adj.x == i + 1 && adj.y == j)
                    open[EAST] = true;
                if (adj.x == i && adj.y == j - 1)
                    open[NORTH] = true;
                if (adj.x == i && adj.y == j + 1)
                    open[SOUTH] = true;
            });
        }
        return open;
    };
    DungeonRenderSystem.prototype.build = function (dungeon) {
        for (var i = 0; i < dungeon.width; i++) {
            for (var j = 0; j < dungeon.height; j++) {
                var v = new Vector(i, j);
                var open_1 = this.openings(dungeon, i, j);
                var TOP = 0, LEFT = 1, BOTTOM = 2, RIGHT = 3;
                var square_x = dungeon.left + i * dungeon.cell_width;
                var square_y = dungeon.top + j * dungeon.cell_height;
                var square_upper_left = new Vector(square_x, square_y);
                var square_lower_left = new Vector(square_x, square_y + dungeon.cell_height);
                var square_upper_right = new Vector(square_x + dungeon.cell_width, square_y);
                var square_lower_right = new Vector(square_x + dungeon.cell_width, square_y + dungeon.cell_height);
                var square_corners = [];
                square_corners[TOP] = square_upper_right;
                square_corners[LEFT] = square_upper_left;
                square_corners[BOTTOM] = square_lower_left;
                square_corners[RIGHT] = square_lower_right;
                var room_corners = [];
                for (var idx = 0; idx < 4; idx++) {
                    room_corners[idx] = square_corners[idx].times(7 / 8).plus(square_corners[(idx + 2) % 4].times(1 / 8));
                }
                var walls = [];
                for (var idx = 0; idx < 4; idx++) {
                    walls[idx] = new StaticPhysicsComponent(room_corners[idx], room_corners[(idx + 1) % 4]);
                }
                var openings = [];
                for (var idx = 0; idx < 4; idx++) {
                    var right_wall = void 0, left_wall = void 0;
                    if (idx % 2 == 0) {
                        right_wall = new Vector(room_corners[idx].x, square_corners[idx].y);
                        left_wall = new Vector(room_corners[(idx + 1) % 4].x, square_corners[(idx + 1) % 4].y);
                    }
                    else {
                        right_wall = new Vector(square_corners[idx].x, room_corners[idx].y);
                        left_wall = new Vector(square_corners[(idx + 1) % 4].x, room_corners[(idx + 1) % 4].y);
                    }
                    openings[idx] = [
                        new StaticPhysicsComponent(room_corners[idx], right_wall),
                        new StaticPhysicsComponent(left_wall, room_corners[(idx + 1) % 4])
                    ];
                }
                var add_line = function (s) {
                    var line = new ECSEntity();
                    var view = new StaticRenderComponent(0, 0, document.createElement("canvas"));
                    line.add_component(s);
                    line.add_component(view);
                    EntityManager.current.add_entity(line);
                };
                for (var idx = 0; idx < 4; idx++) {
                    if (open_1[idx]) {
                        var adj = this.adj(v)[idx];
                        var bdj = this.adj(v)[(idx + 5) % 4];
                        var cdj = this.adj(v)[(idx + 3) % 4];
                        if (!(this.openings(dungeon, adj.x, adj.y)[(idx + 3) % 4] && open_1[(idx + 3) % 4] && this.openings(dungeon, cdj.x, cdj.y)[idx]))
                            add_line(openings[idx][0]);
                        if (!(this.openings(dungeon, adj.x, adj.y)[(idx + 5) % 4] && open_1[(idx + 5) % 4] && this.openings(dungeon, bdj.x, bdj.y)[idx]))
                            add_line(openings[idx][1]);
                    }
                    else {
                        add_line(walls[idx]);
                    }
                }
            }
        }
    };
    DungeonRenderSystem.prototype.render_dungeons = function () {
        var _this = this;
        var dungeons = EntityManager.current.get_entities([ComponentType.StaticRender, ComponentType.Dungeon]);
        dungeons.forEach(function (d) {
            var dungeon = d.get_component(ComponentType.Dungeon);
            var target = d.get_component(ComponentType.StaticRender);
            _this.render_dungeon(dungeon, target);
        });
    };
    DungeonRenderSystem.prototype.render_room = function (dungeon, room_id) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.width = dungeon.cell_width;
        canvas.height = dungeon.cell_height;
        disableImageSmoothing(ctx);
        var texture_entities = EntityManager.current.get_entities([ComponentType.FloorTexture]);
        var entity = texture_entities[room_id % texture_entities.length];
        return entity.get_component(ComponentType.FloorTexture).texture;
    };
    DungeonRenderSystem.prototype.adjacent = function (v) {
        return [
            new Vector(v.x, v.y - 1),
            new Vector(v.x - 1, v.y),
            new Vector(v.x, v.y + 1),
            new Vector(v.x + 1, v.y)
        ];
    };
    DungeonRenderSystem.prototype.render_walls = function (dungeon, i, j) {
        var v = new Vector(i, j);
        var open = this.openings(dungeon, i, j);
        var TOP = 0, LEFT = 1, BOTTOM = 2, RIGHT = 3;
        var square_x = 0; //dungeon.left + i*dungeon.cell_width;
        var square_y = 0; //dungeon.top + j*dungeon.cell_height;
        var square_upper_left = new Vector(square_x, square_y);
        var square_lower_left = new Vector(square_x, square_y + dungeon.cell_height);
        var square_upper_right = new Vector(square_x + dungeon.cell_width, square_y);
        var square_lower_right = new Vector(square_x + dungeon.cell_width, square_y + dungeon.cell_height);
        var square_corners = [];
        square_corners[TOP] = square_upper_right;
        square_corners[LEFT] = square_upper_left;
        square_corners[BOTTOM] = square_lower_left;
        square_corners[RIGHT] = square_lower_right;
        var room_corners = [];
        for (var idx = 0; idx < 4; idx++) {
            room_corners[idx] = square_corners[idx].times(7 / 8).plus(square_corners[(idx + 2) % 4].times(1 / 8));
        }
        var walls = [];
        for (var idx = 0; idx < 4; idx++) {
            walls[idx] = new StaticPhysicsComponent(room_corners[idx], room_corners[(idx + 1) % 4]);
        }
        var openings = [];
        for (var idx = 0; idx < 4; idx++) {
            var right_wall = void 0, left_wall = void 0;
            if (idx % 2 == 0) {
                right_wall = new Vector(room_corners[idx].x, square_corners[idx].y);
                left_wall = new Vector(room_corners[(idx + 1) % 4].x, square_corners[(idx + 1) % 4].y);
            }
            else {
                right_wall = new Vector(square_corners[idx].x, room_corners[idx].y);
                left_wall = new Vector(square_corners[(idx + 1) % 4].x, room_corners[(idx + 1) % 4].y);
            }
            openings[idx] = [
                new LineSegment(room_corners[idx], right_wall),
                new LineSegment(left_wall, room_corners[(idx + 1) % 4])
            ];
        }
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        disableImageSmoothing(context);
        canvas.width = dungeon.cell_width;
        canvas.height = dungeon.cell_height;
        var add_wall = function (v) {
            //context.save();
            context.beginPath();
            context.moveTo(v[0].x, v[0].y);
            [1, 2, 3, 0].forEach(function (i) { return context.lineTo(v[i].x, v[i].y); });
            context.fillStyle = "black";
            context.lineWidth = 1;
            context.strokeStyle = "black";
            context.stroke();
            context.fill();
            //context.closePath();
            //context.clip();
            //context.drawImage(/*...*/);
            //context.restore();
        };
        for (var idx = 0; idx < 4; idx++) {
            if (open[idx]) {
                var adj = this.adj(v)[idx];
                var bdj = this.adj(v)[(idx + 5) % 4];
                var cdj = this.adj(v)[(idx + 3) % 4];
                if (!(this.openings(dungeon, adj.x, adj.y)[(idx + 3) % 4] && open[(idx + 3) % 4] && this.openings(dungeon, cdj.x, cdj.y)[idx])) {
                    add_wall([openings[idx][0].v0, openings[idx][0].v1, square_corners[idx], square_corners[idx]]);
                }
                if (!(this.openings(dungeon, adj.x, adj.y)[(idx + 5) % 4] && open[(idx + 5) % 4] && this.openings(dungeon, bdj.x, bdj.y)[idx])) {
                    add_wall([openings[idx][1].v0, openings[idx][1].v1, square_corners[(idx + 1) % 4], square_corners[(idx + 1) % 4]]);
                }
            }
            else {
                add_wall([square_corners[idx], room_corners[idx], room_corners[(idx + 1) % 4], square_corners[(idx + 1) % 4]]);
            }
        }
        return canvas;
    };
    DungeonRenderSystem.prototype.render_dungeon = function (dungeon, target) {
        var ctx = target.content.getContext("2d");
        disableImageSmoothing(ctx);
        target.x = dungeon.left;
        target.y = dungeon.top;
        var room_textures = {};
        for (var x = 0; x < dungeon.width; x++) {
            for (var y = 0; y < dungeon.height; y++) {
                var square_left = x * dungeon.cell_width;
                var square_top = y * dungeon.cell_height;
                var room_label = dungeon.rooms.at(new Vector(x, y));
                if (room_label) {
                    if (!room_textures[room_label])
                        room_textures[room_label] = this.render_room(dungeon, room_label);
                    ctx.drawImage(room_textures[room_label], square_left, square_top, dungeon.cell_width, dungeon.cell_height);
                    ctx.drawImage(this.render_walls(dungeon, x, y), square_left, square_top);
                }
                else {
                    ctx.drawImage(this.render_walls(dungeon, x, y), square_left, square_top);
                }
            }
        }
    };
    DungeonRenderSystem.prototype.step = function (e) { };
    return DungeonRenderSystem;
}());
var DungeonGenerator = (function () {
    function DungeonGenerator() {
    }
    DungeonGenerator.generate = function () {
        var render_component = new StaticRenderComponent(0, 0, document.createElement("canvas"));
        var dungeon_component = new DungeonComponent(0, 0, 0, 0, 0, 0, undefined);
        var entity = new ECSEntity();
        entity.add_component(dungeon_component);
        entity.add_component(render_component);
        EntityManager.current.add_entity(entity);
        dungeon_component.width = DungeonGenerator.WIDTH;
        dungeon_component.height = DungeonGenerator.HEIGHT;
        dungeon_component.left = DungeonGenerator.LEFT_POS;
        dungeon_component.top = DungeonGenerator.TOP_POS;
        dungeon_component.cell_width = DungeonGenerator.CELL_WIDTH;
        dungeon_component.cell_height = DungeonGenerator.CELL_HEIGHT;
        dungeon_component.start = DungeonGenerator.START_POS.clone();
        new DungeonRenderSystem(false).generate(dungeon_component);
        console.log(dungeon_component);
        render_component.x = dungeon_component.left;
        render_component.y = dungeon_component.top;
        render_component.content.width = dungeon_component.cell_width * dungeon_component.width;
        render_component.content.height = dungeon_component.cell_height * dungeon_component.height;
    };
    return DungeonGenerator;
}());
DungeonGenerator.CELL_WIDTH = 10;
DungeonGenerator.CELL_HEIGHT = 10;
DungeonGenerator.WIDTH = 20;
DungeonGenerator.HEIGHT = 20;
DungeonGenerator.LEFT_POS = 10;
DungeonGenerator.TOP_POS = 10;
DungeonGenerator.START_POS = new Vector(10, 10);
var HealthRenderer = (function () {
    function HealthRenderer() {
        this.RADIUS = 60;
        this.t = 0;
    }
    HealthRenderer.prototype.draw = function (ctx, center, hp, maxhp) {
        for (var i = 0; i < maxhp; i++) {
            var dt = this.t / 10;
            var incr = Math.PI * 2 / maxhp;
            var theta = incr * i + dt;
            if (i > hp - 1) {
                ctx.beginPath();
                ctx.arc(center.x, center.y, this.RADIUS, theta, theta + incr);
                ctx.stroke();
            }
            else {
                ctx.beginPath();
                ctx.arc(center.x, center.y, this.RADIUS, theta, theta + incr / 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(Math.cos(theta + incr * 3 / 4) * this.RADIUS + center.x, Math.sin(theta + incr * 3 / 4) * this.RADIUS + center.y, 5, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
        this.t++;
    };
    return HealthRenderer;
}());
var PhysicsRenderSystem = (function () {
    function PhysicsRenderSystem(render_statics) {
        if (render_statics === void 0) { render_statics = true; }
        if (render_statics)
            this.render_statics();
    }
    PhysicsRenderSystem.prototype.render_statics = function () {
        var e = EntityManager.current;
        var statics = e.get_entities([ComponentType.StaticRender, ComponentType.StaticPhysics]);
        statics.forEach(function (s) {
            var target = s.get_component(ComponentType.StaticRender);
            var content = s.get_component(ComponentType.StaticPhysics);
            var o = content.v1.minus(content.v0);
            var p = new LineSegment(new Vector(0, 0), new Vector(-o.y, o.x));
            var bbp = p.bounding_box();
            var bb = content.bounding_box();
            target.x = bb.left - 3;
            target.y = bb.top - 3;
            target.content.width = bb.width + 6;
            target.content.width = bb.width + 6;
            var ctx = target.content.getContext("2d");
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(3, 3);
            ctx.lineTo(bb.width + 3, bb.height + 3);
            ctx.stroke();
            //ctx.fillRect(1, 1, 5, 5);
            //ctx.fillRect(bb.width+1, bb.height+1, 5, 5);
        });
    };
    PhysicsRenderSystem.prototype.step = function (e) {
        var dynamics = e.get_entities([ComponentType.DynamicPhysics, ComponentType.DynamicRender]);
        dynamics.forEach(function (s) {
            var target = s.get_component(ComponentType.DynamicRender);
            var content = s.get_component(ComponentType.DynamicPhysics);
            target.x = content.position.x - content.r;
            target.y = content.position.y - content.r;
            var ctx = target.content.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.beginPath();
            ctx.arc(content.r, content.r, content.r, 0, 2 * Math.PI);
            ctx.stroke();
        });
    };
    return PhysicsRenderSystem;
}());
/*Running*/
var KeySystem = (function () {
    function KeySystem() {
        KeySystem.setup();
    }
    KeySystem.is_down = function (code) {
        return this.keys_down[code];
    };
    KeySystem.code = function (str) {
        return str.charCodeAt(0);
    };
    KeySystem.setup = function () {
        if (KeySystem.has_setup)
            return;
        var self = this;
        function handle_down(event) {
            if (self.keys_down[event.keyCode]) {
                return;
            }
            self.keys_down[event.keyCode] = true;
        }
        function handle_up(event) {
            self.keys_down[event.keyCode] = false;
        }
        document.addEventListener('keydown', handle_down, false);
        document.addEventListener('keyup', handle_up, false);
        KeySystem.has_setup = true;
    };
    KeySystem.prototype.step = function () {
        var self = this;
        EntityManager.current.get_entities([ComponentType.KeyInput]).forEach(function (entity) {
            var input = entity.get_component(ComponentType.KeyInput);
            input.up = KeySystem.is_down(KeySystem.code('W'));
            input.left = KeySystem.is_down(KeySystem.code('A'));
            input.down = KeySystem.is_down(KeySystem.code('S'));
            input.right = KeySystem.is_down(KeySystem.code('D'));
        });
    };
    return KeySystem;
}());
KeySystem.keys_down = [];
KeySystem.has_setup = false;
var KeyInputComponent = (function () {
    function KeyInputComponent() {
        this.type = ComponentType.KeyInput;
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
    }
    return KeyInputComponent;
}());
var MouseInfo = (function () {
    function MouseInfo() {
    }
    MouseInfo.trigger_clicks = function (x, y, which) {
        MouseInfo.listeners.forEach(function (listener) {
            listener.onclick(x, y, which);
        });
    };
    MouseInfo.trigger_downs = function (x, y, which) {
        MouseInfo.listeners.forEach(function (listener) {
            listener.ondown(x, y, which);
        });
    };
    MouseInfo.trigger_ups = function (x, y, which) {
        MouseInfo.listeners.forEach(function (listener) {
            listener.onup(x, y, which);
        });
    };
    MouseInfo.trigger_moves = function (x, y) {
        MouseInfo.listeners.forEach(function (listener) {
            listener.onmove(x, y);
        });
    };
    MouseInfo.setup = function () {
        function handleMouseMove(event) {
            event = event || window.event; // IE-ism
            if (event.pageX == null && event.clientX != null) {
                var eventDoc = (event.target && event.target.ownerDocument) || document;
                var doc = eventDoc.documentElement;
                var body = eventDoc.body;
                event.pageX = event.clientX +
                    (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                    (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY +
                    (doc && doc.scrollTop || body && body.scrollTop || 0) -
                    (doc && doc.clientTop || body && body.clientTop || 0);
            }
            MouseInfo.mouse_x = event.pageX;
            MouseInfo.mouse_y = event.pageY;
            MouseInfo.trigger_moves(MouseInfo.mouse_x, MouseInfo.mouse_y);
        }
        function handleMouseDown(event) {
            MouseInfo.mouse_down[event.which] = true;
            MouseInfo.trigger_downs(event.pageX, event.pageY, event.which);
        }
        function handleMouseUp(event) {
            MouseInfo.mouse_down[event.which] = false;
            MouseInfo.trigger_ups(event.pageX, event.pageY, event.which);
        }
        function handleMouseClick(event) {
            MouseInfo.trigger_clicks(event.pageX, event.pageY, event.which);
        }
        document.onmousemove = handleMouseMove;
        document.onmousedown = handleMouseDown;
        document.onmouseup = handleMouseUp;
        document.onclick = handleMouseClick;
    };
    MouseInfo.x = function () {
        return this.mouse_x;
    };
    MouseInfo.y = function () {
        return this.mouse_y;
    };
    MouseInfo.down = function (idx) {
        return this.mouse_down[idx] ? true : false; //undefined -> false
    };
    MouseInfo.add_listener = function (listener) {
        MouseInfo.listeners.push(listener);
    };
    MouseInfo.remove_listener = function (listener) {
        MouseInfo.listeners.splice(MouseInfo.listeners.indexOf(listener), 1);
    };
    return MouseInfo;
}());
MouseInfo.mouse_x = 0;
MouseInfo.mouse_y = 0;
MouseInfo.mouse_down = [false, false, false];
MouseInfo.listeners = [];
function test_cache() {
    var texture = document.createElement("canvas");
    texture.width = texture.height = 1024;
    var ctx = texture.getContext("2d");
    var r = 0, g = 0, b = 0;
    for (var x = 0; x < 150; x++) {
        for (var y = 0; y < 150; y++) {
            r = (r + 23) % 255;
            g = (g + 31) % 255;
            b = (b + 73) % 255;
            ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + .5 + ")";
            ctx.fillRect(x * 13, y * 13, 17, 17);
        }
    }
    document.body.appendChild(texture);
    var cache = new CanvasCache();
}
//# sourceMappingURL=out.js.map