# Inverse Kinematics with FABRIK

## Running
You can see a running model on

https://www.cs.utexas.edu/~jonas/

When you run the program, it will spawn all 3 models on top of each other.
You can click and drag the vertices around, or right click on the end effectors
to fix them.

## Compiling and running
You need to have node.js with typescript installed. To compile, run

```
tsc
```

To run the Javascript, you need to run it on a server to deal with
cross-site issues. You can do this by running
```
python -m SimpleHTTPServer
```
and opening localhost:8000/golf.html in your browser.

## About this repo

This repository is derived from a continuing independent project I'm doing, so it has
many extra files unrelated to FABRIK. The relavent files are:

**run.ts** - contains all the initializations for the FABRIK demo

**skeleton.ts** - contains rigging code, similar to assignments 4 and 5

**kinematics.ts** - contains the Bone class, which has a special "move_endpoint" function that
executes the "drag" done by FABRIK, where it updates the entire kinematic chain

**tools.ts** - contains some helpful classes, like StringStream

**vector.ts** - contains all the basic vector and matrix operations

**vectormath.ts** - contains some code for collisions between vector structures

## .xrig file type

For models, I made a new file type called .xrig. The first line contains two
integers, B and V, where B is the number of bones and V is the number of vertices.
The next B lines contain 3 numbers: the parent ID of the bone and the x and y
offset of the bone. If the bone's parent ID is -1, then it is the root, and its offset
represents the skeleton's position in world coordinates. The nth bone has ID
n-1, i.e. the first bone that's defined has id 0. The next V lines contain 2 numbers:
the x and y position of each vertex. Vertices are assigned IDs in the same way.
The next V lines after that contain two integers, which are the IDs of the endpoints of
a side of the polygon. After that is a B x V matrix which describes the bone-vertex
weights of the model for linear blend skinning.

If V = 0, the model is just a skeleton.

## Description of FABRIK

The basic algorithm is as follows:
1. Move end effector to target
2. Iteratively move adjacent vertices to nearest valid point
3. Repeat 1 and 2 for each end effector
4. Repeat whole algorithm until complete

Pseudocode can be found in the origional paper
(FABRIK: A fast, iterative solver for the inverse kinematics problem by Aristidou and Lasenby)

## References

https://www.sciencedirect.com/science/article/pii/S1524070311000178?via%3Dihub

http://www.ryanjuckett.com/programming/cyclic-coordinate-descent-in-2d/

https://youtu.be/tN6RQ4yrNPU

https://developer.roblox.com/articles/Inverse-Kinematics-for-Animation

