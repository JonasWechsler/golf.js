/*Running*/
var canvas = document.getElementById("draw");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
canvas.width = 450;
canvas.height = 900;
canvas.width = screen.width;
canvas.height = screen.height;
var world = new WorldBuilder.PerlinGenerator(canvas.height);
var plants = new Graphics.Plant();
var physics = new Physics();
var builder = new WorldBuilder.Build1(physics);
plants.setLength(25).setIterations(3);
function runPhysics() {
    physics.stepPhysics();
    setTimeout(runPhysics, 10);
}
function draw() {
    physics.drawPhysics(ctx);
    checkInputs();
    window.requestAnimationFrame(draw);
}
window.requestAnimationFrame(draw);
runPhysics();
/*
 *
 *               (Vector Tools)
 *                    |
 *               (Physics Engine)
 *                    |
 *  (Save Data)  (Game World)-+
 *        \           |       |
 *    (Back end)-(Game Rules)-|-(Inputs)
 *         |                  |
 *      (Game)-(Front End)-(Graphics)
 *
 *
 */
