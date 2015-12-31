/*Running*/
var canvas = document.getElementById("draw");

class MouseHandler {
  private mouseXOnDown: number;
  private mouseYOnDown: number;
  private mouseX: number;
  private mouseY: number;
  private mouseDown: boolean;
  constructor(private element: any) {
    var self = this;
    element.addEventListener('mousedown', function(e) {
      self.mouseDown = true;
      var point = self.relMouseCoords(e);
      self.mouseXOnDown = point.x;
      self.mouseYOnDown = point.y;
    });

    element.addEventListener('mousemove', function(e) {
      var point = self.relMouseCoords(e);
      self.mouseX = Math.floor(point.x);
      self.mouseY = Math.floor(point.y);
    });

    element.addEventListener('mouseup', function(e) {
      self.mouseDown = false;
    });
  }
  relMouseCoords(event) {
    var rect = this.element.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return { x: x, y: y };
  }

  getX() {
    return this.mouseX;
  }
  getY() {
    return this.mouseY;
  }
  getXOnDown() {
    return this.mouseXOnDown;
  }
  getYOnDown() {
    return this.mouseYOnDown;
  }
  down() {
    return this.mouseDown;
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