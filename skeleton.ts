class FixableEndpointComponent{
  type:ComponentType = ComponentType.FixableEndpoint;
  constructor(public p:Vector, public fixed:boolean = false){}
}

class SkeletonComponent implements Component{
    type:ComponentType = ComponentType.Skeleton;
    private _id_to_bone:{[id:number]:ECSEntity};
    private _root:ECSEntity;
    private _size:number;

    constructor(_id_to_bone:{[id:number]:ECSEntity}, _root:ECSEntity, _size:number){
        this._id_to_bone = _id_to_bone;
        this._root = _root;
        this._size = _size;
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

    constructor(public skeleton:ECSEntity,
                public weights:number[][],
                public vertices:Vector[],
                public line_ids:Point[]){
        const skeleton_component = skeleton.get_component<SkeletonComponent>(ComponentType.Skeleton);
        this.reference_pose = [];
        for(let vid = 0; vid < vertices.length; vid++){
            this.reference_pose.push(new Vector3(vertices[vid], 1.0));
        }
        this.inverse_reference_pose = [];
        for(let id = 0; id < skeleton_component.length; id++){
            const bone_entity = skeleton_component.id_to_bone(id);
            const bone = bone_entity.get_component<BoneComponent>(ComponentType.Bone);
            this.inverse_reference_pose.push(bone.transform().inverse());
        }
    }

    update_animation(){
        const skeleton_component = this.skeleton.get_component<SkeletonComponent>(ComponentType.Skeleton);
        for(let vertex = 0; vertex < this.vertices.length; vertex++){
            this.vertices[vertex].timesEquals(0);
        }
        for(let bone_id = 0; bone_id < skeleton_component.length; bone_id++){
            const inverse = this.inverse_reference_pose[bone_id];
            const bone_entity = skeleton_component.id_to_bone(bone_id);
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

class SkeletonSystem implements System{
    static make_skeleton(offsets:Vector[], parents:number[]):SkeletonComponent{
        const id_to_bone:{[id:number]:ECSEntity} = {};

        const children:{[id:number]:number[]} = {};
        for(let id=0;id < parents.length;id++){
            if(!children[parents[id]])
                children[parents[id]] = [];
            children[parents[id]].push(id);
        }

        const root_id:number = children[-1][0];
        assert(children[-1].length == 1);

        const id_queue:number[] = [root_id];
        while(id_queue.length != 0){
            const id = id_queue.shift();
            const offset:Vector = offsets[id];
            let bone_component;
            if(id === root_id){
                bone_component = new BoneComponent(offset, id);
            }else{
                const parent:number = parents[id];
                const parent_entity:ECSEntity = id_to_bone[parent];
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
                bone_entity.add_component(new FixableEndpointComponent(endpoint.clone()));
            }
            id_to_bone[id] = bone_entity;

        }

        const root = id_to_bone[root_id];
        const size = parents.length;
        const skeleton_component = new SkeletonComponent(id_to_bone, root, size);
        return skeleton_component;
    }
    step(){
        
    }
}

class ModelReader{
    static async read(fn:string, add_to_manager:boolean=true):Promise<ECSEntity>{
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
        const skeleton_component = SkeletonSystem.make_skeleton(offsets, parents);
        const skeleton_entity = new ECSEntity();
        skeleton_entity.add_component(skeleton_component);

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

        const mesh_component = new MeshComponent(skeleton_entity, weights, vertices, lines);
        const mesh_entity = new ECSEntity();
        mesh_entity.add_component(mesh_component);

        if(add_to_manager){
            for(let bone_idx = 0; bone_idx < skeleton_component.length; bone_idx++){
                const bone = skeleton_component.id_to_bone(bone_idx);
                EntityManager.current.add_entity(bone);
            }

            EntityManager.current.add_entity(skeleton_entity);
            EntityManager.current.add_entity(mesh_entity);
        }

        return mesh_entity;
    }
}

class BoneSelectSystem implements System{
    static current_bone:ECSEntity;
    static current_endpoint:ECSEntity;

    static highlighted_bone():ECSEntity{
        const mouse = EntityManager.current.get_entities([ComponentType.MouseInput])[0];
        const mouse_info = mouse.get_component<MouseInputComponent>(ComponentType.MouseInput);
        const entities = EntityManager.current.get_entities([ComponentType.Skeleton]);

        for(let idx = 0; idx < entities.length; idx++){
            const entity = entities[idx];
            const skeleton = entity.get_component<SkeletonComponent>(ComponentType.Skeleton);
            const intersection:number = skeleton.get_bone_by_intersection(mouse_info.position, 10);
            if(intersection != -1)
                return skeleton.id_to_bone(intersection);
        }
        return undefined;
    }

    static highlighted_endpoint():ECSEntity{
        const mouse = EntityManager.current.get_entities([ComponentType.MouseInput])[0];
        const mouse_info = mouse.get_component<MouseInputComponent>(ComponentType.MouseInput);
        const entities = EntityManager.current.get_entities([ComponentType.Skeleton]);

        for(let idx = 0; idx < entities.length; idx++){
            const entity = entities[idx];
            const bone = entity.get_component<SkeletonComponent>(ComponentType.Skeleton);
            const intersection = bone.get_bone_by_endpoint_intersection(mouse_info.position, 20);
            if(intersection !== -1){
                return bone.id_to_bone(intersection);
            }
        }
        return undefined;
    }

    public step(){
        const mouse = EntityManager.current.get_entities([ComponentType.MouseInput])[0];
        const mouse_info = mouse.get_component<MouseInputComponent>(ComponentType.MouseInput);
        if(mouse_info.right && !mouse_info.left){
            if(BoneSelectSystem.current_endpoint === undefined){
                const highlighted_endpoint = BoneSelectSystem.highlighted_endpoint();
                if(highlighted_endpoint !== undefined &&
                    highlighted_endpoint.has_component(ComponentType.FixableEndpoint)){
                    const fixable_endpoint = highlighted_endpoint.get_component<FixableEndpointComponent>(ComponentType.FixableEndpoint);
                    const bone = highlighted_endpoint.get_component<BoneComponent>(ComponentType.Bone);
                    const endpoint = bone.endpoint();
                    fixable_endpoint.p = endpoint.clone();
                    fixable_endpoint.fixed = !fixable_endpoint.fixed;
                    BoneSelectSystem.current_endpoint = highlighted_endpoint;
                }
            }
        }
        if(mouse_info.left){
            if(BoneSelectSystem.current_endpoint === undefined){
                const highlighted_endpoint = BoneSelectSystem.highlighted_endpoint();
                if(highlighted_endpoint !== undefined){
                    BoneSelectSystem.current_endpoint = highlighted_endpoint;
                }else if(BoneSelectSystem.current_bone === undefined){
                    const highlighted = BoneSelectSystem.highlighted_bone();
                    if(highlighted !== undefined){
                        BoneSelectSystem.current_bone = highlighted;
                    }
                }else{
                    const bone = BoneSelectSystem.current_bone.get_component<BoneComponent>(ComponentType.Bone);
                    bone.rotate(mouse_info.dx/-100);
                }
            }else{
                const bone = BoneSelectSystem.current_endpoint.get_component<BoneComponent>(ComponentType.Bone);
                bone.move_endpoint(mouse_info.position);
            }
        }
        if(!mouse_info.left && !mouse_info.right){
            BoneSelectSystem.current_endpoint = undefined;
            BoneSelectSystem.current_bone = undefined;
        }
    }
}

