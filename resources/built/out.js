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
    Color.prototype.to_hex = function () {
        var component = function (c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        };
        var r = component(this.r);
        var g = component(this.g);
        var b = component(this.b);
        return "#" + r + g + b;
    };
    Color.prototype.to_str = function () {
        if (this.r < 0 || this.r > 255 ||
            this.g < 0 || this.g > 255 ||
            this.b < 0 || this.b > 255) {
            throw "0 <= r,g,b <= 255";
        }
        return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    };
    Color.prototype.to_hsv = function () {
        var r = this.r / 255;
        var g = this.g / 255;
        var b = this.b / 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var diff = max - min;
        var v = max;
        if (diff == 0) {
            return [0, 0, v];
        }
        var diffc = function (c) { return (v - c) / 6 / diff + 1 / 2; };
        var rr = diffc(r);
        var gg = diffc(g);
        var bb = diffc(b);
        var h;
        if (r === v)
            h = bb - gg;
        else if (g === v)
            h = (1 / 3) + rr - bb;
        else if (b === v)
            h = (2 / 3) + gg - rr;
        if (h < 0)
            h += 1;
        else if (h > 1)
            h -= 1;
        var s = diff / v;
        return [h, s, v];
    };
    Color.prototype.set_str = function (hex) {
        if (hex.charAt(0) == '#') {
            this.set_str(hex.substring(1));
            return;
        }
        var parse_byte = function (x) { return new Number("0x" + x); };
        this.r = parse_byte(hex.substr(0, 2));
        this.g = parse_byte(hex.substr(2, 2));
        this.b = parse_byte(hex.substr(4, 2));
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
CanvasCache.DEFAULT_CANVAS_WIDTH = 1500; //TODO If this is 500, draw_image bugs out on images of size 512*16
var COLORS = {
    "Sand1": "#565656",
    "Sand2": "#6e5457",
    "Sand3": "#6D5051",
    "Sand4": "#834B5F",
    "Sand5": "#A98978",
    "Sand6": "#A7705A",
    "Sand7": "#B88968",
    "Sand8": "#82694A",
    "Sand9": "#A98978",
    "Sand10": "#B88968",
    "Sand11": "#B88968",
    "Sand12": "#A37B5F",
    "Sand13": "#C8B998",
    "Marble0": "#968282",
    "Marble1": "#e4cbaa",
    "Wood0": "#523b22",
    "Wood1": "#8b7453",
    "Wood2": "#8b6c58",
    "Wood3": "#543a29",
    "Blackwood0": "#333133",
    "Blackwood1": "#0f0f0f",
    "Blackwood2": "#636162",
    "Lightwood0": "#e0c4b0",
    "Lightwood1": "#e8b995"
};
var COLOR_SCHEME = {
    "Sand": [
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
        ["#C8B998", 0.2875]
    ],
    "Mesa": [
        ["#c07860", 0.000190],
        ["#d8a8a8", 0.000063],
        ["#f0a878", 0.001270],
        ["#f0c090", 0.066921],
        ["#c09078", 0.002794],
        ["#f0d8c0", 0.002159],
        ["#f0c090", 0.060000],
        ["#f0d8a8", 0.003873],
        ["#d8a890", 0.050000],
        ["#c0a878", 0.000635],
        ["#f0c0a8", 0.050000],
        ["#d89060", 0.001587],
        ["#d8a890", 0.050000],
        ["#d89078", 0.054540],
        ["#f0c0c0", 0.000127],
        ["#f0c0a8", 0.085397],
        ["#d8c0a8", 0.071683],
        ["#f0a890", 0.059492],
        ["#c0a890", 0.000698],
        ["#d8a890", 0.050000],
        ["#d8a878", 0.063937],
        ["#d8a890", 0.050000],
        ["#d8c090", 0.059746],
        ["#d8a890", 0.050000],
        ["#f0c0a8", 0.050000],
        ["#d8a890", 0.054127],
        ["#d8a878", 0.060000],
        ["#d8c0c0", 0.000063],
        ["#c09060", 0.000698]
    ],
    "White Mesa": [
        ["#d8d8c0", 0.472558],
        ["#d8d8d8", 0.404393],
        ["#f0d8d8", 0.052351],
        ["#d8c0c0", 0.046718],
        ["#c0c0c0", 0.011938],
        ["#c0c0a8", 0.006718],
        ["#f0d8c0", 0.002274],
        ["#c0d8c0", 0.001034],
        ["#f0f0d8", 0.000827],
        ["#c0a8a8", 0.000620],
        ["#a8a8a8", 0.000310],
        ["#a8a890", 0.000155],
        ["#d8c0a8", 0.000103]
    ],
    "Marble": [
        ["#f4f4f4", .5],
        ["#d5d5d5", .5]
    ],
    "Wood": [
        ["#523b22", .35],
        ["#8b7453", .15],
        ["#8b6c58", .4],
        ["#543a29", .1]
    ],
    "Blackwood": [
        ["#333133", .333],
        ["#0f0f0f", .333],
        ["#636162", .334]
    ],
    "Lightwood": [
        ["#e0c4b0", .5],
        ["#e8b995", .5]
    ]
};
var h, s, v;
h = s = v = 0;
for (var idx = 0; idx < COLOR_SCHEME["Sand"].length; idx++) {
    var entry = COLOR_SCHEME["Sand"][idx];
    var color = entry[0];
    var percentage = entry[1];
    var hsv = new Color(color).to_hsv();
    h += percentage * hsv[0];
    s += percentage * hsv[1];
    v += percentage * hsv[2];
}
for (var key in COLOR_SCHEME) {
    var new_key = key + "_normalized";
    COLOR_SCHEME[new_key] = [];
    for (var idx = 0; idx < COLOR_SCHEME[key].length; idx++) {
        var entry = COLOR_SCHEME[key][idx];
        var color = new Color(entry[0]);
        var hsv = color.to_hsv();
        color.set_hsv(hsv[0], (s + hsv[1]) / 2, (v + hsv[2]) / 2);
        COLOR_SCHEME[new_key].push([color.to_hex(), entry[1]]);
    }
}
/*
   const COLORS = {
   "Wet Sand":"#dccba7",
   "Water":"#7e9fa1",
   "Red Clay":"#b38768",
   "Wet Sand Shadowed":"#4b3f2e",
   "Stone":"#8c8c7f",
   "Plant":"#908149",
   "White Stone Shadowed":"#697078",
   "White Stone":"#e4cbaa",
   "Dark Gray Stone":"#585451",
   "Sky":"#a6b7c3",
   "Blue Clothes":"#282b57",
   "Light Green Stone":"#d8d8c0",
   "Green Stone":"#a8a890",
   "Dark Green Stone":"#787860",
   "Dark Purple Clothes":"#303048",
   "Purple Clothes":"#484860",
   "Light Purple Clothes":"#606078",
   "Wet Red Clay":"#bd896e",
   "Wet Clay":"#b9a391",
   "Dry Plant":"#977c65",
   "Dark Red Clay":"#563025",
   "Dark Water":"#563025"
   }

   const COLOR_SCHEME = {
   "Hot Sand Desert":{
   "Wet Sand":0.777,
   "Water":0.123,
   "Red Clay":0.69,
   "Wet Sand Shadowed":0.021,
   "Stone":0.09,
   "Plant":0.01
   },
   "White Stone Desert":{
   "White Stone Shadowed":0.498,
   "White Stone":0.365,
   "Dark Gray Stone":0.104,
   "Sky":0.020,
   "Blue Clothes":0.013
   },
   "Green Stone Desert":{
   "Light Green Stone":0.825778,
   "Green Stone":0.143555,
   "Dark Green Stone":0.024356,
   "Dark Purple Clothes":0.004711,
   "Purple Clothes":0.000889,
   "Light Purple Clothes":0.000711
   },
   "Red Clay Desert":{
   "Wet Red Clay":0.623,
   "Wet Clay":0.256,
   "Sky":0.076,
   "Dry Plant":0.041,
   "Dark Red Clay":0.02,
   "Dark Water":0.02
   }
   }
 */
function render(canvas, scheme) {
    var context = canvas.getContext("2d");
    var width = canvas.width / scheme.length;
    var x = 0;
    var h = 0, s = 0, v = 0;
    for (var i = 0; i < scheme.length; i++) {
        var color_hex = scheme[i][0];
        var block_width = Math.round(scheme[i][1] * canvas.width);
        context.fillStyle = color_hex;
        var color = new Color(color_hex);
        var hsv = color.to_hsv();
        h += hsv[0];
        s += hsv[1];
        v += hsv[2];
        console.log(hsv);
        context.fillRect(x, 0, block_width, canvas.height);
        x += block_width;
    }
    h /= scheme.length;
    s /= scheme.length;
    v /= scheme.length;
    console.log(h, s, v);
}
function render_all() {
    var big_canvas = document.createElement("canvas");
    var big_context = big_canvas.getContext("2d");
    big_canvas.width = 1000;
    big_canvas.height = 1000;
    var y = 0;
    for (var scheme_name in COLOR_SCHEME) {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        canvas.width = 1000;
        canvas.height = 100;
        render(canvas, COLOR_SCHEME[scheme_name]);
        big_context.drawImage(canvas, 0, y);
        y += 100;
    }
    document.body.appendChild(big_canvas);
}
var RGB = (function () {
    function RGB() {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        canvas.width = canvas.height = 100;
        var self = this;
        function update() {
            context.fillStyle = this.get_color().to_str();
            context.fillRect(0, 0, 200, 200);
        }
        var container = document.createElement("div");
        this.red = this.make_input(update);
        this.green = this.make_input(update);
        this.blue = this.make_input(update);
        container.appendChild(this.red);
        container.appendChild(this.green);
        container.appendChild(this.blue);
        container.appendChild(canvas);
        document.body.appendChild(container);
    }
    RGB.prototype.make_input = function (callback) {
        var div = document.createElement("div");
        var value = document.createElement("span");
        var input = document.createElement("input");
        input.setAttribute("type", "range");
        input.setAttribute("min", "0");
        input.setAttribute("max", "255");
        div.appendChild(input);
        div.appendChild(value);
        input.oninput = function () {
            value.innerHTML = input.value;
            callback();
        };
        return div;
    };
    RGB.prototype.get_red = function () {
        return this.red.children[0].value;
    };
    RGB.prototype.get_green = function () {
        return this.green.children[0].value;
    };
    RGB.prototype.get_blue = function () {
        return this.blue.children[0].value;
    };
    RGB.prototype.get_color = function () {
        return new Color(this.get_red(), this.get_green(), this.get_blue());
    };
    return RGB;
}());
//const rgb = new RGB();
render_all();
//# sourceMappingURL=out.js.map