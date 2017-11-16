class FlexibleConnectionComponent implements Component{
    type:ComponentType = ComponentType.FlexibleConnection;
    constructor( public first : JointComponent,
                public second : JointComponent,
                public length : number){}
}

class FixedConnectionComponent implements Component{
    type:ComponentType = ComponentType.FixedConnection;
    constructor( public first : JointComponent,
                public second : JointComponent,
                public relative_position : Vector){}
}

class JointComponent implements Component {
    type:ComponentType = ComponentType.Joint;
    public mark:boolean = false;//Used to BFS
    constructor( public position:Vector,
                public adjacent_flexible : FlexibleConnectionComponent[] = [],
                public adjacent_fixed : FixedConnectionComponent[] = []) {}
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
        root.adjacent_flexible.forEach(function(connection){
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
        root.adjacent_fixed.forEach(function(connection){
            const first = connection.first == root;
            const joint = (first?connection.second:connection.first);

            if(joint.mark) return;

            if(first){
                self.moveTo(joint, root.position.plus(connection.relative_position));
            }else{
                self.moveTo(joint, root.position.minus(connection.relative_position));
            }
        });
        root.mark = false;
    }

    move(root:JointComponent, change:Vector){
        this.moveTo(root, root.position.plusEquals(change));
    }

    render_connection(connection:FlexibleConnectionComponent|FixedConnectionComponent, dynamic:DynamicRenderComponent){
        const segment = new LineSegment(connection.first.position, connection.second.position);
        const bounding_box = segment.bounding_box();
        dynamic.x = bounding_box.left;
        dynamic.y = bounding_box.top;
        dynamic.content.width = bounding_box.width+30;
        dynamic.content.height = bounding_box.height+30;
        const ctx = dynamic.content.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(segment.v0.x - bounding_box.left, segment.v0.y - bounding_box.top);
        ctx.lineTo(segment.v1.x - bounding_box.left, segment.v1.y - bounding_box.top);
        ctx.lineWidth = 12;
        ctx.strokeStyle = "black";
        ctx.stroke();
    }

    step(){
        const joint_entities = EntityManager.current.get_entities([ComponentType.Joint]);
        const self = this;

        joint_entities.forEach((entity) => {
            const joint = entity.get_component<JointComponent>(ComponentType.Joint);
            if(entity.has_component(ComponentType.DynamicPhysics)){
                const dynamic_physics = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
                self.moveTo(joint, dynamic_physics.position);
            }
        });

        const flexible_components = [ComponentType.FlexibleConnection, ComponentType.DynamicRender];
        const flexible_entities = EntityManager.current.get_entities(flexible_components);

        flexible_entities.forEach((entity) => {
            const connection = entity.get_component<FlexibleConnectionComponent>(ComponentType.FlexibleConnection);
            const target = entity.get_component<DynamicRenderComponent>(ComponentType.DynamicRender);
            self.render_connection(connection, target);
        });

        const fixed_components = [ComponentType.FixedConnection, ComponentType.DynamicRender];
        const fixed_entities = EntityManager.current.get_entities(fixed_components);

        fixed_entities.forEach((entity) => {
            const connection = entity.get_component<FixedConnectionComponent>(ComponentType.FixedConnection);
            const target = entity.get_component<DynamicRenderComponent>(ComponentType.DynamicRender);
            self.render_connection(connection, target);
        });
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
