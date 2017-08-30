enum ComponentType{
    DynamicPhysics,
    StaticPhysics,
    FixedPhysics,
    Timer,
    Health,
    Render,
    UI,
    Camera,
    FPS
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
    public get_entities(types:ComponentType[]){
        return this.entities.get(types);
    }
}

class SystemManager{
    private systems:System[] = [];
    constructor(public entity_manager:EntityManager){}

    add(system:System){
        this.systems.push(system);
    }

    start(){
        const self = this;
        let finished = true;
        setInterval(() => {
            if(!finished) return;
            self.systems.forEach((system) => {
                system.step(self.entity_manager);
            });
            finished = true;
        }, 1);
    }
}
