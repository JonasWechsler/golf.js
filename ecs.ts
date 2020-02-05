enum ComponentType{
    DynamicPhysics,
    StaticPhysics,
    Projectile,
    Timer,
    DynamicRender,
    StaticRender,
    UI,
    Camera,
    FPS,
    EntityInspector,
    KeyInput,
    MouseInput,
    WorldCell,
    Dungeon,
    FloorTexture,
    Joint,
    FlexibleConnection,
    FixedConnection,
    CellPosition,
    EntityGrid,
    GridCell,
    TileGrid,
    IDCellMap,
    Settings,
    SaveOmit,
    WorldState,
    AIInput,
    NavigationMesh,
    Health,
    NavigationPath,
    Bone,
    FixableEndpoint,
    Skeleton,
    Mesh,
    Inventory,
    GrapplingHook,
    InventoryState,
    ProjectileLauncher,
    Animation
}

class ECSEntity{
    private components:Component[];
    private component_types:{ [key:number]:any };
    
    constructor(components:Component[] = []){
        this.components = [];
        this.component_types = {};
        components.forEach((c) => this.add_component(c));
    }

    public add_component(c:Component):void{
        if(this.component_types[c.type]){
            throw "Already have component of type " + c.type;
        }
        this.component_types[c.type] = c;
        this.components.push(c);
    }
    public has_component(type:ComponentType):boolean{
        return this.component_types[type]?true:false;
    }
    public get_component<Class>(type):Class{
        return <Class> this.component_types[type];
    }
    public get_components():Component[]{
        return this.components;
    }
}

interface Component{
    type:ComponentType;
}

interface System{
    step:(e:EntityManager)=>void;
}

class EntityManager{
    private entities:NumberTreeMap<ECSEntity[]> = new NumberTreeMap<ECSEntity[]>();
    public static current:EntityManager;
    constructor(set_current:boolean = true){
        if(set_current){
            EntityManager.current = this;
        }
    }
    public add_entity(e:ECSEntity):void{
        const types = [];
        e.get_components().forEach((c) => types.push(c.type));
        combinations(types).forEach(
            (arr) => {
                const entry = this.entities.get(arr);
                if(entry){
                    entry.push(e);
                }else{
                    this.entities.insert(arr, [e]);
                }
            }
        );
    }
    public has_entity(e:ECSEntity):boolean{
        const types = [];
        e.get_components().forEach((c) => types.push(c.type));
        let has = false;
        combinations(types).forEach(
            (arr) => {
                const entry = this.entities.get(arr);
                const idx = entry.indexOf(e);
                if(has) assert(idx != -1);
                has = has || (idx != -1);
            }
        );
        return has;
    }
    public remove_entity(e:ECSEntity):void{
        assert(this.has_entity(e));
        const types = [];
        e.get_components().forEach((c) => types.push(c.type));
        combinations(types).forEach(
            (arr) => {
                const entry = this.entities.get(arr);
                const idx = entry.indexOf(e);
                assert(idx != -1);
                entry.splice(idx, 1);
            }
        );
        assert(!this.has_entity(e));
    }
    public get_entities(types:ComponentType[]):ECSEntity[]{
        const entities = this.entities.get(types);
        if(entities == undefined){
            return [];
        }
        return entities;
    }
    public has_entities(types:ComponentType[]):boolean{
        return this.entities.get(types)?true:false;
    }
}

class SystemManager{
    private systems:System[] = [];
    private static frames:number = 0;
    public static current:SystemManager;
    constructor(public entity_manager:EntityManager){
        SystemManager.current = this;
    }

    add(system:System){
        this.systems.push(system);
    }

    static frame_time():number{
        return SystemManager.frames;
    }

    static frame(self:SystemManager){
        SystemManager.frames++;
        self.systems.forEach((system) => {
            system.step(self.entity_manager);
        });
        window.requestAnimationFrame(() => SystemManager.frame(self));
    }

    start(){
        window.requestAnimationFrame(() => SystemManager.frame(this));
    }
}
