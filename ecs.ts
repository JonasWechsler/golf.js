enum ComponentType{
    DynamicPhysics,
    StaticPhysics,
    Projectile,
    Timer,
    Health,
    DynamicRender,
    StaticRender,
    UI,
    Camera,
    FPS,
    EntityInspector,
    KeyInput,
    WorldCell,
    Dungeon,
    FloorTexture,
    Joint,
    FlexibleConnection,
    FixedConnection,
    CellPosition,
    EntityGrid,
    GridCell
}

class HealthComponent implements Component{
    type:ComponentType = ComponentType.Health;
    constructor(public amount:number){}
}

class ECSEntity{
    private components:Component[];
    private component_types:{ [key:number]:any };
    
    constructor(){
        this.components = [];
        this.component_types = {};
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
    constructor(){
        EntityManager.current = this;
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
    public remove_entity(e:ECSEntity):void{
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
    }
    public get_entities(types:ComponentType[]){
        return this.entities.get(types);
    }
    public has_entities(types:ComponentType[]){
        return this.entities.get(types)?true:false;
    }
}

class SystemManager{
    private systems:System[] = [];
    constructor(public entity_manager:EntityManager){}

    add(system:System){
        this.systems.push(system);
    }

    static frame(self:SystemManager){
        self.systems.forEach((system) => {
            system.step(self.entity_manager);
        });
        window.requestAnimationFrame(() => SystemManager.frame(self));
    }

    start(){
        window.requestAnimationFrame(() => SystemManager.frame(this));
    }
}
