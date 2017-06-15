abstract class NavigationMesh{
    abstract adjacent(p: Vector): Vector[];
    abstract get_vertices(): Vector[];

    neighbor_cache: VectorMap<Vector[]> = new VectorMap<Vector[]>();
    neighbors(p: Vector, depth: number): Vector[]{
        let result: VectorMap<number> = new VectorMap<number>();
        const self = this;
        const queue:[Vector, number][] = [[p, depth]];

        while (queue.length) {
          const q = queue.shift();
          const x = q[0].x, y = q[0].y, d = q[1];

          if (d == 0)
            continue;

          if (result.has(q[0]) && result.at(q[0]) <= d)
            continue;

          result.map(q[0], d);

          this.adjacent(q[0]).forEach(function (adj: Vector) {
            queue.push([adj, d-1]);
          });
        }

        return result.spread();
    }
}

class FiniteGridNavigationMesh extends NavigationMesh{
  vertices: Vector[] = [];
  constructor(private cell_width: number,
    private min_x: number,
    private max_x: number,
    private min_y: number,
  private max_y: number) {
    super();
    for(let i=min_x; i<max_x; i+= cell_width){
      for(let j=min_y; j<max_y; j+= cell_width){
        this.vertices.push(new Vector(i, j));
      }
    }
  }
  


  get_vertices(): Vector[]{
    return this.vertices;
  }
  
  adjacent(p:Vector) : Vector[]{
    if(!(p.x % this.cell_width === 0 && p.y % this.cell_width === 0)){
        return [];
    }

    const result : Vector[] = [];
    for(let i=-1;i<2;i++){
      for (let j = -1; j < 2; j++){
        const x = p.x + i * this.cell_width;
        const y = p.y + j * this.cell_width;
        if (x < this.min_x || x > this.max_x || y < this.min_y || y > this.max_y) continue;
        result.push(new Vector(x, y));
      }
    }
    return result;
  }
}

class NonintersectingFiniteGridNavigationMesh extends NavigationMesh{
    vertices: Vector[] = [];
    adjacent_map: VectorMap<Vector[]> = new VectorMap<Vector[]>();
    constructor(private cell_width: number,
                private min_x: number,
                private max_x: number,
                private min_y: number,
                private max_y: number,
                private physics: Physics){
                    super();
                    const mesh = new FiniteGridNavigationMesh(cell_width, min_x, max_x, min_y, max_y);

                    const self = this;
                    mesh.get_vertices().forEach((vertex) => {
                        self.vertices.push(vertex);
                        self.adjacent_map.map(vertex, []);
                        mesh.adjacent(vertex).forEach((adjacent) => {
                            if(physics.lineOfSightDistance(new LineSegment(vertex, adjacent), 10)){
                                self.adjacent_map.at(vertex).push(adjacent);
                            }
                        });
                    });
                    console.log(self.adjacent_map);
                }
    adjacent(p: Vector): Vector[]{
        return this.adjacent_map.at(p);
    }
    get_vertices(): Vector[]{
        return this.vertices;
    }
}

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
