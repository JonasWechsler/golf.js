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

class JointMovementSystem implements System{
    private moveTo(root:JointComponent, position:Vector){
        const self = this;

        root.mark = true;
        root.position = position;
        root.adjacent_flexible.forEach(function(connection){
            const joint = (connection.first == root ? connection.second : connection.first);
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

    private move(root:JointComponent, change:Vector){
        this.moveTo(root, root.position.plusEquals(change));
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
    }
}

class JointRenderSystem implements System{
    static render_connection(connection:FlexibleConnectionComponent|FixedConnectionComponent, 
                      dynamic:DynamicRenderComponent|UIComponent){
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
        ctx.lineWidth = 4;
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

    step(){
        const flexible_components = [ComponentType.FlexibleConnection, ComponentType.DynamicRender];
        const flexible_entities = EntityManager.current.get_entities(flexible_components);

        flexible_entities.forEach((entity) => {
            const connection = entity.get_component<FlexibleConnectionComponent>(ComponentType.FlexibleConnection);
            const target = entity.get_component<DynamicRenderComponent>(ComponentType.DynamicRender);
            JointRenderSystem.render_connection(connection, target);
        });

        const fixed_components = [ComponentType.FixedConnection, ComponentType.DynamicRender];
        const fixed_entities = EntityManager.current.get_entities(fixed_components);

        fixed_entities.forEach((entity) => {
            const connection = entity.get_component<FixedConnectionComponent>(ComponentType.FixedConnection);
            const target = entity.get_component<DynamicRenderComponent>(ComponentType.DynamicRender);
            JointRenderSystem.render_connection(connection, target);
        });
    }
}
