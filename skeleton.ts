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
            const parent:number = parents[id];
            const parent_entity:ECSEntity = this._id_to_bone[parent];
            const parent_bone = parent_entity.get_component<BoneComponent>(ComponentType.Bone);
            const bone_component = new BoneComponent(offset, parent_bone, id);
            const bone_entity = new ECSEntity();
            bone_entity.add_component(bone_component);
            this._id_to_bone[id] = bone_entity;

            for(let idx = 0; idx < children[id].length; idx++){
                id_queue.push(children[id][idx]);
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
