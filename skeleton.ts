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
        console.log(children);

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
            EntityManager.current.add_entity(bone_entity);
            this._id_to_bone[id] = bone_entity;

            if(children[id]){
                for(let idx = 0; idx < children[id].length; idx++){
                    id_queue.push(children[id][idx]);
                }
            }
        }

        this._root = this._id_to_bone[root];
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
}

class ModelReader{
    static async read(fn:string){
        const ss = new StringStream();
        await ss.read_async(fn);

        const bones = ss.int();
        const vertices = ss.int();

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
    }
}
