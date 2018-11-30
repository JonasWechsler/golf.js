class BoneComponent{
  type:ComponentType = ComponentType.Bone;
  private T:Mat3;
  private R:Mat3;
  private L:number;
  private _children:BoneComponent[] = [];
  private _parent:BoneComponent;
  private _id:number;
  private _root_origin:Vector;
  
  constructor(offset:Vector, parent:BoneComponent|Vector, id:number){
    if(parent instanceof BoneComponent){
        this._parent = parent;
    }else if(parent instanceof Vector){
        this._root_origin = parent;
    }
    this._id = id;
    this.set_offset(offset);
    if(this._parent !== undefined){
      this._parent._children.push(this);
    }
  }

  private set_offset(offset:Vector){
    this.L = offset.length();
    let origin:Vector3 = new Vector3(0.0, 0.0, 0.0);
    let parent_transform:Mat3 = Mat3Transform.identity();//Identity
    
    if(this._parent !== undefined){
      origin = this._parent.endpoint();
      parent_transform = this._parent.transform();
    }else{
      origin = new Vector3(this._root_origin, 1.0);
    }
    
    let origin_transform:Vector3 = parent_transform.inverse().timesVector(origin);
    this.T = Mat3Transform.translate(origin_transform.x, origin_transform.y);
    
    let parent_rotation:Mat3 = Mat3Transform.identity();//Identity
    if(this._parent !== undefined){
      parent_rotation = this._parent.rotation();
    }
    
    const endpoint:Vector3 = origin.plus(new Vector3(offset, 0.0));
    const tangent_unnormalized:Vector3 = parent_transform.times(this.T).inverse().timesVector(endpoint);
    const tangent:Vector = new Vector(tangent_unnormalized).unit();
    
    this.R = new Mat3([[tangent.x, -tangent.y, 0.0], [tangent.y, tangent.x, 0.0], [0.0, 0.0, 1.0]]);
  }
  
  rotate(theta:number):void{
    this.R = this.R.times(Mat3Transform.rotate(theta));
  }

  intersects(ball:Ball):boolean{
    const seg = new LineSegment(new Vector(this.origin()), new Vector(this.endpoint()));
    return VectorMath.intersectSegBall(seg, ball);
  }

  move_endpoint(x:number, y:number):void{
    this.move_self_and_parents(x, y);
    //this.move_self_and_children(x, y);
    //Move parent
    //Move self
    //Move children
  }
  
  private move_self_and_parents(x:number, y:number):void{
    const x0 = new Vector(x, y);
    const x1 = new Vector(this.origin());

    const L = x1.distanceTo(x0);

    const b = this.length/L;
    const a = 1-b;
    const o = x0.times(a).plus(x1.times(b));

    if(Math.abs(o.distanceTo(x0) - this.length) > VECTOR_EPS) console.log(o, x0);
    if(this._parent !== undefined){
        this._parent.move_self_and_parents(o.x, o.y);
    }else{
        this._root_origin = o;
    }
    
    this.set_offset(x0.minus(o));
  }
  
  private move_self_and_children(x:number, y:number):void{
    const x1 = new Vector(x, y);
    if(this._parent !== undefined){
        this.set_offset(x1.minus(new Vector(this._parent.endpoint())));
    }else{
        this.set_offset(x1);
    }
    this._children.forEach((bone) => {
      const x0 = new Vector(bone.endpoint());
      const L = x1.distanceTo(x0);
      const b = this.length/L;
      const a = 1-b;
      const o = x0.times(a).plus(x1.times(b));
      bone.move_self_and_children(o.x, o.y);
    });
  }
  
  transform():Mat3{
    if(this._parent === undefined){
      return this.T.times(this.R);
    }
    return this._parent.transform().times(this.T).times(this.R);
  }
  
  rotation():Mat3{
    if(this._parent === undefined)
      return this.R;
    return this._parent.rotation().times(this.R);
  }
  
  origin():Vector3{
    if(this._parent === undefined)
        return new Vector3(this._root_origin, 1.0);
    return this._parent.transform().times(this.T).timesVector(new Vector3(0.0, 0.0, 1.0));
  }
  
  endpoint():Vector3{
    return this.transform().timesVector(new Vector3(this.L, 0.0, 1.0));
  }
  
  get length():number{
    return this.L;
  }
  
  get parent():number{
    if(this._parent !== undefined)
        return this._parent._id;
    return -1;
  }
  
  get children():number[]{
    const result = [];
    this._children.forEach((child) => {result.push(child.id);});
    return result;
  }
  
  get id():number{
    return this._id;
  }
}
