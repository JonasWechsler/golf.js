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
  private _new_endpoint:Vector;
  private _marked:boolean = false;
  private _rope:boolean = false;
  private _constraints:boolean = true;

  private _cw_constraint:number;
  private _ccw_constraint:number;

  /*We store constraints as their horizontal and vertical parts for faster comparison. */
  private _cos_cw_constraint:number = Math.cos(Math.PI*2/3);
  private _cos_ccw_constraint:number = Math.cos(Math.PI*1/3);
  private _sin_cw_constraint:number = Math.sin(Math.PI*2/3);
  private _sin_ccw_constraint:number = Math.sin(Math.PI*1/3);
  
  /* Constraints are in radians from -pi to pi.
   */
  constructor(offset:Vector, id:number, cw_constraint?:number, ccw_constraint?:number, parent?:BoneComponent){
    this._id = id;
    if(cw_constraint !== undefined && ccw_constraint !== undefined){
        this._constraints = true;
        assert(cw_constraint >= ccw_constraint, cw_constraint + " is not >= " + ccw_constraint);
        assert(cw_constraint >= -Math.PI, cw_constraint + " is not >= " + -Math.PI);
        assert(cw_constraint <= Math.PI, cw_constraint + " is not <= " + Math.PI);
        assert(ccw_constraint >= -Math.PI, ccw_constraint + " is not >= " + -Math.PI);
        assert(ccw_constraint <= Math.PI, ccw_constraint + " is not <= " + Math.PI);
        this._cw_constraint = cw_constraint;
        this._ccw_constraint = ccw_constraint;
        this._cos_ccw_constraint = Math.cos(ccw_constraint);
        this._cos_cw_constraint = Math.cos(cw_constraint);
        this._sin_ccw_constraint = Math.sin(ccw_constraint);
        this._sin_cw_constraint = Math.sin(cw_constraint);
    }else{
        this._constraints = false;
    }
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
    this._new_endpoint = this.endpoint();
    if(this.depth() < 2)this._constraints = false;
  }

  private constrain2(unconstrained:Vector, constrained:Vector, cw:number, ccw:number):Vector{
    const theta0 = Math.atan2(unconstrained.y, unconstrained.x);
    const theta1 = Math.atan2(constrained.y, constrained.x);
    let theta = theta1 - theta0;
    if(theta > Math.PI) theta -= 2*Math.PI;
    if(theta < -Math.PI) theta += 2*Math.PI;
    theta = Math.min(theta, Math.max(cw, ccw));
    theta = Math.max(theta, Math.min(cw, ccw));
    const theta2 = theta + theta0;
    return new Vector(Math.cos(theta2), Math.sin(theta2)).times(constrained.length());
  }

  private safeconstrain(v:Vector):Vector{
    let theta = Math.atan2(v.y, v.x);
    if(theta > this._ccw_constraint){
        const x = Math.cos(this._ccw_constraint);
        const y = Math.sin(this._ccw_constraint);
        return new Vector(x,y).timesEquals(v.length());
    }else if(theta < this._cw_constraint){
        const x = Math.cos(this._cw_constraint);
        const y = Math.sin(this._cw_constraint);
        return new Vector(x,y).timesEquals(v.length());
    }
    return v;
  }

  private constrain(v:Vector):Vector{
      assert(Math.abs(v.lengthSquared() - 1) < VECTOR_EPS, "" + v.lengthSquared());
      if(this._sin_ccw_constraint > 0 && this._sin_cw_constraint > 0){
        if(v.y < 0){
            return new Vector(this._cos_ccw_constraint, this._sin_ccw_constraint);
        }else{
            if(v.x < this._cos_cw_constraint){
                return new Vector(this._cos_cw_constraint, this._sin_cw_constraint);
            }else if(v.x > this._cos_ccw_constraint){
                return new Vector(this._cos_ccw_constraint, this._sin_ccw_constraint);
            }else{
                return v;
            }
        }
      }else if(this._sin_ccw_constraint < 0 && this._sin_cw_constraint < 0){
        if(v.y > 0){
            return new Vector(this._cos_cw_constraint, this._sin_cw_constraint);
        }else{
            if(v.x < this._cos_ccw_constraint){
                return new Vector(this._cos_ccw_constraint, this._sin_ccw_constraint);
            }else if(v.x > this._cos_cw_constraint){
                return new Vector(this._cos_cw_constraint, this._sin_cw_constraint);
            }else{
                return v;
            }
        }
      }else{
        if(v.y > 0 && v.x < this._cos_cw_constraint){
            return new Vector(this._cos_cw_constraint, this._sin_cw_constraint);
        }else if(v.y < 0 && v.x < this._cos_ccw_constraint){
            return new Vector(this._cos_ccw_constraint, this._sin_ccw_constraint);
        }else{
            return v;
        }
      }
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
    let tangent:Vector = new Vector(tangent_unnormalized).unit();
      //if(this._constraints){
      //  tangent = this.safeconstrain(tangent);
      //}
    
    this.R = new Mat3([[tangent.x, -tangent.y, 0.0], [tangent.y, tangent.x, 0.0], [0.0, 0.0, 1.0]]);

      if(!this._constraints){
          if(this._parent !== undefined){
              assert(this._parent.endpoint().equals(this.origin()), "Parent endpoint neq origin");
          }else{
              assert(this.origin().equals(this._root_origin), "Origin neq root origin");
          }
          assert(this.endpoint().minus(this.origin()).equals(offset), "Endpoint minus origin neq offset: " + this.endpoint().to_string() + " - " + this.origin().to_string() + " != " + offset.to_string());
      }
  }
  
  set_angle(theta:number):void{
    this.R = Mat3Transform.rotate(theta);
  }

  rotate(theta:number):void{
    this.R = this.R.times(Mat3Transform.rotate(theta));
  }

  angle():number{
    return this.R.angle();
  }

  intersects(ball:Ball):boolean{
    const seg = new LineSegment(this.origin(), this.endpoint());
    return VectorMath.intersectSegBall(seg, ball);
  }

  move_endpoint(endpoint:Vector):void{
    this._new_endpoint = endpoint.clone();
    this._marked = true;

    let marked_child = -1;
    for(let idx=0;idx<this._children.length;idx++){
        if(marked_child != -1)assert(!this._children[idx]._marked);
        if(this._children[idx]._marked) marked_child=idx;
    }
    
    let origin;
    if(this._parent !== undefined){
      origin = this._parent.endpoint();
    }else{
      origin = this._root_origin;
    }
    const L = origin.minus(this._new_endpoint);
    let len = this._rope?Math.min(L.length(), this.max_L):this.max_L;
    let new_origin = this._new_endpoint.plus(L.unitTimes(len));

    if(marked_child != -1){// && this._constraints){
      const child_endpoint = this._children[marked_child]._new_endpoint;
      const v0 = this._new_endpoint.minus(child_endpoint);
      const v1 = new_origin.minus(this._new_endpoint);//constrained
      new_origin = this.constrain2(v0, v1, -2*Math.PI*30/360, 2*Math.PI*30/360).plus(this._new_endpoint);
      if(this._parent === undefined) console.log(new_origin);
      //v1 constrained by v0
    }

    if(this._parent !== undefined){
        if(this._parent._marked){
            //propogating from parent
            //new_origin = this._parent.endpoint();
            const v0 = this._parent.endpoint().minus(this._parent.origin());
            const v1 = endpoint.minus(new_origin);
            this._new_endpoint = this.constrain2(v0, v1, -2*Math.PI*30/360, 2*Math.PI*30/360).plus(new_origin);
        }else{
            //TODO make sure new origin is in constraints
            this._parent.move_endpoint(new_origin);
        }
    }else{
        this._root_origin = new_origin;
    }

    this.set_offset(this._new_endpoint.minus(new_origin));

    for(let idx=0;idx<this._children.length;idx++){
        const bone = this._children[idx];
        if(bone._marked) continue;
        const x0 = this._new_endpoint;
        const x1 = bone._old_endpoint;
        const L = x1.minus(x0);
        const len = this._rope?Math.min(L.length(), bone.max_L):bone.max_L;
        const o = x0.plus(L.unitTimes(len));
        //TODO make sure new endpoint is in constraints
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
