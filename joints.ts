class FlexibleConnectionComponent implements Component{
    type:ComponentType = ComponentType.FlexibleConnection;
    constructor( public first : JointComponent,
                public second : JointComponent,
                public length : number,
                public width : number = 12){}
}

class FixedConnectionComponent implements Component{
    type:ComponentType = ComponentType.FixedConnection;
    constructor( public first : JointComponent,
                public second : JointComponent,
                public relative_position : Vector,
                public width : number = 12){}
}

class JointComponent implements Component {
    type:ComponentType = ComponentType.Joint;
    public mark:boolean = false;//Used to BFS
    constructor( public position:Vector,
                public adjacent_flexible : FlexibleConnectionComponent[] = [],
                public adjacent_fixed : FixedConnectionComponent[] = []) {}
    public forEachComponent(fn: (component:FlexibleConnectionComponent|FixedConnectionComponent) => void){
        this.adjacent_flexible.forEach(fn);
        this.adjacent_fixed.forEach(fn);
    }
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
        const width = connection.width;
        const segment = new LineSegment(connection.first.position, connection.second.position);
        const bounding_box = segment.bounding_box();
        dynamic.x = bounding_box.left - width;
        dynamic.y = bounding_box.top - width;
        dynamic.content.width = bounding_box.width+2*width;
        dynamic.content.height = bounding_box.height+2*width;
        const ctx = dynamic.content.getContext("2d");
        disableImageSmoothing(ctx);
        ctx.beginPath();
        ctx.moveTo(segment.v0.x - bounding_box.left + width, segment.v0.y - bounding_box.top + width);
        ctx.lineTo(segment.v1.x - bounding_box.left + width, segment.v1.y - bounding_box.top + width);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.lineCap = "square";
        ctx.stroke();

        let img_data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        for(let i=0;i<img_data.data.length;i+=4){
            img_data.data[i+0] = img_data.data[i+0];
            img_data.data[i+1] = img_data.data[i+1];
            img_data.data[i+2] = img_data.data[i+2];
            img_data.data[i+3] = img_data.data[i+3]>128?255:0;
        }
        const tmpc = document.createElement("canvas");
        tmpc.width = ctx.canvas.width;
        tmpc.height = ctx.canvas.height;
        const tmpctx = tmpc.getContext("2d");
        tmpctx.putImageData(img_data, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        disableImageSmoothing(ctx);
        ctx.drawImage(tmpc, 0, 0);
    }

    render_triple_joint(p:JointComponent, q:JointComponent, r:JointComponent, dynamic:DynamicRenderComponent){
        
    }

    render_joint(joint:JointComponent, dynamic:DynamicRenderComponent){
        const width = 12;

        let min_x, min_y, max_x, max_y;

        joint.forEachComponent((connection) => {
            const sibling = (connection.first == joint)?connection.second:connection.first;
            const segment = new LineSegment(connection.first.position, connection.second.position);
            const bounding_box = segment.bounding_box();
            
            min_x = Math.min(min_x, bounding_box.left);
            min_y = Math.min(min_y, bounding_box.top);
            max_x = Math.max(max_x, bounding_box.left + bounding_box.width);
            max_y = Math.max(max_y, bounding_box.top + bounding_box.height);
        });

        dynamic.x = min_x - width;
        dynamic.y = max_y - width;
        dynamic.content.width = max_x - min_x + width*2;
        dynamic.content.height = max_y - min_y + width*2;

        const context = dynamic.content.getContext("2d");
        disableImageSmoothing(context);
        context.lineCap = "square";
        context.lineWidth = width;

        joint.forEachComponent((first_connection) => {
            joint.forEachComponent((second_connection) => {
                if(first_connection == second_connection)
                    return;
                const first_joint = (first_connection.first == joint)?first_connection.second:first_connection.first
                const second_joint = (second_connection.first == joint)?second_connection.second:second_connection.first

                const p = first_joint.position.clone();
                const q = joint.position.clone();
                const r = second_joint.position.clone();

                const offset = new Vector(min_x, min_y);
                p.minusEquals(offset);
                q.minusEquals(offset);
                r.minusEquals(offset);

                const v0 = p.plus(q).divided(2); //(p + q)/2
                const v1 = q.plus(r).divided(2); //(q + r)/2

                context.beginPath();
                context.moveTo(v0.x, v0.y);
                context.quadraticCurveTo(q.x, q.y, v1.x, v1.y);
                context.stroke();
            });
        });

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

        //const drawable_joint_entities = EntityManager.current.get_entities([ComponentType.Joint, ComponentType.DynamicRender]);
        //drawable_joint_entities.forEach((entity) => {
        //    const joint = entity.get_component<JointComponent>(ComponentType.Joint);
        //    const dynamic = entity.get_component<DynamicRenderComponent>(ComponentType.DynamicRender);
        //    self.render_joint(joint, dynamic);
        //});

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
