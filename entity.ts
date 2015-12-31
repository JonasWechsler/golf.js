module Entity{
	export class Player extends Physics.DynamicBall{
		constructor(position:Vector, radius:number, speed:Vector){
			super(position, radius, speed);
		}
	}
}