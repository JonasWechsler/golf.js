/*Running*/
interface KeyListener {
    onkeydown(key_code : number) : void;
    onkeyup(key_code : number) : void;
}

class KeyInfo {
  private static keys_down: boolean[] = [];
  private static listeners: KeyListener[] = [];
  private static trigger_downs(key_code : number){
    this.listeners.forEach(function(listener){
      listener.onkeydown(key_code);
    });
  }

  private static trigger_ups(key_code : number){
    this.listeners.forEach(function(listener){
      listener.onkeyup(key_code);
    });
  }

  static setup(){
      const self = this;
      function handle_down(event: KeyboardEvent){
        if(self.keys_down[event.keyCode]){
            return;
        }

        self.keys_down[event.keyCode] = true;
        self.trigger_downs(event.keyCode);
      }
      function handle_up(event: KeyboardEvent){
        self.keys_down[event.keyCode] = false;
        self.trigger_ups(event.keyCode);
      }
      document.addEventListener('keydown', handle_down, false);
      document.addEventListener('keyup', handle_up, false);
  }

  static add_key_listener(listener : KeyListener){
    this.listeners.push(listener);
  }

  static is_down(code: number): boolean{
    return this.keys_down[code];
  }

  static code(str: string): number{
    return str.charCodeAt(0);
  }
}

class KeyHandler {
  private keysDown: Array<boolean>;
  constructor(private element: any){
    var self = this;
    this.keysDown = [];
    element.addEventListener('keydown', function(e) {
      var char = String.fromCharCode(e.keyCode);
      self.keysDown[char] = true;
    }, false);
    element.addEventListener('keyup', function(e) {
      var char = String.fromCharCode(e.keyCode);
      self.keysDown[char] = false;
    }, false);
  }
  isDown(char: string): boolean{
    return this.keysDown[char];
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
    private static mouse_down : boolean[] = [false, false, false];

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
            MouseInfo.mouse_down[event.which] = true;
            MouseInfo.trigger_downs(event.pageX, event.pageY, event.which);
        }

        function handleMouseUp(event: any) {
            MouseInfo.mouse_down[event.which] = false;
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

    static x() : number{
        return this.mouse_x;
    }

    static y() : number {
        return this.mouse_y;
    }

    static down(idx : number) : boolean {
        return this.mouse_down[idx] ? true : false; //undefined -> false
    }

    static add_listener(listener : MouseListener){
        MouseInfo.listeners.push(listener);
    }

    static remove_listener(listener : MouseListener){
        MouseInfo.listeners.splice(MouseInfo.listeners.indexOf(listener), 1);
    }
}
