class BoneComponent{
  type:ComponentType = ComponentType.Bone;
  private T:Mat3;
  private R:Mat3;
  private L:number;
  private _children:BoneComponent[] = [];
  private _parent:BoneComponent;
  private _id:number;
  
  constructor(offset:Vector, parent:BoneComponent, id:number){
    this._parent = parent;
    this._id = id;
    if(parent !== undefined){
      this._parent._children.push(this);
    }
    
    this.L = offset.length();
    let origin:Vector3 = new Vector3(0.0, 0.0, 0.0);
    let parent_transform:Mat3 = Mat3Transform.identity();//Identity
    
    if(parent !== undefined){
      origin = parent.endpoint();
      parent_transform = parent.transform();
    }
    
    let origin_transform:Vector3 = parent_transform.inverse().timesVector(origin);
    this.T = Mat3Transform.translate(origin_transform.x, origin_transform.y);
    
    let parent_rotation:Mat3 = Mat3Transform.identity();//Identity
    if(parent !== undefined){
      parent_rotation = this._parent.rotation();
    }
    
    const endpoint:Vector3 = origin.plus(new Vector3(offset, 0.0));
    const tangent_unnormalized:Vector3 = parent_transform.times(this.T).inverse().timesVector(endpoint);
    const tangent:Vector = new Vector(tangent_unnormalized).unit();
    
    this.R = new Mat3([[tangent.x, -tangent.y, 0.0], [tangent.y, tangent.x, 0.0], [0.0, 0.0, 1.0]]);
  }
  
  move_to(x:number, y:number):void{
    //Move parent
    //Move self
    //Move children
  }
  
  private move_self_and_parents(x:number, y:number):void{
    
  }
  
  private move_self_and_children(x:number, y:number):void{
    
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
      return this.T.timesVector(new Vector3(0.0, 0.0, 1.0));
    return this._parent.transform().times(this.T).timesVector(new Vector3(0.0, 0.0, 1.0));
  }
  
  endpoint():Vector3{
    return this.transform().timesVector(new Vector3(this.L, 0.0, 1.0));
  }
  
  get length():number{
    return this.L;
  }
  
  get parent():number{
    return this._parent._id;
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
