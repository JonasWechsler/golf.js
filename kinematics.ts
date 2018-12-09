class BoneComponent{
  type:ComponentType = ComponentType.Bone;
  private T:Mat3;
  private R:Mat3;
  private L:number;
  private _children:BoneComponent[] = [];
  private _parent:BoneComponent;
  private _id:number;
  private _root_origin:Vector;
  private _old_endpoint:Vector;
  private _marked:boolean = false;
  
  constructor(offset:Vector, id:number, parent?:BoneComponent){
    this._id = id;
    if(parent === undefined){
       this._root_origin = offset;
       this.set_offset(new Vector(VECTOR_EPS, VECTOR_EPS));
    }else{
       this._parent = parent;
       this.set_offset(offset);
       this._parent._children.push(this);
    }
    this._old_endpoint = this.endpoint();
  }

  private set_offset(offset:Vector){
    assert(!isNaN(offset.x) && !isNaN(offset.y));
    this.L = offset.length();
    let origin:Vector3 = new Vector3(0.0, 0.0, 0.0);
    let parent_transform:Mat3 = Mat3Transform.identity();//Identity
    
    if(this._parent !== undefined){
      origin = new Vector3(this._parent.endpoint(), 1.0);
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

    if(this._parent !== undefined)
        assert(this._parent.endpoint().equals(this.origin()));
    else
        assert(this.origin().equals(this._root_origin));
    assert(this.endpoint().minus(this.origin()).equals(offset));
  }
  
  rotate(theta:number):void{
    this.R = this.R.times(Mat3Transform.rotate(theta));
  }

  intersects(ball:Ball):boolean{
    const seg = new LineSegment(this.origin(), this.endpoint());
    return VectorMath.intersectSegBall(seg, ball);
  }

  move_endpoint(x:number, y:number):void{
    this._marked = true;
    const endpoint = new Vector(x, y);
    const origin = this.origin();
    const L = origin.minus(endpoint).unit();
    const o = endpoint.plus(L.times(this.length));

    if(this._parent !== undefined){
        if(!this._parent._marked)
            this._parent.move_endpoint(o.x, o.y);
        assert(this._parent.endpoint().equals(o));
    }else{
        this._root_origin = o;
    }

    this.set_offset(endpoint.minus(o));

    assert(this.origin().equals(o), this.origin().to_string() + " " + o.to_string());
    assert(this.endpoint().equals(endpoint), this.endpoint().to_string() + " != " + endpoint.to_string());

    for(let idx=0;idx<this._children.length;idx++){
        const bone = this._children[idx];
        if(bone._marked) continue;
        const x0 = endpoint;
        const x1 = bone._old_endpoint;
        const L = x1.minus(x0).unit();
        const o = x0.plus(L.times(bone.length));
        bone.move_endpoint(o.x, o.y);
    }

     this._marked = false;
     this._old_endpoint = this.endpoint();
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
  
  origin():Vector{
    if(this._parent === undefined)
        return this._root_origin;
    return new Vector(this._parent.transform().times(this.T).timesVector(new Vector3(0.0, 0.0, 1.0)));
  }
  
  endpoint():Vector{
    return new Vector(this.transform().timesVector(new Vector3(this.L, 0.0, 1.0)));
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
