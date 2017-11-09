class Connection{
    constructor( public joint : Joint,
                public length : number){}
}

class Joint{
    constructor(
        public x:number,
        public y:number){}

        public adjacent : Connection[] = [];
        public mark : boolean = false;

        add_adjacent(joint: Joint){
            const dx = this.x - joint.x;
            const dy = this.y - joint.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            this.adjacent.push(new Connection(joint, distance));
            joint.adjacent.push(new Connection(joint, distance));
        }

        move(x:number, y:number){
            this.mark = true;
            this.x += x;
            this.y += y;
            const self = this;
            this.adjacent.forEach(function(connection){
                if(connection.joint.mark) return;

                const dx = self.x - connection.joint.x;
                const dy = self.y - connection.joint.y;
                const d = connection.length;
                const di = Math.sqrt(dx*dx + dy*dy);
                if(di > d){
                    const c = (di-d)/di;
                    connection.joint.move(dx*c, dy*c);
                }
            });
            this.mark = false;
        }
}

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
