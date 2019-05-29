class BoneComponent implements Component{
  type:ComponentType = ComponentType.Bone;
  private T:Mat3;
  private R:Mat3;
  private TR:Mat3;
  private L:number;
  private _old_L:number;
  private max_L:number;
  private _children:BoneComponent[] = [];
  private _parent:BoneComponent;
  private _id:number;
  private _root_origin:Vector;
  private _old_endpoint:Vector;
  private _marked:boolean = false;
  private _rope:boolean = true;
  
  constructor(offset:Vector, id:number, parent?:BoneComponent){
    this._id = id;
    if(parent === undefined){
       this._root_origin = offset;
       this.set_offset(new Vector(VECTOR_EPS, VECTOR_EPS));
       this.max_L = this.L;
    }else{
       this.max_L = offset.length();
       this._parent = parent;
       this.set_offset(offset);
       this._parent._children.push(this);
    }
    this._old_endpoint = this.endpoint();
  }

  private set_offset(offset:Vector){
    assert(!isNaN(offset.x) && !isNaN(offset.y), "NaN in offset: " + offset.to_string());
    this.L = offset.length();
    
    if(this._parent === undefined){
        this.T = Mat3Transform.translate(this._root_origin.x, this._root_origin.y);
    }else{
        this.T = Mat3Transform.translate(this._parent.L, 0);
    }

    //let origin_transform:Vector3 = parent_transform.inverse().timesVector(origin);
    //if(this._parent !== undefined){
    //    assert(Math.abs(origin_transform.x - this._parent.L) < VECTOR_EPS, origin_transform.x + " neq " + this._parent.L);
    //    assert(origin_transform.y < VECTOR_EPS, "" + origin_transform.y);
    //}else{
    //    assert(origin_transform.equals(new Vector3(this._root_origin, 1.0)));
    //}
    //this.T = Mat3Transform.translate(origin_transform.x, origin_transform.y);
    
    let origin:Vector3 = new Vector3(0.0, 0.0, 0.0);
    let parent_transform:Mat3 = Mat3Transform.identity();//Identity
    let parent_rotation:Mat3 = Mat3Transform.identity();//Identity

    if(this._parent !== undefined){
      parent_rotation = this._parent.rotation();
      origin = new Vector3(this._parent.endpoint(), 1.0);
      parent_transform = this._parent.transform();
    }else{
      origin = new Vector3(this._root_origin, 1.0);
    }

    const endpoint:Vector3 = origin.plus(new Vector3(offset, 0.0));
    const tangent_unnormalized:Vector3 = parent_transform.times(this.T).inverse().timesVector(endpoint);
    const tangent:Vector = new Vector(tangent_unnormalized).unit();
    
    this.R = new Mat3([[tangent.x, -tangent.y, 0.0], [tangent.y, tangent.x, 0.0], [0.0, 0.0, 1.0]]);

    if(this._parent !== undefined)
        assert(this._parent.endpoint().equals(this.origin()), "Parent endpoint neq origin");
    else
        assert(this.origin().equals(this._root_origin), "Origin neq root origin");
    assert(this.endpoint().minus(this.origin()).equals(offset), "Endpoint minus origin neq offset: " + this.endpoint().to_string() + " - " + this.origin().to_string() + " != " + offset.to_string());
  }
  
  rotate(theta:number):void{
    this.R = this.R.times(Mat3Transform.rotate(theta));
  }

  intersects(ball:Ball):boolean{
    const seg = new LineSegment(this.origin(), this.endpoint());
    return VectorMath.intersectSegBall(seg, ball);
  }

  move_endpoint(endpoint:Vector):void{
    endpoint = endpoint.clone();
    this._marked = true;
    let origin;
    if(this._parent !== undefined){
      origin = this._parent.endpoint();
    }else{
      origin = this._root_origin;
    }
    const L = origin.minus(endpoint);
    let len = this._rope?Math.min(L.length(), this.max_L):this.max_L;
    const new_origin = endpoint.plus(L.unitTimes(len));

    if(this._parent !== undefined){
        if(!this._parent._marked){
            this._parent.move_endpoint(new_origin);
            assert(this._parent.endpoint().equals(new_origin), "Parent incongruous " + this._parent.endpoint().to_string() + " != " + new_origin.to_string());
        }
    }else{
        this._root_origin = new_origin;
    }

    this.set_offset(endpoint.minus(new_origin));
    if(this._parent !== undefined)assert(this._parent.endpoint().equals(new_origin), this.T.to_string() + " " + this._parent.L);

    assert(this.origin().equals(new_origin), "Origin incongruous " + this.origin().to_string() + " " + new_origin.to_string());
    assert(this.endpoint().equals(endpoint), "Endpoint incongruous " + this.endpoint().to_string() + " != " + endpoint.to_string());

    for(let idx=0;idx<this._children.length;idx++){
        const bone = this._children[idx];
        if(bone._marked) continue;
        const x0 = endpoint;
        const x1 = bone._old_endpoint;
        const L = x1.minus(x0);
        const len = this._rope?Math.min(L.length(), bone.max_L):bone.max_L;
        const o = x0.plus(L.unitTimes(len));
        bone.move_endpoint(o);
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

  bounding_box():Square{
    return new LineSegment(this.origin(), this.endpoint()).bounding_box();
  }

  private depth():number{
    if(this._parent === undefined)
          return 0;
    return this._parent.depth() + 1;
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
