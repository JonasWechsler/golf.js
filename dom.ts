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
    constructor(public fps:number){}
    type:ComponentType = ComponentType.FPS;
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
