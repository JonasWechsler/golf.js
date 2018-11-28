
function init_textures(){
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
}

function init_background(){
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
}

function init_player_joints(){
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

