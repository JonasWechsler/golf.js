const system_manager = new SystemManager(new EntityManager());
MouseInfo.setup();
DOMManager.make_canvas();

const settings_entity = new ECSEntity();
settings_entity.add_component(new SettingsComponent(8, 8, 4, true));
EntityManager.current.add_entity(settings_entity);

GolfInit.init_all();
