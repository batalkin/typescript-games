/// <reference path="game-common.ts"/>

class SnakeGame extends CanvasGame {

    ctx:CanvasRenderingContext2D;
    stone:Point[];
    body:Point[];
    size:number = 20;
    score:number = 0;
    initialBodyLength = 4;
    timerToken:number;
    targetTimerToken:number;
    dx:number;
    dy:number;
    targetDx:number = 0;
    targetDy:number = 0;

    target:Point = undefined;
    targetDouble:Point = undefined;

    isEmpty(p:Point):Boolean {
        if (p.x < 0 || p.y < 0 || p.x >= this.size || p.y >= this.size) {
            return false;
        }
        for (var x in this.body) {
            if (p.equals(this.body[x]))
                return false;
        }
        for (var x in this.stone) {
            if (p.equals(this.stone[x]))
                return false;
        }
        if (this.target && this.target.equals(p)) {
            return false;
        }
        return true;
    }

    start() {
        super.start()
        this.ctx = this.canvas.getContext("2d");

        this.body = new Array(0);
        for (var i = 0; i < this.initialBodyLength; i++) {
            this.body.push(new Point(this.size / 2, this.size - i - 1));
        }

        this.stone = new Array(0);
        for (var i = 0; i < 10; i++) {
            this.stone.push(this.findFreeRandomCell());
        }

        this.targetDouble = this.findFreeRandomCell();

        this.renderLevel();
        this.dx = -10;
        this.dy = -10;
        this.targetDx = 0.5;
        this.targetDy = 0.2;

        this.score = 0;
        this.printScore();

        this.timerToken = setInterval(this.doStep.bind(this), 100);
        this.targetTimerToken = setInterval(this.blinkTarget.bind(this), 10);

        document.body.addEventListener("keydown", this.onkeypress.bind(this));
    }

    blinkTarget() {
        if(this.target) {
            var targetColor = "black";
            if(Math.random() > 0.7) {
                var targetColor = "#EEE";
            }
            this.fillPixel(this.target, this.ctx, targetColor);
        }
        var headColor = "black";
        if(Math.random() > 0.9) {
            var headColor = "#EEE";
        }
        this.fillPixel(this.body[this.body.length - 1], this.ctx, headColor);
    }

    stop() {
        document.body.removeEventListener("keydown", this.onkeypress.bind(this));
        clearInterval(this.timerToken);
        clearInterval(this.targetTimerToken);
        this.container.removeChild(this.canvas);
    }

    doStep() {
        if (this.dx == -10 && this.dy == -10) {
            return;
        }
        var head:Point = this.body[this.body.length - 1];

        var newHead:Point = head.move(this.dx, this.dy);
        if (!this.isEmpty(newHead)) {
            if (this.target && this.target.equals(newHead)) {
                this.target = this.findFreeRandomCell();
                this.score++;
                this.printScore();
            } else {
                alert("Gave over");
                this.stop();
                this.start();
                return;
            }
        } else {
            this.body.shift();
        }
        this.body.push(newHead);

        this.targetDouble = this.targetDouble.move(this.targetDx, this.targetDy);
        this.targetDouble.x = this.targetDouble.x > this.size?0:this.targetDouble.x;
        this.targetDouble.y = this.targetDouble.y > this.size?0:this.targetDouble.y;
        this.targetDouble = this.targetDouble.move(0.5, 0.5);
        this.target = new Point( parseInt(this.targetDouble.x + "", 10), parseInt(this.targetDouble.y + "", 10));
        this.renderLevel();
    }

    printScore() {
        document.getElementById("score").innerText = "" + this.score;
    }

    findFreeRandomCell():Point {
        var newPoint:Point = Point.randomPoint(this.size, this.size);
        while (!this.isEmpty(newPoint)) {
            newPoint = Point.randomPoint(this.size, this.size);
        }
        return newPoint;
    }

    onkeypress(e:KeyboardEvent) {
        switch (e.keyCode) {
            case 37:
                this.checkAndSetDirection(-1, 0);
                break;// LEFT
            case 38:
                this.checkAndSetDirection(0, -1);
                break;// UP
            case 39:
                this.checkAndSetDirection(1, 0);
                break;// RIGHT
            case 40:
                this.checkAndSetDirection(0, 1);
                break;// DOWN
        }
    }

    checkAndSetDirection(dx:number, dy:number) {

        var head:Point = this.body[this.body.length - 1];
        var second:Point = this.body[this.body.length - 2];

        if (second.x - head.x == dx && second.y - head.y == dy) {
            return; // Cant change direction to second point
        }
        this.dx = dx;
        this.dy = dy;
    }

    private renderLevel() {
        var ctx:CanvasRenderingContext2D = this.ctx;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for(var x = 0;x < this.size; x++) {
            for(var y = 0;y < this.size; y++) {
                this.fillPixel(new Point(x, y), ctx, "#EEE");
            }
        }

        for (var k = 0; k < this.stone.length; k++) {
            this.fillPixel(this.stone[k], ctx, "black");
        }

        for (var k = 0; k < this.body.length; k++) {
            this.fillPixel(this.body[k], ctx, "black");
        }

        if (this.target) {
            this.fillPixel(this.target, ctx, "black");
        }

    }

    fillPixel(point:Point, ctx:CanvasRenderingContext2D, color) {
        var d:number = this.canvas.width / this.size;
        var p:number = 1;
        ctx.fillStyle = color;
        ctx.fillRect(point.x * this.canvas.width / this.size + p, point.y * this.canvas.height / this.size + p, this.canvas.width / this.size - 2*p, this.canvas.height / this.size - 2*p);
        ctx.fillStyle = "white";
        p = 3;
        ctx.fillRect(point.x * this.canvas.width / this.size + p, point.y * this.canvas.height / this.size + p, this.canvas.width / this.size - 2*p, this.canvas.height / this.size - 2*p);
        ctx.fillStyle = color;
        p = 5;
        ctx.fillRect(point.x * this.canvas.width / this.size + p, point.y * this.canvas.height / this.size + p, this.canvas.width / this.size - 2*p, this.canvas.height / this.size - 2*p);
    }

}