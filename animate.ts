enum KeyframeInterpolation{
    Linear
}

enum AnimationType{
    InverseKinematics,
    Absolute,
    Relative
}

class AnimationKeyFrame{
    constructor(public bone_id:number, public position:Vector|number, public time:number){}
}

class BoneAnimation{
    private static _next_id:number = 0;
    private _id:number;
    private _keyframe_lookup: Map<number, AnimationKeyFrame>;//{ [bone_id:number]:AnimationKeyFrame[]; };
    private _bones: number[] = [];

    constructor(public keyframes:AnimationKeyFrame[],
    public interpolation:KeyframeInterpolation,
    public loops:number,
    public length:number,
    public animation_type:AnimationType){
        this._id = BoneAnimation._next_id++;
        this._keyframe_lookup = new Map();
        const bones = [];
        for(let idx = 0; idx < keyframes.length; idx++){
            const keyframe = keyframes[idx];
            bones[keyframe.bone_id] = true;
            if(!this._keyframe_lookup[keyframe.bone_id]){
                this._keyframe_lookup[keyframe.bone_id] = [];
            }
            this._keyframe_lookup[keyframe.bone_id].push(keyframe);
        }
        Object.keys(bones).forEach((id) => this._bones.push(Number.parseInt(id)));
    }

    public get id(){ return this._id; }

    private linear_interpolate(a:AnimationKeyFrame, b:AnimationKeyFrame, time:number):AnimationKeyFrame{
        let position:number|Vector;
        if(this.animation_type == AnimationType.InverseKinematics){
            const ax = a.position as Vector;
            const bx = b.position as Vector;
            position = bx.times(time - b.time).plus(ax);
        }else{
            const ax = a.position as number;
            const bx = b.position as number;
            const t = (time - a.time)/(b.time - a.time);
            position = bx*t + ax*(1-t);
        }
        return new AnimationKeyFrame(a.bone_id, position, time);
    }

    private interpolate(a:AnimationKeyFrame, b:AnimationKeyFrame, time:number):AnimationKeyFrame{
        assert(a.bone_id == b.bone_id);
        assert(a.time <= b.time);
        assert(a.time <= time);
        assert(b.time >= time);
        if(this.interpolation == KeyframeInterpolation.Linear){
            return this.linear_interpolate(a, b, time);
        }
        console.error("Not supported");
        return undefined;
    }
    public get_keyframe(bone_id:number, time:number):AnimationKeyFrame{
        let lo = 0;
        let hi = this._keyframe_lookup[bone_id].length - 1;
        while(lo <= hi){
            const mid = (lo + hi) >> 1;
            if(time > this._keyframe_lookup[bone_id][mid].time){
                lo = mid + 1;
            }else if(time < this._keyframe_lookup[bone_id][mid].time){
                hi = mid - 1;
            }else{
                lo = mid;
                hi = mid;
                break;
            }
        }
        if(SystemManager.frame_time()%100 == 0)
        console.log(time, lo, hi);
        //hi = Math.max(0, hi);
        //lo = Math.min(this._keyframe_lookup[bone_id].length, lo);
        
        if(SystemManager.frame_time()%100 == 0)
        console.log(this._keyframe_lookup[bone_id], hi, lo);
        return this.interpolate(this._keyframe_lookup[bone_id][hi], this._keyframe_lookup[bone_id][lo], time);
    }
    public get_bones():number[]{
        return this._bones;
    }
}

class AnimationComponent implements Component{
    type:ComponentType = ComponentType.Animation;
    constructor(public animations: { [key:number]:BoneAnimation},
    private _current_animation_id: number = -1,
    public time: number = 0,
    public loop: number = 0){}

    get current_animation_id():number{
        return this._current_animation_id;
    }

    get_current_animation():BoneAnimation{
        return this.animations[this._current_animation_id];
    }

    play_animation(id:number){
        this._current_animation_id = id;
        this.time = 0;
        this.loop = 0;
    }
}

class AnimationSystem implements System{
    step(){
        const entities = EntityManager.current.get_entities([ComponentType.Skeleton, ComponentType.Animation]);
        entities.forEach((entity) => {
            const skeleton = entity.get_component<SkeletonComponent>(ComponentType.Skeleton);
            const animation = entity.get_component<AnimationComponent>(ComponentType.Animation);
            const current_animation = animation.get_current_animation();
            if(animation.time > current_animation.length){
                animation.time = 0;
                animation.loop++;
            }
            if(current_animation.loops != -1 && animation.loop > current_animation.loops){
                return;
            }
            const bones = current_animation.get_bones();
            //if(SystemManager.frame_time() % 10 == 0)console.log(bones);
            bones.forEach((bone_id) => {
                const bone = skeleton.id_to_bone(bone_id).get_component<BoneComponent>(ComponentType.Bone);
                const keyframe = current_animation.get_keyframe(bone_id, animation.time);
                if(current_animation.animation_type == AnimationType.Absolute){
                    if(SystemManager.frame_time()%10 == 0)
                        console.log(keyframe.position, animation.time, bone_id);
                    bone.set_angle(keyframe.position as number);
                }
                if(current_animation.animation_type == AnimationType.Relative){
                    bone.rotate(keyframe.position as number);
                }
                if(current_animation.animation_type == AnimationType.InverseKinematics){
                    bone.move_endpoint(keyframe.position as Vector);
                }
            });
            animation.time++;
        });
    }
}

class AnimationReader{
    static async read(fn:string, add_to_manager:boolean=true):Promise<ECSEntity>{
        return new ECSEntity();
    }
}
