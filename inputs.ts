/*Running*/

class ControlSystem{
    constructor(){}
    step(){
        const entities = EntityManager.current.get_entities([ComponentType.KeyInput, ComponentType.DynamicPhysics]);
        entities.forEach((entity) => {
            const dynamic = entity.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics);
            const keys = entity.get_component<KeyInputComponent>(ComponentType.KeyInput);
            const speed = dynamic.speed;
            const accel = dynamic.r*.25;
            if(speed.x >-accel)
            speed.x -= keys.left?accel:0;
            if(speed.x <accel)
            speed.x += keys.right?accel:0;
            if(speed.y >-accel)
            speed.y -= keys.up?accel:0;
            if(speed.y <accel)
            speed.y += keys.down?accel:0;
            if(!keys.up && !keys.down && !keys.left && !keys.right){
                speed.timesEquals(0);
            }
        });
    }
}

class KeyInputSystem implements System{
    private static keys_down: boolean[] = [];
    private static has_setup: boolean = false;
    static is_down(code: number): boolean{
        return this.keys_down[code];
    }

    static code(str: string): number{
        if(str.toLowerCase() == 'ctrl') return 17;
        return str.charCodeAt(0);
    }
    public static setup(){
        if(KeyInputSystem.has_setup) return;
        const self = this;
        function handle_down(event: KeyboardEvent){
            event.preventDefault();
            if(self.keys_down[event.keyCode]){
                return;
            }

            self.keys_down[event.keyCode] = true;
        }
        function handle_up(event: KeyboardEvent){
            event.preventDefault();
            self.keys_down[event.keyCode] = false;
        }
        document.addEventListener('keydown', handle_down, false);
        document.addEventListener('keyup', handle_up, false);
        KeyInputSystem.has_setup = true;
    }

    constructor(){
        KeyInputSystem.setup();
    }
    step(){
        const self = this;
        EntityManager.current.get_entities([ComponentType.KeyInput]).forEach(
            (entity) => {
                const input = entity.get_component<KeyInputComponent>(ComponentType.KeyInput);
                input.up = KeyInputSystem.is_down(KeyInputSystem.code('W'));
                input.left = KeyInputSystem.is_down(KeyInputSystem.code('A'));
                input.down = KeyInputSystem.is_down(KeyInputSystem.code('S'));
                input.right = KeyInputSystem.is_down(KeyInputSystem.code('D'));
                const next_item = KeyInputSystem.is_down(KeyInputSystem.code('ctrl'));
                input.just_next_item = !input.next_item && next_item;
                input.next_item = next_item;
            }
        );
    }
}

class KeyInputComponent implements Component{
    type:ComponentType = ComponentType.KeyInput;
    up:boolean = false;
    down:boolean = false;
    left:boolean = false;
    right:boolean = false;
    use:boolean = false;
    alt_use:boolean = false;
    next_item:boolean = false;
    just_used:boolean = false;
    just_alt_used:boolean = false;
    just_next_item:boolean = false;
    constructor(){}
}

class MouseInputComponent implements Component{
    type:ComponentType = ComponentType.MouseInput;
    x:number = 0;
    y:number = 0;
    dx:number = 0;
    dy:number = 0;
    //direction:number = 0;
    left:boolean = false;
    middle:boolean = false;
    right:boolean = false;
    get position():Vector{
        return new Vector(this.x, this.y);
    }
}

class MouseInputSystem implements System{
    step(){
        const self = this;
        EntityManager.current.get_entities([ComponentType.MouseInput]).forEach(
            (entity) => {
                const input = entity.get_component<MouseInputComponent>(ComponentType.MouseInput);
                const position = CameraSystem.screen_to_camera(MouseInfo.position);
                input.dx = position.x - input.x;
                input.dy = position.y - input.y;
                input.x = position.x;
                input.y = position.y;
                input.left = MouseInfo.down(1);
                input.middle = MouseInfo.down(2);
                input.right = MouseInfo.down(3);
            }
        );
        EntityManager.current.get_entities([ComponentType.KeyInput]).forEach(
            (entity) => {
                const input = entity.get_component<KeyInputComponent>(ComponentType.KeyInput);
                const use = MouseInfo.down(1);
                input.just_used = use && !input.use;
                input.use = use;
                const alt_use = MouseInfo.down(2);
                input.just_alt_used = alt_use && !input.alt_use;
                input.alt_use = alt_use;
                //input.left = MouseInfo.down(1);
                //input.middle = MouseInfo.down(2);
                //input.right = MouseInfo.down(3);
            }
        );
    }
}

interface MouseListener{
    onclick: (x : number, y : number, which : number) => void;
    ondown: (x : number, y : number, which : number) => void;
    onup: (x : number, y : number, which : number) => void;
    onmove: (x: number, y: number) => void;
}

class MouseInfo{
    private static mouse_x : number = 0;
    private static mouse_y : number = 0;
    private static _mouse_down : boolean[] = [false, false, false];

    private static listeners : MouseListener[] = [];

    private static trigger_clicks(x : number, y : number, which : number){
        MouseInfo.listeners.forEach(function(listener){
            listener.onclick(x,y,which);
        });
    }

    private static trigger_downs(x : number, y : number, which : number){
        MouseInfo.listeners.forEach(function(listener){
            listener.ondown(x, y, which);
        });
    }

    private static trigger_ups(x : number, y : number, which : number){
        MouseInfo.listeners.forEach(function(listener){
            listener.onup(x, y, which);
        });
    }

    private static trigger_moves(x : number, y : number){
        MouseInfo.listeners.forEach(function(listener){
            listener.onmove(x, y);
        });
    }

    static setup(){
        function handleMouseMove(event: any) {
            event = event || window.event; // IE-ism

            if (event.pageX == null && event.clientX != null) {
                const eventDoc = (event.target && event.target.ownerDocument) || document;
                const doc = eventDoc.documentElement;
                const body = eventDoc.body;

                event.pageX = event.clientX +
                    (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                    (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY +
                    (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                    (doc && doc.clientTop  || body && body.clientTop  || 0 );
            }
            MouseInfo.mouse_x = event.pageX;
            MouseInfo.mouse_y = event.pageY;
            
            MouseInfo.trigger_moves(MouseInfo.mouse_x, MouseInfo.mouse_y);
        }

        function handleMouseDown(event: any) {
            MouseInfo._mouse_down[event.which] = true;
            MouseInfo.trigger_downs(event.pageX, event.pageY, event.which);
        }

        function handleMouseUp(event: any) {
            MouseInfo._mouse_down[event.which] = false;
            MouseInfo.trigger_ups(event.pageX, event.pageY, event.which);
        }

        function handleMouseClick(event: any) {
            MouseInfo.trigger_clicks(event.pageX, event.pageY, event.which);
        }

        document.onmousemove = handleMouseMove;
        document.onmousedown = handleMouseDown;
        document.onmouseup = handleMouseUp;
        document.onclick = handleMouseClick;
    }

    static get x() : number{
        return this.mouse_x;
    }

    static get y() : number {
        return this.mouse_y;
    }

    static get position() : Vector {
        return new Vector(this.x, this.y);
    }

    static down(idx : number) : boolean {
        return this._mouse_down[idx] ? true : false; //undefined -> false
    }

    static get mouse_down():{[idx:number]:boolean}{
        return this.mouse_down;
    }


    static add_listener(listener : MouseListener){
        MouseInfo.listeners.push(listener);
    }

    static remove_listener(listener : MouseListener){
        MouseInfo.listeners.splice(MouseInfo.listeners.indexOf(listener), 1);
    }

    static hide_mouse(){
        document.body.style.cursor = 'none';
    }

    static show_mouse(){
        document.body.style.cursor = 'default';
    }
}
