/*Running*/
var canvas = document.getElementById("draw");

function MouseHandler(element){
    function relMouseCoords(event){
        var rect = element.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        return {x:x,y:y};
    }

    var mouseXOnDown = 0;
    var mouseYOnDown = 0;

    var mouseX = 0;
    var mouseY = 0;
    var mouseDown = false;

    element.addEventListener('mousedown', function(e){
      mouseDown = true;
      var point = relMouseCoords(e);
      mouseXOnDown = point.x;
      mouseYOnDown = point.y;
    });

    element.addEventListener('mousemove', function(e){
      var point = relMouseCoords(e);
      mouseX = Math.floor(point.x);
      mouseY = Math.floor(point.y);
    });

    element.addEventListener('mouseup', function(e){
      mouseDown = false;
    });

    this.getX = function(){
        return mouseX;
    }
    this.getY = function(){
        return mouseY;
    }
    this.getXOnDown = function(){
        return mouseXOnDown;
    }
    this.getYOnDown = function(){
        return mouseYOnDown;
    }
    this.down = function(){
        return mouseDown;
    }
}

var mouse = new MouseHandler(canvas);

document.addEventListener('keydown', function(e) {
  var char = String.fromCharCode(e.keyCode);
  switch (char) {
    case 'A':
      physics.setAcceleration(function(x,y){return new Vector(-.03,.02)});
      break;
    case 'D':
      physics.setAcceleration(function(x,y){return new Vector(.03,.02)});
      break;
  }
}, false);


document.addEventListener('keyup', function(e) {
  var char = String.fromCharCode(e.keyCode);
  switch (char) {
    case 'A':
    case 'D':
      physics.setAcceleration(function(x,y){return new Vector(0,.02)});
      break;
  }
}, false);

function checkInputs(){
    ctx.strokeStyle = "black";
    if(mouse.down()){
        ctx.beginPath();
        ctx.moveTo(Math.floor(mouse.getXOnDown()),Math.floor(mouse.getYOnDown()));
        ctx.lineTo(Math.floor(mouse.getX()),Math.floor(mouse.getY()));
        ctx.stroke();
    }
}