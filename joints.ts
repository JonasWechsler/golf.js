class FlexibleConnection implements Component{
    type:ComponentType = ComponentType.FlexibleConnection;
    constructor( public first : JointComponent,
                public second : JointComponent,
                public length : number){}
}

class JointComponent implements Component {
    type:ComponentType = ComponentType.Joint;
    public mark:boolean = false;//Used to BFS
    constructor( public position:Vector,
                public adjacent : FlexibleConnection[] = []) {}
}

class JointSystem implements System{
    //add_adjacent(root:JointComponent, joint: JointComponent){
    //    const distance = root.position.distanceTo(joint.position);
    //    root.adjacent.push(new Connection(joint, distance));
    //    joint.adjacent.push(new Connection(root, distance));
    //}

    moveTo(root:JointComponent, position:Vector){
        const self = this;

        root.mark = true;
        root.position = position;
        root.adjacent.forEach(function(connection){
            const joint = (connection.first == root?connection.second:connection.first);
            if(joint.mark) return;

            const di:Vector = root.position.minus(joint.position);
            const dd = di.length();
            const d = connection.length;
            if(dd > d){
                const c = (dd-d)/dd;
                self.move(joint, di.timesEquals(c));
            }
        });
        root.mark = false;
    }

    move(root:JointComponent, change:Vector){
        this.moveTo(root, root.position.plusEquals(change));
    }

    render_connection(connection:FlexibleConnection, dynamic:DynamicRenderComponent){
        const segment = new LineSegment(connection.first.position, connection.second.position);
        const bounding_box = segment.bounding_box();
        dynamic.x = bounding_box.left;
        dynamic.y = bounding_box.top;
        dynamic.content.width = bounding_box.width+6;
        dynamic.content.height = bounding_box.height+6;
        const ctx = dynamic.content.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(segment.v0.x - bounding_box.left, segment.v0.y - bounding_box.top);
        ctx.lineTo(segment.v1.x - bounding_box.left, segment.v1.y - bounding_box.top);
        ctx.lineWidth = 6;
        ctx.strokeStyle = "blue";
        ctx.stroke();
    }

    render_joint(entity:ECSEntity){
        const joint = entity.get_component<JointComponent>(ComponentType.Joint);
        const dynamic_render = entity.get_component<DynamicRenderComponent>(ComponentType.DynamicRender);
        const self = this;

        joint.adjacent.forEach((connection) => {
            self.render_connection(connection, dynamic_render);
        });
    }

    step(){
        const entities = EntityManager.current.get_entities([ComponentType.Joint, ComponentType.DynamicRender]);
        const self = this;

        entities.forEach((entity) => {
            const joint = entity.get_component<JointComponent>(ComponentType.Joint);
            if(entity.has_component(ComponentType.DynamicPhysics)){
                const dynamic_physics = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
                this.moveTo(joint, dynamic_physics.position);
            }
        });

        entities.forEach((entity) => self.render_joint(entity));
    }
}

/*
class Leech implements RenderObject{
    private joints : Joint[] = [];
    constructor(position:Vector, parts:number){
        for(let i=0;i<10;i++)
        this.joints.push(new Joint(position.x-i*5, position.y));

        for(let i=0;i<this.joints.length-1;i++){
            this.joints[i].add_adjacent(this.joints[i+1]);
        }
    }
    move_to(position:Vector){
        this.joints[0].move(position.x - this.joints[0].x, position.y - this.joints[0].y);
    }
    draw_line(points:Joint[], context:CanvasRenderingContext2D){
        for(let i=0;i+2<points.length;i++){
            let w = 20-20*i/points.length;

            const p = points[i];
            const q = points[i+1];
            const r = points[i+2];

            const x0 = (p.x+q.x)/2;
            const y0 = (p.y+q.y)/2;

            const x1 = (q.x+r.x)/2;
            const y1 = (q.y+r.y)/2;

            context.beginPath();
            context.lineCap = "round";
            context.lineWidth = w;
            context.moveTo(x0, y0);
            context.quadraticCurveTo(q.x, q.y, x1, y1);
            context.stroke();
        }
    }
    draw(ctx:CanvasRenderingContext2D){
        this.draw_line(this.joints, ctx);
    }
}
*/
