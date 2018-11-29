class VectorMath {
  static projectScalar(a:Vector, b:Vector) {
    return a.dot(b.unit());
  }

  static projectVector(a:Vector, b:Vector) {
    return b.unit().timesEquals(VectorMath.projectScalar(a, b));
  }

  static intersectSegBall(seg:LineSegment, ball:Ball):boolean{
      if(!ball.bounding_box().intersects(seg.bounding_box())) return false;

      //http://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
      var d = seg.v1.minus(seg.v0),
          f = seg.v0.minus(ball.position),
          a = d.dot(d),
          b = 2 * f.dot(d),
          c = f.dot(f) - ball.r * ball.r;

      var discriminant = b * b - 4 * a * c;

      if (discriminant < 0) {
          // no intersection
          return false;
      } else {
          discriminant = Math.sqrt(discriminant);
          var t1 = (-b - discriminant) / (2 * a),
              t2 = (-b + discriminant) / (2 * a);
          if (t1 >= 0 && t1 <= 1) {
              return true;
          }
          if (t2 >= 0 && t2 <= 1) {
              return true;
          }
          return false;
      }
  }

    /** Returns true iff seg0 and seg1 are within distance of each other.
     *
     */
    public static intersectSegSegDist(seg0:LineSegment, seg1:LineSegment, distance:number):boolean{
        if(VectorMath.intersectSegBall(seg0, new Ball(seg1.v0, distance))) return true;
        if(VectorMath.intersectSegBall(seg0, new Ball(seg1.v1, distance))) return true;
        if(VectorMath.intersectSegBall(seg1, new Ball(seg0.v0, distance))) return true;
        if(VectorMath.intersectSegBall(seg1, new Ball(seg0.v1, distance))) return true;
        if(VectorMath.intersectSegSeg(seg0, seg1)) return true;
        return false;
    }

    public static intersectBallBall(ball0: Ball, ball1: Ball):boolean{
        return (ball0.r + ball1.r)*(ball0.r + ball1.r) > ball0.position.distanceToSquared(ball1.position);
    }

    private static onSeg(seg:LineSegment, q:Vector):boolean{
        //http://www.cdn.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
        const p = seg.v0;
        const r = seg.v1;
        if(q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
           q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
            return true;
        return false;
    }

    private static orientation(p: Vector, q: Vector, r: Vector):number{
        const val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);
        if(val === 0) return 0;
        return (val > 0)? 1:2;
    }

    public static intersectSegSeg(seg0:LineSegment, seg1:LineSegment):boolean{
        const o1 = VectorMath.orientation(seg0.v0, seg0.v1, seg1.v0);
        const o2 = VectorMath.orientation(seg0.v0, seg0.v1, seg1.v1);
        const o3 = VectorMath.orientation(seg1.v0, seg1.v1, seg0.v0);
        const o4 = VectorMath.orientation(seg1.v0, seg1.v1, seg0.v1);

        if(o1 !== o2 && o3 !== o4) return true;

        if(o1 == 0 && VectorMath.onSeg(seg0, seg1.v0)) return true;
        if(o2 == 0 && VectorMath.onSeg(seg0, seg1.v1)) return true;
        if(o1 == 0 && VectorMath.onSeg(seg1, seg0.v0)) return true;
        if(o1 == 0 && VectorMath.onSeg(seg1, seg0.v1)) return true;
        return false;
    }
}

