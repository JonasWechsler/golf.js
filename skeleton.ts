class FixableEndpointComponent{
  type:ComponentType = ComponentType.FixableEndpoint;
  constructor(public x:number, public y:number, public fixed:boolean = false){}
}

class SkeletonComponent implements Component{
    type:ComponentType = ComponentType.Skeleton;
    private _id_to_bone:{[id:number]:ECSEntity};
    private _root:ECSEntity;
    private _size:number;

    constructor(offsets:Vector[], parents:number[]){
        this._id_to_bone = {};
        this._size = parents.length;

        const children:{[id:number]:number[]} = {};
        for(let id=0;id < parents.length;id++){
            if(!children[parents[id]])
                children[parents[id]] = [];
            children[parents[id]].push(id);
        }

        const root:number = children[-1][0];
        assert(children[-1].length == 1);

        const id_queue:number[] = [root];
        while(id_queue.length != 0){
            const id = id_queue.shift();
            const offset:Vector = offsets[id];
            let bone_component;
            if(id === root){
                bone_component = new BoneComponent(offset, id);
            }else{
                const parent:number = parents[id];
                const parent_entity:ECSEntity = this._id_to_bone[parent];
                const parent_bone = parent_entity.get_component<BoneComponent>(ComponentType.Bone);
                bone_component = new BoneComponent(offset, id, parent_bone);
            }
            const bone_entity = new ECSEntity();
            bone_entity.add_component(bone_component);
            if(children[id]){
                for(let idx = 0; idx < children[id].length; idx++){
                    id_queue.push(children[id][idx]);
                }
            }else{
                const endpoint = bone_component.endpoint();
                bone_entity.add_component(new FixableEndpointComponent(endpoint.x, endpoint.y));
            }
            EntityManager.current.add_entity(bone_entity);
            this._id_to_bone[id] = bone_entity;

        }

        this._root = this._id_to_bone[root];
    }

    get_bone_by_intersection(position:Vector, radius:number):number{
        const ball = new Ball(position, radius);

        for(let id = 0; id < this.length; id++){
            const bone = this._id_to_bone[id].get_component<BoneComponent>([ComponentType.Bone]);
            if(bone.intersects(ball)){
                return id;
            }
        }

        return -1;
    }

    get_bone_by_endpoint_intersection(position:Vector, radius:number):number{
        const ball = new Ball(position, radius);

        for(let id = 0; id < this.length; id++){
            const bone = this._id_to_bone[id].get_component<BoneComponent>([ComponentType.Bone]);
            const endpoint = new Ball(bone.endpoint(), VECTOR_EPS);
            if(VectorMath.intersectBallBall(endpoint, ball)){
                return id;
            }
        }

        return -1;
    }

    get length():number{
        return this._size;
    }

    id_to_bone(id:number):ECSEntity{
        return this._id_to_bone[id];
    }

    root():ECSEntity{
        return this._root;
    }
}

class MeshComponent implements Component{
    type:ComponentType = ComponentType.Mesh;
    inverse_reference_pose:Mat3[];
    reference_pose:Vector3[];

    constructor(public skeleton:SkeletonComponent,
                public weights:number[][],
                public vertices:Vector[],
                public line_ids:Point[]){
        this.reference_pose = [];
        for(let vid = 0; vid < vertices.length; vid++){
            this.reference_pose.push(new Vector3(vertices[vid], 1.0));
        }
        this.inverse_reference_pose = [];
        for(let id = 0; id < skeleton.length; id++){
            const bone_entity = skeleton.id_to_bone(id);
            const bone = bone_entity.get_component<BoneComponent>(ComponentType.Bone);
            this.inverse_reference_pose.push(bone.transform().inverse());
        }
    }

    update_animation(){
        for(let vertex = 0; vertex < this.vertices.length; vertex++){
            this.vertices[vertex].timesEquals(0);
        }
        for(let bone_id = 0; bone_id < this.skeleton.length; bone_id++){
            const inverse = this.inverse_reference_pose[bone_id];
            const bone_entity = this.skeleton.id_to_bone(bone_id);
            const bone = bone_entity.get_component<BoneComponent>(ComponentType.Bone);
            const B = bone.transform().times(inverse);
            for(let vid = 0; vid < this.vertices.length; vid++){
                if(this.weights[bone_id][vid] === 0.0){
                    continue;
                }
                const weight = this.weights[bone_id][vid];
                const dvec = B.timesVector(this.reference_pose[vid]);
                this.vertices[vid].plusEquals(new Vector(dvec).times(weight));
            }
        }
    }
}

class ModelReader{
    static async read(fn:string){
        const ss = new StringStream();
        await ss.read_async(fn);

        const bones = ss.int();
        const verts = ss.int();

        let parents:number[] = [];
        let offsets:Vector[] = [];
        for(let bone_idx = 0; bone_idx < bones; bone_idx++){
            const parent_id = ss.int();
            const offset_x = ss.float();
            const offset_y = ss.float();
            parents.push(parent_id);
            offsets.push(new Vector(offset_x, offset_y));
        }
        const skeleton_component = new SkeletonComponent(offsets, parents);
        const skeleton_entity = new ECSEntity();
        skeleton_entity.add_component(skeleton_component);
        EntityManager.current.add_entity(skeleton_entity);

        let vertices:Vector[] = [];
        for(let vid = 0; vid < verts; vid++){
            const x = ss.float();
            const y = ss.float();
            vertices.push(new Vector(x, y));
        }

        let lines:Point[] = [];
        for(let line = 0; line < verts; line++){
            const vid0 = ss.int();
            const vid1 = ss.int();
            lines.push(new Point(vid0, vid1));
        }

        let weights:number[][] = [];
        for(let bone = 0; bone < bones; bone++){
            weights[bone] = [];
            for(let vid = 0; vid < verts; vid++){
                weights[bone][vid] = ss.float();
            }
        }

        const mesh_component = new MeshComponent(skeleton_component, weights, vertices, lines);
        const mesh_entity = new ECSEntity();
        mesh_entity.add_component(mesh_component);
        EntityManager.current.add_entity(mesh_entity);
    }
}
