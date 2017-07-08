class Camera implements RenderObject{
    static current : Camera = null;
    canvas : HTMLCanvasElement;
    context : CanvasRenderingContext2D;

    private objects : RenderObject[] = [];
    private target : ()=>Vector;

    constructor(width:number, height:number){
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');

        Camera.current = this;
    }

    public camera_info() : Square {
        const width = DOMManager.canvas.width;
        const height = DOMManager.canvas.height;

        let left, top;
        if(this.target){
            left = this.target().x - width/2;
            top = this.target().y - height/2;
        }else{
            const left_norm = (width - MouseInfo.x()) / width;
            const top_norm = MouseInfo.y() / height;

            const shift_width = this.canvas.width - width;
            const shift_height = this.canvas.height - height;

            left = left_norm * shift_width;
            top = top_norm * shift_height;
        }

        return new Square(left, top, width, height);
    }

    follow(fn:()=>Vector){
        this.target = fn;
    }

    add_render_object(object : RenderObject){
        this.objects.push(object);
    }

    screen_to_camera(x : number, y : number) : Vector {
        const info = this.camera_info();
        return new Vector(
            (x / DOMManager.canvas.width) * info.width + info.left,
            (y / DOMManager.canvas.height) * info.height + info.top
        );
    }

    draw(context: CanvasRenderingContext2D){
        const self = this;
        const info = this.camera_info();

        self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
        self.context.translate(-info.left, -info.top);
        this.objects.forEach(function(object: RenderObject){
            object.draw(self.context);
        });
        self.context.translate(info.left, info.top);

        context.drawImage(this.canvas,
                          0, 0,
                         info.width, info.height,
                         0, 0,
                         info.width, info.height);
    }
}


