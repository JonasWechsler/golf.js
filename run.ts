const system_manager = new SystemManager(new EntityManager());
MouseInfo.setup();
DOMManager.make_canvas();

const settings_entity = new ECSEntity();
settings_entity.add_component(new SettingsComponent(8, 8, 4));
EntityManager.current.add_entity(settings_entity);


const data:{ [key:number]:() => GridCellComponent; } = {
    0: () => new GridCellComponent(0, true, undefined, "red"),
    1: () => new GridCellComponent(1, false, undefined, "orange"),
    2: () => new GridCellComponent(2, false, undefined, "yellow"),
    3: () => new GridCellComponent(3, false, undefined, "green"),
    4: () => new GridCellComponent(4, false, undefined, "blue"),
    5: () => new GridCellComponent(5, false, undefined, "indigo"),
    6: () => new GridCellComponent(6, false, undefined, "violet"),
    7: () => new GridCellComponent(7, false, undefined, "red0"),
    8: () => new GridCellComponent(8, false, undefined, "orange0"),
    9: () => new GridCellComponent(9, false, undefined, "yellow0"),
    10: () => new GridCellComponent(10, false, undefined, "green0"),
    11: () => new GridCellComponent(11, false, undefined, "blue0"),
    12: () => new GridCellComponent(12, false, undefined, "indigo0"),
    13: () => new GridCellComponent(13, false, undefined, "violet0")
};

const entity = new ECSEntity();
entity.add_component(new IDCellMapComponent(data));
EntityManager.current.add_entity(entity);

//load_tiles();
(function(){
    const colors = ["#ff0000", "#ffa500", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#8a2be2", "#006400"];
    for(let idx=0;idx<colors.length;idx++){
        const val = colors[idx];
        const color_ent = new ECSEntity();
        const color = new Color(val);
        console.log(color.to_str());
        const color_texture = new FloorTextureComponent(new SolidColorTexture(8, color).generate());
        color_ent.add_component(color_texture);
        EntityManager.current.add_entity(color_ent);
    }
})();

(function(){
    const ent = new ECSEntity();
    const view = new StaticRenderComponent(0, 0, document.createElement("canvas"), -2);
    view.content.width = view.content.height = 256*8;
    view.x = view.y = view.content.width/-2;
    const ctx = view.content.getContext("2d");
    const img = new SandTexture(512).generate();
    disableImageSmoothing(ctx);
    ctx.drawImage(img, 0, 0, view.content.width, view.content.height);
    ent.add_component(view);
    EntityManager.current.add_entity(ent);
})();

const DISCRETE_SCREENS = true;

let entity_inspector;
function joints(){
    const player_joint = new JointComponent(new Vector(60, 60));
    player.add_component(player_joint);

    const fixed_joint_entity = new ECSEntity();
    const fixed_joint = new JointComponent(new Vector(60, 60));
    fixed_joint_entity.add_component(fixed_joint);
    fixed_joint_entity.add_component(new DynamicRenderComponent(0, 0, document.createElement("canvas")));

    const fixed_connection_entity = new ECSEntity();
    const fixed_connection = new FixedConnectionComponent(player_joint, fixed_joint, new Vector(0, 0));
    fixed_connection_entity.add_component(fixed_connection);
    fixed_connection_entity.add_component(new DynamicRenderComponent(0, 0, document.createElement("canvas"), false));

    player_joint.adjacent_fixed.push(fixed_connection);
    fixed_joint.adjacent_fixed.push(fixed_connection);

    EntityManager.current.add_entity(fixed_joint_entity);
    EntityManager.current.add_entity(fixed_connection_entity);

    const joints_list:ECSEntity[] = [player, fixed_connection_entity];

    let last_j = player_joint;
    for(let i=1;i<6;i++){
        const e = new ECSEntity();
        const jc = new JointComponent(new Vector(player_joint.position.x, player_joint.position.y+i*3));
        e.add_component(jc);
        e.add_component(new DynamicRenderComponent(0, 0, document.createElement("canvas"), false));

        if(last_j){
            const connection_entity = new ECSEntity();
            const connection = new FlexibleConnectionComponent(jc, last_j, 3);
            jc.adjacent_flexible.push(connection);
            last_j.adjacent_flexible.push(connection);
            connection_entity.add_component(connection);
            connection_entity.add_component(new DynamicRenderComponent(0, 0, document.createElement("canvas"), false));
            EntityManager.current.add_entity(connection_entity);
            joints_list.push(connection_entity);
        }
        last_j = jc;
        EntityManager.current.add_entity(e);
    }

    entity_inspector = new ECSEntity();
    const entity_inspector_component = new EntityInspectorComponent(joints_list, () => player.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics).position);
    const entity_inspector_canvas = document.createElement("canvas");
    entity_inspector_canvas.width = entity_inspector_canvas.height = 100;
    const entity_inspector_ui = new UIComponent(DOMManager.canvas.width/2 - 400,
                                                DOMManager.canvas.height/2 - 400,
                                                entity_inspector_canvas, 800, 800);
    entity_inspector.add_component(entity_inspector_component);
    entity_inspector.add_component(entity_inspector_ui);
}

const player = new ECSEntity();
player.add_component(new DynamicPhysicsComponent(new Vector(60, 60), 3));
player.add_component(new KeyInputComponent());

const player_canvas = document.createElement("canvas");
player_canvas.width = player_canvas.height = 12;
player.add_component(new DynamicRenderComponent(0, 0, player_canvas));
player.add_component(new HealthComponent(90, 100));

if(!DISCRETE_SCREENS)
    joints();

EntityManager.current.add_entity(player);

function initiate(gg:TileGenerator){
    let id_water = -1;
    outer:for(let i=0;i<gg.TILES.tiles.length;i++){
        const arr = gg.TILES.tiles[i];
        for(let j=0;j<3;j++)
        for(let k=0;k<3;k++)
        if(arr.get(j, k) != 5)
            continue outer;
        id_water = i;
        break;
    }
    for(let i=0;i<gg.WIDTH;i++){
        gg.wave_set_tile(new Vector(i, 0), id_water);
        gg.wave_set_tile(new Vector(i, gg.HEIGHT-1), id_water);
    }
    for(let i=0;i<gg.HEIGHT;i++){
        gg.wave_set_tile(new Vector(0, i), id_water);
        gg.wave_set_tile(new Vector(gg.WIDTH-1, i), id_water);
    }
    let id_mountain = -1;
    outer:for(let i=0;i<gg.TILES.tiles.length;i++){
        const arr = gg.TILES.tiles[i];
        for(let j=0;j<3;j++)
        for(let k=0;k<3;k++)
        if(arr.get(j, k) != 6)
            continue outer;
        id_mountain = i;
        break;
    }
    console.log(id_mountain);
    gg.wave_set_tile(new Vector(10, 10), id_mountain);
    let id_cave = -1;
    outer:for(let i=0;i<gg.TILES.tiles.length;i++){
        const arr = gg.TILES.tiles[i];
        for(let j=0;j<3;j++)
        for(let k=0;k<3;k++)
        if(arr.get(j, k) != 4)
            continue outer;
        id_cave = i;
        break;
    }
    console.log(id_cave);
    gg.wave_set_tile(new Vector(30, 30), id_cave);
}

for(let i=0;ComponentType[i];i++)
    console.log(i, ComponentType[i]);
console.log(system_manager);

//WorldInfo.mesh = new NonintersectingFiniteGridNavigationMesh(20, 0, 500, 0, 500, WorldInfo.physics);
//const ai = new AI(new Vector(360, 360), 20, new Vector(0, 0));

load('./resources/grid.txt',function(result){
    WorldStateSystem.parse_entity_grid(result);
    on_complete();
},load_tiles);

function load_tiles(){
    const img = document.createElement("img");
    img.onload = () => {
        const tiles = new TileSet(img).TILES;
        console.log(tiles);
        const tile_grid = new TileGenerator(tiles,
                                    40,
                                    40,
                                    TileGeneratorMethod.WaveCollapse,
                                    parse_grids,
                                    () => 0,
                                    initiate, 5, 1);
    }
    
    img.crossOrigin = "Anonymous";
    img.src = "resources/tiles-reformatted.png";
}

function parse_grids(gg:TileGenerator){
    console.log("donezo");
    const tile_grid = gg.TILES;
    const tile_grid_entity = new ECSEntity();
    tile_grid_entity.add_component(new TileGridComponent(tile_grid));
    EntityManager.current.add_entity(tile_grid_entity);

    GridGeneratorSystem.generate_from_tile_grid();

    on_complete();
}

function on_complete(){
    GridParserSystem.parse_grids();

    (function(){
        const mesh_entity = new ECSEntity();
        const mesh = NavigationMeshSystem.make_navigation_mesh(44, 764, 115, 829);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = canvas.height = 500;
        mesh.vertices.forEach((v) => 
                              {
                                  mesh.adjacent_map.at(v).forEach((v0) => {
                                     ctx.moveTo(v.x - 44, v.y - 763);
                                     ctx.lineTo(v0.x - 44, v0.y - 763);
                                     ctx.stroke();
                                  });
                              });
        const vis_ent = new ECSEntity();
        player.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics).position = new Vector(44, 763);
        vis_ent.add_component(new StaticRenderComponent(44, 763, canvas, 5));
        EntityManager.current.add_entity(vis_ent);

        const ai = new ECSEntity();
        ai.add_component(new AIInputComponent(new Vector(44, 763)));
        ai.add_component(new DynamicPhysicsComponent(new Vector(44, 763), 3));
        const ai_canvas = document.createElement("canvas");
        ai_canvas.width = ai_canvas.height = 12;
        ai.add_component(new DynamicRenderComponent(0, 0, ai_canvas));
        ai.add_component(mesh);
        ai.add_component(new NavigationPathComponent());
        EntityManager.current.add_entity(ai);
    })();

    const camera = new ECSEntity();
    const ui_component = new UIComponent(0, 0, document.createElement("canvas"),
                                         DOMManager.canvas.width, DOMManager.canvas.height);
    const camera_component = new CameraComponent();
    if(DISCRETE_SCREENS){
        camera_component.target = () => player.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics).position.divided(CameraSystem.WIDTH).apply(Math.floor).times(CameraSystem.WIDTH).plus(CameraSystem.WIDTH/2);
    }else{
        camera_component.target = () => player.get_component<DynamicPhysicsComponent>(ComponentType.DynamicPhysics).position;
    }
    camera.add_component(camera_component);
    camera.add_component(ui_component);
    
    const fps = new ECSEntity();
    fps.add_component(new FPSComponent());
    fps.add_component(new UIComponent(0, 0, document.createElement("canvas")));

    system_manager.entity_manager.add_entity(camera);
    system_manager.entity_manager.add_entity(fps);
    if(entity_inspector)
        system_manager.entity_manager.add_entity(entity_inspector);
    system_manager.add(new KeySystem());
    system_manager.add(new ControlSystem());
    system_manager.add(new NavigationMeshSystem());
    system_manager.add(new AIMovementSystem());
    system_manager.add(new AIGuidanceSystem());
    system_manager.add(new StupidAISystem());
    system_manager.add(new PhysicsRenderSystem(false));
    system_manager.add(new JointMovementSystem());
    system_manager.add(new JointRenderSystem());
    system_manager.add(new HealthRenderingSystem());
    system_manager.add(new CameraSystem());
    system_manager.add(new UIRenderSystem());
    system_manager.add(new FPSSystem());
    system_manager.add(new EntityInspectorRenderSystem());
    system_manager.add(new PhysicsSystem());
    system_manager.start();
}
