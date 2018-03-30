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
function modulus(a, b) {
    return ((a % b) + b) % b;
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
function hash(arr) {
    var hash = 0;
    if (arr.length == 0) {
        return hash;
    }
    for (var idx = 0; idx < arr.length; idx++) {
        hash = ((hash << 5) - hash) + arr[idx];
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
var NumberTreeMapNode = /** @class */ (function () {
    function NumberTreeMapNode() {
        this.children = {};
    }
    return NumberTreeMapNode;
}());
var NumberTreeMap = /** @class */ (function () {
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
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Vector = /** @class */ (function (_super) {
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
var LineSegment = /** @class */ (function () {
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
var Ball = /** @class */ (function () {
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
var VectorMath = /** @class */ (function () {
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
var VectorMap = /** @class */ (function () {
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
var VectorSet = /** @class */ (function () {
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
var Square = /** @class */ (function () {
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
var Color = /** @class */ (function () {
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
var CanvasCache = /** @class */ (function () {
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
                var ctx = this.cache.at(idx).getContext("2d");
                disableImageSmoothing(ctx);
                ctx.drawImage(canvas, left, top_1);
            }
        }
    };
    CanvasCache.prototype.get_image = function (view) {
        var result = document.createElement("canvas");
        result.width = view.width;
        result.height = view.height;
        var ctx = result.getContext("2d");
        disableImageSmoothing(ctx);
        var position = new Vector(view.left, view.top).divided(this.CANVAS_WIDTH).apply(Math.floor);
        var dimensions = new Vector(view.width, view.height).divided(this.CANVAS_WIDTH).apply(Math.ceil);
        var offset_x = this.mod(view.left, this.CANVAS_WIDTH);
        var offset_y = this.mod(view.top, this.CANVAS_WIDTH);
        for (var i = 0; i < dimensions.x + 1; i++) {
            for (var j = 0; j < dimensions.y + 1; j++) {
                var left = i * this.CANVAS_WIDTH - offset_x;
                var top_2 = j * this.CANVAS_WIDTH - offset_y;
                var idx = position.plus(new Vector(i, j));
                var img_1 = this.cache.at(idx);
                if (!img_1)
                    continue;
                /*
                const sx = Math.max(-left, 0);
                const sy = Math.max(-top, 0);
                const sWidth = img.width - sx;
                const sHeight = img.height - sy;
                ctx.drawImage(img, sx, sy, sWidth, sHeight, left+sx, top+sx, sWidth, sHeight);
               */
                ctx.drawImage(img_1, left, top_2);
                ctx.fillStyle = "red";
                ctx.fillRect(left, top_2, 2, 2);
                ctx.fillStyle = "green";
                ctx.fillRect(left + img_1.width - 2, top_2 + img_1.height - 2, 2, 2);
            }
        }
        return result;
    };
    CanvasCache.DEFAULT_CANVAS_WIDTH = 1024; //TODO If this is 500, draw_image bugs out on images of size 512*16
    return CanvasCache;
}());
/* TileGenerator makes a grid of enums, where the values are cell types
 * (wall, floor, door, lake, with specificity, i.e. wood floor, stone wall, water)
 * GridGenerator makes a grid of GridCells, which are not components
 * GridCells contain minimal information on their content
 * GridParser transforms a grid into a world, and returns a list of entities?
 *
 */
var Tile = /** @class */ (function () {
    function Tile(values, _tags) {
        this.values = values;
        this._tags = _tags;
        console.assert(values.length == 3);
        console.assert(values[0].length == 3);
    }
    Object.defineProperty(Tile, "OMIT_TAG_IDX", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tile, "WEIGHT_TAG_IDX", {
        get: function () {
            return 1;
        },
        enumerable: true,
        configurable: true
    });
    Tile.prototype.get = function (x, y) {
        console.assert(x < 3);
        console.assert(y < 3);
        console.assert(x >= 0);
        console.assert(y >= 0);
        return this.values[x][y];
    };
    Tile.prototype.get_tag = function (x) {
        return this._tags[x];
    };
    Tile.prototype.rotate_cw = function () {
        var new_values = [[], [], []];
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                new_values[i][j] = this.values[j][2 - i];
            }
        }
        this.values = new_values;
    };
    Tile.prototype.rotate_ccw = function () {
        this.rotate_cw();
        this.rotate_cw();
        this.rotate_cw();
    };
    Tile.prototype.to_array = function () {
        var result = [];
        for (var j = 0; j < 3; j++) {
            for (var i = 0; i < 3; i++) {
                result.push(this.get(i, j));
            }
        }
        return result;
    };
    Tile.prototype.clone = function () {
        var new_values = [[], [], []];
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                new_values[i][j] = this.values[i][j];
            }
        }
        var new_tags = [];
        for (var i = 0; i < this._tags.length; i++)
            new_tags[i] = this._tags[i];
        return new Tile(new_values, new_tags);
    };
    Tile.prototype.hash = function () {
        return hash(this.to_array());
    };
    return Tile;
}());
var TileGrid = /** @class */ (function () {
    function TileGrid(tiles, _width, _height) {
        this._width = _width;
        this._height = _height;
        var tile_set = {};
        tiles.forEach(function (tile) {
            console.log(tile.get_tag(Tile.OMIT_TAG_IDX), tile.get_tag(Tile.OMIT_TAG_IDX) ? 1 : 0);
            if (tile.get_tag(Tile.OMIT_TAG_IDX)) {
                return;
            }
            var add = function (t) { return tile_set[t.hash()] = t; };
            var clone = tile.clone();
            for (var i = 0; i < 4; i++) {
                add(clone.clone());
                clone.rotate_cw();
            }
        });
        this._tiles = [];
        for (var hash_key in tile_set) {
            this._tiles.push(tile_set[hash_key]);
        }
        this._undecided = [];
        this._tile_map = [];
        for (var idx = 0; idx < _height; idx++) {
            this._tile_map[idx] = [];
            for (var jdx = 0; jdx < _width; jdx++) {
                this._undecided.push([idx, jdx]);
            }
        }
    }
    TileGrid.prototype.contains = function (i0, j0) {
        return i0 >= 0 && j0 >= 0 && i0 < this._width && j0 < this._height;
    };
    TileGrid.prototype.valid_adjacent = function (t0, i0, j0, t1, i1, j1) {
        if (!this.contains(i0, j0) || !this.contains(i1, j1)) {
            return true;
        }
        var di = Math.abs(i1 - i0);
        var dj = Math.abs(j1 - j0);
        console.assert(dj <= 1 && di <= 1);
        console.assert(di != 1 || dj != 1);
        console.assert(di != 0 || dj != 0);
        if (i1 < i0 || j1 < j0) {
            return this.valid_adjacent(t1, i1, j1, t0, i0, j0);
        }
        console.assert(i0 <= i1 && j0 <= j1);
        if (i0 == i1 && j0 + 1 == j1) {
            var top_3 = t0.clone();
            top_3.rotate_cw(); //right
            var bottom = t1.clone();
            bottom.rotate_cw(); //left
            return this.valid_adjacent(bottom, i0, j0, top_3, i0 + 1, j0);
        }
        console.assert(j0 == j1 && i0 + 1 == i1);
        var left = t0;
        var right = t1;
        return left.get(2, 0) == right.get(0, 0) &&
            left.get(2, 1) == right.get(0, 1) &&
            left.get(2, 2) == right.get(0, 2);
    };
    TileGrid.prototype.valid_options = function (i, j) {
        var self = this;
        var adjacent = [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]];
        var options = this._tiles;
        adjacent.forEach(function (position) {
            var pass = [];
            if (!self._tile_map[position[0]] || !self._tile_map[position[0]][position[1]]) {
                return;
            }
            var t1 = self._tile_map[position[0]][position[1]];
            options.forEach(function (t0) {
                if (self.valid_adjacent(t0, i, j, t1, position[0], position[1])) {
                    pass.push(t0.clone());
                }
            });
            options = pass;
        });
        return options;
    };
    TileGrid.prototype.get_tile = function (i, j) {
        console.assert(this.contains(i, j), "0<=" + i + "<" + this._width +
            " 0<=" + j + "<" + this._height);
        return this._tile_map[i][j];
    };
    TileGrid.prototype.get_id = function (i, j) {
        var tile_i = Math.floor(i / 3);
        var tile_j = Math.floor(j / 3);
        var tile = this.get_tile(tile_i, tile_j);
        if (!tile)
            return undefined;
        return tile.get(i % 3, j % 3);
    };
    TileGrid.prototype.set_tile = function (i, j, value) {
        if (!this.contains(i, j))
            return;
        this._tile_map[i][j] = value;
    };
    TileGrid.prototype.undecided_tiles_on_map = function () {
        for (var i = 0; i < this._width; i++) {
            for (var j = 0; j < this._height; j++) {
                if (this.get_tile(i, j) === undefined) {
                    return true;
                }
            }
        }
        return false;
    };
    TileGrid.prototype.get_undecided_tiles = function () {
        var undecided = [];
        for (var i = 0; i < this._width; i++) {
            for (var j = 0; j < this._height; j++) {
                if (this.get_tile(i, j) === undefined) {
                    undecided.push([i, j]);
                }
            }
        }
        return undecided;
    };
    Object.defineProperty(TileGrid.prototype, "tiles", {
        get: function () {
            return this._tiles;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TileGrid.prototype, "tile_width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TileGrid.prototype, "tile_height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TileGrid.prototype, "id_width", {
        get: function () {
            return this._width * 3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TileGrid.prototype, "id_height", {
        get: function () {
            return this._height * 3;
        },
        enumerable: true,
        configurable: true
    });
    return TileGrid;
}());
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
var TileSet = /** @class */ (function () {
    function TileSet(img) {
        this.set_image(img);
    }
    TileSet.prototype.set_image = function (img) {
        console.log(img);
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var context = canvas.getContext("2d");
        document.body.appendChild(canvas);
        context.drawImage(img, 0, 0);
        var data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        var ids = {};
        var max_id = 0;
        /*Read colors from first row of pixels, stop at white*/
        for (var i = 0; i < canvas.width; i++) {
            var r = data[i * 4];
            var g = data[i * 4 + 1];
            var b = data[i * 4 + 2];
            if (r == 255 && g == 255 && b == 255)
                break;
            if (!ids[r])
                ids[r] = {};
            if (!ids[r][g])
                ids[r][g] = {};
            ids[r][g][b] = max_id;
            max_id++;
        }
        /*Read tiles, stop when one contains white*/
        var tiles = [];
        var tags = [];
        outer: for (var j = 1; j < canvas.height - 2; j += 4) {
            for (var i = 0; i < canvas.width - 2; i += 4) {
                var tile_values = [[], [], []];
                for (var dj = 0; dj < 3; dj++) {
                    for (var di = 0; di < 3; di++) {
                        var x = i + di;
                        var y = j + dj;
                        var idx = (x + y * canvas.width) * 4;
                        var r = data[idx];
                        var g = data[idx + 1];
                        var b = data[idx + 2];
                        if (r == 255 && g == 255 && b == 255)
                            break outer;
                        tile_values[di][dj] = ids[r][g][b];
                    }
                }
                /*Tags are the 7 pixels surrounding the 3x3 grid*/
                var tags_1 = [];
                for (var dt = 0; dt < 4; dt++) {
                    var x = i + dt;
                    var y = j + 3;
                    var idx = (x + y * canvas.width) * 4;
                    var r = data[idx];
                    if (r == 1)
                        tags_1[dt] = Math.pow(2, -24);
                    else
                        tags_1[dt] = r;
                }
                if (!tags_1[0])
                    console.log(tags_1[1]);
                for (var dt = 0; dt < 3; dt++) {
                    var x = i + 3;
                    var y = j + dt;
                    var idx = (x + y * canvas.width) * 4;
                    var r = data[idx];
                    tags_1[dt + 4] = r / 255;
                }
                tiles.push(new Tile(tile_values, tags_1));
            }
        }
        this._tiles = tiles;
    };
    Object.defineProperty(TileSet.prototype, "TILES", {
        get: function () {
            return this._tiles;
        },
        enumerable: true,
        configurable: true
    });
    return TileSet;
}());
var GridGeneratorMethod;
(function (GridGeneratorMethod) {
    GridGeneratorMethod[GridGeneratorMethod["Greedy"] = 0] = "Greedy";
    GridGeneratorMethod[GridGeneratorMethod["WaveCollapse"] = 1] = "WaveCollapse";
})(GridGeneratorMethod || (GridGeneratorMethod = {}));
var GridGenerator = /** @class */ (function () {
    function GridGenerator(_TILES, _WIDTH, _HEIGHT, _METHOD, _COMPLETE_CALLBACK, _GENERATE_CALLBACK, _INITIATE_CALLBACK, _LOOKAHEAD, _ASYNC_LOOPS) {
        if (_COMPLETE_CALLBACK === void 0) { _COMPLETE_CALLBACK = function () { return 0; }; }
        if (_GENERATE_CALLBACK === void 0) { _GENERATE_CALLBACK = function () { return 0; }; }
        if (_INITIATE_CALLBACK === void 0) { _INITIATE_CALLBACK = function () { return 0; }; }
        if (_LOOKAHEAD === void 0) { _LOOKAHEAD = 5; }
        if (_ASYNC_LOOPS === void 0) { _ASYNC_LOOPS = 20; }
        this._TILES = _TILES;
        this._WIDTH = _WIDTH;
        this._HEIGHT = _HEIGHT;
        this._METHOD = _METHOD;
        this._COMPLETE_CALLBACK = _COMPLETE_CALLBACK;
        this._GENERATE_CALLBACK = _GENERATE_CALLBACK;
        this._INITIATE_CALLBACK = _INITIATE_CALLBACK;
        this._LOOKAHEAD = _LOOKAHEAD;
        this._ASYNC_LOOPS = _ASYNC_LOOPS;
        this.ASYNC_LOOPS = 5;
        this.tile_grid = new TileGrid(_TILES, _WIDTH, _HEIGHT);
        this.generate();
    }
    GridGenerator.prototype.greedy_step = function () {
        var _this = this;
        if (!this.tile_grid.undecided_tiles_on_map())
            return false;
        var undecided_ij = this.tile_grid.get_undecided_tiles();
        for (var idx = 0; idx < undecided_ij.length; idx++) {
            var i_1 = undecided_ij[idx][0];
            var j_1 = undecided_ij[idx][1];
            var options = this.tile_grid.valid_options(i_1, j_1);
            if (options.length == 0)
                continue;
            var choice = options[Math.floor(options.length * Math.random())];
            this.tile_grid.set_tile(i_1, j_1, choice);
            return;
        }
        var random_undecidable = undecided_ij[Math.floor(undecided_ij.length * Math.random())];
        var i = random_undecidable[0], j = random_undecidable[1];
        var clear_cell = function (i, j) {
            [[i + 1, j], [i, j - 1], [i - 1, j], [i, j + 1]].forEach(function (position) {
                if (!_this.tile_grid.contains(position[0], position[1]))
                    return;
                _this.tile_grid.set_tile(position[0], position[1], undefined);
                if (_this.tile_grid.valid_options(position[0], position[1]).length == 1) {
                    clear_cell(position[0], position[1]);
                }
            });
        };
        clear_cell(i, j);
        return true;
    };
    GridGenerator.prototype.setup_wave_collapse = function () {
        this.tile_possibilities = [];
        for (var i = 0; i < this.tile_grid.tile_width; i++) {
            this.tile_possibilities[i] = [];
            for (var j = 0; j < this.tile_grid.tile_height; j++) {
                this.tile_possibilities[i][j] = [];
                for (var k = 0; k < this.tile_grid.tiles.length; k++) {
                    this.tile_possibilities[i][j][k] = true;
                }
            }
        }
    };
    GridGenerator.prototype.valid_adj = function (id0, i0, j0, id1, i1, j1) {
        if (!this.adj_cache) {
            this.adj_cache = [];
            for (var i_2 = -1; i_2 < 3; i_2++) {
                this.adj_cache[i_2] = [];
                for (var j_2 = -1; j_2 < 3; j_2++) {
                    this.adj_cache[i_2][j_2] = [];
                    for (var k = 0; k < this.tile_grid.tiles.length; k++) {
                        this.adj_cache[i_2][j_2][k] = [];
                    }
                }
            }
        }
        var i = i1 - i0;
        var j = j1 - j0;
        var valid = this.adj_cache[i][j][id0][id1];
        if (valid == undefined) {
            var tile0 = this.tile_grid.tiles[id0];
            var tile1 = this.tile_grid.tiles[id1];
            this.adj_cache[i][j][id0][id1] = this.tile_grid.valid_adjacent(tile0, i0, j0, tile1, i1, j1);
        }
        return this.adj_cache[i][j][id0][id1];
    };
    //wave update block
    GridGenerator.prototype.update = function (v) {
        var i = v.x, j = v.y;
        console.assert(i >= 0);
        console.assert(j >= 0);
        console.assert(i < this.tile_grid.tile_width);
        console.assert(j < this.tile_grid.tile_height);
        var adj = [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]];
        for (var k = 0; k < this.tile_grid.tiles.length; k++) {
            if (!this.tile_possibilities[i][j][k])
                continue;
            for (var y = 0; y < adj.length; y++) {
                var adj_i = adj[y][0], adj_j = adj[y][1];
                if (!this.tile_grid.contains(adj_i, adj_j))
                    continue;
                if (this.wave_entropy(adj_i, adj_j) == 0)
                    continue;
                var any_good = false;
                for (var l = 0; l < this.tile_grid.tiles.length; l++) {
                    if (!this.tile_possibilities[adj_i][adj_j][l])
                        continue;
                    if (this.valid_adj(k, i, j, l, adj_i, adj_j)) {
                        any_good = true;
                        break;
                    }
                }
                if (!any_good) {
                    this.tile_possibilities[i][j][k] = false;
                    break;
                }
            }
        }
    };
    GridGenerator.prototype.bfs_update = function (v) {
        var Q = [v];
        var V = new VectorSet();
        while (Q.length != 0) {
            var B = Q.shift();
            if (V.has(B) ||
                B.x < 0 ||
                B.y < 0 ||
                B.x >= this.tile_grid.tile_width ||
                B.y >= this.tile_grid.tile_height ||
                B.manhattanDistance(v) > this._LOOKAHEAD) {
                continue;
            }
            V.add(B);
            this.update(B);
            Q.push(new Vector(B.x - 1, B.y));
            Q.push(new Vector(B.x + 1, B.y));
            Q.push(new Vector(B.x, B.y - 1));
            Q.push(new Vector(B.x, B.y + 1));
        }
    };
    GridGenerator.prototype.wave_entropy = function (i, j) {
        var entropy = 0;
        for (var k = 0; k < this.tile_grid.tiles.length; k++) {
            if (this.tile_possibilities[i][j][k]) {
                entropy++;
            }
        }
        return entropy;
    };
    GridGenerator.prototype.wave_set_tile = function (v, id) {
        console.assert(this._METHOD == GridGeneratorMethod.WaveCollapse);
        for (var k = 0; k < this.tile_grid.tiles.length; k++) {
            this.tile_possibilities[v.x][v.y][k] = id == k;
        }
        this.bfs_update(v);
    };
    GridGenerator.prototype.select_tile = function (tiles) {
        var sum_of_weights = 0;
        tiles.forEach(function (tile) {
            sum_of_weights += tile.get_tag(Tile.WEIGHT_TAG_IDX);
        });
        console.log(sum_of_weights);
        var select = Math.random() * sum_of_weights;
        var sum = 0;
        for (var idx = 0; idx < tiles.length; idx++) {
            var tile = tiles[idx];
            sum += tile.get_tag(Tile.WEIGHT_TAG_IDX);
            if (sum > select) {
                return tile;
            }
        }
        console.assert(false);
        return undefined;
    };
    GridGenerator.prototype.collapse = function (v) {
        var i = v.x, j = v.y;
        var options = [];
        for (var k = 0; k < this.tile_grid.tiles.length; k++) {
            if (this.tile_possibilities[i][j][k]) {
                options.push(this.tile_grid.tiles[k]);
            }
        }
        //const collapsed = options[Math.floor(Math.random()*options.length)];
        var collapsed = this.select_tile(options);
        for (var k = 0; k < this.tile_grid.tiles.length; k++) {
            if (this.tile_grid.tiles[k] === collapsed) {
                this.tile_possibilities[i][j][k] = true;
                this.tile_grid.set_tile(i, j, this.tile_grid.tiles[k]);
            }
            else {
                this.tile_possibilities[i][j][k] = false;
            }
        }
    };
    GridGenerator.prototype.wave_collapse_step = function () {
        if (!this.tile_grid.undecided_tiles_on_map())
            return false;
        var min_entropy = this.tile_grid.tiles.length * 2;
        var min_tile = [];
        for (var i = 0; i < this.tile_grid.tile_width; i++) {
            for (var j = 0; j < this.tile_grid.tile_height; j++) {
                var v_1 = new Vector(i, j);
                if (this.tile_grid.get_tile(i, j) !== undefined) {
                    continue;
                }
                var entropy = this.wave_entropy(i, j);
                if (entropy == 0) {
                    continue;
                }
                if (entropy == min_entropy) {
                    min_tile.push(v_1);
                }
                else if (entropy < min_entropy) {
                    min_tile = [v_1];
                    min_entropy = entropy;
                }
            }
        }
        console.assert(min_tile.length != 0);
        if (min_tile.length == 0) {
            console.log("no options");
            return false;
        }
        var X = min_tile[Math.floor(Math.random() * min_tile.length)];
        this.collapse(X);
        this.bfs_update(X);
        return true;
    };
    GridGenerator.prototype.generate = function () {
        var _this = this;
        var self = this;
        if (this._METHOD == GridGeneratorMethod.Greedy) {
            var looper_1 = function () {
                for (var loop = 0; loop < self.ASYNC_LOOPS; loop++) {
                    var loop_again = self.greedy_step();
                    if (!loop_again) {
                        self._COMPLETE_CALLBACK(self);
                        return;
                    }
                }
                self._GENERATE_CALLBACK(self);
                requestAnimationFrame(looper_1);
            };
            looper_1();
        }
        if (this._METHOD == GridGeneratorMethod.WaveCollapse) {
            var looper_2 = function () {
                for (var loop = 0; loop < self.ASYNC_LOOPS; loop++) {
                    var loop_again = _this.wave_collapse_step();
                    if (!loop_again) {
                        self._COMPLETE_CALLBACK(self);
                        return;
                    }
                }
                self._GENERATE_CALLBACK(self);
                requestAnimationFrame(looper_2);
            };
            this.setup_wave_collapse();
            this._INITIATE_CALLBACK(this);
            looper_2();
        }
    };
    Object.defineProperty(GridGenerator.prototype, "TILES", {
        get: function () {
            return this.tile_grid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGenerator.prototype, "WIDTH", {
        get: function () {
            return this._WIDTH;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGenerator.prototype, "HEIGHT", {
        get: function () {
            return this._HEIGHT;
        },
        enumerable: true,
        configurable: true
    });
    return GridGenerator;
}());
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
        context.fillRect(x, 0, block_width, canvas.height);
        x += block_width;
    }
    h /= scheme.length;
    s /= scheme.length;
    v /= scheme.length;
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
var RGB = /** @class */ (function () {
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
var loaded = false;
var img = document.createElement("img");
img.onload = function () {
    var tile_canvas = document.createElement("canvas");
    tile_canvas.width = tile_canvas.height = 750;
    document.body.appendChild(tile_canvas);
    var ctx = tile_canvas.getContext("2d");
    var colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet", "darkgreen"];
    var t = 0;
    var render_grid = function (gg) {
        var gg_tile_grid = gg.TILES;
        var square_width = tile_canvas.width / gg_tile_grid.id_width;
        var square_height = tile_canvas.height / gg_tile_grid.id_height;
        ctx.clearRect(0, 0, tile_canvas.width, tile_canvas.height);
        for (var i = 0; i < gg_tile_grid.id_width; i++) {
            for (var j = 0; j < gg_tile_grid.id_height; j++) {
                if (gg_tile_grid.get_id(i, j) !== undefined) {
                    ctx.fillStyle = colors[gg_tile_grid.get_id(i, j)];
                    ctx.fillRect(i * square_width, j * square_height, square_width, square_height);
                }
                else {
                    //ctx.fillStyle = "black";
                    //const txt = gg.wave_entropy(Math.floor(i/3), Math.floor(j/3));
                    //ctx.fillText("" + txt, i*square_width, (j+1)*square_height);
                }
            }
        }
        //for(let i=0;i<tile_grid.tile_width;i++){
        //    ctx.beginPath();
        //    ctx.moveTo(i*square_width*3, 0);
        //    ctx.lineTo(i*square_width*3, tile_canvas.height);
        //    ctx.strokeStyle = "black";
        //    ctx.stroke();
        //    for(let j=0;j<tile_grid.tile_height;j++){
        //        ctx.beginPath();
        //        ctx.moveTo(0, j*square_height*3);
        //        ctx.lineTo(tile_canvas.width, j*square_height*3);
        //        ctx.strokeStyle = "black";
        //        ctx.stroke();
        //    }
        //}
        t = 1 - t;
        ctx.fillStyle = ["red", "green"][t];
        ctx.fillRect(t * 10, 0, 10, 10);
    };
    function initiate(gg) {
        var id = -1;
        outer: for (var i = 0; i < gg.TILES.tiles.length; i++) {
            var arr = gg.TILES.tiles[i];
            for (var j = 0; j < 3; j++)
                for (var k = 0; k < 3; k++)
                    if (arr.get(j, k) != 5)
                        continue outer;
            id = i;
            break;
        }
        for (var i = 0; i < gg.WIDTH; i++) {
            gg.wave_set_tile(new Vector(i, 0), id);
            gg.wave_set_tile(new Vector(i, gg.HEIGHT - 1), id);
        }
        for (var i = 0; i < gg.HEIGHT; i++) {
            gg.wave_set_tile(new Vector(0, i), id);
            gg.wave_set_tile(new Vector(gg.WIDTH - 1, i), id);
        }
    }
    var tiles = new TileSet(img).TILES;
    console.log(tiles);
    var gg = new GridGenerator(tiles, 40, 40, GridGeneratorMethod.WaveCollapse, function () { return console.log("donezo"); }, render_grid, initiate, 5, 1);
};
img.crossOrigin = "Anonymous";
img.src = "tiles-reformatted.png";
//# sourceMappingURL=out.js.map