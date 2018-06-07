class HealthComponent implements Component{
    type:ComponentType = ComponentType.Health;
    constructor(public hp:number, public max_hp:number){}
}

class HealthRenderingSystem implements System{
    step(){
        const entities = EntityManager.current.get_entities([ComponentType.Health,
                                                            ComponentType.DynamicRender]);
        entities.forEach((entity) => {
            const hp = entity.get_component<HealthComponent>(ComponentType.Health).hp;
            const max_hp = entity.get_component<HealthComponent>(ComponentType.Health).max_hp;
            const canvas = entity.get_component<DynamicRenderComponent>(ComponentType.DynamicRender).content;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, 2);
            ctx.fillStyle = "red";
            ctx.fillRect(0, 0, Math.floor((hp/max_hp)*canvas.width), 2);
            ctx.fillStyle = "black";
        });
    }
}

class HealthRenderer{
    public RADIUS : number = 60;
    private t:number = 0;

    public draw(ctx:CanvasRenderingContext2D, center: Vector, hp:number, maxhp:number){
        for(let i=0;i<maxhp;i++){
            const dt = this.t/10;
            const incr = Math.PI*2/maxhp;
            const theta = incr*i+dt;
            if(i > hp - 1){
                ctx.beginPath();
                ctx.arc(center.x, center.y, this.RADIUS, theta, theta+incr);
                ctx.stroke();
            }else{
                ctx.beginPath();
                ctx.arc(center.x, center.y, this.RADIUS, theta, theta+incr/2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(Math.cos(theta+incr*3/4)*this.RADIUS + center.x,
                        Math.sin(theta+incr*3/4)*this.RADIUS + center.y,
                        5, 0, 2*Math.PI);
                ctx.stroke();
            }
        }
        this.t++;
    }
}

