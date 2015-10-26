function WorldBuilder(){

}
WorldBuilder.Screen = function(){

}
WorldBuilder.PerlinGenerator = function(height) {
    var heights = {
        '-1': height / 2,
        '0': height / 2,
        '1': height / 2
    };

    var x = 0;
    var max_x = -1;
    var min_x = 1;

    var perlin_resolution = 15;
    var left_perlin_subgraph = [];
    var right_perlin_subgraph = [];
    var perlin_smoothness = .9965; //0<smooth<1

    var seed = new Date().getTime();

    this.setSeed = function(s){
        seed = s;
    }

    var random = function() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    var generate_perlin_at = function(x) {
        var active_subgraphs = [];
        var last_y = 0;
        if (x < min_x) {
            min_x = x;
            last_y = heights[x + 1];
            active_subgraphs = left_perlin_subgraph;
        } else if (x > max_x) {
            max_x = x;
            last_y = heights[x - 1];
            active_subgraphs = right_perlin_subgraph;
        } else {
            return heights[x];
        }

        var new_point = false;

        for (var idx = 1; idx < perlin_resolution; idx++) {
            var frequency = Math.pow(2, idx),
                wavelength = Math.floor(200 / frequency);

            if (x % wavelength == 0) {
                var persistance = 1 / 2,
                    amplitude = Math.pow(persistance, idx) * height;
                active_subgraphs[idx] = amplitude * random();
                new_point = true;
            }
        }

        var y = 0;
        if (new_point) {
            active_subgraphs.forEach(function(val) {
                if (val)
                    y += val;
            });
            y = last_y * perlin_smoothness + y * (1 - perlin_smoothness);
        } else {
            y = last_y;
        }

        heights[x] = y;
        return y;
    }

    this.getHeightAt = function(x) {
        return generate_perlin_at(x);
    }
}
WorldBuilder.Build1 = function(physics) {
    physics.setAcceleration(function(x, y) {
        //return new Vector(-1*(x-canvas.width/2),-1*(y-canvas.width/2)).divided(1000);
        return new Vector(0, .02);
    });

    var sounds = [];

    var playSound = function(sound, vol) {
        if (!sounds[sound]) {
            sounds[sound] = new Audio('sounds/' + sound);
        }
        sounds[sound].volume = vol;
        sounds[sound].play();
    }

    var build = function() {
        physics.clearAll();
        var stat = function(x0, y0, x1, y1) {
            physics.addStatic(new Physics.LineSegment(new Vector(x0, y0), new Vector(x1, y1)));
        }
        var lastStroke = new Vector(0, 0);
        var moveTo = function(x, y) {
            lastStroke = new Vector(x, y);
        }
        var strokeTo = function(x, y) {
            var vec = new Vector(x, y);
            physics.addStatic(new Physics.LineSegment(lastStroke, vec));
            lastStroke = vec;
        }
        var glass = new Physics.Material(0, "black", function(vol) {
            if (vol < .05) vol *= vol;
            vol = Math.min(vol, 1);
            var sounds = ["Percussive Elements-06.wav",
                    "Percussive Elements-04.wav",
                    "Percussive Elements-05.wav"
                ],
                i = Math.floor(Math.random() * sounds.length);
            playSound(sounds[i], vol);
        });
        physics.setMaterial(glass);

        var world = new WorldBuilder.PerlinGenerator(1080);

        moveTo(0, 0);
        for (var x = 0; x < 1280; x++) {
            strokeTo(x, 1080 - world.getHeightAt(x));
        }
        strokeTo(1280 - 1, 0);

        physics.addDynamic(new Physics.DynamicBall(new Vector(413, 370), 10, new Vector(0, 0)));
    }

    build();
}