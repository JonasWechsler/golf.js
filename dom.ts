class DOMManager{
    static canvas : HTMLCanvasElement;
    static context : CanvasRenderingContext2D;
    static make_canvas() : void {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext('2d');
    }
    static clear() : void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

interface RenderObject{
    draw(ctx:CanvasRenderingContext2D) : void;
}

interface TimeListener{
    execute: (time: number) => void;
}

class RenderComponent implements Component{
    constructor(public x:number, public y:number, public content:HTMLCanvasElement){}
    type:ComponentType = ComponentType.Render;
}

class UIComponent implements Component{
    constructor(public x:number, public y:number, public content:HTMLCanvasElement){}
    type:ComponentType = ComponentType.UI;
}

class TimerComponent implements Component{
    constructor(public time:number){}
    type:ComponentType = ComponentType.Timer;
}

class FPSComponent implements Component{
    public last_time:number;
    public fps:number[];
    constructor(){
        this.last_time = Date.now();
        this.fps = []
    }
    type:ComponentType = ComponentType.FPS;
}

class FPSSystem implements System{
    step(e:EntityManager){
        const entities = e.get_entities([ComponentType.FPS]);
        const time = Date.now();
        entities.forEach((entity) => {
            const fps = entity.get_component<FPSComponent>(ComponentType.FPS);
            const dt = time - fps.last_time;
            fps.last_time = time;
            fps.fps.push(Math.floor(1000/dt));
        });
        const output = e.get_entities([ComponentType.FPS, ComponentType.UI]);
        output.forEach((entity) => {
            const fps = entity.get_component<FPSComponent>(ComponentType.FPS);
            if(fps.fps.length < 100){
                return;
            }
            const ui = entity.get_component<UIComponent>(ComponentType.UI);
            const canvas = ui.content;
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, 100, 100);

            let avg = 0;
            fps.fps.forEach((v) => avg+=v);
            avg=Math.floor(avg/fps.fps.length);
            fps.fps = [];

            const str:string = "000" + avg.toString();
            ctx.fillText(str.substr(str.length-3, 3), 0, 100);
        });
    }
}

class UIRenderSystem{
    step(entity_manager:EntityManager){
        const targets = entity_manager.get_entities([ComponentType.UI]);
        DOMManager.clear();
        targets.forEach((entity) => {
            const ui = entity.get_component<UIComponent>(ComponentType.UI);
            DOMManager.context.drawImage(ui.content, ui.x, ui.y);
        });
    }
}

class TimeSystem{
    step(entity_manager:EntityManager){
        const targets = entity_manager.get_entities([ComponentType.Timer]);
        targets.forEach((entity) => {
            const timer = entity.get_component<TimerComponent>(ComponentType.Timer);
            timer.time++;
        });
    }
}

class RenderManager{
    private static time_listeners : TimeListener[] = [];
    private static timer: number = 0;

    static add_time_listener(listener : TimeListener){
        this.time_listeners.push(listener);
    }

    static execute_loop(){
        RenderManager.time_listeners.forEach(function(listener){
            listener.execute(RenderManager.time());
        });
        setTimeout(RenderManager.execute_loop, 10);
        RenderManager.timer++;
    }

    static time() : number{
        return this.timer;
    }
}
