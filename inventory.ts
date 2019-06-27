class InventoryComponent implements Component{
    type:ComponentType = ComponentType.Inventory;
    private items:ECSEntity[] = [];
    constructor(private owner:ECSEntity, items:ECSEntity[] = [], public equipped:number = 0){
        for(let idx = 0; idx < items.length; idx++){
            this.add_item(items[idx], idx);
        }
    }
    private add_item(item:ECSEntity, idx:number){
        assert(item.has_component(ComponentType.InventoryState));
        const state = item.get_component<InventoryStateComponent>(ComponentType.InventoryState);
        state.owner = this.owner;
        this.items[idx] = item;
    }
    public get_item(idx:number):ECSEntity{
        return this.items[idx];
    }
    public remove_item(idx:number):ECSEntity{
        const item = this.items[idx];
        const state = item.get_component<InventoryStateComponent>(ComponentType.InventoryState);
        state.owner = undefined;
        this.items[idx] = undefined;
        return item;
    }
    public set_item(item:ECSEntity, idx:number):ECSEntity{
        const old = this.remove_item(idx);
        this.add_item(item, idx);
        return old;
    }
    public capacity():number{
        return this.items.length;
    }
}

enum InventoryState{
    Equipped,
    JustUsed,
    Cooldown,
    Unequipped
}

class InventoryStateComponent{
    type:ComponentType = ComponentType.InventoryState;
    public state:InventoryState;
    public cooldown:number = 0;
    public owner:ECSEntity = undefined;
    constructor(public max_cooldown:number = 5){}

    start_cooldown(){
        this.cooldown = this.max_cooldown;
        this.state = InventoryState.Cooldown;
    }
    to_string():string{
        const state = this.state == InventoryState.Equipped?"Eqipped":
            this.state == InventoryState.JustUsed?"Just Used":
            this.state == InventoryState.Cooldown?"Cooldown":
            "Uneqipped";
       return state + " " + this.cooldown + "/" + this.max_cooldown;
    }
}

class InventoryControlSystem implements System{
    private static inventoryControl(entity:ECSEntity){
        const inventory = entity.get_component<InventoryComponent>(ComponentType.Inventory);
        const input = entity.get_component<KeyInputComponent>(ComponentType.KeyInput);
        const equipped = inventory.get_item(inventory.equipped);
        const equipped_state = equipped.get_component<InventoryStateComponent>(ComponentType.InventoryState);
        if(equipped_state.cooldown <= 0 && input.just_next_item){
            equipped_state.state = InventoryState.Unequipped;
            inventory.equipped = (inventory.equipped + 1)%inventory.capacity();
            const new_equipped = inventory.get_item(inventory.equipped);
            const new_equipped_state =equipped.get_component<InventoryStateComponent>(ComponentType.InventoryState);
            new_equipped_state.start_cooldown();
        }
    }
    private static inventoryItemControl(entity:ECSEntity){
        const state = entity.get_component<InventoryStateComponent>(ComponentType.InventoryState);
        const input = entity.get_component<KeyInputComponent>(ComponentType.KeyInput);
        if(state.state == InventoryState.Equipped && input.use){
            state.state = InventoryState.JustUsed;
        }
    }

    step(){
        const inventories = EntityManager.current.get_entities([ComponentType.Inventory,
            ComponentType.KeyInput]);
        inventories.forEach((entity) => InventoryControlSystem.inventoryControl(entity));

        const items = EntityManager.current.get_entities([ComponentType.InventoryState,
            ComponentType.KeyInput]);
        items.forEach((entity) => InventoryControlSystem.inventoryItemControl(entity));
    }
}

class InventoryTimerSystem implements System{
    step(){
        const items = EntityManager.current.get_entities([ComponentType.InventoryState]);
        items.forEach((entity) => {
            const item = entity.get_component<InventoryStateComponent>(ComponentType.InventoryState);
            item.cooldown = Math.max(0,item.cooldown - 1);
            if(item.state == InventoryState.Cooldown && item.cooldown == 0){
                item.state = InventoryState.Equipped;
            }
        });
    }
}

class InventoryRenderSystem implements System{
    step(){
        const entities = EntityManager.current.get_entities([ComponentType.UI, ComponentType.Inventory]);
        entities.forEach((entity) => {
            const ui = entity.get_component<UIComponent>(ComponentType.UI);
            const inv = entity.get_component<InventoryComponent>(ComponentType.Inventory);
            ui.width = ui.content.width = 500;
            ui.height = ui.content.height = 20;
            const ctx = ui.content.getContext("2d");
            const item = inv.get_item(inv.equipped);
            ctx.fillText(item.get_component<InventoryStateComponent>(ComponentType.InventoryState).to_string(),0,20);
        });
    }
}
