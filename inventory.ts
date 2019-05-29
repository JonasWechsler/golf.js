class InventoryComponent implements Component{
    type:ComponentType = ComponentType.Inventory;
    items:ECSEntity[] = [];
    equipped:number = 0;
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
    constructor(public max_cooldown:number = 5){}
    start_cooldown(){
        this.cooldown = this.max_cooldown;
        this.state = InventoryState.Cooldown;
    }
}

class InventoryControlSystem implements System{
    private static inventoryControl(entity:ECSEntity){
        const inventory = entity.get_component<InventoryComponent>(ComponentType.Inventory);
        const input = entity.get_component<KeyInputComponent>(ComponentType.KeyInput);
        const equipped = inventory.items[inventory.equipped];
        const equipped_state = equipped.get_component<InventoryStateComponent>(ComponentType.InventoryState);
        if(equipped_state.cooldown <= 0 && input.next_item){
            equipped_state.state = InventoryState.Unequipped;
            inventory.equipped = (inventory.equipped + 1)%inventory.items.length;
            const new_equipped = inventory.items[inventory.equipped];
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
            if(item.cooldown == 0){
                item.state = InventoryState.Equipped;
            }
        });
    }
}
