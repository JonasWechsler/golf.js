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

    step(e:EntityManager){
        const dynamics = e.get_entities([ComponentType.DynamicPhysics, ComponentType.DynamicRender]);
        dynamics.forEach((s) => {
            const target = s.get_component<DynamicRenderComponent>(ComponentType.DynamicRender);
            const content = s.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            const center = target.content.width/2;
            target.x = content.position.x - center;
            target.y = content.position.y - center;
            const ctx = target.content.getContext("2d");
            disableImageSmoothing(ctx);
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.beginPath();
            ctx.arc(center, center, content.r, 0, 2*Math.PI);
            ctx.fill();
        });
    }

    /*
    private drawS(ctx:CanvasRenderingContext2D, v:Physics.StaticLineSegment){
        if(!CameraSystem.camera_info().contains_line_partially(v)) return;
        var v0 = v.v0;
        var v1 = v.v1;
        ctx.beginPath();
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.stroke();
    }

    private drawD(ctx:CanvasRenderingContext2D, dyn: Physics.Dynamic){
        if(!CameraSystem.camera_info().contains(dyn.position)) return;
        const ball : Physics.DynamicBall = dyn as Physics.DynamicBall;

        if('draw' in ball){
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
            const ent : Physics.DynamicBall & RenderObject = ball as Physics.DynamicBall & RenderObject;
            ent.draw(ctx);
        }else{
            ctx.strokeStyle = "blue";
            ctx.fillStyle = "blue";

            ctx.beginPath();
            ctx.arc(ball.position.x, ball.position.y, ball.r, 0, 2 * Math.PI);
            ctx.stroke();
        }

        if('get_health' in ball){
            const ent : Physics.DynamicBall & Killable = ball as Physics.DynamicBall & Killable;
            ctx.lineWidth = 2;
            ctx.fillStyle = "red";
            ctx.fillRect(ent.position.x - 20, ent.position.y - ent.r - 10, ent.get_health(), 10);
            ctx.strokeStyle = "rgba(0, 0, 0, .5)";
            new HealthRenderer().draw(ctx, ent.position, ent.get_health(), ent.get_max_health());
        }
    }

    private drawF(ctx:CanvasRenderingContext2D, fix: Physics.Fixed){
        var fixed = fix as Physics.Flapper;
        ctx.strokeStyle = fixed.material.debugColor;
        ctx.fillStyle = fixed.material.debugColor;
        for (var j = 0; j < fixed.segments.length; j++) {
            this.drawS(ctx, fixed.segments[j]);
        }
    }

    private drawT(ctx:CanvasRenderingContext2D, trig:Physics.Trigger){
        const trigger : Physics.TriggerLineSegment = trig as Physics.TriggerLineSegment;
        ctx.beginPath();
        ctx.moveTo(trigger.v0.x, trigger.v0.y);
        ctx.lineTo(trigger.v1.x, trigger.v1.y);
        ctx.stroke();
    }

    public draw(ctx:CanvasRenderingContext2D):void {
        const self = this;
        var canvas = <HTMLCanvasElement>ctx.canvas;
        ctx.fillStyle = "rgba(255,255,255,.01)";
        ctx.strokeStyle = "black";
        this.physics.getStatics().forEach((stat) => {self.drawS(ctx, stat)});
        this.physics.getFixeds().forEach((fix) => {self.drawF(ctx, fix)});

        this.physics.getDynamics().forEach((dyn) => {self.drawD(ctx, dyn)});

        ctx.strokeStyle = "orange";
        ctx.fillStyle = "orange";
        this.physics.getTriggers().forEach((trig) => {self.drawT(ctx, trig)});
    }*/
}
