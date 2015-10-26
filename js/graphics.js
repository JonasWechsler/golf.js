function Graphics() {
}
Graphics.Plant = function () {
    var iterations = 5, diam = Math.random() * 1 + 1, len = (Math.random() * (screen.height / (iterations + 1)) + screen.height / (iterations + 1)) / 2, diam_coef = Math.random() * .5 + .5, len_coef = Math.random() * .7 + .3, branches = Math.random() * 2 + 3, twig_chance = Math.random() * .5 + .5, max_angle = Math.random() * Math.PI / 2;
    this.setIterations = function (p) {
        iterations = p;
        return this;
    };
    this.setDiameter = function (p) {
        diam = p;
        return this;
    };
    this.setLength = function (p) {
        len = p;
        return this;
    };
    this.setDiameterCoefficient = function (p) {
        diam_coef = p;
        return this;
    };
    this.setLengthCoefficient = function (p) {
        len_coef = p;
        return this;
    };
    this.setBranches = function (p) {
        branches = p;
        return this;
    };
    this.setTwigChance = function (p) {
        twig_chance = p;
        return this;
    };
    this.setMaxAngle = function (p) {
        max_angle = p;
        return this;
    };
    this.generate = function (x0, y0, ctx) {
        var bases_x = [x0], bases_y = [y0], angles = [3 * Math.PI / 2];
        var len_initial = len;
        var diam_initial = diam;
        for (var i = 0; i < iterations; i++) {
            ctx.lineWidth = diam_initial;
            var new_bases_x = [], new_bases_y = [], new_angles = [];
            for (var a = 0; a < bases_x.length; a++) {
                for (var b = 0; b < branches; b++) {
                    if (Math.random() > twig_chance) {
                        continue;
                    }
                    var angle = (b / branches) * max_angle + Math.random() - .5, angle_adjusted0 = angles[a] + angle + Math.random() - .5, angle_adjusted1 = angles[a] - angle + Math.random() - .5;
                    ctx.beginPath();
                    ctx.moveTo(bases_x[a], bases_y[a]);
                    ctx.lineTo(bases_x[a] + Math.cos(angle_adjusted0) * len_initial, bases_y[a] + Math.sin(angle_adjusted0) * len_initial);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(bases_x[a], bases_y[a]);
                    ctx.lineTo(bases_x[a] + Math.cos(angle_adjusted1) * len_initial, bases_y[a] + Math.sin(angle_adjusted1) * len_initial);
                    ctx.stroke();
                    new_bases_x.push(bases_x[a] + Math.cos(angle_adjusted0) * len_initial);
                    new_bases_y.push(bases_y[a] + Math.sin(angle_adjusted0) * len_initial);
                    new_angles.push(angle_adjusted0);
                    new_bases_x.push(bases_x[a] + Math.cos(angle_adjusted1) * len_initial);
                    new_bases_y.push(bases_y[a] + Math.sin(angle_adjusted1) * len_initial);
                    new_angles.push(angle_adjusted1);
                }
            }
            bases_x = new_bases_x;
            bases_y = new_bases_y;
            angles = new_angles;
            diam_initial *= diam_coef;
            len_initial *= len_coef;
        }
    };
};
