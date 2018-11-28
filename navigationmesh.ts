class NavigationMeshComponent implements Component{
    type:ComponentType = ComponentType.NavigationMesh;
    constructor(public vertices: Vector[] = [],
                public adjacent_map: VectorMap<Vector[]> = new VectorMap<Vector[]>(),
                public nearest_vertex: (v:Vector) => Vector = undefined){
        if(!nearest_vertex){
            this.nearest_vertex = (v) => {
                let min_dist = Number.MAX_VALUE;
                let min_v = this.vertices[0];
                for(let i=0;i<this.vertices.length;i++){
                    const dist = v.distanceToSquared(this.vertices[i]);
                    if(dist < min_dist){
                        min_dist = dist;
                        min_v = this.vertices[i];
                    }
                }
                return min_v;
            };
        }
    }
}

class NavigationPathComponent implements Component{
    type:ComponentType = ComponentType.NavigationPath;
    constructor(public vertices: Vector[] = []){}
}

class NavigationMeshSystem implements System{
    static make_navigation_mesh(
                min_x: number,
                min_y: number,
                max_x: number,
                max_y: number){
                    const settings_entity = EntityManager.current.get_entities([ComponentType.Settings])[0];
                    const settings = settings_entity.get_component<SettingsComponent>(ComponentType.Settings);
                    const vertices: Vector[] = [];
                    const adjacent_map: VectorMap<Vector[]> = new VectorMap<Vector[]>();
                    for(let i=min_x; i<max_x; i+= settings.cell_width){
                        for(let j=min_y; j<max_y; j+= settings.cell_height){
                            const vertex = new Vector(i, j);

                            adjacent_map.map(vertex, []);

                            [
                                new Vector(i - settings.cell_width, j),
                                new Vector(i + settings.cell_width, j),
                                new Vector(i, j - settings.cell_height),
                                new Vector(i, j + settings.cell_height),
                                new Vector(i - settings.cell_width, j + settings.cell_width),
                                new Vector(i - settings.cell_width, j - settings.cell_width),
                                new Vector(i + settings.cell_width, j + settings.cell_width),
                                new Vector(i + settings.cell_width, j - settings.cell_width)
                            ].forEach((adj) => {
                                if(adj.x < min_x || adj.x >= max_x || adj.y < min_y || adj.y >= max_y)
                                    return;
                                if(!PhysicsSystem.lineOfSightDistance(new LineSegment(vertex, adj), 1))
                                    return;
                                adjacent_map.at(vertex).push(adj);
                            });
                            if(adjacent_map.at(vertex).length != 0)
                                vertices.push(vertex);
                            else
                                adjacent_map.unmap(vertex);
                        }
                    }
                    return new NavigationMeshComponent(vertices, adjacent_map);
                }

    static L1_NORM(a:Vector, b:Vector):number{
        return a.manhattanDistance(b);
    }

    static L2_NORM(a:Vector, b:Vector):number{
        return a.distanceToSquared(b);
    }

    private static reconstruct_path(previous:VectorMap<Vector>, current:Vector):Vector[]{
        const path:Vector[] = [];
        while(previous.has(current)){
            path.push(current);
            current = previous.at(current);
        }

        return path;
    }

    static find_path(start:Vector,
                     end:Vector,
                     adj: VectorMap<Vector[]>,
                     heuristic: (a:Vector,
                                 b:Vector) => number = NavigationMeshSystem.L2_NORM){
        const closed = new VectorSet();

        const fscore = new VectorMap<number>(Number.MAX_VALUE);
        fscore.map(start, heuristic(start, end));
        
        const comparator = (a:Vector,b:Vector) => fscore.at(a) <= fscore.at(b);
        const open_queue = new PriorityQueue<Vector>(comparator);
        const open_set = new VectorSet();
        open_queue.push(start);
        open_set.add(start);

        const previous = new VectorMap<Vector>();

        const gscore = new VectorMap<number>(Number.MAX_VALUE);
        gscore.map(start, 0);

        while(!open_queue.empty()){
            const current = open_queue.pop();
            open_set.remove(current);

            if(current.equals(end)){
                return NavigationMeshSystem.reconstruct_path(previous, current);
            }

            closed.add(current);

            adj.at(current).forEach((v) => {
                if(closed.has(v))
                    return;

                if(!open_set.has(v)){
                    open_queue.push(v);
                    open_set.add(v);
                }

                const tentative_gscore = gscore.at(current) + heuristic(current, v);

                if(tentative_gscore >= gscore.at(v))
                    return;

                previous.map(v, current);
                gscore.map(v, tentative_gscore);
                fscore.map(v, tentative_gscore + heuristic(v, end));
            });
        }

        return [];
    }

    step(){
        const AIs = EntityManager.current.get_entities([ComponentType.NavigationMesh,
                                                       ComponentType.NavigationPath,
                                                       ComponentType.AIInput,
                                                       ComponentType.DynamicPhysics]);
        AIs.forEach((entity) => {
            const mesh = entity.get_component<NavigationMeshComponent>(ComponentType.NavigationMesh);
            const path = entity.get_component<NavigationPathComponent>(ComponentType.NavigationPath);
            const input = entity.get_component<AIInputComponent>(ComponentType.AIInput);
            const physics = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            const destination = mesh.nearest_vertex(input.destination);
            const position = mesh.nearest_vertex(physics.position);
            if(path.vertices.length == 0 || destination.distanceToSquared(path.vertices[0]) > 1)
                path.vertices = NavigationMeshSystem.find_path(position, destination, mesh.adjacent_map);

            if(path.vertices.length > 0 && path.vertices[path.vertices.length-1].distanceToSquared(physics.position) < 1)
                path.vertices.pop();

            if(path.vertices.length > 0)
                input.walk_target = path.vertices[path.vertices.length-1];
            else
                input.walk_target = input.destination;
        });
    }
}

/*
abstract class NavigationMesh implements RenderObject{
    abstract adjacent(p: Vector): Vector[];
    abstract get_vertices(): Vector[];

    neighbor_cache: VectorMap<Vector[]> = new VectorMap<Vector[]>();
    neighbors(p: Vector, depth: number): Vector[]{
        if(!this.adjacent(p)) throw "Not a part of navigation mesh: " + p;
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

    draw(ctx: CanvasRenderingContext2D){
        const self = this;
        ctx.beginPath();
        this.get_vertices().forEach(function(v){
            self.adjacent(v).forEach(function(w){
                ctx.moveTo(v.x, v.y);
                ctx.lineTo(w.x, w.y);
            });
        });
        ctx.stroke();
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
                private max_y: number){
                    super();
                    const mesh = new FiniteGridNavigationMesh(cell_width, min_x, max_x, min_y, max_y);

                    const self = this;
                    mesh.get_vertices().forEach((vertex) => {
                        self.vertices.push(vertex);
                        self.adjacent_map.map(vertex, []);
                        mesh.adjacent(vertex).forEach((adjacent) => {
                            if(adjacent.x < min_x || adjacent.x >= max_x ||
                               adjacent.y < min_y || adjacent.y >= max_y)
                                return;
                            if(!PhysicsSystem.lineOfSightDistance(new LineSegment(vertex, adjacent), 10))
                                return;

                            self.adjacent_map.at(vertex).push(adjacent);
                        });
                    });
                }
    adjacent(p: Vector): Vector[]{
        return this.adjacent_map.at(p);
    }
    get_vertices(): Vector[]{
        return this.vertices;
    }
}
*/

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
