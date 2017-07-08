class HealthRenderer{
    private t:number = 0;

    public draw(ctx:CanvasRenderingContext2D, center: Vector, hp:number, maxhp:number){
        for(let i=0;i<maxhp;i++){
            const dt = this.t/10;
            const incr = Math.PI*2/maxhp;
            const theta = incr*i+dt;
            if(i > hp - 1){
                ctx.beginPath();
                ctx.arc(center.x, center.y, 20, theta, theta+incr);
                ctx.stroke();
            }else{
                ctx.beginPath();
                ctx.arc(center.x, center.y, 20, theta, theta+incr/2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(Math.cos(theta+incr*3/4)*20 + center.x, Math.sin(theta+incr*3/4)*20 + center.y, 5, 0, 2*Math.PI);
                ctx.stroke();
            }
        }
        this.t++;
    }
}

class PhysicsRender implements RenderObject{
    constructor(public physics:Physics){}

    private drawS(ctx:CanvasRenderingContext2D, v:Physics.StaticLineSegment){
        if(!WorldInfo.camera.camera_info().contains_line(v)) return;
        var v0 = v.v0;
        var v1 = v.v1;
        ctx.beginPath();
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.stroke();
    }

    private drawD(ctx:CanvasRenderingContext2D, dyn: Physics.Dynamic){
        if(!WorldInfo.camera.camera_info().contains(dyn.position)) return;
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
    }
}
