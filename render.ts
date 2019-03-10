class PhysicsRenderSystem implements System{
    constructor(render_statics:boolean=true){
        if(render_statics) this.render_statics();
    }

    render_statics(){
        const e = EntityManager.current;
        const statics = e.get_entities([ComponentType.StaticRender, ComponentType.StaticPhysics]);
        statics.forEach((s) => {
            const target = s.get_component<StaticRenderComponent>(ComponentType.StaticRender);
            const content = s.get_component<StaticPhysicsComponent>(ComponentType.StaticPhysics);
            const o = content.v1.minus(content.v0);
            const p = new LineSegment(new Vector(0, 0), new Vector(-o.y, o.x));
            const bbp = p.bounding_box();
            const bb = content.bounding_box();
            target.x = bb.left-3;
            target.y = bb.top-3;
            target.content.width = bb.width + 6;
            target.content.height = bb.height + 6;
            const ctx = target.content.getContext("2d");
            disableImageSmoothing(ctx);
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(3, 3);
            ctx.lineTo(bb.width+3, bb.height+3);
            ctx.closePath();
            ctx.stroke();
            ctx.fillRect(1, 1, 5, 5);
            ctx.fillRect(bb.width+1, bb.height+1, 5, 5);
        });
    }

    static render_bone_and_ball(e:ECSEntity){
        if(!e.has_component(ComponentType.Bone) && !e.has_component(ComponentType.DynamicPhysics))
            return;
        const target = e.get_component<DynamicRenderComponent>(ComponentType.DynamicRender);
        let bb;
        let bone_bb;
        let ball_bb;

        if(e.has_component(ComponentType.Bone)){
            const bone = e.get_component<BoneComponent>(ComponentType.Bone);
            bone_bb = bone.bounding_box();
            bb = bone_bb.pad(5);
        }

        if(e.has_component(ComponentType.DynamicPhysics)){
            const content = e.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            ball_bb = content.bounding_box();
            bb = bb.union(ball_bb);
        }

        target.x = bb.left;
        target.y = bb.top;
        target.content.width = bb.width;
        target.content.height = bb.height;
        const context = target.content.getContext("2d");

        let color = "black";
        if(BoneSelectSystem.current_endpoint === e){
            color = "red";
        }
        if(BoneSelectSystem.highlighted_endpoint() === e){
            color = "blue";
        }
        context.fillStyle = color;
        context.strokeStyle = color;

        if(e.has_component(ComponentType.Bone)){
            const bone = e.get_component<BoneComponent>(ComponentType.Bone);
            const origin = bone.origin();
            const end = bone.endpoint();
            context.beginPath();
            context.moveTo(origin.x - bb.left, origin.y - bb.top);
            context.lineTo(end.x - bb.left, end.y - bb.top);
            context.stroke();
        }

        if(e.has_component(ComponentType.DynamicPhysics)){
            const content = e.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            context.fillStyle = "black";
            const pt = content.position.minus(bb.position());
            context.beginPath();
            context.arc(pt.x, pt.y, content.r, 0, 2*Math.PI);
            context.fill();
        }
    }

    step(e:EntityManager){
        const dynamics = e.get_entities([ComponentType.DynamicRender]);
        dynamics.forEach(PhysicsRenderSystem.render_bone_and_ball);
    }
}

class MouseRenderSystem{
    constructor(){
        const mouse = EntityManager.current.get_entities([ComponentType.MouseInput,
            ComponentType.DynamicRender]);
        if(mouse.length == 0) return;
        assert(mouse.length == 1);
        const pos = mouse[0].get_component<MouseInputComponent>(ComponentType.MouseInput).position;
        const target = mouse[0].get_component<DynamicRenderComponent>(ComponentType.DynamicRender);
        target.content.width = 10;
        target.content.height = 10;
        const context = target.content.getContext("2d");
        context.beginPath();
        context.moveTo(0,0);
        context.lineTo(10,10);
        context.lineTo(0,10);
        context.lineTo(0,0);
        context.fill();
    }
    step(){
        const mouse = EntityManager.current.get_entities([ComponentType.MouseInput,
            ComponentType.DynamicRender]);
        if(mouse.length == 0) return;
        assert(mouse.length == 1);
        const pos = mouse[0].get_component<MouseInputComponent>(ComponentType.MouseInput).position;
        const target = mouse[0].get_component<DynamicRenderComponent>(ComponentType.DynamicRender);
        target.x = pos.x;
        target.y = pos.y;
    }
}
