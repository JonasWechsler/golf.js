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
    draw: (canvas : CanvasRenderingContext2D) => void;
}

interface TimeListener{
    execute: (time: number) => void;
}

class RenderManager{
    private static objects : RenderObject[] = [];
    private static time_listeners : TimeListener[] = [];
    private static timer: number = 0;

    static add_render_object(object : RenderObject){
        this.objects.push(object);
    }

    static add_time_listener(listener : TimeListener){
        this.time_listeners.push(listener);
    }

    static draw_loop(){
        DOMManager.clear();
        RenderManager.objects.forEach(function(object){
            object.draw(DOMManager.context);
        });
        setTimeout(RenderManager.draw_loop, 10);
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
