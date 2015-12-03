/// <reference path="game-common.ts"/>

class Point {
    x:number = 0;
    y:number = 0;

    constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
    }

    public equals(p:Point) {
        return this.x == p.x && this.y == p.y;
    }

    public move(dx:number, dy:number):Point {
        return new Point(this.x + dx, this.y + dy);
    }

    static randomPoint(maxX:number, maxY:number):Point {
        var x = Math.round(Math.random() * (maxX - 1));
        var y = Math.round(Math.random() * (maxY - 1));
        return new Point(x, y);
    }
}

class SnakeGame extends CanvasGame {

    ctx:CanvasRenderingContext2D;
    stone:Point[];
    body:Point[];
    size:number = 20;
    initialBodyLength = 4;
    timerToken:number;
    dx:number;
    dy:number;
    target:Point = undefined;

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

        this.target = this.findFreeRandomCell();

        this.renderLevel();
        this.dx = -10;
        this.dy = -10;
        this.timerToken = setInterval(this.doStep.bind(this), 100);

        document.body.addEventListener("keydown", this.onkeypress.bind(this));
    }

    stop() {
        document.body.removeEventListener("keydown", this.onkeypress.bind(this));
        clearInterval(this.timerToken);
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
                console.log("Target hit");
            } else {
                this.stop();
                alert("Gave over");
                this.start();
                return;
            }
        } else {
            this.body.shift();
        }
        this.body.push(newHead);
        this.renderLevel();
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
        if (this.dx == 0 && dx == 0 || this.dy == 0 && dy == 0) {
            return; // Cant change direction to reverse
        }
        this.dx = dx;
        this.dy = dy;

    }

    private renderLevel() {
        var ctx:CanvasRenderingContext2D = this.ctx;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "green";
        for (var k = 0; k < this.stone.length; k++) {
            this.fillPixel(this.stone[k], ctx);
        }

        ctx.fillStyle = "red";
        for (var k = 0; k < this.body.length; k++) {
            this.fillPixel(this.body[k], ctx);
        }
        ctx.fillStyle = "gray";
        this.fillPixel(this.body[this.body.length - 1], ctx);

        if (this.target) {
            ctx.fillStyle = "yellow";
            this.fillPixel(this.target, ctx);
        }

    }

    fillPixel(point:Point, ctx:CanvasRenderingContext2D) {
        var d:number = this.canvas.width / this.size;
        ctx.fillRect(point.x * this.canvas.width / this.size, point.y * this.canvas.height / this.size, this.canvas.width / this.size, this.canvas.height / this.size);
    }

}