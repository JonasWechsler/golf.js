interface Entity{
    step():void;
}

class Player extends Physics.DynamicBall{
    private keyHandler : KeyHandler = new KeyHandler(document);

	constructor(position:Vector, radius:number, speed:Vector){
		super(position, radius, speed);
	}

    step(){
        const A = this.keyHandler.isDown('A');
        const D = this.keyHandler.isDown('D');
        const S = this.keyHandler.isDown('S');
        const W = this.keyHandler.isDown('W');

        let ddx = 0, ddy = 0;

        if(A && !D){
            ddx = -1;
        }else if(D && !A){
            ddx = 1;
        }else{
            ddx = 0;
        }

        if (S && !W) {
            ddy = 1;
        }else if (W && !S) {
            ddy = -1;
        }else{
            ddy = 0;
        }
        this.speed = new Vector(ddx, ddy).unit().times(2);
    }
}

interface AIState{
    weight(pt:Vector):number;
}

class NullState implements AIState{
    weight(pt:Vector):number{
        return 0;
    }
}

class IsolationState implements AIState{
    weight(pt:Vector):number{
        const player = WorldInfo.player.position;
        if(WorldInfo.physics.lineOfSight(new LineSegment(pt, player))){
            return 0;
        }else{
            return pt.distanceToSquared(player);
        }
    }
}

class AI extends Physics.DynamicBall{
    public path : Vector[];
    private state : AIState = new IsolationState();
    constructor(p:Vector, r:number, s:Vector){
        super(p, r, s);
        this.path = [p];
    }

    update_path(){
        const options:[number, Vector][] = [];
        const self = this;
        WorldInfo.mesh.neighbors(this.target(), 7).forEach(
            (pt:Vector) => {
                const weight = self.state.weight(pt);
                options.push([weight, pt]);
            }
        );
        options.sort((a, b) => b[0] - a[0]);
        const objective = options[0][1];

        //BFS
        const successor:VectorMap<Vector> = new VectorMap<Vector>();
        const touched:VectorSet = new VectorSet();
        const queue:Vector[] = [];

        touched.add(this.target());
        queue.push(this.target());

        while(queue.length !== 0){
            const current = queue.shift();

            if(current.equals(objective)){
                break;
            }

            WorldInfo.mesh.adjacent(current).forEach(
                (n:Vector) => {
                    if(touched.has(n))
                        return;
                    touched.add(n);
                    successor.map(n, current);
                    queue.push(n);
                }
            );
        }

        const path = [];
        for(let i=objective;i!==this.target();i=successor.at(i)){
            if(!i)break;
            path.push(i);
        }
        path.push(this.target());
        this.path = path;
    }

    target() : Vector{
        return this.path[this.path.length-1];
    }

    objective() : Vector{
        return this.path[0];
    }
    
    change_state(){

    }

    step(){
        this.update_path();

        const objective = this.target();
        
        const d = objective.minus(this.position);
        this.speed = d.clampTo(1);

        if(this.position.distanceTo(objective) < 1)
            if(this.path.length > 1) this.path.pop();
            else this.change_state();
    }
}
