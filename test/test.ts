function test_cache(){
    const texture = document.createElement("canvas");
    texture.width = texture.height = 1024;
    const ctx = texture.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 1024, 1024);
    let r=0,g=0,b=0;
    for(let x=0;x<150;x++){
        for(let y=0;y<150;y++){
            r = (r+23)%255;
            g = (g+31)%255;
            b = (b+73)%255;
            ctx.fillStyle="rgba(" + r + "," + g + "," + b + "," + .5 + ")";
            ctx.fillRect(x*13, y*13, 17, 17);
        }
    }
    document.body.appendChild(texture);
    const cache = new CanvasCache();
    cache.draw_image(texture, new Vector(-512, -512));
    ctx.drawImage(cache.get_image(new Square(-256,-256, 512, 512)), 0, 0, 1024, 1024);
}
