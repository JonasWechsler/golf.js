class AbstractItem {
    canvas : HTMLCanvasElement;
    context : CanvasRenderingContext2D;
    ID : number = 0;

    constructor(){
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.width = 32;
        this.canvas.height = 32;
        this.context.fillStyle = "#ccc";
       this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
       this.context.fillStyle = "#222";
       this.context.font = "10px Georgia";

       let instance: any = this.constructor;
       this.context.fillText(instance.name, 0, this.canvas.height/2);
    }

    drop(){
        this.deselect();
        Inventory.current().drop(this);
    }

    select(){}
    deselect(){}
    use(){}
    icon() : HTMLCanvasElement{
        return this.canvas;
    }
}

class AbstractExpendable extends AbstractItem {
    count : number = 1;

    constructor(count : number){
        super();
        this.count = count;
    }

    pick_up(count : number){
        this.count += count;
    }

    use(){
        this.count--;
        if(this.count <= 0){
            this.drop();
        }
    }
}

class Inventory implements RenderObject{
    private items : AbstractItem[] = [];
    private current : number = 0;
    MAX_SIZE : number = 10;

    static current() : Inventory{
        return undefined;
    }

    constructor(){
        for(let i = 0; i < this.MAX_SIZE; i++){
            this.items.push(new AbstractItem());
        }
    }

    select(current : number){
        if(current < 0 || current >= this.MAX_SIZE){
            throw "Input Mismatch Exception"
        }

        this.items[this.current].deselect();
        this.current = current;
        this.items[this.current].select();
    }

    use(){
        this.items[this.current].use();
    }

    add(item : AbstractItem){
        for(let idx = 0; idx < this.MAX_SIZE; idx++){
            if(this.items[idx].ID == item.ID
               && this.items[idx] instanceof AbstractExpendable
               && item instanceof AbstractExpendable){
                const inventory : AbstractExpendable = <AbstractExpendable> this.items[idx];
                const addition : AbstractExpendable = <AbstractExpendable> item;
                inventory.pick_up(addition.count);
                return;
            }

            if(this.items[idx].ID == 0){
                this.items[idx] = item;
                this.items[this.current].select();
                return;
            }
        }
        throw "Inventory Full Exception";
    }

    drop(dropped : AbstractItem){
        const self = this;
        this.items.forEach(function(item, idx){
            if(item == dropped){
                self.items[idx] = new AbstractItem();
            }
        });
    }

    draw(context: CanvasRenderingContext2D){
        const margin = 4;
        const width = 32;
        const self = this;

        disableImageSmoothing(context);
        this.items.forEach(function(item: AbstractItem, idx: number){
            const x = idx * (width + margin*2) + margin*2;
            const y = margin*2;
            const img = item.icon();
            if(idx == self.current){
                context.fillStyle = "orange";
                context.fillRect(x - margin, y - margin,
                                 width + 2*margin, width + 2*margin);
            }
            context.drawImage(img, 0, 0,
                              img.width, img.height,
                              x, y,
                              32, 32);
        });
        enableImageSmoothing(context);
    }
}

