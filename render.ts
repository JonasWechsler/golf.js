class DynamicRenderComponent implements Component{
    constructor(public x:number = 0, public y:number = 0, public content:HTMLCanvasElement = document.createElement("canvas"), public visible:boolean = true){}
    type:ComponentType = ComponentType.DynamicRender;
}

class StaticRenderComponent implements Component{
    constructor(public x:number = 0, public y:number = 0, public content:HTMLCanvasElement = document.createElement("canvas"), public z_index:number = 0){}
    type:ComponentType = ComponentType.StaticRender;
}

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
            const bb = content.bounding_box().pad(3);
            target.x = bb.left;
            target.y = bb.top;
            target.content.width = bb.width;
            target.content.height = bb.height;
            const ctx = target.content.getContext("2d");
            disableImageSmoothing(ctx);
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(content.v0.x - bb.left, content.v0.y - bb.top);
            ctx.lineTo(content.v1.x - bb.left, content.v1.y - bb.top);
            ctx.closePath();
            ctx.stroke();
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
            if(bb) bb = bb.union(ball_bb.pad(5));
            else bb = ball_bb.pad(5);
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
            context.stroke();
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
        MouseInfo.hide_mouse();
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
